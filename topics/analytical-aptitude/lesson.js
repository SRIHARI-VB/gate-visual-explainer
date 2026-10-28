/* ==========================================================================
   analytical-aptitude — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model is enumeration wherever enumeration is possible:
     - a syllogism is checked over all 127 non-empty choices of the seven
       regions of three sets, so "valid" means "true in every surviving model"
       and a refutation is an exhibited model, not an opinion;
     - the four conditional forms are checked over the four rows of a truth
       table, and the number of premise-holding rows is reported;
     - the Euler polynomial is tested by trial division, so the failure at
       n = 40 is found rather than quoted;
     - the series is read from a finite difference table, and the ambiguity of
       the next term is demonstrated by adding a polynomial that vanishes on
       all six given positions;
     - the neighbour-count grid is solved by enumerating all sixteen candidate
       last rows and keeping the ones that reproduce row three.
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

  /* ======================================================================
     LAYER 1 - THE MODEL
     ====================================================================== */

  /* ---------- 1a. syllogism over the seven regions of three sets ----------
     Region index = A + 2B + 4C, so bit 0 is membership of A, bit 1 of B,
     bit 2 of C. A model is the set of regions that contain at least one
     element, written as a 7-bit mask. */

  var REGIONS = [];
  for (var ri = 0; ri < 8; ri++) REGIONS.push({ i: ri, A: !!(ri & 1), B: !!(ri & 2), C: !!(ri & 4) });

  function present(mask) {
    var out = [];
    for (var i = 0; i < 8; i++) if (mask & (1 << i)) out.push(REGIONS[i]);
    return out;
  }

  var PREMISES = [
    { text: 'All A are B', holds: function (rs) { return rs.every(function (r) { return !r.A || r.B; }); } },
    { text: 'No B is C', holds: function (rs) { return rs.every(function (r) { return !(r.B && r.C); }); } }
  ];

  var CONCLUSIONS = [
    { text: 'No A is C', holds: function (rs) { return rs.every(function (r) { return !(r.A && r.C); }); } },
    { text: 'No C is A', holds: function (rs) { return rs.every(function (r) { return !(r.C && r.A); }); } },
    { text: 'Some A is C', holds: function (rs) { return rs.some(function (r) { return r.A && r.C; }); } },
    { text: 'All A are C', holds: function (rs) { return rs.every(function (r) { return !r.A || r.C; }); } },
    { text: 'All C are B', holds: function (rs) { return rs.every(function (r) { return !r.C || r.B; }); } },
    { text: 'Some B is C', holds: function (rs) { return rs.some(function (r) { return r.B && r.C; }); } }
  ];

  function modelsSatisfying(requireAllNonEmpty) {
    var out = [];
    for (var mask = 1; mask < 128; mask++) {
      var rs = present(mask);
      var ok = PREMISES.every(function (p) { return p.holds(rs); });
      if (!ok) continue;
      if (requireAllNonEmpty) {
        var hasA = rs.some(function (r) { return r.A; });
        var hasB = rs.some(function (r) { return r.B; });
        var hasC = rs.some(function (r) { return r.C; });
        if (!hasA || !hasB || !hasC) continue;
      }
      out.push(mask);
    }
    return out;
  }

  var SYL_MODELS = modelsSatisfying(false);
  var SYL_MODELS_NONEMPTY = modelsSatisfying(true);

  /* a witness model: prefer one in which all three classes are occupied, so
     the refutation never rests on an empty class */
  function witness(fn) {
    var best = null;
    for (var k = 0; k < SYL_MODELS.length; k++) {
      var rs = present(SYL_MODELS[k]);
      if (fn(rs)) continue;
      var full = rs.some(function (r) { return r.A; }) &&
                 rs.some(function (r) { return r.B; }) &&
                 rs.some(function (r) { return r.C; });
      if (full) return SYL_MODELS[k];
      if (best === null) best = SYL_MODELS[k];
    }
    return best;
  }

  var SYL = CONCLUSIONS.map(function (c) {
    var holdsEverywhere = SYL_MODELS.every(function (m) { return c.holds(present(m)); });
    var holdsNonEmpty = SYL_MODELS_NONEMPTY.every(function (m) { return c.holds(present(m)); });
    var w = holdsEverywhere ? null : witness(c.holds);
    return {
      text: c.text,
      valid: holdsEverywhere,
      validNonEmpty: holdsNonEmpty,
      witness: w,
      witnessText: w === null ? '' : present(w).map(function (r) {
        var parts = [];
        if (r.A) parts.push('A');
        if (r.B) parts.push('B');
        if (r.C) parts.push('C');
        return parts.length ? parts.join(' and ') : 'outside all three';
      }).join(', ')
    };
  });

  /* ---------- 1b. GATE CSE 2022 Q4 : which offered pair is impossible ---------- */

  var Q4_WORLDS = ['all inquisitive', 'mixed', 'none inquisitive'];
  var Q4_STATEMENTS = {
    1: function (w) { return w === 'all inquisitive'; },
    2: function (w) { return w === 'all inquisitive' || w === 'mixed'; },
    3: function (w) { return w === 'none inquisitive'; },
    4: function (w) { return w === 'mixed' || w === 'none inquisitive'; }
  };
  var Q4_OPTIONS = [
    { letter: 'A', pair: [1, 3] },
    { letter: 'B', pair: [1, 2] },
    { letter: 'C', pair: [2, 4] },
    { letter: 'D', pair: [3, 4] }
  ];
  var Q4 = Q4_OPTIONS.map(function (o) {
    var world = null;
    for (var i = 0; i < Q4_WORLDS.length; i++) {
      var w = Q4_WORLDS[i];
      if (Q4_STATEMENTS[o.pair[0]](w) && Q4_STATEMENTS[o.pair[1]](w)) { world = w; break; }
    }
    return { letter: o.letter, pair: o.pair, possible: world !== null, world: world };
  });
  var Q4_IMPOSSIBLE = Q4.filter(function (o) { return !o.possible; });

  /* ---------- 1c. the four conditional forms ---------- */

  var ROWS = [[true, true], [true, false], [false, true], [false, false]];
  function imp(p, q) { return !p || q; }

  var FORMS = [
    {
      name: 'Modus ponens', schema: 'P, P\u2192Q  \u22a2  Q',
      premises: function (p, q) { return [p, imp(p, q)]; }, concl: function (p, q) { return q; }
    },
    {
      name: 'Modus tollens', schema: '\u00acQ, P\u2192Q  \u22a2  \u00acP',
      premises: function (p, q) { return [!q, imp(p, q)]; }, concl: function (p, q) { return !p; }
    },
    {
      name: 'Affirming the consequent', schema: 'Q, P\u2192Q  \u22a2  P',
      premises: function (p, q) { return [q, imp(p, q)]; }, concl: function (p, q) { return p; }
    },
    {
      name: 'Denying the antecedent', schema: '\u00acP, P\u2192Q  \u22a2  \u00acQ',
      premises: function (p, q) { return [!p, imp(p, q)]; }, concl: function (p, q) { return !q; }
    }
  ].map(function (f) {
    var live = ROWS.filter(function (r) { return f.premises(r[0], r[1]).every(Boolean); });
    var bad = live.filter(function (r) { return f.concl(r[0], r[1]) !== true; });
    return {
      name: f.name, schema: f.schema, valid: live.length > 0 && bad.length === 0,
      liveRows: live.length, badRows: bad.length, live: live, bad: bad
    };
  });

  /* ---------- 1d. the Euler polynomial, tested by trial division ---------- */

  function isPrime(n) {
    if (n < 2) return false;
    for (var d = 2; d * d <= n; d++) if (n % d === 0) return false;
    return true;
  }
  function euler(n) { return n * n + n + 41; }

  var EULER = { n: [], prime: [], firstFail: -1, failValue: 0, root: 0, primesBefore: 0, n41: 0, n41other: 0 };
  for (var en = 0; en <= 45; en++) {
    EULER.n.push(en);
    EULER.prime.push(isPrime(euler(en)));
    if (EULER.firstFail < 0 && !isPrime(euler(en))) {
      EULER.firstFail = en;
      EULER.failValue = euler(en);
      EULER.root = Math.round(Math.sqrt(EULER.failValue));
      EULER.primesBefore = en;
    }
  }
  EULER.n41 = euler(41);
  EULER.n41other = EULER.n41 / 41;

  /* ---------- 1e. the series, its difference table and its ambiguity ---------- */

  var SEQ = [6, 9, 14, 21, 30, 41];
  function diffs(a) {
    var out = [];
    for (var i = 1; i < a.length; i++) out.push(a[i] - a[i - 1]);
    return out;
  }
  var SERIES = { seq: SEQ, rows: [SEQ.slice()] };
  (function () {
    var d = SEQ.slice();
    while (d.length > 1) { d = diffs(d); SERIES.rows.push(d.slice()); }
  })();
  SERIES.d1 = SERIES.rows[1];
  SERIES.d2 = SERIES.rows[2];
  SERIES.constantSecond = SERIES.d2.every(function (v) { return v === SERIES.d2[0]; });
  SERIES.quadNext = SEQ[SEQ.length - 1] + (SERIES.d1[SERIES.d1.length - 1] + SERIES.d2[0]);
  SERIES.quadFormula = function (n) { return n * n + 5; };
  SERIES.quadFits = SEQ.every(function (v, i) { return v === SERIES.quadFormula(i + 1); });
  SERIES.quadAt7 = SERIES.quadFormula(7);
  SERIES.vanish = function (n) {
    var p = 1;
    for (var k = 1; k <= 6; k++) p *= (n - k);
    return p;
  };
  SERIES.perturbed = function (n) { return SERIES.quadFormula(n) + SERIES.vanish(n); };
  SERIES.perturbedFits = SEQ.every(function (v, i) { return v === SERIES.perturbed(i + 1); });
  SERIES.perturbedAt7 = SERIES.perturbed(7);
  SERIES.vanishAt7 = SERIES.vanish(7);

  /* ---------- 1f. analogy ---------- */

  function pos(letter) { return letter.charCodeAt(0) - 64; }
  function letter(n) { return String.fromCharCode(64 + n); }
  var ANA = {
    squareOf8: 8 * 8, cubeOf8: 8 * 8 * 8,
    squareOf5: 5 * 5, cubeOf5: 5 * 5 * 5,
    azSum: pos('A') + pos('Z'), bySum: pos('B') + pos('Y'),
    cPos: pos('C'), cMirror: letter(27 - pos('C')),
    mirrorInvolution: true, alphabet: []
  };
  for (var ai = 1; ai <= 26; ai++) {
    ANA.alphabet.push({ i: ai, ch: letter(ai), mirror: letter(27 - ai) });
    if (27 - (27 - ai) !== ai) ANA.mirrorInvolution = false;
  }

  /* ---------- 1g. counting in a line ---------- */

  var RANK = {
    front: 12, back: 9,
    total: 12 + 9 - 1,
    a: 5, b: 9,
    between: 9 - 5 - 1,
    tea: 35, coffee: 30, both: 20, cls: 60
  };
  RANK.union = RANK.tea + RANK.coffee - RANK.both;
  RANK.neither = RANK.cls - RANK.union;
  RANK.q7BoysQualified = 100 - 60;
  RANK.q7GirlsQualified = 60;
  /* verify the line formulas on an explicit line of RANK.total positions */
  RANK.lineCheck = (function () {
    var line = [];
    for (var i = 1; i <= RANK.total; i++) line.push(i);
    var p = line[RANK.front - 1];
    var fromBack = RANK.total - p + 1;
    return fromBack === RANK.back;
  })();
  RANK.betweenCheck = (function () {
    var line = [];
    for (var i = 1; i <= 12; i++) line.push(i);
    return line.slice(RANK.a, RANK.b - 1).length === RANK.between;
  })();

  /* ---------- 1h. the neighbour-count grid ---------- */

  var GRID_X = [[1, 1], [1, 3], [2, 2], [3, 4]];
  function isCross(r, c) {
    for (var i = 0; i < GRID_X.length; i++) if (GRID_X[i][0] === r && GRID_X[i][1] === c) return true;
    return false;
  }
  function countFree(r, c, crossFn) {
    var free = 0;
    for (var dr = -1; dr <= 1; dr++) {
      for (var dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        var rr = r + dr, cc = c + dc;
        if (rr < 1 || rr > 4 || cc < 1 || cc > 4) continue;
        if (!crossFn(rr, cc)) free++;
      }
    }
    return free;
  }
  var GRID = [];
  for (var gr = 1; gr <= 4; gr++) {
    var row = [];
    for (var gc = 1; gc <= 4; gc++) row.push(isCross(gr, gc) ? 'X' : countFree(gr, gc, isCross));
    GRID.push(row);
  }
  var GRID_ROW4_SUM = GRID[3].reduce(function (a, b) { return a + b; }, 0);

  var GRID_CANDIDATES = [];
  for (var gm = 0; gm < 16; gm++) {
    (function (mask) {
      var last = [0, 1, 2, 3].map(function (i) { return !!(mask & (1 << i)); });
      var crossFn = function (r, c) { return r === 4 ? last[c - 1] : isCross(r, c); };
      var ok = true;
      for (var c = 1; c <= 4 && ok; c++) {
        if (crossFn(3, c)) continue;
        if (countFree(3, c, crossFn) !== GRID[2][c - 1]) ok = false;
      }
      if (ok) GRID_CANDIDATES.push(last.map(function (v) { return v ? 1 : 0; }));
    })(gm);
  }

  /* ---------- the model, as one object ---------- */

  var V = {
    regions: REGIONS,
    premises: PREMISES.map(function (p) { return p.text; }),
    modelCount: SYL_MODELS.length,
    modelCountNonEmpty: SYL_MODELS_NONEMPTY.length,
    maskSpace: 127,
    syllogisms: SYL,
    q4: Q4,
    q4Impossible: Q4_IMPOSSIBLE,
    forms: FORMS,
    euler: EULER,
    series: SERIES,
    analogy: ANA,
    rank: RANK,
    grid: GRID,
    gridRow4Sum: GRID_ROW4_SUM,
    gridCandidates: GRID_CANDIDATES
  };

  /* ======================================================================
     LAYER 2 - THE CHECKS
     Each computed value is re-tested against the definition it came from.
     ====================================================================== */

  /* --- the region space --- */
  check('three sets give seven non-empty regions plus the outside',
    REGIONS.length === 8, '8 region codes, index = A + 2B + 4C');
  check('the region space is 127 non-empty models',
    V.maskSpace === 127, '2^7 - 1');
  check('every surviving model satisfies both premises',
    SYL_MODELS.every(function (m) {
      var rs = present(m);
      return PREMISES.every(function (p) { return p.holds(rs); });
    }), SYL_MODELS.length + ' models');

  /* --- the syllogism verdicts --- */
  check('exactly two of the six conclusions are valid',
    SYL.filter(function (c) { return c.valid; }).length === 2,
    SYL.filter(function (c) { return c.valid; }).map(function (c) { return c.text; }).join('; '));
  check('the two valid conclusions are No A is C and No C is A',
    SYL[0].valid && SYL[1].valid && !SYL[2].valid);
  check('No A is C and No C is A agree on every model',
    SYL_MODELS.every(function (m) {
      var rs = present(m);
      return CONCLUSIONS[0].holds(rs) === CONCLUSIONS[1].holds(rs);
    }));
  check('every invalid conclusion comes with a model that satisfies both premises',
    SYL.filter(function (c) { return !c.valid; }).every(function (c) {
      return c.witness !== null && PREMISES.every(function (p) { return p.holds(present(c.witness)); });
    }), SYL.filter(function (c) { return !c.valid; }).length + ' witnesses');
  check('each witness really does falsify its own conclusion',
    SYL.filter(function (c) { return !c.valid; }).every(function (c, k) {
      var idx = CONCLUSIONS.map(function (x) { return x.text; }).indexOf(c.text);
      return !CONCLUSIONS[idx].holds(present(c.witness));
    }));
  check('Some A is C fails with all three classes occupied, not by an empty class',
    (function () {
      var c = SYL[2];
      var rs = present(c.witness);
      return rs.some(function (r) { return r.A; }) && rs.some(function (r) { return r.B; }) && rs.some(function (r) { return r.C; });
    })(), 'witness: ' + SYL[2].witnessText);
  check('Some B is C holds in no model at all, because it contradicts the premises',
    SYL[5].witness !== null && !CONCLUSIONS[5].holds(present(SYL[5].witness)));
  check('the verdicts do not depend on the empty-class convention',
    SYL.every(function (c) { return c.valid === c.validNonEmpty; }),
    'both readings agree on all six');

  /* --- GATE CSE 2022 Q4 --- */
  check('exactly one of the four offered pairs is impossible',
    Q4_IMPOSSIBLE.length === 1, Q4_IMPOSSIBLE.length + ' impossible of ' + Q4.length);
  check('the impossible pair is statements 1 and 3, option A',
    Q4_IMPOSSIBLE.length === 1 && Q4_IMPOSSIBLE[0].letter === 'A' &&
    Q4_IMPOSSIBLE[0].pair[0] === 1 && Q4_IMPOSSIBLE[0].pair[1] === 3);
  check('statements 3 and 4 do hold together, in the none world',
    Q4.filter(function (o) { return o.letter === 'D'; })[0].possible === true);
  check('three worlds exhaust the partitions of a non-empty class',
    Q4_WORLDS.length === 3);
  check('statement 1 implies statement 2 whenever the class is non-empty',
    Q4_WORLDS.every(function (w) { return !Q4_STATEMENTS[1](w) || Q4_STATEMENTS[2](w); }));
  check('statement 3 implies statement 4 whenever the class is non-empty',
    Q4_WORLDS.every(function (w) { return !Q4_STATEMENTS[3](w) || Q4_STATEMENTS[4](w); }));

  /* --- conditionals --- */
  check('the truth table has four rows', ROWS.length === 4);
  check('implication is false in exactly one row',
    ROWS.filter(function (r) { return !imp(r[0], r[1]); }).length === 1);
  check('that row is P true and Q false',
    ROWS.filter(function (r) { return !imp(r[0], r[1]); })[0][0] === true &&
    ROWS.filter(function (r) { return !imp(r[0], r[1]); })[0][1] === false);
  check('modus ponens is valid in one premise row', FORMS[0].valid && FORMS[0].liveRows === 1);
  check('modus tollens is valid in one premise row', FORMS[1].valid && FORMS[1].liveRows === 1);
  check('affirming the consequent is invalid, with two premise rows',
    !FORMS[2].valid && FORMS[2].liveRows === 2);
  check('denying the antecedent is invalid, with two premise rows',
    !FORMS[3].valid && FORMS[3].liveRows === 2);
  check('the two invalid forms each have a row where the conclusion fails',
    FORMS[2].badRows === 1 && FORMS[3].badRows === 1);
  check('the failing row of affirming the consequent has P false and Q true',
    FORMS[2].bad[0][0] === false && FORMS[2].bad[0][1] === true);

  /* --- the Euler polynomial --- */
  check('n^2 + n + 41 is prime for every n from 0 to 39',
    EULER.primesBefore === 40 && EULER.n.slice(0, 40).every(function (n) { return isPrime(euler(n)); }),
    EULER.primesBefore + ' of 40');
  check('the first composite value is at n = 40', EULER.firstFail === 40);
  check('that value is 1681 and it equals 41 squared',
    EULER.failValue === 1681 && EULER.root === 41);
  check('1681 really is 41 times 41', 41 * 41 === EULER.failValue);
  check('n = 41 gives 1763, which is 41 times 43',
    EULER.n41 === 1763 && EULER.n41other === 43);
  check('trial division agrees that 1681 is not prime',
    !isPrime(1681) && isPrime(41) && isPrime(43));

  /* --- the series --- */
  check('the first differences are 3, 5, 7, 9, 11',
    SERIES.d1.join(',') === '3,5,7,9,11');
  check('the second differences are constant and equal 2',
    SERIES.constantSecond && SERIES.d2.every(function (v) { return v === 2; }));
  check('a constant second difference means the relation is n squared plus five',
    SERIES.quadFits, 'term(n) = n^2 + 5 for n = 1..6');
  check('the quadratic continuation gives 54 for the seventh term',
    SERIES.quadNext === 54 && SERIES.quadAt7 === 54);
  check('a polynomial vanishing on all six given positions leaves them unchanged',
    SERIES.perturbedFits, 'same six terms, different seventh');
  check('that perturbation changes the seventh term to 774',
    SERIES.perturbedAt7 === 774 && SERIES.vanishAt7 === 720);
  check('so the next term is not determined by the six given terms',
    SERIES.quadAt7 !== SERIES.perturbedAt7);

  /* --- analogy --- */
  check('eight squared is 64 and eight cubed is 512',
    ANA.squareOf8 === 64 && ANA.cubeOf8 === 512);
  check('both relations fit the left-hand eight, so a bare analogy is ambiguous',
    ANA.squareOf5 !== ANA.cubeOf5, '5 gives 25 or 125');
  check('A and Z sum to 27, and so do B and Y',
    ANA.azSum === 27 && ANA.bySum === 27);
  check('the mirror relation is an involution on all twenty-six letters',
    ANA.mirrorInvolution && ANA.alphabet.every(function (x) {
      return letter(27 - (27 - x.i)) === x.ch;
    }));
  check('C mirrors to X', ANA.cMirror === 'X' && ANA.cPos === 3);

  /* --- counting in a line --- */
  check('twelfth from the front and ninth from the back gives a line of twenty',
    RANK.total === 20);
  check('that position really is ninth from the back of a line of twenty',
    RANK.lineCheck);
  check('fifth and ninth from the left leave three between',
    RANK.between === 3 && RANK.betweenCheck);
  check('the union of two groups is 45 and fifteen like neither',
    RANK.union === 45 && RANK.neither === 15);
  check('GATE 2022 Q7: boys took 40 per cent of the qualified places against 60 for girls',
    RANK.q7BoysQualified === 40 && RANK.q7GirlsQualified === 60 &&
    RANK.q7BoysQualified < RANK.q7GirlsQualified);

  /* --- the grid --- */
  check('the grid has four crosses, as placed', GRID_X.length === 4);
  check('every printed count is a recount of free neighbours',
    (function () {
      for (var r = 1; r <= 4; r++) {
        for (var c = 1; c <= 4; c++) {
          if (isCross(r, c)) { if (GRID[r - 1][c - 1] !== 'X') return false; }
          else if (GRID[r - 1][c - 1] !== countFree(r, c, isCross)) return false;
        }
      }
      return true;
    })());
  check('exactly one of the sixteen candidate last rows survives',
    GRID_CANDIDATES.length === 1, GRID_CANDIDATES.length + ' survivor');
  check('the surviving last row is the one with no crosses',
    GRID_CANDIDATES.length === 1 && GRID_CANDIDATES[0].join('') === '0000');
  check('the four counts in the last row are 3, 5, 4 and 2',
    GRID[3].join(',') === '3,5,4,2');
  check('they sum to 14', GRID_ROW4_SUM === 14);
  check('a corner cell counts three neighbours, not eight',
    countFree(1, 1, function () { return false; }) === 3);
  check('an edge cell counts five neighbours and an interior cell eight',
    countFree(1, 2, function () { return false; }) === 5 &&
    countFree(2, 2, function () { return false; }) === 8);

  /* ======================================================================
     LAYER 3 - RENDER
     Everything below reads V. Nothing below recomputes a verdict.
     ====================================================================== */

  function pct(p) { return K.clamp01(p); }
  function beat(t, sc, a, b) { return pct((t - sc.start - a) / (b - a)); }

  function heading(painter, label, sub) {
    painter.text(28, 22, label, { size: 15, bold: true, color: INK });
    if (sub) painter.text(28, 44, sub, { size: 12, color: DIM });
  }

  function chip(painter, x, y, w, text, colour, dim) {
    painter.rect(x, y, w, 26, { fill: dim || SURF2, stroke: colour, radius: 6, sw: 1.2 });
    painter.text(x + 10, y + 13, text, { size: 12, bold: true, color: colour, base: 'middle' });
  }

  function tick(painter, x, y, ok) {
    painter.circle(x, y, 7, { fill: ok ? VAL : BAD, stroke: null });
    painter.text(x, y, ok ? '\u2713' : '\u2717', { size: 11, bold: true, color: '#ffffff', align: 'center', base: 'middle' });
  }

  /* ---------- scene 1 ---------- */
  function drawAsk(t, sc) {
    var p = pct((t - sc.start) / (sc.end - sc.start));
    heading(P, 'Analytical Aptitude — what the question asks', 'Section 3 of the General Aptitude syllabus: logic, deduction and induction, analogy, numerical relations and reasoning');

    if (p > 0.04) {
      P.rect(40, 82, 330, 132, { fill: SURF2, stroke: BORDER, radius: 8 });
      P.text(56, 96, 'PREMISES', { size: 11, bold: true, color: DIM });
      V.premises.forEach(function (s, i) {
        if (beat(t, sc, 1, 5) > i * 0.25) {
          P.text(56, 120 + i * 26, '\u2022  ' + s, { size: 15, color: INK });
        }
      });
      P.text(56, 172, '\u2022  at least one A exists', { size: 15, color: INK });
    }

    if (p > 0.3) {
      P.arrow(382, 148, 438, 148, { stroke: ACC, sw: 2.2, head: 11 });
      P.text(410, 128, 'forces?', { size: 12, color: ACC, align: 'center' });
    }

    if (p > 0.45) {
      P.rect(452, 82, 250, 132, { fill: ACCDIM, stroke: ACC, radius: 8 });
      P.text(468, 96, 'CONCLUSION', { size: 11, bold: true, color: ACC });
      P.text(468, 124, 'No A is C', { size: 17, bold: true, color: INK });
      P.text(468, 154, 'must it hold?', { size: 13, color: DIM });
      P.text(468, 178, 'or does it only seem to?', { size: 13, color: DIM });
    }

    if (p > 0.62) {
      P.rect(40, 240, 400, 96, { fill: SURF, stroke: VAL, radius: 8 });
      P.text(56, 254, 'DEDUCTION', { size: 12, bold: true, color: VAL });
      P.text(56, 278, 'True in every model the premises allow.', { size: 13, color: INK });
      P.text(56, 300, 'Refuted by one countermodel.', { size: 13, color: INK });
      P.text(56, 320, 'The answer is yes or no.', { size: 12, color: DIM });
    }

    if (p > 0.78) {
      P.rect(460, 240, 400, 96, { fill: SURF, stroke: WARN, radius: 8 });
      P.text(476, 254, 'INDUCTION', { size: 12, bold: true, color: WARN });
      P.text(476, 278, 'True in every case seen so far.', { size: 13, color: INK });
      P.text(476, 300, 'Ended by one counterexample.', { size: 13, color: INK });
      P.text(476, 320, 'The answer carries a count, not a proof.', { size: 12, color: DIM });
    }

    if (p > 0.9) {
      P.text(40, 372, 'Five written tests follow: a region count, a truth table, a case count,', { size: 13, color: DIM });
      P.text(40, 394, 'a difference table, and a relation table.', { size: 13, color: DIM });
    }
  }

  /* ---------- scene 2 ---------- */
  function drawSyllogism(t, sc) {
    heading(P, 'Deduction is a count over every model', 'All A are B  and  No B is C  \u2014  how many models survive, and what holds in all of them');

    /* the three circles: A nested in B, C apart */
    var p = pct((t - sc.start) / (sc.end - sc.start));
    if (p > 0.02) {
      P.circle(210, 210, 96, { fill: null, stroke: INFO, sw: 2 });
      P.text(210, 116, 'B', { size: 15, bold: true, color: INFO, align: 'center' });
      P.circle(196, 210, 54, { fill: ACCDIM, stroke: ACC, sw: 2 });
      P.text(196, 210, 'A', { size: 15, bold: true, color: ACC, align: 'center', base: 'middle' });
      P.circle(400, 210, 82, { fill: null, stroke: WARN, sw: 2 });
      P.text(400, 130, 'C', { size: 15, bold: true, color: WARN, align: 'center' });
      P.text(196, 286, 'A inside B is the first premise', { size: 11, color: DIM, align: 'center' });
      P.text(400, 300, 'B apart from C is the second', { size: 11, color: DIM, align: 'center' });
    }

    if (p > 0.2) {
      P.rect(520, 92, 340, 78, { fill: SURF2, stroke: BORDER, radius: 8 });
      P.text(536, 106, 'MODELS', { size: 11, bold: true, color: DIM });
      P.text(536, 128, '127 non-empty choices of the 7 regions', { size: 12, color: INK });
      P.text(536, 150, V.modelCount + ' survive both premises', { size: 13, bold: true, color: ACC });
    }

    if (p > 0.34) {
      P.rect(520, 182, 340, 44, { fill: SURF, stroke: BORDER, radius: 6 });
      P.text(536, 196, 'with all three classes occupied:', { size: 12, color: DIM });
      P.text(536, 214, V.modelCountNonEmpty + ' models, same verdicts', { size: 12, color: INK });
    }

    if (p > 0.5) {
      P.text(40, 336, 'CONCLUSION', { size: 11, bold: true, color: DIM });
      P.text(240, 336, 'VERDICT', { size: 11, bold: true, color: DIM });
      P.text(340, 336, 'A MODEL THAT BREAKS IT', { size: 11, bold: true, color: DIM });
      V.syllogisms.forEach(function (c, i) {
        var y = 356 + i * 17;
        if (beat(t, sc, 15, 27) < (i + 1) / 6) return;
        P.text(40, y, c.text, { size: 13, color: INK });
        tick(P, 300, y + 6, c.valid);
        P.text(340, y, c.valid ? 'holds in all ' + V.modelCount : (c.witnessText || 'none exists'), { size: 11, color: c.valid ? VAL : DIM });
      });
    }
  }

  /* ---------- scene 3 ---------- */
  function drawCountermodel(t, sc) {
    heading(P, 'One model is enough to refute', 'GATE CSE 2022, Question 4 \u2014 four statements, four offered pairs, one impossible pair');

    var p = pct((t - sc.start) / (sc.end - sc.start));
    var texts = {
      1: '1  All students are inquisitive.',
      2: '2  Some students are inquisitive.',
      3: '3  No student is inquisitive.',
      4: '4  Some students are not inquisitive.'
    };
    if (p > 0.02) {
      P.rect(40, 82, 400, 128, { fill: SURF2, stroke: BORDER, radius: 8 });
      P.text(56, 96, 'THE FOUR STATEMENTS  (at least one student)', { size: 11, bold: true, color: DIM });
      [1, 2, 3, 4].forEach(function (k) {
        P.text(56, 118 + (k - 1) * 24, texts[k], { size: 13, color: INK });
      });
    }

    if (p > 0.18) {
      P.rect(462, 82, 398, 128, { fill: SURF, stroke: BORDER, radius: 8 });
      P.text(478, 96, 'THE THREE WORLDS', { size: 11, bold: true, color: DIM });
      Q4_WORLDS.forEach(function (w, i) {
        P.text(478, 120 + i * 24, (i + 1) + '  ' + w, { size: 13, color: INK });
      });
      P.text(478, 196, 'a class is one of these, and nothing else', { size: 11, color: FAINT });
    }

    if (p > 0.4) {
      P.text(40, 240, 'OPTION', { size: 11, bold: true, color: DIM });
      P.text(130, 240, 'PAIR', { size: 11, bold: true, color: DIM });
      P.text(250, 240, 'A WORLD WHERE BOTH HOLD', { size: 11, bold: true, color: DIM });
      V.q4.forEach(function (o, i) {
        var y = 262 + i * 30;
        if (beat(t, sc, 15, 24) < (i + 1) / 4) return;
        P.rect(36, y - 8, 824, 26, { fill: o.possible ? SURF : BADDIM, stroke: o.possible ? BORDER : BAD, radius: 5 });
        P.text(48, y, o.letter, { size: 14, bold: true, color: o.possible ? INK : BAD });
        P.text(130, y, o.pair[0] + ' and ' + o.pair[1], { size: 13, color: INK });
        P.text(250, y, o.possible ? o.world : 'no world \u2014 impossible', { size: 13, bold: !o.possible, color: o.possible ? DIM : BAD });
      });
    }

    if (p > 0.86) {
      P.text(40, 396, 'Answer: A.  Statements 1 and 3 contradict each other as soon as the class is non-empty.', { size: 14, bold: true, color: ACC });
      P.text(40, 420, 'Statements 1 and 4 also cannot both hold \u2014 but that pair is not offered, so it cannot be the answer.', { size: 12, color: DIM });
    }
  }

  /* ---------- scene 4 ---------- */
  function drawConditional(t, sc) {
    heading(P, 'Conditionals: two valid forms, two invalid ones', 'P\u2192Q is false in exactly one of four rows, and that row decides everything');

    var p = pct((t - sc.start) / (sc.end - sc.start));
    if (p > 0.02) {
      P.rect(40, 82, 250, 150, { fill: SURF2, stroke: BORDER, radius: 8 });
      P.text(56, 96, 'TRUTH TABLE', { size: 11, bold: true, color: DIM });
      P.text(56, 122, 'P', { size: 12, bold: true, color: DIM });
      P.text(110, 122, 'Q', { size: 12, bold: true, color: DIM });
      P.text(170, 122, 'P\u2192Q', { size: 12, bold: true, color: DIM });
      ROWS.forEach(function (r, i) {
        var y = 148 + i * 22;
        var f = imp(r[0], r[1]);
        P.text(56, y, r[0] ? 'T' : 'F', { size: 13, color: INK });
        P.text(110, y, r[1] ? 'T' : 'F', { size: 13, color: INK });
        P.text(170, y, f ? 'T' : 'F', { size: 13, bold: !f, color: f ? INK : BAD });
        if (!f) P.rect(36, y - 5, 200, 20, { fill: BADDIM, stroke: null, radius: 4 });
      });
      P.text(56, 242, 'the only false row', { size: 11, color: BAD });
    }

    if (p > 0.2) {
      V.forms.forEach(function (f, i) {
        var y = 82 + i * 62;
        if (beat(t, sc, 6, 22) < (i + 1) / 4) return;
        P.rect(316, y, 544, 52, { fill: f.valid ? SURF : SURF, stroke: f.valid ? VAL : BAD, radius: 8 });
        P.text(332, y + 8, f.name, { size: 13, bold: true, color: INK });
        P.text(332, y + 28, f.schema, { size: 13, mono: true, color: DIM });
        chip(P, 700, y + 12, 146, f.valid ? 'VALID' : 'INVALID', f.valid ? VAL : BAD, f.valid ? '#e8f5ea' : BADDIM);
        P.text(700, y + 46, 'premise rows: ' + f.liveRows + (f.valid ? '' : ', failing: ' + f.badRows),
          { size: 10, color: DIM });
      });
    }

    if (p > 0.9) {
      P.text(40, 336, 'A form is valid when every row that satisfies its premises also satisfies its conclusion.', { size: 13, color: INK });
      P.text(40, 360, 'That is a count, and it needs no intuition about the words.', { size: 12, color: DIM });
    }
  }

  /* ---------- scene 5 ---------- */
  function drawInduction(t, sc) {
    heading(P, 'Induction: forty out of forty is not a proof', 'n\u00b2 + n + 41, tested by trial division for every n from 0 to 45');

    var p = pct((t - sc.start) / (sc.end - sc.start));
    var x0 = 60, x1 = 840, y = 180;
    if (p > 0.02) {
      P.line(x0, y, x1, y, { stroke: BORDER, sw: 2 });
      var shown = Math.floor(pct(beat(t, sc, 1, 14)) * 46);
      for (var n = 0; n <= shown && n <= 45; n++) {
        var x = x0 + (n / 45) * (x1 - x0);
        var ok = V.euler.prime[n];
        P.line(x, y - 8, x, y + 8, { stroke: ok ? VAL : BAD, sw: 2 });
        if (!ok) {
          P.circle(x, y, 8, { fill: BAD, stroke: null });
          P.text(x, y + (n === 41 ? 44 : 26), 'n=' + n, { size: 11, bold: true, color: BAD, align: 'center' });
        }
        if (n % 5 === 0 && ok) P.text(x, y + 26, n, { size: 10, color: FAINT, align: 'center' });
      }
      P.text(x0, y - 34, 'each tick is one n; green means the value is prime', { size: 11, color: DIM });
    }

    if (p > 0.28) {
      P.rect(40, 236, 400, 92, { fill: SURF, stroke: VAL, radius: 8 });
      P.text(56, 250, 'BEFORE n = 40', { size: 11, bold: true, color: VAL });
      P.text(56, 276, V.euler.primesBefore + ' of ' + V.euler.primesBefore + ' values are prime', { size: 15, bold: true, color: INK });
      P.text(56, 302, 'n = 39 gives ' + euler(39), { size: 12, color: DIM });
      P.text(56, 318, 'no exception in forty cases', { size: 11, color: DIM });
    }

    if (p > 0.48) {
      P.rect(462, 236, 398, 92, { fill: BADDIM, stroke: BAD, radius: 8 });
      P.text(478, 250, 'AT n = 40', { size: 11, bold: true, color: BAD });
      P.text(478, 276, '1600 + 40 + 41 = ' + V.euler.failValue, { size: 15, bold: true, color: INK });
      P.text(478, 302, 'and 1681 = ' + V.euler.root + ' \u00d7 ' + V.euler.root, { size: 14, bold: true, color: BAD });
      P.text(478, 318, 'n = 41 gives 1763 = 41 \u00d7 43', { size: 11, color: DIM });
    }

    if (p > 0.7) {
      P.text(40, 358, 'What you may say: the claim holds in the forty cases checked, and no counterexample is known.', { size: 13, color: INK });
      P.text(40, 382, 'What you may not say: the claim holds.', { size: 13, bold: true, color: BAD });
    }
    if (p > 0.86) {
      P.text(40, 414, 'Mathematical induction is the opposite: a base case plus a step proves the statement for all n. That is deduction.', { size: 12, color: DIM });
      P.text(40, 436, 'The syllabus word induction here means pattern generalisation. Do not carry the proof technique across.', { size: 12, color: DIM });
    }
  }

  /* ---------- scene 6 ---------- */
  function drawSeries(t, sc) {
    heading(P, 'Numerical relations: differences and their limit', 'GATE CSE 2024 Set 2, GA Q5 \u2014 6, 9, 14, x, 30, 41 \u2014 and why the next term is a convention');

    var p = pct((t - sc.start) / (sc.end - sc.start));
    var cellW = 54, x0 = 60;

    function row(label, vals, y, hi) {
      P.text(28, y + 8, label, { size: 11, bold: true, color: DIM });
      vals.forEach(function (v, i) {
        var x = x0 + i * (cellW + 6);
        P.rect(x, y, cellW, 28, { fill: (hi && i === hi.idx) ? ACCDIM : SURF2, stroke: (hi && i === hi.idx) ? ACC : BORDER, radius: 5 });
        P.text(x + cellW / 2, y + 14, v, { size: 14, bold: true, color: INK, align: 'center', base: 'middle' });
      });
    }

    if (p > 0.02) {
      row('a', V.series.seq, 88, { idx: 3 });
      P.text(x0 + 3 * (cellW + 6) + cellW / 2, 74, 'x', { size: 11, color: ACC, align: 'center' });
    }
    if (p > 0.16) row('\u0394', V.series.d1, 132);
    if (p > 0.3) row('\u0394\u00b2', V.series.d2, 176);
    if (p > 0.42) {
      P.text(60, 214, 'a constant second difference of 2 means the relation is a quadratic with leading coefficient 1', { size: 12, color: DIM });
      P.text(60, 238, 'term(n) = n\u00b2 + 5   \u2192   term(4) = 21,  term(6) = 41', { size: 14, bold: true, color: ACC });
    }

    if (p > 0.56) {
      P.rect(40, 262, 400, 78, { fill: SURF, stroke: VAL, radius: 8 });
      P.text(56, 276, 'QUADRATIC CONTINUATION', { size: 11, bold: true, color: VAL });
      P.text(56, 300, 'next difference 13, so term(7) = 54', { size: 13, color: INK });
      P.text(56, 322, 'the answer the paper accepts is 21 for x', { size: 11, color: DIM });
    }

    if (p > 0.72) {
      P.rect(462, 262, 398, 78, { fill: BADDIM, stroke: BAD, radius: 8 });
      P.text(478, 276, 'ADD (n\u22121)(n\u22122)\u2026(n\u22126)', { size: 11, bold: true, color: BAD });
      P.text(478, 300, 'zero at all six given positions', { size: 13, color: INK });
      P.text(478, 322, 'so term(7) could be 54 + 720 = 774', { size: 12, bold: true, color: BAD });
    }

    if (p > 0.88) {
      P.text(40, 372, 'Six terms never determine the seventh. The options restrict the family; that is what makes the question answerable.', { size: 12, color: INK });
      P.text(40, 396, 'So read a series as induction: the simplest relation that fits, chosen by the options.', { size: 12, color: DIM });
      P.text(40, 420, 'Both readings of this sequence agree on 21, which is why it is safe here.', { size: 12, color: DIM });
    }
  }

  /* ---------- scene 7 ---------- */
  function drawAnalogy(t, sc) {
    heading(P, 'Analogy: name the relation before you apply it', '8 : 64 and 8 : 512 both fit the left-hand number \u2014 the relation, not the pair, is the answer');

    var p = pct((t - sc.start) / (sc.end - sc.start));
    if (p > 0.02) {
      P.rect(40, 84, 240, 92, { fill: SURF, stroke: ACC, radius: 8 });
      P.text(56, 98, 'RELATION: square', { size: 12, bold: true, color: ACC });
      P.text(56, 126, '8 : 64', { size: 18, bold: true, color: INK });
      P.text(56, 156, 'so 5 : 25', { size: 14, color: DIM });
    }
    if (p > 0.14) {
      P.rect(300, 84, 240, 92, { fill: SURF, stroke: WARN, radius: 8 });
      P.text(316, 98, 'RELATION: cube', { size: 12, bold: true, color: WARN });
      P.text(316, 126, '8 : 512', { size: 18, bold: true, color: INK });
      P.text(316, 156, 'so 5 : 125', { size: 14, color: DIM });
    }
    if (p > 0.28) {
      P.rect(560, 84, 300, 92, { fill: SURF2, stroke: BORDER, radius: 8 });
      P.text(576, 98, 'BOTH FIT THE LEFT-HAND 8', { size: 11, bold: true, color: DIM });
      P.text(576, 126, 'a bare analogy is ambiguous', { size: 13, bold: true, color: INK });
      P.text(576, 152, 'the options break the tie', { size: 12, color: DIM });
    }

    if (p > 0.42) {
      P.text(40, 208, 'LETTER ANALOGY  \u2014  position arithmetic, A = 1 and Z = 26', { size: 11, bold: true, color: DIM });
      for (var i = 1; i <= 26; i++) {
        var x = 40 + (i - 1) * 32;
        var mirrorIdx = 27 - i;
        var y = 232;
        P.rect(x, y, 28, 26, { fill: i <= 4 || i >= 23 ? ACCDIM : SURF2, stroke: BORDER, radius: 4 });
        P.text(x + 14, y + 13, ANA.alphabet[i - 1].ch, { size: 13, bold: true, color: INK, align: 'center', base: 'middle' });
        P.text(x + 14, y + 40, String(i), { size: 9, color: FAINT, align: 'center' });
      }
      P.arrow(40, 288, 40 + 25 * 32 + 28, 288, { stroke: ACC, sw: 1.4, head: 8 });
      P.text(40, 306, 'A\u2194Z, B\u2194Y, C\u2194X \u2014 every pair sums to 27', { size: 12, color: ACC });
    }

    if (p > 0.66) {
      P.rect(40, 330, 400, 92, { fill: SURF, stroke: VAL, radius: 8 });
      P.text(56, 344, 'APPLY IT', { size: 11, bold: true, color: VAL });
      P.text(56, 370, 'C is 3, and 27 \u2212 3 = 24', { size: 14, color: INK });
      P.text(56, 396, 'the 24th letter is X, so C : X', { size: 14, bold: true, color: VAL });
      P.text(56, 414, 'A and Z, B and Y confirm the sum', { size: 10, color: DIM });
    }
    if (p > 0.84) {
      P.rect(462, 330, 398, 92, { fill: SURF2, stroke: BORDER, radius: 8 });
      P.text(478, 344, 'THE CHECK THAT NEVER FAILS', { size: 11, bold: true, color: DIM });
      P.text(478, 370, 'apply the relation twice:', { size: 12, color: INK });
      P.text(478, 394, '27 \u2212 (27 \u2212 3) = 3, back to C', { size: 13, mono: true, color: INK });
      P.text(478, 414, 'true for all 26 letters, checked here', { size: 10, color: DIM });
    }
  }

  /* ---------- scene 8 ---------- */
  function drawRank(t, sc) {
    heading(P, 'Counting in a line: positions, overlap, between', 'Three one-line formulas, each derived and each checked on an explicit line');

    var p = pct((t - sc.start) / (sc.end - sc.start));
    if (p > 0.02) {
      var n = 20, x0 = 60, dx = 38;
      for (var i = 1; i <= n; i++) {
        var x = x0 + (i - 1) * dx;
        var isPerson = i === V.rank.front;
        P.circle(x, 130, 11, { fill: isPerson ? ACC : SURF2, stroke: isPerson ? ACC : BORDER, sw: 1.5 });
        P.text(x, 130, String(i), { size: 9, color: isPerson ? '#ffffff' : DIM, align: 'center', base: 'middle' });
      }
      P.arrow(x0 - 18, 100, x0 + (V.rank.front - 1) * dx, 100, { stroke: INFO, sw: 1.6, head: 8 });
      P.text(x0, 84, '12th from the front', { size: 11, color: INFO });
      P.arrow(x0 + (n - 1) * dx + 18, 168, x0 + (V.rank.front - 1) * dx, 168, { stroke: WARN, sw: 1.6, head: 8 });
      P.text(x0 + (n - 1) * dx - 96, 186, '9th from the back', { size: 11, color: WARN });
    }

    if (p > 0.2) {
      P.text(40, 226, 'total = front + back \u2212 1  =  12 + 9 \u2212 1  =  20', { size: 15, bold: true, color: ACC });
      P.text(40, 250, 'the one subtracted is the person counted twice', { size: 11, color: DIM });
    }

    if (p > 0.38) {
      P.text(40, 288, 'between = difference \u2212 1  =  9 \u2212 5 \u2212 1  =  3', { size: 15, bold: true, color: ACC });
      P.text(40, 312, 'between excludes both ends; a position from the front includes it', { size: 11, color: DIM });
    }

    if (p > 0.56) {
      P.rect(40, 332, 400, 92, { fill: SURF, stroke: BORDER, radius: 8 });
      P.text(56, 346, 'TWO OVERLAPPING GROUPS', { size: 11, bold: true, color: DIM });
      P.text(56, 370, 'tea 35, coffee 30, both 20, class 60', { size: 12, color: INK });
      P.text(56, 394, 'union = 35 + 30 \u2212 20 = ' + V.rank.union, { size: 13, bold: true, color: ACC });
      P.text(56, 414, 'neither = 60 \u2212 ' + V.rank.union + ' = ' + V.rank.neither, { size: 12, color: INK });
    }

    if (p > 0.76) {
      P.rect(462, 332, 398, 92, { fill: ACCDIM, stroke: ACC, radius: 8 });
      P.text(478, 346, 'GATE CSE 2022 Q7', { size: 11, bold: true, color: ACC });
      P.text(478, 370, 'boys 65% of appeared, girls 60% of qualified', { size: 11, color: INK });
      P.text(478, 392, 'so boys took 40% of the places, girls 60%', { size: 12, bold: true, color: INK });
      P.text(478, 412, 'fewer boys qualified \u2014 different totals', { size: 11, color: DIM });
    }
  }

  /* ---------- scene 9 ---------- */
  function drawGrid(t, sc) {
    heading(P, 'Constraint reasoning on a grid', 'Each number counts the free cells among its eight neighbours; the last row has no crosses');

    var p = pct((t - sc.start) / (sc.end - sc.start));
    var gx = 60, gy = 90, cell = 46;
    if (p > 0.02) {
      for (var r = 0; r < 4; r++) {
        for (var c = 0; c < 4; c++) {
          var v = V.grid[r][c];
          var x = gx + c * cell, y = gy + r * cell;
          var isLast = r === 3;
          P.rect(x, y, cell, cell, {
            fill: v === 'X' ? BADDIM : (isLast ? ACCDIM : SURF2),
            stroke: isLast ? ACC : BORDER, sw: isLast ? 2 : 1.2
          });
          P.text(x + cell / 2, y + cell / 2, String(v), {
            size: 17, bold: true, color: v === 'X' ? BAD : INK, align: 'center', base: 'middle'
          });
        }
      }
      P.text(gx, gy - 16, 'rows 1\u20133 given, four crosses placed', { size: 11, color: DIM });
      P.text(gx, gy + 4 * cell + 14, 'row 4: no crosses \u2192 16 candidates', { size: 11, color: ACC });
    }

    if (p > 0.24) {
      P.rect(300, 96, 560, 78, { fill: SURF, stroke: BORDER, radius: 8 });
      P.text(316, 110, 'SOLVE BY ENUMERATION', { size: 11, bold: true, color: DIM });
      P.text(316, 134, 'enumerate all 16 candidate last rows', { size: 12, color: INK });
      P.text(316, 156, 'keep those that reproduce the counts in row 3 \u2192 ' + V.gridCandidates.length + ' survives', { size: 12, bold: true, color: ACC });
    }

    if (p > 0.44) {
      P.rect(300, 186, 560, 78, { fill: SURF, stroke: BORDER, radius: 8 });
      P.text(316, 200, 'THE SURVIVING ROW', { size: 11, bold: true, color: DIM });
      P.text(316, 224, V.gridCandidates.length === 1 ? 'exactly one: the empty row 0 0 0 0' : 'more than one \u2014 the clues are insufficient', { size: 12, color: INK });
      P.text(316, 246, 'so the clue set determines the answer; that is checked, not assumed', { size: 11, color: DIM });
    }

    if (p > 0.62) {
      P.rect(300, 276, 560, 78, { fill: ACCDIM, stroke: ACC, radius: 8 });
      P.text(316, 290, 'NOW COUNT THE LAST ROW', { size: 11, bold: true, color: ACC });
      P.text(316, 314, 'each cell counts its free neighbours in rows 3 and 4', { size: 12, color: INK });
      P.text(316, 336, 'the four counts are ' + V.grid[3].join(', ') + ', summing to ' + V.gridRow4Sum, { size: 13, bold: true, color: ACC });
    }

    if (p > 0.8) {
      P.text(60, 340, 'TRAPS', { size: 11, bold: true, color: DIM });
      P.text(60, 362, 'A corner has three neighbours, not eight.', { size: 12, color: INK });
      P.text(60, 384, 'Diagonals count, so read eight neighbours, not four.', { size: 12, color: INK });
      P.text(60, 406, 'A clue set with two survivors cannot be answered.', { size: 12, color: INK });
    }
  }

  /* ---------- scene 10 ---------- */
  function drawProcedure(t, sc) {
    heading(P, 'The five-step procedure', 'In the order they should be tried, on any analytical question');

    var p = pct((t - sc.start) / (sc.end - sc.start));
    var steps = [
      ['1', 'Decide the family: must, or probably.', 'Follows / necessarily / cannot both be true are deduction. Comes next / what is the relation are induction.'],
      ['2', 'For deduction, build the models and count.', 'Seven regions for a syllogism, four rows for a conditional. One model with the conclusion false is a complete refutation.'],
      ['3', 'For induction, name the relation in words and test every term.', 'A difference table for numbers, a position table for letters. Two relations fitting means the options decide.'],
      ['4', 'For counting, write the formula and check it on five objects.', 'Total is front + back \u2212 1. Between is difference \u2212 1. Union is the counts minus the overlap.'],
      ['5', 'Count the solutions, not just one.', 'If two arrangements survive, the question is asking which one an option contains. Uniqueness is part of the answer.']
    ];
    steps.forEach(function (s, i) {
      if (beat(t, sc, 1, 26) < (i + 1) / 5) return;
      var y = 84 + i * 74;
      P.rect(40, y, 824, 62, { fill: i % 2 ? SURF : SURF2, stroke: BORDER, radius: 8 });
      P.circle(70, y + 31, 16, { fill: ACC, stroke: null });
      P.text(70, y + 31, s[0], { size: 15, bold: true, color: '#ffffff', align: 'center', base: 'middle' });
      P.text(100, y + 10, s[1], { size: 13, bold: true, color: INK });
      P.text(100, y + 32, s[2], { size: 11, color: DIM });
    });
  }

  /* ---------- dispatch ---------- */

  var SCENE_DRAW = {
    ask: drawAsk,
    syllogism: drawSyllogism,
    countermodel: drawCountermodel,
    conditional: drawConditional,
    induction: drawInduction,
    series: drawSeries,
    analogy: drawAnalogy,
    rank: drawRank,
    grid: drawGrid,
    procedure: drawProcedure
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
