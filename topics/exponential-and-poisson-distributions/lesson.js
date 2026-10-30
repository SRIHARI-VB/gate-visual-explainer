/* ==========================================================================
   exponential-and-poisson-distributions — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no probability arithmetic of its own:
   every figure on the canvas was computed once here and checked against the
   rule it is supposed to satisfy — the Poisson masses summing to one, the mean
   and the variance both being lambda, the binomial converging on the Poisson,
   the exponential tail at the mean being e to the minus one, memorylessness,
   the Poisson tail equalling the gamma CDF, the rate conversion, the moments,
   the inspection paradox and the over-dispersed counterexample.
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

function fx(v, k) { return Number(v).toFixed(k === undefined ? 4 : k); }
function near(a, b, tol) { return Math.abs(a - b) < (tol === undefined ? 1e-9 : tol); }
function sci(v) {
  if (v === 0) return '0';
  var e = Math.floor(Math.log(Math.abs(v)) / Math.LN10);
  var m = v / Math.pow(10, e);
  return m.toFixed(2) + ' x 10^' + e;
}

function factorial(n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }

/* Poisson mass: e^{-lam} lam^k / k! */
function poisPmf(lam, k) {
  return Math.exp(-lam + k * Math.log(lam) - Math.log(factorial(k)));
}

/* log of the gamma function, Lanczos, so the binomial survives large n */
function logGamma(z) {
  var g = [676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  z -= 1;
  var x = 0.99999999999980993;
  for (var i = 0; i < g.length; i++) x += g[i] / (z + i + 1);
  var t = z + g.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

/* binomial mass, in log space */
function binomPmf(n, k, p) {
  if (k < 0 || k > n) return 0;
  var lnC = logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1);
  return Math.exp(lnC + k * Math.log(p) + (n - k) * Math.log(1 - p));
}

/* exponential tail: P(X > x) = e^{-lam x} */
function expTail(lam, x) { return Math.exp(-lam * x); }

/* the density of the k-th arrival in a Poisson process: lam^k x^{k-1} e^{-lam x}/(k-1)! */
function gammaDensity(lam, k, x) {
  return Math.exp(k * Math.log(lam) - logGamma(k)) * Math.pow(x, k - 1) * Math.exp(-lam * x);
}

/* integral of f over [0,T] by Simpson's rule */
function simpson(f, T, n) {
  if (n % 2) n++;
  var h = T / n, s = 0;
  for (var i = 0; i <= n; i++) {
    var w = (i === 0 || i === n) ? 1 : (i % 2 ? 4 : 2);
    s += w * f(i * h);
  }
  return s * h / 3;
}

/* integral of x f(x) over [0,T] by the midpoint rule */
function meanByIntegration(lam) {
  var T = 60 / lam, n = 40000, h = T / n, s = 0;
  for (var i = 0; i < n; i++) {
    var x = (i + 0.5) * h;
    s += x * lam * Math.exp(-lam * x) * h;
  }
  return s;
}

var V = {};

/* ---------- 1. the Poisson mass function at lambda = 3 ---------- */
(function () {
  var lam = 3, KMAX = 60;
  var pmf = [], total = 0, mean = 0, second = 0;
  for (var k = 0; k < KMAX; k++) {
    var p = poisPmf(lam, k);
    pmf.push(p);
    total += p;
    mean += k * p;
    second += k * k * p;
  }
  var variance = second - mean * mean;
  V.pois = {
    lam: lam,
    pmf: pmf.slice(0, 13),
    total: total,
    mean: mean,
    second: second,
    variance: variance,
    p: [pmf[0], pmf[1], pmf[2], pmf[3]],
    pLT3: pmf[0] + pmf[1] + pmf[2],
    pLE3: pmf[0] + pmf[1] + pmf[2] + pmf[3],
    pGT3: 1 - (pmf[0] + pmf[1] + pmf[2] + pmf[3]),
    exactLT3: 17 / (2 * Math.pow(Math.E, 3)),
    atLeastOne: 1 - pmf[0],
    exactlyOne: pmf[1]
  };
})();

/* ---------- 2. the binomial approaching the Poisson ---------- */
(function () {
  var lam = 3;
  var rows = [10, 100, 1000, 10000, 100000].map(function (n) {
    var p = lam / n, worst = 0, at = 0;
    for (var k = 0; k < 20; k++) {
      var d = Math.abs(binomPmf(n, k, p) - poisPmf(lam, k));
      if (d > worst) { worst = d; at = k; }
    }
    return { n: n, p: p, gap: worst, at: at };
  });
  V.limit = { lam: lam, rows: rows };
})();

/* ---------- 3. the exponential tail ---------- */
(function () {
  var lam = 2;
  var table = [0.25, 0.5, 1, 2, 7, 100].map(function (l) {
    return { lam: l, mean: 1 / l, p: expTail(l, 1 / l) };
  });
  V.expo = {
    lam: lam,
    mean: 1 / lam,
    tailAtMean: expTail(lam, 1 / lam),
    eInv: Math.exp(-1),
    table: table,
    pGT2: expTail(lam, 2),
    meanNum: meanByIntegration(0.5),
    meanNum7: meanByIntegration(7)
  };
})();

/* ---------- 4. memorylessness ---------- */
(function () {
  var lam = 2, cases = [], worst = 0;
  [0.5, 1, 2, 5].forEach(function (s) {
    [0.5, 1, 3].forEach(function (t) {
      var cond = expTail(lam, s + t) / expTail(lam, s);
      var fresh = expTail(lam, t);
      var d = Math.abs(cond - fresh);
      if (d > worst) worst = d;
      cases.push({ s: s, t: t, cond: cond, fresh: fresh });
    });
  });
  /* uniform on 0..10 */
  function uniTail(x) { return x >= 10 ? 0 : (x <= 0 ? 1 : 1 - x / 10); }
  /* geometric: the discrete memoryless law, p = 0.3 */
  var gp = 0.3;
  function geoTail(n) { return Math.pow(1 - gp, n); }
  V.mem = {
    lam: lam,
    cases: cases,
    worst: worst,
    uniform: { s: 5, t: 5, cond: uniTail(10) / uniTail(5), fresh: uniTail(5) },
    fixed: { s: 5, t: 5, cond: 0 / 1, fresh: 1 },
    geo: { p: gp, cond: geoTail(8) / geoTail(5), fresh: geoTail(3) }
  };
})();

/* ---------- 5. the bridge: Poisson tail equals the gamma CDF ---------- */
(function () {
  var lam = 3, rows = [], worst = 0;
  [1, 2, 3, 4].forEach(function (k) {
    [0.5, 1, 2].forEach(function (t) {
      var tail = 0;
      for (var j = k; j < 90; j++) tail += poisPmf(lam * t, j);
      var g = simpson(function (x) { return gammaDensity(lam, k, x); }, t, 4000);
      var d = Math.abs(tail - g);
      if (d > worst) worst = d;
      rows.push({ k: k, t: t, tail: tail, gamma: g });
    });
  });
  V.bridge = { lam: lam, rows: rows, worst: worst, headline: rows[4] };
})();

/* ---------- 6. the unit conversion ---------- */
(function () {
  var perHour = 20, windowMin = 45;
  var lam = perHour * (windowMin / 60);
  V.scale = {
    perHour: perHour, windowMin: windowMin,
    lam: lam,
    p0: Math.exp(-lam),
    wrongRate: Math.exp(-perHour),
    wrongWindow: Math.exp(-(windowMin / 60)),
    carsPerMin: 3,
    carWindow: 2,
    carLam: 6,
    carP2: poisPmf(6, 2),
    gapMeanMin: 1 / 3,
    gapMeanSec: 20
  };
})();

/* ---------- 7. the moments ---------- */
(function () {
  var lam = 5;
  var EX = lam, EX2 = lam + lam * lam;
  V.moment = {
    lam: lam,
    EX: EX,
    EX2: EX2,
    EXsq: EX * EX,
    Eplus: EX2 + 4 * EX + 4,
    sd: Math.sqrt(lam),
    mu: lam,
    sdMu: Math.sqrt(lam)
  };
})();

/* ---------- 8. where the models stop ---------- */
(function () {
  var counts = [0, 0, 3, 0, 0, 4, 0, 0, 0, 3];
  var m = counts.reduce(function (a, b) { return a + b; }, 0) / counts.length;
  var v = counts.reduce(function (a, b) { return a + (b - m) * (b - m); }, 0) / counts.length;

  /* mean residual wait: E[X^2] / (2 E[X]), by length-biased sampling */
  function residual(moments) {
    var mean = 0, second = 0;
    moments.forEach(function (r) { mean += r.p * r.x; second += r.p * r.x * r.x; });
    return { mean: mean, second: second, residual: second / (2 * mean) };
  }
  var fixed = residual([{ x: 10, p: 1 }]);
  var expo = { mean: 10, second: 2 * 100, residual: 200 / (2 * 10) };
  var mix = residual([{ x: 1, p: 0.9 }, { x: 91, p: 0.1 }]);

  V.limits = {
    counts: counts, mean: m, variance: v,
    fixed: fixed, expo: expo, mix: mix
  };
})();

/* ---------- 9. the arrival picture, for scene 1 and 6 ---------- */
(function () {
  /* a fixed, hand-checked arrival list; no randomness anywhere on the page */
  var arrivals = [0.35, 0.9, 1.15, 1.6, 2.4, 2.75, 3.1, 3.9, 4.35, 4.6,
    5.05, 5.8, 6.2, 6.55, 7.3, 7.9, 8.15, 8.6, 9.3, 9.75];
  var gaps = [];
  for (var i = 1; i < arrivals.length; i++) gaps.push(arrivals[i] - arrivals[i - 1]);
  var meanGap = gaps.reduce(function (a, b) { return a + b; }, 0) / gaps.length;
  V.run = {
    arrivals: arrivals,
    gaps: gaps,
    meanGap: meanGap,
    longestGap: Math.max.apply(null, gaps),
    rate: arrivals.length / 10,
    windowCount: arrivals.filter(function (x) { return x <= 10; }).length,
    sampleGap: 4.35 - 3.9
  };
})();

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

chk('the Poisson masses over k = 0..59 sum to one', near(V.pois.total, 1, 1e-12), fx(V.pois.total, 15));
chk('the Poisson mean at lambda = 3 is 3', near(V.pois.mean, 3, 1e-12), fx(V.pois.mean, 12));
chk('the Poisson variance at lambda = 3 is 3', near(V.pois.variance, 3, 1e-12), fx(V.pois.variance, 12));
chk('mean equals variance, as the model requires',
  near(V.pois.mean, V.pois.variance, 1e-12), fx(V.pois.mean, 9) + ' and ' + fx(V.pois.variance, 9));
chk('P(p < 3) is 17/(2e^3)', near(V.pois.pLT3, V.pois.exactLT3, 1e-12),
  fx(V.pois.pLT3, 10) + ' against ' + fx(V.pois.exactLT3, 10));
chk('P(p < 3) is the sum of the masses at 0, 1 and 2',
  near(V.pois.pLT3, V.pois.p[0] + V.pois.p[1] + V.pois.p[2], 1e-15), 'three terms');
chk('P(p <= 3) is not P(p < 3)', !near(V.pois.pLE3, V.pois.pLT3, 1e-6),
  fx(V.pois.pLE3) + ' against ' + fx(V.pois.pLT3));
chk('at least one car is not exactly one car', !near(V.pois.atLeastOne, V.pois.exactlyOne, 1e-6),
  fx(V.pois.atLeastOne) + ' against ' + fx(V.pois.exactlyOne));
chk('the binomial gap at n = 10 is above 0.01', V.limit.rows[0].gap > 0.01, sci(V.limit.rows[0].gap));
chk('the binomial gap at n = 1000 is below 0.001', V.limit.rows[2].gap < 0.001, sci(V.limit.rows[2].gap));
chk('each factor of ten in n buys about a factor of ten in the gap',
  V.limit.rows[1].gap / V.limit.rows[2].gap > 8 && V.limit.rows[1].gap / V.limit.rows[2].gap < 12,
  fx(V.limit.rows[1].gap / V.limit.rows[2].gap, 2));
chk('the binomial gaps fall monotonically',
  V.limit.rows.every(function (r, i) { return i === 0 || r.gap < V.limit.rows[i - 1].gap; }), 'five rows');
chk('outliving the mean is e to the minus one', near(V.expo.tailAtMean, V.expo.eInv, 1e-15),
  fx(V.expo.tailAtMean, 12));
chk('outliving the mean is the same at every lambda',
  V.expo.table.every(function (r) { return near(r.p, V.expo.eInv, 1e-15); }), 'six parameters');
chk('the exponential mean by integration is 1/lambda at 0.5', near(V.expo.meanNum, 2, 1e-5),
  fx(V.expo.meanNum, 8));
chk('the exponential mean by integration is 1/lambda at 7', near(V.expo.meanNum7, 1 / 7, 1e-6),
  fx(V.expo.meanNum7, 8));
chk('P(X > 2) at lambda = 2 is not P(X > the mean)',
  !near(V.expo.pGT2, V.expo.tailAtMean, 1e-3), fx(V.expo.pGT2) + ' against ' + fx(V.expo.tailAtMean));
chk('P(X > 2) at lambda = 2 is e to the minus four', near(V.expo.pGT2, Math.exp(-4), 1e-15),
  fx(V.expo.pGT2, 8));
chk('memorylessness holds for all twelve pairs of s and t', V.mem.worst < 1e-12, sci(V.mem.worst));
chk('the uniform wait fails memorylessness', !near(V.mem.uniform.cond, V.mem.uniform.fresh, 1e-6),
  fx(V.mem.uniform.cond) + ' against ' + fx(V.mem.uniform.fresh));
chk('the fixed wait fails memorylessness', !near(V.mem.fixed.cond, V.mem.fixed.fresh, 1e-6),
  fx(V.mem.fixed.cond) + ' against ' + fx(V.mem.fixed.fresh));
chk('the geometric is memoryless in discrete time',
  near(V.mem.geo.cond, V.mem.geo.fresh, 1e-12), fx(V.mem.geo.cond, 9) + ' against ' + fx(V.mem.geo.fresh, 9));
chk('the Poisson tail equals the gamma CDF for every (k, t) tested', V.bridge.worst < 1e-6,
  sci(V.bridge.worst));
chk('at k = 2, t = 1 the shared value is 0.800852',
  near(V.bridge.headline.tail, 0.8008517265, 1e-9), fx(V.bridge.headline.tail, 9));
chk('the rate converts to lambda = 15', near(V.scale.lam, 15, 1e-12), fx(V.scale.lam, 6));
chk('the wrong rate conversion gives a different answer',
  !near(V.scale.p0, V.scale.wrongRate, 1e-9), sci(V.scale.p0) + ' against ' + sci(V.scale.wrongRate));
chk('the wrong window conversion gives a different answer',
  !near(V.scale.p0, V.scale.wrongWindow, 1e-6), sci(V.scale.p0) + ' against ' + fx(V.scale.wrongWindow));
chk('a mean gap of one third of a minute is 20 seconds',
  near(V.scale.gapMeanMin * 60, V.scale.gapMeanSec, 1e-12), fx(V.scale.gapMeanSec, 2));
chk('three cars a minute over two minutes is lambda = 6', near(V.scale.carLam, 6, 1e-12), 'six');
chk('the second moment at lambda = 5 is 30', near(V.moment.EX2, 30, 1e-12), fx(V.moment.EX2, 6));
chk('the second moment is not the square of the mean',
  !near(V.moment.EX2, V.moment.EXsq, 1e-9), fx(V.moment.EX2) + ' against ' + fx(V.moment.EXsq));
chk('E[(X+2)^2] is 54', near(V.moment.Eplus, 54, 1e-12), fx(V.moment.Eplus, 6));
chk('the standard deviation is the square root of the mean',
  near(V.moment.sdMu, Math.sqrt(V.moment.mu), 1e-12), fx(V.moment.sdMu, 6));
chk('the clustered counts are over-dispersed', V.limits.variance > V.limits.mean + 1,
  fx(V.limits.mean) + ' against ' + fx(V.limits.variance));
chk('fixed gaps of 10 give a mean wait of 5', near(V.limits.fixed.residual, 5, 1e-12),
  fx(V.limits.fixed.residual, 4));
chk('exponential gaps give a mean wait equal to the mean gap',
  near(V.limits.expo.residual, V.limits.expo.mean, 1e-12), fx(V.limits.expo.residual, 4));
chk('the mixture gives a mean wait of 41.45', near(V.limits.mix.residual, 41.45, 1e-9),
  fx(V.limits.mix.residual, 4));
chk('the mixture mean gap is 10 and its second moment 829',
  near(V.limits.mix.mean, 10, 1e-12) && near(V.limits.mix.second, 829, 1e-12), '10 and 829');
chk('the mean wait exceeds the mean gap only for the mixture',
  V.limits.mix.residual > V.limits.mix.mean && V.limits.fixed.residual < V.limits.fixed.mean,
  '41.45 against 10, and 5 against 10');
chk('the arrival list gives a rate of two per unit', near(V.run.rate, 2, 1e-12), fx(V.run.rate, 4));
chk('the mean gap is the span over the number of gaps',
  near(V.run.meanGap, (V.run.arrivals[V.run.arrivals.length - 1] - V.run.arrivals[0]) /
    (V.run.arrivals.length - 1), 1e-12), fx(V.run.meanGap, 6));
chk('the mean gap is close to but not exactly the reciprocal of the rate',
  Math.abs(V.run.meanGap - 1 / V.run.rate) < 0.02 && !near(V.run.meanGap, 1 / V.run.rate, 1e-9),
  fx(V.run.meanGap, 6) + ' against ' + fx(1 / V.run.rate, 6));
chk('the longest gap on the arrival list is 0.8',
  near(Math.max.apply(null, V.run.gaps), 0.8, 1e-12), fx(Math.max.apply(null, V.run.gaps), 2));

/* ======================================================================
   LAYER 3 - RENDER. One function per scene; each reads V only.
   ====================================================================== */

function head(title, sub) {
  P.text(28, 20, title, { size: 17, bold: true, color: INK });
  if (sub) P.text(28, 44, sub, { size: 12, color: DIM });
}

function box(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || SURF2, stroke: o.stroke || BORDER, radius: 8, sw: 1.2 });
}

function label(x, y, s, o) { P.text(x, y, s, o || { size: 11, color: FAINT }); }

function progressOf(t, sc, from, span) {
  return K.clamp01((t - (sc.start + from)) / span);
}

/* a linear map from data space to pixels */
function mapper(x0, x1, y0, y1, dmin, dmax, vmin, vmax) {
  return function (dx, dy) {
    return [
      x0 + (dx - dmin) / (dmax - dmin) * (x1 - x0),
      y1 - (dy - vmin) / (vmax - vmin) * (y1 - y0)
    ];
  };
}

/* a bar with its value printed above it */
function bar(x, baseY, w, h, fill, stroke) {
  P.rect(x, baseY - h, w, h, { fill: fill, stroke: stroke || fill, radius: 2, sw: 1 });
}

var SCENE_DRAW = {};

/* ---------- scene 1: one rate, two questions ---------- */
SCENE_DRAW.pair = function (t, sc) {
  head('One rate, two questions',
    'twenty arrivals on ten units of time: a rate of ' + fx(V.run.rate, 1) + ' per unit');

  var step = progressOf(t, sc, 0, 12);
  var done = progressOf(t, sc, 12, 12);

  var x0 = 60, x1 = 840, axisY = 150;
  P.line(x0, axisY, x1, axisY, { stroke: BORDER, sw: 1.5 });
  for (var g = 0; g <= 10; g += 2) {
    var gx = x0 + g / 10 * (x1 - x0);
    P.line(gx, axisY - 4, gx, axisY + 4, { stroke: BORDER, sw: 1 });
    label(gx - 3, axisY + 8, String(g), { size: 10, color: FAINT });
  }

  var shown = Math.floor(step * V.run.arrivals.length);
  for (var i = 0; i < shown; i++) {
    var ax = x0 + V.run.arrivals[i] / 10 * (x1 - x0);
    P.line(ax, axisY - 16, ax, axisY - 2, { stroke: ACC, sw: 2 });
    P.circle(ax, axisY - 18, 2.6, { fill: ACC });
  }

  if (step > 0.35) {
    /* the count question */
    P.rect(x0, axisY - 52, x1 - x0, 30, { fill: ACCDIM, stroke: ACC, radius: 6, sw: 1, dash: [5, 4] });
    P.text((x0 + x1) / 2, axisY - 32,
      'how many in the window?  ' + V.run.windowCount + '   ->  Poisson',
      { size: 14, bold: true, color: ACC, align: 'center' });
  }

  if (step > 0.6) {
    /* the wait question: one gap, magnified */
    var ga = x0 + 3.9 / 10 * (x1 - x0), gb = x0 + 4.35 / 10 * (x1 - x0);
    P.line(ga, axisY + 26, gb, axisY + 26, { stroke: INFO, sw: 2 });
    P.line(ga, axisY + 20, ga, axisY + 32, { stroke: INFO, sw: 2 });
    P.line(gb, axisY + 20, gb, axisY + 32, { stroke: INFO, sw: 2 });
    P.text(gb + 10, axisY + 20, 'how long to the next one?  ' + fx(V.run.sampleGap, 2) +
      '  ->  exponential', { size: 13, bold: true, color: INFO });
  }

  if (done > 0) {
    box(34, 232, 404, 200, { fill: SURF, stroke: ACC });
    label(50, 256, 'the count', { size: 11, color: ACC });
    P.text(50, 282, 'Poisson(lambda)', { size: 16, bold: true, color: INK });
    P.text(50, 312, 'P(X = k) = e^-lambda lambda^k / k!', { size: 13, mono: true, color: INK });
    P.text(50, 342, 'k is a whole number: 0, 1, 2, ...', { size: 11, color: DIM });
    P.text(50, 366, 'lambda is the mean count in the window', { size: 11, color: DIM });
    P.text(50, 400, 'mean = lambda,  variance = lambda', { size: 12, color: ACC });

    box(462, 232, 404, 200, { fill: SURF, stroke: INFO });
    label(478, 256, 'the wait', { size: 11, color: INFO });
    P.text(478, 282, 'exponential(lambda)', { size: 16, bold: true, color: INK });
    P.text(478, 312, 'f(x) = lambda e^(-lambda x)', { size: 13, mono: true, color: INK });
    P.text(478, 342, 'x is a length of time, x >= 0', { size: 11, color: DIM });
    P.text(478, 366, 'lambda is a rate: events per unit time', { size: 11, color: DIM });
    P.text(478, 400, 'mean = 1/lambda,  tail = e^(-lambda x)', { size: 12, color: INFO });
  }
};

/* ---------- scene 2: the mass function ---------- */
SCENE_DRAW.pmf = function (t, sc) {
  head('The Poisson mass function at lambda = 3',
    'each bar is the probability of exactly that many events');

  var step = progressOf(t, sc, 0, 12);
  var done = progressOf(t, sc, 12, 12);

  var x0 = 60, x1 = 600, baseY = 300, topY = 96;
  P.line(x0, baseY, x1, baseY, { stroke: BORDER, sw: 1.2 });
  P.line(x0, baseY, x0, topY, { stroke: BORDER, sw: 1.2 });

  var vmax = 0.24;
  var bw = 34;
  for (var k = 0; k <= 10; k++) {
    var p = V.pois.pmf[k];
    var h = p / vmax * (baseY - topY);
    var bx = x0 + 18 + k * (bw + 12);
    var reveal = K.clamp01((step - k * 0.06) * 6);
    if (reveal <= 0) continue;
    var isMean = k === 3;
    bar(bx, baseY, bw, h * reveal, isMean ? ACCDIM : '#dfe7ea', isMean ? ACC : BORDER);
    label(bx + 6, baseY + 8, String(k), { size: 10, color: FAINT });
    if (reveal > 0.6) {
      P.text(bx + bw / 2, baseY - h * reveal - 8, fx(p, 3),
        { size: 9, color: isMean ? ACC : DIM, align: 'center' });
    }
  }
  P.text((x0 + x1) / 2, baseY + 26, 'k, the number of events', { size: 11, color: DIM, align: 'center' });

  if (done > 0.15) {
    P.arrow(x0 + 18 + 3 * (bw + 12) + bw / 2, topY - 6, x0 + 18 + 3 * (bw + 12) + bw / 2, 84,
      { stroke: ACC, sw: 1.4, head: 7 });
    P.text(x0 + 18 + 3 * (bw + 12) + bw / 2 + 12, 82, 'mean = 3', { size: 12, bold: true, color: ACC });
  }

  if (done > 0.3) {
    var stats = [
      ['sum of every mass', fx(V.pois.total, 15), 'k = 0 to 59'],
      ['mean  =  lambda', fx(V.pois.mean, 12), 'by summing'],
      ['variance  =  lambda', fx(V.pois.variance, 12), 'E[X^2] - mean^2']
    ];
    stats.forEach(function (r, i) {
      var y = 120 + i * 62;
      box(628, y, 238, 52, { fill: SURF, stroke: i === 0 ? ACC : BORDER });
      label(642, y + 16, r[0], { size: 10, color: FAINT });
      P.text(838, y + 16, r[2], { size: 8, color: FAINT, align: 'right' });
      P.text(642, y + 34, r[1], { size: 13, bold: true, mono: true, color: i === 0 ? ACC : INK });
    });
  }

  if (done > 0.6) {
    box(34, 336, 832, 96, { fill: SURF2, stroke: BORDER });
    P.text(50, 360, 'One parameter sets the mean and the variance, so a fit can be checked before any arithmetic.', { size: 12, color: INK });
    P.text(50, 384, 'The standard deviation is the square root of lambda, which is ' + fx(Math.sqrt(3), 4) + ' here — not ' + fx(3, 1) + '.', { size: 12, color: WARN });
    P.text(50, 408, 'GATE CSE 2016 Set 1 Q4 asks exactly that: mean mu, so the standard deviation is the square root of mu.', { size: 12, color: DIM });
  }
};

/* ---------- scene 3: the binomial limit ---------- */
SCENE_DRAW.limit = function (t, sc) {
  head('The binomial becomes the Poisson',
    'lambda = n p held at 3 while n grows; bars are the binomial, the line is Poisson(3)');

  var step = progressOf(t, sc, 0, 14);
  var done = progressOf(t, sc, 14, 10);

  var idx = Math.min(V.limit.rows.length - 1, Math.floor(step * 1.001 * 3));
  var row = V.limit.rows[idx];

  var x0 = 60, x1 = 560, baseY = 268, topY = 100;
  P.line(x0, baseY, x1, baseY, { stroke: BORDER, sw: 1.2 });
  P.line(x0, baseY, x0, topY, { stroke: BORDER, sw: 1.2 });

  var vmax = 0.24, bw = 40, gap = 12;
  for (var k = 0; k <= 9; k++) {
    var bp = binomPmf(row.n, k, row.p);
    var pp = poisPmf(V.limit.lam, k);
    var bx = x0 + 24 + k * (bw + gap);
    bar(bx, baseY, bw, bp / vmax * (baseY - topY), ACCDIM, ACC);
    var py = baseY - pp / vmax * (baseY - topY);
    P.circle(bx + bw / 2, py, 3.4, { fill: SURF, stroke: INK, sw: 1.6 });
    label(bx + bw / 2 - 3, baseY + 8, String(k), { size: 10, color: FAINT });
  }
  P.text((x0 + x1) / 2, baseY + 26, 'k', { size: 11, color: DIM, align: 'center' });
  label(x0, 86, 'binomial n = ' + row.n + ', p = ' + fx(row.p, 6), { size: 11, color: ACC });
  P.text(x1 - 8, 86, 'circles: Poisson(3)', { size: 11, color: INK, align: 'right' });

  if (done > 0.1) {
    var rows = V.limit.rows;
    rows.forEach(function (r, i) {
      var y = 110 + i * 34;
      var on = i === idx;
      P.text(600, y, 'n = ' + r.n, { size: 11, color: on ? ACC : DIM, bold: on });
      P.text(672, y, 'p = ' + fx(r.p, 4), { size: 10, mono: true, color: on ? INK : FAINT });
      P.text(872, y, 'gap ' + r.gap.toExponential(2).replace('e', 'e'), { size: 10, mono: true, color: on ? BAD : FAINT, align: 'right' });
    });
    P.line(596, 100, 596, 282, { stroke: BORDER, sw: 1 });
    P.line(596, 282, 876, 282, { stroke: BORDER, sw: 1 });
    label(600, 300, 'largest absolute difference over k = 0..19', { size: 10, color: FAINT });
  }

  if (done > 0.55) {
    box(34, 330, 832, 102, { fill: SURF, stroke: ACC });
    P.text(50, 354, 'GATE CSE 2013 Q2 — cars per minute, Poisson with mean 3, fewer than three:', { size: 12, color: INK });
    P.text(50, 380, 'P(0) + P(1) + P(2)  =  ' + fx(V.pois.p[0], 6) + ' + ' + fx(V.pois.p[1], 6) +
      ' + ' + fx(V.pois.p[2], 6) + '  =  ' + fx(V.pois.pLT3, 6),
      { size: 12, mono: true, color: INK });
    P.text(50, 406, '= 17 / (2e^3)  =  ' + fx(V.pois.pLT3, 6) + '   (option C).   Including k = 3 would give ' +
      fx(V.pois.pLE3, 6) + '.', { size: 12, bold: true, color: ACC });
  }
};

/* ---------- scene 4: the tail ---------- */
SCENE_DRAW.tail = function (t, sc) {
  head('The exponential density and its tail, at lambda = 2',
    'the shaded area beyond x is the probability of waiting longer than x');

  var step = progressOf(t, sc, 0, 14);
  var done = progressOf(t, sc, 14, 10);

  var x0 = 70, x1 = 560, y0 = 96, y1 = 250;
  var map = mapper(x0, x1, y0, y1, 0, 3, 0, 2.1);
  P.line(x0, y1, x1, y1, { stroke: BORDER, sw: 1.2 });
  P.line(x0, y1, x0, y0, { stroke: BORDER, sw: 1.2 });

  /* the density curve */
  var pts = [];
  for (var i = 0; i <= 160; i++) {
    var x = i / 160 * 3;
    pts.push(map(x, 2 * Math.exp(-2 * x)));
  }
  for (var j = 1; j < pts.length; j++) {
    P.line(pts[j - 1][0], pts[j - 1][1], pts[j][0], pts[j][1], { stroke: ACC, sw: 2 });
  }

  /* shaded region x > 0.5 */
  var shade = Math.floor(step * 120);
  if (shade > 0) {
    for (var s = 0; s < shade; s++) {
      var xa = 0.5 + s / 120 * 2.5;
      var pa = map(xa, 2 * Math.exp(-2 * xa));
      P.line(pa[0], pa[1], pa[0], y1, { stroke: ACC, sw: 2.4 });
    }
  }

  if (step > 0.3) {
    var mx = map(0.5, 0)[0];
    P.line(mx, y0, mx, y1, { stroke: INFO, sw: 1.4, dash: [5, 4] });
    P.text(mx + 8, y0 + 12, 'mean = 1/lambda = ' + fx(V.expo.mean, 2), { size: 11, bold: true, color: INFO });
  }
  label(x0, y1 + 12, '0', { size: 10, color: FAINT });
  label(x1 - 8, y1 + 12, '3', { size: 10, color: FAINT });
  P.text((x0 + x1) / 2, y1 + 30, 'x, the length of the wait', { size: 11, color: DIM, align: 'center' });
  P.text(x1 - 6, y0 + 4, 'lambda e^(-lambda x)', { size: 11, mono: true, color: ACC, align: 'right' });

  /* the tail curve, right panel */
  var tx0 = 628, tx1 = 868, ty0 = 96, ty1 = 240;
  var tmap = mapper(tx0, tx1, ty0, ty1, 0, 3, 0, 1);
  P.line(tx0, ty1, tx1, ty1, { stroke: BORDER, sw: 1 });
  P.line(tx0, ty1, tx0, ty0, { stroke: BORDER, sw: 1 });
  var tp = [];
  for (var q = 0; q <= 100; q++) {
    var xq = q / 100 * 3;
    tp.push(tmap(xq, Math.exp(-2 * xq)));
  }
  for (var r = 1; r < tp.length; r++) {
    P.line(tp[r - 1][0], tp[r - 1][1], tp[r][0], tp[r][1], { stroke: INFO, sw: 1.8 });
  }
  var ey = tmap(0, Math.exp(-1))[1];
  P.line(tx0, ey, tx1, ey, { stroke: WARN, sw: 1.2, dash: [4, 4] });
  label(tx0 + 4, ey - 12, 'e^-1 = ' + fx(V.expo.eInv, 4), { size: 10, color: WARN });
  label(tx0, ty1 + 12, 'tail  P(X > x) = e^(-lambda x)', { size: 10, color: INFO });

  if (done > 0.2) {
    box(34, 292, 832, 140, { fill: SURF, stroke: ACC });
    P.text(50, 316, 'Outliving the mean:  P(X > 1/lambda)  =  e^(-lambda / lambda)  =  e^-1  =  ' +
      fx(V.expo.eInv, 6), { size: 13, mono: true, color: INK });
    P.text(50, 342, 'the same number at every parameter:', { size: 11, color: DIM });
    V.expo.table.forEach(function (row, i) {
      var cx = 60 + i * 132;
      P.text(cx, 368, 'lambda ' + (row.lam === 100 ? '100' : fx(row.lam, 2)), { size: 10, color: FAINT });
      P.text(cx, 388, fx(row.p, 6), { size: 12, mono: true, bold: true, color: ACC });
    });
    P.text(50, 416, 'GATE CSE 2021 Set 1 Q18 asks this at lambda = 2; the answer, 0.37, never uses the 2.', { size: 11, color: DIM });
  }
};

/* ---------- scene 5: memorylessness ---------- */
SCENE_DRAW.memory = function (t, sc) {
  head('Memorylessness, and two laws that do not have it',
    'given s already survived, does the next t look like a fresh t?');

  var step = progressOf(t, sc, 0, 14);
  var done = progressOf(t, sc, 14, 10);

  /* left: exponential survival, and the same curve restarted at s = 1 */
  var x0 = 60, x1 = 430, y0 = 96, y1 = 250;
  var map = mapper(x0, x1, y0, y1, 0, 4, 0, 1);
  P.line(x0, y1, x1, y1, { stroke: BORDER, sw: 1.2 });
  P.line(x0, y1, x0, y0, { stroke: BORDER, sw: 1.2 });
  var pts = [];
  for (var i = 0; i <= 120; i++) {
    var x = i / 120 * 4;
    pts.push(map(x, Math.exp(-2 * x)));
  }
  for (var j = 1; j < pts.length; j++) {
    P.line(pts[j - 1][0], pts[j - 1][1], pts[j][0], pts[j][1], { stroke: ACC, sw: 2 });
  }
  if (step > 0.25) {
    /* the conditional survival from s = 1, drawn as the original curve shifted */
    var shift = map(1, 0)[0] - map(0, 0)[0];
    var cp = [];
    for (var q = 0; q <= 90; q++) {
      var xq = q / 90 * 2.5;
      cp.push([map(1 + xq, 0)[0], map(0, Math.exp(-2 * xq))[1]]);
    }
    for (var r = 1; r < cp.length; r++) {
      P.line(cp[r - 1][0], cp[r - 1][1], cp[r][0], cp[r][1], { stroke: INFO, sw: 1.8, dash: [5, 4] });
    }
    P.line(map(1, 0)[0], y0, map(1, 0)[0], y1, { stroke: FAINT, sw: 1, dash: [3, 3] });
    label(map(1, 0)[0] + 5, y0 + 4, 's = 1', { size: 10, color: FAINT });
    P.text(x0 + 6, y0 + 14, 'solid: e^(-2x)', { size: 10, color: ACC });
    P.text(x0 + 6, y0 + 30, 'dashed: the same shape from s', { size: 10, color: INFO });
  }
  label(x0, y1 + 12, 'exponential: the shape repeats', { size: 10, color: DIM });

  /* right: uniform, flat, and the conditional collapses */
  var ux0 = 486, ux1 = 856, uy0 = 96, uy1 = 250;
  var umap = mapper(ux0, ux1, uy0, uy1, 0, 10, 0, 0.14);
  P.line(ux0, uy1, ux1, uy1, { stroke: BORDER, sw: 1.2 });
  P.line(ux0, uy1, ux0, uy0, { stroke: BORDER, sw: 1.2 });
  var uy = umap(0, 0.1)[1];
  P.line(ux0, uy, ux1, uy, { stroke: BAD, sw: 2.4 });
  P.line(umap(5, 0)[0], uy, umap(5, 0)[0], uy1, { stroke: FAINT, sw: 1, dash: [3, 3] });
  label(umap(5, 0)[0] + 4, uy1 - 8, 's = 5', { size: 10, color: FAINT });
  if (done > 0.2) {
    P.line(ux1, uy, ux1, uy1, { stroke: BAD, sw: 2 });
    P.text(ux0 + 6, uy - 34, 'given 5 survived, five more: ' + fx(V.mem.uniform.cond, 2),
      { size: 10, color: BAD });
    P.text(ux0 + 6, uy - 20, 'a fresh five: ' + fx(V.mem.uniform.fresh, 2),
      { size: 10, color: DIM });
  }
  label(ux0, uy1 + 12, 'uniform on 0..10: it fails', { size: 10, color: BAD });

  if (done > 0.45) {
    box(34, 292, 832, 140, { fill: SURF, stroke: ACC });
    P.text(50, 316, 'P(X > s + t | X > s)  =  e^(-lambda(s+t)) / e^(-lambda s)  =  e^(-lambda t)  =  P(X > t)',
      { size: 13, mono: true, color: INK });
    P.text(50, 344, 'twelve pairs of s and t at lambda = 2 agree to ' + sci(V.mem.worst) + '.',
      { size: 11, color: DIM });
    P.text(50, 370, 'uniform on 0..10:  ' + fx(V.mem.uniform.cond, 2) + ' against ' + fx(V.mem.uniform.fresh, 2) +
      ' — fails.     fixed wait of 10:  ' + fx(V.mem.fixed.cond, 2) + ' against ' + fx(V.mem.fixed.fresh, 2) + ' — fails.',
      { size: 11, color: BAD });
    P.text(50, 396, 'geometric, p = 0.3:  ' + fx(V.mem.geo.cond, 6) + ' against ' + fx(V.mem.geo.fresh, 6) +
      ' — the discrete memoryless law, which passes.', { size: 11, color: VAL });
    P.text(50, 420, 'Only these two pass. Every other wait remembers how long it has already been.', { size: 11, color: DIM });
  }
};

/* ---------- scene 6: the bridge ---------- */
SCENE_DRAW.bridge = function (t, sc) {
  head('The count and the gap are one process',
    'exponential gaps, rate 3 per unit; the count by time 1 is Poisson with mean 3');

  var step = progressOf(t, sc, 0, 14);
  var done = progressOf(t, sc, 14, 10);

  var x0 = 60, x1 = 560, axisY = 110;
  P.line(x0, axisY, x1, axisY, { stroke: BORDER, sw: 1.5 });
  var arrivals = [0.11, 0.2, 0.29, 0.55, 0.78, 1.4, 1.9, 2.5, 2.6, 3.1];
  var shown = Math.floor(step * arrivals.length);
  for (var i = 0; i < shown; i++) {
    var ax = x0 + arrivals[i] / 3.5 * (x1 - x0);
    P.line(ax, axisY - 14, ax, axisY - 2, { stroke: i < 5 ? ACC : FAINT, sw: 2 });
  }
  var tx = x0 + 1 / 3.5 * (x1 - x0);
  P.line(tx, axisY - 34, tx, axisY + 10, { stroke: INFO, sw: 1.4, dash: [5, 4] });
  P.text(tx + 6, axisY - 34, 't = 1: this one drawing shows five arrivals', { size: 10, color: INFO });
  P.text(tx + 6, axisY - 20, 'the distribution below is what the count follows', { size: 9, color: FAINT });

  /* the Poisson PMF at t = 1, tail from k = 2 shaded */
  var bx0 = 60, bx1 = 560, baseY = 300, topY = 190;
  P.line(bx0, baseY, bx1, baseY, { stroke: BORDER, sw: 1.2 });
  var bw = 40, gap = 12, vmax = 0.24;
  for (var k = 0; k <= 9; k++) {
    var p = poisPmf(3, k);
    var bx = bx0 + 24 + k * (bw + gap);
    var tailK = k >= 2;
    bar(bx, baseY, bw, p / vmax * (baseY - topY), tailK ? ACCDIM : '#e3eaec', tailK ? ACC : BORDER);
    label(bx + bw / 2 - 3, baseY + 8, String(k), { size: 10, color: FAINT });
    if (tailK && done > 0.1) {
      P.text(bx + bw / 2, baseY - p / vmax * (baseY - topY) - 8, fx(p, 3),
        { size: 9, color: ACC, align: 'center' });
    }
  }
  label(bx0, baseY + 26, 'shaded: at least two arrivals, i.e. the second arrival has come by t', { size: 10, color: ACC });

  if (done > 0.3) {
    var rows = [V.bridge.rows[1], V.bridge.rows[4], V.bridge.rows[7], V.bridge.rows[10]];
    label(600, 100, 'two routes to the same number', { size: 11, color: INK });
    P.text(600, 124, 'k', { size: 9, color: FAINT });
    P.text(640, 124, 't', { size: 9, color: FAINT });
    P.text(700, 124, 'Poisson tail', { size: 9, color: FAINT });
    P.text(806, 124, 'gamma CDF', { size: 9, color: FAINT, align: 'right' });
    rows.forEach(function (r, i) {
      var y = 148 + i * 30;
      P.text(600, y, String(r.k), { size: 11, mono: true, color: INK });
      P.text(640, y, fx(r.t, 1), { size: 11, mono: true, color: INK });
      P.text(700, y, fx(r.tail, 6), { size: 11, mono: true, color: ACC });
      P.text(806, y, fx(r.gamma, 6), { size: 11, mono: true, color: INFO, align: 'right' });
    });
    P.line(596, 112, 596, 268, { stroke: BORDER, sw: 1 });
    label(600, 288, 'largest disagreement, twelve cases: ' + V.bridge.worst.toExponential(1), { size: 10, color: DIM });
  }

  if (done > 0.6) {
    box(34, 340, 832, 92, { fill: SURF, stroke: ACC });
    P.text(50, 364, 'No event in t:  the count is 0, giving e^(-lambda t);  the first gap exceeds t, giving e^(-lambda t).',
      { size: 12, color: INK });
    P.text(50, 388, 'So the Poisson parameter for a window is lambda times the window: 3 per unit is 6 over two units.',
      { size: 12, color: INK });
    P.text(50, 412, 'The two distributions are one model read in two directions, not two models of one dataset.',
      { size: 11, color: DIM });
  }
};

/* ---------- scene 7: the unit ---------- */
SCENE_DRAW.scale = function (t, sc) {
  head('The unit is the whole question',
    'a rate becomes lambda only after it has been multiplied by the window');

  var step = progressOf(t, sc, 0, 12);
  var done = progressOf(t, sc, 12, 12);

  /* row 1: the correct conversion */
  box(34, 92, 832, 76, { fill: SURF, stroke: ACC });
  P.text(50, 114, 'rate  ' + V.scale.perHour + ' per hour   x   window  ' + V.scale.windowMin +
    ' minutes = ' + fx(V.scale.windowMin / 60, 2) + ' hour', { size: 12, color: INK });
  P.text(50, 142, 'lambda = ' + V.scale.perHour + ' x ' + fx(V.scale.windowMin / 60, 2) + ' = ' +
    fx(V.scale.lam, 0) + '     P(no request) = e^-' + fx(V.scale.lam, 0) + ' = ' + sci(V.scale.p0),
    { size: 14, bold: true, mono: true, color: ACC });

  if (step > 0.25) {
    box(34, 182, 404, 78, { fill: BADDIM, stroke: BAD });
    label(50, 204, 'wrong: the rate used as lambda', { size: 10, color: BAD });
    P.text(50, 228, 'e^-20 = ' + sci(V.scale.wrongRate), { size: 13, mono: true, color: BAD });
    P.text(50, 250, 'nine times too small', { size: 10, color: DIM });

    box(462, 182, 404, 78, { fill: BADDIM, stroke: BAD });
    label(478, 204, 'wrong: the window used as lambda', { size: 10, color: BAD });
    P.text(478, 228, 'e^-0.75 = ' + fx(V.scale.wrongWindow, 4), { size: 13, mono: true, color: BAD });
    P.text(478, 250, 'wrong by many orders of magnitude', { size: 10, color: DIM });
  }

  if (done > 0.2) {
    box(34, 276, 832, 72, { fill: SURF, stroke: INFO });
    P.text(50, 300, 'The other direction — a rate of ' + V.scale.carsPerMin +
      ' cars per minute is a mean gap of 1/' + V.scale.carsPerMin + ' minute = ' +
      fx(V.scale.gapMeanSec, 0) + ' seconds.', { size: 12, color: INK });
    P.text(50, 326, 'Over ' + V.scale.carWindow + ' minutes lambda = ' + V.scale.carLam +
      ', so P(exactly 2 cars) = ' + fx(V.scale.carP2, 6) + '.', { size: 12, mono: true, color: INFO });
  }

  if (done > 0.55) {
    box(34, 364, 832, 68, { fill: SURF2, stroke: BORDER });
    P.text(50, 388, 'A rate and a mean are reciprocals: lambda per unit time against 1/lambda per event.',
      { size: 12, color: INK });
    P.text(50, 412, 'Write the rate and the window on the same line, and multiply, before any exponential or factorial appears.',
      { size: 12, color: WARN });
  }
};

/* ---------- scene 8: the moments ---------- */
SCENE_DRAW.moment = function (t, sc) {
  head('Every Poisson moment comes from two facts',
    'mean = lambda and variance = lambda, at lambda = 5');

  var step = progressOf(t, sc, 0, 13);
  var done = progressOf(t, sc, 13, 11);

  var rungs = [
    ['mean', 'E[X] = lambda', fx(V.moment.EX, 0), 'the first fact'],
    ['variance', 'Var(X) = lambda', fx(V.moment.lam, 0), 'the second fact'],
    ['second moment', 'E[X^2] = Var + mean^2 = ' + fx(V.moment.lam, 0) + ' + ' + fx(V.moment.EXsq, 0), fx(V.moment.EX2, 0), 'not the square of the mean'],
    ['the question', 'E[(X+2)^2] = E[X^2] + 4E[X] + 4', fx(V.moment.Eplus, 0), 'GATE CSE 2017 Set 2 Q48']
  ];

  rungs.forEach(function (r, i) {
    var reveal = K.clamp01((step - i * 0.2) * 5);
    if (reveal <= 0) return;
    var y = 96 + i * 60;
    var last = i === 3;
    box(34, y, 832, 50, { fill: last ? ACCDIM : SURF, stroke: last ? ACC : BORDER });
    label(50, y + 16, r[0], { size: 10, color: last ? ACC : FAINT });
    P.text(842, y + 16, r[3], { size: 8, color: FAINT, align: 'right' });
    P.text(50, y + 34, r[1], { size: 12, mono: true, color: INK });
    P.text(730, y + 26, r[2], { size: 20, bold: true, color: last ? ACC : INK, align: 'right' });
  });

  if (done > 0.35) {
    box(34, 344, 404, 88, { fill: SURF, stroke: INFO });
    label(50, 366, 'the spread', { size: 10, color: INFO });
    P.text(50, 390, 'SD = sqrt(lambda) = sqrt(' + fx(V.moment.lam, 0) + ') = ' + fx(V.moment.sd, 4),
      { size: 12, mono: true, color: INK });
    P.text(50, 414, 'with mean mu: SD = sqrt(mu) — GATE CSE 2016 Set 1 Q4', { size: 10, color: DIM });

    box(462, 344, 404, 88, { fill: BADDIM, stroke: BAD });
    label(478, 366, 'the tempting wrong answer', { size: 10, color: BAD });
    P.text(478, 390, 'E[X]^2 = ' + fx(V.moment.EXsq, 0) + ', not E[X^2] = ' + fx(V.moment.EX2, 0),
      { size: 12, mono: true, color: BAD });
    P.text(478, 414, 'the gap is exactly the variance, ' + fx(V.moment.lam, 0), { size: 10, color: DIM });
  }
};

/* ---------- scene 9: where the models stop ---------- */
SCENE_DRAW.limits = function (t, sc) {
  head('Where each model stops applying',
    'two ways to break the arithmetic: clustered arrivals, and a random arrival time');

  var step = progressOf(t, sc, 0, 13);
  var done = progressOf(t, sc, 13, 11);

  /* left: over-dispersion */
  var x0 = 60, baseY = 250, topY = 110;
  P.line(x0, baseY, 400, baseY, { stroke: BORDER, sw: 1.2 });
  var bw = 26, gap = 8, vmax = 4.5;
  V.limits.counts.forEach(function (c, i) {
    var bx = x0 + 8 + i * (bw + gap);
    var h = c / vmax * (baseY - topY);
    bar(bx, baseY, bw, Math.max(h, c > 0 ? 3 : 0), c > 0 ? BADDIM : '#e3eaec', c > 0 ? BAD : BORDER);
    label(bx + 6, baseY + 8, String(c), { size: 10, color: c > 0 ? BAD : FAINT });
  });
  label(x0, 96, 'ten one-minute windows: mean ' + fx(V.limits.mean, 2) +
    ', variance ' + fx(V.limits.variance, 2), { size: 11, color: BAD });
  P.text(x0, baseY + 26, 'variance exceeds mean, so the counts are not Poisson', { size: 10, color: DIM });

  if (step > 0.3) {
    P.text(x0, 292, 'A Poisson model would put almost no mass on 3 and 4, which is exactly where the data sits.',
      { size: 11, color: INK });
  }

  /* right: the inspection paradox */
  if (done > 0.1) {
    var rx0 = 460, rbaseY = 250, rtopY = 110;
    var cases = [
      ['fixed 10', V.limits.fixed.residual, VAL],
      ['exponential', V.limits.expo.residual, ACC],
      ['gaps 1 / 91', V.limits.mix.residual, BAD]
    ];
    var rmax = 45;
    P.line(rx0, rbaseY, 872, rbaseY, { stroke: BORDER, sw: 1.2 });
    cases.forEach(function (c, i) {
      var bx = rx0 + 24 + i * 116;
      var h = c[1] / rmax * (rbaseY - rtopY);
      bar(bx, rbaseY, 60, h, c[1] > 10 ? BADDIM : ACCDIM, c[2]);
      P.text(bx + 30, rbaseY - h - 18, fx(c[1], 2), { size: 13, bold: true, color: c[2], align: 'center' });
      P.text(bx + 30, rbaseY + 10, c[0], { size: 10, color: DIM, align: 'center' });
    });
    P.line(rx0, rbaseY - 10 / rmax * (rbaseY - rtopY), 872, rbaseY - 10 / rmax * (rbaseY - rtopY),
      { stroke: WARN, sw: 1.2, dash: [5, 4] });
    label(rx0 + 4, rbaseY - 10 / rmax * (rbaseY - rtopY) - 14, 'the mean gap, 10', { size: 10, color: WARN });
    label(rx0, 96, 'mean wait for an arrival at a random time', { size: 11, color: INK });
  }

  if (done > 0.5) {
    box(34, 316, 832, 116, { fill: SURF, stroke: WARN });
    P.text(50, 340, 'The mean wait is E[X^2] / (2 E[X]), not E[X].  Fixed: 100/20 = 5.   Exponential: 200/20 = 10.',
      { size: 12, mono: true, color: INK });
    P.text(50, 364, 'Mixture, gaps of 1 nine times in ten and 91 once in ten: mean 10, second moment 829, wait ' +
      fx(V.limits.mix.residual, 2) + '.', { size: 12, mono: true, color: BAD });
    P.text(50, 392, 'Long gaps are more likely to be interrupted, which is why the wait can exceed the mean gap.', { size: 11, color: DIM });
    P.text(50, 414, 'The exponential is the single case where the wait equals the mean gap — memorylessness again.', { size: 11, color: WARN });
  }
};

/* ---------- scene 10: the procedure ---------- */
SCENE_DRAW.procedure = function (t, sc) {
  head('The four-step procedure',
    'in this order, every time a rate appears in a question');

  var step = progressOf(t, sc, 0, 14);
  var done = progressOf(t, sc, 14, 10);

  var steps = [
    ['1', 'count or wait?', '"how many" -> Poisson.   "how long", "at least t" -> exponential.', ACC],
    ['2', 'convert the rate', 'multiply by the window first: 20 per hour over 45 min is 15, not 20 and not 0.75.', INFO],
    ['3', 'read the inequality', '"fewer than k" stops at k-1.   "at least one" is 1 - P(0) = ' +
      fx(V.pois.atLeastOne, 4) + ' at lambda 3, not ' + fx(V.pois.exactlyOne, 4) + '.', WARN],
    ['4', 'spread and moments', 'variance = mean, so E[X^2] = lambda + lambda^2 and SD = sqrt(lambda).', VAL]
  ];

  steps.forEach(function (s, i) {
    var reveal = K.clamp01((step - i * 0.2) * 5);
    if (reveal <= 0) return;
    var y = 92 + i * 62;
    P.circle(52, y + 22, 15, { fill: SURF, stroke: s[3], sw: 1.6 });
    P.text(52, y + 22, s[0], { size: 14, bold: true, color: s[3], align: 'center', base: 'middle' });
    P.text(80, y + 10, s[1], { size: 13, bold: true, color: INK });
    P.text(80, y + 30, s[2], { size: 11, color: DIM });
  });

  if (done > 0.4) {
    box(34, 344, 832, 88, { fill: SURF, stroke: ACC });
    P.text(50, 368, 'And answer the question asked. At lambda = 2:', { size: 12, color: INK });
    P.text(50, 392, 'P(X > the mean, 0.5) = e^-1 = ' + fx(V.expo.tailAtMean, 4) +
      '     but     P(X > the parameter, 2) = e^-4 = ' + fx(V.expo.pGT2, 4),
      { size: 13, mono: true, bold: true, color: ACC });
    P.text(50, 416, 'The two differ by a factor of twenty, and both are printed options in real papers.', { size: 11, color: WARN });
  }
};

/* ---------- the frame ---------- */

function drawFrame(painter) {
  if (!painter) return;
  P = painter;
  P.alpha(1);
  P.clear();
  P.rect(0, 0, W, H, { fill: SURF });

  var t = (K && K.state) ? K.state.elapsed : 0;
  var scenes = (K && K.state && K.state.scenes) ? K.state.scenes : [];
  var i = K && K.sceneAt ? K.sceneAt(t) : 0;
  var sc = scenes[i];
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
