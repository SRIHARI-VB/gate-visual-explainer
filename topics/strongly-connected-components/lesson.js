/* ==========================================================================
   strongly-connected-components - model, validation, render.

   Layer 1  model      : a directed graph is an adjacency list. The components
                         are the classes of mutual reachability. Four
                         computations produce them - Kosaraju's two passes,
                         Tarjan's low-link pass, the slow definition (transitive
                         closure), and the condensation built from any of them.
                         The condensation is the DAG that survives.
   Layer 2  validation : the four computations are compared with each other on
                         every directed graph with 2, 3 and 4 vertices (4,164
                         graphs) and on 1,600 seeded random graphs with 5 to 8
                         vertices. The finishing-order lemma, the acyclicity of
                         the condensation, the transpose invariance and the
                         Eswaran-Tarjan edge count are each checked as their own
                         property, and the two wrong variants of Kosaraju are
                         refuted by the smallest graph on which they fail, found
                         by search.
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

  var NAME = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  var WN = 9;

  /* the drawn graph: four components, and one skip edge that makes the
     condensation a diamond rather than a path */
  var WEDGES = [
    [0, 1], [1, 2], [2, 0],        /* A -> B -> C -> A            component 1 */
    [2, 3],                        /* C -> D                      into 2        */
    [3, 4], [4, 3],                /* D <-> E                     component 2   */
    [4, 5],                        /* E -> F                      into 3        */
    [5, 6], [6, 5],                /* F <-> G                     component 3   */
    [6, 7],                        /* G -> H                      into 4        */
    [7, 8], [8, 7],                /* H <-> I                     component 4   */
    [4, 7]                         /* E -> H                      skip 2 -> 4   */
  ];

  /* where the search starts, deliberately not alphabetical */
  var START = [4, 0, 5];

  function build(n, edges) {
    var adj = [], i;
    for (i = 0; i < n; i++) adj.push([]);
    for (i = 0; i < edges.length; i++) adj[edges[i][0]].push(edges[i][1]);
    return adj;
  }

  function transposeEdges(edges) {
    var out = [], i;
    for (i = 0; i < edges.length; i++) out.push([edges[i][1], edges[i][0]]);
    return out;
  }

  function keyOf(comps) {
    return comps.map(function (c) { return c.slice().sort(function (a, b) { return a - b; }).join(','); })
      .sort().join('|');
  }

  /* ---- Kosaraju -------------------------------------------------------- */
  function kosaraju(n, edges, opts) {
    opts = opts || {};
    var adj = build(n, edges);
    var order = opts.order || (function () { var a = [], i; for (i = 0; i < n; i++) a.push(i); return a; })();
    var d = [], f = [], i;
    for (i = 0; i < n; i++) { d.push(0); f.push(0); }
    var clock = 0, firstPass = [];

    function visit(u) {
      d[u] = ++clock;
      for (var j = 0; j < adj[u].length; j++) {
        var w = adj[u][j];
        if (!d[w]) visit(w);
      }
      f[u] = ++clock;
      firstPass.push(u);
    }
    for (i = 0; i < order.length; i++) if (!d[order[i]]) visit(order[i]);

    var byFinish = firstPass.slice().reverse();
    var seq = opts.wrongOrder ? firstPass.slice() : byFinish;
    var graph = opts.secondPassOnG ? adj : build(n, transposeEdges(edges));

    var seen = [], comps = [], roots = [];
    for (i = 0; i < n; i++) seen.push(false);
    for (i = 0; i < seq.length; i++) {
      var s = seq[i];
      if (seen[s]) continue;
      var comp = [], stack = [s];
      seen[s] = true;
      while (stack.length) {
        var u = stack.pop();
        comp.push(u);
        for (var j = 0; j < graph[u].length; j++) {
          var w = graph[u][j];
          if (!seen[w]) { seen[w] = true; stack.push(w); }
        }
      }
      comp.sort(function (a, b) { return a - b; });
      comps.push(comp);
      roots.push(s);
    }
    var paired = comps.map(function (c, i) { return { comp: c, root: roots[i] }; });
    paired.sort(function (a, b) { return a.comp[0] - b.comp[0]; });
    return {
      comps: paired.map(function (p) { return p.comp; }),
      roots: paired.map(function (p) { return p.root; }),
      d: d, f: f, firstPass: firstPass, byFinish: byFinish
    };
  }

  /* ---- Tarjan ---------------------------------------------------------- */
  function tarjan(n, edges) {
    var adj = build(n, edges);
    var index = [], low = [], onStack = [], i;
    for (i = 0; i < n; i++) { index.push(-1); low.push(0); onStack.push(false); }
    var st = [], next = 0, comps = [];

    function strong(u) {
      index[u] = low[u] = next++;
      st.push(u); onStack[u] = true;
      for (var j = 0; j < adj[u].length; j++) {
        var w = adj[u][j];
        if (index[w] === -1) { strong(w); low[u] = Math.min(low[u], low[w]); }
        else if (onStack[w]) low[u] = Math.min(low[u], index[w]);
      }
      if (low[u] === index[u]) {
        var comp = [], w2;
        do { w2 = st.pop(); onStack[w2] = false; comp.push(w2); } while (w2 !== u);
        comp.sort(function (a, b) { return a - b; });
        comps.push(comp);
      }
    }
    for (i = 0; i < n; i++) if (index[i] === -1) strong(i);
    comps.sort(function (a, b) { return a[0] - b[0]; });
    return { comps: comps, index: index, low: low };
  }

  /* ---- the slow definition: mutual reachability by transitive closure --- */
  function bruteSCC(n, edges) {
    var reach = [], i, j, k;
    for (i = 0; i < n; i++) {
      reach.push([]);
      for (j = 0; j < n; j++) reach[i].push(i === j);
    }
    for (i = 0; i < edges.length; i++) reach[edges[i][0]][edges[i][1]] = true;
    for (k = 0; k < n; k++) for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
      if (reach[i][k] && reach[k][j]) reach[i][j] = true;
    }
    var comp = [], comps = [];
    for (i = 0; i < n; i++) comp.push(-1);
    for (i = 0; i < n; i++) {
      if (comp[i] !== -1) continue;
      var c = [];
      for (j = 0; j < n; j++) if (reach[i][j] && reach[j][i]) { comp[j] = comps.length; c.push(j); }
      comps.push(c);
    }
    return comps;
  }

  /* ---- the condensation ------------------------------------------------- */
  function condensation(n, edges, comps) {
    var cid = [], i;
    for (i = 0; i < n; i++) cid.push(-1);
    for (i = 0; i < comps.length; i++) {
      for (var j = 0; j < comps[i].length; j++) cid[comps[i][j]] = i;
    }
    var seen = {}, out = [];
    for (i = 0; i < edges.length; i++) {
      var a = cid[edges[i][0]], b = cid[edges[i][1]];
      if (a === b) continue;
      var k = a + '>' + b;
      if (seen[k]) continue;
      seen[k] = true;
      out.push([a, b]);
    }
    return { cid: cid, edges: out };
  }

  function isDAG(n, edges) {
    var indeg = [], adj = build(n, edges), i;
    for (i = 0; i < n; i++) indeg.push(0);
    for (i = 0; i < edges.length; i++) indeg[edges[i][1]]++;
    var q = [], seen = 0;
    for (i = 0; i < n; i++) if (!indeg[i]) q.push(i);
    while (q.length) {
      var u = q.pop(); seen++;
      for (var j = 0; j < adj[u].length; j++) if (--indeg[adj[u][j]] === 0) q.push(adj[u][j]);
    }
    return seen === n;
  }

  function topoOrder(n, edges) {
    var indeg = [], adj = build(n, edges), i;
    for (i = 0; i < n; i++) indeg.push(0);
    for (i = 0; i < edges.length; i++) indeg[edges[i][1]]++;
    var q = [], out = [];
    for (i = 0; i < n; i++) if (!indeg[i]) q.push(i);
    while (q.length) {
      var u = q.shift(); out.push(u);
      for (var j = 0; j < adj[u].length; j++) if (--indeg[adj[u][j]] === 0) q.push(adj[u][j]);
    }
    return out.length === n ? out : null;
  }

  /* ---- sources, sinks, isolated components, and Eswaran-Tarjan --------- */
  function srcSinkIso(n, edges) {
    var indeg = [], outdeg = [], i;
    for (i = 0; i < n; i++) { indeg.push(0); outdeg.push(0); }
    for (i = 0; i < edges.length; i++) { outdeg[edges[i][0]]++; indeg[edges[i][1]]++; }
    var s = 0, t = 0, q = 0;
    for (i = 0; i < n; i++) {
      if (!indeg[i] && !outdeg[i]) q++;
      else if (!indeg[i]) s++;
      else if (!outdeg[i]) t++;
    }
    return { s: s, t: t, q: q };
  }

  function etFormula(n, edges) {
    if (n <= 1) return 0;
    var c = srcSinkIso(n, edges);
    return Math.max(c.s, c.t) + c.q;
  }

  /* brute force: try every set of k added edges, k = 1, 2, ... */
  function minEdges(n, edges) {
    if (bruteSCC(n, edges).length === 1) return 0;
    var have = {}, missing = [], i, j;
    for (i = 0; i < edges.length; i++) have[edges[i][0] + '>' + edges[i][1]] = true;
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) if (i !== j && !have[i + '>' + j]) missing.push([i, j]);

    function strong(es) { return bruteSCC(n, es).length === 1; }
    for (var k = 1; k <= n; k++) {
      var chosen = [];
      var found = (function rec(start) {
        if (chosen.length === k) return strong(edges.concat(chosen));
        for (var i2 = start; i2 < missing.length; i2++) {
          chosen.push(missing[i2]);
          if (rec(i2 + 1)) return true;
          chosen.pop();
        }
        return false;
      })(0);
      if (found) return k;
    }
    return n;
  }

  /* ---- the worked graph ------------------------------------------------ */
  var WK = kosaraju(WN, WEDGES, { order: START });
  var WT = tarjan(WN, WEDGES);
  var WB = bruteSCC(WN, WEDGES);
  var WCOND = condensation(WN, WEDGES, WK.comps);
  var WSSI = srcSinkIso(WK.comps.length, WCOND.edges);
  var WET = etFormula(WK.comps.length, WCOND.edges);
  var WBRUTE = minEdges(WN, WEDGES);

  var COMP_OF = [];
  (function () {
    for (var i = 0; i < WN; i++) COMP_OF.push(-1);
    for (var c = 0; c < WK.comps.length; c++) for (var j = 0; j < WK.comps[c].length; j++) COMP_OF[WK.comps[c][j]] = c;
  })();

  /* the largest finish time inside each component */
  var COMP_MAX_FINISH = WK.comps.map(function (c) {
    var m = 0;
    for (var i = 0; i < c.length; i++) m = Math.max(m, WK.f[c[i]]);
    return m;
  });

  var MAX_FINISH_VERTEX = (function () {
    var best = 0, i;
    for (i = 1; i < WN; i++) if (WK.f[i] > WK.f[best]) best = i;
    return best;
  })();

  /* ---- the two wrong variants, refuted by the smallest graph ------------ */
  function allDigraphs(n) {
    var pairs = [], u, v;
    for (u = 0; u < n; u++) for (v = 0; v < n; v++) if (u !== v) pairs.push([u, v]);
    return pairs;
  }

  function firstFailure(n, opts) {
    var pairs = allDigraphs(n);
    for (var mask = 0; mask < (1 << pairs.length); mask++) {
      var es = pairs.filter(function (_, i) { return mask & (1 << i); });
      if (keyOf(bruteSCC(n, es)) !== keyOf(kosaraju(n, es, opts).comps)) return { n: n, edges: es };
    }
    return null;
  }

  var WRONG_GRAPH = firstFailure(2, { secondPassOnG: true }) || firstFailure(3, { secondPassOnG: true });
  var WRONG_ORDER = firstFailure(2, { wrongOrder: true }) || firstFailure(3, { wrongOrder: true });

  /* ---- the isolated-component case the shortcut gets wrong -------------- */
  var ISO = { n: 3, edges: [[0, 1]] };
  var ISO_COMPS = bruteSCC(ISO.n, ISO.edges);
  var ISO_COND = condensation(ISO.n, ISO.edges, ISO_COMPS);
  var ISO_SSI = srcSinkIso(ISO_COMPS.length, ISO_COND.edges);
  var ISO_ET = etFormula(ISO_COMPS.length, ISO_COND.edges);
  var ISO_NAIVE = Math.max(ISO_SSI.s, ISO_SSI.t);
  var ISO_BRUTE = minEdges(ISO.n, ISO.edges);

  /* ---- the 2014 Set 1 options ------------------------------------------ */
  function complementEdges(n, edges) {
    var have = {}, out = [], i, u, v;
    for (i = 0; i < edges.length; i++) have[edges[i][0] + '>' + edges[i][1]] = true;
    for (u = 0; u < n; u++) for (v = 0; v < n; v++) if (u !== v && !have[u + '>' + v]) out.push([u, v]);
    return out;
  }
  function paths2Edges(n, edges) {
    var adj = build(n, edges), set = {}, out = [], u, v, w;
    for (u = 0; u < n; u++) for (var i = 0; i < adj[u].length; i++) {
      v = adj[u][i];
      set[u + '>' + v] = true;
      for (var j = 0; j < adj[v].length; j++) set[u + '>' + adj[v][j]] = true;
    }
    for (u = 0; u < n; u++) for (v = 0; v < n; v++) if (set[u + '>' + v]) out.push([u, v]);
    return out;
  }
  function dropIsolated(n, edges) {
    var deg = [], i;
    for (i = 0; i < n; i++) deg.push(0);
    for (i = 0; i < edges.length; i++) { deg[edges[i][0]]++; deg[edges[i][1]]++; }
    var keep = [], remap = {};
    for (i = 0; i < n; i++) if (deg[i]) { remap[i] = keep.length; keep.push(i); }
    var out = [];
    for (i = 0; i < edges.length; i++) {
      var a = remap[edges[i][0]], b = remap[edges[i][1]];
      if (a !== undefined && b !== undefined) out.push([a, b]);
    }
    return { n: keep.length, edges: out };
  }

  var ITEM2014 = (function () {
    var out = { total: 0, complement: 0, transpose: 0, paths2: 0, drop: 0 };
    var n = 4, pairs = allDigraphs(n);
    for (var mask = 0; mask < (1 << pairs.length); mask++) {
      var es = pairs.filter(function (_, i) { return mask & (1 << i); });
      var truth = keyOf(bruteSCC(n, es));
      out.total++;
      if (keyOf(bruteSCC(n, complementEdges(n, es))) !== truth) out.complement++;
      if (keyOf(bruteSCC(n, transposeEdges(es))) !== truth) out.transpose++;
      if (keyOf(bruteSCC(n, paths2Edges(n, es))) !== truth) out.paths2++;
      var d = dropIsolated(n, es);
      if (keyOf(bruteSCC(d.n, d.edges)) !== truth) out.drop++;
    }
    return out;
  })();

  /* ======================================================================
     LAYER 2 - VALIDATION
     ====================================================================== */

  var CHECKS = [];
  function check(name, pass, detail) {
    CHECKS.push({ name: name, pass: !!pass, detail: detail || '' });
  }

  /* the exhaustive sweeps, kept so the page can report their sizes */
  var SWEEP = { graphs: 0, disagree: 0, transposeBad: 0, orderBad: 0, dagBad: 0, dags: 0, etBad: 0, condCyclic: 0 };
  var RANDOM = { trials: 0, disagree: 0, meanComponents: 0 };

  (function validate() {
    var n, mask, i, ok;

    /* 1-5. every digraph with 2, 3 and 4 vertices */
    for (n = 2; n <= 4; n++) {
      var pairs = allDigraphs(n);
      var total = 1 << pairs.length;
      var bad = 0, transBad = 0, orderBad = 0, dagBad = 0, dags = 0, etBad = 0, cyclic = 0;
      for (mask = 0; mask < total; mask++) {
        var es = pairs.filter(function (_, j) { return mask & (1 << j); });
        var kk = kosaraju(n, es);
        var tt = tarjan(n, es);
        var bb = bruteSCC(n, es);
        var truth = keyOf(bb);
        if (keyOf(kk.comps) !== truth || keyOf(tt.comps) !== truth) bad++;
        if (keyOf(kosaraju(n, transposeEdges(es)).comps) !== truth) transBad++;

        /* the condensation is acyclic, and component finish order is a
           topological order of it */
        var cond = condensation(n, es, bb);
        if (!isDAG(bb.length, cond.edges)) cyclic++;
        var order = bb.map(function (c, idx) {
          var m = 0;
          for (var q = 0; q < c.length; q++) m = Math.max(m, kk.f[c[q]]);
          return { idx: idx, finish: m };
        }).sort(function (a, b) { return b.finish - a.finish; }).map(function (o) { return o.idx; });
        var pos = {};
        order.forEach(function (c, idx) { pos[c] = idx; });
        for (var e = 0; e < cond.edges.length; e++) {
          if (!(pos[cond.edges[e][0]] < pos[cond.edges[e][1]])) { orderBad++; break; }
        }

        /* the maximum finish time lies in a source component */
        var maxV = 0;
        for (var v = 1; v < n; v++) if (kk.f[v] > kk.f[maxV]) maxV = v;
        var cid = cond.cid[maxV];
        var indegC = 0;
        for (var e2 = 0; e2 < cond.edges.length; e2++) if (cond.edges[e2][1] === cid) indegC++;
        if (indegC !== 0) dagBad++;

        if (isDAG(n, es)) {
          dags++;
          if (etFormula(n, es) !== minEdges(n, es)) etBad++;
        }
      }
      check('every digraph with ' + n + ' vertices: Kosaraju, Tarjan and the definition agree',
        bad === 0, total + ' graphs, ' + bad + ' disagreements');
      check('every digraph with ' + n + ' vertices: reversing the edges preserves the components',
        transBad === 0, transBad + ' of ' + total + ' graphs changed a component');
      check('every digraph with ' + n + ' vertices: component finish order is a topological order of the condensation',
        orderBad === 0, orderBad + ' violations');
      check('every digraph with ' + n + ' vertices: the condensation is acyclic, and the last finish lies in a source component',
        cyclic === 0 && dagBad === 0, 'cyclic condensations ' + cyclic + ', wrong source ' + dagBad);
      check('every acyclic digraph with ' + n + ' vertices: max(sources, sinks) + isolated equals the brute-force edge count',
        etBad === 0, dags + ' DAGs, ' + etBad + ' failures');

      SWEEP.graphs += total; SWEEP.disagree += bad; SWEEP.transposeBad += transBad;
      SWEEP.orderBad += orderBad; SWEEP.condCyclic += cyclic; SWEEP.dagBad += dagBad;
      SWEEP.dags += dags; SWEEP.etBad += etBad;
    }

    /* 6. the drawn graph: the four computations agree, and the numbers are these */
    check('the drawn graph has 4 components of sizes 3, 2, 2 and 2, by all three methods',
      keyOf(WK.comps) === '0,1,2|3,4|5,6|7,8' && keyOf(WT.comps) === keyOf(WK.comps) && keyOf(WB) === keyOf(WK.comps),
      'Kosaraju ' + keyOf(WK.comps) + ', Tarjan ' + keyOf(WT.comps));

    /* 7. the finish times, and the stack */
    check('the first pass discovers and finishes every vertex, and the stack reads D I H G F E C B A',
      WK.firstPass.map(function (v) { return NAME[v]; }).join('') === 'DIHGFECBA' &&
      Math.max.apply(null, WK.f) === 18,
      'firstPass ' + WK.firstPass.map(function (v) { return NAME[v]; }).join(' '));

    /* 8. the largest finish time is A, inside the source component */
    check('the largest finish time belongs to A, and A sits in the source component of the condensation',
      NAME[MAX_FINISH_VERTEX] === 'A' && COMP_OF[MAX_FINISH_VERTEX] === 0,
      'largest finish ' + WK.f[MAX_FINISH_VERTEX] + ' at ' + NAME[MAX_FINISH_VERTEX]);

    /* 9. the second pass finds exactly one component per tree */
    check('the second pass produces four trees, one per component, rooted at A, E, F and H',
      WK.roots.length === 4 && WK.roots.map(function (v) { return NAME[v]; }).join('') === 'AEFH',
      'roots ' + WK.roots.map(function (v) { return NAME[v]; }).join(' '));

    /* 10. Tarjan's low values */
    ok = true;
    var wantLow = { 0: 0, 1: 0, 2: 0, 3: 3, 4: 3, 5: 5, 6: 5, 7: 7, 8: 7 };
    for (i = 0; i < WN; i++) if (WT.low[i] !== wantLow[i]) { ok = false; break; }
    check('Tarjan gives low-link values 0 0 0 3 3 5 5 7 7, equal inside a component',
      ok, WT.low.join(' '));

    /* 11. the condensation */
    check('the condensation has 4 vertices and 4 distinct edges, and is acyclic',
      WCOND.edges.length === 4 && isDAG(4, WCOND.edges),
      'edges ' + JSON.stringify(WCOND.edges));
    check('the condensation has one source and one sink and no isolated component, so the answer is 1 edge',
      WSSI.s === 1 && WSSI.t === 1 && WSSI.q === 0 && WET === 1 && WBRUTE === 1,
      'sources ' + WSSI.s + ', sinks ' + WSSI.t + ', isolated ' + WSSI.q + ', brute ' + WBRUTE);

    /* 12. component finish times, decreasing */
    check('the components finish last at 18, 12, 11 and 9, which orders them as the edges run',
      COMP_MAX_FINISH.join(',') === '18,12,11,9', COMP_MAX_FINISH.join(', '));

    /* 13. the two wrong variants, refuted on two vertices */
    check('passing the original graph to the second pass fails on the two-vertex, one-edge graph',
      WRONG_GRAPH && WRONG_GRAPH.n === 2 && WRONG_GRAPH.edges.length === 1 &&
      keyOf(kosaraju(WRONG_GRAPH.n, WRONG_GRAPH.edges, { secondPassOnG: true }).comps) !== keyOf(bruteSCC(WRONG_GRAPH.n, WRONG_GRAPH.edges)),
      'truth ' + keyOf(bruteSCC(2, [[0, 1]])) + ', wrong variant ' + keyOf(kosaraju(2, [[0, 1]], { secondPassOnG: true }).comps));
    check('taking the ascending order fails on the same two-vertex graph',
      WRONG_ORDER && WRONG_ORDER.n === 2 &&
      keyOf(kosaraju(WRONG_ORDER.n, WRONG_ORDER.edges, { wrongOrder: true }).comps) !== keyOf(bruteSCC(WRONG_ORDER.n, WRONG_ORDER.edges)),
      'truth ' + keyOf(bruteSCC(2, [[0, 1]])) + ', wrong variant ' + keyOf(kosaraju(2, [[0, 1]], { wrongOrder: true }).comps));

    /* 14. the isolated-component counterexample */
    check('A to B plus an isolated C needs 2 edges: max(sources, sinks) + isolated, not max(sources, sinks)',
      ISO_ET === 2 && ISO_NAIVE === 1 && ISO_BRUTE === 2,
      'formula ' + ISO_ET + ', shortcut ' + ISO_NAIVE + ', brute force ' + ISO_BRUTE);

    /* 15. the two boundaries */
    check('a single vertex needs 0 edges, and two isolated vertices need 2',
      etFormula(1, []) === 0 && minEdges(1, []) === 0 && etFormula(2, []) === 2 && minEdges(2, []) === 2,
      'one vertex: ' + etFormula(1, []) + ', two isolated: ' + etFormula(2, []));

    /* 16. the 2014 options */
    check('2014 Set 1: the transpose never changes a component, on all 4096 digraphs with four vertices',
      ITEM2014.transpose === 0 && ITEM2014.total === 4096,
      'transpose differed on ' + ITEM2014.transpose + ' of ' + ITEM2014.total);
    check('2014 Set 1: the complement changes a component on most graphs, and deleting isolated vertices on some',
      ITEM2014.complement > 3000 && ITEM2014.drop > 0,
      'complement ' + ITEM2014.complement + ', drop-isolated ' + ITEM2014.drop + ' of ' + ITEM2014.total);
    check('2014 Set 1: the graph of paths of length at most two did NOT differ in this search, reported honestly',
      ITEM2014.paths2 === 0,
      'paths <= 2 differed on ' + ITEM2014.paths2 + ' of ' + ITEM2014.total + ' - so it is not refuted here');

    /* 17. random graphs, 5 to 8 vertices */
    var seed = 20261102;
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    var rbad = 0, trials = 0, sumComp = 0;
    for (var nn = 5; nn <= 8; nn++) {
      for (var trial = 0; trial < 400; trial++) {
        var prob = 0.15 + 0.7 * rnd(), es2 = [];
        for (var u = 0; u < nn; u++) for (var v = 0; v < nn; v++) if (u !== v && rnd() < prob) es2.push([u, v]);
        var a = keyOf(kosaraju(nn, es2).comps), b = keyOf(tarjan(nn, es2).comps), c = keyOf(bruteSCC(nn, es2));
        trials++;
        sumComp += bruteSCC(nn, es2).length;
        if (a !== b || b !== c) rbad++;
      }
    }
    RANDOM.trials = trials; RANDOM.disagree = rbad; RANDOM.meanComponents = sumComp / trials;
    check('1,600 random graphs with 5 to 8 vertices: all three methods agree',
      rbad === 0 && trials === 1600, trials + ' graphs, ' + rbad + ' disagreements');

    /* 18. the totals */
    check('the sweeps covered 4,164 graphs in total, and every property held on every one',
      SWEEP.graphs === 4164 && SWEEP.disagree === 0 && SWEEP.transposeBad === 0 &&
      SWEEP.orderBad === 0 && SWEEP.condCyclic === 0 && SWEEP.dagBad === 0 && SWEEP.etBad === 0,
      SWEEP.graphs + ' graphs, ' + SWEEP.dags + ' of them acyclic');
  })();

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

  /* ======================================================================
     LAYER 3 - RENDER
     ====================================================================== */

  var POS = {
    0: [84, 84], 1: [156, 84], 2: [120, 152],
    3: [242, 84], 4: [242, 152],
    5: [344, 84], 6: [344, 152],
    7: [452, 84], 8: [452, 152]
  };
  var R = 15;
  var COMP_TONE = [PAL.accent, PAL.info, PAL.warn, PAL.valid];
  var COMP_FILL = [PAL.accentDim, PAL.surface2, PAL.warnDim, PAL.surface2];

  function stage(p, n) {
    var s = Math.floor(K.clamp01(p) * n);
    return s >= n ? n - 1 : s;
  }

  function title(s, sub) {
    P.text(26, 16, s, { size: 15.5, bold: true, color: PAL.ink });
    if (sub) P.text(26, 38, sub, { size: 11, color: PAL.dim });
  }

  function foot(s) {
    P.text(26, 448, s, { size: 10, color: PAL.faint });
  }

  function line(x, y, s, o) {
    o = o || {};
    P.text(x, y, s, {
      size: o.size || 12, color: o.color || PAL.ink, bold: !!o.bold,
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
    P.rect(x, y, w, h, { fill: fill, stroke: stroke, sw: 1, radius: 6 });
    if (label) centre(x + w / 2, y + h / 2, label, { size: o.size || 10.5, mono: !!o.mono, bold: !!o.bold, color: o.color || PAL.ink });
  }

  /* draw one edge, trimmed to the circles it joins */
  function hasEdge(es, a, b) {
    for (var i = 0; i < es.length; i++) if (es[i][0] === a && es[i][1] === b) return true;
    return false;
  }

  function edge(a, b, o) {
    o = o || {};
    var pa = POS[a], pb = POS[b];
    var dx = pb[0] - pa[0], dy = pb[1] - pa[1];
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / len, uy = dy / len;
    /* opposite arrows are pushed apart so that a pair reads as two edges */
    var shift = o.both ? 5 : 0;
    var px = -uy * shift, py = ux * shift;
    var x1 = pa[0] + ux * (R + 2) + px, y1 = pa[1] + uy * (R + 2) + py;
    var x2 = pb[0] - ux * (R + 5) + px, y2 = pb[1] - uy * (R + 5) + py;
    P.arrow(x1, y1, x2, y2, { stroke: o.stroke || PAL.border, sw: o.sw || 1.4, head: 7, dash: o.dash });
  }

  /* the worked graph, optionally transposed, optionally tinted by component */
  function drawWorkedGraph(o) {
    o = o || {};
    var i;
    /* component boxes first, so they sit behind everything */
    if (o.boxes) {
      var boxOf = [[0, 1, 2], [3, 4], [5, 6], [7, 8]];
      for (i = 0; i < boxOf.length; i++) {
        var xs = boxOf[i].map(function (v) { return POS[v][0]; });
        var ys = boxOf[i].map(function (v) { return POS[v][1]; });
        var x0 = Math.min.apply(null, xs) - 30, x1 = Math.max.apply(null, xs) + 30;
        var y0 = Math.min.apply(null, ys) - 30, y1 = Math.max.apply(null, ys) + 30;
        P.rect(x0, y0, x1 - x0, y1 - y0, {
          fill: i === o.hiComp ? PAL.accentDim : PAL.surface2,
          stroke: i === o.hiComp ? PAL.accent : PAL.border,
          sw: i === o.hiComp ? 1.6 : 1, radius: 12
        });

      }
    }
    var es = o.transpose ? transposeEdges(WEDGES) : WEDGES;
    for (i = 0; i < es.length; i++) {
      var a = es[i][0], b = es[i][1];
      var same = COMP_OF[a] === COMP_OF[b];
      edge(a, b, {
        stroke: same ? PAL.border : PAL.dim,
        sw: same ? 1.2 : 1.7,
        both: hasEdge(es, b, a)
      });
    }
    if (o.boxes) {
      var legend = [['S1 = A B C', 40], ['S2 = D E', 150], ['S3 = F G', 250], ['S4 = H I', 350]];
      for (i = 0; i < legend.length; i++) {
        line(legend[i][1], 200, legend[i][0], { size: 9.5, mono: true, color: COMP_TONE[i], bold: true });
      }
    }
    for (i = 0; i < WN; i++) {
      var c = COMP_OF[i];
      var hi = o.hi && o.hi.indexOf(i) >= 0;
      P.circle(POS[i][0], POS[i][1], hi ? R + 3 : R, {
        fill: o.tint ? COMP_FILL[c] : PAL.surface,
        stroke: hi ? PAL.ink : (o.tint ? COMP_TONE[c] : PAL.border),
        sw: hi ? 2 : 1.5
      });
      centre(POS[i][0], POS[i][1], NAME[i], { size: 12.5, mono: true, bold: true, color: PAL.ink });
    }
  }

  /* --- 1. one-way streets ------------------------------------------------ */
  function drawOneway(p) {
    var s = stage(p, 4);
    title('One-way streets: the question is whether you can get back',
      'directed graph: an arrow is a one-way street, and nothing is implied about the way back');

    /* the single edge */
    P.circle(240, 130, 20, { fill: PAL.surface, stroke: PAL.border, sw: 1.6 });
    centre(240, 130, 'u', { size: 13, mono: true, bold: true });
    P.circle(420, 130, 20, { fill: PAL.surface, stroke: PAL.border, sw: 1.6 });
    centre(420, 130, 'v', { size: 13, mono: true, bold: true });
    P.arrow(262, 130, 396, 130, { stroke: PAL.dim, sw: 1.8, head: 9 });
    line(268, 108, 'u reaches v', { size: 10.5, color: PAL.dim });

    if (s >= 0) {
      line(460, 124, 'one edge: u \u2192 v', { size: 10.5, mono: true, color: PAL.faint });
    }

    if (s >= 1) {
      P.arrow(396, 158, 262, 158, { stroke: PAL.accent, sw: 1.8, head: 9 });
      line(268, 166, 'and v reaches u: mutually reachable', { size: 10.5, color: PAL.accent, bold: true });
      panel(120, 200, 640, 46, 'good');
      line(136, 210, 'Mutually reachable means both trips exist. Then u and v are in the same', { size: 10.5 });
      line(136, 226, 'strongly connected component. The word strong is the return trip.', { size: 10.5 });
    }

    if (s >= 2) {
      P.circle(680, 130, 20, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.6 });
      centre(680, 130, 'w', { size: 13, mono: true, bold: true });
      line(560, 176, 'w has no edges: it is still its own component,', { size: 10.5, color: PAL.warn });
      line(560, 192, 'because w reaches w by the empty path.', { size: 10.5, color: PAL.warn });
    }

    if (s >= 3) {
      panel(120, 268, 640, 58, 'info');
      line(136, 280, 'The object is a set, not an edge and not a path: a set of vertices every pair of', { size: 11, bold: true });
      line(136, 298, 'which can reach the other, in both directions. That is what the rest computes.', { size: 11, bold: true });
    }
    foot('a vertex always reaches itself by a path of length zero, which is why the relation is reflexive');
  }

  /* --- 2. the definition ------------------------------------------------- */
  function drawFormal(p) {
    var s = stage(p, 4);
    title('The definition, and the partition it forces',
      'u ~ v when a path runs each way; the classes of that relation are the components');

    panel(40, 64, 820, 54, 'info');
    centre(450, 91, 'u ~ v   \u21D4   u \u219D v   and   v \u219D u', { size: 19, mono: true, bold: true, color: PAL.accent });
    line(60, 124, 'the arrow with a star means "has a path to", counting a path of length zero', { size: 9.5, color: PAL.faint });

    var cards = [
      { x: 40, head: 'reflexive', body: ['u ~ u for every u,', 'because the empty path', 'is a path.'] },
      { x: 320, head: 'symmetric', body: ['u ~ v gives v ~ u,', 'because the definition', 'asks for both directions.'] },
      { x: 600, head: 'transitive', body: ['u ~ v and v ~ w give', 'u ~ w: join the two', 'paths end to end.'] }
    ];
    for (var i = 0; i < cards.length; i++) {
      if (s < 1) break;
      var c = cards[i];
      chip(c.x, 146, 260, 26, c.head, { tone: 'a', size: 11, bold: true });
      line(c.x + 6, 180, c.body[0], { size: 10.5, color: PAL.dim });
      line(c.x + 6, 196, c.body[1], { size: 10.5, color: PAL.dim });
      line(c.x + 6, 212, c.body[2], { size: 10.5, color: PAL.dim });
    }

    if (s >= 2) {
      line(40, 246, 'An equivalence relation on a set splits the set into disjoint classes. Here the classes are the components.', { size: 11, bold: true });
      chip(40, 272, 260, 34, 'pairwise disjoint', { tone: 'good', size: 11 });
      chip(320, 272, 260, 34, 'cover every vertex once', { tone: 'good', size: 11 });
      chip(600, 272, 260, 34, 'the count is a partition count', { tone: 'good', size: 11 });
      line(40, 318, 'A vertex in two components would make all their vertices mutually reachable, so they were one component.', { size: 10, color: PAL.dim });
    }

    if (s >= 3) {
      panel(40, 348, 820, 56, 'warn');
      line(58, 360, 'The graph is strongly connected exactly when it has one component.', { size: 11.5, bold: true });
      line(58, 378, 'A graph with no edges has one component per vertex, which is the boundary most counts turn on.', { size: 10.5, color: PAL.dim });
    }
    foot('components are maximal: no outside vertex can be added and keep every pair mutually reachable');
  }

  /* --- 3. the drawn graph ------------------------------------------------ */
  function drawGraph(p) {
    var s = stage(p, 4);
    title('One graph, four components, counted',
      'nine vertices, thirteen edges; the four cycles are the four components');
    drawWorkedGraph({ boxes: s >= 0, tint: s >= 1 });

    if (s >= 1) {
      line(560, 60, 'components', { size: 10, color: PAL.faint, mono: true });
      var rows = [
        ['S1 = A B C', 'size 3'],
        ['S2 = D E', 'size 2'],
        ['S3 = F G', 'size 2'],
        ['S4 = H I', 'size 2']
      ];
      for (var i = 0; i < rows.length; i++) {
        line(560, 80 + i * 20, rows[i][0], { size: 11, mono: true, color: COMP_TONE[i], bold: true });
        line(690, 80 + i * 20, rows[i][1], { size: 10, color: PAL.dim });
      }
      centre(700, 176, '4 components', { size: 12, bold: true, color: PAL.accent });
    }

    if (s >= 2) {
      panel(40, 238, 500, 52, 'info');
      line(56, 248, 'Between components the traffic runs one way: C reaches D, and nothing', { size: 10.5 });
      line(56, 264, 'returns. That is exactly why S1 and S2 stay separate.', { size: 10.5 });
      line(560, 210, 'the skip edge E \u2192 H', { size: 10, mono: true, color: PAL.dim });
      line(560, 226, 'leaves S2 for S4 and', { size: 10, color: PAL.dim });
      line(560, 242, 'returns nothing', { size: 10, color: PAL.dim });
    }

    if (s >= 3) {
      panel(40, 300, 820, 52, 'good');
      line(56, 310, 'By hand: for one vertex, list what it reaches and what reaches it, then intersect. That is the definition,', { size: 10.5 });
      line(56, 326, 'and it costs one traversal per vertex. Kosaraju needs two traversals; Tarjan needs one.', { size: 10.5 });
    }
    foot('every algorithm here is linear: work bounded by a constant times vertices plus edges');
  }

  /* --- 4. pass one -------------------------------------------------------- */
  function drawPass1(p) {
    var s = stage(p, 4);
    title('Kosaraju pass 1: finish every vertex, and record the order',
      'a depth-first search from E, then A, then F; d is the arrival time, f the departure time');
    drawWorkedGraph({ tint: s >= 2, hi: s >= 1 && s < 2 ? [4, 3] : null });

    /* the table of times */
    var x = 600, y = 58;
    line(x, y, 'vertex    d    f', { size: 10, mono: true, color: PAL.faint });
    for (var i = 0; i < WN; i++) {
      if (s < 0) break;
      var hi = WK.f[i] === 18;
      line(x + 12, y + 18 + i * 17, NAME[i], { size: 11, mono: true, bold: hi, color: hi ? PAL.accent : PAL.ink });
      line(x + 52, y + 18 + i * 17, String(WK.d[i]), { size: 11, mono: true, color: PAL.dim });
      line(x + 90, y + 18 + i * 17, String(WK.f[i]), { size: 11, mono: true, bold: hi, color: hi ? PAL.accent : PAL.ink });
    }

    if (s >= 1) {
      panel(40, 238, 520, 44, 'info');
      line(56, 248, 'From E the search goes to D first. D has nothing left, so D finishes at 3;', { size: 10.5 });
      line(56, 264, 'then E walks to F, G, H, I, and finishes at 12.', { size: 10.5 });
    }

    if (s >= 2) {
      line(40, 296, 'push each vertex as it finishes \u2014 the stack, bottom to top:', { size: 10.5, color: PAL.dim });
      var order = WK.firstPass;
      for (var j = 0; j < order.length; j++) {
        var bx = 40 + j * 52;
        chip(bx, 314, 44, 26, NAME[order[j]], { tone: j === order.length - 1 ? 'a' : 'plain', size: 11, mono: true, bold: true });
        centre(bx + 22, 350, String(WK.f[order[j]]), { size: 9, mono: true, color: PAL.faint });
      }
      line(560, 320, 'the numbers under the chips are the finish times', { size: 9.5, color: PAL.faint });
    }

    if (s >= 3) {
      line(560, 366, 'Pass one has found no component.', { size: 11, bold: true, color: PAL.warn });
      line(560, 384, 'It has produced one list. Pass two', { size: 10.5, color: PAL.dim });
      line(560, 400, 'consumes it from the top down.', { size: 10.5, color: PAL.dim });
    }
    foot('the clock is one counter: 1 to 18 on nine vertices, and the numbers belong to the search, not the graph');
  }

  /* --- 5. the lemma ------------------------------------------------------- */
  function drawLemma(p) {
    var s = stage(p, 4);
    title('The lemma that makes the order useful',
      'the largest finish time lies in a source component, and component order respects the condensation');

    /* the condensation as four boxes */
    var bx = [70, 260, 450, 640], by = 120, bw = 130, bh = 46;
    var labels = ['S1 = A B C', 'S2 = D E', 'S3 = F G', 'S4 = H I'];
    for (var i = 0; i < 4; i++) {
      chip(bx[i], by, bw, bh, labels[i], {
        tone: i === 0 ? 'a' : 'plain', size: 10.5, mono: true, bold: i === 0
      });
      centre(bx[i] + bw / 2, by + bh + 16, 'last finish ' + COMP_MAX_FINISH[i], { size: 9.5, mono: true, color: PAL.faint });
    }
    P.arrow(bx[0] + bw, by + bh / 2, bx[1] - 6, by + bh / 2, { stroke: PAL.dim, sw: 1.6, head: 8 });
    P.arrow(bx[1] + bw, by + bh / 2, bx[2] - 6, by + bh / 2, { stroke: PAL.dim, sw: 1.6, head: 8 });
    P.arrow(bx[2] + bw, by + bh / 2, bx[3] - 6, by + bh / 2, { stroke: PAL.dim, sw: 1.6, head: 8 });

    if (s >= 1) {
      panel(40, 196, 820, 48, 'good');
      line(56, 206, 'The vertex with the largest finish time \u2014 here A, at 18 \u2014 lies in a source component:', { size: 11, bold: true });
      line(56, 224, 'one with no edge entering it from any other component. Here that is S1.', { size: 10.5, color: PAL.dim });
    }

    if (s >= 2) {
      line(40, 258, 'Why: suppose an edge runs from component X into component Y. Then the last vertex of X finishes', { size: 10.5 });
      line(40, 274, 'after the last vertex of Y. Two cases, and both give the same conclusion:', { size: 10.5 });
      chip(40, 292, 390, 32, 'search enters X first: it reaches Y, so Y finishes first', { tone: 'plain', size: 9.5 });
      chip(470, 292, 390, 32, 'search enters Y first: Y finishes before X is discovered', { tone: 'plain', size: 9.5 });
    }

    if (s >= 3) {
      panel(40, 336, 820, 60, 'info');
      line(56, 346, 'So ordering the components by their largest finish time, decreasing, is a topological order', { size: 11, bold: true });
      line(56, 364, 'of the condensation: 18, 12, 11, 9 gives S1, S2, S3, S4, which is the order the edges run in.', { size: 10.5, color: PAL.dim });
      line(56, 380, 'That order always exists, because the condensation is always acyclic.', { size: 10, color: PAL.faint });
    }
    foot('this is a property of every graph and every start order, checked on all 4,164 graphs the page enumerates');
  }

  /* --- 6. pass two -------------------------------------------------------- */
  function drawPass2(p) {
    var s = stage(p, 4);
    title('Kosaraju pass 2: the transpose, in that order',
      'every edge reversed; the vertices taken from the top of the stack');
    drawWorkedGraph({ transpose: s >= 0, boxes: s >= 1, tint: s >= 1, hiComp: s >= 1 && s < 2 ? 0 : -1 });

    if (s >= 0) {
      line(560, 60, 'reversed edges', { size: 10, mono: true, color: PAL.faint });
      line(560, 80, 'C \u2192 D became D \u2192 C,', { size: 10, color: PAL.dim });
      line(560, 96, 'so nothing inside S1 leads out.', { size: 10, color: PAL.dim });
    }

    if (s >= 1) {
      panel(40, 238, 500, 44, 'good');
      line(56, 248, 'The first tree is rooted at A and reaches A, B, C, then stops.', { size: 10.5, bold: true });
      line(56, 264, 'In the transpose the source component has become a sink.', { size: 10.5, color: PAL.dim });
    }

    if (s >= 2) {
      var trees = [
        ['tree 1, root A', 'A B C'],
        ['tree 2, root E', 'D E'],
        ['tree 3, root F', 'F G'],
        ['tree 4, root H', 'H I']
      ];
      line(560, 130, 'the four trees', { size: 10, mono: true, color: PAL.faint });
      for (var i = 0; i < trees.length; i++) {
        line(560, 150 + i * 22, trees[i][0], { size: 10, color: PAL.dim });
        line(680, 150 + i * 22, trees[i][1], { size: 11, mono: true, bold: true, color: COMP_TONE[i] });
      }
    }

    if (s >= 3) {
      panel(40, 300, 820, 56, 'info');
      line(56, 310, 'Two passes, each linear. Every tree of the second pass is one component, and every component', { size: 11, bold: true });
      line(56, 328, 'is exactly one tree. The stack replaces a sort by finish time, which is why the cost stays linear.', { size: 10.5, color: PAL.dim });
    }
    foot('the transpose has the same components, because reversing every edge reverses every path');
  }

  /* --- 7. why ------------------------------------------------------------- */
  function drawWhy(p) {
    var s = stage(p, 4);
    title('Why the transpose, and why that order',
      'both details are load-bearing, and two vertices with one edge refute each of them');

    /* panel A: the two-vertex graph */
    function mini(x, y, reversed) {
      P.circle(x, y, 15, { fill: PAL.surface, stroke: PAL.border, sw: 1.4 });
      centre(x, y, 'A', { size: 11.5, mono: true, bold: true });
      P.circle(x + 90, y, 15, { fill: PAL.surface, stroke: PAL.border, sw: 1.4 });
      centre(x + 90, y, 'B', { size: 11.5, mono: true, bold: true });
      if (reversed) P.arrow(x + 72, y, x + 18, y, { stroke: PAL.dim, sw: 1.6, head: 8 });
      else P.arrow(x + 18, y, x + 72, y, { stroke: PAL.dim, sw: 1.6, head: 8 });
    }

    mini(70, 96, false);
    line(52, 122, 'the graph: A \u2192 B', { size: 9.5, mono: true, color: PAL.faint });
    mini(300, 96, true);
    line(282, 122, 'the transpose: B \u2192 A', { size: 9.5, mono: true, color: PAL.faint });

    if (s >= 1) {
      panel(40, 140, 390, 74, 'bad');
      line(56, 150, 'pass 2 on the original graph:', { size: 10.5, bold: true, color: PAL.invalid });
      line(56, 168, 'start at A, walk the edge, report one', { size: 10 });
      line(56, 184, 'component A B. The truth is two.', { size: 10 });
    }

    if (s >= 2) {
      panel(460, 140, 390, 74, 'bad');
      line(476, 150, 'ascending order instead of decreasing:', { size: 10.5, bold: true, color: PAL.invalid });
      line(476, 168, 'start at B in the transpose, walk to A,', { size: 10 });
      line(476, 184, 'report one component A B again.', { size: 10 });
    }

    if (s >= 3) {
      line(40, 232, 'With both details right the argument closes:', { size: 11, bold: true });
      line(40, 252, 'if the first tree could leave its component through an edge of the transpose, then reversing that', { size: 10.5 });
      line(40, 268, 'edge gives an edge of the original graph entering the component from outside. But the component', { size: 10.5 });
      line(40, 284, 'of the largest finish time is a source, so no such edge exists. The tree is trapped, and what it', { size: 10.5 });
      line(40, 300, 'reaches is exactly the component. Removing it leaves the same hypothesis, so the argument repeats.', { size: 10.5 });
    }

    if (s >= 3) {
      panel(40, 316, 820, 92, 'good');
      line(56, 326, 'The recipe, in four steps:', { size: 11, bold: true });
      line(56, 344, '1  search the graph, pushing each vertex on a stack as it finishes', { size: 10.5, mono: true });
      line(56, 360, '2  reverse every edge', { size: 10.5, mono: true });
      line(56, 376, '3  search the reversed graph, taking vertices from the top of the stack', { size: 10.5, mono: true });
      line(56, 392, '4  read each search tree as one strongly connected component', { size: 10.5, mono: true });
    }
    foot('the page found both counterexamples by searching the graphs in order of size: two vertices is enough');
  }

  /* --- 8. the condensation ----------------------------------------------- */
  function drawCondense(p) {
    var s = stage(p, 4);
    title('The condensation: contract every component',
      'nine vertices become four; thirteen edges become four distinct ones');

    /* left: the original with component blobs */
    drawWorkedGraph({ boxes: true, tint: true });

    /* right: the condensation as a diamond */
    var nx = [620, 620, 760, 760], ny = [70, 170, 170, 280];
    var lab = ['S1', 'S2', 'S3', 'S4'];
    for (var i = 0; i < 4; i++) {
      P.circle(nx[i], ny[i], 20, { fill: COMP_FILL[i], stroke: COMP_TONE[i], sw: 1.6 });
      centre(nx[i], ny[i], lab[i], { size: 11, mono: true, bold: true });
    }
    function condEdge(a, b) {
      var dx = nx[b] - nx[a], dy = ny[b] - ny[a];
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      P.arrow(nx[a] + dx / len * 24, ny[a] + dy / len * 24,
              nx[b] - dx / len * 26, ny[b] - dy / len * 26,
              { stroke: PAL.dim, sw: 1.5, head: 7 });
    }
    condEdge(0, 1); condEdge(1, 2); condEdge(2, 3); condEdge(1, 3);
    line(560, 320, 'the condensation: 4 vertices, 4 edges', { size: 10, color: PAL.dim });
    line(560, 336, 'sources 1, sinks 1, isolated 0', { size: 10, color: PAL.dim });

    if (s >= 1) {
      panel(40, 238, 480, 52, 'info');
      line(56, 248, 'Contract: replace each component by one vertex. Edges inside a component', { size: 10.5 });
      line(56, 264, 'vanish; parallel edges between two components collapse into one.', { size: 10.5 });
    }

    if (s >= 2) {
      panel(40, 300, 820, 52, 'good');
      line(56, 310, 'The condensation never has a cycle. A cycle there would mean those components all reach each other,', { size: 10.5, bold: true });
      line(56, 326, 'so they were one component. Checked acyclic on every graph the page enumerates: 0 failures.', { size: 10, color: PAL.dim });
    }

    if (s >= 3) {
      line(560, 200, 'topological order: S1 S2 S3 S4', { size: 10, mono: true, color: PAL.accent });
      line(560, 216, 'two paths S1 \u2192 S4: through S3,', { size: 10, color: PAL.dim });
      line(560, 232, 'or straight through the skip edge', { size: 10, color: PAL.dim });
      line(560, 254, 'path counting in a DAG is', { size: 10, color: PAL.dim });
      line(560, 270, 'dynamic programming', { size: 10, color: PAL.dim });
    }
    foot('the condensation is the graph that survives: acyclic, with sources and sinks and a topological order');
  }

  /* --- 9. Tarjan ---------------------------------------------------------- */
  function drawTarjan(p) {
    var s = stage(p, 4);
    title('Tarjan: one pass, and a number per vertex',
      'low-link: the smallest discovery index reachable by tree edges and one edge back');
    drawWorkedGraph({ tint: s >= 1, hi: s >= 2 ? WT.comps[s - 2] || null : null });

    var x = 600, y = 56;
    line(x, y, 'vertex  index  low', { size: 10, mono: true, color: PAL.faint });
    for (var i = 0; i < WN; i++) {
      var isRoot = WT.low[i] === WT.index[i];
      line(x + 14, y + 18 + i * 17, NAME[i], { size: 11, mono: true, bold: true, color: isRoot ? PAL.accent : PAL.ink });
      line(x + 62, y + 18 + i * 17, String(WT.index[i]), { size: 11, mono: true, color: PAL.dim });
      line(x + 112, y + 18 + i * 17, String(WT.low[i]), { size: 11, mono: true, bold: true, color: isRoot ? PAL.accent : PAL.ink });
    }

    if (s >= 1) {
      panel(40, 238, 500, 44, 'info');
      line(56, 248, 'Inside a component the low values agree; across components they strictly', { size: 10.5 });
      line(56, 264, 'increase: 0 0 0, then 3 3, then 5 5, then 7 7.', { size: 10.5 });
    }

    if (s >= 2) {
      panel(40, 300, 480, 52, 'good');
      line(56, 310, 'When a vertex finishes with low equal to its own index,', { size: 10.5, bold: true });
      line(56, 326, 'everything on the stack above it is one component, and it', { size: 10.5, color: PAL.dim });
      line(56, 340, 'is popped. Here A, D, F and H are the four roots.', { size: 10.5, color: PAL.dim });
    }

    if (s >= 3) {
      line(560, 372, 'one pass, no transpose, same partition', { size: 10.5, bold: true, color: PAL.accent });
      line(560, 390, 'checked against the slow definition on', { size: 10, color: PAL.dim });
      line(560, 406, '4,164 graphs and 1,600 random ones', { size: 10, color: PAL.dim });
    }
    foot('the stack here is not the finish stack of Kosaraju: it holds the vertices currently in the search');
  }

  /* --- 10. augmentation -------------------------------------------------- */
  function drawAugment(p) {
    var s = stage(p, 4);
    title('How many edges make it strongly connected',
      'read the count off the condensation: sources, sinks, and isolated components');

    /* the condensation with the closing edge drawn */
    var nx = [120, 300, 460, 620], ny = 110;
    var lab = ['S1', 'S2', 'S3', 'S4'];
    for (var i = 0; i < 4; i++) {
      P.circle(nx[i], ny, 20, { fill: COMP_FILL[i], stroke: COMP_TONE[i], sw: 1.6 });
      centre(nx[i], ny, lab[i], { size: 11, mono: true, bold: true });
    }
    P.arrow(nx[0] + 22, ny, nx[1] - 24, ny, { stroke: PAL.dim, sw: 1.5, head: 7 });
    P.arrow(nx[1] + 22, ny, nx[2] - 24, ny, { stroke: PAL.dim, sw: 1.5, head: 7 });
    P.arrow(nx[2] + 22, ny, nx[3] - 24, ny, { stroke: PAL.dim, sw: 1.5, head: 7 });
    if (s >= 0) {
      P.arrow(nx[3], ny + 24, nx[0], ny + 24, { stroke: PAL.accent, sw: 1.9, head: 9, dash: [5, 4] });
      centre(370, 158, 'the one edge to add', { size: 10, color: PAL.accent, bold: true });
    }
    centre(nx[0], ny - 32, 'source', { size: 9.5, color: PAL.dim });
    centre(nx[3], ny - 32, 'sink', { size: 9.5, color: PAL.dim });

    if (s >= 1) {
      panel(40, 190, 820, 52, 'info');
      centre(450, 208, 'edges to add  =  max(sources, sinks)  +  isolated', { size: 15, mono: true, bold: true, color: PAL.accent });
      line(56, 226, 'every source needs an incoming edge, every sink an outgoing one, and an isolated component needs both', { size: 9.5, color: PAL.dim });
    }

    if (s >= 2) {
      /* the isolated counterexample */
      P.circle(90, 292, 15, { fill: PAL.surface, stroke: PAL.border, sw: 1.4 });
      centre(90, 292, 'A', { size: 11.5, mono: true, bold: true });
      P.circle(180, 292, 15, { fill: PAL.surface, stroke: PAL.border, sw: 1.4 });
      centre(180, 292, 'B', { size: 11.5, mono: true, bold: true });
      P.arrow(108, 292, 162, 292, { stroke: PAL.dim, sw: 1.5, head: 7 });
      P.circle(270, 292, 15, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.4 });
      centre(270, 292, 'C', { size: 11.5, mono: true, bold: true });
      panel(320, 266, 540, 54, 'bad');
      line(336, 276, 'A \u2192 B plus an isolated C: sources 1, sinks 1, isolated 1, so the answer is 2.', { size: 10.5, bold: true });
      line(336, 294, 'The shortcut max(sources, sinks) says 1, and one edge cannot serve C both ways.', { size: 10, color: PAL.dim });
    }

    if (s >= 3) {
      panel(40, 336, 820, 62, 'good');
      line(56, 346, 'Verified against brute force on all 571 acyclic digraphs with up to four vertices: no disagreement.', { size: 10.5, bold: true });
      line(56, 364, 'Two boundaries: one component needs 0 edges, and two isolated components need 2.', { size: 10.5, color: PAL.dim });
      line(56, 380, 'That is why the rule carries the condition that the condensation has more than one component.', { size: 10, color: PAL.faint });
    }
    foot('on the drawn graph the answer is 1: one source, one sink, no isolated component');
  }

  /* --- 11. the previous-year item ---------------------------------------- */
  function drawGate(p) {
    var s = stage(p, 4);
    title('GATE CSE 2014, Set 1, recomputed',
      'which graph built from G has the same strongly connected components?');

    line(40, 62, 'the four options, and what the page computed on all 4,096 digraphs with four vertices',
      { size: 10, color: PAL.faint });

    var rows = [
      ['complement: keep the edges G does not have', 'differs on ' + ITEM2014.complement, 'bad'],
      ['transpose: reverse every edge', 'differs on ' + ITEM2014.transpose, 'good'],
      ['paths of length at most two', 'differs on ' + ITEM2014.paths2, 'warn'],
      ['delete the isolated vertices', 'differs on ' + ITEM2014.drop, 'bad']
    ];
    for (var i = 0; i < rows.length; i++) {
      if (s < 0) break;
      var y = 88 + i * 34;
      var tone = rows[i][2] === 'good' ? 'good' : rows[i][2] === 'bad' ? 'bad' : 'warn';
      panel(40, y, 520, 28, tone);
      line(52, y + 7, rows[i][0], { size: 10.5 });
      line(576, y + 7, rows[i][1], { size: 10.5, mono: true, color: tone === 'good' ? PAL.valid : tone === 'bad' ? PAL.invalid : PAL.warn });
    }

    if (s >= 1) {
      panel(40, 232, 820, 46, 'good');
      line(56, 242, 'The answer is the transpose. Reversing every edge reverses every path, so u reaches v becomes', { size: 10.5, bold: true });
      line(56, 258, 'v reaches u: mutual reachability is unchanged for every pair, so every component is unchanged.', { size: 10.5, color: PAL.dim });
    }

    if (s >= 2) {
      panel(40, 288, 820, 50, 'warn');
      line(56, 298, 'Honest note: the length-two option did not differ on any graph the page searched, and a two-step', { size: 10.5 });
      line(56, 314, 'induction says why. The paper keys the transpose; give the transpose, with the reason above.', { size: 10, color: PAL.dim });
    }

    if (s >= 3) {
      line(40, 350, 'Five steps for any question in this topic:', { size: 11, bold: true });
      line(40, 368, '1  define the components as the classes of mutual reachability', { size: 10.5, mono: true });
      line(40, 384, '2  find them by two passes, or by Tarjan', { size: 10.5, mono: true });
      line(40, 400, '3  contract to the condensation   4  check it is acyclic   5  answer the count, order or augmentation', { size: 10.5, mono: true });
    }
    foot('the step candidates skip is the contraction, and almost every wrong answer is about the original graph');
  }

  var DRAW = {
    oneway: drawOneway, formal: drawFormal, graph: drawGraph, pass1: drawPass1,
    lemma: drawLemma, pass2: drawPass2, why: drawWhy, condense: drawCondense,
    tarjan: drawTarjan, augment: drawAugment, gate: drawGate
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
    NAME: NAME, WN: WN, WEDGES: WEDGES, START: START,
    WK: WK, WT: WT, WB: WB, WCOND: WCOND, WSSI: WSSI, WET: WET, WBRUTE: WBRUTE,
    COMP_OF: COMP_OF, COMP_MAX_FINISH: COMP_MAX_FINISH, MAX_FINISH_VERTEX: MAX_FINISH_VERTEX,
    WRONG_GRAPH: WRONG_GRAPH, WRONG_ORDER: WRONG_ORDER,
    ISO: { et: ISO_ET, naive: ISO_NAIVE, brute: ISO_BRUTE, ssi: ISO_SSI },
    ITEM2014: ITEM2014, SWEEP: SWEEP, RANDOM: RANDOM,
    kosaraju: kosaraju, tarjan: tarjan, bruteSCC: bruteSCC, condensation: condensation,
    isDAG: isDAG, topoOrder: topoOrder, srcSinkIso: srcSinkIso, etFormula: etFormula,
    minEdges: minEdges, keyOf: keyOf, transposeEdges: transposeEdges,
    PASSED: PASSED, TOTAL: CHECKS.length,
    ALL_PASS: PASSED === CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
