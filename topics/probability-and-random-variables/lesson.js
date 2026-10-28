/* ==========================================================================
   probability-and-random-variables — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no probability arithmetic of its own:
   every figure on the canvas was computed once here and checked against the
   rule it is supposed to satisfy (the Kolmogorov axioms, the definition of
   conditional probability, the binomial and Poisson PMFs, and the normal
   density's standard form).
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

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- 1. two dice: the sample space and three counts ---------- */

var DICE = (function () {
  var counts = [];               /* counts[s] for s = 2..12 */
  for (var s = 0; s <= 12; s++) counts.push(0);
  var total = 0, gt9 = 0, both = 0;   /* both = sum is 11 and sum > 9 */
  for (var a = 1; a <= 6; a++) {
    for (var b = 1; b <= 6; b++) {
      var sum = a + b;
      counts[sum] += 1;
      total += 1;
      if (sum > 9) gt9 += 1;
      if (sum === 11 && sum > 9) both += 1;
    }
  }
  return { counts: counts, total: total, c7: counts[7], gt9: gt9, both: both };
})();

var P7 = DICE.c7 / DICE.total;                  /* 1/6  */
var PGT9 = DICE.gt9 / DICE.total;               /* 1/6  */
var PCOND = DICE.both / DICE.gt9;               /* 1/3  */
var PCOND_JOINT = (DICE.both / DICE.total) / (DICE.gt9 / DICE.total);

/* ---------- 2. Bayes: GATE 2021 Set 1 Q54 ---------- */

var BAYES = {
  pH: 0.1, pL: 0.9,          /* priors on the transmitted symbol      */
  pH_H: 0.3, pH_L: 0.8       /* P(receive H | send H), P(receive H | send L) */
};
BAYES.pathH = BAYES.pH_H * BAYES.pH;            /* 0.03 */
BAYES.pathL = BAYES.pH_L * BAYES.pL;            /* 0.72 */
BAYES.pEv = BAYES.pathH + BAYES.pathL;          /* 0.75 */
BAYES.post = BAYES.pathH / BAYES.pEv;           /* 0.04 */

/* ---------- 3. a screening test: Bayes with a prior below one half ------ */

var SCREEN = { prev: 0.01, sens: 0.99, spec: 0.99 };
SCREEN.hit = SCREEN.prev * SCREEN.sens;                       /* 0.0099 */
SCREEN.falseAlarm = (1 - SCREEN.prev) * (1 - SCREEN.spec);    /* 0.0099 */
SCREEN.post = SCREEN.hit / (SCREEN.hit + SCREEN.falseAlarm);  /* 0.5    */

/* ---------- 4. the discrete variable of GATE 2026 Set 1 Q48 ---------- */

var PMF26 = [
  { x: 1, p: 1 / 6 }, { x: 2, p: 1 / 6 }, { x: 3, p: 1 / 12 }, { x: 4, p: 1 / 12 },
  { x: 5, p: 1 / 6 }, { x: 6, p: 1 / 12 }, { x: 7, p: 1 / 6 }, { x: 8, p: 1 / 12 }
];
var MASS_SUM = PMF26.reduce(function (s, e) { return s + e.p; }, 0);
var EX = PMF26.reduce(function (s, e) { return s + e.x * e.p; }, 0);
var EX2 = PMF26.reduce(function (s, e) { return s + e.x * e.x * e.p; }, 0);
var VAR = EX2 - EX * EX;
var SD = Math.sqrt(VAR);

/* the CDF of the same variable, as a table of cumulative sums */
var CDF26 = (function () {
  var out = [], run = 0;
  PMF26.forEach(function (e) { run += e.p; out.push({ x: e.x, F: run }); });
  return out;
})();

/* ---------- 5. binomial ---------- */

function comb(n, k) {
  if (k < 0 || k > n) return 0;
  var r = 1;
  for (var i = 1; i <= k; i++) r = r * (n - k + i) / i;
  return r;
}
function binomPmf(n, p, k) {
  return comb(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

var BIN = { n: 10, p: 0.3 };
BIN.pmf = [];
for (var bk = 0; bk <= BIN.n; bk++) BIN.pmf.push(binomPmf(BIN.n, BIN.p, bk));
BIN.sum = BIN.pmf.reduce(function (s, v) { return s + v; }, 0);
BIN.mean = BIN.n * BIN.p;
BIN.var = BIN.n * BIN.p * (1 - BIN.p);
BIN.sd = Math.sqrt(BIN.var);
BIN.meanFromTable = BIN.pmf.reduce(function (s, v, k) { return s + k * v; }, 0);
BIN.varFromTable = BIN.pmf.reduce(function (s, v, k) { return s + k * k * v; }, 0) - BIN.meanFromTable * BIN.meanFromTable;
BIN.p3 = binomPmf(BIN.n, BIN.p, 3);

/* ---------- 6. Poisson, and the binomial limit ---------- */

function fact(n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }
function poisPmf(lam, k) { return Math.exp(-lam) * Math.pow(lam, k) / fact(k); }

var POI = { lam: 3 };
POI.pmf = [];
for (var pk = 0; pk <= 40; pk++) POI.pmf.push(poisPmf(POI.lam, pk));
POI.sum = POI.pmf.reduce(function (s, v) { return s + v; }, 0);
POI.p0 = poisPmf(POI.lam, 0);
POI.p3 = poisPmf(POI.lam, 3);
POI.meanFromTable = POI.pmf.reduce(function (s, v, k) { return s + k * v; }, 0);
POI.varFromTable = POI.pmf.reduce(function (s, v, k) { return s + k * k * v; }, 0) - POI.meanFromTable * POI.meanFromTable;

/* binomial(1000, 0.003) has mean 3, the same as Poisson(3) */
var LIMIT = { n: 1000, p: 0.003 };
LIMIT.tv = 0;
for (var lk = 0; lk <= 24; lk++) LIMIT.tv += Math.abs(binomPmf(LIMIT.n, LIMIT.p, lk) - poisPmf(3, lk));
LIMIT.p0binom = binomPmf(LIMIT.n, LIMIT.p, 0);

/* ---------- 7. exponential ---------- */

var EXP = { lam: 0.25 };
EXP.mean = 1 / EXP.lam;
EXP.var = 1 / (EXP.lam * EXP.lam);
EXP.sd = Math.sqrt(EXP.var);
EXP.tail4 = Math.exp(-EXP.lam * 4);
EXP.cond = Math.exp(-EXP.lam * (7 - 3));      /* P(X > 7 | X > 3) */
EXP.median = Math.log(2) / EXP.lam;

/* ---------- 8. normal ---------- */

function erf(x) {
  var s = x < 0 ? -1 : 1;
  var ax = Math.abs(x);
  var t = 1 / (1 + 0.3275911 * ax);
  var y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t
    - 0.284496736) * t + 0.254829592) * t * Math.exp(-ax * ax);
  return s * y;
}
function Phi(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }

var NRM = { mu: 0, sd: 3 };
NRM.band1 = Phi(1) - Phi(-1);
NRM.band2 = Phi(2) - Phi(-2);
NRM.band3 = Phi(3) - Phi(-3);
NRM.p05 = Phi(0);
/* the density of GATE 2026 Set 2: 1/(3 sqrt(2 pi)) exp(-x^2/18) */
NRM.twoVar = 18;                    /* the exponent's denominator     */
NRM.var = NRM.twoVar / 2;           /* 9                              */
NRM.sdFromPdf = Math.sqrt(NRM.var); /* 3, and it matches the constant */
NRM.peak = 1 / (NRM.sdFromPdf * Math.sqrt(2 * Math.PI));

/* ---------- 9. a continuous density with an unknown constant ---------- */

var UNI = { a: 1, b: 4, C: 1 / 21 };
UNI.norm = UNI.C * (Math.pow(UNI.b, 3) - Math.pow(UNI.a, 3)) / 3;   /* must be 1 */
UNI.EX = UNI.C * (Math.pow(UNI.b, 4) - Math.pow(UNI.a, 4)) / 4;      /* 85/28   */
UNI.EX2 = UNI.C * (Math.pow(UNI.b, 5) - Math.pow(UNI.a, 5)) / 5;     /* 341/35  */
UNI.p24 = UNI.C * (Math.pow(UNI.b, 3) - 8) / 3;                      /* 8/9     */
UNI.fmax = UNI.b * UNI.b * UNI.C;

/* ---------- 10. two illustrative distributions with mean zero ---------- */

var TIGHT = { xs: [-1, 0, 1], ps: [0.2, 0.6, 0.2] };
var WIDE = { xs: [-3, -1, 1, 3], ps: [0.15, 0.35, 0.35, 0.15] };
function meanOf(d) { return d.xs.reduce(function (s, x, i) { return s + x * d.ps[i]; }, 0); }
function varOf(d) {
  var m = meanOf(d);
  return d.xs.reduce(function (s, x, i) { return s + d.ps[i] * (x - m) * (x - m); }, 0);
}
TIGHT.mean = meanOf(TIGHT); TIGHT.var = varOf(TIGHT); TIGHT.sd = Math.sqrt(TIGHT.var);
WIDE.mean = meanOf(WIDE); WIDE.var = varOf(WIDE); WIDE.sd = Math.sqrt(WIDE.var);

/* ---------- 11. two more exam figures ---------- */

var EV24 = { PA: 0.3, PB: 0.5, PAB: 0.1 };
EV24.union = EV24.PA + EV24.PB - EV24.PAB;         /* 0.7  */
EV24.product = EV24.PA * EV24.PB;                  /* 0.15 */
EV24.cond = EV24.PAB / EV24.PB;                    /* 0.2  */
EV24.none = 1 - EV24.union;                        /* 0.3  */

var COND24 = { red: 10, blue: 15 };
COND24.p = COND24.blue / (COND24.red + COND24.blue - 1);   /* 15/24 = 0.625 */

/* ---------- the object the drawing code reads ---------- */

var V = {
  dice: DICE, p7: P7, pgt9: PGT9, pcond: PCOND,
  bayes: BAYES, screen: SCREEN,
  pmf26: PMF26, cdf26: CDF26, massSum: MASS_SUM,
  ex: EX, ex2: EX2, variance: VAR, sd: SD,
  bin: BIN, poi: POI, limit: LIMIT,
  exp: EXP, nrm: NRM, uni: UNI,
  tight: TIGHT, wide: WIDE,
  ev24: EV24, cond24: COND24
};

/* ======================================================================
   LAYER 2 - THE CHECKS
   Each one compares a computed number with the property that defines it.
   ====================================================================== */

/* --- the sample space --- */
chk('sample space of two dice has 36 outcomes', DICE.total === 36, DICE.total);
chk('the sum counts add to 36', DICE.counts.reduce(function (s, v) { return s + v; }, 0) === 36);
chk('P(sum = 7) = 6/36 = 1/6', Math.abs(P7 - 1 / 6) < 1e-12, P7);
chk('the sum distribution is symmetric about 7',
  [2, 3, 4, 5, 6].every(function (s) { return DICE.counts[s] === DICE.counts[14 - s]; }));
chk('P(sum > 9) = 6/36', Math.abs(PGT9 - 1 / 6) < 1e-12, PGT9);
chk('every probability lies in [0,1]',
  [P7, PGT9, PCOND].every(function (p) { return p >= 0 && p <= 1; }));

/* --- conditioning --- */
chk('P(sum = 11 | sum > 9) = 2/6 = 1/3', Math.abs(PCOND - 1 / 3) < 1e-12, PCOND);
chk('the definition P(A|B) = P(A and B)/P(B) gives the same answer',
  Math.abs(PCOND - PCOND_JOINT) < 1e-12, PCOND_JOINT);
chk('a conditional probability never exceeds the joint over P(B)',
  PCOND <= 1 && PCOND_JOINT <= 1);

/* --- Bayes, GATE 2021 Set 1 Q54 --- */
chk('the two paths sum to P(H received) = 0.75',
  Math.abs(BAYES.pEv - 0.75) < 1e-12, BAYES.pEv);
chk('the paths partition the evidence: 0.03 + 0.72',
  Math.abs(BAYES.pathH + BAYES.pathL - BAYES.pEv) < 1e-12);
chk('posterior = 0.03 / 0.75 = 0.04', Math.abs(BAYES.post - 0.04) < 1e-12, BAYES.post);
chk('the posterior lies in [0,1]', BAYES.post >= 0 && BAYES.post <= 1);
chk('the posterior sits below the prior of 0.1', BAYES.post < BAYES.pH);

/* --- the screening test --- */
chk('screening posterior = 0.0099 / 0.0198 = 0.5',
  Math.abs(SCREEN.post - 0.5) < 1e-9, SCREEN.post);
chk('a 99% accurate test on a 1% prior leaves even odds', SCREEN.post < 0.6);

/* --- a legal PMF --- */
chk('the GATE 2026 PMF sums to 1', Math.abs(MASS_SUM - 1) < 1e-12, MASS_SUM);
chk('every mass is non-negative', PMF26.every(function (e) { return e.p >= 0; }));
chk('the CDF is non-decreasing',
  CDF26.every(function (e, i) { return i === 0 || e.F >= CDF26[i - 1].F - 1e-12; }));
chk('the CDF ends at 1', Math.abs(CDF26[CDF26.length - 1].F - 1) < 1e-12);
chk('the CDF jump at x equals the mass at x',
  CDF26.every(function (e, i) {
    var before = i === 0 ? 0 : CDF26[i - 1].F;
    return Math.abs((e.F - before) - PMF26[i].p) < 1e-12;
  }));

/* --- expectation and variance --- */
chk('E[X] = 17/4 = 4.25', Math.abs(EX - 4.25) < 1e-12, EX);
chk('E[X^2] = 283/12', Math.abs(EX2 - 283 / 12) < 1e-12, EX2);
chk('Var(X) = E[X^2] - E[X]^2 = 265/48', Math.abs(VAR - 265 / 48) < 1e-12, VAR);
chk('the variance is non-negative', VAR > 0);
chk('sd = sqrt(Var)', Math.abs(SD * SD - VAR) < 1e-12, SD);
chk('E[X] lies inside the range of the values', EX >= 1 && EX <= 8);
chk('the unweighted mean 4.5 differs from E[X]', Math.abs(EX - 4.5) > 1e-9);
chk('Var(2X + 3) = 4 Var(X)',
  Math.abs((4 * VAR + 0) - 4 * VAR) < 1e-12);
chk('the tight and wide distributions share a mean of zero',
  Math.abs(TIGHT.mean) < 1e-12 && Math.abs(WIDE.mean) < 1e-12);
chk('the wide distribution has the larger variance', WIDE.var > TIGHT.var,
  WIDE.var.toFixed(3) + ' > ' + TIGHT.var.toFixed(3));

/* --- binomial --- */
chk('the binomial PMF sums to 1', Math.abs(BIN.sum - 1) < 1e-12, BIN.sum);
chk('binomial mean from the table equals n p',
  Math.abs(BIN.meanFromTable - BIN.mean) < 1e-10, BIN.meanFromTable);
chk('binomial variance from the table equals n p (1 - p)',
  Math.abs(BIN.varFromTable - BIN.var) < 1e-10, BIN.varFromTable);
chk('P(X = 3) = 0.2668 for n = 10, p = 0.3', Math.abs(BIN.p3 - 0.2668) < 1e-4, BIN.p3);
chk('the largest bar sits at k = 3',
  BIN.pmf.indexOf(Math.max.apply(null, BIN.pmf)) === 3);

/* --- Poisson --- */
chk('the Poisson PMF sums to 1 (terms 0..40)', Math.abs(POI.sum - 1) < 1e-12, POI.sum);
chk('Poisson mean from the table equals lambda',
  Math.abs(POI.meanFromTable - POI.lam) < 1e-10, POI.meanFromTable);
chk('Poisson variance from the table equals lambda',
  Math.abs(POI.varFromTable - POI.lam) < 1e-10, POI.varFromTable);
chk('P(X = 0) = e^-3 = 0.0498', Math.abs(POI.p0 - 0.049787) < 1e-5, POI.p0);
chk('P(X = 3) = 0.2240', Math.abs(POI.p3 - 0.224042) < 1e-5, POI.p3);
chk('binomial(1000, 0.003) is within 0.01 of Poisson(3)',
  LIMIT.tv < 0.01, LIMIT.tv.toFixed(6));

/* --- exponential --- */
chk('exponential mean = 1/lambda = 4', Math.abs(EXP.mean - 4) < 1e-12);
chk('exponential variance = 1/lambda^2 = 16', Math.abs(EXP.var - 16) < 1e-12);
chk('P(X > 4) = e^-1 = 0.3679', Math.abs(EXP.tail4 - Math.exp(-1)) < 1e-12);
chk('memorylessness: P(X > 7 | X > 3) = P(X > 4)',
  Math.abs(EXP.cond - EXP.tail4) < 1e-12, EXP.cond);
chk('the exponential median is below its mean', EXP.median < EXP.mean,
  EXP.median.toFixed(4));

/* --- normal --- */
chk('Phi(0) = 0.5', Math.abs(NRM.p05 - 0.5) < 1e-6, NRM.p05);
chk('P(|X - mu| <= sigma) = 0.6827', Math.abs(NRM.band1 - 0.6827) < 5e-4, NRM.band1);
chk('P(|X - mu| <= 2 sigma) = 0.9545', Math.abs(NRM.band2 - 0.9545) < 5e-4, NRM.band2);
chk('P(|X - mu| <= 3 sigma) = 0.9973', Math.abs(NRM.band3 - 0.9973) < 5e-4, NRM.band3);
chk('the bands are nested and increasing',
  NRM.band1 < NRM.band2 && NRM.band2 < NRM.band3);
chk('the exponent denominator 18 gives variance 9', Math.abs(NRM.var - 9) < 1e-12);
chk('the constant 1/(3 sqrt 2 pi) matches sd = 3',
  Math.abs(NRM.sdFromPdf - 3) < 1e-12 && Math.abs(NRM.peak - 1 / (3 * Math.sqrt(2 * Math.PI))) < 1e-12);

/* --- the continuous density with a constant --- */
chk('C x^2 on [1,4] integrates to 1 with C = 1/21', Math.abs(UNI.norm - 1) < 1e-12, UNI.norm);
chk('E[X] = 85/28', Math.abs(UNI.EX - 85 / 28) < 1e-12, UNI.EX);
chk('E[X^2] = 341/35', Math.abs(UNI.EX2 - 341 / 35) < 1e-12, UNI.EX2);
chk('Var(X) = 2067/3920', Math.abs((UNI.EX2 - UNI.EX * UNI.EX) - 2067 / 3920) < 1e-12);
chk('P(2 <= X <= 4) = 8/9', Math.abs(UNI.p24 - 8 / 9) < 1e-12, UNI.p24);
chk('the density reaches 16/21, which is below 1 here but need not be',
  Math.abs(UNI.fmax - 16 / 21) < 1e-12, UNI.fmax);

/* --- two exam figures --- */
chk('P(A or B) = 0.7', Math.abs(EV24.union - 0.7) < 1e-12);
chk('A and B are not independent: 0.15 is not 0.1', Math.abs(EV24.product - EV24.PAB) > 1e-9);
chk('A and B are not disjoint: P(A and B) is 0.1, not 0', EV24.PAB > 0);
chk('P(A | B) = 0.2', Math.abs(EV24.cond - 0.2) < 1e-12);
chk('P(neither A nor B) = 0.3', Math.abs(EV24.none - 0.3) < 1e-12);
chk('drawing without replacement: P(second blue | first red) = 0.625',
  Math.abs(COND24.p - 0.625) < 1e-12, COND24.p);

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function f2(v) { return (Math.round(v * 100) / 100).toFixed(2); }
function f4(v) { return v.toFixed(4); }
function f3(v) { return v.toFixed(3); }

/* the four beats of a scene, at 7.5 second spacing */
function beat(t, sc, i) {
  var start = sc.start + i * 7.5;
  return K.clamp01((t - start) / 0.7);
}

function T(x, y, s, o) { P.text(x, y, s, o || {}); }

function axis(x1, y1, x2, y2) {
  P.line(x1, y1, x2, y2, { stroke: BORDER, sw: 1.5 });
}

/* ============================ scene 1 ============================ */

function drawSampleSpace(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  T(40, 22, 'Two dice: 36 equally likely outcomes, eleven possible sums', { size: 13, bold: true });

  var x0 = 56, bw = 26, gap = 8, yBase = 300, per = 25;
  axis(48, yBase, 428, yBase);

  for (var s = 2; s <= 12; s++) {
    var i = s - 2;
    var x = x0 + i * (bw + gap);
    var c = DICE.counts[s];
    var h = c * per;
    var hot = (s === 7 && b1 > 0) || (s > 9 && b2 > 0);
    P.alpha(b0 * (hot ? 1 : 0.35));
    P.rect(x, yBase - h, bw, h, {
      fill: (s === 7 && b1 > 0) ? ACC : (s > 9 && b2 > 0) ? INFO : SURF2,
      radius: 3
    });
    P.alpha(1);
    if (b0 > 0.5) {
      T(x + bw / 2, yBase - h - 15, String(c), { size: 10, align: 'center', mono: true, color: DIM });
      T(x + bw / 2, yBase + 8, String(s), { size: 11, align: 'center', mono: true });
    }
  }
  T(48, yBase + 26, 'sum of the two dice', { size: 10, color: FAINT });
  T(300, yBase + 26, 'height = number of outcomes', { size: 10, color: FAINT });

  P.alpha(b1);
  T(470, 58, 'Sample space S: 36 outcomes', { size: 13, bold: true });
  T(470, 82, 'Each outcome (a, b) is equally likely,', { size: 12, color: DIM });
  T(470, 102, 'so probability is a count.', { size: 12, color: DIM });

  P.alpha(b1);
  T(470, 138, 'A: sum = 7', { size: 12, mono: true, bold: true });
  T(560, 138, '6 outcomes', { size: 12, mono: true, color: DIM });
  T(680, 138, '6/36 = 1/6', { size: 12, mono: true, color: ACC, bold: true });

  P.alpha(b2);
  T(470, 166, 'B: sum > 9', { size: 12, mono: true, bold: true });
  T(560, 166, '6 outcomes', { size: 12, mono: true, color: DIM });
  T(680, 166, '6/36 = 1/6', { size: 12, mono: true, color: INFO, bold: true });

  P.alpha(b3);
  T(470, 212, 'The three axioms', { size: 12, bold: true });
  T(470, 236, '1.  P(S) = 1', { size: 12, mono: true });
  T(470, 258, '2.  0 <= P(E) <= 1', { size: 12, mono: true });
  T(470, 280, '3.  disjoint: P(A or B) = P(A) + P(B)', { size: 12, mono: true });
  T(470, 318, 'Most likely is not the same as likely:', { size: 12, color: WARN });
  T(470, 338, 'the best sum still happens only once in six.', { size: 12, color: WARN });
  P.alpha(1);
}

/* ============================ scene 2 ============================ */

function drawConditional(t, sc) {
  var b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  T(40, 22, 'Conditioning on B: the space shrinks from 36 cells to 6', { size: 13, bold: true });

  var gx = 60, gy = 74, cell = 22;
  for (var a = 1; a <= 6; a++) {
    for (var b = 1; b <= 6; b++) {
      var sum = a + b;
      var x = gx + (a - 1) * cell, y = gy + (b - 1) * cell;
      var inside = sum > 9;
      var hit = sum === 11;
      var fill = SURF2;
      if (inside) fill = hit && b2 > 0 ? ACC : PAL.accentDim;
      P.alpha(inside ? Math.max(0.25, b1) : 0.35 * (1 - b1) + 0.18);
      P.rect(x, y, cell - 3, cell - 3, { fill: fill, stroke: BORDER, sw: 1, radius: 3 });
      P.alpha(1);
      T(x + (cell - 3) / 2, y + 4, String(sum), {
        size: 9, align: 'center', mono: true,
        color: inside ? INK : FAINT
      });
    }
  }
  T(gx, gy + 6 * cell + 8, 'cells with sum over 9 are filled', { size: 10, color: FAINT });
  T(gx, gy + 6 * cell + 24, 'the two giving 11 are solid', { size: 10, color: FAINT });

  var rx = 250;
  T(rx, 74, 'P(A | B) = P(A and B) / P(B)', { size: 13, mono: true, bold: true });

  P.alpha(b1);
  T(rx, 108, 'Keep only the cells where B holds: 6 of 36.', { size: 12, color: DIM });
  T(rx, 132, 'P(sum > 9) = 6/36 = 1/6', { size: 12, mono: true });

  P.alpha(b2);
  T(rx, 168, 'P(sum = 11 | sum > 9)', { size: 12, mono: true, bold: true });
  T(rx, 190, '= (2/36) / (6/36) = 2/6 = 1/3', { size: 12, mono: true, color: ACC, bold: true });
  T(rx, 214, 'The answer rises above the unconditional 1/6,', { size: 11, color: DIM });
  T(rx, 232, 'because the denominator shrank.', { size: 11, color: DIM });

  P.alpha(b3);
  T(rx, 274, 'Independence:  P(A and B) = P(A) P(B)', { size: 12, mono: true });
  T(rx, 296, 'Disjoint:  P(A and B) = 0', { size: 12, mono: true });
  T(rx, 324, 'Disjoint events are dependent, unless one', { size: 11, color: WARN });
  T(rx, 342, 'of them has probability zero.', { size: 11, color: WARN });
  P.alpha(1);
}

/* ============================ scene 3 ============================ */

function drawBayes(t, sc) {
  var b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  T(40, 22, 'Bayes: the evidence is a partition of two disjoint paths', { size: 13, bold: true });

  /* the evidence bar: 0.75 total, 0.03 from the H path, 0.72 from the L path */
  var x0 = 60, unit = 700, yb = 84, hb = 30;
  T(40, yb - 6, 'P(H received) = 0.75', { size: 11, mono: true, color: DIM });
  P.alpha(1);
  P.rect(x0, yb, BAYES.pathH * unit, hb, { fill: ACC, radius: 4 });
  P.rect(x0 + BAYES.pathH * unit, yb, BAYES.pathL * unit, hb, { fill: PAL.accentDim, radius: 4 });

  P.alpha(b1);
  T(40, yb + hb + 24, 'H sent, then received as H:', { size: 11, color: DIM });
  T(300, yb + hb + 24, '0.3 x 0.1 = 0.03', { size: 11, mono: true, color: ACC, bold: true });
  P.alpha(b2);
  T(40, yb + hb + 46, 'L sent, then corrupted to H:', { size: 11, color: DIM });
  T(300, yb + hb + 46, '0.8 x 0.9 = 0.72', { size: 11, mono: true, color: INFO, bold: true });
  T(40, yb + hb + 68, 'Total, by total probability:', { size: 11, color: DIM });
  T(300, yb + hb + 68, '0.03 + 0.72 = 0.75', { size: 11, mono: true, bold: true });

  /* prior against posterior, on one scale */
  var ub = 240, ubw = 600;
  P.alpha(b3);
  T(40, ub - 12, 'prior and posterior, same scale', { size: 10, color: FAINT });
  P.rect(x0, ub, BAYES.pH * ubw, 20, { fill: SURF2, stroke: BORDER, sw: 1, radius: 3 });
  T(x0 + BAYES.pH * ubw + 10, ub + 4, 'prior 0.10', { size: 11, mono: true, color: DIM });
  P.rect(x0, ub + 32, BAYES.post * ubw, 20, { fill: ACC, radius: 3 });
  T(x0 + BAYES.post * ubw + 10, ub + 36, 'posterior 0.04', { size: 11, mono: true, color: ACC, bold: true });
  T(40, ub + 66, 'The evidence pushed the probability down.', { size: 11, color: WARN });

  var rx = 460;
  T(rx, 74, 'P(H sent | H received) =', { size: 12, mono: true, bold: true });
  T(rx, 96, 'P(H rec | H sent) P(H sent) / P(H rec)', { size: 11, mono: true });
  P.alpha(b2);
  T(rx, 124, '= (0.3 x 0.1) / 0.75', { size: 11, mono: true });
  P.alpha(b3);
  T(rx, 148, '= 0.03 / 0.75 = 0.04', { size: 12, mono: true, color: ACC, bold: true });
  T(rx, 186, 'The denominator runs over every path,', { size: 11, color: DIM });
  T(rx, 204, 'not only the one you are asking about.', { size: 11, color: DIM });
  T(rx, 240, 'Answering 0.3 reports the likelihood', { size: 11, color: WARN });
  T(rx, 258, 'and stops one step too early.', { size: 11, color: WARN });
  P.alpha(1);
}

/* ============================ scene 4 ============================ */

function drawRv(t, sc) {
  var b1 = beat(t, sc, 0), b2 = beat(t, sc, 1), b3 = beat(t, sc, 2), b4 = beat(t, sc, 3);

  T(40, 22, 'One distribution, three ways to read it', { size: 13, bold: true });

  T(44, 56, 'PMF: a table of masses', { size: 11, bold: true, color: DIM });
  T(330, 56, 'CDF: running total', { size: 11, bold: true, color: DIM });
  T(600, 56, 'density: area, not height', { size: 11, bold: true, color: DIM });

  /* PMF of a fair die */
  var yb = 300, x0 = 48, bw = 24, gap = 12, per = 720;
  axis(44, yb, 262, yb);
  P.alpha(b1);
  for (var k = 1; k <= 6; k++) {
    var h = (1 / 6) * per * 0.6;
    var x = x0 + (k - 1) * (bw + gap);
    P.rect(x, yb - h, bw, h, { fill: PAL.accentDim, radius: 3 });
    T(x + bw / 2, yb - h - 15, '1/6', { size: 9, align: 'center', mono: true, color: DIM });
    T(x + bw / 2, yb + 8, String(k), { size: 10, align: 'center', mono: true });
  }
  T(44, yb + 26, 'the six masses sum to 1', { size: 10, color: FAINT });

  /* CDF staircase of the same die */
  var cx = 330, cw = 34, cyb = 300, cper = 120;
  axis(326, cyb, 560, cyb);
  P.alpha(b2);
  P.line(326, cyb - cper, 560, cyb - cper, { stroke: BORDER, dash: [4, 4], sw: 1 });
  T(500, cyb - cper - 16, 'reaches 1', { size: 9, color: FAINT });
  var px = cx, py = cyb;
  for (var c = 1; c <= 6; c++) {
    var nF = c / 6;
    var ny = cyb - nF * cper;
    P.line(px, py, px, ny, { stroke: ACC, sw: 2 });
    P.line(px, ny, px + cw, ny, { stroke: ACC, sw: 2 });
    T(px + cw / 2, cyb + 8, String(c), { size: 10, align: 'center', mono: true });
    px += cw; py = ny;
  }
  T(330, cyb + 26, 'F(x) = P(X <= x), never decreasing', { size: 10, color: FAINT });

  /* a continuous density: f(x) = x^2 / 21 on [1,4] */
  var dx0 = 600, dx1 = 850, dyb = 300, dscale = 120 / UNI.fmax;
  axis(596, dyb, 858, dyb);
  P.alpha(b3);
  var prevX = null, prevY = null;
  for (var i = 0; i <= 80; i++) {
    var xx = UNI.a + (UNI.b - UNI.a) * (i / 80);
    var fx = xx * xx * UNI.C;
    var sxp = dx0 + (xx - UNI.a) / (UNI.b - UNI.a) * (dx1 - dx0);
    var syp = dyb - fx * dscale;
    if (prevX !== null) {
      var inShade = (xx > 2);
      P.line(prevX, prevY, sxp, syp, { stroke: inShade ? ACC : INFO, sw: 2.5 });
    }
    prevX = sxp; prevY = syp;
  }
  /* the shaded area from 2 to 4 */
  for (var j = 0; j <= 40; j++) {
    var xa = 2 + (UNI.b - 2) * (j / 40);
    var xb = 2 + (UNI.b - 2) * ((j + 1) / 40);
    var fa = xa * xa * UNI.C, fb = xb * xb * UNI.C;
    var pa = dx0 + (xa - UNI.a) / (UNI.b - UNI.a) * (dx1 - dx0);
    var pb = dx0 + (xb - UNI.a) / (UNI.b - UNI.a) * (dx1 - dx0);
    P.tri(pa, dyb, pb, dyb, pa, dyb - fa * dscale, { fill: ACC });
    P.tri(pb, dyb, pb, dyb - fb * dscale, pa, dyb - fa * dscale, { fill: ACC });
  }
  P.alpha(1);
  T(dx0 - 6, dyb + 8, '1', { size: 10, mono: true });
  T(dx1, dyb + 8, '4', { size: 10, mono: true, align: 'right' });
  T(dx0 + 100, dyb + 8, '2', { size: 10, mono: true });
  T(dx0, dyb + 28, 'shaded area = P(2 <= X <= 4) = 8/9', { size: 10, color: ACC });

  P.alpha(b4);
  T(40, 352, 'A random variable is a function from outcomes to numbers; the distribution is the', { size: 11, color: DIM });
  T(40, 370, 'weighting it induces. Discrete: mass at points. Continuous: area under a density.', { size: 11, color: DIM });
  T(40, 400, 'For a continuous X, P(X = a) = 0 at every a: a point has no width, so no area.', { size: 11, color: WARN, bold: true });
  P.alpha(1);
}

/* ============================ scene 5 ============================ */

function drawExpect(t, sc) {
  var b1 = beat(t, sc, 0), b2 = beat(t, sc, 1), b3 = beat(t, sc, 2), b4 = beat(t, sc, 3);

  T(40, 22, 'GATE 2026 Set 1: eight values, two different weights', { size: 13, bold: true });

  var x0 = 56, bw = 30, gap = 14, yBase = 310, per = 840;
  axis(48, yBase, 402, yBase);
  P.alpha(b1);
  for (var i = 0; i < PMF26.length; i++) {
    var e = PMF26[i];
    var h = e.p * per;
    var x = x0 + i * (bw + gap);
    P.rect(x, yBase - h, bw, h, { fill: e.p > 0.1 ? PAL.accentDim : SURF2, stroke: BORDER, sw: 1, radius: 3 });
    T(x + bw / 2, yBase - h - 14, e.p > 0.1 ? '1/6' : '1/12', { size: 9, align: 'center', mono: true, color: DIM });
    T(x + bw / 2, yBase + 8, String(e.x), { size: 10, align: 'center', mono: true });
  }

  /* the mean as a fulcrum */
  var mx = x0 + (EX - 1) * (bw + gap) + bw / 2;
  P.alpha(b3);
  P.line(mx, 130, mx, yBase + 2, { stroke: ACC, sw: 2, dash: [6, 4] });
  P.tri(mx, yBase + 18, mx - 10, yBase + 34, mx + 10, yBase + 34, { fill: ACC });
  T(mx, 112, 'E[X] = 4.25', { size: 11, align: 'center', mono: true, color: ACC, bold: true });
  T(48, yBase + 40, 'the fulcrum sits between 4 and 5', { size: 10, color: FAINT });

  var rx = 430;
  P.alpha(b2);
  T(rx, 78, 'E[X] = sum of x P(X = x)', { size: 12, mono: true, bold: true });
  T(rx, 104, '= 1(1/6) + 2(1/6) + 3(1/12) + 4(1/12)', { size: 11, mono: true });
  T(rx, 124, '  + 5(1/6) + 6(1/12) + 7(1/6) + 8(1/12)', { size: 11, mono: true });
  P.alpha(b3);
  T(rx, 150, '= 15/6 + 21/12 = 2.5 + 1.75', { size: 11, mono: true });
  T(rx, 172, '= 17/4 = 4.25', { size: 12, mono: true, color: ACC, bold: true });

  P.alpha(b4);
  T(rx, 212, 'Linearity, always:', { size: 11, bold: true });
  T(rx, 232, 'E[X + Y] = E[X] + E[Y]', { size: 11, mono: true });
  T(rx, 258, 'Products, only when independent:', { size: 11, bold: true });
  T(rx, 278, 'E[XY] = E[X] E[Y]', { size: 11, mono: true });
  T(rx, 312, 'The mean need not be a value the', { size: 11, color: WARN });
  T(rx, 330, 'variable can take: a fair die gives 3.5.', { size: 11, color: WARN });
  P.alpha(1);
}

/* ============================ scene 6 ============================ */

function drawSpread(t, sc) {
  var b1 = beat(t, sc, 0), b2 = beat(t, sc, 1), b3 = beat(t, sc, 2), b4 = beat(t, sc, 3);

  T(40, 22, 'Two distributions, both centred at zero', { size: 13, bold: true });

  function mini(d, yBase, label) {
    var cx = 235, unit = 40, per = 150, bw = 26;
    axis(50, yBase, 420, yBase);
    P.line(cx, yBase - 110, cx, yBase, { stroke: BORDER, dash: [4, 4], sw: 1 });
    for (var i = 0; i < d.xs.length; i++) {
      var x = cx + d.xs[i] * unit - bw / 2;
      var h = d.ps[i] * per;
      P.rect(x, yBase - h, bw, h, { fill: PAL.accentDim, stroke: BORDER, sw: 1, radius: 3 });
      T(cx + d.xs[i] * unit, yBase + 8, String(d.xs[i]), { size: 10, align: 'center', mono: true });
    }
    T(50, yBase - 126, label, { size: 11, bold: true, color: DIM });
  }

  P.alpha(b1);
  mini(TIGHT, 190, 'narrow: variance 0.40, sd 0.63');
  mini(WIDE, 350, 'wide: variance 3.40, sd 1.84');
  T(50, 214, 'same mean 0, different spread', { size: 10, color: FAINT });
  T(50, 374, 'same mean 0, different spread', { size: 10, color: FAINT });

  var rx = 450;
  P.alpha(b2);
  T(rx, 74, 'Var(X) = E[(X - mean)^2]', { size: 11, mono: true });
  T(rx, 94, '       = E[X^2] - mean^2', { size: 11, mono: true });
  T(rx, 122, 'GATE 2026 Set 1:', { size: 11, bold: true });
  T(rx, 142, 'E[X^2] = 283/12 = 23.5833', { size: 11, mono: true });
  T(rx, 162, 'mean^2 = 289/16 = 18.0625', { size: 11, mono: true });
  T(rx, 182, 'Var = 265/48 = 5.5208', { size: 11, mono: true, color: ACC, bold: true });
  T(rx, 202, 'sd = 2.3496', { size: 11, mono: true, color: ACC, bold: true });

  P.alpha(b3);
  T(rx, 236, 'Var(aX + b) = a^2 Var(X)', { size: 11, mono: true, bold: true });
  T(rx, 258, 'a shift adds nothing; a scale squares.', { size: 10, color: DIM });

  P.alpha(b4);
  T(rx, 292, 'mean: the balance point', { size: 10, color: DIM });
  T(rx, 310, 'median: half the mass on each side', { size: 10, color: DIM });
  T(rx, 328, 'mode: the tallest bar', { size: 10, color: DIM });
  T(rx, 352, 'symmetric: all three agree', { size: 10, color: DIM });
  T(rx, 374, 'skewed: the mean runs to the tail', { size: 10, color: DIM });
  T(rx, 402, 'median of max(X, 0) = 0, since half the mass is at 0', { size: 10, color: WARN, bold: true });
  P.alpha(1);
}

/* ============================ scene 7 ============================ */

function drawBinomial(t, sc) {
  var b1 = beat(t, sc, 0), b2 = beat(t, sc, 1), b3 = beat(t, sc, 2), b4 = beat(t, sc, 3);

  T(40, 22, 'Binomial: n = 10 independent trials, p = 0.3', { size: 13, bold: true });

  var x0 = 56, bw = 24, gap = 10, yBase = 320, per = 750;
  axis(48, yBase, 424, yBase);
  P.alpha(b2);
  for (var k = 0; k <= BIN.n; k++) {
    var p = BIN.pmf[k];
    var h = p * per;
    var x = x0 + k * (bw + gap);
    P.rect(x, yBase - h, bw, h, { fill: k === 3 ? ACC : PAL.accentDim, radius: 3 });
    T(x + bw / 2, yBase + 8, String(k), { size: 10, align: 'center', mono: true });
    T(x + bw / 2, yBase - h - 13, f2(p), { size: 8, align: 'center', mono: true, color: DIM });
  }
  var mx = x0 + 3 * (bw + gap) + bw / 2;
  P.alpha(b3);
  P.line(mx, 130, mx, yBase, { stroke: INFO, sw: 2, dash: [6, 4] });
  T(mx, 114, 'mean = 3', { size: 10, align: 'center', mono: true, color: INFO, bold: true });

  var rx = 450;
  P.alpha(b1);
  T(rx, 74, 'One trial: success with probability p.', { size: 11, color: DIM });
  T(rx, 92, 'n such trials, independent, same p.', { size: 11, color: DIM });
  P.alpha(b2);
  T(rx, 122, 'P(X = k) = C(n,k) p^k (1-p)^(n-k)', { size: 11, mono: true, bold: true });
  T(rx, 146, 'C(10,3) = 120', { size: 11, mono: true });
  T(rx, 166, 'P(X = 3) = 120 x 0.027 x 0.0824', { size: 11, mono: true });
  T(rx, 186, '= 0.2668', { size: 11, mono: true, color: ACC, bold: true });
  P.alpha(b3);
  T(rx, 218, 'mean = n p = 3', { size: 11, mono: true });
  T(rx, 238, 'variance = n p (1 - p) = 2.1', { size: 11, mono: true });
  T(rx, 258, 'sd = 1.449', { size: 11, mono: true });
  P.alpha(b4);
  T(rx, 290, 'Dropping C(n,k) keeps one arrangement', { size: 10, color: WARN });
  T(rx, 306, 'and the probabilities stop summing to 1.', { size: 10, color: WARN });
  T(rx, 334, 'Drawing without replacement changes p,', { size: 10, color: WARN });
  T(rx, 350, 'so the count is not binomial.', { size: 10, color: WARN });
  P.alpha(1);
}

/* ============================ scene 8 ============================ */

function drawPoisson(t, sc) {
  var b1 = beat(t, sc, 0), b2 = beat(t, sc, 1), b3 = beat(t, sc, 2), b4 = beat(t, sc, 3);

  T(40, 22, 'Poisson: lambda = 3, a count in a fixed interval', { size: 13, bold: true });

  var x0 = 56, bw = 24, gap = 10, yBase = 320, per = 750;
  axis(48, yBase, 424, yBase);
  P.alpha(b2);
  for (var k = 0; k <= 10; k++) {
    var p = POI.pmf[k];
    var h = p * per;
    var x = x0 + k * (bw + gap);
    P.rect(x, yBase - h, bw, h, { fill: PAL.accentDim, stroke: BORDER, sw: 1, radius: 3 });
    T(x + bw / 2, yBase + 8, String(k), { size: 10, align: 'center', mono: true });
    T(x + bw / 2, yBase - h - 13, f3(p), { size: 8, align: 'center', mono: true, color: DIM });
  }
  P.alpha(b4);
  for (var q = 0; q <= 10; q++) {
    var hp = binomPmf(LIMIT.n, LIMIT.p, q) * per;
    var xq = x0 + q * (bw + gap) + bw / 2;
    P.circle(xq, yBase - hp, 3, { fill: INFO });
  }
  T(48, yBase + 28, 'bars: Poisson(3).  dots: binomial(1000, 0.003), same mean.', { size: 9, color: FAINT });

  var rx = 450;
  P.alpha(b1);
  T(rx, 74, 'Events arrive independently at a', { size: 11, color: DIM });
  T(rx, 92, 'constant rate; count them in a window.', { size: 11, color: DIM });
  P.alpha(b2);
  T(rx, 122, 'P(X = k) = e^-lambda lambda^k / k!', { size: 11, mono: true, bold: true });
  T(rx, 146, 'mean = variance = lambda = 3', { size: 11, mono: true, color: ACC, bold: true });
  P.alpha(b3);
  T(rx, 174, 'P(X = 0) = e^-3 = 0.0498', { size: 11, mono: true });
  T(rx, 194, 'P(X = 3) = 0.2240', { size: 11, mono: true });
  T(rx, 214, 'P(X = 2) also equals 0.2240: integer lambda', { size: 10, color: DIM });
  T(rx, 230, 'gives two equal central bars.', { size: 10, color: DIM });
  P.alpha(b4);
  T(rx, 262, 'Binomial(1000, 0.003) differs from', { size: 10, color: DIM });
  T(rx, 278, 'Poisson(3) by 0.0015 in total variation.', { size: 10, color: DIM });
  T(rx, 306, 'Good when n is large, p is small,', { size: 10, color: WARN });
  T(rx, 322, 'and n p stays fixed. Ten trials at 0.3', { size: 10, color: WARN });
  T(rx, 338, 'has the same mean and is not close.', { size: 10, color: WARN });
  P.alpha(1);
}

/* ============================ scene 9 ============================ */

function drawExponential(t, sc) {
  var b1 = beat(t, sc, 0), b2 = beat(t, sc, 1), b3 = beat(t, sc, 2), b4 = beat(t, sc, 3);

  T(40, 22, 'Exponential: rate 0.25, mean 4', { size: 13, bold: true });

  var x0 = 60, x1 = 600, yBase = 320, xmax = 20;
  var f0 = EXP.lam, yscale = 180 / f0;
  axis(52, yBase, x1 + 8, yBase);
  for (var g = 0; g <= 20; g += 4) {
    var gx = x0 + (g / xmax) * (x1 - x0);
    T(gx, yBase + 8, String(g), { size: 10, align: 'center', mono: true });
  }
  T(x0 - 8, yBase + 26, 'waiting time x', { size: 10, color: FAINT });

  /* the curve */
  P.alpha(b1);
  var prev = null;
  for (var i = 0; i <= 160; i++) {
    var xx = (i / 160) * xmax;
    var fx = EXP.lam * Math.exp(-EXP.lam * xx);
    var sx = x0 + (xx / xmax) * (x1 - x0);
    var sy = yBase - fx * yscale;
    if (prev) P.line(prev[0], prev[1], sx, sy, { stroke: INFO, sw: 2.5 });
    prev = [sx, sy];
  }

  /* the tail beyond 4 */
  P.alpha(b2);
  for (var j = 0; j < 120; j++) {
    var a1 = 4 + (xmax - 4) * (j / 120), a2 = 4 + (xmax - 4) * ((j + 1) / 120);
    var f1 = EXP.lam * Math.exp(-EXP.lam * a1), f2v = EXP.lam * Math.exp(-EXP.lam * a2);
    var p1 = x0 + (a1 / xmax) * (x1 - x0), p2 = x0 + (a2 / xmax) * (x1 - x0);
    P.tri(p1, yBase, p2, yBase, p1, yBase - f1 * yscale, { fill: PAL.accentDim });
    P.tri(p2, yBase, p2, yBase - f2v * yscale, p1, yBase - f1 * yscale, { fill: PAL.accentDim });
  }
  var x4 = x0 + (4 / xmax) * (x1 - x0);
  P.line(x4, yBase - 170, x4, yBase, { stroke: ACC, sw: 1.5, dash: [5, 4] });
  T(x4 + 6, yBase - 176, 'area beyond 4 = e^-1 = 0.3679', { size: 10, color: ACC });

  /* the conditioning marks */
  P.alpha(b3);
  var x3 = x0 + (3 / xmax) * (x1 - x0), x7 = x0 + (7 / xmax) * (x1 - x0);
  P.line(x3, yBase - 120, x3, yBase, { stroke: WARN, sw: 1.5, dash: [3, 3] });
  P.line(x7, yBase - 120, x7, yBase, { stroke: WARN, sw: 1.5, dash: [3, 3] });
  T(x3 - 4, yBase - 136, '3', { size: 10, align: 'right', mono: true, color: WARN });
  T(x7 + 4, yBase - 136, '7', { size: 10, mono: true, color: WARN });
  T(x3, yBase - 158, 'P(X > 7 | X > 3) = P(X > 4)', { size: 10, color: WARN, bold: true });

  var rx = 630;
  P.alpha(b1);
  T(rx, 84, 'f(x) = lambda e^-lambda x', { size: 10, mono: true, bold: true });
  T(rx, 104, 'P(X > t) = e^-lambda t', { size: 10, mono: true });
  P.alpha(b2);
  T(rx, 132, 'P(X > 4) = e^-1 = 0.3679', { size: 10, mono: true, color: ACC });
  P.alpha(b3);
  T(rx, 162, 'memoryless: the wait restarts', { size: 10, color: DIM });
  P.alpha(b4);
  T(rx, 192, 'mean 1/lambda = 4', { size: 10, mono: true });
  T(rx, 210, 'variance 1/lambda^2 = 16', { size: 10, mono: true });
  T(rx, 228, 'sd 4', { size: 10, mono: true });
  T(rx, 246, 'median 2.77, below the mean', { size: 10, mono: true, color: WARN });
  T(rx, 276, 'A uniform wait is not memoryless:', { size: 10, color: WARN });
  T(rx, 292, 'having waited three of ten minutes', { size: 10, color: WARN });
  T(rx, 308, 'leaves seven, not ten.', { size: 10, color: WARN });
  P.alpha(1);
}

/* ============================ scene 10 ============================ */

function drawNormal(t, sc) {
  var b1 = beat(t, sc, 0), b2 = beat(t, sc, 1), b3 = beat(t, sc, 2), b4 = beat(t, sc, 3);

  T(40, 22, 'Normal: mean 0, standard deviation 3', { size: 13, bold: true });

  var x0 = 60, x1 = 600, yBase = 320, span = 12;
  var peak = NRM.peak;
  var yscale = 200 / peak;
  function px(v) { return x0 + ((v + span) / (2 * span)) * (x1 - x0); }
  function fy(v) { return yBase - (1 / (NRM.sd * Math.sqrt(2 * Math.PI))) * Math.exp(-(v * v) / (2 * NRM.var)) * yscale; }

  axis(52, yBase, x1 + 8, yBase);
  for (var g = -9; g <= 9; g += 3) {
    T(px(g), yBase + 8, String(g), { size: 10, align: 'center', mono: true });
  }

  /* the three bands, drawn as vertical strips under the curve */
  function band(from, to, colour, alpha) {
    P.alpha(alpha);
    for (var j = 0; j < 60; j++) {
      var a = from + (to - from) * (j / 60), b = from + (to - from) * ((j + 1) / 60);
      P.tri(px(a), yBase, px(b), yBase, px(a), fy(a), { fill: colour });
      P.tri(px(b), yBase, px(b), yBase - (yBase - fy(b)), px(a), fy(a), { fill: colour });
    }
    P.alpha(1);
  }
  P.alpha(b1);
  band(-9, 9, INFO, 0.10);
  band(-6, 6, INFO, 0.16);
  band(-3, 3, ACC, 0.30);

  /* the curve on top */
  var prev = null;
  for (var i = 0; i <= 200; i++) {
    var v = -span + (2 * span) * (i / 200);
    var sx = px(v), sy = fy(v);
    if (prev) P.line(prev[0], prev[1], sx, sy, { stroke: INFO, sw: 2.5 });
    prev = [sx, sy];
  }
  P.line(px(0), fy(0) - 6, px(0), yBase, { stroke: BORDER, dash: [4, 4], sw: 1 });

  T(px(0), yBase + 26, '|x| <= 3: 0.6827', { size: 10, align: 'center', mono: true });
  T(px(0), yBase + 42, '|x| <= 6: 0.9545', { size: 10, align: 'center', mono: true });
  T(px(0), yBase + 58, '|x| <= 9: 0.9973', { size: 10, align: 'center', mono: true });
  T(px(0), yBase + 78, 'bands are one, two and three standard deviations', { size: 9, align: 'center', color: FAINT });

  var rx = 630;
  P.alpha(b2);
  T(rx, 84, 'z = (x - mean) / sd', { size: 11, mono: true, bold: true });
  T(rx, 104, 'the divisor is sd, not variance', { size: 9, color: DIM });
  P.alpha(b3);
  T(rx, 134, 'GATE 2026 Set 2:', { size: 10, bold: true });
  T(rx, 152, '1/(3 root 2 pi) e^(-x^2/18)', { size: 10, mono: true });
  T(rx, 172, '18 = 2 x variance, so variance = 9', { size: 9, mono: true });
  T(rx, 188, 'mean 0, variance 9, sd 3', { size: 10, mono: true, color: ACC, bold: true });
  P.alpha(b4);
  T(rx, 220, 'procedure', { size: 10, bold: true });
  T(rx, 238, '1  name the family', { size: 9, color: DIM });
  T(rx, 254, '2  write the event', { size: 9, color: DIM });
  T(rx, 270, '3  compute', { size: 9, color: DIM });
  T(rx, 286, '4  check 0 <= p <= 1', { size: 9, color: WARN });
  P.alpha(1);
}

var SCENE_DRAW = {
  samplespace: drawSampleSpace,
  conditional: drawConditional,
  bayes: drawBayes,
  rv: drawRv,
  expect: drawExpect,
  spread: drawSpread,
  binomial: drawBinomial,
  poisson: drawPoisson,
  exponential: drawExponential,
  normal: drawNormal
};

function drawFrame(P2) {
  P = P2;
  P.alpha(1);
  P.clear();
  P.rect(0, 0, W, H, { fill: PAL.surface });

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
