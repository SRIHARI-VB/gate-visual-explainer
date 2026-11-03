/* ==========================================================================
   graph-eccentricity-radius-diameter-centre — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It does no graph arithmetic of its own: every
   figure on the canvas was computed once here and checked against the rule it
   is supposed to satisfy — eccentricities against the row maxima, the radius
   and diameter bounds on every model graph, the tree theorem on all 18248
   labelled trees with 2 to 7 vertices, and the square-graph bound on all
   27475 connected graphs with at most 6 vertices.
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

/* ---------- 1. the primitives ---------- */

function buildAdj(n, edges) {
  var adj = [], i;
  for (i = 0; i < n; i++) adj.push([]);
  for (i = 0; i < edges.length; i++) {
    adj[edges[i][0]].push(edges[i][1]);
    adj[edges[i][1]].push(edges[i][0]);
  }
  return adj;
}

function bfsFrom(n, adj, s) {
  var d = [], i;
  for (i = 0; i < n; i++) d.push(-1);
  d[s] = 0;
  var q = [s];
  for (var h = 0; h < q.length; h++) {
    var v = q[h];
    for (i = 0; i < adj[v].length; i++) {
      var w = adj[v][i];
      if (d[w] < 0) { d[w] = d[v] + 1; q.push(w); }
    }
  }
  return d;
}

/* distance table, eccentricities, and the four quantities.
   A disconnected graph gets Infinity, which is not a number of edges: the
   centre and periphery are then reported as empty rather than as everything. */
function metrics(n, edges) {
  var adj = buildAdj(n, edges);
  var D = [], i, j;
  for (i = 0; i < n; i++) D.push(bfsFrom(n, adj, i));
  var connected = true;
  for (i = 0; i < n; i++) for (j = 0; j < n; j++) if (D[i][j] < 0) connected = false;
  var ecc = [];
  for (i = 0; i < n; i++) {
    if (!connected) { ecc.push(Infinity); continue; }
    var m = 0;
    for (j = 0; j < n; j++) if (D[i][j] > m) m = D[i][j];
    ecc.push(m);
  }
  var r = Infinity, d = -Infinity;
  for (i = 0; i < n; i++) {
    if (ecc[i] < r) r = ecc[i];
    if (ecc[i] > d) d = ecc[i];
  }
  var centre = [], peri = [];
  if (connected) {
    for (i = 0; i < n; i++) {
      if (ecc[i] === r) centre.push(i);
      if (ecc[i] === d) peri.push(i);
    }
  }
  return {
    n: n, edges: edges, adj: adj, D: D, ecc: ecc, r: r, d: d,
    centre: centre, peri: peri, connected: connected
  };
}

/* ---------- 2. the model graphs, with their drawing positions ---------- */

function pathEdges(n) {
  var e = [];
  for (var i = 0; i + 1 < n; i++) e.push([i, i + 1]);
  return e;
}
function cycleEdges(n) {
  var e = [];
  for (var i = 0; i < n; i++) e.push([i, (i + 1) % n]);
  return e;
}
function completeEdges(n) {
  var e = [];
  for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) e.push([i, j]);
  return e;
}
function starEdges(k) {
  var e = [];
  for (var i = 1; i <= k; i++) e.push([0, i]);
  return e;
}

var LAYOUT = {};

LAYOUT.T = [[120, 140], [215, 140], [310, 140], [405, 140], [500, 140], [310, 235], [310, 330]];
LAYOUT.P8 = [];
for (var pi = 0; pi < 8; pi++) LAYOUT.P8.push([110 + 95 * pi, 200]);
LAYOUT.C6 = [];
for (var ci = 0; ci < 6; ci++) {
  LAYOUT.C6.push([300 + 120 * Math.cos(-Math.PI / 2 + ci * Math.PI / 3),
                  215 + 120 * Math.sin(-Math.PI / 2 + ci * Math.PI / 3)]);
}
LAYOUT.diamond = [[190, 140], [330, 140], [190, 275], [330, 275]];
LAYOUT.offpath = [[250, 120], [250, 300], [385, 210], [110, 300], [110, 210]];
LAYOUT.pan = [[90, 150], [90, 270], [190, 210], [290, 210], [390, 210], [490, 210], [590, 210]];
LAYOUT.disc = [[120, 150], [120, 260], [225, 205], [430, 150], [430, 260], [535, 205]];

var GR = {
  T:        { n: 7,  edges: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6]], pos: LAYOUT.T },
  P8:       { n: 8,  edges: pathEdges(8), pos: LAYOUT.P8 },
  C6:       { n: 6,  edges: cycleEdges(6), pos: LAYOUT.C6 },
  diamond:  { n: 4,  edges: [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3]], pos: LAYOUT.diamond },
  offpath:  { n: 5,  edges: [[0, 1], [0, 2], [0, 4], [1, 2], [1, 3]], pos: LAYOUT.offpath },
  pan:      { n: 7,  edges: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 6]], pos: LAYOUT.pan },
  disc:     { n: 6,  edges: [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3]], pos: LAYOUT.disc },
  star7:    { n: 7,  edges: starEdges(6) },
  K4:       { n: 4,  edges: completeEdges(4) },
  K23:      { n: 5,  edges: [[0, 3], [0, 4], [1, 3], [1, 4], [2, 3], [2, 4]] },
  petersen: { n: 10, edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 5], [1, 6], [2, 7],
                             [3, 8], [4, 9], [5, 7], [7, 9], [9, 6], [6, 8], [8, 5]] },
  grid33:   { n: 9,  edges: [[0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8], [0, 3], [3, 6],
                             [1, 4], [4, 7], [2, 5], [5, 8]] }
};

var M = {};
for (var gk in GR) {
  if (!Object.prototype.hasOwnProperty.call(GR, gk)) continue;
  M[gk] = metrics(GR[gk].n, GR[gk].edges);
}
V.M = M;
V.T = M.T;

/* ---------- 3. the worked tree ----------
   Seven vertices. Row maxima are the eccentricities; the smallest is the
   radius, the largest the diameter. */
V.eccT = M.T.ecc;                 /* [4,3,2,3,4,3,4] */
V.rT = M.T.r;                     /* 2 */
V.dT = M.T.d;                     /* 4 */
V.centreT = M.T.centre;           /* [2] */
V.periT = M.T.peri;               /* [0,4,6] */
chk('worked tree: eccentricity of every vertex equals its row maximum',
  M.T.ecc.every(function (e, i) { return e === Math.max.apply(null, M.T.D[i]); }),
  'row maxima ' + M.T.ecc.join(','));
chk('worked tree: radius 2 and diameter 4, from the list 4,3,2,3,4,3,4',
  M.T.r === 2 && M.T.d === 4, 'r=' + M.T.r + ' d=' + M.T.d);
chk('worked tree: centre is the single vertex 2, periphery 0, 4 and 6',
  M.T.centre.join(',') === '2' && M.T.peri.join(',') === '0,4,6',
  'centre ' + M.T.centre + ' periphery ' + M.T.peri);
chk('worked tree: row 0 reads 0 1 2 3 4 3 4',
  M.T.D[0].join(' ') === '0 1 2 3 4 3 4', M.T.D[0].join(' '));
chk('worked tree: row 2 reads 2 1 0 1 2 1 2',
  M.T.D[2].join(' ') === '2 1 0 1 2 1 2', M.T.D[2].join(' '));
chk('worked tree: distance to 6 from 0 is four edges, though the drawing looks short',
  M.T.D[0][6] === 4, 'd(0,6)=' + M.T.D[0][6]);

/* ---------- 4. the bounds, on every model graph ----------
   ceil(d/2) <= r <= d for every connected graph. */
V.boundRows = [];
var boundNames = [
  ['T', 'tree on 7', 'tree'],
  ['P8', 'path on 8', 'path'],
  ['C6', 'cycle on 6', 'cycle'],
  ['star7', 'star, 6 leaves', 'star'],
  ['K4', 'complete K4', 'complete'],
  ['petersen', 'Petersen', 'self-centred'],
  ['grid33', '3x3 grid', 'grid'],
  ['pan', 'pan, 7 vertices', 'one cycle']
];
boundNames.forEach(function (row) {
  var m = M[row[0]];
  V.boundRows.push({
    key: row[0], name: row[1], kind: row[2], n: m.n,
    d: m.d, ceilHalf: Math.ceil(m.d / 2), r: m.r,
    self: m.r === m.d
  });
});
V.boundViolations = V.boundRows.filter(function (b) {
  return !(b.ceilHalf <= b.r && b.r <= b.d);
}).length;
chk('bounds: ceil(d/2) <= r <= d on all 8 model graphs', V.boundViolations === 0,
  V.boundViolations + ' violations');
chk('bounds: the six-cycle attains r = d = 3, so the ceiling is tight',
  M.C6.r === 3 && M.C6.d === 3, 'r=' + M.C6.r + ' d=' + M.C6.d);
chk('bounds: the six-cycle has radius 3 while ceil(d/2) is 2, so trees are special',
  M.C6.r === 3 && Math.ceil(M.C6.d / 2) === 2);
chk('bounds: Petersen is self-centred with r = d = 2',
  M.petersen.r === 2 && M.petersen.d === 2 && M.petersen.centre.length === 10,
  'centre size ' + M.petersen.centre.length);
chk('bounds: the star has radius 1 and diameter 2, centre the hub',
  M.star7.r === 1 && M.star7.d === 2 && M.star7.centre.join(',') === '0');
chk('bounds: K4 is self-centred with r = d = 1', M.K4.r === 1 && M.K4.d === 1);
chk('bounds: K(2,3) has r = d = 2', M.K23.r === 2 && M.K23.d === 2);

/* a separate four-cycle, so the counterexample is on the page as a graph */
var C4 = metrics(4, cycleEdges(4));
chk('counterexample: C4 has diameter 2 and radius 2, not ceil(2/2) = 1',
  C4.d === 2 && C4.r === 2, 'd=' + C4.d + ' r=' + C4.r);
chk('counterexample: C4 is self-centred, all four vertices in the centre',
  C4.centre.length === 4);

/* ---------- 5. paths and cycles by formula, against the table ---------- */
V.pathRows = [];
var pathBad = 0;
for (var pn = 2; pn <= 12; pn++) {
  var pm = metrics(pn, pathEdges(pn));
  var formulaEcc = [];
  for (var pv = 0; pv < pn; pv++) formulaEcc.push(Math.max(pv, pn - 1 - pv));
  var okEcc = pm.ecc.every(function (e, i) { return e === formulaEcc[i]; });
  var okR = pm.r === Math.ceil((pn - 1) / 2);
  var okC = pm.centre.length === (pn % 2 === 0 ? 2 : 1);
  if (!okEcc || !okR || !okC) pathBad++;
  V.pathRows.push({ n: pn, d: pm.d, r: pm.r, centre: pm.centre.slice(), ecc: pm.ecc.slice() });
}
chk('paths P2 to P12: e(v) = max(i, n-1-i), r = ceil((n-1)/2), one centre for odd n and two for even n',
  pathBad === 0, pathBad + ' paths failed');

V.cycleRows = [];
var cycleBad = 0, cycleSelf = 0;
for (var cn = 3; cn <= 12; cn++) {
  var cm = metrics(cn, cycleEdges(cn));
  if (!(cm.r === Math.floor(cn / 2) && cm.d === Math.floor(cn / 2))) cycleBad++;
  if (cm.centre.length === cn) cycleSelf++;
  V.cycleRows.push({ n: cn, d: cm.d, r: cm.r, ceilHalf: Math.ceil(cm.d / 2), centre: cm.centre.length });
}
chk('cycles C3 to C12: r = d = floor(n/2)', cycleBad === 0, cycleBad + ' cycles failed');
chk('cycles C3 to C12: every vertex is in the centre, so all ten are self-centred',
  cycleSelf === 10, cycleSelf + ' of 10');

/* ---------- 6. every labelled tree on 2 to 7 vertices ----------
   Prufer sequences enumerate them exactly: n^(n-2) trees on n vertices. */
function fromPrufer(seq) {
  var n = seq.length + 2, deg = [], i;
  for (i = 0; i < n; i++) deg.push(1);
  for (i = 0; i < seq.length; i++) deg[seq[i]]++;
  var edges = [];
  for (i = 0; i < seq.length; i++) {
    for (var v = 0; v < n; v++) {
      if (deg[v] === 1) {
        edges.push([v, seq[i]]);
        deg[v]--; deg[seq[i]]--;
        break;
      }
    }
  }
  var left = [];
  for (v = 0; v < n; v++) if (deg[v] === 1) left.push(v);
  edges.push([left[0], left[1]]);
  return edges;
}

function peelTrace(n, edges) {
  var adj = buildAdj(n, edges), deg = [], rem = [], i;
  for (i = 0; i < n; i++) deg.push(adj[i].length);
  for (i = 0; i < n; i++) rem.push(false);
  var alive = n, rounds = [], leaves = [];
  for (i = 0; i < n; i++) if (deg[i] <= 1) leaves.push(i);
  if (n <= 2) { leaves = []; for (i = 0; i < n; i++) leaves.push(i); }
  while (alive > 2 && leaves.length) {
    var gone = leaves.slice();
    rounds.push(gone);
    for (i = 0; i < gone.length; i++) { rem[gone[i]] = true; alive--; }
    var next = [];
    for (i = 0; i < gone.length; i++) {
      var nb = adj[gone[i]];
      for (var j = 0; j < nb.length; j++) {
        if (rem[nb[j]]) continue;
        deg[nb[j]]--;
        if (deg[nb[j]] === 1) next.push(nb[j]);
      }
    }
    leaves = next;
  }
  var centre = [];
  for (i = 0; i < n; i++) if (!rem[i]) centre.push(i);
  return { rounds: rounds, centre: centre };
}

function diameterPair(m) {
  var best = null, i, j;
  for (i = 0; i < m.n; i++) {
    for (j = 0; j < m.n; j++) {
      if (m.D[i][j] === m.d && (!best || i < best[0])) { best = [i, j]; break; }
    }
    if (best) break;
  }
  return best;
}
function shortestPath(m, u, v) {
  var path = [u], cur = u, guard = 0;
  while (cur !== v && guard++ < 1000) {
    var nb = m.adj[cur], next = -1;
    for (var i = 0; i < nb.length; i++) {
      if (m.D[nb[i]][v] === m.D[cur][v] - 1) { next = nb[i]; break; }
    }
    if (next < 0) break;
    cur = next;
    path.push(cur);
  }
  return path;
}

var treeCount = 0, treeBadR = 0, treeBadAdj = 0, treeBadPeel = 0, treeBadMid = 0;
var centreOne = 0, centreTwo = 0;
for (var tn = 2; tn <= 7; tn++) {
  var totalTrees = Math.pow(tn, tn - 2);
  for (var code = 0; code < totalTrees; code++) {
    var seq = [], c = code;
    for (var si = 0; si < tn - 2; si++) { seq.push(c % tn); c = Math.floor(c / tn); }
    var te = fromPrufer(seq);
    var tm = metrics(tn, te);
    treeCount++;
    if (tm.r !== Math.ceil(tm.d / 2)) treeBadR++;
    if (tm.centre.length === 1) centreOne++;
    else if (tm.centre.length === 2) {
      centreTwo++;
      if (tm.adj[tm.centre[0]].indexOf(tm.centre[1]) < 0) treeBadAdj++;
    } else treeBadAdj++;
    var pt = peelTrace(tn, te);
    if (pt.centre.length !== tm.centre.length ||
        pt.centre.some(function (v) { return tm.centre.indexOf(v) < 0; })) treeBadPeel++;
    var dp = diameterPair(tm);
    if (dp) {
      var sp = shortestPath(tm, dp[0], dp[1]);
      var mid = [];
      var a1 = sp[Math.floor((sp.length - 1) / 2)], a2 = sp[Math.ceil((sp.length - 1) / 2)];
      mid.push(a1); if (a2 !== a1) mid.push(a2);
      if (mid.length !== tm.centre.length ||
          mid.some(function (v) { return tm.centre.indexOf(v) < 0; })) treeBadMid++;
    }
  }
}
V.treeStats = {
  count: treeCount, badR: treeBadR, badAdj: treeBadAdj, badPeel: treeBadPeel,
  badMid: treeBadMid, centreOne: centreOne, centreTwo: centreTwo
};
chk('trees: ' + treeCount + ' labelled trees on 2 to 7 vertices enumerated',
  treeCount === 18248, String(treeCount));
chk('trees: r = ceil(d/2) on every one of them', treeBadR === 0, treeBadR + ' exceptions');
chk('trees: the centre has one vertex or two adjacent ones, never more',
  treeBadAdj === 0 && centreOne + centreTwo === treeCount,
  centreOne + ' single, ' + centreTwo + ' pairs, ' + treeBadAdj + ' bad');
chk('trees: peeling the leaves gives the same centre as the distance table',
  treeBadPeel === 0, treeBadPeel + ' mismatches');
chk('trees: the centre is the middle of a diameter path', treeBadMid === 0, treeBadMid + ' mismatches');

/* the two peel traces drawn in scene 6 */
V.peelP8 = peelTrace(8, pathEdges(8));
V.peelT = peelTrace(7, GR.T.edges);
chk('peeling the eight-vertex path takes three rounds and leaves 3 and 4',
  V.peelP8.rounds.length === 3 && V.peelP8.centre.join(',') === '3,4',
  V.peelP8.rounds.length + ' rounds, centre ' + V.peelP8.centre);
chk('peeling the seven-vertex tree takes two rounds and leaves vertex 2',
  V.peelT.rounds.length === 2 && V.peelT.centre.join(',') === '2',
  V.peelT.rounds.length + ' rounds, centre ' + V.peelT.centre);
chk('the peel round count is not the radius: three rounds against a radius of 4',
  V.peelP8.rounds.length !== M.P8.r, 'rounds ' + V.peelP8.rounds.length + ' radius ' + M.P8.r);

/* ---------- 7. the two sweeps ---------- */
function twoSweep(n, edges, start) {
  var adj = buildAdj(n, edges);
  var d1 = bfsFrom(n, adj, start), i, far = start, best = -1;
  for (i = 0; i < n; i++) if (d1[i] > best) { best = d1[i]; far = i; }
  var d2 = bfsFrom(n, adj, far), far2 = far;
  best = -1;
  for (i = 0; i < n; i++) if (d2[i] > best) { best = d2[i]; far2 = i; }
  return { from: start, mid: far, to: far2, len: best, firstHops: d1.slice() };
}
var sweepBadTrees = 0;
for (var sn = 2; sn <= 7; sn++) {
  var sTotal = Math.pow(sn, sn - 2);
  for (var sc2 = 0; sc2 < sTotal; sc2++) {
    var sseq = [], cc = sc2;
    for (var qi = 0; qi < sn - 2; qi++) { sseq.push(cc % sn); cc = Math.floor(cc / sn); }
    var se = fromPrufer(sseq);
    var sm = metrics(sn, se);
    if (twoSweep(sn, se, 0).len !== sm.d) sweepBadTrees++;
  }
}
V.sweep = { treeBad: sweepBadTrees, treeCount: treeCount };
chk('two sweeps: the true diameter on all ' + treeCount + ' trees', sweepBadTrees === 0,
  sweepBadTrees + ' wrong');

V.diamondSweep = twoSweep(4, GR.diamond.edges, 0);
V.diamond = M.diamond;
chk('two sweeps fail on the diamond: reports 1 where the diameter is 2',
  V.diamondSweep.len === 1 && M.diamond.d === 2,
  'sweep ' + V.diamondSweep.len + ' true ' + M.diamond.d);
chk('the diamond has eccentricities 1, 1, 2, 2, so its centre is 0 and 1',
  M.diamond.ecc.join(',') === '1,1,2,2' && M.diamond.centre.join(',') === '0,1');

/* ---------- 8. the centre off every diameter path ---------- */
var off = M.offpath;
var offCentre = off.centre;
var onNoPath = offCentre.filter(function (v) {
  for (var u = 0; u < off.n; u++) {
    for (var w = 0; w < off.n; w++) {
      if (off.D[u][w] !== off.d) continue;
      if (off.D[u][v] + off.D[v][w] === off.d) return false;
    }
  }
  return true;
});
V.off = {
  d: off.d, r: off.r, ecc: off.ecc.slice(), centre: offCentre.slice(),
  offCentre: onNoPath.slice(), pair: [3, 4], path: [3, 1, 0, 4]
};
chk('off-path graph: diameter 3, radius 2, eccentricities 2,2,2,3,3',
  off.d === 3 && off.r === 2 && off.ecc.join(',') === '2,2,2,3,3',
  'd=' + off.d + ' r=' + off.r + ' ecc ' + off.ecc.join(','));
chk('off-path graph: vertex 2 is in the centre and lies on no diameter path',
  onNoPath.length === 1 && onNoPath[0] === 2, 'off-path centres ' + onNoPath);
chk('off-path graph: the only pair at distance 3 is 3 and 4, and the path 3-1-0-4 avoids 2',
  off.D[3][4] === 3 && off.D[3][2] + off.D[2][4] === 4,
  'd(3,2)+d(2,4)=' + (off.D[3][2] + off.D[2][4]));

/* ---------- 9. the disconnected graph ---------- */
chk('disconnected: every eccentricity is infinite, so there is no radius or diameter',
  !M.disc.connected && M.disc.ecc.every(function (e) { return e === Infinity; }),
  'connected=' + M.disc.connected);
chk('disconnected: the centre is reported empty rather than as every vertex',
  M.disc.centre.length === 0);

/* ---------- 10. centre, centroid, median on the pan ---------- */
function centroidOf(n, edges) {
  var adj = buildAdj(n, edges), out = [], v;
  for (v = 0; v < n; v++) {
    var seen = [], i;
    for (i = 0; i < n; i++) seen.push(false);
    seen[v] = true;
    var biggest = 0;
    for (var s = 0; s < n; s++) {
      if (seen[s]) continue;
      var q = [s], cnt = 0;
      seen[s] = true;
      for (var h = 0; h < q.length; h++) {
        cnt++;
        var nb = adj[q[h]];
        for (i = 0; i < nb.length; i++) if (!seen[nb[i]]) { seen[nb[i]] = true; q.push(nb[i]); }
      }
      if (cnt > biggest) biggest = cnt;
    }
    out.push(biggest);
  }
  var mn = Math.min.apply(null, out), set = [];
  for (v = 0; v < n; v++) if (out[v] === mn) set.push(v);
  return { weight: out, set: set };
}
function medianOf(m) {
  var sums = m.D.map(function (row) {
    return row.reduce(function (a, b) { return a + b; }, 0);
  });
  var mn = Math.min.apply(null, sums), set = [];
  for (var v = 0; v < m.n; v++) if (sums[v] === mn) set.push(v);
  return { sums: sums, set: set };
}
var panC = centroidOf(M.pan.n, M.pan.edges);
var panM = medianOf(M.pan);
V.pan = {
  centre: M.pan.centre.slice(), centroid: panC.set.slice(), median: panM.set.slice(),
  ecc: M.pan.ecc.slice(), d: M.pan.d, r: M.pan.r
};
chk('pan: centre is 3 and 4, centroid and median are only 3 — three different answers',
  M.pan.centre.join(',') === '3,4' && panC.set.join(',') === '3' && panM.set.join(',') === '3',
  'centre ' + M.pan.centre + ' centroid ' + panC.set + ' median ' + panM.set);
chk('pan: diameter 5 and radius 3, so the tree formula would also give ceil(5/2) = 3',
  M.pan.d === 5 && M.pan.r === 3, 'd=' + M.pan.d + ' r=' + M.pan.r);
var gridC = centroidOf(M.grid33.n, M.grid33.edges);
chk('grid: the centre is the single vertex 4 while every vertex is a centroid',
  M.grid33.centre.join(',') === '4' && gridC.set.length === 9,
  'centre ' + M.grid33.centre + ' centroids ' + gridC.set.length);

/* ---------- 11. the square graph ----------
   N_ij = 1 when the two vertices are at distance one or two in G.
   Claim: diam(G^2) = ceil(diam(G)/2) exactly. */
function squareGraph(n, edges) {
  var adj = buildAdj(n, edges), D = [], i, j, extra = [];
  for (i = 0; i < n; i++) D.push(bfsFrom(n, adj, i));
  for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) if (D[i][j] === 2) extra.push([i, j]);
  return edges.concat(extra);
}
var sqChecked = 0, sqBad = 0, sqStrict = 0;
for (var qn = 2; qn <= 6; qn++) {
  var pairs = [];
  for (var a = 0; a < qn; a++) for (var b = a + 1; b < qn; b++) pairs.push([a, b]);
  var masks = 1 << pairs.length;
  for (var mask = 0; mask < masks; mask++) {
    var qe = [];
    for (var k = 0; k < pairs.length; k++) if (mask & (1 << k)) qe.push(pairs[k]);
    var qm = metrics(qn, qe);
    if (!qm.connected) continue;
    var q2 = metrics(qn, squareGraph(qn, qe));
    sqChecked++;
    if (q2.d > Math.ceil(qm.d / 2)) sqBad++;
    if (q2.d < Math.ceil(qm.d / 2)) sqStrict++;
  }
}
V.square = { checked: sqChecked, bad: sqBad, strict: sqStrict };
chk('square graph: diam(G^2) = ceil(d/2) on all ' + sqChecked + ' connected graphs with at most 6 vertices',
  sqBad === 0 && sqStrict === 0, sqBad + ' above, ' + sqStrict + ' below');
chk('square graph: the path on 8 gives 7 then 4, and the six-cycle gives 3 then 2',
  metrics(8, squareGraph(8, pathEdges(8))).d === 4 &&
  metrics(6, squareGraph(6, cycleEdges(6))).d === 2);

/* ---------- 12. the two previous-year numbers ---------- */
V.pyq = {
  d2025: 30,
  answer2025: Math.ceil(30 / 2),
  pathD: M.P8.d,
  pathSq: metrics(8, squareGraph(8, pathEdges(8))).d
};
chk('GATE CSE 2025 Set 1 Q43: diameter 30 forces a BFS height of at least 15',
  V.pyq.answer2025 === 15, String(V.pyq.answer2025));
chk('GATE CSE 2021 Set 1 Q20: the path on 8 has diameter 7 and its square has diameter 4 = ceil(7/2)',
  V.pyq.pathD === 7 && V.pyq.pathSq === 4, V.pyq.pathD + ' -> ' + V.pyq.pathSq);

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function txt(x, y, s, o) { P.text(x, y, s, o || {}); }
function heading(s) { txt(28, 22, s, { size: 15, bold: true, color: INK }); }
function subline(s) { txt(28, 44, s, { size: 11.5, color: DIM }); }
function card(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1, radius: 8 });
}
function note(x, y, s, o) {
  o = o || {};
  txt(x, y, s, { size: o.size || 11.5, color: o.color || DIM, bold: !!o.bold, mono: !!o.mono });
}
function prog(t, sc) {
  if (!sc || sc.end === sc.start) return 1;
  var p = (t - sc.start) / (sc.end - sc.start);
  return p < 0 ? 0 : p > 1 ? 1 : p;
}

function drawGraph(g, opt) {
  opt = opt || {};
  var i, j;
  for (i = 0; i < g.edges.length; i++) {
    var e = g.edges[i];
    var a = g.pos[e[0]], b = g.pos[e[1]];
    var hot = false;
    if (opt.path) {
      for (j = 0; j + 1 < opt.path.length; j++) {
        if ((opt.path[j] === e[0] && opt.path[j + 1] === e[1]) ||
            (opt.path[j] === e[1] && opt.path[j + 1] === e[0])) hot = true;
      }
    }
    if (opt.dashed && opt.dashed(e)) {
      P.line(a[0], a[1], b[0], b[1], { stroke: FAINT, sw: 1.2, dash: [4, 4] });
    } else {
      P.line(a[0], a[1], b[0], b[1], { stroke: hot ? ACC : BORDER, sw: hot ? 3 : 1.6 });
    }
  }
  for (i = 0; i < g.n; i++) {
    var p = g.pos[i];
    var fill = SURF, stroke = BORDER, sw = 1.6, rad = 15;
    if (opt.fill) { var f = opt.fill(i); if (f) fill = f; }
    if (opt.ring) { var rg = opt.ring(i); if (rg) { stroke = rg; sw = 2.8; } }
    if (opt.radius) { var rr = opt.radius(i); if (rr) rad = rr; }
    if (opt.hide && opt.hide(i)) continue;
    P.circle(p[0], p[1], rad, { fill: fill, stroke: stroke, sw: sw });
    txt(p[0], p[1], String(i), {
      size: 12, mono: true, align: 'center', base: 'middle',
      color: INK, bold: true
    });
    if (opt.label) {
      var lb = opt.label(i);
      if (lb) txt(p[0], p[1] + rad + 14, lb, { size: 10, mono: true, align: 'center', color: DIM });
    }
  }
}

var SCENE_DRAW = {};

/* ---- scene 1: distance ---- */
SCENE_DRAW.dist = function (t, sc) {
  var p = prog(t, sc);
  heading('Distance is a count of edges, and breadth-first search is what counts it');
  subline('Seven vertices, one source. The layer a vertex lands in is its distance from vertex 0.');

  var layers = [[0], [1], [2], [3, 5], [4, 6]];
  var shown = {};
  var upto = Math.min(layers.length, 1 + Math.floor(p * layers.length * 1.05));
  for (var i = 0; i < upto; i++) for (var j = 0; j < layers[i].length; j++) shown[layers[i][j]] = i;

  drawGraph(GR.T, {
    fill: function (v) {
      if (shown[v] === undefined) return SURF2;
      return shown[v] === 0 ? ACCDIM : (shown[v] % 2 ? WARNDIM : SURF);
    },
    ring: function (v) { return shown[v] === undefined ? FAINT : ACC; },
    label: function (v) { return shown[v] === undefined ? null : 'd=' + shown[v]; }
  });

  /* layer list on the right */
  var x0 = 590, y0 = 108;
  card(x0, y0, 282, 214, { fill: SURF });
  txt(x0 + 16, y0 + 24, 'BFS layers from vertex 0', { size: 12, bold: true, color: INK });
  var labels = ['0', '1', '2', '3 and 5', '4 and 6'];
  for (var k = 0; k < 5; k++) {
    if (k >= upto) break;
    var yy = y0 + 56 + k * 32;
    P.circle(x0 + 30, yy, 12, { fill: k === 0 ? ACCDIM : SURF2, stroke: ACC, sw: 1.2 });
    txt(x0 + 30, yy, String(k), { size: 11, mono: true, align: 'center', base: 'middle', color: ACC, bold: true });
    txt(x0 + 52, yy, 'vertices ' + labels[k], { size: 11.5, color: INK, base: 'middle' });
  }
  note(28, 384, 'Vertex 6 sits near vertex 0 on the canvas and is four edges away: 0-1-2-5-6.', { color: INK });
  note(28, 406, 'Position on the page carries no information. Every number here is computed from the edge list.');
  note(28, 432, 'The table of all 49 distances is the object the rest of the lesson reads.', { color: ACC });
};

/* ---- scene 2: eccentricity ---- */
SCENE_DRAW.ecc = function (t, sc) {
  var p = prog(t, sc);
  heading('Eccentricity is the largest number in one row of the distance table');
  subline('The diagonal is zero, the table is symmetric, and a row maximum is a worst-case distance.');

  var cw = 40, chh = 27, x0 = 168, y0 = 116;
  var row = (t - sc.start) < 16 ? 0 : 2;

  /* header row and column */
  for (var j = 0; j < 7; j++) {
    txt(x0 + j * cw + cw / 2, y0 - 8, String(j), { size: 10.5, mono: true, align: 'center', color: DIM, bold: true });
  }
  txt(x0 - 16, y0 - 8, 'from \\ to', { size: 9.5, align: 'right', color: FAINT });

  for (var i = 0; i < 7; i++) {
    var yy = y0 + i * chh;
    if (i === row) P.rect(x0 - 6, yy - 2, cw * 7 + 12, chh - 1, { fill: ACCDIM, radius: 4 });
    txt(x0 - 16, yy + chh / 2, String(i), { size: 10.5, mono: true, align: 'right', base: 'middle', color: DIM, bold: true });
    for (j = 0; j < 7; j++) {
      var val = M.T.D[i][j];
      var isMax = (i === row && val === Math.max.apply(null, M.T.D[i]));
      if (isMax) {
        P.rect(x0 + j * cw + 4, yy + 3, cw - 8, chh - 8, { stroke: ACC, sw: 2, radius: 3, fill: SURF });
      }
      txt(x0 + j * cw + cw / 2, yy + chh / 2, String(val), {
        size: 11, mono: true, align: 'center', base: 'middle',
        color: i === row ? INK : FAINT, bold: isMax
      });
    }
  }

  /* eccentricity column */
  var ex = x0 + cw * 7 + 26;
  txt(ex + 30, y0 - 8, 'e(v)', { size: 10.5, mono: true, align: 'center', color: ACC, bold: true });
  for (i = 0; i < 7; i++) {
    if (i > row) break;
    txt(ex + 30, y0 + i * chh + chh / 2, String(M.T.ecc[i]), {
      size: 11.5, mono: true, align: 'center', base: 'middle',
      color: i === row ? ACC : FAINT, bold: i === row
    });
  }

  /* right-hand explanation */
  var bx = 596;
  card(bx, 100, 276, 216, { fill: SURF });
  txt(bx + 16, 126, row === 0 ? 'Row 0' : 'Row 2', { size: 12.5, bold: true, color: INK });
  if (row === 0) {
    note(bx + 16, 152, '0  1  2  3  4  3  4', { mono: true, size: 12, color: INK });
    note(bx + 16, 176, 'The largest entry is 4, at', { size: 11 });
    note(bx + 16, 194, 'columns 4 and 6.', { size: 11 });
    note(bx + 16, 224, 'So e(0) = 4: vertex 0 has a', { size: 11 });
    note(bx + 16, 242, 'vertex four edges away.', { size: 11 });
    note(bx + 16, 272, 'A leaf, and not a central one.', { size: 10.5, color: WARN });
  } else {
    note(bx + 16, 152, '2  1  0  1  2  1  2', { mono: true, size: 12, color: INK });
    note(bx + 16, 176, 'The largest entry is 2, at', { size: 11 });
    note(bx + 16, 194, 'columns 0, 4 and 6.', { size: 11 });
    note(bx + 16, 224, 'So e(2) = 2: vertex 2 is never', { size: 11 });
    note(bx + 16, 242, 'more than two edges from', { size: 11 });
    note(bx + 16, 260, 'anything.', { size: 11 });
    note(bx + 16, 286, 'The smallest row maximum.', { size: 10.5, color: ACC });
  }
  note(28, 356, 'Eccentricity is per vertex. One table gives all seven, and no algorithm beyond one search per row.', { color: INK });
  note(28, 380, 'It is a maximum, not an average: the mean of row 0 is 2.43, which is no graph quantity at all.');
};

/* ---- scene 3: the four numbers ---- */
SCENE_DRAW.four = function (t, sc) {
  var p = prog(t, sc);
  heading('Four numbers, all read off one list of seven eccentricities');
  subline('4, 3, 2, 3, 4, 3, 4 — the maximum is the diameter, the minimum the radius.');

  var base = 320, x0 = 96, bw = 50, gap = 16, unit = 46;
  var maxE = 4;
  /* axis */
  P.line(x0 - 12, base, x0 + 7 * (bw + gap) + 4, base, { stroke: BORDER, sw: 1.2 });
  for (var u = 0; u <= maxE; u++) {
    var gy = base - u * unit;
    P.line(x0 - 12, gy, x0 + 7 * (bw + gap) + 4, gy, { stroke: SURF2, sw: 1 });
    txt(x0 - 20, gy, String(u), { size: 10, mono: true, align: 'right', base: 'middle', color: FAINT });
  }

  for (var v = 0; v < 7; v++) {
    var e = M.T.ecc[v];
    var h = e * unit;
    var bx = x0 + v * (bw + gap);
    var isCentre = M.T.centre.indexOf(v) >= 0;
    var isPeri = M.T.peri.indexOf(v) >= 0;
    if (p < 0.08 + v * 0.06) continue;
    P.rect(bx, base - h, bw, h, {
      fill: isCentre ? ACCDIM : (isPeri ? WARNDIM : SURF2),
      stroke: isCentre ? ACC : (isPeri ? WARN : BORDER),
      sw: isCentre || isPeri ? 2 : 1,
      radius: 4
    });
    txt(bx + bw / 2, base - h - 12, String(e), { size: 11, mono: true, align: 'center', color: INK, bold: true });
    txt(bx + bw / 2, base + 16, 'v' + v, { size: 10.5, mono: true, align: 'center', color: DIM });
  }

  /* diameter line and radius line */
  if (p > 0.45) {
    P.line(x0 - 12, base - 4 * unit, x0 + 7 * (bw + gap) + 4, base - 4 * unit, { stroke: WARN, sw: 1.6, dash: [6, 4] });
    txt(x0 + 7 * (bw + gap) + 10, base - 4 * unit, 'd = 4', { size: 11, color: WARN, bold: true, base: 'middle' });
  }
  if (p > 0.6) {
    P.line(x0 - 12, base - 2 * unit, x0 + 7 * (bw + gap) + 4, base - 2 * unit, { stroke: ACC, sw: 1.6, dash: [6, 4] });
    txt(x0 + 7 * (bw + gap) + 10, base - 2 * unit, 'r = 2', { size: 11, color: ACC, bold: true, base: 'middle' });
  }

  /* the four quantities */
  var bx2 = 606;
  card(bx2, 96, 266, 232, { fill: SURF });
  txt(bx2 + 16, 122, 'The four quantities', { size: 12.5, bold: true, color: INK });
  var rows = [
    ['eccentricity', 'per vertex', '4, 3, 2, 3, 4, 3, 4', DIM],
    ['diameter', 'max of the list', '4', WARN],
    ['radius', 'min of the list', '2', ACC],
    ['centre', 'attains the radius', 'vertex 2', ACC],
    ['periphery', 'attains the diameter', '0, 4, 6', WARN]
  ];
  for (var i = 0; i < rows.length; i++) {
    if (p < 0.15 + i * 0.12) break;
    var yy = 148 + i * 34;
    txt(bx2 + 16, yy, rows[i][0], { size: 11.5, color: rows[i][3], bold: true });
    txt(bx2 + 128, yy, rows[i][1], { size: 10.5, color: DIM });
    txt(bx2 + 16, yy + 15, rows[i][2], { size: 11, mono: true, color: INK });
  }
  note(28, 372, 'Radius is a minimum and diameter a maximum of the same list. Neither is an average, and neither needs a second pass.', { color: INK });
  note(28, 396, 'Centre and periphery are sets. Here the centre has one vertex and the periphery three, and the two sets never overlap.');
};

/* ---- scene 4: the bounds ---- */
SCENE_DRAW.bounds = function (t, sc) {
  var p = prog(t, sc);
  heading('Half the diameter is a floor, the diameter itself a ceiling');
  subline('For every connected graph: ceil(d/2) <= r <= d. Both ends are attained, by different graphs.');

  var x0 = 60, y0 = 118, rh = 30;
  var cols = [0, 176, 226, 288, 350, 418];
  var heads = ['graph', 'n', 'd', 'ceil(d/2)', 'r', 'note'];
  for (var c = 0; c < heads.length; c++) {
    txt(x0 + cols[c], y0 - 10, heads[c], { size: 10.5, bold: true, color: DIM });
  }
  P.line(x0 - 8, y0, x0 + 620, y0, { stroke: BORDER, sw: 1.2 });

  for (var i = 0; i < V.boundRows.length; i++) {
    if (p < 0.05 + i * 0.07) break;
    var b = V.boundRows[i];
    var yy = y0 + 22 + i * rh;
    txt(x0 + cols[0], yy, b.name, { size: 11.5, color: INK, bold: true });
    txt(x0 + cols[1], yy, String(b.n), { size: 11, mono: true, color: DIM });
    txt(x0 + cols[2], yy, String(b.d), { size: 11, mono: true, color: INK });
    txt(x0 + cols[3], yy, String(b.ceilHalf), { size: 11, mono: true, color: DIM });
    txt(x0 + cols[4], yy, String(b.r), { size: 11, mono: true, color: b.r === b.ceilHalf ? ACC : WARN, bold: true });
    txt(x0 + cols[5], yy, b.self ? 'r = d' : (b.r === b.ceilHalf ? 'floor' : 'between'),
      { size: 10.5, color: b.self ? WARN : DIM });
  }

  card(600, 108, 272, 126, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  txt(616, 132, 'The lower bound, in one line', { size: 11.5, bold: true, color: ACC });
  note(616, 156, 'Take a centre c and a pair u, v', { size: 11, color: INK });
  note(616, 174, 'at distance d. Then', { size: 11, color: INK });
  note(616, 196, 'd <= d(u,c) + d(c,v) <= 2r,', { size: 11, mono: true, color: INK });
  note(616, 218, 'so ceil(d/2) <= r.', { size: 11, mono: true, color: INK });

  note(28, 372, 'The six-cycle reaches the ceiling: radius 3 and diameter 3, so every vertex is in its centre.', { color: INK });
  note(28, 396, 'The eight-vertex path reaches the floor: diameter 7 and radius 4, exactly ceil(7/2).', { color: ACC });
  note(28, 420, 'A cycle of even length has radius greater than ceil(d/2), which is why the tree formula must not be borrowed.', { color: WARN });
};

/* ---- scene 5: trees ---- */
SCENE_DRAW.tree = function (t, sc) {
  var p = prog(t, sc);
  heading('On a tree the floor is always reached, and the centre is the middle of a diameter path');
  subline('Eight-vertex path: diameter 7, radius 4, centre the pair 3 and 4.');

  var all = [];
  for (var i = 0; i < 8; i++) all.push(i);
  drawGraph(GR.P8, {
    path: p > 0.2 ? all : null,
    fill: function (v) { return M.P8.centre.indexOf(v) >= 0 ? ACCDIM : SURF; },
    ring: function (v) { return M.P8.centre.indexOf(v) >= 0 ? ACC : BORDER; },
    label: function (v) { return 'e=' + M.P8.ecc[v]; }
  });
  txt(110, 96, 'a diameter path: 0 to 7, seven edges', { size: 11, color: ACC });
  txt(110, 118, 'radius = ceil(7/2) = 4, attained at 3 and 4', { size: 11, color: DIM });

  card(40, 268, 410, 96, { fill: SURF });
  txt(56, 292, 'The seven-vertex tree, for comparison', { size: 11.5, bold: true, color: INK });
  note(56, 314, 'diameter 4, radius 2 = ceil(4/2), centre the single vertex 2.', { size: 11 });
  note(56, 334, 'An even diameter leaves one centre; an odd diameter leaves two.', { size: 11 });

  card(500, 258, 372, 118, { fill: SURF });
  txt(516, 282, 'Checked here, not asserted', { size: 11.5, bold: true, color: ACC });
  note(516, 304, 'All ' + V.treeStats.count + ' labelled trees on 2 to 7 vertices', { size: 11, color: INK });
  note(516, 322, 'were built from their Prufer sequences and tested:', { size: 11 });
  note(516, 344, '0 exceptions to r = ceil(d/2);', { size: 11, color: VAL });
  note(516, 362, V.treeStats.centreOne + ' with one centre, ' + V.treeStats.centreTwo + ' with two, none with more.', { size: 11, color: VAL });

  note(28, 392, 'A tree has exactly one path between any two vertices, so a longest path is also a shortest one,', { color: INK });
  note(28, 412, 'and the middle of it serves every vertex. That is the whole proof, and it is why the floor is reached.', { color: INK });
  note(28, 436, 'The check over small trees is evidence for the theorem, not the theorem itself.', { color: WARN });
};

/* ---- scene 6: peeling ---- */
SCENE_DRAW.peel = function (t, sc) {
  var p = prog(t, sc);
  heading('Peeling the leaves finds the centre without any distance table');
  subline('One round removes every current leaf at once. Stop at one or two vertices.');

  var rounds = V.peelP8.rounds.length;
  var shownRound = Math.min(rounds, Math.floor(p * (rounds + 0.8)));

  /* the path, with round numbers under the removed vertices */
  var y0 = 150;
  var px = [];
  for (var pxi = 0; pxi < 8; pxi++) px.push([88 + 58 * pxi, y0]);
  for (var i = 0; i < 8; i++) {
    var pos = px[i];
    var round = -1;
    for (var r = 0; r < V.peelP8.rounds.length; r++) if (V.peelP8.rounds[r].indexOf(i) >= 0) round = r + 1;
    var gone = round > 0 && round <= shownRound;
    var isCentre = V.peelP8.centre.indexOf(i) >= 0;
    P.circle(pos[0], y0, 15, {
      fill: isCentre && shownRound >= rounds ? ACCDIM : (gone ? SURF2 : SURF),
      stroke: isCentre && shownRound >= rounds ? ACC : (gone ? FAINT : BORDER),
      sw: 1.8
    });
    txt(pos[0], y0, String(i), { size: 12, mono: true, align: 'center', base: 'middle', color: gone ? FAINT : INK, bold: true });
    if (round > 0) {
      txt(pos[0], y0 + 34, 'round ' + round, { size: 9.5, mono: true, align: 'center', color: gone ? WARN : FAINT });
    }
  }
  txt(88, 104, 'Path on 8: three rounds leave 3 and 4', { size: 11, color: ACC });

  /* the seven-vertex tree: edges first, then the vertices on top */
  var Tpos = LAYOUT.T;
  for (i = 0; i < GR.T.edges.length; i++) {
    var te2 = GR.T.edges[i];
    var ta = [Tpos[te2[0]][0] * 0.66 + 30, Tpos[te2[0]][1] * 0.34 + 262];
    var tb = [Tpos[te2[1]][0] * 0.66 + 30, Tpos[te2[1]][1] * 0.34 + 262];
    P.line(ta[0], ta[1], tb[0], tb[1], { stroke: BORDER, sw: 1.4 });
  }
  for (i = 0; i < 7; i++) {
    var pp = [Tpos[i][0] * 0.66 + 30, Tpos[i][1] * 0.34 + 262];
    var rr = -1;
    for (r = 0; r < V.peelT.rounds.length; r++) if (V.peelT.rounds[r].indexOf(i) >= 0) rr = r + 1;
    var g2 = rr > 0 && rr <= shownRound;
    P.circle(pp[0], pp[1], 14, {
      fill: (!g2) ? ACCDIM : SURF2,
      stroke: (!g2) ? ACC : FAINT,
      sw: 1.8
    });
    txt(pp[0], pp[1], String(i), { size: 11.5, mono: true, align: 'center', base: 'middle', color: g2 ? FAINT : INK, bold: true });
    if (rr > 0) txt(pp[0] - 22, pp[1] + 4, 'r' + rr, { size: 9, mono: true, align: 'right', color: g2 ? WARN : FAINT });
  }
  txt(30, 250, 'Tree on 7: two rounds leave 2', { size: 11, color: ACC });

  card(560, 100, 312, 190, { fill: SURF });
  txt(576, 124, 'Why it is linear', { size: 11.5, bold: true, color: INK });
  note(576, 148, 'Each vertex is removed once and each', { size: 11 });
  note(576, 166, 'edge examined twice, so the cost is', { size: 11 });
  note(576, 184, 'proportional to vertices plus edges.', { size: 11 });
  note(576, 212, 'The distance table costs one search', { size: 11 });
  note(576, 230, 'per vertex instead.', { size: 11 });
  note(576, 262, 'Rounds: ' + V.peelP8.rounds.length + ' here, ' + V.peelT.rounds.length + ' on the tree.', { size: 10.5, color: ACC });

  note(28, 424, 'The round count is not the radius: three rounds on the path, and its radius is 4.', { color: WARN });
  note(28, 446, 'A round removes all current leaves together; on a graph with a cycle the peel never starts.', { color: INK });
};

/* ---- scene 7: two sweeps ---- */
SCENE_DRAW.twobfs = function (t, sc) {
  var p = prog(t, sc);
  heading('Two sweeps find a diameter on every tree, and fail on a four-vertex diamond');
  subline('Sweep from any vertex, then from the farthest one reached.');

  drawGraph(GR.diamond, {
    path: p > 0.35 ? [0, 1] : null,
    fill: function (v) { return v <= 1 ? ACCDIM : SURF; },
    ring: function (v) { return v >= 2 ? WARN : ACC; },
    label: function (v) { return 'e=' + M.diamond.ecc[v]; }
  });
  txt(150, 92, 'the diamond: K4 with the edge 2-3 removed', { size: 11, color: DIM });
  txt(150, 330, 'sweep 1 from 0 reaches 1, 2, 3 all at distance 1', { size: 11, color: INK });
  txt(150, 350, 'and takes the first, vertex 1', { size: 11, color: INK });
  txt(150, 372, 'sweep 2 from 1 reports distance 1', { size: 11, color: BAD, bold: true });

  card(500, 96, 372, 130, { fill: SURF });
  txt(516, 120, 'What the sweeps report', { size: 11.5, bold: true, color: INK });
  note(516, 144, 'start ' + V.diamondSweep.from + ' -> farthest ' + V.diamondSweep.mid +
       ' -> farthest ' + V.diamondSweep.to, { size: 11, mono: true });
  note(516, 166, 'reported diameter ' + V.diamondSweep.len, { size: 11.5, color: BAD, bold: true });
  note(516, 190, 'true diameter ' + M.diamond.d + ', attained by the pair 2 and 3', { size: 11.5, color: VAL });
  note(516, 212, 'eccentricities ' + M.diamond.ecc.join(', ') + ' so the radius is 1', { size: 10.5 });

  card(500, 244, 372, 106, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  txt(516, 268, 'On trees it is exact', { size: 11.5, bold: true, color: ACC });
  note(516, 290, 'The page runs both sweeps on all ' + V.sweep.treeCount, { size: 11, color: INK });
  note(516, 308, 'labelled trees on 2 to 7 vertices and compares', { size: 11, color: INK });
  note(516, 326, 'with the table: ' + V.sweep.treeBad + ' wrong answers.', { size: 11, color: VAL, bold: true });

  note(28, 400, 'Off a tree the two sweeps give a lower bound on the diameter, never the diameter itself.', { color: WARN });
  note(28, 424, 'The failure is not a tie in distance: a start vertex need not be an endpoint of any longest path.', { color: INK });
};

/* ---- scene 8: three limits ---- */
SCENE_DRAW.limits = function (t, sc) {
  var p = prog(t, sc);
  heading('Three places the intuitions break');
  subline('An off-path centre, a disconnected graph, and three different middles.');

  /* panel 1: a centre vertex on no diameter path. Graph on the left, words on the right. */
  card(24, 62, 400, 186, { fill: SURF });
  txt(40, 84, '1. A centre vertex on no diameter path', { size: 11.5, bold: true, color: INK });
  var sc1 = { n: 5, edges: GR.offpath.edges, pos: [] };
  for (var i = 0; i < 5; i++) {
    sc1.pos.push([LAYOUT.offpath[i][0] * 0.34 + 46, LAYOUT.offpath[i][1] * 0.40 + 92]);
  }
  drawGraph(sc1, {
    path: p > 0.25 ? V.off.path : null,
    fill: function (v) { return V.off.centre.indexOf(v) >= 0 ? ACCDIM : SURF; },
    ring: function (v) { return v === 2 ? WARN : (V.off.centre.indexOf(v) >= 0 ? ACC : BORDER); }
  });
  txt(224, 120, 'd = ' + V.off.d + ',  r = ' + V.off.r, { size: 11, mono: true, color: INK });
  txt(224, 142, 'centre  ' + V.off.centre.join(', '), { size: 11, mono: true, color: ACC });
  txt(224, 168, 'the diameter pair is 3 and 4,', { size: 10.5, color: INK });
  txt(224, 186, 'and the path 3-1-0-4 avoids 2', { size: 10.5, color: WARN });
  txt(224, 214, 'so vertex 2 is central and off', { size: 10.5, color: INK });
  txt(224, 232, 'every diameter path', { size: 10.5, color: INK });

  /* panel 2: a disconnected graph. Two triangles, then the words underneath. */
  card(440, 62, 436, 186, { fill: SURF });
  txt(456, 84, '2. A disconnected graph has no eccentricity', { size: 11.5, bold: true, color: INK });
  var A = [[476, 112], [476, 168], [534, 140]];
  var B = [[620, 112], [620, 168], [678, 140]];
  var tri = [A, B];
  for (var k = 0; k < 2; k++) {
    var q = tri[k];
    P.line(q[0][0], q[0][1], q[1][0], q[1][1], { stroke: FAINT, sw: 1.2, dash: [4, 4] });
    P.line(q[1][0], q[1][1], q[2][0], q[2][1], { stroke: FAINT, sw: 1.2, dash: [4, 4] });
    P.line(q[2][0], q[2][1], q[0][0], q[0][1], { stroke: FAINT, sw: 1.2, dash: [4, 4] });
    for (var j = 0; j < 3; j++) {
      P.circle(q[j][0], q[j][1], 13, { fill: SURF, stroke: FAINT, sw: 1.6 });
    }
  }
  txt(560, 148, 'no edge', { size: 10, color: BAD, align: 'center' });
  txt(700, 140, 'every eccentricity', { size: 10.5, color: INK });
  txt(700, 158, 'is infinite, so there is', { size: 10.5, color: INK });
  txt(700, 176, 'no radius and no diameter', { size: 10.5, color: BAD, bold: true });
  txt(476, 208, 'No path joins a vertex of one triangle to a vertex of the other.', { size: 10.5, color: DIM });
  txt(476, 228, 'A convention that takes the larger of the two diameters must be stated.', { size: 10.5, color: DIM });

  /* panel 3: centre, centroid and median */
  card(24, 258, 852, 186, { fill: SURF });
  txt(40, 280, '3. Centre, centroid and median are three different vertices', { size: 11.5, bold: true, color: INK });
  var sc3 = { n: 7, edges: GR.pan.edges, pos: [] };
  for (i = 0; i < 7; i++) {
    sc3.pos.push([LAYOUT.pan[i][0] * 0.50 + 56, LAYOUT.pan[i][1] * 0.40 + 300]);
  }
  drawGraph(sc3, {
    fill: function (v) { return V.pan.centre.indexOf(v) >= 0 ? ACCDIM : SURF; },
    ring: function (v) {
      if (v === V.pan.centroid[0]) return WARN;
      if (V.pan.centre.indexOf(v) >= 0) return ACC;
      return BORDER;
    }
  });
  txt(430, 320, 'centre  ' + V.pan.centre.join(' and ') + '   minimum eccentricity, radius ' + V.pan.r, { size: 11, color: ACC });
  txt(430, 344, 'centroid  ' + V.pan.centroid.join(' and ') + '   smallest largest piece after removal', { size: 11, color: WARN });
  txt(430, 368, 'median  ' + V.pan.median.join(' and ') + '   smallest sum of distances', { size: 11, color: INK });
  txt(430, 394, 'eccentricities ' + V.pan.ecc.join(', ') + ',  diameter ' + V.pan.d, { size: 10.5, mono: true, color: DIM });
  txt(430, 416, 'A 3x3 grid separates them further: centre 4 alone, every vertex a centroid.', { size: 10.5, color: DIM });
};

/* ---- scene 9: the two previous-year questions ---- */
SCENE_DRAW.pyq = function (t, sc) {
  var p = prog(t, sc);
  heading('Two previous-year questions, both recomputed here');
  subline('Neither answer is copied from a key; both come out of the definitions on this page.');

  card(24, 62, 410, 330, { fill: SURF });
  txt(40, 86, 'GATE CSE 2025, Set 1, Q43', { size: 11.5, bold: true, color: ACC });
  txt(40, 108, '100 vertices, diameter 30, any BFS tree T.', { size: 11, color: INK });
  txt(40, 126, 'What must be true of the height of T?', { size: 11, color: INK });
  P.line(40, 140, 418, 140, { stroke: BORDER, sw: 1 });
  if (p > 0.18) {
    note(40, 162, 'The height of a BFS tree is the', { size: 11, color: INK });
    note(40, 180, 'eccentricity of its root r.', { size: 11, color: INK });
    note(40, 206, 'd(u,v) <= d(u,r) + d(r,v) <= 2 e(r)', { size: 11, mono: true, color: INK });
    note(40, 232, 'so 30 <= 2 e(r) and e(r) >= ' + V.pyq.answer2025 + '.', { size: 11, mono: true, color: INK });
  }
  if (p > 0.34) {
    card(40, 252, 378, 52, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
    txt(56, 274, 'Answer: the height is at least ' + V.pyq.answer2025, { size: 12, bold: true, color: ACC });
    txt(56, 292, 'not exactly 15, because the root need not be central', { size: 10, color: DIM });
  }
  if (p > 0.44) {
    note(40, 330, 'The 100 vertices only bound the graph size.', { size: 10.5 });
    note(40, 350, 'Every vertex has eccentricity at most 30,', { size: 10.5 });
    note(40, 368, 'so the height lies between 15 and 30.', { size: 10.5 });
  }

  card(456, 62, 420, 330, { fill: SURF });
  txt(472, 86, 'GATE CSE 2021, Set 1, Q20', { size: 11.5, bold: true, color: ACC });
  txt(472, 108, 'Join every pair at distance exactly 2.', { size: 11, color: INK });
  txt(472, 126, 'Relate diam(G^2) to diam(G).', { size: 11, color: INK });
  P.line(472, 140, 860, 140, { stroke: BORDER, sw: 1 });
  if (p > 0.58) {
    note(472, 162, 'Walk a diameter path in steps of two:', { size: 11, color: INK });
    note(472, 180, 'each step is an edge of G^2, so', { size: 11, color: INK });
    note(472, 206, 'diam(G^2) <= ceil(d/2).', { size: 11, mono: true, color: INK });
    note(472, 230, 'Each edge of G^2 is at most two of G,', { size: 11, color: INK });
    note(472, 248, 'so the inequality reverses.', { size: 11, color: INK });
  }
  if (p > 0.72) {
    card(472, 262, 388, 46, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
    txt(488, 282, 'Answer: diam(G^2) = ceil(d/2), the first option', { size: 11.5, bold: true, color: ACC });
    txt(488, 300, 'the path on 8 gives ' + V.pyq.pathD + ' then ' + V.pyq.pathSq, { size: 10, color: DIM });
  }
  if (p > 0.8) {
    note(472, 330, 'Equality checked on all ' + V.square.checked, { size: 10.5 });
    note(472, 348, 'connected graphs with at most 6 vertices.', { size: 10.5 });
    note(472, 368, V.square.bad + ' above the ceiling, ' + V.square.strict + ' below it.', { size: 10.5, color: VAL });
  }
};

/* ---- scene 10: procedure and traps ---- */
SCENE_DRAW.proc = function (t, sc) {
  var p = prog(t, sc);
  heading('One procedure for every question on this topic, and the five traps');
  subline('Written once, it answers a radius, a diameter, a centre or a BFS-height question.');

  var steps = [
    ['1', 'Build the distance table.', 'One breadth-first search per vertex.'],
    ['2', 'Read each row maximum.', 'Those are the eccentricities.'],
    ['3', 'Take the smallest and the largest.', 'Radius and diameter, with their arg-sets.'],
    ['4', 'If it is a tree, skip steps 1 to 3.', 'Peel leaves; radius = ceil(d/2).']
  ];
  for (var i = 0; i < steps.length; i++) {
    if (p < 0.08 + i * 0.12) break;
    var yy = 86 + i * 56;
    card(28, yy, 520, 46, { fill: SURF });
    P.circle(54, yy + 23, 13, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
    txt(54, yy + 23, steps[i][0], { size: 12, mono: true, align: 'center', base: 'middle', color: ACC, bold: true });
    txt(78, yy + 19, steps[i][1], { size: 12, color: INK, bold: true });
    txt(78, yy + 35, steps[i][2], { size: 10.5, color: DIM });
  }

  var traps = [
    'Halving the diameter off a tree.',
    'Putting the centre on a diameter path.',
    'Calling a leaf\'s eccentricity the height.',
    'Using two sweeps on a graph with cycles.',
    'Reporting a number for a disconnected graph.'
  ];
  card(566, 86, 310, 226, { fill: WARNDIM, stroke: WARN, sw: 1.2 });
  txt(582, 110, 'The five traps', { size: 12, bold: true, color: WARN });
  for (i = 0; i < traps.length; i++) {
    if (p < 0.5 + i * 0.07) break;
    txt(582, 136 + i * 34, '· ' + traps[i], { size: 10.5, color: INK });
  }

  note(28, 340, 'Each trap produces a number that appears among the options, so checking the arithmetic will not catch it.', { color: INK });
  note(28, 364, 'The defence is the same every time: name the hypothesis. A tree, a connected graph, an unweighted graph.', { color: INK });
  note(28, 392, 'Radius and diameter are a minimum and a maximum of one list of eccentricities. Everything else is reading.', { color: ACC });
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
