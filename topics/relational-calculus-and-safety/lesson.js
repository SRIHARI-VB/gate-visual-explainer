/* ==========================================================================
   relational-calculus-and-safety — lesson.js
   Four layers, in order:
     1. THE MODEL   — every number this lesson shows, computed here.
     2. THE CHECKS  — each computed value re-verified against a definition.
     3. RENDER      — reads the model; never re-derives it.
     4. BOOT        — p5.js first, the browser's own canvas as the fallback.

   The model is a finite evaluator for the two relational calculi. An
   expression is a predicate plus the attribute list of its answer; the
   evaluator enumerates every candidate tuple over an AMBIENT DOMAIN and keeps
   the ones that satisfy the predicate. That one design decision is what makes
   safety measurable rather than asserted: evaluate the same expression over
   dom(P), then over dom(P) with one fresh value added, and compare the two
   answer sets. A safe expression returns the same set; an unsafe one grows.

   Relational algebra is implemented beside it (selection, projection,
   difference, theta join) so every "this calculus expression equals that
   algebra expression" claim in the lesson is a set comparison, not a claim.
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
  var BADDIM = PAL.invalidDim || '#fbe4e2';

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- 1a. relations ---------- */

function rel(name, attrs, rows) { return { name: name, attrs: attrs, rows: rows }; }

var DB = {
  R:      rel('R', ['P', 'Q'], [[1, 2], [2, 3], [3, 4]]),
  S:      rel('S', ['X', 'Y'], [[2, 7], [3, 8], [9, 5]]),
  r:      rel('r', ['A', 'B'], [[10, 20], [10, 30], [20, 20]]),
  R1:     rel('R1', ['A'], [[1], [2], ['x']]),
  R1b:    rel('R1', ['A'], [[1], [2], [3]]),
  R2:     rel('R2', ['A'], [[2], [3], [4]]),
  EMP:    rel('EMP', ['EmpId', 'EmpName', 'DeptId'],
              [['e1', 'Asha', 'd1'], ['e2', 'Bilal', 'd2'], ['e3', 'Chen', 'd3']]),
  DEPT:   rel('DEPT', ['DeptName', 'DeptId'], [['Sales', 'd1'], ['Eng', 'd2']]),
  ENROL:  rel('ENROL', ['S', 'C'],
              [['SA', 'c1'], ['SA', 'c2'], ['SB', 'c1'], ['SC', 'c3'], ['SD', 'c1'], ['SD', 'c2']]),
  COURSE_A: rel('COURSE', ['C', 'Dept'], [['c1', 'Bio'], ['c2', 'Bio'], ['c3', 'Math']]),
  COURSE_B: rel('COURSE', ['C', 'Dept'], [['c1', 'Math'], ['c2', 'Phys']]),
  E:      rel('E', ['F', 'T'], [[1, 2], [2, 3], [3, 4], [4, 5]])
};

/* ---------- 1b. small utilities ---------- */

function has(r, vals) {
  for (var i = 0; i < r.rows.length; i++) {
    var row = r.rows[i], same = true;
    for (var j = 0; j < vals.length; j++) { if (row[j] !== vals[j]) { same = false; break; } }
    if (same) return true;
  }
  return false;
}

function uniq(a) {
  var out = [], seen = {};
  for (var i = 0; i < a.length; i++) {
    var k = String(a[i]);
    if (!seen[k]) { seen[k] = 1; out.push(a[i]); }
  }
  return out;
}

function valsOf(r) {
  var out = [];
  for (var i = 0; i < r.rows.length; i++) for (var j = 0; j < r.rows[i].length; j++) out.push(r.rows[i][j]);
  return uniq(out);
}

function domOf(rels, consts) {
  var out = [];
  for (var i = 0; i < rels.length; i++) out = out.concat(valsOf(rels[i]));
  return uniq(out.concat(consts || []));
}

function eachTuple(D, n, fn) {
  var idx = [];
  for (var i = 0; i < n; i++) idx.push(0);
  if (n === 0) { fn([]); return; }
  while (true) {
    var t = [];
    for (var k = 0; k < n; k++) t.push(D[idx[k]]);
    fn(t);
    var p = n - 1;
    while (p >= 0) { idx[p]++; if (idx[p] < D.length) break; idx[p] = 0; p--; }
    if (p < 0) return;
  }
}

function exRows(r, f) { for (var i = 0; i < r.rows.length; i++) if (f(r.rows[i])) return true; return false; }
function allRows(r, f) { for (var i = 0; i < r.rows.length; i++) if (!f(r.rows[i])) return false; return true; }
function exVals(D, f) { for (var i = 0; i < D.length; i++) if (f(D[i])) return true; return false; }
function allVals(D, f) { for (var i = 0; i < D.length; i++) if (!f(D[i])) return false; return true; }

function sortRows(rows) {
  return rows.slice().sort(function (a, b) {
    var ka = JSON.stringify(a), kb = JSON.stringify(b);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
}

/* ---------- 1c. the evaluator ---------- */

/* An expression is { attrs:[names of the answer], pred:(values, D) => bool }.
   Evaluation enumerates every tuple of the ambient domain D, so the answer is
   a function of (expression, D) — which is exactly the dependence safety
   forbids. */
function evalEx(ex, D) {
  var out = [], seen = {};
  eachTuple(D, ex.attrs.length, function (v) {
    if (!ex.pred(v, D)) return;
    var k = JSON.stringify(v);
    if (!seen[k]) { seen[k] = 1; out.push(v); }
  });
  return sortRows(out);
}

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  var A = sortRows(a), B = sortRows(b);
  for (var i = 0; i < A.length; i++) if (JSON.stringify(A[i]) !== JSON.stringify(B[i])) return false;
  return true;
}

var FRESH = 'zz';

/* ---------- 1d. relational algebra, beside the calculi ---------- */

function sel(r, f) { return r.rows.filter(f); }
function proj(rows, i) { return uniq(rows.map(function (row) { return row[i]; })); }
function intersectRows(a, b) {
  return a.filter(function (x) { return b.some(function (y) { return JSON.stringify(x) === JSON.stringify(y); }); });
}
function diffRows(a, b) {
  return a.filter(function (x) { return !b.some(function (y) { return JSON.stringify(x) === JSON.stringify(y); }); });
}
function thetaJoin(A, B, f) {
  var out = [];
  for (var i = 0; i < A.rows.length; i++) for (var j = 0; j < B.rows.length; j++) {
    if (f(A.rows[i], B.rows[j])) out.push(A.rows[i].concat(B.rows[j]));
  }
  return out;
}

/* ---------- 1e. the expressions ---------- */

/* GATE CSE 1999 Q1.19 — { t | t in r and t[A] = 10 and t[B] = 20 } */
var E1999 = {
  attrs: ['A', 'B'],
  dom: domOf([DB.r], [10, 20]),
  pred: function (t) { return has(DB.r, [t[0], t[1]]) && t[0] === 10 && t[1] === 20; }
};

/* GATE CSE 2026 Set 1 Q43 — { <u> | exists v exists w (<u,v> in R and <v,w> in S) } */
var E2026 = {
  attrs: ['u'],
  dom: domOf([DB.R, DB.S]),
  pred: function (t, D) {
    return exVals(D, function (v) {
      return exVals(D, function (w) { return has(DB.R, [t[0], v]) && has(DB.S, [v, w]); });
    });
  }
};

/* the join query written twice, once per calculus */
var EJOIN_TRC = {
  attrs: ['EmpName'],
  dom: domOf([DB.EMP, DB.DEPT]),
  pred: function (t) {
    return exRows(DB.EMP, function (u) {
      return t[0] === u[1] && exRows(DB.DEPT, function (v) { return u[2] === v[1]; });
    });
  }
};
var EJOIN_DRC = {
  attrs: ['n'],
  dom: domOf([DB.EMP, DB.DEPT]),
  pred: function (t, D) {
    return exVals(D, function (i) {
      return exVals(D, function (d) {
        return exVals(D, function (dn) { return has(DB.EMP, [i, t[0], d]) && has(DB.DEPT, [dn, d]); });
      });
    });
  }
};

/* the naked complement, and a bound filter beside it */
var EUNSAFE = {
  attrs: ['A', 'B'],
  dom: domOf([DB.r]),
  pred: function (t) { return !has(DB.r, [t[0], t[1]]); }
};

/* GATE CSE 2001 Q2.24 — four options, one instance */
function q2001(R1rel) {
  return [
    { label: 'A', text: '{t | ∃u∈R1 (t[A]=u[A]) ∧ ¬∃s∈R2 (t[A]=s[A])}',
      ex: { attrs: ['A'], dom: domOf([R1rel, DB.R2]), pred: function (t) {
        return exRows(R1rel, function (u) { return t[0] === u[0]; }) &&
               !exRows(DB.R2, function (s) { return t[0] === s[0]; });
      } } },
    { label: 'B', text: '{t | ∀u∈R1 (u[A]="x" ⇒ ∃s∈R2 (t[A]=s[A] ∧ s[A]=u[A]))}',
      ex: { attrs: ['A'], dom: domOf([R1rel, DB.R2], ['x']), pred: function (t) {
        return allRows(R1rel, function (u) {
          return u[0] !== 'x' || exRows(DB.R2, function (s) { return t[0] === s[0] && s[0] === u[0]; });
        });
      } } },
    { label: 'C', text: '{t | ¬(t ∈ R1)}',
      ex: { attrs: ['A'], dom: domOf([R1rel]), pred: function (t) { return !has(R1rel, [t[0]]); } } },
    { label: 'D', text: '{t | ∃u∈R1 (t[A]=u[A]) ∧ ∃s∈R2 (t[A]=s[A])}',
      ex: { attrs: ['A'], dom: domOf([R1rel, DB.R2]), pred: function (t) {
        return exRows(R1rel, function (u) { return t[0] === u[0]; }) &&
               exRows(DB.R2, function (s) { return t[0] === s[0]; });
      } } }
  ];
}

/* the "all Biology courses" query, naive and guarded */
function allBio(courseRel, guarded) {
  return {
    attrs: ['S'],
    dom: domOf([DB.ENROL, courseRel]),
    pred: function (t) {
      var bound = guarded ? exRows(DB.ENROL, function (e) { return e[0] === t[0]; }) : true;
      return bound && allRows(courseRel, function (c) {
        return c[1] !== 'Bio' || exRows(DB.ENROL, function (e) { return e[0] === t[0] && e[1] === c[0]; });
      });
    }
  };
}

/* the 2017 item's three expressions */
var E2017 = [
  { label: 'I', ex: { attrs: ['EmpName', 'DeptId'], dom: domOf([DB.EMP, DB.DEPT]),
      pred: function (t) {
        return exRows(DB.EMP, function (u) { return t[0] === u[1]; }) &&
               allRows(DB.DEPT, function (v) { return t[1] !== v[1]; });
      } } },
  { label: 'II', ex: { attrs: ['EmpName', 'DeptId'], dom: domOf([DB.EMP, DB.DEPT]),
      pred: function (t) {
        return exRows(DB.EMP, function (u) { return t[0] === u[1]; }) &&
               exRows(DB.DEPT, function (v) { return t[1] !== v[1]; });
      } } },
  { label: 'III', ex: { attrs: ['EmpName', 'DeptId'], dom: domOf([DB.EMP, DB.DEPT]),
      pred: function (t) {
        return exRows(DB.EMP, function (u) { return t[0] === u[1]; }) &&
               exRows(DB.DEPT, function (v) { return t[1] === v[1]; });
      } } }
];

/* a chain, and the two-hop expression that cannot finish it */
function chainRel(n) {
  var rows = [];
  for (var i = 1; i < n; i++) rows.push([i, i + 1]);
  return rel('E', ['F', 'T'], rows);
}

function distPairs(n) {
  /* every reachable ORDERED pair on a DIRECTED chain 1 -> 2 -> ... -> n, with
     its distance. The edge direction matters: (2,1) is not reachable, so the
     count is n(n-1)/2 and not n(n-1). */
  var out = [];
  for (var a = 1; a <= n; a++) for (var b = a + 1; b <= n; b++) out.push({ a: a, b: b, d: b - a });
  return out;
}

function depthTwoExpr(edges) {
  return {
    attrs: ['u', 'w'],
    dom: valsOf(edges),
    pred: function (t, D) {
      return has(edges, [t[0], t[1]]) ||
             exVals(D, function (v) { return has(edges, [t[0], v]) && has(edges, [v, t[1]]); });
    }
  };
}

/* ---------- 1f. compute everything once ---------- */

var M = {};

/* GATE 1999 */
M.e1999 = {};
M.e1999.ans = evalEx(E1999, E1999.dom);
M.e1999.selBoth = sel(DB.r, function (x) { return x[0] === 10 && x[1] === 20; });
M.e1999.selA = sel(DB.r, function (x) { return x[0] === 10; });
M.e1999.selB = sel(DB.r, function (x) { return x[1] === 20; });
M.e1999.intersect = intersectRows(M.e1999.selA, M.e1999.selB);
M.e1999.union = uniq(M.e1999.selA.concat(M.e1999.selB)).map(function (x) { return x; });
M.e1999.diff = diffRows(M.e1999.selA, M.e1999.selB);
M.e1999.disj = sel(DB.r, function (x) { return x[0] === 10 || x[1] === 20; });

/* GATE 2026 Set 1 Q43 */
M.e2026 = {};
M.e2026.ans = evalEx(E2026, E2026.dom);
var joinRQeqSX = thetaJoin(DB.R, DB.S, function (a, b) { return a[1] === b[0]; });
/* each option is a projection of a theta join, so each answer is a set of
   1-tuples: wrap the projected value back into a tuple, or the comparison
   against the calculus answer would compare [1] with 1. */
function pairs(vals) { return vals.map(function (v) { return [v]; }); }
M.e2026.optA = pairs(uniq(thetaJoin(DB.R, DB.S, function (a, b) { return a[0] === b[0]; }).map(function (x) { return x[0]; })));
M.e2026.optB = pairs(uniq(joinRQeqSX.map(function (x) { return x[0]; })));
M.e2026.optC = pairs(uniq(thetaJoin(DB.R, DB.S, function (a, b) { return a[0] === b[1]; }).map(function (x) { return x[0]; })));
M.e2026.optD = pairs(uniq(thetaJoin(DB.R, DB.S, function (a, b) { return a[1] === b[1]; }).map(function (x) { return x[0]; })));
M.e2026.joinRows = joinRQeqSX;

/* the two calculi on one query */
M.join = {};
M.join.trc = evalEx(EJOIN_TRC, EJOIN_TRC.dom);
M.join.drc = evalEx(EJOIN_DRC, EJOIN_DRC.dom);

/* safety: growth test */
function growth(ex) { return growthOver(ex, ex.dom); }

/* The growth test over an explicit ambient domain. The definition of dom(P) is
   per formula, and using it per option would make the naked complement empty by
   construction (its own domain is exactly the relation it complements). A
   reader evaluates all four options of one question over the whole question's
   domain, so that is what the 2001 table does; the per-formula verdict is
   computed too and checked to agree. */
function growthOver(ex, D0) {
  var d1 = evalEx(ex, D0);
  var d2 = evalEx(ex, D0.concat([FRESH]));
  return { d1: d1, d2: d2, n1: d1.length, n2: d2.length, grew: d2.length !== d1.length || !sameSet(d1, d2) };
}
M.safe1999 = growth(E1999);
M.unsafe = growth(EUNSAFE);

/* GATE 2001 */
var AMB2001 = domOf([DB.R1, DB.R2], ['x']);
var AMB2001b = domOf([DB.R1b, DB.R2], ['x']);
M.q2001 = q2001(DB.R1).map(function (o) {
  var g = growthOver(o.ex, AMB2001), own = growth(o.ex);
  return { label: o.label, text: o.text, n1: g.n1, n2: g.n2, grew: g.grew,
           ownGrew: own.grew, ans1: g.d1 };
});
M.q2001b = q2001(DB.R1b).map(function (o) {
  var g = growthOver(o.ex, AMB2001b);
  return { label: o.label, n1: g.n1, n2: g.n2, grew: g.grew };
});

/* duality of the quantifiers */
M.duality = (function () {
  var D1 = domOf([DB.R2]);
  var D2 = D1.concat([FRESH]);
  var dis = 0, tested = 0;
  [D1, D2].forEach(function (D) {
    eachTuple(D, 1, function (t) {
      tested++;
      var fa = allRows(DB.R2, function (s) { return t[0] !== s[0]; });
      var ne = !exRows(DB.R2, function (s) { return t[0] === s[0]; });
      if (fa !== ne) dis++;
    });
  });
  return { disagreements: dis, tested: tested, d1: D1.length };
})();

/* vacuous truth */
M.vac = {};
M.vac.naiveB = growth(allBio(DB.COURSE_B, false));
M.vac.guardB = growth(allBio(DB.COURSE_B, true));
M.vac.naiveA = evalEx(allBio(DB.COURSE_A, false), allBio(DB.COURSE_A, false).dom);
M.vac.guardA = evalEx(allBio(DB.COURSE_A, true), allBio(DB.COURSE_A, true).dom);
M.vac.domB = allBio(DB.COURSE_B, false).dom;

/* GATE 2017 Set 1 Q41 */
M.q2017 = E2017.map(function (o) {
  var g = growth(o.ex);
  return { label: o.label, n1: g.n1, n2: g.n2, grew: g.grew };
});

/* expressive power: fixed quantifier depth */
M.reach = {};
[3, 5].forEach(function (n) {
  var edges = chainRel(n);
  var got = evalEx(depthTwoExpr(edges), valsOf(edges));
  var total = distPairs(n).length;
  var within2 = distPairs(n).filter(function (p) { return p.d <= 2; }).length;
  M.reach['n' + n] = { found: got.length, total: total, within2: within2, missed: total - got.length };
});

/* the candidate bound */
M.bound = (function () {
  var worst = 0, arity = 0, d = 0;
  [[E1999, M.safe1999], [E2026, { n1: M.e2026.ans.length }], [EUNSAFE, M.unsafe]].forEach(function (pair) {
    var ex = pair[0], ans = pair[1].n1;
    if (ans > worst) { worst = ans; arity = ex.attrs.length; d = ex.dom.length; }
  });
  return { arity: arity, d: d, candidates: Math.pow(d, arity), largest: worst };
})();

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

chk('GATE 1999: the calculus answer is exactly the tuple (10,20)',
    M.e1999.ans.length === 1 && M.e1999.ans[0][0] === 10 && M.e1999.ans[0][1] === 20,
    'got ' + JSON.stringify(M.e1999.ans));

chk('GATE 1999: it equals σ(A=10 ∧ B=20)(r)',
    sameSet(M.e1999.ans, M.e1999.selBoth), M.e1999.selBoth.length + ' rows');

chk('GATE 1999: it equals σ(A=10)(r) ∩ σ(B=20)(r), which is option C',
    sameSet(M.e1999.ans, M.e1999.intersect), M.e1999.intersect.length + ' rows');

chk('GATE 1999: the disjunction, the union and the difference each differ from it',
    !sameSet(M.e1999.ans, M.e1999.disj) && !sameSet(M.e1999.ans, M.e1999.union) && !sameSet(M.e1999.ans, M.e1999.diff),
    'sizes ' + M.e1999.disj.length + ', ' + M.e1999.union.length + ', ' + M.e1999.diff.length);

chk('GATE 2026 Q43: the calculus answer is the set {1,2}',
    sameSet(M.e2026.ans, [[1], [2]]), 'got ' + JSON.stringify(M.e2026.ans));

chk('GATE 2026 Q43: it equals Π_P(S ⋈(S.X = R.Q) R), which is option B',
    sameSet(M.e2026.ans, M.e2026.optB), 'option B gives ' + JSON.stringify(M.e2026.optB));

chk('GATE 2026 Q43: exactly one of the four options matches',
    [M.e2026.optA, M.e2026.optB, M.e2026.optC, M.e2026.optD]
      .filter(function (o) { return sameSet(M.e2026.ans, o); }).length === 1,
    'A ' + JSON.stringify(M.e2026.optA) + ' C ' + JSON.stringify(M.e2026.optC) + ' D ' + JSON.stringify(M.e2026.optD));

chk('the tuple and domain forms of one join query return the same set',
    sameSet(M.join.trc, M.join.drc),
    'TRC ' + JSON.stringify(M.join.trc) + ' DRC ' + JSON.stringify(M.join.drc));

chk('safety: the bound filter keeps the same answer when a fresh value is added',
    !M.safe1999.grew && M.safe1999.n1 === 1 && M.safe1999.n2 === 1,
    M.safe1999.n1 + ' then ' + M.safe1999.n2);

chk('safety: the naked complement grows when a fresh value is added',
    M.unsafe.grew, M.unsafe.n1 + ' then ' + M.unsafe.n2);

chk('GATE 2001: exactly one of the four options is domain-dependent, and it is C',
    M.q2001.filter(function (o) { return o.grew; }).length === 1 &&
    M.q2001.filter(function (o) { return o.grew; })[0].label === 'C',
    M.q2001.map(function (o) { return o.label + ':' + o.n1 + '->' + o.n2; }).join(' '));

chk('GATE 2001: the per-formula domain gives the same verdict as the shared one',
    M.q2001.filter(function (o) { return o.grew; }).map(function (o) { return o.label; }).join('') ===
    M.q2001.filter(function (o) { return o.ownGrew; }).map(function (o) { return o.label; }).join(''),
    'shared ' + M.q2001.filter(function (o) { return o.grew; }).length +
    ', per formula ' + M.q2001.filter(function (o) { return o.ownGrew; }).length);

chk('GATE 2001: option B is safe on the paper instance but unsafe when R1 holds no "x"',
    !M.q2001[1].grew && M.q2001b[1].grew,
    'paper ' + M.q2001[1].n1 + '->' + M.q2001[1].n2 + ', variant ' + M.q2001b[1].n1 + '->' + M.q2001b[1].n2);

chk('forall and not-exists-not agree on every tuple of both domains',
    M.duality.disagreements === 0, M.duality.tested + ' tuples, ' + M.duality.disagreements + ' disagreements');

chk('vacuous: with no Biology course the naive "all Bio" query returns the whole domain',
    M.vac.naiveB.n1 === M.vac.domB.length && M.vac.naiveB.grew,
    M.vac.naiveB.n1 + ' of a domain of ' + M.vac.domB.length + ', then ' + M.vac.naiveB.n2);

chk('vacuous: one existential over ENROL bounds it to the enrolled students',
    M.vac.guardB.n1 === 4 && !M.vac.guardB.grew,
    M.vac.guardB.n1 + ' then ' + M.vac.guardB.n2);

chk('vacuous: when Biology courses exist the naive and guarded forms agree',
    sameSet(M.vac.naiveA, M.vac.guardA),
    'naive ' + M.vac.naiveA.length + ', guarded ' + M.vac.guardA.length);

chk('reachability: the two-hop expression is exact on a three-node chain',
    M.reach.n3.found === M.reach.n3.total, M.reach.n3.found + ' of ' + M.reach.n3.total);

chk('reachability: on a five-node chain it finds 7 of the 10 reachable pairs',
    M.reach.n5.found === 7 && M.reach.n5.total === 10,
    M.reach.n5.found + ' of ' + M.reach.n5.total + ', missing ' + M.reach.n5.missed);

chk('no answer exceeds the candidate bound |D|^arity',
    M.bound.largest <= M.bound.candidates,
    M.bound.largest + ' against ' + M.bound.candidates + ' (d=' + M.bound.d + ', n=' + M.bound.arity + ')');

chk('GATE 2017 Q41: all three are finite here, and this page\'s growth test moves I and II',
    M.q2017.every(function (o) { return o.n1 >= 0; }) &&
    M.q2017[0].grew && M.q2017[1].grew && !M.q2017[2].grew,
    M.q2017.map(function (o) { return o.label + ':' + o.n1 + '->' + o.n2; }).join(' '));

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function label(Pp, x, y, s, o) {
  o = o || {};
  Pp.alpha(o.alpha === undefined ? 1 : o.alpha);
  Pp.text(x, y, s, { size: o.size || 12, bold: o.bold, mono: o.mono,
                     color: o.color || INK, align: o.align, base: o.base });
  Pp.alpha(1);
}

function on(t, at) { return K.ease(K.clamp01((t - at) / 0.55)); }

function card(Pp, x, y, w, h, o) {
  o = o || {};
  Pp.alpha(o.alpha === undefined ? 1 : o.alpha);
  Pp.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, radius: 8, sw: 1 });
  Pp.alpha(1);
}

function rule(Pp, x1, y, x2, a) {
  Pp.alpha((a === undefined ? 1 : a) * 0.55);
  Pp.line(x1, y, x2, y, { stroke: BORDER, sw: 0.8 });
  Pp.alpha(1);
}

function tick(Pp, x, y, ok, a) {
  Pp.alpha(a === undefined ? 1 : a);
  if (ok) {
    Pp.line(x - 4, y, x - 1, y + 3.5, { stroke: VAL, sw: 2 });
    Pp.line(x - 1, y + 3.5, x + 5, y - 4, { stroke: VAL, sw: 2 });
  } else {
    Pp.line(x - 4, y - 4, x + 4, y + 4, { stroke: BAD, sw: 2 });
    Pp.line(x + 4, y - 4, x - 4, y + 4, { stroke: BAD, sw: 2 });
  }
  Pp.alpha(1);
}

function header(Pp, t, title, sub) {
  card(Pp, 28, 20, 844, 54, { fill: SURF2 });
  label(Pp, 44, 34, title, { size: 13.5, bold: true, alpha: on(t, 0) });
  if (sub) label(Pp, 44, 54, sub, { size: 10.5, color: DIM, alpha: on(t, 1) });
}

function chip(Pp, x, y, text, colour, a) {
  var w = String(text).length * 6.4 + 16;
  Pp.alpha(a === undefined ? 1 : a);
  Pp.rect(x, y, w, 19, { fill: SURF, stroke: colour, radius: 9, sw: 1.2 });
  Pp.alpha(a === undefined ? 1 : a);
  Pp.text(x + w / 2, y + 5, String(text), { size: 9.5, bold: true, color: colour, align: 'center' });
  Pp.alpha(1);
  return w;
}

/* a relation drawn as a table; returns its height */
function tableGeom(r) {
  var cw = r.attrs.map(function (a, i) {
    var w = a.length;
    for (var k = 0; k < r.rows.length; k++) w = Math.max(w, String(r.rows[k][i]).length);
    return Math.max(38, Math.min(86, w * 7.2 + 16));
  });
  return { cw: cw, w: cw.reduce(function (a, b) { return a + b; }, 0) };
}

function drawTable(Pp, x, y, r, o) {
  o = o || {};
  var g = tableGeom(r);
  var a = o.alpha === undefined ? 1 : o.alpha;
  var rowH = 19, headH = 20;
  var hl = o.hl || [];
  Pp.alpha(a);
  Pp.rect(x, y, g.w, headH + r.rows.length * rowH, { fill: SURF, stroke: BORDER, radius: 5, sw: 1 });
  Pp.rect(x, y, g.w, headH, { fill: SURF2, stroke: BORDER, radius: 5, sw: 1 });
  var cx = x;
  for (var i = 0; i < r.attrs.length; i++) {
    Pp.text(cx + g.cw[i] / 2, y + 5, r.attrs[i], { size: 9.5, bold: true, mono: true, align: 'center', color: DIM });
    cx += g.cw[i];
  }
  for (var k = 0; k < r.rows.length; k++) {
    var ry = y + headH + k * rowH;
    var hot = hl.indexOf(k) >= 0;
    if (hot) Pp.rect(x + 1, ry, g.w - 2, rowH, { fill: ACCDIM, stroke: null, radius: 3, sw: 0 });
    var vx = x;
    for (var j = 0; j < r.attrs.length; j++) {
      Pp.text(vx + g.cw[j] / 2, ry + 4, String(r.rows[k][j]),
              { size: 10, mono: true, align: 'center', color: hot ? ACC : INK, bold: hot });
      vx += g.cw[j];
    }
    if (k < r.rows.length - 1) Pp.line(x, ry + rowH, x + g.w, ry + rowH, { stroke: BORDER, sw: 0.6 });
  }
  Pp.alpha(1);
  return headH + r.rows.length * rowH;
}

function setText(rows) {
  if (!rows.length) return '∅';
  return '{ ' + rows.map(function (r) { return '(' + r.map(String).join(', ') + ')'; }).join(', ') + ' }';
}
function setText1(rows) {
  if (!rows.length) return '∅';
  return '{ ' + rows.map(function (r) { return String(r[0]); }).join(', ') + ' }';
}

/* ======================================================================
   SCENE 1 - two ways to ask one question
   ====================================================================== */
function sceneWhat(t) {
  header(P, t, 'Two ways to ask one question', 'relational algebra gives a procedure; relational calculus gives a condition');

  card(P, 40, 84, 400, 128);
  label(P, 56, 96, 'Relational algebra — how', { size: 11, bold: true, color: INFO, alpha: on(t, 0.4) });
  label(P, 56, 118, 'σ (A = 10) (r)', { size: 11, mono: true, alpha: on(t, 0.8) });
  label(P, 56, 138, '∩  σ (B = 20) (r)', { size: 11, mono: true, alpha: on(t, 1.4) });
  label(P, 56, 164, 'three steps: keep rows, keep rows, intersect', { size: 9, color: DIM, alpha: on(t, 2.2) });
  label(P, 56, 184, 'the order of the steps is part of the answer', { size: 9, color: DIM, alpha: on(t, 2.8) });

  card(P, 460, 84, 400, 128);
  label(P, 476, 96, 'Relational calculus — what', { size: 11, bold: true, color: ACC, alpha: on(t, 3.6) });
  label(P, 476, 118, '{ t | t ∈ r ∧ t[A] = 10', { size: 11, mono: true, alpha: on(t, 4.0) });
  label(P, 476, 138, '      ∧ t[B] = 20 }', { size: 11, mono: true, alpha: on(t, 4.4) });
  label(P, 476, 164, 'one condition: which tuples qualify', { size: 9, color: DIM, alpha: on(t, 5.0) });
  label(P, 476, 184, 'no step order is stated, and none is needed', { size: 9, color: DIM, alpha: on(t, 5.6) });

  card(P, 40, 226, 820, 214);
  label(P, 56, 238, 'The smallest instance: GATE CSE 1999 Q1.19', { size: 11, bold: true, alpha: on(t, 7.0) });
  drawTable(P, 56, 258, DB.r, { alpha: on(t, 7.4) });
  label(P, 56, 258 + 20 + 3 * 19 + 8, 'r, three tuples', { size: 9, color: FAINT, alpha: on(t, 7.6) });

  label(P, 260, 264, 'calculus answer', { size: 9.5, color: DIM, alpha: on(t, 9.0) });
  label(P, 260, 282, setText(M.e1999.ans), { size: 11.5, mono: true, bold: true, color: ACC, alpha: on(t, 9.0) });
  label(P, 260, 312, 'σ(A=10 ∧ B=20)(r)', { size: 9.5, color: DIM, alpha: on(t, 10.4) });
  label(P, 260, 330, setText(M.e1999.selBoth), { size: 11.5, mono: true, bold: true, color: INFO, alpha: on(t, 10.4) });
  tick(P, 258, 352, sameSet(M.e1999.ans, M.e1999.selBoth), on(t, 11.6));
  label(P, 272, 346, 'same relation, computed both ways', { size: 9.5, color: DIM, alpha: on(t, 11.6) });

  label(P, 560, 264, 'and σ(A=10)(r) ∩ σ(B=20)(r)', { size: 9.5, color: DIM, alpha: on(t, 13.4) });
  label(P, 560, 282, setText(M.e1999.intersect), { size: 11.5, mono: true, bold: true, color: INFO, alpha: on(t, 13.4) });
  tick(P, 558, 304, sameSet(M.e1999.ans, M.e1999.intersect), on(t, 14.2));
  label(P, 572, 298, 'this is option C of the paper', { size: 9.5, color: DIM, alpha: on(t, 14.2) });

  label(P, 560, 336, 'the disjunction σ(A=10 ∨ B=20)(r) gives', { size: 9.5, color: DIM, alpha: on(t, 15.6) });
  label(P, 560, 354, setText(M.e1999.disj) + '  — ' + M.e1999.disj.length + ' rows, not ' + M.e1999.ans.length,
        { size: 10, mono: true, color: BAD, alpha: on(t, 15.6) });

  card(P, 40, 398, 820, 42, { fill: WARNDIM, stroke: WARN, alpha: on(t, 17.0) });
  label(P, 56, 410, 'Conjunction is intersection, not union. The two words are swapped under time pressure, and that is the trap in this item.',
        { size: 10, color: DIM, alpha: on(t, 17.2) });
}

/* ======================================================================
   SCENE 2 - the three atoms, free against bound
   ====================================================================== */
function sceneAtoms(t) {
  header(P, t, 'The three atoms, and free against bound', 'a formula is built from membership and comparison, and from nothing else');

  card(P, 40, 84, 410, 170);
  label(P, 56, 96, 'The only three atoms', { size: 11, bold: true, alpha: on(t, 0.4) });
  label(P, 56, 122, 't ∈ r', { size: 11.5, mono: true, bold: true, color: ACC, alpha: on(t, 0.8) });
  label(P, 140, 122, 'membership: t is a tuple of r', { size: 9.5, color: DIM, alpha: on(t, 0.8) });
  label(P, 56, 148, 't[A] = u[B]', { size: 11.5, mono: true, bold: true, color: ACC, alpha: on(t, 1.8) });
  label(P, 140, 148, 'two attributes compared', { size: 9.5, color: DIM, alpha: on(t, 1.8) });
  label(P, 56, 174, 't[A] = 10', { size: 11.5, mono: true, bold: true, color: ACC, alpha: on(t, 2.8) });
  label(P, 140, 174, 'an attribute against a constant', { size: 9.5, color: DIM, alpha: on(t, 2.8) });
  rule(P, 56, 196, 434, on(t, 3.4));
  label(P, 56, 206, 'Comparison is one of = ≠ &lt; ≤ &gt; ≥. There is no "t ∉ r" atom.', { size: 9.5, color: DIM, alpha: on(t, 3.8) });
  label(P, 56, 226, 'Negation applies to a formula, never to a membership.', { size: 9.5, color: WARN, alpha: on(t, 4.4) });

  card(P, 470, 84, 390, 170);
  label(P, 486, 96, 'How formulae are built', { size: 11, bold: true, alpha: on(t, 5.0) });
  var rules = ['an atom is a formula',
               '¬P, (P), P ∧ Q, P ∨ Q, P ⇒ Q',
               '∃t ∈ r (P) and ∀t ∈ r (P)',
               '∃x (P) and ∀x (P)  — unbounded'];
  for (var i = 0; i < rules.length; i++) {
    label(P, 486, 120 + i * 24, (i + 1) + '.', { size: 9.5, color: FAINT, alpha: on(t, 5.4 + i * 0.5) });
    label(P, 502, 120 + i * 24, rules[i], { size: 10, mono: i > 0, alpha: on(t, 5.4 + i * 0.5) });
  }
  label(P, 486, 232, 'P ⇒ Q is defined as ¬P ∨ Q; ∀ is defined as ¬∃¬.', { size: 9.5, color: DIM, alpha: on(t, 8.2) });

  card(P, 40, 268, 820, 172);
  label(P, 56, 280, 'Free against bound, on the 2026 expression', { size: 11, bold: true, alpha: on(t, 9.0) });
  label(P, 56, 306, '{ <u> | ∃v ∃w ( <u, v> ∈ R ∧ <v, w> ∈ S ) }', { size: 12, mono: true, alpha: on(t, 9.4) });
  label(P, 56, 336, 'u is free: no quantifier captures it, so the answer is a set of u values.', { size: 10, color: DIM, alpha: on(t, 10.4) });
  label(P, 56, 356, 'v and w are bound: they exist only inside the condition and never reach the answer.', { size: 10, color: DIM, alpha: on(t, 11.2) });
  rule(P, 56, 374, 844, on(t, 12.0));
  label(P, 56, 384, 'The schema of the answer is read off the free variables, in the order they are listed.', { size: 10, alpha: on(t, 12.4) });
  label(P, 56, 404, 'An answer attribute that no membership atom binds is the defect called unsafe — scene six.', { size: 10, color: WARN, alpha: on(t, 13.2) });
  label(P, 56, 424, 'Positional binding: u is R\'s first attribute and v is R\'s second, by where they sit.', { size: 10, color: DIM, alpha: on(t, 14.0) });
}

/* ======================================================================
   SCENE 3 - exists is a scan, for-all is a failed search
   ====================================================================== */
function sceneQuant(t) {
  header(P, t, 'Exists is a scan; for-all is a failed search', 'the two quantifiers, and the two shapes that cover most questions');

  card(P, 40, 84, 430, 196);
  label(P, 56, 96, '∃ u ∈ R2 ( u[A] = 3 )  —  a scan that stops at a witness', { size: 10.5, bold: true, alpha: on(t, 0.4) });
  var p = K.clamp01((t - 1.0) / 6.0);
  var scan = Math.min(DB.R2.rows.length - 1, Math.floor(p * DB.R2.rows.length));
  var found = DB.R2.rows.findIndex(function (r) { return r[0] === 3; });
  drawTable(P, 56, 118, DB.R2, { hl: p > 0 ? [Math.min(scan, found)] : [], alpha: on(t, 0.8) });
  label(P, 56, 218, 'rows tested', { size: 9.5, color: DIM, alpha: on(t, 2.0) });
  label(P, 56, 238, String(p > 0 ? Math.min(scan + 1, found + 1) : 0) + ' of ' + DB.R2.rows.length +
        ', then stop at the witness', { size: 10, mono: true, alpha: on(t, 2.0) });
  label(P, 56, 262, 'one witness is enough: the answer never counts witnesses', { size: 9.5, color: DIM, alpha: on(t, 3.0) });

  card(P, 490, 84, 370, 196);
  label(P, 506, 96, '∀ u ∈ R2 (P)  is  ¬∃ u ∈ R2 (¬P)', { size: 10.5, bold: true, alpha: on(t, 4.0) });
  label(P, 506, 122, 'so "for all" is a search for a', { size: 10, color: DIM, alpha: on(t, 4.6) });
  label(P, 506, 140, 'counterexample that never succeeds', { size: 10, color: DIM, alpha: on(t, 4.6) });
  rule(P, 506, 158, 844, on(t, 5.2));
  label(P, 506, 168, 'checked on every tuple of two domains', { size: 9.5, color: DIM, alpha: on(t, 5.6) });
  label(P, 506, 190, 'tuples tested', { size: 9.5, color: DIM, alpha: on(t, 6.2) });
  label(P, 506, 210, String(M.duality.tested), { size: 16, mono: true, bold: true, alpha: on(t, 6.2) });
  label(P, 620, 190, 'disagreements', { size: 9.5, color: DIM, alpha: on(t, 6.8) });
  label(P, 620, 210, String(M.duality.disagreements), { size: 16, mono: true, bold: true, color: VAL, alpha: on(t, 6.8) });
  label(P, 506, 244, 'a universal over an empty relation is true', { size: 9.5, color: WARN, alpha: on(t, 7.6) });
  label(P, 506, 262, 'and that vacuity is the trap of scene eight', { size: 9.5, color: WARN, alpha: on(t, 7.6) });

  card(P, 40, 292, 820, 148);
  label(P, 56, 304, 'The two shapes that cover most questions', { size: 11, bold: true, alpha: on(t, 9.0) });
  label(P, 56, 330, 'a join', { size: 10, bold: true, color: INFO, alpha: on(t, 9.4) });
  label(P, 130, 330, '∃ v ∈ S ( t[A] = v[X] ∧ … )', { size: 10.5, mono: true, alpha: on(t, 9.4) });
  label(P, 56, 350, 'an existential over the second relation, with an equality between the two tuple variables', { size: 9.5, color: DIM, alpha: on(t, 10.0) });
  label(P, 56, 378, '"for every one of these"', { size: 10, bold: true, color: ACC, alpha: on(t, 10.8) });
  label(P, 200, 378, '∀ c ∈ COURSE ( c[Dept] = "Bio" ⇒ ∃ e ∈ ENROL ( … ) )', { size: 10.5, mono: true, alpha: on(t, 10.8) });
  label(P, 56, 398, 'a universal whose body contains an existential: for every course, there exists an enrolment', { size: 9.5, color: DIM, alpha: on(t, 11.4) });
  label(P, 56, 422, 'Swapping the order of those two quantifiers changes the statement, not the notation.', { size: 9.5, color: WARN, alpha: on(t, 12.2) });
}

/* ======================================================================
   SCENE 4 - a shared variable is a join (GATE 2026 Set 1 Q43)
   ====================================================================== */
function sceneJoin(t) {
  header(P, t, 'A shared variable is a join: GATE 2026 Set 1 Q43', 'the 2026 paper stated the query in domain calculus');

  label(P, 44, 88, '{ <u> | ∃v ∃w ( <u, v> ∈ R ∧ <v, w> ∈ S ) }', { size: 11.5, mono: true, alpha: on(t, 0.4) });

  drawTable(P, 44, 108, DB.R, { alpha: on(t, 0.8), hl: t > 3.0 ? [0, 1] : [] });
  drawTable(P, 240, 108, DB.S, { alpha: on(t, 1.2), hl: t > 3.0 ? [0, 1] : [] });
  label(P, 44, 194, 'v sits in R\'s second column', { size: 9, color: DIM, alpha: on(t, 2.0) });
  label(P, 240, 194, 'and in S\'s first column', { size: 9, color: DIM, alpha: on(t, 2.4) });
  P.alpha(on(t, 3.0));
  P.arrow(196, 152, 238, 152, { stroke: ACC, sw: 1.6, head: 7 });
  P.alpha(1);
  label(P, 200, 132, 'join', { size: 9, bold: true, color: ACC, alpha: on(t, 3.0) });

  card(P, 44, 208, 400, 132);
  label(P, 58, 220, 'Reading each variable', { size: 10.5, bold: true, alpha: on(t, 4.0) });
  label(P, 58, 242, 'u  →  R.P      (free: it is the answer)', { size: 9.5, mono: true, alpha: on(t, 4.4) });
  label(P, 58, 260, 'v  →  R.Q  and  S.X   (shared: the join)', { size: 9.5, mono: true, alpha: on(t, 5.0) });
  label(P, 58, 278, 'w  →  S.Y      (bound, unused)', { size: 9.5, mono: true, alpha: on(t, 5.6) });
  label(P, 58, 304, 'so the algebra is Π_P ( S ⋈(S.X = R.Q) R )', { size: 10, mono: true, bold: true, color: ACC, alpha: on(t, 6.4) });
  label(P, 58, 324, 'and the answer is a projection onto P, not onto the join column', { size: 9, color: DIM, alpha: on(t, 7.0) });

  card(P, 456, 208, 404, 132);
  label(P, 470, 220, 'Computed on the two instances', { size: 10.5, bold: true, alpha: on(t, 7.6) });
  label(P, 470, 244, 'join rows', { size: 9, color: DIM, alpha: on(t, 8.0) });
  label(P, 470, 262, M.e2026.joinRows.map(function (r) { return '(' + r.join(',') + ')'; }).join(' '),
        { size: 10, mono: true, alpha: on(t, 8.0) });
  label(P, 470, 288, 'distinct values of u', { size: 9, color: DIM, alpha: on(t, 8.8) });
  label(P, 470, 306, setText1(M.e2026.ans), { size: 13, mono: true, bold: true, color: ACC, alpha: on(t, 8.8) });
  label(P, 470, 330, 'u = 3 has partner 4, and S holds no 4', { size: 9, color: DIM, alpha: on(t, 9.6) });

  card(P, 44, 350, 816, 92);
  label(P, 58, 362, 'The four options of the paper, each evaluated here', { size: 10.5, bold: true, alpha: on(t, 11.0) });
  var opts = [
    ['A', 'Π_P (R ⋈(R.P = S.X) S)', M.e2026.optA],
    ['B', 'Π_P (S ⋈(S.X = R.Q) R)', M.e2026.optB],
    ['C', 'Π_P (R ⋈(R.P = S.Y) S)', M.e2026.optC],
    ['D', 'Π_P (S ⋈(S.Y = R.Q) R)', M.e2026.optD]
  ];
  for (var i = 0; i < opts.length; i++) {
    var y = 386 + i * 14;
    label(P, 58, y, opts[i][0], { size: 9.5, bold: true, alpha: on(t, 11.6 + i * 0.3) });
    label(P, 74, y, opts[i][1], { size: 9, mono: true, alpha: on(t, 11.6 + i * 0.3) });
    label(P, 330, y, setText1(opts[i][2]), { size: 9, mono: true, color: DIM, alpha: on(t, 11.6 + i * 0.3) });
    tick(P, 470, y + 5, sameSet(M.e2026.ans, opts[i][2]), on(t, 12.4 + i * 0.3));
  }
  label(P, 500, 386, 'The published key is B: only B returns', { size: 9.5, color: DIM, alpha: on(t, 14.0) });
  label(P, 500, 404, 'the calculus answer.', { size: 9.5, color: DIM, alpha: on(t, 14.0) });
  label(P, 500, 422, 'A, C, D equate columns that share no variable.', { size: 9.5, color: DIM, alpha: on(t, 14.6) });
  label(P, 744, 386, 'v is not free, so it', { size: 9.5, color: WARN, alpha: on(t, 15.2) });
  label(P, 744, 404, 'never reaches the', { size: 9.5, color: WARN, alpha: on(t, 15.2) });
  label(P, 744, 422, 'answer.', { size: 9.5, color: WARN, alpha: on(t, 15.2) });
}

/* ======================================================================
   SCENE 5 - domain calculus
   ====================================================================== */
function sceneDrc(t) {
  header(P, t, 'Domain calculus: variables that hold values', 'the same logic with positional binding');

  card(P, 40, 84, 400, 150);
  label(P, 56, 96, 'Tuple calculus', { size: 10.5, bold: true, color: INFO, alpha: on(t, 0.4) });
  label(P, 56, 120, '{ t | ∃u∈EMP ( t[EmpName] = u[EmpName]', { size: 9.5, mono: true, alpha: on(t, 0.8) });
  label(P, 56, 138, '        ∧ ∃v∈DEPT ( u[DeptId] = v[DeptId] ) ) }', { size: 9.5, mono: true, alpha: on(t, 0.8) });
  label(P, 56, 166, 'a variable holds a whole tuple', { size: 9.5, color: DIM, alpha: on(t, 1.6) });
  label(P, 56, 184, 't[EmpName] names the attribute', { size: 9.5, color: DIM, alpha: on(t, 2.0) });
  label(P, 56, 206, 'answer: { ' + M.join.trc.map(function (r) { return r[0]; }).join(', ') + ' }',
        { size: 10.5, mono: true, bold: true, color: INFO, alpha: on(t, 2.6) });

  card(P, 460, 84, 400, 150);
  label(P, 476, 96, 'Domain calculus', { size: 10.5, bold: true, color: ACC, alpha: on(t, 3.2) });
  label(P, 476, 120, '{ <n> | ∃i,d,dn ( <i,n,d> ∈ EMP', { size: 9.5, mono: true, alpha: on(t, 3.6) });
  label(P, 476, 138, '          ∧ <dn,d> ∈ DEPT ) }', { size: 9.5, mono: true, alpha: on(t, 3.6) });
  label(P, 476, 166, 'a variable holds one value', { size: 9.5, color: DIM, alpha: on(t, 4.4) });
  label(P, 476, 184, 'position in the angle brackets decides the attribute', { size: 9.5, color: DIM, alpha: on(t, 4.8) });
  label(P, 476, 206, 'answer: { ' + M.join.drc.map(function (r) { return r[0]; }).join(', ') + ' }',
        { size: 10.5, mono: true, bold: true, color: ACC, alpha: on(t, 5.4) });

  card(P, 40, 248, 400, 96);
  label(P, 56, 260, 'The translation, mechanically', { size: 10.5, bold: true, alpha: on(t, 6.4) });
  label(P, 56, 282, '1. each tuple variable becomes a list of its attributes', { size: 9.5, color: DIM, alpha: on(t, 6.8) });
  label(P, 56, 300, '2. t[A] becomes the position of A in that relation', { size: 9.5, color: DIM, alpha: on(t, 7.2) });
  label(P, 56, 318, '3. the free variables become the answer tuple', { size: 9.5, color: DIM, alpha: on(t, 7.6) });

  card(P, 460, 248, 400, 96);
  label(P, 476, 260, 'And the two answers are compared', { size: 10.5, bold: true, alpha: on(t, 8.4) });
  tick(P, 480, 288, sameSet(M.join.trc, M.join.drc), on(t, 8.8));
  label(P, 496, 282, 'equal as sets, not merely equal in size', { size: 10, alpha: on(t, 8.8) });
  label(P, 476, 310, 'this is a model check, reported under the canvas', { size: 9, color: DIM, alpha: on(t, 9.4) });
  label(P, 476, 330, M.join.trc.length + ' rows in each', { size: 9, mono: true, color: FAINT, alpha: on(t, 9.8) });

  card(P, 40, 356, 820, 84);
  label(P, 56, 368, 'Where this notation turns up', { size: 10.5, bold: true, alpha: on(t, 10.6) });
  label(P, 56, 390, 'It is the theoretical basis of query-by-example, where you fill in an example row and the system infers the query.', { size: 9.5, color: DIM, alpha: on(t, 11.0) });
  label(P, 56, 408, 'GATE used it in 2026 for the join item, and tuple calculus in 2008 and 2001 — so both notations are examinable.', { size: 9.5, color: DIM, alpha: on(t, 11.6) });
  label(P, 56, 428, 'A wrong component order is a semantic error that still runs: the query answers a different question silently.', { size: 9.5, color: WARN, alpha: on(t, 12.4) });
}

/* ======================================================================
   SCENE 6 - why the domain must be finite
   ====================================================================== */
function sceneSafety(t) {
  header(P, t, 'Why the domain must be finite', 'dom(P), safety, and the growth test that measures it');

  card(P, 40, 84, 820, 92);
  label(P, 56, 96, 'dom(P): the constants in the formula, plus every value in every relation it names', { size: 10.5, bold: true, alpha: on(t, 0.4) });
  var domList = EUNSAFE.dom;
  var cx = 56;
  for (var i = 0; i < domList.length; i++) {
    cx += chip(P, cx, 122, String(domList[i]), DIM, on(t, 0.8 + i * 0.15)) + 8;
  }
  label(P, 56, 150, 'for { t | ¬(t ∈ r) } this is ' + domList.length + ' values, and it is finite because the formula names one relation and no constant',
        { size: 9.5, color: DIM, alpha: on(t, 2.2) });

  card(P, 40, 188, 400, 158, { fill: SURF2, alpha: on(t, 3.0) });
  label(P, 56, 200, 'Run 1 — over dom(P)', { size: 10.5, bold: true, alpha: on(t, 3.0) });
  label(P, 56, 226, '{ t | ¬(t ∈ r) }', { size: 10.5, mono: true, alpha: on(t, 3.4) });
  label(P, 56, 254, 'candidates', { size: 9, color: DIM, alpha: on(t, 3.8) });
  label(P, 130, 250, Math.pow(domList.length, 2) + ' = ' + domList.length + '²', { size: 10.5, mono: true, alpha: on(t, 3.8) });
  label(P, 56, 280, 'answer size', { size: 9, color: DIM, alpha: on(t, 4.4) });
  label(P, 130, 274, String(M.unsafe.n1), { size: 16, mono: true, bold: true, alpha: on(t, 4.4) });
  label(P, 56, 312, 'the three stored tuples are removed', { size: 9, color: FAINT, alpha: on(t, 4.8) });
  label(P, 56, 330, Math.pow(domList.length, 2) + ' − ' + DB.r.rows.length + ' = ' + M.unsafe.n1, { size: 9, mono: true, color: FAINT, alpha: on(t, 4.8) });

  card(P, 460, 188, 400, 158, { fill: BADDIM, stroke: BAD, alpha: on(t, 5.6) });
  label(P, 476, 200, 'Run 2 — dom(P) with one fresh value added', { size: 10.5, bold: true, color: BAD, alpha: on(t, 5.6) });
  label(P, 476, 226, 'the value "' + FRESH + '" appears in no relation', { size: 9.5, color: DIM, alpha: on(t, 6.0) });
  label(P, 476, 254, 'candidates', { size: 9, color: DIM, alpha: on(t, 6.4) });
  label(P, 550, 250, Math.pow(domList.length + 1, 2) + ' = ' + (domList.length + 1) + '²', { size: 10.5, mono: true, alpha: on(t, 6.4) });
  label(P, 476, 280, 'answer size', { size: 9, color: DIM, alpha: on(t, 7.0) });
  label(P, 550, 274, String(M.unsafe.n2), { size: 16, mono: true, bold: true, color: BAD, alpha: on(t, 7.0) });
  label(P, 476, 312, 'grew by ' + (M.unsafe.n2 - M.unsafe.n1), { size: 9.5, bold: true, color: BAD, alpha: on(t, 7.6) });
  label(P, 476, 330, 'so the answer depends on the universe, not the data', { size: 9, color: DIM, alpha: on(t, 7.6) });

  card(P, 40, 356, 820, 84, { fill: ACCDIM, stroke: ACC, alpha: on(t, 8.6) });
  label(P, 56, 368, 'The test, in one sentence', { size: 10.5, bold: true, color: ACC, alpha: on(t, 8.6) });
  label(P, 56, 390, 'Add one value that no relation and no constant mentions. A safe expression returns exactly the same set; an unsafe one grows.',
        { size: 10, alpha: on(t, 9.0) });
  label(P, 56, 412, 'The bound filter { t | t ∈ r ∧ t[A]=10 ∧ t[B]=20 } returns ' + M.safe1999.n1 + ' then ' + M.safe1999.n2 +
        ' — unchanged, so it is safe.', { size: 9.5, color: DIM, alpha: on(t, 9.6) });
  label(P, 56, 430, 'Safety is a claim about every instance, so one lucky instance proves nothing; the growth test is the operational form of the definition.',
        { size: 9.5, color: DIM, alpha: on(t, 10.4) });
}

/* ======================================================================
   SCENE 7 - GATE CSE 2001
   ====================================================================== */
function sceneUnsafe(t) {
  header(P, t, 'GATE CSE 2001: which expression is not safe', 'four expressions, one instance, two domains');

  label(P, 44, 86, 'R1(A) = { 1, 2, x }      R2(A) = { 2, 3, 4 }', { size: 10, mono: true, alpha: on(t, 0.4) });

  card(P, 40, 100, 820, 34, { fill: SURF2, alpha: on(t, 0.8) });
  label(P, 56, 110, 'option', { size: 9, bold: true, color: DIM, alpha: on(t, 0.8) });
  label(P, 110, 110, 'expression', { size: 9, bold: true, color: DIM, alpha: on(t, 0.8) });
  label(P, 596, 110, '|answer| on dom', { size: 9, bold: true, color: DIM, alpha: on(t, 0.8) });
  label(P, 700, 110, 'with one fresh value', { size: 9, bold: true, color: DIM, alpha: on(t, 0.8) });
  label(P, 812, 110, 'safe?', { size: 9, bold: true, color: DIM, alpha: on(t, 0.8) });

  for (var i = 0; i < M.q2001.length; i++) {
    var o = M.q2001[i];
    var y = 148 + i * 40;
    var a = on(t, 1.4 + i * 0.7);
    card(P, 40, y - 10, 820, 34, { fill: o.grew ? BADDIM : SURF, stroke: o.grew ? BAD : BORDER, alpha: a });
    label(P, 56, y, o.label, { size: 11, bold: true, color: o.grew ? BAD : INK, alpha: a });
    label(P, 110, y, o.text, { size: 8.6, mono: true, alpha: a });
    label(P, 620, y, String(o.n1), { size: 11, mono: true, align: 'center', alpha: a });
    label(P, 730, y, String(o.n2), { size: 11, mono: true, bold: true, align: 'center',
                                     color: o.grew ? BAD : INK, alpha: a });
    tick(P, 816, y + 4, !o.grew, a);
  }

  card(P, 40, 312, 400, 128, { fill: BADDIM, stroke: BAD, alpha: on(t, 5.0) });
  label(P, 56, 324, 'C is the naked complement', { size: 10.5, bold: true, color: BAD, alpha: on(t, 5.0) });
  label(P, 56, 346, 'nothing binds t, so t ranges over the whole domain', { size: 9.5, color: DIM, alpha: on(t, 5.4) });
  label(P, 56, 366, 'the fresh value enters the answer at once', { size: 9.5, color: DIM, alpha: on(t, 5.8) });
  label(P, 56, 392, 'and the answer is not finite for an infinite domain', { size: 9.5, color: DIM, alpha: on(t, 6.2) });
  label(P, 56, 418, 'The published key is C.', { size: 10.5, bold: true, color: BAD, alpha: on(t, 6.8) });

  card(P, 460, 312, 400, 128, { fill: WARNDIM, stroke: WARN, alpha: on(t, 7.4) });
  label(P, 476, 324, 'B is the one that depends on the data', { size: 10.5, bold: true, color: WARN, alpha: on(t, 7.4) });
  label(P, 476, 346, 'on this instance no u of R1 has A = "x", so the', { size: 9.5, color: DIM, alpha: on(t, 7.8) });
  label(P, 476, 362, 'implication is vacuously true — the answer is empty', { size: 9.5, color: DIM, alpha: on(t, 7.8) });
  label(P, 476, 386, 'give R1 = { 1, 2, 3 } instead and the same', { size: 9.5, color: DIM, alpha: on(t, 8.4) });
  label(P, 476, 402, 'expression returns ' + M.q2001b[1].n1 + ', then ' + M.q2001b[1].n2 + ' — unsafe',
        { size: 9.5, mono: true, bold: true, color: WARN, alpha: on(t, 8.8) });
  label(P, 476, 426, 'A negation is not the defect; an unbound output is.', { size: 9.5, color: WARN, alpha: on(t, 9.4) });
}

/* ======================================================================
   SCENE 8 - the vacuous for-all
   ====================================================================== */
function sceneVacuous(t) {
  header(P, t, 'The vacuous for-all, and the 2017 question', 'a universal over nothing is true of everything');

  label(P, 44, 86, 'COURSE — this instance offers no Biology course', { size: 10, bold: true, alpha: on(t, 0.4) });
  drawTable(P, 44, 100, DB.COURSE_B, { alpha: on(t, 0.8) });
  label(P, 44, 100 + 20 + 2 * 19 + 8, 'no row has Dept = Bio', { size: 9, color: WARN, alpha: on(t, 1.2) });

  drawTable(P, 250, 100, DB.ENROL, { alpha: on(t, 1.6) });
  label(P, 250, 100 + 20 + 6 * 19 + 8, 'six enrolments, four students', { size: 9, color: DIM, alpha: on(t, 2.0) });

  card(P, 430, 84, 430, 150, { fill: BADDIM, stroke: BAD, alpha: on(t, 2.6) });
  label(P, 446, 96, 'Naive: { t | ∀c∈COURSE ( c[Dept]="Bio" ⇒ … ) }', { size: 9.5, mono: true, color: BAD, alpha: on(t, 2.6) });
  label(P, 446, 122, 'the antecedent is never true, so the body is true', { size: 9.5, color: DIM, alpha: on(t, 3.0) });
  label(P, 446, 140, 'for every value of t — including non-students', { size: 9.5, color: DIM, alpha: on(t, 3.0) });
  label(P, 446, 166, 'answer size', { size: 9, color: DIM, alpha: on(t, 3.6) });
  label(P, 530, 160, String(M.vac.naiveB.n1) + ' of a domain of ' + M.vac.domB.length,
        { size: 12, mono: true, bold: true, color: BAD, alpha: on(t, 3.6) });
  label(P, 446, 190, 'add one fresh value: ' + M.vac.naiveB.n2 + ' rows. Unsafe.', { size: 9.5, color: BAD, alpha: on(t, 4.2) });
  label(P, 446, 212, 'the whole domain is the answer, not the students', { size: 9.5, color: DIM, alpha: on(t, 4.6) });

  card(P, 430, 244, 430, 108, { fill: ACCDIM, stroke: ACC, alpha: on(t, 5.4) });
  label(P, 446, 256, 'Guarded: add  ∃e∈ENROL ( e[S] = t[S] )  outside it', { size: 9.5, mono: true, color: ACC, alpha: on(t, 5.4) });
  label(P, 446, 282, 'now the answer is a subset of the enrolled students', { size: 9.5, color: DIM, alpha: on(t, 5.8) });
  label(P, 446, 308, 'answer size', { size: 9, color: DIM, alpha: on(t, 6.2) });
  label(P, 530, 302, String(M.vac.guardB.n1) + ' then ' + M.vac.guardB.n2,
        { size: 12, mono: true, bold: true, color: VAL, alpha: on(t, 6.2) });
  label(P, 446, 332, 'unchanged when the fresh value is added. Safe.', { size: 9.5, color: DIM, alpha: on(t, 6.8) });

  card(P, 44, 300, 360, 120);
  label(P, 58, 312, 'The same two on an instance that has Bio', { size: 10, bold: true, alpha: on(t, 7.6) });
  label(P, 58, 336, 'naive', { size: 9, color: DIM, alpha: on(t, 8.0) });
  label(P, 110, 336, setText1(M.vac.naiveA), { size: 9.5, mono: true, alpha: on(t, 8.0) });
  label(P, 58, 358, 'guarded', { size: 9, color: DIM, alpha: on(t, 8.4) });
  label(P, 120, 358, setText1(M.vac.guardA), { size: 9.5, mono: true, alpha: on(t, 8.4) });
  tick(P, 58, 384, sameSet(M.vac.naiveA, M.vac.guardA), on(t, 9.0));
  label(P, 72, 378, 'they agree when the guard is not needed', { size: 9, color: DIM, alpha: on(t, 9.0) });
  label(P, 58, 404, 'so the guard costs nothing except safety', { size: 9, color: FAINT, alpha: on(t, 9.4) });

  label(P, 44, 436, 'GATE 2017 Set 1 Q41: the published key is all three. This page\'s growth test moves I and II (' +
        M.q2017[0].label + ' ' + M.q2017[0].n1 + '→' + M.q2017[0].n2 + ', ' +
        M.q2017[1].label + ' ' + M.q2017[1].n1 + '→' + M.q2017[1].n2 + ') and not III (' +
        M.q2017[2].n1 + '→' + M.q2017[2].n2 + ').',
        { size: 8.4, color: DIM, alpha: on(t, 10.6) });
  label(P, 44, 454, 'The key governs the marks; the test is reported beside it, not asserted against it.',
        { size: 8.4, color: FAINT, alpha: on(t, 11.2) });
}

/* ======================================================================
   SCENE 9 - expressive power
   ====================================================================== */
function scenePower(t) {
  header(P, t, 'Expressive power, and where it stops', 'Codd\'s three-way equality, and the query it excludes');

  var boxes = [['basic relational algebra', INFO], ['safe tuple calculus', ACC], ['safe domain calculus', ACC]];
  for (var i = 0; i < 3; i++) {
    var bx = 44 + i * 286;
    card(P, bx, 84, 250, 62, { fill: SURF2, alpha: on(t, 0.4 + i * 0.5) });
    label(P, bx + 125, 100, boxes[i][0], { size: 10.5, bold: true, color: boxes[i][1], align: 'center', alpha: on(t, 0.4 + i * 0.5) });
    label(P, bx + 125, 120, 'same set of queries', { size: 9, color: DIM, align: 'center', alpha: on(t, 0.8 + i * 0.5) });
    if (i < 2) label(P, bx + 262, 108, '=', { size: 16, bold: true, align: 'center', color: ACC, alpha: on(t, 1.4 + i * 0.5) });
  }
  label(P, 44, 162, 'Codd: each can express exactly what the others can, once the calculi are restricted to safe expressions.',
        { size: 10, alpha: on(t, 2.4) });
  label(P, 44, 182, 'GATE CSE 2006 asked for exactly this, with the three languages as its options. The key is D, all three.',
        { size: 9.5, color: DIM, alpha: on(t, 3.0) });

  card(P, 44, 196, 816, 150);
  label(P, 58, 208, 'What none of them can say: reachability on an unbounded chain', { size: 10.5, bold: true, alpha: on(t, 4.0) });
  var nx = 78, ny = 262;
  for (var n = 1; n <= 5; n++) {
    var x = nx + (n - 1) * 74;
    P.alpha(on(t, 4.6 + n * 0.2));
    P.circle(x, ny, 15, { fill: SURF, stroke: ACC, sw: 1.6 });
    P.alpha(on(t, 4.6 + n * 0.2));
    P.text(x, ny - 5, String(n), { size: 11, bold: true, align: 'center', color: ACC });
    P.alpha(1);
    if (n < 5) {
      P.alpha(on(t, 5.0 + n * 0.2));
      P.arrow(x + 16, ny, x + 58, ny, { stroke: DIM, sw: 1.3, head: 7 });
      P.alpha(1);
    }
  }
  label(P, 58, 300, 'depth 1 finds 1→2 only; depth 2 adds 1→3 and 2→4; the pair 1→5 needs three hops and no two-quantifier expression reaches it.',
        { size: 9.5, color: DIM, alpha: on(t, 7.0) });
  label(P, 58, 320, 'measured on a three-node chain: ' + M.reach.n3.found + ' of ' + M.reach.n3.total + ' reachable pairs found — exact.',
        { size: 9.5, mono: true, color: VAL, alpha: on(t, 7.6) });
  label(P, 58, 338, 'measured on a five-node chain: ' + M.reach.n5.found + ' of ' + M.reach.n5.total + ' found, ' + M.reach.n5.missed + ' missed.',
        { size: 9.5, mono: true, color: BAD, alpha: on(t, 8.2) });

  card(P, 44, 358, 400, 84, { fill: WARNDIM, stroke: WARN, alpha: on(t, 9.0) });
  label(P, 58, 370, 'Why the gap widens', { size: 10, bold: true, color: WARN, alpha: on(t, 9.0) });
  label(P, 58, 392, 'a chain of n nodes has n(n−1)/2 reachable pairs,', { size: 9.5, color: DIM, alpha: on(t, 9.4) });
  label(P, 58, 410, 'and depth k reaches only the pairs within k hops', { size: 9.5, color: DIM, alpha: on(t, 9.8) });
  label(P, 58, 430, 'add a node and the missed count grows by more', { size: 9.5, color: DIM, alpha: on(t, 10.2) });

  card(P, 460, 358, 400, 84, { fill: SURF2, alpha: on(t, 10.8) });
  label(P, 474, 370, 'What recursion needs instead', { size: 10, bold: true, alpha: on(t, 10.8) });
  label(P, 474, 392, 'a fixed-point operator, or a recursive query in SQL', { size: 9.5, color: DIM, alpha: on(t, 11.2) });
  label(P, 474, 410, 'a quantifier cannot stand in for it: the formula', { size: 9.5, color: DIM, alpha: on(t, 11.6) });
  label(P, 474, 430, 'has a fixed number of them, and the chain does not', { size: 9.5, color: DIM, alpha: on(t, 12.0) });
}

/* ======================================================================
   SCENE 10 - counts, procedure, traps
   ====================================================================== */
function sceneProcedure(t) {
  header(P, t, 'Counts, reading procedure and traps', 'what to carry into the exam');

  card(P, 40, 84, 400, 200);
  label(P, 56, 98, 'The counts worth knowing', { size: 10.5, bold: true, alpha: on(t, 0.6) });
  var rows = [
    ['candidates for arity n over dom d', 'dⁿ'],
    ['largest answer, this page', String(M.bound.largest)],
    ['its candidate bound', String(M.bound.candidates) + '  (' + M.bound.d + '²)'],
    ['query shapes in the topic', '2'],
    ['primitive atoms', '3']
  ];
  for (var i = 0; i < rows.length; i++) {
    label(P, 56, 126 + i * 30, rows[i][0], { size: 9.5, color: DIM, alpha: on(t, 1.0 + i * 0.4) });
    label(P, 424, 126 + i * 30, rows[i][1], { size: 11, bold: true, mono: true, align: 'right', alpha: on(t, 1.0 + i * 0.4) });
    rule(P, 56, 144 + i * 30, 424, on(t, 1.0 + i * 0.4) * 0.5);
  }
  label(P, 56, 276, 'a safe answer can never exceed the candidate bound', { size: 8.5, color: FAINT, alpha: on(t, 3.6) });

  card(P, 460, 84, 400, 200);
  label(P, 476, 98, 'The reading procedure', { size: 10.5, bold: true, alpha: on(t, 3.8) });
  var steps = [
    '1. List the free variables: that is the answer schema.',
    '2. Find the quantifiers: join, or for-every?',
    '3. Check the polarity: is a negation unbound?',
    '4. Add a fresh value and compare the answer.'
  ];
  for (var s = 0; s < steps.length; s++) {
    label(P, 476, 128 + s * 36, steps[s], { size: 10, alpha: on(t, 4.0 + s * 0.5) });
  }
  label(P, 476, 268, 'Step 4 catches what the first three miss.', { size: 9.5, bold: true, color: WARN, alpha: on(t, 6.4) });

  card(P, 40, 300, 820, 84, { fill: WARNDIM, stroke: WARN, alpha: on(t, 7.0) });
  label(P, 56, 314, 'The three traps', { size: 10, bold: true, color: WARN, alpha: on(t, 7.0) });
  label(P, 56, 336, '1. Vacuous truth — a universal over an empty relation is true of everything.',
        { size: 9.5, color: DIM, alpha: on(t, 7.2) });
  label(P, 56, 354, '2. An unbound output attribute — nothing ties it to a stored value.',
        { size: 9.5, color: DIM, alpha: on(t, 7.4) });
  label(P, 56, 372, '3. A negated unbound atom — the naked complement, the same defect in a shorter formula.',
        { size: 9.5, color: DIM, alpha: on(t, 7.6) });

  card(P, 40, 396, 820, 50, { fill: ACCDIM, stroke: ACC, alpha: on(t, 8.4) });
  label(P, 56, 408, 'The sentence to keep', { size: 10, bold: true, color: ACC, alpha: on(t, 8.4) });
  label(P, 56, 426, 'Calculus describes the answer instead of computing it, and safety is the price: a safe expression answers from the stored data alone.',
        { size: 10, alpha: on(t, 8.8) });
}

/* ---------- the frame ---------- */
var SCENES = [sceneWhat, sceneAtoms, sceneQuant, sceneJoin, sceneDrc,
              sceneSafety, sceneUnsafe, sceneVacuous, scenePower, sceneProcedure];

function drawFrame(Pp) {
  Pp.clear();
  var t = K.state.elapsed;
  var idx = K.sceneAt(t);
  var sc = K.state.scenes[idx];
  var local = sc ? t - sc.start : t;
  var fn = SCENES[idx] || SCENES[0];
  fn(local);
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

  if (window.p5 && PR) {
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
      if (ctx2d && PR) {
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

window.__MODEL = { M: M, CHECKS: CHECKS };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
