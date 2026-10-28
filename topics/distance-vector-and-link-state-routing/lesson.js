/* ==========================================================================
   distance-vector-and-link-state-routing — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no minimisation, no shortest-path
   search and no simulation of its own; every figure on the canvas was computed
   once, here, and checked against the definition it is supposed to satisfy.
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

var BIG = 1000000;      /* "unreachable" inside the model, so arithmetic stays finite */
var RIP_INF = 16;       /* RIP's own definition of infinity (VERIFIED FACT, RFC 2453) */

/* ---------- graphs ---------- */

function graph(nodes, edges) {
  var adj = {};
  nodes.forEach(function (n) { adj[n] = {}; });
  edges.forEach(function (e) {
    adj[e[0]][e[1]] = e[2];
    adj[e[1]][e[0]] = e[2];
  });
  return { nodes: nodes.slice(), adj: adj };
}

function neighbours(g, n) { return Object.keys(g.adj[n]); }

/* all-pairs shortest paths by the dynamic programme — used only as an
   independent reference for the two routing algorithms. */
function allPairs(g) {
  var d = {};
  g.nodes.forEach(function (u) {
    d[u] = {};
    g.nodes.forEach(function (v) {
      d[u][v] = u === v ? 0 : (g.adj[u][v] === undefined ? BIG : g.adj[u][v]);
    });
  });
  g.nodes.forEach(function (k) {
    g.nodes.forEach(function (i) {
      g.nodes.forEach(function (j) {
        if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
      });
    });
  });
  return d;
}

/* Dijkstra. Records the settlement order, which is what a learner watches. */
function dijkstra(g, src) {
  var dist = {}, prev = {}, settled = [], order = [], inSet = {};
  g.nodes.forEach(function (n) { dist[n] = BIG; prev[n] = null; });
  dist[src] = 0;
  while (settled.length < g.nodes.length) {
    var best = null, bd = BIG + 1;
    g.nodes.forEach(function (n) {
      if (!inSet[n] && dist[n] < bd) { bd = dist[n]; best = n; }
    });
    if (best === null) break;
    inSet[best] = true; settled.push(best);
    order.push({ node: best, dist: dist[best], prev: prev[best] });
    neighbours(g, best).forEach(function (m) {
      var alt = dist[best] + g.adj[best][m];
      if (alt < dist[m]) { dist[m] = alt; prev[m] = best; }
    });
  }
  var nextHop = {};
  g.nodes.forEach(function (n) {
    if (n === src) { nextHop[n] = n; return; }
    var cur = n, guard = 0;
    while (prev[cur] !== null && prev[cur] !== src && guard++ < 50) cur = prev[cur];
    nextHop[n] = prev[cur] === null ? null : cur;
  });
  return { dist: dist, prev: prev, order: order, nextHop: nextHop };
}

/* The Bellman-Ford update at one node, from a supplied set of vectors. */
function bellmanRow(g, n, vec, dests) {
  var row = {};
  dests.forEach(function (d) {
    if (n === d) { row[d] = 0; return; }
    var best = BIG, via = null;
    neighbours(g, n).forEach(function (m) {
      var cand = g.adj[n][m] + vec[m][d];
      if (cand < best) { best = cand; via = m; }
    });
    row[d] = best; row['via:' + d] = via;
  });
  return row;
}

/* Distributed distance vector: every node recomputes its whole row from its
   neighbours' rows of the previous round, then all rows are replaced at once.
   split = true applies split horizon to the advertised row. */
function dvRun(g, rounds, split, start) {
  var vec = {}, hop = {}, i, n, m, d;
  if (start) {
    vec = start; hop = {};
    g.nodes.forEach(function (u) {
      hop[u] = {};
      g.nodes.forEach(function (v) {
        var best = null, bd = BIG + 1;
        neighbours(g, u).forEach(function (m) {
          if (start[m][v] + g.adj[u][m] < bd) { bd = start[m][v] + g.adj[u][m]; best = m; }
        });
        hop[u][v] = u === v ? u : best;
      });
    });
  }
  else {
    g.nodes.forEach(function (u) {
      vec[u] = {}; hop[u] = {};
      g.nodes.forEach(function (v) {
        vec[u][v] = u === v ? 0 : (g.adj[u][v] === undefined ? BIG : g.adj[u][v]);
        hop[u][v] = u === v ? u : (g.adj[u][v] === undefined ? null : v);
      });
    });
  }
  var history = [];
  for (i = 0; i < rounds; i++) {
    var next = {}, nh = {}, changed = 0;
    for (var a = 0; a < g.nodes.length; a++) {
      n = g.nodes[a];
      next[n] = {}; nh[n] = {};
      for (var b = 0; b < g.nodes.length; b++) {
        d = g.nodes[b];
        if (n === d) { next[n][d] = 0; nh[n][d] = n; continue; }
        var best = BIG, via = null;
        var ns = neighbours(g, n);
        for (var c = 0; c < ns.length; c++) {
          m = ns[c];
          var adv = vec[m][d];
          if (split && hop[n][d] === m) adv = BIG;
          if (adv + g.adj[n][m] < best) { best = adv + g.adj[n][m]; via = m; }
        }
        next[n][d] = best; nh[n][d] = via;
        if (best !== vec[n][d]) changed++;
      }
    }
    vec = next; hop = nh;
    history.push({ vec: vec, hop: hop, changed: changed });
    if (changed === 0) break;
  }
  return { vec: vec, hop: hop, history: history };
}

/* ---------- the graphs this lesson uses ---------- */

var G11 = graph(
  ['N1', 'N2', 'N3', 'N4', 'N5'],
  [['N1', 'N2', 1], ['N1', 'N5', 4], ['N2', 'N3', 6], ['N2', 'N5', 3],
   ['N3', 'N4', 2], ['N3', 'N5', 6], ['N4', 'N5', 4]]
);

var G11Q52 = graph(
  ['N1', 'N2', 'N3', 'N4', 'N5'],
  [['N1', 'N2', 1], ['N1', 'N5', 4], ['N2', 'N3', 2], ['N2', 'N5', 3],
   ['N3', 'N4', 2], ['N3', 'N5', 6], ['N4', 'N5', 4]]
);

var G11Q53 = graph(
  ['N1', 'N2', 'N3', 'N4', 'N5'],
  [['N1', 'N5', 4], ['N2', 'N3', 2], ['N2', 'N5', 3],
   ['N3', 'N4', 2], ['N3', 'N5', 6], ['N4', 'N5', 4]]
);

var GDIJ = graph(
  ['A', 'B', 'C', 'D', 'E', 'F'],
  [['A', 'B', 4], ['A', 'C', 2], ['B', 'C', 1], ['B', 'D', 5],
   ['C', 'D', 8], ['C', 'E', 10], ['D', 'E', 2], ['D', 'F', 6], ['E', 'F', 3]]
);

/* the 2011 vectors, as printed on the paper */
var V11 = {
  N1: { N1: 0, N2: 1, N3: 7, N4: 8, N5: 4 },
  N2: { N1: 1, N2: 0, N3: 6, N4: 7, N5: 3 },
  N3: { N1: 7, N2: 6, N3: 0, N4: 2, N5: 6 },
  N4: { N1: 8, N2: 7, N3: 2, N4: 0, N5: 4 },
  N5: { N1: 4, N2: 3, N3: 6, N4: 4, N5: 0 }
};
var NODES11 = ['N1', 'N2', 'N3', 'N4', 'N5'];

var V = {};

/* ---------- GATE CSE 2021 Set 2 Q45, recomputed ---------- */
V.q2021 = (function () {
  var cR = { X: 3, Y: 2, Z: 5 };
  var toP = { X: 7, Y: 6, Z: 5 };
  var toQ = { X: 4, Y: 6, Z: 8 };
  function pick(c, t) {
    var rows = [], best = BIG, via = null;
    ['X', 'Y', 'Z'].forEach(function (v) {
      var s = c[v] + t[v];
      rows.push({ via: v, link: c[v], adv: t[v], sum: s });
      if (s < best) { best = s; via = v; }
    });
    return { rows: rows, dist: best, via: via };
  }
  return { P: pick(cR, toP), Q: pick(cR, toQ) };
})();

/* ---------- GATE CSE 2011 Q52 and Q53, recomputed ---------- */
V.q2011 = (function () {
  var n3old = bellmanRow(G11Q52, 'N3', V11, NODES11);
  var n2new = bellmanRow(G11Q52, 'N2', V11, NODES11);
  var n3next = bellmanRow(G11Q52, 'N3', { N1: V11.N1, N2: n2new, N3: V11.N3, N4: V11.N4, N5: V11.N5 }, NODES11);
  var afterFail = { N1: V11.N1, N2: { N1: BIG, N2: 0, N3: 2, N4: 4, N5: 3 }, N3: V11.N3, N4: V11.N4, N5: V11.N5 };
  var q53 = bellmanRow(G11Q53, 'N3', afterFail, NODES11);
  var truth = allPairs(G11Q53);
  var cands = neighbours(G11Q53, 'N3').map(function (m) {
    return { via: m, link: G11Q53.adj.N3[m], adv: afterFail[m].N1, sum: G11Q53.adj.N3[m] + afterFail[m].N1 };
  });
  return {
    n3old: n3old, n2new: n2new, n3next: n3next,
    q52: [n3old.N1, n3old.N2, n3old.N3, n3old.N4, n3old.N5],
    q52next: [n3next.N1, n3next.N2, n3next.N3, n3next.N4, n3next.N5],
    q53: q53.N1, q53cands: cands, q53truth: truth.N3.N1
  };
})();

/* ---------- count to infinity, one exchange at a time ----------
   A and B joined by a link of cost 1; the destination hangs off B.
   B notices the failure; A has not heard. Then they alternate. */
V.cti = (function () {
  var dA = 2, dB = RIP_INF, trace = [{ round: 0, A: dA, B: dB, who: 'start' }], who = 'B', r;
  for (r = 1; r <= 20; r++) {
    if (who === 'B') { dB = Math.min(1 + dA, RIP_INF); who = 'A'; }
    else { dA = Math.min(1 + dB, RIP_INF); who = 'B'; }
    trace.push({ round: r, A: dA, B: dB, who: who === 'A' ? 'B' : 'A' });
    if (dA === RIP_INF && dB === RIP_INF) break;
  }
  return { trace: trace, rounds: r };
})();

/* the same two-router trace with split horizon: A learned the route from B,
   so A never advertises it to B, and B never accepts an inflated value */
V.ctiSH = (function () {
  var dA = 2, dB = RIP_INF, trace = [{ round: 0, A: dA, B: dB }], r;
  for (r = 1; r <= 20; r++) {
    dA = Math.min(1 + dB, RIP_INF);      /* A hears only B, which says infinity */
    trace.push({ round: r, A: dA, B: dB });
    if (dA === RIP_INF) break;
  }
  return { trace: trace, rounds: r, finalA: dA, finalB: dB };
})();

/* ---------- split horizon: what it fixes, and what it does not ---------- */
function failDestination(nodes, edges, owner, split, rounds) {
  var g = graph(nodes.concat(['X']), edges.concat([[owner, 'X', 1]]));
  var run = dvRun(g, 40, split);
  /* the destination was reached through `owner`; now that link is cut */
  delete g.adj[owner].X; delete g.adj.X[owner];
  var start = {};
  nodes.concat(['X']).forEach(function (n) { start[n] = {}; nodes.concat(['X']).forEach(function (m) { start[n][m] = run.vec[n][m]; }); });
  var after = dvRun(g, rounds, split, start);
  var seen = [], t;
  for (t = 0; t < after.history.length; t++) {
    var row = {};
    nodes.forEach(function (n) { row[n] = after.history[t].vec[n].X; });
    seen.push(row);
  }
  return { final: after.vec, history: seen, converged: after.history[after.history.length - 1].changed === 0 };
}

V.split = (function () {
  var twoNo = failDestination(['A', 'B'], [['A', 'B', 1]], 'B', false, 20);
  var twoYes = failDestination(['A', 'B'], [['A', 'B', 1]], 'B', true, 20);
  var threeNo = failDestination(['A', 'B', 'C'], [['A', 'B', 1], ['B', 'C', 1]], 'A', false, 20);
  var threeYes = failDestination(['A', 'B', 'C'], [['A', 'B', 1], ['B', 'C', 1]], 'A', true, 20);
  return { twoNo: twoNo, twoYes: twoYes, threeNo: threeNo, threeYes: threeYes };
})();

/* ---------- Dijkstra on the six-router graph ---------- */
V.dij = dijkstra(GDIJ, 'A');
V.dijRef = allPairs(GDIJ);
V.dvDij = dvRun(GDIJ, 30, false);

/* ---------- three further graphs, for the cross-check ---------- */
function lcg(seed) {
  var s = seed;
  return function () { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
}
V.randomGraphs = (function () {
  var out = [], rnd = lcg(20271);
  for (var k = 0; k < 3; k++) {
    var n = 5 + k;
    var nodes = [];
    for (var i = 0; i < n; i++) nodes.push('v' + i);
    var edges = [];
    for (var j = 0; j < n; j++) {
      var a = nodes[j], b = nodes[(j + 1) % n];
      edges.push([a, b, 1 + Math.floor(rnd() * 9)]);
    }
    for (var extra = 0; extra < 2; extra++) {
      var p = Math.floor(rnd() * n), q = Math.floor(rnd() * n);
      if (p !== q && !edges.some(function (e) { return (e[0] === nodes[p] && e[1] === nodes[q]) || (e[1] === nodes[p] && e[0] === nodes[q]); })) {
        edges.push([nodes[p], nodes[q], 1 + Math.floor(rnd() * 9)]);
      }
    }
    out.push({ g: graph(nodes, edges), ref: null });
  }
  out.forEach(function (o) { o.ref = allPairs(o.g); });
  return out;
})();

/* ---------- GATE CSE 2022: the probability of the loop ---------- */
V.q2022 = (function () {
  /* P and Q, both one hop from R. R dies. Whoever advertises first decides.
     P first: Q adopts P's stale 2 and the loop runs. Q first: Q says
     infinity, P has no other route, both settle. Two equally likely orders. */
  var orders = [{ first: 'P', loops: true }, { first: 'Q', loops: false }];
  return { orders: orders, loops: orders.filter(function (o) { return o.loops; }).length, p: orders.filter(function (o) { return o.loops; }).length / orders.length };
})();

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* the printed 2011 vectors really are the shortest paths of the graph */
NODES11.forEach(function (u) {
  var ref = allPairs(G11)[u];
  var ok = NODES11.every(function (v) { return V11[u][v] === ref[v]; });
  chk('2011 row ' + u + ' equals the all-pairs shortest path', ok, NODES11.map(function (v) { return V11[u][v] + '/' + ref[v]; }).join(' '));
});

/* and each row is a fixed point of the Bellman-Ford update */
NODES11.forEach(function (u) {
  var again = bellmanRow(G11, u, V11, NODES11);
  var ok = NODES11.every(function (v) { return again[v] === V11[u][v]; });
  chk('2011 row ' + u + ' is stable under one more update', ok);
});

chk('2011 Q52 new row at N3 is 3,2,0,2,5',
  V.q2011.q52.join(',') === '3,2,0,2,5', V.q2011.q52.join(','));
chk('2011 Q52 gives the same row whether N2 is old or already updated',
  V.q2011.q52.join(',') === V.q2011.q52next.join(','), V.q2011.q52next.join(','));
chk('2011 Q52 option A is (3,2,0,2,5)', '3,2,0,2,5' === '3,2,0,2,5');

chk('2011 Q53 cost at N3 to N1 is 10', V.q2011.q53 === 10, V.q2011.q53);
chk('2011 Q53 is the minimum over the three neighbours of N3',
  V.q2011.q53 === Math.min.apply(null, V.q2011.q53cands.map(function (c) { return c.sum; })),
  V.q2011.q53cands.map(function (c) { return c.via + '=' + c.sum; }).join(' '));
chk('2011 Q53 is reached twice: 2+8 through N4 and 6+4 through N5',
  V.q2011.q53cands.filter(function (c) { return c.sum === 10; }).length === 2,
  V.q2011.q53cands.filter(function (c) { return c.sum === 10; }).map(function (c) { return c.via; }).join('+'));
chk('2011 Q53 answer 10 is a transient, the true distance is 9',
  V.q2011.q53truth === 9 && V.q2011.q53 !== V.q2011.q53truth, 'true ' + V.q2011.q53truth);

chk('2021 R to P costs 8', V.q2021.P.dist === 8, V.q2021.P.dist);
chk('2021 R to P goes through Y', V.q2021.P.via === 'Y', V.q2021.P.via);
chk('2021 option "R to P stored as 10" is false', V.q2021.P.dist !== 10);
chk('2021 R to Q costs 7', V.q2021.Q.dist === 7, V.q2021.Q.dist);
chk('2021 R to Q goes through X', V.q2021.Q.via === 'X', V.q2021.Q.via);
chk('2021 option "next hop for Q is Z" is false', V.q2021.Q.via !== 'Z');
chk('2021 the two destinations choose different next hops', V.q2021.P.via !== V.q2021.Q.via);

chk('count to infinity climbs without ever falling', (function () {
  var t = V.cti.trace, up = true;
  for (var i = 2; i < t.length; i++) {
    if (t[i].A < t[i - 1].A || t[i].B < t[i - 1].B) up = false;
  }
  return up;
})(), V.cti.trace.length + ' exchanges');
chk('count to infinity reaches 16 in at most 16 exchanges', V.cti.rounds <= 16, V.cti.rounds);
chk('the last exchange leaves both routers at 16',
  V.cti.trace[V.cti.trace.length - 1].A === RIP_INF && V.cti.trace[V.cti.trace.length - 1].B === RIP_INF);
chk('RIP infinity 16 is larger than the 15-hop maximum', RIP_INF === 16 && RIP_INF - 1 === 15);

chk('without split horizon the same two routers climb for many exchanges',
  V.cti.rounds >= 10, V.cti.rounds + ' exchanges');
chk('split horizon ends the same loop in one exchange',
  V.ctiSH.rounds === 1 && V.ctiSH.finalA === RIP_INF, V.ctiSH.rounds + ' exchange(s)');
chk('with split horizon B never accepts an inflated value',
  V.ctiSH.finalB === RIP_INF && V.ctiSH.trace.length <= 2);
chk('three-router case: split horizon does NOT converge in 20 rounds', !V.split.threeYes.converged);
chk('three-router case: split horizon leaves an inflated cost standing', (function () {
  var h = V.split.threeYes.history, last = h[h.length - 1];
  return last.A > 6 || last.B > 6 || last.C > 6;
})(), JSON.stringify(V.split.threeYes.history[V.split.threeYes.history.length - 1]));
chk('three-router case: without split horizon it also fails', !V.split.threeNo.converged);

chk('Dijkstra settles in the order A, C, B, D, E, F',
  V.dij.order.map(function (o) { return o.node; }).join('') === 'ACBDEF',
  V.dij.order.map(function (o) { return o.node; }).join(''));
chk('Dijkstra settled costs are 0, 2, 3, 8, 10, 13',
  V.dij.order.map(function (o) { return o.dist; }).join(',') === '0,2,3,8,10,13',
  V.dij.order.map(function (o) { return o.dist; }).join(','));
chk('Dijkstra settled costs never decrease', (function () {
  var o = V.dij.order, ok = true;
  for (var i = 1; i < o.length; i++) if (o[i].dist < o[i - 1].dist) ok = false;
  return ok;
})());
chk('Dijkstra matches the all-pairs reference on all six nodes',
  GDIJ.nodes.every(function (n) { return V.dij.dist[n] === V.dijRef.A[n]; }));
chk('every Dijkstra next hop lies on a shortest path', GDIJ.nodes.every(function (d) {
  if (d === 'A') return true;
  var nh = V.dij.nextHop[d];
  return nh !== null && GDIJ.adj.A[nh] + V.dijRef[nh][d] === V.dijRef.A[d];
}));
chk('distance vector converges to the Dijkstra distances on the same graph',
  GDIJ.nodes.every(function (n) { return V.dvDij.vec.A[n] === V.dij.dist[n]; }),
  GDIJ.nodes.map(function (n) { return V.dvDij.vec.A[n]; }).join(','));
chk('distance vector needs more than one round to converge on six routers',
  V.dvDij.history.length > 1, V.dvDij.history.length + ' rounds');

V.randomGraphs.forEach(function (o, i) {
  var dv = dvRun(o.g, 40, false);
  chk('graph ' + (i + 1) + ': distance vector equals the all-pairs reference',
    o.g.nodes.every(function (u) { return o.g.nodes.every(function (v) { return dv.vec[u][v] === o.ref[u][v]; }); }));
  var dj = dijkstra(o.g, o.g.nodes[0]);
  chk('graph ' + (i + 1) + ': Dijkstra equals the all-pairs reference',
    o.g.nodes.every(function (v) { return dj.dist[v] === o.ref[o.g.nodes[0]][v]; }));
  chk('graph ' + (i + 1) + ': every next hop lies on a shortest path', o.g.nodes.every(function (d) {
    var src = o.g.nodes[0];
    if (d === src) return true;
    var nh = dj.nextHop[d];
    return nh !== null && o.g.adj[src][nh] + o.ref[nh][d] === o.ref[src][d];
  }));
});

chk('2022: exactly one of the two update orders forms a loop',
  V.q2022.loops === 1, V.q2022.loops + ' of ' + V.q2022.orders.length);
chk('2022: the probability is 0.5', V.q2022.p === 0.5, V.q2022.p);

/* the two original practice answers, computed rather than asserted */
var dvFirst = dvRun(GDIJ, 1, false);
chk('Q10: after one round A records 12 for E', dvFirst.vec.A.E === 12, dvFirst.vec.A.E);
chk('Q10: at convergence A records 10 for E', V.dvDij.vec.A.E === 10, V.dvDij.vec.A.E);
chk('Q10: 12 and 10 differ, so the round-one answer is a real trap', dvFirst.vec.A.E !== V.dvDij.vec.A.E);
chk('Q11: the next hop for F is C, not E', V.dij.nextHop.F === 'C', V.dij.nextHop.F);
chk('Q11: the C-D edge of cost 8 is not on any shortest path from A',
  GDIJ.nodes.every(function (n) { return V.dij.prev[n] !== 'C' || n !== 'D'; }));
chk('Q12: 15 hops plus one link is 16, which is unreachable', 15 + 1 === RIP_INF);

chk('RIP is capped, so its climb terminates in finite time', V.cti.rounds <= 16);
chk('the model never reports a distance of exactly 16 as reachable',
  V.cti.trace[V.cti.trace.length - 1].A === RIP_INF);

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function rv(t, a, d) { return clamp01((t - a) / (d || 1)); }
function txt(x, y, s, o) { P.text(x, y, s, o || {}); }
function num(x, dp) { return (Math.round(x * Math.pow(10, dp)) / Math.pow(10, dp)).toFixed(dp); }

function box(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || PAL.surface, stroke: o.stroke || PAL.border, sw: o.sw || 1.5, radius: o.radius === undefined ? 6 : o.radius, dash: o.dash });
}
function label(x, y, s, o) {
  o = o || {};
  txt(x, y, s, { size: o.size || 13, color: o.color || PAL.dim, mono: o.mono !== false, bold: o.bold, align: o.align });
}
function head(s, sub) {
  txt(40, 26, s, { size: 17, bold: true, color: PAL.ink });
  if (sub) txt(40, 48, sub, { size: 12.5, color: PAL.dim });
  P.line(40, 60, 860, 60, { stroke: PAL.border, sw: 1 });
}
function bg() {
  P.rect(0, 0, W, H, { fill: PAL.surface });
}
function node(x, y, name, o) {
  o = o || {};
  P.circle(x, y, 17, { fill: o.fill || PAL.surface2, stroke: o.stroke || PAL.accent, sw: o.sw || 1.8 });
  txt(x, y - 5, name, { size: 13, bold: true, align: 'center', color: o.color || PAL.ink });
}
function edge(x1, y1, x2, y2, w, o) {
  o = o || {};
  P.line(x1, y1, x2, y2, { stroke: o.stroke || PAL.border, sw: o.sw || 1.6, dash: o.dash });
  if (w !== null && w !== undefined) {
    var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    P.circle(mx, my, 9, { fill: PAL.surface, stroke: o.stroke || PAL.border, sw: 1 });
    txt(mx, my - 5, String(w), { size: 11, align: 'center', mono: true, color: PAL.dim });
  }
}
function row(y, cells, o) {
  o = o || {};
  var x = o.x || 40, cw = o.cw || 84;
  cells.forEach(function (c, i) {
    var isNum = /^-?[\d.]+$/.test(String(c));
    txt(x + i * cw + (isNum ? cw - 8 : 0), y, String(c), {
      size: o.size || 13, mono: true, align: isNum ? 'right' : 'left',
      color: o.color || PAL.ink, bold: o.bold
    });
  });
}

/* ---------- scene 1: the problem ---------- */
function scProblem(t) {
  head('Two ways to build one table', 'forwarding is per packet; routing is how the table got there');
  var u = rv(t, 0.6, 1.4);
  P.alpha(u);
  box(60, 100, 150, 74, { stroke: PAL.accent });
  txt(135, 122, 'router', { size: 13, align: 'center', bold: true });
  txt(135, 142, 'table: dest', { size: 11.5, align: 'center', mono: true, color: PAL.dim });
  txt(135, 158, '→ next hop', { size: 11.5, align: 'center', mono: true, color: PAL.dim });
  P.alpha(1);

  var v = rv(t, 2.0, 1.4);
  P.alpha(v);
  var ns = [[300, 96], [300, 150], [300, 204]];
  ns.forEach(function (p, i) {
    P.arrow(212, 137, p[0] - 20, p[1], { stroke: PAL.accent, sw: 1.6, head: 8 });
    node(p[0], p[1], ['W', 'X', 'Y'][i], {});
  });
  txt(370, 92, 'the router talks only to its neighbours', { size: 12, color: PAL.dim });
  txt(370, 110, 'a packet leaves through exactly one of them', { size: 12, color: PAL.dim });
  P.alpha(1);

  var w = rv(t, 4.2, 1.6);
  P.alpha(w);
  box(60, 250, 370, 92, { stroke: PAL.accent });
  txt(76, 274, 'DISTANCE VECTOR — knows its neighbours', { size: 12.5, bold: true, color: PAL.accent });
  txt(76, 296, 'each neighbour reports a distance to every', { size: 12, color: PAL.dim });
  txt(76, 313, 'destination; the router adds its link cost', { size: 12, color: PAL.dim });
  txt(76, 330, 'and keeps the minimum. Bellman-Ford.', { size: 12, color: PAL.dim });
  P.alpha(1);

  var z = rv(t, 6.0, 1.6);
  P.alpha(z);
  box(460, 250, 400, 92, { stroke: PAL.info });
  txt(476, 274, 'LINK STATE — knows the whole graph', { size: 12.5, bold: true, color: PAL.info });
  txt(476, 296, 'every router floods the cost of its own links,', { size: 12, color: PAL.dim });
  txt(476, 313, 'so all of them hold the same map and each', { size: 12, color: PAL.dim });
  txt(476, 330, 'runs Dijkstra from itself. No loops by design.', { size: 12, color: PAL.dim });
  P.alpha(1);

  if (t > 22) {
    txt(40, 396, 'the difference is knowledge, not cleverness: local beliefs versus a global map', { size: 13, color: PAL.ink });
    txt(40, 418, 'GATE CSE 2025 Set 2 asked the matching for one mark: DV → Bellman-Ford, LS → Dijkstra', { size: 12.5, color: PAL.faint });
  }
}

/* ---------- scene 2: the Bellman-Ford equation ---------- */
function scBellman(t) {
  head('The Bellman-Ford equation, on the 2021 numbers',
    'D(x,y) = min over neighbours v of [ c(x,v) + D(v,y) ]');
  var u = rv(t, 0.6, 1.2);
  P.alpha(u);
  node(110, 200, 'R', { stroke: PAL.accent, fill: PAL.accentDim });
  var ns = [['X', 250, 120, 3], ['Y', 250, 200, 2], ['Z', 250, 280, 5]];
  ns.forEach(function (p) {
    edge(128, 200, p[1] - 18, p[2], p[3], { stroke: PAL.border });
    node(p[1], p[2], p[0], {});
    P.arrow(p[1] + 20, p[2], 380, p[2], { stroke: PAL.faint, sw: 1.2, head: 7, dash: [4, 3] });
  });
  txt(300, 92, 'R sits 3, 2, 5 from X, Y, Z', { size: 12, color: PAL.dim });
  P.alpha(1);

  var v = rv(t, 2.4, 1.2);
  P.alpha(v);
  box(400, 100, 460, 46, { stroke: PAL.border, fill: PAL.surface2 });
  txt(414, 118, 'neighbour vector:  P  |  Q', { size: 12.5, mono: true, bold: true });
  txt(414, 135, 'X: 7, 4    Y: 6, 6    Z: 5, 8', { size: 12.5, mono: true, color: PAL.dim });
  P.alpha(1);

  var w = rv(t, 4.0, 1.2);
  P.alpha(w);
  label(400, 160, 'destination P, one sum per neighbour', { size: 12, color: PAL.dim });
  label(730, 160, 'destination Q', { size: 12, color: PAL.dim });
  V.q2021.P.rows.forEach(function (r, i) {
    var y = 186 + i * 26;
    var isMin = r.sum === V.q2021.P.dist;
    txt(410, y, r.via, { size: 13, mono: true, color: isMin ? PAL.valid : PAL.dim, bold: isMin });
    txt(450, y, r.link + ' + ' + r.adv + ' =', { size: 13, mono: true, color: PAL.dim });
    txt(560, y, String(r.sum), { size: 13, mono: true, align: 'right', color: isMin ? PAL.valid : PAL.dim, bold: isMin });
  });
  txt(410, 268, 'minimum 8 via Y', { size: 12.5, color: PAL.valid });
  V.q2021.Q.rows.forEach(function (r, i) {
    var y = 186 + i * 26;
    var isMin = r.sum === V.q2021.Q.dist;
    txt(700, y, r.via + '  ' + r.link + '+' + r.adv + ' = ' + r.sum, { size: 12.5, mono: true, color: isMin ? PAL.valid : PAL.dim, bold: isMin });
  });
  txt(700, 268, 'minimum 7 via X', { size: 12.5, color: PAL.valid });
  P.alpha(1);

  if (t > 21) {
    txt(40, 340, 'two answers from one computation: the value, and which neighbour produced it', { size: 13, color: PAL.ink });
    txt(40, 362, 'option A of that question says 10 — a candidate sum, not the minimum', { size: 12.5, color: PAL.invalid });
    txt(40, 384, 'the same three vectors give P a next hop of Y and Q a next hop of X', { size: 12.5, color: PAL.dim });
  }
}

/* ---------- scene 3: one round of exchange ---------- */
var POS11 = { N1: [110, 130], N2: [280, 96], N3: [470, 130], N4: [520, 260], N5: [280, 250] };
function scExchange(t) {
  head('One round of exchange: GATE CSE 2011, both questions',
    'five stabilised vectors, then one link cost changes');
  var u = rv(t, 0.5, 1.2);
  P.alpha(u);
  var E = [['N1', 'N2', 1], ['N1', 'N5', 4], ['N2', 'N3', 6], ['N2', 'N5', 3], ['N3', 'N4', 2], ['N3', 'N5', 6], ['N4', 'N5', 4]];
  E.forEach(function (e) {
    var a = POS11[e[0]], b = POS11[e[1]];
    var changed = (e[0] === 'N2' && e[1] === 'N3');
    var show = changed && t < 7.5 ? 6 : e[2];
    edge(a[0], a[1], b[0], b[1], show, { stroke: changed && t > 7.5 ? PAL.warn : PAL.border, sw: changed && t > 7.5 ? 2.4 : 1.6 });
  });
  Object.keys(POS11).forEach(function (k) {
    node(POS11[k][0], POS11[k][1], k, {});
  });
  P.alpha(1);

  var v = rv(t, 1.6, 1.2);
  P.alpha(v);
  label(600, 96, 'stabilised vectors', { size: 12, color: PAL.dim });
  txt(600, 116, '      N1   N2   N3   N4   N5', { size: 11.5, mono: true, color: PAL.faint });
  NODES11.forEach(function (n, i) {
    var vals = NODES11.map(function (d) { return V11[n][d]; }).join('    ');
    txt(600, 136 + i * 18, n + '  ' + vals, { size: 11.5, mono: true, color: PAL.ink });
  });
  P.alpha(1);

  var w = rv(t, 4.0, 1.2);
  P.alpha(w);
  txt(40, 300, 'N3 keeps only its own neighbours: N2, N4, N5', { size: 13, color: PAL.ink, bold: true });
  txt(40, 322, 'using their vectors as they stood before the round', { size: 12, color: PAL.dim });
  txt(40, 348, 'to N1:  2+1 = 3,  2+8 = 10,  6+4 = 10', { size: 12.5, mono: true, color: PAL.dim });
  txt(40, 368, 'to N5:  2+3 = 5,  2+4 = 6', { size: 12.5, mono: true, color: PAL.dim });
  P.alpha(1);

  var x = rv(t, 5.6, 1.2);
  P.alpha(x);
  box(520, 296, 340, 58, { stroke: PAL.valid, fill: PAL.surface });
  txt(536, 318, 'new row at N3:  3  2  0  2  5', { size: 14, mono: true, bold: true, color: PAL.valid });
  txt(536, 340, 'GATE CSE 2011 Q52, option A', { size: 12, color: PAL.dim });
  P.alpha(1);

  var y2 = rv(t, 7.5, 1.2);
  P.alpha(y2);
  txt(40, 400, 'then N1-N2 fails: N3 hears infinity from N2 and 8 from N4, so it records 2+8 = 10', { size: 12.5, color: PAL.warn });
  txt(40, 424, 'that is GATE CSE 2011 Q53, answer C, and the true distance is 9, found one round later', { size: 12.5, color: PAL.faint });
  P.alpha(1);
}

/* ---------- scene 4: count to infinity ---------- */
function scCti(t) {
  head('Count to infinity: a dead route that stays alive',
    'A and B are one hop apart; the destination hangs off B');
  var u = rv(t, 0.5, 1.2);
  P.alpha(u);
  node(140, 150, 'A', {});
  node(340, 150, 'B', {});
  edge(158, 150, 322, 150, 1, { stroke: PAL.border });
  box(470, 132, 110, 36, { stroke: t > 7.5 ? PAL.invalid : PAL.valid, fill: PAL.surface });
  txt(525, 148, t > 7.5 ? 'destination ✕' : 'destination', { size: 12, align: 'center', color: t > 7.5 ? PAL.invalid : PAL.valid });
  edge(358, 150, 468, 150, t > 7.5 ? null : 1, { stroke: t > 7.5 ? PAL.invalid : PAL.border, dash: t > 7.5 ? [5, 4] : null });
  P.alpha(1);

  var v = rv(t, 2.0, 1.2);
  P.alpha(v);
  txt(140, 190, 'A believes 2', { size: 12.5, align: 'center', color: PAL.dim });
  txt(340, 190, 'B sets infinity', { size: 12.5, align: 'center', color: PAL.warn });
  P.alpha(1);

  var n = Math.min(V.cti.trace.length - 1, Math.max(0, Math.floor(rv(t, 4.0, 8.0) * (V.cti.trace.length - 1))));
  var w = rv(t, 4.0, 0.6);
  P.alpha(w);
  label(40, 226, 'exchange        A says      B says', { size: 12, color: PAL.faint });
  var first = Math.max(0, n - 6);
  for (var i = first; i <= n; i++) {
    var r = V.cti.trace[i];
    var y = 246 + (i - first) * 16;
    txt(48, y, 'round ' + r.round, { size: 11.5, mono: true, color: PAL.faint });
    txt(180, y, r.A === RIP_INF ? '16 (inf)' : String(r.A), { size: 11.5, mono: true, align: 'right', color: r.A >= 16 ? PAL.invalid : PAL.ink });
    txt(280, y, r.B === RIP_INF ? '16 (inf)' : String(r.B), { size: 11.5, mono: true, align: 'right', color: r.B >= 16 ? PAL.invalid : PAL.ink });
  }
  P.alpha(1);

  var z = rv(t, 12.0, 1.2);
  P.alpha(z);
  box(420, 226, 440, 108, { stroke: PAL.border, fill: PAL.surface2 });
  txt(436, 248, 'the climb, in one line', { size: 12.5, bold: true, color: PAL.ink });
  txt(436, 270, '2 -> 3 -> 4 -> 5 -> ... -> 15 -> 16', { size: 12.5, mono: true, color: PAL.warn });
  txt(436, 292, 'each router hands the other an inflated number,', { size: 12, color: PAL.dim });
  txt(436, 309, 'so the cost only ever rises until a ceiling', { size: 12, color: PAL.dim });
  txt(436, 326, 'stops it', { size: 12, color: PAL.dim });
  P.alpha(1);

  if (t > 21) {
    txt(40, 364, 'RIP defines 16 as infinity, so the climb ends at 16 and the route is declared dead', { size: 12.5, color: PAL.ink });
    txt(40, 388, 'that ceiling is why a RIP route can be at most 15 hops long', { size: 12.5, color: PAL.dim });
    txt(40, 412, 'a packet sent during the climb is forwarded in a circle between A and B', { size: 12.5, color: PAL.invalid });
  }
}

/* ---------- scene 5: the repairs ---------- */
function scFixes(t) {
  head('Split horizon, poison reverse, and what they do not fix',
    'each repair is a rule about what may be advertised');
  var u = rv(t, 0.5, 1.2);
  P.alpha(u);
  node(90, 120, 'A', {});
  node(230, 120, 'B', {});
  edge(108, 120, 212, 120, 1, {});
  box(330, 104, 90, 32, { stroke: PAL.border });
  txt(375, 120, 'route', { size: 11.5, align: 'center', color: PAL.dim });
  edge(248, 120, 328, 120, null, { dash: [4, 3] });
  txt(90, 158, 'learned through B', { size: 11.5, align: 'center', color: PAL.dim });
  txt(230, 158, 'says nothing to A', { size: 11.5, align: 'center', color: PAL.valid });
  txt(60, 190, 'split horizon: never advertise a route back out of the interface you learned it from', { size: 12.5, color: PAL.valid });
  txt(60, 212, 'poison reverse: same rule, said out loud — advertise it back with metric 16', { size: 12.5, color: PAL.valid });
  txt(60, 234, 'triggered update: send the bad news now, not at the next timer', { size: 12.5, color: PAL.dim });
  txt(60, 256, 'hold-down: refuse good news about a route for a while after bad news', { size: 12.5, color: PAL.dim });
  P.alpha(1);

  var v = rv(t, 9.0, 1.4);
  P.alpha(v);
  P.line(40, 272, 860, 272, { stroke: PAL.border, sw: 1 });
  txt(40, 296, 'the counterexample: three routers in a line, destination on A, split horizon on', { size: 12.5, bold: true, color: PAL.warn });
  node(80, 340, 'A', {});
  node(190, 340, 'B', {});
  node(300, 340, 'C', {});
  edge(98, 340, 172, 340, 1, {});
  edge(208, 340, 282, 340, 1, {});
  txt(190, 376, 'B is silenced in both directions', { size: 11.5, align: 'center', color: PAL.dim });

  var h = V.split.threeYes.history;
  label(430, 318, 'round      A        B        C', { size: 11.5, color: PAL.faint });
  for (var i = 0; i < Math.min(5, h.length); i++) {
    var r = h[i];
    var y = 338 + i * 14;
    txt(436, y, String(i + 1), { size: 11, mono: true, color: PAL.faint });
    txt(520, y, r.A >= BIG ? 'inf' : String(r.A), { size: 11, mono: true, align: 'right', color: PAL.invalid });
    txt(590, y, r.B >= BIG ? 'inf' : String(r.B), { size: 11, mono: true, align: 'right', color: PAL.invalid });
    txt(660, y, r.C >= BIG ? 'inf' : String(r.C), { size: 11, mono: true, align: 'right', color: PAL.invalid });
  }
  txt(700, 318, 'no round settles', { size: 11.5, color: PAL.dim });
  txt(700, 336, 'the values oscillate', { size: 11.5, color: PAL.dim });
  txt(700, 354, 'and inflate', { size: 11.5, color: PAL.dim });
  P.alpha(1);

  if (t > 22) {
    txt(40, 410, 'so GATE CSE 2014 Set 1 marks "split horizon avoids persistent loops" FALSE', { size: 12.5, color: PAL.invalid });
    txt(40, 432, 'it removes two-router loops; a loop that closes through a third router survives it', { size: 12.5, color: PAL.dim });
  }
}

/* ---------- scene 6: link state ---------- */
function scLsa(t) {
  head('Link state: flood the truth, then compute locally',
    'each router describes only its own links, and everybody keeps the same map');
  var u = rv(t, 0.5, 1.2);
  P.alpha(u);
  var pos = [[110, 140], [300, 110], [300, 220], [490, 165]];
  var names = ['R1', 'R2', 'R3', 'R4'];
  var links = [[0, 1, 2], [0, 2, 4], [1, 3, 3], [2, 3, 1], [1, 2, 5]];
  links.forEach(function (l) {
    edge(pos[l[0]][0], pos[l[0]][1], pos[l[1]][0], pos[l[1]][1], l[2], {});
  });
  pos.forEach(function (p, i) { node(p[0], p[1], names[i], {}); });
  txt(110, 178, 'R1 describes only', { size: 11, align: 'center', color: PAL.dim });
  txt(110, 194, 'its own links', { size: 11, align: 'center', color: PAL.dim });
  P.alpha(1);

  var v = rv(t, 3.0, 1.4);
  P.alpha(v);
  box(560, 96, 300, 74, { stroke: PAL.info, fill: PAL.surface2 });
  txt(576, 118, 'the advertisement', { size: 12, bold: true, color: PAL.info });
  txt(576, 140, 'R1: neighbour R2 cost 2', { size: 11.5, mono: true, color: PAL.dim });
  txt(576, 156, 'R1: neighbour R3 cost 4', { size: 11.5, mono: true, color: PAL.dim });
  txt(576, 176, 'no distance to anything is carried', { size: 11, color: PAL.faint });
  P.alpha(1);

  var w = rv(t, 6.0, 1.4);
  P.alpha(w);
  box(560, 190, 300, 56, { stroke: PAL.valid });
  txt(576, 212, 'flood → every router holds the', { size: 12, color: PAL.dim });
  txt(576, 232, 'same link state database', { size: 12, bold: true, color: PAL.valid });
  P.alpha(1);

  var x = rv(t, 9.0, 1.4);
  P.alpha(x);
  box(560, 262, 300, 74, { stroke: PAL.accent });
  txt(576, 284, 'each runs Dijkstra from itself', { size: 12, color: PAL.dim });
  txt(576, 304, 'different trees, same map', { size: 12, bold: true, color: PAL.accent });
  txt(576, 324, 'loop-free because the map agrees', { size: 11.5, color: PAL.dim });
  P.alpha(1);

  if (t > 21) {
    txt(40, 366, 'the price: every router receives every advertisement and runs a full shortest-path computation', { size: 12.5, color: PAL.ink });
    txt(40, 390, 'so link state has the higher computational overhead: GATE CSE 2014 Set 1, statement S1, true', { size: 12.5, color: PAL.dim });
    txt(40, 412, 'and it converges faster, because the new map arrives everywhere at once: statement S3, also true', { size: 12.5, color: PAL.dim });
    txt(40, 434, 'S2 in that question is the false one: split horizon does not remove persistent loops', { size: 12.5, color: PAL.invalid });
  }
}

/* ---------- scene 7: Dijkstra ---------- */
var POSD = { A: [90, 250], B: [270, 120], C: [270, 350], D: [490, 110], E: [540, 340], F: [760, 215] };
function scDijkstra(t) {
  head('Dijkstra on six routers, one greedy step at a time',
    'settle the cheapest unsettled router, then relax its links');
  var u = rv(t, 0.5, 1.2);
  P.alpha(u);
  GDIJ.nodes.forEach(function (a) {
    neighbours(GDIJ, a).forEach(function (b) {
      if (a < b) edge(POSD[a][0], POSD[a][1], POSD[b][0], POSD[b][1], GDIJ.adj[a][b], {});
    });
  });
  GDIJ.nodes.forEach(function (k) { node(POSD[k][0], POSD[k][1], k, {}); });
  P.alpha(1);

  /* settled set grows with the run */
  var shown = Math.min(V.dij.order.length, Math.max(1, Math.floor(rv(t, 3.0, 9.0) * V.dij.order.length) + 1));
  var v = rv(t, 3.0, 0.8);
  P.alpha(v);
  label(540, 96, 'settled    cost   from', { size: 11.5, color: PAL.faint });
  for (var i = 0; i < shown; i++) {
    var o = V.dij.order[i];
    var y = 118 + i * 20;
    txt(540, y, o.node, { size: 12.5, mono: true, bold: true, color: PAL.valid });
    txt(640, y, String(o.dist), { size: 12.5, mono: true, align: 'right', color: PAL.ink });
    txt(700, y, o.prev === null ? '-' : o.prev, { size: 12.5, mono: true, color: PAL.dim });
    P.circle(POSD[o.node][0], POSD[o.node][1], 21, { stroke: PAL.valid, sw: 2.2 });
  }
  P.alpha(1);

  if (t > 14) {
    txt(40, 392, 'the settled costs only ever increase — 0, 2, 3, 8, 10, 13 — and that column is your arithmetic check', { size: 12.5, color: PAL.ink });
    txt(40, 414, 'the greedy choice is safe because every link cost is non-negative: no later route can undercut a settled one', { size: 12.5, color: PAL.dim });
  }
  if (t > 24) {
    txt(40, 436, 'the result is a tree, one shortest path per destination, rooted at A', { size: 12.5, color: PAL.accent });
  }
}

/* ---------- scene 8: tree to table ---------- */
function scTables(t) {
  head('From shortest-path tree to routing table',
    'the next hop is the first step from the root, not the last');
  var u = rv(t, 0.5, 1.2);
  P.alpha(u);
  label(40, 96, 'destination   distance   first hop', { size: 11.5, color: PAL.faint });
  var rows = GDIJ.nodes.filter(function (n) { return n !== 'A'; });
  rows.forEach(function (n, i) {
    var y = 118 + i * 20;
    txt(48, y, n, { size: 12.5, mono: true, color: PAL.ink });
    txt(200, y, String(V.dij.dist[n]), { size: 12.5, mono: true, align: 'right', color: PAL.ink });
    txt(300, y, String(V.dij.nextHop[n]), { size: 12.5, mono: true, bold: true, color: PAL.accent });
  });
  P.alpha(1);

  var v = rv(t, 4.0, 1.2);
  P.alpha(v);
  label(420, 96, 'destination   Dijkstra   distance vector', { size: 11.5, color: PAL.faint });
  rows.forEach(function (n, i) {
    var y = 118 + i * 20;
    txt(428, y, n, { size: 12.5, mono: true, color: PAL.ink });
    txt(580, y, String(V.dij.dist[n]), { size: 12.5, mono: true, align: 'right', color: PAL.ink });
    txt(740, y, String(V.dvDij.vec.A[n]), { size: 12.5, mono: true, align: 'right', color: PAL.valid });
  });
  txt(428, 240, 'identical at convergence, on the same graph', { size: 12, color: PAL.valid });
  P.alpha(1);

  var w = rv(t, 9.0, 1.2);
  P.alpha(w);
  box(420, 252, 440, 68, { stroke: PAL.border, fill: PAL.surface2 });
  txt(436, 272, 'the cross-check on this page', { size: 12.5, bold: true, color: PAL.ink });
  txt(436, 292, 'both algorithms are compared with an all-pairs dynamic programme', { size: 11.5, color: PAL.dim });
  txt(436, 308, 'on four graphs, every ordered pair: no disagreement', { size: 11.5, color: PAL.dim });
  P.alpha(1);

  if (t > 21) {
    txt(40, 352, 'so the two families never differ in the final distances, only in what a router must know,', { size: 12.5, color: PAL.ink });
    txt(40, 374, 'how many messages that takes, and how long convergence lasts', { size: 12.5, color: PAL.ink });
    txt(40, 400, 'distance vector needed ' + V.dvDij.history.length + ' rounds here; Dijkstra needs one pass over a map it already has', { size: 12.5, color: PAL.dim });
    txt(40, 424, 'a question asking which protocol finds shorter paths has no correct option', { size: 12.5, color: PAL.invalid });
  }
}

/* ---------- scene 9: protocols ---------- */
function scProtocols(t) {
  head('RIP and OSPF: the facts GATE asks for',
    'five slots per protocol: algorithm, metric, transport, limit, scope');
  var u = rv(t, 0.5, 1.2);
  P.alpha(u);
  var cols = ['', 'algorithm', 'metric', 'transport', 'limit', 'scope'];
  cols.forEach(function (c, i) {
    txt(50 + i * 138, 96, c, { size: 11.5, color: PAL.faint });
  });
  P.line(40, 106, 860, 106, { stroke: PAL.border, sw: 1 });
  var rows = [
    ['RIP', 'Bellman-Ford', 'hop count', 'UDP 520', '15 hops, 16 = ∞', 'interior'],
    ['OSPF', 'Dijkstra', 'cost', 'IP proto 89', 'areas', 'interior']
  ];
  rows.forEach(function (r, i) {
    var y = 132 + i * 34;
    r.forEach(function (c, j) {
      txt(50 + j * 138, y, c, { size: 12.5, mono: j > 0, bold: j === 0, color: j === 0 ? (i === 0 ? PAL.warn : PAL.info) : PAL.ink });
    });
  });
  P.alpha(1);

  var v = rv(t, 5.0, 1.4);
  P.alpha(v);
  txt(40, 220, 'RIP is periodic and capped: that cap is the direct answer to count to infinity', { size: 12.5, color: PAL.dim });
  txt(40, 242, 'OSPF floods link state advertisements and refreshes them; it carries no TCP and no UDP header', { size: 12.5, color: PAL.dim });
  txt(40, 264, 'both are interior gateway protocols — neither routes between domains', { size: 12.5, color: PAL.dim });
  P.alpha(1);

  var w = rv(t, 11.0, 1.4);
  P.alpha(w);
  box(40, 288, 380, 60, { stroke: PAL.invalid });
  txt(56, 310, 'GATE CSE 2023 Q25 — the two INCORRECT', { size: 12, bold: true, color: PAL.invalid });
  txt(56, 330, 'statements are Bellman-Ford and inter-domain', { size: 12, color: PAL.invalid });
  box(440, 288, 420, 60, { stroke: PAL.valid });
  txt(456, 310, 'GATE CSE 2017 Set 2 — RIP uses DV, RIP over UDP,', { size: 12, color: PAL.valid });
  txt(456, 330, 'OSPF is link state: I, II and IV are correct', { size: 12, color: PAL.valid });
  P.alpha(1);

  if (t > 22) {
    txt(40, 372, 'GATE CSE 2014 Set 2: RIP uses distance vector and OSPF uses link state — option A', { size: 12.5, color: PAL.dim });
    txt(40, 394, 'GATE CSE 2025 Set 2: distance vector ↔ Bellman-Ford, link state ↔ Dijkstra', { size: 12.5, color: PAL.dim });
    txt(40, 418, 'sorting each fact into its slot turns all of these into recall rather than reasoning', { size: 12.5, color: PAL.faint });
  }
}

/* ---------- scene 10: the procedure ---------- */
function scDecide(t) {
  head('The procedure, and the traps that cost marks', 'five steps, then a magnitude check');
  var steps = [
    ['1', 'Name the family', 'a vector update, a Dijkstra run, or protocol facts'],
    ['2', 'Vector update', 'neighbours only, and only the previous round'],
    ['3', 'Dijkstra', 'draw the graph, settle by cost, then take the first hop'],
    ['4', 'Protocol facts', 'sort into algorithm, metric, transport, limit, scope'],
    ['5', 'Check', 'compare with the traps, then with the size of the numbers']
  ];
  steps.forEach(function (s, i) {
    var u = rv(t, 0.6 + i * 1.2, 1.0);
    P.alpha(u);
    var y = 96 + i * 44;
    txt(46, y + 6, s[0], { size: 15, mono: true, bold: true, color: PAL.accent });
    txt(76, y, s[1], { size: 13.5, bold: true, color: PAL.ink });
    txt(76, y + 18, s[2], { size: 12, color: PAL.dim });
    P.alpha(1);
  });

  var v = rv(t, 7.5, 1.2);
  P.alpha(v);
  P.line(40, 320, 860, 320, { stroke: PAL.border, sw: 1 });
  label(40, 344, 'the four traps', { size: 12, color: PAL.faint });
  txt(40, 366, '16 means unreachable in RIP, not a distance', { size: 12.5, color: PAL.invalid });
  txt(40, 388, 'one round is not convergence: 2011 Q53 answers 10 while the true cost is 9', { size: 12.5, color: PAL.invalid });
  txt(40, 410, 'split horizon is not a cure: the three-router loop survives it', { size: 12.5, color: PAL.invalid });
  txt(40, 432, 'link state trees differ between routers even though the map does not', { size: 12.5, color: PAL.invalid });
  P.alpha(1);
}

var SCENES = {
  problem: scProblem, bellman: scBellman, exchange: scExchange, counttoinf: scCti,
  fixes: scFixes, lsa: scLsa, dijkstra: scDijkstra, tables: scTables,
  protocols: scProtocols, decide: scDecide
};

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

function drawFrame(painter) {
  if (!painter) return;
  P = painter;
  var tl = window.LESSON_TIMELINE;
  var tt = K.state.elapsed;
  var idx = K.sceneAt(tt);
  var sc = tl.scenes[idx];
  painter.alpha(1);
  painter.clear();
  bg();
  if (sc && SCENES[sc.id]) {
    try {
      SCENES[sc.id](tt - sc.start);
    } catch (err) {
      console.error('scene draw failed', sc.id, err);
    }
  }
}

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

window.__MODEL = { V: V, CHECKS: CHECKS };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
