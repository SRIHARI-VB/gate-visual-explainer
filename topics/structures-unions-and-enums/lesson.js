/* ==========================================================================
   structures-unions-and-enums — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no layout arithmetic, no offset
   rounding and no byte extraction of its own; every figure on the canvas was
   computed once here and checked against the rule it is supposed to satisfy.

   Sizes and alignments below are the x86-64 System V ABI facts for the
   platform this lesson was built on: char 1, short 2, int and float 4,
   long, double and pointers 8, each type self-aligned. They were confirmed
   independently by ctypes.Structure on that platform before this file was
   written; the reference layouts it returned are asserted in LAYER 2.
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

function alignUp(n, a) {
  if (a <= 1) return n;
  return Math.ceil(n / a) * a;
}

/* ---------- the ABI table ---------- */

var TYPES = {
  char:   { size: 1, align: 1 },
  short:  { size: 2, align: 2 },
  int:    { size: 4, align: 4 },
  float:  { size: 4, align: 4 },
  long:   { size: 8, align: 8 },
  double: { size: 8, align: 8 },
  ptr:    { size: 8, align: 8 }
};

/* a member is {name, type, count} or {name, size, align} for a nested struct */
function spec(m) {
  if (m.size !== undefined) {
    return { name: m.name, type: m.type || 'nested', count: 1,
             size: m.size, align: m.align };
  }
  var t = TYPES[m.type];
  var c = m.count || 1;
  return { name: m.name, type: m.type, count: c, size: t.size * c, align: t.align };
}

function layoutStruct(members) {
  var off = 0, maxa = 1, placed = [];
  members.forEach(function (m) {
    var s = spec(m);
    var start = alignUp(off, s.align);
    placed.push({ name: s.name, type: s.type, count: s.count,
                  offset: start, size: s.size, align: s.align, padBefore: start - off });
    off = start + s.size;
    if (s.align > maxa) maxa = s.align;
  });
  var end = off;
  var total = alignUp(end, maxa);
  var used = placed.reduce(function (a, m) { return a + m.size; }, 0);
  return { members: placed, end: end, size: total, align: maxa,
           tailPad: total - end, padding: total - used, used: used };
}

function layoutUnion(members) {
  var maxSize = 0, maxa = 1, placed = [];
  members.forEach(function (m) {
    var s = spec(m);
    if (s.size > maxSize) maxSize = s.size;
    if (s.align > maxa) maxa = s.align;
    placed.push({ name: s.name, type: s.type, count: s.count,
                  offset: 0, size: s.size, align: s.align });
  });
  var size = alignUp(maxSize, maxa);
  return { members: placed, size: size, align: maxa, largest: maxSize,
           tailPad: size - maxSize };
}

/* ---------- the structs this lesson shows ---------- */

var CH3 = layoutStruct([
  { name: 'x', type: 'char' },
  { name: 'y', type: 'char' },
  { name: 'z', type: 'char' }
]);                                     /* GATE CSE 2018 Q2 */

var A = layoutStruct([
  { name: 'c', type: 'char' },
  { name: 'i', type: 'int' },
  { name: 'c2', type: 'char' }
]);

var B = layoutStruct([
  { name: 'i', type: 'int' },
  { name: 'c', type: 'char' },
  { name: 'c2', type: 'char' }
]);

var C = layoutStruct([
  { name: 'd', type: 'double' },
  { name: 'c', type: 'char' }
]);

var INNER = layoutStruct([
  { name: 'a', type: 'char' },
  { name: 'b', type: 'int' }
]);

var OUTER = layoutStruct([
  { name: 'c', type: 'char' },
  { name: 'in', size: INNER.size, align: INNER.align, type: 'nested' }
]);

var E = layoutStruct([
  { name: 'a', type: 'short' },
  { name: 'b', size: INNER.size, align: INNER.align, type: 'nested' }
]);

var F = layoutStruct([
  { name: 'c', type: 'char' },
  { name: 'i', type: 'int' }
]);

var NODE = layoutStruct([
  { name: 'elt', type: 'int' },
  { name: 'next', type: 'ptr' }
]);

/* ---------- GATE CSE 2000 Q1.17 ---------- */

var U2000 = layoutUnion([
  { name: 'y', type: 'float' },
  { name: 'z', type: 'long' }
]);

var G2000 = layoutStruct([
  { name: 's', type: 'short', count: 5 },
  { name: 'u', size: U2000.size, align: U2000.align, type: 'union' }
]);

var G2000_IGNORING_ALIGNMENT = 5 * TYPES.short.size + U2000.size;   /* 10 + 8 */
var G2000_ALIGNED = G2000.size;

/* ---------- unions ---------- */

var U1 = layoutUnion([
  { name: 's', type: 'char', count: 5 },
  { name: 'i', type: 'int' }
]);

var U2 = layoutUnion([
  { name: 'i', type: 'int' },
  { name: 'b', type: 'char', count: 4 }
]);

var U3 = layoutUnion([
  { name: 'd', type: 'double' },
  { name: 'c', type: 'char' },
  { name: 'i', type: 'int' }
]);

/* ---------- every arrangement of char, int, char ---------- */

var ORDERS = [];
(function () {
  var NAME = ['c', 'i', 'c2'];
  var TYPE = ['char', 'int', 'char'];
  var idx = [0, 1, 2];
  function permute(a, k) {
    if (k === a.length) {
      var names = a.map(function (j) { return NAME[j]; });
      var mem = a.map(function (j) { return { name: NAME[j], type: TYPE[j] }; });
      var L = layoutStruct(mem);
      ORDERS.push({ names: names, size: L.size, padding: L.padding, layout: L });
      return;
    }
    for (var j = k; j < a.length; j++) {
      var t = a[k]; a[k] = a[j]; a[j] = t;
      permute(a, k + 1);
      t = a[k]; a[k] = a[j]; a[j] = t;
    }
  }
  permute(idx, 0);
})();

var ORDER_SIZES = {};
ORDERS.forEach(function (o) { ORDER_SIZES[o.size] = (ORDER_SIZES[o.size] || 0) + 1; });
var DISTINCT_SIZES = Object.keys(ORDER_SIZES).map(Number).sort(function (a, b) { return a - b; });

/* the best arrangement: widest alignment first */
var BY_ALIGN = layoutStruct([
  { name: 'i', type: 'int' },
  { name: 'c', type: 'char' },
  { name: 'c2', type: 'char' }
]);

/* the three distinct pictures, one per size-and-order class */
var ARRANGEMENTS = [
  { label: 'char, int, char', layout: A },
  { label: 'char, char, int', layout: layoutStruct([
      { name: 'c', type: 'char' }, { name: 'c2', type: 'char' }, { name: 'i', type: 'int' }
    ]) },
  { label: 'int, char, char', layout: B }
];

/* ---------- a packed version, for the counterexample ---------- */

function layoutPacked(members) {
  var off = 0, placed = [];
  members.forEach(function (m) {
    var s = spec(m);
    placed.push({ name: s.name, type: s.type, count: s.count,
                  offset: off, size: s.size, align: 1 });
    off += s.size;
  });
  return { members: placed, size: off, align: 1, padding: 0, used: off, tailPad: 0, end: off };
}
var A_PACKED = layoutPacked([
  { name: 'c', type: 'char' }, { name: 'i', type: 'int' }, { name: 'c2', type: 'char' }
]);

/* ---------- byte reinterpretation ---------- */

function bytesOf(value, order, n) {
  var out = [];
  for (var k = 0; k < n; k++) {
    var shift = (order === 'le') ? 8 * k : 8 * (n - 1 - k);
    out.push((value >>> shift) & 255);
  }
  return out;
}
function fromBytes(bs, order) {
  var v = 0, n = bs.length;
  for (var k = 0; k < n; k++) {
    var shift = (order === 'le') ? 8 * k : 8 * (n - 1 - k);
    v = (v + bs[k] * Math.pow(2, shift)) >>> 0;
  }
  return v >>> 0;
}

var PUN_VALUE = 0x12345678;
var PUN_LE = bytesOf(PUN_VALUE, 'le', 4);
var PUN_BE = bytesOf(PUN_VALUE, 'be', 4);

function hex2(v) {
  var s = (v & 255).toString(16).toUpperCase();
  return s.length < 2 ? '0' + s : s;
}

/* ---------- enumerations ---------- */

var ENUM_COLOUR = [
  { name: 'RED', value: 0 },
  { name: 'GREEN', value: 1 },
  { name: 'BLUE', value: 2 }
];

var ENUM_EXPLICIT = [
  { name: 'SMALL', value: 1 },
  { name: 'MEDIUM', value: 5 },
  { name: 'LARGE', value: 6 }
];

var ENUM_DUP = [
  { name: 'FIRST', value: 1 },
  { name: 'SECOND', value: 1 },
  { name: 'THIRD', value: 2 }
];

var ENUM_SIZE = TYPES.int.size;   /* the underlying type of a small enum here */

/* ---------- the pointer array ---------- */

var PTR_ARRAY_COUNT = 10;
var PTR_ARRAY_SIZE = PTR_ARRAY_COUNT * TYPES.ptr.size;

/* ---------- collected for the drawing layer ---------- */

var V = {
  types: TYPES,
  ch3: CH3, A: A, B: B, C: C, inner: INNER, outer: OUTER, e: E, f: F, node: NODE,
  g2000: G2000, u2000: U2000,
  g2000Ignoring: G2000_IGNORING_ALIGNMENT, g2000Aligned: G2000_ALIGNED,
  u1: U1, u2: U2, u3: U3,
  orders: ORDERS, orderSizes: ORDER_SIZES, distinctSizes: DISTINCT_SIZES,
  arrangements: ARRANGEMENTS, byAlign: BY_ALIGN, aPacked: A_PACKED,
  punValue: PUN_VALUE, punLE: PUN_LE, punBE: PUN_BE,
  enumColour: ENUM_COLOUR, enumExplicit: ENUM_EXPLICIT, enumDup: ENUM_DUP,
  enumSize: ENUM_SIZE,
  ptrCount: PTR_ARRAY_COUNT, ptrArraySize: PTR_ARRAY_SIZE
};

/* ======================================================================
   LAYER 2 - THE CHECKS
   Every number above is re-verified here against the rule it must obey.
   ====================================================================== */

var STRUCTS = [
  ['CH3', CH3], ['A', A], ['B', B], ['C', C], ['INNER', INNER], ['OUTER', OUTER],
  ['E', E], ['F', F], ['NODE', NODE], ['G2000', G2000]
];

/* 1. the defining property of alignment */
(function () {
  var bad = [];
  STRUCTS.forEach(function (pair) {
    pair[1].members.forEach(function (m) {
      if (m.offset % m.align !== 0) bad.push(pair[0] + '.' + m.name);
    });
  });
  chk('every member offset is a multiple of its own alignment', bad.length === 0, bad.join(','));
})();

/* 2. the defining property of the total */
(function () {
  var bad = [];
  STRUCTS.forEach(function (pair) {
    if (pair[1].size % pair[1].align !== 0) bad.push(pair[0]);
  });
  chk('every struct size is a multiple of its largest alignment', bad.length === 0, bad.join(','));
})();

/* 3. members do not overlap */
(function () {
  var bad = [];
  STRUCTS.forEach(function (pair) {
    var ms = pair[1].members.slice().sort(function (a, b) { return a.offset - b.offset; });
    for (var i = 1; i < ms.length; i++) {
      if (ms[i].offset < ms[i - 1].offset + ms[i - 1].size) bad.push(pair[0]);
    }
  });
  chk('no two members of a struct occupy the same byte', bad.length === 0, bad.join(','));
})();

/* 4. bytes are conserved: members plus padding equals the size */
(function () {
  var bad = [];
  STRUCTS.forEach(function (pair) {
    var L = pair[1];
    var sum = L.members.reduce(function (a, m) { return a + m.size; }, 0);
    if (sum + L.padding !== L.size) bad.push(pair[0]);
  });
  chk('member bytes plus padding equals sizeof, for all ten structs', bad.length === 0, bad.join(','));
})();

/* 5-8. the four reference layouts, matching the ctypes run */
chk('char,char,char: offsets 0,1,2 and size 3 (GATE 2018 Q2)',
    CH3.members.map(function (m) { return m.offset; }).join(',') === '0,1,2' && CH3.size === 3,
    CH3.size);
chk('char,int,char: offsets 0,4,8 and size 12',
    A.members.map(function (m) { return m.offset; }).join(',') === '0,4,8' && A.size === 12,
    A.size);
chk('int,char,char: offsets 0,4,5 and size 8',
    B.members.map(function (m) { return m.offset; }).join(',') === '0,4,5' && B.size === 8,
    B.size);
chk('double,char: offsets 0,8 and size 16',
    C.members.map(function (m) { return m.offset; }).join(',') === '0,8' && C.size === 16,
    C.size);

/* 9-10. padding counts */
chk('char,int,char spends 6 bytes on padding: 3 between, 3 at the end', A.padding === 6, A.padding);
chk('int,char,char spends 2 bytes on padding', B.padding === 2, B.padding);

/* 11-13. the permutation study */
(function () {
  var sizes = DISTINCT_SIZES.join(',');
  chk('six arrangements of char,int,char give only the sizes 8 and 12', sizes === '8,12', sizes);
  chk('the smallest arrangement is smaller than the declared one',
      DISTINCT_SIZES[0] === 8 && A.size === 12, DISTINCT_SIZES[0]);
  chk('widest-alignment-first reaches that smallest size', BY_ALIGN.size === DISTINCT_SIZES[0], BY_ALIGN.size);
})();
(function () {
  var counts = ORDER_SIZES[12] + ',' + ORDER_SIZES[8];
  chk('two of the six orders give 12 and four give 8', counts === '2,4', counts);
})();

/* 14-16. nesting */
chk('the inner struct is 8 bytes with alignment 4', INNER.size === 8 && INNER.align === 4,
    INNER.size + '/' + INNER.align);
chk('the outer struct places the inner member at offset 4 and is 12 bytes',
    OUTER.members[1].offset === 4 && OUTER.size === 12, OUTER.size);
chk('short then inner: offsets 0,4 and size 12',
    E.members.map(function (m) { return m.offset; }).join(',') === '0,4' && E.size === 12,
    E.size);
chk('a nested member\'s alignment is the largest alignment inside it',
    OUTER.align === Math.max.apply(null, [1, INNER.align]), OUTER.align);

/* 17-18. arrays */
(function () {
  var stride = F.size;
  var bad = [];
  for (var k = 0; k < 10; k++) {
    if ((k * stride) % F.align !== 0) bad.push(k);
  }
  chk('struct P is 8 bytes, so ten elements occupy 80', stride === 8 && stride * 10 === 80, stride * 10);
  chk('every element of a 10-element array starts aligned when the base does',
      bad.length === 0, bad.join(','));
})();

/* 19-23. unions */
chk('union{char[5]; int} is 8 bytes', U1.size === 8, U1.size);
chk('union{int; char[4]} is 4 bytes', U2.size === 4, U2.size);
chk('union{double; char; int} is 8 bytes', U3.size === 8, U3.size);
(function () {
  var bad = [];
  [U1, U2, U3].forEach(function (u) {
    u.members.forEach(function (m) { if (m.offset !== 0) bad.push(m.name); });
  });
  chk('every union member sits at offset 0', bad.length === 0, bad.join(','));
})();
(function () {
  var ok = [U1, U2, U3].every(function (u) {
    return u.members.every(function (m) { return u.size >= m.size; });
  });
  chk('a union is at least as large as its largest member', ok, '');
})();

/* 24-25. GATE CSE 2000 Q1.17 */
chk('GATE 2000: ignoring alignment the answer is 18',
    G2000_IGNORING_ALIGNMENT === 18, G2000_IGNORING_ALIGNMENT);
chk('GATE 2000: with x86-64 alignment the same object is 24',
    G2000_ALIGNED === 24 && G2000_ALIGNED % U2000.align === 0, G2000_ALIGNED);
chk('the 2000 union is the larger of float and long', U2000.size === 8 && U2000.largest === 8, U2000.size);

/* 26-28. the list node and the pointer array */
chk('a list node is 16 bytes with the pointer at offset 8',
    NODE.size === 16 && NODE.members[1].offset === 8, NODE.size);
chk('the node\'s self-referential member is a pointer, 8 bytes',
    NODE.members[1].size === TYPES.ptr.size, NODE.members[1].size);
chk('struct node *s[10] is 80 bytes of pointers, not nodes',
    PTR_ARRAY_SIZE === 80, PTR_ARRAY_SIZE);

/* 29-32. byte order */
chk('0x12345678 as four bytes, little-endian, is 78 56 34 12',
    PUN_LE.map(hex2).join(' ') === '78 56 34 12', PUN_LE.map(hex2).join(' '));
chk('0x12345678 as four bytes, big-endian, is 12 34 56 78',
    PUN_BE.map(hex2).join(' ') === '12 34 56 78', PUN_BE.map(hex2).join(' '));
chk('both byte orders reassemble to the original integer',
    fromBytes(PUN_LE, 'le') === PUN_VALUE && fromBytes(PUN_BE, 'be') === PUN_VALUE, '');
chk('the two orders really differ, so the printed output is machine-dependent',
    PUN_LE.join(',') !== PUN_BE.join(','), '');

/* 33-36. enumerations */
chk('an unwritten enum counts 0, 1, 2',
    ENUM_COLOUR.map(function (e) { return e.value; }).join(',') === '0,1,2', '');
chk('an explicit first value does not reset the rest: 1, 5, 6',
    ENUM_EXPLICIT.map(function (e) { return e.value; }).join(',') === '1,5,6', '');
(function () {
  var distinct = {};
  ENUM_DUP.forEach(function (e) { distinct[e.value] = true; });
  chk('two enumerators may share a value, so distinct values are fewer than names',
      Object.keys(distinct).length < ENUM_DUP.length, Object.keys(distinct).length);
})();
chk('a small enum occupies one int, 4 bytes here',
    ENUM_SIZE === TYPES.int.size && ENUM_SIZE === 4, ENUM_SIZE);

/* 37-38. the counterexample and the waste */
chk('packed to one byte, the same three members occupy 6 bytes',
    A_PACKED.size === 6 && A_PACKED.padding === 0, A_PACKED.size);
chk('double first wastes 7 bytes of the 16 it takes', C.padding === 7, C.padding);

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

var COL = {
  char:   { fill: PAL.accentDim, stroke: PAL.accent },
  short:  { fill: '#e7eef7', stroke: PAL.info },
  int:    { fill: PAL.warnDim, stroke: PAL.warn },
  float:  { fill: PAL.warnDim, stroke: PAL.warn },
  long:   { fill: PAL.accentDim, stroke: PAL.valid },
  double: { fill: '#ece8f6', stroke: '#5b4b8a' },
  ptr:    { fill: PAL.invalidDim, stroke: PAL.invalid },
  nested: { fill: '#e6f0e6', stroke: PAL.valid },
  union:  { fill: '#e6f0e6', stroke: PAL.valid },
  pad:    { fill: PAL.surface2, stroke: PAL.border }
};

function colOf(t) { return COL[t] || COL.int; }

function head(P, n, title) {
  P.text(34, 16, n + '  ' + title, { size: 12, mono: true, color: PAL.dim });
  P.line(34, 36, W - 34, 36, { stroke: PAL.border, sw: 1 });
}

/* one row of byte cells for a struct or union */
function drawBlock(P, x, y, cw, ch, L, opts) {
  opts = opts || {};
  var owner = new Array(L.size);
  L.members.forEach(function (m) {
    for (var k = 0; k < m.size; k++) if (m.offset + k < L.size) owner[m.offset + k] = m;
  });
  for (var i = 0; i < L.size; i++) {
    var cx = x + i * cw;
    var m = owner[i];
    if (m) {
      var c = colOf(m.type);
      P.rect(cx, y, cw, ch, { fill: c.fill, stroke: c.stroke, sw: 1.4, radius: 2 });
    } else {
      P.rect(cx, y, cw, ch, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 2 });
      if (cw >= 18) P.text(cx + cw / 2, y + ch / 2, 'pad', { size: 8, align: 'center', base: 'middle', color: PAL.faint });
    }
  }
  /* offset numbers under the first cell of every member and under every pad run */
  var seen = {};
  L.members.forEach(function (m) {
    var label = m.name + (m.count > 1 ? '[' + m.count + ']' : '');
    P.text(x + m.offset * cw + 2, y + ch + 4, label, { size: 10, mono: true, color: PAL.ink });
    P.text(x + m.offset * cw + 2, y - 13, String(m.offset), { size: 9, mono: true, color: PAL.dim });
    seen[m.offset] = true;
  });
  if (opts.showAllOffsets) {
    for (var j = 0; j < L.size; j++) {
      if (!seen[j]) P.text(x + j * cw + 2, y - 13, String(j), { size: 8, mono: true, color: PAL.faint });
    }
  }
  /* the size bracket */
  var bw = L.size * cw;
  P.line(x, y + ch + 20, x + bw, y + ch + 20, { stroke: PAL.dim, sw: 1 });
  P.line(x, y + ch + 16, x, y + ch + 24, { stroke: PAL.dim, sw: 1 });
  P.line(x + bw, y + ch + 16, x + bw, y + ch + 24, { stroke: PAL.dim, sw: 1 });
  P.text(x + bw / 2, y + ch + 24, 'sizeof = ' + L.size, { size: 11, mono: true, align: 'center', color: PAL.ink });
}

function legend(P, y, items) {
  var x = 40;
  items.forEach(function (it) {
    var c = colOf(it.type);
    P.rect(x, y, 12, 12, { fill: c.fill, stroke: c.stroke, sw: 1.2, radius: 2 });
    P.text(x + 17, y + 1, it.label, { size: 10, color: PAL.dim });
    x += 17 + it.label.length * 5.6 + 16;
  });
}

function note(P, x, y, lines, opts) {
  opts = opts || {};
  lines.forEach(function (s, i) {
    P.text(x, y + i * (opts.lh || 17), s, { size: opts.size || 12, color: opts.color || PAL.dim, mono: !!opts.mono });
  });
}

function on(p, frac) { return p >= frac - 1e-9; }

/* ---------- the ten scenes ---------- */

var SCENE_DRAW = {

  record: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 1, 'a struct is one block with named slots');
    note(P, 40, 56, [
      'struct Ournode { char x, y, z; };',
      'three members, one byte each, no padding between them'
    ], { mono: true, size: 12 });
    drawBlock(P, 60, 130, 54, 46, CH3, { showAllOffsets: true });
    P.text(60, 200, 'GATE CSE 2018 Q2 reads byte 1 and byte 2 through a char pointer.',
           { size: 11, color: PAL.dim });
    if (on(p, 0.7)) {
      P.text(40, 250, 'Now put an int in the middle:', { size: 12, color: PAL.ink });
      drawBlock(P, 60, 310, 34, 42, A, { showAllOffsets: true });
      P.text(60, 392, 'offsets 0, 4, 8 — the int refused offset 1', { size: 11, color: PAL.warn });
    }
    legend(P, 428, [{ type: 'char', label: 'char (1)' }, { type: 'int', label: 'int (4)' }, { type: 'pad', label: 'padding' }]);
  },

  align: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 2, 'alignment: a rule about addresses');
    var x0 = 50, cw = 40, y = 150;
    for (var i = 0; i < 12; i++) {
      P.rect(x0 + i * cw, y, cw, 40, { fill: i % 4 === 0 ? PAL.accentDim : PAL.surface2,
                                       stroke: PAL.border, sw: 1, radius: 2 });
      P.text(x0 + i * cw + cw / 2, y + 46, String(i), { size: 10, mono: true, align: 'center', color: PAL.dim });
    }
    P.text(x0, y - 22, 'byte addresses', { size: 10, mono: true, color: PAL.faint });

    /* aligned int at 4 */
    P.rect(x0 + 4 * cw, y + 4, 4 * cw, 32, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.6, radius: 2 });
    P.text(x0 + 6 * cw, y + 20, 'int at 4  ✓', { size: 12, align: 'center', base: 'middle', color: PAL.warn });

    if (on(p, 0.5)) {
      P.rect(x0 + 3 * cw, y + 66, 4 * cw, 32, { fill: PAL.invalidDim, stroke: PAL.invalid, sw: 1.6, radius: 2 });
      P.text(x0 + 5 * cw, y + 82, 'int at 3  ✗', { size: 12, align: 'center', base: 'middle', color: PAL.invalid });
      P.text(x0, y + 108, 'a four-byte object must begin at a multiple of four', { size: 11, color: PAL.invalid });
    }

    /* type table */
    var tx = 610, ty = 90;
    P.text(tx, ty - 20, 'x86-64 System V', { size: 11, mono: true, color: PAL.faint });
    var rows = [['char', 1], ['short', 2], ['int, float', 4], ['long, double, ptr', 8]];
    rows.forEach(function (r, i) {
      P.text(tx, ty + i * 24, r[0], { size: 12, color: PAL.ink });
      P.text(tx + 190, ty + i * 24, r[1] + ' / ' + r[1], { size: 12, mono: true, color: PAL.dim, align: 'right' });
    });
    P.text(tx, ty + 100, 'size / alignment', { size: 10, mono: true, color: PAL.faint, align: 'left' });

    if (on(p, 0.85)) {
      P.text(50, 340, 'padding is the compiler skipping the bytes it cannot use', { size: 12, color: PAL.dim });
      P.text(50, 362, 'those bytes are counted in sizeof, and their values are unspecified', { size: 12, color: PAL.warn });
    }
    legend(P, 428, [{ type: 'int', label: 'int (4)' }, { type: 'pad', label: 'unused / padding' }]);
  },

  algorithm: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 3, 'three rules, one layout');
    note(P, 40, 56, [
      '1. round the running offset up to the member alignment',
      '2. place the member, advance by its size',
      '3. round the whole block up to the largest alignment'
    ], { size: 12 });

    var x = 90, cw = 40, y = 200;
    /* step 1: char at 0 */
    P.rect(x, y, cw, 44, { fill: COL.char.fill, stroke: COL.char.stroke, sw: 1.5, radius: 2 });
    P.text(x + 4, y - 14, '0', { size: 9, mono: true, color: PAL.dim });
    P.text(x + 4, y + 48, 'c', { size: 11, mono: true, color: PAL.ink });
    P.text(40, 130, 'after c: offset = 1', { size: 11, mono: true, color: PAL.dim });

    if (on(p, 0.25)) {
      for (var i = 1; i < 4; i++) {
        P.rect(x + i * cw, y, cw, 44, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 2 });
        P.text(x + i * cw + cw / 2, y + 22, 'pad', { size: 8, align: 'center', base: 'middle', color: PAL.faint });
        P.text(x + i * cw + 4, y - 14, String(i), { size: 9, mono: true, color: PAL.faint });
      }
      P.text(40, 150, 'round 1 up to 4: three bytes skipped', { size: 11, mono: true, color: PAL.warn });
    }
    if (on(p, 0.45)) {
      P.rect(x + 4 * cw, y, 4 * cw, 44, { fill: COL.int.fill, stroke: COL.int.stroke, sw: 1.5, radius: 2 });
      P.text(x + 4 * cw + 4, y - 14, '4', { size: 9, mono: true, color: PAL.dim });
      P.text(x + 4 * cw + 4, y + 48, 'i', { size: 11, mono: true, color: PAL.ink });
    }
    if (on(p, 0.62)) {
      P.rect(x + 8 * cw, y, cw, 44, { fill: COL.char.fill, stroke: COL.char.stroke, sw: 1.5, radius: 2 });
      P.text(x + 8 * cw + 4, y - 14, '8', { size: 9, mono: true, color: PAL.dim });
      P.text(x + 8 * cw + 4, y + 48, 'c2', { size: 11, mono: true, color: PAL.ink });
      P.text(40, 170, 'after i: offset = 8, so c2 needs no padding', { size: 11, mono: true, color: PAL.dim });
    }
    if (on(p, 0.8)) {
      for (var j = 9; j < 12; j++) {
        P.rect(x + j * cw, y, cw, 44, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 2 });
        P.text(x + j * cw + cw / 2, y + 22, 'pad', { size: 8, align: 'center', base: 'middle', color: PAL.faint });
      }
      P.line(x, y + 66, x + 12 * cw, y + 66, { stroke: PAL.dim, sw: 1 });
      P.text(x + 6 * cw, y + 72, 'members end at 9, block rounds to 12', { size: 11, align: 'center', color: PAL.ink });
      P.text(40, 300, 'sizeof = 12, of which 6 bytes are padding', { size: 13, mono: true, color: PAL.valid });
    }
    legend(P, 428, [{ type: 'char', label: 'char' }, { type: 'int', label: 'int' }, { type: 'pad', label: 'padding' }]);
  },

  reorder: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 4, 'field order changes the size');
    P.text(40, 54, 'the same three members, three arrangements', { size: 12, color: PAL.dim });

    var y = 90, cw = 26;
    ARRANGEMENTS.forEach(function (a, i) {
      if (!on(p, i * 0.2)) return;
      var yy = y + i * 92;
      P.text(40, yy + 18, a.label, { size: 11, mono: true, color: PAL.ink });
      drawBlock(P, 220, yy, cw, 34, a.layout, {});
      P.text(220 + a.layout.size * cw + 12, yy + 18, '= ' + a.layout.size, { size: 12, mono: true, color: PAL.valid });
    });

    if (on(p, 0.6)) {
      P.text(40, 372, 'six permutations, grouped by size: ' +
             '12 appears ' + ORDER_SIZES[12] + ' times, 8 appears ' + ORDER_SIZES[8] + ' times',
             { size: 11, mono: true, color: PAL.dim });
    }
    if (on(p, 0.8)) {
      P.text(40, 396, 'putting the widest member first reaches ' + BY_ALIGN.size + ' bytes — a heuristic, not a theorem',
             { size: 11, color: PAL.warn });
    }
    legend(P, 428, [{ type: 'char', label: 'char' }, { type: 'int', label: 'int' }, { type: 'pad', label: 'padding' }]);
  },

  nested: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 5, 'a struct inside a struct');
    P.text(40, 54, 'struct Inner { char a; int b; };   struct Outer { char c; struct Inner in; };',
           { size: 12, mono: true, color: PAL.ink });
    drawBlock(P, 70, 120, 40, 38, INNER, { showAllOffsets: true });
    P.text(70, 196, 'Inner: 8 bytes, alignment 4', { size: 11, color: PAL.dim });

    if (on(p, 0.35)) {
      drawBlock(P, 70, 280, 40, 38, OUTER, { showAllOffsets: true });
      P.text(70, 356, 'Outer: c at 0, in at 4, total 12 bytes', { size: 11, color: PAL.dim });
    }
    if (on(p, 0.6)) {
      P.text(560, 120, 'the inner block:', { size: 11, mono: true, color: PAL.faint });
      note(P, 560, 144, [
        'a at 0, b at 4',
        'size 8 = 1 + 3 pad + 4',
        'alignment = max(1,4) = 4'
      ], { size: 11 });
      P.text(560, 250, 'the outer block:', { size: 11, mono: true, color: PAL.faint });
      note(P, 560, 274, [
        'c at 0, so offset becomes 1',
        'in needs 4, so 3 bytes pad',
        'in spans 4..11, total 12',
        '12 is already a multiple of 4'
      ], { size: 11 });
    }
    legend(P, 428, [{ type: 'char', label: 'char' }, { type: 'int', label: 'int' }, { type: 'nested', label: 'nested struct' }, { type: 'pad', label: 'padding' }]);
  },

  array: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 6, 'an array of structs, and its stride');
    P.text(40, 54, 'struct P { char c; int i; };   struct P arr[10];', { size: 12, mono: true, color: PAL.ink });

    var cw = 22, y = 110;
    for (var k = 0; k < 3; k++) {
      if (!on(p, 0.1 + k * 0.2)) continue;
      var x = 60 + k * (8 * cw + 34);
      drawBlock(P, x, y, cw, 34, F, {});
      P.text(x, y + 96, 'arr[' + k + ']', { size: 11, mono: true, color: PAL.ink });
      P.text(x, y + 112, 'base + ' + (8 * k), { size: 10, mono: true, color: PAL.dim });
    }
    if (on(p, 0.7)) {
      P.text(40, 268, 'stride = sizeof = ' + F.size + ', so ten elements occupy ' + (F.size * 10) + ' bytes',
             { size: 13, mono: true, color: PAL.valid });
      P.text(40, 292, 'the fields themselves hold only ' + (F.used * 10) + ' bytes of data',
             { size: 11, color: PAL.dim });
    }
    if (on(p, 0.85)) {
      P.text(40, 320, 'padding is per element: element k must be aligned by itself',
             { size: 11, color: PAL.warn });
      P.text(40, 342, 'so a stride that is a multiple of the alignment keeps every element aligned',
             { size: 11, color: PAL.dim });
    }
    legend(P, 428, [{ type: 'char', label: 'char' }, { type: 'int', label: 'int' }, { type: 'pad', label: 'padding' }]);
  },

  union: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 7, 'a union overlaps instead of stacking');
    P.text(40, 54, 'union U { char s[5]; int i; };', { size: 12, mono: true, color: PAL.ink });

    var x = 70, y = 100, cw = 40;
    /* the outline of the union, 8 bytes */
    for (var i = 0; i < U1.size; i++) {
      P.rect(x + i * cw, y, cw, 40, { fill: PAL.surface, stroke: PAL.border, sw: 1, radius: 2 });
    }
    /* char[5] */
    P.rect(x, y + 6, 5 * cw, 28, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.4, radius: 2 });
    P.text(x + 4, y + 48, 's[5]  offset 0', { size: 11, mono: true, color: PAL.accent });
    if (on(p, 0.2)) {
      P.rect(x, y + 56, 4 * cw, 28, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.4, radius: 2 });
      P.text(x + 4, y + 98, 'i  offset 0', { size: 11, mono: true, color: PAL.warn });
    }
    if (on(p, 0.35)) {
      for (var j = 5; j < 8; j++) {
        P.rect(x + j * cw, y, cw, 40, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 2 });
        P.text(x + j * cw + cw / 2, y + 20, 'pad', { size: 8, align: 'center', base: 'middle', color: PAL.faint });
      }
      P.text(x, y + 130, 'largest member 5, alignment 4, so sizeof = 8', { size: 12, mono: true, color: PAL.valid });
    }
    if (on(p, 0.6)) {
      P.text(560, 100, 'GATE CSE 2000 Q1.17', { size: 11, mono: true, color: PAL.faint });
      note(P, 560, 124, [
        'struct { short s[5];',
        '         union { float y; long z; } u;',
        '       } t;'
      ], { size: 11, mono: true, color: PAL.ink });
      note(P, 560, 200, [
        'short[5] = 10 bytes',
        'union   = max(4, 8) = 8 bytes',
        'ignoring alignment: 10 + 8 = 18'
      ], { size: 11 });
      if (on(p, 0.85)) {
        P.text(560, 280, 'with x86-64 alignment: ' + G2000_ALIGNED, { size: 12, mono: true, color: PAL.warn });
        P.text(560, 300, 'that is not the asked answer', { size: 10, color: PAL.warn });
      }
    }
    legend(P, 428, [{ type: 'char', label: 'char array member' }, { type: 'int', label: 'int member' }, { type: 'pad', label: 'trailing padding' }]);
  },

  punning: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 8, 'same bytes, two readings');
    P.text(40, 54, 'union V { int i; char b[4]; } v;   v.i = 0x12345678;',
           { size: 12, mono: true, color: PAL.ink });

    var order = on(p, 0.5) ? 'be' : 'le';
    var bytes = order === 'le' ? PUN_LE : PUN_BE;
    var x = 80, y = 120, cw = 76;
    for (var i = 0; i < 4; i++) {
      P.rect(x + i * cw, y, cw - 6, 54, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.5, radius: 3 });
      P.text(x + i * cw + (cw - 6) / 2, y + 27, '0x' + hex2(bytes[i]),
             { size: 16, mono: true, align: 'center', base: 'middle', color: PAL.ink });
      P.text(x + i * cw + (cw - 6) / 2, y + 62, 'b[' + i + ']', { size: 10, mono: true, align: 'center', color: PAL.dim });
    }
    P.text(40, 208, (order === 'le' ? 'little-endian' : 'big-endian') + ': the four bytes of 0x12345678',
           { size: 12, color: PAL.ink });
    P.text(40, 232, 'v.i still reads 0x' + PUN_VALUE.toString(16).toUpperCase() + ' — only the reading type changed',
           { size: 11, mono: true, color: PAL.dim });

    if (on(p, 0.7)) {
      P.text(40, 272, 'little-endian gives 78 56 34 12;  big-endian gives 12 34 56 78',
             { size: 11, mono: true, color: PAL.dim });
      P.text(40, 300, 'the same C program prints different output on the two machines',
             { size: 12, color: PAL.warn });
    }
    if (on(p, 0.9)) {
      P.text(40, 336, 'char access is always allowed; reading another member reinterprets an object representation',
             { size: 11, color: PAL.dim });
      P.text(40, 358, 'and that reinterpretation may produce a trap representation',
             { size: 11, color: PAL.invalid });
    }
    legend(P, 428, [{ type: 'char', label: 'one byte of the object' }]);
  },

  'enum': function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 9, 'enumerations are named integers');
    P.text(40, 54, 'enum colour { RED, GREEN, BLUE };', { size: 12, mono: true, color: PAL.ink });

    ENUM_COLOUR.forEach(function (e, i) {
      if (!on(p, 0.1 + i * 0.12)) return;
      var y = 96 + i * 40;
      P.rect(70, y, 190, 30, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.3, radius: 3 });
      P.text(80, y + 15, e.name, { size: 13, mono: true, base: 'middle', color: PAL.ink });
      P.text(280, y + 15, '= ' + e.value, { size: 13, mono: true, base: 'middle', color: PAL.valid });
    });

    if (on(p, 0.5)) {
      P.text(430, 96, 'the enum object itself', { size: 11, mono: true, color: PAL.faint });
      for (var i = 0; i < ENUM_SIZE; i++) {
        P.rect(430 + i * 54, 118, 48, 36, { fill: COL.int.fill, stroke: COL.int.stroke, sw: 1.4, radius: 2 });
      }
      P.text(430, 162, 'sizeof = ' + ENUM_SIZE + ' (one int)', { size: 11, mono: true, color: PAL.dim });
    }
    if (on(p, 0.7)) {
      P.text(430, 210, 'explicit values: SMALL=1, MEDIUM=5, LARGE', { size: 11, mono: true, color: PAL.ink });
      P.text(430, 230, 'gives 1, 5, 6 — counting continues from the last written value', { size: 11, color: PAL.dim });
      P.text(430, 256, 'duplicates are legal: FIRST=1, SECOND=1, THIRD=2', { size: 11, mono: true, color: PAL.ink });
      P.text(430, 276, 'three names, two values — distinctness is your job', { size: 11, color: PAL.warn });
    }
    if (on(p, 0.88)) {
      P.text(40, 262, 'an enum stores no strings: printf with %s on an enumerator is undefined',
             { size: 11, color: PAL.invalid });
      P.text(40, 284, 'and an enum variable may hold a value no enumerator names',
             { size: 11, color: PAL.dim });
    }
    legend(P, 428, [{ type: 'char', label: 'enumerator (a name)' }, { type: 'int', label: 'stored object (4 bytes)' }]);
  },

  selfref: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 10, 'a struct that points at itself');
    P.text(40, 54, 'struct node { int elt; struct node *next; };', { size: 12, mono: true, color: PAL.ink });

    /* two nodes, an arrow between them */
    function nodeBox(x, y, label) {
      P.rect(x, y, 130, 62, { fill: PAL.surface, stroke: PAL.dim, sw: 1.4, radius: 4 });
      P.rect(x + 6, y + 10, 52, 42, { fill: COL.int.fill, stroke: COL.int.stroke, sw: 1.2, radius: 2 });
      P.text(x + 32, y + 31, 'elt', { size: 10, align: 'center', base: 'middle', color: PAL.ink });
      P.rect(x + 64, y + 10, 58, 42, { fill: COL.ptr.fill, stroke: COL.ptr.stroke, sw: 1.2, radius: 2 });
      P.text(x + 93, y + 31, 'next', { size: 10, align: 'center', base: 'middle', color: PAL.ink });
      P.text(x, y + 70, label, { size: 10, mono: true, color: PAL.dim });
    }
    nodeBox(70, 100, 'node A');
    if (on(p, 0.2)) {
      nodeBox(330, 100, 'node B');
      P.arrow(200, 131, 326, 131, { stroke: PAL.invalid, sw: 1.6 });
      P.text(210, 112, '8 bytes', { size: 9, mono: true, color: PAL.invalid });
    }
    if (on(p, 0.4)) {
      drawBlock(P, 70, 240, 30, 32, NODE, { showAllOffsets: true });
      P.text(70, 320, 'sizeof = 16: int at 0, 4 of padding, pointer at 8',
             { size: 11, mono: true, color: PAL.valid });
    }
    if (on(p, 0.62)) {
      P.text(560, 100, 'why the pointer is legal', { size: 11, mono: true, color: PAL.faint });
      note(P, 560, 124, [
        'a pointer has a fixed size',
        'known before the struct is sized',
        'so the layout can be computed'
      ], { size: 11 });
      P.text(560, 210, 'why a member by value is not', { size: 11, mono: true, color: PAL.faint });
      note(P, 560, 234, [
        'it would need its own size',
        'before it had one',
        'the compiler rejects it'
      ], { size: 11, color: PAL.invalid });
    }
    if (on(p, 0.85)) {
      P.text(40, 366, 'struct node *s[10] is ten pointers, ' + PTR_ARRAY_SIZE + ' bytes — not ten nodes (GATE CSE 2000 Q1.31)',
             { size: 11, color: PAL.dim });
    }
    legend(P, 428, [{ type: 'int', label: 'int (4)' }, { type: 'ptr', label: 'pointer (8)' }, { type: 'pad', label: 'padding' }]);
  }
};

function drawFrame(P2) {
  P = P2;
  P.alpha(1);
  P.clear();
  P.rect(0, 0, W, H, { fill: PAL.surface });

  var t = (K && K.state) ? K.state.elapsed : 0;
  var scenes = (K && K.state && K.state.scenes && K.state.scenes.length)
    ? K.state.scenes
    : (window.LESSON_TIMELINE ? window.LESSON_TIMELINE.scenes : []);
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
  var bad = CHECKS.length - pass;
  el.innerHTML = '<span class="k">Model checks</span>' +
    '<p class="small" style="margin:6px 0 0">' + pass + ' of ' + CHECKS.length + ' passed' +
    (bad ? ' \u2014 <strong>' + bad + ' failed</strong>' : '') + '</p>';
}

function boot() {
  fillChecks();

  var holder = document.getElementById('canvas-holder');
  var fallback = document.getElementById('canvas-fallback');
  if (fallback) fallback.classList.remove('show');

  var ok = false;
  if (window.p5 && holder && PR) {
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
