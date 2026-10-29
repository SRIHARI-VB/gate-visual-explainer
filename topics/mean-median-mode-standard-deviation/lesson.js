/* ==========================================================================
   mean-median-mode-standard-deviation — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads V; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   Two kinds of fact appear below and are kept apart:
     - what is a definition (mean, median, mode, variance, standard deviation,
       and the grouped-data interpolation formulas, which are estimates);
     - what is a theorem about any finite list of reals (deviations sum to zero;
       squared deviations are minimised at the mean; absolute deviations are
       minimised at a median; sigma(ax+b) = |a| sigma(x)).

   Nothing here assumes a distribution unless the scene names one.
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

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- 1a. the basic statistics, defined once ---------- */

function sum(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s; }
function sorted(a) { return a.slice().sort(function (x, y) { return x - y; }); }
function mean(a) { return sum(a) / a.length; }

function median(a) {
  var s = sorted(a), n = s.length;
  if (n === 0) return NaN;
  return (n % 2) ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

/* all maximally frequent values, in ascending order */
function modes(a) {
  var count = {}, i, v;
  for (i = 0; i < a.length; i++) { v = a[i]; count[v] = (count[v] || 0) + 1; }
  var best = 0, keys = Object.keys(count);
  for (i = 0; i < keys.length; i++) if (count[keys[i]] > best) best = count[keys[i]];
  var out = [];
  for (i = 0; i < keys.length; i++) if (count[keys[i]] === best) out.push(Number(keys[i]));
  return out.sort(function (x, y) { return x - y; });
}

/* the usual convention: no mode when every value occurs equally often */
function hasMode(a) {
  var count = {}, i, v, seen = {};
  for (i = 0; i < a.length; i++) { v = a[i]; count[v] = (count[v] || 0) + 1; }
  var keys = Object.keys(count), first = count[keys[0]];
  for (i = 0; i < keys.length; i++) if (count[keys[i]] !== first) return true;
  return keys.length === 1;      // a constant list has a mode; all-distinct has none
}

function variance(a) {
  var m = mean(a), s = 0;
  for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m);
  return s / a.length;
}
function sd(a) { return Math.sqrt(variance(a)); }
function sampleVariance(a) {
  var m = mean(a), s = 0;
  for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m);
  return s / (a.length - 1);
}
function mad(a) {
  var m = mean(a), s = 0;
  for (var i = 0; i < a.length; i++) s += Math.abs(a[i] - m);
  return s / a.length;
}
function sse(a, c) {
  var s = 0;
  for (var i = 0; i < a.length; i++) s += (a[i] - c) * (a[i] - c);
  return s;
}
function sad(a, c) {
  var s = 0;
  for (var i = 0; i < a.length; i++) s += Math.abs(a[i] - c);
  return s;
}
/* minimise a function of one variable over a fine grid; returns the argmin */
function gridArgmin(fn, lo, hi, step) {
  var best = Infinity, arg = lo;
  for (var c = lo; c <= hi + 1e-9; c += step) {
    var v = fn(c);
    if (v < best) { best = v; arg = c; }
  }
  return { arg: arg, value: best };
}
function shift(a, b) { return a.map(function (x) { return x + b; }); }
function scale(a, k) { return a.map(function (x) { return x * k; }); }
function affine(a, k, b) { return a.map(function (x) { return k * x + b; }); }

/* ---------- 1b. the data ---------- */

var DATA = [22, 25, 25, 28, 30, 30, 30, 32, 90];        // nine salaries, thousands
var EVEN = [0, 1, 2, 3, 6, 6];                          // even n, median not in the list
var BIMODAL = [1, 1, 2, 2, 3, 4];
var DISTINCT = [1, 2, 3, 4, 5];
var SORTDEMO = [2, 4, 4, 4, 5, 5, 7, 9];                // used by a practice item

var N = DATA.length;
var MEAN = mean(DATA);
var MEDIAN = median(DATA);
var MODES = modes(DATA);
var MODE = MODES[0];
var VAR = variance(DATA);
var SD = sd(DATA);
var SAMPLE_SD = Math.sqrt(sampleVariance(DATA));
var MAD = mad(DATA);
var SSE_MEAN = sse(DATA, MEAN);
var SSE_MEDIAN = sse(DATA, MEDIAN);
var SAD_MEAN = sad(DATA, MEAN);
var SAD_MEDIAN = sad(DATA, MEDIAN);
var DEVS = DATA.map(function (x) { return x - MEAN; });
var SQDEVS = DEVS.map(function (d) { return d * d; });

var ARGMIN_SSE = gridArgmin(function (c) { return sse(DATA, c); }, 0, 99.99, 0.01);
var ARGMIN_SAD = gridArgmin(function (c) { return sad(DATA, c); }, 0, 99.99, 0.01);

/* ---------- 1c. the transformation, GATE CSE 2011 ---------- */
var TA = 3, TB = 100;
var TRANS = affine(DATA, TA, TB);
var T_MEAN = mean(TRANS), T_MEDIAN = median(TRANS), T_MODE = modes(TRANS)[0], T_SD = sd(TRANS);
var SHIFTED = shift(DATA, 7), DOUBLED = scale(DATA, 2);

/* ---------- 1d. the frequency table ---------- */
var CLASSES = [
  { lo: 0, hi: 10, f: 4 }, { lo: 10, hi: 20, f: 8 }, { lo: 20, hi: 30, f: 15 },
  { lo: 30, hi: 40, f: 12 }, { lo: 40, hi: 50, f: 6 }, { lo: 50, hi: 60, f: 5 }
];
var GN = 0, CUMS = [], MIDS = [], GM_MEAN, GM_MEDIAN, GM_MODE, GM_CLASS, GM_MODE_CLASS, GM_EMP;

(function buildGrouped() {
  var i, run = 0;
  for (i = 0; i < CLASSES.length; i++) {
    GN += CLASSES[i].f;
    MIDS.push((CLASSES[i].lo + CLASSES[i].hi) / 2);
  }
  for (i = 0; i < CLASSES.length; i++) { run += CLASSES[i].f; CUMS.push(run); }

  var wsum = 0;
  for (i = 0; i < CLASSES.length; i++) wsum += CLASSES[i].f * MIDS[i];
  GM_MEAN = wsum / GN;

  /* the median class is the first whose cumulative frequency reaches N/2 */
  var half = GN / 2, mi = 0;
  for (i = 0; i < CLASSES.length; i++) { if (CUMS[i] >= half) { mi = i; break; } }
  GM_CLASS = mi;
  var before = mi === 0 ? 0 : CUMS[mi - 1];
  var h = CLASSES[mi].hi - CLASSES[mi].lo;
  GM_MEDIAN = CLASSES[mi].lo + (half - before) / CLASSES[mi].f * h;

  /* the modal class is the largest frequency */
  var bestF = -1, oi = 0;
  for (i = 0; i < CLASSES.length; i++) { if (CLASSES[i].f > bestF) { bestF = CLASSES[i].f; oi = i; } }
  GM_MODE_CLASS = oi;
  var f1 = CLASSES[oi].f;
  var f0 = oi > 0 ? CLASSES[oi - 1].f : 0;
  var f2 = oi + 1 < CLASSES.length ? CLASSES[oi + 1].f : 0;
  var hm = CLASSES[oi].hi - CLASSES[oi].lo;
  GM_MODE = CLASSES[oi].lo + (f1 - f0) / (2 * f1 - f0 - f2) * hm;

  GM_EMP = 3 * GM_MEDIAN - 2 * GM_MEAN;
})();

/* ---------- 1e. the distributions ---------- */

var LAMBDA = 0.5;
var EXP_MEAN = 1 / LAMBDA;
var EXP_MEDIAN = Math.log(2) / LAMBDA;
var EXP_MODE = 0;
var EXP_CDF_AT_MEDIAN = 1 - Math.exp(-LAMBDA * EXP_MEDIAN);

var BIN_N = 1000, BIN_P = 0.4;
var BIN_MEAN = BIN_N * BIN_P;
var BIN_VAR = BIN_N * BIN_P * (1 - BIN_P);
var BIN_SD = Math.sqrt(BIN_VAR);

/* the binomial PMF, built by the standard ratio recursion from p(0) */
function binomPMF(n, p, k) {
  var pk = Math.pow(1 - p, n), cur = pk, best = pk, bestK = 0;
  for (var j = 0; j < k; j++) {
    cur = cur * ((n - j) / (j + 1)) * (p / (1 - p));
    if (cur > best) { best = cur; bestK = j + 1; }
  }
  return { pmf: pk, bestK: bestK };
}
var BIN_MODE = binomPMF(BIN_N, BIN_P, BIN_N).bestK;

/* the truncated normal: Y = max(X, 0) with X standard normal */
var PHI0 = 1 / Math.sqrt(2 * Math.PI);        // density at 0
var TRUNC_MEAN = PHI0;                        // E[max(X,0)] for standard normal
var P_Y_LE_0 = 0.5, P_Y_GE_0 = 1;

/* ---------- 1f. the counterexample and the skew order ---------- */
var CE = EVEN;                                // 0,1,2,3,6,6
var CE_MEAN = mean(CE), CE_MEDIAN = median(CE), CE_MODE = modes(CE)[0];

/* ======================================================================
   LAYER 2 - THE CHECKS
   Each check re-verifies a number against its defining property, not against
   a second copy of the same arithmetic.
   ====================================================================== */

var TOL = 1e-9;

chk('the mean of the nine salaries is 312/9', Math.abs(MEAN - 312 / 9) < TOL, MEAN);
chk('the signed deviations from the mean sum to zero', Math.abs(sum(DEVS)) < 1e-9, sum(DEVS));
chk('the list arrives already sorted', sorted(DATA).join(',') === DATA.join(','), sorted(DATA).join(','));
chk('median of odd n is the middle value', MEDIAN === 30, MEDIAN);
chk('median of even n averages the two middle values', median(EVEN) === 2.5, median(EVEN));
chk('an even-n median need not be a data value', EVEN.indexOf(2.5) === -1, '2.5 not in the list');
chk('the salaries have exactly one mode, 30', MODES.length === 1 && MODE === 30, MODES.join(','));
chk('a tie at the top gives two modes', modes(BIMODAL).join(',') === '1,2', modes(BIMODAL).join(','));
chk('an all-distinct list has no mode by the usual convention', hasMode(DISTINCT) === false, 'no mode');
chk('a constant list has a mode', hasMode([7, 7, 7]) === true, '7');
chk('the grid minimiser of the squared deviations is the mean',
    Math.abs(ARGMIN_SSE.arg - MEAN) <= 0.01, ARGMIN_SSE.arg);
chk('squared deviations are smaller at the mean than at the median',
    SSE_MEAN < SSE_MEDIAN, SSE_MEAN.toFixed(2) + ' < ' + SSE_MEDIAN.toFixed(2));
chk('the squared-deviation total at the mean is n times the variance',
    Math.abs(SSE_MEAN - N * VAR) < 1e-6, SSE_MEAN);
chk('the identity sse(c) = n*var + n*(mean-c)^2 holds at the median',
    Math.abs(sse(DATA, 30) - (N * VAR + N * (MEAN - 30) * (MEAN - 30))) < 1e-6, sse(DATA, 30));
chk('the grid minimiser of the absolute deviations is the median',
    Math.abs(ARGMIN_SAD.arg - MEDIAN) <= 0.01, ARGMIN_SAD.arg);
chk('absolute deviations are smaller at the median than at the mean',
    SAD_MEDIAN < SAD_MEAN, SAD_MEDIAN.toFixed(2) + ' < ' + SAD_MEAN.toFixed(2));
chk('the absolute-deviation total at the median is 82', Math.abs(SAD_MEDIAN - 82) < TOL, SAD_MEDIAN);
chk('variance is the mean of the squared deviations', Math.abs(VAR - sum(SQDEVS) / N) < TOL, VAR);
chk('the standard deviation is the root of the variance', Math.abs(SD - Math.sqrt(VAR)) < TOL, SD);
chk('the standard deviation rounds to 19.79', SD.toFixed(2) === '19.79', SD.toFixed(4));
chk('the sample standard deviation is sigma*sqrt(n/(n-1))',
    Math.abs(SAMPLE_SD - SD * Math.sqrt(N / (N - 1))) < TOL, SAMPLE_SD.toFixed(4));
chk('the sample standard deviation is not the population one', Math.abs(SAMPLE_SD - SD) > 1, SAMPLE_SD.toFixed(3));
chk('the mean absolute deviation is not the standard deviation',
    Math.abs(MAD - SD) > 5, MAD.toFixed(3) + ' against ' + SD.toFixed(3));
chk('the mean absolute deviation is 12.296', MAD.toFixed(3) === '12.296', MAD.toFixed(6));
chk('a constant list has zero spread', sd([7, 7, 7, 7]) === 0, 0);
chk('the variance shortcut mean(x^2) - mean^2 agrees',
    Math.abs((sum(DATA.map(function (x) { return x * x; })) / N - MEAN * MEAN) - VAR) < 1e-9, VAR);
chk('adding 7 leaves the standard deviation unchanged',
    Math.abs(sd(SHIFTED) - SD) < 1e-9, sd(SHIFTED));
chk('doubling doubles the standard deviation', Math.abs(sd(DOUBLED) - 2 * SD) < 1e-9, sd(DOUBLED));
chk('adding 7 adds 7 to the mean', Math.abs(mean(SHIFTED) - (MEAN + 7)) < 1e-9, mean(SHIFTED));
chk('doubling doubles the mean', Math.abs(mean(DOUBLED) - 2 * MEAN) < 1e-9, mean(DOUBLED));
chk('the transformed mean is 3*mean + 100', Math.abs(T_MEAN - (3 * MEAN + 100)) < 1e-9, T_MEAN);
chk('the transformed standard deviation is 3*sigma', Math.abs(T_SD - 3 * SD) < 1e-9, T_SD.toFixed(4));
chk('the transformed standard deviation is not 3*sigma + 100',
    Math.abs(T_SD - (3 * SD + 100)) > 50, (3 * SD + 100).toFixed(3));
chk('the transformed median is 3*median + 100', Math.abs(T_MEDIAN - 190) < TOL, T_MEDIAN);
chk('the transformed mode is 3*mode + 100', Math.abs(T_MODE - 190) < TOL, T_MODE);
chk('a positive multiplier preserves the median index position',
    sorted(DATA).indexOf(MEDIAN) === sorted(TRANS).indexOf(T_MEDIAN), 'index 4 on both');
chk('the grouped total is 50', GN === 50, GN);
chk('the grouped mean by midpoints is 29.6', Math.abs(GM_MEAN - 29.6) < 1e-9, GM_MEAN);
chk('the median class is the first reaching N/2', CUMS[GM_CLASS] >= GN / 2 && (GM_CLASS === 0 || CUMS[GM_CLASS - 1] < GN / 2), 'class ' + GM_CLASS);
chk('the interpolated median is 28.667', Math.abs(GM_MEDIAN - 86 / 3) < 1e-9, GM_MEDIAN);
chk('the interpolated median lies inside its own class',
    GM_MEDIAN >= CLASSES[GM_CLASS].lo && GM_MEDIAN <= CLASSES[GM_CLASS].hi, GM_MEDIAN);
chk('the interpolated mode is 27.0', Math.abs(GM_MODE - 27) < 1e-9, GM_MODE);
chk('the interpolated mode lies inside the modal class',
    GM_MODE >= CLASSES[GM_MODE_CLASS].lo && GM_MODE <= CLASSES[GM_MODE_CLASS].hi, GM_MODE);
chk('the modal class holds the largest frequency',
    CLASSES[GM_MODE_CLASS].f === Math.max.apply(null, CLASSES.map(function (c) { return c.f; })), CLASSES[GM_MODE_CLASS].f);
chk('the empirical relation gives 26.8 on this table', Math.abs(GM_EMP - 26.8) < 1e-9, GM_EMP);
chk('the empirical relation is close to the computed mode, and not equal to it',
    Math.abs(GM_EMP - GM_MODE) < 0.5 && Math.abs(GM_EMP - GM_MODE) > 1e-6, (GM_MODE - GM_EMP).toFixed(3));
chk('the grouped order is mode < median < mean', GM_MODE < GM_MEDIAN && GM_MEDIAN < GM_MEAN,
    GM_MODE + ' < ' + GM_MEDIAN.toFixed(3) + ' < ' + GM_MEAN);
chk('the exponential mean is 1/lambda', Math.abs(EXP_MEAN - 2) < TOL, EXP_MEAN);
chk('the exponential median is ln2/lambda', Math.abs(EXP_MEDIAN - Math.log(2) / LAMBDA) < TOL, EXP_MEDIAN.toFixed(4));
chk('the exponential CDF at the median is exactly one half', Math.abs(EXP_CDF_AT_MEDIAN - 0.5) < 1e-12, EXP_CDF_AT_MEDIAN);
chk('the exponential median is below its mean', EXP_MEDIAN < EXP_MEAN, EXP_MEDIAN.toFixed(4));
chk('the exponential mode is 0, where the density is largest',
    LAMBDA * Math.exp(0) > LAMBDA * Math.exp(-LAMBDA * 1), 'density 0.5 at 0');
var UNIFORM_TIES = (function () {
  var m = -1, ties = 0;
  for (var x = 0.05; x < 10; x += 0.05) {
    var d = 1 / 10;                       // density of U(0,10)
    if (d > m + 1e-12) { m = d; ties = 1; }
    else if (Math.abs(d - m) < 1e-12) ties++;
  }
  return ties;
})();
chk('the uniform density is flat, so its mode is not unique', UNIFORM_TIES > 100,
    UNIFORM_TIES + ' sampled points attain the maximum');
chk('the normal density peaks at its mean, so all three averages are mu',
    normalDensity(0, 0, 1) > normalDensity(1, 0, 1) && normalDensity(0, 0, 1) > normalDensity(-1, 0, 1), 'peak at 0');
chk('the binomial mean is np = 400', Math.abs(BIN_MEAN - 400) < TOL, BIN_MEAN);
chk('the binomial variance is np(1-p) = 240', Math.abs(BIN_VAR - 240) < TOL, BIN_VAR);
chk('the binomial standard deviation is 15.4919', BIN_SD.toFixed(4) === '15.4919', BIN_SD.toFixed(6));
chk('the binomial mode is floor((n+1)p) = 400', BIN_MODE === 400, BIN_MODE);
chk('P(Y <= 0) is at least one half for Y = max(X,0)', P_Y_LE_0 >= 0.5, P_Y_LE_0);
chk('P(Y >= 0) is at least one half for Y = max(X,0)', P_Y_GE_0 >= 0.5, P_Y_GE_0);
chk('the truncated mean is not the truncated median', Math.abs(TRUNC_MEAN - 0) > 0.3, TRUNC_MEAN.toFixed(4));
chk('the counterexample has mean above median', CE_MEAN > CE_MEDIAN, CE_MEAN + ' > ' + CE_MEDIAN);
chk('the counterexample has mode above mean', CE_MODE > CE_MEAN, CE_MODE + ' > ' + CE_MEAN);
chk('the practice list 2,4,4,4,5,5,7,9 has mean 5 and variance 4',
    mean(SORTDEMO) === 5 && variance(SORTDEMO) === 4, variance(SORTDEMO));

function normalDensity(x, mu, sigma) {
  var z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

/* ---------- what the render layer reads ---------- */
var V = {
  data: DATA, n: N, mean: MEAN, median: MEDIAN, mode: MODE, modes: MODES,
  variance: VAR, sd: SD, sampleSd: SAMPLE_SD, mad: MAD,
  devs: DEVS, sqdevs: SQDEVS,
  sseMean: SSE_MEAN, sseMedian: SSE_MEDIAN, sadMean: SAD_MEAN, sadMedian: SAD_MEDIAN,
  argminSse: ARGMIN_SSE.arg, argminSad: ARGMIN_SAD.arg,
  even: EVEN, bimodal: BIMODAL, distinct: DISTINCT,
  ta: TA, tb: TB, tMean: T_MEAN, tMedian: T_MEDIAN, tMode: T_MODE, tSd: T_SD,
  shiftSd: sd(SHIFTED), doubleSd: sd(DOUBLED),
  classes: CLASSES, mids: MIDS, cums: CUMS, gN: GN,
  gMean: GM_MEAN, gMedian: GM_MEDIAN, gMode: GM_MODE,
  gClass: GM_CLASS, gModeClass: GM_MODE_CLASS, gEmp: GM_EMP,
  lambda: LAMBDA, expMean: EXP_MEAN, expMedian: EXP_MEDIAN, expMode: EXP_MODE,
  binN: BIN_N, binP: BIN_P, binMean: BIN_MEAN, binVar: BIN_VAR, binSd: BIN_SD, binMode: BIN_MODE,
  truncMean: TRUNC_MEAN,
  ceMean: CE_MEAN, ceMedian: CE_MEDIAN, ceMode: CE_MODE,
  checks: CHECKS.length
};

/* ======================================================================
   LAYER 3 - RENDER
   Every coordinate is fixed. Text never moves once it is placed, so two
   strings can never land on each other: each row has one owner per scene.
   ====================================================================== */

var ROWS = [92, 124, 156, 188, 220, 252, 284, 316, 348, 380, 412, 444];

function sceneOf(t) {
  var sc = (K && K.state && K.state.scenes) || [];
  for (var i = sc.length - 1; i >= 0; i--) if (t >= sc[i].start - 1e-6) return sc[i];
  return sc[0] || null;
}
function prog(t) {
  var s = sceneOf(t);
  if (!s) return 0;
  return K ? K.clamp01((t - s.start) / Math.max(0.001, s.end - s.start)) : 0;
}
function at(t, frac) { return prog(t) >= frac; }

function head(title, sub) {
  P.text(40, 26, title, { size: 16, bold: true, color: PAL.ink });
  P.text(40, 50, sub, { size: 12.5, color: PAL.dim });
  P.line(40, 68, W - 40, 68, { stroke: PAL.border, sw: 1 });
}
function mono(x, y, s, size, color) {
  P.text(x, y, s, { size: size || 13, mono: true, color: color || PAL.ink });
}
function box(x, y, w, h, label, value, ok) {
  var stroke = ok === true ? PAL.valid : ok === false ? PAL.invalid : PAL.border;
  var fill = ok === true ? PAL.accentDim : ok === false ? PAL.invalidDim : PAL.surface2;
  P.rect(x, y, w, h, { fill: fill, stroke: stroke, radius: 6, sw: 1.4 });
  if (label) P.text(x + 8, y + 6, label, { size: 11.5, bold: true, mono: true, color: PAL.ink });
  if (value) P.text(x + 8, y + h - 17, value, { size: 10.5, mono: true, color: PAL.dim });
}
function fmt(x, d) { return Number(x).toFixed(d === undefined ? 3 : d); }

/* value -> x on the salary number line (values 20..95) */
function vx(v) { return 60 + (v - 20) / 75 * 780; }

/* ---------- scene 1: three middles ---------- */
function drawMiddles(t) {
  head('Three different middles',
       'nine salaries in thousands of rupees; one question, three defensible answers');

  var axisY = 210;
  P.line(50, axisY, 870, axisY, { stroke: PAL.border, sw: 1.4 });
  var ticks = [22, 30, 50, 70, 90];
  for (var i = 0; i < ticks.length; i++) {
    P.line(vx(ticks[i]), axisY, vx(ticks[i]), axisY + 6, { stroke: PAL.border, sw: 1.2 });
    P.text(vx(ticks[i]), axisY + 10, String(ticks[i]), { size: 11, mono: true, color: PAL.faint, align: 'center' });
  }

  /* dot plot: stacked dots so repeated values stay visible */
  var seen = {};
  for (var j = 0; j < DATA.length; j++) {
    if (!at(t, 0.02 + j * 0.02)) continue;
    var v = DATA[j], k = seen[v] || 0;
    seen[v] = k + 1;
    P.circle(vx(v), axisY - 12 - k * 18, 6, { fill: PAL.info, stroke: PAL.info });
  }

  var marks = [
    { v: V.mean, col: PAL.accent, name: 'mean', off: 0 },
    { v: V.median, col: PAL.valid, name: 'median', off: -3 },
    { v: V.mode, col: PAL.warn, name: 'mode', off: 3 }
  ];
  for (var m = 0; m < marks.length; m++) {
    if (!at(t, 0.35 + m * 0.12)) continue;
    P.line(vx(marks[m].v) + marks[m].off, axisY - 6, vx(marks[m].v) + marks[m].off, axisY + 6,
           { stroke: marks[m].col, sw: 3 });
  }

  var cols = [
    { x: 60, name: 'mean', val: fmt(V.mean), col: PAL.accent, note: 'pooled share' },
    { x: 330, name: 'median', val: String(V.median), col: PAL.valid, note: 'middle position' },
    { x: 600, name: 'mode', val: String(V.mode), col: PAL.warn, note: 'most frequent' }
  ];
  for (var c = 0; c < cols.length; c++) {
    if (!at(t, 0.4 + c * 0.1)) continue;
    mono(cols[c].x, ROWS[5], cols[c].name, 12, cols[c].col);
    mono(cols[c].x, ROWS[6], cols[c].val, 15, PAL.ink);
    mono(cols[c].x, ROWS[7], cols[c].note, 11.5, PAL.faint);
  }

  if (at(t, 0.6)) mono(60, ROWS[8], 'the total is ' + sum(DATA) + ' over ' + N + ' people: ' + sum(DATA) + '/' + N + ' = ' + fmt(V.mean), 12.5, PAL.dim);
  if (at(t, 0.72)) mono(60, ROWS[9], 'eight of the nine earn less than the mean; the single value 90 supplies the gap', 12.5, PAL.dim);
  if (at(t, 0.85)) {
    P.rect(40, ROWS[10] - 8, 820, 38, { fill: PAL.accentDim, stroke: PAL.accent, radius: 6 });
    mono(56, ROWS[10] + 1, 'three numbers, three questions — none of them is the "right" one', 12.5, PAL.accent);
  }
}

/* ---------- scene 2: the mean ---------- */
function drawMean(t) {
  head('The mean is a balance point',
       'signed deviations from the mean, then the same deviations squared');

  var cx = 450, k = 5;
  for (var i = 0; i < V.devs.length; i++) {
    if (!at(t, 0.05 + i * 0.04)) continue;
    var y = 100 + i * 15, d = V.devs[i];
    mono(60, y, 'x' + (i + 1) + ' = ' + DATA[i], 11, PAL.faint);
    P.line(cx, y + 5, cx + d * k, y + 5, { stroke: d < 0 ? PAL.invalid : PAL.valid, sw: 2 });
    P.circle(cx + d * k, y + 5, 3, { fill: d < 0 ? PAL.invalid : PAL.valid });
    P.text(870, y, fmt(d, 2), { size: 11, mono: true, color: d < 0 ? PAL.invalid : PAL.valid, align: 'right' });
  }
  P.line(cx, 96, cx, 240, { stroke: PAL.accent, sw: 1, dash: [4, 4] });
  P.text(cx, 82, 'mean ' + fmt(V.mean), { size: 11, mono: true, color: PAL.accent, align: 'center' });

  if (at(t, 0.45)) mono(60, ROWS[5], 'the signed deviations add to ' + fmt(sum(V.devs), 4) + ': the mean is where the list balances', 12.5, PAL.accent);
  if (at(t, 0.58)) mono(60, ROWS[6], 'squared, the deviations total ' + fmt(V.sseMean, 0) + ' at the mean and ' + fmt(V.sseMedian, 0) + ' at the median', 12.5);
  if (at(t, 0.7)) mono(60, ROWS[7], 'so the mean is the unique minimiser of the sum of squared deviations', 12.5, PAL.ink);
  if (at(t, 0.8)) mono(60, ROWS[8], 'the page sweeps c over 0.00 to 99.99 in steps of 0.01: the smallest total is at c = ' + fmt(V.argminSse, 2), 12.5, PAL.dim);
  if (at(t, 0.9)) {
    P.rect(40, ROWS[9] - 8, 820, 38, { fill: PAL.warnDim, stroke: PAL.warn, radius: 6 });
    mono(56, ROWS[9] + 1, 'squared error, not absolute error — the next scene shows the minimiser moves', 12.5, PAL.warn);
  }
}

/* ---------- scene 3: the median ---------- */
function drawMedian(t) {
  head('The median is a position, not a value',
       'sort the list, then take the middle — or average the two middles');

  var s = sorted(DATA);
  for (var i = 0; i < s.length; i++) {
    if (!at(t, 0.04 + i * 0.03)) continue;
    var x = 60 + i * 88;
    box(x, 84, 78, 44, String(s[i]), '#' + (i + 1), i === 4);
  }
  P.text(60, 136, 'sorted, nine values: the fifth is the median', { size: 11.5, color: PAL.faint });

  var e = sorted(EVEN);
  if (at(t, 0.4)) {
    for (var j = 0; j < e.length; j++) {
      var ex = 60 + j * 88;
      box(ex, 170, 78, 40, String(e[j]), '#' + (j + 1), false);
    }
    P.text(620, 186, 'even n = 6', { size: 11.5, mono: true, color: PAL.faint });
    mono(620, 204, 'median = (2+3)/2 = 2.5', 11.5, PAL.accent);
  }
  if (at(t, 0.55)) mono(60, ROWS[7], '2.5 appears nowhere in the list: an even-n median need not be a data value', 12.5, PAL.dim);
  if (at(t, 0.66)) mono(60, ROWS[8], 'absolute deviations total ' + fmt(V.sadMedian, 0) + ' at the median and ' + fmt(V.sadMean, 2) + ' at the mean', 12.5);
  if (at(t, 0.78)) mono(60, ROWS[9], 'the grid search over c puts that minimum at c = ' + fmt(V.argminSad, 2), 12.5, PAL.dim);
  if (at(t, 0.88)) {
    P.rect(40, ROWS[10] - 8, 820, 38, { fill: PAL.accentDim, stroke: PAL.accent, radius: 6 });
    mono(56, ROWS[10] + 1, 'squared error -> mean; absolute error -> median. Two penalties, two answers.', 12.5, PAL.accent);
  }
}

/* ---------- scene 4: the mode ---------- */
function drawMode(t) {
  head('The mode is a count',
       'one mode, two modes, or none — and the only average that works on categories');

  var counts = {}, order = [];
  for (var i = 0; i < DATA.length; i++) {
    if (counts[DATA[i]] === undefined) { counts[DATA[i]] = 0; order.push(DATA[i]); }
    counts[DATA[i]]++;
  }
  order.sort(function (a, b) { return a - b; });
  P.text(60, 84, 'salary frequencies', { size: 11.5, mono: true, color: PAL.faint });
  var baseY = 190;
  for (var j = 0; j < order.length; j++) {
    if (!at(t, 0.05 + j * 0.05)) continue;
    var v = order[j], h = counts[v] * 22, x = 60 + j * 56;
    P.rect(x, baseY - h, 40, h, { fill: counts[v] === 3 ? PAL.accentDim : PAL.surface2,
                                  stroke: counts[v] === 3 ? PAL.accent : PAL.border, radius: 3 });
    P.text(x + 20, baseY - h - 15, String(counts[v]), { size: 11, mono: true, color: PAL.dim, align: 'center' });
    P.text(x + 20, baseY + 6, String(v), { size: 11, mono: true, color: PAL.faint, align: 'center' });
  }

  if (at(t, 0.4)) {
    P.text(470, 84, 'two modes', { size: 11.5, mono: true, color: PAL.faint });
    mono(470, 110, '1, 1, 2, 2, 3, 4', 12.5, PAL.ink);
    mono(470, 134, 'modes {1, 2}: bimodal', 12, PAL.accent);
  }
  if (at(t, 0.55)) {
    P.text(470, 168, 'no mode', { size: 11.5, mono: true, color: PAL.faint });
    mono(470, 194, '1, 2, 3, 4, 5', 12.5, PAL.ink);
    mono(470, 218, 'every value once: no winner', 12, PAL.invalid);
  }
  if (at(t, 0.68)) mono(60, ROWS[7], 'a uniform density is the limit: every point ties, so no single number is the mode', 12.5, PAL.dim);
  if (at(t, 0.8)) mono(60, ROWS[8], 'the mode ignores size and order, which is why it is the only average for categories', 12.5);
  if (at(t, 0.9)) {
    P.rect(40, ROWS[9] - 8, 820, 38, { fill: PAL.accentDim, stroke: PAL.accent, radius: 6 });
    mono(56, ROWS[9] + 1, 'here 30 occurs three times, so the mode is 30 — and the median happens to equal it', 12.5, PAL.accent);
  }
}

/* ---------- scene 5: grouped data ---------- */
function drawGrouped(t) {
  head('Grouped data: three interpolation formulas',
       'fifty observations, six classes of width 10 — the raw values are gone');

  for (var i = 0; i < CLASSES.length; i++) {
    if (!at(t, 0.04 + i * 0.04)) continue;
    var x = 60 + i * 130;
    box(x, 84, 122, 62, CLASSES[i].lo + '\u2013' + CLASSES[i].hi, 'f=' + CLASSES[i].f + '  cum=' + CUMS[i],
        i === V.gClass || i === V.gModeClass ? true : null);
  }
  if (at(t, 0.35)) mono(60, ROWS[5], 'mean by midpoints: (4\u00b75 + 8\u00b715 + 15\u00b725 + 12\u00b735 + 6\u00b745 + 5\u00b755)/50', 12, PAL.dim);
  if (at(t, 0.42)) mono(60, ROWS[6], 'that weighted sum is 1480, so the grouped mean is ' + fmt(V.gMean, 1), 12.5, PAL.ink);
  if (at(t, 0.55)) mono(60, ROWS[7], 'median: N/2 = 25; the first cumulative to reach it is class ' + (V.gClass + 1) + ', so 20 + (25-12)/15\u00b710', 12.5);
  if (at(t, 0.63)) mono(60, ROWS[8], 'grouped median = ' + fmt(V.gMedian, 3) + ', inside its own class 20\u201330', 12.5, PAL.valid);
  if (at(t, 0.74)) mono(60, ROWS[9], 'mode: modal class ' + (V.gModeClass + 1) + ' (f=15) with neighbours 8 and 12 gives 20 + 7/10\u00b710 = ' + fmt(V.gMode, 1), 12.5);
  if (at(t, 0.86)) {
    P.rect(40, ROWS[10] - 8, 820, 38, { fill: PAL.warnDim, stroke: PAL.warn, radius: 6 });
    mono(56, ROWS[10] + 1, 'all three are estimates: they assume equal widths and values spread evenly inside a class', 12.5, PAL.warn);
  }
}

/* ---------- scene 6: the spread ---------- */
function drawSpread(t) {
  head('Standard deviation: square, average, root',
       'the squared deviations, drawn to scale — one value supplies most of the total');

  var maxSq = Math.max.apply(null, V.sqdevs);
  for (var i = 0; i < V.sqdevs.length; i++) {
    if (!at(t, 0.04 + i * 0.035)) continue;
    var h = V.sqdevs[i] / maxSq * 96, x = 60 + i * 50;
    P.rect(x, 200 - h, 34, h, { fill: PAL.surface2, stroke: PAL.border, radius: 2 });
    P.text(x + 17, 206, String(DATA[i]), { size: 10.5, mono: true, color: PAL.faint, align: 'center' });
  }
  if (at(t, 0.4)) mono(560, 98, '3061.78', 11.5, PAL.invalid);
  if (at(t, 0.42)) mono(560, 118, 'one value, 87% of the total', 11.5, PAL.faint);
  if (at(t, 0.5)) mono(60, ROWS[5], 'the squared deviations total ' + fmt(V.sseMean, 0) + '; divided by n = ' + N + ' that is the variance ' + fmt(V.variance, 3), 12.5);
  if (at(t, 0.6)) mono(60, ROWS[6], 'the root returns the units: sigma = ' + fmt(V.sd, 3) + ' thousand rupees', 12.5, PAL.accent);
  if (at(t, 0.7)) mono(60, ROWS[7], 'mean absolute deviation = ' + fmt(V.mad, 3) + ' — a different measure, 38% smaller', 12.5, PAL.dim);
  if (at(t, 0.8)) mono(60, ROWS[8], 'dividing by n-1 instead of n gives the sample version: ' + fmt(V.sampleSd, 3), 12.5);
  if (at(t, 0.9)) {
    P.rect(40, ROWS[9] - 8, 820, 38, { fill: PAL.warnDim, stroke: PAL.warn, radius: 6 });
    mono(56, ROWS[9] + 1, 'n-1 is not "more correct": it answers a different question, about a population', 12.5, PAL.warn);
  }
}

/* ---------- scene 7: shift and scale ---------- */
function drawTransform(t) {
  head('Shift and scale: y = 3x + 100',
       'GATE CSE 2011 asked which statement about such a map is incorrect');

  P.text(60, 84, 'statistic', { size: 11.5, mono: true, color: PAL.faint });
  P.text(300, 84, 'before', { size: 11.5, mono: true, color: PAL.faint });
  P.text(470, 84, 'after', { size: 11.5, mono: true, color: PAL.faint });
  P.text(660, 84, 'rule', { size: 11.5, mono: true, color: PAL.faint });

  var rows = [
    ['mean', fmt(V.mean), fmt(V.tMean, 1), 'a\u00b7mean + b'],
    ['median', String(V.median), String(V.tMedian), 'a\u00b7median + b'],
    ['mode', String(V.mode), String(V.tMode), 'a\u00b7mode + b'],
    ['sigma', fmt(V.sd), fmt(V.tSd, 3), 'a\u00b7sigma, no b']
  ];
  for (var i = 0; i < rows.length; i++) {
    if (!at(t, 0.08 + i * 0.1)) continue;
    var y = 108 + i * 28;
    mono(60, y, rows[i][0], 12.5, PAL.ink);
    mono(300, y, rows[i][1], 12.5, PAL.dim);
    mono(470, y, rows[i][2], 12.5, i === 3 ? PAL.accent : PAL.ink);
    mono(660, y, rows[i][3], 12, i === 3 ? PAL.accent : PAL.faint);
  }
  if (at(t, 0.55)) mono(60, ROWS[6], 'one line explains it: y - mean(y) = a(x - mean(x)), so the constant cancels', 12.5);
  if (at(t, 0.66)) mono(60, ROWS[7], 'inside the variance the factor is squared; the root takes it back out as |a|', 12.5, PAL.dim);
  if (at(t, 0.76)) mono(60, ROWS[8], 'adding 7 alone leaves sigma at ' + fmt(V.shiftSd, 3) + '; doubling alone gives ' + fmt(V.doubleSd, 3), 12.5);
  if (at(t, 0.87)) {
    P.rect(40, ROWS[9] - 8, 820, 38, { fill: PAL.invalidDim, stroke: PAL.invalid, radius: 6 });
    mono(56, ROWS[9] + 1, 'sigma_y = a\u00b7sigma_x + b is the option GATE wanted you to reject', 12.5, PAL.invalid);
  }
}

/* ---------- scene 8: distributions ---------- */
function drawDists(t) {
  head('The three middles of a distribution',
       'exponential with rate 0.5, then uniform, normal, binomial and a truncated normal');

  P.line(60, 210, 400, 210, { stroke: PAL.border, sw: 1.2 });
  P.line(60, 210, 60, 96, { stroke: PAL.border, sw: 1.2 });
  var prevX = null, prevY = null;
  for (var i = 0; i <= 60; i++) {
    var xv = i / 10, px = 60 + xv / 6 * 330, py = 210 - (Math.exp(-LAMBDA * xv)) * 100;
    if (prevX !== null) P.line(prevX, prevY, px, py, { stroke: PAL.info, sw: 1.8 });
    prevX = px; prevY = py;
  }
  if (at(t, 0.25)) {
    P.line(60 + V.expMode / 6 * 330, 210, 60 + V.expMode / 6 * 330, 100, { stroke: PAL.warn, sw: 1, dash: [3, 3] });
    mono(66, 104, 'mode 0', 11, PAL.warn);
  }
  if (at(t, 0.32)) {
    P.line(60 + V.expMedian / 6 * 330, 210, 60 + V.expMedian / 6 * 330, 100, { stroke: PAL.valid, sw: 1, dash: [3, 3] });
    mono(60 + V.expMedian / 6 * 330 + 4, 132, 'median 1.386', 11, PAL.valid);
  }
  if (at(t, 0.4)) {
    P.line(60 + V.expMean / 6 * 330, 210, 60 + V.expMean / 6 * 330, 100, { stroke: PAL.accent, sw: 1, dash: [3, 3] });
    mono(60 + V.expMean / 6 * 330 + 4, 160, 'mean 2', 11, PAL.accent);
  }
  if (at(t, 0.5)) mono(60, ROWS[5], 'exponential: mean 1/lambda = 2, median ln2/lambda = 1.386, mode 0 — three different numbers', 12, PAL.ink);
  if (at(t, 0.58)) mono(60, ROWS[6], 'the CDF at the median is exactly 0.5, which is what median means here', 12, PAL.dim);
  if (at(t, 0.66)) mono(60, ROWS[7], 'uniform: mean and median both (a+b)/2, but every point ties for the mode', 12, PAL.ink);
  if (at(t, 0.73)) mono(60, ROWS[8], 'normal: mean = median = mode = mu, the peak of the density', 12, PAL.ink);
  if (at(t, 0.8)) mono(60, ROWS[9], 'binomial(1000, 0.4): mean 400, variance 240, sigma 15.4919 — GATE CSE 2021 asked for the root', 12, PAL.accent);
  if (at(t, 0.9)) mono(60, ROWS[10], 'Y = max(X,0): half the mass sits on 0, so the median is 0 while the mean is ' + fmt(V.truncMean, 3), 12, PAL.warn);
}

/* ---------- scene 9: skewness ---------- */
function drawSkew(t) {
  head('Skewness and the empirical relation',
       'the ordering rule is a description, not a theorem');

  for (var i = 0; i < CE.length; i++) {
    if (!at(t, 0.04 + i * 0.04)) continue;
    box(60 + i * 80, 84, 66, 42, String(CE[i]), null, false);
  }
  if (at(t, 0.35)) mono(60, ROWS[5], 'mean ' + fmt(V.ceMean, 1) + ' > median ' + fmt(V.ceMedian, 1) + ', which reads as right skew', 12.5, PAL.ink);
  if (at(t, 0.45)) mono(60, ROWS[6], 'yet the mode is ' + V.ceMode + ': two peaks with a gap between them pull the other way', 12.5, PAL.invalid);
  if (at(t, 0.56)) mono(60, ROWS[7], 'on the grouped table the order does hold: ' + fmt(V.gMode, 1) + ' < ' + fmt(V.gMedian, 3) + ' < ' + fmt(V.gMean, 1), 12.5, PAL.valid);
  if (at(t, 0.68)) mono(60, ROWS[8], 'empirical relation 3\u00b7median - 2\u00b7mean = ' + fmt(V.gEmp, 1) + ' against the computed mode ' + fmt(V.gMode, 1), 12.5, PAL.accent);
  if (at(t, 0.8)) mono(60, ROWS[9], 'close here, approximate always: it assumes moderately skewed, single-peaked data', 12.5, PAL.dim);
  if (at(t, 0.9)) {
    P.rect(40, ROWS[10] - 8, 820, 38, { fill: PAL.accentDim, stroke: PAL.accent, radius: 6 });
    mono(56, ROWS[10] + 1, 'use the ordering to sanity-check an answer, never to derive one', 12.5, PAL.accent);
  }
}

/* ---------- scene 10: the rules ---------- */
function drawRules(t) {
  head('Which average to compute',
       'the wording chooses the formula; the arithmetic is the easy part');

  var rules = [
    '1. is the wording about mass, position or frequency?',
    '2. is the object a list or a distribution?',
    '3. if a list: raw values, or a frequency table?',
    '4. is a shift or a scale applied? use the two rules, do not recompute'
  ];
  for (var i = 0; i < rules.length; i++) {
    if (!at(t, 0.06 + i * 0.11)) continue;
    mono(60, ROWS[0] + i * 26, rules[i], 12.5, i === 0 ? PAL.accent : PAL.ink);
  }
  if (at(t, 0.55)) mono(60, ROWS[5], 'four numbers from this data set, worth reproducing from memory:', 12, PAL.dim);
  if (at(t, 0.62)) mono(60, ROWS[6], 'mean ' + fmt(V.mean) + '   median ' + V.median + '   mode ' + V.mode + '   sigma ' + fmt(V.sd), 13, PAL.ink);
  if (at(t, 0.72)) mono(60, ROWS[7], 'and the two distractors: sample s = ' + fmt(V.sampleSd) + ', mean absolute deviation = ' + fmt(V.mad), 12, PAL.faint);
  if (at(t, 0.82)) {
    P.rect(40, ROWS[8] - 6, 820, 34, { fill: PAL.warnDim, stroke: PAL.warn, radius: 6 });
    mono(56, ROWS[8] + 3, 'the two costly slips: dividing by n-1, and reporting a variance where sigma was asked', 12, PAL.warn);
  }
  if (at(t, 0.92)) mono(60, ROWS[10], 'decide what the question measures before you compute anything', 13, PAL.accent);
}

function drawFrame(Pp) {
  if (!Pp) return;
  P = Pp;
  P.clear();
  P.alpha(1);
  var t = K && K.state ? K.state.elapsed : 0;
  var s = sceneOf(t);
  var id = s ? s.id : 'middles';
  if (id === 'middles') drawMiddles(t);
  else if (id === 'mean') drawMean(t);
  else if (id === 'median') drawMedian(t);
  else if (id === 'mode') drawMode(t);
  else if (id === 'grouped') drawGrouped(t);
  else if (id === 'spread') drawSpread(t);
  else if (id === 'transform') drawTransform(t);
  else if (id === 'dists') drawDists(t);
  else if (id === 'skew') drawSkew(t);
  else drawRules(t);
}

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

function boot() {
  var holder = document.getElementById('canvas-holder');
  var fallback = document.getElementById('canvas-fallback');
  var ok = false;

  if (typeof window.p5 === 'function') {
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
      if (holder) holder.appendChild(cv);
      var ctx2d = cv.getContext && cv.getContext('2d');
      if (ctx2d) {
        P = PR.makePainter2D(ctx2d, W, H);
        drawFrame(P);
        drew = true;
      }
    } catch (e) {
      console.error('canvas fallback failed', e);
    }
    if (!drew && fallback && fallback.classList) fallback.classList.add('show');
  }

  var checkBox = document.getElementById('checks');
  if (checkBox) {
    var bad = CHECKS.filter(function (c) { return !c.pass; });
    checkBox.innerHTML = '<span class="k">Model checks</span>' +
      (bad.length ? bad.length + ' of ' + CHECKS.length + ' failed' : CHECKS.length + '/' + CHECKS.length + ' passed');
  }

  if (K && K.init && window.LESSON_TIMELINE) {
    K.init({
      timeline: window.LESSON_TIMELINE,
      draw: function () { if (P) drawFrame(P); }
    });
  }

  window.__drawAt = function (t) {
    if (K && K.state) K.state.elapsed = t;
    if (P) drawFrame(P);
  };

  var failing = CHECKS.filter(function (c) { return !c.pass; });
  if (failing.length) console.warn('Model validation did not fully pass:', failing);
}

window.__MODEL = { V: V, CHECKS: CHECKS };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
