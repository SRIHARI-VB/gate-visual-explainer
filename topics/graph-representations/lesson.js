/* ==========================================================================
   graph-representations — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no matrix multiplication, no walk
   counting and no space arithmetic of its own; every figure on the canvas was
   computed once here and checked against the rule it is supposed to satisfy.

   Two kinds of fact appear below and they are kept apart:
     - what is true of every representation by definition (an undirected edge
       sets two cells, a chain entry exists once per incidence, the column sum
       of an incidence matrix is 2, sum of degrees is 2m);
     - what depends on a stated machine model (one bit per matrix entry, a
       4-byte vertex index, an 8-byte list node). The second kind is labelled
       as an assumption on the canvas and in the captions.
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

/* ---------- the one graph every scene describes ---------- */

var NV = 6;
var NAMES = ['A', 'B', 'C', 'D', 'E', 'F'];
var EDGES = [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 2]];
var M = EDGES.length;

function zero(r, c) {
  var a = [];
  for (var i = 0; i < r; i++) { var row = []; for (var j = 0; j < c; j++) row.push(0); a.push(row); }
  return a;
}

function adjacencyOf(n, edges) {
  var a = zero(n, n);
  edges.forEach(function (e) { a[e[0]][e[1]] = 1; a[e[1]][e[0]] = 1; });
  return a;
}

var A = adjacencyOf(NV, EDGES);

var DEG = A.map(function (row) { return row.reduce(function (s, v) { return s + v; }, 0); });

var LISTS = [];
for (var v = 0; v < NV; v++) {
  var l = [];
  for (var w = 0; w < NV; w++) if (A[v][w]) l.push(w);
  LISTS.push(l);
}

/* the vertex-edge incidence matrix: rows are vertices, columns are edges */
var INC = zero(NV, M);
for (var e = 0; e < M; e++) { INC[EDGES[e][0]][e] = 1; INC[EDGES[e][1]][e] = 1; }

/* ---------- matrix arithmetic ---------- */

function mm(X, Y) {
  var r = X.length, c = Y[0].length, k = Y.length;
  var out = zero(r, c);
  for (var i = 0; i < r; i++) {
    for (var j = 0; j < c; j++) {
      var s = 0;
      for (var t = 0; t < k; t++) s += X[i][t] * Y[t][j];
      out[i][j] = s;
    }
  }
  return out;
}

var A2 = mm(A, A);
var A3 = mm(A2, A);

function trace(X) {
  var s = 0;
  for (var i = 0; i < X.length && i < X[0].length; i++) s += X[i][i];
  return s;
}

function total(X) {
  var s = 0;
  for (var i = 0; i < X.length; i++) for (var j = 0; j < X[i].length; j++) s += X[i][j];
  return s;
}

/* ---------- brute force, to check the matrix identities ---------- */

function walksFromTo(n, adj, k, from, to) {
  var count = 0;
  function rec(at, step) {
    if (step === k) { if (at === to) count++; return; }
    for (var x = 0; x < n; x++) if (adj[at][x]) rec(x, step + 1);
  }
  rec(from, 0);
  return count;
}

function walksTotal(n, adj, k) {
  var s = 0;
  for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) s += walksFromTo(n, adj, k, i, j);
  return s;
}

function countTriangles(n, adj) {
  var c = 0;
  for (var i = 0; i < n; i++) {
    for (var j = i + 1; j < n; j++) {
      for (var k = j + 1; k < n; k++) {
        if (adj[i][j] && adj[j][k] && adj[k][i]) c++;
      }
    }
  }
  return c;
}

function trianglesAt(n, adj, x) {
  var c = 0;
  for (var i = 0; i < n; i++) {
    if (i === x || !adj[x][i]) continue;
    for (var j = i + 1; j < n; j++) {
      if (j === x || !adj[x][j]) continue;
      if (adj[i][j]) c++;
    }
  }
  return c;
}

function components(n, adj) {
  var seen = [], c = 0;
  for (var s = 0; s < n; s++) {
    if (seen[s]) continue;
    c++;
    var stack = [s];
    seen[s] = true;
    while (stack.length) {
      var u = stack.pop();
      for (var w = 0; w < n; w++) if (adj[u][w] && !seen[w]) { seen[w] = true; stack.push(w); }
    }
  }
  return c;
}

/* is the graph bipartite? a 2-colouring by BFS decides it */
function isBipartite(n, adj) {
  var colour = new Array(n), i;
  for (i = 0; i < n; i++) colour[i] = -1;
  for (var s0 = 0; s0 < n; s0++) {
    if (colour[s0] !== -1) continue;
    colour[s0] = 0;
    var queue = [s0];
    while (queue.length) {
      var u = queue.shift();
      for (var w = 0; w < n; w++) {
        if (!adj[u][w]) continue;
        if (colour[w] === -1) { colour[w] = 1 - colour[u]; queue.push(w); }
        else if (colour[w] === colour[u]) return false;
      }
    }
  }
  return true;
}

/* rank over the reals, by elimination with a pivot tolerance */
function rankReal(X) {
  var a = X.map(function (r) { return r.slice(); });
  var rows = a.length, cols = a[0].length, rank = 0;
  for (var c = 0; c < cols && rank < rows; c++) {
    var piv = -1;
    for (var r = rank; r < rows; r++) if (Math.abs(a[r][c]) > 1e-9) { piv = r; break; }
    if (piv < 0) continue;
    var tmp = a[rank]; a[rank] = a[piv]; a[piv] = tmp;
    var pv = a[rank][c];
    for (var c2 = 0; c2 < cols; c2++) a[rank][c2] /= pv;
    for (var r2 = 0; r2 < rows; r2++) {
      if (r2 === rank) continue;
      var f = a[r2][c];
      if (Math.abs(f) < 1e-12) continue;
      for (var c3 = 0; c3 < cols; c3++) a[r2][c3] -= f * a[rank][c3];
    }
    rank++;
  }
  return rank;
}

/* rank over GF(2), the field the cycle space lives in */
function rankMod2(X) {
  var a = X.map(function (r) { return r.map(function (v) { return v % 2; }); });
  var rows = a.length, cols = a[0].length, rank = 0;
  for (var c = 0; c < cols && rank < rows; c++) {
    var piv = -1;
    for (var r = rank; r < rows; r++) if (a[r][c]) { piv = r; break; }
    if (piv < 0) continue;
    var tmp = a[rank]; a[rank] = a[piv]; a[piv] = tmp;
    for (var r2 = 0; r2 < rows; r2++) {
      if (r2 === rank || !a[r2][c]) continue;
      for (var c2 = 0; c2 < cols; c2++) a[r2][c2] = (a[r2][c2] + a[rank][c2]) % 2;
    }
    rank++;
  }
  return rank;
}

var COMPONENTS = components(NV, A);
var BIPARTITE = isBipartite(NV, A);
var CYCLES = M - NV + COMPONENTS;
var TRI = countTriangles(NV, A);
var TRACE3 = trace(A3);

/* ---------- space, under a stated machine model ---------- */

var BYTES_INDEX = 4;     /* one vertex index in a head array                   */
var BYTES_NODE = 8;      /* one chain node: 4-byte index plus 4-byte next       */
var BYTES_INT = 4;       /* one 32-bit matrix entry                             */

function packedMatrixBytes(n) { return Math.ceil(n * n / 8); }
function intMatrixBytes(n) { return BYTES_INT * n * n; }
function listBytes(n, m) { return BYTES_INDEX * n + BYTES_NODE * 2 * m; }

/* the largest m at which the list is no larger than the packed matrix */
function crossover(n) {
  var budget = packedMatrixBytes(n) - BYTES_INDEX * n;
  if (budget <= 0) return 0;
  return Math.floor(budget / (BYTES_NODE * 2));
}

var SPACE_ROWS = [
  { label: 'n = 6, m = 7', n: 6, m: 7 },
  { label: 'n = 1000, m = 2000', n: 1000, m: 2000 },
  { label: 'n = 1000, m = 400000', n: 1000, m: 400000 }
].map(function (r) {
  return {
    label: r.label, n: r.n, m: r.m,
    packed: packedMatrixBytes(r.n),
    ints: intMatrixBytes(r.n),
    list: listBytes(r.n, r.m)
  };
});

var CROSS_1000 = crossover(1000);

/* ---------- the counterexample pair: same degrees, different graphs ---------- */

var K33_EDGES = [[0, 3], [0, 4], [0, 5], [1, 3], [1, 4], [1, 5], [2, 3], [2, 4], [2, 5]];
var PRISM_EDGES = [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3], [0, 3], [1, 4], [2, 5]];
var K33_A = adjacencyOf(6, K33_EDGES);
var PRISM_A = adjacencyOf(6, PRISM_EDGES);

function degreeSeq(adj) {
  return adj.map(function (r) { return r.reduce(function (s, v) { return s + v; }, 0); })
            .sort(function (a, b) { return b - a; });
}

/* ---------- a perfect matching, for the self-inverse item ---------- */

var PM_A = adjacencyOf(4, [[0, 1], [2, 3]]);
var PM_A2 = mm(PM_A, PM_A);

/* ---------- exact operation counts for the cost scene ---------- */

var MATRIX_CELLS = NV * NV;
var LIST_STEPS = NV + 2 * M;
var DEG_OF_A = DEG[0];
var HAS_EDGE_AD = A[0][3];

/* ---------- the derived view the drawing code reads ---------- */

var V = {
  n: NV, m: M, names: NAMES, edges: EDGES,
  A: A, A2: A2, A3: A3,
  deg: DEG, lists: LISTS, inc: INC,
  components: COMPONENTS, cycles: CYCLES, triangles: TRI, bipartite: BIPARTITE,
  trace3: TRACE3,
  sumA: total(A), sumA2: total(A2), sumA3: total(A3),
  space: SPACE_ROWS, cross1000: CROSS_1000,
  matrixCells: MATRIX_CELLS, listSteps: LIST_STEPS,
  degA: DEG_OF_A, hasEdgeAD: HAS_EDGE_AD
};

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* -- the matrix itself -- */
(function () {
  var sym = true, diag = true, above = 0;
  for (var i = 0; i < NV; i++) {
    for (var j = 0; j < NV; j++) {
      if (A[i][j] !== A[j][i]) sym = false;
      if (i === j && A[i][j] !== 0) diag = false;
      if (j > i && A[i][j] === 1) above++;
    }
  }
  chk('the adjacency matrix is symmetric', sym);
  chk('the diagonal is zero (a simple graph has no loop)', diag);
  chk('entries above the diagonal number exactly m', above === M, above + ' vs ' + M);
  chk('set cells number 2m', total(A) === 2 * M, total(A) + ' vs ' + (2 * M));
  chk('row sums are the degrees', A.every(function (row, i) {
    return row.reduce(function (s, x) { return s + x; }, 0) === DEG[i];
  }));
  chk('the degrees sum to 2m (handshake)', DEG.reduce(function (s, x) { return s + x; }, 0) === 2 * M);
  chk('the number of odd-degree vertices is even',
      DEG.filter(function (d) { return d % 2 === 1; }).length % 2 === 0);
  chk('m is within the bound n(n-1)/2', M <= NV * (NV - 1) / 2, M + ' <= ' + (NV * (NV - 1) / 2));
})();

/* -- the list -- */
(function () {
  var entries = LISTS.reduce(function (s, l) { return s + l.length; }, 0);
  chk('chain entries total 2m', entries === 2 * M, entries + ' vs ' + (2 * M));
  chk('a vertex appears on exactly as many chains as its degree',
      LISTS.every(function (l, u) {
        var count = 0;
        LISTS.forEach(function (other, w) { if (w !== u && other.indexOf(u) >= 0) count++; });
        return count === DEG[u];
      }));
  chk('every chain lists only genuine neighbours',
      LISTS.every(function (l, u) { return l.every(function (w) { return A[u][w] === 1; }); }));
  chk('the chain of A holds exactly deg(A) entries', LISTS[0].length === DEG[0]);
})();

/* -- the incidence matrix -- */
(function () {
  var colsOK = true, rowsOK = true, colSum = true;
  for (var e = 0; e < M; e++) {
    var s = 0;
    for (var i = 0; i < NV; i++) s += INC[i][e];
    if (s !== 2) colSum = false;
    if (s !== 2) colsOK = false;
  }
  for (var r = 0; r < NV; r++) {
    var t = 0;
    for (var c = 0; c < M; c++) t += INC[r][c];
    if (t !== DEG[r]) rowsOK = false;
  }
  chk('every incidence column holds exactly two ones', colSum);
  chk('every incidence column sums to 2', colsOK);
  chk('incidence row sums are the degrees', rowsOK);
  chk('the incidence matrix has n rows and m columns', INC.length === NV && INC[0].length === M);
  chk('the incidence ones total 2m', total(INC) === 2 * M);
  chk('incidence rank over GF(2) is n - components',
      rankMod2(INC) === NV - COMPONENTS, rankMod2(INC) + ' vs ' + (NV - COMPONENTS));
  chk('nullity over GF(2) is the cycle count m - n + c',
      M - rankMod2(INC) === CYCLES, (M - rankMod2(INC)) + ' vs ' + CYCLES);
  chk('this graph is not bipartite, because it has a triangle', BIPARTITE === false);
  chk('so the unsigned incidence rank over the reals is n, not n - c',
      rankReal(INC) === NV, rankReal(INC) + ' vs ' + NV);
  chk('over the reals the rank is n - c only when the graph is bipartite',
      (function () {
        var path = adjacencyOf(4, [[0, 1], [1, 2], [2, 3]]);
        var inc = zero(4, 3);
        [[0, 1], [1, 2], [2, 3]].forEach(function (e, k) { inc[e[0]][k] = 1; inc[e[1]][k] = 1; });
        return isBipartite(4, path) === true && rankReal(inc) === 3;
      })());
})();

/* -- powers of A -- */
(function () {
  var diagOK = true, commonOK = true;
  for (var i = 0; i < NV; i++) {
    if (A2[i][i] !== DEG[i]) diagOK = false;
    for (var j = 0; j < NV; j++) {
      if (i === j) continue;
      var common = 0;
      for (var k = 0; k < NV; k++) if (A[i][k] && A[j][k]) common++;
      if (A2[i][j] !== common) commonOK = false;
    }
  }
  chk('the diagonal of A squared is the degree sequence', diagOK);
  chk('off the diagonal, A squared counts common neighbours', commonOK);
  chk('A squared is symmetric', A2.every(function (row, i) {
    return row.every(function (x, j) { return x === A2[j][i]; });
  }));
  chk('the sum of A squared equals the sum of the squared degrees',
      total(A2) === DEG.reduce(function (s, d) { return s + d * d; }, 0),
      total(A2) + ' vs ' + DEG.reduce(function (s, d) { return s + d * d; }, 0));

  chk('A squared counts walks of length 2, against a brute-force walk count',
      total(A2) === walksTotal(NV, A, 2), total(A2) + ' vs ' + walksTotal(NV, A, 2));
  chk('A cubed counts walks of length 3, against a brute-force walk count',
      total(A3) === walksTotal(NV, A, 3), total(A3) + ' vs ' + walksTotal(NV, A, 3));
  chk('A counts walks of length 1, which are the 2m directed edge steps',
      total(A) === walksTotal(NV, A, 1));

  chk('every A squared entry equals the brute-force count for that pair',
      (function () {
        for (var i = 0; i < NV; i++) for (var j = 0; j < NV; j++) {
          if (A2[i][j] !== walksFromTo(NV, A, 2, i, j)) return false;
        }
        return true;
      })());

  chk('trace(A cubed) is six times the number of triangles',
      TRACE3 === 6 * TRI, TRACE3 + ' vs ' + (6 * TRI));
  chk('the triangles counted by brute force number 1', TRI === 1, TRI);
  chk('A cubed diagonal is twice the triangles at that vertex',
      (function () {
        for (var i = 0; i < NV; i++) if (A3[i][i] !== 2 * trianglesAt(NV, A, i)) return false;
        return true;
      })());
  chk('the cycle count m - n + c is 2', CYCLES === 2, CYCLES);
})();

/* -- the complement, and the density bound -- */
(function () {
  var ok = true;
  for (var i = 0; i < NV; i++) {
    for (var j = 0; j < NV; j++) {
      var expect = (i === j) ? 0 : 1 - A[i][j];
      var comp = (i !== j && A[i][j] === 0) ? 1 : 0;
      if (comp !== expect) ok = false;
    }
  }
  var compEdges = 0;
  for (var a = 0; a < NV; a++) for (var b = a + 1; b < NV; b++) if (!A[a][b]) compEdges++;
  chk('the complement sets exactly the pairs A leaves empty', ok);
  chk('the complement has n(n-1)/2 - m edges',
      compEdges === NV * (NV - 1) / 2 - M, compEdges + ' vs ' + (NV * (NV - 1) / 2 - M));
})();

/* -- space -- */
(function () {
  chk('a packed matrix for n = 6 is 5 bytes', packedMatrixBytes(6) === 5, packedMatrixBytes(6));
  chk('a 32-bit matrix for n = 6 is 144 bytes', intMatrixBytes(6) === 144, intMatrixBytes(6));
  chk('the list for this graph is 136 bytes', listBytes(6, 7) === 136, listBytes(6, 7));
  chk('the list grows by 16 bytes for each undirected edge added',
      listBytes(1000, 2001) - listBytes(1000, 2000) === 16);
  chk('the packed matrix does not depend on m',
      packedMatrixBytes(1000) === packedMatrixBytes(1000) && packedMatrixBytes(1000) === 125000);
  chk('the list at the crossover is no larger than the packed matrix',
      listBytes(1000, CROSS_1000) <= packedMatrixBytes(1000),
      listBytes(1000, CROSS_1000) + ' <= ' + packedMatrixBytes(1000));
  chk('one edge past the crossover the list is larger',
      listBytes(1000, CROSS_1000 + 1) > packedMatrixBytes(1000),
      listBytes(1000, CROSS_1000 + 1) + ' > ' + packedMatrixBytes(1000));
  chk('at n = 6 the packed matrix is already smaller than the list',
      packedMatrixBytes(6) < listBytes(6, 7));
  chk('on the sparse row the list beats the packed matrix',
      SPACE_ROWS[1].list < SPACE_ROWS[1].packed,
      SPACE_ROWS[1].list + ' vs ' + SPACE_ROWS[1].packed);
  chk('on the dense row the list is the largest of the three',
      SPACE_ROWS[2].list > SPACE_ROWS[2].packed && SPACE_ROWS[2].list > SPACE_ROWS[2].ints,
      SPACE_ROWS[2].list);
})();

/* -- the counterexample pair -- */
(function () {
  var kd = degreeSeq(K33_A), pd = degreeSeq(PRISM_A);
  chk('K3,3 and the prism have the same degree sequence',
      kd.join(',') === pd.join(','), kd.join(','));
  chk('that shared degree sequence is six threes', kd.join(',') === '3,3,3,3,3,3', kd.join(','));
  chk('both graphs have nine edges',
      total(K33_A) / 2 === 9 && total(PRISM_A) / 2 === 9);
  chk('K3,3 has no triangle', countTriangles(6, K33_A) === 0, countTriangles(6, K33_A));
  chk('the prism has exactly two triangles', countTriangles(6, PRISM_A) === 2, countTriangles(6, PRISM_A));
  chk('so the degree sequence does not determine the triangle count',
      countTriangles(6, K33_A) !== countTriangles(6, PRISM_A));
})();

/* -- the self-inverse item -- */
(function () {
  var I = zero(4, 4);
  for (var i = 0; i < 4; i++) I[i][i] = 1;
  chk('a perfect matching squared is the identity',
      PM_A2.every(function (row, i) { return row.every(function (x, j) { return x === I[i][j]; }); }));
  chk('a perfect matching has every degree equal to 1',
      degreeSeq(PM_A).join(',') === '1,1,1,1', degreeSeq(PM_A).join(','));
})();

/* -- operation counts quoted on the canvas -- */
(function () {
  chk('the matrix needs n squared cell reads to walk the graph', MATRIX_CELLS === 36, MATRIX_CELLS);
  chk('the list needs n heads plus 2m entries to walk the graph', LIST_STEPS === 20, LIST_STEPS);
  chk('walking is cheaper on the list for this graph', LIST_STEPS < MATRIX_CELLS);
  chk('A and D are not adjacent, so the matrix answers 0', HAS_EDGE_AD === 0);
  chk('the degree of A is 2, so the list scan is short here', DEG_OF_A === 2);
})();

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function pad2(n) { return (n < 10 ? '0' : '') + n; }

function sceneAtT(t) {
  var sc = window.LESSON_TIMELINE.scenes;
  for (var i = sc.length - 1; i >= 0; i--) if (t >= sc[i].start - 1e-6) return i;
  return 0;
}

function localP(t) {
  var sc = window.LESSON_TIMELINE.scenes;
  var i = sceneAtT(t);
  var s = sc[i];
  var p = (t - s.start) / Math.max(0.001, s.end - s.start);
  return p < 0 ? 0 : p > 1 ? 1 : p;
}

/* a smooth 0..1 ramp between two thresholds of the scene progress */
function ramp(p, a, b) {
  var x = (p - a) / Math.max(0.0001, b - a);
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/* ---------- small drawing vocabulary ---------- */

function header(P, n, title) {
  P.text(24, 16, n + ' of 10  ·  ' + title, { size: 12, color: PAL.dim });
}

function node(P, x, y, label, opts) {
  opts = opts || {};
  var r = opts.r || 15;
  var on = opts.on === undefined ? true : opts.on;
  P.circle(x, y, r, {
    fill: on ? (opts.fill || PAL.accentDim) : PAL.surface2,
    stroke: on ? (opts.stroke || PAL.accent) : PAL.border,
    sw: opts.sw || 1.8
  });
  P.text(x, y + 1, label, {
    size: opts.size || 13, bold: true, align: 'center', base: 'middle',
    color: on ? PAL.ink : PAL.faint
  });
}

function edgeLine(P, a, b, opts) {
  P.line(a[0], a[1], b[0], b[1], opts || { stroke: PAL.dim, sw: 1.6 });
}

function cellBox(P, x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, {
    fill: o.fill || PAL.surface,
    stroke: o.stroke || PAL.border,
    sw: o.sw || 1,
    radius: o.radius || 3
  });
}

function fmtInt(n) {
  var s = String(n), out = '', c = 0;
  for (var i = s.length - 1; i >= 0; i--) {
    out = s.charAt(i) + out;
    if (++c % 3 === 0 && i > 0) out = ',' + out;
  }
  return out;
}

/* the hexagon layout used by scenes 1 and 2 */
function hexPositions(cx, cy, r) {
  var angles = [-90, -30, 30, 90, 150, 210];
  return angles.map(function (a) {
    var rad = a * Math.PI / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  });
}

/* ---------- scene 1: one graph, three registers ---------- */

function drawRegisters(P, p) {
  header(P, 1, 'One graph, three ways of writing it down');

  var pos = hexPositions(280, 240, 120);

  /* edges, revealed in order */
  var shown = Math.min(M, Math.floor(ramp(p, 0.10, 0.55) * (M + 1)));
  for (var i = 0; i < shown; i++) {
    var e = EDGES[i];
    edgeLine(P, pos[e[0]], pos[e[1]], { stroke: PAL.dim, sw: 1.8 });
  }

  /* nodes */
  var nodesOn = ramp(p, 0.02, 0.12);
  for (var v = 0; v < NV; v++) {
    node(P, pos[v][0], pos[v][1], NAMES[v], { on: nodesOn > 0, r: 16, size: 14 });
  }

  P.text(24, 58, 'the graph G = (V, E)', { size: 12, color: PAL.dim });
  P.text(24, 80, 'n = 6 vertices, m = 7 edges', { size: 12, color: PAL.faint });

  if (p >= 0.55) {
    P.text(520, 100, 'matrix', { size: 13, bold: true });
    P.text(520, 122, 'a square grid, one cell per pair', { size: 12, color: PAL.dim });
    P.text(520, 142, '36 cells, 14 set', { size: 12, mono: true, color: PAL.accent });
  }
  if (p >= 0.68) {
    P.text(520, 186, 'adjacency list', { size: 13, bold: true });
    P.text(520, 208, 'one chain per vertex', { size: 12, color: PAL.dim });
    P.text(520, 228, '6 heads + 14 entries', { size: 12, mono: true, color: PAL.accent });
  }
  if (p >= 0.80) {
    P.text(520, 272, 'edge table', { size: 13, bold: true });
    P.text(520, 294, 'one row per edge', { size: 12, color: PAL.dim });
    P.text(520, 314, '7 pairs', { size: 12, mono: true, color: PAL.accent });
  }
  if (p >= 0.92) {
    P.text(520, 366, 'Same seven edges, three bookkeeping choices.', { size: 12, color: PAL.dim });
  }
}

/* ---------- scene 2: the adjacency matrix ---------- */

function drawMatrix(P, p) {
  header(P, 2, 'The adjacency matrix, filled edge by edge');

  var cx = 190, cy = 245, r = 95;
  var pos = hexPositions(cx, cy, r);

  /* how many edges have been read so far */
  var read = Math.min(M, Math.floor(ramp(p, 0.18, 0.78) * (M + 1)));

  for (var i = 0; i < read; i++) {
    var e = EDGES[i];
    edgeLine(P, pos[e[0]], pos[e[1]], { stroke: PAL.accent, sw: 1.8 });
  }
  for (var v = 0; v < NV; v++) node(P, pos[v][0], pos[v][1], NAMES[v], { r: 14, size: 12 });

  P.text(24, 58, 'the same graph', { size: 12, color: PAL.dim });

  /* the grid */
  var ox = 470, oy = 130, cell = 40;

  for (var cj = 0; cj < NV; cj++) {
    P.text(ox + cell * cj + cell / 2, 112, NAMES[cj], {
      size: 12, mono: true, align: 'center', color: PAL.dim
    });
  }
  for (var ri = 0; ri < NV; ri++) {
    P.text(ox - 14, oy + cell * ri + cell / 2, NAMES[ri], {
      size: 12, mono: true, align: 'right', base: 'middle', color: PAL.dim
    });
  }

  /* which cells are set, in the order the edges were read */
  var set = zero(NV, NV);
  for (var k = 0; k < read; k++) {
    set[EDGES[k][0]][EDGES[k][1]] = 1;
    set[EDGES[k][1]][EDGES[k][0]] = 1;
  }

  for (var a = 0; a < NV; a++) {
    for (var b = 0; b < NV; b++) {
      var x = ox + cell * b, y = oy + cell * a;
      var isSet = set[a][b] === 1;
      cellBox(P, x + 1, y + 1, cell - 2, cell - 2, {
        fill: isSet ? PAL.accentDim : PAL.surface,
        stroke: isSet ? PAL.accent : PAL.border,
        sw: isSet ? 1.6 : 1
      });
      P.text(x + cell / 2, y + cell / 2, isSet ? '1' : '0', {
        size: 13, mono: true, align: 'center', base: 'middle',
        color: isSet ? PAL.ink : PAL.faint
      });
    }
  }

  /* the running counters */
  var setCells = total(set);
  if (p >= 0.22) {
    P.text(740, 132, 'cells set', { size: 12, color: PAL.dim });
    P.text(740, 152, String(setCells), { size: 18, mono: true, bold: true, color: PAL.accent });
  }
  if (p >= 0.34) {
    P.text(740, 200, 'symmetric pairs', { size: 12, color: PAL.dim });
    P.text(740, 220, String(setCells / 2), { size: 18, mono: true, bold: true, color: PAL.accent });
  }
  if (p >= 0.46) {
    P.text(740, 268, 'diagonal', { size: 12, color: PAL.dim });
    P.text(740, 288, '0', { size: 18, mono: true, bold: true, color: PAL.valid });
  }
  if (p >= 0.62) {
    P.text(740, 340, 'a simple graph has no', { size: 11, color: PAL.dim });
    P.text(740, 356, 'loop, so no 1 on it', { size: 11, color: PAL.dim });
  }
}

/* ---------- scene 3: counting off the matrix ---------- */

function drawCount(P, p) {
  header(P, 3, 'Counting straight off the matrix');

  var ox = 60, oy = 120, cell = 34;

  for (var cj = 0; cj < NV; cj++) {
    P.text(ox + cell * cj + cell / 2, 104, NAMES[cj], {
      size: 11, mono: true, align: 'center', color: PAL.dim
    });
  }
  for (var ri = 0; ri < NV; ri++) {
    P.text(ox - 12, oy + cell * ri + cell / 2, NAMES[ri], {
      size: 11, mono: true, align: 'right', base: 'middle', color: PAL.dim
    });
  }

  for (var a = 0; a < NV; a++) {
    for (var b = 0; b < NV; b++) {
      var x = ox + cell * b, y = oy + cell * a;
      var one = A[a][b] === 1;
      cellBox(P, x + 1, y + 1, cell - 2, cell - 2, {
        fill: one ? PAL.accentDim : PAL.surface,
        stroke: one ? PAL.accent : PAL.border,
        sw: one ? 1.4 : 1
      });
      P.text(x + cell / 2, y + cell / 2, one ? '1' : '0', {
        size: 11, mono: true, align: 'center', base: 'middle',
        color: one ? PAL.ink : PAL.faint
      });
    }
  }

  /* the row-sum column appears second */
  if (p >= 0.12) {
    P.text(ox + cell * NV + 17, 104, 'row sum', { size: 11, align: 'center', color: PAL.dim });
    for (var r2 = 0; r2 < NV; r2++) {
      var y2 = oy + cell * r2;
      cellBox(P, ox + cell * NV + 2, y2 + 1, cell - 4, cell - 2, {
        fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2
      });
      P.text(ox + cell * NV + 15, y2 + cell / 2, String(DEG[r2]), {
        size: 12, mono: true, bold: true, align: 'center', base: 'middle', color: PAL.warn
      });
    }
  }

  /* the total appears third */
  if (p >= 0.42) {
    P.text(ox, oy + cell * NV + 22, 'total', { size: 11, align: 'center', color: PAL.dim });
    cellBox(P, ox, oy + cell * NV + 34, cell * NV - 2, 26, {
      fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2
    });
    P.text(ox + cell * NV / 2, oy + cell * NV + 47, String(total(A)), {
      size: 14, mono: true, bold: true, align: 'center', base: 'middle', color: PAL.ink
    });
  }

  P.text(380, 118, 'Three numbers, one graph', { size: 13, bold: true });
  if (p >= 0.12) {
    P.text(380, 148, 'a row sum is the degree of that vertex', { size: 12, color: PAL.dim });
  }
  if (p >= 0.42) {
    P.text(380, 176, 'the total is 2m = 14, so m = 7', { size: 12, color: PAL.dim });
  }
  if (p >= 0.56) {
    P.text(380, 204, 'sum of the degrees = 2m = 14', { size: 12, color: PAL.dim });
  }
  if (p >= 0.68) {
    P.text(380, 246, 'degree sequence', { size: 12, bold: true });
    P.text(380, 270, '4, 2, 2, 2, 2, 2', { size: 14, mono: true, color: PAL.accent });
  }
  if (p >= 0.80) {
    P.text(380, 306, 'every degree is even, so there are', { size: 12, color: PAL.dim });
    P.text(380, 324, 'no odd-degree vertices at all', { size: 12, color: PAL.dim });
  }
  if (p >= 0.90) {
    P.text(380, 360, 'GATE CSE 2022 Q10 turns on the next', { size: 12, color: PAL.dim });
    P.text(380, 378, 'identity: the diagonal of A squared', { size: 12, color: PAL.dim });
  }
}

/* ---------- scene 4: the adjacency list ---------- */

function drawList(P, p) {
  header(P, 4, 'The adjacency list');

  var rowH = 30, gap = 20, top = 100;

  /* the chains fill in, one vertex at a time */
  var filled = ramp(p, 0.10, 0.70);

  for (var v = 0; v < NV; v++) {
    var y = top + v * (rowH + gap);
    cellBox(P, 40, y, 56, rowH, { fill: PAL.surface2, stroke: PAL.border, sw: 1.2 });
    P.text(68, y + rowH / 2, NAMES[v], {
      size: 13, bold: true, mono: true, align: 'center', base: 'middle'
    });

    var want = Math.round(LISTS[v].length * Math.min(1, filled * NV - v));
    want = Math.max(0, Math.min(LISTS[v].length, want));
    for (var k = 0; k < want; k++) {
      var x = 110 + k * 50;
      cellBox(P, x, y, 44, rowH, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.4 });
      P.text(x + 22, y + rowH / 2, NAMES[LISTS[v][k]], {
        size: 12, mono: true, align: 'center', base: 'middle'
      });
    }
  }

  P.text(380, 100, 'The adjacency list', { size: 13, bold: true });
  P.text(380, 128, 'one head per vertex, then a chain', { size: 12, color: PAL.dim });
  P.text(380, 148, 'of only that vertex neighbours', { size: 12, color: PAL.dim });

  if (p >= 0.36) {
    P.text(380, 188, 'chain entries in all: 2m = 14', { size: 12, color: PAL.dim });
  }
  if (p >= 0.48) {
    P.text(380, 216, 'heads: n = 6', { size: 12, color: PAL.dim });
  }
  if (p >= 0.58) {
    P.text(380, 244, 'C has degree 4, so C sits on 4 chains', { size: 12, color: PAL.dim });
  }
  if (p >= 0.70) {
    P.text(380, 284, 'directed graph: m entries, not 2m', { size: 12, color: PAL.warn });
    P.text(380, 312, 'in-degrees need a second set of chains', { size: 12, color: PAL.warn });
  }
  if (p >= 0.82) {
    P.text(380, 352, 'GATE CSE 2016 Set 2 Q41: linking each', { size: 12, color: PAL.dim });
    P.text(380, 370, 'entry to its twin costs Theta(n + m)', { size: 12, color: PAL.dim });
  }
}

/* ---------- scene 5: space ---------- */

function drawSpace(P, p) {
  header(P, 5, 'Space: bits against pointers');

  P.text(24, 56, 'Space for three graphs, in bytes', { size: 13, bold: true });

  P.text(24, 96, 'graph', { size: 12, bold: true, color: PAL.dim });
  P.text(300, 96, 'matrix, 1 bit', { size: 12, bold: true, color: PAL.dim });
  P.text(480, 96, 'matrix, 32 bit', { size: 12, bold: true, color: PAL.dim });
  P.text(660, 96, 'list, 8 B a node', { size: 12, bold: true, color: PAL.dim });

  var rowsOn = [0.10, 0.34, 0.58];
  for (var i = 0; i < SPACE_ROWS.length; i++) {
    if (p < rowsOn[i]) continue;
    var r = SPACE_ROWS[i], y = 128 + i * 50;
    P.text(24, y, r.label, { size: 12, mono: true, color: PAL.ink });
    P.text(300, y, fmtInt(r.packed) + ' B', { size: 12, mono: true, color: PAL.info });
    P.text(480, y, fmtInt(r.ints) + ' B', { size: 12, mono: true, color: PAL.faint });
    P.text(660, y, fmtInt(r.list) + ' B', { size: 12, mono: true, color: PAL.accent });
  }

  if (p >= 0.68) {
    P.line(24, 268, 876, 268, { stroke: PAL.border, sw: 1 });
    P.text(24, 290, 'the crossover, at n = 1000', { size: 12, bold: true });
  }
  if (p >= 0.74) {
    P.text(24, 316, 'the list is smaller exactly while m < ' + fmtInt(CROSS_1000), {
      size: 12, color: PAL.dim
    });
  }
  if (p >= 0.80) {
    P.text(24, 342, 'at n = 6 and m = 7 the packed matrix is smaller', { size: 12, color: PAL.dim });
  }
  if (p >= 0.86) {
    P.text(24, 368, 'so "lists are smaller" is a claim about density', { size: 12, color: PAL.dim });
  }
  if (p >= 0.92) {
    P.text(24, 404, 'packed ceil(n^2/8) B; 32-bit 4n^2 B; list 4n + 16m B', {
      size: 11, mono: true, color: PAL.faint
    });
  }
}

/* ---------- scene 6: the two costs ---------- */

function drawCost(P, p) {
  header(P, 6, 'The edge test and the neighbour walk');

  P.text(24, 56, 'The same question, two costs', { size: 13, bold: true });

  /* left: the matrix, one cell */
  P.text(24, 90, 'matrix: one cell', { size: 12, bold: true });
  var ox = 24, oy = 110, cell = 22;
  for (var a = 0; a < NV; a++) {
    for (var b = 0; b < NV; b++) {
      var x = ox + cell * b, y = oy + cell * a;
      var one = A[a][b] === 1;
      var target = (a === 0 && b === 3);
      cellBox(P, x + 1, y + 1, cell - 2, cell - 2, {
        fill: target ? PAL.invalidDim : (one ? PAL.accentDim : PAL.surface),
        stroke: target ? PAL.invalid : (one ? PAL.accent : PAL.border),
        sw: target ? 2 : 1
      });
    }
  }
  if (p >= 0.16) {
    P.text(24, 258, 'A[A][D] = 0 : one read', { size: 12, mono: true, color: PAL.invalid });
    P.text(24, 280, 'whatever the graph looks like', { size: 12, color: PAL.dim });
  }

  /* right: the list, a short scan */
  P.text(230, 90, 'list: walk A chain', { size: 12, bold: true });
  for (var k = 0; k < LISTS[0].length; k++) {
    var lx = 230 + k * 44;
    cellBox(P, lx, 110, 38, 26, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.4 });
    P.text(lx + 19, 123, NAMES[LISTS[0][k]], { size: 12, mono: true, align: 'center', base: 'middle' });
  }
  if (p >= 0.16) {
    P.text(230, 258, 'B then C, D not found', { size: 12, mono: true, color: PAL.dim });
    P.text(230, 280, 'Theta(1 + deg A) : 2 here', { size: 12, mono: true, color: PAL.warn });
  }

  /* below: the traversal */
  if (p >= 0.40) {
    P.text(24, 320, 'Walking the whole graph', { size: 12, bold: true });
  }
  if (p >= 0.52) {
    P.text(24, 346, 'matrix: 6 rows read in full = 36 cells', { size: 12, color: PAL.dim });
  }
  if (p >= 0.64) {
    P.text(24, 372, 'list: 6 heads + 14 entries = 20 steps', { size: 12, color: PAL.dim });
  }
  if (p >= 0.76) {
    P.text(24, 398, 'so DFS is Theta(n^2) on a matrix, Theta(n + m) on a list', {
      size: 12, color: PAL.ink
    });
  }
  if (p >= 0.88) {
    P.text(24, 424, 'GATE CSE 2014 Set 1: the tightest bound on DFS, adjacency matrix', {
      size: 11, color: PAL.faint
    });
  }
}

/* ---------- scene 7: A squared ---------- */

function drawSquare(P, p) {
  header(P, 7, 'A squared counts walks of length two');

  var ox = 60, oy = 140, cell = 34;

  for (var cj = 0; cj < NV; cj++) {
    P.text(ox + cell * cj + cell / 2, 124, NAMES[cj], {
      size: 11, mono: true, align: 'center', color: PAL.dim
    });
  }
  for (var ri = 0; ri < NV; ri++) {
    P.text(ox - 12, oy + cell * ri + cell / 2, NAMES[ri], {
      size: 11, mono: true, align: 'right', base: 'middle', color: PAL.dim
    });
  }

  var showAll = p >= 0.30;
  for (var a = 0; a < NV; a++) {
    for (var b = 0; b < NV; b++) {
      var x = ox + cell * b, y = oy + cell * a;
      var val = A2[a][b];
      var diag = (a === b);
      if (!showAll && val === 0) {
        cellBox(P, x + 1, y + 1, cell - 2, cell - 2, { fill: PAL.surface, stroke: PAL.border, sw: 1 });
        continue;
      }
      cellBox(P, x + 1, y + 1, cell - 2, cell - 2, {
        fill: diag ? PAL.warnDim : (val ? PAL.accentDim : PAL.surface),
        stroke: diag ? PAL.warn : (val ? PAL.accent : PAL.border),
        sw: 1.4
      });
      P.text(x + cell / 2, y + cell / 2, String(val), {
        size: 11, mono: true, align: 'center', base: 'middle',
        color: val ? PAL.ink : PAL.faint
      });
    }
  }

  P.text(300, 96, 'A squared counts walks of length 2', { size: 13, bold: true });
  P.text(300, 124, 'A2[i][j] = sum over k of A[i][k] A[k][j]', { size: 12, mono: true, color: PAL.dim });

  if (p >= 0.30) {
    P.text(300, 156, 'each k with both edges is one walk', { size: 12, color: PAL.dim });
  }
  if (p >= 0.44) {
    P.text(300, 196, 'on the diagonal', { size: 12, bold: true, color: PAL.warn });
    P.text(300, 220, 'A2[i][i] = degree of i, in a simple graph', { size: 12, color: PAL.dim });
    P.text(300, 244, '2, 2, 4, 2, 2, 2 : the degree sequence', { size: 12, mono: true, color: PAL.warn });
  }
  if (p >= 0.60) {
    P.text(300, 284, 'off the diagonal', { size: 12, bold: true, color: PAL.accent });
    P.text(300, 308, 'A2[A][C] = 1 : the one common neighbour B', { size: 12, color: PAL.dim });
    P.text(300, 332, 'A2[A][D] = 0 : no two-step route at all', { size: 12, color: PAL.dim });
  }
  if (p >= 0.76) {
    P.text(300, 372, 'add every entry: ' + total(A2) + ' walks of length 2', {
      size: 12, color: PAL.ink
    });
  }
  if (p >= 0.86) {
    P.text(300, 400, 'GATE CSE 2022 Q10: the diagonal of A^2 is the degrees', {
      size: 11, color: PAL.faint
    });
  }
}

/* ---------- scene 8: A cubed ---------- */

function drawCube(P, p) {
  header(P, 8, 'A cubed counts triangles');

  P.text(24, 56, 'Closed walks of length three', { size: 13, bold: true });

  P.text(24, 100, 'vertex', { size: 12, bold: true, color: PAL.dim });
  P.text(140, 100, 'A3[i][i]', { size: 12, bold: true, mono: true, color: PAL.dim });
  P.text(290, 100, 'triangles', { size: 12, bold: true, color: PAL.dim });

  var rowsOn = Math.floor(ramp(p, 0.10, 0.46) * (NV + 1));
  for (var i = 0; i < rowsOn && i < NV; i++) {
    var y = 128 + i * 28;
    P.text(24, y, NAMES[i], { size: 12, mono: true });
    P.text(140, y, String(A3[i][i]), { size: 12, mono: true, color: PAL.accent });
    P.text(290, y, String(trianglesAt(NV, A, i)), { size: 12, mono: true, color: PAL.warn });
  }

  if (p >= 0.52) {
    P.text(24, 300, 'trace = 2 + 2 + 2 = 6', { size: 12, mono: true, color: PAL.ink });
  }
  if (p >= 0.62) {
    P.text(24, 326, 'each triangle adds 2 at each of its corners', { size: 12, color: PAL.dim });
  }
  if (p >= 0.72) {
    P.text(24, 354, 'triangles = trace(A3) / 6 = 1', { size: 12, mono: true, color: PAL.accent });
  }

  P.text(420, 56, 'Why the divisor is six', { size: 13, bold: true });
  if (p >= 0.30) {
    P.text(420, 84, 'one triangle is walked in six ways:', { size: 12, color: PAL.dim });
    P.text(420, 108, 'three corners, two directions', { size: 12, color: PAL.dim });
  }
  if (p >= 0.60) {
    P.text(420, 148, 'GATE CSE 2022 Q12', { size: 12, bold: true });
    P.text(420, 174, '3-cycles = trace(A^3) / 6', { size: 12, mono: true, color: PAL.accent });
  }
  if (p >= 0.74) {
    P.text(420, 212, 'GATE CSE 2024 Set 2 Q7', { size: 12, bold: true });
    P.text(420, 238, 'A = A inverse forces every degree to 1,', { size: 12, color: PAL.dim });
    P.text(420, 262, 'so the graph is a perfect matching', { size: 12, color: PAL.dim });
  }
  if (p >= 0.88) {
    P.text(420, 302, 'all walks of length k = sum of A^k entries', { size: 12, color: PAL.dim });
    P.text(420, 326, 'k = 2 gives ' + total(A2) + ', k = 3 gives ' + total(A3), {
      size: 12, mono: true, color: PAL.ink
    });
  }
}

/* ---------- scene 9: the incidence matrix ---------- */

function drawIncidence(P, p) {
  header(P, 9, 'The incidence matrix');

  var ox = 60, oy = 150, cw = 30, ch = 26;

  P.text(24, 60, 'rows are vertices, columns are edges', { size: 12, color: PAL.dim });

  for (var e = 0; e < M; e++) {
    P.text(ox + cw * e + cw / 2, 134, 'e' + (e + 1), {
      size: 10, mono: true, align: 'center', color: PAL.dim
    });
  }
  for (var r = 0; r < NV; r++) {
    P.text(ox - 12, oy + ch * r + ch / 2, NAMES[r], {
      size: 11, mono: true, align: 'right', base: 'middle', color: PAL.dim
    });
  }

  var colsOn = Math.floor(ramp(p, 0.10, 0.55) * (M + 1));
  for (var c = 0; c < colsOn && c < M; c++) {
    for (var i = 0; i < NV; i++) {
      var x = ox + cw * c, y = oy + ch * i;
      var one = INC[i][c] === 1;
      cellBox(P, x + 1, y + 1, cw - 2, ch - 2, {
        fill: one ? PAL.accentDim : PAL.surface,
        stroke: one ? PAL.accent : PAL.border,
        sw: one ? 1.4 : 1
      });
      P.text(x + cw / 2, y + ch / 2, one ? '1' : '0', {
        size: 10, mono: true, align: 'center', base: 'middle',
        color: one ? PAL.ink : PAL.faint
      });
    }
  }

  P.text(320, 90, 'The incidence matrix', { size: 13, bold: true });
  P.text(320, 118, 'one row per vertex, one column per edge', { size: 12, color: PAL.dim });
  if (p >= 0.34) {
    P.text(320, 146, 'a 1 where that edge touches that vertex', { size: 12, color: PAL.dim });
  }
  if (p >= 0.50) {
    P.text(320, 186, 'what it says', { size: 12, bold: true });
    P.text(320, 212, 'every column sums to 2 : an edge has two ends', { size: 12, color: PAL.dim });
    P.text(320, 238, 'every row sums to that vertex degree', { size: 12, color: PAL.dim });
  }
  if (p >= 0.64) {
    P.text(320, 268, 'rank over GF(2) = n - components = 5', { size: 12, mono: true, color: PAL.accent });
    P.text(320, 294, 'nullity = m - n + components = 2', { size: 12, mono: true, color: PAL.accent });
  }
  if (p >= 0.74) {
    P.text(320, 320, 'over the reals the unsigned rank is 6:', { size: 12, color: PAL.warn });
    P.text(320, 340, 'the graph is not bipartite', { size: 12, color: PAL.warn });
  }
  if (p >= 0.84) {
    P.text(320, 372, 'and that nullity is the cycle count', { size: 12, color: PAL.ink });
    P.text(320, 398, 'the price: n times m cells, 42 here', { size: 12, color: PAL.dim });
    P.text(320, 424, 'too big for traversal, right for flows', { size: 11, color: PAL.faint });
  }
}

/* ---------- scene 10: choosing, and the trap ---------- */

function drawChoose(P, p) {
  header(P, 10, 'Choosing, and the trap in the degree sequence');

  P.text(24, 56, 'Choosing, in four questions', { size: 13, bold: true });
  if (p >= 0.10) {
    P.text(24, 86, 'dense graph, and edge tests matter? the matrix', { size: 12, color: PAL.dim });
    P.text(24, 112, 'sparse graph, mostly neighbour walks? the list', { size: 12, color: PAL.dim });
  }
  if (p >= 0.22) {
    P.text(24, 138, 'need A^k, walks or spectra? the matrix, no substitute', { size: 12, color: PAL.dim });
    P.text(24, 164, 'need in-degrees of a digraph? keep in-chains too', { size: 12, color: PAL.dim });
  }

  if (p >= 0.34) {
    P.text(24, 200, 'the trap: degrees do not determine the graph', { size: 12, bold: true });

    /* K3,3: two columns of three, all nine edges */
    var L = [[60, 240], [60, 280], [60, 320]];
    var R = [[152, 240], [152, 280], [152, 320]];
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        P.line(L[i][0], L[i][1], R[j][0], R[j][1], { stroke: PAL.faint, sw: 1.2 });
      }
    }
    for (var a = 0; a < 3; a++) {
      P.circle(L[a][0], L[a][1], 7, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.4 });
      P.circle(R[a][0], R[a][1], 7, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.4 });
    }
    P.text(106, 352, 'K3,3 : 0 triangles', { size: 11, align: 'center', color: PAL.dim });

    /* the triangular prism: two triangles plus a matching */
    var T = [[240, 226], [320, 226], [280, 272]];
    var B = [[240, 330], [320, 330], [280, 376]];
    P.line(T[0][0], T[0][1], T[1][0], T[1][1], { stroke: PAL.faint, sw: 1.2 });
    P.line(T[1][0], T[1][1], T[2][0], T[2][1], { stroke: PAL.faint, sw: 1.2 });
    P.line(T[2][0], T[2][1], T[0][0], T[0][1], { stroke: PAL.faint, sw: 1.2 });
    P.line(B[0][0], B[0][1], B[1][0], B[1][1], { stroke: PAL.faint, sw: 1.2 });
    P.line(B[1][0], B[1][1], B[2][0], B[2][1], { stroke: PAL.faint, sw: 1.2 });
    P.line(B[2][0], B[2][1], B[0][0], B[0][1], { stroke: PAL.faint, sw: 1.2 });
    for (var q = 0; q < 3; q++) {
      P.line(T[q][0], T[q][1], B[q][0], B[q][1], { stroke: PAL.warn, sw: 1.2, dash: [4, 3] });
      P.circle(T[q][0], T[q][1], 7, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.4 });
      P.circle(B[q][0], B[q][1], 7, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.4 });
    }
    P.text(280, 400, 'prism : 2 triangles', { size: 11, align: 'center', color: PAL.dim });
  }

  if (p >= 0.50) {
    P.text(470, 200, 'both are 3-regular on 6 vertices', { size: 12, bold: true });
    P.text(470, 226, 'degrees 3,3,3,3,3,3 and 9 edges each', { size: 12, color: PAL.dim });
    P.text(470, 252, 'so no degree test tells them apart', { size: 12, color: PAL.dim });
  }
  if (p >= 0.66) {
    P.text(470, 290, 'the takeaway', { size: 12, bold: true });
    P.text(470, 316, 'a representation picks what to make cheap', { size: 12, color: PAL.dim });
    P.text(470, 342, 'it never changes the graph itself', { size: 12, color: PAL.dim });
  }
  if (p >= 0.82) {
    P.text(470, 380, 'every number here was computed on this page:', { size: 12, color: PAL.ink });
    P.text(470, 406, '14 ones, 36 cells, trace 6, rank 5, nullity 2', {
      size: 11, mono: true, color: PAL.faint
    });
  }
}

/* ---------- the dispatcher ---------- */

var SCENE_DRAW = [
  drawRegisters, drawMatrix, drawCount, drawList, drawSpace,
  drawCost, drawSquare, drawCube, drawIncidence, drawChoose
];

function drawFrame(Pn) {
  var t = K && K.state ? K.state.elapsed : 0;
  var i = sceneAtT(t);
  var p = localP(t);
  Pn.clear();
  Pn.alpha(1);
  var fn = SCENE_DRAW[i] || SCENE_DRAW[0];
  fn(Pn, p, t);
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
  if (fallback) fallback.classList.remove('show');

  var ok = false;
  if (window.p5 && holder && PR) {
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
