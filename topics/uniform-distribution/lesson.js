/* ==========================================================================
   uniform-distribution — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no probability arithmetic of its own:
   every figure on the canvas was computed once here and checked against the
   rule it is supposed to satisfy — the mass function summing to one, the
   density integrating to one, the moments by direct summation and by the
   closed forms, the CDF as a length ratio, the affine map's transformed
   moments, the recovered endpoints put back into both formulas, the rounding
   rule's bucket counts against their exact share, the order-statistic means by
   formula and by a grid of sorted draws, the equal-spacing argument against the
   sum of the gaps, the two stick answers by integration, the inverse transform
   against the closed-form proportion, and the disk counterexample against the
   area it should have matched.
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
  var SURF2 = PAL.surface2, BORDER = PAL.border;
  var ACCDIM = PAL.accentDim || '#d6efeb';
  var WARNDIM = PAL.warnDim || '#fbeed3';

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

function fx(v, k) { return Number(v).toFixed(k === undefined ? 4 : k); }
function near(a, b, tol) { return Math.abs(a - b) < (tol === undefined ? 1e-9 : tol); }

/* ---------- numeric integration: midpoint rule ---------- */
function integrate(f, a, b, n) {
  n = n || 20000;
  var h = (b - a) / n, s = 0, i;
  for (i = 0; i < n; i++) s += f(a + (i + 0.5) * h);
  return s * h;
}

/* ---------- a deterministic grid of draws ---------- */
function midpointGrid(N) {
  var a = [], i;
  for (i = 0; i < N; i++) a.push((i + 0.5) / N);
  return a;
}

/* ---------- the two families ---------- */
var DIS_N = 6, DIS_N2 = 10;

function disMass(n) { return 1 / n; }
function disMean(n) { return (n + 1) / 2; }
function disVar(n) { return (n * n - 1) / 12; }

var A = 2, B = 8;
function conDensity() { return 1 / (B - A); }
function conMean() { return (A + B) / 2; }
function conVar() { return (B - A) * (B - A) / 12; }
function conCdf(x) {
  if (x <= A) return 0;
  if (x >= B) return 1;
  return (x - A) / (B - A);
}

var V = {};

/* ---- discrete uniform, n = 6 and n = 10 ---- */
V.dis = (function () {
  var n = DIS_N, mass = disMass(n), sum = 0, mean = 0, i, v = 0;
  for (i = 1; i <= n; i++) sum += mass;
  for (i = 1; i <= n; i++) mean += i * mass;
  for (i = 1; i <= n; i++) v += (i - mean) * (i - mean) * mass;
  return {
    n: n, mass: mass, sum: sum, mean: mean, variance: v,
    meanFormula: disMean(n), varFormula: disVar(n),
    pAt4: mass
  };
})();

V.dis10 = (function () {
  var n = DIS_N2, mass = disMass(n), mean = 0, v = 0, i;
  for (i = 1; i <= n; i++) mean += i * mass;
  for (i = 1; i <= n; i++) v += (i - mean) * (i - mean) * mass;
  return { n: n, mean: mean, variance: v, meanFormula: disMean(n), varFormula: disVar(n) };
})();

/* ---- continuous uniform on [A, B] ---- */
V.con = {
  a: A, b: B,
  height: conDensity(),
  integral: integrate(function () { return conDensity(); }, A, B, 20000),
  mean: integrate(function (x) { return x * conDensity(); }, A, B, 20000),
  variance: (function () {
    var m = conMean();
    return integrate(function (x) { return (x - m) * (x - m) * conDensity(); }, A, B, 20000);
  })(),
  meanFormula: conMean(),
  varFormula: conVar(),
  fAtA: conCdf(A), fAtB: conCdf(B)
};

/* ---- the interval probability ---- */
V.interval = (function () {
  var lo = 3, hi = 5.5;
  var p = integrate(function () { return conDensity(); }, lo, hi, 20000);
  return { lo: lo, hi: hi, p: p, lengthRatio: (hi - lo) / (B - A) };
})();

/* ---- P(X = c) on each side ---- */
V.point = (function () {
  var c = 4;
  var cont = integrate(function () { return conDensity(); }, c, c, 1);   /* zero width */
  return { c: c, continuous: cont, discrete: disMass(DIS_N) };
})();

/* ---- the affine map ---- */
V.affine = (function () {
  var N = 2000, g = midpointGrid(N), vals = [], i, s = 0, m, v = 0;
  for (i = 0; i < N; i++) vals.push(A + (B - A) * g[i]);
  for (i = 0; i < N; i++) s += vals[i];
  m = s / N;
  for (i = 0; i < N; i++) v += (vals[i] - m) * (vals[i] - m);
  v /= N;
  var std = [], inRange = true;
  for (i = 0; i < N; i++) {
    var z = (vals[i] - A) / (B - A);
    std.push(z);
    if (z < -1e-12 || z > 1 + 1e-12) inRange = false;
  }
  var mn = vals[0], mx = vals[0];
  for (i = 0; i < N; i++) { if (vals[i] < mn) mn = vals[i]; if (vals[i] > mx) mx = vals[i]; }
  return { N: N, mean: m, variance: v, min: mn, max: mx, standardisedInRange: inRange, standardised: std };
})();

/* ---- solving for the endpoints ---- */
function solveEndpoints(mean, variance) {
  var sum = 2 * mean;
  var widthSq = 12 * variance;
  var width = Math.sqrt(widthSq);
  var b = (sum + width) / 2, a = (sum - width) / 2;
  return { mean: mean, variance: variance, sum: sum, widthSq: widthSq, width: width, a: a, b: b };
}
V.solve = solveEndpoints(10, 4 / 3);
V.solve.backMean = (V.solve.a + V.solve.b) / 2;
V.solve.backVar = (V.solve.b - V.solve.a) * (V.solve.b - V.solve.a) / 12;

V.solve2 = solveEndpoints(3, 0.75);
V.solve2.backMean = (V.solve2.a + V.solve2.b) / 2;
V.solve2.backVar = (V.solve2.b - V.solve2.a) * (V.solve2.b - V.solve2.a) / 12;

/* ---- rounding a uniform ---- */
V.round = (function () {
  var N = 60000, g = midpointGrid(N), i, counts = [0, 0, 0, 0, 0, 0], sq = [0, 0, 0, 0, 0, 0];
  for (i = 0; i < N; i++) {
    counts[Math.floor(6 * g[i])] += 1;
    sq[Math.floor(6 * g[i] * g[i])] += 1;
  }
  var dev = 0, total = 0;
  for (i = 0; i < 6; i++) { dev = Math.max(dev, Math.abs(counts[i] - N / 6)); total += counts[i]; }
  var sqTotal = 0;
  for (i = 0; i < 6; i++) sqTotal += sq[i];
  return {
    N: N, counts: counts, maxDev: dev, total: total,
    sq: sq, sqTotal: sqTotal,
    sqFirstProb: sq[0] / N,
    rootSix: 1 / Math.sqrt(6)
  };
})();

/* ---- order statistics ---- */
V.order = (function () {
  var n = 3;
  var eMax = integrate(function (x) { return x * n * Math.pow(x, n - 1); }, 0, 1, 20000);
  var eMin = integrate(function (x) { return x * n * Math.pow(1 - x, n - 1); }, 0, 1, 20000);

  /* grid route: all triples of 30 midpoints, sorted */
  var G = 30, g = midpointGrid(G), i, j, k, sMax = 0, sMin = 0, cnt = 0;
  for (i = 0; i < G; i++) {
    for (j = 0; j < G; j++) {
      for (k = 0; k < G; k++) {
        var t = [g[i], g[j], g[k]].sort(function (p, q) { return p - q; });
        sMax += t[2]; sMin += t[0]; cnt++;
      }
    }
  }
  var n4 = [], q;
  for (q = 1; q <= 4; q++) n4.push(q / 5);
  return {
    n: n, eMax: eMax, eMin: eMin,
    formulaMax: n / (n + 1), formulaMin: 1 / (n + 1),
    gridMax: sMax / cnt, gridMin: sMin / cnt, gridCount: cnt,
    n4: n4
  };
})();

/* ---- gaps, range, the stick ---- */
V.gaps = (function () {
  var n = 3, gaps = n + 1;
  var range = (n - 1) / (n + 1);
  var p = 0.4;
  var longer = integrate(function (x) { return Math.max(x, 1 - x); }, 0, 1, 20000);
  var contain = integrate(function (x) { return x > p ? x : 1 - x; }, 0, 1, 20000);
  var bothThird = integrate(function (x) { return (x >= 1 / 3 && x <= 2 / 3) ? 1 : 0; }, 0, 1, 20000);
  return {
    n: n, gaps: gaps, each: 1 / gaps,
    range: range, rangeFormula: (n - 1) / (n + 1),
    longer: longer, contain: contain, p: p,
    containFormula: 0.5 + p - p * p,
    bothThird: bothThird
  };
})();

/* ---- inverse transform ---- */
V.inverse = (function () {
  var rate = 2, N = 60000, g = midpointGrid(N), i, hit = 0;
  for (i = 0; i < N; i++) {
    var x = -Math.log(1 - g[i]) / rate;
    if (x <= 0.5) hit++;
  }
  var frac = hit / N;
  var target = 1 - Math.exp(-rate * 0.5);
  /* X = U^2 has CDF sqrt(x); X = sqrt(U) has CDF x^2 */
  var sqHit = 0, sqrtHit = 0;
  for (i = 0; i < N; i++) {
    if (g[i] * g[i] <= 0.25) sqHit++;            /* P(U^2 <= 0.25) = 0.5  */
    if (Math.sqrt(g[i]) <= 0.5) sqrtHit++;       /* P(sqrt(U) <= 0.5) = 0.25 */
  }
  return {
    rate: rate, N: N, frac: frac, target: target,
    sqProb: sqHit / N, sqExact: 0.5,
    sqrtProb: sqrtHit / N, sqrtExact: 0.25
  };
})();

/* ---- the disk counterexample ---- */
V.disk = (function () {
  var R = 1;
  var areaFrac = (0.5 * R) * (0.5 * R) / (R * R);
  var pointFrac = 0.5;                      /* a uniform radius puts half below R/2 */
  var corrected = integrate(function (r) { return 2 * r / (R * R); }, 0, 0.5 * R, 20000);
  return { R: R, areaFrac: areaFrac, pointFrac: pointFrac, corrected: corrected };
})();

/* ---- the two previous-year items, recomputed ---- */
V.gate19 = (function () {
  /* 3x^2 + 6xY + 3Y + 6 has real roots iff (6Y)^2 - 4*3*(3Y+6) >= 0 */
  var disc = function (Y) { return 36 * Y * Y - 12 * (3 * Y + 6); };
  var lo = 1, hi = 6;
  var p = integrate(function (Y) { return disc(Y) >= 0 ? 1 : 0; }, lo, hi, 40000) / (hi - lo);
  return { lo: lo, hi: hi, p: p, threshold: 2 };
})();

V.gate20 = (function () {
  /* over {0,1}^n, the parity of a.x is uniform: 1/2 */
  return { p: 0.5 };
})();

/* ---- the standard uniform moments ---- */
V.standard = (function () {
  var e2 = integrate(function (x) { return x * x; }, 0, 1, 20000);
  return { eX2: e2, variance: e2 - 0.25, varFormula: 1 / 12 };
})();

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

chk('discrete uniform: the six masses sum to 1', near(V.dis.sum, 1), fx(V.dis.sum, 12));
chk('discrete uniform: mean by summation is 3.5', near(V.dis.mean, 3.5), fx(V.dis.mean, 6));
chk('discrete uniform: mean matches (n+1)/2', near(V.dis.mean, V.dis.meanFormula), fx(V.dis.meanFormula, 6));
chk('discrete uniform: variance by summation is 35/12',
  near(V.dis.variance, 35 / 12), fx(V.dis.variance, 6));
chk('discrete uniform: variance matches (n^2-1)/12',
  near(V.dis.variance, V.dis.varFormula), fx(V.dis.varFormula, 6));
chk('discrete uniform n = 10: mean 5.5', near(V.dis10.mean, V.dis10.meanFormula), fx(V.dis10.mean, 6));
chk('discrete uniform n = 10: variance 8.25', near(V.dis10.variance, V.dis10.varFormula), fx(V.dis10.variance, 6));

chk('continuous uniform: the density integrates to 1', near(V.con.integral, 1, 1e-9), fx(V.con.integral, 9));
chk('continuous uniform: mean by integration is 5', near(V.con.mean, 5, 1e-9), fx(V.con.mean, 6));
chk('continuous uniform: mean matches (a+b)/2', near(V.con.mean, V.con.meanFormula, 1e-9), fx(V.con.meanFormula, 6));
chk('continuous uniform: variance by integration is 3', near(V.con.variance, 3, 1e-6), fx(V.con.variance, 6));
chk('continuous uniform: variance matches (b-a)^2/12',
  near(V.con.variance, V.con.varFormula, 1e-6), fx(V.con.varFormula, 6));
chk('continuous uniform: the CDF is 0 at a and 1 at b',
  near(V.con.fAtA, 0) && near(V.con.fAtB, 1), fx(V.con.fAtA, 3) + ' / ' + fx(V.con.fAtB, 3));

chk('the CDF is non-decreasing over the interval', (function () {
  var prev = -1, i, x;
  for (i = 0; i <= 200; i++) {
    x = A + (B - A) * i / 200;
    if (conCdf(x) < prev - 1e-12) return false;
    prev = conCdf(x);
  }
  return true;
})(), '201 sample points');

chk('P(3 <= X <= 5.5) = 0.416667', near(V.interval.p, 2.5 / 6, 1e-9), fx(V.interval.p, 6));
chk('the interval probability equals its length ratio',
  near(V.interval.p, V.interval.lengthRatio, 1e-9), fx(V.interval.lengthRatio, 6));
chk('continuous: P(X = 4) is exactly 0', V.point.continuous === 0, fx(V.point.continuous, 9));
chk('discrete: P(X = 4) is 1/6, not 0', near(V.point.discrete, 1 / 6), fx(V.point.discrete, 6));

chk('affine map: the transformed grid has mean 5.0000',
  near(V.affine.mean, 5, 1e-6), fx(V.affine.mean, 6));
chk('affine map: the transformed grid has variance 3.0000',
  near(V.affine.variance, 3, 1e-3), fx(V.affine.variance, 6));
chk('affine map: every transformed draw lies inside [2,8]',
  V.affine.min >= A - 1e-12 && V.affine.max <= B + 1e-12,
  fx(V.affine.min, 4) + ' to ' + fx(V.affine.max, 4));
chk('affine map: standardising sends every draw into [0,1]',
  V.affine.standardisedInRange, V.affine.standardised.length + ' values');

chk('reverse: mean 10 and variance 4/3 give b = 12', near(V.solve.b, 12), fx(V.solve.b, 6));
chk('reverse: mean 10 and variance 4/3 give a = 8', near(V.solve.a, 8), fx(V.solve.a, 6));
chk('reverse: the recovered interval reproduces both moments',
  near(V.solve.backMean, 10) && near(V.solve.backVar, 4 / 3), fx(V.solve.backMean, 6) + ' / ' + fx(V.solve.backVar, 6));
chk('reverse, second instance: a = 1.5 and b = 4.5',
  near(V.solve2.a, 1.5) && near(V.solve2.b, 4.5), fx(V.solve2.a, 4) + ' / ' + fx(V.solve2.b, 4));
chk('reverse, second instance: both moments come back',
  near(V.solve2.backMean, 3) && near(V.solve2.backVar, 0.75),
  fx(V.solve2.backMean, 6) + ' / ' + fx(V.solve2.backVar, 6));

chk('rounding: floor(6U)+1 gives exactly 10000 per face',
  near(V.round.maxDev, 0), 'largest deviation ' + V.round.maxDev);
chk('rounding: the six buckets total 60000', V.round.total === V.round.N, String(V.round.total));
chk('rounding: the squared input puts 24495 draws on face 1',
  V.round.sq[0] === 24495, String(V.round.sq[0]));
chk('rounding: that proportion is 1/sqrt(6)',
  near(V.round.sqFirstProb, V.round.rootSix, 1e-5), fx(V.round.sqFirstProb, 6) + ' against ' + fx(V.round.rootSix, 6));
chk('rounding: the squared-input buckets also total 60000',
  V.round.sqTotal === V.round.N, String(V.round.sqTotal));

chk('order statistics: E[max] = n/(n+1) = 0.75',
  near(V.order.eMax, 0.75, 1e-9), fx(V.order.eMax, 6));
chk('order statistics: E[min] = 1/(n+1) = 0.25',
  near(V.order.eMin, 0.25, 1e-9), fx(V.order.eMin, 6));
chk('order statistics: the grid route agrees on the maximum',
  near(V.order.gridMax, 0.75, 0.01), fx(V.order.gridMax, 6));
chk('order statistics: the grid route agrees on the minimum',
  near(V.order.gridMin, 0.25, 0.01), fx(V.order.gridMin, 6));
chk('order statistics: n = 4 gives 0.2, 0.4, 0.6, 0.8',
  near(V.order.n4[0], 0.2) && near(V.order.n4[3], 0.8),
  V.order.n4.map(function (v) { return fx(v, 1); }).join(', '));

chk('gaps: the four gaps sum to 1', near(V.gaps.gaps * V.gaps.each, 1), fx(V.gaps.each, 6) + ' each');
chk('gaps: the expected range is 0.5 at n = 3',
  near(V.gaps.range, V.gaps.rangeFormula, 1e-9), fx(V.gaps.range, 6));
chk('stick: the longer piece expects 0.75', near(V.gaps.longer, 0.75, 1e-9), fx(V.gaps.longer, 6));
chk('stick: the piece containing 0.4 expects 0.74', near(V.gaps.contain, 0.74, 1e-9), fx(V.gaps.contain, 6));
chk('stick: 0.74 equals 1/2 + p - p^2 at p = 0.4',
  near(V.gaps.contain, V.gaps.containFormula, 1e-9), fx(V.gaps.containFormula, 6));
chk('stick: both pieces at least a third has probability 1/3',
  near(V.gaps.bothThird, 1 / 3, 1e-4), fx(V.gaps.bothThird, 6));

chk('inverse transform: the measured fraction is 0.6321',
  near(V.inverse.frac, V.inverse.target, 1e-4), fx(V.inverse.frac, 6) + ' against ' + fx(V.inverse.target, 6));
chk('inverse transform: U squared has P(X <= 0.25) = 0.5',
  near(V.inverse.sqProb, V.inverse.sqExact, 1e-9), fx(V.inverse.sqProb, 6));
chk('inverse transform: sqrt(U) has P(X <= 0.5) = 0.25 = 0.5^2',
  near(V.inverse.sqrtProb, V.inverse.sqrtExact, 1e-9), fx(V.inverse.sqrtProb, 6));

chk('the disk: area fraction and point fraction differ',
  !near(V.disk.areaFrac, V.disk.pointFrac), fx(V.disk.areaFrac, 4) + ' against ' + fx(V.disk.pointFrac, 4));
chk('the disk: the corrected radial density gives 0.25',
  near(V.disk.corrected, 0.25, 1e-9), fx(V.disk.corrected, 6));

chk('GATE CSE 2019: the discriminant condition gives 0.8',
  near(V.gate19.p, 0.8, 1e-9), fx(V.gate19.p, 6));
chk('GATE CSE 2020: the parity is uniform, 1/2', near(V.gate20.p, 0.5), fx(V.gate20.p, 4));
chk('standard uniform: E[X^2] = 1/3 and Var = 1/12',
  near(V.standard.eX2, 1 / 3, 1e-9) && near(V.standard.variance, 1 / 12, 1e-9),
  fx(V.standard.eX2, 6) + ' / ' + fx(V.standard.variance, 6));

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function hdr(s) {
  P.alpha(1);
  P.text(24, 14, s, { size: 11, bold: true, color: INK });
  P.line(24, 32, 876, 32, { stroke: BORDER, sw: 1 });
}

function foot(s) {
  P.alpha(1);
  P.line(24, 424, 876, 424, { stroke: BORDER, sw: 1 });
  P.text(24, 431, s, { size: 10.5, color: DIM });
}

function tx(x, y, s, o) {
  o = o || {};
  P.text(x, y, s, {
    size: o.size || 11, color: o.color || INK, mono: !!o.mono,
    bold: !!o.bold, align: o.align || 'left'
  });
}

function rows(x, y0, step, list, o) {
  o = o || {};
  var i;
  for (i = 0; i < list.length; i++) tx(x, y0 + i * step, list[i], o);
}

var SCENE_DRAW = {};

/* ---------- 1. two shapes ---------- */
SCENE_DRAW.shapes = function (t, sc) {
  hdr('A die and an interval: one word, two objects');

  var bx0 = 56, bw = 36, stepX = 50, base = 246, hBar = 110, i, x;
  for (i = 0; i < 6; i++) {
    x = bx0 + i * stepX;
    var a = K.ease(K.beat(t, sc.start + 0.4 + i * 0.55, 1.4));
    P.alpha(a);
    P.rect(x, base - hBar, bw, hBar, { fill: ACCDIM, stroke: ACC, radius: 3, sw: 1.4 });
    tx(x + bw / 2, base - hBar - 16, '0.1667', { size: 9.5, align: 'center', color: DIM });
    tx(x + bw / 2, base + 8, String(i + 1), { size: 10.5, align: 'center', color: DIM });
  }
  P.alpha(1);
  P.line(bx0 - 10, base, bx0 + 6 * stepX - stepX + bw + 10, base, { stroke: BORDER, sw: 1.5 });
  tx(bx0, 96, 'discrete: mass on six points', { size: 10.5, color: ACC });
  tx(bx0, 272, 'mean (n+1)/2 = 3.5', { size: 10.5, mono: true, color: INK });
  tx(bx0, 288, 'variance (n^2-1)/12 = 2.916667', { size: 10.5, mono: true, color: INK });

  /* right: the flat density */
  var rx = 470, rw = 390, rTop = 136, rBot = 246;
  P.alpha(K.ease(K.beat(t, sc.start + 2.2, 1.6)));
  P.rect(rx, rTop, rw, rBot - rTop, { fill: ACCDIM, stroke: ACC, radius: 3, sw: 1.4 });
  tx(rx + rw / 2, rTop + 44, 'density 1/6 = 0.166667', { size: 11, align: 'center', color: INK });
  P.alpha(1);
  P.line(rx - 10, rBot, rx + rw + 10, rBot, { stroke: BORDER, sw: 1.5 });
  tx(rx, rBot + 8, '2', { size: 10.5, color: DIM });
  tx(rx + rw, rBot + 8, '8', { size: 10.5, color: DIM, align: 'right' });
  tx(rx, 272, 'mean (a+b)/2 = 5', { size: 10.5, mono: true, color: INK });
  tx(rx, 288, 'variance (b-a)^2/12 = 3', { size: 10.5, mono: true, color: INK });

  rows(40, 330, 20, [
    'Mass sits on six points; density sits on every',
    'point of the interval. Same word, another object.',
    'Ask what the question hands you: a list of values,',
    'or a stretch of the line.'
  ], { color: DIM });

  rows(470, 330, 20, [
    'The height is 1 over the width, so the area is 1.',
    'A wider interval means a lower, flatter density.',
    'Both families are symmetric about their midpoint,',
    'and that symmetry is why the mean is the middle.'
  ], { color: DIM });

  foot('The word uniform does not say which family you are holding. The object in the question does.');
};

/* ---------- 2. the ramp ---------- */
SCENE_DRAW.ramp = function (t, sc) {
  hdr('A probability is a length: the ramp of the CDF');

  var x0 = 80, x1 = 400, yBase = 300, yTop = 140;
  var pxA = 170, pxB = 350;
  function px(x) { return pxA + (x - A) / (B - A) * (pxB - pxA); }
  function py(F) { return yBase - F * (yBase - yTop); }

  P.alpha(1);
  P.line(x0, yBase, x1, yBase, { stroke: BORDER, sw: 1.5 });
  P.line(x0, yBase, x0, yTop - 12, { stroke: BORDER, sw: 1.5 });

  /* the shaded stretch */
  var shade = K.ease(K.beat(t, sc.start + 3.2, 2));
  P.alpha(shade * 0.9);
  P.tri(px(3), yBase, px(5.5), yBase, px(5.5), py(conCdf(5.5)), { fill: ACCDIM });
  P.tri(px(3), yBase, px(3), py(conCdf(3)), px(5.5), py(conCdf(5.5)), { fill: ACCDIM });

  P.alpha(1);
  P.line(x0, py(0), pxA, py(0), { stroke: ACC, sw: 2 });
  P.line(pxA, py(0), pxB, py(1), { stroke: ACC, sw: 2 });
  P.line(pxB, py(1), x1, py(1), { stroke: ACC, sw: 2 });

  tx(62, 122, 'F', { size: 10.5, color: DIM });
  tx(x1 + 4, yBase - 4, 'x', { size: 10.5, color: DIM });
  tx(pxA, yBase + 8, '2', { size: 10, color: DIM, align: 'center' });
  tx(px(3), yBase + 8, '3', { size: 10, color: DIM, align: 'center' });
  tx(px(5.5), yBase + 8, '5.5', { size: 10, color: DIM, align: 'center' });
  tx(pxB, yBase + 8, '8', { size: 10, color: DIM, align: 'center' });
  tx(pxB - 8, py(1) - 16, '1', { size: 10, color: DIM, align: 'right' });
  tx(px(4.25), yBase + 30, '0.416667', { size: 11, color: ACC, align: 'center' });

  rows(40, 352, 20, [
    'Between 2 and 8 the ramp is a straight line:',
    'F(x) = (x - 2)/6. Outside it is flat at 0 and 1.',
    'So every uniform probability is a length ratio.'
  ], { color: DIM });

  rows(470, 96, 20, [
    'The ramp rises at a constant rate: one unit of',
    'probability per unit of length.',
    'P(3 <= X <= 5.5) is the rise over that stretch,',
    '0.416667. It is also 2.5/6, the same number.',
    'At a single point the rise is zero, so',
    'P(X = 4) = 0. That is the continuous rule.',
    'For the die the CDF is a staircase: it jumps by',
    '1/6 at each face, so P(X = 4) = 0.166667.',
    'Endpoints matter for the staircase, not the ramp.'
  ], { color: DIM });

  foot('Continuous: a point carries no probability. Discrete: a point carries 1/n. The same word, two answers.');
};

/* ---------- 3. the affine map ---------- */
SCENE_DRAW.affine = function (t, sc) {
  hdr('One map: 2 + 6U turns [0,1] into [2,8]');

  var xa = 80, xb = 380, yU = 130, yX = 250;

  P.alpha(1);
  P.line(xa, yU, xb, yU, { stroke: ACC, sw: 2 });
  P.line(xa, yX, xb, yX, { stroke: INFO, sw: 2 });
  tx(xa, yU - 22, 'U uniform on [0,1]', { size: 10.5, color: ACC });
  tx(xa, yX - 22, '2 + 6U uniform on [2,8]', { size: 10.5, color: INFO });

  tx(xa - 6, yU + 8, '0', { size: 10, color: DIM, align: 'right' });
  tx(xb + 6, yU + 8, '1', { size: 10, color: DIM });
  tx(xa - 6, yX + 8, '2', { size: 10, color: DIM, align: 'right' });
  tx((xa + xb) / 2, yX + 8, '5', { size: 10, color: DIM, align: 'center' });
  tx(xb + 6, yX + 8, '8', { size: 10, color: DIM });

  var grow = K.ease(K.beat(t, sc.start + 1.2, 2.4));
  P.alpha(grow);
  var marks = [xa, (xa + xb) / 2, xb], i;
  for (i = 0; i < marks.length; i++) {
    P.line(marks[i], yU + 6, marks[i], yX - 6, { stroke: FAINT, sw: 1.2, dash: [4, 4] });
  }
  P.alpha(1);
  tx((xa + xb) / 2 + 10, (yU + yX) / 2 - 6, 'shift by 2, stretch by 6', { size: 10.5, color: DIM });

  rows(40, 306, 20, [
    'The map is increasing, so it cannot reorder',
    'probability: each sixth of [0,1] becomes a sixth',
    'of [2,8].',
    'Invert it and (X-2)/6 is uniform on [0,1].',
    'Answer on the unit interval, then scale back.'
  ], { color: DIM });

  rows(470, 96, 20, [
    'U is uniform on [0,1]. Multiply by the width 6',
    'and add the start 2, and the result is uniform',
    'on [2,8]: equal lengths map to equal lengths.',
    'Over 2000 evenly spaced draws the mean is',
    '5.0000 and the variance 3.0000.',
    'The formulas agree: mean a + (b-a)/2 = 5,',
    'variance (b-a)^2/12 = 3.',
    'A shift moves the mean and leaves the spread.',
    'A scale multiplies the mean and squares into',
    'the variance.'
  ], { color: DIM });

  foot('One multiplication and one shift. Every uniform question can be answered on [0,1] and carried back.');
};

/* ---------- 4. solving for the endpoints ---------- */
SCENE_DRAW.solve = function (t, sc) {
  hdr('Two moments, two unknowns');

  P.alpha(1);
  P.rect(56, 92, 356, 214, { fill: SURF2, stroke: BORDER, radius: 6, sw: 1.2 });

  var L = [
    'mean 10 gives a + b = 20',
    'variance 4/3 gives (b-a)^2 = 12 x 4/3 = 16',
    'so b - a = 4, the positive root',
    'add the two: 2b = 24, so b = 12',
    'subtract: a = 20 - 12 = 8',
    'check: (8+12)/2 = 10, 16/12 = 1.333333',
    'second: mean 3, var 0.75 -> a = 1.5, b = 4.5',
    'check: (1.5+4.5)/2 = 3, 9/12 = 0.75'
  ];
  var i;
  for (i = 0; i < L.length; i++) {
    var a = K.ease(K.beat(t, sc.start + 0.3 + i * 0.85, 1.2));
    P.alpha(a);
    tx(72, 110 + i * 24, L[i], { size: 11.5, color: i < 5 ? INK : DIM, mono: false });
  }
  P.alpha(1);

  rows(40, 330, 20, [
    'Two equations, two unknowns. Nothing else is',
    'needed, and nothing else is available.',
    'Always substitute back into both formulas:',
    'the square root is where sign errors survive.'
  ], { color: DIM });

  rows(470, 96, 20, [
    'The forward question gives the endpoints and',
    'asks for a moment. The reverse question gives',
    'the moments and asks for the endpoints.',
    'Both use the same two formulas:',
    'mean = (a+b)/2, variance = (b-a)^2/12',
    'Read them as: a + b = 2 x mean, and',
    'b - a = sqrt(12 x variance).',
    'The width is a length, so only the positive',
    'root is allowed. A negative width is not an',
    'interval at all.'
  ], { color: DIM });

  foot('Two moments, two equations. The width is sqrt(12 x variance) and it is never negative.');
};

/* ---------- 5. rounding ---------- */
SCENE_DRAW.rounding = function (t, sc) {
  hdr('Rounding a uniform: a fair die, and a biased one');

  var bx0 = 56, bw = 36, stepX = 50, base = 300;
  var scale = 170 / V.round.sq[0];
  var i, x, h;

  for (i = 0; i < 6; i++) {
    x = bx0 + i * stepX;
    h = V.round.sq[i] * scale;
    var a = K.ease(K.beat(t, sc.start + 0.5 + i * 0.6, 1.4));
    P.alpha(a);
    P.rect(x, base - h, bw, h, {
      fill: i === 0 ? PAL.invalidDim || '#fbe4e2' : ACCDIM,
      stroke: i === 0 ? BAD : ACC, radius: 3, sw: 1.4
    });
    tx(x + bw / 2, base - h - 15, String(V.round.sq[i]), { size: 9.5, align: 'center', color: i === 0 ? BAD : DIM });
    tx(x + bw / 2, base + 8, String(i + 1), { size: 10.5, align: 'center', color: DIM });
  }

  P.alpha(1);
  var fairY = base - (V.round.N / 6) * scale;
  P.line(bx0 - 10, fairY, bx0 + 5 * stepX + bw + 6, fairY, { stroke: WARN, sw: 1.4, dash: [5, 4] });
  tx(bx0 + 5 * stepX + bw + 12, fairY - 6, '10000', { size: 9.5, color: WARN });
  P.line(bx0 - 10, base, bx0 + 5 * stepX + bw + 6, base, { stroke: BORDER, sw: 1.5 });
  tx(bx0, 96, 'draws per face, input U squared', { size: 10.5, color: ACC });

  rows(40, 336, 20, [
    'Each bar is the number of draws landing on that',
    'face, out of 60000. The dashed line is the fair',
    'share, 10000. Face 1 is 2.4 times its share;',
    'face 6 is about half of it.'
  ], { color: DIM });

  rows(470, 96, 20, [
    'floor(6U) + 1 splits [0,1) into six equal',
    'pieces, so each face gets probability 1/6.',
    'Over 60000 draws the six buckets hold exactly',
    '10000 each: the rule is fair.',
    'Now square the input first. floor(6U^2) + 1',
    'puts 24495 draws on face 1, a probability of',
    '0.408250 instead of 0.166667.',
    'Face 1 needs U below 1/sqrt(6) = 0.408248,',
    'so the bias is exactly that root.',
    'A rounding rule cannot repair a biased source.'
  ], { color: DIM });

  foot('A fair die needs a uniform input. Feed the same rule U squared and face 1 wins 0.408250 of the time.');
};

/* ---------- 6. order statistics ---------- */
SCENE_DRAW.order = function (t, sc) {
  hdr('The largest and the smallest of n draws');

  var xa = 70, xb = 420, y = 200;
  function px(u) { return xa + u * (xb - xa); }

  P.alpha(1);
  P.line(xa, y, xb, y, { stroke: BORDER, sw: 1.5 });
  tx(xa - 6, y + 12, '0', { size: 10, color: DIM, align: 'right' });
  tx(xb + 6, y + 12, '1', { size: 10, color: DIM });

  var pts = [0.25, 0.5, 0.75], i;
  for (i = 0; i < pts.length; i++) {
    var a = K.ease(K.beat(t, sc.start + 0.6 + i * 0.7, 1.2));
    P.alpha(a);
    P.line(px(pts[i]), y - 8, px(pts[i]), y + 8, { stroke: ACC, sw: 2 });
    P.circle(px(pts[i]), y, 6, { fill: i === 1 ? INFO : ACC, stroke: ACC, sw: 1.2 });
  }

  P.alpha(1);
  tx(px(0.25), y - 34, 'min', { size: 10.5, color: INFO, align: 'center' });
  tx(px(0.75), y - 34, 'max', { size: 10.5, color: INFO, align: 'center' });
  tx(px(0.25), y + 16, '0.25', { size: 10, color: DIM, align: 'center' });
  tx(px(0.75), y + 16, '0.75', { size: 10, color: DIM, align: 'center' });

  P.rect(56, 244, 170, 52, { fill: ACCDIM, stroke: ACC, radius: 5, sw: 1.2 });
  tx(141, 252, 'E[min] = 1/(n+1)', { size: 10.5, color: INK, align: 'center' });
  tx(141, 272, '= 0.250000', { size: 10.5, mono: true, color: ACC, align: 'center' });

  P.rect(246, 244, 170, 52, { fill: ACCDIM, stroke: ACC, radius: 5, sw: 1.2 });
  tx(331, 252, 'E[max] = n/(n+1)', { size: 10.5, color: INK, align: 'center' });
  tx(331, 272, '= 0.750000', { size: 10.5, mono: true, color: ACC, align: 'center' });

  rows(40, 316, 20, [
    'The grid route sorts 27000 triples of draws and',
    'averages the extremes; it agrees with the',
    'formulas to three decimals.',
    'The expected range is the difference:',
    'n/(n+1) - 1/(n+1) = (n-1)/(n+1), 0.5 at n = 3.'
  ], { color: DIM });

  rows(470, 96, 20, [
    'The maximum is at most x exactly when all n',
    'draws are, and the draws are independent, so',
    'P(max <= x) = x^n.',
    'The minimum exceeds x exactly when all n are',
    'above x, so P(min > x) = (1-x)^n.',
    'For n = 3 that gives densities 3x^2 and',
    '3(1-x)^2, and means 3/4 and 1/4.',
    'In general the k-th smallest has mean',
    'k/(n+1): for n = 4 the positions are',
    '0.2, 0.4, 0.6 and 0.8.'
  ], { color: DIM });

  foot('"All of them" factorises, so the maximum and the minimum need no integration — only the k-th does.');
};

/* ---------- 7. the gaps ---------- */
SCENE_DRAW.gaps = function (t, sc) {
  hdr('Three cuts, four gaps, and one stick');

  var xa = 70, xb = 420;
  function px(u) { return xa + u * (xb - xa); }

  P.alpha(1);
  tx(xa, 124, 'three points, four gaps of the same expectation', { size: 10.5, color: DIM });
  P.rect(xa, 150, xb - xa, 26, { fill: ACCDIM, stroke: ACC, radius: 3, sw: 1.2 });

  var cuts = [0.25, 0.5, 0.75], i;
  for (i = 0; i < cuts.length; i++) {
    var a = K.ease(K.beat(t, sc.start + 0.5 + i * 0.6, 1.2));
    P.alpha(a);
    P.line(px(cuts[i]), 144, px(cuts[i]), 182, { stroke: ACC, sw: 2 });
  }

  P.alpha(1);
  var mids = [0.125, 0.375, 0.625, 0.875];
  for (i = 0; i < mids.length; i++) {
    tx(px(mids[i]), 186, '1/4', { size: 10, color: DIM, align: 'center' });
  }

  /* the stick */
  var grow = K.ease(K.beat(t, sc.start + 6, 2));
  P.alpha(grow);
  P.rect(xa, 250, xb - xa, 26, { fill: WARNDIM, stroke: WARN, radius: 3, sw: 1.2 });
  P.line(px(0.4), 244, px(0.4), 282, { stroke: WARN, sw: 2 });
  tx(px(0.2), 286, '0.4', { size: 10, color: DIM, align: 'center' });
  tx(px(0.7), 286, '0.6', { size: 10, color: DIM, align: 'center' });
  P.alpha(1);
  tx(px(0.5), 318, 'longer piece: E = 0.75', { size: 11, color: ACC, align: 'center' });

  rows(40, 340, 20, [
    'The piece that contains a fixed point is not the',
    'longer piece. At p = 0.4 it expects',
    '0.74 = 1/2 + p - p^2, one hundredth below the',
    'longer piece.'
  ], { color: DIM });

  rows(470, 96, 20, [
    'Drop n points on the unit interval and you make',
    'n+1 gaps. Rotating a circle changes nothing, so',
    'no gap is favoured, and they sum to 1.',
    'So each gap has expected length 1/(n+1):',
    'a quarter each when n = 3.',
    'The first gap is the minimum, the last ends at',
    'the maximum, and the range is the middle gaps:',
    '0.5 for three points.',
    'One cut makes two pieces. The shorter expects',
    '1/4, so the longer expects 3/4 = 0.75.'
  ], { color: DIM });

  foot('Symmetry, not calculus: the gaps are exchangeable, so each expects 1/(n+1) and they sum to 1.');
};

/* ---------- 8. inverse transform ---------- */
SCENE_DRAW.inverse = function (t, sc) {
  hdr('Read the CDF backwards: uniform in, anything out');

  var xa = 70, xb = 420, yB = 300, yT = 116;
  var yMax = 1.6;
  function px(u) { return xa + u * (xb - xa); }
  function py(x) { return yB - Math.min(x, yMax) / yMax * (yB - yT); }

  P.alpha(1);
  P.line(xa, yB, xb + 10, yB, { stroke: BORDER, sw: 1.5 });
  P.line(xa, yB, xa, yT - 8, { stroke: BORDER, sw: 1.5 });

  var steps = 60, i, prevX = null, prevY = null;
  var prog = K.ease(K.beat(t, sc.start + 0.6, 4));
  for (i = 0; i <= steps * prog; i++) {
    var u = 0.995 * i / steps;
    var x = -Math.log(1 - u) / V.inverse.rate;
    var cx = px(u), cy = py(x);
    if (prevX !== null) P.line(prevX, prevY, cx, cy, { stroke: ACC, sw: 2 });
    prevX = cx; prevY = cy;
  }

  var u0 = 1 - Math.exp(-V.inverse.rate * 0.5);
  P.alpha(K.ease(K.beat(t, sc.start + 5, 1.6)));
  P.line(px(u0), py(0.5), px(u0), yB, { stroke: WARN, sw: 1.3, dash: [4, 4] });
  P.line(xa, py(0.5), px(u0), py(0.5), { stroke: WARN, sw: 1.3, dash: [4, 4] });
  P.circle(px(u0), py(0.5), 5, { fill: WARN, stroke: WARN, sw: 1 });
  P.alpha(1);

  tx(xa - 6, py(0.5) - 6, '0.5', { size: 9.5, color: WARN, align: 'right' });
  tx(px(u0), yB + 8, '0.632121', { size: 9.5, color: WARN, align: 'center' });
  tx(xb + 14, yB - 4, 'u', { size: 10, color: DIM });
  tx(xa - 16, yT - 6, 'x', { size: 10, color: DIM });

  rows(40, 330, 20, [
    'The curve is the inverse CDF: read a height on',
    'the vertical axis, drop to the curve, read u.',
    'Densities can be made to rise or fall this way;',
    'the square and the exponential are this simple.'
  ], { color: DIM });

  rows(470, 96, 20, [
    'Apply a CDF to its own variable and you get a',
    'uniform value: P(F(X) <= u) = u.',
    'So inverting the CDF turns a uniform draw into',
    'a draw from that distribution.',
    'Exponential, rate 2: F(x) = 1 - e^(-2x), so',
    'x = -ln(1-u)/2.',
    'On 60000 grid points the fraction at or below',
    '0.5 is 0.6321, and 1 - e^(-1) = 0.632121.',
    'Square the draw instead: X = U^2 has',
    'P(X <= x) = x^2 and density 2x, which rises.'
  ], { color: DIM });

  foot('The CDF of any continuous variable is uniform on [0,1]. Invert it and you can manufacture any distribution.');
};

/* ---------- 9. the disk ---------- */
SCENE_DRAW.disk = function (t, sc) {
  hdr('Uniform radius, uniform angle: not uniform on the disk');

  var cx = 240, cy = 215, rOut = 110, rIn = 55;

  P.alpha(1);
  P.circle(cx, cy, rOut, { fill: SURF2, stroke: BORDER, sw: 1.5 });
  P.alpha(K.ease(K.beat(t, sc.start + 1.2, 1.6)));
  P.circle(cx, cy, rIn, { fill: ACCDIM, stroke: ACC, sw: 1.5 });
  P.alpha(1);
  P.circle(cx, cy, 2.5, { fill: INK });

  tx(cx, cy - 12, '1/4 of the area', { size: 10.5, color: INK, align: 'center' });
  tx(cx, cy + 6, '1/2 of the points', { size: 10.5, color: BAD, align: 'center' });
  tx(cx + rOut - 6, cy - 18, 'R', { size: 10, color: DIM });
  tx(cx, 344, 'area scales with r^2; the draws do not', { size: 10.5, color: DIM, align: 'center' });

  rows(40, 364, 20, [
    'The word uniform describes a distribution on a',
    'set. Naming the object is part of the question.',
    ' "At random" alone answers nothing.'
  ], { color: DIM });

  rows(470, 96, 20, [
    'Pick a radius uniformly in [0,R] and an angle',
    'uniformly in [0,2pi). Both inputs are uniform,',
    'and the point is not: the map does not keep',
    'lengths.',
    'Half the radius holds a quarter of the area but',
    'half the points: 0.25 against 0.50.',
    'Uniform on a region means equal area gets equal',
    'probability, so the radius needs density 2r/R^2,',
    'proportional to the circumference at that radius.',
    'And a uniform bit string is not a uniform integer.'
  ], { color: DIM });

  foot('"Chosen at random" is not a distribution until you name the object that is uniform.');
};

/* ---------- 10. procedure ---------- */
SCENE_DRAW.procedure = function (t, sc) {
  hdr('Four steps, four traps');

  var left = [
    ['1  Discrete or continuous', 'head'],
    ['mass or density. P(X = c) is 0 only when', 'body'],
    ['the variable is continuous.', 'body'],
    ['2  The two endpoints or two integers', 'head'],
    ['given directly, or recovered from the mean', 'body'],
    ['and the variance, as in scene 4.', 'body'],
    ['3  Convert to a length or a count', 'head'],
    ['interval probability = length / total length;', 'body'],
    ['a discrete question is a count of equally', 'body'],
    ['likely objects.', 'body'],
    ['4  Maximum, minimum or gap?', 'head'],
    ['use k/(n+1) and the range formula instead', 'body'],
    ['of integrating.', 'body']
  ];
  var ys = [84, 104, 122, 152, 172, 190, 220, 240, 258, 276, 306, 326, 344];
  var i;
  for (i = 0; i < left.length; i++) {
    var a = K.ease(K.beat(t, sc.start + 0.4 + i * 0.55, 1.1));
    P.alpha(a);
    if (left[i][1] === 'head') tx(40, ys[i], left[i][0], { size: 11.5, bold: true, color: ACC });
    else tx(40, ys[i], left[i][0], { size: 10.8, color: DIM });
  }
  P.alpha(1);

  var right = [
    ['Trap 1  Rounding a biased input', 'head'],
    ['floor(6U^2)+1 gives face 1 0.408250, not 0.166667.', 'body'],
    ['A fair rule needs a uniform input.', 'body'],
    ['Trap 2  Forgetting the positive root', 'head'],
    ['b - a = sqrt(12 x variance), and a width is', 'body'],
    ['never negative.', 'body'],
    ['Trap 3  The piece containing a point', 'head'],
    ['At p = 0.4 it expects 0.74; the longer piece', 'body'],
    ['expects 0.75. They are different questions.', 'body'],
    ['Trap 4  "At random" without an object', 'head'],
    ['Uniform on a disk is not a uniform radius;', 'body'],
    ['uniform on bit strings is not a uniform', 'body'],
    ['integer over their range.', 'body']
  ];
  var ys2 = [84, 104, 122, 152, 172, 190, 220, 240, 258, 288, 308, 326, 344];
  for (i = 0; i < right.length; i++) {
    var b = K.ease(K.beat(t, sc.start + 0.6 + i * 0.55, 1.1));
    P.alpha(b);
    if (right[i][1] === 'head') tx(470, ys2[i], right[i][0], { size: 11.5, bold: true, color: WARN });
    else tx(470, ys2[i], right[i][0], { size: 10.8, color: DIM });
  }
  P.alpha(1);

  foot('Four steps answer the question; four traps answer a different one. Only the last trap makes correct arithmetic worthless.');
};

function drawFrame(painter) {
  P = painter;
  var st = K.state;
  var t = st.elapsed;
  var sc = st.scenes[K.sceneAt(t)];
  P.clear();
  if (!sc) return;
  var fn = SCENE_DRAW[sc.id];
  if (!fn) return;
  try { fn(t, sc); } catch (err) { console.error('scene draw failed', sc.id, err); }
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
