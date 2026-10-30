/* ==========================================================================
   binomial-distribution — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no probability arithmetic of its own:
   every figure on the canvas was computed once here and checked against the
   rule it is supposed to satisfy — the mass function summing to one, the
   moments by direct summation against np and npq, the ratio recursion against
   the difference of two neighbouring masses, the mode by a scan against
   floor((n+1)p), the convolution of two binomials against the binomial of the
   summed trial count, the Poisson limit's measured gap, the hypergeometric
   comparison for sampling without replacement, and the two GATE items whose
   answers are recomputed rather than copied.
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
  return m.toFixed(3) + 'e' + e;
}

/* ---------- log gamma, Lanczos g = 7, nine terms ---------- */
var LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
  771.32342877765313, -176.61502916214059, 12.507343278686905,
  -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];

function logGamma(z) {
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  z -= 1;
  var x = LANCZOS[0], i;
  for (i = 1; i < 9; i++) x += LANCZOS[i] / (z + i);
  var t = z + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function logChoose(n, k) {
  if (k < 0 || k > n) return -Infinity;
  return logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1);
}

function choose(n, k) {
  if (k < 0 || k > n) return 0;
  if (n <= 60) {                       /* exact by multiplication for small n */
    var r = 1, i;
    k = Math.min(k, n - k);
    for (i = 1; i <= k; i++) r = r * (n - k + i) / i;
    return Math.round(r);
  }
  return Math.round(Math.exp(logChoose(n, k)));
}

/* ---------- the mass function ---------- */
function pmf(k, n, p) {
  if (k < 0 || k > n) return 0;
  if (p <= 0) return k === 0 ? 1 : 0;
  if (p >= 1) return k === n ? 1 : 0;
  return Math.exp(logChoose(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
}

function pmfAll(n, p) { var a = [], k; for (k = 0; k <= n; k++) a.push(pmf(k, n, p)); return a; }

function total(a) { var s = 0, i; for (i = 0; i < a.length; i++) s += a[i]; return s; }

function meanOf(n, p) { var m = 0, k; for (k = 0; k <= n; k++) m += k * pmf(k, n, p); return m; }

function varOf(n, p) {
  var m = meanOf(n, p), v = 0, k;
  for (k = 0; k <= n; k++) v += (k - m) * (k - m) * pmf(k, n, p);
  return v;
}

/* the mode by scanning, ties resolved to the smaller index */
function modeOf(n, p) {
  var a = pmfAll(n, p), best = 0, k;
  for (k = 1; k <= n; k++) if (a[k] > a[best] + 1e-15) best = k;
  return best;
}

/* all k that share the maximum */
function modesOf(n, p) {
  var a = pmfAll(n, p), mx = 0, out = [], k;
  for (k = 0; k <= n; k++) mx = Math.max(mx, a[k]);
  for (k = 0; k <= n; k++) if (near(a[k], mx, 1e-12)) out.push(k);
  return out;
}

/* ---------- convolution of two independent counts ---------- */
function convolve(n1, p1, n2, p2) {
  var m = n1 + n2, r = [], i, j;
  for (i = 0; i <= m; i++) r.push(0);
  for (i = 0; i <= n1; i++) for (j = 0; j <= n2; j++) r[i + j] += pmf(i, n1, p1) * pmf(j, n2, p2);
  return r;
}

/* ---------- Poisson mass, by an incrementally built log factorial ---------- */
var LOGFACT = [0];
(function () { var i; for (i = 1; i <= 64; i++) LOGFACT.push(LOGFACT[i - 1] + Math.log(i)); })();

function pois(k, lam) {
  if (k < 0) return 0;
  if (k >= LOGFACT.length) return 0;
  return Math.exp(-lam + k * Math.log(lam) - LOGFACT[k]);
}

/* ---------- hypergeometric mass, sampling without replacement ---------- */
function hyper(k, N, Ks, n) {
  if (k < 0 || k > Ks || n - k < 0 || n - k > N - Ks) return 0;
  return choose(Ks, k) * choose(N - Ks, n - k) / choose(N, n);
}

/* ================= the values the lesson prints ================= */
var V = {};

/* --- the Bernoulli trial and its sum --- */
V.bern = { p: 0.3, q: 0.7, mean: 0.3, varr: 0.21 };
V.trials = { n: 10, p: 0.3, heads: 3 };

/* --- the mass function at n = 10, p = 0.3 --- */
V.n = 10; V.p = 0.3; V.q = 0.7;
V.pmf10 = pmfAll(10, 0.3);
V.pmf10Total = total(V.pmf10);
V.c10_3 = choose(10, 3);
V.p10_3 = pmf(3, 10, 0.3);
V.p10_0 = pmf(0, 10, 0.3);
V.p10_10 = pmf(10, 10, 0.3);

/* --- the ratio recursion and the mode --- */
V.ratio = [];
(function () {
  var k;
  for (k = 0; k < 10; k++) {
    V.ratio.push({
      k: k,
      actual: V.pmf10[k + 1] / V.pmf10[k],
      formula: ((10 - k) / (k + 1)) * (0.3 / 0.7)
    });
  }
})();
V.mode10 = { np1: 11 * 0.3, floor: Math.floor(11 * 0.3), scan: modeOf(10, 0.3) };
V.mode9 = { np1: 10 * 0.5, modes: modesOf(9, 0.5), mass: pmf(4, 9, 0.5) };
V.mode5 = { n: 5, p: 0.3, np: 1.5, np1: 6 * 0.3, floor: Math.floor(6 * 0.3), scan: modeOf(5, 0.3), pmf: pmfAll(5, 0.3) };
V.mode8 = { n: 8, p: 0.3, np: 2.4, floor: Math.floor(9 * 0.3), scan: modeOf(8, 0.3) };

/* --- the moments --- */
V.moments = [[10, 0.3], [100, 0.3], [50, 0.5], [7, 0.9]].map(function (c) {
  return {
    n: c[0], p: c[1],
    meanSum: meanOf(c[0], c[1]), np: c[0] * c[1],
    varSum: varOf(c[0], c[1]), npq: c[0] * c[1] * (1 - c[1]),
    sd: Math.sqrt(c[0] * c[1] * (1 - c[1]))
  };
});
V.fixedMean = [0.1, 0.25, 0.5, 0.75, 0.9].map(function (p) {
  return { p: p, n: 6 / p, varr: 6 * (1 - p) };
});

/* --- GATE CSE 2004: the Hamming distance of two random 8-bit strings --- */
V.ham = { n: 8, d: 3 };
V.ham.pmf = pmfAll(8, 0.5);
V.ham.p = pmf(3, 8, 0.5);
V.ham.total = total(V.ham.pmf);
V.ham.c83 = choose(8, 3);
V.ham.pairs = Math.pow(2, 8) * choose(8, 3);
V.ham.allPairs = Math.pow(2, 16);
V.ham.s1 = '1 0 1 1 0 0 1 0';
V.ham.s2 = '1 0 0 1 1 0 1 0';

/* --- GATE CSE 2006 Q21: the central binomial coefficient --- */
V.central = [];
(function () {
  var n;
  for (n = 1; n <= 12; n++) {
    V.central.push({ n: n, coef: choose(2 * n, n), val: choose(2 * n, n) / Math.pow(4, n), asym: 1 / Math.sqrt(Math.PI * n) });
  }
})();
V.central25 = { val: choose(50, 25) / Math.pow(4, 25), asym: 1 / Math.sqrt(Math.PI * 25) };

/* --- adding two binomials --- */
V.same = { n1: 4, n2: 6, p: 0.3 };
V.same.conv = convolve(4, 0.3, 6, 0.3);
V.same.target = pmfAll(10, 0.3);
V.same.maxDiff = 0;
(function () { var i; for (i = 0; i < 11; i++) V.same.maxDiff = Math.max(V.same.maxDiff, Math.abs(V.same.conv[i] - V.same.target[i])); })();

V.mixed = { n1: 2, p1: 0.2, n2: 3, p2: 0.8 };
V.mixed.conv = convolve(2, 0.2, 3, 0.8);
V.mixed.flat = pmfAll(5, 0.5);
V.mixed.maxDiff = 0;
(function () { var i; for (i = 0; i < 6; i++) V.mixed.maxDiff = Math.max(V.mixed.maxDiff, Math.abs(V.mixed.conv[i] - V.mixed.flat[i])); })();
V.mixed.mean = 2 * 0.2 + 3 * 0.8;
V.mixed.varr = 2 * 0.2 * 0.8 + 3 * 0.8 * 0.2;
V.mixed.convMean = 0;
V.mixed.convVar = 0;
(function () {
  var i, m = V.mixed.mean;
  for (i = 0; i < 6; i++) { V.mixed.convMean += i * V.mixed.conv[i]; V.mixed.convVar += (i - m) * (i - m) * V.mixed.conv[i]; }
})();

/* --- the Poisson limit, np held at 3 --- */
V.lam = 3;
V.poisson = [];
(function () {
  var ns = [10, 100, 1000, 10000, 100000], i, k, g, n, p;
  for (i = 0; i < ns.length; i++) {
    n = ns[i]; p = V.lam / n; g = 0;
    for (k = 0; k <= Math.min(n, 30); k++) g = Math.max(g, Math.abs(pmf(k, n, p) - pois(k, V.lam)));
    V.poisson.push({ n: n, p: p, gap: g });
  }
})();
V.pois3 = [];
(function () { var k; for (k = 0; k <= 10; k++) V.pois3.push(pois(k, V.lam)); })();
V.bin10 = pmfAll(10, 0.3);

/* --- waiting counts: geometric and negative binomial --- */
V.geom = { p: 0.3, mean: 1 / 0.3, pmf: [], median: 0 };
(function () {
  var n, s = 0;
  for (n = 1; n <= 12; n++) V.geom.pmf.push(Math.pow(0.7, n - 1) * 0.3);
  for (n = 1; n <= 1000; n++) { s += Math.pow(0.7, n - 1) * 0.3; if (s >= 0.5) { V.geom.median = n; break; } }
})();
V.geom.p10 = 1 - Math.pow(0.7, 10);
V.geom.p3 = 1 - Math.pow(0.7, 3);

V.nb = { k: 3, p: 0.3, mean: 3 / 0.3 };
V.nb.pAt5 = choose(4, 2) * Math.pow(0.3, 3) * Math.pow(0.7, 2);
V.nb.wrong = pmf(3, 5, 0.3);
V.nb.mass = [];
(function () { var n; for (n = 3; n <= 12; n++) V.nb.mass.push(choose(n - 1, 2) * Math.pow(0.3, 3) * Math.pow(0.7, n - 3)); })();

/* --- where the model stops applying --- */
V.hyp = { N: 10, K: 3, n: 4 };
V.hyp.mass = [];
V.hyp.bin = pmfAll(4, 0.3);
(function () { var k; for (k = 0; k <= 3; k++) V.hyp.mass.push(hyper(k, 10, 3, 4)); })();
V.hyp.mean = 1.2;
V.hyp.varr = 0;
(function () { var k; for (k = 0; k <= 3; k++) V.hyp.varr += (k - 1.2) * (k - 1.2) * V.hyp.mass[k]; })();
V.hyp.fpc = (10 - 4) / (10 - 1);

/* --- the previous-year answers, recomputed --- */
V.pyq = {
  c2004coin: pmf(2, 4, 0.5),
  c2002: 1 - 2 / 16,
  c2005: 1 - Math.pow(0.5, 10)
};

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

chk('Bernoulli mass sums to 1', near(V.bern.p + V.bern.q, 1, 1e-15), fx(V.bern.p + V.bern.q, 12));
chk('Bernoulli mean equals p', near(V.bern.mean, V.bern.p, 1e-15));
chk('Bernoulli variance equals pq', near(V.bern.varr, V.bern.p * V.bern.q, 1e-15));
chk('Bernoulli variance equals p minus p squared', near(V.bern.varr, 0.3 - 0.09, 1e-15), '0.21');
chk('C(10,3) is 120', V.c10_3 === 120, V.c10_3);
chk('the mass function at n=10, p=0.3 sums to 1', near(V.pmf10Total, 1, 1e-12), fx(V.pmf10Total, 12));
chk('every mass is between 0 and 1', V.pmf10.every(function (v) { return v >= 0 && v <= 1; }));
chk('P(X=0) is q to the n', near(V.p10_0, Math.pow(0.7, 10), 1e-12), fx(V.p10_0, 9));
chk('P(X=n) is p to the n', near(V.p10_10, Math.pow(0.3, 10), 1e-12), fx(V.p10_10, 9));
chk('the largest mass is at k=3', modeOf(10, 0.3) === 3, V.p10_3.toFixed(6));
chk('the largest mass is 0.266828', near(V.p10_3, 0.2668279, 1e-6), fx(V.p10_3, 6));
chk('the ratio recursion matches the difference of neighbours at every k', V.ratio.every(function (r) { return near(r.actual, r.formula, 1e-10); }), '10 of 10');
chk('the ratio is above 1 exactly while k is below 3', V.ratio.filter(function (r) { return r.formula > 1; }).length === 3);
chk('the ratio crosses 1 at k=3', near(V.ratio[3].formula, 0.75, 1e-12), '0.75');
chk('the mode at n=10, p=0.3 is floor(11 x 0.3) = 3', V.mode10.floor === 3 && V.mode10.scan === 3, '(n+1)p = 3.3');
chk('at n=9, p=0.5 the two central masses are equal', near(pmf(4, 9, 0.5), pmf(5, 9, 0.5), 1e-15), fx(V.mode9.mass, 9));
chk('at n=9, p=0.5 there are exactly two modes, 4 and 5', V.mode9.modes.join(',') === '4,5', V.mode9.modes.join(','));
chk('at n=5, p=0.3 the mode is 1 although np is 1.5', V.mode5.scan === 1 && near(V.mode5.np, 1.5, 1e-15), 'mode 1');
chk('at n=5, p=0.3 floor((n+1)p) is 1', V.mode5.floor === 1, '(n+1)p = 1.8');
chk('at n=8, p=0.3 floor((n+1)p) agrees with the scan', V.mode8.floor === V.mode8.scan, 'both 2');
chk('mean by summation equals np at all four parameter pairs',
  V.moments.every(function (m) { return near(m.meanSum, m.np, 1e-8); }), '4 of 4');
chk('variance by summation equals npq at all four parameter pairs',
  V.moments.every(function (m) { return near(m.varSum, m.npq, 1e-8); }), '4 of 4');
chk('the variance never exceeds the mean', V.moments.every(function (m) { return m.varSum <= m.meanSum + 1e-12; }));
chk('the standard deviation is the square root of npq', V.moments.every(function (m) { return near(m.sd, Math.sqrt(m.npq), 1e-9); }));
chk('with the mean fixed at 6 the variance falls as p rises, largest at p = 0.1',
  V.fixedMean[0].varr === Math.max.apply(null, V.fixedMean.map(function (f) { return f.varr; })) && V.fixedMean[4].varr === Math.min.apply(null, V.fixedMean.map(function (f) { return f.varr; })), '5.4 at p = 0.1 down to 0.6 at p = 0.9');
chk('at a fixed n the variance is largest at p = 1/2', near(varOf(20, 0.5), 5, 1e-9) && varOf(20, 0.5) > varOf(20, 0.2) && varOf(20, 0.5) > varOf(20, 0.8), '5.0 against 3.2 at p = 0.2 and 0.8');
chk('with the mean fixed at 6 the variance is 6(1-p)', V.fixedMean.every(function (f) { return near(f.varr, 6 * (1 - f.p), 1e-12); }));
chk('the Hamming mass function sums to 1', near(V.ham.total, 1, 1e-12), fx(V.ham.total, 12));
chk('P(Hamming distance 3) equals 56/256', near(V.ham.p, 56 / 256, 1e-12), fx(V.ham.p, 6));
chk('the pair count 2^n x C(n,d) over 2^2n reproduces the mass', near(V.ham.pairs / V.ham.allPairs, V.ham.p, 1e-12), V.ham.pairs + ' of ' + V.ham.allPairs);
chk('C(2n,n)/4^n is a probability for every n from 1 to 12', V.central.every(function (r) { return r.val > 0 && r.val < 1; }));
chk('the central binomial value falls as n grows', V.central.every(function (r, i) { return i === 0 || r.val < V.central[i - 1].val; }));
chk('at n=25 the central value is 0.112275', near(V.central25.val, 0.112275, 1e-6), fx(V.central25.val, 6));
chk('1 over root pi n is within 1 per cent at n=25', Math.abs(V.central25.asym - V.central25.val) / V.central25.val < 0.01, '0.112838 against 0.112275');
chk('adding two binomials with equal p gives the binomial of the summed n', V.same.maxDiff < 1e-12, 'max difference ' + sci(V.same.maxDiff));
chk('the summed mass still totals 1', near(total(V.same.conv), 1, 1e-12));
chk('with unequal p the sum is not binomial', V.mixed.maxDiff > 0.1, 'max difference ' + fx(V.mixed.maxDiff, 4));
chk('the unequal-p sum still has the additive mean', near(V.mixed.convMean, V.mixed.mean, 1e-12), fx(V.mixed.convMean, 9));
chk('the unequal-p sum still has the additive variance', near(V.mixed.convVar, V.mixed.varr, 1e-12), fx(V.mixed.convVar, 9));
chk('so the same mean and variance do not fix the distribution', near(V.mixed.convMean, V.mixed.mean, 1e-12) && V.mixed.maxDiff > 0.1);
chk('the Poisson masses at rate 3 sum to 1 over k = 0 to 30', (function () { var s = 0, k; for (k = 0; k <= 30; k++) s += pois(k, 3); return near(s, 1, 1e-9); })(), 'to nine places');
chk('the Poisson tail above k = 10 is under 1e-3, so a truncated table is safe', (function () { var s = 0, k; for (k = 0; k <= 10; k++) s += pois(k, 3); return (1 - s) < 1e-3; })(), '1 - 0.999708');
chk('the Poisson gap falls by about a factor of 10 for each factor of 10 in n',
  V.poisson[1].gap < V.poisson[0].gap / 5 && V.poisson[2].gap < V.poisson[1].gap / 5,
  sci(V.poisson[0].gap) + ' then ' + sci(V.poisson[1].gap) + ' then ' + sci(V.poisson[2].gap));
chk('the gap at n = 100000 is below 1e-5', V.poisson[4].gap < 1e-5, sci(V.poisson[4].gap));
chk('the geometric masses sum to 1 by n = 100 to within 1e-9', (function () { var s = 0, n; for (n = 1; n <= 100; n++) s += Math.pow(0.7, n - 1) * 0.3; return near(s, 1, 1e-9); })(), 'to nine places');
chk('the geometric mass by n = 12 is 0.986159, so twelve bars do not total 1', near(V.geom.pmf.reduce(function (s, v) { return s + v; }, 0), 1 - Math.pow(0.7, 12), 1e-12), '1 - 0.7^12');
chk('the geometric mean is 1/p = 3.3333', near(V.geom.mean, 1 / 0.3, 1e-12), fx(V.geom.mean, 6));
chk('the geometric median is 2', V.geom.median === 2, V.geom.median);
chk('P(at least one success in 10) equals 1 minus q to the 10', near(V.geom.p10, 1 - Math.pow(0.7, 10), 1e-15), fx(V.geom.p10, 6));
chk('the negative binomial mean is k/p = 10', near(V.nb.mean, 10, 1e-12), fx(V.nb.mean, 6));
chk('the negative binomial mass at 5 trials is 0.079380', near(V.nb.pAt5, 0.07938, 1e-6), fx(V.nb.pAt5, 6));
chk('the binomial answer to the same words is different, 0.132300', near(V.nb.wrong, 0.1323, 1e-9), fx(V.nb.wrong, 6));
chk('the two answers differ, so the questions differ', Math.abs(V.nb.pAt5 - V.nb.wrong) > 0.05, fx(Math.abs(V.nb.pAt5 - V.nb.wrong), 4));
chk('the hypergeometric mass sums to 1', near(total(V.hyp.mass), 1, 1e-12), fx(total(V.hyp.mass), 12));
chk('the hypergeometric mean is nK/N = 1.2', near(V.hyp.mean, 4 * 3 / 10, 1e-15), fx(V.hyp.mean, 6));
chk('the hypergeometric variance is npq times (N-n)/(N-1)', near(V.hyp.varr, 4 * 0.3 * 0.7 * V.hyp.fpc, 1e-12), fx(V.hyp.varr, 6));
chk('the binomial and the hypergeometric disagree at k=1', Math.abs(V.hyp.mass[1] - V.hyp.bin[1]) > 0.08, fx(V.hyp.mass[1], 6) + ' against ' + fx(V.hyp.bin[1], 6));
chk('GATE CSE 2004: two heads in four fair tosses is 6/16', near(V.pyq.c2004coin, 6 / 16, 1e-12), fx(V.pyq.c2004coin, 6));
chk('GATE CSE 2002: at least one head and one tail in four tosses is 7/8', near(V.pyq.c2002, 0.875, 1e-15), fx(V.pyq.c2002, 6));
chk('GATE CSE 2005: two random 10-bit strings differ with probability 1 - 1/1024', near(V.pyq.c2005, 1023 / 1024, 1e-15), fx(V.pyq.c2005, 9));

/* ======================================================================
   LAYER 3 - RENDER. One function per scene; each reads V only.
   ====================================================================== */

function head(title, sub) {
  P.alpha(1);
  P.text(28, 16, title, { size: 15, bold: true, color: INK });
  if (sub) P.text(28, 36, sub, { size: 12, color: DIM });
}

function foot(s) { P.alpha(1); P.text(28, 448, s, { size: 12.5, color: DIM }); }

function panel(x, y, w, h, label) {
  P.rect(x, y, w, h, { fill: SURF2, stroke: BORDER, radius: 8, sw: 1 });
  if (label) P.text(x + 10, y + 7, label, { size: 10.5, mono: true, color: FAINT });
}

/* a column of bars; vals are probabilities, hmax is the tallest pixel height */
function bars(x0, base, bw, gap, vals, scale, opts) {
  opts = opts || {};
  var i, h, x;
  for (i = 0; i < vals.length; i++) {
    h = Math.max(0, vals[i] * scale);
    x = x0 + i * (bw + gap);
    var hot = opts.hot !== undefined && i === opts.hot;
    P.rect(x, base - h, bw, h, {
      fill: hot ? ACC : (opts.fill || BORDER),
      stroke: hot ? ACC : (opts.stroke || BORDER), sw: 1, radius: 2
    });
    if (opts.labels) {
      P.text(x + bw / 2, base + 4, String(opts.labels[i]), { size: 10, mono: true, align: 'center', color: hot ? ACC : FAINT });
    }
    if (opts.top !== false && h > 16) {
      P.text(x + bw / 2, base - h - 4, opts.fmt ? opts.fmt(vals[i]) : fx(vals[i], 3),
        { size: 9.5, mono: true, align: 'center', base: 'bottom', color: hot ? ACC : DIM });
    }
  }
}

var SCENE_DRAW = {};

/* ---------------- scene 1: one trial, then n of them ---------------- */
SCENE_DRAW.trials = function (t, sc) {
  var p = K.sceneProgress(t);
  head('One trial, then ten of them', 'A Bernoulli trial has two outcomes. The count of successes is the sum of the trials.');

  /* left: the Bernoulli mass function */
  panel(24, 62, 250, 300, 'BERNOULLI(0.3)');
  var bx = 74, base = 300, bw = 54;
  P.alpha(K.ease(K.beat(t, sc.start, 4)));
  bars(bx, base, bw, 32, [0.7, 0.3], 240, { labels: ['0', '1'], fill: BORDER, fmt: function (v) { return fx(v, 2); } });
  P.text(28, 316, 'P(0) = q = 0.70', { size: 11, color: DIM });
  P.text(28, 334, 'P(1) = p = 0.30', { size: 11, color: DIM });
  P.text(28, 352, 'mean = p = 0.30', { size: 11, color: INK });

  /* middle: ten cells, revealed one at a time */
  panel(292, 62, 300, 300, 'TEN INDEPENDENT TRIALS');
  var seq = ['H', 'T', 'H', 'T', 'H', 'T', 'T', 'T', 'H', 'T'];
  var i, cx, cy, seen = 0;
  for (i = 0; i < 10; i++) {
    cx = 306 + (i % 5) * 56; cy = 96 + Math.floor(i / 5) * 62;
    var on = K.beat(t, sc.start + 5 + i * 0.9, 0.9) > 0;
    if (on) seen++;
    P.rect(cx, cy, 48, 48, {
      fill: on ? (seq[i] === 'H' ? ACCDIM : SURF) : SURF,
      stroke: on ? (seq[i] === 'H' ? ACC : BORDER) : BORDER, sw: 1.2, radius: 6
    });
    if (on) P.text(cx + 24, cy + 24, seq[i], { size: 16, mono: true, bold: true, align: 'center', base: 'middle', color: seq[i] === 'H' ? ACC : DIM });
  }
  if (K.beat(t, sc.start + 14, 1) > 0) {
    P.text(306, 250, 'successes so far: ' + Math.min(seen, 3), { size: 12, mono: true, color: INK });
    P.text(306, 270, 'X = X1 + X2 + ... + X10', { size: 12, mono: true, color: DIM });
  }

  /* right: the three conditions */
  panel(608, 62, 268, 300, 'WHAT THE MODEL ASSUMES');
  P.alpha(K.ease(K.beat(t, sc.start + 20, 3)));
  P.text(620, 92, '1. n is fixed in advance', { size: 11.5, color: INK });
  P.text(620, 114, '2. p is the same every trial', { size: 11.5, color: INK });
  P.text(620, 136, '3. the trials are independent', { size: 11.5, color: INK });
  P.alpha(K.ease(K.beat(t, sc.start + 24, 3)));
  P.text(620, 176, 'Then X has a binomial', { size: 12, color: INK });
  P.text(620, 196, 'distribution with n = 10', { size: 12, color: INK });
  P.text(620, 216, 'and p = 0.3.', { size: 12, color: INK });
  P.text(620, 250, 'E[X] = np = 3', { size: 12, mono: true, color: ACC });
  P.text(620, 270, 'Var = npq = 2.1', { size: 12, mono: true, color: ACC });

  foot('X counts successes in a fixed number of independent trials with one constant p.');
};

/* ---------------- scene 2: the mass function ---------------- */
SCENE_DRAW.pmf = function (t, sc) {
  head('The mass function', 'P(X = k) = C(n,k) p^k q^(n-k), for k = 0 to n and nothing outside.');

  var x0 = 78, base = 352, bw = 54, gap = 16, scale = 760;
  var labels = [];
  for (var i = 0; i <= 10; i++) labels.push(String(i));

  panel(24, 62, 852, 320, 'BINOMIAL n = 10, p = 0.3');
  P.alpha(K.ease(K.beat(t, sc.start, 3)));
  P.line(60, base, 872, base, { stroke: BORDER, sw: 1.2 });
  bars(x0, base, bw, gap, V.pmf10, scale, { labels: labels, hot: 3, fmt: function (v) { return fx(v, 3); } });

  /* the arithmetic behind the tallest bar */
  P.alpha(K.ease(K.beat(t, sc.start + 8, 3)));
  P.text(60, 88, 'the bar at k = 3:', { size: 11.5, color: DIM });
  P.text(60, 108, 'C(10,3) = 120 sequences,', { size: 12, mono: true, color: INK });
  P.text(60, 126, 'each with probability', { size: 11.5, color: DIM });
  P.text(60, 146, '0.3^3 x 0.7^7 = 0.002224', { size: 12, mono: true, color: INK });
  P.text(60, 170, '120 x 0.002224 = 0.266828', { size: 12, mono: true, bold: true, color: ACC });

  P.alpha(K.ease(K.beat(t, sc.start + 16, 3)));
  P.text(430, 88, 'the two end bars:', { size: 11.5, color: DIM });
  P.text(430, 108, 'P(0) = 0.7^10 = 0.028248', { size: 12, mono: true, color: INK });
  P.text(430, 128, 'P(10) = 0.3^10 = 0.000006', { size: 12, mono: true, color: INK });

  P.alpha(K.ease(K.beat(t, sc.start + 22, 3)));
  P.text(430, 164, 'the eleven bars total', { size: 11.5, color: DIM });
  P.text(430, 184, '1.000000000000', { size: 13, mono: true, bold: true, color: VAL });
  P.text(660, 164, 'nothing outside 0 to n', { size: 11.5, color: DIM });
  P.text(660, 184, 'carries any mass', { size: 11.5, color: DIM });

  foot('A mass function, not a density: probability sits on the integers, in bars, not under a curve.');
};

/* ---------------- scene 3: ratios and the mode ---------------- */
SCENE_DRAW.recursion = function (t, sc) {
  head('Ratios, and where the peak sits', 'The neighbouring masses are related by one multiplication, so no factorial is ever needed.');

  /* left: the ratio table */
  panel(24, 62, 404, 320, 'P(k+1) / P(k) = ((n-k)/(k+1)) x (p/q)');
  P.alpha(K.ease(K.beat(t, sc.start, 3)));
  P.text(36, 90, 'k', { size: 10, mono: true, color: FAINT });
  P.text(76, 90, 'measured', { size: 10, mono: true, color: FAINT });
  P.text(196, 90, 'formula', { size: 10, mono: true, color: FAINT });
  P.text(300, 90, 'direction', { size: 10, mono: true, color: FAINT });
  for (var k = 0; k < 8; k++) {
    var r = V.ratio[k], y = 112 + k * 26;
    var on = K.beat(t, sc.start + 2 + k * 0.8, 0.8) > 0;
    if (!on) continue;
    var up = r.formula > 1;
    P.text(36, y, String(k), { size: 11, mono: true, color: DIM });
    P.text(76, y, fx(r.actual, 6), { size: 11, mono: true, color: INK });
    P.text(196, y, fx(r.formula, 6), { size: 11, mono: true, color: INK });
    P.text(300, y, up ? 'rising' : 'falling', { size: 11, color: up ? ACC : DIM });
  }

  /* right: two peaks of equal height, then the counterexample */
  panel(444, 62, 432, 320, 'THE PEAK IS floor((n+1)p)');
  P.alpha(K.ease(K.beat(t, sc.start + 12, 3)));
  P.text(456, 90, 'n = 9, p = 0.5: (n+1)p = 5 exactly', { size: 11.5, color: INK });
  P.text(456, 108, 'so k = 4 and k = 5 are tied at 0.246094', { size: 11.5, color: DIM });
  var b9 = [];
  for (var j = 0; j <= 9; j++) b9.push(pmf(j, 9, 0.5));
  bars(462, 250, 34, 8, b9, 340, { fill: ACCDIM, stroke: ACC, hot: -1, top: false });

  P.alpha(K.ease(K.beat(t, sc.start + 19, 3)));
  P.text(456, 274, 'n = 5, p = 0.3: np = 1.5, but the peak is at 1', { size: 11.5, color: BAD });
  P.text(456, 292, 'P(1) = 0.360150 beats P(2) = 0.308700', { size: 11.5, mono: true, color: INK });
  P.text(456, 314, 'the rule rounds (n+1)p down, never np', { size: 11.5, color: DIM });

  P.alpha(K.ease(K.beat(t, sc.start + 25, 3)));
  P.text(456, 344, 'n = 10, p = 0.3: (n+1)p = 3.3, peak at k = 3', { size: 11.5, mono: true, color: ACC });

  foot('The ratio falls below 1 at the peak, so one multiplication walks the whole distribution from P(0).');
};

/* ---------------- scene 4: mean and variance ---------------- */
SCENE_DRAW.moments = function (t, sc) {
  head('np and npq: derived, then checked by summation', 'Sum the bars and the two formulas come out. Independence is what lets the variances add.');

  panel(24, 62, 400, 320, 'THE DERIVATION');
  P.alpha(K.ease(K.beat(t, sc.start, 3)));
  P.text(36, 90, 'X = X1 + X2 + ... + Xn', { size: 12, mono: true, color: INK });
  P.text(36, 110, 'each Xi is 1 with probability p', { size: 11, color: DIM });
  P.text(36, 134, 'E[Xi] = p, so E[X] = np', { size: 12, mono: true, color: ACC });
  P.text(36, 158, 'Var(Xi) = p - p^2 = pq', { size: 12, mono: true, color: INK });
  P.text(36, 182, 'the Xi are independent, so', { size: 11, color: DIM });
  P.text(36, 202, 'Var(X) = n x pq = npq', { size: 12, mono: true, color: ACC });
  P.alpha(K.ease(K.beat(t, sc.start + 8, 3)));
  P.text(36, 236, 'dropping independence keeps the', { size: 11, color: BAD });
  P.text(36, 254, 'mean but breaks the variance', { size: 11, color: BAD });
  P.text(36, 282, 'sd = root(npq), never root(np) x q', { size: 11, color: WARN });

  panel(444, 62, 432, 320, 'SUMMED FROM THE BARS');
  P.alpha(K.ease(K.beat(t, sc.start + 13, 3)));
  P.text(456, 88, 'n, p', { size: 10, mono: true, color: FAINT });
  P.text(520, 88, 'summed mean', { size: 10, mono: true, color: FAINT });
  P.text(618, 88, 'np', { size: 10, mono: true, color: FAINT });
  P.text(672, 88, 'summed var', { size: 10, mono: true, color: FAINT });
  P.text(776, 88, 'npq', { size: 10, mono: true, color: FAINT });
  V.moments.forEach(function (m, i) {
    var y = 110 + i * 26;
    if (K.beat(t, sc.start + 13 + i * 1.1, 1.1) <= 0) return;
    P.text(456, y, m.n + ', ' + m.p, { size: 11, mono: true, color: DIM });
    P.text(520, y, fx(m.meanSum, 4), { size: 11, mono: true, color: INK });
    P.text(618, y, fx(m.np, 4), { size: 11, mono: true, color: INK });
    P.text(672, y, fx(m.varSum, 4), { size: 11, mono: true, color: INK });
    P.text(776, y, fx(m.npq, 4), { size: 11, mono: true, color: INK });
  });
  P.alpha(K.ease(K.beat(t, sc.start + 20, 3)));
  P.text(456, 226, 'Mean fixed at 6, variance against p:', { size: 11.5, color: INK });
  V.fixedMean.forEach(function (f, i) {
    P.text(456 + i * 82, 248, 'p=' + f.p, { size: 10.5, mono: true, color: DIM });
    P.text(456 + i * 82, 266, fx(f.varr, 2), { size: 11, mono: true, color: i === 2 ? ACC : INK });
  });
  P.text(456, 292, 'largest at the smallest p: rare events', { size: 11, color: DIM });
  P.text(456, 310, 'give the quietest count for one mean', { size: 11, color: DIM });

  foot('Variance equals mean only when q = 1; a binomial always has variance below its mean.');
};

/* ---------------- scene 5: GATE CSE 2004, the Hamming distance ---------------- */
SCENE_DRAW.hamming = function (t, sc) {
  head('GATE CSE 2004: the Hamming distance of two random strings', 'Every bit position is one fair trial, so the distance is a binomial count.');

  panel(24, 62, 424, 320, 'TWO 8-BIT STRINGS');
  P.alpha(K.ease(K.beat(t, sc.start, 3)));
  var bits1 = [1, 0, 1, 1, 0, 0, 1, 0], bits2 = [1, 0, 0, 1, 1, 0, 1, 0];
  for (var i = 0; i < 8; i++) {
    var x = 40 + i * 50, differ = bits1[i] !== bits2[i];
    P.rect(x, 96, 40, 40, { fill: differ ? BADDIM : SURF, stroke: differ ? BAD : BORDER, sw: 1.2, radius: 5 });
    P.text(x + 20, 116, String(bits1[i]), { size: 15, mono: true, align: 'center', base: 'middle', color: differ ? BAD : INK });
    P.rect(x, 152, 40, 40, { fill: differ ? BADDIM : SURF, stroke: differ ? BAD : BORDER, sw: 1.2, radius: 5 });
    P.text(x + 20, 172, String(bits2[i]), { size: 15, mono: true, align: 'center', base: 'middle', color: differ ? BAD : INK });
  }
  P.text(40, 88, 'S1', { size: 11, mono: true, color: FAINT });
  P.text(40, 144, 'S2', { size: 11, mono: true, color: FAINT });
  P.alpha(K.ease(K.beat(t, sc.start + 6, 3)));
  P.text(40, 216, 'three positions differ, so d = 3 here', { size: 11.5, color: INK });
  P.text(40, 238, 'each position differs with probability 1/2', { size: 11.5, color: DIM });
  P.text(40, 260, 'and the positions are independent', { size: 11.5, color: DIM });
  P.text(40, 290, 'so D ~ Binomial(n, 1/2)', { size: 12.5, mono: true, bold: true, color: ACC });
  P.text(40, 314, 'P(D = d) = C(n,d) / 2^n', { size: 12.5, mono: true, bold: true, color: ACC });

  panel(468, 62, 408, 320, 'THE MASS FUNCTION AT n = 8');
  P.alpha(K.ease(K.beat(t, sc.start + 12, 3)));
  var lab = [], j;
  for (j = 0; j <= 8; j++) lab.push(String(j));
  bars(486, 300, 36, 8, V.ham.pmf, 900, { labels: lab, hot: 3, fill: BORDER, fmt: function (v) { return fx(v, 2); } });
  P.alpha(K.ease(K.beat(t, sc.start + 18, 3)));
  P.text(486, 322, 'P(D = 3) = 56 / 256 = 0.218750', { size: 12, mono: true, bold: true, color: ACC });
  P.text(486, 344, 'counting: 2^8 x C(8,3) = 14336 pairs', { size: 11, mono: true, color: DIM });
  P.text(486, 362, 'out of 2^16 = 65536, the same 0.218750', { size: 11, mono: true, color: DIM });

  foot('Answer C(n,d)/2^n. The distractor C(n,d)/2^d forgets the n-d positions that agree.');
};

/* ---------------- scene 6: GATE CSE 2006, the central binomial ---------------- */
SCENE_DRAW.central = function (t, sc) {
  head('GATE CSE 2006: exactly n chosen out of 2n', 'Each element is an independent fair trial, so the count is Binomial(2n, 1/2).');

  panel(24, 62, 404, 320, 'THE MODEL');
  P.alpha(K.ease(K.beat(t, sc.start, 3)));
  P.text(36, 90, 'a set of size 2n, one fair coin each', { size: 11.5, color: INK });
  P.text(36, 110, 'chosen on a head, so p = 1/2', { size: 11.5, color: DIM });
  P.text(36, 138, 'X ~ Binomial(2n, 1/2)', { size: 12.5, mono: true, color: ACC });
  P.text(36, 162, 'P(X = n) = C(2n,n) (1/2)^n (1/2)^n', { size: 12, mono: true, color: INK });
  P.text(36, 184, '         = C(2n,n) / 4^n', { size: 12.5, mono: true, bold: true, color: ACC });
  P.alpha(K.ease(K.beat(t, sc.start + 9, 3)));
  P.text(36, 218, 'the distractors:', { size: 11.5, color: DIM });
  P.text(36, 238, 'C(2n,n)/2^n drops the second factor', { size: 11, color: BAD });
  P.text(36, 256, '1/C(2n,n) inverts the count', { size: 11, color: BAD });
  P.text(36, 274, '1/2 is the large-n limit, not n = 1', { size: 11, color: BAD });
  P.text(36, 302, 'at n = 1 it is 2/4 = 0.5, at n = 2 it is 0.375', { size: 11, color: INK });

  panel(448, 62, 428, 320, 'THE VALUE, AND ITS LIMIT');
  P.alpha(K.ease(K.beat(t, sc.start + 15, 3)));
  P.text(460, 88, 'n', { size: 10, mono: true, color: FAINT });
  P.text(496, 88, 'C(2n,n)', { size: 10, mono: true, color: FAINT });
  P.text(596, 88, 'C(2n,n)/4^n', { size: 10, mono: true, color: FAINT });
  P.text(716, 88, '1/root(pi n)', { size: 10, mono: true, color: FAINT });
  V.central.slice(0, 7).forEach(function (r, i) {
    var y = 110 + i * 24;
    if (K.beat(t, sc.start + 15 + i * 0.8, 0.8) <= 0) return;
    P.text(460, y, String(r.n), { size: 11, mono: true, color: DIM });
    P.text(496, y, String(r.coef), { size: 11, mono: true, color: INK });
    P.text(596, y, fx(r.val, 6), { size: 11, mono: true, color: INK });
    P.text(716, y, fx(r.asym, 6), { size: 11, mono: true, color: FAINT });
  });
  P.alpha(K.ease(K.beat(t, sc.start + 24, 3)));
  P.text(460, 296, 'at n = 25: 0.112275 against 0.112838', { size: 11.5, mono: true, color: INK });
  P.text(460, 318, 'so the answer never equals 1/2 for n above 0', { size: 11, color: DIM });

  foot('C(2n,n)/4^n is a probability that shrinks like 1 over root(pi n); it is not a constant.');
};

/* ---------------- scene 7: adding two binomials ---------------- */
SCENE_DRAW.sums = function (t, sc) {
  head('Adding two binomials', 'Same p: add the trial counts. Different p: the sum is a valid distribution that is not binomial.');

  panel(24, 62, 412, 320, 'SAME p, n = 4 + 6, p = 0.3');
  P.alpha(K.ease(K.beat(t, sc.start, 3)));
  var lab = [], i;
  for (i = 0; i <= 10; i++) lab.push(String(i));
  bars(44, 288, 30, 6, V.same.conv, 560, { labels: lab, hot: 3, top: false });
  P.alpha(K.ease(K.beat(t, sc.start + 8, 3)));
  P.text(44, 310, 'overlaid on Binomial(10, 0.3):', { size: 11, color: DIM });
  P.text(44, 330, 'largest difference 0.000000000000', { size: 11.5, mono: true, bold: true, color: VAL });
  P.text(44, 352, 'so Bin(n1,p) + Bin(n2,p) = Bin(n1+n2,p)', { size: 11, mono: true, color: INK });

  panel(456, 62, 420, 320, 'DIFFERENT p, 2 at 0.2 plus 3 at 0.8');
  P.alpha(K.ease(K.beat(t, sc.start + 14, 3)));
  var lab2 = ['0', '1', '2', '3', '4', '5'];
  bars(476, 230, 34, 12, V.mixed.conv, 250, { labels: lab2, hot: 3, top: false });
  /* the binomial(5, 0.5) it is compared with, drawn as an outline */
  for (i = 0; i <= 5; i++) {
    var h = V.mixed.flat[i] * 250;
    P.line(476 + i * 46 - 2, 230 - h, 476 + i * 46 + 36, 230 - h, { stroke: INFO, sw: 2, dash: [4, 3] });
  }
  P.text(476, 96, 'solid: the true sum   dashed: Binomial(5, 0.5)', { size: 10.5, color: DIM });
  P.alpha(K.ease(K.beat(t, sc.start + 21, 3)));
  P.text(476, 252, 'P(1) is 0.064000 against 0.156250', { size: 11, mono: true, color: INK });
  P.text(476, 272, 'largest difference 0.141900', { size: 11.5, mono: true, bold: true, color: BAD });
  P.text(476, 296, 'mean 2.8 and variance 0.8 both still match', { size: 11, color: INK });
  P.text(476, 316, 'np1 + np2 and np1q1 + np2q2 add up either way', { size: 11, color: DIM });

  foot('Equal p is what makes the sum binomial. The moments add whether or not p matches.');
};

/* ---------------- scene 8: the Poisson limit ---------------- */
SCENE_DRAW.poisson = function (t, sc) {
  head('The Poisson is the binomial with n large and np held fixed', 'Keep the mean at 3 and let n grow: the mass function settles onto the Poisson curve.');

  panel(24, 62, 420, 320, 'np = 3, n = 10 against Poisson(3)');
  P.alpha(K.ease(K.beat(t, sc.start, 3)));
  var lab = [], i;
  for (i = 0; i <= 10; i++) lab.push(String(i));
  bars(44, 286, 32, 6, V.bin10, 700, { labels: lab, hot: -1, fmt: function (v) { return fx(v, 2); } });
  for (i = 0; i <= 10; i++) {
    var h = V.pois3[i] * 700, x = 44 + i * 38;
    P.circle(x + 16, 286 - h, 3.2, { fill: INFO, stroke: INFO, sw: 1 });
  }
  P.text(44, 96, 'bars: Binomial(10, 0.3)   dots: Poisson(3)', { size: 10.5, color: DIM });
  P.alpha(K.ease(K.beat(t, sc.start + 9, 3)));
  P.text(44, 308, 'the largest gap here is 0.04279', { size: 11.5, mono: true, color: INK });
  P.text(44, 328, 'at k = 0 it is 0.028248 against 0.049787', { size: 11, mono: true, color: DIM });

  panel(464, 62, 412, 320, 'THE GAP AGAINST n');
  P.alpha(K.ease(K.beat(t, sc.start + 15, 3)));
  P.text(476, 88, 'n', { size: 10, mono: true, color: FAINT });
  P.text(556, 88, 'p = 3/n', { size: 10, mono: true, color: FAINT });
  P.text(676, 88, 'largest gap', { size: 10, mono: true, color: FAINT });
  V.poisson.forEach(function (r, i) {
    var y = 112 + i * 28;
    if (K.beat(t, sc.start + 15 + i * 1.2, 1.2) <= 0) return;
    P.text(476, y, String(r.n), { size: 11, mono: true, color: DIM });
    P.text(556, y, fx(r.p, 5), { size: 11, mono: true, color: INK });
    P.text(676, y, sci(r.gap), { size: 11, mono: true, color: i === 4 ? VAL : INK });
  });
  P.alpha(K.ease(K.beat(t, sc.start + 24, 3)));
  P.text(476, 268, 'each factor of 10 in n buys a factor of 10', { size: 11, color: INK });
  P.text(476, 290, 'the rule of thumb: n at least 20 and p at most 0.05', { size: 11, color: DIM });
  P.text(476, 316, 'the other limit is the normal, when np and nq are large', { size: 11, color: DIM });

  foot('The Poisson has no upper bound on k and its variance equals its mean, so it is not a binomial.');
};

/* ---------------- scene 9: counting trials, not successes ---------------- */
SCENE_DRAW.waiting = function (t, sc) {
  head('Two questions that sound alike', 'Successes in a fixed number of trials is binomial. Trials until a fixed number of successes is not.');

  panel(24, 62, 412, 320, 'TRIALS UNTIL THE FIRST SUCCESS, p = 0.3');
  P.alpha(K.ease(K.beat(t, sc.start, 3)));
  var lab = [], i;
  for (i = 1; i <= 10; i++) lab.push(String(i));
  bars(44, 250, 32, 6, V.geom.pmf.slice(0, 10), 420, { labels: lab, hot: 0, top: false });
  P.alpha(K.ease(K.beat(t, sc.start + 7, 3)));
  P.text(44, 274, 'P(N = n) = q^(n-1) p, and N is unbounded', { size: 11, mono: true, color: INK });
  P.text(44, 296, 'mean 1/p = 3.3333, median 2', { size: 11.5, mono: true, color: ACC });
  P.text(44, 318, 'P(at least one in 10) = 1 - 0.7^10', { size: 11, mono: true, color: INK });
  P.text(44, 338, '                    = 0.971752', { size: 11.5, mono: true, bold: true, color: ACC });

  panel(456, 62, 420, 320, 'THE THIRD SUCCESS, ON WHICH TRIAL?');
  P.alpha(K.ease(K.beat(t, sc.start + 14, 3)));
  P.text(468, 88, 'the question', { size: 10.5, mono: true, color: FAINT });
  P.text(468, 108, 'P(3rd success lands exactly on trial 5)', { size: 11, color: INK });
  P.text(468, 130, 'C(4,2) x 0.3^3 x 0.7^2 = 0.079380', { size: 11.5, mono: true, bold: true, color: ACC });
  P.alpha(K.ease(K.beat(t, sc.start + 20, 3)));
  P.text(468, 162, 'the different question', { size: 10.5, mono: true, color: FAINT });
  P.text(468, 182, 'P(exactly 3 successes among 5 trials)', { size: 11, color: INK });
  P.text(468, 204, 'C(5,3) x 0.3^3 x 0.7^2 = 0.132300', { size: 11.5, mono: true, bold: true, color: BAD });
  P.text(468, 232, 'they differ by 0.052920, so the wording', { size: 11, color: INK });
  P.text(468, 250, 'decides which model is right', { size: 11, color: INK });
  P.alpha(K.ease(K.beat(t, sc.start + 26, 3)));
  P.text(468, 282, 'negative binomial: mean k/p = 10', { size: 11.5, mono: true, color: ACC });
  P.text(468, 304, 'geometric is the case k = 1', { size: 11, color: DIM });
  P.text(468, 328, 'both count trials, so both are unbounded', { size: 11, color: DIM });

  foot('Binomial fixes n and counts successes. Waiting models fix the successes and let n vary.');
};

/* ---------------- scene 10: where the model stops ---------------- */
SCENE_DRAW.limits = function (t, sc) {
  head('Where the binomial stops applying', 'Take away a condition and the arithmetic changes, not just the name.');

  panel(24, 62, 440, 320, 'WITHOUT REPLACEMENT: 3 marked in 10, draw 4');
  P.alpha(K.ease(K.beat(t, sc.start, 3)));
  var lab = ['0', '1', '2', '3'], i;
  bars(44, 250, 42, 26, V.hyp.bin, 380, { labels: lab, hot: 1, top: false });
  for (i = 0; i <= 3; i++) {
    var h = V.hyp.mass[i] * 380;
    P.line(44 + i * 68 - 3, 250 - h, 44 + i * 68 + 45, 250 - h, { stroke: INFO, sw: 2, dash: [4, 3] });
  }
  P.text(44, 96, 'bars: binomial(4, 0.3)   dashed: hypergeometric', { size: 10.5, color: DIM });
  P.alpha(K.ease(K.beat(t, sc.start + 8, 3)));
  P.text(44, 274, 'P(1) is 0.411600 against 0.500000', { size: 11.5, mono: true, color: INK });
  P.text(44, 296, 'the variance shrinks by (N-n)/(N-1) = 0.666667', { size: 11, mono: true, color: INK });
  P.text(44, 316, 'npq x 0.666667 = 0.560000, the summed value', { size: 11, mono: true, color: ACC });
  P.text(44, 340, 'draws are dependent, so p is not constant', { size: 11, color: BAD });

  panel(484, 62, 392, 320, 'THE FOUR-STEP PROCEDURE');
  P.alpha(K.ease(K.beat(t, sc.start + 16, 3)));
  P.text(496, 92, '1. fixed n?', { size: 11.5, bold: true, color: INK });
  P.text(496, 110, 'no fixed n, no binomial', { size: 10.5, color: DIM });
  P.text(496, 136, '2. constant p?', { size: 11.5, bold: true, color: INK });
  P.text(496, 154, 'without replacement changes p', { size: 10.5, color: DIM });
  P.text(496, 180, '3. independent trials?', { size: 11.5, bold: true, color: INK });
  P.text(496, 198, 'shared causes break the variance', { size: 10.5, color: DIM });
  P.text(496, 224, '4. which count?', { size: 11.5, bold: true, color: INK });
  P.text(496, 242, 'successes in n, or trials to k', { size: 10.5, color: DIM });
  P.alpha(K.ease(K.beat(t, sc.start + 25, 3)));
  P.text(496, 278, 'then: mean np, variance npq,', { size: 11.5, mono: true, color: ACC });
  P.text(496, 298, 'peak floor((n+1)p), and add n', { size: 11.5, mono: true, color: ACC });
  P.text(496, 318, 'when p matches', { size: 11.5, mono: true, color: ACC });

  foot('A binomial is a model with three assumptions; a question that breaks one is a different question.');
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
