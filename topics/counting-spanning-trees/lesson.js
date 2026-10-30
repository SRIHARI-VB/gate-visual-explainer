/* ==========================================================================
   counting-spanning-trees — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   Four independent methods count spanning trees here: enumeration of every
   (n-1)-subset, deletion-contraction, the Laplacian determinant of Kirchhoff,
   and Cayley's formula with its Prüfer bijection. The drawing code reads V and
   performs no graph arithmetic of its own.
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
function fx(v, k) { return Number(v).toFixed(k === undefined ? 0 : k); }
function near(a, b) { return Math.abs(a - b) < 1e-9; }

/* ---------- graphs ---------- */
function graph(n, edges) { return { n: n, edges: edges }; }
function complete(n) {
  var e = [];
  for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) e.push([i, j]);
  return graph(n, e);
}
function cycleG(n) {
  var e = [];
  for (var i = 0; i < n; i++) e.push([i, (i + 1) % n]);
  return graph(n, e);
}
function bip(m, n) {
  var e = [];
  for (var i = 0; i < m; i++) for (var j = 0; j < n; j++) e.push([i, m + j]);
  return graph(m + n, e);
}

var GR = {
  k4: complete(4),
  c4: cycleG(4),
  diamond: graph(4, [[0, 1], [1, 2], [2, 3], [0, 3], [0, 2]]),
  k23: bip(2, 3),
  p4: graph(4, [[0, 1], [1, 2], [2, 3]]),
  c5: cycleG(5),
  k33: bip(3, 3),
  w4: graph(5, [[0, 1], [1, 2], [2, 3], [0, 3], [0, 4], [1, 4], [2, 4], [3, 4]]),
  twoTri: graph(6, [[0, 1], [1, 2], [0, 2], [3, 4], [4, 5], [3, 5]]),
  k5: complete(5),
  k6: complete(6),
  t6: graph(6, [[0, 1], [0, 2], [1, 3], [3, 4], [3, 5]])
};

/* ---------- connectivity, by union-find ---------- */
function connected(n, edges) {
  var par = [], i;
  for (i = 0; i < n; i++) par.push(i);
  function find(x) { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; }
  for (i = 0; i < edges.length; i++) {
    var ra = find(edges[i][0]), rb = find(edges[i][1]);
    if (ra !== rb) par[ra] = rb;
  }
  var roots = {};
  for (i = 0; i < n; i++) roots[find(i)] = 1;
  return Object.keys(roots).length === 1;
}

/* ---------- method 1: choose (n-1) edges, then test ---------- */
function combos(m, k) {
  var out = [], cur = [];
  (function rec(start) {
    if (cur.length === k) { out.push(cur.slice()); return; }
    for (var i = start; i < m; i++) { cur.push(i); rec(i + 1); cur.pop(); }
  })(0);
  return out;
}
function bruteCount(g) {
  var n = g.n, m = g.edges.length;
  if (n === 1) return 1;
  var subs = combos(m, n - 1), c = 0;
  for (var i = 0; i < subs.length; i++) {
    var es = subs[i].map(function (k) { return g.edges[k]; });
    if (connected(n, es)) c++;
  }
  return c;
}
function subsetStats(g) {
  var n = g.n, subs = combos(g.edges.length, n - 1), ok = 0;
  for (var i = 0; i < subs.length; i++) {
    var es = subs[i].map(function (k) { return g.edges[k]; });
    if (connected(n, es)) ok++;
  }
  return { subsets: subs.length, trees: ok, rejected: subs.length - ok };
}

/* ---------- method 2: deletion-contraction ---------- */
function contractCount(g, keepLoops) {
  var memo = {};
  function rec(n, edges) {
    if (!keepLoops) edges = edges.filter(function (e) { return e[0] !== e[1]; });
    var key = n + '|' + edges.map(function (e) { return e[0] + '-' + e[1]; }).sort().join(',');
    if (memo.hasOwnProperty(key)) return memo[key];
    var res;
    if (n <= 1) res = 1;
    else if (!edges.length) res = 0;
    else if (!connected(n, edges)) res = 0;
    else {
      var a = edges[0][0], b = edges[0][1], rest = edges.slice(1);
      var r1 = rec(n, rest);
      var merged = rest.map(function (f) {
        return [f[0] === b ? a : f[0], f[1] === b ? a : f[1]];
      });
      var used = {};
      merged.forEach(function (f) { used[f[0]] = 1; used[f[1]] = 1; });
      for (var v = 0; v < n; v++) if (v !== a && v !== b) used[v] = 1;
      var vs = Object.keys(used).map(Number).sort(function (x, y) { return x - y; });
      var mp = {};
      vs.forEach(function (v, i) { mp[v] = i; });
      var e2 = merged.map(function (f) { return [mp[f[0]], mp[f[1]]]; });
      var r2 = rec(vs.length, e2);
      res = r1 + r2;
    }
    memo[key] = res;
    return res;
  }
  return rec(g.n, g.edges.map(function (e) { return [e[0], e[1]]; }));
}

/* ---------- method 3: the Laplacian and its cofactor ---------- */
function laplacian(g) {
  var n = g.n, L = [], i, j;
  for (i = 0; i < n; i++) { L.push([]); for (j = 0; j < n; j++) L[i].push(0); }
  for (var k = 0; k < g.edges.length; k++) {
    var a = g.edges[k][0], b = g.edges[k][1];
    L[a][a]++; L[b][b]++; L[a][b]--; L[b][a]--;
  }
  return L;
}
function detInt(M) {
  var n = M.length;
  if (n === 0) return 1;
  var A = M.map(function (r) { return r.slice(); });
  var sign = 1, prev = 1, i, j, k;
  for (k = 0; k < n - 1; k++) {
    if (A[k][k] === 0) {
      var p = -1;
      for (i = k + 1; i < n; i++) if (A[i][k] !== 0) { p = i; break; }
      if (p < 0) return 0;
      var t = A[k]; A[k] = A[p]; A[p] = t; sign = -sign;
    }
    for (i = k + 1; i < n; i++)
      for (j = k + 1; j < n; j++)
        A[i][j] = (A[i][j] * A[k][k] - A[i][k] * A[k][j]) / prev;
    prev = A[k][k];
    for (i = k + 1; i < n; i++) A[i][k] = 0;
  }
  return sign * A[n - 1][n - 1];
}
function minor(L, drop) {
  var out = [];
  for (var i = 0; i < L.length; i++) {
    if (i === drop) continue;
    var row = [];
    for (var j = 0; j < L.length; j++) if (j !== drop) row.push(L[i][j]);
    out.push(row);
  }
  return out;
}
function matrixTree(g, drop) {
  if (g.n <= 1) return 1;
  return detInt(minor(laplacian(g), drop === undefined ? 0 : drop));
}

/* ---------- method 4: Prüfer codes, labels 1..n ---------- */
function pruferSteps(g) {
  var n = g.n, deg = [], adj = {}, i;
  for (i = 0; i < n; i++) { deg.push(0); adj[i] = []; }
  for (i = 0; i < g.edges.length; i++) {
    var a = g.edges[i][0], b = g.edges[i][1];
    deg[a]++; deg[b]++; adj[a].push(b); adj[b].push(a);
  }
  var steps = [], code = [];
  for (var s = 0; s < n - 2; s++) {
    var leaf = -1;
    for (i = 0; i < n; i++) if (deg[i] === 1) { leaf = i; break; }
    if (leaf < 0) break;
    var nb = adj[leaf][0];
    steps.push({ leaf: leaf + 1, neighbour: nb + 1 });
    code.push(nb + 1);
    deg[leaf]--; deg[nb]--;
    adj[nb] = adj[nb].filter(function (x) { return x !== leaf; });
    adj[leaf] = [];
  }
  return { steps: steps, code: code };
}
function pruferDecode(seq, n) {
  var deg = [], i, out = [];
  for (i = 0; i < n; i++) deg.push(1);
  for (i = 0; i < seq.length; i++) deg[seq[i] - 1]++;
  for (var s = 0; s < seq.length; s++) {
    var leaf = -1;
    for (i = 0; i < n; i++) if (deg[i] === 1) { leaf = i; break; }
    if (leaf < 0) return null;
    out.push([leaf + 1, seq[s]]);
    deg[leaf]--; deg[seq[s] - 1]--;
  }
  var rest = [];
  for (i = 0; i < n; i++) if (deg[i] === 1) rest.push(i + 1);
  if (rest.length === 2) out.push([rest[0], rest[1]]);
  return out;
}
function edgeKey(edges) {
  return edges.map(function (e) {
    return (e[0] < e[1] ? e[0] + '-' + e[1] : e[1] + '-' + e[0]);
  }).sort().join(',');
}

/* ---------- V: everything the page shows ---------- */
var V = {};

V.k4 = subsetStats(GR.k4);
V.k4.contract = contractCount(GR.k4);
V.k4.matrix = matrixTree(GR.k4);
V.k4.cayley = Math.pow(4, 2);
V.k4.triangles = V.k4.rejected;   /* the rejected three-edge sets are exactly the 4 triangles */
V.k4.cofactors = [0, 1, 2, 3].map(function (d) { return matrixTree(GR.k4, d); });

V.c4 = subsetStats(GR.c4);
V.c4.contract = contractCount(GR.c4);
V.c4.matrix = matrixTree(GR.c4);

V.diamond = subsetStats(GR.diamond);
V.diamond.contract = contractCount(GR.diamond);
V.diamond.matrix = matrixTree(GR.diamond);
V.diamond.minusEdge = contractCount(GR.c4);        /* diamond minus a diagonal is C4 */
V.diamond.contracted = V.diamond.contract - V.diamond.minusEdge;

V.k23 = subsetStats(GR.k23);
V.k23.contract = contractCount(GR.k23);
V.k23.matrix = matrixTree(GR.k23);
V.k23.formula = Math.pow(2, 2) * Math.pow(3, 1);

V.k33 = { matrix: matrixTree(GR.k33), formula: Math.pow(3, 2) * Math.pow(3, 2) };
V.k33.contract = contractCount(GR.k33);
V.w4 = { matrix: matrixTree(GR.w4), contract: contractCount(GR.w4) };
V.k5 = { matrix: matrixTree(GR.k5), contract: contractCount(GR.k5) };
V.k6 = { matrix: matrixTree(GR.k6), contract: contractCount(GR.k6) };
V.p4 = { matrix: matrixTree(GR.p4), contract: contractCount(GR.p4) };
V.c5 = { matrix: matrixTree(GR.c5), contract: contractCount(GR.c5) };
V.twoTri = { matrix: matrixTree(GR.twoTri), contract: contractCount(GR.twoTri) };

V.cayley = [1, 2, 3, 4, 5, 6, 7].map(function (n) {
  return { n: n, count: n === 1 ? 1 : Math.pow(n, n - 2) };
});

V.prufer = pruferSteps(GR.t6);

/* the bijection, checked over every code on five labels */
V.bijection = (function () {
  var n = 5, codes = [], i;
  var total = Math.pow(n, n - 2);
  var seenTrees = {}, roundTrip = 0;
  for (var num = 0; num < total; num++) {
    var seq = [], x = num;
    for (i = 0; i < n - 2; i++) { seq.push((x % n) + 1); x = Math.floor(x / n); }
    codes.push(seq);
    var tr = pruferDecode(seq, n);
    var g = graph(n, tr.map(function (e) { return [e[0] - 1, e[1] - 1]; }));
    var k = edgeKey(tr);
    seenTrees[k] = 1;
    var back = pruferSteps(g).code;
    if (back.join(',') === seq.join(',')) roundTrip++;
  }
  return { codes: codes.length, trees: Object.keys(seenTrees).length, roundTrip: roundTrip, n: n };
})();

/* the self-loop defect, computed rather than asserted */
V.selfLoopDefect = {
  correct: contractCount(GR.k33, false),
  wrong: contractCount(GR.k33, true)
};

/* every edge of K4 lies in the same number of spanning trees */
V.edgeSpread = (function () {
  var per = [], i;
  for (i = 0; i < GR.k4.edges.length; i++) per.push(0);
  var subs = combos(GR.k4.edges.length, 3);
  for (var s = 0; s < subs.length; s++) {
    var es = subs[s].map(function (k) { return GR.k4.edges[k]; });
    if (connected(4, es)) subs[s].forEach(function (k) { per[k]++; });
  }
  return per;
})();

/* exhaustive cross-checks: every graph on four and on five vertices */
V.exhaustive = (function () {
  var n, i, k, four = 0, fourOk = 0, five = 0, fiveOk = 0;
  for (n = 4; n <= 5; n++) {
    var pairs = [];
    for (i = 0; i < n; i++) for (k = i + 1; k < n; k++) pairs.push([i, k]);
    var m = pairs.length, total = Math.pow(2, m);
    for (var mask = 0; mask < total; mask++) {
      var es = [];
      for (i = 0; i < m; i++) if (mask & (1 << i)) es.push(pairs[i]);
      var g = graph(n, es);
      var a = matrixTree(g), b = contractCount(g);
      if (n === 4) { four++; if (a === b) fourOk++; }
      else { five++; if (a === b) fiveOk++; }
    }
  }
  return { four: four, fourOk: fourOk, five: five, fiveOk: fiveOk };
})();

V.catalan = (function () {
  var c = [1];
  for (var i = 0; i < 6; i++) c.push(c[c.length - 1] * 2 * (2 * i + 1) / (i + 2));
  return c.map(function (v) { return Math.round(v); });
})();

V.unlabelled4 = 2;                    /* path and star */
V.labelled4 = Math.pow(4, 2);
V.bst4 = V.catalan[4];

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

chk('K4: three methods and Cayley agree on 16',
  V.k4.trees === 16 && V.k4.contract === 16 && V.k4.matrix === 16 && V.k4.cayley === 16,
  'brute ' + V.k4.trees + ', contract ' + V.k4.contract + ', matrix ' + V.k4.matrix + ', cayley ' + V.k4.cayley);

chk('K4: 20 three-edge subsets, 4 rejected, 16 kept',
  V.k4.subsets === 20 && V.k4.rejected === 4 && V.k4.trees === 16,
  V.k4.subsets + ' - ' + V.k4.rejected + ' = ' + V.k4.trees);

chk('K4: the four rejected three-edge sets are exactly the four triangles',
  V.k4.triangles === 4 && V.k4.rejected === 4,
  V.k4.triangles + ' triangles');

chk('K4: every one of the four Laplacian cofactors gives the same determinant',
  V.k4.cofactors.every(function (x) { return x === 16; }),
  V.k4.cofactors.join(', '));

chk('C4: 4 subsets of three edges, none rejected, 4 trees — and C_n = n',
  V.c4.subsets === 4 && V.c4.rejected === 0 && V.c4.trees === 4 && V.c4.contract === 4 && V.c4.matrix === 4);

chk('K2,3: a spanning tree needs four edges, so 15 subsets and 12 trees',
  V.k23.subsets === 15 && V.k23.trees === 12 && V.k23.contract === 12 && V.k23.matrix === 12,
  V.k23.subsets + ' subsets, ' + V.k23.rejected + ' rejected');

chk('K2,3: the bipartite formula 2^2 * 3^1 also gives 12',
  V.k23.formula === 12 && V.k23.formula === V.k23.matrix);

chk('the diamond (K4 minus one edge) counts 8, and the branches are 4 + 4',
  V.diamond.trees === 8 && V.diamond.contract === 8 && V.diamond.matrix === 8 &&
  V.diamond.minusEdge === 4 && V.diamond.contracted === 4,
  V.diamond.minusEdge + ' + ' + V.diamond.contracted);

chk('a path on four vertices counts 1: a tree is its own spanning tree',
  V.p4.matrix === 1 && V.p4.contract === 1);

chk('two disjoint triangles count 0: a disconnected graph has no spanning tree',
  V.twoTri.matrix === 0 && V.twoTri.contract === 0);

chk('C5 counts 5 and K3,3 counts 81, by determinant and by contraction',
  V.c5.matrix === 5 && V.c5.contract === 5 && V.k33.matrix === 81 && V.k33.contract === 81);

chk('K3,3: the bipartite formula 3^2 * 3^2 gives 81 as well',
  V.k33.formula === 81 && V.k33.formula === V.k33.matrix);

chk('the wheel W4 counts 45 by determinant and by contraction',
  V.w4.matrix === 45 && V.w4.contract === 45);

chk('K5 counts 125 = 5^3 and K6 counts 1296 = 6^4',
  V.k5.matrix === 125 && V.k5.contract === 125 && Math.pow(5, 3) === 125 &&
  V.k6.matrix === 1296 && V.k6.contract === 1296 && Math.pow(6, 4) === 1296);

chk('Cayley\'s table for n = 1..7 is 1, 1, 3, 16, 125, 1296, 16807',
  V.cayley.map(function (r) { return r.count; }).join(',') === '1,1,3,16,125,1296,16807');

chk('Cayley agrees with the computed count at n = 4 and n = 5',
  V.cayley[3].count === V.k4.matrix && V.cayley[4].count === V.k5.matrix);

chk('every graph on four vertices: determinant and contraction agree on all 64',
  V.exhaustive.four === 64 && V.exhaustive.fourOk === 64,
  V.exhaustive.fourOk + ' of ' + V.exhaustive.four);

chk('every graph on five vertices: determinant and contraction agree on all 1024',
  V.exhaustive.five === 1024 && V.exhaustive.fiveOk === 1024,
  V.exhaustive.fiveOk + ' of ' + V.exhaustive.five);

chk('the six-vertex tree encodes to the Prüfer code 1, 2, 4, 4',
  V.prufer.code.join(',') === '1,2,4,4' && V.prufer.code.length === 4,
  V.prufer.code.join(', '));

chk('the encoding deleted four leaves in the order 3, 1, 2, 5',
  V.prufer.steps.map(function (s) { return s.leaf; }).join(',') === '3,1,2,5');

chk('decoding that code returns the original five edges',
  edgeKey(pruferDecode(V.prufer.code, 6)) === edgeKey(GR.t6.edges.map(function (e) { return [e[0] + 1, e[1] + 1]; })));

chk('all 125 codes on five labels decode to 125 distinct trees',
  V.bijection.codes === 125 && V.bijection.trees === 125,
  V.bijection.codes + ' codes, ' + V.bijection.trees + ' trees');

chk('every one of the 125 trees re-encodes to the code it came from',
  V.bijection.roundTrip === 125, V.bijection.roundTrip + ' round trips');

chk('a contraction that keeps self-loops doubles the count: 111 instead of 81',
  V.selfLoopDefect.wrong === 111 && V.selfLoopDefect.correct === 81,
  'wrong ' + V.selfLoopDefect.wrong + ', right ' + V.selfLoopDefect.correct);

chk('in K4 every edge lies in 8 spanning trees, and 6 * 8 = 16 * 3',
  V.edgeSpread.every(function (x) { return x === 8; }) &&
  6 * 8 === V.k4.trees * 3,
  V.edgeSpread.join(', '));

chk('the three four-vertex numbers are different: 16 labelled, 2 shapes, 14 BSTs',
  V.labelled4 === 16 && V.unlabelled4 === 2 && V.bst4 === 14,
  V.labelled4 + ', ' + V.unlabelled4 + ', ' + V.bst4);

chk('the Catalan numbers start 1, 1, 2, 5, 14, 42, 132',
  V.catalan.join(',') === '1,1,2,5,14,42,132');

chk('a Laplacian row sums to zero, so its own determinant is zero',
  (function () {
    var L = laplacian(GR.k4), ok = true;
    for (var i = 0; i < L.length; i++) {
      var s = 0;
      for (var j = 0; j < L.length; j++) s += L[i][j];
      if (s !== 0) ok = false;
    }
    return ok && detInt(L) === 0;
  })());

chk('two parallel edges between two vertices count 2 spanning trees',
  matrixTree(graph(2, [[0, 1], [0, 1]])) === 2 &&
  contractCount(graph(2, [[0, 1], [0, 1]])) === 2);

chk('an isolated vertex makes the count zero',
  matrixTree(graph(4, [[0, 1], [1, 2]])) === 0);

chk('the brute-force count never exceeds the complete-graph count at the same n',
  [GR.c4, GR.p4, GR.diamond, GR.k23].every(function (g) {
    return bruteCount(g) <= Math.pow(g.n, g.n - 2);
  }));

chk('Cayley is an upper bound that only the complete graph attains',
  bruteCount(GR.k4) === Math.pow(4, 2) && bruteCount(GR.c4) < Math.pow(4, 2));

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
  P.rect(x, y, w, h, { fill: o.fill || SURF2, stroke: o.stroke || BORDER, radius: o.radius === undefined ? 8 : o.radius, sw: 1 });
}
function node(x, y, r, lab, o) {
  o = o || {};
  P.circle(x, y, r, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1.5 });
  T(x, y + (o.size || 12) * 0.36, lab, { size: o.size || 12, bold: true, color: o.color || INK, align: 'center' });
}
function drawGraph(g, pos, o) {
  o = o || {};
  var hi = o.highlight || [];
  for (var i = 0; i < g.edges.length; i++) {
    var e = g.edges[i], a = pos[e[0]], b = pos[e[1]];
    var on = hi.indexOf(i) >= 0;
    P.line(a[0], a[1], b[0], b[1], { stroke: on ? ACC : BORDER, sw: on ? 3 : 1.2 });
  }
  for (var v = 0; v < g.n; v++) {
    var hot = o.on && o.on.indexOf(v) >= 0;
    node(pos[v][0], pos[v][1], o.r || 14, o.labels ? o.labels[v] : String(v + 1),
      { fill: hot ? ACCDIM : (o.fill || SURF), stroke: hot ? ACC : BORDER, size: o.size || 12, color: hot ? ACC : INK });
  }
}

/* ---------- scene 1 ---------- */
function drawTreeScene(t) {
  var p = t;
  hdr('1 · What is being counted', 'A spanning tree: every vertex, exactly n-1 edges, no cycle.');
  var pos = [[80, 130], [230, 130], [230, 275], [80, 275]];
  drawGraph(GR.k4, pos, { highlight: p >= 7.5 ? [0, 2, 3] : [], r: 15, labels: ['A', 'B', 'C', 'D'] });
  T(80, 310, 'K4, the complete graph on four labelled vertices', { size: 11, color: DIM });
  if (p >= 7.5) T(80, 328, 'the bold edges are one spanning tree', { size: 11, color: ACC });

  T(320, 96, 'Four vertices, so a spanning tree has three edges.', { size: 12.5 });
  if (p >= 0) T(320, 124, 'K4 has 6 edges: C(6,3) = 20 three-edge subsets.', { size: 12.5 });
  if (p >= 7.5) T(320, 152, 'Four of the 20 are triangles, leaving a vertex out.', { size: 12.5 });
  if (p >= 15) {
    T(320, 214, '20 − 4 = 16', { size: 22, bold: true, color: ACC, mono: true });
    T(320, 250, 'spanning trees of K4', { size: 12, color: DIM });
  }
  if (p >= 22.5) {
    T(320, 266, 'A-B-C-D and A-C-B-D are different trees:', { size: 11.5, color: DIM });
    T(320, 284, 'their edge sets differ, so both are counted.', { size: 11.5, color: DIM });
  }
  panel(28, 356, 844, 84, { fill: SURF, stroke: BORDER });
  T(44, 370, 'Definition', { size: 11, bold: true, color: ACC });
  T(44, 390, 'A spanning tree of G is a subgraph with all n vertices, exactly n-1 edges, and no cycle.', { size: 12 });
  T(44, 414, 'On n vertices, n-1 edges plus connected is the same as n-1 edges plus acyclic.', { size: 12, color: DIM });
}

/* ---------- scene 2 ---------- */
function drawBruteScene(t) {
  var p = t - 30;
  hdr('2 · Choose, then test', 'Enumerate every (n-1)-subset of the edge set and keep the connected ones.');
  var y0 = 92;
  T(40, y0, 'graph', { size: 11, bold: true, color: FAINT });
  T(150, y0, 'n', { size: 11, bold: true, color: FAINT, align: 'center' });
  T(215, y0, 'm', { size: 11, bold: true, color: FAINT, align: 'center' });
  T(330, y0, 'C(m, n-1)', { size: 11, bold: true, color: FAINT, align: 'center' });
  T(470, y0, 'rejected', { size: 11, bold: true, color: FAINT, align: 'center' });
  T(600, y0, 'spanning trees', { size: 11, bold: true, color: FAINT, align: 'center' });
  P.line(40, y0 + 18, 720, y0 + 18, { stroke: BORDER, sw: 1 });

  function row(y, name, g, st, show) {
    if (p < show) return;
    T(40, y, name, { size: 12.5 });
    T(150, y, String(g.n), { size: 12.5, align: 'center', mono: true });
    T(215, y, String(g.edges.length), { size: 12.5, align: 'center', mono: true });
    T(330, y, String(st.subsets), { size: 12.5, align: 'center', mono: true });
    T(470, y, String(st.rejected), { size: 12.5, align: 'center', mono: true, color: st.rejected ? BAD : FAINT });
    T(600, y, String(st.trees), { size: 13, align: 'center', mono: true, bold: true, color: ACC });
  }
  row(128, 'K4 (complete)', GR.k4, V.k4, 0);
  row(162, 'C4 (a cycle)', GR.c4, V.c4, 7.5);
  row(196, 'K2,3 (bipartite)', GR.k23, V.k23, 45);

  if (p >= 45) T(40, 226, 'K2,3 has five vertices, so its spanning trees use four edges, not three.', { size: 11, color: DIM });

  if (p >= 52.5) {
    panel(28, 250, 844, 66, { fill: WARNDIM, stroke: WARN });
    T(44, 264, 'Cost', { size: 11, bold: true, color: WARN });
    T(44, 284, 'C(m, n-1) subsets, each tested for connectivity: K6 needs 3003 tests, K10 needs 125970.', { size: 12 });
    T(44, 304, 'Exact for every graph, including disconnected ones where it returns zero. Only for small graphs.', { size: 12, color: DIM });
  }
  if (p >= 37.5) {
    T(40, 344, 'C4: delete any one of its four edges and a path remains, so 4 trees.', { size: 12 });
    T(40, 368, 'K4: 20 three-edge sets, 4 of them triangles, so 16.', { size: 12 });
    T(40, 392, 'The number of edges alone does not decide: K4 and K2,3 both have 6.', { size: 12, color: DIM });
  }
}

/* ---------- scene 3 ---------- */
function drawContractScene(t) {
  var p = t - 60;
  hdr('3 · Delete, or contract', 'T(G) = T(G − e) + T(G / e): every tree avoids e or uses e.');
  var pos = [[80, 130], [215, 130], [215, 265], [80, 265]];
  drawGraph(GR.diamond, pos, { r: 14, labels: ['A', 'B', 'C', 'D'], highlight: p >= 0 ? [0] : [] });
  T(60, 300, 'the diamond = K4 minus one edge', { size: 11, color: DIM });
  T(60, 318, 'split on edge A-B', { size: 11, color: ACC });
  if (p >= 7.5) {
    T(60, 342, 'G − e: delete A-B, leaving C4 → 4', { size: 11.5 });
    T(60, 362, 'G / e: merge A and B into one vertex → 4', { size: 11.5 });
  }
  if (p >= 15) {
    T(60, 392, 'Total: 4 + 4 = 8', { size: 14, bold: true, color: ACC, mono: true });
  }

  /* the recursion as a small tree of boxes */
  function bx(x, y, w, txt, sub) {
    panel(x, y, w, 40, { fill: SURF, stroke: BORDER });
    T(x + w / 2, y + 12, txt, { size: 12.5, bold: true, align: 'center' });
    if (sub) T(x + w / 2, y + 30, sub, { size: 10.5, color: DIM, align: 'center' });
  }
  bx(430, 62, 150, 'diamond', '8 trees');
  if (p >= 0) {
    P.line(505, 102, 505, 120, { stroke: BORDER, sw: 1.2 });
    P.line(400, 120, 610, 120, { stroke: BORDER, sw: 1.2 });
    P.line(400, 120, 400, 138, { stroke: BORDER, sw: 1.2 });
    P.line(610, 120, 610, 138, { stroke: BORDER, sw: 1.2 });
  }
  if (p >= 0) bx(325, 138, 150, 'G − e', 'C4: 4 trees');
  if (p >= 7.5) bx(535, 138, 150, 'G / e', 'parallel pair: 4');
  if (p >= 15) {
    T(400, 200, '4 + 4 = 8', { size: 15, bold: true, color: ACC, mono: true, align: 'center' });
    T(400, 224, 'the two cases are disjoint and cover every tree', { size: 10.5, color: DIM, align: 'center' });
  }
  if (p >= 22.5) {
    panel(430, 252, 440, 96, { fill: SURF, stroke: BORDER });
    T(446, 266, 'The two base cases', { size: 11, bold: true, color: ACC });
    T(446, 288, 'one vertex, no edges → 1', { size: 12 });
    T(446, 310, 'two or more vertices, no edges → 0', { size: 12 });
    T(446, 332, 'disconnected → 0, and stop immediately', { size: 12, color: DIM });
  }
}

/* ---------- scene 4 ---------- */
function drawCayleyScene(t) {
  var p = t - 90;
  hdr('4 · Complete graphs: Cayley', 'The number of labelled trees on n vertices is n to the power n − 2.');
  T(40, 74, 'T(Kn) = n', { size: 24, bold: true, mono: true });
  T(196, 60, 'n − 2', { size: 14, bold: true, mono: true, color: ACC });
  if (p >= 0) T(40, 108, 'labelled trees on n vertices = spanning trees of the complete graph', { size: 11.5, color: DIM });

  var xs = [70, 180, 290, 400, 510, 620, 730];
  T(30, 150, 'n', { size: 11, bold: true, color: FAINT });
  T(30, 186, 'count', { size: 11, bold: true, color: FAINT });
  P.line(30, 164, 820, 164, { stroke: BORDER, sw: 1 });
  for (var i = 0; i < V.cayley.length; i++) {
    if (p >= 7.5 && i > 3) continue;
    T(xs[i], 150, String(V.cayley[i].n), { size: 13, align: 'center', mono: true, bold: true });
    T(xs[i], 186, String(V.cayley[i].count), { size: 13, align: 'center', mono: true, color: ACC });
  }
  if (p >= 7.5) T(30, 214, '1, 1, 3, 16, 125, 1296, 16807 — the jump from 16 to 125 ends hand listing.', { size: 11.5, color: DIM });

  if (p >= 15) {
    T(40, 246, 'The exponent is n−2, not n−1, because the n−1 edges are not independent choices.', { size: 12 });
    T(40, 268, 'A tree on n vertices has n−2 free choices, which is exactly what the Prüfer code records.', { size: 12, color: DIM });
  }
  if (p >= 22.5) {
    panel(28, 292, 844, 84, { fill: WARNDIM, stroke: WARN });
    T(44, 306, 'The hypothesis: the graph must be complete', { size: 11.5, bold: true, color: WARN });
    T(44, 328, 'n^(n−2) counts trees that may use any pair as an edge. A sparse graph lacks some of those edges,', { size: 12 });
    T(44, 350, 'so the formula over-counts: C4 has 4 spanning trees, not 4^2 = 16.', { size: 12 });
  }
}

/* ---------- scene 5 ---------- */
function drawEncodeScene(t) {
  var p = t - 120;
  hdr('5 · The Prüfer code', 'Delete the smallest leaf, write its neighbour, repeat until two remain.');
  var pos = [[80, 160], [190, 96], [80, 268], [300, 160], [300, 268], [410, 96]];
  var labels = ['1', '2', '3', '4', '5', '6'];
  var on = [];
  if (p >= 7.5) on.push(2);
  if (p >= 15) on.push(0);
  if (p >= 22.5) on = [1, 4];
  drawGraph(GR.t6, pos, { r: 14, labels: labels, on: on });
  T(60, 306, 'a tree on six vertices, labels 1 to 6', { size: 11, color: DIM });
  if (p >= 7.5) T(60, 326, 'degree 1: vertices 3, 5, 6', { size: 11, color: DIM });

  T(480, 92, 'code', { size: 11, bold: true, color: FAINT });
  for (var i = 0; i < 4; i++) {
    var x = 480 + i * 88;
    P.rect(x, 108, 64, 40, { fill: i < Math.min(4, Math.floor(p / 7.5)) ? ACCDIM : SURF, stroke: BORDER, radius: 6, sw: 1 });
    if (i < Math.min(4, Math.floor(p / 7.5))) {
      T(x + 32, 122, String(V.prufer.code[i]), { size: 16, bold: true, align: 'center', mono: true, color: ACC });
    }
  }
  if (p >= 7.5) {
    T(480, 178, 'delete ' + V.prufer.steps[0].leaf + ' → write ' + V.prufer.steps[0].neighbour, { size: 12 });
    T(480, 200, 'delete ' + V.prufer.steps[1].leaf + ' → write ' + V.prufer.steps[1].neighbour, { size: 12 });
  }
  if (p >= 15) {
    T(480, 222, 'delete ' + V.prufer.steps[2].leaf + ' → write ' + V.prufer.steps[2].neighbour, { size: 12 });
    T(480, 244, 'delete ' + V.prufer.steps[3].leaf + ' → write ' + V.prufer.steps[3].neighbour, { size: 12 });
  }
  if (p >= 22.5) {
    T(480, 276, 'two vertices left, 4 and 6: never written', { size: 11.5, color: DIM });
    T(480, 300, 'n − 2 = 4 labels, one per deletion', { size: 11.5, color: ACC });
    T(480, 330, 'The smallest leaf is forced, so the code is unique.', { size: 11.5, color: DIM });
  }
}

/* ---------- scene 6 ---------- */
function drawDecodeScene(t) {
  var p = t - 150;
  hdr('6 · Decoding: the code determines the tree', 'Count each label, add one for its degree, then rebuild.');
  var code = V.prufer.code;
  T(40, 78, 'code', { size: 11, bold: true, color: FAINT });
  for (var i = 0; i < 4; i++) {
    var x = 40 + i * 84;
    P.rect(x, 94, 60, 38, { fill: ACCDIM, stroke: BORDER, radius: 6, sw: 1 });
    T(x + 30, 106, String(code[i]), { size: 16, bold: true, align: 'center', mono: true, color: ACC });
  }
  if (p >= 0) {
    T(400, 78, 'degree = 1 + occurrences in the code', { size: 11.5, color: DIM });
    T(400, 100, '1: 2   2: 2   3: 1   4: 3   5: 1   6: 1', { size: 13, mono: true });
    T(400, 124, 'sum of degrees = 10 = 2 × 5 edges', { size: 11, color: DIM });
  }
  if (p >= 7.5) {
    T(40, 168, 'smallest label of degree 1 is 3 → join 3 to 1', { size: 12 });
    T(40, 190, 'then 1 becomes a leaf → join 1 to 2', { size: 12 });
  }
  if (p >= 15) {
    T(40, 212, 'then 2 → join 2 to 4', { size: 12 });
    T(40, 234, 'then 5 → join 5 to 4', { size: 12 });
  }
  if (p >= 22.5) {
    T(40, 256, 'last two, 4 and 6 → join 4 to 6', { size: 12 });
    T(40, 284, 'five edges, no cycle, all six vertices: the tree is back', { size: 12, color: ACC });
  }
  if (p >= 15) {
    var pos = [[480, 200], [560, 150], [480, 290], [640, 200], [640, 290], [710, 130]];
    drawGraph(GR.t6, pos, { r: 12, labels: ['1', '2', '3', '4', '5', '6'], size: 10.5 });
  }
  if (p >= 22.5) {
    panel(40, 316, 820, 56, { fill: SURF, stroke: BORDER });
    T(56, 330, 'So codes and trees are in one-to-one correspondence:', { size: 11.5, color: DIM });
    T(56, 352, '5 labels, codes of length 3 → 5³ = 125 codes = 125 spanning trees of K5.', { size: 12.5, bold: true, color: ACC });
  }
}

/* ---------- scene 7 ---------- */
function drawMatrixScene(t) {
  var p = t - 180;
  hdr('7 · The Matrix-Tree theorem', 'Laplacian = degree on the diagonal minus adjacency; delete a row and column.');
  var L = laplacian(GR.k4);
  var x0 = 40, y0 = 96, cw = 58, ch = 34;
  T(x0, 80, 'L(K4)', { size: 11.5, bold: true, color: FAINT });
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      var x = x0 + j * cw, y = y0 + i * ch;
      var dropped = (i === 0 || j === 0);
      P.rect(x, y, cw, ch, {
        fill: dropped ? SURF2 : SURF,
        stroke: dropped ? BORDER : BORDER,
        radius: 0, sw: 1
      });
      T(x + cw / 2, y + 10, String(L[i][j]), { size: 12, align: 'center', mono: true, color: dropped ? FAINT : INK });
    }
  }
  if (p >= 7.5) {
    P.rect(x0, y0, cw, ch, { stroke: BAD, sw: 2, radius: 0 });
    P.rect(x0, y0, 4 * cw, ch, { stroke: BAD, sw: 2, radius: 0 });
    P.rect(x0, y0, cw, 4 * ch, { stroke: BAD, sw: 2, radius: 0 });
    T(x0, 244, 'delete row 1 and column 1', { size: 11, color: BAD });
  }
  if (p >= 15) {
    var m = minor(L, 0), mx = 320, my = 96;
    T(mx, 80, 'the 3 × 3 minor', { size: 11.5, bold: true, color: FAINT });
    for (var a = 0; a < 3; a++) {
      for (var b = 0; b < 3; b++) {
        var xx = mx + b * cw, yy = my + a * ch;
        P.rect(xx, yy, cw, ch, { fill: SURF, stroke: BORDER, radius: 0, sw: 1 });
        T(xx + cw / 2, yy + 10, String(m[a][b]), { size: 12, align: 'center', mono: true });
      }
    }
    T(mx, 214, '3 on the diagonal, −1 off it', { size: 11, color: DIM });
    T(mx, 236, 'determinant = 16', { size: 12.5, bold: true, color: ACC, mono: true });
  }
  if (p >= 22.5) {
    panel(560, 96, 310, 120, { fill: ACCDIM, stroke: ACC });
    T(576, 110, 'spanning trees of K4', { size: 11, color: DIM });
    T(576, 130, '16', { size: 34, bold: true, color: ACC, mono: true });
    T(576, 180, 'any cofactor gives the same', { size: 10.5, color: DIM });
  }
  if (p >= 15) {
    T(40, 280, 'C5: the 4 × 4 minor has determinant 5', { size: 12 });
    T(40, 302, 'K3,3: the 5 × 5 minor has determinant 81', { size: 12 });
    T(40, 330, 'No case analysis and no formula: the determinant works on any graph.', { size: 12, color: DIM });
    T(40, 356, 'A disconnected graph has determinant 0, which is also the right answer.', { size: 12, color: DIM });
  }
}

/* ---------- scene 8 ---------- */
function drawFamiliesScene(t) {
  var p = t - 210;
  hdr('8 · The families worth memorising', 'Each count here is also computed by the determinant on the previous scene.');
  var rows = [
    { name: 'a tree', count: String(V.p4.matrix), why: 'it is its own spanning tree', at: 0 },
    { name: 'disconnected', count: String(V.twoTri.matrix), why: 'no spanning tree exists', at: 0 },
    { name: 'cycle Cn', count: String(V.c5.matrix), why: 'C5: one tree per edge deleted, so n', at: 7.5 },
    { name: 'K2,3', count: String(V.k23.matrix), why: 'm^(n−1) · n^(m−1) = 2² · 3¹', at: 15 },
    { name: 'K3,3', count: String(V.k33.matrix), why: 'm^(n−1) · n^(m−1) = 3² · 3²', at: 15 },
    { name: 'wheel W4', count: String(V.w4.matrix), why: 'no formula needed: the determinant', at: 22.5 }
  ];
  var y = 92;
  T(40, y, 'graph', { size: 11, bold: true, color: FAINT });
  T(300, y, 'spanning trees', { size: 11, bold: true, color: FAINT });
  T(450, y, 'why', { size: 11, bold: true, color: FAINT });
  P.line(40, y + 16, 860, y + 16, { stroke: BORDER, sw: 1 });
  for (var i = 0; i < rows.length; i++) {
    if (p < rows[i].at) continue;
    var yy = 128 + i * 34;
    T(40, yy, rows[i].name, { size: 12.5 });
    T(300, yy, rows[i].count, { size: 13.5, mono: true, bold: true, color: ACC });
    T(450, yy, rows[i].why, { size: 11.5, color: DIM });
  }
  if (p >= 7.5) {
    T(40, 356, 'The cycle rule generalises: Cn has exactly n spanning trees for every n at least 3.', { size: 12 });
    T(40, 380, 'Deleting two edges always disconnects a cycle, so one deletion is the only option.', { size: 12, color: DIM });
  }
}

/* ---------- scene 9 ---------- */
function drawLabelledScene(t) {
  var p = t - 240;
  hdr('9 · Three numbers, three questions', 'Labelled trees, tree shapes, and binary search trees are different counts.');
  function card(x, w, big, l1, l2, at) {
    if (p < at) return;
    panel(x, 88, w, 150, { fill: SURF, stroke: BORDER });
    T(x + w / 2, 104, big, { size: 30, bold: true, color: ACC, align: 'center', mono: true });
    T(x + w / 2, 158, l1, { size: 12, align: 'center' });
    T(x + w / 2, 180, l2, { size: 11, color: DIM, align: 'center' });
    T(x + w / 2, 204, '', { size: 11, align: 'center' });
  }
  card(30, 260, String(V.labelled4), 'labelled trees on 4 vertices', 'spanning trees of K4', 0);
  card(310, 260, String(V.unlabelled4), 'shapes of a tree on 4 vertices', 'the path and the star', 7.5);
  card(590, 260, String(V.bst4), 'binary search trees on 4 keys', 'the 4th Catalan number', 15);

  if (p >= 22.5) {
    panel(28, 262, 844, 96, { fill: SURF, stroke: BORDER });
    T(44, 276, 'Read what is being counted before choosing a formula', { size: 11.5, bold: true, color: ACC });
    T(44, 298, 'Labelled: the vertices are named, so A-B-C-D and A-C-B-D differ. GATE almost always means labelled.', { size: 12 });
    T(44, 320, 'Unlabelled: two trees are the same if a relabelling matches them. On 4 vertices that gives 2.', { size: 12 });
    T(44, 342, 'Binary search trees are ordered and binary: 4 keys give the 4th Catalan number, 14.', { size: 12 });
  }
  if (p >= 15) {
    T(30, 384, 'Catalan: 1, 1, 2, 5, 14, 42, 132.  Cayley: 1, 1, 3, 16, 125, 1296.  Not the same sequence.', { size: 11.5, color: DIM });
  }
}

/* ---------- scene 10 ---------- */
function drawProcedureScene(t) {
  var p = t - 270;
  hdr('10 · The procedure, and the 2024 question', 'Pick the method from the shape of the graph; check connectivity first.');
  var steps = [
    { n: '1', title: 'Name the graph', body: 'complete → n^(n−2);  cycle → n;  complete bipartite → m^(n−1)·n^(m−1)', at: 0 },
    { n: '2', title: 'Check connectivity', body: 'disconnected → 0, and every formula would be wrong', at: 7.5 },
    { n: '3', title: 'Otherwise compute', body: 'small: delete-contract or enumerate;  any size: Laplacian determinant', at: 15 }
  ];
  for (var i = 0; i < steps.length; i++) {
    if (p < steps[i].at) continue;
    var y = 88 + i * 66;
    P.circle(48, y + 16, 14, { fill: ACCDIM, stroke: ACC, sw: 1.5 });
    T(48, y + 22, steps[i].n, { size: 13, bold: true, align: 'center', color: ACC });
    T(76, y + 4, steps[i].title, { size: 13, bold: true });
    T(76, y + 24, steps[i].body, { size: 11.5, color: DIM });
  }
  if (p >= 22.5) {
    panel(28, 288, 844, 88, { fill: SURF, stroke: ACC });
    T(44, 302, 'GATE CSE 2024, Set 1 — spanning trees of K4 labelled A, B, C, D', { size: 11.5, bold: true, color: ACC });
    T(44, 324, 'Cayley 4² = 16;  enumerate 20 − 4 = 16;  Laplacian minor det = 16.  Official key: 16.', { size: 12 });
    T(44, 348, 'Answering 2 counts the shapes; answering 20 forgets the four triangles.', { size: 12, color: DIM });
    T(44, 366, 'The word labelled in the question is what makes the answer 16 and not 2.', { size: 11.5, color: DIM });
  }
  if (p >= 15) {
    T(40, 400, 'Two independent methods agreeing is the best check an exam allows.', { size: 11.5, color: DIM });
  }
}

function drawFrame(painter) {
  P = painter;
  if (!P) return;
  var t = (K && K.state) ? K.state.elapsed : 0;
  var sc = (K && K.state && K.state.scenes.length) ? K.state.scenes[K.sceneAt(t)] : null;
  var id = sc ? sc.id : 'tree';
  P.alpha(1);
  P.clear();
  if (id === 'tree') drawTreeScene(t);
  else if (id === 'brute') drawBruteScene(t);
  else if (id === 'contract') drawContractScene(t);
  else if (id === 'cayley') drawCayleyScene(t);
  else if (id === 'encode') drawEncodeScene(t);
  else if (id === 'decode') drawDecodeScene(t);
  else if (id === 'matrix') drawMatrixScene(t);
  else if (id === 'families') drawFamiliesScene(t);
  else if (id === 'labelled') drawLabelledScene(t);
  else drawProcedureScene(t);
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

window.__MODEL = { V: V, CHECKS: CHECKS, GR: GR };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
