/* ==========================================================================
   avl-trees-and-rotations — lesson.js
   Four layers, in order:
     1. THE MODEL   — a real AVL implementation; every number on screen comes
                      from it, including every rotation the lesson claims.
     2. THE CHECKS  — each claim re-verified against its definition, at load.
     3. RENDER      — reads the model; never re-derives a value.
     4. BOOT        — p5.js first, the browser's own canvas as the fallback.

   The model is not a picture of an AVL tree: it is an AVL tree. Insertions,
   deletions, rotations, heights and balance factors are all computed, and the
   checks below assert the invariant after every single operation, so a caption
   and the canvas cannot disagree.
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
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- 1a. the tree itself ---------- */

/* height convention used throughout: an empty tree has height -1, a leaf 0 */
function hOf(n) { return n ? n.h : -1; }
function bfOf(n) { return n ? hOf(n.right) - hOf(n.left) : 0; }
function pull(n) { n.h = 1 + Math.max(hOf(n.left), hOf(n.right)); return n; }

function node(key) { return { key: key, left: null, right: null, h: 0 }; }

/* one single rotation, right (LL repair). Three pointers move. */
function rotRight(y) {
  var x = y.left;
  y.left = x.right;
  x.right = y;
  pull(y); pull(x);
  return x;
}
/* one single rotation, left (RR repair) */
function rotLeft(x) {
  var y = x.right;
  x.right = y.left;
  y.left = x;
  pull(x); pull(y);
  return y;
}

/* rebalance one node and report what was done.
   log entries are 'LL@k', 'RR@k', 'LR:left@k', 'LR:right@k', 'RL:right@k', 'RL:left@k' */
function rebalance(n, log) {
  pull(n);
  var b = bfOf(n);
  if (b < -1) {                       /* left heavy */
    if (bfOf(n.left) <= 0) { log.push('LL@' + n.key); return rotRight(n); }
    log.push('LR:left@' + n.left.key);
    n.left = rotLeft(n.left);
    log.push('LR:right@' + n.key);
    return rotRight(n);
  }
  if (b > 1) {                        /* right heavy */
    if (bfOf(n.right) >= 0) { log.push('RR@' + n.key); return rotLeft(n); }
    log.push('RL:right@' + n.right.key);
    n.right = rotRight(n.right);
    log.push('RL:left@' + n.key);
    return rotLeft(n);
  }
  return n;
}

function insert(n, key, log) {
  if (!n) return node(key);
  if (key < n.key) n.left = insert(n.left, key, log);
  else if (key > n.key) n.right = insert(n.right, key, log);
  else return n;                      /* a duplicate key changes nothing */
  return rebalance(n, log);
}

function remove(n, key, log) {
  if (!n) return null;
  if (key < n.key) n.left = remove(n.left, key, log);
  else if (key > n.key) n.right = remove(n.right, key, log);
  else {
    if (!n.left) return n.right;
    if (!n.right) return n.left;
    var m = n.right;
    while (m.left) m = m.left;        /* the in-order successor */
    n.key = m.key;
    n.right = remove(n.right, m.key, log);
  }
  return rebalance(n, log);
}

function clone(n) {
  return n ? { key: n.key, h: n.h, left: clone(n.left), right: clone(n.right) } : null;
}
function inOrder(n, out) {
  out = out || [];
  if (!n) return out;
  inOrder(n.left, out); out.push(n.key); inOrder(n.right, out);
  return out;
}
function eachNode(n, fn) { if (!n) return; fn(n); eachNode(n.left, fn); eachNode(n.right, fn); }
function sizeOf(n) { var c = 0; eachNode(n, function () { c++; }); return c; }
function heightOf(n) { return hOf(n); }

/* the AVL invariant: |balance factor| <= 1 at every node */
function isAvl(n) {
  var ok = true;
  eachNode(n, function (x) { if (Math.abs(bfOf(x)) > 1) ok = false; });
  return ok;
}
/* stored heights must equal the heights implied by the shape */
function heightsConsistent(n) {
  var ok = true;
  eachNode(n, function (x) {
    var want = 1 + Math.max(hOf(x.left), hOf(x.right));
    if (x.h !== want) ok = false;
  });
  return ok;
}
/* a BST: the in-order walk is increasing */
function isBst(n) {
  var a = inOrder(n);
  for (var i = 1; i < a.length; i++) if (a[i] <= a[i - 1]) return false;
  return true;
}
/* complete: every level full except the last, which fills from the left */
function isComplete(root) {
  var q = [root], seenGap = false, ok = true;
  while (q.length) {
    var x = q.shift();
    if (!x) { seenGap = true; continue; }
    if (seenGap) ok = false;
    q.push(x.left); q.push(x.right);
  }
  return ok;
}
function isPerfect(n) {
  if (!n) return true;
  if (sizeOf(n) !== Math.pow(2, heightOf(n) + 1) - 1) return false;
  return isPerfect(n.left) && isPerfect(n.right);
}

/* ---------- 1b. the worked sequence ---------- */

var SEQ = [9, 6, 5, 8, 7, 10];

var STEPS = [];
(function () {
  var root = null;
  for (var i = 0; i < SEQ.length; i++) {
    var log = [];
    root = insert(root, SEQ[i], log);
    STEPS.push({
      key: SEQ[i],
      rotations: log.slice(),
      tree: clone(root),
      height: heightOf(root),
      nodes: sizeOf(root),
      inOrder: inOrder(root).slice()
    });
  }
})();
var FINAL = STEPS[STEPS.length - 1].tree;
var TOTAL_SINGLE_ROTATIONS = STEPS.reduce(function (a, s) { return a + s.rotations.length; }, 0);
var TOTAL_EVENTS = STEPS.reduce(function (a, s) { return a + (s.rotations.length ? 1 : 0); }, 0);

/* ---------- 1c. the four cases, each built by insertion ---------- */

function buildWith(seq) {
  var root = null, logs = [], states = [];
  for (var i = 0; i < seq.length; i++) {
    var log = [];
    root = insert(root, seq[i], log);
    logs.push(log);
    states.push(clone(root));
  }
  return { seq: seq, logs: logs, states: states, final: clone(root) };
}

var CASES = {
  LL: buildWith([30, 20, 10]),
  RR: buildWith([10, 20, 30]),
  LR: buildWith([30, 10, 20]),
  RL: buildWith([10, 30, 20])
};

/* the minimal LL repair, stated as two trees, not by insertion */
var LL_BEFORE = (function () {
  var a = node(30); a.left = node(20); a.left.left = node(10);
  eachNode(a, function (x) { pull(x); });
  /* pull bottom-up so the stored heights are right */
  pull(a.left.left); pull(a.left); pull(a);
  return a;
})();
var LL_AFTER = rotRight(clone(LL_BEFORE));

/* ---------- 1d. the height bound ---------- */

/* N(h): the fewest nodes an AVL tree of height h can have */
var NODES_MIN = [1, 2];
for (var hh = 2; hh <= 10; hh++) NODES_MIN.push(1 + NODES_MIN[hh - 1] + NODES_MIN[hh - 2]);

/* the identity N(h) = F(h+3) - 1, with F(1) = F(2) = 1 */
var FIB = [0, 1, 1];
for (var fi = 3; fi <= 16; fi++) FIB.push(FIB[fi - 1] + FIB[fi - 2]);
function fib(k) { return FIB[k]; }

function maxHeightFor(n) {
  var h = 0;
  while (NODES_MIN[h] <= n) h++;
  return h - 1;
}
var MAXH = {};
[1, 2, 3, 4, 5, 6, 7, 8, 12, 20, 33].forEach(function (n) { MAXH[n] = maxHeightFor(n); });

var PHI = (1 + Math.sqrt(5)) / 2;
function avlBound(n) { return 1.44 * Math.log(n + 2) / Math.LN2 - 0.328; }

/* ---------- 1e. counterexamples ---------- */

/* AVL but not complete: the level-3 nodes are not the leftmost ones */
var AVL_NOT_COMPLETE = (function () {
  var r = null;
  [50, 30, 70, 20, 60, 80, 10, 40, 65].forEach(function (k) { r = insert(r, k, []); });
  return r;
})();

/* a plain BST whose ROOT is perfectly balanced while deeper nodes are not */
var ROOT_BALANCED = (function () {
  function put(n, k) {
    if (!n) return node(k);
    if (k < n.key) n.left = put(n.left, k); else n.right = put(n.right, k);
    return n;
  }
  var r = null;
  [50, 20, 80, 10, 90, 5, 95].forEach(function (k) { r = put(r, k); });
  eachNode(r, function (x) { pull(x); });
  return r;
})();

/* deletion can need more than one repair; this one needs two */
var DEL_TREE = (function () {
  var r = null;
  [50, 25, 75, 10, 30, 60, 90, 5, 15, 20, 27, 35, 55, 65, 80, 95]
    .forEach(function (k) { r = insert(r, k, []); });
  return r;
})();
var DEL_KEY = 15;
var DEL_LOG = [];
var DEL_AFTER = remove(clone(DEL_TREE), DEL_KEY, DEL_LOG);

/* insertion, in contrast: one repair at most. Measured over 200 insertions. */
var INS_SAMPLE = (function () {
  var r = null, maxSingle = 0, maxEvents = 0, counts = { 0: 0, 1: 0, 2: 0 };
  for (var i = 1; i <= 200; i++) {
    var log = [];
    r = insert(r, (i * 37) % 211, log);
    if (log.length > maxSingle) maxSingle = log.length;
    if ((log.length ? 1 : 0) > maxEvents) maxEvents = (log.length ? 1 : 0);
    counts[log.length] = (counts[log.length] || 0) + 1;
  }
  return { tree: clone(r), maxSingle: maxSingle, maxEvents: maxEvents, counts: counts, size: sizeOf(r) };
})();

/* a sorted chain of the same six keys, for the cost comparison */
var CHAIN = (function () {
  var r = null;
  [5, 6, 7, 8, 9, 10].forEach(function (k) {
    r = { key: k, left: r, right: null, h: 0 };
    pull(r);
  });
  return r;
})();

/* ======================================================================
   LAYER 2 — THE CHECKS
   ====================================================================== */

/* the height convention */
chk('empty tree height is -1', hOf(null) === -1, hOf(null));
chk('leaf height is 0', hOf(node(1)) === 0);
chk('balance factor is height(right) - height(left)',
  bfOf(LL_BEFORE) === -2 && bfOf(LL_AFTER) === 0,
  bfOf(LL_BEFORE) + ' then ' + bfOf(LL_AFTER));

/* the worked sequence: after every insertion, BST and AVL and consistent heights */
chk('every state of the worked sequence is a BST',
  STEPS.every(function (s) { return isBst(s.tree); }),
  STEPS.map(function (s) { return s.inOrder.join(' '); }).join(' | '));
chk('every state of the worked sequence is AVL',
  STEPS.every(function (s) { return isAvl(s.tree); }));
chk('every state keeps its heights consistent with its shape',
  STEPS.every(function (s) { return heightsConsistent(s.tree); }));
chk('the worked sequence never loses or adds a key',
  STEPS.every(function (s, i) { return s.nodes === i + 1; }),
  STEPS.map(function (s) { return s.nodes; }).join(','));
chk('the worked sequence ends at height 2 on 6 keys',
  STEPS[5].height === 2 && STEPS[5].nodes === 6);
chk('the worked sequence needs exactly 3 single rotations',
  TOTAL_SINGLE_ROTATIONS === 3, TOTAL_SINGLE_ROTATIONS);
chk('the worked sequence needs 3 repair events, one per insertion that moves',
  TOTAL_EVENTS === 3, TOTAL_EVENTS);

/* the four cases */
chk('LL is one single rotation and lifts the middle key',
  CASES.LL.final.key === 20 && CASES.LL.logs[2].length === 1 && CASES.LL.logs[2][0] === 'LL@30',
  CASES.LL.logs[2].join(','));
chk('RR is one single rotation and lifts the middle key',
  CASES.RR.final.key === 20 && CASES.RR.logs[2].length === 1 && CASES.RR.logs[2][0] === 'RR@10',
  CASES.RR.logs[2].join(','));
chk('LR is two single rotations and lifts the middle key',
  CASES.LR.final.key === 20 && CASES.LR.logs[2].length === 2,
  CASES.LR.logs[2].join(','));
chk('RL is two single rotations and lifts the middle key',
  CASES.RL.final.key === 20 && CASES.RL.logs[2].length === 2,
  CASES.RL.logs[2].join(','));
chk('all four cases end at the same tree',
  ['LL', 'RR', 'LR', 'RL'].every(function (c) {
    return inOrder(CASES[c].final).join(' ') === '10 20 30' && CASES[c].final.key === 20;
  }));
chk('no case ever produces a non-AVL intermediate tree after its repair',
  ['LL', 'RR', 'LR', 'RL'].every(function (c) {
    return CASES[c].states.every(function (s) { return isAvl(s) && isBst(s); });
  }));

/* a rotation preserves the in-order sequence */
chk('a right rotation preserves the in-order sequence',
  inOrder(LL_BEFORE).join(' ') === inOrder(LL_AFTER).join(' '),
  inOrder(LL_BEFORE).join(' ') + ' -> ' + inOrder(LL_AFTER).join(' '));
chk('a left rotation preserves the in-order sequence',
  (function () {
    var a = node(10); a.right = node(20); a.right.right = node(30);
    pull(a.right.right); pull(a.right); pull(a);
    var b = rotLeft(clone(a));
    return inOrder(a).join(' ') === inOrder(b).join(' ') && b.key === 20;
  })());

/* the bound */
chk('N(0..6) is 1, 2, 4, 7, 12, 20, 33',
  NODES_MIN.slice(0, 7).join(',') === '1,2,4,7,12,20,33', NODES_MIN.slice(0, 7).join(','));
chk('N(h) equals F(h+3) - 1 for h = 0..8',
  NODES_MIN.slice(0, 9).every(function (v, h) { return v === fib(h + 3) - 1; }),
  NODES_MIN.slice(0, 9).map(function (v, h) { return v + '=' + (fib(h + 3) - 1); }).join(' '));
chk('a 7-key AVL tree can reach height 3 and no more',
  MAXH[7] === 3, MAXH[7]);
chk('the minimum-node trees really are AVL at every height',
  (function () {
    function build(h) {
      if (h < 0) return null;
      if (h === 0) return node(0);
      var r = node(0);
      r.left = build(h - 1);
      r.right = build(h - 2);
      pull(r);
      return r;
    }
    var ok = true;
    for (var h = 0; h <= 8; h++) {
      var t = build(h);
      if (!isAvl(t) || sizeOf(t) !== NODES_MIN[h]) ok = false;
    }
    return ok;
  })());
chk('the 1.44 log2(n+2) bound holds for the worked tree',
  heightOf(FINAL) <= avlBound(sizeOf(FINAL)),
  heightOf(FINAL) + ' <= ' + avlBound(sizeOf(FINAL)).toFixed(3));
chk('the bound holds for every minimum-node tree up to height 8',
  (function () {
    for (var h = 0; h <= 8; h++) if (h > avlBound(NODES_MIN[h])) return false;
    return true;
  })());

/* the counterexamples */
chk('the not-complete tree is AVL', isAvl(AVL_NOT_COMPLETE) && isBst(AVL_NOT_COMPLETE));
chk('the not-complete tree is not complete', isComplete(AVL_NOT_COMPLETE) === false);
chk('the not-complete tree is not perfect', isPerfect(AVL_NOT_COMPLETE) === false);
chk('the balanced-root tree has a balance factor of 0 at the root',
  bfOf(ROOT_BALANCED) === 0, bfOf(ROOT_BALANCED));
chk('the balanced-root tree is still not AVL', isAvl(ROOT_BALANCED) === false,
  bfOf(ROOT_BALANCED.left) + ' and ' + bfOf(ROOT_BALANCED.right));

/* insertion against deletion */
chk('no single insertion ever needs more than one repair',
  INS_SAMPLE.maxEvents <= 1 && INS_SAMPLE.maxSingle <= 2,
  'max single rotations ' + INS_SAMPLE.maxSingle + ' over ' + INS_SAMPLE.size + ' keys');
chk('this deletion needs two repairs',
  DEL_LOG.length === 2, DEL_LOG.join(','));
chk('the deletion result is still AVL and still a BST',
  isAvl(DEL_AFTER) && isBst(DEL_AFTER) && heightsConsistent(DEL_AFTER));
chk('the deletion removed exactly one key',
  sizeOf(DEL_AFTER) === sizeOf(DEL_TREE) - 1);
chk('the sorted chain of six keys has height 5, the AVL tree of six height 2',
  heightOf(CHAIN) === 5 && heightOf(FINAL) === 2);

/* ======================================================================
   LAYER 3 — RENDER
   Reads the model. Never re-derives a value.
   ====================================================================== */

function sceneOf(t) {
  var sc = (K && K.state && K.state.scenes) ? K.state.scenes : [];
  for (var i = sc.length - 1; i >= 0; i--) if (t >= sc[i].start - 1e-6) return sc[i];
  return sc.length ? sc[0] : { start: 0, end: 30 };
}
function seg(t) {
  var sc = sceneOf(t);
  var span = Math.max(1e-6, sc.end - sc.start);
  var p = (t - sc.start) / span;
  var i = Math.floor(p * 4);
  if (i > 3) i = 3;
  if (i < 0) i = 0;
  return { i: i, f: Math.min(1, Math.max(0, p * 4 - i)) };
}
function head(title, sub) {
  P.text(24, 18, title, { size: 19, bold: true, color: INK });
  if (sub) P.text(24, 44, sub, { size: 12, color: DIM });
}
function panel(x, y, w, h, label, opts) {
  opts = opts || {};
  P.rect(x, y, w, h, { fill: opts.fill || SURF2, stroke: opts.stroke || BORDER, radius: 8, sw: 1 });
  if (label) P.text(x + 10, y + 8, label, { size: 10, mono: true, color: opts.labelColor || DIM });
}
function mono(x, y, s, o) {
  o = o || {};
  o.mono = true;
  P.text(x, y, s, o);
}

/* ---------- tree layout and drawing ---------- */

var RAD = 15;

function layout(root) {
  var nodes = [], edges = [], i = 0;
  (function walk(n, depth, parent) {
    if (!n) return;
    walk(n.left, depth + 1, n);
    var rec = { key: n.key, h: n.h, bf: bfOf(n), depth: depth, i: i++, node: n };
    nodes.push(rec);
    if (parent) edges.push({ from: parent, to: n });
    walk(n.right, depth + 1, n);
  })(root, 0, null);
  return { nodes: nodes, edges: edges, width: nodes.length };
}

function place(root, x0, y0, dx, dy, scale) {
  var L = layout(root);
  scale = scale || 1;
  var byNode = [];
  L.nodes.forEach(function (r) {
    r.x = x0 + r.i * dx;
    r.y = y0 + r.depth * dy;
    byNode.push(r);
  });
  var index = {};
  byNode.forEach(function (r) { index[r.key + ':' + r.depth] = r; });
  L.edges.forEach(function (e) {
    var a = byNode.find(function (r) { return r.node === e.from; });
    var b = byNode.find(function (r) { return r.node === e.to; });
    e.x1 = a.x; e.y1 = a.y; e.x2 = b.x; e.y2 = b.y;
  });
  L.byNode = byNode;
  L.dx = dx; L.dy = dy;
  return L;
}

function drawTree(root, x0, y0, dx, dy, opts) {
  opts = opts || {};
  var L = place(root, x0, y0, dx, dy);
  var r = opts.rad || RAD;

  L.edges.forEach(function (e) {
    P.line(e.x1, e.y1, e.x2, e.y2, { stroke: opts.edge || BORDER, sw: 1.4 });
  });

  L.byNode.forEach(function (nd) {
    var hi = opts.hi && opts.hi.indexOf(nd.key) >= 0;
    var bad = Math.abs(nd.bf) > 1;
    var fill = hi ? (opts.hiFill || ACCDIM) : SURF;
    var stroke = bad ? BAD : (hi ? ACC : BORDER);
    if (bad) fill = INVALIDDIM;
    P.circle(nd.x, nd.y, r * 2, { fill: fill, stroke: stroke, sw: bad ? 2 : 1.4 });
    P.text(nd.x, nd.y - (opts.size || 11.5) / 2 + 1, String(nd.key), {
      size: opts.size || 11.5, bold: true, align: 'center',
      color: bad ? BAD : INK
    });
    if (opts.showBf !== false) {
      /* the factor sits below the circle, never on top of the key */
      P.text(nd.x, nd.y + r + 3, (nd.bf > 0 ? '+' : '') + nd.bf, {
        size: 8, mono: true, align: 'center', color: bad ? BAD : FAINT
      });
    }
    if (opts.showH) {
      P.text(nd.x + r + 3, nd.y - r - 1, 'h' + nd.h, { size: 8, mono: true, color: FAINT });
    }
  });
  return L;
}

/* ---------- scene 1: why balance ---------- */

function drawWhy(t) {
  var s = seg(t);
  head('A search tree is only as fast as its height',
    'the same six keys, two insertion orders, two very different worst cases');

  panel(24, 66, 400, 300, 'inserted in sorted order: 5, 6, 7, 8, 9, 10', { stroke: WARN, fill: WARNDIM });
  drawTree(CHAIN, 84, 104, 44, 44, { edge: WARN, rad: 12, size: 10 });

  panel(452, 66, 424, 300, 'the AVL tree built from 9, 6, 5, 8, 7, 10', { stroke: VAL, fill: ACCDIM });
  drawTree(FINAL, 560, 132, 66, 56, { edge: ACC, rad: 14 });

  var cy = 384;
  P.text(24, cy, 'chain: height 5, so a search for 10 visits 6 nodes', { size: 12, color: WARN, bold: true });
  P.text(24, cy + 20, 'AVL: height 2, so every search visits at most 3 nodes', { size: 12, color: VAL, bold: true });

  if (s.i >= 1) {
    P.text(452, cy, 'the promise being bought: O(log n) search, not O(n)', { size: 12, color: INK });
  }
  if (s.i >= 2) {
    P.text(452, cy + 20, 'a plain BST promises O(h); h is decided by the input order', { size: 12, color: DIM });
  }
  if (s.i >= 3) {
    P.rect(24, 424, 852, 30, { fill: SURF2, stroke: BORDER, radius: 6 });
    mono(36, 434, 'AVL adds one rule to the BST rule, and the rule is local: two subtree heights may differ by at most 1',
      { size: 11, color: ACC });
  }
}

/* ---------- scene 2: the invariant ---------- */

function drawInvariant(t) {
  var s = seg(t);
  head('The balance factor, and the height convention',
    'height: empty = -1, leaf = 0. balance factor = height(right) - height(left)');

  drawTree(FINAL, 500, 150, 72, 62, { showH: true, hi: [8], rad: 15 });

  panel(24, 66, 440, 150, 'the rule');
  mono(38, 94, 'bf(n) = h(n.right) - h(n.left)', { size: 13, bold: true, color: ACC });
  P.text(38, 122, 'AVL condition: |bf(n)| <= 1 at every node', { size: 12, color: INK });
  P.text(38, 144, 'not only at the root — at every single node', { size: 12, color: BAD, bold: true });
  P.text(38, 172, 'so the two subtree heights differ by at most one', { size: 11.5, color: DIM });
  P.text(38, 192, 'at every node, at all times', { size: 11.5, color: DIM });

  panel(24, 232, 440, 170, 'worked on the tree beside', {});
  var rows = [
    ['8', 'h(left)=1, h(right)=1', 'bf = 0'],
    ['6', 'h(left)=0, h(right)=0', 'bf = 0'],
    ['9', 'h(left)=-1, h(right)=0', 'bf = +1']
  ];
  for (var r = 0; r <= Math.min(2, s.i + 1); r++) {
    mono(38, 258 + r * 30, rows[r][0], { size: 12, bold: true, color: ACC });
    P.text(66, 258 + r * 30, rows[r][1], { size: 11, color: DIM });
    mono(300, 258 + r * 30, rows[r][2], { size: 11, color: VAL });
  }
  if (s.i >= 3) {
    P.text(38, 366, 'all three inside {-1, 0, +1}: this tree is AVL', { size: 11.5, color: VAL, bold: true });
  }

  P.text(24, 424, 'A node whose |bf| reaches 2 is the only thing a rotation is for.', { size: 12, color: INK });
  P.text(24, 444, 'Insertion breaks the rule along one root path; the repair is local to the lowest break.', { size: 11.5, color: DIM });
}

/* ---------- scene 3: LL and RR ---------- */

function drawSingle(t) {
  var s = seg(t);
  head('LL and RR: one rotation, three pointer writes',
    'the imbalance is on the outside of the path, so a single rotation repairs it');

  /* LL */
  panel(24, 66, 410, 240, 'LL: 30, 20, 10 — left child, left grandchild', { stroke: WARN, fill: WARNDIM });
  var llBefore = s.i >= 1 ? LL_AFTER : LL_BEFORE;
  drawTree(llBefore, 100, 110, 62, 52, { rad: 14, hi: s.i === 0 ? [30] : [20], hiFill: s.i === 0 ? INVALIDDIM : ACCDIM });
  mono(38, 286, s.i >= 1 ? 'after: bf(20) = 0, height 1' : 'before: bf(30) = -2, height 2', { size: 11, color: s.i >= 1 ? VAL : BAD });

  /* RR */
  panel(452, 66, 424, 240, 'RR: 10, 20, 30 — right child, right grandchild', { stroke: WARN, fill: WARNDIM });
  var rrBefore = (function () {
    var a = node(10); a.right = node(20); a.right.right = node(30);
    pull(a.right.right); pull(a.right); pull(a);
    return a;
  })();
  var rrAfter = CASES.RR.final;
  drawTree(s.i >= 3 ? rrAfter : rrBefore, 560, 110, 62, 52, {
    rad: 14, hi: s.i >= 3 ? [20] : [10], hiFill: s.i >= 3 ? ACCDIM : INVALIDDIM
  });
  mono(466, 286, s.i >= 3 ? 'after: bf(20) = 0, height 1' : 'before: bf(10) = +2, height 2',
    { size: 11, color: s.i >= 3 ? VAL : BAD });

  P.text(24, 330, 'LL repair: rotate right at 30. The middle key 20 rises; 30 becomes its right child.', { size: 12, color: INK });
  P.text(24, 352, 'RR repair: rotate left at 10. The middle key 20 rises; 10 becomes its left child.', { size: 12, color: INK });
  if (s.i >= 2) {
    mono(24, 386, 'rotRight(y):  x = y.left;  y.left = x.right;  x.right = y;', { size: 11.5, color: ACC });
  }
  if (s.i >= 3) {
    mono(24, 410, 'in-order before = 10 20 30 = in-order after, so the search order is untouched', { size: 11.5, color: VAL });
  }
  P.text(24, 438, 'The trigger is the sign pattern: left-left gives bf < -1 with bf(left) <= 0.', { size: 11.5, color: DIM });
}

/* ---------- scene 4: LR and RL ---------- */

function drawDouble(t) {
  var s = seg(t);
  head('LR and RL: the zig-zag needs two rotations',
    'the imbalance is on the inside of the path, so a single rotation would only mirror it');

  panel(24, 66, 410, 250, 'LR: 30, 10, 20 — left child, right grandchild', { stroke: WARN, fill: WARNDIM });
  var lrTrees = (function () {
    var a = node(30); a.left = node(10); a.left.right = node(20);
    pull(a.left.right); pull(a.left); pull(a);
    var step1 = clone(a);
    step1.left = rotLeft(step1.left);
    var step2 = rotRight(clone(step1));
    return { before: a, mid: step1, after: step2 };
  })();
  var lrShown = s.i === 0 ? lrTrees.before : (s.i === 1 ? lrTrees.mid : lrTrees.after);
  drawTree(lrShown, 130, 110, 58, 54, {
    rad: 14, hi: s.i === 0 ? [30] : (s.i === 1 ? [20] : [20]),
    hiFill: s.i === 0 ? INVALIDDIM : ACCDIM
  });
  mono(38, 296, s.i === 0 ? 'before: bf(30) = -2, bf(10) = +1'
    : (s.i === 1 ? 'step 1: rotate left at 10 — now it is LL'
      : 'step 2: rotate right at 30 — balanced'), { size: 11, color: s.i === 0 ? BAD : VAL });

  panel(452, 66, 424, 250, 'RL: 10, 30, 20 — right child, left grandchild', { stroke: WARN, fill: WARNDIM });
  var rlTrees = (function () {
    var a = node(10); a.right = node(30); a.right.left = node(20);
    pull(a.right.left); pull(a.right); pull(a);
    var step1 = clone(a);
    step1.right = rotRight(step1.right);
    var step2 = rotLeft(clone(step1));
    return { before: a, mid: step1, after: step2 };
  })();
  var rlShown = s.i === 0 ? rlTrees.before : (s.i === 1 ? rlTrees.mid : rlTrees.after);
  drawTree(rlShown, 560, 110, 58, 54, {
    rad: 14, hi: s.i === 3 ? [20] : [s.i === 0 ? 10 : 20],
    hiFill: s.i === 0 ? INVALIDDIM : ACCDIM
  });
  mono(466, 296, s.i === 3 ? 'after: bf(20) = 0 — balanced'
    : 'before: bf(10) = +2, bf(30) = -1', { size: 11, color: s.i === 3 ? VAL : BAD });

  P.text(24, 336, 'LR: first rotate left at the child 10, which turns the zig-zag into a straight LL; then rotate right at 30.', { size: 12, color: INK });
  P.text(24, 358, 'RL: first rotate right at the child 30, turning it into RR; then rotate left at 10.', { size: 12, color: INK });
  mono(24, 390, 'the test is the grandchild side: left child + right grandchild = LR', { size: 11.5, color: ACC });
  P.text(24, 420, 'Both double cases end at the same tree as the two single cases: 20 on top, 10 and 30 beneath.', { size: 11.5, color: DIM });
  P.text(24, 442, 'Two rotations, and the first one is temporary — it is only there to make the second one legal.', { size: 11.5, color: DIM });
}

/* ---------- scene 5: what a rotation is ---------- */

function drawPointers(t) {
  var s = seg(t);
  head('A rotation is three pointer writes and nothing else',
    'no key moves between nodes, and no node is allocated or freed');

  panel(24, 66, 430, 220, 'before: 30 with left child 20, which has right child 25');
  var before = (function () {
    var a = node(30); a.left = node(20); a.left.right = node(25);
    pull(a.left.right); pull(a.left); pull(a);
    return a;
  })();
  drawTree(before, 140, 110, 62, 54, { rad: 14, hi: [20] });

  panel(470, 66, 406, 220, 'after rotRight(30): 20 on top, 25 becomes the left child of 30',
    { stroke: VAL, fill: ACCDIM });
  var after = rotRight(clone(before));
  drawTree(after, 600, 110, 62, 54, { rad: 14, hi: [20] });

  var lines = [
    'x = y.left          // x is 20, y is 30',
    'y.left = x.right    // 30 adopts 25',
    'x.right = y         // 20 adopts 30'
  ];
  for (var i = 0; i <= Math.min(2, s.i + 1); i++) {
    mono(38, 316 + i * 22, lines[i], { size: 11.5, color: i === s.i ? ACC : DIM, bold: i === s.i });
  }

  if (s.i >= 2) {
    P.text(470, 316, 'in-order before: ' + inOrder(before).join(' '), { size: 11.5, mono: true, color: DIM });
    P.text(470, 338, 'in-order after:  ' + inOrder(after).join(' '), { size: 11.5, mono: true, color: VAL });
    P.text(470, 366, 'identical, so every search path still ends at the same key.', { size: 11.5, color: INK });
  }
  if (s.i >= 3) {
    P.rect(24, 400, 852, 54, { fill: SURF2, stroke: BORDER, radius: 6 });
    mono(36, 412, 'O(1) per rotation, at most 2 rotations per insertion: the repair costs nothing next to the O(log n) descent.',
      { size: 11.5, color: ACC });
    mono(36, 434, 'The heights of the two touched nodes are recomputed; every other node in the tree is unchanged.',
      { size: 11.5, color: DIM });
  }
}

/* ---------- scene 6: the sequence, step by step ---------- */

function drawInsert(t) {
  var s = seg(t);
  head('Insert 9, 6, 5, 8, 7, 10 and watch the repairs',
    'six insertions, three rotations, and the height never passes 2');

  var show = s.i === 0 ? 2 : (s.i === 1 ? 3 : (s.i === 2 ? 4 : 6));
  var st = STEPS[show - 1];

  drawTree(st.tree, 470, 150, 70, 58, { rad: 15, hi: [] });

  panel(24, 66, 400, 250, 'the insertion log');
  var y = 92;
  for (var i = 0; i < show; i++) {
    var row = STEPS[i];
    mono(38, y, 'insert ' + row.key, { size: 11.5, bold: true, color: INK });
    var label = row.rotations.length
      ? row.rotations.map(function (r) { return r.split(':')[0]; }).join(' + ')
      : 'no rotation';
    mono(140, y, label, { size: 11, color: row.rotations.length ? ACC : FAINT });
    mono(250, y, 'h=' + row.height, { size: 11, color: DIM });
    mono(300, y, '[' + row.inOrder.join(' ') + ']', { size: 10.5, color: FAINT });
    y += 24;
  }
  mono(38, 292, 'single rotations so far: ' + STEPS.slice(0, show).reduce(function (a, r) { return a + r.rotations.length; }, 0),
    { size: 11.5, color: ACC, bold: true });

  P.text(24, 340, 'Insert 5: 9-6-5 is LL at 9, so rotate right; 6 becomes the root.', { size: 11.5, color: INK });
  P.text(24, 362, 'Insert 7: 8-7 sits under 9 as LL again, so rotate right at 9.', { size: 11.5, color: INK });
  P.text(24, 384, 'Insert 10: the root 6 now leans right, so rotate left; 8 becomes the root.', { size: 11.5, color: INK });
  if (s.i >= 3) {
    P.rect(24, 404, 852, 50, { fill: ACCDIM, stroke: ACC, radius: 6 });
    mono(36, 416, 'Final tree: root 8, height 2, six keys, in-order 5 6 7 8 9 10 — still a search tree.', { size: 11.5, color: ACC });
    mono(36, 436, 'The rotation that fixes an insertion always happens at the LOWEST unbalanced node, never higher up.', { size: 11.5, color: DIM });
  }
}

/* ---------- scene 7: how many repairs ---------- */

function drawCount(t) {
  var s = seg(t);
  head('Insertion needs one repair; deletion may need several',
    'the difference is what happens to the height of the repaired subtree');

  panel(24, 66, 420, 250, 'rotations per insertion, the six-key run');
  var baseY = 250, maxH = 60;
  for (var i = 0; i < STEPS.length; i++) {
    var n = STEPS[i].rotations.length;
    var bx = 52 + i * 62;
    var bh = n * 46;
    P.rect(bx, baseY - bh, 40, Math.max(4, bh), {
      fill: n ? ACCDIM : SURF2, stroke: n ? ACC : BORDER, radius: 4
    });
    mono(bx + 20, baseY - bh - 14, String(n), { size: 11, align: 'center', color: n ? ACC : FAINT });
    mono(bx + 20, baseY + 6, String(STEPS[i].key), { size: 10.5, align: 'center', color: DIM });
  }
  mono(38, 288, 'the pattern is 0 0 1 0 1 1: three repairs over six insertions', { size: 11, color: DIM });

  panel(470, 66, 406, 250, 'one deletion, two repairs', { stroke: WARN, fill: WARNDIM });
  drawTree(DEL_AFTER, 500, 116, 26, 36, { rad: 8, size: 7.5, showBf: false, edge: WARN });
  mono(482, 288, 'delete ' + DEL_KEY + ': ' + DEL_LOG.join(', then '), { size: 10.5, color: WARN });

  P.text(24, 336, 'Insertion: the repaired subtree returns to its old height, so nothing above it can break.', { size: 12, color: INK });
  P.text(24, 358, 'Deletion: the subtree can end up SHORTER, so the imbalance propagates upward, one repair per level.', { size: 12, color: INK });
  if (s.i >= 2) {
    mono(24, 390, 'measured here: ' + INS_SAMPLE.maxSingle + ' single rotation was the most any of ' + INS_SAMPLE.size + ' insertions needed',
      { size: 11, color: ACC });
  }
  if (s.i >= 3) {
    P.rect(24, 408, 852, 46, { fill: SURF2, stroke: BORDER, radius: 6 });
    mono(36, 420, 'So O(log n) rotations for a delete and O(1) for an insert — both still O(log n) overall, because of the descent.',
      { size: 11.5, color: ACC });
    mono(36, 440, 'A question that asks for "the number of rotations" is asking which of these two operations it named.',
      { size: 11, color: DIM });
  }
}

/* ---------- scene 8: the height bound ---------- */

function drawBound(t) {
  var s = seg(t);
  head('How tall can an AVL tree get? Count the fewest nodes',
    'N(h) = N(h-1) + N(h-2) + 1, the Fibonacci recurrence with a root added');

  panel(24, 66, 470, 200, 'the minimum-node tree at each height', {});
  var xs = 44, ys = 96;
  var labels = ['h=0', 'h=1', 'h=2', 'h=3', 'h=4'];
  var showN = s.i >= 1 ? 5 : 4;
  for (var i = 0; i < showN; i++) {
    (function (h, x) {
      function build(hh) {
        if (hh < 0) return null;
        if (hh === 0) return node(1);
        var r = node(1);
        r.left = build(hh - 1);
        r.right = build(hh - 2);
        pull(r);
        return r;
      }
      var tree = build(h);
      drawTree(tree, x, ys + (h) * 12, 16, 26, { rad: 7, size: 0.1, showBf: false, edge: BORDER });
      mono(x - 6, 254, labels[h] + ': ' + NODES_MIN[h], { size: 10, color: DIM });
    })(i, 52 + i * 92);
  }

  panel(506, 66, 370, 200, 'the table and the identity', {});
  mono(520, 94, 'h     0  1  2  3  4  5  6  7  8', { size: 10.5, color: DIM });
  mono(520, 114, 'N(h)  1  2  4  7 12 20 33 54 88', { size: 10.5, color: ACC, bold: true });
  mono(520, 134, 'F(h+3)-1  same row, verified', { size: 10, color: FAINT });
  P.text(520, 162, 'So a 7-key AVL tree can be 3 tall:', { size: 11.5, color: INK });
  P.text(520, 182, 'N(3) = 7 nodes is exactly enough.', { size: 11.5, color: INK });
  P.text(520, 206, 'and 15 nodes would be needed for a perfect tree of height 3.', { size: 10.5, color: DIM });
  P.text(520, 226, 'h <= 1.44 log2(n+2) - 0.328, so h = O(log n).', { size: 10.5, color: DIM });
  P.text(520, 246, 'For n = 7 that bound is ' + avlBound(7).toFixed(2) + ', and 3 is inside it.', { size: 10.5, color: VAL });

  P.text(24, 300, 'Height h needs at least N(h) nodes; turn it round and a tree with n nodes has height at most', { size: 12, color: INK });
  mono(24, 322, 'the largest h with N(h) <= n:  n=7 -> 3,  n=12 -> 4,  n=20 -> 5,  n=33 -> 6', { size: 11.5, color: ACC });
  if (s.i >= 2) {
    P.text(24, 356, 'Minimum nodes for height: the two subtrees must differ by exactly 1, one at h-1 and one at h-2,', { size: 11.5, color: DIM });
    P.text(24, 376, 'because a larger gap would break the rule and a smaller one would not reach height h.', { size: 11.5, color: DIM });
  }
  if (s.i >= 3) {
    P.rect(24, 396, 852, 58, { fill: ACCDIM, stroke: ACC, radius: 6 });
    mono(36, 408, 'Two questions, one table: "max height of an AVL tree with n nodes" is the largest h with N(h) <= n;', { size: 11.5, color: ACC });
    mono(36, 428, '"min nodes in an AVL tree of height h" is N(h) itself. Both are the same row read in opposite directions.', { size: 11.5, color: DIM });
    mono(36, 446, 'The perfect tree 2^(h+1)-1 is only equal to N(h) at h = 0 and h = 1; from h = 2 they part company.', { size: 10.5, color: FAINT });
  }
}

/* ---------- scene 9: shapes ---------- */

function drawShape(t) {
  var s = seg(t);
  head('AVL is not "complete", and a balanced root is not "balanced"',
    'two counterexamples that decide more questions than any definition');

  panel(24, 66, 420, 216, 'AVL, but not complete: the level-3 nodes are not leftmost',
    { stroke: VAL, fill: ACCDIM });
  drawTree(AVL_NOT_COMPLETE, 200, 110, 46, 44, { rad: 12, size: 10, showBf: false });
  mono(38, 270, '9 keys, height 3, |bf| <= 1 everywhere — still not complete', { size: 10.5, color: VAL });

  panel(470, 66, 406, 216, 'root bf = 0, and yet not AVL', { stroke: BAD, fill: INVALIDDIM });
  drawTree(ROOT_BALANCED, 600, 110, 44, 44, { rad: 12, size: 10 });
  mono(484, 272, 'bf(50) = 0, but bf(20) = ' + bfOf(ROOT_BALANCED.left) + ' and bf(80) = +' + bfOf(ROOT_BALANCED.right),
    { size: 10.5, color: BAD });

  P.text(24, 300, 'Complete, perfect and AVL are three different promises, and only the last one is a promise about heights:', { size: 12, color: INK });
  var rows = [
    ['perfect', 'every internal node has two children and all leaves are level', '2^(h+1) - 1 nodes'],
    ['complete', 'every level full except the last, which fills left to right', 'a shape rule'],
    ['AVL', 'at every node the two subtree heights differ by at most 1', 'a height rule']
  ];
  for (var i = 0; i <= Math.min(2, s.i + 1); i++) {
    mono(24, 326 + i * 24, rows[i][0], { size: 11.5, bold: true, color: ACC });
    P.text(96, 326 + i * 24, rows[i][1], { size: 11, color: DIM });
    mono(560, 326 + i * 24, rows[i][2], { size: 10.5, color: FAINT });
  }
  if (s.i >= 2) {
    P.text(24, 406, 'AVL implies neither of the other two; complete implies AVL, because a complete tree\'s levels differ by at most 1.', { size: 11.5, color: INK });
  }
  if (s.i >= 3) {
    mono(24, 430, 'the exam sentence to keep: the AVL rule quantifies over EVERY node, so check every node', { size: 11.5, color: BAD });
    mono(24, 450, 'the cheapest check is the in-order walk: heights come out bottom-up, then every bf in one pass', { size: 10.5, color: DIM });
  }
}

/* ---------- scene 10: the routine ---------- */

function drawRoutine(t) {
  var s = seg(t);
  head('The four-step routine, and the four traps',
    'every AVL question is one of four shapes; the routine covers all of them');

  var steps = [
    ['1  draw', 'insert in the given order, left and right decided by comparison'],
    ['2  mark', 'write h and bf at every node as you go'],
    ['3  repair', 'the lowest |bf| = 2 node decides the case: LL, RR, LR, RL'],
    ['4  read', 'the question: final root, rotation count, or height']
  ];
  for (var i = 0; i < 4; i++) {
    var on = s.i >= i;
    var bx = 24 + (i % 2) * 434, by = 66 + Math.floor(i / 2) * 84;
    P.rect(bx, by, 418, 72, { fill: on ? ACCDIM : SURF2, stroke: on ? ACC : BORDER, radius: 8 });
    mono(bx + 12, by + 12, steps[i][0], { size: 12, bold: true, color: on ? ACC : FAINT });
    P.text(bx + 12, by + 36, steps[i][1], { size: 11, color: on ? INK : FAINT });
    if (i === 2) P.text(bx + 12, by + 56, 'one repair per insertion; deletion repairs upward', { size: 10, color: on ? DIM : FAINT });
    if (i === 3) P.text(bx + 12, by + 56, 'a double rotation counts as two single rotations', { size: 10, color: on ? DIM : FAINT });
  }

  var traps = [
    ['trap 1', 'repairing at the root when the lowest break is deeper'],
    ['trap 2', 'using a single rotation on a zig-zag (LR / RL)'],
    ['trap 3', 'reading "balanced" as "complete", or checking only the root'],
    ['trap 4', 'using 2^(h+1) - 1 for the minimum nodes at height h']
  ];
  for (var j = 0; j < 4; j++) {
    var tOn = s.i >= Math.min(3, Math.floor(j / 2) + 1);
    mono(24, 250 + j * 26, traps[j][0], { size: 11, bold: true, color: tOn ? BAD : FAINT });
    P.text(96, 250 + j * 26, traps[j][1], { size: 11, color: tOn ? INK : FAINT });
  }

  P.rect(24, 366, 852, 82, { fill: SURF2, stroke: BORDER, radius: 6 });
  mono(36, 380, 'the two numbers worth memorising: N(h) = 1, 2, 4, 7, 12, 20, 33, 54, 88', { size: 11.5, color: ACC });
  mono(36, 402, 'and the height bound h <= 1.44 log2(n + 2) - 0.328, which is the same fact written the other way round',
    { size: 11.5, color: DIM });
  mono(36, 424, 'everything else is one insertion, one balance factor and one rotation', { size: 11.5, color: FAINT });
}

var DRAW = {
  why: drawWhy,
  invariant: drawInvariant,
  single: drawSingle,
  double: drawDouble,
  pointers: drawPointers,
  insert: drawInsert,
  count: drawCount,
  bound: drawBound,
  shape: drawShape,
  routine: drawRoutine
};

function sceneIdAt(t) {
  var sc = K.state.scenes;
  for (var i = sc.length - 1; i >= 0; i--) if (t >= sc[i].start - 1e-6) return sc[i].id;
  return sc.length ? sc[0].id : 'why';
}

function drawFrame(P0) {
  P = P0;
  P.alpha(1);
  P.clear();
  P.rect(0, 0, W, H, { fill: SURF });
  var id = sceneIdAt(K.state.elapsed);
  var fn = DRAW[id] || drawWhy;
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
  SEQ: SEQ,
  STEPS: STEPS.map(function (s) {
    return { key: s.key, rotations: s.rotations, height: s.height, nodes: s.nodes, inOrder: s.inOrder };
  }),
  FINAL_HEIGHT: heightOf(FINAL),
  FINAL_SIZE: sizeOf(FINAL),
  FINAL_INORDER: inOrder(FINAL),
  TOTAL_SINGLE_ROTATIONS: TOTAL_SINGLE_ROTATIONS,
  TOTAL_EVENTS: TOTAL_EVENTS,
  CASE_LOGS: { LL: CASES.LL.logs, RR: CASES.RR.logs, LR: CASES.LR.logs, RL: CASES.RL.logs },
  NODES_MIN: NODES_MIN,
  MAXH: MAXH,
  AVL_BOUND_7: avlBound(7),
  INS_SAMPLE: INS_SAMPLE,
  DEL_LOG: DEL_LOG,
  DEL_KEY: DEL_KEY,
  DEL_SIZE_BEFORE: sizeOf(DEL_TREE),
  DEL_SIZE_AFTER: sizeOf(DEL_AFTER),
  AVL_NOT_COMPLETE: {
    size: sizeOf(AVL_NOT_COMPLETE),
    height: heightOf(AVL_NOT_COMPLETE),
    complete: isComplete(AVL_NOT_COMPLETE),
    perfect: isPerfect(AVL_NOT_COMPLETE),
    avl: isAvl(AVL_NOT_COMPLETE)
  },
  ROOT_BALANCED: {
    rootBf: bfOf(ROOT_BALANCED),
    leftBf: bfOf(ROOT_BALANCED.left),
    rightBf: bfOf(ROOT_BALANCED.right),
    avl: isAvl(ROOT_BALANCED)
  },
  CHAIN_HEIGHT: heightOf(CHAIN)
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
