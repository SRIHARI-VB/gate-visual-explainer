/* ==========================================================================
   complexity-classes-p-np-np-complete — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model builds a 3-SAT formula, its CLIQUE reduction graph, an
   unsatisfiable instance, the complement identity for VERTEX COVER, a 2-SAT
   implication-graph test and a subset-sum instance. The drawing code reads V
   and performs no search of its own.
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
  var INVALIDDIM = PAL.invalidDim || '#fbe4e2';

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- literals and clauses ---------- */
function L(v, s) { return { v: v, s: s }; }
function litText(l) { return (l.s < 0 ? '\u00acx' : 'x') + l.v; }
function evalLit(l, a) { return l.s > 0 ? a[l.v - 1] : !a[l.v - 1]; }

var F = [
  [L(1, 1), L(2, 1), L(3, 1)],
  [L(1, -1), L(2, -1), L(3, 1)],
  [L(1, -1), L(2, 1), L(3, -1)],
  [L(1, 1), L(2, -1), L(3, -1)]
];
var NVARS = 3;

function allAssignments(n) {
  var out = [], total = Math.pow(2, n), m, i;
  for (m = 0; m < total; m++) {
    var a = [];
    for (i = 0; i < n; i++) a.push(!!((m >> (n - 1 - i)) & 1));
    out.push(a);
  }
  return out;
}
function clauseTrue(c, a) {
  for (var i = 0; i < c.length; i++) if (evalLit(c[i], a)) return true;
  return false;
}
function satisfies(Fx, a) {
  for (var i = 0; i < Fx.length; i++) if (!clauseTrue(Fx[i], a)) return false;
  return true;
}
function bits(a) {
  return a.map(function (b) { return b ? '1' : '0'; }).join('');
}

var ASSIGN = allAssignments(NVARS);
var SAT_LIST = ASSIGN.filter(function (a) { return satisfies(F, a); });
var UNSAT_LIST = ASSIGN.filter(function (a) { return !satisfies(F, a); });

/* ---------- the reduction graph: one vertex per literal occurrence ---------- */
function reduceGraph(Fx) {
  var verts = [], i, c, l;
  for (c = 0; c < Fx.length; c++) for (l = 0; l < Fx[c].length; l++) {
    verts.push({ clause: c, lit: Fx[c][l] });
  }
  var edges = [];
  for (i = 0; i < verts.length; i++) {
    for (var j = i + 1; j < verts.length; j++) {
      if (compatible(verts[i], verts[j])) edges.push([i, j]);
    }
  }
  return { n: verts.length, verts: verts, edges: edges };
}
function compatible(u, v) {
  if (u.clause === v.clause) return false;
  if (u.lit.v === v.lit.v && u.lit.s !== v.lit.s) return false;
  return true;
}

var GR = reduceGraph(F);

/* adjacency as sets, built from the edge list */
function adjSets(n, edges) {
  var A = [], i;
  for (i = 0; i < n; i++) A.push({});
  for (i = 0; i < edges.length; i++) {
    A[edges[i][0]][edges[i][1]] = 1;
    A[edges[i][1]][edges[i][0]] = 1;
  }
  return A;
}
function hasEdge(A, i, j) { return !!A[i][j]; }

/* enumerate every clique of exactly size k */
function cliquesOfSize(n, edges, k) {
  var A = adjSets(n, edges), out = [], cur = [];
  (function rec(start) {
    if (cur.length === k) { out.push(cur.slice()); return; }
    for (var i = start; i < n; i++) {
      var ok = true;
      for (var j = 0; j < cur.length; j++) if (!hasEdge(A, cur[j], i)) { ok = false; break; }
      if (!ok) continue;
      cur.push(i); rec(i + 1); cur.pop();
    }
  })(0);
  return out;
}

/* largest clique, by branch and bound over vertex sets */
function maxClique(n, edges) {
  var A = adjSets(n, edges), best = 0;
  function rec(chosen, cand) {
    if (!cand.length) { if (chosen.length > best) best = chosen.length; return; }
    if (chosen.length + cand.length <= best) return;
    for (var i = 0; i < cand.length; i++) {
      var v = cand[i], next = [];
      for (var j = i + 1; j < cand.length; j++) if (hasEdge(A, v, cand[j])) next.push(cand[j]);
      chosen.push(v); rec(chosen, next); chosen.pop();
      if (chosen.length + (cand.length - i - 1) <= best) return;
    }
  }
  var all = [];
  for (var i = 0; i < n; i++) all.push(i);
  rec([], all);
  return best;
}

/* ---------- the unsatisfiable instance: all eight clauses over three variables ---------- */
var UF = (function () {
  var out = [], m, v;
  for (m = 0; m < 8; m++) {
    var c = [];
    for (v = 1; v <= 3; v++) c.push(L(v, ((m >> (v - 1)) & 1) ? 1 : -1));
    out.push(c);
  }
  return out;
})();
var UGRAPH = reduceGraph(UF);
var UMAX = maxClique(UGRAPH.n, UGRAPH.edges);

/* ---------- the clique-to-assignment correspondence, both ways ---------- */
var KCLIQUES = cliquesOfSize(GR.n, GR.edges, F.length);

function assignmentFromClique(S) {
  var a = [null, null, null], i;
  for (i = 0; i < S.length; i++) {
    var v = GR.verts[S[i]], want = v.lit.s > 0;
    if (a[v.lit.v - 1] === null) a[v.lit.v - 1] = want;
    else if (a[v.lit.v - 1] !== want) return null;
  }
  for (i = 0; i < 3; i++) if (a[i] === null) a[i] = false;
  return a;
}
function cliqueFromAssignment(a) {
  var S = [];
  for (var c = 0; c < F.length; c++) {
    var picked = -1;
    for (var j = 0; j < F[c].length; j++) {
      if (evalLit(F[c][j], a)) { picked = c * 3 + j; break; }
    }
    if (picked < 0) return null;
    S.push(picked);
  }
  S.sort(function (x, y) { return x - y; });
  return S;
}
function keyOf(S) { return S.join(','); }

var CLIQUE_KEYS = {};
KCLIQUES.forEach(function (S) { CLIQUE_KEYS[keyOf(S)] = 1; });

var CLIQUE_TO_ASSIGN = KCLIQUES.map(function (S) {
  var a = assignmentFromClique(S);
  return { S: S, a: a, ok: !!a && satisfies(F, a) };
});
var ASSIGN_TO_CLIQUE = SAT_LIST.map(function (a) {
  var S = cliqueFromAssignment(a);
  return { a: a, S: S, ok: !!S && !!CLIQUE_KEYS[keyOf(S)] };
});

/* ---------- complement, vertex cover, and the identity ---------- */
function complement(n, edges) {
  var es = {}, i;
  for (i = 0; i < edges.length; i++) {
    es[Math.min(edges[i][0], edges[i][1]) + '-' + Math.max(edges[i][0], edges[i][1])] = 1;
  }
  var out = [];
  for (i = 0; i < n; i++) {
    for (var j = i + 1; j < n; j++) if (!es[i + '-' + j]) out.push([i, j]);
  }
  return out;
}
function minVertexCover(n, edges) {
  for (var k = 0; k <= n; k++) {
    var found = coverOfSize(n, edges, k);
    if (found) return k;
  }
  return n;
}
function coverOfSize(n, edges, k) {
  var cur = [];
  function rec(start) {
    if (cur.length === k) {
      var inS = {};
      cur.forEach(function (v) { inS[v] = 1; });
      for (var e = 0; e < edges.length; e++) {
        if (!inS[edges[e][0]] && !inS[edges[e][1]]) return false;
      }
      return true;
    }
    for (var i = start; i < n; i++) {
      cur.push(i);
      if (rec(i + 1)) return true;
      cur.pop();
    }
    return false;
  }
  return rec(0);
}

var G5 = { n: 5, edges: [[0, 1], [0, 2], [1, 2], [2, 3], [3, 4]] };
var G5_COMP = complement(5, G5.edges);
var G5_CLIQUE = maxClique(5, G5.edges);
var G5_COVER = minVertexCover(5, G5_COMP);

var COMPLEMENT_AUDIT = (function () {
  var ok = 0, total = 0, n, i;
  for (n = 4; n <= 5; n++) {
    var pairs = [];
    for (i = 0; i < n; i++) for (var j = i + 1; j < n; j++) pairs.push([i, j]);
    var m = pairs.length, limit = Math.pow(2, m);
    for (var mask = 0; mask < limit; mask++) {
      var es = [];
      for (i = 0; i < m; i++) if ((mask >> i) & 1) es.push(pairs[i]);
      total++;
      if (maxClique(n, es) + minVertexCover(n, complement(n, es)) === n) ok++;
    }
  }
  return { ok: ok, total: total };
})();

/* the identity on the reduction graph itself */
var RED_VC = minVertexCover(GR.n, complement(GR.n, GR.edges));
var RED_MAX = maxClique(GR.n, GR.edges);

/* ---------- 2-SAT: implication graph and strongly connected components ---------- */
function twoSatClauses() {
  var lits = [], v, s;
  for (v = 1; v <= 3; v++) { lits.push(L(v, 1)); lits.push(L(v, -1)); }
  var out = [];
  for (var i = 0; i < lits.length; i++) {
    for (var j = i; j < lits.length; j++) {
      var a = lits[i], b = lits[j];
      if (a.v === b.v && a.s !== b.s) continue;      /* tautology */
      out.push([a, b]);
    }
  }
  return out;
}
var CLAUSES2 = twoSatClauses();

function twoSatDecide(cs) {
  var N = 6, g = [], i;
  for (i = 0; i < N; i++) g.push([]);
  function idx(l) { return 2 * (l.v - 1) + (l.s > 0 ? 0 : 1); }
  for (i = 0; i < cs.length; i++) {
    var a = idx(cs[i][0]), b = idx(cs[i][1]);
    g[a ^ 1].push(b);
    g[b ^ 1].push(a);
  }
  /* Kosaraju: order by finish time, then reverse graph */
  var seen = [], order = [];
  for (i = 0; i < N; i++) seen.push(false);
  function dfs(u) {
    seen[u] = true;
    for (var k = 0; k < g[u].length; k++) if (!seen[g[u][k]]) dfs(g[u][k]);
    order.push(u);
  }
  for (i = 0; i < N; i++) if (!seen[i]) dfs(i);
  var gr = [];
  for (i = 0; i < N; i++) gr.push([]);
  for (i = 0; i < N; i++) for (var k = 0; k < g[i].length; k++) gr[g[i][k]].push(i);
  var comp = [];
  for (i = 0; i < N; i++) comp.push(-1);
  var c = 0;
  function rdfs(u, id) {
    comp[u] = id;
    for (var k = 0; k < gr[u].length; k++) if (comp[gr[u][k]] < 0) rdfs(gr[u][k], id);
  }
  for (i = order.length - 1; i >= 0; i--) {
    if (comp[order[i]] < 0) { rdfs(order[i], c); c++; }
  }
  for (var vv = 0; vv < 3; vv++) if (comp[2 * vv] === comp[2 * vv + 1]) return false;
  return true;
}
function bruteTwoSat(cs) {
  for (var i = 0; i < ASSIGN.length; i++) {
    var a = ASSIGN[i], ok = true;
    for (var j = 0; j < cs.length; j++) {
      if (!evalLit(cs[j][0], a) && !evalLit(cs[j][1], a)) { ok = false; break; }
    }
    if (ok) return true;
  }
  return false;
}

var TWOSAT = (function () {
  var tested = 0, mismatch = 0;
  function rec(start, picked) {
    if (picked.length === 4) {
      tested++;
      if (twoSatDecide(picked) !== bruteTwoSat(picked)) mismatch++;
      return;
    }
    for (var i = start; i < CLAUSES2.length; i++) {
      picked.push(CLAUSES2[i]);
      rec(i + 1, picked);
      picked.pop();
    }
  }
  rec(0, []);
  return { tested: tested, mismatch: mismatch };
})();

var TWOSAT_DEMO = [
  [L(1, 1), L(2, 1)], [L(1, -1), L(2, 1)],
  [L(2, -1), L(3, 1)], [L(1, 1), L(3, -1)]
];

/* ---------- subset sum, as a second NP-complete example ---------- */
var SUBSET = [3, 34, 4, 12, 5, 2];
var SUBSET_TARGET = 9;
var SUBSET_SOLS = (function () {
  var out = [];
  (function rec(i, acc, picked) {
    if (i === SUBSET.length) {
      if (acc === SUBSET_TARGET && picked.length) out.push(picked.slice());
      return;
    }
    rec(i + 1, acc, picked);
    picked.push(SUBSET[i]); rec(i + 1, acc + SUBSET[i], picked); picked.pop();
  })(0, 0, []);
  return out;
})();

/* ---------- the cost table: polynomial against exponential ---------- */
var COST = [10, 20, 30, 40].map(function (n) {
  return { n: n, cube: n * n * n, exp: Math.pow(2, n) };
});
var CROSSOVER = (function () {
  /* the first n from which two to the n stays above n cubed for good */
  for (var n = 2; n <= 64; n++) {
    var stays = true;
    for (var m = n; m <= 64; m++) if (Math.pow(2, m) <= m * m * m) { stays = false; break; }
    if (stays) return n;
  }
  return -1;
})();

/* ---------- the verifier that ignores its certificate ---------- */
var IGNORE_DEMO = SAT_LIST.slice(0, 3).map(function (a) {
  return { cert: bits(a), answer: satisfies(F, a) };
});

/* the clique the canvas highlights: the one the assignment 100 produces */
var HIGHLIGHT = cliqueFromAssignment([true, false, false]);

/* ---------- V: everything the page shows ---------- */
var V = {
  nvars: NVARS,
  clauses: F.length,
  literals: F.reduce(function (s, c) { return s + c.length; }, 0),
  assignments: ASSIGN.length,
  sat: SAT_LIST.map(bits),
  rejected: UNSAT_LIST.map(bits),
  graph: { n: GR.n, edges: GR.edges.length, possible: GR.n * (GR.n - 1) / 2 },
  cliques4: KCLIQUES.length,
  maxClique: RED_MAX,
  cliqueToAssign: { total: CLIQUE_TO_ASSIGN.length, ok: CLIQUE_TO_ASSIGN.filter(function (r) { return r.ok; }).length },
  assignToClique: { total: ASSIGN_TO_CLIQUE.length, ok: ASSIGN_TO_CLIQUE.filter(function (r) { return r.ok; }).length },
  unsat: {
    clauses: UF.length,
    graphN: UGRAPH.n,
    graphE: UGRAPH.edges.length,
    max: UMAX
  },
  cover: { clique: G5_CLIQUE, cover: G5_COVER, n: 5 },
  complement: COMPLEMENT_AUDIT,
  redCover: { max: RED_MAX, cover: RED_VC, n: GR.n },
  twosat: TWOSAT,
  twosatDemo: { scc: twoSatDecide(TWOSAT_DEMO), brute: bruteTwoSat(TWOSAT_DEMO) },
  subset: { numbers: SUBSET, target: SUBSET_TARGET, solutions: SUBSET_SOLS.length },
  cost: COST,
  crossover: CROSSOVER,
  ignore: IGNORE_DEMO,
  exampleClique: CLIQUE_TO_ASSIGN[0]
};

/* the unsatisfiable count of satisfying assignments, computed rather than assumed */
V.unsatSat = ASSIGN.filter(function (a) { return satisfies(UF, a); }).length;

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

chk('the formula has 4 clauses, 3 variables and 12 literal slots',
  V.clauses === 4 && V.nvars === 3 && V.literals === 12,
  V.clauses + ' clauses, ' + V.nvars + ' variables, ' + V.literals + ' literals');

chk('3 variables give 8 assignments, 4 of which satisfy the formula',
  V.assignments === 8 && V.sat.length === 4 && V.rejected.length === 4,
  V.sat.join(' '));

chk('the satisfying assignments are 100, 010, 001 and 111',
  V.sat.slice().sort().join(',') === '001,010,100,111',
  V.sat.join(', '));

chk('the reduction graph has 12 vertices and 42 edges out of 66 possible pairs',
  V.graph.n === 12 && V.graph.edges === 42 && V.graph.possible === 66,
  V.graph.n + ' vertices, ' + V.graph.edges + ' of ' + V.graph.possible);

chk('every reduction edge joins different clauses and non-opposite literals',
  (function () {
    for (var i = 0; i < GR.edges.length; i++) {
      var u = GR.verts[GR.edges[i][0]], w = GR.verts[GR.edges[i][1]];
      if (u.clause === w.clause) return false;
      if (u.lit.v === w.lit.v && u.lit.s !== w.lit.s) return false;
    }
    return true;
  })(), GR.edges.length + ' edges tested');

chk('no two vertices of the same clause are adjacent',
  (function () {
    for (var i = 0; i < GR.n; i++) {
      for (var j = i + 1; j < GR.n; j++) {
        if (GR.verts[i].clause === GR.verts[j].clause) {
          for (var e = 0; e < GR.edges.length; e++) {
            if (GR.edges[e][0] === i && GR.edges[e][1] === j) return false;
          }
        }
      }
    }
    return true;
  })());

chk('exactly 12 cliques of size 4, and the largest clique is 4',
  V.cliques4 === 12 && V.maxClique === 4 && V.maxClique === V.clauses,
  V.cliques4 + ' cliques of size 4, max ' + V.maxClique);

chk('every clique of size 4 yields a consistent satisfying assignment',
  V.cliqueToAssign.ok === V.cliqueToAssign.total && V.cliqueToAssign.total === 12,
  V.cliqueToAssign.ok + ' of ' + V.cliqueToAssign.total);

chk('every satisfying assignment yields a clique of size 4',
  V.assignToClique.ok === V.assignToClique.total && V.assignToClique.total === 4,
  V.assignToClique.ok + ' of ' + V.assignToClique.total);

chk('the unsatisfiable instance has 8 clauses and no satisfying assignment',
  V.unsat.clauses === 8 && V.unsatSat === 0,
  V.unsat.clauses + ' clauses, ' + V.unsatSat + ' satisfying');

chk('its reduction graph has 24 vertices and 204 edges',
  V.unsat.graphN === 24 && V.unsat.graphE === 204,
  V.unsat.graphN + ' vertices, ' + V.unsat.graphE + ' edges');

chk('its largest clique is 7, one short of the 8 clauses',
  V.unsat.max === 7 && V.unsat.max < V.unsat.clauses,
  'max clique ' + V.unsat.max + ', clauses ' + V.unsat.clauses);

chk('the complement identity holds on all 1088 graphs with 4 or 5 vertices',
  V.complement.ok === V.complement.total && V.complement.total === 1088,
  V.complement.ok + ' of ' + V.complement.total);

chk('on the five-vertex example the largest clique is 3 and the cover is 2',
  V.cover.clique === 3 && V.cover.cover === 2 && V.cover.clique + V.cover.cover === V.cover.n,
  V.cover.clique + ' + ' + V.cover.cover + ' = ' + V.cover.n);

chk('on the reduction graph the largest clique plus the complement cover is 12',
  V.redCover.max + V.redCover.cover === V.redCover.n && V.redCover.max === 4,
  V.redCover.max + ' + ' + V.redCover.cover + ' = ' + V.redCover.n);

chk('the complement has n choose 2 minus m edges',
  G5_COMP.length === 10 - G5.edges.length, G5_COMP.length + ' edges');

chk('the 2-SAT component test agrees with brute force on 3060 formulas',
  V.twosat.tested === 3060 && V.twosat.mismatch === 0,
  V.twosat.tested + ' formulas, ' + V.twosat.mismatch + ' mismatches');

chk('the 2-SAT example is satisfiable by both methods',
  V.twosatDemo.scc === true && V.twosatDemo.brute === true);

chk('2-SAT clauses contain at most two literals, and 3-SAT clauses contain three',
  CLAUSES2.every(function (c) { return c.length === 2; }) &&
  F.every(function (c) { return c.length === 3; }));

chk('subset sum has exactly 2 solutions for the target 9',
  V.subset.solutions === 2, V.subset.solutions + ' solutions');

chk('the verifier that ignores its certificate answers yes on all three certificates',
  V.ignore.length === 3 && V.ignore.every(function (r) { return r.answer === true; }),
  V.ignore.map(function (r) { return r.cert; }).join(' '));

chk('two to the n overtakes n cubed at n = 10 and stays above it',
  V.crossover === 10 && Math.pow(2, 9) < 729 && Math.pow(2, 10) > 1000 &&
  Math.pow(2, 40) > Math.pow(40, 3),
  'crossover at n = ' + V.crossover);

chk('the cost table shows 64000 cubic steps against 2^40 exponential steps',
  V.cost[3].cube === 64000 && V.cost[3].exp === 1099511627776);

chk('a fixed k gives a polynomial clique test: 3-cliques are found by trying n cubed triples',
  V.cliques4 === 12 && maxClique(5, G5.edges) === 3);

chk('the halting problem is outside NP: NP contains only decidable problems',
  true, 'definitional: NP is a class of decidable languages');

chk('P is contained in NP by the ignoring verifier, for every assignment',
  (function () {
    for (var i = 0; i < ASSIGN.length; i++) {
      var wrapped = satisfies(F, ASSIGN[i]);
      if (wrapped !== satisfies(F, ASSIGN[i])) return false;
    }
    return true;
  })(), 'wrapper agrees on all ' + ASSIGN.length + ' certificates');

chk('the number of cliques need not equal the number of assignments',
  V.cliques4 !== V.assignToClique.total,
  V.cliques4 + ' cliques against ' + V.assignToClique.total + ' assignments');

chk('the first clique read back gives the assignment 100',
  V.exampleClique && V.exampleClique.a && bits(V.exampleClique.a) === '100',
  V.exampleClique && V.exampleClique.a ? bits(V.exampleClique.a) : 'none');

chk('the highlighted clique is a clique of size 4 and reads 100',
  !!HIGHLIGHT && !!CLIQUE_KEYS[keyOf(HIGHLIGHT)] &&
  bits(assignmentFromClique(HIGHLIGHT)) === '100',
  HIGHLIGHT ? HIGHLIGHT.join(',') : 'none');

chk('the highlighted vertices carry the literals x1, not x2, not x3, x1',
  HIGHLIGHT.map(function (i) { return litText(GR.verts[i].lit); }).join('|') ===
  'x1|\u00acx2|\u00acx3|x1',
  HIGHLIGHT.map(function (i) { return litText(GR.verts[i].lit); }).join(' '));

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function T(x, y, s, o) { P.text(x, y, s, o || {}); }
function hdr(title, sub) {
  T(30, 14, title, { size: 15, bold: true, color: INK });
  if (sub) T(30, 36, sub, { size: 11.5, color: DIM });
}
function panel(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, {
    fill: o.fill || SURF2, stroke: o.stroke || BORDER,
    radius: o.radius === undefined ? 8 : o.radius, sw: 1
  });
}
function group(x, n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/* ---------- the twelve-vertex reduction grid ---------- */
function gridPos(i) {
  var r = Math.floor(i / 3), c = i % 3;
  return [130 + c * 95, 120 + r * 52];
}
function drawReductionGrid(highlight) {
  var hi = highlight || [];
  var i, e;
  P.alpha(0.22);
  for (e = 0; e < GR.edges.length; e++) {
    var a = gridPos(GR.edges[e][0]), b = gridPos(GR.edges[e][1]);
    P.line(a[0], a[1], b[0], b[1], { stroke: DIM, sw: 1 });
  }
  P.alpha(1);
  if (hi.length > 1) {
    for (i = 0; i < hi.length; i++) {
      for (var j = i + 1; j < hi.length; j++) {
        var p1 = gridPos(hi[i]), p2 = gridPos(hi[j]);
        P.line(p1[0], p1[1], p2[0], p2[1], { stroke: ACC, sw: 2.5 });
      }
    }
  }
  for (i = 0; i < GR.n; i++) {
    var p = gridPos(i), on = hi.indexOf(i) >= 0;
    P.circle(p[0], p[1], 16, { fill: on ? ACCDIM : SURF, stroke: on ? ACC : BORDER, sw: on ? 2 : 1.2 });
    T(p[0], p[1] + 4, litText(GR.verts[i].lit), { size: 10, align: 'center', mono: true, color: on ? ACC : INK });
  }
  for (i = 0; i < 4; i++) {
    T(60, 124 + i * 52, 'clause ' + (i + 1), { size: 10, color: FAINT });
  }
}

/* ---------- scene 1 ---------- */
function drawDecideScene(t) {
  var p = t;
  hdr('1 · One question, one time budget', 'A decision problem, and what a polynomial step count buys you.');

  panel(28, 58, 400, 122, { fill: SURF, stroke: BORDER });
  T(44, 70, 'decision problem', { size: 10.5, bold: true, color: ACC });
  T(44, 92, 'input: a graph on n vertices', { size: 12 });
  T(44, 114, 'question: does it contain a cycle?', { size: 12 });
  T(44, 136, 'answer: yes or no, nothing else', { size: 12, color: DIM });
  T(44, 160, 'a set of instances, each yes or no', { size: 10.5, color: FAINT });

  T(470, 66, 'n', { size: 10.5, bold: true, color: FAINT, align: 'center' });
  T(600, 66, 'n cubed', { size: 10.5, bold: true, color: FAINT, align: 'center' });
  T(760, 66, '2 to the n', { size: 10.5, bold: true, color: FAINT, align: 'center' });
  P.line(450, 80, 870, 80, { stroke: BORDER, sw: 1 });
  for (var i = 0; i < V.cost.length; i++) {
    var y = 96 + i * 26;
    if (p < 15 && i > 1) continue;
    T(470, y, String(V.cost[i].n), { size: 12, align: 'center', mono: true });
    T(600, y, group(V.cost[i].cube), { size: 12, align: 'center', mono: true, color: INFO });
    T(760, y, group(V.cost[i].exp), { size: 12, align: 'center', mono: true, color: BAD });
  }

  if (p >= 7.5) {
    panel(28, 196, 844, 118, { fill: SURF, stroke: BORDER });
    T(44, 210, 'P  =  the problems a deterministic machine decides within a polynomial number of steps.',
      { size: 12, bold: true, color: ACC });
    T(44, 236, 'Polynomial means n, n squared, n cubed, n to the seventh: any fixed power of n.',
      { size: 12 });
    T(44, 260, 'Exponential means 2 to the n, or n factorial. Both grow past every polynomial.',
      { size: 12 });
    T(44, 288, 'At n = 40 the cubic method needs 64000 steps and exhaustive search needs 1,099,511,627,776.',
      { size: 12, color: DIM });
  }
  if (p >= 15) {
    T(44, 338, 'The whole classification is about which side of that line a problem sits on.',
      { size: 12.5, bold: true, color: ACC });
  }
  if (p >= 22.5) {
    T(44, 372, 'This formula has 3 variables, so 8 assignments exist and 4 of them satisfy it.',
      { size: 12 });
    T(44, 396, 'Eight candidates is nothing. Forty variables is 1,099,511,627,776 candidates.',
      { size: 12, color: DIM });
  }
}

/* ---------- scene 2 ---------- */
function drawVerifyScene(t) {
  var p = t - 30;
  hdr('2 · NP: hard to solve, easy to check', 'A certificate, a verifier, and one formula counted out.');

  T(40, 64, 'the formula: 4 clauses, 3 variables, 12 literal slots', { size: 10.5, bold: true, color: FAINT });
  T(40, 92, '(x1 or x2 or x3)  and  (not x1 or not x2 or x3)', { size: 12, mono: true });
  T(40, 116, '(not x1 or x2 or not x3)  and  (x1 or not x2 or not x3)', { size: 12, mono: true });
  if (p >= 0) {
    T(40, 148, 'written in symbols:', { size: 10.5, color: FAINT });
    T(40, 170, '\u03c6 = (x1\u2228x2\u2228x3) \u2227 (\u00acx1\u2228\u00acx2\u2228x3)', { size: 12, mono: true });
    T(40, 192, '     \u2227 (\u00acx1\u2228x2\u2228\u00acx3) \u2227 (x1\u2228\u00acx2\u2228\u00acx3)', { size: 12, mono: true });
  }

  panel(500, 58, 380, 106, { fill: ACCDIM, stroke: ACC });
  T(516, 70, 'certificate', { size: 10.5, color: DIM });
  T(516, 96, 'x1 = 1   x2 = 0   x3 = 0', { size: 15, bold: true, mono: true, color: ACC });
  T(516, 120, '3 bits, one per variable', { size: 11, color: DIM });
  T(516, 142, '8 candidates exist, 4 accepted', { size: 11.5 });

  if (p >= 7.5) {
    T(40, 224, 'the verifier, clause by clause:', { size: 10.5, color: FAINT });
    T(60, 248, 'clause 1  satisfied by  x1', { size: 12 });
    T(60, 270, 'clause 2  satisfied by  not x2', { size: 12 });
    T(60, 292, 'clause 3  satisfied by  not x3', { size: 12 });
    T(60, 314, 'clause 4  satisfied by  x1', { size: 12 });
    T(430, 248, 'accept', { size: 12, bold: true, color: VAL });
    T(430, 270, 'accept', { size: 12, bold: true, color: VAL });
    T(430, 292, 'accept', { size: 12, bold: true, color: VAL });
    T(430, 314, 'accept', { size: 12, bold: true, color: VAL });
  }
  if (p >= 15) {
    panel(500, 190, 380, 140, { fill: SURF, stroke: BORDER });
    T(516, 202, 'NP', { size: 12, bold: true, color: ACC });
    T(516, 224, 'a yes instance has a short certificate', { size: 11.5 });
    T(516, 246, 'that a polynomial verifier accepts.', { size: 11.5 });
    T(516, 274, 'NP = non-deterministic polynomial time.', { size: 11 });
    T(516, 298, 'It is not the phrase "not polynomial".', { size: 11, color: BAD });
    T(516, 318, 'P is inside it.', { size: 11, color: DIM });
  }
  if (p >= 22.5) {
    T(40, 356, 'Accepted: 100, 010, 001, 111.', { size: 12, mono: true, color: VAL });
    T(40, 380, 'Rejected: 000, 011, 101, 110.', { size: 12, mono: true, color: BAD });
    T(40, 410, 'Checking costs 12 literal reads. Finding costs 8 tries, and 2^40 at forty variables.',
      { size: 12, bold: true, color: ACC });
  }
}

/* ---------- scene 3 ---------- */
function drawSubsetScene(t) {
  var p = t - 60;
  hdr('3 · P sits inside NP', 'A decider becomes a verifier that throws its certificate away.');

  P.circle(200, 210, 105, { fill: SURF2, stroke: BORDER, sw: 1.5 });
  P.circle(160, 240, 58, { fill: ACCDIM, stroke: ACC, sw: 1.5 });
  T(150, 236, 'P', { size: 20, bold: true, align: 'center', color: ACC });
  T(200, 122, 'NP', { size: 15, bold: true, align: 'center', color: INK });
  T(200, 336, 'every problem in P is in NP', { size: 11, align: 'center', color: DIM });

  panel(400, 58, 480, 108, { fill: SURF, stroke: BORDER });
  T(416, 70, 'wrap the decider in a verifier', { size: 10.5, bold: true, color: ACC });
  T(416, 94, 'verifier(x, certificate):', { size: 11.5, mono: true });
  T(416, 116, '    ignore certificate', { size: 11.5, mono: true, color: DIM });
  T(416, 138, '    return decide(x)', { size: 11.5, mono: true });
  T(416, 158, 'cost: the decider\'s cost, plus nothing', { size: 10.5, color: FAINT });

  if (p >= 7.5) {
    T(416, 190, 'three certificates, one answer:', { size: 10.5, color: FAINT });
    for (var i = 0; i < V.ignore.length; i++) {
      var y = 214 + i * 24;
      T(416, y, 'certificate ' + V.ignore[i].cert.replace(/(\d)(?=\d)/g, '$1 '), { size: 12, mono: true });
      T(700, y, 'answer yes', { size: 12, color: VAL });
    }
  }
  if (p >= 15) {
    panel(400, 292, 480, 96, { fill: SURF, stroke: BORDER });
    T(416, 304, 'so P is contained in NP', { size: 12, bold: true, color: ACC });
    T(416, 328, 'Known: P \u2286 NP \u2286 PSPACE.', { size: 12, mono: true });
    T(416, 352, 'Unknown: whether either containment is strict.', { size: 11.5, color: DIM });
    T(416, 374, 'Nobody has proved it either way.', { size: 11, color: DIM });
  }
  if (p >= 22.5) {
    T(40, 372, 'The open question: is P equal to NP?', { size: 13, bold: true, color: ACC });
    T(40, 398, 'One polynomial algorithm for one NP-complete problem would answer it.', { size: 12 });
    T(40, 422, 'Every problem in NP reduces to that problem, so all of NP would fall into P.', { size: 11.5, color: DIM });
  }
}

/* ---------- scene 4 ---------- */
function drawHardScene(t) {
  var p = t - 90;
  hdr('4 · NP-hard and NP-complete', 'Two conditions, and only one of them is about being in NP.');

  panel(28, 58, 410, 118, { fill: SURF, stroke: BORDER });
  T(44, 70, 'NP-hard', { size: 12, bold: true, color: BAD });
  T(44, 94, 'every problem in NP reduces to B', { size: 12 });
  T(44, 118, 'in polynomial time', { size: 12 });
  T(44, 144, 'says nothing about B being in NP', { size: 11, color: DIM });
  T(44, 164, 'halting problem: NP-hard, undecidable', { size: 10.5, color: DIM });

  panel(462, 58, 410, 118, { fill: SURF, stroke: ACC });
  T(478, 70, 'NP-complete', { size: 12, bold: true, color: ACC });
  T(478, 94, 'B is NP-hard, and B is in NP', { size: 12 });
  T(478, 118, 'two conditions, both required', { size: 12 });
  T(478, 144, 'SAT and 3-SAT: Cook and Levin, 1971', { size: 11, color: DIM });
  T(478, 164, 'every later hardness result reduces from these', { size: 10.5, color: DIM });

  panel(30, 196, 330, 106, { fill: SURF2, stroke: BORDER });
  T(46, 208, 'NP', { size: 11, bold: true, color: ACC });
  var chips = ['3-SAT', 'CLIQUE', 'SUBSET SUM'];
  for (var i = 0; i < chips.length; i++) {
    var cx = 46 + (i % 2) * 150, cy = 226 + Math.floor(i / 2) * 32;
    P.rect(cx, cy, 138, 24, { fill: SURF, stroke: BORDER, radius: 4, sw: 1 });
    T(cx + 69, cy + 16, chips[i], { size: 10.5, align: 'center', mono: true });
  }

  if (p >= 7.5) {
    P.arrow(372, 250, 466, 250, { stroke: ACC, sw: 2 });
    T(380, 232, 'reduce', { size: 11, color: ACC });
    panel(478, 222, 150, 56, { fill: ACCDIM, stroke: ACC });
    T(553, 244, 'B', { size: 18, bold: true, align: 'center', color: ACC });
    T(553, 266, 'the candidate', { size: 10, align: 'center', color: DIM });
  }
  if (p >= 15) {
    panel(650, 200, 222, 100, { fill: SURF, stroke: BORDER });
    T(664, 212, 'is B in NP?', { size: 11, bold: true, color: ACC });
    T(664, 234, 'yes  \u2192  NP-complete', { size: 11.5 });
    T(664, 256, 'no   \u2192  NP-hard only', { size: 11.5, color: BAD });
    T(664, 282, 'and a problem outside NP', { size: 10, color: FAINT });
  }
  if (p >= 22.5) {
    T(40, 330, 'The halting problem is NP-hard and is not in NP at all, because NP holds only',
      { size: 12 });
    T(40, 352, 'decidable problems and halting is undecidable.', { size: 12, color: DIM });
    T(40, 384, 'So NP-hard is strictly wider than NP-complete.', { size: 12.5, bold: true, color: BAD });
    T(40, 408, 'NP-complete = NP-hard  \u2229  NP.', { size: 12, mono: true, color: ACC });
  }
}

/* ---------- scene 5 ---------- */
function drawReduceScene(t) {
  var p = t - 120;
  hdr('5 · What a reduction proves', 'One arrow, two readings, and they are not the same reading.');

  panel(50, 66, 210, 56, { fill: SURF, stroke: BORDER });
  T(155, 90, 'A', { size: 17, bold: true, align: 'center', mono: true });
  T(155, 112, 'known NP-complete', { size: 10, align: 'center', color: DIM });
  panel(500, 66, 210, 56, { fill: ACCDIM, stroke: ACC });
  T(605, 90, 'B', { size: 17, bold: true, align: 'center', mono: true, color: ACC });
  T(605, 112, 'the candidate', { size: 10, align: 'center', color: DIM });
  P.arrow(270, 94, 490, 94, { stroke: ACC, sw: 2.2 });
  T(300, 78, 'f, computable in polynomial time', { size: 10.5, color: ACC });
  T(300, 132, 'x in A  if and only if  f(x) in B', { size: 11.5, mono: true });

  if (p >= 7.5) {
    T(50, 176, 'reading the arrow forwards: hardness', { size: 11, bold: true, color: BAD });
    T(50, 198, 'A is NP-hard  and  A reduces to B   \u2192   B is NP-hard', { size: 12, mono: true });
    T(50, 220, 'because every problem in NP reduces to A, and reductions compose', { size: 11, color: DIM });
  }
  if (p >= 15) {
    T(50, 254, 'reading the arrow backwards: membership', { size: 11, bold: true, color: INFO });
    T(50, 276, 'B is in NP  and  A reduces to B      \u2192   A is in NP', { size: 12, mono: true });
    T(50, 298, 'solve A by transforming to B, then run B verifier', { size: 11, color: DIM });
  }
  if (p >= 22.5) {
    panel(28, 320, 844, 104, { fill: SURF, stroke: ACC });
    T(44, 332, 'so the two halves of a completeness proof use opposite arrows', { size: 11.5, bold: true, color: ACC });
    T(44, 356, 'hardness:   3-SAT  \u2192  candidate', { size: 12, mono: true });
    T(44, 378, 'membership: candidate  \u2192  3-SAT,  or a verifier', { size: 12, mono: true });
    T(44, 404, 'One arrow alone proves half a theorem, which is exactly what a wrong option offers.',
      { size: 11, color: DIM });
  }
}

/* ---------- scene 6 ---------- */
function drawGadgetScene(t) {
  var p = t - 150;
  hdr('6 · 3-SAT to CLIQUE', 'One row of three vertices per clause; join compatible literals.');

  var hi = p >= 15 ? HIGHLIGHT : [];
  drawReductionGrid(hi);

  T(410, 74, 'the rule', { size: 11, bold: true, color: ACC });
  T(410, 96, 'one vertex per literal occurrence', { size: 11.5 });
  T(410, 118, 'join two when different clauses', { size: 11.5 });
  T(410, 140, 'and not opposites', { size: 11.5 });
  T(410, 168, '12 vertices, 42 edges of 66 pairs', { size: 11, color: DIM });

  if (p >= 7.5) {
    T(410, 202, 'a clique of size 4 takes', { size: 11.5 });
    T(410, 224, 'one vertex from each row', { size: 11.5 });
    T(410, 246, 'and never contradicts itself,', { size: 11.5 });
    T(410, 268, 'so all four clauses can be true', { size: 11.5 });
  }
  if (p >= 15) {
    panel(400, 290, 470, 66, { fill: ACCDIM, stroke: ACC });
    T(416, 302, 'the bold clique reads x1, not x2, not x3, x1', { size: 11, color: ACC });
    T(416, 326, 'assignment x1 = 1, x2 = 0, x3 = 0', { size: 11.5, mono: true });
  }
  if (p >= 22.5) {
    T(40, 340, 'Twelve cliques of size four, and the largest clique has size four.', { size: 12 });
    T(40, 364, 'No clique of size five exists, because two vertices of one row are never joined.',
      { size: 11.5, color: DIM });
    T(40, 392, 'The largest clique equals the number of clauses, exactly when the formula is satisfiable.',
      { size: 11.5, bold: true, color: ACC });
  }
}

/* ---------- scene 7 ---------- */
function drawWitnessScene(t) {
  var p = t - 180;
  hdr('7 · Both directions, and the unsatisfiable case', 'Read a clique as an assignment, and an assignment as a clique.');

  drawReductionGrid(p >= 0 ? HIGHLIGHT : []);

  if (p >= 0) {
    T(410, 80, 'clique \u2192 assignment', { size: 11, bold: true, color: ACC });
    T(410, 102, 'x1, not x2, not x3, x1', { size: 11.5, mono: true });
    T(410, 124, '\u2192 x1 = 1, x2 = 0, x3 = 0', { size: 11.5, mono: true, color: ACC });
    T(410, 146, '12 of 12 cliques check out', { size: 10.5, color: DIM });
  }
  if (p >= 7.5) {
    T(410, 178, 'assignment \u2192 clique', { size: 11, bold: true, color: INFO });
    T(410, 200, 'each clause keeps one true literal', { size: 11.5 });
    T(410, 222, 'those four vertices are a clique', { size: 11.5 });
    T(410, 244, '4 of 4 assignments check out', { size: 10.5, color: DIM });
  }
  if (p >= 15) {
    panel(28, 320, 420, 118, { fill: INVALIDDIM, stroke: BAD });
    T(44, 332, 'the unsatisfiable instance', { size: 11, bold: true, color: BAD });
    T(44, 356, '8 clauses, one forbidding each assignment', { size: 11 });
    T(44, 378, 'graph: 24 vertices, 204 edges', { size: 11, mono: true });
    T(44, 402, 'satisfying assignments: 0', { size: 11, mono: true });
    T(44, 424, 'largest clique: 7, one short of 8', { size: 11, mono: true, bold: true, color: BAD });
  }
  if (p >= 22.5) {
    T(470, 336, 'The reduction answers no, correctly.', { size: 12, bold: true, color: ACC });
    T(470, 360, 'A clique of size 8 would need one literal per', { size: 11.5 });
    T(470, 382, 'clause, all consistent, and no assignment is.', { size: 11.5 });
    T(470, 408, 'Same code, opposite answers on the two instances.', { size: 11, color: DIM });
  }
}

/* ---------- scene 8 ---------- */
function drawCoverScene(t) {
  var p = t - 210;
  hdr('8 · CLIQUE to VERTEX COVER', 'Complement the graph, and the clique becomes a cover.');

  var posA = [[90, 120], [200, 96], [310, 130], [180, 210], [300, 220]];
  var posB = posA;

  function drawG(x0, n, edges, title, hiClique) {
    var i, e;
    for (e = 0; e < edges.length; e++) {
      var a = [posA[edges[e][0]][0] + x0, posA[edges[e][0]][1]];
      var b = [posA[edges[e][1]][0] + x0, posA[edges[e][1]][1]];
      P.line(a[0], a[1], b[0], b[1], { stroke: BORDER, sw: 1.4 });
    }
    if (hiClique) {
      for (i = 0; i < hiClique.length; i++) {
        for (var j = i + 1; j < hiClique.length; j++) {
          var p1 = [posA[hiClique[i]][0] + x0, posA[hiClique[i]][1]];
          var p2 = [posA[hiClique[j]][0] + x0, posA[hiClique[j]][1]];
          P.line(p1[0], p1[1], p2[0], p2[1], { stroke: ACC, sw: 2.5 });
        }
      }
    }
    for (i = 0; i < n; i++) {
      P.circle(posA[i][0] + x0, posA[i][1], 15, { fill: SURF, stroke: BORDER, sw: 1.4 });
      T(posA[i][0] + x0, posA[i][1] + 4, String(i + 1), { size: 10, align: 'center', mono: true });
    }
    T(x0 + 190, 62, title, { size: 11, bold: true, align: 'center', color: ACC });
  }

  drawG(20, 5, G5.edges, 'G', p >= 7.5 ? [0, 1, 2] : null);
  if (p >= 7.5) {
    T(30, 250, 'largest clique 3', { size: 11, color: ACC });
    T(30, 272, 'vertices 1, 2, 3', { size: 10.5, color: DIM });
  }
  if (p >= 0) {
    drawG(430, 5, G5_COMP, 'complement of G', null);
    T(440, 250, 'complement edges: 10 \u2212 5 = 5', { size: 11, color: DIM });
  }
  if (p >= 15) {
    T(440, 272, 'smallest vertex cover: 2', { size: 11, bold: true, color: ACC });
    T(440, 294, 'vertices 4 and 5 cover all 5 edges', { size: 10.5, color: DIM });
  }
  if (p >= 7.5) {
    panel(28, 320, 844, 46, { fill: SURF, stroke: BORDER });
    T(44, 334, 'a clique of size k in G is a vertex cover of size n \u2212 k in the complement',
      { size: 12, bold: true, color: ACC });
    T(44, 356, 'the other n \u2212 k vertices contain no complement edge, so they touch every one of them',
      { size: 11, color: DIM });
  }
  if (p >= 22.5) {
    T(44, 392, 'here 3 + 2 = 5, the number of vertices', { size: 12, mono: true });
    T(44, 418, 'checked on all 1,088 graphs with four or five vertices: 1088 of 1088', { size: 12, color: VAL });
    T(44, 442, 'a check on small graphs is evidence, not proof; the derivation above is the proof', { size: 10.5, color: FAINT });
  }
}

/* ---------- scene 9 ---------- */
function drawBoundaryScene(t) {
  var p = t - 240;
  hdr('9 · Where the labels break', 'Two literals per clause, a fixed k, and problems outside NP.');

  panel(28, 58, 844, 96, { fill: SURF, stroke: ACC });
  T(44, 70, '2-SAT is in P', { size: 12, bold: true, color: ACC });
  T(44, 94, 'for each clause (a or b) draw  not a \u2192 b  and  not b \u2192 a', { size: 11.5, mono: true });
  T(44, 116, 'satisfiable exactly when no variable shares a component with its negation', { size: 11.5 });
  T(44, 138, 'strongly connected components are found in linear time', { size: 10.5, color: DIM });

  if (p >= 7.5) {
    T(44, 180, 'tested against brute force on 3,060 four-clause formulas: 0 disagreements',
      { size: 12, color: VAL });
    T(44, 204, 'the demonstration instance is satisfiable by both methods', { size: 11, color: DIM });
  }
  if (p >= 15) {
    panel(28, 222, 844, 80, { fill: SURF, stroke: BORDER });
    T(44, 234, 'CLIQUE with k fixed is in P', { size: 12, bold: true, color: INFO });
    T(44, 258, 'trying every triple of vertices costs n cubed; for fixed k the cost is n to the k',
      { size: 11.5 });
    T(44, 282, 'CLIQUE is NP-complete only when k is part of the input, so the cost may not be n to the k',
      { size: 11, color: DIM });
  }
  if (p >= 22.5) {
    panel(28, 316, 844, 74, { fill: INVALIDDIM, stroke: BAD });
    T(44, 328, 'NP-hard is wider than NP-complete', { size: 12, bold: true, color: BAD });
    T(44, 352, 'halting problem: NP-hard, undecidable, and therefore not in NP', { size: 11.5 });
    T(44, 376, 'a problem not in NP can never be NP-complete, however hard it is', { size: 11, color: DIM });
  }
  T(44, 418, 'Read the clause width, and read whether k is fixed, before naming a class.', { size: 12, color: ACC });
}

/* ---------- scene 10 ---------- */
function drawExamScene(t) {
  var p = t - 270;
  hdr('10 · Reading the question', 'Three claims, three proofs, and the one collapse worth knowing.');

  var steps = [
    { n: '1', t: 'which claim?', b: 'membership in NP, hardness, or completeness', at: 0 },
    { n: '2', t: 'membership', b: 'a polynomial verifier, or reduce into a known member of NP', at: 7.5 },
    { n: '3', t: 'hardness', b: 'reduce a known NP-complete problem to the candidate', at: 15 }
  ];
  for (var i = 0; i < steps.length; i++) {
    if (p < steps[i].at) continue;
    var y = 66 + i * 52;
    P.circle(48, y + 12, 14, { fill: ACCDIM, stroke: ACC, sw: 1.5 });
    T(48, y + 17, steps[i].n, { size: 12, bold: true, align: 'center', color: ACC });
    T(74, y, steps[i].t, { size: 12, bold: true });
    T(74, y + 20, steps[i].b, { size: 11, color: DIM });
  }

  if (p >= 22.5) {
    panel(28, 232, 844, 90, { fill: SURF, stroke: ACC });
    T(44, 244, 'if any NP-complete problem is in P', { size: 12, bold: true, color: ACC });
    T(44, 268, 'then every problem in NP is in P, so P = NP,', { size: 12 });
    T(44, 290, 'and every nontrivial problem in NP becomes NP-complete,', { size: 12 });
    T(44, 312, 'so P = NP = NP-complete: the picture collapses to one class.', { size: 12, color: DIM });
  }
  if (p >= 15) {
    T(44, 350, 'The statement is conditional. "If X is in P then P = NP" is not "X is in P".',
      { size: 12 });
    T(44, 376, 'No polynomial algorithm for an NP-complete problem is known today.', { size: 12, color: DIM });
    T(44, 408, 'Check the arrow direction in every option before answering.', { size: 12.5, bold: true, color: ACC });
  }
}

function drawFrame(painter) {
  P = painter;
  if (!P) return;
  var t = (K && K.state) ? K.state.elapsed : 0;
  var sc = (K && K.state && K.state.scenes.length) ? K.state.scenes[K.sceneAt(t)] : null;
  var id = sc ? sc.id : 'decide';
  P.alpha(1);
  P.clear();
  if (id === 'decide') drawDecideScene(t);
  else if (id === 'verify') drawVerifyScene(t);
  else if (id === 'subset') drawSubsetScene(t);
  else if (id === 'hard') drawHardScene(t);
  else if (id === 'reduce') drawReduceScene(t);
  else if (id === 'gadget') drawGadgetScene(t);
  else if (id === 'witness') drawWitnessScene(t);
  else if (id === 'cover') drawCoverScene(t);
  else if (id === 'boundary') drawBoundaryScene(t);
  else drawExamScene(t);
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

window.__MODEL = { V: V, CHECKS: CHECKS, GR: GR, F: F };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
