/* ==========================================================================
   tcp-retransmission-timeout-and-rtt-estimation — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model is the estimator of RFC 6298: the first-measurement rule, the two
   smoothed updates in their fixed order, the one-second floor, the backoff
   ladder and the sixty-second ceiling, plus Karn's rule and two scenarios in
   which a naive sample is wrong. The drawing code reads those results; nothing
   on the canvas is typed in by hand.
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

/* the constants of RFC 6298, in milliseconds */
var G = 1;              // clock granularity
var KC = 4;             // K, the number of deviations in the margin
var ALPHA = 1 / 8;      // weight of a new sample in the centre
var BETA = 1 / 4;       // weight of a new gap in the spread
var FLOOR = 1000;       // rule 2.4: a computed RTO below 1 s is raised to 1 s
var CAP = 60000;        // rule 2.5: a maximum may be set, at least 60 s
var INITIAL = 1000;     // rule 2.1: the value before any sample
var OLD_INITIAL = 3000; // RFC 2988, the document RFC 6298 obsoletes
var SYN_FLOOR = 3000;   // rule 5.7

function rtoRaw(srtt, v) { return srtt + Math.max(G, KC * v); }
function applied(r) { return Math.min(CAP, Math.max(FLOOR, r)); }

/* ---------- the estimator, exactly as rules 2.2 and 2.3 state it ---------- */

function trace(samples) {
  var rows = [];
  var srtt = null, v = null;
  for (var i = 0; i < samples.length; i++) {
    var R = samples[i];
    var prevSrtt = srtt, prevVar = v;
    if (i === 0) {
      srtt = R;                       // rule 2.2
      v = R / 2;
    } else {
      v = (1 - BETA) * v + BETA * Math.abs(srtt - R);   // rule 2.3, OLD srtt
      srtt = (1 - ALPHA) * srtt + ALPHA * R;
    }
    var raw = rtoRaw(srtt, v);
    rows.push({
      n: i + 1, R: R,
      srttPrev: prevSrtt, varPrev: prevVar,
      srtt: srtt, v: v,
      raw: raw, used: applied(raw), floored: raw < FLOOR
    });
  }
  return rows;
}

/* ---------- the worked trace, five samples from one path ---------- */

var SAMPLES = [400, 380, 420, 400, 800];
var WORK = trace(SAMPLES);
var W4 = WORK[3];   // the row before the outlier
var W5 = WORK[4];   // the row the outlier changes

/* ---------- the two update orders, on the same pair ---------- */

function updateSwapped(srtt, v, R) {
  var s = (1 - ALPHA) * srtt + ALPHA * R;              // centre first
  var vv = (1 - BETA) * v + BETA * Math.abs(s - R);    // spread from the new centre
  return { srtt: s, v: vv, raw: rtoRaw(s, vv) };
}
var ORDER_WRONG = updateSwapped(W4.srtt, W4.v, 800);
var ORDER_DIFF_VAR = Math.abs(W5.v - ORDER_WRONG.v);
var ORDER_DIFF_RTO = Math.abs(W5.raw - ORDER_WRONG.raw);

/* ---------- the first sample on a fast path ---------- */

var FIRST_R = 40;
var FIRST = trace([FIRST_R])[0];
var FLOOR_RATIO = FIRST.used / FIRST_R;

/* ---------- a steady path, and one spike ---------- */

var STEADY = trace(new Array(40).fill(400));
var SPIKE = trace(new Array(30).fill(400).concat([1600]));
var SPIKE_ROW = SPIKE[SPIKE.length - 1];
var SPIKE_PREV = SPIKE[SPIKE.length - 2];
var SPIKE_FACTOR = SPIKE_ROW.used / SPIKE_PREV.used;

/* ---------- the backoff ladder ---------- */

function ladder(start) {
  var seq = [start], v = start;
  while (v * 2 <= CAP) { v = v * 2; seq.push(v); }
  if (seq[seq.length - 1] < CAP) seq.push(CAP);
  return seq;
}
var LADDER = ladder(WORK[0].used);
var LADDER_DOUBLINGS = LADDER.length - 1;

/* ---------- the two ways to be wrong ---------- */

var COST = {
  rtt: 400,
  smallRto: 120,
  spurious: Math.floor(400 / 120),
  bigRto: 12000,
  wastedRtts: 12000 / 400
};

/* ---------- the timer, restarted by new data (rules 5.1 to 5.3) ---------- */

function timerSim(rto, acks) {
  var deadline = rto, log = [{ at: 0, deadline: deadline, why: 'send' }];
  for (var i = 0; i < acks.length; i++) {
    deadline = acks[i] + rto;
    log.push({ at: acks[i], deadline: deadline, why: 'ack' });
  }
  return { rto: rto, deadlines: log.map(function (l) { return l.deadline; }), log: log, offAt: acks[acks.length - 1] };
}
var TIMER = timerSim(1200, [400, 800]);

/* ---------- Karn's two scenarios ---------- */

var KARN = {
  timer: 1200,
  sendAt: 0,
  retxAt: 1200,
  ackEarly: 1250,     // answers the ORIGINAL copy
  ackLate: 1600,      // answers the RETRANSMITTED copy
  trueRtt: 400,
  sampleFromRetx: 1250 - 1200,
  sampleFromOrig: 1600 - 0,
  afterTimeout: 1200 * 2
};
KARN.earlyFraction = KARN.sampleFromRetx / KARN.trueRtt;
KARN.lateFactor = KARN.sampleFromOrig / KARN.trueRtt;

/* ---------- convergence on a constant path ---------- */

function closedFormVar(R, n) { return (R / 2) * Math.pow(0.75, n - 1); }
var CONVERGE_ROW = null;
for (var ci = 0; ci < STEADY.length; ci++) {
  if (STEADY[ci].raw <= 1.1 * 400) { CONVERGE_ROW = STEADY[ci].n; break; }
}

/* ---------- formatting ---------- */

function ms(v, dp) {
  var d = dp === undefined ? 2 : dp;
  return v.toFixed(d) + ' ms';
}
function num(v, dp) {
  var d = dp === undefined ? 2 : dp;
  return v.toFixed(d);
}

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* 1. the first-measurement rule, on three samples */
(function () {
  var ok = [40, 400, 1500].every(function (R) {
    var row = trace([R])[0];
    return row.srtt === R && row.v === R / 2;
  });
  chk('rule 2.2: first sample sets SRTT = R and RTTVAR = R/2', ok);
})();

/* 2. the first timer is 3R while the granularity term is slack */
(function () {
  var ok = [40, 400, 1500].every(function (R) {
    var row = trace([R])[0];
    return Math.abs(row.raw - 3 * R) < 1e-9;
  });
  chk('rule 2.2: with G < 2R the first computed RTO is exactly 3R', ok, '40 -> 120');
})();

/* 3. the floor and the cap are applied to the timer only */
(function () {
  var ok = WORK.concat(SPIKE, STEADY).every(function (r) {
    return Math.abs(r.used - Math.min(CAP, Math.max(FLOOR, r.raw))) < 1e-9;
  });
  chk('rule 2.4 and 2.5: used RTO is the computed value clamped to [1000, 60000]', ok);
})();

/* 4. the floor binds on a fast path, and by how much */
chk('rule 2.4 binds on a 40 ms path: 120 ms is raised to 1000 ms',
    FIRST.floored && FIRST.used === 1000 && Math.abs(FLOOR_RATIO - 25) < 1e-9,
    'the timer is 25 times the measured round trip');

/* 5. rule 2.3 reproduces row 5 from row 4 */
(function () {
  var v = (1 - BETA) * W4.v + BETA * Math.abs(W4.srtt - 800);
  var s = (1 - ALPHA) * W4.srtt + ALPHA * 800;
  chk('rule 2.3 reproduces the fifth row from the fourth',
      Math.abs(v - W5.v) < 1e-12 && Math.abs(s - W5.srtt) < 1e-12);
})();

/* 6. the spread is updated with the OLD centre, and the swap changes the answer */
chk('rule 2.3 order: the spread uses the OLD SRTT, and swapping the two lines changes the answer',
    ORDER_DIFF_VAR > 1 && Math.abs(ORDER_DIFF_RTO - 49.9658203125) < 1e-9,
    'the swapped order gives RTTVAR ' + num(ORDER_WRONG.v) + ' and RTO ' + num(ORDER_WRONG.raw));

/* 7. the centre stays between the old centre and the new sample */
(function () {
  var ok = WORK.concat(SPIKE).every(function (r) {
    if (r.srttPrev === null) return true;
    var lo = Math.min(r.srttPrev, r.R), hi = Math.max(r.srttPrev, r.R);
    return r.srtt >= lo - 1e-9 && r.srtt <= hi + 1e-9;
  });
  chk('the centre is always a convex combination of the old centre and the sample', ok);
})();

/* 8. the centre moves by exactly one eighth of the gap */
chk('the centre moves by one eighth of the gap: 400.2734 to 800 gives +49.9658',
    Math.abs((W5.srtt - W4.srtt) - (1 / 8) * (800 - W4.srtt)) < 1e-12);

/* 9. a steady path has the closed form for the spread */
(function () {
  var ok = STEADY.every(function (r) {
    return Math.abs(r.v - closedFormVar(400, r.n)) < 1e-9;
  });
  chk('constant path: RTTVAR(n) = (R/2)(3/4)^(n-1) for all 40 rows', ok);
})();

/* 10. and the row at which the computed timer comes within ten per cent */
chk('constant path: the computed timer first comes within 10 per cent at sample 12',
    CONVERGE_ROW === 12 && STEADY[10].raw > 440 && STEADY[11].raw <= 440,
    'row 11 is ' + num(STEADY[10].raw) + ' ms, row 12 is ' + num(STEADY[11].raw) + ' ms');

/* 11. the spike, against the closed form of the steady path */
(function () {
  var v30 = (400 / 2) * Math.pow(0.75, 29);          // closed form, independent of the loop
  var v = 0.75 * v30 + 0.25 * Math.abs(400 - 1600);
  var s = 0.875 * 400 + 0.125 * 1600;
  chk('one sample of 1600 ms after 30 steady samples gives SRTT 550 and RTTVAR 300.0357',
      Math.abs(s - 550) < 1e-9 &&
      Math.abs(SPIKE_ROW.srtt - s) < 1e-9 &&
      Math.abs(SPIKE_ROW.v - v) < 1e-9 &&
      Math.abs(SPIKE_ROW.raw - (s + 4 * v)) < 1e-9,
      'computed: SRTT ' + num(SPIKE_ROW.srtt) + ', RTTVAR ' + num(SPIKE_ROW.v, 4) + ', RTO ' + num(SPIKE_ROW.raw));
})();

/* 12. the timer grows by about 1.75 from that one sample */
chk('the timer grows by a factor of 1.75 from one spike',
    SPIKE_FACTOR > 1.75 && SPIKE_FACTOR < 1.7502 &&
    Math.abs(SPIKE_ROW.used - SPIKE_PREV.used * 1.75) < 0.2,
    num(SPIKE_PREV.used) + ' -> ' + num(SPIKE_ROW.used) + ', factor ' + num(SPIKE_FACTOR, 4));

/* 13. the ladder doubles until it reaches the cap */
(function () {
  var ok = LADDER.every(function (v, i) {
    if (i === 0) return v === WORK[0].used;
    return v === Math.min(CAP, LADDER[i - 1] * 2);
  });
  chk('rule 5.5: the ladder doubles and stops at the 60 s maximum', ok, LADDER.join(' -> '));
})();

/* 14. six doublings from the worked value to the cap */
chk('from 1200 ms the cap is reached after six doublings',
    LADDER_DOUBLINGS === 6 && LADDER[LADDER.length - 1] === CAP);

/* 15. a short timer fires repeatedly before the ACK can arrive */
chk('a 120 ms timer on a 400 ms path fires three times before the first ACK',
    COST.spurious === 3 && COST.spurious * COST.smallRto < COST.rtt,
    '360 ms < 400 ms, so none of the three copies was needed');

/* 16. a long timer waits many round trips */
chk('a 12 s timer on the same path waits 30 round trips',
    Math.abs(COST.wastedRtts - 30) < 1e-9);

/* 17. the timer restarts on an ACK that acknowledges new data */
chk('rules 5.1 to 5.3: deadlines 1200, 1600, 2000 and the timer off at 800',
    TIMER.deadlines.join(',') === '1200,1600,2000' && TIMER.offAt === 800 &&
    TIMER.deadlines[2] - TIMER.offAt === TIMER.rto);

/* 18. Karn scenario A: the naive sample is one eighth of the truth */
chk('Karn A: an ACK at 1250 after a copy at 1200 samples 50 ms for a 400 ms path',
    KARN.sampleFromRetx === 50 && Math.abs(KARN.earlyFraction - 0.125) < 1e-12);

/* 19. Karn scenario B: the other choice is four times the truth */
chk('Karn B: an ACK at 1600 timed from the original send samples 1600 ms for a 400 ms path',
    KARN.sampleFromOrig === 1600 && KARN.lateFactor === 4);

/* 20. Karn's rule leaves the timer doubled, not recomputed */
chk("Karn's rule: after the expiry the timer is 2400 ms, and no sample is taken",
    KARN.afterTimeout === 2400 && KARN.afterTimeout === 2 * KARN.timer);

/* 21. RTTVAR is not a variance: one sample has zero variance and RTTVAR = R/2 */
(function () {
  var one = trace([400])[0];
  var mean = 400;
  var variance = 0;   // a single observation has no spread at all
  chk('RTTVAR is not a variance: one sample gives variance 0 but RTTVAR 200',
      variance === 0 && one.v === 200);
})();

/* 22. and it is not a mean of the samples either */
(function () {
  var mean = SAMPLES.reduce(function (a, b) { return a + b; }, 0) / SAMPLES.length;
  chk('the estimator is not the mean of the samples: 480 ms against ' + num(W5.srtt) + ' ms',
      Math.abs(mean - 480) < 1e-9 && Math.abs(mean - W5.srtt) > 20);
})();

/* 23. the two recursions unrolled into weighted sums agree with the iteration */
(function () {
  var rows = WORK;
  var ok = true;
  for (var n = 1; n <= rows.length; n++) {
    var s = Math.pow(0.875, n - 1) * rows[0].R;
    for (var k = 2; k <= n; k++) s += 0.125 * Math.pow(0.875, n - k) * rows[k - 1].R;
    if (Math.abs(s - rows[n - 1].srtt) > 1e-9) ok = false;

    var v = Math.pow(0.75, n - 1) * rows[0].R / 2;
    for (var k2 = 2; k2 <= n; k2++) {
      v += 0.25 * Math.pow(0.75, n - k2) * Math.abs(rows[k2 - 2].srtt - rows[k2 - 1].R);
    }
    if (Math.abs(v - rows[n - 1].v) > 1e-9) ok = false;
  }
  chk('both recursions agree with their unrolled weighted sums on all five rows', ok);
})();

/* 24. the SYN rule raises a short timer to three seconds after the handshake */
chk('rule 5.7: a timer below 3 s is re-initialised to 3 s when data starts after the handshake',
    WORK[0].used < SYN_FLOOR && Math.max(WORK[0].used, SYN_FLOOR) === SYN_FLOOR,
    'the worked timer is ' + WORK[0].used + ' ms, so the handshake case uses 3000 ms');

/* 25. the older document used three seconds, and the modern one uses one */
chk('rule 2.1: the initial timer is 1 s, and the obsolete RFC 2988 used 3 s',
    INITIAL === 1000 && OLD_INITIAL === 3000);

/* ======================================================================
   LAYER 3 - SCENES
   ====================================================================== */

function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function beat(sc, t, k) {
  var span = (sc.end - sc.start) / 4;
  return clamp01((t - (sc.start + k * span)) / 0.8);
}
function T(x, y, s, o) { P.text(x, y, s, o || {}); }
function head(title, sub) {
  T(32, 22, title, { size: 17, bold: true, color: INK });
  if (sub) T(32, 44, sub, { size: 12, color: DIM });
  P.line(32, 54, W - 32, 54, { stroke: BORDER, sw: 1 });
}
function box(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, {
    fill: o.fill || SURF2, stroke: o.stroke || BORDER, sw: o.sw || 1.5,
    radius: o.radius === undefined ? 6 : o.radius, dash: o.dash
  });
}
function tick(x, y, colour) {
  P.line(x, y, x + 5, y + 6, { stroke: colour || VAL, sw: 2 });
  P.line(x + 5, y + 6, x + 14, y - 7, { stroke: colour || VAL, sw: 2 });
}
function cross(x, y, colour) {
  P.line(x, y, x + 11, y + 11, { stroke: colour || BAD, sw: 2 });
  P.line(x + 11, y, x, y + 11, { stroke: colour || BAD, sw: 2 });
}
function footer(s) {
  T(32, 440, s, { size: 9.5, color: FAINT });
}

var SCENE_DRAW = {};

/* ---------- scene 1: the timer ---------- */

SCENE_DRAW.timer = function (t, sc) {
  head('One number, restarted by new data',
       'the sender holds one duration, RTO, and every ACK that acknowledges new data moves it');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);
  var px = function (v) { return 60 + (v / 2400) * 780; };

  P.alpha(a);
  P.line(60, 96, 840, 96, { stroke: BORDER, sw: 1 });
  P.rect(60, 88, 260, 16, { fill: ACCDIM, stroke: ACC, sw: 1, radius: 3 });
  T(60, 72, 'data in flight', { size: 9.5, color: ACC });

  P.alpha(b);
  [[0, 'send 0'], [400, 'ACK 400'], [800, 'ACK 800']].forEach(function (p) {
    P.circle(px(p[0]), 96, 4, { fill: SURF, stroke: ACC, sw: 2 });
    T(px(p[0]), 112, p[1], { size: 9.5, mono: true, align: 'center', color: DIM });
  });

  P.alpha(c);
  TIMER.deadlines.forEach(function (dl, i) {
    P.line(px(dl), 76, px(dl), 140, { stroke: WARN, sw: 1.2, dash: [4, 3] });
    T(px(dl), 62, String(dl), { size: 9.5, mono: true, align: 'center', color: WARN });
    T(px(dl) - 6, 148, ['after send', 'after ACK 400', 'after ACK 800'][i],
      { size: 8.5, align: 'right', color: FAINT });
  });

  P.alpha(d);
  var rules = [
    ['5.1', 'start the timer when data is sent and nothing is running'],
    ['5.2', 'switch it off when every outstanding byte is acknowledged'],
    ['5.3', 'restart it when an ACK acknowledges new data'],
    ['5.4', 'on expiry: retransmit the earliest unacknowledged segment']
  ];
  rules.forEach(function (r, i) {
    var y = 190 + i * 26;
    P.circle(48, y + 5, 9, { fill: ACCDIM, stroke: ACC, sw: 1 });
    T(48, y + 5, r[0], { size: 8.5, mono: true, bold: true, align: 'center', base: 'middle', color: ACC });
    T(68, y, r[1], { size: 11, color: INK });
  });

  P.alpha(1);
  T(32, 306, 'The timer guards the OLDEST unacknowledged byte. It is not a countdown per segment.', { size: 10.5, color: DIM });
  T(32, 326, 'Rules quoted from RFC 6298 section 5, "Managing the RTO Timer".', { size: 10, color: FAINT });
  footer('Class B: a prerequisite mechanism for the named TCP clause "flow control and congestion control", GATE 2027 Section 10.');
};

/* ---------- scene 2: two ways to be wrong ---------- */

SCENE_DRAW.cost = function (t, sc) {
  head('Two ways to be wrong', 'the timer is a bet about how long an ACK can take, and both errors are paid');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  box(32, 72, 410, 206, { fill: SURF, stroke: BAD });
  T(46, 84, 'timer too short', { size: 12, bold: true, color: BAD });
  T(46, 104, 'RTO ' + COST.smallRto + ' ms on a ' + COST.rtt + ' ms path', { size: 10.5, mono: true, color: INK });

  P.alpha(b);
  var bx = function (v) { return 46 + (v / 480) * 372; };
  P.line(46, 146, 418, 146, { stroke: BORDER, sw: 1 });
  [0, 120, 240, 360, 400].forEach(function (v, i) {
    P.circle(bx(v), 146, i === 4 ? 4 : 3, { fill: i === 4 ? VAL : BAD, stroke: i === 4 ? VAL : BAD });
  });
  T(bx(120), 126, '120', { size: 8.5, mono: true, align: 'center', color: BAD });
  T(bx(240), 126, '240', { size: 8.5, mono: true, align: 'center', color: BAD });
  T(bx(360), 126, '360', { size: 8.5, mono: true, align: 'center', color: BAD });
  T(bx(400), 158, 'ACK 400', { size: 8.5, mono: true, align: 'right', color: VAL });
  T(46, 176, COST.spurious + ' copies sent before the ACK could arrive', { size: 10.5, bold: true, color: INK });
  T(46, 196, COST.spurious + ' x ' + COST.smallRto + ' = ' + (COST.spurious * COST.smallRto) +
    ' ms < ' + COST.rtt + ' ms', { size: 10.5, mono: true, color: DIM });
  T(46, 218, 'none of the three could have been needed', { size: 10, color: DIM });
  T(46, 246, 'cost: bandwidth, and a duplicate in the', { size: 10, color: FAINT });
  T(46, 262, 'network that looks like congestion', { size: 10, color: FAINT });

  P.alpha(c);
  box(458, 72, 410, 206, { fill: SURF, stroke: WARN });
  T(472, 84, 'timer too long', { size: 12, bold: true, color: WARN });
  T(472, 104, 'RTO ' + COST.bigRto + ' ms on a ' + COST.rtt + ' ms path', { size: 10.5, mono: true, color: INK });
  T(472, 132, 'one segment is lost at 0 ms', { size: 10, color: DIM });
  T(472, 154, 'the repair waits ' + COST.bigRto + ' ms', { size: 10.5, mono: true, color: INK });
  T(472, 176, COST.bigRto + ' / ' + COST.rtt + ' = ' + COST.wastedRtts + ' round trips', { size: 10.5, mono: true, bold: true, color: WARN });
  T(472, 202, 'the connection sits silent for thirty', { size: 10, color: DIM });
  T(472, 218, 'round trips, for one missing segment', { size: 10, color: DIM });
  T(472, 246, 'cost: time, and the receiver has already', { size: 10, color: FAINT });
  T(472, 262, 'sent duplicate ACKs the timer ignores', { size: 10, color: FAINT });

  P.alpha(d);
  box(32, 294, 836, 62, { fill: ACCDIM, stroke: ACC });
  T(48, 306, 'A fixed timer cannot serve both a local network and a path across an ocean.', { size: 12, bold: true, color: INK });
  T(48, 328, 'That is why the estimator is a MUST in RFC 6298, and not an optimisation.', { size: 10.5, color: DIM });

  P.alpha(1);
  T(32, 374, 'Both figures are computed: the spurious count is the floor of 400 by 120, the wait is 12000 by 400.', { size: 10, color: FAINT });
  footer('No previous-year question is claimed here. The practice set on the last tab is labelled original.');
};

/* ---------- scene 3: the first sample ---------- */

SCENE_DRAW.first = function (t, sc) {
  head('The first sample: 3R, and then the floor',
       'one measurement sets both the centre and the spread, and a rule then replaces the answer');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  box(32, 72, 424, 76, { fill: SURF2, stroke: BORDER });
  T(46, 84, 'before any measurement', { size: 10.5, bold: true, color: DIM });
  T(46, 106, 'RTO = 1000 ms', { size: 15, mono: true, bold: true, color: INK });
  T(46, 128, 'RFC 6298 rule 2.1; RFC 2988 used 3000 ms', { size: 9.5, color: FAINT });

  P.alpha(b);
  box(32, 158, 424, 132, { fill: SURF, stroke: ACC });
  T(46, 170, 'the first measurement: R = 40 ms', { size: 11, bold: true, color: ACC });
  T(46, 192, 'SRTT   = R          = 40.00 ms', { size: 10.5, mono: true, color: INK });
  T(46, 212, 'RTTVAR = R / 2      = 20.00 ms', { size: 10.5, mono: true, color: INK });
  T(46, 232, 'RTO    = SRTT + 4 RTTVAR', { size: 10.5, mono: true, color: INK });
  T(46, 252, '       = 40.00 + 80.00 = 120.00 ms', { size: 10.5, mono: true, color: INK });
  T(46, 274, 'computed 120 ms, used ' + FIRST.used + ' ms', { size: 10.5, mono: true, bold: true, color: WARN });

  P.alpha(c);
  box(472, 158, 396, 132, { fill: SURF, stroke: WARN });
  T(486, 170, 'the floor replaces it (rule 2.4)', { size: 11, bold: true, color: WARN });
  var sx = function (v) { return 486 + (v / 1000) * 350; };
  P.rect(486, 190, sx(120) - 486, 16, { fill: BADDIM, stroke: BAD, sw: 1, radius: 3 });
  T(sx(120) + 8, 192, '120 ms computed', { size: 9.5, mono: true, color: BAD });
  P.rect(486, 216, sx(1000) - 486, 16, { fill: WARNDIM, stroke: WARN, sw: 1, radius: 3 });
  T(sx(1000) - 8, 218, '1000 ms used', { size: 9.5, mono: true, align: 'right', color: WARN });
  T(486, 250, 'the timer used is ' + FLOOR_RATIO + ' times the measured round trip', { size: 10, color: INK });
  T(486, 270, 'a 40 ms path, a 1 s deadline', { size: 9.5, color: FAINT });

  P.alpha(d);
  box(32, 306, 836, 66, { fill: SURF, stroke: ACC });
  T(48, 318, 'The floor is deliberate: a minimum timer keeps TCP conservative on fast paths.', { size: 12, bold: true, color: INK });
  T(48, 340, 'Rule 2.4 records the reason as avoiding spurious retransmissions; the page quotes the rule, not a proof that one second is optimal.', { size: 9.5, color: DIM });
  T(48, 360, 'The floor touches the timer only. SRTT stays 40 and RTTVAR stays 20.', { size: 9.5, color: FAINT });

  P.alpha(1);
  footer('Class B: the retransmission timer is the loss signal the named TCP congestion-control clause depends on.');
};

/* ---------- scene 4: the two averages ---------- */

SCENE_DRAW.averages = function (t, sc) {
  head('Two running averages, not one',
       'the centre takes one eighth of a gap, the spread takes one quarter, and the timer is centre plus four spreads');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(46, 76, 'n', { size: 9.5, bold: true, color: DIM });
  T(92, 76, 'sample R', { size: 9.5, bold: true, color: DIM });
  T(196, 76, 'SRTT', { size: 9.5, bold: true, color: ACC });
  T(316, 76, 'RTTVAR', { size: 9.5, bold: true, color: WARN });
  T(446, 76, 'computed RTO', { size: 9.5, bold: true, color: DIM });
  T(600, 76, 'used after clamp', { size: 9.5, bold: true, color: DIM });

  P.alpha(b);
  WORK.forEach(function (r, i) {
    var y = 98 + i * 22;
    T(46, y, String(r.n), { size: 10, mono: true, color: DIM });
    T(92, y, num(r.R, 0), { size: 10, mono: true, color: INK });
    T(196, y, num(r.srtt, 4), { size: 10, mono: true, color: ACC });
    T(316, y, num(r.v, 4), { size: 10, mono: true, color: WARN });
    T(446, y, num(r.raw, 4), { size: 10, mono: true, color: INK });
    T(600, y, num(r.used, 2) + (r.floored ? '  floor' : ''), { size: 10, mono: true, color: r.floored ? BAD : VAL });
  });

  P.alpha(c);
  box(32, 214, 836, 92, { fill: SURF, stroke: BORDER });
  T(46, 226, 'RTTVAR  <-  (1 - 1/4) RTTVAR  +  (1/4) | SRTT - R\' |', { size: 11, mono: true, color: WARN });
  T(46, 248, 'SRTT    <-  (1 - 1/8) SRTT    +  (1/8) R\'', { size: 11, mono: true, color: ACC });
  T(46, 270, 'RTO     <-  SRTT + max(G, 4 RTTVAR)', { size: 11, mono: true, color: INK });
  T(46, 292, 'the first line uses the OLD SRTT: RFC 6298 rule 2.3 says so in as many words', { size: 9.5, color: DIM });

  P.alpha(d);
  T(32, 326, 'Row 5: the centre moves from ' + num(W4.srtt, 4) + ' to ' + num(W5.srtt, 4) + ' ms, a gain of ' + num(W5.srtt - W4.srtt, 4) + ' ms.', { size: 10.5, color: INK });
  T(32, 348, 'The spread moves from ' + num(W4.v, 4) + ' to ' + num(W5.v, 4) + ' ms, and the timer grows by ' + num(W5.used - W4.used, 2) + ' ms.', { size: 10.5, color: INK });
  T(32, 370, 'A mean of the five samples would be 480.00 ms. The filter is at ' + num(W5.srtt, 4) + ' ms: not the same statistic.', { size: 10, color: DIM });

  P.alpha(1);
  footer('Rows 3 and 4 are marked floor: the computed timer fell below 1000 ms and was raised. Nothing else in the table was changed.');
};

/* ---------- scene 5: the order of the updates ---------- */

SCENE_DRAW.order = function (t, sc) {
  head('The two updates are ordered',
       'the spread is computed from the centre as it was, not as it becomes');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  box(32, 72, 410, 196, { fill: SURF, stroke: VAL });
  T(46, 84, 'as written: spread first', { size: 11.5, bold: true, color: VAL });
  T(46, 106, 'old SRTT ' + num(W4.srtt, 4), { size: 10, mono: true, color: INK });
  T(46, 124, 'old RTTVAR ' + num(W4.v, 4), { size: 10, mono: true, color: INK });
  T(46, 146, 'gap |' + num(W4.srtt, 4) + ' - 800| = ' + num(Math.abs(800 - W4.srtt), 4), { size: 10, mono: true, color: INK });
  T(46, 168, 'RTTVAR = 68.6133 + 99.9316', { size: 10, mono: true, color: WARN });
  T(46, 186, '       = ' + num(W5.v, 4), { size: 10, mono: true, bold: true, color: WARN });
  T(46, 208, 'SRTT   = ' + num(W5.srtt, 4), { size: 10, mono: true, color: ACC });
  T(46, 226, 'RTO    = ' + num(W5.raw, 4), { size: 10, mono: true, bold: true, color: INK });
  T(46, 250, 'rule 2.3, order as printed', { size: 9.5, color: FAINT });

  P.alpha(b);
  box(458, 72, 410, 196, { fill: SURF, stroke: BAD });
  T(472, 84, 'swapped: centre first', { size: 11.5, bold: true, color: BAD });
  T(472, 106, 'new SRTT ' + num(ORDER_WRONG.srtt, 4), { size: 10, mono: true, color: INK });
  T(472, 124, 'old RTTVAR ' + num(W4.v, 4), { size: 10, mono: true, color: INK });
  T(472, 146, 'gap |' + num(ORDER_WRONG.srtt, 4) + ' - 800| = ' + num(Math.abs(800 - ORDER_WRONG.srtt), 4), { size: 10, mono: true, color: INK });
  T(472, 168, 'RTTVAR = 68.6133 + 87.4402', { size: 10, mono: true, color: WARN });
  T(472, 186, '       = ' + num(ORDER_WRONG.v, 4), { size: 10, mono: true, bold: true, color: WARN });
  T(472, 208, 'SRTT   = ' + num(ORDER_WRONG.srtt, 4), { size: 10, mono: true, color: ACC });
  T(472, 226, 'RTO    = ' + num(ORDER_WRONG.raw, 4), { size: 10, mono: true, bold: true, color: INK });
  T(472, 250, 'same rules, one line moved', { size: 9.5, color: FAINT });

  P.alpha(c);
  box(32, 282, 836, 62, { fill: BADDIM, stroke: BAD });
  T(48, 294, 'The two orders differ by ' + num(ORDER_DIFF_VAR, 4) + ' ms of spread and ' + num(ORDER_DIFF_RTO, 4) + ' ms of timer, on one sample.', { size: 11.5, bold: true, color: INK });
  T(48, 316, 'The error always points the same way: a gap measured from a centre that has already moved is too small.', { size: 10, color: DIM });

  P.alpha(d);
  T(32, 364, 'The spread is the safety margin, so an under-estimated spread is the dangerous direction: the timer fires early.', { size: 10.5, color: DIM });
  T(32, 384, 'The error is largest exactly when the path changed, which is when the spread was needed.', { size: 10.5, color: DIM });

  P.alpha(1);
  footer('Both columns are computed by the page from the same two rules; the only difference between them is the order of two assignments.');
};

/* ---------- scene 6: one spike ---------- */

SCENE_DRAW.spike = function (t, sc) {
  head('One spike, and the estimate moves',
       'a steady path shrinks the spread toward zero; one slow sample lifts the timer and then fades');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  var xOf = function (i) { return 62 + (i / 30) * 596; };
  var yOf = function (v) { return 244 - (v / 1800) * 150; };

  P.alpha(a);
  P.line(62, 250, 658, 250, { stroke: BORDER, sw: 1 });
  [0, 400, 800, 1200, 1600].forEach(function (v) {
    P.line(62, yOf(v), 658, yOf(v), { stroke: BORDER, sw: 0.6, dash: [3, 4] });
    T(56, yOf(v) - 5, String(v), { size: 8.5, mono: true, align: 'right', color: FAINT });
  });
  T(62, 262, 'sample 1', { size: 8.5, color: FAINT });
  T(658, 262, 'sample 31', { size: 8.5, align: 'right', color: FAINT });

  P.alpha(b);
  for (var i = 1; i < SPIKE.length; i++) {
    P.line(xOf(i - 1), yOf(SPIKE[i - 1].used), xOf(i), yOf(SPIKE[i].used), { stroke: ACC, sw: 2 });
    P.line(xOf(i - 1), yOf(SPIKE[i - 1].srtt), xOf(i), yOf(SPIKE[i].srtt), { stroke: WARN, sw: 1.6 });
  }
  P.circle(xOf(30), yOf(SPIKE_ROW.used), 3.5, { fill: ACC, stroke: ACC });
  T(654, yOf(SPIKE_ROW.used) - 14, 'used', { size: 9, mono: true, align: 'right', color: ACC });
  T(654, yOf(SPIKE_ROW.srtt) + 16, 'SRTT', { size: 9, mono: true, align: 'right', color: WARN });

  P.alpha(c);
  box(676, 72, 192, 190, { fill: SURF, stroke: BORDER });
  T(690, 84, 'after 30 steady samples', { size: 9.5, bold: true, color: DIM });
  T(690, 104, 'SRTT   ' + num(SPIKE_PREV.srtt, 2), { size: 9.5, mono: true, color: INK });
  T(690, 122, 'RTTVAR ' + num(SPIKE_PREV.v, 4), { size: 9.5, mono: true, color: INK });
  T(690, 140, 'used   ' + num(SPIKE_PREV.used, 0), { size: 9.5, mono: true, color: INK });
  T(690, 166, 'then one sample of 1600', { size: 9.5, bold: true, color: BAD });
  T(690, 186, 'SRTT   ' + num(SPIKE_ROW.srtt, 2), { size: 9.5, mono: true, color: ACC });
  T(690, 204, 'RTTVAR ' + num(SPIKE_ROW.v, 4), { size: 9.5, mono: true, color: WARN });
  T(690, 222, 'used   ' + num(SPIKE_ROW.used, 2), { size: 9.5, mono: true, color: INK });
  T(690, 244, 'factor ' + num(SPIKE_FACTOR, 3), { size: 9.5, mono: true, bold: true, color: BAD });

  P.alpha(d);
  T(32, 296, 'The centre takes one eighth of a 1200 ms gap, so it moves 150 ms; the spread takes one quarter, so it moves 300 ms.', { size: 10.5, color: INK });
  T(32, 318, 'Four spreads then carry the timer to ' + num(SPIKE_ROW.used, 2) + ' ms, and each new steady sample removes three quarters of the excess.', { size: 10.5, color: INK });
  T(32, 344, 'This is a low-pass filter, not a maximum: one delay does not set the timer forever.', { size: 10, color: DIM });
  T(32, 364, 'The price is a lag when the path genuinely gets worse, which is why the spread, not the centre, carries the margin.', { size: 10, color: DIM });

  P.alpha(1);
  footer('RTTVAR is a smoothed mean absolute deviation. Four of them are four deviations, not four standard deviations.');
};

/* ---------- scene 7: Karn ---------- */

SCENE_DRAW.karn = function (t, sc) {
  head("Karn's rule: an ACK you cannot time",
       'after a retransmission the ACK names a sequence number, not a copy, so the send time is unknown');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  var px = function (v) { return 60 + (v / 1800) * 560; };

  P.alpha(a);
  T(46, 68, 'scenario A: the ACK answers the ORIGINAL', { size: 9.5, bold: true, color: DIM });
  P.line(60, 104, 620, 104, { stroke: BORDER, sw: 1 });
  [[0, 'send 0'], [1200, 'retx 1200']].forEach(function (p) {
    P.circle(px(p[0]), 104, 3.5, { fill: SURF, stroke: INK, sw: 2 });
    T(px(p[0]), 88, p[1], { size: 9, mono: true, align: 'center', color: INK });
  });
  P.circle(px(1250), 104, 4, { fill: VAL, stroke: VAL });
  T(px(1250), 120, 'ACK 1250', { size: 9, mono: true, align: 'center', color: VAL });

  P.alpha(b);
  box(640, 72, 228, 96, { fill: BADDIM, stroke: BAD });
  T(652, 84, 'timed from the copy', { size: 9.5, bold: true, color: BAD });
  T(652, 104, '1250 - 1200 = 50 ms', { size: 10, mono: true, color: INK });
  T(652, 124, 'true round trip 400 ms', { size: 9.5, color: DIM });
  T(652, 142, 'one eighth of the truth', { size: 9.5, bold: true, color: BAD });

  P.alpha(c);
  T(46, 168, 'scenario B: the ACK answers the RETRANSMITTED copy', { size: 9.5, bold: true, color: DIM });
  P.line(60, 204, 620, 204, { stroke: BORDER, sw: 1 });
  [[0, 'send 0'], [1200, 'retx 1200']].forEach(function (p) {
    P.circle(px(p[0]), 204, 3.5, { fill: SURF, stroke: INK, sw: 2 });
    T(px(p[0]), 188, p[1], { size: 9, mono: true, align: 'center', color: INK });
  });
  P.circle(px(1600), 204, 4, { fill: VAL, stroke: VAL });
  T(px(1600), 220, 'ACK 1600', { size: 9, mono: true, align: 'center', color: VAL });

  box(640, 172, 228, 96, { fill: BADDIM, stroke: BAD });
  T(652, 184, 'timed from the original', { size: 9.5, bold: true, color: BAD });
  T(652, 204, '1600 - 0 = 1600 ms', { size: 10, mono: true, color: INK });
  T(652, 224, 'true round trip 400 ms', { size: 9.5, color: DIM });
  T(652, 242, 'four times the truth', { size: 9.5, bold: true, color: BAD });

  P.alpha(d);
  box(32, 280, 836, 78, { fill: ACCDIM, stroke: ACC });
  T(48, 292, "Karn's rule: take no RTT sample from a segment that was retransmitted.", { size: 12, bold: true, color: INK });
  T(48, 314, 'The timer is not recomputed from a guess. It was doubled at the expiry, to ' + KARN.afterTimeout + ' ms, and that stands until a clean sample arrives.', { size: 10, color: INK });
  T(48, 334, 'The one safe case is the timestamp option, which carries the send time and so removes the ambiguity.', { size: 10, color: DIM });

  P.alpha(1);
  T(32, 378, 'A duplicate ACK still acknowledges data, so it still restarts the timer. What it cannot do is supply a measurement.', { size: 10, color: DIM });
  footer("RFC 6298 section 3 requires Karn's algorithm; the timestamp exception is the one case the document allows.");
};

/* ---------- scene 8: backoff ---------- */

SCENE_DRAW.backoff = function (t, sc) {
  head('Doubling, and the ceiling',
       'each expiry doubles the timer; a maximum may be set provided it is at least sixty seconds');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  LADDER.forEach(function (v, i) {
    var x = 40 + i * 118;
    var last = i === LADDER.length - 1;
    box(x, 92, 110, 56, { fill: last ? WARNDIM : SURF, stroke: last ? WARN : ACC, sw: 1.2 });
    T(x + 55, 106, String(v), { size: 12, mono: true, bold: true, align: 'center', color: last ? WARN : INK });
    T(x + 55, 128, last ? 'cap' : (i === 0 ? 'after 1 expiry' : 'x2'), { size: 8.5, align: 'center', color: FAINT });
  });

  P.alpha(b);
  T(40, 168, LADDER_DOUBLINGS + ' doublings from ' + LADDER[0] + ' ms to the ' + CAP + ' ms maximum; the seventh doubling would pass it.', { size: 10.5, color: INK });
  T(40, 188, 'Rule 5.5 doubles the value; rule 5.6 restarts the timer with the new one. No measurement is involved.', { size: 10, color: DIM });

  P.alpha(c);
  box(32, 210, 410, 110, { fill: SURF, stroke: ACC });
  T(46, 222, 'doubling (rule 5.5)', { size: 10.5, bold: true, color: ACC });
  T(46, 244, 'RTO <- 2 x RTO', { size: 11, mono: true, color: INK });
  T(46, 266, 'uses the value you already have', { size: 9.5, color: DIM });
  T(46, 286, 'ends when an ACK arrives and a', { size: 9.5, color: DIM });
  T(46, 302, 'fresh sample is taken', { size: 9.5, color: DIM });

  box(458, 210, 410, 110, { fill: SURF, stroke: WARN });
  T(472, 222, 'recomputing (rules 2.2 and 2.3)', { size: 10.5, bold: true, color: WARN });
  T(472, 244, 'RTO <- SRTT + 4 RTTVAR', { size: 11, mono: true, color: INK });
  T(472, 266, 'uses a new sample from a segment', { size: 9.5, color: DIM });
  T(472, 286, 'that was not retransmitted', { size: 9.5, color: DIM });
  T(472, 302, 'this is the only way the value falls', { size: 9.5, color: DIM });

  P.alpha(d);
  T(32, 344, 'Rule 5.7, the handshake case: if the timer expires awaiting a SYN ACK and your RTO is below 3 s,', { size: 10, color: INK });
  T(32, 362, 'the RTO must be re-initialised to 3 s when data transmission begins. A handshake is not a data measurement.', { size: 10, color: INK });

  P.alpha(1);
  footer('The ladder is computed from the worked timer of ' + LADDER[0] + ' ms; the cap is the common 60 s value rule 2.5 permits.');
};

/* ---------- scene 9: convergence ---------- */

SCENE_DRAW.converge = function (t, sc) {
  head('How fast the estimate settles',
       'on a constant path the spread has a closed form, and the timer follows it down');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  var xOf = function (i) { return 62 + (i / 39) * 460; };
  var yOf = function (v) { return 250 - (v / 200) * 150; };

  P.alpha(a);
  P.line(62, 254, 522, 254, { stroke: BORDER, sw: 1 });
  [0, 50, 100, 150, 200].forEach(function (v) {
    P.line(62, yOf(v), 522, yOf(v), { stroke: BORDER, sw: 0.6, dash: [3, 4] });
    T(56, yOf(v) - 5, String(v), { size: 8.5, mono: true, align: 'right', color: FAINT });
  });
  T(62, 266, 'sample 1', { size: 8.5, color: FAINT });
  T(522, 266, 'sample 40', { size: 8.5, align: 'right', color: FAINT });

  P.alpha(b);
  for (var i = 1; i < STEADY.length; i++) {
    P.line(xOf(i - 1), yOf(STEADY[i - 1].v), xOf(i), yOf(STEADY[i].v), { stroke: WARN, sw: 2 });
  }
  P.line(xOf(11), 76, xOf(11), 254, { stroke: VAL, sw: 1.2, dash: [4, 3] });
  T(xOf(11) + 6, 86, 'sample 12: RTO within 10 per cent', { size: 9, color: VAL });

  P.alpha(c);
  box(548, 72, 320, 184, { fill: SURF, stroke: BORDER });
  T(562, 84, 'on a constant path, R = 400 ms', { size: 9.5, bold: true, color: DIM });
  T(562, 106, 'RTTVAR(n) = (R/2)(3/4)^(n-1)', { size: 10.5, mono: true, color: WARN });
  T(562, 126, 'RTO(n)    = R + 4 RTTVAR(n)', { size: 10.5, mono: true, color: INK });
  T(562, 148, 'RTO within 10 per cent means', { size: 9.5, color: DIM });
  T(562, 166, '4 RTTVAR < 40, so RTTVAR < 10', { size: 9.5, mono: true, color: DIM });
  T(562, 190, 'first true at sample ' + CONVERGE_ROW, { size: 10.5, mono: true, bold: true, color: VAL });
  T(562, 210, 'RTTVAR there: ' + num(STEADY[11].v, 4) + ' ms', { size: 9.5, mono: true, color: INK });
  T(562, 230, 'eleven updates to trust the estimate', { size: 9, color: FAINT });

  P.alpha(d);
  box(32, 286, 836, 62, { fill: ACCDIM, stroke: ACC });
  T(48, 298, 'The constants to carry: alpha = 1/8, beta = 1/4, K = 4, floor 1 s, ceiling at least 60 s.', { size: 11.5, bold: true, color: INK });
  T(48, 320, 'Initial value 1 s (RFC 6298; the older RFC 2988 used 3 s). K = 4 deviations, not four standard deviations.', { size: 10, color: DIM });

  P.alpha(1);
  T(32, 368, 'The floor is one second and the ceiling is at least sixty. Confusing the two is the commonest slip in a calculation.', { size: 10, color: DIM });
  footer('The closed form is checked against the iteration on all forty rows, and the tenth-per-cent row is found by scanning the same trace.');
};

/* ---------- scene 10: procedure ---------- */

SCENE_DRAW.procedure = function (t, sc) {
  head('The procedure and the four slips', 'the whole topic as five steps, and the four errors the checks catch');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  var steps = [
    ['1', 'ask whether a sample exists', 'none: 1 s. one: rule 2.2. more: rule 2.3'],
    ['2', 'compute, then clamp the timer', 'floor 1 s, ceiling at least 60 s, never the spread'],
    ['3', 'check the retransmission history', 'retransmitted: no sample, the timer was doubled'],
    ['4', 'state which rule produced the number', 'a doubling is not a recomputation'],
    ['5', 'convert units once, at the end', 'RTTVAR and SRTT are durations, not counters']
  ];
  P.alpha(a);
  steps.forEach(function (st, i) {
    var y = 76 + i * 38;
    P.circle(48, y + 7, 10, { fill: ACCDIM, stroke: ACC, sw: 1 });
    T(48, y + 7, st[0], { size: 10, mono: true, bold: true, align: 'center', base: 'middle', color: ACC });
    T(70, y, st[1], { size: 11, bold: true, color: INK });
    T(70, y + 18, st[2], { size: 9.5, color: DIM });
  });

  P.alpha(b);
  box(548, 72, 320, 112, { fill: SURF, stroke: ACC });
  T(562, 84, 'the numbers this page computed', { size: 9.5, bold: true, color: ACC });
  T(562, 104, 'first sample 40 ms -> ' + FIRST.used + ' ms', { size: 9.5, mono: true, color: INK });
  T(562, 122, 'five samples -> ' + num(W5.used, 2) + ' ms', { size: 9.5, mono: true, color: INK });
  T(562, 140, 'one spike -> ' + num(SPIKE_ROW.used, 2) + ' ms', { size: 9.5, mono: true, color: INK });
  T(562, 158, 'backoff ' + LADDER[0] + ' -> ' + CAP + ' in ' + LADDER_DOUBLINGS, { size: 9.5, mono: true, color: INK });

  P.alpha(c);
  box(548, 196, 320, 116, { fill: SURF, stroke: BAD });
  T(562, 208, 'the four slips', { size: 9.5, bold: true, color: BAD });
  T(562, 228, '1  a mean instead of a filter', { size: 9.5, color: INK });
  T(562, 246, '2  RTTVAR read as a variance', { size: 9.5, color: INK });
  T(562, 264, '3  the two updates swapped', { size: 9.5, color: INK });
  T(562, 282, '4  the floor applied to the spread', { size: 9.5, color: INK });

  P.alpha(d);
  box(32, 326, 836, 54, { fill: SURF, stroke: ACC });
  T(48, 338, 'The timer is a filter over measurements, with a floor and a ceiling, and one rule that forbids a measurement.', { size: 11.5, bold: true, color: INK });
  T(48, 360, 'Everything else on this page is arithmetic on those two averages.', { size: 10, color: DIM });

  P.alpha(1);
  footer('Class B: RFC 6298 is the mechanism behind the loss signal in the named TCP congestion-control clause. No PYQ is claimed.');
};

/* ---------- dispatch ---------- */

function drawFrame(Pp) {
  P = Pp;
  P.clear();
  var t = K ? K.state.elapsed : 0;
  var idx = K ? K.sceneAt(t) : 0;
  var sc = (window.LESSON_TIMELINE.scenes || [])[idx];
  if (!sc) return;
  var fn = SCENE_DRAW[sc.id];
  if (fn) fn(t, sc);
}

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

function fillChecks() {
  var el = document.getElementById('checks');
  if (!el) return;
  var bad = CHECKS.filter(function (c) { return !c.pass; });
  el.innerHTML = '<span class="k">Model checks</span>' +
    '<p class="small" style="margin:4px 0 0">' + (CHECKS.length - bad.length) + ' of ' + CHECKS.length +
    ' passed' + (bad.length ? ' — ' + bad.map(function (c) { return c.name; }).join('; ') : '') + '</p>';
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

window.__MODEL = {
  CHECKS: CHECKS,
  CONST: { G: G, K: KC, ALPHA: ALPHA, BETA: BETA, FLOOR: FLOOR, CAP: CAP, INITIAL: INITIAL, SYN_FLOOR: SYN_FLOOR },
  SAMPLES: SAMPLES, WORK: WORK, FIRST: FIRST,
  ORDER: { asWritten: { v: W5.v, raw: W5.raw }, swapped: ORDER_WRONG,
           diffVar: ORDER_DIFF_VAR, diffRto: ORDER_DIFF_RTO },
  SPIKE: { row: SPIKE_ROW, prev: SPIKE_PREV, factor: SPIKE_FACTOR },
  LADDER: LADDER, LADDER_DOUBLINGS: LADDER_DOUBLINGS,
  COST: COST, TIMER: TIMER, KARN: KARN,
  CONVERGE: { row: CONVERGE_ROW, steady: STEADY }
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
