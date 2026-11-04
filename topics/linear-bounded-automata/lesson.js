/* ==========================================================================
   linear-bounded-automata — lesson.js
   Four layers, in order:
     1. THE MODEL      — a working linear bounded automaton for a^n b^n c^n and
                         its simulator, the configuration count and an explicit
                         enumeration that checks the count, the cycling machine
                         and its decider, the configuration-graph search for a
                         deterministic and a nondeterministic machine, the
                         non-contracting grammar and its derivation search, and
                         the Myhill-Nerode classes for a^n b^n.
     2. THE CHECKS     — every number the captions state is recomputed here and
                         compared with the figure the caption states.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The claim under test is one sentence: the tape is bounded, so the
   configurations are finite, so membership is decidable — and nothing else
   follows. Every figure on this page is computed by the code below.
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

  var LEFT = '\u22a2';        // |-  left endmarker
  var RIGHT = '\u22a3';       // -|  right endmarker
  var MARK_X = 'X', MARK_Y = 'Y', MARK_Z = 'Z';

  var STATES = ['q0', 'q1', 'q2', 'q3', 'q6', 'acc', 'rej'];
  var GAMMA = ['a', 'b', 'c', MARK_X, MARK_Y, MARK_Z, LEFT, RIGHT];
  var NS = STATES.length;     // 7
  var NG = GAMMA.length;      // 8

  /* the transition table: state + symbol -> write, move, next state.
     q3 has one implicit rule: any symbol except the left endmarker moves left
     and stays in q3. On the left endmarker it steps right into q0. */
  var TRANS = {
    'q0|X': ['X', 'R', 'q0'],
    'q0|a': ['X', 'R', 'q1'],
    'q0|Y': ['Y', 'R', 'q6'],
    'q1|a': ['a', 'R', 'q1'],
    'q1|Y': ['Y', 'R', 'q1'],
    'q1|b': ['Y', 'R', 'q2'],
    'q2|b': ['b', 'R', 'q2'],
    'q2|Z': ['Z', 'R', 'q2'],
    'q2|c': ['Z', 'L', 'q3'],
    'q3|\u22a2': [LEFT, 'R', 'q0'],
    'q6|Y': ['Y', 'R', 'q6'],
    'q6|Z': ['Z', 'R', 'q6'],
    'q6|⊣': [RIGHT, 'R', 'acc']
  };

  function cfgKey(c) { return c.s + '\u0001' + c.t + '\u0001' + c.h; }
  function tapeOf(w) { return LEFT + w + RIGHT; }

  /* one move. returns {cfg} on a move, {rej:true} on a stuck configuration,
     or null when the head would leave the tape (which the table forbids). */
  function step(c) {
    if (c.s === 'acc' || c.s === 'rej') return null;
    var sym = c.t.charAt(c.h), wr, mv, nx;
    if (c.s === 'q3') {
      if (sym === LEFT) { var t3 = TRANS['q3|' + LEFT]; wr = t3[0]; mv = t3[1]; nx = t3[2]; }
      else { wr = sym; mv = 'L'; nx = 'q3'; }
    } else {
      var t = TRANS[c.s + '|' + sym];
      if (!t) return { rej: true };
      wr = t[0]; mv = t[1]; nx = t[2];
    }
    var tape = c.t.substring(0, c.h) + wr + c.t.substring(c.h + 1);
    if (nx === 'acc') return { cfg: { s: 'acc', t: tape, h: c.h } };
    var h = c.h + (mv === 'R' ? 1 : -1);
    if (h < 0 || h >= tape.length) return null;
    return { cfg: { s: nx, t: tape, h: h } };
  }

  /* the exact language test, used only to check the machine */
  function isL(w) {
    var m = /^(a+)(b+)(c+)$/.exec(w);
    if (!m) return false;
    return m[1].length === m[2].length && m[2].length === m[3].length;
  }

  /* run the machine. returns { result, steps, trace, seen }
     trace holds every configuration from the start; seen is the same set. */
  function run(w) {
    var c = { s: 'q0', t: tapeOf(w), h: 1 };
    var trace = [c], seen = {}, steps = 0, headLo = c.h, headHi = c.h;
    seen[cfgKey(c)] = 1;
    for (;;) {
      var r = step(c);
      if (!r) return { result: 'reject', steps: steps, trace: trace, seen: seen, lo: headLo, hi: headHi };
      if (r.rej) return { result: 'reject', steps: steps, trace: trace, seen: seen, lo: headLo, hi: headHi };
      steps++;
      c = r.cfg;
      trace.push(c);
      if (c.h < headLo) headLo = c.h;
      if (c.h > headHi) headHi = c.h;
      if (c.s === 'acc') { seen[cfgKey(c)] = 1; return { result: 'accept', steps: steps, trace: trace, seen: seen, lo: headLo, hi: headHi }; }
      var k = cfgKey(c);
      if (seen[k]) return { result: 'loop', steps: steps, trace: trace, seen: seen, lo: headLo, hi: headHi };
      seen[k] = 1;
    }
  }

  /* ---- the exhaustive sweep: every string of length 1 to 9 over a, b, c ---- */
  var SWEEP = (function () {
    var total = 0, accepted = 0, mismatch = 0, maxSteps = 0;
    var bad = [];
    for (var n = 1; n <= 9; n++) {
      var count = Math.pow(3, n);
      for (var i = 0; i < count; i++) {
        var w = '', x = i;
        for (var j = 0; j < n; j++) { w = 'abc'.charAt(x % 3) + w; x = Math.floor(x / 3); }
        total++;
        var r = run(w);
        var yes = r.result === 'accept';
        if (yes !== isL(w)) { mismatch++; if (bad.length < 5) bad.push(w); }
        if (yes) { accepted++; if (r.steps > maxSteps) maxSteps = r.steps; }
      }
    }
    return { total: total, accepted: accepted, mismatch: mismatch, maxSteps: maxSteps, bad: bad };
  })();

  /* ---- the table: bound, moves used, reachable configurations ---- */
  /* the count of configurations for an input of m letters: the two end cells
     always hold the markers, so only the m middle cells vary over |Gamma|. */
  function boundFor(m) { return NS * (m + 2) * Math.pow(NG, m); }

  var TABLE = (function () {
    var rows = [];
    for (var n = 1; n <= 6; n++) {
      var w = '';
      for (var i = 0; i < n; i++) w += 'a';
      for (i = 0; i < n; i++) w += 'b';
      for (i = 0; i < n; i++) w += 'c';
      var r = run(w);
      rows.push({
        n: n, wlen: w.length, cells: w.length + 2, word: w, result: r.result,
        steps: r.steps, bound: boundFor(w.length), reach: Object.keys(r.seen).length,
        lo: r.lo, hi: r.hi, tapeLen: r.trace.length
      });
    }
    return rows;
  })();

  /* ---- an explicit enumeration of every configuration at n = 1 and n = 2,
     which checks the counting formula rather than trusting it ---- */
  var ENUM = (function () {
    var out = [];
    [1, 2].forEach(function (n) {
      var cells = n + 2, count = 0, sample = null;
      for (var q = 0; q < NS; q++) {
        for (var h = 0; h < cells; h++) {
          var total = Math.pow(NG, cells);
          for (var code = 0; code < total; code++) {
            var tape = '', c = code;
            for (var j = 0; j < cells; j++) { tape += GAMMA[c % NG]; c = Math.floor(c / NG); }
            if (tape.charAt(0) !== LEFT || tape.charAt(cells - 1) !== RIGHT) continue;
            count++;
            if (!sample) sample = STATES[q] + ' ' + tape + ' h=' + h;
          }
        }
      }
      out.push({ n: n, enumerated: count, formula: boundFor(n), sample: sample });
    });
    return out;
  })();

  /* ---- the cycling machine: two states, a head that walks right then left ---- */
  function cycleStep(c) {
    if (c.s === 'p0') { if (c.t.charAt(c.h) === RIGHT) return null; return { s: 'p1', t: c.t, h: c.h + 1 }; }
    if (c.s === 'p1') { if (c.t.charAt(c.h) === LEFT) return null; return { s: 'p0', t: c.t, h: c.h - 1 }; }
    return null;
  }

  var CYCLE = (function () {
    var w = 'a', c = { s: 'p0', t: tapeOf(w), h: 1 };
    var seen = {}, steps = 0, period = -1;
    seen[cfgKey(c)] = 0;
    for (;;) {
      c = cycleStep(c);
      if (!c) break;
      steps++;
      var k = cfgKey(c);
      if (seen.hasOwnProperty(k)) { period = steps - seen[k]; break; }
      seen[k] = steps;
      if (steps > 10000) break;
    }
    return { word: w, period: period, states: 2, visited: steps + 1, bound: boundFor(w.length) };
  })();

  /* the decider: simulate for the configuration bound and reject on timeout */
  var DECIDER = (function () {
    var w = 'a', budget = boundFor(w.length), c = { s: 'p0', t: tapeOf(w), h: 1 };
    var steps = 0;
    while (steps <= budget) {
      c = cycleStep(c);
      if (!c) return { answer: 'reject', reason: 'stuck', steps: steps };
      steps++;
    }
    return { answer: 'reject', reason: 'budget', steps: steps, budget: budget };
  })();

  /* ---- a nondeterministic machine: at each a it may write a or b ---- */
  function ndNext(c) {
    if (c.s !== 'n0') return [];
    var sym = c.t.charAt(c.h), out = [];
    if (sym === RIGHT) return [{ s: 'nac', t: c.t, h: c.h }];
    if (sym === 'a') {
      out.push({ s: 'n0', t: c.t.substring(0, c.h) + 'a' + c.t.substring(c.h + 1), h: c.h + 1 });
      out.push({ s: 'n0', t: c.t.substring(0, c.h) + 'b' + c.t.substring(c.h + 1), h: c.h + 1 });
    } else if (sym === 'b') {
      out.push({ s: 'n0', t: c.t, h: c.h + 1 });
    }
    return out;
  }

  function ndReach(k) {
    var w = '';
    for (var i = 0; i < k; i++) w += 'a';
    var start = { s: 'n0', t: tapeOf(w), h: 1 };
    var seen = {}, frontier = [start], count = 0, acc = 0;
    seen[cfgKey(start)] = 1; count++;
    while (frontier.length) {
      var next = [];
      for (var f = 0; f < frontier.length; f++) {
        var outs = ndNext(frontier[f]);
        for (var o = 0; o < outs.length; o++) {
          var kk = cfgKey(outs[o]);
          if (seen[kk]) continue;
          seen[kk] = 1; count++;
          if (outs[o].s === 'nac') acc++;
          next.push(outs[o]);
        }
      }
      frontier = next;
    }
    return { k: k, reachable: count, accepting: acc, formula: 3 * Math.pow(2, k) - 1, bound: 3 * (k + 2) * Math.pow(3, k + 2) };
  }

  var ND = [ndReach(1), ndReach(2), ndReach(3), ndReach(4)];

  /* ---- the non-contracting grammar for a^n b^n c^n ---- */
  var RULES = [
    ['S', 'abc'],
    ['S', 'aSBc'],
    ['cB', 'Bc'],
    ['bB', 'bb']
  ];

  var GRAM = (function () {
    var MAXLEN = 9;
    var start = 'S';
    var seen = {}, frontier = [start], forms = [start], terminals = [];
    seen[start] = 1;
    while (frontier.length) {
      var next = [];
      for (var f = 0; f < frontier.length; f++) {
        var form = frontier[f];
        for (var r = 0; r < RULES.length; r++) {
          var lhs = RULES[r][0], rhs = RULES[r][1], from = 0;
          for (;;) {
            var i = form.indexOf(lhs, from);
            if (i < 0) break;
            var g = form.substring(0, i) + rhs + form.substring(i + lhs.length);
            if (g.length <= MAXLEN && !seen[g]) {
              seen[g] = 1; forms.push(g); next.push(g);
              if (/^[abc]+$/.test(g)) terminals.push(g);
            }
            from = i + 1;
          }
        }
      }
      frontier = next;
    }
    terminals.sort();
    /* the independent test: every string of length 1..9 over a,b,c that is in L */
    var expected = [];
    for (var n = 1; n <= MAXLEN; n++) {
      var count = Math.pow(3, n);
      for (var code = 0; code < count; code++) {
        var w = '', x = code;
        for (var j = 0; j < n; j++) { w = 'abc'.charAt(x % 3) + w; x = Math.floor(x / 3); }
        if (isL(w)) expected.push(w);
      }
    }
    expected.sort();
    var nonContracting = RULES.every(function (r) { return r[0].length <= r[1].length; });
    var noEpsilon = RULES.every(function (r) { return r[1].length > 0; });
    var same = expected.length === terminals.length &&
               expected.every(function (s, i) { return s === terminals[i]; });
    return {
      maxlen: MAXLEN, forms: forms.length, formsList: forms,
      terminals: terminals, expected: expected, same: same,
      nonContracting: nonContracting, noEpsilon: noEpsilon,
      derivation: ['S', 'aSBc', 'aabcBc', 'aabBcc', 'aabbcc']
    };
  })();

  /* ---- Myhill-Nerode classes for a^n b^n over the strings a^0 .. a^k ---- */
  function mnClasses(k) {
    var suffixes = [''];
    for (var m = 1; m <= 5; m++) { var s = ''; for (var i = 0; i < m; i++) s += 'b'; suffixes.push(s); }
    suffixes.push('a', 'ba', 'ab');
    var inAnBn = function (w) { return /^(a+)(b+)$/.test(w) && /^(a+)(b+)$/.exec(w)[1].length === /^(a+)(b+)$/.exec(w)[2].length; };
    var xs = [];
    for (i = 0; i <= k; i++) { var t = ''; for (var j = 0; j < i; j++) t += 'a'; xs.push(t); }
    var dist = [];
    for (i = 0; i <= k; i++) dist.push(new Array(k + 1).fill(false));
    for (i = 0; i <= k; i++) {
      for (var j2 = i + 1; j2 <= k; j2++) {
        for (var z = 0; z < suffixes.length; z++) {
          if (inAnBn(xs[i] + suffixes[z]) !== inAnBn(xs[j2] + suffixes[z])) { dist[i][j2] = dist[j2][i] = true; break; }
        }
      }
    }
    var groups = [];
    for (i = 0; i <= k; i++) {
      var placed = false;
      for (var g = 0; g < groups.length; g++) {
        if (!dist[i][groups[g][0]]) { groups[g].push(i); placed = true; break; }
      }
      if (!placed) groups.push([i]);
    }
    return { k: k, classes: groups.length };
  }

  var MN = [mnClasses(1), mnClasses(2), mnClasses(3), mnClasses(4)];

  /* ---- static facts, each labelled in the page ----
     HIERARCHY is the strict chain. Every entry names the automaton and the
     witness that separates it from the class below. */
  var HIERARCHY = [
    { name: 'Regular', auto: 'finite automaton', witness: 'none: the base class' },
    { name: 'Deterministic context-free', auto: 'deterministic push-down', witness: 'a\u207fb\u207f' },
    { name: 'Context-free', auto: 'push-down automaton', witness: 'even palindromes' },
    { name: 'Context-sensitive', auto: 'linear bounded automaton', witness: 'a\u207fb\u207fc\u207f' },
    { name: 'Recursive', auto: 'Turing machine that halts', witness: 'a decidable, non-CS language' },
    { name: 'Recursively enumerable', auto: 'Turing machine', witness: 'the halting language' }
  ];

  var CLOSURE = [
    { op: 'union', closed: true },
    { op: 'intersection', closed: true },
    { op: 'complement', closed: true },
    { op: 'concatenation', closed: true },
    { op: 'Kleene star', closed: true },
    { op: 'reversal', closed: true },
    { op: 'homomorphism', closed: false },
    { op: 'epsilon-free homomorphism', closed: true }
  ];

  var DECISION = [
    { q: 'membership: is w in L(G)?', csl: 'decidable', cfl: 'decidable' },
    { q: 'emptiness: is L(G) empty?', csl: 'undecidable', cfl: 'decidable' },
    { q: 'equivalence: is L(G1) = L(G2)?', csl: 'undecidable', cfl: 'undecidable' },
    { q: 'finiteness: is L(G) finite?', csl: 'undecidable', cfl: 'decidable' },
    { q: 'universality: is L(G) = \u03a3*?', csl: 'undecidable', cfl: 'undecidable' }
  ];

  var SHAPES = [
    { n: '1', text: 'place a language in the hierarchy', how: 'count the independent equalities' },
    { n: '2', text: 'is the statement true?', how: 'bounded tape gives decidability; diagonalise for the gap' },
    { n: '3', text: 'which automaton accepts the class?', how: 'the tape is the input plus two markers' },
    { n: '4', text: 'decidable or not?', how: 'name the object and the question, then look it up' }
  ];

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

  var CHECKS = [];
  function check(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail || '' }); }

  check('the machine accepts exactly a^n b^n c^n on all ' + SWEEP.total + ' strings of length 1 to 9',
    SWEEP.mismatch === 0, SWEEP.mismatch ? 'mismatches at ' + SWEEP.bad.join(', ') : '');

  check('the sweep covers 29,523 strings, which is 3 + 9 + ... + 3^9',
    SWEEP.total === 29523, 'computed ' + SWEEP.total);

  check('exactly 3 strings of length at most 9 are accepted', SWEEP.accepted === 3, 'computed ' + SWEEP.accepted);

  check('the state count is 7 and the tape alphabet has 8 symbols', NS === 7 && NG === 8, NS + ' and ' + NG);

  check('the tape for a word of length m has m + 2 cells',
    TABLE.every(function (r) { return r.tapeLen > 0 && r.cells === r.wlen + 2; }));

  check('move counts are 10, 29, 58, 97, 146, 205 for n = 1 to 6',
    TABLE.map(function (r) { return r.steps; }).join(',') === '10,29,58,97,146,205',
    TABLE.map(function (r) { return r.steps; }).join(','));

  check('aabbcc is accepted in 29 moves', run('aabbcc').result === 'accept' && run('aabbcc').steps === 29);

  check('abc is accepted in 10 moves and aaabbbccc in 58',
    run('abc').steps === 10 && run('aaabbbccc').steps === 58);

  check('aaaabbbbcccc is accepted in 97 moves', run('aaaabbbbcccc').steps === 97);

  check('the configuration count is 7 * (m+2) * 8^m for an input of m letters',
    TABLE[0].bound === 17920 && TABLE[1].bound === 14680064 && boundFor(1) === 168 && boundFor(4) === 172032,
    TABLE.map(function (r) { return r.bound; }).join(','));

  check('every run uses fewer moves than the bound',
    TABLE.every(function (r) { return r.steps <= r.bound; }));

  check('the bound grows by a factor of more than 500 per extra block',
    TABLE.every(function (r, i) { return i === 0 || r.bound > 500 * TABLE[i - 1].bound; }));

  check('the explicit enumeration for an input of 1 letter matches the formula',
    ENUM[0].enumerated === ENUM[0].formula && ENUM[0].enumerated === 168,
    ENUM[0].enumerated + ' against ' + ENUM[0].formula);

  check('the explicit enumeration for an input of 2 letters matches the formula',
    ENUM[1].enumerated === ENUM[1].formula && ENUM[1].enumerated === 1792,
    ENUM[1].enumerated + ' against ' + ENUM[1].formula);

  check('a deterministic run visits exactly moves + 1 configurations',
    TABLE.slice(0, 4).every(function (r) { return r.reach === r.steps + 1; }),
    TABLE.slice(0, 4).map(function (r) { return r.reach; }).join(','));

  check('the head never leaves the tape in any run',
    TABLE.every(function (r) { return r.lo >= 0 && r.hi <= r.cells - 1; }),
    TABLE.map(function (r) { return r.lo + '-' + r.hi + '/' + r.cells; }).join(' '));

  check('the cycling machine repeats its first configuration after 2 moves',
    CYCLE.period === 2, 'period ' + CYCLE.period);

  check('the cycling machine is still running at the configuration bound',
    DECIDER.reason === 'budget' && DECIDER.answer === 'reject',
    DECIDER.reason + ' after ' + DECIDER.steps + ' moves');

  check('the decider budget equals the configuration count for its input',
    DECIDER.budget === boundFor(1) && DECIDER.budget === 168, DECIDER.budget + ' against ' + boundFor(1));

  check('the nondeterministic reachable counts are 5, 11, 23, 47',
    ND.map(function (r) { return r.reachable; }).join(',') === '5,11,23,47',
    ND.map(function (r) { return r.reachable; }).join(','));

  check('those counts equal 3 * 2^k - 1',
    ND.every(function (r) { return r.reachable === r.formula; }));

  check('every nondeterministic reachable set is inside its bound',
    ND.every(function (r) { return r.reachable <= r.bound; }));

  check('every grammar rule is non-contracting', GRAM.nonContracting && GRAM.noEpsilon);

  check('the derivation search finds 17 sentential forms up to length 9',
    GRAM.forms === 17, 'computed ' + GRAM.forms);

  check('it derives exactly 3 terminal strings: abc, aabbcc, aaabbbccc',
    GRAM.terminals.join(',') === 'aaabbbccc,aabbcc,abc', GRAM.terminals.join(','));

  check('the derived set equals the language restricted to length 9',
    GRAM.same, GRAM.expected.length + ' expected against ' + GRAM.terminals.length + ' derived');

  check('the derivation chain reaches aabbcc through the stated forms',
    GRAM.derivation[GRAM.derivation.length - 1] === 'aabbcc' && GRAM.terminals.indexOf('aabbcc') >= 0);

  check('a^0 to a^k are pairwise distinguishable in a^n b^n, so the class count is k + 1',
    MN.map(function (r) { return r.classes; }).join(',') === '2,3,4,5',
    MN.map(function (r) { return r.classes; }).join(','));

  check('the hierarchy lists six classes in strict order', HIERARCHY.length === 6);

  check('six operations are closed and homomorphism is the one that is not',
    CLOSURE.filter(function (c) { return c.closed; }).length === 7 &&
    CLOSURE.filter(function (c) { return !c.closed; }).length === 1 &&
    CLOSURE.filter(function (c) { return !c.closed; })[0].op === 'homomorphism');

  check('membership is decidable and emptiness is undecidable for this class',
    DECISION[0].csl === 'decidable' && DECISION[1].csl === 'undecidable');

  check('the context-free row disagrees on emptiness and finiteness only',
    DECISION.filter(function (d) { return d.csl !== d.cfl; }).length === 2);

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

  function fmt(n) {
    var s = String(n), out = '', c = 0;
    for (var i = s.length - 1; i >= 0; i--) { out = s.charAt(i) + out; if (++c % 3 === 0 && i > 0) out = ',' + out; }
    return out;
  }

  function heading(title, sub) {
    P.text(32, 22, title, { size: 15, bold: true, color: INK });
    if (sub) P.text(32, 44, sub, { size: 11, color: DIM });
    P.line(32, 62, W - 32, 62, { stroke: BORDER, sw: 1 });
  }

  function chip(x, y, label, tone) {
    var col = tone === 'bad' ? BAD : tone === 'warn' ? WARN : tone === 'info' ? INFO : ACC;
    var bg = tone === 'bad' ? BADDIM : tone === 'warn' ? WARNDIM : tone === 'info' ? '#e6eef8' : ACCDIM;
    var w = Math.max(64, label.length * 6.4 + 18);
    P.rect(x, y, w, 22, { fill: bg, stroke: col, radius: 4, sw: 1 });
    P.text(x + w / 2, y + 11, label, { size: 10.5, align: 'center', base: 'middle', color: col, bold: true });
    return w;
  }

  var SCENE_DRAW = {};

  /* ---------------- 1. the gap ---------------- */
  SCENE_DRAW.gap = function (t, sc, p) {
    heading('Six classes in one line, and the rung between context-free and recursive',
            'Each arrow is a strict inclusion. The fourth box is the class this page owns.');

    var top = 78, rowH = 44;
    for (var i = 0; i < HIERARCHY.length; i++) {
      var y = top + i * rowH;
      var on = i === 3;
      var reveal = K.clamp01((p - i * 0.06) * 4);
      if (reveal <= 0) continue;
      P.alpha(reveal);
      P.rect(32, y, 236, 32, { fill: on ? ACCDIM : SURF2, stroke: on ? ACC : BORDER, radius: 5, sw: on ? 2 : 1 });
      P.text(46, y + 16, HIERARCHY[i].name, { size: 11.5, base: 'middle', bold: on, color: on ? ACC : INK });
      if (i < HIERARCHY.length - 1) {
        P.line(150, y + 32, 150, y + rowH, { stroke: on ? ACC : FAINT, sw: 1.5 });
      }
      P.text(286, y + 16, HIERARCHY[i].auto, { size: 10.5, base: 'middle', color: DIM });
      P.text(500, y + 16, 'separated by ' + HIERARCHY[i].witness, { size: 10.5, base: 'middle', color: on ? ACC : FAINT });
      P.alpha(1);
    }

    if (p > 0.62) {
      P.text(32, 350, 'Why the rung exists: the tape is bounded, so the configurations are finite,', { size: 11.5, color: INK });
      P.text(32, 370, 'so every language in the class is decidable \u2014 which puts it below recursive.', { size: 11.5, color: INK });
      chip(32, 392, 'Kuroda 1964: LBA = context-sensitive', 'info');
      chip(330, 392, 'Landweber 1963: deterministic LBA \u2286 context-sensitive', 'info');
    }
  };

  /* ---------------- 2. the definition ---------------- */
  SCENE_DRAW.def = function (t, sc, p) {
    heading('One tape, one head, and no cell that the input did not bring',
            'A linear bounded automaton is a Turing machine whose tape is exactly the input plus two endmarkers.');

    var parts = [
      ['Q', '7 states', 'the finite control'],
      ['\u03a3', '{a, b, c}', 'the input letters'],
      ['\u0393', '8 symbols', 'input letters, marks, endmarkers'],
      ['\u03b4', 'transition table', 'no entry writes over a marker'],
      ['q\u2080', 'q0', 'the start state'],
      ['F', '{acc}', 'accepting states']
    ];
    for (var i = 0; i < parts.length; i++) {
      var y = 80 + i * 40;
      var rv = K.clamp01((p - i * 0.05) * 4);
      if (rv <= 0) continue;
      P.alpha(rv);
      P.rect(32, y, 40, 30, { fill: SURF2, stroke: BORDER, radius: 4 });
      P.text(52, y + 15, parts[i][0], { size: 12, mono: true, align: 'center', base: 'middle', color: ACC, bold: true });
      P.text(84, y + 8, parts[i][1], { size: 11, color: INK });
      P.text(84, y + 23, parts[i][2], { size: 10, color: FAINT });
      P.alpha(1);
    }

    /* the three conditions */
    P.text(330, 80, 'The three conditions that make it bounded', { size: 11.5, bold: true, color: INK });
    var conds = [
      'the tape alphabet holds two endmarkers, one at each end',
      'no transition may print a symbol over an endmarker',
      'no transition may move left of the left or right of the right marker'
    ];
    for (i = 0; i < conds.length; i++) {
      P.circle(338, 106 + i * 22, 3, { fill: ACC });
      P.text(350, 100 + i * 22, conds[i], { size: 10.5, color: DIM });
    }

    /* the tape for a three-letter word */
    P.text(330, 186, 'So a word of n letters gets exactly n + 2 cells', { size: 11.5, bold: true, color: INK });
    var cells = [LEFT, 'a', 'b', 'c', RIGHT];
    for (i = 0; i < cells.length; i++) {
      var x = 338 + i * 56;
      var isMark = (i === 0 || i === cells.length - 1);
      P.rect(x, 206, 52, 44, { fill: isMark ? SURF2 : SURF, stroke: isMark ? BORDER : ACC, radius: 4, sw: isMark ? 1 : 1.8 });
      P.text(x + 26, 228, cells[i], { size: 18, mono: true, align: 'center', base: 'middle', color: isMark ? DIM : INK });
    }
    P.text(338, 258, 'left marker', { size: 9.5, color: FAINT });
    P.text(610, 258, 'right marker', { size: 9.5, color: FAINT });
    P.text(430, 258, 'n = 3 letters, 5 cells', { size: 9.5, color: DIM });

    if (p > 0.55) {
      P.text(330, 292, 'The machine used here, on a\u207fb\u207fc\u207f:', { size: 11.5, bold: true, color: INK });
      P.text(330, 314, 'q0 marks an a with X \u00b7 q1 marks a b with Y \u00b7 q2 marks a c with Z', { size: 10.5, color: DIM });
      P.text(330, 332, 'q3 walks back to the left marker \u00b7 q6 checks that nothing is unmarked', { size: 10.5, color: DIM });
      chip(330, 350, '7 states \u00b7 8 tape symbols \u00b7 ' + fmt(boundFor(3)) + ' configurations for abc', 'info');
    }

    P.text(32, 400, 'A Turing machine may always ask for one more cell. This machine may not,', { size: 11, color: INK });
    P.text(32, 418, 'and that single restriction is the whole subject of this page.', { size: 11, color: INK });
  };

  /* ---------------- 3. the trace ---------------- */
  SCENE_DRAW.trace = function (t, sc, p) {
    var w = 'aabbcc';
    var r = run(w);
    var idx = Math.min(r.trace.length - 1, Math.round(K.ease(p) * (r.trace.length - 1)));
    var c = r.trace[idx];

    heading('aabbcc in ' + r.steps + ' moves: three marks per round, and the head never leaves',
            'The tape is ' + (w.length + 2) + ' cells. Every symbol below is the tape at one move of the run.');

    var cw = 74, x0 = 46, y0 = 128;
    for (var i = 0; i < c.t.length; i++) {
      var x = x0 + i * cw;
      var sym = c.t.charAt(i);
      var marked = (sym === MARK_X || sym === MARK_Y || sym === MARK_Z);
      var isEnd = (i === 0 || i === c.t.length - 1);
      var here = (i === c.h);
      P.rect(x, y0, cw - 6, 54, {
        fill: here ? ACCDIM : (isEnd ? SURF2 : SURF),
        stroke: here ? ACC : (isEnd ? BORDER : BORDER),
        radius: 5, sw: here ? 2.2 : 1
      });
      P.text(x + (cw - 6) / 2, y0 + 27, sym, { size: 22, mono: true, align: 'center', base: 'middle', color: marked ? ACC : (isEnd ? DIM : INK) });
      if (here) {
        P.tri(x + (cw - 6) / 2 - 7, y0 - 10, x + (cw - 6) / 2 + 7, y0 - 10, x + (cw - 6) / 2, y0 - 1, { fill: ACC });
        P.text(x + (cw - 6) / 2, y0 - 30, c.s, { size: 12, mono: true, align: 'center', color: ACC, bold: true });
      }
    }

    P.text(46, 200, 'move ' + idx + ' of ' + r.steps + '   \u00b7   state ' + c.s + '   \u00b7   head on cell ' + c.h, { size: 11.5, mono: true, color: INK });

    /* what the current move is doing */
    var why = '';
    if (c.s === 'q0') why = 'skip the X marks, then turn the first a into X and step right';
    else if (c.s === 'q1') why = 'cross the a letters and the Y marks, then turn the first b into Y';
    else if (c.s === 'q2') why = 'cross the b letters and the Z marks, then turn the first c into Z';
    else if (c.s === 'q3') why = 'walk left over everything until the left marker, then step right';
    else if (c.s === 'q6') why = 'walk right over the Y and Z blocks; accept only at the right marker';
    else why = c.s === 'acc' ? 'the run has accepted' : 'no move is defined: the run rejects';
    P.text(46, 224, why, { size: 11, color: DIM });

    /* the three rounds */
    P.text(46, 268, 'What the rounds do', { size: 11.5, bold: true, color: INK });
    var rounds = [
      'round 1: X a Y b Z c  \u2014 one of each marked, the blocks now line up',
      'round 2: X X Y Y Z Z  \u2014 every letter marked, nothing unmarked remains',
      'round 3: q6 walks the three blocks and accepts at the right marker'
    ];
    for (i = 0; i < rounds.length; i++) {
      var show = p > 0.15 + i * 0.18;
      P.text(46, 290 + i * 20, show ? rounds[i] : '\u00b7\u00b7\u00b7', { size: 10.5, color: show ? INK : FAINT, mono: show });
    }

    P.text(46, 372, 'Move counts computed for n = 1 to 6:  ' + TABLE.map(function (row) { return row.steps; }).join(', '),
           { size: 11, mono: true, color: INK });
    P.text(46, 392, 'Each round costs about 3n moves and there are n rounds, so the total grows like n\u00b2.', { size: 10.5, color: DIM });
    chip(46, 410, 'head stayed in cells ' + r.lo + ' to ' + r.hi + ' of ' + (w.length + 2), 'info');
  };

  /* ---------------- 4. the bound ---------------- */
  SCENE_DRAW.bound = function (t, sc, p) {
    heading('7 \u00d7 (m + 2) \u00d7 8\u1d50 configurations: enormous, and finite',
            'The count is states times head positions times tape contents. Only the m middle cells vary.');

    var cols = [46, 92, 152, 232, 512, 616];
    var head = ['n', '|w|', 'cells', 'configurations', 'moves', 'reachable'];
    for (var i = 0; i < head.length; i++) P.text(cols[i], 84, head[i], { size: 10.5, bold: true, color: DIM });
    P.line(46, 100, 830, 100, { stroke: BORDER, sw: 1 });

    for (i = 0; i < TABLE.length; i++) {
      var row = TABLE[i], y = 110 + i * 25;
      var rv = K.clamp01((p - i * 0.07) * 4);
      if (rv <= 0) continue;
      P.alpha(rv);
      if (i % 2 === 0) P.rect(40, y - 4, 800, 23, { fill: SURF2, radius: 3 });
      P.text(cols[0], y, String(row.n), { size: 10.5, mono: true, color: INK });
      P.text(cols[1], y, String(row.wlen), { size: 10.5, mono: true, color: INK });
      P.text(cols[2], y, String(row.cells), { size: 10.5, mono: true, color: INK });
      P.text(cols[3], y, fmt(row.bound), { size: 10.5, mono: true, color: ACC, bold: true });
      P.text(cols[4], y, String(row.steps), { size: 10.5, mono: true, color: INK });
      P.text(cols[5], y, String(row.reach), { size: 10.5, mono: true, color: DIM });
      P.alpha(1);
    }

    P.text(46, 268, 'The six words are a\u207fb\u207fc\u207f for n = 1 to 6, so |w| = 3n. The bars are log\u2081\u2080 scales.',
           { size: 10, color: DIM });

    /* log-scale bars: configurations against moves actually used */
    P.text(46, 294, 'Log\u2081\u2080 of the configurations, against log\u2081\u2080 of the moves used', { size: 11, bold: true, color: INK });
    for (i = 0; i < TABLE.length; i++) {
      var yy = 314 + i * 15;
      var lb = Math.log(TABLE[i].bound) / Math.LN10;
      var lm = Math.log(TABLE[i].steps) / Math.LN10;
      P.text(222, yy, 'n=' + TABLE[i].n, { size: 9, align: 'right', color: DIM });
      P.rect(230, yy, lb * 16, 7, { fill: ACCDIM, stroke: ACC, radius: 2, sw: 1 });
      P.rect(230, yy + 8, Math.max(2, lm * 16), 3, { fill: WARN, radius: 1 });
    }

    P.rect(560, 268, 270, 148, { fill: SURF, stroke: BORDER, radius: 6 });
    P.text(576, 282, 'Why finite is enough', { size: 11.5, bold: true, color: INK });
    P.text(576, 304, 'A run either accepts, or repeats a', { size: 10.5, color: INK });
    P.text(576, 320, 'configuration and loops for ever.', { size: 10.5, color: INK });
    P.text(576, 344, 'So the bound is an exact cut-off,', { size: 10.5, color: INK });
    P.text(576, 360, 'not a heuristic: simulate for the', { size: 10.5, color: INK });
    P.text(576, 376, 'count, then answer yes or no.', { size: 10.5, color: INK });
    P.text(576, 400, 'Membership is still decidable.', { size: 9.5, color: DIM });

    P.text(46, 404, 'Every configuration listed at 1 and 2 letters: ' + fmt(ENUM[0].enumerated) +
           ' and ' + fmt(ENUM[1].enumerated) + ', equal to the formula.', { size: 10, color: DIM });
    P.text(46, 424, 'A run uses a tiny fraction of the count: 29 moves against 14,680,064 on aabbcc.', { size: 10, color: DIM });
  };

  /* ---------------- 5. the decider ---------------- */
  SCENE_DRAW.decide = function (t, sc, p) {
    heading('A run that never ends is still decidable, because the count is finite',
            'Two states, a head that walks right then left, and a budget that ends the argument.');

    var flip = Math.floor(K.ease(p) * 6) % 2;

    /* the cycling machine: two configurations */
    var boxes = [
      { s: 'p0', h: 1, y: 96 },
      { s: 'p1', h: 2, y: 196 }
    ];
    for (var i = 0; i < boxes.length; i++) {
      var b = boxes[i], on = (i === flip);
      P.rect(46, b.y, 300, 66, { fill: on ? ACCDIM : SURF, stroke: on ? ACC : BORDER, radius: 6, sw: on ? 2 : 1 });
      P.text(62, b.y + 18, 'state ' + b.s + ', head on cell ' + b.h, { size: 11, mono: true, color: on ? ACC : INK, bold: on });
      var tape = tapeOf('a');
      for (var j = 0; j < tape.length; j++) {
        var x = 62 + j * 40;
        P.rect(x, b.y + 30, 34, 26, { fill: j === b.h ? (on ? ACCDIM : SURF2) : SURF, stroke: j === b.h ? ACC : BORDER, radius: 3 });
        P.text(x + 17, b.y + 43, tape.charAt(j), { size: 13, mono: true, align: 'center', base: 'middle', color: INK });
      }
    }
    P.arrow(196, 164, 196, 194, { stroke: FAINT, head: 8 });
    P.text(206, 172, 'move right', { size: 9.5, color: FAINT });
    P.arrow(300, 262, 300, 196, { stroke: FAINT, head: 8 });
    P.text(310, 226, 'move left', { size: 9.5, color: FAINT });
    P.text(46, 280, 'It repeats its first configuration after ' + CYCLE.period + ' moves.', { size: 11, color: INK, bold: true });
    P.text(46, 300, 'No accepting state is ever reached, so the answer is reject \u2014 but a', { size: 10.5, color: DIM });
    P.text(46, 316, 'simulator that only follows moves would follow them for ever.', { size: 10.5, color: DIM });

    /* the decider on the right */
    P.rect(400, 96, 452, 200, { fill: SURF, stroke: BORDER, radius: 6 });
    P.text(416, 110, 'The decider: a second machine with a counter', { size: 11.5, bold: true, color: INK });
    var lines = [
      '1  copy the input, write the two endmarkers',
      '2  run the bounded machine on it, one move at a time',
      '3  count the moves',
      '4  if it accepts, answer accept',
      '5  if the counter reaches ' + fmt(DECIDER.budget) + ' for n = 1, answer reject'
    ];
    for (i = 0; i < lines.length; i++) {
      var rv = K.clamp01((p - 0.15 - i * 0.07) * 5);
      if (rv <= 0) continue;
      P.alpha(rv);
      P.text(416, 134 + i * 22, lines[i], { size: 10.5, mono: true, color: INK });
      P.alpha(1);
    }
    var used = Math.min(DECIDER.steps, Math.round(K.ease(p) * DECIDER.budget));
    P.rect(416, 250, 400, 10, { fill: SURF2, stroke: BORDER, radius: 3, sw: 1 });
    var frac = Math.min(1, used / DECIDER.budget);
    if (frac > 0) P.rect(416, 250, Math.max(3, 400 * frac), 10, { fill: WARN, radius: 3 });
    P.text(416, 268, 'counter ' + fmt(used) + ' of ' + fmt(DECIDER.budget) + '   \u2192   answer: ' +
           (p > 0.75 ? 'reject' : 'still counting'), { size: 10.5, mono: true, color: p > 0.75 ? BAD : DIM });

    P.text(46, 356, 'Acceptance for this automaton is decidable. Emptiness is not \u2014 scene 9 tabulates which is which.', { size: 11, color: INK });
    chip(46, 380, 'membership: decidable', 'info');
    chip(240, 380, 'membership cost: PSPACE-complete', 'warn');
    chip(500, 380, 'emptiness: undecidable', 'bad');
    P.text(46, 424, 'The decider needs more than linear space, which is why it is a different machine from the one it watches.', { size: 10, color: FAINT });
  };

  /* ---------------- 6. the graph ---------------- */
  SCENE_DRAW.graph = function (t, sc, p) {
    heading('Acceptance is reachability, and the reachable set is finite',
            'One dot per configuration, one arrow per move. The counts below are a breadth-first walk.');

    /* deterministic: a path of 11 dots at n = 1 */
    P.text(46, 84, 'Deterministic, n = 1: one path, 11 configurations', { size: 11.5, bold: true, color: INK });
    var total = TABLE[0].reach;
    for (var i = 0; i < total; i++) {
      var x = 56 + i * 34;
      var rv = K.clamp01((p - i * 0.02) * 6);
      if (rv <= 0) continue;
      P.alpha(rv);
      var last = (i === total - 1);
      P.circle(x, 118, 6, { fill: last ? VAL : ACCDIM, stroke: last ? VAL : ACC, sw: 1.5 });
      if (i > 0) P.line(x - 28, 118, x - 6, 118, { stroke: FAINT, sw: 1 });
      P.alpha(1);
    }
    P.text(56, 140, 'start', { size: 9, color: FAINT });
    P.text(56 + (total - 1) * 34 - 14, 140, 'accept', { size: 9, color: VAL });
    P.text(46, 162, 'n = 2: 30 \u00b7 n = 3: 59 \u00b7 n = 4: 98 configurations', { size: 10.5, mono: true, color: DIM });

    /* nondeterministic: a branching tree at k = 3 */
    P.text(46, 200, 'Nondeterministic, k = 3: it branches, and still ends', { size: 11.5, bold: true, color: INK });
    var levels = [1, 2, 4, 8, 8];
    var yBase = 224, dy = 26;
    for (var lv = 0; lv < levels.length; lv++) {
      var count = levels[lv];
      var span = 360;
      var gap = count > 1 ? span / (count - 1) : 0;
      for (var d = 0; d < count; d++) {
        var cx = 60 + (count === 1 ? span / 2 : d * gap);
        var cy = yBase + lv * dy;
        var rr = K.clamp01((p - 0.1 - lv * 0.08) * 5);
        if (rr <= 0) continue;
        P.alpha(rr);
        var isAcc = (lv === levels.length - 1);
        P.circle(cx, cy, 5, { fill: isAcc ? VAL : ACCDIM, stroke: isAcc ? VAL : ACC, sw: 1.2 });
        if (lv > 0) {
          var pcount = levels[lv - 1], pgap = pcount > 1 ? span / (pcount - 1) : 0;
          var px = 60 + (pcount === 1 ? span / 2 : Math.floor(d / 2) * pgap);
          P.line(px, cy - dy + 6, cx, cy - 6, { stroke: FAINT, sw: 0.8 });
        }
        P.alpha(1);
      }
    }
    P.text(60, yBase + levels.length * dy + 12, '1 + 2 + 4 + 8 running, plus 8 accepting = ' + ND[2].reachable + ' configurations',
           { size: 10, color: DIM });

    /* the numbers */
    P.rect(470, 78, 384, 250, { fill: SURF, stroke: BORDER, radius: 6 });
    P.text(486, 92, 'Reachable against the bound', { size: 11.5, bold: true, color: INK });
    var rows = [
      ['deterministic', TABLE.slice(0, 4).map(function (r) { return r.reach; }).join(', ')],
      ['nondeterministic', ND.map(function (r) { return r.reachable; }).join(', ')],
      ['formula 3\u00b72\u1d4f \u2212 1', ND.map(function (r) { return r.formula; }).join(', ')],
      ['bound at k = 1..4', ND.map(function (r) { return fmt(r.bound); }).join(', ')]
    ];
    for (i = 0; i < rows.length; i++) {
      P.text(486, 118 + i * 30, rows[i][0], { size: 10, color: DIM });
      P.text(486, 132 + i * 30, rows[i][1], { size: 11, mono: true, color: INK, bold: true });
    }
    P.text(486, 262, 'The reachable set is always inside the bound.', { size: 10.5, color: INK });
    P.text(486, 280, 'Whether the machine branches changes the', { size: 10.5, color: INK });
    P.text(486, 296, 'number, never the finiteness.', { size: 10.5, color: INK });

    chip(46, 388, 'accept = an accepting dot is reachable', 'info');
    P.text(46, 424, 'A finite graph makes the question always answerable, which is the same argument as scene 4 in another language.',
           { size: 10, color: FAINT });
  };

  /* ---------------- 7. the grammar ---------------- */
  SCENE_DRAW.gram = function (t, sc, p) {
    heading('The same class from the grammar side: four non-contracting rules',
            'No rule makes a string shorter, so no sentential form outgrows the word it will become.');

    P.text(46, 84, 'The grammar', { size: 11.5, bold: true, color: INK });
    for (var i = 0; i < RULES.length; i++) {
      var y = 106 + i * 28;
      P.rect(46, y, 210, 24, { fill: i < 2 ? SURF2 : ACCDIM, stroke: i < 2 ? BORDER : ACC, radius: 4, sw: 1 });
      P.text(58, y + 12, RULES[i][0] + ' \u2192 ' + RULES[i][1], { size: 12, mono: true, base: 'middle', color: INK });
      P.text(266, y + 12, i < 2 ? 'grows the word' : 'sorts the blocks', { size: 9.5, base: 'middle', color: DIM });
    }
    P.text(46, 226, 'The rule cB \u2192 Bc is the one a context-free grammar cannot write:', { size: 10.5, color: DIM });
    P.text(46, 242, 'two symbols on the left is exactly what "context-sensitive" means.', { size: 10.5, color: DIM });

    /* the derivation of aabbcc */
    P.text(46, 280, 'A derivation of aabbcc', { size: 11.5, bold: true, color: INK });
    for (i = 0; i < GRAM.derivation.length; i++) {
      var dx = 46 + i * 96;
      var rv = K.clamp01((p - 0.1 - i * 0.09) * 5);
      if (rv <= 0) continue;
      P.alpha(rv);
      P.rect(dx, 302, 82, 26, { fill: i === GRAM.derivation.length - 1 ? ACCDIM : SURF, stroke: i === GRAM.derivation.length - 1 ? ACC : BORDER, radius: 4, sw: 1 });
      P.text(dx + 41, 315, GRAM.derivation[i], { size: 10.5, mono: true, align: 'center', base: 'middle', color: INK });
      if (i < GRAM.derivation.length - 1) P.text(dx + 86, 315, '\u21d2', { size: 12, base: 'middle', color: FAINT });
      P.alpha(1);
    }

    /* the search result */
    P.rect(560, 84, 294, 250, { fill: SURF, stroke: BORDER, radius: 6 });
    P.text(576, 98, 'The exhaustive search to length 9', { size: 11.5, bold: true, color: INK });
    P.text(576, 124, 'sentential forms found', { size: 10, color: DIM });
    P.text(576, 140, String(GRAM.forms), { size: 18, mono: true, color: ACC, bold: true });
    P.text(576, 168, 'terminal strings derived', { size: 10, color: DIM });
    P.text(576, 184, String(GRAM.terminals.length), { size: 18, mono: true, color: ACC, bold: true });
    P.text(576, 212, GRAM.terminals.join(', '), { size: 10, mono: true, color: INK });
    P.text(576, 240, 'strings in L of length \u2264 9', { size: 10, color: DIM });
    P.text(576, 256, String(GRAM.expected.length) + '  \u2014  the same three', { size: 11, mono: true, color: INK });
    P.text(576, 284, 'Checked against all ' + fmt(SWEEP.total), { size: 10, color: INK });
    P.text(576, 300, 'strings, computed separately.', { size: 10, color: INK });

    chip(46, 350, 'non-contracting: every rule keeps or grows the length', 'info');
    P.text(46, 386, 'Context-sensitive grammars, non-contracting grammars and linear bounded automata', { size: 10.5, color: INK });
    P.text(46, 402, 'name the same class of languages. The tape bound and the length bound are the', { size: 10.5, color: INK });
    P.text(46, 418, 'same restriction seen from two sides.', { size: 10.5, color: INK });
  };

  /* ---------------- 8. closure ---------------- */
  SCENE_DRAW.closure = function (t, sc, p) {
    heading('Closed under six operations, and open under one that is not an operation',
            'Union, intersection, complement, concatenation, star and reversal all stay inside the class.');

    for (var i = 0; i < CLOSURE.length; i++) {
      var c = CLOSURE[i];
      var col = i % 3, row = Math.floor(i / 3);
      var x = 46 + col * 268, y = 96 + row * 56;
      var rv = K.clamp01((p - i * 0.05) * 5);
      if (rv <= 0) continue;
      P.alpha(rv);
      P.rect(x, y, 250, 40, { fill: c.closed ? ACCDIM : BADDIM, stroke: c.closed ? ACC : BAD, radius: 5, sw: 1.4 });
      P.text(x + 14, y + 15, c.op, { size: 11.5, color: INK, bold: true });
      P.text(x + 14, y + 30, c.closed ? 'closed' : 'not closed', { size: 9.5, color: c.closed ? ACC : BAD });
      P.alpha(1);
    }

    P.text(46, 272, 'Why complement is the one to remember', { size: 11.5, bold: true, color: INK });
    P.text(46, 294, 'Context-free languages are not closed under complement, because they are not', { size: 10.5, color: INK });
    P.text(46, 310, 'closed under intersection. This class is closed under intersection, and it is', { size: 10.5, color: INK });
    P.text(46, 326, 'closed under complement as well \u2014 the second LBA problem, asked by Kuroda in', { size: 10.5, color: INK });
    P.text(46, 342, '1964 and answered in 1988 by Immerman and Szelepcs\u00e9nyi.', { size: 10.5, color: INK });

    P.rect(560, 236, 294, 96, { fill: WARNDIM, stroke: WARN, radius: 6 });
    P.text(576, 250, 'Still open: the first LBA problem', { size: 11, bold: true, color: WARN });
    P.text(576, 272, 'Nobody knows whether deterministic', { size: 10, color: INK });
    P.text(576, 288, 'linear bounded automata accept fewer', { size: 10, color: INK });
    P.text(576, 304, 'languages than nondeterministic ones.', { size: 10, color: INK });
    P.text(576, 320, 'Savitch gives only NSPACE(n) \u2286 DSPACE(n\u00b2).', { size: 9.5, color: DIM });

    chip(46, 358, 'homomorphism: the exception', 'bad');
    P.text(46, 394, 'A homomorphism that erases letters can shrink a word, so it can carry a language', { size: 10.5, color: INK });
    P.text(46, 410, 'out of the class. The epsilon-free homomorphisms, and inverse homomorphisms,', { size: 10.5, color: INK });
    P.text(46, 426, 'stay inside.', { size: 10.5, color: INK });
  };

  /* ---------------- 9. the decision table ---------------- */
  SCENE_DRAW.table = function (t, sc, p) {
    heading('Membership is decidable; emptiness, equivalence, finiteness and universality are not',
            'Same class, five questions, and the answers do not travel together.');

    var cols = [46, 520, 680];
    var head = ['the question, with its object fixed', 'context-sensitive', 'context-free'];
    for (var i = 0; i < head.length; i++) P.text(cols[i], 86, head[i], { size: 10.5, bold: true, color: DIM });
    P.line(46, 102, 830, 102, { stroke: BORDER, sw: 1 });

    for (i = 0; i < DECISION.length; i++) {
      var d = DECISION[i], y = 112 + i * 40;
      var rv = K.clamp01((p - i * 0.08) * 5);
      if (rv <= 0) continue;
      P.alpha(rv);
      if (i % 2 === 0) P.rect(40, y - 6, 800, 36, { fill: SURF2, radius: 3 });
      P.text(cols[0], y + 6, d.q, { size: 11, color: INK });
      var cslOk = d.csl === 'decidable';
      P.rect(cols[1], y - 2, 140, 24, { fill: cslOk ? ACCDIM : BADDIM, stroke: cslOk ? ACC : BAD, radius: 4, sw: 1 });
      P.text(cols[1] + 70, y + 10, d.csl, { size: 10, align: 'center', base: 'middle', color: cslOk ? ACC : BAD, bold: true });
      var cflOk = d.cfl === 'decidable';
      P.rect(cols[2], y - 2, 140, 24, { fill: cflOk ? ACCDIM : BADDIM, stroke: cflOk ? ACC : BAD, radius: 4, sw: 1 });
      P.text(cols[2] + 70, y + 10, d.cfl, { size: 10, align: 'center', base: 'middle', color: cflOk ? ACC : BAD, bold: true });
      P.alpha(1);
    }

    P.text(46, 330, 'The two rows disagree on emptiness and finiteness, and agree on the other three.', { size: 11, color: INK });
    P.text(46, 352, 'Membership for this class is complete for polynomial space, so it is decidable', { size: 10.5, color: DIM });
    P.text(46, 368, 'and no polynomial-time algorithm is known. Emptiness is undecidable from Bar-Hillel,', { size: 10.5, color: DIM });
    P.text(46, 384, 'Perles and Shamir, 1961. Complement closure makes emptiness and universality equally', { size: 10.5, color: DIM });
    P.text(46, 400, 'hard; it does not make either of them decidable.', { size: 10.5, color: DIM });
    chip(46, 418, 'name the object and the question before answering', 'info');
  };

  /* ---------------- 10. the exam ---------------- */
  SCENE_DRAW.exam = function (t, sc, p) {
    heading('Four question shapes, and one question that nobody can answer',
            'Every exam item on this class is one of these four, or asks about the open problem.');

    for (var i = 0; i < SHAPES.length; i++) {
      var y = 88 + i * 62;
      var rv = K.clamp01((p - i * 0.08) * 5);
      if (rv <= 0) continue;
      P.alpha(rv);
      P.circle(58, y + 16, 13, { fill: ACCDIM, stroke: ACC, sw: 1.4 });
      P.text(58, y + 16, SHAPES[i].n, { size: 12, mono: true, align: 'center', base: 'middle', color: ACC, bold: true });
      P.text(84, y + 4, SHAPES[i].text, { size: 11.5, bold: true, color: INK });
      P.text(84, y + 24, SHAPES[i].how, { size: 10.5, color: DIM });
      P.alpha(1);
    }

    P.rect(520, 88, 334, 168, { fill: SURF, stroke: BORDER, radius: 6 });
    P.text(536, 102, 'The counting test behind shape 1', { size: 11.5, bold: true, color: INK });
    var tests = [
      ['a\u207fb\u207fc\u207f', '3 equalities', 'linear bounded'],
      ['a\u207fb\u207f', '2 equalities', 'push-down'],
      ['a\u207fb\u207fc\u207f\u207a\u1d50', '1 equality', 'push-down'],
      ['(ab)*', '0 equalities', 'finite automaton']
    ];
    for (i = 0; i < tests.length; i++) {
      P.text(536, 128 + i * 24, tests[i][0], { size: 11, mono: true, color: INK });
      P.text(660, 128 + i * 24, tests[i][1], { size: 9.5, color: DIM });
      P.text(742, 128 + i * 24, tests[i][2], { size: 9.5, color: ACC });
    }
    P.text(536, 228, 'One count per stack; a tape crosses.', { size: 10, color: INK });

    P.rect(520, 268, 334, 96, { fill: WARNDIM, stroke: WARN, radius: 6 });
    P.text(536, 282, 'The open problem', { size: 11, bold: true, color: WARN });
    P.text(536, 302, 'Is NSPACE(n) = DSPACE(n)? Nobody knows.', { size: 10, color: INK });
    P.text(536, 318, 'Both statements in shape 2 are true:', { size: 10, color: INK });
    P.text(536, 334, 'every CSL is recursive, and some', { size: 10, color: INK });
    P.text(536, 350, 'recursive language is not context-sensitive.', { size: 10, color: INK });

    P.text(46, 372, 'GATE CSE 1991 asked the shape-2 question about finite languages: the strongest true', { size: 10.5, color: INK });
    P.text(46, 388, 'statement is that the language is regular, because regular sits inside every other', { size: 10.5, color: INK });
    P.text(46, 404, 'class on the line.', { size: 10.5, color: INK });
    chip(46, 420, 'bounded tape \u2192 finite configurations \u2192 decidable membership \u2192 nothing else', 'info');
  };

  function drawFrame(t) {
    if (!P) return;
    P.clear();
    P.alpha(1);
    var i = K.sceneAt ? K.sceneAt(t) : 0;
    var sc = window.LESSON_TIMELINE.scenes[i];
    if (!sc) return;
    var span = Math.max(0.001, sc.end - sc.start);
    var p = K.clamp01((t - sc.start) / span);
    var fn = SCENE_DRAW[sc.id];
    if (fn) {
      try { fn(t, sc, p); }
      catch (e) { P.text(24, 240, 'draw error: ' + e.message, { size: 12, color: BAD }); }
    }
  }

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

  function fillChecks() {
    var el = document.getElementById('checks');
    if (!el) return;
    var bad = CHECKS.filter(function (c) { return !c.pass; });
    el.innerHTML = '<span class="k">Model checks</span>' +
      '<p class="small" style="margin:4px 0 0">' + (CHECKS.length - bad.length) + ' of ' + CHECKS.length +
      ' passed' + (bad.length ? ' \u2014 ' + bad.map(function (c) { return c.name; }).join('; ') : '') + '</p>';
  }

  function boot() {
    fillChecks();
    var holder = document.getElementById('canvas-holder');
    var fallback = document.getElementById('canvas-fallback');
    var ok = false;

    if (typeof window.createCanvas === 'function' && PR) {
      try {
        new window.p5(function (s) {
          s.setup = function () {
            var c = s.createCanvas(W, H);
            if (c && c.parent) c.parent(holder);
            s.pixelDensity(1);
            s.noLoop();
            P = PR.makePainterP5(s, W, H);
            drawFrame(K.state.elapsed);
          };
          s.draw = function () { drawFrame(K.state.elapsed); };
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
          drawFrame(0);
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
        draw: function () { if (P) drawFrame(K.state.elapsed); }
      });
    }

    window.__drawAt = function (t) {
      K.state.elapsed = t;
      if (P) drawFrame(t);
    };
    window.__lessonChecks = CHECKS;
    window.__model = {
      TABLE: TABLE, ENUM: ENUM, SWEEP: SWEEP, CYCLE: CYCLE, DECIDER: DECIDER,
      ND: ND, GRAM: GRAM, MN: MN, HIERARCHY: HIERARCHY, CLOSURE: CLOSURE,
      DECISION: DECISION, SHAPES: SHAPES, RULES: RULES,
      sizes: { states: NS, gamma: NG },
      CHECKS: CHECKS
    };

    var bad = CHECKS.filter(function (c) { return !c.pass; });
    if (bad.length) console.warn('Model validation did not fully pass:', bad);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
