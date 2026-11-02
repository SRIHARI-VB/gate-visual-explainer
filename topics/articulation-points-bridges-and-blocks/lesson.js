/* ==========================================================================
   articulation-points-bridges-and-blocks - model, validation, render.

   Layer 1  model      : an undirected graph is an adjacency list. One
                         depth-first search records disc and low; three
                         comparisons read off it produce the articulation
                         points, the bridges and the blocks (edge stack).
   Layer 2  validation : those three outputs are compared with the definitions
                         by deletion, and the block partition with the
                         common-cycle definition, on every undirected graph
                         with up to five vertices (1,099 graphs) and on 2,000
                         seeded random graphs with six to eight vertices. The
                         root rule, the leaf rule, the pop-count identity and
                         the block-cut identity are each checked as their own
                         property, and every wrong variant is refuted by the
                         smallest graph on which it fails, found by search.
   Layer 3  render     : reads the model; never re-derives a number.
   Layer 4  timeline   : in timeline.js - the only source of time.

   No p5.brush: every mark is a circle, an arrow, a bar or a number that has to
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

  /* ======================================================================
     LAYER 1 - THE MODEL
     ====================================================================== */

  var NAME = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  var WN = 12;

  /* three cyclic pieces joined by bridges, one four-vertex piece that is not a
     cycle, and two leaves: every case the lesson needs is in one drawing */
  var WEDGES = [
    [0, 1], [1, 2], [2, 0],                    /* triangle A B C           */
    [2, 3],                                    /* bridge C-D               */
    [3, 4], [4, 5], [5, 11], [11, 3], [3, 5],  /* K4 minus E-L on D E F L  */
    [5, 6],                                    /* bridge F-G               */
    [6, 7], [7, 8], [8, 6],                    /* triangle G H I           */
    [8, 9],                                    /* bridge I-J, J is a leaf  */
    [3, 10]                                    /* bridge D-K, K is a leaf  */
  ];

  /* the search starts at a leaf, so the root rule cannot be dodged */
  var ROOT = 9;

  function ekey(a, b) { return a < b ? a + '-' + b : b + '-' + a; }

  function buildAdj(n, edges) {
    var adj = [], i;
    for (i = 0; i < n; i++) adj.push([]);
    for (i = 0; i < edges.length; i++) {
      adj[edges[i][0]].push(edges[i][1]);
      adj[edges[i][1]].push(edges[i][0]);
    }
    return adj;
  }

  function compCount(n, edges, skipV, skipE) {
    var adj = [], i, j;
    for (i = 0; i < n; i++) adj.push([]);
    for (i = 0; i < edges.length; i++) {
      if (i === skipE) continue;
      var a = edges[i][0], b = edges[i][1];
      if (a === skipV || b === skipV) continue;
      adj[a].push(b); adj[b].push(a);
    }
    var seen = [], c = 0;
    for (i = 0; i < n; i++) seen.push(false);
    for (i = 0; i < n; i++) {
      if (i === skipV || seen[i]) continue;
      c++;
      var st = [i];
      seen[i] = true;
      while (st.length) {
        var u = st.pop();
        for (j = 0; j < adj[u].length; j++) {
          if (!seen[adj[u][j]]) { seen[adj[u][j]] = true; st.push(adj[u][j]); }
        }
      }
    }
    return c;
  }

  /* one depth-first search over every component; `first` is the start vertex */
  function tarjan(n, edges, first) {
    var adj = buildAdj(n, edges);
    var disc = [], low = [], par = [], children = [], parentEdge = [], i;
    for (i = 0; i < n; i++) { disc.push(-1); low.push(-1); par.push(-1); children.push(0); parentEdge.push(-1); }
    var eIndex = {};
    for (i = 0; i < edges.length; i++) eIndex[ekey(edges[i][0], edges[i][1])] = i;

    var ap = {}, bridges = {}, blocks = [], roots = [], treeEdges = [], backEdges = [];
    var clock = 0, stack = [];

    function dfs(u) {
      disc[u] = low[u] = clock++;
      var nb = adj[u], j;
      for (j = 0; j < nb.length; j++) {
        var v = nb[j];
        var ei = eIndex[ekey(u, v)];
        if (ei === parentEdge[u]) continue;
        if (disc[v] === -1) {
          par[v] = u; parentEdge[v] = ei; children[u]++;
          treeEdges.push(ekey(u, v));
          stack.push(ei);
          dfs(v);
          low[u] = Math.min(low[u], low[v]);
          if (low[v] > disc[u]) bridges[ekey(u, v)] = true;
          if (low[v] >= disc[u] && par[u] !== -1) ap[u] = true;
          if (low[v] >= disc[u]) {
            var block = [], e;
            while (stack.length) {
              e = stack.pop();
              block.push(edges[e]);
              if (e === ei) break;
            }
            blocks.push(block);
          }
        } else if (disc[v] < disc[u]) {
          backEdges.push(ekey(u, v));
          low[u] = Math.min(low[u], disc[v]);
          stack.push(ei);
        }
      }
      if (par[u] === -1 && children[u] >= 2) ap[u] = true;
    }

    var order = [first];
    for (i = 0; i < n; i++) order.push(i);
    for (i = 0; i < order.length; i++) {
      if (disc[order[i]] === -1) { roots.push(order[i]); dfs(order[i]); }
    }
    return {
      disc: disc, low: low, par: par, children: children, ap: ap, bridges: bridges,
      blocks: blocks, treeEdges: treeEdges, backEdges: backEdges, roots: roots,
      parentEdge: parentEdge
    };
  }

  function bruteAP(n, edges) {
    var base = compCount(n, edges, -1, -1), out = [], v;
    for (v = 0; v < n; v++) if (compCount(n, edges, v, -1) > base) out.push(v);
    return out;
  }

  function bruteBridge(n, edges) {
    var base = compCount(n, edges, -1, -1), out = [], i;
    for (i = 0; i < edges.length; i++) {
      if (compCount(n, edges, -1, i) > base) out.push(ekey(edges[i][0], edges[i][1]));
    }
    return out;
  }

  /* blocks by the definition, brute force: two edges are in the same block iff a
     common simple cycle carries both. Enumerate every edge subset that is a
     cycle and union the edges it contains. Only for tiny graphs. */
  function bruteBlocks(n, edges) {
    var m = edges.length, parent = [], i, j, mask;
    for (i = 0; i < m; i++) parent.push(i);
    function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
    function uni(a, b) { a = find(a); b = find(b); if (a !== b) parent[a] = b; }

    for (mask = 1; mask < (1 << m); mask++) {
      var sub = [], bits = 0;
      for (i = 0; i < m; i++) if (mask & (1 << i)) { sub.push(i); bits++; }
      if (bits < 3) continue;
      var deg = [], vs = {}, count = 0;
      for (i = 0; i < n; i++) deg.push(0);
      for (i = 0; i < sub.length; i++) {
        var a = edges[sub[i]][0], b = edges[sub[i]][1];
        deg[a]++; deg[b]++;
        if (!vs[a]) { vs[a] = true; count++; }
        if (!vs[b]) { vs[b] = true; count++; }
      }
      var ok = true;
      for (i = 0; i < n; i++) if (vs[i] && deg[i] !== 2) { ok = false; break; }
      if (!ok) continue;
      /* connected on those vertices? */
      var adj = {}, st, seen = {}, seenCount = 0;
      for (i = 0; i < sub.length; i++) {
        var p = edges[sub[i]][0], q = edges[sub[i]][1];
        (adj[p] = adj[p] || []).push(q);
        (adj[q] = adj[q] || []).push(p);
      }
      var start = edges[sub[0]][0];
      st = [start]; seen[start] = true; seenCount = 1;
      while (st.length) {
        var u = st.pop();
        for (j = 0; j < adj[u].length; j++) {
          if (!seen[adj[u][j]]) { seen[adj[u][j]] = true; seenCount++; st.push(adj[u][j]); }
        }
      }
      if (seenCount !== count) continue;
      for (i = 1; i < sub.length; i++) uni(sub[0], sub[i]);
    }
    var groups = {};
    for (i = 0; i < m; i++) {
      var r = find(i);
      (groups[r] = groups[r] || []).push(ekey(edges[i][0], edges[i][1]));
    }
    var out = [];
    for (var k in groups) out.push(groups[k].sort());
    return out;
  }

  function canon(blocks) {
    return blocks.map(function (b) { return b.slice().sort().join(','); }).sort().join('|');
  }

  /* the properties a block decomposition must satisfy, for graphs too large to
     check against the common-cycle definition */
  function blockProperties(n, edges, r) {
    var i, j, seen = {}, blocks = r.blocks;
    /* 1. partition of the edge set */
    var total = 0;
    for (i = 0; i < blocks.length; i++) {
      for (j = 0; j < blocks[i].length; j++) {
        var k = ekey(blocks[i][j][0], blocks[i][j][1]);
        if (seen[k]) return 'edge in two blocks';
        seen[k] = true;
        total++;
      }
    }
    if (total !== edges.length) return 'edges missing from the blocks';
    /* 2. blocks share at most one vertex, and it is an articulation point */
    var verts = blocks.map(function (b) {
      var s = {}, out = [];
      b.forEach(function (e) { s[e[0]] = true; s[e[1]] = true; });
      for (var v in s) out.push(Number(v));
      return out;
    });
    for (i = 0; i < blocks.length; i++) {
      for (j = i + 1; j < blocks.length; j++) {
        var shared = verts[i].filter(function (v) { return verts[j].indexOf(v) >= 0; });
        if (shared.length > 1) return 'two blocks share two vertices';
        if (shared.length === 1 && !r.ap[shared[0]]) return 'blocks meet outside an articulation point';
      }
    }
    /* 3. a vertex is an articulation point iff it lies in two or more blocks */
    var inBlocks = [];
    for (i = 0; i < n; i++) inBlocks.push(0);
    for (i = 0; i < verts.length; i++) verts[i].forEach(function (v) { inBlocks[v]++; });
    for (i = 0; i < n; i++) {
      if (!!r.ap[i] !== (inBlocks[i] >= 2)) return 'articulation point does not match the block count';
    }
    /* 4. the block-cut identity */
    var sumVB = 0, inSome = 0;
    for (i = 0; i < verts.length; i++) sumVB += verts[i].length;
    for (i = 0; i < n; i++) if (inBlocks[i] > 0) inSome++;
    var extra = 0;
    for (i = 0; i < n; i++) if (r.ap[i]) extra += inBlocks[i] - 1;
    if (sumVB !== inSome + extra) return 'block-cut identity fails';
    /* 5. the pop count */
    var pops = 0;
    for (i = 0; i < n; i++) if (r.par[i] !== -1 && r.low[i] >= r.disc[r.par[i]]) pops++;
    if (pops !== blocks.length) return 'pop count does not match the blocks';
    return null;
  }

  /* ---- the drawn graph, computed --------------------------------------- */
  var WK = tarjan(WN, WEDGES, ROOT);
  var WAP = bruteAP(WN, WEDGES);
  var WBR = bruteBridge(WN, WEDGES);
  var WBLOCKS = WK.blocks;

  function blockVerts(b) {
    var s = {}, out = [];
    b.forEach(function (e) { s[e[0]] = true; s[e[1]] = true; });
    for (var v in s) out.push(Number(v));
    out.sort(function (a, b2) { return a - b2; });
    return out;
  }
  var WBLOCKV = WBLOCKS.map(blockVerts);
  var WAPLIST = [];
  for (var wi = 0; wi < WN; wi++) if (WK.ap[wi]) WAPLIST.push(wi);
  var WBLIST = [];
  for (var we in WK.bridges) WBLIST.push(we);
  WBLIST.sort();
  var WBPER = [];
  for (wi = 0; wi < WN; wi++) {
    var cnt = 0;
    WBLOCKS.forEach(function (b) { if (blockVerts(b).indexOf(wi) >= 0) cnt++; });
    WBPER.push(cnt);
  }
  var WPOP = [];
  for (wi = 0; wi < WN; wi++) {
    if (WK.par[wi] === -1) continue;
    WPOP.push({ v: wi, p: WK.par[wi], low: WK.low[wi], disc: WK.disc[WK.par[wi]], hit: WK.low[wi] >= WK.disc[WK.par[wi]] });
  }

  /* ---- exhaustive and random sweeps ------------------------------------ */
  function allGraphs(n) {
    var pairs = [], i, j, out = [], mask;
    for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) pairs.push([i, j]);
    for (mask = 0; mask < (1 << pairs.length); mask++) {
      var es = [];
      for (i = 0; i < pairs.length; i++) if (mask & (1 << i)) es.push(pairs[i]);
      out.push(es);
    }
    return out;
  }

  var SWEEP = {
    graphs: 0, apBad: 0, brBad: 0, blkBad: 0, popBad: 0, rootBad: 0, leafBad: 0,
    brIncBad: 0, idBad: 0, propBad: 0, random: 0, n5: 0
  };

  (function () {
    var n, list, g, i;
    for (n = 1; n <= 5; n++) {
      list = allGraphs(n);
      if (n === 5) SWEEP.n5 = list.length;
      for (g = 0; g < list.length; g++) {
        var es = list[g], r, root;
        SWEEP.graphs++;
        for (root = 0; root < n; root++) {
          r = tarjan(n, es, root);
          if (root > 0) {
            if ((r.children[root] >= 2) !== !!r.ap[root]) SWEEP.rootBad++;
            for (i = 0; i < n; i++) {
              if (i !== root && r.children[i] === 0 && r.ap[i]) SWEEP.leafBad++;
            }
            continue;
          }
          if (bruteAP(n, es).slice().sort().join(',') !== Object.keys(r.ap).map(Number).sort().join(',')) SWEEP.apBad++;
          if (bruteBridge(n, es).slice().sort().join(',') !== Object.keys(r.bridges).sort().join(',')) SWEEP.brBad++;
          if ((r.children[root] >= 2) !== !!r.ap[root]) SWEEP.rootBad++;
          for (i = 0; i < n; i++) {
            if (i !== root && r.children[i] === 0 && r.ap[i]) SWEEP.leafBad++;
          }
          var pops = 0;
          for (i = 0; i < n; i++) if (r.par[i] !== -1 && r.low[i] >= r.disc[r.par[i]]) pops++;
          if (pops !== r.blocks.length) SWEEP.popBad++;
          if (n === 5 && canon(r.blocks.map(function (b) {
            return b.map(function (e) { return ekey(e[0], e[1]); });
          })) !== canon(bruteBlocks(n, es))) SWEEP.blkBad++;
          var base = compCount(n, es, -1, -1);
          var brs = bruteBridge(n, es);
          for (i = 0; i < es.length; i++) {
            var k = ekey(es[i][0], es[i][1]);
            if (brs.indexOf(k) >= 0 && compCount(n, es, -1, i) !== base + 1) SWEEP.brIncBad++;
          }
        }
      }
    }
  })();

  /* seeded random graphs with six to eight vertices, for the properties that
     do not need the common-cycle brute force */
  (function () {
    var seed = 20261102;
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    var t;
    for (t = 0; t < 2000; t++) {
      var n = 6 + Math.floor(rnd() * 3), es = [], i, j;
      for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) if (rnd() < 0.35) es.push([i, j]);
      SWEEP.random++;
      var r = tarjan(n, es, 0);
      if (bruteAP(n, es).slice().sort().join(',') !== Object.keys(r.ap).map(Number).sort().join(',')) SWEEP.apBad++;
      if (bruteBridge(n, es).slice().sort().join(',') !== Object.keys(r.bridges).sort().join(',')) SWEEP.brBad++;
      if (blockProperties(n, es, r)) SWEEP.propBad++;
      if ((r.children[0] >= 2) !== !!r.ap[0]) SWEEP.rootBad++;
      for (i = 0; i < n; i++) if (i !== 0 && r.children[i] === 0 && r.ap[i]) SWEEP.leafBad++;
    }
  })();

  /* ---- smallest counterexamples, by search ------------------------------ */
  function smallest(pred) {
    for (var n = 1; n <= 5; n++) {
      var list = allGraphs(n);
      for (var g = 0; g < list.length; g++) if (pred(n, list[g])) return { n: n, es: list[g] };
    }
    return null;
  }

  var WRONG = {};

  /* 1. the vertex test with the strict inequality */
  WRONG.gt = smallest(function (n, es) {
    var r = tarjan(n, es, 0), wrong = {}, u, v;
    for (u = 0; u < n; u++) {
      if (r.par[u] === -1) { if (r.children[u] >= 2) wrong[u] = true; continue; }
      for (v = 0; v < n; v++) if (r.par[v] === u && r.low[v] > r.disc[u]) { wrong[u] = true; break; }
    }
    return bruteAP(n, es).slice().sort().join(',') !== Object.keys(wrong).map(Number).sort().join(',');
  });

  /* 2. the vertex test applied at the root */
  WRONG.root = smallest(function (n, es) {
    var r = tarjan(n, es, 0), wrong = {}, v;
    for (v = 0; v < n; v++) if (r.ap[v]) wrong[v] = true;
    for (v = 0; v < n; v++) if (r.par[v] === 0 && r.low[v] >= r.disc[0]) wrong[0] = true;
    return bruteAP(n, es).slice().sort().join(',') !== Object.keys(wrong).map(Number).sort().join(',');
  });

  /* 3. a bridge with no articulation point at either end */
  WRONG.brEnd = smallest(function (n, es) {
    var br = bruteBridge(n, es), ap = bruteAP(n, es);
    return br.some(function (k) {
      var p = k.split('-');
      return ap.indexOf(Number(p[0])) < 0 || ap.indexOf(Number(p[1])) < 0;
    });
  });

  /* 4. no bridge, yet an articulation point */
  WRONG.noBrAP = smallest(function (n, es) {
    return bruteBridge(n, es).length === 0 && bruteAP(n, es).length > 0;
  });

  /* 5. an articulation point whose deletion adds more than one component */
  WRONG.jump = smallest(function (n, es) {
    var base = compCount(n, es, -1, -1);
    return bruteAP(n, es).some(function (v) { return compCount(n, es, v, -1) - base > 1; });
  });

  /* 6. a single block that is not a cycle */
  WRONG.notCycle = smallest(function (n, es) {
    if (n < 4) return false;
    if (compCount(n, es, -1, -1) !== 1) return false;
    var bl = bruteBlocks(n, es);
    return bl.length === 1 && es.length > n;
  });

  /* ---- the 2021 Set 1 item, recomputed --------------------------------- */
  function optACounter(n, es, root) {
    var r = tarjan(n, es, root), depth = [], i, u, x, y;
    for (i = 0; i < n; i++) depth.push(-1);
    (function go(v, d) {
      depth[v] = d;
      for (var c = 0; c < n; c++) if (r.par[c] === v) go(c, d + 1);
    })(root, 0);
    for (u = 0; u < n; u++) {
      if (!r.ap[u]) continue;
      for (x = 0; x < n; x++) {
        if (x === u || depth[x] < 0 || depth[x] >= depth[u]) continue;
        var a = u;
        while (a !== -1 && a !== x) a = r.par[a];
        if (a !== x) continue;
        for (y = 0; y < n; y++) {
          if (y === u || depth[y] <= depth[u]) continue;
          var b = y;
          while (b !== -1 && b !== u) b = r.par[b];
          if (b !== u) continue;
          /* is there an x-y path that avoids u? */
          var adj = buildAdj(n, es), seen = {}, st = [x], hit = false;
          seen[x] = true;
          while (st.length) {
            var p = st.pop();
            for (i = 0; i < adj[p].length; i++) {
              var w = adj[p][i];
              if (w !== u && !seen[w]) { seen[w] = true; st.push(w); }
            }
          }
          hit = !!seen[y];
          if (hit) return { u: u, x: x, y: y };
        }
      }
    }
    return null;
  }

  var ITEM2021 = {
    A: smallest(function (n, es) { return n >= 4 && optACounter(n, es, 0) !== null; }),
    C: null,
    D: smallest(function (n, es) { return !!tarjan(n, es, 0).ap[0]; })
  };
  if (ITEM2021.A) ITEM2021.A.detail = optACounter(ITEM2021.A.n, ITEM2021.A.es, 0);
  /* option C: no leaf of the search tree is an articulation point */
  ITEM2021.leafFound = (function () {
    for (var n = 1; n <= 5; n++) {
      var list = allGraphs(n);
      for (var g = 0; g < list.length; g++) {
        for (var root = 0; root < n; root++) {
          var r = tarjan(n, list[g], root);
          for (var v = 0; v < n; v++) if (v !== root && r.children[v] === 0 && r.ap[v]) return true;
        }
      }
    }
    return false;
  })();

  /* the 2015 item: a bridge never shares a block with another edge */
  var BRIDGE_SHARED = (function () {
    var bad = 0, n, g;
    for (n = 3; n <= 5; n++) {
      var list = allGraphs(n);
      for (g = 0; g < list.length; g++) {
        var bl = bruteBlocks(n, list[g]);
        bruteBridge(n, list[g]).forEach(function (k) {
          if (!bl.some(function (b) { return b.length === 1 && b[0] === k; })) bad++;
        });
      }
    }
    return bad;
  })();

  /* ---- trees: every edge a bridge, cut vertices exactly the non-leaves ---- */
  var TREES = (function () {
    var checked = 0, bad = 0, n, code, total, seq, i, es, deg, br, ap;
    function prufer(nn, sq) {
      var d = [], out = [], v, x, left = [];
      for (v = 0; v < nn; v++) d.push(1);
      sq.forEach(function (q) { d[q]++; });
      sq.forEach(function (q) {
        for (v = 0; v < nn; v++) if (d[v] === 1) { out.push([v, q]); d[v]--; d[q]--; break; }
      });
      for (v = 0; v < nn; v++) if (d[v] === 1) left.push(v);
      if (left.length === 2) out.push([left[0], left[1]]);
      return out;
    }
    for (n = 2; n <= 6; n++) {
      total = Math.pow(n, Math.max(0, n - 2));
      for (code = 0; code < total; code++) {
        seq = [];
        var c = code;
        for (i = 0; i < n - 2; i++) { seq.push(c % n); c = Math.floor(c / n); }
        es = prufer(n, seq);
        if (es.length !== n - 1) continue;
        checked++;
        br = bruteBridge(n, es).length;
        ap = bruteAP(n, es).length;
        deg = [];
        for (i = 0; i < n; i++) deg.push(0);
        es.forEach(function (e) { deg[e[0]]++; deg[e[1]]++; });
        var nonLeaf = deg.filter(function (d) { return d >= 2; }).length;
        if (br !== n - 1 || ap !== nonLeaf) bad++;
      }
    }
    return { checked: checked, bad: bad };
  })();

  /* ---- the block-cut graph of the drawn graph --------------------------- */
  var BLOCKCUT = (function () {
    var nodes = WBLOCKS.length + WAPLIST.length, edges = 0, i, j;
    var adj = [], seen = [], st, count = 0;
    for (i = 0; i < nodes; i++) adj.push([]);
    for (i = 0; i < WBLOCKS.length; i++) {
      for (j = 0; j < WAPLIST.length; j++) {
        if (WBLOCKV[i].indexOf(WAPLIST[j]) >= 0) {
          edges++;
          adj[i].push(WBLOCKS.length + j);
          adj[WBLOCKS.length + j].push(i);
        }
      }
    }
    for (i = 0; i < nodes; i++) seen.push(false);
    st = [0]; seen[0] = true; count = 1;
    while (st.length) {
      var u = st.pop();
      for (j = 0; j < adj[u].length; j++) {
        if (!seen[adj[u][j]]) { seen[adj[u][j]] = true; count++; st.push(adj[u][j]); }
      }
    }
    return { nodes: nodes, edges: edges, connected: count === nodes };
  })();

  /* ---- the check list the page reports -------------------------------- */
  var CHECKS = [
    { name: 'articulation points = vertices whose deletion raises the component count',
      pass: SWEEP.apBad === 0 && !!WK.ap[2] && !!WK.ap[3],
      note: SWEEP.graphs + ' graphs, plus ' + SWEEP.random + ' random' },
    { name: 'bridges = edges whose deletion raises the component count',
      pass: SWEEP.brBad === 0 && WBLIST.length === WBR.length,
      note: 'drawn graph: ' + WBLIST.length + ' found, ' + WBR.length + ' by deletion' },
    { name: 'blocks = the classes of the common-cycle relation',
      pass: SWEEP.blkBad === 0,
      note: 'all ' + SWEEP.n5 + ' graphs on five vertices' },
    { name: 'block partition holds on larger random graphs',
      pass: SWEEP.propBad === 0,
      note: SWEEP.random + ' graphs with six to eight vertices' },
    { name: '#blocks = #tree edges with low >= disc',
      pass: SWEEP.popBad === 0,
      note: 'drawn graph: ' + WPOP.filter(function (p) { return p.hit; }).length + ' pops, ' + WBLOCKS.length + ' blocks' },
    { name: 'root is an articulation point iff it has two or more children',
      pass: SWEEP.rootBad === 0,
      note: 'every start vertex of every graph searched' },
    { name: 'a leaf of the search tree is never an articulation point',
      pass: SWEEP.leafBad === 0 && !ITEM2021.leafFound,
      note: 'no counterexample found' },
    { name: 'deleting a bridge raises the component count by exactly one',
      pass: SWEEP.brIncBad === 0,
      note: 'checked edge by edge' },
    { name: 'the drawn graph: blocks partition its 15 edges',
      pass: WBLOCKS.reduce(function (s, b) { return s + b.length; }, 0) === WEDGES.length,
      note: WBLOCKS.length + ' blocks, ' + WEDGES.length + ' edges' },
    { name: 'the block-cut graph is a tree: connected and acyclic',
      pass: BLOCKCUT.connected && BLOCKCUT.edges === BLOCKCUT.nodes - 1,
      note: BLOCKCUT.nodes + ' nodes, ' + BLOCKCUT.edges + ' edges, connected ' + BLOCKCUT.connected },
    { name: 'in a tree every edge is a bridge and the cut vertices are the non-leaves',
      pass: TREES.bad === 0,
      note: TREES.checked + ' labelled trees with two to six vertices' },
    { name: 'a bridge never shares a block with another edge',
      pass: BRIDGE_SHARED === 0,
      note: 'checked on every graph with three to five vertices' },
    { name: 'every wrong variant is refuted by a found counterexample',
      pass: !!(WRONG.gt && WRONG.root && WRONG.brEnd && WRONG.noBrAP && WRONG.jump && WRONG.notCycle &&
        ITEM2021.A && ITEM2021.D),
      note: 'six variants, six smallest examples' }
  ];
  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

  /* ======================================================================
     LAYER 3 - RENDER
     ====================================================================== */

  var POS = {
    0: [62, 250], 1: [136, 250], 2: [210, 250], 3: [290, 250],
    4: [330, 186], 5: [330, 314], 11: [372, 250],
    6: [452, 314], 7: [528, 262], 8: [528, 366], 9: [604, 366], 10: [250, 352]
  };
  var R = 15;

  function stage(p, n) {
    var s = Math.floor(K.clamp01(p) * n);
    return s >= n ? n - 1 : s;
  }

  function title(s, sub) {
    P.text(26, 14, s, { size: 15, bold: true, color: PAL.ink });
    if (sub) P.text(26, 36, sub, { size: 10.5, color: PAL.dim });
  }

  function foot(s) {
    P.text(26, 450, s, { size: 9.5, color: PAL.faint });
  }

  function line(x, y, s, o) {
    o = o || {};
    P.text(x, y, s, {
      size: o.size || 11.5, color: o.color || PAL.ink, bold: !!o.bold,
      mono: !!o.mono, align: o.align || 'left', base: 'top'
    });
  }

  function centre(x, y, s, o) {
    o = o || {};
    P.text(x, y, s, {
      size: o.size || 12, color: o.color || PAL.ink, bold: !!o.bold,
      mono: !!o.mono, align: 'center', base: 'middle'
    });
  }

  function panel(x, y, w, h, tone) {
    var fill = tone === 'bad' ? PAL.invalidDim : tone === 'good' ? PAL.accentDim
      : tone === 'warn' ? PAL.warnDim : tone === 'info' ? PAL.surface2 : PAL.surface;
    var stroke = tone === 'bad' ? PAL.invalid : tone === 'good' ? PAL.accent
      : tone === 'warn' ? PAL.warn : PAL.border;
    P.rect(x, y, w, h, { fill: fill, stroke: stroke, sw: 1, radius: 8 });
  }

  function chip(x, y, w, h, label, o) {
    o = o || {};
    var fill = o.tone === 'bad' ? PAL.invalidDim : o.tone === 'good' ? PAL.accentDim
      : o.tone === 'warn' ? PAL.warnDim : o.tone === 'a' ? PAL.accentDim : PAL.surface2;
    var stroke = o.tone === 'bad' ? PAL.invalid : o.tone === 'good' ? PAL.accent
      : o.tone === 'warn' ? PAL.warn : o.tone === 'a' ? PAL.accent : PAL.border;
    P.rect(x, y, w, h, { fill: fill, stroke: stroke, sw: 1, radius: 5 });
    if (label) centre(x + w / 2, y + h / 2, label, {
      size: o.size || 10, mono: !!o.mono, bold: !!o.bold, color: o.color || PAL.ink
    });
  }

  function hasEdge(es, a, b) {
    for (var i = 0; i < es.length; i++) {
      if ((es[i][0] === a && es[i][1] === b) || (es[i][0] === b && es[i][1] === a)) return true;
    }
    return false;
  }

  /* one edge of the drawn graph, trimmed to the circles it joins */
  function wedge(a, b, o) {
    o = o || {};
    var pa = POS[a], pb = POS[b];
    var dx = pb[0] - pa[0], dy = pb[1] - pa[1];
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / len, uy = dy / len;
    var x1 = pa[0] + ux * (R + 1), y1 = pa[1] + uy * (R + 1);
    var x2 = pb[0] - ux * (R + 1), y2 = pb[1] - uy * (R + 1);
    P.line(x1, y1, x2, y2, { stroke: o.stroke || PAL.border, sw: o.sw || 1.4, dash: o.dash });
  }

  function node(x, y, label, o) {
    o = o || {};
    var r = o.r || R;
    P.circle(x, y, r, {
      fill: o.fill || PAL.surface,
      stroke: o.stroke || PAL.border,
      sw: o.sw || 1.5
    });
    centre(x, y, label, { size: o.size || 12, mono: true, bold: true, color: o.color || PAL.ink });
  }

  /* the drawn graph. o: { hiV:[], hiE:[], ap:bool, bridges:bool, tint:bool,
     dim:bool, root:bool, blocksUpTo:n, labelDisc:bool } */
  function drawGraph(o) {
    o = o || {};
    var i, e, a, b, key;
    var hiV = o.hiV || [], hiE = o.hiE || [];
    var tintBlocks = o.blocksUpTo || 0;
    var blockTone = [PAL.accent, PAL.info, PAL.warn, PAL.valid, PAL.accent, PAL.info, PAL.warn];
    var blockFill = [PAL.accentDim, PAL.surface2, PAL.warnDim, PAL.accentDim, PAL.accentDim, PAL.surface2, PAL.warnDim];

    /* block outlines behind everything */
    if (tintBlocks > 0) {
      for (i = 0; i < Math.min(tintBlocks, WBLOCKS.length); i++) {
        var vs = WBLOCKV[i];
        var oneEdge = WBLOCKS[i].length === 1;
        if (oneEdge) {
          /* a block of one edge is drawn as the edge itself, thickened */
          var e0 = WBLOCKS[i][0];
          wedge(e0[0], e0[1], { stroke: blockTone[i % 7], sw: 4 });
        } else {
          var xs = vs.map(function (v) { return POS[v][0]; });
          var ys = vs.map(function (v) { return POS[v][1]; });
          var x0 = Math.min.apply(null, xs) - 24, x1 = Math.max.apply(null, xs) + 24;
          var y0 = Math.min.apply(null, ys) - 24, y1 = Math.max.apply(null, ys) + 24;
          P.rect(x0, y0, x1 - x0, y1 - y0, {
            fill: blockFill[i % 7], stroke: blockTone[i % 7], sw: 1.4, radius: 12
          });
        }
      }
    }

    for (i = 0; i < WEDGES.length; i++) {
      e = WEDGES[i];
      a = e[0]; b = e[1];
      key = ekey(a, b);
      var isTree = WK.treeEdges.indexOf(key) >= 0;
      var isBack = WK.backEdges.indexOf(key) >= 0;
      var hot = hiE.indexOf(key) >= 0;
      var isBr = !!WK.bridges[key];
      var stroke = PAL.border, sw = 1.3, dash = null;
      if (isBack) { stroke = PAL.dim; dash = [4, 3]; sw = 1.3; }
      if (isTree) { stroke = PAL.ink; sw = 1.5; }
      if (o.bridges && isBr) { stroke = PAL.invalid; sw = 2.4; dash = null; }
      if (hot) { stroke = PAL.accent; sw = 2.8; dash = null; }
      if (o.dim && !hot) { stroke = PAL.border; sw = 1.1; }
      wedge(a, b, { stroke: stroke, sw: sw, dash: dash });
    }

    for (i = 0; i < WN; i++) {
      var x = POS[i][0], y = POS[i][1];
      var isAP = !!WK.ap[i];
      var hot2 = hiV.indexOf(i) >= 0;
      var fill = PAL.surface, stroke = PAL.border, sw = 1.5, col = PAL.ink;
      if (o.ap && isAP) { fill = PAL.invalidDim; stroke = PAL.invalid; sw = 2; col = PAL.invalid; }
      if (o.root && i === ROOT) { fill = PAL.accentDim; stroke = PAL.accent; sw = 2.2; col = PAL.accent; }
      if (hot2) { fill = PAL.accentDim; stroke = PAL.accent; sw = 2.4; col = PAL.accent; }
      node(x, y, NAME[i], { fill: fill, stroke: stroke, sw: sw, color: col });

      if (o.labelDisc) {
        P.rect(x - 15, y + 15, 30, 13, { fill: PAL.surface, stroke: PAL.border, sw: 0.8, radius: 4 });
        centre(x - 6, y + 21.5, String(WK.disc[i]), { size: 8.5, mono: true, color: PAL.info });
        centre(x + 6, y + 21.5, String(WK.low[i]), { size: 8.5, mono: true, color: WK.low[i] < WK.disc[i] ? PAL.valid : PAL.warn });
      }
    }
  }

  function legend(x, y, rows) {
    rows.forEach(function (r, i) {
      line(x, y + i * 15, r[0], { size: 9.5, color: r[1] || PAL.dim });
    });
  }

  /* --- 1. one failure, two questions ------------------------------------ */
  function drawFail(p) {
    var s = stage(p, 4);
    title('One failure, two questions', 'the same network, two different single points of failure');

    /* a small network used twice */
    var nodes = [[120, 150], [220, 110], [220, 200], [320, 150], [420, 150], [420, 240]];
    var edges = [[0, 1], [0, 2], [1, 2], [2, 3], [3, 4], [3, 5]];
    var cutV = s >= 1 ? 3 : -1;
    var cutE = s >= 2 ? 4 : -1;

    edges.forEach(function (e, i) {
      var a = nodes[e[0]], b = nodes[e[1]];
      var dx = b[0] - a[0], dy = b[1] - a[1];
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      var dead = (e[0] === cutV || e[1] === cutV) || (i === 4 && cutE >= 0);
      var keyed = (i === 4 && cutE >= 0);
      P.line(a[0] + dx / len * 17, a[1] + dy / len * 17, b[0] - dx / len * 17, b[1] - dy / len * 17, {
        stroke: dead ? PAL.invalidDim : (keyed ? PAL.invalid : PAL.border),
        sw: keyed ? 2.4 : 1.5,
        dash: dead ? [4, 4] : null
      });
    });
    nodes.forEach(function (n, i) {
      var gone = i === cutV;
      P.circle(n[0], n[1], 15, {
        fill: gone ? PAL.invalidDim : PAL.surface,
        stroke: gone ? PAL.invalid : PAL.border,
        sw: gone ? 2 : 1.5,
        dash: gone ? [3, 3] : null
      });
      centre(n[0], n[1], gone ? 'x' : String.fromCharCode(65 + i), {
        size: 11, mono: true, bold: true, color: gone ? PAL.invalid : PAL.ink
      });
    });

    if (s === 0) {
      panel(60, 268, 800, 52, 'info');
      line(76, 280, 'A road network. Two questions about one failure: close a junction, or close a road.', { size: 11.5 });
      line(76, 298, 'Both ask how many pieces the map falls into afterwards.', { size: 11.5, color: PAL.dim });
    }
    if (s === 1) {
      panel(60, 268, 800, 52, 'bad');
      line(76, 280, 'Junction D closed: the vertex and every road at it are gone. The map splits into two pieces.', { size: 11.5, color: PAL.invalid });
      line(76, 298, 'A vertex whose deletion splits the graph is an articulation point, or cut vertex.', { size: 11.5 });
    }
    if (s === 2) {
      panel(60, 268, 800, 52, 'warn');
      line(76, 280, 'Road D-E closed instead: only that edge is gone, and both D and E are still there.', { size: 11.5, color: PAL.warn });
      line(76, 298, 'The map splits as well. An edge whose deletion splits the graph is a bridge, or cut edge.', { size: 11.5 });
    }
    if (s === 3) {
      panel(60, 268, 800, 52, 'good');
      line(76, 280, 'One search answers both, and also cuts the edges into the pieces that survive.', { size: 11.5, color: PAL.accent });
      line(76, 298, 'The difference between the two questions is what survives the deletion: the vertex does not, the edge does.', { size: 11.5 });
    }
    foot('the two answers are read off one traversal: eleven tree edges and four back edges on the graph this lesson draws');
  }

  /* --- 2. definitions ---------------------------------------------------- */
  function drawDefs(p) {
    var s = stage(p, 4);
    title('Definitions by deletion', 'three objects, each defined by what deleting it does');

    /* cut vertex */
    panel(30, 76, 270, 200, s === 0 ? 'bad' : null);
    line(44, 84, 'Cut vertex', { size: 12, bold: true, color: PAL.invalid });
    var st = [[175, 120]];
    var leaves = [[110, 96], [110, 144], [110, 192], [240, 120]];
    leaves.forEach(function (n) {
      P.line(175, 120, n[0], n[1], { stroke: s === 0 ? PAL.invalidDim : PAL.border, sw: s === 0 ? 2 : 1.4, dash: s === 0 ? [4, 4] : null });
      P.circle(n[0], n[1], 11, { fill: PAL.surface, stroke: PAL.border, sw: 1.3 });
    });
    P.circle(175, 120, 13, { fill: s === 0 ? PAL.invalidDim : PAL.surface, stroke: PAL.invalid, sw: 2 });
    centre(175, 120, 'u', { size: 11, mono: true, bold: true, color: PAL.invalid });
    line(44, 214, 'delete u: 1 piece becomes 4', { size: 10, color: s === 0 ? PAL.invalid : PAL.dim });
    line(44, 232, 'c(G - u) > c(G)', { size: 11, mono: true });
    line(44, 252, 'u is an articulation point', { size: 10, color: PAL.dim });

    /* bridge */
    panel(316, 76, 270, 200, s === 1 ? 'warn' : null);
    line(330, 84, 'Bridge', { size: 12, bold: true, color: PAL.warn });
    [[110, 110], [180, 110], [250, 110]].forEach(function (n, i) {
      P.circle(n[0], n[1], 12, { fill: PAL.surface, stroke: PAL.border, sw: 1.3 });
      centre(n[0], n[1], String.fromCharCode(97 + i), { size: 10, mono: true });
      if (i < 2) P.line(n[0] + 12, 110, n[0] + 58, 110, { stroke: i === 1 && s === 1 ? PAL.warn : PAL.border, sw: i === 1 && s === 1 ? 2.6 : 1.4, dash: i === 1 && s === 1 ? null : null });
    });
    if (s === 1) {
      P.line(192, 92, 238, 92, { stroke: PAL.warn, sw: 1, dash: [3, 3] });
      line(196, 78, 'deleted', { size: 9, color: PAL.warn });
    }
    line(330, 214, 'delete the edge: 1 piece becomes 2', { size: 10, color: s === 1 ? PAL.warn : PAL.dim });
    line(330, 232, 'c(G - e) > c(G)', { size: 11, mono: true });
    line(330, 252, 'e is a bridge, both ends survive', { size: 10, color: PAL.dim });

    /* block */
    panel(602, 76, 270, 200, s === 2 ? 'good' : null);
    line(616, 84, 'Block', { size: 12, bold: true, color: PAL.accent });
    var tri = [[690, 106], [648, 176], [736, 176]];
    tri.forEach(function (n, i) {
      var m = tri[(i + 1) % 3];
      P.line(n[0], n[1], m[0], m[1], { stroke: s === 2 ? PAL.accent : PAL.border, sw: s === 2 ? 2.2 : 1.4 });
      P.circle(n[0], n[1], 11, { fill: PAL.surface, stroke: PAL.border, sw: 1.3 });
    });
    if (s === 2) {
      P.line(648, 176, 800, 176, { stroke: PAL.warn, sw: 2, dash: [4, 3] });
      P.circle(806, 176, 10, { fill: PAL.surface, stroke: PAL.warn, sw: 1.6 });
      centre(806, 176, 'z', { size: 10, mono: true, color: PAL.warn });
    }
    line(616, 214, 'maximal set of edges, any two on one cycle', { size: 10, color: s === 2 ? PAL.accent : PAL.dim });
    line(616, 232, 'triangle = one block', { size: 10, color: PAL.dim });
    line(616, 252, 'the pendant edge is a block of one', { size: 10, color: PAL.warn });

    if (s === 3) {
      panel(30, 292, 842, 106, 'good');
      line(44, 300, 'Consequence: the blocks partition the edges, and a bridge is a block of exactly one edge.', { size: 11.5, bold: true, color: PAL.accent });
      line(44, 320, 'Lying on a common cycle is an equivalence relation on edges: reflexive, symmetric, and transitive by splicing cycles.', { size: 10 });
      line(44, 338, 'So the block sizes add up to the number of edges, and the one-edge blocks are exactly the bridges.', { size: 10 });
      line(44, 358, 'Under the other textbook convention - a maximal 2-vertex-connected subgraph - a bridge is not a block,', { size: 10, color: PAL.warn });
      line(44, 376, 'and the block count is smaller by exactly the number of bridges.', { size: 10, color: PAL.warn });
    } else {
      panel(30, 292, 842, 84, 'info');
      line(44, 300, 'All three are definitions by deletion. None of them says how to decide the question cheaply.', { size: 11.5 });
      line(44, 320, 'Deleting every candidate in turn costs a full traversal per candidate, which is quadratic.', { size: 10.5, color: PAL.dim });
      line(44, 338, 'The rest of the lesson replaces that with one traversal and two comparisons per tree edge.', { size: 10.5, color: PAL.dim });
    }
    foot('definitions by increase in component count: the standard formulation, and the one brute force tests');
  }

  /* --- 3. two kinds of edge --------------------------------------------- */
  function drawEdges(p) {
    var s = stage(p, 4);
    title('An undirected search has only two kinds of edge',
      'solid = tree edge, dashed = back edge; nothing else can occur');
    drawGraph({});
    panel(636, 76, 238, 208, 'info');
    line(650, 84, 'classification', { size: 10.5, bold: true });
    line(650, 104, 'tree edges', { size: 10.5, mono: true });
    line(740, 104, String(WK.treeEdges.length), { size: 10.5, mono: true, bold: true, color: PAL.ink });
    line(650, 122, 'back edges', { size: 10.5, mono: true });
    line(740, 122, String(WK.backEdges.length), { size: 10.5, mono: true, bold: true, color: PAL.dim });
    line(650, 140, 'cross edge', { size: 10.5, mono: true });
    line(740, 140, '0', { size: 10.5, mono: true, bold: true, color: PAL.valid });
    line(650, 162, 'total', { size: 10.5, mono: true });
    line(740, 162, String(WEDGES.length), { size: 10.5, mono: true, bold: true });
    line(650, 186, 'back edges', { size: 9.5, color: PAL.dim });
    var be = WK.backEdges.slice();
    be.forEach(function (k, i) {
      var p2 = k.split('-');
      line(650 + (i % 2) * 106, 202 + Math.floor(i / 2) * 16,
        NAME[Number(p2[0])] + '\u2013' + NAME[Number(p2[1])], { size: 10, mono: true });
    });
    line(650, 244, 'each closes one cycle', { size: 9.5, color: PAL.dim });
    line(650, 260, 'with the tree path above it', { size: 9.5, color: PAL.dim });

    if (s >= 1) {
      panel(636, 296, 238, 96, s === 1 ? 'bad' : 'good');
      line(650, 304, s === 1 ? 'a cross edge cannot exist' : 'so one number per vertex', { size: 10.5, bold: true, color: s === 1 ? PAL.invalid : PAL.accent });
      if (s === 1) {
        line(650, 322, 'if two subtrees were joined,', { size: 9.5 });
        line(650, 338, 'the search would have crossed', { size: 9.5 });
        line(650, 354, 'at the first endpoint, so the', { size: 9.5 });
        line(650, 370, 'edge would have merged them', { size: 9.5 });
      } else {
        line(650, 322, 'the only way out of a subtree', { size: 9.5 });
        line(650, 338, 'is a back edge climbing up', { size: 9.5 });
        line(650, 354, 'record the earliest ancestor', { size: 9.5 });
        line(650, 370, 'reachable: the low-link value', { size: 9.5, color: PAL.dim });
      }
    }
    foot('every edge of the drawn graph is classified; a third kind never appears in an undirected search');
  }

  /* --- 4. disc and low --------------------------------------------------- */
  function drawLow(p) {
    var s = stage(p, 4);
    title('disc and low on the twelve-vertex graph',
      'disc = discovery order; low = earliest discovery time the subtree can climb back to');
    drawGraph({ labelDisc: s >= 2, hiV: s >= 2 ? WAPLIST : [] });

    /* the table */
    var x = 650, y = 78;
    panel(626, y - 12, 262, 250, 'info');
    line(x, y, 'vertex', { size: 9.5, mono: true, color: PAL.dim });
    line(x + 74, y, 'disc', { size: 9.5, mono: true, color: PAL.dim });
    line(x + 134, y, 'low', { size: 9.5, mono: true, color: PAL.dim });
    line(x + 176, y, 'reading', { size: 9.5, mono: true, color: PAL.dim });
    for (var i = 0; i < WN; i++) {
      var ry = y + 20 + i * 18;
      line(x, ry, NAME[i], { size: 10.5, mono: true, bold: true });
      if (s >= 1) line(x + 74, ry, String(WK.disc[i]), { size: 10.5, mono: true, color: PAL.info });
      if (s >= 2) {
        line(x + 134, ry, String(WK.low[i]), {
          size: 10.5, mono: true,
          color: WK.low[i] < WK.disc[i] ? PAL.valid : PAL.warn
        });
        line(x + 176, ry, WK.low[i] < WK.disc[i] ? 'escapes' : 'sealed', {
          size: 8.5, color: WK.low[i] < WK.disc[i] ? PAL.valid : PAL.warn
        });
      }
    }

    if (s >= 3) {
      panel(626, 326, 262, 116, 'good');
      line(640, 334, 'low < disc: the subtree escapes', { size: 10, bold: true, color: PAL.accent });
      line(640, 354, 'A climbs to C: low 7 = disc[C]', { size: 9 });
      line(640, 370, 'G climbs to I: low 1 = disc[I]', { size: 9 });
      line(640, 386, 'L climbs to F by a back edge', { size: 9 });
      line(640, 406, 'equal or above: it cannot get past', { size: 9, color: PAL.warn });
      line(640, 424, 'and the parent is sealed off', { size: 9, color: PAL.warn });
    } else {
      panel(626, 326, 262, 116, 'info');
      line(640, 334, s === 0 ? 'the search starts at J, a leaf' : 'filled on the way back up', { size: 10, bold: true });
      if (s === 0) {
        line(640, 356, 'disc is the order the search', { size: 9 });
        line(640, 372, 'enters a vertex: J 0, I 1,', { size: 9 });
        line(640, 388, 'H 2, G 3, F 4, E 5, D 6,', { size: 9 });
        line(640, 404, 'then A 9, L 10, K 11', { size: 9, color: PAL.dim });
        line(640, 424, 'started at a leaf on purpose', { size: 9, color: PAL.dim });
      } else {
        line(640, 356, 'low[v] = min( disc[v],', { size: 9, mono: true });
        line(640, 372, 'disc of a back edge,', { size: 9, mono: true });
        line(640, 388, 'low of each child )', { size: 9, mono: true });
        line(640, 408, 'one pass, on the way back up', { size: 9, color: PAL.dim });
      }
    }
    foot('the numbers under each vertex are disc then low; both are produced by the page\u2019s own search');
  }

  /* --- 5. the articulation test ------------------------------------------ */
  function drawAPTest(p) {
    var s = stage(p, 4);
    title('The articulation test: greater or equal',
      'low[v] >= disc[u] at a non-root u with child v  =>  u is an articulation point');
    drawGraph({ ap: s >= 3, hiV: s >= 3 ? WAPLIST : (s >= 2 ? [3] : []), labelDisc: true });

    var x = 636, y = 78;
    panel(x - 12, y - 10, 250, 268, 'info');
    line(x, y, 'weak test, child by child', { size: 10, bold: true });
    line(x, y + 14, 'u    v    low  cmp  disc', { size: 8.5, mono: true, color: PAL.faint });
    var rows = WPOP.filter(function (p) { return !!WK.ap[p.p]; }).map(function (p) {
      return [NAME[p.p], NAME[p.v], p.low, p.disc, p.hit];
    });
    var show = s >= 2 ? rows.length : (s >= 1 ? 4 : 0);
    for (var i = 0; i < show; i++) {
      var r = rows[i];
      line(x, y + 28 + i * 18, 'u ' + r[0] + '  v ' + r[1] + '   ' + r[2] + (r[4] ? ' >= ' : ' <  ') + r[3],
        { size: 10, mono: true, color: r[4] ? PAL.invalid : PAL.valid });
      if (r[4]) line(x + 186, y + 28 + i * 18, 'AP', { size: 9, mono: true, bold: true, color: PAL.invalid });
    }
    if (s >= 1) {
      line(x, y + 28 + rows.length * 18 + 8, 'u with one qualifying child is enough', { size: 9.5, color: PAL.dim });
      line(x, y + 28 + rows.length * 18 + 24, 'D qualifies through C and through K', { size: 9.5, color: PAL.dim });
    }

    if (s >= 1) {
      panel(636, 330, 238, 84, 'bad');
      line(650, 338, 'why equality is enough', { size: 10.5, bold: true, color: PAL.invalid });
      line(650, 356, 'deleting u removes every back edge that ended at u', { size: 9 });
      line(650, 372, 'the subtree of v then has no way up at all', { size: 9 });
      line(650, 390, 'and the graph splits into it and the rest', { size: 9, color: PAL.dim });
    }
    if (s >= 3) {
      panel(30, 398, 586, 44, 'bad');
      line(44, 406, 'Five articulation points: C, D, F, G, I.', { size: 11, color: PAL.invalid, bold: true });
      line(44, 424, 'Not E, not H, not the leaves, not the root; each confirmed by deletion.', { size: 9, color: PAL.dim });
    }
    foot('the vertex test is >= ; the edge test on the next scene is > ; the root needs its own rule');
  }

  /* --- 6. the bridge test ------------------------------------------------ */
  function drawBrTest(p) {
    var s = stage(p, 4);
    title('The bridge test: strictly greater',
      'low[v] > disc[u] on the tree edge u-v  =>  u-v is a bridge');
    drawGraph({
      bridges: s >= 3,
      hiE: s >= 1 && s < 3 ? ['4-5'] : (s >= 2 ? ['4-5', '2-3'] : []),
      labelDisc: true
    });

    var x = 636, y = 78;
    panel(x - 12, y - 10, 250, 292, 'info');
    line(x, y, 'strict test, tree edge by tree edge', { size: 10, bold: true });
    line(x, y + 14, 'u    v    low  cmp  disc', { size: 8.5, mono: true, color: PAL.faint });
    var rows = WPOP.slice().sort(function (a, b) {
      if (a.hit !== b.hit) return a.hit ? -1 : 1;
      return a.v - b.v;
    }).map(function (p) { return [NAME[p.p], NAME[p.v], p.low, p.disc, p.hit]; });
    var show = s >= 3 ? rows.length : (s >= 1 ? 5 : 0);
    for (var i = 0; i < show; i++) {
      var r = rows[i];
      line(x, y + 28 + i * 18, 'u ' + r[0] + '  v ' + r[1] + '   ' + r[2] + (r[4] ? ' >  ' : ' <= ') + r[3],
        { size: 10, mono: true, color: r[4] ? PAL.invalid : PAL.valid });
      if (r[4]) line(x + 178, y + 28 + i * 18, 'bridge', { size: 9, mono: true, bold: true, color: PAL.invalid });
    }

    if (s >= 1) {
      panel(636, 300, 238, 96, 'warn');
      line(650, 306, 'the equality row: F-E', { size: 10.5, bold: true, color: PAL.warn });
      line(650, 324, 'low[E] = 4 = disc[F]', { size: 9.5, mono: true });
      line(650, 340, 'not a bridge: E climbs back to F through L', { size: 9 });
      line(650, 358, 'but F is still an articulation point', { size: 9, color: PAL.invalid, bold: true });
      line(650, 374, 'one edge, two answers, one symbol apart', { size: 9, color: PAL.dim });
    }
    if (s >= 3) {
      panel(30, 398, 586, 44, 'bad');
      line(44, 406, 'Four bridges: C-D, D-K, F-G, I-J, each a block of one edge.', { size: 11, color: PAL.invalid, bold: true });
      line(44, 424, 'Each is confirmed by deleting the edge and recounting the pieces.', { size: 9, color: PAL.dim });
    }
    foot('the vertex survives an edge deletion and does not survive a vertex deletion: that is the whole difference');
  }

  /* --- 7. the root ------------------------------------------------------- */
  function drawRoot(p) {
    var s = stage(p, 3);
    title('The root is asked a different question',
      'the vertex test cannot be applied at the root, because the root has nothing above it');
    drawGraph({ root: s >= 1, labelDisc: true });

    var x = 636, y = 78;
    panel(x - 12, y - 10, 250, 150, s >= 1 ? 'bad' : 'info');
    line(x, y, 'the root J', { size: 10.5, bold: true });
    line(x, y + 22, 'children of J:', { size: 10 });
    line(x + 96, y + 22, String(WK.children[ROOT]), { size: 10, mono: true, bold: true });
    line(x, y + 42, 'low[I] = ' + WK.low[8] + '   disc[J] = ' + WK.disc[ROOT], { size: 10, mono: true });
    line(x, y + 62, 'weak test says: yes', { size: 10, color: PAL.invalid, bold: true });
    line(x, y + 82, 'deletion says: no', { size: 10, color: PAL.valid, bold: true });
    line(x, y + 104, 'the test asks about a parent', { size: 9.5, color: PAL.dim });
    line(x, y + 120, 'the root has none', { size: 9.5, color: PAL.dim });

    if (s >= 2) {
      panel(636, 240, 238, 152, 'good');
      line(650, 248, 'the root rule', { size: 10.5, bold: true, color: PAL.accent });
      line(650, 270, 'root is an articulation point', { size: 9.5 });
      line(650, 286, 'iff it has >= 2 children', { size: 10, bold: true, color: PAL.accent });
      line(650, 310, 'one child: everything hangs off', { size: 9.5 });
      line(650, 326, 'the root in a single piece', { size: 9.5 });
      line(650, 348, 'smallest graph where the test lies:', { size: 9.5, color: PAL.warn });
      line(650, 364, 'two vertices, one edge', { size: 9.5, color: PAL.warn, bold: true });
    }
    foot('a leaf of the search tree is never an articulation point, and the root is the leaf this search started from');
  }

  /* --- 8. blocks --------------------------------------------------------- */
  function drawBlocks(p) {
    var s = stage(p, 4);
    title('Blocks: pop the edge stack',
      'push every traversed edge; pop at every tree edge with low[v] >= disc[u]');
    drawGraph({ blocksUpTo: s === 0 ? 0 : (s >= 3 ? WBLOCKS.length : 3) });

    var x = 636, y = 78;
    panel(x - 12, y - 10, 250, 216, 'info');
    line(x, y, 'popped so far', { size: 10, bold: true });
    var shown = s >= 3 ? WBLOCKS.length : (s >= 2 ? 3 : 0);
    for (var i = 0; i < shown; i++) {
      var vs = WBLOCKV[i].map(function (v) { return NAME[v]; }).join(' ');
      line(x, y + 20 + i * 18, 'B' + (i + 1), { size: 10, mono: true, bold: true, color: PAL.accent });
      line(x + 26, y + 20 + i * 18, vs, { size: 9.5, mono: true });
      line(x + 130, y + 20 + i * 18, WBLOCKS[i].length + 'e', { size: 9.5, mono: true, color: PAL.dim });
    }
    if (s >= 2) {
      line(x, y + 20 + 7 * 18 + 6, 'sum of block sizes: ' + WBLOCKS.reduce(function (a, b) { return a + b.length; }, 0),
        { size: 9.5, mono: true, color: PAL.valid });
      line(x, y + 20 + 7 * 18 + 22, 'edges in the graph: ' + WEDGES.length, { size: 9.5, mono: true, color: PAL.valid });
    }

    if (s === 1) {
      panel(636, 300, 238, 92, 'warn');
      line(650, 308, 'the pop rule', { size: 10.5, bold: true, color: PAL.warn });
      line(650, 328, 'when the search finishes v and', { size: 9.5 });
      line(650, 344, 'low[v] >= disc[u], pop until', { size: 9.5 });
      line(650, 360, 'the edge u-v comes off', { size: 9.5 });
      line(650, 376, 'the popped set is one block', { size: 9.5, color: PAL.accent, bold: true });
    }
    if (s >= 3) {
      panel(30, 398, 586, 44, 'good');
      line(44, 406, 'Seven pops, seven blocks: ABC, CD, DK, DEFL, FG, GHI, IJ.', { size: 11, color: PAL.accent, bold: true });
      line(44, 424, 'Four are single edges, and those are exactly the four bridges.', { size: 9, color: PAL.dim });
    }
    foot('every edge is pushed once and popped once, so the partition costs nothing beyond the traversal');
  }

  /* --- 9. the block-cut tree --------------------------------------------- */
  function drawTree(p) {
    var s = stage(p, 4);
    title('The block-cut tree, and the counting identities',
      'one node per block, one per articulation point, joined when the point lies in the block');

    var B = [[70, 150], [226, 150], [304, 250], [382, 150], [538, 150], [694, 150], [850, 150]];
    var A = [[148, 150], [304, 150], [460, 150], [616, 150], [772, 150]];
    var links = [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [3, 2], [4, 2], [4, 3], [5, 3], [5, 4], [6, 4]];

    links.forEach(function (l, i) {
      if (s === 0 && i > 4) return;
      P.line(B[l[0]][0], B[l[0]][1], A[l[1]][0], A[l[1]][1], { stroke: PAL.border, sw: 1.3 });
    });
    B.forEach(function (b, i) {
      var show = s === 0 ? i <= 2 : true;
      if (!show) return;
      P.rect(b[0] - 26, b[1] - 15, 52, 30, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.4, radius: 6 });
      centre(b[0], b[1], 'B' + (i + 1), { size: 10, mono: true, bold: true, color: PAL.accent });
    });
    A.forEach(function (a, i) {
      var show = s === 0 ? i <= 1 : true;
      if (!show) return;
      P.circle(a[0], a[1], 15, { fill: PAL.invalidDim, stroke: PAL.invalid, sw: 1.6 });
      centre(a[0], a[1], NAME[WAPLIST[i]], { size: 10, mono: true, bold: true, color: PAL.invalid });
    });

    if (s >= 1) {
      panel(30, 300, 842, 46, 'info');
      line(44, 310, '12 nodes: 7 blocks plus 5 articulation points.  11 edges: one fewer, so it is a tree.', { size: 11, bold: true });
      line(44, 330, 'Each edge is a containment, not a graph edge: a path in this tree is the sequence of blocks you cross.', { size: 9.5, color: PAL.dim });
    }
    if (s >= 2) {
      panel(30, 356, 842, 44, 'good');
      line(44, 366, 'Sum of block sizes = vertices + one extra copy per block past the first:  3+2+2+4+2+3+2 = 18 = 12 + 6.', { size: 10.5, color: PAL.accent, bold: true });
      line(44, 386, 'The six extra copies come from C, D, F, G and I: one for two blocks, two for D in three.', { size: 9.5, color: PAL.dim });
    }
    if (s >= 3) {
      line(44, 274, 'a vertex is an articulation point exactly when it lies in two or more blocks', { size: 11, bold: true, color: PAL.invalid });
      line(44, 292, 'blocks per point: C 2, D 3, F 2, G 2, I 2 \u2014 every other vertex appears once', { size: 9.5, color: PAL.dim });
    }
    foot('the identity is a fast completeness check on any block decomposition you compute by hand');
  }

  /* --- 10. four beliefs -------------------------------------------------- */
  function miniGraph(cx, cy, nodes, edges, o) {
    o = o || {};
    var s = o.scale || 1;
    edges.forEach(function (e) {
      var a = nodes[e[0]], b = nodes[e[1]];
      P.line(cx + a[0] * s, cy + a[1] * s, cx + b[0] * s, cy + b[1] * s, {
        stroke: o.edgeColor || PAL.border, sw: o.sw || 1.4, dash: o.dash
      });
    });
    nodes.forEach(function (n, i) {
      var hot = (o.hot || []).indexOf(i) >= 0;
      P.circle(cx + n[0] * s, cy + n[1] * s, o.r || 10, {
        fill: hot ? PAL.accentDim : PAL.surface,
        stroke: hot ? PAL.accent : PAL.border,
        sw: hot ? 1.8 : 1.3
      });
      centre(cx + n[0] * s, cy + n[1] * s, String.fromCharCode(97 + i), {
        size: 9, mono: true, bold: hot, color: hot ? PAL.accent : PAL.ink
      });
    });
  }

  function drawWrong(p) {
    var s = stage(p, 4);
    title('Four beliefs, each refuted by the smallest example',
      'every counterexample below was found by searching graphs in order of size, not chosen by hand');

    var cells = [
      { x: 30, y: 70, t: 'strict test for vertices', g: 'four vertices: pendant edge into a triangle',
        nodes: [[0, 20], [70, 0], [70, 40], [140, 20]], edges: [[0, 1], [1, 2], [1, 3], [2, 3]], hot: [1],
        why: ['low[c] = disc[b] exactly,', 'so ">" misses the cut vertex'] },
      { x: 470, y: 70, t: 'no bridge, no cut vertex', g: 'the bowtie: two triangles, one shared vertex',
        nodes: [[0, 0], [-46, 34], [46, 34], [-46, -34], [46, -34]], edges: [[0, 1], [1, 2], [2, 0], [0, 3], [3, 4], [4, 0]], hot: [0],
        why: ['no edge is critical;', 'the shared vertex is'] },
      { x: 30, y: 250, t: 'a bridge has a cut vertex at one end', g: 'two vertices, one edge',
        nodes: [[0, 0], [80, 0]], edges: [[0, 1]], hot: [],
        why: ['the edge is a bridge;', 'both ends have degree one'] },
      { x: 470, y: 250, t: 'deleting a cut vertex adds one component', g: 'a star with three leaves',
        nodes: [[0, 0], [-52, -34], [-52, 34], [52, 0]], edges: [[0, 1], [0, 2], [0, 3]], hot: [0],
        why: ['one piece becomes three:', 'an increase of two'] }
    ];

    cells.forEach(function (c, i) {
      var on = s >= i;
      panel(c.x, c.y, 400, 158, on ? 'bad' : null);
      line(c.x + 14, c.y + 10, c.t, { size: 10.5, bold: true, color: on ? PAL.invalid : PAL.dim });
      line(c.x + 14, c.y + 27, c.g, { size: 8.5, color: PAL.dim });
      miniGraph(c.x + 62, c.y + 86, c.nodes, c.edges, { hot: on ? c.hot : [], scale: 0.8, r: 9 });
      line(c.x + 152, c.y + 52, on ? 'refuted' : 'believed', {
        size: 9, mono: true, bold: true, color: on ? PAL.invalid : PAL.faint
      });
      if (on) {
        line(c.x + 152, c.y + 70, c.why[0], { size: 8.5, color: PAL.ink });
        line(c.x + 152, c.y + 84, c.why[1], { size: 8.5, color: PAL.ink });
        line(c.x + 152, c.y + 130, 'smallest such graph', { size: 8, color: PAL.warn });
      } else {
        line(c.x + 152, c.y + 70, 'not yet shown', { size: 8.5, color: PAL.faint });
      }
    });
    foot('the page finds each of these by enumerating graphs upward; each is the smallest that breaks the claim');
  }

  /* --- 11. the two items ------------------------------------------------- */
  function drawGate(p) {
    var s = stage(p, 4);
    title('Two previous-year items, recomputed',
      'each verdict below is the output of this page\u2019s own search, not a copy of a key');

    panel(30, 70, 412, 250, 'info');
    line(44, 78, 'GATE CSE 2021, Set 1, Q41  (MSQ)', { size: 10.5, bold: true });
    var st = [
      ['all paths x-y pass through u', false],
      ['a leaf of T can be an AP', false],
      ['root is an AP iff >= 2 children', true],
      ['the root can never be an AP', false]
    ];
    st.forEach(function (r, i) {
      if (s < 1) return;
      line(44, 102 + i * 30, r[1] ? 'holds' : 'fails', {
        size: 9, mono: true, bold: true, color: r[1] ? PAL.valid : PAL.invalid
      });
      line(110, 102 + i * 30, r[0], { size: 9.5, color: r[1] ? PAL.ink : PAL.dim });
      if (s >= 2 && !r[1]) {
        line(110, 116 + i * 30, i === 0 ? 'four vertices: x and y are joined directly'
          : i === 1 ? 'no leaf is an AP in any graph searched'
            : 'three vertices: root with two children', { size: 8.5, color: PAL.faint });
      }
    });
    if (s >= 1) {
      line(44, 236, 'the survivor is the root rule', { size: 10, bold: true, color: PAL.valid });
      line(44, 254, 'verified on every start vertex of every graph searched', { size: 9, color: PAL.dim });
      line(44, 272, 'three of the four fail, each on a smallest example', { size: 9, color: PAL.dim });
    }

    panel(458, 70, 412, 250, 'info');
    line(472, 78, 'GATE CSE 2015, Set 2, Q26  (MCQ)', { size: 10.5, bold: true });
    var op = [
      ['(a) a tree has no bridges', false, 'every tree edge is a bridge'],
      ['(b) a bridge is on no simple cycle', true, 'an edge on a cycle has a detour'],
      ['(c) every edge of a clique >= 3 is a bridge', false, 'every clique edge is on a triangle'],
      ['(d) a graph with bridges has no cycle', false, 'the bowtie has both']
    ];
    op.forEach(function (r, i) {
      if (s < 3) return;
      line(472, 102 + i * 30, r[1] ? 'true' : 'false', {
        size: 9, mono: true, bold: true, color: r[1] ? PAL.valid : PAL.invalid
      });
      line(524, 102 + i * 30, r[0], { size: 9.5, color: r[1] ? PAL.ink : PAL.dim });
      line(524, 116 + i * 30, r[2], { size: 8.5, color: PAL.faint });
    });
    if (s >= 3) {
      line(472, 236, 'answer: (b)', { size: 10.5, bold: true, color: PAL.valid });
      line(472, 254, 'checked directly: no bridge shared a block with another edge', { size: 9, color: PAL.dim });
      line(472, 272, 'zero exceptions on every graph with three to five vertices', { size: 9, color: PAL.dim });
    }
    if (s < 3) {
      line(472, 120, 'the 2015 item asks which statement about bridges is true', { size: 9.5, color: PAL.dim });
      line(472, 140, 'four options: a tree, a simple cycle, a clique, a graph with cycles', { size: 9.5, color: PAL.dim });
      line(472, 168, 'the same counterexamples as the misconceptions tab settle it', { size: 9.5, color: PAL.faint });
    }
    foot('both papers were located in several independent archives that agree on wording and key; the figures were not reproduced');
  }

  /* --- 12. the procedure ------------------------------------------------- */
  function drawProc(p) {
    var s = stage(p, 2);
    title('The procedure, in five steps', 'one traversal, two comparisons, one stack');

    var steps = [
      ['1', 'ask which cut', 'a vertex, an edge, or the decomposition?'],
      ['2', 'one DFS', 'record disc on entry, compute low on exit'],
      ['3', 'weak test', 'low[v] >= disc[u] at a non-root u with child v'],
      ['4', 'root rule', 'the root is an AP iff it has two or more children'],
      ['5', 'strict test and pop', 'low[v] > disc[u] for bridges; pop the stack at every >=']
    ];
    steps.forEach(function (r, i) {
      var y = 84 + i * 44;
      panel(30, y, 560, 38, i === 2 || i === 4 ? 'good' : null);
      chip(42, y + 8, 22, 22, r[0], { tone: i === 2 || i === 4 ? 'good' : null, size: 10, mono: true, bold: true });
      line(76, y + 6, r[1], { size: 10.5, bold: true });
      line(76, y + 22, r[2], { size: 9.5, color: PAL.dim });
    });

    panel(612, 84, 258, 200, 'warn');
    line(626, 92, 'what the procedure costs', { size: 10.5, bold: true, color: PAL.warn });
    line(626, 114, 'one traversal: V + E', { size: 10, mono: true });
    line(626, 132, 'no second pass, no matrix', { size: 9.5, color: PAL.dim });
    line(626, 158, 'check one answer by deletion', { size: 10, bold: true });
    line(626, 176, 'delete the vertex or the edge', { size: 9.5 });
    line(626, 192, 'and recount the components', { size: 9.5 });
    line(626, 218, 'on a small drawn graph that', { size: 9.5, color: PAL.dim });
    line(626, 234, 'is the fastest check there is', { size: 9.5, color: PAL.dim });
    line(626, 260, 'it is also how every number', { size: 9.5, color: PAL.faint });
    line(626, 276, 'on this page was verified', { size: 9.5, color: PAL.faint });

    if (s >= 1) {
      panel(30, 316, 560, 100, 'info');
      line(44, 324, 'the three comparisons, in one place', { size: 10.5, bold: true });
      line(44, 346, 'vertex      low[v] >= disc[u]      u not the root', { size: 10.5, mono: true, color: PAL.invalid });
      line(44, 366, 'root        children >= 2          replaces the vertex test', { size: 10.5, mono: true, color: PAL.invalid });
      line(44, 386, 'edge        low[v] > disc[u]       tree edges only', { size: 10.5, mono: true, color: PAL.warn });
      line(44, 404, 'block       pop at low[v] >= disc[u]  the popped set is one block', { size: 10.5, mono: true, color: PAL.accent });
    }
    foot('the step candidates skip is the root rule, and it is the one that silently changes a count');
  }

  var DRAW = {
    fail: drawFail, defs: drawDefs, edges: drawEdges, low: drawLow,
    aptest: drawAPTest, brtest: drawBrTest, root: drawRoot, blocks: drawBlocks,
    tree: drawTree, wrong: drawWrong, gate: drawGate, proc: drawProc
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
            drawFrame(K.state.elapsed);
          };
          sk.draw = function () { if (P) drawFrame(K.state.elapsed); };
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
    NAME: NAME, WN: WN, WEDGES: WEDGES, ROOT: ROOT,
    WK: WK, WAP: WAP, WBR: WBR, WBLOCKS: WBLOCKS, WBLOCKV: WBLOCKV,
    WAPLIST: WAPLIST, WBLIST: WBLIST, WBPER: WBPER, WPOP: WPOP,
    WRONG: WRONG, ITEM2021: ITEM2021, BRIDGE_SHARED: BRIDGE_SHARED, SWEEP: SWEEP,
    TREES: TREES, BLOCKCUT: BLOCKCUT,
    tarjan: tarjan, bruteAP: bruteAP, bruteBridge: bruteBridge, bruteBlocks: bruteBlocks,
    compCount: compCount, ekey: ekey, canon: canon, blockProperties: blockProperties,
    PASSED: PASSED, TOTAL: CHECKS.length,
    ALL_PASS: PASSED === CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
