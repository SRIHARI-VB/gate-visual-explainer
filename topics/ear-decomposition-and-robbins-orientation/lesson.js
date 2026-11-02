/* ==========================================================================
   ear-decomposition-and-robbins-orientation — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number and every structure the lesson shows.
     2. THE CHECKS     — each computed structure re-verified against its own
                         defining properties, on worked maps and exhaustively
                         on every small map.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   THE MODEL IS A MODEL. It implements the definitions exactly as the Build-up
   tab states them: an ear is a path with both ends in the part already built
   and every inside vertex new; a bridge is an edge whose deletion raises the
   component count; an orientation is strong when every vertex reaches every
   other. Nothing here is quoted from a paper: the theorems are labelled on the
   page, and what the code does is test them where it can — exhaustively on all
   64 maps on 4 stations and on all 848 maps on 5 stations with at most 6
   streets, by brute force over every orientation of each map.
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

/* ---------- graph primitives ---------- */

function adj(n, edges) {
  var a = [], i;
  for (i = 0; i < n; i++) a.push([]);
  for (i = 0; i < edges.length; i++) {
    a[edges[i][0]].push({ to: edges[i][1], id: i });
    a[edges[i][1]].push({ to: edges[i][0], id: i });
  }
  return a;
}

function componentsOf(n, edges) {
  var par = [], i;
  for (i = 0; i < n; i++) par.push(i);
  function find(x) { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; }
  for (i = 0; i < edges.length; i++) {
    var ra = find(edges[i][0]), rb = find(edges[i][1]);
    if (ra !== rb) par[ra] = rb;
  }
  var seen = {}, count = 0;
  for (i = 0; i < n; i++) { var r = find(i); if (!seen[r]) { seen[r] = 1; count++; } }
  return count;
}

function isConnected(n, edges) { return n > 0 && componentsOf(n, edges) === 1; }

function isBridge(n, edges, id) {
  var rest = [], i;
  for (i = 0; i < edges.length; i++) if (i !== id) rest.push(edges[i]);
  return componentsOf(n, rest) > componentsOf(n, edges);
}

function isBridgeless(n, edges) {
  for (var i = 0; i < edges.length; i++) if (isBridge(n, edges, i)) return false;
  return true;
}

function reachableFrom(n, arcs, s) {
  var a = [], i, seen = {}, q = [s];
  for (i = 0; i < n; i++) a.push([]);
  for (i = 0; i < arcs.length; i++) a[arcs[i][0]].push(arcs[i][1]);
  seen[s] = 1;
  while (q.length) {
    var u = q.pop();
    for (var k = 0; k < a[u].length; k++) if (!seen[a[u][k]]) { seen[a[u][k]] = 1; q.push(a[u][k]); }
  }
  return seen;
}

function reachableTo(n, arcs, s) {
  var rev = [], i, seen = {}, q = [s];
  for (i = 0; i < n; i++) rev.push([]);
  for (i = 0; i < arcs.length; i++) rev[arcs[i][1]].push(arcs[i][0]);
  seen[s] = 1;
  while (q.length) {
    var u = q.pop();
    for (var k = 0; k < rev[u].length; k++) if (!seen[rev[u][k]]) { seen[rev[u][k]] = 1; q.push(rev[u][k]); }
  }
  return seen;
}

function arcsStrong(n, arcs) {
  for (var s = 0; s < n; s++) if (Object.keys(reachableFrom(n, arcs, s)).length !== n) return false;
  return true;
}

function hasStrongOrientation(n, edges) {
  var m = edges.length;
  if (m > 16) return null;
  for (var mask = 0; mask < (1 << m); mask++) {
    var arcs = [], i;
    for (i = 0; i < m; i++) {
      arcs.push((mask >> i) & 1 ? [edges[i][0], edges[i][1]] : [edges[i][1], edges[i][0]]);
    }
    if (arcsStrong(n, arcs)) return true;
  }
  return false;
}

function countStrongOrientations(n, edges) {
  var m = edges.length, c = 0, i;
  if (m > 12) return null;
  for (var mask = 0; mask < (1 << m); mask++) {
    var arcs = [];
    for (i = 0; i < m; i++) arcs.push((mask >> i) & 1 ? [edges[i][0], edges[i][1]] : [edges[i][1], edges[i][0]]);
    if (arcsStrong(n, arcs)) c++;
  }
  return c;
}

function cutVertexExists(n, edges) {
  for (var v = 0; v < n; v++) {
    var rest = edges.filter(function (e) { return e[0] !== v && e[1] !== v; });
    var par = [], i, seen = {}, cnt = 0;
    for (i = 0; i < n; i++) par.push(i);
    function find(x) { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; }
    for (i = 0; i < rest.length; i++) {
      var ra = find(rest[i][0]), rb = find(rest[i][1]);
      if (ra !== rb) par[ra] = rb;
    }
    for (i = 0; i < n; i++) {
      if (i === v) continue;
      var r = find(i);
      if (!seen[r]) { seen[r] = 1; cnt++; }
    }
    if (cnt > 1) return true;
  }
  return false;
}

function isTwoVertexConnected(n, edges) {
  if (n < 3) return false;
  if (!isConnected(n, edges)) return false;
  return !cutVertexExists(n, edges);
}

function circuitRank(n, edges) { return edges.length - n + componentsOf(n, edges); }

/* ---------- the ear decomposition ---------- */

function firstCycle(n, edges) {
  var a = adj(n, edges), state = [], parentV = [], parentE = [], found = null, i;
  for (i = 0; i < n; i++) { state.push(0); parentV.push(-1); parentE.push(-1); }
  function dfs(u) {
    state[u] = 1;
    for (var k = 0; k < a[u].length && !found; k++) {
      var v = a[u][k].to, id = a[u][k].id;
      if (id === parentE[u]) continue;
      if (state[v] === 1) {
        var path = [], x = u;
        while (x !== v) { path.push(parentE[x]); x = parentV[x]; }
        path.reverse();
        path.push(id);
        found = { edges: path, from: v };
      } else if (state[v] === 0) {
        parentV[v] = u; parentE[v] = id; dfs(v);
      }
    }
    state[u] = 2;
  }
  for (i = 0; i < n && !found; i++) if (state[i] === 0) dfs(i);
  return found;
}

function otherEnd(edges, id, u) { return edges[id][0] === u ? edges[id][1] : edges[id][0]; }

function findEar(n, edges, a, used, S) {
  var i;
  for (i = 0; i < edges.length; i++) {
    if (used[i]) continue;
    if (S[edges[i][0]] && S[edges[i][1]]) {
      return { path: [i], from: edges[i][0], to: edges[i][1] };
    }
  }
  var keys = Object.keys(S).map(Number).sort(function (x, y) { return x - y; });

  function search(u) {
    var path = [], onPath = {}, taken = {};
    function rec(cur) {
      for (var j = 0; j < a[cur].length; j++) {
        var id = a[cur][j].id, w = a[cur][j].to;
        if (used[id] || taken[id]) continue;
        if (S[w]) {
          if (w === u && path.length === 0) continue;
          path.push(id);
          return true;
        }
        if (onPath[w]) continue;
        path.push(id); taken[id] = true; onPath[w] = true;
        if (rec(w)) return true;
        path.pop(); delete taken[id]; delete onPath[w];
      }
      return false;
    }
    if (!rec(u)) return null;
    var cur2 = u;
    for (var m = 0; m < path.length; m++) cur2 = otherEnd(edges, path[m], cur2);
    return { path: path.slice(), from: u, to: cur2 };
  }

  for (i = 0; i < keys.length; i++) {
    var r = search(keys[i]);
    if (r) return r;
  }
  return null;
}

function earDecomposition(n, edges) {
  var a = adj(n, edges), used = [], S = {}, ears = [], i;
  for (i = 0; i < edges.length; i++) used.push(false);
  var first = firstCycle(n, edges);
  if (!first) return null;
  for (i = 0; i < first.edges.length; i++) {
    used[first.edges[i]] = true;
    S[edges[first.edges[i]][0]] = 1; S[edges[first.edges[i]][1]] = 1;
  }
  ears.push({ edges: first.edges, from: first.from, to: first.from });

  var remaining = edges.length - first.edges.length;
  while (remaining > 0) {
    var keys = Object.keys(S).map(Number).sort(function (x, y) { return x - y; });
    var anyFree = false;
    for (i = 0; i < keys.length && !anyFree; i++) {
      var u = keys[i];
      for (var k = 0; k < a[u].length; k++) if (!used[a[u][k].id]) { anyFree = true; break; }
    }
    if (!anyFree) return null;
    var w = findEar(n, edges, a, used, S);
    if (!w) return null;
    for (i = 0; i < w.path.length; i++) {
      used[w.path[i]] = true;
      S[edges[w.path[i]][0]] = 1; S[edges[w.path[i]][1]] = 1;
    }
    ears.push({ edges: w.path, from: w.from, to: w.to });
    remaining -= w.path.length;
  }
  return ears;
}

/* validate a decomposition against its own definition */
function validateEars(n, edges, ears) {
  var problems = [], seenEdges = [], i, k;
  for (i = 0; i < edges.length; i++) seenEdges.push(0);
  var S = {};
  for (i = 0; i < ears.length; i++) {
    var ear = ears[i], ids = ear.edges, walk = [ear.from], cur = ear.from;
    for (k = 0; k < ids.length; k++) {
      if (seenEdges[ids[k]]) problems.push('edge ' + ids[k] + ' used twice');
      seenEdges[ids[k]] = 1;
      if (edges[ids[k]][0] !== cur && edges[ids[k]][1] !== cur) {
        problems.push('ear ' + (i + 1) + ' is not a walk at edge ' + ids[k]);
      }
      cur = otherEnd(edges, ids[k], cur);
      walk.push(cur);
    }
    var inner = walk.slice(1, walk.length - 1), uniq = {};
    for (k = 0; k < inner.length; k++) {
      if (uniq[inner[k]]) problems.push('ear ' + (i + 1) + ' repeats station ' + inner[k]);
      uniq[inner[k]] = 1;
    }
    if (i === 0) {
      if (walk[0] !== walk[walk.length - 1]) problems.push('ear 1 is not closed');
      if (uniq[walk[0]]) problems.push('ear 1 repeats its start');
    } else {
      if (!S[walk[0]] || !S[walk[walk.length - 1]]) {
        problems.push('ear ' + (i + 1) + ' has an end outside the earlier ears');
      }
      for (k = 0; k < inner.length; k++) {
        if (S[inner[k]]) problems.push('ear ' + (i + 1) + ' has an inside station already built');
      }
    }
    for (k = 0; k < walk.length; k++) S[walk[k]] = 1;
  }
  for (i = 0; i < edges.length; i++) if (!seenEdges[i]) problems.push('edge ' + i + ' is in no ear');
  return problems;
}

/* ---------- the two orientations ---------- */

function dfsOrientationDetailed(n, edges) {
  var a = adj(n, edges), state = [], parentE = [], arcs = [], tree = [], done = [], i;
  for (i = 0; i < n; i++) { state.push(0); parentE.push(-1); }
  for (i = 0; i < edges.length; i++) { done.push(false); tree.push(false); }
  function dfs(u) {
    state[u] = 1;
    for (var k = 0; k < a[u].length; k++) {
      var v = a[u][k].to, id = a[u][k].id;
      if (done[id]) continue;
      arcs.push([u, v]); done[id] = true;
      if (state[v] === 0) { tree[id] = true; parentE[v] = id; dfs(v); }
    }
    state[u] = 2;
  }
  for (var s = 0; s < n; s++) if (state[s] === 0) dfs(s);
  return { arcs: arcs, tree: tree };
}

function dfsOrientation(n, edges) { return dfsOrientationDetailed(n, edges).arcs; }

function discoveryOrderOrientation(n, edges) {
  var a = adj(n, edges), disc = [], i, time = 0;
  for (i = 0; i < n; i++) disc.push(-1);
  function dfs(u) {
    disc[u] = time++;
    for (var k = 0; k < a[u].length; k++) if (disc[a[u][k].to] < 0) dfs(a[u][k].to);
  }
  for (i = 0; i < n; i++) if (disc[i] < 0) dfs(i);
  return edges.map(function (e) {
    return disc[e[0]] < disc[e[1]] ? [e[0], e[1]] : [e[1], e[0]];
  });
}

function orientByEars(n, edges, ears) {
  var arcs = [];
  ears.forEach(function (ear) {
    var ids = ear.edges, cur = ear.from;
    ids.forEach(function (id) {
      var nxt = otherEnd(edges, id, cur);
      arcs.push([cur, nxt]);
      cur = nxt;
    });
  });
  return arcs;
}

/* ---------- the maps the lesson draws ---------- */

var NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/* unit coordinates; a scene maps them into whatever box it has */
var W_UNIT = [
  [0.200, 0.500],   /* A */
  [0.420, 0.120],   /* B */
  [0.640, 0.500],   /* C */
  [0.420, 0.880],   /* D */
  [0.020, 0.180],   /* E */
  [0.020, 0.820],   /* F */
  [0.950, 0.120],   /* G */
  [0.950, 0.880]    /* H */
];
var W_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 0],   /* ear 1: A-B-C-D-A */
  [1, 4], [4, 5], [5, 3],           /* ear 2: B-E-F-D   */
  [2, 6], [6, 7], [7, 3],           /* ear 3: C-G-H-D   */
  [2, 7]                            /* ear 4: C-H       */
];
var WN = 8;

var BOWTIE = {
  n: 5,
  names: ['v', 'a', 'b', 'c', 'd'],
  unit: [[0.500, 0.500], [0.230, 0.130], [0.230, 0.870], [0.770, 0.130], [0.770, 0.870]],
  edges: [[0, 1], [1, 2], [2, 0], [0, 3], [3, 4], [4, 0]]
};

var BRIDGED = {
  n: 6,
  names: ['p', 'q', 'r', 's', 't', 'u'],
  unit: [[0.040, 0.120], [0.040, 0.880], [0.330, 0.500], [0.670, 0.500], [0.960, 0.120], [0.960, 0.880]],
  edges: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 3]]
};

var K4 = {
  n: 4,
  names: ['0', '1', '2', '3'],
  unit: [[0.500, 0.060], [0.080, 0.900], [0.920, 0.900], [0.500, 0.520]],
  edges: [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]
};

/* ---------- computed structures ---------- */

var W_EARS = earDecomposition(WN, W_EDGES);
var W_RANK = circuitRank(WN, W_EDGES);
var W_DFS_DETAIL = dfsOrientationDetailed(WN, W_EDGES);
var W_DFS = W_DFS_DETAIL.arcs;
var W_DFS_TREE = W_DFS_DETAIL.tree;
var W_NAIVE = discoveryOrderOrientation(WN, W_EDGES);
var W_EAR_ORIENT = orientByEars(WN, W_EDGES, W_EARS);
var BOW_EARS = earDecomposition(BOWTIE.n, BOWTIE.edges);
var BOW_DFS = dfsOrientation(BOWTIE.n, BOWTIE.edges);
var BR_EARS = earDecomposition(BRIDGED.n, BRIDGED.edges);

/* which ear owns each edge of the worked map */
var W_EDGE_EAR = [];
W_EARS.forEach(function (ear, idx) {
  ear.edges.forEach(function (id) { W_EDGE_EAR[id] = idx; });
});
/* which vertices are built after ear k (1-based count) */
var W_BUILT_AFTER = [];
(function () {
  var S = {}, k;
  for (k = 0; k < W_EARS.length; k++) {
    W_EARS[k].edges.forEach(function (id) {
      S[W_EDGES[id][0]] = 1; S[W_EDGES[id][1]] = 1;
    });
    W_BUILT_AFTER.push(Object.keys(S).map(Number));
  }
})();

/* the strong-orientation counts the boundaries scene quotes */
var K4_STRONG = countStrongOrientations(4, K4.edges);
var K4_TOTAL = Math.pow(2, K4.edges.length);
var W_STRONG = countStrongOrientations(WN, W_EDGES);

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

function buildAllGraphs(n) {
  var all = [], m = n * (n - 1) / 2, pairs = [], i, j;
  for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) pairs.push([i, j]);
  for (var mask = 0; mask < (1 << m); mask++) {
    var edges = [];
    for (i = 0; i < m; i++) if ((mask >> i) & 1) edges.push(pairs[i]);
    all.push(edges);
  }
  return all;
}

var FAMILY = { g4: [], g5: [], twoEC: 0, twoVC: 0, earOk: 0 };

function runChecks() {
  /* --- the worked map --- */
  var probs = W_EARS ? validateEars(WN, W_EDGES, W_EARS) : ['no decomposition'];
  chk('worked map: four ears, one per unit of circuit rank',
      W_EARS && W_EARS.length === 4 && W_RANK === 4,
      (W_EARS ? W_EARS.length : 0) + ' ears, rank ' + W_RANK);
  chk('worked map: the decomposition satisfies all four clauses',
      probs.length === 0, probs.join('; '));
  chk('worked map: connected and bridgeless',
      isConnected(WN, W_EDGES) && isBridgeless(WN, W_EDGES));
  chk('worked map: the search orientation is strongly connected',
      arcsStrong(WN, W_DFS));
  chk('worked map: the discovery-order orientation is not strongly connected',
      !arcsStrong(WN, W_NAIVE));
  chk('worked map: the ear orientation is strongly connected',
      arcsStrong(WN, W_EAR_ORIENT));
  chk('worked map: it is 2-vertex-connected, so an open decomposition also exists',
      isTwoVertexConnected(WN, W_EDGES));
  chk('worked map: 54 of its 2048 orientations are strong',
      W_STRONG === 54, String(W_STRONG));

  /* --- the bowtie --- */
  chk('bowtie: connected and bridgeless',
      isConnected(BOWTIE.n, BOWTIE.edges) && isBridgeless(BOWTIE.n, BOWTIE.edges));
  chk('bowtie: two ears, and the second one is closed',
      BOW_EARS && BOW_EARS.length === 2 && BOW_EARS[1].from === BOW_EARS[1].to,
      BOW_EARS ? JSON.stringify(BOW_EARS.map(function (e) { return [e.from, e.to]; })) : 'none');
  chk('bowtie: its decomposition satisfies the definition',
      BOW_EARS && validateEars(BOWTIE.n, BOWTIE.edges, BOW_EARS).length === 0);
  chk('bowtie: it has a cut station, so it is not 2-vertex-connected',
      !isTwoVertexConnected(BOWTIE.n, BOWTIE.edges));
  chk('bowtie: it does have a strong orientation',
      hasStrongOrientation(BOWTIE.n, BOWTIE.edges) === true);

  /* --- the map with a bridge --- */
  chk('bridged map: exactly one bridge',
      BRIDGED.edges.filter(function (e, i) { return isBridge(BRIDGED.n, BRIDGED.edges, i); }).length === 1);
  chk('bridged map: no strong orientation exists',
      hasStrongOrientation(BRIDGED.n, BRIDGED.edges) === false);
  chk('bridged map: the ear construction cannot cover its edges',
      BR_EARS === null);

  /* --- exhaustive: every map on 4 stations --- */
  var g4 = buildAllGraphs(4), agree4 = 0, earFail4 = 0, dfsFail4 = 0, naive4 = 0, ec4 = 0, vc4 = 0;
  g4.forEach(function (edges) {
    var n = 4, conn = isConnected(n, edges), bl = isBridgeless(n, edges);
    var strong = hasStrongOrientation(n, edges);
    if ((conn && bl) === strong) agree4++;
    if (conn && bl) {
      ec4++;
      if (isTwoVertexConnected(n, edges)) vc4++;
      var e2 = earDecomposition(n, edges);
      if (!e2 || validateEars(n, edges, e2).length || e2.length !== circuitRank(n, edges)) earFail4++;
      if (!arcsStrong(n, dfsOrientation(n, edges))) dfsFail4++;
    }
    if (edges.length > 0 && arcsStrong(n, discoveryOrderOrientation(n, edges))) naive4++;
  });
  chk('all 64 maps on 4 stations: strong orientation exists exactly when connected and bridgeless',
      agree4 === 64, agree4 + ' of 64');
  chk('all 10 bridgeless connected maps on 4 stations: a valid decomposition with rank many ears',
      ec4 === 10 && earFail4 === 0, ec4 + ' maps, ' + earFail4 + ' failures');
  chk('all of them: the search orientation is strong',
      dfsFail4 === 0, dfsFail4 + ' failures');
  chk('no map on 4 stations has a strong discovery-order orientation',
      naive4 === 0, naive4 + ' exceptions');
  chk('on 4 stations bridgeless and 2-vertex-connected coincide (10 and 10)',
      ec4 === 10 && vc4 === 10, ec4 + ' and ' + vc4);

  /* --- exhaustive: every map on 5 stations with at most 6 streets --- */
  var g5 = buildAllGraphs(5).filter(function (e) { return e.length <= 6; });
  var agree5 = 0, earFail5 = 0, dfsFail5 = 0, ec5 = 0, vc5 = 0, earOrient5 = 0, rank5 = 0;
  g5.forEach(function (edges) {
    var n = 5, conn = isConnected(n, edges), bl = isBridgeless(n, edges);
    var strong = hasStrongOrientation(n, edges);
    if ((conn && bl) === strong) agree5++;
    if (conn && bl) {
      ec5++;
      if (isTwoVertexConnected(n, edges)) vc5++;
      var e3 = earDecomposition(n, edges);
      if (!e3 || validateEars(n, edges, e3).length) earFail5++;
      else {
        if (e3.length !== circuitRank(n, edges)) rank5++;
        if (!arcsStrong(n, orientByEars(n, edges, e3))) earOrient5++;
      }
      if (!arcsStrong(n, dfsOrientation(n, edges))) dfsFail5++;
    }
  });
  FAMILY.g5 = g5; FAMILY.twoEC = ec5; FAMILY.twoVC = vc5;
  chk('all 848 maps on 5 stations with at most 6 streets: Robbins holds on every one',
      agree5 === g5.length, agree5 + ' of ' + g5.length);
  chk('all 97 bridgeless connected ones: a valid decomposition',
      ec5 === 97 && earFail5 === 0, ec5 + ' maps, ' + earFail5 + ' failures');
  chk('all of them: exactly rank many ears',
      rank5 === 0, rank5 + ' failures');
  chk('all of them: orienting each ear gives a strong orientation',
      earOrient5 === 0, earOrient5 + ' failures');
  chk('all of them: the search orientation is strong',
      dfsFail5 === 0, dfsFail5 + ' failures');
  chk('on 5 stations bridgeless is strictly weaker than 2-vertex-connected (97 and 90)',
      ec5 === 97 && vc5 < ec5, ec5 + ' and ' + vc5);

  /* --- the counts the boundaries scene quotes --- */
  chk('complete graph on 4 stations: 24 of 64 orientations are strong',
      K4_STRONG === 24 && K4_TOTAL === 64, K4_STRONG + ' of ' + K4_TOTAL);
}

runChecks();

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

var R = 16;

function box(x, y, w, h) { return { x: x, y: y, w: w, h: h }; }

function at(b, u) { return [b.x + u[0] * b.w, b.y + u[1] * b.h]; }

function heading(P2, s) {
  P2.text(26, 20, s, { size: 12.5, mono: true, color: PAL.dim });
}

function note(P2, x, y, s, col, size) {
  P2.text(x, y, s, { size: size || 13, color: col || PAL.dim });
}

/* one graph, drawn from unit coordinates, with per-edge and per-node styling */
function drawGraph(P2, b, g, o) {
  o = o || {};
  var i;
  var pos = g.unit.map(function (u) { return at(b, u); });

  for (i = 0; i < g.edges.length; i++) {
    var e = g.edges[i], s = o.edge ? (o.edge(i, e) || {}) : {};
    if (s.hide) continue;
    var a1 = pos[e[0]], a2 = pos[e[1]];
    var dx = a2[0] - a1[0], dy = a2[1] - a1[1], L = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / L, uy = dy / L, pad = s.pad === undefined ? R + 2 : s.pad;
    var x1 = a1[0] + ux * pad, y1 = a1[1] + uy * pad;
    var x2 = a2[0] - ux * pad, y2 = a2[1] - uy * pad;
    if (s.arrow) {
      P2.arrow(x1, y1, x2, y2, { stroke: s.color || PAL.border, sw: s.sw || 2, head: 9, dash: s.dash });
    } else {
      P2.line(x1, y1, x2, y2, { stroke: s.color || PAL.border, sw: s.sw || 2, dash: s.dash });
    }
  }

  for (i = 0; i < g.n; i++) {
    var s2 = o.node ? (o.node(i) || {}) : {};
    var p = pos[i];
    P2.circle(p[0], p[1], s2.r || R, {
      fill: s2.fill || PAL.surface,
      stroke: s2.stroke || PAL.ink,
      sw: s2.sw || 2
    });
    if (s2.ring) P2.circle(p[0], p[1], (s2.r || R) + 5, { stroke: s2.ring, sw: 2.5 });
    P2.text(p[0], p[1], g.names ? g.names[i] : NAMES[i], {
      size: s2.size || 14, mono: true, bold: true,
      align: 'center', base: 'middle',
      color: s2.color || PAL.ink
    });
  }
  return pos;
}

function legend(P2, items, y) {
  var x = 26;
  items.forEach(function (it) {
    P2.rect(x, y - 5, 11, 11, { fill: it.fill, stroke: it.stroke || PAL.border, radius: 2 });
    P2.text(x + 16, y + 1, it.label, { size: 12, color: PAL.dim });
    x += 18 + it.label.length * 6.4;
  });
}

function panelBox(P2, x, y, w, h, title) {
  P2.rect(x, y, w, h, { fill: PAL.surface2, stroke: PAL.border, radius: 8 });
  if (title) P2.text(x + 12, y + 10, title, { size: 12, mono: true, color: PAL.dim });
}

var W_BOX_FULL = box(110, 90, 580, 285);

/* ---------- scene 1: the question ---------- */
function drawQuestion(t, sc) {
  var p = (t - sc.start) / (sc.end - sc.start);
  var step = Math.min(3, Math.floor(p * 4));

  heading(P, step === 1 ? 'the lazy orientation: every street points downhill from A'
                        : 'eight stations, eleven two-way streets');
  legend(P, [{ label: 'street', stroke: PAL.border, fill: PAL.surface },
             { label: 'built / reachable', fill: PAL.accentDim, stroke: PAL.accent },
             { label: 'stranded', fill: PAL.invalidDim, stroke: PAL.invalid }], 452);

  var reach = null, arcs = null, back = null;
  if (step === 1) { arcs = W_NAIVE; back = reachableTo(WN, arcs, 0); reach = reachableFrom(WN, arcs, 0); }
  if (step === 3) { arcs = W_DFS; back = reachableTo(WN, arcs, 0); reach = reachableFrom(WN, arcs, 0); }

  var dirOf = {};
  if (arcs) {
    arcs.forEach(function (a) {
      for (var k = 0; k < W_EDGES.length; k++) {
        var e = W_EDGES[k];
        if ((e[0] === a[0] && e[1] === a[1]) || (e[0] === a[1] && e[1] === a[0])) dirOf[k] = a;
      }
    });
  }

  drawGraph(P, W_BOX_FULL, { n: WN, unit: W_UNIT, edges: W_EDGES }, {
    edge: function (i, e) {
      if (!arcs) return { color: PAL.border, sw: 2.5 };
      var a = dirOf[i];
      var fwd = a && a[0] === e[0];
      return { arrow: true, color: step === 1 ? PAL.invalid : PAL.accent, sw: 2.5, pad: R + 3 };
    },
    node: function (i) {
      if (!back) return { fill: PAL.surface, stroke: PAL.ink };
      var ok = back[i];
      return { fill: ok ? PAL.accentDim : PAL.invalidDim, stroke: ok ? PAL.accent : PAL.invalid };
    }
  });

  if (step === 1) {
    var backCount = Object.keys(back).length;
    note(P, 26, 410, 'A reaches all 8, but only ' + backCount + ' of 8 can get back to A: not strong', PAL.invalid);
  } else if (step === 3) {
    note(P, 26, 410, 'all 8 reach all 8: this orientation is strong', PAL.valid);
  } else if (step === 2) {
    note(P, 26, 410, 'the question is existential: some orientation, not this one', PAL.dim);
  }
}

/* ---------- scene 2: the bridge ---------- */
function drawBridge(t, sc) {
  var p = (t - sc.start) / (sc.end - sc.start);
  var step = Math.min(3, Math.floor(p * 4));
  var b = box(150, 110, 600, 250);

  heading(P, step === 0 ? 'one street is the only way across' : 'the bridge, pointed left to right');
  legend(P, [{ label: 'the bridge', stroke: PAL.warn, fill: PAL.warnDim },
             { label: 'cut off from the left side', fill: PAL.invalidDim, stroke: PAL.invalid }], 452);

  var pos = null;
  drawGraph(P, b, BRIDGED, {
    edge: function (i) {
      if (i === 3) {
        if (step === 0) return { color: PAL.warn, sw: 5 };
        return { arrow: true, color: PAL.warn, sw: 4.5, pad: R + 3 };
      }
      return { color: step >= 1 ? PAL.faint : PAL.border, sw: 2 };
    },
    node: function (i) {
      if (step >= 1 && i >= 3) return { fill: PAL.invalidDim, stroke: PAL.invalid };
      return { fill: PAL.surface, stroke: PAL.ink };
    }
  });
  pos = BRIDGED.unit.map(function (u) { return at(b, u); });

  if (step === 0) {
    note(P, (pos[2][0] + pos[3][0]) / 2 - 30, (pos[2][1] + pos[3][1]) / 2 - 26, 'bridge', PAL.warn, 13);
    note(P, 26, 410, 'delete it and the map becomes two maps', PAL.dim);
  } else {
    note(P, 26, 410, 'no route leaves the right triangle: every way out is the bridge', PAL.invalid);
  }
  if (step === 3) {
    panelBox(P, 26, 60, 300, 46);
    P.text(38, 70, 'so: no strong orientation at all', { size: 13, color: PAL.invalid, bold: true });
    P.text(38, 88, 'one bridge settles the question with a no', { size: 12, color: PAL.dim });
  }
}

/* ---------- scene 3: the ear ---------- */
function drawEar(t, sc) {
  var p = (t - sc.start) / (sc.end - sc.start);
  var step = Math.min(3, Math.floor(p * 4));

  heading(P, ['a cycle to start from', 'an ear: both ends built, inside new',
              'an ear may be one edge; or closed', 'no edge twice, no old ground inside'][step]);
  legend(P, [{ label: 'ear 1', stroke: PAL.accent, fill: PAL.accentDim },
             { label: 'ear 2', stroke: PAL.info, fill: PAL.surface2 },
             { label: 'later ears', stroke: PAL.warn, fill: PAL.warnDim }], 452);

  var earOf = function (i) { return W_EDGE_EAR[i]; };
  var hl = [0, 1, 3, 1][step];

  drawGraph(P, W_BOX_FULL, { n: WN, unit: W_UNIT, edges: W_EDGES }, {
    edge: function (i) {
      var e = earOf(i);
      if (e === 0) return { color: PAL.accent, sw: 4 };
      if (e === 1) return { color: step === 0 ? PAL.faint : PAL.info, sw: step === 0 ? 2 : 4 };
      if (step >= 2) return { color: PAL.warn, sw: 3 };
      return { color: PAL.faint, sw: 2 };
    },
    node: function (i) {
      if (step === 0 && W_BUILT_AFTER[0].indexOf(i) >= 0) return { fill: PAL.accentDim, stroke: PAL.accent };
      if (step === 1 && (i === 4 || i === 5)) return { fill: PAL.surface2, stroke: PAL.info, ring: PAL.info };
      if (step === 1 && (i === 1 || i === 3)) return { fill: PAL.accentDim, stroke: PAL.accent, ring: PAL.accent };
      return { fill: PAL.surface, stroke: PAL.ink };
    }
  });

  if (step === 1) {
    note(P, 146, 136, 'new', PAL.info, 12);
    note(P, 146, 318, 'new', PAL.info, 12);
  }
  if (step === 2) {
    /* an inset: a closed ear, which starts and ends at the same station */
    var ib = box(700, 300, 170, 120);
    panelBox(P, ib.x - 10, ib.y - 34, 190, 150, 'closed ear');
    drawGraph(P, ib, { n: 3, names: ['c', 'g', 'h'], unit: [[0.10, 0.15], [0.90, 0.15], [0.50, 0.95]],
                       edges: [[0, 1], [1, 2], [2, 0]] }, {
      edge: function () { return { arrow: true, color: PAL.warn, sw: 2.5, pad: 15 }; },
      node: function () { return { r: 14, fill: PAL.warnDim, stroke: PAL.warn, size: 12 }; }
    });
  }
}

/* ---------- scene 4: the definition ---------- */
var CLAUSES = [
  '1  the ears partition the edges',
  '2  ear one is a cycle',
  '3  every later ear has both ends',
  '   in the ears before it',
  '4  its inside stations are new'
];

function drawDefinition(t, sc) {
  var p = (t - sc.start) / (sc.end - sc.start);
  var step = Math.min(3, Math.floor(p * 4));

  heading(P, 'the four clauses, and where each one bites');
  var b = box(60, 110, 460, 250);

  drawGraph(P, b, { n: WN, unit: W_UNIT, edges: W_EDGES }, {
    edge: function (i) {
      var e = W_EDGE_EAR[i];
      if (step === 0) return { color: e === 0 ? PAL.accent : PAL.faint, sw: e === 0 ? 4 : 2 };
      if (step === 1) return { color: e === 0 ? PAL.accent : PAL.faint, sw: e === 0 ? 4 : 1.5 };
      return { color: e === 0 ? PAL.accent : PAL.info, sw: e === 0 ? 4 : 3 };
    },
    node: function (i) {
      var built = W_BUILT_AFTER[0].indexOf(i) >= 0;
      if (step >= 1 && built) return { r: 14, fill: PAL.accentDim, stroke: PAL.accent, size: 12 };
      return { r: 14, fill: PAL.surface, stroke: PAL.ink, size: 12 };
    }
  });

  var x = 560, y = 96;
  panelBox(P, x - 14, y - 20, 330, 300);
  CLAUSES.forEach(function (line, i) {
    var live = (i <= 1 && step === 0) || (i >= 2 && i <= 3 && step === 1) || (i >= 4 && step >= 2);
    P.text(x, y + i * 30, line, {
      size: 13.5, mono: false,
      color: live ? PAL.ink : PAL.faint,
      bold: live
    });
  });
  P.text(x, y + 165, step === 3 ? 'so far only a definition.' : 'reading the definition', { size: 12, color: PAL.dim });
  P.text(x, y + 188, step === 3 ? 'the theorem says who has one.' : 'clause by clause', { size: 12, color: PAL.dim });
  note(P, 26, 410, 'a closed ear is allowed: both ends may be the same station', PAL.dim);
}

/* ---------- scene 5: the build ---------- */
function drawBuild(t, sc) {
  var p = (t - sc.start) / (sc.end - sc.start);
  var step = Math.min(3, Math.floor(p * 4));
  var shown = step + 1;

  heading(P, 'ear ' + shown + ' of ' + W_EARS.length + '  ·  edges used ' +
             W_EARS.slice(0, shown).reduce(function (s, e) { return s + e.edges.length; }, 0) + ' of 11');
  legend(P, [{ label: 'ear 1', stroke: PAL.accent, fill: PAL.accentDim },
             { label: 'ear 2', stroke: PAL.info, fill: PAL.surface2 },
             { label: 'ear 3', stroke: PAL.warn, fill: PAL.warnDim },
             { label: 'ear 4', stroke: PAL.valid, fill: PAL.surface }], 452);

  var col = [PAL.accent, PAL.info, PAL.warn, PAL.valid];

  drawGraph(P, W_BOX_FULL, { n: WN, unit: W_UNIT, edges: W_EDGES }, {
    edge: function (i) {
      var e = W_EDGE_EAR[i];
      if (e < shown) return { color: col[e], sw: e === 0 ? 4 : 3.5 };
      return { color: PAL.faint, sw: 1.5, dash: [4, 4] };
    },
    node: function (i) {
      var built = W_BUILT_AFTER[shown - 1].indexOf(i) >= 0;
      return built
        ? { fill: PAL.accentDim, stroke: PAL.accent, ring: null }
        : { fill: PAL.surface, stroke: PAL.faint, color: PAL.dim };
    }
  });

  note(P, 26, 410, step === 3 ? 'eleven edges, four ears, no edge twice' : 'the walk returns to built ground', PAL.dim);
}

/* ---------- scene 6: why ---------- */
function drawWhy(t, sc) {
  var p = (t - sc.start) / (sc.end - sc.start);
  var step = Math.min(3, Math.floor(p * 4));

  heading(P, step === 3 ? 'with a bridge the same walk dies' : 'why the walk cannot stall');
  var lb = box(40, 120, 380, 240);
  var rb = box(500, 120, 380, 240);

  /* left: a new station outside the built part, with two unused edges */
  P.rect(lb.x - 16, lb.y - 30, lb.w + 32, lb.h + 84, { fill: PAL.surface2, stroke: PAL.border, radius: 8 });
  P.text(lb.x, lb.y - 18, 'bridgeless: every station has at least two streets', { size: 11.5, mono: true, color: PAL.dim });
  drawGraph(P, lb, { n: 3, names: ['b', 'w', 'b'], unit: [[0.06, 0.20], [0.55, 0.50], [0.06, 0.86]],
                     edges: [[0, 1], [1, 2]] }, {
    edge: function (i) { return { color: step === 0 ? PAL.faint : PAL.info, sw: 3, dash: i === 0 ? [5, 4] : null }; },
    node: function (i) {
      if (i === 1) return { fill: PAL.info === PAL.info ? PAL.surface2 : PAL.surface, stroke: PAL.info, ring: PAL.info };
      return { fill: PAL.accentDim, stroke: PAL.accent };
    }
  });
  note(P, lb.x + 8, lb.y + 238, step === 0 ? 'one unused street in' : 'arrive: one more unused street out', PAL.dim, 12);
  note(P, lb.x + 8, lb.y + 260, 'so the walk never stops here', PAL.valid, 12);

  /* right: the bridge, where the walk stops */
  P.rect(rb.x - 16, rb.y - 30, rb.w + 32, rb.h + 84, { fill: step === 3 ? PAL.invalidDim : PAL.surface2,
                                                        stroke: step === 3 ? PAL.invalid : PAL.border, radius: 8 });
  P.text(rb.x, rb.y - 18, 'a bridge: the far station has only one', { size: 11.5, mono: true, color: PAL.dim });
  drawGraph(P, rb, { n: 3, names: ['b', 'w', 'w'], unit: [[0.06, 0.20], [0.52, 0.50], [0.06, 0.86]],
                     edges: [[0, 1], [1, 2]] }, {
    edge: function (i) { return { color: PAL.warn, sw: i === 0 ? 4.5 : 2, dash: i === 0 ? null : [5, 4] }; },
    node: function (i) {
      if (i === 1) return { fill: PAL.warnDim, stroke: PAL.warn, ring: step === 3 ? PAL.invalid : null };
      return { fill: PAL.surface, stroke: PAL.ink };
    }
  });
  note(P, rb.x + 8, rb.y + 238, step === 3 ? 'arrive: no unused street out' : 'the walk reaches the far side', PAL.dim, 12);
  note(P, rb.x + 8, rb.y + 260, step === 3 ? 'and stops: the ear cannot close' : 'and finds a dead end', PAL.invalid, 12);
}

/* ---------- scene 7: the count ---------- */
function drawCount(t, sc) {
  var p = (t - sc.start) / (sc.end - sc.start);
  var step = Math.min(3, Math.floor(p * 4));

  heading(P, 'one ear with k edges brings k - 1 new stations, so the rank rises by one');

  var rows = [
    { name: 'this map', v: 8, e: 11, r: 4, ears: 4 },
    { name: 'the bowtie', v: 5, e: 6, r: 2, ears: 2 },
    { name: 'K4, four stations', v: 4, e: 6, r: 3, ears: 3 }
  ];

  var x0 = 120, y0 = 110, rh = 62;
  var cV = 360, cE = 440, cF = 480, cEars = 700;
  P.text(x0, y0 - 26, 'map', { size: 12, mono: true, color: PAL.dim });
  P.text(cV, y0 - 26, '|V|', { size: 12, mono: true, color: PAL.dim, align: 'right' });
  P.text(cE, y0 - 26, '|E|', { size: 12, mono: true, color: PAL.dim, align: 'right' });
  P.text(cF, y0 - 26, '|E| - |V| + 1', { size: 12, mono: true, color: PAL.dim });
  P.text(cEars, y0 - 26, 'ears', { size: 12, mono: true, color: PAL.dim, align: 'right' });

  rows.forEach(function (r, i) {
    var live = step >= (i === 0 ? 1 : 3);
    var y = y0 + i * rh;
    if (i === 0 && step >= 1) P.rect(x0 - 14, y - 16, 620, rh - 12, { fill: PAL.accentDim, stroke: PAL.accent, radius: 6 });
    P.text(x0, y, r.name, { size: 14, bold: true, color: live ? PAL.ink : PAL.faint });
    P.text(cV, y, String(r.v), { size: 14, mono: true, align: 'right', color: live ? PAL.ink : PAL.faint });
    P.text(cE, y, String(r.e), { size: 14, mono: true, align: 'right', color: live ? PAL.ink : PAL.faint });
    P.text(cF, y, r.e + ' - ' + r.v + ' + 1 = ' + r.r, { size: 14, mono: true, color: live ? PAL.accent : PAL.faint });
    P.text(cEars, y, String(r.ears), { size: 14, mono: true, align: 'right', color: live ? PAL.valid : PAL.faint });
  });

  note(P, 120, 330, 'the count is a property of the map, not of the construction:', PAL.dim);
  note(P, 120, 352, 'every decomposition of it has the same number of ears.', PAL.dim);
  if (step === 3) {
    panelBox(P, 120, 380, 520, 46);
    P.text(134, 390, 'so "how many ears?" is answered before any ear is found', { size: 13, color: PAL.accent, bold: true });
    P.text(134, 408, 'and a decomposition with a different count is simply wrong', { size: 12, color: PAL.dim });
  }
}

/* ---------- scene 8: orient ---------- */
function drawOrient(t, sc) {
  var p = (t - sc.start) / (sc.end - sc.start);
  var step = Math.min(3, Math.floor(p * 4));
  var b = box(110, 95, 580, 275);

  heading(P, step === 0 ? 'give every ear a direction'
            : step === 1 ? 'ear one becomes a directed cycle'
            : step === 2 ? 'every later ear becomes a directed path'
            : 'Robbins 1939: connected and bridgeless is exactly enough');

  var col = [PAL.accent, PAL.info, PAL.warn, PAL.valid];
  var arrowOf = {};
  W_EAR_ORIENT.forEach(function (a) {
    for (var k = 0; k < W_EDGES.length; k++) {
      var e = W_EDGES[k];
      if ((e[0] === a[0] && e[1] === a[1]) || (e[0] === a[1] && e[1] === a[0])) arrowOf[k] = a;
    }
  });

  drawGraph(P, b, { n: WN, unit: W_UNIT, edges: W_EDGES }, {
    edge: function (i) {
      var e = W_EDGE_EAR[i];
      var live = (step >= 1 && e === 0) || (step >= 2 && e > 0);
      if (!live) return { color: PAL.faint, sw: 1.5, dash: [4, 4] };
      return { arrow: true, color: col[e], sw: e === 0 ? 4 : 3.2, pad: R + 3 };
    },
    node: function (i) {
      return step === 3
        ? { fill: PAL.accentDim, stroke: PAL.accent, ring: PAL.valid }
        : { fill: PAL.surface, stroke: PAL.ink };
    }
  });

  note(P, 26, 410, step === 3
    ? 'all 8 stations reach all 8: the orientation built from the ears is strong'
    : 'ear one round, then each ear end to end', PAL.dim);
}

/* ---------- scene 9: the search ---------- */
function drawDfs(t, sc) {
  var p = (t - sc.start) / (sc.end - sc.start);
  var step = Math.min(3, Math.floor(p * 4));
  var b = step === 3 ? box(40, 105, 420, 265) : box(110, 95, 580, 275);

  heading(P, step === 3 ? 'the tempting variant, and why it fails'
                        : 'search tree edges out, the rest back up');

  var treeEdge = W_DFS_TREE;

  var arrowOf = {};
  W_DFS.forEach(function (a) {
    for (var k = 0; k < W_EDGES.length; k++) {
      var e = W_EDGES[k];
      if ((e[0] === a[0] && e[1] === a[1]) || (e[0] === a[1] && e[1] === a[0])) arrowOf[k] = a;
    }
  });

  drawGraph(P, b, { n: WN, unit: W_UNIT, edges: W_EDGES }, {
    edge: function (i) {
      if (step === 0) return { color: PAL.border, sw: 2.5 };
      return { arrow: true, color: treeEdge[i] ? PAL.accent : PAL.info, sw: treeEdge[i] ? 3.2 : 2.4, pad: R + 3 };
    },
    node: function (i) {
      if (step >= 2 && step < 3) return { fill: PAL.accentDim, stroke: PAL.accent, ring: PAL.valid };
      return { fill: PAL.surface, stroke: PAL.ink };
    }
  });

  legend(P, [{ label: 'search-tree edge, pointing away from the root', stroke: PAL.accent, fill: PAL.surface },
             { label: 'other edge, pointing back up', stroke: PAL.info, fill: PAL.surface }], 452);

  if (step === 3) {
    var nb = box(500, 110, 360, 250);
    P.rect(nb.x - 16, nb.y - 34, nb.w + 32, nb.h + 80, { fill: PAL.invalidDim, stroke: PAL.invalid, radius: 8 });
    P.text(nb.x, nb.y - 22, 'the same triangle, oriented downhill', { size: 11.5, mono: true, color: PAL.dim });
    var tri = { n: 3, names: ['a', 'b', 'c'], unit: [[0.5, 0.02], [0.05, 0.95], [0.95, 0.95]],
                edges: [[0, 1], [1, 2], [0, 2]] };
    var triArcs = discoveryOrderOrientation(3, tri.edges);
    var triDir = {};
    triArcs.forEach(function (a) {
      for (var k = 0; k < tri.edges.length; k++) {
        var e = tri.edges[k];
        if ((e[0] === a[0] && e[1] === a[1]) || (e[0] === a[1] && e[1] === a[0])) triDir[k] = a;
      }
    });
    drawGraph(P, nb, tri, {
      edge: function () { return { arrow: true, color: PAL.invalid, sw: 2.5, pad: 15 }; },
      node: function () { return { r: 15, fill: PAL.surface, stroke: PAL.invalid, size: 12 }; }
    });
    note(P, nb.x, nb.y + 190, 'no arrow points back to a: not strong', PAL.invalid, 12);
    note(P, nb.x, nb.y + 212, 'the order comes from the search, not from the rule above', PAL.dim, 12);
  }
}

/* ---------- scene 10: two questions ---------- */
function drawTwoQuestions(t, sc) {
  var p = (t - sc.start) / (sc.end - sc.start);
  var step = Math.min(3, Math.floor(p * 4));
  var b = box(150, 110, 380, 250);

  heading(P, ['bridgeless is a statement about edges', 'the bowtie has no bridge',
              'its second ear is closed', 'a cut station blocks an open decomposition'][step]);

  var earOf = {};
  BOW_EARS.forEach(function (ear, idx) { ear.edges.forEach(function (id) { earOf[id] = idx; }); });

  drawGraph(P, b, BOWTIE, {
    edge: function (i) {
      var e = earOf[i];
      if (step === 0) return { color: PAL.border, sw: 2.5 };
      if (step === 1) return { color: e === 0 ? PAL.accent : PAL.info, sw: 3.5 };
      return { color: e === 0 ? PAL.accent : PAL.warn, sw: 3.5 };
    },
    node: function (i) {
      if (step === 3 && i === 0) return { fill: PAL.invalidDim, stroke: PAL.invalid, ring: PAL.invalid };
      if (step >= 1) return { fill: i === 0 ? PAL.accentDim : PAL.surface2, stroke: i === 0 ? PAL.accent : PAL.info };
      return { fill: PAL.surface, stroke: PAL.ink };
    }
  });

  var x = 580;
  panelBox(P, x - 14, 96, 320, 270);
  P.text(x, 112, 'two measures, one map', { size: 13, bold: true, color: PAL.ink });
  P.text(x, 140, 'edges that must fail to split it: 2', { size: 12.5, color: PAL.dim });
  P.text(x, 162, 'stations that must fail: 1 (the shared one)', { size: 12.5, color: PAL.dim });
  P.text(x, 192, 'so bridgeless: yes', { size: 12.5, color: PAL.valid });
  P.text(x, 214, 'so 2-vertex-connected: no', { size: 12.5, color: PAL.invalid });
  P.text(x, 244, 'ear decomposition: 2 ears, the second', { size: 12.5, color: PAL.dim });
  P.text(x, 264, 'closed at the shared station', { size: 12.5, color: PAL.dim });
  P.text(x, 294, 'open ear decomposition: none', { size: 12.5, color: PAL.invalid });
  P.text(x, 322, 'strong orientation: 4 of 64', { size: 12.5, color: PAL.valid });

  note(P, 26, 410, 'Whitney 1932: an open ear decomposition exists exactly for the 2-vertex-connected maps', PAL.dim);
}

/* ---------- scene 11: boundaries ---------- */
function drawBoundaries(t, sc) {
  var p = (t - sc.start) / (sc.end - sc.start);
  var step = Math.min(3, Math.floor(p * 4));

  heading(P, ['disconnected: no direction can cross a missing street',
              'a tree: no cycle, so no first ear',
              'one station, no streets: in, vacuously',
              'the theorem promises an orientation, not only one'][step]);

  var cells = [
    { x: 40, y: 110, w: 190, h: 150, title: 'two pieces',
      g: { n: 4, names: ['0', '1', '2', '3'], unit: [[0.15, 0.30], [0.15, 0.75], [0.80, 0.30], [0.80, 0.75]],
           edges: [[0, 1], [2, 3]] },
      verdict: 'no', why: 'nothing crosses' },
    { x: 250, y: 110, w: 190, h: 150, title: 'a tree',
      g: { n: 4, names: ['0', '1', '2', '3'], unit: [[0.50, 0.10], [0.20, 0.55], [0.80, 0.55], [0.50, 0.95]],
           edges: [[0, 1], [0, 2], [1, 3]] },
      verdict: 'no', why: 'rank 0, no ear' },
    { x: 460, y: 110, w: 190, h: 150, title: 'one station',
      g: { n: 1, names: ['0'], unit: [[0.50, 0.50]], edges: [] },
      verdict: 'yes', why: 'nothing to reach' },
    { x: 670, y: 110, w: 190, h: 150, title: 'K4',
      g: K4, verdict: 'yes', why: '24 of 64 are strong' }
  ];

  cells.forEach(function (c, i) {
    var live = step === i;
    P.rect(c.x, c.y - 26, c.w, c.h + 78, {
      fill: live ? PAL.surface2 : PAL.surface,
      stroke: live ? PAL.accent : PAL.border,
      sw: live ? 2 : 1,
      radius: 8
    });
    P.text(c.x + 12, c.y - 16, c.title, { size: 12, mono: true, color: live ? PAL.accent : PAL.dim });
    drawGraph(P, box(c.x + 24, c.y + 6, c.w - 48, c.h - 20), c.g, {
      edge: function () { return { color: live ? PAL.ink : PAL.faint, sw: 2.2 }; },
      node: function () { return { r: 13, fill: PAL.surface, stroke: live ? PAL.ink : PAL.faint, size: 11 }; }
    });
    P.text(c.x + 12, c.y + c.h + 6, c.verdict === 'yes' ? 'strong orientation: yes' : 'strong orientation: no',
           { size: 11.5, color: c.verdict === 'yes' ? PAL.valid : PAL.invalid, bold: true });
    P.text(c.x + 12, c.y + c.h + 26, c.why, { size: 11.5, color: PAL.dim });
  });

  note(P, 40, 400, 'the empty map and the single station are the two cases a definition has to settle by convention', PAL.dim);
  note(P, 40, 424, 'this page settles them the standard way: one station with no streets counts as strongly orientable', PAL.dim);
}

/* ---------- scene 12: the procedure ---------- */
var STEPS = [
  '1  is the map connected?          no  ->  answer no',
  '2  find a bridge, by deletion     yes ->  answer no',
  '3  no bridge at all              ->  an orientation exists',
  '4  build it: tree edges out, the rest back up',
  '5  check it: walk from every station'
];

function drawProcedure(t, sc) {
  var p = (t - sc.start) / (sc.end - sc.start);
  var step = Math.min(3, Math.floor(p * 4));
  var live = [0, 1, 1, 3][step];

  heading(P, 'the procedure, on the worked map');

  var b = box(430, 110, 420, 250);
  drawGraph(P, b, { n: WN, unit: W_UNIT, edges: W_EDGES }, {
    edge: function () { return { color: step >= 3 ? PAL.accent : PAL.border, sw: step >= 3 ? 2.4 : 2 }; },
    node: function () { return { r: 13, fill: PAL.surface, stroke: PAL.ink, size: 11 }; }
  });

  STEPS.forEach(function (line, i) {
    var on = (step === 0 && i === 0) || (step === 1 && (i === 1 || i === 2)) ||
             (step === 2 && (i === 1 || i === 2)) || (step === 3 && (i === 3 || i === 4));
    P.text(26, 130 + i * 40, line, {
      size: 13, mono: true,
      color: on ? PAL.ink : PAL.faint,
      bold: on
    });
  });

  if (step === 1 || step === 2) {
    note(P, 26, 340, 'this map has no bridge: every edge lies on a cycle', PAL.valid);
  }
  if (step === 3) {
    note(P, 26, 340, 'the search orientation above: all 8 stations reach all 8', PAL.valid);
  }
}

var SCENE_DRAW = {
  question: drawQuestion,
  bridge: drawBridge,
  ear: drawEar,
  definition: drawDefinition,
  build: drawBuild,
  why: drawWhy,
  count: drawCount,
  orient: drawOrient,
  dfs: drawDfs,
  twoquestions: drawTwoQuestions,
  boundaries: drawBoundaries,
  procedure: drawProcedure
};

function drawFrame(P2) {
  P = P2;
  P.alpha(1);
  P.clear();
  P.rect(0, 0, W, H, { fill: PAL.surface });

  var t = (K && K.state) ? K.state.elapsed : 0;
  var scenes = (K && K.state && K.state.scenes && K.state.scenes.length)
    ? K.state.scenes
    : (window.LESSON_TIMELINE ? window.LESSON_TIMELINE.scenes : []);
  var i = 0;
  for (var k = scenes.length - 1; k >= 0; k--) {
    if (t >= scenes[k].start - 1e-6) { i = k; break; }
  }
  var sc = scenes[i];
  if (!sc) return;
  var fn = SCENE_DRAW[sc.id];
  if (!fn) return;
  try { fn(t, sc); } catch (err) { console.error('scene draw failed', sc.id, err); }
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

window.__MODEL = {
  W_EARS: W_EARS, W_RANK: W_RANK, W_DFS: W_DFS, W_NAIVE: W_NAIVE,
  W_EAR_ORIENT: W_EAR_ORIENT, BOW_EARS: BOW_EARS, BR_EARS: BR_EARS,
  K4_STRONG: K4_STRONG, W_STRONG: W_STRONG, CHECKS: CHECKS
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
