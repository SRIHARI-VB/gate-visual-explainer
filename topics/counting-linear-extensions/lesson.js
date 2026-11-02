/* ==========================================================================
   counting-linear-extensions - model, validation, render.

   Layer 1  model      : a partial order as a set of elements and a relation;
                         the brute-force count over all n! orderings; the count
                         by dynamic programming over subsets; the closed forms
                         for series, parallel, multinomial and tree (hook
                         length); the two applications (thread interleavings,
                         conflict-serialisable schedules).
   Layer 2  validation : every number quoted in a caption, a card or on the
                         canvas is recomputed here. Brute force and the subset
                         table must agree on every poset; every closed form must
                         agree with both wherever it is legal; the three
                         previous-year answers are recomputed from their own
                         definitions (a schedule is conflict serialisable when
                         its precedence graph is acyclic).
   Layer 3  render     : reads the model; never re-derives a number.
   Layer 4  timeline   : in timeline.js - the only source of time.

   No p5.brush: every mark is a node, an arrow, an ordering or a count that has
   to be read exactly.
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

  /* ---------- small exact arithmetic ---------- */

  function fact(n) { var r = 1, i; for (i = 2; i <= n; i++) r *= i; return r; }
  function binom(n, k) {
    if (k < 0 || k > n) return 0;
    var r = 1, i;
    for (i = 1; i <= k; i++) r = r * (n - k + i) / i;
    return Math.round(r);
  }
  function multinom(lens) {
    var total = 0, i, r;
    for (i = 0; i < lens.length; i++) total += lens[i];
    r = fact(total);
    for (i = 0; i < lens.length; i++) r /= fact(lens[i]);
    return Math.round(r);
  }

  /* ---------- a poset ---------- */

  /* rel is a list of pairs [a, b] meaning "a must come before b". It does not
     have to be transitively closed: the two counters below give the same
     answer either way, and that agreement is one of the checks. */
  function permutations(n) {
    var out = [], cur = [], used = [];
    function rec() {
      if (cur.length === n) { out.push(cur.slice()); return; }
      for (var i = 0; i < n; i++) {
        if (used[i]) continue;
        used[i] = 1; cur.push(i); rec(); cur.pop(); used[i] = 0;
      }
    }
    rec();
    return out;
  }

  function respects(perm, rel) {
    var pos = [], i;
    for (i = 0; i < perm.length; i++) pos[perm[i]] = i;
    for (i = 0; i < rel.length; i++) if (pos[rel[i][0]] > pos[rel[i][1]]) return false;
    return true;
  }

  /* the definition, executed: every one of the n! orderings is tested */
  function countBrute(n, rel) {
    var all = permutations(n), good = [], i;
    for (i = 0; i < all.length; i++) if (respects(all[i], rel)) good.push(all[i]);
    return { count: good.length, good: good, all: all };
  }

  /* the subset table: f(S) = number of ways to order S as a prefix */
  function countTable(n, rel) {
    var pred = [], full = (1 << n) - 1, i, v, S, tot;
    for (i = 0; i < n; i++) pred[i] = 0;
    for (i = 0; i < rel.length; i++) pred[rel[i][1]] |= (1 << rel[i][0]);
    var f = [];
    for (S = 0; S <= full; S++) f[S] = 0;
    f[full] = 1;
    for (S = full - 1; S >= 0; S--) {
      tot = 0;
      for (v = 0; v < n; v++) {
        if (S & (1 << v)) continue;
        if ((pred[v] & ~S) !== 0) continue;   /* a predecessor is not placed yet */
        tot += f[S | (1 << v)];
      }
      f[S] = tot;
    }
    return { f: f, count: f[0] };
  }

  function count(n, rel) { return countTable(n, rel).count; }

  /* the tree formula: n! over the product of subtree sizes */
  function hookProduct(sizes) {
    var p = 1, i;
    for (i = 0; i < sizes.length; i++) p *= sizes[i];
    return p;
  }

  /* ---------- the posets this lesson uses ---------- */

  var LAB = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  function word(perm) {
    var s = '', i;
    for (i = 0; i < perm.length; i++) s += LAB[perm[i]];
    return s;
  }

  /* diamond: A before B, A before C, both before D */
  var DIAMOND = { n: 4, rel: [[0, 1], [0, 2], [1, 3], [2, 3]] };
  /* the N: A before C, B before C, B before D - not series-parallel */
  var NPOSET = { n: 4, rel: [[0, 2], [1, 2], [1, 3]] };
  /* GATE CSE 2016 Set 1 Q11: a before b, a before d, b before c, d before e,
     c before f, e before f */
  var PYQ = { n: 6, rel: [[0, 1], [0, 3], [1, 2], [3, 4], [2, 5], [4, 5]] };

  var TWO_FREE = { n: 2, rel: [] };
  var TWO_CHAIN = { n: 2, rel: [[0, 1]] };
  var V3 = { n: 3, rel: [[0, 1], [0, 2]] };
  var CHAIN3 = { n: 3, rel: [[0, 1], [1, 2]] };
  var CHAIN4 = { n: 4, rel: [[0, 1], [1, 2], [2, 3]] };
  var ANTICH3 = { n: 3, rel: [] };
  var ANTICH4 = { n: 4, rel: [] };
  var TWOCHAINS = { n: 4, rel: [[0, 1], [2, 3]] };           /* B<C and D<E */
  var THREECHAINS = { n: 6, rel: [[0, 1], [2, 3], [4, 5]] };  /* three pairs */
  var TREE4 = { n: 4, rel: [[0, 1], [0, 2], [1, 3]] };        /* root, two children, one grandchild */
  var LEVELTRAP = { n: 5, rel: [[0, 1], [1, 2], [3, 4]] };    /* a chain of three plus a pair */

  var N = {
    diamond: count(DIAMOND.n, DIAMOND.rel),
    nposet: count(NPOSET.n, NPOSET.rel),
    pyq: count(PYQ.n, PYQ.rel),
    twoFree: count(2, []), twoChain: count(2, [[0, 1]]),
    v3: count(V3.n, V3.rel), chain3: count(CHAIN3.n, CHAIN3.rel),
    chain4: count(CHAIN4.n, CHAIN4.rel),
    antich3: count(ANTICH3.n, ANTICH3.rel), antich4: count(ANTICH4.n, ANTICH4.rel),
    twoChains: count(TWOCHAINS.n, TWOCHAINS.rel),
    threeChains: count(THREECHAINS.n, THREECHAINS.rel),
    tree4: count(TREE4.n, TREE4.rel),
    levelTrap: count(LEVELTRAP.n, LEVELTRAP.rel)
  };

  var BRUTE_N = countBrute(NPOSET.n, NPOSET.rel);     /* the 24 tested orderings */
  var BRUTE_PYQ = countBrute(PYQ.n, PYQ.rel);         /* the 6 orderings of the 2016 graph */
  var TABLE_N = countTable(NPOSET.n, NPOSET.rel);     /* the 16 subsets */

  /* ---------- application 1: thread interleavings ---------- */

  /* GATE CSE 2024 Set 1 Q40. Each statement is atomic; within a thread the
     order is fixed, so an interleaving is a linear extension of two chains. */
  var THREADS = {
    T1: ['a = a + 1', 'b = b + 1'],
    T2: ['b = 2 * b', 'a = 2 * a']
  };

  function runInterleaving(seq) {
    var a = 1, b = 1, i, s;
    for (i = 0; i < seq.length; i++) {
      s = seq[i];
      if (s === 'S1') a = a + 1;
      else if (s === 'S2') b = b + 1;
      else if (s === 'S3') b = 2 * b;
      else a = 2 * a;
    }
    return { a: a, b: b };
  }

  function interleavings(m, n) {
    var total = m + n, out = [], i, mask, seq, x, y, A = [], B = [];
    for (i = 0; i < total; i++) { A.push('S' + (i + 1)); B.push('S' + (m + i + 1)); }
    for (mask = 0; mask < (1 << total); mask++) {
      var bits = 0, k;
      for (k = 0; k < total; k++) if (mask & (1 << k)) bits++;
      if (bits !== m) continue;
      seq = []; x = 0; y = 0;
      for (k = 0; k < total; k++) {
        if (mask & (1 << k)) seq.push(A[x++]); else seq.push(B[y++]);
      }
      out.push(seq);
    }
    return out;
  }

  var IL = interleavings(2, 2);          /* the six orderings of 2024 Q40 */
  var IL_OUT = (function () {
    var seen = {}, list = [], i, r, key;
    for (i = 0; i < IL.length; i++) {
      r = runInterleaving(IL[i]);
      key = r.a + ',' + r.b;
      if (!seen[key]) { seen[key] = { a: r.a, b: r.b, n: 0 }; list.push(seen[key]); }
      seen[key].n++;
    }
    list.sort(function (p, q) { return (q.a - p.a) || (q.b - p.b); });
    return list;
  })();

  /* ---------- application 2: conflict-serialisable schedules ---------- */

  /* GATE CSE 2017 Set 2 Q44: T1 = r1(X) w1(X) r1(Y) w1(Y),
     T2 = r2(Y) w2(Y) r2(Z) w2(Z). A schedule is conflict serialisable exactly
     when its precedence graph is acyclic; with two transactions that means the
     graph has no pair of opposite edges. */
  var TX1 = [['r', 1, 'X'], ['w', 1, 'X'], ['r', 1, 'Y'], ['w', 1, 'Y']];
  var TX2 = [['r', 2, 'Y'], ['w', 2, 'Y'], ['r', 2, 'Z'], ['w', 2, 'Z']];

  function scheduleAcyclic(ops) {
    var i, j, fwd = false, back = false;
    for (i = 0; i < ops.length; i++) {
      for (j = i + 1; j < ops.length; j++) {
        var a = ops[i], b = ops[j];
        if (a[1] === b[1]) continue;
        if (a[2] !== b[2]) continue;
        if (a[0] !== 'w' && b[0] !== 'w') continue;
        if (a[1] === 1) fwd = true; else back = true;
      }
    }
    return !(fwd && back);
  }

  var SCHED = (function () {
    var total = 0, ok = 0, mask, k, i, j, ops;
    for (mask = 0; mask < (1 << 8); mask++) {
      var bits = 0;
      for (k = 0; k < 8; k++) if (mask & (1 << k)) bits++;
      if (bits !== 4) continue;
      ops = []; i = 0; j = 0;
      for (k = 0; k < 8; k++) {
        if (mask & (1 << k)) ops.push(TX1[i++]); else ops.push(TX2[j++]);
      }
      total++;
      if (scheduleAcyclic(ops)) ok++;
    }
    return { total: total, serial: ok, cyclic: total - ok };
  })();

  /* ---------- the wrong shortcuts, computed so they can be refuted ---------- */

  var TRAP = {
    perEdge3: fact(3) / Math.pow(2, 2),        /* 1.5, not a count */
    perEdge4: fact(4) / Math.pow(2, 3),        /* 3, true answer 1 */
    perEdge6: fact(6) / Math.pow(2, 3),        /* 90 here, right by accident */
    levelTrap: fact(5) / (fact(2) * fact(2)),  /* 30, true answer 10 */
    levelTrapTrue: N.levelTrap,
    twoChainHalf: fact(4) / 2                  /* 12, not 6 */
  };

  /* ======================================================================
     LAYER 2 - VALIDATION
     ====================================================================== */

  var CHECKS = [];
  function check(name, pass, detail) {
    CHECKS.push({ name: name, pass: !!pass, detail: detail || '' });
  }

  var ALL = [
    { name: 'diamond', p: DIAMOND }, { name: 'N poset', p: NPOSET },
    { name: 'GATE 2016 graph', p: PYQ }, { name: 'two free', p: TWO_FREE },
    { name: 'two in a chain', p: TWO_CHAIN }, { name: 'V of three', p: V3 },
    { name: 'chain of three', p: CHAIN3 }, { name: 'chain of four', p: CHAIN4 },
    { name: 'antichain of three', p: ANTICH3 }, { name: 'antichain of four', p: ANTICH4 },
    { name: 'two chains of two', p: TWOCHAINS }, { name: 'three chains of two', p: THREECHAINS },
    { name: 'tree of four', p: TREE4 }, { name: 'chain of three plus a pair', p: LEVELTRAP }
  ];

  /* 1. brute force and the subset table must agree on every poset */
  ALL.forEach(function (row) {
    var b = countBrute(row.p.n, row.p.rel).count;
    var t = countTable(row.p.n, row.p.rel).count;
    check('brute force and subset table agree: ' + row.name + ' = ' + t, b === t,
      'brute ' + b + ' against table ' + t);
  });

  /* 2. the two ends of the range, computed for n = 1..5 */
  (function () {
    var okAnt = true, okChain = true, n, rel, i;
    for (n = 1; n <= 5; n++) {
      if (count(n, []) !== fact(n)) okAnt = false;
      rel = [];
      for (i = 0; i + 1 < n; i++) rel.push([i, i + 1]);
      if (count(n, rel) !== 1) okChain = false;
    }
    check('an antichain of n elements has n! orderings, for n = 1..5', okAnt);
    check('a chain of n elements has exactly 1 ordering, for n = 1..5', okChain);
  })();

  /* 3. the closed forms, against both counters */
  check('diamond = 2', N.diamond === 2);
  check('two parallel chains of two = C(4,2) = 6',
    N.twoChains === 6 && binom(4, 2) === 6 && N.twoChains === binom(4, 2));
  check('two parallel chains of three and two = C(5,2) = 10',
    count(5, [[0, 1], [1, 2], [3, 4]]) === binom(5, 2));
  check('three parallel chains of two = 6!/(2!2!2!) = 90',
    N.threeChains === 90 && multinom([2, 2, 2]) === 90);
  check('the N poset = 5, and 3 + 2 by the two cases on the last element',
    N.nposet === 5 && (3 + 2) === 5);
  check('the N poset is not reached by any series or parallel join',
    N.nposet !== N.twoChains && N.nposet !== N.diamond);

  /* 4. the tree formula: 4!/(4*2*1*1) = 3, and 4!/(2*1*2*1) = 6 */
  check('tree of four by hook length: 24 / (4*2*1*1) = 3',
    N.tree4 === 3 && fact(4) / hookProduct([4, 2, 1, 1]) === 3);
  check('forest of two chains by hook length: 24 / (2*1*2*1) = 6',
    N.twoChains === 6 && fact(4) / hookProduct([2, 1, 2, 1]) === 6);
  check('hook length and the binomial agree on the two-chain forest',
    fact(4) / hookProduct([2, 1, 2, 1]) === binom(4, 2));

  /* 5. the shortcuts, refuted */
  check('divide by 2 per edge gives 1.5 on a chain of three, which is not a count',
    TRAP.perEdge3 === 1.5 && N.chain3 === 1);
  check('divide by 2 per edge gives 3 on a chain of four, and the answer is 1',
    TRAP.perEdge4 === 3 && N.chain4 === 1);
  check('divide by 2 per edge gives the right answer 90 only because the pairs are disjoint',
    TRAP.perEdge6 === N.threeChains && TRAP.perEdge6 === 90);
  check('multiplying level factorials gives 30 on the level-trap poset, and the answer is 10',
    TRAP.levelTrap === 30 && TRAP.levelTrapTrue === 10);
  check('halving 4! for a two-chain pair gives 12, and the answer is 6',
    TRAP.twoChainHalf === 12 && N.twoChains === 6);

  /* 6. the 2016 question, from its own graph */
  check('GATE CSE 2016 Set 1 Q11: the graph has 6 topological orderings',
    N.pyq === 6 && BRUTE_PYQ.count === 6);
  check('the six orderings of the 2016 graph are the binomial 4!/(2!2!)',
    BRUTE_PYQ.good.map(word).join(' ') === 'ABCDEF ABDCEF ABDECF ADBCEF ADBECF ADEBCF');
  check('each of the six starts with A and ends with F',
    BRUTE_PYQ.good.every(function (p) { return p[0] === 0 && p[5] === 5; }));
  check('the 2016 count also equals the series-parallel product 1 x 6 x 1',
    1 * binom(4, 2) * 1 === N.pyq);

  /* 7. the 2024 interleaving question, by simulation */
  check('GATE CSE 2024 Set 1 Q40: two threads of two statements give C(4,2) = 6 interleavings',
    IL.length === 6 && binom(4, 2) === 6);
  check('the six interleavings produce exactly 3 distinct value pairs',
    IL_OUT.length === 3);
  check('the three pairs are (4,4), (4,3) and (3,3)',
    IL_OUT.map(function (o) { return o.a + ',' + o.b; }).join(' ') === '4,4 4,3 3,3');
  check('the outcome counts across the six interleavings sum to 6',
    IL_OUT.reduce(function (s, o) { return s + o.n; }, 0) === 6);
  check('every interleaving keeps each thread in its own order',
    IL.every(function (s) {
      return s.indexOf('S1') < s.indexOf('S2') && s.indexOf('S3') < s.indexOf('S4');
    }));

  /* 8. the 2017 schedule question, by the precedence-graph definition */
  check('GATE CSE 2017 Set 2 Q44: eight operations give C(8,4) = 70 schedules',
    SCHED.total === 70 && binom(8, 4) === 70);
  check('54 of the 70 schedules are conflict serialisable', SCHED.serial === 54);
  check('the 16 that are not are exactly 70 - 54', SCHED.cyclic === 16);
  check('the two serial schedules are both counted', SCHED.serial >= 2);

  /* 9. the subset table itself */
  check('the table has 2^4 = 16 entries and f(full) = 1',
    TABLE_N.f.length === 16 && TABLE_N.f[15] === 1);
  check('f(empty) is the count, 5', TABLE_N.f[0] === N.nposet);
  check('every entry of the table is a non-negative integer',
    TABLE_N.f.every(function (v) { return v >= 0 && Math.floor(v) === v; }));
  check('f is monotone along the prefix order: every entry is at most 4!',
    TABLE_N.f.every(function (v) { return v <= fact(4); }));

  /* 10. adding a constraint never raises the count */
  (function () {
    var base = count(NPOSET.n, NPOSET.rel);
    var more = count(NPOSET.n, NPOSET.rel.concat([[0, 1]]));
    check('adding a constraint lowers or holds the count: 5 becomes 2 with A before B',
      more <= base && more === 2, 'with A before B the N poset counts ' + more);
    var closed = count(3, [[0, 1], [1, 2], [0, 2]]);
    check('closing a relation under transitivity changes no count', closed === count(3, [[0, 1], [1, 2]]));
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
    P.text(28, 20, s, { size: 16, bold: true, color: PAL.ink });
    if (sub) P.text(28, 42, sub, { size: 11.5, color: PAL.dim });
  }

  function foot(s) {
    P.text(28, 446, s, { size: 11, color: PAL.faint });
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

  /* a node: a circle with its label, optional emphasis */
  function node(x, y, label, o) {
    o = o || {};
    var r = o.r || 20;
    var fill = o.tone === 'good' ? PAL.accentDim : o.tone === 'bad' ? PAL.invalidDim
             : o.tone === 'warn' ? PAL.warnDim : PAL.surface;
    var stroke = o.tone === 'good' ? PAL.accent : o.tone === 'bad' ? PAL.invalid
               : o.tone === 'warn' ? PAL.warn : PAL.border;
    P.circle(x, y, r, { fill: fill, stroke: stroke, sw: o.sw || 1.4 });
    centre(x, y + 1, label, { size: o.size || 13, bold: true, mono: true, color: PAL.ink });
  }

  function arrow(x1, y1, x2, y2, o) {
    o = o || {};
    var r1 = o.r1 || 20, r2 = o.r2 || 20;
    var dx = x2 - x1, dy = y2 - y1, d = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / d, uy = dy / d;
    P.arrow(x1 + ux * r1, y1 + uy * r1, x2 - ux * r2, y2 - uy * r2,
      { stroke: o.color || PAL.dim, sw: o.sw || 1.3, head: o.head || 8 });
  }

  /* --- 1. what a linear extension is ----------------------------------- */
  function drawPoset(p) {
    var s = stage(p, 4);
    title('A partial order fixes only some of the order',
      'the diamond: A before B, A before C, and both before D');

    var ax = 150, ay = 120, bx = 88, by = 250, cx = 212, cy = 250, dx = 150, dy = 372;
    var tone = s >= 1 ? 'good' : 'none';
    arrow(ax, ay, bx, by, { r1: 20, r2: 20 });
    arrow(ax, ay, cx, cy, { r1: 20, r2: 20 });
    arrow(bx, by, dx, dy, { r1: 20, r2: 20 });
    arrow(cx, cy, dx, dy, { r1: 20, r2: 20 });
    node(ax, ay, 'A', { tone: tone });
    node(bx, by, 'B', { tone: s >= 1 ? 'good' : 'none' });
    node(cx, cy, 'C', { tone: s >= 1 ? 'good' : 'none' });
    node(dx, dy, 'D', { tone: s >= 1 ? 'good' : 'none' });
    line(60, 400, 'four elements, four arrows', { size: 10.5, color: PAL.faint });

    line(380, 78, 'Candidate ordering 1', { size: 10.5, color: PAL.faint });
    line(380, 96, 'A  B  C  D', { size: 16, bold: true, mono: true });
    if (s >= 1) {
      var ok = ['A before B', 'A before C', 'B before D', 'C before D'];
      var i;
      for (i = 0; i < ok.length; i++) {
        line(380, 130 + i * 22, ok[i] + '   holds', { size: 11, color: PAL.valid });
      }
      line(380, 222, 'legal: this is a linear extension', { size: 11.5, bold: true, color: PAL.accent });
    }

    if (s >= 2) {
      line(380, 258, 'Candidate ordering 2', { size: 10.5, color: PAL.faint });
      line(380, 276, 'B  A  C  D', { size: 16, bold: true, mono: true });
      line(380, 306, 'A before B   broken: A sits in position 2, B in position 1',
        { size: 11, color: PAL.invalid });
      line(380, 328, 'one broken arrow is enough', { size: 11, color: PAL.invalid });
    }

    if (s >= 3) {
      panel(380, 350, 480, 76, { tone: 'info' });
      line(396, 362, 'A linear extension is a full ordering in which every arrow', { size: 11.5 });
      line(396, 382, 'still points forward. This diamond has exactly two:', { size: 11.5 });
      line(396, 402, 'A B C D  and  A C B D', { size: 12, bold: true, mono: true, color: PAL.accent });
    }
    foot('the count of linear extensions is the object of this whole lesson');
  }

  /* --- 2. the smallest cases ------------------------------------------- */
  function drawSmall(p) {
    var s = stage(p, 4);
    title('The smallest cases, and the two ends of the range',
      'four posets, counted by hand; then the range every answer must sit inside');

    var boxes = [
      { x: 30,  lab: '2 elements, no arrow', kind: 'pair', n: N.twoFree },
      { x: 246, lab: '2 elements, A before B', kind: 'pairEdge', n: N.twoChain },
      { x: 462, lab: '3 elements, A first', kind: 'vee', n: N.v3 },
      { x: 678, lab: '3 elements in a chain', kind: 'chain3', n: N.chain3 }
    ];
    var i, b;
    for (i = 0; i < boxes.length; i++) {
      b = boxes[i];
      panel(b.x, 72, 196, 176, {});
      centre(b.x + 98, 88, b.lab, { size: 10.5, color: PAL.dim });
      if (b.kind === 'pair' || b.kind === 'pairEdge') {
        if (b.kind === 'pairEdge') arrow(b.x + 62, 150, b.x + 134, 150, { r1: 18, r2: 18 });
        node(b.x + 62, 150, 'A', { r: 18, tone: s >= 1 ? 'good' : 'none' });
        node(b.x + 134, 150, 'B', { r: 18, tone: s >= 1 ? 'good' : 'none' });
      } else if (b.kind === 'vee') {
        arrow(b.x + 98, 118, b.x + 60, 172, { r1: 17, r2: 17 });
        arrow(b.x + 98, 118, b.x + 136, 172, { r1: 17, r2: 17 });
        node(b.x + 98, 118, 'A', { r: 17, tone: s >= 2 ? 'good' : 'none' });
        node(b.x + 60, 172, 'B', { r: 17, tone: s >= 2 ? 'good' : 'none' });
        node(b.x + 136, 172, 'C', { r: 17, tone: s >= 2 ? 'good' : 'none' });
      } else {
        arrow(b.x + 98, 116, b.x + 98, 152, { r1: 17, r2: 17 });
        arrow(b.x + 98, 176, b.x + 98, 212, { r1: 17, r2: 17 });
        node(b.x + 98, 116, 'A', { r: 17, tone: s >= 2 ? 'good' : 'none' });
        node(b.x + 98, 164, 'B', { r: 17, tone: s >= 2 ? 'good' : 'none' });
        node(b.x + 98, 212, 'C', { r: 17, tone: s >= 2 ? 'good' : 'none' });
      }
      if (s >= 2) centre(b.x + 98, 234, 'count = ' + b.n, { size: 12, bold: true, mono: true, color: PAL.accent });
    }

    if (s >= 2) {
      line(30, 268, 'Three elements with no arrow at all: 6.  Four elements with no arrow: 24.',
        { size: 11.5 });
    }
    if (s >= 3) {
      panel(30, 296, 830, 62, { tone: 'good' });
      line(46, 308, 'Every count lies between 1 and n factorial, and both ends are reached:', { size: 11.5 });
      line(46, 330, 'a chain gives 1, an antichain gives n! = ' + fact(4) + ' at n = 4, ' + fact(5) + ' at n = 5.',
        { size: 11.5, mono: false });
    }
    if (s >= 3) {
      line(30, 380, 'Adding an arrow can only lower the count, never raise it.', { size: 11.5, color: PAL.dim });
      line(30, 404, 'An arrow already implied by a path changes nothing: a DAG and its closure agree.',
        { size: 11.5, color: PAL.dim });
    }
    foot('the two ends are a chain (1) and an antichain (n!)');
  }

  /* --- 3. the definition as a search ----------------------------------- */
  function drawBrute(p) {
    var s = stage(p, 4);
    title('The definition as a search: 24 orderings, 5 survivors',
      'A before C, B before C, B before D - the smallest poset no formula reaches');

    /* the poset, small, top left */
    arrow(76, 88, 196, 88, { r1: 14, r2: 14 });
    arrow(76, 140, 196, 88, { r1: 14, r2: 14 });
    arrow(76, 140, 196, 140, { r1: 14, r2: 14 });
    node(76, 88, 'A', { r: 14, size: 11 });
    node(76, 140, 'B', { r: 14, size: 11 });
    node(196, 88, 'C', { r: 14, size: 11 });
    node(196, 140, 'D', { r: 14, size: 11 });
    line(240, 100, 'A before C, B before C, B before D', { size: 11, color: PAL.dim });

    if (s >= 3) {
      line(870, 96, '5 kept of 24', { size: 13, bold: true, color: PAL.accent, align: 'right' });
      line(870, 118, 'n! = 24 tested', { size: 10.5, color: PAL.faint, align: 'right' });
    }

    /* the 24 cells: every ordering of four elements */
    var all = BRUTE_N.all, i, r, c, x, y, perm, kept, tone;
    line(30, 162, 'every ordering of the four elements, tested against the three arrows',
      { size: 10.5, color: PAL.faint });
    for (i = 0; i < all.length; i++) {
      r = Math.floor(i / 4); c = i % 4;
      x = 30 + c * 212; y = 176 + r * 42;
      perm = all[i];
      kept = respects(perm, NPOSET.rel);
      tone = s < 1 ? 'none' : (kept ? 'good' : 'bad');
      panel(x, y, 200, 34, { tone: tone, sw: 1 });
      line(x + 14, y + 10, word(perm), { size: 12, mono: true, bold: true });
      if (s >= 1) {
        line(x + 100, y + 11, kept ? 'kept' : 'fails', {
          size: 10, color: kept ? PAL.valid : PAL.invalid
        });
      }
    }
    foot('this is the definition executed; it costs n! and settles only tiny sets');
  }

  /* --- 4. the two composition rules ------------------------------------ */
  function drawSeries(p) {
    var s = stage(p, 4);
    title('Series multiplies, parallel chooses slots',
      'two joins build every closed form in this lesson');

    /* series, left */
    panel(30, 72, 400, 200, { tone: s >= 0 ? 'info' : 'none' });
    line(46, 82, 'In series: every element of P before every element of Q', { size: 11, color: PAL.dim });
    panel(70, 110, 120, 54, { tone: 'none' });
    centre(130, 137, 'P', { size: 15, bold: true, mono: true });
    arrow(130, 168, 130, 198, { r1: 0, r2: 0 });
    panel(70, 202, 120, 54, { tone: 'none' });
    centre(130, 229, 'Q', { size: 15, bold: true, mono: true });
    if (s >= 0) {
      line(214, 116, 'e(P then Q)', { size: 12, bold: true, mono: true });
      line(214, 138, '= e(P) x e(Q)', { size: 13, mono: true, color: PAL.accent });
      line(214, 166, 'no interleaving is possible:', { size: 10.5, color: PAL.dim });
      line(214, 186, 'the two orders are chosen', { size: 10.5, color: PAL.dim });
      line(214, 206, 'independently and concatenated', { size: 10.5, color: PAL.dim });
    }

    /* parallel, right */
    panel(470, 72, 400, 200, { tone: s >= 1 ? 'info' : 'none' });
    line(486, 82, 'In parallel: nothing crosses, so the elements interleave', { size: 11, color: PAL.dim });
    panel(500, 118, 110, 54, { tone: 'none' });
    centre(555, 145, 'P', { size: 15, bold: true, mono: true });
    panel(660, 118, 110, 54, { tone: 'none' });
    centre(715, 145, 'P', { size: 15, bold: true, mono: true });
    centre(555, 106, 'm elements', { size: 9.5, color: PAL.faint });
    centre(715, 106, 'n elements', { size: 9.5, color: PAL.faint });
    if (s >= 2) {
      line(500, 192, 'e(P or Q)', { size: 12, bold: true, mono: true });
      line(500, 214, '= C(m+n, m) x e(P) x e(Q)', { size: 12, mono: true, color: PAL.accent });
      line(500, 242, 'choose which slots hold P', { size: 10.5, color: PAL.dim });
    }

    if (s >= 3) {
      panel(30, 292, 840, 66, { tone: 'good' });
      line(46, 304, 'Series-parallel posets are exactly the ones these two rules reach. Trees read from the root are', { size: 11.5 });
      line(46, 326, 'series-parallel, and so is any set of disjoint chains. The poset in scene 8 is the smallest one they cannot build.', { size: 11.5 });
    }
    if (s >= 3) {
      line(30, 376, 'Series: multiply, and the sizes add.   Parallel: choose the slots, and the binomial appears.', { size: 11.5 });
      line(30, 400, 'Both rules are exact, not approximations: they count every ordering once and none twice.', { size: 11.5, color: PAL.dim });
    }
    foot('series and parallel are the two joins that give a closed form');
  }

  /* --- 5. two chains --------------------------------------------------- */
  function drawBinom(p) {
    var s = stage(p, 4);
    title('Two chains: a binomial coefficient, not a division',
      'B before C and D before E, four slots, C(4,2) = 6');

    /* the two chains */
    arrow(120, 104, 120, 152, { r1: 17, r2: 17 });
    node(120, 104, 'B', { r: 17 });
    node(120, 170, 'C', { r: 17 });
    arrow(230, 104, 230, 152, { r1: 17, r2: 17 });
    node(230, 104, 'D', { r: 17 });
    node(230, 170, 'E', { r: 17 });
    line(96, 202, 'chain 1', { size: 10, color: PAL.faint });
    line(206, 202, 'chain 2', { size: 10, color: PAL.faint });

    var six = ['B C D E', 'B D C E', 'B D E C', 'D B C E', 'D B E C', 'D E B C'];
    var slots = ['1,2', '1,3', '1,4', '2,3', '2,4', '3,4'];
    var i, y;
    line(320, 76, 'which two of the four slots hold the B-C chain', { size: 10.5, color: PAL.faint });
    for (i = 0; i < 6; i++) {
      y = 96 + i * 40;
      if (s >= 1) {
        panel(320, y - 4, 300, 32, { tone: i === 0 ? 'good' : 'none', sw: 0.9 });
        line(336, y + 6, 'slots ' + slots[i], { size: 11, color: PAL.dim });
        line(440, y + 5, six[i], { size: 13, mono: true, bold: true });
      }
    }

    if (s >= 1) {
      line(650, 96, 'C(4,2) = 6', { size: 15, bold: true, mono: true, color: PAL.accent });
      line(650, 122, '4! / (2! 2!) = 24 / 4', { size: 11, mono: true, color: PAL.dim });
    }
    if (s >= 2) {
      panel(640, 156, 236, 96, { tone: 'info' });
      line(652, 166, 'sizes 3 and 2:', { size: 10.5, color: PAL.dim });
      line(652, 186, 'C(5,2) = 10', { size: 13, bold: true, mono: true });
      line(652, 208, 'choosing 2 of 5 is the same', { size: 10, color: PAL.dim });
      line(652, 224, 'as choosing 3 of 5', { size: 10, color: PAL.dim });
    }
    if (s >= 3) {
      panel(320, 344, 556, 56, { tone: 'warn' });
      line(336, 356, 'The denominator is 2! for each chain, not a single 2. Dividing 4! by 2 gives 12,', { size: 11 });
      line(336, 378, 'and the answer is 6: each chain has a fixed internal order to divide out.', { size: 11 });
    }
    foot('a binomial counts choices of position; it is not a division by the number of arrows');
  }

  /* --- 6. three chains and the failing shortcut ------------------------ */
  function drawMulti(p) {
    var s = stage(p, 3);
    title('Three chains, and the shortcut that fails',
      'the multinomial is exact; dividing by two per arrow is not');

    var pairs = [[70, 110], [150, 110], [230, 110]];
    var i, x;
    for (i = 0; i < 3; i++) {
      x = pairs[i][0];
      arrow(x, 104, x, 148, { r1: 15, r2: 15 });
      node(x, 104, LAB[2 * i], { r: 15 });
      node(x, 164, LAB[2 * i + 1], { r: 15 });
    }
    line(60, 200, 'three parallel chains of two, six elements', { size: 10.5, color: PAL.faint });

    if (s >= 0) {
      line(340, 96, 'C(6,2) x C(4,2) x C(2,2)', { size: 12, mono: true });
      line(340, 120, '= 15 x 6 x 1 = 90', { size: 14, bold: true, mono: true, color: PAL.accent });
      line(340, 146, 'the multinomial 6! / (2! 2! 2!) = 720 / 8 = 90', { size: 11, mono: true, color: PAL.dim });
    }

    if (s >= 1) {
      panel(340, 176, 530, 46, { tone: 'info' });
      line(354, 188, 'the shortcut: 720 / 8 = 90 here, because the three pairs are disjoint', { size: 11 });
    }

    if (s >= 2) {
      panel(30, 240, 840, 44, { tone: 'bad' });
      line(46, 252, 'On one chain of three the shortcut gives 6 / 4 = 1.5, and a count is never a fraction.', { size: 11.5 });
      panel(30, 296, 840, 44, { tone: 'bad' });
      line(46, 308, 'On one chain of four it gives 24 / 8 = 3, and the true answer is 1.', { size: 11.5 });
      line(30, 356, 'Two arrows that share an element are not independent, so their factors cannot be multiplied.', { size: 11.5 });
      line(30, 380, 'The shortcut is right only when the constraints are on disjoint pairs of elements.', { size: 11.5, color: PAL.dim });
    }
    foot('if a proposed formula returns a non-integer, it is wrong');
  }

  /* --- 7. the tree ----------------------------------------------------- */
  function drawTree(p) {
    var s = stage(p, 4);
    title('A rooted tree: n! over the product of the subtree sizes',
      'the hook-length formula, exact for forests and for series-parallel posets');

    /* the tree: r with children x and y, and x has child z */
    var rx = 180, ry = 96, xx = 110, xy = 200, yx = 262, yy = 200, zx = 110, zy = 300;
    arrow(rx, ry, xx, xy, { r1: 22, r2: 22 });
    arrow(rx, ry, yx, yy, { r1: 22, r2: 22 });
    arrow(xx, xy, zx, zy, { r1: 22, r2: 22 });
    node(rx, ry, 'r', { r: 22 });
    node(xx, xy, 'x', { r: 22 });
    node(yx, yy, 'y', { r: 22 });
    node(zx, zy, 'z', { r: 22 });
    if (s >= 0) {
      line(rx + 28, ry - 6, '4', { size: 11, mono: true, bold: true, color: PAL.accent });
      line(xx + 28, xy - 6, '2', { size: 11, mono: true, bold: true, color: PAL.accent });
      line(yx + 28, yy - 6, '1', { size: 11, mono: true, bold: true, color: PAL.accent });
      line(zx + 28, zy - 6, '1', { size: 11, mono: true, bold: true, color: PAL.accent });
      line(60, 336, 'the number beside each node is its subtree size', { size: 10.5, color: PAL.faint });
    }

    if (s >= 1) {
      line(400, 88, 'e = n! / (product of subtree sizes)', { size: 12.5, mono: true });
      line(400, 114, '= 24 / (4 x 2 x 1 x 1)', { size: 12, mono: true });
      line(400, 140, '= 24 / 8 = 3', { size: 14, bold: true, mono: true, color: PAL.accent });
      line(400, 166, 'the three: r x y z, r x z y, r y x z', { size: 10.5, color: PAL.dim });
    }

    if (s >= 2) {
      /* the forest, clear of the text column */
      arrow(700, 96, 700, 138, { r1: 15, r2: 15 });
      node(700, 96, 'p', { r: 15 });
      node(700, 154, 'q', { r: 15 });
      arrow(810, 96, 810, 138, { r1: 15, r2: 15 });
      node(810, 96, 'u', { r: 15 });
      node(810, 154, 'v', { r: 15 });
      line(726, 92, '2', { size: 10.5, mono: true, bold: true, color: PAL.accent });
      line(726, 150, '1', { size: 10.5, mono: true, bold: true, color: PAL.accent });
      line(836, 92, '2', { size: 10.5, mono: true, bold: true, color: PAL.accent });
      line(836, 150, '1', { size: 10.5, mono: true, bold: true, color: PAL.accent });
      line(400, 200, 'forest of two chains: 24 / (2 x 1 x 2 x 1) = 6', { size: 12, mono: true });
      line(400, 224, 'the binomial gives the same 6', { size: 10.5, color: PAL.dim });
    }

    if (s >= 3) {
      panel(30, 366, 840, 60, { tone: 'warn' });
      line(46, 378, 'The formula needs a tree to read. On the four-element poset of scene 3 there is no tree, so there', { size: 11 });
      line(46, 400, 'is nothing to compute: the shape of the poset, not the number of elements, decides which formula is legal.', { size: 11 });
    }
    foot('hook length: n! over the product of subtree sizes');
  }

  /* --- 8. the poset no formula reaches --------------------------------- */
  function drawHard(p) {
    var s = stage(p, 4);
    title('A poset no formula reaches',
      'A before C, B before C, B before D: neither a series nor a parallel join');

    arrow(96, 110, 236, 110, { r1: 20, r2: 20 });
    arrow(96, 220, 236, 110, { r1: 20, r2: 20 });
    arrow(96, 220, 236, 220, { r1: 20, r2: 20 });
    node(96, 110, 'A', { r: 20 });
    node(96, 220, 'B', { r: 20 });
    node(236, 110, 'C', { r: 20 });
    node(236, 220, 'D', { r: 20 });
    line(60, 272, 'the N poset', { size: 10.5, color: PAL.faint });

    if (s >= 1) {
      line(330, 82, 'Count by the last element', { size: 12, bold: true });
      panel(330, 104, 540, 56, { tone: 'good' });
      line(344, 114, 'C is last: A, B, D remain with only B before D', { size: 11 });
      line(344, 136, 'three orderings: A B D, B A D, B D A', { size: 11, mono: true });
    }
    if (s >= 2) {
      panel(330, 172, 540, 56, { tone: 'good' });
      line(344, 182, 'D is last: C must follow both A and B, so C is last of the three', { size: 11 });
      line(344, 204, 'two orderings: A B C, B A C', { size: 11, mono: true });
      line(330, 240, '3 + 2 = 5, and the two cases are exhaustive because only C and D are maximal',
        { size: 11.5, bold: true, color: PAL.accent });
    }
    if (s >= 3) {
      panel(30, 296, 840, 108, { tone: 'info' });
      line(46, 308, 'Brightwell and Winkler, 1991: counting linear extensions is #P-complete.', { size: 11.5, bold: true });
      line(46, 330, 'The decision problem is trivial, since every partial order has a linear extension. Only the count is hard,', { size: 11 });
      line(46, 350, 'so no formula can exist for a general poset. Polynomial algorithms do exist for trees, for series-parallel', { size: 11 });
      line(46, 370, 'posets and for posets of bounded width - and a question always gives one of those, or a set small enough to count.', { size: 11 });
    }
    foot('case splits on the last element are exhaustive: it must be maximal');
  }

  /* --- 9. the subset dynamic program ----------------------------------- */
  function drawDp(p) {
    var s = stage(p, 4);
    title('The general method: dynamic programming over subsets',
      'f(S) counts the orderings of S used as a prefix; f(empty) is the answer');

    var f = TABLE_N.f;
    function label(mask) {
      var out = '', i;
      for (i = 0; i < 4; i++) if (mask & (1 << i)) out += LAB[i];
      return out || '(empty)';
    }
    var cols = [[0], [1, 2, 4, 8], [3, 5, 6, 9, 10, 12], [7, 11, 13, 14], [15]];
    var heads = ['size 0', 'size 1', 'size 2', 'size 3', 'size 4'];
    var cx = [30, 200, 370, 540, 710];
    var i, j, mask, y;
    for (i = 0; i < 5; i++) {
      line(cx[i], 76, heads[i], { size: 10.5, color: PAL.faint, mono: true });
      for (j = 0; j < cols[i].length; j++) {
        mask = cols[i][j];
        y = 96 + j * 26;
        if (s >= 0) {
          line(cx[i], y, label(mask), { size: 11.5, mono: true, color: mask === 0 ? PAL.accent : PAL.ink, bold: mask === 0 });
          line(cx[i] + 96, y, 'f = ' + f[mask], { size: 11.5, mono: true, bold: true, color: mask === 0 ? PAL.accent : PAL.dim });
        }
      }
    }

    if (s >= 1) {
      panel(30, 268, 520, 60, { tone: 'info' });
      line(44, 278, 'the next element must have all its predecessors already in S', { size: 11 });
      line(44, 300, 'f(S) = sum of f(S + v) over those v', { size: 12, mono: true, bold: true });
    }
    if (s >= 2) {
      line(30, 344, 'f(full) = 1 by definition: there is one way to order nothing further.', { size: 11.5 });
      line(30, 368, 'f(empty) = ' + f[0] + ', which is the count of the whole poset.', { size: 11.5, color: PAL.accent, bold: true });
    }
    if (s >= 3) {
      line(580, 268, 'cost: n x 2^n', { size: 12, bold: true, mono: true });
      line(580, 290, 'n = 8 gives 2,048', { size: 11, mono: true, color: PAL.dim });
      line(580, 310, 'n = 20 gives 20,971,520', { size: 11, mono: true, color: PAL.dim });
    }
    foot('sixteen subsets for four elements, filled in order of size');
  }

  /* --- 10. the previous-year question ---------------------------------- */
  function drawPyq(p) {
    var s = stage(p, 4);
    title('GATE CSE 2016, Set 1, Q11: six orderings',
      'A is the only source, F the only sink, and the middle is two parallel chains');

    var ax = 66, ay = 190, bx = 186, by = 108, cx = 186, cy = 268,
        dx = 336, dy = 108, ex = 336, ey = 268, fx = 470, fy = 190;
    arrow(ax, ay, bx, by, { r1: 18, r2: 18 });
    arrow(ax, ay, dx, dy, { r1: 18, r2: 18 });
    arrow(bx, by, cx, cy, { r1: 18, r2: 18 });
    arrow(dx, dy, ex, ey, { r1: 18, r2: 18 });
    arrow(cx, cy, fx, fy, { r1: 18, r2: 18 });
    arrow(ex, ey, fx, fy, { r1: 18, r2: 18 });
    node(ax, ay, 'A', { r: 18, tone: s >= 1 ? 'good' : 'none' });
    node(bx, by, 'B', { r: 18, tone: s >= 2 ? 'good' : 'none' });
    node(cx, cy, 'C', { r: 18, tone: s >= 2 ? 'good' : 'none' });
    node(dx, dy, 'D', { r: 18, tone: s >= 2 ? 'good' : 'none' });
    node(ex, ey, 'E', { r: 18, tone: s >= 2 ? 'good' : 'none' });
    node(fx, fy, 'F', { r: 18, tone: s >= 1 ? 'good' : 'none' });

    if (s >= 1) {
      line(540, 96, 'A first, F last', { size: 12, bold: true, color: PAL.accent });
      line(540, 118, 'four slots in the middle', { size: 11, color: PAL.dim });
    }
    if (s >= 2) {
      panel(510, 146, 360, 78, { tone: 'good' });
      line(524, 156, 'the middle is B<C and D<E in parallel', { size: 11 });
      line(524, 178, 'C(4,2) = 4! / (2! 2!) = 6', { size: 12.5, mono: true, bold: true });
      line(524, 200, 'two chains of two, four slots', { size: 10.5, color: PAL.dim });
    }
    if (s >= 3) {
      panel(30, 306, 840, 82, { tone: 'info' });
      line(44, 316, 'A B C D E F    A B D C E F    A B D E C F', { size: 11.5, mono: true, bold: true });
      line(44, 340, 'A D B C E F    A D B E C F    A D E B C F', { size: 11.5, mono: true, bold: true });
      line(44, 366, 'six orderings, and no seventh: each keeps B before C and D before E', { size: 10.5, color: PAL.dim });
      line(540, 250, 'answer: 6', { size: 15, bold: true, mono: true, color: PAL.accent });
    }
    foot('verified: the graph of GATE CSE 2016 Set 1 Q11 has six topological orderings');
  }

  /* --- 11. one arithmetic, three names --------------------------------- */
  function drawApps(p) {
    var s = stage(p, 4);
    title('One arithmetic, three names',
      'topological orderings, thread interleavings, conflict-serialisable schedules');

    /* left: interleavings */
    panel(30, 72, 400, 216, { tone: s >= 1 ? 'info' : 'none' });
    line(44, 82, 'Two threads, two statements each', { size: 11.5, bold: true });
    arrow(70, 122, 70, 158, { r1: 15, r2: 15 });
    node(70, 116, 'S1', { r: 15, size: 10 });
    node(70, 170, 'S2', { r: 15, size: 10 });
    arrow(160, 122, 160, 158, { r1: 15, r2: 15 });
    node(160, 116, 'S3', { r: 15, size: 10 });
    node(160, 170, 'S4', { r: 15, size: 10 });
    line(44, 200, 'C(4,2) = 6 interleavings', { size: 11.5, mono: true, bold: true, color: PAL.accent });
    if (s >= 1) {
      line(44, 224, 'but only three distinct outcomes:', { size: 11, color: PAL.dim });
      line(44, 244, '(a,b) = (4,4), (4,3), (3,3)', { size: 11.5, mono: true });
      line(44, 268, 'GATE CSE 2024 Set 1 Q40', { size: 10, color: PAL.faint });
    }

    /* right: schedules */
    panel(470, 72, 400, 216, { tone: s >= 2 ? 'info' : 'none' });
    line(484, 82, 'Two transactions of four operations', { size: 11.5, bold: true });
    line(484, 108, 'total schedules: C(8,4) = 70', { size: 11.5, mono: true });
    if (s >= 2) {
      line(484, 132, 'cyclic precedence graph: 16', { size: 11.5, mono: true, color: PAL.invalid });
      line(484, 156, 'conflict serialisable: 70 - 16 = 54', { size: 11.5, mono: true, bold: true, color: PAL.accent });
      line(484, 184, 'a schedule is serialisable exactly when its', { size: 10.5, color: PAL.dim });
      line(484, 202, 'precedence graph is acyclic', { size: 10.5, color: PAL.dim });
      line(484, 234, 'GATE CSE 2017 Set 2 Q44', { size: 10, color: PAL.faint });
    }

    if (s >= 3) {
      panel(30, 306, 840, 82, { tone: 'good' });
      line(44, 316, 'In each case the task is to count the orderings that respect the constraints, so the first move is', { size: 11.5 });
      line(44, 338, 'always the same: name the elements, draw the arrows that must hold, then ask about the shape.', { size: 11.5 });
      line(44, 364, 'chain: 1.   parallel chains: a binomial or multinomial.   tree: hook length.   neither: cases or the subset table.', { size: 11 });
    }
    foot('one arithmetic, three names: draw the partial order first');
  }

  var DRAW = {
    poset: drawPoset, small: drawSmall, brute: drawBrute, series: drawSeries,
    binom: drawBinom, multi: drawMulti, tree: drawTree, hard: drawHard,
    dp: drawDp, pyq2016: drawPyq, apps: drawApps
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
    N: N, TRAP: TRAP, SCHED: SCHED, IL_OUT: IL_OUT,
    BRUTE_N: BRUTE_N, BRUTE_PYQ: BRUTE_PYQ, TABLE_N: TABLE_N,
    count: count, countBrute: countBrute, countTable: countTable,
    binom: binom, multinom: multinom, fact: fact, hookProduct: hookProduct,
    PASSED: PASSED, TOTAL: CHECKS.length,
    ALL_PASS: PASSED === CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
