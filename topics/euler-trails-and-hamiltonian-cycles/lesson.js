/* ==========================================================================
   euler-trails-and-hamiltonian-cycles — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It does no graph arithmetic of its own: every
   figure on the canvas was computed once here and checked against the rule it
   is supposed to satisfy — the Euler criterion against a brute-force search on
   every graph with 4 or 5 vertices, the Hamiltonian counts against the factorial
   formula, the Petersen graph against an exhaustive cycle search, and the
   previous-year question option by option.
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

/* ---------- graph primitives ---------- */

function pairs(n) {
  var out = [], i, j;
  for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) out.push([i, j]);
  return out;
}

function adjMatrix(n, edges) {
  var A = [], i, j;
  for (i = 0; i < n; i++) { A.push([]); for (j = 0; j < n; j++) A[i].push(false); }
  for (i = 0; i < edges.length; i++) { A[edges[i][0]][edges[i][1]] = true; A[edges[i][1]][edges[i][0]] = true; }
  return A;
}

function degrees(n, edges) {
  var d = [], i;
  for (i = 0; i < n; i++) d.push(0);
  for (i = 0; i < edges.length; i++) { d[edges[i][0]]++; d[edges[i][1]]++; }
  return d;
}

function oddCount(d) {
  var k = 0, i;
  for (i = 0; i < d.length; i++) if (d[i] % 2) k++;
  return k;
}

/* connected on the edges: every vertex with a nonzero degree is reachable from
   the first such vertex. Isolated vertices are ignored, and a graph with no
   edges is reported separately rather than silently accepted. */
function connectedOnEdges(n, edges) {
  if (!edges.length) return false;
  var A = adjMatrix(n, edges), d = degrees(n, edges);
  var start = -1, i, seen = [], stack = [];
  for (i = 0; i < n; i++) if (d[i] > 0) { start = i; break; }
  for (i = 0; i < n; i++) seen.push(false);
  seen[start] = true; stack.push(start);
  while (stack.length) {
    var v = stack.pop();
    for (i = 0; i < n; i++) if (A[v][i] && !seen[i]) { seen[i] = true; stack.push(i); }
  }
  for (i = 0; i < n; i++) if (d[i] > 0 && !seen[i]) return false;
  return true;
}

/* ---------- brute force: is there an Euler tour at all? ---------- */

function eulerExists(n, edges, wantCircuit) {
  var m = edges.length, i, k;
  if (!m) return false;
  var inc = [];
  for (i = 0; i < n; i++) inc.push([]);
  for (i = 0; i < m; i++) { inc[edges[i][0]].push(i); inc[edges[i][1]].push(i); }
  var used = [];
  for (i = 0; i < m; i++) used.push(false);

  function dfs(v, count, start) {
    if (count === m) return wantCircuit ? v === start : true;
    for (var j = 0; j < inc[v].length; j++) {
      var e = inc[v][j];
      if (used[e]) continue;
      used[e] = true;
      var w = edges[e][0] === v ? edges[e][1] : edges[e][0];
      if (dfs(w, count + 1, start)) return true;
      used[e] = false;
    }
    return false;
  }

  for (k = 0; k < n; k++) {
    for (i = 0; i < m; i++) used[i] = false;
    if (dfs(k, 0, k)) return true;
  }
  return false;
}

/* the criterion: the thing being tested, stated in two clauses */
function eulerCriterion(n, edges, wantCircuit) {
  var d = degrees(n, edges), odd = oddCount(d);
  if (!connectedOnEdges(n, edges)) return false;
  return wantCircuit ? odd === 0 : (odd === 0 || odd === 2);
}

/* ---------- brute force: Hamiltonian cycle and path ---------- */

function hamCycle(n, edges) {
  if (n < 3) return null;
  var A = adjMatrix(n, edges), i;
  var vis = [], path = [];
  for (i = 0; i < n; i++) vis.push(false);
  vis[0] = true; path.push(0);
  function dfs(v) {
    if (path.length === n) return A[v][0];
    for (var w = 0; w < n; w++) {
      if (A[v][w] && !vis[w]) {
        vis[w] = true; path.push(w);
        if (dfs(w)) return true;
        path.pop(); vis[w] = false;
      }
    }
    return false;
  }
  return dfs(0) ? path.slice() : null;
}

function hamPathExists(n, edges) {
  var A = adjMatrix(n, edges), i, s;
  for (s = 0; s < n; s++) {
    var vis = [];
    for (i = 0; i < n; i++) vis.push(false);
    vis[s] = true;
    var found = (function () {
      function dfs(v, k) {
        if (k === n) return true;
        for (var w = 0; w < n; w++) {
          if (A[v][w] && !vis[w]) {
            vis[w] = true;
            if (dfs(w, k + 1)) return true;
            vis[w] = false;
          }
        }
        return false;
      }
      return dfs(s, 1);
    })();
    if (found) return true;
  }
  return false;
}

/* ---------- directed brute force ---------- */

function dirEulerExists(n, arcs, wantCircuit) {
  var m = arcs.length, i, k;
  if (!m) return false;
  var out = [];
  for (i = 0; i < n; i++) out.push([]);
  for (i = 0; i < m; i++) out[arcs[i][0]].push(i);
  var used = [];
  for (i = 0; i < m; i++) used.push(false);

  function dfs(v, count, start) {
    if (count === m) return wantCircuit ? v === start : true;
    for (var j = 0; j < out[v].length; j++) {
      var e = out[v][j];
      if (used[e]) continue;
      used[e] = true;
      if (dfs(arcs[e][1], count + 1, start)) return true;
      used[e] = false;
    }
    return false;
  }

  for (k = 0; k < n; k++) {
    for (i = 0; i < m; i++) used[i] = false;
    if (dfs(k, 0, k)) return true;
  }
  return false;
}

/* the directed criterion. Balanced everywhere, plus one weak component on the
   edges. Balance plus weak connectivity already forces strong connectivity on
   the edge-carrying part, so the two readings agree. */
function dirCriterion(n, arcs, wantCircuit) {
  var i, indeg = [], outdeg = [], weak = [];
  for (i = 0; i < n; i++) { indeg.push(0); outdeg.push(0); weak.push([]); }
  for (i = 0; i < arcs.length; i++) {
    outdeg[arcs[i][0]]++; indeg[arcs[i][1]]++;
    weak[arcs[i][0]].push(arcs[i][1]); weak[arcs[i][1]].push(arcs[i][0]);
  }
  if (!arcs.length) return false;
  var plusOne = 0, minusOne = 0;
  for (i = 0; i < n; i++) {
    var diff = outdeg[i] - indeg[i];
    if (diff === 1) plusOne++;
    else if (diff === -1) minusOne++;
    else if (diff !== 0) return false;
  }
  if (wantCircuit) { if (plusOne || minusOne) return false; }
  else {
    if (plusOne > 1 || minusOne > 1) return false;
    if (plusOne !== minusOne) return false;
  }
  /* weak connectivity over the vertices that carry an arc */
  var seen = [], stack = [];
  for (i = 0; i < n; i++) seen.push(false);
  var s0 = -1;
  for (i = 0; i < n; i++) if (indeg[i] + outdeg[i] > 0) { s0 = i; break; }
  seen[s0] = true; stack.push(s0);
  while (stack.length) {
    var v = stack.pop();
    for (i = 0; i < weak[v].length; i++) if (!seen[weak[v][i]]) { seen[weak[v][i]] = true; stack.push(weak[v][i]); }
  }
  for (i = 0; i < n; i++) if (indeg[i] + outdeg[i] > 0 && !seen[i]) return false;
  return true;
}

/* ---------- enumerating every graph on n vertices ---------- */

/* a deterministic pseudo-random sample of masks. A fixed stride is not a fair
   sample: with stride 16 the low four bits are always zero, so the first three
   pairs are never edges and no dense graph is ever drawn. */
function sampleMasks(total, count, seed) {
  var out = [], seen = {}, s = seed | 0, guard = 0;
  while (out.length < count && guard++ < count * 60) {
    /* xorshift32: exact 32-bit integer arithmetic, unlike a product-based LCG
       whose intermediate value passes 2^53 and loses its low bits. */
    s ^= s << 13; s |= 0;
    s ^= s >>> 17;
    s ^= s << 5; s |= 0;
    var m = (s >>> 0) % total;
    if (!seen[m]) { seen[m] = true; out.push(m); }
  }
  return out;
}

function forEachGraphMask(n, masks, fn) {
  var E = pairs(n), k, i;
  for (k = 0; k < masks.length; k++) {
    var edges = [];
    for (i = 0; i < E.length; i++) if (masks[k] & (1 << i)) edges.push(E[i]);
    fn(edges, masks[k]);
  }
}

function forEachGraph(n, stride, fn) {
  var E = pairs(n), total = 1 << E.length, mask;
  for (mask = 0; mask < total; mask += (stride || 1)) {
    var edges = [], i;
    for (i = 0; i < E.length; i++) if (mask & (1 << i)) edges.push(E[i]);
    fn(edges, mask);
  }
  return total;
}

/* ---------- Hierholzer, recorded step by step ---------- */

function hierholzer(n, edges, start) {
  var m = edges.length, i;
  var inc = [];
  for (i = 0; i < n; i++) inc.push([]);
  for (i = 0; i < m; i++) { inc[edges[i][0]].push(i); inc[edges[i][1]].push(i); }
  var used = [];
  for (i = 0; i < m; i++) used.push(false);

  function walk(v) {
    var cyc = [], verts = [v];
    for (;;) {
      var nxt = -1, j;
      for (j = 0; j < inc[v].length; j++) if (!used[inc[v][j]]) { nxt = inc[v][j]; break; }
      if (nxt < 0) break;
      used[nxt] = true;
      var w = edges[nxt][0] === v ? edges[nxt][1] : edges[nxt][0];
      cyc.push(nxt); verts.push(w); v = w;
    }
    return { edges: cyc, verts: verts };
  }

  function vertsOf(tour) {
    var vs = [start], k;
    for (k = 0; k < tour.length; k++) {
      var e = tour[k];
      vs.push(edges[e][0] === vs[vs.length - 1] ? edges[e][1] : edges[e][0]);
    }
    return vs;
  }

  var first = walk(start);
  var tour = first.edges.slice();
  var splices = [];
  var guard = 0;
  for (;;) {
    if (guard++ > 50) break;
    var vs = vertsOf(tour), did = false;
    for (i = 0; i < vs.length; i++) {
      var v = vs[i], j, hasUnused = false;
      for (j = 0; j < inc[v].length; j++) if (!used[inc[v][j]]) { hasUnused = true; break; }
      if (!hasUnused) continue;
      var cyc = walk(v);
      if (!cyc.edges.length) continue;
      tour = tour.slice(0, i).concat(cyc.edges, tour.slice(i));
      splices.push({ at: v, edges: cyc.edges.slice(), verts: cyc.verts.slice() });
      did = true;
      break;
    }
    if (!did) break;
  }
  return {
    firstWalk: first.edges.slice(),
    firstVerts: first.verts.slice(),
    tour: tour,
    tourVerts: vertsOf(tour),
    splices: splices
  };
}

/* ---------- counting Euler circuits ---------- */

/* traversals that begin at vertex `from`; a closed tour through a vertex of
   degree d passes it d/2 times and has two directions, so the number of
   distinct circuits is traversals / (d/2) / 2. */
function countTraversals(n, edges, from) {
  var m = edges.length, i, count = 0;
  var inc = [];
  for (i = 0; i < n; i++) inc.push([]);
  for (i = 0; i < m; i++) { inc[edges[i][0]].push(i); inc[edges[i][1]].push(i); }
  var used = [];
  for (i = 0; i < m; i++) used.push(false);
  function dfs(v, k) {
    if (k === m) { if (v === from) count++; return; }
    for (var j = 0; j < inc[v].length; j++) {
      var e = inc[v][j];
      if (used[e]) continue;
      used[e] = true;
      dfs(edges[e][0] === v ? edges[e][1] : edges[e][0], k + 1);
      used[e] = false;
    }
  }
  dfs(from, 0);
  return count;
}

/* distinct circuits, canonicalised over rotation and reversal of the cyclic
   edge sequence, so the answer does not depend on where the tour is cut */
function countCircuitsCanonical(n, edges, from) {
  var m = edges.length, i;
  var inc = [];
  for (i = 0; i < n; i++) inc.push([]);
  for (i = 0; i < m; i++) { inc[edges[i][0]].push(i); inc[edges[i][1]].push(i); }
  var used = [], seq = [], seen = {}, count = 0;
  for (i = 0; i < m; i++) used.push(false);

  function canon() {
    var best = null, r, k;
    for (r = 0; r < m; r++) {
      var rot = [];
      for (k = 0; k < m; k++) rot.push(seq[(r + k) % m]);
      if (best === null || rot.join(',') < best) best = rot.join(',');
    }
    for (r = 0; r < m; r++) {
      var rev = [];
      for (k = 0; k < m; k++) rev.push(seq[(m - 1 - ((r + k) % m) + m) % m]);
      if (rev.join(',') < best) best = rev.join(',');
    }
    return best;
  }

  function dfs(v, k) {
    if (k === m) {
      if (v === from) {
        var c = canon();
        if (!seen[c]) { seen[c] = true; count++; }
      }
      return;
    }
    for (var j = 0; j < inc[v].length; j++) {
      var e = inc[v][j];
      if (used[e]) continue;
      used[e] = true; seq.push(e);
      dfs(edges[e][0] === v ? edges[e][1] : edges[e][0], k + 1);
      seq.pop(); used[e] = false;
    }
  }
  dfs(from, 0);
  return count;
}

/* ---------- the model graphs ---------- */

/* the seven bridges, as four land masses. The degrees are the classical
   3, 3, 3, 5; the page computes them from this edge list. */
var KOEN = {
  n: 4,
  edges: [[0, 2], [0, 3], [0, 3], [1, 2], [1, 3], [1, 3], [2, 3]],
  pos: [[130, 120], [130, 330], [300, 225], [450, 225]],
  names: ['north', 'south', 'island', 'east']
};

var K23 = {
  n: 5,
  edges: [[0, 2], [0, 3], [0, 4], [1, 2], [1, 3], [1, 4]],
  pos: [[130, 140], [130, 310], [330, 100], [330, 225], [330, 350]],
  names: ['a', 'b', 'p', 'q', 'r']
};

var CHORD6 = {
  n: 6,
  edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 2], [3, 5]],
  pos: null,
  names: ['0', '1', '2', '3', '4', '5']
};

var BOWTIE = {
  n: 5,
  edges: [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4], [4, 1]],
  pos: [[140, 130], [255, 225], [140, 320], [375, 130], [375, 320]],
  names: ['0', '1', '2', '3', '4']
};

var TWOTRI = {
  n: 6,
  edges: [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3]],
  pos: [[110, 130], [110, 300], [240, 215], [400, 130], [400, 300], [530, 215]],
  names: ['0', '1', '2', '3', '4', '5']
};

function ring(n, cx, cy, r, phase) {
  var out = [], i;
  for (i = 0; i < n; i++) {
    var a = -Math.PI / 2 + (phase || 0) + i * 2 * Math.PI / n;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

/* Petersen: outer pentagon plus inner pentagram */
var PETERSEN = (function () {
  var outer = ring(5, 250, 235, 150, 0);
  var inner = ring(5, 250, 235, 72, 0);
  var pos = [], i;
  for (i = 0; i < 5; i++) pos.push(outer[i]);
  for (i = 0; i < 5; i++) pos.push(inner[i]);
  var edges = [];
  for (i = 0; i < 5; i++) edges.push([i, (i + 1) % 5]);
  for (i = 0; i < 5; i++) edges.push([5 + i, 5 + ((i + 2) % 5)]);
  for (i = 0; i < 5; i++) edges.push([i, 5 + i]);
  return { n: 10, edges: edges, pos: pos, names: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] };
})();

/* K6 minus a perfect matching: every degree 4, which beats Dirac's 3 */
var DIRAC6 = (function () {
  var pos = ring(6, 240, 230, 145, 0), edges = [], i, j;
  var A = {};
  for (i = 0; i < 6; i++) for (j = i + 1; j < 6; j++) {
    if (j === i + 3) continue;                      /* drop the three diameters */
    edges.push([i, j]);
  }
  return { n: 6, edges: edges, pos: pos, names: ['0', '1', '2', '3', '4', '5'] };
})();

var C6 = { n: 6, edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]], pos: ring(6, 240, 230, 145, 0), names: ['0', '1', '2', '3', '4', '5'] };

/* ---------- fill the model ---------- */

V.koen = (function () {
  var d = degrees(KOEN.n, KOEN.edges);
  return {
    deg: d, odd: oddCount(d), edges: KOEN.edges.length,
    circuit: eulerExists(KOEN.n, KOEN.edges, true),
    trail: eulerExists(KOEN.n, KOEN.edges, false),
    criterionTrail: eulerCriterion(KOEN.n, KOEN.edges, false)
  };
})();

V.k23 = (function () {
  var d = degrees(K23.n, K23.edges);
  return {
    deg: d, odd: oddCount(d),
    trail: eulerExists(K23.n, K23.edges, false),
    circuit: eulerExists(K23.n, K23.edges, true),
    ham: !!hamCycle(K23.n, K23.edges),
    hamPath: hamPathExists(K23.n, K23.edges)
  };
})();

V.chord6 = (function () {
  var d = degrees(CHORD6.n, CHORD6.edges);
  var cyc = hamCycle(CHORD6.n, CHORD6.edges);
  return {
    deg: d, odd: oddCount(d),
    ham: !!cyc, hamVerts: cyc || [],
    trail: eulerExists(CHORD6.n, CHORD6.edges, false),
    circuit: eulerExists(CHORD6.n, CHORD6.edges, true)
  };
})();

V.bowtie = (function () {
  var d = degrees(BOWTIE.n, BOWTIE.edges);
  var h = hierholzer(BOWTIE.n, BOWTIE.edges, 0);
  var closed = h.tourVerts[0] === h.tourVerts[h.tourVerts.length - 1];
  var once = {}, all = true, i;
  for (i = 0; i < h.tour.length; i++) {
    if (once[h.tour[i]]) all = false;
    once[h.tour[i]] = true;
  }
  return {
    deg: d, odd: oddCount(d),
    circuit: eulerExists(BOWTIE.n, BOWTIE.edges, true),
    firstWalk: h.firstWalk, firstVerts: h.firstVerts,
    splices: h.splices, tour: h.tour, tourVerts: h.tourVerts,
    closed: closed, usesEachOnce: all && h.tour.length === BOWTIE.edges.length
  };
})();

V.twotri = (function () {
  var d = degrees(TWOTRI.n, TWOTRI.edges);
  return {
    deg: d, odd: oddCount(d),
    connected: connectedOnEdges(TWOTRI.n, TWOTRI.edges),
    circuit: eulerExists(TWOTRI.n, TWOTRI.edges, true)
  };
})();

V.k5 = (function () {
  var E = pairs(5);
  var traversals = countTraversals(5, E, 0);
  var circuits = countCircuitsCanonical(5, E, 0);
  /* the two five-cycles, checked as a decomposition */
  var c1 = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 4]];
  var c2 = [[0, 2], [2, 4], [1, 4], [1, 3], [0, 3]];
  var key = function (e) { return Math.min(e[0], e[1]) + '-' + Math.max(e[0], e[1]); };
  var covered = {}, overlap = false, i;
  var both = c1.concat(c2);
  for (i = 0; i < both.length; i++) {
    var k = key(both[i]);
    if (covered[k]) overlap = true;
    covered[k] = true;
  }
  var coveredAll = true;
  for (i = 0; i < E.length; i++) if (!covered[key(E[i])]) coveredAll = false;
  return {
    deg: degrees(5, E), edges: E.length,
    traversals: traversals, circuits: circuits,
    decomp: [c1, c2], decompOk: !overlap && coveredAll && both.length === E.length
  };
})();

V.ham = (function () {
  var out = [], n, i;
  function fact(k) { var r = 1; for (i = 2; i <= k; i++) r *= i; return r; }
  for (n = 3; n <= 7; n++) {
    var E = pairs(n), cnt = 0;
    var perm = [];
    for (i = 1; i < n; i++) perm.push(i);
    var A = adjMatrix(n, E);
    /* enumerate every ordering of 1..n-1 after vertex 0 */
    (function rec(k) {
      if (k === perm.length) {
        var seq = [0].concat(perm), ok = true;
        for (var j = 0; j < n; j++) if (!A[seq[j]][seq[(j + 1) % n]]) { ok = false; break; }
        if (ok) cnt++;
        return;
      }
      for (var m = k; m < perm.length; m++) {
        var t = perm[k]; perm[k] = perm[m]; perm[m] = t;
        rec(k + 1);
        t = perm[k]; perm[k] = perm[m]; perm[m] = t;
      }
    })(0);
    out.push({ n: n, brute: cnt / 2, formula: fact(n - 1) / 2 });
  }
  return out;
})();

V.bigCounts = (function () {
  function fact(k) { var r = 1; for (var i = 2; i <= k; i++) r *= i; return r; }
  var c25 = fact(24) / 2;
  var secondsAt1e9 = c25 / 1e9;
  return {
    n10: fact(9) / 2,
    n25: c25,
    years: secondsAt1e9 / (3600 * 24 * 365.25)
  };
})();

V.dirac6 = (function () {
  var d = degrees(DIRAC6.n, DIRAC6.edges);
  var cyc = hamCycle(DIRAC6.n, DIRAC6.edges);
  return { deg: d, delta: Math.min.apply(null, d), ham: !!cyc, hamVerts: cyc || [] };
})();

V.c6 = (function () {
  var d = degrees(C6.n, C6.edges), i, j;
  var A = adjMatrix(C6.n, C6.edges);
  var oreMin = Infinity;
  for (i = 0; i < 6; i++) for (j = i + 1; j < 6; j++) if (!A[i][j]) oreMin = Math.min(oreMin, d[i] + d[j]);
  var cyc = hamCycle(C6.n, C6.edges);
  return {
    deg: d, delta: Math.min.apply(null, d), dirac: Math.min.apply(null, d) * 2 >= 6,
    oreMin: oreMin, ore: oreMin >= 6, ham: !!cyc, hamVerts: cyc || []
  };
})();

V.petersen = (function () {
  var d = degrees(PETERSEN.n, PETERSEN.edges);
  var cyc = hamCycle(PETERSEN.n, PETERSEN.edges);
  var minusAll = true, i;
  for (i = 0; i < PETERSEN.n; i++) {
    var mp = {}, k = 0, j;
    for (j = 0; j < PETERSEN.n; j++) if (j !== i) { mp[j] = k; k++; }
    var E2 = [];
    for (j = 0; j < PETERSEN.edges.length; j++) {
      var a = PETERSEN.edges[j][0], b = PETERSEN.edges[j][1];
      if (a === i || b === i) continue;
      E2.push([mp[a], mp[b]]);
    }
    if (!hamCycle(9, E2)) minusAll = false;
  }
  return {
    deg: d, odd: oddCount(d), edges: PETERSEN.edges.length,
    ham: !!cyc, minusAny: minusAll,
    circuit: eulerExists(PETERSEN.n, PETERSEN.edges, true),
    trail: eulerExists(PETERSEN.n, PETERSEN.edges, false)
  };
})();

V.comp25 = (function () {
  var n = 25, i, j, S = {}, edges = [];
  for (i = 0; i < n; i++) {
    var a = i, b = (i + 1) % n;
    S[Math.min(a, b) + '-' + Math.max(a, b)] = true;
  }
  for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) if (!S[i + '-' + j]) edges.push([i, j]);
  var d = degrees(n, edges);
  var minD = Math.min.apply(null, d), maxD = Math.max.apply(null, d);
  return {
    n: n, edges: edges.length, minDeg: minD, maxDeg: maxD,
    connected: connectedOnEdges(n, edges),
    circuit: eulerCriterion(n, edges, true),
    odd: oddCount(d)
  };
})();

V.gate2007 = (function () {
  /* option A: two disjoint triangles, 2-regular, no circuit */
  var A = { n: 6, edges: TWOTRI.edges };
  var dA = degrees(A.n, A.edges);
  var aRegular = dA.every(function (x) { return x === 2; });
  var aCircuit = eulerExists(A.n, A.edges, true);
  /* option B: K90 */
  var nB = 90, degB = nB - 1;
  /* option C: complement of C25, computed above */
  return {
    A: { deg: 2, regular: aRegular, connected: connectedOnEdges(A.n, A.edges), circuit: aCircuit },
    B: { n: nB, deg: degB, even: degB % 2 === 0 },
    C: { deg: V.comp25.minDeg, edges: V.comp25.edges, connected: V.comp25.connected, circuit: V.comp25.circuit }
  };
})();

/* ---------- the enumerations, and their tallies ---------- */

V.enum = { eulerChecked: 0, eulerSample: 0, eulerBad: 0, eulerSampleBad: 0, digraphs: 0, digraphBad: 0,
           diracCases: 0, diracBad: 0, oreCases: 0, oreBad: 0, toughGraphs: 0, toughBad: 0 };

/* the criterion against a brute-force search, on every graph with 4 or 5 vertices */
(function () {
  var n;
  for (n = 4; n <= 5; n++) {
    forEachGraph(n, 1, function (edges) {
      if (!edges.length) return;                     /* the empty graph is settled by convention */
      V.enum.eulerChecked++;
      var c1 = eulerExists(n, edges, true), c2 = eulerCriterion(n, edges, true);
      var t1 = eulerExists(n, edges, false), t2 = eulerCriterion(n, edges, false);
      if (c1 !== c2 || t1 !== t2) V.enum.eulerBad++;
    });
  }
})();

/* a deterministic pseudo-random sample of the graphs with 6 vertices */
(function () {
  forEachGraphMask(6, sampleMasks(1 << 15, 256, 7919), function (edges) {
    if (!edges.length) return;
    V.enum.eulerSample++;
    var c1 = eulerExists(6, edges, true), c2 = eulerCriterion(6, edges, true);
    var t1 = eulerExists(6, edges, false), t2 = eulerCriterion(6, edges, false);
    if (c1 !== c2 || t1 !== t2) V.enum.eulerSampleBad++;
  });
})();

/* the directed criterion on every directed graph with three vertices */
(function () {
  var E = pairs(3), total = 1 << (2 * E.length), mask, i;
  for (mask = 0; mask < total; mask++) {
    var arcs = [];
    for (i = 0; i < E.length; i++) {
      if (mask & (1 << (2 * i))) arcs.push([E[i][0], E[i][1]]);
      if (mask & (1 << (2 * i + 1))) arcs.push([E[i][1], E[i][0]]);
    }
    if (!arcs.length) continue;
    V.enum.digraphs++;
    if (dirEulerExists(3, arcs, true) !== dirCriterion(3, arcs, true)) V.enum.digraphBad++;
    if (dirEulerExists(3, arcs, false) !== dirCriterion(3, arcs, false)) V.enum.digraphBad++;
  }
})();

/* Dirac and Ore, and the component-count necessary condition */
(function () {
  var n, i, j;
  for (n = 3; n <= 5; n++) {
    forEachGraph(n, 1, function (edges) {
      var d = degrees(n, edges), h = !!hamCycle(n, edges);
      if (Math.min.apply(null, d) * 2 >= n) {
        V.enum.diracCases++;
        if (!h) V.enum.diracBad++;
      }
      var A = adjMatrix(n, edges), ok = true;
      for (i = 0; i < n && ok; i++) for (j = i + 1; j < n; j++) {
        if (!A[i][j] && d[i] + d[j] < n) { ok = false; break; }
      }
      if (ok) {
        V.enum.oreCases++;
        if (!h) V.enum.oreBad++;
      }
    });
  }
  /* the same Dirac check on a pseudo-random sample of the graphs with six vertices */
  forEachGraphMask(6, sampleMasks(1 << 15, 2048, 104729), function (edges) {
    var d = degrees(6, edges);
    if (Math.min.apply(null, d) * 2 >= 6) {
      V.enum.diracCases++;
      if (!hamCycle(6, edges)) V.enum.diracBad++;
    }
  });
  /* c(G - S) <= |S| on every Hamiltonian graph with 4 or 5 vertices */
  for (n = 4; n <= 5; n++) {
    forEachGraph(n, 1, function (edges) {
      if (!hamCycle(n, edges)) return;
      V.enum.toughGraphs++;
      var A = adjMatrix(n, edges), mask, v, w;
      for (mask = 1; mask < (1 << n) - 1; mask++) {
        var inS = [], size = 0, rest = [];
        for (v = 0; v < n; v++) { inS.push(!!(mask & (1 << v))); if (inS[v]) size++; else rest.push(v); }
        var seen = {}, comps = 0, q, k;
        for (k = 0; k < rest.length; k++) {
          if (seen[rest[k]]) continue;
          comps++;
          var stack = [rest[k]];
          seen[rest[k]] = true;
          while (stack.length) {
            q = stack.pop();
            for (w = 0; w < n; w++) if (!inS[w] && A[q][w] && !seen[w]) { seen[w] = true; stack.push(w); }
          }
        }
        if (comps > size) { V.enum.toughBad++; return; }
      }
    });
  }
})();

/* ---------- the checks ---------- */

chk('Königsberg has seven edges and degrees 3, 3, 3, 5', V.koen.edges === 7 && V.koen.deg.join(',') === '3,3,3,5', V.koen.deg.join(','));
chk('Königsberg has four odd vertices, so neither a circuit nor a trail', V.koen.odd === 4 && !V.koen.circuit && !V.koen.trail, 'odd ' + V.koen.odd);
chk('K(2,3) has an Euler trail and no Euler circuit', V.k23.trail && !V.k23.circuit, 'odd ' + V.k23.odd);
chk('K(2,3) has no Hamiltonian cycle but does have a Hamiltonian path', !V.k23.ham && V.k23.hamPath);
chk('the chorded six-cycle has a Hamiltonian cycle and no Euler trail', V.chord6.ham && !V.chord6.trail && V.chord6.odd === 4, 'odd ' + V.chord6.odd);
chk('two disjoint triangles have all degrees even and no Euler circuit', V.twotri.odd === 0 && !V.twotri.connected && !V.twotri.circuit);
chk('the bowtie is Eulerian with all degrees even', V.bowtie.odd === 0 && V.bowtie.circuit && V.bowtie.deg.join(',') === '2,4,2,2,2', V.bowtie.deg.join(','));
chk('Hierholzer\'s first walk closes at 0 in three edges', V.bowtie.firstWalk.length === 3 && V.bowtie.firstVerts[0] === 0 && V.bowtie.firstVerts[3] === 0, V.bowtie.firstVerts.join('-'));
chk('one splice at vertex 1 completes the tour', V.bowtie.splices.length === 1 && V.bowtie.splices[0].at === 1, 'splices ' + V.bowtie.splices.length);
chk('the final tour is closed and uses every edge exactly once', V.bowtie.closed && V.bowtie.usesEachOnce && V.bowtie.tour.length === 6, V.bowtie.tourVerts.join('-'));
chk('K5 has ten edges and every degree 4', V.k5.edges === 10 && V.k5.deg.join(',') === '4,4,4,4,4', V.k5.deg.join(','));
chk('K5 splits into two edge-disjoint five-cycles covering all ten edges', V.k5.decompOk);
chk('K5 has 132 Euler circuits up to rotation and reversal', V.k5.circuits === 132, 'counted ' + V.k5.circuits);
chk('the traversal count is 528 = 132 x 2 directions x 2 visits to vertex 0', V.k5.traversals === 528 && V.k5.traversals === V.k5.circuits * 4, 'traversals ' + V.k5.traversals);
chk('Hamiltonian cycles of K(n) match (n-1)!/2 for n = 3 to 7', V.ham.every(function (r) { return r.brute === r.formula; }), V.ham.map(function (r) { return r.n + ':' + r.brute; }).join(' '));
chk('K6 minus a perfect matching satisfies Dirac and is Hamiltonian', V.dirac6.delta * 2 >= 6 && V.dirac6.ham, 'delta ' + V.dirac6.delta);
chk('the six-cycle fails Dirac and Ore and is Hamiltonian', !V.c6.dirac && !V.c6.ore && V.c6.ham, 'ore min ' + V.c6.oreMin);
chk('the Petersen graph is 3-regular with 15 edges', V.petersen.edges === 15 && V.petersen.deg.every(function (x) { return x === 3; }));
chk('the Petersen graph has no Hamiltonian cycle, found by exhaustive search', !V.petersen.ham);
chk('deleting any single vertex of the Petersen graph leaves a Hamiltonian graph', V.petersen.minusAny);
chk('the Petersen graph has no Euler circuit and no Euler trail', !V.petersen.circuit && !V.petersen.trail && V.petersen.odd === 10, 'odd ' + V.petersen.odd);
chk('the complement of the 25-cycle is 22-regular with 275 edges', V.comp25.minDeg === 22 && V.comp25.maxDeg === 22 && V.comp25.edges === 275, 'deg ' + V.comp25.minDeg + '-' + V.comp25.maxDeg);
chk('the complement of the 25-cycle is connected, so it is Eulerian', V.comp25.connected && V.comp25.circuit);
chk('GATE CSE 2007 option A fails: two disjoint triangles are 2-regular with no circuit', V.gate2007.A.regular && !V.gate2007.A.connected && !V.gate2007.A.circuit);
chk('GATE CSE 2007 option B fails: K(90) has degree 89, which is odd', V.gate2007.B.deg === 89 && !V.gate2007.B.even);
chk('GATE CSE 2007 option C holds, so the answer is C', V.gate2007.C.circuit && V.gate2007.C.connected && V.gate2007.C.deg === 22);
chk('the Euler criterion agrees with brute force on every graph with 4 or 5 vertices', V.enum.eulerBad === 0 && V.enum.eulerChecked === 1086, V.enum.eulerChecked + ' graphs, ' + V.enum.eulerBad + ' disagreements');
chk('the criterion agrees with brute force on the 6-vertex sample', V.enum.eulerSampleBad === 0 && V.enum.eulerSample > 240, V.enum.eulerSample + ' graphs, ' + V.enum.eulerSampleBad + ' disagreements');
chk('the directed criterion agrees with brute force on every digraph with 3 vertices', V.enum.digraphBad === 0 && V.enum.digraphs === 63, V.enum.digraphs + ' digraphs, ' + V.enum.digraphBad + ' disagreements');
chk('no graph satisfying Dirac up to six vertices lacks a Hamiltonian cycle', V.enum.diracBad === 0 && V.enum.diracCases > 100, V.enum.diracCases + ' cases, ' + V.enum.diracBad + ' failures');
chk('no graph satisfying Ore up to five vertices lacks a Hamiltonian cycle', V.enum.oreBad === 0, V.enum.oreCases + ' cases, ' + V.enum.oreBad + ' failures');
chk('no Hamiltonian graph up to five vertices violates c(G - S) <= |S|', V.enum.toughBad === 0 && V.enum.toughGraphs === 228, V.enum.toughGraphs + ' graphs, ' + V.enum.toughBad + ' violations');

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
function note(x, y, s, o) {
  o = o || {};
  txt(x, y, s, { size: o.size || 11, color: o.color || INK, mono: o.mono, bold: o.bold, align: o.align });
}
function card(x, y, w, h, o) {
  o = o || {};
  if (!P) return;
  P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1 });
}

/* one graph drawing vocabulary: edges, then vertices, then labels */
function drawGraph(g, o) {
  o = o || {};
  var i, a, b;
  var pos = g.pos;
  var hl = o.highlight || {};       /* edge key -> true */
  var fade = o.fadeKeys || null;
  for (i = 0; i < g.edges.length; i++) {
    a = pos[g.edges[i][0]]; b = pos[g.edges[i][1]];
    var key = edgeKey(g.edges[i]);
    var on = hl[key];
    P.line(a[0], a[1], b[0], b[1], {
      stroke: on ? ACC : (o.edgeColor || BORDER),
      sw: on ? 3.2 : (o.sw || 1.6)
    });
  }
  for (i = 0; i < g.n; i++) {
    var v = pos[i];
    var fill = (o.vertexFill || SURF);
    if (o.mark && o.mark[i]) fill = ACCDIM;
    if (o.bad && o.bad[i]) fill = BADDIM;
    P.circle(v[0], v[1], o.r || 15, { fill: fill, stroke: o.stroke || BORDER, sw: 1.4 });
    txt(v[0], v[1], g.names[i], { size: o.labelSize || 11, mono: true, align: 'center', base: 'middle', color: INK });
  }
}

function edgeKey(e) { return Math.min(e[0], e[1]) + '-' + Math.max(e[0], e[1]); }

/* parallel edges need their own lines: offset each one along the normal */
function drawMulti(g, o) {
  o = o || {};
  var i, seen = {}, k;
  for (i = 0; i < g.edges.length; i++) {
    var a = g.pos[g.edges[i][0]], b = g.pos[g.edges[i][1]];
    var key = edgeKey(g.edges[i]);
    var idx = seen[key] || 0;
    seen[key] = idx + 1;
    var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / len, ny = dx / len;
    var off = 0;
    /* a pair is drawn at -5 and +5; a single edge at 0 */
    var count = 0;
    for (k = 0; k < g.edges.length; k++) if (edgeKey(g.edges[k]) === key) count++;
    if (count === 2) off = idx === 0 ? -5 : 5;
    else if (count === 3) off = (idx - 1) * 7;
    P.line(a[0] + nx * off, a[1] + ny * off, b[0] + nx * off, b[1] + ny * off,
      { stroke: o.edgeColor || BORDER, sw: o.sw || 1.8 });
  }
  for (i = 0; i < g.n; i++) {
    var v = g.pos[i];
    P.circle(v[0], v[1], 16, { fill: SURF, stroke: BORDER, sw: 1.4 });
    txt(v[0], v[1], g.names[i], { size: 10, mono: true, align: 'center', base: 'middle', color: INK });
  }
}

/* a path drawn edge by edge, revealed by progress */
function drawTrail(g, verts, p, o) {
  o = o || {};
  var total = verts.length - 1;
  if (total < 1) return;
  var shown = Math.min(total, Math.floor(p * (total + 1)));
  var i;
  for (i = 0; i < shown; i++) {
    var a = g.pos[verts[i]], b = g.pos[verts[i + 1]];
    P.line(a[0], a[1], b[0], b[1], { stroke: ACC, sw: 3.4 });
  }
  for (i = 0; i <= shown; i++) {
    var v = g.pos[verts[i]];
    P.circle(v[0], v[1], 7, { fill: ACC, stroke: ACC, sw: 1 });
  }
}

var SCENE_DRAW = {};

/* ---- scene 1: the two questions ---- */
SCENE_DRAW.two = function (t, sc) {
  var p = prog(t, sc);
  heading('Two questions, one word apart');
  subline('Euler rations edges. Hamilton rations vertices. Neither implies the other.');

  /* left: K(2,3) with its Euler trail drawn in */
  card(24, 62, 430, 360, { fill: SURF });
  txt(40, 84, 'K(2,3): the Euler trail', { size: 11.5, bold: true, color: ACC });
  var g1 = { n: K23.n, edges: K23.edges, pos: [[70, 160], [70, 300], [270, 120], [270, 230], [270, 340]], names: K23.names };
  drawGraph(g1, { r: 13, labelSize: 10 });
  var trail = [0, 2, 1, 3, 0, 4, 1];
  if (p > 0.18) drawTrail(g1, trail, Math.min(1, (p - 0.18) / 0.55));
  if (p > 0.5) {
    note(40, 372, 'degrees 3, 3, 2, 2, 2: two odd vertices,', { size: 10.5 });
    note(40, 390, 'so an open trail exists and no circuit does.', { size: 10.5 });
  }

  /* right: the chorded six-cycle with its Hamiltonian cycle drawn in */
  card(470, 62, 406, 360, { fill: SURF });
  txt(486, 84, 'The chorded six-cycle: the Hamiltonian cycle', { size: 11.5, bold: true, color: ACC });
  var g2 = { n: 6, edges: CHORD6.edges, pos: ring(6, 660, 240, 100, 0), names: CHORD6.names };
  drawGraph(g2, { r: 13, labelSize: 10 });
  var hc = [0, 1, 2, 3, 4, 5, 0];
  if (p > 0.55) drawTrail(g2, hc, Math.min(1, (p - 0.55) / 0.35));
  if (p > 0.8) {
    note(486, 372, 'degrees 3, 2, 3, 3, 2, 3: four odd vertices,', { size: 10.5 });
    note(486, 390, 'so no Euler trail at all, yet the cycle above exists.', { size: 10.5 });
  }

  if (p > 0.9) {
    note(28, 440, 'Trail: no edge repeated. Path: no vertex repeated. Circuit: a closed trail. Cycle: a closed path.', { size: 10.5, color: DIM });
  }
};

/* ---- scene 2: the degree count ---- */
SCENE_DRAW.degree = function (t, sc) {
  var p = prog(t, sc);
  heading('The degree count is forced, not guessed');
  subline('Passing through a vertex costs two of its edges. Everything else follows.');

  card(24, 62, 330, 360, { fill: SURF });
  txt(40, 84, 'The seven bridges of Königsberg', { size: 11.5, bold: true, color: ACC });
  var g = { n: KOEN.n, edges: KOEN.edges, pos: [[50, 150], [50, 320], [190, 235], [310, 235]], names: ['N', 'S', 'I', 'E'] };
  drawMulti(g, {});
  if (p > 0.15) {
    var deg = V.koen.deg;
    for (var i = 0; i < g.n; i++) {
      var v = g.pos[i];
      txt(v[0] + 22, v[1] - 26, 'deg ' + deg[i], { size: 10, mono: true, color: deg[i] % 2 ? BAD : VAL });
    }
  }
  if (p > 0.3) {
    note(40, 372, 'N, S, I, E are the four land masses.', { size: 10.5, color: DIM });
    note(40, 390, 'Seven bridges, so the degrees sum to fourteen.', { size: 10.5, color: DIM });
  }

  /* right: the argument, then the verdict */
  card(374, 62, 502, 210, { fill: SURF2 });
  txt(392, 84, 'Why the parity is forced', { size: 11.5, bold: true, color: INK });
  if (p > 0.05) note(392, 108, 'Each visit to a vertex uses two edges there:', { size: 11 });
  if (p > 0.12) note(392, 126, 'one to arrive, one to leave.', { size: 11, color: DIM });
  if (p > 0.3) note(392, 150, 'A closed tour therefore pairs every vertex\'s edges,', { size: 11 });
  if (p > 0.36) note(392, 168, 'so every degree is even. Necessary, in one line.', { size: 11 });
  if (p > 0.5) note(392, 192, 'An open trail has two exceptions: the vertex it', { size: 11 });
  if (p > 0.56) note(392, 210, 'starts at and the vertex it ends at. Two, never more.', { size: 11 });
  if (p > 0.66) note(392, 240, 'At most two odd vertices, or no trail exists.', { size: 11, bold: true, color: ACC });

  card(374, 288, 502, 134, { fill: WARNDIM, stroke: WARN, sw: 1.2 });
  txt(392, 310, 'The verdict on Königsberg', { size: 11.5, bold: true, color: WARN });
  if (p > 0.74) {
    note(392, 334, 'Four odd vertices: ' + V.koen.odd + '. The limit is two.', { size: 11 });
    note(392, 354, 'Brute-force search for a trail: ' + (V.koen.trail ? 'found' : 'none') + '.', { size: 11, mono: true });
    note(392, 374, 'Criterion on the trail question: ' + (V.koen.criterionTrail ? 'yes' : 'no') + '. Both agree.', { size: 11 });
    note(392, 398, 'No walk crosses all seven bridges once.', { size: 11, bold: true, color: INK });
  }

  if (p > 0.95) note(28, 442, 'Odd vertices always come in an even number, because the degrees sum to twice the edge count.', { size: 10.5, color: DIM });
};

/* ---- scene 3: sufficiency and its hypothesis ---- */
SCENE_DRAW.suff = function (t, sc) {
  var p = prog(t, sc);
  heading('Even degrees and one component is enough');
  subline('Euler stated it in 1736; Hierholzer published the first complete proof in 1873.');

  card(24, 62, 264, 200, { fill: BADDIM, stroke: BAD, sw: 1.2 });
  txt(40, 84, 'All even, not connected', { size: 11.5, bold: true, color: BAD });
  var g1 = { n: 6, edges: TWOTRI.edges, pos: [[62, 158], [62, 232], [150, 195], [196, 158], [196, 232], [268, 195]], names: ['0', '1', '2', '3', '4', '5'] };
  drawGraph(g1, { r: 11, labelSize: 9, edgeColor: BAD });

  card(300, 62, 264, 200, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  txt(316, 84, 'All even, one component', { size: 11.5, bold: true, color: ACC });
  var g2 = { n: 5, edges: BOWTIE.edges, pos: [[344, 150], [424, 195], [344, 240], [500, 150], [500, 240]], names: BOWTIE.names };
  drawGraph(g2, { r: 11, labelSize: 9 });
  if (p > 0.45) drawTrail({ n: 5, edges: BOWTIE.edges, pos: g2.pos, names: BOWTIE.names }, V.bowtie.tourVerts, Math.min(1, (p - 0.45) / 0.35));

  card(576, 62, 300, 200, { fill: SURF2 });
  txt(592, 84, 'The criterion, stated in full', { size: 11.5, bold: true, color: INK });
  if (p > 0.1) note(592, 110, 'A circuit exists if and only if every', { size: 10.5 });
  if (p > 0.16) note(592, 128, 'degree is even and all the vertices with a', { size: 10.5 });
  if (p > 0.22) note(592, 146, 'nonzero degree lie in one component.', { size: 10.5 });
  if (p > 0.5) note(592, 172, 'A trail exists if and only if exactly zero', { size: 10.5 });
  if (p > 0.56) note(592, 190, 'or two vertices are odd, and the edges', { size: 10.5 });
  if (p > 0.62) note(592, 208, 'again lie in one component.', { size: 10.5 });
  if (p > 0.84) note(592, 238, 'Directed: in = out everywhere.', { size: 10.5, color: INFO });

  card(24, 274, 852, 174, { fill: SURF2 });
  txt(40, 296, 'Two failures, one repair, and the directed case', { size: 11.5, bold: true, color: INK });
  if (p > 0.26) note(40, 322, 'Two triangles: degrees 2, 2, 2, 2, 2, 2, all even.', { size: 10.5 });
  if (p > 0.32) note(40, 340, 'Two components, so no walk covers both. Brute', { size: 10.5 });
  if (p > 0.38) note(40, 358, 'force agrees: no circuit found.', { size: 10.5 });
  if (p > 0.44) note(40, 382, 'This is the clause a degree count never supplies,', { size: 10.5 });
  if (p > 0.5) note(40, 400, 'and the one GATE CSE 2007 Q23 turns on.', { size: 10.5, color: BAD });
  if (p > 0.68) note(470, 322, 'Bowtie: tour ' + V.bowtie.tourVerts.join('-') + '.', { size: 10.5, mono: true, color: ACC });
  if (p > 0.74) note(470, 340, 'The shared vertex is used twice, once per triangle.', { size: 10.5 });
  if (p > 0.8) note(470, 358, 'Revisiting a vertex is allowed: only edges are rationed.', { size: 10.5 });
  if (p > 0.88) note(470, 382, 'All ' + V.enum.digraphs + ' directed graphs on three vertices:', { size: 10.5 });
  if (p > 0.92) note(470, 400, 'balance plus one component, ' + (V.enum.digraphBad === 0 ? 'no disagreement' : V.enum.digraphBad + ' disagreements') + '.', { size: 10.5, color: VAL });
};

/* ---- scene 4: Hierholzer ---- */
SCENE_DRAW.hier = function (t, sc) {
  var p = prog(t, sc);
  heading('Hierholzer: walk, then splice');
  subline('The walk cannot get stuck anywhere but its start, so the first walk always closes.');

  card(24, 62, 400, 360, { fill: SURF });
  txt(40, 84, 'The bowtie, from vertex 0', { size: 11.5, bold: true, color: ACC });
  var g = { n: 5, edges: BOWTIE.edges, pos: [[60, 170], [170, 250], [60, 330], [290, 170], [290, 330]], names: BOWTIE.names };
  drawGraph(g, { r: 14, labelSize: 10 });

  if (p > 0.1 && p <= 0.45) {
    drawTrail(g, V.bowtie.firstVerts, Math.min(1, (p - 0.1) / 0.3));
  }
  if (p > 0.45) {
    drawTrail(g, V.bowtie.firstVerts, 1);
    note(40, 372, 'First walk: ' + V.bowtie.firstVerts.join('-') + ' (' + V.bowtie.firstWalk.length + ' edges).', { size: 10.5, mono: true, color: ACC });
  }
  if (p > 0.62) {
    drawTrail(g, V.bowtie.tourVerts, Math.min(1, (p - 0.62) / 0.25));
  }
  if (p > 0.86) {
    note(40, 392, 'After the splice: ' + V.bowtie.tourVerts.join('-') + ' (' + V.bowtie.tour.length + ' edges).', { size: 10.5, mono: true, color: INK });
    note(40, 410, 'Closed: ' + (V.bowtie.closed ? 'yes' : 'no') + '. Every edge once: ' + (V.bowtie.usesEachOnce ? 'yes' : 'no') + '.', { size: 10.5, color: VAL });
  }

  card(444, 62, 432, 176, { fill: SURF2 });
  txt(460, 84, 'The two steps', { size: 11.5, bold: true, color: INK });
  if (p > 0.04) note(460, 110, '1. Walk from the start, taking any unused edge,', { size: 10.5 });
  if (p > 0.1) note(460, 128, '   until the current vertex has none left.', { size: 10.5 });
  if (p > 0.3) note(460, 152, '2. If an edge anywhere is unused, find a vertex of', { size: 10.5 });
  if (p > 0.36) note(460, 170, '   the tour that still has one, walk a closed cycle', { size: 10.5 });
  if (p > 0.42) note(460, 188, '   from it, and splice that cycle in at that vertex.', { size: 10.5 });
  if (p > 0.5) note(460, 214, 'Repeat until no edge is unused. What is left is a tour.', { size: 10.5, color: ACC });

  card(444, 254, 432, 168, { fill: SURF2 });
  txt(460, 276, 'What it costs', { size: 11.5, bold: true, color: INK });
  if (p > 0.55) note(460, 302, 'Each edge is taken exactly once, so the walk is O(E).', { size: 10.5 });
  if (p > 0.61) note(460, 322, 'Splicing with a stack touches no edge twice, so O(V + E) total.', { size: 10.5 });
  if (p > 0.7) note(460, 348, 'Fleury\'s rule picks a non-bridge at each step: the same', { size: 10.5 });
  if (p > 0.76) note(460, 366, 'idea, but the bridge test costs a search per step.', { size: 10.5 });
  if (p > 0.84) note(460, 392, 'Deciding and constructing are both linear here.', { size: 10.5, bold: true, color: ACC });

  if (p > 0.95) note(28, 442, 'Hierholzer also proves the theorem: the algorithm only ever stops with every edge used, given even degrees and one component.', { size: 10.5, color: DIM });
};

/* ---- scene 5: counting ---- */
SCENE_DRAW.count = function (t, sc) {
  var p = prog(t, sc);
  heading('How many tours, and the cycles inside');
  subline('The decomposition proves the criterion; the count is a separate, harder question.');

  card(24, 62, 300, 300, { fill: SURF });
  txt(40, 84, 'K5 as two edge-disjoint 5-cycles', { size: 11.5, bold: true, color: ACC });
  var g = { n: 5, edges: [], pos: ring(5, 174, 220, 92, 0), names: ['0', '1', '2', '3', '4'] };
  /* draw the two cycles in two colours, then the vertices */
  var cyc1 = V.k5.decomp[0], cyc2 = V.k5.decomp[1], i;
  for (i = 0; i < cyc1.length; i++) {
    var a = g.pos[cyc1[i][0]], b = g.pos[cyc1[i][1]];
    P.line(a[0], a[1], b[0], b[1], { stroke: ACC, sw: 2.6 });
  }
  if (p > 0.3) {
    for (i = 0; i < cyc2.length; i++) {
      var c = g.pos[cyc2[i][0]], d = g.pos[cyc2[i][1]];
      P.line(c[0], c[1], d[0], d[1], { stroke: INFO, sw: 1.6 });
    }
  }
  for (i = 0; i < 5; i++) {
    P.circle(g.pos[i][0], g.pos[i][1], 14, { fill: SURF, stroke: BORDER, sw: 1.4 });
    txt(g.pos[i][0], g.pos[i][1], g.names[i], { size: 10, mono: true, align: 'center', base: 'middle', color: INK });
  }
  if (p > 0.18) note(40, 330, 'Thick: 0-1-2-3-4-0. Thin: 0-2-4-1-3-0.', { size: 10.5 });
  if (p > 0.34) note(40, 348, 'Five edges each, no edge twice, all ten covered.', { size: 10.5, color: DIM });

  card(340, 62, 536, 142, { fill: SURF2 });
  txt(356, 84, 'Why a decomposition proves the criterion', { size: 11.5, bold: true, color: INK });
  if (p > 0.06) note(356, 110, 'Walk from any vertex until you come back to it. That closed walk is a cycle, and it uses two', { size: 10.5 });
  if (p > 0.12) note(356, 128, 'edges at every vertex it touches, so after deleting it every remaining degree is still even.', { size: 10.5 });
  if (p > 0.2) note(356, 152, 'Repeat. You end with edge-disjoint cycles covering every edge. Splice them one into another', { size: 10.5 });
  if (p > 0.26) note(356, 170, 'and the result is a single tour. That is the proof of sufficiency, and it is constructive.', { size: 10.5 });
  if (p > 0.36) note(356, 194, 'Cost of the check: degrees are O(V + E); connectivity is one search. Linear.', { size: 10.5, color: ACC });

  card(340, 220, 260, 142, { fill: SURF2 });
  txt(356, 242, 'Counting the tours of K5', { size: 11.5, bold: true, color: INK });
  if (p > 0.44) note(356, 268, 'Traversals from vertex 0:', { size: 10.5 });
  if (p > 0.5) note(356, 286, V.k5.traversals + '', { size: 16, mono: true, bold: true, color: ACC });
  if (p > 0.58) note(356, 312, 'Vertex 0 has degree 4, so every tour passes', { size: 10.5 });
  if (p > 0.64) note(356, 330, 'it twice, and each tour has two directions:', { size: 10.5 });
  if (p > 0.7) note(356, 348, '528 / (2 x 2) = ' + V.k5.circuits + ' circuits.', { size: 10.5, mono: true });

  card(616, 220, 260, 142, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  txt(632, 242, 'What the count does not do', { size: 11.5, bold: true, color: ACC });
  if (p > 0.78) note(632, 268, 'It answers "how many", not "does one exist".', { size: 10.5 });
  if (p > 0.84) note(632, 288, 'Rotating or reversing a circuit gives the', { size: 10.5 });
  if (p > 0.9) note(632, 306, 'same circuit, and a naive count of sequences', { size: 10.5 });
  if (p > 0.95) note(632, 324, 'overcounts by 4. Both counts give ' + V.k5.circuits + '.', { size: 10.5, mono: true });
  note(632, 350, 'K(3) has exactly 1: a triangle.', { size: 10.5, color: DIM });

  note(28, 386, 'Counting Euler circuits is a different problem from deciding whether one exists. Only the decision has a one-line test.', { size: 10.5, color: DIM });
  note(28, 408, 'A decomposition is not unique, and the number of decompositions is not the number of tours.', { size: 10.5, color: DIM });
};

/* ---- scene 6: NP-completeness ---- */
SCENE_DRAW.np = function (t, sc) {
  var p = prog(t, sc);
  heading('Hamilton has no test, and that is a theorem');
  subline('Karp listed the directed and the undirected Hamiltonian circuit among his twenty-one problems in 1972.');

  card(24, 62, 404, 360, { fill: SURF });
  txt(40, 84, 'What brute force would have to examine', { size: 11.5, bold: true, color: ACC });
  if (p > 0.1) note(40, 112, 'A Hamiltonian cycle of K(n) is an ordering of the n', { size: 10.5 });
  if (p > 0.16) note(40, 130, 'vertices up to rotation and reversal, so there are', { size: 10.5 });
  if (p > 0.22) note(40, 152, '(n - 1)! / 2 of them.', { size: 12, mono: true, color: ACC });

  if (p > 0.3) {
    var rows = [
      ['n = 3', '1'],
      ['n = 4', '3'],
      ['n = 5', '12'],
      ['n = 6', '60'],
      ['n = 7', '360'],
      ['n = 10', '181,440'],
      ['n = 25', '3.10 x 10^23']
    ];
    var i;
    for (i = 0; i < rows.length; i++) {
      if (p < 0.3 + i * 0.045) break;
      var y = 184 + i * 22;
      note(40, y, rows[i][0], { size: 10.5, mono: true, color: DIM });
      note(150, y, rows[i][1], { size: 10.5, mono: true, color: i > 4 ? BAD : INK });
    }
  }
  if (p > 0.72) note(40, 348, 'The first five were counted here and match the formula.', { size: 10.5, color: VAL });
  if (p > 0.8) note(40, 370, 'At a billion checks a second, n = 25 takes about', { size: 10.5 });
  if (p > 0.86) note(40, 388, Math.round(V.bigCounts.years).toLocaleString('en-US') + ' years. A faster machine does not help.', { size: 10.5, color: BAD });

  card(444, 62, 432, 168, { fill: WARNDIM, stroke: WARN, sw: 1.2 });
  txt(460, 84, 'What NP-complete means here', { size: 11.5, bold: true, color: WARN });
  if (p > 0.04) note(460, 110, 'No polynomial-time algorithm is known for deciding', { size: 10.5 });
  if (p > 0.1) note(460, 128, 'whether a Hamiltonian cycle exists.', { size: 10.5 });
  if (p > 0.4) note(460, 154, 'A polynomial-time one would settle P against NP.', { size: 10.5 });
  if (p > 0.5) note(460, 176, 'The problem is in NP: a proposed cycle is checked', { size: 10.5 });
  if (p > 0.56) note(460, 194, 'in linear time, by walking it and testing each edge.', { size: 10.5 });
  if (p > 0.64) note(460, 216, 'Checking a certificate is easy. Finding one is not.', { size: 10.5, bold: true, color: INK });

  card(444, 246, 432, 176, { fill: SURF2 });
  txt(460, 268, 'The asymmetry with Euler', { size: 11.5, bold: true, color: INK });
  if (p > 0.7) note(460, 294, 'Euler: count degrees, check one component. O(V + E).', { size: 10.5 });
  if (p > 0.76) note(460, 314, 'Hamilton: search, with sufficient conditions as shortcuts.', { size: 10.5 });
  if (p > 0.82) note(460, 338, 'A sufficient condition can only ever answer yes.', { size: 10.5, color: ACC });
  if (p > 0.88) note(460, 358, 'There is no Euler-style parity theorem for vertices,', { size: 10.5 });
  if (p > 0.94) note(460, 376, 'and none is expected: that would decide P = NP.', { size: 10.5 });
  note(460, 402, 'Both questions are about one sequence; only one has a short test.', { size: 10.5, color: DIM });
};

/* ---- scene 7: sufficient conditions ---- */
SCENE_DRAW.cond = function (t, sc) {
  var p = prog(t, sc);
  heading('Sufficient conditions certify; they do not decide');
  subline('Dirac 1952 and Ore 1960 prove a cycle exists. Neither can prove that none does.');

  card(24, 62, 268, 196, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  txt(40, 84, 'Dirac holds here', { size: 11.5, bold: true, color: ACC });
  var g1 = { n: 6, edges: DIRAC6.edges, pos: ring(6, 158, 182, 62, 0), names: DIRAC6.names };
  drawGraph(g1, { r: 10, labelSize: 9 });

  card(308, 62, 268, 196, { fill: BADDIM, stroke: BAD, sw: 1.2 });
  txt(324, 84, 'Both fail here, and it is Hamiltonian', { size: 11.5, bold: true, color: BAD });
  var g2 = { n: 6, edges: C6.edges, pos: ring(6, 442, 182, 62, 0), names: C6.names };
  drawGraph(g2, { r: 10, labelSize: 9 });

  card(592, 62, 284, 196, { fill: SURF2 });
  txt(608, 84, 'The two theorems', { size: 11.5, bold: true, color: INK });
  if (p > 0.06) note(608, 110, 'Dirac: n >= 3 and delta >= n/2', { size: 10.5 });
  if (p > 0.12) note(608, 128, 'implies a Hamiltonian cycle.', { size: 10.5 });
  if (p > 0.3) note(608, 152, 'Ore: deg u + deg v >= n for every', { size: 10.5 });
  if (p > 0.36) note(608, 170, 'non-adjacent pair implies one.', { size: 10.5 });
  if (p > 0.56) note(608, 196, 'Ore is weaker than Dirac and gives', { size: 10.5 });
  if (p > 0.62) note(608, 214, 'the same conclusion.', { size: 10.5 });
  if (p > 0.7) note(608, 240, 'Sufficient. Neither is necessary.', { size: 10.5, bold: true, color: BAD });

  if (p > 0.1) note(40, 276, 'K6 minus a perfect matching: every degree 4.', { size: 10.5 });
  if (p > 0.16) note(40, 294, 'n = 6, so n/2 = 3, and 4 >= 3: Dirac applies.', { size: 10.5 });
  if (p > 0.24) note(40, 312, 'Hamiltonian cycle found: ' + (V.dirac6.ham ? 'yes' : 'no') + '.', { size: 10.5, mono: true, color: VAL });

  if (p > 0.36) note(324, 276, 'The six-cycle: every degree 2, so 2 < 3.', { size: 10.5 });
  if (p > 0.42) note(324, 294, 'Non-adjacent pairs sum to 4, so 4 < 6.', { size: 10.5 });
  if (p > 0.5) note(324, 312, 'Hamiltonian anyway: the cycle itself.', { size: 10.5, mono: true, color: VAL });

  card(24, 330, 852, 118, { fill: SURF2 });
  txt(40, 352, 'Necessary conditions that do work', { size: 11.5, bold: true, color: INK });
  if (p > 0.76) {
    note(40, 376, 'Bipartite: a cycle alternates sides, so the sides must be equal. K(2,3) has sides 2 and 3 and no Hamiltonian cycle.', { size: 10.5 });
    note(40, 394, 'Component count: deleting a set S leaves at most |S| components, because a cycle passes through S at most |S| times.', { size: 10.5 });
    note(40, 414, 'Checked on all ' + V.enum.toughGraphs + ' Hamiltonian graphs with at most five vertices: ' + (V.enum.toughBad === 0 ? 'no violation' : V.enum.toughBad + ' violations') + '. Neither condition is sufficient.', { size: 10.5, color: VAL });
    note(40, 434, 'The Petersen graph satisfies the second and is not Hamiltonian, which is why it cannot decide the question.', { size: 10.5, color: DIM });
  }
};

/* ---- scene 8: Petersen ---- */
SCENE_DRAW.petersen = function (t, sc) {
  var p = prog(t, sc);
  heading('The Petersen graph, checked three ways');
  subline('Ten vertices, fifteen edges, every degree three. It is the graph that defeats quick intuitions.');

  card(24, 62, 350, 360, { fill: SURF });
  txt(40, 84, 'The standard drawing', { size: 11.5, bold: true, color: ACC });
  var g = { n: 10, edges: PETERSEN.edges, pos: PETERSEN.pos, names: PETERSEN.names };
  /* the drawing is centred near x = 250; shift it into the card */
  var pos = [], i;
  for (i = 0; i < 10; i++) pos.push([PETERSEN.pos[i][0] - 55, PETERSEN.pos[i][1]]);
  g.pos = pos;
  drawGraph(g, { r: 13, labelSize: 9 });
  if (p > 0.2) note(40, 372, 'The crossings are not vertices: 10 vertices, 15 edges.', { size: 10.5, color: DIM });
  if (p > 0.28) note(40, 390, 'No triangle and no four-cycle; girth 5.', { size: 10.5, color: DIM });

  card(394, 62, 482, 116, { fill: BADDIM, stroke: BAD, sw: 1.2 });
  txt(410, 84, 'No Hamiltonian cycle', { size: 11.5, bold: true, color: BAD });
  if (p > 0.36) note(410, 110, 'Exhaustive search over every cycle starting at vertex 0: ' + (V.petersen.ham ? 'found' : 'none') + '.', { size: 10.5, mono: true });
  if (p > 0.44) note(410, 130, 'A short proof: a Hamiltonian cycle plus the five remaining edges would', { size: 10.5 });
  if (p > 0.5) note(410, 148, 'be a three-edge-colouring, and the Petersen graph has none.', { size: 10.5 });
  if (p > 0.56) note(410, 168, 'So the answer is no, and it is a proof, not a failure to find one.', { size: 10.5, color: INK });

  card(394, 194, 482, 116, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  txt(410, 216, 'Yet deleting any one vertex leaves it Hamiltonian', { size: 11.5, bold: true, color: ACC });
  if (p > 0.64) note(410, 242, 'Ten searches, one per deleted vertex: ' + (V.petersen.minusAny ? 'a cycle every time' : 'a failure somewhere') + '.', { size: 10.5, mono: true });
  if (p > 0.7) note(410, 262, 'A graph with that property is called hypohamiltonian, and the', { size: 10.5 });
  if (p > 0.76) note(410, 280, 'Petersen graph is the smallest example.', { size: 10.5 });
  if (p > 0.82) note(410, 300, 'No single vertex is the obstruction: the obstruction is global.', { size: 10.5, color: ACC });

  card(394, 326, 482, 96, { fill: SURF2 });
  txt(410, 348, 'And no Euler trail either, for an unrelated reason', { size: 11.5, bold: true, color: INK });
  if (p > 0.88) note(410, 374, 'Every degree is 3, so all ten vertices are odd. A trail allows two.', { size: 10.5 });
  if (p > 0.94) note(410, 394, 'Line graph: L(G) is Hamiltonian exactly when G is Eulerian.', { size: 10.5, color: INFO });
};

/* ---- scene 9: the previous-year question ---- */
SCENE_DRAW.pyq = function (t, sc) {
  var p = prog(t, sc);
  heading('GATE CSE 2007, Question 23');
  subline('Which of the following graphs has an Eulerian circuit? Each option decided here, not recalled.');

  card(24, 62, 424, 116, { fill: SURF2 });
  txt(40, 84, 'Option A: any k-regular graph, k even', { size: 11.5, bold: true, color: INK });
  if (p > 0.1) note(40, 110, 'Counterexample: two disjoint triangles are 2-regular,', { size: 10.5 });
  if (p > 0.16) note(40, 128, 'every degree even, and no single walk covers both.', { size: 10.5 });
  if (p > 0.22) note(40, 152, 'Connected: ' + (V.gate2007.A.connected ? 'yes' : 'no') + '. Circuit: ' + (V.gate2007.A.circuit ? 'yes' : 'no') + '. So A fails.', { size: 10.5, mono: true, color: BAD });

  card(464, 62, 412, 116, { fill: SURF2 });
  txt(480, 84, 'Option B: the complete graph on 90 vertices', { size: 11.5, bold: true, color: INK });
  if (p > 0.3) note(480, 110, 'Every vertex has degree 90 - 1 = 89.', { size: 10.5 });
  if (p > 0.36) note(480, 128, '89 is odd, so there is not even an Euler trail.', { size: 10.5 });
  if (p > 0.42) note(480, 152, 'Degree 89: odd. So B fails, and connectedness cannot save it.', { size: 10.5, mono: true, color: BAD });

  card(24, 194, 852, 116, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  txt(40, 216, 'Option C: the complement of a cycle on 25 vertices', { size: 11.5, bold: true, color: ACC });
  if (p > 0.5) note(40, 242, 'Each vertex is joined to all but itself and its two cycle neighbours: 25 - 1 - 2 = 22 edges, so every degree is 22.', { size: 10.5 });
  if (p > 0.58) note(40, 262, 'Computed on the page: ' + V.comp25.edges + ' edges, every degree ' + V.comp25.minDeg + ', connected: ' + (V.comp25.connected ? 'yes' : 'no') + '.', { size: 10.5, mono: true });
  if (p > 0.66) note(40, 284, 'Connectivity is not free: the cycle edges were removed, so it has to be checked. Two cycle neighbours share a common', { size: 10.5 });
  if (p > 0.72) note(40, 300, 'non-neighbour in the complement, which joins them by a two-edge path.', { size: 10.5 });

  card(24, 326, 852, 96, { fill: WARNDIM, stroke: WARN, sw: 1.2 });
  txt(40, 348, 'The answer', { size: 11.5, bold: true, color: WARN });
  if (p > 0.8) note(40, 374, 'C. Every degree is even and the graph is connected, so the two-clause criterion holds.', { size: 10.5 });
  if (p > 0.88) note(40, 394, 'A and B are the two ways the criterion fails: one clause each. D would need all three options to fail.', { size: 10.5 });
  if (p > 0.94) note(40, 412, 'Remembered keys will not survive a change of 25 to 24: the complement of an even cycle is not Eulerian.', { size: 10.5, color: DIM });
};

/* ---- scene 10: procedure and traps ---- */
SCENE_DRAW.proc = function (t, sc) {
  var p = prog(t, sc);
  heading('One procedure for every question on this topic, and five traps');
  subline('Written once, it answers an Euler question, a Hamiltonian question, or a mixed one.');

  var steps = [
    ['1', 'Does the problem ration edges or vertices?', 'That single reading fixes the criterion.'],
    ['2', 'Edge question: count the odd degrees.', '0 gives a circuit, 2 a trail, 4 or more nothing.'],
    ['3', 'Edge question: check the edges are in one component.', 'The degrees never supply this.'],
    ['4', 'Vertex question: try Dirac, then Ore.', 'A certificate ends the question; a failure proves nothing.']
  ];
  for (var i = 0; i < steps.length; i++) {
    if (p < 0.08 + i * 0.12) break;
    var y = 82 + i * 56;
    card(24, y, 540, 46, { fill: SURF });
    P.circle(50, y + 23, 13, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
    txt(50, y + 23, steps[i][0], { size: 12, mono: true, align: 'center', base: 'middle', color: ACC, bold: true });
    txt(74, y + 18, steps[i][1], { size: 11.5, color: INK, bold: true });
    txt(74, y + 34, steps[i][2], { size: 10, color: DIM });
  }

  var traps = [
    'Answering one question with the other\'s rule.',
    'Using the parity count without connectivity.',
    'Reading the drawing instead of the edge list.',
    'Treating Dirac as a test for "no cycle".',
    'Forbidding a revisit of a vertex on a trail.'
  ];
  card(586, 82, 290, 226, { fill: WARNDIM, stroke: WARN, sw: 1.2 });
  txt(602, 106, 'The five traps', { size: 12, bold: true, color: WARN });
  for (i = 0; i < traps.length; i++) {
    if (p < 0.5 + i * 0.07) break;
    txt(602, 132 + i * 34, '\u00b7 ' + traps[i], { size: 10, color: INK });
  }

  if (p > 0.62) note(28, 330, 'Each trap produces a number that is on the option list, so checking the arithmetic will not catch it.', { color: INK });
  if (p > 0.7) note(28, 352, 'The defence is the same every time: name the object, then name the hypothesis of the theorem you use.', { color: INK });
  if (p > 0.8) note(28, 380, 'Euler: parity plus one component, linear. Hamilton: no test known, certificates only.', { color: ACC });
  if (p > 0.9) note(28, 408, 'Two questions, one letter apart, and they never answer for each other.', { color: DIM });
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
