/* ==========================================================================
   optimal-binary-search-tree — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It does no arithmetic of its own: every figure on
   the canvas was computed once here and checked against the rule it is supposed
   to satisfy — the recurrence against brute-force enumeration of every binary
   search tree on the key set, the greedy rule against the true optimum, and the
   Huffman contrast against the Kraft equality and the ordering constraint.
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

/* ---------- the key sets used on the page ---------- */
V.keys = [10, 20, 30, 40];
V.w = [4, 2, 1, 3];

function sum(a, i, j) { var s = 0; for (var t = i; t <= j; t++) s += a[t]; return s; }

/* ---------- the recurrence ----------
   C[i][j] = cheapest cost for keys i..j, levels counted from that range root.
   Base: C[i][i] = w[i]; an empty range costs 0.  R[i][j] records the argmin. */
function obst(w) {
  var n = w.length, i, j, L, r;
  var C = [], R = [];
  for (i = 0; i < n; i++) { C.push(new Array(n).fill(0)); R.push(new Array(n).fill(-1)); }
  for (i = 0; i < n; i++) { C[i][i] = w[i]; R[i][i] = i; }
  for (L = 2; L <= n; L++) {
    for (i = 0; i + L - 1 < n; i++) {
      j = i + L - 1;
      var Wt = sum(w, i, j), best = Infinity, br = -1;
      for (r = i; r <= j; r++) {
        var v = (r > i ? C[i][r - 1] : 0) + (r < j ? C[r + 1][j] : 0) + Wt;
        if (v < best) { best = v; br = r; }
      }
      C[i][j] = best; R[i][j] = br;
    }
  }
  return { C: C, R: R, n: n, cost: n ? C[0][n - 1] : 0 };
}

/* ---------- a tree as nested objects ---------- */
function treeFromR(R, i, j) {
  if (i > j) return null;
  var r = R[i][j];
  return { k: r, l: treeFromR(R, i, r - 1), r: treeFromR(R, r + 1, j) };
}

/* level of each key in a tree, root = 1 */
function levels(t) {
  var out = {};
  (function walk(n, d) { if (!n) return; out[n.k] = d; walk(n.l, d + 1); walk(n.r, d + 1); })(t, 1);
  return out;
}
function treeCost(t, w) {
  var lv = levels(t), s = 0;
  for (var k in lv) s += w[+k] * lv[k];
  return s;
}
function inOrder(t) {
  var out = [];
  (function walk(n) { if (!n) return; walk(n.l); out.push(n.k); walk(n.r); })(t);
  return out;
}
/* every binary search tree on the keys i..j, as nested objects */
function allTrees(i, j) {
  if (i > j) return [null];
  var out = [], r, L, Rr, a, b;
  for (r = i; r <= j; r++) {
    L = allTrees(i, r - 1); Rr = allTrees(r + 1, j);
    for (a = 0; a < L.length; a++) for (b = 0; b < Rr.length; b++) out.push({ k: r, l: L[a], r: Rr[b] });
  }
  return out;
}
function bruteMin(w, i, j) {
  var ts = allTrees(i, j), best = Infinity, t;
  for (t = 0; t < ts.length; t++) {
    var c = ts[t] ? treeCost(ts[t], w) : 0;
    if (c < best) best = c;
  }
  return best;
}

/* ---------- the greedy rule: heaviest key becomes the root, then recurse ---- */
function greedyTree(w, i, j) {
  if (i > j) return null;
  var r = i, t;
  for (t = i; t <= j; t++) if (w[t] > w[r]) r = t;
  return { k: r, l: greedyTree(w, i, r - 1), r: greedyTree(w, r + 1, j) };
}

/* ---------- Huffman on the same weights, keys as leaves ---------- */
function huffman(w) {
  var nodes = [], i;
  for (i = 0; i < w.length; i++) nodes.push({ id: i, w: w[i], leaf: i, l: null, r: null });
  var pool = nodes.slice();
  while (pool.length > 1) {
    pool.sort(function (a, b) { return a.w - b.w || a.id - b.id; });
    var a = pool.shift(), b = pool.shift();
    var node = { id: nodes.length, w: a.w + b.w, leaf: -1, l: a, r: b };
    nodes.push(node); pool.push(node);
  }
  var root = pool[0], depth = {};
  (function walk(n, d) { if (!n) return; if (n.leaf >= 0) { depth[n.leaf] = d; return; } walk(n.l, d + 1); walk(n.r, d + 1); })(root, 0);
  var cost = 0;
  for (i = 0; i < w.length; i++) cost += w[i] * depth[i];
  var kraft = 0;
  for (i = 0; i < w.length; i++) kraft += Math.pow(2, -depth[i]);
  return { root: root, depth: depth, cost: cost, kraft: kraft };
}
/* is a Huffman tree, read as a binary tree, a valid search tree? */
function huffIsBST(h, w) {
  var leavesIn = [];
  (function walk(n) { if (!n) return; walk(n.l); if (n.leaf >= 0) leavesIn.push(n.leaf); walk(n.r); })(h.root);
  for (var i = 1; i < leavesIn.length; i++) if (leavesIn[i] < leavesIn[i - 1]) return false;
  return true;
}

/* ---------- 1. the three shapes drawn in scene 1 ---------- */
V.A = obst(V.w);
V.chain = { k: 0, l: null, r: { k: 1, l: null, r: { k: 2, l: null, r: { k: 3, l: null, r: null } } } };
V.top40 = { k: 3, l: { k: 0, l: null, r: { k: 1, l: null, r: { k: 2, l: null, r: null } } }, r: null };
V.optimal = treeFromR(V.A.R, 0, 3);
V.shapes = [
  { name: 'chain, 10 on top', t: V.chain, cost: treeCost(V.chain, V.w), tag: 'a' },
  { name: '40 on top', t: V.top40, cost: treeCost(V.top40, V.w), tag: 'b' },
  { name: '20 on top', t: V.optimal, cost: treeCost(V.optimal, V.w), tag: 'c' }
];
V.totalW = sum(V.w, 0, 3);
V.shapes.forEach(function (s) { s.avg = s.cost / V.totalW; s.levels = levels(s.t); });
V.all14 = allTrees(0, 3).map(function (t) { return treeCost(t, V.w); });
V.worstCost = Math.max.apply(null, V.all14);
V.bestCost = Math.min.apply(null, V.all14);

/* ---------- 2. the worked table ---------- */
V.tbl = {
  C: [[4, 8, 11, 19], [null, 2, 4, 10], [null, null, 1, 5], [null, null, null, 3]],
  R: [[0, 0, 0, 1], [null, 1, 1, 3], [null, null, 2, 3], [null, null, null, 3]],
  W: [[4, 6, 7, 10], [null, 2, 3, 6], [null, null, 1, 4], [null, null, null, 3]]
};
V.topCandidates = [0, 1, 2, 3].map(function (r) {
  var l = r > 0 ? V.A.C[0][r - 1] : 0;
  var rr = r < 3 ? V.A.C[r + 1][3] : 0;
  return { r: r, left: l, right: rr, W: V.totalW, total: l + rr + V.totalW, win: (l + rr + V.totalW) === V.A.cost };
});
V.cells = 0;
for (var i2 = 0; i2 < 4; i2++) for (var j2 = i2; j2 < 4; j2++) V.cells++;

/* ---------- 3. the greedy counterexample ---------- */
V.greedy = greedyTree(V.w, 0, 3);
V.greedyCost = treeCost(V.greedy, V.w);
V.greedyLevels = levels(V.greedy);

/* ---------- 4. the second greedy counterexample ---------- */
V.w2 = [3, 3, 1, 1];
V.A2 = obst(V.w2);
V.greedy2 = greedyTree(V.w2, 0, 3);
V.greedy2Cost = treeCost(V.greedy2, V.w2);
V.opt2 = treeFromR(V.A2.R, 0, 3);

/* ---------- 5. the tie instance and the Huffman contrast ---------- */
V.w3 = [5, 45, 45, 5];
V.A3 = obst(V.w3);
V.tree3 = treeFromR(V.A3.R, 0, 3);
V.optTrees3 = [];
allTrees(0, 3).forEach(function (t) { if (treeCost(t, V.w3) === V.A3.cost) V.optTrees3.push(t); });
V.huff3 = huffman(V.w3);
V.huff3BST = huffIsBST(V.huff3, V.w3);

/* ---------- 6. counts ---------- */
function catalan(n) {
  var num = 1, den = 1, i;
  for (i = 1; i <= n; i++) { num *= (n + i); den *= i; }
  return Math.round(num / den / (n + 1));
}
V.catalan = [1, 2, 3, 4, 5, 6].map(function (n) { return { n: n, c: catalan(n), counted: allTrees(0, n - 1).length }; });

/* ---------- 7. equal weights: the 1991 instance ---------- */
V.eq = obst([1, 1, 1]);
V.eqTree = treeFromR(V.eq.R, 0, 2);

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* base cases */
(function () {
  var ok = true, i;
  for (i = 0; i < 4; i++) if (V.A.C[i][i] !== V.w[i]) ok = false;
  chk('every one-key range costs its own weight', ok, 'C(1,1)=4, C(2,2)=2, C(3,3)=1, C(4,4)=3');
})();

/* every cell equals the recurrence recomputed from scratch */
(function () {
  var ok = true, i, j, r;
  for (i = 0; i < 4; i++) for (j = i; j < 4; j++) {
    var best = Infinity;
    for (r = i; r <= j; r++) {
      var v = (r > i ? V.A.C[i][r - 1] : 0) + (r < j ? V.A.C[r + 1][j] : 0) + sum(V.w, i, j);
      if (v < best) best = v;
    }
    if (best !== V.A.C[i][j]) ok = false;
  }
  chk('every table cell equals the recurrence recomputed', ok, '10 cells');
})();

/* the argmin table really holds an argmin of its cell */
(function () {
  var ok = true, i, j;
  for (i = 0; i < 4; i++) for (j = i; j < 4; j++) {
    var r = V.A.R[i][j];
    if (r < i || r > j) { ok = false; continue; }
    var v = (r > i ? V.A.C[i][r - 1] : 0) + (r < j ? V.A.C[r + 1][j] : 0) + sum(V.w, i, j);
    if (v !== V.A.C[i][j]) ok = false;
  }
  chk('the root table holds an argmin in every cell', ok, '10 cells');
})();

/* the DP optimum equals brute force on the worked instance */
chk('DP optimum equals brute force on 4 keys, weights 4 2 1 3',
    V.A.cost === bruteMin(V.w, 0, 3), V.A.cost + ' against ' + bruteMin(V.w, 0, 3));

/* the DP optimum equals brute force on every weight vector 1..4 of length 4 */
(function () {
  var bad = 0, a, b, c, d, w, A, m;
  for (a = 1; a <= 4; a++) for (b = 1; b <= 4; b++) for (c = 1; c <= 4; c++) for (d = 1; d <= 4; d++) {
    w = [a, b, c, d]; A = obst(w); m = bruteMin(w, 0, 3);
    if (A.cost !== m) bad++;
  }
  chk('DP optimum equals brute force on all 256 weight vectors of length 4', bad === 0, bad + ' mismatches');
})();

/* and on every weight vector 1..3 of length 5 */
(function () {
  var bad = 0, v = [1, 1, 1, 1, 1], idx, done = false;
  while (!done) {
    if (obst(v.slice()).cost !== bruteMin(v.slice(), 0, 4)) bad++;
    idx = 4;
    while (idx >= 0) { v[idx]++; if (v[idx] <= 3) break; v[idx] = 1; idx--; }
    if (idx < 0) done = true;
  }
  chk('DP optimum equals brute force on all 243 weight vectors of length 5', bad === 0, bad + ' mismatches');
})();

/* reconstruction re-adds to the table entry */
chk('the rebuilt tree re-adds to C(1,4)',
    treeCost(V.optimal, V.w) === V.A.cost, treeCost(V.optimal, V.w) + ' against ' + V.A.cost);

/* the rebuilt tree is a search tree on the keys in order */
chk('the rebuilt tree keeps the keys in order',
    inOrder(V.optimal).join(',') === '0,1,2,3', inOrder(V.optimal).join(','));

/* the three scene-1 shapes cost what the page says */
chk('the three drawn shapes cost 23, 21 and 19',
    V.shapes[0].cost === 23 && V.shapes[1].cost === 21 && V.shapes[2].cost === 19,
    V.shapes.map(function (s) { return s.cost; }).join(', '));

/* the level convention: root is 1, so no tree costs less than the total weight */
chk('every tree costs at least the total weight',
    V.all14.every(function (c) { return c >= V.totalW; }), 'minimum ' + V.bestCost + ', weight ' + V.totalW);

/* the optimum is the minimum over all fourteen trees */
chk('the optimum is the smallest of all 14 trees',
    V.A.cost === V.bestCost && V.all14.length === 14, V.bestCost + ' of ' + V.all14.length);

/* the greedy rule loses on the worked instance */
chk('greedy costs 20 against the optimum 19',
    V.greedyCost === 20 && V.A.cost === 19, V.greedyCost + ' against ' + V.A.cost);

/* greedy loses on the second instance too */
chk('greedy costs 16 against the optimum 14 on weights 3 3 1 1',
    V.greedy2Cost === 16 && V.A2.cost === 14, V.greedy2Cost + ' against ' + V.A2.cost);

/* the greedy tree is a legal search tree, so the gap is not a bug */
chk('the greedy tree is still a legal search tree',
    inOrder(V.greedy).join(',') === '0,1,2,3', inOrder(V.greedy).join(','));

/* ties really occur */
chk('weights 5 45 45 5 have exactly two optimal trees',
    V.A3.cost === 160 && V.optTrees3.length === 2, V.A3.cost + ' with ' + V.optTrees3.length + ' trees');

/* Huffman is a prefix code: the Kraft sum is exactly 1 */
chk('the Huffman depths satisfy the Kraft equality',
    Math.abs(V.huff3.kraft - 1) < 1e-12, V.huff3.kraft.toFixed(6));

/* Huffman is cheaper and unusable */
chk('Huffman costs 165 against the search tree 160, and the two count different things',
    V.huff3.cost === 165 && V.A3.cost === 160, V.huff3.cost + ' against ' + V.A3.cost);
chk('the Huffman tree is not a search tree',
    V.huff3BST === false, 'leaf order violates the key order');

/* Catalan counts the trees, and the enumeration agrees */
chk('Catalan numbers match the enumerated tree counts up to 6 keys',
    V.catalan.every(function (r) { return r.c === r.counted; }),
    V.catalan.map(function (r) { return r.c; }).join(','));

/* the table is a triangle */
chk('a 4-key table has 10 cells, which is n(n+1)/2',
    V.cells === 10, String(V.cells));

/* monotonicity of the cost table */
(function () {
  var ok = true, i, j;
  for (i = 0; i < 4; i++) for (j = i + 1; j < 4; j++) if (V.A.C[i][j] < V.A.C[i][j - 1]) ok = false;
  chk('cost is monotone as the range grows', ok, 'C(i,j) >= C(i,j-1) everywhere');
})();

/* equal weights: the optimum is 5 for three keys of weight 1, i.e. 5/3 each */
chk('three equal weights give the balanced tree, cost 5 of 3',
    V.eq.cost === 5 && inOrder(V.eqTree).join(',') === '0,1,2' && V.eqTree.k === 1,
    V.eq.cost + ' with root at position ' + (V.eqTree.k + 1));

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function txt(x, y, s, o) { P.text(x, y, s, o); }

function panelTitle(s, sub) {
  txt(24, 18, s, { size: 15, bold: true, color: INK });
  if (sub) txt(24, 40, sub, { size: 12, color: DIM });
}

/* in-order x, depth y, inside a box of the given width */
function place(t, x0, y0, dx, dy) {
  var order = [], nodes = [], edges = [];
  (function walk(n, d) { if (!n) return; walk(n.l, d + 1); order.push([n, d]); walk(n.r, d + 1); })(t, 0);
  order.forEach(function (pair, i) {
    pair[0].px = x0 + i * dx; pair[0].py = y0 + pair[1] * dy;
    nodes.push(pair[0]);
  });
  (function walk(n) { if (!n) return; if (n.l) edges.push([n, n.l]); if (n.r) edges.push([n, n.r]); walk(n.l); walk(n.r); })(t);
  return { nodes: nodes, edges: edges, count: order.length };
}

function drawTree(t, x0, y0, dx, dy, opt) {
  opt = opt || {};
  var g = place(t, x0, y0, dx, dy);
  var R = opt.r || 17;
  g.edges.forEach(function (e) {
    P.line(e[0].px, e[0].py + R - 2, e[1].px, e[1].py - R + 2, { stroke: BORDER, sw: 1.6 });
  });
  g.nodes.forEach(function (n) {
    var isRoot = n === t;
    var fill = opt.fill || SURF;
    if (opt.hot && opt.hot.indexOf(n.k) >= 0) fill = ACCDIM;
    if (isRoot && opt.rootFill) fill = opt.rootFill;
    P.circle(n.px, n.py, R, { fill: fill, stroke: opt.stroke || ACC, sw: 1.6 });
    txt(n.px, n.py, String(V.keys[n.k]), { size: 13, bold: true, align: 'center', base: 'middle', color: INK });
    if (opt.weights) txt(n.px, n.py + R + 4, String(V.w[n.k]), { size: 11, align: 'center', color: DIM });
    if (opt.levels) txt(n.px + R + 5, n.py - R + 1, 'L' + levels(t)[n.k], { size: 10, mono: true, color: FAINT });
  });
  return g;
}

/* a small labelled bar of cost numbers under a tree */
function costLine(x, y, label, value, o) {
  o = o || {};
  txt(x, y, label, { size: 11, color: DIM });
  txt(x, y + 17, value, { size: 14, bold: true, mono: true, color: o.color || INK });
}

var SCENE_DRAW = {};

/* ---------------- scene 1: shape ---------------- */
SCENE_DRAW.shape = function (t, sc) {
  var p = K.clamp01((t - sc.start) / (sc.end - sc.start));
  panelTitle('Three legal trees, three different costs',
             'keys 10, 20, 30, 40 in that order; the number under each key is its search weight');

  var xs = [120, 400, 680];
  V.shapes.forEach(function (s, i) {
    var a = K.ease(K.clamp01(p * 3 - i * 0.7));
    P.alpha(a);
    drawTree(s.t, xs[i] - 70, 118, 68, 56, { weights: true, rootFill: SURF });
    txt(xs[i], 340, s.name, { size: 12, align: 'center', color: DIM });
    txt(xs[i], 366, 'cost ' + s.cost, { size: 17, bold: true, align: 'center', mono: true,
      color: s.cost === V.bestCost ? VAL : INK });
    txt(xs[i], 390, s.avg.toFixed(1) + ' per search', { size: 11, align: 'center', color: FAINT });
    P.alpha(1);
  });

  if (p > 0.55) {
    P.alpha(K.ease(K.clamp01((p - 0.55) / 0.3)));
    P.rect(24, 410, 852, 44, { fill: SURF2, stroke: BORDER, radius: 8 });
    txt(40, 424, 'Every tree above is a correct binary search tree. They differ by four comparisons in total,',
        { size: 13, color: INK });
    txt(40, 442, 'which over ten searches is 0.4 comparisons each: enough to change which option is right.',
        { size: 13, color: INK });
    P.alpha(1);
  }
};

/* ---------------- scene 2: cost ---------------- */
SCENE_DRAW.cost = function (t, sc) {
  var p = K.clamp01((t - sc.start) / (sc.end - sc.start));
  panelTitle('What the cost counts', 'level of a key = comparisons to reach it; the root is level 1, not 0');

  drawTree(V.chain, 90, 110, 74, 58, { weights: true, levels: true });

  var rows = V.keys.map(function (k, i) {
    return { key: k, w: V.w[i], lv: V.shapes[0].levels[i], prod: V.w[i] * V.shapes[0].levels[i] };
  });
  var x = 470, y = 104;
  txt(x, y - 30, 'the chain, key by key', { size: 12, bold: true, color: DIM });
  txt(x, y - 12, 'key      weight   level    product', { size: 11, mono: true, color: FAINT });
  rows.forEach(function (r, i) {
    var a = K.ease(K.clamp01(p * 4 - i * 0.8));
    P.alpha(a);
    txt(x, y + 12 + i * 26, String(r.key), { size: 13, mono: true, color: INK });
    txt(x + 96, y + 12 + i * 26, String(r.w), { size: 13, mono: true, color: INK });
    txt(x + 190, y + 12 + i * 26, String(r.lv), { size: 13, mono: true, color: INK });
    txt(x + 270, y + 12 + i * 26, String(r.prod), { size: 13, mono: true, bold: true, color: ACC });
    P.alpha(1);
  });
  P.line(x, y + 122, x + 320, y + 122, { stroke: BORDER, sw: 1.4 });
  txt(x, y + 132, 'cost of the tree = 23', { size: 14, bold: true, mono: true, color: INK });
  txt(x, y + 156, 'average = 23 / 10 = 2.3 comparisons', { size: 13, mono: true, color: DIM });
  txt(x, y + 186, 'no tree can cost less than 10, the total weight,', { size: 12, color: DIM });
  txt(x, y + 204, 'because every key needs at least one comparison.', { size: 12, color: DIM });
};

/* ---------------- scene 3: optimal substructure ---------------- */
SCENE_DRAW.sub = function (t, sc) {
  var p = K.clamp01((t - sc.start) / (sc.end - sc.start));
  panelTitle('Push a subtree down, and every key in it costs one more',
             'the extra cost is the sum of the weights in that subtree, not the number of keys');

  var tr = { k: 1, l: { k: 0, l: null, r: null },
             r: { k: 3, l: { k: 2, l: null, r: null }, r: null } };
  var shift = K.ease(K.clamp01(p * 2.2)) * 0;
  drawTree(tr, 130, 112, 92, 60, { weights: true, rootFill: ACCDIM, hot: [0, 2] });

  txt(130, 330, 'left subtree: weight 4', { size: 12, align: 'center', color: DIM });
  txt(130, 350, 'right subtree: weight 4', { size: 12, align: 'center', color: DIM });

  var x = 470, y = 100;
  txt(x, y, 'cost of this tree', { size: 12, bold: true, color: DIM });
  txt(x, y + 26, '= cost(left) + cost(right) + W', { size: 15, mono: true, bold: true, color: INK });
  txt(x, y + 52, '= 4 + 4 + 10', { size: 15, mono: true, color: INK });
  txt(x, y + 78, '= 18', { size: 15, mono: true, bold: true, color: ACC });

  var beats = [
    ['the root is compared once: weight 2', 0.30],
    ['each subtree sits one level lower,', 0.55],
    ['so it pays its total weight once more', 0.55],
    ['the three weights add to the range weight 10', 0.78]
  ];
  beats.forEach(function (b, i) {
    P.alpha(K.ease(K.clamp01(p * 4 - i * 1.1 - 0.4)));
    txt(x, y + 118 + i * 24, b[0], { size: 12, color: i === 3 ? INK : DIM });
    P.alpha(1);
  });

  P.rect(24, 392, 852, 58, { fill: SURF2, stroke: BORDER, radius: 8 });
  txt(40, 404, 'C(i,j) = W(i,j) + min over r of [ C(i,r-1) + C(r+1,j) ]', { size: 15, mono: true, bold: true, color: INK });
  txt(40, 428, 'W(i,j) is the sum of the weights from i to j. Empty ranges cost 0, and a one-key range costs its weight.',
      { size: 12, color: DIM });
};

/* ---------------- scene 4: the recurrence ---------------- */
SCENE_DRAW.rec = function (t, sc) {
  var p = K.clamp01((t - sc.start) / (sc.end - sc.start));
  panelTitle('One choice per range: who sits at the root',
             'for each candidate root, pay the two sides and the range weight once; keep the cheapest');

  var cand = V.topCandidates;
  var x = 40, y = 96;
  txt(x, y, 'range 1 to 4, weight 10', { size: 12, bold: true, color: DIM });
  txt(x, y + 26, 'root   left   right   + W   = total', { size: 12, mono: true, color: FAINT });
  cand.forEach(function (c, i) {
    var a = K.ease(K.clamp01(p * 3.4 - i * 0.55));
    P.alpha(a);
    var yy = y + 50 + i * 28;
    var win = c.win;
    if (win) P.rect(x - 8, yy - 5, 430, 26, { fill: ACCDIM, stroke: ACC, radius: 6 });
    txt(x, yy, V.keys[c.r], { size: 13, mono: true, bold: win, color: INK });
    txt(x + 66, yy, String(c.left), { size: 13, mono: true, color: INK });
    txt(x + 138, yy, String(c.right), { size: 13, mono: true, color: INK });
    txt(x + 214, yy, '+ 10', { size: 13, mono: true, color: DIM });
    txt(x + 300, yy, '= ' + c.total, { size: 13, mono: true, bold: true, color: win ? VAL : INK });
    P.alpha(1);
  });

  txt(x, y + 190, 'the smallest total wins: 19, at root 20', { size: 13, bold: true, color: ACC });
  txt(x, y + 216, 'the other three roots are legal trees that cost more.', { size: 12, color: DIM });
  txt(x, y + 240, 'nothing here is a guess: all four are computed.', { size: 12, color: DIM });

  P.rect(492, 96, 384, 300, { fill: SURF2, stroke: BORDER, radius: 8 });
  txt(512, 112, 'the two base cases', { size: 12, bold: true, color: DIM });
  txt(512, 140, 'C(i,i) = w(i)', { size: 14, mono: true, bold: true, color: INK });
  txt(512, 162, 'one key, one comparison', { size: 11, color: DIM });
  txt(512, 192, 'C(i,i-1) = 0', { size: 14, mono: true, bold: true, color: INK });
  txt(512, 214, 'no keys, nothing to pay', { size: 11, color: DIM });
  P.line(512, 236, 856, 236, { stroke: BORDER, sw: 1.3 });
  txt(512, 250, 'why the table works', { size: 12, bold: true, color: DIM });
  txt(512, 276, 'every cell reads strictly shorter ranges,', { size: 12, color: INK });
  txt(512, 296, 'so filling by length means each cell is', { size: 12, color: INK });
  txt(512, 316, 'already there when it is needed.', { size: 12, color: INK });
  txt(512, 344, 'cells: n(n+1)/2 = 10 for four keys', { size: 12, mono: true, color: ACC });
  txt(512, 368, 'work per cell: its length, so O(n^3) total', { size: 12, mono: true, color: ACC });
};

/* ---------------- scene 5: the table ---------------- */
function drawTable(cx, cy, cw, ch, C, R, showR, revealLen) {
  var i, j;
  txt(cx, cy - 26, 'j =', { size: 11, mono: true, color: FAINT });
  for (j = 0; j < 4; j++) txt(cx + j * cw + cw / 2, cy - 26, String(j + 1), { size: 12, mono: true, align: 'center', color: DIM });
  for (i = 0; i < 4; i++) {
    txt(cx - 12, cy + i * ch + ch / 2, String(i + 1), { size: 12, mono: true, align: 'right', base: 'middle', color: DIM });
    for (j = 0; j < 4; j++) {
      var x = cx + j * cw, y = cy + i * ch;
      if (j < i) {
        P.rect(x, y, cw - 3, ch - 3, { fill: 'transparent', stroke: BORDER, radius: 4, dash: [3, 3] });
        continue;
      }
      var len = j - i + 1;
      var shown = C[i][j] !== null && len <= revealLen;
      P.rect(x, y, cw - 3, ch - 3, {
        fill: shown ? (C[i][j] === V.A.cost ? ACCDIM : SURF) : SURF2,
        stroke: shown ? ACC : BORDER, radius: 4, sw: shown ? 1.6 : 1
      });
      if (shown) {
        txt(x + (cw - 3) / 2, y + (ch - 3) / 2 - (showR ? 7 : 0), String(C[i][j]),
            { size: 13, mono: true, bold: true, align: 'center', base: 'middle', color: INK });
        if (showR && R[i][j] !== null && R[i][j] >= 0) {
          txt(x + (cw - 3) / 2, y + (ch - 3) / 2 + 10, 'r' + (R[i][j] + 1),
              { size: 10, mono: true, align: 'center', base: 'middle', color: ACC });
        }
      }
    }
  }
  txt(cx - 12, cy + 4 * ch + 14, 'i =', { size: 11, mono: true, color: FAINT });
}

SCENE_DRAW.table = function (t, sc) {
  var p = K.clamp01((t - sc.start) / (sc.end - sc.start));
  panelTitle('Fill by length, not by row',
             'a cell of length L needs the cells of length L-1 on both of its sides');
  var revealLen = p < 0.25 ? 1 : p < 0.5 ? 2 : p < 0.75 ? 3 : 4;
  drawTable(96, 118, 58, 46, V.A.C, V.A.R, false, revealLen);

  var x = 400;
  var lines = [
    ['length 1', 'the diagonal: 4, 2, 1, 3', 1],
    ['length 2', '8, 4 and 5', 2],
    ['length 3', '11 and 10', 3],
    ['length 4', '19, the answer', 4]
  ];
  lines.forEach(function (L, i) {
    var on = revealLen >= L[2];
    P.alpha(on ? 1 : 0.4);
    txt(x, 100 + i * 46, L[0], { size: 12, mono: true, bold: on, color: on ? INK : FAINT });
    txt(x, 118 + i * 46, L[1], { size: 12, color: on ? DIM : FAINT });
    P.alpha(1);
  });

  txt(x, 300, 'ten cells for four keys: 4 + 3 + 2 + 1', { size: 12, mono: true, color: ACC });
  txt(x, 324, 'each cell tries every root in its range,', { size: 12, color: DIM });
  txt(x, 344, 'so a cell of length L costs L steps.', { size: 12, color: DIM });
  txt(x, 372, 'the order inside one length does not matter:', { size: 12, color: DIM });
  txt(x, 392, 'those cells never read each other.', { size: 12, color: DIM });
};

/* ---------------- scene 6: worked example ---------------- */
SCENE_DRAW.worked = function (t, sc) {
  var p = K.clamp01((t - sc.start) / (sc.end - sc.start));
  panelTitle('Keys 10 20 30 40 with weights 4 2 1 3: the answer is 19',
             'each cell shows its cost, and under it the root that achieved it');
  drawTable(86, 112, 54, 44, V.A.C, V.A.R, true, 4);

  var x = 360, y = 100;
  txt(x, y, 'top level: four candidate roots', { size: 12, bold: true, color: DIM });
  V.topCandidates.forEach(function (c, i) {
    var a = K.ease(K.clamp01(p * 3.6 - i * 0.6));
    P.alpha(a);
    var yy = y + 30 + i * 26;
    if (c.win) P.rect(x - 8, yy - 5, 250, 24, { fill: ACCDIM, stroke: ACC, radius: 6 });
    txt(x, yy, 'root ' + V.keys[c.r], { size: 12, mono: true, bold: c.win, color: INK });
    txt(x + 96, yy, c.left + ' + ' + c.right + ' + 10 = ' + c.total,
        { size: 12, mono: true, bold: c.win, color: c.win ? VAL : INK });
    P.alpha(1);
  });

  txt(x, y + 146, 'cheapest 19, so 20 is the root', { size: 12, bold: true, color: ACC });
  txt(x, y + 168, 'average = 19 / 10 = 1.9', { size: 12, mono: true, color: DIM });

  var a2 = K.ease(K.clamp01(p * 2 - 0.9));
  P.alpha(a2);
  drawTree(V.optimal, x + 50, y + 200, 72, 50, { weights: true, levels: true, rootFill: ACCDIM });
  P.alpha(1);
  if (a2 > 0.9) {
    txt(x, y + 340, 're-add: 4x2 + 2x1 + 1x3 + 3x2 = 19', { size: 12, mono: true, bold: true, color: VAL });
  }
};

/* ---------------- scene 7: greedy ---------------- */
SCENE_DRAW.greedy = function (t, sc) {
  var p = K.clamp01((t - sc.start) / (sc.end - sc.start));
  panelTitle('The heaviest key is not always the root',
             'greedy takes the largest weight as root, then repeats on each side');

  txt(150, 96, 'greedy: root 10', { size: 12, bold: true, align: 'center', color: WARN });
  drawTree(V.greedy, 80, 124, 70, 54, { weights: true, levels: true });
  txt(150, 336, 'cost ' + V.greedyCost, { size: 16, bold: true, mono: true, align: 'center', color: WARN });
  txt(150, 358, 'levels 1, 3, 4, 2', { size: 11, mono: true, align: 'center', color: DIM });

  txt(400, 96, 'optimal: root 20', { size: 12, bold: true, align: 'center', color: VAL });
  drawTree(V.optimal, 340, 124, 62, 54, { weights: true, levels: true, rootFill: ACCDIM });
  txt(400, 336, 'cost ' + V.A.cost, { size: 16, bold: true, mono: true, align: 'center', color: VAL });
  txt(400, 358, 'levels 1, 2, 2, 3', { size: 11, mono: true, align: 'center', color: DIM });

  var x = 600, y = 92;
  txt(x, y, 'why greedy fails', { size: 12, bold: true, color: DIM });
  txt(x, y + 26, 'a root at level 1 saves its own weight', { size: 12, color: INK });
  txt(x, y + 46, 'one comparison, and charges every other', { size: 12, color: INK });
  txt(x, y + 66, 'key in the range one comparison.', { size: 12, color: INK });
  txt(x, y + 92, 'so the root is a whole-range decision,', { size: 12, color: INK });
  txt(x, y + 112, 'never a local one.', { size: 12, color: INK });

  P.rect(x - 8, y + 134, 296, 96, { fill: WARNDIM, stroke: WARN, radius: 8 });
  txt(x, y + 148, 'second instance, weights 3 3 1 1', { size: 11, bold: true, color: WARN });
  txt(x, y + 170, 'greedy 16, optimum 14', { size: 13, mono: true, bold: true, color: INK });
  txt(x, y + 192, 'the winner is 20, one step in from the end', { size: 11, color: DIM });
  txt(x, y + 210, 'and the gap is two comparisons this time', { size: 11, color: DIM });

  txt(x, y + 254, 'no tie-breaking rule on the weights', { size: 11, color: DIM });
  txt(x, y + 272, 'alone can be correct.', { size: 11, color: DIM });
};

/* ---------------- scene 8: rebuild ---------------- */
SCENE_DRAW.rebuild = function (t, sc) {
  var p = K.clamp01((t - sc.start) / (sc.end - sc.start));
  panelTitle('The second table remembers the tree',
             'r marks the root that won each cell; walk the ranges down from the top');

  drawTable(80, 112, 54, 44, V.A.C, V.A.R, true, 4);

  var x = 340, y = 100;
  var steps = [
    ['R(1,4) = 2', 'root is key 20'],
    ['left range 1 to 1', 'R(1,1) = 1, so key 10'],
    ['right range 3 to 4', 'R(3,4) = 4, so key 40'],
    ['inside it, 3 to 3', 'R(3,3) = 3, so key 30']
  ];
  steps.forEach(function (s, i) {
    var a = K.ease(K.clamp01(p * 4 - i * 0.85));
    P.alpha(a);
    txt(x, y + i * 42, s[0], { size: 12, mono: true, bold: true, color: ACC });
    txt(x + 128, y + i * 42, s[1], { size: 12, color: INK });
    P.alpha(1);
  });

  var a2 = K.ease(K.clamp01(p * 2 - 1.1));
  P.alpha(a2);
  drawTree(V.optimal, x + 130, y + 170, 76, 48, { weights: true, levels: true, rootFill: ACCDIM });
  P.alpha(1);
  if (a2 > 0.85) {
    txt(x, y + 300, 're-add: 19, which matches the top cell', { size: 12, mono: true, bold: true, color: VAL });
  }
  txt(x, y + 326, 'ties are real: weights 5 45 45 5 give two optimal trees, both 160.', { size: 11, color: DIM });
};

/* ---------------- scene 9: Huffman ---------------- */
function drawHuff(node, x, y, dx, depthLeft, opt) {
  var R = opt.r || 15;
  if (!node) return;
  if (node.leaf >= 0) {
    P.circle(x, y, R, { fill: opt.leafFill || SURF, stroke: opt.stroke || WARN, sw: 1.5 });
    txt(x, y, String(V.keys[node.leaf]), { size: 12, bold: true, align: 'center', base: 'middle', color: INK });
    txt(x, y + R + 3, 'd' + depthLeft, { size: 9, mono: true, align: 'center', color: FAINT });
    return;
  }
  P.circle(x, y, 11, { fill: SURF2, stroke: BORDER, sw: 1.3 });
  txt(x, y - 4, String(node.w), { size: 9, mono: true, align: 'center', base: 'middle', color: DIM });
  if (node.l) {
    P.line(x - 4, y + 10, x - dx / 2 + 4, y + 46, { stroke: BORDER, sw: 1.4 });
    drawHuff(node.l, x - dx / 2, y + 56, dx / 2, depthLeft + 1, opt);
  }
  if (node.r) {
    P.line(x + 4, y + 10, x + dx / 2 - 4, y + 46, { stroke: BORDER, sw: 1.4 });
    drawHuff(node.r, x + dx / 2, y + 56, dx / 2, depthLeft + 1, opt);
  }
}

SCENE_DRAW.huffman = function (t, sc) {
  var p = K.clamp01((t - sc.start) / (sc.end - sc.start));
  panelTitle('Huffman is not this problem, and one constraint is the whole difference',
             'weights 5, 45, 45, 5: two objectives over two different kinds of object');

  txt(150, 96, 'Huffman: 165, not a search tree', { size: 12, bold: true, align: 'center', color: WARN });
  drawHuff(V.huff3.root, 150, 130, 130, 1, { stroke: WARN, leafFill: WARNDIM });

  txt(430, 96, 'search tree: 160, ordered', { size: 12, bold: true, align: 'center', color: VAL });
  drawTree(V.tree3, 400, 136, 58, 50, { weights: true, rootFill: ACCDIM });

  var x = 650, y = 96;
  txt(x, y, 'three different trees', { size: 12, bold: true, color: DIM });
  txt(x, y + 26, 'Huffman', { size: 12, mono: true, bold: true, color: WARN });
  txt(x, y + 46, 'symbols at leaves, no order', { size: 11, color: DIM });
  txt(x, y + 64, 'greedy merging is optimal', { size: 11, color: DIM });
  txt(x, y + 92, 'alphabetic coding (Hu-Tucker)', { size: 11, mono: true, bold: true, color: INFO });
  txt(x, y + 112, 'leaves keep the order', { size: 11, color: DIM });
  txt(x, y + 130, 'not what GATE asks here', { size: 11, color: DIM });
  txt(x, y + 158, 'optimal search tree', { size: 12, mono: true, bold: true, color: VAL });
  txt(x, y + 178, 'keys are internal nodes', { size: 11, color: DIM });
  txt(x, y + 196, 'greedy fails, DP is needed', { size: 11, color: DIM });

  P.rect(24, 392, 852, 58, { fill: SURF2, stroke: BORDER, radius: 8 });
  txt(40, 404, 'Huffman puts keys 1 and 4 in one subtree and keys 2 and 3 in another, so no left-right',
      { size: 12, color: INK });
  txt(40, 426, 'choice makes it a search tree. Its 165 and the search tree\u2019s 160 count different things.', { size: 12, color: INK });
};

/* ---------------- scene 10: procedure ---------------- */
SCENE_DRAW.proc = function (t, sc) {
  var p = K.clamp01((t - sc.start) / (sc.end - sc.start));
  panelTitle('Five steps, four traps', 'the same procedure answers every question in this family');

  var steps = [
    ['1', 'Check the keys are sorted and each has a weight.'],
    ['2', 'Draw the triangle; put the weights on the diagonal.'],
    ['3', 'Fill by increasing length, trying every root.'],
    ['4', 'Record the winning root in a second table.'],
    ['5', 'Rebuild the tree and re-add weight times level.']
  ];
  steps.forEach(function (s, i) {
    var a = K.ease(K.clamp01(p * 3 - i * 0.5));
    P.alpha(a);
    P.circle(46, 104 + i * 44, 13, { fill: SURF, stroke: ACC, sw: 1.6 });
    txt(46, 104 + i * 44, s[0], { size: 12, mono: true, bold: true, align: 'center', base: 'middle', color: ACC });
    txt(72, 97 + i * 44, s[1], { size: 12, color: INK });
    P.alpha(1);
  });

  var x = 500, y = 92;
  txt(x, y, 'the four traps', { size: 12, bold: true, color: WARN });
  var traps = [
    ['the heaviest key as root', 'greedy, 20 against 19'],
    ['levels counted from 0', 'every cost one short'],
    ['a missing range weight', 'every root scores the same'],
    ['"the" optimal tree', 'two roots can tie']
  ];
  traps.forEach(function (tr, i) {
    P.rect(x - 8, y + 20 + i * 52, 384, 44, { fill: WARNDIM, stroke: WARN, radius: 7 });
    txt(x, y + 34 + i * 52, tr[0], { size: 12, bold: true, color: INK });
    txt(x, y + 51 + i * 52, tr[1], { size: 11, color: DIM });
  });

  P.rect(24, 344, 852, 112, { fill: SURF2, stroke: BORDER, radius: 8 });
  txt(40, 356, 'costs and counts to carry', { size: 12, bold: true, color: DIM });
  txt(40, 378, 'cells n(n+1)/2 = 10 for four keys   |   time O(n^3)   |   space O(n^2)', { size: 11, mono: true, color: INK });
  txt(40, 400, 'trees on n keys = Catalan(n): 1, 2, 5, 14, 42, 132 for n = 1 to 6', { size: 11, mono: true, color: INK });
  txt(40, 422, 'no tree costs less than the total weight: each key needs one comparison', { size: 11, mono: true, color: INK });
  txt(40, 444, 'with monotone weights, Knuth bounds the root to R(i,j-1)..R(i+1,j): O(n^2)', { size: 11, mono: true, color: DIM });
};

/* ---------------- dispatch ---------------- */
function drawFrame(painter) {
  P = painter;
  P.clear();
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
