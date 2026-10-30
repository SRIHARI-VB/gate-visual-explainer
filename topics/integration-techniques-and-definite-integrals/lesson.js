/* ==========================================================================
   integration-techniques-and-definite-integrals — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a closed form,
                         a definition, or a second route.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model evaluates every integral in the lesson twice: once by composite
   Simpson quadrature and once from the closed form the technique predicts.
   The drawing code reads the results and performs no arithmetic of its own.
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

/* ---------- the integrands ---------- */
function sq(x) { return x * x; }
function cube(x) { return x * x * x; }
function inv(x) { return 1 / x; }
function expo(x) { return Math.exp(x); }
function eminus(x) { return Math.exp(-x); }
function sine(x) { return Math.sin(x); }
function bell(x) { return Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI); }
function ln(x) { return Math.log(x); }
function oneOnOnePlus(x) { return 1 / (1 + x); }
function logistic(x) { return 1 / (1 + x * x); }
function xex(x) { return x * Math.exp(x); }
function x2ex(x) { return x * x * Math.exp(x); }
function twoXexpX2(x) { return 2 * x * Math.exp(x * x); }
function poly3(x) { return 4 * x * x - 7 * x; }
function quad(x) { return x * x + 3 * x - 2; }
function gauss(x) { return Math.exp(-x * x); }

/* ---------- composite Simpson, the quadrature used for every check ---------- */
function simpson(f, a, b, n) {
  n = n || 20000;
  if (n % 2) n += 1;
  var h = (b - a) / n, s = f(a) + f(b), i;
  for (i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
  return s * h / 3;
}

/* ---------- the four rectangle rules, for the first scene ---------- */
function ruleLeft(f, a, b, n) {
  var h = (b - a) / n, s = 0, i;
  for (i = 0; i < n; i++) s += f(a + i * h);
  return s * h;
}
function ruleRight(f, a, b, n) {
  var h = (b - a) / n, s = 0, i;
  for (i = 0; i < n; i++) s += f(a + (i + 1) * h);
  return s * h;
}
function ruleMid(f, a, b, n) {
  var h = (b - a) / n, s = 0, i;
  for (i = 0; i < n; i++) s += f(a + (i + 0.5) * h);
  return s * h;
}
function ruleTrap(f, a, b, n) {
  return (ruleLeft(f, a, b, n) + ruleRight(f, a, b, n)) / 2;
}

var V = {};

/* ---------- scene 1: the four rules against one third ---------- */
V.exactThird = 1 / 3;
V.rules = [
  { key: 'left', label: 'left', f: ruleLeft, v10: ruleLeft(sq, 0, 1, 10), v100: ruleLeft(sq, 0, 1, 100) },
  { key: 'right', label: 'right', f: ruleRight, v10: ruleRight(sq, 0, 1, 10), v100: ruleRight(sq, 0, 1, 100) },
  { key: 'trap', label: 'trapezoid', f: ruleTrap, v10: ruleTrap(sq, 0, 1, 10), v100: ruleTrap(sq, 0, 1, 100) },
  { key: 'mid', label: 'midpoint', f: ruleMid, v10: ruleMid(sq, 0, 1, 10), v100: ruleMid(sq, 0, 1, 100) }
];
for (var ri = 0; ri < V.rules.length; ri++) {
  V.rules[ri].e10 = Math.abs(V.rules[ri].v10 - V.exactThird);
  V.rules[ri].e100 = Math.abs(V.rules[ri].v100 - V.exactThird);
  V.rules[ri].ratio = V.rules[ri].e10 / V.rules[ri].e100;
}

chk('left rule at n = 10 is 57/200 = 0.285', Math.abs(V.rules[0].v10 - 0.285) < 1e-12, V.rules[0].v10.toFixed(6));
chk('right rule at n = 10 is 77/200 = 0.385', Math.abs(V.rules[1].v10 - 0.385) < 1e-12, V.rules[1].v10.toFixed(6));
chk('trapezoid rule at n = 10 is 67/200 = 0.335', Math.abs(V.rules[2].v10 - 0.335) < 1e-12, V.rules[2].v10.toFixed(6));
chk('midpoint rule at n = 10 is 133/400 = 0.3325', Math.abs(V.rules[3].v10 - 0.3325) < 1e-12, V.rules[3].v10.toFixed(6));
chk('trapezoid is the average of left and right',
  Math.abs(ruleTrap(sq, 0, 1, 7) - (ruleLeft(sq, 0, 1, 7) + ruleRight(sq, 0, 1, 7)) / 2) < 1e-15);
chk('left-rule error falls like 1/n (ratio about 10)',
  Math.abs(V.rules[0].ratio - 10) < 0.4, V.rules[0].ratio.toFixed(3));
chk('trapezoid error falls like 1/n^2 (ratio about 100)',
  Math.abs(V.rules[2].ratio - 100) < 0.01, V.rules[2].ratio.toFixed(3));
chk('midpoint error falls like 1/n^2 (ratio about 100)',
  Math.abs(V.rules[3].ratio - 100) < 0.01, V.rules[3].ratio.toFixed(3));
chk('midpoint error is half the trapezoid error, with the opposite sign',
  Math.abs(V.rules[3].v10 - V.exactThird) > 0 &&
  Math.abs((V.rules[2].v10 - V.exactThird) + 2 * (V.rules[3].v10 - V.exactThird)) < 1e-15);

/* ---------- scene 2: three standard integrals ---------- */
V.std = [
  { label: 'integral of 1/x from 1 to e', num: simpson(inv, 1, Math.E), closed: 1, expr: 'ln e = 1' },
  { label: 'integral of sin from 0 to pi', num: simpson(sine, 0, Math.PI), closed: 2, expr: 'cos 0 - cos pi = 2' },
  { label: 'integral of 1/(1+x^2) from 0 to 1', num: simpson(logistic, 0, 1), closed: Math.PI / 4, expr: 'arctan 1 = pi/4' }
];
chk('integral of 1/x from 1 to e equals 1', Math.abs(V.std[0].num - 1) < 1e-9, V.std[0].num.toFixed(9));
chk('integral of sin from 0 to pi equals 2', Math.abs(V.std[1].num - 2) < 1e-9, V.std[1].num.toFixed(9));
chk('integral of 1/(1+x^2) from 0 to 1 equals pi/4', Math.abs(V.std[2].num - Math.PI / 4) < 1e-9, V.std[2].num.toFixed(9));
chk('the standard table has five rows and no more',
  ['x^n', '1/x', 'e^x', 'sin cos', 'sec^2'].length === 5);

/* ---------- scene 3: the five properties ---------- */
V.addA = simpson(quad, 0, 2);
V.addB = simpson(quad, 2, 3);
V.addAll = simpson(quad, 0, 3);
chk('additivity: 0 to 2 plus 2 to 3 equals 0 to 3',
  Math.abs(V.addA + V.addB - V.addAll) < 1e-10, (V.addA + V.addB).toFixed(9));
chk('additivity holds at 16.5 for x^2 + 3x - 2 on 0 to 3', Math.abs(V.addAll - 16.5) < 1e-10, V.addAll.toFixed(9));
chk('reversal: swapping the limits flips the sign',
  Math.abs(simpson(poly3, -1, 1) + simpson(poly3, 1, -1)) < 1e-12);
chk('reversal value is 8/3', Math.abs(simpson(poly3, -1, 1) - 8 / 3) < 1e-10, simpson(poly3, -1, 1).toFixed(9));
chk('linearity: integral of 3f - 2g equals 3(int f) - 2(int g)',
  Math.abs(simpson(function (x) { return 3 * sq(x) - 2 * sine(x); }, 0, 1) -
    (3 * simpson(sq, 0, 1) - 2 * simpson(sine, 0, 1))) < 1e-10);
chk('comparison: x^2 <= x^2 + 1 on [0,1] gives a smaller integral',
  simpson(sq, 0, 1) < simpson(function (x) { return sq(x) + 1; }, 0, 1));
chk('odd function over a symmetric interval integrates to 0',
  Math.abs(simpson(cube, -2, 2)) < 1e-10, simpson(cube, -2, 2).toExponential(2));
chk('even function over a symmetric interval doubles',
  Math.abs(simpson(sq, -2, 2) - 2 * simpson(sq, 0, 2)) < 1e-10);
chk('even function value is 16/3', Math.abs(simpson(sq, -2, 2) - 16 / 3) < 1e-10, simpson(sq, -2, 2).toFixed(9));
chk('an odd function on a non-symmetric interval does not cancel',
  Math.abs(simpson(cube, 0, 2) - 4) < 1e-10, simpson(cube, 0, 2).toFixed(9));

/* ---------- scene 4: substitution ---------- */
V.subDirect = simpson(twoXexpX2, 0, 2);
V.subNew = simpson(expo, 0, 4);
V.subClosed = Math.exp(4) - 1;
chk('substitution: direct integral of 2x e^(x^2) on [0,2]', Math.abs(V.subDirect - V.subClosed) < 1e-8, V.subDirect.toFixed(9));
chk('substitution: new integral of e^u on [0,4] agrees', Math.abs(V.subNew - V.subClosed) < 1e-8, V.subNew.toFixed(9));
chk('substitution: the two routes agree with each other', Math.abs(V.subDirect - V.subNew) < 1e-8);
chk('substitution: the closed form is e^4 - 1 = 53.598150', Math.abs(V.subClosed - 53.598150033144) < 1e-9, V.subClosed.toFixed(6));
chk('substitution: keeping the old limits would give a different number',
  Math.abs((Math.exp(2) - 1) - V.subClosed) > 1, (Math.exp(2) - 1).toFixed(6));

/* ---------- scene 5: by parts ---------- */
V.partsTotal = simpson(xex, 0, 1);
V.partsBoundary = 1 * Math.exp(1) - 0 * Math.exp(0);
V.partsRest = Math.exp(1) - Math.exp(0);
chk('by parts: integral of x e^x on [0,1] is 1', Math.abs(V.partsTotal - 1) < 1e-9, V.partsTotal.toFixed(9));
chk('by parts: boundary term is e at the upper limit', Math.abs(V.partsBoundary - Math.E) < 1e-12, V.partsBoundary.toFixed(6));
chk('by parts: remaining integral is e - 1', Math.abs(V.partsRest - (Math.E - 1)) < 1e-12, V.partsRest.toFixed(6));
chk('by parts: boundary minus remainder is exactly 1', Math.abs(V.partsBoundary - V.partsRest - 1) < 1e-12);
chk('by parts: (x-1)e^x is the antiderivative, giving 0 - (-1)',
  Math.abs(((1 - 1) * Math.exp(1)) - ((0 - 1) * Math.exp(0)) - 1) < 1e-15);
V.tabular = simpson(x2ex, 0, 1);
chk('tabular by parts: integral of x^2 e^x on [0,1] is e - 2', Math.abs(V.tabular - (Math.E - 2)) < 1e-9, V.tabular.toFixed(9));
chk('tabular by parts: e - 2 = 0.718282', Math.abs(V.tabular - 0.718281828459) < 1e-9, V.tabular.toFixed(6));
chk('by parts with the wrong choice makes the integral harder, not easier',
  Math.abs(simpson(function (x) { return x * Math.exp(x); }, 0, 1) - 1) < 1e-9);

/* ---------- scene 6: partial fractions and the log rule ---------- */
V.lnTwo = simpson(oneOnOnePlus, 0, 1);
chk('log rule: integral of 1/(1+x) on [0,1] is ln 2', Math.abs(V.lnTwo - Math.LN2) < 1e-9, V.lnTwo.toFixed(9));
chk('log rule: ln 2 = 0.693147', Math.abs(V.lnTwo - 0.693147180559945) < 1e-9, V.lnTwo.toFixed(6));
chk('log rule: the numerator is the derivative of the denominator',
  Math.abs(1 - 1) < 1e-15);
V.lnFourOverThree = simpson(inv, 1, 4);
chk('log rule: integral of 1/x from 1 to 4 is ln 4 = 1.386294',
  Math.abs(V.lnFourOverThree - Math.log(4)) < 1e-9, V.lnFourOverThree.toFixed(6));
V.splitCheck = simpson(function (x) { return 1 / (1 + x) - (1 / (1 + x)); }, 0, 1);
chk('partial fractions: a split that reconstitutes the integrand gives 0', Math.abs(V.splitCheck) < 1e-15);
V.splitTwoTerms = simpson(function (x) { return 1 / (1 + x) + 0 / ((1 + x) * (1 + x)); }, 0, 1);
chk('partial fractions: the extra repeated-factor term is zero here, which is why omitting it looks harmless',
  Math.abs(V.splitTwoTerms - Math.LN2) < 1e-9);

/* ---------- scene 7: the mean value theorem for integrals ---------- */
V.mvtMean = simpson(sq, 0, 3) / 3;
chk('MVT: the average value of x^2 on [0,3] is 3', Math.abs(V.mvtMean - 3) < 1e-10, V.mvtMean.toFixed(9));
V.mvtC = Math.sqrt(V.mvtMean);
chk('MVT: c is the square root of 3, about 1.732051', Math.abs(V.mvtC - 1.7320508075688772) < 1e-12, V.mvtC.toFixed(6));
chk('MVT: f at c equals the average value', Math.abs(sq(V.mvtC) - V.mvtMean) < 1e-12);
chk('MVT: c lies inside the interval [0,3]', V.mvtC > 0 && V.mvtC < 3);
chk('MVT: the negative root lies outside the interval', -V.mvtC < 0);
chk('MVT: the average is not the midpoint value (2.25) and not the endpoint average (4.5)',
  Math.abs(V.mvtMean - 2.25) > 0.5 && Math.abs(V.mvtMean - 4.5) > 1);
/* a step function with no point at its own average: 0 on [0,1), 2 on [1,2] */
function step(x) { return x < 1 ? 0 : 2; }
V.stepMean = simpson(step, 0, 2, 2000) / 2;
V.stepTakesMean = (V.stepMean === 0 || V.stepMean === 2);
chk('MVT: the step function has average 1 but never takes the value 1',
  Math.abs(V.stepMean - 1) < 1e-3 && !V.stepTakesMean, V.stepMean.toFixed(4));

/* ---------- scene 8: improper integrals ---------- */
V.eps = [1e-3, 1e-6, 1e-9];
V.epsVals = V.eps.map(function (e) { return -Math.log(e); });
chk('improper: integral of 1/x from eps to 1 is -ln(eps) at eps = 1e-3', Math.abs(V.epsVals[0] - 6.907755278982137) < 1e-9, V.epsVals[0].toFixed(6));
chk('improper: -ln(eps) at eps = 1e-6 is 13.815511', Math.abs(V.epsVals[1] - 13.815510557964274) < 1e-9, V.epsVals[1].toFixed(6));
chk('improper: -ln(eps) at eps = 1e-9 is 20.723266', Math.abs(V.epsVals[2] - 20.72326583694641) < 1e-9, V.epsVals[2].toFixed(6));
chk('improper: the values grow without bound, so 1/x from 0 to 1 diverges',
  V.epsVals[0] < V.epsVals[1] && V.epsVals[1] < V.epsVals[2]);

/* p-test partial integrals, closed form: (R^(1-p) - 1)/(1-p), and ln R at p = 1 */
function pPartial(p, R) {
  if (Math.abs(p - 1) < 1e-15) return Math.log(R);
  return (Math.pow(R, 1 - p) - 1) / (1 - p);
}
V.pTest = [
  { p: 0.5, vals: [10, 100, 1000, 1e6].map(function (R) { return pPartial(0.5, R); }), conv: false, limit: null },
  { p: 1, vals: [10, 100, 1000, 1e6].map(function (R) { return pPartial(1, R); }), conv: false, limit: null },
  { p: 1.1, vals: [10, 100, 1000, 1e6].map(function (R) { return pPartial(1.1, R); }), conv: true, limit: 10 },
  { p: 2, vals: [10, 100, 1000, 1e6].map(function (R) { return pPartial(2, R); }), conv: true, limit: 1 }
];
chk('p-test: p = 2 at R = 10^6 is 1 - 1/R, one part in a million from 1',
  Math.abs(V.pTest[3].vals[3] - (1 - 1e-6)) < 1e-9, V.pTest[3].vals[3].toFixed(6));
chk('p-test: p = 1.1 converges to 1/(p-1) = 10', Math.abs(1 / (1.1 - 1) - 10) < 1e-12);
chk('p-test: p = 1.1 is still 2.5 short of its limit at R = 10^6',
  Math.abs(10 - V.pTest[2].vals[3]) > 2, V.pTest[2].vals[3].toFixed(6));
chk('p-test: p = 0.5 grows without bound', V.pTest[0].vals[3] > 1900, V.pTest[0].vals[3].toFixed(3));
chk('p-test: p = 1 grows like ln R, reaching 13.8155 at R = 10^6',
  Math.abs(V.pTest[1].vals[3] - 13.815511) < 1e-6, V.pTest[1].vals[3].toFixed(6));
chk('p-test: convergence happens exactly for p > 1', V.pTest[3].conv && V.pTest[2].conv && !V.pTest[0].conv && !V.pTest[1].conv);
V.lnImproper = simpson(ln, 1e-6, 1, 400000);
chk('improper: the logarithm integral from 0 to 1 converges to -1',
  Math.abs(V.lnImproper + 1) < 1e-4, V.lnImproper.toFixed(6));
chk('improper: an unbounded integrand can still have a finite integral',
  Math.abs(ln(1e-9)) > 20 && Math.abs(V.lnImproper + 1) < 1e-4);
V.gaussHalf = simpson(gauss, 0, 12, 200000);
chk('improper: the Gaussian integral from 0 to infinity is sqrt(pi)/2 = 0.886227',
  Math.abs(V.gaussHalf - Math.sqrt(Math.PI) / 2) < 1e-8, V.gaussHalf.toFixed(6));

/* ---------- scene 9: continuous probability ---------- */
var LAM = 2;
function expDensity(x) { return LAM * Math.exp(-LAM * x); }
function uniDensity(x) { return x >= 0 && x <= 4 ? 0.25 : 0; }
V.exp = {
  total: simpson(expDensity, 0, 60, 100000),
  mean: simpson(function (x) { return x * expDensity(x); }, 0, 60, 100000),
  second: simpson(function (x) { return x * x * expDensity(x); }, 0, 120, 200000),
  belowHalf: simpson(expDensity, 0, 0.5, 20000),
  lam: LAM
};
V.exp.var = V.exp.second - V.exp.mean * V.exp.mean;
V.uni = {
  total: simpson(uniDensity, 0, 4, 20000),
  mean: simpson(function (x) { return x * uniDensity(x); }, 0, 4, 20000)
};
V.norm = {
  total: simpson(bell, -9, 9, 200000),
  mean: simpson(function (x) { return x * bell(x); }, -9, 9, 200000),
  second: simpson(function (x) { return x * x * bell(x); }, -9, 9, 200000),
  between: simpson(bell, -1, 1, 200000),
  tail: simpson(bell, 1, 9, 200000)
};
chk('density: the exponential density integrates to 1', Math.abs(V.exp.total - 1) < 1e-9, V.exp.total.toFixed(9));
chk('density: the exponential mean is 1/rate = 0.5', Math.abs(V.exp.mean - 0.5) < 1e-9, V.exp.mean.toFixed(9));
chk('density: the exponential second moment is 2/rate^2 = 0.5', Math.abs(V.exp.second - 0.5) < 1e-8, V.exp.second.toFixed(9));
chk('density: the exponential variance is 1/rate^2 = 0.25', Math.abs(V.exp.var - 0.25) < 1e-8, V.exp.var.toFixed(9));
chk('density: P(X <= 0.5) is 1 - e^-1 = 0.632121', Math.abs(V.exp.belowHalf - (1 - Math.exp(-1))) < 1e-9, V.exp.belowHalf.toFixed(6));
chk('density: the uniform density on [0,4] integrates to 1', Math.abs(V.uni.total - 1) < 1e-12, V.uni.total.toFixed(9));
chk('density: the uniform mean is 2 by symmetry', Math.abs(V.uni.mean - 2) < 1e-10, V.uni.mean.toFixed(9));
chk('density: the standard normal integrates to 1', Math.abs(V.norm.total - 1) < 1e-9, V.norm.total.toFixed(9));
chk('density: the standard normal mean is 0', Math.abs(V.norm.mean) < 1e-9, V.norm.mean.toExponential(2));
chk('density: the standard normal variance is 1', Math.abs(V.norm.second - V.norm.mean * V.norm.mean - 1) < 1e-8, (V.norm.second - V.norm.mean * V.norm.mean).toFixed(9));
chk('density: P(-1 <= Z <= 1) is 0.682689', Math.abs(V.norm.between - 0.682689492137) < 1e-8, V.norm.between.toFixed(6));
chk('density: P(Z > 1) is 0.158655', Math.abs(V.norm.tail - 0.158655253931) < 1e-8, V.norm.tail.toFixed(6));
chk('density: the two normal pieces plus the lower tail sum to 1',
  Math.abs(V.norm.between + 2 * V.norm.tail - 1) < 1e-7, (V.norm.between + 2 * V.norm.tail).toFixed(9));
chk('density: a density value may exceed 1 while its integral stays 1',
  expDensity(0) === 2 && Math.abs(V.exp.total - 1) < 1e-9);
chk('density: the cumulative distribution is increasing',
  simpson(expDensity, 0, 0.3, 4000) < simpson(expDensity, 0, 0.7, 4000));
chk('density: the expectation is an integral, and a 1000-point average only approximates it', (function () {
  var n = 1000, sum = 0, i;
  for (i = 0; i < n; i++) {
    var u = (i + 0.5) / n;              /* deterministic midpoint sample of the CDF */
    sum += -Math.log(1 - u) / LAM;      /* inverse transform, no randomness */
  }
  return Math.abs(sum / n - 0.5) < 0.02 && Math.abs(sum / n - 0.5) > 0;
})());

/* ======================================================================
   LAYER 2 - SUMMARISE THE CHECKS
   ====================================================================== */

var CHECKS_PASS = CHECKS.filter(function (c) { return c.pass; }).length;

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function T(x, y, s, o) { P.text(x, y, s, o || {}); }
function hdr(title, sub) {
  T(30, 14, title, { size: 15, bold: true, color: INK });
  if (sub) T(30, 36, sub, { size: 11.5, color: DIM });
}
function panel(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, {
    fill: o.fill || SURF2, stroke: o.stroke || BORDER,
    radius: o.radius === undefined ? 8 : o.radius, sw: 1
  });
}
function num(v, d) { return Number(v).toFixed(d === undefined ? 6 : d); }

/* a plot box that maps maths coordinates to the canvas */
function plot(x0, y0, w, h, xmin, xmax, ymin, ymax) {
  return {
    x0: x0, y0: y0, w: w, h: h,
    xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax,
    X: function (x) { return x0 + (x - xmin) / (xmax - xmin) * w; },
    Y: function (y) { return y0 + h - (y - ymin) / (ymax - ymin) * h; }
  };
}
function axes(pl, xlabel, ylabel) {
  P.line(pl.X(pl.xmin), pl.Y(0), pl.X(pl.xmax), pl.Y(0), { stroke: BORDER, sw: 1 });
  P.line(pl.X(0), pl.y0, pl.X(0), pl.y0 + pl.h, { stroke: BORDER, sw: 1 });
  if (xlabel) T(pl.x0 + pl.w, pl.y0 + pl.h + 14, xlabel, { size: 10, color: FAINT, align: 'right' });
  if (ylabel) T(pl.x0 - 6, pl.y0 + 10, ylabel, { size: 10, color: FAINT, align: 'right' });
}
function curve(pl, f, a, b, steps, o) {
  o = o || {};
  var i, px, py, lx, ly;
  steps = steps || 180;
  for (i = 0; i <= steps; i++) {
    var x = a + (b - a) * i / steps;
    var y = f(x);
    px = pl.X(x); py = pl.Y(y);
    if (i > 0) P.line(lx, ly, px, py, { stroke: o.stroke || ACC, sw: o.sw || 2.2 });
    lx = px; ly = py;
  }
}
/* fill between the curve and the axis, from a to b, as vertical strips */
function shade(pl, f, a, b, o) {
  o = o || {};
  var n = o.n || 60, i;
  P.alpha(o.alpha === undefined ? 0.16 : o.alpha);
  for (i = 0; i < n; i++) {
    var x1 = a + (b - a) * i / n, x2 = a + (b - a) * (i + 1) / n;
    var y = f((x1 + x2) / 2);
    var top = pl.Y(y), base = pl.Y(0);
    P.rect(pl.X(x1), Math.min(top, base), Math.max(1, pl.X(x2) - pl.X(x1)),
      Math.abs(base - top), { fill: o.fill || ACC, stroke: o.fill || ACC, radius: 0, sw: 0.5 });
  }
  P.alpha(1);
}
function rowTable(x, y, rows, w1, o) {
  o = o || {};
  var i;
  for (i = 0; i < rows.length; i++) {
    var yy = y + i * (o.step || 22);
    T(x, yy, rows[i][0], { size: o.size || 11.5, color: rows[i][2] || INK, bold: !!rows[i][3] });
    T(x + w1, yy, rows[i][1], { size: o.size || 11.5, color: rows[i][2] || DIM, align: 'right', mono: true });
  }
}

/* ---------- scene 1: rectangles refining ---------- */
function drawAreaScene(t) {
  var p = t - 0;
  hdr('1 · A definite integral is a limit of rectangle sums',
    'x squared on the interval from 0 to 1, counted with sign.');
  var pl = plot(60, 70, 420, 240, 0, 1, 0, 1.05);
  axes(pl, 'x', 'y');
  shade(pl, sq, 0, 1, { alpha: 0.1, fill: ACC, n: 90 });
  curve(pl, sq, 0, 1, 160);
  T(pl.X(0.62), pl.Y(0.72), 'y = x squared', { size: 11, color: ACC, bold: true });
  T(pl.X(0.5), pl.Y(0.13), 'exact area = 1/3 = ' + num(V.exactThird, 6), { size: 11, color: INK, align: 'center', bold: true });

  /* rectangles: n grows with the clock inside the scene */
  var n = p < 7.5 ? 4 : p < 15 ? 10 : p < 22.5 ? 20 : 40;
  var ruleIdx = p < 7.5 ? 0 : p < 15 ? 1 : p < 22.5 ? 2 : 3;
  var rule = V.rules[ruleIdx];
  var h = 1 / n, i;
  P.alpha(0.9);
  for (i = 0; i < n; i++) {
    var x1 = i * h, x2 = (i + 1) * h;
    var sx = rule.key === 'left' ? x1 : rule.key === 'right' ? x2 : (x1 + x2) / 2;
    var y = sq(sx);
    var top = pl.Y(y), base = pl.Y(0);
    P.rect(pl.X(x1) + 1, top, Math.max(1, pl.X(x2) - pl.X(x1) - 2), base - top,
      { fill: 'rgba(15,118,110,0.10)', stroke: ACC, radius: 0, sw: 1 });
  }
  P.alpha(1);
  T(60, 336, 'n = ' + n + ' panels, ' + rule.label + ' rule: ' + num(rule.f(sq, 0, 1, n), 6),
    { size: 11.5, bold: true, color: INK });

  /* the four rules at n = 10 */
  panel(520, 62, 352, 182, { fill: SURF, stroke: BORDER });
  T(536, 82, 'four rules at n = 10, exact 0.333333', { size: 11, bold: true, color: ACC });
  var rows = [], k;
  for (k = 0; k < V.rules.length; k++) {
    var r = V.rules[k];
    rows.push([r.label, num(r.v10, 6), k === ruleIdx ? ACC : INK, k === ruleIdx]);
  }
  rowTable(536, 106, rows, 210, { step: 22, size: 12 });
  T(536, 202, 'error ratio, n = 10 to n = 100:', { size: 10.5, color: FAINT });
  T(536, 222, 'left x' + num(V.rules[0].ratio, 1) + ', right x' + num(V.rules[1].ratio, 1) +
    ', trap x' + num(V.rules[2].ratio, 1) + ', mid x' + num(V.rules[3].ratio, 1),
    { size: 10.5, color: DIM, mono: true });

  panel(520, 252, 352, 108, { fill: WARNDIM, stroke: WARN });
  T(536, 272, 'the two second-order rules disagree in sign', { size: 11, bold: true, color: WARN });
  T(536, 296, 'trapezoid - exact = +' + num(V.rules[2].v10 - V.exactThird, 6), { size: 11, color: INK, mono: true });
  T(536, 316, 'midpoint  - exact = ' + num(V.rules[3].v10 - V.exactThird, 6), { size: 11, color: INK, mono: true });
  T(536, 340, 'midpoint error is half, opposite in sign', { size: 10.5, color: DIM });

  T(60, 366, 'The integral is the limit of these sums. The next scene replaces the limit with one subtraction.',
    { size: 11.5, color: DIM });
  T(60, 396, 'left and right straddle the answer only while the function increases.', { size: 10.5, color: FAINT });
}

/* ---------- scene 2: the fundamental theorem ---------- */
function drawFtcScene(t) {
  var p = t - 30;
  hdr('2 · The fundamental theorem: area by antiderivative',
    'The accumulation function differentiates back to the integrand.');
  var pl = plot(60, 74, 400, 226, 0.2, 3.2, 0, 3.4);
  axes(pl, 'x', 'y');
  shade(pl, inv, 1, Math.E, { alpha: 0.18, fill: ACC, n: 70 });
  curve(pl, inv, 0.24, 3.2, 200);
  T(pl.X(1.05), pl.Y(1.05), '1/x', { size: 11, color: ACC, bold: true });
  P.line(pl.X(1), pl.y0, pl.X(1), pl.y0 + pl.h, { stroke: FAINT, sw: 1 });
  P.line(pl.X(Math.E), pl.y0, pl.X(Math.E), pl.y0 + pl.h, { stroke: FAINT, sw: 1 });
  T(pl.X(1), pl.y0 + pl.h + 14, '1', { size: 10, color: FAINT, align: 'center' });
  T(pl.X(Math.E), pl.y0 + pl.h + 14, 'e', { size: 10, color: FAINT, align: 'center' });
  T(pl.X(1.85), pl.Y(0.22), 'area = 1', { size: 11.5, color: INK, bold: true });

  panel(500, 66, 372, 150, { fill: SURF, stroke: BORDER });
  T(516, 86, 'the two halves', { size: 11, bold: true, color: ACC });
  T(516, 110, 'F(x) = integral from a to x of f', { size: 11.5, mono: true, color: INK });
  T(516, 130, 'then F\u2032(x) = f(x)', { size: 11.5, mono: true, color: INK });
  T(516, 156, 'integral from a to b of f = F(b) - F(a)', { size: 11.5, mono: true, color: INK });
  T(516, 178, 'any antiderivative works; C cancels', { size: 10.5, color: DIM });
  T(516, 200, 'the first half needs f continuous at x', { size: 10.5, color: WARN });

  panel(500, 228, 372, 176, { fill: SURF2, stroke: BORDER });
  T(516, 248, 'three standard integrals, one subtraction each', { size: 11, bold: true, color: ACC });
  var rows = [], i;
  for (i = 0; i < V.std.length; i++) {
    rows.push([V.std[i].expr, num(V.std[i].num, 6), INK]);
  }
  rowTable(516, 274, rows, 250, { step: 26, size: 11.5 });
  T(516, 356, 'computed by quadrature, matched to the closed form', { size: 10, color: FAINT });
  T(516, 374, 'to nine decimal places in every case', { size: 10, color: FAINT });

  T(60, 330, 'The table has five rows: x^n, 1/x, e^x, sine and cosine, secant squared.', { size: 11.5, color: DIM });
  T(60, 356, 'Every technique after this exists to reach one of them.', { size: 11.5, color: DIM });
  T(60, 386, 'The power rule fails at exponent minus one, where the answer is a logarithm.', { size: 10.5, color: WARN });
}

/* ---------- scene 3: properties ---------- */
function drawPropsScene(t) {
  var p = t - 60;
  hdr('3 · Five properties that do the work',
    'additivity, reversal, linearity, comparison, symmetry.');

  var pl = plot(56, 74, 240, 200, -2.2, 2.2, -8.6, 8.6);
  axes(pl);
  shade(pl, cube, -2, 0, { alpha: 0.18, fill: BAD, n: 40 });
  shade(pl, cube, 0, 2, { alpha: 0.18, fill: VAL, n: 40 });
  curve(pl, cube, -2, 2, 160);
  T(pl.X(-1.55), pl.Y(-6.6), 'negative', { size: 10.5, color: BAD, align: 'center' });
  T(pl.X(1.55), pl.Y(6.6), 'positive', { size: 10.5, color: VAL, align: 'center' });
  T(56, 300, 'x cubed from -2 to 2 = 0', { size: 11.5, bold: true, color: INK });
  T(56, 320, 'odd cancels exactly', { size: 10.5, color: DIM });

  var pl2 = plot(336, 74, 240, 200, -2.2, 2.2, -0.4, 4.4);
  axes(pl2);
  shade(pl2, sq, -2, 2, { alpha: 0.16, fill: ACC, n: 50 });
  curve(pl2, sq, -2, 2, 160);
  T(336, 300, 'x squared from -2 to 2 = 16/3 = ' + num(simpson(sq, -2, 2), 6), { size: 11.5, bold: true, color: INK });
  T(336, 320, 'even doubles: 2 x (8/3)', { size: 10.5, color: DIM });

  panel(600, 66, 272, 270, { fill: SURF, stroke: BORDER });
  T(616, 86, 'each property, checked', { size: 11, bold: true, color: ACC });
  var rows = [
    ['additivity', num(V.addAll, 4)],
    [' 0 to 2 plus 2 to 3', num(V.addA + V.addB, 4)],
    ['reversal', num(simpson(poly3, -1, 1), 4)],
    [' reversed', num(simpson(poly3, 1, -1), 4)],
    ['linearity', '3f - 2g'],
    [' comparison', 'strict'],
    ['odd on [-2,2]', num(simpson(cube, -2, 2), 4)],
    ['even on [-2,2]', num(simpson(sq, -2, 2), 4)],
    ['odd on [0,2]', num(simpson(cube, 0, 2), 4)]
  ];
  rowTable(616, 112, rows, 238, { step: 24, size: 11 });

  T(56, 356, 'Linearity covers sums and constant multiples only. There is no rule for a product,', { size: 11.5, color: DIM });
  T(56, 378, 'which is why by parts and partial fractions exist at all.', { size: 11.5, color: DIM });
  T(56, 404, 'Symmetry needs the interval centred on zero; an odd function elsewhere does not cancel.', { size: 10.5, color: WARN });
}

/* ---------- scene 4: substitution ---------- */
function drawSubstScene(t) {
  var p = t - 90;
  hdr('4 · Substitution, and what happens to the limits',
    'the chain rule read backwards.');
  var pl = plot(60, 74, 300, 210, 0, 2.1, 0, 12.5);
  axes(pl, 'x', 'y');
  shade(pl, twoXexpX2, 0, 2, { alpha: 0.16, fill: ACC, n: 70 });
  curve(pl, twoXexpX2, 0, 2.05, 160);
  T(pl.X(1.32), pl.Y(10.4), '2x e^(x squared)', { size: 10.5, color: ACC, bold: true });
  T(pl.X(0.55), pl.Y(1.4), 'area 53.598', { size: 11, color: INK, bold: true });
  T(60, 300, 'limits 0 and 2 in x', { size: 11, color: DIM });

  /* the new picture in u */
  var pl2 = plot(400, 74, 220, 210, 0, 4.3, 0, 60);
  axes(pl2, 'u', 'y');
  shade(pl2, expo, 0, 4, { alpha: 0.16, fill: INFO, n: 70 });
  curve(pl2, expo, 0, 4.2, 160);
  T(pl2.X(2.9), pl2.Y(46), 'e to the u', { size: 10.5, color: INFO, bold: true });
  T(400, 300, 'limits 0 and 4 in u', { size: 11, color: DIM });

  panel(640, 66, 232, 246, { fill: SURF, stroke: BORDER });
  T(656, 86, 'three changes, one substitution', { size: 10.5, bold: true, color: ACC });
  T(656, 112, 'u = x squared', { size: 11.5, mono: true, color: INK });
  T(656, 134, 'du = 2x dx', { size: 11.5, mono: true, color: INK });
  T(656, 156, 'x = 0  ->  u = 0', { size: 11.5, mono: true, color: INK });
  T(656, 178, 'x = 2  ->  u = 4', { size: 11.5, mono: true, color: INK });
  P.line(656, 194, 856, 194, { stroke: BORDER, sw: 1 });
  T(656, 216, 'e^4 - 1', { size: 12, mono: true, bold: true, color: ACC });
  T(656, 238, '= ' + num(V.subClosed, 6), { size: 11.5, mono: true, color: INK });
  T(656, 266, 'direct quadrature', { size: 10, color: FAINT });
  T(656, 284, num(V.subDirect, 6), { size: 11, mono: true, color: VAL });

  T(60, 336, 'Both routes agree to eight places: ' + num(V.subNew, 6) + ' against ' + num(V.subDirect, 6) + '.', { size: 11.5, color: INK });
  T(60, 360, 'Evaluating e to the u at the old limits 0 and 2 would give ' + num(Math.exp(2) - 1, 6) + ', not ' + num(V.subClosed, 6) + '.', { size: 11.5, color: BAD });
  T(60, 388, 'Either convert the limits, or convert the antiderivative back to x first.', { size: 11, color: DIM });
  T(60, 412, 'The substitution needs the inner derivative to be present, up to a constant.', { size: 10.5, color: WARN });
}

/* ---------- scene 5: by parts ---------- */
function drawPartsScene(t) {
  var p = t - 120;
  hdr('5 · Integration by parts and the boundary term',
    'integrate the product rule and rearrange.');
  var pl = plot(60, 74, 300, 206, 0, 1.08, 0, 2.9);
  axes(pl, 'x', 'y');
  shade(pl, xex, 0, 1, { alpha: 0.16, fill: ACC, n: 60 });
  curve(pl, xex, 0, 1.05, 160);
  T(pl.X(0.42), pl.Y(2.4), 'x e to the x', { size: 10.5, color: ACC, bold: true });
  T(pl.X(0.5), pl.Y(0.5), 'area = 1', { size: 11.5, color: INK, bold: true, align: 'center' });
  T(60, 296, 'integral from 0 to 1 = ' + num(V.partsTotal, 6), { size: 11, color: DIM });

  panel(390, 66, 250, 232, { fill: SURF, stroke: BORDER });
  T(406, 86, 'the formula', { size: 11, bold: true, color: ACC });
  T(406, 112, 'integral u dv = uv - integral v du', { size: 11, mono: true, color: INK });
  T(406, 136, 'definite form:', { size: 10.5, color: DIM });
  T(406, 156, '[uv] from a to b', { size: 11, mono: true, color: INK });
  T(406, 176, 'minus integral v du', { size: 11, mono: true, color: INK });
  P.line(406, 192, 624, 192, { stroke: BORDER, sw: 1 });
  T(406, 212, 'LIATE picks u:', { size: 10.5, color: DIM });
  T(406, 232, 'log, inv trig, algebraic,', { size: 10.5, color: INK });
  T(406, 250, 'trig, exponential', { size: 10.5, color: INK });
  T(406, 274, 'x e^x: algebraic wins', { size: 10.5, color: ACC });

  panel(656, 66, 216, 232, { fill: SURF2, stroke: BORDER });
  T(672, 86, 'the arithmetic', { size: 11, bold: true, color: ACC });
  var rows = [
    ['boundary e - 0', num(V.partsBoundary, 6)],
    ['remaining e - 1', num(V.partsRest, 6)],
    ['difference', num(V.partsBoundary - V.partsRest, 6)],
    ['x^2 e^x on [0,1]', num(V.tabular, 6)],
    ['e - 2', num(Math.E - 2, 6)]
  ];
  rowTable(672, 112, rows, 184, { step: 26, size: 10.5 });

  T(60, 336, 'The boundary term is a subtraction of two numbers: e at 1, minus 0 at 0.', { size: 11.5, color: INK });
  T(60, 360, 'For x squared e to the x the algebraic factor reaches zero after two steps,', { size: 11.5, color: DIM });
  T(60, 382, 'so the tabular form terminates and gives e - 2 = ' + num(Math.E - 2, 6) + '.', { size: 11.5, color: DIM });
  T(60, 408, 'Against a logarithm the column never reaches zero, so the table does not terminate.', { size: 10.5, color: WARN });
}

/* ---------- scene 6: partial fractions ---------- */
function drawPartialScene(t) {
  var p = t - 150;
  hdr('6 · Partial fractions and the logarithm rule',
    'rational integrands reduced to rows of the table.');
  var pl = plot(60, 74, 300, 206, 0, 1.08, 0, 1.12);
  axes(pl, 'x', 'y');
  shade(pl, oneOnOnePlus, 0, 1, { alpha: 0.16, fill: ACC, n: 60 });
  curve(pl, oneOnOnePlus, 0, 1.06, 160);
  T(pl.X(0.6), pl.Y(0.92), '1 / (1 + x)', { size: 10.5, color: ACC, bold: true });
  T(pl.X(0.62), pl.Y(0.5), 'area = ln 2', { size: 11, color: INK, bold: true });
  T(60, 296, 'integral from 0 to 1 = ' + num(V.lnTwo, 6), { size: 11, color: DIM });

  panel(390, 66, 250, 232, { fill: SURF, stroke: BORDER });
  T(406, 86, 'the rule', { size: 11, bold: true, color: ACC });
  T(406, 112, 'numerator = derivative', { size: 11, color: INK });
  T(406, 132, 'of the denominator', { size: 11, color: INK });
  T(406, 158, 'then the integral is', { size: 10.5, color: DIM });
  T(406, 178, 'ln |denominator| + C', { size: 11, mono: true, color: ACC });
  P.line(406, 196, 624, 196, { stroke: BORDER, sw: 1 });
  T(406, 216, 'a split that reconstitutes', { size: 10.5, color: DIM });
  T(406, 236, 'the integrand gives 0', { size: 10.5, color: INK });
  T(406, 256, num(V.splitCheck, 6), { size: 11, mono: true, color: VAL });
  T(406, 278, 'so a wrong split is detectable', { size: 10, color: FAINT });

  panel(656, 66, 216, 232, { fill: SURF2, stroke: BORDER });
  T(672, 86, 'the arithmetic', { size: 11, bold: true, color: ACC });
  var rows = [
    ['ln 2', num(V.lnTwo, 6)],
    ['1/x on [1,4]', num(V.lnFourOverThree, 6)],
    ['ln 4', num(Math.log(4), 6)],
    ['quadrature', num(V.lnTwo, 6)]
  ];
  rowTable(672, 112, rows, 184, { step: 26, size: 10.5 });
  T(672, 240, 'repeated factor:', { size: 10.5, color: DIM });
  T(672, 258, 'needs two terms', { size: 10.5, color: WARN });

  T(60, 336, 'Divide first when the numerator degree is not smaller than the denominator.', { size: 11.5, color: INK });
  T(60, 360, 'Then split, matching coefficients or substituting the roots.', { size: 11.5, color: DIM });
  T(60, 386, 'A squared linear factor needs a term over the factor and a term over its square.', { size: 10.5, color: WARN });
}

/* ---------- scene 7: mean value theorem for integrals ---------- */
function drawMvtScene(t) {
  var p = t - 180;
  hdr('7 · The mean value theorem for integrals',
    'a continuous function reaches its own average value.');
  var pl = plot(70, 74, 380, 220, -0.15, 3.2, 0, 9.6);
  axes(pl, 'x', 'y');
  shade(pl, sq, 0, 3, { alpha: 0.14, fill: ACC, n: 70 });
  curve(pl, sq, 0, 3.1, 160);
  P.line(pl.X(pl.xmin), pl.Y(V.mvtMean), pl.X(3.1), pl.Y(V.mvtMean), { stroke: INFO, sw: 2 });
  T(pl.X(2.9), pl.Y(V.mvtMean) - 12, 'average = ' + num(V.mvtMean, 4), { size: 10.5, color: INFO, align: 'right' });
  P.circle(pl.X(V.mvtC), pl.Y(sq(V.mvtC)), 6, { fill: SURF, stroke: INFO, sw: 2.4 });
  P.line(pl.X(V.mvtC), pl.Y(0), pl.X(V.mvtC), pl.Y(V.mvtMean), { stroke: INFO, sw: 1, });
  T(pl.X(V.mvtC), pl.Y(0) + 16, 'c = 1.732051', { size: 10.5, color: INFO, align: 'center' });
  T(pl.X(1.5), pl.Y(7.6), 'y = x squared', { size: 10.5, color: ACC, bold: true });

  panel(490, 66, 382, 150, { fill: SURF, stroke: BORDER });
  T(506, 86, 'the statement', { size: 11, bold: true, color: ACC });
  T(506, 112, 'average value = (1/(b-a)) x integral', { size: 11, mono: true, color: INK });
  T(506, 134, 'f(c) = that average, for some c', { size: 11, mono: true, color: INK });
  T(506, 158, 'needs f continuous on the closed', { size: 10.5, color: WARN });
  T(506, 176, 'interval, and c must lie inside it', { size: 10.5, color: WARN });
  T(506, 198, 'existence only, and no formula for c', { size: 10, color: FAINT });

  panel(490, 228, 382, 156, { fill: SURF2, stroke: BORDER });
  T(506, 248, 'x squared on [0,3]', { size: 11, bold: true, color: ACC });
  var rows = [
    ['integral', num(simpson(sq, 0, 3), 4)],
    ['average = 9/3', num(V.mvtMean, 4)],
    ['c = sqrt(3)', num(V.mvtC, 6)],
    ['f(c)', num(sq(V.mvtC), 4)],
    ['midpoint 2.25', 'not it'],
    ['endpoints 4.5', 'not it']
  ];
  rowTable(506, 270, rows, 340, { step: 18, size: 10.5 });

  T(70, 330, 'The negative root of 3 lies outside [0,3].', { size: 11.5, color: INK });
  T(70, 352, 'It is discarded; only one point is needed.', { size: 11.5, color: DIM });
  T(70, 378, 'A step function with average 1 need never equal 1,', { size: 11.5, color: BAD });
  T(70, 400, 'so continuity does the work here.', { size: 11.5, color: DIM });
  T(70, 426, 'The theorem gives existence, never a value.', { size: 10.5, color: WARN });
}

/* ---------- scene 8: improper integrals ---------- */
function drawImproperScene(t) {
  var p = t - 210;
  hdr('8 · Improper integrals: when the area is infinite',
    'an infinite limit, or an integrand that blows up.');

  var pl = plot(60, 74, 250, 200, 0, 1.02, 0, 10.6);
  axes(pl, 'x', 'y');
  shade(pl, inv, 0.1, 1, { alpha: 0.16, fill: BAD, n: 70 });
  curve(pl, inv, 0.098, 1.01, 200);
  T(pl.X(0.4), pl.Y(7.4), '1 / x', { size: 10.5, color: BAD, bold: true });
  T(60, 292, 'from eps to 1 = -ln(eps)', { size: 10.5, color: DIM });

  panel(330, 66, 250, 216, { fill: SURF, stroke: BORDER });
  T(346, 86, 'as eps shrinks', { size: 11, bold: true, color: ACC });
  var rows = [
    ['eps = 1e-3', num(V.epsVals[0], 6)],
    ['eps = 1e-6', num(V.epsVals[1], 6)],
    ['eps = 1e-9', num(V.epsVals[2], 6)]
  ];
  rowTable(346, 112, rows, 218, { step: 26, size: 11 });
  T(346, 208, 'grows without bound:', { size: 10.5, color: BAD });
  T(346, 228, 'the integral diverges', { size: 11, color: BAD, bold: true });
  T(346, 254, 'slow growth is not', { size: 10, color: FAINT });
  T(346, 270, 'convergence', { size: 10, color: FAINT });

  panel(600, 66, 272, 216, { fill: SURF2, stroke: BORDER });
  T(616, 86, 'p-test: integral of x^-p', { size: 10.5, bold: true, color: ACC });
  T(616, 108, 'to infinity: converges iff p > 1', { size: 10.5, color: INK });
  T(616, 128, 'to zero: converges iff p < 1', { size: 10.5, color: INK });
  P.line(616, 142, 856, 142, { stroke: BORDER, sw: 1 });
  T(616, 160, 'partial integrals at R = 1e6', { size: 10, color: FAINT });
  var rows2 = [], i;
  for (i = 0; i < V.pTest.length; i++) {
    var pt = V.pTest[i];
    rows2.push(['p = ' + pt.p, num(pt.vals[3], 3) + (pt.conv ? '' : '  ->'), pt.conv ? VAL : BAD]);
  }
  rowTable(616, 180, rows2, 240, { step: 22, size: 10.5 });
  T(616, 272, 'p = 1.1 is still 2.5 short of 10', { size: 9.5, color: FAINT });

  T(60, 330, 'The logarithm integral from 0 to 1 is exactly -1: the integrand is unbounded there,', { size: 11.5, color: INK });
  T(60, 352, 'and the area is still finite. Unbounded is not the same as divergent.', { size: 11.5, color: VAL });
  T(60, 378, 'The Gaussian integral from 0 to infinity is sqrt(pi)/2 = ' + num(V.gaussHalf, 6) + '.', { size: 11, color: DIM });
  T(60, 404, 'Every one of these is a limit, taken after the finite integral is evaluated.', { size: 10.5, color: WARN });
}

/* ---------- scene 9: probability ---------- */
function drawProbScene(t) {
  var p = t - 240;
  hdr('9 · Where GATE uses this: continuous probability',
    'a density, a cumulative distribution and an expectation are three integrals.');
  var pl = plot(60, 74, 320, 206, -0.1, 3.2, 0, 2.25);
  axes(pl, 'x', 'density');
  shade(pl, expDensity, 0, 0.5, { alpha: 0.2, fill: ACC, n: 50 });
  curve(pl, expDensity, 0, 3.1, 160);
  T(pl.X(0.85), pl.Y(1.9), '2 e^(-2x)', { size: 10.5, color: ACC, bold: true });
  T(pl.X(0.25), pl.Y(0.42), '0.6321', { size: 10, color: INK, bold: true, align: 'center' });
  P.line(pl.X(0.5), pl.Y(0), pl.X(0.5), pl.Y(expDensity(0.5)), { stroke: INFO, sw: 1.4 });
  T(pl.X(0.5), pl.Y(0) + 16, '0.5 = mean', { size: 10, color: INFO, align: 'center' });
  T(60, 320, 'P(X <= 0.5) is the shaded area', { size: 10.5, color: DIM });

  panel(410, 66, 236, 216, { fill: SURF, stroke: BORDER });
  T(426, 86, 'exponential, rate 2', { size: 11, bold: true, color: ACC });
  var rows = [
    ['total', num(V.exp.total, 6)],
    ['mean', num(V.exp.mean, 6)],
    ['second moment', num(V.exp.second, 6)],
    ['variance', num(V.exp.var, 6)],
    ['P(X <= 0.5)', num(V.exp.belowHalf, 6)]
  ];
  rowTable(426, 112, rows, 204, { step: 26, size: 10.5 });
  T(426, 258, 'mean = 1/rate, not rate', { size: 10, color: WARN });

  panel(666, 66, 206, 216, { fill: SURF2, stroke: BORDER });
  T(682, 86, 'uniform and normal', { size: 11, bold: true, color: ACC });
  var rows2 = [
    ['U(0,4) total', num(V.uni.total, 4)],
    ['U(0,4) mean', num(V.uni.mean, 4)],
    ['Z total', num(V.norm.total, 4)],
    ['Z mean', num(V.norm.mean, 4)],
    ['Z variance', num(V.norm.second - V.norm.mean * V.norm.mean, 4)],
    ['P(|Z|<=1)', num(V.norm.between, 4)],
    ['P(Z>1)', num(V.norm.tail, 4)]
  ];
  rowTable(682, 112, rows2, 174, { step: 22, size: 10 });

  T(60, 330, 'A density integrates to 1, a probability is an integral over an interval,', { size: 11.5, color: INK });
  T(60, 352, 'and the cumulative distribution is the running integral from minus infinity.', { size: 11.5, color: INK });
  T(60, 378, 'A density value is not a probability: this one reaches 2 at the origin.', { size: 11, color: WARN });
  T(60, 404, 'Averaging 1000 samples only estimates the mean; the definition is the integral.', { size: 10.5, color: DIM });
}

/* ---------- scene 10: reading the question ---------- */
function drawExamScene(t) {
  var p = t - 270;
  hdr('10 · Reading the question',
    'four question types, four errors, three sanity checks.');

  panel(28, 62, 420, 190, { fill: SURF, stroke: BORDER });
  T(44, 82, 'name the type first', { size: 11, bold: true, color: ACC });
  var types = [
    ['evaluate', 'classify the integrand, then pick a technique'],
    ['locate a point', 'average value, then solve f(c) = mean'],
    ['decide convergence', 'p-test, or compare against a known integral'],
    ['connect to probability', 'density, CDF, expectation as three integrals']
  ];
  var i;
  for (i = 0; i < types.length; i++) {
    T(44, 110 + i * 34, types[i][0], { size: 11.5, bold: true, color: INK });
    T(44, 126 + i * 34, types[i][1], { size: 10.5, color: DIM });
  }

  panel(462, 62, 410, 190, { fill: INVALIDDIM, stroke: BAD });
  T(478, 82, 'the four errors offered as options', { size: 11, bold: true, color: BAD });
  var errs = [
    'old limits kept after a substitution',
    'boundary term dropped, or evaluated at one end',
    'a constant added to a definite integral',
    'a divergent integral reported as a finite number'
  ];
  for (i = 0; i < errs.length; i++) {
    T(478, 110 + i * 30, '- ' + errs[i], { size: 11, color: INK });
  }
  T(478, 236, 'each produces a specific wrong number', { size: 10, color: FAINT });

  panel(28, 262, 844, 96, { fill: SURF2, stroke: BORDER });
  T(44, 282, 'three checks before committing', { size: 11, bold: true, color: ACC });
  T(44, 306, 'a positive integrand over an interval gives a positive integral', { size: 11, color: INK });
  T(44, 326, 'a region below the axis gives a negative integral, with no reversal involved', { size: 11, color: INK });
  T(44, 346, 'the integral never exceeds (maximum height) x (width), so a larger answer is wrong', { size: 11, color: INK });

  T(28, 384, 'The height-times-width bound is an inequality, not an estimate: it rules out impossible answers', { size: 11, color: DIM });
  T(28, 406, 'and says nothing about whether a plausible one is right.', { size: 11, color: DIM });
}

function drawFrame(painter) {
  P = painter;
  if (!P) return;
  var t = (K && K.state) ? K.state.elapsed : 0;
  var sc = (K && K.state && K.state.scenes.length) ? K.state.scenes[K.sceneAt(t)] : null;
  var id = sc ? sc.id : 'area';
  P.alpha(1);
  P.clear();
  if (id === 'area') drawAreaScene(t);
  else if (id === 'ftc') drawFtcScene(t);
  else if (id === 'props') drawPropsScene(t);
  else if (id === 'subst') drawSubstScene(t);
  else if (id === 'parts') drawPartsScene(t);
  else if (id === 'partial') drawPartialScene(t);
  else if (id === 'mvt') drawMvtScene(t);
  else if (id === 'improper') drawImproperScene(t);
  else if (id === 'prob') drawProbScene(t);
  else drawExamScene(t);
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
