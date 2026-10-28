/* ==========================================================================
   exact-counts-across-topics — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   What is computed rather than quoted:
     - merge sort's comparison count for EVERY ordering of n elements, n = 1..8,
       by running the sort (40,320 orderings at n = 8), giving min, max and
       average, with the maximum checked against n*ceil(lg n) - 2^ceil(lg n) + 1
       at every n;
     - the recursion tree of merge sort at n = 8, built and counted: 3 levels
       below the root, 8 leaves, 7 merges, 8 units of work per level, 24 total;
     - quicksort's comparison count for EVERY ordering of n elements, giving
       min, max and average, with the maximum checked against n(n-1)/2 and the
       average against 2(n+1)H_n - 4n, plus the two GATE CSE 2014 Set 1 inputs
       counted by the same partition function;
     - binary search's worst-case comparisons for every n up to 64 and every
       target, successful and unsuccessful, checked against floor(lg n) + 1;
     - the doubling loop of GATE CSE 2007 Q15 executed for every n up to 64,
       with the count checked against floor(lg n) + 1 and the competing
       ceil(lg n) + 1 shown to differ at n = 15;
     - a seven-slot chained hash table built from ten keys, with the successful
       and unsuccessful probe counts summed and averaged;
     - 1/(1-alpha) at alpha = 0.5 and 0.9 for open addressing;
     - a two-block direct-mapped cache simulated over the same sixteen accesses
       in row-major and in column-major order, with hits, misses, transfers and
       average memory access time;
     - matrix-chain subproblem and split counts for n = 2..10, and the LCS cell
       count, each against its closed form;
     - Karatsuba's 3^k against schoolbook 4^k, and the leaf identity
       3^k = n^(log_2 3) checked at n = 1024;
     - the four units compared at one size, n = 1024.
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

  function lg(x) { return Math.log(x) / Math.LN2; }
  function flg(x) { return Math.floor(lg(x) + 1e-12); }
  function clg(x) { return Math.ceil(lg(x) - 1e-12); }
  function r2(x) { return Math.round(x * 100) / 100; }
  function r4(x) { return Math.round(x * 10000) / 10000; }

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

  /* ---------- merge sort, counting comparisons and checking the output ---------- */
  function mergeRun(arr) {
    var a = arr.slice(), cmp = 0, merges = 0;
    function go(lo, hi) {
      if (hi - lo < 1) return;
      var mid = (lo + hi) >> 1;
      go(lo, mid); go(mid + 1, hi);
      merges++;
      var L = a.slice(lo, mid + 1), R = a.slice(mid + 1, hi + 1);
      var i = 0, j = 0, out = [];
      while (i < L.length && j < R.length) {
        cmp++;
        if (L[i] <= R[j]) out.push(L[i++]); else out.push(R[j++]);
      }
      while (i < L.length) out.push(L[i++]);
      while (j < R.length) out.push(R[j++]);
      for (var k = 0; k < out.length; k++) a[lo + k] = out[k];
    }
    go(0, a.length - 1);
    return { cmp: cmp, merges: merges, sorted: a };
  }

  /* ---------- quicksort with the first element as pivot ---------- */
  function quickRun(arr) {
    var a = arr.slice(), cmp = 0;
    function go(lo, hi) {
      if (lo >= hi) return;
      var p = a[lo], i = lo;
      for (var j = lo + 1; j <= hi; j++) {
        cmp++;
        if (a[j] < p) { i++; var t = a[i]; a[i] = a[j]; a[j] = t; }
      }
      var t2 = a[lo]; a[lo] = a[i]; a[i] = t2;
      go(lo, i - 1); go(i + 1, hi);
    }
    go(0, a.length - 1);
    return { cmp: cmp, sorted: a };
  }

  function isSorted(a) {
    for (var i = 1; i < a.length; i++) if (a[i - 1] > a[i]) return false;
    return true;
  }

  /* ---------- merge sort: every ordering ---------- */
  var MERGE = { rows: [], worstOk: true, ordered: true };
  (function () {
    for (var n = 1; n <= 8; n++) {
      var ps = perms(n), mn = Infinity, mx = -Infinity, sum = 0, allSorted = true;
      for (var i = 0; i < ps.length; i++) {
        var r = mergeRun(ps[i]);
        if (!isSorted(r.sorted)) allSorted = false;
        if (r.cmp < mn) mn = r.cmp;
        if (r.cmp > mx) mx = r.cmp;
        sum += r.cmp;
      }
      var c = clg(n);
      var formula = n * c - Math.pow(2, c) + 1;
      MERGE.rows.push({ n: n, min: mn, max: mx, avg: r2(sum / ps.length), formula: formula, orderings: ps.length });
      if (mx !== formula) MERGE.worstOk = false;
      if (!allSorted) MERGE.ordered = false;
    }
  })();

  /* ---------- the recursion tree of merge sort at n = 8 ---------- */
  var TREE = (function () {
    var levels = [], sizes = [8];
    var s = 8;
    while (s > 1) { s = s >> 1; sizes.push(s); }
    for (var k = 0; k < sizes.length; k++) {
      levels.push({ level: k, nodes: Math.pow(2, k), size: sizes[k],
        work: sizes[k] > 1 ? Math.pow(2, k) * sizes[k] : 0 });   /* the leaf level is the base case: no work */
    }
    var total = 0, leaves = 0, merges = 0;
    for (var i = 0; i < levels.length; i++) total += levels[i].work;
    leaves = Math.pow(2, sizes.length - 1);
    merges = leaves - 1;
    return { levels: levels, levelsBelowRoot: sizes.length - 1, total: total, leaves: leaves, merges: merges };
  })();

  /* ---------- quicksort: every ordering ---------- */
  var QUICK = { rows: [], worstOk: true, avgOk: true, ordered: true };
  (function () {
    for (var n = 1; n <= 8; n++) {
      var ps = perms(n), mn = Infinity, mx = -Infinity, sum = 0, allSorted = true;
      for (var i = 0; i < ps.length; i++) {
        var r = quickRun(ps[i]);
        if (!isSorted(r.sorted)) allSorted = false;
        if (r.cmp < mn) mn = r.cmp;
        if (r.cmp > mx) mx = r.cmp;
        sum += r.cmp;
      }
      var H = 0;
      for (var h = 1; h <= n; h++) H += 1 / h;
      var avgFormula = 2 * (n + 1) * H - 4 * n;
      var avg = sum / ps.length;
      QUICK.rows.push({ n: n, min: mn, max: mx, avg: r2(avg), avgFormula: r2(avgFormula) });
      if (mx !== n * (n - 1) / 2) QUICK.worstOk = false;
      if (Math.abs(avg - avgFormula) > 0.011) QUICK.avgOk = false;
      if (!allSorted) QUICK.ordered = false;
    }
  })();

  /* ---------- the two GATE CSE 2014 Set 1 inputs ---------- */
  var Q2014 = (function () {
    var a = [1, 2, 3, 4, 5], b = [4, 1, 5, 3, 2];
    return { t1: quickRun(a).cmp, t2: quickRun(b).cmp, a: a, b: b };
  })();

  /* ---------- binary search ---------- */
  var BS = { rows: [], worstOk: true, foundOk: true };
  (function () {
    for (var n = 1; n <= 64; n++) {
      var worst = 0, allFound = true;
      for (var t = 0; t < n; t++) {
        var lo = 0, hi = n - 1, c = 0, got = -1;
        while (lo <= hi) {
          c++;
          var mid = (lo + hi) >> 1;
          if (mid === t) { got = mid; break; }
          if (mid < t) lo = mid + 1; else hi = mid - 1;
        }
        if (got !== t) allFound = false;
        if (c > worst) worst = c;
      }
      var lo2 = 0, hi2 = n - 1, cu = 0;
      while (lo2 <= hi2) { cu++; var m2 = (lo2 + hi2) >> 1; lo2 = m2 + 1; }
      BS.rows.push({ n: n, worst: worst, unsuccessful: cu, formula: flg(n) + 1, lg: r2(lg(n)) });
      if (worst !== flg(n) + 1 || cu !== flg(n) + 1) BS.worstOk = false;
      if (!allFound) BS.foundOk = false;
    }
  })();

  /* ---------- GATE CSE 2007 Q15: the doubling loop ---------- */
  var LOOP2007 = { rows: [], floorOk: true, ceilDiffers: true };
  (function () {
    for (var n = 1; n <= 64; n++) {
      var j = 1, count = 0;
      while (j <= n) { count++; j = j * 2; }          /* one comparison per pass */
      LOOP2007.rows.push({ n: n, count: count, floorF: flg(n) + 1, ceilF: clg(n) + 1 });
      if (count !== flg(n) + 1) LOOP2007.floorOk = false;
    }
    var r15 = LOOP2007.rows[14];
    if (!(r15.count === 4 && r15.ceilF === 5)) LOOP2007.ceilDiffers = false;
  })();

  /* ---------- hashing: a seven-slot chained table ---------- */
  var HASH = (function () {
    var m = 7, keys = [22, 1, 13, 11, 24, 33, 18, 42, 7, 5];
    var slots = [], i, j;
    for (i = 0; i < m; i++) slots.push([]);
    for (i = 0; i < keys.length; i++) slots[keys[i] % m].push(keys[i]);
    var succ = [], unsucc = [], totalSucc = 0, totalUnsucc = 0, allFound = true;
    for (i = 0; i < keys.length; i++) {
      var p = slots[keys[i] % m].indexOf(keys[i]);
      if (p < 0) allFound = false;
      succ.push(p + 1); totalSucc += p + 1;
    }
    for (i = 0; i < m; i++) { unsucc.push(1 + slots[i].length); totalUnsucc += 1 + slots[i].length; }
    return {
      m: m, keys: keys, slots: slots,
      succ: succ, unsucc: unsucc,
      totalSucc: totalSucc, totalUnsucc: totalUnsucc,
      avgSucc: r4(totalSucc / keys.length), avgUnsucc: r4(totalUnsucc / m),
      alpha: r4(keys.length / m), allFound: allFound
    };
  })();

  /* ---------- open addressing: 1/(1-alpha) ---------- */
  var OPEN = (function () {
    var out = [];
    [0.5, 0.75, 0.9].forEach(function (a) { out.push({ alpha: a, probes: r4(1 / (1 - a)) }); });
    return out;
  })();

  /* ---------- the cache ---------- */
  function cacheSim(seq, blocks, bsize, ways) {
    var sets = Math.max(1, Math.floor(blocks / ways));
    var cache = [], i;
    for (i = 0; i < sets; i++) cache.push([]);
    var hits = 0, misses = 0, trace = [];
    for (i = 0; i < seq.length; i++) {
      var blk = Math.floor(seq[i] / bsize);
      var s = blk % sets, tag = Math.floor(blk / sets);
      var S = cache[s], at = S.indexOf(tag);
      if (at >= 0) {
        hits++; trace.push('H');
        if (ways > 1) { S.splice(at, 1); S.push(tag); }
      } else {
        misses++; trace.push('M');
        if (S.length >= ways) S.shift();
        S.push(tag);
      }
    }
    return { hits: hits, misses: misses, trace: trace.join('') };
  }

  var CACHE = (function () {
    var row = [], col = [], r, c;
    for (r = 0; r < 4; r++) for (c = 0; c < 4; c++) row.push(r * 4 + c);
    for (c = 0; c < 4; c++) for (r = 0; r < 4; r++) col.push(r * 4 + c);
    var hitTime = 1, penalty = 40;
    var dm = { row: cacheSim(row, 2, 4, 1), col: cacheSim(col, 2, 4, 1) };
    var wa = { row: cacheSim(row, 2, 4, 2), col: cacheSim(col, 2, 4, 2) };
    function amat(x) {
      var total = x.hits + x.misses;
      return r4(hitTime + (x.misses / total) * penalty);
    }
    return {
      row: row, col: col, dm: dm, wa: wa,
      amatRow: amat(dm.row), amatCol: amat(dm.col),
      hitTime: hitTime, penalty: penalty,
      seqLen: row.length
    };
  })();

  /* ---------- dynamic programming counts ---------- */
  var DP = (function () {
    var rows = [], n;
    for (n = 2; n <= 10; n++) {
      var sub = n * (n - 1) / 2;
      var splits = 0;
      for (var L = 2; L <= n; L++) splits += (n - L + 1) * (L - 1);
      rows.push({ n: n, sub: sub, subFormula: n * (n - 1) / 2, splits: splits, splitFormula: n * (n * n - 1) / 6 });
    }
    var m = 4, s = 5;
    return { rows: rows, lcsRows: m + 1, lcsCols: s + 1, lcsCells: (m + 1) * (s + 1), m: m, s: s };
  })();

  /* ---------- Karatsuba ---------- */
  var KAR = (function () {
    var rows = [], k;
    for (k = 0; k <= 6; k++) rows.push({ k: k, kara: Math.pow(3, k), school: Math.pow(4, k) });
    var k10 = 10, n = 1024;
    return {
      rows: rows,
      k10: k10, n: n,
      kara10: Math.pow(3, 10),
      school10: Math.pow(4, 10),
      exponent: r4(lg(3)),
      leafIdentity: Math.pow(3, k10),
      nPow: Math.pow(n, lg(3)),
      ratio: r2(Math.pow(4, 10) / Math.pow(3, 10))
    };
  })();

  /* ---------- one n, four units ---------- */
  var SYNTH = (function () {
    var n = 1024;
    var c = clg(n);
    var mergeWork = n * c;
    var mergeWorst = n * c - Math.pow(2, c) + 1;
    var quickWorst = n * (n - 1) / 2;
    var transfers = n / 4;
    return {
      n: n,
      binary: flg(n) + 1,
      mergeWork: mergeWork,
      mergeWorst: mergeWorst,
      quickWorst: quickWorst,
      transfers: transfers,
      kara: Math.pow(3, 10),
      school: Math.pow(4, 10)
    };
  })();

  /* ======================================================================
     LAYER 2 — THE CHECKS
     ====================================================================== */

  (function runChecks() {
    var i, row;

    /* merge sort */
    var mOk = true, mDetail = '';
    for (i = 0; i < MERGE.rows.length; i++) {
      row = MERGE.rows[i];
      if (row.max !== row.formula) { mOk = false; mDetail += 'n=' + row.n + ' ' + row.max + ' vs ' + row.formula + '; '; }
    }
    check('merge sort worst case equals n*ceil(lg n) - 2^ceil(lg n) + 1 for n = 1..8', mOk, mDetail);
    var mOrd = true;
    for (i = 0; i < MERGE.rows.length; i++) if (!(MERGE.rows[i].min <= MERGE.rows[i].avg && MERGE.rows[i].avg <= MERGE.rows[i].max)) mOrd = false;
    check('merge sort min <= average <= max at every size', mOrd);
    check('merge sort sorted all 40,320 orderings of eight elements', MERGE.ordered);
    check('merge sort at n = 8: 3 levels below the root, 8 leaves, 7 merges, 24 units of work',
      TREE.levelsBelowRoot === 3 && TREE.leaves === 8 && TREE.merges === 7 && TREE.total === 24,
      TREE.levelsBelowRoot + '/' + TREE.leaves + '/' + TREE.merges + '/' + TREE.total);

    /* quicksort */
    check('quicksort worst case equals n(n-1)/2 for n = 1..8', QUICK.worstOk);
    check('quicksort average matches 2(n+1)H_n - 4n to two decimals', QUICK.avgOk);
    check('quicksort sorted every ordering at every size', QUICK.ordered);
    check('GATE CSE 2014 Set 1: {1..5} takes 10 comparisons, {4,1,5,3,2} takes 6, so t1 > t2',
      Q2014.t1 === 10 && Q2014.t2 === 6 && Q2014.t1 > Q2014.t2, Q2014.t1 + ' vs ' + Q2014.t2);

    /* binary search */
    check('binary search worst case equals floor(lg n) + 1 for every n up to 64', BS.worstOk);
    check('binary search unsuccessful search costs the same as the worst case', BS.worstOk);
    check('binary search found every present key at every size up to 64', BS.foundOk);
    check('binary search at n = 1024 costs 11 comparisons', flg(1024) + 1 === 11, String(flg(1024) + 1));

    /* 2007 loop */
    check('GATE CSE 2007 Q15: the doubling loop makes floor(lg n) + 1 comparisons for every n up to 64', LOOP2007.floorOk);
    check('GATE CSE 2007 Q15: ceil(lg n) + 1 differs at n = 15 (5 against 4)', LOOP2007.ceilDiffers,
      LOOP2007.rows[14].count + ' vs ' + LOOP2007.rows[14].ceilF);

    /* hashing */
    check('chained table: successful search costs 14 probes over 10 keys, an average of 1.4',
      HASH.totalSucc === 14 && HASH.avgSucc === 1.4, HASH.totalSucc + '/' + HASH.avgSucc);
    check('chained table: unsuccessful search costs 17 probes over 7 slots, an average of 2.43',
      HASH.totalUnsucc === 17 && HASH.avgUnsucc === 2.4286, HASH.totalUnsucc + '/' + HASH.avgUnsucc);
    check('chained table: every one of the ten keys is found in its chain', HASH.allFound);
    check('open addressing: 1/(1-alpha) is 2 at alpha = 0.5 and 10 at alpha = 0.9',
      OPEN[0].probes === 2 && OPEN[2].probes === 10, OPEN[0].probes + '/' + OPEN[2].probes);

    /* cache */
    check('cache: row-major order gives 4 misses and 12 hits over 16 accesses',
      CACHE.dm.row.misses === 4 && CACHE.dm.row.hits === 12, CACHE.dm.row.trace);
    check('cache: column-major order gives 16 misses and no hits',
      CACHE.dm.col.misses === 16 && CACHE.dm.col.hits === 0, CACHE.dm.col.trace);
    check('cache: hits plus misses equals the access count in both orders',
      CACHE.dm.row.hits + CACHE.dm.row.misses === 16 && CACHE.dm.col.hits + CACHE.dm.col.misses === 16);
    check('cache: average access time is 11 cycles row-major and 41 column-major',
      CACHE.amatRow === 11 && CACHE.amatCol === 41, CACHE.amatRow + '/' + CACHE.amatCol);
    check('cache: two-way associativity changes nothing at two blocks (one set)',
      CACHE.wa.row.misses === 4 && CACHE.wa.col.misses === 16);

    /* dynamic programming */
    var subOk = true, splitOk = true;
    for (i = 0; i < DP.rows.length; i++) {
      row = DP.rows[i];
      if (row.sub !== row.subFormula) subOk = false;
      if (row.splits !== row.splitFormula) splitOk = false;
    }
    check('matrix chain: n(n-1)/2 subproblems for n = 2..10 (10 at n = 5)', subOk);
    check('matrix chain: n(n^2-1)/6 split points for n = 2..10 (20 at n = 5)', splitOk);
    check('LCS: (m+1)(n+1) = 30 cells for strings of length 4 and 5', DP.lcsCells === 30);

    /* Karatsuba */
    var kOk = true;
    for (i = 1; i < KAR.rows.length; i++) if (!(KAR.rows[i].kara < KAR.rows[i].school)) kOk = false;
    check('Karatsuba: 3^k is below 4^k at every depth from 1 to 6', kOk);
    check('Karatsuba: 3^10 = 59049 against 4^10 = 1048576', KAR.kara10 === 59049 && KAR.school10 === 1048576);
    check('Karatsuba: the leaf identity 3^k = n^(log_2 3) holds at n = 1024',
      Math.abs(KAR.leafIdentity - KAR.nPow) < 0.5, r4(KAR.leafIdentity) + ' vs ' + r4(KAR.nPow));

    /* synthesis */
    check('at n = 1024: binary search 11, merge work 10240, merge worst 9217, quicksort worst 523776, transfers 256',
      SYNTH.binary === 11 && SYNTH.mergeWork === 10240 && SYNTH.mergeWorst === 9217 &&
      SYNTH.quickWorst === 523776 && SYNTH.transfers === 256,
      [SYNTH.binary, SYNTH.mergeWork, SYNTH.mergeWorst, SYNTH.quickWorst, SYNTH.transfers].join(','));
  })();

  /* ======================================================================
     LAYER 3 — RENDER
     ====================================================================== */

  var TL = window.LESSON_TIMELINE;

  function sceneOf(id) {
    var sc = TL.scenes;
    for (var i = 0; i < sc.length; i++) if (sc[i].id === id) return sc[i];
    return sc[0];
  }

  function header(elapsed, sc, kicker) {
    P.alpha(1);
    P.text(28, 16, kicker, { size: 10.5, mono: true, color: FAINT });
    P.text(28, 32, sc.title, { size: 16, bold: true, color: INK });
    P.line(28, 58, 872, 58, { stroke: BORDER, sw: 1 });
  }

  function panel(x, y, w, h, o) {
    o = o || {};
    P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, radius: 8, sw: 1 });
  }

  function tag(x, y, s, colour) {
    P.text(x, y, s, { size: 10, mono: true, color: colour || FAINT });
  }

  /* ---------- 1. four units ---------- */
  function drawUnits(elapsed) {
    var sc = sceneOf('units');
    var a = [K.beat(elapsed, sc.start, 0.9), K.beat(elapsed, sc.start + 7.5, 0.9),
             K.beat(elapsed, sc.start + 15, 0.9), K.beat(elapsed, sc.start + 22.5, 0.9)];
    header(elapsed, sc, 'SCENE 1 · FOUR UNITS, ONE PROCEDURE');

    var units = [
      ['Comparison', 'one test of two keys', 'merge sort, quicksort,\nbinary search'],
      ['Probe', 'one slot examined', 'a hash table, chained\nor open-addressed'],
      ['Block transfer', 'one block moved', 'cache and main\nmemory'],
      ['Multiplication', 'one scalar product', 'Karatsuba against\nschoolbook']
    ];
    if (a[0] > 0.05) {
      P.alpha(a[0]);
      for (var i = 0; i < 4; i++) {
        var x = 28 + i * 214, y = 72;
        panel(x, y, 198, 96, { fill: SURF2 });
        P.text(x + 12, y + 12, units[i][0], { size: 13, bold: true, color: ACC });
        P.text(x + 12, y + 36, units[i][1], { size: 11, color: DIM });
        P.text(x + 12, y + 56, units[i][2].split('\n')[0], { size: 10.5, color: FAINT });
        P.text(x + 12, y + 72, units[i][2].split('\n')[1], { size: 10.5, color: FAINT });
      }
    }

    if (a[1] > 0.05) {
      P.alpha(a[1]);
      P.text(28, 186, 'Each structure counts its own unit. Swapping them is the commonest error on this topic.', { size: 11.5, color: DIM });
    }

    if (a[2] > 0.05) {
      P.alpha(a[2]);
      panel(28, 208, 410, 92);
      P.text(48, 224, '24', { size: 32, bold: true, mono: true, color: ACC });
      P.text(100, 232, 'units of work', { size: 13, bold: true, color: INK });
      P.text(48, 268, '8 elements placed at each of 3 levels', { size: 11, color: DIM });

      panel(462, 208, 410, 92);
      P.text(482, 224, '17', { size: 32, bold: true, mono: true, color: INFO });
      P.text(534, 232, 'comparisons, worst case', { size: 13, bold: true, color: INK });
      P.text(482, 268, 'one merge often stops comparing before its end', { size: 11, color: DIM });
      P.text(28, 308, 'Both numbers are merge sort on eight elements. Both are correct.', { size: 11.5, color: DIM });
    }

    if (a[3] > 0.05) {
      P.alpha(a[3]);
      var steps = [
        ['1', 'Name the unit', 'What is one\noperation here?'],
        ['2', 'Count one level', 'Units per level,\npartition or call'],
        ['3', 'Use the identity', 'Multiply by levels\nor by pairs'],
        ['4', 'Check a second way', 'Closed form, or\nenumeration']
      ];
      for (var s = 0; s < 4; s++) {
        var sx = 28 + s * 214, sy = 330;
        panel(sx, sy, 198, 112, { fill: SURF, stroke: ACCDIM });
        P.text(sx + 12, sy + 10, steps[s][0], { size: 18, bold: true, mono: true, color: ACC });
        P.text(sx + 30, sy + 16, steps[s][1], { size: 11.5, bold: true, color: INK });
        P.text(sx + 12, sy + 46, steps[s][2].split('\n')[0], { size: 10.5, color: DIM });
        P.text(sx + 12, sy + 62, steps[s][2].split('\n')[1], { size: 10.5, color: DIM });
      }
    }
    P.alpha(1);
  }

  /* ---------- 2. merge sort ---------- */
  function drawMerge(elapsed) {
    var sc = sceneOf('merge');
    var a = [K.beat(elapsed, sc.start, 0.9), K.beat(elapsed, sc.start + 7.5, 0.9),
             K.beat(elapsed, sc.start + 15, 0.9), K.beat(elapsed, sc.start + 22.5, 0.9)];
    header(elapsed, sc, 'SCENE 2 · MERGE SORT, COUNTED TWO WAYS');

    /* the tree */
    var lvl = [
      [{ x: 382, y: 96, r: 17, s: '8' }],
      [{ x: 278, y: 152, r: 15, s: '4' }, { x: 486, y: 152, r: 15, s: '4' }],
      [{ x: 226, y: 208, r: 13, s: '2' }, { x: 330, y: 208, r: 13, s: '2' },
       { x: 434, y: 208, r: 13, s: '2' }, { x: 538, y: 208, r: 13, s: '2' }],
      []
    ];
    for (var i = 0; i < 8; i++) lvl[3].push({ x: 200 + i * 52, y: 264, r: 11, s: '1' });

    P.alpha(a[0]);
    for (var k = 1; k < 4; k++) {
      for (var n2 = 0; n2 < lvl[k].length; n2++) {
        var par = lvl[k - 1][Math.floor(n2 / 2)];
        var nd = lvl[k][n2];
        P.line(par.x, par.y + par.r, nd.x, nd.y - nd.r, { stroke: BORDER, sw: 1.2 });
      }
    }
    for (var k2 = 0; k2 < 4; k2++) {
      for (var n3 = 0; n3 < lvl[k2].length; n3++) {
        var d = lvl[k2][n3];
        P.circle(d.x, d.y, d.r, { fill: k2 === 0 ? ACCDIM : SURF, stroke: k2 === 0 ? ACC : BORDER, sw: 1.4 });
        P.text(d.x, d.y + 1, d.s, { size: k2 === 0 ? 13 : 11, mono: true, bold: true, align: 'center', base: 'middle', color: INK });
      }
    }
    tag(28, 92, 'level 0');
    tag(28, 148, 'level 1');
    tag(28, 204, 'level 2');
    tag(28, 260, 'level 3');

    if (a[1] > 0.05) {
      P.alpha(a[1]);
      P.text(600, 72, 'Counts, read off the tree', { size: 12, bold: true, color: INK });
      var rows = [
        ['levels below the root', String(TREE.levelsBelowRoot)],
        ['leaves', String(TREE.leaves)],
        ['merges', String(TREE.merges)],
        ['work at one level', '8'],
        ['total work', '8 × 3 = 24']
      ];
      for (var rI = 0; rI < rows.length; rI++) {
        P.text(600, 96 + rI * 22, rows[rI][0], { size: 11, color: DIM });
        P.text(868, 96 + rI * 22, rows[rI][1], { size: 11.5, mono: true, align: 'right', color: rI === 4 ? ACC : INK, bold: rI === 4 });
      }
      P.text(28, 292, 'Every level carries the same eight elements, so every level costs eight units.', { size: 11, color: DIM });
    }

    if (a[2] > 0.05) {
      P.alpha(a[2]);
      panel(28, 316, 410, 132, { fill: SURF, stroke: BORDER });
      P.text(44, 328, 'Comparisons over all 40,320 orderings', { size: 11.5, bold: true, color: INK });
      var cols = [['12', 'best'], ['15.73', 'average'], ['17', 'worst']];
      for (var c = 0; c < 3; c++) {
        var cx = 60 + c * 128;
        P.text(cx, 356, cols[c][0], { size: 24, bold: true, mono: true, color: c === 2 ? INFO : INK });
        P.text(cx, 392, cols[c][1], { size: 10.5, color: DIM });
      }
      P.text(44, 418, 'A merge costs at most m + n − 1 comparisons, not m + n.', { size: 10.5, color: DIM });
    }

    if (a[3] > 0.05) {
      P.alpha(a[3]);
      panel(462, 316, 410, 132, { fill: SURF, stroke: ACCDIM });
      P.text(478, 328, 'The closed form, checked at every size', { size: 11.5, bold: true, color: INK });
      P.text(478, 352, 'n·⌈lg n⌉ − 2^⌈lg n⌉ + 1', { size: 15, mono: true, color: ACC, bold: true });
      P.text(478, 376, '8·3 − 8 + 1 = 17', { size: 12, mono: true, color: INK });
      P.text(478, 400, 'n = 1..8 gives 0 1 3 5 8 11 14 17', { size: 10.5, mono: true, color: DIM });
      P.text(478, 418, 'both ways, so the formula and the enumeration agree.', { size: 10.5, color: DIM });
    }
    P.alpha(1);
  }

  /* ---------- 3. quicksort ---------- */
  function drawQuick(elapsed) {
    var sc = sceneOf('quick');
    var a = [K.beat(elapsed, sc.start, 0.9), K.beat(elapsed, sc.start + 7.5, 0.9),
             K.beat(elapsed, sc.start + 15, 0.9), K.beat(elapsed, sc.start + 22.5, 0.9)];
    header(elapsed, sc, 'SCENE 3 · QUICKSORT, n − 1 PER PARTITION');

    P.alpha(a[0]);
    var arr = [4, 1, 5, 3, 2, 6, 7, 8];
    for (var i = 0; i < 8; i++) {
      var x = 28 + i * 48;
      P.rect(x, 84, 42, 34, { fill: i === 0 ? ACCDIM : SURF, stroke: i === 0 ? ACC : BORDER, radius: 5, sw: 1.3 });
      P.text(x + 21, 101, String(arr[i]), { size: 13, mono: true, align: 'center', base: 'middle', color: INK });
    }
    P.text(28, 68, 'one partition: the pivot is compared with each of the other seven', { size: 11, color: DIM });
    P.text(28, 128, '7 comparisons for 8 elements: exactly n − 1', { size: 11.5, bold: true, color: ACC });

    if (a[1] > 0.05) {
      P.alpha(a[1]);
      P.text(470, 68, 'Unbalanced splits, counted', { size: 11.5, bold: true, color: INK });
      for (var r = 0; r < 7; r++) {
        var y = 84 + r * 26;
        var wpx = (7 - r) * 22;
        P.rect(470, y, wpx, 16, { fill: ACCDIM, stroke: ACC, radius: 3, sw: 1 });
        P.text(470 + wpx + 8, y + 2, String(7 - r), { size: 10.5, mono: true, color: INK });
      }
      P.text(470, 274, '7+6+5+4+3+2+1 = 28', { size: 12, mono: true, bold: true, color: ACC });
      P.text(470, 292, '= n(n − 1)/2, one comparison per pair', { size: 10.5, color: DIM });
    }

    if (a[2] > 0.05) {
      P.alpha(a[2]);
      var three = [['28', 'worst', BAD], ['16.92', 'average', INK], ['13', 'best', VAL]];
      for (var t = 0; t < 3; t++) {
        P.text(700, 80 + t * 66, three[t][0], { size: 22, bold: true, mono: true, color: three[t][2] });
        P.text(700, 108 + t * 66, three[t][1], { size: 10.5, color: DIM });
      }
      P.text(700, 268, '2(n+1)H(n) − 4n', { size: 10.5, mono: true, color: DIM });
      P.text(700, 284, 'gives 16.92 at n = 8', { size: 10.5, color: DIM });
    }

    if (a[3] > 0.05) {
      P.alpha(a[3]);
      panel(28, 314, 410, 134, { fill: SURF, stroke: BORDER });
      P.text(44, 326, 'GATE CSE 2014 Set 1, both inputs counted', { size: 11.5, bold: true, color: INK });
      P.text(44, 350, '{1, 2, 3, 4, 5}', { size: 11, mono: true, color: DIM });
      P.text(44, 368, 't1 = 4 + 3 + 2 + 1 = 10', { size: 11.5, mono: true, color: INK });
      P.text(44, 400, '{4, 1, 5, 3, 2}', { size: 11, mono: true, color: DIM });
      P.text(44, 418, 't2 = 4 + 2 = 6', { size: 11.5, mono: true, color: INK });

      panel(462, 314, 410, 134, { fill: SURF, stroke: ACCDIM });
      P.text(478, 326, 'So t1 > t2, which is option C', { size: 11.5, bold: true, color: ACC });
      P.text(478, 350, 'Both inputs take 4 comparisons in the', { size: 10.5, color: DIM });
      P.text(478, 366, 'first partition. The difference is in the', { size: 10.5, color: DIM });
      P.text(478, 382, 'recursion, and only the recursion is', { size: 10.5, color: DIM });
      P.text(478, 398, 'counted by the total.', { size: 10.5, color: DIM });
      P.text(478, 420, 'This page runs both inputs through one partition function.', { size: 10, color: FAINT });
    }
    P.alpha(1);
  }

  /* ---------- 4. binary search ---------- */
  function drawBsearch(elapsed) {
    var sc = sceneOf('bsearch');
    var a = [K.beat(elapsed, sc.start, 0.9), K.beat(elapsed, sc.start + 7.5, 0.9),
             K.beat(elapsed, sc.start + 15, 0.9), K.beat(elapsed, sc.start + 22.5, 0.9)];
    header(elapsed, sc, 'SCENE 4 · BINARY SEARCH, ONE COMPARISON PER LEVEL');

    P.alpha(a[0]);
    P.text(28, 68, 'halving 1024: eleven comparisons', { size: 11, color: DIM });
    var sizes = [1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1];
    for (var i = 0; i < sizes.length; i++) {
      var y = 82 + i * 24;
      var wpx = Math.max(6, 210 * sizes[i] / 1024);
      P.rect(28, y, wpx, 15, { fill: i === 10 ? ACCDIM : SURF2, stroke: i === 10 ? ACC : BORDER, radius: 3, sw: 1 });
      P.text(28 + wpx + 8, y + 1, String(sizes[i]), { size: 10.5, mono: true, color: INK });
    }
    P.text(28, 352, 'Each row is one comparison: 1024 → 512 → … → 1', { size: 10.5, color: DIM });

    if (a[1] > 0.05) {
      P.alpha(a[1]);
      P.text(430, 68, 'floor(lg n) + 1 for every n up to 64', { size: 11.5, bold: true, color: INK });
      var x0 = 420, y0 = 320, wpx2 = 440, hpx = 236;
      P.line(x0, y0, x0 + wpx2, y0, { stroke: BORDER, sw: 1 });
      P.line(x0, y0, x0, y0 - hpx, { stroke: BORDER, sw: 1 });
      for (var n = 1; n <= 64; n++) {
        var px = x0 + (n / 64) * wpx2;
        var steps = flg(n) + 1;
        var py = y0 - (steps / 7) * hpx;
        var pn = x0 + ((n + 1) / 64) * wpx2;
        var pyn = y0 - ((flg(n + 1) + 1) / 7) * hpx;
        P.line(px, py, pn, py, { stroke: ACC, sw: 1.6 });
        if (n < 64) P.line(pn, py, pn, pyn, { stroke: ACC, sw: 1.2, dash: [3, 3] });
      }
      P.text(x0 + wpx2, y0 + 6, 'n = 64', { size: 9.5, mono: true, align: 'right', color: FAINT });
      P.text(x0 - 6, y0 - hpx, '7', { size: 9.5, mono: true, align: 'right', color: FAINT });
      P.text(x0 - 6, y0 - 4, '1', { size: 9.5, mono: true, align: 'right', color: FAINT });
      P.text(400, 352, 'The staircase is exact, not an average: no size in the range breaks it.', { size: 10.5, color: DIM });
    }

    if (a[2] > 0.05) {
      P.alpha(a[2]);
      panel(400, 84, 470, 66, { fill: SURF, stroke: ACCDIM });
      P.text(416, 96, 'At n = 1024', { size: 10.5, mono: true, color: FAINT });
      P.text(416, 112, 'floor(lg 1024) + 1 = 10 + 1 = 11 comparisons', { size: 12.5, mono: true, bold: true, color: ACC });
    }

    if (a[3] > 0.05) {
      P.alpha(a[3]);
      panel(28, 372, 842, 76, { fill: SURF, stroke: WARNDIM });
      P.text(44, 382, 'GATE CSE 2007 Q15: j = 1; while (j <= n) j = j * 2;', { size: 11.5, mono: true, bold: true, color: INK });
      P.text(44, 402, 'n = 14 → 4 comparisons   n = 15 → 4   n = 16 → 5', { size: 11, mono: true, color: DIM });
      P.text(44, 422, 'floor(lg n) + 1 matches every n; ceil(lg n) + 1 gives 5 at n = 15 and is wrong there.', { size: 10.5, color: WARN });
    }
    P.alpha(1);
  }

  /* ---------- 5. hashing ---------- */
  function drawHash(elapsed) {
    var sc = sceneOf('hash');
    var a = [K.beat(elapsed, sc.start, 0.9), K.beat(elapsed, sc.start + 7.5, 0.9),
             K.beat(elapsed, sc.start + 15, 0.9), K.beat(elapsed, sc.start + 22.5, 0.9)];
    header(elapsed, sc, 'SCENE 5 · PROBES AND THE LOAD FACTOR');

    P.alpha(a[0]);
    for (var s = 0; s < HASH.m; s++) {
      var y = 76 + s * 34;
      P.rect(44, y, 44, 26, { fill: SURF2, stroke: BORDER, radius: 4, sw: 1 });
      P.text(66, y + 7, String(s), { size: 10.5, mono: true, align: 'center', color: DIM });
      var chain = HASH.slots[s];
      for (var c = 0; c < chain.length; c++) {
        var cx = 96 + c * 56;
        P.rect(cx, y, 50, 26, { fill: SURF, stroke: ACC, radius: 4, sw: 1.2 });
        P.text(cx + 25, y + 7, String(chain[c]), { size: 10.5, mono: true, align: 'center', color: INK });
      }
      if (chain.length === 0) P.text(102, y + 7, 'empty', { size: 9.5, mono: true, color: FAINT });
    }
    P.text(44, 66, 'ten keys, seven slots, alpha = 10/7 = 1.43', { size: 10.5, color: DIM });

    if (a[1] > 0.05) {
      P.alpha(a[1]);
      panel(400, 72, 470, 92, { fill: SURF, stroke: BORDER });
      P.text(414, 82, 'Successful search', { size: 11, bold: true, color: INK });
      P.text(414, 100, '1+2+1+1+1+1+2+1+2+2 = 14 probes', { size: 10.5, mono: true, color: DIM });
      P.text(414, 118, '14 / 10 = 1.4 probes per key', { size: 12, mono: true, bold: true, color: ACC });
      P.text(414, 140, 'a key at position p of its chain costs p probes', { size: 9.5, color: FAINT });

      panel(400, 174, 470, 92, { fill: SURF, stroke: BORDER });
      P.text(414, 184, 'Unsuccessful search', { size: 11, bold: true, color: INK });
      P.text(414, 202, '3+3+1+2+3+3+2 = 17 probes', { size: 10.5, mono: true, color: DIM });
      P.text(414, 220, '17 / 7 = 2.43 probes per home slot', { size: 12, mono: true, bold: true, color: INFO });
      P.text(414, 242, 'one more than the chain length: the null is read too', { size: 9.5, color: FAINT });
    }

    if (a[2] > 0.05) {
      P.alpha(a[2]);
      P.text(400, 282, 'Uniform hashing predicts 1 + alpha/2 = 1.71 and alpha = 1.43.', { size: 10.5, color: DIM });
      P.text(400, 298, 'This table beats the first and misses the second. Both are consistent:', { size: 10.5, color: DIM });
      P.text(400, 314, 'the estimates average over hash functions, not over one table.', { size: 10.5, bold: true, color: INK });
    }

    if (a[3] > 0.05) {
      P.alpha(a[3]);
      P.text(400, 340, 'Open addressing: 1/(1 − alpha) probes', { size: 11, bold: true, color: INK });
      var bx = 400, by = 400, bw = 400, bh = 46;
      P.line(bx, by, bx + bw, by, { stroke: BORDER, sw: 1 });
      for (var q = 0; q <= 20; q++) {
        var al = 0.1 + q * 0.04;
        if (al > 0.95) break;
        var pv = Math.min(1 / (1 - al), 12);
        var px = bx + ((al - 0.1) / 0.85) * bw;
        var py = by - (pv / 12) * bh;
        P.circle(px, py, 1.6, { fill: ACC });
      }
      P.text(bx, by + 6, 'alpha 0.1', { size: 9, mono: true, color: FAINT });
      P.text(bx + bw, by + 6, '0.95', { size: 9, mono: true, align: 'right', color: FAINT });
      P.text(bx + bw, by - bh - 12, '12 probes', { size: 9, mono: true, align: 'right', color: FAINT });
      P.text(400, 420, 'alpha = 0.5 → 2 probes;  alpha = 0.9 → 10 probes', { size: 10.5, mono: true, color: INK });
      P.text(400, 436, 'GATE DS&AI 2024 Q11 asks for the insertion cost: same formula.', { size: 10, color: FAINT });
    }
    P.alpha(1);
  }

  /* ---------- 6. cache ---------- */
  function drawCache(elapsed) {
    var sc = sceneOf('cache');
    var a = [K.beat(elapsed, sc.start, 0.9), K.beat(elapsed, sc.start + 7.5, 0.9),
             K.beat(elapsed, sc.start + 15, 0.9), K.beat(elapsed, sc.start + 22.5, 0.9)];
    header(elapsed, sc, 'SCENE 6 · BLOCK TRANSFERS FOR ONE SEQUENCE');

    P.alpha(a[0]);
    for (var r = 0; r < 4; r++) {
      for (var c = 0; c < 4; c++) {
        var x = 40 + c * 58, y = 86 + r * 58;
        P.rect(x, y, 52, 52, { fill: SURF, stroke: BORDER, radius: 4, sw: 1 });
        P.text(x + 26, y + 14, String(r * 4 + c), { size: 12, mono: true, align: 'center', color: INK });
        P.text(x + 26, y + 32, 'row ' + r, { size: 8.5, align: 'center', color: FAINT });
      }
    }
    P.text(40, 68, '4 × 4 words, block = 1 row, 2-block cache', { size: 10.5, color: DIM });
    P.text(40, 348, 'One block transfer per miss; a hit costs none.', { size: 10.5, color: DIM });

    if (a[1] > 0.05) {
      P.alpha(a[1]);
      P.text(310, 68, 'Row-major', { size: 11.5, bold: true, color: ACC });
      var tr = CACHE.dm.row.trace;
      for (var i = 0; i < tr.length; i++) {
        var bx = 310 + (i % 8) * 30, by = 90 + Math.floor(i / 8) * 30;
        P.rect(bx, by, 26, 24, { fill: tr[i] === 'M' ? BADDIM : ACCDIM, stroke: tr[i] === 'M' ? BAD : ACC, radius: 3, sw: 1 });
        P.text(bx + 13, by + 5, tr[i], { size: 10, mono: true, align: 'center', color: tr[i] === 'M' ? BAD : ACC });
      }
      P.text(310, 158, 'M = miss, H = hit. 4 misses, 12 hits.', { size: 10.5, color: INK });
      P.text(310, 174, 'Each block is used four times before eviction.', { size: 10, color: DIM });
    }

    if (a[2] > 0.05) {
      P.alpha(a[2]);
      P.text(310, 200, 'Column-major', { size: 11.5, bold: true, color: BAD });
      var tc = CACHE.dm.col.trace;
      for (var j = 0; j < tc.length; j++) {
        var cx2 = 310 + (j % 8) * 30, cy2 = 222 + Math.floor(j / 8) * 30;
        P.rect(cx2, cy2, 26, 24, { fill: tc[j] === 'M' ? BADDIM : ACCDIM, stroke: tc[j] === 'M' ? BAD : ACC, radius: 3, sw: 1 });
        P.text(cx2 + 13, cy2 + 5, tc[j], { size: 10, mono: true, align: 'center', color: tc[j] === 'M' ? BAD : ACC });
      }
      P.text(310, 290, '16 misses, no hits: consecutive accesses want', { size: 10.5, color: INK });
      P.text(310, 306, 'different rows, and the cache holds two.', { size: 10, color: DIM });
    }

    if (a[3] > 0.05) {
      P.alpha(a[3]);
      panel(600, 84, 272, 120, { fill: SURF, stroke: ACCDIM });
      P.text(614, 94, 'Average memory access time', { size: 10.5, bold: true, color: INK });
      P.text(614, 112, 'hit + miss rate × penalty', { size: 9.5, mono: true, color: DIM });
      P.text(614, 134, 'row: 1 + 0.25 × 40 = 11', { size: 11, mono: true, color: ACC });
      P.text(614, 154, 'col: 1 + 1.00 × 40 = 41', { size: 11, mono: true, color: BAD });
      P.text(614, 176, 'one cycle hit, 40 cycle penalty', { size: 9.5, color: FAINT });
      P.text(614, 194, 'The same array, the same cache.', { size: 9.5, color: FAINT });
    }
    P.alpha(1);
  }

  /* ---------- 7. dynamic programming ---------- */
  function drawDP(elapsed) {
    var sc = sceneOf('dp');
    var a = [K.beat(elapsed, sc.start, 0.9), K.beat(elapsed, sc.start + 7.5, 0.9),
             K.beat(elapsed, sc.start + 15, 0.9), K.beat(elapsed, sc.start + 22.5, 0.9)];
    header(elapsed, sc, 'SCENE 7 · COUNT THE CELLS BEFORE YOU FILL THEM');

    P.alpha(a[0]);
    P.text(28, 68, 'matrix chain, n = 5: cells with i < j', { size: 10.5, color: DIM });
    var cell = 34, gx = 44, gy = 84;
    for (var r = 0; r < 5; r++) {
      for (var c = 0; c < 5; c++) {
        var x = gx + c * cell, y = gy + r * cell;
        var isSub = c > r;
        P.rect(x, y, cell - 4, cell - 4, {
          fill: isSub ? ACCDIM : SURF2,
          stroke: isSub ? ACC : BORDER, radius: 3, sw: 1
        });
      }
    }
    P.text(gx, gy + 5 * cell + 8, '10 shaded cells = 5 · 4 / 2', { size: 10.5, mono: true, color: ACC });

    if (a[1] > 0.05) {
      P.alpha(a[1]);
      P.text(270, 68, 'Split points, by chain length', { size: 11, bold: true, color: INK });
      var L = [['L = 2', '4 chains × 1', '4'], ['L = 3', '3 chains × 2', '6'],
               ['L = 4', '2 chains × 3', '6'], ['L = 5', '1 chain × 4', '4']];
      for (var i = 0; i < L.length; i++) {
        P.text(250, 92 + i * 24, L[i][0], { size: 10.5, mono: true, color: DIM });
        P.text(320, 92 + i * 24, L[i][1], { size: 10.5, mono: true, color: INK });
        P.text(430, 92 + i * 24, L[i][2], { size: 10.5, mono: true, align: 'right', color: INK });
      }
      P.text(250, 196, 'total 4 + 6 + 6 + 4 = 20 = n(n²−1)/6', { size: 11, mono: true, bold: true, color: ACC });
      P.text(250, 216, 'quadratic cells, cubic transitions', { size: 10, color: DIM });
    }

    if (a[2] > 0.05) {
      P.alpha(a[2]);
      P.text(520, 68, 'LCS, lengths 4 and 5', { size: 11, bold: true, color: INK });
      var cc = 26, lx = 520, ly = 84;
      for (var rr = 0; rr < 5; rr++) {
        for (var cq = 0; cq < 6; cq++) {
          P.rect(lx + cq * cc, ly + rr * cc, cc - 3, cc - 3, { fill: SURF, stroke: BORDER, radius: 2, sw: 1 });
        }
      }
      P.text(lx, ly + 5 * cc + 6, '5 rows × 6 columns = 30 cells', { size: 10.5, mono: true, color: INK });
      P.text(lx, ly + 5 * cc + 22, 'the empty prefix is a row and a column', { size: 9.5, color: DIM });
    }

    if (a[3] > 0.05) {
      P.alpha(a[3]);
      panel(28, 300, 842, 148, { fill: SURF, stroke: BORDER });
      P.text(44, 312, 'The rule', { size: 11.5, bold: true, color: INK });
      P.text(44, 334, 'Cells are counted from the shape of the table: a triangle gives n(n−1)/2,', { size: 10.5, color: DIM });
      P.text(44, 352, 'a rectangle gives (rows)(columns). Transitions are counted from what each', { size: 10.5, color: DIM });
      P.text(44, 370, 'cell reads: three neighbours for LCS, L−1 split points for matrix chain.', { size: 10.5, color: DIM });
      P.text(44, 396, 'Neither number is a complexity class, and the paper usually asks for one of them.', { size: 10.5, bold: true, color: ACC });
      P.text(44, 420, 'n = 5: 10 cells, 20 transitions. n = 10: 45 cells, 165 transitions.', { size: 10.5, mono: true, color: INK });
    }
    P.alpha(1);
  }

  /* ---------- 8. Karatsuba ---------- */
  function drawKaratsuba(elapsed) {
    var sc = sceneOf('karatsuba');
    var a = [K.beat(elapsed, sc.start, 0.9), K.beat(elapsed, sc.start + 7.5, 0.9),
             K.beat(elapsed, sc.start + 15, 0.9), K.beat(elapsed, sc.start + 22.5, 0.9)];
    header(elapsed, sc, 'SCENE 8 · COUNT MULTIPLICATIONS, NOT STEPS');

    P.alpha(a[0]);
    P.text(28, 68, 'scalar products at depth k', { size: 10.5, color: DIM });
    var base = 380, x0 = 60, stepX = 68;
    P.line(x0, base, x0 + 7 * stepX, base, { stroke: BORDER, sw: 1 });
    for (var k = 0; k <= 6; k++) {
      var x = x0 + k * stepX + 8;
      var hS = (Math.pow(4, k) / 4096) * 250;
      var hK = (Math.pow(3, k) / 4096) * 250;
      P.rect(x, base - hS, 18, Math.max(1, hS), { fill: BADDIM, stroke: BAD, radius: 2, sw: 1 });
      if (a[1] > 0.05) {
        P.alpha(Math.min(a[0], a[1]));
        P.rect(x + 22, base - hK, 18, Math.max(1, hK), { fill: ACCDIM, stroke: ACC, radius: 2, sw: 1 });
        P.alpha(a[0]);
      }
      P.text(x + 20, base + 8, 'k=' + k, { size: 9.5, mono: true, align: 'center', color: FAINT });
    }
    P.text(60, 404, 'schoolbook 4^k (left bar) against Karatsuba 3^k (right bar)', { size: 10, color: DIM });

    if (a[2] > 0.05) {
      P.alpha(a[2]);
      panel(580, 84, 292, 118, { fill: SURF, stroke: ACCDIM });
      P.text(594, 94, 'The exponent is a leaf count', { size: 10.5, bold: true, color: INK });
      P.text(594, 116, 'log₂ 3 = 1.585', { size: 14, mono: true, bold: true, color: ACC });
      P.text(594, 140, '3^k = n^1.585 at n = 1024', { size: 10, mono: true, color: DIM });
      P.text(594, 156, '59049 both ways', { size: 10, mono: true, color: INK });
      P.text(594, 178, '1.585 is an exponent, not a rate', { size: 9.5, color: FAINT });
    }

    if (a[3] > 0.05) {
      P.alpha(a[3]);
      panel(580, 214, 292, 110, { fill: SURF, stroke: BORDER });
      P.text(594, 224, 'At n = 1024, k = 10', { size: 10.5, bold: true, color: INK });
      P.text(594, 246, 'Karatsuba  59 049', { size: 11, mono: true, color: ACC });
      P.text(594, 266, 'schoolbook 1 048 576', { size: 11, mono: true, color: BAD });
      P.text(594, 288, 'ratio 17.8, and it grows with n', { size: 10, color: DIM });
      P.text(594, 308, 'one changed call, an exponent apart', { size: 9.5, color: FAINT });
    }
    P.alpha(1);
  }

  /* ---------- 9. one n ---------- */
  function drawOneN(elapsed) {
    var sc = sceneOf('one-n');
    var a = [K.beat(elapsed, sc.start, 0.9), K.beat(elapsed, sc.start + 7.5, 0.9),
             K.beat(elapsed, sc.start + 15, 0.9), K.beat(elapsed, sc.start + 22.5, 0.9)];
    header(elapsed, sc, 'SCENE 9 · ONE n, FOUR UNITS');

    var tiles = [
      ['Binary search', '11', 'comparisons', 'one key in a sorted array', ACC],
      ['Merge sort', '10 240', 'units of work', 'and at most 9 217 comparisons', INFO],
      ['Quicksort and cache', '523 776', 'comparisons, worst case', 'and 256 block transfers', WARN],
      ['Karatsuba', '59 049', 'multiplications', 'against 1 048 576 schoolbook', BAD]
    ];
    var on = [a[0] > 0.05, a[1] > 0.05, a[2] > 0.05, a[3] > 0.05];
    for (var i = 0; i < 4; i++) {
      if (!on[i]) continue;
      var x = 28 + (i % 2) * 434, y = 74 + Math.floor(i / 2) * 158;
      P.alpha(1);
      panel(x, y, 410, 142, { fill: SURF, stroke: tiles[i][4] });
      P.text(x + 14, y + 12, tiles[i][0], { size: 10.5, mono: true, color: FAINT });
      P.text(x + 14, y + 34, tiles[i][1], { size: 26, bold: true, mono: true, color: tiles[i][4] });
      P.text(x + 14, y + 72, tiles[i][2], { size: 11.5, bold: true, color: INK });
      P.text(x + 14, y + 94, tiles[i][3], { size: 10, color: DIM });
      P.text(x + 14, y + 116, 'n = 1024', { size: 9.5, mono: true, color: FAINT });
    }
    P.alpha(1);
    P.text(28, 448, 'Each number is right for its own unit and wrong for the other three.', { size: 10.5, color: DIM });
  }

  /* ---------- 10. procedure ---------- */
  function drawProcedure(elapsed) {
    var sc = sceneOf('procedure');
    var a = [K.beat(elapsed, sc.start, 0.9), K.beat(elapsed, sc.start + 7.5, 0.9),
             K.beat(elapsed, sc.start + 15, 0.9), K.beat(elapsed, sc.start + 22.5, 0.9)];
    header(elapsed, sc, 'SCENE 10 · THE PROCEDURE AND THE FIVE TRAPS');

    if (a[0] > 0.05) {
      P.alpha(a[0]);
      var s2 = [['1', 'Name the unit'], ['2', 'Count one level']];
      for (var i = 0; i < 2; i++) {
        var x = 28 + i * 424;
        panel(x, 72, 410, 70, { fill: SURF2 });
        P.text(x + 14, 84, s2[i][0], { size: 20, bold: true, mono: true, color: ACC });
        P.text(x + 42, 90, s2[i][1], { size: 12, bold: true, color: INK });
        P.text(x + 14, 116, i === 0 ? 'comparison, probe, transfer, multiplication' : 'one comparison per element taken, per halving',
          { size: 10, color: DIM });
      }
    }

    if (a[1] > 0.05) {
      P.alpha(a[1]);
      var s3 = [['3', 'Use the identity'], ['4', 'Check a second way']];
      for (var j = 0; j < 2; j++) {
        var x2 = 28 + j * 424;
        panel(x2, 150, 410, 70, { fill: SURF2 });
        P.text(x2 + 14, 162, s3[j][0], { size: 20, bold: true, mono: true, color: ACC });
        P.text(x2 + 42, 168, s3[j][1], { size: 12, bold: true, color: INK });
        P.text(x2 + 14, 194, j === 0 ? 'n−1 per partition, floor(lg n)+1 levels, n(n−1)/2 pairs'
          : 'a closed form, or an enumeration over every input', { size: 10, color: DIM });
      }
    }

    if (a[2] > 0.05) {
      P.alpha(a[2]);
      P.text(28, 236, 'The five traps, each with the number that exposes it', { size: 11.5, bold: true, color: WARN });
      var traps = [
        ['Work taken for comparisons', '24 against 17 at n = 8'],
        ['The root counted as a level', '4 levels against 3'],
        ['lg n without its plus one', '10 against 11 at n = 1024'],
        ['A rate used as a count', '160 against 11 for the cache'],
        ['A table average used as its answer', '1.43 against 2.43 for this table']
      ];
      for (var t = 0; t < traps.length; t++) {
        var ty = 258 + t * 26;
        P.circle(36, ty + 6, 3, { fill: WARN });
        P.text(48, ty, traps[t][0], { size: 10.5, color: INK });
        P.text(400, ty, traps[t][1], { size: 10.5, mono: true, color: DIM });
      }
    }

    if (a[3] > 0.05) {
      P.alpha(a[3]);
      panel(28, 398, 842, 50, { fill: SURF, stroke: ACCDIM });
      P.text(44, 408, 'The class tells you what grows; the count is what goes on the answer sheet.', { size: 11, bold: true, color: ACC });
      P.text(44, 428, 'Answering a count with a class, or a class with a number, is the same error in two directions.', { size: 10, color: DIM });
    }
    P.alpha(1);
  }

  var DRAW = {
    units: drawUnits, merge: drawMerge, quick: drawQuick, bsearch: drawBsearch,
    hash: drawHash, cache: drawCache, dp: drawDP, karatsuba: drawKaratsuba,
    'one-n': drawOneN, procedure: drawProcedure
  };

  function drawFrame(elapsed) {
    if (!P) return;
    P.clear();
    P.alpha(1);
    var i = K.sceneAt(elapsed);
    var sc = TL.scenes[i] || TL.scenes[0];
    var fn = DRAW[sc.id] || drawUnits;
    fn(elapsed);
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

    if (window.p5 && PR) {
      try {
        new window.p5(function (sk) {
          sk.setup = function () {
            sk.createCanvas(W, H);
            sk.noLoop();
            P = PR.makePainterP5(sk, W, H);
            sk.draw = function () { drawFrame(K.state.elapsed); };
            drawFrame(0);
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
        if (holder && holder.appendChild) holder.appendChild(cv);
        var ctx2d = cv.getContext && cv.getContext('2d');
        if (ctx2d) {
          P = PR.makePainter2D(ctx2d, W, H);
          drawFrame(0);
          drew = true;
        }
      } catch (e) {
        console.error('canvas fallback failed', e);
      }
      if (!drew && fallback && fallback.classList) fallback.classList.add('show');
    }

    if (K && K.init) {
      K.init({
        timeline: TL,
        draw: function (t) { drawFrame(t); }
      });
    }

    window.__drawAt = function (t) {
      if (K && K.state) K.state.elapsed = t;
      if (P) drawFrame(t);
    };

    var bad = CHECKS.filter(function (c) { return !c.pass; });
    if (bad.length) console.warn('Model validation did not fully pass:', bad);
  }

  window.__lessonChecks = CHECKS;
  window.__MODEL = {
    MERGE: MERGE, TREE: TREE, QUICK: QUICK, Q2014: Q2014, BS: BS,
    LOOP2007: LOOP2007, HASH: HASH, OPEN: OPEN, CACHE: CACHE,
    DP: DP, KAR: KAR, SYNTH: SYNTH
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
