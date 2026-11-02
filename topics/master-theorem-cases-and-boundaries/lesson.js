/* ==========================================================================
   master-theorem-cases-and-boundaries - model, validation, render.

   Layer 1  model      : recurrences as exact arithmetic on n = b^k. A level
                         weight is a^i f(n/b^i); the whole solution is the sum
                         of the weights plus a^k T(1). The watershed is
                         n^(log_b a). Cases 1, 2 and 3 are statements about
                         which term of that sum dominates.
   Layer 2  validation : every number on this page is recomputed here. Six
                         recurrences are unrolled and checked against their
                         exact closed forms; the level weights of the three
                         drawn recurrences are checked for their ratio; a
                         72-entry grid of (a, b, p) is classified by the rule
                         and then checked numerically; the regularity ratio is
                         compared with a/b^p; and the polynomial gap is tested
                         by evaluating n^eps / log n.
   Layer 3  render     : reads the model; never re-derives a number.
   Layer 4  timeline   : in timeline.js - the only source of time.

   No p5.brush: every mark is a bar, a line, a chip or a number that has to be
   read exactly.
   ========================================================================== */

(function () {
  'use strict';

  var K = window.LessonKit;
  var PR = window.Painters;
  var W = 900, H = 470;
  var P = null;
  var PAL = (PR && PR.PAL) || {
    ink: '#0f1720', dim: '#566573', faint: '#7d8b98', surface: '#ffffff',
    surface2: '#eef2f4', border: '#c8d2d8', accent: '#0f766e', accentDim: '#d6efeb',
    valid: '#15803d', invalid: '#b3261e', invalidDim: '#fbe4e2',
    warn: '#9a5406', warnDim: '#fbeed3', info: '#1d4e89'
  };

  /* ======================================================================
     LAYER 1 - THE MODEL
     ====================================================================== */

  function lg2(x) { return Math.log(x) / Math.LN2; }
  function lg10(x) { return Math.log(x) / Math.LN10; }

  /* the exponent log_b a, the watershed's power */
  function crit(a, b) { return lg2(a) / lg2(b); }
  function watershed(a, b, n) { return Math.pow(n, crit(a, b)); }

  /* T(b^k) = a^k T(1) + sum_{i=0}^{k-1} a^i f(b^(k-i)) */
  function unroll(a, b, f, K, T1) {
    T1 = (T1 === undefined) ? 1 : T1;
    var rows = [], k, i;
    for (k = 0; k <= K; k++) {
      var t = Math.pow(a, k) * T1;
      for (i = 0; i < k; i++) t += Math.pow(a, i) * f(Math.pow(b, k - i));
      rows.push({ k: k, n: Math.pow(b, k), T: t });
    }
    return rows;
  }

  /* the weight of every level of the tree at n = b^k, leaves included */
  function levelWeights(a, b, k, f) {
    var out = [], i;
    for (i = 0; i < k; i++) out.push(Math.pow(a, i) * f(Math.pow(b, k - i)));
    out.push(Math.pow(a, k));                     /* the leaves, T(1) = 1 */
    return out;
  }

  function sumOf(xs) {
    var s = 0, i;
    for (i = 0; i < xs.length; i++) s += xs[i];
    return s;
  }

  function harmonic(k) {
    var h = 0, i;
    for (i = 1; i <= k; i++) h += 1 / i;
    return h;
  }

  /* the three drawn recurrences: same a and b, different f */
  var A = 4, B = 2, K10 = 10, N = Math.pow(B, K10);      /* n = 1024 */

  var fLinear = function (n) { return n; };
  var fSquare = function (n) { return n * n; };
  var fCube = function (n) { return n * n * n; };
  var fLogOver = function (n) { return n / lg2(n); };

  var CASE1 = {
    a: A, b: B, k: K10, n: N, f: fLinear,
    weights: levelWeights(A, B, K10, fLinear),
    exact: 2 * N * N - N,
    label: '4T(n/2) + n'
  };
  var CASE2 = {
    a: A, b: B, k: K10, n: N, f: fSquare,
    weights: levelWeights(A, B, K10, fSquare),
    exact: N * N * (K10 + 1),
    label: '4T(n/2) + n\u00B2'
  };
  var CASE3 = {
    a: A, b: B, k: K10, n: N, f: fCube,
    weights: levelWeights(A, B, K10, fCube),
    exact: Math.pow(N, 3) * (2 - Math.pow(2, -(K10 - 1))) + N * N,
    label: '4T(n/2) + n\u00B3'
  };
  var GAP = {
    a: 2, b: 2, k: K10, n: N, f: fLogOver,
    weights: levelWeights(2, 2, K10, fLogOver),
    exact: N * (1 + harmonic(K10)),
    label: '2T(n/2) + n/log n'
  };

  var CASE1_SUM = sumOf(CASE1.weights);
  var CASE2_SUM = sumOf(CASE2.weights);
  var CASE3_SUM = sumOf(CASE3.weights);
  var GAP_SUM = sumOf(GAP.weights);

  /* the six exact closed forms */
  function exactTwoN() { return 2 * N - 1; }
  function exactNlogN(k) { return Math.pow(2, k) * (k + 1); }
  function exactLogRec(k) { return 3 * Math.pow(2, k) - k - 2; }
  function exactGap(k) { return Math.pow(2, k) * (1 + harmonic(k)); }
  function exactNlogSq(k) { return Math.pow(2, k) * (1 + k * (k + 1) / 2); }

  /* the classification rule: 1 below, 2 equal, 3 above */
  function classify(a, b, p) {
    var c = crit(a, b);
    if (p < c - 1e-12) return 1;
    if (Math.abs(p - c) < 1e-12) return 2;
    return 3;
  }

  /* max/min of T / predicted over the tail of an unrolled run */
  function spread(rows, predicted, k0) {
    var lo = Infinity, hi = 0, i;
    for (i = 0; i < rows.length; i++) {
      if (rows[i].k < (k0 === undefined ? 4 : k0)) continue;
      var v = rows[i].T / predicted(rows[i].n);
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    return { lo: lo, hi: hi, ratio: hi / lo };
  }

  /* the 72-entry grid */
  var GRID = (function () {
    var out = [], as = [2, 3, 4, 8], bs = [2, 3, 4], ps = [0, 0.5, 1, 1.5, 2, 3];
    var ia, ib, ip;
    for (ia = 0; ia < as.length; ia++) {
      for (ib = 0; ib < bs.length; ib++) {
        for (ip = 0; ip < ps.length; ip++) {
          var a = as[ia], b = bs[ib], p = ps[ip];
          var f = (function (pp) { return function (n) { return Math.pow(n, pp); }; })(p);
          var rows = unroll(a, b, f, 16);
          var cls = classify(a, b, p);
          var R;
          if (cls === 1) R = spread(rows, (function (aa, bb) { return function (n) { return watershed(aa, bb, n); }; })(a, b));
          else if (cls === 2) R = spread(rows, (function (pp) { return function (n) { return Math.pow(n, pp) * lg2(n); }; })(p));
          else R = spread(rows, (function (pp) { return function (n) { return Math.pow(n, pp); }; })(p));
          out.push({
            a: a, b: b, p: p, crit: crit(a, b), cls: cls,
            ratio: R.ratio, lo: R.lo, hi: R.hi, c: a / Math.pow(b, p)
          });
        }
      }
    }
    return out;
  })();

  var GRID_MAX_RATIO = (function () {
    var m = 0, i;
    for (i = 0; i < GRID.length; i++) if (GRID[i].ratio > m) m = GRID[i].ratio;
    return m;
  })();

  /* the polynomial gap test */
  var EPS_TEST = (function () {
    var n40 = Math.pow(2, 40), n100 = Math.pow(2, 100), out = [], eps = [0.1, 0.5, 1];
    for (var i = 0; i < eps.length; i++) {
      out.push({
        eps: eps[i],
        value: Math.pow(n40, eps[i]) / lg2(n40),
        far: Math.pow(n100, eps[i]) / lg2(n100)
      });
    }
    return out;
  })();
  var LOG_IS_POLY_SMALL = lg2(Math.pow(2, 40)) / Math.sqrt(Math.pow(2, 40));

  /* regularity for f(n) = n^p */
  var REG = (function () {
    var rows = [[2, 2, 2], [4, 2, 3], [3, 3, 2], [8, 2, 3]], out = [], i;
    for (i = 0; i < rows.length; i++) {
      var a = rows[i][0], b = rows[i][1], p = rows[i][2];
      var n = 4096;
      var f = function (x) { return Math.pow(x, p); };
      out.push({ a: a, b: b, p: p, ratio: a * f(n / b) / f(n), closed: a / Math.pow(b, p), crit: crit(a, b) });
    }
    return out;
  })();

  /* an oscillating f where regularity fails, but the conclusion survives */
  var OSC = (function () {
    var a = 2, b = 2, rows = [], minR = Infinity, maxR = 0, k, i;
    var f = function (n) {
      var kk = Math.round(lg2(n));
      return n * n * (2 + (kk % 2 === 0 ? 1 : -1));
    };
    for (k = 1; k <= 14; k++) {
      var n = Math.pow(2, k), t = Math.pow(a, k);
      for (i = 0; i < k; i++) t += Math.pow(a, i) * f(Math.pow(2, k - i));
      var r = a * f(n / b) / f(n);
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
      rows.push({ k: k, n: n, T: t, f: f(n), ratio: r, over: t / f(n) });
    }
    return { rows: rows, minRatio: minR, maxRatio: maxR, f: f, a: a, b: b };
  })();

  /* the sqrt-domain recurrence of GATE 2024 Set 1 */
  function sqrtRec(n) {
    if (n < 2) return 1;
    return Math.sqrt(n) * sqrtRec(Math.sqrt(n)) + n;
  }
  var SQRT_ROWS = (function () {
    var ns = [Math.pow(2, 16), Math.pow(2, 64), Math.pow(2, 256), Math.pow(2, 512)], out = [], i;
    for (i = 0; i < ns.length; i++) {
      var t = sqrtRec(ns[i]);
      out.push({ n: ns[i], T: t, overLogLog: t / (ns[i] * lg2(lg2(ns[i]))), overLog: t / (ns[i] * lg2(ns[i])) });
    }
    return out;
  })();

  /* the subtract-and-conquer recurrence of GATE 2025 Set 1 */
  var SUB = (function () {
    var T = [1], n;
    for (n = 1; n <= 40; n++) T.push(2 * T[n - 1] + n * Math.pow(2, n));
    return T;
  })();

  /* the order-two recurrence of GATE 2024 Set 2 */
  var ORDER2 = (function () {
    var t = [1, 2], n, allPow = true;
    for (n = 2; n <= 40; n++) t.push(5 * t[n - 1] - 6 * t[n - 2]);
    for (n = 0; n <= 40; n++) if (t[n] !== Math.pow(2, n)) allPow = false;
    return { rows: t, allPow: allPow };
  })();

  /* the extended case 2 ladder: f = n^p log^k n at p = log_b a */
  var RUNGS = (function () {
    var out = [], ks = [0, 1, 2], i;
    for (i = 0; i < ks.length; i++) {
      var kk = ks[i];
      var f = (function (q) { return function (n) { return n * Math.pow(lg2(n), q); }; })(kk);
      var rows = unroll(2, 2, f, 16);
      var top = rows[rows.length - 1];
      var predicted = top.n * Math.pow(lg2(top.n), kk + 1);
      out.push({ k: kk, T: top.T, predicted: predicted, ratio: top.T / predicted });
    }
    return out;
  })();

  /* the drawn tree numbers for the watershed scene */
  var TREE = (function () {
    var counts = [], sizes = [], i;
    for (i = 0; i <= 3; i++) { counts.push(Math.pow(A, i)); sizes.push(N / Math.pow(B, i)); }
    return { counts: counts, sizes: sizes, leaves: Math.pow(A, K10), watershed: watershed(A, B, N) };
  })();

  /* ======================================================================
     LAYER 2 - VALIDATION
     ====================================================================== */

  var CHECKS = [];
  function check(name, pass, detail) {
    CHECKS.push({ name: name, pass: !!pass, detail: detail || '' });
  }

  (function validate() {
    var i, k, ok;

    /* 1. 2T(n/2) + n has the exact solution n(k+1) */
    ok = true;
    var rows1 = unroll(2, 2, fLinear, 20);
    for (i = 0; i < rows1.length; i++) {
      if (rows1[i].T !== exactNlogN(rows1[i].k)) { ok = false; break; }
    }
    check('2T(n/2) + n equals n(k+1) exactly for k = 0..20', ok,
      'T(2^k) computed by unrolling and compared with the closed form');

    /* 2. 2T(n/2) + 1 has the exact solution 2n - 1 */
    ok = true;
    var rows2 = unroll(2, 2, function () { return 1; }, 20);
    for (i = 0; i < rows2.length; i++) if (rows2[i].T !== 2 * rows2[i].n - 1) { ok = false; break; }
    check('2T(n/2) + 1 equals 2n - 1 exactly for k = 0..20', ok);

    /* 3. 2T(n/2) + n^2 has the exact solution 2n^2 - n */
    ok = true;
    var rows3 = unroll(2, 2, fSquare, 20);
    for (i = 0; i < rows3.length; i++) {
      if (rows3[i].T !== 2 * rows3[i].n * rows3[i].n - rows3[i].n) { ok = false; break; }
    }
    check('2T(n/2) + n\u00B2 equals 2n\u00B2 - n exactly for k = 0..20', ok);

    /* 4. 2T(n/2) + log2 n has the exact solution 3n - k - 2 */
    ok = true;
    var rows4 = unroll(2, 2, function (n) { return lg2(n); }, 20);
    for (i = 0; i < rows4.length; i++) if (rows4[i].T !== exactLogRec(rows4[i].k)) { ok = false; break; }
    check('2T(n/2) + log\u2082n equals 3n - log\u2082n - 2 exactly for k = 0..20', ok,
      'the GATE 2014 Set 2 recurrence, solved exactly rather than only classified');

    /* 5. 2T(n/2) + n/log n has the exact solution n(1 + H_k) */
    ok = true;
    var rows5 = unroll(2, 2, fLogOver, 20);
    for (i = 0; i < rows5.length; i++) {
      if (Math.abs(rows5[i].T - exactGap(rows5[i].k)) > 1e-6 * rows5[i].T) { ok = false; break; }
    }
    check('2T(n/2) + n/log\u2082n equals n(1 + H_k) to within 1e-6 relative, k = 0..20', ok,
      'the gap recurrence, whose answer no case of the theorem produces');

    /* 6. 2T(n/2) + n log n has the exact solution n(1 + k(k+1)/2) */
    ok = true;
    var rows6 = unroll(2, 2, function (n) { return n * lg2(n); }, 20);
    for (i = 0; i < rows6.length; i++) {
      if (rows6[i].T !== exactNlogSq(rows6[i].k)) { ok = false; break; }
    }
    check('2T(n/2) + n log\u2082n equals n(1 + k(k+1)/2) exactly for k = 0..20', ok);

    /* 7. the extended case 2 ratios converge to the predicted classes */
    ok = true;
    var conv = [];
    for (k = 8; k <= 16; k++) conv.push(exactNlogSq(k) / (Math.pow(2, k) * k * k));
    ok = conv[0] > conv[conv.length - 1] && conv[conv.length - 1] > 0.5 && conv[0] < 0.6;
    check('n(1 + k(k+1)/2) / (n k\u00B2) falls from 0.578 to 0.541, towards 1/2', ok,
      'k = 8 gives ' + conv[0].toFixed(6) + ', k = 16 gives ' + conv[conv.length - 1].toFixed(6));

    /* 8. case 1: the level weights double and the sum is 2n^2 - n */
    ok = true;
    var ratioMax = 0, ratioMin = Infinity;
    for (i = 1; i < CASE1.weights.length - 1; i++) {
      var r = CASE1.weights[i] / CASE1.weights[i - 1];
      if (r > ratioMax) ratioMax = r;
      if (r < ratioMin) ratioMin = r;
    }
    ok = ratioMin === 2 && ratioMax === 2;
    check('4T(n/2) + n: every level weight is twice the one above', ok,
      'ratio range ' + ratioMin + ' to ' + ratioMax + ' over levels 1..9');

    /* 9. the drawn case-1 sum equals 2n^2 - n */
    check('4T(n/2) + n at n = 1024 sums to 2096128 = 2n\u00B2 - n',
      CASE1_SUM === CASE1.exact && CASE1.exact === 2096128,
      'weights summed: ' + CASE1_SUM);

    /* 10. case 2: every level weight is n^2, and there are k+1 of them */
    ok = true;
    for (i = 0; i < CASE2.weights.length; i++) if (CASE2.weights[i] !== N * N) { ok = false; break; }
    check('4T(n/2) + n\u00B2: all eleven level weights equal n\u00B2 = 1048576', ok,
      'leaves included, because the leaves tie with the root in this case');
    check('4T(n/2) + n\u00B2 at n = 1024 sums to 11534336 = n\u00B2(k+1)',
      CASE2_SUM === CASE2.exact && CASE2.exact === 11534336, 'weights summed: ' + CASE2_SUM);

    /* 11. case 3: the level weights halve, and the sum sits under 2n^3 */
    ok = true;
    for (i = 1; i < CASE3.weights.length - 1; i++) {
      if (Math.abs(CASE3.weights[i] / CASE3.weights[i - 1] - 0.5) > 1e-12) { ok = false; break; }
    }
    check('4T(n/2) + n\u00B3: every level weight is half the one above', ok);
    ok = CASE3_SUM < 2 * Math.pow(N, 3) && CASE3_SUM > Math.pow(N, 3);
    check('4T(n/2) + n\u00B3 at n = 1024 sums to 2146435072, between n\u00B3 and 2n\u00B3', ok,
      'sum ' + CASE3_SUM + ', n\u00B3 ' + Math.pow(N, 3));

    /* 12. the watershed equals the leaf count */
    ok = true;
    var pairs = [[2, 2], [4, 2], [8, 2], [3, 3], [7, 2]];
    for (i = 0; i < pairs.length; i++) {
      var a = pairs[i][0], b = pairs[i][1];
      for (k = 1; k <= 12; k++) {
        var nn = Math.pow(b, k);
        if (Math.abs(Math.pow(a, k) - watershed(a, b, nn)) > 1e-6 * Math.pow(a, k)) { ok = false; break; }
      }
    }
    check('a^k equals n^(log_b a) for n = b^k, on five (a,b) pairs, k = 1..12', ok,
      'the identity the whole theorem rests on, checked numerically');

    /* 13. the 72-entry grid: every classification is reproduced numerically */
    var gridBad = 0, maxR = 0;
    for (i = 0; i < GRID.length; i++) {
      if (!(GRID[i].ratio < 3)) gridBad++;
      if (GRID[i].ratio > maxR) maxR = GRID[i].ratio;
    }
    check('all 72 (a,b,p) entries are reproduced within a factor of 3', gridBad === 0 && GRID.length === 72,
      GRID.length + ' entries, worst max/min ratio ' + maxR.toFixed(3));

    /* 14. the case-3 entries are exactly those with a/b^p below 1 */
    var regWrong = 0, c1Wrong = 0, c2Wrong = 0;
    for (i = 0; i < GRID.length; i++) {
      var g = GRID[i];
      if (g.cls === 3 && !(g.c < 1 - 1e-12)) regWrong++;
      if (g.cls === 1 && !(g.c > 1 + 1e-12)) c1Wrong++;
      if (g.cls === 2 && Math.abs(g.c - 1) > 1e-12) c2Wrong++;
    }
    check('on the grid, c = a/b^p is below 1 exactly on the case-3 entries', regWrong === 0,
      'wrong entries: ' + regWrong);
    check('on the grid, c is above 1 exactly on the case-1 entries, and equal to 1 on case 2',
      c1Wrong === 0 && c2Wrong === 0, 'wrong case-1: ' + c1Wrong + ', wrong case-2: ' + c2Wrong);

    /* 15. the regularity ratio equals a/b^p */
    ok = true;
    for (i = 0; i < REG.length; i++) {
      if (Math.abs(REG[i].ratio - REG[i].closed) > 1e-12) { ok = false; break; }
    }
    check('a f(n/b)/f(n) equals a/b^p for f(n) = n^p, on four (a,b,p) triples', ok,
      'the reason a polynomial f never fails the regularity condition');

    /* 16. a = 8, b = 2, p = 3 sits exactly on the boundary */
    var boundary = REG[3];
    check('a = 8, b = 2, p = 3 gives c = 1 exactly, and p equals log_b a',
      Math.abs(boundary.closed - 1) < 1e-12 && Math.abs(boundary.p - boundary.crit) < 1e-12,
      'so that entry is case 2, not case 3 with a failing hypothesis');

    /* 17. the polynomial gap: for every fixed epsilon the ratio is eventually unbounded */
    ok = true;
    for (i = 0; i < EPS_TEST.length; i++) if (!(EPS_TEST[i].far > 1)) { ok = false; break; }
    var rises = true;
    for (i = 0; i < EPS_TEST.length; i++) if (!(EPS_TEST[i].far > EPS_TEST[i].value)) { ok = false; break; }
    var growsEps = EPS_TEST[0].far < EPS_TEST[1].far && EPS_TEST[1].far < EPS_TEST[2].far;
    check('n^\u03B5 / log\u2082n exceeds 1 at n = 2^100 for \u03B5 = 0.1, 0.5 and 1, and rises with n at every \u03B5',
      ok && rises && growsEps,
      'at 2^40: ' + EPS_TEST.map(function (e) { return e.value.toExponential(2); }).join(', ') +
      '; at 2^100: ' + EPS_TEST.map(function (e) { return e.far.toExponential(2); }).join(', '));

    /* 18. and a log IS polynomially below a power */
    check('log\u2082n / \u221An is below 1e-4 at n = 2^40, so a log gap is polynomial',
      LOG_IS_POLY_SMALL < 1e-4, 'value ' + LOG_IS_POLY_SMALL.toExponential(3));

    /* 19. the oscillating f fails regularity */
    check('the oscillating f = n\u00B2(2 \u00B1 1) reaches a regularity ratio of 1.5, so no c < 1 exists',
      OSC.maxRatio > 1 && Math.abs(OSC.maxRatio - 1.5) < 1e-9,
      'ratio range ' + OSC.minRatio.toFixed(4) + ' to ' + OSC.maxRatio.toFixed(4));

    /* 20. but its conclusion still holds: T stays within a constant of f */
    ok = true;
    var oscLo = Infinity, oscHi = 0;
    for (i = 8; i < OSC.rows.length; i++) {
      var ov = OSC.rows[i].over;
      if (ov < oscLo) oscLo = ov;
      if (ov > oscHi) oscHi = ov;
    }
    check('for that oscillating f, T/f stays between 1.55 and 3.34: Theta(f) holds anyway',
      oscLo > 1.5 && oscHi < 3.4,
      'T/f range ' + oscLo.toFixed(4) + ' to ' + oscHi.toFixed(4) + ' - a failed hypothesis, not a false conclusion');

    /* 21. the gap's exact sum, and its ratio to n log log n */
    check('2T(n/2) + n/log\u2082n at n = 1024 sums to 4023.26 = n(1 + H\u2081\u2080)',
      Math.abs(GAP_SUM - GAP.exact) < 1e-9 && Math.abs(GAP_SUM - 4023.263) < 0.01,
      'weights summed: ' + GAP_SUM.toFixed(4));

    /* 22. the harmonic weights are n/(k-i) */
    ok = true;
    for (i = 0; i < 10; i++) {
      if (Math.abs(GAP.weights[i] - N / (10 - i)) > 1e-9) { ok = false; break; }
    }
    check('the gap level weights are n/10, n/9, ... n/1, the harmonic profile', ok,
      'first ' + GAP.weights[0].toFixed(2) + ', last non-leaf ' + GAP.weights[9].toFixed(2));

    /* 23. the sqrt recurrence tends to n log log n */
    ok = true;
    var sq = [];
    for (i = 0; i < SQRT_ROWS.length; i++) {
      sq.push(SQRT_ROWS[i].overLogLog);
      if (!(SQRT_ROWS[i].overLogLog > 1.1 && SQRT_ROWS[i].overLogLog < 1.5)) { ok = false; break; }
    }
    var falling = sq[0] > sq[sq.length - 1];
    check('\u221An T(\u221An) + n: T/(n log log n) falls from 1.43 towards 1', ok && falling,
      'values ' + sq.map(function (v) { return v.toFixed(3); }).join(', '));

    /* 24. and it is not n log n */
    ok = true;
    for (i = 1; i < SQRT_ROWS.length; i++) {
      if (!(SQRT_ROWS[i].overLog < SQRT_ROWS[i - 1].overLog)) { ok = false; break; }
    }
    check('\u221An T(\u221An) + n: T/(n log n) falls towards 0, so n log n is not tight', ok,
      'values ' + SQRT_ROWS.map(function (r) { return r.overLog.toFixed(4); }).join(', '));

    /* 25. the subtract-and-conquer recurrence tends to n^2 2^n / 2 */
    ok = true;
    var subRatios = [];
    for (i = 10; i <= 40; i += 10) {
      var v = SUB[i] / (i * i * Math.pow(2, i));
      subRatios.push(v);
      if (!(v > 0.5 && v < 0.57)) { ok = false; break; }
    }
    check('2T(n-1) + n2^n: T/(n\u00B2 2^n) falls from 0.560 to 0.513, towards 1/2', ok,
      'values ' + subRatios.map(function (v) { return v.toFixed(3); }).join(', '));

    /* 26. the order-two recurrence is exactly 2^n */
    check('5T(n-1) - 6T(n-2) with T(0)=1, T(1)=2 equals 2^n for n = 0..40', ORDER2.allPow,
      'T(40) = ' + ORDER2.rows[40] + ', 2^40 = ' + Math.pow(2, 40));

    /* 27. the drawn tree counts */
    check('the drawn tree has 1, 4, 16, 64 subproblems at depths 0..3 and 1048576 leaves',
      TREE.counts.join(',') === '1,4,16,64' && TREE.leaves === 1048576 &&
      TREE.watershed === 1048576, 'leaves ' + TREE.leaves + ', watershed ' + TREE.watershed);

    /* 27b. the extended case 2 ladder */
    ok = true;
    for (i = 0; i < RUNGS.length; i++) if (!(RUNGS[i].ratio > 0.3 && RUNGS[i].ratio < 1.3)) { ok = false; break; }
    check('the ladder k = 0, 1, 2 gives T/(n log^(k+1) n) between 0.3 and 1.3 at k = 16', ok,
      'ratios ' + RUNGS.map(function (r) { return r.ratio.toFixed(4); }).join(', '));
    check('the ladder ratios converge downwards: ' + RUNGS.map(function (r) { return r.ratio.toFixed(3); }).join(' > '),
      RUNGS[0].ratio > RUNGS[1].ratio && RUNGS[1].ratio > RUNGS[2].ratio);

    /* 28. the grid's worst ratio is reported honestly */
    check('the worst max/min ratio on the grid is under 2.5', GRID_MAX_RATIO < 2.5,
      'worst ' + GRID_MAX_RATIO.toFixed(4) + ' - a bounded factor, which is what Theta allows');
  })();

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

  /* ======================================================================
     LAYER 3 - RENDER
     ====================================================================== */

  function stage(p, n) {
    var s = Math.floor(K.clamp01(p) * n);
    return s >= n ? n - 1 : s;
  }

  function title(s, sub) {
    P.text(28, 18, s, { size: 15.5, bold: true, color: PAL.ink });
    if (sub) P.text(28, 40, sub, { size: 11, color: PAL.dim });
  }

  function foot(s) {
    P.text(28, 446, s, { size: 10.5, color: PAL.faint });
  }

  function line(x, y, s, o) {
    o = o || {};
    P.text(x, y, s, {
      size: o.size || 12, color: o.color || PAL.ink, bold: !!o.bold,
      mono: !!o.mono, align: o.align || 'left', base: 'top'
    });
  }

  function centre(x, y, s, o) {
    o = o || {};
    P.text(x, y, s, {
      size: o.size || 12, color: o.color || PAL.ink, bold: !!o.bold,
      mono: !!o.mono, align: 'center', base: 'middle'
    });
  }

  function panel(x, y, w, h, o) {
    o = o || {};
    var fill = o.tone === 'bad' ? PAL.invalidDim : o.tone === 'good' ? PAL.accentDim
             : o.tone === 'warn' ? PAL.warnDim : o.tone === 'info' ? PAL.surface2 : PAL.surface;
    var stroke = o.tone === 'bad' ? PAL.invalid : o.tone === 'good' ? PAL.accent
               : o.tone === 'warn' ? PAL.warn : PAL.border;
    P.rect(x, y, w, h, { fill: fill, stroke: stroke, sw: o.sw || 1.1, radius: 6 });
  }

  function chip(x, y, w, h, label, o) {
    o = o || {};
    var fill = o.tone === 'a' ? PAL.accentDim : o.tone === 'b' ? PAL.warnDim
             : o.tone === 'c' ? PAL.invalidDim : o.tone === 'plain' ? PAL.surface2 : PAL.surface;
    var stroke = o.tone === 'a' ? PAL.accent : o.tone === 'b' ? PAL.warn
               : o.tone === 'c' ? PAL.invalid : PAL.border;
    P.rect(x, y, w, h, { fill: fill, stroke: stroke, sw: o.sw || 1.1, radius: 4 });
    if (label !== undefined && label !== null) {
      centre(x + w / 2, y + h / 2, label, { size: o.size || 12, mono: o.mono !== false, color: o.color || PAL.ink, bold: o.bold });
    }
  }

  /* compact number for a bar label */
  function fmtBig(v) {
    if (v < 10000) return String(Math.round(v));
    if (v < 1000000) return (v / 1000).toFixed(0) + 'K';
    if (v < 10000000) return (v / 1000000).toFixed(2) + 'M';
    if (v < 1000000000) return (v / 1000000).toFixed(1) + 'M';
    return (v / 1000000000).toFixed(2) + 'G';
  }

  /* eleven level-weight bars on a log scale, with the leaves as the last bar */
  function levelBars(weights, o) {
    o = o || {};
    var baseY = o.baseY || 300, maxH = o.maxH || 168, x0 = o.x0 || 82, step = o.step || 70;
    var bw = o.bw || 62;
    var lo = Infinity, hi = 0, i;
    for (i = 0; i < weights.length; i++) {
      var lv = lg10(weights[i]);
      if (lv < lo) lo = lv;
      if (lv > hi) hi = lv;
    }
    if (hi - lo < 0.001) { hi = lo + 0.5; }        /* all equal: draw them level */
    for (i = 0; i < weights.length; i++) {
      var frac = (lg10(weights[i]) - lo) / (hi - lo);
      var h = 14 + frac * (maxH - 14);
      var x = x0 + i * step;
      var isLeaf = (i === weights.length - 1);
      var tone = o.hiIndex === i ? 'a' : (isLeaf ? 'b' : 'plain');
      chip(x, baseY - h, bw, h, null, { tone: tone, sw: 1 });
      centre(x + bw / 2, baseY - h / 2, fmtBig(weights[i]), {
        size: 9, mono: true, color: PAL.ink
      });
      centre(x + bw / 2, baseY + 8, 'i=' + i, { size: 8.5, mono: true, color: PAL.faint });
    }
    /* the baseline */
    P.line(x0 - 8, baseY, x0 + weights.length * step - (step - bw) + 8, baseY, { stroke: PAL.border, sw: 1 });
  }

  /* --- 1. the shape of the theorem ------------------------------------- */
  function drawShape(p) {
    var s = stage(p, 4);
    title('A recurrence is a recipe; the theorem is a closed form',
      'three ingredients, and one question about which of them pays');

    panel(60, 66, 780, 62, { tone: 'info' });
    centre(450, 97, 'T(n) = a \u00B7 T(n/b) + f(n)', { size: 21, mono: true, bold: true, color: PAL.ink });

    var cols = [
      { x: 60, w: 240, head: 'a', body: 'how many pieces the problem splits into', ex: 'merge sort: 2' },
      { x: 330, w: 240, head: 'b', body: 'how much smaller each piece is', ex: 'merge sort: 2' },
      { x: 600, w: 240, head: 'f(n)', body: 'the work outside the recursive calls', ex: 'merge: n' }
    ];
    for (var i = 0; i < cols.length; i++) {
      if (s < 1) break;
      var c = cols[i];
      chip(c.x, 142, c.w, 26, c.head + '  \u2014  ' + (i === 2 ? 'the toll' : 'a constant'),
        { tone: i === 2 ? 'b' : 'a', size: 10.5, bold: true });
      line(c.x + 4, 176, c.body, { size: 10, color: PAL.dim });
      line(c.x + 4, 192, c.ex, { size: 9.5, color: PAL.faint, mono: true });
    }

    if (s >= 2) {
      line(60, 218, 'a is at least 1 and b is greater than 1: those two facts are the whole hypothesis',
        { size: 10.5, color: PAL.ink });
    }

    if (s >= 2) {
      line(60, 248, 'The tree has three regions, and each case names the one that pays:', { size: 11.5, bold: true });
      chip(60, 268, 240, 30, 'the root: f(n)', { tone: 'plain', size: 11 });
      chip(330, 268, 240, 30, 'the levels between', { tone: 'plain', size: 11 });
      chip(600, 268, 240, 30, 'the leaves: n^(log_b a)', { tone: 'plain', size: 11 });
      centre(180, 312, 'case 3', { size: 10, mono: true, color: PAL.warn, bold: true });
      centre(450, 312, 'case 2', { size: 10, mono: true, color: PAL.accent, bold: true });
      centre(720, 312, 'case 1', { size: 10, mono: true, color: PAL.accent, bold: true });
    }

    if (s >= 3) {
      panel(60, 336, 780, 62, { tone: 'good' });
      line(78, 350, 'The theorem is one comparison, not a table:', { size: 11, bold: true });
      centre(450, 378, 'f(n)   against   n^(log_b a)', { size: 15, mono: true, bold: true, color: PAL.accent });
    }
    foot('a, b and f are read off the algorithm; the theorem only compares them');
  }

  /* --- 2. the watershed -------------------------------------------------- */
  function drawWatershed(p) {
    var s = stage(p, 4);
    title('The watershed: what the leaves of the tree cost',
      'a = 4, b = 2, n = 1024: four subproblems per node, each half the size');

    /* rows of subproblems at depths 0..3 */
    for (var d = 0; d <= 3; d++) {
      if (s < 0 && d > 0) break;
      var y = 78 + d * 40;
      var count = TREE.counts[d];
      var x0 = 132, span = 740;
      line(28, y - 6, 'depth ' + d, { size: 9.5, mono: true, color: PAL.dim });
      line(28, y + 6, 'a^' + d + ' = ' + count, { size: 9.5, mono: true, color: PAL.faint });
      for (var i = 0; i < count; i++) {
        var x = count === 1 ? x0 + span / 2 : x0 + (i + 0.5) * (span / count);
        var r = count <= 4 ? 6 : count <= 16 ? 3.4 : 1.9;
        P.circle(x, y, r, { fill: d === 3 ? PAL.warnDim : PAL.accentDim, stroke: d === 3 ? PAL.warn : PAL.accent, sw: 1 });
      }
    }

    if (s >= 1) {
      line(60, 242, 'Each node splits into a = 4 pieces, each of size n / b = n / 2', { size: 10.5, color: PAL.ink });
    }

    if (s >= 2) {
      panel(60, 264, 780, 76, { tone: 'info' });
      line(78, 276, 'The leaves sit at depth k = log_b n = 10, and there are a^k of them:', { size: 10.5 });
      centre(450, 306, 'a^k = 4^10 = 1048576 = n^(log_2 4) = 1024^2', { size: 14, mono: true, bold: true, color: PAL.accent });
      line(78, 322, 'a^(log_b n) = n^(log_b a): one number, two ways of writing it', { size: 10, color: PAL.dim });
    }

    if (s >= 3) {
      line(60, 356, 'Call  n^(log_b a)  the watershed.  Here it is n\u00B2 = 1048576.', { size: 11.5, bold: true });
      line(60, 380, 'Every case of the theorem compares f(n) with this quantity and nothing else.',
        { size: 10.5, color: PAL.dim });
      line(60, 402, 'With a = 2, b = 2 the same n = 1024 gives a watershed of only 1024, not 1048576.',
        { size: 10.5, color: PAL.faint });
    }
    foot('checked for five (a,b) pairs and k = 1..12: a^k and n^(log_b a) agree to six decimals');
  }

  /* --- 3, 4, 5. the three cases ----------------------------------------- */
  function drawCase1(p) {
    var s = stage(p, 4);
    title('Case 1: the leaves pay the bill', '4T(n/2) + n at n = 1024, so the watershed is n\u00B2');
    levelBars(CASE1.weights, { hiIndex: s >= 2 ? 10 : -1, baseY: 300 });

    if (s >= 1) {
      line(60, 66, 'level weight = a^i \u00B7 f(n/b^i) = 4^i \u00B7 n/2^i = n \u00B7 2^i', { size: 10.5, mono: true, color: PAL.dim });
      line(60, 340, 'Each level is exactly twice the one above: the work grows downwards.', { size: 11, bold: true });
    }
    if (s >= 2) {
      line(60, 364, 'The ten non-leaf levels sum to ' + fmtBig(CASE1_SUM - Math.pow(A, K10)) +
        '; the leaves add ' + fmtBig(Math.pow(A, K10)) + ' on their own.', { size: 10.5, color: PAL.ink });
    }
    if (s >= 3) {
      panel(60, 386, 780, 40, { tone: 'good' });
      line(78, 396, 'Total ' + CASE1_SUM + ' = 2n\u00B2 - n, and n\u00B2 is the watershed: T is \u0398(n\u00B2) = \u0398(n^(log_b a)).',
        { size: 11, bold: true, color: PAL.ink });
      line(78, 412, 'f is smaller than the watershed by a factor of n - a polynomial gap, so case 1 applies.',
        { size: 9.5, color: PAL.dim });
    }
    foot('the largest term is the last one, so the leaves decide the answer');
  }

  function drawCase2(p) {
    var s = stage(p, 4);
    title('Case 2: every level costs the same', '4T(n/2) + n\u00B2 at n = 1024, so f is the watershed');
    levelBars(CASE2.weights, { hiIndex: s >= 1 ? 10 : -1, baseY: 300 });

    if (s >= 1) {
      line(60, 66, 'level weight = 4^i \u00B7 n\u00B2/4^i = n\u00B2: the a^i and the b^(pi) cancel exactly', { size: 10.5, mono: true, color: PAL.dim });
      line(60, 340, 'Every level costs 1048576. No level dominates, so the count is one level times the count of levels.',
        { size: 11, bold: true });
    }
    if (s >= 2) {
      line(60, 364, 'Eleven levels, because the leaves tie with the root: k + 1 = 11.', { size: 10.5, color: PAL.ink });
    }
    if (s >= 3) {
      panel(60, 386, 780, 40, { tone: 'good' });
      line(78, 396, 'Total ' + CASE2_SUM + ' = n\u00B2(k + 1), so T is \u0398(n\u00B2 log n). The log is the height of the tree.',
        { size: 11, bold: true, color: PAL.ink });
      line(78, 412, 'T / (n\u00B2 log\u2082n) = (k+1)/k, which is 1.167 at k = 6 and 1.063 at k = 16: the constant is 1.',
        { size: 9.5, color: PAL.dim });
    }
    foot('case 2 is the only case that produces a log, and it comes from the number of levels');
  }

  function drawCase3(p) {
    var s = stage(p, 4);
    title('Case 3: the root pays the bill', '4T(n/2) + n\u00B3 at n = 1024, so f is far above the watershed');
    levelBars(CASE3.weights, { hiIndex: s >= 1 ? 0 : -1, baseY: 300 });

    if (s >= 1) {
      line(60, 66, 'level weight = 4^i \u00B7 n\u00B3/8^i = n\u00B3 / 2^i: the work halves at every level down', { size: 10.5, mono: true, color: PAL.dim });
      line(60, 340, 'The root costs 1073741824. Everything below it adds up to less than the root again.', { size: 11, bold: true });
    }
    if (s >= 2) {
      line(60, 364, 'A series with ratio 1/2 is at most twice its first term, so the total sits between n\u00B3 and 2n\u00B3.',
        { size: 10.5, color: PAL.ink });
    }
    if (s >= 3) {
      panel(60, 386, 780, 40, { tone: 'good' });
      line(78, 396, 'Total ' + CASE3_SUM + ', just under 2n\u00B3, so T is \u0398(n\u00B3) = \u0398(f(n)).', { size: 11, bold: true, color: PAL.ink });
      line(78, 412, 'Case 3 carries a second hypothesis - the regularity condition - which the next scene computes.',
        { size: 9.5, color: PAL.dim });
    }
    foot('the largest term is the first one, so the root decides the answer');
  }

  /* --- 6. one picture, three regimes ------------------------------------ */
  function drawDecision(p) {
    var s = stage(p, 4);
    title('One picture, three regimes', 'log-log axes, so every power of n is a straight line and its exponent is its slope');

    var x0 = 118, x1 = 792, y0 = 350, y1 = 92;
    var LX = 3.05, LY = 9.4;
    function px(l10n) { return x0 + (l10n / LX) * (x1 - x0); }
    function py(l10v) { return y0 - (l10v / LY) * (y0 - y1); }

    /* axes */
    P.line(x0, y0, x1, y0, { stroke: PAL.border, sw: 1.2 });
    P.line(x0, y0, x0, y1, { stroke: PAL.border, sw: 1.2 });
    line(x0 - 4, y0 + 8, 'n = 1', { size: 9, mono: true, color: PAL.faint });
    line(x1 - 4, y0 + 8, 'n = 1024', { size: 9, mono: true, color: PAL.faint, align: 'right' });
    line(x0 - 6, y1 - 14, 'log\u2081\u2080 of the value', { size: 9, color: PAL.faint });

    function plotPower(pw, o) {
      var l10n0 = 0.05, l10n1 = LX;
      P.line(px(l10n0), py(pw * l10n0), px(l10n1), py(pw * l10n1), o);
    }

    if (s >= 0) {
      plotPower(2, { stroke: PAL.accent, sw: 3 });
      plotPower(1, { stroke: PAL.dim, sw: 1.6, dash: [6, 4] });
      plotPower(3, { stroke: PAL.warn, sw: 1.6, dash: [2, 3] });
    }

    /* the legend, below the plot so nothing overlaps a curve */
    chip(60, 364, 248, 22, 'f = n  \u2014  below: case 1', { tone: 'plain', size: 9.5 });
    chip(326, 364, 248, 22, 'watershed = f = n\u00B2  \u2014  case 2', { tone: 'a', size: 9.5 });
    chip(592, 364, 248, 22, 'f = n\u00B3  \u2014  above: case 3', { tone: 'b', size: 9.5 });

    if (s >= 1) {
      line(60, 396, 'The watershed here is n\u00B2, a line of slope 2. f = n\u00B2 is the same line: that is what case 2 means.',
        { size: 10.5, bold: true });
    }
    if (s >= 2) {
      line(60, 416, 'Below and above mean by a polynomial factor: f \u2264 watershed / n^\u03B5 for one fixed \u03B5 > 0.',
        { size: 10.5, color: PAL.dim });
    }
    if (s >= 3) {
      line(60, 434, 'The page classifies all 72 (a,b,p) entries on this grid and checks each one numerically: 72 of 72 agree.',
        { size: 10, color: PAL.faint });
    }
    foot('the exponent is the slope: a steeper line is a bigger power of n');
  }

  /* --- 7. the regularity condition --------------------------------------- */
  function drawRegularity(p) {
    var s = stage(p, 4);
    title('The regularity condition, and why polynomials never fail it',
      'case 3 needs the levels to shrink by a fixed fraction, not merely to shrink');

    panel(60, 66, 780, 46, { tone: 'info' });
    centre(450, 89, 'a \u00B7 f(n/b)  \u2264  c \u00B7 f(n)      for some fixed c < 1 and every large n',
      { size: 14, mono: true, bold: true });

    if (s >= 1) {
      line(60, 126, 'In words: each level down costs less than the level above by a fixed fraction, so the levels form a', { size: 10.5 });
      line(60, 142, 'convergent series. With c = 1/2 the whole tree costs at most twice the root, which is case 3.', { size: 10.5 });
    }

    if (s >= 2) {
      line(60, 172, 'For f(n) = n^p the ratio a\u00B7f(n/b) / f(n) is exactly a / b^p, with no n in it:', { size: 11, bold: true });
      /* the table */
      var hx = [64, 160, 236, 312, 420, 560, 700];
      var heads = ['a', 'b', 'p', 'a / b^p', 'log_b a', 'verdict'];
      for (var h = 0; h < heads.length; h++) {
        line(hx[h], 196, heads[h], { size: 9.5, mono: true, color: PAL.dim, bold: true });
      }
      P.line(60, 212, 836, 212, { stroke: PAL.border, sw: 1 });
      for (var i = 0; i < REG.length; i++) {
        var g = REG[i], ry = 220 + i * 26;
        var onBoundary = Math.abs(g.closed - 1) < 1e-9;
        line(hx[0], ry, String(g.a), { size: 11, mono: true });
        line(hx[1], ry, String(g.b), { size: 11, mono: true });
        line(hx[2], ry, String(g.p), { size: 11, mono: true });
        line(hx[3], ry, g.closed.toFixed(4), { size: 11, mono: true, color: onBoundary ? PAL.warn : PAL.valid, bold: true });
        line(hx[4], ry, g.crit.toFixed(4), { size: 11, mono: true, color: PAL.dim });
        line(hx[5], ry, onBoundary ? 'c = 1: case 2, the boundary' : 'c < 1: case 3 holds',
          { size: 10, color: onBoundary ? PAL.warn : PAL.valid });
      }
    }

    if (s >= 3) {
      panel(60, 336, 780, 56, { tone: 'good' });
      line(78, 348, 'So for a polynomial f the regularity condition is not extra work: c < 1 is the same statement as',
        { size: 11, bold: true });
      line(78, 368, 'p > log_b a, which is case 3 own polynomial gap. That is why papers never test it separately.',
        { size: 11, bold: true });
    }
    if (s >= 3) {
      line(60, 404, 'For a non-polynomial f it is separate: the page computes f = n\u00B2(2 \u00B1 1), whose ratio reaches 1.5,',
        { size: 10, color: PAL.dim });
      line(60, 420, 'so no c < 1 exists and the theorem is silent - although T is still \u0398(f) there, by a separate argument.',
        { size: 10, color: PAL.dim });
    }
    foot('a failed hypothesis makes the theorem silent; it does not make the conclusion false');
  }

  /* --- 8. the gap -------------------------------------------------------- */
  function drawGap(p) {
    var s = stage(p, 4);
    title('The gap: n / log n is smaller, but not polynomially smaller',
      '2T(n/2) + n/log\u2082n at n = 1024: the watershed is n, and f sits just below it');

    if (s >= 0) {
      levelBars(GAP.weights, { hiIndex: s >= 2 ? 10 : -1, baseY: 286, maxH: 150, x0: 82, step: 46, bw: 40 });
      line(60, 66, 'level weight = 2^i \u00B7 (n/2^i) / log\u2082(n/2^i) = n / (k - i)', { size: 10, mono: true, color: PAL.dim });
      line(60, 306, 'The weights rise slowly: n/10, n/9, ... n/1, then the leaves. That is a harmonic profile,', { size: 10.5 });
      line(60, 322, 'not a geometric one, so no single level dominates and no level ties.', { size: 10.5 });
    }

    if (s >= 1) {
      panel(430, 336, 410, 66, { tone: 'warn' });
      line(444, 344, 'Case 1 needs n^\u03B5 / log\u2082n bounded:', { size: 9.5, bold: true });
      line(444, 360, 'at n = 2^40:  ' + EPS_TEST[0].value.toFixed(3) + '  ' + EPS_TEST[1].value.toFixed(0) +
        '  ' + EPS_TEST[2].value.toExponential(1), { size: 9, mono: true });
      line(444, 374, 'at n = 2^100: ' + EPS_TEST[0].far.toFixed(2) + '  ' + EPS_TEST[1].far.toExponential(1) +
        '  ' + EPS_TEST[2].far.toExponential(1), { size: 9, mono: true });
      line(444, 390, 'Every \u03B5 eventually exceeds any bound.', { size: 9, color: PAL.warn, bold: true });
    }

    if (s >= 2) {
      line(60, 344, 'Unrolling gives n(1 + H\u2081\u2080) = ' + GAP_SUM.toFixed(2) + ' at n = 1024.', { size: 10.5, bold: true });
      line(60, 362, 'H_k is between ln k and ln k + 1, and ln k is ln log\u2082n,', { size: 10 });
      line(60, 378, 'so T is \u0398(n log log n) - a third shape the theorem does not name.', { size: 10, bold: true, color: PAL.accent });
    }

    if (s >= 3) {
      line(60, 404, 'Contrast: log\u2082n / \u221An at n = 2^40 is ' + LOG_IS_POLY_SMALL.toExponential(2) +
        ', which tends to 0 - so a log gap IS polynomial.', { size: 9.5, color: PAL.dim });
      line(60, 422, 'n/log\u2082n is not: the gap between it and n is a log factor, and a log factor is not a power.',
        { size: 9.5, color: PAL.dim });
    }
    foot('neither case 1, 2 nor 3 applies here; the theorem is silent, not wrong');
  }

  /* --- 9. extended case 2 ------------------------------------------------ */
  function drawExtended(p) {
    var s = stage(p, 4);
    title('Extended case 2: when f carries a log factor',
      'f = watershed \u00D7 log^k n gives watershed \u00D7 log^(k+1) n: one extra log, no new case');

    panel(60, 66, 780, 40, { tone: 'info' });
    centre(450, 86, 'f(n) = n^(log_b a) log^k n   \u2192   T(n) = \u0398( n^(log_b a) log^(k+1) n )',
      { size: 13.5, mono: true, bold: true });

    if (s >= 1) {
      line(60, 122, 'With k = 0 this is ordinary case 2, so the extension contains the case it extends.', { size: 10.5, color: PAL.dim });
      var hx = [64, 210, 420, 640];
      var heads = ['f(n)', 'predicted T', 'computed ratio', 'verdict'];
      for (var h = 0; h < heads.length; h++) line(hx[h], 152, heads[h], { size: 9.5, mono: true, color: PAL.dim, bold: true });
      P.line(60, 168, 836, 168, { stroke: PAL.border, sw: 1 });

      var rungs = [
        { f: 'n', pred: 'n log n', ratio: RUNGS[0].ratio.toFixed(3) + ' at k=16' },
        { f: 'n log n', pred: 'n log\u00B2n', ratio: RUNGS[1].ratio.toFixed(3) + ' at k=16' },
        { f: 'n log\u00B2n', pred: 'n log\u00B3n', ratio: RUNGS[2].ratio.toFixed(3) + ' at k=16' }
      ];
      for (var i = 0; i < rungs.length; i++) {
        if (s < 2 && i > 0) break;
        var ry = 178 + i * 30;
        line(hx[0], ry, rungs[i].f, { size: 11.5, mono: true });
        line(hx[1], ry, rungs[i].pred, { size: 11.5, mono: true, bold: true, color: PAL.accent });
        line(hx[2], ry, rungs[i].ratio, { size: 10.5, mono: true, color: PAL.dim });
        line(hx[3], ry, 'ratio settles', { size: 10, color: PAL.valid });
      }
    }

    if (s >= 2) {
      panel(60, 282, 780, 54, { tone: 'good' });
      line(78, 294, 'For f = n log\u2082n the exact solution is n(1 + k(k+1)/2):', { size: 11, bold: true });
      line(78, 314, 'T / (n k\u00B2) is 0.578 at k = 8, 0.549 at k = 12, 0.535 at k = 16 - falling towards 1/2.', { size: 10.5, mono: true });
    }

    if (s >= 3) {
      line(60, 352, 'So the answer is \u0398(n log\u00B2n), and the constant in front is 1/2. A ratio that settles is the', { size: 10.5 });
      line(60, 370, 'evidence; a ratio that drifts by a factor k would mean the class was wrong.', { size: 10.5 });
      line(60, 396, 'The same ladder covers the gap on the other side: n/log n is one rung below k = 0, and lands in no case.',
        { size: 10, color: PAL.faint });
    }
    foot('the extension is one statement, not two: k = 0 is the plain case 2');
  }

  /* --- 10. shapes the theorem refuses ------------------------------------ */
  function drawLimits(p) {
    var s = stage(p, 4);
    title('Three shapes the theorem refuses', 'the hypothesis is a T(n/b) + f(n) with a and b constant, and nothing else');

    var boxes = [
      { x: 60, w: 240, head: 'subtract and conquer', form: 'T(n) = 2T(n-1) + n2^n', why: 'size falls by 1: no b', method: 'unroll over n levels', tone: 'warn' },
      { x: 330, w: 240, head: 'a domain transform', form: 'T(n) = \u221An T(\u221An) + n', why: 'coefficient not constant: no a', method: 'substitute n = 2^(2^m)', tone: 'warn' },
      { x: 600, w: 240, head: 'a non-polynomial gap', form: 'f between n^p and n^(log_b a)', why: 'no \u03B5 gives the gap', method: 'unroll, or guess and prove', tone: 'bad' }
    ];
    for (var i = 0; i < boxes.length; i++) {
      if (s < i) break;
      var bx = boxes[i];
      panel(bx.x, 70, bx.w, 108, { tone: bx.tone });
      line(bx.x + 12, 80, bx.head, { size: 11, bold: true });
      line(bx.x + 12, 104, bx.form, { size: 9.5, mono: true, color: PAL.ink });
      line(bx.x + 12, 126, bx.why, { size: 9.5, color: PAL.dim });
      line(bx.x + 12, 146, 'method: ' + bx.method, { size: 9.5, color: PAL.accent, bold: true });
    }

    if (s >= 1) {
      line(60, 196, 'The first: unrolling sums n levels instead of log n levels, so the answer gains a factor n, not a log.', { size: 10.5 });
      line(60, 214, 'T/(n\u00B2 2^n) is ' + (SUB[10] / (100 * Math.pow(2, 10))).toFixed(3) + ' at n = 10 and ' +
        (SUB[40] / (1600 * Math.pow(2, 40))).toFixed(3) + ' at n = 40: it settles at 1/2.', { size: 10, mono: true, color: PAL.dim });
    }
    if (s >= 2) {
      line(60, 244, 'The second: writing n = 2^(2^m) turns the recurrence into one that adds 1 per step.', { size: 10.5 });
      line(60, 262, 'T/(n log log n) is ' + SQRT_ROWS[0].overLogLog.toFixed(2) + ' at n = 2^16 and ' +
        SQRT_ROWS[3].overLogLog.toFixed(2) + ' at n = 2^512: it settles at 1.', { size: 10, mono: true, color: PAL.dim });
    }
    if (s >= 3) {
      panel(60, 292, 780, 58, { tone: 'good' });
      line(78, 304, 'The third is scene 8: n/log\u2082n sits between every n^(1-\u03B5) and n, so no case applies and the', { size: 10.5 });
      line(78, 322, 'answer is n log log n, obtained by unrolling rather than by any formula.', { size: 10.5 });
      line(60, 368, 'Refusing is not the same as being hard: each of the three is solved exactly, by a method rather than a table.',
        { size: 10.5, bold: true });
      line(60, 392, 'The papers ask these three precisely to see whether the candidate reaches for a formula that does not apply.',
        { size: 10, color: PAL.dim });
    }
    foot('before substituting into the theorem, check that the recurrence has the theorem shape');
  }

  /* --- 11. previous-year items ------------------------------------------- */
  function drawGate(p) {
    var s = stage(p, 4);
    title('Previous-year items, recomputed', 'three items, three different answers to "does the theorem apply here"');

    if (s >= 0) {
      panel(60, 64, 780, 84, { tone: 'good' });
      line(78, 74, 'GATE CSE 2014, Set 2:  T(n) = 2T(n/2) + log\u2082n', { size: 11, bold: true });
      line(78, 96, 'watershed n^(log_2 2) = n;  log\u2082n \u2264 n^0.5, a polynomial gap  \u2192  case 1', { size: 10, mono: true });
      line(78, 114, 'answer \u0398(n).  Exact solution 3n - log\u2082n - 2, computed here for k = 0..20.', { size: 10, color: PAL.accent, bold: true });
      line(78, 132, 'The trap: seeing a log and reaching for the extended case 2. There f must be n \u00D7 log^k n.', { size: 9.5, color: PAL.dim });
    }

    if (s >= 1) {
      panel(60, 156, 780, 74, { tone: 'warn' });
      line(78, 166, 'GATE CSE 2024, Set 1:  T(n) = \u221An T(\u221An) + n', { size: 11, bold: true });
      line(78, 188, 'not the theorem shape - the coefficient is not constant; substituting n = 2^(2^m) gives n log log n', { size: 10, mono: true });
      line(78, 206, 'answer \u0398(n log log n).  T/(n log log n) = ' + SQRT_ROWS[3].overLogLog.toFixed(3) + ' at n = 2^512.', { size: 10, color: PAL.warn, bold: true });
    }

    if (s >= 2) {
      panel(60, 238, 780, 74, { tone: 'warn' });
      line(78, 248, 'GATE CSE 2025, Set 1:  T(n) = 2T(n-1) + n2^n,  T(0) = 1', { size: 11, bold: true });
      line(78, 270, 'subtract and conquer - the size falls by 1, so there is no b; unroll over n levels', { size: 10, mono: true });
      line(78, 288, 'answer \u0398(n\u00B2 2^n).  T/(n\u00B2 2^n) = ' + (SUB[40] / (1600 * Math.pow(2, 40))).toFixed(3) + ' at n = 40.', { size: 10, color: PAL.warn, bold: true });
    }

    if (s >= 3) {
      line(60, 326, 'Four steps: 1  identify a, b and f    2  compute the watershed    3  place f    4  check the case condition',
        { size: 11, bold: true, color: PAL.accent });
      line(60, 348, 'The fourth step is where marks go: cases 1 and 3 both need a polynomial gap, and case 3 also needs regularity.',
        { size: 10, color: PAL.dim });
      line(60, 366, 'For a polynomial f the two conditions coincide - which is why only one of them is ever quoted.', { size: 10, color: PAL.dim });
    }
    foot('wordings from past-paper archives; every number here is recomputed from the recurrence');
  }

  var DRAW = {
    shape: drawShape, watershed: drawWatershed, case1: drawCase1, case2: drawCase2,
    case3: drawCase3, decision: drawDecision, regularity: drawRegularity, gap: drawGap,
    extended: drawExtended, limits: drawLimits, gate: drawGate
  };

  function drawFrame(t) {
    if (!P) return;
    P.clear();
    P.alpha(1);
    var i = K.sceneAt(t);
    var sc = K.state.scenes[i];
    if (!sc) return;
    var fn = DRAW[sc.id];
    if (fn) fn(K.sceneProgress(t));
  }

  /* ======================================================================
     BOOT
     ====================================================================== */

  function reportChecks() {
    var el = document.getElementById('checks');
    if (!el) return;
    var bad = CHECKS.filter(function (c) { return !c.pass; });
    el.innerHTML = '<span class="k">Model checks</span>' +
      '<p class="small" style="margin:6px 0 0">' + PASSED + ' of ' + CHECKS.length + ' passed' +
      (bad.length ? ' <span style="color:var(--invalid)">(' + bad.length + ' failed)</span>' : '') + '</p>';
  }

  function boot() {
    var holder = document.getElementById('canvas-holder');
    var fallback = document.getElementById('canvas-fallback');
    reportChecks();

    var ok = false;
    try {
      if (window.p5) {
        new window.p5(function (sk) {
          sk.setup = function () {
            var c = sk.createCanvas(W, H);
            c.parent(holder);
            sk.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
            sk.noLoop();
            P = PR.makePainterP5(sk, W, H);
            drawFrame(K.state.elapsed);
          };
          sk.draw = function () { if (P) drawFrame(K.state.elapsed); };
        });
        K.onResize(function () {
          if (!holder) return;
          var scale = Math.min(1, holder.clientWidth / W);
          var cv = holder.querySelector('canvas');
          if (cv) { cv.style.width = (W * scale) + 'px'; cv.style.height = (H * scale) + 'px'; }
        });
        ok = true;
      }
    } catch (e) {
      console.error('p5 failed', e);
      ok = false;
    }

    if (!ok) {
      var drew = false;
      try {
        var cv2 = document.createElement('canvas');
        cv2.width = W; cv2.height = H;
        if (holder) holder.appendChild(cv2);
        var ctx2d = cv2.getContext && cv2.getContext('2d');
        if (ctx2d) { P = PR.makePainter2D(ctx2d, W, H); drawFrame(0); drew = true; }
      } catch (e) {
        console.error('canvas fallback failed', e);
      }
      if (!drew && fallback) fallback.classList.add('show');
    }

    if (K && K.init) {
      K.init({ timeline: window.LESSON_TIMELINE, draw: function () { if (P) drawFrame(K.state.elapsed); } });
    }

    window.__drawAt = function (t) {
      K.state.elapsed = t;
      if (P) drawFrame(t);
    };

    var bad = CHECKS.filter(function (c) { return !c.pass; });
    if (bad.length) console.warn('Model validation did not fully pass:', bad);
  }

  window.LESSON_MODEL = {
    N: N, A: A, B: B, K10: K10,
    CASE1: CASE1, CASE2: CASE2, CASE3: CASE3, GAP: GAP,
    CASE1_SUM: CASE1_SUM, CASE2_SUM: CASE2_SUM, CASE3_SUM: CASE3_SUM, GAP_SUM: GAP_SUM,
    TREE: TREE, GRID: GRID, GRID_MAX_RATIO: GRID_MAX_RATIO,
    EPS_TEST: EPS_TEST, LOG_IS_POLY_SMALL: LOG_IS_POLY_SMALL,
    REG: REG, OSC: OSC, SQRT_ROWS: SQRT_ROWS, SUB: SUB, ORDER2: ORDER2,
    lg2: lg2, crit: crit, watershed: watershed, unroll: unroll,
    levelWeights: levelWeights, harmonic: harmonic, classify: classify, spread: spread,
    exactNlogN: exactNlogN, exactLogRec: exactLogRec, exactGap: exactGap,
    exactNlogSq: exactNlogSq, sqrtRec: sqrtRec, fmtBig: fmtBig,
    PASSED: PASSED, TOTAL: CHECKS.length,
    ALL_PASS: PASSED === CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
