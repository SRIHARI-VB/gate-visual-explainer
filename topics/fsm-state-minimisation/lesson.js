/* ==========================================================================
   fsm-state-minimisation — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no state arithmetic of its own. The
   model is checked three independent ways on every machine:
     (a) partition refinement, the algorithm the lesson teaches;
     (b) an exact pair search that decides equivalence of every pair of states
         by searching the product graph, which is a complete decision procedure
         and shares no code with the refinement loop;
     (c) a brute-force comparison of the reduced machine against the original
         on every input string up to length eight.
   If any two of those disagreed, the page would say so under the canvas.
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

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- machines ----------
   kind 'mealy': out[state][input] is the output printed on that transition.
   kind 'moore': out[state] is the output printed while in that state.
   next[state][input] is the next state in both cases.                     */

function machine(spec) {
  var m = {
    key: spec.key, name: spec.name, kind: spec.kind,
    states: spec.states.slice(), inputs: spec.inputs.slice(),
    next: spec.next, out: spec.out, note: spec.note || ''
  };
  m.index = {};
  m.states.forEach(function (s, i) { m.index[s] = i; });
  return m;
}

function outOf(m, s, a) {
  return m.kind === 'moore' ? m.out[s] : m.out[s][a];
}

function outVec(m, s) {
  return m.inputs.map(function (a) { return outOf(m, s, a); });
}

/* the 2025 paper machine, GATE CSE 2025 Set 1 Q59: one input X, one output f */
var M25 = machine({
  key: 'm25', kind: 'mealy', name: 'GATE CSE 2025 Set 1 Q59',
  states: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  inputs: ['0', '1'],
  next: {
    A: { '0': 'F', '1': 'B' },
    B: { '0': 'D', '1': 'C' },
    C: { '0': 'F', '1': 'E' },
    D: { '0': 'G', '1': 'A' },
    E: { '0': 'D', '1': 'C' },
    F: { '0': 'F', '1': 'B' },
    G: { '0': 'G', '1': 'H' },
    H: { '0': 'G', '1': 'A' }
  },
  out: {
    A: { '0': 0, '1': 0 },
    B: { '0': 0, '1': 0 },
    C: { '0': 0, '1': 0 },
    D: { '0': 1, '1': 0 },
    E: { '0': 0, '1': 0 },
    F: { '0': 1, '1': 1 },
    G: { '0': 0, '1': 1 },
    H: { '0': 1, '1': 0 }
  }
});

/* the 1996 paper machine, GATE CSE 1996 Q2.23: four states, B and C equivalent */
var M96 = machine({
  key: 'm96', kind: 'mealy', name: 'GATE CSE 1996 Q2.23',
  states: ['A', 'B', 'C', 'D'],
  inputs: ['0', '1'],
  next: {
    A: { '0': 'D', '1': 'B' },
    B: { '0': 'A', '1': 'C' },
    C: { '0': 'A', '1': 'B' },
    D: { '0': 'A', '1': 'C' }
  },
  out: {
    A: { '0': 0, '1': 1 },
    B: { '0': 0, '1': 1 },
    C: { '0': 0, '1': 1 },
    D: { '0': 1, '1': 1 }
  }
});

/* the twin machine: two chains converging on A3, built to need two passes */
var TWIN = machine({
  key: 'twin', kind: 'moore', name: 'the twin machine',
  states: ['A0', 'A1', 'A2', 'A3', 'B0', 'B1', 'B2'],
  inputs: ['0', '1'],
  next: {
    A0: { '0': 'A1', '1': 'A0' },
    A1: { '0': 'A2', '1': 'A0' },
    A2: { '0': 'A3', '1': 'A0' },
    A3: { '0': 'A3', '1': 'A0' },
    B0: { '0': 'B1', '1': 'A0' },
    B1: { '0': 'B2', '1': 'A0' },
    B2: { '0': 'A3', '1': 'A0' }
  },
  out: { A0: 0, A1: 0, A2: 0, A3: 1, B0: 0, B1: 0, B2: 0 }
});

/* two detectors for the same behaviour, one Moore and one Mealy */
var MOORE11 = machine({
  key: 'moore11', kind: 'moore', name: 'Moore detector for 11',
  states: ['S0', 'S1', 'S2'],
  inputs: ['0', '1'],
  next: {
    S0: { '0': 'S0', '1': 'S1' },
    S1: { '0': 'S0', '1': 'S2' },
    S2: { '0': 'S0', '1': 'S2' }
  },
  out: { S0: 0, S1: 0, S2: 1 }
});

var MEALY11 = machine({
  key: 'mealy11', kind: 'mealy', name: 'Mealy detector for 11',
  states: ['M0', 'M1'],
  inputs: ['0', '1'],
  next: {
    M0: { '0': 'M0', '1': 'M1' },
    M1: { '0': 'M0', '1': 'M1' }
  },
  out: {
    M0: { '0': 0, '1': 0 },
    M1: { '0': 0, '1': 1 }
  }
});

var MACHINES = [M25, M96, TWIN, MOORE11, MEALY11];

/* ---------- the algorithm: partition refinement (Moore's method) ---------- */

function classIndex(part, s) {
  for (var i = 0; i < part.length; i++) {
    if (part[i].indexOf(s) >= 0) return i;
  }
  return -1;
}

/* P0: group states by their output vector. Two states that print different
   outputs on some single input are separated by a string of length one, so
   they can never share a class. */
function p0(m) {
  var seen = {}, order = [], buckets = {};
  m.states.forEach(function (s) {
    var k = outVec(m, s).join('|');
    if (!buckets[k]) { buckets[k] = []; order.push(k); }
    buckets[k].push(s);
  });
  return order.map(function (k) { return buckets[k]; });
}

/* one refinement pass: inside each class, split by the vector of classes that
   the members' next states belong to. Nothing is ever re-merged. */
function refine(m, part) {
  var out = [];
  part.forEach(function (cls) {
    var sigs = {}, order = [];
    cls.forEach(function (s) {
      var sig = m.inputs.map(function (a) { return classIndex(part, m.next[s][a]); }).join('|');
      if (!sigs[sig]) { sigs[sig] = []; order.push(sig); }
      sigs[sig].push(s);
    });
    order.forEach(function (k) { out.push(sigs[k]); });
  });
  return out;
}

function minimise(m) {
  var parts = [p0(m)];
  var guard = 0;
  while (guard++ < 200) {
    var nx = refine(m, parts[parts.length - 1]);
    if (nx.length === parts[parts.length - 1].length) {
      return { parts: parts, final: parts[parts.length - 1], passes: parts.length - 1 };
    }
    parts.push(nx);
  }
  return { parts: parts, final: parts[parts.length - 1], passes: parts.length - 1 };
}

/* ---------- the exact decision procedure: search the product graph ----------
   Two states are distinguishable iff some string separates them. Build the
   set of pairs that a single input already separates, then close it: a pair is
   distinguishable if some input sends it to a distinguishable pair. This is a
   complete decision procedure, independent of the refinement loop.          */

function pairKey(a, b) { return a < b ? a + '|' + b : b + '|' + a; }

function distinguishable(m) {
  var dist = {}, changed = true;
  var st = m.states;
  for (var i = 0; i < st.length; i++) {
    for (var j = i + 1; j < st.length; j++) {
      var differs = false;
      for (var k = 0; k < m.inputs.length; k++) {
        if (outOf(m, st[i], m.inputs[k]) !== outOf(m, st[j], m.inputs[k])) differs = true;
      }
      if (differs) dist[pairKey(st[i], st[j])] = true;
    }
  }
  while (changed) {
    changed = false;
    for (var p = 0; p < st.length; p++) {
      for (var q = p + 1; q < st.length; q++) {
        var kk = pairKey(st[p], st[q]);
        if (dist[kk]) continue;
        for (var a = 0; a < m.inputs.length; a++) {
          var x = m.next[st[p]][m.inputs[a]], y = m.next[st[q]][m.inputs[a]];
          if (x === y) continue;
          if (dist[pairKey(x, y)]) { dist[kk] = true; changed = true; break; }
        }
      }
    }
  }
  return dist;
}

/* the shortest string that separates two states, by breadth-first search on
   pairs; null means the pair is equivalent. */
function witness(m, a, b) {
  if (a === b) return null;
  var seen = {}, frontier = [[a, b, '']];
  seen[pairKey(a, b)] = true;
  while (frontier.length) {
    var nxt = [];
    for (var i = 0; i < frontier.length; i++) {
      var x = frontier[i][0], y = frontier[i][1], w = frontier[i][2];
      for (var k = 0; k < m.inputs.length; k++) {
        var inp = m.inputs[k];
        if (outOf(m, x, inp) !== outOf(m, y, inp)) return w + inp;
        var nx = m.next[x][inp], ny = m.next[y][inp];
        if (nx === ny) continue;
        var kk = pairKey(nx, ny);
        if (!seen[kk]) { seen[kk] = true; nxt.push([nx, ny, w + inp]); }
      }
    }
    frontier = nxt;
  }
  return null;
}

/* every input string over the machine's alphabet, up to length L */
function stringsUpTo(m, L) {
  var all = [''], cur = [''];
  for (var n = 0; n < L; n++) {
    var more = [];
    for (var i = 0; i < cur.length; i++) {
      for (var k = 0; k < m.inputs.length; k++) more.push(cur[i] + m.inputs[k]);
    }
    all = all.concat(more);
    cur = more;
  }
  return all;
}

/* the output sequence printed when w is fed to the machine from state s */
function run(m, s, w) {
  var outs = '';
  var cur = s;
  for (var i = 0; i < w.length; i++) {
    outs += String(outOf(m, cur, w[i]));
    cur = m.next[cur][w[i]];
  }
  return outs;
}

function reachable(m, start) {
  var seen = {}, stack = [start];
  seen[start] = true;
  while (stack.length) {
    var s = stack.pop();
    m.inputs.forEach(function (a) {
      var t = m.next[s][a];
      if (!seen[t]) { seen[t] = true; stack.push(t); }
    });
  }
  return m.states.filter(function (s) { return seen[s]; });
}

/* the reduced table: one row per class, entries as class labels */
function reduced(m, final) {
  var labels = final.map(function (cls, i) { return cls[0]; });
  return final.map(function (cls, i) {
    var rep = cls[0];
    var row = { cls: cls, label: labels[i], next: {}, out: {} };
    m.inputs.forEach(function (a) {
      row.next[a] = labels[classIndex(final, m.next[rep][a])];
      row.out[a] = outOf(m, rep, a);
    });
    return row;
  });
}

/* flip-flops needed to encode n states */
function ff(n) {
  var k = 0, cap = 1;
  while (cap < n) { cap *= 2; k++; }
  return k;
}

/* ---------- computed results, one bundle per machine ---------- */

function analyse(m) {
  var res = minimise(m);
  var dist = distinguishable(m);
  var st = m.states;
  var pairs = 0, sep = 0, i, j;
  for (i = 0; i < st.length; i++) {
    for (j = i + 1; j < st.length; j++) { pairs++; if (dist[pairKey(st[i], st[j])]) sep++; }
  }

  /* brute-force agreement between the original and the reduced machine */
  var strs = stringsUpTo(m, 8);
  var evals = 0, bad = 0;
  res.final.forEach(function (cls) {
    var rep = cls[0];
    cls.forEach(function (s) {
      for (var t = 0; t < strs.length; t++) {
        evals++;
        if (run(m, s, strs[t]) !== run(m, rep, strs[t])) bad++;
      }
    });
  });

  /* every class must be output-consistent and transition-consistent */
  var wellDefined = true;
  res.final.forEach(function (cls) {
    cls.forEach(function (s) {
      if (outVec(m, s).join('|') !== outVec(m, cls[0]).join('|')) wellDefined = false;
      m.inputs.forEach(function (a) {
        if (classIndex(res.final, m.next[s][a]) !== classIndex(res.final, m.next[cls[0]][a])) {
          wellDefined = false;
        }
      });
    });
  });

  /* monotonicity: each pass refines the previous one */
  var monotone = true;
  for (i = 1; i < res.parts.length; i++) {
    for (j = 0; j < res.parts[i].length; j++) {
      var c = res.parts[i][j];
      var parent = classIndex(res.parts[i - 1], c[0]);
      for (var t = 0; t < c.length; t++) {
        if (classIndex(res.parts[i - 1], c[t]) !== parent) monotone = false;
      }
    }
  }

  /* idempotence: one more pass on the stable partition changes nothing */
  var stable = refine(m, res.final).length === res.final.length;

  /* the longest shortest distinguishing string over all distinguishable pairs */
  var longest = 0;
  for (i = 0; i < st.length; i++) {
    for (j = i + 1; j < st.length; j++) {
      var w = witness(m, st[i], st[j]);
      if (w !== null && w.length > longest) longest = w.length;
    }
  }

  var reach = reachable(m, st[0]);

  return {
    m: m, parts: res.parts, final: res.final, passes: res.passes,
    dist: dist, pairs: pairs, separated: sep, equivalentPairs: pairs - sep,
    evals: evals, mismatches: bad, wellDefined: wellDefined, monotone: monotone,
    stable: stable, longest: longest, reach: reach,
    ffBefore: ff(st.length), ffAfter: ff(res.final.length),
    transitionsBefore: st.length * m.inputs.length,
    transitionsAfter: res.final.length * m.inputs.length,
    table: reduced(m, res.final)
  };
}

var R = {};
MACHINES.forEach(function (m) { R[m.key] = analyse(m); });

/* ---------- the values the page shows ---------- */

var V = {
  m25: R.m25, m96: R.m96, twin: R.twin, moore11: R.moore11, mealy11: R.mealy11,
  /* the pair vectors P0 assigns, quoted in the animation and in the prose */
  p0Vectors: {
    A: '00', B: '00', C: '00', D: '10', E: '00', F: '11', G: '01', H: '10'
  }
};

/* ======================================================================
   LAYER 2 - THE CHECKS
   Each check is a claim the lesson makes, tested against a definition.
   ====================================================================== */

/* --- the 2025 paper machine --- */
chk('2025 machine: P0 has four classes', V.m25.parts[0].length === 4, V.m25.parts[0].length + ' classes');
chk('2025 machine: the stable partition has five classes (paper answer 5)',
    V.m25.final.length === 5, V.m25.final.length + ' classes');
chk('2025 machine: the classes are exactly {A,C} {B,E} {D,H} {F} {G}',
    V.m25.final.map(function (c) { return c.slice().sort().join(''); }).sort().join('|') === 'AC|BE|DH|F|G',
    V.m25.final.map(function (c) { return '{' + c.join(',') + '}'; }).join(' '));
chk('2025 machine: refinement needs one pass (two partitions in all)',
    V.m25.parts.length === 2 && V.m25.passes === 1, V.m25.passes + ' pass(es)');
chk('2025 machine: refinement agrees with the exact pair search',
    V.m25.equivalentPairs === 3, V.m25.equivalentPairs + ' equivalent pairs');
chk('2025 machine: 28 pairs, 25 distinguishable, 3 equivalent',
    V.m25.pairs === 28 && V.m25.separated === 25 && V.m25.equivalentPairs === 3,
    V.m25.pairs + '/' + V.m25.separated + '/' + V.m25.equivalentPairs);
chk('2025 machine: the reduced table is well defined', V.m25.wellDefined);
chk('2025 machine: 4,088 string evaluations, no mismatch',
    V.m25.evals === 4088 && V.m25.mismatches === 0, V.m25.evals + ' evaluations, ' + V.m25.mismatches + ' bad');
chk('2025 machine: 16 transitions become 10',
    V.m25.transitionsBefore === 16 && V.m25.transitionsAfter === 10,
    V.m25.transitionsBefore + ' -> ' + V.m25.transitionsAfter);
chk('2025 machine: 8 states and 5 states both need 3 flip-flops',
    V.m25.ffBefore === 3 && V.m25.ffAfter === 3, V.m25.ffBefore + ' -> ' + V.m25.ffAfter);
chk('2025 machine: all eight states are reachable from A', V.m25.reach.length === 8, V.m25.reach.length + ' of 8');
chk('2025 machine: longest shortest distinguishing string is 2, one more than the pass count',
    V.m25.longest === 2 && V.m25.longest === V.m25.passes + 1, 'longest ' + V.m25.longest);
chk('2025 machine: A and C are equivalent (no witness exists)', witness(M25, 'A', 'C') === null);
chk('2025 machine: B and E are equivalent (no witness exists)', witness(M25, 'B', 'E') === null);
chk('2025 machine: D and H are equivalent (no witness exists)', witness(M25, 'D', 'H') === null);
chk('2025 machine: 01 separates A from B', witness(M25, 'A', 'B') === '01', witness(M25, 'A', 'B'));
chk('2025 machine: 0 separates F from G', witness(M25, 'F', 'G') === '0', witness(M25, 'F', 'G'));
chk('2025 machine: the stable partition is a fixed point of the refinement step', V.m25.stable);
chk('2025 machine: every pass refines the one before it', V.m25.monotone);

/* --- the 1996 paper machine --- */
chk('1996 machine: four states reduce to three (paper answer 3)', V.m96.final.length === 3, V.m96.final.length + ' classes');
chk('1996 machine: the merged class is exactly {B,C}',
    V.m96.final.map(function (c) { return c.slice().sort().join(''); }).sort().join('|') === 'A|BC|D',
    V.m96.final.map(function (c) { return '{' + c.join(',') + '}'; }).join(' '));
chk('1996 machine: B and C have different next states, so the rows differ',
    M96.next.B['0'] !== M96.next.C['0'] || M96.next.B['1'] !== M96.next.C['1'],
    'B -> ' + M96.next.B['0'] + ',' + M96.next.B['1'] + '  C -> ' + M96.next.C['0'] + ',' + M96.next.C['1']);
chk('1996 machine: B and C are nevertheless equivalent', witness(M96, 'B', 'C') === null);
chk('1996 machine: B and C agree on all 511 strings up to length eight',
    (function () {
      var strs = stringsUpTo(M96, 8), n = 0;
      for (var i = 0; i < strs.length; i++) if (run(M96, 'B', strs[i]) === run(M96, 'C', strs[i])) n++;
      return n === 511 && strs.length === 511;
    })(), 'checked against 511 strings');
chk('1996 machine: 00 separates A from B', witness(M96, 'A', 'B') === '00', witness(M96, 'A', 'B'));
chk('1996 machine: one pass suffices', V.m96.passes === 1);
chk('1996 machine: the reduced table is well defined', V.m96.wellDefined);
chk('1996 machine: 2,044 string evaluations, no mismatch',
    V.m96.evals === 2044 && V.m96.mismatches === 0, V.m96.evals + ' evaluations');
chk('1996 machine: 4 states and 3 states both need 2 flip-flops',
    V.m96.ffBefore === 2 && V.m96.ffAfter === 2);
chk('1996 machine: refinement agrees with the exact pair search (one equivalent pair)',
    V.m96.equivalentPairs === 1 && V.m96.pairs === 6, V.m96.equivalentPairs + ' of ' + V.m96.pairs);

/* --- the twin machine --- */
chk('twin machine: seven states reduce to four', V.twin.final.length === 4, V.twin.final.length + ' classes');
chk('twin machine: P0 has 2, P1 has 3, P2 has 4 classes',
    V.twin.parts[0].length === 2 && V.twin.parts[1].length === 3 && V.twin.parts[2].length === 4,
    V.twin.parts.map(function (p) { return p.length; }).join(','));
chk('twin machine: two passes are needed, and one pass would under-count at 3',
    V.twin.passes === 2 && V.twin.parts[1].length === 3, V.twin.passes + ' passes');
chk('twin machine: the classes are {A0,B0} {A1,B1} {A2,B2} {A3}',
    V.twin.final.map(function (c) { return c.slice().sort().join(''); }).sort().join('|') === 'A0B0|A1B1|A2B2|A3',
    V.twin.final.map(function (c) { return '{' + c.join(',') + '}'; }).join(' '));
chk('twin machine: refinement agrees with the exact pair search (18 of 21 pairs separated)',
    V.twin.pairs === 21 && V.twin.separated === 18 && V.twin.equivalentPairs === 3,
    V.twin.separated + ' of ' + V.twin.pairs);
chk('twin machine: the longest shortest distinguishing string is 3',
    V.twin.longest === 3, 'longest ' + V.twin.longest);
chk('twin machine: the pass count equals the longest string minus one on every machine',
    V.twin.longest === V.twin.passes + 1 && V.m25.longest === V.m25.passes + 1 &&
    V.m96.longest === V.m96.passes + 1);
chk('twin machine: 7 states need 3 flip-flops and 4 states need 2, so one is saved',
    V.twin.ffBefore === 3 && V.twin.ffAfter === 2, V.twin.ffBefore + ' -> ' + V.twin.ffAfter);
chk('twin machine: only four of seven states are reachable from A0',
    V.twin.reach.length === 4, V.twin.reach.join(''));
chk('twin machine: the reduced table is well defined', V.twin.wellDefined);
chk('twin machine: 3,577 string evaluations, no mismatch',
    V.twin.evals === 3577 && V.twin.mismatches === 0, V.twin.evals + ' evaluations');

/* --- Moore against Mealy --- */
chk('Moore detector for 11: three states, and the machine is already minimal',
    V.moore11.final.length === 3 && V.moore11.passes === 1 && V.moore11.parts[0].length === 2,
    V.moore11.final.length + ' states after ' + V.moore11.passes + ' pass(es)');
chk('Mealy detector for 11: two states, and the machine is already minimal',
    V.mealy11.final.length === 2 && V.mealy11.passes === 0, V.mealy11.final.length + ' states');
chk('the same behaviour therefore has different minima as Moore and as Mealy',
    V.moore11.final.length === 3 && V.mealy11.final.length === 2);
chk('Moore P0 is built from the single output bit, so it has at most two classes',
    V.moore11.parts[0].length <= 2, V.moore11.parts[0].length + ' classes');
chk('every Moore machine here reduces at least as far as its refinement says, with no mismatch',
    V.moore11.mismatches === 0 && V.twin.mismatches === 0);

/* --- the arithmetic the lesson quotes --- */
chk('ceil(log2) gives 3 flip-flops for 8 states', ff(8) === 3);
chk('ceil(log2) gives 3 flip-flops for 5 states, so 8 -> 5 saves none', ff(5) === 3);
chk('ceil(log2) gives 2 flip-flops for 4 states, so 7 -> 4 saves one', ff(4) === 2 && ff(7) === 3);
chk('ceil(log2) gives 4 flip-flops for 9 states, so 9 -> 8 would save one', ff(9) === 4 && ff(8) === 3);
chk('the pass count is bounded by n - 1 on every machine',
    MACHINES.every(function (m) { return R[m.key].passes <= m.states.length - 1; }),
    MACHINES.map(function (m) { return m.states.length + ':' + R[m.key].passes; }).join(' '));
chk('no machine reduces to more states than it started with',
    MACHINES.every(function (m) { return R[m.key].final.length <= m.states.length; }));
chk('every machine states at least as many classes as P0 forced',
    MACHINES.every(function (m) { return R[m.key].final.length >= R[m.key].parts[0].length; }));
chk('511 strings exist up to length eight over a two-letter alphabet',
    stringsUpTo(M25, 8).length === 511, stringsUpTo(M25, 8).length + ' strings');
chk('the reduced table of the 2025 machine has five rows and two entries per row',
    V.m25.table.length === 5 && V.m25.table[0].next['0'] !== undefined);

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function beat(t, sc, i) {
  return K.clamp01((t - (sc.start + i * 7.5)) / 0.7);
}

function T(x, y, s, o) { P.text(x, y, s, o || {}); }

function box(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, {
    fill: o.fill === undefined ? SURF2 : o.fill,
    stroke: o.stroke === undefined ? BORDER : o.stroke,
    sw: o.sw || 1.2, radius: o.radius === undefined ? 6 : o.radius,
    dash: o.dash
  });
}

function arrow(x1, y1, x2, y2, colour, dash) {
  P.arrow(x1, y1, x2, y2, { stroke: colour || BORDER, sw: 1.4, head: 8, dash: dash });
}

function heading(s) { T(40, 18, s, { size: 13, bold: true }); }

function circle(x, y, r, label, o) {
  o = o || {};
  P.circle(x, y, r, { fill: o.fill === undefined ? SURF : o.fill, stroke: o.stroke || BORDER, sw: 1.6 });
  T(x, y + 1, label, { size: o.size || 13, bold: true, align: 'center', base: 'middle', color: o.color || INK });
}

/* one table cell: a filled rounded box with text inside */
function cell(x, y, w, h, txt, o) {
  o = o || {};
  box(x, y, w, h, {
    fill: o.fill === undefined ? SURF : o.fill,
    stroke: o.stroke === undefined ? BORDER : o.stroke,
    radius: 4, sw: 1
  });
  T(x + w / 2, y + h / 2 + 1, txt, {
    size: o.size || 11, mono: o.mono !== false, bold: o.bold,
    align: 'center', base: 'middle', color: o.color || INK
  });
}

function chip(x, y, w, h, txt, o) {
  o = o || {};
  box(x, y, w, h, {
    fill: o.fill === undefined ? ACCDIM : o.fill,
    stroke: o.stroke === undefined ? ACC : o.stroke,
    radius: 5, sw: 1.1
  });
  T(x + w / 2, y + h / 2 + 1, txt, {
    size: o.size || 11, mono: true, bold: true, align: 'center', base: 'middle',
    color: o.color || INK
  });
}

function note(x, y, s, colour, size) {
  T(x, y, s, { size: size || 11, color: colour || DIM });
}

/* ============================ scene 1 ============================ */

function drawWhy(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);
  heading('Two states that behave the same are one state');

  /* the little machine: P and Q both promise the same thing */
  P.alpha(b0);
  circle(110, 96, 25, 'P');
  circle(110, 236, 25, 'Q');
  circle(330, 166, 25, 'R');
  arrow(136, 106, 303, 156, DIM);
  arrow(136, 226, 303, 176, DIM);
  T(196, 102, '0/0, 1/1', { size: 10, mono: true, color: DIM, align: 'center' });
  T(196, 226, '0/0, 1/1', { size: 10, mono: true, color: DIM, align: 'center' });
  P.alpha(1);

  /* the two rows, written out */
  P.alpha(b0 * 0.6 + b1 * 0.4);
  T(420, 74, 'P:  0 -> R, output 0', { size: 11, mono: true });
  T(420, 96, '    1 -> R, output 1', { size: 11, mono: true });
  T(420, 132, 'Q:  0 -> R, output 0', { size: 11, mono: true });
  T(420, 154, '    1 -> R, output 1', { size: 11, mono: true });
  P.alpha(1);

  if (b1 > 0) {
    P.alpha(b1);
    box(58, 58, 104, 214, { fill: null, stroke: WARN, dash: [5, 4], sw: 1.4, radius: 8 });
    T(58, 42, 'same promise', { size: 10, bold: true, color: WARN });
    note(420, 196, 'identical rows: the easy merge', VAL);
    P.alpha(1);
  }

  /* the string table */
  P.alpha(b2);
  var xs = [58, 178, 318, 458], ws = [120, 140, 140, 150], y0 = 300, rh = 26;
  var hd = ['input string w', 'out(P, w)', 'out(Q, w)', 'same?'];
  for (var i = 0; i < 4; i++) cell(xs[i], y0, ws[i], rh, hd[i], { fill: SURF2, bold: true, size: 10 });
  var rows = [['(empty)', 'nothing', 'nothing', 'yes'],
              ['0', '0', '0', 'yes'],
              ['1', '1', '1', 'yes'],
              ['01', '01', '01', 'yes'],
              ['10', '10', '10', 'yes']];
  for (var r = 0; r < rows.length; r++) {
    for (var c = 0; c < 4; c++) {
      cell(xs[c], y0 + (r + 1) * rh, ws[c], rh, rows[r][c],
        { fill: SURF, size: 10, color: c === 3 ? VAL : INK });
    }
  }
  P.alpha(1);

  if (b3 > 0) {
    P.alpha(b3);
    box(630, 300, 240, 104, { fill: ACCDIM, stroke: ACC, radius: 6 });
    T(648, 314, 'so the question is:', { size: 11, bold: true, color: ACC });
    T(648, 336, 'which states make the', { size: 11 });
    T(648, 356, 'same promise?', { size: 11 });
    T(648, 382, 'the answer is a partition', { size: 11, bold: true });
    P.alpha(1);
  }
}

/* ============================ scene 2 ============================ */

function drawDefinition(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);
  heading('Equivalence, stated for every input string');

  P.alpha(b0);
  box(40, 40, 830, 68, { fill: ACCDIM, stroke: ACC, radius: 6 });
  T(56, 52, 'p is equivalent to q  exactly when  out(p, w) = out(q, w)  for EVERY input string w.', { size: 12, mono: true, bold: true });
  T(56, 78, 'out(p, w) is the sequence of outputs printed when w is fed in, starting from state p.', { size: 11, color: DIM });
  T(56, 94, 'One string that separates a pair is a distinguishing string, and one witness proves they differ.', { size: 11, color: DIM });
  P.alpha(1);

  /* the 1996 rows */
  P.alpha(b1);
  T(40, 132, 'GATE CSE 1996 Q2.23: the rows of B and of C', { size: 12, bold: true });
  cell(40, 148, 74, 24, 'state', { fill: SURF2, bold: true, size: 10 });
  cell(118, 148, 108, 24, 'next on 0', { fill: SURF2, bold: true, size: 10 });
  cell(230, 148, 108, 24, 'next on 1', { fill: SURF2, bold: true, size: 10 });
  cell(40, 174, 74, 24, 'B', { fill: SURF });
  cell(118, 174, 108, 24, 'A', { fill: SURF });
  cell(230, 174, 108, 24, 'C', { fill: SURF });
  cell(40, 200, 74, 24, 'C', { fill: SURF });
  cell(118, 200, 108, 24, 'A', { fill: SURF });
  cell(230, 200, 108, 24, 'B', { fill: SURF });
  T(40, 234, 'the next states differ, so a row comparison says "different"', { size: 10, color: WARN });
  T(40, 250, 'every output is the same for every string, so the definition says "same"', { size: 10, color: VAL });
  P.alpha(1);

  /* the string table */
  P.alpha(b2);
  var xs = [470, 566, 686, 806], ws = [96, 120, 120, 64], y0 = 132, rh = 26;
  var hd = ['w', 'out(B, w)', 'out(C, w)', 'same?'];
  for (var i = 0; i < 4; i++) cell(xs[i], y0, ws[i], rh, hd[i], { fill: SURF2, bold: true, size: 10 });
  var rows = [['0', '0', '0', 'yes'], ['1', '1', '1', 'yes'], ['00', '00', '00', 'yes'],
              ['01', '01', '01', 'yes'], ['10', '10', '10', 'yes'], ['11', '11', '11', 'yes']];
  for (var r = 0; r < rows.length; r++) {
    for (var c = 0; c < 4; c++) {
      cell(xs[c], y0 + (r + 1) * rh, ws[c], rh, rows[r][c],
        { fill: SURF, size: 10, color: c === 3 ? VAL : INK });
    }
  }
  T(470, 314, 'all 511 strings up to length 8 agree', { size: 10, color: VAL });
  P.alpha(1);

  P.alpha(b3);
  box(40, 290, 400, 62, { fill: BADDIM, stroke: BAD, radius: 6 });
  T(56, 302, 'A against B: they agree on 0, but', { size: 11 });
  T(56, 322, 'on the string 00 their outputs differ.', { size: 11 });
  T(56, 340, '00 is a distinguishing string for the pair.', { size: 11, bold: true, color: BAD });
  P.alpha(1);

  if (b3 > 0.5) {
    P.alpha((b3 - 0.5) * 2);
    T(470, 350, 'the definition quantifies over every string;', { size: 11, color: DIM });
    T(470, 368, 'a finite test is evidence, the pair search is proof', { size: 11, color: DIM });
    P.alpha(1);
  }
}

/* ============================ scene 3 ============================ */

function drawP0(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);
  heading('P0: bucket the states by their outputs');

  /* the eight states with their output vectors */
  P.alpha(b0);
  T(40, 44, 'the 2025 machine, GATE CSE 2025 Set 1 Q59: eight states, input X, output f', { size: 11, color: DIM });
  var st = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  for (var i = 0; i < 8; i++) {
    var x = 40 + i * 104;
    chip(x, 60, 88, 26, st[i], { size: 12 });
    T(x + 44, 96, V.p0Vectors[st[i]], { size: 10, mono: true, color: DIM, align: 'center' });
  }
  P.alpha(1);

  /* the four output buckets */
  var groups = [
    { head: 'outputs (0,0)', members: 'A  B  C  E', b: b1 },
    { head: 'outputs (1,0)', members: 'D  H', b: b2 },
    { head: 'outputs (0,1)', members: 'G', b: b2 },
    { head: 'outputs (1,1)', members: 'F', b: b3 }
  ];
  var gx = [40, 256, 472, 688];
  for (var g = 0; g < groups.length; g++) {
    P.alpha(groups[g].b);
    box(gx[g], 126, 172, 96, {
      fill: g === 0 ? ACCDIM : SURF2,
      stroke: g === 0 ? ACC : BORDER, radius: 6
    });
    T(gx[g] + 12, 136, groups[g].head, { size: 10, mono: true, color: DIM });
    T(gx[g] + 86, 174, groups[g].members, { size: 15, mono: true, bold: true, align: 'center' });
    T(gx[g] + 86, 204, (groups[g].members.replace(/\s+/g, '').length) + ' state(s)',
      { size: 10, color: FAINT, align: 'center' });
    P.alpha(1);
  }

  if (b2 > 0.4) {
    P.alpha(1);
    T(40, 240, 'P0 has four classes, so eight states are at most four states before any refinement', { size: 11, bold: true });
  }

  if (b3 > 0.4) {
    P.alpha(b3);
    box(40, 262, 820, 92, { fill: SURF, stroke: BORDER, radius: 6 });
    T(56, 274, 'Why outputs come first', { size: 11, bold: true });
    T(56, 296, 'Two states that print different outputs on the SAME input are separated by a string of length one.', { size: 11 });
    T(56, 316, 'So the finest partition that can possibly be correct groups states by their output vector.', { size: 11 });
    T(56, 336, 'Its classes are the 1-equivalent states: no single input tells two members apart.', { size: 11, color: ACC, bold: true });
    P.alpha(1);
    T(40, 380, 'The class {A,B,C,E} can still split. The next scene decides whether it does.', { size: 11, color: WARN });
    T(40, 402, 'Answering 4 here is the most common slip on this paper item.', { size: 11, color: WARN });
  }
}

/* ============================ scene 4 ============================ */

function drawRefine(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);
  heading('The refinement step: replace each next state by its class');

  P.alpha(b0);
  box(40, 40, 380, 46, { fill: ACCDIM, stroke: ACC, radius: 6 });
  T(56, 52, 'take the class { A, B, C, E } of P0', { size: 12, mono: true, bold: true });
  T(56, 70, 'P0 = {A,B,C,E} {G} {D,H} {F}, so the classes are numbered 0 to 3', { size: 10, color: DIM });
  P.alpha(1);

  /* the signature table */
  P.alpha(b1);
  var xs = [40, 118, 250, 382], ws = [78, 132, 132, 108], y0 = 100, rh = 26;
  var hd = ['state', 'next on 0', 'next on 1', 'class vector'];
  for (var i = 0; i < 4; i++) cell(xs[i], y0, ws[i], rh, hd[i], { fill: SURF2, bold: true, size: 10 });
  var rows = [['A', 'F', 'B', '(3, 0)'], ['C', 'F', 'E', '(3, 0)'],
              ['B', 'D', 'C', '(2, 0)'], ['E', 'D', 'C', '(2, 0)']];
  for (var r = 0; r < rows.length; r++) {
    for (var c = 0; c < 4; c++) {
      cell(xs[c], y0 + (r + 1) * rh, ws[c], rh, rows[r][c],
        { fill: SURF, size: 11, color: c === 3 ? ACC : INK, bold: c === 3 });
    }
  }
  T(40, 236, 'F is class 3, B and E are class 0, D is class 2', { size: 10, color: DIM });
  P.alpha(1);

  /* the two new classes */
  if (b2 > 0) {
    P.alpha(b2);
    arrow(498, 168, 516, 132, ACC);
    arrow(498, 190, 516, 226, WARN);
    box(520, 96, 340, 68, { fill: ACCDIM, stroke: ACC, radius: 6 });
    T(536, 108, 'class vector (3,0)', { size: 10, mono: true, color: DIM });
    T(536, 134, '{ A, C }', { size: 17, mono: true, bold: true });
    box(520, 192, 340, 68, { fill: WARNDIM, stroke: WARN, radius: 6 });
    T(536, 204, 'class vector (2,0)', { size: 10, mono: true, color: DIM });
    T(536, 230, '{ B, E }', { size: 17, mono: true, bold: true });
    P.alpha(1);
  }

  if (b3 > 0) {
    P.alpha(b3);
    box(40, 262, 820, 70, { fill: SURF, stroke: BORDER, radius: 6 });
    T(56, 274, 'The rule', { size: 11, bold: true });
    T(56, 296, 'Two states stay in one class only if, for EVERY input, their next states lie in the same class.', { size: 11 });
    T(56, 316, 'If any input sends them to different classes, they separate. This is the only test in the algorithm.', { size: 11, color: DIM });
    P.alpha(1);
    T(40, 350, 'The other classes do not split: D and H both go to G and A, and single states cannot split.', { size: 11 });
    T(40, 372, 'The second pass changes nothing, so the partition is stable: FIVE classes, and the paper answer is 5.', { size: 11, bold: true, color: VAL });
    T(40, 396, 'A and C are equivalent, B and E are equivalent, D and H are equivalent. No other pair is.', { size: 11 });
  }
}

/* ============================ scene 5 ============================ */

function drawIterate(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);
  heading('Iterate until nothing splits: the twin machine');

  P.alpha(b0);
  T(40, 38, 'two chains, A0 to A3 and B0 through B2 to A3; input 1 returns every state to A0', { size: 11, color: DIM });
  /* the chain picture */
  var cy = 74;
  circle(70, cy, 18, 'A0', { size: 10 });
  circle(150, cy, 18, 'A1', { size: 10 });
  circle(230, cy, 18, 'A2', { size: 10 });
  circle(310, cy, 18, 'A3', { size: 10, fill: ACCDIM, stroke: ACC });
  arrow(88, cy, 132, cy, DIM);
  arrow(168, cy, 212, cy, DIM);
  arrow(248, cy, 292, cy, DIM);
  T(310, cy + 24, 'the only 1', { size: 9, color: ACC, align: 'center' });

  circle(400, cy, 18, 'B0', { size: 10 });
  circle(480, cy, 18, 'B1', { size: 10 });
  circle(560, cy, 18, 'B2', { size: 10 });
  arrow(418, cy, 462, cy, DIM);
  arrow(498, cy, 542, cy, DIM);
  arrow(578, cy, 330, cy + 8, WARN);
  T(660, cy - 6, 'the two chains converge', { size: 10, color: WARN });
  T(660, cy + 10, 'on the same state', { size: 10, color: WARN });
  P.alpha(1);

  /* three partition bands */
  var bands = [
    { label: 'P0', y: 120, parts: V.twin.parts[0], b: b0 },
    { label: 'P1', y: 192, parts: V.twin.parts[1], b: b1 },
    { label: 'P2', y: 264, parts: V.twin.parts[2], b: b2 }
  ];
  for (var i = 0; i < bands.length; i++) {
    var bd = bands[i];
    P.alpha(bd.b);
    T(40, bd.y + 18, bd.label, { size: 12, mono: true, bold: true, color: ACC });
    var n = bd.parts.length;
    var avail = 720;
    var bw = Math.min(230, (avail - (n - 1) * 14) / n);
    for (var j = 0; j < n; j++) {
      var x = 76 + j * (bw + 14);
      box(x, bd.y, bw, 40, { fill: SURF2, stroke: BORDER, radius: 5 });
      T(x + bw / 2, bd.y + 20, '{' + bd.parts[j].join(', ') + '}',
        { size: 10, mono: true, align: 'center', base: 'middle' });
    }
    T(872, bd.y + 22, n + ' class' + (n === 1 ? '' : 'es'),
      { size: 10, color: FAINT, align: 'right' });
    P.alpha(1);
  }

  if (b2 > 0.3) {
    P.alpha(1);
    T(40, 316, 'One pass gives 3 classes. The answer is 4, and the missing class is the pair the second pass finds.',
      { size: 11, bold: true, color: WARN });
  }

  if (b3 > 0) {
    P.alpha(b3);
    box(40, 336, 820, 76, { fill: SURF, stroke: BORDER, radius: 6 });
    T(56, 348, 'Why the pass count is what it is', { size: 11, bold: true });
    T(56, 370, 'Each pass lengthens, by one, the strings the partition can distinguish.', { size: 11 });
    T(56, 390, 'So passes = (longest shortest distinguishing string) - 1. Here that longest string has length 3, so 2 passes.', { size: 11 });
    P.alpha(1);
    T(40, 432, 'And every pass only splits, so an early stop is always too coarse: it merges states that are not equivalent.', { size: 11, color: DIM });
  }
}

/* ============================ scene 6 ============================ */

function drawReduced(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);
  heading('The minimal machine, and the proof it behaves the same');

  var tab = V.m25.table;
  var xs = [40, 150, 320, 490, 640, 760], ws = [110, 170, 170, 150, 120, 100];
  var y0 = 44, rh = 26;

  P.alpha(b0);
  var hd = ['class', 'next on 0', 'next on 1', 'output on 0', 'output on 1', 'members'];
  for (var i = 0; i < 6; i++) cell(xs[i], y0, ws[i], rh, hd[i], { fill: SURF2, bold: true, size: 10 });
  P.alpha(1);

  P.alpha(b1);
  for (var r = 0; r < tab.length; r++) {
    var row = tab[r];
    var y = y0 + (r + 1) * rh;
    cell(xs[0], y, ws[0], rh, 'q' + r, { fill: ACCDIM, stroke: ACC, size: 11, bold: true });
    cell(xs[1], y, ws[1], rh, row.next['0'] + '  (was ' + M25.next[row.cls[0]]['0'] + ')', { fill: SURF, size: 10 });
    cell(xs[2], y, ws[2], rh, row.next['1'] + '  (was ' + M25.next[row.cls[0]]['1'] + ')', { fill: SURF, size: 10 });
    cell(xs[3], y, ws[3], rh, String(row.out['0']), { fill: SURF, size: 10 });
    cell(xs[4], y, ws[4], rh, String(row.out['1']), { fill: SURF, size: 10 });
    cell(xs[5], y, ws[5], rh, '{' + row.cls.join(',') + '}', { fill: SURF2, size: 10 });
  }
  P.alpha(1);

  if (b2 > 0) {
    P.alpha(b2);
    box(40, 216, 400, 96, { fill: ACCDIM, stroke: ACC, radius: 6 });
    T(56, 228, 'Well defined', { size: 11, bold: true, color: ACC });
    T(56, 250, 'every member of a class prints the same', { size: 10 });
    T(56, 268, 'output, and lands in one class, for both', { size: 10 });
    T(56, 286, 'inputs: checked, and it holds.', { size: 10 });
    P.alpha(1);
  }

  if (b2 > 0.4) {
    P.alpha(1);
    box(456, 216, 404, 96, { fill: SURF, stroke: BORDER, radius: 6 });
    T(472, 228, 'Checked against the original', { size: 11, bold: true });
    T(472, 250, V.m25.evals + ' string evaluations (8 states x 511 strings),', { size: 11, color: VAL });
    T(472, 268, V.m25.mismatches + ' mismatches in the output sequences.', { size: 11, color: VAL, bold: true });
    T(472, 288, 'Every string up to length eight, from every state.', { size: 10, color: DIM });
  }

  if (b3 > 0) {
    P.alpha(b3);
    box(40, 326, 820, 100, { fill: SURF, stroke: BORDER, radius: 6 });
    T(56, 338, 'Unique up to renaming', { size: 11, bold: true });
    T(56, 360, 'Two independent computations agree: the refinement passes, and an exact pair search over all '
      + V.m25.pairs + ' pairs.', { size: 11 });
    T(56, 380, V.m25.separated + ' pairs are separated by some string and ' + V.m25.equivalentPairs
      + ' are not, giving the same five classes.', { size: 11 });
    T(56, 400, 'So the minimal machine is forced: any two minimal machines for this behaviour are isomorphic.', { size: 11, color: ACC });
    P.alpha(1);
  }
}

/* ============================ scene 7 ============================ */

function drawHardware(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);
  heading('What minimisation actually saves');

  /* the staircase: flip-flops against states */
  P.alpha(b0);
  var ox = 78, oy = 340, sw = 30, sh = 46;
  T(ox, 40, 'flip-flops needed against the number of states', { size: 11, bold: true });
  for (var k = 1; k <= 4; k++) {
    T(ox - 12, oy - (k - 1) * sh - 16, String(k), { size: 10, mono: true, align: 'right', color: DIM });
  }
  var steps = [[2, 1], [3, 2], [5, 3], [9, 4]];
  for (var i = 0; i < steps.length; i++) {
    var lo = steps[i][0], hi = i + 1 < steps.length ? steps[i + 1][0] - 1 : 16;
    var x1 = ox + (lo - 1) * sw, x2 = ox + hi * sw;
    var y = oy - (steps[i][1] - 1) * sh;
    P.line(x1, y, x2, y, { stroke: ACC, sw: 2.4 });
    T((x1 + x2) / 2, y - 15, 'n = ' + lo + '..' + hi + ' -> ' + steps[i][1] + ' ff', { size: 9, color: DIM, align: 'center' });
  }
  P.line(ox, oy + 4, ox + 16 * sw, oy + 4, { stroke: BORDER, sw: 1.2 });
  for (var n = 1; n <= 16; n += 1) {
    T(ox + (n - 0.5) * sw, oy + 8, String(n), { size: 8, color: FAINT, align: 'center' });
  }
  T(ox + 8 * sw, oy + 30, 'number of states', { size: 10, color: DIM, align: 'center' });
  T(ox - 44, oy - 2 * sh - 6, 'ff', { size: 10, bold: true, color: DIM, align: 'right' });
  P.alpha(1);

  /* the two markers */
  if (b1 > 0) {
    P.alpha(b1);
    var y8 = oy - 2 * sh, y5 = oy - 2 * sh;
    circle(ox + 7.5 * sw, y8, 7, '', { fill: BAD, stroke: BAD });
    circle(ox + 4.5 * sw, y5, 7, '', { fill: BAD, stroke: BAD });
    T(ox + 7.5 * sw, y8 - 30, '8 states: 3 ff', { size: 10, bold: true, color: BAD, align: 'center' });
    T(ox + 4.5 * sw, y5 - 52, '5 states: 3 ff', { size: 10, bold: true, color: BAD, align: 'center' });
    T(ox - 38, oy + 56, '8 -> 5 stays on the same step, so no flip-flop is saved', { size: 11, bold: true, color: BAD });
    P.alpha(1);
  }

  /* the transition count */
  if (b2 > 0) {
    P.alpha(b2);
    box(560, 40, 300, 88, { fill: SURF2, stroke: BORDER, radius: 6 });
    T(576, 52, 'the table does shrink', { size: 11, bold: true });
    T(576, 78, V.m25.transitionsBefore + ' next-state entries -> ' + V.m25.transitionsAfter, { size: 12, mono: true });
    T(576, 100, 'and the same for outputs', { size: 10, color: DIM });
    T(576, 118, 'every entry is a row of logic', { size: 10, color: DIM });
    P.alpha(1);
  }

  if (b3 > 0) {
    P.alpha(b3);
    box(560, 144, 300, 100, { fill: ACCDIM, stroke: ACC, radius: 6 });
    T(576, 156, 'the twin machine: the other case', { size: 11, bold: true, color: ACC });
    T(576, 180, '7 states: 3 ff', { size: 11, mono: true });
    T(576, 200, '4 states: 2 ff', { size: 11, mono: true });
    T(576, 224, 'crosses a power of two, so one is saved', { size: 10, color: DIM });
    P.alpha(1);
  }

  if (b3 > 0.4) {
    P.alpha(1);
    T(560, 268, 'The ceiling decides, not the number of states removed.', { size: 11, bold: true });
    T(560, 290, 'A reduction always shrinks the next-state logic.', { size: 10, color: DIM });
    T(560, 308, 'It saves a register only when it crosses 2, 4, 8 or 16.', { size: 10, color: DIM });
  }
}

/* ============================ scene 8 ============================ */

function drawMoore(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);
  heading('Moore against Mealy, and the machines this does not cover');

  /* Moore detector: output on the state, one return bus for input 0 */
  P.alpha(b0);
  T(40, 40, 'Moore: the output sits on the state', { size: 11, bold: true, color: ACC });
  circle(90, 110, 24, 'S0', { size: 11 });
  circle(250, 110, 24, 'S1', { size: 11 });
  circle(410, 110, 24, 'S2', { size: 11, fill: ACCDIM, stroke: ACC });
  T(90, 78, 'out 0', { size: 9, color: DIM, align: 'center' });
  T(250, 78, 'out 0', { size: 9, color: DIM, align: 'center' });
  T(410, 78, 'out 1', { size: 9, color: ACC, align: 'center' });
  arrow(114, 110, 226, 110, DIM);
  arrow(274, 110, 386, 110, DIM);
  T(170, 96, '1', { size: 10, mono: true, align: 'center' });
  T(330, 96, '1', { size: 10, mono: true, align: 'center' });
  /* input 0: every state returns to S0, so one bus carries all three */
  P.line(250, 134, 250, 196, { stroke: DIM, sw: 1.4 });
  P.line(410, 134, 410, 196, { stroke: DIM, sw: 1.4 });
  P.line(410, 196, 90, 196, { stroke: DIM, sw: 1.4 });
  arrow(90, 196, 90, 136, DIM);
  T(340, 186, '0: every state returns to S0', { size: 9, mono: true, color: DIM });
  T(40, 216, '3 states, already minimal', { size: 11, bold: true });
  P.alpha(1);

  /* Mealy detector: output on the transition, so two states suffice */
  P.alpha(b1);
  T(560, 40, 'Mealy: the output sits on the transition', { size: 11, bold: true, color: WARN });
  circle(620, 110, 24, 'M0', { size: 11 });
  circle(770, 110, 24, 'M1', { size: 11, fill: WARNDIM, stroke: WARN });
  arrow(644, 102, 746, 102, DIM);
  T(695, 88, '1/0', { size: 10, mono: true, align: 'center' });
  P.circle(770, 74, 12, { stroke: WARN, sw: 1.4 });
  P.circle(770, 74, 2.4, { fill: WARN, stroke: WARN });
  T(792, 64, '1/1', { size: 10, mono: true, color: WARN });
  P.circle(620, 74, 12, { stroke: DIM, sw: 1.4 });
  P.circle(620, 74, 2.4, { fill: DIM, stroke: DIM });
  T(596, 64, '0/0', { size: 10, mono: true, color: DIM });
  P.line(770, 134, 770, 180, { stroke: DIM, sw: 1.4 });
  P.line(770, 180, 620, 180, { stroke: DIM, sw: 1.4 });
  arrow(620, 180, 620, 136, DIM);
  T(700, 172, '0/0', { size: 10, mono: true, color: DIM });
  T(560, 216, '2 states, already minimal', { size: 11, bold: true });
  P.alpha(1);

  if (b2 > 0) {
    P.alpha(b2);
    box(40, 236, 820, 64, { fill: SURF, stroke: BORDER, radius: 6 });
    T(56, 248, 'Same behaviour, different minima', { size: 11, bold: true });
    T(56, 270, 'Detect two consecutive ones: 2 states as a Mealy machine and 3 as a Moore machine. '
      + 'Refinement splits neither, so both counts are minimal.', { size: 11 });
    T(56, 288, 'The gap is a property of where the output is allowed to sit, not of a missed merge.', { size: 10, color: DIM });
    P.alpha(1);
  }

  if (b3 > 0) {
    P.alpha(b3);
    box(40, 310, 820, 96, { fill: WARNDIM, stroke: WARN, radius: 6 });
    T(56, 322, 'One boundary: incompletely specified machines', { size: 11, bold: true, color: WARN });
    T(56, 344, 'When a next state or an output is a don\'t-care, two states are neither equivalent nor inequivalent', { size: 10 });
    T(56, 362, 'but COMPATIBLE, and compatibility is not transitive, so a partition cannot even represent the answer.', { size: 10 });
    T(56, 380, 'That case needs a maximal compatible set, which is a different and harder problem. Every paper item', { size: 10 });
    T(56, 396, 'in this family that could be verified here is completely specified, so this algorithm is enough.', { size: 10 });
    P.alpha(1);
  }

  if (b3 > 0.5) {
    P.alpha(1);
    T(40, 428, 'Moore P0 is built from the single output bit, so it has at most two classes; everything after is identical.', { size: 11, color: DIM });
  }
}

/* ============================ scene 9 ============================ */

function drawGate(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);
  heading('The three question shapes');

  var cards = [
    {
      b: b0, x: 40, title: 'Shape 1: minimum number of states',
      lines: ['a table is given, a NAT is asked',
              'run the passes until nothing splits',
              'count the classes',
              'GATE CSE 2025 Set 1 Q59: 8 -> 5'],
      check: 'the answer is at most the number of rows'
    },
    {
      b: b1, x: 320, title: 'Shape 2: which states are equivalent',
      lines: ['an MCQ, or a count of equivalent pairs',
              'read the classes off the stable partition',
              'here: {A,C} {B,E} {D,H}',
              '3 of the 28 pairs, no more'],
      check: 'only the STABLE partition answers this'
    },
    {
      b: b2, x: 600, title: 'Shape 3: design, then minimise',
      lines: ['a description, then a state count',
              'design first, expect one state too many',
              'then run the same passes',
              'GATE CSE 1996 Q2.23: 4 -> 3'],
      check: 'a designed machine is rarely minimal'
    }
  ];
  for (var i = 0; i < cards.length; i++) {
    var c = cards[i];
    P.alpha(c.b);
    box(c.x, 42, 260, 150, { fill: SURF, stroke: c.b > 0.9 ? ACC : BORDER, radius: 6 });
    T(c.x + 14, 54, c.title, { size: 10, bold: true });
    for (var j = 0; j < c.lines.length; j++) {
      T(c.x + 14, 80 + j * 20, c.lines[j], { size: 10, color: j === 3 ? ACC : INK });
    }
    T(c.x + 14, 172, c.check, { size: 9, color: DIM });
    P.alpha(1);
  }

  if (b3 > 0) {
    P.alpha(b3);
    box(40, 208, 820, 94, { fill: SURF2, stroke: BORDER, radius: 6 });
    T(56, 220, 'The check that costs one line: reachability', { size: 11, bold: true });
    T(56, 242, 'A state that cannot be reached from the start contributes nothing to the behaviour.', { size: 11 });
    T(56, 262, 'On the twin machine only ' + V.twin.reach.length + ' of ' + TWIN.states.length
      + ' states are reachable, and the reduced machine has exactly those ' + V.twin.reach.length + ' classes.', { size: 11 });
    T(56, 282, 'So decide which the question wants: the states of the table, or the states of the reachable machine.', { size: 10, color: DIM });
    P.alpha(1);
  }

  if (b3 > 0.5) {
    P.alpha(1);
    T(40, 324, 'A wrong answer in any shape usually fails one of these three: it exceeds the row count,', { size: 11 });
    T(40, 344, 'it names a pair from an unstable partition, or it stops at the design.', { size: 11 });
    T(40, 374, 'Nothing here is a guarantee about GATE 2027. The two paper items are named with year and question number;', { size: 10, color: DIM });
    T(40, 392, 'everything else on this page is original practice, and is labelled as such.', { size: 10, color: DIM });
  }
}

/* ============================ scene 10 ============================ */

function drawProcedure(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);
  heading('The procedure and the traps');

  P.alpha(b0);
  var steps = [
    '1  group the states by their output vector: that is P0',
    '2  inside each class, replace every next state by its class, and split',
    '3  repeat until a whole pass changes nothing, then count the classes',
    '4  read the reduced table off the classes: one row per class'
  ];
  for (var i = 0; i < steps.length; i++) {
    box(40, 42 + i * 38, 500, 32, { fill: SURF, stroke: BORDER, radius: 5 });
    T(52, 52 + i * 38, steps[i], { size: 10, mono: true });
  }
  P.alpha(1);

  if (b1 > 0) {
    P.alpha(b1);
    box(560, 42, 300, 116, { fill: WARNDIM, stroke: WARN, radius: 6 });
    T(574, 54, 'traps 1 and 2', { size: 10, bold: true, color: WARN });
    T(574, 76, '1  comparing rows, not classes', { size: 10 });
    T(574, 94, '   1996: B and C differ, and are', { size: 9, color: DIM });
    T(574, 108, '   equal all the same', { size: 9, color: DIM });
    T(574, 130, '2  stopping after one pass', { size: 10 });
    T(574, 146, '   twin: 3 classes, answer 4', { size: 9, color: DIM });
    P.alpha(1);
  }

  if (b2 > 0) {
    P.alpha(b2);
    box(560, 170, 300, 116, { fill: WARNDIM, stroke: WARN, radius: 6 });
    T(574, 182, 'traps 3 and 4', { size: 10, bold: true, color: WARN });
    T(574, 204, '3  claiming a saved flip-flop', { size: 10 });
    T(574, 222, '   8 -> 5 saves none: both need 3', { size: 9, color: DIM });
    T(574, 248, '4  mixing Moore with Mealy', { size: 10 });
    T(574, 264, '   same behaviour: 2 states or 3', { size: 9, color: DIM });
    P.alpha(1);
  }

  if (b3 > 0) {
    P.alpha(b3);
    box(40, 206, 500, 84, { fill: SURF2, stroke: BORDER, radius: 6 });
    T(54, 218, 'trap 5: don\'t-cares', { size: 10, bold: true, color: WARN });
    T(54, 240, 'Refinement needs every entry specified. With don\'t-cares the', { size: 10 });
    T(54, 260, 'object is a maximal compatible set, not a partition.', { size: 10 });
    P.alpha(1);
    T(40, 312, 'Then one check, before you write the integer:', { size: 11, bold: true });
    T(40, 334, 'the state count is at least the number of classes P0 forces, and at most the number of rows given.', { size: 11 });
    T(40, 362, 'Both bounds are computed, not remembered: ' + V.m25.parts[0].length + ' <= answer <= '
      + M25.states.length + ' for the 2025 machine, and the answer is ' + V.m25.final.length + '.', { size: 11, color: ACC });
    T(40, 392, 'A reduction can never create states, and can never merge states that a single input already separates.', { size: 10, color: DIM });
  }
}

/* ============================ dispatch ============================ */

var SCENE_DRAW = {
  why: drawWhy,
  definition: drawDefinition,
  p0: drawP0,
  refine: drawRefine,
  iterate: drawIterate,
  reduced: drawReduced,
  hardware: drawHardware,
  moore: drawMoore,
  gate: drawGate,
  procedure: drawProcedure
};

function drawFrame(P2) {
  P = P2;
  P.alpha(1);
  P.clear();
  P.rect(0, 0, W, H, { fill: SURF });

  var t = (K && K.state) ? K.state.elapsed : 0;
  var scenes = (K && K.state && K.state.scenes) ? K.state.scenes : [];
  var i = 0;
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

window.__MODEL = { V: V, R: R, CHECKS: CHECKS };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
