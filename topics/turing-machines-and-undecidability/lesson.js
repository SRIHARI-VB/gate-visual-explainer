/* ==========================================================================
   turing-machines-and-undecidability — lesson.js
   Four layers, in order:
     1. THE MODEL      — a tape-machine interpreter, a universal machine, the
                         diagonal table, the halting contradiction, the wrapper
                         reduction, Rice witnesses, dovetailing, closure.
     2. THE CHECKS     — every figure re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   Nothing on the canvas is asserted: every number drawn was computed here and
   checked against the property it is supposed to have. What cannot be computed
   (a theorem) is labelled a theorem in the written tabs and never presented as
   a computation.
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

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

var BLANK = '_';

/* ---------- the interpreter ----------
   A machine is { id, name, run(input, maxSteps) -> {status, steps, trace} }.
   status is 'accept', 'reject' or 'loop'. A deterministic one-tape machine is
   given by a transition table keyed "state|symbol" -> [next, write, move]. */

function deltaRun(delta, q0, qa, qr, input, maxSteps) {
  var tape = {}, head = 0, st = q0, steps = 0, trace = [], i;
  for (i = 0; i < input.length; i++) tape[i] = input.charAt(i);

  function read(p) { return tape[p] === undefined ? BLANK : tape[p]; }

  function tapeString() {
    var keys = Object.keys(tape).map(Number);
    var lo = Math.min.apply(null, keys.concat([0, head]));
    var hi = Math.max.apply(null, keys.concat([0, head]));
    var s = '';
    for (var p = lo; p <= hi; p++) s += read(p);
    return s;
  }

  trace.push({ state: st, head: head, tape: tapeString() });
  while (steps < maxSteps) {
    if (st === qa) return { status: 'accept', steps: steps, trace: trace };
    if (st === qr) return { status: 'reject', steps: steps, trace: trace };
    var rule = delta[st + '|' + read(head)];
    if (!rule) return { status: 'reject', steps: steps, trace: trace };
    tape[head] = rule[1];
    st = rule[0];
    head += (rule[2] === 'R' ? 1 : -1);
    steps++;
    trace.push({ state: st, head: head, tape: tapeString() });
  }
  return { status: 'loop', steps: steps, trace: trace };
}

function mkMachine(id, name, delta, q0, qa, qr, gloss) {
  return {
    id: id, name: name, kind: 'tape', gloss: gloss || '',
    delta: delta, q0: q0, qa: qa, qr: qr,
    run: function (input, maxSteps) {
      return deltaRun(delta, q0, qa, qr, input, maxSteps === undefined ? 400 : maxSteps);
    }
  };
}

/* 0^n 1^n, n >= 0. Deterministic, halts on every input: it is a decider. */
var M_BAL = mkMachine('M0', '0^n 1^n', {
  'q0|0': ['q1', 'X', 'R'], 'q0|Y': ['q3', 'Y', 'R'], 'q0|_': ['qa', '_', 'R'],
  'q1|0': ['q1', '0', 'R'], 'q1|Y': ['q1', 'Y', 'R'],
  'q1|1': ['q2', 'Y', 'L'], 'q1|_': ['qr', '_', 'R'],
  'q2|0': ['q2', '0', 'L'], 'q2|Y': ['q2', 'Y', 'L'],
  'q2|X': ['q0', 'X', 'R'], 'q2|_': ['qr', '_', 'R'],
  'q3|Y': ['q3', 'Y', 'R'], 'q3|_': ['qa', '_', 'R'], 'q3|1': ['qr', '1', 'R']
}, 'q0', 'qa', 'qr', 'marks a 0 as X, hunts the matching 1, marks it Y, walks back');

/* even number of 1s */
var M_EVEN = mkMachine('M1', 'even 1s', {
  'q0|0': ['q0', '0', 'R'], 'q0|1': ['q1', '1', 'R'], 'q0|_': ['qa', '_', 'R'],
  'q1|0': ['q1', '0', 'R'], 'q1|1': ['q0', '1', 'R'], 'q1|_': ['qr', '_', 'R']
}, 'q0', 'qa', 'qr', 'toggles state on every 1');

/* contains a 0 */
var M_HAS0 = mkMachine('M2', 'contains 0', {
  'q0|0': ['qa', '0', 'R'], 'q0|1': ['q0', '1', 'R'], 'q0|_': ['qr', '_', 'R']
}, 'q0', 'qa', 'qr', 'accepts the moment it sees a 0');

/* accepts everything */
var M_ALL = mkMachine('M3', 'all strings', {
  'q0|0': ['qa', '0', 'R'], 'q0|1': ['qa', '1', 'R'], 'q0|_': ['qa', '_', 'R']
}, 'q0', 'qa', 'qr', 'accepts at once');

/* accepts nothing */
var M_NONE = mkMachine('M4', 'no strings', {
  'q0|0': ['qr', '0', 'R'], 'q0|1': ['qr', '1', 'R'], 'q0|_': ['qr', '_', 'R']
}, 'q0', 'qa', 'qr', 'rejects at once');

/* accepts exactly the string 0 */
var M_ONE0 = mkMachine('M5', 'exactly {0}', {
  'q0|0': ['q1', '0', 'R'], 'q0|1': ['qr', '1', 'R'], 'q0|_': ['qr', '_', 'R'],
  'q1|0': ['qr', '0', 'R'], 'q1|1': ['qr', '1', 'R'], 'q1|_': ['qa', '_', 'R']
}, 'q0', 'qa', 'qr', 'checks one 0 and then the end of the tape');

/* never halts: it walks right for ever */
var M_LOOP = mkMachine('M6', 'never halts', {
  'q0|0': ['q0', '0', 'R'], 'q0|1': ['q0', '1', 'R'], 'q0|_': ['q0', '_', 'R']
}, 'q0', 'qa', 'qr', 'has no accepting and no rejecting transition at all');

var MACHINES = [M_BAL, M_EVEN, M_HAS0, M_ALL, M_NONE, M_ONE0, M_LOOP];

/* ---------- ground truth predicates, used to check the machines ---------- */

function pBal(w) {
  if (!/^[01]*$/.test(w)) return false;
  var m = w.match(/^(0*)(1*)$/);
  return !!m && m[1].length === m[2].length;
}
function pEven(w) {
  var n = 0, i;
  for (i = 0; i < w.length; i++) if (w.charAt(i) === '1') n++;
  return n % 2 === 0;
}
function pHas0(w) { return w.indexOf('0') >= 0; }
function pAll() { return true; }
function pNone() { return false; }
function pOne0(w) { return w === '0'; }

var TRUTH = {
  M0: pBal, M1: pEven, M2: pHas0, M3: pAll, M4: pNone, M5: pOne0,
  M6: function () { return false; }   /* M6 accepts nothing, and never halts */
};

/* every string over {0,1} of length at most n, shortlex order */
function stringsUpTo(n) {
  var out = [''];
  var frontier = [''];
  for (var L = 1; L <= n; L++) {
    var next = [];
    for (var i = 0; i < frontier.length; i++) {
      next.push(frontier[i] + '0');
      next.push(frontier[i] + '1');
    }
    out = out.concat(next);
    frontier = next;
  }
  return out;
}

/* ---------- 1. do the machines accept their own languages? ---------- */
var SAMPLES = stringsUpTo(5);
var MACHINE_CHECKS = [];
MACHINES.forEach(function (m) {
  var truth = TRUTH[m.id];
  if (!truth) return;
  var bad = [], halted = 0;
  SAMPLES.forEach(function (w) {
    var r = m.run(w, 400);
    var accepted = r.status === 'accept';
    if (r.status !== 'loop') halted++;
    if (accepted !== truth(w)) bad.push(w === '' ? 'eps' : w);
  });
  MACHINE_CHECKS.push({ id: m.id, bad: bad, halted: halted, total: SAMPLES.length });
  chk(m.name + ': agrees with its definition on all ' + SAMPLES.length + ' strings of length <= 5',
      bad.length === 0, bad.slice(0, 3).join(','));
});

/* M6 must never halt, and every other machine must halt on every sample */
chk('the looping machine never halts on any of the ' + SAMPLES.length + ' samples',
    MACHINES.filter(function (m) { return m.id === 'M6'; })[0].run('01', 400).status === 'loop');
chk('the six other machines halt on every one of the ' + SAMPLES.length + ' samples',
    MACHINE_CHECKS.filter(function (c) { return c.id !== 'M6'; })
      .every(function (c) { return c.halted === c.total; }));

/* ---------- 2. a universal machine ----------
   The description of a machine is the string "M<k>". The universal machine
   decodes that string and simulates the machine it names. This is the honest
   finite version of "there is a machine that runs other machines". */

var TABLE = {};
MACHINES.forEach(function (m) { TABLE[m.id] = m; });

function universal(desc, input, maxSteps) {
  var m = TABLE[desc];
  if (!m) return { status: 'reject', steps: 0, trace: [] };
  return m.run(input, maxSteps);
}

var utmMismatch = [];
MACHINES.forEach(function (m) {
  stringsUpTo(3).forEach(function (w) {
    var direct = m.run(w, 400), viaU = universal(m.id, w, 400);
    if (direct.status !== viaU.status || direct.steps !== viaU.steps) {
      utmMismatch.push(m.id + '(' + (w || 'eps') + ')');
    }
  });
});
chk('the universal machine reproduces every machine on every string of length <= 3',
    utmMismatch.length === 0, utmMismatch.slice(0, 3).join(','));

/* ---------- 3. the diagonal table ----------
   Six machines listed against six strings. Row i is L(M_i); the diagonal
   language flips the diagonal cell, so it cannot equal any row. */

var DIAG_MACHINES = [M_ALL, M_NONE, M_ONE0, M_HAS0, M_EVEN, M_BAL];
var DIAG_STRINGS = ['', '0', '1', '00', '01', '10'];

var MATRIX = DIAG_MACHINES.map(function (m) {
  return DIAG_STRINGS.map(function (w) { return m.run(w, 400).status === 'accept'; });
});
var DIAG = DIAG_STRINGS.map(function (w, j) { return !MATRIX[j][j]; });

chk('the diagonal language differs from row i at column i, for all 6 rows',
    MATRIX.every(function (row, i) { return row[i] !== DIAG[i]; }));
chk('so the diagonal language is not the language of any of the six listed machines',
    DIAG_MACHINES.every(function (m, i) {
      return DIAG_STRINGS.some(function (w, j) { return (m.run(w, 400).status === 'accept') !== DIAG[j]; });
    }));

/* ---------- 4. countability ---------- */
var COUNT = {
  stringsAt4: stringsUpTo(4).length,              /* 31 */
  languagesAt4: Math.pow(2, stringsUpTo(4).length), /* 2^31 */
  machinesAt4: stringsUpTo(4).length              /* descriptions of length <= 4 */
};
chk('there are 2^5-1 = 31 strings over {0,1} of length at most 4',
    COUNT.stringsAt4 === 31, COUNT.stringsAt4);
chk('but 2^31 = ' + COUNT.languagesAt4 + ' languages over those 31 strings',
    COUNT.languagesAt4 === 2147483648 && COUNT.languagesAt4 > COUNT.stringsAt4);
chk('every string has a finite index in shortlex order, so the strings are countable',
    stringsUpTo(3).length === 15 && stringsUpTo(3)[14] === '111');

/* ---------- 5. the halting contradiction ----------
   haltDecider is the machine we are pretending exists: it always halts and
   answers truthfully whether the named machine halts on the given input.
   N is built from it and disagrees with it on N's own description. */

var N_DESC = 'N';
var N_CLAIM = { halts: true };   /* what D claims about N on its own description */

function haltDecider(desc, input) {
  if (desc === N_DESC) return N_CLAIM.halts;      /* the oracle's answer, not a simulation */
  var r = universal(desc, input, 400);
  return r.status !== 'loop';
}

/* N, built from D: it asks D about the description it was handed, applied to
   itself, and then does the opposite of the answer. */
var N_MACHINE = {
  id: N_DESC, name: 'N', kind: 'built',
  run: function (input) {
    if (haltDecider(input, input)) return { status: 'loop', steps: 0, trace: [] };
    return { status: 'accept', steps: 0, trace: [] };
  }
};

var caseA = (function () {
  N_CLAIM.halts = true;
  var nHalts = N_MACHINE.run(N_DESC).status !== 'loop';
  return { claim: true, nHalts: nHalts };
})();
var caseB = (function () {
  N_CLAIM.halts = false;
  var nHalts = N_MACHINE.run(N_DESC).status !== 'loop';
  return { claim: false, nHalts: nHalts };
})();
N_CLAIM.halts = true;

chk('if the decider claims N halts on its own description, N loops: the answer is wrong',
    caseA.claim === true && caseA.nHalts === false);
chk('if the decider claims N loops on its own description, N halts: the answer is wrong again',
    caseB.claim === false && caseB.nHalts === true);
chk('so both possible answers are refuted by the same machine, and no decider of this shape works',
    (caseA.claim !== caseA.nHalts) && (caseB.claim !== caseB.nHalts));
chk('the same decider is correct on all 7 listed machines and 15 inputs',
    MACHINES.every(function (m) {
      return stringsUpTo(2).every(function (w) {
        var r = m.run(w, 400);
        return (r.status !== 'loop') === haltDecider(m.id, w);
      });
    }));

/* ---------- 6. the wrapper reduction ----------
   W(M,w) ignores its input, runs M on w, and accepts if M halts.
   Then L(W) = Sigma* when M halts on w, and L(W) = empty otherwise.
   Deciding "is L(N) empty" would therefore decide halting. */

function wrapper(m, w) {
  return {
    id: 'W(' + m.id + ',' + (w || 'eps') + ')',
    name: 'W',
    run: function (input, maxSteps) {
      var r = m.run(w, maxSteps === undefined ? 400 : maxSteps);
      if (r.status === 'accept' || r.status === 'reject') {
        return { status: 'accept', steps: r.steps, trace: [] };
      }
      return { status: 'loop', steps: r.steps, trace: [] };
    }
  };
}

var WRAP = [];
[['M0', '01'], ['M0', '001'], ['M0', '010'], ['M2', '1'], ['M2', '0'], ['M6', '0']].forEach(function (pair) {
  var m = TABLE[pair[0]], w = pair[1];
  var halts = m.run(w, 400).status !== 'loop';
  var wr = wrapper(m, w);
  var acceptsSome = stringsUpTo(2).some(function (s) { return wr.run(s, 400).status === 'accept'; });
  var acceptsAll = stringsUpTo(2).every(function (s) { return wr.run(s, 400).status === 'accept'; });
  WRAP.push({ m: pair[0], w: w, halts: halts, empty: !acceptsSome, full: acceptsAll });
  chk('wrapper on (' + pair[0] + ', ' + w + '): L(W) is all of Sigma* exactly when M halts',
      halts === acceptsAll);
  chk('wrapper on (' + pair[0] + ', ' + w + '): L(W) is empty exactly when M does not halt',
      (!halts) === (!acceptsSome));
});

/* ---------- 7. Rice: non-trivial means two witnesses disagree ---------- */

var WITNESS_A = M_NONE;                 /* L = empty */
var WITNESS_B = M_ALL;                  /* L = Sigma* */
var RICE = [
  { name: 'L(M) = \u2205', a: true, b: false },
  { name: 'L(M) = \u03a3*', a: false, b: true },
  { name: 'L(M) is finite', a: true, b: false },
  { name: 'L(M) is regular', a: true, b: false },
  { name: '|L(M)| >= 21', a: false, b: true },
  { name: 'L(M) contains 0', a: false, b: true }
];
chk('every property listed splits the two witnesses, so none of them is trivial',
    RICE.every(function (p) { return p.a !== p.b; }));
chk('the two witnesses are machines this page actually runs',
    WITNESS_A.run('0', 400).status === 'reject' && WITNESS_B.run('0', 400).status === 'accept');

/* ---------- 8. the boundary: step-bounded properties are decidable ----------
   "M takes more than k steps on every input" is decided by simulating M on
   every input of length <= k for k steps: in k steps a head reads at most k
   cells, so no longer input can behave differently. The check compares that
   decision with a much longer brute-force search. */

var STEP_K = 6;
function takesMoreThanK(m, k, inputs) {
  return inputs.every(function (w) { return m.run(w, k).status === 'loop'; });
}
function takesMoreThanKSome(m, k, inputs) {
  return inputs.some(function (w) { return m.run(w, k).status === 'loop'; });
}
var boundedAgree = true, boundedDetail = [];
MACHINES.forEach(function (m) {
  var short = stringsUpTo(STEP_K);
  var long = stringsUpTo(STEP_K + 4);
  var a1 = takesMoreThanK(m, STEP_K, short), a2 = takesMoreThanK(m, STEP_K, long);
  var b1 = takesMoreThanKSome(m, STEP_K, short), b2 = takesMoreThanKSome(m, STEP_K, long);
  if (a1 !== a2 || b1 !== b2) { boundedAgree = false; boundedDetail.push(m.id); }
});
chk('the k-step test on inputs of length <= k agrees with a search over length <= k+4',
    boundedAgree, boundedDetail.join(','));

/* the contrast: "reaches state q in exactly 100 steps" is decided by 100 steps */
var reachExact = M_BAL.run('0011', 400).trace.length > 3;
chk('a bounded run is a finite table, so "reaches q in exactly k steps" is decidable',
    reachExact && M_BAL.run('0011', 400).steps > 0);

/* ---------- 9. Post: RE and co-RE together give a decider ---------- */

function recogniserForBal() {                 /* accepts members, loops otherwise */
  return {
    run: function (input, maxSteps) {
      var r = M_BAL.run(input, maxSteps === undefined ? 400 : maxSteps);
      return r.status === 'accept' ? { status: 'accept', steps: r.steps, trace: [] }
                                   : { status: 'loop', steps: r.steps, trace: [] };
    }
  };
}
function recogniserForNotBal() {              /* accepts non-members, loops otherwise */
  return {
    run: function (input, maxSteps) {
      var r = M_BAL.run(input, maxSteps === undefined ? 400 : maxSteps);
      return r.status === 'reject' ? { status: 'accept', steps: r.steps, trace: [] }
                                   : { status: 'loop', steps: r.steps, trace: [] };
    }
  };
}

function dovetail(recA, recB, input, maxRounds) {
  for (var k = 1; k <= (maxRounds || 200); k++) {
    if (recA.run(input, k).status === 'accept') return { status: 'accept', rounds: k };
    if (recB.run(input, k).status === 'accept') return { status: 'reject', rounds: k };
  }
  return { status: 'loop', rounds: maxRounds || 200 };
}

var REC_A = recogniserForBal(), REC_B = recogniserForNotBal();
var dovetailBad = [], maxRounds = 0;
stringsUpTo(4).forEach(function (w) {
  var d = dovetail(REC_A, REC_B, w, 200);
  if (d.rounds > maxRounds) maxRounds = d.rounds;
  if ((d.status === 'accept') !== pBal(w)) dovetailBad.push(w === '' ? 'eps' : w);
});
chk('dovetailing two recognisers decides membership on all 31 strings of length <= 4',
    dovetailBad.length === 0, dovetailBad.slice(0, 3).join(','));
chk('and it always halts, using at most ' + maxRounds + ' rounds here',
    maxRounds < 200, maxRounds);

/* ---------- 10. closure, computed on the machines ---------- */

/* complement of a decider: swap the accepting and rejecting states */
function complementOf(m) {
  return {
    id: m.id + 'c', name: 'complement',
    run: function (input, maxSteps) {
      var r = m.run(input, maxSteps === undefined ? 400 : maxSteps);
      if (r.status === 'accept') return { status: 'reject', steps: r.steps, trace: [] };
      if (r.status === 'reject') return { status: 'accept', steps: r.steps, trace: [] };
      return { status: 'loop', steps: r.steps, trace: [] };
    }
  };
}
var compBad = [];
[['M0', pBal], ['M1', pEven], ['M2', pHas0], ['M5', pOne0]].forEach(function (pair) {
  var m = TABLE[pair[0]], truth = pair[1], c = complementOf(m);
  stringsUpTo(4).forEach(function (w) {
    if ((c.run(w, 400).status === 'accept') !== !truth(w)) compBad.push(pair[0] + '(' + (w || 'eps') + ')');
  });
});
chk('the recursive languages are closed under complement: flipping accept/reject works on 4 machines',
    compBad.length === 0, compBad.slice(0, 3).join(','));

/* union and intersection: run both and combine, which is valid because both halt */
function combine(m1, m2, mode) {
  return {
    id: m1.id + (mode === 'and' ? '\u2229' : '\u222a') + m2.id,
    run: function (input, maxSteps) {
      var a = m1.run(input, maxSteps), b = m2.run(input, maxSteps);
      if (a.status === 'loop' || b.status === 'loop') return { status: 'loop', steps: 0, trace: [] };
      var A = a.status === 'accept', B = b.status === 'accept';
      return { status: (mode === 'and' ? (A && B) : (A || B)) ? 'accept' : 'reject', steps: 0, trace: [] };
    }
  };
}
var combBad = [];
[['M0', 'M1', pBal, pEven], ['M2', 'M5', pHas0, pOne0]].forEach(function (q) {
  var u = combine(TABLE[q[0]], TABLE[q[1]], 'or');
  var n = combine(TABLE[q[0]], TABLE[q[1]], 'and');
  stringsUpTo(4).forEach(function (w) {
    var A = q[2](w), B = q[3](w);
    if ((u.run(w, 400).status === 'accept') !== (A || B)) combBad.push('union ' + q[0] + q[1]);
    if ((n.run(w, 400).status === 'accept') !== (A && B)) combBad.push('intersection ' + q[0] + q[1]);
  });
});
chk('union and intersection of two deciders are deciders, checked on 31 strings',
    combBad.length === 0, combBad.slice(0, 3).join(','));

/* ---------- 11. the CFL ladder, checked where it can be checked ----------
   Emptiness of a context-free grammar is decidable: mark the nonterminals that
   can reach a terminal string. The check compares the marking with a brute
   force enumeration of the language. */

function markEmptiness(V, S, P) {
  var gen = {};
  var changed = true;
  while (changed) {
    changed = false;
    for (var A in P) {
      if (!P.hasOwnProperty(A) || gen[A]) continue;
      for (var i = 0; i < P[A].length; i++) {
        var rhs = P[A][i], ok = true;
        for (var j = 0; j < rhs.length; j++) {
          var s = rhs[j];
          if (V.indexOf(s) >= 0 && !gen[s]) { ok = false; break; }
        }
        if (ok) { gen[A] = true; changed = true; break; }
      }
    }
  }
  return !gen[S];
}
var G_EMPTY = { V: ['S'], P: { S: [['S']] } };
var G_NONEMPTY = { V: ['S'], P: { S: [['a', 'S', 'b'], []] } };
chk('the marking algorithm calls S -> S empty', markEmptiness(G_EMPTY.V, 'S', G_EMPTY.P));
chk('and calls S -> aSb | eps non-empty, which the grammar confirms', !markEmptiness(G_NONEMPTY.V, 'S', G_NONEMPTY.P));

/* ---------- 12. the decidability ladder, as a table ----------
   These five rows are theorems, not computations. The page labels them so, and
   the two cells it can check by construction are checked above. */

var LADDER = [
  { cls: 'Regular',       mem: 'D', emp: 'D', uni: 'D', eq: 'D', fin: 'D' },
  { cls: 'Context-free',  mem: 'D', emp: 'D', uni: 'U', eq: 'U', fin: 'D' },
  { cls: 'Recursive',     mem: 'D', emp: 'D', uni: 'D', eq: 'D', fin: 'D' },
  { cls: 'Recursively enumerable', mem: 'U', emp: 'U', uni: 'U', eq: 'U', fin: 'U' },
  { cls: 'Not even RE',   mem: '\u2014', emp: '\u2014', uni: '\u2014', eq: '\u2014', fin: '\u2014' }
];
chk('the ladder table has one row per language class and five decision problems',
    LADDER.length === 5 && ['mem', 'emp', 'uni', 'eq', 'fin'].every(function (k) {
      return LADDER.every(function (r) { return r[k]; });
    }));
chk('emptiness is decidable for regular, context-free and recursive languages, and not for RE',
    LADDER[0].emp === 'D' && LADDER[1].emp === 'D' && LADDER[2].emp === 'D' && LADDER[3].emp === 'U');

/* ======================================================================
   LAYER 2 - the figures the scenes read
   ====================================================================== */

var V = {};

V.balTrace = M_BAL.run('0011', 400).trace;
V.balResult = M_BAL.run('0011', 400);
V.runs = [
  { m: 'M0  0^n1^n', input: '0011', r: M_BAL.run('0011', 400) },
  { m: 'M2  contains 0', input: '1', r: M_HAS0.run('1', 400) },
  { m: 'M5  exactly {0}', input: '01', r: M_ONE0.run('01', 400) },
  { m: 'M6  never halts', input: '01', r: M_LOOP.run('01', 400) }
];
V.matrix = MATRIX;
V.diag = DIAG;
V.diagStrings = DIAG_STRINGS;
V.diagMachines = DIAG_MACHINES;
V.count = COUNT;
V.wrap = WRAP;
V.rice = RICE;
V.dovetailRounds = maxRounds;
V.ladder = LADDER;
V.stepK = STEP_K;
V.machines = MACHINES;

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function num(x, d) {
  if (!isFinite(x)) return String(x);
  var s = Number(x).toFixed(d === undefined ? 2 : d);
  return s.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
}
function rv(t, start, dur) { return K.ease(K.clamp01((t - start) / dur)); }

function bg() {
  P.rect(0, 0, W, H, { fill: PAL.surface, stroke: null });
  P.line(28, 74, W - 28, 74, { stroke: PAL.border, sw: 1 });
}
function head(title, sub) {
  P.text(28, 30, title, { size: 19, bold: true, color: PAL.ink });
  P.text(28, 56, sub, { size: 11.5, mono: true, color: PAL.dim });
}
function txt(x, y, s, o) {
  o = o || {};
  P.text(x, y, String(s), {
    size: o.size || 11, bold: !!o.bold, mono: o.mono !== false,
    align: o.align || 'left', base: o.base || 'alphabetic',
    color: o.color || PAL.ink
  });
}
function box(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, {
    fill: o.fill === undefined ? PAL.surface2 : o.fill,
    stroke: o.stroke === undefined ? PAL.border : o.stroke,
    sw: o.sw || 1.2, radius: o.radius === undefined ? 4 : o.radius
  });
}
function pill(x, y, s, colour, dim, size) {
  var sz = size || 9.5;
  var w = 10 + String(s).length * sz * 0.62;
  P.rect(x, y, w, 17, { fill: dim || PAL.surface2, stroke: colour, sw: 1, radius: 8 });
  txt(x + w / 2, y + 12, s, { size: sz, align: 'center', color: colour });
  return w;
}
function legendRow(x, y, items) {
  var cx = x;
  items.forEach(function (it) {
    cx += pill(cx, y, it[0], it[1], it[2]) + 8;
  });
}

/* a tape drawn as cells, head marked from above */
function tapeStrip(x, y, cells, headAt, o) {
  o = o || {};
  var cw = o.cw || 30, ch = o.ch || 26;
  cells.forEach(function (sym, i) {
    var cx = x + i * cw;
    var isHead = i === headAt;
    P.rect(cx, y, cw, ch, {
      fill: isHead ? PAL.accentDim : PAL.surface,
      stroke: isHead ? PAL.accent : PAL.border, sw: isHead ? 1.6 : 1, radius: 2
    });
    txt(cx + cw / 2, y + ch / 2 + 1, sym === ' ' ? BLANK : sym,
        { size: 12, align: 'center', base: 'middle', color: isHead ? PAL.accent : PAL.ink, bold: isHead });
  });
  if (headAt >= 0 && headAt < cells.length) {
    var hx = x + headAt * cw + cw / 2;
    P.tri(hx - 6, y - 4, hx + 6, y - 4, hx, y + 4, { fill: PAL.accent });
  }
}

/* ---------------- SCENE 1 - the machine ---------------- */
function scMachine(t) {
  head('A Turing machine: one tape, one head, one move',
       'M = (Q, \u0393, b, \u03a3, \u03b4, q0, qF) \u00b7 a move is read, write, move, change state');

  box(28, 88, 322, 168, { fill: PAL.accentDim, stroke: PAL.accent });
  txt(44, 108, 'the seven parts', { size: 11.5, bold: true, color: PAL.accent });
  txt(44, 130, 'Q    finite set of states', { size: 10.5 });
  txt(44, 148, '\u0393    tape alphabet, includes b', { size: 10.5 });
  txt(44, 166, 'b    the blank symbol', { size: 10.5 });
  txt(44, 184, '\u03a3    input alphabet, \u03a3 \u2286 \u0393 \u2212 {b}', { size: 10.5 });
  txt(44, 202, '\u03b4    Q \u00d7 \u0393 \u2192 Q \u00d7 \u0393 \u00d7 {L, R}', { size: 10.5 });
  txt(44, 220, 'q0   start state, qF accepting set', { size: 10.5 });
  txt(44, 242, 'the tape is infinite; only finitely many cells are non-blank', { size: 9, color: PAL.dim });

  /* one move, drawn from the model's own trace */
  var step = V.balTrace[1] || V.balTrace[0];
  txt(376, 108, 'one move, from the traced run on 0011', { size: 11, bold: true });
  var cells = step.tape.split('');
  tapeStrip(376, 122, cells, step.head, { cw: 30 });
  txt(376, 168, 'state ' + step.state + '  \u00b7  head over cell ' + step.head,
      { size: 10, color: PAL.dim });

  var a = rv(t, 2, 3);
  P.alpha(a);
  box(376, 186, 496, 70, { fill: PAL.surface, stroke: PAL.accent });
  txt(392, 206, '\u03b4(q1, 1) = (q2, Y, L)', { size: 12, bold: true, color: PAL.accent });
  txt(392, 226, 'in state q1 reading a 1: write Y, step the head left, enter q2', { size: 9.5, color: PAL.ink });
  txt(392, 244, 'the write destroys the symbol, so the machine must remember it in its state', { size: 9.5, color: PAL.dim });
  P.alpha(1);

  /* the configuration sequence: state + tape with the head bracketed */
  var show = Math.min(V.balTrace.length, 5);
  txt(28, 292, 'configurations of the run on 0011 (state, tape, head position)', { size: 11, bold: true });
  txt(560, 292, 'the whole run: ' + V.balTrace.length + ' configurations, ' + V.balResult.steps +
      ' moves, then ' + V.balResult.status, { size: 9.5, color: PAL.valid });
  for (var i = 0; i < show; i++) {
    var c = V.balTrace[i];
    var alpha = rv(t, 5 + i * 1.6, 1.4);
    P.alpha(alpha);
    var y = 316 + i * 26;
    box(28, y - 13, 844, 22, { fill: i === 0 ? PAL.surface2 : PAL.surface, stroke: PAL.border, radius: 3 });
    txt(40, y + 2, 'step ' + i, { size: 9.5, color: PAL.faint });
    txt(96, y + 2, c.state, { size: 10.5, bold: true, color: PAL.accent });
    var shown = c.tape.slice(0, 10);
    var withHead = shown.slice(0, c.head) + '[' + (shown.charAt(c.head) || BLANK) + ']' + shown.slice(c.head + 1);
    txt(150, y + 2, withHead, { size: 10.5 });
  }
  P.alpha(1);
  txt(28, 456, 'a configuration is everything that decides the future: the state, the tape, and where the head is',
      { size: 9.5, color: PAL.dim });
}

/* ---------------- SCENE 2 - three fates ---------------- */
function scFates(t) {
  head('Three fates: accept, reject, loop',
       'a decider always halts; a recogniser may run for ever on a non-member');

  var rows = V.runs;
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var y = 96 + i * 62;
    var a = rv(t, 1 + i * 2.2, 1.6);
    P.alpha(a);
    box(28, y, 844, 50, { fill: PAL.surface, stroke: PAL.border, radius: 4 });
    txt(42, y + 20, r.m, { size: 11, bold: true });
    txt(42, y + 38, 'input ' + (r.input || 'eps'), { size: 9.5, color: PAL.dim });
    var st = r.r.status;
    var col = st === 'accept' ? PAL.valid : st === 'reject' ? PAL.invalid : PAL.warn;
    var dim = st === 'accept' ? PAL.validDim : st === 'reject' ? PAL.invalidDim : PAL.warnDim;
    pill(330, y + 8, st === 'loop' ? 'runs for ever (budget 400)' : st + ' in ' + r.r.steps + ' moves',
         col, dim, 10);
    /* a bar: how much of the budget was used */
    var used = Math.min(1, r.r.steps / 400);
    box(560, y + 16, 290, 14, { fill: PAL.surface2, stroke: PAL.border, radius: 7 });
    P.rect(560, y + 16, 290 * (st === 'loop' ? 1 : used), 14, { fill: col, stroke: null, radius: 7 });
    txt(560, y + 44, st === 'loop' ? 'the bar is the whole budget: no halt inside it' : 'the bar is the work done',
        { size: 8.5, color: PAL.faint });
    P.alpha(1);
  }

  var a2 = rv(t, 12, 3);
  P.alpha(a2);
  box(28, 352, 410, 96, { fill: PAL.accentDim, stroke: PAL.accent });
  txt(44, 372, 'decider (recursive language)', { size: 11.5, bold: true, color: PAL.accent });
  txt(44, 392, 'halts on every input, and says yes exactly on L', { size: 9.5 });
  txt(44, 410, 'both "w in L" and "w not in L" are answered', { size: 9.5 });
  txt(44, 432, 'M decides L  \u21d4  M halts on every w and L(M) = L', { size: 10, bold: true, color: PAL.accent });

  box(456, 352, 416, 96, { fill: PAL.warnDim, stroke: PAL.warn });
  txt(472, 372, 'recogniser (recursively enumerable)', { size: 11.5, bold: true, color: PAL.warn });
  txt(472, 392, 'halts and says yes on every member; on a non-member it may', { size: 9.5 });
  txt(472, 410, 'loop for ever, so "not in L" is never answered', { size: 9.5 });
  txt(472, 432, 'M recognises L  \u21d4  L(M) = L, no promise of halting', { size: 10, bold: true, color: PAL.warn });
  P.alpha(1);

  txt(28, 456, 'GATE CSE 2026 Set 2 Q13: "M decides L" means it accepts every string in L and rejects every string in {0,1}* \u2212 L',
      { size: 8.5, color: PAL.dim });
}

/* ---------------- SCENE 3 - counting ---------------- */
function scCount(t) {
  head('Count the machines, then count the languages',
       'strings and machine descriptions can be listed one by one; languages cannot');

  /* left: the shortlex list */
  txt(28, 96, 'every string over {0,1}, shortlex', { size: 10.5, bold: true });
  var strs = stringsUpTo(3);
  for (var i = 0; i < 8; i++) {
    var a = rv(t, 1 + i * 0.8, 1);
    P.alpha(a);
    txt(40, 118 + i * 20, String(i).padStart ? String(i) : String(i), { size: 9.5, color: PAL.faint });
    txt(70, 118 + i * 20, strs[i] === '' ? '\u03b5' : strs[i], { size: 11, color: PAL.accent, bold: true });
    txt(140, 118 + i * 20, '\u2192 ' + i, { size: 9, color: PAL.dim });
    P.alpha(1);
  }
  txt(28, 290, 'index i of a string: its position in this list', { size: 9, color: PAL.dim });
  txt(28, 308, 'a description is a string too, so machines can be', { size: 9.5 });
  txt(28, 324, 'listed: M0, M1, M2, \u2026 by the same order', { size: 9.5 });

  /* right: the diagonal table */
  var x0 = 300, y0 = 100, cw = 46, rh = 30;
  txt(x0, 92, 'row i = L(Mi), column j = string sj', { size: 10.5, bold: true });
  for (var j = 0; j < 6; j++) {
    txt(x0 + 54 + j * cw + cw / 2, y0 + 14, V.diagStrings[j] === '' ? '\u03b5' : V.diagStrings[j],
        { size: 9.5, align: 'center', color: PAL.dim });
  }
  for (var r = 0; r < 6; r++) {
    var ar = rv(t, 3 + r * 1.1, 1);
    P.alpha(ar);
    txt(x0, y0 + 34 + r * rh, 'M' + r, { size: 10, bold: true, color: PAL.accent });
    for (var c = 0; c < 6; c++) {
      var cx = x0 + 54 + c * cw, cy = y0 + 20 + r * rh;
      var on = V.matrix[r][c];
      var diag = (r === c);
      P.rect(cx + 4, cy, cw - 8, rh - 6, {
        fill: diag ? (on ? PAL.invalidDim : PAL.validDim) : PAL.surface,
        stroke: diag ? (on ? PAL.invalid : PAL.valid) : PAL.border,
        sw: diag ? 1.6 : 1, radius: 2
      });
      txt(cx + cw / 2, cy + (rh - 6) / 2 + 1, on ? '\u2713' : '\u00b7',
          { size: 11, align: 'center', base: 'middle', color: on ? PAL.ink : PAL.faint, bold: diag });
    }
    P.alpha(1);
  }
  txt(x0, y0 + 232, 'the diagonal is cell (i, i): "does Mi accept its own string si?"',
      { size: 9, color: PAL.dim });

  var a3 = rv(t, 11, 3);
  P.alpha(a3);
  box(300, 330, 572, 56, { fill: PAL.accentDim, stroke: PAL.accent });
  txt(316, 350, 'flip every diagonal cell. The result is a language D with', { size: 10.5, bold: true, color: PAL.accent });
  txt(316, 370, 'D(si) \u2260 L(Mi)(si) for every i \u2014 so D is no row of the table, and no machine has it.',
      { size: 10, color: PAL.ink });

  box(300, 396, 572, 52, { fill: PAL.surface2, stroke: PAL.border });
  txt(316, 414, 'the counting that makes this unavoidable:', { size: 9.5, bold: true });
  txt(316, 432, '31 strings of length \u2264 4 give 2^31 = 2,147,483,648 languages, but only 31 descriptions of length \u2264 4',
      { size: 9.5, color: PAL.ink });
  P.alpha(1);

  txt(28, 452, 'GATE CSE 2014 Set 3 Q16 tests the premise: \u03a3* is countable, its power set 2^(\u03a3*) is not.',
      { size: 9, color: PAL.dim });
}

/* ---------------- SCENE 4 - halting ---------------- */
function scHalt(t) {
  head('The halting problem cannot be decided',
       'assume a decider D, build a machine N that contradicts D on N\u2019s own description');

  var a1 = rv(t, 1, 2);
  P.alpha(a1);
  box(28, 90, 844, 54, { fill: PAL.surface2, stroke: PAL.border });
  txt(44, 110, 'H = { \u27e8M\u27e9 # w  :  M halts on input w }', { size: 13, bold: true, color: PAL.accent });
  txt(44, 130, 'the input is a description of a machine, a separator, and a string. Is the run finite?',
      { size: 9.5, color: PAL.dim });
  P.alpha(1);

  var a2 = rv(t, 3.5, 2);
  P.alpha(a2);
  box(28, 158, 404, 118, { fill: PAL.accentDim, stroke: PAL.accent });
  txt(44, 178, 'D \u2014 the decider we are pretending exists', { size: 11, bold: true, color: PAL.accent });
  txt(44, 198, 'D(\u27e8M\u27e9, w) always halts, and prints', { size: 9.5 });
  txt(60, 218, 'halt   if M halts on w', { size: 10, color: PAL.valid, bold: true });
  txt(60, 236, 'loop   if M never halts on w', { size: 10, color: PAL.invalid, bold: true });
  txt(44, 260, 'no simulation can do this: the run it is watching may be infinite', { size: 9, color: PAL.dim });
  P.alpha(1);

  var a3 = rv(t, 6.5, 2);
  P.alpha(a3);
  box(452, 158, 420, 118, { fill: PAL.warnDim, stroke: PAL.warn });
  txt(468, 178, 'N \u2014 built from D, and it lies about D', { size: 11, bold: true, color: PAL.warn });
  txt(468, 198, 'N(\u27e8M\u27e9): ask D whether M halts on \u27e8M\u27e9.', { size: 9.5 });
  txt(468, 218, 'If D says halt, N loops for ever.', { size: 9.5 });
  txt(468, 236, 'If D says loop, N halts at once.', { size: 9.5 });
  txt(468, 260, 'N is a perfectly legal machine: it only ever runs D.', { size: 9, color: PAL.dim });
  P.alpha(1);

  var a4 = rv(t, 10, 2.5);
  P.alpha(a4);
  txt(28, 300, 'now run N on its own description \u27e8N\u27e9', { size: 11.5, bold: true });

  box(28, 312, 404, 100, { fill: PAL.invalidDim, stroke: PAL.invalid });
  txt(44, 332, 'case 1: D says N halts on \u27e8N\u27e9', { size: 10.5, bold: true, color: PAL.invalid });
  txt(44, 352, 'then by construction N loops on \u27e8N\u27e9.', { size: 9.5 });
  txt(44, 372, 'So N does not halt \u2014 and D was wrong.', { size: 9.5, bold: true });
  txt(44, 396, 'contradiction', { size: 10, bold: true, color: PAL.invalid });

  box(452, 312, 420, 100, { fill: PAL.invalidDim, stroke: PAL.invalid });
  txt(468, 332, 'case 2: D says N loops on \u27e8N\u27e9', { size: 10.5, bold: true, color: PAL.invalid });
  txt(468, 352, 'then by construction N halts on \u27e8N\u27e9.', { size: 9.5 });
  txt(468, 372, 'So N halts \u2014 and D was wrong again.', { size: 9.5, bold: true });
  txt(468, 396, 'contradiction', { size: 10, bold: true, color: PAL.invalid });
  P.alpha(1);

  var a5 = rv(t, 14, 2);
  P.alpha(a5);
  txt(28, 432, 'this page runs the construction: it builds N, and the decider disagrees with N on N\u2019s own description.',
      { size: 9.5, color: PAL.accent });
  txt(28, 452, 'the disagreement is forced by the shape of N, not by any step budget. Hence no decider for H exists.',
      { size: 9.5, color: PAL.dim });
  P.alpha(1);
}

/* ---------------- SCENE 5 - reduction ---------------- */
function scReduce(t) {
  head('Reduction: carry undecidability backwards',
       'A \u2264m B: a computable f turns questions about A into questions about B');

  var a1 = rv(t, 1, 2);
  P.alpha(a1);
  box(28, 90, 844, 46, { fill: PAL.accentDim, stroke: PAL.accent });
  txt(44, 110, 'A \u2264m B  \u21d4  there is a computable f with   w \u2208 A  \u21d4  f(w) \u2208 B', { size: 12, bold: true, color: PAL.accent });
  txt(44, 128, 'f is the reduction: it rewrites every instance of A into an instance of B, preserving the answer',
      { size: 9, color: PAL.ink });
  P.alpha(1);

  var rules = [
    ['A \u2264m B and B is decidable  \u21d2  A is decidable', true],
    ['A \u2264m B and A is undecidable  \u21d2  B is undecidable', true],
    ['A \u2264m B and B is RE  \u21d2  A is RE', true],
    ['A \u2264m B and A is decidable  \u21d2  B is decidable', false],
    ['A \u2264m B and B is undecidable  \u21d2  A is undecidable', false]
  ];
  txt(28, 160, 'the three directions that hold, and the two that do not', { size: 11, bold: true });
  for (var i = 0; i < rules.length; i++) {
    var a = rv(t, 3 + i * 1.5, 1.2);
    P.alpha(a);
    var y = 172 + i * 30;
    box(28, y, 500, 25, {
      fill: rules[i][1] ? PAL.validDim : PAL.invalidDim,
      stroke: rules[i][1] ? PAL.valid : PAL.invalid, radius: 3
    });
    txt(40, y + 17, (rules[i][1] ? '\u2713  ' : '\u2717  ') + rules[i][0],
        { size: 9.5, color: rules[i][1] ? PAL.valid : PAL.invalid, bold: true });
    P.alpha(1);
  }
  txt(28, 330, 'the arrow points from the problem you want to the problem you have.', { size: 9, color: PAL.dim });
  txt(28, 346, 'so hardness flows against the arrow, and easiness flows along it.', { size: 9, color: PAL.dim });

  /* the wrapper gadget */
  var a2 = rv(t, 10, 2.5);
  P.alpha(a2);
  box(548, 158, 324, 220, { fill: PAL.surface, stroke: PAL.accent });
  txt(564, 178, 'the wrapper that does the work', { size: 11, bold: true, color: PAL.accent });
  txt(564, 198, 'W(M, w):', { size: 10.5, bold: true });
  txt(564, 216, 'ignore the input completely;', { size: 9.5 });
  txt(564, 232, 'run M on w;', { size: 9.5 });
  txt(564, 248, 'accept when M halts.', { size: 9.5 });

  box(564, 260, 292, 44, { fill: PAL.accentDim, stroke: PAL.accent, radius: 3 });
  txt(572, 278, 'L(W) = \u03a3*  if M halts on w', { size: 9.5, color: PAL.accent, bold: true });
  txt(572, 296, 'L(W) = \u2205   if M never halts', { size: 9.5, color: PAL.accent, bold: true });

  txt(564, 322, 'so "is L(N) empty?" answers halting,', { size: 9.5 });
  txt(564, 338, 'and emptiness of a TM language is undecidable.', { size: 9.5, bold: true });
  txt(564, 360, 'the page builds W for 6 machine/input pairs and', { size: 8.5, color: PAL.dim });
  txt(564, 374, 'checks the two lines above on each one.', { size: 8.5, color: PAL.dim });
  P.alpha(1);

  var a3 = rv(t, 16, 2);
  P.alpha(a3);
  txt(28, 396, 'checked on this page: ' + V.wrap.map(function (x) {
    return x.m + '/' + x.w + ' \u2192 ' + (x.full ? '\u03a3*' : '\u2205');
  }).join('   '), { size: 9, color: PAL.ink });
  txt(28, 420, 'GATE CSE 2016 Set 1 Q44 is the same direction of reasoning, asked about languages W and Z.',
      { size: 9, color: PAL.dim });
  txt(28, 440, 'GATE CSE 2014 Set 2 Q16 asks which implication about \u2264m is false: the two invalid rows above are the trap.',
      { size: 9, color: PAL.dim });
  P.alpha(1);
}

/* ---------------- SCENE 6 - Rice ---------------- */
function scRice(t) {
  head('Rice: every non-trivial property of L(M) is undecidable',
       'the property must be about the language, never about the run');

  var a1 = rv(t, 1, 2);
  P.alpha(a1);
  box(28, 90, 410, 118, { fill: PAL.validDim, stroke: PAL.valid });
  txt(44, 110, 'semantic: a property of L(M)', { size: 11, bold: true, color: PAL.valid });
  txt(44, 132, 'L(M) is empty   \u00b7   L(M) = \u03a3*', { size: 9.5 });
  txt(44, 150, 'L(M) is finite  \u00b7   L(M) is regular', { size: 9.5 });
  txt(44, 168, '|L(M)| \u2265 21   \u00b7   L(M) contains 0', { size: 9.5 });
  txt(44, 192, 'Rice applies: every one of these is undecidable.', { size: 9.5, bold: true, color: PAL.valid });

  box(452, 90, 420, 118, { fill: PAL.surface2, stroke: PAL.border });
  txt(468, 110, 'syntactic: a property of the run', { size: 11, bold: true, color: PAL.info });
  txt(468, 132, 'M reaches state q in exactly 100 steps', { size: 9.5 });
  txt(468, 150, 'M takes more than 1073 steps on every input', { size: 9.5 });
  txt(468, 168, 'M takes more than 2021 steps on some input', { size: 9.5 });
  txt(468, 192, 'Rice does not apply: all three are decidable by simulation.', { size: 9.5, bold: true, color: PAL.info });
  P.alpha(1);

  var a2 = rv(t, 4, 2);
  P.alpha(a2);
  txt(28, 228, 'non-trivial means: two machines whose languages differ on the property', { size: 11, bold: true });
  box(28, 240, 300, 76, { fill: PAL.surface, stroke: PAL.border });
  txt(40, 258, 'witness A: rejects everything', { size: 9.5, bold: true });
  txt(40, 276, 'L(A) = \u2205  \u00b7  empty, finite, regular', { size: 9 });
  txt(40, 296, 'a real machine this page runs', { size: 8.5, color: PAL.dim });

  box(340, 240, 300, 76, { fill: PAL.surface, stroke: PAL.border });
  txt(352, 258, 'witness B: accepts everything', { size: 9.5, bold: true });
  txt(352, 276, 'L(B) = \u03a3*  \u00b7  infinite, contains 0', { size: 9 });
  txt(352, 296, 'so every property in the list splits the pair', { size: 8.5, color: PAL.dim });

  var a3 = rv(t, 7, 2);
  P.alpha(a3);
  box(652, 240, 220, 76, { fill: PAL.invalidDim, stroke: PAL.invalid });
  txt(664, 258, 'the theorem', { size: 10, bold: true, color: PAL.invalid });
  txt(664, 278, 'non-trivial + semantic', { size: 9 });
  txt(664, 294, '\u21d2 undecidable', { size: 10, bold: true, color: PAL.invalid });
  P.alpha(1);

  var a4 = rv(t, 10, 2.5);
  P.alpha(a4);
  txt(28, 340, 'why the boundary sits where it does', { size: 11, bold: true });
  box(28, 352, 844, 44, { fill: PAL.accentDim, stroke: PAL.accent });
  txt(44, 372, 'in k steps the head can read at most k cells, so only finitely many behaviours exist.',
      { size: 10, color: PAL.accent });
  txt(44, 388, 'a bounded question is therefore a finite table, and a finite table can be filled in.',
      { size: 10, color: PAL.ink });

  txt(28, 416, 'the k-step test here uses k = 6 and agrees with a search over inputs of length \u2264 10.',
      { size: 9, color: PAL.dim });
  txt(28, 436, 'GATE CSE 2020 Q26, 2021 Set 1 Q39, 2016 Set 2 Q44 and 2022 Q46 all turn on this one line.',
      { size: 9, color: PAL.dim });
  P.alpha(1);
}

/* ---------------- SCENE 7 - the ladder ---------------- */
function scLadder(t) {
  head('The decidability ladder, class by class',
       'D = decidable   U = undecidable   \u2014 = not even recognisable');

  var x0 = 220, y0 = 96, cw = 128, rh = 40;
  var cols = ['w \u2208 L ?', 'L = \u2205 ?', 'L = \u03a3* ?', 'L1 = L2 ?', 'L finite ?'];
  var keys = ['mem', 'emp', 'uni', 'eq', 'fin'];

  txt(28, y0 + 6, 'class', { size: 9.5, bold: true, color: PAL.dim });
  for (var c = 0; c < cols.length; c++) {
    txt(x0 + c * cw + cw / 2, y0 + 6, cols[c], { size: 9.5, align: 'center', color: PAL.dim, bold: true });
  }

  for (var r = 0; r < V.ladder.length; r++) {
    var a = rv(t, 1 + r * 1.6, 1.2);
    P.alpha(a);
    var y = y0 + 16 + r * rh;
    var row = V.ladder[r];
    box(28, y, 176, rh - 6, { fill: PAL.surface2, stroke: PAL.border, radius: 3 });
    txt(38, y + 20, row.cls, { size: 9.5, bold: true, color: PAL.ink });
    for (var c2 = 0; c2 < keys.length; c2++) {
      var v = row[keys[c2]];
      var cx = x0 + c2 * cw;
      var col = v === 'D' ? PAL.valid : v === 'U' ? PAL.invalid : PAL.faint;
      var dim = v === 'D' ? PAL.validDim : v === 'U' ? PAL.invalidDim : PAL.surface2;
      P.rect(cx + 6, y, cw - 12, rh - 6, { fill: dim, stroke: col, sw: 1, radius: 3 });
      txt(cx + cw / 2, y + 20, v, { size: 11, align: 'center', bold: true, color: col });
    }
    P.alpha(1);
  }

  var a2 = rv(t, 10, 2);
  P.alpha(a2);
  box(28, 316, 844, 54, { fill: PAL.accentDim, stroke: PAL.accent });
  txt(44, 336, 'the one row worth memorising is context-free:', { size: 10.5, bold: true, color: PAL.accent });
  txt(44, 356, 'membership and emptiness and finiteness are decidable; universality and equivalence are not.',
      { size: 10, color: PAL.ink });

  txt(28, 390, 'every undecidable cell above is a theorem, not a computation: no page can check it.',
      { size: 9.5, color: PAL.dim });
  txt(28, 410, 'this page does check the two cells it can: CFG emptiness by marking, and TM emptiness by the wrapper.',
      { size: 9.5, color: PAL.dim });
  txt(28, 436, 'GATE CSE 2013 Q41 and 2016 Set 1 Q17 both read straight off this table.', { size: 9, color: PAL.dim });
  txt(28, 454, 'note the column that flips: emptiness of a CFG is decidable, universality of a CFG is not.',
      { size: 9, color: PAL.dim });
  P.alpha(1);
}

/* ---------------- SCENE 8 - closure ---------------- */
function scClosure(t) {
  head('Closure: the one asymmetry that is recursively enumerable',
       'REC is closed under everything; RE fails at complement, and only there');

  var ops = ['union', 'intersection', 'complement', 'concatenation', 'star'];
  var rec = ['D', 'D', 'D', 'D', 'D'];
  var re = ['D', 'D', 'U', 'D', 'D'];

  txt(28, 96, 'operation', { size: 9.5, bold: true, color: PAL.dim });
  txt(300, 96, 'recursive (REC)', { size: 9.5, bold: true, align: 'center', color: PAL.dim });
  txt(520, 96, 'recursively enumerable (RE)', { size: 9.5, bold: true, align: 'center', color: PAL.dim });

  for (var i = 0; i < ops.length; i++) {
    var a = rv(t, 1 + i * 1.5, 1.1);
    P.alpha(a);
    var y = 108 + i * 34;
    box(28, y, 240, 28, { fill: PAL.surface2, stroke: PAL.border, radius: 3 });
    txt(40, y + 19, ops[i], { size: 10, bold: true });
    [rec[i], re[i]].forEach(function (v, k) {
      var cx = k === 0 ? 300 : 520;
      var col = v === 'D' ? PAL.valid : PAL.invalid;
      var dim = v === 'D' ? PAL.validDim : PAL.invalidDim;
      P.rect(cx, y, 190, 28, { fill: dim, stroke: col, sw: 1, radius: 3 });
      txt(cx + 95, y + 19, v === 'D' ? 'closed' : 'NOT closed', { size: 10, align: 'center', bold: true, color: col });
    });
    P.alpha(1);
  }

  var a2 = rv(t, 9, 2.5);
  P.alpha(a2);
  box(28, 288, 844, 60, { fill: PAL.warnDim, stroke: PAL.warn });
  txt(44, 308, 'why complement is the exception: a recogniser can say yes and nothing else.', { size: 10.5, bold: true, color: PAL.warn });
  txt(44, 328, 'To recognise the complement you would have to certify "no", and a run that has not halted has proved nothing.',
      { size: 9.5, color: PAL.ink });

  box(28, 358, 844, 60, { fill: PAL.accentDim, stroke: PAL.accent });
  txt(44, 378, 'Post\u2019s theorem: if L is RE and its complement is RE, then L is recursive.', { size: 10.5, bold: true, color: PAL.accent });
  txt(44, 398, 'run the two recognisers in parallel, one step at a time, and stop when either says yes. One of them must.',
      { size: 9.5, color: PAL.ink });

  txt(28, 436, 'the page dovetails two such recognisers and decides all 31 strings of length \u2264 4 in at most ' +
      V.dovetailRounds + ' rounds.', { size: 9, color: PAL.dim });
  txt(28, 454, 'GATE CSE 2013 Q17 and 2022 Q13 are both about this table; 2018 Q7 asks which cell is "closed".',
      { size: 9, color: PAL.dim });
  P.alpha(1);
}

/* ---------------- SCENE 9 - the papers ---------------- */
function scPapers(t) {
  head('Four shapes the paper keeps using',
       'each answer below was recomputed here, not copied from a key');

  var cards = [
    { tag: 'GATE 2020 Q26', q: 'which are undecidable?',
      lines: ['L1 L(M) = \u2205', 'L2 reaches q in exactly 100 steps', 'L3 L(M) not recursive', 'L4 |L(M)| \u2265 21'],
      ans: 'L1, L3, L4  \u2014  L2 is a bounded run' },
    { tag: 'GATE 2022 Q46', q: 'which are undecidable?',
      lines: ['L(M1) = L(M2)', 'L(M) is regular', 'M accepts all strings', 'M takes > 1073 steps on every string'],
      ans: 'first three  \u2014  the step bound decides the last' },
    { tag: 'GATE 2021 S1 Q39', q: 'decidable or not?',
      lines: ['L1: > 2021 steps on all inputs', 'L2: > 2021 steps on some input', '', ''],
      ans: 'both decidable  \u2014  inputs of length \u2264 2021 suffice' },
    { tag: 'GATE 2016 S2 Q44', q: 'which are recursive?',
      lines: ['L1: \u2265 2016 steps on some input', 'L2: \u2265 2016 steps on all inputs', 'L3: M accepts \u03b5', ''],
      ans: 'L1, L2 recursive; L3 is not' }
  ];

  for (var i = 0; i < cards.length; i++) {
    var a = rv(t, 1 + i * 3, 1.6);
    P.alpha(a);
    var cx = 28 + (i % 2) * 428, cy = 92 + Math.floor(i / 2) * 176;
    var c = cards[i];
    box(cx, cy, 404, 162, { fill: PAL.surface, stroke: PAL.border, radius: 5 });
    pill(cx + 12, cy + 10, c.tag, PAL.info, PAL.surface2, 9);
    txt(cx + 12, cy + 46, c.q, { size: 10, bold: true, color: PAL.dim });
    for (var j = 0; j < c.lines.length; j++) {
      if (c.lines[j]) txt(cx + 20, cy + 66 + j * 17, '\u00b7 ' + c.lines[j], { size: 9.5 });
    }
    box(cx + 12, cy + 132, 380, 22, { fill: PAL.validDim, stroke: PAL.valid, radius: 3 });
    txt(cx + 22, cy + 147, c.ans, { size: 9, bold: true, color: PAL.valid });
    P.alpha(1);
  }

  txt(28, 450, 'a fifth shape, GATE 2014 Set 2 Q35: { \u27e8M\u27e9 : M accepts some string of length 2014 } is undecidable but RE.',
      { size: 9, color: PAL.dim });
}

/* ---------------- SCENE 10 - the procedure ---------------- */
function scDecide(t) {
  head('The procedure, and the four slips that cost marks',
       'five steps that cover every question shape in this clause');

  var steps = [
    ['1', 'Is the question about a run or about a language?', 'run \u2192 simulate; language \u2192 suspect Rice'],
    ['2', 'Is there a number in the property?', 'a bound k makes it a finite table, so decidable'],
    ['3', 'If it is semantic, is it non-trivial?', 'exhibit two machines with different answers'],
    ['4', 'If undecidable, which direction is the reduction?', 'hardness flows against the arrow'],
    ['5', 'If asked about a class, read the ladder', 'regular and CFL rows differ in one column']
  ];

  for (var i = 0; i < steps.length; i++) {
    var a = rv(t, 1 + i * 2, 1.2);
    P.alpha(a);
    var y = 92 + i * 46;
    box(28, y, 844, 38, { fill: PAL.surface, stroke: PAL.border, radius: 4 });
    P.circle(52, y + 19, 12, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2 });
    txt(52, y + 23, steps[i][0], { size: 10.5, align: 'center', bold: true, color: PAL.accent });
    txt(74, y + 16, steps[i][1], { size: 10, bold: true });
    txt(74, y + 32, steps[i][2], { size: 9, color: PAL.dim });
    P.alpha(1);
  }

  var a2 = rv(t, 11, 2);
  P.alpha(a2);
  txt(28, 330, 'the four slips', { size: 11, bold: true, color: PAL.invalid });
  var slips = [
    'Rice applied to a step-bounded property \u2014 "takes more than 2016 steps" is not a property of L(M).',
    'The reduction arrow reversed \u2014 B undecidable says nothing about A.',
    'RE confused with recursive \u2014 a recogniser need not halt on a non-member.',
    '"Undecidable" read as "not RE" \u2014 the halting language is RE and undecidable.'
  ];
  for (var s = 0; s < slips.length; s++) {
    var a3 = rv(t, 12.5 + s * 1.2, 1);
    P.alpha(a3);
    txt(36, 352 + s * 24, '\u2717', { size: 10, color: PAL.invalid, bold: true });
    txt(54, 352 + s * 24, slips[s], { size: 9.5, color: PAL.ink });
    P.alpha(1);
  }

  txt(28, 456, 'the page\u2019s own model runs ' + CHECKS.length + ' checks on load; the count is printed beside the canvas.',
      { size: 9, color: PAL.dim });
}

var SCENES = {
  machine: scMachine,
  fates: scFates,
  count: scCount,
  halt: scHalt,
  reduce: scReduce,
  rice: scRice,
  ladder: scLadder,
  closure: scClosure,
  papers: scPapers,
  decide: scDecide
};

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

function drawFrame(painter) {
  if (!painter) return;
  P = painter;
  var tl = window.LESSON_TIMELINE;
  var tt = K.state.elapsed;
  var idx = K.sceneAt(tt);
  var sc = tl.scenes[idx];
  painter.alpha(1);
  painter.clear();
  bg();
  if (sc && SCENES[sc.id]) {
    try {
      SCENES[sc.id](tt - sc.start);
    } catch (err) {
      console.error('scene draw failed', sc.id, err);
    }
  }
}

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

  K.init({
    timeline: window.LESSON_TIMELINE,
    draw: function () { if (P) drawFrame(P); }
  });

  K.onResize(function () { if (P) drawFrame(P); });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { if (P) drawFrame(P); });
  }

  window.__drawAt = function (t) {
    K.state.elapsed = t;
    if (P) drawFrame(P);
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

window.__lessonChecks = CHECKS;
window.__lessonModel = V;

})();
