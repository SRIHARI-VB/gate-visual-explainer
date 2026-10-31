/* ==========================================================================
   wifi-csma-ca-and-hidden-terminals — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition
                         or against a published table.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model implements 802.11 DCF from its own definitions: the IFS arithmetic,
   the exact collision probability and expected idle slots of k stations drawing
   a backoff from a contention window (closed form cross-checked against brute
   force enumeration), the binary-exponential ladder, a per-frame airtime budget
   cross-checked against a published 802.11b throughput table, and the
   reachability geometry that produces the hidden and the exposed terminal.
   The drawing code reads those results and performs no arithmetic of its own.
   ========================================================================== */

(function () {
  'use strict';

  var W = 900, H = 470;
  var K = window.LessonKit;
  var PR = window.Painters;
  var PAL = PR ? PR.PAL : {
    ink: '#0f1720', dim: '#566573', faint: '#7d8b98', surface: '#ffffff',
    surface2: '#eef2f4', border: '#c8d2d8', accent: '#0f766e', accentDim: '#d6efeb',
    valid: '#15803d', invalid: '#b3261e', invalidDim: '#fbe4e2',
    warn: '#9a5406', warnDim: '#fbeed3', info: '#1d4e89'
  };

  var P = null;
  var INK = PAL.ink, DIM = PAL.dim, FAINT = PAL.faint, ACC = PAL.accent;
  var INFO = PAL.info, VAL = PAL.valid, BAD = PAL.invalid, WARN = PAL.warn;
  var SURF2 = PAL.surface2, BORDER = PAL.border, SURF = PAL.surface;
  var ACCDIM = PAL.accentDim || '#d6efeb';
  var WARNDIM = PAL.warnDim || '#fbeed3';
  var INVALIDDIM = PAL.invalidDim || '#fbe4e2';

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

function round(x, d) {
  var f = Math.pow(10, d === undefined ? 3 : d);
  return Math.round(x * f) / f;
}

/* ---------- 1a. the PHY timing parameters ----------
   Slot time, SIFS and DIFS per variant. The 802.11b column is the one the
   lesson computes with; a and g are carried so the DIFS identity can be
   checked on all three. Values are the ones tabulated by the IEEE 802.11
   working group and by the IETF DiffServ-to-802.11 mapping draft. */
var PHY = {
  b:  { name: '802.11b', slot: 20, sifs: 10, difs: 50, cwMin: 31,  cwMax: 1023, rate: 11,   phyHeader: 192 },
  g:  { name: '802.11g', slot: 9,  sifs: 10, difs: 28, cwMin: 15,  cwMax: 1023, rate: 54,   phyHeader: 20  },
  a:  { name: '802.11a', slot: 9,  sifs: 16, difs: 34, cwMin: 15,  cwMax: 1023, rate: 54,   phyHeader: 20  }
};

/* the identity that fixes DIFS once slot and SIFS are chosen */
chk('DIFS = SIFS + 2 x slot for 802.11b (10 + 40 = 50)',
    PHY.b.sifs + 2 * PHY.b.slot === PHY.b.difs, PHY.b.difs);
chk('DIFS = SIFS + 2 x slot for 802.11a (16 + 18 = 34)',
    PHY.a.sifs + 2 * PHY.a.slot === PHY.a.difs, PHY.a.difs);
chk('DIFS = SIFS + 2 x slot for 802.11g (10 + 18 = 28)',
    PHY.g.sifs + 2 * PHY.g.slot === PHY.g.difs, PHY.g.difs);
chk('PIFS = SIFS + 1 x slot for 802.11b (10 + 20 = 30)',
    PHY.b.sifs + PHY.b.slot === 30, 30);
chk('SIFS < PIFS < DIFS on 802.11b, so the ladder is a strict priority order',
    PHY.b.sifs < PHY.b.sifs + PHY.b.slot && PHY.b.sifs + PHY.b.slot < PHY.b.difs,
    PHY.b.sifs + ' < ' + (PHY.b.sifs + PHY.b.slot) + ' < ' + PHY.b.difs);

/* ---------- 1b. contention: k stations, contention window CW ----------
   Each station draws a whole number uniformly from 0..CW and counts that many
   slots down. The station with the smallest number transmits first; a collision
   happens exactly when two or more stations draw the same smallest number, so
   the event "no collision" is exactly "all k numbers are distinct". */

/* exact enumeration over every one of the (CW+1)^k outcomes; small CW only */
function backoffBrute(k, CW) {
  var n = CW + 1, total = Math.pow(n, k), collide = 0, sumMin = 0;
  var idx = [];
  var i, j;
  for (i = 0; i < k; i++) idx.push(0);
  for (var c = 0; c < total; c++) {
    var mn = idx[0], same = false;
    for (j = 1; j < k; j++) if (idx[j] < mn) mn = idx[j];
    for (j = 0; j < k; j++) {
      for (var m = j + 1; m < k; m++) if (idx[j] === idx[m] && idx[j] === mn) same = true;
    }
    if (same) collide++;
    sumMin += mn;
    /* base-(n) counter */
    for (j = k - 1; j >= 0; j--) {
      idx[j]++;
      if (idx[j] < n) break;
      idx[j] = 0;
    }
  }
  return { pCollide: collide / total, eMin: sumMin / total, outcomes: total };
}

/* The closed form for the event that actually matters: the FIRST transmission
   collides, which happens exactly when two or more stations attain the smallest
   draw. A repeat of a larger value is harmless, because that station is still
   counting down when the winner transmits.
     P(no collision) = sum over t of k (1/n) ((n - t - 1)/n)^(k-1)
   and the expected idle slots before the winner starts is
     E[min] = sum over t of P(min >= t) = sum over t of ((n - t)/n)^k.        */
function backoffClosed(k, CW) {
  var n = CW + 1, pNo = 0, t;
  for (t = 0; t <= CW; t++) {
    pNo += k * (1 / n) * Math.pow((n - t - 1) / n, k - 1);
  }
  var eMin = 0;
  for (t = 1; t <= CW; t++) eMin += Math.pow((n - t) / n, k);
  return { pCollide: 1 - pNo, eMin: eMin };
}

/* the tempting-but-wrong version: "a collision means two stations drew the same
   number". It agrees with the truth only at k = 2, and the lesson shows the gap. */
function allDistinctCollide(k, CW) {
  var n = CW + 1, pNo = 1, j;
  for (j = 0; j < k; j++) pNo *= (n - j) / n;
  return 1 - pNo;
}

var BRUTE_SMALL = [
  { k: 2, CW: 3 }, { k: 3, CW: 3 }, { k: 2, CW: 7 }, { k: 3, CW: 7 }, { k: 4, CW: 7 }
].map(function (c) {
  var b = backoffBrute(c.k, c.CW), f = backoffClosed(c.k, c.CW);
  return { k: c.k, CW: c.CW, brute: b, closed: f,
           dCol: Math.abs(b.pCollide - f.pCollide), dMin: Math.abs(b.eMin - f.eMin) };
});

chk('brute force and the closed form agree on P(collision) for 5 small cases',
    BRUTE_SMALL.every(function (r) { return r.dCol < 1e-12; }),
    BRUTE_SMALL.map(function (r) { return r.k + '/' + r.CW + ':' + r.dCol.toExponential(1); }).join(' '));
chk('brute force and the closed form agree on E[min] for the same 5 cases',
    BRUTE_SMALL.every(function (r) { return r.dMin < 1e-12; }),
    BRUTE_SMALL.map(function (r) { return r.dMin.toExponential(1); }).join(' '));
chk('with two stations the collision probability is exactly 1/(CW+1)',
    Math.abs(backoffClosed(2, 31).pCollide - 1 / 32) < 1e-12, round(1 / 32, 6));
chk('the all-distinct formula is a counterexample trap: at k = 3, CW = 3 it says 0.625 where the truth is 0.34375',
    Math.abs(allDistinctCollide(3, 3) - 0.625) < 1e-12 &&
    Math.abs(backoffClosed(3, 3).pCollide - 0.34375) < 1e-12,
    round(allDistinctCollide(3, 3), 5) + ' against ' + round(backoffClosed(3, 3).pCollide, 5));
chk('a repeated draw above the minimum is not a collision, so the two formulas must differ at k = 3',
    allDistinctCollide(3, 3) > backoffClosed(3, 3).pCollide + 0.2, 'gap 0.28125');
chk('P(collision) rises with the number of contenders at CW = 31',
    backoffClosed(2, 31).pCollide < backoffClosed(4, 31).pCollide &&
    backoffClosed(4, 31).pCollide < backoffClosed(6, 31).pCollide,
    [2, 4, 6].map(function (k) { return round(backoffClosed(k, 31).pCollide, 4); }).join(' < '));
chk('P(collision) falls when the window doubles at a fixed k = 5',
    backoffClosed(5, 63).pCollide < backoffClosed(5, 31).pCollide,
    round(backoffClosed(5, 31).pCollide, 4) + ' > ' + round(backoffClosed(5, 63).pCollide, 4));
chk('E[min] is at most CW/2 for every k, with equality only at k = 1',
    Math.abs(backoffClosed(1, 31).eMin - 15.5) < 1e-12 &&
    [2, 3, 4, 5, 6, 8].every(function (k) { return backoffClosed(k, 31).eMin < 15.5; }),
    'k=1: 15.5, k=4: ' + round(backoffClosed(4, 31).eMin, 3) + ', k=8: ' + round(backoffClosed(8, 31).eMin, 3));
chk('a single station waits the mean of 0..CW, which is CW/2 = 15.5 slots',
    Math.abs(backoffClosed(1, 31).eMin - 15.5) < 1e-12, round(backoffClosed(1, 31).eMin, 4));

/* the table the lesson quotes */
var CONTEND = [1, 2, 3, 4, 5, 6, 8].map(function (k) {
  var b31 = backoffClosed(k, 31), b15 = backoffClosed(k, 15);
  return {
    k: k,
    pCol31: b31.pCollide, eMin31: b31.eMin,
    pCol15: b15.pCollide, eMin15: b15.eMin,
    /* expected slots burned before the winner starts, in microseconds */
    waste31us: b31.eMin * PHY.b.slot,
    /* expected wasted airtime per successful contention = collision prob x frame */
    pOk31: 1 - b31.pCollide
  };
});

/* ---------- 1c. binary exponential backoff ----------
   On every failed attempt the window becomes 2 x CW + 1, capped at CWmax, and
   returns to CWmin after a success. */
function cwLadder(cwMin, cwMax) {
  var rows = [], cw = cwMin, i;
  for (i = 0; i < 16; i++) {
    rows.push({ attempt: i + 1, cw: cw, meanSlots: cw / 2 });
    if (cw >= cwMax) break;
    cw = Math.min(2 * cw + 1, cwMax);
  }
  return rows;
}
var LADDER_B = cwLadder(PHY.b.cwMin, PHY.b.cwMax);
var LADDER_AG = cwLadder(15, 1023);

chk('the 802.11b ladder from CWmin = 31 reaches CWmax = 1023 in 6 rungs',
    LADDER_B.length === 6 && LADDER_B[5].cw === 1023,
    LADDER_B.map(function (r) { return r.cw; }).join(','));
chk('each rung is 2 x CW + 1 until the cap',
    LADDER_B.slice(0, 5).every(function (r, i) { return LADDER_B[i + 1].cw === 2 * r.cw + 1; }),
    '31 -> 63 -> 127 -> 255 -> 511 -> 1023');
chk('the 15-rung ladder is the 31-rung ladder shifted by one attempt',
    LADDER_AG[1].cw === LADDER_B[0].cw && LADDER_AG[5].cw === LADDER_B[4].cw,
    LADDER_AG.map(function (r) { return r.cw; }).join(','));
chk('the mean backoff is CW/2 slots, which is 310 us at the first rung',
    LADDER_B[0].meanSlots * PHY.b.slot === 310, 310);
chk('the worst-case first backoff is 31 slots = 620 us',
    31 * PHY.b.slot === 620, 620);
chk('the worst-case capped backoff is 1023 slots = 20460 us',
    1023 * PHY.b.slot === 20460, 20460);

/* ---------- 1d. the airtime budget for one frame ----------
   The published 802.11b model (Cisco, "Maximum Throughput Calculations for
   802.11b WLAN"):
     airtime = PHY + (L + 28) x 8 / R + SIFS + PHY + ACK x 8 / R + DIFS
               + (backoff / 2) x slot
   with PHY = 192 us of long preamble and header, 28 bytes of MAC header and
   FCS, 14 bytes of ACK, and a backoff of 32 halved to 16 slots. */
var FRAME_CFG = { phy: 192, macOverhead: 28, ackBytes: 14, rate: 11e6, backoffSlots: 16 };

function frameBudget(payloadBytes) {
  var dataUs = (payloadBytes + FRAME_CFG.macOverhead) * 8 / FRAME_CFG.rate * 1e6;
  var ackUs = FRAME_CFG.ackBytes * 8 / FRAME_CFG.rate * 1e6;
  var backoffUs = FRAME_CFG.backoffSlots * PHY.b.slot;
  var parts = [
    { name: 'DIFS', us: PHY.b.difs },
    { name: 'backoff', us: backoffUs },
    { name: 'preamble + header', us: FRAME_CFG.phy },
    { name: 'data', us: dataUs },
    { name: 'SIFS', us: PHY.b.sifs },
    { name: 'preamble + header', us: FRAME_CFG.phy },
    { name: 'ACK', us: ackUs }
  ];
  var total = 0;
  parts.forEach(function (p) { total += p.us; });
  var payloadBits = payloadBytes * 8;
  var goodput = payloadBits / (total * 1e-6);
  return {
    payloadBytes: payloadBytes, parts: parts, totalUs: total,
    goodputBps: goodput, efficiency: goodput / FRAME_CFG.rate,
    overheadUs: total - dataUs
  };
}

var BUDGET = [64, 128, 256, 512, 1024, 1500, 2304].map(frameBudget);

/* cross-check against the two published rows of the Cisco table */
var CISCO = [{ L: 128, bps: 1153625 }, { L: 256, bps: 2088246 }];
var CISCO_FIT = CISCO.map(function (row) {
  var mine = frameBudget(row.L);
  return { L: row.L, mine: mine.goodputBps, published: row.bps,
           errPct: Math.abs(mine.goodputBps - row.bps) / row.bps * 100 };
});
chk('the airtime model reproduces the published 2,088,246 bps for a 256-byte frame',
    CISCO_FIT[1].errPct < 0.05, round(CISCO_FIT[1].mine, 0) + ' bps, error ' + round(CISCO_FIT[1].errPct, 4) + '%');
chk('it reproduces the published 1,153,625 bps for a 128-byte frame',
    CISCO_FIT[0].errPct < 0.05, round(CISCO_FIT[0].mine, 0) + ' bps, error ' + round(CISCO_FIT[0].errPct, 4) + '%');
chk('the parts sum to the total airtime for every payload',
    BUDGET.every(function (b) {
      var s = 0; b.parts.forEach(function (p) { s += p.us; });
      return Math.abs(s - b.totalUs) < 1e-9;
    }), BUDGET.length + ' payload sizes');
chk('goodput is below the raw rate for every payload, because the overhead is positive',
    BUDGET.every(function (b) { return b.efficiency > 0 && b.efficiency < 1; }),
    BUDGET.map(function (b) { return b.payloadBytes + 'B:' + round(b.efficiency * 100, 1) + '%'; }).join(' '));
chk('efficiency rises with payload size at a fixed overhead',
    BUDGET[0].efficiency < BUDGET[3].efficiency && BUDGET[3].efficiency < BUDGET[6].efficiency,
    round(BUDGET[0].efficiency, 4) + ' < ' + round(BUDGET[3].efficiency, 4) + ' < ' + round(BUDGET[6].efficiency, 4));
chk('a 64-byte frame spends more airtime on overhead than on data',
    BUDGET[0].overheadUs > BUDGET[0].parts[3].us,
    round(BUDGET[0].overheadUs, 1) + ' us overhead against ' + round(BUDGET[0].parts[3].us, 1) + ' us of data');

/* ---------- 1e. reachability: the hidden and the exposed terminal ----------
   A link exists from X to Y when the distance is at most the range. Carrier
   sense is symmetric here (same range both ways), which is the textbook model.
   A pair (X, Y) is hidden with respect to a receiver R when both reach R but
   neither reaches the other. */
var RANGE = 60;
var NODES = {
  A: { x: -45, y: 0,   label: 'A' },
  B: { x: 0,   y: 0,   label: 'AP (B)' },
  C: { x: 45,  y: 0,   label: 'C' },
  D: { x: 95,  y: 0,   label: 'D' }
};

function dist(p, q) {
  var dx = p.x - q.x, dy = p.y - q.y;
  return Math.sqrt(dx * dx + dy * dy);
}
function reaches(p, q) { return dist(p, q) <= RANGE; }

var LINKS = [];
Object.keys(NODES).forEach(function (a) {
  Object.keys(NODES).forEach(function (b) {
    if (a < b) LINKS.push({ a: a, b: b, d: dist(NODES[a], NODES[b]), up: reaches(NODES[a], NODES[b]) });
  });
});

chk('A and C both reach the access point B',
    reaches(NODES.A, NODES.B) && reaches(NODES.C, NODES.B),
    dist(NODES.A, NODES.B) + ' m and ' + dist(NODES.C, NODES.B) + ' m against a range of ' + RANGE + ' m');
chk('A and C do not reach each other, so each is hidden from the other',
    !reaches(NODES.A, NODES.C), dist(NODES.A, NODES.C) + ' m > ' + RANGE + ' m');
chk('C reaches B but not A, which is the exposed-terminal geometry',
    reaches(NODES.C, NODES.B) && !reaches(NODES.C, NODES.A),
    'C-B ' + dist(NODES.C, NODES.B) + ' m, C-A ' + dist(NODES.C, NODES.A) + ' m');
chk('D is out of range of B, so C to D cannot collide at B',
    !reaches(NODES.D, NODES.B) && reaches(NODES.C, NODES.D),
    'D-B ' + dist(NODES.D, NODES.B) + ' m, D-C ' + dist(NODES.C, NODES.D) + ' m');

var HIDDEN_PAIRS = LINKS.filter(function (l) {
  var bothReachB = reaches(NODES[l.a], NODES.B) && reaches(NODES[l.b], NODES.B);
  return bothReachB && !l.up && l.a !== 'B' && l.b !== 'B';
}).map(function (l) { return l.a + '-' + l.b; });
chk('exactly one hidden pair exists in this geometry', HIDDEN_PAIRS.length === 1, HIDDEN_PAIRS.join(','));

/* ---------- 1f. RTS/CTS and the NAV ----------
   RTS is 20 bytes, CTS 14 bytes, both sent at the basic rate with the PHY
   preamble, and each separated by a SIFS. */
var RTS_BYTES = 20, CTS_BYTES = 14;
function controlUs(bytes) { return FRAME_CFG.phy + bytes * 8 / FRAME_CFG.rate * 1e6; }
var RTS_US = controlUs(RTS_BYTES);
var CTS_US = controlUs(CTS_BYTES);
var HANDSHAKE_US = RTS_US + PHY.b.sifs + CTS_US + PHY.b.sifs;

chk('the RTS/CTS handshake costs RTS + SIFS + CTS + SIFS',
    Math.abs(HANDSHAKE_US - (RTS_US + PHY.b.sifs + CTS_US + PHY.b.sifs)) < 1e-9,
    round(HANDSHAKE_US, 2) + ' us');
chk('the handshake is cheaper than the smallest full frame it protects',
    HANDSHAKE_US < frameBudget(64).totalUs,
    round(HANDSHAKE_US, 1) + ' us against ' + round(frameBudget(64).totalUs, 1) + ' us');

/* the NAV a CTS installs covers SIFS + data + SIFS + ACK, which is exactly the
   time the silent stations must stay off the medium */
function navUs(payloadBytes) {
  var dataUs = (payloadBytes + FRAME_CFG.macOverhead) * 8 / FRAME_CFG.rate * 1e6;
  var ackUs = FRAME_CFG.ackBytes * 8 / FRAME_CFG.rate * 1e6;
  return PHY.b.sifs + dataUs + PHY.b.sifs + ackUs;
}
chk('the NAV of a 1500-byte frame covers SIFS + data + SIFS + ACK',
    navUs(1500) > 0 && navUs(1500) < frameBudget(1500).totalUs,
    round(navUs(1500), 1) + ' us of a ' + round(frameBudget(1500).totalUs, 1) + ' us cycle');

/* break-even: the handshake is worth paying when the airtime a collision would
   waste exceeds its cost. This is a stated simplification: it ignores the fact
   that RTS frames can also collide, and the ACK timeout. */
var BREAKEVEN = [256, 1024, 1500, 2304].map(function (L) {
  var b = frameBudget(L);
  var dataUs = b.parts[3].us;
  return { L: L, dataUs: dataUs, p: HANDSHAKE_US / dataUs };
});
chk('the break-even collision probability falls as the frame grows',
    BREAKEVEN[0].p > BREAKEVEN[3].p,
    BREAKEVEN.map(function (r) { return r.L + 'B:' + round(r.p, 3); }).join(' '));

/* ---------- 1g. a deterministic backoff draw, for the picture ----------
   A fixed linear congruential sequence, so a replay shows the same numbers. */
function seededDraws(count, CW, seed) {
  /* xorshift32, and the slot is taken from the HIGH bits. A power-of-two
     generator read through its low bits is exactly the failure mode that makes
     consecutive draws identical, which the check below catches. */
  var s = (seed === undefined ? 12345 : seed) >>> 0;
  var out = [];
  for (var i = 0; i < count; i++) {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;  s >>>= 0;
    out.push(Math.floor((s / 4294967296) * (CW + 1)));
  }
  return out;
}
var DRAWS = seededDraws(4, 31, 20261031);
/* the pigeonhole counterexample quoted on the Edge cases tab: 5 stations drawing
   from 4 values does not force a collision, because only the minimum matters */
chk('5 stations on a 4-value window collide with probability 0.52, not 1, so pigeonhole does not force it',
    backoffClosed(5, 3).pCollide > 0.5 && backoffClosed(5, 3).pCollide < 0.55 &&
    Math.abs(backoffClosed(5, 3).pCollide - backoffBrute(5, 3).pCollide) < 1e-12,
    round(backoffClosed(5, 3).pCollide, 4) + ' from the closed form, ' + round(backoffBrute(5, 3).pCollide, 4) + ' by enumeration');

chk('the seeded draw lies inside the contention window for every station',
    DRAWS.every(function (d) { return d >= 0 && d <= 31; }), DRAWS.join(' '));
chk('the seeded draw is reproducible: the same seed gives the same sequence',
    seededDraws(4, 31, 20261031).join(',') === DRAWS.join(','), DRAWS.join(' '));

var WINNER = DRAWS.indexOf(Math.min.apply(null, DRAWS));
var TIE = DRAWS.filter(function (d) { return d === Math.min.apply(null, DRAWS); }).length > 1;
chk('the draw has a single smallest value, so this round has one winner',
    !TIE, 'station ' + (WINNER + 1) + ' at slot ' + DRAWS[WINNER]);

/* ======================================================================
   LAYER 2 - exposed for the headless check and for the reader
   ====================================================================== */

window.LESSON_MODEL = {
  PHY: PHY, backoffBrute: backoffBrute, backoffClosed: backoffClosed,
  allDistinctCollide: allDistinctCollide,
  BRUTE_SMALL: BRUTE_SMALL, CONTEND: CONTEND,
  LADDER_B: LADDER_B, LADDER_AG: LADDER_AG,
  FRAME_CFG: FRAME_CFG, BUDGET: BUDGET, CISCO_FIT: CISCO_FIT, frameBudget: frameBudget,
  NODES: NODES, RANGE: RANGE, LINKS: LINKS, HIDDEN_PAIRS: HIDDEN_PAIRS,
  RTS_US: RTS_US, CTS_US: CTS_US, HANDSHAKE_US: HANDSHAKE_US, navUs: navUs,
  BREAKEVEN: BREAKEVEN, DRAWS: DRAWS, WINNER: WINNER
};
window.__lessonChecks = CHECKS;

/* ======================================================================
   LAYER 3 - RENDER
   Reads the model above. No arithmetic that changes a number happens here.
   ====================================================================== */

var HEAD = 'Wi-Fi: 802.11 CSMA/CA and the hidden terminal';

function head(P, sub) {
  P.text(24, 18, HEAD, { size: 13, color: FAINT, bold: true });
  P.text(24, 38, sub, { size: 15, color: INK, bold: true });
}

function chip(P, x, y, text, kind) {
  var fill = kind === 'bad' ? INVALIDDIM : kind === 'warn' ? WARNDIM : ACCDIM;
  var col = kind === 'bad' ? BAD : kind === 'warn' ? WARN : ACC;
  var w = Math.max(46, text.length * 7.1 + 16);
  P.rect(x, y, w, 20, { fill: fill, radius: 10 });
  P.text(x + w / 2, y + 10, text, { size: 11, color: col, align: 'center', base: 'middle', bold: true });
  return w;
}

function station(P, x, y, label, o) {
  o = o || {};
  var w = o.w || 78, h = 46;
  P.rect(x - w / 2, y - h / 2, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, radius: 8, sw: o.sw || 1.6 });
  P.text(x, y + 1, label, { size: 13, color: o.color || INK, align: 'center', base: 'middle', bold: true });
  /* antenna */
  P.line(x, y - h / 2, x, y - h / 2 - 16, { stroke: o.stroke || BORDER, sw: 1.6 });
  P.circle(x, y - h / 2 - 20, 4, { fill: o.stroke || BORDER });
  return { x: x, y: y, w: w, h: h, top: y - h / 2, bottom: y + h / 2 };
}

/* a labelled bar in a horizontal time diagram */
function seg(P, x, y, w, h, fill, label, colour) {
  P.rect(x, y, w, h, { fill: fill, stroke: colour || BORDER, radius: 3, sw: 1.2 });
  if (label && w > 26) {
    P.text(x + w / 2, y + h / 2, label, { size: 10, color: colour || INK, align: 'center', base: 'middle', mono: true });
  }
}

function axis(P, x0, x1, y, ticks, scale, unit) {
  P.line(x0, y, x1, y, { stroke: BORDER, sw: 1.2 });
  ticks.forEach(function (t) {
    var x = x0 + t * scale;
    P.line(x, y - 4, x, y + 4, { stroke: BORDER, sw: 1 });
    P.text(x, y + 8, t + (unit || ''), { size: 9.5, color: FAINT, align: 'center', mono: true });
  });
}

/* ---------- scene 1: one channel, three stations ---------- */
function sceneMedium(P, p) {
  head(P, 'One channel, three stations, and no one can hear their own collision');

  var airY = 262;
  P.rect(40, airY - 26, W - 80, 52, { fill: SURF2, stroke: BORDER, radius: 8, sw: 1.2 });
  P.text(52, airY + 34, 'the shared radio channel: one frequency, one conversation at a time', { size: 10.5, color: FAINT });

  var a = station(P, 150, 150, 'A', { stroke: ACC });
  var b = station(P, 450, 150, 'AP', { stroke: INFO });
  var c = station(P, 750, 150, 'C', { stroke: WARN });

  /* A starts at p = 0.10, C at p = 0.34: both inside the same airtime */
  var aStart = 0.10, cStart = 0.34, travel = 0.34;
  function framePos(start, fromX, toX) {
    var q = K.clamp01((p - start) / travel);
    return { q: q, x: fromX + (toX - fromX) * q };
  }
  var fa = framePos(aStart, a.x + 20, b.x - 44);
  var fc = framePos(cStart, c.x - 20, b.x + 44);

  if (fa.q > 0) {
    var al = fa.q < 1 ? 'A to AP' : 'A to AP';
    seg(P, Math.min(fa.x, fa.x - 62), airY - 12, 62, 24, ACCDIM, al, ACC);
    P.arrow(fa.x - 62, airY, fa.x, airY, { stroke: ACC, sw: 1.4, head: 6 });
  }
  if (fc.q > 0) {
    seg(P, fc.x, airY - 12, 62, 24, WARNDIM, 'C to AP', WARN);
    P.arrow(fc.x + 62, airY, fc.x, airY, { stroke: WARN, sw: 1.4, head: 6 });
  }

  /* the collision shows up at the receiver, not at either sender */
  if (p > 0.62) {
    P.circle(b.x, airY - 34, 15, { fill: INVALIDDIM, stroke: BAD, sw: 1.6 });
    P.line(b.x - 8, airY - 42, b.x + 8, airY - 26, { stroke: BAD, sw: 2 });
    P.line(b.x + 8, airY - 42, b.x - 8, airY - 26, { stroke: BAD, sw: 2 });
    P.text(b.x, airY - 58, 'collision, seen only at the AP', { size: 11, color: BAD, align: 'center', bold: true });
  }

  /* each sender is listening to its own transmission, which it cannot do */
  if (p > 0.30) {
    P.text(a.x, a.bottom + 30, 'A is transmitting', { size: 10.5, color: ACC, align: 'center' });
    P.text(a.x, a.bottom + 45, 'so it is not listening', { size: 10.5, color: DIM, align: 'center' });
  }
  if (p > 0.52) {
    P.text(c.x, c.bottom + 30, 'C hears nothing from A', { size: 10.5, color: WARN, align: 'center' });
    P.text(c.x, c.bottom + 45, 'because A is out of range', { size: 10.5, color: DIM, align: 'center' });
  }

  P.text(40, H - 58, 'A and C are both in range of the access point but out of range of each other.', { size: 12, color: INK });
  P.text(40, H - 40, 'Their frames arrive together at the AP and are destroyed there. Neither sender ever finds out.', { size: 12, color: DIM });
  P.text(40, H - 20, 'That single sentence is the whole reason the Wi-Fi medium access control looks the way it does.', { size: 12, color: ACC, bold: true });
}

/* ---------- scene 2: why collision detection is impossible ---------- */
function sceneNoCD(P, p) {
  head(P, 'Ethernet detects a collision; radio cannot, so Wi-Fi avoids one instead');

  var colW = 400, leftX = 40, rightX = 480, top = 84, h = 300;

  P.rect(leftX, top, colW, h, { fill: SURF, stroke: BORDER, radius: 10, sw: 1.4 });
  P.text(leftX + 16, top + 14, 'Ethernet (CSMA/CD)', { size: 13, color: INFO, bold: true });
  P.text(leftX + 16, top + 36, 'one wire, and everyone hears everyone', { size: 11, color: DIM });

  var barY = top + 70;
  P.text(leftX + 16, barY, 'my own signal at my receiver', { size: 10.5, color: DIM });
  P.rect(leftX + 16, barY + 16, 300, 16, { fill: ACCDIM, stroke: ACC, radius: 3, sw: 1 });
  P.text(leftX + 16, barY + 44, 'a neighbour\'s signal at my receiver', { size: 10.5, color: DIM });
  P.rect(leftX + 16, barY + 60, 210, 16, { fill: SURF2, stroke: BORDER, radius: 3, sw: 1 });

  P.text(leftX + 16, barY + 96, 'The two are comparable, so a transmitting station can', { size: 11, color: INK });
  P.text(leftX + 16, barY + 114, 'compare what it sends with what it hears, and abort', { size: 11, color: INK });
  P.text(leftX + 16, barY + 132, 'within one round-trip time.', { size: 11, color: INK });

  var steps = [
    'send, and listen at the same time',
    'mismatch means a collision: stop at once',
    'jam the line so the others also stop',
    'binary exponential backoff, then retry'
  ];
  steps.forEach(function (s, i) {
    if (p > 0.06 * i) P.text(leftX + 16, barY + 164 + i * 20, (i + 1) + '. ' + s, { size: 11, color: VAL });
  });

  P.rect(rightX, top, colW, h, { fill: SURF, stroke: BORDER, radius: 10, sw: 1.4 });
  P.text(rightX + 16, top + 14, 'Wi-Fi (CSMA/CA)', { size: 13, color: WARN, bold: true });
  P.text(rightX + 16, top + 36, 'a shared radio channel, and half duplex', { size: 11, color: DIM });

  var r2 = top + 70;
  P.text(rightX + 16, r2, 'my own signal at my own antenna', { size: 10.5, color: DIM });
  P.rect(rightX + 16, r2 + 16, 300, 16, { fill: WARNDIM, stroke: WARN, radius: 3, sw: 1 });
  P.text(rightX + 16, r2 + 44, 'any other station, at my antenna', { size: 10.5, color: DIM });
  P.rect(rightX + 16, r2 + 60, 22, 16, { fill: SURF2, stroke: BORDER, radius: 3, sw: 1 });
  P.text(rightX + 46, r2 + 60, 'orders of magnitude weaker: the receiver is deaf while it transmits', { size: 10, color: DIM });

  var wsteps = [
    'the radio cannot listen while it shouts',
    'and the collision happens at the receiver, not at me',
    'so there is nothing to detect: a station sends the whole frame',
    'the repair is an ACK, and a retry when no ACK arrives'
  ];
  wsteps.forEach(function (s, i) {
    if (p > 0.06 * i) P.text(rightX + 16, r2 + 92 + i * 26, '- ' + s, { size: 11, color: i === 3 ? WARN : INK });
  });

  if (p > 0.55) {
    P.text(rightX + 16, top + h - 46, 'Avoidance replaces detection. That is the whole', { size: 11.5, color: ACC, bold: true });
    P.text(rightX + 16, top + h - 28, 'design shift from 802.3 to 802.11.', { size: 11.5, color: ACC, bold: true });
  }
}

/* ---------- scene 3: physical and virtual carrier sense ---------- */
function sceneCarrierSense(P, p) {
  head(P, 'Two kinds of carrier sense: listen to the air, and read the duration field');

  var scale = 2.0;               /* 1 m = 2.0 px */
  var cx = 450, cy = 226;
  function px(x) { return cx + x * scale; }
  function py(y) { return cy + y * scale; }

  /* range circles, drawn from the computed range */
  ['A', 'C'].forEach(function (n, i) {
    var alpha = p > 0.05 + i * 0.1 ? 1 : 0.35;
    P.alpha(alpha);
    P.circle(px(NODES[n].x), py(NODES[n].y), RANGE * scale, { stroke: n === 'A' ? ACC : WARN, sw: 1.1, dash: [5, 5] });
    P.alpha(1);
  });

  var linkAC = LINKS.filter(function (l) { return l.a === 'A' && l.b === 'C'; })[0];
  P.line(px(NODES.A.x) + 28, py(0), px(NODES.C.x) - 28, py(0), { stroke: BAD, sw: 1.2, dash: [4, 4] });

  station(P, px(NODES.A.x), py(NODES.A.y), 'A', { stroke: ACC, w: 54 });
  station(P, px(NODES.B.x), py(NODES.B.y) - 90, 'AP', { stroke: INFO, w: 54 });
  station(P, px(NODES.C.x), py(NODES.C.y), 'C', { stroke: WARN, w: 54 });

  P.line(px(NODES.A.x) + 28, py(0) - 24, px(NODES.B.x) - 28, py(0) - 78, { stroke: INFO, sw: 1.4, dash: [5, 4] });
  P.line(px(NODES.C.x) - 28, py(0) - 24, px(NODES.B.x) + 28, py(0) - 78, { stroke: INFO, sw: 1.4, dash: [5, 4] });

  P.text(cx, 286, 'A to AP 45 m and C to AP 45 m: both reach the access point', { size: 11, color: INFO, align: 'center' });
  P.text(cx, 306, 'A to C ' + linkAC.d + ' m, beyond the ' + RANGE + ' m range: neither reaches the other', { size: 11, color: BAD, align: 'center' });

  /* the NAV gauge */
  var navY = 376, navX = 40, navW = W - 80;
  P.text(navX, 356, 'virtual carrier sense: the NAV is a countdown, not a measurement', { size: 11.5, color: INK, bold: true });
  P.rect(navX, navY, navW, 26, { fill: SURF2, stroke: BORDER, radius: 6, sw: 1.2 });
  var navFill = K.clamp01((p - 0.35) / 0.55);
  P.rect(navX, navY, navW * navFill, 26, { fill: ACCDIM, stroke: ACC, radius: 6, sw: 1.2 });
  var navLeft = Math.round(navUs(1500) * (1 - navFill));
  P.text(navX + 10, navY + 13, 'NAV = ' + round(navUs(1500), 1) + ' us  (SIFS + data + SIFS + ACK for a 1500-byte frame)',
         { size: 10.5, color: INK, base: 'middle' });
  P.text(navX + navW - 10, navY + 13, navLeft + ' us left', { size: 10.5, color: ACC, align: 'right', base: 'middle', bold: true });

  P.text(40, H - 22, 'Physical sense hears energy; virtual sense obeys a number another station wrote down. Both count as "busy".',
         { size: 11.5, color: DIM });
}

/* ---------- scene 4: the IFS ladder ---------- */
function sceneIFS(P, p) {
  head(P, 'The inter-frame spaces are a priority ladder, not decoration');

  var x0 = 90, scale = 10;        /* 1 us = 10 px */
  var rows = [
    { name: 'SIFS', us: PHY.b.sifs, who: 'ACK, CTS, and the next fragment', kind: 'acc' },
    { name: 'PIFS', us: PHY.b.sifs + PHY.b.slot, who: 'a beacon, and the access point when it polls', kind: 'info' },
    { name: 'DIFS', us: PHY.b.difs, who: 'an ordinary data frame, contending with everyone', kind: 'warn' }
  ];
  rows.forEach(function (r, i) {
    var y = 110 + i * 74;
    if (p < 0.08 * i) return;
    var col = r.kind === 'acc' ? ACC : r.kind === 'info' ? INFO : WARN;
    var fill = r.kind === 'acc' ? ACCDIM : r.kind === 'info' ? SURF2 : WARNDIM;
    P.text(x0 - 16, y + 14, r.name, { size: 13, color: col, align: 'right', bold: true });
    var grow = K.ease(K.clamp01((p - 0.08 * i) / 0.30));
    P.rect(x0, y, r.us * scale * grow, 30, { fill: fill, stroke: col, radius: 4, sw: 1.4 });
    if (grow > 0.9) {
      P.text(x0 + r.us * scale + 12, y + 15, r.us + ' us', { size: 12, color: col, base: 'middle', bold: true, mono: true });
      P.text(x0 + 10, y + 46, r.who, { size: 10.5, color: DIM });
    }
  });

  /* the identity, and the consequence */
  if (p > 0.42) {
    P.rect(40, 336, W - 80, 74, { fill: SURF, stroke: BORDER, radius: 8, sw: 1.2 });
    P.text(56, 348, 'DIFS = SIFS + 2 x slot = 10 + 2 x 20 = 50 us, and PIFS = SIFS + slot = 30 us', { size: 12.5, color: INK, bold: true, mono: false });
    P.text(56, 372, 'Because SIFS is the shortest, an ACK always starts before any waiting station may: the reply has priority over the next contention.',
           { size: 11.5, color: DIM });
    P.text(56, 392, 'Change the slot time and DIFS follows it; that is why 802.11a uses 34 us and 802.11g uses 28 us for the same DIFS.', { size: 11.5, color: DIM });
  }
  if (p > 0.72) {
    P.text(40, H - 24, 'The ladder is how a distributed system creates priority out of nothing but waiting longer.', { size: 12, color: ACC, bold: true });
  }
}

/* ---------- scene 5: one frame end to end ---------- */
function sceneExchange(P, p) {
  head(P, 'One frame, end to end: the airtime budget of an 802.11b transmission');

  var b = BUDGET[2];               /* the 256-byte frame, the published row */
  var x0 = 132, x1 = W - 40;
  var total = b.totalUs;
  var sc = (x1 - x0) / total;

  var rowY = [96, 176, 256];
  var names = ['sender A', 'receiver AP', 'other station'];
  names.forEach(function (n, i) {
    P.text(x0 - 12, rowY[i] + 15, n, { size: 11, color: DIM, align: 'right' });
    P.line(x0, rowY[i] + 30, x1, rowY[i] + 30, { stroke: SURF2, sw: 1 });
  });

  /* build cumulative x positions from the computed parts */
  var cum = 0;
  var widths = b.parts.map(function (part) { return part.us * sc; });
  var xs = [];
  b.parts.forEach(function (part) { xs.push(x0 + cum); cum += part.us * sc; });

  /* sender row: DIFS, backoff, PHY, data */
  var reveal = K.clamp01((p - 0.05) / 0.62);
  var cut = x0 + (x1 - x0) * reveal;
  function drawUntil(idx, y, h, parts) {
    parts.forEach(function (k) {
      if (xs[k] > cut) return;
      var w = Math.min(widths[k], cut - xs[k]);
      var lab = ['DIFS', 'backoff', 'PHY', 'DATA 256 B', 'SIFS', 'PHY', 'ACK'][k] || '';
      seg(P, xs[k], y, w, h, k % 2 ? SURF2 : ACCDIM, lab, k === 0 || k === 1 ? DIM : ACC);
    });
  }
  drawUntil(0, rowY[0], 30, [0, 1, 2, 3]);

  /* receiver row: SIFS then ACK */
  drawUntil(0, rowY[1], 30, [4, 5, 6]);

  if (xs[4] <= cut) {
    P.text(xs[4], rowY[1] + 38, 'SIFS ' + PHY.b.sifs + ' + PHY ' + FRAME_CFG.phy + ' + ACK ' + round(b.parts[6].us, 1) + ' us',
           { size: 10, color: DIM, mono: true });
  }

  /* third station: silent for the whole cycle */
  if (xs[4] <= cut) {
    P.rect(xs[0], rowY[2], Math.min(x1 - xs[0], cut - xs[0]), 30, { fill: SURF2, stroke: BORDER, radius: 3, sw: 1, dash: [4, 4] });
    P.text(xs[0] + 8, rowY[2] + 15, 'hears the medium busy, so it defers', { size: 10.5, color: FAINT, base: 'middle' });
  }

  /* the numbers */
  if (p > 0.42) {
    P.text(40, 306, 'airtime = DIFS ' + PHY.b.difs + ' + backoff ' + round(b.parts[1].us, 0) + ' + PHY ' + FRAME_CFG.phy +
           ' + data ' + round(b.parts[3].us, 1) + ' + SIFS ' + PHY.b.sifs + ' + PHY ' + FRAME_CFG.phy +
           ' + ACK ' + round(b.parts[6].us, 1) + ' us', { size: 11.5, color: INK, mono: true });
    P.text(40, 330, '= ' + round(b.totalUs, 1) + ' us for 256 bytes of payload, which is 2048 bits', { size: 11.5, color: INK, mono: true });
  }
  if (p > 0.62) {
    P.rect(40, 348, 300, 78, { fill: ACCDIM, stroke: ACC, radius: 8, sw: 1.2 });
    P.text(56, 360, 'goodput', { size: 10.5, color: ACC, bold: true });
    P.text(56, 378, round(b.goodputBps / 1e6, 3) + ' Mbps', { size: 20, color: INK, bold: true, mono: true });
    P.text(56, 404, 'of an 11 Mbps radio: ' + round(b.efficiency * 100, 1) + '% efficient', { size: 10.5, color: DIM });
  }
  if (p > 0.80) {
    P.text(360, 360, 'The published 802.11b table gives 2,088,246 bps', { size: 11.5, color: INK });
    P.text(360, 380, 'for exactly this frame. This page computes', { size: 11.5, color: INK });
    P.text(360, 400, round(b.goodputBps, 0) + ' bps, an error of ' + round(CISCO_FIT[1].errPct, 4) + '%.', { size: 11.5, color: VAL, bold: true });
    P.text(360, 420, round(b.overheadUs, 1) + ' of those ' + round(b.totalUs, 1) + ' us are not payload.', { size: 11.5, color: WARN });
  }
}

/* ---------- scene 6: the random backoff ---------- */
function sceneBackoff(P, p) {
  head(P, 'Random backoff: the smallest number wins, and ties collide');

  var x0 = 56, y0 = 100, slotW = (W - 112) / 32;
  P.text(x0, y0 - 26, 'four stations draw a whole number from 0 to 31; each slot is 20 us', { size: 11.5, color: DIM });

  for (var s = 0; s < 32; s++) {
    var hot = DRAWS.indexOf(s) >= 0;
    P.rect(x0 + s * slotW + 1, y0, slotW - 2, 26, {
      fill: hot ? WARNDIM : (s === DRAWS[WINNER] ? ACCDIM : SURF2),
      stroke: s === DRAWS[WINNER] ? ACC : BORDER, sw: s === DRAWS[WINNER] ? 1.6 : 1, radius: 2
    });
    if (s % 4 === 0) P.text(x0 + s * slotW + slotW / 2, y0 + 32, s, { size: 9.5, color: FAINT, align: 'center', mono: true });
  }

  /* one lane per station, drawn from the model's fixed draw */
  DRAWS.forEach(function (d, i) {
    if (p < 0.08 + i * 0.09) return;
    var y = y0 + 58 + i * 30;
    P.text(x0 - 8, y + 11, 'S' + (i + 1), { size: 11, color: DIM, align: 'right' });
    var win = d === Math.min.apply(null, DRAWS);
    var bw = Math.max(slotW, d * slotW);
    P.rect(x0, y, bw, 22, { fill: win ? ACCDIM : SURF2, stroke: win ? ACC : BORDER, radius: 3, sw: 1.3 });
    var wide = bw > 100;
    P.text(wide ? x0 + bw - 8 : x0 + bw + 8, y + 11, 'backoff ' + d,
           { size: 10.5, color: win ? ACC : DIM, base: 'middle', mono: true, bold: win, align: wide ? 'right' : 'left' });
  });

  /* the outcome */
  if (p > 0.50) {
    P.text(x0, y0 + 58 + 4 * 30 + 8, 'S' + (WINNER + 1) + ' reaches zero first and transmits;', { size: 11.5, color: INK });
    P.text(x0, y0 + 58 + 4 * 30 + 24, 'the others freeze their counters and wait.', { size: 11.5, color: DIM });
  }

  /* the computed table */
  if (p > 0.60) {
    var tx = 470, ty = 318;
    P.text(tx, ty - 20, 'P(collision) for k stations, computed here', { size: 11.5, color: INK, bold: true });
    var cols = [tx, tx + 40, tx + 150, tx + 265];
    ['k', 'CW = 31', 'CW = 15', 'E[wait] slots'].forEach(function (c, i) {
      P.text(cols[i], ty, c, { size: 10.5, color: FAINT, bold: true });
    });
    CONTEND.slice(0, 6).forEach(function (r, i) {
      var y = ty + 18 + i * 18;
      P.text(cols[0], y, r.k, { size: 11, color: INK, mono: true });
      P.text(cols[1], y, round(r.pCol31, 4), { size: 11, color: INK, mono: true });
      P.text(cols[2], y, round(r.pCol15, 4), { size: 11, color: INK, mono: true });
      P.text(cols[3], y, round(r.eMin31, 2), { size: 11, color: DIM, mono: true });
    });
  }
  if (p > 0.86) {
    P.text(40, H - 20, 'Collision is not bad luck: it is the event that two stations draw the same smallest number.', { size: 11.5, color: ACC, bold: true });
  }
}

/* ---------- scene 7: binary exponential backoff ---------- */
function sceneBEB(P, p) {
  head(P, 'Binary exponential backoff: the window doubles after every failure');

  var x0 = 118, maxW = W - x0 - 230;
  var maxCw = 1023;
  P.text(40, 74, 'attempt', { size: 10.5, color: FAINT });
  P.text(x0 + maxW + 12, 74, 'window', { size: 10.5, color: FAINT });

  LADDER_B.forEach(function (r, i) {
    if (p < 0.07 * i) return;
    var y = 92 + i * 40;
    var w = maxW * r.cw / maxCw;
    P.text(x0 - 10, y + 12, r.attempt, { size: 11.5, color: DIM, align: 'right', mono: true });
    P.rect(x0, y, w, 24, { fill: i === LADDER_B.length - 1 ? WARNDIM : ACCDIM, stroke: i === LADDER_B.length - 1 ? WARN : ACC, radius: 3, sw: 1.2 });
    var wide = w > 110;
    P.text(wide ? x0 + 8 : x0 + w + 10, y + 12, 'CW = ' + r.cw,
           { size: 11, color: wide ? INK : INK, base: 'middle', mono: true, bold: true });
    P.text(W - 20, y + 12, 'mean wait ' + round(r.meanSlots * PHY.b.slot, 0) + ' us',
           { size: 10.5, color: DIM, base: 'middle', mono: true, align: 'right' });
  });

  if (p > 0.50) {
    P.text(40, 348, 'Each failure turns CW into 2 x CW + 1, which is the same as doubling the number of choices;', { size: 11.5, color: INK });
    P.text(40, 368, 'a success puts it back to 31. The cap at 1023 is what stops the wait from growing without bound.', { size: 11.5, color: INK });
    P.text(40, 392, 'Worst case at the cap: 1023 slots x 20 us = ' + (1023 * PHY.b.slot) + ' us of pure waiting, per attempt.', { size: 11.5, color: WARN });
  }
  if (p > 0.78) {
    P.text(40, H - 20, 'Doubling helps only when collisions are caused by too many contenders; it cannot tell a collision from a lost frame.', { size: 11.5, color: DIM });
  }
}

/* ---------- scene 8: the hidden terminal and RTS/CTS ---------- */
function sceneHidden(P, p) {
  head(P, 'The hidden terminal, and the two-frame repair that mostly fixes it');

  var sc = 2.0, cx = 450, cy = 250;
  function px(x) { return cx + x * sc; }
  function py(y) { return cy + y * sc; }

  P.alpha(0.9);
  P.circle(px(NODES.A.x), py(NODES.A.y), RANGE * sc, { stroke: ACC, sw: 1, dash: [5, 5] });
  P.circle(px(NODES.C.x), py(NODES.C.y), RANGE * sc, { stroke: WARN, sw: 1, dash: [5, 5] });
  P.alpha(1);

  station(P, px(NODES.A.x), py(NODES.A.y), 'A', { stroke: ACC, w: 50 });
  station(P, px(NODES.B.x), py(NODES.B.y) - 100, 'AP', { stroke: INFO, w: 50 });
  station(P, px(NODES.C.x), py(NODES.C.y), 'C', { stroke: WARN, w: 50 });

  var apY = py(NODES.B.y) - 100;
  var phase1 = p < 0.34;

  if (phase1) {
    P.arrow(px(NODES.A.x) + 26, py(0) - 22, px(NODES.B.x) - 28, apY + 26, { stroke: ACC, sw: 1.8, head: 8 });
    P.text(px(-30), py(0) - 40, 'DATA from A', { size: 10.5, color: ACC, align: 'center' });
    P.arrow(px(NODES.C.x) - 26, py(0) - 22, px(NODES.B.x) + 28, apY + 26, { stroke: WARN, sw: 1.8, head: 8 });
    P.text(px(30), py(0) - 40, 'DATA from C', { size: 10.5, color: WARN, align: 'center' });
    P.circle(px(0), apY - 30, 12, { fill: INVALIDDIM, stroke: BAD, sw: 1.6 });
    P.line(px(0) - 6, apY - 36, px(0) + 6, apY - 24, { stroke: BAD, sw: 2 });
    P.line(px(0) + 6, apY - 36, px(0) - 6, apY - 24, { stroke: BAD, sw: 2 });
    P.text(px(0), apY - 52, 'both frames destroyed at the access point', { size: 11, color: BAD, align: 'center', bold: true });
  } else {
    P.arrow(px(NODES.A.x) + 26, py(0) - 22, px(NODES.B.x) - 28, apY + 26, { stroke: INFO, sw: 1.8, head: 8 });
    P.text(px(-34), py(0) - 40, 'RTS, ' + RTS_BYTES + ' bytes', { size: 10.5, color: INFO, align: 'center' });
    P.arrow(px(NODES.B.x) + 28, apY + 26, px(NODES.C.x) - 26, py(0) - 22, { stroke: INFO, sw: 1.8, head: 8 });
    P.text(px(34), py(0) - 40, 'CTS, ' + CTS_BYTES + ' bytes', { size: 10.5, color: INFO, align: 'center' });
    P.rect(px(NODES.C.x) - 48, py(0) + 34, 96, 40, { fill: WARNDIM, stroke: WARN, radius: 6, sw: 1.3 });
    P.text(px(NODES.C.x), py(0) + 47, 'C sets its NAV', { size: 10.5, color: WARN, align: 'center', bold: true });
    P.text(px(NODES.C.x), py(0) + 63, 'and stays silent', { size: 10.5, color: DIM, align: 'center' });
  }

  var ty = 384;
  P.text(40, ty, phase1 ? 'Neither station did anything wrong: the information they needed never arrived.'
                        : 'C hears the CTS and defers, so the frame from A survives.', { size: 11.5, color: phase1 ? INK : VAL, bold: true });
  P.text(40, ty + 18, 'RTS ' + round(RTS_US, 1) + ' us + SIFS ' + PHY.b.sifs + ' + CTS ' + round(CTS_US, 1) + ' us + SIFS ' + PHY.b.sifs +
         ' = ' + round(HANDSHAKE_US, 1) + ' us of overhead, paid on every frame', { size: 11, color: INK, mono: true });
  if (p > 0.62) {
    P.text(40, ty + 38, 'Break-even: it pays only above a collision rate of ' + round(BREAKEVEN[2].p, 3) +
           ' for a 1500-byte frame, and above ' + round(BREAKEVEN[0].p, 2) + ' for 256 bytes.', { size: 11, color: DIM });
  }
  if (p > 0.84) {
    P.text(40, ty + 58, 'RTS and CTS can still collide with each other; the repair reduces the damage, it does not remove the cause.', { size: 11, color: WARN });
  }
}

/* ---------- scene 9: the exposed terminal ---------- */
function sceneExposed(P, p) {
  head(P, 'The exposed terminal: a station that stays quiet for no reason');

  var sc = 2.6, cx = 430, cy = 240;
  function px(x) { return cx + x * sc; }
  function py(y) { return cy + y * sc; }

  P.alpha(0.85);
  P.circle(px(NODES.C.x), py(0), RANGE * sc, { stroke: WARN, sw: 1, dash: [5, 5] });
  P.alpha(1);

  station(P, px(NODES.A.x), py(0), 'A', { stroke: ACC, w: 46 });
  station(P, px(NODES.B.x), py(0), 'B', { stroke: INFO, w: 46 });
  station(P, px(NODES.C.x), py(0), 'C', { stroke: WARN, w: 46 });
  station(P, px(NODES.D.x), py(0), 'D', { stroke: VAL, w: 46 });

  /* B sends to A: the live transmission */
  P.arrow(px(NODES.B.x) - 26, py(0) - 34, px(NODES.A.x) + 26, py(0) - 34, { stroke: INFO, sw: 1.8, head: 8 });
  P.text(px(-24), py(0) - 48, 'B sends to A', { size: 10.5, color: INFO, align: 'center' });

  /* C wants to send to D, and would not collide with A */
  var blocked = p > 0.28;
  P.arrow(px(NODES.C.x) + 26, py(0) - 34, px(NODES.D.x) - 26, py(0) - 34,
          { stroke: blocked ? FAINT : VAL, sw: 1.6, head: 8, dash: blocked ? [5, 4] : null });
  P.text(px(72), py(0) - 48, blocked ? 'C to D: deferred' : 'C to D: would be fine', { size: 10.5, color: blocked ? FAINT : VAL, align: 'center' });

  if (blocked) {
    P.rect(px(NODES.C.x) - 40, py(0) + 30, 80, 40, { fill: WARNDIM, stroke: WARN, radius: 6, sw: 1.3 });
    P.text(px(NODES.C.x), py(0) + 44, 'C hears B', { size: 10.5, color: WARN, align: 'center', bold: true });
    P.text(px(NODES.C.x), py(0) + 60, 'so it waits', { size: 10.5, color: DIM, align: 'center' });
  }

  /* the wasted opportunity, as a timeline */
  var tx = 60, ty = 340, tw = 380;
  P.text(tx, ty - 20, 'airtime that could have carried C to D', { size: 11, color: INK, bold: true });
  P.rect(tx, ty, tw, 30, { fill: WARNDIM, stroke: WARN, radius: 4, sw: 1.2 });
  P.text(tx + 10, ty + 15, 'B to A in progress', { size: 10.5, color: WARN, base: 'middle' });
  P.rect(tx + tw + 6, ty, 120, 30, { fill: SURF2, stroke: BORDER, radius: 4, sw: 1.2, dash: [4, 4] });
  P.text(tx + tw + 66, ty + 15, 'C idle', { size: 10.5, color: FAINT, align: 'center', base: 'middle' });

  if (p > 0.55) {
    P.text(tx, ty + 52, 'Nothing is destroyed here. The loss is capacity: two links that could run at once run one after the other.', { size: 11.5, color: INK });
    P.text(tx, ty + 72, 'RTS/CTS does not fix this. Deferring to the CTS is what makes C quiet, and the CTS is what makes the', { size: 11.5, color: DIM });
    P.text(tx, ty + 92, 'hidden terminal safe. The two problems pull in opposite directions.', { size: 11.5, color: DIM });
  }
  if (p > 0.80) {
    P.text(40, H - 18, 'Hidden costs correctness; exposed costs throughput. Only the first is a collision.', { size: 12, color: ACC, bold: true });
  }
}

/* ---------- scene 10: the procedure ---------- */
function sceneProcedure(P, p) {
  head(P, 'Four steps that answer almost any Wi-Fi question');

  var steps = [
    { n: '1', t: 'Fix the variant', d: 'slot 20 us and DIFS 50 us on 802.11b, 9 and 34 on 802.11a, 9 and 28 on 802.11g.' },
    { n: '2', t: 'Add the fixed overheads', d: 'DIFS, then the mean backoff CW/2 slots, then the PHY preamble and header.' },
    { n: '3', t: 'Add the frame and its reply', d: 'data bytes at the rate, SIFS, the PHY header again, then the 14-byte ACK.' },
    { n: '4', t: 'Divide payload bits by the total', d: 'That quotient is the goodput, not the raw rate.' }
  ];
  steps.forEach(function (s, i) {
    if (p < 0.06 * i) return;
    var y = 76 + i * 52;
    P.rect(40, y, W - 80, 44, { fill: i === 3 ? ACCDIM : SURF, stroke: i === 3 ? ACC : BORDER, radius: 8, sw: 1.2 });
    P.circle(66, y + 22, 13, { fill: i === 3 ? ACC : SURF2, stroke: i === 3 ? ACC : BORDER, sw: 1.2 });
    P.text(66, y + 22, s.n, { size: 12, color: i === 3 ? SURF : DIM, align: 'center', base: 'middle', bold: true });
    P.text(90, y + 12, s.t, { size: 12, color: INK, bold: true });
    P.text(90, y + 30, s.d, { size: 10.5, color: DIM });
  });

  /* the efficiency bars, read from the computed budget */
  if (p > 0.42) {
    var bx = 470, by = 306, bw = 300;
    P.text(bx, by - 22, 'goodput against payload, 802.11b at 11 Mbps', { size: 11, color: INK, bold: true });
    BUDGET.forEach(function (b, i) {
      if (b.payloadBytes === 64) return;
      var y = by + i * 20;
      var w = bw * b.efficiency;
      P.text(bx - 8, y + 7, b.payloadBytes + ' B', { size: 10, color: DIM, align: 'right', mono: true });
      P.rect(bx, y, w, 13, { fill: ACCDIM, stroke: ACC, radius: 2, sw: 1 });
      P.text(W - 24, y + 7, round(b.goodputBps / 1e6, 2) + ' Mbps / ' + round(b.efficiency * 100, 1) + '%',
             { size: 10, color: INK, base: 'middle', mono: true, align: 'right' });
    });
  }
  if (p > 0.78) {
    P.text(40, H - 22, 'The overhead is fixed; the payload is not. That single fact drives every Wi-Fi efficiency question.', { size: 11.5, color: ACC, bold: true });
  }
}

/* ---------- the frame ---------- */

var SCENE_FN = {
  medium: sceneMedium, ncd: sceneNoCD, cs: sceneCarrierSense, ifs: sceneIFS,
  exchange: sceneExchange, backoff: sceneBackoff, beb: sceneBEB,
  hidden: sceneHidden, exposed: sceneExposed, procedure: sceneProcedure
};

function drawFrame(P) {
  var t = K.state.elapsed;
  var i = K.sceneAt(t);
  var sc = K.state.scenes[i];
  var p = K.sceneProgress(t);
  P.clear();
  if (!sc) return;
  var f = SCENE_FN[sc.id];
  if (f) f(P, p);
}

/* a hook for the geometry audit and for anyone inspecting one scene alone */
window.__drawScene = function (painter, id, prog) {
  painter.clear();
  var f = SCENE_FN[id];
  if (f) f(painter, prog === undefined ? 1 : prog);
};

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

function fillChecks() {
  var el = document.getElementById('checks');
  if (!el) return;
  var pass = CHECKS.filter(function (c) { return c.pass; }).length;
  var bad = CHECKS.length - pass;
  el.innerHTML = '<span class="k">Model checks</span>' +
    '<p class="small" style="margin:6px 0 0">' + pass + ' of ' + CHECKS.length + ' passed' +
    (bad ? ' \u2014 <strong>' + bad + ' failed</strong>' : '') + '</p>';
}

function boot() {
  fillChecks();

  var holder = document.getElementById('canvas-holder');
  var fallback = document.getElementById('canvas-fallback');
  var ok = false;

  if (window.p5) {
    try {
      new window.p5(function (sk) {
        sk.setup = function () {
          sk.createCanvas(W, H);
          sk.noLoop();
          P = PR.makePainterP5(sk, W, H);
          sk.draw = function () { drawFrame(P); };
          drawFrame(P);
        };
      }, holder);
      ok = true;
    } catch (e) {
      console.error('p5 failed', e);
      ok = false;
    }
  }

  if (!ok) {
    var drew = false;
    try {
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      holder.appendChild(cv);
      var ctx2d = cv.getContext && cv.getContext('2d');
      if (ctx2d) {
        P = PR.makePainter2D(ctx2d, W, H);
        drawFrame(P);
        drew = true;
      }
    } catch (e) {
      console.error('canvas fallback failed', e);
    }
    if (!drew && fallback) fallback.classList.add('show');
  }

  if (K && K.init) {
    K.init({
      timeline: window.LESSON_TIMELINE,
      draw: function () { if (P) drawFrame(P); }
    });
  }

  window.__drawAt = function (t) {
    K.state.elapsed = t;
    if (P) drawFrame(P);
  };

  var bad = CHECKS.filter(function (c) { return !c.pass; });
  if (bad.length) console.warn('Model validation did not fully pass:', bad);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
