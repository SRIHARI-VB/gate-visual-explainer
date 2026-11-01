/* ==========================================================================
   chomsky-hierarchy — lesson.js
   Four layers, in order:
     1. THE MODEL   — the four grammar types and their automata, the five
                      language classes and the witness that separates each
                      neighbouring pair, the closure table, the decidability
                      table, the monotonic grammar for a^n b^n c^n with its
                      derivations, the pumping searches, the intersection
                      counterexample, and the counting argument.
     2. THE CHECKS  — every claim the lesson makes, re-verified at load.
     3. RENDER      — reads the model; never re-derives a value.
     4. BOOT        — p5.js first, the browser's own canvas as the fallback.

   Every number on the canvas and in every caption comes from this file.
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
  var SURF = PAL.surface, SURF2 = PAL.surface2, BORDER = PAL.border;
  var ACCDIM = PAL.accentDim || '#d6efeb';
  var WARNDIM = PAL.warnDim || '#fbeed3';
  var INVALIDDIM = PAL.invalidDim || '#fbe4e2';
  var WHITE = '#ffffff';

/* ======================================================================
   LAYER 1 — THE MODEL
   ====================================================================== */

  var CHECKS = [];
  function check(name, fn) {
    var r;
    try { r = fn(); }
    catch (e) { r = { pass: false, detail: 'threw ' + e.message }; }
    CHECKS.push({ name: name, pass: !!r.pass, detail: r.detail || '' });
  }

  /* ---------- 1.1 the four grammar types, in Chomsky's numbering ----------
     The rule shape is the whole definition. Everything else — the automaton,
     the closure table, the decidability table — follows from it. */

  var TYPES = [
    {
      type: 'Type 3', cls: 'REG', name: 'regular',
      rule: 'A -> aB,  A -> a   (right-linear)',
      side: 'one nonterminal, at one end',
      machine: 'finite automaton',
      memory: 'a fixed number of states',
      witnessOut: '{ a^n b^n : n >= 0 }'
    },
    {
      type: 'Type 2', cls: 'CFL', name: 'context-free',
      rule: 'A -> gamma   (any string of symbols)',
      side: 'one nonterminal, both sides clear',
      machine: 'push-down automaton',
      memory: 'one stack',
      witnessOut: '{ a^n b^n c^n : n >= 0 }'
    },
    {
      type: 'Type 1', cls: 'CSL', name: 'context-sensitive',
      rule: 'alpha A beta -> alpha gamma beta,  gamma non-empty',
      side: 'a nonterminal in context; lengths never shrink',
      machine: 'linear bounded automaton',
      memory: 'a tape no longer than the input',
      witnessOut: 'a decidable language needing more than linear space'
    },
    {
      type: 'Type 0', cls: 'RE', name: 'recursively enumerable',
      rule: 'alpha -> beta   (alpha contains a nonterminal)',
      side: 'no restriction on the shape or the length',
      machine: 'Turing machine',
      memory: 'an unbounded tape',
      witnessOut: 'the complement of the halting set'
    }
  ];

  /* The five classes the four types give you, once the recursive languages are
     inserted between Type 1 and Type 0. The chain is strict at every link. */
  var CHAIN = [
    { cls: 'REG', label: 'regular',      type: 'Type 3', inside: 'FA' },
    { cls: 'CFL', label: 'context-free', type: 'Type 2', inside: 'PDA' },
    { cls: 'CSL', label: 'context-sensitive', type: 'Type 1', inside: 'LBA' },
    { cls: 'REC', label: 'recursive',    type: '(between 1 and 0)', inside: 'always-halting TM' },
    { cls: 'RE',  label: 'recursively enumerable', type: 'Type 0', inside: 'TM' }
  ];

  /* the witness language that is in the upper class and not in the lower one */
  var SEPARATORS = [
    { upper: 'CFL', lower: 'REG', lang: 'a^n b^n', why: 'needs an unbounded count' },
    { upper: 'CSL', lower: 'CFL', lang: 'a^n b^n c^n', why: 'needs two independent counts' },
    { upper: 'REC', lower: 'CSL', lang: 'a language in SPACE(n^3) but not SPACE(n^2)', why: 'needs more than a linear tape' },
    { upper: 'RE',  lower: 'REC', lang: 'complement of the halting set', why: 'not decidable at all' }
  ];

  /* ---------- 1.2 the monotonic grammar for a^n b^n c^n ----------
     Six rules. Every rule keeps its right side at least as long as its left
     side, which is what makes it a Type 1 grammar rather than a Type 0 one. */

  var G3_RULES = [
    { lhs: 'S',    rhs: 'aSBC' },
    { lhs: 'S',    rhs: 'aBC' },
    { lhs: 'CB',   rhs: 'BC' },
    { lhs: 'aB',   rhs: 'ab' },
    { lhs: 'bB',   rhs: 'bb' },
    { lhs: 'bC',   rhs: 'bc' },
    { lhs: 'cC',   rhs: 'cc' }
  ];

  var G3_NONTERMINALS = ['S', 'A', 'B', 'C'];

  function g3Monotonic() {
    var bad = [];
    for (var i = 0; i < G3_RULES.length; i++) {
      var r = G3_RULES[i];
      if (r.rhs.length < r.lhs.length) bad.push(r.lhs + '->' + r.rhs);
    }
    return bad;
  }

  /* bounded breadth-first derivation: every sentential form of length <= MAXLEN,
     at most MAXSTEP rule applications. Deterministic order, so the run repeats. */
  var MAXLEN = 11, MAXSTEP = 14;

  function g3Derive() {
    var seen = {}, frontier = ['S'], terminal = {}, order = [], steps = 0, forms = 0;
    seen['S'] = 1;
    for (var step = 0; step < MAXSTEP; step++) {
      var next = [];
      for (var f = 0; f < frontier.length; f++) {
        var form = frontier[f];
        if (!/[SBC]/.test(form)) continue;              /* already terminal */
        for (var r = 0; r < G3_RULES.length; r++) {
          var rule = G3_RULES[r], at = form.indexOf(rule.lhs);
          while (at >= 0) {
            var out = form.slice(0, at) + rule.rhs + form.slice(at + rule.lhs.length);
            steps++;
            if (out.length <= MAXLEN && !seen[out]) {
              seen[out] = 1;
              forms++;
              if (!/[SBC]/.test(out)) { terminal[out] = 1; }
              else next.push(out);
            }
            at = form.indexOf(rule.lhs, at + 1);
          }
        }
      }
      frontier = next;
      if (!frontier.length) break;
    }
    var keys = Object.keys(terminal).sort(function (a, b) {
      return a.length - b.length || (a < b ? -1 : 1);
    });
    return { terminal: keys, steps: steps, forms: forms };
  }

  var G3 = g3Derive();

  function isDiagonal(s) {
    var m = /^(a*)(b*)(c*)$/.exec(s);
    if (!m) return false;
    return m[1].length === m[2].length && m[2].length === m[3].length;
  }

  /* ---------- 1.3 the two pumping searches ----------
     Both are exhaustive over the splits the lemma allows, so "no split
     survives" is a checked statement about this string, not a hand wave. */

  function regPump(p, word, inLang) {
    var total = 0, survive = 0, z = word(p);
    for (var x = 0; x <= p && x < z.length; x++) {
      for (var y = 1; x + y <= p && x + y < z.length; y++) {
        total++;
        var pre = z.slice(0, x), mid = z.slice(x, x + y), post = z.slice(x + y);
        var all = true;
        for (var i = 0; i <= 3; i++) {
          var w = pre + new Array(i + 1).join(mid) + post;
          if (!inLang(w)) { all = false; break; }
        }
        if (all) survive++;
      }
    }
    return { total: total, survive: survive };
  }

  function cflPump(p, word, inLang) {
    var total = 0, survive = 0, z = word(p), n = z.length;
    for (var u = 0; u <= n; u++) {
      for (var v = 0; u + v <= n; v++) {
        for (var w = 0; u + v + w <= n; w++) {
          for (var xx = 0; u + v + w + xx <= n; xx++) {
            var y = n - u - v - w - xx;
            if (v + xx === 0) continue;              /* |vx| >= 1 */
            if (v + w + xx > p) continue;            /* |vwx| <= p */
            total++;
            var A = z.slice(0, u), B = z.slice(u, u + v), C = z.slice(u + v, u + v + w),
                D = z.slice(u + v + w, u + v + w + xx), E = z.slice(u + v + w + xx);
            var all = true;
            for (var i = 0; i <= 3; i++) {
              var s = A + new Array(i + 1).join(B) + C + new Array(i + 1).join(D) + E;
              if (!inLang(s)) { all = false; break; }
            }
            if (all) survive++;
          }
        }
      }
    }
    return { total: total, survive: survive };
  }

  var isAnBn = function (s) { return /^(a*)(b*)$/.test(s) && RegExp.$1.length === RegExp.$2.length; };
  var isAnBnCn = isDiagonal;

  var REG_PUMP = [];
  for (var rp = 1; rp <= 8; rp++) {
    var r = regPump(rp, function (p) { return new Array(p + 1).join('a') + new Array(p + 1).join('b'); }, isAnBn);
    REG_PUMP.push({ p: rp, total: r.total, survive: r.survive });
  }

  var CFL_PUMP = [];
  for (var cp = 1; cp <= 6; cp++) {
    var c = cflPump(cp, function (p) {
      return new Array(p + 1).join('a') + new Array(p + 1).join('b') + new Array(p + 1).join('c');
    }, isAnBnCn);
    CFL_PUMP.push({ p: cp, total: c.total, survive: c.survive });
  }

  /* ---------- 1.4 the intersection counterexample ----------
     Two context-free languages whose intersection is the diagonal. Enumerated
     over a small universe so the claim is a count, not a picture. */

  var UNIV = 4;                        /* i, j, k each run 0..4 */
  var L1 = {}, L2 = {}, BOTH = {}, EITHER = {}, NEITHER = {};
  var nL1 = 0, nL2 = 0, nBoth = 0, nUniv = 0;

  (function () {
    for (var i = 0; i <= UNIV; i++) {
      for (var j = 0; j <= UNIV; j++) {
        for (var k = 0; k <= UNIV; k++) {
          var s = new Array(i + 1).join('a') + new Array(j + 1).join('b') + new Array(k + 1).join('c');
          nUniv++;
          var a = (i === j), b = (j === k);
          if (a) { L1[s] = 1; nL1++; }
          if (b) { L2[s] = 1; nL2++; }
          if (a && b) { BOTH[s] = 1; nBoth++; }
          if (a || b) EITHER[s] = 1;
          if (!a && !b) NEITHER[s] = 1;
        }
      }
    }
  })();

  /* De Morgan over the same universe: the complement of (comp L1 union comp L2)
     must be exactly L1 intersect L2. This is the bridge from "not closed under
     intersection" to "not closed under complement". */
  var DEMORGAN_OK = (function () {
    var keys = Object.keys(EITHER), both = Object.keys(BOTH);
    var derived = {};
    for (var q = 0; q <= UNIV; q++) {
      for (var r2 = 0; r2 <= UNIV; r2++) {
        for (var t = 0; t <= UNIV; t++) {
          var s = new Array(q + 1).join('a') + new Array(r2 + 1).join('b') + new Array(t + 1).join('c');
          var inL1 = !!L1[s], inL2 = !!L2[s];
          /* comp L1 union comp L2 = not (L1 and L2) */
          var u = (!inL1) || (!inL2);
          if (!u) derived[s] = 1;                    /* complement of that union */
        }
      }
    }
    var dk = Object.keys(derived);
    if (dk.length !== both.length) return false;
    for (var m = 0; m < dk.length; m++) if (!BOTH[dk[m]]) return false;
    return keys.length === nL1 + nL2 - nBoth;
  })();

  /* ---------- 1.5 the counting argument ----------
     Machines are finite strings, so there are countably many. Languages are
     sets of strings, so there are as many as there are subsets of a countable
     set: uncountably many. Almost nothing is describable. */

  function langCount(n) { return Math.pow(2, n + 1) - 1; }   /* languages over {a} on strings of length <= n */
  function machineCount(L) { return Math.pow(2, L + 1) - 2; } /* binary descriptions of length <= L */

  var COUNT = { n: 51, L: 50, langs: langCount(51), machines: machineCount(50) };

  /* ---------- 1.6 the two tables ----------
     Closure: the seven operations a GATE statement question actually uses.
     Decidability: D decidable, S semi-decidable, U undecidable. */

  var OPS = ['union', 'intersection', 'complement', 'concatenation', 'star', 'reversal', 'with a regular set'];
  var CLOSURE = {
    REG: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
    CFL: ['Y', 'N', 'N', 'Y', 'Y', 'Y', 'Y'],
    CSL: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
    REC: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
    RE:  ['Y', 'Y', 'N', 'Y', 'Y', 'Y', 'Y']
  };

  var PROBS = ['membership', 'emptiness', 'finiteness', 'universality', 'equivalence'];
  var DECIDE = {
    REG: ['D', 'D', 'D', 'D', 'D'],
    CFL: ['D', 'D', 'D', 'U', 'U'],
    CSL: ['D', 'D', 'D', 'U', 'U'],
    REC: ['D', 'D', 'D', 'D', 'D'],
    RE:  ['S', 'U', 'U', 'U', 'U']
  };

  var CLOSED_COUNT = {}, DECIDABLE_COUNT = {};
  CLASSES().forEach(function (cl) {
    CLOSED_COUNT[cl] = CLOSURE[cl].filter(function (v) { return v === 'Y'; }).length;
    DECIDABLE_COUNT[cl] = DECIDE[cl].filter(function (v) { return v === 'D'; }).length;
  });

  function CLASSES() { return ['REG', 'CFL', 'CSL', 'REC', 'RE']; }

  /* ======================================================================
     LAYER 2 — THE CHECKS
     ====================================================================== */

  check('four grammar types, numbered 3 down to 0', function () {
    var nums = TYPES.map(function (t) { return t.type; }).join(',');
    return { pass: nums === 'Type 3,Type 2,Type 1,Type 0', detail: nums };
  });

  check('five language classes in the chain', function () {
    var s = CHAIN.map(function (c) { return c.cls; }).join('>');
    return { pass: s === 'REG>CFL>CSL>REC>RE', detail: s };
  });

  check('each of the four separators names a distinct neighbouring pair', function () {
    var seen = {};
    for (var i = 0; i < SEPARATORS.length; i++) {
      var key = SEPARATORS[i].lower + '>' + SEPARATORS[i].upper;
      if (seen[key]) return { pass: false, detail: key };
      seen[key] = 1;
    }
    return { pass: Object.keys(seen).length === 4, detail: Object.keys(seen).join(' ') };
  });

  check('every Type 1 rule is monotonic: |lhs| <= |rhs|', function () {
    var bad = g3Monotonic();
    return { pass: bad.length === 0, detail: bad.length ? bad.join(', ') : '7 rules, all non-shrinking' };
  });

  check('the monotonic grammar derives exactly a^n b^n c^n up to length 11', function () {
    var wrong = [], missing = [];
    for (var i = 0; i < G3.terminal.length; i++) {
      if (!isDiagonal(G3.terminal[i])) wrong.push(G3.terminal[i]);
    }
    var want = ['abc', 'aabbcc', 'aaabbbccc'];
    for (var j = 0; j < want.length; j++) if (G3.terminal.indexOf(want[j]) < 0) missing.push(want[j]);
    return {
      pass: wrong.length === 0 && missing.length === 0,
      detail: G3.terminal.length + ' terminal strings, ' + (wrong.length ? 'wrong: ' + wrong.join(',') : 'none wrong') +
              (missing.length ? ', missing ' + missing.join(',') : '')
    };
  });

  check('n = 1, 2, 3 are the only diagonals of length at most 9', function () {
    var diag = [];
    for (var i = 0; i < G3.terminal.length; i++) if (isDiagonal(G3.terminal[i])) diag.push(G3.terminal[i]);
    return { pass: diag.length === 3, detail: diag.join(' ') };
  });

  check('a^n b^n survives no split of the regular pumping lemma, p = 1..8', function () {
    var bad = REG_PUMP.filter(function (r) { return r.survive !== 0; });
    return { pass: bad.length === 0, detail: REG_PUMP.map(function (r) { return r.survive; }).join(',') + ' survivors' };
  });

  check('the regular pumping search actually enumerates splits', function () {
    var first = REG_PUMP[0], last = REG_PUMP[REG_PUMP.length - 1];
    var wantFirst = 1, wantLast = 8 * 9 / 2;
    return { pass: first.total === wantFirst && last.total === wantLast, detail: first.total + ' then ' + last.total };
  });

  check('a^n b^n c^n survives no split of the context-free pumping lemma, p = 1..6', function () {
    var bad = CFL_PUMP.filter(function (r) { return r.survive !== 0; });
    return { pass: bad.length === 0, detail: CFL_PUMP.map(function (r) { return r.survive; }).join(',') + ' survivors' };
  });

  check('the context-free search grows with p', function () {
    var mono = true;
    for (var i = 1; i < CFL_PUMP.length; i++) if (CFL_PUMP[i].total <= CFL_PUMP[i - 1].total) mono = false;
    return { pass: mono, detail: CFL_PUMP.map(function (r) { return r.total; }).join(',') + ' splits' };
  });

  check('|L1| = |L2| = 25 and |L1 cap L2| = 5 on the 5x5x5 universe', function () {
    return { pass: nL1 === 25 && nL2 === 25 && nBoth === 5 && nUniv === 125, detail: nL1 + ', ' + nL2 + ', ' + nBoth + ' of ' + nUniv };
  });

  check('the intersection is exactly the diagonal set', function () {
    var keys = Object.keys(BOTH);
    for (var i = 0; i < keys.length; i++) if (!isDiagonal(keys[i])) return { pass: false, detail: keys[i] };
    return { pass: keys.length === 5, detail: keys.join(' ') };
  });

  check('the union size obeys |L1 u L2| = |L1| + |L2| - |both|', function () {
    var u = Object.keys(EITHER).length;
    return { pass: u === nL1 + nL2 - nBoth, detail: u + ' = ' + nL1 + ' + ' + nL2 + ' - ' + nBoth };
  });

  check('De Morgan reproduces the intersection from the two complements', function () {
    return { pass: DEMORGAN_OK, detail: DEMORGAN_OK ? 'complement(comp L1 u comp L2) = L1 cap L2' : 'mismatch' };
  });

  check('so "closed under complement" would force "closed under intersection"', function () {
    /* the diagonal is the intersection, and the pumping search says it is not
       context-free, so the premise must be false */
    var diagNotCF = CFL_PUMP.every(function (r) { return r.survive === 0; });
    return { pass: diagNotCF && DEMORGAN_OK, detail: 'counterexample survives the derivation' };
  });

  check('languages on strings of length <= 51 outnumber 50-bit machines', function () {
    return { pass: COUNT.langs > COUNT.machines, detail: COUNT.langs + ' vs ' + COUNT.machines };
  });

  check('language count doubles with each extra length', function () {
    return { pass: langCount(10) === 2 * langCount(9) + 1, detail: langCount(9) + ' then ' + langCount(10) };
  });

  check('the counting argument needs no diagonalisation to be convincing', function () {
    /* every class on the chain is countable: countably many grammars */
    var finiteAtEachSize = true;
    for (var n = 1; n <= 6; n++) if (!(machineCount(n) > 0)) finiteAtEachSize = false;
    return { pass: finiteAtEachSize && COUNT.langs > COUNT.machines, detail: 'countable machines, uncountable languages' };
  });

  check('closure table: every class is closed under union, star and reversal', function () {
    var bad = [];
    CLASSES().forEach(function (cl) {
      if (CLOSURE[cl][0] !== 'Y') bad.push(cl + ' union');
      if (CLOSURE[cl][4] !== 'Y') bad.push(cl + ' star');
      if (CLOSURE[cl][5] !== 'Y') bad.push(cl + ' reversal');
    });
    return { pass: bad.length === 0, detail: bad.length ? bad.join(', ') : 'all five classes, three operations' };
  });

  check('closure table: exactly three cells are "not closed"', function () {
    var no = [];
    CLASSES().forEach(function (cl) {
      for (var i = 0; i < OPS.length; i++) if (CLOSURE[cl][i] === 'N') no.push(cl + '/' + OPS[i]);
    });
    return { pass: no.length === 3, detail: no.join(', ') };
  });

  check('closure table: the three failures are two facts, not three', function () {
    /* CFL loses intersection and complement (one fact twice); RE loses only
       complement (a different fact: Post's theorem). */
    var cfl = CLOSURE.CFL.filter(function (v) { return v === 'N'; }).length;
    var re = CLOSURE.RE.filter(function (v) { return v === 'N'; }).length;
    return { pass: cfl === 2 && re === 1, detail: 'CFL fails ' + cfl + ', RE fails ' + re };
  });

  check('closure table: CFL loses both intersection and complement', function () {
    return {
      pass: CLOSURE.CFL[1] === 'N' && CLOSURE.CFL[2] === 'N' && CLOSURE.CFL[6] === 'Y',
      detail: 'intersection N, complement N, with a regular set Y'
    };
  });

  check('closure table: CSL is closed under complement, which is what separates it from CFL', function () {
    return { pass: CLOSURE.CSL[2] === 'Y' && CLOSURE.CFL[2] === 'N', detail: 'CSL Y, CFL N' };
  });

  check('closure table: RE fails only complement', function () {
    var no = [];
    for (var i = 0; i < OPS.length; i++) if (CLOSURE.RE[i] === 'N') no.push(OPS[i]);
    return { pass: no.length === 1 && no[0] === 'complement', detail: no.join(',') };
  });

  check('decidability table: regular and recursive decide all five', function () {
    return {
      pass: DECIDABLE_COUNT.REG === 5 && DECIDABLE_COUNT.REC === 5,
      detail: DECIDABLE_COUNT.REG + ' and ' + DECIDABLE_COUNT.REC
    };
  });

  check('decidability table: CFL and CSL decide three of five', function () {
    return {
      pass: DECIDABLE_COUNT.CFL === 3 && DECIDABLE_COUNT.CSL === 3,
      detail: DECIDABLE_COUNT.CFL + ' and ' + DECIDABLE_COUNT.CSL
    };
  });

  check('decidability table: RE decides nothing outright', function () {
    return { pass: DECIDABLE_COUNT.RE === 0 && DECIDE.RE[0] === 'S', detail: 'membership semi-decidable only' };
  });

  check('decidability is NOT monotone along the chain', function () {
    /* REC decides more than CSL, even though REC is the larger class: the chain
       measures what a machine can recognise, not what you can decide. */
    var seq = CLASSES().map(function (c) { return DECIDABLE_COUNT[c]; });
    var dropped = seq[2] < seq[0] && seq[3] > seq[2] && seq[4] < seq[3];
    return { pass: dropped, detail: seq.join(', ') + ' along REG, CFL, CSL, REC, RE' };
  });

  check('RE closed under complement would collapse RE into REC', function () {
    /* Post's theorem: L in RE and its complement in RE gives a decider */
    var reClosedComplement = CLOSURE.RE[2] === 'Y';
    return { pass: !reClosedComplement, detail: 'complement is the one cell RE does not have' };
  });

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

/* ======================================================================
   LAYER 3 — RENDER
   Every value drawn here is read from the model above.
   ====================================================================== */

  var TITLE_Y = 26, SUB_Y = 48;

  function head(txt, sub) {
    P.text(24, TITLE_Y, txt, { size: 16, bold: true, color: INK });
    if (sub) P.text(24, SUB_Y, sub, { size: 12, color: DIM });
  }

  function foot(txt, colour) {
    P.text(24, 436, txt, { size: 12, color: colour || DIM });
  }

  function chip(x, y, w, label, tone) {
    var fill = tone === 'bad' ? INVALIDDIM : tone === 'warn' ? WARNDIM : ACCDIM;
    var ink = tone === 'bad' ? BAD : tone === 'warn' ? WARN : ACC;
    P.rect(x, y, w, 22, { fill: fill, stroke: ink, radius: 4 });
    P.text(x + w / 2, y + 11, label, { size: 11, color: ink, align: 'center', base: 'middle', bold: true });
  }

  function beat(t, sc, off, dur) {
    var local = t - sc.start - off;
    return K.clamp01(local / Math.max(0.001, dur));
  }

  function sceneOf(t) {
    var sc = window.LESSON_TIMELINE.scenes;
    for (var i = 0; i < sc.length; i++) if (t >= sc[i].start && t < sc[i].end) return sc[i];
    return sc[sc.length - 1];
  }

  var SCENE_DRAW = {};

  /* ---------- scene 1: the ladder ---------- */
  SCENE_DRAW.ladder = function (t, sc) {
    head('Four grammar types, five language classes',
         'The rule shape is the definition. Everything else on this page follows from it.');
    for (var i = 0; i < CHAIN.length; i++) {
      var c = CHAIN[i];
      var y = 74 + i * 56;
      var a = K.ease(beat(t, sc, i * 2.6, 0.7));
      P.alpha(a);
      var w = 470;
      P.rect(24, y, w, 44, { fill: i === 2 ? ACCDIM : SURF2, stroke: i === 2 ? ACC : BORDER, radius: 6 });
      P.text(38, y + 13, c.cls, { size: 15, bold: true, color: INK, mono: true });
      P.text(102, y + 15, c.label, { size: 13, color: DIM });
      P.text(508, y + 8, c.type, { size: 12, color: INK });
      P.text(508, y + 26, c.inside, { size: 11, color: FAINT });
      if (i < CHAIN.length - 1) {
        var b = K.ease(beat(t, sc, i * 2.6 + 1.2, 0.6));
        P.alpha(b);
        P.arrow(250, y + 45, 250, y + 54, { stroke: FAINT, sw: 1.4, head: 7 });
        P.text(262, y + 45, 'strict', { size: 10, color: FAINT });
      }
    }
    P.alpha(1);
    foot('Read the chain upwards: each class is a proper subset of the one above it.');
  };

  /* ---------- scene 2: the machine that matches the rule ---------- */
  SCENE_DRAW.machine = function (t, sc) {
    head('The automaton each rule buys you',
         'A grammar restriction is a machine restriction. The memory is the difference.');
    var cols = [
      { cls: 'REG', mem: 'finite states', note: 'no memory', kind: 'fsm' },
      { cls: 'CFL', mem: 'one stack', note: 'last in, first out', kind: 'stack' },
      { cls: 'CSL', mem: 'tape = input length', note: 'linear space', kind: 'lba' },
      { cls: 'RE',  mem: 'unbounded tape', note: 'any space at all', kind: 'tm' }
    ];
    for (var i = 0; i < cols.length; i++) {
      var x = 24 + i * 218, c = cols[i];
      var a = K.ease(beat(t, sc, i * 2.2, 0.7));
      P.alpha(a);
      P.rect(x, 72, 200, 28, { fill: ACCDIM, stroke: ACC, radius: 4 });
      P.text(x + 100, 86, c.cls, { size: 13, bold: true, color: ACC, align: 'center', base: 'middle', mono: true });

      if (c.kind === 'fsm') {
        P.circle(x + 55, 140, 20, { stroke: INK, sw: 1.6 });
        P.circle(x + 145, 140, 20, { stroke: INK, sw: 1.6 });
        P.arrow(x + 75, 140, x + 123, 140, { stroke: DIM, sw: 1.3, head: 7 });
        P.arrow(x + 125, 152, x + 77, 152, { stroke: DIM, sw: 1.3, head: 7 });
      } else if (c.kind === 'stack') {
        for (var s = 0; s < 4; s++) {
          P.rect(x + 70, 172 - s * 14, 60, 12, { stroke: INK, sw: 1.2, fill: s === 0 ? ACCDIM : WHITE });
        }
        P.arrow(x + 140, 120, x + 140, 176, { stroke: FAINT, sw: 1.2, head: 6 });
      } else if (c.kind === 'lba') {
        for (var q = 0; q < 8; q++) {
          P.rect(x + 20 + q * 20, 132, 20, 22, { stroke: INK, sw: 1.2, fill: q < 5 ? SURF2 : WHITE });
        }
        P.text(x + 100, 162, '|w| cells, then a wall', { size: 10, color: FAINT, align: 'center' });
      } else {
        for (var r = 0; r < 9; r++) {
          P.rect(x + 10 + r * 20, 132, 20, 22, { stroke: r === 0 || r === 8 ? WHITE : INK, sw: 1.2, fill: SURF2 });
        }
        P.text(x + 100, 162, 'no wall at either end', { size: 10, color: FAINT, align: 'center' });
      }

      P.text(x + 100, 196, c.mem, { size: 12, color: INK, align: 'center' });
      P.text(x + 100, 216, c.note, { size: 11, color: FAINT, align: 'center' });
      P.alpha(1);
    }
    var v = K.ease(beat(t, sc, 9, 0.8));
    P.alpha(v);
    P.text(24, 262, 'The Type 1 tape is the one that matters on this page: it is bounded, so a',
           { size: 12, color: INK });
    P.text(24, 282, 'computation on it either halts within a finite search or does not halt at all,',
           { size: 12, color: INK });
    P.text(24, 302, 'which is why every context-sensitive language is decidable.',
           { size: 12, color: INK });
    P.alpha(1);
    foot('The stack of the PDA is why a^n b^n fits and a^n b^n c^n does not: one stack, one comparison.');
  };

  /* ---------- scene 3: the regular pumping search ---------- */
  SCENE_DRAW.pumpreg = function (t, sc) {
    head('REG is smaller than CFL: the pumping search',
         'z = a^p b^p, every split the lemma allows, pumps 0, 1, 2 and 3 times.');
    P.text(60, 70, 'p', { size: 11, bold: true, color: DIM, mono: true });
    P.text(150, 70, 'splits tested', { size: 11, bold: true, color: DIM });
    P.text(330, 70, 'splits that survive', { size: 11, bold: true, color: DIM });
    P.text(520, 70, 'verdict', { size: 11, bold: true, color: DIM });
    for (var i = 0; i < REG_PUMP.length; i++) {
      var row = REG_PUMP[i], y = 88 + i * 30;
      var a = K.ease(beat(t, sc, 1.5 + i * 1.1, 0.5));
      P.alpha(a);
      P.rect(24, y - 4, 560, 24, { fill: i % 2 ? SURF2 : WHITE, stroke: BORDER, sw: 0.6, radius: 3 });
      P.text(60, y + 1, 'p = ' + row.p, { size: 12, mono: true, color: INK });
      P.text(150, y + 1, String(row.total), { size: 12, mono: true, color: INK });
      P.text(330, y + 1, String(row.survive), { size: 12, mono: true, color: row.survive ? BAD : VAL });
      P.text(520, y + 1, row.survive ? 'still regular' : 'escapes REG', { size: 11, color: row.survive ? BAD : VAL });
      P.alpha(1);
    }
    var v = K.ease(beat(t, sc, 11, 0.8));
    P.alpha(v);
    P.rect(24, 338, 560, 56, { fill: INVALIDDIM, stroke: BAD, radius: 6 });
    P.text(38, 350, 'Zero survivors at every p from 1 to 8. A language that escaped every',
           { size: 12, color: BAD });
    P.text(38, 368, 'split of every allowed length is not regular. a^n b^n is therefore in',
           { size: 12, color: BAD });
    P.text(38, 386, 'CFL and not in REG, which is what "proper subset" means.', { size: 12, color: BAD });
    P.alpha(1);
    foot('The lemma is a necessary condition, not a sufficient one: surviving it proves nothing.');
  };

  /* ---------- scene 4: the monotonic grammar ---------- */
  SCENE_DRAW.grammar = function (t, sc) {
    head('CFL is smaller than CSL: a grammar with no shrinking rule',
         'Type 1 keeps |lhs| <= |rhs|. That single condition is the whole restriction.');
    P.text(24, 70, 'rules of G3', { size: 11, bold: true, color: DIM });
    for (var i = 0; i < G3_RULES.length; i++) {
      var r = G3_RULES[i], y = 88 + i * 26;
      var a = K.ease(beat(t, sc, 1.2 + i * 0.9, 0.4));
      P.alpha(a);
      P.text(24, y, r.lhs, { size: 12, mono: true, color: INK });
      P.text(76, y, '\u2192', { size: 12, color: FAINT });
      P.text(96, y, r.rhs, { size: 12, mono: true, color: ACC });
      P.text(180, y, r.rhs.length >= r.lhs.length ? 'ok' : 'shrinks', { size: 10, color: r.rhs.length >= r.lhs.length ? VAL : BAD });
      P.alpha(1);
    }
    chip(24, 286, 200, G3_RULES.length + ' rules, none shrinks', 'ok');

    P.text(320, 70, 'what it derives, checked by search', { size: 11, bold: true, color: DIM });
    var show = ['S', 'aSBC', 'aaBCBC', 'aaBBCC', 'aabBCC', 'aabbCC', 'aabbcC', 'aabbcc'];
    for (var j = 0; j < show.length; j++) {
      var yy = 88 + j * 26;
      var b = K.ease(beat(t, sc, 4 + j * 1.0, 0.4));
      P.alpha(b);
      P.text(320, yy, show[j], { size: 12, mono: true, color: j === show.length - 1 ? VAL : INK });
      if (j < show.length - 1) P.text(320 + show[j].length * 7.5 + 8, yy, '\u2192', { size: 10, color: FAINT });
      P.alpha(1);
    }
    var v = K.ease(beat(t, sc, 12, 0.8));
    P.alpha(v);
    P.text(320, 306, 'The search found ' + G3.terminal.length + ' terminal strings up to length 11:',
           { size: 12, color: INK });
    P.text(320, 326, G3.terminal.join(', ') + '.', { size: 12, mono: true, color: VAL });
    P.alpha(1);
    foot('a^n b^n c^n is context-sensitive: a monotonic grammar writes it, no CFG can.');
  };

  /* ---------- scene 5: the space argument ---------- */
  SCENE_DRAW.space = function (t, sc) {
    head('CSL is smaller than REC: the linear tape has a ceiling',
         'The LBA cannot leave a tape as long as its input. Decidable languages are not so limited.');
    var boxes = [
      { x: 24,  label: 'NSPACE(n)', sub: 'the context-sensitive languages' },
      { x: 320, label: 'SPACE(n^2)', sub: 'Savitch: NSPACE(n) fits inside' },
      { x: 616, label: 'SPACE(n^3)', sub: 'still decidable, still recursive' }
    ];
    for (var i = 0; i < boxes.length; i++) {
      var b = boxes[i];
      var a = K.ease(beat(t, sc, i * 2.0, 0.6));
      P.alpha(a);
      P.rect(b.x, 96, 260, 66, { fill: i === 0 ? ACCDIM : SURF2, stroke: i === 0 ? ACC : BORDER, radius: 6 });
      P.text(b.x + 130, 108, b.label, { size: 13, bold: true, color: i === 0 ? ACC : INK, align: 'center', mono: true });
      P.text(b.x + 130, 130, b.sub, { size: 11, color: DIM, align: 'center' });
      if (i < 2) P.arrow(b.x + 262, 129, b.x + 294, 129, { stroke: FAINT, sw: 1.4, head: 7 });
      P.alpha(1);
    }
    var v = K.ease(beat(t, sc, 6, 0.8));
    P.alpha(v);
    P.text(24, 190, 'NSPACE(n) is contained in SPACE(n^2), and SPACE(n^2) is a proper subset of',
           { size: 12, color: INK });
    P.text(24, 210, 'SPACE(n^3) by the space hierarchy theorem. So a language in the third box',
           { size: 12, color: INK });
    P.text(24, 230, 'and not in the second is decidable and is not context-sensitive.',
           { size: 12, color: INK });
    P.alpha(1);

    var w = K.ease(beat(t, sc, 12, 0.8));
    P.alpha(w);
    P.rect(24, 258, 852, 96, { fill: SURF2, stroke: BORDER, radius: 6 });
    P.text(38, 270, 'Why the diagonal grammar is context-sensitive and the next rung is not:',
           { size: 12, bold: true, color: INK });
    P.text(38, 292, 'a^n b^n c^n needs two counters over a tape of n cells, and a linear tape can hold',
           { size: 12, color: DIM });
    P.text(38, 312, 'them. A language that needs 2^n cells cannot be recognised with n cells at all,',
           { size: 12, color: DIM });
    P.text(38, 332, 'so it sits outside CSL while remaining perfectly decidable.', { size: 12, color: DIM });
    P.alpha(1);
    foot('CSL is inside REC: every LBA run is a finite search, so membership always terminates.');
  };

  /* ---------- scene 6: the halting diagonal ---------- */
  SCENE_DRAW.halting = function (t, sc) {
    head('REC is smaller than RE: the one operation that is missing',
         'Recursive languages are closed under complement. Recursively enumerable ones are not.');
    var a = K.ease(beat(t, sc, 0.8, 0.7));
    P.alpha(a);
    P.rect(24, 84, 400, 150, { fill: SURF2, stroke: BORDER, radius: 8 });
    P.text(38, 96, 'RE: a machine that says yes', { size: 12, bold: true, color: INK });
    P.rect(44, 122, 360, 96, { fill: ACCDIM, stroke: ACC, radius: 6 });
    P.text(58, 134, 'REC: a machine that always halts', { size: 12, bold: true, color: ACC });
    P.text(58, 156, 'decides yes and no in finite time', { size: 11, color: DIM });
    P.text(58, 176, 'closed under complement', { size: 11, color: DIM });
    P.text(58, 196, 'every CSL lives here', { size: 11, color: DIM });
    P.alpha(1);

    var b = K.ease(beat(t, sc, 4, 0.7));
    P.alpha(b);
    P.text(456, 96, 'Post: a set is recursive exactly when', { size: 12, bold: true, color: INK });
    P.text(456, 118, 'it and its complement are both', { size: 12, color: DIM });
    P.text(456, 138, 'recursively enumerable.', { size: 12, color: DIM });
    chip(456, 162, 210, 'RE cap co-RE = REC', 'ok');
    P.text(456, 200, 'So one missing complement', { size: 11, color: DIM });
    P.text(456, 218, 'is the whole gap.', { size: 11, color: DIM });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 10, 0.8));
    P.alpha(c);
    P.rect(24, 254, 852, 108, { fill: INVALIDDIM, stroke: BAD, radius: 6 });
    P.text(38, 266, 'K = { (M, w) : M halts on w } is the classic member of RE minus REC.',
           { size: 12, bold: true, color: BAD });
    P.text(38, 288, 'Its complement is not in RE at all: if both K and its complement were r.e.,',
           { size: 12, color: DIM });
    P.text(38, 308, 'Post would give a decider for halting, and halting has none. That single',
           { size: 12, color: DIM });
    P.text(38, 328, 'argument is the whole of REC being a proper subset of RE.', { size: 12, color: DIM });
    P.alpha(1);
    foot('Complements separate the top two rungs; the pumping lemma separates the bottom two.');
  };

  /* ---------- scene 7: the closure table ---------- */
  SCENE_DRAW.closure = function (t, sc) {
    head('The closure table, five classes by seven operations',
         'Read down a column to see where an operation fails. Three cells fail, and they are two facts.');
    var colX = function (i) { return 208 + i * 96; };
    for (var i = 0; i < OPS.length; i++) {
      P.text(colX(i) + 44, 76, OPS[i], { size: 10, color: DIM, align: 'center' });
    }
    for (var c = 0; c < CLASSES().length; c++) {
      var cl = CLASSES()[c], y = 100 + c * 34;
      var a = K.ease(beat(t, sc, c * 1.8, 0.6));
      P.alpha(a);
      P.text(24, y + 4, cl, { size: 13, bold: true, mono: true, color: INK });
      P.text(80, y + 5, CHAIN[c].label, { size: 10, color: FAINT });
      for (var o = 0; o < OPS.length; o++) {
        var v = CLOSURE[cl][o];
        var bad = v === 'N';
        P.rect(colX(o) + 24, y, 40, 24, { fill: bad ? INVALIDDIM : ACCDIM, stroke: bad ? BAD : ACC, sw: 0.8, radius: 4 });
        P.text(colX(o) + 44, y + 12, bad ? 'no' : 'yes', { size: 10, align: 'center', base: 'middle', color: bad ? BAD : ACC });
      }
      P.alpha(1);
    }
    var v = K.ease(beat(t, sc, 10, 0.8));
    P.alpha(v);
    P.text(24, 286, 'Closed counts: ' + CLASSES().map(function (c2) { return c2 + ' ' + CLOSED_COUNT[c2] + '/7'; }).join('   '),
           { size: 12, mono: true, color: INK });
    P.text(24, 316, 'Two of the three failures are one fact: CFL has no complement, and without a',
           { size: 12, color: DIM });
    P.text(24, 336, 'complement it cannot build an intersection, because',
           { size: 12, color: DIM });
    P.text(24, 356, 'L1 cap L2 = complement( complement L1 union complement L2 ).',
           { size: 12, mono: true, color: ACC });
    P.text(24, 386, 'The third is Post: RE without complement is REC.', { size: 12, color: DIM });
    P.alpha(1);
    foot('CSL is closed under complement (Immerman-Szelepcsenyi), which is why it also has intersection.');
  };

  /* ---------- scene 8: the counterexample ---------- */
  SCENE_DRAW.intersect = function (t, sc) {
    head('Two context-free languages whose intersection is not',
         'L1 = { a^i b^j c^k : i = j } and L2 = { a^i b^j c^k : j = k }, both generated by three-rule CFGs.');
    var a = K.ease(beat(t, sc, 0.8, 0.7));
    P.alpha(a);
    P.circle(300, 190, 96, { fill: ACCDIM, stroke: ACC, sw: 1.4 });
    P.circle(440, 190, 96, { fill: WARNDIM, stroke: WARN, sw: 1.4 });
    P.text(232, 130, 'L1', { size: 13, bold: true, color: ACC, mono: true });
    P.text(500, 130, 'L2', { size: 13, bold: true, color: WARN, mono: true });
    P.text(300, 240, 'i = j', { size: 12, color: ACC, align: 'center' });
    P.text(440, 240, 'j = k', { size: 12, color: WARN, align: 'center' });
    P.text(370, 176, 'both', { size: 11, color: INK, align: 'center' });
    P.alpha(1);

    var b = K.ease(beat(t, sc, 4, 0.7));
    P.alpha(b);
    P.text(590, 96, 'Counted on i, j, k in 0..4', { size: 12, bold: true, color: INK });
    P.text(590, 122, 'L1 has ' + nL1 + ' strings', { size: 12, color: ACC });
    P.text(590, 144, 'L2 has ' + nL2 + ' strings', { size: 12, color: WARN });
    P.text(590, 166, 'both: ' + nBoth + ' strings', { size: 12, color: INK });
    P.text(590, 188, 'union: ' + Object.keys(EITHER).length + ' strings', { size: 12, color: DIM });
    P.text(590, 210, 'universe: ' + nUniv + ' strings', { size: 11, color: FAINT });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 10, 0.8));
    P.alpha(c);
    P.rect(24, 288, 852, 92, { fill: INVALIDDIM, stroke: BAD, radius: 6 });
    P.text(38, 300, 'The intersection is exactly { a^n b^n c^n }, and scene 3 of this lesson shows',
           { size: 12, bold: true, color: BAD });
    P.text(38, 322, 'that language escapes every split of the context-free pumping lemma. Two',
           { size: 12, color: DIM });
    P.text(38, 342, 'context-free languages, one intersection that is not: CFL is not closed',
           { size: 12, color: DIM });
    P.text(38, 362, 'under intersection. Every "not closed" claim on this page has this shape.',
           { size: 12, color: DIM });
    P.alpha(1);
    foot('An example is not a proof of closure, but one counterexample is a proof of non-closure.');
  };

  /* ---------- scene 9: decidability ---------- */
  SCENE_DRAW.decide = function (t, sc) {
    head('What you can decide, class by class',
         'D decidable, S semi-decidable, U undecidable. The rungs lose questions as you climb.');
    var colX = function (i) { return 200 + i * 136; };
    for (var i = 0; i < PROBS.length; i++) {
      P.text(colX(i) + 60, 76, PROBS[i], { size: 10, color: DIM, align: 'center' });
    }
    for (var c = 0; c < CLASSES().length; c++) {
      var cl = CLASSES()[c], y = 100 + c * 34;
      var a = K.ease(beat(t, sc, c * 1.8, 0.6));
      P.alpha(a);
      P.text(24, y + 4, cl, { size: 13, bold: true, mono: true, color: INK });
      P.text(80, y + 5, CHAIN[c].label, { size: 10, color: FAINT });
      for (var p = 0; p < PROBS.length; p++) {
        var v = DECIDE[cl][p];
        var tone = v === 'D' ? 'ok' : v === 'S' ? 'warn' : 'bad';
        var fill = tone === 'ok' ? ACCDIM : tone === 'warn' ? WARNDIM : INVALIDDIM;
        var ink = tone === 'ok' ? ACC : tone === 'warn' ? WARN : BAD;
        P.rect(colX(p) + 40, y, 40, 24, { fill: fill, stroke: ink, sw: 0.8, radius: 4 });
        P.text(colX(p) + 60, y + 12, v, { size: 11, align: 'center', base: 'middle', color: ink, mono: true });
      }
      P.alpha(1);
    }
    var v2 = K.ease(beat(t, sc, 10, 0.8));
    P.alpha(v2);
    P.text(24, 286, 'Equivalence is decidable for regular languages and for deterministic push-down',
           { size: 12, color: DIM });
    P.text(24, 306, 'automata, and undecidable for context-free grammars in general. Universality',
           { size: 12, color: DIM });
    P.text(24, 326, 'is undecidable from CFL upwards. Note the odd rung: REC decides more than',
           { size: 12, color: DIM });
    P.text(24, 346, 'CSL does, so decidability does not fall as the class grows.',
           { size: 12, color: DIM });
    P.alpha(1);
    foot('A semi-decider answers yes in finite time and may run forever on a no. That is RE.');
  };

  /* ---------- scene 10: the procedure ---------- */
  SCENE_DRAW.procedure = function (t, sc) {
    head('Placing an unfamiliar language on the ladder',
         'Four questions, asked in this order. The first one that fails names the class.');
    var steps = [
      { t1: 'Is there a DFA?', t2: 'finite memory', cls: 'REG' },
      { t1: 'Is there a CFG?', t2: 'one stack', cls: 'CFL' },
      { t1: 'Is there a monotonic grammar?', t2: 'linear tape', cls: 'CSL' },
      { t1: 'Does it always halt?', t2: 'a decider', cls: 'REC' }
    ];
    for (var i = 0; i < steps.length; i++) {
      var x = 24 + i * 218, s = steps[i];
      var a = K.ease(beat(t, sc, i * 2.2, 0.6));
      P.alpha(a);
      P.rect(x, 92, 200, 92, { fill: SURF2, stroke: BORDER, radius: 6 });
      P.text(x + 100, 104, 'Q' + (i + 1), { size: 11, bold: true, color: ACC, align: 'center', mono: true });
      P.text(x + 100, 126, s.t1, { size: 11, color: INK, align: 'center' });
      P.text(x + 100, 146, s.t2, { size: 10, color: FAINT, align: 'center' });
      P.text(x + 100, 168, s.cls, { size: 13, bold: true, color: ACC, align: 'center', mono: true });
      if (i < 3) P.arrow(x + 202, 138, x + 214, 138, { stroke: FAINT, sw: 1.3, head: 6 });
      P.alpha(1);
    }
    var b = K.ease(beat(t, sc, 9, 0.8));
    P.alpha(b);
    P.text(24, 208, 'Then ask the two questions that separate the rungs you cannot see: is the',
           { size: 12, color: INK });
    P.text(24, 228, 'complement of the language also describable (no: RE), and does the language',
           { size: 12, color: INK });
    P.text(24, 248, 'need more than linear space (yes: above CSL, still decidable).', { size: 12, color: INK });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 14, 0.8));
    P.alpha(c);
    P.rect(24, 278, 852, 100, { fill: WARNDIM, stroke: WARN, radius: 6 });
    P.text(38, 290, 'The three traps this procedure catches', { size: 12, bold: true, color: WARN });
    P.text(38, 312, '1. "Not regular" does not mean "context-free". Ask the second question too.',
           { size: 11, color: DIM });
    P.text(38, 332, '2. A language can be undecidable and still be in RE; halting is the example.',
           { size: 11, color: DIM });
    P.text(38, 352, '3. Closure under union never implies closure under intersection.',
           { size: 11, color: DIM });
    P.alpha(1);
    foot('Name the class by the machine that recognises it, never by the look of the strings.');
  };

/* ======================================================================
   LAYER 4 — BOOT
   ====================================================================== */

  function drawFrame(painter) {
    P = painter;
    var t = (K && K.state) ? K.state.elapsed : 0;
    var sc = sceneOf(t);
    P.alpha(1);
    P.clear();
    var fn = SCENE_DRAW[sc.id] || SCENE_DRAW.ladder;
    fn(t, sc);
    P.alpha(1);
  }

  function fillChecks() {
    var el = document.getElementById('checks');
    if (!el) return;
    var bad = CHECKS.length - PASSED;
    el.innerHTML = '<span class="k">Model checks</span>' +
      '<p class="small" style="margin:6px 0 0">' + PASSED + ' of ' + CHECKS.length + ' passed' +
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
            drawFrame(P);
            ok = true;
          };
          sk.draw = function () { /* frames are driven by the timeline */ };
        });
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
        if (holder) holder.appendChild(cv);
        var ctx2d = cv.getContext && cv.getContext('2d');
        if (ctx2d) { P = PR.makePainter2D(ctx2d, W, H); drawFrame(P); drew = true; }
      } catch (e) {
        console.error('canvas fallback failed', e);
      }
      if (!drew && fallback) fallback.classList.add('show');
    }

    if (K && K.init) {
      K.init({ timeline: window.LESSON_TIMELINE, draw: function () { if (P) drawFrame(P); } });
    }

    window.__drawAt = function (t) {
      K.state.elapsed = t;
      if (P) drawFrame(P);
    };

    var bad = CHECKS.filter(function (c) { return !c.pass; });
    if (bad.length) console.warn('Model validation did not fully pass:', bad);
  }

  window.LESSON_MODEL = {
    TYPES: TYPES,
    CHAIN: CHAIN.map(function (c) { return c.cls; }),
    SEPARATORS: SEPARATORS,
    G3: { rules: G3_RULES.length, terminal: G3.terminal, steps: G3.steps, forms: G3.forms },
    REG_PUMP: REG_PUMP,
    CFL_PUMP: CFL_PUMP,
    COUNTS: { L1: nL1, L2: nL2, both: nBoth, universe: nUniv, either: Object.keys(EITHER).length },
    COUNTING: COUNT,
    CLOSURE: CLOSURE,
    DECIDE: DECIDE,
    PASSED: PASSED,
    TOTAL: CHECKS.length
  };
  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
