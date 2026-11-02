/* ==========================================================================
   multi-event-independence - model, validation, render.

   Layer 1  model      : a finite uniform space as a list of atoms; an event as a
                         sorted list of atom indices; the product test as integer
                         arithmetic (|A and B| x |space| = |A| x |B|); mutual and
                         pairwise independence over every subset of size two or
                         more; unions; conditional probabilities; and the exact
                         counts over all events of a four-point space.
   Layer 2  validation : every number quoted in a caption, a card or on the
                         canvas is recomputed here. The two counterexamples are
                         tested in both directions, the conditions count is
                         computed by enumerating subsets, mutual independence is
                         checked to imply pairwise over seeded random families,
                         and the two previous-year items are recomputed from
                         their own definitions.
   Layer 3  render     : reads the model; never re-derives a number.
   Layer 4  timeline   : in timeline.js - the only source of time.

   No p5.brush: every mark is a cell, a label or a number that has to be read
   exactly.
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

  /* ---------- exact arithmetic on integers only ---------- */

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }

  /* an event is a sorted list of atom indices */
  function ev(list) {
    var out = [], i;
    for (i = 0; i < list.length; i++) if (out.indexOf(list[i]) < 0) out.push(list[i]);
    out.sort(function (a, b) { return a - b; });
    return out;
  }

  function inter(a, b) {
    var out = [], i;
    for (i = 0; i < a.length; i++) if (b.indexOf(a[i]) >= 0) out.push(a[i]);
    return out;
  }

  function union(a, b) { return ev(a.concat(b)); }

  function unionAll(fam) {
    var u = [], i;
    for (i = 0; i < fam.length; i++) u = union(u, fam[i]);
    return u;
  }

  /* the product test, in integers: |A and B| / |S| = |A|/|S| x |B|/|S| */
  function indep(a, b, size) { return inter(a, b).length * size === a.length * b.length; }

  /* every subset of the family of size two or more must pass */
  function subsetsOfSize2plus(fam) {
    var out = [], i, j, k, n = fam.length;
    for (k = 2; k <= n; k++) {
      var idx = [];
      for (i = 0; i < k; i++) idx.push(i);
      for (;;) {
        var one = [];
        for (i = 0; i < k; i++) one.push(fam[idx[i]]);
        out.push(one);
        /* next combination */
        i = k - 1;
        while (i >= 0 && idx[i] === n - k + i) i--;
        if (i < 0) break;
        idx[i]++;
        for (j = i + 1; j < k; j++) idx[j] = idx[j - 1] + 1;
      }
    }
    return out;
  }

  function mutual(fam, size) {
    var subs = subsetsOfSize2plus(fam), i, s;
    for (i = 0; i < subs.length; i++) {
      s = subs[i];
      var u = s[0], k;
      for (k = 1; k < s.length; k++) u = inter(u, s[k]);
      var prod = 1, i2;
      for (i2 = 0; i2 < s.length; i2++) prod *= s[i2].length;
      if (u.length * Math.pow(size, s.length - 1) !== prod) return false;
    }
    return true;
  }

  function pairwise(fam, size) {
    var i, j;
    for (i = 0; i < fam.length; i++) {
      for (j = i + 1; j < fam.length; j++) if (!indep(fam[i], fam[j], size)) return false;
    }
    return true;
  }

  function tripleProduct(fam, size) {
    var u = inter(inter(fam[0], fam[1]), fam[2]);
    return u.length * size * size === fam[0].length * fam[1].length * fam[2].length;
  }

  /* a probability as a reduced fraction, for display only */
  function frac(num, den) {
    if (num === 0) return '0';
    var g = gcd(num, den);
    return (num / g) + '/' + (den / g);
  }

  function pStr(a, size) { return frac(a.length, size); }

  /* conditional probability of a given b, as a string; null when P(b) = 0 */
  function condStr(a, b, size) {
    var ab = inter(a, b);
    if (!b.length) return null;
    return frac(ab.length, b.length);
  }

  /* ---------- the spaces ---------- */

  /* Bernstein's four tickets. The labels are strings, not integers. */
  var PARITY = {
    name: 'Bernstein four tickets',
    atoms: ['112', '121', '211', '222'],
    size: 4,
    A1: ev([0, 1]),      /* 1 in place 1: 112, 121 */
    A2: ev([0, 2]),      /* 1 in place 2: 112, 211 */
    A3: ev([1, 2])       /* 1 in place 3: 121, 211 */
  };

  /* two dice: 36 cells, index i*6+j for first die i+1 and second die j+1 */
  var DICE = (function () {
    var atoms = [], i, j;
    for (i = 1; i <= 6; i++) for (j = 1; j <= 6; j++) atoms.push(i + ',' + j);
    function pick(pred) {
      var out = [];
      for (i = 0; i < 36; i++) if (pred(Math.floor(i / 6) + 1, (i % 6) + 1)) out.push(i);
      return out;
    }
    return {
      name: 'two dice',
      atoms: atoms,
      size: 36,
      A: pick(function (x) { return x <= 3; }),          /* first die 1,2,3 */
      B: pick(function (x) { return x >= 3 && x <= 5; }), /* first die 3,4,5 */
      C: pick(function (x, y) { return x + y === 9; })     /* faces sum to 9 */
    };
  })();

  /* two fair bits and their parity: atoms 000, 011, 101, 110 */
  var BITS = {
    name: 'two bits and their parity',
    atoms: ['000', '011', '101', '110'],
    size: 4,
    X: ev([2, 3]),   /* first bit 1: 101, 110 */
    Y: ev([1, 3]),   /* second bit 1: 011, 110 */
    Z: ev([1, 2])    /* parity bit 1: 011, 101 */
  };

  /* the four-point space, used for the exact counts */
  var P4 = { name: 'four points', atoms: ['1', '2', '3', '4'], size: 4 };

  var P4_EVENTS = (function () {
    var out = [], mask;
    for (mask = 0; mask < 16; mask++) {
      var one = [], i;
      for (i = 0; i < 4; i++) if (mask & (1 << i)) one.push(i);
      out.push(ev(one));
    }
    return out;
  })();

  /* two coins: the verified GATE CSE 2023 item */
  var COINS = {
    name: 'two coins',
    atoms: ['HH', 'HT', 'TH', 'TT'],
    size: 4,
    A: ev([0]),        /* head on both throws: HH */
    B: ev([0, 1]),     /* head on the first throw: HH, HT */
    C: ev([0, 2])      /* head on the second throw: HH, TH */
  };

  /* the verified GATE CSE 2024 Set 1 item: permutations of 1..4 */
  var PERMS = (function () {
    var out = [], cur = [], used = [];
    function rec() {
      if (cur.length === 4) { out.push(cur.slice()); return; }
      for (var i = 1; i <= 4; i++) {
        if (used[i]) continue;
        used[i] = 1; cur.push(i); rec(); cur.pop(); used[i] = 0;
      }
    }
    rec();
    function before(list, a, b) { return list.indexOf(a) < list.indexOf(b); }
    var X = [], Y = [], XY = [], k;
    for (k = 0; k < out.length; k++) {
      if (before(out[k], 1, 2)) X.push(k);
      if (before(out[k], 3, 4)) Y.push(k);
      if (before(out[k], 1, 2) && before(out[k], 3, 4)) XY.push(k);
    }
    return { name: 'permutations of 1..4', size: out.length, perms: out, X: ev(X), Y: ev(Y), XY: ev(XY) };
  })();

  /* ---------- derived numbers, computed once ---------- */

  var N = {};

  /* parity box */
  N.parityPairs = [
    { label: 'A1 and A2', a: PARITY.A1, b: PARITY.A2 },
    { label: 'A1 and A3', a: PARITY.A1, b: PARITY.A3 },
    { label: 'A2 and A3', a: PARITY.A2, b: PARITY.A3 }
  ].map(function (row) {
    row.inter = inter(row.a, row.b).length;
    row.product = frac(row.a.length * row.b.length, PARITY.size * PARITY.size);
    row.own = frac(row.inter, PARITY.size);
    row.pass = indep(row.a, row.b, PARITY.size);
    return row;
  });
  N.parityTriple = inter(inter(PARITY.A1, PARITY.A2), PARITY.A3).length;
  N.parityTripleOwn = frac(N.parityTriple, PARITY.size);
  N.parityTripleProduct = frac(PARITY.A1.length * PARITY.A2.length * PARITY.A3.length,
    PARITY.size * PARITY.size * PARITY.size);
  N.parityPairwise = pairwise([PARITY.A1, PARITY.A2, PARITY.A3], PARITY.size);
  N.parityMutual = mutual([PARITY.A1, PARITY.A2, PARITY.A3], PARITY.size);
  N.parityUnion = unionAll([PARITY.A1, PARITY.A2, PARITY.A3]).length;
  N.parityUnionFormula = 1 - Math.pow(1 - 0.5, 3);

  /* dice */
  N.dicePairs = [
    { label: 'A and B', a: DICE.A, b: DICE.B },
    { label: 'A and C', a: DICE.A, b: DICE.C },
    { label: 'B and C', a: DICE.B, b: DICE.C }
  ].map(function (row) {
    row.inter = inter(row.a, row.b).length;
    row.own = frac(row.inter, DICE.size);
    row.product = frac(row.a.length * row.b.length, DICE.size * DICE.size);
    row.pass = indep(row.a, row.b, DICE.size);
    return row;
  });
  N.diceTriple = inter(inter(DICE.A, DICE.B), DICE.C).length;
  N.diceTripleOwn = frac(N.diceTriple, DICE.size);
  N.diceTripleProduct = frac(DICE.A.length * DICE.B.length * DICE.C.length,
    DICE.size * DICE.size * DICE.size);
  N.dicePairwise = pairwise([DICE.A, DICE.B, DICE.C], DICE.size);
  N.diceTripleHolds = tripleProduct([DICE.A, DICE.B, DICE.C], DICE.size);
  N.diceUnion = unionAll([DICE.A, DICE.B, DICE.C]).length;
  N.diceUnionFormula = 1 - (1 - DICE.A.length / 36) * (1 - DICE.B.length / 36) * (1 - DICE.C.length / 36);

  /* bits */
  N.bitsPairs = [
    { label: 'X and Y', a: BITS.X, b: BITS.Y },
    { label: 'X and Z', a: BITS.X, b: BITS.Z },
    { label: 'Y and Z', a: BITS.Y, b: BITS.Z }
  ].map(function (row) {
    row.inter = inter(row.a, row.b).length;
    row.own = frac(row.inter, BITS.size);
    row.product = frac(row.a.length * row.b.length, BITS.size * BITS.size);
    row.pass = indep(row.a, row.b, BITS.size);
    return row;
  });
  N.bitsTriple = inter(inter(BITS.X, BITS.Y), BITS.Z).length;
  N.bitsPairwise = pairwise([BITS.X, BITS.Y, BITS.Z], BITS.size);
  N.bitsMutual = mutual([BITS.X, BITS.Y, BITS.Z], BITS.size);
  N.bitsGivenZ = ev([1, 2]);                                  /* the rows with Z = 1 */
  N.bitsCondX = condStr(BITS.X, N.bitsGivenZ, BITS.size);      /* 1/2 */
  N.bitsCondY = condStr(BITS.Y, N.bitsGivenZ, BITS.size);      /* 1/2 */
  N.bitsCondJoint = condStr(inter(BITS.X, BITS.Y), N.bitsGivenZ, BITS.size); /* 0/2 -> 0 */
  N.bitsCondProduct = frac(1, 4);

  /* exact counts on the four-point space */
  N.p4Events = P4_EVENTS.length;
  N.p4OrderedIndependent = (function () {
    var c = 0, i, j;
    for (i = 0; i < P4_EVENTS.length; i++) {
      for (j = 0; j < P4_EVENTS.length; j++) if (indep(P4_EVENTS[i], P4_EVENTS[j], P4.size)) c++;
    }
    return c;
  })();
  N.p4UnorderedIndependent = (function () {
    var seen = {}, c = 0, i, j;
    for (i = 0; i < P4_EVENTS.length; i++) {
      for (j = i; j < P4_EVENTS.length; j++) {
        if (!indep(P4_EVENTS[i], P4_EVENTS[j], P4.size)) continue;
        var key = P4_EVENTS[i].join('.') + '|' + P4_EVENTS[j].join('.');
        if (!seen[key]) { seen[key] = 1; c++; }
      }
    }
    return c;
  })();
  N.p4IndependentOfAll = P4_EVENTS.filter(function (a) {
    return P4_EVENTS.every(function (b) { return indep(a, b, P4.size); });
  });
  N.p4PairwiseTriples = 0;
  N.p4PairwiseNotMutual = [];
  (function () {
    var i, j, k, fam;
    for (i = 0; i < P4_EVENTS.length; i++) {
      for (j = i + 1; j < P4_EVENTS.length; j++) {
        for (k = j + 1; k < P4_EVENTS.length; k++) {
          fam = [P4_EVENTS[i], P4_EVENTS[j], P4_EVENTS[k]];
          if (!pairwise(fam, P4.size)) continue;
          N.p4PairwiseTriples++;
          if (!mutual(fam, P4.size)) N.p4PairwiseNotMutual.push(fam);
        }
      }
    }
  })();
  N.p4TwoElementEvents = P4_EVENTS.filter(function (a) { return a.length === 2; }).length;
  N.p4TriplesOfTwoElement = N.p4TwoElementEvents * (N.p4TwoElementEvents - 1) * (N.p4TwoElementEvents - 2) / 6;
  N.p4DisjointPositive = (function () {
    var c = 0, i, j;
    for (i = 0; i < P4_EVENTS.length; i++) {
      for (j = 0; j < P4_EVENTS.length; j++) {
        if (P4_EVENTS[i].length && P4_EVENTS[j].length && !inter(P4_EVENTS[i], P4_EVENTS[j]).length) c++;
      }
    }
    return c;
  })();

  /* the two previous-year items */
  N.coinsAB = indep(COINS.A, COINS.B, COINS.size);
  N.coinsAC = indep(COINS.A, COINS.C, COINS.size);
  N.coinsBC = indep(COINS.B, COINS.C, COINS.size);
  N.coinsABOwn = frac(inter(COINS.A, COINS.B).length, COINS.size);
  N.coinsABProduct = frac(COINS.A.length * COINS.B.length, COINS.size * COINS.size);
  N.coinsBCOwn = frac(inter(COINS.B, COINS.C).length, COINS.size);
  N.coinsBCProduct = frac(COINS.B.length * COINS.C.length, COINS.size * COINS.size);
  N.coinsCond = condStr(COINS.B, COINS.C, COINS.size);
  N.coinsPB = pStr(COINS.B, COINS.size);

  N.permX = PERMS.X.length;
  N.permY = PERMS.Y.length;
  N.permXY = PERMS.XY.length;
  N.permIndep = indep(PERMS.X, PERMS.Y, PERMS.size);

  /* the number of conditions for n events */
  N.conditions = {};
  (function () {
    for (var n = 2; n <= 7; n++) N.conditions[n] = Math.pow(2, n) - n - 1;
  })();

  /* ======================================================================
     LAYER 2 - VALIDATION
     ====================================================================== */

  var CHECKS = [];
  function check(name, pass, detail) {
    CHECKS.push({ name: name, pass: !!pass, detail: detail || '' });
  }

  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* 1. the parity box is pairwise independent and not mutual */
  check('Bernstein box: all three pairs satisfy the product rule',
    N.parityPairwise && N.parityPairs.every(function (r) { return r.pass; }),
    N.parityPairs.map(function (r) { return r.label + ' ' + r.own + ' vs ' + r.product; }).join('; '));
  check('Bernstein box: the triple fails, 0 against 1/8',
    N.parityTriple === 0 && N.parityTripleOwn !== N.parityTripleProduct && !N.parityMutual,
    'triple intersection ' + N.parityTripleOwn + ' against product ' + N.parityTripleProduct);
  check('Bernstein box: the union is 3/4 while the at-least-one formula gives 7/8',
    N.parityUnion === 3 && N.parityUnionFormula === 7 / 8,
    'union ' + frac(N.parityUnion, 4) + ' against formula ' + frac(7, 8));
  check('Bernstein box: every atom holds an even number of ones',
    PARITY.atoms.every(function (s) {
      var c = 0, i; for (i = 0; i < 3; i++) if (s.charAt(i) === '1') c++; return c % 2 === 0;
    }), PARITY.atoms.join(' '));

  /* 2. the dice box is the reverse failure */
  check('two dice: every pair fails the product rule',
    !N.dicePairwise && N.dicePairs.every(function (r) { return !r.pass; }),
    N.dicePairs.map(function (r) { return r.label + ' ' + r.own + ' vs ' + r.product; }).join('; '));
  check('two dice: the triple product holds, 1/36 against 1/36',
    N.diceTripleHolds && N.diceTripleOwn === N.diceTripleProduct,
    'triple ' + N.diceTripleOwn + ' against product ' + N.diceTripleProduct);
  check('two dice: the union is 31/36 while the formula gives 28/36',
    N.diceUnion === 31 && Math.abs(N.diceUnionFormula - 28 / 36) < 1e-12,
    'union ' + N.diceUnion + '/36 against formula ' + Math.round(N.diceUnionFormula * 36) + '/36');
  check('two dice: sizes 18, 18 and 4 out of 36',
    DICE.A.length === 18 && DICE.B.length === 18 && DICE.C.length === 4,
    DICE.A.length + ', ' + DICE.B.length + ', ' + DICE.C.length);
  check('two dice: the cells summing to nine are the four the caption names',
    DICE.C.map(function (i) { return DICE.atoms[i]; }).join(' ') === '3,6 4,5 5,4 6,3',
    DICE.C.map(function (i) { return DICE.atoms[i]; }).join(' '));

  /* 3. the parity bits */
  check('parity bits: all three pairs satisfy the product rule',
    N.bitsPairwise, N.bitsPairs.map(function (r) { return r.label + ' ' + r.own; }).join('; '));
  check('parity bits: the triple fails, never 111',
    !N.bitsMutual && N.bitsTriple === 0, 'triple intersection has ' + N.bitsTriple + ' rows');
  check('parity bits: every atom satisfies z = x xor y',
    BITS.atoms.every(function (s) {
      return (Number(s.charAt(0)) ^ Number(s.charAt(1))) === Number(s.charAt(2));
    }), BITS.atoms.join(' '));
  check('parity bits: given Z the two bits are dependent, 0 against 1/4',
    N.bitsCondJoint === '0',
    'joint given Z is ' + N.bitsCondJoint + ', product of conditionals is ' + N.bitsCondProduct);
  check('parity bits: each bit given Z is one half',
    N.bitsCondX === '1/2' && N.bitsCondY === '1/2',
    N.bitsCondX + ' and ' + N.bitsCondY);

  /* 4. mutual independence always implies pairwise, on seeded random families */
  (function () {
    var rnd = mulberry32(20271102), tried = 0, bad = 0, t;
    for (t = 0; t < 400; t++) {
      var size = 4 + 2 * Math.floor(rnd() * 3);          /* 4, 6 or 8 atoms */
      var fam = [], k, j;
      for (k = 0; k < 3; k++) {
        var one = [];
        for (j = 0; j < size; j++) if (rnd() < 0.5) one.push(j);
        fam.push(ev(one));
      }
      tried++;
      if (mutual(fam, size) && !pairwise(fam, size)) bad++;
    }
    check('mutual independence implies pairwise independence on ' + tried + ' seeded random families',
      bad === 0, bad + ' counterexamples found');
  })();

  /* 5. the condition count is 2^n - n - 1, computed by enumerating subsets */
  (function () {
    var ok = true, detail = [], n;
    for (n = 2; n <= 7; n++) {
      var fam = [], i;
      for (i = 0; i < n; i++) fam.push([i]);
      var counted = subsetsOfSize2plus(fam).length;
      var formula = Math.pow(2, n) - n - 1;
      if (counted !== formula) ok = false;
      detail.push(n + ':' + counted);
    }
    check('the number of conditions is 2^n - n - 1 for n = 2..7', ok, detail.join(' '));
  })();

  /* 6. the complement of an event preserves independence */
  (function () {
    var ok = true, i, j;
    for (i = 0; i < P4_EVENTS.length; i++) {
      for (j = 0; j < P4_EVENTS.length; j++) {
        if (!indep(P4_EVENTS[i], P4_EVENTS[j], P4.size)) continue;
        var comp = [], k;
        for (k = 0; k < P4.size; k++) if (P4_EVENTS[j].indexOf(k) < 0) comp.push(k);
        if (!indep(P4_EVENTS[i], comp, P4.size)) ok = false;
      }
    }
    check('complementing either event preserves independence, over every pair on four points', ok);
  })();

  /* 7. an event of probability zero or one is independent of everything */
  (function () {
    var ok = true, i;
    for (i = 0; i < P4_EVENTS.length; i++) {
      var a = P4_EVENTS[i];
      if (a.length !== 0 && a.length !== P4.size) continue;
      if (!P4_EVENTS.every(function (b) { return indep(a, b, P4.size); })) ok = false;
    }
    check('the empty event and the whole space are independent of every event', ok,
      'and exactly ' + N.p4IndependentOfAll.length + ' of the sixteen events qualify');
  })();

  /* 8. disjointness with positive probability means dependence */
  check('every ordered pair of disjoint non-empty events on four points is dependent',
    N.p4DisjointPositive === 50, N.p4DisjointPositive + ' such ordered pairs, none independent');

  /* 9. the exact counts on the four-point space */
  check('four points: sixteen events', N.p4Events === 16, String(N.p4Events));
  check('four points: 84 of 256 ordered pairs are independent',
    N.p4OrderedIndependent === 84, N.p4OrderedIndependent + ' of ' + (16 * 16));
  check('four points: 43 unordered pairs are independent', N.p4UnorderedIndependent === 43);
  check('four points: exactly two events are independent of every other event',
    N.p4IndependentOfAll.length === 2,
    N.p4IndependentOfAll.map(function (a) { return '[' + a.join(',') + ']'; }).join(' '));
  check('four points: 46 pairwise-independent triples, 8 of them not mutual',
    N.p4PairwiseTriples === 46 && N.p4PairwiseNotMutual.length === 8,
    N.p4PairwiseTriples + ' pairwise, ' + N.p4PairwiseNotMutual.length + ' not mutual');
  check('four points: the eight are triples of two-element events, out of 20',
    N.p4PairwiseNotMutual.every(function (f) {
      return f.every(function (a) { return a.length === 2; });
    }) && N.p4TriplesOfTwoElement === 20,
    'triples of two-element events: ' + N.p4TriplesOfTwoElement);

  /* 10. the verified 2023 item, recomputed */
  check('GATE CSE 2023: A and B fail, 1/4 against 1/8',
    !N.coinsAB && N.coinsABOwn === '1/4' && N.coinsABProduct === '1/8',
    N.coinsABOwn + ' against ' + N.coinsABProduct);
  check('GATE CSE 2023: A and C fail the same way', !N.coinsAC);
  check('GATE CSE 2023: B and C pass, 1/4 against 1/4',
    N.coinsBC && N.coinsBCOwn === N.coinsBCProduct, N.coinsBCOwn + ' against ' + N.coinsBCProduct);
  check('GATE CSE 2023: the conditional of B given C equals the probability of B',
    N.coinsCond === N.coinsPB, N.coinsCond + ' against ' + N.coinsPB);
  check('an event of positive probability contained in another is dependent on it',
    !N.coinsAB && !N.coinsAC);

  /* 11. the verified 2024 item, recomputed */
  check('GATE CSE 2024 Set 1: 24 permutations, 12 with 1 before 2, 12 with 3 before 4, 6 with both',
    PERMS.size === 24 && N.permX === 12 && N.permY === 12 && N.permXY === 6,
    N.permX + ', ' + N.permY + ', ' + N.permXY);
  check('GATE CSE 2024 Set 1: the two events are independent, 1/4 against 1/4',
    N.permIndep, frac(N.permXY, 24) + ' against ' + frac(N.permX * N.permY, 24 * 24));

  /* 12. the at-least-one formula is exact under mutual independence */
  (function () {
    /* atoms of the three-bit cube, and a cylinder set on one coordinate */
    var atoms = [], i, j, k;
    for (i = 0; i < 2; i++) for (j = 0; j < 2; j++) for (k = 0; k < 2; k++) {
      atoms.push([i, j, k]);
    }
    function cyl(coord, allowed) {
      var out = [];
      for (var t = 0; t < atoms.length; t++) if (allowed.indexOf(atoms[t][coord]) >= 0) out.push(t);
      return ev(out);
    }
    var cases = [
      [[{ c: 0, a: [1] }, { c: 1, a: [1] }, { c: 2, a: [1] }]],
      [[{ c: 0, a: [1] }, { c: 1, a: [0, 1] }, { c: 2, a: [1] }]],
      [[{ c: 0, a: [0] }, { c: 1, a: [0] }, { c: 2, a: [1] }]],
      [[{ c: 0, a: [1] }, { c: 1, a: [1] }, { c: 2, a: [0, 1] }]]
    ];
    var ok = true, detail = [], t, q;
    for (t = 0; t < cases.length; t++) {
      var spec = cases[t][0], fam = [], size = 8, m;
      for (m = 0; m < 3; m++) fam.push(cyl(spec[m].c, spec[m].a));
      var mu = mutual(fam, size);
      var u = unionAll(fam).length / size;
      var f = 1, n;
      for (n = 0; n < 3; n++) f *= (1 - fam[n].length / size);
      f = 1 - f;
      if (!mu || Math.abs(u - f) > 1e-12) ok = false;
      detail.push(frac(unionAll(fam).length, size) + '=' + frac(Math.round(f * 8), 8));
    }
    /* and a family that is only pairwise independent, where the formula fails */
    var bad = [PARITY.A1, PARITY.A2, PARITY.A3];
    var formulaBad = 1 - Math.pow(1 - 0.5, 3);
    var truthBad = unionAll(bad).length / 4;
    check('the at-least-one formula is exact on mutually independent families', ok, detail.join(' '));
    check('and it is not exact on a merely pairwise independent family',
      Math.abs(formulaBad - truthBad) > 1e-12, 'formula ' + formulaBad + ' against truth ' + truthBad);
  })();

  /* 13. the two failures point in opposite directions */
  check('the at-least-one formula errs in both directions across the two spaces',
    N.parityUnionFormula > N.parityUnion / 4 && N.diceUnionFormula < N.diceUnion / 36,
    'too big on the tickets, too small on the dice');

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
    P.text(28, 444, s, { size: 11, color: PAL.faint });
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

  /* a cell of a sample space: a rectangle with a label, and a tone */
  function cell(x, y, w, h, label, o) {
    o = o || {};
    var fill = o.tone === 'a' ? PAL.accentDim : o.tone === 'b' ? PAL.warnDim
             : o.tone === 'c' ? PAL.invalidDim : o.tone === 'both' ? PAL.accentDim
             : o.tone === 'none' ? PAL.surface2 : PAL.surface;
    var stroke = o.tone === 'a' ? PAL.accent : o.tone === 'b' ? PAL.warn
               : o.tone === 'c' ? PAL.invalid : o.tone === 'both' ? PAL.accent
               : PAL.border;
    P.rect(x, y, w, h, { fill: fill, stroke: stroke, sw: o.sw || 1.1, radius: 4 });
    if (label) centre(x + w / 2, y + h / 2, label, { size: o.size || 12, mono: true, color: PAL.ink });
  }

  /* a verdict: the word, and the colour, never the colour alone */
  function verdict(x, y, ok, word) {
    line(x, y, word || (ok ? 'ok' : 'no'), {
      size: 11.5, bold: true, mono: true, color: ok ? PAL.valid : PAL.invalid
    });
  }

  /* --- 1. two events on a grid ----------------------------------------- */
  function drawTwo(p) {
    var s = stage(p, 4);
    title('Independence of two events, read off a grid',
      'two fair coins: A is a head on the first toss, B a head on the second');

    var gx = 90, gy = 132, cw = 100, ch = 64;
    centre(gx + cw, 114, 'second: H', { size: 11, color: PAL.dim });
    centre(gx + 2 * cw, 114, 'second: T', { size: 11, color: PAL.dim });
    line(84, gy + ch / 2 - 7, 'first: H', { size: 11, color: PAL.dim, align: 'right' });
    line(84, gy + ch + ch / 2 - 7, 'first: T', { size: 11, color: PAL.dim, align: 'right' });

    var aOn = s >= 1, bOn = s >= 2;
    cell(gx, gy, cw, ch, 'HH', { tone: aOn && bOn ? 'both' : aOn ? 'a' : bOn ? 'b' : 'plain' });
    cell(gx + cw, gy, cw, ch, 'HT', { tone: aOn ? 'a' : 'plain' });
    cell(gx, gy + ch, cw, ch, 'TH', { tone: bOn ? 'b' : 'plain' });
    cell(gx + cw, gy + ch, cw, ch, 'TT', { tone: 'plain' });

    line(90, 300, 'A = the top row: HH, HT', { size: 11.5, color: PAL.accent, bold: true });
    line(90, 322, 'B = the left column: HH, TH', { size: 11.5, color: PAL.warn, bold: true });
    line(90, 344, 'A and B meet in the single cell HH', { size: 11.5 });

    if (s >= 3) {
      line(430, 128, 'P(A) = 2/4 = 1/2', { size: 12.5, mono: true });
      line(430, 160, 'P(B) = 2/4 = 1/2', { size: 12.5, mono: true });
      line(430, 192, 'P(A and B) = 1/4', { size: 12.5, mono: true });
      line(430, 224, 'P(A) x P(B) = 1/4', { size: 12.5, mono: true });
      verdict(650, 224, true);
      line(430, 264, '1/4 = 1/4, so A and B are independent', { size: 13, bold: true, color: PAL.accent });
      line(430, 300, 'The product rule is the definition.', { size: 11.5, color: PAL.dim });
      line(430, 322, 'It is checked, never assumed from a picture.', { size: 11.5, color: PAL.dim });
    }
    foot('one overlap against one product: that is the whole test');
  }

  /* --- 2. how many conditions ------------------------------------------- */
  function drawThree(p) {
    var s = stage(p, 4);
    title('Three events ask four questions, not three',
      'the conditions of mutual independence, and how many there are');

    panel(40, 96, 430, 260, { tone: 'info' });
    line(60, 112, 'Three events: every subset of size two or more', { size: 12, bold: true });
    var rows = [
      'P(A and B) = P(A) P(B)',
      'P(A and C) = P(A) P(C)',
      'P(B and C) = P(B) P(C)',
      'P(A and B and C) = P(A) P(B) P(C)'
    ];
    var i;
    for (i = 0; i < 4; i++) {
      var on = s >= 1 && (i < 3 || s >= 2);
      line(60, 148 + i * 32, rows[i], {
        size: 12, mono: true, color: on ? PAL.ink : PAL.faint
      });
      if (on && i < 3) verdict(400, 148 + i * 32, true);
    }
    if (s >= 2) {
      line(60, 288, 'The first three are pairwise independence.', { size: 11.5, color: PAL.dim });
      line(60, 310, 'The fourth is the one pairwise never asks.', { size: 11.5, color: PAL.dim });
    }

    if (s >= 3) {
      panel(500, 96, 360, 260);
      line(520, 112, 'n events need 2^n - n - 1 checks', { size: 12, bold: true });
      centre(560, 152, 'n', { size: 11, mono: true, color: PAL.dim });
      centre(720, 152, 'conditions', { size: 11, mono: true, color: PAL.dim });
      var ns = [2, 3, 4, 5, 6], k;
      for (k = 0; k < ns.length; k++) {
        centre(560, 182 + k * 30, String(ns[k]), { size: 12, mono: true });
        centre(720, 182 + k * 30, String(N.conditions[ns[k]]), { size: 12, mono: true });
      }
      line(520, 336, 'Empty and single events impose nothing.', { size: 10.5, color: PAL.dim });
    }
    foot('pairwise is three of the four conditions, and it is not the same word');
  }

  /* --- 3. Bernstein's four tickets -------------------------------------- */
  function drawParity(p) {
    var s = stage(p, 5);
    title('Four tickets: every pair independent, the triple not',
      'Bernstein, 1928 - the labels are strings of two symbols, not integers');

    var i, x = 50, y = 108, cw = 96, ch = 66;
    for (i = 0; i < 4; i++) {
      var inA1 = PARITY.A1.indexOf(i) >= 0, inA2 = PARITY.A2.indexOf(i) >= 0, inA3 = PARITY.A3.indexOf(i) >= 0;
      var tone = 'plain';
      if (s >= 1 && inA1 && inA2) tone = 'both';
      else if (s >= 1 && inA1) tone = 'a';
      else if (s >= 2 && inA2) tone = 'b';
      else if (s >= 3 && inA3) tone = 'c';
      cell(x + i * 106, y, cw, ch, PARITY.atoms[i], { tone: tone, size: 15 });
    }
    line(50, 192, 'A1 = a one in place 1: 112, 121', { size: 11.5, color: PAL.accent, bold: true });
    if (s >= 2) line(50, 214, 'A2 = a one in place 2: 112, 211', { size: 11.5, color: PAL.warn, bold: true });
    if (s >= 3) line(50, 236, 'A3 = a one in place 3: 121, 211', { size: 11.5, color: PAL.invalid, bold: true });
    if (s >= 3) line(50, 272, 'Each event holds 2 of the 4 tickets: probability 1/2', { size: 11.5 });

    if (s >= 4) {
      line(430, 128, 'A1 with A2', { size: 12, bold: true });
      line(600, 128, r0(), { size: 12, mono: true });
      verdict(800, 128, true);
      line(430, 160, 'A1 with A3', { size: 12, bold: true });
      line(600, 160, r1(), { size: 12, mono: true });
      verdict(800, 160, true);
      line(430, 192, 'A2 with A3', { size: 12, bold: true });
      line(600, 192, r2(), { size: 12, mono: true });
      verdict(800, 192, true);
      line(430, 240, 'A1 A2 A3 together', { size: 12, bold: true, color: PAL.invalid });
      line(600, 240, N.parityTripleOwn + ' vs ' + N.parityTripleProduct, { size: 12, mono: true, color: PAL.invalid });
      verdict(800, 240, false);
    }
    if (s >= 4) {
      line(430, 296, 'The union is 3/4. The at-least-one formula', { size: 11.5, color: PAL.dim });
      line(430, 318, 'would say 7/8, because pairwise is not mutual.', { size: 11.5, color: PAL.dim });
    }
    foot('three equalities and one failure: pairwise independent, not mutually independent');

    function r0() { return N.parityPairs[0].own + ' = ' + N.parityPairs[0].product; }
    function r1() { return N.parityPairs[1].own + ' = ' + N.parityPairs[1].product; }
    function r2() { return N.parityPairs[2].own + ' = ' + N.parityPairs[2].product; }
  }

  /* --- 4. the dice space ------------------------------------------------- */
  function drawDice(p) {
    var s = stage(p, 5);
    title('The reverse failure: the triple holds, no pair does',
      'two dice, thirty-six cells; A is a first die of 1 to 3, B of 3 to 5, C a sum of 9');

    var gx = 74, gy = 128, c = 32, i, j;
    for (i = 1; i <= 6; i++) {
      centre(gx - 12, gy + (i - 1) * c + c / 2, String(i), { size: 10, mono: true, color: PAL.dim, align: 'right' });
      centre(gx + (i - 1) * c + c / 2, gy - 12, String(i), { size: 10, mono: true, color: PAL.dim });
    }
    for (i = 0; i < 36; i++) {
      var r = Math.floor(i / 6), col = i % 6;
      var inA = DICE.A.indexOf(i) >= 0, inB = DICE.B.indexOf(i) >= 0, inC = DICE.C.indexOf(i) >= 0;
      var tone = 'plain';
      if (s >= 1 && inA && inB) tone = 'both';
      else if (s >= 1 && inA) tone = 'a';
      else if (s >= 2 && inB) tone = 'b';
      else if (s >= 3 && inC) tone = 'c';
      cell(gx + col * c, gy + r * c, c - 2, c - 2, '', { tone: tone, sw: 0.9 });
    }
    line(74, 344, 'A: 18 cells.  B: 18 cells.  C: 4 cells.', { size: 11.5 });
    line(74, 366, 'A and B share the row where the first die is 3.', { size: 11, color: PAL.dim });

    if (s >= 4) {
      line(330, 128, 'A and B: ' + N.dicePairs[0].own + ' vs ' + N.dicePairs[0].product, { size: 12, mono: true });
      verdict(800, 128, false);
      line(330, 158, 'A and C: ' + N.dicePairs[1].own + ' vs ' + N.dicePairs[1].product, { size: 12, mono: true });
      verdict(800, 158, false);
      line(330, 188, 'B and C: ' + N.dicePairs[2].own + ' vs ' + N.dicePairs[2].product, { size: 12, mono: true });
      verdict(800, 188, false);
      line(330, 232, 'A B C: ' + N.diceTripleOwn + ' = ' + N.diceTripleProduct, { size: 12, mono: true, color: PAL.valid });
      verdict(800, 232, true);
      line(330, 274, 'The triple product holds while every pair fails.', { size: 12, bold: true });
      line(330, 302, 'The union is 31/36; the formula would say 28/36.', { size: 11.5, color: PAL.dim });
      line(330, 324, 'So checking only the triple is wrong in the other direction.', { size: 11.5, color: PAL.dim });
    }
    foot('the four conditions are separate tests, not a ladder');
  }

  /* --- 5. any two determine the third ----------------------------------- */
  function drawBits(p) {
    var s = stage(p, 4);
    title('Any two determine the third',
      'Z is one exactly when X and Y differ: the parity example');

    line(60, 96, 'X    Y    Z', { size: 12, mono: true, bold: true, color: PAL.dim });
    var i;
    for (i = 0; i < 4; i++) {
      var a = BITS.atoms[i];
      var on = s >= 1;
      line(60, 128 + i * 34, a.charAt(0) + '    ' + a.charAt(1) + '    ' + a.charAt(2), {
        size: 13, mono: true, color: on ? PAL.ink : PAL.faint
      });
    }
    if (s >= 1) line(60, 280, 'Every column is one in two of the four rows.', { size: 11.5, color: PAL.dim });
    if (s >= 1) line(60, 302, 'So each of X, Y, Z has probability 1/2.', { size: 11.5, color: PAL.dim });

    if (s >= 2) {
      line(330, 128, 'X with Y: 2/4 = 1/4', { size: 12, mono: true });
      verdict(800, 128, true);
      line(330, 158, 'X with Z: 2/4 = 1/4', { size: 12, mono: true });
      verdict(800, 158, true);
      line(330, 188, 'Y with Z: 2/4 = 1/4', { size: 12, mono: true });
      verdict(800, 188, true);
      line(330, 226, 'All three pairs pass: pairwise independent.', { size: 12, bold: true, color: PAL.accent });
    }
    if (s >= 3) {
      line(330, 268, 'X and Y and Z together: never 111.', { size: 12, bold: true, color: PAL.invalid });
      line(330, 292, 'Probability 0 against a product of 1/8.', { size: 12, mono: true, color: PAL.invalid });
      line(330, 326, 'Knowing any two bits fixes the third exactly.', { size: 11.5, color: PAL.dim });
      line(330, 348, 'Pairwise independence and total dependence.', { size: 11.5, color: PAL.dim });
    }
    foot('the standard counterexample, and the reason a parity check works');
  }

  /* --- 6. why mutual, not pairwise, licenses multiplication -------------- */
  function drawAtleast(p) {
    var s = stage(p, 5);
    title('Why mutual, and not pairwise, licenses the multiplication',
      'the at-least-one formula, tested against the truth on both spaces');

    line(40, 76, 'P(A or B or C) = 1 - (1-P(A))(1-P(B))(1-P(C))', { size: 14, mono: true, bold: true });

    panel(40, 112, 400, 220, { tone: 'warn' });
    line(60, 128, 'Bernstein four tickets', { size: 12, bold: true });
    line(60, 158, 'formula: 1 - (1/2)^3 = 7/8', { size: 12, mono: true });
    line(60, 186, 'truth:   3/4', { size: 12, mono: true });
    line(60, 216, 'the formula is too big', { size: 12, bold: true, color: PAL.invalid });
    if (s >= 1) line(60, 250, 'Only 222 lies outside the union.', { size: 11, color: PAL.dim });
    if (s >= 1) line(60, 272, 'Three of four tickets, not seven of eight.', { size: 11, color: PAL.dim });
    if (s >= 1) line(60, 300, 'Pairwise independent is what we had.', { size: 11, color: PAL.dim });

    panel(460, 112, 400, 220, { tone: 'warn' });
    line(480, 128, 'The two-dice space', { size: 12, bold: true });
    line(480, 158, 'formula: 1 - (1/2)(1/2)(8/9) = 28/36', { size: 11.5, mono: true });
    line(480, 186, 'truth:   31/36', { size: 12, mono: true });
    line(480, 216, 'the formula is too small', { size: 12, bold: true, color: PAL.invalid });
    if (s >= 2) line(480, 250, 'The cell 6,3 is in C and outside A and B.', { size: 11, color: PAL.dim });
    if (s >= 2) line(480, 272, 'It is counted in the union, not in the formula.', { size: 11, color: PAL.dim });

    if (s >= 3) {
      line(40, 356, 'With mutual independence the formula is exact; with pairwise it is not even a bound.', {
        size: 12.5, bold: true, color: PAL.accent
      });
    }
    if (s >= 4) {
      line(40, 384, 'Never write one minus the product of the complements unless every subset passes.', {
        size: 11.5, color: PAL.dim
      });
    }
    foot('the practical cost of the distinction: a one-line answer becomes wrong');
  }

  /* --- 7. conditional independence --------------------------------------- */
  function drawCond(p) {
    var s = stage(p, 4);
    title('Conditional independence is a different statement',
      'condition the parity example on Z and watch the pair become dependent');

    line(60, 96, 'X    Y    Z', { size: 12, mono: true, bold: true, color: PAL.dim });
    var i;
    for (i = 0; i < 4; i++) {
      var a = BITS.atoms[i];
      var keep = s >= 1 && BITS.Z.indexOf(i) >= 0;
      var drop = s >= 1 && !keep;
      line(60, 128 + i * 34, a.charAt(0) + '    ' + a.charAt(1) + '    ' + a.charAt(2), {
        size: 13, mono: true,
        color: keep ? PAL.accent : drop ? PAL.faint : PAL.ink,
        bold: keep
      });
    }
    if (s >= 1) {
      line(60, 280, 'Keep the rows with Z = 1: 011 and 101.', { size: 11.5, color: PAL.accent, bold: true });
      line(60, 302, 'Two rows remain, each still equally likely.', { size: 11.5, color: PAL.dim });
    }

    if (s >= 2) {
      line(330, 128, 'P(X = 1 | Z = 1) = ' + N.bitsCondX, { size: 12, mono: true });
      line(330, 158, 'P(Y = 1 | Z = 1) = ' + N.bitsCondY, { size: 12, mono: true });
      line(330, 188, 'P(X = 1 and Y = 1 | Z = 1) = ' + N.bitsCondJoint, { size: 12, mono: true });
      line(330, 218, 'the product would be ' + N.bitsCondProduct, { size: 12, mono: true, color: PAL.dim });
      verdict(700, 188, false);
      line(330, 256, 'So X and Y are dependent once Z is known.', { size: 12, bold: true, color: PAL.invalid });
    }
    if (s >= 3) {
      line(330, 300, 'Without Z they were independent: 1/4 = 1/4.', { size: 11.5, color: PAL.dim });
      line(330, 322, 'Conditioning can create dependence, and remove it.', { size: 11.5, color: PAL.dim });
      line(330, 344, 'This is the arithmetic behind explaining away.', { size: 11.5, color: PAL.dim });
    }
    foot('independence and conditional independence imply nothing about each other');
  }

  /* --- 8. the three boundaries ------------------------------------------ */
  function drawDisjoint(p) {
    var s = stage(p, 4);
    title('Disjoint, certain, impossible, and complemented',
      'the three boundaries a distractor is built from');

    panel(40, 100, 262, 240, { tone: 'bad' });
    line(58, 116, 'Disjoint is not independent', { size: 12, bold: true });
    line(58, 148, 'P(A and B) = 0', { size: 11.5, mono: true });
    line(58, 172, 'P(A) P(B) = 1/4', { size: 11.5, mono: true });
    line(58, 196, '0 is not 1/4: dependent', { size: 11.5, mono: true, color: PAL.invalid });
    if (s >= 1) {
      line(58, 232, 'All 50 ordered disjoint pairs', { size: 11, color: PAL.dim });
      line(58, 252, 'with both events non-empty fail.', { size: 11, color: PAL.dim });
      line(58, 272, 'Two events that cannot both', { size: 11, color: PAL.dim });
      line(58, 292, 'happen tell you about each other.', { size: 11, color: PAL.dim });
    }

    panel(320, 100, 262, 240, { tone: 'info' });
    line(338, 116, 'Zero and one are free', { size: 12, bold: true });
    line(338, 148, 'P(A) = 0: 0 = 0 x P(B)', { size: 11.5, mono: true });
    line(338, 172, 'P(A) = 1: P(B) = 1 x P(B)', { size: 11.5, mono: true });
    if (s >= 2) {
      line(338, 206, 'Exactly 2 of the 16 events on', { size: 11, color: PAL.dim });
      line(338, 226, 'four points are independent of', { size: 11, color: PAL.dim });
      line(338, 246, 'every other event: empty and all.', { size: 11, color: PAL.dim });
      line(338, 276, 'Nothing else qualifies, so this', { size: 11, color: PAL.dim });
      line(338, 296, 'is a boundary, not a rule.', { size: 11, color: PAL.dim });
    }

    panel(600, 100, 262, 240, { tone: 'good' });
    line(618, 116, 'Complements are free', { size: 12, bold: true });
    line(618, 148, 'P(A and not B)', { size: 11.5, mono: true });
    line(618, 172, '= P(A) - P(A and B)', { size: 11.5, mono: true });
    line(618, 196, '= P(A) (1 - P(B))', { size: 11.5, mono: true, color: PAL.valid });
    if (s >= 3) {
      line(618, 232, 'That line is the whole proof.', { size: 11, color: PAL.dim });
      line(618, 252, 'So replacing any event by its', { size: 11, color: PAL.dim });
      line(618, 272, 'complement changes no verdict,', { size: 11, color: PAL.dim });
      line(618, 292, 'checked on every pair on four', { size: 11, color: PAL.dim });
      line(618, 312, 'points.', { size: 11, color: PAL.dim });
    }
    foot('keep the three apart: complements are free, disjointness is not');
  }

  /* --- 9. exact counts --------------------------------------------------- */
  function drawCount(p) {
    var s = stage(p, 5);
    title('Counting the independent pairs on a four-point space',
      'sixteen events, every product tested - no formula, just enumeration');

    var gx = 60, gy = 150, c = 70, i;
    for (i = 0; i < 4; i++) {
      cell(gx + (i % 2) * c, gy + Math.floor(i / 2) * c, c - 4, c - 4, String(i + 1), { size: 13 });
    }
    line(60, 306, 'the four atoms, each 1/4', { size: 11, color: PAL.dim });
    line(60, 336, '16 events: each atom in or out', { size: 11, color: PAL.dim });

    if (s >= 1) {
      line(280, 128, '16 events, 2 of them independent of everything', { size: 12, bold: true });
      line(280, 150, 'the empty event and the whole space', { size: 11, color: PAL.dim });
    }
    if (s >= 2) {
      line(280, 190, '84 of 256 ordered pairs are independent', { size: 12, bold: true });
      line(280, 212, '43 if the pair is not ordered', { size: 11, color: PAL.dim });
    }
    if (s >= 3) {
      line(280, 252, '8 of 20 triples of two-element events', { size: 12, bold: true });
      line(280, 274, 'are pairwise independent and not mutual', { size: 12, bold: true });
      line(280, 296, 'each one is Bernstein\'s shape in miniature', { size: 11, color: PAL.dim });
    }
    if (s >= 4) {
      line(280, 336, '50 ordered disjoint pairs, every one dependent', { size: 12, bold: true });
      line(280, 358, 'so disjointness and independence are never the same', { size: 11, color: PAL.dim });
      line(280, 388, 'Enumerate the atoms, enumerate the events, test the products.', { size: 11.5, color: PAL.accent });
    }
    foot('the safest way to answer a counting question about independence');
  }

  /* --- 10. the verified 2023 item ---------------------------------------- */
  function drawPyq(p) {
    var s = stage(p, 4);
    title('GATE CSE 2023: three events built from two coins',
      'A is a head on both throws, B a head on the first, C a head on the second');

    var gx = 60, gy = 150, cw = 96, ch = 62, i;
    for (i = 0; i < 4; i++) {
      var inA = COINS.A.indexOf(i) >= 0, inB = COINS.B.indexOf(i) >= 0, inC = COINS.C.indexOf(i) >= 0;
      var tone = 'plain';
      if (s >= 1 && inA) tone = 'both';
      else if (s >= 1 && inB) tone = 'b';
      else if (s >= 2 && inC) tone = 'c';
      cell(gx + (i % 2) * cw, gy + Math.floor(i / 2) * ch, cw - 4, ch - 4, COINS.atoms[i], { size: 12 });
    }
    line(60, 300, 'A: HH.  B: HH, HT.  C: HH, TH.', { size: 11.5 });
    line(60, 322, 'A sits inside both B and C.', { size: 11, color: PAL.dim });

    if (s >= 1) {
      line(340, 128, 'A and B: ' + N.coinsABOwn + ' vs ' + N.coinsABProduct, { size: 12, mono: true });
      verdict(800, 128, false);
      line(340, 158, 'A and C: ' + N.coinsABOwn + ' vs ' + N.coinsABProduct, { size: 12, mono: true });
      verdict(800, 158, false);
    }
    if (s >= 2) {
      line(340, 198, 'B and C: ' + N.coinsBCOwn + ' = ' + N.coinsBCProduct, { size: 12, mono: true, color: PAL.valid });
      verdict(800, 198, true);
      line(340, 238, 'P(B | C) = ' + N.coinsCond + ' = P(B) = ' + N.coinsPB, { size: 12, mono: true });
      verdict(800, 238, true);
    }
    if (s >= 3) {
      line(340, 286, 'The true statements are the last two.', { size: 12.5, bold: true, color: PAL.accent });
      line(340, 312, 'Independence and the conditional equality', { size: 11, color: PAL.dim });
      line(340, 332, 'are the same arithmetic written two ways.', { size: 11, color: PAL.dim });
      line(340, 364, 'A nested event is always dependent on its container.', { size: 11, color: PAL.dim });
    }
    foot('four statements, four products, on a four-cell space');
  }

  /* --- 11. where the multiplication does the work ------------------------ */
  function drawTransfer(p) {
    var s = stage(p, 3);
    title('Where mutual independence is doing the work',
      'three uses, and the four-step check');

    panel(40, 96, 262, 190, { tone: 'info' });
    line(58, 112, 'Reliability', { size: 12, bold: true });
    line(58, 144, 'series: product of survivals', { size: 11, color: PAL.dim });
    line(58, 166, 'parallel: 1 - product of', { size: 11, color: PAL.dim });
    line(58, 186, 'failure probabilities', { size: 11, color: PAL.dim });
    line(58, 216, 'legal only when the', { size: 11, color: PAL.dim });
    line(58, 236, 'components are declared', { size: 11, color: PAL.dim });
    line(58, 256, 'independent', { size: 11, color: PAL.dim });

    panel(320, 96, 262, 190, { tone: 'info' });
    line(338, 112, 'At least one', { size: 12, bold: true });
    line(338, 144, '1 - (1-p)^n over n trials', { size: 11, mono: true });
    line(338, 176, 'the complement product, so it', { size: 11, color: PAL.dim });
    line(338, 196, 'needs all n events mutually', { size: 11, color: PAL.dim });
    line(338, 216, 'independent, not just pairwise', { size: 11, color: PAL.dim });
    line(338, 246, 'the usual home of this trap', { size: 11, color: PAL.dim });

    panel(600, 96, 262, 190, { tone: 'info' });
    line(618, 112, 'The binomial count', { size: 12, bold: true });
    line(618, 144, 'C(n,k) p^k (1-p)^(n-k)', { size: 11, mono: true });
    line(618, 176, 'each of the n trials independent', { size: 11, color: PAL.dim });
    line(618, 196, 'of the others, so the joint', { size: 11, color: PAL.dim });
    line(618, 216, 'probability factors per trial', { size: 11, color: PAL.dim });
    line(618, 246, 'mutual, again', { size: 11, color: PAL.dim });

    if (s >= 1) {
      panel(40, 306, 822, 116, { tone: 'good' });
      line(58, 320, 'The four-step check', { size: 12, bold: true });
      line(58, 344, '1  count the events        2  list every subset of size two or more', { size: 11.5 });
      line(58, 366, '3  compute both sides of each product        4  never infer from a picture', { size: 11.5 });
      line(58, 390, 'For three events that is four products; for four, eleven.', { size: 11, color: PAL.dim });
    }
    if (s >= 2) {
      line(470, 414, 'Unqualified means the whole list.', { size: 11.5, bold: true, color: PAL.accent });
    }
    foot('mutual independence is the licence for every product rule in probability');
  }

  var DRAW = {
    two: drawTwo, three: drawThree, parity: drawParity, dice: drawDice,
    bits: drawBits, atleast: drawAtleast, cond: drawCond, disjoint: drawDisjoint,
    count: drawCount, pyq2023: drawPyq, transfer: drawTransfer
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
    N: N, PARITY: PARITY, DICE: DICE, BITS: BITS, COINS: COINS, PERMS: PERMS,
    indep: indep, mutual: mutual, pairwise: pairwise, inter: inter, unionAll: unionAll,
    frac: frac, condStr: condStr, subsetsOfSize2plus: subsetsOfSize2plus,
    PASSED: PASSED, TOTAL: CHECKS.length,
    ALL_PASS: PASSED === CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
