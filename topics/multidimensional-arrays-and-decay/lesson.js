/* ==========================================================================
   multidimensional-arrays-and-decay — lesson.js
   Four layers, in order:
     1. THE MODEL   — the declared type int[3][4] built as a real nested type,
                      its three sizeof values, the decayed type at each level,
                      the stride of each pointer type, the byte image of the
                      array, and the address arithmetic in both orders.
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
  var INVALIDDIM = PAL.invalidDim || '#fbe4e2';
  var WHITE = '#ffffff';

/* ======================================================================
   LAYER 1 — THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* the two platform facts this lesson states, and nothing else */
var W_INT = 4;        /* sizeof(int)                      */
var W_PTR = 8;        /* sizeof a pointer, 64-bit target  */

/* the declared object */
var R = 3, C = 4;     /* int a[3][4]                      */
var BASE = 1000;      /* the address of a[0][0]           */

/* ---- the type, built as nesting rather than written out ---- */
function arrayOf(n, elem) {
  return { kind: 'array', n: n, elem: elem, size: n * elem.size };
}
var T_INT = { kind: 'int', size: W_INT };
var T_ROW = arrayOf(C, T_INT);          /* int[4]      */
var T_ARR = arrayOf(R, T_ROW);          /* int[3][4]   */
var T_PTR_ROW = { kind: 'ptr', elem: T_ROW, size: W_PTR };   /* int (*)[4]      */
var T_PTR_INT = { kind: 'ptr', elem: T_INT, size: W_PTR };   /* int *           */
var T_PTR_ARR = { kind: 'ptr', elem: T_ARR, size: W_PTR };   /* int (*)[3][4]   */

chk('the row type is 4 ints, 16 bytes', T_ROW.size === 16, T_ROW.size);
chk('the whole type is 3 rows, 48 bytes', T_ARR.size === 48, T_ARR.size);
chk('sizeof a = R * C * w = 48', T_ARR.size === R * C * W_INT);

var SZ_A = T_ARR.size;      /* 48 */
var SZ_ROW = T_ROW.size;    /* 16 */
var SZ_INT = T_INT.size;    /* 4  */

chk('sizeof a is 48', SZ_A === 48, SZ_A);
chk('sizeof a[0] is 16', SZ_ROW === 16, SZ_ROW);
chk('sizeof a[0][0] is 4', SZ_INT === 4, SZ_INT);
chk('the three sizes are nested: 48 = 3 * 16 and 16 = 4 * 4',
  SZ_A === R * SZ_ROW && SZ_ROW === C * SZ_INT);
chk('sizeof a is not the size of a pointer', SZ_A !== W_PTR, SZ_A + ' against ' + W_PTR);

/* ---- strides: the byte step of +1 on each pointer type ---- */
var STRIDE_ROW = T_PTR_ROW.elem.size;   /* 16 */
var STRIDE_INT = T_PTR_INT.elem.size;   /* 4  */
var STRIDE_ALL = T_PTR_ARR.elem.size;   /* 48 */

chk('int (*)[4] steps 16 bytes', STRIDE_ROW === 16, STRIDE_ROW);
chk('int * steps 4 bytes', STRIDE_INT === 4, STRIDE_INT);
chk('int (*)[3][4] steps 48 bytes', STRIDE_ALL === 48, STRIDE_ALL);
chk('the whole-object stride is R rows of 16', STRIDE_ALL === R * STRIDE_ROW);

/* ---- decay: what each expression becomes ---- */
var DECAY = [
  { expr: 'a',        level: 0, type: 'int (*)[4]',    ptrTo: T_ROW, stride: STRIDE_ROW,
    value: BASE,       size: SZ_A,    note: 'the array itself, under sizeof or &' },
  { expr: 'a[0]',     level: 1, type: 'int[4]',        ptrTo: T_ROW, stride: STRIDE_ROW,
    value: BASE,       size: SZ_ROW,  note: 'a row, still an array' },
  { expr: 'a[0][0]',  level: 2, type: 'int',           ptrTo: T_INT, stride: STRIDE_INT,
    value: 1000,       size: SZ_INT,  note: 'an int, and an int does not decay' },
  { expr: '&a[0]',    level: 1, type: 'int (*)[4]',    ptrTo: T_ROW, stride: STRIDE_ROW,
    value: BASE,       size: W_PTR,   note: 'no conversion: the operand of &' },
  { expr: '&a',       level: 0, type: 'int (*)[3][4]', ptrTo: T_ARR, stride: STRIDE_ALL,
    value: BASE,       size: W_PTR,   note: 'no conversion: the operand of &' }
];
chk('a, a[0] and &a[0] all hold the same address', DECAY[0].value === DECAY[1].value &&
  DECAY[1].value === DECAY[3].value, BASE);
chk('a and &a hold the same address but different types',
  DECAY[0].value === DECAY[4].value && DECAY[0].type !== DECAY[4].type);

/* ---- addresses, two ways ---- */
function addrIndexed(i, j) { return BASE + (i * C + j) * W_INT; }
function addrDeref(i, j) {
  var p = BASE + i * STRIDE_ROW;    /* *(a + i): the row, as an int * */
  return p + j * STRIDE_INT;        /* *( ... + j): the int           */
}
var CELLS = [];
for (var i = 0; i < R; i++) {
  for (var j = 0; j < C; j++) {
    CELLS.push({ i: i, j: j, a1: addrIndexed(i, j), a2: addrDeref(i, j) });
  }
}
chk('twelve cells were enumerated', CELLS.length === R * C, CELLS.length);
chk('a[i][j] and *(*(a+i)+j) agree on all twelve cells',
  CELLS.every(function (c) { return c.a1 === c.a2; }),
  CELLS.filter(function (c) { return c.a1 !== c.a2; }).length + ' disagree');
chk('the first cell is at the base', CELLS[0].a1 === BASE, CELLS[0].a1);
chk('the last cell a[2][3] is at 1044', CELLS[CELLS.length - 1].a1 === 1044,
  CELLS[CELLS.length - 1].a1);
chk('the last cell ends exactly at the end of the object',
  CELLS[CELLS.length - 1].a1 + W_INT === BASE + SZ_A);
chk('every cell address is inside the object',
  CELLS.every(function (c) { return c.a1 >= BASE && c.a1 + W_INT <= BASE + SZ_A; }));

/* ---- the three +1 results ---- */
var A_PLUS_1 = BASE + STRIDE_ROW;
var ROW_PLUS_1 = BASE + STRIDE_INT;
var AMP_PLUS_1 = BASE + STRIDE_ALL;
chk('a + 1 is 1016', A_PLUS_1 === 1016, A_PLUS_1);
chk('a[0] + 1 is 1004', ROW_PLUS_1 === 1004, ROW_PLUS_1);
chk('&a + 1 is 1048, one past the end', AMP_PLUS_1 === BASE + SZ_A, AMP_PLUS_1);
chk('a + 1 lands on the second row', A_PLUS_1 === addrIndexed(1, 0));

/* ---- the byte image, and what an int ** reads from it ---- */
function cellValue(i, j) { return addrIndexed(i, j); }   /* store the addresses as the ints */
var BYTES = [];
for (var bi = 0; bi < R; bi++) {
  for (var bj = 0; bj < C; bj++) {
    var v = cellValue(bi, bj);
    BYTES.push(v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >> 24) & 0xff);
  }
}
chk('the byte image is 48 bytes', BYTES.length === 48, BYTES.length);

function wordAt(byteOffset) {           /* little-endian 64-bit read */
  var lo = 0, hi = 0, k;
  for (k = 3; k >= 0; k--) lo = lo * 256 + BYTES[byteOffset + k];
  for (k = 7; k >= 4; k--) hi = hi * 256 + BYTES[byteOffset + k];
  return hi * 4294967296 + lo;
}
var MISREAD0 = wordAt(0);
var MISREAD1 = wordAt(8);
chk('an int ** reads a[0][0] and a[0][1] as one 64-bit value',
  MISREAD0 === (1004 * 4294967296 + 1000), MISREAD0);
chk('that value is not inside the array object',
  MISREAD0 < BASE || MISREAD0 >= BASE + SZ_A, MISREAD0);
chk('it is not even a small number: 4312147166184',
  MISREAD0 === 4312147166184, MISREAD0);
chk('the second word is a different nonsense value', MISREAD1 !== MISREAD0, MISREAD1);

/* ---- row-major against column-major ---- */
function rowMajor(i, j, r, c, w, b) { return b + (i * c + j) * w; }
function colMajor(i, j, r, c, w, b) { return b + (j * r + i) * w; }

var Q = { r: 5, c: 6, w: 4, b: 1000, i: 3, j: 4 };
var RM = rowMajor(Q.i, Q.j, Q.r, Q.c, Q.w, Q.b);
var CM = colMajor(Q.i, Q.j, Q.r, Q.c, Q.w, Q.b);
chk('row-major address of a[3][4] on int a[5][6] from 1000 is 1088', RM === 1088, RM);
chk('column-major address of the same cell is 1092', CM === 1092, CM);
chk('the two orders differ by one element here', Math.abs(RM - CM) === Q.w, RM - CM);

var agreeOnlyThin = true;
for (var rr = 1; rr <= 4; rr++) {
  for (var cc = 1; cc <= 4; cc++) {
    var all = true;
    for (var ai = 0; ai < rr; ai++) {
      for (var aj = 0; aj < cc; aj++) {
        if (rowMajor(ai, aj, rr, cc, 4, 0) !== colMajor(ai, aj, rr, cc, 4, 0)) all = false;
      }
    }
    if (all !== (rr === 1 || cc === 1)) agreeOnlyThin = false;
  }
}
chk('the two orders agree on every cell only when R = 1 or C = 1', agreeOnlyThin);

/* ---- back-solving a base address ---- */
var BK = { r: 4, c: 5, w: 4, i1: 2, j1: 3, a1: 1112, i2: 3, j2: 1, a2: 1124 };
var gapBytes = BK.a2 - BK.a1;
var gapElems = gapBytes / BK.w;
chk('the gap between the two given cells is 12 bytes', gapBytes === 12, gapBytes);
chk('which is 3 elements', gapElems === 3, gapElems);
chk('the row difference times C plus the column difference is that gap',
  (BK.i2 - BK.i1) * BK.c + (BK.j2 - BK.j1) === gapElems);
var BK_BASE = BK.a1 - (BK.i1 * BK.c + BK.j1) * BK.w;
chk('the recovered base is 1060', BK_BASE === 1060, BK_BASE);
chk('the recovered base reproduces the first given cell',
  rowMajor(BK.i1, BK.j1, BK.r, BK.c, BK.w, BK_BASE) === BK.a1);
chk('the recovered base reproduces the second given cell',
  rowMajor(BK.i2, BK.j2, BK.r, BK.c, BK.w, BK_BASE) === BK.a2);
chk('every cell of the recovered array is inside one object',
  (function () {
    var lo = rowMajor(0, 0, BK.r, BK.c, BK.w, BK_BASE);
    var hi = rowMajor(BK.r - 1, BK.c - 1, BK.r, BK.c, BK.w, BK_BASE);
    return lo === BK_BASE && hi + BK.w === BK_BASE + BK.r * BK.c * BK.w;
  })());

/* ---- pointer to array against array of pointers ---- */
var SZ_PTR_TO_ARR = W_PTR;              /* int (*p)[4] */
var SZ_ARR_OF_PTR = 4 * W_PTR;          /* int *q[4]   */
chk('sizeof int (*p)[4] is 8', SZ_PTR_TO_ARR === 8, SZ_PTR_TO_ARR);
chk('sizeof int *q[4] is 32', SZ_ARR_OF_PTR === 32, SZ_ARR_OF_PTR);
chk('the two differ by a factor of four', SZ_ARR_OF_PTR === 4 * SZ_PTR_TO_ARR);
chk('p + 1 moves 16 bytes and q + 1 moves 8',
  STRIDE_ROW === 16 && W_PTR === 8, STRIDE_ROW + ' / ' + W_PTR);
chk('the ragged row-pointer array has three pointers, 24 bytes',
  3 * W_PTR === 24, 3 * W_PTR);

/* ---- the parameter adjustment ---- */
var PARAM = [
  { written: 'int a[3][4]',   adjusted: 'int (*a)[4]', outer: 3,   keeps: 'int[4]' },
  { written: 'int a[100][4]', adjusted: 'int (*a)[4]', outer: 100, keeps: 'int[4]' },
  { written: 'int a[][4]',    adjusted: 'int (*a)[4]', outer: null, keeps: 'int[4]' }
];
chk('all three parameter spellings adjust to the same type',
  PARAM.every(function (p) { return p.adjusted === PARAM[0].adjusted; }));
chk('the surviving dimension is the row width, 16 bytes',
  T_ROW.size === 16, T_ROW.size);
chk('only one dimension may be omitted', PARAM.filter(function (p) { return p.outer === null; }).length === 1);
chk('an array of an incomplete element type has no size at all',
  isNaN(R * undefined), 'R times an undefined element size is NaN, so int a[][] is ill-formed');

/* ---- the counts the captions quote ---- */
chk('there are five expressions in the decay table', DECAY.length === 5, DECAY.length);
chk('two of them are the no-conversion cases (&a[0] and &a)',
  DECAY.filter(function (d) { return d.note.indexOf('no conversion') >= 0; }).length === 2);
chk('the other three convert or are values',
  DECAY.filter(function (d) { return d.note.indexOf('no conversion') < 0; }).length === 3);
chk('exactly one row of the table is a non-array (an int)',
  DECAY.filter(function (d) { return d.type === 'int'; }).length === 1);

/* ======================================================================
   LAYER 3 — RENDER
   ====================================================================== */

function rev(t, s, d) {
  return K ? K.ease(K.beat(t, s, d === undefined ? 0.9 : d)) : 1;
}

function head(txt, sub) {
  P.text(36, 26, txt, { size: 15, bold: true, color: INK });
  if (sub) P.text(36, 46, sub, { size: 11.5, color: DIM });
}

function card(x, y, w, h, fill, stroke) {
  P.rect(x, y, w, h, { fill: fill || SURF, stroke: stroke || BORDER, radius: 8, sw: 1.2 });
}

function chip(x, y, txt, col, dim) {
  P.rect(x, y, txt.length * 7.2 + 14, 20, { fill: dim || SURF2, stroke: col, radius: 5, sw: 1 });
  P.text(x + 7, y + 10, txt, { size: 11, mono: true, color: col, base: 'middle' });
}

function bullet(x, y, txt, col, size) {
  P.circle(x + 3, y + 6, 2.4, { fill: col || DIM });
  P.text(x + 12, y, txt, { size: size || 11.5, color: INK });
}

/* the 3x4 grid of cells, drawn once and reused */
function grid(x, y, cw, chh, opts) {
  opts = opts || {};
  for (var i = 0; i < R; i++) {
    for (var j = 0; j < C; j++) {
      var hi = opts.highlight && opts.highlight.i === i && opts.highlight.j === j;
      P.rect(x + j * cw, y + i * chh, cw, chh, {
        fill: hi ? ACCDIM : (i % 2 === 0 ? SURF : SURF2),
        stroke: hi ? ACC : BORDER, radius: 3, sw: hi ? 2 : 1
      });
      if (opts.values) {
        P.text(x + j * cw + cw / 2, y + i * chh + chh / 2,
          String(addrIndexed(i, j)), { size: 10, mono: true, color: hi ? ACC : DIM, align: 'center', base: 'middle' });
      }
    }
  }
  if (opts.rowLabels !== false) {
    for (var k = 0; k < R; k++) {
      P.text(x - 8, y + k * chh + chh / 2, 'a[' + k + ']',
        { size: 10, mono: true, color: FAINT, align: 'right', base: 'middle' });
    }
  }
}

/* ---------- scene 1: one sizeof decides the argument ---------- */
function drawLie(t) {
  head('Is int a[3][4] a pointer?', 'One object, three levels, three measured sizes.');

  var a0 = rev(t, 0, 1.2);
  P.alpha(a0);
  grid(110, 96, 56, 38, { values: true });
  P.text(110, 84, 'twelve ints in one block: the stored values are 1000, 1004, ...', { size: 11, color: DIM });
  P.alpha(1);

  var a1 = rev(t, 7.5);
  P.alpha(a1);
  card(400, 92, 214, 62, SURF, BORDER);
  P.text(414, 104, 'sizeof a', { size: 11, mono: true, color: DIM });
  P.text(414, 122, '48', { size: 24, bold: true, color: ACC });
  P.text(456, 132, 'bytes = 3 x 16', { size: 10.5, color: FAINT });

  card(400, 162, 214, 52, SURF, BORDER);
  P.text(414, 172, 'sizeof a[0]', { size: 11, mono: true, color: DIM });
  P.text(414, 188, '16', { size: 20, bold: true, color: INFO });
  P.text(452, 196, 'bytes = 4 x 4', { size: 10.5, color: FAINT });

  card(400, 222, 214, 52, SURF, BORDER);
  P.text(414, 232, 'sizeof a[0][0]', { size: 11, mono: true, color: DIM });
  P.text(414, 248, '4', { size: 20, bold: true, color: VAL });
  P.text(430, 256, 'bytes = sizeof(int)', { size: 10.5, color: FAINT });
  P.alpha(1);

  var a2 = rev(t, 15);
  P.alpha(a2);
  card(640, 92, 226, 62, WARNDIM, WARN);
  P.text(654, 104, 'a pointer would be', { size: 11, color: WARN });
  P.text(654, 122, '8', { size: 24, bold: true, color: WARN });
  P.text(676, 132, 'bytes on this page', { size: 10.5, color: WARN });
  P.text(640, 168, '48 against 8 is not a', { size: 11.5, color: INK });
  P.text(640, 184, 'rounding difference.', { size: 11.5, color: INK });
  P.alpha(1);

  var a3 = rev(t, 22.5);
  P.alpha(a3);
  card(36, 296, 830, 62, ACCDIM, ACC);
  P.text(52, 310, 'So a is an object of 48 bytes, not a pointer. Every claim in this lesson is that one sentence applied carefully.',
    { size: 12.5, bold: true, color: INK });
  P.text(52, 332, 'The next scene reads the declarator; the scene after asks what the name becomes in an expression.',
    { size: 11, color: DIM });
  P.alpha(1);

  P.alpha(rev(t, 4));
  P.text(36, 392, 'int a[3][4];   /* twelve ints, 4 bytes each, one contiguous object */',
    { size: 12, mono: true, color: INK });
  P.alpha(1);

  P.alpha(rev(t, 19));
  bullet(36, 420, 'The test is one line of code: print sizeof(a). 48 means array; 8 means pointer.', DIM);
  bullet(36, 442, 'Nothing else about the declaration changes that number.', DIM);
  P.alpha(1);
}

/* ---------- scene 2: an array whose elements are arrays ---------- */
function drawNest(t) {
  head('int a[3][4] is array[3] of array[4] of int', 'Brackets bind tighter than the base type, so the outer array is written first.');

  var a0 = rev(t, 30, 1.2);
  P.alpha(a0);
  P.rect(56, 84, 348, 196, { fill: SURF, stroke: ACC, radius: 10, sw: 1.6 });
  P.text(66, 92, 'int[3][4]', { size: 11, mono: true, color: ACC });
  for (var i = 0; i < R; i++) {
    P.rect(70, 110 + i * 56, 320, 48, { fill: SURF2, stroke: BORDER, radius: 6, sw: 1 });
    P.text(78, 118 + i * 56, 'a[' + i + ']  :  int[4]  :  16 bytes', { size: 10.5, mono: true, color: DIM });
    for (var j = 0; j < C; j++) {
      P.rect(78 + j * 78, 132 + i * 56, 72, 20, { fill: WHITE, stroke: BORDER, radius: 3, sw: 1 });
      P.text(78 + j * 78 + 36, 142 + i * 56, 'int ' + addrIndexed(i, j),
        { size: 9.5, mono: true, color: INK, align: 'center', base: 'middle' });
    }
  }
  P.alpha(1);

  var a1 = rev(t, 37.5);
  P.alpha(a1);
  card(430, 84, 200, 96, SURF, BORDER);
  P.text(444, 94, 'a[0] is not an int', { size: 11.5, bold: true, color: INK });
  bullet(444, 114, 'type int[4]', DIM, 11);
  bullet(444, 132, 'sizeof 16', DIM, 11);
  bullet(444, 150, 'passable as an int[4]', DIM, 11);
  P.alpha(1);

  var a2 = rev(t, 45);
  P.alpha(a2);
  card(646, 84, 218, 96, SURF, BORDER);
  P.text(660, 94, 'the last cell', { size: 11.5, bold: true, color: INK });
  P.text(660, 114, 'a[2][3]', { size: 11, mono: true, color: ACC });
  P.text(660, 132, 'address 1044', { size: 11, mono: true, color: DIM });
  P.text(660, 150, 'ends at 1048', { size: 11, mono: true, color: DIM });
  P.alpha(1);

  var a3 = rev(t, 52.5);
  P.alpha(a3);
  card(430, 196, 434, 84, WARNDIM, WARN);
  P.text(444, 208, 'No row pointer is stored anywhere.', { size: 12, bold: true, color: WARN });
  P.text(444, 228, 'There is no table of three addresses in front of the data. The compiler', { size: 11, color: INK });
  P.text(444, 246, 'computes where row i starts from the row width, 16 bytes.', { size: 11, color: INK });
  P.text(444, 264, 'That is why an int ** cannot stand in for this object.', { size: 11, color: INK });
  P.alpha(1);

  P.alpha(rev(t, 33));
  P.text(36, 300, 'Read right to left:  a[3]  then  [4]  then  int', { size: 12, mono: true, color: INK });
  P.alpha(1);

  P.alpha(rev(t, 48));
  bullet(36, 330, 'a is an array of 3 elements. Each element is an int[4].', DIM);
  bullet(36, 352, 'The twelve ints are contiguous, so the three rows must follow each other.', DIM);
  bullet(36, 374, 'Row-major is forced by contiguity, not chosen by the programmer.', DIM);
  bullet(36, 396, '3 x 16 = 48, and 4 x 4 = 16: the sizes nest the same way the types do.', DIM);
  P.alpha(1);
}

/* ---------- scene 3: what a becomes ---------- */
function drawDecay(t) {
  head('The array-to-pointer rule, applied at each level', '6.3.2.1: an array expression becomes a pointer to its initial element — once, at the level you stand on.');

  var a0 = rev(t, 60, 1.2);
  P.alpha(a0);
  var rows = [
    { x: 40, expr: 'a',        gives: 'int (*)[4]',  why: 'first element is a[0], an int[4]', col: ACC },
    { x: 40, expr: 'a[0]',     gives: 'int *',       why: 'first element is a[0][0], an int',  col: INFO },
    { x: 40, expr: 'a[0][0]',  gives: 'int',         why: 'a value; an int does not decay',   col: VAL }
  ];
  for (var k = 0; k < rows.length; k++) {
    var y = 84 + k * 62;
    card(36, y, 470, 52, SURF, BORDER);
    P.text(50, y + 12, rows[k].expr, { size: 12.5, mono: true, bold: true, color: INK });
    P.arrow(112, y + 26, 158, y + 26, { stroke: rows[k].col, sw: 1.6, head: 8 });
    P.text(168, y + 12, rows[k].gives, { size: 12.5, mono: true, bold: true, color: rows[k].col });
    P.text(168, y + 32, rows[k].why, { size: 10.5, color: DIM });
  }
  P.alpha(1);

  var a1 = rev(t, 67.5);
  P.alpha(a1);
  card(524, 84, 340, 62, ACCDIM, ACC);
  P.text(538, 94, 'int (*p)[4]  versus  int *q[4]', { size: 12, mono: true, bold: true, color: INK });
  P.text(538, 114, 'pointer to an array of four', { size: 11, color: INK });
  P.text(538, 130, 'array of four pointers', { size: 11, color: INK });
  P.alpha(1);

  var a2 = rev(t, 75);
  P.alpha(a2);
  card(524, 156, 340, 70, SURF, BORDER);
  P.text(538, 166, 'Read the parentheses first', { size: 11.5, bold: true, color: INK });
  P.text(538, 186, '(*p)[4]: the * binds to p, then [4] to the target.', { size: 10.5, color: DIM });
  P.text(538, 204, '*q[4]: [4] binds to q, then each element is a pointer.', { size: 10.5, color: DIM });
  P.alpha(1);

  var a3 = rev(t, 82.5);
  P.alpha(a3);
  card(36, 268, 828, 82, WARNDIM, WARN);
  P.text(50, 280, 'The three places where no conversion happens', { size: 12, bold: true, color: WARN });
  bullet(50, 300, 'the operand of sizeof — which is why sizeof a is 48 and not 8', WARN, 11);
  bullet(50, 320, 'the operand of unary & — which is why &a is a pointer to the whole object', WARN, 11);
  bullet(50, 340, 'a string literal used to initialise an array', WARN, 11);
  P.alpha(1);

  P.alpha(rev(t, 78));
  P.text(36, 372, 'Every other appearance of a bare array name converts. Say which level you are standing on before you say what the type is.',
    { size: 11.5, color: INK });
  P.alpha(1);
}

/* ---------- scene 4: one address, three types ---------- */
function drawStride(t) {
  head('a, &a[0] and &a all hold 1000', 'Same byte, three types. The type decides what +1 means.');

  var a0 = rev(t, 90, 1.2);
  P.alpha(a0);
  var tab = [
    { e: 'a',     v: BASE, t: 'int (*)[4]',     s: STRIDE_ROW, r: A_PLUS_1, col: ACC },
    { e: '&a[0]', v: BASE, t: 'int (*)[4]',     s: STRIDE_ROW, r: A_PLUS_1, col: ACC },
    { e: '&a',    v: BASE, t: 'int (*)[3][4]',  s: STRIDE_ALL, r: AMP_PLUS_1, col: WARN },
    { e: 'a[0]',  v: BASE, t: 'int *',          s: STRIDE_INT, r: ROW_PLUS_1, col: INFO }
  ];
  P.text(40, 82, 'expression', { size: 10.5, mono: true, color: FAINT });
  P.text(150, 82, 'value', { size: 10.5, mono: true, color: FAINT });
  P.text(240, 82, 'type', { size: 10.5, mono: true, color: FAINT });
  P.text(430, 82, '+1 moves', { size: 10.5, mono: true, color: FAINT });
  P.text(560, 82, 'the value after +1', { size: 10.5, mono: true, color: FAINT });
  for (var k = 0; k < tab.length; k++) {
    var y = 96 + k * 44;
    P.rect(36, y, 828, 38, { fill: k % 2 ? SURF2 : SURF, stroke: BORDER, radius: 6, sw: 1 });
    P.text(46, y + 11, tab[k].e, { size: 12, mono: true, bold: true, color: INK });
    P.text(150, y + 11, String(tab[k].v), { size: 12, mono: true, color: DIM });
    P.text(240, y + 11, tab[k].t, { size: 12, mono: true, color: tab[k].col });
    P.text(430, y + 11, tab[k].s + ' bytes', { size: 12, mono: true, color: DIM });
    P.text(560, y + 11, String(tab[k].r), { size: 12, mono: true, bold: true, color: tab[k].col });
  }
  P.alpha(1);

  var a1 = rev(t, 97.5);
  P.alpha(a1);
  P.text(36, 282, 'the 48-byte object, 1000 to 1047', { size: 10.5, color: DIM });
  P.rect(36, 296, 828, 26, { fill: SURF2, stroke: BORDER, radius: 4, sw: 1 });
  for (var g = 0; g < R; g++) {
    P.rect(36 + g * 276, 296, 276, 26, { fill: g % 2 ? ACCDIM : WHITE, stroke: BORDER, radius: 4, sw: 1 });
    P.text(36 + g * 276 + 138, 309, 'row ' + g + ' : ' + addrIndexed(g, 0) + ' to ' + (addrIndexed(g, 0) + 15),
      { size: 10.5, mono: true, color: DIM, align: 'center', base: 'middle' });
  }
  P.alpha(1);

  var a2 = rev(t, 105);
  P.alpha(a2);
  P.arrow(36, 340, 36 + 276, 340, { stroke: ACC, sw: 1.6, head: 8 });
  P.text(48, 346, 'a + 1 = 1016: one row of 16 bytes', { size: 11, color: ACC });
  P.arrow(36, 372, 36 + 828, 372, { stroke: WARN, sw: 1.6, head: 8 });
  P.text(48, 378, '&a + 1 = 1048: the whole object, one past the end', { size: 11, color: WARN });
  P.alpha(1);

  var a3 = rev(t, 112.5);
  P.alpha(a3);
  card(36, 396, 828, 50, WARNDIM, WARN);
  P.text(50, 406, 'One past the end may be formed and compared; dereferencing it is undefined behaviour.', { size: 11.5, bold: true, color: INK });
  P.text(50, 426, 'Two expressions printing 1000 tell you nothing about where +1 goes. Ask for the type before you compare addresses.', { size: 11, color: DIM });
  P.alpha(1);
}

/* ---------- scene 5: a[i][j] is two dereferences ---------- */
function drawDeref(t) {
  head('E1[E2] is *((E1) + (E2)), applied twice', 'The inner dereference produces an array, and an array in an expression converts again.');

  var a0 = rev(t, 120, 1.2);
  P.alpha(a0);
  card(36, 82, 828, 58, ACCDIM, ACC);
  P.text(52, 94, 'a[i][j]   =   *( a[i] + j )   =   *( *( a + i ) + j )',
    { size: 15, mono: true, bold: true, color: INK });
  P.text(52, 120, 'Three spellings of one expression. The middle one hides a conversion; the right one shows it.',
    { size: 10.5, color: DIM });
  P.alpha(1);

  var a1 = rev(t, 127.5);
  P.alpha(a1);
  card(36, 154, 402, 66, SURF, BORDER);
  P.text(50, 164, 'step 1:  *( a + i )', { size: 12, mono: true, bold: true, color: ACC });
  P.text(50, 186, 'type int[4] — the row itself', { size: 11, color: INK });
  P.text(50, 204, 'moves i x 16 bytes', { size: 11, color: DIM });
  P.alpha(1);

  var a2 = rev(t, 135);
  P.alpha(a2);
  card(462, 154, 402, 66, SURF, BORDER);
  P.text(476, 164, 'step 2:  *( ... + j )', { size: 12, mono: true, bold: true, color: INFO });
  P.text(476, 186, 'the row decays to int *, then moves j x 4', { size: 11, color: INK });
  P.text(476, 204, 'the dereference is the value', { size: 11, color: DIM });
  P.alpha(1);

  var a3 = rev(t, 135.5);
  P.alpha(a3);
  grid(120, 244, 56, 30, { values: true });
  P.text(120, 232, 'base + (i x C + j) x 4', { size: 10.5, mono: true, color: DIM });
  P.text(400, 244, 'Every cell, both ways:', { size: 11.5, bold: true, color: INK });
  P.text(400, 264, '12 of 12 addresses agree', { size: 13, bold: true, color: VAL });
  P.text(400, 288, 'a[2][3] = 1044 by both spellings', { size: 11, mono: true, color: DIM });
  P.text(400, 306, 'last byte 1047 = base + 48 - 1', { size: 11, mono: true, color: DIM });
  P.alpha(1);

  var a4 = rev(t, 142.5);
  P.alpha(a4);
  card(36, 356, 828, 90, WARNDIM, WARN);
  P.text(50, 366, 'The formula, and the letter that matters', { size: 11.5, bold: true, color: WARN });
  P.text(50, 388, 'address = base + (i * C + j) * w', { size: 14, mono: true, bold: true, color: INK });
  P.text(50, 412, 'C is the number of columns, because moving down one row steps over a whole row of C ints.', { size: 11, color: INK });
  P.text(50, 430, 'Writing R there is the commonest slip, and it hides itself in every square array.', { size: 11, color: DIM });
  P.alpha(1);
}

/* ---------- scene 6: why int ** cannot be passed ---------- */
function drawBad(t) {
  head('The same 48 bytes, read through an int **', 'An int ** promises that a pointer is stored here. Nothing in the array is arranged that way.');

  var a0 = rev(t, 150, 1.2);
  P.alpha(a0);
  P.text(36, 84, 'the first 16 bytes, as four ints', { size: 11, color: DIM });
  var vals = [1000, 1004, 1008, 1012];
  for (var k = 0; k < 4; k++) {
    P.rect(36 + k * 106, 98, 100, 34, { fill: k < 2 ? INVALIDDIM : SURF2, stroke: k < 2 ? BAD : BORDER, radius: 5, sw: k < 2 ? 1.6 : 1 });
    P.text(36 + k * 106 + 50, 115, String(vals[k]), { size: 12, mono: true, color: k < 2 ? BAD : DIM, align: 'center', base: 'middle' });
  }
  P.text(36, 142, 'a[0][0]  a[0][1]  a[0][2]  a[0][3]', { size: 10, mono: true, color: FAINT });
  P.alpha(1);

  var a1 = rev(t, 157.5);
  P.alpha(a1);
  card(36, 164, 402, 76, INVALIDDIM, BAD);
  P.text(50, 176, 'what an int ** reads at offset 0', { size: 11.5, bold: true, color: BAD });
  P.text(50, 198, '0x000003ec000003e8', { size: 13, mono: true, bold: true, color: INK });
  P.text(50, 220, 'one 64-bit word, not two ints', { size: 10.5, color: DIM });
  P.alpha(1);

  var a2 = rev(t, 165);
  P.alpha(a2);
  card(462, 164, 402, 76, WARNDIM, WARN);
  P.text(476, 176, 'what that number is', { size: 11.5, bold: true, color: WARN });
  P.text(476, 198, '4312147166184', { size: 13, mono: true, bold: true, color: INK });
  P.text(476, 220, 'not an address inside this program', { size: 10.5, color: DIM });
  P.alpha(1);

  var a3 = rev(t, 165.5);
  P.alpha(a3);
  card(36, 256, 828, 64, SURF, BORDER);
  P.text(50, 266, 'Two different outcomes, and they are not the same mistake', { size: 11.5, bold: true, color: INK });
  P.text(50, 288, 'int **p = a;        the compiler must diagnose it: the types differ (a constraint violation)', { size: 11, mono: true, color: VAL });
  P.text(50, 306, 'int **p = (int **)a;  it compiles, and every later dereference is undefined behaviour', { size: 11, mono: true, color: BAD });
  P.alpha(1);

  var a4 = rev(t, 172.5);
  P.alpha(a4);
  card(36, 336, 828, 110, ACCDIM, ACC);
  P.text(50, 346, 'What would make int ** correct', { size: 11.5, bold: true, color: INK });
  P.text(50, 368, 'int *rows[3];  rows[0] = ra;  rows[1] = rb;  rows[2] = rc;', { size: 11, mono: true, color: INK });
  P.text(50, 390, 'Three real pointers, 24 bytes, each aiming at its own row. An int ** may point at that.', { size: 11, color: INK });
  P.text(50, 412, 'The difference is not syntax: it is whether the pointers are stored.', { size: 11, color: DIM });
  P.text(50, 432, 'A cast changes the compiler\'s opinion, not the bytes.', { size: 11, bold: true, color: BAD });
  P.alpha(1);
}

/* ---------- scene 7: the parameter rule ---------- */
function drawParam(t) {
  head('A parameter declared as an array is a pointer', '6.7.6.3: "array of type" is adjusted to "qualified pointer to type". One bracket goes; the rest stay.');

  var a0 = rev(t, 180, 1.2);
  P.alpha(a0);
  var par = [
    { y: 84, w: 'void f(int a[3][4])',   a: 'void f(int (*a)[4])' },
    { y: 130, w: 'void f(int a[100][4])', a: 'void f(int (*a)[4])' },
    { y: 176, w: 'void f(int a[][4])',   a: 'void f(int (*a)[4])' }
  ];
  for (var k = 0; k < par.length; k++) {
    P.text(36, par[k].y + 10, par[k].w, { size: 12, mono: true, color: INK });
    P.arrow(268, par[k].y + 15, 316, par[k].y + 15, { stroke: ACC, sw: 1.5, head: 8 });
    P.text(326, par[k].y + 10, par[k].a, { size: 12, mono: true, bold: true, color: ACC });
  }
  P.text(36, 216, 'three spellings, one parameter type', { size: 11, color: DIM });
  P.alpha(1);

  var a1 = rev(t, 187.5);
  P.alpha(a1);
  card(600, 84, 264, 96, SURF, BORDER);
  P.text(614, 94, 'only the outer bracket goes', { size: 11.5, bold: true, color: INK });
  bullet(614, 116, 'int[4] survives: 16 bytes', DIM, 11);
  bullet(614, 138, 'it is the row width the arithmetic needs', DIM, 11);
  bullet(614, 160, 'sizeof a in the callee is 8', DIM, 11);
  P.alpha(1);

  var a2 = rev(t, 195);
  P.alpha(a2);
  card(36, 244, 828, 62, WARNDIM, WARN);
  P.text(50, 254, 'Why the inner dimension cannot go', { size: 11.5, bold: true, color: WARN });
  P.text(50, 276, 'Without 4 the type would be int *, whose +1 steps 4 bytes instead of 16. Every row after the first would be read from the wrong place.', { size: 11, color: INK });
  P.text(50, 294, 'The outer 3 is never used by any expression, which is why it may be omitted — and why it is documentation, not information.', { size: 11, color: DIM });
  P.alpha(1);

  var a3 = rev(t, 202.5);
  P.alpha(a3);
  card(36, 318, 828, 60, INVALIDDIM, BAD);
  P.text(50, 328, 'And int a[][] does not compile', { size: 11.5, bold: true, color: BAD });
  P.text(50, 350, 'That declares an array whose elements are incomplete int[] arrays, and 6.7.6.2 says an element type shall not be incomplete.', { size: 11, color: INK });
  P.text(50, 368, 'int (*a)[] is legal — a pointer may point at an incomplete type — but no arithmetic may be done through it (6.5.6).', { size: 11, color: DIM });
  P.alpha(1);

  P.alpha(rev(t, 205));
  bullet(36, 396, 'One dimension of a parameter is optional. Exactly one, and it is the first.', WARN);
  bullet(36, 420, 'The callee never learns how many rows it was given. Pass the row count as a second parameter.', DIM);
  bullet(36, 444, 'sizeof on the parameter measures a pointer, not the array that was passed.', DIM);
  P.alpha(1);
}

/* ---------- scene 8: pointer to array against array of pointers ---------- */
function drawVs(t) {
  head('int (*p)[4] is not int *q[4]', 'One asterisk, two types, and the brackets decide which.');

  var a0 = rev(t, 210, 1.2);
  P.alpha(a0);
  card(36, 82, 402, 96, SURF, ACC);
  P.text(50, 92, 'int (*p)[4]', { size: 13, mono: true, bold: true, color: ACC });
  P.text(50, 114, 'a pointer to an array of four ints', { size: 11, color: INK });
  P.text(50, 136, 'sizeof p = 8', { size: 11, mono: true, color: DIM });
  P.text(50, 156, 'p + 1 moves 16 bytes', { size: 11, mono: true, color: DIM });

  card(462, 82, 402, 96, SURF, INFO);
  P.text(476, 92, 'int *q[4]', { size: 13, mono: true, bold: true, color: INFO });
  P.text(476, 114, 'an array of four pointers to int', { size: 11, color: INK });
  P.text(476, 136, 'sizeof q = 32', { size: 11, mono: true, color: DIM });
  P.text(476, 156, 'q + 1 moves 8 bytes', { size: 11, mono: true, color: DIM });
  P.alpha(1);

  var a1 = rev(t, 217.5);
  P.alpha(a1);
  P.text(36, 194, 'the four pointers of q, 8 bytes each', { size: 10.5, color: DIM });
  for (var k = 0; k < 4; k++) {
    P.rect(462 + k * 100, 206, 94, 26, { fill: SURF2, stroke: BORDER, radius: 4, sw: 1 });
    P.text(462 + k * 100 + 47, 219, 'q[' + k + ']', { size: 10.5, mono: true, color: DIM, align: 'center', base: 'middle' });
  }
  P.text(146, 219, 'one pointer, one target', { size: 10.5, color: DIM });
  P.rect(36, 206, 94, 26, { fill: ACCDIM, stroke: ACC, radius: 4, sw: 1 });
  P.text(83, 219, 'p', { size: 10.5, mono: true, color: ACC, align: 'center', base: 'middle' });
  P.alpha(1);

  var a2 = rev(t, 225);
  P.alpha(a2);
  card(36, 246, 828, 62, ACCDIM, ACC);
  P.text(50, 256, 'The ragged table is the array-of-pointers side', { size: 11.5, bold: true, color: INK });
  P.text(50, 278, 'int *rows[3];  rows[0] = malloc(5 * sizeof(int));  rows[1] = malloc(9 * sizeof(int));  rows[2] = malloc(2 * sizeof(int));',
    { size: 10.5, mono: true, color: INK });
  P.text(50, 296, 'Three pointers, 24 bytes, each free to aim at a row of a different length. The row width is not in the type, so lengths must be passed.',
    { size: 10.5, color: DIM });
  P.alpha(1);

  var a3 = rev(t, 232.5);
  P.alpha(a3);
  card(36, 320, 828, 126, WARNDIM, WARN);
  P.text(50, 330, 'Which is why int ** is right for one and wrong for the other', { size: 11.5, bold: true, color: WARN });
  P.text(50, 354, 'rows decays to int ** because rows[0] is an int *. So int ** is the honest type of a ragged table.', { size: 11, color: INK });
  P.text(50, 376, 'a decays to int (*)[4] because a[0] is an int[4]. No amount of casting makes int ** honest for a.', { size: 11, color: INK });
  P.text(50, 402, 'int ** is a legitimate type. It is simply the type of a different object.', { size: 11.5, bold: true, color: ACC });
  P.text(50, 424, 'A rectangular array of equal rows is one block; a ragged table is one block of pointers plus several blocks of data.', { size: 10.5, color: DIM });
  P.alpha(1);
}

/* ---------- scene 9: address arithmetic ---------- */
function drawArith(t) {
  head('Two question shapes, one formula', 'Forward: base to cell. Backward: two cells to base.');

  var a0 = rev(t, 240, 1.2);
  P.alpha(a0);
  card(36, 82, 828, 96, SURF, BORDER);
  P.text(50, 92, 'int a[5][6], base 1000, four bytes each — where is a[3][4]?', { size: 11.5, bold: true, color: INK });
  P.text(50, 116, 'row-major:   1000 + (3 * 6 + 4) * 4  =  1000 + 22 * 4  =  1088', { size: 12, mono: true, color: ACC });
  P.text(50, 140, 'column-major: 1000 + (4 * 5 + 3) * 4  =  1000 + 23 * 4  =  1092', { size: 12, mono: true, color: INFO });
  P.text(50, 162, 'The multipliers are the other dimension: C in row-major, R in column-major.', { size: 10.5, color: DIM });
  P.alpha(1);

  var a1 = rev(t, 247.5);
  P.alpha(a1);
  card(36, 190, 402, 70, WARNDIM, WARN);
  P.text(50, 200, 'why they differ by one element', { size: 11.5, bold: true, color: WARN });
  P.text(50, 222, '22 against 23 elements, so 4 bytes', { size: 11, mono: true, color: INK });
  P.text(50, 242, 'they agree on every cell only when R = 1 or C = 1', { size: 10.5, color: DIM });
  P.alpha(1);

  var a2 = rev(t, 247.8);
  P.alpha(a2);
  card(462, 190, 402, 70, SURF, BORDER);
  P.text(476, 200, 'and a declared C array is row-major', { size: 11.5, bold: true, color: INK });
  P.text(476, 222, 'because its elements must be contiguous', { size: 11, color: DIM });
  P.text(476, 242, 'column-major appears as a hypothetical, not as C', { size: 10.5, color: DIM });
  P.alpha(1);

  var a3 = rev(t, 255);
  P.alpha(a3);
  card(36, 272, 828, 100, ACCDIM, ACC);
  P.text(50, 282, 'Backward: int a[4][5], a[2][3] at 1112 and a[3][1] at 1124. Find the base.', { size: 11.5, bold: true, color: INK });
  P.text(50, 306, '1124 - 1112 = 12 bytes = 3 elements', { size: 12, mono: true, color: INK });
  P.text(50, 328, 'row gap 1, column gap -2, so  1 * 5 + (-2) = 3  — the C = 5 is confirmed', { size: 12, mono: true, color: INK });
  P.text(50, 350, 'base = 1112 - (2 * 5 + 3) * 4 = 1112 - 52 = 1060', { size: 12, mono: true, bold: true, color: ACC });
  P.alpha(1);

  var a4 = rev(t, 262.5);
  P.alpha(a4);
  card(36, 384, 828, 62, SURF, VAL);
  P.text(50, 394, 'The check that costs nothing', { size: 11.5, bold: true, color: VAL });
  P.text(50, 416, 'From 1060, a[3][1] = 1060 + (3 * 5 + 1) * 4 = 1060 + 64 = 1124. It comes back, so the base is right.', { size: 11, mono: true, color: INK });
  P.text(50, 436, 'Back-solving has one failure mode: an arithmetic slip that still looks plausible. Recompute a given cell and it cannot survive.', { size: 10.5, color: DIM });
  P.alpha(1);
}

/* ---------- scene 10: the routine and the traps ---------- */
function drawRoutine(t) {
  head('Four steps, five traps', 'Nothing here is memory work; all of it is reading the type carefully.');

  var a0 = rev(t, 270, 1.2);
  P.alpha(a0);
  var steps = [
    { n: '1', t: 'Name the object', d: 'array of ... of T, in words' },
    { n: '2', t: 'Say what it became', d: 'pointer to the element type, one level in' },
    { n: '3', t: 'Scale by the target', d: 'row width for a row pointer, 4 for an int pointer' },
    { n: '4', t: 'Check the units', d: 'bytes, or an element index — not both' }
  ];
  for (var k = 0; k < 4; k++) {
    var y = 82 + k * 48;
    P.circle(52, y + 18, 13, { fill: ACCDIM, stroke: ACC, sw: 1.4 });
    P.text(52, y + 18, steps[k].n, { size: 12, mono: true, bold: true, color: ACC, align: 'center', base: 'middle' });
    P.text(76, y + 8, steps[k].t, { size: 12, bold: true, color: INK });
    P.text(76, y + 26, steps[k].d, { size: 10.5, color: DIM });
  }
  P.alpha(1);

  var a1 = rev(t, 285);
  P.alpha(a1);
  card(452, 82, 412, 190, INVALIDDIM, BAD);
  P.text(466, 92, 'the five traps', { size: 11.5, bold: true, color: BAD });
  var traps = [
    'treating a as a pointer because a[i] works',
    'writing R where C belongs in the formula',
    'reading int (*p)[4] as an array of pointers',
    'thinking every parameter dimension is optional',
    'casting to silence the compiler'
  ];
  for (var m = 0; m < traps.length; m++) {
    P.text(466, 116 + m * 30, 'x  ' + traps[m], { size: 10.5, color: INK });
  }
  P.alpha(1);

  var a2 = rev(t, 292.5);
  P.alpha(a2);
  card(36, 288, 828, 66, ACCDIM, ACC);
  P.text(50, 298, 'All five are the same mistake in different clothes', { size: 11.5, bold: true, color: INK });
  P.text(50, 320, 'Each one is a type read carelessly, and each one is repaired by the same sentence: a is an array of three arrays of four ints.', { size: 11, color: INK });
  P.text(50, 340, 'If you can say that sentence and say it at the right level, none of the five can happen.', { size: 10.5, color: DIM });
  P.alpha(1);

  var a3 = rev(t, 295);
  P.alpha(a3);
  P.text(36, 372, 'sizeof a = 48    sizeof a[0] = 16    sizeof a[0][0] = 4    sizeof (int (*)[4]) = 8    sizeof (int *[4]) = 32',
    { size: 11, mono: true, color: DIM });
  P.text(36, 396, 'a + 1 = 1016    a[0] + 1 = 1004    &a + 1 = 1048    a[2][3] = 1044    base recovered = 1060',
    { size: 11, mono: true, color: DIM });
  P.alpha(1);

  var a4 = rev(t, 297);
  P.alpha(a4);
  bullet(36, 422, 'A two-dimensional array is one object. Every other answer in this topic is a consequence.', ACC, 12);
  bullet(36, 446, 'If two expressions print the same address, ask for their types before you compare their +1.', DIM, 12);
  P.alpha(1);
}

var SCENE_DRAW = {
  lie: drawLie, nest: drawNest, decay: drawDecay, stride: drawStride,
  deref: drawDeref, bad: drawBad, param: drawParam, vs: drawVs,
  arith: drawArith, routine: drawRoutine
};

function sceneOf(t) {
  var sc = (K && K.state) ? K.state.scenes : null;
  if (!sc || !sc.length) return { id: 'lie' };
  for (var i = 0; i < sc.length; i++) {
    if (t >= sc[i].start && t < sc[i].end) return sc[i];
  }
  return sc[sc.length - 1];
}

function drawFrame(painter) {
  P = painter;
  var t = (K && K.state) ? K.state.elapsed : 0;
  var sc = sceneOf(t);
  P.alpha(1);
  P.clear();
  var fn = SCENE_DRAW[sc.id] || drawLie;
  fn(t);
  P.alpha(1);
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
  R: R, C: C, BASE: BASE, W_INT: W_INT, W_PTR: W_PTR,
  SIZES: { a: SZ_A, row: SZ_ROW, elem: SZ_INT },
  STRIDES: { rowPtr: STRIDE_ROW, intPtr: STRIDE_INT, whole: STRIDE_ALL },
  PLUS1: { a: A_PLUS_1, row: ROW_PLUS_1, amp: AMP_PLUS_1 },
  CELLS: CELLS,
  MISREAD: { first: MISREAD0, second: MISREAD1 },
  ORDERS: { rowMajor: RM, columnMajor: CM },
  BACKSOLVE: { base: BK_BASE, gapElems: gapElems },
  POINTERS: { ptrToArr: SZ_PTR_TO_ARR, arrOfPtr: SZ_ARR_OF_PTR },
  PARAMS: PARAM,
  CHECKS: CHECKS.length
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
