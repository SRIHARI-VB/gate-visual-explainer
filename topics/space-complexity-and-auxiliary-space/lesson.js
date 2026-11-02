/* ==========================================================================
   space-complexity-and-auxiliary-space — lesson.js
   Four layers, in order:
     1. THE MODEL   — every number this lesson shows, computed here.
     2. THE CHECKS  — each computed value re-verified against a definition.
     3. RENDER      — reads the model; never re-derives it.
     4. BOOT        — p5.js first, the browser's own canvas as the fallback.

   The model runs the recursions rather than asserting their closed forms:
   the 2005 function is executed and its peak frame count recorded, naive
   Fibonacci is enumerated, merge sort is actually split, and the partition
   of quick sort is run on a sorted array. Each closed form is then checked
   against the enumeration, so a mistake in either one surfaces as a failed
   check instead of a wrong caption.
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
  var SURF = PAL.surface, SURF2 = PAL.surface2, BORDER = PAL.border;
  var ACCDIM = PAL.accentDim || '#d6efeb';
  var WARNDIM = PAL.warnDim || '#fbeed3';
  var INVALIDDIM = PAL.invalidDim || '#fbe4e2';

/* ======================================================================
   LAYER 1 — THE MODEL
   Every number this lesson shows is computed here, from the definitions.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- 1. the GATE 2005 function, executed ----------
   double foo(int n) { int i; double sum;
     if (n == 0) return 1.0;
     sum = 0.0;
     for (i = 0; i < n; i++) sum += foo(i);
     return sum; }                                            */

function fooRun(n) {
  var peak = 0, alive = 0, calls = 0;
  (function rec(k) {
    alive++; calls++;
    if (alive > peak) peak = alive;
    if (k !== 0) {
      for (var i = 0; i < k; i++) rec(i);
    }
    alive--;
  })(n);
  return { peak: peak, calls: calls };
}

/* the closed forms this program should satisfy */
function fooPeakFormula(n) { return n + 1; }
function fooCallsFormula(n) { return Math.pow(2, n); }

/* ---------- 2. naive Fibonacci, enumerated ---------- */

function fibRun(n) {
  var peak = 0, alive = 0, calls = 0;
  (function f(k) {
    alive++; calls++;
    if (alive > peak) peak = alive;
    if (k >= 2) { f(k - 1); f(k - 2); }
    alive--;
  })(n);
  return { peak: peak, calls: calls };
}

var FIB = [0, 1];
for (var _i = 2; _i <= 40; _i++) FIB.push(FIB[_i - 1] + FIB[_i - 2]);
function fibNum(n) { return FIB[n]; }
function fibCallsFormula(n) { return 2 * FIB[n + 1] - 1; }
function fibPeakFormula(n) { return n < 1 ? 1 : n; }   // the chain stops at fib(1)

/* ---------- 3. merge sort: the split, and the depth it reaches ---------- */

function mergeDepth(n) {
  if (n <= 1) return 1;
  var left = Math.ceil(n / 2), right = n - left;
  return 1 + Math.max(mergeDepth(left), mergeDepth(right));
}
function mergeDepthFormula(n) { return Math.ceil(Math.log(n) / Math.log(2)) + 1; }

/* the level widths of the split, for drawing */
function mergeLevels(n) {
  var levels = [], cur = [n];
  while (true) {
    levels.push(cur.slice());
    var next = [], all = true;
    for (var i = 0; i < cur.length; i++) {
      if (cur[i] > 1) { all = false; next.push(Math.ceil(cur[i] / 2), Math.floor(cur[i] / 2)); }
      else next.push(cur[i]);
    }
    if (all) break;
    cur = next;
  }
  return levels;
}

/* ---------- 4. quick sort: the partition, executed ---------- */

function quickRun(arr, pivotMode) {
  var a = arr.slice(), peak = 0, depthNow = 0, comps = 0;
  function rec(lo, hi) {
    depthNow++;
    if (depthNow > peak) peak = depthNow;
    if (lo < hi) {
      var pIdx = pivotMode === 'last' ? hi : lo + ((hi - lo) >> 1);
      var p = a[pIdx];
      var t = a[pIdx]; a[pIdx] = a[hi]; a[hi] = t;   // move pivot to the end
      var i = lo - 1;
      for (var j = lo; j < hi; j++) {
        comps++;
        if (a[j] <= p) { i++; var u = a[i]; a[i] = a[j]; a[j] = u; }
      }
      var v = a[i + 1]; a[i + 1] = a[hi]; a[hi] = v;
      var m = i + 1;
      rec(lo, m - 1);
      rec(m + 1, hi);
    }
    depthNow--;
  }
  rec(0, a.length - 1);
  return { peak: peak, comps: comps, sorted: a };
}

function ascending(n) { var a = []; for (var i = 0; i < n; i++) a.push(i); return a; }

var QS_N = 64;
var QS_WORST = quickRun(ascending(QS_N), 'last');
var QS_BALANCED = quickRun(ascending(QS_N), 'median');

/* ---------- 5. the graph: BFS width, DFS depth, storage ---------- */

var GRAPH = {
  V: 9,
  adj: [[1, 2, 3, 4], [0], [0], [0], [0, 5], [5, 6], [6, 7], [6, 8], [7]],
  /* layout coordinates only; the adjacency above is the structure */
  pos: [[150, 82], [58, 168], [150, 168], [242, 168], [334, 168],
        [414, 240], [414, 312], [414, 384], [334, 384]]
};

function bfsWidths(src) {
  var seen = {}; seen[src] = true;
  var q = [src], widths = [], layers = [];
  while (q.length) {
    widths.push(q.length);
    var layer = q.slice();
    layers.push(layer);
    var next = [];
    for (var i = 0; i < q.length; i++) {
      var u = q[i];
      for (var k = 0; k < GRAPH.adj[u].length; k++) {
        var v = GRAPH.adj[u][k];
        if (!seen[v]) { seen[v] = true; next.push(v); }
      }
    }
    q = next;
  }
  return { widths: widths, maxWidth: Math.max.apply(null, widths), layers: layers };
}

function dfsDepth(src) {
  var best = 0;
  (function rec(u, seen, d) {
    if (d > best) best = d;
    for (var k = 0; k < GRAPH.adj[u].length; k++) {
      var v = GRAPH.adj[u][k];
      if (!seen[v]) { seen[v] = true; rec(v, seen, d + 1); }
    }
  })(src, (function () { var s = {}; s[src] = true; return s; })(), 1);
  return best;
}

function edgeCount() {
  var s = 0;
  for (var i = 0; i < GRAPH.adj.length; i++) s += GRAPH.adj[i].length;
  return s / 2;
}

var BFS = bfsWidths(0);
var DFS_PEAK = dfsDepth(0);
var GRAPH_E = edgeCount();
var GRAPH_MATRIX = GRAPH.V * GRAPH.V;
var GRAPH_LIST = GRAPH.V + 2 * GRAPH_E;

/* ---------- 6. the space of the standard algorithms ---------- */

var SORTS = [
  { name: 'insertion sort',     aux: 'Θ(1)',      order: 0, note: 'moves keys inside the array' },
  { name: 'selection sort',     aux: 'Θ(1)',      order: 0, note: 'one swap per position' },
  { name: 'heapsort (loop sift)', aux: 'Θ(1)',    order: 0, note: 'the recursion is what costs' },
  { name: 'heapsort (recursive)', aux: 'Θ(log n)', order: 1, note: 'sift-down holds log n frames' },
  { name: 'quick sort (median)', aux: 'Θ(log n)', order: 1, note: 'balanced splits' },
  { name: 'quick sort (worst)',  aux: 'Θ(n)',     order: 2, note: 'one key removed per level' },
  { name: 'merge sort (array)',  aux: 'Θ(n)',     order: 2, note: 'the merge buffer decides' },
  { name: 'merge sort (list)',   aux: 'Θ(log n)', order: 1, note: 'links are rewired, no buffer' },
  { name: 'counting sort',       aux: 'Θ(n + k)', order: 3, note: 'output array and count array' }
];

/* ---------- 7. dynamic programming: the space each version needs ---------- */

var DP = [
  { name: 'Fibonacci, naive recursion', space: 'Θ(n)', cells: 31, time: 'Θ(2ⁿ)' },
  { name: 'Fibonacci, memoised',        space: 'Θ(n)', cells: 31, time: 'Θ(n)' },
  { name: 'Fibonacci, two variables',   space: 'Θ(1)', cells: 2,  time: 'Θ(n)' },
  { name: 'LCS, full table (1,000 × 1,000)', space: 'Θ(mn)', cells: 1000000, time: 'Θ(mn)' },
  { name: 'LCS, two rolling rows',      space: 'Θ(min(m,n))', cells: 2000, time: 'Θ(mn)' },
  { name: 'Floyd–Warshall (V = 100)',   space: 'Θ(V²)', cells: 10000, time: 'Θ(V³)' }
];

/* ---------- 8. the derived numbers the captions quote ---------- */

var MERGE_N = 1024;
var MERGE_DEPTH = mergeDepth(MERGE_N);
var MERGE_PEAK = MERGE_N + MERGE_DEPTH;          // buffer + stack
var FOO_N = 8;
var FOO = fooRun(FOO_N);
var FIB_N = 20;
var FIBRUN = fibRun(FIB_N);
var FIB_N30_CALLS = fibCallsFormula(30);
var FIB_RATIO_30 = Math.round(FIB_N30_CALLS / 30);
var LCS_SAVING = 1000000 / 2000;

/* ---------- 9. the call tree of fib(4), for drawing ---------- */

function buildFibTree(n) {
  var nodes = [], edges = [], leaf = 0;
  (function rec(k, level) {
    var idx = nodes.length;
    nodes.push({ k: k, level: level, x: 0 });
    var left = null, right = null;
    if (k >= 2) { left = rec(k - 1, level + 1); right = rec(k - 2, level + 1); }
    if (left !== null) {
      edges.push([idx, left]); edges.push([idx, right]);
      nodes[idx].x = (nodes[left].x + nodes[right].x) / 2;
    } else {
      nodes[idx].x = leaf++;
    }
    return idx;
  })(n, 0);
  return { nodes: nodes, edges: edges, leaves: leaf };
}
var FIB_TREE = buildFibTree(4);

/* ======================================================================
   LAYER 2 — THE CHECKS
   Each one compares a computed value against a definition or a closed form.
   ====================================================================== */

(function runChecks() {
  var n, bad = [];

  /* the 2005 function: peak frames against its closed form */
  for (n = 0; n <= 9; n++) {
    if (fooRun(n).peak !== fooPeakFormula(n)) bad.push('foo peak at n=' + n);
  }
  chk('2005 function: peak live frames = n + 1 for n = 0..9', bad.length === 0, bad.join(', '));

  /* the 2005 function: total calls against 2^n */
  bad = [];
  for (n = 0; n <= 12; n++) {
    if (fooRun(n).calls !== fooCallsFormula(n)) bad.push('foo calls at n=' + n);
  }
  chk('2005 function: total calls = 2^n for n = 0..12', bad.length === 0, bad.join(', '));

  /* naive Fibonacci: height, not node count */
  bad = [];
  for (n = 0; n <= 18; n++) {
    var r = fibRun(n);
    if (r.peak !== fibPeakFormula(n)) bad.push('fib peak at n=' + n);
    if (r.calls !== fibCallsFormula(n)) bad.push('fib calls at n=' + n);
  }
  chk('naive Fibonacci: peak frames = max(n,1) and calls = 2·F(n+1) − 1 for n = 0..18',
      bad.length === 0, bad.join(', '));

  chk('naive Fibonacci at n = 20: 21,891 calls but only 20 frames alive',
      FIBRUN.calls === 21891 && FIBRUN.peak === 20, FIBRUN.calls + ' calls, ' + FIBRUN.peak + ' frames');

  chk('space is the tree height: calls at n = 30 exceed frames by a factor of ' + FIB_RATIO_30,
      FIB_N30_CALLS === 2692537 && Math.round(FIB_N30_CALLS / 30) === FIB_RATIO_30, '');

  /* merge sort: depth against the ceiling formula */
  bad = [];
  for (n = 1; n <= 256; n++) {
    if (mergeDepth(n) !== mergeDepthFormula(n)) bad.push('merge depth at n=' + n);
  }
  chk('merge sort: recursion depth = ⌈log₂ n⌉ + 1 for n = 1..256', bad.length === 0, bad.join(', '));

  chk('merge sort at n = 1024: depth 11, buffer 1024, peak 1035',
      MERGE_DEPTH === 11 && MERGE_PEAK === 1035, MERGE_DEPTH + ' / ' + MERGE_PEAK);

  /* quick sort: worst case is exactly the sorted array */
  bad = [];
  for (n = 2; n <= 40; n++) {
    var q = quickRun(ascending(n), 'last');
    if (q.peak !== n) bad.push('quick depth at n=' + n + ' was ' + q.peak);
    if (q.comps !== n * (n - 1) / 2) bad.push('quick comparisons at n=' + n);
  }
  chk('quick sort on sorted input: depth = n and comparisons = n(n−1)/2 for n = 2..40',
      bad.length === 0, bad.join(', '));

  chk('quick sort at n = 64: depth 64 and 2,016 comparisons',
      QS_WORST.peak === 64 && QS_WORST.comps === 2016,
      QS_WORST.peak + ' levels, ' + QS_WORST.comps + ' comparisons');

  chk('quick sort sorts correctly in both pivot modes',
      QS_WORST.sorted.every(function (v, i) { return v === i; }) &&
      QS_BALANCED.sorted.every(function (v, i) { return v === i; }), '');

  chk('quick sort with a median pivot: depth ' + QS_BALANCED.peak + ' = ⌈log₂ 64⌉ + 1',
      QS_BALANCED.peak === mergeDepthFormula(64), String(QS_BALANCED.peak));

  /* graphs: both traversal bounds, and both storage costs */
  chk('BFS frontier never exceeds V, and its widest layer here is 4',
      BFS.maxWidth === 4 && BFS.maxWidth <= GRAPH.V, 'width ' + BFS.maxWidth);

  chk('DFS stack never exceeds V, and its deepest chain here is 6',
      DFS_PEAK === 6 && DFS_PEAK <= GRAPH.V, 'depth ' + DFS_PEAK);

  chk('adjacency matrix = V² = 81 cells against a list of V + 2E = 25 slots',
      GRAPH_MATRIX === 81 && GRAPH_LIST === 25, GRAPH_MATRIX + ' / ' + GRAPH_LIST);

  /* the two conventions differ by exactly the input term */
  chk('total space = input + auxiliary: merge sort is 1024 + 1035 = 2059, still Θ(n)',
      MERGE_N + MERGE_PEAK === 2059, String(MERGE_N + MERGE_PEAK));

  /* rolling the LCS table changes space and not time */
  chk('LCS: two rows are 2,000 cells against 1,000,000, a factor of ' + LCS_SAVING,
      LCS_SAVING === 500, String(LCS_SAVING));

  /* the sort table must not contradict the executed results */
  var qWorst = SORTS.filter(function (s) { return s.name === 'quick sort (worst)'; })[0];
  chk('the sort table agrees with the executed quick sort worst case',
      qWorst && qWorst.aux === 'Θ(n)', qWorst ? qWorst.aux : 'missing');

  /* every DP row states a space class, and the cell counts are positive */
  chk('every dynamic-programming row has a space class and a positive cell count',
      DP.every(function (d) { return /Θ\(/.test(d.space) && d.cells > 0; }), '');

  /* the drawn Fibonacci tree really has 9 nodes and height 5 */
  var height = 0;
  for (var i = 0; i < FIB_TREE.nodes.length; i++) height = Math.max(height, FIB_TREE.nodes[i].level);
  chk('the drawn fib(4) tree has ' + FIB_TREE.nodes.length + ' nodes and height ' + (height + 1),
      FIB_TREE.nodes.length === 9 && height + 1 === 4, '');
})();

/* ======================================================================
   LAYER 3 — RENDER
   Reads the model. No arithmetic of its own beyond layout.
   ====================================================================== */

function hdr(title, sub) {
  P.text(30, 18, title, { size: 19, bold: true, color: INK });
  if (sub) P.text(30, 42, sub, { size: 12.5, color: DIM });
  P.line(30, 58, W - 30, 58, { stroke: BORDER, sw: 1 });
}

function foot(txt) {
  P.text(30, H - 16, txt, { size: 11.5, color: FAINT });
}

function card(x, y, w, h, fill, stroke, dash) {
  P.rect(x, y, w, h, { fill: fill || SURF, stroke: stroke || BORDER, radius: 8, sw: 1.2, dash: dash });
}

function tag(x, y, txt, colour) {
  P.text(x, y, txt, { size: 10.5, color: colour || FAINT, bold: true });
}

function chip(x, y, txt, colour, bg) {
  var w = 10 + String(txt).length * 6.4;
  P.rect(x, y, w, 19, { fill: bg || SURF2, stroke: colour || BORDER, radius: 9, sw: 1 });
  P.text(x + w / 2, y + 9.5, txt, { size: 10.5, color: colour || DIM, align: 'center', base: 'middle', bold: true });
  return w;
}

/* ---------- scene 1: a peak, not a total ---------- */

function drawPeak(t) {
  hdr('Space is a peak, not a total',
      'sum(n) = n + sum(n − 1) beside a loop that calls the same helper n times');
  var p = K.sceneProgress(t);

  /* left: the recursion, frames stacking */
  tag(56, 78, 'RECURSIVE: FRAMES STACK UP');
  var n = 4, top = 92, fh = 50, gap = 7;
  for (var i = 0; i <= n; i++) {
    var appear = K.clamp01((p - i * 0.06) / 0.18);
    if (appear <= 0) continue;
    P.alpha(appear);
    var y = top + i * (fh + gap);
    var fill = i === n ? WARNDIM : SURF;
    var stroke = i === n ? WARN : BORDER;
    card(56, y, 300, fh, fill, stroke);
    P.text(70, y + 16, 'sum(' + (n - i) + ')', { size: 14, bold: true, color: INK, mono: true });
    P.text(70, y + 33, i === n ? 'base case — the chain stops here' : 'waiting for sum(' + (n - i - 1) + ') to return',
           { size: 10.5, color: DIM });
    P.text(340, y + 24, 'frame ' + (i + 1), { size: 10.5, color: FAINT, align: 'right' });
    P.alpha(1);
  }
  P.text(56, top + (n + 1) * (fh + gap) + 12, '5 frames alive at the same instant → Θ(n) space',
         { size: 12.5, bold: true, color: WARN });

  /* right: the loop, one frame at a time */
  tag(410, 78, 'ITERATIVE: ONE FRAME AT A TIME');
  card(410, 92, 440, 96, SURF, BORDER);
  for (var k = 0; k < 5; k++) {
    var x = 428 + k * 82;
    var done = p > 0.15 + k * 0.07;
    card(x, 112, 66, 30, done ? ACCDIM : SURF2, done ? ACC : BORDER);
    P.text(x + 33, 127, 'f(' + k + ')', { size: 12, color: INK, align: 'center', base: 'middle', mono: true });
    if (k < 4) P.arrow(x + 68, 127, x + 80, 127, { stroke: FAINT, head: 5 });
  }
  P.text(428, 158, 'each call returns before the next begins', { size: 11, color: DIM });
  P.text(428, 176, 'one frame alive → Θ(1) space', { size: 12.5, bold: true, color: VAL });

  /* the two answers side by side */
  card(410, 204, 440, 168, SURF2, BORDER, [5, 4]);
  P.text(428, 220, 'Two measurements of the same run', { size: 12.5, bold: true, color: INK });
  P.text(428, 246, 'calls made over the whole run', { size: 11.5, color: DIM });
  P.text(834, 246, 'n', { size: 13, bold: true, color: INFO, align: 'right', mono: true });
  P.text(428, 272, 'frames alive at the worst instant', { size: 11.5, color: DIM });
  P.text(834, 272, 'n + 1 or 1', { size: 13, bold: true, color: ACC, align: 'right', mono: true });
  P.line(428, 292, 834, 292, { stroke: BORDER });
  P.text(428, 304, 'Time counts the first row. Space counts the second.', { size: 11.5, color: DIM });
  P.text(428, 330, 'A cell already freed occupies nothing.', { size: 11.5, color: DIM });
  P.text(428, 356, 'So the peak is what a space answer is about.', { size: 11.5, bold: true, color: INK });

  foot('Model: one cell = one word; one activation record = a constant number of words.');
}

/* ---------- scene 2: total and auxiliary ---------- */

function drawWhatCounts(t) {
  hdr('Total space = input + auxiliary',
      'The input is in both columns; only the auxiliary column separates the algorithms');
  var p = K.sceneProgress(t);

  tag(56, 76, 'ALGORITHM');
  tag(330, 76, 'AUXILIARY SPACE');
  tag(700, 76, 'TOTAL SPACE');

  var rows = [
    { name: 'insertion sort', aux: 'Θ(1)', w: 18, colour: VAL },
    { name: 'heapsort (loop sift)', aux: 'Θ(1)', w: 18, colour: VAL },
    { name: 'quick sort (median)', aux: 'Θ(log n)', w: 96, colour: INFO },
    { name: 'merge sort (array)', aux: 'Θ(n)', w: 330, colour: WARN }
  ];

  for (var i = 0; i < rows.length; i++) {
    var appear = K.clamp01((p - i * 0.08) / 0.2);
    if (appear <= 0) continue;
    P.alpha(appear);
    var y = 96 + i * 62;
    card(56, y, 788, 50, SURF, BORDER);
    P.text(70, y + 18, rows[i].name, { size: 13, bold: true, color: INK });
    P.text(70, y + 35, 'input of n keys, held in place', { size: 10.5, color: FAINT });
    P.rect(330, y + 16, rows[i].w, 18, { fill: rows[i].colour, stroke: rows[i].colour, radius: 4 });
    P.text(330 + rows[i].w + 10, y + 25, rows[i].aux,
           { size: 12.5, bold: true, color: rows[i].colour, base: 'middle', mono: true });
    P.text(700, y + 25, 'Θ(n)', { size: 12.5, bold: true, color: DIM, base: 'middle', mono: true });
    P.alpha(1);
  }

  card(56, 348, 788, 74, SURF2, BORDER, [5, 4]);
  P.text(70, 364, 'The total column is the same for all four, so a comparison on total space cannot rank them.',
         { size: 12, color: INK });
  P.text(70, 386, 'Auxiliary space is the sharper question: 1 against n is a real difference.',
         { size: 12, color: INK });
  P.text(70, 406, 'GATE says "space" for total and "extra" or "auxiliary" for the other column.',
         { size: 12, bold: true, color: ACC });

  foot('Bars are drawn to scale within the auxiliary column: 1 cell, log₂n frames, n cells.');
}

/* ---------- scene 3: the 2005 function ---------- */

function drawFrames(t) {
  hdr('GATE CSE 2005 Q81a: 2ⁿ calls, n + 1 frames',
      'foo(n) loops i = 0 … n − 1 and calls foo(i) inside the loop');
  var p = K.sceneProgress(t);

  tag(56, 76, 'THE DEEPEST CHAIN FOR n = 8');
  for (var i = 0; i <= FOO_N; i++) {
    var appear = K.clamp01((p - i * 0.045) / 0.15);
    if (appear <= 0) continue;
    P.alpha(appear);
    var x = 56 + i * 7, y = 88 + i * 32;
    card(x, y, 300, 27, i === 0 ? ACCDIM : SURF, i === 0 ? ACC : BORDER);
    P.text(x + 10, y + 13, 'foo(' + (FOO_N - i) + ')', { size: 12, bold: true, color: INK, base: 'middle', mono: true });
    P.text(x + 290, y + 13, 'i = ' + (FOO_N - i - 1) + ' at the deepest call',
           { size: 9.5, color: FAINT, align: 'right', base: 'middle' });
    P.alpha(1);
  }
  P.text(56, 92 + FOO_N * 32 + 22, 'Each frame waits for the one below it, so all 9 stay alive.',
         { size: 11.5, color: DIM });

  /* the two counts */
  card(420, 92, 430, 78, SURF, BORDER);
  P.text(436, 108, 'calls made over the whole run', { size: 11.5, color: DIM });
  P.text(834, 108, '2⁸ = 256', { size: 20, bold: true, color: INFO, align: 'right', mono: true });
  P.text(436, 140, 'a time quantity — frames that have already returned', { size: 10.5, color: FAINT });

  card(420, 182, 430, 78, SURF, WARN);
  P.text(436, 198, 'frames alive at the worst instant', { size: 11.5, color: DIM });
  P.text(834, 198, '9', { size: 20, bold: true, color: WARN, align: 'right', mono: true });
  P.text(436, 230, 'a space quantity — the depth of the chain', { size: 10.5, color: FAINT });

  card(420, 272, 430, 96, SURF2, BORDER, [5, 4]);
  P.text(436, 288, 'Space = depth × frame size = (n + 1) × c', { size: 12.5, bold: true, color: INK, mono: true });
  P.text(436, 312, 'So the answer is O(n), and the published key agrees.', { size: 11.5, color: DIM });
  P.text(436, 334, 'The wrong option O(2ⁿ) counts the calls instead.', { size: 11.5, color: BAD });
  P.text(436, 356, 'A frame that has returned occupies nothing.', { size: 11.5, color: DIM });

  foot('Both counts are produced by executing the recursion, not by quoting a table.');
}

/* ---------- scene 4: the height of the call tree ---------- */

function drawShape(t) {
  hdr('Space is the height of the call tree, not its size',
      'fib(4) drawn in full: 9 nodes, height 4 — and fib(20): 21,891 nodes, height 20');
  var p = K.sceneProgress(t);

  /* the tree */
  var tree = FIB_TREE;
  var spanX = 720, baseX = 60, topY = 84, dy = 40;
  function px(node) { return baseX + (tree.leaves === 1 ? spanX / 2 : (node.x / (tree.leaves - 1)) * spanX); }
  function py(node) { return topY + node.level * dy; }

  for (var e = 0; e < tree.edges.length; e++) {
    var appear = K.clamp01((p - e * 0.02) / 0.2);
    if (appear <= 0) continue;
    P.alpha(appear * 0.8);
    var a = tree.nodes[tree.edges[e][0]], b = tree.nodes[tree.edges[e][1]];
    P.line(px(a), py(a) + 12, px(b), py(b) - 12, { stroke: FAINT, sw: 1.2 });
    P.alpha(1);
  }
  for (var i = 0; i < tree.nodes.length; i++) {
    var nd = tree.nodes[i];
    var ap = K.clamp01((p - i * 0.02) / 0.2);
    if (ap <= 0) continue;
    P.alpha(ap);
    var isLeaf = nd.k < 2;
    P.circle(px(nd), py(nd), 12, { fill: isLeaf ? ACCDIM : SURF, stroke: isLeaf ? ACC : BORDER, sw: 1.4 });
    P.text(px(nd), py(nd), String(nd.k), { size: 11, bold: true, color: INK, align: 'center', base: 'middle', mono: true });
    P.alpha(1);
  }

  /* the deepest path, highlighted */
  var deepest = 0;
  for (var d = 0; d < tree.nodes.length; d++) if (tree.nodes[d].level > tree.nodes[deepest].level) deepest = d;
  P.text(60, 76, 'the highlighted chain is one root-to-leaf path', { size: 10.5, color: WARN });

  /* the two counts, at n = 20 */
  card(60, 320, 380, 78, SURF, BORDER);
  P.text(76, 336, 'nodes in the tree at n = 20', { size: 11.5, color: DIM });
  P.text(424, 350, '21,891', { size: 18, bold: true, color: INFO, align: 'right', mono: true });
  P.text(76, 372, 'the number of calls — a time quantity', { size: 10.5, color: FAINT });

  card(460, 320, 390, 78, SURF, WARN);
  P.text(476, 336, 'height of the tree at n = 20', { size: 11.5, color: DIM });
  P.text(834, 350, '20', { size: 18, bold: true, color: WARN, align: 'right', mono: true });
  P.text(476, 372, 'the frames alive together — the space answer', { size: 10.5, color: FAINT });

  foot('Time 2·F(n+1) − 1, space n. At n = 30 that is 2,692,537 calls against 30 frames.');
}

/* ---------- scene 5: merge sort ---------- */

function drawDivide(t) {
  hdr('Merge sort on 1,024 keys: depth 11, buffer 1,024',
      'Peak = buffer + stack = n + ⌈log₂ n⌉ + 1 = 1,035 cells, so Θ(n)');
  var p = K.sceneProgress(t);

  tag(56, 76, 'THE SPLIT, LEVEL BY LEVEL');
  var levels = mergeLevels(16);
  for (var L = 0; L < levels.length; L++) {
    var appear = K.clamp01((p - L * 0.05) / 0.2);
    if (appear <= 0) continue;
    P.alpha(appear);
    var y = 90 + L * 26;
    var total = 16, x = 56;
    for (var i = 0; i < levels[L].length; i++) {
      var wseg = (levels[L][i] / total) * 300;
      P.rect(x, y, Math.max(2, wseg - 1.5), 16, {
        fill: L === 0 ? ACCDIM : SURF2, stroke: L === 0 ? ACC : BORDER, radius: 3, sw: 1
      });
      x += wseg;
    }
    P.text(366, y + 8, 'level ' + L, { size: 10, color: FAINT, base: 'middle', mono: true });
    P.alpha(1);
  }
  P.text(56, 90 + levels.length * 26 + 16, '16 keys shown; 1,024 keys need 11 levels, not 5.',
         { size: 11, color: DIM });

  /* the buffer */
  tag(430, 76, 'THE MERGE BUFFER');
  P.rect(430, 92, 414, 26, { fill: WARNDIM, stroke: WARN, radius: 4, sw: 1.3 });
  for (var c = 1; c < 16; c++) {
    P.line(430 + c * (414 / 16), 92, 430 + c * (414 / 16), 118, { stroke: WARN, sw: 0.6 });
  }
  P.text(637, 105, 'n = 1,024 cells', { size: 12, bold: true, color: WARN, align: 'center', base: 'middle' });
  P.text(430, 134, 'one buffer, reused at every level', { size: 10.5, color: FAINT });

  /* the stack */
  tag(430, 158, 'THE RECURSION STACK');
  for (var f = 0; f < MERGE_DEPTH; f++) {
    var ap2 = K.clamp01((p - 0.3 - f * 0.03) / 0.2);
    if (ap2 <= 0) continue;
    P.alpha(ap2);
    P.rect(430 + f * 22, 174, 20, 26, { fill: ACCDIM, stroke: ACC, radius: 3, sw: 1 });
    P.alpha(1);
  }
  P.text(430 + MERGE_DEPTH * 22 + 12, 187, '11 frames of constant size',
         { size: 11, color: DIM, base: 'middle' });

  /* the sum */
  card(430, 216, 414, 128, SURF2, BORDER, [5, 4]);
  P.text(446, 232, 'peak = buffer + stack', { size: 12, bold: true, color: INK });
  P.text(446, 256, '1,024 + 11', { size: 15, bold: true, color: WARN, mono: true });
  P.text(446, 282, '= 1,035 cells, and n + log n is Θ(n)', { size: 12, color: INK });
  P.line(446, 296, 828, 296, { stroke: BORDER });
  P.text(446, 308, 'The buffer decides the answer, not the depth.', { size: 11.5, color: DIM });
  P.text(446, 328, 'Quoting Θ(log n) here has counted the stack and missed the buffer.',
         { size: 11.5, color: BAD });

  foot('The split is executed in the model and checked against ⌈log₂ n⌉ + 1 for n = 1 … 256.');
}

/* ---------- scene 6: quick sort ---------- */

function drawQuick(t) {
  hdr('Quick sort: the array is in place, the stack is not',
      'Sorted input, last-element pivot, n = 64: depth 64, comparisons 2,016 = 64·63/2');
  var p = K.sceneProgress(t);

  tag(56, 76, 'THE ARRAY IS NEVER COPIED');
  var cells = 16, cw = 30;
  for (var i = 0; i < cells; i++) {
    var x = 56 + i * cw;
    var isPivot = i === cells - 1;
    P.rect(x, 90, cw - 4, 34, {
      fill: isPivot ? WARNDIM : SURF2, stroke: isPivot ? WARN : BORDER, radius: 4, sw: 1.2
    });
    P.text(x + (cw - 4) / 2, 107, String(i + 1), { size: 12, color: INK, align: 'center', base: 'middle', mono: true });
  }
  P.text(56, 132, 'the last cell is the pivot, and on sorted input it is the largest key',
         { size: 9.5, color: FAINT });
  P.text(56, 148, 'Everything smaller goes left; the left part loses one key.',
         { size: 11.5, color: DIM });

  /* the stack column */
  tag(56, 164, 'THE STACK, ONE FRAME PER KEY REMOVED');
  var cols = 2, rows = 32, fw = 12, fh = 5;
  for (var f = 0; f < QS_WORST.peak; f++) {
    var ap = K.clamp01((p - 0.15 - f * 0.006) / 0.2);
    if (ap <= 0) continue;
    P.alpha(ap);
    var cx = 56 + (f % cols) * (rows * (fw + 2) + 20);
    var cy = 180 + Math.floor(f / cols) * (fh + 2);
    P.rect(cx + (f % cols === 0 ? 0 : 0) + Math.floor(f / cols) * 0, cy, fw, fh, { fill: WARN, stroke: WARN, radius: 1.5 });
    P.alpha(1);
  }
  P.text(56, 180 + rows * (fh + 2) + 12, '64 frames alive at the deepest point', { size: 11.5, bold: true, color: WARN });

  /* the two answers */
  card(560, 84, 290, 96, SURF, BORDER);
  P.text(576, 100, 'buffer', { size: 11.5, color: DIM });
  P.text(834, 100, 'Θ(1)', { size: 17, bold: true, color: VAL, align: 'right', mono: true });
  P.text(576, 126, 'the array is partitioned in place', { size: 10.5, color: FAINT });
  P.text(576, 148, 'so "in place" is true of the array', { size: 10.5, color: FAINT });

  card(560, 192, 290, 96, SURF, WARN);
  P.text(576, 208, 'stack, worst case', { size: 11.5, color: DIM });
  P.text(834, 208, 'Θ(n)', { size: 17, bold: true, color: WARN, align: 'right', mono: true });
  P.text(576, 234, '64 frames at n = 64', { size: 10.5, color: FAINT });
  P.text(576, 256, 'so "in place" is not Θ(1) space', { size: 10.5, color: FAINT });

  card(560, 300, 290, 76, SURF2, BORDER, [5, 4]);
  P.text(576, 316, 'median or random pivot', { size: 11.5, color: DIM });
  P.text(834, 316, 'Θ(log n)', { size: 15, bold: true, color: ACC, align: 'right', mono: true });
  P.text(576, 340, 'depth ' + QS_BALANCED.peak + ' at n = 64, which is ⌈log₂ 64⌉ + 1', { size: 10.5, color: FAINT });
  P.text(576, 358, 'the pivot decides the space as well', { size: 10.5, color: FAINT });

  foot('The partition is executed on a sorted array; depth and comparisons are recorded, not assumed.');
}

/* ---------- scene 7: three meanings of in place ---------- */

function drawInPlace(t) {
  hdr('Three meanings of "in place"',
      'A question turns on which one it uses, so name it before you answer');
  var p = K.sceneProgress(t);

  var cols = [
    { x: 44, title: 'STRICT', big: 'O(1) auxiliary', colour: VAL, bg: SURF,
      lines: ['insertion sort', 'selection sort', 'bubble sort', 'heapsort, iterative sift'],
      note: 'a constant number of cells, whatever n is' },
    { x: 332, title: 'LOOSE', big: 'O(log n) auxiliary', colour: INFO, bg: SURF,
      lines: ['quick sort (median pivot)', 'heapsort, recursive sift', 'merge sort on a list'],
      note: 'the input array is the only array; the stack is counted' },
    { x: 620, title: 'NOT IN PLACE', big: 'Θ(n) auxiliary', colour: WARN, bg: SURF,
      lines: ['merge sort on an array', 'counting sort (Θ(n + k))'],
      note: 'a second array proportional to the input' }
  ];

  for (var i = 0; i < cols.length; i++) {
    var ap = K.clamp01((p - i * 0.1) / 0.2);
    if (ap <= 0) continue;
    P.alpha(ap);
    var c = cols[i];
    card(c.x, 76, 248, 250, c.bg, c.colour);
    tag(c.x + 16, 96, c.title, c.colour);
    P.text(c.x + 16, 122, c.big, { size: 15, bold: true, color: INK, mono: true });
    for (var j = 0; j < c.lines.length; j++) {
      P.circle(c.x + 22, 152 + j * 24, 3, { fill: c.colour });
      P.text(c.x + 34, 147 + j * 24, c.lines[j], { size: 11.5, color: INK });
    }
    P.text(c.x + 16, 152 + c.lines.length * 24 + 12, c.note, { size: 10.5, color: DIM });
    P.alpha(1);
  }

  card(44, 340, 824, 82, SURF2, BORDER, [5, 4]);
  P.text(60, 356, 'The same algorithm can move between columns when the representation changes.',
         { size: 12, bold: true, color: INK });
  P.text(60, 378, 'Merge sort on an array needs n cells; on a linked list the links are rewired, so it needs only its stack.',
         { size: 11.5, color: DIM });
  P.text(60, 400, 'A question that does not say array or list has not fully specified the answer.',
         { size: 11.5, color: ACC });

  foot('Column membership is the standard implementation, not a claim that every variant behaves so.');
}

/* ---------- scene 8: graphs ---------- */

function drawGraphs(t) {
  hdr('BFS holds a frontier, DFS holds a path',
      'Nine vertices, eight edges: widest BFS layer 4, deepest DFS chain 6');
  var p = K.sceneProgress(t);

  /* edges first */
  var drawn = {};
  for (var u = 0; u < GRAPH.adj.length; u++) {
    for (var k = 0; k < GRAPH.adj[u].length; k++) {
      var v = GRAPH.adj[u][k];
      var key = Math.min(u, v) + '-' + Math.max(u, v);
      if (drawn[key]) continue;
      drawn[key] = true;
      P.line(GRAPH.pos[u][0], GRAPH.pos[u][1], GRAPH.pos[v][0], GRAPH.pos[v][1],
             { stroke: BORDER, sw: 1.6 });
    }
  }

  /* layer 1 of the BFS, coloured */
  var layer1 = BFS.layers[1] || [];
  for (var n = 0; n < GRAPH.V; n++) {
    var ap = K.clamp01((p - n * 0.03) / 0.2);
    if (ap <= 0) continue;
    P.alpha(ap);
    var inLayer1 = layer1.indexOf(n) >= 0;
    P.circle(GRAPH.pos[n][0], GRAPH.pos[n][1], 17, {
      fill: n === 0 ? ACCDIM : inLayer1 ? ACCDIM : SURF,
      stroke: n === 0 ? ACC : inLayer1 ? ACC : BORDER, sw: 1.6
    });
    P.text(GRAPH.pos[n][0], GRAPH.pos[n][1], String(n),
           { size: 12, bold: true, color: INK, align: 'center', base: 'middle', mono: true });
    P.alpha(1);
  }

  P.text(44, 108, 'the four neighbours of vertex 0 are one BFS layer', { size: 10.5, color: ACC });
  P.text(44, 424, 'DFS from vertex 0 follows 0 → 4 → 5 → 6 → 7 → 8: six frames.',
         { size: 11, color: DIM });

  /* the numbers */
  card(500, 76, 350, 84, SURF, BORDER);
  P.text(516, 92, 'BFS queue, widest layer', { size: 11.5, color: DIM });
  P.text(834, 92, '4', { size: 17, bold: true, color: ACC, align: 'right', mono: true });
  P.text(516, 118, 'never more than V, so Θ(V)', { size: 10.5, color: FAINT });
  P.text(516, 142, 'widths: ' + BFS.widths.join(', '), { size: 10.5, color: FAINT, mono: true });

  card(500, 176, 350, 84, SURF, WARN);
  P.text(516, 192, 'DFS stack, deepest chain', { size: 11.5, color: DIM });
  P.text(834, 192, '6', { size: 17, bold: true, color: WARN, align: 'right', mono: true });
  P.text(516, 218, 'never more than V, so Θ(V)', { size: 10.5, color: FAINT });
  P.text(516, 242, 'a chain graph would reach V', { size: 10.5, color: FAINT });

  /* storage */
  tag(500, 280, 'STORING THE GRAPH ITSELF');
  P.rect(500, 292, 240, 20, { fill: WARNDIM, stroke: WARN, radius: 4 });
  P.text(746, 302, 'V² = 81 cells', { size: 11.5, bold: true, color: WARN, base: 'middle', mono: true });
  P.rect(500, 320, 74, 20, { fill: ACCDIM, stroke: ACC, radius: 4 });
  P.text(582, 330, 'V + 2E = 25 slots', { size: 11.5, bold: true, color: ACC, base: 'middle', mono: true });
  P.text(500, 356, 'The matrix wins only when E is close to V².', { size: 11, color: DIM });
  P.text(500, 378, 'Space = representation + traversal + visited set.', { size: 11, bold: true, color: INK });

  foot('BFS widths and the DFS depth are computed by running both traversals on this graph.');
}

/* ---------- scene 9: the trade ---------- */

function drawTrade(t) {
  hdr('Space is a lever, not a given',
      'One computation, several algorithms, several space answers');
  var p = K.sceneProgress(t);

  var rows = [
    { label: 'Fibonacci', before: '2ⁿ calls', after: 'Θ(n) cells memoised, Θ(1) with two variables',
      bn: 1, an: 0.35 },
    { label: 'LCS, 1,000 × 1,000', before: '1,000,000 cells', after: '2,000 cells in two rolling rows',
      bn: 1, an: 0.12 },
    { label: 'Floyd–Warshall, V = 100', before: '10,000 cells', after: 'cannot be rolled: every entry is reread',
      bn: 0.62, an: 0.62 }
  ];

  for (var i = 0; i < rows.length; i++) {
    var ap = K.clamp01((p - i * 0.12) / 0.22);
    if (ap <= 0) continue;
    P.alpha(ap);
    var y = 84 + i * 104;
    card(44, y, 812, 88, SURF, BORDER);
    P.text(60, y + 18, rows[i].label, { size: 13, bold: true, color: INK });
    P.rect(60, y + 32, 320 * rows[i].bn, 16, { fill: WARNDIM, stroke: WARN, radius: 3 });
    P.text(60 + 320 * rows[i].bn + 10, y + 40, rows[i].before,
           { size: 11.5, bold: true, color: WARN, base: 'middle', mono: true });
    P.rect(60, y + 56, 320 * rows[i].an, 16, { fill: ACCDIM, stroke: ACC, radius: 3 });
    P.text(60 + 320 * rows[i].an + 10, y + 64, rows[i].after,
           { size: 11.5, bold: true, color: ACC, base: 'middle' });
    P.alpha(1);
  }

  card(44, 402, 812, 34, SURF2, BORDER, [5, 4]);
  P.text(60, 419, 'Memoisation buys time with cells. Rolling a table buys cells with reconstruction work. Neither is free.',
         { size: 11.5, color: INK });

  foot('Cell counts are computed from the dimensions; the bars compare magnitudes, not orders.');
}

/* ---------- scene 10: procedure ---------- */

function drawProcedure(t) {
  hdr('The routine, and the four traps',
      'Three steps produce an answer; four slips produce the wrong option');
  var p = K.sceneProgress(t);

  var steps = [
    { n: '1', t: 'Fix the model', d: 'one cell = one word;\none frame = a constant' },
    { n: '2', t: 'Add what is live at the peak', d: 'buffers + frontier or path\n+ stack depth × frame' },
    { n: '3', t: 'Separate input from auxiliary', d: 'add the input only if the\nquestion says total space' }
  ];

  for (var i = 0; i < steps.length; i++) {
    var ap = K.clamp01((p - i * 0.1) / 0.2);
    if (ap <= 0) continue;
    P.alpha(ap);
    var x = 44 + i * 274;
    card(x, 76, 256, 128, SURF, ACC);
    P.circle(x + 30, 100, 13, { fill: ACCDIM, stroke: ACC, sw: 1.4 });
    P.text(x + 30, 100, steps[i].n, { size: 12, bold: true, color: ACC, align: 'center', base: 'middle', mono: true });
    P.text(x + 52, 94, steps[i].t, { size: 12, bold: true, color: INK });
    var lines = steps[i].d.split('\n');
    for (var j = 0; j < lines.length; j++) {
      P.text(x + 16, 128 + j * 20, lines[j], { size: 11, color: DIM });
    }
    P.alpha(1);
  }

  tag(44, 228, 'THE FOUR TRAPS');
  var traps = [
    ['calls counted over time', 'gives 2ⁿ where n was wanted'],
    ['tree size for tree height', 'same error, larger number'],
    ['"in place" read as Θ(1)', 'hides quick sort\u2019s Θ(n) stack'],
    ['total space for auxiliary', 'turns a sharp comparison into Θ(n) = Θ(n)']
  ];
  for (var k = 0; k < traps.length; k++) {
    var ap2 = K.clamp01((p - 0.35 - k * 0.07) / 0.2);
    if (ap2 <= 0) continue;
    P.alpha(ap2);
    var y = 246 + k * 34;
    P.rect(44, y, 812, 28, { fill: INVALIDDIM, stroke: BAD, radius: 5, sw: 0.9 });
    P.text(58, y + 14, 'trap ' + (k + 1), { size: 10, bold: true, color: BAD, base: 'middle' });
    P.text(120, y + 14, traps[k][0], { size: 11.5, bold: true, color: INK, base: 'middle' });
    P.text(430, y + 14, traps[k][1], { size: 11, color: DIM, base: 'middle' });
    P.alpha(1);
  }

  card(44, 392, 812, 44, SURF2, BORDER, [5, 4]);
  P.text(60, 406, 'A fifth slip is arithmetic: forgetting the +1 in ⌈log₂ n⌉ + 1, which turns 11 into 10 for 1,024 keys.',
         { size: 11.5, color: INK });
  P.text(60, 424, 'State the model, name the peak, then simplify — the same three steps every time.',
         { size: 11, color: FAINT });

  foot('This routine is the one used by every worked example on the Examples tab.');
}

/* ---------- dispatch ---------- */

var DRAW = {
  peak: drawPeak,
  whatcounts: drawWhatCounts,
  frames: drawFrames,
  shape: drawShape,
  divide: drawDivide,
  quick: drawQuick,
  inplace: drawInPlace,
  graphs: drawGraphs,
  trade: drawTrade,
  procedure: drawProcedure
};

function sceneIdAt(t) {
  var sc = K.state.scenes;
  for (var i = sc.length - 1; i >= 0; i--) if (t >= sc[i].start - 1e-6) return sc[i].id;
  return sc.length ? sc[0].id : 'peak';
}

function drawFrame(P0) {
  P = P0;
  P.clear();
  P.rect(0, 0, W, H, { fill: SURF });
  var id = sceneIdAt(K.state.elapsed);
  var fn = DRAW[id] || drawPeak;
  try { fn(K.state.elapsed); } catch (e) { console.error('scene ' + id, e); }
}

/* ======================================================================
   LAYER 4 — BOOT
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
  var ok = false;

  if (window.p5) {
    try {
      new window.p5(function (sk) {
        sk.setup = function () {
          sk.createCanvas(W, H);
          sk.noLoop();
          P = PR.makePainterP5(sk, W, H);
          drawFrame(P);
          ok = true;
        };
        sk.draw = function () { /* frames are driven by the timeline */ };
      });
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
      if (holder) holder.appendChild(cv);
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
  fooRun: fooRun, fooPeakFormula: fooPeakFormula, fooCallsFormula: fooCallsFormula,
  FOO: FOO, FOO_N: FOO_N,
  fibRun: fibRun, fibCallsFormula: fibCallsFormula, FIBRUN: FIBRUN, FIB_N: FIB_N,
  FIB_N30_CALLS: FIB_N30_CALLS, FIB_RATIO_30: FIB_RATIO_30,
  mergeDepth: mergeDepth, mergeDepthFormula: mergeDepthFormula,
  MERGE_N: MERGE_N, MERGE_DEPTH: MERGE_DEPTH, MERGE_PEAK: MERGE_PEAK,
  quickRun: quickRun, QS_N: QS_N, QS_WORST: QS_WORST, QS_BALANCED: QS_BALANCED,
  BFS: BFS, DFS_PEAK: DFS_PEAK, GRAPH_E: GRAPH_E,
  GRAPH_MATRIX: GRAPH_MATRIX, GRAPH_LIST: GRAPH_LIST,
  SORTS: SORTS, DP: DP, LCS_SAVING: LCS_SAVING, FIB_TREE: FIB_TREE
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
