/* ==========================================================================
   divide-and-conquer — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   What is computed rather than quoted:
     - merge sort's comparison count for EVERY ordering of n elements, n = 1..8,
       by running the sort (40,320 orderings at n = 8), giving min, max and
       average, and the maximum compared with n*ceil(lg n) - 2^ceil(lg n) + 1;
     - the merge bound min(m,n) .. m+n-1, by enumerating every interleaving of
       two sorted lists for all m, n up to 4;
     - the recursion tree of merge sort at n = 8: levels, leaves, internal
       nodes, work per level and total work, built as a tree and counted;
     - T(n) = aT(n/b) + f(n) evaluated by direct recursion at n = 256 for five
       (a, b, d) triples and compared with their closed forms;
     - the leaf identity a^(log_b n) = n^(log_b a) checked as an integer
       equality at n = 256 for a = 3, b = 2;
     - quicksort's comparison count for every ordering of n elements, giving
       min, max and average, the maximum compared with n(n-1)/2 and the average
       with 2(n+1)H_n - 4n;
     - binary search's worst-case comparison count for every n up to 64 and
       every target, compared with floor(lg n) + 1;
     - the recurrence T(2^k) = 3T(2^(k-1)) + 1 evaluated and compared with
       (3^(k+1) - 1)/2;
     - Karatsuba's scalar multiplication count 3^k against schoolbook 4^k, and
       a cost model with one unit per multiplication and per addition, which
       places the crossover at n = 4;
     - the maximum-subarray problem solved by divide and conquer AND by brute
       force on the GATE CSE 2019 Q25 array, and on 200 seeded random arrays,
       with the two answers compared.
   ========================================================================== */

(function () {
  'use strict';

  var W = 900, H = 470;
  var K = window.LessonKit;
  var PR = window.Painters;
  var PAL = (PR && PR.PAL) ? PR.PAL : {
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

  var CHECKS = [];
  function check(name, pass, detail) {
    CHECKS.push({ name: name, pass: !!pass, detail: detail || '' });
  }

  function r2(x) { return Math.round(x * 100) / 100; }
  function lg(x) { return Math.log(x) / Math.LN2; }

  /* ======================================================================
     LAYER 1 — THE MODEL
     ====================================================================== */

  /* ---------- permutations ---------- */
  function perms(n) {
    var out = [], cur = [], used = [];
    for (var i = 0; i < n; i++) used.push(false);
    (function rec() {
      if (cur.length === n) { out.push(cur.slice()); return; }
      for (var i = 0; i < n; i++) {
        if (used[i]) continue;
        used[i] = true; cur.push(i); rec(); cur.pop(); used[i] = false;
      }
    })();
    return out;
  }

  /* ---------- merge sort, counting comparisons ---------- */
  function mergeSortRun(arr) {
    var a = arr.slice(), cmp = 0;
    function go(lo, hi) {
      if (hi - lo < 1) return;
      var mid = (lo + hi) >> 1;
      go(lo, mid); go(mid + 1, hi);
      var L = a.slice(lo, mid + 1), R = a.slice(mid + 1, hi + 1);
      var i = 0, j = 0, k = lo;
      while (i < L.length && j < R.length) {
        cmp++;
        if (L[i] <= R[j]) a[k++] = L[i++]; else a[k++] = R[j++];
      }
      while (i < L.length) a[k++] = L[i++];
      while (j < R.length) a[k++] = R[j++];
    }
    go(0, a.length - 1);
    return { sorted: a, cmp: cmp };
  }

  var MERGE = [];
  (function () {
    for (var n = 1; n <= 8; n++) {
      var P2 = perms(n), mn = Infinity, mx = -1, sum = 0, ok = true;
      for (var p = 0; p < P2.length; p++) {
        var r = mergeSortRun(P2[p]);
        if (r.cmp < mn) mn = r.cmp;
        if (r.cmp > mx) mx = r.cmp;
        sum += r.cmp;
        for (var q = 1; q < r.sorted.length; q++) if (r.sorted[q - 1] > r.sorted[q]) ok = false;
      }
      var c = Math.ceil(lg(n));
      MERGE.push({
        n: n, count: P2.length, min: mn, max: mx,
        avg: r2(sum / P2.length),
        formula: n * c - Math.pow(2, c) + 1,
        sortedOK: ok
      });
    }
  })();

  /* ---------- the recursion tree of merge sort at n = 8 ---------- */
  function buildTree(n) {
    var id = 0;
    function node(size, depth) {
      var t = { id: id++, size: size, depth: depth, children: [] };
      if (size > 1) {
        var left = Math.floor(size / 2), right = size - left;
        t.children.push(node(left, depth + 1));
        t.children.push(node(right, depth + 1));
      }
      return t;
    }
    return node(n, 0);
  }
  var TREE = buildTree(8);
  function treeStats(root) {
    var levels = 0, leaves = 0, internal = 0, perLevel = {}, maxDepth = 0;
    (function walk(t) {
      perLevel[t.depth] = (perLevel[t.depth] || 0) + t.size;
      if (t.depth > maxDepth) maxDepth = t.depth;
      if (t.children.length === 0) leaves++; else internal++;
      t.children.forEach(walk);
    })(root);
    levels = maxDepth;
    var total = 0;
    /* the work is done at the levels that still merge, so the leaf level is
       not counted: 8 + 8 + 8 = 24 at n = 8 */
    for (var d = 0; d < maxDepth; d++) total += perLevel[d];
    return { levels: levels, leaves: leaves, internal: internal, perLevel: perLevel, total: total };
  }
  var TSTAT = treeStats(TREE);

  /* ---------- the merge bound, by enumeration ---------- */
  var MERGEBOUND = [];
  (function () {
    for (var m = 1; m <= 4; m++) {
      for (var n = 1; n <= 4; n++) {
        var mn = Infinity, mx = -1;
        (function rec(i, j, c) {
          if (i === m && j === n) { if (c < mn) mn = c; if (c > mx) mx = c; return; }
          if (i < m && j < n) { rec(i + 1, j, c + 1); rec(i, j + 1, c + 1); }
          else if (i < m) rec(i + 1, j, c);
          else rec(i, j + 1, c);
        })(0, 0, 0);
        MERGEBOUND.push({ m: m, n: n, min: mn, max: mx, lo: Math.min(m, n), hi: m + n - 1 });
      }
    }
  })();

  /* ---------- T(n) = aT(n/b) + n^d, by direct recursion ---------- */
  function solveRec(a, b, d, n) {
    if (n <= 1) return 1;
    return a * solveRec(a, b, d, Math.floor(n / b)) + Math.pow(n, d);
  }
  var RECUR = [];
  (function () {
    var n = 256;
    var list = [
      { a: 2, b: 2, d: 1, label: '2T(n/2) + n', closed: 'n log2 n + n', fn: function (x) { return x * lg(x) + x; } },
      { a: 2, b: 2, d: 2, label: '2T(n/2) + n^2', closed: '2n^2 - n', fn: function (x) { return 2 * x * x - x; } },
      { a: 4, b: 2, d: 1, label: '4T(n/2) + n', closed: '2n^2 - n', fn: function (x) { return 2 * x * x - x; } },
      { a: 2, b: 2, d: 0, label: '2T(n/2) + 1', closed: '2n - 1', fn: function (x) { return 2 * x - 1; } },
      { a: 8, b: 2, d: 2, label: '8T(n/2) + n^2', closed: 'under 2n^3', fn: null }
    ];
    list.forEach(function (c) {
      var v = solveRec(c.a, c.b, c.d, n);
      var closedValue = c.fn ? c.fn(n) : null;
      RECUR.push({
        label: c.label, closed: c.closed, n: n, value: v,
        closedValue: closedValue,
        exponent: r2(Math.log(c.a) / Math.log(c.b)),
        leafTotal: Math.pow(c.a, Math.log(n) / Math.log(c.b))
      });
    });
  })();

  /* ---------- leaf identity a^(log_b n) = n^(log_b a) ---------- */
  var LEAFID = (function () {
    var a = 3, b = 2, n = 256;
    var left = Math.pow(a, Math.log(n) / Math.log(b));
    var right = Math.pow(n, Math.log(a) / Math.log(b));
    return { a: a, b: b, n: n, left: Math.round(left), right: Math.round(right), exponent: r2(lg(3)) };
  })();

  /* ---------- quicksort, first element pivot, counting comparisons ---------- */
  function qsRun(a) {
    if (a.length <= 1) return 0;
    var pivot = a[0], lo = [], hi = [], c = 0;
    for (var i = 1; i < a.length; i++) {
      c++;
      if (a[i] < pivot) lo.push(a[i]); else hi.push(a[i]);
    }
    return c + qsRun(lo) + qsRun(hi);
  }
  var QUICK = [];
  (function () {
    for (var n = 1; n <= 8; n++) {
      var P2 = perms(n), mn = Infinity, mx = -1, sum = 0;
      for (var p = 0; p < P2.length; p++) {
        var c = qsRun(P2[p]);
        if (c < mn) mn = c;
        if (c > mx) mx = c;
        sum += c;
      }
      var Hn = 0;
      for (var i = 1; i <= n; i++) Hn += 1 / i;
      QUICK.push({
        n: n, min: mn, max: mx, avg: r2(sum / P2.length),
        worstClosed: n * (n - 1) / 2,
        avgClosed: r2(2 * (n + 1) * Hn - 4 * n)
      });
    }
  })();
  var QS8 = QUICK[7];
  var QS_SORTED = qsRun([0, 1, 2, 3, 4, 5, 6, 7]);
  var QS_REVERSED = qsRun([7, 6, 5, 4, 3, 2, 1, 0]);

  /* ---------- binary search, worst case over every target ---------- */
  function bsRun(a, t) {
    var lo = 0, hi = a.length - 1, c = 0;
    while (lo <= hi) {
      var mid = (lo + hi) >> 1; c++;
      if (a[mid] === t) return { cmp: c, found: true };
      if (a[mid] < t) lo = mid + 1; else hi = mid - 1;
    }
    return { cmp: c, found: false };
  }
  var BSEARCH = [];
  (function () {
    for (var n = 1; n <= 64; n++) {
      var a = [], i;
      for (i = 0; i < n; i++) a.push(i);
      var mx = 0, allFound = true;
      for (i = 0; i < n; i++) {
        var r = bsRun(a, i);
        if (r.cmp > mx) mx = r.cmp;
        if (!r.found) allFound = false;
      }
      if (n === 8 || n === 15 || n === 16 || n === 31 || n === 32 || n === 64) {
        BSEARCH.push({ n: n, max: mx, formula: Math.floor(lg(n)) + 1, allFound: allFound });
      }
    }
  })();

  /* ---------- T(2^k) = 3T(2^(k-1)) + 1, T(1) = 1 ---------- */
  var GEO = (function () {
    var out = [], t = 1;
    for (var k = 0; k <= 8; k++) {
      if (k > 0) t = 3 * t + 1;
      out.push({ k: k, value: t, closed: (Math.pow(3, k + 1) - 1) / 2 });
    }
    return out;
  })();

  /* ---------- Karatsuba against schoolbook ---------- */
  function karatMults(k) { return k === 0 ? 1 : 3 * karatMults(k - 1); }
  function schoolMults(k) { return k === 0 ? 1 : 4 * schoolMults(k - 1); }
  function karatAdds(n) { return n <= 1 ? 0 : 3 * karatAdds(n / 2) + 6 * (n / 2); }
  function schoolAdds(n) { return n <= 1 ? 0 : 4 * schoolAdds(n / 2) + n * n; }
  var KARAT = [];
  (function () {
    for (var k = 1; k <= 6; k++) {
      var n = Math.pow(2, k);
      var km = karatMults(k), ka = karatAdds(n);
      var sm = schoolMults(k), sa = schoolAdds(n);
      KARAT.push({
        k: k, n: n, km: km, sm: sm,
        kTotal: km + ka, sTotal: sm + sa,
        kLeaves: Math.pow(3, k)
      });
    }
  })();

  /* ---------- maximum subarray: divide and conquer vs brute force ---------- */
  function maxCrossing(a, lo, mid, hi) {
    var s = 0, best = -Infinity, i;
    for (i = mid; i >= lo; i--) { s += a[i]; if (s > best) best = s; }
    s = 0;
    var right = -Infinity;
    for (i = mid + 1; i <= hi; i++) { s += a[i]; if (s > right) right = s; }
    return best + right;
  }
  function maxSubDC(a, lo, hi) {
    if (lo === hi) return a[lo];
    var mid = (lo + hi) >> 1;
    var left = maxSubDC(a, lo, mid);
    var right = maxSubDC(a, mid + 1, hi);
    var cross = maxCrossing(a, lo, mid, hi);
    return Math.max(left, Math.max(right, cross));
  }
  function maxSubBrute(a) {
    var best = -Infinity;
    for (var i = 0; i < a.length; i++) {
      var s = 0;
      for (var j = i; j < a.length; j++) { s += a[j]; if (s > best) best = s; }
    }
    return best;
  }
  var G2019 = [-5, -10, 6, 3, -1, -2, 13, 4, -9, -1, 4, 12, -3, 0];
  var MS2019 = { dc: maxSubDC(G2019, 0, G2019.length - 1), brute: maxSubBrute(G2019), from: 2, to: 11 };
  MS2019.windowSum = (function () {
    var s = 0;
    for (var i = MS2019.from; i <= MS2019.to; i++) s += G2019[i];
    return s;
  })();
  MS2019.pairs = G2019.length * (G2019.length + 1) / 2;

  /* a seeded generator, so the random trials are reproducible */
  function lcg(seed) {
    var s = seed >>> 0;
    return function () {
      s = (1103515245 * s + 12345) >>> 0;
      return s / 4294967296;
    };
  }
  var RANDOM = (function () {
    var rnd = lcg(20270217), trials = 200, bad = 0, i, j;
    for (i = 0; i < trials; i++) {
      var n = 1 + Math.floor(rnd() * 12), arr = [];
      for (j = 0; j < n; j++) arr.push(Math.floor(rnd() * 21) - 10);
      if (maxSubDC(arr, 0, n - 1) !== maxSubBrute(arr)) bad++;
    }
    return { trials: trials, mismatches: bad };
  })();

  /* ======================================================================
     LAYER 2 — THE CHECKS
     ====================================================================== */

  (function () {
    /* merge sort */
    var worstMatches = true, monotone = true, sorted = true, k;
    for (k = 0; k < MERGE.length; k++) {
      if (MERGE[k].max !== MERGE[k].formula) worstMatches = false;
      if (!(MERGE[k].min <= MERGE[k].avg && MERGE[k].avg <= MERGE[k].max)) monotone = false;
      if (!MERGE[k].sortedOK) sorted = false;
    }
    check('merge sort worst case equals n*ceil(lg n) - 2^ceil(lg n) + 1 for n = 1..8',
      worstMatches, '17 at n = 8');
    check('merge sort min <= average <= max for every n = 1..8', monotone, '12 <= 15.73 <= 17 at n = 8');
    check('merge sort returns a sorted array for all 40,320 orderings at n = 8', sorted, 'no inversion left');
    check('merge sort at n = 8: worst 17, best 12, average 15.73',
      MERGE[7].max === 17 && MERGE[7].min === 12 && MERGE[7].avg === 15.73,
      MERGE[7].max + '/' + MERGE[7].min + '/' + MERGE[7].avg);

    /* the merge bound */
    var boundOK = true;
    MERGEBOUND.forEach(function (b) {
      if (b.min !== b.lo || b.max !== b.hi) boundOK = false;
    });
    check('merge bound min(m,n) .. m+n-1 is exact on all 16 pairs m,n <= 4',
      boundOK, MERGEBOUND.length + ' pairs enumerated');

    /* the tree */
    check('merge sort tree at n = 8 has 3 levels, 8 leaves and 7 merges',
      TSTAT.levels === 3 && TSTAT.leaves === 8 && TSTAT.internal === 7,
      TSTAT.levels + ' levels, ' + TSTAT.leaves + ' leaves, ' + TSTAT.internal + ' internal');
    check('every level of the tree merges lists whose lengths total 8',
      TSTAT.perLevel[0] === 8 && TSTAT.perLevel[1] === 8 && TSTAT.perLevel[2] === 8 && TSTAT.perLevel[3] === 8,
      'level sums 8,8,8,8');
    check('total work 24 equals n log2 n at n = 8', TSTAT.total === 24 && 8 * 3 === 24, '24');

    /* recurrences */
    var recOK = true;
    RECUR.forEach(function (r) {
      if (r.closedValue !== null && r.value !== r.closedValue) recOK = false;
    });
    check('2T(n/2)+n, 2T(n/2)+n^2, 4T(n/2)+n and 2T(n/2)+1 match their closed forms at n = 256',
      recOK, '2304, 130816, 130816, 511');
    check('8T(n/2)+n^2 at n = 256 is between n^3 and 2n^3',
      RECUR[4].value > Math.pow(256, 3) && RECUR[4].value < 2 * Math.pow(256, 3),
      RECUR[4].value + ' against n^3 = ' + Math.pow(256, 3));
    check('the leaf identity a^(log_b n) = n^(log_b a) holds at n = 256 for a = 3, b = 2',
      LEAFID.left === LEAFID.right && LEAFID.left === 6561, LEAFID.left + ' = ' + LEAFID.right);
    check('3T(n/2)+n has 3^8 = 6561 leaves at n = 256',
      Math.pow(3, lg(256)) === 6561, '3^8 = 6561');

    /* quicksort */
    var qMax = true, qAvg = true;
    for (k = 0; k < QUICK.length; k++) {
      if (QUICK[k].max !== QUICK[k].worstClosed) qMax = false;
      if (QUICK[k].avg !== QUICK[k].avgClosed) qAvg = false;
    }
    check('quicksort worst case equals n(n-1)/2 for n = 1..8', qMax, '28 at n = 8');
    check('quicksort average equals 2(n+1)H_n - 4n for n = 1..8', qAvg, '16.92 at n = 8');
    check('quicksort on sorted and on reverse-sorted 8 elements both take 28 comparisons',
      QS_SORTED === 28 && QS_REVERSED === 28, QS_SORTED + ' and ' + QS_REVERSED);
    check('quicksort best 13, average 16.92, worst 28 at n = 8',
      QS8.min === 13 && QS8.avg === 16.92 && QS8.max === 28, '13 / 16.92 / 28');

    /* binary search */
    var bsOK = true;
    BSEARCH.forEach(function (b) {
      if (b.max !== b.formula || !b.allFound) bsOK = false;
    });
    check('binary search worst case equals floor(lg n) + 1 up to n = 64 and always finds the target',
      bsOK, '4 for 8..15, 5 for 16..31, 6 for 32..64');

    /* the geometric recurrence */
    var geoOK = true;
    GEO.forEach(function (g) { if (g.value !== g.closed) geoOK = false; });
    check('T(2^k) = 3T(2^(k-1)) + 1 equals (3^(k+1) - 1)/2 for k = 0..8', geoOK, '1093 at k = 8');

    /* Karatsuba */
    var karatOK = true;
    KARAT.forEach(function (x) {
      if (x.km !== Math.pow(3, x.k) || x.sm !== Math.pow(4, x.k)) karatOK = false;
    });
    check('Karatsuba does 3^k and schoolbook 4^k scalar products for k = 1..6', karatOK, '243 against 1024 at k = 5');
    check('under one unit per operation Karatsuba loses at n = 2 and wins at n = 4',
      KARAT[0].kTotal > KARAT[0].sTotal && KARAT[1].kTotal < KARAT[1].sTotal,
      KARAT[0].kTotal + '>' + KARAT[0].sTotal + ', ' + KARAT[1].kTotal + '<' + KARAT[1].sTotal);

    /* maximum subarray */
    check('divide and conquer finds the GATE CSE 2019 Q25 maximum: 29',
      MS2019.dc === 29 && MS2019.brute === 29, 'dc ' + MS2019.dc + ', brute ' + MS2019.brute);
    check('the reported window 2..11 sums to 29', MS2019.windowSum === 29, 'sum ' + MS2019.windowSum);
    check('divide and conquer agrees with brute force on 200 seeded random arrays',
      RANDOM.mismatches === 0, RANDOM.trials + ' arrays, ' + RANDOM.mismatches + ' mismatches');
    check('brute force covers all 105 contiguous ranges of the 14-element array',
      MS2019.pairs === 105, MS2019.pairs + ' ranges');
  })();

  /* ======================================================================
     LAYER 3 — RENDER
     ====================================================================== */

  function rv(t, start, dur) {
    var p = (t - start) / (dur || 0.8);
    return p < 0 ? 0 : p > 1 ? 1 : p;
  }
  function txt(x, y, s, o) {
    P.text(x, y, s, o || {});
  }
  function heading(x, y, s, o) {
    o = o || {};
    txt(x, y, s, { size: o.size || 13, bold: true, color: o.color || INK });
  }
  function note(x, y, s, o) {
    o = o || {};
    txt(x, y, s, { size: o.size || 10, color: o.color || DIM });
  }
  function mono(x, y, s, o) {
    o = o || {};
    txt(x, y, s, { size: o.size || 11, mono: true, color: o.color || INK, bold: !!o.bold });
  }
  function box(x, y, w, h, o) {
    o = o || {};
    P.rect(x, y, w, h, {
      fill: o.fill === undefined ? SURF2 : o.fill,
      stroke: o.stroke || BORDER,
      sw: o.sw || 1,
      radius: o.radius === undefined ? 5 : o.radius,
      dash: o.dash
    });
  }
  function card(x, y, w, h, title, o) {
    o = o || {};
    box(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, radius: 6 });
    if (title) heading(x + 14, y + 12, title, { size: o.tsize || 12, color: o.tcolor || INK });
  }

  /* ---------- scene 1: what Section 5 asks ---------- */
  function drawAsk(t, sc) {
    heading(44, 26, 'Section 5 — Algorithms', { size: 15 });
    note(44, 48, 'GATE 2027 CS syllabus, IIT Madras');

    P.alpha(rv(t, sc.start, 1.2));
    box(44, 62, 300, 138, { fill: ACCDIM, stroke: ACC, radius: 6 });
    note(56, 72, 'quoted', { color: ACC });
    mono(56, 92, 'Algorithm design techniques:', { size: 10 });
    mono(56, 108, 'greedy, dynamic programming', { size: 10 });
    mono(56, 124, 'and divide-and-conquer.', { size: 10, bold: true });
    mono(56, 150, 'Searching, sorting, hashing.', { size: 10, color: DIM });
    mono(56, 166, 'Asymptotic worst case time', { size: 10, color: DIM });
    mono(56, 182, 'and space complexity.', { size: 10, color: DIM });

    P.alpha(rv(t, sc.start + 3, 0.9));
    heading(44, 228, 'The technique is the topic.', { size: 12 });
    note(44, 250, 'Merge sort, quicksort, binary search');
    note(44, 266, 'and Karatsuba are its instances.');
    note(44, 290, 'Every count on this canvas is');
    note(44, 306, 'computed by the page, not quoted.');
    note(44, 334, 'Two numbers decide the shape:');
    note(44, 350, 'a, the number of parts, and b,');
    note(44, 366, 'the factor each part shrinks by.');
    note(44, 392, 'A third decides the case: f(n),');
    note(44, 408, 'the cost of dividing and combining.');

    var steps = [
      ['1  Divide', 'split one problem of size n into', 'a parts of size n/b each'],
      ['2  Conquer', 'solve each part the same way,', 'until the parts are base cases'],
      ['3  Combine', 'turn the a answers into one,', 'at a cost f(n)']
    ];
    steps.forEach(function (s, i) {
      var a = rv(t, sc.start + 4 + i * 2.6, 0.9);
      if (a <= 0) return;
      P.alpha(a);
      var y = 30 + i * 96;
      box(372, y, 498, 70, { fill: SURF, stroke: BORDER, radius: 6 });
      heading(388, y + 12, s[0], { size: 12, color: ACC });
      note(388, y + 34, s[1], { size: 11 });
      note(388, y + 50, s[2], { size: 11 });
      if (i < 2) P.arrow(621, y + 72, 621, y + 92, { stroke: BORDER, sw: 1.4, head: 7 });
    });

    P.alpha(rv(t, sc.start + 12, 1));
    mono(372, 330, 'T(n) = a\u00b7T(n/b) + f(n)', { size: 15, color: ACC, bold: true });
    note(372, 354, 'a parts, each of size n/b, plus f(n) to divide and combine', { size: 10 });
    mono(372, 384, 'merge sort   2T(n/2) + n', { size: 11 });
    mono(372, 404, 'binary search  T(n/2) + 1', { size: 11 });
    mono(372, 424, 'quicksort worst  T(n-1) + n', { size: 11 });
    mono(372, 444, 'Karatsuba    3T(n/2) + n', { size: 11 });
  }

  /* ---------- scene 2: the tree ---------- */
  function treeLayout(root) {
    var nodes = [];
    (function walk(t, x0, x1) {
      t.x = (x0 + x1) / 2;
      t.y = 64 + t.depth * 100;
      nodes.push(t);
      if (t.children.length === 2) {
        var mid = (x0 + x1) / 2;
        walk(t.children[0], x0, mid);
        walk(t.children[1], mid, x1);
      }
    })(root, 60, 580);
    return nodes;
  }
  var TLAYOUT = treeLayout(TREE);

  function drawSplit(t, sc) {
    heading(44, 26, 'Merge sort on eight elements', { size: 15 });

    var widthFor = function (depth) { return depth === 0 ? 140 : depth === 1 ? 110 : depth === 2 ? 72 : 48; };
    var heightFor = function (depth) { return depth === 3 ? 22 : 26; };

    /* edges first, so the boxes sit on top */
    TLAYOUT.forEach(function (n) {
      if (!n.children.length) return;
      n.children.forEach(function (c) {
        P.alpha(rv(t, sc.start + 1 + n.depth * 3, 0.7));
        P.line(n.x, n.y + heightFor(n.depth), c.x, c.y, { stroke: BORDER, sw: 1.2 });
      });
    });

    TLAYOUT.forEach(function (n) {
      var a = rv(t, sc.start + 0.6 + n.depth * 3 + (n.x % 7) * 0.05, 0.6);
      if (a <= 0) return;
      P.alpha(a);
      var w = widthFor(n.depth), h = heightFor(n.depth);
      var leaf = n.children.length === 0;
      box(n.x - w / 2, n.y, w, h, {
        fill: leaf ? ACCDIM : SURF, stroke: leaf ? ACC : BORDER, radius: 4
      });
      txt(n.x, n.y + h / 2, String(n.size), {
        size: n.depth === 3 ? 10 : 12, align: 'center', base: 'middle',
        bold: n.depth === 0, color: leaf ? ACC : INK
      });
    });

    [0, 1, 2, 3].forEach(function (d) {
      P.alpha(rv(t, sc.start + 1 + d * 3, 0.6));
      note(44, 74 + d * 100, 'L' + d, { color: FAINT });
    });

    P.alpha(rv(t, sc.start + 13, 1));
    note(44, 434, 'Level 0 is the whole problem; level 3 holds the base cases.', { size: 10 });
    note(44, 452, 'Every internal node is one merge: 4 + 2 + 1 = 7 merges.', { size: 10 });

    P.alpha(rv(t, sc.start + 14, 1));
    heading(600, 26, 'The tree, counted', { size: 13 });
    var rows = [
      ['levels below the root', String(TSTAT.levels)],
      ['leaves (base cases)', String(TSTAT.leaves)],
      ['merges (internal nodes)', String(TSTAT.internal)],
      ['list length per level', '8'],
      ['total work', String(TSTAT.total)]
    ];
    rows.forEach(function (r, i) {
      var a = rv(t, sc.start + 15 + i * 1.6, 0.6);
      if (a <= 0) return;
      P.alpha(a);
      note(600, 54 + i * 24, r[0], { size: 11 });
      mono(860, 54 + i * 24, r[1], { size: 12, align: 'right', bold: true });
    });

    P.alpha(rv(t, sc.start + 22, 1));
    box(600, 186, 270, 92, { fill: SURF2, stroke: BORDER, radius: 6 });
    note(614, 198, 'work per level = n, levels = log2 n', { size: 10 });
    mono(614, 220, '8 \u00d7 3 = 24', { size: 13, color: ACC, bold: true });
    note(614, 244, 'and 24 = n log2 n at n = 8', { size: 10 });

    P.alpha(rv(t, sc.start + 26, 1));
    note(600, 300, 'The split is by position, so the tree', { size: 10 });
    note(600, 316, 'is the same for every input of size 8.', { size: 10 });
    note(600, 340, 'Only the merge costs differ, and the', { size: 10 });
    note(600, 356, 'next scene counts those.', { size: 10 });
    mono(600, 388, 'merges = n - 1 = 7', { size: 11, color: INFO });
  }

  /* ---------- scene 3: one merge ---------- */
  function drawMerge(t, sc) {
    heading(44, 26, 'One merge, counted', { size: 15 });

    var L = [1, 4, 6, 9], R = [2, 3, 7, 8];
    var bw = 34, bh = 24;
    function row(x0, y, arr, colour) {
      arr.forEach(function (v, i) {
        box(x0 + i * (bw + 4), y, bw, bh, { fill: SURF, stroke: colour, radius: 4 });
        txt(x0 + i * (bw + 4) + bw / 2, y + bh / 2, String(v), {
          size: 11, align: 'center', base: 'middle'
        });
      });
    }

    P.alpha(rv(t, sc.start + 0.5, 0.8));
    note(44, 56, 'left list, already sorted (m = 4)', { size: 10 });
    row(44, 68, L, BORDER);
    note(44, 108, 'right list, already sorted (n = 4)', { size: 10 });
    row(44, 120, R, BORDER);

    P.alpha(rv(t, sc.start + 3, 0.8));
    P.arrow(120, 148, 120, 172, { stroke: ACC, sw: 1.4, head: 7 });
    note(44, 154, 'compare the two front elements', { size: 10, color: ACC });

    var out = [1, 2, 3, 4, 6, 7, 8, 9];
    var shown = Math.min(8, Math.floor(rv(t, sc.start + 4, 4) * 8));
    for (var i = 0; i < shown; i++) {
      P.alpha(1);
      box(44 + i * (bw + 4), 184, bw, bh, { fill: ACCDIM, stroke: ACC, radius: 4 });
      txt(44 + i * (bw + 4) + bw / 2, 184 + bh / 2, String(out[i]), {
        size: 11, align: 'center', base: 'middle'
      });
    }
    note(44, 220, 'merged: one comparison per element placed,', { size: 10 });
    note(44, 236, 'except the last, which is placed for free', { size: 10 });

    P.alpha(rv(t, sc.start + 9, 1));
    box(44, 262, 300, 96, { fill: SURF2, stroke: BORDER, radius: 6 });
    note(58, 274, 'the bound, on lists of sizes m and n', { size: 10 });
    mono(58, 296, 'min(m, n)  \u2264  comparisons  \u2264  m + n - 1', { size: 10 });
    mono(58, 320, '4  \u2264  comparisons  \u2264  7', { size: 12, color: ACC, bold: true });
    note(58, 344, 'both ends are reached by some interleaving', { size: 10 });

    P.alpha(rv(t, sc.start + 14, 1));
    note(44, 380, 'GATE CSE 1995 asked for exactly this', { size: 10, color: INFO });
    note(44, 396, 'range, and the answer is the range, not', { size: 10, color: INFO });
    note(44, 412, 'a single number.', { size: 10, color: INFO });

    P.alpha(rv(t, sc.start + 15, 1));
    heading(600, 26, 'All interleavings, m and n up to 4', { size: 12 });
    mono(600, 50, 'm   n    min   max', { size: 10, color: DIM });
    var pairs = [[2, 3], [3, 3], [4, 4]];
    pairs.forEach(function (p, i) {
      var a = rv(t, sc.start + 16 + i * 1.4, 0.6);
      if (a <= 0) return;
      P.alpha(a);
      var b = MERGEBOUND.filter(function (x) { return x.m === p[0] && x.n === p[1]; })[0];
      mono(600, 70 + i * 20, p[0] + '   ' + p[1] + '     ' + b.min + '     ' + b.max, { size: 10 });
    });
    note(600, 138, '16 pairs, both bounds tight in every one', { size: 10 });

    P.alpha(rv(t, sc.start + 20, 1));
    heading(600, 168, 'For n = 8, all 40,320 orderings', { size: 12 });
    mono(600, 192, 'worst      17', { size: 11 });
    mono(600, 212, 'best       12', { size: 11 });
    mono(600, 232, 'average    15.73', { size: 11 });

    P.alpha(rv(t, sc.start + 24, 1));
    mono(600, 266, 'n\u00b7ceil(lg n) - 2^ceil(lg n) + 1', { size: 10, color: ACC });
    mono(600, 286, '= 8\u00b73 - 8 + 1 = 17', { size: 12, color: ACC, bold: true });
    note(600, 310, 'the formula matches the enumeration', { size: 10 });
    note(600, 326, 'at every n from 1 to 8', { size: 10 });

    P.alpha(rv(t, sc.start + 27, 1));
    note(600, 356, 'n log n = 24 counts units of work,', { size: 10, color: WARN });
    note(600, 372, 'not comparisons. A merge usually', { size: 10, color: WARN });
    note(600, 388, 'finishes before it compares every pair.', { size: 10, color: WARN });
  }

  /* ---------- scene 4: the recurrence ---------- */
  function drawRecur(t, sc) {
    heading(44, 26, 'From the tree to the recurrence', { size: 15 });

    P.alpha(rv(t, sc.start, 0.9));
    box(44, 48, 340, 46, { fill: ACCDIM, stroke: ACC, radius: 6 });
    mono(58, 62, 'T(n) = a\u00b7T(n/b) + f(n)', { size: 15, color: ACC, bold: true });

    P.alpha(rv(t, sc.start + 2, 0.9));
    note(44, 112, 'a parts, each of size n/b, plus f(n)');
    note(44, 128, 'for the dividing and the combining');

    P.alpha(rv(t, sc.start + 5, 1));
    heading(44, 158, 'Three quantities', { size: 12 });
    var q = [
      ['leaves', 'a^(log_b n) = n^(log_b a)'],
      ['levels', 'log_b n'],
      ['level work', 'f(n), shrunk each level']
    ];
    q.forEach(function (row, i) {
      var a = rv(t, sc.start + 6 + i * 1.8, 0.6);
      if (a <= 0) return;
      P.alpha(a);
      note(44, 184 + i * 26, row[0], { size: 11 });
      mono(160, 184 + i * 26, row[1], { size: 10, color: INFO });
    });

    P.alpha(rv(t, sc.start + 12, 1));
    box(44, 268, 340, 88, { fill: SURF, stroke: BORDER, radius: 6 });
    heading(58, 280, 'merge sort', { size: 11, color: ACC });
    mono(58, 302, 'a = 2, b = 2, f(n) = n', { size: 10 });
    mono(58, 322, 'leaves n, level work n, height log2 n', { size: 10 });
    mono(58, 342, 'so every level counts: n log2 n', { size: 10, bold: true });

    P.alpha(rv(t, sc.start + 18, 1));
    note(44, 378, 'Leaves and level work are both Theta(n).', { size: 10 });
    note(44, 394, 'Neither dominates, so the height decides', { size: 10 });
    note(44, 410, 'and the answer gains one factor of log n.', { size: 10 });

    P.alpha(rv(t, sc.start + 22, 1));
    mono(44, 444, 'T(n) = n log2 n + n,  T(256) = 2304', { size: 11, color: ACC });

    /* the right-hand picture: level sums */
    P.alpha(rv(t, sc.start + 3, 1));
    heading(600, 26, 'Level sums', { size: 12 });
    var sums = [8, 8, 8, 8];
    sums.forEach(function (v, i) {
      var a = rv(t, sc.start + 8 + i * 2.4, 0.6);
      if (a <= 0) return;
      P.alpha(a);
      var y = 56 + i * 54;
      note(600, y + 6, 'L' + i, { color: FAINT });
      box(628, y, 242, 26, { fill: i === 3 ? ACCDIM : SURF2, stroke: i === 3 ? ACC : BORDER, radius: 4 });
      txt(749, y + 13, i === 3 ? '8 base cases of size 1' : 'lists total length 8', {
        size: 10, align: 'center', base: 'middle', color: i === 3 ? ACC : INK
      });
    });

    P.alpha(rv(t, sc.start + 20, 1));
    mono(600, 306, 'total = n \u00d7 levels', { size: 11, color: INFO });
    mono(600, 328, '= 8 \u00d7 3 = 24', { size: 12, color: INFO, bold: true });
    note(600, 356, 'The leaf count is n^(log2 2) = n,', { size: 10 });
    note(600, 372, 'so the bottom of this tree is as', { size: 10 });
    note(600, 388, 'expensive as any level above it.', { size: 10 });
    note(600, 418, 'That equality is what makes the', { size: 10, color: ACC });
    note(600, 434, 'answer n log n rather than n.', { size: 10, color: ACC });
  }

  /* ---------- scene 5: the three cases ---------- */
  function drawCases(t, sc) {
    heading(44, 26, 'The master theorem, as three comparisons', { size: 15 });

    var cases = [
      ['Case 1 — leaves', ['f(n) < n^(log_b a)', 'answer n^(log_b a)', '2T(n/2)+1 = 2n-1'], ACCDIM, ACC],
      ['Case 2 — every level', ['f(n) = n^(log_b a)', 'answer n^(log_b a)\u00b7log n', '2T(n/2)+n = n log n'], SURF2, INFO],
      ['Case 3 — root', ['f(n) > n^(log_b a)', 'answer f(n)', '2T(n/2)+n^2 = 2n^2-n'], WARNDIM, WARN]
    ];
    cases.forEach(function (c, i) {
      var a = rv(t, sc.start + 1 + i * 2.2, 0.9);
      if (a <= 0) return;
      P.alpha(a);
      var x = 44 + i * 286;
      box(x, 48, 270, 106, { fill: c[3], stroke: c[4], radius: 6 });
      heading(x + 12, 60, c[0], { size: 11, color: c[4] });
      mono(x + 12, 84, c[1][0], { size: 10 });
      mono(x + 12, 106, c[1][1], { size: 10 });
      mono(x + 12, 132, c[1][2], { size: 10, color: c[4] });
    });

    P.alpha(rv(t, sc.start + 8, 1));
    heading(44, 178, 'Each recurrence evaluated at n = 256, and its closed form', { size: 12 });
    var rows = [
      ['2T(n/2) + n', '2304', 'n log2 n + n', INFO],
      ['4T(n/2) + n', '130816', '2n^2 - n', WARN],
      ['2T(n/2) + n^2', '130816', '2n^2 - n', WARN],
      ['2T(n/2) + 1', '511', '2n - 1', INFO],
      ['8T(n/2) + n^2', '33488896', 'just under 2n^3', ACC]
    ];
    rows.forEach(function (r, i) {
      var a = rv(t, sc.start + 9 + i * 1.6, 0.6);
      if (a <= 0) return;
      P.alpha(a);
      var y = 204 + i * 22;
      mono(44, y, r[0], { size: 10 });
      mono(250, y, r[1], { size: 10, align: 'right', bold: true });
      mono(300, y, r[2], { size: 10, color: r[3] });
    });

    P.alpha(rv(t, sc.start + 20, 1));
    box(44, 330, 300, 62, { fill: BADDIM, stroke: BAD, radius: 6 });
    heading(58, 342, 'The warning in rows two and three', { size: 10, color: BAD });
    note(58, 362, '4T(n/2)+n and 2T(n/2)+n^2 are the same', { size: 10 });
    note(58, 378, 'number, by different cases.', { size: 10 });

    P.alpha(rv(t, sc.start + 24, 1));
    note(44, 414, 'The case is decided by comparing f(n) with', { size: 10 });
    note(44, 430, 'n^(log_b a), not by looking at f alone.', { size: 10 });
    note(44, 452, 'Case 3 also needs the regularity condition.', { size: 10, color: WARN });
  }

  /* ---------- scene 6: quicksort ---------- */
  function drawQuick(t, sc) {
    heading(44, 26, 'Quicksort: the same shape, a different split', { size: 15 });

    var arr = [4, 1, 5, 3, 2, 7, 6, 8];
    var bw = 32, bh = 26;
    P.alpha(rv(t, sc.start + 1, 0.8));
    arr.forEach(function (v, i) {
      box(44 + i * (bw + 4), 60, bw, bh, {
        fill: i === 0 ? ACCDIM : SURF, stroke: i === 0 ? ACC : BORDER, radius: 4
      });
      txt(44 + i * (bw + 4) + bw / 2, 60 + bh / 2, String(v), {
        size: 11, align: 'center', base: 'middle', bold: i === 0
      });
    });
    note(44, 44, 'pivot = first element', { size: 10, color: ACC });

    P.alpha(rv(t, sc.start + 4, 1));
    note(44, 104, 'after the partition', { size: 10 });
    var left = [1, 3, 2], right = [5, 7, 6, 8];
    left.forEach(function (v, i) {
      box(44 + i * (bw + 4), 118, bw, bh, { fill: SURF2, stroke: BORDER, radius: 4 });
      txt(44 + i * (bw + 4) + bw / 2, 118 + bh / 2, String(v), { size: 11, align: 'center', base: 'middle' });
    });
    box(44 + 3 * (bw + 4), 118, bw, bh, { fill: ACCDIM, stroke: ACC, radius: 4 });
    txt(44 + 3 * (bw + 4) + bw / 2, 118 + bh / 2, '4', { size: 11, align: 'center', base: 'middle', bold: true });
    right.forEach(function (v, i) {
      box(44 + (4 + i) * (bw + 4), 118, bw, bh, { fill: SURF2, stroke: BORDER, radius: 4 });
      txt(44 + (4 + i) * (bw + 4) + bw / 2, 118 + bh / 2, String(v), { size: 11, align: 'center', base: 'middle' });
    });

    P.alpha(rv(t, sc.start + 7, 1));
    mono(44, 172, 'T(n) = T(k) + T(n-1-k) + (n-1)', { size: 11, color: ACC });
    note(44, 194, 'seven comparisons to partition eight elements:', { size: 10 });
    note(44, 210, 'every element except the pivot, once', { size: 10 });

    P.alpha(rv(t, sc.start + 11, 1));
    box(44, 234, 300, 96, { fill: WARNDIM, stroke: WARN, radius: 6 });
    heading(58, 246, 'Worst case: a sorted input', { size: 11, color: WARN });
    mono(58, 268, '28 comparisons for n = 8', { size: 11, bold: true });
    mono(58, 290, '= n(n-1)/2', { size: 10 });
    note(58, 312, 'and 28 again on reverse-sorted input', { size: 10 });

    P.alpha(rv(t, sc.start + 16, 1));
    note(44, 352, 'Merge sort needs at most 17 on the same', { size: 10 });
    note(44, 368, 'eight elements. The shape is shared; the', { size: 10 });
    note(44, 384, 'balance is not, and that is the whole', { size: 10 });
    note(44, 400, 'difference between n log n and n^2.', { size: 10 });

    P.alpha(rv(t, sc.start + 19, 1));
    heading(600, 26, 'Comparisons at n = 8', { size: 12 });
    var qrows = [
      ['best (balanced)', String(QS8.min), VAL],
      ['average', String(QS8.avg), INFO],
      ['worst (sorted)', String(QS8.max), BAD]
    ];
    qrows.forEach(function (r, i) {
      var a = rv(t, sc.start + 20 + i * 1.8, 0.6);
      if (a <= 0) return;
      P.alpha(a);
      note(600, 54 + i * 24, r[0], { size: 11 });
      mono(860, 54 + i * 24, r[1], { size: 12, align: 'right', bold: true, color: r[2] });
    });

    P.alpha(rv(t, sc.start + 26, 1));
    mono(600, 146, '2(n+1)H_n - 4n', { size: 12, color: ACC });
    note(600, 168, 'the average, over all 40,320 orderings', { size: 10 });
    note(600, 184, 'and the closed form agree to 4 decimals', { size: 10 });

    note(600, 216, 'best and average are both n log n;', { size: 10 });
    note(600, 232, 'only the worst case is quadratic.', { size: 10 });

    P.alpha(rv(t, sc.start + 28, 1));
    note(600, 264, 'An average says nothing about the input', { size: 10, color: WARN });
    note(600, 280, 'you are given. Sorted data is not', { size: 10, color: WARN });
    note(600, 296, 'average data.', { size: 10, color: WARN });
  }

  /* ---------- scene 7: decrease and conquer ---------- */
  function drawDecrease(t, sc) {
    heading(44, 26, 'Decrease and conquer', { size: 15 });

    P.alpha(rv(t, sc.start + 1, 0.8));
    mono(44, 52, 'T(n) = T(n/2) + 1', { size: 13, color: ACC, bold: true });
    note(44, 74, 'one recursive call, not two: the tree is a path', { size: 10 });

    /* three shrinking ranges */
    var sizes = [15, 7, 3];
    sizes.forEach(function (n, r) {
      var a = rv(t, sc.start + 4 + r * 2.6, 0.8);
      if (a <= 0) return;
      P.alpha(a);
      var y = 108 + r * 62;
      note(44, y - 14, 'range of ' + n, { size: 10, color: FAINT });
      var bw = Math.min(20, 280 / n), gap = n > 9 ? 0 : 2;
      for (var i = 0; i < n; i++) {
        box(44 + i * (bw + gap), y, bw, 22, { fill: SURF2, stroke: BORDER, radius: 3 });
      }
      var mid = (n - 1) >> 1;
      box(44 + mid * (bw + gap), y, bw, 22, { fill: ACCDIM, stroke: ACC, radius: 3 });
    });

    P.alpha(rv(t, sc.start + 13, 1));
    note(44, 306, 'each probe halves the range and keeps one side', { size: 10 });
    note(44, 322, 'the discarded half is never solved', { size: 10 });

    P.alpha(rv(t, sc.start + 16, 1));
    box(44, 344, 300, 76, { fill: ACCDIM, stroke: ACC, radius: 6 });
    heading(58, 356, 'Worst case', { size: 10, color: ACC });
    mono(58, 378, 'floor(lg n) + 1 comparisons', { size: 11, bold: true });
    mono(58, 400, '4 for n = 8..15', { size: 10 });

    P.alpha(rv(t, sc.start + 19, 1));
    note(44, 440, 'GATE CSE 2021 Set 2 asks for the arithmetic', { size: 10, color: INFO });
    note(44, 456, 'operations: a constant per level, so Theta(log n).', { size: 10, color: INFO });

    P.alpha(rv(t, sc.start + 20, 1));
    heading(600, 26, 'Enumerated over every size and target', { size: 12 });
    mono(600, 50, 'n        worst   floor(lg n)+1', { size: 10, color: DIM });
    BSEARCH.forEach(function (b, i) {
      var a = rv(t, sc.start + 21 + i * 1.6, 0.6);
      if (a <= 0) return;
      P.alpha(a);
      mono(600, 70 + i * 22, b.n + '        ' + b.max + '       ' + b.formula, { size: 10 });
    });

    P.alpha(rv(t, sc.start + 30, 1));
    box(600, 210, 270, 106, { fill: SURF2, stroke: BORDER, radius: 6 });
    heading(614, 222, 'The distinction', { size: 11 });
    mono(614, 246, 'divide:   a \u2265 2 subproblems', { size: 10 });
    mono(614, 266, 'decrease: a = 1 subproblem', { size: 10 });
    note(614, 290, 'a = 1 makes the leaf count n^0 = 1,', { size: 10 });
    note(614, 306, 'so the cost is one path, not n leaves.', { size: 10 });

    P.alpha(rv(t, sc.start + 26, 1));
    note(600, 344, 'Quickselect is decrease and conquer:', { size: 10 });
    note(600, 360, 'partition, recurse into one side.', { size: 10 });
    mono(600, 384, 'expected Theta(n)', { size: 10, color: VAL });
    mono(600, 404, 'worst Theta(n^2)', { size: 10, color: BAD });
    note(600, 428, 'expected linear is not linear', { size: 10, color: WARN });
  }

  /* ---------- scene 8: Karatsuba ---------- */
  function drawKarat(t, sc) {
    heading(44, 26, 'Karatsuba: fewer subproblems, a smaller exponent', { size: 14 });

    P.alpha(rv(t, sc.start + 1, 0.8));
    mono(44, 52, '4T(n/2) + n   \u2192  n^2', { size: 12, color: BAD });
    mono(44, 74, '3T(n/2) + n   \u2192  n^1.585', { size: 12, color: VAL });

    P.alpha(rv(t, sc.start + 4, 1));
    note(44, 102, 'the middle term is computed as', { size: 10 });
    mono(44, 122, '(x1+x0)(y1+y0) - x1y1 - x0y0', { size: 10, color: INFO });
    note(44, 144, 'which reuses the two products already done', { size: 10 });

    P.alpha(rv(t, sc.start + 7, 1));
    heading(44, 172, 'Scalar products at depth k', { size: 12 });
    mono(44, 196, 'k    Karatsuba   schoolbook', { size: 10, color: DIM });
    KARAT.slice(0, 5).forEach(function (x, i) {
      var a = rv(t, sc.start + 8 + i * 1.4, 0.6);
      if (a <= 0) return;
      P.alpha(a);
      mono(44, 216 + i * 20, x.k + '      ' + x.km + '         ' + x.sm, { size: 10 });
    });

    P.alpha(rv(t, sc.start + 15, 1));
    mono(44, 330, '3^8 = 6561 = 256^1.585', { size: 11, color: ACC, bold: true });
    note(44, 352, 'the same number by two routes, checked', { size: 10 });
    note(44, 368, 'as an integer equality by the model', { size: 10 });

    P.alpha(rv(t, sc.start + 19, 1));
    note(44, 398, 'The saving is in multiplications only.', { size: 10, color: WARN });
    note(44, 414, 'Karatsuba does more additions, which is', { size: 10, color: WARN });
    note(44, 430, 'why it is not faster at every size.', { size: 10, color: WARN });

    P.alpha(rv(t, sc.start + 6, 1));
    heading(600, 26, 'One unit per multiplication and per addition', { size: 11 });
    mono(600, 50, 'n      Karatsuba   schoolbook', { size: 10, color: DIM });
    KARAT.slice(0, 5).forEach(function (x, i) {
      var a = rv(t, sc.start + 9 + i * 1.6, 0.6);
      if (a <= 0) return;
      P.alpha(a);
      var win = x.kTotal < x.sTotal;
      mono(600, 72 + i * 22, x.n + '       ' + x.kTotal + '          ' + x.sTotal, {
        size: 10, color: win ? VAL : BAD
      });
    });

    P.alpha(rv(t, sc.start + 22, 1));
    box(600, 202, 270, 84, { fill: SURF2, stroke: BORDER, radius: 6 });
    heading(614, 214, 'The crossover', { size: 11 });
    mono(614, 238, 'n = 2:  9 against 8', { size: 10, color: BAD });
    mono(614, 258, 'n = 4:  39 against 48', { size: 10, color: VAL });
    note(614, 278, 'schoolbook wins at two digits only', { size: 10 });

    P.alpha(rv(t, sc.start + 26, 1));
    note(600, 310, 'So the honest claim is the asymptotic one:', { size: 10 });
    note(600, 326, 'n^1.585 beats n^2 eventually, and where', { size: 10 });
    note(600, 342, 'eventually starts is a constant-factor', { size: 10 });
    note(600, 358, 'question that must be computed.', { size: 10 });
    mono(600, 390, 'log2 3 = 1.58496...', { size: 11, color: ACC });
    note(600, 414, 'not 1.5: rounding the exponent moves', { size: 10, color: WARN });
    note(600, 430, 'the predicted work by a factor.', { size: 10, color: WARN });
  }

  /* ---------- scene 9: past papers ---------- */
  function drawPyq(t, sc) {
    heading(44, 26, 'Four past items, reproduced by this page', { size: 14 });

    var cards = [
      ['GATE CSE 2019 Q25 — maximum subarray', 'answer 29, from indices 2 to 11', 'divide and conquer = brute force', ACC],
      ['GATE CSE 2015 Set 1 — quicksort worst case', 'T(n) = T(n-1) + O(n), option B', 'the model gives 28 at n = 8', INFO],
      ['GATE CSE 2014 Set 2 — T(2^k)=3T(2^(k-1))+1', '(3^(k+1) - 1)/2, which is Theta(3^k)', '1, 4, 13, 40, 121, 364, 1093', WARN],
      ['GATE CSE 2021 Set 2 — binary search arithmetic', 'Theta(log n): floor(lg n)+1 levels', '4 comparisons for n = 8..15', VAL]
    ];
    cards.forEach(function (c, i) {
      var a = rv(t, sc.start + 1 + i * 2.4, 0.8);
      if (a <= 0) return;
      P.alpha(a);
      var x = 44 + (i % 2) * 428, y = 52 + Math.floor(i / 2) * 108;
      box(x, y, 400, 92, { fill: SURF, stroke: c[3], radius: 6 });
      heading(x + 12, y + 12, c[0], { size: 10, color: c[3] });
      mono(x + 12, y + 38, c[1], { size: 10 });
      note(x + 12, y + 60, c[2], { size: 10 });
    });

    P.alpha(rv(t, sc.start + 12, 1));
    box(44, 282, 828, 66, { fill: SURF2, stroke: BORDER, radius: 6 });
    note(58, 294, 'The 2019 array, and the window that attains the maximum', { size: 10 });
    mono(58, 316, '-5 -10 [6  3 -1 -2 13  4 -9 -1  4 12] -3  0', { size: 10 });
    mono(58, 336, 'sum of the bracketed window = 29; all 105 ranges were checked', { size: 10, color: ACC });

    P.alpha(rv(t, sc.start + 18, 1));
    note(44, 368, 'Each answer above was recomputed before it was written down.', { size: 10 });
    note(44, 384, 'Where a paper reports an option letter, the letter is quoted with', { size: 10 });
    note(44, 400, 'the paper; where it is a numerical-answer item, the number is', { size: 10 });
    note(44, 416, 'the answer and there is no letter to quote.', { size: 10 });

    P.alpha(rv(t, sc.start + 24, 1));
    note(44, 430, 'S(i,j) is a contiguous sum: summing the positives gives 42,', { size: 10, color: WARN });
    note(44, 446, 'which is the subsequence reading, and it is wrong.', { size: 10, color: WARN });
  }

  /* ---------- scene 10: the procedure ---------- */
  function drawProc(t, sc) {
    heading(44, 26, 'The procedure', { size: 15 });

    var steps = [
      ['1', 'name a, b and f(n); write the recurrence'],
      ['2', 'count levels log_b n and leaves n^(log_b a)'],
      ['3', 'compare f(n) with n^(log_b a) to pick the case'],
      ['4', 'check whether the split can be unbalanced'],
      ['5', 'check the base case and the exact count']
    ];
    steps.forEach(function (s, i) {
      var a = rv(t, sc.start + 1 + i * 2.2, 0.7);
      if (a <= 0) return;
      P.alpha(a);
      var y = 56 + i * 40;
      P.circle(54, y + 8, 11, { fill: ACCDIM, stroke: ACC, sw: 1 });
      txt(54, y + 8, s[0], { size: 11, align: 'center', base: 'middle', bold: true, color: ACC });
      note(76, y + 2, s[1], { size: 10 });
    });

    P.alpha(rv(t, sc.start + 14, 1));
    box(44, 268, 300, 76, { fill: SURF2, stroke: BORDER, radius: 6 });
    note(58, 280, 'the exact values this page computed', { size: 10 });
    mono(58, 302, '17 comparisons at n = 8', { size: 10 });
    mono(58, 322, '2304 at n = 256, 6561 products at k = 8', { size: 10 });

    P.alpha(rv(t, sc.start + 18, 1));
    note(44, 366, 'A NAT question wants the exact count;', { size: 10 });
    note(44, 382, 'an MCQ wants the class. Read which one', { size: 10 });
    note(44, 398, 'is being asked before answering.', { size: 10 });

    P.alpha(rv(t, sc.start + 16, 1));
    box(378, 48, 492, 182, { fill: BADDIM, stroke: BAD, radius: 6 });
    heading(392, 62, 'Five traps', { size: 12, color: BAD });
    var traps = [
      'writing the merge-sort recurrence for quicksort',
      'counting nodes when the question asks for levels',
      'quoting n log n as a comparison count',
      'assuming a balanced split for an unbalanced one',
      'answering Theta when the question wants a number'
    ];
    traps.forEach(function (s, i) {
      var at = rv(t, sc.start + 18 + i * 1.8, 0.7);
      if (at <= 0) return;
      P.alpha(at);
      note(392, 90 + i * 24, '\u2014 ' + s, { size: 10, color: INK });
    });

    P.alpha(rv(t, sc.start + 26, 1));
    mono(378, 262, 'T(n) = a\u00b7T(n/b) + f(n)', { size: 12, color: ACC });
    note(378, 284, 'a = parts, b = shrink factor, f = everything else', { size: 10 });
    mono(378, 312, 'leaves n^(log_b a)   levels log_b n', { size: 10 });
    note(378, 336, 'Whichever of the leaves and the level work dominates', { size: 10 });
    note(378, 352, 'decides the case; case 2 adds one factor of log n.', { size: 10 });

    P.alpha(rv(t, sc.start + 28, 1));
    note(378, 384, 'A recurrence you did not derive is a recurrence', { size: 10, color: WARN });
    note(378, 400, 'you cannot check. Derive it, count the tree,', { size: 10, color: WARN });
    note(378, 416, 'then solve it.', { size: 10, color: WARN });
  }

  /* ---------- dispatch ---------- */

  var SCENE_DRAW = {
    ask: drawAsk,
    split: drawSplit,
    merge: drawMerge,
    recur: drawRecur,
    cases: drawCases,
    quick: drawQuick,
    decrease: drawDecrease,
    karat: drawKarat,
    pyq: drawPyq,
    proc: drawProc
  };

  function drawFrame(painter) {
    P = painter;
    if (!P) return;
    P.alpha(1);
    P.clear();
    var st = K.state, tl = window.LESSON_TIMELINE;
    if (!tl) return;
    var t = st.elapsed, scenes = tl.scenes, i = 0;
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
     LAYER 4 — BOOT
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

  window.__lessonChecks = CHECKS;
  window.__MODEL = {
    MERGE: MERGE, MERGEBOUND: MERGEBOUND, TSTAT: TSTAT, RECUR: RECUR,
    LEAFID: LEAFID, QUICK: QUICK, BSEARCH: BSEARCH, GEO: GEO,
    KARAT: KARAT, MS2019: MS2019, RANDOM: RANDOM
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
