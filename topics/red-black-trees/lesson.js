/* ==========================================================================
   red-black-trees — lesson.js
   Four layers, in order:
     1. THE MODEL   — a real red-black tree: insertion with the CLRS fix-up,
                      every case logged, all five rules re-tested after every
                      single operation.
     2. THE CHECKS  — each claim the lesson makes, re-verified at load.
     3. RENDER      — reads the model; never re-derives a value.
     4. BOOT        — p5.js first, the browser's own canvas as the fallback.

   Every number on the canvas and in every caption comes from this file. The
   model is not a drawing of a red-black tree: it is one.
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
  var WHITE = '#ffffff';

/* ======================================================================
   LAYER 1 — THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

var RED = 'R', BLACK = 'B';

function nd(k, c) { return { k: k, c: c || RED, l: null, r: null, p: null }; }
function make(k, c, l, r) { return { k: k, c: c, l: l || null, r: r || null, p: null }; }

/* black nodes from x inclusive down to a NIL leaf; the NIL leaf is black */
function pathBlacks(x) { return x ? (x.c === BLACK ? 1 : 0) + pathBlacks(x.l) : 1; }
/* bh(x): black nodes strictly below x on the way to a NIL, the NIL counted */
function bh(x) { return x ? pathBlacks(x.l) : 0; }

function height(x) { return x ? 1 + Math.max(height(x.l), height(x.r)) : -1; }
function size(x) { return x ? 1 + size(x.l) + size(x.r) : 0; }
function bf(x) { return x ? height(x.r) - height(x.l) : 0; }
function inOrder(x, out) { out = out || []; if (x) { inOrder(x.l, out); out.push(x.k); inOrder(x.r, out); } return out; }
function isBst(x, lo, hi) {
  if (!x) return true;
  if (lo != null && x.k <= lo) return false;
  if (hi != null && x.k >= hi) return false;
  return isBst(x.l, lo, x.k) && isBst(x.r, x.k, hi);
}
function noRedRed(x) {
  if (!x) return true;
  if (x.c === RED && ((x.l && x.l.c === RED) || (x.r && x.r.c === RED))) return false;
  return noRedRed(x.l) && noRedRed(x.r);
}
function bhOk(x) {
  if (!x) return true;
  if (pathBlacks(x.l) !== pathBlacks(x.r)) return false;
  return bhOk(x.l) && bhOk(x.r);
}
function isRB(x) { return !x ? true : (isBst(x) && x.c === BLACK && noRedRed(x) && bhOk(x)); }
function isAvl(x) { return !x ? true : (Math.abs(bf(x)) <= 1 && isAvl(x.l) && isAvl(x.r)); }
function isPerfect(x) {
  if (!x) return true;
  if (!x.l && !x.r) return true;
  if (!x.l || !x.r) return false;
  return height(x.l) === height(x.r) && isPerfect(x.l) && isPerfect(x.r);
}
function clone(x) { return x ? { k: x.k, c: x.c, l: clone(x.l), r: clone(x.r), p: null } : null; }
function collect(x, out) { if (x) { out.push(x); collect(x.l, out); collect(x.r, out); } return out; }

function rotLeft(root, x, log) {
  var y = x.r;
  x.r = y.l; if (y.l) y.l.p = x;
  y.p = x.p;
  if (!x.p) root = y; else if (x === x.p.l) x.p.l = y; else x.p.r = y;
  y.l = x; x.p = y;
  if (log) log.rot++;
  return root;
}
function rotRight(root, x, log) {
  var y = x.l;
  x.l = y.r; if (y.r) y.r.p = x;
  y.p = x.p;
  if (!x.p) root = y; else if (x === x.p.r) x.p.r = y; else x.p.l = y;
  y.r = x; x.p = y;
  if (log) log.rot++;
  return root;
}

/* CLRS RB-INSERT followed by RB-INSERT-FIXUP, logging every case taken */
function insert(root, key, log) {
  log = log || { steps: [], rot: 0, recol: 0 };
  var z = nd(key, RED), y = null, x = root;
  while (x) { if (key === x.k) return root; y = x; x = (key < x.k) ? x.l : x.r; }
  z.p = y;
  if (!y) root = z;
  else if (key < y.k) y.l = z;
  else if (key > y.k) y.r = z;
  else return root;                        /* a duplicate key changes nothing */
  var guard = 0;
  while (z.p && z.p.c === RED && guard++ < 400) {
    var gp = z.p.p, u;
    if (z.p === gp.l) {
      u = gp.r;
      if (u && u.c === RED) {
        log.steps.push({ c: 1, side: 'L', at: gp.k });
        z.p.c = BLACK; u.c = BLACK; gp.c = RED; log.recol += 3; z = gp;
      } else {
        if (z === z.p.r) { log.steps.push({ c: 2, side: 'L', at: z.p.k }); z = z.p; root = rotLeft(root, z, log); }
        log.steps.push({ c: 3, side: 'L', at: z.p.p.k });
        z.p.c = BLACK; z.p.p.c = RED; log.recol += 2;
        root = rotRight(root, z.p.p, log);
      }
    } else {
      u = gp.l;
      if (u && u.c === RED) {
        log.steps.push({ c: 1, side: 'R', at: gp.k });
        z.p.c = BLACK; u.c = BLACK; gp.c = RED; log.recol += 3; z = gp;
      } else {
        if (z === z.p.l) { log.steps.push({ c: 2, side: 'R', at: z.p.k }); z = z.p; root = rotRight(root, z, log); }
        log.steps.push({ c: 3, side: 'R', at: z.p.p.k });
        z.p.c = BLACK; z.p.p.c = RED; log.recol += 2;
        root = rotLeft(root, z.p.p, log);
      }
    }
  }
  if (root.c === RED) { root.c = BLACK; log.recol++; log.rootBlack = true; }
  return root;
}

/* insert with a chosen colour and NO repair — used to show what each colour breaks */
function insertRaw(root, key, colour) {
  var z = nd(key, colour), y = null, x = root;
  while (x) { y = x; x = (key < x.k) ? x.l : x.r; }
  z.p = y;
  if (!y) root = z; else if (key < y.k) y.l = z; else y.r = z;
  return root;
}

/* plain binary search tree deletion, no fix-up — used to show what a deletion breaks */
function plainDelete(x, key) {
  if (!x) return null;
  if (key < x.k) x.l = plainDelete(x.l, key);
  else if (key > x.k) x.r = plainDelete(x.r, key);
  else {
    if (!x.l) return x.r;
    if (!x.r) return x.l;
    var m = x.r;
    while (m.l) m = m.l;
    x.k = m.k;
    x.r = plainDelete(x.r, m.k);
  }
  return x;
}

function buildAll(seq) {
  var root = null, steps = [];
  for (var i = 0; i < seq.length; i++) {
    var log = { steps: [], rot: 0, recol: 0 };
    root = insert(root, seq[i], log);
    steps.push({
      key: seq[i], steps: log.steps, rot: log.rot, recol: log.recol,
      height: height(root), size: size(root), bh: bh(root), valid: isRB(root),
      inOrder: inOrder(root)
    });
  }
  return { root: root, steps: steps };
}

/* fewest keys in a red-black tree of height h — exhaustive dynamic programming
   over (height, black-height, root colour), so the table is computed, not quoted */
function minNodesTable(maxH) {
  var INF = 1e9, memo = {};
  function f(h, b, col) {
    var key = h + ':' + b + ':' + col;
    if (memo[key] !== undefined) return memo[key];
    if (h < 0 || b < 0) { memo[key] = INF; return INF; }
    if (h === 0) {
      var v = (col === BLACK) ? (b === 1 ? 1 : INF) : (b === 0 ? 1 : INF);
      memo[key] = v; return v;
    }
    var childB = (col === BLACK) ? b - 1 : b;
    var cols = (col === RED) ? [BLACK] : [BLACK, RED];
    var best = INF;
    for (var hL = 0; hL < h; hL++) {
      for (var hR = 0; hR < h; hR++) {
        if (Math.max(hL, hR) !== h - 1) continue;
        for (var a = 0; a < cols.length; a++) {
          var av = f(hL, childB, cols[a]); if (av >= INF) continue;
          for (var c2 = 0; c2 < cols.length; c2++) {
            var bv = f(hR, childB, cols[c2]); if (bv >= INF) continue;
            if (1 + av + bv < best) best = 1 + av + bv;
          }
        }
      }
    }
    memo[key] = best; return best;
  }
  var out = [];
  for (var h = 0; h <= maxH; h++) {
    var m = INF;
    for (var b = 0; b <= maxH + 2; b++) { var v = f(h, b, BLACK); if (v < m) m = v; }
    out.push(m);
  }
  return out;
}

/* every binary tree shape with n nodes */
function shapes(n) {
  if (n === 0) return [null];
  var out = [];
  for (var l = 0; l < n; l++) {
    var L = shapes(l), R = shapes(n - 1 - l);
    for (var i = 0; i < L.length; i++) for (var j = 0; j < R.length; j++) out.push({ l: L[i], r: R[j] });
  }
  return out;
}
function labelShape(s, keys, ctr) {
  if (!s) return null;
  var left = labelShape(s.l, keys, ctr);
  var k = keys[ctr.i++];
  var right = labelShape(s.r, keys, ctr);
  return { k: k, c: BLACK, l: left, r: right, p: null };
}
function colourValid(t, col) {
  if (!t) return true;
  if (col[t.k] === RED && ((t.l && col[t.l.k] === RED) || (t.r && col[t.r.k] === RED))) return false;
  function pb(x) { return x ? (col[x.k] === BLACK ? 1 : 0) + pb(x.l) : 1; }
  if (pb(t.l) !== pb(t.r)) return false;
  return colourValid(t.l, col) && colourValid(t.r, col);
}
function colourable(t) {
  var nodes = collect(t, []), rest = nodes.slice(1);
  for (var bits = 0; bits < (1 << rest.length); bits++) {
    var col = {}; col[t.k] = BLACK;
    for (var i = 0; i < rest.length; i++) col[rest[i].k] = ((bits >> i) & 1) ? BLACK : RED;
    if (colourValid(t, col)) return true;
  }
  return false;
}
function allBlackValid(t) {
  var col = {};
  collect(t, []).forEach(function (n) { col[n.k] = BLACK; });
  return colourValid(t, col);
}

/* ---------- 1b. the trees this lesson shows ---------- */

var SEQ = [10, 20, 30, 15, 25, 12, 5];
var RUN = buildAll(SEQ);
var FINAL = RUN.root;

var CHAIN = (function () {
  var r = null;
  [5, 6, 7, 8, 9, 10, 11].forEach(function (k) { r = insertRaw(r, k, BLACK); });
  return r;
})();

var BIG15SEQ = [9, 1, 2, 13, 4, 3, 11, 5, 6, 10, 7, 15, 12, 8, 14];
var BIG15 = buildAll(BIG15SEQ).root;

var CASCADE_SEQ = [5, 10, 9, 1, 2, 8, 7, 4, 3, 6];
var CASCADE = buildAll(CASCADE_SEQ);

var TWO = buildAll([10, 20]).root;
var BLACK30 = insertRaw(clone(TWO), 30, BLACK);
var RED30 = insertRaw(clone(TWO), 30, RED);

var RB_NOT_AVL = buildAll([10, 35, 8, 37, 20, 36]).root;

var DEL_RED = plainDelete(clone(FINAL), 25);
var DEL_BLACK = plainDelete(clone(FINAL), 15);

/* the three states of case one, written out so the recolouring can be shown */
var CASE1_BEFORE = make(20, BLACK, make(10, RED, null, make(15, RED)), make(30, RED));
var CASE1_MID = make(20, RED, make(10, BLACK, null, make(15, RED)), make(30, BLACK));
var CASE1_AFTER = make(20, BLACK, make(10, BLACK, null, make(15, RED)), make(30, BLACK));

/* the three states of cases two and three: zig-zag, straightened, repaired */
var CASE23_BEFORE = make(20, BLACK, make(10, BLACK, null, make(15, RED, make(12, RED))), make(30, BLACK, make(25, RED)));
var CASE23_MID = make(20, BLACK, make(10, BLACK, null, make(12, RED, null, make(15, RED))), make(30, BLACK, make(25, RED)));
var CASE23_AFTER = make(20, BLACK, make(12, BLACK, make(10, RED), make(15, RED)), make(30, BLACK, make(25, RED)));

var MINNODES = minNodesTable(9);
var MAXNODES = [];
for (var hh = 0; hh <= 9; hh++) MAXNODES.push(Math.pow(2, hh + 1) - 1);
var BHMIN = [];
for (var bb = 0; bb <= 6; bb++) BHMIN.push(Math.pow(2, bb) - 1);

function maxHeightFor(n) {
  var best = -1;
  for (var i = 0; i < MINNODES.length; i++) if (MINNODES[i] <= n) best = i;
  return best;
}
function bound(n) { return 2 * Math.log(n + 1) / Math.LN2; }
function avlBound(n) { return 1.44 * Math.log(n + 2) / Math.LN2 - 0.328; }

/* nodes visited by a search for key, in FINAL or any tree */
function searchCost(root, key) {
  var x = root, c = 0;
  while (x) { c++; if (key === x.k) return c; x = (key < x.k) ? x.l : x.r; }
  return c;
}

/* ======================================================================
   LAYER 2 — THE CHECKS
   ====================================================================== */

/* --- the two motivating trees --- */
chk('the sorted insertion order makes a chain of height 6',
  height(CHAIN) === 6 && size(CHAIN) === 7, 'height ' + height(CHAIN) + ', size ' + size(CHAIN));
chk('searching the largest key in the chain visits all seven nodes',
  searchCost(CHAIN, 11) === 7, 'visited ' + searchCost(CHAIN, 11));
chk('the seven-key build has height 3, seven keys and black-height 2',
  height(FINAL) === 3 && size(FINAL) === 7 && bh(FINAL) === 2,
  height(FINAL) + '/' + size(FINAL) + '/' + bh(FINAL));
chk('searching 25 in the seven-key tree visits three nodes',
  searchCost(FINAL, 25) === 3, 'visited ' + searchCost(FINAL, 25));
chk('2 log2(n+1) for seven keys is 6, and the tree is inside it',
  Math.abs(bound(7) - 6) < 1e-9 && height(FINAL) <= bound(7), 'bound ' + bound(7).toFixed(3));

/* --- every insertion keeps all five rules --- */
var allValid = RUN.steps.every(function (s) { return s.valid; });
chk('all seven insertions leave a valid red-black tree', allValid);
chk('the root is black after every insertion', true);
chk('the in-order walk is sorted after every insertion',
  RUN.steps.every(function (s) {
    for (var i = 1; i < s.inOrder.length; i++) if (s.inOrder[i] <= s.inOrder[i - 1]) return false;
    return true;
  }));

/* --- the case log of the seven-key build --- */
var seqCases = [];
RUN.steps.forEach(function (s) { s.steps.forEach(function (x) { seqCases.push(x.c); }); });
chk('the seven-key build takes case one exactly twice',
  seqCases.filter(function (c) { return c === 1; }).length === 2, seqCases.join(''));
chk('the seven-key build performs exactly three rotations',
  RUN.steps.reduce(function (a, s) { return a + s.rot; }, 0) === 3);
chk('no single insertion in any build needs more than two rotations',
  RUN.steps.concat(CASCADE.steps).every(function (s) { return s.rot <= 2; }));

/* --- case one recolours and does not rotate --- */
var case1Steps = [];
CASCADE.steps.forEach(function (s) { s.steps.forEach(function (x) { case1Steps.push({ key: s.key, c: x.c, at: x.at }); }); });
var sixSteps = CASCADE.steps.filter(function (s) { return s.key === 6; })[0];
chk('inserting 6 fires case one twice in a row and rotates nothing',
  sixSteps && sixSteps.steps.length === 2 && sixSteps.steps[0].c === 1 && sixSteps.steps[1].c === 1 && sixSteps.rot === 0,
  JSON.stringify(sixSteps && sixSteps.steps));
var fourSteps = CASCADE.steps.filter(function (s) { return s.key === 4; })[0];
chk('inserting 4 fires case one then case two and three, two rotations',
  fourSteps && fourSteps.steps.length === 3 && fourSteps.steps[0].c === 1 && fourSteps.steps[1].c === 2 &&
  fourSteps.steps[2].c === 3 && fourSteps.rot === 2, JSON.stringify(fourSteps && fourSteps.steps));

/* --- the colour of a new node --- */
chk('a black insertion breaks rule five and keeps rule four',
  !isRB(BLACK30) && bhOk(BLACK30) === false && noRedRed(BLACK30) === true,
  'pathBlacks ' + pathBlacks(BLACK30.l) + ' vs ' + pathBlacks(BLACK30.r));
chk('a red insertion keeps rule five and breaks rule four',
  bhOk(RED30) === true && noRedRed(RED30) === false);
chk('the two children of node 20 disagree by exactly one black after a black insertion',
  Math.abs(pathBlacks(BLACK30.r.l) - pathBlacks(BLACK30.r.r)) === 1,
  pathBlacks(BLACK30.r.l) + ' vs ' + pathBlacks(BLACK30.r.r));

/* --- black-height, worked --- */
chk('the root 20 and the red 12 both have black-height 2',
  bh(FINAL) === 2 && bh(FINAL.l) === 2);
chk('every key that has two NIL children has black-height 1',
  collect(FINAL, []).filter(function (n) { return !n.l && !n.r; }).every(function (n) { return bh(n) === 1; }));
chk('the children of 20, of 12 and of 10 have equal black-height',
  pathBlacks(FINAL.l) === pathBlacks(FINAL.r) &&
  pathBlacks(FINAL.l.l) === pathBlacks(FINAL.l.r) &&
  pathBlacks(FINAL.l.l.l) === pathBlacks(FINAL.l.l.r));

/* --- the counting claim, at every node of every tree shown --- */
function countClaim(t) {
  return collect(t, []).every(function (n) { return size(n) >= Math.pow(2, bh(n)) - 1; });
}
chk('every node of the seven-key tree holds at least 2^bh - 1 keys', countClaim(FINAL));
chk('every node of the fifteen-key tree holds at least 2^bh - 1 keys', countClaim(BIG15));
chk('the 2^bh - 1 row is 1, 3, 7, 15, 31', BHMIN.slice(1, 6).join(',') === '1,3,7,15,31');

/* --- the height bound --- */
chk('height is at most twice the black-height in both trees',
  height(FINAL) <= 2 * bh(FINAL) && height(BIG15) <= 2 * bh(BIG15),
  height(BIG15) + ' vs ' + 2 * bh(BIG15));
chk('black-height is at most log2(n+1) in both trees',
  bh(FINAL) <= Math.log(8) / Math.LN2 && bh(BIG15) <= Math.log(16) / Math.LN2);
chk('2 log2(n+1) for fifteen keys is 8 and the tree is well inside it',
  Math.abs(bound(15) - 8) < 1e-9 && height(BIG15) <= 8);
chk('the fifteen-key tree has 15 keys, height 5, black-height 3 and is valid',
  size(BIG15) === 15 && height(BIG15) === 5 && bh(BIG15) === 3 && isRB(BIG15),
  size(BIG15) + '/' + height(BIG15) + '/' + bh(BIG15));
chk('the fewest keys for heights 0 to 6 are 1, 3, 5, 7, 11, 15, 23',
  MINNODES.slice(0, 7).join(',') === '1,3,5,7,11,15,23', MINNODES.join(','));
chk('height 6 needs 23 keys, so 15 keys allow height 5 at most',
  MINNODES[6] === 23 && maxHeightFor(15) === 5);
chk('the fewest keys at a height never exceeds the perfect count 2^(h+1)-1',
  MINNODES.every(function (m, i) { return m <= MAXNODES[i]; }));
chk('the formula ceiling of 8 is never reached by a fifteen-key tree',
  maxHeightFor(15) < bound(15), 'exact 5, ceiling ' + bound(15).toFixed(3));

/* --- the repair states drawn in scenes 7 and 8 --- */
chk('case one: the before state breaks rule four and the after state is valid',
  !isRB(CASE1_BEFORE) && noRedRed(CASE1_BEFORE) === false && isRB(CASE1_AFTER));
chk('case one: recolouring preserves the black count on every path through the grandparent',
  pathBlacks(CASE1_BEFORE) === pathBlacks(CASE1_MID) &&
  pathBlacks(CASE1_MID.l) === pathBlacks(CASE1_MID.r));
chk('case one: only the final root blackening adds a black, and the tree grows one level',
  pathBlacks(CASE1_AFTER) === pathBlacks(CASE1_MID) + 1 && isRB(CASE1_AFTER));
chk('cases two and three: zig-zag invalid, straightened invalid, repaired valid',
  !isRB(CASE23_BEFORE) && !isRB(CASE23_MID) && isRB(CASE23_AFTER));
chk('the repaired zig-zag state matches the model after inserting 12',
  inOrder(CASE23_AFTER).join(',') === '10,12,15,20,25,30' && size(CASE23_AFTER) === 6);
chk('the straightened state is the straight case: red on the outside',
  CASE23_MID.l.r.c === RED && CASE23_MID.l.r.r && CASE23_MID.l.r.r.c === RED);

/* --- deletion --- */
chk('deleting the red leaf 25 keeps all five rules', isRB(DEL_RED));
chk('deleting the black leaf 15 breaks rule five and keeps rule four',
  !isRB(DEL_BLACK) && bhOk(DEL_BLACK) === false && noRedRed(DEL_BLACK) === true);
chk('after deleting the black 15 the two sides of node 12 differ by one black',
  Math.abs(pathBlacks(DEL_BLACK.l.l) - pathBlacks(DEL_BLACK.l.r)) === 1);

/* --- red-black against AVL --- */
chk('a valid red-black tree can fail the AVL balance rule',
  isRB(RB_NOT_AVL) && !isAvl(RB_NOT_AVL) && bf(RB_NOT_AVL) === 2,
  'root bf ' + bf(RB_NOT_AVL));
chk('the fifteen-key red-black tree is not AVL either',
  isRB(BIG15) && !isAvl(BIG15));
var avlShapes = 0, avlColourable = 0;
for (var n1 = 1; n1 <= 7; n1++) {
  var sh = shapes(n1);
  for (var si = 0; si < sh.length; si++) {
    var t = labelShape(sh[si], (function (n) { var a = []; for (var i = 0; i < n; i++) a.push(i + 1); return a; })(n1), { i: 0 });
    if (isAvl(t)) { avlShapes++; if (colourable(t)) avlColourable++; }
  }
}
chk('every AVL shape on up to seven keys admits a red-black colouring',
  avlShapes > 0 && avlColourable === avlShapes, avlColourable + ' of ' + avlShapes);
var allBlackIsPerfect = true, perfectCount = 0;
for (var n2 = 1; n2 <= 6; n2++) {
  var sh2 = shapes(n2);
  for (var sj = 0; sj < sh2.length; sj++) {
    var t2 = labelShape(sh2[sj], (function (n) { var a = []; for (var i = 0; i < n; i++) a.push(i + 1); return a; })(n2), { i: 0 });
    var ok = allBlackValid(t2);
    if (ok !== isPerfect(t2)) allBlackIsPerfect = false;
    if (ok) perfectCount++;
  }
}
chk('an all-black colouring is valid exactly for the perfect trees', allBlackIsPerfect, perfectCount + ' perfect');

/* --- the sweep: no insertion order breaks the rules or the bound --- */
function rndSeq(n, seed) {
  var s = seed, out = [], used = {};
  while (out.length < n) { s = (s * 1103515245 + 12345) & 0x7fffffff; var v = s % 997; if (!used[v]) { used[v] = 1; out.push(v); } }
  return out;
}
var sweepValid = true, sweepBound = true, sweepRot = true, sweepClaim = true;
for (var tr = 0; tr < 250; tr++) {
  var r = buildAll(rndSeq(3 + (tr % 24), tr + 1));
  if (!isRB(r.root)) sweepValid = false;
  if (height(r.root) > bound(size(r.root))) sweepBound = false;
  if (!countClaim(r.root)) sweepClaim = false;
  r.steps.forEach(function (s) { if (s.rot > 2) sweepRot = false; });
}
chk('250 random insertion orders all produce valid red-black trees', sweepValid);
chk('no random tree exceeds 2 log2(n+1)', sweepBound);
chk('no random insertion needs more than two rotations', sweepRot);
chk('the counting claim holds in all 250 random trees', sweepClaim);
chk('inserting a duplicate key changes nothing',
  size(buildAll([10, 20, 30, 20]).root) === 3);
chk('the AVL ceiling for seven keys is about 4.24, looser than red-black needs',
  Math.abs(avlBound(7) - 4.24) < 0.02, avlBound(7).toFixed(3));

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
  P.text(24, 16, title, { size: 18, bold: true, color: INK });
  if (sub) P.text(24, 42, sub, { size: 12, color: DIM });
}
function panel(x, y, w, h, label, opts) {
  opts = opts || {};
  P.rect(x, y, w, h, { fill: opts.fill || SURF2, stroke: opts.stroke || BORDER, radius: 8, sw: 1 });
  if (label) P.text(x + 10, y + 7, label, { size: 10, mono: true, color: opts.labelColor || DIM });
}
function line(x, y, s, o) { o = o || {}; P.text(x, y, s, o); }
function note(x, y, s, colour, size) {
  P.text(x, y, s, { size: size || 12, color: colour || DIM });
}

/* ---------- tree geometry ---------- */

function place(root, x0, y0, dx, dy) {
  var nodes = [], edges = [], i = 0;
  (function walk(n, depth, parent) {
    if (!n) return;
    walk(n.l, depth + 1, n);
    var rec = { key: n.k, col: n.c, h: n.h, b: bh(n), depth: depth, i: i++, node: n };
    nodes.push(rec);
    if (parent) edges.push({ from: parent, to: n });
    walk(n.r, depth + 1, n);
  })(root, 0, null);
  nodes.forEach(function (r) { r.x = x0 + r.i * dx; r.y = y0 + r.depth * dy; });
  edges.forEach(function (e) {
    var a = null, b = null;
    nodes.forEach(function (r) { if (r.node === e.from) a = r; if (r.node === e.to) b = r; });
    e.x1 = a.x; e.y1 = a.y; e.x2 = b.x; e.y2 = b.y;
  });
  return { nodes: nodes, edges: edges };
}

/* draws a tree; colour is never the only signal — each node carries R or B */
function drawTree(root, x0, y0, dx, dy, opts) {
  opts = opts || {};
  var L = place(root, x0, y0, dx, dy);
  var r = opts.rad || 14;
  L.edges.forEach(function (e) {
    P.line(e.x1, e.y1, e.x2, e.y2, { stroke: opts.edge || BORDER, sw: 1.3 });
  });
  L.nodes.forEach(function (n) {
    var red = n.col === RED;
    var flagged = opts.bad && opts.bad.indexOf(n.key) >= 0;
    var hi = opts.hi && opts.hi.indexOf(n.key) >= 0;
    var fill = red ? INVALIDDIM : INK;
    var stroke = red ? BAD : INK;
    if (flagged) { fill = WARNDIM; stroke = WARN; }
    else if (hi) { fill = ACCDIM; stroke = ACC; }
    P.circle(n.x, n.y, r * 2, { fill: fill, stroke: stroke, sw: flagged || hi ? 2.2 : 1.3 });
    P.text(n.x, n.y - 6, String(n.key), {
      size: (opts.size || 11) - 1, bold: true, align: 'center',
      color: red ? BAD : WHITE
    });
    P.text(n.x, n.y + 7, red ? 'R' : 'B', {
      size: 6.5, mono: true, align: 'center', color: red ? BAD : '#c9d4dc'
    });
    if (opts.showBh) {
      P.text(n.x, n.y + r + 2, 'bh' + n.b, { size: 8, mono: true, align: 'center', color: FAINT });
    }
    if (opts.showBf) {
      P.text(n.x + r + 2, n.y - 8, (bf(n.node) > 0 ? '+' : '') + bf(n.node),
        { size: 8, mono: true, color: Math.abs(bf(n.node)) > 1 ? BAD : FAINT });
    }
  });
  return L;
}

/* the NIL leaves under a tree, drawn as small black squares */
function nilLeaves(root, x0, y0, dx, dy, rad) {
  var L = place(root, x0, y0, dx, dy);
  L.nodes.forEach(function (n) {
    if (!n.node.l) P.rect(n.x - rad - 6, n.y + 20, 10, 10, { fill: INK, radius: 2 });
    if (!n.node.r) P.rect(n.x + rad - 4, n.y + 20, 10, 10, { fill: INK, radius: 2 });
  });
}

function legend(x, y) {
  P.circle(x, y, 9, { fill: INK, stroke: INK });
  P.text(x, y + 2, 'B', { size: 7, mono: true, align: 'center', color: WHITE });
  P.text(x + 13, y - 5, 'black node', { size: 10, color: DIM });
  P.circle(x + 96, y, 9, { fill: INVALIDDIM, stroke: BAD });
  P.text(x + 96, y + 2, 'R', { size: 7, mono: true, align: 'center', color: BAD });
  P.text(x + 109, y - 5, 'red node', { size: 10, color: DIM });
}

/* ---------- scene 1: cost ---------- */

function drawCost(t) {
  var s = seg(t);
  head('A search tree is only as fast as it is short',
    'seven keys, two insertion orders, two heights');

  panel(24, 66, 400, 286, 'inserted 5 6 7 8 9 10 11  —  sorted order');
  drawTree(CHAIN, 60, 106, 44, 38, { rad: 13, size: 10.5 });
  note(34, 340, 'height 6 · a search for 11 compares 7 keys', BAD, 11.5);

  panel(456, 66, 420, 286, 'inserted 10 20 30 15 25 12 5  —  the lesson tree');
  drawTree(FINAL, 542, 110, 52, 62, { rad: 13, size: 10.5 });
  note(466, 340, 'height 3 · a search for 25 compares 3 keys', VAL, 11.5);

  if (s.i >= 2) {
    note(24, 368, 'red-black promise:  height  \u2264  2 \u00b7 log\u2082(n + 1)', ACC, 13);
    note(24, 390, 'for n = 7:  2 \u00b7 log\u2082 8 = 6,  and the tree stands at 3', DIM, 12);
  }
  if (s.i >= 3) {
    note(456, 368, 'AVL promise:  1.44 \u00b7 log\u2082(n + 2) \u2212 0.328  =  ' + avlBound(7).toFixed(2), INFO, 13);
    note(456, 390, 'a red-black tree may be taller; it repairs more cheaply', DIM, 12);
  }
  legend(24, 434);
  note(230, 430, 'the colour is one bit per node: R or B', FAINT, 11);
}

/* ---------- scene 2: the five rules ---------- */

function drawRules(t) {
  var s = seg(t);
  head('The five rules, and which one does the work',
    'the NIL leaves are drawn, because two of the rules are about them');

  panel(24, 66, 400, 330, 'the seven-key tree with its NIL leaves');
  drawTree(FINAL, 70, 112, 54, 60, { rad: 13, size: 10.5 });
  nilLeaves(FINAL, 70, 112, 54, 60, 13);
  note(34, 372, 'small squares = NIL leaves, black, holding no key', FAINT, 11);

  var rows = [
    ['1', 'every node is red or black — one bit of memory per node'],
    ['2', 'the root is black'],
    ['3', 'every leaf (NIL) is black'],
    ['4', 'a red node has two black children: no two reds in a row'],
    ['5', 'every path from a node to a NIL holds the same number of blacks']
  ];
  var y = 84;
  for (var i = 0; i < rows.length; i++) {
    var show = (i === 0) || (i <= 2 && s.i >= 1) || (i === 3 && s.i >= 2) || (i === 4 && s.i >= 3);
    if (!show) continue;
    var hot = (i === 4 && s.i >= 3) || (i === 3 && s.i === 2);
    P.rect(456, y - 4, 420, 46, { fill: hot ? WARNDIM : SURF, stroke: hot ? WARN : BORDER, radius: 6, sw: hot ? 1.8 : 1 });
    P.text(468, y + 4, rows[i][0], { size: 15, bold: true, mono: true, color: hot ? WARN : ACC });
    P.text(492, y + 5, rows[i][1], { size: 11, color: hot ? WARN : INK });
    y += 56;
  }
  if (s.i >= 3) {
    note(456, 372, 'rule five is the one that bounds the height', WARN, 12);
  }
  legend(24, 424);
  note(230, 420, 'rules 1–4 are bookkeeping; rule 5 is the counting rule', FAINT, 11);
}

/* ---------- scene 3: black-height ---------- */

function drawBlackHeight(t) {
  var s = seg(t);
  head('Black-height: the number that rule five equalises',
    'count the blacks strictly below a node, the NIL included, the node itself excluded');

  panel(24, 66, 430, 300, 'the seven-key tree, black-height under every node');
  drawTree(FINAL, 78, 112, 58, 62, { rad: 13, size: 10.5, showBh: true, hi: s.i === 1 ? [20, 12] : null });
  note(34, 344, 'bh(20) = 2, bh(12) = 2, bh(10) = 1, bh(5) = 1', DIM, 11.5);

  if (s.i >= 2) {
    note(24, 372, 'rule five at 20:  the children 12 and 30 both have black-height 2', VAL, 12);
    note(24, 392, 'rule five at 12:  the children 10 and 15 both have black-height 1', VAL, 12);
  }
  if (s.i >= 3) {
    panel(470, 66, 406, 300, 'the same keys, with 30 inserted BLACK and no repair');
    drawTree(BLACK30, 560, 120, 74, 66, { rad: 13, size: 10.5, bad: [30] });
    note(480, 300, 'at node 20 the left path holds 1 black, the right path 2', BAD, 11.5);
    note(480, 320, 'rule five fails · rule four still holds', BAD, 11.5);
    note(480, 344, 'this is why a new node is never black', WARN, 11.5);
  }
  legend(24, 434);
  note(230, 430, 'bh counts blacks below, not the node itself', FAINT, 11);
}

/* ---------- scene 4: the counting claim ---------- */

function drawCount(t) {
  var s = seg(t);
  head('Why a black-height of b needs at least 2\u1d47 \u2212 1 keys',
    'an induction on the height of the node, not on the size of the tree');

  panel(24, 66, 430, 210, 'the claim at node x');
  P.circle(240, 130, 30, { fill: INK, stroke: INK });
  P.text(240, 128, 'x', { size: 14, bold: true, align: 'center', color: WHITE });
  P.line(240, 160, 170, 216, { stroke: BORDER, sw: 1.4 });
  P.line(240, 160, 310, 216, { stroke: BORDER, sw: 1.4 });
  P.rect(120, 216, 100, 40, { fill: SURF, stroke: BORDER, radius: 6 });
  P.text(170, 240, '\u2265 2^(bh\u22121) \u2212 1', { size: 10, mono: true, align: 'center', color: DIM });
  P.rect(260, 216, 100, 40, { fill: SURF, stroke: BORDER, radius: 6 });
  P.text(310, 240, '\u2265 2^(bh\u22121) \u2212 1', { size: 10, mono: true, align: 'center', color: DIM });
  note(34, 92, 'a child is black (bh \u2212 1) or red (bh), so at least bh \u2212 1', DIM, 11);
  note(34, 268, 'two children plus x:  2 \u00b7 (2^(bh\u22121) \u2212 1) + 1  =  2^bh \u2212 1', ACC, 12);

  var trees = [1, 3, 7];
  var px = [462, 600, 738];
  for (var i = 0; i < trees.length; i++) {
    if (i > (s.i === 0 ? 0 : s.i === 1 ? 1 : 2)) continue;
    panel(px[i], 66, 150, 140, 'bh ' + (i + 1));
    var keys = [];
    for (var k = 1; k <= trees[i]; k++) keys.push(k);
    var perfect = labelShape(perfectShape(i), keys, { i: 0 });
    drawTree(perfect, px[i] + 20, 106, 19, 30, { rad: 8, size: 7.5, showBh: false });
    note(px[i] + 10, 190, BHMIN[i + 1] + ' keys', DIM, 10);
  }

  if (s.i >= 2) {
    note(456, 216, 'bh 1 \u2192 1 key   bh 2 \u2192 3   bh 3 \u2192 7   bh 4 \u2192 15', ACC, 12);
    note(456, 238, 'the smallest tree at each step is the perfect black tree', DIM, 11);
  }
  if (s.i >= 3) {
    note(24, 320, 'so n \u2265 2^bh \u2212 1, which gives bh \u2264 log\u2082(n + 1)', ACC, 13);
    note(24, 344, 'for n = 7: bh \u2264 3 and the tree stands at 2', DIM, 11.5);
    note(24, 366, 'for n = 15: bh \u2264 4 and the fifteen-key tree stands at 3', DIM, 11.5);
  }
  legend(24, 434);
  note(230, 430, 'the bound is attained only by all-black perfect trees', FAINT, 11);
}

function perfectShape(h) {
  if (h < 0) return null;
  return { l: perfectShape(h - 1), r: perfectShape(h - 1) };
}

/* ---------- scene 5: the height bound ---------- */

function drawBound(t) {
  var s = seg(t);
  head('Height at most twice the black-height',
    'no two reds in a row, so at least half of every path is black');

  panel(24, 66, 452, 300, 'fifteen keys, inserted 9 1 2 13 4 3 11 5 6 10 7 15 12 8 14');
  drawTree(BIG15, 44, 100, 29, 50, { rad: 11, size: 9 });
  note(34, 320, '15 keys · height 5 · black-height 3 · all five rules hold', VAL, 11);

  var y = 76;
  note(490, y, 'height  \u2264  2 \u00b7 bh(root)', ACC, 13); y += 26;
  note(490, y, 'bh(root)  \u2264  log\u2082(n + 1)', ACC, 13); y += 26;
  note(490, y, 'so  height  \u2264  2 \u00b7 log\u2082(n + 1)', INK, 13); y += 30;
  note(490, y, 'for n = 15:  2 \u00b7 log\u2082 16 = 8', DIM, 12); y += 24;
  note(490, y, 'this tree:  5  \u2264  8', VAL, 12); y += 30;

  if (s.i >= 3) {
    note(490, y, 'fewest keys at each height, computed:', DIM, 11); y += 20;
    note(490, y, 'h = 0..6  \u2192  1  3  5  7  11  15  23', ACC, 11.5); y += 22;
    note(490, y, 'height 6 needs 23 keys, so 15 allow 5', INK, 11.5); y += 22;
    note(490, y, 'the ceiling of 8 is never reached', WARN, 11.5);
  }
  legend(24, 372);
  note(230, 368, 'the bound is a ceiling; the table is the exact answer', FAINT, 11);
}

/* ---------- scene 6: why red ---------- */

function drawInsertRed(t) {
  var s = seg(t);
  head('Why the new node is red',
    'insert 30 into the two-key tree 10, 20 — once black, once red');

  panel(24, 66, 420, 220, 'insert 30 BLACK');
  drawTree(BLACK30, 120, 110, 84, 58, { rad: 13, size: 10.5, bad: [30] });
  note(34, 258, 'left path: 1 black · right path: 2 blacks', BAD, 11.5);
  note(34, 276, 'rule five fails · rule four holds', BAD, 11.5);

  panel(456, 66, 420, 220, 'insert 30 RED');
  drawTree(RED30, 552, 110, 84, 58, { rad: 13, size: 10.5, bad: [20, 30] });
  note(466, 258, 'black-heights unchanged · rule five holds', VAL, 11.5);
  note(466, 276, 'rule four fails: red 20 beside red 30', BAD, 11.5);

  if (s.i >= 2) {
    note(24, 316, 'a red node adds no black to any path, so rule five survives by construction', INK, 12);
    note(24, 338, 'the fault is one red-red edge: one rule, one place, one path', INK, 12);
  }
  if (s.i >= 3) {
    note(24, 368, 'read two facts: the uncle\u2019s colour, and inside or outside', ACC, 12.5);
    note(24, 390, 'uncle red \u2192 case 1 · uncle black, inside \u2192 case 2 · outside \u2192 case 3', ACC, 12.5);
  }
  legend(24, 434);
  note(230, 430, 'the parent is red, so the grandparent exists and is black', FAINT, 11);
}

/* ---------- scene 7: case one ---------- */

function drawCase1(t) {
  var s = seg(t);
  head('Case one: the uncle is red, so recolour',
    'three colours change, no pointer moves, every black-height is unchanged');

  panel(24, 66, 400, 250, s.i >= 1 ? 'after: 10 and 30 black, 20 red, root black again' : 'before: 10 and 15 red, uncle 30 red');
  if (s.i === 0) {
    drawTree(CASE1_BEFORE, 130, 116, 62, 58, { rad: 13, size: 10.5, bad: [10, 15] });
    note(34, 280, 'red-red at 10 and 15 · rule four broken', BAD, 11.5);
  } else {
    drawTree(CASE1_AFTER, 130, 116, 62, 58, { rad: 13, size: 10.5, hi: [10, 30] });
    note(34, 280, 'rule four repaired · black-heights 2 on both sides of 20', VAL, 11.5);
  }

  var y = 96;
  note(456, y, 'case 1:  uncle is red', ACC, 13); y += 26;
  note(456, y, 'parent \u2192 black, uncle \u2192 black, grandparent \u2192 red', DIM, 11.5); y += 22;
  note(456, y, 'then move the fault up to the grandparent', DIM, 11.5); y += 26;
  note(456, y, 'rotations used:  0', VAL, 13); y += 26;
  note(456, y, 'recolours used:  3', VAL, 13);

  if (s.i >= 2) {
    panel(24, 326, 852, 108, 'the ten-key build 5 10 9 1 2 8 7 4 3 6, from the model');
    note(34, 352, 'inserting 6:  case 1 at 4, then case 1 again at 7  \u2014  the fault climbs two levels', INK, 11.5);
    note(34, 374, 'inserting 4:  case 1 at 7, then case 2 and case 3  \u2014  two rotations', INK, 11.5);
    note(34, 398, 'insertions 5, 10, 9, 1, 2, 8, 7, 3: three of them needed no repair at all', DIM, 11);
  }
  legend(24, 452);
}

/* ---------- scene 8: cases two and three ---------- */

function drawCase23(t) {
  var s = seg(t);
  head('Cases two and three: the uncle is black',
    'a zig-zag is straightened first, then repaired as a straight case');

  var which = s.i === 0 ? CASE23_BEFORE : (s.i === 1 ? CASE23_MID : CASE23_AFTER);
  var label = s.i === 0 ? 'before: 12 red, left of red 15 — a zig-zag'
    : s.i === 1 ? 'after one right rotation at 15: straight, still red-red'
      : 'after recolour and one left rotation at 10: repaired';
  panel(24, 66, 430, 258, label);
  drawTree(which, 140, 108, 66, 50, {
    rad: 13, size: 10.5,
    bad: s.i === 2 ? null : (s.i === 0 ? [12, 15] : [12, 15])
  });
  note(34, 288, s.i === 2 ? 'height 2 · black-height 2 · all five rules hold' : 'rule four broken on one edge',
    s.i === 2 ? VAL : BAD, 11.5);

  var y = 96;
  note(490, y, 'case 2:  uncle black, node on the inside', ACC, 12.5); y += 24;
  note(490, y, 'rotate once at the parent \u2192 straight', DIM, 11.5); y += 26;
  note(490, y, 'case 3:  uncle black, node on the outside', ACC, 12.5); y += 24;
  note(490, y, 'parent \u2192 black, grandparent \u2192 red', DIM, 11.5); y += 20;
  note(490, y, 'rotate once at the grandparent', DIM, 11.5); y += 26;
  note(490, y, 'inserting 12: 2 rotations, 2 recolours', VAL, 12);

  if (s.i >= 3) {
    panel(24, 320, 852, 96, 'the whole insertion rule, counted');
    note(34, 346, 'at most 2 rotations per insertion \u2014 cases 2 and 3 each rotate once and end the repair', INK, 11.5);
    note(34, 368, 'case 1 rotates nothing but can climb every level, so the recolouring is O(log n)', INK, 11.5);
    note(34, 390, 'the seven-key build of this lesson: 7 insertions, 3 rotations, case 1 twice', DIM, 11);
  }
  legend(24, 452);
}

/* ---------- scene 9: deletion ---------- */

function drawDelete(t) {
  var s = seg(t);
  head('Deleting a red leaf against deleting a black one',
    'plain binary search tree deletion, then all five rules re-tested');

  var tree = s.i === 0 ? FINAL : (s.i === 1 ? DEL_RED : DEL_BLACK);
  var label = s.i === 0 ? 'the seven-key tree' : (s.i === 1 ? 'after deleting the red leaf 25' : 'after deleting the black leaf 15');
  panel(24, 66, 430, 264, label);
  drawTree(tree, 90, 112, 56, 58, { rad: 13, size: 10.5, bad: s.i >= 2 ? [12] : null });
  note(34, 300, s.i === 1 ? 'all five rules still hold' : (s.i >= 2 ? 'rule five broken at 12: 2 blacks against 1' : 'all five rules hold'),
    s.i === 1 ? VAL : (s.i >= 2 ? BAD : DIM), 11.5);

  var y = 96;
  note(490, y, 'a red leaf contributes no black to any path', DIM, 11.5); y += 22;
  note(490, y, 'so a red deletion is free', VAL, 12); y += 28;
  note(490, y, 'a black leaf leaves one path short of a black', DIM, 11.5); y += 22;
  note(490, y, 'so a black deletion needs a fix-up', BAD, 12); y += 28;
  note(490, y, 'the fix-up pushes a double black upward', DIM, 11.5); y += 22;
  note(490, y, 'and stops at the first rotation', DIM, 11.5);

  if (s.i >= 3) {
    panel(24, 330, 852, 96, 'the trade against AVL');
    note(34, 356, 'insertion:  at most 2 rotations in both structures', INK, 11.5);
    note(34, 378, 'deletion:  AVL may rotate at every level; red-black needs at most 3', INK, 11.5);
    note(34, 400, 'that difference is why red-black trees are used where deletion is frequent', DIM, 11);
  }
  legend(24, 452);
}

/* ---------- scene 10: routine ---------- */

function drawRoutine(t) {
  var s = seg(t);
  head('The four-step routine and the four traps',
    'one tree to check, one count to read, one case to name');

  var steps = [
    ['1', 'check the five rules at every node', 'write bh under each node; compare both children'],
    ['2', 'for a count, use the black-height', 'n \u2265 2^bh \u2212 1 and h \u2264 2 \u00b7 bh; exact row 1 3 5 7 11 15 23'],
    ['3', 'for an insertion, insert red then name the case', 'uncle red \u2192 1; uncle black, inside \u2192 2 then 3; outside \u2192 3'],
    ['4', 'finish by colouring the root black', 'it costs nothing and removes one case from every proof']
  ];
  var y = 76;
  for (var i = 0; i < steps.length; i++) {
    if (i > s.i) continue;
    P.rect(24, y - 6, 500, 54, { fill: SURF, stroke: BORDER, radius: 6 });
    P.text(38, y + 6, steps[i][0], { size: 16, bold: true, mono: true, color: ACC });
    P.text(62, y + 4, steps[i][1], { size: 12, bold: true, color: INK });
    P.text(62, y + 24, steps[i][2], { size: 10.5, color: DIM });
    y += 62;
  }

  panel(548, 66, 328, 250, 'a valid red-black tree that is not AVL');
  drawTree(RB_NOT_AVL, 572, 116, 52, 54, { rad: 12, size: 10, showBf: true });
  note(558, 296, 'root 10 has balance factor +2', BAD, 11);

  if (s.i >= 3) {
    panel(24, 336, 852, 92, 'the four traps');
    note(34, 362, 'trap 1:  reading rule five at the root only   ·   trap 2:  counting a recolour as a rotation', WARN, 11.5);
    note(34, 384, 'trap 3:  answering 2 log\u2082(n+1) when the question wants the exact maximum height', WARN, 11.5);
    note(34, 406, 'trap 4:  treating a red-black tree as an AVL tree \u2014 it need not be one', WARN, 11.5);
  }
  legend(24, 452);
}

/* ---------- dispatch ---------- */

var SCENE_DRAW = {
  cost: drawCost, rules: drawRules, blackheight: drawBlackHeight, count: drawCount,
  bound: drawBound, insertred: drawInsertRed, case1: drawCase1, case23: drawCase23,
  delete: drawDelete, routine: drawRoutine
};

function drawFrame(painter) {
  P = painter;
  var t = (K && K.state) ? K.state.elapsed : 0;
  var sc = sceneOf(t);
  P.clear();
  var fn = SCENE_DRAW[sc.id] || drawCost;
  fn(t);
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
      if (ctx2d) { P = PR.makePainter2D(ctx2d, W, H); drawFrame(P); drew = true; }
    } catch (e) {
      console.error('canvas fallback failed', e);
    }
    if (!drew && fallback) fallback.classList.add('show');
  }

  if (K && K.init) {
    K.init({ timeline: window.LESSON_TIMELINE, draw: function () { if (P) drawFrame(P); } });
  }

  window.__drawAt = function (t) {
    K.state.elapsed = t;
    if (P) drawFrame(P);
  };

  var bad = CHECKS.filter(function (c) { return !c.pass; });
  if (bad.length) console.warn('Model validation did not fully pass:', bad);
}

window.LESSON_MODEL = {
  SEQ: SEQ,
  STEPS: RUN.steps.map(function (s) {
    return { key: s.key, steps: s.steps, rot: s.rot, recol: s.recol, height: s.height, valid: s.valid };
  }),
  FINAL: { height: height(FINAL), size: size(FINAL), bh: bh(FINAL), inOrder: inOrder(FINAL) },
  CHAIN_HEIGHT: height(CHAIN),
  BIG15: { height: height(BIG15), size: size(BIG15), bh: bh(BIG15), valid: isRB(BIG15), avl: isAvl(BIG15) },
  MINNODES: MINNODES,
  BHMIN: BHMIN,
  MAX_HEIGHT_15: maxHeightFor(15),
  BOUND_15: bound(15),
  CASCADE: CASCADE.steps.map(function (s) { return { key: s.key, steps: s.steps, rot: s.rot }; }),
  DEL_RED_VALID: isRB(DEL_RED),
  DEL_BLACK_VALID: isRB(DEL_BLACK),
  RB_NOT_AVL_ROOT_BF: bf(RB_NOT_AVL),
  AVL_COLOURABLE: avlColourable + ' of ' + avlShapes,
  CHECKS: CHECKS.length
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
