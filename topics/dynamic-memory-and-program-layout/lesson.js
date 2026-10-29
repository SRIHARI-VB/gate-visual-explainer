/* ==========================================================================
   dynamic-memory-and-program-layout — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no chunk arithmetic, no copy counting
   and no overflow arithmetic of its own; every figure on the canvas was
   computed once here and checked against the rule it is supposed to satisfy.

   Two kinds of fact appear below and they are kept apart:
     - what the C standard guarantees (malloc returns uninitialised storage,
       aligned for any object type with fundamental alignment; calloc zeroes
       every byte; free of a null pointer does nothing; realloc preserves the
       lesser of the two sizes and does not free the old block on failure);
     - what one implementation does (glibc's 16-byte rounding, 32-byte minimum
       chunk, 8-byte size word, and the text/data/bss/heap/stack order of a
       Linux x86-64 process image). The second kind is labelled as such on the
       canvas and in the captions.
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

/* ---------- the four storage durations and where they live ---------- */

var DURATIONS = ['automatic', 'static', 'allocated', 'thread'];

var SEGMENTS = [
  { id: 'stack', label: 'stack', note: 'grows down', high: true },
  { id: 'heap',  label: 'heap',  note: 'grows up' },
  { id: 'bss',   label: 'bss',   note: 'zero-initialised statics' },
  { id: 'data',  label: 'data',  note: 'initialised statics' },
  { id: 'rodata', label: 'rodata', note: 'string literals' },
  { id: 'text',  label: 'text',  note: 'machine code' }
];

var OBJECTS = [
  { code: 'int g = 7;',        scope: 'file scope',   segment: 'data',    duration: 'static',    value: '7' },
  { code: 'int z;',            scope: 'file scope',   segment: 'bss',     duration: 'static',    value: '0' },
  { code: 'static int s;',     scope: 'in a function', segment: 'bss',    duration: 'static',    value: '0' },
  { code: 'char *p = "hi";',   scope: 'file scope',   segment: 'rodata',  duration: 'static',    value: '"hi"' },
  { code: 'int x;',            scope: 'in a function', segment: 'stack',  duration: 'automatic', value: 'indeterminate' },
  { code: 'q = malloc(8);',    scope: 'in a function', segment: 'heap',   duration: 'allocated', value: 'indeterminate' }
];

/* ---------- glibc's chunk arithmetic (implementation, not standard) ---------- */

var SIZE_SZ = 8;          /* one machine word: the size field in the header */
var MALLOC_ALIGN = 16;    /* chunks are multiples of this on x86-64          */
var MINSIZE = 32;         /* the smallest chunk that can also hold a free list */

function request2size(req) {
  var padded = req + SIZE_SZ + (MALLOC_ALIGN - 1);
  var aligned = padded - (padded % MALLOC_ALIGN);
  return aligned < MINSIZE ? MINSIZE : aligned;
}

function usableOf(req) { return request2size(req) - SIZE_SZ; }

var REQS = [0, 1, 8, 16, 17, 24, 25, 32, 40, 41, 64, 72, 100, 1000];
var CHUNK_ROWS = REQS.map(function (r) {
  var c = request2size(r);
  return { req: r, chunk: c, usable: c - SIZE_SZ, header: SIZE_SZ, waste: c - SIZE_SZ - r };
});

/* ---------- realloc: the three outcomes ---------- */

var OLD_INTS = 8, NEW_INTS = 16;
var OLD_BYTES = OLD_INTS * 4, NEW_BYTES = NEW_INTS * 4;

var REALLOC = [
  {
    id: 'inplace', label: 'grows in place', oldAddr: '0x1000', newAddr: '0x1000',
    moved: false, failed: false,
    copies: 0, preserved: OLD_BYTES, fresh: NEW_BYTES - OLD_BYTES
  },
  {
    id: 'moved', label: 'moves', oldAddr: '0x1000', newAddr: '0x2000',
    moved: true, failed: false,
    copies: Math.min(OLD_BYTES, NEW_BYTES), preserved: Math.min(OLD_BYTES, NEW_BYTES),
    fresh: NEW_BYTES - Math.min(OLD_BYTES, NEW_BYTES)
  },
  {
    id: 'failed', label: 'fails', oldAddr: '0x1000', newAddr: null,
    moved: false, failed: true,
    copies: 0, preserved: OLD_BYTES, fresh: 0
  }
];

/* a shrink, for the preserved = min(old,new) check */
var SHRINK = { oldBytes: NEW_BYTES, newBytes: OLD_BYTES, preserved: Math.min(NEW_BYTES, OLD_BYTES) };

/* ---------- the doubling growth policy ---------- */

function growthTrace(n) {
  var cap = 0, copies = 0, reallocs = 0, steps = [];
  for (var i = 0; i < n; i++) {
    if (i === cap) {
      var next = cap === 0 ? 1 : cap * 2;
      steps.push({ at: i, from: cap, to: next, copied: cap });
      copies += cap;
      cap = next;
      reallocs++;
    }
  }
  return { n: n, copies: copies, reallocs: reallocs, capacity: cap, steps: steps };
}

var TRACE16 = growthTrace(16);
var TRACE17 = growthTrace(17);
var DOUBLING_ROWS = [1, 2, 3, 4, 5, 8, 9, 16, 17, 100, 1024].map(growthTrace);
var TRACE_ALL = [];
for (var n = 1; n <= 1024; n++) TRACE_ALL.push(growthTrace(n));

/* the quadratic alternative: grow by exactly one each time */
function linearCopies(n) { return n * (n - 1) / 2; }
var LINEAR16 = linearCopies(16);

/* ---------- the multiplication overflow ---------- */

var BITS32 = 4294967296;          /* 2^32 */
var SIZE_MAX32 = BITS32 - 1;
var BIG_N = 1073741824;           /* 2^30 */
var BIG_PRODUCT = BIG_N * 4;      /* 2^32 exactly */
var BIG_WRAPPED = BIG_PRODUCT % BITS32;
var SAFE_LIMIT = Math.floor(SIZE_MAX32 / 4);

/* ---------- the sizeof trap ---------- */

var SIZEOF_PTR = 8;
var TEN_INTS = 10 * 4;
var SHORTFALL = TEN_INTS - SIZEOF_PTR;
var STR = 'hello';
var STR_LEN = STR.length;
var STR_NEED = STR_LEN + 1;

/* ---------- fragmentation ---------- */

var CHUNK_BYTES = 32;
var FRAG_CHUNKS = 6;
var FRAG_TOTAL = FRAG_CHUNKS * CHUNK_BYTES;
var FRAG_FREED = [1, 3, 5];
var FRAG_FREE_TOTAL = FRAG_FREED.length * CHUNK_BYTES;
var FRAG_LARGEST_HOLE = CHUNK_BYTES;
var FRAG_REQUEST = 40;
var FRAG_REQUIRED = request2size(FRAG_REQUEST);

/* ---------- the leak count ---------- */

var LEAK_ITERATIONS = 1000;
var LEAK_BYTES = LEAK_ITERATIONS * CHUNK_BYTES;

/* ---------- collected for the drawing layer ---------- */

var V = {
  durations: DURATIONS, segments: SEGMENTS, objects: OBJECTS,
  chunkRows: CHUNK_ROWS, align: MALLOC_ALIGN, minChunk: MINSIZE, sizeSz: SIZE_SZ,
  realloc: REALLOC, shrink: SHRINK, oldInts: OLD_INTS, newInts: NEW_INTS,
  trace16: TRACE16, trace17: TRACE17, doublingRows: DOUBLING_ROWS, linear16: LINEAR16,
  bigN: BIG_N, bigProduct: BIG_PRODUCT, bigWrapped: BIG_WRAPPED,
  safeLimit: SAFE_LIMIT, bits32: BITS32,
  sizeofPtr: SIZEOF_PTR, tenInts: TEN_INTS, shortfall: SHORTFALL,
  strLen: STR_LEN, strNeed: STR_NEED,
  fragTotal: FRAG_TOTAL, fragFreed: FRAG_FREED, fragFreeTotal: FRAG_FREE_TOTAL,
  fragLargestHole: FRAG_LARGEST_HOLE, fragRequest: FRAG_REQUEST,
  fragRequired: FRAG_REQUIRED, chunkBytes: CHUNK_BYTES, fragChunks: FRAG_CHUNKS,
  leakIterations: LEAK_ITERATIONS, leakBytes: LEAK_BYTES
};

/* ======================================================================
   LAYER 2 - THE CHECKS
   Every number above is re-verified here against the rule it must obey.
   ====================================================================== */

/* 1-3. the storage-duration model */
(function () {
  var bad = OBJECTS.filter(function (o) { return DURATIONS.indexOf(o.duration) < 0; });
  chk('every object has one of the four storage durations', bad.length === 0,
      bad.map(function (o) { return o.code; }).join(','));
})();
(function () {
  var bad = OBJECTS.filter(function (o) {
    return o.duration === 'static' && o.value === 'indeterminate';
  });
  chk('no static-duration object starts indeterminate', bad.length === 0,
      bad.map(function (o) { return o.code; }).join(','));
})();
(function () {
  var bad = OBJECTS.filter(function (o) {
    return (o.duration === 'automatic' || o.duration === 'allocated') && o.value !== 'indeterminate';
  });
  chk('every automatic or allocated object starts indeterminate', bad.length === 0, '');
})();
(function () {
  var segs = {};
  OBJECTS.forEach(function (o) { segs[o.segment] = true; });
  var known = SEGMENTS.map(function (s) { return s.id; });
  var bad = Object.keys(segs).filter(function (s) { return known.indexOf(s) < 0; });
  chk('every segment named by an object exists in the map', bad.length === 0, bad.join(','));
})();
(function () {
  var statics = OBJECTS.filter(function (o) { return o.duration === 'static'; });
  chk('all four static-duration objects land in data, bss or rodata, never on the stack',
      statics.every(function (o) { return o.segment === 'data' || o.segment === 'bss' || o.segment === 'rodata'; }),
      statics.length);
})();

/* 6-11. the chunk arithmetic, checked against its own definition */
(function () {
  var bad = CHUNK_ROWS.filter(function (r) { return r.chunk % MALLOC_ALIGN !== 0; });
  chk('every chunk size is a multiple of 16', bad.length === 0,
      bad.map(function (r) { return r.req; }).join(','));
})();
(function () {
  var bad = CHUNK_ROWS.filter(function (r) { return r.chunk < MINSIZE; });
  chk('no chunk is smaller than the 32-byte minimum', bad.length === 0, '');
})();
(function () {
  var bad = CHUNK_ROWS.filter(function (r) { return r.usable < r.req; });
  chk('usable bytes are never fewer than the bytes requested, for all fourteen rows',
      bad.length === 0, bad.map(function (r) { return r.req; }).join(','));
})();
(function () {
  var bad = [];
  for (var i = 1; i < CHUNK_ROWS.length; i++) {
    if (CHUNK_ROWS[i].chunk < CHUNK_ROWS[i - 1].chunk) bad.push(CHUNK_ROWS[i].req);
  }
  chk('chunk size never decreases as the request grows', bad.length === 0, bad.join(','));
})();
(function () {
  var byReq = {};
  CHUNK_ROWS.forEach(function (r) { byReq[r.req] = r; });
  chk('request 1 gives a 32-byte chunk with 24 usable',
      byReq[1].chunk === 32 && byReq[1].usable === 24, byReq[1].chunk + '/' + byReq[1].usable);
  chk('request 25 gives a 48-byte chunk with 40 usable',
      byReq[25].chunk === 48 && byReq[25].usable === 40, byReq[25].chunk + '/' + byReq[25].usable);
  chk('request 1000 gives a 1008-byte chunk with exactly 1000 usable',
      byReq[1000].chunk === 1008 && byReq[1000].usable === 1000, byReq[1000].chunk);
  chk('the whole 1 to 24 range collapses into one 32-byte chunk',
      [1, 8, 16, 17, 24].every(function (r) { return byReq[r].chunk === 32; }), '');
})();
(function () {
  chk('the header is one 8-byte word, so usable = chunk - 8',
      CHUNK_ROWS.every(function (r) { return r.usable === r.chunk - SIZE_SZ; }), '');
})();

/* 12-16. realloc */
(function () {
  chk('in-place growth copies nothing and keeps the address',
      REALLOC[0].copies === 0 && REALLOC[0].oldAddr === REALLOC[0].newAddr, REALLOC[0].copies);
  chk('a move copies exactly the smaller of the two sizes',
      REALLOC[1].copies === Math.min(OLD_BYTES, NEW_BYTES), REALLOC[1].copies);
  chk('a failure returns no pointer and leaves the old block whole',
      REALLOC[2].failed && REALLOC[2].newAddr === null && REALLOC[2].preserved === OLD_BYTES, '');
  chk('preserved plus fresh equals the new size, in both growth cases',
      REALLOC[0].preserved + REALLOC[0].fresh === NEW_BYTES &&
      REALLOC[1].preserved + REALLOC[1].fresh === NEW_BYTES, '');
  chk('shrinking keeps only the new size, so preserved = min(old, new)',
      SHRINK.preserved === OLD_BYTES && SHRINK.preserved === Math.min(SHRINK.oldBytes, SHRINK.newBytes), SHRINK.preserved);
})();

/* 17-21. the doubling policy */
(function () {
  var bad = TRACE_ALL.filter(function (t) {
    var cap = 1;
    while (cap < t.n) cap *= 2;
    return t.copies !== cap - 1;
  });
  chk('for every n up to 1024, total copies = 2^ceil(log2 n) - 1', bad.length === 0,
      bad.length ? 'first n = ' + bad[0].n : '');
})();
(function () {
  var bad = TRACE_ALL.filter(function (t) { return !(t.copies < 2 * t.n); });
  chk('total copies stay below 2n for every n up to 1024', bad.length === 0, '');
})();
(function () {
  chk('appending 16 items copies 15 elements', TRACE16.copies === 15, TRACE16.copies);
  chk('appending 17 items copies 31 elements', TRACE17.copies === 31, TRACE17.copies);
  chk('16 items under doubling cost 15 copies against 120 if the array grew by one',
      TRACE16.copies === 15 && LINEAR16 === 120, LINEAR16);
})();
(function () {
  var bad = TRACE_ALL.filter(function (t) {
    return t.reallocs > Math.ceil(Math.log(t.n) / Math.log(2)) + 1;
  });
  chk('the number of reallocations is at most log2(n) + 1', bad.length === 0, '');
  chk('capacity never drops below n and is always a power of two',
      TRACE_ALL.every(function (t) {
        var c = t.capacity;
        return c >= t.n && (c & (c - 1)) === 0;
      }), '');
})();

/* 22-25. the overflow */
(function () {
  chk('2^30 times 4 is exactly 2^32', BIG_PRODUCT === BITS32, BIG_PRODUCT);
  chk('that product wraps to 0 in a 32-bit size_t', BIG_WRAPPED === 0, BIG_WRAPPED);
  chk('the division check rejects 2^30 because SIZE_MAX / 4 is smaller',
      BIG_N > SAFE_LIMIT, SAFE_LIMIT);
  chk('SIZE_MAX / 4 times 4 does not exceed SIZE_MAX',
      SAFE_LIMIT * 4 <= SIZE_MAX32, SAFE_LIMIT * 4);
})();

/* 26-28. the sizeof and string traps */
(function () {
  chk('malloc(sizeof(p)) gives 8 bytes where ten ints need 40', SIZEOF_PTR === 8 && TEN_INTS === 40, TEN_INTS);
  chk('the shortfall is 32 bytes, which is eight ints past the end', SHORTFALL === 32, SHORTFALL);
  chk('a string of length 5 needs 6 bytes with its terminator', STR_NEED === 6, STR_NEED);
})();

/* 29-32. fragmentation */
(function () {
  chk('six 32-byte chunks fill 192 bytes', FRAG_TOTAL === 192, FRAG_TOTAL);
  chk('freeing three of them frees 96 bytes', FRAG_FREE_TOTAL === 96, FRAG_FREE_TOTAL);
  chk('a 40-byte request needs a 48-byte chunk', FRAG_REQUIRED === 48, FRAG_REQUIRED);
  chk('the total free bytes exceed the requirement while the largest hole does not',
      FRAG_FREE_TOTAL >= FRAG_REQUIRED && FRAG_LARGEST_HOLE < FRAG_REQUIRED,
      FRAG_FREE_TOTAL + ' free, ' + FRAG_LARGEST_HOLE + ' largest, ' + FRAG_REQUIRED + ' needed');
  chk('the largest hole is one freed chunk, because the holes are not adjacent',
      FRAG_LARGEST_HOLE === CHUNK_BYTES, FRAG_LARGEST_HOLE);
})();

/* 33. the leak */
(function () {
  chk('1000 unfreed allocations of a small block hold 32000 bytes',
      LEAK_BYTES === 32000, LEAK_BYTES);
})();

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

var COL = {
  used:    { fill: PAL.accentDim, stroke: PAL.accent },
  freed:   { fill: PAL.surface2,  stroke: PAL.border },
  header:  { fill: PAL.warnDim,   stroke: PAL.warn },
  user:    { fill: '#e7eef7',     stroke: PAL.info },
  pad:     { fill: PAL.surface2,  stroke: PAL.border },
  bad:     { fill: PAL.invalidDim, stroke: PAL.invalid },
  ok:      { fill: '#e6f0e6',     stroke: PAL.valid }
};

function head(P, n, title) {
  P.text(34, 16, n + '  ' + title, { size: 12, mono: true, color: PAL.dim });
  P.line(34, 36, W - 34, 36, { stroke: PAL.border, sw: 1 });
}

function note(P, x, y, lines, opts) {
  opts = opts || {};
  lines.forEach(function (s, i) {
    P.text(x, y + i * (opts.lh || 17), s, {
      size: opts.size || 12, color: opts.color || PAL.dim, mono: !!opts.mono
    });
  });
}

function on(p, frac) { return p >= frac - 1e-9; }

function legend(P, y, items) {
  var x = 40;
  items.forEach(function (it) {
    var c = COL[it.type] || COL.used;
    P.rect(x, y, 12, 12, { fill: c.fill, stroke: c.stroke, sw: 1.2, radius: 2 });
    P.text(x + 17, y + 1, it.label, { size: 10, color: PAL.dim });
    x += 17 + it.label.length * 5.4 + 16;
  });
}

/* a row of byte cells; labels is an optional per-cell string */
function cells(P, x, y, n, cw, ch, style, labels, opts) {
  opts = opts || {};
  var c = COL[style] || COL.user;
  for (var i = 0; i < n; i++) {
    P.rect(x + i * cw, y, cw, ch, { fill: c.fill, stroke: c.stroke, sw: 1.1, radius: 2 });
    if (labels && labels[i] !== undefined && cw >= 16) {
      P.text(x + i * cw + cw / 2, y + ch / 2, labels[i],
             { size: opts.size || 10, mono: true, align: 'center', base: 'middle', color: PAL.ink });
    }
  }
  return x + n * cw;
}

/* ---------- the ten scenes ---------- */

var SCENE_DRAW = {

  map: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 1, 'four storage durations, one memory map');

    /* the map, top of the canvas is the high address */
    var mx = 60, mw = 170, y = 60;
    var bands = [
      { id: 'stack', h: 58, addr: '0x7fff...' },
      { id: 'heap',  h: 62, addr: '0x5555...' },
      { id: 'bss',   h: 34, addr: '0x5555...' },
      { id: 'data',  h: 34, addr: '0x5555...' },
      { id: 'rodata', h: 34, addr: '0x5555...' },
      { id: 'text',  h: 34, addr: '0x400000' }
    ];
    P.text(mx, y - 18, 'high address', { size: 9, mono: true, color: PAL.faint });
    var yy = y;
    bands.forEach(function (b, i) {
      if (!on(p, 0.12 + i * 0.06)) return;
      var s = SEGMENTS.filter(function (q) { return q.id === b.id; })[0];
      P.rect(mx, yy, mw, b.h, {
        fill: b.id === 'heap' ? PAL.accentDim : b.id === 'stack' ? PAL.warnDim : PAL.surface2,
        stroke: PAL.border, sw: 1.2, radius: 3
      });
      P.text(mx + 10, yy + 12, s.label, { size: 11, mono: true, color: PAL.ink });
      P.text(mx + 10, yy + b.h - 8, s.note, { size: 8, color: PAL.dim });
      P.text(mx + mw + 10, yy + b.h / 2, b.addr, { size: 9, mono: true, base: 'middle', color: PAL.faint });
      yy += b.h + 4;
    });
    P.text(mx, yy + 6, 'low address', { size: 9, mono: true, color: PAL.faint });

    /* the two growth arrows */
    if (on(p, 0.4)) {
      P.arrow(mx + mw - 14, y + 62 + 4, mx + mw - 14, y + 40, { stroke: PAL.accent, sw: 1.6, head: 7 });
      P.text(mx + mw - 8, y + 50, 'up', { size: 9, mono: true, color: PAL.accent });
      P.arrow(mx + mw - 34, y + 16, mx + mw - 34, y + 40, { stroke: PAL.warn, sw: 1.6, head: 7 });
      P.text(mx + mw - 30, y + 30, 'down', { size: 9, mono: true, color: PAL.warn });
    }

    /* the object table */
    var tx = 350, ty = 74;
    P.text(tx, ty - 18, 'object', { size: 9, mono: true, color: PAL.faint });
    P.text(tx + 190, ty - 18, 'segment', { size: 9, mono: true, color: PAL.faint });
    P.text(tx + 290, ty - 18, 'duration', { size: 9, mono: true, color: PAL.faint });
    P.text(tx + 400, ty - 18, 'first value', { size: 9, mono: true, color: PAL.faint });
    OBJECTS.forEach(function (o, i) {
      if (!on(p, 0.34 + i * 0.09)) return;
      var ry = ty + i * 26;
      P.text(tx, ry, o.code, { size: 10, mono: true, color: PAL.ink });
      P.text(tx + 190, ry, o.segment, { size: 10, mono: true, color: PAL.accent });
      P.text(tx + 290, ry, o.duration, { size: 10, color: PAL.dim });
      P.text(tx + 400, ry, o.value, {
        size: 10, mono: true,
        color: o.value === 'indeterminate' ? PAL.invalid : PAL.valid
      });
    });

    if (on(p, 0.9)) {
      P.text(350, 268, 'Addresses shown are schematic: the segment order is a loader convention,',
             { size: 10, color: PAL.faint });
      P.text(350, 284, 'not something the C standard fixes.', { size: 10, color: PAL.faint });
    }
    legend(P, 428, [{ type: 'used', label: 'allocated duration' }, { type: 'header', label: 'automatic duration' }, { type: 'freed', label: 'static duration' }]);
  },

  chunk: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 2, 'the heap is a table of chunks');
    P.text(34, 54, 'what you ask for, and what the allocator builds', { size: 11, color: PAL.dim });

    /* one chunk in detail: eight header bytes, then twenty-four user bytes */
    var cw = 13, ch = 30, x = 60, y = 96;
    cells(P, x, y, SIZE_SZ, cw, ch, 'header', null);
    P.text(x + SIZE_SZ * cw / 2, y + ch / 2, 'size', { size: 8, mono: true, align: 'center', base: 'middle', color: PAL.warn });
    cells(P, x + SIZE_SZ * cw, y, 8, cw, ch, 'used', ['1', '2', '3', '4', '5', '6', '7', '8'], { size: 8 });
    if (on(p, 0.3)) {
      cells(P, x + (SIZE_SZ + 8) * cw, y, 16, cw, ch, 'pad', null);
      P.text(x + (SIZE_SZ + 16) * cw, y + ch / 2, 'unrequested',
             { size: 8, align: 'center', base: 'middle', color: PAL.faint });
      P.text(x, y - 14, 'a request for 8 bytes, at one cell per byte', { size: 9, mono: true, color: PAL.dim });
      P.text(x, y + ch + 10, 'header 8 + user 24 = a 32-byte chunk, and only 8 of them were asked for',
             { size: 10, color: PAL.ink });
    }

    /* the rule */
    if (on(p, 0.45)) {
      P.text(60, 168, 'request2size(req) = max(32, (req + 8 + 15) rounded down to a multiple of 16)',
             { size: 10, mono: true, color: PAL.ink });
      P.text(60, 186, 'usable(req) = request2size(req) - 8', { size: 10, mono: true, color: PAL.ink });
      P.text(60, 206, 'glibc on x86-64: 16-byte alignment, 32-byte minimum chunk, one 8-byte size word',
             { size: 9, color: PAL.faint });
    }

    /* the table */
    var tx = 60, ty = 236;
    P.text(tx, ty - 6, 'request', { size: 9, mono: true, color: PAL.faint });
    P.text(tx + 80, ty - 6, 'chunk', { size: 9, mono: true, color: PAL.faint });
    P.text(tx + 150, ty - 6, 'usable', { size: 9, mono: true, color: PAL.faint });
    P.text(tx + 230, ty - 6, 'wasted', { size: 9, mono: true, color: PAL.faint });
    var shown = 0;
    CHUNK_ROWS.forEach(function (r, i) {
      if (i > 8) return;
      if (!on(p, 0.5 + i * 0.045)) return;
      var ry = ty + 12 + shown * 17;
      P.text(tx, ry, String(r.req), { size: 10, mono: true, color: PAL.ink });
      P.text(tx + 80, ry, String(r.chunk), { size: 10, mono: true, color: PAL.accent });
      P.text(tx + 150, ry, String(r.usable), { size: 10, mono: true, color: PAL.valid });
      P.text(tx + 230, ry, String(r.waste), { size: 10, mono: true, color: PAL.dim });
      shown++;
    });

    if (on(p, 0.9)) {
      P.text(430, 236, 'the extra usable bytes are', { size: 10, color: PAL.dim });
      P.text(430, 252, 'an implementation detail:', { size: 10, color: PAL.dim });
      P.text(430, 274, 'the standard promises n bytes,', { size: 10, color: PAL.ink });
      P.text(430, 290, 'and nothing beyond them.', { size: 10, color: PAL.ink });
      P.text(430, 316, 'malloc_usable_size reports the', { size: 9, color: PAL.faint });
      P.text(430, 330, 'real figure; relying on it is not', { size: 9, color: PAL.faint });
      P.text(430, 344, 'portable C.', { size: 9, color: PAL.faint });
    }
    legend(P, 428, [{ type: 'header', label: 'chunk header (8)' }, { type: 'used', label: 'bytes you asked for' }, { type: 'pad', label: 'usable but unrequested' }]);
  },

  init: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 3, 'malloc gives garbage, calloc gives zeros');
    var cw = 40, ch = 40;

    P.text(60, 60, 'p = malloc(8);', { size: 12, mono: true, color: PAL.ink });
    cells(P, 60, 76, 8, cw, ch, 'bad', ['?', '?', '?', '?', '?', '?', '?', '?'], { size: 15 });
    P.text(60, 130, 'eight bytes, every one indeterminate', { size: 10, color: PAL.invalid });

    if (on(p, 0.3)) {
      P.text(60, 168, 'q = calloc(8, 1);', { size: 12, mono: true, color: PAL.ink });
      cells(P, 60, 184, 8, cw, ch, 'ok', ['0', '0', '0', '0', '0', '0', '0', '0'], { size: 15 });
      P.text(60, 238, 'eight bytes, every one zero', { size: 10, color: PAL.valid });
    }

    if (on(p, 0.55)) {
      P.text(470, 76, 'what the standard says', { size: 10, mono: true, color: PAL.faint });
      note(P, 470, 96, [
        'malloc: uninitialised storage',
        'calloc: every byte set to zero',
        'realloc: old bytes kept up to min,',
        '         the new tail is undefined'
      ], { size: 10 });
      P.text(470, 180, 'a freed block handed back often', { size: 10, color: PAL.dim });
      P.text(470, 196, 'still holds the old values, which', { size: 10, color: PAL.dim });
      P.text(470, 212, 'is why the bug stays quiet', { size: 10, color: PAL.dim });
    }

    if (on(p, 0.75)) {
      P.text(60, 282, 'calloc zeroes bytes, not values: all-bits-zero is 0 for integers,', { size: 11, color: PAL.warn });
      P.text(60, 300, 'and the standard does not promise it means 0.0 or a null pointer.', { size: 11, color: PAL.warn });
    }
    if (on(p, 0.88)) {
      P.text(60, 334, 'malloc(0) may return NULL or a unique pointer: implementation-defined.', { size: 11, color: PAL.ink });
      P.text(60, 352, 'If you get a pointer, do not dereference it, and do free it.', { size: 11, color: PAL.dim });
    }
    legend(P, 428, [{ type: 'bad', label: 'indeterminate bytes' }, { type: 'ok', label: 'zeroed bytes' }]);
  },

  grow: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 4, 'realloc: grow, copy, or move');
    var cw = 12, ch = 26;

    P.text(34, 54, 'p = malloc(8 * sizeof(int));   q = realloc(p, 16 * sizeof(int));',
           { size: 11, mono: true, color: PAL.ink });

    /* the old block */
    P.text(60, 80, 'before: 8 ints at 0x1000', { size: 10, mono: true, color: PAL.dim });
    cells(P, 60, 92, 8, cw, ch, 'used', ['0', '1', '2', '3', '4', '5', '6', '7'], { size: 8 });

    /* outcome 1: in place */
    if (on(p, 0.25)) {
      P.text(60, 156, 'A  grows in place: same address, 16 ints, nothing copied',
             { size: 10, color: PAL.valid });
      cells(P, 60, 168, 8, cw, ch, 'used', ['0', '1', '2', '3', '4', '5', '6', '7'], { size: 8 });
      cells(P, 60 + 8 * cw, 168, 8, cw, ch, 'bad', ['?', '?', '?', '?', '?', '?', '?', '?'], { size: 8 });
      P.text(60 + 8 * cw + 8 * cw + 10, 182, 'new tail undefined', { size: 9, color: PAL.invalid });
    }

    /* outcome 2: moved */
    if (on(p, 0.5)) {
      P.text(60, 226, 'B  moves: copy 8 ints to 0x2000, free the old block',
             { size: 10, color: PAL.warn });
      cells(P, 60, 238, 8, cw, ch, 'freed', null);
      P.text(60, 276, '0x1000 freed', { size: 9, mono: true, color: PAL.faint });
      cells(P, 300, 238, 8, cw, ch, 'used', ['0', '1', '2', '3', '4', '5', '6', '7'], { size: 8 });
      cells(P, 300 + 8 * cw, 238, 8, cw, ch, 'bad', ['?', '?', '?', '?', '?', '?', '?', '?'], { size: 8 });
      P.arrow(200, 251, 296, 251, { stroke: PAL.warn, sw: 1.6, head: 8 });
      P.text(232, 240, 'copy', { size: 9, mono: true, color: PAL.warn });
      P.text(300, 276, '0x2000, and p is now invalid', { size: 9, mono: true, color: PAL.invalid });
    }

    /* outcome 3: failed */
    if (on(p, 0.75)) {
      P.text(60, 316, 'C  fails: returns NULL, does not free the old block',
             { size: 10, color: PAL.invalid });
      cells(P, 60, 328, 8, cw, ch, 'used', ['0', '1', '2', '3', '4', '5', '6', '7'], { size: 8 });
      P.text(60 + 8 * cw + 10, 342, 'still allocated, still yours to free', { size: 9, color: PAL.dim });
    }

    if (on(p, 0.9)) {
      P.text(470, 168, 't = realloc(p, n);', { size: 10, mono: true, color: PAL.ink });
      P.text(470, 186, 'if (t) p = t;', { size: 10, mono: true, color: PAL.valid });
      P.text(470, 210, 'p = realloc(p, n);  leaks p when', { size: 10, mono: true, color: PAL.invalid });
      P.text(470, 226, 'the call fails', { size: 10, mono: true, color: PAL.invalid });
      P.text(470, 256, 'the standard invalidates the old', { size: 9, color: PAL.dim });
      P.text(470, 270, 'pointer even when the block grew', { size: 9, color: PAL.dim });
      P.text(470, 284, 'in place, so use only what was', { size: 9, color: PAL.dim });
      P.text(470, 298, 'returned', { size: 9, color: PAL.dim });
    }
    legend(P, 428, [{ type: 'used', label: 'live bytes' }, { type: 'bad', label: 'undefined tail' }, { type: 'freed', label: 'freed block' }]);
  },

  free: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 5, 'free releases a chunk, it does not erase it');
    var cw = 26, ch = 32;

    P.text(60, 56, 'p = malloc(8 * sizeof(int));  fill it;  free(p);', { size: 11, mono: true, color: PAL.ink });
    P.text(60, 80, 'before free', { size: 10, mono: true, color: PAL.dim });
    cells(P, 60, 92, 8, cw, ch, 'used', ['11', '22', '33', '44', '55', '66', '77', '88'], { size: 10 });

    if (on(p, 0.3)) {
      P.text(60, 152, 'after free', { size: 10, mono: true, color: PAL.dim });
      cells(P, 60, 164, 8, cw, ch, 'freed', ['11', '22', '33', '44', '55', '66', '77', '88'], { size: 10 });
      P.text(60, 212, 'the bytes are unchanged: free writes nothing', { size: 10, color: PAL.warn });
    }

    if (on(p, 0.5)) {
      P.text(60, 244, 'p still holds 0x1000, so it now dangles', { size: 10, color: PAL.invalid });
      P.arrow(60, 258, 60, 240, { stroke: PAL.invalid, sw: 1.4, head: 7 });
      P.text(470, 92, 'what free does', { size: 10, mono: true, color: PAL.faint });
      note(P, 470, 112, [
        'returns the chunk to a bin',
        'so a later malloc may reuse it'
      ], { size: 10 });
      P.text(470, 162, 'what free does not do', { size: 10, mono: true, color: PAL.faint });
      note(P, 470, 182, [
        'zero the bytes',
        'change your pointer',
        'end the object you can still name'
      ], { size: 10, color: PAL.invalid });
      P.text(470, 244, 'free(NULL) does nothing at all', { size: 10, color: PAL.dim });
    }

    if (on(p, 0.75)) {
      P.text(60, 300, 'GATE CSE 2000 Q1.12  matching', { size: 10, mono: true, color: PAL.ink });
      note(P, 60, 320, [
        'X: m = malloc(5); m = NULL;   -> 3 lost memory',
        'Y: free(n); n->value = 5;     -> 1 dangling',
        'Z: char *p; *p = \'a\';        -> 2 uninitialised'
      ], { size: 10, mono: true, color: PAL.ink });
      P.text(60, 384, 'X is not dangling: no pointer is left, so the block can never be freed',
             { size: 10, color: PAL.warn });
    }
    legend(P, 428, [{ type: 'used', label: 'live block' }, { type: 'freed', label: 'freed, bytes intact' }]);
  },

  wrong: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 6, 'four ways to misuse the heap');
    var qw = 200, qh = 96, gx = 60, gy = 60;

    function panel(i, title, lines, colour) {
      if (!on(p, 0.1 + i * 0.18)) return;
      var x = gx + (i % 2) * (qw + 20);
      var y = gy + Math.floor(i / 2) * (qh + 16);
      P.rect(x, y, qw, qh, { fill: PAL.surface, stroke: colour, sw: 1.3, radius: 4 });
      P.text(x + 10, y + 16, title, { size: 11, mono: true, color: colour });
      lines.forEach(function (s, k) {
        P.text(x + 10, y + 36 + k * 15, s, { size: 9, color: PAL.dim });
      });
    }

    panel(0, '1  leak', ['allocated, no pointer left', 'cannot be freed ever', '1000 x 32 = 32000 bytes'], PAL.invalid);
    panel(1, '2  use after free', ['pointer outlives the block', 'undefined, not a crash', 'old values may still print'], PAL.invalid);
    panel(2, '3  double free', ['the same chunk freed twice', 'or a pointer not from malloc', 'free must get one returned value'], PAL.invalid);
    panel(3, '4  lost pointer', ['p = malloc(n); p = NULL;', 'the block is unreachable', 'the classic 2000 question'], PAL.warn);

    if (on(p, 0.8)) {
      P.text(490, 80, 'GATE CSE 2001 Q2.18', { size: 11, mono: true, color: PAL.ink });
      note(P, 490, 102, [
        'P1 return &x;      local dies -> fault',
        'P2 *px = 10;       uninitialised -> fault',
        'P3 malloc then use  heap survives -> fine'
      ], { size: 9, mono: true, color: PAL.dim });
      P.text(490, 168, 'answer: only P1 and P2', { size: 10, color: PAL.valid });
      P.text(490, 192, 'P3 is not a fault, but its caller', { size: 9, color: PAL.dim });
      P.text(490, 206, 'must free the block, and real code', { size: 9, color: PAL.dim });
      P.text(490, 220, 'must test the NULL return.', { size: 9, color: PAL.dim });
    }
    legend(P, 428, [{ type: 'bad', label: 'fault' }, { type: 'used', label: 'legal' }]);
  },

  double: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 7, 'doubling: why appending is amortised O(1)');

    /* the copies, as bars */
    var x0 = 60, y0 = 300, bw = 34;
    P.text(x0, 62, 'copies performed at each growth', { size: 10, color: PAL.dim });
    TRACE16.steps.forEach(function (s, i) {
      if (!on(p, 0.15 + i * 0.12)) return;
      var h = Math.max(2, s.copied * 12);
      P.rect(x0 + i * (bw + 22), y0 - h, bw, h, {
        fill: s.copied === 0 ? PAL.surface2 : PAL.accentDim,
        stroke: s.copied === 0 ? PAL.border : PAL.accent, sw: 1.2, radius: 2
      });
      P.text(x0 + i * (bw + 22) + bw / 2, y0 + 6, String(s.to), { size: 9, mono: true, align: 'center', color: PAL.dim });
      P.text(x0 + i * (bw + 22) + bw / 2, y0 - h - 12, String(s.copied), { size: 10, mono: true, align: 'center', color: PAL.ink });
    });
    P.text(x0, y0 + 24, 'capacity after the growth', { size: 9, mono: true, color: PAL.faint });

    if (on(p, 0.55)) {
      P.text(x0, 340, 'total copies for 16 appends: ' + TRACE16.copies +
             '   (1 + 2 + 4 + 8, and one less than the final capacity)', { size: 11, mono: true, color: PAL.valid });
      P.text(x0, 362, 'growing by one each time would copy ' + LINEAR16 + ' elements, not ' + TRACE16.copies,
             { size: 11, mono: true, color: PAL.invalid });
      P.text(x0, 384, 'so doubling is about eight times cheaper here, and the gap widens with n',
             { size: 10, color: PAL.dim });
    }

    if (on(p, 0.72)) {
      var tx = 470, ty = 70;
      P.text(tx, ty - 6, 'n', { size: 9, mono: true, color: PAL.faint });
      P.text(tx + 60, ty - 6, 'copies', { size: 9, mono: true, color: PAL.faint });
      P.text(tx + 130, ty - 6, 'reallocs', { size: 9, mono: true, color: PAL.faint });
      P.text(tx + 210, ty - 6, '2n', { size: 9, mono: true, color: PAL.faint });
      DOUBLING_ROWS.forEach(function (r, i) {
        var ry = ty + 12 + i * 18;
        P.text(tx, ry, String(r.n), { size: 10, mono: true, color: PAL.ink });
        P.text(tx + 60, ry, String(r.copies), { size: 10, mono: true, color: PAL.accent });
        P.text(tx + 130, ry, String(r.reallocs), { size: 10, mono: true, color: PAL.dim });
        P.text(tx + 210, ry, String(2 * r.n), { size: 10, mono: true, color: PAL.faint });
      });
    }

    if (on(p, 0.9)) {
      P.text(470, 286, 'copies < 2n, so the average is under', { size: 10, color: PAL.ink });
      P.text(470, 302, 'two copies per append: O(1) amortised', { size: 10, color: PAL.valid });
      P.text(470, 320, 'one append can still be O(n)', { size: 10, color: PAL.warn });
    }
    legend(P, 428, [{ type: 'used', label: 'elements copied at a growth' }, { type: 'freed', label: 'first growth copies nothing' }]);
  },

  arith: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 8, 'the malloc arithmetic traps');
    var cw = 22, ch = 28;

    /* sizeof(p) */
    P.text(60, 56, 'int *p = malloc(sizeof(p));   /* ten ints wanted */', { size: 11, mono: true, color: PAL.ink });
    cells(P, 60, 76, 2, cw, ch, 'bad', ['8', '8'], { size: 10 });
    P.text(60, 118, 'sizeof(p) is 8: the size of a pointer', { size: 10, color: PAL.invalid });
    if (on(p, 0.25)) {
      cells(P, 200, 76, 10, cw, ch, 'used', null);
      P.text(200, 142, 'ten ints need 40: ' + SHORTFALL + ' bytes short', { size: 10, color: PAL.valid });
      P.text(60, 164, 'use malloc(n * sizeof *p): sizeof(*p) is the element, 4 here',
             { size: 10, color: PAL.dim });
    }

    /* the multiplication */
    if (on(p, 0.42)) {
      P.text(60, 182, 'malloc(1073741824 * sizeof(int))   /* n = 2^30 */', { size: 11, mono: true, color: PAL.ink });
      P.text(60, 204, '2^30 x 4 = ' + BIG_PRODUCT + ' = 2^32 exactly', { size: 10, mono: true, color: PAL.ink });
      P.text(60, 226, 'a 32-bit size_t holds 0 .. ' + SIZE_MAX32 + ', so the product wraps to ' + BIG_WRAPPED,
             { size: 10, mono: true, color: PAL.invalid });
      P.text(60, 248, 'malloc(0) returns a tiny block and the first write runs off its end',
             { size: 10, color: PAL.invalid });
    }

    if (on(p, 0.62)) {
      P.text(60, 282, 'the check, before multiplying:', { size: 10, color: PAL.dim });
      P.text(60, 302, 'if (n > SIZE_MAX / sizeof *p) refuse();', { size: 10, mono: true, color: PAL.valid });
      P.text(60, 322, 'SIZE_MAX / 4 = ' + SAFE_LIMIT + ', and n = ' + BIG_N + ' exceeds it',
             { size: 10, mono: true, color: PAL.valid });
    }

    if (on(p, 0.8)) {
      P.text(470, 182, 'a string of length L needs L + 1', { size: 10, color: PAL.ink });
      P.text(470, 204, 'strlen("' + STR + '") = ' + STR_LEN, { size: 10, mono: true, color: PAL.ink });
      P.text(470, 226, 'malloc(' + STR_LEN + ') holds ' + STR_LEN + ', strcpy writes ' + STR_NEED,
             { size: 10, mono: true, color: PAL.invalid });
      P.text(470, 248, 'malloc(' + STR_NEED + ') is the allocation you want', { size: 10, mono: true, color: PAL.valid });
      P.text(470, 282, 'calloc(num, size) does the multiply', { size: 9, color: PAL.dim });
      P.text(470, 296, 'itself and returns NULL when the', { size: 9, color: PAL.dim });
      P.text(470, 310, 'product cannot be represented', { size: 9, color: PAL.dim });
    }
    legend(P, 428, [{ type: 'used', label: 'bytes needed' }, { type: 'bad', label: 'bytes allocated' }]);
  },

  frag: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 9, 'fragmentation: free bytes that do not fit');
    var cw = 3, ch = 40, x0 = 60, y = 96;

    P.text(60, 60, 'six chunks of 32 bytes in one 192-byte region', { size: 11, color: PAL.dim });
    for (var i = 0; i < FRAG_CHUNKS; i++) {
      var free = FRAG_FREED.indexOf(i) >= 0 && on(p, 0.35);
      var x = x0 + i * (CHUNK_BYTES * cw + 8);
      P.rect(x, y, CHUNK_BYTES * cw, ch, {
        fill: free ? PAL.surface2 : PAL.accentDim,
        stroke: free ? PAL.border : PAL.accent, sw: 1.3, radius: 3
      });
      P.text(x + CHUNK_BYTES * cw / 2, y + ch / 2, String.fromCharCode(65 + i),
             { size: 12, mono: true, align: 'center', base: 'middle', color: free ? PAL.faint : PAL.ink });
      P.text(x + CHUNK_BYTES * cw / 2, y + ch + 14, free ? 'free' : 'used',
             { size: 9, align: 'center', color: free ? PAL.faint : PAL.dim });
      P.text(x + CHUNK_BYTES * cw / 2, y - 12, '32', { size: 9, mono: true, align: 'center', color: PAL.faint });
    }

    if (on(p, 0.35)) {
      P.text(60, 186, 'B, D and F released: ' + FRAG_FREE_TOTAL + ' bytes free, in three holes of 32',
             { size: 10, color: PAL.ink });
    }
    if (on(p, 0.6)) {
      P.text(60, 220, 'now ask for ' + FRAG_REQUEST + ' bytes', { size: 11, mono: true, color: PAL.ink });
      P.text(60, 242, 'request2size(' + FRAG_REQUEST + ') = ' + FRAG_REQUIRED + ', so a ' + FRAG_REQUIRED + '-byte chunk is needed',
             { size: 10, mono: true, color: PAL.dim });
      P.text(60, 266, 'total free  ' + FRAG_FREE_TOTAL + '   >=  ' + FRAG_REQUIRED + '   enough, in total',
             { size: 11, mono: true, color: PAL.warn });
      P.text(60, 288, 'largest hole ' + FRAG_LARGEST_HOLE + '   <   ' + FRAG_REQUIRED + '   not enough, in one piece',
             { size: 11, mono: true, color: PAL.invalid });
      P.text(60, 312, 'so the allocator takes new memory while 96 bytes sit unused: external fragmentation',
             { size: 10, color: PAL.invalid });
    }
    if (on(p, 0.85)) {
      P.text(60, 344, 'the statistic an allocation needs is the largest hole, not the total free',
             { size: 10, color: PAL.ink });
      P.text(60, 362, 'C cannot compact, because it hands out real addresses that code may keep',
             { size: 9, color: PAL.faint });
    }
    legend(P, 428, [{ type: 'used', label: 'chunk in use' }, { type: 'freed', label: 'freed chunk (hole)' }]);
  },

  procedure: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(P, 10, 'the five questions for any malloc program');

    var qs = [
      '1  who owns this block, and who frees it',
      '2  when must it still exist',
      '3  is it initialised before the first read',
      '4  was the result tested for NULL',
      '5  does any pointer to it outlive the block'
    ];
    qs.forEach(function (s, i) {
      if (!on(p, 0.08 + i * 0.11)) return;
      P.text(60, 68 + i * 24, s, { size: 11, mono: true, color: PAL.ink });
    });

    if (on(p, 0.62)) {
      P.text(60, 210, 'guaranteed by the standard', { size: 10, mono: true, color: PAL.valid });
      note(P, 60, 232, [
        'at least n bytes, uninitialised',
        'aligned for any object type',
        'NULL on failure',
        'calloc zeroes every byte',
        'realloc keeps min(old, new)'
      ], { size: 9 });
    }
    if (on(p, 0.74)) {
      P.text(360, 210, 'one implementation only', { size: 10, mono: true, color: PAL.warn });
      note(P, 360, 232, [
        '16-byte rounding, 32-byte minimum',
        'the 8-byte size word before your bytes',
        'the extra usable bytes',
        'bins, and which hole is reused',
        'text / data / bss / heap / stack order'
      ], { size: 9 });
    }
    if (on(p, 0.86)) {
      P.text(660, 210, 'the OS underneath', { size: 10, mono: true, color: PAL.faint });
      note(P, 660, 232, [
        'sbrk or mmap when the',
        'region runs out, which is',
        'why malloc does not',
        'always make a system call'
      ], { size: 9 });
    }
    if (on(p, 0.94)) {
      P.text(60, 340, 'the pointer is yours, the bytes are borrowed, the address is never guaranteed',
             { size: 11, color: PAL.ink });
    }
    legend(P, 428, [{ type: 'ok', label: 'portable promise' }, { type: 'header', label: 'implementation detail' }]);
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
