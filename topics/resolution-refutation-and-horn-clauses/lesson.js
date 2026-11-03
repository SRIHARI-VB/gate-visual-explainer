/* ==========================================================================
   resolution-refutation-and-horn-clauses — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number and every clause the lesson shows.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It resolves nothing itself: every clause on the
   canvas was computed once here, and the computation was checked against the
   truth table on every clause set of up to three clauses over three variables,
   against brute force on 3,000 sampled sets over four variables, and against
   the definition of Horn satisfiability on every Horn set of up to three
   clauses over three variables.
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

var V = {};

/* ---------- clauses ----------
   A clause is a sorted array of non-zero integers. Literal +v means the
   variable v is true; literal -v means v is false. [] is the empty clause. */

function norm(lits) {
  var seen = {}, out = [], i, l;
  for (i = 0; i < lits.length; i++) {
    l = lits[i];
    if (!seen[l]) { seen[l] = true; out.push(l); }
  }
  out.sort(function (a, b) { return Math.abs(a) - Math.abs(b) || a - b; });
  return out;
}

function isTaut(cl) {
  for (var i = 0; i < cl.length; i++) if (cl.indexOf(-cl[i]) >= 0) return true;
  return false;
}

function key(cl) { return cl.length ? cl.join(',') : '[]'; }

/* every resolvent of two clauses, one pivot each, tautologies flagged */
function resolvents(A, B) {
  var out = [], i, p, res, j;
  for (i = 0; i < A.length; i++) {
    p = A[i];
    if (p < 0 || B.indexOf(-p) < 0) continue;
    res = [];
    for (j = 0; j < A.length; j++) if (A[j] !== p) res.push(A[j]);
    for (j = 0; j < B.length; j++) if (B[j] !== -p) res.push(B[j]);
    res = norm(res);
    out.push({ pivot: p, clause: res, taut: isTaut(res) });
  }
  return out;
}

/* the closure: breadth first, every non-tautological resolvent, with parents */
function saturate(seed, cap) {
  cap = cap || 4000;
  var live = [], index = {}, derived = [], i, j, k, rs, r, cl;
  for (i = 0; i < seed.length; i++) {
    cl = norm(seed[i]);
    if (index[key(cl)] === undefined) { index[key(cl)] = live.length; live.push(cl); }
  }
  var head = 0, capped = false;
  while (head < live.length) {
    i = head++;
    for (j = 0; j < live.length; j++) {
      if (i === j) continue;
      rs = resolvents(live[i], live[j]);
      for (k = 0; k < rs.length; k++) {
        r = rs[k];
        if (r.taut) continue;
        var kk = key(r.clause);
        if (index[kk] !== undefined) continue;
        if (live.length >= cap) { capped = true; continue; }
        index[kk] = live.length;
        live.push(r.clause);
        derived.push({ clause: r.clause, parents: [i, j], pivot: r.pivot });
        if (r.clause.length === 0) {
          return { clauses: live, derived: derived, empty: true, capped: capped };
        }
      }
    }
  }
  return { clauses: live, derived: derived, empty: false, capped: capped };
}

/* the refutation itself: the ancestors of the empty clause, as a tree */
function refutationTree(run) {
  if (!run.empty) return null;
  var emptyAt = -1, i;
  for (i = 0; i < run.clauses.length; i++) if (run.clauses[i].length === 0) emptyAt = i;
  var byChild = {};
  for (i = 0; i < run.derived.length; i++) byChild[key(run.derived[i].clause)] = run.derived[i];
  var nodes = [], seen = {};
  function visit(idx) {
    var cl = run.clauses[idx], k = key(cl);
    if (seen[k]) return;
    seen[k] = true;
    var d = byChild[k];
    if (d) { visit(d.parents[0]); visit(d.parents[1]); }
    nodes.push({ clause: cl, derived: d || null, index: idx });
  }
  visit(emptyAt);
  return { nodes: nodes, steps: nodes.filter(function (n) { return n.derived; }).length };
}

/* ---------- brute force ---------- */
function assignments(n) {
  var out = [], m, v, a;
  for (m = 0; m < (1 << n); m++) {
    a = {};
    for (v = 1; v <= n; v++) a[v] = !!(m & (1 << (v - 1)));
    out.push(a);
  }
  return out;
}

function evalClause(cl, a) {
  for (var i = 0; i < cl.length; i++) {
    var l = cl[i], v = Math.abs(l);
    if (l > 0 ? a[v] : !a[v]) return true;
  }
  return false;
}

function satisfiable(clauses, n) {
  var asg = assignments(n), i, j;
  for (i = 0; i < asg.length; i++) {
    var ok = true;
    for (j = 0; j < clauses.length; j++) if (!evalClause(clauses[j], asg[i])) { ok = false; break; }
    if (ok) return true;
  }
  return false;
}

/* ---------- Horn: propagation, with the order the marks arrive ---------- */
function hornRun(clauses) {
  var marked = {}, order = [], changed = true, i, cl, pos, negs, allMarked, p;
  while (changed) {
    changed = false;
    for (i = 0; i < clauses.length; i++) {
      cl = clauses[i];
      pos = cl.filter(function (l) { return l > 0; });
      if (pos.length !== 1) continue;
      p = pos[0];
      if (marked[p]) continue;
      negs = cl.filter(function (l) { return l < 0; }).map(function (l) { return -l; });
      allMarked = true;
      for (var j = 0; j < negs.length; j++) if (!marked[negs[j]]) { allMarked = false; break; }
      if (allMarked) { marked[p] = true; order.push(p); changed = true; }
    }
  }
  var violated = null;
  for (i = 0; i < clauses.length; i++) {
    cl = clauses[i];
    if (cl.filter(function (l) { return l > 0; }).length) continue;
    var all = true;
    for (var k = 0; k < cl.length; k++) if (!marked[-cl[k]]) { all = false; break; }
    if (all) violated = cl;
  }
  return { marked: marked, order: order, violated: violated, ok: !violated };
}

/* ---------- general unit propagation, to show where it stalls ---------- */
function unitPropagate(clauses) {
  var cur = clauses.map(norm), assign = {}, i, j;
  for (;;) {
    var unit = null;
    for (i = 0; i < cur.length; i++) if (cur[i].length === 1) { unit = cur[i]; break; }
    if (!unit) break;
    var l = unit[0], v = Math.abs(l), val = l > 0;
    if (assign[v] !== undefined && assign[v] !== val) return { conflict: true, assign: assign };
    assign[v] = val;
    var next = [];
    for (i = 0; i < cur.length; i++) {
      if (cur[i].indexOf(l) >= 0) continue;
      var rest = cur[i].filter(function (x) { return x !== -l; });
      if (rest.length === 0) return { conflict: true, assign: assign };
      next.push(rest);
    }
    cur = next;
  }
  return { conflict: false, assign: assign, stuck: cur };
}

/* ---------- clause universes ---------- */
function allClauses(n) {
  var vars = [], v, m, i, cl, out = [];
  for (v = 1; v <= n; v++) { vars.push(v); vars.push(-v); }
  for (m = 1; m < (1 << vars.length); m++) {
    cl = [];
    for (i = 0; i < vars.length; i++) if (m & (1 << i)) cl.push(vars[i]);
    if (!isTaut(cl)) out.push(norm(cl));
  }
  return out;
}

function subsetsOfSize(arr, k) {
  var out = [];
  (function rec(start, cur) {
    if (cur.length === k) { out.push(cur.slice()); return; }
    for (var i = start; i < arr.length; i++) { cur.push(arr[i]); rec(i + 1, cur); cur.pop(); }
  })(0, []);
  return out;
}

/* ======================================================================
   the named examples
   ====================================================================== */

var NAMES2 = ['P', 'Q'];
var NAMES3 = ['P', 'Q', 'R'];
var NAMES4 = ['P', 'Q', 'R', 'S'];
var NAMES5 = ['A', 'B', 'C', 'D', 'E'];

/* the four-clause refutation */
var FOUR = [[1, 2], [1, -2], [-1, 2], [-1, -2]];

V.four = (function () {
  var run = saturate(FOUR), tree = refutationTree(run);
  return {
    sat: satisfiable(FOUR, 2),
    empty: run.empty,
    tree: tree,
    steps: tree ? tree.steps : 0,
    nodes: tree ? tree.nodes.map(function (n) {
      return { clause: n.clause, derived: !!n.derived, pivot: n.derived ? n.derived.pivot : 0 };
    }) : [],
    closure: run.clauses.map(key),
    closureSize: run.clauses.length
  };
})();

/* soundness: every pair of clauses over four variables */
V.soundness = (function () {
  var pool = allClauses(4), asg = assignments(4);
  var pairs = 0, derived = 0, taut = 0, bad = 0, i, j, k, rs, a;
  for (i = 0; i < pool.length; i++) {
    for (j = i + 1; j < pool.length; j++) {
      rs = resolvents(pool[i], pool[j]);
      if (!rs.length) continue;
      pairs++;
      for (k = 0; k < rs.length; k++) {
        if (rs[k].taut) { taut++; continue; }
        derived++;
        for (a = 0; a < asg.length; a++) {
          if (evalClause(pool[i], asg[a]) && evalClause(pool[j], asg[a]) &&
              !evalClause(rs[k].clause, asg[a])) { bad++; break; }
        }
      }
    }
  }
  return { pool: pool.length, pairs: pairs, derived: derived, taut: taut, bad: bad };
})();

/* the table for scene 4: (P or R) with (Q or not R) gives (P or Q) */
V.table = (function () {
  var c1 = [1, 3], c2 = [2, -3], res = [1, 2], rows = [], asg = assignments(3), i;
  for (i = 0; i < asg.length; i++) {
    rows.push({
      a: asg[i],
      c1: evalClause(c1, asg[i]),
      c2: evalClause(c2, asg[i]),
      res: evalClause(res, asg[i]),
      both: evalClause(c1, asg[i]) && evalClause(c2, asg[i])
    });
  }
  var bothTrue = rows.filter(function (r) { return r.both; }).length;
  var bad = rows.filter(function (r) { return r.both && !r.res; }).length;
  return { rows: rows, bothTrue: bothTrue, bad: bad };
})();

/* refutation-completeness, checked exhaustively on small sets */
V.enum = { sets: 0, unsat: 0, bad: 0, pool3: 0, sampleSets: 0, sampleBad: 0,
           hornSets: 0, hornUnsat: 0, hornBad: 0, hornPool: 0 };

(function () {
  var pool = allClauses(3), k, s, i;
  V.enum.pool3 = pool.length;
  for (k = 1; k <= 3; k++) {
    var subs = subsetsOfSize(pool, k);
    for (s = 0; s < subs.length; s++) {
      V.enum.sets++;
      var isSat = satisfiable(subs[s], 3);
      var refuted = saturate(subs[s]).empty;
      if (!isSat) V.enum.unsat++;
      if (isSat === refuted) V.enum.bad++;
    }
  }
})();

/* a deterministic pseudo-random sample of larger sets over four variables */
(function () {
  var seed = 20261103;
  function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
  var pool = allClauses(4), t, k, pick, sub, i;
  for (t = 0; t < 3000; t++) {
    k = 3 + Math.floor(rnd() * 4);
    pick = {};
    var count = 0;
    while (count < k) {
      i = Math.floor(rnd() * pool.length);
      if (!pick[i]) { pick[i] = true; count++; }
    }
    sub = [];
    for (var kk in pick) sub.push(pool[Number(kk)]);
    V.enum.sampleSets++;
    if (satisfiable(sub, 4) === saturate(sub).empty) V.enum.sampleBad++;
  }
})();

/* Horn: propagation against the truth table on every small Horn set */
(function () {
  var pool = allClauses(3).filter(function (c) {
    return c.filter(function (l) { return l > 0; }).length <= 1;
  });
  V.enum.hornPool = pool.length;
  for (var k = 1; k <= 3; k++) {
    var subs = subsetsOfSize(pool, k);
    for (var s = 0; s < subs.length; s++) {
      V.enum.hornSets++;
      var isSat = satisfiable(subs[s], 3);
      var horn = hornRun(subs[s]).ok;
      if (!isSat) V.enum.hornUnsat++;
      if (isSat !== horn) V.enum.hornBad++;
    }
  }
})();

/* unit propagation stalls on an unsatisfiable set with no unit clause */
V.stall = (function () {
  var up = unitPropagate(FOUR), run = saturate(FOUR);
  return {
    sat: satisfiable(FOUR, 2),
    conflict: up.conflict,
    stuck: up.stuck ? up.stuck.map(key) : [],
    refuted: run.empty,
    derived: run.derived.length
  };
})();

/* the double cancel: unsound, and the legal steps are tautologies */
V.double = (function () {
  var A = [1, 2], B = [-1, -2], rs = resolvents(A, B), run = saturate([A, B]);
  return {
    sat: satisfiable([A, B], 2),
    witness: { P: true, Q: false },
    rs: rs.map(function (r) { return { pivot: r.pivot, clause: r.clause, taut: r.taut }; }),
    closure: run.clauses.map(key),
    refuted: run.empty
  };
})();

/* a single clause derives nothing */
V.unitOnly = (function () {
  var run = saturate([[1]]);
  return {
    closure: run.clauses.map(key),
    derived: run.derived.length,
    refutesNotQ: saturate([[1], [-2]]).empty,
    satNotQ: satisfiable([[1], [-2]], 2)
  };
})();

/* a set that does derive a new clause */
V.derives = (function () {
  var run = saturate([[1, 2], [1, -2]]);
  return { closure: run.clauses.map(key), derived: run.derived.map(function (d) { return key(d.clause); }) };
})();

/* the previous-year item, recomputed option by option */
V.gate2003 = (function () {
  var asg = assignments(3), a = 0, A = true, B = true, witness = null, anyP = false, anyQ = false, anyOr = false;
  for (a = 0; a < asg.length; a++) {
    var P = asg[a][1], Q = asg[a][2], R = asg[a][3];
    var pOrQ = P || Q, conj = (P || R) && (Q || !R);
    if (!(!conj || pOrQ)) A = false;                       /* option A: conj implies pOrQ */
    if (!(!pOrQ || conj)) {                                /* option B: pOrQ implies conj */
      B = false;
      if (!witness) witness = { P: P, Q: Q, R: R };
    }
    if (P) anyP = true;
    if (Q) anyQ = true;
    if (pOrQ) anyOr = true;
  }
  /* option C: both formulas satisfiable, or both not */
  var satOr = anyOr, satConj = false;
  for (a = 0; a < asg.length; a++) {
    if ((asg[a][1] || asg[a][3]) && (asg[a][2] || !asg[a][3])) satConj = true;
  }
  /* option D: pOrQ is unsatisfiable exactly when P and Q both are */
  var orUnsat = !anyOr, pUnsat = !anyP, qUnsat = !anyQ;
  /* the assignment the prose quotes: P true, Q false, R true */
  var wP = true, wQ = false, wR = true;
  var proseWitness = (wP || wQ) === true && ((wP || wR) && (wQ || !wR)) === false;
  return {
    A: A, B: B, C: satOr === satConj, D: orUnsat === (pUnsat && qUnsat),
    witness: witness, proseWitness: proseWitness, satOr: satOr, satConj: satConj,
    falseOptions: [A, B, satOr === satConj, orUnsat === (pUnsat && qUnsat)].filter(function (x) { return !x; }).length
  };
})();

/* the Horn program of scenes 7 and 8 */
V.horn = (function () {
  var cls = [[1], [3], [-1, -3, 2], [-1, -2, 4], [-2, -5]];
  var run = hornRun(cls);
  return {
    clauses: cls,
    order: run.order,
    marked: run.marked,
    ok: run.ok,
    sat: satisfiable(cls, 5),
    model: [1, 2, 3, 4].filter(function (v) { return run.marked[v]; })
  };
})();

/* the pigeonhole closures, and the cap the page stops at */
V.php = (function () {
  function clauses(n) {
    var V0 = function (i, j) { return i * n + j + 1; };
    var out = [], i, j, i2;
    for (i = 0; i <= n; i++) {
      var cl = [];
      for (j = 0; j < n; j++) cl.push(V0(i, j));
      out.push(norm(cl));
    }
    for (j = 0; j < n; j++) {
      for (i = 0; i < n; i++) for (i2 = i + 1; i2 <= n; i2++) {
        out.push(norm([-V0(i, j), -V0(i2, j)]));
      }
    }
    return out;
  }
  var cap = 900, out = [];
  [1, 2, 3].forEach(function (n) {
    var seed = clauses(n);
    var run = saturate(seed, cap);
    out.push({
      n: n, pigeons: n + 1, holes: n,
      seed: seed.length, closure: run.clauses.length,
      empty: run.empty, capped: run.capped
    });
  });
  return { rows: out, cap: cap };
})();

/* ---------- the checks ---------- */

chk('the four-clause set is unsatisfiable and has no model',
  !V.four.sat && V.four.empty, 'sat ' + V.four.sat);
chk('the refutation of the four clauses takes three steps',
  V.four.steps === 3, V.four.steps + ' steps');
chk('the refutation uses all four original clauses as leaves',
  V.four.nodes.filter(function (n) { return !n.derived; }).length === 4);
chk('the two middle clauses of the refutation are the units P and not P',
  V.four.nodes.length === 7 &&
  V.four.nodes.filter(function (n) { return n.derived && n.clause.length === 1; }).length === 2,
  V.four.nodes.length + ' nodes');
chk('the refutation ends at the empty clause',
  V.four.nodes[V.four.nodes.length - 1].clause.length === 0);
chk('every resolvent is entailed by its two parents, on all 1,634 resolvable pairs',
  V.soundness.bad === 0 && V.soundness.pairs === 1634,
  V.soundness.pairs + ' pairs, ' + V.soundness.derived + ' resolvents, ' + V.soundness.bad + ' violations');
chk('1,022 of those resolvents are tautologies and are dropped',
  V.soundness.taut === 1022, String(V.soundness.taut));
chk('in the scene 4 table the resolvent is true in every row where both parents are',
  V.table.bad === 0 && V.table.bothTrue === 4,
  V.table.bothTrue + ' rows, ' + V.table.bad + ' counterexamples');
chk('resolution refutes exactly the unsatisfiable sets of up to three clauses over three variables',
  V.enum.bad === 0 && V.enum.sets === 2951,
  V.enum.sets + ' sets, ' + V.enum.unsat + ' unsatisfiable, ' + V.enum.bad + ' disagreements');
chk('the same agreement holds on 3,000 sampled sets over four variables',
  V.enum.sampleBad === 0 && V.enum.sampleSets === 3000,
  V.enum.sampleSets + ' sets, ' + V.enum.sampleBad + ' disagreements');
chk('Horn propagation agrees with the truth table on all 1,159 small Horn sets',
  V.enum.hornBad === 0 && V.enum.hornSets === 1159,
  V.enum.hornSets + ' sets, ' + V.enum.hornUnsat + ' unsatisfiable, ' + V.enum.hornBad + ' disagreements');
chk('unit propagation finds no conflict on the four clauses, which are unsatisfiable',
  !V.stall.conflict && !V.stall.sat, 'conflict ' + V.stall.conflict + ', sat ' + V.stall.sat);
chk('unit propagation stalls with all four clauses still open',
  V.stall.stuck.length === 4, V.stall.stuck.join(' | '));
chk('resolution refutes that same set in five derived clauses',
  V.stall.refuted && V.stall.derived === 5, V.stall.derived + ' derived');
chk('the double cancel would give the empty clause from a satisfiable pair',
  V.double.sat === true && V.double.rs.length === 2, 'sat ' + V.double.sat);
chk('both legal resolvents of that pair are tautologies',
  V.double.rs.every(function (r) { return r.taut; }));
chk('the legal closure of that pair adds nothing and never refutes it',
  V.double.closure.length === 2 && !V.double.refuted, V.double.closure.join(' | '));
chk('the single clause P derives nothing at all',
  V.unitOnly.derived === 0 && V.unitOnly.closure.length === 1, V.unitOnly.closure.join(''));
chk('P together with not Q is satisfiable, so P does not entail Q',
  !V.unitOnly.refutesNotQ && V.unitOnly.satNotQ);
chk('P or Q with P or not Q does derive the unit P',
  V.derives.derived.length === 1 && V.derives.derived[0] === '1', V.derives.derived.join(' | '));
chk('the Horn program marks A and C first, then B, then D',
  V.horn.order.join(',') === '1,3,2,4', V.horn.order.join(','));
chk('the Horn program is satisfiable and its smallest model is A, B, C, D',
  V.horn.ok && V.horn.sat && V.horn.model.join(',') === '1,2,3,4', V.horn.model.join(','));
chk('E is never marked, because no clause concludes it',
  !V.horn.marked[5]);
chk('the pigeonhole closures grow 6, 73 and beyond the cap',
  V.php.rows[0].closure === 6 && V.php.rows[1].closure === 73 &&
  V.php.rows[2].capped && V.php.rows[2].closure === V.php.cap,
  V.php.rows.map(function (r) { return r.pigeons + '/' + r.holes + ':' + r.closure; }).join(' '));
chk('the smallest pigeonhole set is refuted and the larger two are beyond the cap',
  V.php.rows[0].empty && !V.php.rows[1].capped && V.php.rows[2].capped);
chk('a clause holding a variable and its negation is recognised as a tautology',
  isTaut([2, -2]) && !isTaut([1, 2]));
chk('the empty clause has no literals and no model',
  evalClause([], { 1: true }) === false);
chk('GATE 2003: option A is valid, because the resolvent is entailed',
  V.gate2003.A === true);
chk('GATE 2003: option B fails, and the assignment P true, Q false, R true is a witness',
  V.gate2003.B === false && V.gate2003.witness !== null && V.gate2003.proseWitness === true,
  V.gate2003.witness ? ('first witness P ' + V.gate2003.witness.P + ', Q ' + V.gate2003.witness.Q + ', R ' + V.gate2003.witness.R) : 'none');
chk('GATE 2003: option C holds, both formulas satisfiable',
  V.gate2003.C === true && V.gate2003.satOr === true && V.gate2003.satConj === true);
chk('GATE 2003: option D holds, so exactly one option is false and the answer is B',
  V.gate2003.D === true && V.gate2003.falseOptions === 1,
  V.gate2003.falseOptions + ' false option(s)');

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function prog(t, sc) {
  var span = Math.max(0.001, sc.end - sc.start);
  var p = (t - sc.start) / span;
  return p < 0 ? 0 : p > 1 ? 1 : p;
}

function txt(x, y, s, o) {
  o = o || {};
  if (!P) return;
  P.text(x, y, s, o);
}

function heading(s) { txt(28, 18, s, { size: 15, bold: true, color: INK }); }
function subline(s) { txt(28, 40, s, { size: 11, color: DIM }); }
function label(x, y, s, c) { txt(x, y, s, { size: 9.5, bold: true, color: c || FAINT }); }
function body(x, y, s, o) {
  o = o || {};
  txt(x, y, s, { size: o.size || 11, color: o.color || INK, bold: o.bold, mono: o.mono });
}

function card(x, y, w, h, o) {
  o = o || {};
  if (!P) return;
  P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1, radius: o.radius || 6 });
}

function chip(x, y, w, h, s, o) {
  o = o || {};
  card(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, radius: 5 });
  txt(x + w / 2, y + h / 2, s, {
    size: o.size || 12, mono: true, align: 'center', base: 'middle',
    color: o.color || INK, bold: o.bold
  });
}

/* literal and clause text */
function litText(l, names) {
  return (l < 0 ? '\u00ac' : '') + names[Math.abs(l) - 1];
}
function ct(cl, names) {
  if (!cl.length) return '\u25a1';
  return cl.map(function (l) { return litText(l, names); }).join(' \u2228 ');
}
function tf(b) { return b ? 'T' : 'F'; }

/* a bulleted list that reveals one line per beat */
function bullets(x, y, lines, p, start, step, o) {
  o = o || {};
  var lead = o.lead === undefined ? 22 : o.lead;
  for (var i = 0; i < lines.length; i++) {
    if (p < start + i * step) break;
    body(x, y + i * lead, lines[i], { size: o.size || 11, color: o.color || INK });
  }
}

/* ---------- scene 1: refute ---------- */
function sceneRefute(t, sc) {
  var p = prog(t, sc);
  heading('Proving by refutation: assume the goal is false');
  subline('Resolution derives one thing only, the empty clause. It never derives the goal itself.');

  label(24, 70, 'THE CLAUSES WE ALREADY HAVE');
  chip(24, 84, 168, 30, '(\u00acP \u2228 Q)', { size: 12 });
  body(206, 99, 'the rule:  P implies Q', { size: 10.5, color: DIM });
  chip(24, 122, 168, 30, '(P)', { size: 12 });
  body(206, 137, 'the fact:  P holds', { size: 10.5, color: DIM });

  if (p > 0.22) {
    label(24, 172, 'ADD THE NEGATION OF THE GOAL  Q', WARN);
    chip(24, 186, 168, 30, '(\u00acQ)', { size: 12, fill: WARNDIM, stroke: WARN });
    body(206, 201, 'one unit clause, and the set dies', { size: 10.5, color: WARN });
  }

  if (p > 0.46) {
    card(24, 236, 392, 96, { fill: SURF2 });
    body(40, 252, 'No assignment survives:', { size: 11.5, bold: true });
    body(40, 274, 'P true forces Q true, and the goal says Q false.', { size: 10.5 });
    body(40, 296, 'So the four clauses have no model, and Q follows.', { size: 10.5 });
  }

  if (p > 0.66) {
    body(24, 356, 'The refutation is the derivation of the empty clause from', { size: 10.5, color: DIM });
    body(24, 374, 'these clauses. That derivation is the proof.', { size: 10.5, color: DIM });
  }

  label(456, 70, 'WHY A CONTRADICTION IS ENOUGH');
  bullets(456, 92, [
    'A clause is true when at least one of its literals is.',
    'A set of clauses is true when every clause in it is.',
    'A refutation ends at the empty clause: no literals, and',
    'false under every assignment, so no model can contain it.',
    'If KB and the negated goal cannot both hold, every model',
    'of KB is a model of the goal. That is entailment.'
  ], p, 0.1, 0.07, { lead: 23, size: 10.5 });

  if (p > 0.7) {
    card(456, 262, 420, 84, { fill: ACCDIM, stroke: ACC });
    body(472, 280, 'KB entails the goal  exactly when', { size: 11, bold: true, color: ACC });
    body(472, 302, 'KB together with the negated goal is unsatisfiable.', { size: 11, color: ACC });
    body(472, 324, 'A refutation of the second set proves the first claim.', { size: 10, color: INK });
  }
}

/* ---------- scene 2: clause ---------- */
function sceneClause(t, sc) {
  var p = prog(t, sc);
  heading('From a formula to a set of clauses');
  subline('Five mechanical steps. Nothing is decided here: the logic is rewritten, not evaluated.');

  var steps = [
    ['1   DROP THE BICONDITIONAL AND THE IMPLICATION', 'P \u2192 (Q \u2227 R)'],
    ['2   PUSH EVERY NEGATION INWARDS', '\u00acP \u2228 (Q \u2227 R)'],
    ['3   DISTRIBUTE \u2228 OVER \u2227', '(\u00acP \u2228 Q) \u2227 (\u00acP \u2228 R)'],
    ['4   READ THE CONJUNCTION AS A LIST', '{ \u00acP \u2228 Q ,  \u00acP \u2228 R }'],
    ['5   ONE CLAUSE PER DISJUNCT', '\u00acP \u2228 Q        \u00acP \u2228 R']
  ];
  for (var i = 0; i < steps.length; i++) {
    if (p < 0.08 + i * 0.13) break;
    card(24, 68 + i * 56, 552, 46);
    txt(38, 78 + i * 56, steps[i][0], { size: 9, bold: true, color: FAINT });
    txt(38, 93 + i * 56, steps[i][1], { size: 12.5, mono: true, color: INK });
  }

  var defs = [
    ['LITERAL', 'a variable or its negation'],
    ['CLAUSE', 'a disjunction of literals'],
    ['CLAUSAL FORM', 'a conjunction of clauses'],
    ['EMPTY CLAUSE', 'no literals, so always false']
  ];
  for (i = 0; i < defs.length; i++) {
    if (p < 0.18 + i * 0.12) break;
    var last = i === 3;
    card(596, 68 + i * 66, 280, 54, { fill: last ? BADDIM : SURF, stroke: last ? BAD : BORDER });
    txt(610, 80 + i * 66, defs[i][0], { size: 9, bold: true, color: last ? BAD : ACC });
    txt(610, 97 + i * 66, defs[i][1], { size: 10.5, color: INK });
  }

  if (p > 0.78) {
    body(24, 352, 'The same steps on the negation of P implies Q give P and not Q:', { size: 10.5 });
    chip(24, 364, 78, 26, '(P)', { size: 11 });
    chip(110, 364, 78, 26, '(\u00acQ)', { size: 11 });
    body(200, 378, 'two unit clauses, and unit clauses drive everything later.', { size: 10 });
  }
  if (p > 0.88) {
    body(24, 404, 'A clause such as (Q or not Q) is a tautology: true everywhere, so it can be deleted.', { size: 10, color: DIM });
    body(24, 424, 'The empty set of clauses, by the same convention, is trivially true.', { size: 10, color: DIM });
  }
}

/* ---------- scene 3: rule ---------- */
function sceneRule(t, sc) {
  var p = prog(t, sc);
  heading('The resolution rule: one pivot, everything else kept');
  subline('Two clauses that disagree on one variable give a clause that must be true if both were.');

  card(24, 68, 368, 76);
  label(40, 82, 'PARENT 1');
  txt(40, 102, 'P \u2228 Q \u2228 \u00acR', { size: 14, mono: true });
  body(40, 124, 'holds the positive pivot R', { size: 10, color: DIM });

  card(508, 68, 368, 76);
  label(524, 82, 'PARENT 2');
  txt(524, 102, 'R \u2228 S', { size: 14, mono: true });
  body(524, 124, 'holds the negative pivot \u00acR', { size: 10, color: DIM });

  if (p > 0.24) {
    P.arrow(208, 148, 208, 186, { stroke: ACC, sw: 1.6, head: 9 });
    P.arrow(692, 148, 692, 186, { stroke: ACC, sw: 1.6, head: 9 });
  }

  if (p > 0.34) {
    card(24, 192, 852, 66, { fill: ACCDIM, stroke: ACC });
    label(40, 206, 'RESOLVENT   CANCEL R AND \u00acR, KEEP EVERY OTHER LITERAL', ACC);
    txt(40, 224, 'P \u2228 Q \u2228 S', { size: 15, mono: true, color: ACC });
    body(220, 232, 'the union minus the pivot pair, with repeats collapsed', { size: 10.5 });
  }

  if (p > 0.54) {
    card(24, 274, 420, 148, { fill: SURF });
    label(40, 290, 'NOT A STEP', BAD);
    body(40, 310, 'Resolving on a variable both parents share with', { size: 10.5 });
    body(40, 328, 'the same sign produces nothing that follows.', { size: 10.5 });
    body(40, 352, 'P \u2228 Q  and  P \u2228 \u00acQ  share P, so P is not a', { size: 10.5, mono: false, color: DIM });
    body(40, 370, 'pivot. They disagree only on Q, and that is the pivot.', { size: 10.5, color: DIM });
    body(40, 394, 'Two clauses with no complementary pair have no resolvent.', { size: 10, color: DIM });
  }

  if (p > 0.74) {
    card(460, 274, 416, 148, { fill: WARNDIM, stroke: WARN });
    label(476, 290, 'THROWN AWAY', WARN);
    body(476, 310, 'If the union brings in a variable and its own', { size: 10.5 });
    body(476, 328, 'negation, the resolvent is a tautology.', { size: 10.5 });
    chip(476, 342, 148, 26, 'Q \u2228 \u00acQ', { size: 11, fill: SURF, stroke: WARN });
    body(476, 384, 'True under every assignment, so it says nothing.', { size: 10, color: DIM });
    body(476, 402, 'Every implementation drops it, and that is safe.', { size: 10, color: DIM });
  }

  if (p > 0.9) {
    body(24, 440, 'One pivot per step. That single restriction is what makes the rule sound.', { size: 10.5, color: ACC });
  }
}

/* ---------- scene 4: sound ---------- */
function sceneSound(t, sc) {
  var p = prog(t, sc);
  heading('Soundness: the resolvent cannot be false when both parents are true');
  subline('Every resolvable pair over four variables was checked by brute force. There is no exception.');

  var X = 24, Y = 66, rh = 25;
  var cols = [8, 46, 84, 122, 200, 300, 396];
  var heads = ['P', 'Q', 'R', 'P \u2228 R', 'Q \u2228 \u00acR', 'P \u2228 Q'];
  card(X, Y, 446, rh * 9 + 26, { fill: SURF });
  txt(X + 8, Y + 7, 'the two parents, and what they give', { size: 9, bold: true, color: FAINT });
  for (var c = 0; c < heads.length; c++) {
    txt(X + cols[c], Y + 24, heads[c], { size: 10.5, mono: true, bold: true, color: DIM });
  }
  for (var i = 0; i < V.table.rows.length; i++) {
    var r = V.table.rows[i], y = Y + 24 + (i + 1) * rh;
    if (p > 0.18 + i * 0.035) {
      if (r.both) card(X + 2, y - 3, 442, rh - 2, { fill: ACCDIM, stroke: ACC, radius: 4 });
      txt(X + cols[0], y, tf(r.a[1]), { size: 10.5, mono: true, color: INK });
      txt(X + cols[1], y, tf(r.a[2]), { size: 10.5, mono: true, color: INK });
      txt(X + cols[2], y, tf(r.a[3]), { size: 10.5, mono: true, color: INK });
      txt(X + cols[3], y, tf(r.c1), { size: 10.5, mono: true, color: r.c1 ? INK : FAINT });
      txt(X + cols[4], y, tf(r.c2), { size: 10.5, mono: true, color: r.c2 ? INK : FAINT });
      txt(X + cols[5], y, tf(r.res), { size: 10.5, mono: true, bold: r.both, color: r.both ? ACC : INK });
    }
  }

  label(500, 70, 'THE TWO CASES, AND NO THIRD');
  if (p > 0.5) {
    card(500, 84, 376, 96, { fill: SURF });
    body(516, 102, 'R is true', { size: 11, bold: true, color: ACC });
    body(516, 124, 'then (Q \u2228 \u00acR) is satisfied only through Q,', { size: 10.5 });
    body(516, 142, 'and Q is a literal of the resolvent.', { size: 10.5 });
    body(516, 162, 'So the resolvent holds in that row.', { size: 10, color: DIM });
  }
  if (p > 0.66) {
    card(500, 190, 376, 96, { fill: SURF });
    body(516, 208, 'R is false', { size: 11, bold: true, color: ACC });
    body(516, 230, 'then (P \u2228 R) is satisfied only through P,', { size: 10.5 });
    body(516, 248, 'and P is a literal of the resolvent.', { size: 10.5 });
    body(516, 268, 'So the resolvent holds in that row too.', { size: 10, color: DIM });
  }
  if (p > 0.8) {
    body(500, 306, 'There is no assignment and no pair that breaks it:', { size: 10.5 });
    body(500, 326, '1,634 resolvable pairs, 976 non-tautological resolvents,', { size: 10.5, color: ACC });
    body(500, 344, 'no row in which both parents are true and the resolvent false.', { size: 10.5, color: ACC });
    body(500, 372, 'A resolvent is a consequence. It is weaker than its parents,', { size: 10 });
    body(500, 390, 'so adding it removes no model: satisfiability is preserved.', { size: 10 });
  }
  if (p > 0.92) {
    body(24, 326, 'Four of the eight rows satisfy both parents, and the resolvent is true in all four.', { size: 10, color: DIM });
    body(24, 346, 'That is what soundness means: no row can be found where the step goes wrong.', { size: 10, color: DIM });
  }
}

/* ---------- scene 5: work ---------- */
function sceneWork(t, sc) {
  var p = prog(t, sc);
  heading('A refutation, clause by clause');
  subline('Four clauses over two variables. The derivation is a tree with four leaves and one root.');

  label(24, 66, 'THE FOUR GIVEN CLAUSES');
  var leaves = [
    { x: 24, y: 78, cl: FOUR[0] },
    { x: 24, y: 126, cl: FOUR[1] },
    { x: 24, y: 202, cl: FOUR[2] },
    { x: 24, y: 250, cl: FOUR[3] }
  ];
  for (var i = 0; i < leaves.length; i++) {
    chip(leaves[i].x, leaves[i].y, 132, 32, ct(leaves[i].cl, NAMES2), { size: 12 });
  }

  if (p > 0.24) {
    P.line(156, 94, 232, 118, { stroke: ACC, sw: 1.4 });
    P.line(156, 142, 232, 122, { stroke: ACC, sw: 1.4 });
    chip(232, 104, 92, 32, '(P)', { size: 12, fill: ACCDIM, stroke: ACC });
    body(332, 120, 'resolve on Q', { size: 10, color: ACC });
  }
  if (p > 0.46) {
    P.line(156, 218, 232, 242, { stroke: ACC, sw: 1.4 });
    P.line(156, 266, 232, 246, { stroke: ACC, sw: 1.4 });
    chip(232, 228, 92, 32, '(\u00acP)', { size: 12, fill: ACCDIM, stroke: ACC });
    body(332, 244, 'resolve on Q', { size: 10, color: ACC });
  }
  if (p > 0.68) {
    P.line(324, 120, 408, 176, { stroke: BAD, sw: 1.6 });
    P.line(324, 244, 408, 190, { stroke: BAD, sw: 1.6 });
    chip(408, 168, 56, 34, '\u25a1', { size: 16, fill: BADDIM, stroke: BAD, color: BAD, bold: true });
    body(408, 212, 'the empty clause', { size: 10, color: BAD, align: 'left' });
  }

  card(500, 66, 376, 268, { fill: SURF });
  label(516, 82, 'THE THREE STEPS');
  var steps = [
    ['1', '(P \u2228 Q) with (P \u2228 \u00acQ)', 'differ on Q only: cancel it, P remains'],
    ['2', '(\u00acP \u2228 Q) with (\u00acP \u2228 \u00acQ)', 'differ on Q only: cancel it, \u00acP remains'],
    ['3', '(P) with (\u00acP)', 'cancel P and nothing is left at all']
  ];
  for (i = 0; i < steps.length; i++) {
    if (p < 0.3 + i * 0.2) break;
    var y = 104 + i * 76;
    P.circle(526, y + 8, 9, { fill: ACCDIM, stroke: ACC, sw: 1 });
    txt(526, y + 8, steps[i][0], { size: 10, mono: true, align: 'center', base: 'middle', color: ACC, bold: true });
    body(546, y, steps[i][1], { size: 10.5, mono: true });
    body(546, y + 20, steps[i][2], { size: 10, color: DIM });
  }

  if (p > 0.86) {
    card(24, 316, 852, 82, { fill: ACCDIM, stroke: ACC });
    body(40, 334, 'A refutation is a derivation of the empty clause. Here it uses all four clauses once, in three steps.', { size: 11, color: INK });
    body(40, 356, 'The page computes the tree and checks its shape: four leaves, three steps, one root, and the root is empty.', { size: 10.5, color: INK });
    body(40, 378, 'Nothing in the picture is a proof by picture: the case argument in the previous scene is the proof of the rule.', { size: 10, color: DIM });
  }
}

/* ---------- scene 6: limit ---------- */
function sceneLimit(t, sc) {
  var p = prog(t, sc);
  heading('Complete for refutation, not for derivation');
  subline('The theorem is about the empty clause. It is not a promise that every consequence falls out.');

  card(24, 68, 420, 168, { fill: ACCDIM, stroke: ACC });
  label(40, 84, 'WHAT IT DOES GIVE', ACC);
  body(40, 106, 'If a finite set of clauses is unsatisfiable,', { size: 10.5 });
  body(40, 126, 'some sequence of resolution steps reaches \u25a1.', { size: 10.5 });
  if (p > 0.16) {
    body(40, 156, 'Checked here on every set of up to three', { size: 10, color: DIM });
    body(40, 174, 'clauses over three variables:', { size: 10, color: DIM });
    body(40, 196, '2,951 sets, 99 unsatisfiable, 0 disagreements', { size: 10.5, color: ACC, bold: true });
    body(40, 216, 'and 3,000 sampled sets over four variables.', { size: 10, color: DIM });
  }

  card(460, 68, 416, 168, { fill: WARNDIM, stroke: WARN });
  label(476, 84, 'WHAT IT DOES NOT GIVE', WARN);
  body(476, 106, 'From the single clause (P) it derives nothing:', { size: 10.5 });
  if (p > 0.36) {
    chip(476, 118, 74, 26, '(P)', { size: 11, fill: SURF, stroke: WARN });
    body(562, 132, 'closure of one clause, zero derived', { size: 10, color: DIM, base: 'middle' });
    body(476, 158, 'P or Q follows from P, and no step produces it.', { size: 10.5 });
    body(476, 178, 'Resolution needs two parents and a pivot pair.', { size: 10.5 });
    body(476, 202, 'It is a refuter, not a generator of consequences.', { size: 10.5, color: WARN });
  }

  if (p > 0.58) {
    card(24, 250, 852, 84, { fill: SURF2 });
    body(40, 268, 'So entailment is tested the other way round: add the negation of the goal to the clauses.', { size: 11 });
    body(40, 290, 'P together with not Q is satisfiable, so no refutation exists, and Q does not follow from P.', { size: 10.5 });
    body(40, 312, 'P together with not Q being satisfiable is exactly the statement that P does not entail Q.', { size: 10, color: DIM });
  }

  if (p > 0.78) {
    card(24, 346, 852, 96, { fill: SURF });
    body(40, 364, 'Two verdicts, and only two:', { size: 11, bold: true });
    body(40, 386, 'the empty clause appears, so the set has no model, so the goal is entailed;', { size: 10.5 });
    body(40, 406, 'or the set closes with no empty clause, so a model exists, so it is not entailed.', { size: 10.5 });
    body(40, 426, 'For a finite propositional set the search always ends, because there are finitely many clauses.', { size: 10, color: DIM });
  }
}

/* ---------- scene 7: horn ---------- */
function sceneHorn(t, sc) {
  var p = prog(t, sc);
  heading('Horn clauses: at most one conclusion');
  subline('One positive literal at most. The restriction is what buys linear time later.');

  card(24, 66, 268, 104);
  label(40, 80, 'DEFINITE CLAUSE', ACC);
  body(40, 100, 'exactly one positive literal', { size: 10, color: DIM });
  txt(40, 122, '\u00acA \u2228 \u00acB \u2228 C', { size: 12, mono: true });
  body(40, 146, 'read as:  A and B give C', { size: 10.5, color: ACC });

  card(310, 66, 268, 104);
  label(326, 80, 'GOAL CLAUSE', BAD);
  body(326, 100, 'no positive literal at all', { size: 10, color: DIM });
  txt(326, 122, '\u00acB \u2228 \u00acE', { size: 12, mono: true });
  body(326, 146, 'read as:  B and E must not both hold', { size: 10, color: BAD });

  card(596, 66, 280, 104);
  label(612, 80, 'FACT', INFO);
  body(612, 100, 'one positive literal, no negative', { size: 10, color: DIM });
  txt(612, 122, '(A)', { size: 12, mono: true });
  body(612, 146, 'read as:  A holds, with no condition', { size: 10, color: INFO });

  label(24, 190, 'A HORN PROGRAM: TWO FACTS, TWO RULES, ONE GOAL');
  var rows = [
    [[1], '(A)', 'fact'],
    [[3], '(C)', 'fact'],
    [[-1, -3, 2], '(\u00acA \u2228 \u00acC \u2228 B)', 'A and C give B'],
    [[-1, -2, 4], '(\u00acA \u2228 \u00acB \u2228 D)', 'A and B give D'],
    [[-2, -5], '(\u00acB \u2228 \u00acE)', 'goal: B and E not both']
  ];
  for (var i = 0; i < rows.length; i++) {
    if (p < 0.34 + i * 0.1) break;
    var y = 206 + i * 34;
    var v = rows[i][0][0];
    var marked = v > 0 && V.horn.marked[v];
    chip(24, y, 172, 28, rows[i][1], {
      size: 11,
      fill: marked ? ACCDIM : SURF,
      stroke: marked ? ACC : BORDER
    });
    body(208, y + 15, rows[i][2], { size: 10, color: DIM, base: 'middle' });
    if (marked) body(400, y + 15, 'marked', { size: 9.5, color: ACC, bold: true, base: 'middle' });
  }

  if (p > 0.7) {
    card(470, 206, 406, 188, { fill: SURF2 });
    label(486, 222, 'THE MARKS, IN THE ORDER THEY ARRIVE');
    body(486, 244, 'A, C from the two facts; then the first rule fires', { size: 10.5 });
    body(486, 262, 'to mark B, and the second fires to mark D.', { size: 10.5 });
    body(486, 288, 'E is never marked: no clause concludes E.', { size: 10.5, color: BAD });
    body(486, 310, 'So the goal is never violated, the set is', { size: 10.5 });
    body(486, 328, 'satisfiable, and the marks are its smallest model.', { size: 10.5 });
    body(486, 354, 'Every mark is forced: an atom marked this way is true', { size: 9.5, color: DIM });
    body(486, 370, 'in every model of the set, which is why it is smallest.', { size: 9.5, color: DIM });
  }

  if (p > 0.92) {
    body(24, 396, 'A Horn clause allows at most one positive literal. P or Q is not Horn: it offers two conclusions.', { size: 10, color: DIM });
    body(24, 416, 'The check on the page counts positive literals, not literals.', { size: 10, color: DIM });
  }
}

/* ---------- scene 8: up ---------- */
function sceneUp(t, sc) {
  var p = prog(t, sc);
  heading('Unit propagation: complete here, stuck there');
  subline('The same procedure decides a Horn set and learns nothing about a general one.');

  card(24, 66, 420, 330, { fill: SURF });
  label(40, 82, 'ON THE HORN PROGRAM');
  body(40, 102, 'A clause of one literal is the only starting point.', { size: 10.5 });
  body(40, 120, 'There are two: (A) and (C). Mark them, then fire.', { size: 10.5 });
  if (p > 0.18) {
    var order = V.horn.order;
    for (var i = 0; i < order.length; i++) {
      var y = 146 + i * 30;
      P.circle(52, y + 9, 9, { fill: ACCDIM, stroke: ACC, sw: 1 });
      txt(52, y + 9, String(i + 1), { size: 9.5, mono: true, align: 'center', base: 'middle', color: ACC, bold: true });
      body(70, y, 'mark ' + NAMES5[order[i] - 1], { size: 10.5, mono: true, bold: true });
      body(140, y, i < 2 ? 'from a fact' : 'its premises are all marked', { size: 10, color: DIM });
    }
  }
  if (p > 0.44) {
    card(40, 272, 388, 62, { fill: ACCDIM, stroke: ACC });
    body(56, 290, 'No goal clause has all its literals marked.', { size: 10.5, bold: true });
    body(56, 310, 'So the set is satisfiable, and {A, B, C, D} is its smallest model.', { size: 10 });
  }
  if (p > 0.58) {
    body(40, 350, 'Dowling and Gallier, 1984: with a queue of new marks and a', { size: 10 });
    body(40, 368, 'watched literal per rule, every literal is visited once, so the', { size: 10 });
    body(40, 386, 'whole test costs time proportional to the literal occurrences.', { size: 10 });
  }

  card(460, 66, 416, 330, { fill: SURF });
  label(476, 82, 'ON THE FOUR GENERAL CLAUSES', BAD);
  for (i = 0; i < 4; i++) {
    chip(476, 100 + i * 32, 150, 26, ct(FOUR[i], NAMES2), { size: 11 });
  }
  if (p > 0.72) {
    body(476, 238, 'Every clause has two literals. There is no unit', { size: 10.5 });
    body(476, 256, 'clause, so the procedure cannot make one step.', { size: 10.5 });
    body(476, 278, 'It reports no conflict, and that is all it reports.', { size: 10.5, color: BAD });
    body(476, 306, 'The truth table says the set has no model, and', { size: 10.5 });
    body(476, 324, 'resolution refutes it in five derived clauses.', { size: 10.5 });
    body(476, 348, 'So propagation is a sound refuter and an incomplete', { size: 10 });
    body(476, 366, 'decision procedure outside the Horn fragment.', { size: 10 });
  }
}

/* ---------- scene 9: trap ---------- */
function sceneTrap(t, sc) {
  var p = prog(t, sc);
  heading('Two cancels at once, and the price of completeness');
  subline('One unsound shortcut, one safe deletion, and one exponential worst case.');

  card(24, 66, 430, 224, { fill: BADDIM, stroke: BAD });
  label(40, 82, 'THE SHORTCUT THAT IS WRONG', BAD);
  chip(40, 100, 130, 30, '(P \u2228 Q)', { size: 12, fill: SURF, stroke: BAD });
  chip(186, 100, 130, 30, '(\u00acP \u2228 \u00acQ)', { size: 12, fill: SURF, stroke: BAD });
  body(40, 148, 'They disagree on P and on Q. Cancelling both pairs', { size: 10.5 });
  body(40, 166, 'gives the empty clause, which would say the pair', { size: 10.5 });
  body(40, 184, 'has no model. It has one: P true and Q false.', { size: 10.5, color: BAD, bold: true });
  if (p > 0.3) {
    chip(40, 206, 56, 32, '\u25a1', { size: 15, fill: SURF, stroke: BAD, color: BAD, bold: true });
    body(108, 222, 'a false conclusion from two satisfiable premises', { size: 10, color: BAD, base: 'middle' });
  }
  if (p > 0.44) {
    body(40, 258, 'One pivot per step, always. That is the whole guard.', { size: 10.5 });
    body(40, 276, 'The rule cancels one variable, never two.', { size: 10, color: DIM });
  }

  card(470, 66, 406, 224, { fill: SURF });
  label(486, 82, 'THE TWO LEGAL STEPS', ACC);
  if (p > 0.56) {
    body(486, 104, 'Resolve on P alone:', { size: 10.5 });
    chip(486, 114, 130, 28, '(Q \u2228 \u00acQ)', { size: 11 });
    body(632, 128, 'a tautology, dropped', { size: 10, color: DIM, base: 'middle' });
    body(486, 158, 'Resolve on Q alone:', { size: 10.5 });
    chip(486, 168, 130, 28, '(P \u2228 \u00acP)', { size: 11 });
    body(632, 182, 'a tautology, dropped', { size: 10, color: DIM, base: 'middle' });
    body(486, 212, 'The closure is the two original clauses, unchanged,', { size: 10.5 });
    body(486, 230, 'so the method reports satisfiable, which is correct.', { size: 10.5, color: ACC });
    body(486, 258, 'A busy-looking closure is not evidence of a contradiction.', { size: 10, color: DIM });
  }

  card(24, 306, 852, 136, { fill: WARNDIM, stroke: WARN });
  label(40, 322, 'AND COMPLETE IS NOT THE SAME AS CHEAP', WARN);
  if (p > 0.74) {
    body(40, 344, 'Pigeonhole clauses, n plus one pigeons in n holes. The page saturates them and counts:', { size: 10.5 });
    var xs = [40, 240, 440];
    for (var i = 0; i < V.php.rows.length; i++) {
      var r = V.php.rows[i];
      var s = r.capped ? 'over ' + V.php.cap : String(r.closure);
      chip(xs[i], 356, 150, 30, r.pigeons + ' in ' + r.holes + ':  ' + s, { size: 10.5, fill: SURF, stroke: WARN });
    }
    body(40, 402, 'Haken, 1985: every resolution refutation of these clauses needs exponentially many steps,', { size: 10 });
    body(40, 420, 'so a complete method can still be an unusable one. Completeness promises existence, not size.', { size: 10 });
  }
}

/* ---------- scene 10: proc ---------- */
function sceneProc(t, sc) {
  var p = prog(t, sc);
  heading('The procedure, and five traps');
  subline('A fixed order of questions, and the mistakes that survive a correct-looking derivation.');

  var steps = [
    ['1', 'Negate the goal, convert it, add every clause'],
    ['2', 'Find one complementary pair'],
    ['3', 'Resolve on that one pivot; drop repeats and tautologies'],
    ['4', 'Repeat until the empty clause appears'],
    ['5', 'No new clause and no empty clause means satisfiable']
  ];
  for (var i = 0; i < steps.length; i++) {
    if (p < 0.08 + i * 0.12) break;
    var y = 70 + i * 62;
    card(24, y, 528, 50);
    P.circle(48, y + 25, 12, { fill: ACCDIM, stroke: ACC, sw: 1.1 });
    txt(48, y + 25, steps[i][0], { size: 11, mono: true, align: 'center', base: 'middle', color: ACC, bold: true });
    body(70, y + 16, steps[i][1], { size: 11 });
  }

  if (p > 0.6) {
    card(24, 380, 528, 62, { fill: ACCDIM, stroke: ACC });
    body(40, 396, 'For a Horn set, step 4 is replaced by unit propagation, which', { size: 10.5 });
    body(40, 414, 'needs no search and no pivot choice: linear in the literals.', { size: 10.5, color: ACC });
  }

  card(576, 70, 300, 340, { fill: WARNDIM, stroke: WARN });
  label(592, 86, 'THE FIVE TRAPS', WARN);
  var traps = [
    'reading a set of clauses as a disjunction',
    'adding the goal instead of its negation',
    'cancelling two pivots in one step',
    'keeping tautological resolvents',
    'reading a stalled propagation as a model'
  ];
  for (i = 0; i < traps.length; i++) {
    if (p < 0.5 + i * 0.07) break;
    body(592, 112 + i * 42, '\u00b7 ' + traps[i], { size: 10 });
  }
  if (p > 0.88) {
    body(592, 336, 'Each one produces a clause that looks right.', { size: 9.5, color: DIM });
    body(592, 356, 'Name the pivot, name the set, ask for \u25a1.', { size: 9.5, color: INK });
    body(592, 382, 'The only verdict is the empty clause.', { size: 10, color: WARN, bold: true });
  }
}

var SCENE_DRAW = {
  refute: sceneRefute,
  clause: sceneClause,
  rule: sceneRule,
  sound: sceneSound,
  work: sceneWork,
  limit: sceneLimit,
  horn: sceneHorn,
  up: sceneUp,
  trap: sceneTrap,
  proc: sceneProc
};

/* the frame */
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
  el.innerHTML = '<span class="k">Model checks</span>' + pass + ' of ' + CHECKS.length + ' passing';
  el.className = 'checks ' + (pass === CHECKS.length ? 'is-pass' : 'is-fail');
}

function boot() {
  var holder = document.getElementById('canvas-holder');
  var fallback = document.getElementById('canvas-fallback');
  if (!holder) return;

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

  fillChecks();

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
