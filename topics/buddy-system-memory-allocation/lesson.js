/* ==========================================================================
   buddy-system-memory-allocation — lesson.js
   Four layers, in order:
     1. THE MODEL   — the binary buddy allocator itself, as a tree of leaves
                      with a free list per order: alloc, release, split,
                      cascade merge, plus the invariants that make a state
                      legal (the blocks tile the pool, no two free buddies
                      survive, the free lists agree with the tree).
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
   ====================================================================== */

  var CHECKS = [];
  function check(name, fn) {
    var r;
    try { r = fn(); }
    catch (e) { r = { pass: false, detail: 'threw ' + e.message }; }
    CHECKS.push({ name: name, pass: !!r.pass, detail: r.detail || '' });
  }

  function pow2(k) { return Math.pow(2, k); }
  function orderOf(n) { var k = 0; while (pow2(k) < n) k++; return k; }
  function num(a, b) { return a - b; }

  /* ---------- 1.1 the allocator ----------
     The pool is 2^poolBits units. A block of order k is 2^k units long and is
     aligned to a multiple of 2^k, so the two halves of a parent of order k+1
     are the blocks at addresses a and a XOR 2^k. The state is a set of leaves:
     every leaf is either free or used, and the leaves tile the whole pool. */

  function makeBuddy(poolBits) {
    var pool = pow2(poolBits);
    var leaves = {};                       // addr -> {addr, order, state, req}
    var freeList = [];                     // freeList[k] = sorted addresses
    for (var k = 0; k <= poolBits; k++) freeList.push([]);
    var stats = { splits: 0, merges: 0, searches: 0, allocs: 0, frees: 0, fails: 0 };
    var log = [];                          // one entry per operation

    leaves[0] = { addr: 0, order: poolBits, state: 'free', req: 0 };
    freeList[poolBits].push(0);

    function snapshot() {
      var out = [];
      for (var a in leaves) {
        if (!Object.prototype.hasOwnProperty.call(leaves, a)) continue;
        var n = leaves[a];
        out.push({ addr: n.addr, order: n.order, size: pow2(n.order), state: n.state, req: n.req });
      }
      out.sort(function (x, y) { return x.addr - y.addr; });
      return out;
    }

    function freeTotal() {
      var s = 0, snap = snapshot();
      for (var i = 0; i < snap.length; i++) if (snap[i].state === 'free') s += snap[i].size;
      return s;
    }
    function usedTotal() { return pool - freeTotal(); }

    function alloc(n) {
      var rec = { op: 'alloc', req: n, ok: false };
      if (!(n > 0) || n > pool) {
        stats.fails++; rec.reason = 'out of range'; log.push(rec); return rec;
      }
      var k = orderOf(n);
      var j = k, consulted = 0;
      while (j <= poolBits) { consulted++; if (freeList[j].length) break; j++; }
      stats.searches += consulted;
      if (j > poolBits) {
        stats.fails++; rec.reason = 'no block'; rec.consulted = consulted;
        rec.freeTotal = freeTotal(); log.push(rec); return rec;
      }
      var addr = freeList[j][0];           // first fit by address
      freeList[j].splice(0, 1);
      var splits = 0;
      while (j > k) {
        j--;
        var half = pow2(j);
        var upper = addr + half;
        leaves[addr] = { addr: addr, order: j, state: 'free', req: 0 };
        leaves[upper] = { addr: upper, order: j, state: 'free', req: 0 };
        freeList[j].push(upper);
        freeList[j].sort(num);
        splits++; stats.splits++;
      }
      var leaf = leaves[addr];
      leaf.state = 'used'; leaf.req = n;
      stats.allocs++;
      rec.ok = true; rec.addr = addr; rec.order = k; rec.size = pow2(k);
      rec.waste = pow2(k) - n; rec.splits = splits; rec.consulted = consulted;
      rec.freeTotal = freeTotal();
      log.push(rec);
      return rec;
    }

    function release(addr) {
      var rec = { op: 'free', addr: addr, ok: false };
      var leaf = leaves[addr];
      if (!leaf || leaf.state !== 'used') { rec.reason = 'not allocated'; log.push(rec); return rec; }
      leaf.state = 'free'; leaf.req = 0;
      var k = leaf.order, a = addr, merges = 0, path = [];
      while (k < poolBits) {
        var b = a ^ pow2(k);
        var bi = freeList[k].indexOf(b);
        if (bi < 0) break;
        if (!leaves[b] || leaves[b].state !== 'free') break;
        freeList[k].splice(bi, 1);
        var parent = Math.min(a, b);
        delete leaves[a]; delete leaves[b];
        leaves[parent] = { addr: parent, order: k + 1, state: 'free', req: 0 };
        path.push({ from: a, buddy: b, to: parent, order: k + 1 });
        a = parent; k = k + 1; merges++; stats.merges++;
      }
      freeList[k].push(a); freeList[k].sort(num);
      stats.frees++;
      rec.ok = true; rec.merges = merges; rec.order = k; rec.addr = a;
      rec.size = pow2(k); rec.path = path; rec.freeTotal = freeTotal();
      log.push(rec);
      return rec;
    }

    /* ---------- 1.2 the invariants a legal state must satisfy ---------- */
    function tiles() {
      var snap = snapshot(), at = 0, ok = true;
      for (var i = 0; i < snap.length; i++) {
        if (snap[i].addr !== at) ok = false;
        at += snap[i].size;
      }
      return { pass: ok && at === pool, detail: 'ends at ' + at + ' of ' + pool };
    }

    function canonical() {
      var snap = snapshot(), bad = 0;
      for (var i = 0; i < snap.length; i++) {
        var b = snap[i];
        if (b.state !== 'free') continue;
        var mate = b.addr ^ b.size;
        for (var j = 0; j < snap.length; j++) {
          var c = snap[j];
          if (c.state === 'free' && c.addr === mate && c.size === b.size) bad++;
        }
      }
      return { pass: bad === 0, detail: bad + ' free buddy pairs' };
    }

    function listsMatchTree() {
      var snap = snapshot(), byOrder = {};
      for (var i = 0; i < snap.length; i++) {
        var b = snap[i];
        if (b.state !== 'free') continue;
        byOrder[b.order] = (byOrder[b.order] || 0) + 1;
      }
      var bad = 0;
      for (var k = 0; k <= poolBits; k++) {
        if ((byOrder[k] || 0) !== freeList[k].length) bad++;
        for (var j = 0; j < freeList[k].length; j++) {
          var a = freeList[k][j];
          if (!leaves[a] || leaves[a].state !== 'free' || leaves[a].order !== k) bad++;
        }
      }
      return { pass: bad === 0, detail: bad + ' mismatches' };
    }

    function freeCounts() {
      var out = [];
      for (var k = 0; k <= poolBits; k++) out.push({ order: k, count: freeList[k].length });
      return out;
    }

    return {
      poolBits: poolBits, pool: pool, alloc: alloc, release: release,
      snapshot: snapshot, freeTotal: freeTotal, usedTotal: usedTotal,
      tiles: tiles, canonical: canonical, listsMatchTree: listsMatchTree,
      freeCounts: freeCounts, stats: stats, log: log,
      buddyOf: function (addr, k) { return addr ^ pow2(k); }
    };
  }

  /* ---------- 1.3 the 13-in-128 trace ---------- */
  var A13 = (function () {
    var B = makeBuddy(7);                       // 128 units
    var r = B.alloc(13);
    var after = B.snapshot();
    return {
      pool: B.pool, poolBits: 7, req: 13, res: r, after: after,
      freeTotal: B.freeTotal(), usedTotal: B.usedTotal(),
      freeCounts: B.freeCounts(),
      needOrder: orderOf(13), availOrder: 7,
      tiles: B.tiles(), canonical: B.canonical(), lists: B.listsMatchTree()
    };
  })();

  /* ---------- 1.4 the exhaustive buddy identity ---------- */
  var XOR = (function () {
    var poolBits = 6, pool = pow2(poolBits);
    var blocks = 0, ok = 0, bitOk = 0, invOk = 0;
    for (var k = 0; k < poolBits; k++) {
      for (var a = 0; a < pool; a += pow2(k)) {
        blocks++;
        var b = a ^ pow2(k);
        var parent = Math.min(a, b);
        if (b >= 0 && b < pool && parent % pow2(k + 1) === 0) ok++;
        // the addresses agree above bit k and differ at bit k
        var diff = 0;
        for (var bit = 0; bit <= poolBits; bit++) {
          var ba = (a >> bit) & 1, bb = (b >> bit) & 1;
          if (ba !== bb) diff = diff | (1 << bit);
        }
        if (diff === pow2(k)) bitOk++;
        if ((b ^ pow2(k)) === a) invOk++;
      }
    }
    return { pool: pool, poolBits: poolBits, blocks: blocks, parent: ok, bits: bitOk, inverse: invOk,
             treeBlocks: pool * 2 - 1, rootHasBuddy: false };
  })();

  /* ---------- 1.5 the nine-request sequence in 1024 units ---------- */
  var SEQ = (function () {
    var B = makeBuddy(10);
    var reqs = [50, 150, 90, 130, 70, 80, 120, 180, 68];
    var rows = [], firstFail = -1, lastFail = -1, allocated = 0, invariantBad = 0;
    for (var i = 0; i < reqs.length; i++) {
      var r = B.alloc(reqs[i]);
      if (!r.ok) { if (firstFail < 0) firstFail = i; lastFail = i; }
      else allocated += r.size;
      if (B.freeTotal() + B.usedTotal() !== B.pool) invariantBad++;
      rows.push({
        req: reqs[i], ok: r.ok, size: r.size || orderOf(reqs[i]) * 0 + (r.size || 0),
        rounded: pow2(orderOf(reqs[i])), addr: r.ok ? r.addr : null,
        splits: r.splits || 0, waste: r.ok ? r.waste : 0,
        freeAfter: B.freeTotal(), usedAfter: B.usedTotal()
      });
    }
    var snap = B.snapshot();
    var freeBlocks = 0, largestFree = 0;
    for (var j = 0; j < snap.length; j++) {
      if (snap[j].state === 'free') { freeBlocks++; if (snap[j].size > largestFree) largestFree = snap[j].size; }
    }
    return {
      pool: B.pool, rows: rows, firstFail: firstFail, lastFail: lastFail,
      allocated: allocated, freeTotal: B.freeTotal(), largestFree: largestFree,
      freeBlocks: freeBlocks, splits: B.stats.splits, searches: B.stats.searches,
      snap: snap, invariantBad: invariantBad, succeeded: rows.filter(function (x) { return x.ok; }).length
    };
  })();

  /* ---------- 1.6 the merge cascade ---------- */
  var CASC = (function () {
    var B = makeBuddy(6);                       // 64 units
    var allocs = [], states = [], releases = [];
    for (var i = 0; i < 4; i++) allocs.push(B.alloc(8));
    states.push(B.snapshot());
    var order = [0, 8, 16, 24];
    for (var j = 0; j < order.length; j++) {
      releases.push(B.release(order[j]));
      states.push(B.snapshot());
    }
    var snapEnd = B.snapshot();
    return {
      pool: B.pool, allocs: allocs, releases: releases, states: states,
      splits: B.stats.splits, merges: B.stats.merges,
      totalMerges: releases.reduce(function (s, r) { return s + (r.merges || 0); }, 0),
      end: snapEnd, freeTotal: B.freeTotal(),
      endOrder: snapEnd.length === 1 ? snapEnd[0].order : -1,
      endAddr: snapEnd.length === 1 ? snapEnd[0].addr : -1
    };
  })();

  /* ---------- 1.7 internal fragmentation over every request 1..64 ---------- */
  var FRAG = (function () {
    var rows = [], worst = null, zeros = 0, overHalf = 0;
    for (var n = 1; n <= 64; n++) {
      var size = pow2(orderOf(n));
      var waste = size - n;
      var ratio = waste / size;
      if (waste === 0) zeros++;
      if (!(ratio < 0.5)) overHalf++;
      if (!worst || ratio > worst.ratio) worst = { n: n, size: size, waste: waste, ratio: ratio };
      rows.push({ n: n, size: size, waste: waste, ratio: ratio });
    }
    var avgRatio = rows.reduce(function (s, r) { return s + r.ratio; }, 0) / rows.length;
    var avgWaste = rows.reduce(function (s, r) { return s + r.waste; }, 0) / rows.length;
    var avgSize = rows.reduce(function (s, r) { return s + r.size; }, 0) / rows.length;
    return { rows: rows, worst: worst, zeros: zeros, overHalf: overHalf,
             avgRatio: avgRatio, avgWaste: avgWaste, avgSize: avgSize };
  })();

  /* ---------- 1.8 the external-fragmentation witness ---------- */
  var EXT = (function () {
    var B = makeBuddy(6);                       // 64 units
    var allocs = [];
    for (var i = 0; i < 4; i++) allocs.push(B.alloc(16));
    var r16 = B.release(16), r48 = B.release(48);
    var snap = B.snapshot(), freeBlocks = 0, largest = 0, freeTotal = B.freeTotal();
    for (var j = 0; j < snap.length; j++) {
      if (snap[j].state === 'free') { freeBlocks++; if (snap[j].size > largest) largest = snap[j].size; }
    }
    var attempt = B.alloc(32);
    var mate16 = B.buddyOf(16, 4), mate48 = B.buddyOf(48, 4);
    function stateAt(a) {
      for (var k = 0; k < snap.length; k++) if (snap[k].addr === a) return snap[k].state;
      return 'inside a bigger block';
    }
    return {
      pool: B.pool, allocs: allocs, r16: r16, r48: r48, snap: snap,
      freeTotal: freeTotal, freeBlocks: freeBlocks, largest: largest,
      attempt: attempt, mate16: mate16, mate48: mate48,
      state16: stateAt(mate16), state48: stateAt(mate48),
      merges: (r16.merges || 0) + (r48.merges || 0)
    };
  })();

  /* ---------- 1.9 a small state used by the address scene ---------- */
  var BITDEMO = (function () {
    var addr = 24, k = 3, size = pow2(k), buddy = addr ^ size;
    function bits(v, w) {
      var s = '';
      for (var i = w - 1; i >= 0; i--) s += ((v >> i) & 1);
      return s;
    }
    return { addr: addr, size: size, k: k, buddy: buddy,
             aBits: bits(addr, 6), sBits: bits(size, 6), bBits: bits(buddy, 6) };
  })();

/* ======================================================================
   LAYER 2 — THE CHECKS
   ====================================================================== */

  check('a 13-unit request needs order 4, a 16-unit block', function () {
    return { pass: A13.needOrder === 4 && A13.res.size === 16 };
  });
  check('13 in 128 costs exactly 3 splits', function () {
    return { pass: A13.res.splits === 3, detail: 'splits ' + A13.res.splits };
  });
  check('13 in 128 wastes exactly 3 units', function () {
    return { pass: A13.res.waste === 3, detail: 'waste ' + A13.res.waste };
  });
  check('the block is placed at address 0', function () {
    return { pass: A13.res.addr === 0 };
  });
  check('free plus used equals the 128-unit pool', function () {
    return { pass: A13.freeTotal + A13.usedTotal === 128, detail: A13.freeTotal + '+' + A13.usedTotal };
  });
  check('112 units are left free in three blocks', function () {
    var used = A13.freeCounts.filter(function (c) { return c.count > 0; });
    return { pass: A13.freeTotal === 112 && used.length === 3, detail: used.length + ' lists' };
  });
  check('the three free blocks are of orders 4, 5 and 6', function () {
    var orders = A13.freeCounts.filter(function (c) { return c.count > 0; }).map(function (c) { return c.order; });
    return { pass: orders.join(',') === '4,5,6', detail: orders.join(',') };
  });
  check('the state after the split tiles the pool', function () {
    return A13.tiles;
  });
  check('no two free buddies survive the split', function () {
    return A13.canonical;
  });
  check('the free lists agree with the tree', function () {
    return A13.lists;
  });
  check('every one of the 126 non-root blocks has a buddy inside the pool', function () {
    return { pass: XOR.blocks === 126 && XOR.parent === 126, detail: XOR.blocks + '/' + XOR.parent };
  });
  check('a block and its buddy differ in exactly the bit equal to the size', function () {
    return { pass: XOR.bits === 126, detail: XOR.bits + ' of ' + XOR.blocks };
  });
  check('XOR twice returns the address', function () {
    return { pass: XOR.inverse === 126, detail: XOR.inverse + ' of ' + XOR.blocks };
  });
  check('a 64-unit pool holds 127 blocks in its tree', function () {
    return { pass: XOR.treeBlocks === 127, detail: String(XOR.treeBlocks) };
  });
  check('the buddy of 24 with size 8 is 16', function () {
    return { pass: BITDEMO.buddy === 16, detail: String(BITDEMO.buddy) };
  });
  check('24 and 8 differ in exactly bit 3', function () {
    return { pass: BITDEMO.aBits === '011000' && BITDEMO.sBits === '001000' && BITDEMO.bBits === '010000' };
  });
  check('the first request to fail is the seventh, for 120 units', function () {
    return { pass: SEQ.firstFail === 6 && SEQ.rows[6].req === 120, detail: 'index ' + SEQ.firstFail };
  });
  check('the last request to fail is the ninth, a different index', function () {
    return { pass: SEQ.lastFail === 8 && SEQ.lastFail !== SEQ.firstFail };
  });
  check('six of the nine requests succeed', function () {
    return { pass: SEQ.succeeded === 6, detail: String(SEQ.succeeded) };
  });
  check('the six served requests allocate 960 of the 1024 units', function () {
    return { pass: SEQ.allocated === 960, detail: String(SEQ.allocated) };
  });
  check('the remaining 64 units sit in one block of order 6', function () {
    return { pass: SEQ.freeTotal === 64 && SEQ.largestFree === 64 && SEQ.freeBlocks === 1 };
  });
  check('the sequence costs 6 splits in total', function () {
    return { pass: SEQ.splits === 6, detail: String(SEQ.splits) };
  });
  check('free plus used equals the pool after every request', function () {
    return { pass: SEQ.invariantBad === 0, detail: SEQ.invariantBad + ' bad steps' };
  });
  check('four 8-unit requests cost 4 splits', function () {
    return { pass: CASC.splits === 4, detail: String(CASC.splits) };
  });
  check('the four releases merge 0, 1, 0 and 3 times', function () {
    var m = CASC.releases.map(function (r) { return r.merges; }).join(',');
    return { pass: m === '0,1,0,3', detail: m };
  });
  check('the cascade totals 4 merges against 4 splits', function () {
    return { pass: CASC.totalMerges === 4 && CASC.merges === 4 && CASC.splits === 4 };
  });
  check('after the cascade the pool is one free block at address 0', function () {
    return { pass: CASC.endOrder === 6 && CASC.endAddr === 0 && CASC.freeTotal === 64 };
  });
  check('the first release merges nothing because its buddy is in use', function () {
    return { pass: CASC.releases[0].merges === 0 };
  });
  check('the third release merges nothing for the same reason', function () {
    return { pass: CASC.releases[2].merges === 0 };
  });
  check('the worst internal fragmentation is 31 of 64 at a request of 33', function () {
    var w = FRAG.worst;
    return { pass: w.n === 33 && w.size === 64 && w.waste === 31, detail: w.n + '/' + w.size };
  });
  check('the worst ratio is 0.484375', function () {
    return { pass: Math.abs(FRAG.worst.ratio - 0.484375) < 1e-12, detail: String(FRAG.worst.ratio) };
  });
  check('no request wastes half its block or more', function () {
    return { pass: FRAG.overHalf === 0, detail: FRAG.overHalf + ' offenders' };
  });
  check('exactly 7 of the 64 requests waste nothing', function () {
    return { pass: FRAG.zeros === 7, detail: String(FRAG.zeros) };
  });
  check('uniform requests 1 to 64 waste 0.22265625 of what is allocated', function () {
    return { pass: Math.abs(FRAG.avgRatio - 0.22265625) < 1e-12, detail: String(FRAG.avgRatio) };
  });
  check('the external witness leaves 32 units free in two blocks of 16', function () {
    return { pass: EXT.freeTotal === 32 && EXT.freeBlocks === 2 && EXT.largest === 16,
             detail: EXT.freeTotal + '/' + EXT.largest };
  });
  check('a 32-unit request fails in that state', function () {
    return { pass: EXT.attempt.ok === false, detail: String(EXT.attempt.reason) };
  });
  check('the buddies of the two free blocks are the two allocated blocks', function () {
    return { pass: EXT.mate16 === 0 && EXT.mate48 === 32 && EXT.state16 === 'used' && EXT.state48 === 'used',
             detail: EXT.state16 + ',' + EXT.state48 };
  });
  check('neither release in the witness merges anything', function () {
    return { pass: EXT.merges === 0, detail: String(EXT.merges) };
  });
  check('an allocation is never smaller than the request and never twice it', function () {
    var bad = FRAG.rows.filter(function (r) { return r.size < r.n || r.size >= 2 * r.n; });
    return { pass: bad.length === 0, detail: bad.length + ' bad rows' };
  });
  check('a merge cascade never exceeds the pool order', function () {
    var maxMerges = CASC.releases.reduce(function (m, r) { return Math.max(m, r.merges); }, 0);
    return { pass: maxMerges <= 6, detail: String(maxMerges) };
  });

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

/* ======================================================================
   LAYER 3 — RENDER
   Everything below reads the model above.
   ====================================================================== */

  var TITLE_Y = 26, SUB_Y = 48;

  function head(txt, sub) {
    P.text(24, TITLE_Y, txt, { size: 16, bold: true, color: INK });
    if (sub) P.text(24, SUB_Y, sub, { size: 12, color: DIM });
  }

  function foot(txt, colour) {
    P.text(24, 436, txt, { size: 12, color: colour || DIM });
  }

  function beat(t, sc, off, dur) {
    return K.clamp01((t - sc.start - off) / Math.max(0.001, dur));
  }

  function sceneOf(t) {
    var sc = window.LESSON_TIMELINE.scenes;
    for (var i = 0; i < sc.length; i++) if (t >= sc.start && t < sc.end) return sc[i];
    return sc[sc.length - 1];
  }

  function panel(x, y, w, h, tone) {
    var fill = tone === 'bad' ? INVALIDDIM : tone === 'warn' ? WARNDIM : tone === 'acc' ? ACCDIM : SURF2;
    var stroke = tone === 'bad' ? BAD : tone === 'warn' ? WARN : tone === 'acc' ? ACC : BORDER;
    P.rect(x, y, w, h, { fill: fill, stroke: stroke, radius: 6 });
  }

  function cardTitle(x, y, txt, tone) {
    var col = tone === 'bad' ? BAD : tone === 'warn' ? WARN : tone === 'acc' ? ACC : INK;
    P.text(x, y, txt, { size: 11, bold: true, color: col });
  }

  function rule(x, y, w) {
    P.line(x, y, x + w, y, { stroke: BORDER, sw: 1 });
  }

  /* a memory strip: blocks tile the pool, so widths are proportional */
  function strip(x, y, w, h, pool, blocks, opts) {
    opts = opts || {};
    var scale = w / pool;
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      var bx = x + b.addr * scale, bw = Math.max(1, b.size * scale - 1);
      var tone = b.state === 'used' ? 'acc' : 'free';
      if (b.tone) tone = b.tone;
      var fill = tone === 'bad' ? INVALIDDIM : tone === 'warn' ? WARNDIM
               : tone === 'acc' ? ACCDIM : SURF;
      var stroke = tone === 'bad' ? BAD : tone === 'warn' ? WARN
                 : tone === 'acc' ? ACC : BORDER;
      P.rect(bx, y, bw, h, { fill: fill, stroke: stroke, radius: 3 });
      if (bw > 26) {
        var label = b.label !== undefined ? b.label : (b.state === 'used' ? 'used' : 'free');
        var ink = tone === 'bad' ? BAD : tone === 'warn' ? WARN : tone === 'acc' ? ACC : DIM;
        P.text(bx + bw / 2, y + h / 2, label, { size: 9, mono: true, color: ink, align: 'center', base: 'middle' });
      }
      if (opts.addrLabels !== false && bw > 26) {
        P.text(bx, y + h + 3, String(b.addr), { size: 8, mono: true, color: FAINT });
      }
    }
  }

  function ladder(x, y, w, h, rows) {
    for (var r = 0; r < rows.length; r++) {
      var n = rows[r].n, count = pow2(r), bw = w / count;
      for (var i = 0; i < count; i++) {
        var bx = x + i * bw;
        P.rect(bx, y + r * h, bw - 1, h - 6, {
          fill: r === 0 ? ACCDIM : SURF, stroke: r === 0 ? ACC : BORDER, radius: 2
        });
        if (bw > 34) {
          P.text(bx + bw / 2, y + r * h + (h - 6) / 2, String(n), {
            size: 9, mono: true, align: 'center', base: 'middle', color: r === 0 ? ACC : DIM
          });
        }
      }
    }
  }

  var SCENE_DRAW = {};

  /* ---------- scene 1: two questions ---------- */
  SCENE_DRAW['two-questions'] = function (t, sc) {
    head('Two questions and one trick', 'One contiguous run, and a partner found by arithmetic.');

    var a = K.ease(beat(t, sc, 0.3, 0.8));
    P.alpha(a);
    panel(24, 72, 424, 232, null);
    cardTitle(38, 82, 'What the allocator has to decide');
    P.text(38, 108, '1.  Is there one free run of at least n units?', { size: 10, color: INK });
    P.text(52, 124, 'Two runs of 6 and 7 are not 13 units.', { size: 10, color: DIM });
    P.text(38, 150, '2.  When a block comes back, which free', { size: 10, color: INK });
    P.text(52, 166, 'block may it join?', { size: 10, color: DIM });
    P.text(38, 196, 'First fit answers both by scanning a list', { size: 10, color: INK });
    P.text(38, 212, 'of holes. The buddy system answers both', { size: 10, color: INK });
    P.text(38, 228, 'by halving the pool in advance, so that', { size: 10, color: INK });
    P.text(38, 244, 'every block has exactly one partner.', { size: 10, color: INK });
    P.text(38, 276, 'Largest free block \u2260 total free memory', { size: 10, mono: true, color: ACC });
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.8));
    P.alpha(b);
    panel(470, 72, 406, 232, 'acc');
    cardTitle(484, 82, 'Halving the 64-unit pool', 'acc');
    P.text(484, 104, 'Each row is one order finer. A row is the', { size: 9, color: DIM });
    P.text(484, 118, 'previous row cut in half.', { size: 9, color: DIM });
    ladder(484, 132, 378, 40, [{ n: 64 }, { n: 32 }, { n: 16 }, { n: 8 }]);
    P.text(484, 296, 'orders 6, 5, 4 and 3 of the seven', { size: 9, mono: true, color: FAINT });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.8));
    P.alpha(c);
    panel(24, 318, 424, 88, null);
    cardTitle(38, 328, 'The tree in numbers');
    P.text(38, 352, '64 + 32 + 16 + 8 + 4 + 2 + 1 = 127 blocks', { size: 10, mono: true, color: INK });
    P.text(38, 372, '126 of them have a buddy; the root does not', { size: 10, color: DIM });
    P.text(38, 392, 'Leaves are single units: exactly 64 of them', { size: 10, color: DIM });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    panel(470, 318, 406, 88, null);
    cardTitle(484, 328, 'The one bit');
    P.text(484, 352, 'buddy = address XOR size', { size: 11, mono: true, color: ACC });
    P.text(484, 374, 'Aligned blocks differ in one bit only,', { size: 9, color: DIM });
    P.text(484, 388, 'so no list is searched to find a partner.', { size: 9, color: DIM });
    P.alpha(1);

    foot('One contiguous run, and a partner that arithmetic can name.');
  };

  /* ---------- scene 2: round and split ---------- */
  SCENE_DRAW['round-and-split'] = function (t, sc) {
    head('Round up, then split', 'A 13-unit request against a 128-unit pool.');

    var a = K.ease(beat(t, sc, 0.3, 0.8));
    P.alpha(a);
    panel(24, 72, 424, 62, 'warn');
    cardTitle(38, 82, 'Step 1: round the request up', 'warn');
    P.text(38, 106, '13 units \u2192 the next power of two \u2192 16 units', { size: 11, mono: true, color: INK });
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.8));
    P.alpha(b);
    panel(470, 72, 406, 62, null);
    cardTitle(484, 82, 'Step 2: split down from the pool order');
    P.text(484, 106, 'order 7 needed 4, so 7 \u2212 4 = 3 splits', { size: 10, mono: true, color: INK });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 7.5, 1.2));
    P.alpha(c);
    P.text(24, 152, 'The three splits, drawn as the pool is cut', { size: 10, bold: true, color: INK });
    var chain = [
      { label: '128', parts: [{ f: 1, t: 'free', l: '128 free' }] },
      { label: '64 + 64', parts: [{ f: 0.5, t: 'acc', l: 'use' }, { f: 0.5, t: 'free', l: '64 free' }] },
      { label: '32 + 32', parts: [{ f: 0.25, t: 'acc', l: 'use' }, { f: 0.25, t: 'free', l: '32' }, { f: 0.5, t: 'free', l: '64' }] },
      { label: '16 + 16', parts: [{ f: 0.125, t: 'acc', l: '16' }, { f: 0.125, t: 'free', l: '16' }, { f: 0.25, t: 'free', l: '32' }, { f: 0.5, t: 'free', l: '64' }] }
    ];
    for (var i = 0; i < chain.length; i++) {
      var cx = 24 + i * 214, cy = 172;
      P.rect(cx, cy, 190, 34, { fill: SURF, stroke: BORDER, radius: 3 });
      var at = cx;
      for (var j = 0; j < chain[i].parts.length; j++) {
        var pt = chain[i].parts[j], pw = 190 * pt.f;
        P.rect(at, cy, pw - 1, 34, {
          fill: pt.t === 'acc' ? ACCDIM : SURF2,
          stroke: pt.t === 'acc' ? ACC : BORDER, radius: 2
        });
        if (pw > 40) P.text(at + pw / 2, cy + 17, pt.l, { size: 8, mono: true, align: 'center', base: 'middle', color: pt.t === 'acc' ? ACC : DIM });
        at += pw;
      }
      P.text(cx + 95, cy + 42, chain[i].label, { size: 9, mono: true, align: 'center', color: FAINT });
      if (i < chain.length - 1) P.arrow(cx + 192, cy + 17, cx + 210, cy + 17, { stroke: FAINT, head: 7 });
    }
    P.alpha(1);

    var d = K.ease(beat(t, sc, 45, 0.8));
    P.alpha(d);
    P.text(24, 246, 'The state the request leaves behind', { size: 10, bold: true, color: INK });
    strip(24, 258, 852, 40, A13.pool, A13.after.map(function (b) {
      return { addr: b.addr, size: b.size, state: b.state,
               label: b.state === 'used' ? (b.req + ' used') : ('free ' + b.size) };
    }), {});
    P.alpha(1);

    var e = K.ease(beat(t, sc, 45, 0.8));
    P.alpha(e);
    panel(24, 330, 424, 76, 'acc');
    cardTitle(38, 340, 'The answer the exam wants', 'acc');
    P.text(38, 364, 'size 16 units \u00b7 splits 3 \u00b7 waste 3 units', { size: 10, mono: true, color: INK });
    P.text(38, 384, '16 \u2212 13 = 3 of internal fragmentation', { size: 10, color: DIM });
    P.alpha(1);

    var f = K.ease(beat(t, sc, 52.5, 0.8));
    P.alpha(f);
    panel(470, 330, 406, 76, null);
    cardTitle(484, 340, 'What is left free');
    P.text(484, 364, '16 at 16 \u00b7 32 at 32 \u00b7 64 at 64', { size: 10, mono: true, color: INK });
    P.text(484, 384, 'total 112 free + 16 used = 128', { size: 10, color: DIM });
    P.alpha(1);

    foot('Round up, count the halvings, subtract the orders.');
  };

  /* ---------- scene 3: the buddy is one bit away ---------- */
  SCENE_DRAW['xor-address'] = function (t, sc) {
    head('The buddy is one bit away', 'address XOR size, read in binary.');

    var a = K.ease(beat(t, sc, 0.3, 0.8));
    P.alpha(a);
    panel(24, 72, 424, 92, 'acc');
    cardTitle(38, 82, 'The rule', 'acc');
    P.text(38, 108, 'buddy(address, size) = address XOR size', { size: 11, mono: true, color: INK });
    P.text(38, 132, 'XOR keeps a 1 only where the bits differ.', { size: 10, color: DIM });
    P.text(38, 148, 'Blocks are aligned, so only one bit can differ.', { size: 10, color: DIM });
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.8));
    P.alpha(b);
    var rows = [
      { label: 'address 24', bits: BITDEMO.aBits, colour: INK, note: '' },
      { label: 'size 8', bits: BITDEMO.sBits, colour: WARN, note: 'bit 3' },
      { label: 'XOR = 16', bits: BITDEMO.bBits, colour: ACC, note: 'the buddy' }
    ];
    for (var i = 0; i < rows.length; i++) {
      var ry = 190 + i * 44;
      P.text(24, ry + 10, rows[i].label, { size: 10, mono: true, color: rows[i].colour });
      for (var bit = 0; bit < 6; bit++) {
        var bx = 190 + bit * 34;
        var on = rows[i].bits.charAt(bit) === '1';
        P.rect(bx, ry, 30, 30, {
          fill: on ? (i === 2 ? ACCDIM : SURF2) : SURF,
          stroke: BORDER, radius: 3
        });
        P.text(bx + 15, ry + 15, rows[i].bits.charAt(bit), {
          size: 12, mono: true, align: 'center', base: 'middle', color: on ? rows[i].colour : FAINT
        });
      }
      if (i === 1) P.text(190, ry - 12, 'flip exactly this bit', { size: 9, color: WARN });
      if (rows[i].note && i !== 1) P.text(410, ry + 10, rows[i].note, { size: 9, color: rows[i].colour });
    }
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.8));
    P.alpha(c);
    panel(470, 72, 406, 92, null);
    cardTitle(484, 82, 'Why one bit is enough');
    P.text(484, 106, 'A block of size 2^k starts at a multiple of 2^k,', { size: 9, color: DIM });
    P.text(484, 120, 'so bits below k are zero. Its parent is a', { size: 9, color: DIM });
    P.text(484, 134, 'multiple of 2^(k+1): the two halves agree above', { size: 9, color: DIM });
    P.text(484, 148, 'bit k and differ at bit k.', { size: 9, color: DIM });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    P.text(24, 330, 'Two blocks of size 8 inside their parent of size 16', { size: 10, bold: true, color: INK });
    strip(24, 344, 852, 34, 64, [
      { addr: 0, size: 16, state: 'used', label: '0' },
      { addr: 16, size: 8, state: 'used', label: '16' },
      { addr: 24, size: 8, state: 'free', label: '24' },
      { addr: 32, size: 32, state: 'free', label: '32 free' }
    ], {});
    P.alpha(1);

    var e = K.ease(beat(t, sc, 22.5, 1.4));
    P.alpha(e);
    P.text(24, 392, '126 of 126 non-root blocks pass \u00b7 XOR twice returns the address', { size: 10, mono: true, color: VAL });
    P.text(24, 410, 'so a release walks up at most log2(pool) levels', { size: 10, color: DIM });
    P.alpha(1);

    foot('One bit names the partner; the walk up the tree is the whole cost of freeing.');
  };

  /* ---------- scene 4: one free list per order ---------- */
  SCENE_DRAW['free-lists'] = function (t, sc) {
    head('One free list per order', 'Nine requests in 1024 units; six are served.');

    var a = K.ease(beat(t, sc, 0.3, 0.8));
    P.alpha(a);
    panel(24, 72, 300, 60, null);
    cardTitle(38, 82, 'The search');
    P.text(38, 104, 'Start at the needed order, go up one', { size: 9, color: DIM });
    P.text(38, 118, 'list at a time, take the first block.', { size: 9, color: DIM });
    P.alpha(1);

    var b = K.ease(beat(t, sc, 0.3, 0.8));
    P.alpha(b);
    panel(340, 72, 536, 60, null);
    cardTitle(354, 82, 'What this sequence shows');
    P.text(354, 104, 'sizes rounded to 64, 256, 128, 256, 128, 128, 128, 256, 128', { size: 9, mono: true, color: INK });
    P.text(354, 118, '6 splits \u00b7 960 units out \u00b7 64 free in one block', { size: 9, mono: true, color: ACC });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 7.5, 0.8));
    P.alpha(c);
    P.text(24, 150, 'Request by request', { size: 10, bold: true, color: INK });
    var hdr = [['#', 24], ['req', 60], ['block', 120], ['addr', 190], ['splits', 254], ['verdict', 316]];
    for (var h = 0; h < hdr.length; h++) P.text(hdr[h][1], 168, hdr[h][0], { size: 9, bold: true, color: FAINT });
    for (var i = 0; i < SEQ.rows.length; i++) {
      var r = SEQ.rows[i], ry = 186 + i * 20;
      if (i === SEQ.firstFail) {
        P.rect(18, ry - 4, 360, 19, { fill: INVALIDDIM, stroke: BAD, radius: 3 });
      }
      P.text(24, ry, String(i + 1), { size: 9, mono: true, color: FAINT });
      P.text(60, ry, String(r.req), { size: 9, mono: true, color: r.ok ? INK : BAD });
      P.text(120, ry, String(r.rounded), { size: 9, mono: true, color: r.ok ? INK : BAD });
      P.text(190, ry, r.ok ? String(r.addr) : '\u2014', { size: 9, mono: true, color: DIM });
      P.text(254, ry, r.ok ? String(r.splits) : '\u2014', { size: 9, mono: true, color: DIM });
      P.text(316, ry, r.ok ? 'served' : 'no block', { size: 9, mono: true, color: r.ok ? VAL : BAD });
    }
    P.alpha(1);

    var d = K.ease(beat(t, sc, 15, 0.8));
    P.alpha(d);
    P.text(400, 150, 'The state after the sixth request', { size: 10, bold: true, color: INK });
    strip(400, 168, 476, 34, SEQ.pool, SEQ.rows.filter(function (x) { return x.ok; }).map(function (x) {
      return { addr: x.addr, size: x.rounded, state: 'used', label: String(x.rounded) };
    }).concat([{ addr: 64, size: 64, state: 'free', label: '64 free' }]), { addrLabels: false });
    P.text(400, 214, 'six blocks of 64, 256, 128, 256, 128 and 128 units', { size: 9, mono: true, color: DIM });
    P.text(400, 230, 'plus one free block of 64 at address 64', { size: 9, mono: true, color: DIM });
    P.alpha(1);

    var e = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(e);
    panel(400, 252, 476, 92, 'bad');
    cardTitle(414, 262, 'The seventh request is refused', 'bad');
    P.text(414, 286, 'a 120-unit request needs a block of 128', { size: 10, mono: true, color: INK });
    P.text(414, 306, 'the largest free block is 64, so no split helps', { size: 10, color: DIM });
    P.text(414, 326, 'free total 64 \u00b7 largest free block 64 \u00b7 request 128', { size: 10, mono: true, color: BAD });
    P.alpha(1);

    var f = K.ease(beat(t, sc, 22.5, 1.4));
    P.alpha(f);
    panel(24, 340, 360, 66, null);
    cardTitle(38, 350, 'The last two requests');
    P.text(38, 374, '180 and 68 also fail, and a refused', { size: 9, color: DIM });
    P.text(38, 388, 'request changes nothing at all.', { size: 9, color: DIM });
    P.alpha(1);

    foot('A request needs one block of its own order; the free total is not the answer.');
  };

  /* ---------- scene 5: the merge cascade ---------- */
  SCENE_DRAW['merge-cascade'] = function (t, sc) {
    head('Freeing is a cascade', 'Four 8-unit blocks, four releases, four merges.');

    var idx = 0;
    if (t >= sc.start + 15) idx = 4;
    else if (t >= sc.start + 14.4) idx = 3;
    else if (t >= sc.start + 13.4) idx = 2;
    else if (t >= sc.start + 12.4) idx = 1;
    var state = CASC.states[idx];

    var a = K.ease(beat(t, sc, 0.3, 0.8));
    P.alpha(a);
    P.text(24, 72, 'The pool of 64 units, ' + (idx === 0 ? 'with four 8-unit blocks in use' : 'after release ' + idx), { size: 10, bold: true, color: INK });
    strip(24, 88, 852, 44, CASC.pool, state.map(function (b) {
      return { addr: b.addr, size: b.size, state: b.state,
               label: b.state === 'used' ? ('8 in use') : ('free ' + b.size) };
    }), {});
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.8));
    P.alpha(b);
    P.text(24, 160, 'The four requests', { size: 10, bold: true, color: INK });
    var cols = [['req', 24], ['address', 80], ['splits', 170], ['waste', 250]];
    for (var h = 0; h < cols.length; h++) P.text(cols[h][1], 180, cols[h][0], { size: 9, bold: true, color: FAINT });
    for (var i = 0; i < CASC.allocs.length; i++) {
      var r = CASC.allocs[i], ry = 198 + i * 20;
      P.text(24, ry, '8', { size: 9, mono: true, color: INK });
      P.text(80, ry, String(r.addr), { size: 9, mono: true, color: INK });
      P.text(170, ry, String(r.splits), { size: 9, mono: true, color: r.splits ? ACC : DIM });
      P.text(250, ry, '0', { size: 9, mono: true, color: DIM });
    }
    P.text(24, 288, 'total splits 4', { size: 10, mono: true, color: ACC });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 12.4, 0.8));
    P.alpha(c);
    P.text(400, 160, 'The four releases', { size: 10, bold: true, color: INK });
    var rc = [['free', 400], ['merges', 470], ['result', 560], ['what happened', 660]];
    for (var h2 = 0; h2 < rc.length; h2++) P.text(rc[h2][1], 180, rc[h2][0], { size: 9, bold: true, color: FAINT });
    var why = ['buddy 8 is in use', 'buddy 0 was free', 'buddy 24 is in use', 'cascade of three'];
    for (var j = 0; j < CASC.releases.length; j++) {
      var q = CASC.releases[j], ry2 = 198 + j * 20;
      var seen = (j === 0 && idx >= 1) || (j === 1 && idx >= 2) || (j === 2 && idx >= 3) || (j === 3 && idx >= 4);
      if (!seen) continue;
      P.text(400, ry2, String([0, 8, 16, 24][j]), { size: 9, mono: true, color: INK });
      P.text(470, ry2, String(q.merges), { size: 9, mono: true, color: q.merges ? ACC : DIM });
      P.text(560, ry2, q.addr + ' / ' + q.size, { size: 9, mono: true, color: INK });
      P.text(660, ry2, why[j], { size: 9, color: DIM });
    }
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    panel(24, 316, 424, 90, 'acc');
    cardTitle(38, 326, 'Four merges cancel four splits', 'acc');
    P.text(38, 350, 'splits 4 \u00b7 merges 0 + 1 + 0 + 3 = 4', { size: 10, mono: true, color: INK });
    P.text(38, 372, 'the pool is one free 64-unit block at 0', { size: 10, color: DIM });
    P.text(38, 390, 'free total 64 = the whole pool', { size: 10, color: DIM });
    P.alpha(1);

    var e = K.ease(beat(t, sc, 22.5, 1.4));
    P.alpha(e);
    panel(470, 316, 406, 90, 'warn');
    cardTitle(484, 326, 'The loop, not the test', 'warn');
    P.text(484, 350, 'after a merge, recompute the buddy at the', { size: 9, color: INK });
    P.text(484, 364, 'new order and test again; the cascade ends', { size: 9, color: INK });
    P.text(484, 378, 'when the buddy is in use or the pool order', { size: 9, color: INK });
    P.text(484, 392, 'is reached', { size: 9, color: INK });
    P.alpha(1);

    foot('A release merges while its buddy is free, and raises the order each time.');
  };

  /* ---------- scene 6: internal fragmentation ---------- */
  SCENE_DRAW['internal-waste'] = function (t, sc) {
    head('Internal fragmentation, bounded by half', 'Waste = block \u2212 request, for every request from 1 to 64.');

    var a = K.ease(beat(t, sc, 0.3, 0.8));
    P.alpha(a);
    P.text(24, 76, 'Waste as a fraction of the block, request 1 to 64', { size: 10, bold: true, color: INK });
    var baseY = 290, barW = 852 / 64, maxH = 190;
    P.line(24, baseY, 876, baseY, { stroke: BORDER, sw: 1 });
    P.line(24, baseY - maxH / 2, 876, baseY - maxH / 2, { stroke: BORDER, sw: 1, dash: [4, 4] });
    P.text(28, baseY - maxH / 2 - 14, '0.5 \u2014 the bound is never reached', { size: 8, color: FAINT });
    for (var i = 0; i < FRAG.rows.length; i++) {
      var r = FRAG.rows[i];
      var hgt = Math.max(1, r.ratio * (maxH / 0.5));
      var bx = 24 + i * barW;
      var isWorst = r.n === FRAG.worst.n;
      P.rect(bx + 1, baseY - hgt, barW - 2, hgt, {
        fill: isWorst ? INVALIDDIM : (r.waste === 0 ? ACCDIM : SURF2),
        stroke: isWorst ? BAD : (r.waste === 0 ? ACC : BORDER), radius: 1
      });
    }
    P.text(24, baseY + 6, '1', { size: 8, mono: true, color: FAINT });
    P.text(300, baseY + 6, '32', { size: 8, mono: true, color: FAINT });
    P.text(858, baseY + 6, '64', { size: 8, mono: true, color: FAINT });
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.8));
    P.alpha(b);
    var wx = 24 + (FRAG.worst.n - 1) * barW;
    P.line(wx + barW / 2, baseY - FRAG.worst.ratio * (maxH / 0.5), wx + barW / 2, baseY - maxH / 2 - 30, { stroke: BAD, sw: 1, dash: [3, 3] });
    P.text(wx + barW / 2 + 6, baseY - maxH / 2 - 44, '33 takes 64, wastes 31', { size: 9, mono: true, color: BAD });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.8));
    P.alpha(c);
    panel(24, 316, 268, 90, null);
    cardTitle(38, 326, 'Worst case');
    P.text(38, 350, '31 / 64 = 0.484375', { size: 11, mono: true, color: BAD });
    P.text(38, 372, 'just under half of the block,', { size: 9, color: DIM });
    P.text(38, 386, 'at a request of 33 units.', { size: 9, color: DIM });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    panel(312, 316, 268, 90, null);
    cardTitle(326, 326, 'Zero waste');
    P.text(326, 350, '7 of 64 requests', { size: 11, mono: true, color: ACC });
    P.text(326, 372, 'the powers of two from 1 to 64', { size: 9, color: DIM });
    P.text(326, 386, 'waste nothing at all.', { size: 9, color: DIM });
    P.alpha(1);

    var e = K.ease(beat(t, sc, 22.5, 1.4));
    P.alpha(e);
    panel(600, 316, 276, 90, 'warn');
    cardTitle(614, 326, 'Average and the published range', 'warn');
    P.text(614, 350, 'uniform 1..64: 0.22265625', { size: 10, mono: true, color: INK });
    P.text(614, 370, 'binary buddy, published: 25\u201333%', { size: 9, color: INK });
    P.text(614, 386, 'of allocated memory, other mixes', { size: 9, color: DIM });
    P.alpha(1);

    foot('Under half of the block, never half of the pool, and zero for powers of two.');
  };

  /* ---------- scene 7: external fragmentation ---------- */
  SCENE_DRAW['external-waste'] = function (t, sc) {
    head('External fragmentation still exists', '32 free units refuse a 32-unit request.');

    var a = K.ease(beat(t, sc, 0.3, 0.8));
    P.alpha(a);
    P.text(24, 72, 'Four 16-unit blocks in a 64-unit pool; the second and fourth are released', { size: 10, bold: true, color: INK });
    strip(24, 88, 852, 44, EXT.pool, [
      { addr: 0, size: 16, state: 'used', label: 'in use' },
      { addr: 16, size: 16, state: 'free', label: 'free' },
      { addr: 32, size: 16, state: 'used', label: 'in use' },
      { addr: 48, size: 16, state: 'free', label: 'free' }
    ], {});
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.8));
    P.alpha(b);
    P.text(24, 156, 'The two free blocks are not buddies', { size: 10, bold: true, color: INK });
    P.text(24, 178, 'buddy of 16 is 0', { size: 10, mono: true, color: DIM });
    P.text(150, 178, '\u2192 in use', { size: 10, mono: true, color: BAD });
    P.text(24, 198, 'buddy of 48 is 32', { size: 10, mono: true, color: DIM });
    P.text(150, 198, '\u2192 in use', { size: 10, mono: true, color: BAD });
    P.text(24, 222, 'so neither release merges, and the free list', { size: 10, color: DIM });
    P.text(24, 238, 'holds two separate 16-unit blocks.', { size: 10, color: DIM });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.8));
    P.alpha(c);
    panel(430, 152, 446, 96, 'bad');
    cardTitle(444, 162, 'A request for 32 units', 'bad');
    P.text(444, 186, 'free total 32 \u00b7 largest free block 16', { size: 10, mono: true, color: INK });
    P.text(444, 206, 'no block of order 5 exists, and none can be', { size: 9, color: DIM });
    P.text(444, 220, 'made from a block of 16 \u2192 the request fails', { size: 9, color: DIM });
    P.text(444, 238, 'verdict: ' + (EXT.attempt.ok ? 'served' : 'refused'), { size: 10, mono: true, color: BAD });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    panel(24, 264, 852, 70, 'warn');
    cardTitle(38, 274, 'This is external fragmentation, by definition', 'warn');
    P.text(38, 298, 'enough total free space, and no single run long enough to serve the request.', { size: 10, color: INK });
    P.text(38, 318, 'A general allocator could coalesce any two adjacent holes. A buddy allocator can only coalesce a hole with its own buddy.', { size: 9, color: DIM });
    P.alpha(1);

    var e = K.ease(beat(t, sc, 22.5, 1.4));
    P.alpha(e);
    panel(24, 346, 852, 60, null);
    cardTitle(38, 356, 'The price of the arithmetic');
    P.text(38, 380, 'The XOR rule is what makes freeing fast, and the alignment it depends on is exactly what forbids the join.', { size: 9, color: DIM });
    P.text(38, 396, 'Compaction would repair it and is not available: an allocated buddy block cannot be moved.', { size: 9, color: DIM });
    P.alpha(1);

    foot('Little external fragmentation is not none; the witness is four lines long.');
  };

  /* ---------- scene 8: buddy is not paging ---------- */
  SCENE_DRAW['not-paging'] = function (t, sc) {
    head('Buddy is not paging', 'Two axes decide every comparison: contiguity, and which fragmentation.');

    var a = K.ease(beat(t, sc, 0.3, 0.8));
    P.alpha(a);
    var colX = [24, 240, 470, 700];
    var heads = ['', 'buddy', 'fixed partitions', 'paging'];
    for (var h = 0; h < heads.length; h++) {
      P.text(colX[h], 76, heads[h], { size: 11, bold: true, color: h === 1 ? ACC : INK });
    }
    rule(24, 94, 852);
    var rows = [
      ['unit of allocation', 'power-of-two block', 'partition of fixed size', 'page of fixed size'],
      ['contiguous run?', 'yes, one run', 'yes, one partition', 'no, any free frames'],
      ['internal waste', 'yes, up to just under half', 'yes, the unused tail', 'yes, the last page'],
      ['external waste', 'yes, a witness exists', 'yes, the classic case', 'no, frames are equal']
    ];
    for (var i = 0; i < rows.length; i++) {
      var ry = 106 + i * 40;
      P.text(colX[0], ry, rows[i][0], { size: 9, bold: true, color: DIM });
      P.text(colX[1], ry, rows[i][1], { size: 9, color: INK });
      P.text(colX[2], ry, rows[i][2], { size: 9, color: INK });
      P.text(colX[3], ry, rows[i][3], { size: 9, color: INK });
      rule(24, ry + 26, 852);
    }
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.8));
    P.alpha(b);
    panel(24, 282, 424, 66, 'acc');
    cardTitle(38, 292, 'The row that decides a true-or-false', 'acc');
    P.text(38, 316, 'buddy: both fragmentations exist', { size: 10, mono: true, color: INK });
    P.text(38, 334, 'paging: external fragmentation is impossible', { size: 10, mono: true, color: INK });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.8));
    P.alpha(c);
    panel(470, 282, 406, 66, null);
    cardTitle(484, 292, 'The Fibonacci variant');
    P.text(484, 316, 'block sizes 1, 2, 3, 5, 8, 13, 21, 34', { size: 10, mono: true, color: INK });
    P.text(484, 334, 'lower waste, and no one-bit buddy rule', { size: 9, color: DIM });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    panel(24, 358, 852, 50, 'warn');
    cardTitle(38, 368, 'Why a kernel keeps it anyway', 'warn');
    P.text(38, 392, 'A slab allocator is layered on top and carves each power-of-two page into same-size objects, so the waste becomes one object per slab rather than half a page per allocation.', { size: 9, color: DIM });
    P.alpha(1);

    foot('One contiguous run or many frames: that single word separates the two schemes.');
  };

  /* ---------- scene 9: the five question shapes ---------- */
  SCENE_DRAW['gate-questions'] = function (t, sc) {
    head('The five question shapes', 'Name the quantity, then compute only that.');

    var a = K.ease(beat(t, sc, 0.3, 0.8));
    P.alpha(a);
    panel(24, 72, 268, 148, null);
    cardTitle(38, 82, '1. Which request fails');
    P.text(38, 106, 'simulate and stop at the', { size: 9, color: DIM });
    P.text(38, 120, 'first failure', { size: 9, color: DIM });
    P.text(38, 146, 'this page: the 7th,', { size: 10, mono: true, color: BAD });
    P.text(38, 162, 'for 120 units', { size: 10, mono: true, color: BAD });
    P.text(38, 186, 'free total is not asked', { size: 9, color: FAINT });
    P.text(38, 200, 'and is not the answer', { size: 9, color: FAINT });
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.8));
    P.alpha(b);
    panel(312, 72, 268, 148, 'acc');
    cardTitle(326, 82, '2. Size, splits, waste', 'acc');
    P.text(326, 106, 'round up, then subtract', { size: 9, color: DIM });
    P.text(326, 120, 'the orders', { size: 9, color: DIM });
    P.text(326, 146, '13 in 128: 16 units,', { size: 10, mono: true, color: ACC });
    P.text(326, 162, '3 splits, waste 3', { size: 10, mono: true, color: ACC });
    P.text(326, 186, '7 \u2212 4 = 3 splits', { size: 9, mono: true, color: FAINT });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.8));
    P.alpha(c);
    panel(600, 72, 276, 148, null);
    cardTitle(614, 82, '3. The free lists');
    P.text(614, 106, 'one list per order, and', { size: 9, color: DIM });
    P.text(614, 120, 'no two free buddies', { size: 9, color: DIM });
    P.text(614, 146, 'after 13 in 128:', { size: 9, color: DIM });
    P.text(614, 162, '16@16 \u00b7 32@32 \u00b7 64@64', { size: 10, mono: true, color: INK });
    P.text(614, 186, 'free 112 of 128', { size: 9, mono: true, color: FAINT });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    panel(24, 234, 424, 148, null);
    cardTitle(38, 244, '4. The buddy of a block');
    P.text(38, 268, 'buddy = address XOR size', { size: 11, mono: true, color: ACC });
    P.text(38, 292, 'size 8 at address 24 \u2192 16', { size: 10, mono: true, color: INK });
    P.text(38, 314, 'not 32: adding the size gives the', { size: 9, color: DIM });
    P.text(38, 328, 'next block, which is usually not', { size: 9, color: DIM });
    P.text(38, 342, 'its buddy.', { size: 9, color: DIM });
    P.text(38, 366, 'XOR twice returns the address', { size: 9, mono: true, color: FAINT });
    P.alpha(1);

    var e = K.ease(beat(t, sc, 22.5, 1.4));
    P.alpha(e);
    panel(470, 234, 406, 148, 'warn');
    cardTitle(484, 244, '5. The number of merges', 'warn');
    P.text(484, 268, 'cascade while the buddy is free,', { size: 9, color: DIM });
    P.text(484, 282, 'raising the order each time', { size: 9, color: DIM });
    P.text(484, 306, 'four releases here: 0, 1, 0, 3', { size: 10, mono: true, color: INK });
    P.text(484, 322, 'total 4, equal to the 4 splits', { size: 10, mono: true, color: INK });
    P.text(484, 348, 'the cascade never exceeds the', { size: 9, color: DIM });
    P.text(484, 362, 'pool order: at most log2(pool)', { size: 9, color: DIM });
    P.alpha(1);

    foot('One shape, one quantity, one arithmetic step.');
  };

  /* ---------- scene 10: four traps ---------- */
  SCENE_DRAW['traps'] = function (t, sc) {
    head('Four traps', 'The beliefs that cost marks on this topic.');

    var a = K.ease(beat(t, sc, 0.3, 0.8));
    P.alpha(a);
    panel(24, 72, 424, 158, 'bad');
    cardTitle(38, 82, 'Trap 1: a buddy is a neighbour', 'bad');
    P.text(38, 106, '16 and 48 sit in one free list and', { size: 10, color: INK });
    P.text(38, 122, 'are not buddies: 16 pairs with 0,', { size: 10, color: INK });
    P.text(38, 138, 'and 48 pairs with 32.', { size: 10, color: INK });
    P.text(38, 164, 'the buddy is fixed by the parent,', { size: 9, color: DIM });
    P.text(38, 178, 'not by adjacency in memory.', { size: 9, color: DIM });
    P.text(38, 204, 'adjacency is necessary, not sufficient', { size: 9, mono: true, color: BAD });
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.8));
    P.alpha(b);
    panel(470, 72, 406, 158, 'bad');
    cardTitle(484, 82, 'Trap 2: half of what?', 'bad');
    P.text(484, 106, 'half of the allocated block, never', { size: 10, color: INK });
    P.text(484, 122, 'half of the pool.', { size: 10, color: INK });
    P.text(484, 148, '33 in 64 wastes 31: 48.4 per cent', { size: 9, color: DIM });
    P.text(484, 162, 'of the block, and 0.75 per cent', { size: 9, color: DIM });
    P.text(484, 176, 'of a 4096-unit pool.', { size: 9, color: DIM });
    P.text(484, 204, 'name the denominator in the answer', { size: 9, mono: true, color: BAD });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.8));
    P.alpha(c);
    panel(24, 244, 424, 158, 'warn');
    cardTitle(38, 254, 'Trap 3: rounding down', 'warn');
    P.text(38, 278, 'a request for 13 units never', { size: 10, color: INK });
    P.text(38, 294, 'receives 8 units.', { size: 10, color: INK });
    P.text(38, 320, 'sizes are powers of two and the', { size: 9, color: DIM });
    P.text(38, 334, 'allocation must be at least the', { size: 9, color: DIM });
    P.text(38, 348, 'request, so the only rounding is up.', { size: 9, color: DIM });
    P.text(38, 374, 'rounding to 20 is wrong as well', { size: 9, mono: true, color: WARN });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    panel(470, 244, 406, 158, 'bad');
    cardTitle(484, 254, 'Trap 4: no external fragmentation', 'bad');
    P.text(484, 278, 'false, and the witness is short:', { size: 10, color: INK });
    P.text(484, 300, 'free total 32 units', { size: 10, mono: true, color: INK });
    P.text(484, 316, 'largest free block 16 units', { size: 10, mono: true, color: INK });
    P.text(484, 332, 'request 32 units \u2192 refused', { size: 10, mono: true, color: BAD });
    P.text(484, 358, 'less external fragmentation than', { size: 9, color: DIM });
    P.text(484, 372, 'first fit is a different sentence', { size: 9, color: DIM });
    P.text(484, 394, 'and a different claim', { size: 9, color: DIM });
    P.alpha(1);

    foot('Neighbour is not buddy, half is not the pool, round up, and external fragmentation is real.');
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
    var fn = SCENE_DRAW[sc.id] || SCENE_DRAW['two-questions'];
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
    A13: { res: A13.res, freeTotal: A13.freeTotal, usedTotal: A13.usedTotal, after: A13.after },
    XOR: XOR,
    BITDEMO: BITDEMO,
    SEQ: { rows: SEQ.rows, firstFail: SEQ.firstFail, lastFail: SEQ.lastFail, allocated: SEQ.allocated,
           freeTotal: SEQ.freeTotal, splits: SEQ.splits, succeeded: SEQ.succeeded },
    CASC: { allocs: CASC.allocs, releases: CASC.releases, splits: CASC.splits, merges: CASC.merges },
    FRAG: { worst: FRAG.worst, zeros: FRAG.zeros, avgRatio: FRAG.avgRatio },
    EXT: { freeTotal: EXT.freeTotal, largest: EXT.largest, attempt: EXT.attempt,
           mate16: EXT.mate16, mate48: EXT.mate48 },
    PASSED: PASSED,
    TOTAL: CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
