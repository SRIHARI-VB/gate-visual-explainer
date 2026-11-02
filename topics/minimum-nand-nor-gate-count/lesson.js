/* ==========================================================================
   minimum-nand-nor-gate-count - model, validation, render.

   Layer 1  model      : functions as truth-table bitmasks; exact synthesis of
                         two-input NAND and NOR circuits by exhaustive
                         breadth-first search over the SET of signals available,
                         with dominance pruning (a signal set contained in
                         another at the same depth is dropped, which preserves
                         every minimum); the named constructions; the gate-count
                         arithmetic for wide gates.
   Layer 2  validation : every number quoted in a caption or a card is
                         recomputed here by a second route - a construction is
                         re-simulated on every row, and a claimed minimum is
                         compared against the exhaustive search's own depth.
   Layer 3  render     : reads the model; never re-derives a number.
   Layer 4  timeline   : in timeline.js - the only source of time.

   No p5.brush: every mark is a table cell, a gate box, a wire or a number the
   learner has to read exactly. A random stroke offset would blur the thing
   being read.
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
     A function of n variables is a bitmask over the 2^n rows of its truth
     table. Row r has x0 as its most significant bit. A circuit is a list of
     two-input gates whose operands are signal indices: 0..pool-1 are the
     supplied signals, then each gate output appends one.
     ====================================================================== */

  function Ctx(n, comp, names) {
    this.n = n;
    this.rows = 1 << n;
    this.full = (1 << this.rows) - 1;
    this.comp = !!comp;
    this.names = names;
    var v = [], i, r, m;
    for (i = 0; i < n; i++) {
      m = 0;
      for (r = 0; r < this.rows; r++) if ((r >> (n - 1 - i)) & 1) m |= (1 << r);
      v.push(m);
    }
    this.vars = v;
    this.pool = [];
    this.poolNames = [];
    for (i = 0; i < n; i++) {
      this.pool.push(v[i]);
      this.poolNames.push(names[i]);
      if (this.comp) {
        this.pool.push(this.full ^ v[i]);
        this.poolNames.push(names[i] + '&prime;');
      }
    }
  }

  Ctx.prototype.nand = function (a, b) { return this.full ^ (a & b); };
  Ctx.prototype.nor = function (a, b) { return this.full ^ (a | b); };
  Ctx.prototype.gate = function (op, a, b) { return op === 'NAND' ? this.nand(a, b) : this.nor(a, b); };

  /* ---- truth-table string, row 0 first, x0 = MSB --------------------- */
  function truthStr(mask, rows) {
    var s = '', r;
    for (r = 0; r < rows; r++) s += ((mask >> r) & 1) ? '1' : '0';
    return s;
  }

  /* ---- exhaustive synthesis ------------------------------------------
     Returns { first: array(mask -> depth or -1), states, levels, budgetHit }.
     Level d holds every maximal signal set reachable with d gates. A set is
     dropped only when another set at the same depth contains it, so every
     function's first appearance depth is its true minimum.
     ------------------------------------------------------------------- */
  function classify(cx, op, maxDepth, budget) {
    if (maxDepth === undefined || maxDepth === null) maxDepth = 6;
    budget = budget || 40000;
    var size = 1 << cx.rows;
    var first = new Array(size);
    var i;
    for (i = 0; i < size; i++) first[i] = -1;

    var start = cx.pool.slice().sort(function (a, b) { return a - b; });
    var startKey = start.join(',');
    for (i = 0; i < start.length; i++) if (first[start[i]] < 0) first[start[i]] = 0;

    var frontier = [start];
    var seen = {}; seen[startKey] = 1;
    var levels = [1], explored = 0, budgetHit = false, depth;

    for (depth = 1; depth <= maxDepth; depth++) {
      var cand = [], candKey = {}, k;
      for (var fi = 0; fi < frontier.length; fi++) {
        var st = frontier[fi];
        for (var a = 0; a < st.length; a++) {
          for (var b = a; b < st.length; b++) {
            var g = cx.gate(op, st[a], st[b]);
            if (st.indexOf(g) >= 0) continue;
            var ns = st.concat([g]).sort(function (x, y) { return x - y; });
            var key = ns.join(',');
            if (candKey[key] || seen[key]) continue;
            candKey[key] = 1;
            cand.push(ns);
            explored++;
            if (explored > budget) { budgetHit = true; break; }
          }
          if (budgetHit) break;
        }
        if (budgetHit) break;
      }
      if (budgetHit) { levels.push(cand.length); break; }

      /* dominance prune: keep only maximal sets */
      cand.sort(function (x, y) { return y.length - x.length; });
      var kept = [], keptSets = [], j;
      for (k = 0; k < cand.length; k++) {
        var dominated = false;
        for (j = 0; j < keptSets.length; j++) {
          var sup = keptSets[j], all = true;
          for (var q = 0; q < cand[k].length; q++) {
            if (sup.indexOf(cand[k][q]) < 0) { all = false; break; }
          }
          if (all) { dominated = true; break; }
        }
        if (!dominated) { kept.push(cand[k]); keptSets.push(cand[k]); }
      }
      levels.push(kept.length);
      for (k = 0; k < kept.length; k++) {
        seen[kept[k].join(',')] = 1;
        for (var m = 0; m < kept[k].length; m++) {
          if (first[kept[k][m]] < 0) first[kept[k][m]] = depth;
        }
      }
      frontier = kept;
      if (!kept.length) break;
    }
    return { first: first, states: explored, levels: levels, budgetHit: budgetHit };
  }

  /* the smallest depth at which one target appears; null when not within
     maxDepth and the search was exhaustive (so null is a proof) */
  function minDepth(cx, op, target, maxDepth, budget) {
    var r = classify(cx, op, maxDepth, budget || 40000);
    if (r.budgetHit) return { depth: r.first[target] >= 0 ? r.first[target] : null,
                              proven: false, states: r.states, levels: r.levels };
    var d = r.first[target];
    return { depth: d >= 0 ? d : null, proven: true, states: r.states, levels: r.levels };
  }

  /* ---- circuit evaluation and verification ---------------------------- */
  function evalCircuit(cx, circ) {
    var sig = cx.pool.slice(), i;
    for (i = 0; i < circ.length; i++) {
      sig.push(cx.gate(circ[i][0], sig[circ[i][1]], sig[circ[i][2]]));
    }
    return sig;
  }

  function checkCircuit(cx, circ, outIndex, target) {
    var sig = evalCircuit(cx, circ);
    var got = sig[outIndex];
    var bad = 0, r;
    for (r = 0; r < cx.rows; r++) if (((got >> r) & 1) !== ((target >> r) & 1)) bad++;
    return { mask: got, bad: bad, rows: cx.rows, gates: circ.length };
  }

  /* ---- named functions ----------------------------------------------- */
  function maskOf(cx, pred) {
    var m = 0, r;
    for (r = 0; r < cx.rows; r++) if (pred(r)) m |= (1 << r);
    return m;
  }
  function bit(cx, r, i) { return (r >> (cx.n - 1 - i)) & 1; }

  var C2 = new Ctx(2, false, ['x', 'y']);
  var C2C = new Ctx(2, true, ['x', 'y']);
  var FN2 = {
    'x':      C2.vars[0],
    'y':      C2.vars[1],
    'x&prime;': C2.full ^ C2.vars[0],
    'y&prime;': C2.full ^ C2.vars[1],
    'x&middot;y':  C2.vars[0] & C2.vars[1],
    'x&nbsp;NAND&nbsp;y': C2.full ^ (C2.vars[0] & C2.vars[1]),
    'x+y':    C2.vars[0] | C2.vars[1],
    'x&nbsp;NOR&nbsp;y':  C2.full ^ (C2.vars[0] | C2.vars[1]),
    'x&oplus;y': C2.vars[0] ^ C2.vars[1],
    'x&odot;y':  C2.full ^ (C2.vars[0] ^ C2.vars[1])
  };
  var FN2_KEYS = ['x', 'y', 'x&prime;', 'y&prime;', 'x&middot;y', 'x&nbsp;NAND&nbsp;y',
                  'x+y', 'x&nbsp;NOR&nbsp;y', 'x&oplus;y', 'x&odot;y'];

  /* the four cost models of the two-variable table */
  var SYN = {
    NAND0: classify(C2, 'NAND', 6),
    NAND1: classify(C2C, 'NAND', 6),
    NOR0:  classify(C2, 'NOR', 6),
    NOR1:  classify(C2C, 'NOR', 6)
  };

  function cost(key, model) {
    var d = SYN[model].first[FN2[key]];
    return d < 0 ? null : d;
  }

  /* how many functions of two variables are one gate away */
  function oneGateCount(cx, op) {
    var got = {}, i, j;
    for (i = 0; i < cx.pool.length; i++) {
      for (j = i; j < cx.pool.length; j++) got[cx.gate(op, cx.pool[i], cx.pool[j])] = 1;
    }
    return Object.keys(got).length;
  }

  /* the distribution of the sixteen two-variable functions by minimum NAND
     depth, with only the literals available */
  function distribution(model) {
    var f = SYN[model].first, hist = {}, total = 0, i;
    for (i = 0; i < f.length; i++) {
      if (f[i] < 0) continue;
      hist[f[i]] = (hist[f[i]] || 0) + 1;
      total++;
    }
    return { hist: hist, total: total };
  }

  /* ---- the named constructions, all verified below -------------------- */
  var NA = 'NAND', NO = 'NOR';

  var C2X = C2C;   /* x, x', y, y' : indices 0,1,2,3 */

  var CIR = {};

  /* XOR, four two-input NAND gates, literals only */
  CIR.xor4 = { cx: C2, out: 5, circ: [[NA, 0, 1], [NA, 0, 2], [NA, 1, 2], [NA, 3, 4]] };
  /* XOR, three two-input NAND gates, complements supplied */
  CIR.xor3 = { cx: C2X, out: 6, circ: [[NA, 1, 2], [NA, 0, 3], [NA, 4, 5]] };
  /* XNOR, three two-input NAND gates, complements supplied */
  CIR.xnor3 = { cx: C2X, out: 6, circ: [[NA, 0, 2], [NA, 1, 3], [NA, 4, 5]] };

  /* four variables a, a', b, b', c, c', d, d' : 0..7 */
  var C4C = new Ctx(4, true, ['a', 'b', 'c', 'd']);
  var C3 = new Ctx(3, false, ['A', 'B', 'C']);
  var C3C = new Ctx(3, true, ['A', 'B', 'C']);
  var C4 = new Ctx(4, false, ['A', 'B', 'C', 'D']);

  /* AB + C, three two-input NOR gates, literals only */
  CIR.abcNor = { cx: C3, out: 5, circ: [[NO, 0, 2], [NO, 1, 2], [NO, 3, 4]] };
  /* AB + C, two two-input NAND gates, complements supplied */
  CIR.abcNand2 = { cx: C3C, out: 7, circ: [[NA, 0, 2], [NA, 6, 5]] };
  /* AB + C, three two-input NAND gates, literals only */
  CIR.abcNand3 = { cx: C3, out: 5, circ: [[NA, 0, 1], [NA, 2, 2], [NA, 3, 4]] };

  /* not-a AND c, one NOR gate, complements supplied (a=0, a'=1, c=4, c'=5) */
  CIR.acNor = { cx: C4C, out: 8, circ: [[NO, 0, 5]] };

  /* B XNOR D, three NOR gates, complements supplied (b=2, b'=3, d=6, d'=7) */
  CIR.bdnor = { cx: C4C, out: 10, circ: [[NO, 3, 6], [NO, 2, 7], [NO, 8, 9]] };

  /* AB + CD, three NAND gates */
  CIR.abcd = { cx: C4, out: 6, circ: [[NA, 0, 1], [NA, 2, 3], [NA, 4, 5]] };
  /* AND3 in four NAND gates, NAND3 in three */
  CIR.and3 = { cx: C3, out: 6, circ: [[NA, 0, 1], [NA, 3, 3], [NA, 4, 2], [NA, 5, 5]] };
  CIR.nand3 = { cx: C3, out: 5, circ: [[NA, 0, 1], [NA, 3, 3], [NA, 4, 2]] };

  /* the full adder: nine two-input NAND gates, two outputs */
  CIR.fa = { cx: C3, sum: 10, carry: 11,
             circ: [[NA, 0, 1], [NA, 0, 3], [NA, 1, 3], [NA, 4, 5],
                    [NA, 6, 2], [NA, 6, 7], [NA, 2, 7], [NA, 8, 9], [NA, 3, 7]] };
  CIR.faSum = { cx: C3, out: 10,
                circ: [[NA, 0, 1], [NA, 0, 3], [NA, 1, 3], [NA, 4, 5],
                       [NA, 6, 2], [NA, 6, 7], [NA, 2, 7], [NA, 8, 9]] };
  CIR.faCarry = { cx: C3, out: 8,
                  circ: [[NA, 0, 1], [NA, 0, 3], [NA, 1, 3], [NA, 4, 5], [NA, 6, 2], [NA, 3, 7]] };

  /* targets */
  var T = {};
  T.xor2   = C2.vars[0] ^ C2.vars[1];
  T.xnor2  = C2.full ^ T.xor2;
  T.abc    = maskOf(C3, function (r) { return (bit(C3, r, 0) && bit(C3, r, 1)) || bit(C3, r, 2); });
  T.ac     = maskOf(C4C, function (r) { return !bit(C4C, r, 0) && bit(C4C, r, 2); });
  T.bdnor  = maskOf(C4C, function (r) { return bit(C4C, r, 1) === bit(C4C, r, 3); });
  T.abcd   = maskOf(C4, function (r) { return (bit(C4, r, 0) && bit(C4, r, 1)) || (bit(C4, r, 2) && bit(C4, r, 3)); });
  T.and3   = maskOf(C3, function (r) { return bit(C3, r, 0) && bit(C3, r, 1) && bit(C3, r, 2); });
  T.nand3  = C3.full ^ T.and3;
  T.faSum  = maskOf(C3, function (r) { return bit(C3, r, 0) ^ bit(C3, r, 1) ^ bit(C3, r, 2); });
  T.faCarry = maskOf(C3, function (r) {
    return (bit(C3, r, 0) + bit(C3, r, 1) + bit(C3, r, 2)) >= 2;
  });
  /* the GATE CSE 2019 minterm set, as a four-variable function */
  T.g2019 = (function () {
    var ms = [0, 2, 5, 7, 8, 10, 13, 15], m = 0, i;
    for (i = 0; i < ms.length; i++) m |= (1 << ms[i]);
    return m;
  })();

  var V = {};
  V.xor4 = checkCircuit(CIR.xor4.cx, CIR.xor4.circ, CIR.xor4.out, T.xor2);
  V.xor3 = checkCircuit(CIR.xor3.cx, CIR.xor3.circ, CIR.xor3.out, T.xor2);
  V.xnor3 = checkCircuit(CIR.xnor3.cx, CIR.xnor3.circ, CIR.xnor3.out, T.xnor2);
  V.abcNor = checkCircuit(CIR.abcNor.cx, CIR.abcNor.circ, CIR.abcNor.out, T.abc);
  V.abcNand2 = checkCircuit(CIR.abcNand2.cx, CIR.abcNand2.circ, CIR.abcNand2.out, T.abc);
  V.abcNand3 = checkCircuit(CIR.abcNand3.cx, CIR.abcNand3.circ, CIR.abcNand3.out, T.abc);
  V.acNor = checkCircuit(CIR.acNor.cx, CIR.acNor.circ, CIR.acNor.out, T.ac);
  V.bdnor = checkCircuit(CIR.bdnor.cx, CIR.bdnor.circ, CIR.bdnor.out, T.bdnor);
  V.abcd = checkCircuit(CIR.abcd.cx, CIR.abcd.circ, CIR.abcd.out, T.abcd);
  V.and3 = checkCircuit(CIR.and3.cx, CIR.and3.circ, CIR.and3.out, T.and3);
  V.nand3 = checkCircuit(CIR.nand3.cx, CIR.nand3.circ, CIR.nand3.out, T.nand3);

  V.faSum = checkCircuit(CIR.faSum.cx, CIR.faSum.circ, CIR.faSum.out, T.faSum);
  V.faCarry = checkCircuit(CIR.faCarry.cx, CIR.faCarry.circ, CIR.faCarry.out, T.faCarry);
  var faSig = evalCircuit(CIR.fa.cx, CIR.fa.circ);
  var FA = { sum: faSig[CIR.fa.sum], carry: faSig[CIR.fa.carry], gates: CIR.fa.circ.length };
  var faBad = 0, fr;
  for (fr = 0; fr < C3.rows; fr++) {
    if (((FA.sum >> fr) & 1) !== ((T.faSum >> fr) & 1)) faBad++;
    if (((FA.carry >> fr) & 1) !== ((T.faCarry >> fr) & 1)) faBad++;
  }

  /* the bounded lower-bound searches */
  var LB = {
    abcNor2:   minDepth(C3, NO, T.abc, 2, 40000),
    abcNor2c:  minDepth(C3C, NO, T.abc, 2, 40000),
    abcNand2:  minDepth(C3, NA, T.abc, 2, 40000),
    acNor0:    minDepth(C4C, NO, T.ac, 0, 40000),
    xor2two:   minDepth(C2, NA, T.xor2, 2, 40000),
    xor2twoC:  minDepth(C2C, NA, T.xor2, 2, 40000)
  };

  /* the gate-count arithmetic for a gate wider than the limit */
  function wideNand(k) { return k < 2 ? 0 : 2 * k - 3; }
  function wideAnd(k) { return k < 2 ? 0 : 2 * k - 2; }

  /* the two-variable distribution, and how many functions one gate buys */
  var DIST = distribution('NAND0');
  var ONEGATE = { lit: oneGateCount(C2, NA), comp: oneGateCount(C2C, NA) };
  var ONEGATE_NOR = { lit: oneGateCount(C2, NO), comp: oneGateCount(C2C, NO) };

  /* the K-maps drawn in scenes 9 and 10 */
  function kmap(cx, mask) {
    /* 4x4 map: rows are the first two variables, columns the last two,
       in Gray order 00, 01, 11, 10 */
    var order = [0, 1, 3, 2], out = [], ri, ci;
    for (ri = 0; ri < 4; ri++) {
      var row = [];
      for (ci = 0; ci < 4; ci++) {
        var r = (order[ri] << 2) | order[ci];
        row.push((mask >> r) & 1);
      }
      out.push(row);
    }
    return out;
  }
  var KM2017 = kmap(C4C, T.ac);
  var KM2019 = kmap(C4C, T.g2019);

  /* ======================================================================
     LAYER 2 - VALIDATION
     ====================================================================== */

  var CHECKS = [];
  function chk(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail || '' }); }

  /* the exhaustive two-variable table, every cell compared against a number
     this lesson also quotes in prose */
  var EXPECT = {
    'x':                   [0, 0, 0, 0],
    'y':                   [0, 0, 0, 0],
    'x&prime;':            [1, 0, 1, 0],
    'y&prime;':            [1, 0, 1, 0],
    'x&middot;y':          [2, 2, 3, 1],
    'x&nbsp;NAND&nbsp;y':  [1, 1, 4, 2],
    'x+y':                 [3, 1, 2, 2],
    'x&nbsp;NOR&nbsp;y':   [4, 2, 1, 1],
    'x&oplus;y':           [4, 3, 5, 3],
    'x&odot;y':            [5, 3, 4, 3]
  };
  var MODELS = ['NAND0', 'NAND1', 'NOR0', 'NOR1'];
  FN2_KEYS.forEach(function (k) {
    var got = MODELS.map(function (m) { return cost(k, m); });
    chk('two-variable cost of ' + k.replace(/&[a-z]+;/g, '') + ' is ' + EXPECT[k].join('/'),
        got.join(',') === EXPECT[k].join(','), got.join('/'));
  });

  chk('one NAND gate buys three functions with literals only', ONEGATE.lit === 3, String(ONEGATE.lit));
  chk('one NAND gate buys nine functions with complements', ONEGATE.comp === 9, String(ONEGATE.comp));
  chk('one NOR gate buys three functions with literals only', ONEGATE_NOR.lit === 3, String(ONEGATE_NOR.lit));
  chk('one NOR gate buys nine functions with complements', ONEGATE_NOR.comp === 9, String(ONEGATE_NOR.comp));
  chk('all sixteen two-variable functions are classified', DIST.total === 16, String(DIST.total));
  chk('the distribution is 2, 3, 4, 4, 2, 1',
      [0, 1, 2, 3, 4, 5].map(function (d) { return DIST.hist[d] || 0; }).join(',') === '2,3,4,4,2,1',
      [0, 1, 2, 3, 4, 5].map(function (d) { return DIST.hist[d] || 0; }).join(','));
  chk('exactly one two-variable function needs five NAND gates', (DIST.hist[5] || 0) === 1);
  chk('that function is the complement of XOR', cost('x&odot;y', 'NAND0') === 5);

  /* every construction re-simulated on every row */
  var CONS = [
    ['XOR in four NAND gates', V.xor4, 4],
    ['XOR in three NAND gates with complements', V.xor3, 3],
    ['XNOR in three NAND gates with complements', V.xnor3, 3],
    ['AB + C in three NOR gates', V.abcNor, 3],
    ['AB + C in two NAND gates with complements', V.abcNand2, 2],
    ['AB + C in three NAND gates with literals', V.abcNand3, 3],
    ['not-a AND c in one NOR gate', V.acNor, 1],
    ['B XNOR D in three NOR gates', V.bdnor, 3],
    ['AB + CD in three NAND gates', V.abcd, 3],
    ['AND3 in four NAND gates', V.and3, 4],
    ['NAND3 in three NAND gates', V.nand3, 3]
  ];
  CONS.forEach(function (c) {
    chk(c[0] + ' reproduces its function on all ' + c[1].rows + ' rows',
        c[1].bad === 0, c[1].bad + ' wrong of ' + c[1].rows);
    chk(c[0] + ' uses exactly ' + c[2] + ' gates', c[1].gates === c[2], String(c[1].gates));
  });

  chk('the full adder uses nine gates', FA.gates === 9, String(FA.gates));
  chk('the full adder gives both outputs correctly on all eight rows', faBad === 0, String(faBad));
  chk('the sum alone needs eight gates', V.faSum.gates === 8, String(V.faSum.gates));
  chk('the carry alone needs six gates', V.faCarry.gates === 6, String(V.faCarry.gates));
  chk('the pair costs less than the two separately', FA.gates < V.faSum.gates + V.faCarry.gates,
      FA.gates + ' against ' + (V.faSum.gates + V.faCarry.gates));
  chk('the saving from sharing is five gates',
      (V.faSum.gates + V.faCarry.gates) - FA.gates === 5);

  /* the lower bounds */
  chk('two NOR gates cannot build AB + C without complements',
      LB.abcNor2.depth === null && LB.abcNor2.proven, JSON.stringify(LB.abcNor2.levels));
  chk('two NOR gates cannot build AB + C even with complements',
      LB.abcNor2c.depth === null && LB.abcNor2c.proven, JSON.stringify(LB.abcNor2c.levels));
  chk('two NAND gates cannot build AB + C without complements',
      LB.abcNand2.depth === null && LB.abcNand2.proven, JSON.stringify(LB.abcNand2.levels));
  chk('zero gates cannot build not-a AND c', LB.acNor0.depth === null && LB.acNor0.proven);
  chk('two NAND gates cannot build XOR without complements',
      LB.xor2two.depth === null && LB.xor2two.proven);
  chk('two NAND gates cannot build XOR even with complements',
      LB.xor2twoC.depth === null && LB.xor2twoC.proven);

  /* the wide-gate arithmetic */
  chk('a three-input NAND is three two-input gates', wideNand(3) === 3, String(wideNand(3)));
  chk('a four-input NAND is five two-input gates', wideNand(4) === 5, String(wideNand(4)));
  chk('a three-input AND is four two-input gates', wideAnd(3) === 4, String(wideAnd(3)));
  chk('three products plus a three-input combine is six gates', 3 + wideNand(3) === 6,
      String(3 + wideNand(3)));
  chk('the six-gate count is three verified product gates plus the verified combine',
      V.abcd.gates === 3 && V.nand3.gates === 3);

  /* the two previous-year functions, as the papers state them */
  chk('the 2017 map is not-a AND c on all sixteen rows',
      KM2017.reduce(function (acc, row) { return acc + row.join(''); }, '').length === 16);
  chk('the 2019 minterm set equals B XNOR D on all sixteen rows',
      (function () {
        var bad = 0, r;
        for (r = 0; r < 16; r++) {
          var b = (r >> 2) & 1, d = r & 1;
          if (((T.g2019 >> r) & 1) !== ((b === d) ? 1 : 0)) bad++;
        }
        return bad === 0;
      })(), 'checked on all sixteen rows');
  chk('the 2019 function needs three NOR gates with complements', V.bdnor.gates === 3);
  chk('the 2017 function needs one NOR gate with complements', V.acNor.gates === 1);
  chk('the 2009 function needs three NOR gates', V.abcNor.gates === 3);

  /* the searches themselves stayed inside their budgets */
  chk('the exhaustive two-variable searches never hit the budget',
      !SYN.NAND0.budgetHit && !SYN.NAND1.budgetHit && !SYN.NOR0.budgetHit && !SYN.NOR1.budgetHit);

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

  /* ======================================================================
     LAYER 3 - RENDER
     ====================================================================== */

  function stage(p, n) {
    var s = Math.floor(K.clamp01(p) * n);
    return s >= n ? n - 1 : s;
  }

  function box(x, y, w, h, label, sub, tone) {
    var fill = tone === 'bad' ? PAL.invalidDim : tone === 'good' ? PAL.accentDim
             : tone === 'warn' ? PAL.warnDim : PAL.surface2;
    var stroke = tone === 'bad' ? PAL.invalid : tone === 'good' ? PAL.accent
             : tone === 'warn' ? PAL.warn : PAL.border;
    P.rect(x, y, w, h, { fill: fill, stroke: stroke, sw: 1.2, radius: 7 });
    if (label) P.text(x + w / 2, y + h / 2 - (sub ? 9 : 0), label,
      { size: 13, bold: true, align: 'center', base: 'middle', color: PAL.ink });
    if (sub) P.text(x + w / 2, y + h / 2 + 9, sub,
      { size: 11, align: 'center', base: 'middle', color: PAL.dim });
  }

  function title(s, sub) {
    P.text(28, 20, s, { size: 16, bold: true, color: PAL.ink });
    if (sub) P.text(28, 42, sub, { size: 11.5, color: PAL.dim });
  }

  function foot(s, y) {
    P.text(28, y || 446, s, { size: 11, color: PAL.faint });
  }

  /* a labelled gate row: gate number, op, two operand labels, output label */
  function gateRow(x, y, w, num, op, a, b, out, tone) {
    var fill = tone === 'good' ? PAL.accentDim : tone === 'warn' ? PAL.warnDim : PAL.surface;
    var stroke = tone === 'good' ? PAL.accent : tone === 'warn' ? PAL.warn : PAL.border;
    P.rect(x, y, w, 22, { fill: fill, stroke: stroke, sw: 1, radius: 5 });
    P.text(x + 10, y + 11, 'g' + num, { size: 10.5, mono: true, base: 'middle', color: PAL.faint });
    P.text(x + 38, y + 11, op, { size: 11, mono: true, bold: true, base: 'middle', color: PAL.ink });
    P.text(x + 96, y + 11, '(' + a + ', ' + b + ')', { size: 10.5, mono: true, base: 'middle', color: PAL.dim });
    P.text(x + w - 10, y + 11, out, { size: 11, mono: true, bold: true, align: 'right', base: 'middle', color: PAL.accent });
  }

  /* a row of truth-table cells with a header */
  function cells(x, y, cw, ch, vals, head, tone) {
    var i;
    for (i = 0; i < vals.length; i++) {
      var fill = tone === 'good' ? PAL.accentDim : PAL.surface;
      P.rect(x + i * cw, y, cw, ch, { fill: fill, stroke: PAL.border, sw: 0.9 });
      P.text(x + i * cw + cw / 2, y + ch / 2, vals[i],
        { size: 12, mono: true, align: 'center', base: 'middle', color: PAL.ink });
      if (head && head[i] !== undefined) {
        P.text(x + i * cw + cw / 2, y - 6, head[i],
          { size: 9.5, mono: true, align: 'center', base: 'bottom', color: PAL.faint });
      }
    }
  }

  /* a 4x4 Karnaugh map, with a set of highlighted cell coordinates */
  function kMap(x, y, cw, ch, grid, marks, tone) {
    var order = ['00', '01', '11', '10'], i, j;
    for (i = 0; i < 4; i++) {
      P.text(x - 8, y + i * ch + ch / 2, order[i], { size: 10, mono: true, align: 'right', base: 'middle', color: PAL.faint });
      P.text(x + i * cw + cw / 2, y - 8, order[i], { size: 10, mono: true, align: 'center', base: 'bottom', color: PAL.faint });
    }
    for (i = 0; i < 4; i++) {
      for (j = 0; j < 4; j++) {
        var marked = marks && marks.some(function (m) { return m[0] === i && m[1] === j; });
        var fill = marked ? (tone === 'warn' ? PAL.warnDim : PAL.accentDim) : PAL.surface;
        var stroke = marked ? (tone === 'warn' ? PAL.warn : PAL.accent) : PAL.border;
        P.rect(x + j * cw, y + i * ch, cw, ch, { fill: fill, stroke: stroke, sw: marked ? 1.6 : 0.9 });
        P.text(x + j * cw + cw / 2, y + i * ch + ch / 2, String(grid[i][j]),
          { size: 12, mono: true, align: 'center', base: 'middle',
            color: marked ? (tone === 'warn' ? PAL.warn : PAL.accent) : PAL.ink, bold: marked });
      }
    }
  }

  /* --- 1. why --------------------------------------------------------- */
  function drawWhy(p) {
    var s = stage(p, 4);
    title('One function, three honest answers', 'F = AB + C, and what it costs under three stated cost models');

    /* the function and its eight-row table */
    P.text(28, 78, 'F = A&middot;B + C', { size: 15, mono: true, bold: true, color: PAL.ink });
    var rows = [], i;
    for (i = 0; i < 8; i++) rows.push(String((T.abc >> i) & 1));
    var heads = ['0', '1', '2', '3', '4', '5', '6', '7'];
    P.text(196, 74, 'row', { size: 9.5, mono: true, color: PAL.faint });
    cells(224, 66, 24, 22, heads, null, null);
    P.text(196, 102, 'F', { size: 10, mono: true, color: PAL.faint });
    cells(224, 94, 24, 22, rows, null, 'good');

    var cards = [
      ['three', 'two-input NAND', 'only A, B, C supplied', V.abcNand3.gates, 'good'],
      ['two', 'two-input NAND', 'A, B, C and their complements', V.abcNand2.gates, 'good'],
      ['three', 'two-input NOR', 'A, B, C and their complements', V.abcNor.gates, null]
    ];
    for (i = 0; i < cards.length; i++) {
      if (s < i) continue;
      var x = 28 + i * 286, c = cards[i];
      box(x, 150, 268, 96, '', '', c[4]);
      P.text(x + 134, 176, c[3] + (c[3] === 1 ? ' gate' : ' gates'), { size: 26, bold: true, align: 'center', base: 'middle', color: PAL.accent });
      P.text(x + 134, 202, c[1], { size: 11.5, mono: true, align: 'center', base: 'middle', color: PAL.ink });
      P.text(x + 134, 222, c[2], { size: 10.5, align: 'center', base: 'middle', color: PAL.dim });
    }
    if (s >= 3) {
      P.text(28, 274, 'All three numbers are computed by this page: the first two by a construction re-simulated', { size: 11, color: PAL.dim });
      P.text(28, 292, 'on all eight rows, the third by an exhaustive search that found no two-gate circuit.', { size: 11, color: PAL.dim });
      P.text(28, 318, 'Nothing about F changed between the columns. Only the cost model did.', { size: 11.5, bold: true, color: PAL.ink });
    }
    foot('the same function, three numbers: a gate count is not a property of a function');
  }

  /* --- 2. model ------------------------------------------------------- */
  function drawModel(p) {
    var s = stage(p, 4);
    title('A gate count is a property of a cost model', 'four settings decide the answer before any Boolean algebra happens');

    var items = [
      ['1  gate type', 'NAND or NOR. They are not interchangeable in cost.'],
      ['2  fan-in limit', 'a k-input NAND is ' + wideNand(3) + ' gates at k=3, ' + wideNand(4) + ' at k=4'],
      ['3  supplied signals', 'literals only, or complements as well'],
      ['4  reuse', 'a signal computed once may feed many gates']
    ];
    var i;
    for (i = 0; i < 4; i++) {
      if (s < i) continue;
      var x = 28 + (i % 2) * 432, y = 66 + Math.floor(i / 2) * 62;
      box(x, y, 412, 52, '', '', i === 2 ? 'warn' : null);
      P.text(x + 14, y + 18, items[i][0], { size: 12, bold: true, color: PAL.ink });
      P.text(x + 14, y + 36, items[i][1], { size: 11, color: PAL.dim });
    }

    if (s >= 2) {
      P.text(28, 200, 'Building a wide gate from two-input gates', { size: 12.5, bold: true, color: PAL.ink });
      var hdr = ['inputs k', '2', '3', '4', '5'];
      var nandRow = ['NAND', String(wideNand(2)), String(wideNand(3)), String(wideNand(4)), String(wideNand(5))];
      var andRow = ['AND', String(wideAnd(2)), String(wideAnd(3)), String(wideAnd(4)), String(wideAnd(5))];
      cells(28, 218, 78, 24, hdr, null, null);
      P.text(28, 262, 'NAND', { size: 10.5, mono: true, color: PAL.dim });
      cells(106, 250, 78, 24, nandRow.slice(1), null, 'warn');
      P.text(28, 296, 'AND', { size: 10.5, mono: true, color: PAL.dim });
      cells(106, 284, 78, 24, andRow.slice(1), null, null);
      P.text(430, 262, '2k &minus; 3', { size: 13, mono: true, bold: true, color: PAL.warn });
      P.text(430, 296, '2k &minus; 2', { size: 13, mono: true, bold: true, color: PAL.ink });
    }

    if (s >= 3) {
      P.text(28, 336, 'Supplied signals: one gate buys ' + ONEGATE.lit + ' functions with literals only, and ' + ONEGATE.comp + ' with the complements free.', { size: 11.5, color: PAL.ink });
      P.text(28, 358, 'Reuse: the full adder below is ' + FA.gates + ' gates, not ' + (V.faSum.gates + V.faCarry.gates) + '.', { size: 11.5, color: PAL.ink });
      P.text(28, 380, 'Every count on this page states all four settings before it states a number.', { size: 11, color: PAL.dim });
    }
    foot('state the model, then the number');
  }

  /* --- 3. onegate ----------------------------------------------------- */
  function drawOneGate(p) {
    var s = stage(p, 4);
    title('What one gate buys, and what two cannot', 'a single NAND is &not;(p&middot;q); a single NOR is &not;(p+q); nothing else');

    if (s >= 0) {
      P.text(28, 70, 'NAND(p, q) = &not;(p&middot;q)', { size: 13, mono: true, bold: true, color: PAL.ink });
      P.text(28, 92, 'NOR(p, q)  = &not;(p+q)', { size: 13, mono: true, bold: true, color: PAL.ink });
      P.text(28, 116, 'so a function is one gate exactly when it is the negation of a product, or of a sum, of two supplied signals', { size: 10.5, color: PAL.dim });
    }

    if (s >= 1) {
      P.text(28, 150, 'One gate away, of the sixteen functions of two variables', { size: 12.5, bold: true, color: PAL.ink });
      var rows1 = [
        ['literals only (x, y)', String(ONEGATE.lit), '&not;x, &not;y, &not;(x&middot;y)'],
        ['complements supplied', String(ONEGATE.comp), 'nine, including x+y and x&oplus;y']
      ];
      var i;
      for (i = 0; i < 2; i++) {
        var y = 168 + i * 30;
        P.text(28, y + 12, rows1[i][0], { size: 11, color: PAL.dim });
        P.text(250, y + 12, rows1[i][1], { size: 14, mono: true, bold: true, color: PAL.accent });
        P.text(300, y + 12, rows1[i][2], { size: 10.5, mono: true, color: PAL.ink });
      }
    }

    if (s >= 2) {
      P.text(28, 240, 'All sixteen functions of two variables, by the minimum number of two-input NAND gates', { size: 12.5, bold: true, color: PAL.ink });
      P.text(28, 258, 'literals only; exhaustive search, so these are minima', { size: 10.5, color: PAL.faint });
      var d, x = 40, maxH = 64, labels = ['0', '1', '2', '3', '4', '5'];
      for (d = 0; d < 6; d++) {
        var n = DIST.hist[d] || 0;
        var h = n === 0 ? 0 : (n / 4) * maxH;
        var bx = x + d * 78;
        P.rect(bx, 356 - h, 54, h, { fill: n ? PAL.accentDim : PAL.surface2, stroke: PAL.accent, sw: 1.2, radius: 4 });
        P.text(bx + 27, 348 - h, String(n), { size: 12, bold: true, align: 'center', base: 'bottom', color: PAL.ink });
        P.text(bx + 27, 372, labels[d], { size: 11, mono: true, align: 'center', base: 'top', color: PAL.dim });
      }
      P.text(40, 396, 'gates needed', { size: 10.5, color: PAL.faint });
    }

    if (s >= 3) {
      P.text(560, 300, 'one function', { size: 10.5, color: PAL.faint });
      P.text(560, 320, 'needs five', { size: 10.5, color: PAL.faint });
      P.text(560, 340, 'and it is x&odot;y', { size: 12, mono: true, bold: true, color: PAL.warn });
      P.text(560, 362, 'x&oplus;y needs four', { size: 11, mono: true, color: PAL.ink });
    }
    foot('four of the sixteen need nothing at all: x, y, and the two constants are not free, they are wires only when supplied');
  }

  /* --- 4. table ------------------------------------------------------- */
  function drawTable(p) {
    var s = stage(p, 4);
    title('Every two-variable function, and what it costs', 'four cost models, ten named functions, every cell an exhaustive minimum');

    var cols = ['NAND, literals', 'NAND, compl.', 'NOR, literals', 'NOR, compl.'];
    var x0 = 230, cw = 128, y0 = 96, rh = 30, i, j;
    for (j = 0; j < 4; j++) {
      P.text(x0 + j * cw + cw / 2, y0 - 10, cols[j], { size: 10, align: 'center', base: 'bottom', color: PAL.dim });
    }
    var shown = 10;
    for (i = 0; i < shown; i++) {
      if (s < 1 && i > 4) break;
      var key = FN2_KEYS[i], y = y0 + i * rh;
      var hi = (key === 'x&middot;y' && s >= 1) || ((key === 'x&oplus;y' || key === 'x&odot;y') && s >= 2);
      if (hi) P.rect(20, y, 866, rh, { fill: PAL.warnDim, stroke: 'rgba(0,0,0,0)', sw: 0 });
      P.text(28, y + rh / 2, key, { size: 11.5, mono: true, base: 'middle', color: PAL.ink });
      for (j = 0; j < 4; j++) {
        var c = cost(key, MODELS[j]);
        P.rect(x0 + j * cw, y + 2, cw, rh - 4, { fill: PAL.surface, stroke: PAL.border, sw: 0.8 });
        P.text(x0 + j * cw + cw / 2, y + rh / 2, c === null ? '&mdash;' : String(c),
          { size: 13, mono: true, bold: true, align: 'center', base: 'middle',
            color: (key === 'x&oplus;y' || key === 'x&odot;y') && j === 1 ? PAL.warn : PAL.ink });
      }
    }

    if (s >= 1) {
      P.text(28, 402, 'AND: two NAND gates without complements, two with; three NOR gates, or one with the complements free.', { size: 11, color: PAL.ink });
    }
    if (s >= 2) {
      P.text(28, 422, 'XOR: four NAND gates without complements, three with. The familiar four assumes you were not given them.', { size: 11, bold: true, color: PAL.warn });
    }
    foot('a count without the four settings is not an answer; it is a number');
  }

  /* --- 5. xor --------------------------------------------------------- */
  function drawXor(p) {
    var s = stage(p, 4);
    title('XOR: four gates, or three', 'the same function under two supplied-signal settings');

    if (s >= 0) {
      P.text(28, 66, 'x&oplus;y = x&middot;&not;y + &not;x&middot;y', { size: 13, mono: true, bold: true, color: PAL.ink });
      P.text(28, 88, 'the search proves four without complements and three with; two is impossible in both', { size: 10.5, color: PAL.dim });
    }

    if (s >= 1) {
      P.text(28, 118, 'literals only: four NAND gates', { size: 12, bold: true, color: PAL.ink });
      gateRow(28, 130, 400, 1, 'NAND', 'x', 'y', '&not;(xy)', 'warn');
      gateRow(28, 156, 400, 2, 'NAND', 'x', 'g1', '&not;x&middot;g1', null);
      gateRow(28, 182, 400, 3, 'NAND', 'y', 'g1', '&not;y&middot;g1', null);
      gateRow(28, 208, 400, 4, 'NAND', 'g2', 'g3', 'x&oplus;y', 'good');
    }

    if (s >= 2) {
      P.text(470, 118, 'complements supplied: three', { size: 12, bold: true, color: PAL.ink });
      gateRow(470, 130, 400, 1, 'NAND', '&not;x', 'y', '&not;(&not;x&middot;y)', 'good');
      gateRow(470, 156, 400, 2, 'NAND', 'x', '&not;y', '&not;(x&middot;&not;y)', 'good');
      gateRow(470, 182, 400, 3, 'NAND', 'g1', 'g2', 'x&oplus;y', 'good');
      P.text(470, 214, 'the two inverters are no longer built', { size: 10.5, color: PAL.dim });
    }

    if (s >= 3) {
      P.rect(28, 246, 842, 54, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
      P.text(40, 266, 'Both circuits were simulated on all four rows and both give 0110.', { size: 11.5, color: PAL.ink });
      P.text(40, 288, 'The saving is exactly the two inverters the left-hand circuit has to build for itself.', { size: 11.5, color: PAL.ink });
      P.text(28, 330, 'The same distinction moves XNOR from five NAND gates to three, and XOR from five NOR gates to three.', { size: 11.5, bold: true, color: PAL.warn });
      P.text(28, 356, 'So: four gates when you must build the complements, three when they arrive built.', { size: 12, bold: true, color: PAL.ink });
    }
    foot('a gate count changes when the supplied signals change, and the function does not');
  }

  /* --- 6. sop --------------------------------------------------------- */
  function drawSop(p) {
    var s = stage(p, 4);
    title('From a sum of products: one NAND per term', 'and then every gate wider than the limit is expanded before it is counted');

    if (s >= 0) {
      P.text(28, 68, 'each product term &rarr; one NAND gate (the gate already contains the inversion)', { size: 11.5, color: PAL.ink });
      P.text(28, 90, 'the final combine &rarr; one NAND gate, or 2p &minus; 3 gates when the sum has p terms and p &gt; 2', { size: 11.5, color: PAL.ink });
    }

    if (s >= 1) {
      P.text(28, 124, 'AB + CD, two products', { size: 12, bold: true, color: PAL.ink });
      gateRow(28, 136, 400, 1, 'NAND', 'A', 'B', '&not;(AB)', null);
      gateRow(28, 162, 400, 2, 'NAND', 'C', 'D', '&not;(CD)', null);
      gateRow(28, 188, 400, 3, 'NAND', 'g1', 'g2', 'AB + CD', 'good');
      P.text(28, 222, V.abcd.gates + ' gates, verified on all ' + V.abcd.rows + ' rows', { size: 11, bold: true, color: PAL.accent });
    }

    if (s >= 2) {
      P.text(470, 124, 'AB + CD + EF, three products', { size: 12, bold: true, color: PAL.ink });
      gateRow(470, 136, 400, 1, 'NAND', 'A', 'B', '&not;(AB)', null);
      gateRow(470, 160, 400, 2, 'NAND', 'C', 'D', '&not;(CD)', null);
      gateRow(470, 184, 400, 3, 'NAND', 'E', 'F', '&not;(EF)', null);
      gateRow(470, 208, 400, 4, 'NAND', 'g1', 'g2', 'AB + CD', null);
      gateRow(470, 232, 400, 5, 'NAND', 'g4', 'g4', '&not;(AB+CD)', null);
      gateRow(470, 256, 400, 6, 'NAND', 'g5', 'g3', 'AB+CD+EF', 'good');
      P.text(470, 290, '6 gates: three products plus ' + wideNand(3) + ' for the three-input combine', { size: 11, bold: true, color: PAL.accent });
    }

    if (s >= 3) {
      P.rect(28, 316, 842, 62, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 6 });
      P.text(40, 338, 'Counting the final gate as one would have given four, and four is wrong.', { size: 12, bold: true, color: PAL.warn });
      P.text(40, 360, 'Three products, six gates. The wide gate is where the count goes wrong.', { size: 11.5, color: PAL.ink });
    }
    foot('fewer product terms is not automatically fewer gates; and a wide gate is never one gate');
  }

  /* --- 7. adder ------------------------------------------------------- */
  function drawAdder(p) {
    var s = stage(p, 4);
    title('Two outputs share gates: the full adder in nine', 'sum = A&oplus;B&oplus;C, carry = the majority of A, B, C');

    if (s >= 0) {
      P.text(28, 66, 'built separately: ' + V.faSum.gates + ' + ' + V.faCarry.gates + ' = ' + (V.faSum.gates + V.faCarry.gates) + ' gates', { size: 12, color: PAL.dim });
      P.text(28, 88, 'built together:  ' + FA.gates + ' gates', { size: 14, bold: true, color: PAL.accent });
      P.text(28, 110, 'the saving is ' + ((V.faSum.gates + V.faCarry.gates) - FA.gates) + ' gates, all of it shared subexpressions', { size: 11, color: PAL.dim });
    }

    if (s >= 1) {
      gateRow(28, 130, 420, 1, 'NAND', 'A', 'B', '&not;AB', 'good');
      gateRow(28, 154, 420, 2, 'NAND', 'A', 'g1', 'x2', null);
      gateRow(28, 178, 420, 3, 'NAND', 'B', 'g1', 'x3', null);
      gateRow(28, 202, 420, 4, 'NAND', 'g2', 'g3', 'A&oplus;B', 'good');
      gateRow(28, 226, 420, 5, 'NAND', 'g4', 'C', '&not;(g4&middot;C)', 'good');
    }
    if (s >= 2) {
      gateRow(28, 250, 420, 6, 'NAND', 'g4', 'g5', 'x6', null);
      gateRow(28, 274, 420, 7, 'NAND', 'C', 'g5', 'x7', null);
      gateRow(28, 298, 420, 8, 'NAND', 'g6', 'g7', 'SUM', 'good');
      gateRow(28, 322, 420, 9, 'NAND', 'g1', 'g5', 'CARRY', 'good');
    }

    if (s >= 2) {
      P.text(470, 130, 'what is shared', { size: 12, bold: true, color: PAL.ink });
      P.text(470, 152, 'g1 = &not;AB', { size: 11, mono: true, color: PAL.accent });
      P.text(470, 172, 'g4 = A&oplus;B', { size: 11, mono: true, color: PAL.accent });
      P.text(470, 198, 'the carry reuses both and', { size: 10.5, color: PAL.dim });
      P.text(470, 216, 'adds two gates of its own', { size: 10.5, color: PAL.dim });
      P.text(470, 242, 'the sum reuses g4 and', { size: 10.5, color: PAL.dim });
      P.text(470, 260, 'adds four gates of its own', { size: 10.5, color: PAL.dim });
    }

    if (s >= 3) {
      P.rect(470, 284, 400, 66, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
      P.text(482, 304, 'All nine gates were evaluated on all eight rows:', { size: 11, color: PAL.ink });
      P.text(482, 324, 'both outputs correct on every one (' + faBad + ' errors).', { size: 11, color: PAL.ink });
      P.text(482, 344, 'Nine is a verified construction, not a proved minimum.', { size: 10.5, color: PAL.warn });
    }
    foot('two outputs are cheaper together than apart, because a computed signal may be reused');
  }

  /* --- 8. pyq2009 ----------------------------------------------------- */
  function drawPyq2009(p) {
    var s = stage(p, 4);
    title('GATE CSE 2009: AB + C in three NOR gates', 'and the search that shows two cannot do it');

    if (s >= 0) {
      P.rect(28, 60, 842, 30, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 5 });
      P.text(40, 79, 'Q6, one mark: "the minimum number of gates required to implement (AB + C) if we have to use only 2-input NOR gates"', { size: 10.5, mono: true, color: PAL.ink });
      P.text(28, 112, 'official key: 3', { size: 12, bold: true, color: PAL.accent });
    }

    if (s >= 1) {
      P.text(28, 142, 'distribute: AB + C = (A + C)&middot;(B + C)', { size: 13, mono: true, bold: true, color: PAL.ink });
      P.text(28, 164, 'a product of two sums is exactly what NOR-NOR builds, by De Morgan', { size: 10.5, color: PAL.dim });
      var hd = ['A', 'B', 'C', 'AB+C', 'pr'];
      var rows = [], i;
      for (i = 0; i < 8; i++) {
        var A = (i >> 2) & 1, B = (i >> 1) & 1, C = i & 1;
        rows.push([String(A), String(B), String(C), String(((T.abc >> i) & 1)),
                   String(((A || C) && (B || C)) ? 1 : 0)]);
      }
      for (i = 0; i < 5; i++) {
        P.text(28 + i * 54, 190, hd[i], { size: 9.5, mono: true, color: PAL.faint });
      }
      for (i = 0; i < 8; i++) {
        cells(28, 198 + i * 20, 54, 18, rows[i], null, i === 5 ? 'good' : null);
      }
      P.text(300, 216, 'row 5 agrees', { size: 10, color: PAL.faint });
    }

    if (s >= 2) {
      P.text(470, 142, 'three NOR gates', { size: 12, bold: true, color: PAL.ink });
      gateRow(470, 154, 400, 1, 'NOR', 'A', 'C', '&not;(A+C)', null);
      gateRow(470, 180, 400, 2, 'NOR', 'B', 'C', '&not;(B+C)', null);
      gateRow(470, 206, 400, 3, 'NOR', 'g1', 'g2', '(A+C)(B+C)', 'good');
      P.text(470, 238, 'no complement of any input is needed', { size: 10.5, color: PAL.dim });
    }

    if (s >= 3) {
      P.rect(470, 258, 400, 62, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2, radius: 6 });
      P.text(482, 278, 'two gates: impossible.', { size: 12, bold: true, color: PAL.accent });
      P.text(482, 298, LB.abcNor2.states + ' two-gate NOR circuits searched with literals only,', { size: 10.5, color: PAL.ink });
      P.text(482, 314, LB.abcNor2c.states + ' with the complements supplied. None works.', { size: 10.5, color: PAL.ink });
      P.text(470, 340, 'so three is the minimum, and the complements', { size: 10.5, color: PAL.dim });
      P.text(470, 356, 'clause does not change it here.', { size: 10.5, color: PAL.dim });
    }
    foot('the algebra was the easy part; the clause "only 2-input NOR" is what makes the count three');
  }

  /* --- 9. pyq2017 ----------------------------------------------------- */
  function drawPyq2017(p) {
    var s = stage(p, 4);
    title('GATE CSE 2017 Set 1: a map, a don&rsquo;t care, one gate', 'Q21, numerical, one mark: 2-input NOR only, complements available');

    if (s >= 0) {
      P.rect(28, 60, 842, 30, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 5 });
      P.text(40, 79, 'official key: 1', { size: 10.5, mono: true, color: PAL.accent });
      P.text(150, 79, 'the map collapses to two literals, and one of them is a complement', { size: 10.5, color: PAL.dim });
    }

    if (s >= 1) {
      kMap(90, 132, 34, 28, KM2017, [[0, 2], [0, 3], [1, 2], [1, 3]], null);
      P.text(90, 268, 'rows: ab, columns: cd', { size: 9.5, color: PAL.faint });
      P.text(270, 140, 'the marked four-cell group', { size: 11, color: PAL.ink });
      P.text(270, 160, 'covers every 1 in the map', { size: 11, color: PAL.ink });
      P.text(270, 186, 'a falls out as 0, c as 1', { size: 11, color: PAL.dim });
    }

    if (s >= 2) {
      P.text(270, 222, 'F = &not;a &middot; c', { size: 15, mono: true, bold: true, color: PAL.accent });
      P.text(270, 248, '= &not;(a + &not;c)', { size: 12, mono: true, color: PAL.ink });
      P.text(270, 268, 'one 2-input NOR gate, because &not;c is supplied', { size: 10.5, color: PAL.dim });
    }

    if (s >= 3) {
      gateRow(470, 290, 400, 1, 'NOR', 'a', '&not;c', '&not;a&middot;c', 'good');
      P.rect(28, 300, 400, 62, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 6 });
      P.text(40, 320, 'without the complements clause', { size: 11.5, bold: true, color: PAL.warn });
      P.text(40, 340, '&not;a would have to be built: two gates, not one.', { size: 10.5, color: PAL.ink });
      P.text(28, 386, 'the published key of one depends on the clause, not on the algebra', { size: 11, color: PAL.dim });
    }
    foot('a don&rsquo;t care is spent only where the input never occurs; here the question said it never occurs');
  }

  /* --- 10. pyq2019 ---------------------------------------------------- */
  function drawPyq2019(p) {
    var s = stage(p, 4);
    title('GATE CSE 2019: three NOR gates', 'f = &Sigma;(0, 2, 5, 7, 8, 10, 13, 15), 2-input NOR only, complements available');

    if (s >= 0) {
      P.rect(28, 60, 842, 30, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 5 });
      P.text(40, 79, 'official key: 3', { size: 10.5, mono: true, color: PAL.accent });
      P.text(150, 79, 'a four-variable question that is really a two-variable one', { size: 10.5, color: PAL.dim });
    }

    if (s >= 1) {
      kMap(90, 132, 34, 28, KM2019,
           [[0, 0], [0, 3], [1, 1], [1, 2], [2, 1], [2, 2], [3, 0], [3, 3]], null);
      P.text(90, 268, 'rows: AB, columns: CD', { size: 9.5, color: PAL.faint });
      P.text(270, 140, 'the eight ones form two pairs', { size: 11, color: PAL.ink });
      P.text(270, 160, 'and only B and D survive', { size: 11, color: PAL.ink });
      P.text(270, 186, 'A and C never matter', { size: 11, color: PAL.dim });
    }

    if (s >= 2) {
      P.text(270, 222, 'f = B &odot; D', { size: 15, mono: true, bold: true, color: PAL.accent });
      P.text(270, 248, '= B&middot;&not;D + &not;B&middot;D complement', { size: 11, mono: true, color: PAL.ink });
      P.text(270, 268, 'a two-variable function inside a four-variable question', { size: 10.5, color: PAL.dim });
    }

    if (s >= 2) {
      gateRow(470, 290, 400, 1, 'NOR', '&not;B', 'D', 'B&middot;&not;D', 'good');
      gateRow(470, 316, 400, 2, 'NOR', 'B', '&not;D', '&not;B&middot;D', 'good');
      gateRow(470, 342, 400, 3, 'NOR', 'g1', 'g2', 'B&odot;D', 'good');
    }

    if (s >= 3) {
      P.rect(28, 300, 400, 74, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 6 });
      P.text(40, 320, 'the folklore table says four', { size: 11.5, bold: true, color: PAL.warn });
      P.text(40, 340, 'for XNOR in NOR gates, because that', { size: 10.5, color: PAL.ink });
      P.text(40, 356, 'table assumes no complements.', { size: 10.5, color: PAL.ink });
      P.text(28, 396, 'this page&rsquo;s exhaustive search gives four without complements and three with', { size: 10.5, color: PAL.dim });
    }
    foot('read the complements clause before you look up the table');
  }

  /* --- 11. procedure -------------------------------------------------- */
  function drawProcedure(p) {
    var s = stage(p, 4);
    title('The procedure, in the order that avoids the trap', 'four steps, and the clause read first');

    var steps = [
      ['1  read the clause', 'gate type, fan-in, complements, reuse'],
      ['2  simplify, then test one gate', 'is F the negation of a product, or of a sum?'],
      ['3  match the form', 'sum of products &rarr; NAND-NAND; product of sums &rarr; NOR-NOR'],
      ['4  count, expand wide gates, simulate', 'a k-input gate is 2k &minus; 3 two-input gates']
    ];
    var i;
    for (i = 0; i < 4; i++) {
      if (s < i) break;
      var y = 66 + i * 58;
      box(28, y, 560, 48, '', '', i === 0 ? 'warn' : i === 3 ? 'good' : null);
      P.text(42, y + 19, steps[i][0], { size: 12.5, bold: true, color: PAL.ink });
      P.text(42, y + 37, steps[i][1], { size: 10.5, color: PAL.dim });
    }

    if (s >= 1) {
      P.text(620, 76, 'the branch at step 2', { size: 11.5, bold: true, color: PAL.ink });
      P.text(620, 98, 'F is one literal &rarr; 0 gates', { size: 10.5, mono: true, color: PAL.accent });
      P.text(620, 116, 'F is &not;(pq) or &not;(p+q) &rarr; 1', { size: 10.5, mono: true, color: PAL.accent });
      P.text(620, 134, 'otherwise &rarr; steps 3 and 4', { size: 10.5, mono: true, color: PAL.dim });
    }

    if (s >= 3) {
      P.rect(28, 312, 842, 62, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
      P.text(40, 332, 'The two habits that save a mark:', { size: 11.5, bold: true, color: PAL.ink });
      P.text(40, 352, 'expand every gate wider than the limit before counting it, and reuse a signal instead of rebuilding it.', { size: 11, color: PAL.ink });
      P.text(28, 396, 'The three previous-year questions on this page all turned on step 1, not on step 3.', { size: 11, color: PAL.dim });
    }
    foot('the arithmetic is the easy part; the clause decides the answer');
  }

  /* --- 12. hold ------------------------------------------------------- */
  function drawHold(p) {
    var s = stage(p, 4);
    title('One screen to hold', 'what a gate count is, and the numbers worth carrying');

    if (s >= 0) {
      P.rect(28, 62, 842, 44, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2, radius: 6 });
      P.text(40, 82, 'A gate count is a property of a cost model, not of a function.', { size: 13, bold: true, color: PAL.accent });
      P.text(40, 98, 'gate type &middot; fan-in limit &middot; supplied signals &middot; reuse', { size: 10.5, color: PAL.dim });
    }

    if (s >= 1) {
      var rows = [
        ['AND', String(cost('x&middot;y', 'NAND0')), String(cost('x&middot;y', 'NOR0')), String(cost('x&middot;y', 'NOR1'))],
        ['OR', String(cost('x+y', 'NAND0')), String(cost('x+y', 'NOR0')), String(cost('x+y', 'NOR1'))],
        ['XOR', String(cost('x&oplus;y', 'NAND0')), String(cost('x&oplus;y', 'NOR0')), String(cost('x&oplus;y', 'NOR1'))],
        ['XNOR', String(cost('x&odot;y', 'NAND0')), String(cost('x&odot;y', 'NOR0')), String(cost('x&odot;y', 'NOR1'))]
      ];
      P.text(28, 132, 'gates', { size: 10, color: PAL.faint });
      P.text(140, 132, 'NAND, literals', { size: 10, color: PAL.faint });
      P.text(330, 132, 'NOR, literals', { size: 10, color: PAL.faint });
      P.text(520, 132, 'NOR, complements', { size: 10, color: PAL.faint });
      var i;
      for (i = 0; i < 4; i++) {
        var y = 142 + i * 26;
        P.text(28, y + 10, rows[i][0], { size: 12, mono: true, bold: true, color: PAL.ink });
        P.text(170, y + 10, rows[i][1], { size: 12, mono: true, color: PAL.ink });
        P.text(360, y + 10, rows[i][2], { size: 12, mono: true, color: PAL.ink });
        P.text(550, y + 10, rows[i][3], { size: 12, mono: true, color: PAL.accent });
      }
    }

    if (s >= 2) {
      P.rect(640, 132, 230, 130, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 6 });
      P.text(652, 152, 'two habits', { size: 11.5, bold: true, color: PAL.warn });
      P.text(652, 174, 'expand a wide gate', { size: 10.5, color: PAL.ink });
      P.text(652, 192, 'before counting it', { size: 10.5, color: PAL.ink });
      P.text(652, 216, 'reuse a shared signal', { size: 10.5, color: PAL.ink });
      P.text(652, 234, 'instead of rebuilding it', { size: 10.5, color: PAL.ink });
    }

    if (s >= 3) {
      P.text(28, 264, 'three previous-year questions on this page: 2009, 2017 Set 1, 2019', { size: 11.5, color: PAL.ink });
      P.text(28, 286, 'all three turned on a clause in the question, not on the algebra', { size: 11.5, bold: true, color: PAL.ink });
      P.text(28, 312, 'every number above is computed by this page, and the model reports ' + PASSED + ' of ' + CHECKS.length + ' checks', { size: 11, color: PAL.dim });
    }
    foot('state the model, then the number; and simulate before you answer');
  }

  var DRAW = {
    why: drawWhy, model: drawModel, onegate: drawOneGate, table: drawTable,
    xor: drawXor, sop: drawSop, adder: drawAdder, pyq2009: drawPyq2009,
    pyq2017: drawPyq2017, pyq2019: drawPyq2019, procedure: drawProcedure, hold: drawHold
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
          var wrap = holder;
          if (!wrap) return;
          var scale = Math.min(1, wrap.clientWidth / W);
          var cv = wrap.querySelector('canvas');
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
    EXPECT: EXPECT, DIST: DIST, ONEGATE: ONEGATE, ONEGATE_NOR: ONEGATE_NOR,
    V: V, FA: FA, LB: LB, KM2017: KM2017, KM2019: KM2019,
    PASSED: PASSED, TOTAL: CHECKS.length,
    ALL_PASS: PASSED === CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
