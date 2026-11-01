/* ==========================================================================
   red-black-deletion — lesson.js
   Four layers, in order:
     1. THE MODEL   — a real red-black tree with a NIL sentinel, CLRS insertion
                      and CLRS deletion (13.4), every fix-up case logged, all
                      five rules re-tested after every single operation, plus a
                      plain deletion that skips the fix-up so the deficit can be
                      seen. An exhaustive sweep over every insertion order of up
                      to six keys measures the case sequences and rotation counts.
     2. THE CHECKS  — every claim the lesson makes, re-verified at load.
     3. RENDER      — reads the model; never re-derives a value.
     4. BOOT        — p5.js first, the browser's own canvas as the fallback.

   Every number on the canvas and in every caption comes from this file.
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
  var WARMDIM = WARNDIM;
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

/* one shared sentinel, as CLRS uses. nil.p is written by transplant, which is
   what lets the fix-up know the parent of a missing child. */
function makeNil() {
  var n = { nil: true, k: null, c: BLACK, l: null, r: null, p: null };
  n.l = n; n.r = n;
  return n;
}

function newTree() {
  var NIL = makeNil();
  return { nil: NIL, root: NIL };
}

function nd(T, k, c) { return { nil: false, k: k, c: c || RED, l: T.nil, r: T.nil, p: T.nil }; }
function isNil(T, x) { return !x || x.nil === true; }

function pathBlacks(T, x) {
  return isNil(T, x) ? 1 : (x.c === BLACK ? 1 : 0) + pathBlacks(T, x.l);
}
function bhOf(T, x) { return isNil(T, x) ? 0 : pathBlacks(T, x.l); }
function heightOf(T, x) {
  if (isNil(T, x)) return -1;
  return 1 + Math.max(heightOf(T, x.l), heightOf(T, x.r));
}
function sizeOf(T, x) { return isNil(T, x) ? 0 : 1 + sizeOf(T, x.l) + sizeOf(T, x.r); }
function inOrder(T, x, out) {
  out = out || [];
  if (isNil(T, x)) return out;
  inOrder(T, x.l, out); out.push(x.k); inOrder(T, x.r, out);
  return out;
}
function findKey(T, k) {
  var x = T.root;
  while (!isNil(T, x) && x.k !== k) x = (k < x.k) ? x.l : x.r;
  return x;
}
function minimum(T, x) { while (!isNil(T, x.l)) x = x.l; return x; }

function isBst(T, x, lo, hi) {
  if (isNil(T, x)) return true;
  if (lo != null && x.k <= lo) return false;
  if (hi != null && x.k >= hi) return false;
  return isBst(T, x.l, lo, x.k) && isBst(T, x.r, x.k, hi);
}
function noRedRed(T, x) {
  if (isNil(T, x)) return true;
  if (x.c === RED && ((!isNil(T, x.l) && x.l.c === RED) || (!isNil(T, x.r) && x.r.c === RED))) return false;
  return noRedRed(T, x.l) && noRedRed(T, x.r);
}
function bhOk(T, x) {
  if (isNil(T, x)) return true;
  if (pathBlacks(T, x.l) !== pathBlacks(T, x.r)) return false;
  return bhOk(T, x.l) && bhOk(T, x.r);
}
function rules(T) {
  return {
    bst: isBst(T, T.root, null, null),
    root: isNil(T, T.root) || T.root.c === BLACK,
    nored: noRedRed(T, T.root),
    bh: bhOk(T, T.root)
  };
}
function valid(T) {
  var r = rules(T);
  return r.bst && r.root && r.nored && r.bh;
}

/* the first node at which rule five fails, or null */
function firstBhBreak(T) {
  var out = null;
  (function walk(x) {
    if (out || isNil(T, x)) return;
    if (pathBlacks(T, x.l) !== pathBlacks(T, x.r)) { out = x; return; }
    walk(x.l); walk(x.r);
  })(T.root);
  return out;
}

/* a faithful deep copy (the two-pass version above is not needed) */
function copy(T) {
  var C = newTree();
  function walk(x, p) {
    if (isNil(T, x)) { return C.nil; }
    var n = nd(C, x.k, x.c);
    n.p = p;
    n.l = walk(x.l, n);
    n.r = walk(x.r, n);
    return n;
  }
  C.root = walk(T.root, C.nil);
  C.root.p = C.nil;
  return C;
}

function rotateLeft(T, x) {
  var y = x.r;
  x.r = y.l;
  if (!isNil(T, y.l)) y.l.p = x;
  y.p = x.p;
  if (isNil(T, x.p)) T.root = y;
  else if (x === x.p.l) x.p.l = y;
  else x.p.r = y;
  y.l = x;
  x.p = y;
}

function rotateRight(T, x) {
  var y = x.l;
  x.l = y.r;
  if (!isNil(T, y.r)) y.r.p = x;
  y.p = x.p;
  if (isNil(T, x.p)) T.root = y;
  else if (x === x.p.r) x.p.r = y;
  else x.p.l = y;
  y.r = x;
  x.p = y;
}

function transplant(T, u, v) {
  if (isNil(T, u.p)) T.root = v;
  else if (u === u.p.l) u.p.l = v;
  else u.p.r = v;
  v.p = u.p;
}

/* ---------- insertion (CLRS 13.3), used only to build trees ---------- */

function insertKey(T, k) {
  var z = nd(T, k, RED), y = T.nil, x = T.root;
  while (!isNil(T, x)) {
    y = x;
    x = (k < x.k) ? x.l : x.r;
  }
  z.p = y;
  if (isNil(T, y)) T.root = z;
  else if (k < y.k) y.l = z;
  else y.r = z;
  insertFix(T, z);
}

function insertFix(T, z) {
  while (z.p.c === RED) {
    var gp = z.p.p;
    if (z.p === gp.l) {
      var u = gp.r;
      if (u.c === RED) { z.p.c = BLACK; u.c = BLACK; gp.c = RED; z = gp; }
      else {
        if (z === z.p.r) { z = z.p; rotateLeft(T, z); }
        z.p.c = BLACK; z.p.p.c = RED; rotateRight(T, z.p.p);
      }
    } else {
      var u2 = gp.l;
      if (u2.c === RED) { z.p.c = BLACK; u2.c = BLACK; gp.c = RED; z = gp; }
      else {
        if (z === z.p.l) { z = z.p; rotateRight(T, z); }
        z.p.c = BLACK; z.p.p.c = RED; rotateLeft(T, z.p.p);
      }
    }
  }
  T.root.c = BLACK;
}

function build(keys) {
  var T = newTree();
  for (var i = 0; i < keys.length; i++) insertKey(T, keys[i]);
  return T;
}

/* a literal tree, written as a nested spec: {k, c, l, r} or null */
function literal(T, spec) {
  if (!spec) return T.nil;
  var n = nd(T, spec.k, spec.c);
  n.l = literal(T, spec.l);
  n.r = literal(T, spec.r);
  if (!isNil(T, n.l)) n.l.p = n;
  if (!isNil(T, n.r)) n.r.p = n;
  return n;
}
function buildLiteral(spec) {
  var T = newTree();
  T.root = literal(T, spec);
  T.root.p = T.nil;
  return T;
}

/* ---------- deletion (CLRS 13.4) ---------- */

function deleteKey(T, k, opts) {
  opts = opts || {};
  var z = findKey(T, k);
  if (isNil(T, z)) return null;

  var rec = {
    key: k, cases: [], rots: 0, recol: 0, yColor: null, successor: null,
    fixup: false, validAfter: null, heightBefore: heightOf(T, T.root),
    bhBefore: bhOf(T, T.root), sizeBefore: sizeOf(T, T.root)
  };

  var y = z, yOrig = y.c, x;

  if (isNil(T, z.l)) {
    x = z.r;
    transplant(T, z, z.r);
  } else if (isNil(T, z.r)) {
    x = z.l;
    transplant(T, z, z.l);
  } else {
    y = minimum(T, z.r);
    rec.successor = y.k;
    yOrig = y.c;
    x = y.r;
    if (y.p === z) {
      x.p = y;
    } else {
      transplant(T, y, y.r);
      y.r = z.r;
      y.r.p = y;
    }
    transplant(T, z, y);
    y.l = z.l;
    y.l.p = y;
    y.c = z.c;
  }

  rec.yColor = yOrig;
  rec.movedColor = (rec.successor != null) ? y.c : null;

  if (opts.stopBeforeFixup) {
    rec.validAfter = valid(T);
    return rec;
  }

  if (yOrig === BLACK) {
    rec.fixup = true;
    deleteFix(T, x, rec);
  }
  rec.validAfter = valid(T);
  rec.heightAfter = heightOf(T, T.root);
  rec.bhAfter = bhOf(T, T.root);
  rec.sizeAfter = sizeOf(T, T.root);
  return rec;
}

/* the fix-up. Cases are appended in the order they fire. */
function deleteFix(T, x, rec) {
  while (x !== T.root && x.c === BLACK) {
    if (x === x.p.l) {
      var w = x.p.r;
      if (w.c === RED) {
        rec.cases.push(1);
        w.c = BLACK; x.p.c = RED; rec.recol += 2;
        rotateLeft(T, x.p); rec.rots++;
        w = x.p.r;
      }
      if (w.l.c === BLACK && w.r.c === BLACK) {
        rec.cases.push(2);
        w.c = RED; rec.recol++;
        x = x.p;
      } else {
        if (w.r.c === BLACK) {
          rec.cases.push(3);
          w.l.c = BLACK; w.c = RED; rec.recol += 2;
          rotateRight(T, w); rec.rots++;
          w = x.p.r;
        }
        rec.cases.push(4);
        w.c = x.p.c; x.p.c = BLACK; w.r.c = BLACK; rec.recol += 3;
        rotateLeft(T, x.p); rec.rots++;
        x = T.root;
      }
    } else {
      var w2 = x.p.l;
      if (w2.c === RED) {
        rec.cases.push(1);
        w2.c = BLACK; x.p.c = RED; rec.recol += 2;
        rotateRight(T, x.p); rec.rots++;
        w2 = x.p.l;
      }
      if (w2.l.c === BLACK && w2.r.c === BLACK) {
        rec.cases.push(2);
        w2.c = RED; rec.recol++;
        x = x.p;
      } else {
        if (w2.l.c === BLACK) {
          rec.cases.push(3);
          w2.r.c = BLACK; w2.c = RED; rec.recol += 2;
          rotateLeft(T, w2); rec.rots++;
          w2 = x.p.l;
        }
        rec.cases.push(4);
        w2.c = x.p.c; x.p.c = BLACK; w2.l.c = BLACK; rec.recol += 3;
        rotateRight(T, x.p); rec.rots++;
        x = T.root;
      }
    }
  }
  if (x.c === RED) { x.c = BLACK; rec.recol++; }
}

/* plain binary-search-tree deletion: the transplant, no fix-up */
function deletePlain(T, k) {
  var z = findKey(T, k);
  if (isNil(T, z)) return null;
  var y = z, yOrig = y.c;
  if (isNil(T, z.l)) transplant(T, z, z.r);
  else if (isNil(T, z.r)) transplant(T, z, z.l);
  else {
    y = minimum(T, z.r);
    yOrig = y.c;
    if (y.p !== z) { transplant(T, y, y.r); y.r = z.r; y.r.p = y; }
    transplant(T, z, y);
    y.l = z.l; y.l.p = y; y.c = z.c;
  }
  return { key: k, yColor: yOrig, validAfter: valid(T), breakAt: firstBhBreak(T) };
}

/* ======================================================================
   THE TREES AND TRACES THE LESSON USES
   ====================================================================== */

/* the seven-key tree the sibling lesson also uses */
var SEVEN = build([10, 20, 30, 15, 25, 12, 5]);

/* 1. deleting a red leaf: no fix-up at all */
var RED_LEAF = copy(SEVEN);
var RED_LEAF_REC = deleteKey(RED_LEAF, 25);

/* 2. deleting a black leaf with the fix-up skipped: rule five breaks */
var PLAIN = copy(SEVEN);
var PLAIN_REC = deletePlain(PLAIN, 15);
var PLAIN_BREAK = firstBhBreak(PLAIN);

/* 3. the same deletion with the fix-up: case 4 */
var BLACK_LEAF = copy(SEVEN);
var BLACK_LEAF_REC = deleteKey(BLACK_LEAF, 15);

/* 4. a node with two children: the successor moves, the deficit stays behind */
var TWO_KIDS_STOP = copy(SEVEN);
var TWO_KIDS_REC_STOP = deleteKey(TWO_KIDS_STOP, 12, { stopBeforeFixup: true });
var TWO_KIDS = copy(SEVEN);
var TWO_KIDS_REC = deleteKey(TWO_KIDS, 12);

/* 5. case 1 (then case 2): insert 1..6, delete 1 */
var C1 = build([1, 2, 3, 4, 5, 6]);
var C1_BEFORE = copy(C1);
var C1_REC = deleteKey(C1, 1);

/* 6. case 2 twice: the all-black perfect tree, delete 2 */
var C2_SPEC = { k: 8, c: BLACK,
  l: { k: 4, c: BLACK, l: { k: 2, c: BLACK }, r: { k: 6, c: BLACK } },
  r: { k: 12, c: BLACK, l: { k: 10, c: BLACK }, r: { k: 14, c: BLACK } } };
var C2 = buildLiteral(C2_SPEC);
var C2_BEFORE = copy(C2);
var C2_REC = deleteKey(C2, 2);

/* 7. case 3 then case 4: insert 1, 2, 4, 3, delete 1 */
var C3 = build([1, 2, 4, 3]);
var C3_BEFORE = copy(C3);
var C3_REC = deleteKey(C3, 1);

/* 8. case 4 alone: insert 1, 2, 3, 4, delete 1 */
var C4 = build([1, 2, 3, 4]);
var C4_BEFORE = copy(C4);
var C4_REC = deleteKey(C4, 1);

/* 9. four deletions from one ten-key tree */
var TRACE_SEQ = [5, 10, 9, 1, 2, 8, 7, 4, 3, 6];
var TRACE = build(TRACE_SEQ);
var TRACE_BUILD_HEIGHT = heightOf(TRACE, TRACE.root);
var TRACE_STEPS = [];
[9, 1, 7, 4].forEach(function (k) {
  var r = deleteKey(TRACE, k);
  TRACE_STEPS.push(r);
});

/* 10. the exhaustive sweep: every insertion order of up to six keys, and
   every deletion from it. This is where the rotation bound is measured. */
var SWEEP = (function () {
  var seqCount = {}, total = 0, withCase = 0, noneCount = 0, maxRot = 0, atMax = 0;
  var rotCount = { 0: 0, 1: 0, 2: 0, 3: 0 };
  var perms;
  for (var n = 1; n <= 6; n++) {
    perms = [];
    (function gen2(cur, used) {
      if (cur.length === n) { perms.push(cur.slice()); return; }
      for (var i = 1; i <= n; i++) {
        if (used[i]) continue;
        used[i] = true; cur.push(i);
        gen2(cur, used);
        cur.pop(); used[i] = false;
      }
    })([], {});
    for (var p = 0; p < perms.length; p++) {
      for (var d = 0; d < n; d++) {
        var T = build(perms[p]);
        var rec = deleteKey(T, perms[p][d]);
        if (!rec) continue;
        total++;
        var key = rec.cases.length ? rec.cases.join('') : 'none';
        seqCount[key] = (seqCount[key] || 0) + 1;
        if (rec.cases.length) withCase++; else noneCount++;
        rotCount[rec.rots] = (rotCount[rec.rots] || 0) + 1;
        if (rec.rots > maxRot) maxRot = rec.rots;
      }
    }
  }
  atMax = rotCount[3] || 0;
  return {
    total: total, withCase: withCase, noneCount: noneCount,
    seqCount: seqCount, rotCount: rotCount, maxRot: maxRot, atMax: atMax,
    sequences: Object.keys(seqCount).filter(function (k) { return k !== 'none'; })
      .sort(function (a, b) { return a.length - b.length || a.localeCompare(b); })
  };
})();

/* ======================================================================
   LAYER 2 — THE CHECKS
   ====================================================================== */

chk('the seven-key build is a valid red-black tree', valid(SEVEN),
  'height ' + heightOf(SEVEN, SEVEN.root) + ', bh ' + bhOf(SEVEN, SEVEN.root));
chk('the seven-key build holds 5 10 12 15 20 25 30',
  inOrder(SEVEN, SEVEN.root).join(' ') === '5 10 12 15 20 25 30');
chk('its height is 3 and its black-height is 2',
  heightOf(SEVEN, SEVEN.root) === 3 && bhOf(SEVEN, SEVEN.root) === 2);

chk('deleting the red leaf 25 fires no case', RED_LEAF_REC.cases.length === 0,
  'y colour ' + RED_LEAF_REC.yColor);
chk('deleting the red leaf 25 needs no fix-up', RED_LEAF_REC.fixup === false);
chk('the tree after deleting the red leaf is still valid', valid(RED_LEAF));
chk('its height is unchanged at 3', heightOf(RED_LEAF, RED_LEAF.root) === 3);

chk('a plain deletion of 15 breaks rule five', PLAIN_REC.validAfter === false);
chk('the rule-five break is at node 12', PLAIN_BREAK && PLAIN_BREAK.k === 12,
  PLAIN_BREAK ? 'node ' + PLAIN_BREAK.k : 'none');
chk('at 12 the left path holds 2 blacks and the right path 1',
  PLAIN_BREAK && pathBlacks(PLAIN, PLAIN_BREAK.l) === 2 && pathBlacks(PLAIN, PLAIN_BREAK.r) === 1);
chk('the plain deletion breaks no other rule',
  PLAIN_REC.validAfter === false && rules(PLAIN).bst && rules(PLAIN).root && rules(PLAIN).nored);

chk('the same deletion with the fix-up fires case 4 only',
  BLACK_LEAF_REC.cases.join('') === '4', BLACK_LEAF_REC.cases.join(','));
chk('it performs exactly one rotation', BLACK_LEAF_REC.rots === 1);
chk('and the result is valid', valid(BLACK_LEAF));
chk('the tree is now one level shorter', heightOf(BLACK_LEAF, BLACK_LEAF.root) === 2);

chk('deleting 12 from the seven-key tree picks successor 15', TWO_KIDS_REC.successor === 15);
chk('the successor was black, so a fix-up runs', TWO_KIDS_REC.yColor === BLACK);
chk('the promoted successor takes the deleted node\'s red',
  TWO_KIDS_REC_STOP.movedColor === RED);
chk('after the splice the successor 15 sits where 12 stood',
  TWO_KIDS_REC_STOP.successor === 15 && TWO_KIDS_STOP.root.l.k === 15);
chk('the deficit sits under the successor, not under the deleted key',
  isNil(TWO_KIDS_STOP, TWO_KIDS_STOP.root.l.r));
chk('the finished two-children deletion is valid and fires case 4',
  valid(TWO_KIDS) && TWO_KIDS_REC.cases.join('') === '4');

chk('case 1 example: deleting 1 from 1..6 fires cases 1 then 2',
  C1_REC.cases.join('') === '12', C1_REC.cases.join(','));
chk('case 1 example: one rotation, and a valid result',
  C1_REC.rots === 1 && valid(C1));
chk('case 1 example: the sibling was red, which is what starts case 1',
  C1_BEFORE.root.r.c === RED);
chk('case 1 example: the tree loses one level', heightOf(C1, C1.root) === 2);

chk('case 2 example: the all-black perfect tree is valid', valid(C2_BEFORE));
chk('case 2 example: deleting 2 fires case 2 twice',
  C2_REC.cases.join('') === '22', C2_REC.cases.join(','));
chk('case 2 example: no rotation at all', C2_REC.rots === 0);
chk('case 2 example: the root black-height falls from 3 to 2',
  bhOf(C2_BEFORE, C2_BEFORE.root) === 3 && bhOf(C2, C2.root) === 2);
chk('case 2 example: the height stays at 2',
  heightOf(C2_BEFORE, C2_BEFORE.root) === 2 && heightOf(C2, C2.root) === 2);

chk('case 3 example: deleting 1 from 1,2,4,3 fires cases 3 then 4',
  C3_REC.cases.join('') === '34', C3_REC.cases.join(','));
chk('case 3 example: two rotations', C3_REC.rots === 2);
chk('case 3 example: the near nephew 3 was red and the far nephew black',
  C3_BEFORE.root.r.l.c === RED && isNil(C3_BEFORE, C3_BEFORE.root.r.r));
chk('case 3 example: the result is valid', valid(C3));

chk('case 4 example: deleting 1 from 1,2,3,4 fires case 4 only',
  C4_REC.cases.join('') === '4', C4_REC.cases.join(','));
chk('case 4 example: one rotation and a valid result',
  C4_REC.rots === 1 && valid(C4));
chk('case 4 example: the far nephew 4 was red',
  C4_BEFORE.root.r.r.c === RED);

chk('the ten-key trace build is valid', TRACE_STEPS.length === 4);
chk('trace step 1: deleting 9 fires cases 2, 3, 4',
  TRACE_STEPS[0].cases.join('') === '234', TRACE_STEPS[0].cases.join(','));
chk('trace step 1: two rotations and successor 10',
  TRACE_STEPS[0].rots === 2 && TRACE_STEPS[0].successor === 10);
chk('trace step 2: deleting 1 fires case 2 twice with no rotation',
  TRACE_STEPS[1].cases.join('') === '22' && TRACE_STEPS[1].rots === 0);
chk('trace step 3: deleting 7 needs no fix-up because the successor was red',
  TRACE_STEPS[2].fixup === false && TRACE_STEPS[2].yColor === RED);
chk('trace step 4: deleting 4 fires no case but does recolour',
  TRACE_STEPS[3].fixup === true && TRACE_STEPS[3].cases.length === 0);
chk('every trace step leaves a valid tree',
  TRACE_STEPS.every(function (r) { return r.validAfter; }));

chk('the sweep examined every insertion order of up to six keys',
  SWEEP.total === 5039, SWEEP.total + ' deletions');
chk('the sweep never needed more than three rotations', SWEEP.maxRot === 3,
  'max ' + SWEEP.maxRot);
chk('the sweep found five distinct case sequences', SWEEP.sequences.length === 5,
  SWEEP.sequences.join(' / '));
chk('the sweep found no bare case 1', !SWEEP.seqCount['1']);
chk('the sweep found no bare case 3', !SWEEP.seqCount['3']);
chk('the sweep\'s three-rotation deletions are exactly the 1,3,4 ones',
  SWEEP.rotCount[3] === (SWEEP.seqCount['134'] || 0), SWEEP.rotCount[3] + ' of them');
chk('every rotation count is 0, 1, 2 or 3',
  Object.keys(SWEEP.rotCount).every(function (k) { return Number(k) <= 3; }));

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
function note(x, y, s, colour, size) {
  P.text(x, y, s, { size: size || 12, color: colour || DIM });
}

/* ---------- tree geometry ---------- */

/* a drawing spec: null for a NIL, else {k, c, l, r, mark} */
function specOf(T, x, markSet) {
  if (isNil(T, x)) return null;
  return {
    k: x.k, c: x.c,
    mark: markSet && markSet.indexOf(x.k) >= 0,
    l: specOf(T, x.l, markSet), r: specOf(T, x.r, markSet)
  };
}

function place(root, x0, y0, dx, dy) {
  var nodes = [], edges = [], i = 0;
  (function walk(n, depth, parent) {
    if (!n) return;
    walk(n.l, depth + 1, n);
    var rec = { key: n.k, col: n.c, depth: depth, i: i++, node: n, mark: n.mark };
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

/* colour is never the only signal: each node prints R or B under its key */
function drawTree(T, x0, y0, dx, dy, opts) {
  opts = opts || {};
  var spec = opts.spec !== undefined ? opts.spec : specOf(T, T.root, opts.mark);
  var L = place(spec, x0, y0, dx, dy);
  var r = opts.rad || 14;
  L.edges.forEach(function (e) {
    P.line(e.x1, e.y1, e.x2, e.y2, { stroke: opts.edge || BORDER, sw: 1.3 });
  });
  L.nodes.forEach(function (n) {
    var red = n.col === RED;
    var fill = red ? INVALIDDIM : INK;
    var stroke = red ? BAD : INK;
    if (n.mark) { fill = WARNDIM; stroke = WARN; }
    if (opts.hi && opts.hi.indexOf(n.key) >= 0) { fill = ACCDIM; stroke = ACC; }
    P.circle(n.x, n.y, r * 2, { fill: fill, stroke: stroke, sw: n.mark || (opts.hi && opts.hi.indexOf(n.key) >= 0) ? 2.2 : 1.3 });
    P.text(n.x, n.y - 6, String(n.key), {
      size: (opts.size || 11) - 1, bold: true, align: 'center', color: red ? BAD : WHITE
    });
    P.text(n.x, n.y + 7, red ? 'R' : 'B', {
      size: 6.5, mono: true, align: 'center', color: red ? BAD : '#c9d4dc'
    });
    if (opts.showBh) {
      P.text(n.x, n.y + r + 3, 'bh' + bhOf(T, nodeAt(T, n.key)), { size: 8, mono: true, align: 'center', color: FAINT });
    }
  });
  return L;
}
function nodeAt(T, k) { return findKey(T, k); }

/* the NIL leaves drawn as small black squares, plus an optional marked one */
function nilLeaves(T, x0, y0, dx, dy, rad, opts) {
  opts = opts || {};
  var spec = specOf(T, T.root, null);
  var L = place(spec, x0, y0, dx, dy);
  L.nodes.forEach(function (n) {
    var missingL = !n.node.l, missingR = !n.node.r;
    if (missingL) P.rect(n.x - rad - 6, n.y + 20, 10, 10, { fill: INK, radius: 2 });
    if (missingR) {
      var hot = opts.deficitUnder === n.key;
      P.rect(n.x + rad - 4, n.y + 20, 10, 10, { fill: hot ? WARNDIM : INK, stroke: hot ? WARN : null, sw: hot ? 2 : 1, radius: 2 });
    }
  });
}

function legend(x, y) {
  P.circle(x, y, 9, { fill: INK, stroke: INK });
  P.text(x, y + 2, 'B', { size: 7, mono: true, align: 'center', color: WHITE });
  P.text(x + 13, y - 5, 'black node', { size: 10, color: DIM });
  P.circle(x + 96, y, 9, { fill: INVALIDDIM, stroke: BAD });
  P.text(x + 96, y + 2, 'R', { size: 7, mono: true, align: 'center', color: BAD });
  P.text(x + 109, y - 5, 'red node', { size: 10, color: DIM });
  P.rect(x + 180, y - 5, 10, 10, { fill: INK, radius: 2 });
  P.text(x + 196, y - 5, 'NIL leaf', { size: 10, color: DIM });
}

/* ---------- scene 1: the deficit ---------- */

function drawDeficit(t) {
  var s = seg(t);
  head('Deleting is an accounting problem, not a shape problem',
    'one deletion breaks nothing; the other breaks exactly one rule');

  panel(24, 66, 412, 300, 'delete the red leaf 25');
  if (s.i === 0) {
    drawTree(SEVEN, 78, 108, 56, 58, { rad: 13, size: 10.5, hi: [25] });
    nilLeaves(SEVEN, 78, 108, 56, 58, 13);
  } else {
    drawTree(RED_LEAF, 78, 108, 56, 58, { rad: 13, size: 10.5 });
    nilLeaves(RED_LEAF, 78, 108, 56, 58, 13);
  }
  if (s.i === 0) note(34, 344, 'seven keys, height 3, black-height 2', DIM, 11.5);
  if (s.i >= 1) note(34, 344, 'no fix-up: no path lost a black · all five rules hold', VAL, 11.5);
  if (s.i >= 2) note(34, 362, 'height 3, black-height 2, unchanged', DIM, 11.5);

  panel(456, 66, 420, 300, 'delete the black leaf 15, fix-up skipped');
  drawTree(PLAIN, 556, 108, 62, 58, { rad: 13, size: 10.5, hi: [12] });
  if (s.i >= 2) {
    note(466, 300, 'at node 12 the left path holds 2 blacks, the right path 1', BAD, 11.5);
    note(466, 322, 'rule 5 fails · rules 1 to 4 still hold', BAD, 11.5);
    note(466, 344, 'this is the deficit: one black missing on every path through 15', WARN, 11.5);
  }
  if (s.i >= 3) {
    note(24, 378, 'only rule five can break. Rules one to four are about colours, and a deletion', DIM, 12);
    note(24, 396, 'removes a node without creating a red-red edge or changing the root.', DIM, 12);
  }
  legend(24, 434);
  note(400, 430, 'every later scene repairs exactly this one deficit', FAINT, 11);
}

/* ---------- scene 2: where the deletion happens ---------- */

function drawWhere(t) {
  var s = seg(t);
  head('Where the deletion actually happens',
    'delete 12 from the seven-key tree: two children, so a successor moves');

  panel(24, 66, 412, 316, s.i >= 2 ? 'after the splice, before any repair' : 'before: delete 12');
  if (s.i < 2) {
    drawTree(SEVEN, 78, 112, 56, 60, { rad: 13, size: 10.5, hi: s.i >= 1 ? [12, 15] : [12] });
  } else {
    drawTree(TWO_KIDS_STOP, 78, 112, 56, 60, { rad: 13, size: 10.5, hi: [15] });
    nilLeaves(TWO_KIDS_STOP, 78, 112, 56, 60, 13, { deficitUnder: 15 });
    note(34, 352, 'the deficit is the small square under 15, not the place 12 stood', WARN, 11.5);
  }

  var rows = [
    ['1', 'find the key; 12 has two children'],
    ['2', 'the successor is the leftmost key on the right: 15'],
    ['3', '15 moves up and takes 12\'s colour, which was red'],
    ['4', 'the missing black is at 15\'s old position: its right NIL']
  ];
  var y = 84;
  for (var i = 0; i < rows.length; i++) {
    if (i > s.i) continue;
    var hot = i === s.i;
    P.rect(456, y - 4, 420, 52, { fill: hot ? WARMDIM : SURF, stroke: hot ? WARN : BORDER, radius: 6, sw: hot ? 1.8 : 1 });
    P.text(468, y + 6, rows[i][0], { size: 15, bold: true, mono: true, color: hot ? WARN : ACC });
    P.text(492, y + 7, rows[i][1], { size: 11, color: hot ? WARN : INK });
    y += 62;
  }
  if (s.i >= 2) {
    note(456, y + 4, 'the successor was black, so a fix-up runs', VAL, 11.5);
    note(456, y + 24, 'had it been red, the deletion would already be finished', DIM, 11.5);
  }
  if (s.i >= 3) {
    note(24, 400, 'the key that leaves the tree is 15, not 12 — and the repair starts under 15', ACC, 12);
  }
  legend(24, 434);
  note(430, 430, 'the deleted key is only a label: the work follows the moved node', FAINT, 11);
}

/* ---------- scene 3: the extra black ---------- */

function drawExtra(t) {
  var s = seg(t);
  head('The extra black, and the three ways the loop ends',
    'x is one black short; the fix-up either moves that debt up or cancels it');

  panel(24, 66, 400, 250, 'the accounting, not a third colour');
  P.circle(200, 130, 54, { fill: INK, stroke: INK });
  P.text(200, 126, 'x', { size: 15, bold: true, align: 'center', color: WHITE });
  P.text(200, 144, 'B + extra', { size: 8, mono: true, align: 'center', color: '#c9d4dc' });
  P.line(200, 157, 200, 196, { stroke: BORDER, sw: 1.4 });
  P.rect(150, 196, 100, 34, { fill: WARNDIM, stroke: WARN, radius: 6 });
  P.text(200, 218, 'one black short', { size: 10, mono: true, align: 'center', color: WARN });
  if (s.i >= 1) {
    note(34, 262, 'the extra black is bookkeeping: nothing is stored,', DIM, 11.5);
    note(34, 282, 'and the debt lives in the loop variable.', DIM, 11.5);
  }

  var exits = [
    ['x is red', 'colour it black and stop — the debt is absorbed'],
    ['x is the root', 'drop the debt: every path loses one black equally'],
    ['a rotation case fires', 'cases 1, 3 and 4 finish or convert; case 4 ends it']
  ];
  var y = 84;
  for (var i = 0; i < exits.length; i++) {
    if (i > s.i) continue;
    var hot = i === s.i;
    P.rect(456, y - 4, 420, 56, { fill: hot ? ACCDIM : SURF, stroke: hot ? ACC : BORDER, radius: 6, sw: hot ? 1.8 : 1 });
    P.text(468, y + 8, exits[i][0], { size: 12, bold: true, color: hot ? ACC : INK });
    P.text(468, y + 28, exits[i][1], { size: 11, color: DIM });
    y += 66;
  }
  if (s.i >= 2) {
    note(456, y + 2, 'x may be the NIL sentinel, so the code keeps x\'s parent', INFO, 11.5);
    note(456, y + 22, 'the sibling is never NIL: that path would be one black short already', INFO, 11.5);
  }
  if (s.i >= 3) {
    note(24, 342, 'the invariant that makes this work: every path other than the one through x', ACC, 12);
    note(24, 362, 'already carries the right number of blacks, so only x\'s path is short.', ACC, 12);
  }
  legend(24, 434);
  note(400, 430, 'the debt moves up; it never multiplies', FAINT, 11);
}

/* ---------- scene 4: case 1 ---------- */

function drawCase1(t) {
  var s = seg(t);
  head('Case 1: the sibling is red, so convert it to a black sibling',
    'insert 1 2 3 4 5 6, then delete 1 — cases 1 then 2, one rotation');

  panel(24, 66, 400, 306, 'before: delete 1');
  if (s.i === 0) {
    drawTree(C1_BEFORE, 96, 108, 62, 56, { rad: 13, size: 10.5, hi: [1] });
    nilLeaves(C1_BEFORE, 96, 108, 62, 56, 13);
  } else {
    drawTree(C1_BEFORE, 96, 108, 62, 56, { rad: 13, size: 10.5, hi: [4, 2] });
    nilLeaves(C1_BEFORE, 96, 108, 62, 56, 13);
  }
  if (s.i === 0) note(34, 344, 'x is the NIL left child of 1 · its sibling is 4, which is red', DIM, 11.5);
  if (s.i >= 1) note(34, 344, 'sibling 4 is red: recolour 4 black and 2 red, rotate left at 2', WARN, 11.5);
  if (s.i >= 2) note(34, 362, 'the new sibling is 3, black with two black children → case 2', DIM, 11.5);

  panel(456, 66, 420, 306, 'after the whole repair');
  if (s.i >= 2) {
    drawTree(C1, 556, 108, 66, 58, { rad: 13, size: 10.5, hi: [3] });
    nilLeaves(C1, 556, 108, 66, 58, 13);
    note(466, 320, 'cases fired: ' + C1_REC.cases.join(', ') + ' · rotations: ' + C1_REC.rots, VAL, 11.5);
    note(466, 340, 'height 3 → 2, all five rules hold', DIM, 11.5);
  } else {
    note(466, 108, 'case 1 never ends a deletion.', INK, 12);
    note(466, 128, 'It buys a black sibling and hands over', DIM, 11.5);
    note(466, 148, 'to case 2, 3 or 4 — always.', DIM, 11.5);
  }
  if (s.i >= 3) {
    note(24, 388, 'counting rule: case 1 spends one rotation and finishes nothing', ACC, 12);
  }
  legend(24, 434);
  note(430, 430, 'the red sibling is the debt\'s camouflage, not its cure', FAINT, 11);
}

/* ---------- scene 5: case 2 ---------- */

function drawCase2(t) {
  var s = seg(t);
  head('Case 2: both nephews black — recolour the sibling and climb',
    'the all-black perfect tree of seven keys, delete 2 — case 2 twice, no rotation');

  panel(24, 66, 400, 306, s.i >= 1 ? 'after the repair' : 'before: delete 2');
  if (s.i === 0) {
    drawTree(C2_BEFORE, 96, 112, 62, 62, { rad: 13, size: 10.5, hi: [2] });
    nilLeaves(C2_BEFORE, 96, 112, 62, 62, 13);
    note(34, 350, 'every node black · black-height 3 at the root', DIM, 11.5);
  } else {
    drawTree(C2, 96, 112, 62, 62, { rad: 13, size: 10.5, hi: [6, 12] });
    nilLeaves(C2, 96, 112, 62, 62, 13);
    note(34, 350, 'black-height at the root: 3 → 2 · height still 2', VAL, 11.5);
  }

  var rows = [
    ['1', 'sibling 6 is black, both its children are NIL, so black'],
    ['2', 'recolour 6 red: now both sides of 4 are one short'],
    ['3', 'move x up to 4; sibling 12 has black children too'],
    ['4', 'recolour 12 red and move x to the root: the debt is dropped']
  ];
  var y = 84;
  for (var i = 0; i < rows.length; i++) {
    if (i > s.i) continue;
    var hot = i === s.i;
    P.rect(456, y - 4, 420, 50, { fill: hot ? WARMDIM : SURF, stroke: hot ? WARN : BORDER, radius: 6, sw: hot ? 1.8 : 1 });
    P.text(468, y + 6, rows[i][0], { size: 15, bold: true, mono: true, color: hot ? WARN : ACC });
    P.text(492, y + 7, rows[i][1], { size: 11, color: hot ? WARN : INK });
    y += 60;
  }
  if (s.i >= 2) {
    note(456, y + 2, 'case 2 is the only case that repeats, and it never rotates', ACC, 11.5);
  }
  if (s.i >= 3) {
    note(24, 388, 'when the debt reaches the root it is simply dropped, and the whole tree\'s', ACC, 12);
    note(24, 406, 'black-height falls by one — which is why the bound is not violated', ACC, 12);
  }
  legend(24, 434);
  note(430, 430, 'recolouring only: zero rotations', FAINT, 11);
}

/* ---------- scene 6: case 3 ---------- */

function drawCase3(t) {
  var s = seg(t);
  head('Case 3: the near nephew is red and the far one black',
    'insert 1 2 4 3, then delete 1 — case 3 turns the shape, case 4 finishes');

  panel(24, 66, 400, 306, 'before: delete 1');
  if (s.i === 0) {
    drawTree(C3_BEFORE, 120, 120, 70, 66, { rad: 14, size: 11, hi: [1] });
    nilLeaves(C3_BEFORE, 120, 120, 70, 66, 14);
    note(34, 344, 'x is the NIL left child of 1 · sibling 4 is black', DIM, 11.5);
  } else {
    drawTree(C3_BEFORE, 120, 120, 70, 66, { rad: 14, size: 11, hi: [3, 4] });
    nilLeaves(C3_BEFORE, 120, 120, 70, 66, 14);
    note(34, 344, 'near nephew 3 is red, far nephew is NIL (black)', WARN, 11.5);
    note(34, 362, 'recolour 3 black and 4 red, then rotate right at 4', WARN, 11.5);
  }

  panel(456, 66, 420, 306, 'after the whole repair');
  if (s.i >= 2) {
    drawTree(C3, 590, 120, 70, 66, { rad: 14, size: 11 });
    nilLeaves(C3, 590, 120, 70, 66, 14);
    note(466, 320, 'cases fired: ' + C3_REC.cases.join(', ') + ' · rotations: ' + C3_REC.rots, VAL, 11.5);
    note(466, 340, 'height 2 → 1, all five rules hold', DIM, 11.5);
  } else {
    note(466, 120, 'case 3 also finishes nothing.', INK, 12);
    note(466, 140, 'It swaps the near and far nephews', DIM, 11.5);
    note(466, 160, 'and hands over to case 4.', DIM, 11.5);
  }
  if (s.i >= 3) {
    note(24, 388, 'two rotations here: one for case 3, one for case 4', ACC, 12);
  }
  legend(24, 434);
  note(430, 430, 'the near nephew must move out of the way first', FAINT, 11);
}

/* ---------- scene 7: case 4 ---------- */

function drawCase4(t) {
  var s = seg(t);
  head('Case 4: the far nephew is red — the case that ends the repair',
    'insert 1 2 3 4, then delete 1 — one rotation, and the debt is paid');

  panel(24, 66, 400, 306, 'before: delete 1');
  if (s.i === 0) {
    drawTree(C4_BEFORE, 120, 120, 70, 66, { rad: 14, size: 11, hi: [1] });
    nilLeaves(C4_BEFORE, 120, 120, 70, 66, 14);
    note(34, 344, 'x is the NIL left child of 1 · sibling 3 is black', DIM, 11.5);
  } else {
    drawTree(C4_BEFORE, 120, 120, 70, 66, { rad: 14, size: 11, hi: [3, 4] });
    nilLeaves(C4_BEFORE, 120, 120, 70, 66, 14);
    note(34, 344, 'far nephew 4 is red, so case 4 fires at once', WARN, 11.5);
  }

  panel(456, 66, 420, 306, 'after the whole repair');
  if (s.i >= 1) {
    drawTree(C4, 590, 120, 70, 66, { rad: 14, size: 11 });
    nilLeaves(C4, 590, 120, 70, 66, 14);
  }
  var rows = [
    ['1', 'the sibling takes the parent colour: 3 becomes black'],
    ['2', 'the parent and the far nephew go black: 2 and 4'],
    ['3', 'rotate left at the parent: 3 rises above 2'],
    ['4', 'the path through x has its black back, and the loop ends']
  ];
  var y = 84;
  for (var i = 0; i < rows.length; i++) {
    if (i > s.i) continue;
    var hot = i === s.i;
    P.rect(456, y - 4, 420, 46, { fill: hot ? ACCDIM : SURF, stroke: hot ? ACC : BORDER, radius: 6, sw: hot ? 1.8 : 1 });
    P.text(468, y + 6, rows[i][0], { size: 15, bold: true, mono: true, color: ACC });
    P.text(492, y + 7, rows[i][1], { size: 11, color: hot ? ACC : INK });
    y += 54;
  }
  if (s.i >= 3) {
    note(466, 320, 'cases fired: ' + C4_REC.cases.join(', ') + ' \u00b7 rotations: ' + C4_REC.rots, VAL, 11.5);
    note(466, 340, 'height 2 \u2192 1, all five rules hold', DIM, 11.5);
    note(24, 388, 'case 4 is the only case that pays the debt with a rotation', ACC, 12);
  } else {
    note(466, 312, 'case 4 ends the repair: no case follows it', INK, 12);
  }
  legend(24, 434);
  note(430, 430, 'after this the tree is valid; nothing is left to repair', FAINT, 11);
}

/* ---------- scene 8: four deletions, four answers ---------- */

function drawTrace(t) {
  var s = seg(t);
  head('Four deletions from one ten-key tree, four different answers',
    'built by inserting 5 10 9 1 2 8 7 4 3 6');

  panel(24, 66, 372, 330, 'the tree after all four deletions');
  if (s.i >= 3) drawTree(TRACE, 66, 112, 44, 56, { rad: 12, size: 10 });
  else if (s.i >= 2) drawTree(TRACE, 66, 112, 44, 56, { rad: 12, size: 10, hi: [4] });
  else drawTree(TRACE, 66, 112, 44, 56, { rad: 12, size: 10, hi: s.i >= 1 ? [1] : [9] });
  note(34, 372, 'height ' + heightOf(TRACE, TRACE.root) + ' · black-height ' + bhOf(TRACE, TRACE.root), DIM, 11.5);

  var rows = [
    ['delete 9', 'cases ' + TRACE_STEPS[0].cases.join(',') + ' · ' + TRACE_STEPS[0].rots + ' rotation',
      'successor 10 was black; case 2 climbed, then 3 and 4 finished'],
    ['delete 1', 'cases ' + TRACE_STEPS[1].cases.join(',') + ' · ' + TRACE_STEPS[1].rots + ' rotations',
      'both siblings had black children; the debt walked up to the root'],
    ['delete 7', 'no fix-up at all',
      'the successor 8 was red, so no path lost a black'],
    ['delete 4', 'no case, one recolour',
      'the successor 5 was black and its child 6 was red: 6 absorbs the black']
  ];
  var y = 84;
  for (var i = 0; i < rows.length; i++) {
    if (i > s.i) continue;
    var hot = i === s.i;
    P.rect(416, y - 4, 460, 72, { fill: hot ? ACCDIM : SURF, stroke: hot ? ACC : BORDER, radius: 6, sw: hot ? 1.8 : 1 });
    P.text(428, y + 8, rows[i][0], { size: 12, bold: true, color: hot ? ACC : INK });
    P.text(428, y + 28, rows[i][1], { size: 11, mono: true, color: hot ? ACC : DIM });
    P.text(428, y + 48, rows[i][2], { size: 10.5, color: DIM });
    y += 82;
  }
  legend(24, 434);
  note(300, 430, 'the same operation, four different repairs', FAINT, 11);
}

/* ---------- scene 9: the cost ---------- */

function drawCost(t) {
  var s = seg(t);
  head('What a deletion costs: O(log n) recolours, at most three rotations',
    'measured on every insertion order of up to six keys, and stated in CLRS 13.4');

  panel(24, 66, 412, 236, 'the sweep this page runs at load');
  note(34, 92, 'insertion orders tried: every permutation of 1 to 6 keys', DIM, 11.5);
  note(34, 114, 'deletions examined: ' + SWEEP.total, INK, 12);
  note(34, 136, 'deletions that fired at least one case: ' + SWEEP.withCase, INK, 12);
  note(34, 158, 'deletions that needed no case at all: ' + SWEEP.noneCount, INK, 12);
  note(34, 180, 'largest rotation count seen: ' + SWEEP.maxRot, VAL, 12);
  note(34, 202, 'distinct case sequences: ' + SWEEP.sequences.length, INK, 12);
  note(34, 224, SWEEP.sequences.join('  ·  '), ACC, 11.5);

  panel(456, 66, 420, 236, 'rotations, measured against promised');
  var rows = [
    ['insertion', 'at most 2', 'case 2 and 3 each rotate once'],
    ['deletion', 'at most 3', 'cases 1, 3 and 4 rotate once each'],
    ['AVL deletion', 'O(log n)', 'may rotate at every level on the path']
  ];
  var y = 92;
  for (var i = 0; i < rows.length; i++) {
    P.text(466, y, rows[i][0], { size: 11.5, bold: true, color: INK });
    P.text(586, y, rows[i][1], { size: 11.5, mono: true, color: i === 2 ? INFO : VAL });
    P.text(466, y + 18, rows[i][2], { size: 10.5, color: DIM });
    y += 56;
  }
  if (s.i >= 2) {
    note(466, 268, 'case 2 is the only repeat; it recolours and never rotates', ACC, 11);
  }
  if (s.i >= 3) {
    note(24, 320, 'the loop runs at most O(log n) times, once per level, and every iteration', ACC, 12);
    note(24, 340, 'does constant work. The three rotations are the whole structural cost.', ACC, 12);
    note(24, 366, 'This is the trade against AVL: a slightly taller tree, a much cheaper delete.', DIM, 12);
  }
  legend(24, 434);
  note(400, 430, 'recolouring is cheap; rotating is what costs', FAINT, 11);
}

/* ---------- scene 10: the routine ---------- */

function drawRoutine(t) {
  var s = seg(t);
  head('The four-step routine and the five traps',
    'a deletion question is four decisions and one count');

  var steps = [
    ['1', 'Splice: if the key has two children, the successor moves up and'],
    ['2', 'Colour: the moved node takes the deleted node\'s colour. Save the'],
    ['3', 'Decide: if the moved node was red, stop. If its child was red,'],
    ['4', 'Repair: read the sibling, then the two nephews. Count cases.']
  ];
  var y = 76;
  for (var i = 0; i < steps.length; i++) {
    if (i > s.i) continue;
    var hot = i === s.i;
    P.rect(24, y - 4, 420, 56, { fill: hot ? ACCDIM : SURF, stroke: hot ? ACC : BORDER, radius: 6, sw: hot ? 1.8 : 1 });
    P.text(36, y + 8, steps[i][0], { size: 15, bold: true, mono: true, color: ACC });
    P.text(60, y + 9, steps[i][1], { size: 10.5, color: INK });
    y += 66;
  }
  if (s.i >= 2) {
    note(24, y + 4, '   colour it black and stop. Otherwise the debt is real: go to step 4.', DIM, 10.5);
    note(24, y + 22, '   its old colour before the move, because that decides the fix-up.', DIM, 10.5);
  }

  var traps = [
    ['the fix-up starts where the deleted key stood', 'it starts under the successor'],
    ['a deletion always needs a fix-up', 'deleting a red node needs none'],
    ['the extra black is a third colour', 'it is bookkeeping in the loop variable'],
    ['case 2 rotates', 'case 2 only recolours; the rotations are 1, 3 and 4'],
    ['three rotations means three cases', 'case 2 may repeat at every level']
  ];
  P.text(456, 76, 'five traps', { size: 12, bold: true, color: WARN });
  var ty = 100;
  for (var j = 0; j < traps.length; j++) {
    if (j > s.i) continue;
    var hot2 = j === s.i;
    P.text(456, ty, '\u00b7 ' + traps[j][0], { size: 10, color: hot2 ? WARN : DIM });
    P.text(468, ty + 14, traps[j][1], { size: 10, color: hot2 ? WARN : FAINT });
    ty += 52;
  }
  if (s.i >= 3) {
    note(24, 400, 'the count to report: the cases in the order they fire, and the rotations only', ACC, 12);
  }
  legend(24, 434);
  note(430, 430, 'one deficit, four cases, at most three rotations', FAINT, 11);
}

var SCENE_DRAW = {
  deficit: drawDeficit, where: drawWhere, extra: drawExtra, case1: drawCase1,
  case2: drawCase2, case3: drawCase3, case4: drawCase4, trace: drawTrace,
  cost: drawCost, routine: drawRoutine
};

function drawFrame(painter) {
  P = painter;
  var t = (K && K.state) ? K.state.elapsed : 0;
  var sc = sceneOf(t);
  P.clear();
  var fn = SCENE_DRAW[sc.id] || drawDeficit;
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
  SEVEN: { height: heightOf(SEVEN, SEVEN.root), bh: bhOf(SEVEN, SEVEN.root), size: sizeOf(SEVEN, SEVEN.root), inOrder: inOrder(SEVEN, SEVEN.root) },
  RED_LEAF: { cases: RED_LEAF_REC.cases, fixup: RED_LEAF_REC.fixup, height: heightOf(RED_LEAF, RED_LEAF.root), valid: valid(RED_LEAF) },
  PLAIN: { breakAt: PLAIN_BREAK ? PLAIN_BREAK.k : null, valid: PLAIN_REC.validAfter },
  BLACK_LEAF: { cases: BLACK_LEAF_REC.cases, rots: BLACK_LEAF_REC.rots, height: heightOf(BLACK_LEAF, BLACK_LEAF.root) },
  TWO_KIDS: { successor: TWO_KIDS_REC.successor, yColor: TWO_KIDS_REC.yColor, movedColor: TWO_KIDS_STOP.movedColor, cases: TWO_KIDS_REC.cases },
  C1: { cases: C1_REC.cases, rots: C1_REC.rots, height: heightOf(C1, C1.root) },
  C2: { cases: C2_REC.cases, rots: C2_REC.rots, bhBefore: bhOf(C2_BEFORE, C2_BEFORE.root), bhAfter: bhOf(C2, C2.root) },
  C3: { cases: C3_REC.cases, rots: C3_REC.rots },
  C4: { cases: C4_REC.cases, rots: C4_REC.rots },
  TRACE: TRACE_STEPS.map(function (r) { return { key: r.key, cases: r.cases, rots: r.rots, fixup: r.fixup, yColor: r.yColor, successor: r.successor }; }),
  SWEEP: SWEEP,
  CHECKS: CHECKS.length
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
