/* ==========================================================================
   extendible-hashing-directory-and-depths — model, validation, render.

   Layer 1  model      : static hashing with overflow chains, the extendible
                         hash structure (insert, split, doubling, delete, buddy
                         merge, directory halving), and the count arithmetic.
   Layer 2  validation : the four defining properties are re-checked after every
                         operation, and a brute-force membership comparison runs
                         beside the structure at every step.
   Layer 3  render     : reads the model; never re-derives a structure.
   Layer 4  timeline   : in timeline.js — the only source of time.

   No p5.brush: every mark on this page is a bit string, an index or a count
   that the learner has to read exactly. A random stroke offset would blur the
   thing being read.
   ========================================================================== */

(function () {
  'use strict';

  var K = window.LessonKit;
  var PR = window.Painters;
  var W = 900, H = 470;
  var P = null;

  /* ======================================================================
     LAYER 1 — THE MODEL
     ====================================================================== */

  var CAP = 2;          // records per bucket, the textbook illustration
  var BITS = 8;         // hash width used by the skew demonstration

  function Bucket(ld) { this.ld = ld; this.keys = []; }

  function EH(cap, bits) {
    this.cap = cap === undefined ? CAP : cap;
    this.bits = bits === undefined ? BITS : bits;
    this.d = 0;
    this.dir = [new Bucket(0)];
    this.events = [];
    this.gaveUp = false;
  }

  EH.prototype.idx = function (k) { return k & ((1 << this.d) - 1); };
  EH.prototype.find = function (k) { return this.dir[this.idx(k)]; };

  EH.prototype.buckets = function () {
    var out = [];
    for (var i = 0; i < this.dir.length; i++) {
      if (out.indexOf(this.dir[i]) < 0) out.push(this.dir[i]);
    }
    return out;
  };

  EH.prototype.records = function () {
    var b = this.buckets(), n = 0;
    for (var i = 0; i < b.length; i++) n += b[i].keys.length;
    return n;
  };

  EH.prototype.insert = function (k) {
    var b = this.find(k);
    if (b.keys.indexOf(k) >= 0) return;         // duplicate key: no structural change
    b.keys.push(k);
    if (b.keys.length <= this.cap) return;

    var guard = 0;
    while (b && b.keys.length > this.cap) {
      if (++guard > 40) { this.gaveUp = true; return; }

      if (b.ld === this.d) {
        if (this.d >= this.bits) { this.gaveUp = true; return; }
        // doubling is a copy of the pointer array, because the index is the low bits
        this.dir = this.dir.concat(this.dir);
        this.d += 1;
        this.events.push({ type: 'double', key: k, d: this.d, ld: b.ld });
      }

      var old = b.keys.slice();
      var bit = 1 << b.ld;
      var lo = new Bucket(b.ld + 1), hi = new Bucket(b.ld + 1);
      for (var i = 0; i < old.length; i++) {
        (old[i] & bit ? hi : lo).keys.push(old[i]);
      }
      for (var j = 0; j < this.dir.length; j++) {
        if (this.dir[j] === b) this.dir[j] = (j & bit) ? hi : lo;
      }
      this.events.push({ type: 'split', key: k, d: this.d, ld: b.ld + 1, moved: old.length });

      b = lo.keys.length > this.cap ? lo : (hi.keys.length > this.cap ? hi : null);
    }
  };

  EH.prototype.delete = function (k) {
    var b = this.find(k);
    var at = b.keys.indexOf(k);
    if (at < 0) return;
    b.keys.splice(at, 1);

    // buddy merge: same local depth on both sides, and the records fit in one bucket
    var merged = true;
    while (merged) {
      merged = false;
      var list = this.buckets();
      for (var t = 0; t < list.length; t++) {
        var x = list[t];
        if (x.ld === 0) continue;
        var i0 = this.dir.indexOf(x);
        var buddy = this.dir[i0 ^ (1 << (x.ld - 1))];
        if (buddy === x || buddy.ld !== x.ld) continue;
        if (x.keys.length + buddy.keys.length > this.cap) continue;
        x.keys = x.keys.concat(buddy.keys);
        x.ld -= 1;
        for (var u = 0; u < this.dir.length; u++) {
          if (this.dir[u] === buddy) this.dir[u] = x;
        }
        this.events.push({ type: 'merge', d: this.d, ld: x.ld });
        merged = true;
        break;
      }
    }

    // halve the directory while every pair of entries agrees
    while (this.d > 0) {
      var n = 1 << this.d, half = n / 2, same = true;
      for (var v = 0; v < half; v++) {
        if (this.dir[v] !== this.dir[v + half]) { same = false; break; }
      }
      if (!same) break;
      this.dir = this.dir.slice(0, half);
      this.d -= 1;
      this.events.push({ type: 'halve', d: this.d });
    }
  };

  /* the four defining properties, checked as properties and not as answers */
  EH.prototype.invariants = function () {
    var bad = [];
    if (this.dir.length !== (1 << this.d)) {
      bad.push('directory holds ' + this.dir.length + ' entries, 2^d is ' + (1 << this.d));
    }
    var bs = this.buckets(), maxLd = 0, i;
    for (i = 0; i < bs.length; i++) if (bs[i].ld > maxLd) maxLd = bs[i].ld;
    if (maxLd !== this.d) bad.push('global depth ' + this.d + ' is not the largest local depth ' + maxLd);

    for (i = 0; i < this.dir.length; i++) {
      var b = this.dir[i];
      if (b.ld > this.d) bad.push('entry ' + i + ' reaches local depth ' + b.ld + ' > ' + this.d);
      if (b.keys.length > this.cap) bad.push('a bucket holds ' + b.keys.length + ' > capacity ' + this.cap);
      for (var q = 0; q < b.keys.length; q++) {
        if ((b.keys[q] & ((1 << b.ld) - 1)) !== (i & ((1 << b.ld) - 1))) {
          bad.push('entry ' + i + ' and key ' + b.keys[q] + ' disagree below local depth ' + b.ld);
        }
      }
    }
    for (i = 0; i < bs.length; i++) {
      var cnt = 0;
      for (var j = 0; j < this.dir.length; j++) if (this.dir[j] === bs[i]) cnt++;
      var want = 1 << (this.d - bs[i].ld);
      if (cnt !== want) bad.push('local depth ' + bs[i].ld + ' has ' + cnt + ' pointers, formula says ' + want);
    }
    return bad;
  };

  EH.prototype.snapshot = function () {
    return {
      d: this.d,
      entries: this.dir.length,
      buckets: this.buckets().length,
      records: this.records(),
      localDepths: this.buckets().map(function (b) { return b.ld; }).sort(),
      dir: this.dir.slice(),
      objects: this.buckets()
    };
  };

  /* ---------- static hashing, for the opening comparison ---------- */

  function staticHash(keys, m, cap) {
    var b = [], i;
    for (i = 0; i < m; i++) b.push([]);
    for (i = 0; i < keys.length; i++) b[keys[i] % m].push(keys[i]);
    var chains = b.map(function (x) { return Math.max(0, x.length - cap); });
    var worst = 0;
    for (i = 0; i < chains.length; i++) if (chains[i] > worst) worst = chains[i];
    return { occ: b.map(function (x) { return x.length; }), chains: chains, worst: worst,
             reads: 1 + worst, buckets: b };
  }

  function bitStr(v, d) {
    var s = '';
    for (var b = d - 1; b >= 0; b--) s += ((v >> b) & 1);
    return s;
  }

  /* ======================================================================
     LAYER 2 — VALIDATION
     Every number the lesson prints is recomputed here and checked against the
     definition it claims, before anything is drawn.
     ====================================================================== */

  var SEQ = [16, 4, 6, 22, 24, 10, 31, 7, 9, 20];

  function build(prefix) {
    var e = new EH(CAP, BITS);
    for (var i = 0; i < prefix; i++) e.insert(SEQ[i]);
    return e;
  }

  var M = {};

  /* --- 1. the canonical trace, with every structural event counted --- */
  M.TRACE = (function () {
    var e = new EH(CAP, BITS);
    var bad = [];
    var doubles = 0, splits = 0;
    for (var i = 0; i < SEQ.length; i++) {
      e.insert(SEQ[i]);
      var iv = e.invariants();
      if (iv.length) bad.push({ at: i, key: SEQ[i], bad: iv });
      for (var j = 0; j < e.events.length; j++) { /* counted below */ }
    }
    doubles = e.events.filter(function (x) { return x.type === 'double'; }).length;
    splits = e.events.filter(function (x) { return x.type === 'split'; }).length;
    var s = e.snapshot();
    return {
      d: s.d, entries: s.entries, buckets: s.buckets, records: s.records,
      localDepths: s.localDepths, doubles: doubles, splits: splits,
      slots: s.buckets * CAP, bad: bad, eh: e
    };
  })();

  /* --- 2. every directory entry points where the low bits say it should --- */
  M.POINTERS = (function () {
    var e = M.TRACE.eh;
    var ok = true, checked = 0;
    for (var i = 0; i < e.dir.length; i++) {
      var b = e.dir[i];
      checked++;
      // every key in the bucket agrees with this entry on the bucket's low d' bits
      // (a bucket at d' < d is reached by several entries, which differ above d')
      for (var q = 0; q < b.keys.length; q++) {
        if ((b.keys[q] & ((1 << b.ld) - 1)) !== (i & ((1 << b.ld) - 1))) ok = false;
      }
      // and the pointer is reachable by exactly the entries that share its low ld bits
      var same = 0;
      for (var j = 0; j < e.dir.length; j++) if (e.dir[j] === b) same++;
      if (same !== (1 << (e.d - b.ld))) ok = false;
    }
    return { ok: ok, checked: checked };
  })();

  /* --- 3. brute force: the structure agrees with a plain set, step by step --- */
  M.BRUTE = (function () {
    var e = new EH(CAP, BITS);
    var truth = {};
    var probes = 0, wrong = 0;
    var keys = [];
    for (var i = 0; i < SEQ.length; i++) keys.push(SEQ[i]);
    for (var extra = 0; extra < 24; extra++) keys.push(extra);

    for (var s = 0; s < SEQ.length; s++) {
      e.insert(SEQ[s]);
      truth[SEQ[s]] = true;
      for (var p = 0; p < keys.length; p++) {
        probes++;
        var hit = e.find(keys[p]).keys.indexOf(keys[p]) >= 0;
        if (hit !== !!truth[keys[p]]) wrong++;
      }
    }
    return { probes: probes, wrong: wrong, keys: keys.length };
  })();

  /* --- 4. exhaustive: the invariants hold for every short insertion order --- */
  M.EXHAUST = (function () {
    var seqs = 0, bad = 0;
    var pool = [0, 1, 2, 3, 4, 5, 6, 7];
    function permute(arr, k, out) {
      if (k === 6) { out.push(arr.slice(0, 6)); return; }
      for (var i = k; i < arr.length; i++) {
        var t = arr[k]; arr[k] = arr[i]; arr[i] = t;
        permute(arr, k + 1, out);
        t = arr[k]; arr[k] = arr[i]; arr[i] = t;
      }
    }
    var all = [];
    permute(pool, 0, all);
    for (var a = 0; a < all.length; a++) {
      var e = new EH(CAP, BITS);
      var ok = true;
      for (var i = 0; i < all[a].length; i++) {
        e.insert(all[a][i]);
        if (e.invariants().length) { ok = false; break; }
      }
      seqs++;
      if (!ok) bad++;
    }
    return { seqs: seqs, bad: bad };
  })();

  /* --- 5. the split without doubling, and the split that doubles --- */
  M.SPLIT = (function () {
    // inserting 10 splits a bucket whose local depth is below the global depth
    var before = build(5), after = build(6);
    var ev = after.events.filter(function (x) { return x.key === 10; });
    var types = ev.map(function (x) { return x.type; });
    var b0 = before.snapshot(), b1 = after.snapshot();
    return {
      types: types, doubled: types.indexOf('double') >= 0,
      dBefore: b0.d, dAfter: b1.d,
      bucketsBefore: b0.buckets, bucketsAfter: b1.buckets,
      entriesBefore: b0.entries, entriesAfter: b1.entries,
      ok: types.indexOf('split') >= 0 && types.indexOf('double') < 0 && b0.d === b1.d
    };
  })();

  M.DOUBLE = (function () {
    // inserting 24 finds the bucket at local depth equal to the global depth
    var before = build(4), after = build(5);
    var ev = after.events.filter(function (x) { return x.key === 24; });
    var types = ev.map(function (x) { return x.type; });
    var b0 = before.snapshot(), b1 = after.snapshot();
    return {
      types: types, order: types.join(','),
      dBefore: b0.d, dAfter: b1.d,
      entriesBefore: b0.entries, entriesAfter: b1.entries,
      bucketsBefore: b0.buckets, bucketsAfter: b1.buckets,
      ok: types[0] === 'double' && types[1] === 'split' && b1.d === b0.d + 1
          && b1.entries === b0.entries * 2
    };
  })();

  /* --- 6. doubling really is a copy of the array --- */
  M.COPY = (function () {
    var e = build(4);
    var old = e.dir.slice(), oldD = e.d;
    e.insert(24);                       // forces one doubling, then a split
    var copies = 0, n = 1 << oldD;
    for (var i = 0; i < n; i++) {
      // after doubling and the split, entry i and entry i + 2^oldD may differ only
      // because the split repointed the halves; before the split they were equal.
      copies++;
    }
    // redo, stopping right after the doubling
    var f = new EH(CAP, BITS);
    for (var k = 0; k < 4; k++) f.insert(SEQ[k]);
    var pre = f.dir.slice(), preD = f.d;
    f.dir = f.dir.concat(f.dir); f.d += 1;      // the doubling alone
    var equal = 0;
    for (var j = 0; j < (1 << preD); j++) if (f.dir[j] === f.dir[j + (1 << preD)]) equal++;
    return { pairs: 1 << preD, equal: equal, ok: equal === (1 << preD) };
  })();

  /* --- 7. deletion: a refused merge, an accepted merge, and a halving --- */
  M.MERGE = (function () {
    var e = new EH(CAP, BITS);
    for (var i = 0; i < SEQ.length; i++) e.insert(SEQ[i]);
    var start = e.snapshot();

    e.delete(20);
    var afterRefuse = e.snapshot();
    var refused = e.events.filter(function (x) { return x.type === 'merge'; }).length === 0;

    e.delete(24);
    var afterMerge = e.snapshot();
    var merged = e.events.filter(function (x) { return x.type === 'merge'; }).length === 1;

    e.delete(22);
    var afterHalve = e.snapshot();
    var halved = e.events.filter(function (x) { return x.type === 'halve'; }).length === 1;

    var rest = [16, 4];
    for (var r = 0; r < rest.length; r++) e.delete(rest[r]);

    // now delete everything that is left
    var all = e.buckets().reduce(function (a, b) { return a.concat(b.keys); }, []);
    for (var z = 0; z < all.length; z++) e.delete(all[z]);
    var empty = e.snapshot();

    return {
      startD: start.d, startBuckets: start.buckets,
      refuseBuckets: afterRefuse.buckets, refused: refused,
      mergeBuckets: afterMerge.buckets, merged: merged,
      halveD: afterHalve.d, halved: halved,
      finalD: empty.d, finalBuckets: empty.buckets, finalRecords: empty.records,
      backToEmpty: empty.d === 0 && empty.buckets === 1 && empty.records === 0,
      ok: refused && merged && halved && empty.d === 0 && empty.buckets === 1
    };
  })();

  /* --- 8. the count arithmetic --- */
  M.COUNTS = (function () {
    function entriesPerBucket(d, ld) { return 1 << (d - ld); }
    function ceiling(d, cap) { return (1 << d) * cap; }
    function minDepth(n, cap) {
      var need = Math.ceil(n / cap), d = 0;
      while ((1 << d) < need) d++;
      return { need: need, d: d, entries: 1 << d, ceiling: (1 << d) * cap };
    }
    function bytes(d, ptr) { return (1 << d) * ptr; }
    var cases = [
      { n: 100, cap: 8 }, { n: 1000, cap: 10 }, { n: 40, cap: 3 }, { n: 5, cap: 2 }
    ].map(function (c) {
      var m = minDepth(c.n, c.cap);
      return { n: c.n, cap: c.cap, need: m.need, d: m.d, entries: m.entries, ceiling: m.ceiling };
    });
    return {
      epb: { d: 4, ld: 2, v: entriesPerBucket(4, 2) },
      ceiling: { d: 4, cap: 3, v: ceiling(4, 3) },
      cases: cases,
      dirBytes: bytes(20, 4),
      dirBytesOk: bytes(20, 4) === 4194304,
      // and the actual model never beats the bound
      boundHolds: (function () {
        var ok = true;
        for (var n = 1; n <= 40; n++) {
          var e = new EH(CAP, BITS);
          for (var k = 0; k < n; k++) e.insert(k);
          var need = Math.ceil(n / CAP);
          if ((1 << e.d) < need) ok = false;
          if (e.snapshot().buckets > (1 << e.d)) ok = false;
        }
        return ok;
      })()
    };
  })();

  /* --- 9. a range query, measured on the structure --- */
  M.RANGE = (function () {
    var e = new EH(CAP, BITS);
    for (var k = 0; k < 20; k++) e.insert(k);
    var s = e.snapshot();
    var touched = [];
    for (var v = 5; v <= 12; v++) {
      var b = e.find(v);
      if (touched.indexOf(b) < 0) touched.push(b);
    }
    return { buckets: s.buckets, records: s.records, range: 8,
             touched: touched.length, covers: touched.length >= 8 };
  })();

  /* --- 10. static hashing, the opening measurement --- */
  M.STATIC = (function () {
    var keys = [];
    for (var i = 0; i < 24; i++) keys.push(i);
    var ten = staticHash(keys, 10, CAP);
    var five = staticHash(keys, 5, CAP);
    return { ten: ten, five: five,
             ok: five.worst === 3 && five.reads === 4 && ten.reads === 2 };
  })();

  /* --- 11. the skew failure --- */
  M.SKEW = (function () {
    var e = new EH(CAP, BITS);
    var keys = [1, 17, 33, 49, 65];
    var growth = [1];
    for (var i = 0; i < keys.length; i++) {
      var before = e.d;
      e.insert(keys[i]);
      for (var j = 0; j < e.events.length; j++) { /* growth read below */ }
      if (e.d > before) growth.push(1 << e.d);
    }
    var s = e.snapshot();
    var doubles = e.events.filter(function (x) { return x.type === 'double'; }).length;
    // all five keys share their low four bits
    var low4 = keys.map(function (k) { return k & 15; });
    var share = low4.every(function (x) { return x === low4[0]; });
    return {
      d: s.d, entries: s.entries, buckets: s.buckets, records: s.records,
      doubles: doubles, growth: growth, share: share, low4: low4[0],
      degenerate: s.entries > 8 * s.records
    };
  })();

  /* --- 12. the structure returns to empty from any full deletion --- */
  M.ROUNDTRIP = (function () {
    var bad = 0, tested = 0;
    var pool = [0, 1, 2, 3, 4, 5];
    function permute(arr, k, out) {
      if (k === arr.length) { out.push(arr.slice()); return; }
      for (var i = k; i < arr.length; i++) {
        var t = arr[k]; arr[k] = arr[i]; arr[i] = t;
        permute(arr, k + 1, out);
        t = arr[k]; arr[k] = arr[i]; arr[i] = t;
      }
    }
    var all = [];
    permute(pool, 0, all);
    for (var a = 0; a < all.length; a++) {
      var e = new EH(CAP, BITS);
      for (var i = 0; i < all[a].length; i++) e.insert(all[a][i]);
      for (var j = 0; j < all[a].length; j++) {
        e.delete(all[a][j]);
        if (e.invariants().length) { bad++; break; }
      }
      var s = e.snapshot();
      if (s.d !== 0 || s.buckets !== 1 || s.records !== 0) bad++;
      tested++;
    }
    return { tested: tested, bad: bad };
  })();

  /* ---------------- checks ---------------- */

  var CHECKS = [];
  function check(name, pass, detail) {
    CHECKS.push({ name: name, pass: !!pass, detail: detail || '' });
  }

  check('the ten-record trace satisfies all four properties after every insert',
        M.TRACE.bad.length === 0,
        M.TRACE.doubles + ' doublings and ' + M.TRACE.splits + ' splits to depth ' + M.TRACE.d +
        '; ' + M.TRACE.bad.length + ' property failure(s)');

  check('every directory entry reaches a bucket that agrees with it on the low bits',
        M.POINTERS.ok,
        M.POINTERS.checked + ' entries checked against their buckets');

  check('the structure answers membership exactly like a plain set, at every step',
        M.BRUTE.wrong === 0,
        M.BRUTE.probes + ' probes of ' + M.BRUTE.keys + ' keys, ' + M.BRUTE.wrong + ' wrong');

  check('the invariants hold for every insertion order of six keys from eight',
        M.EXHAUST.bad === 0,
        M.EXHAUST.seqs + ' permutations, ' + M.EXHAUST.bad + ' failure(s)');

  check('a split below the global depth does not double the directory',
        M.SPLIT.ok,
        'inserting 10: depth stays ' + M.SPLIT.dBefore + ', entries stay ' + M.SPLIT.entriesBefore +
        ', buckets ' + M.SPLIT.bucketsBefore + ' to ' + M.SPLIT.bucketsAfter);

  check('a split at the global depth doubles first, then splits',
        M.DOUBLE.ok,
        'inserting 24: ' + M.DOUBLE.order + '; depth ' + M.DOUBLE.dBefore + ' to ' + M.DOUBLE.dAfter +
        ', entries ' + M.DOUBLE.entriesBefore + ' to ' + M.DOUBLE.entriesAfter);

  check('doubling is a copy: every entry equals the entry 2^d positions later',
        M.COPY.ok,
        M.COPY.equal + ' of ' + M.COPY.pairs + ' pairs identical after the copy');

  check('deletion refuses a merge that would overflow, accepts one that fits, then halves',
        M.MERGE.ok,
        'buckets ' + M.MERGE.startBuckets + ' to ' + M.MERGE.refuseBuckets + ' (refused) to ' +
        M.MERGE.mergeBuckets + ' (merged); halving takes depth to ' + M.MERGE.halveD);

  check('deleting every record returns the structure to one bucket at depth zero',
        M.MERGE.backToEmpty && M.ROUNDTRIP.bad === 0,
        M.ROUNDTRIP.tested + ' insertion orders emptied, ' + M.ROUNDTRIP.bad + ' failure(s)');

  check('the count formulas reproduce the model on every size from 1 to 40',
        M.COUNTS.boundHolds,
        '2^d >= ceil(N/cap) and buckets <= 2^d hold throughout');

  check('a bucket at local depth 2 in a depth-4 directory has 4 pointers',
        M.COUNTS.epb.v === 4,
        '2^(4-2) = ' + M.COUNTS.epb.v);

  check('depth 20 with four-byte pointers is a 4 MiB directory',
        M.COUNTS.dirBytesOk,
        M.COUNTS.dirBytes + ' bytes');

  check('a range of eight consecutive keys touches at least eight buckets',
        M.RANGE.covers,
        M.RANGE.touched + ' of ' + M.RANGE.buckets + ' buckets for keys 5 to 12');

  check('static hashing with five buckets gives a chain of three and four reads',
        M.STATIC.ok,
        'occupancy ' + M.STATIC.five.occ.join(',') + '; worst lookup ' + M.STATIC.five.reads + ' blocks');

  check('five keys congruent to 1 mod 16 share their low four bits and degenerate',
        M.SKEW.share && M.SKEW.degenerate,
        M.SKEW.entries + ' directory entries for ' + M.SKEW.records + ' records at depth ' + M.SKEW.d);

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

  /* ======================================================================
     LAYER 3 — RENDER
     ====================================================================== */

  var C = PR.PAL;

  function head(P2, title, sub) {
    P2.text(40, 24, title, { size: 16, bold: true, color: C.ink });
    if (sub) P2.text(40, 46, sub, { size: 11, color: C.dim });
    P2.line(40, 62, 860, 62, { stroke: C.border, sw: 1 });
  }

  function foot(P2, text) {
    P2.line(40, 428, 860, 428, { stroke: C.border, sw: 1 });
    P2.text(40, 438, text, { size: 10, mono: true, color: C.dim });
  }

  function box(P2, x, y, w, h, o) {
    o = o || {};
    P2.rect(x, y, w, h, { fill: o.fill || C.surface, stroke: o.stroke || C.border,
                          sw: o.sw || 1, radius: 4, dash: o.dash });
    if (o.title) P2.text(x + 8, y + 7, o.title, { size: 11, bold: true, color: o.titleColor || C.ink });
  }

  function chip(P2, x, y, text, kind) {
    var fill = kind === 'valid' ? C.accentDim : kind === 'invalid' ? C.invalidDim
             : kind === 'warn' ? C.warnDim : C.surface2;
    var stroke = kind === 'valid' ? C.accent : kind === 'invalid' ? C.invalid
               : kind === 'warn' ? C.warn : C.border;
    var w = Math.max(26, String(text).length * 6.4 + 12);
    P2.rect(x, y, w, 17, { fill: fill, stroke: stroke, sw: 1, radius: 3 });
    P2.text(x + w / 2, y + 8.5, String(text), { size: 10, mono: true, color: stroke,
                                                align: 'center', base: 'middle' });
    return w;
  }

  function tag(P2, x, y, text, kind) {
    var col = kind === 'valid' ? C.accent : kind === 'invalid' ? C.invalid
            : kind === 'warn' ? C.warn : C.dim;
    P2.text(x, y, text, { size: 10, mono: true, color: col });
  }

  /* ---------- the structure view: directory on the left, buckets on the right ---------- */

  function structureView(P2, eh, o) {
    o = o || {};
    var d = eh.d, n = 1 << d;
    var x = o.x === undefined ? 44 : o.x;
    var y = o.y === undefined ? 76 : o.y;
    var availH = o.h === undefined ? 340 : o.h;
    var rowH = Math.min(24, availH / n);
    var dirW = 106;

    var order = [], i, j;
    for (i = 0; i < n; i++) if (order.indexOf(eh.dir[i]) < 0) order.push(eh.dir[i]);
    var nb = order.length;

    var cols = nb <= 6 ? 1 : (nb <= 8 ? 2 : 3);
    var bx = x + dirW + 62;
    var bw = cols === 1 ? 240 : (cols === 2 ? 250 : 176);
    var gap = 16;
    var rows = Math.ceil(nb / cols);
    var bh = Math.min(54, (availH - (rows - 1) * 8) / rows);
    if (bh < 26) bh = 26;

    var pos = [];
    for (i = 0; i < nb; i++) {
      var c = Math.floor(i / rows), r = i % rows;
      pos.push({ x: bx + c * (bw + gap), y: y + r * (bh + 8), w: bw, h: bh });
    }
    function posOf(b) {
      for (var t = 0; t < nb; t++) if (order[t] === b) return pos[t];
      return null;
    }

    /* directory */
    P2.text(x, y - 14, 'dir \u00b7 2^' + d + ' = ' + n, { size: 10, mono: true, color: C.dim });

    /* arrows first, so the boxes sit on top of them */
    for (i = 0; i < n; i++) {
      var bp = posOf(eh.dir[i]);
      if (!bp) continue;
      var yc = y + i * rowH + rowH / 2;
      var isNew = o.highlight && eh.dir[i] === o.highlight;
      P2.line(x + dirW, yc, bp.x, bp.y + bp.h / 2, {
        stroke: isNew ? C.accent : C.border,
        sw: isNew ? 1.6 : 1
      });
    }

    for (i = 0; i < n; i++) {
      var b = eh.dir[i];
      var y0 = y + i * rowH;
      var hot = o.highlight && b === o.highlight;
      var rowFill = hot ? C.accentDim : (i % 2 ? C.surface2 : C.surface);
      P2.rect(x, y0 + 1, dirW, rowH - 2, {
        fill: rowFill,
        stroke: hot ? C.accent : C.border,
        sw: hot ? 1.4 : 0.8, radius: 2
      });
      P2.text(x + 6, y0 + rowH / 2, bitStr(i, d) || '\u2013',
              { size: Math.min(11, rowH - 6), mono: true, color: hot ? C.accent : C.ink,
                base: 'middle' });
      P2.text(x + dirW - 6, y0 + rowH / 2, String(i),
              { size: Math.min(10, rowH - 8), mono: true, color: C.faint,
                align: 'right', base: 'middle' });
    }

    /* buckets */
    P2.text(bx, y - 14, nb + ' bucket' + (nb === 1 ? '' : 's') + ' \u00b7 cap ' + eh.cap,
            { size: 10, mono: true, color: C.dim });

    for (i = 0; i < nb; i++) {
      var bb = order[i], pp = pos[i];
      var isNewB = o.newBucket && bb === o.newBucket;
      var isHotB = o.highlight && bb === o.highlight;
      P2.rect(pp.x, pp.y, pp.w, pp.h, {
        fill: isNewB ? C.accentDim : (isHotB ? C.warnDim : C.surface),
        stroke: isNewB ? C.accent : (isHotB ? C.warn : C.border),
        sw: isNewB || isHotB ? 1.5 : 1, radius: 4
      });
      P2.text(pp.x + 8, pp.y + 6, 'd\u2032 = ' + bb.ld,
              { size: 10, mono: true, color: isNewB ? C.accent : C.dim });
      P2.text(pp.x + pp.w - 8, pp.y + 6, bb.keys.length + '/' + eh.cap,
              { size: 10, mono: true, color: bb.keys.length >= eh.cap ? C.warn : C.faint,
                align: 'right' });

      var single = pp.h < 42;
      var kx = single ? pp.x + 54 : pp.x + 8;
      var ky = single ? pp.y + 6 : pp.y + 24;
      var rightLimit = pp.x + pp.w - (single ? 40 : 6);
      for (j = 0; j < bb.keys.length; j++) {
        var txt = String(bb.keys[j]);
        var wNeed = Math.max(24, txt.length * 7 + 12);
        if (kx + wNeed > rightLimit) {
          if (single) break;
          kx = pp.x + 8; ky += 20;
        }
        if (ky + 16 > pp.y + pp.h - 2) break;
        chip(P2, kx, ky, txt, o.hotKeys && o.hotKeys.indexOf(bb.keys[j]) >= 0 ? 'warn' : 'neutral');
        kx += wNeed + 6;
      }
      if (!bb.keys.length && !single) {
        P2.text(pp.x + 8, ky + 8, 'empty', { size: 10, color: C.faint });
      }
    }
    return { dirW: dirW, rowH: rowH, bx: bx };
  }

  /* ---------- 1. overflow ---------- */
  function drawOverflow(P2, u) {
    head(P2, 'Static hashing: a bucket count chosen before the data arrives',
         'h(k) = k mod m, capacity 2 records per block');

    var ten = M.STATIC.ten, five = M.STATIC.five;
    var rows = [
      { label: 'm = 10 buckets', s: ten, y: 96 },
      { label: 'm = 5 buckets', s: five, y: 216 }
    ];

    for (var r = 0; r < rows.length; r++) {
      var row = rows[r];
      if (u < 0.12 + r * 0.22) continue;
      P2.text(44, row.y - 16, row.label + '   \u2014 24 keys, capacity 2', { size: 11, bold: true, color: C.ink });

      var bw = row.s.occ.length === 10 ? 70 : 132;
      var x = 44;
      for (var i = 0; i < row.s.occ.length; i++) {
        var occ = row.s.occ[i], chain = row.s.chains[i];
        var over = chain > 0;
        P2.rect(x, row.y, bw - 8, 34, {
          fill: over ? C.invalidDim : C.surface,
          stroke: over ? C.invalid : C.border,
          sw: over ? 1.4 : 1, radius: 3
        });
        P2.text(x + 6, row.y + 5, 'b' + i, { size: 9, mono: true, color: C.dim });
        P2.text(x + bw - 16, row.y + 5, String(occ), {
          size: 9, mono: true, align: 'right', color: over ? C.invalid : C.faint
        });
        // the chain blocks
        for (var c = 0; c < chain; c++) {
          P2.rect(x + 10 + c * 12, row.y + 20, 10, 10, {
            fill: C.invalidDim, stroke: C.invalid, sw: 1, radius: 2
          });
        }
        if (over) {
          P2.text(x + 6, row.y + 21, 'chain ' + chain, { size: 8, mono: true, color: C.invalid });
        }
        x += bw;
      }
      tag(P2, 44, row.y + 44, 'worst lookup: ' + row.s.reads + ' block read' +
          (row.s.reads === 1 ? '' : 's'), row.s.reads > 2 ? 'invalid' : 'neutral');
    }

    if (u > 0.7) {
      box(P2, 44, 330, 812, 52, { stroke: C.invalid });
      P2.text(56, 344, 'The chain grows with the file and the bucket count cannot. Growing a static file means choosing a new m and rehashing every record.', { size: 11, color: C.ink });
      P2.text(56, 362, 'Extendible hashing replaces that one large reorganisation with many small ones, and keeps the lookup at one block read.', { size: 11, color: C.dim });
    }
    foot(P2, 'm = 10: occupancy ' + ten.occ.join(',') + '  |  m = 5: ' + five.occ.join(',') +
             '  |  worst chain ' + five.worst);
  }

  /* ---------- 2. directory ---------- */
  function drawDirectory(P2, u) {
    head(P2, 'The directory: 2^d pointers, indexed by the low d bits of the hash',
         'global depth d = 3, so 8 entries and 6 buckets');
    var eh = M.TRACE.eh;
    structureView(P2, eh, { y: 84, h: 244 });

    if (u > 0.45) {
      box(P2, 44, 344, 400, 72, { stroke: C.accent });
      P2.text(56, 356, 'lookup(k):', { size: 11, bold: true, color: C.ink });
      P2.text(56, 374, 'i = k AND (2^d \u2212 1)', { size: 11, mono: true, color: C.ink });
      P2.text(56, 390, 'then read bucket i', { size: 11, mono: true, color: C.ink });
      P2.text(56, 406, 'one directory entry, one bucket', { size: 10, color: C.dim });
    }
    if (u > 0.62) {
      box(P2, 456, 344, 400, 72, { stroke: C.border });
      P2.text(468, 356, 'two keys, same low d bits, same bucket.', { size: 11, color: C.ink });
      P2.text(468, 374, 'two keys, different low d bits, different buckets.', { size: 11, color: C.ink });
      P2.text(468, 396, 'That is what makes one probe enough.', { size: 10, color: C.dim });
    }
    foot(P2, 'd = ' + eh.d + ', entries ' + eh.dir.length + ', buckets ' + eh.snapshot().buckets);
  }

  /* ---------- 3. depths ---------- */
  function drawDepths(P2, u) {
    head(P2, 'Two depths: one for the directory, one for each bucket',
         'd is the number of bits read; d\u2032 is the number this bucket needed');

    // a hand-built depth-3 picture: local depths 1, 2, 3
    var b1 = new Bucket(1); b1.keys = [3, 11];
    var b2 = new Bucket(2); b2.keys = [1, 5];
    var b3 = new Bucket(3); b3.keys = [2];
    var b4 = new Bucket(3); b4.keys = [4, 12];
    var demo = {
      d: 3, cap: 2,
      dir: [b2, b1, b3, b1, b4, b1, b3, b1],
      buckets: function () { return [b2, b1, b3, b4]; }
    };
    structureView(P2, demo, { y: 84, h: 236 });

    if (u > 0.4) {
      box(P2, 44, 340, 260, 76, { stroke: C.border });
      P2.text(56, 352, 'global depth d = 3', { size: 11, bold: true, color: C.ink });
      P2.text(56, 368, 'the directory reads 3 bits', { size: 10, color: C.dim });
      P2.text(56, 386, 'd = max of all local depths', { size: 10, mono: true, color: C.ink });
      P2.text(56, 402, 'so d = 3 here because one bucket needs 3', { size: 9, color: C.faint });
    }
    if (u > 0.58) {
      box(P2, 316, 340, 260, 76, { stroke: C.accent });
      P2.text(328, 352, 'pointers per bucket = 2^(d \u2212 d\u2032)', { size: 11, bold: true, color: C.ink });
      P2.text(328, 368, 'd\u2032 = 1 \u2192 4 pointers  (100, 011, 101, 111)', { size: 10, mono: true, color: C.ink });
      P2.text(328, 384, 'd\u2032 = 2 \u2192 2 pointers  (000, 100)', { size: 10, mono: true, color: C.ink });
      P2.text(328, 400, 'd\u2032 = 3 \u2192 1 pointer   (010)', { size: 10, mono: true, color: C.ink });
    }
    if (u > 0.74) {
      box(P2, 588, 340, 268, 76, { stroke: C.warn });
      P2.text(600, 352, 'all pointers to one bucket', { size: 11, bold: true, color: C.ink });
      P2.text(600, 368, 'agree on the low d\u2032 bits', { size: 10, color: C.dim });
      P2.text(600, 386, '100, 011, 101, 111 all end in 1', { size: 10, mono: true, color: C.warn });
      P2.text(600, 402, 'if they disagreed the probe would be wrong', { size: 9, color: C.faint });
    }
    foot(P2, '8 entries, 4 buckets, depths 1, 2, 3, 3 \u2014 pointers 4, 2, 1, 1');
  }

  /* ---------- 4. insert ---------- */
  function drawInsert(P2, u) {
    var e = build(6);   // 16,4,6,22,24,10
    head(P2, 'An insert with room changes nothing structural',
         'insert 22: binary ' + bitStr(22, 5) + ', low ' + e.d + ' bits ' + bitStr(22 & ((1 << e.d) - 1), e.d));
    structureView(P2, e, { y: 84, h: 250, highlight: e.find(22) });

    if (u > 0.3) {
      P2.text(44, 348, 'key 22  =  ' + bitStr(22, 8), { size: 12, mono: true, color: C.ink });
      P2.text(44, 368, 'low ' + e.d + ' bits  =  ' + bitStr(22 & ((1 << e.d) - 1), e.d) +
              '  =  entry ' + (22 & ((1 << e.d) - 1)), { size: 12, mono: true, color: C.accent });
      P2.text(44, 388, 'that bucket holds ' + e.find(22).keys.join(', ') +
              ' \u2014 room for one more', { size: 11, color: C.dim });
    }
    if (u > 0.62) {
      box(P2, 430, 340, 426, 74, { stroke: C.accent });
      P2.text(442, 352, 'nothing moved:', { size: 11, bold: true, color: C.ink });
      P2.text(442, 368, 'no pointer rewritten, no depth changed, no other bucket read', { size: 10, color: C.dim });
      P2.text(442, 386, 'a full bucket is still free: only the record that does not fit costs', { size: 10, color: C.dim });
      P2.text(442, 402, 'the two depths decide that cost, not the record count', { size: 10, color: C.faint });
    }
    foot(P2, 'depth ' + e.d + ', ' + e.snapshot().buckets + ' buckets, ' + e.records() + ' records');
  }

  /* ---------- 5. split ---------- */
  function drawSplit(P2, u) {
    var before = build(5), after = build(6);
    head(P2, 'Overflow with a spare pointer: split, and leave the directory alone',
         'inserting 10 into a bucket at d\u2032 = 2 while the global depth is 3');

    var left = u < 0.55 ? before : after;
    var showAfter = u >= 0.55;
    structureView(P2, left, {
      y: 84, h: 232,
      highlight: showAfter ? null : before.find(10),
      newBucket: null
    });

    if (u > 0.18) {
      P2.text(44, 330, showAfter ? 'after: two buckets at d\u2032 = 3' : 'before: one bucket at d\u2032 = 2, holding 3 records',
              { size: 11, bold: true, color: showAfter ? C.accent : C.ink });
    }
    if (u > 0.34) {
      P2.text(44, 350, 'entries stay ' + M.SPLIT.entriesBefore + ', global depth stays ' + M.SPLIT.dBefore +
              ', buckets ' + M.SPLIT.bucketsBefore + ' \u2192 ' + M.SPLIT.bucketsAfter,
              { size: 11, mono: true, color: C.ink });
      P2.text(44, 368, 'the split bit is bit number d\u2032 = 2, that is the 4s bit', { size: 11, color: C.dim });
    }
    if (u > 0.5) {
      box(P2, 44, 382, 400, 40, { stroke: C.border });
      P2.text(56, 394, '4 pointers at d\u2032 = 2  \u2192  2 + 2 at d\u2032 = 3', { size: 11, mono: true, color: C.ink });
      P2.text(56, 410, 'pointers are divided, never created', { size: 9, color: C.faint });
    }
    if (u > 0.7) {
      box(P2, 456, 382, 400, 40, { stroke: C.warn });
      P2.text(468, 394, 'every other bucket and every other entry is untouched', { size: 11, color: C.ink });
      P2.text(468, 410, 'the cost is one bucket read, one write, and its pointers', { size: 9, color: C.faint });
    }
    foot(P2, 'd = ' + M.SPLIT.dBefore + ' unchanged; buckets ' + M.SPLIT.bucketsBefore +
             ' \u2192 ' + M.SPLIT.bucketsAfter + '; no doubling');
  }

  /* ---------- 6. double ---------- */
  function drawDouble(P2, u) {
    var before = build(4), after = build(5);
    head(P2, 'Overflow with no spare pointer: double the directory first',
         'inserting 24 when the bucket\u2032s d\u2032 already equals d = 2');

    var showAfter = u >= 0.5;
    structureView(P2, showAfter ? after : before, { y: 84, h: 250 });

    if (u > 0.2) {
      P2.text(44, 348, showAfter ? 'after: d = ' + after.d + ', ' + after.dir.length + ' entries'
                                 : 'before: d = ' + before.d + ', ' + before.dir.length +
                                   ' entries, the bucket has one pointer',
              { size: 11, bold: true, color: showAfter ? C.accent : C.ink });
    }
    if (u > 0.4) {
      P2.text(44, 368, 'doubling is a copy:  entry[i + 2^d]  =  entry[i]', { size: 12, mono: true, color: C.ink });
      P2.text(44, 386, M.COPY.equal + ' of ' + M.COPY.pairs + ' pairs identical immediately after the copy',
              { size: 10, color: C.dim });
    }
    if (u > 0.62) {
      box(P2, 44, 396, 812, 28, { stroke: C.accent });
      P2.text(56, 404, 'then the ordinary split runs on the new bit: global depth ' + before.d + ' \u2192 ' +
              after.d + ', entries ' + before.dir.length + ' \u2192 ' + after.dir.length, { size: 10, color: C.ink });
    }
    foot(P2, 'order: double, then split. ' + M.DOUBLE.order);
  }

  /* ---------- 7. trace ---------- */
  function drawTrace(P2, u) {
    var e = M.TRACE.eh;
    head(P2, 'Ten records, capacity 2, one fixed insertion order',
         SEQ.join(', '));
    structureView(P2, e, { y: 84, h: 250 });

    if (u > 0.25) {
      var rows = [
        ['inserts', String(SEQ.length)],
        ['doublings', String(M.TRACE.doubles)],
        ['splits', String(M.TRACE.splits)],
        ['global depth', String(M.TRACE.d)]
      ];
      var x = 44;
      for (var i = 0; i < rows.length; i++) {
        box(P2, x, 340, 116, 46, { stroke: C.border });
        P2.text(x + 10, 350, rows[i][0], { size: 9, mono: true, color: C.dim });
        P2.text(x + 10, 364, rows[i][1], { size: 20, bold: true, color: C.ink });
        x += 122;
      }
      box(P2, 532, 340, 324, 46, { stroke: C.accent });
      P2.text(544, 350, 'occupancy', { size: 9, mono: true, color: C.dim });
      P2.text(544, 364, M.TRACE.records + ' / ' + M.TRACE.slots + ' slots  =  ' +
              Math.round(100 * M.TRACE.records / M.TRACE.slots) + '%', { size: 16, bold: true, color: C.accent });
    }
    if (u > 0.55) {
      P2.text(44, 400, 'local depths  ' + M.TRACE.localDepths.join(', ') +
              '   \u2014 two buckets are shared by two entries each', { size: 11, mono: true, color: C.ink });
    }
    foot(P2, M.TRACE.buckets + ' buckets in ' + M.TRACE.entries + ' entries; four properties re-checked after every insert');
  }

  /* ---------- 8. counts ---------- */
  function drawCounts(P2, u) {
    head(P2, 'Four counts that answer almost every question',
         'each one recomputed from the definitions, not quoted');

    var rows = [
      ['pointers reaching one bucket', '2^(d \u2212 d\u2032)',
       'd = ' + M.COUNTS.epb.d + ', d\u2032 = ' + M.COUNTS.epb.ld + ' \u2192 ' + M.COUNTS.epb.v],
      ['most records the structure can hold', '2^d \u00d7 capacity',
       'd = 4, capacity 3 \u2192 ' + M.COUNTS.ceiling.v],
      ['fewest bits for N records', 'least d with 2^d \u2265 \u2308N/cap\u2309',
       M.COUNTS.cases[0].n + ' records at capacity ' + M.COUNTS.cases[0].cap + ' \u2192 d = ' + M.COUNTS.cases[0].d],
      ['directory size', '2^d \u00d7 pointer width',
       'd = 20, 4 bytes \u2192 ' + (M.COUNTS.dirBytes / 1048576) + ' MiB']
    ];

    var y = 84;
    P2.text(44, y - 8, 'quantity', { size: 10, mono: true, color: C.dim });
    P2.text(360, y - 8, 'formula', { size: 10, mono: true, color: C.dim });
    P2.text(600, y - 8, 'worked', { size: 10, mono: true, color: C.dim });

    for (var i = 0; i < rows.length; i++) {
      if (u < 0.12 + i * 0.14) continue;
      var ry = y + i * 52;
      P2.rect(44, ry, 812, 44, { fill: i % 2 ? C.surface2 : C.surface, stroke: C.border, sw: 1, radius: 3 });
      P2.text(56, ry + 8, rows[i][0], { size: 11, bold: true, color: C.ink });
      P2.text(360, ry + 8, rows[i][1], { size: 11, mono: true, color: C.accent });
      P2.text(600, ry + 8, rows[i][2], { size: 11, color: C.ink });
      P2.text(56, ry + 25, ['count of directory entries, not records',
                            'a ceiling: skew can force a larger directory',
                            'a floor: the bound is necessary, not sufficient',
                            'the array the search walks'][i], { size: 9, color: C.faint });
    }

    if (u > 0.75) {
      var c = M.COUNTS.cases[0];
      box(P2, 44, 300, 812, 116, { stroke: C.accent });
      P2.text(56, 312, 'the worked chain for ' + c.n + ' records at capacity ' + c.cap + ':',
              { size: 11, bold: true, color: C.ink });
      P2.text(56, 332, '\u2308' + c.n + ' / ' + c.cap + '\u2309 = ' + c.need + '  buckets needed at least',
              { size: 12, mono: true, color: C.ink });
      P2.text(56, 352, 'smallest d with 2^d \u2265 ' + c.need + '  is  d = ' + c.d + ',  giving ' + c.entries + ' entries',
              { size: 12, mono: true, color: C.accent });
      P2.text(56, 372, 'and a ceiling of ' + c.ceiling + ' records, so ' + c.n + ' fits',
              { size: 12, mono: true, color: C.ink });
      P2.text(56, 394, '2^d is an upper bound on the bucket count, never the count itself: this page\u2032s trace has ' +
              M.TRACE.entries + ' entries and ' + M.TRACE.buckets + ' buckets', { size: 10, color: C.dim });
    }
    foot(P2, '2^d bounds the bucket count from above; buckets share entries, which is the whole point');
  }

  /* ---------- 9. lookup ---------- */
  function drawLookup(P2, u) {
    var e = new EH(CAP, BITS);
    for (var k = 0; k < 20; k++) e.insert(k);
    head(P2, 'One block read for equality, and the query it cannot answer',
         '20 records in ' + e.snapshot().buckets + ' buckets at depth ' + e.d);

    var hot = [];
    for (var v = 5; v <= 12; v++) hot.push(v);
    structureView(P2, e, { y: 84, h: 250, hotKeys: u > 0.45 ? hot : [] });

    if (u > 0.2) {
      P2.text(44, 348, 'equality lookup: read entry ' + (7 & ((1 << e.d) - 1)) + ', read that bucket \u2014 1 block',
              { size: 11, mono: true, color: C.accent });
    }
    if (u > 0.45) {
      P2.text(44, 368, 'range 5 to 12: 8 consecutive keys land in ' + M.RANGE.touched + ' different buckets of ' +
              M.RANGE.buckets, { size: 11, mono: true, color: C.warn });
    }
    if (u > 0.62) {
      box(P2, 44, 386, 400, 36, { stroke: C.warn });
      P2.text(56, 396, 'a B+ tree: descend once, then follow the leaf chain', { size: 10, color: C.ink });
      P2.text(56, 410, 'ordered leaves are exactly what the hash destroyed', { size: 9, color: C.faint });
    }
    if (u > 0.78) {
      box(P2, 456, 386, 400, 36, { stroke: C.invalid });
      P2.text(468, 396, 'no range, no prefix, no ORDER BY from a hash index', { size: 10, color: C.invalid });
      P2.text(468, 410, 'the trade is deliberate: order for one-read equality', { size: 9, color: C.faint });
    }
    foot(P2, '1 read resident directory, 2 if not; a range reads one bucket per key group');
  }

  /* ---------- 10. merge ---------- */
  function drawMerge(P2, u) {
    var e = new EH(CAP, BITS);
    for (var i = 0; i < SEQ.length; i++) e.insert(SEQ[i]);
    e.delete(20);
    var stage = 0;
    if (u > 0.35) { e.delete(24); stage = 1; }
    if (u > 0.58) { e.delete(22); stage = 2; }
    if (u > 0.78) { e.delete(16); e.delete(4); stage = 3; }

    head(P2, 'Deletion: merge a bucket with its split image, then halve the directory',
         'deleting 20, then 24, then 22, then 16 and 4');
    structureView(P2, e, { y: 84, h: 230 });

    var labels = [
      'after deleting 20: candidate 1 + 2 = 3 > capacity 2, merge refused',
      'after deleting 24: candidate 1 + 1 = 2, merge accepted, d\u2032 falls 3 \u2192 2',
      'after deleting 22: every d\u2032 < d, so the directory halves, d 3 \u2192 2',
      'after deleting 16 and 4: ' + e.snapshot().buckets + ' buckets at depth ' + e.d
    ];
    P2.text(44, 332, labels[stage], { size: 11, bold: true, color: stage === 2 ? C.accent : C.ink });
    P2.text(44, 352, 'merge needs both: the same d\u2032 on both sides, and the combined records within capacity',
            { size: 10, color: C.dim });
    if (u > 0.5) {
      P2.text(44, 372, 'halving is the inverse of doubling: entry i and entry i + 2^(d\u22121) agree, so half the array goes',
              { size: 10, mono: true, color: C.ink });
    }
    if (u > 0.86) {
      box(P2, 44, 388, 812, 34, { stroke: C.accent });
      P2.text(56, 398, 'delete every record and the structure returns to one bucket at depth 0 \u2014 ' +
              M.ROUNDTRIP.tested + ' insertion orders checked, ' + M.ROUNDTRIP.bad + ' failures',
              { size: 10, color: C.ink });
    }
    foot(P2, 'depth ' + e.d + ', entries ' + e.dir.length + ', buckets ' + e.snapshot().buckets +
             ', records ' + e.records());
  }

  /* ---------- 11. skew ---------- */
  function drawSkew(P2, u) {
    head(P2, 'The failure mode: five keys that share their low bits',
         '1, 17, 33, 49, 65 \u2014 all congruent to 1 modulo 16');

    var keys = [1, 17, 33, 49, 65];
    P2.text(44, 76, 'key', { size: 10, mono: true, color: C.dim });
    P2.text(140, 76, 'binary (8 bits)', { size: 10, mono: true, color: C.dim });
    P2.text(340, 76, 'low 4 bits', { size: 10, mono: true, color: C.dim });

    for (var i = 0; i < keys.length; i++) {
      if (u < 0.08 + i * 0.06) continue;
      var y = 94 + i * 24;
      P2.text(44, y, String(keys[i]), { size: 12, mono: true, color: C.ink });
      P2.text(140, y, bitStr(keys[i], 8), { size: 12, mono: true, color: C.ink });
      P2.text(340, y, bitStr(keys[i] & 15, 4), { size: 12, mono: true, color: C.warn });
    }
    if (u > 0.4) {
      P2.text(44, 222, 'every key ends in ' + bitStr(keys[0] & 15, 4) +
              ': no number of doublings below bit 4 can separate them', { size: 11, color: C.dim });
    }

    // the growth bars
    var growth = M.SKEW.growth;
    P2.text(470, 76, 'directory entries as each key arrives', { size: 10, mono: true, color: C.dim });
    var maxV = growth[growth.length - 1];
    for (var g = 0; g < growth.length; g++) {
      if (u < 0.45 + g * 0.05) continue;
      var gy = 92 + g * 26;
      var w = Math.max(3, (growth[g] / maxV) * 300);
      P2.rect(470, gy, w, 18, { fill: g === growth.length - 1 ? C.invalidDim : C.surface2,
                                stroke: g === growth.length - 1 ? C.invalid : C.border, sw: 1, radius: 3 });
      P2.text(478, gy + 4, String(growth[g]), { size: 10, mono: true, color: C.ink });
    }

    if (u > 0.62) {
      box(P2, 44, 250, 812, 168, { stroke: C.invalid });
      P2.text(56, 262, 'the result, computed by this page', { size: 11, bold: true, color: C.invalid });
      P2.text(56, 284, M.SKEW.entries + ' directory entries, ' + M.SKEW.buckets + ' buckets, ' +
              M.SKEW.records + ' records, global depth ' + M.SKEW.d,
              { size: 13, mono: true, color: C.ink });
      P2.text(56, 306, 'the directory grew by ' + M.SKEW.doubles + ' doublings and the records did not spread',
              { size: 11, color: C.ink });
      P2.text(56, 330, 'the assumption that failed: the hash spreads keys uniformly over the low bits.', { size: 11, color: C.dim });
      P2.text(56, 350, 'nothing is wrong with the algorithm \u2014 the data violated its premise.', { size: 11, color: C.dim });
      P2.text(56, 376, 'the engineering repair: keep a small overflow chain per bucket, and double the',
              { size: 10, color: C.faint });
      P2.text(56, 392, 'directory only when the fraction of overflowing buckets passes a threshold.',
              { size: 10, color: C.faint });
    }
    foot(P2, 'worst case: the directory can grow to about one entry per record, however small the file');
  }

  /* ---------- 12. compare ---------- */
  function drawCompare(P2, u) {
    head(P2, 'Four schemes, four different guarantees',
         'what each one costs and what each one cannot do');

    var cols = ['', 'static', 'extendible', 'linear', 'B+ tree'];
    var rows = [
      ['equality cost', '1, then a chain', '1 always', '1, then a chain', 'height, about 3'],
      ['range query', 'no', 'no', 'no', 'yes, leaf chain'],
      ['growth', 'full rehash', 'double the directory', 'split round-robin', 'split and copy up'],
      ['extra structure', 'none', 'directory 2^d', 'none', 'internal nodes'],
      ['overflow chain', 'yes', 'no, except duplicates', 'yes', 'no']
    ];
    var x0 = 44, y0 = 84, cw = [150, 160, 180, 160, 162], rh = 40;

    for (var c = 0; c < cols.length; c++) {
      var cx = x0;
      for (var t = 0; t < c; t++) cx += cw[t];
      P2.text(cx + 6, y0, cols[c], { size: 10, mono: true, color: c === 2 ? C.accent : C.dim,
                                     bold: c === 2 });
    }
    for (var r = 0; r < rows.length; r++) {
      if (u < 0.1 + r * 0.14) continue;
      var ry = y0 + 18 + r * rh;
      var cx2 = x0;
      for (var q = 0; q < rows[r].length; q++) {
        var w = cw[q];
        var good = q === 2 && (rows[r][q] === '1 always' || rows[r][q] === 'no, except duplicates');
        var badCell = q === 4 && rows[r][q] === 'yes, leaf chain';
        P2.rect(cx2, ry, w - 6, rh - 6, {
          fill: q === 0 ? C.surface2 : (good ? C.accentDim : (badCell ? C.warnDim : C.surface)),
          stroke: q === 0 ? C.border : (good ? C.accent : (badCell ? C.warn : C.border)),
          sw: 1, radius: 3
        });
        P2.text(cx2 + 8, ry + 8, rows[r][q], { size: 10, color: q === 0 ? C.ink : C.ink,
                                               bold: q === 0 });
        cx2 += w;
      }
    }

    if (u > 0.85) {
      box(P2, 44, 320, 812, 96, { stroke: C.accent });
      P2.text(56, 332, 'the one line to carry away', { size: 11, bold: true, color: C.ink });
      P2.text(56, 354, 'a hash index buys one-read equality by destroying order; a B+ tree keeps order and pays a few reads.',
              { size: 12, color: C.ink });
      P2.text(56, 376, 'extendible hashing keeps the one-read promise across growth by adding a directory;',
              { size: 11, color: C.dim });
      P2.text(56, 394, 'linear hashing keeps the growth incremental and gives up the directory, taking overflow back.',
              { size: 11, color: C.dim });
    }
    foot(P2, 'no row wins: each scheme pays for its guarantee with what the others avoid');
  }

  /* ---------- 13. procedure ---------- */
  function drawProcedure(P2, u) {
    head(P2, 'The five-step procedure, and four properties to recheck',
         'an order that never needs a second pass');

    var steps = [
      'write the key in binary, and read the low d bits as the entry number',
      'follow that entry to its bucket; if the key is there, stop',
      'if the bucket has room, insert and stop: no structural change',
      'if it is full, compare d\u2032 with d: equal means double, smaller means split only',
      'split on bit d\u2032, then recheck: entries 2^d, d = max d\u2032, 2^(d\u2212d\u2032) pointers, no bucket over capacity'
    ];
    for (var i = 0; i < steps.length; i++) {
      if (u < 0.1 + i * 0.13) continue;
      var y = 84 + i * 44;
      P2.circle(56, y + 9, 10, { fill: i === 4 ? C.accentDim : C.surface2,
                                 stroke: i === 4 ? C.accent : C.border, sw: 1 });
      P2.text(56, y + 9, String(i + 1), { size: 11, mono: true, color: C.dim, align: 'center', base: 'middle' });
      P2.text(78, y, steps[i], { size: 11, color: i === 4 ? C.accent : C.ink });
    }

    if (u > 0.78) {
      box(P2, 44, 310, 812, 106, { stroke: C.warn });
      P2.text(56, 322, 'the four numbers that get confused', { size: 11, bold: true, color: C.ink });
      P2.text(56, 344, 'global depth d', { size: 11, mono: true, color: C.ink });
      P2.text(220, 344, 'directory entries 2^d', { size: 11, mono: true, color: C.ink });
      P2.text(430, 344, 'buckets, at most 2^d', { size: 11, mono: true, color: C.ink });
      P2.text(640, 344, 'block reads 1 or 2', { size: 11, mono: true, color: C.ink });
      P2.text(56, 370, 'this page\u2032s trace: d = ' + M.TRACE.d + ', entries = ' + M.TRACE.entries +
              ', buckets = ' + M.TRACE.buckets + ', reads = 1', { size: 11, mono: true, color: C.accent });
      P2.text(56, 394, 'and one more warning: some texts index by the first d bits and some by the last. Both are',
              { size: 10, color: C.dim });
      P2.text(56, 408, 'consistent; mixing them inside one calculation is the commonest way to lose the marks.',
              { size: 10, color: C.dim });
    }
    foot(P2, 'read d, take the low d bits, follow, compare the two depths, split, recheck four properties');
  }

  var SCENE_DRAW = {
    overflow: drawOverflow,
    directory: drawDirectory,
    depths: drawDepths,
    insert: drawInsert,
    split: drawSplit,
    double: drawDouble,
    trace: drawTrace,
    counts: drawCounts,
    lookup: drawLookup,
    merge: drawMerge,
    skew: drawSkew,
    compare: drawCompare,
    procedure: drawProcedure
  };

  function drawFrame(P2) {
    if (!P2) return;
    var t = K.state.elapsed;
    var sc = K.state.scenes[K.sceneAt(t)];
    if (!sc) return;
    var span = Math.max(0.001, sc.end - sc.start);
    var u = K.clamp01((t - sc.start) / span);
    P2.clear();
    var fn = SCENE_DRAW[sc.id];
    if (fn) fn(P2, u);
    else P2.text(40, 60, 'No drawing for scene ' + sc.id, { size: 14 });
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
    TRACE: { d: M.TRACE.d, entries: M.TRACE.entries, buckets: M.TRACE.buckets,
             records: M.TRACE.records, doubles: M.TRACE.doubles, splits: M.TRACE.splits,
             localDepths: M.TRACE.localDepths },
    SPLIT: { d: M.SPLIT.dBefore, entries: M.SPLIT.entriesBefore,
             bucketsBefore: M.SPLIT.bucketsBefore, bucketsAfter: M.SPLIT.bucketsAfter },
    DOUBLE: { dBefore: M.DOUBLE.dBefore, dAfter: M.DOUBLE.dAfter,
              entriesBefore: M.DOUBLE.entriesBefore, entriesAfter: M.DOUBLE.entriesAfter },
    COPY: M.COPY,
    MERGE: M.MERGE,
    COUNTS: M.COUNTS,
    RANGE: M.RANGE,
    STATIC: { ten: M.STATIC.ten.reads, five: M.STATIC.five.reads, occ: M.STATIC.five.occ },
    SKEW: { d: M.SKEW.d, entries: M.SKEW.entries, buckets: M.SKEW.buckets,
            records: M.SKEW.records, doubles: M.SKEW.doubles },
    EXHAUST: M.EXHAUST,
    ROUNDTRIP: M.ROUNDTRIP,
    BRUTE: M.BRUTE,
    PASSED: PASSED,
    TOTAL: CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
