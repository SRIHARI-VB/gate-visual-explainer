/* ==========================================================================
   bit-fields-in-c — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   THE MODEL IS A MODEL. It implements the layout rule stated on the Build-up
   tab, which is the rule GCC applies on x86-64 for bit-fields of type int,
   unsigned int and signed int: one 4-byte allocation unit, fields packed into
   the low-order bits in declaration order, a field that does not fit starting
   a new unit instead of straddling, and a zero-width unnamed field ending the
   current unit. Nothing here is measured from a compiler run — no C compiler
   exists in the environment this lesson was built in — so every figure is a
   consequence of that rule, and the rule is tested against the six sizes that
   cppreference and two reported runs print for the same declarations.

   The model's scope is stated in one place, below, and everything outside that
   scope is described as implementation-defined rather than computed.
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

/* The one platform fact the whole lesson rests on: int is 4 bytes, 32 bits,
   aligned to 4. Stated once, used everywhere. */
var UNIT_BITS = 32;
var UNIT_BYTES = 4;

/* ---------- the layout rule ---------- */

/* members: {name, w} for a bit-field (w > 0), {name:'', w:0} for the
   zero-width separator, {name:'', w} for unnamed padding, {plain:'name'}
   for a full int member. Returns the bit map and every derived count. */
function layout(members) {
  var fields = [];      // every bit-field, named or not
  var plains = [];      // full int members
  var next = 0;         // next free bit index
  var errors = [];

  members.forEach(function (m) {
    if (m.plain) {
      next = Math.ceil(next / UNIT_BITS) * UNIT_BITS;
      plains.push({ name: m.plain, lo: next, hi: next + UNIT_BITS });
      next += UNIT_BITS;
      return;
    }
    if (m.w > UNIT_BITS) { errors.push('width ' + m.w + ' exceeds the ' + UNIT_BITS + '-bit unit'); return; }
    if (m.w === 0) {
      if (m.name) errors.push('a zero-width bit-field may not be named');
      next = Math.ceil(next / UNIT_BITS) * UNIT_BITS;
      return;
    }
    var unitEnd = (Math.floor(next / UNIT_BITS) + 1) * UNIT_BITS;
    if (next + m.w > unitEnd) next = unitEnd;      // no straddling in this model
    fields.push({ name: m.name || '', lo: next, hi: next + m.w, w: m.w, unnamed: !m.name });
    next += m.w;
  });

  var totalBits = Math.ceil(next / UNIT_BITS) * UNIT_BITS;
  var usedBits = 0, padBits = 0;
  fields.forEach(function (f) { if (f.unnamed) padBits += f.w; else usedBits += f.w; });
  plains.forEach(function () { usedBits += UNIT_BITS; });

  /* the ownership map: which member, if any, owns each bit */
  var owner = new Array(totalBits);
  for (var i = 0; i < totalBits; i++) owner[i] = null;
  fields.concat(plains).forEach(function (f) {
    for (var b = f.lo; b < f.hi; b++) owner[b] = (owner[b] === null ? f.name || '(pad)' : 'CLASH');
  });

  return {
    fields: fields,
    named: fields.filter(function (f) { return !f.unnamed; }),
    plains: plains,
    owner: owner,
    endBit: next,
    totalBits: totalBits,
    size: totalBits / 8,
    usedBits: usedBits,
    padBits: padBits,
    unusedBits: totalBits - usedBits - padBits,
    errors: errors
  };
}

/* ---------- the declarations the lesson shows ---------- */

var S1 = layout([{ name: 'b1', w: 5 }, { name: '', w: 11 }, { name: 'b2', w: 6 }, { name: 'b3', w: 2 }]);
var S2 = layout([{ name: 'b1', w: 5 }, { name: '', w: 0 }, { name: 'b2', w: 6 }, { name: 'b3', w: 15 }]);
var S2B = layout([{ name: 'b1', w: 5 }, { name: 'b2', w: 6 }, { name: 'b3', w: 15 }]);
var ABCD = layout([{ name: 'a', w: 5 }, { name: 'b', w: 5 }, { name: 'c', w: 5 }, { name: 'd', w: 5 }]);
var BOX = layout([{ name: 'opaque', w: 1 }, { name: 'fill', w: 3 }, { name: '', w: 4 },
                  { name: 'border', w: 1 }, { name: 'bcol', w: 3 },
                  { name: 'bstyle', w: 2 }, { name: '', w: 2 }]);
var ONOFF = layout([{ name: 'light', w: 1 }, { name: 'toast', w: 1 }, { plain: 'count' },
                    { name: 'ac', w: 4 }, { name: '', w: 4 }, { name: 'clock', w: 1 },
                    { name: '', w: 0 }, { name: 'flag', w: 1 }]);
var TIME = layout([{ name: 'h', w: 5 }, { name: 'm', w: 6 }, { name: 's', w: 6 }]);
var TWO20 = layout([{ name: 'a', w: 20 }, { name: 'b', w: 20 }]);
var A28B8 = layout([{ name: 'a', w: 28 }, { name: 'b', w: 8 }]);
var PADDEMO = layout([{ name: 'a', w: 4 }, { name: '', w: 4 }, { name: 'b', w: 2 },
                      { name: '', w: 0 }, { name: 'c', w: 1 }]);
var THREE = layout([{ name: 'a', w: 3 }]);
var TOOWIDE = layout([{ name: 'a', w: 33 }]);
var NAMEDZERO = layout([{ name: 'a', w: 0 }]);

var ALL = [S1, S2, S2B, ABCD, BOX, ONOFF, TIME, TWO20, A28B8, PADDEMO, THREE];

/* the sizes other people print for these declarations: the page's own
   cross-check, and the only evidence the rule is the compiler's rule */
var DOCUMENTED = [
  { s: S1, size: 4, src: 'cppreference: "usually prints 4"' },
  { s: S2, size: 8, src: 'cppreference: "usually prints 8"' },
  { s: ABCD, size: 4, src: 'a reported run printing 1 2 3 4 4' },
  { s: BOX, size: 4, src: 'a reported run printing 4' },
  { s: ONOFF, size: 16, src: 'a reported run printing 16' }
];

/* ---------- the value rules ---------- */

function maskOf(w) { return Math.pow(2, w) - 1; }

/* store v into a w-bit field: the bits kept are v modulo 2^w */
function storeUnsigned(v, w) {
  var m = maskOf(w);
  return ((v % (m + 1)) + (m + 1)) % (m + 1);
}

/* read w raw bits as a signed field of that width: two's complement */
function readSigned(raw, w) {
  var half = Math.pow(2, w - 1);
  return raw >= half ? raw - Math.pow(2, w) : raw;
}

/* the shift and mask a field at bits lo..hi needs. Arithmetic, not the bitwise
   operators: a 64-bit or 128-bit object does not survive >>> , which works on
   32 bits, and a check that silently truncates is worse than no check. */
function extractor(f) {
  var p2 = Math.pow(2, f.lo), m = maskOf(f.w);
  return {
    shift: f.lo,
    mask: m,
    test: function (word) { return Math.floor(word / p2) % (m + 1); }
  };
}

/* assemble a word from field values, using the model's own bit positions */
function packWord(named, values) {
  var word = 0;
  named.forEach(function (f, i) {
    word += storeUnsigned(values[i], f.w) * Math.pow(2, f.lo);
  });
  return word;
}

/* ---------- figures quoted in the text and captions ---------- */

var FIG = {
  timeInts: 3 * UNIT_BYTES,                 // 12
  timeBits: 5 + 6 + 6,                      // 17
  s1Span: S1.named[0].w,                    // 5
  s2Gap: S2.named[1].lo - S2.named[0].hi,   // the bits the :0 throws away
  padDemoSize: PADDEMO.size,
  onoffSize: ONOFF.size,
  boxSize: BOX.size,
  two20Size: TWO20.size,
  a28b8Size: A28B8.size,
  a28b8B: A28B8.named[1].lo,                // 32, not 28
  wrapValue: storeUnsigned(9, 3),           // 1
  wrapSeven: storeUnsigned(7 + 1, 3),       // 0
  signedRaw: readSigned(6, 3)               // -2
};

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* 1-5. the sizes other people print, reproduced by the rule */
DOCUMENTED.forEach(function (d) {
  chk('size matches the documented value (' + d.src + ')',
      d.s.size === d.size, 'model ' + d.s.size + ' bytes, documented ' + d.size);
});

/* 6. removing the zero-width field is the only difference between S2 and S2B */
chk('the :0 alone accounts for the four-byte difference',
    S2.size - S2B.size === 4 && S2B.size === 4, S2.size + ' against ' + S2B.size);

/* 7. the zero-width field moves every later field, not just the size */
chk('the :0 moves b2 and b3 into the second unit',
    S2.named[1].lo === 32 && S2B.named[1].lo === 5,
    'with :0 b2 starts at bit ' + S2.named[1].lo + ', without it at ' + S2B.named[1].lo);

/* 8. no two named fields share a bit, in any struct the lesson draws */
var clash = null;
ALL.forEach(function (L) {
  L.owner.forEach(function (o, b) { if (o === 'CLASH' && clash === null) clash = L.size + 'b@' + b; });
});
chk('no two members own the same bit', clash === null, clash || 'checked on ' + ALL.length + ' declarations');

/* 9. every bit of the object is owned by a member or is not owned at all, and
      the count of unowned bits agrees with the widths */
var unaccounted = ALL.filter(function (L) {
  var marked = L.owner.filter(function (o) { return o !== null; }).length;
  var unowned = L.totalBits - marked;
  return unowned !== L.unusedBits;
});
chk('used, padding and unowned bits add up to sizeof in bits', unaccounted.length === 0,
    unaccounted.length + ' declaration(s) unaccounted');

/* 10. no field straddles a unit boundary, which is this model's own rule */
var straddle = null;
ALL.forEach(function (L) {
  L.fields.forEach(function (f) {
    if (Math.floor(f.lo / UNIT_BITS) !== Math.floor((f.hi - 1) / UNIT_BITS)) {
      straddle = f.name + ' ' + f.lo + '..' + f.hi;
    }
  });
});
chk('no bit-field straddles an allocation unit', straddle === null, straddle || 'all fields inside one unit');

/* 11. the size is always a whole number of units */
chk('sizeof is always a multiple of the unit size',
    ALL.every(function (L) { return L.size % UNIT_BYTES === 0; }), 'checked on ' + ALL.length);

/* 12. every pair of widths obeys the two bounds */
var pairBad = null, pairs = 0;
for (var w1 = 1; w1 <= 31; w1++) {
  for (var w2 = 1; w2 <= 31; w2++) {
    var Lp = layout([{ name: 'x', w: w1 }, { name: 'y', w: w2 }]);
    pairs++;
    var lower = UNIT_BYTES * Math.ceil((w1 + w2) / UNIT_BITS);
    var upper = UNIT_BYTES * 2;
    if (Lp.size < lower || Lp.size > upper || Lp.size % UNIT_BYTES !== 0) {
      pairBad = w1 + ',' + w2 + ' -> ' + Lp.size;
    }
  }
}
chk('all ' + pairs + ' width pairs sit between the bit-count floor and two units',
    pairBad === null, pairBad || 'no exception');

/* 13. and so does every triple, with no overlap anywhere */
var tripBad = null, trips = 0;
for (var a1 = 1; a1 <= 8; a1++) {
  for (var a2 = 1; a2 <= 8; a2++) {
    for (var a3 = 1; a3 <= 8; a3++) {
      var Lt = layout([{ name: 'p', w: a1 }, { name: 'q', w: a2 }, { name: 'r', w: a3 }]);
      trips++;
      if (Lt.owner.indexOf('CLASH') >= 0 || Lt.size % UNIT_BYTES !== 0) tripBad = a1 + ',' + a2 + ',' + a3;
    }
  }
}
chk('all ' + trips + ' width triples pack without a clash', tripBad === null, tripBad || 'no exception');

/* 14. storing out of range wraps modulo 2^w for an unsigned field */
chk('unsigned:3 stores 9 as 1, and 7 + 1 as 0',
    storeUnsigned(9, 3) === 1 && storeUnsigned(8, 3) === 0, FIG.wrapValue + ' and ' + FIG.wrapSeven);

/* 15. a signed field of width w reads its raw bits as two's complement */
chk('signed:3 reads raw 110 as -2 and raw 011 as 3',
    readSigned(6, 3) === -2 && readSigned(3, 3) === 3, FIG.signedRaw);

/* 16. every value in range survives a store and a read */
var rtBad = null, rtCases = 0;
for (var rw = 1; rw <= 12; rw++) {
  var limit = Math.min(maskOf(rw), 4095);
  for (var v = 0; v <= limit; v++) {
    rtCases++;
    if (storeUnsigned(storeUnsigned(v, rw), rw) !== v) rtBad = 'w' + rw + ' v' + v;
  }
}
chk('all ' + rtCases + ' in-range values survive a store and a read', rtBad === null, rtBad || 'no loss');

/* 17. the shift and mask that read a field agree with its bit positions.
       Restricted to objects that fit in 32 bits, where a word can be built
       exactly in a double without losing a bit. */
var exBad = null, exChecked = 0;
ALL.forEach(function (L) {
  var named = L.named;
  if (!named.length || L.totalBits > 32) return;
  exChecked++;
  var vals = named.map(function (f) { return Math.min(maskOf(f.w), 3 * f.w + 1); });
  var word = packWord(named, vals);
  named.forEach(function (f, i) {
    var got = extractor(f).test(word);
    if (got !== storeUnsigned(vals[i], f.w)) exBad = f.name + ' read ' + got;
  });
});
chk('the shift-and-mask reading agrees with the bit map',
    exBad === null, exBad || 'every field round-tripped on ' + exChecked + ' objects');

/* 18-19. the two constraint violations the standard names */
chk('a width above the unit is rejected', TOOWIDE.errors.length === 1, TOOWIDE.errors[0]);
chk('a named zero-width bit-field is rejected', NAMEDZERO.errors.length === 1, NAMEDZERO.errors[0]);

/* 20. the trap this lesson opens with: three ints against three fields */
chk('three ints are twelve bytes where three fields are four',
    FIG.timeInts === 12 && TIME.size === 4, FIG.timeInts + ' against ' + TIME.size);

/* 21. sizeof is not the sum of the widths, and the difference is the padding */
chk('the padding in the three-field struct is 15 bits',
    TIME.unusedBits === 32 - 17, TIME.unusedBits + ' bits unused');

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

var COL = {
  field: { fill: PAL.accentDim, stroke: PAL.accent },
  field2: { fill: PAL.warnDim, stroke: PAL.warn },
  pad: { fill: PAL.surface2, stroke: PAL.border },
  int: { fill: '#e6eef8', stroke: PAL.info },
  unused: { fill: PAL.surface, stroke: PAL.border }
};

var CX = 90, CW = 24, CH = 26;

/* one allocation unit: 32 cells, bit 31 on the left, bit 0 on the right */
function drawUnit(P, x, y, marks, opts) {
  opts = opts || {};
  var cw = opts.cw || CW, ch = opts.ch || CH;
  for (var b = 0; b < 32; b++) {
    P.rect(x + (31 - b) * cw, y, cw - 1, ch, { fill: PAL.surface, stroke: PAL.border, sw: 1, radius: 1 });
  }
  if (opts.numbers !== false) {
    for (var n = 0; n < 32; n += 4) {
      P.text(x + (31 - n) * cw + cw / 2, y + ch + 8, String(n),
             { size: 8, mono: true, align: 'center', color: PAL.faint });
    }
  }
  (marks || []).forEach(function (m) {
    var cols = m.hi - m.lo;
    var left = x + (31 - (m.hi - 1)) * cw;
    P.rect(left, y + 1, cols * cw - 1, ch - 2,
           { fill: m.fill, stroke: m.stroke, sw: 1.4, radius: 1 });
    if (m.label && cols * cw >= 24) {
      P.text(left + (cols * cw - 1) / 2, y + ch / 2, m.label,
             { size: 9, mono: true, align: 'center', base: 'middle', color: m.labelColor || PAL.ink });
    }
  });
  if (opts.caption) {
    P.text(x, y - 8, opts.caption, { size: 9, mono: true, color: PAL.faint });
  }
}

/* a run of plain bytes, used for the ordinary-int comparison */
function byteRun(P, x, y, n, cw, fill, stroke, label) {
  for (var i = 0; i < n; i++) {
    P.rect(x + i * cw, y, cw - 1, CH, { fill: fill, stroke: stroke, sw: 1, radius: 1 });
  }
  if (label) P.text(x + (n * cw - 1) / 2, y + CH / 2, label,
                    { size: 10, mono: true, align: 'center', base: 'middle', color: PAL.ink });
}

function head(P, n, title) {
  P.text(34, 16, n + '  ' + title, { size: 12, mono: true, color: PAL.dim });
  P.line(34, 36, W - 34, 36, { stroke: PAL.border, sw: 1 });
}

function legend(P, y, items) {
  var x = 40;
  items.forEach(function (it) {
    P.rect(x, y, 12, 12, { fill: it.fill, stroke: it.stroke, sw: 1.2, radius: 2 });
    P.text(x + 17, y + 1, it.label, { size: 10, color: PAL.dim });
    x += 17 + it.label.length * 5.6 + 16;
  });
}

function note(P, x, y, lines, opts) {
  opts = opts || {};
  lines.forEach(function (s, i) {
    P.text(x, y + i * (opts.lh || 18), s, {
      size: opts.size || 11, color: opts.color || PAL.dim, mono: !!opts.mono
    });
  });
}

function on(p, frac) { return p >= frac - 1e-9; }

/* ---------- the twelve scenes ---------- */

var SCENE_DRAW = {

  waste: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 1, 'three small numbers, twelve bytes');
    P.text(40, 50, 'struct time { unsigned h, m, s; };', { size: 12, mono: true, color: PAL.ink });

    var cw = 22;
    ['h', 'm', 's'].forEach(function (nm, i) {
      if (!on(p, 0.06 + i * 0.07)) return;
      var x = 44 + i * 4 * cw;
      byteRun(P, x, 76, 4, cw, COL.int.fill, COL.int.stroke, nm);
    });
    if (on(p, 0.28)) {
      P.text(44 + 12 * cw + 14, 76 + 13, 'four bytes each, and 28 bits of each are always zero',
             { size: 9, mono: true, base: 'middle', color: PAL.faint });
    }
    if (on(p, 0.3)) {
      P.text(44, 118, 'twelve bytes for three numbers that need seventeen bits',
             { size: 12, color: PAL.warn });
    }

    if (on(p, 0.42)) {
      P.text(40, 152, 'the same three values as bit-fields: h:5, m:6, s:6', { size: 12, mono: true, color: PAL.ink });
      drawUnit(P, CX, 176, [
        { lo: 0, hi: 5, fill: COL.field.fill, stroke: COL.field.stroke, label: 'h' },
        { lo: 5, hi: 11, fill: COL.field2.fill, stroke: COL.field2.stroke, label: 'm' },
        { lo: 11, hi: 17, fill: COL.field.fill, stroke: COL.field.stroke, label: 's' },
        { lo: 24, hi: 32, fill: PAL.surface, stroke: PAL.border, label: 'unused' }
      ], { caption: 'one 32-bit unit' });
    }
    if (on(p, 0.72)) {
      note(P, 40, 254, [
        'h <= 23 fits in 5 bits, which hold 32 values;',
        'm and s are <= 59, which fits in 6 bits, holding 64 values.',
        'seventeen bits used, fifteen unused, and the unit is four bytes.'
      ], { size: 11 });
    }
    if (on(p, 0.86)) {
      P.text(40, 320, 'sizeof went from 12 to 4. Nothing was lost: the values still fit.',
             { size: 12, color: PAL.valid });
      P.text(40, 342, 'This is the whole motivation, and it is also the whole trap: the fields are not ints.',
             { size: 11, color: PAL.dim });
    }
    legend(P, 428, [
      { fill: COL.int.fill, stroke: COL.int.stroke, label: 'a full int (4 bytes)' },
      { fill: COL.field.fill, stroke: COL.field.stroke, label: 'a bit-field' },
      { fill: COL.surface2, stroke: PAL.border, label: 'bits not used' }
    ]);
  },

  decl: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 2, 'the declaration, and its four constraints');
    note(P, 40, 54, [
      'struct packet {',
      '    unsigned int kind : 3;',
      '    unsigned int     : 5;',
      '    signed   int seq  : 6;',
      '};'
    ], { mono: true, size: 12, color: PAL.ink, lh: 20 });

    if (on(p, 0.18)) {
      P.text(40, 178, 'name : width', { size: 12, mono: true, color: PAL.accent });
      note(P, 40, 200, [
        'the width is an integer constant expression',
        'the name is optional: without it the bits are padding'
      ], { size: 11 });
    }
    if (on(p, 0.4)) {
      P.text(470, 54, 'the constraints, in the standard\'s words', { size: 11, mono: true, color: PAL.faint });
      note(P, 470, 78, [
        '1. the type is _Bool, signed int, unsigned int,',
        '   or another type the implementation allows',
        '2. 0 <= width <= the width of that type in bits',
        '3. width 0 is allowed only with no name',
        '4. no address, no array, no sizeof of a field'
      ], { size: 11, lh: 22 });
    }
    if (on(p, 0.62)) {
      P.text(470, 200, 'what a width above 32 does', { size: 11, mono: true, color: PAL.faint });
      note(P, 470, 224, [
        'unsigned int a : 33;',
        'is a constraint violation: a diagnostic is',
        'required, and no object is produced.'
      ], { size: 11, mono: false, color: PAL.invalid });
      P.text(470, 286, 'checked in code: the model rejects exactly this width', { size: 10, color: PAL.dim });
    }
    if (on(p, 0.8)) {
      P.text(40, 300, 'A bit-field is not a small int. It is a named run of bits inside',
             { size: 12, color: PAL.ink });
      P.text(40, 322, 'one storage unit, with no address of its own.', { size: 12, color: PAL.ink });
    }
    legend(P, 428, [{ fill: COL.field.fill, stroke: COL.field.stroke, label: 'a named field' },
                    { fill: COL.surface2, stroke: PAL.border, label: 'unnamed padding' }]);
  },

  unit: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 3, 'one allocation unit, thirty-two bits');
    P.text(40, 50, 'the unit is sizeof(int): four bytes, aligned to four', { size: 12, color: PAL.dim });

    drawUnit(P, CX, 100, [], { caption: 'bit 31 ........................................ bit 0' });
    if (on(p, 0.2)) {
      P.text(CX, 152, 'bit 0 is the least significant bit, and it is drawn on the right',
             { size: 11, color: PAL.dim });
      P.text(CX, 172, 'bit b lives in byte b/8, at position b mod 8 inside that byte',
             { size: 11, mono: true, color: PAL.dim });
    }
    if (on(p, 0.45)) {
      drawUnit(P, CX, 200, [
        { lo: 0, hi: 5, fill: COL.field.fill, stroke: COL.field.stroke, label: 'first' }
      ], { numbers: false });
      P.text(CX, 244, 'the first field goes into the low-order bits', { size: 11, color: PAL.ink });
    }
    if (on(p, 0.65)) {
      drawUnit(P, CX, 268, [
        { lo: 0, hi: 5, fill: COL.field.fill, stroke: COL.field.stroke, label: 'first' },
        { lo: 5, hi: 11, fill: COL.field2.fill, stroke: COL.field2.stroke, label: 'next' }
      ], { numbers: false });
      P.text(CX, 312, 'the next field continues where the first stopped', { size: 11, color: PAL.ink });
    }
    if (on(p, 0.84)) {
      P.text(40, 344, 'Which end is "first" is implementation-defined: some compilers pack from the top.',
             { size: 11, color: PAL.warn });
      P.text(40, 366, 'This page draws the low-order-first choice, which is what GCC does on x86-64.',
             { size: 11, color: PAL.dim });
    }
    legend(P, 428, [{ fill: COL.field.fill, stroke: COL.field.stroke, label: 'first field' },
                    { fill: COL.field2.fill, stroke: COL.field2.stroke, label: 'second field' }]);
  },

  pack: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 4, 'four fields, one unit, four bytes');
    P.text(40, 50, 'struct S1 { unsigned b1:5, :11, b2:6, b3:2; };', { size: 12, mono: true, color: PAL.ink });

    var marks = [];
    if (on(p, 0.12)) marks.push({ lo: 0, hi: 5, fill: COL.field.fill, stroke: COL.field.stroke, label: 'b1' });
    if (on(p, 0.3)) marks.push({ lo: 5, hi: 16, fill: COL.surface2, stroke: PAL.border, label: 'pad 11' });
    if (on(p, 0.48)) marks.push({ lo: 16, hi: 22, fill: COL.field2.fill, stroke: COL.field2.stroke, label: 'b2' });
    if (on(p, 0.64)) marks.push({ lo: 22, hi: 24, fill: COL.field.fill, stroke: COL.field.stroke, label: 'b3' });
    drawUnit(P, CX, 96, marks, { caption: 'bits 0 to 31 of the unit' });

    if (on(p, 0.78)) {
      note(P, 40, 168, [
        'b1 takes bits 0 to 4, the unnamed field takes 5 to 15,',
        'b2 takes 16 to 21, b3 takes 22 and 23, and 24 to 31 are unused.',
        '5 + 11 + 6 + 2 = 24 bits, inside one 32-bit unit, so sizeof is 4.'
      ], { size: 11 });
    }
    if (on(p, 0.9)) {
      P.text(40, 250, 'sizeof = ' + S1.size + ' bytes  —  the same answer cppreference prints for this struct',
             { size: 12, mono: true, color: PAL.valid });
      P.text(40, 274, 'Summing the widths gives 3 bytes, not 4: the unit is rounded up to its own size.',
             { size: 11, color: PAL.dim });
    }
    legend(P, 428, [{ fill: COL.field.fill, stroke: COL.field.stroke, label: 'named field' },
                    { fill: COL.surface2, stroke: PAL.border, label: 'unnamed padding' },
                    { fill: COL.surface, stroke: PAL.border, label: 'unused bits of the unit' }]);
  },

  full: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 5, 'when a field does not fit, a new unit starts');
    P.text(40, 50, 'struct { unsigned a:20, b:20; };', { size: 12, mono: true, color: PAL.ink });

    var marks1 = [], marks2 = [];
    if (on(p, 0.1)) marks1.push({ lo: 0, hi: 20, fill: COL.field.fill, stroke: COL.field.stroke, label: 'a' });
    if (on(p, 0.26)) marks2.push({ lo: 32, hi: 52, fill: COL.field2.fill, stroke: COL.field2.stroke, label: 'b' });
    drawUnit(P, CX, 78, marks1, { numbers: false, caption: 'unit 1' });
    drawUnit(P, CX, 130, marks2.map(function (m) { return { lo: 0, hi: 20, fill: m.fill, stroke: m.stroke, label: 'b' }; }),
             { numbers: false, caption: 'unit 2' });
    if (on(p, 0.4)) {
      P.text(CX + 6, 91, '12 bits free', { size: 9, mono: true, base: 'middle', color: PAL.faint });
      P.text(CX + 6, 143, '12 bits free', { size: 9, mono: true, base: 'middle', color: PAL.faint });
    }
    if (on(p, 0.5)) {
      P.text(40, 178, 'b needs 20 bits and only 12 remain, so b starts a new unit.', { size: 11, color: PAL.ink });
      P.text(40, 200, 'sizeof = ' + TWO20.size + ' bytes, with 24 bits of the two units never used.',
             { size: 11, mono: true, color: PAL.valid });
    }
    if (on(p, 0.66)) {
      P.text(40, 234, 'The same declaration, read the other way:', { size: 11, mono: true, color: PAL.faint });
      P.text(40, 256, 'struct { unsigned a:28, b:8; };', { size: 12, mono: true, color: PAL.ink });
      drawUnit(P, CX, 274, [
        { lo: 0, hi: 28, fill: COL.field.fill, stroke: COL.field.stroke, label: 'a' },
        { lo: 28, hi: 32, fill: COL.surface2, stroke: PAL.border, label: '' }
      ], { numbers: false });
    }
    if (on(p, 0.84)) {
      P.text(40, 340, 'b cannot fit in the four bits left, so it starts at bit ' + FIG.a28b8B + ', not at 28.',
             { size: 11, color: PAL.warn });
      P.text(40, 362, 'A compiler that lets fields straddle would put b at 28 to 35 instead. Both are legal.',
             { size: 11, color: PAL.dim });
    }
    legend(P, 428, [{ fill: COL.field.fill, stroke: COL.field.stroke, label: 'first field' },
                    { fill: COL.field2.fill, stroke: COL.field2.stroke, label: 'field moved to the next unit' },
                    { fill: COL.surface2, stroke: PAL.border, label: 'bits left free' }]);
  },

  zero: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 6, 'the zero-width field ends the unit');
    P.text(40, 50, 'struct S2 { unsigned b1:5, :0, b2:6, b3:15; };', { size: 12, mono: true, color: PAL.ink });

    drawUnit(P, CX, 76, [
      { lo: 0, hi: 5, fill: COL.field.fill, stroke: COL.field.stroke, label: 'b1' }
    ], { numbers: false, caption: 'unit 1: b1, then :0 throws the rest away' });
    if (on(p, 0.24)) {
      drawUnit(P, CX, 128, [
        { lo: 0, hi: 6, fill: COL.field2.fill, stroke: COL.field2.stroke, label: 'b2' },
        { lo: 6, hi: 21, fill: COL.field.fill, stroke: COL.field.stroke, label: 'b3' }
      ], { numbers: false, caption: 'unit 2: b2 and b3' });
      P.text(CX, 172, 'sizeof = ' + S2.size + ' bytes', { size: 12, mono: true, color: PAL.valid });
    }
    if (on(p, 0.5)) {
      P.text(40, 208, 'Now delete the :0 and nothing else:', { size: 11, mono: true, color: PAL.faint });
      P.text(40, 228, 'struct S2b { unsigned b1:5, b2:6, b3:15; };', { size: 12, mono: true, color: PAL.ink });
      drawUnit(P, CX, 246, [
        { lo: 0, hi: 5, fill: COL.field.fill, stroke: COL.field.stroke, label: 'b1' },
        { lo: 5, hi: 11, fill: COL.field2.fill, stroke: COL.field2.stroke, label: 'b2' },
        { lo: 11, hi: 26, fill: COL.field.fill, stroke: COL.field.stroke, label: 'b3' }
      ], { numbers: false });
      P.text(CX, 290, 'sizeof = ' + S2B.size + ' bytes', { size: 12, mono: true, color: PAL.valid });
    }
    if (on(p, 0.78)) {
      P.text(40, 322, 'One token, four bytes: ' + S2.size + ' against ' + S2B.size + ', and every field after the :0 moved.',
             { size: 11, color: PAL.warn });
      P.text(40, 344, 'A zero-width field does not take a bit. It moves the next field to the next unit.',
             { size: 11, color: PAL.dim });
    }
    legend(P, 428, [{ fill: COL.field.fill, stroke: COL.field.stroke, label: 'named field' },
                    { fill: COL.field2.fill, stroke: COL.field2.stroke, label: 'second field' }]);
  },

  unnamed: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 7, 'unnamed fields: padding you can place');
    P.text(40, 50, 'struct { unsigned a:4; unsigned :4; unsigned b:2; unsigned :0; unsigned c:1; };',
           { size: 11, mono: true, color: PAL.ink });

    drawUnit(P, CX, 78, [
      { lo: 0, hi: 4, fill: COL.field.fill, stroke: COL.field.stroke, label: 'a' },
      { lo: 4, hi: 8, fill: COL.surface2, stroke: PAL.border, label: ':4' },
      { lo: 8, hi: 10, fill: COL.field2.fill, stroke: COL.field2.stroke, label: 'b' }
    ], { numbers: false, caption: 'unit 1' });
    if (on(p, 0.3)) {
      drawUnit(P, CX, 130, [
        { lo: 0, hi: 1, fill: COL.field.fill, stroke: COL.field.stroke, label: 'c' }
      ], { numbers: false, caption: 'unit 2: c, because of the :0' });
      P.text(CX, 174, 'sizeof = ' + PADDEMO.size + ' bytes', { size: 12, mono: true, color: PAL.valid });
    }
    if (on(p, 0.5)) {
      P.text(40, 208, 'Two kinds of unnamed field, and they are not the same thing:', { size: 11, color: PAL.ink });
      note(P, 40, 232, [
        'unsigned : 4   takes four bits of the current unit and gives them to nobody.',
        'unsigned : 0   takes no bits at all, and ends the unit where it stands.'
      ], { size: 11, lh: 20 });
    }
    if (on(p, 0.7)) {
      P.text(40, 288, 'You cannot read or write a padding field, and its bits are not preserved', { size: 11, color: PAL.dim });
      P.text(40, 310, 'by an assignment of the whole struct: they are padding, not a member.', { size: 11, color: PAL.dim });
    }
    if (on(p, 0.86)) {
      P.text(40, 344, 'The reason they exist is layout: they are the only way to place a field at a chosen bit.',
             { size: 11, color: PAL.warn });
    }
    legend(P, 428, [{ fill: COL.field.fill, stroke: COL.field.stroke, label: 'named field' },
                    { fill: COL.surface2, stroke: PAL.border, label: 'unnamed padding field' },
                    { fill: COL.field2.fill, stroke: COL.field2.stroke, label: 'named field after padding' }]);
  },

  mixed: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 8, 'a full member ends the unit');
    P.text(40, 50, 'struct { unsigned light:1, toast:1; int count; unsigned ac:4, :4, clock:1, :0, flag:1; };',
           { size: 10, mono: true, color: PAL.ink });

    drawUnit(P, CX, 74, [
      { lo: 0, hi: 1, fill: COL.field.fill, stroke: COL.field.stroke, label: '' },
      { lo: 1, hi: 2, fill: COL.field2.fill, stroke: COL.field2.stroke, label: '' }
    ], { numbers: false, caption: 'unit 1: light, toast, then 30 bits lost' });
    if (on(p, 0.2)) {
      P.text(CX + 2 * CW + 8, 87, 'light toast', { size: 9, mono: true, base: 'middle', color: PAL.ink });
      P.text(CX + 2 * CW + 8, 103, 'bits 0, 1', { size: 9, mono: true, base: 'middle', color: PAL.faint });
    }
    if (on(p, 0.32)) {
      byteRun(P, CX, 118, 4, CW, COL.int.fill, COL.int.stroke, 'count');
      P.text(CX + 4 * CW + 10, 131, 'a full int: 4 bytes, aligned to 4, and the unit above ends here',
             { size: 9, mono: true, base: 'middle', color: PAL.dim });
    }
    if (on(p, 0.48)) {
      drawUnit(P, CX, 160, [
        { lo: 0, hi: 4, fill: COL.field.fill, stroke: COL.field.stroke, label: 'ac' },
        { lo: 4, hi: 8, fill: COL.surface2, stroke: PAL.border, label: ':4' },
        { lo: 8, hi: 9, fill: COL.field2.fill, stroke: COL.field2.stroke, label: '' }
      ], { numbers: false, caption: 'unit 3: ac, padding, clock' });
    }
    if (on(p, 0.66)) {
      drawUnit(P, CX, 212, [
        { lo: 0, hi: 1, fill: COL.field.fill, stroke: COL.field.stroke, label: '' }
      ], { numbers: false, caption: 'unit 4: flag, because of the :0' });
      P.text(CX + 1 * CW + 8, 225, 'flag', { size: 9, mono: true, base: 'middle', color: PAL.ink });
    }
    if (on(p, 0.82)) {
      P.text(40, 268, 'Four units, ' + ONOFF.size + ' bytes, to hold seven small values and one int.',
             { size: 12, mono: true, color: PAL.valid });
      P.text(40, 292, 'The two-bit tail above count is lost because a bit-field cannot share a unit with an int.',
             { size: 11, color: PAL.warn });
      P.text(40, 314, 'This is the size a reported run prints for this declaration: ' + ONOFF.size + '.',
             { size: 11, color: PAL.dim });
    }
    legend(P, 428, [{ fill: COL.field.fill, stroke: COL.field.stroke, label: 'bit-field' },
                    { fill: COL.int.fill, stroke: COL.int.stroke, label: 'full int member' },
                    { fill: COL.surface2, stroke: PAL.border, label: 'unnamed padding' }]);
  },

  range: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 9, 'the width decides the range, and the reading');
    P.text(40, 50, 'unsigned int a : 3;   signed int b : 3;', { size: 12, mono: true, color: PAL.ink });

    var cw = 42, x = 120, y = 88;
    var raws = [0, 1, 2, 3, 4, 5, 6, 7];
    raws.forEach(function (r, i) {
      if (!on(p, 0.1 + i * 0.045)) return;
      var xx = x + i * cw;
      P.rect(xx, y, cw - 4, 34, { fill: COL.field.fill, stroke: COL.field.stroke, sw: 1.2, radius: 2 });
      P.text(xx + (cw - 4) / 2, y + 17, ('000' + r.toString(2)).slice(-3),
             { size: 11, mono: true, align: 'center', base: 'middle', color: PAL.ink });
      P.text(xx + (cw - 4) / 2, y + 48, 'a = ' + r, { size: 10, mono: true, align: 'center', color: PAL.valid });
      P.text(xx + (cw - 4) / 2, y + 64, 'b = ' + readSigned(r, 3), { size: 10, mono: true, align: 'center', color: PAL.warn });
    });
    if (on(p, 0.55)) {
      P.text(x, y + 86, 'the same three bits, read unsigned and read signed', { size: 11, color: PAL.dim });
    }
    if (on(p, 0.66)) {
      note(P, 40, 210, [
        'unsigned:3 holds 0 to 7. signed:3 holds -4 to 3, because the top bit is the sign.',
        'A store is reduced modulo 2^w: a = 9 keeps 1001 mod 8 = 1, and 7 + 1 wraps to 0.',
        'A read of 110 as a signed field is -2, which is why 6 and -2 are the same bits.'
      ], { size: 11, lh: 20 });
    }
    if (on(p, 0.84)) {
      P.text(40, 292, 'So the answer to "what does a print" depends on the declared signedness, not on the bits.',
             { size: 11, color: PAL.ink });
      P.text(40, 314, 'For a plain int field, which of the two applies is implementation-defined.', { size: 11, color: PAL.invalid });
      P.text(40, 336, 'Checked in code: store 9 reads ' + FIG.wrapValue + ', and raw 110 reads ' + FIG.signedRaw + '.',
             { size: 11, mono: true, color: PAL.dim });
    }
    legend(P, 428, [{ fill: COL.field.fill, stroke: COL.field.stroke, label: 'three bits of the field' }]);
  },

  noaddress: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 10, 'a bit-field has no address');
    P.text(40, 50, 'struct { unsigned a:3, b:5; } s;', { size: 12, mono: true, color: PAL.ink });

    if (on(p, 0.1)) {
      P.text(40, 84, '&s.a', { size: 14, mono: true, color: PAL.invalid });
      P.text(120, 86, 'is a constraint violation: the operand of & may not be a bit-field',
             { size: 11, color: PAL.invalid });
    }
    if (on(p, 0.26)) {
      P.text(40, 118, 'sizeof s.a', { size: 14, mono: true, color: PAL.invalid });
      P.text(186, 120, 'is not allowed either: sizeof takes an object or a type, not a field',
             { size: 11, color: PAL.invalid });
    }
    if (on(p, 0.42)) {
      P.text(40, 152, 'struct { unsigned f:3; } arr[4];', { size: 14, mono: true, color: PAL.invalid });
      P.text(346, 154, 'an array of bit-fields does not exist', { size: 11, color: PAL.invalid });
    }
    if (on(p, 0.58)) {
      P.text(40, 186, 'offsetof(struct, a)', { size: 14, mono: true, color: PAL.invalid });
      P.text(266, 188, 'has no answer: calling it on a bit-field is undefined', { size: 11, color: PAL.invalid });
    }
    if (on(p, 0.72)) {
      P.text(40, 226, 'The reason is the same in all four cases:', { size: 12, color: PAL.ink });
      note(P, 40, 250, [
        'a bit-field may begin in the middle of a byte and end in the middle of the next.',
        'There is no byte address that designates it, so no pointer, no array, no size.',
        'scanf("%d", &s.a) therefore cannot be made to work at all.'
      ], { size: 11, lh: 20 });
    }
    if (on(p, 0.88)) {
      P.text(40, 330, 'What you can do is copy it out: int t = s.a; then take &t.', { size: 11, color: PAL.valid });
    }
    legend(P, 428, [{ fill: COL.invalidDim, stroke: PAL.invalid, label: 'refused by the compiler' },
                    { fill: COL.field.fill, stroke: COL.field.stroke, label: 'a bit-field' }]);
  },

  impl: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 11, 'six things the standard leaves open');
    note(P, 40, 54, [
      '1. the order of fields inside a unit: low bits first, or high bits first',
      '2. whether a field that does not fit may straddle the unit boundary',
      '3. whether a plain int field is signed or unsigned',
      '4. whether types other than _Bool, int, signed int and unsigned int are allowed',
      '5. whether an atomic bit-field type is allowed',
      '6. the alignment of the unit itself (the standard calls this unspecified)'
    ], { size: 11, lh: 24 });

    if (on(p, 0.4)) {
      P.text(40, 214, 'What this means for a question', { size: 12, mono: true, color: PAL.accent });
      note(P, 40, 238, [
        'A question that asks for sizeof, or for which bits a field occupies,',
        'must tell you the platform, or it has no single answer.',
        'A question that asks for a field value printed by a given declaration',
        'has an answer only if the signedness is written down.'
      ], { size: 11, lh: 20 });
    }
    if (on(p, 0.68)) {
      P.text(40, 326, 'The standard does fix two things, and they are the two a question can rely on:', { size: 11, color: PAL.ink });
      P.text(40, 348, 'a following field is packed into the same unit if it fits, and the width sets the range.',
             { size: 11, color: PAL.valid });
    }
    if (on(p, 0.86)) {
      P.text(40, 382, 'Everything this page computes assumes items 1, 2, 3 and 6 resolved the GCC-on-x86-64 way.',
             { size: 10, color: PAL.dim });
    }
    legend(P, 428, [{ fill: COL.warnDim, stroke: PAL.warn, label: 'implementation-defined' },
                    { fill: COL.accentDim, stroke: PAL.accent, label: 'fixed by the standard' }]);
  },

  procedure: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 12, 'the five-step reading procedure');

    var steps = [
      '1. Is the member a bit-field? Look for the colon.',
      '2. What is its declared type? That fixes the unit size and the range.',
      '3. Pack in order; a field that does not fit starts a new unit.',
      '4. A :0 ends the unit; an unnamed field only consumes bits.',
      '5. Round the total up to the unit size, then to the struct alignment.'
    ];
    steps.forEach(function (s, i) {
      if (!on(p, 0.06 + i * 0.14)) return;
      P.text(40, 60 + i * 34, s, { size: 12, color: PAL.ink });
    });

    if (on(p, 0.78)) {
      P.line(40, 244, W - 40, 244, { stroke: PAL.border, sw: 1 });
      P.text(40, 262, 'a worked line, using the rule', { size: 11, mono: true, color: PAL.faint });
      note(P, 40, 286, [
        'unsigned b1:5, b2:6, b3:15  ->  5 + 6 + 15 = 26 bits, one unit, sizeof 4',
        'the same three fields with :0 after b1  ->  two units, sizeof 8'
      ], { size: 11, mono: true, lh: 22 });
      P.text(40, 350, 'Check one line by hand: 26 bits is 4 bytes only because the unit is 4 bytes.',
             { size: 11, color: PAL.dim });
    }
    legend(P, 428, [{ fill: COL.field.fill, stroke: COL.field.stroke, label: 'the object being sized' }]);
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

window.__MODEL = { FIG: FIG, S1: S1, S2: S2, ONOFF: ONOFF, CHECKS: CHECKS };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
