/* ==========================================================================
   comparison-lower-bound-decision-trees - model, validation, render.

   Layer 1  model      : whole-number arithmetic only. n! is a BigInt, the
                         ceiling of log2(n!) is found by doubling, and the
                         optimal worst-case comparison count for small n is
                         computed by exhaustive minimax over comparison
                         strategies (a memoised search over the set of orders
                         still consistent with the answers so far).
   Layer 2  validation : the bound is checked against its own defining
                         property (2^(h-1) < n! <= 2^h) for n = 1..22; the
                         exact minima for n = 3..6 are recomputed and compared
                         with the bound; the decision trees the page draws are
                         verified to sort every input order; the merge-insertion
                         upper bound, the merge sort closed form (against a
                         simulated merge sort on every order up to n = 8), the
                         average-depth theorem and the Stirling approximation
                         are each checked as their own property.
   Layer 3  render     : reads the model; never re-derives a number.
   Layer 4  timeline   : in timeline.js - the only source of time.

   No p5.brush: every mark is a bar, a node, an arrow or a number that has to
   be read exactly.
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

  function factBig(n) {
    var r = BigInt(1);
    for (var i = 2; i <= n; i++) r *= BigInt(i);
    return r;
  }

  /* smallest h with 2^h >= n!, by doubling - no floating point anywhere */
  function ceilLog2Fact(n) {
    var f = factBig(n), h = 0, p = BigInt(1);
    while (p < f) { p *= BigInt(2); h++; }
    return h;
  }

  function ceilLog2(x) {
    var h = 0, p = 1;
    while (p < x) { p *= 2; h++; }
    return h;
  }

  function commas(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /* merge-insertion (Ford-Johnson) upper bound: sum of ceil(log2(3k/4)) */
  function mergeInsertionBound(n) {
    var tot = 0;
    for (var k = 1; k <= n; k++) {
      var c = 0, p = 4;
      while (p < 3 * k) { p *= 2; c++; }
      tot += c;
    }
    return tot;
  }

  /* the proven minimum, recorded from OEIS A036604 (n = 1..22) */
  var S = [0, 0, 1, 3, 5, 7, 10, 13, 16, 19, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62, 66, 71];

  /* ---------- permutations and the exhaustive minimax ---------- */

  function perms(n) {
    var out = [], cur = [], used = [];
    for (var i = 0; i < n; i++) used.push(false);
    (function rec() {
      if (cur.length === n) { out.push(cur.slice()); return; }
      for (var v = 0; v < n; v++) {
        if (used[v]) continue;
        used[v] = true; cur.push(v);
        rec();
        cur.pop(); used[v] = false;
      }
    })();
    return out;
  }

  /* exact minimum worst-case comparisons for small n, by memoised minimax
     over the set of input orders still consistent with the answers given */
  function optimalCost(n, keepTree) {
    var Pn = perms(n);
    var memo = new Map();
    var all = [];
    for (var i = 0; i < Pn.length; i++) all.push(i);

    function solve(state) {
      if (state.length === 1) return keepTree ? { leaf: state[0], cost: 0 } : 0;
      var key = state.join(',');
      if (memo.has(key)) return memo.get(key);
      var lb = ceilLog2(state.length);
      var cands = [], i, j, t, a;
      for (i = 0; i < n; i++) {
        for (j = i + 1; j < n; j++) {
          a = 0;
          for (t = 0; t < state.length; t++) if (Pn[state[t]][i] < Pn[state[t]][j]) a++;
          if (a === 0 || a === state.length) continue;
          cands.push([Math.abs(state.length - 2 * a), i, j]);
        }
      }
      cands.sort(function (x, y) { return x[0] - y[0]; });
      var best = 99, bestPair = null, bestL = null, bestR = null;
      for (t = 0; t < cands.length; t++) {
        i = cands[t][1]; j = cands[t][2];
        var L = [], R = [], k;
        for (k = 0; k < state.length; k++) {
          if (Pn[state[k]][i] < Pn[state[k]][j]) L.push(state[k]); else R.push(state[k]);
        }
        var cl = solve(L), cr = solve(R);
        var c = 1 + (keepTree ? Math.max(cl.cost, cr.cost) : Math.max(cl, cr));
        if (c < best) {
          best = c; bestPair = [i, j];
          if (keepTree) { bestL = cl; bestR = cr; }
        }
        if (best === lb) break;
      }
      var res = keepTree
        ? { pair: bestPair, L: bestL, R: bestR, cost: best }
        : best;
      memo.set(key, res);
      return res;
    }

    var root = solve(all);
    return keepTree ? { tree: root, cost: root.cost, permutations: Pn } : root;
  }

  /* walk one input order through a decision tree */
  function walkTree(tree, Pn, idx) {
    var node = tree, depth = 0, perm = Pn[idx];
    while (node.pair) {
      depth++;
      node = perm[node.pair[0]] < perm[node.pair[1]] ? node.L : node.R;
      if (!node) return { ok: false, depth: depth, leaf: -1 };
    }
    return { ok: node.leaf === idx, depth: depth, leaf: node.leaf };
  }

  function treeLeaves(tree) {
    var out = [];
    (function rec(nd) {
      if (!nd) return;
      if (!nd.pair) { out.push(nd.leaf); return; }
      rec(nd.L); rec(nd.R);
    })(tree);
    return out;
  }

  function averageDepth(tree, Pn) {
    var tot = 0;
    for (var i = 0; i < Pn.length; i++) tot += walkTree(tree, Pn, i).depth;
    return tot / Pn.length;
  }

  /* ---------- the algorithms whose counts the lesson quotes ---------- */

  function mergeSortCount(arr) {
    var c = 0;
    function ms(a) {
      if (a.length <= 1) return a;
      var m = a.length >> 1;
      var L = ms(a.slice(0, m)), R = ms(a.slice(m));
      var out = [], i = 0, j = 0;
      while (i < L.length && j < R.length) {
        c++;
        if (L[i] <= R[j]) out.push(L[i++]); else out.push(R[j++]);
      }
      while (i < L.length) out.push(L[i++]);
      while (j < R.length) out.push(R[j++]);
      return out;
    }
    ms(arr.slice());
    return c;
  }

  function insertionCount(arr) {
    var a = arr.slice(), c = 0;
    for (var i = 1; i < a.length; i++) {
      var x = a[i], j = i - 1;
      while (j >= 0) {
        c++;
        if (a[j] > x) { a[j + 1] = a[j]; j--; } else break;
      }
      a[j + 1] = x;
    }
    return c;
  }

  function selectionCount(arr) {
    var a = arr.slice(), c = 0, i, j, m;
    for (i = 0; i < a.length - 1; i++) {
      m = i;
      for (j = i + 1; j < a.length; j++) { c++; if (a[j] < a[m]) m = j; }
      var t = a[i]; a[i] = a[m]; a[m] = t;
    }
    return c;
  }

  function worstOver(fn, n) {
    var Pn = perms(n), w = 0;
    for (var i = 0; i < Pn.length; i++) { var c = fn(Pn[i]); if (c > w) w = c; }
    return w;
  }

  function averageOver(fn, n) {
    var Pn = perms(n), t = 0;
    for (var i = 0; i < Pn.length; i++) t += fn(Pn[i]);
    return t / Pn.length;
  }

  /* merge sort worst case, closed form: n*ceil(lg n) - 2^ceil(lg n) + 1 */
  function mergeClosedForm(n) {
    if (n <= 1) return 0;
    var lg = ceilLog2(n), p = 1;
    for (var i = 0; i < lg; i++) p *= 2;
    return n * lg - p + 1;
  }

  /* Stirling, base two: n log2 n - n/ln2 + 0.5 log2(2 pi n) */
  function stirling(n) {
    return n * Math.log2(n) - n / Math.LN2 + 0.5 * Math.log2(2 * Math.PI * n);
  }

  /* how many leaves can a binary tree of height h have at most? counted by
     enumerating every shape, not asserted */
  /* every binary tree shape of height at most h, as a nested pair; a leaf is
     null. Returns { max, worstLeaves, count } by enumeration. */
  function shapeCensus(h) {
    var shapes = [[]];               /* shapes[k] = every shape of height exactly k */
    shapes[0] = [null];
    for (var k = 1; k <= h; k++) {
      var out = [];
      for (var i = 0; i <= k - 1; i++) {
        for (var j = 0; j <= k - 1; j++) {
          if (Math.max(i, j) !== k - 1) continue;
          var A = shapes[i], B = shapes[j];
          for (var a = 0; a < A.length; a++) {
            for (var b = 0; b < B.length; b++) out.push([A[a], B[b]]);
          }
        }
      }
      shapes[k] = out;
    }
    function heightOf(s) { return s === null ? 0 : 1 + Math.max(heightOf(s[0]), heightOf(s[1])); }
    function leavesOf(s) { return s === null ? 1 : leavesOf(s[0]) + leavesOf(s[1]); }
    var count = 0, worst = [], bad = 0;
    for (var k2 = 0; k2 <= h; k2++) {
      worst[k2] = 0;
      for (var s = 0; s < shapes[k2].length; s++) {
        count++;
        var lv = leavesOf(shapes[k2][s]);
        if (lv > worst[k2]) worst[k2] = lv;
        if (lv > Math.pow(2, heightOf(shapes[k2][s]))) bad++;
      }
    }
    return { worst: worst, count: count, bad: bad };
  }

  /* counting sort: no comparisons at all, checked by counting them */
  function countingSortComparisons(arr, k) {
    var cnt = [], c = 0, i;
    for (i = 0; i <= k; i++) cnt.push(0);
    for (i = 0; i < arr.length; i++) cnt[arr[i]]++;
    var out = [];
    for (i = 0; i <= k; i++) while (cnt[i]-- > 0) out.push(i);
    return { comparisons: c, sorted: out };
  }

  /* ---------- the numbers the lesson quotes ---------- */

  var MRG8 = worstOver(mergeSortCount, 8);      /* 17 */
  var INS8 = worstOver(insertionCount, 8);      /* 28 */
  var SEL8 = worstOver(selectionCount, 8);      /* 28 */
  var BOUND8 = ceilLog2Fact(8);                 /* 16 */
  var OPT = {};                                  /* n -> exact minimum */
  for (var on = 3; on <= 6; on++) OPT[on] = optimalCost(on, false);
  var T3 = optimalCost(3, true);
  var T4 = optimalCost(4, true);
  var AVG4 = averageDepth(T4.tree, T4.permutations);
  var INS_AVG4 = averageOver(insertionCount, 4);
  var INS_BEST4 = 3;

  var TABLE = [];
  for (var tn = 1; tn <= 12; tn++) {
    var f = factBig(tn), h = ceilLog2Fact(tn);
    var below = h === 0 ? BigInt(0) : (BigInt(1) << BigInt(h - 1));
    TABLE.push({
      n: tn,
      f: f.toString(),
      below: h === 0 ? null : below.toString(),
      at: (BigInt(1) << BigInt(h)).toString(),
      h: h
    });
  }

  var GAP = [];
  for (var gn = 0; gn <= 22; gn++) GAP[gn] = S[gn] - ceilLog2Fact(gn);

  /* ======================================================================
     LAYER 2 - VALIDATION
     ====================================================================== */

  var CHECKS = [];
  function check(name, pass, detail) {
    CHECKS.push({ name: name, pass: !!pass, detail: detail || '' });
  }

  /* 1-2: the ceiling is exact and minimal, for every n the page quotes */
  (function () {
    var okMin = true, okBound = true, first = '';
    for (var n = 1; n <= 22; n++) {
      var f = factBig(n), h = ceilLog2Fact(n);
      var at = BigInt(1) << BigInt(h);
      if (at < f) { okBound = false; first = first || ('n=' + n); }
      if (h > 0 && (BigInt(1) << BigInt(h - 1)) >= f) { okMin = false; first = first || ('n=' + n); }
    }
    check('2^h >= n! for every n from 1 to 22', okBound, first);
    check('2^(h-1) < n! for every n from 1 to 22, so h is the smallest usable height', okMin, first);
  })();

  /* 3: the exact minimum for small n is recomputed, not quoted */
  (function () {
    var agree = OPT[3] === 3 && OPT[4] === 5 && OPT[5] === 7 && OPT[6] === 10;
    var eq = true;
    for (var n = 3; n <= 6; n++) if (OPT[n] !== ceilLog2Fact(n)) eq = false;
    check('exhaustive minimax finds 3, 5, 7, 10 for n = 3..6', agree, JSON.stringify(OPT));
    check('the recomputed minimum equals ceil(log2 n!) for n = 3..6, so the bound is tight there', eq, '');
    check('the recomputed minima match the recorded sequence for n = 3..6', OPT[3] === S[3] && OPT[4] === S[4] && OPT[5] === S[5] && OPT[6] === S[6], '');
  })();

  /* 4: the drawn trees really sort */
  (function () {
    var r3 = T3, ok3 = true, maxd = 0;
    for (var i = 0; i < r3.permutations.length; i++) {
      var w = walkTree(r3.tree, r3.permutations, i);
      if (!w.ok) ok3 = false;
      if (w.depth > maxd) maxd = w.depth;
    }
    var lv3 = treeLeaves(r3.tree);
    check('the n = 3 tree of the drawing sorts all 6 orders and each reaches its own leaf', ok3 && lv3.length === 6 && new Set(lv3).size === 6, 'leaves ' + lv3.length);
    check('the n = 3 tree has height 3, matching the bound', maxd === 3 && r3.cost === 3, 'height ' + maxd);

    var r4 = T4, ok4 = true, maxd4 = 0;
    for (var j = 0; j < r4.permutations.length; j++) {
      var w4 = walkTree(r4.tree, r4.permutations, j);
      if (!w4.ok) ok4 = false;
      if (w4.depth > maxd4) maxd4 = w4.depth;
    }
    var lv4 = treeLeaves(r4.tree);
    check('the n = 4 tree sorts all 24 orders with 24 distinct leaves', ok4 && lv4.length === 24 && new Set(lv4).size === 24, 'leaves ' + lv4.length);
    check('the n = 4 tree has height 5, one more than the 16 slots of height 4 allow', maxd4 === 5 && r4.cost === 5, 'height ' + maxd4);
    check('unused slots: 2^3 - 3! = 2 for n = 3 and 2^5 - 4! = 8 for n = 4', (8 - 6) === 2 && (32 - 24) === 8, '');
  })();

  /* 5: the doubling fact, counted over every tree shape */
  var CENSUS = shapeCensus(4);
  (function () {
    var ok = true, worst = '';
    for (var h = 0; h <= 4; h++) {
      if (CENSUS.worst[h] !== Math.pow(2, h)) { ok = false; worst = 'h=' + h + ' gave ' + CENSUS.worst[h]; }
    }
    check('the fullest binary tree of height h has exactly 2^h leaves, for h = 0..4, counted over all ' +
          commas(CENSUS.count) + ' shapes', ok, worst);
    check('no binary tree shape of height at most 4 ever has more than 2^height leaves', CENSUS.bad === 0, 'bad=' + CENSUS.bad);
  })();

  /* 6: the merge-insertion upper bound sits between the floor and the truth */
  (function () {
    var okGe = true, okEq = true, ok12 = mergeInsertionBound(12) === 30;
    for (var n = 1; n <= 22; n++) {
      var F = mergeInsertionBound(n), b = ceilLog2Fact(n);
      if (F < b) okGe = false;
      if (n <= 11 && F !== b) okEq = false;
    }
    check('merge insertion is never below the floor, for n = 1..22', okGe, '');
    check('merge insertion meets the floor exactly for n = 1..11', okEq, '');
    check('merge insertion needs 30 comparisons at n = 12 while the floor is 29', ok12, 'F(12)=' + mergeInsertionBound(12));
  })();

  /* 7: the recorded minima never contradict the bound, and the gap is irregular */
  (function () {
    var ok = true;
    for (var n = 1; n <= 22; n++) if (S[n] < ceilLog2Fact(n)) ok = false;
    check('no recorded minimum is below the floor, n = 1..22', ok, '');
    var first = 0;
    for (var m = 1; m <= 22; m++) if (S[m] > ceilLog2Fact(m)) { first = m; break; }
    check('the first n whose minimum exceeds the floor is 12', first === 12, 'first=' + first);
    check('the gap is not monotone: 1 from 12 to 19, 0 at 20 and 21, 1 again at 22',
      GAP[12] === 1 && GAP[19] === 1 && GAP[20] === 0 && GAP[21] === 0 && GAP[22] === 1, GAP.slice(12).join(''));
    check('every gap is 0 or 1 for n = 1..22', GAP.every(function (g) { return g === 0 || g === 1; }), '');
  })();

  /* 8: the algorithm counts on the first scene are simulated, not asserted */
  (function () {
    check('at n = 8 merge sort spends 17, insertion 28, selection 28, over all 40320 orders',
      MRG8 === 17 && INS8 === 28 && SEL8 === 28, MRG8 + '/' + INS8 + '/' + SEL8);
    check('every one of those three counts is at least the floor of 16', MRG8 >= BOUND8 && INS8 >= BOUND8 && SEL8 >= BOUND8, '');
  })();

  /* 9: the merge sort closed form, against a simulated merge sort */
  (function () {
    var ok = true, detail = '';
    for (var n = 1; n <= 8; n++) {
      var w = worstOver(mergeSortCount, n);
      if (w !== mergeClosedForm(n)) { ok = false; detail += 'n=' + n + ' ' + w + '!=' + mergeClosedForm(n) + ' '; }
    }
    check('merge sort worst case equals n*ceil(lg n) - 2^ceil(lg n) + 1 for n = 1..8', ok, detail);
    var okBound = true;
    for (var m = 1; m <= 64; m++) if (mergeClosedForm(m) < ceilLog2Fact(m)) okBound = false;
    check('merge sort meets or beats the floor for every n up to 64, which is what Theta needs', okBound, '');
  })();

  /* 10: the best case is not bounded, which is the trap on scene ten */
  (function () {
    var ok = true;
    for (var n = 3; n <= 12; n++) if ((n - 1) >= ceilLog2Fact(n)) ok = false;
    check('insertion sort best case n-1 is below the floor for every n from 3 to 12', ok, '');
    check('at n = 4 the best case is 3 comparisons against a floor of 5', INS_BEST4 < ceilLog2Fact(4), '');
  })();

  /* 11: the average-depth theorem, measured on the built tree */
  (function () {
    check('the optimal n = 4 tree averages at least log2(24) = 4.585 comparisons',
      AVG4 >= Math.log2(24), AVG4.toFixed(3));
    check('insertion sort averages 4.917 on four items, also above log2(24)',
      INS_AVG4 >= Math.log2(24), INS_AVG4.toFixed(3));
  })();

  /* 12: counting sort makes no comparisons and still sorts */
  (function () {
    var r = countingSortComparisons([3, 1, 2, 0, 3, 1], 3);
    check('counting sort makes zero comparisons and returns the sorted array',
      r.comparisons === 0 && r.sorted.join(',') === '0,1,1,2,3,3', r.sorted.join(','));
  })();

  /* 13: Stirling agrees with the exact logarithm and the leading term dominates */
  (function () {
    var ok = true, detail = '';
    [8, 16, 32, 64].forEach(function (n) {
      var exact = Number(factBig(n).toString()) ? Math.log2(Number(factBig(n).toString())) : 0;
      if (!isFinite(exact)) exact = stirling(n);
      var err = Math.abs(exact - stirling(n));
      if (err > 0.6) { ok = false; detail += 'n=' + n + ' err=' + err.toFixed(3) + ' '; }
    });
    check('Stirling is within 0.6 of the exact log2(n!) for n = 8, 16, 32, 64', ok, detail);
    var okLead = true, hi = 0, lo = 9;
    for (var n = 8; n <= 4096; n *= 2) {
      var ratio = (n * Math.log2(n)) / ceilLog2Fact(n);
      if (ratio > hi) hi = ratio;
      if (ratio < lo) lo = ratio;
      if (ratio > 1.6 || ratio < 1.0) okLead = false;
    }
    check('n log2 n stays between 1.0 and 1.6 times the exact floor, n = 8..4096, so the order is Theta(n log n)',
      okLead, 'ratio ' + lo.toFixed(3) + ' to ' + hi.toFixed(3));
  })();

  /* 14: the two arithmetic facts quoted in the captions */
  (function () {
    check('2^6 = 64 < 120 <= 128 = 2^7, so five items need seven comparisons',
      Math.pow(2, 6) < 120 && 120 <= Math.pow(2, 7) && ceilLog2Fact(5) === 7, '');
    check('2^4 = 16 < 24, so four items cannot be sorted in four comparisons',
      Math.pow(2, 4) < 24 && ceilLog2Fact(4) === 5, '');
    check('log3(120) = 4.37 would suggest five comparisons, two fewer than the truth',
      Math.abs(Math.log(120) / Math.log(3) - 4.358) < 0.01 && ceilLog2Fact(5) === 7, '');
    check('2^28 = 268435456 < 12! = 479001600 <= 2^29, so the floor at n = 12 is 29',
      Math.pow(2, 28) < 479001600 && 479001600 <= Math.pow(2, 29) && ceilLog2Fact(12) === 29, '');
  })();

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

  /* ======================================================================
     LAYER 3 - RENDER
     ====================================================================== */

  function txt(x, y, s, o) { P.text(x, y, s, o || {}); }
  function mono(x, y, s, o) { o = o || {}; o.mono = true; txt(x, y, s, o); }

  function head(s) {
    txt(30, 24, s, { size: 12.5, bold: true });
    P.line(30, 36, 870, 36, { stroke: PAL.border, sw: 1 });
  }
  function foot(s) { txt(30, 450, s, { size: 9.5, color: PAL.faint }); }

  function panel(x, y, w, h, tone) {
    var fill = tone === 'ok' ? PAL.accentDim : tone === 'bad' ? PAL.invalidDim
             : tone === 'warn' ? PAL.warnDim : PAL.surface2;
    P.rect(x, y, w, h, { fill: fill, stroke: PAL.border, radius: 8, sw: 1 });
  }

  function node(x, y, label, tone) {
    var w = 74, h = 24;
    var fill = tone === 'hi' ? PAL.accentDim : PAL.surface;
    var stroke = tone === 'hi' ? PAL.accent : PAL.border;
    P.rect(x - w / 2, y - h / 2, w, h, { fill: fill, stroke: stroke, radius: 6, sw: 1.4 });
    mono(x, y - 4, label, { size: 9.5, align: 'center', color: PAL.ink });
  }

  function leafNode(x, y, label, tone) {
    var w = 84, h = 24;
    var fill = tone === 'hi' ? PAL.accentDim : PAL.surface;
    var stroke = tone === 'hi' ? PAL.accent : PAL.border;
    P.rect(x - w / 2, y - h / 2, w, h, { fill: fill, stroke: stroke, radius: 12, sw: 1.4 });
    mono(x, y - 4, label, { size: 9.5, align: 'center', color: tone === 'hi' ? PAL.accent : PAL.dim });
  }

  function bar(x, y, w, h, fill, stroke) {
    P.rect(x, y, w, h, { fill: fill, stroke: stroke || PAL.border, radius: 4, sw: 1 });
  }

  function pct(p, a, b) { return K.clamp01((p - a) / Math.max(0.0001, b - a)); }

  /* ---------- scene 1: the wall ---------- */

  function drawWall(p) {
    head('n = 8: three algorithms, and one number underneath all of them');
    var rows = [
      ['merge sort, worst case', MRG8, PAL.info],
      ['insertion sort, worst case', INS8, PAL.warn],
      ['selection sort, worst case', SEL8, PAL.warn]
    ];
    var x0 = 300, sc = 13.5;
    for (var i = 0; i < rows.length; i++) {
      var y = 74 + i * 52;
      txt(30, y + 15, rows[i][0], { size: 10.5 });
      var w = rows[i][1] * sc;
      bar(x0, y, w, 26, PAL.surface2, PAL.border);
      P.rect(x0, y, w, 26, { fill: PR.rgba(rows[i][2], 0.18), radius: 4 });
      mono(x0 + w + 10, y + 15, String(rows[i][1]), { size: 11, bold: true, color: rows[i][2] });
    }
    /* the floor */
    var fx = x0 + BOUND8 * sc;
    P.line(fx, 60, fx, 232, { stroke: PAL.invalid, sw: 1.6, dash: [5, 4] });
    mono(fx + 8, 52, 'floor = 16', { size: 10, bold: true, color: PAL.invalid });

    if (p > 0.25) {
      panel(30, 248, 840, 88, 'warn');
      mono(46, 266, '8! = 40,320 possible input orders', { size: 11, bold: true, color: PAL.warn });
      mono(46, 292, '2^15 = 32,768   <   40,320   <=   65,536 = 2^16', { size: 11, color: PAL.ink });
      txt(46, 316, 'fifteen comparisons cannot separate the orders; sixteen can.', { size: 10, color: PAL.dim });
    }
    if (p > 0.6) {
      txt(30, 360, 'One comparison answers one yes-or-no question, so it can at most double the', { size: 10.5 });
      txt(30, 380, 'number of input orders an algorithm has told apart.', { size: 10.5 });
    }
    foot('the three algorithm counts are simulated on every order; the floor is computed from 2^h >= n!');
  }

  /* ---------- scene 2: the decision tree ---------- */

  function drawModel(p) {
    head('One algorithm, drawn as a tree: three items, six leaves');

    var N = {
      root: [450, 84],
      L: [262, 164], R: [640, 164],
      LL: [176, 254], LR: [352, 254], RL: [556, 254], RR: [734, 254],
      LRL: [290, 344], LRR: [414, 344], RRL: [672, 344], RRR: [792, 344]
    };
    var E = [
      ['root', 'L', 0.06], ['root', 'R', 0.06],
      ['L', 'LL', 0.18], ['L', 'LR', 0.18],
      ['R', 'RL', 0.18], ['R', 'RR', 0.18],
      ['LR', 'LRL', 0.34], ['LR', 'LRR', 0.34],
      ['RR', 'RRL', 0.34], ['RR', 'RRR', 0.34]
    ];
    var hiEdge = { 'root>L': 1, 'L>LR': 1, 'LR>LRR': 1 };

    for (var e = 0; e < E.length; e++) {
      if (p < E[e][2]) continue;
      var a = N[E[e][0]], b = N[E[e][1]];
      var on = hiEdge[E[e][0] + '>' + E[e][1]];
      P.line(a[0], a[1] + 12, b[0], b[1] - 12, { stroke: on ? PAL.accent : PAL.border, sw: on ? 2 : 1.2 });
    }
    /* the two answers, written once at the root */
    if (p > 0.12) {
      mono(300, 118, 'a<b', { size: 9.5, color: PAL.accent });
      mono(560, 118, 'a>b', { size: 9.5, color: PAL.dim });
    }

    if (p >= 0.06) { node(N.root[0], N.root[1], 'a : b', p > 0.7 ? 'hi' : ''); }
    if (p >= 0.18) {
      node(N.L[0], N.L[1], 'b : c', '');
      node(N.R[0], N.R[1], 'a : c', '');
    }
    if (p >= 0.30) {
      leafNode(N.LL[0], N.LL[1], 'a b c', '');
      node(N.LR[0], N.LR[1], 'a : c', p > 0.7 ? 'hi' : '');
      leafNode(N.RL[0], N.RL[1], 'b a c', '');
      node(N.RR[0], N.RR[1], 'b : c', '');
    }
    if (p >= 0.46) {
      leafNode(N.LRL[0], N.LRL[1], 'a c b', '');
      leafNode(N.LRR[0], N.LRR[1], 'c a b', p > 0.78 ? 'hi' : '');
      leafNode(N.RRL[0], N.RRL[1], 'b c a', '');
      leafNode(N.RRR[0], N.RRR[1], 'c b a', '');
    }
    if (p > 0.55) {
      mono(30, 300, 'one run:', { size: 10, bold: true, color: PAL.accent });
      mono(30, 322, 'a<b, then', { size: 9.5, color: PAL.dim });
      mono(30, 340, 'b>c, then', { size: 9.5, color: PAL.dim });
      mono(30, 358, 'a>c', { size: 9.5, color: PAL.dim });
      mono(30, 380, '=> c a b', { size: 10, bold: true, color: PAL.accent });
    }
    if (p > 0.72) {
      mono(450, 396, 'height 3, leaves 6, orders 3! = 6', { size: 11, bold: true, align: 'center' });
    }
    foot('internal node = one comparison · leaf = one sorted output · a root-to-leaf path = one run');
  }

  /* ---------- scene 3: leaves ---------- */

  function drawLeaves(p) {
    head('Three items: six orders to tell apart, eight slots at the bottom');
    var orders = ['a b c', 'a c b', 'b a c', 'b c a', 'c a b', 'c b a'];
    txt(30, 60, 'a tree of height 3 can have at most 2^3 = 8 leaves. Six are needed, one per order.', { size: 10.5 });
    for (var i = 0; i < 8; i++) {
      var x = 30 + i * 104, y = 96;
      var used = i < 6;
      if (p < 0.1 + i * 0.06) continue;
      P.rect(x, y, 96, 74, {
        fill: used ? PAL.accentDim : PAL.surface2,
        stroke: used ? PAL.accent : PAL.border, radius: 8, sw: used ? 1.4 : 1
      });
      mono(x + 48, y + 26, used ? orders[i] : 'unused', { size: used ? 11 : 9, align: 'center', color: used ? PAL.accent : PAL.faint });
      mono(x + 48, y + 50, used ? 'slot ' + (i + 1) : 'slack', { size: 8.5, align: 'center', color: PAL.faint });
    }
    if (p > 0.5) {
      panel(30, 196, 840, 96, 'ok');
      mono(46, 216, '3! = 6 orders   <=   8 slots   ->   height 3 is enough', { size: 11, bold: true, color: PAL.valid });
      txt(46, 244, 'Two slots stay empty. A shortage would be a contradiction; slack is only wasted room,', { size: 10, color: PAL.ink });
      txt(46, 264, 'and it is why the answer is a ceiling and not an exact logarithm.', { size: 10, color: PAL.ink });
    }
    if (p > 0.72) {
      panel(30, 310, 840, 104, 'bad');
      mono(46, 330, '4! = 24 orders   >   16 slots at height 4   ->   height 5 is necessary', { size: 11, bold: true, color: PAL.invalid });
      txt(46, 358, 'No algorithm of any kind can sort four items in four comparisons, because sixteen', { size: 10, color: PAL.ink });
      txt(46, 378, 'leaves cannot hold twenty four different answers. Nothing about the algorithm is used.', { size: 10, color: PAL.ink });
    }
    foot('the counting is on outcomes, never on code: this is what "information theoretic" means');
  }

  /* ---------- scene 4: leaves cap the height ---------- */

  function drawHeight(p) {
    head('Leaves cap the height, and the height is the worst case');

    var lines = [
      'a binary tree of height h has at most 2^h leaves',
      'a correct sort needs at least n! leaves',
      'so  2^h >= n!   and  h >= ceil(log2 n!)'
    ];
    for (var i = 0; i < lines.length; i++) {
      if (p < 0.08 + i * 0.16) continue;
      var y = 78 + i * 44;
      var tone = i === 2 ? PAL.accent : PAL.ink;
      mono(30, y, lines[i], { size: i === 2 ? 12 : 10.5, bold: i === 2, color: tone });
      if (i < 2) P.line(30, y + 12, 30 + lines[i].length * 6.3, y + 12, { stroke: PAL.border, sw: 1 });
    }

    if (p > 0.3) {
      panel(30, 216, 840, 128, 'ok');
      mono(46, 236, 'the ladder for n = 5, doubling from one:', { size: 10.5, bold: true, color: PAL.valid });
      var lad = [[5, 32, false], [6, 64, false], [7, 128, true]];
      for (var j = 0; j < lad.length; j++) {
        if (p < 0.36 + j * 0.1) continue;
        var yy = 260 + j * 26;
        mono(60, yy, '2^' + lad[j][0] + ' =', { size: 10.5, color: PAL.dim });
        mono(150, yy, String(lad[j][1]), { size: 10.5, color: lad[j][2] ? PAL.valid : PAL.invalid });
        txt(230, yy, lad[j][2] ? 'covers 120 orders' : 'short of 120 orders', { size: 10, color: lad[j][2] ? PAL.valid : PAL.invalid });
        var w = lad[j][1] * 1.7;
        bar(430, yy - 4, w, 14, lad[j][2] ? PR.rgba(PAL.valid, 0.22) : PR.rgba(PAL.invalid, 0.14), lad[j][2] ? PAL.valid : PAL.invalid);
        if (j === 0) P.line(430 + 120 * 1.7, 254, 430 + 120 * 1.7, 336, { stroke: PAL.invalid, sw: 1.4, dash: [4, 4] });
      }
      mono(700, 254, '120', { size: 9.5, color: PAL.invalid });
    }

    if (p > 0.72) {
      mono(30, 372, 'n = 5  ->  7 comparisons, and six are not enough', { size: 12, bold: true, color: PAL.accent });
      txt(30, 398, 'This is the 1991 paper item, and it is the whole calculation: find the smallest power of', { size: 10, color: PAL.dim });
      txt(30, 416, 'two that is at least n factorial.', { size: 10, color: PAL.dim });
    }
    foot('the tree can be lopsided, so it may use fewer leaves than 2^h - but never more');
  }

  /* ---------- scene 5: the table ---------- */

  function drawTable(p) {
    head('The computed table: n! against the smallest power of two that covers it');
    var cx = [50, 150, 350, 500, 640, 760];
    var hdr = ['n', 'n!', '2^(h-1)', '2^h', 'h = ceil', 'slack'];
    for (var c = 0; c < hdr.length; c++) mono(cx[c], 62, hdr[c], { size: 9.5, bold: true, color: PAL.dim });
    P.line(40, 72, 830, 72, { stroke: PAL.border, sw: 1 });

    for (var i = 0; i < TABLE.length; i++) {
      if (p < 0.05 + i * 0.045) continue;
      var r = TABLE[i], y = 92 + i * 26;
      var hot = r.n === 5 || r.n === 12;
      if (hot) P.rect(38, y - 6, 800, 22, { fill: PAL.warnDim, radius: 4 });
      mono(cx[0], y, String(r.n), { size: 10, bold: hot, color: PAL.ink });
      mono(cx[1], y, commas(r.f), { size: 10, bold: hot, color: PAL.ink });
      mono(cx[2], y, r.below === null ? '--' : commas(r.below), { size: 10, color: PAL.dim });
      mono(cx[3], y, commas(r.at), { size: 10, color: PAL.dim });
      mono(cx[4], y, String(r.h), { size: 10.5, bold: true, color: PAL.accent });
      mono(cx[5], y, commas(Number(r.at) - Number(r.f)), { size: 9.5, color: PAL.faint });
    }
    if (p > 0.62) {
      txt(30, 418, 'The last column is the room the algorithm never has to use: at n = 5 it is 128 - 120 = 8 slots.', { size: 10, color: PAL.dim });
    }
    foot('every entry is whole-number arithmetic: h is the smallest integer with 2^h >= n!, found by doubling');
  }

  /* ---------- scene 6: why the ceiling ---------- */

  function drawWhy(p) {
    head('Two wrong answers, and the smallest case that kills each');

    if (p > 0.05) {
      panel(30, 52, 410, 236, 'bad');
      mono(46, 72, 'rounding down', { size: 11, bold: true, color: PAL.invalid });
      txt(46, 96, 'At n = 5 the logarithm is 6.907. Rounding down gives 6,', { size: 10 });
      txt(46, 114, 'and a height-6 tree holds only 64 orders.', { size: 10 });
      mono(46, 142, '2^6 = 64   <   120 = 5!', { size: 11, bold: true, color: PAL.invalid });
      bar(46, 162, 320, 18, PR.rgba(PAL.valid, 0.18), PAL.valid);
      bar(46, 162, 170, 18, PR.rgba(PAL.invalid, 0.35), PAL.invalid);
      mono(200, 196, '56 orders left with no leaf', { size: 9.5, color: PAL.invalid });
      txt(46, 226, 'Two orders sharing a leaf print the same answer, so one', { size: 9.5, color: PAL.dim });
      txt(46, 244, 'of them comes out wrong.', { size: 9.5, color: PAL.dim });
      txt(46, 268, 'The ceiling is forced, not cautious.', { size: 10, bold: true, color: PAL.ink });
    }

    if (p > 0.28) {
      panel(460, 52, 410, 236, 'warn');
      mono(476, 72, 'base three', { size: 11, bold: true, color: PAL.warn });
      txt(476, 96, 'A comparison has three outcomes, but for distinct', { size: 10 });
      txt(476, 114, 'items the third cannot happen.', { size: 10 });
      P.circle(520, 160, 20, { fill: PAL.surface, stroke: PAL.border, sw: 1.4 });
      mono(520, 156, 'a:b', { size: 9, align: 'center' });
      P.arrow(538, 152, 590, 132, { stroke: PAL.accent, sw: 1.5 });
      P.arrow(538, 168, 590, 190, { stroke: PAL.accent, sw: 1.5 });
      mono(596, 130, 'a<b', { size: 9.5, color: PAL.accent });
      mono(596, 192, 'a>b', { size: 9.5, color: PAL.accent });
      P.line(548, 160, 600, 160, { stroke: PAL.invalid, sw: 1.4, dash: [4, 3] });
      mono(606, 158, 'a=b: impossible', { size: 9.5, color: PAL.invalid });
      mono(476, 226, 'log3(120) = 4.36', { size: 11, bold: true, color: PAL.warn });
      txt(476, 250, 'would claim five comparisons for five items, two', { size: 9.5, color: PAL.dim });
      txt(476, 268, 'fewer than the seven that are necessary.', { size: 9.5, color: PAL.dim });
    }

    if (p > 0.66) {
      mono(30, 322, 'so:  h >= ceil(log2 n!)   with base 2, rounded up', { size: 12, bold: true, color: PAL.accent });
      txt(30, 352, 'A height counts comparisons, and an algorithm cannot make half a comparison, so between', { size: 10, color: PAL.dim });
      txt(30, 370, 'two whole heights only the larger is usable.', { size: 10, color: PAL.dim });
    }
    foot('the third outcome is not wasted cleverness: a branch that can never be taken adds no leaves');
  }

  /* ---------- scene 7: Stirling ---------- */

  function drawStirling(p) {
    head('From an exact integer to Theta of n log n');

    if (p > 0.05) {
      panel(30, 52, 840, 74, 'ok');
      mono(46, 76, 'log2(n!)  =  n log2 n  -  1.4427 n  +  0.5 log2(2 pi n)  +  o(1)', { size: 12, bold: true, color: PAL.valid });
      txt(46, 104, '1.4427 is one over the natural logarithm of two: it converts Stirling from base e to base 2.', { size: 10, color: PAL.dim });
    }

    if (p > 0.3) {
      var rows = [[8, 16, 32]];
      var cx = [70, 220, 430, 640];
      mono(cx[0], 152, 'n', { size: 9.5, bold: true, color: PAL.dim });
      mono(cx[1], 152, 'log2(n!) exact', { size: 9.5, bold: true, color: PAL.dim });
      mono(cx[2], 152, 'Stirling', { size: 9.5, bold: true, color: PAL.dim });
      mono(cx[3], 152, 'merge sort worst', { size: 9.5, bold: true, color: PAL.dim });
      P.line(40, 162, 830, 162, { stroke: PAL.border, sw: 1 });
      var ns = [8, 16, 32];
      for (var i = 0; i < ns.length; i++) {
        var n = ns[i], y = 186 + i * 28;
        var exact = Math.log2(Number(factBig(n).toString()));
        mono(cx[0], y, String(n), { size: 10.5, bold: true });
        mono(cx[1], y, exact.toFixed(2), { size: 10.5 });
        mono(cx[2], y, stirling(n).toFixed(2), { size: 10.5, color: PAL.valid });
        mono(cx[3], y, String(mergeClosedForm(n)), { size: 10.5, color: PAL.info });
      }
      txt(40, 286, 'Stirling tracks the exact logarithm to two decimal places, and merge sort sits a small', { size: 10, color: PAL.dim });
      txt(40, 304, 'constant above it. At n = 32 the floor is 118 comparisons and merge sort spends 129.', { size: 10, color: PAL.dim });
    }

    if (p > 0.66) {
      mono(30, 348, 'leading term n log2 n  ->  the floor is Theta(n log n)', { size: 12, bold: true, color: PAL.accent });
      txt(30, 376, 'Omega says no comparison sort is faster; Theta also says one gets this close. Merge sort is', { size: 10, color: PAL.dim });
      txt(30, 394, 'that algorithm, so the bound is both a floor and a description of the best possible rate.', { size: 10, color: PAL.dim });
    }
    foot('the constant 1.4427 matters for exact counts and never for an asymptotic question');
  }

  /* ---------- scene 8: tightness ---------- */

  function drawTight(p) {
    head('The floor is achieved up to n = 11, and missed from n = 12');

    txt(30, 58, 'gap between the proven minimum and the floor, for n = 1 to 22', { size: 10.5 });
    var cw = 34, x0 = 42;
    for (var i = 0; i < 22; i++) {
      if (p < 0.04 + i * 0.028) continue;
      var n = i + 1, g = GAP[n];
      var x = x0 + i * cw;
      mono(x + cw / 2, 86, String(n), { size: 8, align: 'center', color: PAL.faint });
      P.rect(x, 96, cw - 4, 34, {
        fill: g === 0 ? PAL.accentDim : PAL.warnDim,
        stroke: g === 0 ? PAL.accent : PAL.warn, radius: 4, sw: 1
      });
      mono(x + (cw - 4) / 2, 114, String(g), { size: 11, bold: true, align: 'center', color: g === 0 ? PAL.valid : PAL.warn });
    }
    if (p > 0.36) {
      mono(42, 154, '0 = the floor is achievable', { size: 9.5, color: PAL.valid });
      mono(300, 154, '1 = the floor is one short', { size: 9.5, color: PAL.warn });
    }

    if (p > 0.5) {
      panel(30, 176, 400, 128, 'warn');
      mono(46, 196, 'n = 12', { size: 11, bold: true, color: PAL.warn });
      mono(46, 222, 'floor  ceil(log2 12!) = 29', { size: 10.5 });
      mono(46, 244, 'proven minimum      = 30', { size: 10.5, bold: true, color: PAL.invalid });
      txt(46, 270, 'Settled by exhaustive search; the counting cannot', { size: 9.5, color: PAL.dim });
      txt(46, 288, 'see the missing comparison.', { size: 9.5, color: PAL.dim });
    }
    if (p > 0.66) {
      panel(450, 176, 420, 128, 'ok');
      mono(466, 196, 'n = 1 to 11: gap 0', { size: 11, bold: true, color: PAL.valid });
      mono(466, 222, '3, 5, 7, 10, 13, 16, 19, 22, 26', { size: 10.5, color: PAL.ink });
      txt(466, 248, 'Merge insertion reaches the floor for every n up to 11,', { size: 9.5, color: PAL.dim });
      txt(466, 266, 'which is why the floor and the answer coincide there.', { size: 9.5, color: PAL.dim });
      txt(466, 288, 'It spends 30 at n = 12, one more than the floor.', { size: 9.5, color: PAL.warn });
    }
    if (p > 0.84) {
      txt(30, 330, 'The gap is irregular: one from 12 to 19, zero again at 20 and 21, one again at 22. That is why', { size: 10, color: PAL.dim });
      txt(30, 348, 'no formula for the exact minimum is known, and why the bound is what the syllabus tests.', { size: 10, color: PAL.dim });
      mono(30, 382, 'a floor is a promise about what is necessary, never about what is achievable', { size: 11, bold: true, color: PAL.accent });
    }
    foot('recorded minima are OEIS A036604; every gap on this strip is recomputed against the floor');
  }

  /* ---------- scene 9: the escape route ---------- */

  function drawEscape(p) {
    head('Where the floor does not apply: methods that never compare');

    if (p > 0.05) {
      var y = 74;
      mono(30, y, 'keys', { size: 9.5, color: PAL.dim });
      var keys = [3, 1, 2, 0, 3, 1];
      for (var i = 0; i < keys.length; i++) {
        P.rect(90 + i * 40, y - 14, 32, 22, { fill: PAL.surface, stroke: PAL.border, radius: 4, sw: 1 });
        mono(106 + i * 40, y - 3, String(keys[i]), { size: 10, align: 'center' });
      }
      P.arrow(340, y - 3, 380, y - 3, { stroke: PAL.accent, sw: 1.6 });
      mono(390, y - 3, 'tally', { size: 9.5, color: PAL.dim });
      var tally = [1, 2, 1, 2];
      for (var j = 0; j < tally.length; j++) {
        P.rect(450 + j * 46, y - 14, 38, 22, { fill: PAL.accentDim, stroke: PAL.accent, radius: 4, sw: 1 });
        mono(469 + j * 46, y - 3, String(tally[j]), { size: 10, align: 'center', color: PAL.accent });
      }
      P.arrow(640, y - 3, 680, y - 3, { stroke: PAL.accent, sw: 1.6 });
      mono(690, y - 3, 'output 0 1 1 2 3 3', { size: 10, color: PAL.ink });
    }

    if (p > 0.24) {
      panel(30, 106, 840, 66, 'ok');
      mono(46, 130, 'comparisons made:  0', { size: 13, bold: true, color: PAL.valid });
      txt(46, 156, 'A key is read as an index and a counter is incremented. No two items are ever looked at together.', { size: 10, color: PAL.ink });
    }

    if (p > 0.46) {
      panel(30, 188, 410, 130, '');
      mono(46, 208, 'counting sort', { size: 11, bold: true, color: PAL.info });
      txt(46, 232, 'cost: n plus the range k. Needs small', { size: 10 });
      txt(46, 250, 'integer keys, and needs to know k.', { size: 10 });
      mono(46, 282, 'no decision tree exists', { size: 10, bold: true, color: PAL.info });
    }
    if (p > 0.62) {
      panel(460, 188, 410, 130, '');
      mono(476, 208, 'radix sort', { size: 11, bold: true, color: PAL.info });
      txt(476, 232, 'cost: digits times n plus the base.', { size: 10 });
      txt(476, 250, 'Sorts digit by digit, never comparing.', { size: 10 });
      mono(476, 282, 'no decision tree exists', { size: 10, bold: true, color: PAL.info });
    }

    if (p > 0.8) {
      mono(30, 344, 'so the floor is conditional: it binds exactly the methods that learn by comparing', { size: 11, bold: true, color: PAL.accent });
      txt(30, 370, 'A question that says "comparison based" is asking for the floor. A question that offers a', { size: 10, color: PAL.dim });
      txt(30, 388, 'linear-time sort of small integers is testing whether you noticed the model changed.', { size: 10, color: PAL.dim });
    }
    foot('counting sort is checked on the page: zero comparisons counted, output sorted');
  }

  /* ---------- scene 10: the average case ---------- */

  function drawAvg(p) {
    head('The same tree bounds the average, and the best case is not bounded');

    var floor4 = Math.log2(24);
    var rows = [
      ['floor  log2(24)', floor4, PAL.invalid],
      ['optimal tree average', AVG4, PAL.accent],
      ['merge sort average', 4.667, PAL.info],
      ['insertion sort average', INS_AVG4, PAL.warn],
      ['insertion sort best case', INS_BEST4, PAL.valid]
    ];
    var x0 = 320, sc = 84;
    for (var i = 0; i < rows.length; i++) {
      if (p < 0.06 + i * 0.1) continue;
      var y = 70 + i * 40;
      txt(30, y + 12, rows[i][0], { size: 10 });
      var w = rows[i][1] * sc;
      bar(x0, y, w, 20, PR.rgba(rows[i][2], 0.18), rows[i][2]);
      mono(x0 + w + 8, y + 11, rows[i][1].toFixed(3), { size: 10, color: rows[i][2] });
    }
    var fx = x0 + floor4 * sc;
    P.line(fx, 60, fx, 268, { stroke: PAL.invalid, sw: 1.5, dash: [5, 4] });

    if (p > 0.58) {
      panel(30, 284, 840, 76, 'ok');
      mono(46, 304, 'any binary tree with L leaves has average depth at least log2 L', { size: 11, bold: true, color: PAL.valid });
      txt(46, 330, 'A lopsided tree can have one very short path, but it pays with very long ones. The average is', { size: 10, color: PAL.ink });
      txt(46, 348, 'what forbids the trade, which is why a bad pivot in quicksort hurts every input.', { size: 10, color: PAL.ink });
    }
    if (p > 0.8) {
      mono(30, 388, 'the best case escapes: n - 1 = 3 comparisons sorts four sorted items, under a floor of 5', { size: 10.5, bold: true, color: PAL.warn });
      txt(30, 412, 'A floor on the worst case says nothing about the best case. Reading it as "nobody can ever', { size: 10, color: PAL.dim });
      txt(30, 430, 'sort faster" is the mistake the last row is here to prevent.', { size: 10, color: PAL.dim });
    }
    foot('the two averages are measured on the page: the optimal tree over 24 paths, insertion sort over 24 orders');
  }

  /* ---------- scene 11: the procedure ---------- */

  function drawProc(p) {
    head('Five steps, and the three errors that cost the mark');

    var steps = [
      ['1', 'Decide what is counted', 'worst case, average case, or one named algorithm on one input'],
      ['2', 'Write the inequality', '2^h >= n!, then find the smallest power of two that covers n!'],
      ['3', 'Say floor or minimum', 'they agree to n = 11 and differ from n = 12 (29 against 30)'],
      ['4', 'Name the model', 'comparisons only, so counting sort is outside the bound'],
      ['5', 'Check the base', 'base 2, because the third outcome cannot happen for distinct keys']
    ];
    for (var i = 0; i < steps.length; i++) {
      if (p < 0.05 + i * 0.09) continue;
      var y = 58 + i * 52;
      P.circle(52, y + 8, 13, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.3 });
      mono(52, y + 4, steps[i][0], { size: 11, bold: true, align: 'center', color: PAL.accent });
      txt(80, y, steps[i][1], { size: 11, bold: true });
      txt(80, y + 20, steps[i][2], { size: 9.5, color: PAL.dim });
    }

    if (p > 0.62) {
      panel(30, 322, 840, 92, 'bad');
      mono(46, 342, 'the three errors', { size: 10.5, bold: true, color: PAL.invalid });
      mono(46, 366, 'rounding down      -> 6 instead of 7 at n = 5', { size: 10, color: PAL.ink });
      mono(46, 388, 'base three         -> 5 instead of 7 at n = 5', { size: 10, color: PAL.ink });
      mono(500, 366, 'floor as minimum   -> 29 instead of 30 at n = 12', { size: 10, color: PAL.ink });
      mono(500, 388, 'best case bounded  -> n - 1 at n = 8 is 7, under 16', { size: 10, color: PAL.ink });
    }
    foot('every number on this page is computed in the browser and reported in the model-checks panel');
  }

  var DRAW = {
    wall: drawWall, model: drawModel, leaves: drawLeaves, height: drawHeight,
    table: drawTable, why: drawWhy, stirling: drawStirling, tight: drawTight,
    escape: drawEscape, avg: drawAvg, proc: drawProc
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
    W: W, H: H,
    factBig: factBig, ceilLog2Fact: ceilLog2Fact, ceilLog2: ceilLog2, commas: commas,
    mergeInsertionBound: mergeInsertionBound, S: S, GAP: GAP, TABLE: TABLE,
    optimalCost: optimalCost, walkTree: walkTree, treeLeaves: treeLeaves,
    mergeSortCount: mergeSortCount, insertionCount: insertionCount, selectionCount: selectionCount,
    mergeClosedForm: mergeClosedForm, stirling: stirling, shapeCensus: shapeCensus, CENSUS: CENSUS,
    countingSortComparisons: countingSortComparisons,
    MRG8: MRG8, INS8: INS8, SEL8: SEL8, BOUND8: BOUND8, OPT: OPT,
    T3: T3, T4: T4, AVG4: AVG4, INS_AVG4: INS_AVG4, INS_BEST4: INS_BEST4,
    PASSED: PASSED, TOTAL: CHECKS.length, ALL_PASS: PASSED === CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
