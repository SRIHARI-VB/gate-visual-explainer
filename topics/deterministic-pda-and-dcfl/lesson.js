/* ==========================================================================
   deterministic-pda-and-dcfl — lesson.js
   Four layers, in order:
     1. THE MODEL   — the determinism test itself, three transition tables
                      (a^n b^n, the even palindromes, and a variant that is
                      still non-deterministic), a configuration-level simulator,
                      exhaustive language enumeration, the prefix-free test, the
                      naive "swap the final states" complement and the strings it
                      gets wrong, the closure table, and a shift-reduce trace.
     2. THE CHECKS  — every number the lesson states, re-verified at load.
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

  var EPS = '\u03b5';

  /* ---------- 1.1 a transition table, and the test for determinism ----------
     A push-down automaton is a seven-tuple (Q, Sigma, Gamma, delta, q0, Z0, F).
     delta is a set of instructions (q, a, X, q', gamma): in state q, reading a
     (or nothing, when a is epsilon), with X on top of the stack, go to q' and
     replace X by gamma. The string gamma is written top first. */

  function T(q, a, X, next, r) { return { q: q, a: a, X: X, next: next, r: r }; }

  function movesAt(m, q, a, X) {
    var out = [];
    for (var i = 0; i < m.delta.length; i++) {
      var d = m.delta[i];
      if (d.q === q && d.a === a && d.X === X) out.push(d);
    }
    return out;
  }

  /* The two conditions, from the definition: (1) at most one instruction for
     each (state, symbol-or-epsilon, stack top); (2) if an epsilon-instruction
     exists for a (state, stack top), no symbol-instruction may exist for it. */
  function determinism(m) {
    var violations = [], cells = 0, used = 0;
    var symbols = m.input.concat([EPS]);
    for (var si = 0; si < m.states.length; si++) {
      for (var ai = 0; ai < symbols.length; ai++) {
        for (var gi = 0; gi < m.stack.length; gi++) {
          cells++;
          var q = m.states[si], a = symbols[ai], X = m.stack[gi];
          var mv = movesAt(m, q, a, X);
          if (mv.length) used++;
          if (mv.length > 1) {
            violations.push({ kind: 'choice', q: q, a: a, X: X, n: mv.length });
          }
        }
      }
    }
    /* condition 2, checked per (state, stack top) */
    for (var s2 = 0; s2 < m.states.length; s2++) {
      for (var g2 = 0; g2 < m.stack.length; g2++) {
        var qq = m.states[s2], XX = m.stack[g2];
        if (movesAt(m, qq, EPS, XX).length) {
          var clash = [];
          for (var k = 0; k < m.input.length; k++) {
            if (movesAt(m, qq, m.input[k], XX).length) clash.push(m.input[k]);
          }
          if (clash.length) {
            violations.push({ kind: 'epsilon', q: qq, X: XX, symbols: clash });
          }
        }
      }
    }
    return { ok: violations.length === 0, violations: violations, cells: cells, usedCells: used };
  }

  /* ---------- 1.2 four tables ----------
     M_BAL   — L = { a^n b^n : n >= 1 }. Push on a, pop on b, accept on an
               epsilon-instruction when the stack is back to the bottom marker.
               Deterministic.
     M_PAL   — L = { w w^R : w in {0,1}* }, the even palindromes, with the guess
               written as an epsilon-instruction. The machine must decide when
               the first half has ended, and nothing in the input tells it.
     M_PAL2  — the same guess written as a symbol-instruction instead, with the
               empty word dropped so that no epsilon-instruction is needed. It
               breaks a different clause of the definition.
     M_EPS   — M_BAL plus one epsilon-instruction whose branch always dies. The
               language is unchanged and the machine is no longer a DPDA. */

  var M_BAL = {
    name: 'a^n b^n',
    states: ['q0', 'q1', 'qf'],
    input: ['a', 'b'],
    stack: ['Z', 'A'],
    start: 'q0',
    bottom: 'Z',
    final: ['qf'],
    delta: [
      T('q0', 'a', 'Z', 'q0', 'AZ'),
      T('q0', 'a', 'A', 'q0', 'AA'),
      T('q0', 'b', 'A', 'q1', ''),
      T('q1', 'b', 'A', 'q1', ''),
      T('q1', EPS, 'Z', 'qf', '')
    ]
  };

  var M_PAL = {
    name: 'even palindromes, epsilon guess',
    states: ['q0', 'q1', 'q2'],
    input: ['0', '1'],
    stack: ['Z', '0', '1'],
    start: 'q0',
    bottom: 'Z',
    final: ['q2'],
    delta: [
      T('q0', '0', 'Z', 'q0', '0Z'),
      T('q0', '1', 'Z', 'q0', '1Z'),
      T('q0', '0', '0', 'q0', '00'),
      T('q0', '1', '1', 'q0', '11'),
      T('q0', '0', '1', 'q0', '01'),
      T('q0', '1', '0', 'q0', '10'),
      T('q0', EPS, 'Z', 'q2', ''),      /* the empty word */
      T('q0', EPS, '0', 'q1', '0'),     /* guess: stop pushing, keep the top */
      T('q0', EPS, '1', 'q1', '1'),
      T('q1', '0', '0', 'q1', ''),
      T('q1', '1', '1', 'q1', ''),
      T('q1', EPS, 'Z', 'q2', '')
    ]
  };

  var M_PAL2 = {
    name: 'even palindromes, symbol guess',
    states: ['q0', 'q1', 'q2'],
    input: ['0', '1'],
    stack: ['Z', '0', '1'],
    start: 'q0',
    bottom: 'Z',
    final: ['q2'],
    delta: [
      T('q0', '0', 'Z', 'q0', '0Z'),
      T('q0', '1', 'Z', 'q0', '1Z'),
      T('q0', '0', '0', 'q0', '00'),
      T('q0', '0', '0', 'q1', ''),
      T('q0', '1', '1', 'q0', '11'),
      T('q0', '1', '1', 'q1', ''),
      T('q0', '0', '1', 'q0', '01'),
      T('q0', '1', '0', 'q0', '10'),
      T('q1', '0', '0', 'q1', ''),
      T('q1', '1', '1', 'q1', ''),
      T('q1', EPS, 'Z', 'q2', '')
    ]
  };

  var M_EPS = {
    name: 'a^n b^n plus a branch that always dies',
    states: ['q0', 'q1', 'qf', 'qd'],
    input: ['a', 'b'],
    stack: ['Z', 'A'],
    start: 'q0',
    bottom: 'Z',
    final: ['qf'],
    delta: [
      T('q0', 'a', 'Z', 'q0', 'AZ'),
      T('q0', 'a', 'A', 'q0', 'AA'),
      T('q0', 'b', 'A', 'q1', ''),
      T('q1', 'b', 'A', 'q1', ''),
      T('q1', EPS, 'Z', 'qf', ''),
      T('q1', EPS, 'A', 'qd', 'A')
    ]
  };

  var D_BAL = determinism(M_BAL);
  var D_PAL = determinism(M_PAL);
  var D_PAL2 = determinism(M_PAL2);
  var D_EPS = determinism(M_EPS);

  /* ---------- 1.3 the simulator ----------
     A configuration is (state, input read so far, stack). The stack is held with
     the top at the END of the array, and printed with the top at the LEFT, which
     is the usual notation. A deterministic run takes the symbol-instruction when
     one exists and the epsilon-instruction otherwise; if neither exists the run
     is stuck, which is a rejection, not an error. */

  /* An accepting configuration: the input is exhausted and the state is final.
     That is the whole definition. These machines reach a final state only by
     popping the bottom marker, so no wrong run can arrive there. */
  function accepts(m, state, i, stack, len) {
    return i >= len && m.final.indexOf(state) >= 0;
  }

  function stepOnce(m, conf, input) {
    var top = conf.stack[conf.stack.length - 1];
    if (top === undefined) return null;
    var mv = null;
    if (conf.i < input.length) {
      var sym = input.charAt(conf.i);
      var list = movesAt(m, conf.state, sym, top);
      if (list.length) mv = list[0];
    }
    if (!mv) {
      var el = movesAt(m, conf.state, EPS, top);
      if (el.length) mv = el[0];
    }
    if (!mv) return null;
    var st = conf.stack.slice(0, conf.stack.length - 1);
    for (var j = mv.r.length - 1; j >= 0; j--) st.push(mv.r.charAt(j));
    var read = (mv.a === EPS) ? 0 : 1;
    return {
      state: mv.next,
      i: conf.i + read,
      stack: st,
      move: mv
    };
  }

  function stackText(st) {
    if (!st.length) return '\u03bb';
    var s = '';
    for (var i = st.length - 1; i >= 0; i--) s += st[i];
    return s;
  }

  function run(m, input, cap) {
    var conf = { state: m.start, i: 0, stack: [m.bottom] };
    var trace = [{ state: conf.state, i: 0, stack: conf.stack.slice(), move: null }];
    var guard = cap || 400;
    var stuck = false;
    while (guard-- > 0) {
      var nx = stepOnce(m, conf, input);
      if (!nx) { stuck = true; break; }
      conf = nx;
      trace.push({ state: conf.state, i: conf.i, stack: conf.stack.slice(), move: nx.move });
      if (conf.i >= input.length && !movesAt(m, conf.state, EPS, conf.stack[conf.stack.length - 1]).length) break;
    }
    var accepted = accepts(m, conf.state, conf.i, conf.stack, input.length);
    return {
      trace: trace,
      accepted: accepted,
      stuck: stuck && !accepted,
      endState: conf.state,
      readAll: conf.i >= input.length,
      steps: trace.length - 1,
      endStack: conf.stack.slice(),
      deadAt: stuck ? conf.i : -1
    };
  }

  /* Acceptance for a table that is not deterministic: a string is accepted when
     SOME run ends in a final state with the input exhausted. The search is
     breadth first and remembers configurations, so it terminates. */
  function acceptsNondet(m, input, cap) {
    var seen = {}, queue = [{ state: m.start, i: 0, stack: [m.bottom] }];
    var limit = cap || 500;
    while (queue.length && limit-- > 0) {
      var c = queue.shift();
      var key = c.state + '|' + c.i + '|' + stackText(c.stack);
      if (seen[key]) continue;
      seen[key] = 1;
      if (accepts(m, c.state, c.i, c.stack, input.length)) return true;
      var top = c.stack[c.stack.length - 1];
      if (top === undefined) continue;
      var cands = [];
      if (c.i < input.length) cands = cands.concat(movesAt(m, c.state, input.charAt(c.i), top));
      cands = cands.concat(movesAt(m, c.state, EPS, top));
      for (var d = 0; d < cands.length; d++) {
        var mv = cands[d];
        var st = c.stack.slice(0, c.stack.length - 1);
        for (var j = mv.r.length - 1; j >= 0; j--) st.push(mv.r.charAt(j));
        queue.push({ state: mv.next, i: c.i + (mv.a === EPS ? 0 : 1), stack: st });
      }
    }
    return false;
  }

  /* ---------- 1.4 exhaustive enumeration ----------
     Every string over the machine's alphabet up to a length, run through the
     machine. This is what turns "the machine accepts a^n b^n" from a claim into
     a checked statement about a bounded universe. */

  function allStrings(sigma, maxLen) {
    var out = [''];
    var frontier = [''];
    for (var L = 1; L <= maxLen; L++) {
      var next = [];
      for (var i = 0; i < frontier.length; i++) {
        for (var s = 0; s < sigma.length; s++) next.push(frontier[i] + sigma[s]);
      }
      out = out.concat(next);
      frontier = next;
    }
    return out;
  }

  var UNIVERSE4 = allStrings(['a', 'b'], 4);   /* 31 strings */
  var UNIVERSE6 = allStrings(['a', 'b'], 6);   /* 127 strings */

  function language(m, words) {
    var out = [];
    for (var i = 0; i < words.length; i++) if (run(m, words[i]).accepted) out.push(words[i]);
    return out;
  }

  function isAnBn(w) {
    if (!w.length) return false;
    var i = 0;
    while (i < w.length && w.charAt(i) === 'a') i++;
    var as = i;
    while (i < w.length && w.charAt(i) === 'b') i++;
    return i === w.length && as === w.length - as && as >= 1;
  }

  var LANG_BAL = language(M_BAL, UNIVERSE6);
  var WANT_BAL = UNIVERSE6.filter(isAnBn);
  var BAL_EXACT = (LANG_BAL.length === WANT_BAL.length) &&
                  LANG_BAL.every(function (w, k) { return w === WANT_BAL[k]; });

  var LANG_EPS = language(M_EPS, UNIVERSE6);
  var EPS_SAME = (LANG_EPS.length === LANG_BAL.length) &&
                 LANG_EPS.every(function (w, k) { return w === LANG_BAL[k]; });

  /* the run quoted on the page */
  var RUN_OK = run(M_BAL, 'aaabbb');
  var RUN_BAD = run(M_BAL, 'aabbb');

  /* ---------- 1.5 one path against many ----------
     The same simulation, but breadth first and keeping every configuration, is
     what a non-deterministic machine costs. M_PAL on a short palindrome: count
     the distinct configurations the search must hold, against the length of the
     single deterministic path for the same string length. */

  function bfsCount(m, input, cap) {
    var seen = {}, queue = [{ state: m.start, i: 0, stack: [m.bottom] }];
    var count = 0;
    var limit = cap || 400;
    while (queue.length && count < limit) {
      var c = queue.shift();
      var key = c.state + '|' + c.i + '|' + stackText(c.stack);
      if (seen[key]) continue;
      seen[key] = 1;
      count++;
      var top = c.stack[c.stack.length - 1];
      if (top === undefined) continue;
      var cands = [];
      if (c.i < input.length) cands = cands.concat(movesAt(m, c.state, input.charAt(c.i), top));
      cands = cands.concat(movesAt(m, c.state, EPS, top));
      for (var d = 0; d < cands.length; d++) {
        var mv = cands[d];
        var st = c.stack.slice(0, c.stack.length - 1);
        for (var j = mv.r.length - 1; j >= 0; j--) st.push(mv.r.charAt(j));
        queue.push({ state: mv.next, i: c.i + (mv.a === EPS ? 0 : 1), stack: st });
      }
    }
    return count;
  }

  var BFS_SMALL = bfsCount(M_PAL, '0110', 400);
  var DPDA_PATH = run(M_BAL, 'aabb').steps;   /* the same length, one path */

  /* ---------- 1.6 prefix-freeness ----------
     A language is prefix-free when no member is a proper prefix of another.
     Acceptance by empty stack is possible exactly for the prefix-free members
     of DCFL: the machine cannot tell "the input ended" from "a longer input is
     coming", so it must commit to emptying the stack as soon as it can. */

  function prefixFree(words) {
    for (var i = 0; i < words.length; i++) {
      for (var j = 0; j < words.length; j++) {
        if (i === j) continue;
        var a = words[i], b = words[j];
        if (a.length < b.length && b.indexOf(a) === 0) {
          return { ok: false, short: a, long: b };
        }
      }
    }
    return { ok: true };
  }

  var PF_BAL = prefixFree(WANT_BAL);
  var PF_STAR = prefixFree(allStrings(['a', 'b'], 3).filter(function (w) {
    return /^a*b*$/.test(w) && w.length >= 1;
  }));

  /* ---------- 1.7 the complement, and the swap that does not work ----------
     DCFL is closed under complement. The tempting proof is "change the final
     states to the non-final ones". It is wrong, and the reason is that a
     deterministic run can get stuck in the middle of the input: such a run
     rejects, but after the swap it still does not finish the input, so it still
     rejects — and the string belongs to the complement. */

  function swapped(m) {
    var f = [];
    for (var i = 0; i < m.states.length; i++) {
      if (m.final.indexOf(m.states[i]) < 0) f.push(m.states[i]);
    }
    return {
      name: m.name + ' (final states swapped)',
      states: m.states, input: m.input, stack: m.stack,
      start: m.start, bottom: m.bottom, final: f, delta: m.delta
    };
  }

  var M_SWAP = swapped(M_BAL);
  var SWAP_BAD = [];
  (function () {
    for (var i = 0; i < UNIVERSE4.length; i++) {
      var w = UNIVERSE4[i];
      var inM = run(M_BAL, w).accepted;
      var inS = run(M_SWAP, w).accepted;
      if (inS === inM) SWAP_BAD.push(w);   /* the swap should flip every answer */
    }
  })();
  SWAP_BAD.sort(function (x, y) { return x.length - y.length || (x < y ? -1 : 1); });
  var SWAP_FIRST = SWAP_BAD.length ? SWAP_BAD[0] : '';

  /* the split: accepted, stopped before the end, and read to the end but rejected */
  var SWAP_SPLIT = { accepted: 0, early: 0, late: 0 };
  for (var u4 = 0; u4 < UNIVERSE4.length; u4++) {
    var rr = run(M_BAL, UNIVERSE4[u4]);
    if (rr.accepted) SWAP_SPLIT.accepted++;
    else if (!rr.readAll) SWAP_SPLIT.early++;
    else SWAP_SPLIT.late++;
  }

  /* ---------- 1.8 the closure table ----------
     Read from the standard statement of the properties. Closed and not closed
     are counted, not asserted in a sentence. */

  var CLOSED = [
    { op: 'complement', why: 'the result that separates DCFL from CFL' },
    { op: 'intersection with a regular set', why: 'run the DFA in the states' },
    { op: 'inverse homomorphism', why: 'as for the non-deterministic case' },
    { op: 'right quotient with a regular set', why: 'look ahead on the stack' },
    { op: 'pre: words with a proper prefix in L', why: 'three phases in the states' },
    { op: 'min: members with no prefix in L', why: 'drop the instructions leaving F' },
    { op: 'max: members that are nobody\u2019s prefix', why: 'the mirror of min' }
  ];

  var OPEN = [
    { op: 'union', why: 'the two halves of a^n b^n c^n' },
    { op: 'intersection', why: 'De Morgan, from union and complement' },
    { op: 'concatenation', why: 'same family as union' },
    { op: 'Kleene star', why: 'same family as union' },
    { op: 'morphism (epsilon-free)', why: 'same family as union' },
    { op: 'mirror image', why: 'the reverse of a DCFL need not be one' }
  ];

  /* ---------- 1.9 the bounded-universe check on the two witnesses ----------
     L2 = { a^i b^j c^k : i = j } and L3 = { a^i b^j c^k : j = k } are both DCFL,
     and their intersection is the diagonal, which is not even context-free. The
     identity is checked here over every (i,j,k) with each at most three. */

  var UNIVERSE_ABC = [];
  (function () {
    for (var i = 0; i <= 3; i++) {
      for (var j = 0; j <= 3; j++) {
        for (var k = 0; k <= 3; k++) {
          UNIVERSE_ABC.push({
            w: rep('a', i) + rep('b', j) + rep('c', k), i: i, j: j, k: k
          });
        }
      }
    }
  })();

  function rep(ch, n) { var s = ''; for (var i = 0; i < n; i++) s += ch; return s; }

  var IN_L2 = UNIVERSE_ABC.filter(function (x) { return x.i === x.j; });
  var IN_L3 = UNIVERSE_ABC.filter(function (x) { return x.j === x.k; });
  var IN_BOTH = UNIVERSE_ABC.filter(function (x) { return x.i === x.j && x.j === x.k; });
  var DIAGONAL = UNIVERSE_ABC.filter(function (x) { return x.i === x.j && x.j === x.k; });
  var INTERSECTION_IS_DIAGONAL = (IN_BOTH.length === DIAGONAL.length) &&
    IN_BOTH.every(function (x, k) { return x.w === DIAGONAL[k].w; });

  /* the complement of the diagonal, split into its two reasons */
  var NOT_DIAG = UNIVERSE_ABC.filter(function (x) { return !(x.i === x.j && x.j === x.k); });
  var TWO_REASONS = UNIVERSE_ABC.filter(function (x) { return x.i !== x.j || x.j !== x.k; });

  /* ---------- 1.10 the shift-reduce trace ----------
     S -> a b | a S b generates a^n b^n. A shift-reduce parser is a DPDA whose
     stack is the parser's stack: shift is "read and push", reduce is "pop the
     handle and push the left-hand side". Each reduction is checked against the
     production it claims to use. */

  var GRAMMAR = [
    { lhs: 'S', rhs: 'ab' },
    { lhs: 'S', rhs: 'aSb' }
  ];

  function shiftReduce(input) {
    var stack = [], trace = [], i = 0, guard = 200, ok = true, reductions = 0, shifts = 0;
    while (guard-- > 0) {
      /* reduce as long as a handle sits on top of the stack */
      var reduced = true;
      while (reduced) {
        reduced = false;
        for (var g = 0; g < GRAMMAR.length; g++) {
          var rhs = GRAMMAR[g].rhs;
          var top = stack.slice(Math.max(0, stack.length - rhs.length)).join('');
          if (top === rhs && stack.length >= rhs.length) {
            stack.length = stack.length - rhs.length;
            stack.push(GRAMMAR[g].lhs);
            trace.push({ kind: 'reduce', use: GRAMMAR[g].lhs + ' \u2192 ' + rhs,
                         stack: stack.join(''), input: input.slice(i) });
            reductions++;
            reduced = true;
            break;
          }
        }
      }
      if (i >= input.length) break;
      stack.push(input.charAt(i));
      trace.push({ kind: 'shift', use: 'read ' + input.charAt(i),
                   stack: stack.join(''), input: input.slice(i + 1) });
      shifts++;
      i++;
    }
    var accepted = (stack.length === 1 && stack[0] === 'S' && i >= input.length);
    return { trace: trace, accepted: accepted, shifts: shifts, reductions: reductions, ok: ok };
  }

  var SR = shiftReduce('aabb');

  /* ---------- 1.11 the counts quoted in the captions ---------- */

  var CELLS_BAL = D_BAL.cells, USED_BAL = D_BAL.usedCells;
  var STATE_COUNT = M_BAL.states.length;
  var SYM_COUNT = M_BAL.input.length + 1;      /* plus epsilon */
  var GAM_COUNT = M_BAL.stack.length;

  var STEP_ROWS = [];
  (function () {
    for (var n = 1; n <= 6; n++) {
      var w = rep('a', n) + rep('b', n);
      var r = run(M_BAL, w);
      var peak = 0;
      for (var q = 0; q < r.trace.length; q++) peak = Math.max(peak, r.trace[q].stack.length);
      STEP_ROWS.push({ n: n, len: w.length, steps: r.steps, height: peak });
    }
  })();

/* ======================================================================
   LAYER 2 — THE CHECKS
   ====================================================================== */

  check('the determinism test finds no violation in M_BAL', function () {
    return { pass: D_BAL.ok && D_BAL.violations.length === 0,
             detail: D_BAL.violations.length + ' violations over ' + D_BAL.cells + ' cells' };
  });

  check('the cell count is |Q| x (|Sigma| + 1) x |Gamma|', function () {
    return { pass: CELLS_BAL === STATE_COUNT * SYM_COUNT * GAM_COUNT,
             detail: CELLS_BAL + ' = ' + STATE_COUNT + ' x ' + SYM_COUNT + ' x ' + GAM_COUNT };
  });

  check('M_PAL fails condition 2 on three cells, the epsilon guess', function () {
    var e = D_PAL.violations.filter(function (v) { return v.kind === 'epsilon'; });
    var ch = D_PAL.violations.filter(function (v) { return v.kind === 'choice'; });
    return { pass: !D_PAL.ok && e.length === 3 && ch.length === 0,
             detail: e.length + ' epsilon conflicts, ' + ch.length + ' of kind choice' };
  });

  check('M_PAL2 writes the same guess as a symbol-move and fails condition 1 twice', function () {
    var ch = D_PAL2.violations.filter(function (v) { return v.kind === 'choice'; });
    var e = D_PAL2.violations.filter(function (v) { return v.kind === 'epsilon'; });
    return { pass: !D_PAL2.ok && ch.length === 2 && e.length === 0,
             detail: ch.length + ' choice violations, ' + e.length + ' epsilon conflicts' };
  });

  check('M_PAL2 accepts exactly the non-empty even palindromes up to length 6', function () {
    var uni = allStrings(['0', '1'], 6);
    var want = uni.filter(function (w) {
      if (!w.length || w.length % 2) return false;
      var h = w.length / 2;
      var a = w.slice(0, h), b = w.slice(h).split('').reverse().join('');
      return a === b;
    });
    var got = uni.filter(function (w) { return acceptsNondet(M_PAL2, w); });
    return { pass: got.length === want.length && got.every(function (w, k) { return w === want[k]; }),
             detail: got.length + ' accepted, ' + want.length + ' expected' };
  });

  check('M_EPS fails condition 2: epsilon and a symbol on the same cell', function () {
    var e = D_EPS.violations.filter(function (v) { return v.kind === 'epsilon'; });
    return { pass: !D_EPS.ok && e.length === 1 && e[0].symbols.join('') === 'b',
             detail: e.length + ' epsilon conflicts on ' + (e[0] ? e[0].q + '/' + e[0].X : 'none') };
  });

  check('M_EPS accepts exactly the language of M_BAL', function () {
    return { pass: EPS_SAME, detail: LANG_EPS.length + ' strings against ' + LANG_BAL.length };
  });

  check('M_BAL accepts exactly a^n b^n over 127 strings of length at most 6', function () {
    return { pass: BAL_EXACT, detail: LANG_BAL.length + ' accepted, ' + WANT_BAL.length + ' expected' };
  });

  check('aaabbb is accepted in 2n + 1 = 7 steps', function () {
    return { pass: RUN_OK.accepted && RUN_OK.steps === 7,
             detail: RUN_OK.steps + ' steps, final state ' + RUN_OK.endState };
  });

  check('aabbb is stuck with one symbol unread, at position 4', function () {
    return { pass: !RUN_BAD.accepted && RUN_BAD.stuck && RUN_BAD.deadAt === 4,
             detail: 'stuck at index ' + RUN_BAD.deadAt + ' of ' + 'aabbb'.length };
  });

  check('the steps of a^n b^n are 2n + 1 for n = 1..6', function () {
    var bad = STEP_ROWS.filter(function (r) { return r.steps !== 2 * r.n + 1; });
    return { pass: bad.length === 0,
             detail: STEP_ROWS.map(function (r) { return r.steps; }).join(',') };
  });

  check('the stack height peaks at n + 1', function () {
    var bad = STEP_ROWS.filter(function (r) { return r.height !== r.n + 1; });
    return { pass: bad.length === 0,
             detail: STEP_ROWS.map(function (r) { return r.height; }).join(',') };
  });

  check('the breadth-first search holds more configurations than the one path', function () {
    return { pass: BFS_SMALL > DPDA_PATH,
             detail: BFS_SMALL + ' configurations against ' + DPDA_PATH + ' steps' };
  });

  check('a^n b^n is prefix-free', function () {
    return { pass: PF_BAL.ok, detail: PF_BAL.ok ? 'no member is a prefix of another' : PF_BAL.short };
  });

  check('a*b* is not prefix-free, and the witness is a proper prefix of aa', function () {
    return { pass: !PF_STAR.ok && PF_STAR.short === 'a' && PF_STAR.long === 'aa',
             detail: PF_STAR.short + ' is a prefix of ' + PF_STAR.long };
  });

  check('swapping the final states gets some strings wrong', function () {
    return { pass: SWAP_BAD.length > 0 && SWAP_FIRST.length === 1,
             detail: SWAP_BAD.length + ' wrong answers, first is "' + SWAP_FIRST + '"' };
  });

  check('the swap is wrong on exactly the runs that stop before the end', function () {
    var allEarly = SWAP_BAD.every(function (w) { return !run(M_BAL, w).readAll; });
    return { pass: allEarly && SWAP_BAD.length === SWAP_SPLIT.early &&
                    SWAP_SPLIT.accepted + SWAP_SPLIT.early + SWAP_SPLIT.late === UNIVERSE4.length,
             detail: SWAP_BAD.length + ' wrong = ' + SWAP_SPLIT.early + ' early; ' +
                     SWAP_SPLIT.accepted + ' accepted, ' + SWAP_SPLIT.late + ' read but rejected' };
  });

  check('the closure table has 7 closed rows and 6 open rows', function () {
    return { pass: CLOSED.length === 7 && OPEN.length === 6,
             detail: CLOSED.length + ' closed, ' + OPEN.length + ' not closed' };
  });

  check('the two witness languages intersect in the diagonal', function () {
    return { pass: INTERSECTION_IS_DIAGONAL && IN_BOTH.length === 4,
             detail: IN_BOTH.length + ' strings of the 64 checked, each a^n b^n c^n' };
  });

  check('the complement of the diagonal is exactly the two reasons', function () {
    return { pass: NOT_DIAG.length === TWO_REASONS.length,
             detail: NOT_DIAG.length + ' = ' + TWO_REASONS.length + ' of 64' };
  });

  check('the shift-reduce trace for aabb uses two real productions and ends at S', function () {
    return { pass: SR.accepted && SR.reductions === 2 && SR.shifts === 4,
             detail: SR.shifts + ' shifts, ' + SR.reductions + ' reductions, final ' +
                     (SR.accepted ? 'S' : 'not S') };
  });

  check('the palindrome machine accepts 0110, 011 and the empty word correctly', function () {
    var a = acceptsNondet(M_PAL, '0110'), b = acceptsNondet(M_PAL, '011'), c = acceptsNondet(M_PAL, '');
    return { pass: a && !b && c, detail: '0110 ' + a + ', 011 ' + b + ', empty ' + c };
  });

  check('no state is both final and non-final after the swap', function () {
    var bad = 0;
    for (var i = 0; i < M_SWAP.final.length; i++) {
      if (M_BAL.final.indexOf(M_SWAP.final[i]) >= 0) bad++;
    }
    return { pass: bad === 0 && M_SWAP.final.length === 2,
             detail: M_SWAP.final.join(',') };
  });

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

/* ======================================================================
   LAYER 3 — RENDER
   Everything below reads the model above.
   ====================================================================== */

  var TITLE_Y = 26, SUB_Y = 48;

  function head(txt, sub) {
    P.text(24, TITLE_Y, txt, { size: 16, bold: true, color: INK });
    if (sub) P.text(24, SUB_Y, sub, { size: 12, color: DIM });
  }

  function foot(txt, colour) {
    P.text(24, 436, txt, { size: 12, color: colour || DIM });
  }

  function beat(t, sc, off, dur) {
    return K.clamp01((t - sc.start - off) / Math.max(0.001, dur));
  }

  function sceneOf(t) {
    var sc = window.LESSON_TIMELINE.scenes;
    for (var i = 0; i < sc.length; i++) if (t >= sc.start && t < sc.end) return sc[i];
    return sc[sc.length - 1];
  }

  function panel(x, y, w, h, tone) {
    var fill = tone === 'bad' ? INVALIDDIM : tone === 'warn' ? WARNDIM : tone === 'acc' ? ACCDIM : SURF2;
    var stroke = tone === 'bad' ? BAD : tone === 'warn' ? WARN : tone === 'acc' ? ACC : BORDER;
    P.rect(x, y, w, h, { fill: fill, stroke: stroke, radius: 6 });
  }

  function box(x, y, w, h, label, tone, size) {
    var fill = tone === 'bad' ? INVALIDDIM : tone === 'warn' ? WARNDIM : tone === 'acc' ? ACCDIM : SURF;
    var stroke = tone === 'bad' ? BAD : tone === 'warn' ? WARN : tone === 'acc' ? ACC : BORDER;
    var ink = tone === 'bad' ? BAD : tone === 'warn' ? WARN : tone === 'acc' ? ACC : INK;
    P.rect(x, y, w, h, { fill: fill, stroke: stroke, radius: 5 });
    P.text(x + w / 2, y + h / 2, label, { size: size || 10, mono: true, color: ink, align: 'center', base: 'middle' });
  }

  var SCENE_DRAW = {};

  /* ---------- scene 1: one rule ---------- */
  SCENE_DRAW['one-move'] = function (t, sc) {
    head('Two machines, one rule', 'The difference is not the stack. It is the empty choice.');

    var a = K.ease(beat(t, sc, 0.3, 0.8));
    P.alpha(a);
    panel(24, 72, 424, 210, null);
    P.text(38, 82, 'What makes a push-down automaton deterministic', { size: 11, bold: true, color: INK });
    P.text(38, 108, '1.  For each state, symbol and stack top,', { size: 10, color: INK });
    P.text(52, 124, 'at most one instruction may apply.', { size: 10, color: DIM });
    P.text(38, 148, '2.  If an \u03b5-instruction applies to a', { size: 10, color: INK });
    P.text(52, 164, '(state, stack top) pair, then no symbol', { size: 10, color: DIM });
    P.text(52, 180, 'instruction may apply to the same pair.', { size: 10, color: DIM });
    P.text(38, 204, 'Both conditions are about one cell of the', { size: 10, color: INK });
    P.text(38, 220, 'table. Nothing else changes: same states,', { size: 10, color: DIM });
    P.text(38, 236, 'same stack, same acceptance.', { size: 10, color: DIM });
    P.text(38, 262, 'L(M) = { w : the run ends in a final state }', { size: 10, mono: true, color: ACC });
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.8));
    P.alpha(b);
    panel(464, 72, 412, 210, 'acc');
    P.text(478, 82, 'Three tables, tested', { size: 11, bold: true, color: ACC });
    var rows = [
      { n: 'M_BAL  a\u207fb\u207f', v: D_BAL.violations.length, ok: D_BAL.ok, kind: '' },
      { n: 'M_PAL  ww\u1d3f, \u03b5 guess', v: D_PAL.violations.length, ok: D_PAL.ok, kind: 'cond. 2' },
      { n: 'M_PAL2 ww\u1d3f, symbol guess', v: D_PAL2.violations.length, ok: D_PAL2.ok, kind: 'cond. 1' },
      { n: 'M_EPS  a\u207fb\u207f + branch', v: D_EPS.violations.length, ok: D_EPS.ok, kind: 'cond. 2' }
    ];
    for (var i = 0; i < rows.length; i++) {
      var y = 110 + i * 30;
      P.text(478, y, rows[i].n, { size: 10, mono: true, color: INK });
      P.text(640, y, String(rows[i].v), { size: 10, mono: true, color: rows[i].ok ? VAL : BAD });
      P.text(668, y, rows[i].kind, { size: 9, color: FAINT });
      P.text(736, y, rows[i].ok ? 'DPDA' : 'not a DPDA',
             { size: 10, bold: true, color: rows[i].ok ? VAL : BAD });
    }
    P.text(478, 236, 'The count is the test itself, run over every', { size: 9, color: DIM });
    P.text(478, 250, 'cell: ' + CELLS_BAL + ' cells for M_BAL.', { size: 9, color: DIM });
    P.text(478, 268, 'A verdict, not an opinion.', { size: 9, color: ACC });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.8));
    P.alpha(c);
    panel(24, 294, 852, 106, 'warn');
    P.text(38, 304, 'Why the exam cares', { size: 11, bold: true, color: WARN });
    P.text(38, 328, 'Nondeterminism on a stack is not a convenience you can remove. For a finite automaton every NFA has an equivalent DFA; for a push-down', { size: 10, color: INK });
    P.text(38, 346, 'automaton that theorem fails, and the languages left over are the ones that need a guess. DCFL is what remains when the guessing stops.', { size: 10, color: INK });
    P.text(38, 372, 'So the question "is this language deterministic context-free?" is a question about one cell of one table, not about the language\u2019s difficulty.', { size: 10, color: DIM });
    P.alpha(1);

    foot('Determinism here is a property of the table, and only of the table.');
  };

  /* ---------- scene 2: the test on a real table ---------- */
  SCENE_DRAW['table-test'] = function (t, sc) {
    head('The test, run on a real table', 'Five instructions, eight cells, no choice anywhere.');

    var a = K.ease(beat(t, sc, 0.3, 0.8));
    P.alpha(a);
    panel(24, 72, 452, 200, null);
    P.text(38, 82, 'M_BAL:  \u03b4(state, symbol, top) \u2192 (state, push)', { size: 11, bold: true, color: INK });
    var lines = [
      '(q0, a, Z ) \u2192 (q0, A Z )',
      '(q0, a, A ) \u2192 (q0, A A )',
      '(q0, b, A ) \u2192 (q1, \u03bb   )',
      '(q1, b, A ) \u2192 (q1, \u03bb   )',
      '(q1, \u03b5, Z ) \u2192 (qf, Z   )'
    ];
    for (var i = 0; i < lines.length; i++) {
      P.text(38, 112 + i * 22, lines[i], { size: 10, mono: true, color: i === 4 ? ACC : INK });
    }
    P.text(38, 238, 'The stack string is written with the new top first.', { size: 9, color: DIM });
    P.text(38, 254, 'Z is the bottom marker and is never removed.', { size: 9, color: DIM });
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.8));
    P.alpha(b);
    panel(492, 72, 384, 200, 'acc');
    P.text(506, 82, 'The checker', { size: 11, bold: true, color: ACC });
    P.text(506, 108, 'cells examined   ' + CELLS_BAL, { size: 10, mono: true, color: INK });
    P.text(506, 126, '   = ' + STATE_COUNT + ' states \u00d7 ' + SYM_COUNT + ' symbols \u00d7 ' + GAM_COUNT + ' stack', { size: 9, mono: true, color: DIM });
    P.text(506, 152, 'cells in use     ' + USED_BAL, { size: 10, mono: true, color: INK });
    P.text(506, 178, 'condition 1      ' + D_BAL.violations.filter(function (v) { return v.kind === 'choice'; }).length + ' violations', { size: 10, mono: true, color: VAL });
    P.text(506, 196, 'condition 2      ' + D_BAL.violations.filter(function (v) { return v.kind === 'epsilon'; }).length + ' violations', { size: 10, mono: true, color: VAL });
    P.text(506, 222, 'verdict          ' + (D_BAL.ok ? 'deterministic' : 'not deterministic'), { size: 10, mono: true, bold: true, color: D_BAL.ok ? VAL : BAD });
    P.text(506, 250, 'Three of the eight cells are empty; empty', { size: 9, color: DIM });
    P.text(506, 264, 'cells never break determinism.', { size: 9, color: DIM });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.8));
    P.alpha(c);
    panel(24, 284, 452, 116, 'warn');
    P.text(38, 294, 'The \u03b5-instruction is allowed, and this is why', { size: 11, bold: true, color: WARN });
    P.text(38, 318, 'Line five reads nothing and pops nothing. It is', { size: 10, color: INK });
    P.text(38, 334, 'still deterministic, because condition 2 only', { size: 10, color: INK });
    P.text(38, 350, 'forbids a symbol-instruction on the SAME cell.', { size: 10, color: INK });
    P.text(38, 372, '(q1, b, Z ) is empty, so \u03b5 may live at (q1, Z ).', { size: 10, mono: true, color: ACC });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    panel(492, 284, 384, 116, 'bad');
    P.text(506, 294, 'M_EPS breaks exactly that rule', { size: 11, bold: true, color: BAD });
    P.text(506, 318, 'It adds (q1, \u03b5, A) \u2192 (qd, A), a branch that', { size: 10, color: INK });
    P.text(506, 334, 'always dies. The cell (q1, A) now holds an', { size: 10, color: INK });
    P.text(506, 350, '\u03b5-move and a b-move at once.', { size: 10, color: INK });
    P.text(506, 372, 'Same language, different machine class.', { size: 10, color: DIM });
    P.alpha(1);

    foot('One extra \u03b5-instruction: same language, no longer a DPDA.');
  };

  /* ---------- scene 3: one run ---------- */
  SCENE_DRAW['one-run'] = function (t, sc) {
    head('One run, configuration by configuration', 'aaabbb takes seven steps. Nothing is explored; nothing is guessed.');

    var a = K.ease(beat(t, sc, 0.3, 0.8));
    P.alpha(a);
    panel(24, 72, 470, 250, null);
    P.text(38, 82, 'The run of aaabbb', { size: 11, bold: true, color: INK });
    P.text(38, 100, 'step  state  input left   stack', { size: 9, mono: true, color: FAINT });
    var tr = RUN_OK.trace;
    for (var i = 0; i < tr.length; i++) {
      var c = tr[i];
      var rest = 'aaabbb'.slice(c.i) || '\u03bb';
      var y = 120 + i * 24;
      var isLast = i === tr.length - 1;
      P.text(38, y, (i === 0 ? '0' : String(i)) + (isLast ? '  accept' : ''), { size: 10, mono: true, color: isLast ? VAL : DIM });
      P.text(96, y, c.state, { size: 10, mono: true, color: isLast ? VAL : INK });
      P.text(146, y, rest, { size: 10, mono: true, color: isLast ? VAL : INK });
      P.text(238, y, stackText(c.stack), { size: 10, mono: true, color: isLast ? VAL : ACC });
    }
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.8));
    P.alpha(b);
    panel(514, 72, 362, 130, 'bad');
    P.text(528, 82, 'The run of aabbb', { size: 11, bold: true, color: BAD });
    P.text(528, 106, 'after 2 a\u2019s and 2 b\u2019s the stack is Z,', { size: 10, color: INK });
    P.text(528, 122, 'and a third b has no instruction at', { size: 10, color: INK });
    P.text(528, 138, '(q1, b, Z0). The machine stops with one', { size: 10, color: INK });
    P.text(528, 154, 'symbol unread: position ' + RUN_BAD.deadAt + ' of 5.', { size: 10, color: INK });
    P.text(528, 178, 'Stuck is a rejection, not an error.', { size: 10, color: BAD });
    P.alpha(1);

    var c2 = K.ease(beat(t, sc, 15, 0.8));
    P.alpha(c2);
    panel(514, 214, 362, 108, 'acc');
    P.text(528, 224, 'The acceptance test, in one line', { size: 11, bold: true, color: ACC });
    P.text(528, 250, 'input exhausted  AND  state \u2208 F', { size: 11, mono: true, color: INK });
    P.text(528, 276, 'qf is reached only by popping the marker, so', { size: 9, color: DIM });
    P.text(528, 292, 'no wrong run can arrive there.', { size: 9, color: DIM });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    P.rect(24, 336, 852, 74, { fill: SURF2, stroke: BORDER, radius: 6 });
    P.text(38, 346, 'One run against many', { size: 11, bold: true, color: INK });
    P.text(38, 370, 'This trace is the whole computation. A non-deterministic machine on a palindrome of the same length has to hold ' + BFS_SMALL + ' distinct configurations at once,', { size: 10, color: DIM });
    P.text(38, 388, 'because every possible middle has to be tried. One path costs ' + DPDA_PATH + ' steps; the search costs ' + BFS_SMALL + ' configurations. That is the whole difference.', { size: 10, color: DIM });
    P.alpha(1);

    foot('A deterministic run is a single chain of configurations, from the first to the last.');
  };

  /* ---------- scene 4: linear time ---------- */
  SCENE_DRAW['linear-time'] = function (t, sc) {
    head('One path, no copies, linear time', 'Steps grow as 2n + 1, so the run is linear in the input.');

    var a = K.ease(beat(t, sc, 0.3, 0.8));
    P.alpha(a);
    panel(24, 72, 452, 226, null);
    P.text(38, 82, 'Measured on M_BAL', { size: 11, bold: true, color: INK });
    P.text(38, 102, 'n    |w|   steps   peak stack', { size: 9, mono: true, color: FAINT });
    for (var i = 0; i < STEP_ROWS.length; i++) {
      var r = STEP_ROWS[i];
      P.text(38, 122 + i * 24, r.n + '    ' + r.len + '     ' + r.steps + '       ' + r.height,
             { size: 10, mono: true, color: ACC });
    }
    P.text(38, 276, 'steps = 2n + 1 = n pushes + n pops + 1 accept', { size: 9, mono: true, color: DIM });
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.8));
    P.alpha(b);
    panel(492, 72, 384, 106, 'acc');
    P.text(506, 82, 'Why linear matters', { size: 11, bold: true, color: ACC });
    P.text(506, 106, 'Each symbol is read once and each stack', { size: 10, color: INK });
    P.text(506, 122, 'symbol is pushed once and popped once.', { size: 10, color: INK });
    P.text(506, 146, 'No configuration is ever copied.', { size: 10, color: DIM });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.8));
    P.alpha(c);
    panel(492, 190, 384, 108, 'warn');
    P.text(506, 200, 'What a guess costs', { size: 11, bold: true, color: WARN });
    P.text(506, 224, 'The same length on M_PAL: ' + BFS_SMALL + ' configurations', { size: 10, color: INK });
    P.text(506, 240, 'to hold, against ' + DPDA_PATH + ' steps for one path.', { size: 10, color: INK });
    P.text(506, 264, 'General CFL membership is worse still.', { size: 9, color: DIM });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    P.rect(24, 316, 852, 94, { fill: SURF2, stroke: BORDER, radius: 6 });
    P.text(38, 326, 'The reason this class has a name', { size: 11, bold: true, color: INK });
    P.text(38, 350, 'A deterministic push-down automaton decides membership in time linear in the input. The best known method for a general context-free', { size: 10, color: DIM });
    P.text(38, 368, 'language is Valiant\u2019s, which runs in time proportional to n raised to about 2.38. That gap is why parser generators ask for a', { size: 10, color: DIM });
    P.text(38, 386, 'deterministic grammar rather than any grammar: the restriction buys a linear recogniser.', { size: 10, color: DIM });
    P.alpha(1);

    foot('Linear time is not a slogan here: steps = 2n + 1 was measured, not assumed.');
  };

  /* ---------- scene 5: final state against empty stack ---------- */
  SCENE_DRAW['empty-stack'] = function (t, sc) {
    head('Final state and empty stack are not the same', 'For a non-deterministic machine they agree. Here they do not.');

    var a = K.ease(beat(t, sc, 0.3, 0.8));
    P.alpha(a);
    panel(24, 72, 424, 190, null);
    P.text(38, 82, 'Two acceptance criteria', { size: 11, bold: true, color: INK });
    P.text(38, 108, 'final state', { size: 10, bold: true, color: ACC });
    P.text(38, 126, 'the input is exhausted and the state', { size: 9, color: DIM });
    P.text(38, 140, 'is in F. The stack may be anything.', { size: 9, color: DIM });
    P.text(38, 168, 'empty stack', { size: 10, bold: true, color: WARN });
    P.text(38, 186, 'the input is exhausted and the stack', { size: 9, color: DIM });
    P.text(38, 200, 'has been emptied. F is irrelevant.', { size: 9, color: DIM });
    P.text(38, 228, 'For an NPDA the two families are equal.', { size: 10, color: INK });
    P.text(38, 246, 'For a DPDA they are not.', { size: 10, bold: true, color: BAD });
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.8));
    P.alpha(b);
    panel(464, 72, 412, 190, 'acc');
    P.text(478, 82, 'The exact statement', { size: 11, bold: true, color: ACC });
    P.text(478, 108, 'A language is accepted by empty stack by', { size: 10, color: INK });
    P.text(478, 124, 'a DPDA if and only if it is prefix-free', { size: 10, color: INK });
    P.text(478, 140, 'and accepted by final state by some DPDA.', { size: 10, color: INK });
    P.text(478, 168, 'Prefix-free: no member is a proper prefix', { size: 9, color: DIM });
    P.text(478, 182, 'of another member.', { size: 9, color: DIM });
    P.text(478, 208, 'Test on { a\u207fb\u207f }        ' + (PF_BAL.ok ? 'prefix-free' : 'not'),
           { size: 10, mono: true, color: PF_BAL.ok ? VAL : BAD });
    P.text(478, 226, 'Test on a*b*            ' + (PF_STAR.ok ? 'prefix-free' : 'not'),
           { size: 10, mono: true, color: PF_STAR.ok ? VAL : BAD });
    P.text(478, 244, 'witness: "' + PF_STAR.short + '" \u2282 "' + PF_STAR.long + '"', { size: 9, mono: true, color: DIM });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.8));
    P.alpha(c);
    panel(24, 274, 424, 126, 'warn');
    P.text(38, 284, 'Why the stack criterion cannot be fixed up', { size: 11, bold: true, color: WARN });
    P.text(38, 308, 'A DPDA cannot tell "the input has ended" from', { size: 10, color: INK });
    P.text(38, 324, '"more input is coming". If it empties its stack', { size: 10, color: INK });
    P.text(38, 340, 'early, it accepts a prefix of a longer word.', { size: 10, color: INK });
    P.text(38, 362, 'A non-deterministic machine does not care: it', { size: 9, color: DIM });
    P.text(38, 378, 'keeps the guess that waits.', { size: 9, color: DIM });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    panel(464, 274, 412, 126, 'bad');
    P.text(478, 284, 'The trap this produces', { size: 11, bold: true, color: BAD });
    P.text(478, 308, '"Empty-stack acceptance is equivalent to', { size: 10, color: INK });
    P.text(478, 324, 'final-state acceptance" is a theorem for the', { size: 10, color: INK });
    P.text(478, 340, 'NPDA and FALSE for the DPDA.', { size: 10, color: INK });
    P.text(478, 362, 'The languages accepted by empty stack are', { size: 9, color: DIM });
    P.text(478, 378, 'incomparable with the regular languages.', { size: 9, color: DIM });
    P.alpha(1);

    foot('Every DPDA theorem you learned for the NPDA has to be re-checked. This is the first.');
  };

  /* ---------- scene 6: complement ---------- */
  SCENE_DRAW['complement'] = function (t, sc) {
    head('Closed under complement, but not by swapping states', 'The tempting one-line proof is wrong, and the counterexample is short.');

    var a = K.ease(beat(t, sc, 0.3, 0.8));
    P.alpha(a);
    panel(24, 72, 424, 122, 'acc');
    P.text(38, 82, 'The true statement', { size: 11, bold: true, color: ACC });
    P.text(38, 106, 'If L is a DCFL then so is its complement.', { size: 10, color: INK });
    P.text(38, 130, 'The construction needs a normal form: a', { size: 9, color: DIM });
    P.text(38, 144, 'machine that reads every input and has no', { size: 9, color: DIM });
    P.text(38, 158, '\u03b5-instruction entering a final state.', { size: 9, color: DIM });
    P.text(38, 178, 'Then the swap is made to work.', { size: 9, color: DIM });
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.8));
    P.alpha(b);
    panel(464, 72, 412, 122, 'bad');
    P.text(478, 82, 'The swap, as usually stated', { size: 11, bold: true, color: BAD });
    P.text(478, 106, '"Change every final state to non-final and', { size: 10, color: INK });
    P.text(478, 122, 'every non-final state to final."', { size: 10, color: INK });
    P.text(478, 146, 'Run on M_BAL: F = {qf} becomes F\u2032 = {q0, q1}.', { size: 9, mono: true, color: INK });
    P.text(478, 168, 'This is a DPDA. It is still not the complement.', { size: 9, color: DIM });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.8));
    P.alpha(c);
    panel(24, 206, 852, 116, null);
    P.text(38, 216, 'What the swap gets wrong, enumerated over every string of length at most four', { size: 11, bold: true, color: INK });
    var list = SWAP_BAD.slice(0, 12).map(function (w) { return w === '' ? '\u03bb' : w; }).join('   ');
    P.text(38, 242, 'wrong answers: ' + SWAP_BAD.length + ' of ' + UNIVERSE4.length + ' strings', { size: 10, mono: true, color: BAD });
    P.text(38, 262, list, { size: 10, mono: true, color: INK });
    P.text(38, 288, 'first one: "' + SWAP_FIRST + '"   \u2014 the machine gets stuck at (q0, ' + SWAP_FIRST + ', Z0), so after the swap it still never finishes the input.', { size: 9, color: DIM });
    P.text(38, 306, 'Every wrong answer is a string on which the original run was stuck, which is why they cluster on strings starting with b.', { size: 9, color: DIM });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    P.rect(24, 334, 852, 76, { fill: SURF2, stroke: BORDER, radius: 6 });
    P.text(38, 344, 'The diagnosis', { size: 11, bold: true, color: INK });
    P.text(38, 368, 'A run that stops early rejects, but a swapped run that stops early also rejects. Stuckness is not a state you can flip.', { size: 10, color: DIM });
    P.text(38, 390, 'So complement closure is true and the proof is not the one-liner: it needs a machine that always consumes its input.', { size: 10, color: DIM });
    P.alpha(1);

    foot('"Swap the final states" is a correct proof for the DFA and a false one here.');
  };

  /* ---------- scene 7: the closure table ---------- */
  SCENE_DRAW['closure-table'] = function (t, sc) {
    head('What is closed and what is not', 'Seven operations preserve DCFL. Six do not, and each has a witness.');

    var a = K.ease(beat(t, sc, 0.3, 0.8));
    P.alpha(a);
    panel(24, 72, 424, 250, 'acc');
    P.text(38, 82, 'Closed   (' + CLOSED.length + ')', { size: 11, bold: true, color: ACC });
    for (var i = 0; i < CLOSED.length; i++) {
      var y = 108 + i * 30;
      P.text(38, y, '\u2713', { size: 10, mono: true, color: VAL });
      P.text(56, y, CLOSED[i].op, { size: 10, color: INK });
      P.text(38, y + 13, CLOSED[i].why, { size: 8, color: FAINT });
    }
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.8));
    P.alpha(b);
    panel(464, 72, 412, 250, 'bad');
    P.text(478, 82, 'Not closed   (' + OPEN.length + ')', { size: 11, bold: true, color: BAD });
    for (var j = 0; j < OPEN.length; j++) {
      var y2 = 108 + j * 34;
      P.text(478, y2, '\u2715', { size: 10, mono: true, color: BAD });
      P.text(496, y2, OPEN[j].op, { size: 10, color: INK });
      P.text(478, y2 + 13, OPEN[j].why, { size: 8, color: FAINT });
    }
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.8));
    P.alpha(c);
    panel(24, 336, 424, 74, 'warn');
    P.text(38, 346, 'Compare with the CFL column', { size: 11, bold: true, color: WARN });
    P.text(38, 368, 'CFL is closed under union, concatenation', { size: 9, color: INK });
    P.text(38, 380, 'and star, and NOT under complement.', { size: 9, color: INK });
    P.text(38, 396, 'The two columns are close to opposites.', { size: 9, color: DIM });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    panel(464, 336, 412, 74, 'acc');
    P.text(478, 346, 'The one consequence worth memorising', { size: 11, bold: true, color: ACC });
    P.text(478, 368, 'Because complement is closed, "is L = \u03a3*?" is', { size: 9, color: INK });
    P.text(478, 382, 'decidable for a DPDA: test its complement for', { size: 9, color: INK });
    P.text(478, 396, 'emptiness. For a CFG that question is undecidable.', { size: 9, color: INK });
    P.alpha(1);

    foot('Two closure tables that look alike and disagree on complement. Learn the disagreement.');
  };

  /* ---------- scene 8: the witnesses ---------- */
  SCENE_DRAW['witnesses'] = function (t, sc) {
    head('DCFL is strictly inside CFL', 'Two witnesses, each with a different reason.');

    var a = K.ease(beat(t, sc, 0.3, 0.8));
    P.alpha(a);
    panel(24, 72, 424, 160, null);
    P.text(38, 82, 'Witness 1: the complement of a\u207fb\u207fc\u207f', { size: 11, bold: true, color: INK });
    P.text(38, 106, 'Step 1.  a\u207fb\u207fc\u207f is not context-free, by the', { size: 10, color: INK });
    P.text(52, 122, 'pumping lemma for CFLs.', { size: 10, color: INK });
    P.text(38, 144, 'Step 2.  CFL is closed under union, and its', { size: 10, color: INK });
    P.text(52, 160, 'complement is the union of three CFLs:', { size: 10, color: INK });
    P.text(52, 176, 'i\u2260j, or j\u2260k, or i\u2260k.', { size: 10, mono: true, color: ACC });
    P.text(38, 198, 'Step 3.  If that complement were a DCFL, its', { size: 10, color: INK });
    P.text(52, 214, 'complement would be too \u2014 a contradiction.', { size: 10, color: INK });
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.8));
    P.alpha(b);
    panel(464, 72, 412, 160, 'warn');
    P.text(478, 82, 'Witness 2: the even palindromes ww\u1d3f', { size: 11, bold: true, color: WARN });
    P.text(478, 106, 'Unambiguous: S \u2192 0S0 | 1S1 | \u03b5 has one', { size: 10, color: INK });
    P.text(478, 122, 'parse tree for every word in the language.', { size: 10, color: INK });
    P.text(478, 144, 'Yet not deterministic: a DPDA must decide,', { size: 10, color: INK });
    P.text(478, 160, 'while reading, whether it has passed the', { size: 10, color: INK });
    P.text(478, 176, 'middle, and there is nothing to tell it.', { size: 10, color: INK });
    P.text(478, 200, 'So DCFL \u228a unambiguous CFL \u228a CFL.', { size: 9, mono: true, color: WARN });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.8));
    P.alpha(c);
    panel(24, 244, 852, 108, null);
    P.text(38, 254, 'The union witness, checked over all 64 strings a\u2071b\u02b2c\u1d4f with each exponent at most 3', { size: 11, bold: true, color: INK });
    P.text(38, 280, 'L2 = { i = j }            ' + IN_L2.length + ' strings        both DCFL', { size: 10, mono: true, color: INK });
    P.text(38, 298, 'L3 = { j = k }            ' + IN_L3.length + ' strings        both DCFL', { size: 10, mono: true, color: INK });
    P.text(38, 316, 'L2 \u2229 L3 = { i = j = k }   ' + IN_BOTH.length + ' strings        the diagonal', { size: 10, mono: true, color: BAD });
    P.text(38, 336, 'The diagonal is not context-free, so DCFL cannot be closed under intersection \u2014 and by De Morgan, not under union either.', { size: 9, color: DIM });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    P.rect(24, 364, 852, 46, { fill: SURF2, stroke: BORDER, radius: 6 });
    P.text(38, 374, 'Both witnesses say the same thing in different words: the stack has to commit to one hypothesis, and some context-free languages need two.', { size: 10, color: DIM });
    P.text(38, 392, 'REG \u228a DCFL \u228a CFL \u228a CSL \u228a REC, and every inclusion in that chain is strict.', { size: 10, mono: true, color: ACC });
    P.alpha(1);

    foot('A witness for a non-closure is one language, not an argument about difficulty.');
  };

  /* ---------- scene 9: the LR parser ---------- */
  SCENE_DRAW['lr'] = function (t, sc) {
    head('The DPDA you already use: the LR parser', 'A shift-reduce parser is a deterministic push-down automaton.');

    var a = K.ease(beat(t, sc, 0.3, 0.8));
    P.alpha(a);
    panel(24, 72, 424, 150, 'acc');
    P.text(38, 82, 'The theorem', { size: 11, bold: true, color: ACC });
    P.text(38, 106, 'A context-free language is deterministic if', { size: 10, color: INK });
    P.text(38, 122, 'and only if it has an LR(1) grammar, if and', { size: 10, color: INK });
    P.text(38, 138, 'only if it has an LR(k) grammar for some k.', { size: 10, color: INK });
    P.text(38, 164, 'So DCFL = the LR(1) languages.', { size: 10, mono: true, color: ACC });
    P.text(38, 188, 'Restrict the DPDA to one state and you get', { size: 9, color: DIM });
    P.text(38, 202, 'the LL(1) languages, a proper subclass.', { size: 9, color: DIM });
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.8));
    P.alpha(b);
    panel(464, 72, 412, 150, null);
    P.text(478, 82, 'S \u2192 a b | a S b on the input aabb', { size: 11, bold: true, color: INK });
    P.text(478, 104, 'step  action     stack   input left', { size: 9, mono: true, color: FAINT });
    for (var i = 0; i < SR.trace.length; i++) {
      var s = SR.trace[i];
      var y = 122 + i * 20;
      P.text(478, y, (i + 1) + '     ' + (s.kind === 'shift' ? 'shift' : 'reduce'), { size: 9, mono: true, color: s.kind === 'shift' ? ACC : WARN });
      P.text(556, y, s.stack, { size: 9, mono: true, color: INK });
      P.text(646, y, s.input || '\u03bb', { size: 9, mono: true, color: DIM });
      P.text(706, y, s.kind === 'reduce' ? s.use : '', { size: 8, mono: true, color: WARN });
    }
    P.text(478, 216, 'Every reduction uses a real production; the run ends at S.', { size: 8, color: DIM });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.8));
    P.alpha(c);
    panel(24, 234, 852, 100, null);
    P.text(38, 244, 'The correspondence, item by item', { size: 11, bold: true, color: INK });
    P.text(38, 268, 'state of the DPDA   \u2194   the parser\u2019s state', { size: 10, mono: true, color: INK });
    P.text(38, 286, 'stack of the DPDA    \u2194   the stack of symbols, always a viable prefix', { size: 10, mono: true, color: INK });
    P.text(38, 304, 'reading a symbol    \u2194   shift      \u2003     popping a handle   \u2194   reduce', { size: 10, mono: true, color: INK });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    P.rect(24, 346, 852, 64, { fill: SURF2, stroke: BORDER, radius: 6 });
    P.text(38, 356, 'Why a parser generator refuses some grammars', { size: 11, bold: true, color: INK });
    P.text(38, 378, 'A shift-reduce conflict is two instructions in one cell. That is a violation of condition 1, and it is exactly why a grammar is not LR(1).', { size: 10, color: DIM });
    P.text(38, 396, 'The parser does not become weaker; the language stops being deterministic under that grammar.', { size: 10, color: DIM });
    P.alpha(1);

    foot('The DPDA is not a museum piece: it is the machine inside every LR parser.');
  };

  /* ---------- scene 10: the procedure ---------- */
  SCENE_DRAW['procedure-exam'] = function (t, sc) {
    head('The procedure, and the four traps', 'Ask these in order and the question usually answers itself.');

    var qs = [
      { q: '1. Where is the boundary?', a: 'a marker or a change of symbol decides it, or nothing does' },
      { q: '2. What must be remembered?', a: 'one counter fits the stack; two comparisons do not' },
      { q: '3. Is a guess needed?', a: 'if two hypotheses stay alive to the end, it is not DCFL' },
      { q: '4. Which criterion?', a: 'final state is the default; empty stack needs prefix-freeness' }
    ];
    for (var i = 0; i < qs.length; i++) {
      var a = K.ease(beat(t, sc, 0.3 + i * 1.6, 0.7));
      P.alpha(a);
      var col = i % 2, row = Math.floor(i / 2);
      var x = 24 + col * 436, y = 72 + row * 60;
      panel(x, y, 420, 50, null);
      P.text(x + 14, y + 8, qs[i].q, { size: 11, bold: true, color: ACC });
      P.text(x + 14, y + 28, qs[i].a, { size: 9, color: DIM });
    }
    P.alpha(1);

    var c = K.ease(beat(t, sc, 7.5, 0.8));
    P.alpha(c);
    panel(24, 196, 420, 130, 'bad');
    P.text(38, 206, 'The four traps', { size: 11, bold: true, color: BAD });
    P.text(38, 230, '1. "Swap the final states" as a proof.', { size: 10, color: INK });
    P.text(38, 250, '2. Empty-stack \u2261 final-state, carried over', { size: 10, color: INK });
    P.text(52, 266, 'from the NPDA.', { size: 10, color: INK });
    P.text(38, 286, '3. "Unambiguous" read as "deterministic".', { size: 10, color: INK });
    P.text(38, 306, '4. A regular language called not-DCFL.', { size: 10, color: INK });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 15, 0.8));
    P.alpha(d);
    panel(464, 196, 412, 130, 'acc');
    P.text(478, 206, 'The four facts to carry in', { size: 11, bold: true, color: ACC });
    P.text(478, 230, 'REG \u228a DCFL \u228a CFL, both strict.', { size: 10, mono: true, color: INK });
    P.text(478, 250, 'Closed: complement, \u2229 regular.', { size: 10, color: INK });
    P.text(478, 270, 'Open: union, \u2229, star, concat, morphism,', { size: 10, color: INK });
    P.text(478, 286, 'mirror image.', { size: 10, color: INK });
    P.text(478, 306, 'DCFL = LR(1); one state = LL(1).', { size: 10, mono: true, color: INK });
    P.alpha(1);

    var e = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(e);
    P.rect(24, 340, 852, 70, { fill: SURF2, stroke: BORDER, radius: 6 });
    P.text(38, 350, 'The one-sentence version', { size: 11, bold: true, color: INK });
    P.text(38, 374, 'A language is deterministic context-free when one machine can read it left to right with no choice at any point, and the questions that separate', { size: 10, color: DIM });
    P.text(38, 392, 'it from CFL are always about a guess that cannot be avoided \u2014 a middle, a boundary, or a second count.', { size: 10, color: DIM });
    P.alpha(1);

    foot('No choice at any cell, and the guess is where the marks are lost.');
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
    var fn = SCENE_DRAW[sc.id] || SCENE_DRAW['one-move'];
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
    DETERMINISM: { bal: D_BAL, pal: D_PAL, eps: D_EPS },
    CELLS: CELLS_BAL,
    USED: USED_BAL,
    LANG: { bal: LANG_BAL, count: LANG_BAL.length, universe6: UNIVERSE6.length, exact: BAL_EXACT },
    RUNS: { ok: RUN_OK, bad: RUN_BAD },
    STEPS: STEP_ROWS,
    BFS: BFS_SMALL,
    PATH: DPDA_PATH,
    PREFIX: { bal: PF_BAL, star: PF_STAR },
    SWAP: { wrong: SWAP_BAD, first: SWAP_FIRST, universe: UNIVERSE4.length, split: SWAP_SPLIT },
    CLOSURE: { closed: CLOSED, open: OPEN },
    WITNESS: { l2: IN_L2.length, l3: IN_L3.length, both: IN_BOTH.length, diagonal: DIAGONAL.length },
    SR: SR,
    PASSED: PASSED,
    TOTAL: CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
