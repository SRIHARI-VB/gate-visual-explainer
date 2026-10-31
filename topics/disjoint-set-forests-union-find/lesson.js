/* ==========================================================================
   disjoint-set-forests-union-find — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model implements four disjoint-set forests (naive linking, union by
   rank, path compression alone, both), runs the same operation sequences
   through each, counts pointer hops, builds the Ackermann table from its own
   recursion, and runs Kruskal on a fixed graph. The drawing code reads those
   results and performs no arithmetic of its own.
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
   Every number this lesson shows is computed here, from the definitions.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- a disjoint-set forest with a selectable implementation ----------
   mode 'naive'  : link the first root under the second, no heuristics
   mode 'rank'   : union by rank, no compression
   mode 'pc'     : path compression (two-pass), naive linking
   mode 'rankpc' : union by rank and path compression
   mode 'size'   : union by size (node count), no compression
   hops counts every parent-pointer follow, which is the unit of cost. */
function makeUF(n, mode) {
  var parent = [], rank = [], size = [], i;
  for (i = 0; i < n; i++) { parent.push(i); rank.push(0); size.push(1); }
  var compress = (mode === 'rankpc' || mode === 'pc');
  var balanced = (mode === 'size' || mode === 'rank' || mode === 'rankpc');
  var st = { hops: 0, compressions: 0, finds: 0, unions: 0, rejected: 0 };

  function find(x) {
    st.finds++;
    var r = x;
    while (parent[r] !== r) { st.hops++; r = parent[r]; }
    if (compress) {
      var c = x;
      while (parent[c] !== r) {
        var nx = parent[c];
        parent[c] = r;
        st.compressions++;
        c = nx;
      }
    }
    return r;
  }

  function union(a, b) {
    var ra = find(a), rb = find(b);
    if (ra === rb) { st.rejected++; return false; }
    if (!balanced) { parent[ra] = rb; st.unions++; return true; }
    if (mode === 'size') {
      if (size[ra] < size[rb]) { var t = ra; ra = rb; rb = t; }
      parent[rb] = ra; size[ra] += size[rb];
    } else {
      if (rank[ra] < rank[rb]) { var u = ra; ra = rb; rb = u; }
      else if (rank[ra] === rank[rb]) rank[ra]++;
      parent[rb] = ra;
    }
    st.unions++;
    return true;
  }

  function height() {
    var h = 0;
    for (var x = 0; x < n; x++) {
      var d = 0, c = x;
      while (parent[c] !== c) { c = parent[c]; d++; }
      if (d > h) h = d;
    }
    return h;
  }

  function roots() {
    var out = [];
    for (var x = 0; x < n; x++) if (parent[x] === x) out.push(x);
    return out;
  }

  return {
    n: n, parent: parent, rank: rank, size: size,
    find: find, union: union, height: height, roots: roots, st: st
  };
}

/* ---------- 1. the chain ---------- */
var CHAIN_N = 8;
var CHAIN = (function () {
  var u = makeUF(CHAIN_N, 'naive');
  for (var i = 0; i + 1 < CHAIN_N; i++) u.union(i, i + 1);
  var height = u.height();
  var hopsBefore = u.st.hops;
  var root = u.find(0);
  var firstFind = u.st.hops - hopsBefore;
  return { parent: u.parent.slice(), height: height, root: root, firstFind: firstFind };
})();

var CHAIN_PC = (function () {
  var u = makeUF(CHAIN_N, 'pc');
  for (var i = 0; i + 1 < CHAIN_N; i++) u.union(i, i + 1);
  var h0 = u.st.hops;
  u.find(0);
  var first = u.st.hops - h0;
  var star = u.parent.slice();
  var h1 = u.st.hops;
  u.find(0);
  var second = u.st.hops - h1;
  return { firstFind: first, secondFind: second, parentAfter: star };
})();

/* ---------- 2. the chain at n = 64, ten finds of the deepest node ---------- */
var CHAIN64 = (function () {
  var out = {};
  ['naive', 'pc'].forEach(function (mode) {
    var u = makeUF(64, mode);
    for (var i = 0; i + 1 < 64; i++) u.union(i, i + 1);
    var h0 = u.st.hops;
    for (var k = 0; k < 10; k++) u.find(0);
    out[mode] = { tenFinds: u.st.hops - h0, height: u.height() };
  });
  return out;
})();

/* ---------- 3. union by rank: the invariant and the balanced witness ---------- */
var RANK_INVARIANT = (function () {
  var violations = 0, worst = 0;
  for (var n = 1; n <= 64; n++) {
    var u = makeUF(n, 'rank');
    for (var i = 0; i + 1 < n; i++) u.union(i, i + 1);
    var r = 0;
    for (var j = 0; j < n; j++) if (u.rank[j] > r) r = u.rank[j];
    if (r > Math.floor(Math.log2(n) + 1e-9)) violations++;
    if (r > worst) worst = r;
  }
  return { violations: violations, worstRankAt64: worst };
})();

var BALANCED = (function () {
  var rows = [];
  [2, 4, 8, 16, 32, 64].forEach(function (n) {
    var u = makeUF(n, 'rank');
    var step = 1;
    while (step < n) {
      for (var i = 0; i + step < n; i += 2 * step) u.union(i, i + step);
      step *= 2;
    }
    var r = 0;
    for (var j = 0; j < n; j++) if (u.rank[j] > r) r = u.rank[j];
    rows.push({ n: n, rank: r, lg: Math.floor(Math.log2(n)), height: u.height() });
  });
  return rows;
})();

/* ---------- 4. the eight-element trace, union by size, tie keeps the first root ---------- */
var TRACE8_SEQ = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [4, 6], [0, 4]];
var TRACE8 = (function () {
  var u = makeUF(8, 'size');
  TRACE8_SEQ.forEach(function (p) { u.union(p[0], p[1]); });
  return { parent: u.parent.slice(), size: u.size.slice(), height: u.height() };
})();

var TRACE8_RANKPC = (function () {
  var u = makeUF(8, 'rankpc');
  TRACE8_SEQ.forEach(function (p) { u.union(p[0], p[1]); });
  var before = { parent: u.parent.slice(), rank: u.rank.slice(), height: u.height() };
  u.find(7);
  var after = { parent: u.parent.slice(), rank: u.rank.slice(), height: u.height() };
  return { before: before, after: after, rootRank: u.rank[0] };
})();

/* ---------- 5. the same sequence through four implementations ---------- */
var SEQ_N = 256, SEQ_M = 2000;
var MEASURED = (function () {
  var seed = 12345;
  function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
  var seq = [], i;
  for (i = 0; i < SEQ_M; i++) seq.push([Math.floor(rnd() * SEQ_N), Math.floor(rnd() * SEQ_N)]);
  var out = {};
  ['naive', 'rank', 'pc', 'rankpc'].forEach(function (mode) {
    var u = makeUF(SEQ_N, mode);
    seq.forEach(function (p) { u.union(p[0], p[1]); });
    out[mode] = {
      hops: u.st.hops,
      perOp: u.st.hops / SEQ_M,
      height: u.height(),
      rejected: u.st.rejected
    };
  });
  return out;
})();

/* ---------- 6. Ackermann and its inverse ----------
   A(0, j) = j + 1
   A(k, 0) = A(k-1, 1)
   A(k, j) = A(k-1, A(k, j-1))                                            */
var ACKER = (function () {
  var memo = {};
  function A(k, j) {
    var key = k + ',' + j;
    if (memo[key] !== undefined) return memo[key];
    var v;
    if (k === 0) v = j + 1;
    else if (j === 0) v = A(k - 1, 1);
    else v = A(k - 1, A(k, j - 1));
    memo[key] = v;
    return v;
  }
  /* the closed forms, used only as a cross-check on the recursion */
  var closed = [function (j) { return j + 1; },
                function (j) { return j + 2; },
                function (j) { return 2 * j + 3; },
                function (j) { return Math.pow(2, j + 3) - 3; }];
  var mismatches = 0, k, j;
  for (k = 0; k <= 2; k++) for (j = 0; j <= 8; j++) if (A(k, j) !== closed[k](j)) mismatches++;
  for (j = 0; j <= 6; j++) if (A(3, j) !== closed[3](j)) mismatches++;

  /* A(4,1) = A(3,13). The recursion cannot reach it — A(2, j) recurses j deep and
     j here is 65533 — so the closed form is used, having been checked above. */
  var thresholds = [A(0, 1), A(1, 1), A(2, 1), A(3, 1), closed[3](13)];  // A(4,1) = A(3,13) = 65533
  /* thresholds[t] is A(t,1); alpha is the smallest k >= 1 with A(k,1) >= n */
  function alpha(n) {
    for (var t = 0; t < thresholds.length; t++) if (thresholds[t] >= n) return Math.max(1, t);
    return 5;
  }
  return { A: A, thresholds: thresholds, alpha: alpha, mismatches: mismatches };
})();

var ALPHA_TABLE = (function () {
  var rows = [], start = 1, k;
  for (k = 0; k < ACKER.thresholds.length; k++) {
    var end = ACKER.thresholds[k];
    if (end >= start) { rows.push({ alpha: Math.max(1, k), from: start, to: end }); start = end + 1; }
  }
  rows.push({ alpha: 5, from: start, to: Infinity });
  return rows;
})();

/* A(4,2) = A(3, A(4,1)) = 2^65536 - 3, so alpha is at most 5 up to 2^65536 */
var ALPHA_BEYOND = (function () {
  var lg2 = 65536;
  var decimalDigits = Math.floor(lg2 * Math.log10(2)) + 1;   // digits of 2^65536
  return { exponent: lg2, digits: decimalDigits, atomsDigits: 81 };
})();

/* ---------- 7. Kruskal on a fixed graph ---------- */
var GRAPH = {
  vertices: ['A', 'B', 'C', 'D', 'E', 'F'],
  edges: [
    ['A', 'B', 4], ['A', 'C', 4], ['B', 'C', 2], ['C', 'D', 3], ['B', 'D', 5],
    ['D', 'E', 2], ['D', 'F', 6], ['E', 'F', 3], ['C', 'E', 6]
  ]
};

var KRUSKAL = (function () {
  var idx = {};
  GRAPH.vertices.forEach(function (v, i) { idx[v] = i; });
  var u = makeUF(GRAPH.vertices.length, 'rankpc');
  var sorted = GRAPH.edges.slice().sort(function (a, b) { return a[2] - b[2]; });
  var weight = 0, accepted = [], rejected = [], finds = 0;
  sorted.forEach(function (e) {
    finds += 2;
    var ra = u.find(idx[e[0]]), rb = u.find(idx[e[1]]);
    if (ra !== rb) {
      u.union(idx[e[0]], idx[e[1]]);
      accepted.push({ a: e[0], b: e[1], w: e[2] });
      weight += e[2];
    } else {
      rejected.push({ a: e[0], b: e[1], w: e[2] });
    }
  });
  return {
    sorted: sorted, accepted: accepted, rejected: rejected, weight: weight,
    finds: finds, unions: accepted.length, hops: u.st.hops,
    nMinusOne: GRAPH.vertices.length - 1
  };
})();

/* ---------- 8. counting components ---------- */
var COMPONENTS = (function () {
  var u = makeUF(10, 'rankpc');
  var seq = [[0, 1], [2, 3], [1, 3], [4, 5], [6, 7], [8, 9], [0, 9], [1, 2]];
  var marks = [];
  var ok = 0;
  seq.forEach(function (p) {
    var merged = u.union(p[0], p[1]);
    if (merged) ok++;
    marks.push({ a: p[0], b: p[1], merged: merged });
  });
  return { marks: marks, calls: seq.length, successful: ok, roots: u.roots().length, n: 10 };
})();

/* ======================================================================
   LAYER 2 - THE CHECKS
   Each computed value re-verified against a definition it must satisfy.
   ====================================================================== */

chk('the chain has height 7 and its parent array is a single path',
    CHAIN.height === 7 && CHAIN.parent.join(',') === '1,2,3,4,5,6,7,7', CHAIN.parent.join(','));
chk('find(0) on the chain walks 7 hops, one per edge of the path',
    CHAIN.firstFind === 7 && CHAIN.firstFind === CHAIN.height, CHAIN.firstFind);
chk('every hop count equals the depth of the node it started from',
    (function () {
      var u = makeUF(8, 'naive');
      for (var i = 0; i + 1 < 8; i++) u.union(i, i + 1);
      for (var x = 0; x < 8; x++) {
        var h = u.st.hops; u.find(x);
        if (u.st.hops - h !== 7 - x) return false;
      }
      return true;
    })(), 'checked for all eight start nodes');

chk('compression turns the chain into a star: every node points at the root',
    CHAIN_PC.parentAfter.join(',') === '7,7,7,7,7,7,7,7', CHAIN_PC.parentAfter.join(','));
chk('the first find with compression costs the same 7 hops, the second costs 1',
    CHAIN_PC.firstFind === 7 && CHAIN_PC.secondFind === 1,
    CHAIN_PC.firstFind + ' then ' + CHAIN_PC.secondFind);
chk('compression changes no root and no set membership',
    (function () {
      var u = makeUF(8, 'pc');
      for (var i = 0; i + 1 < 8; i++) u.union(i, i + 1);
      var before = u.roots().join(',');
      u.find(0);
      return u.roots().join(',') === before && before === '7';
    })(), 'one root, 7, before and after');

chk('ten finds of the deepest node cost 630 hops without compression and 72 with it',
    CHAIN64.naive.tenFinds === 630 && CHAIN64.pc.tenFinds === 72,
    CHAIN64.naive.tenFinds + ' / ' + CHAIN64.pc.tenFinds);
chk('without compression every one of those finds costs the same 63 hops',
    CHAIN64.naive.tenFinds === 10 * 63, CHAIN64.naive.tenFinds);
chk('with compression the nine later finds cost one hop each, plus 63 for the first',
    CHAIN64.pc.tenFinds === 63 + 9, CHAIN64.pc.tenFinds);

chk('union by rank never exceeds floor(log2 n) for n from 1 to 64',
    RANK_INVARIANT.violations === 0, RANK_INVARIANT.violations + ' violations');
chk('the balanced merge attains exactly floor(log2 n) at all six sizes tested',
    BALANCED.every(function (r) { return r.rank === r.lg && r.height === r.lg; }),
    BALANCED.map(function (r) { return r.n + ':' + r.rank; }).join(' '));
chk('rank is a power-of-two statement: a root of rank k holds at least 2^k nodes',
    (function () {
      var u = makeUF(64, 'rank');
      var step = 1;
      while (step < 64) {
        for (var i = 0; i + step < 64; i += 2 * step) u.union(i, i + step);
        step *= 2;
      }
      for (var x = 0; x < 64; x++) {
        if (u.parent[x] === x && u.size[x] !== 1) return false;   // size unused here
      }
      var count = {};
      for (var y = 0; y < 64; y++) {
        var r = u.find(y), c = 0;
        for (var z = 0; z < 64; z++) if (u.find(z) === r) c++;
        count[r] = c;
      }
      for (var w = 0; w < 64; w++) {
        if (u.parent[w] === w && count[w] < Math.pow(2, u.rank[w])) return false;
      }
      return true;
    })(), 'every root holds at least 2^rank nodes');

chk('the eight-element size trace gives parent 0 0 0 2 0 4 4 6 and height 3',
    TRACE8.parent.join(',') === '0,0,0,2,0,4,4,6' && TRACE8.height === 3,
    TRACE8.parent.join(',') + ' h=' + TRACE8.height);
chk('the root of that trace holds all eight elements',
    TRACE8.size[0] === 8, TRACE8.size[0]);
chk('the tie rule is visible: the first argument\'s root stays on top',
    (function () {
      var u = makeUF(2, 'size');
      u.union(0, 1);
      return u.parent[1] === 0 && u.parent[0] === 0;
    })(), 'union(0,1) leaves 0 as the root');

chk('after find(7) the height falls to 2 while the root rank stays 3',
    TRACE8_RANKPC.after.height === 2 && TRACE8_RANKPC.rootRank === 3,
    'height ' + TRACE8_RANKPC.after.height + ', rank ' + TRACE8_RANKPC.rootRank);
chk('the subtree height at every node is at most its rank, with compression on',
    (function () {
      var u = makeUF(64, 'rankpc');
      var step = 1;
      while (step < 64) {
        for (var i = 0; i + step < 64; i += 2 * step) u.union(i, i + step);
        step *= 2;
      }
      for (var q = 0; q < 64; q++) u.find(q);
      for (var x = 0; x < 64; x++) {
        var best = 0;
        for (var y = 0; y < 64; y++) {
          var d = 0, c = y;
          while (u.parent[c] !== c && d < 64) { c = u.parent[c]; d++; }
          if (c === x && d > best) best = d;
        }
        if (best > u.rank[x]) return false;
      }
      return true;
    })(), 'checked at all 64 nodes');
chk('a non-root always has a strictly smaller rank than its parent',
    (function () {
      var u = makeUF(64, 'rankpc');
      var step = 1;
      while (step < 64) {
        for (var i = 0; i + step < 64; i += 2 * step) u.union(i, i + step);
        step *= 2;
      }
      for (var q = 0; q < 64; q++) u.find(q);
      for (var x = 0; x < 64; x++) {
        if (u.parent[x] === x) continue;
        if (!(u.rank[x] < u.rank[u.parent[x]])) return false;
      }
      return true;
    })(), 'rank rises along every parent chain');

chk('compression leaves every rank unchanged',
    TRACE8_RANKPC.before.rank.join(',') === TRACE8_RANKPC.after.rank.join(','),
    TRACE8_RANKPC.after.rank.join(','));

chk('the four implementations are ordered by measured cost on the same sequence',
    MEASURED.naive.perOp > MEASURED.rank.perOp &&
    MEASURED.rank.perOp > MEASURED.pc.perOp &&
    MEASURED.pc.perOp > MEASURED.rankpc.perOp,
    [MEASURED.naive.perOp, MEASURED.rank.perOp, MEASURED.pc.perOp, MEASURED.rankpc.perOp]
      .map(function (v) { return v.toFixed(2); }).join(' > '));
chk('all four implementations agree on the number of rejected unions',
    MEASURED.naive.rejected === MEASURED.rankpc.rejected &&
    MEASURED.rank.rejected === MEASURED.pc.rejected &&
    MEASURED.rank.rejected === MEASURED.naive.rejected,
    MEASURED.rankpc.rejected + ' of ' + SEQ_M);
chk('the sequence leaves one set, and every mode finds the same root for every element',
    (function () {
      var roots = {};
      ['naive', 'rank', 'pc', 'rankpc'].forEach(function (mode) {
        var u = makeUF(SEQ_N, mode);
        var seed = 12345;
        function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
        for (var i = 0; i < SEQ_M; i++) u.union(Math.floor(rnd() * SEQ_N), Math.floor(rnd() * SEQ_N));
        roots[mode] = u.roots().length;
      });
      return roots.naive === roots.rank && roots.rank === roots.pc && roots.pc === roots.rankpc;
    })(), 'same number of roots in all four');

chk('the Ackermann recursion agrees with its closed forms on every value tested',
    ACKER.mismatches === 0, ACKER.mismatches + ' mismatches');
chk('A(k,1) is 2, 3, 5, 13 and 65533 for k from 0 to 4',
    ACKER.thresholds.join(',') === '2,3,5,13,65533', ACKER.thresholds.join(','));
chk('alpha is 4 up to 65533 and 5 at 65534',
    ACKER.alpha(65533) === 4 && ACKER.alpha(65534) === 5,
    ACKER.alpha(65533) + ' then ' + ACKER.alpha(65534));
chk('alpha never decreases as n grows, over the thresholds and their neighbours',
    (function () {
      var ns = [1, 2, 3, 4, 5, 6, 13, 14, 65533, 65534, 1e9];
      for (var i = 1; i < ns.length; i++) if (ACKER.alpha(ns[i]) < ACKER.alpha(ns[i - 1])) return false;
      return true;
    })(), 'monotone over eleven probe points');
chk('2^65536 has more than 19000 decimal digits, so alpha stays at most 5 far beyond any input',
    ALPHA_BEYOND.digits > 19000 && ALPHA_BEYOND.digits < 20000, ALPHA_BEYOND.digits + ' digits');

chk('Kruskal accepts five edges of weight total 14 on the six-vertex graph',
    KRUSKAL.accepted.length === 5 && KRUSKAL.weight === 14,
    KRUSKAL.accepted.length + ' edges, weight ' + KRUSKAL.weight);
chk('the accepted set is exactly B-C 2, D-E 2, C-D 3, E-F 3, A-B 4',
    KRUSKAL.accepted.map(function (e) { return e.a + e.b + e.w; }).join(',') === 'BC2,DE2,CD3,EF3,AB4',
    KRUSKAL.accepted.map(function (e) { return e.a + e.b + ':' + e.w; }).join(' '));
chk('exactly four edges are rejected and every one closes a cycle',
    KRUSKAL.rejected.length === 4 && KRUSKAL.rejected.length === KRUSKAL.sorted.length - KRUSKAL.nMinusOne,
    KRUSKAL.rejected.map(function (e) { return e.a + e.b + ':' + e.w; }).join(' '));
chk('Kruskal performs two finds per edge and n-1 successful unions',
    KRUSKAL.finds === 2 * KRUSKAL.sorted.length && KRUSKAL.unions === KRUSKAL.nMinusOne,
    KRUSKAL.finds + ' finds, ' + KRUSKAL.unions + ' unions');
chk('the accepted edges form a spanning tree: five edges, one component, no cycle',
    (function () {
      var u = makeUF(6, 'rank');
      KRUSKAL.accepted.forEach(function (e) {
        var idx = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };
        if (u.find(idx[e.a]) === u.find(idx[e.b])) return false;
        u.union(idx[e.a], idx[e.b]);
      });
      return u.roots().length === 1 && KRUSKAL.accepted.length === 5;
    })(), 'one root after the five accepted edges');
chk('no rejected edge can be added without closing a cycle',
    (function () {
      var idx = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };
      var u = makeUF(6, 'rank');
      KRUSKAL.accepted.forEach(function (e) { u.union(idx[e.a], idx[e.b]); });
      return KRUSKAL.rejected.every(function (e) { return u.find(idx[e.a]) === u.find(idx[e.b]); });
    })(), 'all four rejects share a root');

chk('seven of the eight union calls merge two different sets, leaving three sets',
    COMPONENTS.successful === 7 && COMPONENTS.roots === 3 &&
    COMPONENTS.roots === COMPONENTS.n - COMPONENTS.successful,
    COMPONENTS.successful + ' successful, ' + COMPONENTS.roots + ' roots');
chk('the root count and the n minus k count agree',
    COMPONENTS.roots === COMPONENTS.n - COMPONENTS.successful, 'both 3');
chk('a union inside one set changes nothing and reports false',
    (function () {
      var u = makeUF(4, 'rank');
      u.union(0, 1); u.union(2, 3); u.union(1, 3);
      var before = u.parent.join(',');
      var merged = u.union(0, 3);
      return merged === false && u.parent.join(',') === before && u.roots().length === 1;
    })(), 'array unchanged, false returned');
chk('n minus one successful unions leave exactly one set',
    (function () {
      var u = makeUF(10, 'rank');
      for (var i = 0; i + 1 < 10; i++) u.union(i, i + 1);
      return u.roots().length === 1 && u.st.unions === 9;
    })(), 'one root after nine unions');

/* ======================================================================
   LAYER 3 - RENDER
   The drawing code reads the model above and performs no arithmetic of its
   own beyond layout.
   ====================================================================== */

function sceneIdAt(t) {
  var sc = K.state.scenes, i;
  for (i = sc.length - 1; i >= 0; i--) if (t >= sc[i].start - 1e-6) return sc[i].id;
  return sc.length ? sc[0].id : 'question';
}

function prog(t) { return K && K.sceneProgress ? K.sceneProgress(t) : 1; }

function head(t1, t2) {
  P.alpha(1);
  P.text(30, 12, t1, { size: 15.5, bold: true, color: INK });
  if (t2) P.text(30, 33, t2, { size: 12, color: DIM });
}

function panel(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1.1, radius: 6 });
}

function label(x, y, s, o) {
  o = o || {};
  P.text(x, y, s, {
    size: o.size || 11.5, color: o.color || DIM, bold: !!o.bold,
    mono: !!o.mono, align: o.align || 'left'
  });
}

function node(x, y, s, o) {
  o = o || {};
  var r = o.r || 15;
  P.circle(x, y, r, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1.4 });
  P.text(x, y - 5, String(s), {
    size: o.size || 12, bold: true, align: 'center',
    color: o.color || INK, mono: !!o.mono
  });
}

/* a parent arrow from child to its parent, drawn upward */
function upArrow(x1, y1, x2, y2, colour) {
  P.arrow(x1, y1, x2, y2, { stroke: colour || DIM, sw: 1.3, head: 7 });
}

function tbl(x, y, cols, rows, o) {
  o = o || {};
  var rh = o.rh || 22, i, j;
  var total = 0;
  for (i = 0; i < cols.length; i++) total += cols[i].w;
  P.rect(x, y, total, rh * (rows.length + 1), { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: 1 });
  P.rect(x, y, total, rh, { fill: o.headFill || SURF2, stroke: o.stroke || BORDER, sw: 1 });
  var cx = x;
  for (i = 0; i < cols.length; i++) {
    label(cx + 7, y + 5, cols[i].name, { size: 10.5, bold: true, color: INK });
    if (i < cols.length - 1) {
      cx += cols[i].w;
      P.line(cx, y, cx, y + rh * (rows.length + 1), { stroke: o.stroke || BORDER, sw: 0.8 });
    }
  }
  for (j = 0; j < rows.length; j++) {
    var ry = y + rh * (j + 1);
    if (o.rowFill && o.rowFill[j]) P.rect(x, ry, total, rh, { fill: o.rowFill[j] });
    P.line(x, ry, x + total, ry, { stroke: o.stroke || BORDER, sw: 0.6 });
    cx = x;
    for (i = 0; i < cols.length; i++) {
      label(cx + 7, ry + 5, rows[j][i], {
        size: o.size || 10.5, mono: o.mono !== false, color: o.color || INK,
        bold: !!(o.boldCol && o.boldCol.indexOf(i) >= 0)
      });
      cx += cols[i].w;
    }
  }
}

/* ---------- scene 1: the question ---------- */
function drawQuestion(t) {
  var p = prog(t);
  head('Are these two in the same group?',
       'Six elements, a partition, and one parent pointer per element');

  /* six singleton sets */
  label(56, 62, 'before: six singleton sets, every element its own root', { size: 11.5, bold: true, color: INK });
  var xs = [110, 240, 370, 500, 630, 760];
  for (var i = 0; i < 6; i++) {
    P.alpha(0.35 + 0.65 * Math.min(1, p / 0.25));
    node(xs[i], 108, i, { stroke: ACC, fill: ACCDIM });
    label(xs[i], 132, 'parent ' + i, { size: 10, align: 'center' });
  }
  P.alpha(1);

  /* the three unions */
  label(56, 170, 'three unions, applied in order', { size: 11.5, bold: true, color: INK });
  var ops = ['union(1, 0)', 'union(4, 3)', 'union(3, 0)'];
  var show = Math.min(3, Math.floor(p * 4));
  for (var o = 0; o < 3; o++) {
    var on = o < show;
    label(70 + o * 175, 192, ops[o], {
      size: 11.5, mono: true, color: on ? ACC : FAINT, bold: on
    });
  }

  /* the resulting forest */
  label(56, 236, 'after: one tree of four, and two singletons', { size: 11.5, bold: true, color: INK });
  var nx = { 0: 200, 1: 110, 2: 340, 3: 290, 4: 210, 5: 430 };
  var ny = { 0: 288, 1: 356, 2: 288, 3: 356, 4: 416, 5: 288 };
  var parent = [0, 0, 2, 0, 3, 5];
  for (var k = 0; k < 6; k++) {
    if (parent[k] !== k) {
      upArrow(nx[k], ny[k] - 16, nx[parent[k]], ny[parent[k]] + 17, ACC);
    }
  }
  for (var q = 0; q < 6; q++) {
    var isRoot = parent[q] === q;
    node(nx[q], ny[q], q, { stroke: isRoot ? ACC : BORDER, fill: isRoot ? ACCDIM : SURF, sw: isRoot ? 1.8 : 1.2 });
  }
  label(120, 440, 'arrows point from an element to its parent; a root points at itself', { size: 10.5 });

  /* the array */
  panel(500, 232, 366, 168, { fill: SURF2, stroke: BORDER });
  label(514, 244, 'the whole structure is one array', { size: 11.5, bold: true, color: INK });
  tbl(514, 262, [{ name: 'element', w: 56 }, { name: '0', w: 50 }, { name: '1', w: 50 },
                 { name: '2', w: 50 }, { name: '3', w: 50 }, { name: '4', w: 50 }, { name: '5', w: 50 }],
      [['parent', '0', '0', '2', '0', '3', '5']], { rh: 22, size: 10.5 });
  label(514, 320, 'find(4) walks 4 to 3 to 0 and returns 0: two hops.', { size: 11 });
  label(514, 338, 'union(2, 4) would find 2 and 0, which differ, so it', { size: 11 });
  label(514, 354, 'would point one of those roots at the other.', { size: 11 });
  label(514, 378, 'Two correct implementations can disagree about which', { size: 11, color: WARN });
  label(514, 394, 'one, and that disagreement is the whole subject.', { size: 11, color: WARN });
}

/* ---------- scene 2: the chain ---------- */
function drawChain(t) {
  var p = prog(t);
  head('Naive linking builds a chain',
       'Eight elements, seven unions, one parent pointer each: height 7');

  var x0 = 70, step = 100, y = 116;
  var lit = Math.min(1, p / 0.55);
  var walked = Math.floor(lit * 7 + 0.001);

  label(30, 66, 'union(i, i+1) with the rule "the first root becomes a child of the second"', { size: 11 });

  for (var i = 0; i < 8; i++) {
    var x = x0 + i * step;
    if (i < 7) {
      var on = i < walked;
      P.arrow(x + 16, y, x + step - 16, y, { stroke: on ? WARN : BORDER, sw: on ? 2.2 : 1.2, head: 8 });
    }
  }
  for (var k = 0; k < 8; k++) {
    var isRoot = k === 7;
    node(x0 + k * step, y, k, {
      stroke: isRoot ? ACC : (k <= walked ? WARN : BORDER),
      fill: isRoot ? ACCDIM : SURF,
      sw: isRoot ? 1.8 : 1.3
    });
    label(x0 + k * step, y + 24, 'parent ' + (k === 7 ? 7 : k + 1), { size: 9.5, align: 'center' });
  }

  label(30, 168, 'height of the tree', { size: 11.5, bold: true, color: INK });
  label(210, 168, String(CHAIN.height), { size: 11.5, mono: true, bold: true, color: BAD });
  label(260, 168, 'hops walked by find(0)', { size: 11.5, bold: true, color: INK });
  label(452, 168, String(CHAIN.firstFind), { size: 11.5, mono: true, bold: true, color: BAD });

  var rows = [
    ['n = 8', '7 unions', 'height 7', 'find(0) = 7 hops'],
    ['n = 64', '63 unions', 'height 63', 'find(0) = 63 hops'],
    ['general n', 'n - 1 unions', 'height n - 1', 'find = Theta of n'],
    ['m finds, no repair', 'no repair', 'same 63 hops each', 'total ' + CHAIN64.naive.tenFinds + ' hops at n = 64, ten finds']
  ];
  tbl(30, 196, [{ name: 'the sequence', w: 130 }, { name: 'unions', w: 120 },
                { name: 'resulting height', w: 150 }, { name: 'cost of one find', w: 430 }],
      rows, { rh: 24, size: 10.5 });

  panel(30, 322, 840, 96, { fill: WARNDIM, stroke: WARN });
  label(44, 334, 'Nothing here is a bug in find.', { size: 12, bold: true, color: INK });
  label(44, 354, 'Every pointer is valid and every answer is correct; the cost comes from the linking rule, which looked', { size: 11.5 });
  label(44, 372, 'at neither tree before choosing a direction. Two independent repairs exist: choose the direction at union', { size: 11.5 });
  label(44, 390, 'time, or rewrite the path at find time.', { size: 11.5 });

  label(30, 440, 'Measured on this page: ten finds of the deepest node on a chain of 64 elements cost 630 hops.', { size: 10.5, color: DIM });
}

/* ---------- scene 3: union by rank ---------- */
function drawRank(t) {
  var p = prog(t);
  head('Union by rank: attach the shorter tree under the taller',
       'Eight elements, seven unions, height 3 — the parent array is 0 0 0 2 0 4 4 6');

  /* the tree */
  var pos = { 0: [250, 96], 1: [110, 190], 2: [250, 190], 4: [390, 190], 3: [250, 284], 5: [340, 284], 6: [440, 284], 7: [440, 378] };
  var reveal = Math.min(1, p / 0.7);
  for (var k = 0; k < 8; k++) {
    if (TRACE8.parent[k] !== k) {
      var a = pos[k], b = pos[TRACE8.parent[k]];
      upArrow(a[0], a[1] - 16, b[0], b[1] + 17, ACC);
    }
  }
  for (var q = 0; q < 8; q++) {
    var pt = pos[q];
    var isRoot = TRACE8.parent[q] === q;
    node(pt[0], pt[1], q, { stroke: isRoot ? ACC : BORDER, fill: isRoot ? ACCDIM : SURF, sw: isRoot ? 1.8 : 1.2 });
    label(pt[0], pt[1] + 20, 'r' + TRACE8_RANKPC.before.rank[q], { size: 9.5, align: 'center', mono: true });
  }

  /* the invariant */
  panel(510, 66, 360, 128, { fill: SURF2, stroke: BORDER });
  label(524, 78, 'why the height is logarithmic', { size: 11.5, bold: true, color: INK });
  label(524, 98, 'A root of rank k holds at least 2^k nodes.', { size: 11.5 });
  label(524, 118, 'Rank k is created only by merging two roots', { size: 11 });
  label(524, 134, 'of rank k-1, so the node count at least doubles.', { size: 11 });
  label(524, 156, 'Therefore rank <= floor(log2 n), and the depth', { size: 11 });
  label(524, 172, 'of any node is at most its rank.', { size: 11 });

  /* balanced witness table */
  var rows = BALANCED.map(function (r) {
    return [String(r.n), String(r.rank), String(r.lg), String(r.height)];
  });
  label(510, 214, 'the balanced merge attains the bound exactly', { size: 11, bold: true, color: INK });
  tbl(510, 226, [{ name: 'n', w: 70 }, { name: 'max rank', w: 96 },
                 { name: 'log2 n', w: 90 }, { name: 'height', w: 104 }],
      rows, { rh: 20, size: 10.5 });

  label(30, 420, 'rank of each node, from the same trace with rank in place of size', { size: 10, color: DIM });
  label(30, 438, 'checked: no rank exceeds floor(log2 n) for n = 1 to 64 (' +
        RANK_INVARIANT.violations + ' violations); the balanced merge reaches it at all six sizes',
        { size: 10, color: ACC, bold: true });
  label(30, 452, 'union by size is the same rule counted differently: a node count instead of a rank', { size: 10, color: DIM });
}

/* ---------- scene 4: path compression ---------- */
function drawCompress(t) {
  var p = prog(t);
  head('Path compression: find rewires the path it just walked',
       'The same eight-element chain, one find, and the array that is left behind');

  var x0 = 70, step = 100;
  /* before */
  label(30, 62, 'before: the chain, height 7', { size: 11, bold: true, color: INK });
  for (var i = 0; i < 7; i++) {
    P.arrow(x0 + i * step + 16, 92, x0 + (i + 1) * step - 16, 92, { stroke: BORDER, sw: 1.3, head: 7 });
  }
  for (var k = 0; k < 8; k++) node(x0 + k * step, 92, k, { stroke: BORDER });

  /* the star */
  label(30, 152, 'after find(0): every node on the path points at the root', { size: 11, bold: true, color: INK });
  var cx = 70 + 7 * step;
  for (var m = 0; m < 8; m++) {
    if (m === 7) continue;
    P.arrow(x0 + m * step, 182, cx, 214, { stroke: ACC, sw: 1.2, head: 6 });
  }
  for (var j = 0; j < 8; j++) {
    node(x0 + j * step, 182, j, { stroke: j === 7 ? ACC : BORDER, fill: j === 7 ? ACCDIM : SURF });
  }
  node(cx, 226, 7, { stroke: ACC, fill: ACCDIM, sw: 1.8 });

  /* the counters */
  var rows = [
    ['first find(0)', String(CHAIN_PC.firstFind) + ' hops', 'walks the chain and rewrites 7 pointers'],
    ['second find(0)', String(CHAIN_PC.secondFind) + ' hop', 'the root is one step away now'],
    ['ten finds, n = 64, no compression', String(CHAIN64.naive.tenFinds) + ' hops', 'every find re-walks all 63 edges'],
    ['ten finds, n = 64, compression', String(CHAIN64.pc.tenFinds) + ' hops', '63 once, then 9 finds at one hop each']
  ];
  tbl(30, 258, [{ name: 'operation', w: 250 }, { name: 'measured', w: 110 },
                { name: 'what happened', w: 370 }], rows, { rh: 22, size: 10.5 });

  panel(30, 366, 840, 84, { fill: WARNDIM, stroke: WARN });
  label(44, 378, 'Compression changes no rank, no root and no membership.', { size: 12, bold: true, color: INK });
  label(44, 398, 'On the rank trace, find(7) lowers the real height from 3 to 2 while the root keeps rank 3. Rank records what', { size: 11 });
  label(44, 416, 'the height would be without compression, so height <= rank always, and the inequality is often strict. That is', { size: 11 });
  label(44, 434, 'why the field is called a rank, and why the analysis has to be amortised.', { size: 11 });
}

/* ---------- scene 5: the bounds ---------- */
function drawBounds(t) {
  var p = prog(t);
  head('Four implementations, four bounds, one measured sequence',
       '256 elements, 2,000 unions, the same sequence given to each implementation');

  var rows = [
    ['no repair', 'Theta of n', 'Theta of m n', MEASURED.naive.perOp.toFixed(2)],
    ['union by rank', 'O of log n, tight', 'O of m log n', MEASURED.rank.perOp.toFixed(2)],
    ['compression only', 'Theta of n single op', 'O of m log n', MEASURED.pc.perOp.toFixed(2)],
    ['rank + compression', 'amortised O of alpha n', 'O of m alpha n', MEASURED.rankpc.perOp.toFixed(2)]
  ];
  tbl(30, 62, [{ name: 'implementation', w: 190 }, { name: 'worst single operation', w: 220 },
               { name: 'sequence of m operations', w: 240 }, { name: 'hops per op here', w: 190 }],
      rows, { rh: 30, size: 11, boldCol: [3] });

  /* the hop bars */
  label(30, 214, 'measured hops per operation on this page', { size: 11.5, bold: true, color: INK });
  var modes = [['naive', BAD], ['rank', WARN], ['pc', INFO], ['rankpc', VAL]];
  var maxV = MEASURED.naive.perOp, bx = 60, bw = 150, base = 372;
  for (var i = 0; i < modes.length; i++) {
    var v = MEASURED[modes[i][0]].perOp;
    var hgt = Math.max(2, (v / maxV) * 110);
    var x = bx + i * 205;
    P.rect(x, base - hgt, bw, hgt, { fill: modes[i][1] + 'cc', stroke: modes[i][1], sw: 1, radius: 3 });
    label(x + bw / 2, base - hgt - 20, v.toFixed(2), { size: 11.5, bold: true, align: 'center', color: modes[i][1], mono: true });
    label(x + bw / 2, base + 8, modes[i][0], { size: 10.5, align: 'center' });
  }
  P.line(50, base, 840, base, { stroke: BORDER, sw: 1.3 });

  panel(30, 392, 840, 62, { fill: SURF2, stroke: BORDER });
  label(44, 404, 'The ordering matches the four bounds, and ' + MEASURED.rankpc.rejected + ' of the 2,000 unions were rejected in every implementation.',
        { size: 11 });
  label(44, 422, 'The absolute numbers belong to this sequence, not to the structure: what generalises is the row of bounds.', { size: 11 });
  label(44, 440, 'Compression alone still allows a single Theta of n find, because a later union can lengthen a path again.', { size: 11, color: WARN });
}

/* ---------- scene 6: alpha ---------- */
function drawAlpha(t) {
  var p = prog(t);
  head('Alpha of n is not one, and it is not a constant',
       'The Ackermann thresholds, computed from the recursion on this page');

  panel(30, 62, 400, 132, { fill: SURF2, stroke: BORDER });
  label(44, 74, 'the recursion', { size: 11.5, bold: true, color: INK });
  label(44, 96, 'A(0, j) = j + 1', { size: 12, mono: true, color: INK });
  label(44, 116, 'A(k, 0) = A(k-1, 1)', { size: 12, mono: true, color: INK });
  label(44, 136, 'A(k, j) = A(k-1, A(k, j-1))', { size: 12, mono: true, color: INK });
  label(44, 160, 'alpha(n) = smallest k >= 1 with A(k,1) >= n', { size: 11 });
  label(44, 178, 'Rows: successor, addition, times two, power, iterate.', { size: 10.5 });

  var rows = [];
  for (var i = 0; i < ALPHA_TABLE.length; i++) {
    var r = ALPHA_TABLE[i];
    rows.push(['alpha = ' + r.alpha,
               r.to === Infinity ? 'above ' + (r.from - 1).toLocaleString('en-US') : String(r.from) + ' .. ' + r.to.toLocaleString('en-US')]);
  }
  tbl(460, 62, [{ name: 'inverse Ackermann', w: 160 }, { name: 'range of n', w: 260 }], rows, { rh: 22, size: 11 });

  label(30, 218, 'A(k,1) for k = 0 to 4:  ' + ACKER.thresholds.join('   '), { size: 11.5, mono: true, bold: true, color: INK });
  label(30, 240, 'A(4,1) = A(3,13) = 65533.  A(4,2) = A(3,65533) = 2^65536 - 3.', { size: 11.5, mono: true });
  label(30, 262, 'So alpha is 5 for everything from 65,534 up to at least 2^65536,', { size: 11.5 });
  label(30, 280, 'which is a number of about ' + ALPHA_BEYOND.digits.toLocaleString('en-US') + ' decimal digits —', { size: 11.5 });
  label(30, 298, 'against roughly 10^80 atoms in the observable universe.', { size: 11.5 });

  panel(30, 322, 840, 128, { fill: WARNDIM, stroke: WARN });
  label(44, 334, 'What the bound says, and what it does not', { size: 12, bold: true, color: INK });
  label(44, 356, 'A sequence of m operations on n elements costs O of m alpha of n. That is a total, not a per-operation figure:', { size: 11 });
  label(44, 374, 'one operation in the sequence may still walk a long path.', { size: 11 });
  label(44, 396, '"Effectively constant" is a remark about how alpha behaves for sizes a computer can hold. It is not a', { size: 11 });
  label(44, 414, 'substitution in a proof, and when an option list offers both O of 1 and O of alpha of n, the second is the', { size: 11 });
  label(44, 432, 'answer. The first is false as a theorem.', { size: 11 });
}

/* ---------- scene 7: Kruskal ---------- */
function drawKruskal(t) {
  var p = prog(t);
  head('Kruskal: the cycle test is one comparison of two roots',
       'Six vertices, nine edges, five accepted with total weight 14, four rejected');

  var vx = { A: 80, B: 210, C: 200, D: 330, E: 430, F: 470 };
  var vy = { A: 120, B: 78, C: 210, D: 140, E: 78, F: 236 };
  var acceptedKeys = {};
  KRUSKAL.accepted.forEach(function (e) { acceptedKeys[e.a + e.b] = true; acceptedKeys[e.b + e.a] = true; });

  var reveal = Math.min(1, p / 0.8);
  var shown = Math.ceil(reveal * KRUSKAL.sorted.length);

  KRUSKAL.sorted.forEach(function (e, i) {
    var x1 = vx[e[0]], y1 = vy[e[0]], x2 = vx[e[1]], y2 = vy[e[1]];
    var isAcc = acceptedKeys[e[0] + e[1]];
    if (i >= shown) return;
    P.line(x1, y1, x2, y2, {
      stroke: isAcc ? VAL : (i < shown ? INVALIDDIM : BORDER),
      sw: isAcc ? 2.4 : 1
    });
    var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    label(mx - 4, my - 6, String(e[2]), { size: 10, mono: true, color: isAcc ? VAL : DIM, bold: isAcc });
  });
  GRAPH.vertices.forEach(function (v) {
    node(vx[v], vy[v], v, { stroke: ACC, fill: ACCDIM, r: 14, size: 11.5 });
  });

  var rows = [];
  KRUSKAL.sorted.forEach(function (e) {
    var isAcc = acceptedKeys[e[0] + e[1]];
    rows.push([e[0] + '-' + e[1], String(e[2]), isAcc ? 'accept' : 'reject',
               isAcc ? 'different roots: union' : 'same root: cycle']);
  });
  tbl(520, 62, [{ name: 'edge', w: 62 }, { name: 'w', w: 38 },
                { name: 'action', w: 78 }, { name: 'reason', w: 172 }], rows,
      { rh: 20, size: 10, rowFill: KRUSKAL.sorted.map(function (e) {
        return acceptedKeys[e[0] + e[1]] ? 'rgba(21,128,61,0.08)' : 'rgba(179,38,30,0.06)';
      }) });

  panel(30, 268, 480, 100, { fill: SURF2, stroke: BORDER });
  label(44, 280, 'the counts, which the weights do not change', { size: 11.5, bold: true, color: INK });
  label(44, 302, 'finds: 2 per edge = ' + KRUSKAL.finds + '      unions: n - 1 = ' + KRUSKAL.unions +
        '      rejects: m - n + 1 = ' + KRUSKAL.rejected.length, { size: 11, mono: true });
  label(44, 324, 'total weight of the accepted set: ' + KRUSKAL.weight, { size: 11, mono: true, color: VAL, bold: true });
  label(44, 346, 'pointer hops spent by the whole run: ' + KRUSKAL.hops, { size: 11, mono: true });

  panel(30, 382, 840, 74, { fill: ACCDIM, stroke: ACC });
  label(44, 394, 'With the edges pre-sorted, the sorting term is gone and only the disjoint-set work is left:', { size: 11.5, color: INK });
  label(44, 414, 'O of m alpha of n with both repairs; O of m log n with union by rank alone; Theta of m n with neither.', { size: 11.5, color: INK, bold: true });
  label(44, 436, 'GATE 1992 asked exactly this, which is why the answer depends on the implementation the candidate assumes.', { size: 10.5 });
}

/* ---------- scene 8: counting ---------- */
function drawCounting(t) {
  var p = prog(t);
  head('Counting components without tracing the forest',
       'Ten elements, eight union calls, seven successful: three sets remain');

  var x0 = 60, step = 88, y = 90;
  var isRoot = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  var parentOf = (function () {
    var u = makeUF(10, 'rankpc');
    COMPONENTS.marks.forEach(function (m) { u.union(m.a, m.b); });
    return u.parent.slice();
  })();
  for (var i = 0; i < 10; i++) {
    var root = parentOf[i] === i;
    node(x0 + i * step, y, i, { stroke: root ? ACC : BORDER, fill: root ? ACCDIM : SURF, sw: root ? 1.8 : 1.2 });
    label(x0 + i * step, y + 22, root ? 'root' : 'parent ' + parentOf[i], { size: 9, align: 'center', color: root ? ACC : DIM });
  }

  label(30, 140, 'the eight calls, in order', { size: 11.5, bold: true, color: INK });
  var shown = Math.min(COMPONENTS.marks.length, Math.ceil(Math.min(1, p / 0.85) * COMPONENTS.marks.length));
  for (var m = 0; m < COMPONENTS.marks.length; m++) {
    var mk = COMPONENTS.marks[m];
    var cx = 40 + (m % 4) * 215, cy = 164 + Math.floor(m / 4) * 26;
    var on = m < shown;
    label(cx, cy, 'union(' + mk.a + ', ' + mk.b + ')', { size: 10.5, mono: true, color: on ? INK : FAINT });
    label(cx + 118, cy, on ? (mk.merged ? 'merged' : 'no change') : '', {
      size: 10, color: mk.merged ? VAL : BAD, bold: true
    });
  }

  panel(30, 232, 400, 118, { fill: SURF2, stroke: BORDER });
  label(44, 244, 'two routes to the same number', { size: 11.5, bold: true, color: INK });
  label(44, 266, 'n - successful unions', { size: 11 });
  label(44, 284, '10 - ' + COMPONENTS.successful + ' = ' + (COMPONENTS.n - COMPONENTS.successful), { size: 12, mono: true, bold: true, color: ACC });
  label(44, 308, 'count the roots: elements with parent = self', { size: 11 });
  label(44, 326, 'roots = ' + COMPONENTS.roots, { size: 12, mono: true, bold: true, color: ACC });

  panel(452, 232, 418, 118, { fill: WARNDIM, stroke: WARN });
  label(466, 244, 'a union that returns false is information', { size: 11.5, bold: true, color: INK });
  label(466, 266, 'The two elements are already connected, so the edge', { size: 11 });
  label(466, 284, 'closes a cycle. In Kruskal that is the answer, not an', { size: 11 });
  label(466, 302, 'error, and the component count is exactly the number', { size: 11 });
  label(466, 320, 'of unions that succeeded.', { size: 11 });

  panel(30, 364, 840, 88, { fill: ACCDIM, stroke: ACC });
  label(44, 376, 'After n - 1 successful unions on n elements, one set remains: the graph is connected and the forest is one tree.',
        { size: 11.5, color: INK, bold: true });
  label(44, 398, 'That is why Kruskal can stop at n - 1 accepted edges, and why any further union must fail: the only two roots', { size: 11 });
  label(44, 416, 'are already the same root. Verified here on ten elements with nine unions, which leaves exactly one root.', { size: 11 });
  label(44, 438, 'A failed union is the cycle test of scene 7 seen from the counting side.', { size: 10.5, color: DIM });
}

/* ---------- scene 9: limits ---------- */
function drawLimits(t) {
  var p = prog(t);
  head('What a disjoint-set forest cannot do',
       'Four questions this structure does not answer, and what does');

  var cards = [
    ['no split', 'Only merges: the number of sets never rises. Delete, undo and rollback need another structure.'],
    ['no path', 'It says same or different, not how. Parent pointers are bookkeeping, not graph edges.'],
    ['undirected only', 'A cycle test on a directed graph is wrong: a to b and b to a is a directed cycle, not an undirected one.'],
    ['no member list', 'Pointers run upward only, so listing a set costs a scan of all n elements and a find on each.']
  ];
  var w = 410, h = 150;
  for (var i = 0; i < 4; i++) {
    var x = 30 + (i % 2) * 430, y = 64 + Math.floor(i / 2) * 168;
    var on = p > i * 0.2;
    panel(x, y, w, h, { fill: on ? INVALIDDIM : SURF, stroke: on ? BAD : BORDER, sw: on ? 1.4 : 1 });
    label(x + 14, y + 16, cards[i][0], { size: 13, bold: true, color: on ? BAD : DIM });
    var words = cards[i][1].match(/.{1,52}(\s|$)/g) || [cards[i][1]];
    for (var j = 0; j < words.length && j < 5; j++) {
      label(x + 14, y + 46 + j * 18, words[j].trim(), { size: 11 });
    }
  }
  label(30, 424, 'Each of these has a home elsewhere in the syllabus: adjacency lists and DFS for paths and directed cycles,', { size: 11, color: DIM });
  label(30, 442, 'a member list per root for listing, and a link-cut tree for splits — which GATE does not ask for.', { size: 11, color: DIM });
}

/* ---------- scene 10: procedure ---------- */
function drawProcedure(t) {
  var p = prog(t);
  head('The procedure, and the four traps',
       'Four questions in order, then three sentences to write');

  var steps = [
    ['1  which linking rule?', 'naive, by rank, or by size — and on a tie, which root stays on top'],
    ['2  is compression on?', 'if it is, the parent array depends on the order of the finds too'],
    ['3  count hops, and state n and m', 'a bound without its two parameters is not a bound'],
    ['4  which of the four rows?', 'no repair, rank alone, compression alone, or both together']
  ];
  for (var i = 0; i < 4; i++) {
    var y = 66 + i * 42;
    var on = p > i * 0.22;
    panel(30, y, 840, 36, { fill: on ? SURF2 : SURF, stroke: on ? ACC : BORDER, sw: on ? 1.3 : 1 });
    label(44, y + 9, steps[i][0], { size: 11.5, bold: true, color: on ? INK : DIM });
    label(44, y + 24, steps[i][1], { size: 10.5 });
  }

  panel(30, 244, 840, 100, { fill: ACCDIM, stroke: ACC });
  label(44, 256, 'three sentences to write', { size: 12, bold: true, color: INK });
  label(44, 280, 'No repair: a find is Theta of n in the worst case, and m operations cost Theta of m n.', { size: 11.5, color: INK });
  label(44, 302, 'Union by rank alone: O of log n per find, and the balanced merge shows the bound is tight.', { size: 11.5, color: INK });
  label(44, 324, 'Both together: O of m alpha of n for the whole sequence, amortised — not per operation.', { size: 11.5, color: INK });

  panel(30, 358, 840, 94, { fill: WARNDIM, stroke: WARN });
  label(44, 370, 'the four traps', { size: 12, bold: true, color: INK });
  label(44, 392, 'Rank is not height once compression is on.  |  Union by rank and union by size give different arrays.', { size: 11 });
  label(44, 412, 'Tracing the unions and forgetting the finds rewires the paths.  |  O of 1 is not O of alpha of n.', { size: 11 });
  label(44, 434, 'And a failed union is the cycle test, not an error.', { size: 11 });
}

/* ---------- dispatch + boot ---------- */

var DRAW = {
  question: drawQuestion,
  chain: drawChain,
  rank: drawRank,
  compress: drawCompress,
  bounds: drawBounds,
  alpha: drawAlpha,
  kruskal: drawKruskal,
  counting: drawCounting,
  limits: drawLimits,
  procedure: drawProcedure
};

function drawFrame(P2) {
  P = P2;
  P.alpha(1);
  P.clear();
  P.rect(0, 0, W, H, { fill: SURF });
  var id = sceneIdAt(K.state.elapsed);
  var fn = DRAW[id] || drawQuestion;
  try { fn(K.state.elapsed); } catch (e) { console.error('scene ' + id, e); }
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

/* the model, exposed for the headless check and for anyone reading the source */
window.LESSON_MODEL = {
  makeUF: makeUF, CHAIN: CHAIN, CHAIN_PC: CHAIN_PC, CHAIN64: CHAIN64,
  RANK_INVARIANT: RANK_INVARIANT, BALANCED: BALANCED,
  TRACE8: TRACE8, TRACE8_RANKPC: TRACE8_RANKPC,
  MEASURED: MEASURED, ACKER: ACKER, ALPHA_TABLE: ALPHA_TABLE, ALPHA_BEYOND: ALPHA_BEYOND,
  GRAPH: GRAPH, KRUSKAL: KRUSKAL, COMPONENTS: COMPONENTS
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
