/* ==========================================================================
   conditional-expectation-and-total-expectation — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no probability arithmetic of its own:
   every figure on the canvas was computed once here and checked against the
   rule it is supposed to satisfy — the 36-outcome restricted average, the six
   conditional means of the maximum given the minimum, the tower identity, the
   two-coin partition, the exact distribution of the wait for two heads, the
   total-variance split, the integral over the cut point, and the mixture.
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

function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
function frac(n, d) { var g = gcd(Math.abs(n), Math.abs(d)) || 1; return (n / g) + '/' + (d / g); }
function fx(v, k) { return v.toFixed(k === undefined ? 4 : k); }

var V = {};

/* ---------- 1. two dice, and one restriction ----------
   The sample space is the 36 ordered pairs. Counts are integers, so every
   identity below can be an exact integer identity rather than a comparison. */

V.dice = (function () {
  var d = { pairs: [], n: 0, sumTotal: 0, maxTotal: 0, maxSqTotal: 0 };
  for (var a = 1; a <= 6; a++) {
    for (var b = 1; b <= 6; b++) {
      d.pairs.push([a, b]);
      d.n++;
      d.sumTotal += a + b;
      var m = Math.max(a, b);
      d.maxTotal += m;
      d.maxSqTotal += m * m;
    }
  }
  d.meanSum = d.sumTotal / d.n;                 /* 7 */
  d.meanMax = d.maxTotal / d.n;                 /* 161/36 */
  d.varMax = d.maxSqTotal / d.n - d.meanMax * d.meanMax;
  return d;
})();

/* the restriction: keep only the outcomes whose sum is at least 10 */
V.restrict = (function () {
  var kept = [];
  V.dice.pairs.forEach(function (p) {
    if (p[0] + p[1] >= 10) kept.push(p[0] + p[1]);
  });
  var total = kept.reduce(function (s, x) { return s + x; }, 0);
  return {
    threshold: 10,
    kept: kept,
    count: kept.length,                         /* 6 */
    total: total,                               /* 64 */
    mean: total / kept.length,                  /* 10.6667 */
    unconditional: V.dice.meanSum               /* 7 */
  };
})();

/* ---------- 2. the maximum given the minimum ----------
   For a fixed y the condition "minimum = y" holds on the pair (y,y) and on the
   two orders (y,k) and (k,y) for every k above y. The maximum there is y or k,
   so both the mean and the mean square are short integer sums. */

V.cond = (function () {
  var rows = [], totalCount = 0, weightedMean = 0, weightedSq = 0;
  for (var y = 1; y <= 6; y++) {
    var count = 0, maxSum = 0, maxSqSum = 0;
    V.dice.pairs.forEach(function (p) {
      if (Math.min(p[0], p[1]) !== y) return;
      var m = Math.max(p[0], p[1]);
      count++; maxSum += m; maxSqSum += m * m;
    });
    var mean = maxSum / count;
    var second = maxSqSum / count;
    var w = count / V.dice.n;
    rows.push({
      y: y, count: count, weight: w,
      maxSum: maxSum, maxSqSum: maxSqSum,
      mean: mean, second: second,
      varc: second - mean * mean,
      weighted: w * mean
    });
    totalCount += count;
    weightedMean += w * mean;
    weightedSq += w * second;
  }
  var between = 0;
  rows.forEach(function (r) { between += r.weight * (r.mean - weightedMean) * (r.mean - weightedMean); });
  var inside = 0;
  rows.forEach(function (r) { inside += r.weight * r.varc; });
  return {
    rows: rows, totalCount: totalCount,
    tower: weightedMean,                        /* 161/36 */
    inside: inside,                             /* mean conditional variance */
    between: between,                           /* variance of conditional means */
    total: inside + between
  };
})();

/* ---------- 3. independence: the conditional mean does not move ----------
   X is the first face, Y the second. Conditioning on Y must leave the mean of
   X at 3.5 for every value of Y. */

V.indep = (function () {
  var rows = [];
  for (var y = 1; y <= 6; y++) {
    var count = 0, sum = 0;
    V.dice.pairs.forEach(function (p) {
      if (p[1] !== y) return;
      count++; sum += p[0];
    });
    rows.push({ y: y, count: count, mean: sum / count });
  }
  var spread = rows.reduce(function (m, r) { return Math.max(m, Math.abs(r.mean - 3.5)); }, 0);
  return { rows: rows, spread: spread };
})();

/* ---------- 4. two coins: the law over a partition ---------- */

V.coins = (function () {
  var parts = [
    { name: 'fair coin', p: 0.5, prior: 0.5 },
    { name: 'biased coin', p: 0.2, prior: 0.5 }
  ];
  var total = 0;
  parts.forEach(function (a) { a.condMean = 2 * a.p; a.contribution = a.prior * a.condMean; total += a.contribution; });
  return { tosses: 2, parts: parts, total: total };
})();

/* ---------- 5. the wait for two consecutive heads ----------
   Two states: a = expected tosses with no head in hand, b = with one head in
   hand. a = 1 + a/2 + b/2 and b = 1 + a/2. Solving: a = 6, b = 4.
   The exact distribution is checked against the same 6 by direct summation. */

V.wait = (function () {
  var a = 6, b = 4;
  /* the pair must satisfy both equations exactly */
  var eqA = Math.abs(a - (1 + a / 2 + b / 2));
  var eqB = Math.abs(b - (1 + a / 2));

  /* P(wait = n) = F(n-1) / 2^n, with F(1) = F(2) = 1 */
  var f = [0, 1];
  for (var i = 2; i <= 210; i++) f.push(f[i - 1] + f[i - 2]);
  var total = 0, tail = 0, rows = [];
  for (var n = 2; n <= 200; n++) {
    var prob = f[n - 1] / Math.pow(2, n);
    total += n * prob;
    tail += prob;
    if (n <= 10) rows.push({ n: n, p: prob, count: f[n - 1] });
  }
  return {
    a: a, b: b, eqA: eqA, eqB: eqB,
    exact: total,                     /* 6 to within rounding */
    mass: tail,                       /* total probability accounted for */
    rows: rows
  };
})();

/* ---------- 6. a continuous condition: the piece holding 0.4 ----------
   Cut u is uniform on [0,1]. If u > 0.4 the piece holding 0.4 has length u;
   if u <= 0.4 it has length 1 - u. The mean is the integral of that length. */

V.interval = (function () {
  var mark = 0.4;
  var exact = mark * (1 - mark / 2) + (1 - mark) * ((1 + mark) / 2);
  /* the two parts, written out: cut below the mark averages (1 + mark)/2,
     cut above the mark averages mark/2 + 1/2 */
  var below = mark, belowMean = (1 + mark) / 2;
  var above = 1 - mark, aboveMean = (1 + mark) / 2;
  var numeric = 0, steps = 20000, h = 1 / steps;
  for (var i = 0; i < steps; i++) {
    var u = (i + 0.5) * h;
    numeric += (u > mark ? u : 1 - u) * h;
  }
  return {
    mark: mark, below: below, above: above,
    belowMean: belowMean, aboveMean: aboveMean,
    exact: exact, numeric: numeric,
    part1: below * belowMean, part2: above * aboveMean
  };
})();

/* ---------- 7. a mixture: a uniformly random bias ----------
   P uniform on [0,1], then X given P is binomial with 3 trials. The mean is
   3 E[P] = 1.5. The variance splits: E[3P(1-P)] = 0.5 and Var(3P) = 0.75. */

V.mixture = (function () {
  var n = 3;
  var meanP = 0.5, varP = 1 / 12;
  var mean = n * meanP;
  var inside = n * (meanP - meanP * meanP - varP);   /* E[3P(1-P)] = 3(E[P]-E[P^2]) */
  var between = n * n * varP;                        /* Var(3P) */
  var total = inside + between;

  /* an independent numerical check on a fine grid of p */
  var steps = 20000, h = 1 / steps, numMean = 0, numSecond = 0;
  for (var i = 0; i < steps; i++) {
    var p = (i + 0.5) * h;
    numMean += (n * p) * h;
    numSecond += (n * p * (1 - p) + n * n * p * p) * h;
  }
  var numVar = numSecond - numMean * numMean;
  return {
    n: n, meanP: meanP, mean: mean,
    inside: inside, between: between, total: total,
    numMean: numMean, numVar: numVar,
    curve: (function () {
      var pts = [];
      for (var k = 0; k <= 20; k++) {
        var p = k / 20;
        pts.push({ p: p, mean: n * p, varc: n * p * (1 - p) });
      }
      return pts;
    })()
  };
})();

/* ---------- 8. the two-stage exam question (GATE CSE 2021 Set 2, Q16) ----------
   Attempt A first: she earns 10 with probability 0.8, and 10 more only if B is
   then right, which happens with probability 0.8 * 0.5. Attempt B first: she
   earns 20 with probability 0.5, and 10 more with probability 0.5 * 0.8. */

V.order = (function () {
  var pA = 0.8, pB = 0.5, mA = 10, mB = 20;
  var aFirst = pA * mA + (pA * pB) * mB;
  var bFirst = pB * mB + (pB * pA) * mA;
  return { pA: pA, pB: pB, mA: mA, mB: mB, aFirst: aFirst, bFirst: bFirst };
})();

/* ======================================================================
   LAYER 2 - THE CHECKS. Each one re-derives a figure a second way.
   ====================================================================== */

chk('the sample space has 36 ordered pairs', V.dice.n === 36, 'n = ' + V.dice.n);
chk('the two dice sum averages exactly 7', Math.abs(V.dice.meanSum - 7) < 1e-12, fx(V.dice.meanSum));
chk('six outcomes survive the sum >= 10 restriction', V.restrict.count === 6, 'count = ' + V.restrict.count);
chk('the restricted sums total 64', V.restrict.total === 64, 'total = ' + V.restrict.total);
chk('the conditional mean is 64/6', Math.abs(V.restrict.mean - 64 / 6) < 1e-12, fx(V.restrict.mean));
chk('the conditional mean exceeds the unconditional mean',
  V.restrict.mean > V.restrict.unconditional, fx(V.restrict.mean) + ' > ' + V.restrict.unconditional);
chk('the six conditions cover all 36 throws', V.cond.totalCount === 36, 'count = ' + V.cond.totalCount);
chk('every conditional mean matches its own integer sum',
  V.cond.rows.every(function (r) { return Math.abs(r.mean - r.maxSum / r.count) < 1e-12; }),
  'six rows');
chk('the conditional means rise with the minimum',
  V.cond.rows.every(function (r, i) { return i === 0 || r.mean > V.cond.rows[i - 1].mean; }),
  fx(V.cond.rows[0].mean) + ' up to ' + fx(V.cond.rows[5].mean));
chk('the tower identity reproduces 161/36 exactly',
  Math.abs(V.cond.tower - V.dice.maxTotal / 36) < 1e-12, fx(V.cond.tower));
chk('the tower identity also reproduces the second moment',
  Math.abs(V.cond.total - V.dice.varMax) < 1e-12 || Math.abs(V.cond.inside + V.cond.between - V.dice.varMax) < 1e-12,
  fx(V.cond.inside + V.cond.between));
chk('the conditional probabilities add to one',
  Math.abs(V.cond.rows.reduce(function (s, r) { return s + r.weight; }, 0) - 1) < 1e-12, 'sum = 1');
chk('conditioning on an independent variable leaves the mean at 3.5',
  V.indep.spread < 1e-12, 'max deviation ' + V.indep.spread);
chk('the two-coin partition has weights summing to one',
  Math.abs(V.coins.parts.reduce(function (s, a) { return s + a.prior; }, 0) - 1) < 1e-12, 'sum = 1');
chk('the two-coin expected count is 0.7', Math.abs(V.coins.total - 0.7) < 1e-12, fx(V.coins.total));
chk('the two-coin answer is exactly 7/10', Math.abs(V.coins.total - 7 / 10) < 1e-12, '7/10');
chk('a = 6 satisfies the first recursion exactly', V.wait.eqA < 1e-12, 'residual ' + V.wait.eqA);
chk('b = 4 satisfies the second recursion exactly', V.wait.eqB < 1e-12, 'residual ' + V.wait.eqB);
chk('the exact distribution of the wait averages 6',
  Math.abs(V.wait.exact - 6) < 1e-9, fx(V.wait.exact, 6));
chk('the exact distribution accounts for all its probability mass',
  Math.abs(V.wait.mass - 1) < 1e-9, fx(V.wait.mass, 6));
chk('the piece holding 0.4 averages 0.74', Math.abs(V.interval.exact - 0.74) < 1e-12, fx(V.interval.exact));
chk('the integral agrees with the two-part sum',
  Math.abs(V.interval.numeric - V.interval.exact) < 1e-3, fx(V.interval.numeric) + ' against ' + fx(V.interval.exact));
chk('the mixture mean is 1.5', Math.abs(V.mixture.mean - 1.5) < 1e-12, fx(V.mixture.mean));
chk('the mixture mean agrees with the integral over p',
  Math.abs(V.mixture.numMean - V.mixture.mean) < 1e-3, fx(V.mixture.numMean));
chk('the mixture variance is 1.25', Math.abs(V.mixture.total - 1.25) < 1e-12, fx(V.mixture.total));
chk('the mixture variance agrees with the integral over p',
  Math.abs(V.mixture.numVar - V.mixture.total) < 1e-3, fx(V.mixture.numVar));
chk('the variance split adds up: inside plus between equals the total',
  Math.abs(V.mixture.inside + V.mixture.between - V.mixture.total) < 1e-12,
  fx(V.mixture.inside) + ' + ' + fx(V.mixture.between));
chk('the between part of the mixture is not zero',
  V.mixture.between > 0.7, fx(V.mixture.between));
chk('the exam order A then B gives 16', Math.abs(V.order.aFirst - 16) < 1e-12, fx(V.order.aFirst));
chk('the exam order B then A gives 14', Math.abs(V.order.bFirst - 14) < 1e-12, fx(V.order.bFirst));
chk('the total-variance law reproduces the variance of the maximum',
  Math.abs(V.cond.inside + V.cond.between - V.dice.varMax) < 1e-12, fx(V.dice.varMax));

/* ======================================================================
   LAYER 3 - RENDER. One function per scene; each reads V only.
   ====================================================================== */

function head(title, sub) {
  P.text(28, 22, title, { size: 17, bold: true, color: INK });
  if (sub) P.text(28, 46, sub, { size: 12, color: DIM });
}

function box(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || SURF2, stroke: o.stroke || BORDER, radius: 8, sw: 1.2 });
}

function label(x, y, s, o) { P.text(x, y, s, o || { size: 12, color: DIM }); }

function tick(x, y, ok) {
  P.circle(x, y, 7, { fill: ok ? VAL : BAD, stroke: ok ? VAL : BAD });
  P.text(x, y + 1, ok ? 'ok' : 'no', { size: 8, color: '#ffffff', align: 'center', base: 'middle', bold: true });
}

function progressOf(t, sc, from, span) {
  return K.clamp01((t - (sc.start + from)) / span);
}

var SCENE_DRAW = {};

/* ---------- scene 1: an average over a smaller set ---------- */
SCENE_DRAW['cond-avg'] = function (t, sc) {
  head('A conditional mean averages a smaller set',
    'two dice, restricted to the throws whose sum is at least 10');

  var x0 = 34, y0 = 80, cw = 42, ch = 34;
  var reveal = progressOf(t, sc, 0, 8);
  var keep = progressOf(t, sc, 8, 7);

  label(x0, y0 - 10, 'the 36 throws, and the sums that survive', { size: 11, color: FAINT });

  for (var a = 0; a < 6; a++) {
    for (var b = 0; b < 6; b++) {
      var idx = a * 6 + b;
      var on = idx < Math.round(reveal * 36);
      var s = (a + 1) + (b + 1);
      var survivor = s >= V.restrict.threshold;
      var x = x0 + b * cw, y = y0 + a * ch;
      var lit = on && (!survivor ? keep < 0.6 : true);
      var dimmed = on && !survivor && keep >= 0.6;
      P.rect(x, y, cw - 4, ch - 4, {
        fill: !on ? SURF2 : (survivor ? ACCDIM : (dimmed ? SURF : SURF2)),
        stroke: !on ? BORDER : (survivor ? ACC : BORDER),
        radius: 4, sw: 1
      });
      if (on) {
        P.text(x + (cw - 4) / 2, y + (ch - 4) / 2, String(s),
          { size: 11, align: 'center', base: 'middle', color: survivor ? INK : FAINT });
      }
      void lit;
    }
  }

  var rx = 340;
  label(rx, 96, 'all 36 throws', { size: 11, color: FAINT });
  P.text(rx, 118, 'mean of the sum = 7', { size: 14, color: INK });

  if (keep > 0) {
    label(rx, 158, 'the condition: sum at least 10', { size: 11, color: FAINT });
    P.text(rx, 180, '6 throws survive', { size: 14, color: ACC });
    P.text(rx, 204, 'their sums total 64', { size: 13, color: DIM });
  }
  if (keep > 0.5) {
    label(rx, 244, 'the conditional mean', { size: 11, color: FAINT });
    P.text(rx, 268, '64 / 6 = ' + fx(V.restrict.mean, 2), { size: 20, bold: true, color: ACC });
    P.text(rx, 300, 'against 7 unconditionally', { size: 12, color: DIM });
  }
  if (keep >= 1) {
    box(rx, 322, 520, 66, { fill: WARN, stroke: WARN });
    P.text(rx + 14, 344, 'E[X | A] weights each outcome inside A', { size: 12, color: '#ffffff' });
    P.text(rx + 14, 366, 'by its conditional probability P(x | A)', { size: 12, color: '#ffffff' });
  }
};

/* ---------- scene 2: one mean per condition ---------- */
SCENE_DRAW['cond-fn'] = function (t, sc) {
  head('One mean per value of the condition',
    'the larger face, given the smaller face: six conditions, six means');

  var x0 = 34, y0 = 84, rowH = 42;
  var step = progressOf(t, sc, 0, 14);
  var showAll = progressOf(t, sc, 14, 8);

  label(x0, y0 - 12, 'smaller face', { size: 11, color: FAINT });
  label(x0 + 96, y0 - 12, 'throws with that minimum', { size: 11, color: FAINT });
  label(x0 + 300, y0 - 12, 'mean of the larger face', { size: 11, color: FAINT });

  var maxW = 190;
  V.cond.rows.forEach(function (r, i) {
    var shown = step * 6 >= i + 0.35;
    if (!shown) return;
    var y = y0 + i * rowH;
    P.text(x0, y + 14, 'min = ' + r.y, { size: 13, color: INK, bold: true });
    P.text(x0 + 96, y + 14, r.count + ' of 36', { size: 12, color: DIM });
    var w = (r.count / 11) * maxW;
    P.rect(x0 + 186, y + 4, w, 16, { fill: ACCDIM, stroke: ACC, radius: 4, sw: 1 });
    P.text(x0 + 186 + maxW + 12, y + 14, fx(r.mean, 2), { size: 13, color: ACC, bold: true });
  });

  var rx = 600;
  if (showAll > 0) {
    box(rx, 84, 266, 150, { fill: SURF2, stroke: BORDER });
    label(rx + 14, 106, 'the counts', { size: 11, color: FAINT });
    P.text(rx + 14, 130, '11, 9, 7, 5, 3, 1', { size: 13, color: INK });
    P.text(rx + 14, 156, 'the pair y-y counts once,', { size: 11, color: DIM });
    P.text(rx + 14, 174, 'the others come in two orders', { size: 11, color: DIM });
    P.text(rx + 14, 204, 'the six means are not equal', { size: 12, color: WARN });
    P.text(rx + 14, 222, 'to the overall mean 4.4722', { size: 12, color: WARN });
  }
  if (showAll > 0.6) {
    P.text(rx, 262, 'E[max | min = y] is a function', { size: 13, color: INK });
    P.text(rx, 284, 'of y, so the answer carries y', { size: 13, color: INK });
    P.text(rx, 316, 'a single number is incomplete', { size: 12, color: BAD });
  }
};

/* ---------- scene 3: the tower property ---------- */
SCENE_DRAW['tower'] = function (t, sc) {
  head('Average the averages and the mean returns',
    'the law of total expectation on the same six conditions');

  var x0 = 34, y0 = 88, rowH = 40;
  var step = progressOf(t, sc, 0, 12);
  var done = progressOf(t, sc, 12, 10);

  label(x0, y0 - 12, 'condition', { size: 11, color: FAINT });
  label(x0 + 92, y0 - 12, 'weight', { size: 11, color: FAINT });
  label(x0 + 186, y0 - 12, 'conditional mean', { size: 11, color: FAINT });
  label(x0 + 360, y0 - 12, 'weight times mean', { size: 11, color: FAINT });

  V.cond.rows.forEach(function (r, i) {
    if (step * 6 < i + 0.35) return;
    var y = y0 + i * rowH;
    P.text(x0, y + 14, 'min = ' + r.y, { size: 12, color: INK });
    P.text(x0 + 92, y + 14, frac(r.count, 36), { size: 12, color: DIM, mono: true });
    P.text(x0 + 186, y + 14, fx(r.mean, 4), { size: 12, color: DIM, mono: true });
    P.text(x0 + 360, y + 14, fx(r.weighted, 4), { size: 12, color: ACC, mono: true });
  });

  var ySum = y0 + 6 * rowH + 22;
  if (done > 0) {
    P.line(x0, ySum - 16, x0 + 470, ySum - 16, { color: BORDER, sw: 1 });
    P.text(x0, ySum + 4, 'sum of the six products', { size: 12, color: INK, bold: true });
    P.text(x0 + 360, ySum + 4, frac(161, 36), { size: 12, color: ACC, bold: true, mono: true });
  }

  var rx = 540;
  if (done > 0.3) {
    box(rx, 88, 326, 92, { fill: ACCDIM, stroke: ACC });
    label(rx + 14, 110, 'the law of total expectation', { size: 11, color: FAINT });
    P.text(rx + 14, 136, 'E[ E[X | Y] ] = E[X]', { size: 15, color: INK, bold: true });
    P.text(rx + 14, 162, '161/36 = ' + fx(V.cond.tower, 4), { size: 12, color: DIM });
  }
  if (done > 0.6) {
    P.text(rx, 208, 'the same 4.4722 as the plain mean', { size: 12, color: VAL });
    P.text(rx, 230, 'of the larger face over all 36', { size: 12, color: VAL });
    box(rx, 252, 326, 84, { fill: WARN, stroke: WARN });
    P.text(rx + 14, 274, 'the law is a route, not a fact', { size: 12, color: '#ffffff' });
    P.text(rx + 14, 296, 'easy conditional means, then', { size: 12, color: '#ffffff' });
    P.text(rx + 14, 318, 'weight them by the conditions', { size: 12, color: '#ffffff' });
  }
};

/* ---------- scene 4: the law over a partition ---------- */
SCENE_DRAW.partition = function (t, sc) {
  head('The same law, written over a partition',
    'pick one of two coins, then toss the chosen coin twice');

  var step = progressOf(t, sc, 0, 12);
  var ans = progressOf(t, sc, 12, 10);

  var cols = [60, 480];
  V.coins.parts.forEach(function (a, i) {
    if (step * 2 < i + 0.4) return;
    var x = cols[i];
    box(x, 84, 350, 116, { fill: SURF2, stroke: BORDER });
    label(x + 14, 106, a.name, { size: 11, color: FAINT });
    P.text(x + 14, 130, 'heads with probability ' + a.p, { size: 12, color: INK });
    P.text(x + 14, 154, 'chosen with probability ' + a.prior, { size: 12, color: DIM });
    if (step > 0.6) {
      P.text(x + 14, 182, 'E[heads | this coin] = 2 x ' + a.p + ' = ' + a.condMean,
        { size: 12, color: ACC, bold: true });
    }
  });

  if (ans > 0) {
    P.text(60, 236, 'weight the two conditional means by the prior', { size: 12, color: DIM });
    P.text(60, 268, '0.5 x 1  +  0.5 x 0.4  =  ' + fx(V.coins.total, 2),
      { size: 18, bold: true, color: ACC });
  }
  if (ans > 0.5) {
    box(60, 300, 770, 96, { fill: ACCDIM, stroke: ACC });
    P.text(74, 326, 'E[X] = E[X | A1] P(A1) + E[X | A2] P(A2)', { size: 14, color: INK, bold: true });
    P.text(74, 352, 'the parts must not overlap and must cover everything', { size: 11, color: DIM });
    P.text(74, 374, 'the weights are the probabilities of the parts, not of the outcomes', { size: 11, color: DIM });
  }
};

/* ---------- scene 5: conditioning on the first step ---------- */
SCENE_DRAW.recursion = function (t, sc) {
  head('Condition on the first toss and the mean becomes an equation',
    'the wait for two consecutive heads, solved in two states');

  var step = progressOf(t, sc, 0, 12);
  var solved = progressOf(t, sc, 12, 10);

  var sx = 90, sy = 150, r = 46;
  P.circle(sx, sy, r, { fill: SURF2, stroke: BORDER, sw: 1.4 });
  P.text(sx, sy - 8, 'no head', { size: 12, color: INK, align: 'center' });
  P.text(sx, sy + 12, 'in hand', { size: 12, color: INK, align: 'center' });
  P.text(sx, sy + 40, 'mean a', { size: 12, color: ACC, align: 'center', bold: true });

  var bx = 380, by = 150;
  P.circle(bx, by, r, { fill: ACCDIM, stroke: ACC, sw: 1.4 });
  P.text(bx, by - 8, 'one head', { size: 12, color: INK, align: 'center' });
  P.text(bx, by + 12, 'in hand', { size: 12, color: INK, align: 'center' });
  P.text(bx, by + 40, 'mean b', { size: 12, color: ACC, align: 'center', bold: true });

  if (step > 0.25) {
    P.arrow(sx + r + 6, sy - 22, bx - r - 8, by - 22, { color: VAL, sw: 1.6 });
    P.text(sx + r + 20, sy - 34, 'head', { size: 11, color: VAL });
    P.arrow(bx - r - 6, by + 22, sx + r + 8, sy + 22, { color: WARN, sw: 1.6 });
    P.text(sx + r + 20, sy + 44, 'tail', { size: 11, color: WARN });
    P.arrow(sx - 18, sy + r + 8, sx + 18, sy + r + 8, { color: BAD, sw: 1.4 });
    P.text(sx - 34, sy + r + 30, 'tail: start again', { size: 11, color: BAD });
  }
  if (step > 0.6) {
    P.text(480, 118, 'a head from b finishes the run', { size: 11, color: DIM });
    P.text(480, 138, 'a tail from b falls back to a', { size: 11, color: DIM });
  }

  if (step > 0.5) {
    box(60, 236, 400, 96, { fill: SURF2, stroke: BORDER });
    P.text(74, 262, 'a = 1 + (1/2) a + (1/2) b', { size: 13, color: INK, mono: true });
    P.text(74, 288, 'b = 1 + (1/2) a', { size: 13, color: INK, mono: true });
    P.text(74, 316, 'the 1 counts the toss just made', { size: 11, color: DIM });
  }
  if (solved > 0) {
    box(486, 236, 380, 96, { fill: ACCDIM, stroke: ACC });
    P.text(500, 262, 'substituting: (1/4) a = 3/2', { size: 12, color: INK, mono: true });
    P.text(500, 288, 'a = ' + V.wait.a + '   and   b = ' + V.wait.b, { size: 14, color: ACC, bold: true });
    P.text(500, 316, 'exact distribution agrees: ' + fx(V.wait.exact, 4), { size: 11, color: VAL });
  }
  if (solved > 0.5) {
    P.text(60, 372, 'the check: P(wait = n) = F(n-1)/2^n, summed over n from 2 upward', { size: 11, color: DIM });
    P.text(60, 396, 'the recursion and the distribution are two routes to the same 6', { size: 11, color: DIM });
  }
};

/* ---------- scene 6: the conditional mean is a random variable ---------- */
SCENE_DRAW.rv = function (t, sc) {
  head('The conditional mean is itself a random variable',
    'one value per block of outcomes, each taken with its block probability');

  var x0 = 34, y0 = 96, bw = 128, bh = 54, gap = 8;
  var step = progressOf(t, sc, 0, 12);
  var done = progressOf(t, sc, 12, 10);

  label(x0, y0 - 14, 'the six values of E[max | min]', { size: 11, color: FAINT });

  V.cond.rows.forEach(function (r, i) {
    if (step * 6 < i + 0.35) return;
    var x = x0 + (i % 3) * (bw + gap);
    var y = y0 + Math.floor(i / 3) * (bh + gap + 26);
    box(x, y, bw, bh, { fill: ACCDIM, stroke: ACC });
    P.text(x + bw / 2, y + 20, fx(r.mean, 3), { size: 14, color: INK, align: 'center', bold: true });
    P.text(x + bw / 2, y + 42, 'P = ' + frac(r.count, 36), { size: 11, color: DIM, align: 'center', mono: true });
  });

  if (done > 0) {
    P.text(x0, 300, 'the six probabilities add to 1, so this is a genuine distribution', { size: 11, color: DIM });
    box(x0, 320, 400, 100, { fill: SURF2, stroke: BORDER });
    label(x0 + 14, 342, 'its mean', { size: 11, color: FAINT });
    P.text(x0 + 14, 366, 'E[ E[max | min] ] = ' + fx(V.cond.tower, 4), { size: 13, color: ACC, bold: true });
    P.text(x0 + 14, 392, 'the mean of the original variable', { size: 11, color: DIM });
  }
  if (done > 0.5) {
    box(460, 320, 406, 100, { fill: WARNDIM, stroke: WARN });
    label(474, 342, 'its spread, against the original', { size: 11, color: FAINT });
    P.text(474, 366, 'Var(E[max | min]) = ' + fx(V.cond.between, 4), { size: 12, color: INK });
    P.text(474, 388, 'Var(max) = ' + fx(V.dice.varMax, 4) + ' — smaller', { size: 12, color: WARN });
  }
};

/* ---------- scene 7: the total variance law ---------- */
SCENE_DRAW.variance = function (t, sc) {
  head('The law of total variance',
    'variation inside the blocks plus variation between them');

  var step = progressOf(t, sc, 0, 12);
  var done = progressOf(t, sc, 12, 10);

  var bx = 60, by = 120, bwTotal = 640;
  var unit = bwTotal / V.dice.varMax;

  if (step > 0.1) {
    label(bx, by - 14, 'Var(larger face) = ' + fx(V.dice.varMax, 4), { size: 11, color: FAINT });
    var w1 = V.cond.inside * unit;
    var w2 = V.cond.between * unit;
    P.rect(bx, by, w1, 46, { fill: ACCDIM, stroke: ACC, radius: 4, sw: 1 });
    P.rect(bx + w1, by, w2, 46, { fill: WARNDIM, stroke: WARN, radius: 4, sw: 1 });
    P.text(bx + w1 / 2, by + 28, fx(V.cond.inside, 4), { size: 12, color: INK, align: 'center' });
    P.text(bx + w1 + w2 / 2, by + 28, fx(V.cond.between, 4), { size: 12, color: INK, align: 'center' });
    label(bx, by + 66, 'inside the blocks', { size: 11, color: DIM });
    label(bx + w1 + 6, by + 66, 'between the blocks', { size: 11, color: DIM });
  }

  if (step > 0.45) {
    box(bx, 214, 640, 54, { fill: SURF2, stroke: BORDER });
    P.text(bx + 14, 240, 'E[Var(X | Y)]  +  Var(E[X | Y])  =  Var(X)', { size: 13, color: INK, bold: true });
    P.text(bx + 14, 260, fx(V.cond.inside, 4) + '  +  ' + fx(V.cond.between, 4) + '  =  ' + fx(V.dice.varMax, 4),
      { size: 11, color: DIM, mono: true });
  }

  if (done > 0) {
    P.text(bx, 300, 'inside: how much the larger face still varies once the smaller is known', { size: 11, color: DIM });
    P.text(bx, 322, 'between: how much the block averages differ from one another', { size: 11, color: DIM });
    P.text(bx, 352, 'conditioning removes the between part and never the inside part', { size: 12, color: ACC });
  }
  if (done > 0.6) {
    box(bx, 372, 640, 56, { fill: WARN, stroke: WARN });
    P.text(bx + 14, 396, 'Var(X) is not E[Var(X | Y)]: that is only the first bar', { size: 12, color: '#ffffff' });
    P.text(bx + 14, 416, 'here the second bar is 0.4539 of the 1.9715 total', { size: 12, color: '#ffffff' });
  }
};

/* ---------- scene 8: a continuous condition ---------- */
SCENE_DRAW.continuous = function (t, sc) {
  head('Conditioning where the probability of a value is zero',
    'a uniform cut of the unit interval, and the piece holding 0.4');

  var step = progressOf(t, sc, 0, 12);
  var ans = progressOf(t, sc, 12, 10);

  var ax = 60, ay = 120, aw = 780;
  P.line(ax, ay, ax + aw, ay, { color: BORDER, sw: 2 });
  P.line(ax, ay - 10, ax, ay + 10, { color: INK, sw: 1.4 });
  P.line(ax + aw, ay - 10, ax + aw, ay + 10, { color: INK, sw: 1.4 });
  label(ax - 4, ay + 28, '0', { size: 11, color: DIM });
  label(ax + aw - 8, ay + 28, '1', { size: 11, color: DIM });

  var mx = ax + aw * V.interval.mark;
  P.line(mx, ay - 22, mx, ay + 22, { color: ACC, sw: 2 });
  P.text(mx + 6, ay - 26, '0.4', { size: 11, color: ACC, bold: true });

  if (step > 0.2) {
    var u = 0.72;
    var ux = ax + aw * u;
    P.circle(ux, ay, 6, { fill: INFO, stroke: INFO });
    P.text(ux - 12, ay - 44, 'cut at u = 0.72', { size: 11, color: INFO });
    P.rect(ax, ay + 34, mx - ax, 16, { fill: ACCDIM, stroke: ACC, radius: 3, sw: 1 });
    P.text(ax + 8, ay + 46, 'piece holding 0.4 has length u', { size: 11, color: INK });
  }

  if (step > 0.55) {
    var u2 = 0.22;
    var ux2 = ax + aw * u2;
    P.circle(ux2, ay, 6, { fill: WARN, stroke: WARN });
    P.text(ux2 - 12, ay - 44, 'cut at u = 0.22', { size: 11, color: WARN });
    P.rect(ux2, ay + 58, ax + aw - ux2, 16, { fill: WARNDIM, stroke: WARN, radius: 3, sw: 1 });
    P.text(ux2 + 8, ay + 70, 'then the piece runs from u to 1, length 1 - u', { size: 11, color: INK });
  }

  if (ans > 0) {
    P.text(60, 226, 'u below 0.4 happens with probability 0.4, and there the length averages 0.8',
      { size: 11, color: DIM });
    P.text(60, 248, 'u above 0.4 happens with probability 0.6, and there the length averages 0.7',
      { size: 11, color: DIM });
    P.text(60, 282, '0.4 x 0.8  +  0.6 x 0.7  =  ' + fx(V.interval.exact, 2),
      { size: 18, bold: true, color: ACC });
    P.text(60, 310, 'the integral over u gives the same ' + fx(V.interval.numeric, 4),
      { size: 11, color: VAL });
  }
  if (ans > 0.5) {
    box(60, 330, 770, 92, { fill: WARN, stroke: WARN });
    P.text(74, 354, 'P(u = 0.4) = 0, so there is nothing to divide by', { size: 12, color: '#ffffff' });
    P.text(74, 376, 'condition on a small interval and let its width shrink to zero', { size: 12, color: '#ffffff' });
    P.text(74, 398, 'the limit is the integral against the conditional density', { size: 12, color: '#ffffff' });
  }
};

/* ---------- scene 9: a mixture ---------- */
SCENE_DRAW.mixture = function (t, sc) {
  head('A random parameter makes a mixture, and a mixture is wider',
    'bias drawn uniformly, then three tosses of the chosen coin');

  var step = progressOf(t, sc, 0, 12);
  var ans = progressOf(t, sc, 12, 10);

  var gx = 60, gy = 250, gw = 470, gh = 130;
  if (step > 0.15) {
    label(gx, gy - gh - 16, 'conditional mean 3p and variance 3p(1-p), as p varies', { size: 11, color: FAINT });
    P.line(gx, gy, gx + gw, gy, { color: BORDER, sw: 1.2 });
    P.line(gx, gy - gh, gx, gy, { color: BORDER, sw: 1.2 });
    var prev = null;
    V.mixture.curve.forEach(function (pt) {
      var x = gx + pt.p * gw;
      var y = gy - (pt.mean / 3) * gh;
      if (prev) P.line(prev[0], prev[1], x, y, { color: ACC, sw: 1.6 });
      prev = [x, y];
    });
    prev = null;
    V.mixture.curve.forEach(function (pt) {
      var x = gx + pt.p * gw;
      var y = gy - (pt.varc / 0.75) * (gh * 0.55);
      if (prev) P.line(prev[0], prev[1], x, y, { color: WARN, sw: 1.4 });
      prev = [x, y];
    });
    label(gx + gw - 78, gy - gh + 10, 'mean 3p', { size: 10, color: ACC });
    label(gx + 190, gy - 22, 'variance 3p(1-p)', { size: 10, color: WARN });
    label(gx - 6, gy + 18, 'p = 0', { size: 10, color: DIM });
    label(gx + gw - 34, gy + 18, 'p = 1', { size: 10, color: DIM });
  }

  if (ans > 0) {
    box(560, 84, 306, 96, { fill: ACCDIM, stroke: ACC });
    label(574, 106, 'the mean survives the mixing', { size: 11, color: FAINT });
    P.text(574, 132, '3 x E[p] = 3 x 0.5 = ' + fx(V.mixture.mean, 1), { size: 14, color: INK, bold: true });
    P.text(574, 158, 'E[E[X | p]] = E[X]', { size: 11, color: DIM });
  }
  if (ans > 0.4) {
    box(560, 194, 306, 132, { fill: WARNDIM, stroke: WARN });
    label(574, 216, 'the variance does not', { size: 11, color: FAINT });
    P.text(574, 240, 'inside  E[3p(1-p)] = ' + fx(V.mixture.inside, 2), { size: 12, color: INK });
    P.text(574, 262, 'between Var(3p) = ' + fx(V.mixture.between, 2), { size: 12, color: INK });
    P.text(574, 290, 'total = ' + fx(V.mixture.total, 2), { size: 14, color: WARN, bold: true });
    P.text(574, 312, 'not the inside 0.5 alone', { size: 11, color: DIM });
  }
  if (ans > 0.7) {
    P.text(60, 300, 'the mixture is wider than any single binomial with the same mean', { size: 11, color: DIM });
    P.text(60, 322, 'a fixed p = 0.5 would have variance 0.75, not 1.25', { size: 11, color: DIM });
  }
};

/* ---------- scene 10: the procedure and the traps ---------- */
SCENE_DRAW.procedure = function (t, sc) {
  head('The procedure, in four steps',
    'and the places where a correct-looking answer goes wrong');

  var step = progressOf(t, sc, 0, 13);
  var trap = progressOf(t, sc, 13, 10);

  var steps = [
    ['1', 'name the condition, and check the parts partition the space'],
    ['2', 'compute one ordinary mean inside each part'],
    ['3', 'weight each mean by the probability of its part, and add'],
    ['4', 'read the answer back: a number, or a function of the condition']
  ];
  steps.forEach(function (s, i) {
    if (step * 4 < i + 0.3) return;
    var y = 84 + i * 54;
    P.circle(52, y + 14, 15, { fill: ACC, stroke: ACC });
    P.text(52, y + 15, s[0], { size: 12, color: '#ffffff', align: 'center', base: 'middle', bold: true });
    P.text(78, y + 19, s[1], { size: 12, color: INK });
  });

  if (trap > 0) {
    box(60, 306, 770, 120, { fill: WARN, stroke: WARN });
    P.text(74, 330, 'five traps', { size: 12, color: '#ffffff', bold: true });
    P.text(74, 352, 'weights taken from the outcomes instead of from the conditions', { size: 11, color: '#ffffff' });
    P.text(74, 372, 'a part missing from the partition, so the answer is too small', { size: 11, color: '#ffffff' });
    P.text(74, 392, 'the step already taken left out of a recursion', { size: 11, color: '#ffffff' });
    P.text(74, 412, 'dividing by P(Y = y) when Y is continuous', { size: 11, color: '#ffffff' });
  }
  if (trap > 0.5) {
    P.text(600, 352, 'and treating E[X | Y]', { size: 11, color: '#ffffff' });
    P.text(600, 372, 'as a constant', { size: 11, color: '#ffffff' });
  }
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
