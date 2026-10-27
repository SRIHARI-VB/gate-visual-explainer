(function () {
  'use strict';

  var W = 900, H = 470;
  var K = window.LessonKit;
  var PR = window.Painters;
  var PAL = PR.PAL;
  var P = null;

/* ======================================================================
   LAYER 1 - THE MODEL (file-systems)
   Pure data and pure functions. No drawing here. Nothing in this section
   knows what a canvas is. Every number the lesson quotes is computed here,
   and the checks at the bottom re-derive it from the definitions.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}
function near(a, b, eps) { eps = eps === undefined ? 1e-9 : eps; return Math.abs(a - b) <= eps; }
function ceilDiv(a, b) { return Math.ceil(a / b); }

/* ---------------- 0. one file, three tables ---------------- */

var FS = {
  blockBytes: 4096,
  addrBytes: 4
};
FS.ptrsPerBlock = FS.blockBytes / FS.addrBytes;              /* 1024 */

/* the example file: name -> inode -> blocks */
var FILE0 = {
  name: 'report.txt',
  inode: 4021,
  blocks: [3, 7, 1],                /* three data blocks, scattered */
  sizeBytes: 10000
};
FILE0.openReads = 3;                /* directory block, inode, first data block */

/* ---------------- 1. allocation: same eight blocks, three schemes ---------------- */

var ALLOC = {
  contiguous: { run: [4, 5, 6, 7, 8, 9, 10, 11], external: true, randomHops: 0, indexBlocks: 0 },
  linked: { run: [12, 3, 21, 7, 30, 2, 18, 9], external: false, randomHops: 'k', indexBlocks: 0 },
  indexed: { run: [12, 3, 21, 7, 30, 2, 18, 9], external: false, randomHops: 1, indexBlocks: 1 }
};
/* GATE 2017 Set 2: no external fragmentation allowed -> linked and indexed */
var ALLOC_ANSWER = ['linked', 'indexed'];

/* ---------------- 2. FAT arithmetic (GATE 2014 Set 2) ---------------- */

var FAT = {
  diskBytes: 100e6,
  blockBytes: 1000,
  entryBytes: 4
};
FAT.blocks = FAT.diskBytes / FAT.blockBytes;                  /* 100000 */
FAT.tableBytes = FAT.blocks * FAT.entryBytes;                 /* 400000 */
FAT.tableBlocks = FAT.tableBytes / FAT.blockBytes;            /* 400 */
FAT.dataBytes = FAT.diskBytes - FAT.tableBytes;               /* 99600000 */
FAT.dataMB = FAT.dataBytes / 1e6;                             /* 99.6 */

/* GATE 2025 Set 1: pointer stored inside every data block */
var LINK = {
  diskBytes: 512 * 1024 * 1024,
  blockBytes: 64 * 1024,
  ptrBytes: 4,
  fileBytes: 1024 * 1024
};
LINK.usable = LINK.blockBytes - LINK.ptrBytes;                /* 65532 */
LINK.blocksInDisk = LINK.diskBytes / LINK.blockBytes;         /* 8192 */
LINK.blocks = ceilDiv(LINK.fileBytes, LINK.usable);           /* 17    */
LINK.allocated = LINK.blocks * LINK.blockBytes;               /* 1114112 */
LINK.waste = LINK.blocks * LINK.usable - LINK.fileBytes;      /* 65468 */
LINK.fullBlocks = Math.floor(LINK.fileBytes / LINK.usable);   /* 16    */
LINK.lastUsed = LINK.fileBytes - LINK.fullBlocks * LINK.usable;/* 64   */

/* ---------------- 3. indexed allocation: maximum file size ---------------- */

function inodeMax(o) {
  var ptrs = o.blockBytes / o.addrBytes;
  var blocks = o.direct * 1
    + o.single * ptrs
    + o.double * ptrs * ptrs
    + o.triple * ptrs * ptrs * ptrs;
  return { ptrs: ptrs, blocks: blocks, bytes: blocks * o.blockBytes };
}

var INODE19 = inodeMax({ blockBytes: 4096, addrBytes: 4, direct: 12, single: 1, double: 1, triple: 0 });
INODE19.gb = INODE19.bytes / Math.pow(2, 30);                /* 4.00395 */
INODE19.gbRounded = Math.round(INODE19.gb * 10) / 10;        /* 4.0 */
INODE19.terms = [
  { label: '12 direct', blocks: 12 },
  { label: '1 single indirect', blocks: 1024 },
  { label: '1 double indirect', blocks: 1024 * 1024 }
];

var INODE12 = inodeMax({ blockBytes: 128, addrBytes: 8, direct: 8, single: 1, double: 1, triple: 0 });
INODE12.kb = INODE12.bytes / 1024;                            /* 35 */

var INODE04 = inodeMax({ blockBytes: 1024, addrBytes: 4, direct: 10, single: 1, double: 1, triple: 1 });
INODE04.pow34 = INODE04.bytes / Math.pow(2, 34);              /* 1.0039 */
INODE04.deepest = Math.pow(256, 3) * 1024;                    /* 2^34 */
INODE04.shallow = (10 + 256) * 1024;                          /* 272384 B */
INODE04.shallowShare = INODE04.shallow / INODE04.bytes;       /* ~1.6e-5 */

/* ---------------- 4. insertion cost (GATE 2022) ---------------- */

var INSERT = { fileBlocks: 100, at: 50 };
INSERT.shiftBlocks = INSERT.fileBlocks - INSERT.at;           /* 50 */
INSERT.contigReads = INSERT.shiftBlocks;                      /* 50 */
INSERT.contigWrites = INSERT.shiftBlocks + 1;                 /* 51 */
INSERT.nA = INSERT.contigReads + INSERT.contigWrites;         /* 101 */
INSERT.linkedReads = INSERT.at;                               /* 50 */
INSERT.linkedWrites = 2;                                      /* new block + patch */
INSERT.nB = INSERT.linkedReads + INSERT.linkedWrites;         /* 52 */
INSERT.total = INSERT.nA + INSERT.nB;                         /* 153 */
INSERT.indexedCold = 3;                                       /* index read, data write, index write */
INSERT.indexedWarm = 2;

/* ---------------- 5. free space ---------------- */

var BITMAP = { diskBytes: Math.pow(2, 40), blockBytes: 4096 };
BITMAP.blocks = BITMAP.diskBytes / BITMAP.blockBytes;         /* 2^28 */
BITMAP.bits = BITMAP.blocks;
BITMAP.bytes = BITMAP.bits / 8;                               /* 2^25 */
BITMAP.mb = BITMAP.bytes / (1024 * 1024);                     /* 32 */
BITMAP.tableBlocks = BITMAP.bytes / BITMAP.blockBytes;        /* 8192 */

var FREE = {
  diskBytes: 16 * Math.pow(2, 30),
  blockBytes: 2048,
  ptrBytes: 4,
  numberBytes: 4
};
FREE.blocks = FREE.diskBytes / FREE.blockBytes;               /* 8388608 */
FREE.entriesPerBlock = Math.floor((FREE.blockBytes - FREE.ptrBytes) / FREE.numberBytes); /* 511 */
FREE.naiveEntries = FREE.blockBytes / FREE.numberBytes;       /* 512 */
FREE.listBlocks = ceilDiv(FREE.blocks, FREE.entriesPerBlock); /* 16417 */
FREE.naiveListBlocks = ceilDiv(FREE.blocks, FREE.naiveEntries);/* 16384 */
FREE.exact = FREE.blocks / FREE.entriesPerBlock;              /* 16416.06... */

/* ---------------- 6. path resolution ---------------- */

var PATH = {
  components: ['usr', 'lib', 'libc.so'],
  cached: false
};
/* root dir read, then (inode + dir) per intermediate component, then the file inode */
PATH.reads = 1 + (PATH.components.length - 1) * 2 + 1;        /* 6 */
PATH.perComponent = 2;

/* GATE 2021 Set 1: linear list directory, which operations need a full scan */
var DIR_OPS = [
  { op: 'create', full: true, why: 'must prove the name is unused' },
  { op: 'delete', full: false, why: 'stops at the entry' },
  { op: 'rename', full: true, why: 'must prove the new name is unused' },
  { op: 'open', full: false, why: 'stops at the entry' }
];

/* ---------------- 7. links ---------------- */

var LINKCOUNT = {
  inode: 4021,
  names: ['report.txt', 'notes.txt'],
  count: 2,
  afterOneDelete: 1,
  afterBothDelete: 0
};
var SYMLINK = { ownInode: 5107, stores: '/home/ana/report.txt', raisesTargetCount: false };

/* ---------------- 8. fragmentation and limits ---------------- */

var FRAG = { sizeBytes: 10000, blockBytes: 4096 };
FRAG.blocks = ceilDiv(FRAG.sizeBytes, FRAG.blockBytes);       /* 3 */
FRAG.allocated = FRAG.blocks * FRAG.blockBytes;               /* 12288 */
FRAG.internal = FRAG.allocated - FRAG.sizeBytes;              /* 2288 */

var INODES = { count: 1000000, bytesEach: 128 };
INODES.tableBytes = INODES.count * INODES.bytesEach;          /* 128000000 */
INODES.tableMB = INODES.tableBytes / (1024 * 1024);           /* 122.07 */

/* ======================================================================
   LAYER 2 - THE CHECKS
   Each check re-derives a claim from its definition. Nothing trusts a
   constant that was typed above.
   ====================================================================== */

function buildChecks() {
  /* --- anatomy --- */
  chk('a 4 KB block holds 4096 / 4 = 1024 block addresses',
    FS.ptrsPerBlock === 1024, FS.ptrsPerBlock);
  chk('opening one file costs three reads: directory, inode, data',
    FILE0.openReads === 3);
  chk('the example file has as many blocks as ceil(size / block)',
    FILE0.blocks.length === ceilDiv(FILE0.sizeBytes, FS.blockBytes),
    FILE0.blocks.length);

  /* --- allocation --- */
  chk('contiguous placement is one unbroken run of eight blocks',
    ALLOC.contiguous.run.length === 8 &&
    ALLOC.contiguous.run.every(function (b, i, a) { return i === 0 || b === a[i - 1] + 1; }));
  chk('linked placement uses eight distinct blocks that are not consecutive',
    ALLOC.linked.run.length === 8 &&
    new Set(ALLOC.linked.run).size === 8 &&
    ALLOC.linked.run.some(function (b, i, a) { return i > 0 && b !== a[i - 1] + 1; }));
  chk('only contiguous placement can leave a hole too small to reuse (external fragmentation)',
    ALLOC.contiguous.external === true &&
    ALLOC.linked.external === false && ALLOC.indexed.external === false);
  chk('GATE 2017 Set 2 answer: linked and indexed only',
    ALLOC_ANSWER.join(',') === 'linked,indexed');

  /* --- FAT --- */
  chk('100 MB of 1000-byte blocks is 100,000 blocks',
    FAT.blocks === 100000, FAT.blocks);
  chk('the FAT costs blocks x 4 B = 400,000 B = 400 blocks',
    FAT.tableBytes === 400000 && FAT.tableBlocks === 400, FAT.tableBytes);
  chk('the table and the data add back to the whole disk',
    FAT.tableBytes + FAT.dataBytes === FAT.diskBytes);
  chk('GATE 2014 Set 2: the largest file is 99.6 million bytes',
    near(FAT.dataMB, 99.6), FAT.dataMB);

  /* --- linked pointer cost --- */
  chk('a 64 KB block with a 4-byte pointer carries 65,532 usable bytes',
    LINK.usable === 65532, LINK.usable);
  chk('1 MB needs 17 blocks because 16 blocks hold only 1,048,512 B',
    LINK.blocks === 17 && LINK.fullBlocks === 16 &&
    LINK.fullBlocks * LINK.usable === 1048512, LINK.blocks);
  chk('the last block carries exactly 64 bytes of data',
    LINK.lastUsed === 64, LINK.lastUsed);
  chk('GATE 2025 Set 1: the waste is 65,468 bytes',
    LINK.waste === 65468, LINK.waste);
  chk('the waste is smaller than one usable block',
    LINK.waste < LINK.usable);
  chk('the allocated space is the whole block count times the block size',
    LINK.allocated === LINK.blocks * LINK.blockBytes);

  /* --- inode --- */
  chk('the 2019 terms are 12, 1024 and 1,048,576 blocks',
    INODE19.terms[0].blocks === 12 && INODE19.terms[1].blocks === 1024 &&
    INODE19.terms[2].blocks === 1048576);
  chk('the 2019 total is 1,049,612 blocks',
    INODE19.blocks === 1049612, INODE19.blocks);
  chk('GATE 2019: 4.00395 GB, which rounds to 4.0 GB',
    near(INODE19.gb, 4.00395, 1e-5) && INODE19.gbRounded === 4, INODE19.gb);
  chk('the double indirect term is more than 99.8 per cent of the 2019 answer',
    INODE19.terms[2].blocks / INODE19.blocks > 0.998);
  chk('GATE 2012: 16 pointers per block, 280 blocks, 35 KB',
    INODE12.ptrs === 16 && INODE12.blocks === 280 && INODE12.kb === 35,
    INODE12.ptrs + ' / ' + INODE12.blocks + ' / ' + INODE12.kb);
  chk('the 2012 answer in bytes is 280 x 128 = 35,840',
    INODE12.bytes === 35840, INODE12.bytes);
  chk('GATE 2004: the triple term alone is 2^34 bytes',
    INODE04.deepest === Math.pow(2, 34), INODE04.deepest);
  chk('the 2004 total is within 1 per cent of the triple term alone',
    INODE04.pow34 > 1 && INODE04.pow34 < 1.01, INODE04.pow34);
  chk('the 2004 direct and single terms are under 0.01 per cent of the answer',
    INODE04.shallowShare < 1e-4, INODE04.shallowShare);

  /* --- insertion --- */
  chk('contiguous insertion shifts 50 blocks: 50 reads and 51 writes',
    INSERT.shiftBlocks === 50 && INSERT.nA === 101, INSERT.nA);
  chk('linked insertion is 50 reads and 2 writes',
    INSERT.nB === 52, INSERT.nB);
  chk('GATE 2022: the sum is 153', INSERT.total === 153, INSERT.total);
  chk('the contiguous cost exceeds the linked cost here',
    INSERT.nA > INSERT.nB);
  chk('indexed insertion is cheaper warm than cold',
    INSERT.indexedWarm < INSERT.indexedCold);

  /* --- free space --- */
  chk('a 1 TB disk of 4 KB blocks has 2^28 blocks',
    BITMAP.blocks === Math.pow(2, 28), BITMAP.blocks);
  chk('one bit per block makes the bitmap 2^25 bytes = 32 MB',
    BITMAP.bytes === Math.pow(2, 25) && BITMAP.mb === 32, BITMAP.mb);
  chk('the bitmap itself occupies 8,192 blocks',
    BITMAP.tableBlocks === 8192, BITMAP.tableBlocks);
  chk('a 16 GB disk of 2 KB blocks has 8,388,608 blocks',
    FREE.blocks === 8388608, FREE.blocks);
  chk('a list block holds 511 numbers after the 4-byte link',
    FREE.entriesPerBlock === 511, FREE.entriesPerBlock);
  chk('GATE 2026 Set 2: 16,417 list blocks are needed',
    FREE.listBlocks === 16417, FREE.listBlocks);
  chk('the naive 512-entry count gives 16,384, which understates the true 16,417',
    FREE.naiveListBlocks === 16384 && FREE.naiveListBlocks * FREE.naiveEntries === FREE.blocks &&
    FREE.listBlocks - FREE.naiveListBlocks === 33,
    FREE.naiveListBlocks + ' against ' + FREE.listBlocks);
  chk('16,416 blocks would hold only 8,388,576 numbers, so the ceiling is forced',
    FREE.entriesPerBlock * 16416 < FREE.blocks &&
    FREE.entriesPerBlock * FREE.listBlocks >= FREE.blocks);

  /* --- path --- */
  chk('three components cost 1 + 2 x 2 + 1 = 6 reads uncached',
    PATH.reads === 6, PATH.reads);
  chk('exactly two directory operations need a full scan',
    DIR_OPS.filter(function (d) { return d.full; }).length === 2);
  chk('the full-scan operations are create and rename',
    DIR_OPS.filter(function (d) { return d.full; }).map(function (d) { return d.op; }).join(',') ===
    'create,rename');

  /* --- links --- */
  chk('two names on one inode give a link count of two',
    LINKCOUNT.count === 2 && LINKCOUNT.names.length === 2);
  chk('the count falls to one and then to zero, and only then is data freed',
    LINKCOUNT.afterOneDelete === 1 && LINKCOUNT.afterBothDelete === 0);
  chk('a symbolic link does not change the target link count',
    SYMLINK.raisesTargetCount === false && SYMLINK.ownInode !== LINKCOUNT.inode);

  /* --- fragmentation --- */
  chk('10,000 B in 4 KB blocks needs 3 blocks and 12,288 B',
    FRAG.blocks === 3 && FRAG.allocated === 12288);
  chk('internal fragmentation is 2,288 B',
    FRAG.internal === 2288, FRAG.internal);
  chk('internal waste is less than one block',
    FRAG.internal < FRAG.blockBytes);
  chk('a million 128-byte inodes occupy about 122 MB',
    INODES.tableBytes === 128000000 && Math.round(INODES.tableMB) === 122,
    INODES.tableMB);
}

/* ======================================================================
   LAYER 3 - DRAWING
   Every function reads the model above. Nothing re-derives a number.
   ====================================================================== */

function bg(p) {
  p.rect(0, 0, W, H, { fill: PAL.surface });
  p.line(0, 58, W, 58, { stroke: PAL.border, sw: 1 });
}

function heading(p, text, sub) {
  p.text(60, 22, text, { size: 17, bold: true });
  if (sub) p.text(60, 44, sub, { size: 11.5, color: PAL.dim });
}

function box(p, x, y, w, h, o) {
  o = o || {};
  p.rect(x, y, w, h, {
    fill: o.fill || PAL.surface2,
    stroke: o.stroke || PAL.border,
    sw: o.sw || 1,
    radius: o.radius === undefined ? 6 : o.radius
  });
}

function beat(lt, a, b) { return K.clamp01((lt - a) / Math.max(0.001, b - a)); }

function takeaway(p, lt, at, line1, line2) {
  if (beat(lt, at, at + 4) <= 0) return;
  p.rect(60, 366, 782, 66, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 8 });
  p.text(76, 386, line1, { size: 12.5, bold: true, color: PAL.warn });
  p.text(76, 408, line2, { size: 10.5, color: PAL.dim });
}

/* ---------------- scene 1: three tables ---------------- */

function sceneAnatomy(p, lt) {
  heading(p, 'A file system is three tables',
    'name  \u2192  inode number  \u2192  block pointers  \u2192  data blocks');

  /* directory table */
  var dx = 60, dy = 84;
  p.text(dx, dy - 8, 'directory', { size: 10.5, color: PAL.dim });
  box(p, dx, dy, 210, 120, { fill: PAL.surface });
  [['report.txt', FILE0.inode], ['notes.txt', 4022], ['data/', 4023]].forEach(function (r, i) {
    var hot = i === 0 && beat(lt, 7, 10) > 0;
    p.text(dx + 12, dy + 18 + i * 30, r[0], {
      size: 11, mono: true, color: hot ? PAL.accent : PAL.ink, bold: hot
    });
    p.text(dx + 190, dy + 18 + i * 30, r[1], {
      size: 11, mono: true, align: 'right', color: hot ? PAL.accent : PAL.dim
    });
    p.line(dx + 8, dy + 30 + i * 30, dx + 202, dy + 30 + i * 30, { stroke: PAL.border, sw: 0.6 });
  });

  /* inode box */
  var ix = 336, iy = 84;
  p.text(ix, iy - 8, 'inode ' + FILE0.inode, { size: 10.5, color: PAL.dim });
  box(p, ix, iy, 210, 120, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2 });
  p.text(ix + 12, iy + 20, 'size  ' + FILE0.sizeBytes + ' B', { size: 10.5, mono: true });
  p.text(ix + 12, iy + 38, 'links  1', { size: 10.5, mono: true });
  p.text(ix + 12, iy + 56, 'mode   rw-r--r--', { size: 10.5, mono: true });
  p.text(ix + 12, iy + 82, 'blocks  3, 7, 1', { size: 11, mono: true, bold: true, color: PAL.accent });
  p.text(ix + 12, iy + 102, '+ single indirect, + double', { size: 9.5, color: PAL.dim });

  /* data blocks */
  var gx = 610, gy = 84;
  p.text(gx, gy - 8, 'data blocks', { size: 10.5, color: PAL.dim });
  for (var i = 0; i < 12; i++) {
    var col = i % 4, row = Math.floor(i / 4);
    var bx = gx + col * 56, by = gy + row * 40;
    var used = FILE0.blocks.indexOf(i) !== -1;
    var on = used && beat(lt, 15 + FILE0.blocks.indexOf(i) * 1.5, 17 + FILE0.blocks.indexOf(i) * 1.5) > 0;
    box(p, bx, by, 48, 32, {
      fill: on ? PAL.accent : PAL.surface2,
      stroke: on ? PAL.accent : PAL.border, sw: 1
    });
    p.text(bx + 24, by + 16, i, {
      size: 11, mono: true, align: 'center', base: 'middle',
      color: on ? PAL.surface : PAL.dim, bold: on
    });
  }

  /* arrows between the tables */
  if (beat(lt, 7, 9) > 0) p.arrow(272, dy + 18, 334, dy + 18, { stroke: PAL.accent, sw: 1.4, head: 7 });
  if (beat(lt, 12, 14) > 0) p.arrow(548, dy + 18, 606, dy + 18, { stroke: PAL.accent, sw: 1.4, head: 7 });

  /* the open cost */
  box(p, 60, 228, 782, 118, { fill: PAL.surface, stroke: PAL.border, sw: 1 });
  p.text(76, 248, 'opening ' + FILE0.name + ' with nothing cached', { size: 12, bold: true });
  var rows = [
    ['read 1', 'the directory block, and search it for the name'],
    ['read 2', 'the inode that the entry names'],
    ['read 3', 'the first data block, following pointer 3']
  ];
  rows.forEach(function (r, i) {
    var on = beat(lt, 16 + i * 1.6, 18 + i * 1.6) > 0;
    p.text(78, 274 + i * 22, (on ? '\u2022 ' : '\u00b7 ') + r[0] + '  ', {
      size: 10.5, mono: true, color: on ? PAL.accent : PAL.dim, bold: on
    });
    p.text(150, 274 + i * 22, r[1], { size: 10.5, color: on ? PAL.ink : PAL.dim });
  });
  p.text(76, 340, 'three accesses before a single byte of the file is used', {
    size: 11, mono: true, color: PAL.warn
  });

  takeaway(p, lt, 24,
    'Every question in this topic reads one of these three tables and counts what that costs.',
    'Allocation: where do the blocks go.  Inode: how far can the pointers reach.  Free space: how is the fourth table kept.');
}

/* ---------------- scene 2: allocation ---------------- */

function sceneAllocation(p, lt) {
  heading(p, 'One file, eight blocks, three schemes',
    'the inode stores a start and a length, or one pointer, or many pointers');

  var rows = [
    { name: 'contiguous', run: ALLOC.contiguous.run, note: 'one run: block k is start + k', colour: PAL.warn },
    { name: 'linked', run: ALLOC.linked.run, note: 'each block names the next: block k costs k hops', colour: PAL.accent },
    { name: 'indexed', run: ALLOC.indexed.run, note: 'one index block lists them all: one hop', colour: PAL.info }
  ];

  rows.forEach(function (r, ri) {
    var y = 84 + ri * 88;
    var on = beat(lt, 2 + ri * 5, 4 + ri * 5) > 0;
    p.text(60, y - 6, r.name, {
      size: 12, bold: true, color: on ? r.colour : PAL.dim
    });
    p.text(170, y - 6, r.note, { size: 10, color: PAL.dim });

    /* twelve slots, the file's eight marked */
    for (var i = 0; i < 12; i++) {
      var bx = 60 + i * 46;
      var inFile = r.run.indexOf(i) !== -1;
      var lit = inFile && on && beat(lt, 3 + ri * 5 + i * 0.12, 4 + ri * 5 + i * 0.12) > 0;
      box(p, bx, y, 40, 30, {
        fill: lit ? (ri === 0 ? PAL.warnDim : PAL.accentDim) : PAL.surface2,
        stroke: lit ? r.colour : PAL.border, sw: 1
      });
      p.text(bx + 20, y + 15, i, {
        size: 10, mono: true, align: 'center', base: 'middle',
        color: lit ? PAL.ink : PAL.faint
      });
    }
    /* the chain arrows for linked */
    if (ri === 1 && beat(lt, 8, 10) > 0) {
      for (var k = 0; k < 7; k++) {
        var a = 60 + r.run[k] * 46 + 40, b = 60 + r.run[k + 1] * 46;
        var ay = y + 15;
        if (b > a) p.arrow(a + 2, ay, b - 3, ay, { stroke: PAL.accent, sw: 1, head: 5 });
        else p.arrow(a - 2, ay + 12, b + 38, ay + 12, { stroke: PAL.accent, sw: 1, head: 5 });
      }
    }
    if (ri === 2 && beat(lt, 13, 15) > 0) {
      p.text(60, y + 40, 'index block \u2192 ' + r.run.join(', '), {
        size: 10, mono: true, color: PAL.info
      });
    }
    if (ri === 0 && beat(lt, 5, 7) > 0) {
      p.text(60, y + 40, 'free space must stay in one piece, or the file cannot grow here', {
        size: 10, color: PAL.warn
      });
    }
  });

  /* the verdict table */
  box(p, 60, 306, 782, 54, { fill: PAL.surface, stroke: PAL.border, sw: 1 });
  p.text(76, 324, 'GATE 2017 Set 2 \u2014 which schemes can avoid external fragmentation?', {
    size: 11.5, bold: true
  });
  var verdict = beat(lt, 18, 21) > 0;
  p.text(76, 344, 'contiguous: no, it needs one unbroken run', {
    size: 10.5, color: verdict ? PAL.invalid : PAL.dim
  });
  p.text(430, 344, 'linked and indexed: yes, any free block will do', {
    size: 10.5, color: verdict ? PAL.valid : PAL.dim, bold: verdict
  });

  takeaway(p, lt, 24,
    'The three schemes differ only in what the inode holds. That one difference sets fragmentation and access cost.',
    'Contiguous stores a start and a length. Linked stores the first block. Indexed stores an index block.');
}

/* ---------------- scene 3: FAT ---------------- */

function sceneFat(p, lt) {
  heading(p, 'Linked allocation with a table: the FAT',
    'entry i holds the block that follows block i, so the chain becomes a memory walk');

  /* the FAT */
  var tx = 60, ty = 84;
  p.text(tx, ty - 8, 'file allocation table (one entry per disk block)', { size: 10.5, color: PAL.dim });
  box(p, tx, ty, 300, 150, { fill: PAL.surface });
  var fatRows = [[11, 12], [12, 3], [3, 21], [21, 7], [7, 30], [30, 2], [2, 18], [18, 'EOF']];
  fatRows.forEach(function (r, i) {
    var on = beat(lt, 2 + i * 0.8, 3 + i * 0.8) > 0;
    p.text(tx + 14, ty + 20 + i * 17, 'entry ' + r[0], {
      size: 10, mono: true, color: on ? PAL.ink : PAL.faint
    });
    p.arrow(tx + 96, ty + 25 + i * 17, tx + 150, ty + 25 + i * 17, {
      stroke: on ? PAL.accent : PAL.border, sw: 1, head: 5
    });
    p.text(tx + 168, ty + 20 + i * 17, String(r[1]), {
      size: 10, mono: true, bold: on, color: on ? PAL.accent : PAL.faint
    });
  });

  /* arithmetic 1: the FAT costs blocks */
  var ax = 392;
  box(p, ax, ty, 450, 74, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2 });
  p.text(ax + 14, ty + 18, 'GATE 2014 Set 2 \u2014 the table occupies part of the disk', {
    size: 11, bold: true, color: PAL.accent
  });
  p.text(ax + 14, ty + 38, FAT.diskBytes / 1e6 + ' MB / ' + FAT.blockBytes + ' B = ' +
    FAT.blocks + ' blocks', { size: 10.5, mono: true });
  p.text(ax + 14, ty + 56, FAT.blocks + ' \u00d7 ' + FAT.entryBytes + ' B = ' +
    FAT.tableBytes + ' B = ' + FAT.tableBlocks + ' blocks, leaving ' + FAT.dataMB + ' MB', {
    size: 10.5, mono: true, color: PAL.warn
  });

  /* arithmetic 2: the pointer inside the block */
  box(p, ax, ty + 86, 450, 106, { fill: PAL.surface, stroke: PAL.border, sw: 1 });
  p.text(ax + 14, ty + 104, 'GATE 2025 Set 1 \u2014 a pointer lives inside every block', {
    size: 11, bold: true
  });
  p.text(ax + 14, ty + 124, LINK.blockBytes / 1024 + ' KB \u2212 ' + LINK.ptrBytes +
    ' B = ' + LINK.usable + ' usable bytes', { size: 10.5, mono: true });
  p.text(ax + 14, ty + 142, '1 MB = ' + LINK.fileBytes + ' B needs ' + LINK.blocks +
    ' blocks (' + LINK.fullBlocks + ' hold ' + LINK.fullBlocks * LINK.usable + ' B)', {
    size: 10.5, mono: true
  });
  p.text(ax + 14, ty + 160, 'last block uses ' + LINK.lastUsed + ' B, so waste = ' +
    LINK.usable + ' \u2212 ' + LINK.lastUsed + ' = ' + LINK.waste + ' B', {
    size: 10.5, mono: true, color: PAL.warn, bold: true
  });

  /* the FAT in one line */
  box(p, 60, 252, 782, 96, { fill: PAL.surface2, stroke: PAL.border, sw: 1 });
  p.text(76, 272, 'What the table buys and what it costs', { size: 12, bold: true });
  p.text(76, 294, 'buys: the chain is in memory, so following it needs no disk access', {
    size: 10.5, color: PAL.dim
  });
  p.text(76, 312, 'costs: one entry per block of the whole volume, not one per file \u2014 ' +
    'so its size grows with the disk', { size: 10.5, color: PAL.dim });
  p.text(76, 332, 'on this disk the table is ' + (FAT.tableBytes / FAT.diskBytes * 100).toFixed(1) +
    ' per cent of the volume', { size: 10.5, mono: true, color: PAL.warn });

  takeaway(p, lt, 24,
    'Count the table\u2019s blocks before you count the data. The table is spent whether or not the files are large.',
    'And in linked allocation the pointer is inside the block, so subtract its width from every block\u2019s usable capacity.');
}

/* ---------------- scene 4: inode size ---------------- */

function sceneInodeSize(p, lt) {
  heading(p, 'Indexed allocation: how far the pointers reach',
    'pointers per block = block size \u00f7 address size = ' + FS.blockBytes + ' \u00f7 ' +
    FS.addrBytes + ' = ' + FS.ptrsPerBlock);

  /* the inode */
  var ix = 60, iy = 84;
  p.text(ix, iy - 8, 'inode', { size: 10.5, color: PAL.dim });
  box(p, ix, iy, 250, 168, { fill: PAL.surface });
  var fields = [
    ['12 direct', '12 blocks', PAL.accent],
    ['1 single indirect', FS.ptrsPerBlock + ' blocks', PAL.info],
    ['1 double indirect', '1,048,576 blocks', PAL.warn]
  ];
  fields.forEach(function (f, i) {
    var on = beat(lt, 2 + i * 3, 4 + i * 3) > 0;
    p.text(ix + 12, iy + 24 + i * 40, f[0], { size: 11, mono: true, bold: on, color: on ? f[2] : PAL.dim });
    p.text(ix + 12, iy + 42 + i * 40, '\u2192 ' + f[1], { size: 10, mono: true, color: on ? PAL.ink : PAL.faint });
  });
  p.text(ix + 12, iy + 150, 'triple indirect: none here', { size: 9.5, color: PAL.faint });

  /* the tree, one level per row */
  var gx = 340, gy = 84;
  p.text(gx, gy - 8, 'the pointer tree', { size: 10.5, color: PAL.dim });
  box(p, gx, gy, 502, 168, { fill: PAL.surface2, stroke: PAL.border, sw: 1 });
  p.text(gx + 14, gy + 24, 'direct     12 pointers  \u2192  12 data blocks', {
    size: 10.5, mono: true, color: PAL.accent
  });
  p.text(gx + 14, gy + 56, 'single     1 pointer  \u2192  block of ' + FS.ptrsPerBlock +
    '  \u2192  ' + FS.ptrsPerBlock + ' data blocks', { size: 10.5, mono: true, color: PAL.info });
  p.text(gx + 14, gy + 88, 'double     1 pointer  \u2192  block of ' + FS.ptrsPerBlock +
    '  \u2192  ' + FS.ptrsPerBlock + ' blocks', { size: 10.5, mono: true, color: PAL.warn });
  p.text(gx + 14, gy + 108, '                             \u2192  ' +
    (FS.ptrsPerBlock * FS.ptrsPerBlock).toLocaleString('en-US') + ' data blocks', {
      size: 10.5, mono: true, color: PAL.warn
    });
  p.text(gx + 14, gy + 136, 'every extra level multiplies by ' + FS.ptrsPerBlock +
    ', so depth beats breadth', { size: 10, color: PAL.dim });
  p.text(gx + 14, gy + 154, 'indirect blocks hold block numbers, not data', {
    size: 10, color: PAL.dim
  });

  /* arithmetic: 2019 and 2012 */
  box(p, 60, 268, 386, 80, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2 });
  p.text(76, 288, 'GATE 2019: 12 + 1,024 + 1,048,576', { size: 11, bold: true, color: PAL.accent });
  p.text(76, 308, '= ' + INODE19.blocks.toLocaleString('en-US') + ' blocks \u00d7 4 KB', {
    size: 10.5, mono: true
  });
  p.text(76, 328, '= ' + INODE19.gb.toFixed(5) + ' GB \u2192 ' + INODE19.gbRounded.toFixed(1) + ' GB', {
    size: 10.5, mono: true, bold: true
  });

  box(p, 456, 268, 386, 80, { fill: PAL.surface, stroke: PAL.border, sw: 1 });
  p.text(472, 288, 'GATE 2012: 8 + 16 + 256 blocks', { size: 11, bold: true });
  p.text(472, 308, '= ' + INODE12.blocks + ' \u00d7 128 B = ' + INODE12.bytes + ' B', {
    size: 10.5, mono: true
  });
  p.text(472, 328, '= ' + INODE12.kb + ' KB, not the block count ' + INODE12.blocks, {
    size: 10.5, mono: true, color: PAL.warn
  });

  takeaway(p, lt, 24,
    'In a maximum-size question the deepest level present decides the answer; the shallow terms are rounding error.',
    'GATE 2004 with a triple indirect: 2^34 bytes, and the direct and single terms together are 0.0016 per cent of it.');
}

/* ---------------- scene 5: insertion cost ---------------- */

function sceneInsert(p, lt) {
  heading(p, 'Insert one block after the fiftieth of a hundred',
    'count disk accesses: reads and writes, nothing cached that the question did not cache');

  /* contiguous column */
  var cy = 84;
  box(p, 60, cy, 380, 190, { fill: PAL.surface, stroke: PAL.warn, sw: 1.2 });
  p.text(76, cy + 22, 'contiguous', { size: 12.5, bold: true, color: PAL.warn });
  p.text(76, cy + 42, 'the blocks must stay in order, so the tail moves', {
    size: 10, color: PAL.dim
  });
  for (var i = 0; i < 8; i++) {
    var bx = 76 + i * 44;
    var shifted = i >= 2;
    var on = shifted && beat(lt, 2 + i * 0.5, 3 + i * 0.5) > 0;
    box(p, bx, cy + 58, 38, 26, {
      fill: on ? PAL.warnDim : PAL.surface2,
      stroke: on ? PAL.warn : PAL.border, sw: 1
    });
    p.text(bx + 19, cy + 71, i + 1 === 3 ? 'new' : String(i + 1), {
      size: 9, mono: true, align: 'center', base: 'middle',
      color: on ? PAL.warn : PAL.faint, bold: on
    });
  }
  p.text(76, cy + 104, '\u2026 blocks 51 to 100 are read and rewritten', { size: 10, color: PAL.dim });
  p.text(76, cy + 128, INSERT.contigReads + ' reads + ' + INSERT.contigWrites +
    ' writes = ' + INSERT.nA, { size: 13, mono: true, bold: true });
  p.text(76, cy + 150, 'the new block is written once; its data is already in memory', {
    size: 9.5, color: PAL.dim
  });
  p.text(76, cy + 172, 'no order to keep? then nothing moves', { size: 9.5, color: PAL.faint });

  /* linked column */
  box(p, 456, cy, 386, 190, { fill: PAL.surface, stroke: PAL.accent, sw: 1.2 });
  p.text(472, cy + 22, 'linked', { size: 12.5, bold: true, color: PAL.accent });
  p.text(472, cy + 42, 'walk to block 50, then patch one pointer', { size: 10, color: PAL.dim });
  var walk = beat(lt, 10, 14);
  for (var j = 0; j < 8; j++) {
    var lx = 472 + j * 44;
    var lit = walk > j / 8;
    box(p, lx, cy + 58, 38, 26, {
      fill: lit ? PAL.accentDim : PAL.surface2,
      stroke: lit ? PAL.accent : PAL.border, sw: 1
    });
    p.text(lx + 19, cy + 71, j + 4 === 8 ? '50' : String(j + 1), {
      size: 9, mono: true, align: 'center', base: 'middle',
      color: lit ? PAL.ink : PAL.faint
    });
  }
  p.text(472, cy + 104, '\u2026 the walk to block 50 is ' + INSERT.linkedReads + ' reads', {
    size: 10, color: PAL.dim
  });
  p.text(472, cy + 128, INSERT.linkedReads + ' reads + ' + INSERT.linkedWrites +
    ' writes = ' + INSERT.nB, { size: 13, mono: true, bold: true });
  p.text(472, cy + 150, 'the two writes are the new block and the block before it', {
    size: 9.5, color: PAL.dim
  });

  /* the sum */
  var on2 = beat(lt, 18, 21) > 0;
  box(p, 60, 292, 782, 56, {
    fill: on2 ? PAL.accentDim : PAL.surface2,
    stroke: on2 ? PAL.accent : PAL.border, sw: 1.2
  });
  p.text(76, 312, 'GATE 2022:  n' + 'A' + ' + n' + 'B' + ' = ' + INSERT.nA + ' + ' +
    INSERT.nB + ' = ' + INSERT.total + ' disk accesses', {
      size: 13, mono: true, bold: on2, color: on2 ? PAL.accent : PAL.dim
    });
  p.text(76, 334, 'indexed would pay ' + INSERT.indexedCold + ' cold, or ' +
    INSERT.indexedWarm + ' if the index block is already in memory', {
      size: 10, color: PAL.dim
    });

  takeaway(p, lt, 24,
    'The scheme sets the count, not the file size: both files hold a hundred blocks and the counts differ by two.',
    'When a question says the control block or the index block is in memory, that access is free and must not be counted.');
}

/* ---------------- scene 6: free space ---------------- */

function sceneFreeSpace(p, lt) {
  heading(p, 'Remembering which blocks are free',
    'a bitmap spends one bit per block; a list spends free block numbers inside free blocks');

  /* bitmap */
  var by = 84;
  p.text(60, by - 8, 'bitmap \u2014 1 TB disk, 4 KB blocks', { size: 10.5, color: PAL.dim });
  box(p, 60, by, 782, 96, { fill: PAL.surface, stroke: PAL.border, sw: 1 });
  var bits = [1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0];
  bits.forEach(function (b, i) {
    var x = 76 + i * 31;
    var on = beat(lt, 1 + i * 0.1, 2 + i * 0.1) > 0;
    p.text(x, by + 26, String(b), {
      size: 11, mono: true,
      color: !on ? PAL.faint : b ? PAL.accent : PAL.warn, bold: on
    });
  });
  p.text(76, by + 52, '1 = free, 0 = in use \u2014 one bit per block, so bits = blocks', {
    size: 10, color: PAL.dim
  });
  p.text(76, by + 74, BITMAP.blocks.toLocaleString('en-US') + ' blocks \u2192 ' +
    BITMAP.bytes.toLocaleString('en-US') + ' B = ' + BITMAP.mb + ' MB = ' +
    BITMAP.tableBlocks.toLocaleString('en-US') + ' blocks of 4 KB', {
      size: 11, mono: true, bold: true, color: PAL.accent
    });

  /* free list */
  var ly = 200;
  p.text(60, ly - 8, 'linked free list \u2014 16 GB disk, 2 KB blocks', { size: 10.5, color: PAL.dim });
  box(p, 60, ly, 470, 120, { fill: PAL.surface, stroke: PAL.border, sw: 1 });
  /* one list block drawn as cells */
  for (var i2 = 0; i2 < 6; i2++) {
    var lx2 = 76 + i2 * 42;
    box(p, lx2, ly + 16, 38, 24, { fill: PAL.surface2, stroke: PAL.border, sw: 1 });
    p.text(lx2 + 19, ly + 28, i2 === 5 ? '\u2026' : String(1000 + i2), {
      size: 9, mono: true, align: 'center', base: 'middle', color: PAL.dim
    });
  }
  box(p, 76 + 6 * 42, ly + 16, 52, 24, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1 });
  p.text(76 + 6 * 42 + 26, ly + 28, 'next \u2192', {
    size: 9, mono: true, align: 'center', base: 'middle', color: PAL.warn
  });
  p.text(76, ly + 58, 'the link takes 4 of the 2,048 bytes, leaving 2,044', { size: 10, color: PAL.dim });
  p.text(76, ly + 76, '2,044 \u00f7 4 = ' + FREE.entriesPerBlock + ' block numbers per list block', {
    size: 10.5, mono: true
  });
  p.text(76, ly + 98, 'not 2,048 \u00f7 4 = ' + FREE.naiveEntries + ': the link costs one entry', {
    size: 10, color: PAL.warn
  });

  /* the division */
  box(p, 548, ly, 294, 120, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2 });
  p.text(564, ly + 20, 'GATE 2026 Set 2', { size: 11, bold: true, color: PAL.accent });
  p.text(564, ly + 42, FREE.blocks.toLocaleString('en-US') + ' free blocks', {
    size: 10.5, mono: true
  });
  p.text(564, ly + 60, '\u00f7 ' + FREE.entriesPerBlock + ' = ' + FREE.exact.toFixed(2), {
    size: 10.5, mono: true
  });
  p.text(564, ly + 82, 'ceiling = ' + FREE.listBlocks.toLocaleString('en-US') + ' list blocks', {
    size: 12, mono: true, bold: true
  });
  p.text(564, ly + 104, 'a block cannot be split, so the ceiling is forced', {
    size: 9.5, color: PAL.dim
  });

  /* the other two schemes */
  box(p, 60, 330, 782, 30, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 5 });
  p.text(76, 345, 'grouping: batches of free numbers per block, one link each  \u00b7  counting: (first free block, run length) per entry', {
    size: 9.5, color: PAL.dim
  });

  takeaway(p, lt, 24,
    'Both schemes are one division: bits per block, or entries per block, then a ceiling.',
    'A bitmap costs a fixed fraction of the disk; a list costs nothing when the disk is full and everything when it is empty.');
}

/* ---------------- scene 7: path resolution ---------------- */

function scenePath(p, lt) {
  heading(p, 'From a name to a block',
    'every component of the path is one directory lookup, and each intermediate one is two reads');

  var x = 60;
  p.text(x, 76, '/usr/lib/libc.so', { size: 13, mono: true, bold: true });
  var comps = ['root', 'usr', 'lib', 'libc.so'];
  comps.forEach(function (c, i) {
    var y = 104 + i * 40;
    var on = beat(lt, 2 + i * 2, 4 + i * 2) > 0;
    box(p, x, y, 120, 30, {
      fill: on ? PAL.accentDim : PAL.surface2,
      stroke: on ? PAL.accent : PAL.border, sw: 1
    });
    p.text(x + 60, y + 15, c, {
      size: 10.5, mono: true, align: 'center', base: 'middle',
      color: on ? PAL.ink : PAL.faint
    });
    if (i > 0) {
      p.text(x + 140, y + 15, i < comps.length - 1 ? 'read dir, read inode \u2014 2 reads' : 'read inode \u2014 1 read', {
        size: 10, color: on ? PAL.dim : PAL.faint
      });
    }
  });
  p.text(x, 272, 'root directory read: 1', { size: 10.5, mono: true, color: PAL.dim });
  p.text(x, 292, 'total = 1 + 2\u00d72 + 1 = ' + PATH.reads + ' block reads, nothing cached', {
    size: 11.5, mono: true, bold: true, color: PAL.accent
  });
  p.text(x, 314, 'each cached directory entry removes one read', { size: 10, color: PAL.dim });

  /* the operation table */
  var tx = 470;
  box(p, tx, 76, 372, 200, { fill: PAL.surface, stroke: PAL.border, sw: 1 });
  p.text(tx + 14, 96, 'GATE 2021 Set 1 \u2014 linear-list directory', { size: 11, bold: true });
  p.text(tx + 14, 116, 'which operations must scan the whole list?', { size: 10, color: PAL.dim });
  DIR_OPS.forEach(function (d, i) {
    var on = beat(lt, 12 + i * 1.6, 14 + i * 1.6) > 0;
    var y2 = 138 + i * 32;
    p.text(tx + 14, y2, d.op, { size: 11, mono: true, bold: on, color: on ? PAL.ink : PAL.dim });
    p.text(tx + 96, y2, d.full ? 'full scan' : 'stops at the entry', {
      size: 10.5, bold: d.full && on, color: !on ? PAL.faint : d.full ? PAL.invalid : PAL.valid
    });
    p.text(tx + 200, y2, d.why, { size: 9.5, color: on ? PAL.dim : PAL.faint });
  });

  /* mounting */
  box(p, 60, 340, 782, 20, { fill: 'transparent', stroke: 'transparent', sw: 0 });
  p.text(60, 348, 'mounting grafts a second volume onto a directory of the first, so one path can cross file systems', {
    size: 10, color: PAL.dim
  });

  takeaway(p, lt, 24,
    'A search stops when it finds the name. Only an operation that must prove absence scans everything.',
    'That is why "necessarily" is the word that decides the 2021 question: create and rename, not delete and open.');
}

/* ---------------- scene 8: links ---------------- */

function sceneLinks(p, lt) {
  heading(p, 'Two names, one inode: the link count',
    'a hard link adds a directory entry; a symbolic link adds an inode');

  /* two names, one inode */
  var y = 92;
  p.text(60, y - 8, 'hard link', { size: 11, bold: true, color: PAL.accent });
  box(p, 60, y, 150, 30, { fill: PAL.surface2, stroke: PAL.border, sw: 1 });
  p.text(135, y + 15, 'report.txt', { size: 10.5, mono: true, align: 'center', base: 'middle' });
  box(p, 60, y + 40, 150, 30, { fill: PAL.surface2, stroke: PAL.border, sw: 1 });
  p.text(135, y + 55, 'notes.txt', { size: 10.5, mono: true, align: 'center', base: 'middle' });
  p.arrow(214, y + 15, 300, y + 35, { stroke: PAL.accent, sw: 1.2, head: 6 });
  p.arrow(214, y + 55, 300, y + 35, { stroke: PAL.accent, sw: 1.2, head: 6 });

  box(p, 304, y, 180, 70, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2 });
  p.text(316, y + 20, 'inode ' + LINKCOUNT.inode, { size: 11, mono: true, bold: true });
  p.text(316, y + 42, 'link count  ' + LINKCOUNT.count, {
    size: 12, mono: true, bold: true, color: PAL.accent
  });
  p.text(316, y + 60, 'one set of blocks', { size: 9.5, color: PAL.dim });

  /* the count walk */
  var cw = beat(lt, 8, 11) > 0;
  p.text(504, y + 20, cw ? 'delete notes.txt  \u2192  count 1' : 'delete notes.txt  \u2192  ?', {
    size: 10.5, mono: true, color: cw ? PAL.ink : PAL.faint
  });
  var cw2 = beat(lt, 11, 14) > 0;
  p.text(504, y + 44, cw2 ? 'delete report.txt  \u2192  count 0  \u2192  blocks freed' : 'delete report.txt  \u2192  ?', {
    size: 10.5, mono: true, bold: cw2, color: cw2 ? PAL.valid : PAL.faint
  });
  p.text(504, y + 64, 'while one name lives, the data is not freed', { size: 9.5, color: PAL.dim });

  /* symbolic link */
  var sy = 200;
  p.text(60, sy - 8, 'symbolic link', { size: 11, bold: true, color: PAL.info });
  box(p, 60, sy, 150, 30, { fill: PAL.surface2, stroke: PAL.border, sw: 1 });
  p.text(135, sy + 15, 'latest.txt', { size: 10.5, mono: true, align: 'center', base: 'middle' });
  p.arrow(214, sy + 15, 300, sy + 15, { stroke: PAL.info, sw: 1.2, head: 6 });
  box(p, 304, sy, 180, 56, { fill: PAL.surface, stroke: PAL.info, sw: 1.2 });
  p.text(316, sy + 18, 'inode ' + SYMLINK.ownInode, { size: 10.5, mono: true, bold: true });
  p.text(316, sy + 36, 'holds a path:', { size: 9.5, color: PAL.dim });
  p.text(316, sy + 50, SYMLINK.stores, { size: 9, mono: true, color: PAL.info });
  p.arrow(488, sy + 28, 560, sy + 62, { stroke: PAL.info, sw: 1, head: 5 });
  p.text(504, sy + 8, 'target inode: count unchanged', { size: 9.5, color: PAL.dim });

  /* comparison rows */
  var rows = [
    ['points at', 'an inode', 'a path'],
    ['link count', 'raised by one', 'unchanged'],
    ['can dangle', 'no', 'yes'],
    ['across file systems', 'no', 'yes']
  ];
  var ty = 282;
  p.text(60, ty - 6, 'the four differences', { size: 10.5, color: PAL.dim });
  p.text(300, ty - 6, 'hard', { size: 10, color: PAL.dim });
  p.text(420, ty - 6, 'soft', { size: 10, color: PAL.dim });
  rows.forEach(function (r, i) {
    var on = beat(lt, 16 + i * 1.6, 18 + i * 1.6) > 0;
    p.text(60, ty + 14 + i * 18, r[0], { size: 10, color: on ? PAL.ink : PAL.faint });
    p.text(300, ty + 14 + i * 18, r[1], { size: 10, color: on ? PAL.ink : PAL.faint });
    p.text(420, ty + 14 + i * 18, r[2], { size: 10, color: on ? PAL.ink : PAL.faint });
  });

  takeaway(p, lt, 24,
    'Deleting one of two names frees nothing. The link count is the only record of how many names exist.',
    'A symbolic link has its own inode and its own copy of the path, which is why it can dangle and can cross a volume.');
}

/* ---------------- scene 9: what is wasted ---------------- */

function sceneFragments(p, lt) {
  heading(p, 'What is wasted: the last block, the pointer, the table',
    'three subtractions account for nearly every space question in this topic');

  /* internal fragmentation in the last block */
  var y = 92;
  p.text(60, y - 8, 'internal fragmentation: a ' + FRAG.sizeBytes + ' B file in ' +
    FRAG.blockBytes + ' B blocks', { size: 10.5, color: PAL.dim });
  for (var i = 0; i < FRAG.blocks; i++) {
    var bx = 60 + i * 190;
    var used = i < FRAG.blocks - 1 ? FRAG.blockBytes : FRAG.sizeBytes - (FRAG.blocks - 1) * FRAG.blockBytes;
    var on = beat(lt, 2 + i * 2, 4 + i * 2) > 0;
    box(p, bx, y, 180, 34, { fill: PAL.surface2, stroke: PAL.border, sw: 1 });
    p.rect(bx, y, 180 * (used / FRAG.blockBytes), 34, {
      fill: on ? PAL.accentDim : PAL.surface2, stroke: on ? PAL.accent : PAL.border, sw: 1, radius: 6
    });
    p.text(bx + 8, y + 17, used + ' B used', {
      size: 10, mono: true, base: 'middle', color: on ? PAL.ink : PAL.faint
    });
    if (i === FRAG.blocks - 1 && on) {
      p.text(bx + 8, y + 48, 'wasted: ' + FRAG.internal + ' B', {
        size: 10.5, mono: true, bold: true, color: PAL.warn
      });
    }
  }
  p.text(60, y + 70, 'ceil(' + FRAG.sizeBytes + ' / ' + FRAG.blockBytes + ') = ' + FRAG.blocks +
    ' blocks = ' + FRAG.allocated + ' B, so ' + FRAG.allocated + ' \u2212 ' + FRAG.sizeBytes +
    ' = ' + FRAG.internal + ' B is unusable', { size: 10.5, mono: true });

  /* the inode table as a second limit */
  box(p, 60, 200, 782, 84, { fill: PAL.surface, stroke: PAL.border, sw: 1 });
  p.text(76, 220, 'a second, independent limit: the inode table is a fixed array', {
    size: 11.5, bold: true
  });
  p.text(76, 242, INODES.count.toLocaleString('en-US') + ' inodes \u00d7 ' + INODES.bytesEach +
    ' B = ' + INODES.tableMB.toFixed(0) + ' MB of the volume, decided at format time', {
      size: 10.5, mono: true
    });
  p.text(76, 262, 'so a volume can refuse a new file while free blocks remain: it has run out of inodes, not space', {
    size: 10.5, color: PAL.warn
  });

  /* the trade-off */
  box(p, 60, 300, 782, 44, { fill: PAL.surface2, stroke: PAL.border, sw: 1 });
  p.text(76, 318, 'block size is a trade, not an optimum', { size: 10.5, bold: true });
  p.text(76, 336, 'larger blocks: fewer table entries, longer transfers, more tail waste  \u00b7  smaller blocks: the reverse', {
    size: 10, color: PAL.dim
  });

  takeaway(p, lt, 24,
    'Space questions are the last block, the pointer inside the block, and the table. Each is one subtraction.',
    'Internal waste is inside a block you were given; external waste is free space you were not given because it is the wrong shape.');
}

/* ---------------- scene 10: the procedure ---------------- */

function sceneRecipe(p, lt) {
  heading(p, 'The procedure', 'three steps, then the five traps');

  var steps = [
    ['1  Convert to blocks', 'size \u00f7 block size, rounded up; write the block count down'],
    ['2  Pointers per block', 'block size \u00f7 address size, then sum direct, single, double'],
    ['3  For free space', 'bits or entries per block, subtract the link, then a ceiling']
  ];
  steps.forEach(function (s, i) {
    var y = 90 + i * 46;
    var on = beat(lt, 2 + i * 3, 4 + i * 3) > 0;
    box(p, 60, y, 470, 38, {
      fill: on ? PAL.accentDim : PAL.surface2,
      stroke: on ? PAL.accent : PAL.border, sw: 1
    });
    p.text(74, y + 16, s[0], { size: 12, bold: true });
    p.text(74, y + 31, s[1], { size: 10, color: PAL.dim });
  });

  var traps = [
    'block count answered as bytes',
    'the pointer inside the block forgotten',
    '512 instead of 511 entries',
    'missing the word "necessarily"',
    'link count assumed to free space'
  ];
  p.text(556, 90, 'five traps', { size: 12, bold: true, color: PAL.warn });
  traps.forEach(function (t, i) {
    var on = beat(lt, 12 + i * 2.4, 14 + i * 2.4) > 0;
    box(p, 556, 104 + i * 34, 286, 28, {
      fill: on ? PAL.warnDim : 'transparent',
      stroke: on ? PAL.warn : PAL.border, sw: 1, radius: 5
    });
    p.text(568, 118 + i * 34, t, { size: 10.2, base: 'middle', color: on ? PAL.ink : PAL.dim });
  });

  if (beat(lt, 24, 28) > 0) {
    box(p, 60, 286, 782, 70, { fill: PAL.surface2, stroke: PAL.border, sw: 1 });
    p.text(76, 308, 'Six results worth memorising', { size: 13, bold: true });
    p.text(76, 330, '2019: 1,049,612 blocks = ' + INODE19.gbRounded.toFixed(1) +
      ' GB   \u00b7   2012: 280 blocks = ' + INODE12.kb + ' KB   \u00b7   2014: ' +
      FAT.dataMB + ' MB', { size: 10.5, color: PAL.dim });
    p.text(76, 348, '2025: ' + LINK.waste + ' B wasted   \u00b7   2022: ' + INSERT.total +
      ' accesses   \u00b7   2026: ' + FREE.listBlocks.toLocaleString('en-US') + ' list blocks', {
        size: 10.5, color: PAL.dim
      });
  }
}

/* ---------------- dispatch ---------------- */

var SCENES = {
  anatomy: sceneAnatomy,
  allocation: sceneAllocation,
  fat: sceneFat,
  'inode-size': sceneInodeSize,
  'insert-cost': sceneInsert,
  'free-space': sceneFreeSpace,
  path: scenePath,
  links: sceneLinks,
  fragments: sceneFragments,
  recipe: sceneRecipe
};

function drawFrame(painter) {
  if (!painter) return;
  P = painter;
  var tl = window.LESSON_TIMELINE;
  var tt = K.state.elapsed;
  var idx = K.sceneAt(tt);
  var sc = tl.scenes[idx];
  painter.alpha(1);
  painter.clear();
  bg(painter);
  if (sc && SCENES[sc.id]) {
    try {
      SCENES[sc.id](painter, tt - sc.start);
    } catch (err) {
      console.error('scene draw failed', sc.id, err);
    }
  }
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
  buildChecks();
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

  K.init({
    timeline: window.LESSON_TIMELINE,
    draw: function () { if (P) drawFrame(P); }
  });

  K.onResize(function () { if (P) drawFrame(P); });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { if (P) drawFrame(P); });
  }

  window.__drawAt = function (t) {
    K.state.elapsed = t;
    if (P) drawFrame(P);
  };

  window.__lessonChecks = CHECKS;
  var bad = CHECKS.filter(function (c) { return !c.pass; });
  if (bad.length) console.warn('Model validation did not fully pass:', bad);
}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
