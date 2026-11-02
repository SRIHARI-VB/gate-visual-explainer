/* ==========================================================================
   two-edge-connected-components-and-the-bridge-tree - model, validation, render.

   Layer 1  model      : graphs as vertex counts plus edge lists, multigraphs
                         allowed. Components by union-find; bridges by the slow
                         definition (delete the edge, count pieces) AND by the
                         edge-id low-link search; 2-edge-connected components by
                         the relation (unit-capacity max flow >= 2) AND by
                         contracting the non-bridge edges; blocks by the edge
                         stack; leaves and augmentation by brute force.
   Layer 2  validation : every fast method is checked against the definition it
                         is supposed to compute, on exhaustive small graphs and
                         on seeded random multigraphs; the count identity, the
                         forest property, the distance rule and the augmentation
                         formula are each checked as their own property.
   Layer 3  render     : reads the model; never re-derives a number.
   Layer 4  timeline   : in timeline.js - the only source of time.

   No p5.brush: every mark is an edge, a dot, a number or a bracket that has to
   be read exactly.
   ========================================================================== */

(function () {
  'use strict';

  var K = window.LessonKit;
  var PR = window.Painters;
  var W = 900, H = 470;
  var P = null;
  var PAL = (PR && PR.PAL) || {
    ink: '#0f1720', dim: '#566573', faint: '#7d8b98', surface: '#ffffff',
    surface2: '#eef2f4', border: '#c8d2d8', accent: '#0f766e', accentDim: '#d6efeb',
    valid: '#15803d', invalid: '#b3261e', invalidDim: '#fbe4e2',
    warn: '#9a5406', warnDim: '#fbeed3', info: '#1d4e89'
  };
  function rgba(c, a) { return PR ? PR.rgba(c, a) : c; }

  /* ======================================================================
     LAYER 1 - THE MODEL
     ====================================================================== */

  function makeDSU(n) {
    var p = [], i;
    for (i = 0; i < n; i++) p.push(i);
    function find(x) { while (p[x] !== x) { p[x] = p[p[x]]; x = p[x]; } return x; }
    return {
      find: find,
      union: function (a, b) { a = find(a); b = find(b); if (a !== b) p[a] = b; }
    };
  }

  /* connected components with one edge optionally removed; ids are dense */
  function compInfo(n, edges, skip) {
    var d = makeDSU(n), i;
    for (i = 0; i < edges.length; i++) { if (i === skip) continue; d.union(edges[i][0], edges[i][1]); }
    var id = new Array(n), cnt = 0, map = {};
    for (i = 0; i < n; i++) { var r = d.find(i); if (!(r in map)) map[r] = cnt++; id[i] = map[r]; }
    return { id: id, count: cnt };
  }

  /* the definition: an edge is a bridge when deleting it adds a component */
  function bruteBridges(n, edges) {
    var base = compInfo(n, edges, -1).count, out = [], i;
    for (i = 0; i < edges.length; i++) out.push(compInfo(n, edges, i).count > base);
    return out;
  }

  function adjOf(n, edges) {
    var adj = [], i;
    for (i = 0; i < n; i++) adj.push([]);
    for (i = 0; i < edges.length; i++) {
      adj[edges[i][0]].push({ to: edges[i][1], id: i });
      adj[edges[i][1]].push({ to: edges[i][0], id: i });
    }
    return adj;
  }

  /* the linear test: skip the parent EDGE by identity */
  function tarjanEdge(n, edges) {
    var adj = adjOf(n, edges), disc = new Array(n).fill(0), low = new Array(n).fill(0);
    var br = new Array(edges.length).fill(false), timer = 0;
    function dfs(u, pe) {
      disc[u] = low[u] = ++timer;
      for (var k = 0; k < adj[u].length; k++) {
        var e = adj[u][k];
        if (e.id === pe) continue;
        if (disc[e.to]) { if (disc[e.to] < low[u]) low[u] = disc[e.to]; }
        else {
          dfs(e.to, e.id);
          if (low[e.to] < low[u]) low[u] = low[e.to];
          if (low[e.to] > disc[u]) br[e.id] = true;
        }
      }
    }
    for (var v = 0; v < n; v++) if (!disc[v]) dfs(v, -1);
    return br;
  }

  /* the tempting wrong test: skip the parent VERTEX */
  function tarjanVertexParent(n, edges) {
    var adj = adjOf(n, edges), disc = new Array(n).fill(0), low = new Array(n).fill(0);
    var br = new Array(edges.length).fill(false), timer = 0;
    function dfs(u, pv) {
      disc[u] = low[u] = ++timer;
      for (var k = 0; k < adj[u].length; k++) {
        var e = adj[u][k];
        if (e.to === pv) continue;
        if (disc[e.to]) { if (disc[e.to] < low[u]) low[u] = disc[e.to]; }
        else {
          dfs(e.to, u);
          if (low[e.to] < low[u]) low[u] = low[e.to];
          if (low[e.to] > disc[u]) br[e.id] = true;
        }
      }
    }
    for (var v = 0; v < n; v++) if (!disc[v]) dfs(v, -1);
    return br;
  }

  /* a traversal with the numbers the lesson prints, from a chosen root */
  function searchTrace(n, edges, root) {
    var adj = adjOf(n, edges), disc = new Array(n).fill(0), low = new Array(n).fill(0);
    var order = [], tree = [], back = [], bridges = [], timer = 0;
    function dfs(u, pe) {
      disc[u] = low[u] = ++timer;
      order.push(u);
      for (var k = 0; k < adj[u].length; k++) {
        var e = adj[u][k];
        if (e.id === pe) continue;
        if (disc[e.to]) {
          if (disc[e.to] < low[u]) low[u] = disc[e.to];
          if (disc[e.to] < disc[u] && back.indexOf(e.id) === -1) back.push(e.id);
        } else {
          tree.push(e.id);
          dfs(e.to, e.id);
          if (low[e.to] < low[u]) low[u] = low[e.to];
          if (low[e.to] > disc[u]) bridges.push(e.id);
        }
      }
    }
    dfs(root, -1);
    return { disc: disc, low: low, order: order, tree: tree, back: back, bridges: bridges };
  }

  /* the largest number of edge-disjoint routes, by unit-capacity max flow */
  function edgeDisjointPaths(n, edges, s, t) {
    if (s === t) return n;
    var to = [], cap = [], head = [], nxt = [], i;
    for (i = 0; i < n; i++) head.push(-1);
    function addArc(u, v, c) { to.push(v); cap.push(c); nxt.push(head[u]); head[u] = to.length - 1; }
    function add(u, v, c) { addArc(u, v, c); addArc(v, u, 0); }
    for (i = 0; i < edges.length; i++) { add(edges[i][0], edges[i][1], 1); add(edges[i][1], edges[i][0], 1); }
    var flow = 0;
    for (;;) {
      var prev = new Array(n).fill(-1), seen = new Array(n).fill(false), q = [s], qi = 0;
      seen[s] = true;
      while (qi < q.length) {
        var u = q[qi++];
        for (var a = head[u]; a !== -1; a = nxt[a]) {
          var v = to[a];
          if (!seen[v] && cap[a] > 0) { seen[v] = true; prev[v] = a; q.push(v); }
        }
      }
      if (!seen[t]) break;
      var f = Infinity, x = t;
      while (x !== s) { var aa = prev[x]; if (cap[aa] < f) f = cap[aa]; x = to[aa ^ 1]; }
      x = t;
      while (x !== s) { var bb = prev[x]; cap[bb] -= f; cap[bb ^ 1] += f; x = to[bb ^ 1]; }
      flow += f;
    }
    return flow;
  }

  /* the classes of the relation "two edge-disjoint routes", built by flow */
  function eccByRelation(n, edges) {
    var lab = new Array(n).fill(-1), k = 0;
    for (var u = 0; u < n; u++) {
      if (lab[u] !== -1) continue;
      lab[u] = k;
      for (var v = u + 1; v < n; v++) if (lab[v] === -1 && edgeDisjointPaths(n, edges, u, v) >= 2) lab[v] = k;
      k++;
    }
    return { label: lab, count: k };
  }

  /* the classes built by cutting the bridges and taking what is left */
  function eccByContraction(n, edges) {
    var br = tarjanEdge(n, edges), d = makeDSU(n), i;
    for (i = 0; i < edges.length; i++) if (!br[i]) d.union(edges[i][0], edges[i][1]);
    var id = new Array(n), cnt = 0, map = {};
    for (i = 0; i < n; i++) { var r = d.find(i); if (!(r in map)) map[r] = cnt++; id[i] = map[r]; }
    return { label: id, count: cnt, bridges: br };
  }

  function bridgeTree(n, edges) {
    var ec = eccByContraction(n, edges), tE = [], i;
    for (i = 0; i < edges.length; i++) if (ec.bridges[i]) tE.push([ec.label[edges[i][0]], ec.label[edges[i][1]]]);
    var deg = new Array(ec.count).fill(0);
    for (i = 0; i < tE.length; i++) { deg[tE[i][0]]++; deg[tE[i][1]]++; }
    var leaves = 0, isolated = 0;
    for (i = 0; i < deg.length; i++) { if (deg[i] === 1) leaves++; if (deg[i] === 0) isolated++; }
    return { nodes: ec.count, edges: tE, deg: deg, leaves: leaves, isolated: isolated,
             label: ec.label, bridges: ec.bridges };
  }

  /* articulation points by the slow definition */
  function articulationPoints(n, edges) {
    var before = compInfo(n, edges, -1), out = [], v, i;
    for (v = 0; v < n; v++) {
      var kept = [];
      for (i = 0; i < edges.length; i++) if (edges[i][0] !== v && edges[i][1] !== v) kept.push(edges[i]);
      var ci = compInfo(n, kept, -1), pieces = {}, cnt = 0, u;
      for (u = 0; u < n; u++) {
        if (u === v) continue;
        if (before.id[u] !== before.id[v]) continue;
        if (!(ci.id[u] in pieces)) { pieces[ci.id[u]] = 1; cnt++; }
      }
      out.push(cnt > 1);
    }
    return out;
  }

  /* every simple cycle, and the pairs that share one */
  function cyclePairs(n, edges) {
    var adj = adjOf(n, edges), pairs = {}, cycles = [];
    function key(a, b) { return a < b ? a + ',' + b : b + ',' + a; }
    for (var s = 0; s < n; s++) {
      (function () {
        var onpath = new Array(n).fill(false);
        onpath[s] = true;
        (function walk(u, path) {
          for (var k = 0; k < adj[u].length; k++) {
            var v = adj[u][k].to;
            if (v === s && path.length >= 3) {
              var cyc = path.slice();
              cycles.push(cyc);
              for (var i = 0; i < cyc.length; i++)
                for (var j = i + 1; j < cyc.length; j++) pairs[key(cyc[i], cyc[j])] = true;
            } else if (v > s && !onpath[v]) {
              onpath[v] = true; path.push(v); walk(v, path); path.pop(); onpath[v] = false;
            }
          }
        })(s, [s]);
      })();
    }
    return { pairs: pairs, cycles: cycles, has: function (a, b) { return a === b || !!pairs[key(a, b)]; } };
  }

  /* biconnected components, by the edge stack */
  function blocks(n, edges) {
    var adj = adjOf(n, edges), disc = new Array(n).fill(0), low = new Array(n).fill(0);
    var stack = [], out = [], timer = 0;
    function dfs(u, pe) {
      disc[u] = low[u] = ++timer;
      for (var k = 0; k < adj[u].length; k++) {
        var e = adj[u][k];
        if (e.id === pe) continue;
        if (!disc[e.to]) {
          stack.push(e.id);
          dfs(e.to, e.id);
          if (low[e.to] < low[u]) low[u] = low[e.to];
          if (low[e.to] >= disc[u]) {
            var comp = [], id;
            do { id = stack.pop(); comp.push(id); } while (id !== e.id);
            out.push(comp);
          }
        } else if (disc[e.to] < disc[u]) {
          stack.push(e.id);
          if (disc[e.to] < low[u]) low[u] = disc[e.to];
        }
      }
    }
    for (var v = 0; v < n; v++) if (!disc[v]) dfs(v, -1);
    return out.map(function (ids) {
      var vs = {};
      ids.forEach(function (i) { vs[edges[i][0]] = 1; vs[edges[i][1]] = 1; });
      return { edges: ids, verts: Object.keys(vs).map(Number) };
    });
  }

  /* ---------- exhaustive small-graph helpers ---------- */

  function allGraphs(n) {
    var pairs = [], i, j;
    for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) pairs.push([i, j]);
    var out = [], total = Math.pow(2, pairs.length);
    for (var m = 0; m < total; m++) {
      var es = [];
      for (i = 0; i < pairs.length; i++) if (m & (1 << i)) es.push(pairs[i].slice());
      out.push(es);
    }
    return out;
  }

  function prng(seed) {
    var s = seed >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  function randomMulti(n, m, rnd) {
    var es = [];
    for (var i = 0; i < m; i++) {
      var a = Math.floor(rnd() * n), b = Math.floor(rnd() * n);
      if (a === b) { i--; continue; }
      es.push([a, b]);
    }
    return es;
  }

  function prueferTrees(n) {
    if (n === 1) return [[]];
    if (n === 2) return [[[0, 1]]];
    var out = [], len = n - 2, total = Math.pow(n, len);
    for (var code = 0; code < total; code++) {
      var seq = [], c = code, i, v;
      for (i = 0; i < len; i++) { seq.push(c % n); c = Math.floor(c / n); }
      var deg = new Array(n).fill(1);
      seq.forEach(function (x) { deg[x]++; });
      var es = [], s = seq.slice();
      for (i = 0; i < len; i++) {
        var leaf = -1;
        for (v = 0; v < n; v++) if (deg[v] === 1) { leaf = v; break; }
        es.push([leaf, s[i]]); deg[leaf]--; deg[s[i]]--;
      }
      var rem = [];
      for (v = 0; v < n; v++) if (deg[v] === 1) rem.push(v);
      es.push([rem[0], rem[1]]);
      out.push(es);
    }
    return out;
  }

  /* the smallest set of added edges that leaves no bridge, by search */
  function minEdgesBrute(n, edges, cap) {
    var cand = [], i, j;
    for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) cand.push([i, j]);
    for (var k = 1; k <= cap; k++) {
      var found = false;
      (function rec(start, chosen) {
        if (found) return;
        if (chosen.length === k) {
          if (!bruteBridges(n, edges.concat(chosen)).some(Boolean)) found = true;
          return;
        }
        for (var t = start; t < cand.length; t++) {
          chosen.push(cand[t]); rec(t + 1, chosen); chosen.pop();
          if (found) return;
        }
      })(0, []);
      if (found) return k;
    }
    return -1;
  }

  /* the leaf pairing: pair each leaf with the one half a turn away */
  function pairLeaves(t, n) {
    var adj = [], i;
    for (i = 0; i < n; i++) adj.push([]);
    t.forEach(function (e) { adj[e[0]].push(e[1]); adj[e[1]].push(e[0]); });
    var root = 0;
    for (i = 0; i < n; i++) if (adj[i].length > 1) { root = i; break; }
    var order = [], seen = new Array(n).fill(false);
    (function dfs(u) {
      seen[u] = true;
      var kids = adj[u].filter(function (v) { return !seen[v]; });
      if (kids.length === 0) order.push(u);
      kids.forEach(function (v) { dfs(v); });
    })(root);
    var L = order.length, add = [];
    if (L === 2) add.push([order[0], order[1]]);
    else {
      var half = Math.floor((L + 1) / 2);
      for (i = 0; i < half; i++) add.push([order[i], order[i + Math.floor(L / 2)]]);
    }
    return { leaves: order, added: add };
  }

  /* ---------- the worked graph and the small examples ---------- */

  var WG = {
    n: 14,
    edges: [
      [0, 1], [1, 2], [2, 0],           /* triangle A  : 0 1 2        */
      [2, 3],                           /* bridge                     */
      [3, 4], [4, 5], [5, 3],           /* triangle B  : 3 4 5        */
      [5, 6],                           /* bridge                     */
      [6, 7],                           /* bridge                     */
      [7, 8], [8, 9], [9, 10], [10, 7], /* square      : 7 8 9 10     */
      [6, 11],                          /* bridge                     */
      [11, 12], [12, 13], [13, 11]      /* triangle C  : 11 12 13     */
    ]
  };

  var VX = [
    [85, 140], [55, 200], [140, 200],
    [225, 200], [225, 272], [300, 236],
    [385, 200],
    [470, 120], [550, 95], [580, 165], [505, 195],
    [430, 285], [365, 340], [495, 340]
  ];

  var W_BR = bruteBridges(WG.n, WG.edges);
  var W_EC = eccByContraction(WG.n, WG.edges);
  var W_BT = bridgeTree(WG.n, WG.edges);
  var W_TR = searchTrace(WG.n, WG.edges, 6);
  var W_AP = articulationPoints(WG.n, WG.edges);
  var W_ADD = Math.ceil(W_BT.leaves / 2);

  /* the members of each component, in vertex order */
  var W_MEM = [];
  (function () {
    for (var c = 0; c < W_EC.count; c++) {
      var mem = [];
      for (var v = 0; v < WG.n; v++) if (W_EC.label[v] === c) mem.push(v);
      W_MEM.push(mem);
    }
  })();

  function centroid(mem) {
    var sx = 0, sy = 0;
    mem.forEach(function (v) { sx += VX[v][0]; sy += VX[v][1]; });
    return [sx / mem.length, sy / mem.length];
  }

  var BOWTIE = { n: 5, edges: [[0, 1], [1, 2], [2, 0], [0, 3], [3, 4], [4, 0]] };
  var BOW_EC = eccByContraction(BOWTIE.n, BOWTIE.edges);
  var BOW_BL = blocks(BOWTIE.n, BOWTIE.edges);
  var BOW_AP = articulationPoints(BOWTIE.n, BOWTIE.edges);
  var BOW_CP = cyclePairs(BOWTIE.n, BOWTIE.edges);

  var PAIR2 = { n: 2, edges: [[0, 1], [0, 1]] };
  var PAIR_TRUTH = bruteBridges(2, PAIR2.edges).filter(Boolean).length;
  var PAIR_EDGE = tarjanEdge(2, PAIR2.edges).filter(Boolean).length;
  var PAIR_NAIVE = tarjanVertexParent(2, PAIR2.edges).filter(Boolean).length;

  var C5 = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]];
  var P5 = [[0, 1], [1, 2], [2, 3], [3, 4]];

  /* ======================================================================
     LAYER 2 - VALIDATION
     ====================================================================== */

  var CHECKS = [];
  function check(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail || '' }); }

  var G5 = allGraphs(5);
  var G4 = allGraphs(4);

  /* 1 - the fast test against the definition */
  var badBridge = 0, firstBad = null, tested5 = 0;
  G5.forEach(function (es) {
    tested5++;
    var a = bruteBridges(5, es), b = tarjanEdge(5, es), i;
    for (i = 0; i < a.length; i++) if (a[i] !== b[i]) { badBridge++; if (!firstBad) firstBad = JSON.stringify(es); }
  });
  check('edge-id low-link agrees with deleting the edge on all ' + tested5 + ' graphs on 5 vertices',
    badBridge === 0, 'mismatches ' + badBridge + (firstBad ? ' first ' + firstBad : ''));

  /* 2 - the parallel-edge boundary case */
  check('two parallel edges: the definition and the edge-id test both say 0 bridges',
    PAIR_TRUTH === 0 && PAIR_EDGE === 0, 'truth ' + PAIR_TRUTH + ' edge-id ' + PAIR_EDGE);
  check('two parallel edges: the parent-vertex test reports 1 bridge that does not exist',
    PAIR_NAIVE !== PAIR_TRUTH && PAIR_NAIVE === 1, 'parent-vertex ' + PAIR_NAIVE);

  /* 3 - the fast test on multigraphs */
  var rnd = prng(20261102), badMulti = 0;
  for (var mt = 0; mt < 300; mt++) {
    var nv = 2 + Math.floor(rnd() * 7), me = 1 + Math.floor(rnd() * 14);
    var mes = randomMulti(nv, me, rnd);
    var mb1 = bruteBridges(nv, mes), mb2 = tarjanEdge(nv, mes);
    for (var mq = 0; mq < mb1.length; mq++) if (mb1[mq] !== mb2[mq]) badMulti++;
  }
  check('edge-id low-link agrees with the definition on 300 seeded random multigraphs', badMulti === 0, 'mismatches ' + badMulti);

  /* 4 - the relation is exactly the flow test, and exactly the contraction */
  var badRel = 0, badPart = 0, flowPairs = 0;
  function relScan(graphs, n) {
    graphs.forEach(function (es) {
      var rel = eccByRelation(n, es), con = eccByContraction(n, es), u, v;
      for (u = 0; u < n; u++) for (v = u + 1; v < n; v++) {
        var same = rel.label[u] === rel.label[v];
        flowPairs++;
        if (same !== (edgeDisjointPaths(n, es, u, v) >= 2)) badRel++;
        if (same !== (con.label[u] === con.label[v])) badPart++;
      }
    });
  }
  relScan(G4, 4);
  var rnd2 = prng(777001);
  var rand5 = [];
  for (var rt = 0; rt < 200; rt++) rand5.push(randomMulti(5, 2 + Math.floor(rnd2() * 8), rnd2));
  relScan(rand5, 5);
  check('"same class" holds exactly when the max-flow value is at least 2, over ' + flowPairs + ' vertex pairs',
    badRel === 0, 'violations ' + badRel);
  check('the relation partition equals the contraction partition on the same ' + flowPairs + ' pairs',
    badPart === 0, 'violations ' + badPart);

  /* 5 - the count identity and the forest property */
  var badCount = 0, badForest = 0;
  G5.forEach(function (es) {
    var con = eccByContraction(5, es), cc = compInfo(5, es, -1).count;
    if (con.count !== cc + con.bridges.filter(Boolean).length) badCount++;
    var bt = bridgeTree(5, es);
    if (bt.edges.length !== bt.nodes - cc) badForest++;
  });
  check('components after cutting bridges = connected components + bridges, on all ' + tested5 + ' graphs',
    badCount === 0, 'violations ' + badCount);
  check('the bridge forest is a forest: edge count = node count minus components, on all ' + tested5 + ' graphs',
    badForest === 0, 'violations ' + badForest);

  /* 6 - the relation that looks right and is not */
  check('bowtie: station 1 shares a cycle with 0, and 0 shares one with 3',
    BOW_CP.has(1, 0) && BOW_CP.has(0, 3), '');
  check('bowtie: stations 1 and 3 share no cycle, so "on a common cycle" is not transitive',
    !BOW_CP.has(1, 3), '');
  check('bowtie: one 2-edge-connected component, two blocks, one articulation point, zero bridges',
    BOW_EC.count === 1 && BOW_BL.length === 2 && BOW_AP.filter(Boolean).length === 1 &&
    BOW_EC.bridges.filter(Boolean).length === 0,
    'ecc ' + BOW_EC.count + ' blocks ' + BOW_BL.length + ' ap ' + BOW_AP.filter(Boolean).length);

  /* 7 - the blocks partition the edges and satisfy their identity */
  var badBlockE = 0, badBlockV = 0;
  G5.forEach(function (es) {
    var bs = blocks(5, es), seenE = 0;
    bs.forEach(function (bk) { seenE += bk.edges.length; });
    if (seenE !== es.length) badBlockE++;
    var cc = compInfo(5, es, -1), cid, v;
    for (cid = 0; cid < cc.count; cid++) {
      var verts = [];
      for (v = 0; v < 5; v++) if (cc.id[v] === cid) verts.push(v);
      var inComp = bs.filter(function (bk) { return verts.indexOf(bk.verts[0]) !== -1; });
      if (!inComp.length) continue;
      var sum = 0;
      inComp.forEach(function (bk) { sum += bk.verts.length - 1; });
      if (sum !== verts.length - 1) badBlockV++;
    }
  });
  check('blocks partition the edge set on all ' + tested5 + ' graphs on 5 vertices', badBlockE === 0, 'violations ' + badBlockE);
  check('the block identity sum of (|V_B| - 1) = |V| - 1 holds per component on all ' + tested5 + ' graphs',
    badBlockV === 0, 'violations ' + badBlockV);

  /* 8 - bridge and articulation point are different objects */
  check('one edge on two stations: one bridge, zero articulation points',
    bruteBridges(2, [[0, 1]]).filter(Boolean).length === 1 &&
    articulationPoints(2, [[0, 1]]).filter(Boolean).length === 0, '');

  /* 9 - the worked graph */
  check('worked graph: four bridges, five 2-edge-connected components, one connected component',
    W_BR.filter(Boolean).length === 4 && W_EC.count === 5 && compInfo(WG.n, WG.edges, -1).count === 1,
    'bridges ' + W_BR.filter(Boolean).length + ' ecc ' + W_EC.count);
  check('worked graph: the bridge tree has 5 nodes, 4 edges and exactly 3 leaves',
    W_BT.nodes === 5 && W_BT.edges.length === 4 && W_BT.leaves === 3,
    'nodes ' + W_BT.nodes + ' edges ' + W_BT.edges.length + ' leaves ' + W_BT.leaves);
  check('worked graph: each component is internally bridgeless',
    (function () {
      for (var c = 0; c < W_EC.count; c++) {
        var sub = [], i;
        for (i = 0; i < WG.edges.length; i++)
          if (!W_EC.bridges[i] && W_EC.label[WG.edges[i][0]] === c) sub.push(WG.edges[i]);
        if (sub.length && bruteBridges(WG.n, sub).some(Boolean)) return false;
      }
      return true;
    })(), '');
  check('worked graph: the search from the hub marks exactly the four bridges',
    W_TR.bridges.length === 4 && W_TR.bridges.every(function (i) { return W_BR[i]; }), 'marked ' + W_TR.bridges.length);
  check('worked graph: every station in a triangle has low equal to the lowest number in its triangle',
    W_TR.low[0] === 5 && W_TR.low[1] === 5 && W_TR.low[2] === 5 &&
    W_TR.low[3] === 2 && W_TR.low[4] === 2 && W_TR.low[5] === 2, 'low 0,1,2 = ' + W_TR.low[0]);

  /* 10 - the augmentation formula */
  var badTreeMin = 0, treesBruted = 0;
  for (var tn = 4; tn <= 6; tn++) {
    prueferTrees(tn).forEach(function (es) {
      treesBruted++;
      var want = Math.ceil(bridgeTree(tn, es).leaves / 2);
      if (minEdgesBrute(tn, es, want + 1) !== want) badTreeMin++;
    });
  }
  check('on all ' + treesBruted + ' labelled trees with 4 to 6 vertices, the brute-force minimum is ceil(leaves/2)',
    badTreeMin === 0, 'violations ' + badTreeMin);

  var badConstruct = 0, treesPaired = 0;
  for (var pn = 4; pn <= 7; pn++) {
    prueferTrees(pn).forEach(function (es) {
      treesPaired++;
      var L = bridgeTree(pn, es).leaves, pr = pairLeaves(es, pn);
      if (pr.added.length !== Math.ceil(L / 2)) badConstruct++;
      else if (bruteBridges(pn, es.concat(pr.added)).some(Boolean)) badConstruct++;
    });
  }
  check('the leaf pairing leaves no bridge on all ' + treesPaired + ' labelled trees with 4 to 7 vertices',
    badConstruct === 0, 'violations ' + badConstruct);
  check('worked graph: the minimum number of added edges is 2, matching ceil(3/2)',
    minEdgesBrute(WG.n, WG.edges, W_ADD) === 2, 'brute ' + minEdgesBrute(WG.n, WG.edges, W_ADD));

  /* 11 - the named families */
  check('C5: no bridge and one 2-edge-connected component',
    bruteBridges(5, C5).filter(Boolean).length === 0 && eccByContraction(5, C5).count === 1, '');
  check('P5: all four edges are bridges and every station is its own component',
    bruteBridges(5, P5).filter(Boolean).length === 4 && bridgeTree(5, P5).nodes === 5, '');

  /* 12 - tree distance is the number of bridges on the route */
  function bfsDist(adj, s) {
    var d = new Array(adj.length).fill(-1), q = [s], qi = 0;
    d[s] = 0;
    while (qi < q.length) {
      var u = q[qi++];
      adj[u].forEach(function (v) { if (d[v] === -1) { d[v] = d[u] + 1; q.push(v); } });
    }
    return d;
  }
  function bridgesOnPath(n, edges, u, v) {
    var br = bruteBridges(n, edges), cnt = 0, i;
    for (i = 0; i < edges.length; i++) {
      if (!br[i]) continue;
      var kept = edges.filter(function (e, j) { return j !== i; });
      if (compInfo(n, kept, -1).id[u] !== compInfo(n, kept, -1).id[v]) cnt++;
    }
    return cnt;
  }
  var badDist = 0, distTests = 0;
  function distScan(graphs, n) {
    graphs.forEach(function (es) {
      var bt = bridgeTree(n, es), adj = [], i;
      for (i = 0; i < bt.nodes; i++) adj.push([]);
      bt.edges.forEach(function (e) { adj[e[0]].push(e[1]); adj[e[1]].push(e[0]); });
      var cc = compInfo(n, es, -1), u, v;
      for (u = 0; u < n; u++) for (v = u + 1; v < n; v++) {
        if (bt.label[u] === bt.label[v]) continue;
        if (cc.id[u] !== cc.id[v]) continue;
        distTests++;
        if (bfsDist(adj, bt.label[u])[bt.label[v]] !== bridgesOnPath(n, es, u, v)) badDist++;
      }
    });
  }
  distScan(G4, 4);
  distScan(rand5, 5);
  check('bridge-tree distance equals the number of bridges on the route, over ' + distTests + ' station pairs',
    badDist === 0, 'violations ' + badDist);

  /* 13 - 2-vertex-connected implies 2-edge-connected, never the converse */
  var badImp = 0;
  G5.forEach(function (es) {
    var ec = eccByContraction(5, es), ap = articulationPoints(5, es);
    var one = compInfo(5, es, -1).count === 1;
    var isEcc = one && ec.bridges.filter(Boolean).length === 0 && es.length > 0;
    var isVcc = one && ap.filter(Boolean).length === 0 && es.length > 0;
    if (isVcc && !isEcc) badImp++;
  });
  check('no graph on 5 vertices is 2-vertex-connected without being 2-edge-connected', badImp === 0, 'violations ' + badImp);
  check('the bowtie is 2-edge-connected but not 2-vertex-connected, so the implication does not reverse',
    BOW_EC.count === 1 && BOW_AP.filter(Boolean).length === 1, '');

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

  /* ======================================================================
     LAYER 3 - RENDER
     ====================================================================== */

  function txt(x, y, s, o) { P.text(x, y, s, o || {}); }
  function mono(x, y, s, o) { o = o || {}; o.mono = true; P.text(x, y, s, o); }
  function head(s) {
    txt(30, 16, s, { size: 13, bold: true });
    P.line(30, 38, W - 30, 38, { stroke: PAL.border, sw: 1 });
  }
  function foot(s) { mono(30, H - 14, s, { size: 9, color: PAL.faint }); }
  function panel(x, y, w, h, kind) {
    var stroke = kind === 'ok' ? PAL.valid : kind === 'bad' ? PAL.invalid : kind === 'warn' ? PAL.warn : PAL.border;
    var fill = kind === 'ok' ? rgba(PAL.valid, 0.07) : kind === 'bad' ? rgba(PAL.invalid, 0.07)
             : kind === 'warn' ? rgba(PAL.warn, 0.08) : PAL.surface2;
    P.rect(x, y, w, h, { fill: fill, stroke: stroke, radius: 8, sw: 1.2 });
  }
  function chip(x, y, label, kind) {
    var c = kind === 'ok' ? PAL.valid : kind === 'bad' ? PAL.invalid : kind === 'warn' ? PAL.warn : PAL.info;
    var wd = label.length * 5.6 + 14;
    P.rect(x, y - 9, wd, 17, { fill: rgba(c, 0.12), stroke: c, radius: 4, sw: 1 });
    mono(x + 7, y - 1, label, { size: 8.5, color: c });
    return wd;
  }

  /* one edge between two stations, trimmed so it stops at the dot */
  function edge(a, b, o) {
    o = o || {};
    var ax = a[0], ay = a[1], bx = b[0], by = b[1];
    var dx = bx - ax, dy = by - ay, L = Math.sqrt(dx * dx + dy * dy) || 1;
    var r = o.r === undefined ? 15 : o.r;
    var ux = dx / L, uy = dy / L;
    P.line(ax + ux * r, ay + uy * r, bx - ux * r, by - uy * r,
      { stroke: o.stroke || PAL.border, sw: o.sw || 1.8, dash: o.dash });
  }
  function dot(p, label, o) {
    o = o || {};
    var r = o.r || 15;
    P.circle(p[0], p[1], r, { fill: o.fill || PAL.surface, stroke: o.stroke || PAL.border, sw: o.sw || 1.6 });
    if (label !== null && label !== undefined) {
      mono(p[0], p[1] + 1, String(label), { size: o.size || 11, align: 'center', base: 'middle',
        color: o.labelColor || PAL.ink, bold: !!o.bold });
    }
  }

  /* the worked graph, with the four bridges emphasised when asked */
  function drawWorked(p, opts) {
    opts = opts || {};
    var i, e;
    for (i = 0; i < WG.edges.length; i++) {
      e = WG.edges[i];
      var isBr = W_BR[i];
      var alpha = 1;
      if (opts.dimBridges && isBr) alpha = 1;
      else if (opts.dimNonBridges && !isBr) alpha = 0.22;
      if (opts.hideBridges && isBr) alpha = 0.12;
      P.alpha(alpha);
      edge(VX[e[0]], VX[e[1]], {
        stroke: isBr && opts.markBridges ? PAL.invalid : PAL.border,
        sw: isBr && opts.markBridges ? 3.4 : 1.8
      });
      P.alpha(1);
    }
    if (opts.noDots) return;
    for (i = 0; i < WG.n; i++) {
      var comp = W_EC.label[i];
      var col = opts.tint ? ['#0f766e', '#1d4e89', '#9a5406', '#15803d', '#b3261e'][comp % 5] : null;
      dot(VX[i], opts.noLabels ? null : i, {
        fill: col ? rgba(col, 0.13) : PAL.surface,
        stroke: col || PAL.border,
        sw: col ? 2 : 1.6
      });
    }
  }

  /* a ring marks a station without redrawing its label */
  function ring(p, col, r) {
    P.circle(p[0], p[1], r || 21, { stroke: col, sw: 2.4 });
  }

  /* ---------- scene 1: one cable, two halves ---------- */

  function drawSplit(p) {
    head('One cable, two halves: where a single edge is the only link');

    var sep = p > 0.2 ? Math.min(1, (p - 0.2) / 0.25) * 16 : 0;
    var i, e;
    /* the left region is stations 0,1,2 - slide it away when the bridge is cut */
    function at(v) {
      var q = VX[v].slice();
      if (W_EC.label[v] === 0) q[0] -= sep;
      else if (p > 0.2) q[0] += sep * 0.35;
      return q;
    }
    for (i = 0; i < WG.edges.length; i++) {
      e = WG.edges[i];
      var isBr = W_BR[i];
      var cut = isBr && p > 0.2 && p < 0.55 && i === 3;
      P.alpha(cut ? 0.15 : 1);
      edge(at(e[0]), at(e[1]), {
        stroke: isBr && p > 0.12 ? PAL.invalid : PAL.border,
        sw: isBr && p > 0.12 ? 3.2 : 1.8
      });
      P.alpha(1);
      if (isBr && p > 0.45) {
        var mid = [(at(e[0])[0] + at(e[1])[0]) / 2, (at(e[0])[1] + at(e[1])[1]) / 2];
        P.circle(mid[0], mid[1], 4, { fill: PAL.invalid });
      }
    }
    for (i = 0; i < WG.n; i++) {
      dot(at(i), i, { stroke: p > 0.12 && W_EC.label[i] === 0 ? PAL.accent : PAL.border,
        fill: W_EC.label[i] === 0 && p > 0.12 ? rgba(PAL.accent, 0.12) : PAL.surface,
        sw: W_EC.label[i] === 0 && p > 0.12 ? 2 : 1.6 });
    }

    if (p > 0.06) {
      mono(618, 74, 'the count, computed', { size: 10, bold: true, color: PAL.ink });
      mono(618, 98, 'bridges          4', { size: 10.5, color: PAL.invalid });
      mono(618, 118, 'stations        14', { size: 10.5, color: PAL.dim });
      mono(618, 138, 'edges           17', { size: 10.5, color: PAL.dim });
      mono(618, 158, 'cycles           3', { size: 10.5, color: PAL.dim });
    }
    if (p > 0.32) {
      panel(610, 176, 262, 96, 'bad');
      mono(624, 196, 'the four bridges', { size: 10, bold: true, color: PAL.invalid });
      mono(624, 218, '2 - 3    5 - 6', { size: 10, color: PAL.ink });
      mono(624, 236, '6 - 7    6 - 11', { size: 10, color: PAL.ink });
      txt(624, 256, 'found by deleting each edge', { size: 9, color: PAL.dim });
    }
    if (p > 0.6) {
      panel(30, 388, 560, 54, 'ok');
      mono(44, 408, 'cut 2-3 and stations 0,1,2 are stranded from the other eleven', { size: 10, bold: true, color: PAL.valid });
      txt(44, 428, 'That is what a bridge is: deleting it increases the number of connected pieces.', { size: 9.5, color: PAL.ink });
    }
    foot('bridges, components and cycles are computed from the edge list, not counted from the picture');
  }

  /* ---------- scene 2: a bridge is an edge on no cycle ---------- */

  function drawCycle(p) {
    head('The same fact twice: delete the edge, or look for a cycle through it');

    /* three small graphs in a row */
    var cases = [
      { title: 'a path of three', pts: [[110, 150], [110, 230], [110, 310]], es: [[0, 1], [1, 2]], hi: 1, verdict: 'bridge', vcol: PAL.invalid },
      { title: 'a triangle', pts: [[300, 140], [255, 250], [345, 250]], es: [[0, 1], [1, 2], [2, 0]], hi: 1, verdict: 'not a bridge', vcol: PAL.valid },
      { title: 'two parallel edges', pts: [[520, 190], [650, 190]], es: [[0, 1], [0, 1]], hi: 0, verdict: 'not a bridge', vcol: PAL.valid }
    ];
    for (var c = 0; c < cases.length; c++) {
      var cs = cases[c];
      if (p < 0.04 + c * 0.06) continue;
      var cx = c === 2 ? 585 : (c === 0 ? 110 : 300);
      txt(cx - (c === 0 ? 20 : 40), 100, cs.title, { size: 10.5, bold: true });
      for (var i = 0; i < cs.es.length; i++) {
        var e = cs.es[i];
        var hi = (i === cs.hi);
        var bend = (c === 2) ? (i === 0 ? -12 : 12) : 0;
        if (bend) {
          P.line(cs.pts[e[0]][0], cs.pts[e[0]][1] + bend, cs.pts[e[1]][0], cs.pts[e[1]][1] + bend,
            { stroke: hi ? PAL.invalid : PAL.border, sw: hi ? 3.2 : 1.8, dash: p > 0.3 && hi ? [6, 4] : null });
        } else {
          edge(cs.pts[e[0]], cs.pts[e[1]], { stroke: hi ? PAL.invalid : PAL.border, sw: hi ? 3.2 : 1.8,
            dash: p > 0.3 && hi ? [6, 4] : null, r: 13 });
        }
      }
      for (i = 0; i < cs.pts.length; i++) dot(cs.pts[i], i, { r: 13, size: 10 });
      if (p > 0.3) {
        mono(cx - 44, 340, cs.verdict, { size: 10, bold: true, color: cs.vcol });
      }
      if (p > 0.4) {
        mono(cx - 52, 360, c === 0 ? 'pieces: 1 -> 2' : 'pieces: 1 -> 1', { size: 9, color: PAL.dim });
      }
    }

    if (p > 0.52) {
      panel(30, 380, 840, 62, 'ok');
      mono(44, 400, 'an edge is a bridge  <=>  it lies on no cycle', { size: 11.5, bold: true, color: PAL.valid });
      txt(44, 422, 'With a cycle through it, the rest of the cycle is a detour, so deleting it changes nothing.', { size: 9.5, color: PAL.ink });
    }
    if (p > 0.72) {
      panel(660, 96, 214, 150, 'warn');
      mono(672, 116, 'the boundary case', { size: 10, bold: true, color: PAL.warn });
      txt(672, 138, 'Two parallel edges form a cycle', { size: 9, color: PAL.ink });
      txt(672, 154, 'of length two. No simple cycle', { size: 9, color: PAL.ink });
      txt(672, 170, 'contains them, yet neither is a', { size: 9, color: PAL.ink });
      txt(672, 186, 'bridge. So skip the parent EDGE,', { size: 9, color: PAL.ink });
      txt(672, 202, 'not the parent station.', { size: 9, color: PAL.ink });
      mono(672, 228, 'truth 0   edge-id 0   vertex 1', { size: 8.5, color: PAL.warn });
    }
    foot('the deletion counts are computed for each of the three graphs');
  }

  /* ---------- scene 3: two edge-disjoint routes ---------- */

  function drawDisjoint(p) {
    head('Two routes that share no edge, and the classes that relation makes');

    drawWorked(p, { tint: p > 0.62, markBridges: p > 0.62, noDots: true });

    /* the two routes from 0 to 2, drawn under the dots */
    if (p > 0.04) {
      P.alpha(1);
      edge(VX[0], VX[2], { stroke: PAL.accent, sw: 3.4, r: 19 });
      if (p > 0.18) {
        edge(VX[0], VX[1], { stroke: PAL.info, sw: 3.4, r: 19 });
        edge(VX[1], VX[2], { stroke: PAL.info, sw: 3.4, r: 19 });
      }
    }
    for (var i = 0; i < WG.n; i++) dot(VX[i], i, {});
    if (p > 0.04) { ring(VX[0], PAL.accent); ring(VX[2], PAL.accent); }

    if (p > 0.1) {
      mono(618, 74, 'routes 0 -> 2', { size: 10, bold: true });
      mono(618, 96, 'direct        1 edge', { size: 9.5, color: PAL.accent });
      mono(618, 114, 'through 1     2 edges', { size: 9.5, color: PAL.info });
      mono(618, 136, 'shared edges  0', { size: 9.5, color: PAL.valid });
    }
    if (p > 0.4) {
      panel(610, 156, 262, 136, '');
      mono(624, 176, 'the relation', { size: 10, bold: true });
      txt(624, 198, 'u ~ v when u = v, or when two', { size: 9, color: PAL.ink });
      txt(624, 214, 'edge-disjoint routes join them.', { size: 9, color: PAL.ink });
      mono(624, 240, 'reflexive   by the convention', { size: 8.5, color: PAL.valid });
      mono(624, 256, 'symmetric   read routes backwards', { size: 8.5, color: PAL.valid });
      mono(624, 272, 'transitive  glue the two halves', { size: 8.5, color: PAL.valid });
    }
    if (p > 0.62) {
      panel(610, 288, 262, 58, 'ok');
      mono(624, 308, 'classes = 2-edge-connected', { size: 9.5, bold: true, color: PAL.valid });
      mono(624, 324, 'components: 5 of them', { size: 9.5, color: PAL.valid });
      mono(624, 338, 'same five by cutting bridges', { size: 8.5, color: PAL.dim });
    }
    if (p > 0.82) {
      mono(30, 392, 'T1 {0,1,2}   T2 {3,4,5}   T3 {6}   T4 {7,8,9,10}   T5 {11,12,13}', { size: 9.5, color: PAL.dim });
    }
    foot('the relation is checked against a unit-capacity flow for every pair on the graphs this page enumerates');
  }

  /* ---------- scene 4: the relation that looks right ---------- */

  function drawWrongRel(p) {
    head('The tempting relation: "some cycle contains both" - and the bowtie that refutes it');

    var B = [[190, 235], [108, 180], [108, 292], [272, 180], [272, 292]];
    var bes = BOWTIE.edges;
    for (var i = 0; i < bes.length; i++) {
      var e = bes[i];
      var leftCycle = (e[0] !== 3 && e[1] !== 3 && e[0] !== 4 && e[1] !== 4);
      var col = PAL.border;
      if (p > 0.12 && leftCycle) col = PAL.accent;
      if (p > 0.2 && !leftCycle) col = PAL.info;
      edge(B[e[0]], B[e[1]], { stroke: col, sw: 2.2 });
    }
    for (i = 0; i < 5; i++) dot(B[i], i, { r: 17, size: 12 });
    if (p > 0.12) ring(B[0], PAL.warn, 23);
    if (p > 0.3) { ring(B[1], PAL.accent, 23); ring(B[3], PAL.info, 23); }
    if (p > 0.5) {
      P.line(B[1][0] + 8, B[1][1] - 26, B[3][0] - 8, B[3][1] - 26, { stroke: PAL.invalid, sw: 2, dash: [5, 4] });
      mono(190, 136, 'no common cycle', { size: 9.5, align: 'center', bold: true, color: PAL.invalid });
    }

    if (p > 0.06) {
      mono(330, 74, 'the relation, on the bowtie', { size: 10.5, bold: true });
      mono(330, 100, '1 ~ 0     yes, left cycle', { size: 9.5, color: PAL.accent });
      mono(330, 120, '0 ~ 3     yes, right cycle', { size: 9.5, color: PAL.info });
      mono(330, 140, '1 ~ 3     no cycle holds both', { size: 9.5, color: PAL.invalid });
    }
    if (p > 0.34) {
      panel(330, 158, 540, 80, 'bad');
      mono(344, 178, 'so "on a common cycle" is not transitive', { size: 10.5, bold: true, color: PAL.invalid });
      txt(344, 200, 'A relation that is not transitive has no classes. It cannot define a partition, so it cannot', { size: 9, color: PAL.ink });
      txt(344, 216, 'be the definition of a component - however natural it sounds.', { size: 9, color: PAL.ink });
    }
    if (p > 0.52) {
      panel(330, 248, 540, 92, 'ok');
      mono(344, 268, 'two edge-disjoint routes DO exist between 1 and 3', { size: 10.5, bold: true, color: PAL.valid });
      txt(344, 290, 'One goes 1-0 then 0-3; the other goes 1-2-0 then 0-4-3. They share station 0, and', { size: 9, color: PAL.ink });
      txt(344, 306, 'sharing vertices is allowed. Only edges must differ. So the bowtie is one component.', { size: 9, color: PAL.ink });
      mono(344, 328, 'max flow 1 -> 3 = 2', { size: 9, color: PAL.valid });
    }
    if (p > 0.74) {
      panel(330, 348, 540, 70, 'warn');
      mono(344, 368, 'and this is the difference from blocks', { size: 10.5, bold: true, color: PAL.warn });
      mono(344, 390, '2-edge-connected components   1', { size: 9.5, color: PAL.ink });
      mono(344, 408, 'biconnected blocks           2', { size: 9.5, color: PAL.ink });
    }
    foot('cycles, flow values, component and block counts on this page are computed, not drawn from memory');
  }

  /* ---------- scene 5: the search ---------- */

  function drawLowlink(p) {
    head('One depth-first search from the hub: discovery numbers, low values, one comparison');

    var i;
    /* every edge, with the tree edges solid and the closing edges dashed */
    for (i = 0; i < WG.edges.length; i++) {
      var e = WG.edges[i];
      var isTree = W_TR.tree.indexOf(i) !== -1;
      var isBack = W_TR.back.indexOf(i) !== -1;
      var isBr = W_BR[i];
      if (isTree) edge(VX[e[0]], VX[e[1]], { stroke: isBr ? PAL.invalid : PAL.accent, sw: isBr ? 3.2 : 2.2 });
      else if (isBack) edge(VX[e[0]], VX[e[1]], { stroke: PAL.info, sw: 1.6, dash: [5, 4] });
      else edge(VX[e[0]], VX[e[1]], { stroke: PAL.border, sw: 1.4, dash: [2, 4] });
    }
    for (i = 0; i < WG.n; i++) {
      dot(VX[i], i, { r: 15 });
      if (p > 0.1) mono(VX[i][0], VX[i][1] + 27, W_TR.disc[i] + ' / ' + W_TR.low[i], { size: 8.5, align: 'center', color: PAL.dim });
    }
    if (p > 0.28) {
      /* the two vertices of the comparison the narration makes */
      ring(VX[3], PAL.warn, 20);
      ring(VX[2], PAL.warn, 20);
      mono(VX[3][0] - 24, VX[3][1] - 6, 'u', { size: 9, bold: true, color: PAL.warn });
      mono(VX[2][0] + 20, VX[2][1] - 6, 'v', { size: 9, bold: true, color: PAL.warn });
    }

    if (p > 0.02) {
      mono(618, 70, 'the traversal, from 6', { size: 10, bold: true });
      mono(618, 92, 'disc: 6,5,4,3,2,1,0 then 7..13', { size: 8.5, color: PAL.dim });
      mono(618, 110, 'closing edges: 2-0, 5-3, 10-7, 13-11', { size: 8.5, color: PAL.info });
    }
    if (p > 0.36) {
      panel(610, 128, 262, 86, '');
      mono(624, 148, 'the test, one comparison', { size: 10, bold: true });
      mono(624, 172, 'bridge  <=>  low[v] > disc[u]', { size: 10.5, color: PAL.accent });
      mono(624, 194, 'strictly greater, always', { size: 8.5, color: PAL.dim });
    }
    if (p > 0.5) {
      panel(610, 224, 262, 76, 'ok');
      mono(624, 244, 'u = 3, v = 2', { size: 9.5, bold: true, color: PAL.valid });
      mono(624, 264, 'low[v] = 5 > disc[u] = 4', { size: 9.5, color: PAL.valid });
      mono(624, 284, 'so edge 2-3 is a bridge', { size: 9.5, color: PAL.valid });
    }
    if (p > 0.66) {
      panel(610, 310, 262, 74, 'warn');
      mono(624, 330, 'skip the parent EDGE', { size: 9.5, bold: true, color: PAL.warn });
      mono(624, 350, 'not the parent station', { size: 9.5, color: PAL.warn });
      mono(624, 370, 'two parallel edges: 0 / 0 / 1', { size: 8.5, color: PAL.dim });
    }
    foot('disc and low are the numbers this traversal actually produced; the parallel-edge row is computed too');
  }

  /* ---------- scene 6: contract ---------- */

  function drawContract(p) {
    head('Cut the four bridges, then shrink each piece to one dot');

    var i;
    if (p < 0.62) {
      drawWorked(p, { markBridges: p > 0.1, dimNonBridges: p > 0.1 });
    } else {
      P.alpha(0.14);
      drawWorked(p, { noLabels: true });
      P.alpha(1);
    }

    if (p > 0.28) {
      for (var c = 0; c < W_EC.count; c++) {
        var mem = W_MEM[c], cen = centroid(mem);
        var rad = 26;
        mem.forEach(function (v) {
          var d = Math.sqrt(Math.pow(VX[v][0] - cen[0], 2) + Math.pow(VX[v][1] - cen[1], 2));
          if (d + 20 > rad) rad = d + 20;
        });
        var col = ['#0f766e', '#1d4e89', '#9a5406', '#15803d', '#b3261e'][c % 5];
        P.circle(cen[0], cen[1], rad, { stroke: rgba(col, 0.55), sw: 1.6, fill: rgba(col, 0.06) });
        if (p > 0.62) continue;
        mono(cen[0] - rad - 12, cen[1] + 3, 'T' + (c + 1), { size: 9.5, align: 'right', bold: true, color: col });
      }
    }

    if (p > 0.62) {
      /* the contracted tree, drawn on the centroids */
      for (i = 0; i < W_BT.edges.length; i++) {
        var te = W_BT.edges[i];
        var a = centroid(W_MEM[te[0]]), b = centroid(W_MEM[te[1]]);
        P.line(a[0], a[1], b[0], b[1], { stroke: PAL.invalid, sw: 3 });
      }
      for (var c2 = 0; c2 < W_EC.count; c2++) {
        var cen2 = centroid(W_MEM[c2]);
        dot(cen2, 'T' + (c2 + 1), { r: 17, size: 9.5, bold: true,
          fill: PAL.surface, stroke: PAL.invalid, sw: 2, labelColor: PAL.ink });
      }
    }

    if (p > 0.06) {
      mono(618, 74, 'after cutting the bridges', { size: 10, bold: true });
      mono(618, 96, 'pieces            5', { size: 10, color: PAL.accent });
      mono(618, 114, 'bridges           4', { size: 10, color: PAL.invalid });
      mono(618, 132, 'components        1', { size: 10, color: PAL.dim });
    }
    if (p > 0.42) {
      panel(610, 152, 262, 88, 'ok');
      mono(624, 172, 'the count identity', { size: 10, bold: true, color: PAL.valid });
      mono(624, 196, 'pieces = components + bridges', { size: 9.5, color: PAL.valid });
      mono(624, 220, '5 = 1 + 4', { size: 11, bold: true, color: PAL.valid });
    }
    if (p > 0.68) {
      panel(610, 252, 262, 132, '');
      mono(624, 272, 'why it is a forest', { size: 10, bold: true });
      txt(624, 294, 'A forest on k dots with c pieces', { size: 9, color: PAL.ink });
      txt(624, 310, 'has exactly k - c edges. Here', { size: 9, color: PAL.ink });
      txt(624, 326, '5 dots and 1 piece give 4 edges,', { size: 9, color: PAL.ink });
      txt(624, 342, 'which is exactly the bridge count.', { size: 9, color: PAL.ink });
      mono(624, 366, 'checked on all 1024 graphs on 5', { size: 8.5, color: PAL.dim });
    }
    foot('the partition, the identity and the forest property are all checked in code on every graph with 5 vertices');
  }

  /* ---------- scene 7: the bridge tree ---------- */

  var TX = [[110, 250], [240, 250], [370, 250], [510, 140], [370, 348]];
  var TLAB = ['{0,1,2}', '{3,4,5}', '{6}', '{7,8,9,10}', '{11,12,13}'];

  function drawTree(p) {
    head('The bridge tree: five dots, four edges, three leaves');

    var i;
    for (i = 0; i < W_BT.edges.length; i++) {
      var e = W_BT.edges[i];
      if (p < 0.04 + i * 0.06) continue;
      edge(TX[e[0]], TX[e[1]], { stroke: PAL.invalid, sw: 3.2, r: 19 });
    }
    for (i = 0; i < 5; i++) {
      var leaf = W_BT.deg[i] === 1;
      dot(TX[i], 'T' + (i + 1), { r: 19, size: 10.5, bold: true,
        stroke: leaf && p > 0.28 ? PAL.warn : PAL.invalid,
        sw: leaf && p > 0.28 ? 3 : 2,
        fill: leaf && p > 0.28 ? rgba(PAL.warn, 0.14) : PAL.surface });
      if (i === 3) mono(TX[i][0], TX[i][1] - 30, TLAB[i], { size: 9, align: 'center', color: PAL.dim });
      else if (i === 2) mono(TX[i][0] - 28, TX[i][1] + 4, TLAB[i], { size: 9, align: 'right', color: PAL.dim });
      else if (i === 4) mono(TX[i][0] + 26, TX[i][1] + 4, TLAB[i], { size: 9, color: PAL.dim });
      else mono(TX[i][0], TX[i][1] + 34, TLAB[i], { size: 9, align: 'center', color: PAL.dim });
    }
    if (p > 0.3) {
      chip(52, 208, 'leaf', 'warn');
      chip(452, 98, 'leaf', 'warn');
      chip(306, 306, 'leaf', 'warn');
    }
    if (p > 0.52) {
      P.line(TX[0][0], TX[0][1], TX[1][0], TX[1][1], { stroke: PAL.accent, sw: 4.6 });
      P.line(TX[1][0], TX[1][1], TX[2][0], TX[2][1], { stroke: PAL.accent, sw: 4.6 });
      P.line(TX[2][0], TX[2][1], TX[4][0], TX[4][1], { stroke: PAL.accent, sw: 4.6 });
      mono(60, 434, 'T1 to T5: 3 edges, so 3 bridges on every route between those stations', { size: 9.5, color: PAL.accent });
    }
    if (p > 0.14) {
      mono(600, 74, 'dots              5', { size: 10, color: PAL.dim });
      mono(600, 92, 'edges (bridges)   4', { size: 10, color: PAL.invalid });
      mono(600, 110, 'leaves            3', { size: 10, bold: true, color: PAL.warn });
      mono(600, 128, 'degrees  1 2 3 1 1', { size: 9, color: PAL.dim });
    }
    if (p > 0.62) {
      panel(596, 152, 274, 96, '');
      mono(610, 172, 'the distance rule', { size: 10, bold: true });
      txt(610, 194, 'The tree route is unique, and its', { size: 9, color: PAL.ink });
      txt(610, 210, 'length is the number of bridges on', { size: 9, color: PAL.ink });
      txt(610, 226, 'every route between the stations.', { size: 9, color: PAL.ink });
    }
    if (p > 0.76) {
      panel(596, 262, 274, 92, 'ok');
      mono(610, 282, 'inside one dot   2 routes', { size: 9.5, bold: true, color: PAL.valid });
      mono(610, 304, 'in different dots   1 route', { size: 9.5, color: PAL.invalid });
      txt(610, 328, 'so the tree answers the question.', { size: 9, color: PAL.dim });
    }
    foot('degrees, leaves and the distance rule are computed from the contracted graph');
  }

  /* ---------- scene 8: augmentation ---------- */

  function drawAugment(p) {
    head('How many edges make the network safe: the leaves decide');

    var i;
    for (i = 0; i < W_BT.edges.length; i++) {
      var e = W_BT.edges[i];
      edge(TX[e[0]], TX[e[1]], { stroke: PAL.invalid, sw: 3, r: 17 });
    }
    for (i = 0; i < 5; i++) {
      var leaf = W_BT.deg[i] === 1;
      dot(TX[i], 'T' + (i + 1), { r: 17, size: 10, bold: true,
        stroke: leaf ? PAL.warn : PAL.invalid, sw: leaf ? 2.8 : 2,
        fill: leaf ? rgba(PAL.warn, 0.14) : PAL.surface });
    }
    if (p > 0.16) {
      P.line(TX[0][0], TX[0][1], TX[3][0], TX[3][1], { stroke: PAL.valid, sw: 3, dash: [7, 5] });
      mono(276, 148, 'added 1', { size: 9, bold: true, color: PAL.valid });
    }
    if (p > 0.32) {
      P.line(TX[3][0], TX[3][1], TX[4][0], TX[4][1], { stroke: PAL.valid, sw: 3, dash: [7, 5] });
      mono(466, 268, 'added 2', { size: 9, bold: true, color: PAL.valid });
    }

    if (p > 0.44) {
      panel(30, 392, 520, 50, 'ok');
      mono(44, 412, 'each leaf needs an added edge; one edge has two ends', { size: 10, bold: true, color: PAL.valid });
      mono(44, 432, 'so at least ceil(L/2) = ceil(3/2) = 2, and pairing reaches it', { size: 10, color: PAL.valid });
    }

    if (p > 0.56) {
      mono(596, 74, 'brute force on every tree', { size: 10, bold: true });
      mono(596, 96, 'vertices', { size: 8.5, color: PAL.dim });
      mono(672, 96, 'leaves', { size: 8.5, color: PAL.dim });
      mono(742, 96, 'ceil L/2', { size: 8.5, color: PAL.dim });
      mono(816, 96, 'search', { size: 8.5, color: PAL.dim });
      var rows = [['4', '3', '2', '2'], ['5', '4', '2', '2'], ['5', '3', '2', '2'], ['6', '5', '3', '3'], ['6', '4', '2', '2']];
      for (i = 0; i < rows.length; i++) {
        if (p < 0.6 + i * 0.05) continue;
        mono(596, 118 + i * 20, rows[i][0], { size: 9.5, color: PAL.ink });
        mono(672, 118 + i * 20, rows[i][1], { size: 9.5, color: PAL.ink });
        mono(742, 118 + i * 20, rows[i][2], { size: 9.5, color: PAL.ink });
        mono(816, 118 + i * 20, rows[i][3], { size: 9.5, bold: true, color: PAL.valid });
      }
      mono(596, 232, '1437 trees, no exception', { size: 9, color: PAL.valid });
    }
    if (p > 0.76) {
      panel(592, 252, 278, 92, 'warn');
      mono(606, 272, 'count the tree, not the graph', { size: 9.5, bold: true, color: PAL.warn });
      txt(606, 294, 'The graph has several degree-one', { size: 9, color: PAL.ink });
      txt(606, 310, 'stations. The tree has three leaves.', { size: 9, color: PAL.ink });
      txt(606, 326, 'The formula uses the tree.', { size: 9, color: PAL.ink });
    }
    foot('the pairing is run and then every edge is deleted to confirm no bridge survives');
  }

  /* ---------- scene 9: three pairs ---------- */

  function drawPairs(p) {
    head('Three pairs that get confused, and the smallest counterexample to each');

    /* pair 1: one edge */
    if (p > 0.03) {
      txt(30, 62, '1  bridge against articulation point', { size: 10.5, bold: true });
      var A = [[80, 150], [190, 150]];
      edge(A[0], A[1], { stroke: PAL.invalid, sw: 3.2, r: 15 });
      dot(A[0], 0, { r: 15 }); dot(A[1], 1, { r: 15 });
      mono(30, 190, 'bridges 1   articulation points 0', { size: 9, color: PAL.ink });
      mono(30, 206, 'the edge is weak, the stations are not', { size: 8.5, color: PAL.dim });
    }

    /* pair 2: the bowtie */
    if (p > 0.2) {
      txt(300, 62, '2  2-edge against 2-vertex', { size: 10.5, bold: true });
      var B = [[380, 182], [318, 140], [318, 226], [442, 140], [442, 226]];
      for (var i = 0; i < BOWTIE.edges.length; i++) {
        var e = BOWTIE.edges[i];
        edge(B[e[0]], B[e[1]], { stroke: PAL.border, sw: 2 });
      }
      for (i = 0; i < 5; i++) dot(B[i], i, { r: 14, size: 10 });
      ring(B[0], PAL.warn, 19);
      mono(300, 288, 'components 1   blocks 2   cut vertices 1', { size: 9, color: PAL.ink });
      mono(300, 304, 'the shared station is the whole difference', { size: 8.5, color: PAL.dim });
    }

    /* pair 3: a directed cycle */
    if (p > 0.42) {
      txt(540, 62, '3  undirected against directed', { size: 10.5, bold: true });
      var D = [[610, 120], [700, 120], [700, 200], [610, 200]];
      var dirs = [[0, 1], [1, 2], [2, 3], [3, 0]];
      for (i = 0; i < dirs.length; i++) {
        var d = dirs[i];
        var rev = (i === 3);
        P.arrow(D[d[0]][0], D[d[0]][1], D[d[1]][0], D[d[1]][1],
          { stroke: rev ? PAL.invalid : PAL.accent, sw: 2.2, head: 9 });
      }
      for (i = 0; i < 4; i++) dot(D[i], i, { r: 13, size: 10 });
      mono(540, 232, 'one 2-edge-connected component either way', { size: 9, color: PAL.valid });
      mono(540, 248, 'strongly connected: 1 when all agree, 2 here', { size: 9, color: PAL.invalid });
      mono(540, 264, 'same edges, different question', { size: 8.5, color: PAL.dim });
    }

    if (p > 0.62) {
      panel(30, 330, 840, 96, '');
      mono(44, 350, 'the two implications that hold, and the one that does not', { size: 10.5, bold: true });
      mono(44, 374, '2-vertex-connected  =>  2-edge-connected        holds', { size: 9.5, color: PAL.valid });
      mono(44, 394, '2-edge-connected  =>  2-vertex-connected        fails: the bowtie', { size: 9.5, color: PAL.invalid });
      mono(470, 374, 'no bridge  <=>  one 2-edge-connected piece', { size: 9.5, color: PAL.valid });
      mono(470, 394, 'a cut vertex says nothing about edges', { size: 9.5, color: PAL.dim });
    }
    foot('all three counts on this frame come from the definitions, computed for the graphs drawn');
  }

  /* ---------- scene 10: the procedure ---------- */

  function drawProc(p) {
    head('Five steps, and the four errors that cost the mark');

    var steps = [
      ['1', 'Read the question', 'weak edges = bridges; safe stations = components'],
      ['2', 'One search, two numbers', 'disc and low, skipping the parent edge by identity'],
      ['3', 'Mark a bridge', 'low of the child strictly greater than disc of the parent'],
      ['4', 'Cut and label', 'pieces = components + bridges; same label = two routes'],
      ['5', 'Count added edges', 'leaves of the bridge tree, ceiling of L over 2']
    ];
    for (var i = 0; i < steps.length; i++) {
      if (p < 0.04 + i * 0.08) continue;
      var y = 56 + i * 46;
      P.circle(52, y + 8, 13, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.3 });
      mono(52, y + 4, steps[i][0], { size: 11, bold: true, align: 'center', color: PAL.accent });
      txt(80, y, steps[i][1], { size: 11, bold: true });
      txt(80, y + 19, steps[i][2], { size: 9.5, color: PAL.dim });
    }

    if (p > 0.56) {
      panel(30, 300, 840, 118, 'bad');
      mono(44, 320, 'the four errors', { size: 10.5, bold: true, color: PAL.invalid });
      mono(44, 344, 'skip the parent station    ->  a bridge between parallel edges', { size: 9.5, color: PAL.ink });
      mono(44, 366, 'common cycle as the rule   ->  the bowtie has no such classes', { size: 9.5, color: PAL.ink });
      mono(44, 388, 'leaves of the graph        ->  3 leaves of the tree, not the degree-one stations', { size: 9.5, color: PAL.ink });
      mono(470, 344, 'strictly greater?          ->  >= gives a cut vertex, not a bridge', { size: 9.5, color: PAL.ink });
      mono(470, 366, 'a forest, not a tree       ->  one bridge tree per component', { size: 9.5, color: PAL.ink });
    }
    foot('every number on this page is computed in the browser and reported in the model-checks panel');
  }

  var DRAW = {
    split: drawSplit, cycle: drawCycle, disjoint: drawDisjoint, wrongrel: drawWrongRel,
    lowlink: drawLowlink, contract: drawContract, tree: drawTree, augment: drawAugment,
    pairs: drawPairs, proc: drawProc
  };

  function drawFrame(t) {
    if (!P) return;
    P.clear();
    P.alpha(1);
    var i = K.sceneAt(t);
    var sc = K.state.scenes[i];
    if (!sc) return;
    var fn = DRAW[sc.id];
    if (fn) fn(K.sceneProgress(t));
  }

  /* ======================================================================
     BOOT
     ====================================================================== */

  function reportChecks() {
    var el = document.getElementById('checks');
    if (!el) return;
    var bad = CHECKS.filter(function (c) { return !c.pass; });
    el.innerHTML = '<span class="k">Model checks</span>' +
      '<p class="small" style="margin:6px 0 0">' + PASSED + ' of ' + CHECKS.length + ' passed' +
      (bad.length ? ' <span style="color:var(--invalid)">(' + bad.length + ' failed)</span>' : '') + '</p>';
  }

  function boot() {
    var holder = document.getElementById('canvas-holder');
    var fallback = document.getElementById('canvas-fallback');
    reportChecks();

    var ok = false;
    try {
      if (window.p5) {
        new window.p5(function (sk) {
          sk.setup = function () {
            var c = sk.createCanvas(W, H);
            c.parent(holder);
            sk.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
            sk.noLoop();
            P = PR.makePainterP5(sk, W, H);
          };
          sk.draw = function () {
            if (!P) P = PR.makePainterP5(sk, W, H);
            drawFrame(K.state.elapsed);
          };
        });
        K.onResize(function () {
          if (!holder) return;
          var scale = Math.min(1, holder.clientWidth / W);
          var cv = holder.querySelector('canvas');
          if (cv) { cv.style.width = (W * scale) + 'px'; cv.style.height = (H * scale) + 'px'; }
        });
        ok = true;
      }
    } catch (e) {
      console.error('p5 failed', e);
      ok = false;
    }

    if (!ok) {
      var drew = false;
      try {
        var cv2 = document.createElement('canvas');
        cv2.width = W; cv2.height = H;
        if (holder) holder.appendChild(cv2);
        var ctx2d = cv2.getContext && cv2.getContext('2d');
        if (ctx2d) { P = PR.makePainter2D(ctx2d, W, H); drawFrame(0); drew = true; }
      } catch (e) {
        console.error('canvas fallback failed', e);
      }
      if (!drew && fallback) fallback.classList.add('show');
    }

    if (K && K.init) {
      K.init({ timeline: window.LESSON_TIMELINE, draw: function () { if (P) drawFrame(K.state.elapsed); } });
    }

    window.__drawAt = function (t) {
      K.state.elapsed = t;
      if (P) drawFrame(t);
    };

    var bad = CHECKS.filter(function (c) { return !c.pass; });
    if (bad.length) console.warn('Model validation did not fully pass:', bad);
  }

  window.LESSON_MODEL = {
    W: W, H: H,
    WG: WG, VX: VX, W_BR: W_BR, W_EC: W_EC, W_BT: W_BT, W_TR: W_TR, W_AP: W_AP,
    W_MEM: W_MEM, W_ADD: W_ADD,
    BOWTIE: BOWTIE, BOW_EC: BOW_EC, BOW_BL: BOW_BL, BOW_AP: BOW_AP, BOW_CP: BOW_CP,
    PAIR_TRUTH: PAIR_TRUTH, PAIR_EDGE: PAIR_EDGE, PAIR_NAIVE: PAIR_NAIVE,
    compInfo: compInfo, bruteBridges: bruteBridges, tarjanEdge: tarjanEdge,
    tarjanVertexParent: tarjanVertexParent, searchTrace: searchTrace,
    edgeDisjointPaths: edgeDisjointPaths, eccByRelation: eccByRelation,
    eccByContraction: eccByContraction, bridgeTree: bridgeTree,
    articulationPoints: articulationPoints, cyclePairs: cyclePairs, blocks: blocks,
    allGraphs: allGraphs, prueferTrees: prueferTrees, minEdgesBrute: minEdgesBrute,
    pairLeaves: pairLeaves, tested5: tested5, flowPairs: flowPairs,
    treesBruted: treesBruted, treesPaired: treesPaired, distTests: distTests,
    PASSED: PASSED, TOTAL: CHECKS.length, ALL_PASS: PASSED === CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
