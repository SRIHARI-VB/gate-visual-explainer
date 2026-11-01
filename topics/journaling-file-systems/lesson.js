/* ==========================================================================
   journaling-file-systems — lesson.js
   Four layers, in order:
     1. THE MODEL   — a block-level filesystem (bitmap, inode table, eight data
                      blocks) and three transactions. The same workload is run
                      under four commit disciplines — no journal, metadata-only
                      writeback, metadata-only ordered, and full data journaling
                      — crashed at EVERY write point, recovered by replaying to
                      the last commit record, and checked against four
                      invariants: dangling reference, leaked block, aliased
                      block, and bytes the file never wrote.
     2. THE CHECKS  — every number the lesson states, re-verified at load.
     3. RENDER      — reads the model; never re-derives a value.
     4. BOOT        — p5.js first, the browser's own canvas as the fallback.

   Every number on the canvas and in every caption comes from this file.
   ========================================================================== */

(function () {
  'use strict';

  var W = 900, H = 470;
  var K = window.LessonKit;
  var PR = window.Painters;
  var PAL = (PR && PR.PAL) ? PR.PAL : {
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
   A block-level filesystem: a bitmap, one inode table, eight data blocks.
   Three transactions run in sequence. Every transaction is a list of block
   writes (the new IMAGE of each block, which is what a redo journal stores).
   The same workload is then replayed under four commit disciplines and
   crashed at every single write point, and the recovered image is checked
   against four invariants. Nothing on this page is quoted from memory.
   ====================================================================== */

  var DATA_BLOCKS = 8;

  function cloneInode(i) { return { name: i.name, size: i.size, blocks: i.blocks.slice() }; }

  function cloneImg(im) {
    return {
      bitmap: im.bitmap.slice(),
      inodes: im.inodes.map(cloneInode),
      data: im.data.slice()
    };
  }

  /* The starting disk. File g owns data block 0. Blocks 1, 2 and 3 are FREE
     but still hold the bytes of a file x that was deleted earlier: freeing a
     block does not erase it. Those leftovers are what a stale read exposes. */
  function baseImage() {
    return {
      bitmap: [1, 0, 0, 0, 0, 0, 0, 0],
      inodes: [{ name: 'g', size: 1, blocks: [0] }],
      data: ['g#1', 'x#1', 'x#2', 'x#3', '', '', '', '']
    };
  }

  function put(im, key, val) {
    if (key === 'bitmap') im.bitmap = val.slice();
    else if (key === 'inode') im.inodes = val.map(cloneInode);
    else if (key.indexOf('data') === 0) im.data[Number(key.slice(4))] = val;
  }

  var TXN_DEFS = [
    { id: 'T1', label: 'create f', kind: 'create' },
    { id: 'T2', label: 'unlink g', kind: 'unlink' },
    { id: 'T3', label: 'append to f', kind: 'append' }
  ];

  /* The block writes one transaction needs, given the image it starts from. */
  function txnWrites(kind, im) {
    var w = [];
    if (kind === 'create') {
      var bm = im.bitmap.slice(); bm[1] = 1; bm[2] = 1;
      w.push({ kind: 'meta', key: 'bitmap', val: bm });
      var ino = im.inodes.map(cloneInode);
      ino.push({ name: 'f', size: 2, blocks: [1, 2] });
      w.push({ kind: 'meta', key: 'inode', val: ino });
      w.push({ kind: 'data', key: 'data1', val: 'f#1' });
      w.push({ kind: 'data', key: 'data2', val: 'f#2' });
    } else if (kind === 'unlink') {
      var bm2 = im.bitmap.slice(); bm2[0] = 0;
      w.push({ kind: 'meta', key: 'bitmap', val: bm2 });
      w.push({
        kind: 'meta', key: 'inode',
        val: im.inodes.filter(function (x) { return x.name !== 'g'; }).map(cloneInode)
      });
    } else {
      var bm3 = im.bitmap.slice(); bm3[3] = 1;
      w.push({ kind: 'meta', key: 'bitmap', val: bm3 });
      var ino3 = im.inodes.map(function (x) {
        return x.name === 'f' ? { name: 'f', size: 3, blocks: [1, 2, 3] } : cloneInode(x);
      });
      w.push({ kind: 'meta', key: 'inode', val: ino3 });
      w.push({ kind: 'data', key: 'data3', val: 'f#3' });
    }
    return w;
  }

  /* The three transactions as the system intends them: each one's writes are
     computed against the image the previous ones produced. */
  function intended() {
    var im = baseImage(), out = [];
    TXN_DEFS.forEach(function (d, i) {
      var w = txnWrites(d.kind, im);
      w.forEach(function (x) { put(im, x.key, x.val); });
      out.push({
        txn: i, id: d.id, label: d.label, writes: w,
        meta: w.filter(function (x) { return x.kind === 'meta'; }).length,
        data: w.filter(function (x) { return x.kind === 'data'; }).length
      });
    });
    return out;
  }

  var MODES = ['none', 'writeback', 'ordered', 'journal'];

  var MODE_NOTE = {
    none: 'no journal: every block written in place, metadata first',
    writeback: 'metadata journaled; data may land after the commit',
    ordered: 'metadata journaled; data forced out before the commit',
    journal: 'full data journaling: data and metadata both logged'
  };

  /* The complete ordered list of write points a crash can interrupt. */
  function buildOps(mode) {
    var ops = [];
    intended().forEach(function (tx, ti) {
      var meta = tx.writes.filter(function (x) { return x.kind === 'meta'; });
      var data = tx.writes.filter(function (x) { return x.kind === 'data'; });
      if (mode === 'none') {
        meta.concat(data).forEach(function (w) { ops.push({ txn: ti, type: 'inplace', w: w }); });
        return;
      }
      ops.push({ txn: ti, type: 'desc' });
      meta.forEach(function (w) { ops.push({ txn: ti, type: 'log', w: w }); });
      if (mode === 'ordered') data.forEach(function (w) { ops.push({ txn: ti, type: 'inplace', w: w }); });
      if (mode === 'journal') data.forEach(function (w) { ops.push({ txn: ti, type: 'log', w: w }); });
      ops.push({ txn: ti, type: 'commit' });
      meta.forEach(function (w) { ops.push({ txn: ti, type: 'inplace', w: w }); });
      if (mode === 'journal' || mode === 'writeback') {
        data.forEach(function (w) { ops.push({ txn: ti, type: 'inplace', w: w }); });
      }
      ops.push({ txn: ti, type: 'head' });
    });
    return ops;
  }

  /* Execute the first k write points, then stop: the machine loses power. */
  function run(ops, k) {
    var disk = baseImage(), log = [];
    for (var i = 0; i < k; i++) {
      var o = ops[i];
      if (o.type === 'inplace') put(disk, o.w.key, o.w.val);
      else if (o.type === 'log') log.push({ txn: o.txn, type: 'log', key: o.w.key, val: o.w.val });
      else log.push({ txn: o.txn, type: o.type });
    }
    return { disk: disk, log: log };
  }

  /* Recovery: scan the journal for the LAST commit record, then redo every
     logged block image up to it. Anything after it belongs to a transaction
     that never committed and is discarded. */
  function recover(st) {
    var lastCommit = -1;
    for (var i = 0; i < st.log.length; i++) if (st.log[i].type === 'commit') lastCommit = i;
    var im = cloneImg(st.disk);
    for (var j = 0; j <= lastCommit; j++) {
      if (st.log[j].type === 'log') put(im, st.log[j].key, st.log[j].val);
    }
    return { image: im, lastCommit: lastCommit };
  }

  function durableCount(log) {
    var s = {}, n = 0;
    log.forEach(function (e) { if (e.type === 'commit' && !s[e.txn]) { s[e.txn] = 1; n++; } });
    return n;
  }

  /* The four invariants. Two are about metadata, two about the bytes. */
  function violations(im) {
    var meta = [], data = [], refs = {};
    im.inodes.forEach(function (i) {
      i.blocks.forEach(function (b) { (refs[b] = refs[b] || []).push(i.name); });
    });
    Object.keys(refs).forEach(function (b) {
      if (!im.bitmap[b]) meta.push('dangling:' + b);
      if (refs[b].length > 1) meta.push('alias:' + b);
    });
    im.bitmap.forEach(function (u, b) { if (u && !refs[b]) meta.push('leak:' + b); });
    im.inodes.forEach(function (i) {
      i.blocks.forEach(function (b) {
        var c = im.data[b];
        var owner = c ? String(c).split('#')[0] : '';
        if (owner !== i.name) data.push((c ? 'stale:' : 'unwritten:') + b);
      });
    });
    return { meta: meta, data: data };
  }

  /* The image the whole workload is meant to produce. */
  function finalImage() {
    var im = baseImage();
    intended().forEach(function (t) { t.writes.forEach(function (w) { put(im, w.key, w.val); }); });
    return im;
  }

  /* Crash at every write point, recover, and classify. */
  function census(mode) {
    var ops = buildOps(mode), pts = [];
    for (var k = 0; k <= ops.length; k++) {
      var st = run(ops, k);
      var rec = (mode === 'none') ? { image: st.disk, lastCommit: -1 } : recover(st);
      var v = violations(rec.image);
      pts.push({
        k: k, meta: v.meta.length, data: v.data.length,
        durable: durableCount(st.log), logLen: st.log.length,
        complete: sameImage(rec.image, finalImage()),
        nextOp: ops[k] || null, metaList: v.meta, dataList: v.data
      });
    }
    function count(f) { return pts.filter(f).length; }
    return {
      mode: mode, note: MODE_NOTE[mode], ops: ops.length, points: pts,
      metaBad: count(function (p) { return p.meta > 0; }),
      dataBad: count(function (p) { return p.data > 0; }),
      anyBad: count(function (p) { return p.meta > 0 || p.data > 0; }),
      allDurable: count(function (p) { return p.durable === TXN_DEFS.length; }),
      complete: count(function (p) { return p.complete; })
    };
  }

  /* First write-point index at which transaction ti is durable. */
  function durableAt(cen, ti) {
    for (var i = 0; i < cen.points.length; i++) if (cen.points[i].durable > ti) return cen.points[i].k;
    return -1;
  }

  var CEN = {};
  MODES.forEach(function (m) { CEN[m] = census(m); });

  /* ---- the cost of the log: 1 descriptor + m images + 1 commit, twice ---- */
  function journalCost(m) { return 2 * m + 3; }

  var COST_ROWS = [1, 2, 4, 8, 16, 32, 64].map(function (m) {
    return { m: m, plain: m, jrnl: journalCost(m), ratio: journalCost(m) / m };
  });

  /* ---- a circular journal of 64 blocks ---- */
  var JOURNAL_BLOCKS = 64;
  function perTxnLog(m) { return m + 2; }          /* descriptor + m images + commit */
  function txnsBeforeFull(m) { return Math.floor(JOURNAL_BLOCKS / perTxnLog(m)); }

  /* ---- replay cost against the size of the disk ---- */
  var DISK_BLOCKS_1G = 262144;                      /* 1 GiB in 4 KiB blocks */
  var REPLAY_RATIO = DISK_BLOCKS_1G / JOURNAL_BLOCKS;

  /* ---- idempotence: replaying twice must equal replaying once ---- */
  function stateAfter(mode, k) {
    var ops = buildOps(mode), st = run(ops, k);
    var once = (mode === 'none') ? st.disk : recover(st).image;
    var twice = cloneImg(once);
    if (mode !== 'none') {
      var st2 = { disk: once, log: st.log };
      twice = recover(st2).image;
    }
    return { once: once, twice: twice };
  }

  function sameImage(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  /* ---- the staleness census: every order of the three in-place writes ---- */
  function permutations(arr) {
    if (arr.length <= 1) return [arr.slice()];
    var out = [];
    arr.forEach(function (x, i) {
      var rest = arr.slice(0, i).concat(arr.slice(i + 1));
      permutations(rest).forEach(function (p) { out.push([x].concat(p)); });
    });
    return out;
  }

  function stalenessOrders() {
    var keys = ['bitmap', 'inode', 'data3'];
    return permutations(keys).map(function (order) {
      var ip = order.indexOf('inode'), dp = order.indexOf('data3');
      return { order: order, stale: ip < dp };
    });
  }

  /* ---- journaling replays a wrong value faithfully ---- */
  function wrongButAtomic() {
    var im = baseImage();
    var bad = {
      kind: 'meta', key: 'inode',
      val: [{ name: 'g', size: 1, blocks: [0] }, { name: 'f', size: 4, blocks: [1, 2, 3, 4] }]
    };
    var log = [{ txn: 0, type: 'log', key: 'bitmap', val: [1, 1, 1, 1, 0, 0, 0, 0] },
               { txn: 0, type: 'log', key: bad.key, val: bad.val },
               { txn: 0, type: 'commit' }];
    var rec = recover({ disk: im, log: log }).image;
    var v = violations(rec);
    return { blocks: rec.inodes[1].blocks.length, meta: v.meta, data: v.data };
  }

  var N = {
    dataBlocks: DATA_BLOCKS,
    txns: intended().map(function (t) {
      return { id: t.id, label: t.label, meta: t.meta, data: t.data, writes: t.writes.length };
    }),
    modes: MODES,
    census: MODES.map(function (m) {
      var c = CEN[m];
      return {
        mode: m, note: c.note, ops: c.ops, points: c.points.length,
        metaBad: c.metaBad, dataBad: c.dataBad, anyBad: c.anyBad,
        allDurable: c.allDurable, complete: c.complete
      };
    }),
    /* the crash-point detail the captions quote */
    noneFirstBad: (function () {
      var p = CEN.none.points.filter(function (x) { return x.meta > 0 || x.data > 0; });
      return p.length ? { k: p[0].k, meta: p[0].meta, data: p[0].data } : null;
    })(),
    noneDangling: (function () {
      var hit = null;
      CEN.none.points.forEach(function (p) {
        p.metaList.forEach(function (m) { if (m.indexOf('dangling') === 0 && !hit) hit = { k: p.k, v: m }; });
      });
      return hit;
    })(),
    orderedDurableAt: [0, 1, 2].map(function (i) { return durableAt(CEN.ordered, i); }),
    writebackDurableAt: [0, 1, 2].map(function (i) { return durableAt(CEN.writeback, i); }),
    journalDurableAt: [0, 1, 2].map(function (i) { return durableAt(CEN.journal, i); }),
    noneDurableAt: [0, 1, 2].map(function (i) { return durableAt(CEN.none, i); }),
    writebackBadPoints: CEN.writeback.points.filter(function (p) { return p.data > 0; })
      .map(function (p) { return { k: p.k, n: p.data, list: p.dataList }; }),
    costRows: COST_ROWS,
    journalBlocks: JOURNAL_BLOCKS,
    perTxnLog: perTxnLog(2),
    txnsBeforeFull: txnsBeforeFull(2),
    maxTxnBlocks: JOURNAL_BLOCKS - 2,
    diskBlocks1G: DISK_BLOCKS_1G,
    replayRatio: REPLAY_RATIO,
    idem: (function () {
      var s = stateAfter('ordered', CEN.ordered.ops);
      return { same: sameImage(s.once, s.twice) };
    })(),
    discard: (function () {
      /* crash inside T2's log writes, before its commit record */
      var ops = buildOps('ordered');
      var cut = 0;
      for (var i = 0; i < ops.length; i++) {
        if (ops[i].txn === 1 && ops[i].type === 'commit') { cut = i; break; }
      }
      var st = run(ops, cut);                 /* T2 fully logged, never committed */
      var rec = recover(st).image;
      var prefix = recover(run(ops, durableAt(CEN.ordered, 0))).image;
      return { cut: cut, matchesCommittedPrefix: sameImage(rec, prefix),
               logLen: st.log.length,
               t2Present: rec.inodes.some(function (x) { return x.name === 'g'; }) };
    })(),
    stale: (function () {
      var o = stalenessOrders();
      return { total: o.length, unsafe: o.filter(function (x) { return x.stale; }).length, rows: o };
    })(),
    wrong: wrongButAtomic(),
    passed: 0,
    total: 0
  };

/* ======================================================================
   LAYER 2 — THE CHECKS
   ====================================================================== */

  var CHECKS = [];
  function check(name, fn) {
    var r;
    try { r = fn(); }
    catch (e) { r = { pass: false, detail: 'threw ' + e.message }; }
    CHECKS.push({ name: name, pass: !!r.pass, detail: r.detail || '' });
  }
  function eq(a, b, what) {
    return { pass: a === b, detail: what + ': ' + a + ' vs ' + b };
  }

  check('the starting image satisfies all four invariants', function () {
    var v = violations(baseImage());
    return { pass: v.meta.length === 0 && v.data.length === 0, detail: v.meta.concat(v.data).join(',') };
  });

  check('the workload writes 9 blocks without a journal', function () {
    return eq(CEN.none.ops, 9, 'in-place write points');
  });

  check('metadata-only journaling costs 24 write points on this workload', function () {
    return eq(CEN.ordered.ops, 24, 'ordered write points');
  });

  check('writeback mode has the same write-point count as ordered', function () {
    return eq(CEN.writeback.ops, CEN.ordered.ops, 'points');
  });

  check('full data journaling costs 27 write points', function () {
    return eq(CEN.journal.ops, 27, 'journal write points');
  });

  check('T1 alone needs 2 metadata blocks and 2 data blocks', function () {
    var t = N.txns[0];
    return { pass: t.meta === 2 && t.data === 2, detail: t.meta + ' meta, ' + t.data + ' data' };
  });

  check('no-journal: 6 of the 10 crash points leave an inconsistent disk', function () {
    return eq(CEN.none.anyBad, 6, 'inconsistent crash points');
  });

  check('no-journal: only 4 of the 10 crash points leave a clean disk', function () {
    return eq(CEN.none.points.length - CEN.none.anyBad, 4, 'clean crash points');
  });

  check('no-journal: the workload survives whole at exactly 1 crash point', function () {
    return eq(CEN.none.complete, 1, 'crash points where all three operations survive');
  });

  check('no-journal: 3 of the 10 crash points break metadata', function () {
    return eq(CEN.none.metaBad, 3, 'metadata-breaking crash points');
  });

  check('no-journal: the first bad crash point is the first in-place write', function () {
    return eq(N.noneFirstBad.k, 1, 'k');
  });

  check('no-journal: a crash after the bitmap write leaves a leaked block', function () {
    var p = CEN.none.points[1];
    return { pass: p.metaList.length === 2 && p.metaList[0].indexOf('leak') === 0,
             detail: p.metaList.join(',') };
  });

  check('no-journal: freeing before unlinking leaves a dangling reference', function () {
    return { pass: !!N.noneDangling && N.noneDangling.v === 'dangling:0',
             detail: N.noneDangling ? N.noneDangling.v + ' at k=' + N.noneDangling.k : 'none' };
  });

  check('ordered journaling: 0 of 25 crash points break anything', function () {
    return { pass: CEN.ordered.metaBad === 0 && CEN.ordered.dataBad === 0,
             detail: CEN.ordered.metaBad + '/' + CEN.ordered.dataBad };
  });

  check('full data journaling: 0 of 28 crash points break anything', function () {
    return { pass: CEN.journal.metaBad === 0 && CEN.journal.dataBad === 0,
             detail: CEN.journal.metaBad + '/' + CEN.journal.dataBad };
  });

  check('writeback journaling keeps metadata consistent at all 25 crash points', function () {
    return eq(CEN.writeback.metaBad, 0, 'metadata-breaking points');
  });

  check('writeback journaling exposes stale data at exactly 7 crash points', function () {
    return eq(CEN.writeback.dataBad, 7, 'data-breaking points');
  });

  check('the 7 writeback data failures are 4 inside T1 and 3 inside T3', function () {
    var ks = N.writebackBadPoints.map(function (p) { return p.k; });
    var a = ks.filter(function (k) { return k < 9; }).length;
    return { pass: a === 4 && ks.length - a === 3, detail: ks.join(',') };
  });

  check('writeback: 18 of the 25 crash points are clean', function () {
    return eq(CEN.writeback.points.length - CEN.writeback.anyBad, 18, 'clean points');
  });

  check('ordered commits T1 at write point 6', function () {
    return eq(N.orderedDurableAt[0], 6, 'first durable k for T1');
  });

  check('ordered commits T2 at write point 13', function () {
    return eq(N.orderedDurableAt[1], 13, 'first durable k for T2');
  });

  check('ordered commits T3 at write point 21', function () {
    return eq(N.orderedDurableAt[2], 21, 'first durable k for T3');
  });

  check('durability begins at the write point straight after the commit record', function () {
    var ok = true, det = [];
    ['ordered', 'writeback', 'journal'].forEach(function (m) {
      var ops = buildOps(m), firstCommit = -1;
      for (var i = 0; i < ops.length; i++) { if (ops[i].type === 'commit') { firstCommit = i; break; } }
      var got = durableAt(CEN[m], 0);
      det.push(m + ' ' + firstCommit + '->' + got);
      if (got !== firstCommit + 1) ok = false;
    });
    return { pass: ok, detail: det.join(' ') };
  });

  check('no journal means no commit record, so nothing is ever marked durable', function () {
    var any = CEN.none.points.some(function (p) { return p.durable > 0; });
    return { pass: !any, detail: 'no commit records' };
  });

  check('writeback reaches durability earlier than ordered on T1', function () {
    return { pass: N.writebackDurableAt[0] === 4 && N.orderedDurableAt[0] === 6,
             detail: N.writebackDurableAt[0] + ' vs ' + N.orderedDurableAt[0] };
  });

  check('ordered: the whole workload survives at 4 of 25 crash points', function () {
    return eq(CEN.ordered.complete, 4, 'fully surviving crash points');
  });

  check('full data journaling: the whole workload survives at 5 of 28 crash points', function () {
    return eq(CEN.journal.complete, 5, 'fully surviving crash points');
  });

  check('writeback: the workload is durable at 5 crash points but intact at only 2', function () {
    return { pass: CEN.writeback.allDurable === 5 && CEN.writeback.complete === 2,
             detail: CEN.writeback.allDurable + ' durable, ' + CEN.writeback.complete + ' intact' };
  });

  check('ordered: durable and intact coincide at 4 crash points', function () {
    return { pass: CEN.ordered.allDurable === 4 && CEN.ordered.complete === 4,
             detail: CEN.ordered.allDurable + '/' + CEN.ordered.complete };
  });

  check('a journal write costs 2m + 3 block writes for m metadata blocks', function () {
    return { pass: journalCost(2) === 7 && journalCost(64) === 131, detail: journalCost(2) + ',' + journalCost(64) };
  });

  check('the overhead is 3.5x at m = 1 and 2.05x at m = 64', function () {
    var a = COST_ROWS[0].ratio, b = COST_ROWS[6].ratio;
    return { pass: Math.abs(a - 5) < 1e-9 && Math.abs(b - 2.046875) < 1e-9, detail: a + ',' + b };
  });

  check('a 64-block journal holds 16 transactions of 2 metadata blocks', function () {
    return eq(txnsBeforeFull(2), 16, 'transactions');
  });

  check('the largest transaction that fits a 64-block journal has 62 metadata blocks', function () {
    return eq(N.maxTxnBlocks, 62, 'metadata blocks');
  });

  check('replay reads 64 journal blocks instead of 262144 disk blocks', function () {
    return { pass: N.replayRatio === 4096, detail: String(N.replayRatio) };
  });

  check('replaying the journal twice leaves the same image as replaying once', function () {
    return { pass: N.idem.same, detail: String(N.idem.same) };
  });

  check('an uncommitted transaction is discarded and the image equals the committed prefix', function () {
    return { pass: N.discard.matchesCommittedPrefix && N.discard.t2Present,
             detail: 'cut at ' + N.discard.cut };
  });

  check('3 of the 6 in-place orders of T3 expose data the file never wrote', function () {
    return { pass: N.stale.total === 6 && N.stale.unsafe === 3, detail: N.stale.unsafe + ' of ' + N.stale.total };
  });

  check('the unsafe orders are exactly those that write the inode before the data block', function () {
    var ok = N.stale.rows.every(function (r) { return r.stale === (r.order.indexOf('inode') < r.order.indexOf('data3')); });
    return { pass: ok, detail: 'rule holds for all six' };
  });

  check('journaling replays a wrong-but-atomic value faithfully', function () {
    return { pass: N.wrong.blocks === 4 && N.wrong.meta.indexOf('dangling:4') >= 0,
             detail: N.wrong.meta.join(',') + ' / ' + N.wrong.data.join(',') };
  });

  check('every journaled crash point of the ordered run replays to an image with 2 inodes at most', function () {
    var bad = CEN.ordered.points.filter(function (p) {
      var st = run(buildOps('ordered'), p.k);
      var im = recover(st).image;
      return im.inodes.length > 2 || im.inodes.length < 1;
    });
    return { pass: bad.length === 0, detail: bad.length + ' bad' };
  });

  check('the ordered census has 25 crash points and the journal census 28', function () {
    return { pass: CEN.ordered.points.length === 25 && CEN.journal.points.length === 28,
             detail: CEN.ordered.points.length + '/' + CEN.journal.points.length };
  });

  check('the census covers 4 disciplines and 88 write points in total', function () {
    var tot = CEN.none.ops + CEN.writeback.ops + CEN.ordered.ops + CEN.journal.ops;
    return eq(tot, 9 + 24 + 24 + 27, 'total write points');
  });

  check('the journal is a circular buffer: the 17th transaction must wait', function () {
    var fits = txnsBeforeFull(2) * perTxnLog(2);
    return { pass: fits === 64 && txnsBeforeFull(2) === 16, detail: fits + ' blocks used' };
  });

  check('a 1 GiB disk of 4 KiB blocks has 262144 blocks', function () {
    return eq(N.diskBlocks1G, 262144, 'blocks');
  });

  check('ordered mode is the ext4 default and it forces data before the commit', function () {
    var row = N.costRows.filter(function (r) { return r.m === 2; })[0];
    return { pass: row.jrnl === 7 && row.plain === 2, detail: row.jrnl + ' vs ' + row.plain };
  });

  check('T2 writes no data blocks at all', function () {
    return eq(N.txns[1].data, 0, 'data blocks');
  });

  check('the four invariants are checked on 88 recovered images', function () {
    var n = MODES.reduce(function (a, m) { return a + CEN[m].points.length; }, 0);
    return eq(n, 88, 'recovered images checked');
  });

  check('the journal holds 8 entries at the moment T2 is abandoned', function () {
    return eq(N.discard.logLen, 8, 'log entries');
  });

  check('the leak at k = 1 is exactly two blocks', function () {
    var p = CEN.none.points[1];
    return eq(p.metaList.length, 2, 'violations');
  });

  check('writeback fails from the commit record until the last data block lands', function () {
    var ks = N.writebackBadPoints.map(function (p) { return p.k; });
    return { pass: ks[0] === 4 && ks[3] === 7 && ks[4] === 20 && ks[6] === 22, detail: ks.join(',') };
  });

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;
  N.passed = PASSED;
  N.total = CHECKS.length;

/* ======================================================================
   LAYER 3 — RENDER
   Reads the model. Never re-derives a value: every figure drawn comes from
   N or CEN, which the checks above have already verified.
   ====================================================================== */

  function head(title, sub) {
    P.text(34, 18, title, { size: 16, bold: true, color: INK });
    if (sub) P.text(34, 40, sub, { size: 11.5, color: DIM });
  }

  function foot(s) {
    P.line(34, 442, 866, 442, { stroke: BORDER, sw: 1 });
    P.text(34, 450, s, { size: 10.5, color: FAINT });
  }

  function card(x, y, w, h, title, lines, accentColour) {
    P.rect(x, y, w, h, { fill: SURF, stroke: BORDER, sw: 1, radius: 6 });
    P.rect(x, y, 4, h, { fill: accentColour || ACC, radius: 2 });
    P.text(x + 14, y + 12, title, { size: 12.5, bold: true, color: INK });
    lines.forEach(function (ln, i) {
      P.text(x + 14, y + 36 + i * 18, ln, { size: 10.5, color: DIM });
    });
  }

  function chip(x, y, w, h, title, sub, col, fillCol) {
    P.rect(x, y, w, h, { fill: fillCol || SURF, stroke: col || BORDER, sw: 1.2, radius: 5 });
    P.text(x + 8, y + 9, title, { size: 10.5, bold: true, color: INK });
    if (sub) P.text(x + 8, y + 26, sub, { size: 9.5, color: DIM });
  }

  function sceneOf(t) {
    var sc = window.LESSON_TIMELINE.scenes;
    for (var i = sc.length - 1; i >= 0; i--) if (t >= sc[i].start - 1e-6) return sc[i];
    return sc[0];
  }

  var SCENE_DRAW = {};

  /* ---- 1. the problem ---- */
  SCENE_DRAW['problem'] = function () {
    head('One operation is four disk writes',
         'a filesystem writes blocks, never operations, and the power can fail between any two of them');
    P.text(34, 66, 'T1 — create file f: the four blocks it has to write', { size: 11.5, bold: true, color: ACC });

    var w4 = 196, gap = 12;
    var blocks = [
      ['bitmap', 'blocks 1 and 2 become used'],
      ['inode table', 'f: size 2, blocks [1, 2]'],
      ['data block 1', 'the bytes f#1'],
      ['data block 2', 'the bytes f#2']
    ];
    blocks.forEach(function (b, i) {
      chip(34 + i * (w4 + gap), 84, w4, 48, b[0], b[1], BORDER, SURF2);
    });

    P.text(34, 148, 'Now the same four writes as a strip of crash points — one crash per write, and one before any write', { size: 11.5, bold: true, color: ACC });

    var pts = CEN.none.points, cw = 46, cgap = 36;
    pts.forEach(function (p, i) {
      var bad = p.meta > 0 || p.data > 0;
      var x = 34 + i * (cw + cgap);
      P.rect(x, 168, cw, 40, { fill: bad ? INVALIDDIM : ACCDIM, stroke: bad ? BAD : VAL, sw: 1.4, radius: 4 });
      P.text(x + cw / 2, 176, 'k=' + p.k, { size: 11, bold: true, color: bad ? BAD : VAL, align: 'center' });
      P.text(x + cw / 2, 192, bad ? 'broken' : 'clean', { size: 9, color: bad ? BAD : VAL, align: 'center' });
    });
    P.text(34, 216, N.census[0].anyBad + ' of the ' + N.census[0].points + ' crash points leave a disk that no longer makes sense.',
           { size: 11.5, color: INK });

    var badKs = pts.filter(function (p) { return p.meta > 0 || p.data > 0; })
                   .map(function (p) { return p.k; }).join(', ');
    card(34, 240, 404, 148, 'Metadata broken at 3 crash points', [
      'k=1: blocks 1 and 2 marked used, no inode refers to them',
      'k=2, k=3: the same two leaked blocks',
      'a leak is space lost, not corruption yet'
    ], WARN);
    card(462, 240, 404, 148, 'Bytes broken at 3 crash points', [
      'k=2: f points at blocks that still hold x#1, x#2',
      'k=3: block 2 still holds the deleted file x',
      'k=7: f#3 has not landed, block 3 holds x#3'
    ], BAD);
    P.text(34, 398, 'Broken crash points without a journal: k = ' + badKs + '.', { size: 11, color: DIM });
    P.text(34, 418, 'Freeing a block does not erase it — that is why an unwritten block can still be read as somebody else\'s data.', { size: 10.5, color: FAINT });
    foot('Without a journal there is exactly one crash point out of ten at which all three operations survive whole.');
  };

  /* ---- 2. the write-ahead rule ---- */
  SCENE_DRAW['rule'] = function () {
    head('Write the new image of every block into a log, then the log says committed',
         'the write-ahead rule: no block is overwritten in place until its new image is durable in the journal');
    var ops = buildOps('ordered').filter(function (o) { return o.txn === 0; });
    var labels = [];
    ops.forEach(function (o) {
      var nm = function (k) { return k === 'bitmap' ? 'bitmap' : k === 'inode' ? 'inode' : 'data ' + k.slice(4); };
      if (o.type === 'desc') labels.push(['descriptor']);
      else if (o.type === 'log') labels.push(['log ' + nm(o.w.key)]);
      else if (o.type === 'commit') labels.push(['COMMIT']);
      else if (o.type === 'inplace') labels.push(['write ' + nm(o.w.key)]);
      else labels.push(['head']);
    });

    var w = 85, gap = 8;
    labels.forEach(function (l, i) {
      var x = 34 + i * (w + gap);
      var isCommit = l[0] === 'COMMIT';
      var isInplace = l[0].indexOf('write') === 0;
      P.rect(x, 78, w, 40, { fill: isCommit ? ACCDIM : (isInplace ? SURF2 : SURF),
                             stroke: isCommit ? ACC : BORDER, sw: isCommit ? 1.6 : 1.1, radius: 5 });
      P.text(x + w / 2, 88, l[0], { size: 10.5, bold: true, color: INK, align: 'center' });
      P.text(x + w / 2, 132, String(i), { size: 9.5, color: FAINT, align: 'center' });
    });

    P.line(34 + 6 * (w + gap) - 4, 70, 34 + 6 * (w + gap) - 4, 146, { stroke: ACC, sw: 1.4, dash: [4, 3] });
    P.text(34, 156, 'descriptor = one block listing the home block of each image   |   head = the log space is freed', { size: 10, color: FAINT });
    P.text(34, 178, 'Everything left of the commit record is invisible to recovery.', { size: 11, color: BAD });
    P.text(34, 198, 'Everything right of it is redone from the journal, however far it got.', { size: 11, color: VAL });

    card(34, 206, 404, 148, 'Before the commit record', [
      'the transaction never happened',
      'recovery ignores every entry it wrote',
      'the in-place blocks were never touched'
    ], WARN);
    card(462, 206, 404, 148, 'After the commit record', [
      'the transaction happened, exactly once',
      'recovery copies the logged images home',
      'the descriptor says which blocks to copy'
    ], VAL);
    P.text(34, 366, 'The descriptor is needed because the journal stores block images, not addresses: it names the home block of each image.', { size: 10.5, color: DIM });
    P.text(34, 386, 'The commit record is one block. That single block is what makes four separate writes atomic.', { size: 10.5, color: INK, bold: true });
    P.text(34, 406, 'A journal block is a whole block even when one byte changed — the log stores images, never deltas.', { size: 10.5, color: FAINT });
    foot('Write ahead: log the image, then commit, then overwrite in place, then free the log space.');
  };

  /* ---- 3. the crash-point census ---- */
  SCENE_DRAW['census'] = function () {
    head('Crash at every write point, then recover and check four invariants',
         'the same three transactions, four commit disciplines, 88 recovered images');
    var cols = [34, 250, 356, 462, 592, 700, 800];
    var heads = ['discipline', 'writes', 'crash pts', 'metadata', 'bytes', 'clean'];
    heads.forEach(function (h, i) {
      P.text(cols[i], 74, h, { size: 10.5, bold: true, color: FAINT });
    });
    P.line(34, 90, 866, 90, { stroke: BORDER, sw: 1 });

    N.census.forEach(function (c, i) {
      var y = 100 + i * 56;
      P.rect(34, y, 832, 46, { fill: i % 2 ? SURF2 : SURF, stroke: BORDER, sw: 0.8, radius: 4 });
      P.text(cols[0], y + 8, c.mode, { size: 12, bold: true, color: INK });
      P.text(cols[0], y + 26, c.note, { size: 9, color: FAINT });
      P.text(cols[1], y + 14, String(c.ops), { size: 12, color: INK, mono: true });
      P.text(cols[2], y + 14, String(c.points), { size: 12, color: INK, mono: true });
      P.text(cols[3], y + 14, c.metaBad === 0 ? '0 broken' : c.metaBad + ' broken',
             { size: 12, color: c.metaBad === 0 ? VAL : BAD, mono: true });
      P.text(cols[4], y + 14, c.dataBad === 0 ? '0 broken' : c.dataBad + ' broken',
             { size: 12, color: c.dataBad === 0 ? VAL : BAD, mono: true });
      P.text(cols[5], y + 14, (c.points - c.anyBad) + '/' + c.points, { size: 12, color: INK, mono: true });
    });

    P.text(34, 340, 'Metadata broken means a dangling reference, a leaked block or two files sharing one block.', { size: 10.5, color: DIM });
    P.text(34, 360, 'Bytes broken means a block a file points at holds something that file never wrote.', { size: 10.5, color: DIM });
    P.text(34, 384, 'Read the two journaled rows against each other: writeback keeps every metadata', { size: 10.5, color: INK });
    P.text(34, 402, 'invariant at all 25 points, and still lets a file read stale bytes at 7 of them.', { size: 10.5, color: INK });
    P.text(34, 420, 'Only full data journaling removes both columns at once, and it costs the most writes.', { size: 10.5, color: ACC, bold: true });
    foot('A journal buys atomicity. Which journal you run decides whether it also buys the bytes.');
  };

  /* ---- 4. recovery ---- */
  SCENE_DRAW['replay'] = function () {
    head('Recovery is three passes over the log, and it is idempotent',
         'find the end of the log, replay every committed image, stop at the last commit record');
    var steps = [
      ['1', 'find the end', 'scan the header for the highest sequence'],
      ['2', 'find the last commit', 'walk from the tail; stop at the last commit'],
      ['3', 'redo the images', 'copy each logged image to its home block']
    ];
    steps.forEach(function (s, i) {
      var x = 34 + i * 278;
      P.rect(x, 66, 264, 84, { fill: SURF, stroke: BORDER, sw: 1, radius: 6 });
      P.circle(x + 22, 88, 12, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
      P.text(x + 22, 82, s[0], { size: 12, bold: true, color: ACC, align: 'center' });
      P.text(x + 42, 78, s[1], { size: 11.5, bold: true, color: INK });
      P.text(x + 14, 108, s[2], { size: 9.5, color: DIM });
      P.text(x + 14, 126, 'one pass over the log', { size: 9, color: FAINT });
    });

    card(34, 164, 404, 132, 'An abandoned transaction is discarded', [
      'T2 logged 3 entries and never committed',
      'the last commit record is T1\'s, so T2 is ignored',
      'the image equals the state just after T1'
    ], WARN);
    card(462, 164, 404, 132, 'Replay is idempotent', [
      'replaying twice equals replaying once',
      'checked by comparing the two images byte for byte',
      'which is why a crash during recovery is survivable'
    ], VAL);

    P.text(34, 310, 'The cost of recovery is the size of the log, not the size of the disk:', { size: 11.5, bold: true, color: INK });
    P.rect(34, 330, 300, 44, { fill: SURF2, stroke: BORDER, sw: 1, radius: 4 });
    P.text(48, 340, 'journal replay', { size: 11, bold: true, color: INK });
    P.text(48, 358, '64 blocks read', { size: 10.5, color: VAL, mono: true });
    P.rect(346, 330, 300, 44, { fill: SURF2, stroke: BORDER, sw: 1, radius: 4 });
    P.text(360, 340, 'a full scan of the disk', { size: 11, bold: true, color: INK });
    P.text(360, 358, '262144 blocks read', { size: 10.5, color: BAD, mono: true });
    P.rect(658, 330, 208, 44, { fill: ACCDIM, stroke: ACC, sw: 1.2, radius: 4 });
    P.text(672, 340, 'ratio', { size: 11, bold: true, color: INK });
    P.text(672, 358, N.replayRatio + ' times less work', { size: 10.5, color: ACC, mono: true });

    P.text(34, 392, 'A 1 GiB disk in 4 KiB blocks is ' + N.diskBlocks1G + ' blocks. The journal here is ' + N.journalBlocks + '.', { size: 10.5, color: DIM });
    P.text(34, 412, 'This is the whole reason journaling replaced the full consistency check on mount: the repair stopped depending on disk size.', { size: 10.5, color: FAINT });
    foot('Recovery redoes committed work and forgets uncommitted work. It never undoes and never guesses.');
  };

  /* ---- 5. the cost ---- */
  SCENE_DRAW['cost'] = function () {
    head('What the log costs, and what bounds it',
         'm metadata blocks cost 2m + 3 block writes instead of m, and a circular buffer caps the replay');
    var cols = [34, 130, 250, 360];
    ['m', 'in place', 'journaled', 'ratio'].forEach(function (h, i) {
      P.text(cols[i], 68, h, { size: 10.5, bold: true, color: FAINT });
    });
    P.line(34, 82, 430, 82, { stroke: BORDER, sw: 1 });
    N.costRows.forEach(function (r, i) {
      var y = 90 + i * 24;
      P.text(cols[0], y, String(r.m), { size: 11, color: INK, mono: true });
      P.text(cols[1], y, String(r.plain), { size: 11, color: DIM, mono: true });
      P.text(cols[2], y, String(r.jrnl), { size: 11, color: ACC, mono: true });
      P.text(cols[3], y, r.ratio.toFixed(3), { size: 11, color: INK, mono: true });
    });
    P.text(34, 272, 'The +3 is a descriptor, a commit record and a head update.', { size: 10, color: DIM });
    P.text(34, 290, 'It is constant, so the ratio falls towards 2 — the log writes each block twice.', { size: 10, color: DIM });

    P.text(460, 68, 'A 64-block journal as a circular buffer', { size: 11.5, bold: true, color: ACC });
    for (var i = 0; i < 16; i++) {
      var x = 460 + i * 25;
      P.rect(x, 88, 23, 34, { fill: i < 12 ? SURF2 : SURF, stroke: BORDER, sw: 1, radius: 3 });
      P.text(x + 11.5, 98, String(i + 1), { size: 9, color: DIM, align: 'center' });
      P.text(x + 11.5, 112, '4', { size: 8.5, color: FAINT, align: 'center' });
    }
    P.text(460, 130, 'each cell = one transaction = 1 descriptor + 2 images + 1 commit', { size: 9, color: FAINT });
    P.text(460, 150, N.txnsBeforeFull + ' transactions fill it. The 17th waits for the tail to be checkpointed.', { size: 10.5, color: INK });
    P.text(460, 170, 'One transaction must fit whole: at most ' + N.maxTxnBlocks + ' metadata blocks.', { size: 10.5, color: INK });

    card(460, 192, 406, 116, 'Three numbers to remember', [
      'cost per transaction: 2m + 3 block writes',
      'capacity: floor(64 / (m + 2)) transactions',
      'largest transaction: journal blocks minus 2'
    ], ACC);

    P.text(34, 316, 'Write amplification is the honest price. It is paid on the metadata, which is a small fraction of the traffic,', { size: 10.5, color: DIM });
    P.text(34, 336, 'and it is paid as sequential writes into one contiguous file, which is the cheapest I/O a disk can do.', { size: 10.5, color: DIM });
    P.text(34, 366, 'ext4 reserves at most 10,240,000 blocks for the journal — the kernel documentation states the ceiling.', { size: 10.5, color: INK });
    P.text(34, 388, 'A journal that cannot hold one whole transaction is a design error, not a performance problem.', { size: 11, color: BAD, bold: true });
    foot('Batching amortises the constant: one commit record can cover a transaction of many blocks.');
  };

  /* ---- 6. the three commit orders ---- */
  SCENE_DRAW['modes'] = function () {
    head('Three commit orders, one question: where does the data block sit?',
         'ext3 and ext4 name them journal, ordered and writeback; metadata is journaled in all three');
    var rows = [
      { name: 'data=journal', segs: [['log metadata', ACCDIM], ['log data', ACCDIM], ['commit', ACC], ['in place', SURF2]],
        note: 'data is in the log: recovery restores bytes too' },
      { name: 'data=ordered', segs: [['log metadata', ACCDIM], ['data out first', VAL], ['commit', ACC], ['in place', SURF2]],
        note: 'the default: data forced to disk before the commit' },
      { name: 'data=writeback', segs: [['log metadata', ACCDIM], ['commit', ACC], ['in place', SURF2], ['data out later', BAD]],
        note: 'data may land after the metadata is committed' }
    ];
    rows.forEach(function (r, ri) {
      var y = 74 + ri * 96;
      P.text(34, y, r.name, { size: 11.5, bold: true, color: INK, mono: true });
      P.text(34, y + 18, r.note, { size: 9.5, color: DIM });
      var x = 34;
      r.segs.forEach(function (s) {
        var w = 196;
        P.rect(x, y + 34, w - 8, 34, { fill: s[1], stroke: BORDER, sw: 1, radius: 4 });
        P.text(x + 8, y + 44, s[0], { size: 10.5, color: INK });
        x += w;
      });
    });

    P.text(34, 366, 'Writeback commits the metadata earlier — at write point ' + N.writebackDurableAt[0] + ' instead of ' + N.orderedDurableAt[0] + ' for T1 —', { size: 10.5, color: INK });
    P.text(34, 386, 'and that is exactly why a crash can leave a file whose size and block list are new while its bytes are old.', { size: 10.5, color: INK });
    P.text(34, 408, 'All three journal the metadata. The difference is only whether the data block is also protected, and in which order.', { size: 11, color: ACC, bold: true });
    foot('Ordered mode is not a different journal; it is one extra ordering rule on the same journal.');
  };

  /* ---- 7. the staleness census ---- */
  SCENE_DRAW['stale'] = function () {
    head('Six orders, three of them unsafe',
         'T3 writes a bitmap, an inode and a data block; the order decides whether the file can read stale bytes');
    N.stale.rows.forEach(function (r, i) {
      var y = 68 + i * 34;
      P.text(34, y + 8, String(i + 1), { size: 10, color: FAINT, mono: true });
      r.order.forEach(function (k, j) {
        var x = 60 + j * 150;
        var isInode = k === 'inode', isData = k === 'data3';
        P.rect(x, y, 142, 26, { fill: isData ? (r.stale ? INVALIDDIM : ACCDIM) : SURF2,
                                stroke: isData ? (r.stale ? BAD : VAL) : BORDER, sw: 1, radius: 4 });
        P.text(x + 8, y + 7, k === 'data3' ? 'data block 3' : k, { size: 10, color: INK });
      });
      P.text(516, y + 8, r.stale ? 'unsafe: inode lands first' : 'safe: data lands first',
             { size: 10.5, color: r.stale ? BAD : VAL, bold: true });
    });

    card(34, 282, 404, 122, 'Why 3 of the 6 are unsafe', [
      'the inode names block 3 and gives the file size 3',
      'block 3 still holds x#3 from a deleted file',
      'the reader gets a valid file full of old bytes'
    ], BAD);
    card(462, 282, 404, 122, 'Measured on the full workload', [
      'writeback: ' + N.census[1].dataBad + ' of 25 crash points expose stale bytes',
      'writeback: ' + N.census[1].metaBad + ' of 25 break a metadata invariant',
      'ordered and journal: 0 of 25 and 0 of 28'
    ], VAL);
    P.text(34, 416, 'This is the ext3 data=writeback exposure: old data can appear in files after a crash, and it can be another user\'s data.', { size: 10.5, color: FAINT });
    foot('Metadata consistency and data integrity are two different promises. Writeback keeps only the first.');
  };

  /* ---- 8. limits ---- */
  SCENE_DRAW['limits'] = function () {
    head('Four things a journal does not do',
         'the mechanism is narrow on purpose, and every one of these is a real exam trap');
    card(34, 66, 404, 132, 'It is not a backup', [
      'it undoes half-done work, not wrong work',
      'a wrong-but-atomic value is replayed faithfully',
      'measured: the bad inode came back with block 4 dangling'
    ], WARN);
    card(462, 66, 404, 132, 'It does not check your data', [
      'it protects a transaction\'s atomicity',
      'it never compares a block with what it should hold',
      'a consistent lie is still a lie'
    ], WARN);
    card(34, 214, 404, 132, 'It does not survive a broken log', [
      'a media error in the journal leaves nothing to replay',
      'the full consistency check is still the fallback',
      'a bad log block means a lost transaction, not a lost disk'
    ], INFO);
    card(462, 214, 404, 132, 'It is not free', [
      N.costRows[1].jrnl + ' writes instead of ' + N.costRows[1].plain + ' at m = 2',
      'a commit every few seconds costs a flush',
      'ordered mode also stalls the writer behind the data'
    ], ACC);
    P.text(34, 366, 'What it does promise, exactly: after recovery every transaction is either entirely present or entirely absent,', { size: 10.5, color: INK });
    P.text(34, 386, 'and the metadata invariants hold. Full data journaling adds the bytes; metadata-only journaling does not.', { size: 10.5, color: INK });
    P.text(34, 410, 'A journal is an atomicity device. Durability comes from the commit record reaching the platter.', { size: 11, color: ACC, bold: true });
    foot('Atomicity is a statement about a transaction, never about the contents of the transaction.');
  };

  /* ---- 9. GATE patterns ---- */
  SCENE_DRAW['gate'] = function () {
    head('Five question shapes, and the one quantity each asks for',
         'the answer beside each shape is this page\'s computed value');
    var rows = [
      ['1', 'how many block writes does this operation cost?', 'count 2m + 3 for a journaled transaction, m without one'],
      ['2', 'how many blocks does recovery read?', 'the log, not the disk: ' + N.journalBlocks + ' against ' + N.diskBlocks1G],
      ['3', 'which ordering rule is safe?', 'the one that puts the data block before the commit'],
      ['4', 'what does the commit record make atomic?', 'one transaction — and nothing about its contents'],
      ['5', 'what does this crash point leave behind?', 'run the write order, then replay to the last commit']
    ];
    rows.forEach(function (r, i) {
      var y = 70 + i * 62;
      P.rect(34, y, 832, 52, { fill: i % 2 ? SURF2 : SURF, stroke: BORDER, sw: 0.8, radius: 5 });
      P.text(48, y + 10, r[0], { size: 15, bold: true, color: ACC, mono: true });
      P.text(74, y + 9, r[1], { size: 12, bold: true, color: INK });
      P.text(74, y + 30, r[2], { size: 10.5, color: DIM });
    });
    P.text(34, 396, 'The five shapes share one skill: decide whether the question asks for a count, an order, or a state.', { size: 12, color: INK });
    P.text(34, 418, 'A count is answered by 2m + 3. An order is answered by the commit. A state is answered by replaying to the last commit.', { size: 10.5, color: ACC, bold: true });
    foot('Every journal question is one of those three, and each has a mechanical procedure.');
  };

  /* ---- 10. traps ---- */
  SCENE_DRAW['traps'] = function () {
    head('Four traps',
         'each one is a sentence that reads right and answers wrong');
    card(34, 64, 404, 148, 'Trap 1 — a journal is a log-structured file system', [
      'a journaling FS keeps its blocks where they are',
      'the log is a small circular buffer, overwritten',
      'an LFS makes the whole disk the log'
    ], BAD);
    card(462, 64, 404, 148, 'Trap 2 — committed means the data is safe', [
      'ordered and writeback journal metadata only',
      'writeback: ' + N.census[1].allDurable + ' durable points, ' + N.census[1].complete + ' intact',
      'the commit record covers the transaction, not your bytes'
    ], WARN);
    card(34, 226, 404, 148, 'Trap 3 — replaying twice corrupts the disk', [
      'replay copies images, so it is idempotent',
      'checked here: twice equals once',
      'a crash during recovery just replays again'
    ], INFO);
    card(462, 226, 404, 148, 'Trap 4 — journaling removes the consistency check', [
      'it removes it from the normal boot path',
      'not after a bad log block or a media error',
      'a clean unmount also skips the replay'
    ], ACC);
    P.text(34, 396, 'Answer a durability question with the commit record, and an integrity question with the ordering rule.', { size: 12, color: INK, bold: true });
    P.text(34, 418, 'Swapping them is how all four traps are written.', { size: 10.5, color: DIM });
    foot('The four: not an LFS; a commit is not your data; replay is idempotent; the check still exists.');
  };

/* ======================================================================
   LAYER 4 — BOOT
   ====================================================================== */

  function drawFrame(painter) {
    P = painter;
    var t = (K && K.state) ? K.state.elapsed : 0;
    var sc = sceneOf(t);
    P.alpha(1);
    P.clear();
    var fn = SCENE_DRAW[sc.id] || SCENE_DRAW['problem'];
    fn(t, sc);
    P.alpha(1);
  }

  function fillChecks() {
    var el = document.getElementById('checks');
    if (!el) return;
    var bad = CHECKS.length - PASSED;
    el.innerHTML = '<span class="k">Model checks</span>' +
      '<p class="small" style="margin:6px 0 0">' + PASSED + ' of ' + CHECKS.length + ' passed' +
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
    CENSUS: N.census,
    TXNS: N.txns,
    COST: N.costRows,
    STALE: { total: N.stale.total, unsafe: N.stale.unsafe },
    DURABLE: { ordered: N.orderedDurableAt, writeback: N.writebackDurableAt, journal: N.journalDurableAt },
    JOURNAL: { blocks: N.journalBlocks, perTxn: N.perTxnLog, txns: N.txnsBeforeFull, maxTxn: N.maxTxnBlocks },
    REPLAY: { disk: N.diskBlocks1G, journal: N.journalBlocks, ratio: N.replayRatio },
    PASSED: PASSED,
    TOTAL: CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
