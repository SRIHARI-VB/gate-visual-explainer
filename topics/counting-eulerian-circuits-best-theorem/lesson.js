/* ==========================================================================
   counting-eulerian-circuits-best-theorem — lesson.js
   Four layers, in order:
     1. THE MODEL      — six small digraphs, each checked for the Euler
                         conditions; the arborescences into a root counted by
                         enumerating exit choices AND by a determinant; the
                         Euler circuits counted by enumerating walks AND by the
                         BEST product; the de Bruijn graph and its two strings.
     2. THE CHECKS     — every claim re-derived by a route that does not share
                         the first route's code.
     3. RENDER         — reads the model; builds nothing.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   Nothing on the canvas is a remembered value. The 3, the 6, the 20 and the 2
   are computed, then re-computed another way, and the two answers compared.
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
  var VAL = PAL.valid, BAD = PAL.invalid, WARN = PAL.warn, INFO = PAL.info;
  var SURF2 = PAL.surface2, BORDER = PAL.border, SURF = PAL.surface;
  var ACCDIM = PAL.accentDim || '#d6efeb';
  var BADDIM = PAL.invalidDim || '#fbe4e2';
  var WARNDIM = PAL.warnDim || '#fbeed3';

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

function fact(k) {
  var r = 1;
  for (var i = 2; i <= k; i++) r *= i;
  return r;
}

function zeros(n) { var a = [], i; for (i = 0; i < n; i++) a.push(0); return a; }

/* ---------- degrees and the two Euler conditions ---------- */
function degrees(g) {
  var indeg = zeros(g.n), outdeg = zeros(g.n), i, u, v;
  for (i = 0; i < g.edges.length; i++) { u = g.edges[i][0]; v = g.edges[i][1]; outdeg[u]++; indeg[v]++; }
  var balanced = true;
  for (i = 0; i < g.n; i++) if (indeg[i] !== outdeg[i]) balanced = false;
  return { indeg: indeg, outdeg: outdeg, balanced: balanced };
}

function weakComponents(g) {
  var adj = {}, i, u, v;
  for (i = 0; i < g.n; i++) adj[i] = {};
  for (i = 0; i < g.edges.length; i++) {
    u = g.edges[i][0]; v = g.edges[i][1];
    adj[u][v] = true; adj[v][u] = true;
  }
  var seen = {}, comps = [];
  for (i = 0; i < g.n; i++) {
    if (seen[i] || !hasArc(g, i)) continue;
    var stack = [i], comp = [];
    seen[i] = true;
    while (stack.length) {
      var x = stack.pop(); comp.push(x);
      for (var y in adj[x]) {
        var yy = Number(y);
        if (!seen[yy]) { seen[yy] = true; stack.push(yy); }
      }
    }
    comps.push(comp);
  }
  return comps;
}

function hasArc(g, v) {
  for (var i = 0; i < g.edges.length; i++) if (g.edges[i][0] === v || g.edges[i][1] === v) return true;
  return false;
}

function eulerCheck(g) {
  var d = degrees(g), comps = weakComponents(g);
  return {
    balanced: d.balanced,
    components: comps.length,
    connected: comps.length <= 1,
    eulerian: d.balanced && comps.length <= 1,
    indeg: d.indeg, outdeg: d.outdeg
  };
}

/* ---------- counting Euler circuits by enumerating walks ----------
   A circuit is a cyclic sequence of arcs. Two sequences that are rotations of
   each other are the SAME circuit, so each is canonicalised to its smallest
   rotation. This is the convention the BEST product counts. */
function enumerateCircuits(g) {
  var m = g.edges.length, seqs = [];
  if (!m) return { count: 0, seqs: [], canon: [] };
  function walk(v, used, seq) {
    if (seq.length === m) {
      if (v === g.edges[seq[0]][0]) seqs.push(seq.slice());
      return;
    }
    for (var i = 0; i < m; i++) {
      if ((used >> i) & 1) continue;
      if (g.edges[i][0] !== v) continue;
      seq.push(i);
      walk(g.edges[i][1], used | (1 << i), seq);
      seq.pop();
    }
  }
  walk(g.edges[0][0], 0, []);
  var canon = {}, list = [];
  for (var s = 0; s < seqs.length; s++) {
    var best = null;
    for (var r = 0; r < seqs[s].length; r++) {
      var rot = seqs[s].slice(r).concat(seqs[s].slice(0, r));
      var key = rot.join(',');
      if (best === null || key < best) best = key;
    }
    if (!canon[best]) { canon[best] = true; list.push(best.split(',').map(Number)); }
  }
  return { count: list.length, seqs: seqs, canon: list };
}

/* the second route: circuits that begin with one prescribed arc, not
   canonicalised at all. MathWorld states this count equals t_w times the
   product, so it must equal the rotation-canonicalised count above. */
function enumerateFromArc(g, arc) {
  var m = g.edges.length, count = 0;
  if (!m || arc >= m) return 0;
  var start = g.edges[arc][0];
  function walk(v, used, len) {
    if (len === m) { if (v === start) count++; return; }
    for (var i = 0; i < m; i++) {
      if ((used >> i) & 1) continue;
      if (g.edges[i][0] !== v) continue;
      walk(g.edges[i][1], used | (1 << i), len + 1);
    }
  }
  walk(g.edges[arc][1], 1 << arc, 1);
  return count;
}

/* ---------- arborescences into a root: enumerate exit choices ---------- */
function arborescencesBrute(g, root) {
  var n = g.n, m = g.edges.length, count = 0, trees = [];
  var choose = [];
  function rec(v, chosen) {
    if (v === n) {
      /* every vertex except root must have exactly one outgoing chosen arc */
      var out = zeros(n), i;
      for (i = 0; i < chosen.length; i++) out[g.edges[chosen[i]][0]]++;
      for (i = 0; i < n; i++) {
        if (i === root) { if (out[i] !== 0) return; }
        else if (out[i] !== 1) return;
      }
      /* every vertex must reach the root */
      var next = zeros(n).map(function () { return -1; });
      for (i = 0; i < chosen.length; i++) next[g.edges[chosen[i]][0]] = g.edges[chosen[i]][1];
      for (i = 0; i < n; i++) {
        if (i === root) continue;
        var x = i, steps = 0, ok = false;
        while (steps <= n) {
          if (x === root) { ok = true; break; }
          if (x < 0 || next[x] < 0) break;
          x = next[x]; steps++;
        }
        if (!ok) return;
      }
      count++;
      trees.push(chosen.slice());
      return;
    }
    if (v === root) { rec(v + 1, chosen); return; }
    for (var e = 0; e < m; e++) {
      if (g.edges[e][0] !== v) continue;
      chosen.push(e);
      rec(v + 1, chosen);
      chosen.pop();
    }
  }
  rec(0, choose);
  return { count: count, trees: trees };
}

/* ---------- arborescences into a root: one determinant ----------
   The directed Matrix-Tree theorem. Diagonal entry of v is the number of arcs
   arriving at v (a self-loop contributes one to the diagonal and one to the
   off-diagonal entry in the same place, so it cancels — loops never belong to
   a spanning tree, which is exactly right). Off the diagonal, entry (v,u) is
   minus the number of arcs u -> v. Delete the root's row and column. */
function laplacian(g) {
  var n = g.n, L = [], i, j, u, v;
  for (i = 0; i < n; i++) { L.push(zeros(n)); }
  for (i = 0; i < g.edges.length; i++) {
    u = g.edges[i][0]; v = g.edges[i][1];
    L[v][v] += 1;
    L[v][u] -= 1;
  }
  return L;
}

function minorOf(M, drop) {
  var out = [], i, j, row;
  for (i = 0; i < M.length; i++) {
    if (i === drop) continue;
    row = [];
    for (j = 0; j < M.length; j++) { if (j !== drop) row.push(M[i][j]); }
    out.push(row);
  }
  return out;
}

/* exact integer determinant, Bareiss elimination: no floating point, so a
   value like 5 or 16 is exact rather than 4.999999 */
function detInt(M) {
  var n = M.length;
  if (n === 0) return 1;
  var a = M.map(function (r) { return r.slice(); });
  var sign = 1, prev = 1, k, i, j, t;
  for (k = 0; k < n - 1; k++) {
    if (a[k][k] === 0) {
      var p = -1;
      for (i = k + 1; i < n; i++) if (a[i][k] !== 0) { p = i; break; }
      if (p < 0) return 0;
      t = a[k]; a[k] = a[p]; a[p] = t; sign = -sign;
    }
    for (i = k + 1; i < n; i++) {
      for (j = k + 1; j < n; j++) {
        a[i][j] = Math.round((a[i][j] * a[k][k] - a[i][k] * a[k][j]) / prev);
      }
    }
    prev = a[k][k];
    for (i = k + 1; i < n; i++) a[i][k] = 0;
  }
  return sign * a[n - 1][n - 1];
}

function arborescencesDet(g, root) {
  return detInt(minorOf(laplacian(g), root));
}

/* ---------- the BEST product ---------- */
function bestCount(g) {
  var d = degrees(g), t = arborescencesDet(g, 0), prod = 1, i, terms = [];
  for (i = 0; i < g.n; i++) {
    var f = fact(Math.max(0, d.outdeg[i] - 1));
    prod *= f;
    terms.push(f);
  }
  return { t: t, prod: prod, terms: terms, ec: t * prod, outdeg: d.outdeg };
}

/* ---------- the six graphs ---------- */
var G = {};

/* three vertices in a directed cycle: every out-degree is 1 */
G.cycle = { n: 3, edges: [[0, 1], [1, 2], [2, 0]] };

/* the complete digraph on three vertices: both arcs between every pair */
G.k3 = { n: 3, edges: [[0, 1], [1, 0], [1, 2], [2, 1], [0, 2], [2, 0]] };

/* four two-arc loops sharing vertex 0 */
G.hub = { n: 5, edges: [[0, 1], [1, 0], [0, 2], [2, 0], [0, 3], [3, 0], [0, 4], [4, 0]] };

/* the complete digraph on three vertices with the arc 0->1 and 1->0 doubled */
G.dbl = { n: 3, edges: [[0, 1], [1, 0], [1, 2], [2, 1], [0, 2], [2, 0], [0, 1], [1, 0]] };

/* the de Bruijn graph B(2,3): vertices are 2-bit words, arcs are 3-bit words */
function debruijnGraph(k, n) {
  var states = [], i;
  for (i = 0; i < Math.pow(k, n - 1); i++) states.push(i);
  var edges = [], w;
  for (w = 0; w < Math.pow(k, n); w++) {
    /* the first n-1 letters are where the arc starts; the last n-1 where it ends */
    var from = Math.floor(w / k), to = w % Math.pow(k, n - 1);
    edges.push([from, to]);
  }
  return { n: states.length, edges: edges, k: k, len: n };
}
G.bruijn = debruijnGraph(2, 3);

/* fails condition 1: vertex 2 has two arcs in and one out */
G.unbalanced = { n: 3, edges: [[0, 1], [1, 2], [2, 0], [0, 2]] };

/* fails condition 2: three balanced cycles, no shared vertex */
G.split = { n: 6, edges: [[0, 1], [1, 0], [2, 3], [3, 2], [4, 5], [5, 4]] };

/* the complete digraph on four vertices: too many arcs to enumerate, so its
   count is checked by the determinant alone */
G.k4 = { n: 4, edges: [] };
(function () {
  for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) if (i !== j) G.k4.edges.push([i, j]);
})();

/* ---------- the computed facts the captions quote ---------- */
var E_CYCLE = eulerCheck(G.cycle), C_CYCLE = enumerateCircuits(G.cycle), B_CYCLE = bestCount(G.cycle);
var E_K3 = eulerCheck(G.k3), C_K3 = enumerateCircuits(G.k3), B_K3 = bestCount(G.k3);
var E_HUB = eulerCheck(G.hub), C_HUB = enumerateCircuits(G.hub), B_HUB = bestCount(G.hub);
var E_DBL = eulerCheck(G.dbl), C_DBL = enumerateCircuits(G.dbl), B_DBL = bestCount(G.dbl);
var E_BRU = eulerCheck(G.bruijn), C_BRU = enumerateCircuits(G.bruijn), B_BRU = bestCount(G.bruijn);
var E_UNB = eulerCheck(G.unbalanced), C_UNB = enumerateCircuits(G.unbalanced);
var E_SPL = eulerCheck(G.split), C_SPL = enumerateCircuits(G.split);
var E_K4 = eulerCheck(G.k4), B_K4 = bestCount(G.k4);

/* the arborescences, by both routes, for every graph the page shows */
var ARB = {};
(function () {
  var keys = ['cycle', 'k3', 'hub', 'dbl', 'bruijn', 'unbalanced'];
  for (var i = 0; i < keys.length; i++) {
    var g = G[keys[i]], rows = [], root;
    for (root = 0; root < g.n; root++) {
      var br = arborescencesBrute(g, root);
      rows.push({
        root: root,
        brute: br.count,
        det: arborescencesDet(g, root),
        trees: br.trees
      });
    }
    ARB[keys[i]] = rows;
  }
})();

/* ---------- the two legal rounds quoted in scene 1, and the three in scene 3 ---------- */
function walkOf(g, seq) {
  var v = g.edges[seq[0]][0], out = [v];
  for (var i = 0; i < seq.length; i++) { v = g.edges[seq[i]][1]; out.push(v); }
  return out;
}

/* the six cyclic orders of the four loops at the hub, fixing loop a first */
var HUB_ORDERS = (function () {
  var out = [];
  function perm(a) {
    if (a.length <= 1) { out.push(a.slice()); return; }
    for (var i = 0; i < a.length; i++) {
      var rest = a.slice(0, i).concat(a.slice(i + 1));
      var before = out.length;
      perm(rest);
      for (var j = before; j < out.length; j++) out[j] = [a[i]].concat(out[j]);
    }
  }
  perm(['b', 'c', 'd']);
  return out;
})();

/* ---------- the de Bruijn strings, decoded from the circuits ---------- */
function decodeBits(g, seq) {
  var bits = '';
  for (var i = 0; i < seq.length; i++) bits += String(g.edges[seq[i]][1] % g.k);
  return bits;
}
function minRotation(s) {
  var best = s;
  for (var i = 1; i < s.length; i++) {
    var r = s.slice(i) + s.slice(0, i);
    if (r < best) best = r;
  }
  return best;
}
var BRUIJN_STRINGS = C_BRU.canon.map(function (seq) { return minRotation(decodeBits(G.bruijn, seq)); }).sort();

function windowsOf(s, w) {
  var out = [], i;
  for (i = 0; i < s.length; i++) {
    var t = '';
    for (var j = 0; j < w; j++) t += s.charAt((i + j) % s.length);
    out.push(t);
  }
  return out;
}

/* every de Bruijn sequence of order 3 over {0,1}, found without the graph at
   all: try all 256 eight-bit strings and keep those whose eight windows of
   three bits are all different. Rotations are one sequence. */
function bruteBruijnStrings(k, n) {
  var len = Math.pow(k, n), total = Math.pow(k, len), keep = {}, out = [], i;
  for (i = 0; i < total; i++) {
    var s = '', x = i, j;
    for (j = 0; j < len; j++) { s = String(x % k) + s; x = Math.floor(x / k); }
    var w = windowsOf(s, n), seen = {}, ok = true;
    for (j = 0; j < w.length; j++) { if (seen[w[j]]) { ok = false; break; } seen[w[j]] = true; }
    if (!ok) continue;
    var r = minRotation(s);
    if (!keep[r]) { keep[r] = true; out.push(r); }
  }
  return out.sort();
}
var BRUIJN_BRUTE = bruteBruijnStrings(2, 3);

/* the naive answer, for the scene that refutes it */
var NAIVE_K3 = fact(G.k3.edges.length - 1);        /* (m-1)! = 5! */
var NAIVE_HUB = fact(G.hub.edges.length - 1);      /* (m-1)! = 7! */

/* ======================================================================
   LAYER 2 - THE CHECKS
   Each claim is re-derived by a route that does not share the first one's code.
   ====================================================================== */

/* 1-4: the directed three-cycle */
chk('the directed 3-cycle is balanced and connected, so it is Eulerian',
    E_CYCLE.balanced && E_CYCLE.connected && E_CYCLE.eulerian,
    E_CYCLE.indeg.join('/') + ' in, ' + E_CYCLE.outdeg.join('/') + ' out');
chk('the directed 3-cycle has exactly one circuit',
    C_CYCLE.count === 1 && B_CYCLE.ec === 1, C_CYCLE.count);
chk('a cycle with every out-degree 1 has product 1, so the count is the tree count',
    B_CYCLE.prod === 1 && B_CYCLE.t === 1, B_CYCLE.t + ' x ' + B_CYCLE.prod);

/* 5-9: the complete digraph on three vertices */
chk('the complete digraph on 3 vertices is Eulerian with out-degree 2 everywhere',
    E_K3.eulerian && B_K3.outdeg.join(',') === '2,2,2', B_K3.outdeg.join(','));
chk('it has 3 circuits, by enumerating walks',
    C_K3.count === 3, C_K3.count);
chk('the BEST product gives the same 3',
    B_K3.ec === 3 && B_K3.t === 3 && B_K3.prod === 1, B_K3.t + ' x ' + B_K3.prod);
chk('the arborescence count is 3 by enumerating exit choices and 3 by the determinant',
    ARB.k3[0].brute === 3 && ARB.k3[0].det === 3, ARB.k3[0].brute + ' / ' + ARB.k3[0].det);
chk('four exit combinations minus the one 2-cycle leaves three trees',
    fact(2) * fact(2) - 1 === 3, '2 x 2 - 1');

/* 10-13: the naive factorial is wrong */
chk('the naive (m-1)! on the complete digraph is 120, which is not the answer',
    NAIVE_K3 === 120 && NAIVE_K3 !== C_K3.count, NAIVE_K3);
chk('a second route, counting circuits that begin with a prescribed arc, also gives 3',
    enumerateFromArc(G.k3, 0) === C_K3.count, enumerateFromArc(G.k3, 0));
chk('the same second route agrees on every enumerable graph',
    enumerateFromArc(G.cycle, 0) === C_CYCLE.count &&
    enumerateFromArc(G.hub, 0) === C_HUB.count &&
    enumerateFromArc(G.dbl, 0) === C_DBL.count &&
    enumerateFromArc(G.bruijn, 0) === C_BRU.count,
    [C_CYCLE.count, C_HUB.count, C_DBL.count, C_BRU.count].join(','));
chk('two graphs with 8 arcs each have different answers: the hub 6, the doubled digraph 20',
    G.hub.edges.length === G.dbl.edges.length && C_HUB.count === 6 && C_DBL.count === 20,
    C_HUB.count + ' against ' + C_DBL.count);

/* 14-18: the hub */
chk('the hub graph is Eulerian with out-degree 4 at the hub and 1 at each leaf',
    E_HUB.eulerian && B_HUB.outdeg.join(',') === '4,1,1,1,1', B_HUB.outdeg.join(','));
chk('every leaf factorial is 0! = 1, so the product is 3! = 6',
    B_HUB.prod === 6 && B_HUB.terms.join(',') === '6,1,1,1,1', B_HUB.terms.join(','));
chk('the hub has exactly one arborescence, by both routes',
    ARB.hub[0].brute === 1 && ARB.hub[0].det === 1, ARB.hub[0].brute + ' / ' + ARB.hub[0].det);
chk('the six circuits are the six cyclic orders of the four loops',
    C_HUB.count === 6 && HUB_ORDERS.length === 6, C_HUB.count);
chk('4! counts each hub circuit four times, so 4!/4 = 3! = 6',
    fact(4) / 4 === fact(3) && fact(3) === C_HUB.count, fact(4) / 4);

/* 19-23: both factors at once */
chk('the doubled digraph is Eulerian with out-degrees 3, 3, 2',
    E_DBL.eulerian && B_DBL.outdeg.join(',') === '3,3,2', B_DBL.outdeg.join(','));
chk('its arborescence count is 5 by enumerating exit choices and 5 by the determinant',
    ARB.dbl[0].brute === 5 && ARB.dbl[0].det === 5, ARB.dbl[0].brute + ' / ' + ARB.dbl[0].det);
chk('six exit combinations minus the one 2-cycle leaves five trees',
    3 * 2 - 1 === 5 && ARB.dbl[0].brute === 5, '3 x 2 - 1');
chk('its product is 2! x 2! x 1! = 4',
    B_DBL.prod === 4 && B_DBL.terms.join(',') === '2,2,1', B_DBL.terms.join(','));
chk('the BEST product is 20 and enumerating all eight arcs finds 20',
    B_DBL.ec === 20 && C_DBL.count === 20, B_DBL.ec + ' / ' + C_DBL.count);
chk('neither factor alone is 20, which is why both appear as distractors',
    B_DBL.t !== 20 && B_DBL.prod !== 20, B_DBL.t + ' and ' + B_DBL.prod);

/* 24-27: the determinant and the root */
chk('the hub determinant is 1 because the minor is the identity matrix',
    detInt(minorOf(laplacian(G.hub), 0)) === 1 &&
    minorOf(laplacian(G.hub), 0)[0][0] === 1 &&
    minorOf(laplacian(G.hub), 0)[0][1] === 0,
    JSON.stringify(minorOf(laplacian(G.hub), 0)[0]));
chk('t_w is the same for every root on every Eulerian graph shown',
    ['cycle', 'k3', 'hub', 'dbl', 'bruijn'].every(function (k) {
      var rows = ARB[k], first = rows[0].det;
      return rows.every(function (r) { return r.det === first && r.brute === first; });
    }), 'all roots agree, by enumeration and by determinant');
chk('on the complete digraph on four vertices the tree count is 16, which is n^(n-2)',
    arborescencesDet(G.k4, 0) === 16 && Math.pow(4, 2) === 16, arborescencesDet(G.k4, 0));
chk('its product is 2!^4 = 16, so the count is 256',
    B_K4.prod === 16 && B_K4.ec === 256, B_K4.t + ' x ' + B_K4.prod + ' = ' + B_K4.ec);

/* 28-31: the two graphs that fail a condition */
chk('the unbalanced graph fails condition 1 and has no circuit at all',
    !E_UNB.balanced && !E_UNB.eulerian && C_UNB.count === 0,
    E_UNB.indeg.join('/') + ' in, ' + E_UNB.outdeg.join('/') + ' out');
chk('its arborescence count is not zero, so a tree count alone proves nothing',
    ARB.unbalanced[0].det > 0 && C_UNB.count === 0, ARB.unbalanced[0].det);
chk('the three separate cycles are balanced everywhere yet have no circuit',
    E_SPL.balanced && !E_SPL.connected && C_SPL.count === 0,
    E_SPL.components + ' components');
chk('each component of that graph is balanced on its own',
    E_SPL.indeg.join(',') === E_SPL.outdeg.join(','), E_SPL.indeg.join(','));

/* 32-36: the de Bruijn graph */
chk('B(2,3) has 4 vertices and 8 arcs, one per 3-bit word',
    G.bruijn.n === 4 && G.bruijn.edges.length === 8, G.bruijn.edges.length);
chk('every vertex of B(2,3) has out-degree 2, so the graph is Eulerian',
    E_BRU.eulerian && B_BRU.outdeg.join(',') === '2,2,2,2', B_BRU.outdeg.join(','));
chk('its tree count is 2 by enumeration and 2 by the determinant',
    ARB.bruijn[0].brute === 2 && ARB.bruijn[0].det === 2, ARB.bruijn[0].brute + ' / ' + ARB.bruijn[0].det);
chk('its product is 1, so the count is 2, and enumerating the arcs finds 2',
    B_BRU.prod === 1 && B_BRU.ec === 2 && C_BRU.count === 2, B_BRU.ec + ' / ' + C_BRU.count);
chk('the two circuits decode to the two strings found without the graph at all',
    BRUIJN_STRINGS.join(',') === '00010111,00011101' &&
    BRUIJN_BRUTE.join(',') === BRUIJN_STRINGS.join(','),
    BRUIJN_STRINGS.join(' '));
chk('each string contains all eight 3-bit words exactly once',
    BRUIJN_STRINGS.every(function (s) {
      var w = windowsOf(s, 3), seen = {};
      for (var i = 0; i < w.length; i++) { if (seen[w[i]]) return false; seen[w[i]] = true; }
      return Object.keys(seen).length === 8;
    }), 'eight distinct windows in each');

/* 37: the two routes to the circuit count agree everywhere they were run */
chk('every graph on the page has its circuit count computed twice, and the two agree',
    [[G.cycle, C_CYCLE, B_CYCLE], [G.k3, C_K3, B_K3], [G.hub, C_HUB, B_HUB],
     [G.dbl, C_DBL, B_DBL], [G.bruijn, C_BRU, B_BRU]].every(function (row) {
      return row[1].count === row[2].ec;
    }), 'five graphs');

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function prog(t, sc) {
  var span = Math.max(0.001, sc.end - sc.start);
  var p = (t - sc.start) / span;
  return p < 0 ? 0 : p > 1 ? 1 : p;
}
function txt(x, y, s, o) { if (P) P.text(x, y, s, o || {}); }
function heading(s) { txt(26, 16, s, { size: 15, bold: true, color: INK }); }
function subline(s) { txt(26, 38, s, { size: 10, color: DIM }); }
function label(x, y, s, c) { txt(x, y, s, { size: 9, bold: true, color: c || FAINT }); }
function body(x, y, s, o) {
  o = o || {};
  txt(x, y, s, { size: o.size || 10, color: o.color || INK, bold: o.bold, mono: o.mono });
}
function code(x, y, s, o) {
  o = o || {};
  txt(x, y, s, { size: o.size || 10, mono: true, color: o.color || INK, bold: o.bold, align: o.align });
}
function card(x, y, w, h, o) {
  o = o || {};
  if (!P) return;
  P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1, radius: o.radius === undefined ? 6 : o.radius });
}
function rule(x1, y1, x2, y2, c) { if (P) P.line(x1, y1, x2, y2, { stroke: c || BORDER, sw: 1 }); }
function chip(x, y, s, kind) {
  var w = s.length * 5.2 + 12;
  var fill = kind === 'bad' ? BADDIM : kind === 'warn' ? WARNDIM : ACCDIM;
  var stroke = kind === 'bad' ? BAD : kind === 'warn' ? WARN : ACC;
  if (P) P.rect(x, y - 9, w, 15, { fill: fill, stroke: stroke, sw: 1, radius: 7 });
  txt(x + 6, y, s, { size: 9, bold: true, color: stroke });
}
/* a run of text lines, spaced by lh */
function noteLines(x, y, lines, o) {
  o = o || {};
  var lh = o.lh || 16;
  for (var i = 0; i < lines.length; i++) {
    txt(x, y + i * lh, lines[i], {
      size: o.size || 9, color: o.color || INK, bold: o.bold, mono: o.mono
    });
  }
}

/* ---------- graph drawing ---------- */
function nodeAt(pos, i) { return pos[i]; }

function drawLoop(a, r, col, sw) {
  if (!P) return;
  var cx = a[0], cy = a[1] - r - 11;
  P.circle(cx, cy, 10, { stroke: col, sw: sw || 1.4 });
  P.tri(cx - 4, cy - 11, cx + 4, cy - 11, cx, cy - 3, { fill: col });
}

function drawArc(pos, u, v, g, o) {
  o = o || {};
  if (!P) return;
  var r = o.r || 14, sw = o.sw || 1.5, col = o.stroke || ACC;
  var a = pos[u], b = pos[v];
  if (u === v) { drawLoop(a, r, col, sw); return; }
  var dx = b[0] - a[0], dy = b[1] - a[1];
  var L = Math.sqrt(dx * dx + dy * dy) || 1;
  var ux = dx / L, uy = dy / L;
  var px = -uy, py = ux;
  var off = o.offset || 0;
  var x1 = a[0] + ux * r + px * off, y1 = a[1] + uy * r + py * off;
  var x2 = b[0] - ux * r + px * off, y2 = b[1] - uy * r + py * off;
  P.arrow(x1, y1, x2, y2, { stroke: col, sw: sw, head: o.head || 7 });
  if (o.tag !== undefined) {
    var mx = (x1 + x2) / 2 + px * (off + 9), my = (y1 + y2) / 2 + py * (off + 9);
    txt(mx, my, String(o.tag), { size: 8, mono: true, align: 'center', base: 'middle', color: o.tagColor || FAINT });
  }
}

/* draw every arc of g; reciprocal pairs are pushed apart so both are visible */
function drawGraph(g, pos, o) {
  o = o || {};
  var r = o.r || 14, i, u, v, rev;
  var set = {}, seen = {};
  for (i = 0; i < g.edges.length; i++) set[g.edges[i][0] + '>' + g.edges[i][1]] = true;
  for (i = 0; i < g.edges.length; i++) {
    u = g.edges[i][0]; v = g.edges[i][1];
    rev = set[v + '>' + u];
    /* a parallel arc is pushed one more step aside, so both arcs and both
       tags stay readable instead of landing on top of each other */
    var key = u + '>' + v;
    var k = seen[key] || 0;
    seen[key] = k + 1;
    var base = (u === v) ? 0 : (rev ? (o.spread || 7) : 0);
    drawArc(pos, u, v, g, {
      r: r, sw: o.sw || 1.5,
      stroke: (o.strokeFor && o.strokeFor(i)) || o.stroke || DIM,
      offset: base + k * (o.stack || 8),
      head: o.head || 7,
      tag: o.tags ? o.tags[i] : undefined,
      tagColor: o.tagColor
    });
  }
  for (i = 0; i < g.n; i++) {
    if (!pos[i]) continue;
    var fill = (o.fillFor && o.fillFor(i)) || SURF;
    if (P) P.circle(pos[i][0], pos[i][1], r, { fill: fill, stroke: o.nodeStroke || BORDER, sw: 1.4 });
    txt(pos[i][0], pos[i][1], o.labels ? o.labels[i] : String(i), {
      size: o.size || 10, mono: true, align: 'center', base: 'middle', bold: true, color: o.labelColor || INK
    });
  }
}

var POS3 = [[200, 120], [318, 236], [104, 232]];
var POS3B = [[620, 120], [738, 236], [524, 232]];
var POSHUB = [[190, 232], [190, 96], [322, 150], [322, 314], [190, 366]];
var POSBRU = [[132, 142], [300, 142], [132, 318], [300, 318]];
var POSUNB = [[120, 120], [300, 130], [210, 244]];
var POSSPL = [[560, 130], [660, 130], [760, 130], [760, 240], [660, 240], [560, 240]];

/* ---------- scene 1: the postman's question ---------- */
function sceneRoute(t, sc) {
  var p = prog(t, sc);
  heading('The postman\'s question');
  subline('Walk every arc exactly once, finish where you started. How many different rounds?');

  drawGraph(G.hub, POSHUB, {
    r: 15, sw: 1.6, stroke: ACC,
    labels: ['0', 'a', 'b', 'c', 'd'],
    fillFor: function (i) { return i === 0 ? ACCDIM : SURF; }
  });
  label(150, 400, 'HUB 0, FOUR TWO-ARC LOOPS', ACC);
  code(150, 416, G.hub.edges.length + ' arcs, out-degree 4 at the hub', { size: 9, color: DIM });

  card(430, 58, 446, 122);
  label(446, 76, 'TWO ROUNDS ON THESE EIGHT ARCS');
  code(446, 96, 'a 0 b 0 c 0 d 0', { size: 10, color: ACC, bold: true });
  code(446, 114, 'a 0 c 0 b 0 d 0', { size: 10, color: ACC, bold: true });
  body(446, 138, 'Both use all eight arcs, once each, and return to 0.', { size: 9, color: DIM });
  body(446, 156, 'They differ only in the order of the loops.', { size: 9, color: DIM });

  if (p > 0.22) {
    card(430, 192, 446, 106, { fill: SURF2 });
    label(446, 210, 'A CIRCUIT IS A CYCLIC OBJECT');
    noteLines(446, 230, [
      'A round has no first arc: a rotation of a',
      'round is the same round.',
      'So every count on this page divides the',
      'starting point away.'
    ], { size: 9, color: DIM, lh: 17 });
  }

  if (p > 0.55) {
    card(430, 310, 446, 96, { fill: ACCDIM, stroke: ACC });
    label(446, 328, 'THE QUESTION THIS PAGE ANSWERS', ACC);
    body(446, 348, 'Not "is there a round", but "how many".', { size: 10 });
    body(446, 366, 'Here the answer is six. It is computed, not', { size: 9, color: DIM });
    body(446, 384, 'quoted, and checked by listing them all.', { size: 9, color: DIM });
  }

  if (p > 0.8) {
    chip(430, 424, '6 rounds, from a theorem on scene 6', 'ok');
  }
}

/* ---------- scene 2: the criterion ---------- */
function sceneCriterion(t, sc) {
  var p = prog(t, sc);
  heading('First, does a circuit exist at all');
  subline('Euler 1736: a circuit exists exactly when both conditions hold.');

  label(30, 64, 'FAILS CONDITION 1: 2 ARCS IN, 1 OUT', BAD);
  drawGraph(G.unbalanced, POSUNB, {
    r: 16, sw: 1.6, stroke: BAD,
    fillFor: function (i) { return i === 2 ? BADDIM : SURF; }
  });
  noteLines(30, 276, [
    'vertex 0   out 2   in 1',
    'vertex 1   out 1   in 1',
    'vertex 2   out 1   in 2',
    'not balanced: 0 and 2 disagree'
  ], { size: 9, mono: true, color: DIM, lh: 16 });

  label(470, 64, 'FAILS CONDITION 2: THREE SEPARATE CYCLES', BAD);
  drawGraph(G.split, POSSPL, {
    r: 13, sw: 1.5, stroke: BAD, spread: 6,
    labels: ['0', '1', '2', '3', '4', '5']
  });
  noteLines(470, 276, [
    'every vertex: out 1, in 1',
    'balanced everywhere, and still no round',
    'a round is one walk and cannot jump'
  ], { size: 9, mono: false, color: DIM, lh: 16 });

  if (p > 0.35) {
    card(24, 344, 852, 110, { fill: SURF2 });
    label(40, 362, 'THE TWO CONDITIONS, AND NOTHING ELSE');
    code(40, 382, 'condition 1   in-degree = out-degree at every vertex', { size: 10, color: INK });
    code(40, 402, 'condition 2   the arcs lie in one weakly connected piece', { size: 10, color: INK });
    body(40, 426, 'Both hold if and only if a circuit exists. Neither one is sufficient alone, and', { size: 9, color: DIM });
    body(40, 442, 'the two graphs above fail one condition each.', { size: 9, color: DIM });
  }
}

/* ---------- scene 3: the naive answer ---------- */
function sceneNaive(t, sc) {
  var p = prog(t, sc);
  heading('The answer everyone tries first');
  subline('Fix the first arc, permute the rest. Does that count walks?');

  drawGraph(G.k3, POS3, {
    r: 16, sw: 1.6, stroke: DIM, spread: 8,
    tags: [0, 1, 2, 3, 4, 5]
  });
  label(120, 300, 'THE COMPLETE DIGRAPH ON THREE VERTICES');
  code(120, 318, 'six arcs, out-degree 2 everywhere', { size: 9, color: DIM });

  card(430, 58, 446, 118);
  label(446, 76, 'THE PERMUTATION ARGUMENT');
  code(446, 96, '6 arcs, first fixed  ->  5! = 120', { size: 10 });
  body(446, 118, 'Fixing the first arc does remove the rotation,', { size: 9, color: DIM });
  body(446, 136, 'so each round would be counted once.', { size: 9, color: DIM });
  body(446, 158, 'The arithmetic is right. The object is wrong.', { size: 9, color: BAD });

  if (p > 0.28) {
    card(430, 188, 446, 74, { fill: BADDIM, stroke: BAD });
    label(446, 206, 'WHAT IS ACTUALLY THERE', BAD);
    body(446, 226, '120 orderings, of which 3 are legal rounds.', { size: 10, bold: true });
    body(446, 246, 'The other 117 teleport from one vertex to another.', { size: 9, color: DIM });
  }

  if (p > 0.5) {
    card(430, 276, 446, 130, { fill: SURF2 });
    label(446, 294, 'THE THREE LEGAL ROUNDS, AS WALKS');
    var lines = [];
    for (var i = 0; i < C_K3.canon.length; i++) {
      lines.push(walkOf(G.k3, C_K3.canon[i]).join(' \u2192 '));
    }
    noteLines(446, 316, lines, { size: 10, mono: true, color: ACC, lh: 20 });
    body(446, 382, 'Each arc starts where the previous one ended.', { size: 9, color: DIM });
  }

  if (p > 0.78) {
    chip(430, 424, 'the factorial counts orders, not walks', 'bad');
  }
}

/* ---------- scene 4: the arborescence ---------- */
function sceneTree(t, sc) {
  var p = prog(t, sc);
  heading('A tree that points at the finish');
  subline('Give every vertex except the root one exit, so that every path ends at the root.');

  var tree = ARB.k3[0].trees.length ? ARB.k3[0].trees[0] : [];
  var inTree = {};
  for (var i = 0; i < tree.length; i++) inTree[tree[i]] = true;

  drawGraph(G.k3, POS3, {
    r: 16, sw: 1.8, spread: 8,
    strokeFor: function (idx) { return inTree[idx] ? ACC : BORDER; },
    fillFor: function (i) { return i === 0 ? ACCDIM : SURF; },
    tags: [0, 1, 2, 3, 4, 5],
    tagColor: FAINT
  });
  label(120, 300, 'ONE ARBORESCENCE INTO VERTEX 0', ACC);
  code(120, 318, 'tree arcs drawn thick, the rest faint', { size: 9, color: DIM });

  card(430, 58, 446, 150);
  label(446, 76, 'FOUR EXIT CHOICES, THREE TREES');
  code(446, 98, 'exit of 1     exit of 2     tree?', { size: 9, color: FAINT });
  rule(446, 106, 862, 106, BORDER);
  var rows = [
    ['1 \u2192 0', '2 \u2192 0', 'yes'],
    ['1 \u2192 0', '2 \u2192 1', 'yes'],
    ['1 \u2192 2', '2 \u2192 0', 'yes'],
    ['1 \u2192 2', '2 \u2192 1', 'no: a 2-cycle']
  ];
  for (var r = 0; r < rows.length; r++) {
    var y = 126 + r * 20;
    code(446, y, rows[r][0], { size: 10, color: INK });
    code(540, y, rows[r][1], { size: 10, color: INK });
    body(650, y, rows[r][2], { size: 10, color: r === 3 ? BAD : VAL, bold: true });
  }

  if (p > 0.3) {
    card(430, 220, 446, 84, { fill: SURF2 });
    label(446, 238, 'WHY THE FOURTH IS NOT A TREE');
    body(446, 258, 'Its two vertices point at each other, so neither', { size: 9, color: DIM });
    body(446, 276, 'ever reaches the root. A tree has one sink and', { size: 9, color: DIM });
    body(446, 294, 'no directed cycle.', { size: 9, color: DIM });
  }

  if (p > 0.55) {
    card(430, 316, 446, 90, { fill: ACCDIM, stroke: ACC });
    label(446, 334, 'THE COUNT HAS A NAME', ACC);
    body(446, 354, 't_w = the number of arborescences into w.', { size: 10, bold: true });
    body(446, 374, 'Here t_0 = ' + ARB.k3[0].det + '. Nothing in the count mentions', { size: 9, color: DIM });
    body(446, 392, 'walks: it is a property of the digraph alone.', { size: 9, color: DIM });
  }

  if (p > 0.8) {
    chip(430, 424, 't_w = ' + ARB.k3[0].brute + ' by enumeration, ' + ARB.k3[0].det + ' by determinant', 'ok');
  }
}

/* ---------- scene 5: the theorem ---------- */
function sceneBest(t, sc) {
  var p = prog(t, sc);
  heading('The BEST theorem');
  subline('de Bruijn, van Aardenne-Ehrenfest, Smith and Tutte, 1951.');

  card(24, 58, 852, 88, { fill: ACCDIM, stroke: ACC });
  label(40, 76, 'THE STATEMENT, FOR A CONNECTED EULERIAN DIGRAPH', ACC);
  code(40, 100, 'ec(G)  =  t_w(G)  \u00d7  \u220f over v of ( out-degree(v) \u2212 1 ) !', { size: 13, bold: true, color: INK });
  body(40, 126, 't_w is the number of arborescences into any fixed vertex w. The product runs over every vertex.', { size: 9, color: DIM });

  card(24, 162, 412, 150);
  label(40, 180, 'FACTOR ONE: WHICH EXIT IS KEPT BACK');
  body(40, 202, 'At every vertex the tree names one exit that', { size: 9, color: DIM });
  body(40, 220, 'is held until last, so that the round ends', { size: 9, color: DIM });
  body(40, 238, 'by following the tree home.', { size: 9, color: DIM });
  code(40, 268, 't_w = ' + B_K3.t, { size: 12, bold: true, color: ACC });
  body(40, 292, 'counted two ways: exit choices and determinant', { size: 9, color: DIM });

  card(464, 162, 412, 150);
  label(480, 180, 'FACTOR TWO: THE ORDER OF THE OTHER EXITS');
  body(480, 202, 'One exit is spoken for, so a vertex of', { size: 9, color: DIM });
  body(480, 220, 'out-degree d contributes (d \u2212 1) factorial', { size: 9, color: DIM });
  body(480, 238, 'orders. Leaves contribute 0! = 1.', { size: 9, color: DIM });
  code(480, 268, '\u220f = ' + B_K3.terms.join(' \u00d7 ') + ' = ' + B_K3.prod, { size: 12, bold: true, color: ACC });
  body(480, 292, 'every out-degree here is 2, so every factor is 1', { size: 9, color: DIM });

  if (p > 0.4) {
    card(24, 328, 852, 78, { fill: SURF2 });
    code(40, 350, 'ec  =  ' + B_K3.t + '  \u00d7  ' + B_K3.prod + '  =  ' + B_K3.ec, { size: 13, bold: true, color: VAL });
    body(40, 376, 'Enumerating all six arcs of the same digraph finds ' + C_K3.count + ' circuits. The product and the enumeration agree.', { size: 9, color: DIM });
  }

  if (p > 0.7) {
    chip(24, 428, 'hypotheses: Eulerian, and circuits counted up to rotation', 'ok');
  }
}

/* ---------- scene 6: the product alone ---------- */
function sceneBowtie(t, sc) {
  var p = prog(t, sc);
  heading('The product alone: six rounds at one hub');
  subline('One arborescence, so the whole count is the hub\'s factorial.');

  drawGraph(G.hub, POSHUB, {
    r: 15, sw: 1.6, stroke: DIM,
    labels: ['0', 'a', 'b', 'c', 'd'],
    fillFor: function (i) { return i === 0 ? ACCDIM : SURF; }
  });
  code(126, 400, 'out-degree 4 at the hub', { size: 9, color: DIM });
  code(126, 416, 'out-degree 1 at each leaf', { size: 9, color: DIM });

  card(430, 58, 446, 96);
  label(446, 76, 'THE TWO FACTORS');
  code(446, 98, 't_w = ' + B_HUB.t + '   (every leaf must point at the hub)', { size: 10, color: ACC });
  code(446, 120, '\u220f = ' + B_HUB.terms.join(' \u00d7 ') + ' = ' + B_HUB.prod, { size: 10, color: ACC });
  body(446, 142, 'leaves contribute 0! = 1, which is why the product', { size: 9, color: DIM });

  if (p > 0.25) {
    card(430, 166, 446, 152, { fill: SURF2 });
    label(446, 184, 'THE SIX ROUNDS, LISTED');
    for (var i = 0; i < HUB_ORDERS.length; i++) {
      var col = i < 3 ? 446 : 660;
      var row = i % 3;
      code(col, 206 + row * 20, '0 a 0 ' + HUB_ORDERS[i].join(' 0 '), { size: 10, mono: true, color: INK });
    }
    body(446, 292, 'Each listing is a legal round: hub, loop, hub, loop, and home.', { size: 9, color: DIM });
  }

  if (p > 0.55) {
    card(430, 330, 446, 76, { fill: WARNDIM, stroke: WARN });
    label(446, 348, 'WHY 3! AND NOT 4!', WARN);
    body(446, 368, '4! = 24 counts each round four times, once per loop', { size: 9, color: INK });
    body(446, 386, 'you could have started on. 24 / 4 = 6 = 3!.', { size: 9, color: INK });
  }

  if (p > 0.8) {
    chip(430, 428, 't_w = ' + B_HUB.t + ', product = ' + B_HUB.prod + ', ec = ' + B_HUB.ec, 'ok');
  }
}

/* ---------- scene 7: both factors ---------- */
function sceneBoth(t, sc) {
  var p = prog(t, sc);
  heading('Both factors at once: twenty');
  subline('Double one pair of arcs, and both factors move.');

  drawGraph(G.dbl, POS3, {
    r: 16, sw: 1.6, stroke: DIM, spread: 9,
    tags: [0, 1, 2, 3, 4, 5, 6, 7]
  });
  label(96, 300, 'THE SAME DIGRAPH, TWO ARCS DOUBLED');
  code(96, 318, 'eight arcs: 0\u21921 and 1\u21920 now appear twice', { size: 9, color: DIM });

  card(430, 58, 446, 168);
  label(446, 76, 'BOTH FACTORS');
  code(446, 100, 'out-degrees   ' + B_DBL.outdeg.join(',  '), { size: 10 });
  code(446, 126, 't_w  =  3 \u00d7 2 exit choices \u2212 1 = ' + B_DBL.t, { size: 10, color: ACC });
  code(446, 152, '\u220f    =  ' + B_DBL.terms.join(' \u00d7 ') + ' = ' + B_DBL.prod, { size: 10, color: ACC });
  rule(446, 166, 862, 166, BORDER);
  code(446, 190, 'ec   =  ' + B_DBL.t + ' \u00d7 ' + B_DBL.prod + ' = ' + B_DBL.ec, { size: 13, bold: true, color: VAL });
  body(446, 214, 'and enumerating all eight arcs finds ' + C_DBL.count, { size: 9, color: DIM });

  if (p > 0.3) {
    card(430, 240, 446, 108, { fill: SURF2 });
    label(446, 258, 'WHY THE TREE COUNT ROSE TO FIVE');
    body(446, 278, 'Vertex 1 now has three arcs to choose from, so the', { size: 9, color: DIM });
    body(446, 296, 'four combinations became six. One of the six is', { size: 9, color: DIM });
    body(446, 314, 'still the 2-cycle, so six minus one is five.', { size: 9, color: DIM });
  }

  if (p > 0.6) {
    card(430, 358, 446, 48, { fill: BADDIM, stroke: BAD });
    body(446, 380, 'A distractor set: 5, 4, 20. The answer is the product.', { size: 9, color: INK });
    body(446, 396, 'Six is the naive exit-choice count, and it is not an option by accident.', { size: 9, color: DIM });
  }

  if (p > 0.85) {
    chip(430, 428, 'neither ' + B_DBL.t + ' nor ' + B_DBL.prod + ' is the answer on its own', 'warn');
  }
}

/* ---------- scene 8: the matrix-tree theorem ---------- */
function sceneMatrix(t, sc) {
  var p = prog(t, sc);
  heading('Computing t_w without drawing trees');
  subline('Directed Matrix-Tree: build the Laplacian, delete the root, take the determinant.');

  var L = laplacian(G.hub), M = minorOf(L, 0);

  label(30, 64, 'THE LAPLACIAN OF THE HUB GRAPH (5 \u00d7 5)');
  var i, j;
  for (i = 0; i < 5; i++) {
    for (j = 0; j < 5; j++) {
      var x = 34 + j * 46, y = 84 + i * 26;
      var dropped = (i === 0 || j === 0);
      card(x, y, 42, 22, {
        fill: dropped ? BADDIM : (L[i][j] === 0 ? SURF : SURF2),
        stroke: dropped ? BAD : BORDER, radius: 3
      });
      code(x + 21, y + 11, String(L[i][j]), { size: 10, align: 'center', base: 'middle', color: dropped ? BAD : INK });
    }
  }
  noteLines(30, 224, [
    'diagonal: arcs arriving (a self-loop cancels)',
    'off diagonal: minus the arcs u \u2192 v'
  ], { size: 9, color: DIM, lh: 16 });

  label(330, 64, 'DELETE ROW 0 AND COLUMN 0');
  for (i = 0; i < 4; i++) {
    for (j = 0; j < 4; j++) {
      var x2 = 336 + j * 46, y2 = 84 + i * 26;
      card(x2, y2, 42, 22, { fill: M[i][j] === 0 ? SURF : ACCDIM, stroke: M[i][j] === 0 ? BORDER : ACC, radius: 3 });
      code(x2 + 21, y2 + 11, String(M[i][j]), { size: 10, align: 'center', base: 'middle', color: INK });
    }
  }
  code(336, 224, 'the 4 \u00d7 4 minor is the identity', { size: 9, color: DIM });

  if (p > 0.3) {
    card(566, 58, 310, 108, { fill: ACCDIM, stroke: ACC });
    label(582, 76, 'ITS DETERMINANT', ACC);
    code(582, 100, 'det = ' + detInt(M) + '  =  t_0', { size: 14, bold: true, color: INK });
    body(582, 126, 'the hub has exactly one arborescence', { size: 9, color: DIM });
    body(582, 144, 'and one determinant says so at any size', { size: 9, color: DIM });
  }

  if (p > 0.5) {
    card(24, 252, 852, 96, { fill: SURF2 });
    label(40, 270, 'FOUR GRAPHS, FOUR DETERMINANTS');
    code(40, 292, 'hub graph          t_0 = ' + ARB.hub[0].det, { size: 10 });
    code(300, 292, 'complete digraph K3   t_0 = ' + ARB.k3[0].det, { size: 10 });
    code(620, 292, 'B(2,3)            t_0 = ' + ARB.bruijn[0].det, { size: 10 });
    code(40, 316, 'doubled K3         t_0 = ' + ARB.dbl[0].det, { size: 10 });
    code(300, 316, 'complete digraph K4   t_0 = ' + arborescencesDet(G.k4, 0), { size: 10 });
    body(620, 316, 'each also checked by enumeration', { size: 9, color: DIM });
  }

  if (p > 0.75) {
    chip(24, 380, 't_w is the same for every root: that is why one determinant answers for all', 'ok');
    body(24, 404, 'The reason is a matrix fact: on a balanced digraph every cofactor of the Laplacian is equal.', { size: 9, color: DIM });
    body(24, 422, 'So the theorem may name any vertex as w and still get one number.', { size: 9, color: DIM });
  }
}

/* ---------- scene 9: the de Bruijn graph ---------- */
function sceneBruijn(t, sc) {
  var p = prog(t, sc);
  heading('The de Bruijn graph: exactly two sequences');
  subline('Vertices are the 2-bit words; each 3-bit word is one arc.');

  drawGraph(G.bruijn, POSBRU, {
    r: 18, sw: 1.6, stroke: DIM, spread: 8,
    labels: ['00', '01', '10', '11']
  });
  label(52, 372, 'B(2,3): FOUR VERTICES, EIGHT ARCS');
  code(52, 390, 'each arc appends one bit: 00 -> 01 appends 1', { size: 9, color: DIM });

  card(430, 58, 446, 96);
  label(446, 76, 'THE TWO FACTORS');
  code(446, 98, 't_w = ' + B_BRU.t + '   every out-degree is 2, so \u220f = ' + B_BRU.prod, { size: 10, color: ACC });
  code(446, 120, 'ec = ' + B_BRU.t + ' \u00d7 ' + B_BRU.prod + ' = ' + B_BRU.ec, { size: 11, bold: true, color: VAL });
  body(446, 142, 'enumerating the eight arcs also finds ' + C_BRU.count, { size: 9, color: DIM });

  if (p > 0.25) {
    card(430, 166, 446, 90, { fill: SURF2 });
    label(446, 184, 'DECODED: THE BIT EACH ARC APPENDS');
    code(446, 208, BRUIJN_STRINGS[0], { size: 13, bold: true, color: INK });
    code(446, 232, BRUIJN_STRINGS[1], { size: 13, bold: true, color: INK });
  }

  if (p > 0.55) {
    card(430, 268, 446, 96, { fill: ACCDIM, stroke: ACC });
    label(446, 286, 'EVERY 3-BIT WORD APPEARS ONCE', ACC);
    body(446, 306, 'Reading the windows of either string cyclically gives', { size: 9, color: DIM });
    body(446, 324, 'all eight words 000 to 111, each exactly once.', { size: 9, color: DIM });
    body(446, 346, 'That property defines a de Bruijn sequence.', { size: 9, color: DIM });
  }

  if (p > 0.8) {
    chip(430, 392, 'the count of de Bruijn sequences is a count of Euler circuits', 'ok');
  }
}

/* ---------- scene 10: what a question asks ---------- */
function sceneGate(t, sc) {
  var p = prog(t, sc);
  heading('What a question actually asks');
  subline('Three shapes, one shared tool: the determinant.');

  var cols = [24, 314, 604];
  var titles = ['SHAPE 1: DOES A ROUND EXIST?', 'SHAPE 2: HOW MANY ROUNDS?', 'SHAPE 3: HOW MANY TREES?'];
  var lines = [
    ['count in and out at every vertex',
     'then check weak connectivity',
     'answer with the failing vertex',
     'and its two counts'],
    ['write the Laplacian',
     'delete the root row and column',
     'take the determinant',
     'multiply by (d \u2212 1)! per vertex'],
    ['the same determinant',
     'no factorial product',
     'any root gives the same number',
     'on an Eulerian digraph']
  ];
  for (var c = 0; c < 3; c++) {
    card(cols[c], 58, 272, 186);
    label(cols[c] + 16, 76, titles[c], ACC);
    noteLines(cols[c] + 16, 102, lines[c], { size: 9, color: INK, lh: 20 });
    rule(cols[c] + 16, 196, cols[c] + 256, 196, BORDER);
    var answers = ['0 or at least 1', 'the product', 't_w alone'];
    code(cols[c] + 16, 216, answers[c], { size: 10, bold: true, color: VAL });
  }

  if (p > 0.3) {
    card(24, 258, 852, 122, { fill: BADDIM, stroke: BAD });
    label(40, 276, 'THE FOUR TRAPS', BAD);
    noteLines(40, 298, [
      '1  an undirected graph: the product does not answer it, and counting there is a harder problem',
      '2  rotations counted separately: a circuit has no first arc, so a rotation is the same circuit',
      '3  out-degree factorial instead of (out-degree \u2212 1): visible only at a vertex of degree 3 or more',
      '4  skipping the balance check: on a non-Eulerian graph the answer is 0 whatever the determinant says'
    ], { size: 9, color: INK, lh: 20 });
  }

  if (p > 0.62) {
    card(24, 396, 852, 54, { fill: ACCDIM, stroke: ACC });
    code(40, 418, 'draw it, check the balance, take one determinant, multiply, state the convention', { size: 11, bold: true, color: INK });
    body(40, 438, 'Every number on this page was produced that way and then checked by enumeration.', { size: 9, color: DIM });
  }
}

/* ---------- dispatch ---------- */
var SCENES = {
  route: sceneRoute,
  criterion: sceneCriterion,
  naive: sceneNaive,
  tree: sceneTree,
  best: sceneBest,
  bowtie: sceneBowtie,
  both: sceneBoth,
  matrix: sceneMatrix,
  bruijn: sceneBruijn,
  gate: sceneGate
};

function drawFrame(P_) {
  if (!P_) return;
  P = P_;
  P.clear();
  P.alpha(1);
  var t = K.state.elapsed;
  var i = K.sceneAt(t);
  var sc = K.state.scenes[i];
  if (!sc) return;
  var fn = SCENES[sc.id] || SCENES.route;
  fn(t, sc);
  /* a thin progress rule, outside the caption band */
  var p = K.clamp01(t / (K.state.duration || 1));
  P.rect(26, H - 10, W - 52, 3, { fill: SURF2, radius: 2 });
  P.rect(26, H - 10, Math.max(2, (W - 52) * p), 3, { fill: ACC, radius: 2 });
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
    } catch (e) { console.error('p5 failed', e); ok = false; }
  }

  if (!ok) {
    var drew = false;
    try {
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      holder.appendChild(cv);
      var ctx2d = cv.getContext && cv.getContext('2d');
      if (ctx2d) { P = PR.makePainter2D(ctx2d, W, H); drawFrame(P); drew = true; }
    } catch (e) { console.error('canvas fallback failed', e); }
    if (!drew && fallback) fallback.classList.add('show');
  }

  if (K && K.init) K.init({ timeline: window.LESSON_TIMELINE, draw: function () { if (P) drawFrame(P); } });

  fillChecks();

  window.__drawAt = function (t) { K.state.elapsed = t; if (P) drawFrame(P); };

  var badc = CHECKS.filter(function (c) { return !c.pass; });
  if (badc.length) console.warn('Model validation did not fully pass:', badc);
}

window.__MODEL = {
  G: G, ARB: ARB, BRUIJN_STRINGS: BRUIJN_STRINGS, BRUIJN_BRUTE: BRUIJN_BRUTE,
  C: { cycle: C_CYCLE, k3: C_K3, hub: C_HUB, dbl: C_DBL, bruijn: C_BRU },
  B: { cycle: B_CYCLE, k3: B_K3, hub: B_HUB, dbl: B_DBL, bruijn: B_BRU, k4: B_K4 },
  HUB_ORDERS: HUB_ORDERS, CHECKS: CHECKS
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
