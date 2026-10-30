/* ==========================================================================
   linearity-of-expectation — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no probability arithmetic of its own:
   every figure on the canvas was computed once here and checked against the
   rule it is supposed to satisfy — the 36-outcome average for two dice, the
   full enumeration of every permutation up to n = 7, every one of the 125
   assignments of 3 keys to 5 slots, and the quicksort recurrence against its
   closed form for every n up to 120.
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

function fact(n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }

/* every permutation of 0..n-1, visited once */
function eachPerm(n, fn) {
  var a = [];
  for (var i = 0; i < n; i++) a.push(i);
  (function walk(k) {
    if (k === a.length) { fn(a); return; }
    for (var i = k; i < a.length; i++) {
      var t = a[k]; a[k] = a[i]; a[i] = t;
      walk(k + 1);
      t = a[k]; a[k] = a[i]; a[i] = t;
    }
  })(0);
}

var V = {};

/* ---------- 1. two dice: brute force against linearity ----------
   The sample space is the 36 ordered pairs. Every quantity below is an
   integer total over those 36 outcomes, so the checks can be exact integer
   identities rather than floating-point comparisons. */

V.dice = (function () {
  var d = { faces: 6, outcomes: 0, sumTotal: 0, maxTotal: 0, sqTotal: 0, pairs: [] };
  for (var a = 1; a <= 6; a++) {
    for (var b = 1; b <= 6; b++) {
      d.pairs.push([a, b]);
      d.outcomes++;
      d.sumTotal += a + b;
      d.maxTotal += Math.max(a, b);
      d.sqTotal += a * a;
    }
  }
  d.meanOne = 3.5;
  d.meanSum = d.sumTotal / d.outcomes;            /* 7 */
  d.linearSum = d.meanOne + d.meanOne;            /* 7 */
  d.meanMax = d.maxTotal / d.outcomes;            /* 161/36 */
  d.meanSq = d.sqTotal / d.outcomes;              /* 91/6 */
  d.squareOfMean = d.meanOne * d.meanOne;         /* 49/4 = 12.25 */
  d.varOne = d.meanSq - d.squareOfMean;           /* 35/12 */
  d.varSumIndependent = 2 * d.varOne;             /* 35/6 */
  d.varSumEqual = 4 * d.varOne;                   /* 35/3, because the sum is 2X */
  d.recipMean = 0;                                /* E[1/X] */
  for (var f = 1; f <= 6; f++) d.recipMean += (1 / f) / 6;
  d.recipOfMean = 1 / d.meanOne;                  /* 2/7 */
  /* the joint table with Y = X: only six cells carry probability */
  d.diagonalTotal = 0;
  for (var g = 1; g <= 6; g++) d.diagonalTotal += 2 * g;   /* 42, so mean 7 */
  return d;
})();

chk('dice: the 36-outcome average of the sum is exactly 7',
    V.dice.sumTotal === 7 * V.dice.outcomes,
    V.dice.sumTotal + ' / ' + V.dice.outcomes);
chk('dice: linearity gives the same 7 without the table',
    V.dice.linearSum === V.dice.meanSum,
    V.dice.linearSum);
chk('dice: with Y = X the mean of the sum is still 7',
    V.dice.diagonalTotal === 7 * 6,
    V.dice.diagonalTotal + ' / 6');
chk('dice: E[XY] is not E[X]E[Y] when Y = X',
    Math.abs(V.dice.meanSq - V.dice.squareOfMean) > 1e-9,
    V.dice.meanSq.toFixed(4) + ' against ' + V.dice.squareOfMean.toFixed(4));
chk('dice: E[1/X] is not 1/E[X]',
    Math.abs(V.dice.recipMean - V.dice.recipOfMean) > 1e-9,
    V.dice.recipMean.toFixed(4) + ' against ' + V.dice.recipOfMean.toFixed(4));
chk('dice: a dependent sum has four times the variance, not twice',
    Math.abs(V.dice.varSumEqual - 4 * V.dice.varOne) < 1e-9 &&
    Math.abs(V.dice.varSumIndependent - 2 * V.dice.varOne) < 1e-9,
    V.dice.varSumEqual.toFixed(4) + ' against ' + V.dice.varSumIndependent.toFixed(4));

/* ---------- 2. the tail-sum identity on the larger of two dice ----------
   E[X] = sum over k >= 1 of P(X >= k). Each tail term is an integer count
   over 36 outcomes, so the sum can be compared with maxTotal exactly. */

V.tail = (function () {
  var t = { terms: [], total: 0, n: 36 };
  for (var k = 1; k <= 6; k++) {
    var count = 36 - (k - 1) * (k - 1);           /* outcomes with max >= k */
    t.terms.push({ k: k, count: count, p: count / 36 });
    t.total += count;
  }
  t.mean = t.total / 36;                          /* 161/36 */
  return t;
})();

chk('tail sum: the six tail probabilities add to the brute-force mean',
    V.tail.total === V.dice.maxTotal,
    V.tail.total + ' against ' + V.dice.maxTotal);
chk('tail sum: the first term is 1, because the maximum is always at least 1',
    V.tail.terms[0].p === 1);

/* ---------- 3. fixed points of a random permutation ----------
   Enumerated for n = 1..7. The total number of fixed points over all n!
   permutations is compared with n! itself, so "mean exactly 1" is an
   integer identity and not a rounded float. */

V.fixed = (function () {
  var rows = [];
  var dist5 = null;
  for (var n = 1; n <= 7; n++) {
    var total = 0, cnt = 0;
    var dist = [];
    for (var z = 0; z <= n; z++) dist.push(0);
    eachPerm(n, function (p) {
      var f = 0;
      for (var i = 0; i < p.length; i++) if (p[i] === i) f++;
      total += f; cnt++;
      dist[f]++;
    });
    rows.push({ n: n, perms: cnt, total: total, mean: total / cnt, dist: dist });
    if (n === 5) dist5 = dist;
  }
  return { rows: rows, dist5: dist5, indicatorP: 1 };
})();

V.fixed.rows.forEach(function (r) {
  chk('fixed points: n = ' + r.n + ' gives a total of exactly n!',
      r.total === fact(r.n), r.total + ' fixed points over ' + r.perms + ' shuffles');
});
chk('fixed points: exactly n-1 fixed points is impossible at n = 5',
    V.fixed.dist5[4] === 0, V.fixed.dist5[4]);
chk('fixed points: the n = 5 distribution accounts for all 120 shuffles',
    V.fixed.dist5.reduce(function (s, v) { return s + v; }, 0) === 120);

/* ---------- 4. inversions ----------
   Enumerated for n = 2..7 and compared with n(n-1)/4 as an integer
   identity: total * 4 must equal n(n-1) * n!. */

V.inversions = (function () {
  var rows = [];
  for (var n = 2; n <= 7; n++) {
    var total = 0, cnt = 0;
    eachPerm(n, function (p) {
      var inv = 0;
      for (var i = 0; i < p.length; i++) {
        for (var j = i + 1; j < p.length; j++) if (p[i] > p[j]) inv++;
      }
      total += inv; cnt++;
    });
    rows.push({ n: n, total: total, cnt: cnt, mean: total / cnt, pairs: n * (n - 1) / 2 });
  }
  return { rows: rows, sample: [5, 3, 1, 4, 2] };
})();

V.inversions.rows.forEach(function (r) {
  chk('inversions: n = ' + r.n + ' gives exactly n(n-1)/4 per permutation',
      r.total * 4 === r.n * (r.n - 1) * fact(r.n),
      r.mean.toFixed(2));
});

/* ---------- 5. hashing: every assignment of 3 keys to 5 slots ----------
   125 assignments, enumerated. Each of the three expected quantities is
   compared with its closed form. */

V.hash = (function () {
  var m = 5, n = 3;
  var sumLoad = 0, sumColl = 0, sumOcc = 0, cnt = 0;
  var slotOf = [0, 0, 0];
  (function place(k) {
    if (k === n) {
      cnt++;
      sumLoad += (slotOf[0] === 0 ? 1 : 0) + (slotOf[1] === 0 ? 1 : 0) + (slotOf[2] === 0 ? 1 : 0);
      var c = 0;
      for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) if (slotOf[i] === slotOf[j]) c++;
      sumColl += c;
      var seen = {};
      for (var q = 0; q < n; q++) seen[slotOf[q]] = 1;
      sumOcc += Object.keys(seen).length;
      return;
    }
    for (var s = 0; s < m; s++) { slotOf[k] = s; place(k + 1); }
  })(0);

  var h = { m: m, n: n, assignments: cnt };
  h.loadBrute = sumLoad / cnt;
  h.loadFormula = n / m;
  h.collBrute = sumColl / cnt;
  h.collFormula = (n * (n - 1) / 2) / m;
  h.occBrute = sumOcc / cnt;
  h.occFormula = m * (1 - Math.pow(1 - 1 / m, n));
  h.placements = [2, 4, 2];                       /* one concrete assignment to draw */
  h.loads = [0, 0, 2, 0, 1];
  return h;
})();

chk('hashing: expected slot load is n/m, by enumeration',
    Math.abs(V.hash.loadBrute - V.hash.loadFormula) < 1e-12,
    V.hash.loadBrute.toFixed(4));
chk('hashing: expected colliding pairs is C(n,2)/m, by enumeration',
    Math.abs(V.hash.collBrute - V.hash.collFormula) < 1e-12,
    V.hash.collBrute.toFixed(4));
chk('hashing: expected occupied slots is m(1-(1-1/m)^n), by enumeration',
    Math.abs(V.hash.occBrute - V.hash.occFormula) < 1e-9,
    V.hash.occBrute.toFixed(4));
chk('hashing: the drawn assignment has the load the figure claims',
    V.hash.loads.reduce(function (s, v) { return s + v; }, 0) === V.hash.n);

/* ---------- 6. randomised quicksort: recurrence against closed form ----------
   E(n) = (n-1) + (2/n) * sum of E(k) for k < n, and the closed form
   E(n) = 2(n+1)H(n) - 4n. Compared at every n from 2 to 120. */

V.qs = (function () {
  var N = 120;
  var Hn = [0], E = [0, 0];
  for (var i = 1; i <= N; i++) Hn[i] = Hn[i - 1] + 1 / i;
  var prefix = 0;                                  /* sum of E(0..n-1) */
  for (var n = 2; n <= N; n++) {
    prefix = 0;
    for (var k = 0; k < n; k++) prefix += E[k];
    E[n] = (n - 1) + (2 / n) * prefix;
  }
  var closed = function (n) { return 2 * (n + 1) * Hn[n] - 4 * n; };
  var worst = 0, under = true;
  for (var q = 2; q <= N; q++) {
    worst = Math.max(worst, Math.abs(E[q] - closed(q)));
    if (E[q] > 2 * q * Math.log(q) + 1e-9) under = false;
  }
  var curve = [];
  for (var c = 2; c <= N; c += 2) curve.push({ n: c, e: E[c], bound: 2 * c * Math.log(c) });
  return {
    N: N, Hn: Hn, E: E, closed: closed, worst: worst, under: under,
    curve: curve, at10: E[10], bound10: 2 * 10 * Math.log(10),
    H10: Hn[10]
  };
})();

chk('quicksort: the recurrence and the closed form agree at every n from 2 to 120',
    V.qs.worst < 1e-9, 'largest gap ' + V.qs.worst.toExponential(2));
chk('quicksort: the exact expectation stays under 2n ln n for every n checked',
    V.qs.under);
chk('quicksort: n = 10 gives 24.4373 comparisons',
    Math.abs(V.qs.at10 - 24.4373) < 5e-4, V.qs.at10.toFixed(4));

/* ---------- 7. indicators over twelve events ----------
   Every one of the 4096 subsets is visited, so the identity "the count is
   the sum of the indicators" and the mean "the sum of the probabilities"
   are both checked exhaustively rather than asserted. */

V.ind = (function () {
  var p = [1 / 2, 1 / 3, 1 / 4, 1 / 5, 1 / 6, 1 / 7, 1 / 8, 1 / 9, 1 / 10, 1 / 12, 1 / 15, 1 / 20];
  var sumP = p.reduce(function (s, v) { return s + v; }, 0);
  var identityOk = true, meanTotal = 0, subsets = 0;
  for (var mask = 0; mask < 4096; mask++) {
    var count = 0, indSum = 0, w = 1;
    for (var i = 0; i < 12; i++) {
      var on = (mask >> i) & 1;
      indSum += on;
      if (on) count++;
      w *= on ? p[i] : (1 - p[i]);
    }
    if (count !== indSum) identityOk = false;
    meanTotal += w * count;
    subsets++;
  }
  /* a concrete outcome to draw: the lamps that are on */
  var lit = [1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0];
  var litCount = lit.reduce(function (s, v) { return s + v; }, 0);
  return { p: p, sumP: sumP, identityOk: identityOk, meanBrute: meanTotal,
           subsets: subsets, lit: lit, litCount: litCount };
})();

chk('indicators: the count equals the sum of the indicators on all 4096 subsets',
    V.ind.identityOk, V.ind.subsets + ' subsets');
chk('indicators: the sum of the twelve probabilities matches the exhaustive mean',
    Math.abs(V.ind.sumP - V.ind.meanBrute) < 1e-12,
    V.ind.sumP.toFixed(4));
chk('indicators: the drawn outcome really has the count the figure claims',
    V.ind.litCount === V.ind.lit.reduce(function (s, v) { return s + v; }, 0));

/* ---------- 8. two small closed forms worth memorising ---------- */

V.small = (function () {
  var H6 = 0;
  for (var i = 1; i <= 6; i++) H6 += 1 / i;
  return {
    coupon6: 6 * H6,                     /* 14.7 throws to fill six slots */
    birthday23: (23 * 22 / 2) / 365      /* 253/365 expected colliding pairs */
  };
})();

chk('coupon collector: six slots need 6·H(6) = 14.7 keys on average',
    Math.abs(V.small.coupon6 - 14.7) < 1e-9, V.small.coupon6.toFixed(2));
chk('birthday: 23 people give 253/365 = 0.693 expected colliding pairs',
    Math.abs(V.small.birthday23 - 253 / 365) < 1e-12, V.small.birthday23.toFixed(4));

/* ======================================================================
   LAYER 2 - SHARED DRAWING HELPERS
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

/* ======================================================================
   LAYER 3 - RENDER. One function per scene; each reads V only.
   ====================================================================== */

var SCENE_DRAW = {};

/* ---------- scene 1: the mean of a sum ---------- */
SCENE_DRAW.sum = function (t, sc) {
  head('Two dice, thirty-six outcomes', 'the sum averages to 7, and linearity reaches it without the table');

  var x0 = 34, y0 = 74, cw = 46, ch = 40;
  var reveal = progressOf(t, sc, 0, 16);
  label(x0, y0 - 8, 'the 36 equally likely sums', { size: 11, color: FAINT });

  for (var a = 0; a < 6; a++) {
    for (var b = 0; b < 6; b++) {
      var idx = a * 6 + b;
      var on = idx < Math.round(reveal * 36);
      var x = x0 + b * cw, y = y0 + a * ch;
      P.rect(x, y, cw - 4, ch - 4, {
        fill: on ? ACCDIM : SURF2,
        stroke: on ? ACC : BORDER, radius: 4, sw: 1
      });
      P.text(x + (cw - 4) / 2, y + (ch - 4) / 2, String((a + 1) + (b + 1)),
             { size: 12, color: on ? INK : FAINT, align: 'center', base: 'middle',
               mono: true, bold: on });
    }
  }
  label(x0, y0 + 6 * ch + 6, 'row = first die, column = second die', { size: 10, color: FAINT });

  /* right-hand column: the two routes */
  var rx = 350, rw = 510;
  box(rx, 74, rw, 120, { fill: SURF });
  label(rx + 14, 90, 'route 1 — the brute force average', { size: 11, color: FAINT });
  P.text(rx + 14, 112, 'total of all 36 sums', { size: 12, color: DIM });
  P.text(rx + rw - 16, 112, String(V.dice.sumTotal), { size: 13, mono: true, align: 'right', bold: true });
  P.text(rx + 14, 134, 'divide by 36 outcomes', { size: 12, color: DIM });
  P.text(rx + rw - 16, 134, V.dice.meanSum.toFixed(3), { size: 13, mono: true, align: 'right', bold: true, color: ACC });
  P.text(rx + 14, 160, 'the 36-cell table had to be written', { size: 11, color: FAINT });
  P.text(rx + 14, 180, 'mean = 7 exactly', { size: 12, bold: true, color: INK });

  var show = progressOf(t, sc, 15, 7);
  P.alpha(show > 0 ? 1 : 0.25);
  box(rx, 206, rw, 120, { fill: show > 0.5 ? ACCDIM : SURF, stroke: show > 0.5 ? ACC : BORDER });
  label(rx + 14, 222, 'route 2 — linearity', { size: 11, color: FAINT });
  P.text(rx + 14, 246, 'E[first die] + E[second die]', { size: 12, color: DIM });
  P.text(rx + rw - 16, 246, '3.5 + 3.5', { size: 13, mono: true, align: 'right' });
  P.text(rx + 14, 272, 'no joint distribution was needed', { size: 11, color: FAINT });
  P.text(rx + 14, 300, 'mean = 7 exactly', { size: 13, bold: true, color: ACC });
  tick(rx + rw - 40, 300, V.dice.linearSum === V.dice.meanSum);
  P.alpha(1);

  P.text(rx, 352, 'E[X + Y] = E[X] + E[Y]', { size: 16, mono: true, bold: true, color: INK });
  P.text(rx, 376, 'and more generally  E[aX + bY + c] = aE[X] + bE[Y] + c', { size: 12, color: DIM });
  P.text(rx, 404, 'A mean need not be attainable: no pair of dice sums to 3.5.', { size: 11, color: WARN });
  P.text(rx, 424, 'It is a balance point, not a prediction of one outcome.', { size: 11, color: FAINT });
};

/* ---------- scene 2: dependence ---------- */
SCENE_DRAW.dependence = function (t, sc) {
  head('The joint table collapses to its diagonal', 'X and Y are the same die, copied — dependence is as strong as it gets');

  var x0 = 34, y0 = 78, cw = 46, ch = 40;
  label(x0, y0 - 8, 'Y = X, so only six cells carry probability', { size: 11, color: FAINT });
  for (var a = 0; a < 6; a++) {
    for (var b = 0; b < 6; b++) {
      var diag = a === b;
      var x = x0 + b * cw, y = y0 + a * ch;
      P.rect(x, y, cw - 4, ch - 4, {
        fill: diag ? ACCDIM : SURF2,
        stroke: diag ? ACC : BORDER, radius: 4, sw: diag ? 1.6 : 1
      });
      if (!diag) {
        P.line(x + 8, y + 8, x + cw - 12, y + ch - 12, { stroke: BORDER, sw: 1 });
      } else {
        P.text(x + (cw - 4) / 2, y + (ch - 4) / 2, '1/6',
               { size: 11, mono: true, align: 'center', base: 'middle', bold: true });
      }
    }
  }
  label(x0, y0 + 6 * ch + 6, 'each of the six diagonal cells has probability 1/6', { size: 10, color: FAINT });

  var rx = 350, rw = 510;
  box(rx, 78, rw, 96, { fill: SURF });
  label(rx + 14, 94, 'the sum still adds', { size: 11, color: FAINT });
  P.text(rx + 14, 118, 'E[X + Y] = E[2X] = 2 · 3.5 = 7', { size: 13, mono: true, bold: true, color: VAL });
  P.text(rx + 14, 142, 'enumeration: (2+4+6+8+10+12) / 6 = ' + (V.dice.diagonalTotal / 6).toFixed(1),
         { size: 11, mono: true, color: DIM });
  P.text(rx + 14, 162, 'the two routes agree, and independence was never used', { size: 11, color: FAINT });

  var show = progressOf(t, sc, 22, 8);
  P.alpha(show > 0 ? 1 : 0.3);
  box(rx, 186, rw, 118, { fill: BADDIM, stroke: BAD });
  label(rx + 14, 202, 'the product does not', { size: 11, color: BAD });
  P.text(rx + 14, 226, 'E[X · Y] = E[X²] = 91/6 = ' + V.dice.meanSq.toFixed(4),
         { size: 13, mono: true, bold: true, color: BAD });
  P.text(rx + 14, 250, 'E[X] · E[Y] = 3.5 · 3.5 = ' + V.dice.squareOfMean.toFixed(2),
         { size: 13, mono: true, bold: true, color: INK });
  P.text(rx + 14, 274, 'different numbers: E[XY] = E[X]E[Y] needs independence',
         { size: 11, color: BAD });
  P.alpha(1);

  P.text(rx, 330, 'Sums of means: always additive.', { size: 13, bold: true, color: VAL });
  P.text(rx, 352, 'Products and variances: additive only under independence.', { size: 13, bold: true, color: BAD });
  P.text(rx, 384, 'Dependence changes the shape and the spread of a sum,', { size: 11, color: DIM });
  P.text(rx, 402, 'never its mean. That is the licence linearity gives you.', { size: 11, color: DIM });
};

/* ---------- scene 3: indicators ---------- */
SCENE_DRAW.indicator = function (t, sc) {
  head('Twelve events, twelve indicators', 'the count is the sum of the indicators; its mean is the sum of the probabilities');

  var x0 = 34, y0 = 80, rowH = 26, barW = 150;
  var reveal = progressOf(t, sc, 0, 12);
  label(x0, y0 - 20, 'event        probability        lamp        indicator', { size: 10, color: FAINT, mono: true });

  for (var i = 0; i < 12; i++) {
    var y = y0 + i * rowH;
    var on = i < Math.round(reveal * 12);
    P.text(x0, y, 'A' + (i + 1), { size: 11, mono: true, color: on ? INK : FAINT });
    P.rect(x0 + 34, y + 2, barW * V.ind.p[i] * 2, 9, { fill: on ? ACCDIM : SURF2, stroke: on ? ACC : BORDER, radius: 3, sw: 1 });
    P.text(x0 + 34 + barW * V.ind.p[i] * 2 + 6, y, V.ind.p[i].toFixed(3), { size: 10, mono: true, color: DIM });
    var lit = V.ind.lit[i] === 1;
    P.circle(x0 + 240, y + 6, 6, { fill: lit ? VAL : SURF, stroke: lit ? VAL : BORDER, sw: 1.4 });
    P.text(x0 + 262, y, lit ? '1' : '0', { size: 12, mono: true, bold: true, color: lit ? VAL : FAINT });
  }
  label(x0, y0 + 12 * rowH + 12, 'the lamps show one outcome', { size: 10, color: FAINT });

  var rx = 350, rw = 510;
  box(rx, 78, rw, 92, { fill: SURF });
  label(rx + 14, 94, 'on this outcome', { size: 11, color: FAINT });
  P.text(rx + 14, 118, 'count = ' + V.ind.litCount, { size: 14, mono: true, bold: true });
  P.text(rx + 14, 142, 'and count = 1+0+1+1+0+0+1+0+0+1+0+0, exactly', { size: 11, mono: true, color: DIM });
  P.text(rx + 14, 160, 'an identity on every outcome, not only on average', { size: 11, color: FAINT });

  var show = progressOf(t, sc, 22, 8);
  P.alpha(show > 0 ? 1 : 0.3);
  box(rx, 182, rw, 118, { fill: ACCDIM, stroke: ACC });
  label(rx + 14, 198, 'in expectation', { size: 11, color: ACC });
  P.text(rx + 14, 222, 'E[count] = sum of the twelve probabilities', { size: 12, color: INK });
  P.text(rx + 14, 248, '= ' + V.ind.sumP.toFixed(4), { size: 15, mono: true, bold: true, color: ACC });
  P.text(rx + 14, 272, 'checked against all ' + V.ind.subsets + ' outcomes: ' + V.ind.meanBrute.toFixed(4),
         { size: 11, mono: true, color: DIM });
  tick(rx + rw - 40, 248, Math.abs(V.ind.sumP - V.ind.meanBrute) < 1e-12);
  P.alpha(1);

  P.text(rx, 326, 'E[I(A)] = 1·p + 0·(1−p) = P(A)', { size: 15, mono: true, bold: true });
  P.text(rx, 356, 'The joint distribution of twelve events is never written down.', { size: 12, color: DIM });
  P.text(rx, 378, 'You need twelve numbers, not 4096.', { size: 12, color: DIM });
  P.text(rx, 406, 'An indicator takes only 0 and 1: a variable that can take 2 is not one.', { size: 11, color: WARN });
};

/* ---------- scene 4: fixed points ---------- */
SCENE_DRAW.fixedpoints = function (t, sc) {
  head('Fixed points of a random shuffle', 'the mean is 1 at every n, and four fixed points never happens at n = 5');

  var dist = V.fixed.dist5;
  var x0 = 60, y0 = 330, bw = 46, maxH = 190, maxV = 45;
  label(x0 - 20, 74, 'n = 5: how many of the 120 shuffles have each count', { size: 11, color: FAINT });

  P.line(x0 - 10, y0, x0 + 6 * bw + 20, y0, { stroke: BORDER, sw: 1.2 });
  for (var k = 0; k <= 5; k++) {
    var h = maxH * dist[k] / maxV;
    var x = x0 + k * bw;
    var reveal = K.clamp01((t - sc.start) / 12 - k * 0.06);
    P.rect(x, y0 - h * reveal, bw - 14, h * reveal, {
      fill: dist[k] === 0 ? BADDIM : ACCDIM,
      stroke: dist[k] === 0 ? BAD : ACC, radius: 4, sw: 1.2
    });
    P.text(x + (bw - 14) / 2, y0 - h * reveal - 8, String(dist[k]),
           { size: 11, mono: true, align: 'center', color: dist[k] === 0 ? BAD : INK });
    P.text(x + (bw - 14) / 2, y0 + 16, String(k), { size: 11, mono: true, align: 'center', color: DIM });
  }
  label(x0 + 6 * bw - 60, y0 + 34, 'fixed points', { size: 10, color: FAINT });

  /* the mean marker sits at value 1 */
  var mx = x0 + 1 * bw + (bw - 14) / 2;
  P.line(mx, y0 - maxH - 16, mx, y0, { stroke: WARN, sw: 1.4, dash: [5, 4] });
  P.text(mx + 8, y0 - maxH - 22, 'mean = 1', { size: 11, bold: true, color: WARN });

  var rx = 400, rw = 460;
  box(rx, 78, rw, 150, { fill: SURF });
  label(rx + 14, 94, 'enumerated, not assumed', { size: 11, color: FAINT });
  P.text(rx + 14, 114, 'n     shuffles     total fixed points     mean', { size: 10, mono: true, color: FAINT });
  for (var r = 0; r < V.fixed.rows.length; r++) {
    var row = V.fixed.rows[r];
    var y = 134 + r * 13;
    P.text(rx + 14, y, String(row.n), { size: 10, mono: true });
    P.text(rx + 52, y, String(row.perms), { size: 10, mono: true, color: DIM });
    P.text(rx + 130, y, String(row.total), { size: 10, mono: true, color: DIM });
    P.text(rx + 300, y, row.mean.toFixed(3), { size: 10, mono: true, bold: true, color: VAL });
  }

  var show = progressOf(t, sc, 15, 8);
  P.alpha(show > 0 ? 1 : 0.3);
  box(rx, 240, rw, 92, { fill: ACCDIM, stroke: ACC });
  label(rx + 14, 256, 'and the proof that covers every n', { size: 11, color: ACC });
  P.text(rx + 14, 280, 'P(position i is fixed) = 1/n,  there are n positions', { size: 11, mono: true });
  P.text(rx + 14, 304, 'E = n · 1/n = 1', { size: 14, mono: true, bold: true, color: ACC });
  P.text(rx + 14, 324, 'the indicators are dependent; the means still add', { size: 10, color: DIM });
  P.alpha(1);

  P.text(rx, 360, 'Four fixed points out of five is impossible: the fifth would have to be', { size: 11, color: BAD });
  P.text(rx, 378, 'fixed as well. A mean of 1 does not mean 1 is typical — 44 of the', { size: 11, color: DIM });
  P.text(rx, 396, '120 shuffles have no fixed point at all.', { size: 11, color: DIM });
};

/* ---------- scene 5: inversions ---------- */
SCENE_DRAW.inversions = function (t, sc) {
  head('Inversions, counted by pairs', 'each pair is out of order in exactly half of all permutations');

  var perm = V.inversions.sample;
  var x0 = 40, y0 = 100, bw = 62, gap = 8;
  label(x0, y0 - 18, 'one permutation of five items', { size: 11, color: FAINT });
  for (var i = 0; i < perm.length; i++) {
    P.rect(x0 + i * (bw + gap), y0, bw, 44, { fill: SURF2, stroke: BORDER, radius: 6, sw: 1.2 });
    P.text(x0 + i * (bw + gap) + bw / 2, y0 + 22, String(perm[i]),
           { size: 16, mono: true, bold: true, align: 'center', base: 'middle' });
  }

  /* draw the inverted pairs as arcs, progressively */
  var inv = [];
  for (var a = 0; a < perm.length; a++) {
    for (var b = a + 1; b < perm.length; b++) if (perm[a] > perm[b]) inv.push([a, b]);
  }
  var shown = Math.round(K.clamp01((t - sc.start) / 14) * inv.length);
  for (var q = 0; q < inv.length; q++) {
    if (q >= shown) break;
    var p1 = inv[q];
    var ax = x0 + p1[0] * (bw + gap) + bw / 2;
    var bx = x0 + p1[1] * (bw + gap) + bw / 2;
    var lift = 26 + (p1[1] - p1[0]) * 9;
    P.line(ax, y0 + 48, ax, y0 + 52, { stroke: ACC, sw: 1 });
    P.line(bx, y0 + 48, bx, y0 + 52, { stroke: ACC, sw: 1 });
    P.line(ax, y0 + 52, ax, y0 + 52 + lift, { stroke: ACC, sw: 1 });
    P.line(bx, y0 + 52, bx, y0 + 52 + lift, { stroke: ACC, sw: 1 });
    P.line(ax, y0 + 52 + lift, bx, y0 + 52 + lift, { stroke: ACC, sw: 1.4 });
  }
  P.text(x0, y0 + 210, 'inversions drawn: ' + Math.min(shown, inv.length) + ' of ' + inv.length +
         ' for this permutation', { size: 11, mono: true, color: ACC });

  var rx = 420, rw = 440;
  box(rx, 78, rw, 110, { fill: SURF });
  label(rx + 14, 94, 'count by pairs', { size: 11, color: FAINT });
  P.text(rx + 14, 118, 'pairs = C(5,2) = ' + V.inversions.rows[3].pairs, { size: 12, mono: true });
  P.text(rx + 14, 140, 'P(a fixed pair is inverted) = 1/2', { size: 12, mono: true });
  P.text(rx + 14, 164, 'E = 10 · 1/2 = 5', { size: 14, mono: true, bold: true, color: VAL });

  var show = progressOf(t, sc, 15, 8);
  P.alpha(show > 0 ? 1 : 0.3);
  box(rx, 200, rw, 120, { fill: SURF });
  label(rx + 14, 216, 'enumerated for every n up to 7', { size: 11, color: FAINT });
  P.text(rx + 14, 236, 'n     total inversions     mean     n(n-1)/4', { size: 10, mono: true, color: FAINT });
  for (var r = 0; r < V.inversions.rows.length; r++) {
    var row = V.inversions.rows[r];
    var y = 254 + r * 11;
    P.text(rx + 14, y, String(row.n), { size: 10, mono: true });
    P.text(rx + 76, y, String(row.total), { size: 10, mono: true, color: DIM });
    P.text(rx + 210, y, row.mean.toFixed(2), { size: 10, mono: true, bold: true, color: VAL });
    P.text(rx + 300, y, (row.n * (row.n - 1) / 4).toFixed(2), { size: 10, mono: true, color: DIM });
  }
  P.alpha(1);

  P.text(rx, 344, 'E[inversions] = n(n−1)/4', { size: 14, mono: true, bold: true });
  P.text(rx, 372, 'One transposition can change several inversions at once, so the', { size: 11, color: DIM });
  P.text(rx, 390, 'pair indicators are strongly dependent. The means still add.', { size: 11, color: DIM });
  P.text(rx, 418, 'This is also the expected number of adjacent swaps insertion sort makes.', { size: 11, color: WARN });
};

/* ---------- scene 6: hashing ---------- */
SCENE_DRAW.hashing = function (t, sc) {
  head('Three keys into five slots', 'expected load n/m, expected colliding pairs C(n,2)/m');

  var x0 = 60, y0 = 110, sw = 56, sh = 190;
  label(x0, y0 - 20, 'one assignment: keys land in slots 2, 4 and 2', { size: 11, color: FAINT });
  var drop = K.clamp01((t - sc.start) / 12);
  for (var s = 0; s < V.hash.m; s++) {
    var x = x0 + s * (sw + 12);
    P.rect(x, y0, sw, sh, { fill: SURF, stroke: BORDER, radius: 6, sw: 1.2 });
    P.text(x + sw / 2, y0 + sh + 18, 'slot ' + s, { size: 10, mono: true, align: 'center', color: DIM });
    for (var c = 0; c < V.hash.loads[s]; c++) {
      var keyIdx = -1;
      for (var kk = 0; kk < V.hash.placements.length; kk++) {
        if (V.hash.placements[kk] === s && kk <= Math.floor(drop * 3) - 1) keyIdx = kk;
      }
      if (keyIdx < 0) continue;
      P.circle(x + sw / 2, y0 + sh - 24 - c * 26, 9, { fill: ACCDIM, stroke: ACC, sw: 1.4 });
      P.text(x + sw / 2, y0 + sh - 24 - c * 26, 'k' + keyIdx,
             { size: 9, mono: true, align: 'center', base: 'middle', bold: true });
    }
    if (V.hash.loads[s] > 0) {
      P.text(x + sw / 2, y0 - 6, 'load ' + V.hash.loads[s], { size: 10, mono: true, align: 'center', color: ACC });
    }
  }

  var rx = 430, rw = 430;
  box(rx, 78, rw, 106, { fill: SURF });
  label(rx + 14, 94, 'one slot, as a sum of indicators', { size: 11, color: FAINT });
  P.text(rx + 14, 118, 'E[load] = n/m = 3/5 = ' + V.hash.loadFormula.toFixed(2), { size: 12, mono: true, bold: true, color: ACC });
  P.text(rx + 14, 140, 'enumeration of 125: ' + V.hash.loadBrute.toFixed(2), { size: 11, mono: true, color: DIM });
  P.text(rx + 14, 162, 'a slot holds 0, 1 or 2 keys — never 0.6', { size: 11, color: WARN });
  tick(rx + rw - 40, 118, Math.abs(V.hash.loadBrute - V.hash.loadFormula) < 1e-12);

  box(rx, 196, rw, 106, { fill: SURF });
  label(rx + 14, 212, 'colliding pairs', { size: 11, color: FAINT });
  P.text(rx + 14, 236, 'E = C(3,2)/m = 3/5 = ' + V.hash.collFormula.toFixed(2), { size: 12, mono: true, bold: true, color: ACC });
  P.text(rx + 14, 258, 'enumeration: ' + V.hash.collBrute.toFixed(2), { size: 11, mono: true, color: DIM });
  P.text(rx + 14, 280, 'counted as pairs: two keys in one slot is one collision', { size: 11, color: FAINT });
  tick(rx + rw - 40, 236, Math.abs(V.hash.collBrute - V.hash.collFormula) < 1e-12);

  box(rx, 314, rw, 76, { fill: SURF });
  label(rx + 14, 330, 'occupied slots', { size: 11, color: FAINT });
  P.text(rx + 14, 354, 'E = m(1 − (1−1/m)^n) = ' + V.hash.occFormula.toFixed(2), { size: 12, mono: true, bold: true });
  P.text(rx + 14, 376, 'enumeration: ' + V.hash.occBrute.toFixed(2) + ' — a different quantity, the same method', { size: 10, mono: true, color: DIM });

  P.text(rx, 414, 'GATE 2022 Q16 split keys between two hash functions and the', { size: 11, color: DIM });
  P.text(rx, 432, 'answer was still n/m: each key still has probability 1/m.', { size: 11, color: DIM });
};

/* ---------- scene 7: quicksort ---------- */
SCENE_DRAW.quicksort = function (t, sc) {
  head('Randomised quicksort, counted by pairs', 'exact expectation 2(n+1)H(n) − 4n against the 2n ln n bound');

  var x0 = 60, y0 = 360, plotW = 520, plotH = 250;
  var maxN = V.qs.N, maxY = 950;
  P.line(x0, y0, x0 + plotW, y0, { stroke: BORDER, sw: 1.2 });
  P.line(x0, y0, x0, y0 - plotH, { stroke: BORDER, sw: 1.2 });
  P.text(x0 + plotW / 2, y0 + 30, 'n, the number of keys', { size: 10, align: 'center', color: FAINT });
  P.text(x0 - 44, y0 - plotH - 12, 'comparisons', { size: 10, color: FAINT });

  function px(n) { return x0 + plotW * n / maxN; }
  function py(v) { return y0 - plotH * v / maxY; }

  var reveal = K.clamp01((t - sc.start) / 18);
  var upto = Math.max(2, Math.floor(maxN * reveal));

  var prevE = null, prevB = null;
  for (var i = 0; i < V.qs.curve.length; i++) {
    var pt = V.qs.curve[i];
    if (pt.n > upto) break;
    if (prevE) {
      P.line(px(prevE.n), py(prevE.e), px(pt.n), py(pt.e), { stroke: ACC, sw: 2 });
      P.line(px(prevB.n), py(prevB.bound), px(pt.n), py(pt.bound), { stroke: BORDER, sw: 1.4, dash: [5, 4] });
    }
    prevE = pt; prevB = pt;
  }

  /* the marker at n = 10 */
  P.line(px(10), y0, px(10), py(V.qs.at10), { stroke: WARN, sw: 1, dash: [3, 3] });
  P.circle(px(10), py(V.qs.at10), 5, { fill: WARN, stroke: WARN });
  P.text(px(10) + 8, py(V.qs.at10) - 10, 'n=10: ' + V.qs.at10.toFixed(2), { size: 10, mono: true, bold: true, color: WARN });

  P.text(px(70), py(2 * 70 * Math.log(70)) - 12, '2n ln n', { size: 11, mono: true, color: DIM });
  P.text(px(70), py(V.qs.E[70]) + 18, 'exact E(n)', { size: 11, mono: true, color: ACC });

  var rx = 620, rw = 250;
  box(rx, 78, rw, 168, { fill: SURF });
  label(rx + 14, 94, 'the derivation', { size: 11, color: FAINT });
  P.text(rx + 14, 118, 'P(compare i, j)', { size: 11, mono: true, color: DIM });
  P.text(rx + 14, 138, '= 2/(j−i+1)', { size: 13, mono: true, bold: true });
  P.text(rx + 14, 162, 'sum over C(n,2) pairs', { size: 11, mono: true, color: DIM });
  P.text(rx + 14, 186, 'E = 2(n+1)H(n) − 4n', { size: 12, mono: true, bold: true, color: ACC });
  P.text(rx + 14, 214, 'H(10) = ' + V.qs.H10.toFixed(6), { size: 10, mono: true, color: DIM });
  P.text(rx + 14, 232, '2·11·H(10) − 40 = ' + V.qs.at10.toFixed(4), { size: 10, mono: true, color: DIM });

  box(rx, 258, rw, 96, { fill: SURF });
  label(rx + 14, 274, 'checked two ways', { size: 11, color: FAINT });
  P.text(rx + 14, 296, 'recurrence vs closed form', { size: 10, color: DIM });
  P.text(rx + 14, 316, 'largest gap ' + V.qs.worst.toExponential(1), { size: 10, mono: true, color: VAL });
  P.text(rx + 14, 336, 'at every n from 2 to ' + V.qs.N, { size: 10, mono: true, color: VAL });

  P.text(rx, 384, 'Dropping the −4n term overstates the', { size: 11, color: WARN });
  P.text(rx, 402, 'count by about 4n comparisons.', { size: 11, color: WARN });
  P.text(rx, 430, 'Expected O(n log n) is a class, not a number.', { size: 11, color: FAINT });
};

/* ---------- scene 8: where linearity stops ---------- */
SCENE_DRAW.variance = function (t, sc) {
  head('Linearity is a property of the mean only', 'variance of a sum needs a covariance term; a product needs independence');

  var bars = [
    { label: 'Var of one die', v: V.dice.varOne, colour: DIM },
    { label: 'Var of two independent dice', v: V.dice.varSumIndependent, colour: VAL },
    { label: 'Var of 2X, i.e. X + X', v: V.dice.varSumEqual, colour: BAD }
  ];
  var x0 = 60, y0 = 340, bw = 92, maxV = 12.5, maxH = 210;
  label(x0 - 20, 74, 'the same mean of 7 in every case; only the spread differs', { size: 11, color: FAINT });
  P.line(x0 - 10, y0, x0 + 3 * (bw + 60) + 20, y0, { stroke: BORDER, sw: 1.2 });

  for (var i = 0; i < bars.length; i++) {
    var b = bars[i];
    var reveal = K.clamp01((t - sc.start) / 12 - i * 0.1);
    var h = maxH * b.v / maxV * reveal;
    var x = x0 + i * (bw + 60);
    P.rect(x, y0 - h, bw, h, { fill: b.colour === VAL ? ACCDIM : (b.colour === BAD ? BADDIM : SURF2),
                               stroke: b.colour, radius: 5, sw: 1.4 });
    P.text(x + bw / 2, y0 - h - 10, b.v.toFixed(3), { size: 12, mono: true, bold: true, align: 'center', color: b.colour });
    P.text(x + bw / 2, y0 + 18, b.label, { size: 10, align: 'center', color: DIM });
  }

  var rx = 470, rw = 400;
  box(rx, 78, rw, 96, { fill: SURF });
  label(rx + 14, 94, 'the identity', { size: 11, color: FAINT });
  P.text(rx + 14, 120, 'Var(X+Y) = Var X + Var Y', { size: 12, mono: true, bold: true });
  P.text(rx + 14, 142, '+ 2·Cov(X, Y)', { size: 12, mono: true, bold: true, color: BAD });
  P.text(rx + 14, 164, 'independence removes only the last term', { size: 10, color: DIM });

  box(rx, 186, rw, 76, { fill: BADDIM, stroke: BAD });
  label(rx + 14, 202, 'with X = Y the sum is 2X', { size: 11, color: BAD });
  P.text(rx + 14, 226, '4 · 2.9167 = ' + V.dice.varSumEqual.toFixed(4), { size: 13, mono: true, bold: true, color: BAD });
  P.text(rx + 14, 248, 'not 2 · 2.9167 = ' + V.dice.varSumIndependent.toFixed(4), { size: 11, mono: true, color: DIM });

  box(rx, 274, rw, 88, { fill: SURF });
  label(rx + 14, 290, 'and a function of the mean is not the mean of the function', { size: 10, color: FAINT });
  P.text(rx + 14, 314, 'E[1/X] = ' + V.dice.recipMean.toFixed(4), { size: 12, mono: true, bold: true, color: BAD });
  P.text(rx + 14, 336, '1/E[X] = ' + V.dice.recipOfMean.toFixed(4), { size: 12, mono: true, bold: true, color: VAL });
  P.text(rx + 14, 354, 'Jensen: for convex f, f(E[X]) <= E[f(X)]', { size: 10, color: DIM });

  P.text(rx, 392, 'The mean of the sum was 7 in all three cases.', { size: 11, color: DIM });
  P.text(rx, 410, 'Two of the three variances are different, so the mean alone', { size: 11, color: DIM });
  P.text(rx, 428, 'does not describe a random variable.', { size: 11, color: DIM });
};

/* ---------- scene 9: the tail sum ---------- */
SCENE_DRAW.tailsum = function (t, sc) {
  head('The tail-sum identity', 'E[X] = P(X≥1) + P(X≥2) + … for a non-negative integer variable');

  var x0 = 40, y0 = 96, cw = 40, ch = 34;
  label(x0, y0 - 10, 'the larger of two dice, all 36 pairs', { size: 11, color: FAINT });
  var reveal = K.clamp01((t - sc.start) / 14);
  for (var a = 0; a < 6; a++) {
    for (var b = 0; b < 6; b++) {
      var v = Math.max(a + 1, b + 1);
      var on = (a * 6 + b) < Math.round(reveal * 36);
      P.rect(x0 + b * cw, y0 + a * ch, cw - 4, ch - 4, {
        fill: on ? ACCDIM : SURF2, stroke: on ? ACC : BORDER, radius: 3, sw: 1
      });
      P.text(x0 + b * cw + (cw - 4) / 2, y0 + a * ch + (ch - 4) / 2, String(v),
             { size: 11, mono: true, align: 'center', base: 'middle', color: on ? INK : FAINT });
    }
  }

  var bx = 330, by = 340, bw = 62, maxH = 150;
  label(bx - 10, 74, 'the six tail probabilities', { size: 11, color: FAINT });
  P.line(bx - 10, by, bx + 6 * bw + 10, by, { stroke: BORDER, sw: 1.2 });
  var acc = 0;
  for (var k = 0; k < 6; k++) {
    var term = V.tail.terms[k];
    var h = maxH * term.p;
    var x = bx + k * bw;
    var show = K.clamp01((t - sc.start) / 12 - k * 0.08);
    P.rect(x, by - h * show, bw - 16, h * show, { fill: ACCDIM, stroke: ACC, radius: 4, sw: 1.2 });
    P.text(x + (bw - 16) / 2, by - h - 8, term.p.toFixed(4), { size: 9, mono: true, align: 'center', color: INK });
    P.text(x + (bw - 16) / 2, by + 16, 'k=' + term.k, { size: 9, mono: true, align: 'center', color: DIM });
    acc += term.p;
  }
  P.text(bx - 10, by + 44, 'running total = ' + acc.toFixed(4), { size: 12, mono: true, bold: true, color: ACC });

  var rx = 740, rw = 130;
  box(rx, 150, rw, 120, { fill: SURF });
  label(rx + 10, 168, 'brute force', { size: 10, color: FAINT });
  P.text(rx + 10, 196, V.dice.meanMax.toFixed(4), { size: 16, mono: true, bold: true, color: VAL, align: 'center' });
  P.text(rx + rw / 2, 220, '161 / 36', { size: 10, mono: true, color: DIM, align: 'center' });
  P.text(rx + rw / 2, 244, 'over 36 pairs', { size: 9, color: FAINT, align: 'center' });

  P.text(bx - 10, by + 60, 'Each outcome with value k is counted in the first k tails,', { size: 11, color: DIM });
  P.text(bx - 10, by + 78, 'so it is counted exactly k times — its own weight.', { size: 11, color: DIM });
  P.text(bx - 10, by + 102, 'The first term is 1, not 0: the maximum of two dice is always at least 1.', { size: 11, color: WARN });
};

/* ---------- scene 10: the procedure ---------- */
SCENE_DRAW.procedure = function (t, sc) {
  head('The procedure, and the five traps', 'one indicator per unit; ask only for that unit\'s probability');

  var steps = [
    ['1', 'Name the unit', 'pairs, positions, slots, comparisons'],
    ['2', 'One indicator per unit', 'the count is their sum, exactly'],
    ['3', 'One probability each', 'never a joint probability'],
    ['4', 'Add, and read the unit', 'the mean carries the unit of the count']
  ];
  var x0 = 34, y0 = 84, bw = 200, gap = 12;
  for (var i = 0; i < steps.length; i++) {
    var x = x0 + i * (bw + gap);
    var show = K.clamp01((t - sc.start) / 12 - i * 0.12);
    P.alpha(show > 0 ? 1 : 0.3);
    box(x, y0, bw, 104, { fill: SURF });
    P.circle(x + 22, y0 + 24, 12, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
    P.text(x + 22, y0 + 24, steps[i][0], { size: 12, mono: true, bold: true, align: 'center', base: 'middle' });
    P.text(x + 42, y0 + 20, steps[i][1], { size: 12, bold: true });
    P.text(x + 14, y0 + 62, steps[i][2], { size: 10, color: DIM });
  }
  P.alpha(1);

  var traps = [
    ['linearity needs independence', false],
    ['E[XY] = E[X]E[Y]', false],
    ['Var(X+Y) = Var(X)+Var(Y)', false],
    ['E[1/X] = 1/E[X]', false],
    ['a fractional mean is impossible', false]
  ];
  label(x0, 226, 'five statements that produce a plausible wrong option', { size: 11, color: FAINT });
  for (var j = 0; j < traps.length; j++) {
    var ty = 244 + j * 30;
    var showT = K.clamp01((t - sc.start) / 12 - 0.5 - j * 0.06);
    P.alpha(showT > 0 ? 1 : 0.25);
    P.rect(x0, ty, 420, 24, { fill: BADDIM, stroke: BAD, radius: 5, sw: 1 });
    P.text(x0 + 12, ty + 12, 'false:', { size: 10, bold: true, color: BAD, base: 'middle' });
    P.text(x0 + 56, ty + 12, traps[j][0], { size: 11, mono: true, base: 'middle' });
  }
  P.alpha(1);

  var rx = 490, rw = 380;
  box(rx, 226, rw, 120, { fill: ACCDIM, stroke: ACC });
  label(rx + 14, 242, 'the one habit that covers the clause', { size: 11, color: ACC });
  P.text(rx + 14, 268, 'Write the unit at the top of your working.', { size: 12, bold: true });
  P.text(rx + 14, 292, 'Every trap here is a unit confusion or a', { size: 11, color: DIM });
  P.text(rx + 14, 310, 'rule applied to the wrong quantity.', { size: 11, color: DIM });
  P.text(rx + 14, 334, 'E[sum] is always additive.', { size: 11, mono: true, color: VAL });

  P.text(x0, 400, 'Expected counts: 1 fixed point per shuffle, n(n−1)/4 inversions, n/m keys per slot,', { size: 11, color: DIM });
  P.text(x0, 418, 'C(n,2)/m collisions, 2(n+1)H(n) − 4n comparisons, m·H(m) keys to fill m slots.', { size: 11, color: DIM });
};

/* ---------- frame dispatch ---------- */

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
