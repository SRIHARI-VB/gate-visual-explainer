/* ==========================================================================
   sliding-window-arq-protocols — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no link arithmetic of its own: every
   figure on the canvas was computed once here and checked against the rule it
   is supposed to satisfy (the utilisation identity, a frame-level simulation of
   Go-Back-N and Selective Repeat against the closed form, and the wrap-around
   test that produces the two sequence-number bounds).
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
  var BADDIM = PAL.invalidDim || '#fbe4e2';

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- 1. the four links ----------
   Tt is the frame size over the link rate. Tp is one-way propagation, given or
   derived from distance and signal speed. a = Tp/Tt and the utilisation of a
   sender allowed W frames in flight is min(1, W/(1+2a)). */

function makeLink(key, label, L, B, Tp, note) {
  var Tt = L / B;
  var a = Tp / Tt;
  var cycle = 1 + 2 * a;
  return {
    key: key, label: label, L: L, B: B, Tp: Tp, Tt: Tt, a: a, cycle: cycle,
    sw: 1 / cycle, minW: Math.ceil(cycle - 1e-12), note: note || '',
    bitsInFlight: (1 + 2 * a) * L
  };
}

var LINKS = [
  makeLink('A', '8000 bits · 1 Mbps · 2000 km', 8000, 1e6, 2000e3 / 2e8,
    'the teaching link: Tt 8 ms, Tp 10 ms'),
  makeLink('B', '3000 bits · 2000 bps · Tp 100 ms', 3000, 2000, 0.100,
    'GATE CSE 2025 Set 2 Q36'),
  makeLink('C', '1000 bits · 100 kbps · Tp 100 ms', 1000, 1e5, 0.100,
    'GATE CSE 2026 Set 1 Q45'),
  makeLink('D', '1000 bytes · Tt 50 us · Tp 200 us', 8000, 8000 / 50e-6, 200e-6,
    'GATE CSE 2003 Q84')
];
var LA = LINKS[0], LB = LINKS[1], LC = LINKS[2], LD = LINKS[3];

function eff(Wn, link) { return Math.min(1, Wn / link.cycle); }

/* the 2023 direction item: eta = L v / (L v + 2 d B) */
var DIR = (function () {
  var L = 1000, v = 2e8;
  var rows = [
    { d: 1e3, B: 1e6, tag: 'short link, low rate' },
    { d: 1e3, B: 1e9, tag: 'short link, high rate' },
    { d: 1e7, B: 1e6, tag: 'long link, low rate' },
    { d: 1e7, B: 1e9, tag: 'long link, high rate' }
  ];
  rows.forEach(function (r) { r.eta = (L * v) / (L * v + 2 * r.d * r.B); });
  var worst = rows.reduce(function (m, r) { return r.eta < m.eta ? r : m; }, rows[0]);
  return { rows: rows, worst: worst, L: L, v: v };
})();

/* ---------- 2. the frame-level ARQ simulation ----------
   One tick is one frame transmission. A frame sent at tick t reaches the
   receiver at t + 1 + p; an acknowledgement sent then reaches the sender p
   ticks later. Timeout is 1 + 2p + 1 after the oldest unacknowledged frame was
   last transmitted. Deterministic: no randomness anywhere. */

function sim(proto, n, Wn, p, dropFrames, maxT) {
  dropFrames = dropFrames || [];
  maxT = maxT || 400000;
  var arrivals = [], acks = [];
  var attempts = {}, delivered = [], buf = {};
  var base = 0, nxt = 0, expected = 0, acked = {}, tx = 0, t = 0;
  var timer = {};
  var timeout = 1 + 2 * p + 1;

  function pushH(h, t2, val) {
    h.push({ t: t2, v: val });
    for (var i = h.length - 1; i > 0; i--) {
      if (h[i - 1].t <= h[i].t) break;
      var tmp = h[i - 1]; h[i - 1] = h[i]; h[i] = tmp;
    }
  }
  function peekT(h) { return h.length ? h[0].t : Infinity; }
  function popH(h) { return h.shift(); }

  while (delivered.length < n && t < maxT) {
    while (acks.length && peekT(acks) <= t) {
      var ak = popH(acks).v;
      if (proto === 'gbn') {
        if (ak >= base) base = ak + 1;
      } else {
        acked[ak] = true;
        while (acked[base]) base += 1;
      }
    }
    while (arrivals.length && peekT(arrivals) <= t) {
      var f = popH(arrivals).v;
      if (proto === 'gbn') {
        if (f === expected) { delivered.push(f); expected += 1; pushH(acks, t + p, f); }
        else { pushH(acks, t + p, expected - 1); }
      } else {
        if (f === expected) {
          delivered.push(f); expected += 1;
          while (buf[expected]) { delete buf[expected]; delivered.push(expected); expected += 1; }
          pushH(acks, t + p, f);
        } else if (f > expected) {
          buf[f] = true; pushH(acks, t + p, f);
        } else {
          pushH(acks, t + p, f);
        }
      }
    }
    var send = null;
    if (nxt < n && nxt < base + Wn) { send = nxt; nxt += 1; }
    else if (base < n && timer[base] !== undefined && t >= timer[base] + timeout) {
      send = base;
      if (proto === 'gbn' && Wn > 1) nxt = base;
      else if (proto === 'gbn') nxt = base + 1;
    }
    if (send !== null) {
      attempts[send] = (attempts[send] || 0) + 1;
      tx += 1;
      timer[send] = t;
      var lost = (attempts[send] === 1 && dropFrames.indexOf(send) >= 0);
      if (!lost) pushH(arrivals, t + 1 + p, send);
    }
    t += 1;
  }
  var unique = {};
  delivered.forEach(function (d) { unique[d] = true; });
  var ordered = true;
  for (var i = 0; i < delivered.length; i++) if (delivered[i] !== i) ordered = false;
  return {
    transmissions: tx, delivered: delivered, elapsed: t,
    unique: Object.keys(unique).length, ordered: ordered,
    duplicates: delivered.length !== Object.keys(unique).length
  };
}

/* error-free runs against the closed form */
var SIMROWS = [];
[3, 10].forEach(function (p) {
  [1, 2, 4, 21].forEach(function (Wn) {
    ['gbn', 'sr'].forEach(function (proto) {
      var r = sim(proto, 2000, Wn, p, []);
      SIMROWS.push({
        proto: proto, p: p, W: Wn,
        sim: r.delivered.length / r.elapsed,
        formula: eff(Wn, { cycle: 1 + 2 * p }),
        tx: r.transmissions, dup: r.duplicates, ordered: r.ordered
      });
    });
  });
});

/* one lost frame, twelve frames to deliver, p = 2 */
var LOSS = {};
[4, 8].forEach(function (Wn) {
  ['gbn', 'sr'].forEach(function (proto) {
    LOSS[proto + Wn] = sim(proto, 12, Wn, 2, [2]);
  });
});

/* ---------- 3. the sequence-number bounds ----------
   GBN: after the receiver has delivered 0..N-1 and every acknowledgement is
   lost, the sender restarts at sequence number 0, and the receiver expects
   N mod 2^m. A duplicate is delivered exactly when N mod 2^m is 0.
   SR: the receiver window after those deliveries is [N, 2N-1] mod 2^m; the
   retransmitted number 0 is accepted exactly when it lies inside that window. */

function gbnFails(m, N) { return (N % Math.pow(2, m)) === 0; }
function srFails(m, N) {
  var space = Math.pow(2, m);
  for (var k = 0; k < N; k++) if (((N + k) % space) === 0) return true;
  return false;
}
function firstFail(fn, m) {
  var space = Math.pow(2, m);
  for (var N = 1; N <= space; N++) if (fn(m, N)) return N;
  return -1;
}

var BOUNDS = [];
[2, 3, 4, 5].forEach(function (m) {
  BOUNDS.push({
    m: m, space: Math.pow(2, m),
    gbnMax: Math.pow(2, m) - 1, gbnFail: firstFail(gbnFails, m),
    srMax: Math.pow(2, m - 1), srFail: firstFail(srFails, m)
  });
});

/* the field width a required window needs */
function bitsFor(Wn, proto) {
  for (var m = 1; m <= 16; m++) {
    var max = proto === 'gbn' ? Math.pow(2, m) - 1 : Math.pow(2, m - 1);
    if (max >= Wn) return m;
  }
  return -1;
}
var BITS21 = { gbn: bitsFor(LC.minW, 'gbn'), sr: bitsFor(LC.minW, 'sr') };

var V = {
  links: LINKS, LA: LA, LB: LB, LC: LC, LD: LD,
  dir: DIR, simrows: SIMROWS, loss: LOSS, bounds: BOUNDS, bits21: BITS21,
  eff: eff
};

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

LINKS.forEach(function (k) {
  chk('Tt = L / B for link ' + k.key, Math.abs(k.Tt - k.L / k.B) < 1e-12, k.Tt);
  chk('a = Tp / Tt and the cycle is 1 + 2a for link ' + k.key,
    Math.abs(k.cycle - (1 + 2 * k.Tp / k.Tt)) < 1e-12, k.cycle);
  chk('stop-and-wait efficiency is 1/(1+2a) for link ' + k.key,
    Math.abs(k.sw - 1 / k.cycle) < 1e-12, k.sw);
  chk('the minimum window for full use is the ceiling of 1+2a, link ' + k.key,
    k.minW >= k.cycle - 1e-12 && k.minW - 1 < k.cycle + 1e-12, k.minW);
  chk('that window reaches efficiency 1 and one less does not, link ' + k.key,
    eff(k.minW, k) >= 1 - 1e-12 && (k.minW === 1 || eff(k.minW - 1, k) < 1 - 1e-12),
    k.minW + ' / ' + (k.minW - 1));
});

SIMROWS.forEach(function (r) {
  chk('simulated utilisation matches the closed form, ' + r.proto + ' p=' + r.p + ' W=' + r.W,
    Math.abs(r.sim - r.formula) < 0.01, r.sim.toFixed(5) + ' vs ' + r.formula.toFixed(5));
});
chk('no error-free run delivers a duplicate',
  SIMROWS.every(function (r) { return !r.dup; }));
chk('every error-free run delivers in order',
  SIMROWS.every(function (r) { return r.ordered; }));

[4, 8].forEach(function (Wn) {
  var g = LOSS['gbn' + Wn], s = LOSS['sr' + Wn];
  chk('one loss in twelve frames: both protocols deliver twelve, in order, at W=' + Wn,
    g.delivered.length === 12 && s.delivered.length === 12 && g.ordered && s.ordered);
  chk('Go-Back-N transmits more than Selective Repeat after a loss at W=' + Wn,
    g.transmissions > s.transmissions, g.transmissions + ' > ' + s.transmissions);
  chk('Selective Repeat pays exactly one retransmission at W=' + Wn,
    s.transmissions === 13, s.transmissions);
});
chk('Go-Back-N retransmission cost grows with the window',
  LOSS.gbn8.transmissions > LOSS.gbn4.transmissions,
  LOSS.gbn4.transmissions + ' then ' + LOSS.gbn8.transmissions);

BOUNDS.forEach(function (b) {
  chk('Go-Back-N first fails at exactly 2^m, m=' + b.m, b.gbnFail === b.space, b.gbnFail);
  chk('Go-Back-N is safe at 2^m - 1, m=' + b.m,
    !gbnFails(b.m, b.gbnMax), b.gbnMax);
  chk('Selective Repeat first fails one above 2^(m-1), m=' + b.m,
    b.srFail === b.srMax + 1, b.srFail);
  chk('Selective Repeat is safe at 2^(m-1), m=' + b.m, !srFails(b.m, b.srMax), b.srMax);
});

chk('GATE 2025 Set 2 Q36 utilisation is 88.24 per cent',
  Math.abs(100 * LB.sw - 88.2353) < 0.001, (100 * LB.sw).toFixed(4));
chk('GATE 2026 Set 1 Q45 minimum window is 21', LC.minW === 21, LC.minW);
chk('GATE 2003 Q84 throughput is 11.11 MB per second',
  Math.abs((5 / LD.cycle) * ((LD.L / 8) / LD.Tt) / 1e6 - 11.1111) < 0.001,
  ((5 / LD.cycle) * ((LD.L / 8) / LD.Tt) / 1e6).toFixed(4));
chk('GATE 2023 Q7: the long link at the high rate is the lowest utilisation',
  DIR.worst.d === 1e7 && DIR.worst.B === 1e9, DIR.worst.eta.toFixed(6));
chk('GATE 2023 Q7: efficiency falls as distance rises at fixed rate',
  DIR.rows[2].eta < DIR.rows[0].eta && DIR.rows[3].eta < DIR.rows[1].eta);
chk('GATE 2023 Q7: efficiency falls as rate rises at fixed distance',
  DIR.rows[1].eta < DIR.rows[0].eta && DIR.rows[3].eta < DIR.rows[2].eta);

chk('a window of 21 needs 5 sequence bits under Go-Back-N', BITS21.gbn === 5, BITS21.gbn);
chk('a window of 21 needs 6 sequence bits under Selective Repeat', BITS21.sr === 6, BITS21.sr);

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function f2(v) { return (Math.round(v * 100) / 100).toFixed(2); }
function pct(v) { return (Math.round(v * 10000) / 100).toFixed(2) + '%'; }

/* the four beats of a scene, at 7.5 second spacing */
function beat(t, sc, i) {
  var start = sc.start + i * 7.5;
  return K.clamp01((t - start) / 0.7);
}

function T(x, y, s, o) { P.text(x, y, s, o || {}); }

function box(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, {
    fill: o.fill === undefined ? SURF2 : o.fill,
    stroke: o.stroke === undefined ? BORDER : o.stroke,
    sw: o.sw || 1.2, radius: o.radius === undefined ? 6 : o.radius
  });
}

function arrow(x1, y1, x2, y2, colour) {
  P.arrow(x1, y1, x2, y2, { stroke: colour || BORDER, sw: 1.4, head: 8 });
}

function heading(s) { T(40, 20, s, { size: 13, bold: true }); }

/* a labelled horizontal bar: value in 0..1 */
function bar(x, y, w, h, value, colour, label) {
  box(x, y, w, h, { fill: SURF, stroke: BORDER });
  P.rect(x, y, Math.max(0, Math.min(1, value)) * w, h,
    { fill: colour || ACCDIM, stroke: colour || ACC, sw: 1 });
  if (label) T(x + w + 8, y + 2, label, { size: 10, color: DIM });
}

/* ============================ scene 1 ============================ */

function drawWaiting(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);
  heading('One frame at a time, and the empty pipe');

  P.alpha(b0);
  var facts = [
    ['frame L', '8000 bits'],
    ['link rate B', '1 Mbps'],
    ['one-way Tp', '10 ms']
  ];
  facts.forEach(function (f, i) {
    var x = 40 + i * 168;
    box(x, 44, 156, 40, { fill: SURF });
    T(x + 10, 52, f[0], { size: 10, color: FAINT });
    T(x + 10, 66, f[1], { size: 12, bold: true });
  });

  /* the cycle as a bar: Tt = 8 ms, then 2Tp = 20 ms */
  P.alpha(b1);
  var x0 = 60, scale = 780 / 28;
  var wTx = 8 * scale, wIdle = 20 * scale;
  box(x0, 110, wTx, 40, { fill: ACCDIM, stroke: ACC });
  T(x0 + 10, 118, 'Tt = 8 ms', { size: 11, bold: true, color: ACC });
  T(x0 + 10, 133, 'frame on the wire', { size: 10, color: DIM });
  box(x0 + wTx, 110, wIdle, 40, { fill: WARNDIM, stroke: WARN });
  T(x0 + wTx + 14, 118, '2 Tp = 20 ms: waiting for the acknowledgement', { size: 11, bold: true, color: WARN });
  T(x0 + wTx + 14, 133, 'the link carries nothing at all', { size: 10, color: DIM });
  P.line(x0, 100, x0, 158, { stroke: BORDER, sw: 1 });
  P.line(x0 + wTx + wIdle, 100, x0 + wTx + wIdle, 158, { stroke: BORDER, sw: 1 });
  T(x0, 162, '0', { size: 9, color: FAINT });
  T(x0 + wTx + wIdle, 162, '28 ms', { size: 9, color: FAINT, align: 'right' });

  P.alpha(b2);
  box(40, 186, 820, 74, { fill: SURF });
  T(56, 196, 'Efficiency = useful time / cycle time', { size: 11, bold: true });
  T(56, 214, 'η = Tt / (Tt + 2 Tp) = 8 / 28 = 0.2857', { size: 13, mono: true, color: ACC });
  T(56, 238, 'written with a = Tp / Tt = 1.25:   η = 1 / (1 + 2a) = 1 / 3.5 = 0.2857', { size: 11, mono: true, color: DIM });

  P.alpha(b3);
  bar(40, 286, 620, 26, LA.sw, ACCDIM, '');
  T(40, 268, 'the fraction of the link that carries data', { size: 11, bold: true });
  T(672, 290, pct(LA.sw), { size: 14, bold: true, color: ACC });
  T(40, 326, '28.57% used, 71.43% idle. The idle stretch is exactly the time a frame spends travelling,',
    { size: 11, color: DIM });
  T(40, 342, 'so it can be filled with more frames. That is the whole idea of a window.',
    { size: 11, color: DIM });

  P.alpha(b3);
  box(40, 366, 820, 46, { fill: SURF });
  T(56, 376, 'What the two delays are', { size: 11, bold: true });
  T(56, 394, 'Tt = L / B: how long the sender holds the wire.  Tp = distance / speed: how long a bit takes to cross.',
    { size: 10, color: DIM });
  P.alpha(1);
}

/* ============================ scene 2 ============================ */

function drawWindow(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);
  heading('The window: several frames in flight');

  var Wn = 4, space = 8;
  var base = Math.min(4, Math.floor(K.clamp01((t - sc.start - 10) / 12) * 4));

  P.alpha(b0);
  T(40, 46, 'sender window, W = 4 of 8 sequence numbers', { size: 11, bold: true });
  for (var i = 0; i < space; i++) {
    var x = 40 + i * 52, inside = (i >= base && i < base + Wn);
    box(x, 56, 44, 34, {
      fill: inside ? ACCDIM : SURF,
      stroke: inside ? ACC : BORDER,
      sw: inside ? 1.8 : 1
    });
    T(x + 22, 66, String(i), { size: 12, mono: true, align: 'center', color: inside ? ACC : DIM });
  }
  T(40, 98, 'base = ' + base + ', may send up to ' + (base + Wn - 1), { size: 10, color: DIM });
  T(300, 98, 'an acknowledgement slides the window by one', { size: 10, color: ACC });

  P.alpha(b1);
  T(40, 120, 'receiver window: one frame for Go-Back-N, W frames for Selective Repeat', { size: 11, bold: true });
  for (var j = 0; j < space; j++) {
    var x2 = 40 + j * 52, exp = (j === base);
    box(x2, 130, 44, 28, { fill: exp ? WARNDIM : SURF, stroke: exp ? WARN : BORDER });
    T(x2 + 22, 137, String(j), { size: 11, mono: true, align: 'center', color: exp ? WARN : FAINT });
  }
  T(480, 137, 'Go-Back-N accepts only the expected number', { size: 10, color: DIM });

  P.alpha(b2);
  box(40, 180, 400, 60, { fill: SURF });
  T(54, 190, 'W frames per cycle of 1 + 2a', { size: 11, bold: true });
  T(54, 208, 'η = min(1, W / (1 + 2a))', { size: 13, mono: true, color: ACC });
  T(54, 228, 'capped at 1: a link cannot be more than full', { size: 10, color: DIM });

  P.alpha(b2);
  T(480, 190, 'on link A, 1 + 2a = 3.5', { size: 11, bold: true });
  var ws = [1, 2, 3, 4, 5];
  ws.forEach(function (wv, i) {
    var e = eff(wv, LA);
    var bx = 480 + i * 74, bh = 130;
    var by = 330 - e * bh;
    P.alpha(b2 * (b3 > 0 ? 1 : 1));
    P.rect(bx, by, 40, e * bh, { fill: e >= 1 ? ACCDIM : SURF2, stroke: e >= 1 ? ACC : BORDER, sw: 1.2 });
    T(bx + 20, by - 15, e.toFixed(3), { size: 9, mono: true, align: 'center', color: e >= 1 ? ACC : DIM });
    T(bx + 20, 336, 'W=' + wv, { size: 10, align: 'center', color: DIM });
  });
  P.line(470, 330, 860, 330, { stroke: BORDER, sw: 1 });
  P.alpha(b3);
  T(480, 356, '3 gives 0.857; 4 gives more than one, so the cap makes it exactly 1.', { size: 10, color: DIM });
  T(480, 372, 'The window that saturates is the ceiling, never the floor.', { size: 10, bold: true, color: ACC });

  P.alpha(b3);
  box(40, 258, 400, 62, { fill: SURF });
  T(54, 268, 'What separates the protocols', { size: 11, bold: true });
  T(54, 286, 'stop-and-wait: both windows 1', { size: 10, color: DIM });
  T(54, 300, 'Go-Back-N: sender W, receiver 1', { size: 10, color: DIM });
  T(54, 314, 'Selective Repeat: both windows W', { size: 10, color: DIM });

  P.alpha(b3);
  box(40, 336, 400, 44, { fill: WARNDIM, stroke: WARN });
  T(54, 346, 'The two windows are equal only in Selective Repeat.', { size: 10, bold: true, color: WARN });
  T(54, 362, 'A question that gives one window size and asks about buffers is asking which.', { size: 10, color: DIM });
  P.alpha(1);
}

/* ============================ scene 3 ============================ */

function drawCounted(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);
  heading('Stop-and-wait, counted twice');

  P.alpha(b0);
  box(40, 44, 380, 100, { fill: SURF });
  T(54, 54, 'GATE CSE 2025 Set 2, Q36', { size: 11, bold: true, color: ACC });
  T(54, 74, 'frame 3000 bits · rate 2000 bps', { size: 11, mono: true });
  T(54, 90, 'one-way delay 100 ms · ACK negligible', { size: 11, mono: true });
  T(54, 110, 'asks for channel utilisation', { size: 10, color: DIM });
  T(54, 128, 'three numbers, one formula', { size: 10, color: FAINT });

  P.alpha(b1);
  var steps = [
    ['Tt = 3000 / 2000', '= 1500 ms'],
    ['2 Tp = 2 × 100 ms', '= 200 ms'],
    ['cycle', '= 1700 ms'],
    ['η = 1500 / 1700', '= 0.88235']
  ];
  steps.forEach(function (s, i) {
    var y = 164 + i * 30;
    P.alpha(b1);
    T(54, y, s[0], { size: 11, mono: true, color: DIM });
    T(258, y, s[1], { size: 11, mono: true, bold: i === 3, color: i === 3 ? ACC : INK });
  });

  P.alpha(b1);
  bar(40, 300, 300, 22, LB.sw, ACCDIM, '');
  T(352, 304, pct(LB.sw), { size: 13, bold: true, color: ACC });
  T(40, 330, 'The distractor is 1500 / 1600 = 93.75%,', { size: 10, color: DIM });
  T(40, 346, 'from counting one propagation delay.', { size: 10, color: DIM });

  P.alpha(b2);
  box(470, 44, 390, 96, { fill: SURF });
  T(484, 54, 'GATE CSE 2023, Q7', { size: 11, bold: true, color: ACC });
  T(484, 74, 'Which scenario gives the LOWEST', { size: 11 });
  T(484, 90, 'utilisation? No number needed.', { size: 11 });
  T(484, 112, 'η = L v / (L v + 2 d B)', { size: 12, mono: true, color: ACC });
  T(484, 130, 'substitute Tt = L/B and Tp = d/v into 1/(1+2a)', { size: 9, color: FAINT });

  P.alpha(b2);
  T(470, 162, 'the same formula, four scenarios (L = 1000 bits, v = 2×10⁸ m/s)', { size: 10, bold: true });
  DIR.rows.forEach(function (r, i) {
    var y = 176 + i * 30;
    var worst = (r === DIR.worst);
    P.alpha(b2);
    box(470, y, 390, 26, { fill: worst ? BADDIM : SURF, stroke: worst ? BAD : BORDER });
    T(482, y + 7, r.tag, { size: 10, color: worst ? BAD : DIM });
    T(690, y + 7, (r.d / 1e3) + ' km · ' + (r.B / 1e6) + ' Mbps', { size: 9, mono: true, color: FAINT });
    T(846, y + 6, pct(r.eta), { size: 10, mono: true, align: 'right', bold: worst, color: worst ? BAD : INK });
  });

  P.alpha(b3);
  box(470, 306, 390, 62, { fill: SURF });
  T(484, 316, 'Both changes enlarge the idle stretch', { size: 11, bold: true });
  T(484, 334, 'a higher rate halves Tt, so a doubles; a longer link doubles Tp.', { size: 10, color: DIM });
  T(484, 350, 'Neither changes the frame, so the fraction used falls.', { size: 10, color: DIM });
  T(470, 382, 'Answer: longer link, higher rate — the long fast link.', { size: 11, bold: true, color: ACC });
  P.alpha(1);
}

/* ============================ scene 4 ============================ */

function drawMinWindow(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);
  heading('The smallest window that fills the link');

  P.alpha(b0);
  box(40, 44, 820, 62, { fill: SURF });
  T(54, 54, 'GATE CSE 2026 Set 1, Q45', { size: 11, bold: true, color: ACC });
  T(54, 74, 'frame 1000 bits · rate 100 kbps · one-way delay 100 ms · ACK and processing negligible', { size: 11, mono: true });
  T(54, 92, 'asks for the minimum window W that gives 100% utilisation — the formula, inverted', { size: 10, color: DIM });

  P.alpha(b1);
  var facts = [['Tt = 1000 / 10⁵', '10 ms'], ['Tp', '100 ms'], ['a = Tp / Tt', '10'], ['1 + 2a', '21']];
  facts.forEach(function (f, i) {
    var x = 40 + i * 205;
    box(x, 122, 190, 44, { fill: i === 3 ? ACCDIM : SURF, stroke: i === 3 ? ACC : BORDER });
    T(x + 10, 130, f[0], { size: 10, mono: true, color: DIM });
    T(x + 10, 146, f[1], { size: 13, mono: true, bold: true, color: i === 3 ? ACC : INK });
  });

  /* the pipe, as 21 frame slots */
  P.alpha(b2);
  T(40, 184, 'the pipe holds 21 frames: one being sent plus 20 in the round trip', { size: 11, bold: true });
  for (var i = 0; i < 21; i++) {
    var x2 = 40 + i * 39;
    var shown = i < Math.min(21, Math.floor(K.clamp01((t - sc.start - 16) / 8) * 22));
    P.alpha(b2 * (shown ? 1 : 0.18));
    box(x2, 194, 34, 26, { fill: i === 0 ? ACCDIM : SURF2, stroke: i === 0 ? ACC : BORDER });
    T(x2 + 17, 200, String(i), { size: 9, mono: true, align: 'center', color: i === 0 ? ACC : DIM });
  }
  P.alpha(b2);
  T(40, 228, '20 leaves the link idle for one frame time in every 21; 21 fills it exactly.',
    { size: 10, color: DIM });

  P.alpha(b2);
  var ws = [18, 19, 20, 21, 22];
  T(40, 258, 'efficiency against window size on this link (η = min(1, W / 21))', { size: 10, bold: true });
  ws.forEach(function (wv, i) {
    var e = eff(wv, LC);
    var bx = 40 + i * 84, bh = 96, by = 396 - e * bh;
    P.alpha(b2);
    P.rect(bx, by, 46, e * bh, { fill: e >= 1 ? ACCDIM : SURF2, stroke: e >= 1 ? ACC : BORDER, sw: 1.2 });
    T(bx + 23, by - 14, e.toFixed(3), { size: 9, mono: true, align: 'center', color: e >= 1 ? ACC : DIM });
    T(bx + 23, 402, 'W=' + wv, { size: 10, align: 'center', color: DIM });
  });
  P.line(30, 396, 470, 396, { stroke: BORDER, sw: 1 });

  P.alpha(b3);
  box(500, 258, 360, 62, { fill: SURF });
  T(514, 268, 'When 1 + 2a is not whole, round up', { size: 11, bold: true });
  T(514, 286, 'link A: 1 + 2a = 3.5, so W = 4, not 3.', { size: 10, color: DIM });
  T(514, 302, 'W = 3 gives 0.857; W = 4 gives 1.', { size: 10, color: DIM });

  P.alpha(b3);
  box(500, 332, 360, 64, { fill: ACCDIM, stroke: ACC });
  T(514, 342, 'The window is the bandwidth-delay product', { size: 11, bold: true, color: ACC });
  T(514, 360, '21 frames × 1000 bits = 21000 bits in flight.', { size: 10, color: DIM });
  T(514, 376, 'That is the data a round trip can hold.', { size: 10, color: DIM });
  P.alpha(1);
}

/* ============================ scenes 5 and 6: one trace, two protocols ==== */

function drawTrace(t, sc, proto) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);
  heading(proto === 'gbn' ? 'Go-Back-N: discard, then resend the tail'
                          : 'Selective Repeat: buffer, then resend one');

  var n = 12, bw = 46, gap = 4, x0 = 40;
  var lost = 2;

  /* row 1: the frames the sender puts on the wire */
  P.alpha(b0);
  T(x0, 44, 'sender transmits 12 frames, window 4 · frame 2 is lost', { size: 11, bold: true });
  for (var i = 0; i < n; i++) {
    var x = x0 + i * (bw + gap);
    var isLost = (i === lost);
    box(x, 54, bw, 28, { fill: isLost ? BADDIM : SURF, stroke: isLost ? BAD : BORDER });
    T(x + bw / 2, 60, String(i), { size: 11, mono: true, align: 'center', color: isLost ? BAD : DIM });
    if (isLost) {
      P.line(x + 8, 82, x + bw - 8, 54, { stroke: BAD, sw: 1.6 });
    }
  }
  T(x0 + n * (bw + gap) + 6, 60, 'lost', { size: 10, color: BAD, bold: true });

  /* row 2: what the receiver does */
  P.alpha(b1);
  T(x0, 100, proto === 'gbn'
    ? 'receiver expects 2, so 3 and 4 are discarded'
    : 'receiver expects 2, so 3 and 4 are buffered and acknowledged', { size: 11, bold: true });
  for (var j = 0; j < n; j++) {
    var xj = x0 + j * (bw + gap);
    var kind = j < 2 ? 'ok' : j === 2 ? 'gap' : j < 6 ? 'after' : 'later';
    var fill = kind === 'ok' ? ACCDIM : kind === 'gap' ? BADDIM : (kind === 'after' ? (proto === 'gbn' ? BADDIM : WARNDIM) : SURF);
    var stroke = kind === 'ok' ? ACC : kind === 'gap' ? BAD : (kind === 'after' ? (proto === 'gbn' ? BAD : WARN) : BORDER);
    var vis = kind === 'later' ? 0.35 : 1;
    P.alpha(b1 * vis);
    box(xj, 110, bw, 26, { fill: fill, stroke: stroke });
    T(xj + bw / 2, 115, String(j), { size: 10, mono: true, align: 'center', color: kind === 'gap' ? BAD : DIM });
  }
  P.alpha(b1);
  T(x0, 144, proto === 'gbn' ? 'delivered: 0, 1 · thrown away: 3, 4'
                             : 'delivered: 0, 1 · held in the buffer: 3, 4', { size: 10, color: DIM });

  /* row 3: the retransmission */
  P.alpha(b2);
  T(x0, 178, proto === 'gbn' ? 'timeout on 2, so the whole window is sent again: 2, 3, 4, 5'
                             : 'timeout on 2 only, so just 2 is sent again', { size: 11, bold: true });
  var resend = proto === 'gbn' ? [2, 3, 4, 5] : [2];
  resend.forEach(function (f, k) {
    var xr = x0 + k * (bw + gap);
    P.alpha(b2);
    box(xr, 188, bw, 26, { fill: WARNDIM, stroke: WARN });
    T(xr + bw / 2, 193, String(f), { size: 10, mono: true, align: 'center', color: WARN });
  });
  P.alpha(b2);
  T(x0 + resend.length * (bw + gap) + 8, 193,
    proto === 'gbn' ? 'four frames for one loss' : 'one frame for one loss', { size: 10, color: WARN });

  /* the count panel */
  P.alpha(b3);
  var g4 = LOSS.gbn4.transmissions, s4 = LOSS.sr4.transmissions;
  var g8 = LOSS.gbn8.transmissions, s8 = LOSS.sr8.transmissions;
  box(40, 232, 400, 96, { fill: SURF });
  T(54, 242, 'transmissions to deliver 12 frames, one loss', { size: 11, bold: true });
  T(54, 262, 'window 4:  Go-Back-N ' + g4 + '   Selective Repeat ' + s4, { size: 11, mono: true });
  T(54, 280, 'window 8:  Go-Back-N ' + g8 + '   Selective Repeat ' + s8, { size: 11, mono: true });
  T(54, 300, proto === 'gbn' ? 'the cost of one loss grows with the window'
                             : 'the cost of one loss is exactly one frame', { size: 10, color: DIM });
  T(54, 316, 'both deliver the twelve frames exactly once, in order', { size: 10, color: FAINT });

  P.alpha(b3);
  box(460, 232, 400, 96, { fill: SURF });
  T(474, 242, proto === 'gbn' ? 'what Go-Back-N saves' : 'what Selective Repeat costs', { size: 11, bold: true });
  if (proto === 'gbn') {
    T(474, 262, 'receiver buffer: 1 frame', { size: 10, color: DIM });
    T(474, 278, 'sender timers: 1, for the oldest frame', { size: 10, color: DIM });
    T(474, 294, 'nothing ever arrives out of order', { size: 10, color: DIM });
    T(474, 312, 'no reassembly, no reordering logic', { size: 10, color: DIM });
  } else {
    T(474, 262, 'receiver buffer: W frames', { size: 10, color: DIM });
    T(474, 278, 'a timer per outstanding frame', { size: 10, color: DIM });
    T(474, 294, 'frames arrive out of order by design', { size: 10, color: DIM });
    T(474, 312, 'delivery must wait for the gap to fill', { size: 10, color: DIM });
  }

  P.alpha(b3);
  box(40, 340, 820, 44, { fill: WARNDIM, stroke: WARN });
  T(54, 350, proto === 'gbn'
    ? 'Trap: the duplicated acknowledgement of frame 1 does not name the lost frame. It only says frame 1 arrived.'
    : 'Trap: the receiver does not deliver 3 and 4 as they arrive. It holds them until 2 fills the gap.', { size: 10, color: WARN });
  T(54, 368, 'In both protocols the sender keeps a copy of every unacknowledged frame; only the receiver side differs.',
    { size: 10, color: DIM });
  P.alpha(1);
}

function drawGbn(t, sc) { drawTrace(t, sc, 'gbn'); }
function drawSr(t, sc) { drawTrace(t, sc, 'sr'); }

/* ============================ scene 7 ============================ */

function drawGbnBound(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);
  heading('Why Go-Back-N stops at two-to-the-m minus one');

  var space = 8;
  P.alpha(b0);
  T(40, 44, 'm = 3 sequence bits give 8 numbers, 0 to 7, and then they repeat', { size: 11, bold: true });
  for (var i = 0; i < space; i++) {
    var x = 40 + i * 52;
    box(x, 54, 44, 30, { fill: SURF2, stroke: BORDER });
    T(x + 22, 61, String(i), { size: 11, mono: true, align: 'center', color: DIM });
  }

  P.alpha(b1);
  T(40, 100, 'batch 1: frames 0 to 7, all delivered and acknowledged', { size: 10, color: DIM });
  for (var j = 0; j < space; j++) {
    var x1 = 40 + j * 52;
    box(x1, 110, 44, 24, { fill: ACCDIM, stroke: ACC });
    T(x1 + 22, 114, String(j), { size: 10, mono: true, align: 'center', color: ACC });
  }
  P.alpha(b1);
  T(40, 146, 'batch 2: the next eight frames reuse the same eight numbers', { size: 10, color: DIM });
  for (var k = 0; k < space; k++) {
    var x2 = 40 + k * 52;
    box(x2, 156, 44, 24, { fill: WARNDIM, stroke: WARN });
    T(x2 + 22, 160, String(k), { size: 10, mono: true, align: 'center', color: WARN });
  }

  P.alpha(b2);
  arrow(62, 210, 62, 184, BAD);
  T(72, 194, 'a late acknowledgement "0" arrives', { size: 10, bold: true, color: BAD });
  T(72, 210, 'it could belong to batch 1 or to batch 2', { size: 10, color: DIM });
  T(72, 226, 'with a window of 8 the sender cannot tell which', { size: 10, color: DIM });

  P.alpha(b2);
  box(40, 244, 420, 52, { fill: ACCDIM, stroke: ACC });
  T(54, 254, 'so one number is held back', { size: 11, bold: true, color: ACC });
  T(54, 274, 'N ≤ 2^m − 1, which is 7 for three bits', { size: 12, mono: true, color: ACC });

  /* the computed table */
  P.alpha(b3);
  T(500, 44, 'every window tested, the first failure found by computation', { size: 10, bold: true });
  var cols = [500, 578, 668, 780];
  ['m', 'numbers', 'safe N', 'first failure'].forEach(function (h, i) {
    T(cols[i], 62, h, { size: 9, bold: true, color: FAINT });
  });
  P.line(496, 74, 860, 74, { stroke: BORDER, sw: 1 });
  BOUNDS.forEach(function (b, i) {
    var y = 82 + i * 26;
    P.alpha(b3);
    T(cols[0], y, String(b.m), { size: 10, mono: true });
    T(cols[1], y, String(b.space), { size: 10, mono: true });
    T(cols[2], y, String(b.gbnMax), { size: 10, mono: true, color: ACC, bold: true });
    T(cols[3], y, String(b.gbnFail), { size: 10, mono: true, color: BAD, bold: true });
  });
  P.alpha(b3);
  T(500, 196, 'the first failure is always 2^m: 4, 8, 16, 32', { size: 10, color: DIM });
  T(500, 212, 'so the largest safe window is one less', { size: 10, color: DIM });

  P.alpha(b3);
  box(500, 244, 360, 52, { fill: SURF });
  T(514, 254, 'the ambiguity is at the sender', { size: 10, bold: true });
  T(514, 272, 'the receiver window is one frame wide and cannot', { size: 10, color: DIM });
  T(514, 286, 'confuse anything: it accepts only what it expects', { size: 10, color: DIM });

  P.alpha(1);
}

/* ============================ scene 8 ============================ */

function drawSrBound(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);
  heading('Why Selective Repeat stops at two-to-the-m minus one');

  var space = 8, N = 5;
  P.alpha(b0);
  T(40, 44, 'two windows in one sequence space: the sender has one, the receiver has one', { size: 11, bold: true });

  function ring(cx, cy, r, active, label, colour) {
    for (var i = 0; i < space; i++) {
      var ang = -Math.PI / 2 + i * 2 * Math.PI / space;
      var x = cx + r * Math.cos(ang), y = cy + r * Math.sin(ang);
      var on = active.indexOf(i) >= 0;
      P.circle(x, y, 15, { fill: on ? colour.fill : SURF, stroke: on ? colour.stroke : BORDER, sw: on ? 1.8 : 1 });
      T(x, y - 6, String(i), { size: 10, mono: true, align: 'center', color: on ? colour.stroke : FAINT });
    }
    T(cx, cy + r + 26, label, { size: 10, align: 'center', color: DIM });
  }

  P.alpha(b1);
  ring(140, 150, 58, [5, 6, 7, 0, 1], 'receiver window at N = 5: 5, 6, 7, 0, 1',
    { fill: BADDIM, stroke: BAD });
  ring(340, 150, 58, [0, 1, 2, 3, 4], 'sender restarts at 0', { fill: WARNDIM, stroke: WARN });

  P.alpha(b2);
  T(432, 74, 'Number 0 is inside both circles.', { size: 10, bold: true, color: BAD });
  T(432, 92, 'The retransmitted frame 0 looks', { size: 10, color: DIM });
  T(432, 106, 'new, so it is accepted and', { size: 10, color: DIM });
  T(432, 120, 'delivered a second time.', { size: 10, color: DIM });
  T(432, 142, 'This is the duplicate the', { size: 10, color: DIM });
  T(432, 156, 'bound prevents.', { size: 10, color: DIM });

  P.alpha(b2);
  ring(736, 150, 54, [4, 5, 6, 7], 'receiver window at N = 4: 4, 5, 6, 7',
    { fill: ACCDIM, stroke: ACC });
  P.alpha(b2);
  T(736, 254, 'Stops one short of 0, so the', { size: 10, align: 'center', color: DIM });
  T(736, 268, 'retransmission is recognised as old.', { size: 10, align: 'center', color: DIM });

  P.alpha(b3);
  box(40, 300, 420, 74, { fill: ACCDIM, stroke: ACC });
  T(54, 310, 'the sequence space must hold two windows', { size: 11, bold: true, color: ACC });
  T(54, 330, '2N ≤ 2^m, so N ≤ 2^(m−1)', { size: 13, mono: true, color: ACC });
  T(54, 352, 'half the space: 2, 4, 8, 16 for two to five bits', { size: 10, color: DIM });

  P.alpha(b3);
  var cols = [500, 578, 668, 780];
  T(500, 300, 'the same test, computed for Selective Repeat', { size: 10, bold: true });
  ['m', 'numbers', 'safe N', 'first failure'].forEach(function (h, i) {
    T(cols[i], 318, h, { size: 9, bold: true, color: FAINT });
  });
  P.line(496, 330, 860, 330, { stroke: BORDER, sw: 1 });
  BOUNDS.forEach(function (b, i) {
    var y = 338 + i * 22;
    P.alpha(b3);
    T(cols[0], y, String(b.m), { size: 10, mono: true });
    T(cols[1], y, String(b.space), { size: 10, mono: true });
    T(cols[2], y, String(b.srMax), { size: 10, mono: true, color: ACC, bold: true });
    T(cols[3], y, String(b.srFail), { size: 10, mono: true, color: BAD, bold: true });
  });
  P.alpha(1);
}

/* ============================ scene 9 ============================ */

function drawCost(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);
  heading('What the receiver buffer costs, and what it saves');

  var g4 = LOSS.gbn4, s4 = LOSS.sr4, g8 = LOSS.gbn8, s8 = LOSS.sr8;

  /* --- left: transmissions, as four bars on one baseline --- */
  P.alpha(b0);
  T(40, 44, 'transmissions to deliver 12 frames, one loss', { size: 11, bold: true });
  var groups = [
    { label: 'window 4', a: g4.transmissions, b: s4.transmissions, x: 70 },
    { label: 'window 8', a: g8.transmissions, b: s8.transmissions, x: 250 }
  ];
  var maxTx = 22, baseY = 178, maxH = 104;
  groups.forEach(function (g) {
    var ha = (g.a / maxTx) * maxH, hb = (g.b / maxTx) * maxH;
    P.alpha(b0);
    P.rect(g.x, baseY - ha, 56, ha, { fill: WARNDIM, stroke: WARN, sw: 1.2 });
    T(g.x + 28, baseY - ha - 15, String(g.a), { size: 11, mono: true, align: 'center', bold: true, color: WARN });
    T(g.x + 28, baseY + 5, 'GBN', { size: 9, align: 'center', color: DIM });
    P.rect(g.x + 66, baseY - hb, 56, hb, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
    T(g.x + 94, baseY - hb - 15, String(g.b), { size: 11, mono: true, align: 'center', bold: true, color: ACC });
    T(g.x + 94, baseY + 5, 'SR', { size: 9, align: 'center', color: DIM });
    T(g.x + 61, baseY + 19, g.label, { size: 9, align: 'center', color: FAINT });
  });
  P.line(50, baseY, 440, baseY, { stroke: BORDER, sw: 1 });
  P.alpha(b0);
  T(40, 212, '12 is the floor: one transmission per frame. The gap above it is the cost of one loss.',
    { size: 9, color: FAINT });

  /* --- right: elapsed time, as paired bars --- */
  P.alpha(b1);
  T(460, 44, 'elapsed time, in frame transmission slots', { size: 11, bold: true });
  var rows = [
    { label: 'window 4', y: 66, g: g4.elapsed, s: s4.elapsed },
    { label: 'window 8', y: 118, g: g8.elapsed, s: s8.elapsed }
  ];
  rows.forEach(function (r) {
    P.alpha(b1);
    T(460, r.y, r.label, { size: 10, color: DIM });
    bar(530, r.y - 4, 210, 18, r.g / 26, WARNDIM, String(r.g) + ' GBN');
    bar(530, r.y + 18, 210, 18, r.s / 26, ACCDIM, String(r.s) + ' SR');
  });
  P.alpha(b1);
  T(460, 172, 'Go-Back-N spends slots resending frames that already', { size: 10, color: DIM });
  T(460, 188, 'arrived, so its time does not improve with the window.', { size: 10, color: DIM });

  /* --- the two conclusions --- */
  P.alpha(b2);
  box(40, 226, 400, 96, { fill: SURF });
  T(54, 236, 'the window is still the bandwidth-delay product', { size: 11, bold: true });
  T(54, 256, 'link C needs 21 frames of window:', { size: 10, color: DIM });
  T(54, 274, '5 sequence bits under Go-Back-N', { size: 10, mono: true, color: ACC });
  T(54, 290, '6 sequence bits under Selective Repeat', { size: 10, mono: true, color: ACC });
  T(54, 310, '15 < 21 \u2264 31, and 16 < 21 \u2264 32', { size: 9, mono: true, color: FAINT });

  P.alpha(b3);
  box(460, 226, 400, 96, { fill: ACCDIM, stroke: ACC });
  T(474, 236, 'how to choose', { size: 11, bold: true, color: ACC });
  T(474, 256, 'clean link: either, the formula is identical', { size: 10, color: DIM });
  T(474, 274, 'lossy link: Selective Repeat, one frame per loss', { size: 10, color: DIM });
  T(474, 294, 'memory-poor receiver: Go-Back-N, one buffer', { size: 10, color: DIM });
  T(474, 312, 'narrow field: Go-Back-N gets twice the window', { size: 10, color: DIM });

  P.alpha(b3);
  box(40, 336, 820, 48, { fill: WARNDIM, stroke: WARN });
  T(54, 346, 'Trap: comparing the protocols by efficiency. On an error-free link the two formulas are one expression,',
    { size: 10, color: WARN });
  T(54, 364, 'so an efficiency question cannot tell you which protocol you were given. Only loss separates them.',
    { size: 10, color: DIM });
  P.alpha(1);
}

/* ============================ scene 10 ============================ */

function drawProcedure(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);
  heading('The four steps, and the traps that break them');

  var steps = [
    ['1', 'Tt = frame bits / link rate', 'multiply bytes by 8 first'],
    ['2', 'Tp = distance / speed, or as given', 'one way, unless it says round trip'],
    ['3', 'a = Tp / Tt, then 1 + 2a', 'the denominator, computed once'],
    ['4', 'substitute: η = min(1, W/(1+2a))', 'or invert: W = ceiling of 1 + 2a']
  ];
  P.alpha(b0);
  steps.forEach(function (s, i) {
    var y = 44 + i * 40;
    box(40, y, 420, 34, { fill: SURF });
    P.circle(62, y + 17, 11, { fill: ACCDIM, stroke: ACC });
    T(62, y + 11, s[0], { size: 10, bold: true, align: 'center', color: ACC });
    T(82, y + 8, s[1], { size: 10, mono: true });
    T(82, y + 22, s[2], { size: 9, color: FAINT });
  });

  P.alpha(b1);
  T(500, 44, 'five traps, by sight', { size: 11, bold: true });
  var traps = [
    'doubling a delay already given as a round trip',
    'mixing bytes with bits per second',
    'dropping the plus one: 21 becomes 20',
    'giving Go-Back-N the Selective Repeat bound',
    'assuming a bigger window always transmits less'
  ];
  traps.forEach(function (s, i) {
    var y = 66 + i * 34;
    P.alpha(i < 3 ? b1 : b2);
    box(500, y, 360, 28, { fill: WARNDIM, stroke: WARN });
    T(512, y + 8, s, { size: 10, color: WARN });
  });

  P.alpha(b2);
  box(40, 216, 420, 92, { fill: SURF });
  T(54, 226, 'the two bounds, side by side', { size: 11, bold: true });
  T(54, 248, 'Go-Back-N:      N ≤ 2^m − 1', { size: 11, mono: true, color: WARN });
  T(54, 266, 'Selective Repeat:  N ≤ 2^(m−1)', { size: 11, mono: true, color: ACC });
  T(54, 288, 'both contain a minus one: one in the base, one in the exponent', { size: 9, color: DIM });

  P.alpha(b3);
  box(40, 322, 820, 62, { fill: ACCDIM, stroke: ACC });
  T(54, 332, 'write the quantity down before computing', { size: 11, bold: true, color: ACC });
  T(54, 352, 'an efficiency is at most 1 · a window is a whole number · a bit count is at least 1 · a count of transmissions is at least the number of frames',
    { size: 10, color: DIM });
  T(54, 370, 'every trap in this lesson fails one of those four checks, and each check costs one line.', { size: 10, color: DIM });
  P.alpha(1);
}

/* ============================ dispatch ============================ */

var SCENE_DRAW = {
  waiting: drawWaiting,
  window: drawWindow,
  counted: drawCounted,
  minwindow: drawMinWindow,
  gbn: drawGbn,
  sr: drawSr,
  gbnbound: drawGbnBound,
  srbound: drawSrBound,
  cost: drawCost,
  procedure: drawProcedure
};

function drawFrame(P2) {
  P = P2;
  P.alpha(1);
  P.clear();
  P.rect(0, 0, W, H, { fill: SURF });

  var t = (K && K.state) ? K.state.elapsed : 0;
  var scenes = (K && K.state && K.state.scenes) ? K.state.scenes : [];
  var i = 0;
  for (var k = scenes.length - 1; k >= 0; k--) {
    if (t >= scenes[k].start - 1e-6) { i = k; break; }
  }
  var sc = scenes[i];
  if (!sc) return;
  var fn = SCENE_DRAW[sc.id];
  if (!fn) return;
  try {
    fn(t, sc);
  } catch (err) {
    console.error('scene draw failed', sc.id, err);
  }
}

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

window.__MODEL = { V: V, CHECKS: CHECKS };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
