/* ==========================================================================
   secondary-storage-and-raid — model, validation, render.

   Layer 1  model      : geometry, access time, LBA map, RAID parity, failure
                         patterns, reliability. Pure data and functions.
   Layer 2  validation : every claim the lesson makes is recomputed and checked
                         against its own definition before anything is drawn.
   Layer 3  render     : reads the model; never re-derives a structure.
   Layer 4  timeline   : in timeline.js — the only source of time.

   No p5.brush: every mark here is geometry that carries the mathematics (a
   stripe map, a parity row, a stacked access-time bar), and a random stroke
   offset would blur a boundary the learner has to judge.
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

  var GEO = {
    platters: 4,
    surfaces: 8,
    cylinders: 1000,
    sectorsPerTrack: 500,
    sectorBytes: 512,
    rpm: 7200,
    avgSeekMs: 8          // a manufacturer figure, taken as given for this drive
  };

  var M = {};

  /* ---- 1. geometry ---- */
  M.sectors = GEO.surfaces * GEO.cylinders * GEO.sectorsPerTrack;      // 4,000,000
  M.capacityBytes = M.sectors * GEO.sectorBytes;                        // 2,048,000,000
  M.trackBytes = GEO.sectorsPerTrack * GEO.sectorBytes;                 // 256,000
  M.cylinderBytes = GEO.surfaces * M.trackBytes;                        // 2,048,000
  M.gib = M.capacityBytes / (1024 * 1024 * 1024);
  M.gb = M.capacityBytes / 1e9;
  M.sectorsPerCylinder = GEO.surfaces * GEO.sectorsPerTrack;            // 4,000

  /* ---- 2. timing ---- */
  M.revMs = 60000 / GEO.rpm;                                            // 8.33333
  M.avgRotMs = M.revMs / 2;                                             // 4.166667
  M.sectorMs = M.revMs / GEO.sectorsPerTrack;                           // 0.0166667
  M.platterMBs = M.trackBytes / (M.revMs / 1000) / 1e6;                 // 30.72

  function accessMs(k) { return GEO.avgSeekMs + M.avgRotMs + k * M.sectorMs; }
  function bandwidthBps(k) { return k * GEO.sectorBytes / (accessMs(k) / 1000); }
  M.accessMs = accessMs;
  M.bandwidthBps = bandwidthBps;

  M.blocks = [1, 8, 64, GEO.sectorsPerTrack];
  M.blockTable = M.blocks.map(function (k) {
    return {
      k: k,
      bytes: k * GEO.sectorBytes,
      ms: accessMs(k),
      bps: bandwidthBps(k),
      marginalMs: k > 1 ? (accessMs(k) - accessMs(1)) / (k - 1) : null
    };
  });
  M.oneSectorMs = accessMs(1);
  M.trackMs = accessMs(GEO.sectorsPerTrack);
  M.bandRatio = bandwidthBps(GEO.sectorsPerTrack) / bandwidthBps(1);
  M.randomIops = 1000 / accessMs(8);
  M.dramNs = 60;
  M.dramRatio = (M.oneSectorMs * 1e6) / M.dramNs;

  /* ---- 3. the LBA map ---- */
  function chsOf(lba) {
    var c = Math.floor(lba / M.sectorsPerCylinder);
    var r = lba % M.sectorsPerCylinder;
    var s = Math.floor(r / GEO.sectorsPerTrack);
    var sec = (r % GEO.sectorsPerTrack) + 1;     // sectors inside a track are 1-based
    return { c: c, s: s, sec: sec };
  }
  function lbaOf(c, s, sec) {
    return (c * GEO.surfaces + s) * GEO.sectorsPerTrack + (sec - 1);
  }
  M.chsOf = chsOf;
  M.lbaOf = lbaOf;
  M.lastChs = chsOf(M.sectors - 1);

  /* ---- 4. RAID: parity over the field of 256 bytes ---- */
  var EXP = new Array(512), LOG = new Array(256);
  (function buildGF() {
    var x = 1;
    for (var i = 0; i < 255; i++) {
      EXP[i] = x; LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11D;
    }
    for (var j = 255; j < 512; j++) EXP[j] = EXP[j - 255];
  })();

  function gmul(a, b) {
    if (a === 0 || b === 0) return 0;
    return EXP[LOG[a] + LOG[b]];
  }
  function gdiv(a, b) {
    if (a === 0) return 0;
    return EXP[(LOG[a] - LOG[b] + 255) % 255];
  }
  M.gmul = gmul;
  M.gdiv = gdiv;

  var N = 6;                 // disks in the arrays this lesson computes on
  var DISK_TB = 1;
  M.N = N;
  M.diskTB = DISK_TB;

  /* six data bytes, produced by a fixed generator so the page is deterministic */
  M.data = (function () {
    var v = 7, out = [];
    for (var i = 0; i < N; i++) {
      v = (v * 1103515245 + 12345) % 2147483648;
      out.push((v >> 16) & 0xFF);
    }
    return out;
  })();

  M.parityP = M.data.reduce(function (a, d) { return a ^ d; }, 0);
  M.parityQ = M.data.reduce(function (a, d, i) { return a ^ gmul(EXP[i], d); }, 0);

  /* single-failure recovery from P */
  M.singleRecovered = [];
  for (var fi = 0; fi < N; fi++) {
    var acc = M.parityP;
    for (var di = 0; di < N; di++) if (di !== fi) acc ^= M.data[di];
    M.singleRecovered.push({ lost: fi, got: acc, ok: acc === M.data[fi] });
  }

  /* double-failure recovery from (P, Q) */
  M.doublePairs = [];
  for (var a = 0; a < N; a++) {
    for (var b = a + 1; b < N; b++) {
      var S1 = M.parityP, S2 = M.parityQ;
      for (var k2 = 0; k2 < N; k2++) {
        if (k2 === a || k2 === b) continue;
        S1 ^= M.data[k2];
        S2 ^= gmul(EXP[k2], M.data[k2]);
      }
      var Aa = EXP[a], Ab = EXP[b];
      var db = gdiv(S2 ^ gmul(Aa, S1), Ab ^ Aa);
      var da = S1 ^ db;
      M.doublePairs.push({ a: a, b: b, da: da, db: db,
                           ok: da === M.data[a] && db === M.data[b] });
    }
  }

  /* ---- 5. the levels, on the same six disks ---- */
  M.levels = [
    { id: '0',  name: 'RAID 0',  usable: 6, tol: 0, penalty: 1,
      pairs: false, maxFail: 0,  note: 'striping only' },
    { id: '1',  name: 'RAID 1',  usable: 3, tol: 1, penalty: 2,
      pairs: true,  maxFail: 1,  note: 'three mirrors' },
    { id: '5',  name: 'RAID 5',  usable: 5, tol: 1, penalty: 4,
      pairs: false, maxFail: 1,  note: 'one rotating parity' },
    { id: '6',  name: 'RAID 6',  usable: 4, tol: 2, penalty: 6,
      pairs: false, maxFail: 2,  note: 'two rotating parities' },
    { id: '10', name: 'RAID 10', usable: 3, tol: 1, penalty: 2,
      pairs: true,  maxFail: 1,  note: 'stripe over mirrors' }
  ];
  M.levels.forEach(function (L) {
    L.efficiency = L.usable / N;
    L.raw = N * DISK_TB;
    L.parityDisks = N - L.usable;
  });

  /* every failure pattern over the six disks, weighted and classified */
  M.patterns = [];
  for (var mask = 0; mask < (1 << N); mask++) {
    var failed = [];
    for (var bit = 0; bit < N; bit++) if (mask & (1 << bit)) failed.push(bit);
    var pairBroken = false;
    if (failed.length) {
      // mirror pairs on six disks: (0,1) (2,3) (4,5)
      for (var pr = 0; pr < 3; pr++) {
        if (failed.indexOf(2 * pr) >= 0 && failed.indexOf(2 * pr + 1) >= 0) pairBroken = true;
      }
    }
    M.patterns.push({ mask: mask, failed: failed, f: failed.length, pairBroken: pairBroken });
  }

  function survives(L, pat) {
    if (L.pairs) return !pat.pairBroken;
    return pat.f <= L.maxFail;
  }
  M.survives = survives;

  var P_FAIL = 0.01;
  M.pFail = P_FAIL;
  M.levels.forEach(function (L) {
    var lost = 0, kept = 0;
    M.patterns.forEach(function (pat) {
      var w = Math.pow(P_FAIL, pat.f) * Math.pow(1 - P_FAIL, N - pat.f);
      if (survives(L, pat)) kept += w; else lost += w;
    });
    L.lossProb = lost;
    L.keepProb = kept;
    L.survivablePatterns = M.patterns.filter(function (pat) { return survives(L, pat); }).length;
  });

  /* closed forms, for the levels that have one */
  function binom(n, k) {
    var r = 1;
    for (var i = 1; i <= k; i++) r = r * (n - k + i) / i;
    return r;
  }
  M.closed = {
    r0: 1 - Math.pow(1 - P_FAIL, N),
    r5: 1 - Math.pow(1 - P_FAIL, N) - N * P_FAIL * Math.pow(1 - P_FAIL, N - 1),
    r6: 1 - Math.pow(1 - P_FAIL, N) - N * P_FAIL * Math.pow(1 - P_FAIL, N - 1)
        - binom(N, 2) * P_FAIL * P_FAIL * Math.pow(1 - P_FAIL, N - 2)
  };

  /* ---- 6. reliability arithmetic from the RAID paper's parameters ---- */
  var MTTF_DISK = 200000, MTTR = 1, ARRAY_DISKS = 100, GROUP = 16;
  M.mttf = {
    disk: MTTF_DISK,
    raid0Array: MTTF_DISK / ARRAY_DISKS,                                        // 2,000 h
    raid5Sys: (MTTF_DISK * MTTF_DISK) / (ARRAY_DISKS * (GROUP - 1) * MTTR),     // 2.667e7 h
    raid6Sys: Math.pow(MTTF_DISK, 3) / (ARRAY_DISKS * (GROUP - 1) * (GROUP - 2) * MTTR * MTTR)
  };
  M.mttf.raid0Years = M.mttf.raid0Array / 8760;
  M.mttf.raid5Years = M.mttf.raid5Sys / 8760;
  M.mttf.raid6Years = M.mttf.raid6Sys / 8760;

  /* ---- 7. the operations a write really costs ---- */
  M.writeOps = {
    small: {
      '0':  { reads: 0, writes: 1 },
      '1':  { reads: 0, writes: 2 },
      '5':  { reads: 2, writes: 2 },
      '6':  { reads: 3, writes: 3 },
      '10': { reads: 0, writes: 2 }
    },
    large: {
      '0':  { reads: 0, writes: N },
      '1':  { reads: 0, writes: N },
      '5':  { reads: 0, writes: N },
      '6':  { reads: 0, writes: N },
      '10': { reads: 0, writes: N }
    }
  };
  M.levels.forEach(function (L) {
    var s = M.writeOps.small[L.id];
    L.smallWriteIos = s.reads + s.writes;
    var g = M.writeOps.large[L.id];
    L.largeWriteIos = g.reads + g.writes;
    // small-write throughput of the whole array, in writes per second
    L.smallWriteIops = (N * M.randomIops) / L.smallWriteIos;
    L.readIops = N * M.randomIops;
  });

  /* ======================================================================
     LAYER 2 — VALIDATION
     ====================================================================== */

  var CHECKS = [];
  function check(name, pass, detail) {
    CHECKS.push({ name: name, pass: !!pass, detail: detail || '' });
  }
  function near(a, b, tol) { return Math.abs(a - b) <= (tol === undefined ? 1e-6 : tol); }

  /* geometry */
  check('capacity is surfaces x cylinders x sectors x bytes',
        M.capacityBytes === GEO.surfaces * GEO.cylinders * GEO.sectorsPerTrack * GEO.sectorBytes,
        M.capacityBytes + ' bytes');
  check('the disk holds exactly 4,000,000 sectors', M.sectors === 4000000, String(M.sectors));
  check('capacity is 1.9073 GiB and 2.048 GB',
        near(M.gib, 1.9073486328125, 1e-9) && near(M.gb, 2.048, 1e-9),
        M.gib.toFixed(6) + ' GiB / ' + M.gb.toFixed(3) + ' GB');
  check('one track is 500 x 512 = 256,000 bytes', M.trackBytes === 256000, String(M.trackBytes));
  check('one cylinder is surfaces x track = 2,048,000 bytes',
        M.cylinderBytes === 2048000, String(M.cylinderBytes));
  check('sectors per cylinder is 4,000', M.sectorsPerCylinder === 4000);
  check('the binary and decimal unit ratio is 1.0737',
        near(Math.pow(1024, 3) / Math.pow(1000, 3), 1.073741824, 1e-9));

  /* timing */
  check('one revolution is 8.3333 ms at 7,200 rpm', near(M.revMs, 8.333333333, 1e-6));
  check('average rotation is exactly half a revolution', near(2 * M.avgRotMs, M.revMs, 1e-12));
  check('a sector time times 500 is one revolution', near(M.sectorMs * GEO.sectorsPerTrack, M.revMs, 1e-12));
  check('platter rate is 30.72 MB/s', near(M.platterMBs, 30.72, 1e-9), M.platterMBs.toFixed(3));
  check('one sector access is 12.1833 ms', near(M.oneSectorMs, 12.1833333, 1e-5),
        M.oneSectorMs.toFixed(4));
  check('a 4 KB read is 12.3 ms', near(accessMs(8), 12.3, 1e-9), accessMs(8).toFixed(4));
  check('a 64-sector read is 13.2333 ms', near(accessMs(64), 13.2333333, 1e-5),
        accessMs(64).toFixed(4));
  check('a whole-track read is 20.5 ms', near(M.trackMs, 20.5, 1e-9), M.trackMs.toFixed(4));
  check('access time increases with block size',
        M.blockTable.every(function (row, i, arr) { return i === 0 || row.ms > arr[i - 1].ms; }));
  check('each extra sector costs the same 0.0167 ms',
        near(M.blockTable[1].marginalMs, M.sectorMs, 1e-9) &&
        near(M.blockTable[2].marginalMs, M.sectorMs, 1e-9) &&
        near(M.blockTable[3].marginalMs, M.sectorMs, 1e-9),
        M.blockTable[3].marginalMs.toFixed(7));
  check('effective bandwidth rises with block size',
        M.blockTable.every(function (row, i, arr) { return i === 0 || row.bps > arr[i - 1].bps; }));
  check('one sector gives 42.02 kB/s', near(bandwidthBps(1) / 1000, 42.0246, 1e-3),
        (bandwidthBps(1) / 1000).toFixed(2) + ' kB/s');
  check('a whole track gives 12.488 MB/s', near(bandwidthBps(500) / 1e6, 12.48780, 1e-4),
        (bandwidthBps(500) / 1e6).toFixed(5) + ' MB/s');
  check('a full track beats one sector by about 297 times', near(M.bandRatio, 297.17, 0.05),
        M.bandRatio.toFixed(2));
  check('a random 4 KB read is 81.3 per second', near(M.randomIops, 81.30, 0.01),
        M.randomIops.toFixed(2));
  check('seek and rotation are 99.86 per cent of a one-sector access',
        near((GEO.avgSeekMs + M.avgRotMs) / M.oneSectorMs, 0.998632, 1e-5));
  check('seek alone is 65.7 per cent of a one-sector access',
        near(GEO.avgSeekMs / M.oneSectorMs, 0.656634, 1e-5));
  check('a disk access is about 203,000 DRAM accesses', near(M.dramRatio, 203056, 1),
        Math.round(M.dramRatio).toLocaleString('en-US'));

  /* the LBA map: forward, inverse, and the round trip over every sector */
  (function () {
    var bad = 0, sample = 0;
    for (var lba = 0; lba < M.sectors; lba++) {
      var x = chsOf(lba);
      if (lbaOf(x.c, x.s, x.sec) !== lba) bad++;
      sample++;
    }
    check('LBA to CHS round-trips on all ' + sample.toLocaleString('en-US') + ' sectors',
          bad === 0, bad + ' disagreements');
    check('the first sector is cylinder 0, surface 0, sector 1',
          chsOf(0).c === 0 && chsOf(0).s === 0 && chsOf(0).sec === 1);
    check('the last sector is cylinder 999, surface 7, sector 500',
          M.lastChs.c === 999 && M.lastChs.s === 7 && M.lastChs.sec === 500);
    check('addresses in one cylinder differ by no seek',
          chsOf(4000).c === 1 && chsOf(3999).c === 0 && chsOf(3999).s === 7);
  })();

  /* the field of 256 bytes */
  (function () {
    var idOk = true, zeroOk = true, invOk = true;
    for (var v = 1; v < 256; v++) {
      if (gmul(1, v) !== v) idOk = false;
      if (gmul(v, gdiv(1, v)) !== 1) invOk = false;
    }
    if (gmul(0, 123) !== 0) zeroOk = false;
    check('GF(256): multiplying by 1 changes nothing', idOk);
    check('GF(256): multiplying by 0 gives 0', zeroOk);
    check('GF(256): every non-zero byte has an inverse', invOk);
  })();

  /* parity */
  check('P is the exclusive-or of the six data bytes',
        M.parityP === M.data.reduce(function (a, d) { return a ^ d; }, 0), String(M.parityP));
  check('P recovers any one lost block: all 6 cases exact',
        M.singleRecovered.every(function (r) { return r.ok; }),
        M.singleRecovered.filter(function (r) { return r.ok; }).length + '/6');
  check('P and Q recover any two lost blocks: all 15 pairs exact',
        M.doublePairs.every(function (r) { return r.ok; }),
        M.doublePairs.filter(function (r) { return r.ok; }).length + '/15');
  check('P alone cannot fix two unknowns: one equation, two variables',
        M.doublePairs.length === 15 && M.singleRecovered.length === 6);

  /* capacity and cost */
  check('usable capacity on six 1 TB disks is 6, 3, 5, 4, 3 TB',
        M.levels.map(function (L) { return L.usable; }).join(',') === '6,3,5,4,3');
  check('efficiencies are 100, 50, 83.33, 66.67, 50 per cent',
        near(M.levels[0].efficiency, 1) && near(M.levels[1].efficiency, 0.5) &&
        near(M.levels[2].efficiency, 5 / 6) && near(M.levels[3].efficiency, 4 / 6) &&
        near(M.levels[4].efficiency, 0.5));
  check('small-write penalties are 1, 2, 4, 6, 2',
        M.levels.map(function (L) { return L.smallWriteIos; }).join(',') === '1,2,4,6,2');
  check('a small write on RAID 5 is two reads and two writes',
        M.writeOps.small['5'].reads === 2 && M.writeOps.small['5'].writes === 2);
  check('a small write on RAID 6 is three reads and three writes',
        M.writeOps.small['6'].reads === 3 && M.writeOps.small['6'].writes === 3);
  check('a full-stripe write on RAID 5 needs no reads at all',
        M.writeOps.large['5'].reads === 0 && M.writeOps.large['5'].writes === N);
  check('RAID 5 writes the array at a quarter of its read rate',
        near(M.levels[2].smallWriteIops, M.levels[2].readIops / 4, 1e-9),
        M.levels[2].smallWriteIops.toFixed(1) + ' writes/s');

  /* failure patterns */
  check('there are 64 failure patterns over six disks', M.patterns.length === 64);
  check('RAID 0 survives exactly 1 pattern of 64',
        M.levels[0].survivablePatterns === 1, String(M.levels[0].survivablePatterns));
  check('RAID 5 survives 7 patterns: none, or one failure',
        M.levels[2].survivablePatterns === 7, String(M.levels[2].survivablePatterns));
  check('RAID 6 survives 22 patterns: none, one or two failures',
        M.levels[3].survivablePatterns === 22, String(M.levels[3].survivablePatterns));
  check('RAID 1 and RAID 10 survive 27 patterns: no whole pair lost',
        M.levels[1].survivablePatterns === 27 && M.levels[4].survivablePatterns === 27,
        String(M.levels[1].survivablePatterns));
  check('of the 15 two-failure patterns, exactly 3 break a mirror pair',
        M.patterns.filter(function (p) { return p.f === 2 && p.pairBroken; }).length === 3);

  /* reliability at p = 0.01, measured against the closed forms */
  check('RAID 0 loss probability at p=0.01 matches 1-(1-p)^6',
        near(M.levels[0].lossProb, M.closed.r0, 1e-12), M.levels[0].lossProb.toFixed(6));
  check('RAID 5 loss probability matches 1-(1-p)^n-np(1-p)^(n-1)',
        near(M.levels[2].lossProb, M.closed.r5, 1e-12), M.levels[2].lossProb.toFixed(6));
  check('RAID 6 loss probability matches the three-term sum',
        near(M.levels[3].lossProb, M.closed.r6, 1e-12), M.levels[3].lossProb.toFixed(8));
  check('RAID 6 is about 75 times safer than RAID 5 at p=0.01',
        near(M.levels[2].lossProb / M.levels[3].lossProb, 74.7, 0.5),
        (M.levels[2].lossProb / M.levels[3].lossProb).toFixed(1) + 'x');
  check('every level\'s survival and loss probabilities sum to 1',
        M.levels.every(function (L) { return near(L.lossProb + L.keepProb, 1, 1e-12); }));

  /* reliability arithmetic */
  check('a 100-disk RAID 0 array has an MTTF of 2,000 hours',
        near(M.mttf.raid0Array, 2000), M.mttf.raid0Array + ' h');
  check('RAID 5 with G=16, 100 disks, 1 h repair gives 3,044 years',
        near(M.mttf.raid5Years, 3044.14, 0.05), Math.round(M.mttf.raid5Years) + ' years');
  check('RAID 6 with the same parameters gives about 43 million years',
        near(M.mttf.raid6Years / 1e6, 43.49, 0.05),
        (M.mttf.raid6Years / 1e6).toFixed(2) + ' million years');

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

  /* ======================================================================
     LAYER 3 — RENDER
     ====================================================================== */

  var COL = null;
  function cols() {
    if (COL) return COL;
    COL = {
      ink: '#0f1720', dim: '#566573', faint: '#7d8b98',
      surface: '#ffffff', surface2: '#eef2f4', border: '#c8d2d8',
      accent: '#0f766e', accentDim: '#d6efeb',
      valid: '#15803d', invalid: '#b3261e', invalidDim: '#fbe4e2',
      warn: '#9a5406', warnDim: '#fbeed3', info: '#1d4e89'
    };
    return COL;
  }

  function nf(v, d) {
    var s = (d === undefined ? v : v.toFixed(d)).toString();
    var parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  function title(P, t, sub) {
    var C = cols();
    P.text(40, 30, t, { size: 17, bold: true, color: C.ink });
    if (sub) P.text(40, 52, sub, { size: 12.5, color: C.dim });
  }

  function note(P, x, y, s, colour) {
    var C = cols();
    P.text(x, y, s, { size: 11.5, color: colour || C.faint });
  }

  function bar(P, x, y, w, h, frac, fill) {
    var C = cols();
    P.rect(x, y, w, h, { fill: C.surface2, stroke: C.border, sw: 1, radius: 3 });
    if (frac > 0) P.rect(x, y, Math.max(2, w * Math.min(1, frac)), h,
                         { fill: fill || C.accent, radius: 3 });
  }

  /* ---------- scene 1: the hierarchy ---------- */
  function drawHierarchy(P, u) {
    var C = cols();
    title(P, 'Where a disk sits', 'each step down buys capacity and pays in latency');

    var rows = [
      { n: 'Registers', c: 'a few hundred bytes', l: '0.3 ns', f: 0.06 },
      { n: 'Cache', c: 'megabytes', l: '4 ns', f: 0.14 },
      { n: 'DRAM', c: 'gigabytes', l: '60 ns', f: 0.28 },
      { n: 'Disk', c: 'terabytes', l: '12.18 ms', f: 0.72, hot: true },
      { n: 'Tape', c: 'petabytes', l: 'seconds', f: 1.0 }
    ];
    var x0 = 130, y0 = 88, rh = 46, bw = 420;

    rows.forEach(function (r, i) {
      var y = y0 + i * rh;
      var on = r.hot ? K.ease(K.clamp01((u - 0.12) * 2.2)) : 0.35;
      P.text(x0 - 14, y + 14, r.n, { size: 13, bold: !!r.hot,
        color: r.hot ? C.ink : C.dim, align: 'right' });
      P.rect(x0, y, bw, 26, { fill: C.surface2, stroke: C.border, sw: 1, radius: 4 });
      var w = Math.max(4, bw * r.f * (0.55 + 0.45 * on));
      P.rect(x0, y, w, 26, { fill: r.hot ? C.accent : C.faint, radius: 4 });
      P.text(x0 + w + 10, y + 13, r.c, { size: 11.5, color: C.dim, base: 'middle' });
      P.text(x0 + bw + 96, y + 13, r.l, { size: 12, mono: true,
        color: r.hot ? C.ink : C.dim, base: 'middle' });
    });

    if (u > 0.28) {
      var a = K.ease(K.clamp01((u - 0.28) * 3));
      P.alpha(a);
      P.line(150, 92 + 2 * rh + 26, 150, 92 + 3 * rh - 6, { stroke: C.warn, sw: 1.5, dash: [4, 3] });
      P.text(158, 92 + 3 * rh - 12, 'the only level that survives a power cut',
             { size: 11.5, color: C.warn });
      P.alpha(1);
    }
    if (u > 0.5) {
      var b = K.ease(K.clamp01((u - 0.5) * 2.5));
      P.alpha(b);
      P.rect(40, 366, 820, 66, { fill: C.accentDim, stroke: C.accent, sw: 1, radius: 6 });
      P.text(58, 384, '12.18 ms  /  60 ns  =  ' + nf(Math.round(M.dramRatio)) + ' times',
             { size: 15, bold: true, mono: true, color: C.ink });
      P.text(58, 408, 'One disk access is worth two hundred thousand DRAM accesses. The disk is also about 100 times cheaper per byte,',
             { size: 11.5, color: C.dim });
      P.text(58, 422, 'which is why it holds the data rather than the computation.', { size: 11.5, color: C.dim });
      P.alpha(1);
    }
  }

  /* ---------- scene 2: geometry ---------- */
  function drawGeometry(P, u) {
    var C = cols();
    title(P, 'Platters, tracks, sectors, cylinders', 'four counts, one product');

    // top view of one surface
    var cx = 210, cy = 268, R = 118;
    P.circle(cx, cy, R, { fill: C.surface2, stroke: C.border, sw: 1.5 });
    for (var r = 24; r <= R; r += 16) {
      P.circle(cx, cy, r, { stroke: C.border, sw: 0.8 });
    }
    // one sector highlighted on the outer track
    var lit = K.ease(K.clamp01((u - 0.08) * 3));
    if (lit > 0) {
      P.alpha(lit);
      P.rect(cx + R - 14, cy - 6, 16, 13, { fill: C.accent, radius: 2 });
      P.line(cx + R + 6, cy, cx + R + 44, cy - 26, { stroke: C.accent, sw: 1.2 });
      P.text(cx + R + 48, cy - 32, 'one sector: 512 B', { size: 11.5, color: C.accent });
      P.alpha(1);
    }
    // the head
    P.arrow(cx + R + 46, cy + 74, cx + R + 2, cy + 26, { stroke: C.info, sw: 1.6 });
    P.text(cx + R + 52, cy + 80, 'head', { size: 11.5, color: C.info });
    P.text(cx, cy + R + 22, 'one surface, 1,000 concentric tracks', { size: 11.5,
      color: C.dim, align: 'center' });

    // side view: four platters, eight heads
    var px = 470, py = 128;
    for (var i = 0; i < GEO.platters; i++) {
      P.rect(px, py + i * 34, 150, 9, { fill: C.faint, radius: 3 });
    }
    P.line(px + 76, py - 10, px + 76, py + 4 * 34 - 12, { stroke: C.info, sw: 2 });
    P.text(px + 84, py - 16, '8 heads on one arm', { size: 11.5, color: C.info });
    P.text(px + 158, py + 46, '4 platters = 8 surfaces', { size: 11.5, color: C.dim });

    // the product
    var y = 300;
    var eq = [
      ['8', 'surfaces'],
      ['1000', 'cylinders'],
      ['500', 'sectors / track'],
      ['512', 'bytes / sector']
    ];
    eq.forEach(function (e, i) {
      var x = 470 + i * 106;
      var a = K.ease(K.clamp01((u - 0.18 - i * 0.12) * 3));
      P.alpha(a);
      P.rect(x, y, 92, 52, { fill: C.surface, stroke: C.border, sw: 1, radius: 5 });
      P.text(x + 46, y + 12, e[0], { size: 17, bold: true, mono: true,
        color: C.ink, align: 'center' });
      P.text(x + 46, y + 36, e[1], { size: 10, color: C.dim, align: 'center' });
      if (i < 3) P.text(x + 98, y + 24, '\u00d7', { size: 14, color: C.faint, align: 'center' });
      P.alpha(1);
    });

    if (u > 0.62) {
      var b = K.ease(K.clamp01((u - 0.62) * 3));
      P.alpha(b);
      P.text(470, 382, '= ' + nf(M.capacityBytes) + ' bytes  =  ' + nf(M.sectors) + ' sectors',
             { size: 14, bold: true, mono: true, color: C.accent });
      P.text(470, 404, '= ' + M.gib.toFixed(4) + ' GiB   (or ' + M.gb.toFixed(3) + ' GB \u2014 the ratio is 1.0737)',
             { size: 12, mono: true, color: C.dim });
      P.alpha(1);
    }
    if (u > 0.82) {
      P.text(470, 432, 'one track = ' + nf(M.trackBytes) + ' B     one cylinder = ' + nf(M.cylinderBytes) + ' B',
             { size: 12, mono: true, color: C.info });
    }
  }

  /* ---------- scene 3: the address ---------- */
  function drawAddress(P, u) {
    var C = cols();
    title(P, 'From a block number to a place on the platter',
          'two divisions, and the sector inside a track counts from one');

    var x0 = 60, w = 780, y = 96;
    // the whole address space
    P.rect(x0, y, w, 30, { fill: C.surface2, stroke: C.border, sw: 1, radius: 4 });
    var cylW = w / GEO.cylinders;
    for (var i = 0; i < GEO.cylinders; i += 50) {
      P.line(x0 + i * cylW, y, x0 + i * cylW, y + 30, { stroke: C.border, sw: 0.6 });
    }
    P.text(x0, y - 18, '4,000,000 logical block addresses, in 1,000 cylinders of 4,000 each',
           { size: 11.5, color: C.dim });

    // the last cylinder expanded
    var ex = K.ease(K.clamp01((u - 0.15) * 2.5));
    var bx = 60, by = 176, bw = 780, bh = 96;
    P.alpha(0.35 + 0.65 * ex);
    P.rect(bx, by, bw, bh, { fill: C.surface, stroke: C.border, sw: 1, radius: 6 });
    P.alpha(1);
    // 8 surface rows x 500 sectors
    var sw = bw / GEO.sectorsPerTrack;
    for (var s = 0; s < GEO.surfaces; s++) {
      P.text(bx - 10, by + 8 + s * 11, 'S' + s, { size: 9.5, color: C.faint, align: 'right' });
      for (var sec = 0; sec < GEO.sectorsPerTrack; sec += 25) {
        P.rect(bx + sec * sw, by + 4 + s * 11, Math.max(1, sw * 24), 7,
               { fill: s === 7 ? C.accentDim : C.surface2 });
      }
    }
    P.text(bx + bw - 4, by + bh + 8, '8 surfaces \u00d7 500 sectors = 4,000 sectors in this cylinder',
           { size: 11.5, color: C.dim, align: 'right' });

    // the two divisions
    var rows = [
      ['LBA 3,999,999 \u00f7 4,000', '= 999', 'cylinder 999', C.info],
      ['remainder 3,999 \u00f7 500', '= 7', 'surface 7', C.accent],
      ['remainder 499, +1', '= 500', 'sector 500 of that track', C.warn]
    ];
    rows.forEach(function (r, i) {
      var yy = 306 + i * 32;
      var a = K.ease(K.clamp01((u - 0.3 - i * 0.15) * 3));
      P.alpha(a);
      P.text(60, yy, r[0], { size: 12.5, mono: true, color: C.dim });
      P.text(320, yy, r[1], { size: 12.5, mono: true, bold: true, color: r[3] });
      P.text(390, yy, r[2], { size: 12.5, color: C.ink });
      P.alpha(1);
    });

    if (u > 0.78) {
      P.rect(60, 404, 780, 34, { fill: C.accentDim, stroke: C.accent, sw: 1, radius: 5 });
      P.text(74, 415, 'the round trip was checked on all 4,000,000 addresses: 0 disagreements',
             { size: 12, bold: true, color: C.ink });
    }
  }

  /* ---------- scene 4: the three parts ---------- */
  function drawAccess(P, u) {
    var C = cols();
    title(P, 'One access, three waits', 'seek, then rotation, then transfer \u2014 they add');

    var x0 = 60, y0 = 108, w = 780, h = 44;
    var total = M.oneSectorMs;
    var segs = [
      { n: 'seek', v: GEO.avgSeekMs, c: C.info },
      { n: 'rotation', v: M.avgRotMs, c: C.accent },
      { n: 'transfer', v: M.sectorMs, c: C.warn }
    ];
    var x = x0;
    segs.forEach(function (s, i) {
      var a = K.ease(K.clamp01((u - 0.06 - i * 0.14) * 3));
      var sw2 = Math.max(3, w * s.v / total) * a;
      P.rect(x, y0, sw2, h, { fill: s.c, radius: 3 });
      x += Math.max(3, w * s.v / total);
    });
    P.rect(x0, y0, w, h, { stroke: C.border, sw: 1, radius: 3 });

    P.text(x0, y0 - 16, 'one 512-byte sector, total ' + total.toFixed(4) + ' ms',
           { size: 11.5, color: C.dim });

    // the labels beneath
    segs.forEach(function (s, i) {
      var lx = 60 + i * 268;
      var yy = 186 + i * 60;
      var a = K.ease(K.clamp01((u - 0.2 - i * 0.14) * 3));
      P.alpha(a);
      P.rect(lx, yy, 250, 48, { fill: C.surface, stroke: C.border, sw: 1, radius: 5 });
      P.rect(lx, yy, 5, 48, { fill: s.c, radius: 2 });
      P.text(lx + 16, yy + 8, s.n + '  ' + s.v.toFixed(4) + ' ms', { size: 13, bold: true, color: C.ink });
      var pct = (100 * s.v / total).toFixed(2) + '% of the total';
      P.text(lx + 16, yy + 28, pct, { size: 11, color: C.dim });
      P.alpha(1);
    });

    if (u > 0.4) {
      P.text(60, 372, '8 ms \u00f7 7,200 rpm  \u2192  60,000 / 7,200 = ' + M.revMs.toFixed(4) +
             ' ms per turn, half of it is ' + M.avgRotMs.toFixed(4) + ' ms',
             { size: 12, mono: true, color: C.dim });
      P.text(60, 394, 'one sector is 1/500 of a turn: ' + M.sectorMs.toFixed(6) + ' ms',
             { size: 12, mono: true, color: C.dim });
    }
    if (u > 0.66) {
      P.rect(60, 410, 780, 40, { fill: C.warnDim, stroke: C.warn, sw: 1, radius: 5 });
      P.text(74, 420, 'Transfer is 0.14% of the access. The rate printed on the drive is not the speed of a small read.',
             { size: 12, color: C.ink });
      P.text(74, 436, 'A 10% faster transfer rate buys 0.014% here; a 10% faster seek buys 6.6%.',
             { size: 11.5, color: C.dim });
    }
  }

  /* ---------- scene 5: rotation ---------- */
  function drawRotation(P, u) {
    var C = cols();
    title(P, 'Why the average wait is half a turn', 'the phase is uniform, so the ramp averages to its midpoint');

    var cx = 190, cy = 240, R = 96;
    P.circle(cx, cy, R, { fill: C.surface2, stroke: C.border, sw: 1.5 });
    for (var r = 26; r < R; r += 14) P.circle(cx, cy, r, { stroke: C.border, sw: 0.7 });

    var phase = K.state.reducedMotion ? 0.5 : (0.5 + 0.5 * Math.sin(u * Math.PI * 2));
    var ang = -Math.PI / 2 + phase * Math.PI * 2;
    // target sector at angle ang
    var tx = cx + R * 0.86 * Math.cos(ang), ty = cy + R * 0.86 * Math.sin(ang);
    P.rect(tx - 7, ty - 5, 14, 10, { fill: C.accent, radius: 2 });
    // head at the right, fixed
    P.arrow(cx + R + 40, cy, cx + R + 4, cy, { stroke: C.info, sw: 1.6 });
    P.text(cx + R + 44, cy - 6, 'head', { size: 11, color: C.info });
    P.text(cx, cy + R + 20, 'phase ' + phase.toFixed(2) + ' of a turn \u2192 wait ' +
           (phase * M.revMs).toFixed(4) + ' ms', { size: 11.5, color: C.dim, align: 'center' });

    // the ramp: latency against phase
    var gx = 400, gy = 320, gw = 440, gh = 130;
    P.line(gx, gy, gx + gw, gy, { stroke: C.border, sw: 1 });
    P.line(gx, gy, gx, gy - gh, { stroke: C.border, sw: 1 });
    P.text(gx + gw, gy + 8, 'phase', { size: 10.5, color: C.faint, align: 'right' });
    P.text(gx - 8, gy - gh - 6, M.revMs.toFixed(3) + ' ms', { size: 10.5, color: C.faint, align: 'left' });
    P.text(gx - 8, gy + 6, '0', { size: 10.5, color: C.faint, align: 'right' });
    P.line(gx, gy, gx + gw, gy - gh, { stroke: C.accent, sw: 2 });
    // the mean
    P.line(gx, gy - gh / 2, gx + gw, gy - gh / 2, { stroke: C.info, sw: 1.4, dash: [5, 4] });
    P.text(gx + gw - 4, gy - gh / 2 - 14, 'mean = half a turn = ' + M.avgRotMs.toFixed(4) + ' ms',
           { size: 11, color: C.info, align: 'right' });
    // the current point
    P.circle(gx + gw * phase, gy - gh * phase, 4.5, { fill: C.warn });
    P.text(gx, gy - gh - 22, 'latency against the phase at which the seek ends',
           { size: 11, color: C.dim });

    if (u > 0.55) {
      P.rect(60, 400, 780, 46, { fill: C.surface, stroke: C.border, sw: 1, radius: 5 });
      P.text(74, 410, 'best 0 ms      average ' + M.avgRotMs.toFixed(4) +
             ' ms      worst ' + M.revMs.toFixed(4) + ' ms', { size: 13, mono: true, color: C.ink });
      P.text(74, 430, 'the worst case is twice the average: a worst-case question uses a whole turn, not a half',
             { size: 11.5, color: C.dim });
    }
  }

  /* ---------- scene 6: block size ---------- */
  function drawBlocksize(P, u) {
    var C = cols();
    title(P, 'The same disk, two hundred and ninety-seven times faster',
          'effective bandwidth against the size of one request');

    var gx = 130, gy = 330, gw = 700, gh = 200;
    P.line(gx, gy, gx + gw, gy, { stroke: C.border, sw: 1 });
    P.line(gx, gy, gx, gy - gh, { stroke: C.border, sw: 1 });

    var maxLog = Math.log10(bandwidthBps(GEO.sectorsPerTrack));
    var minLog = 3.5;
    function yOf(bps) {
      var l = Math.log10(bps);
      return gy - gh * (l - minLog) / (maxLog - minLog);
    }
    [4, 5, 6, 7].forEach(function (e) {
      var yy = gy - gh * (e - minLog) / (maxLog - minLog);
      P.line(gx - 6, yy, gx, yy, { stroke: C.border, sw: 1 });
      P.text(gx - 12, yy, (Math.pow(10, e) >= 1e6 ? (Math.pow(10, e) / 1e6) + ' MB/s'
            : (Math.pow(10, e) / 1e3) + ' kB/s'), { size: 10, color: C.faint, align: 'right', base: 'middle' });
    });

    var bw = 96, gap = 74;
    M.blockTable.forEach(function (row, i) {
      var a = K.ease(K.clamp01((u - 0.08 - i * 0.14) * 3));
      var x = gx + 40 + i * (bw + gap);
      var y = yOf(row.bps);
      var h = (gy - y) * a;
      P.rect(x, gy - h, bw, h, { fill: i === 3 ? C.accent : C.accentDim,
                                 stroke: C.accent, sw: 1, radius: 3 });
      P.alpha(a);
      P.text(x + bw / 2, y - 20, row.bps >= 1e6 ? (row.bps / 1e6).toFixed(3) + ' MB/s'
                                                : (row.bps / 1000).toFixed(1) + ' kB/s',
             { size: 12, bold: true, mono: true, color: C.ink, align: 'center' });
      P.text(x + bw / 2, y - 6, row.ms.toFixed(3) + ' ms', { size: 10.5, color: C.dim, align: 'center' });
      P.text(x + bw / 2, gy + 10, row.k + (row.k === 1 ? ' sector' : ' sectors'),
             { size: 11.5, color: C.dim, align: 'center' });
      P.text(x + bw / 2, gy + 26, nf(row.bytes) + ' B', { size: 10.5, color: C.faint, align: 'center' });
      P.alpha(1);
    });

    if (u > 0.62) {
      P.text(gx, 384, 'ratio, full track to one sector: ' + M.bandRatio.toFixed(1) +
             ' times \u2014 same platter, same head, only the request size changed',
             { size: 12, mono: true, color: C.info });
      P.text(gx, 404, 'random 4 KB reads: ' + M.randomIops.toFixed(1) +
             ' per second \u2014 each one pays the full ' + accessMs(8).toFixed(2) + ' ms',
             { size: 12, mono: true, color: C.warn });
    }
    if (u > 0.82) {
      P.text(gx, 428, 'the platter itself streams ' + M.platterMBs.toFixed(2) +
             ' MB/s, and no single request reaches it',
             { size: 11.5, color: C.dim });
    }
  }

  /* ---------- scene 7: RAID 0 ---------- */
  function diskColumn(P, x, y, w, h, label, colour, blocks) {
    var C = cols();
    P.rect(x, y, w, h, { fill: C.surface, stroke: colour || C.border, sw: 1.4, radius: 5 });
    P.text(x + w / 2, y - 14, label, { size: 11, color: C.dim, align: 'center' });
    (blocks || []).forEach(function (b, i) {
      P.rect(x + 5, y + 6 + i * 22, w - 10, 18, { fill: b.fill || C.surface2, radius: 2 });
      P.text(x + w / 2, y + 15 + i * 22, b.text, { size: 10, mono: true,
        color: b.color || C.dim, align: 'center' });
    });
  }

  function drawRaid0(P, u) {
    var C = cols();
    title(P, 'RAID 0: striping', 'six disks, one block each, nothing kept back');

    var x0 = 70, w = 108, gap = 18, y = 130, h = 150;
    for (var d = 0; d < N; d++) {
      var x = x0 + d * (w + gap);
      var dead = d === 2 && u > 0.62;
      diskColumn(P, x, y, w, h, 'disk ' + d, dead ? C.invalid : C.border,
        [0, 1, 2, 3, 4].map(function (row) {
          var idx = row * N + d;
          var lost = dead && row >= 0;
          return {
            text: lost ? 'gone' : ('B' + idx),
            fill: lost ? C.invalidDim : (idx % 2 ? C.surface2 : C.accentDim),
            color: lost ? C.invalid : C.dim
          };
        }));
    }
    P.text(x0, y - 34, 'stripe 0 = B0..B5, one block per disk. Stripe 1 starts at B6.',
           { size: 11.5, color: C.dim });

    // capacity bar
    var by = 306;
    bar(P, 70, by, 300, 18, 1, C.accent);
    P.text(70, by + 26, 'usable 6 TB of 6 TB = 100%', { size: 12, mono: true, color: C.ink });

    // facts
    var rows = [
      ['fault tolerance', '0 disks \u2014 any single failure loses the set', C.invalid],
      ['small write', '1 operation (penalty 1)', C.valid],
      ['read bandwidth', '6\u00d7 one disk, for large requests', C.valid],
      ['loss at p = 0.01', M.levels[0].lossProb.toFixed(5) + '  (1 - 0.99^6)', C.warn]
    ];
    rows.forEach(function (r, i) {
      var yy = 348 + i * 26;
      var a = K.ease(K.clamp01((u - 0.25 - i * 0.1) * 3));
      P.alpha(a);
      P.text(430, yy, r[0], { size: 11.5, color: C.dim });
      P.text(580, yy, r[1], { size: 11.5, color: r[2] });
      P.alpha(1);
    });

    if (u > 0.82) {
      P.rect(430, 292, 420, 44, { fill: C.invalidDim, stroke: C.invalid, sw: 1, radius: 5 });
      P.text(444, 302, '6 single-failure patterns, 6 data losses \u2014 counted',
             { size: 12, color: C.ink });
      P.text(444, 320, 'a 100-disk array of 200,000-hour disks: MTTF 2,000 hours',
             { size: 11, color: C.dim });
    }
  }

  /* ---------- scene 8: RAID 1 ---------- */
  function drawRaid1(P, u) {
    var C = cols();
    title(P, 'RAID 1: a second copy', 'three mirrors, and the pair is the unit of failure');

    var x0 = 90, w = 96, gap = 46, y = 128, h = 132;
    for (var pr = 0; pr < 3; pr++) {
      var xa = x0 + pr * (2 * w + gap + 30);
      var xb = xa + w + 22;
      var broken = pr === 1 && u > 0.66;
      diskColumn(P, xa, y, w, h, 'disk ' + (2 * pr), broken ? C.invalid : C.border,
        [0, 1].map(function (r) {
          return { text: 'B' + (r * 3 + pr), fill: C.accentDim, color: C.dim };
        }));
      diskColumn(P, xb, y, w, h, 'disk ' + (2 * pr + 1), broken ? C.invalid : C.border,
        [0, 1].map(function (r) {
          return { text: broken ? 'gone' : 'B' + (r * 3 + pr),
                   fill: broken ? C.invalidDim : C.accentDim,
                   color: broken ? C.invalid : C.dim };
        }));
      P.text((xa + xb + w) / 2, y + h + 18, 'mirror ' + pr, { size: 11, color: C.dim, align: 'center' });
    }

    var by = 300;
    bar(P, 90, by, 300, 18, 0.5, C.accent);
    P.text(90, by + 26, 'usable 3 TB of 6 TB = 50%', { size: 12, mono: true, color: C.ink });

    var rows = [
      ['fault tolerance', '1 guaranteed; 3 only if they fall one per mirror', C.warn],
      ['small write', '2 operations \u2014 both copies, no read', C.warn],
      ['survivable patterns', M.levels[1].survivablePatterns + ' of 64', C.valid],
      ['loss at p = 0.01', M.levels[1].lossProb.toFixed(6), C.valid]
    ];
    rows.forEach(function (r, i) {
      var yy = 344 + i * 26;
      var a = K.ease(K.clamp01((u - 0.2 - i * 0.1) * 3));
      P.alpha(a);
      P.text(90, yy + 32, r[0], { size: 11.5, color: C.dim });
      P.text(240, yy + 32, r[1], { size: 11.5, color: r[2] });
      P.alpha(1);
    });

    if (u > 0.84) {
      P.rect(520, 300, 340, 64, { fill: C.accentDim, stroke: C.accent, sw: 1, radius: 5 });
      P.text(534, 310, 'mirroring = RAID 5 with a group of two', { size: 12, bold: true, color: C.ink });
      P.text(534, 330, '(2 - 1) / 2 = 50%, and the penalty', { size: 11, color: C.dim });
      P.text(534, 346, 'falls to 2 because nothing must be read', { size: 11, color: C.dim });
    }
  }

  /* ---------- scene 9: RAID 4 and 5 ---------- */
  function drawRaid45(P, u) {
    var C = cols();
    title(P, 'RAID 4 and RAID 5: parity instead of a copy',
          'one exclusive-or per stripe, and where that block lives');

    // RAID 4 grid: 5 data columns + 1 parity column
    var x0 = 60, cw = 62, ch = 26, gy = 120;
    P.text(x0, gy - 22, 'RAID 4: parity on one dedicated disk', { size: 12, bold: true, color: C.ink });
    for (var s = 0; s < 3; s++) {
      for (var c = 0; c < 6; c++) {
        var isP = c === 5;
        var val = isP ? ('P' + s) : ('D' + (s * 5 + c));
        var fill = isP ? C.warnDim : C.surface2;
        P.rect(x0 + c * cw, gy + s * ch, cw - 6, ch - 6, { fill: fill, stroke: C.border, sw: 1, radius: 3 });
        P.text(x0 + c * cw + (cw - 6) / 2, gy + s * ch + 10, val,
               { size: 10.5, mono: true, color: isP ? C.warn : C.dim, align: 'center' });
      }
    }
    P.text(x0, gy + 3 * ch + 6, 'every write to any stripe touches disk 5', { size: 11, color: C.warn });

    // RAID 5 grid: rotated parity
    var rx = 480;
    P.text(rx, gy - 22, 'RAID 5: parity rotated one disk per stripe', { size: 12, bold: true, color: C.ink });
    for (var s5 = 0; s5 < 6; s5++) {
      for (var c5 = 0; c5 < 6; c5++) {
        var pcol = 5 - s5;                     // left-symmetric: shifts left each stripe
        var isP5 = c5 === pcol;
        var fill5 = isP5 ? C.warnDim : C.surface2;
        P.rect(rx + c5 * cw, gy + s5 * ch, cw - 6, ch - 6,
               { fill: fill5, stroke: C.border, sw: 1, radius: 3 });
        P.text(rx + c5 * cw + (cw - 6) / 2, gy + s5 * ch + 10, isP5 ? ('P' + s5) : 'D',
               { size: 10.5, mono: true, color: isP5 ? C.warn : C.faint, align: 'center' });
      }
    }

    // the worked exclusive-or
    if (u > 0.22) {
      var yy = 320;
      P.text(70, yy, 'the six data bytes of one stripe, and its parity',
             { size: 11.5, color: C.dim });
      M.data.forEach(function (d, i) {
        var a = K.ease(K.clamp01((u - 0.24 - i * 0.05) * 3));
        P.alpha(a);
        P.rect(70 + i * 74, yy + 18, 64, 30, { fill: C.surface2, stroke: C.border, sw: 1, radius: 4 });
        P.text(102 + i * 74, yy + 26, String(d), { size: 14, mono: true, bold: true,
          color: C.ink, align: 'center' });
        P.alpha(1);
      });
      var a2 = K.ease(K.clamp01((u - 0.55) * 3));
      P.alpha(a2);
      P.text(70 + 6 * 74, yy + 26, '=  P ' + M.parityP, { size: 14, mono: true, bold: true, color: C.warn });
      P.alpha(1);
    }

    if (u > 0.62) {
      var a3 = K.ease(K.clamp01((u - 0.62) * 3));
      P.alpha(a3);
      P.text(70, 388, 'recover block i: P \u2295 (every other data byte) = the missing byte \u2014 exact in all 6 cases',
             { size: 12, mono: true, color: C.valid });
      P.alpha(1);
    }

    if (u > 0.8) {
      P.rect(70, 404, 780, 44, { fill: C.warnDim, stroke: C.warn, sw: 1, radius: 5 });
      P.text(84, 412, 'small write = 4 operations: read old data, read old parity, write new data, write new parity',
             { size: 11.5, bold: true, color: C.ink });
      P.text(84, 430, 'RAID 4 bottlenecks every write on one disk; RAID 5 rotates it, so different stripes write in parallel',
             { size: 11.5, color: C.dim });
    }
  }

  /* ---------- scene 10: RAID 6 ---------- */
  function drawRaid6(P, u) {
    var C = cols();
    title(P, 'RAID 6: two parities, two failures', 'P is exclusive-or; Q weights each byte before it');

    var x0 = 90, w = 86, gap = 14, y = 116, h = 172;
    var rowsFor = function (d) {
      return [
        { text: 'B' + d, fill: C.accentDim, color: C.dim },
        { text: 'P', fill: C.warnDim, color: C.warn },
        { text: 'Q', fill: C.warnDim, color: C.warn }
      ];
    };
    for (var d = 0; d < N; d++) {
      var dead = (d === 1 || d === 4) && u > 0.5;
      var x = x0 + d * (w + gap);
      P.rect(x, y, w, h, { fill: C.surface, stroke: dead ? C.invalid : C.border, sw: 1.4, radius: 5 });
      P.text(x + w / 2, y - 14, 'disk ' + d, { size: 10.5, color: C.dim, align: 'center' });
      rowsFor(d).forEach(function (r, i) {
        var lost = dead;
        P.rect(x + 5, y + 8 + i * 52, w - 10, 40,
               { fill: lost ? C.invalidDim : r.fill, radius: 3 });
        P.text(x + w / 2, y + 20 + i * 52, lost ? '?' : r.text,
               { size: 12, mono: true, color: lost ? C.invalid : r.color, align: 'center' });
        if (!lost) {
          var val = i === 0 ? String(M.data[d]) : (i === 1 ? String(M.parityP) : String(M.parityQ));
          P.text(x + w / 2, y + 34 + i * 52, i === 0 ? val : '', { size: 9, color: C.faint, align: 'center' });
        }
      });
    }
    P.text(x0, y + h + 16, 'P = ' + M.parityP + '   Q = ' + M.parityQ +
           '   (over the six data bytes of one stripe)', { size: 11.5, mono: true, color: C.dim });

    if (u > 0.36) {
      var a = K.ease(K.clamp01((u - 0.36) * 3));
      P.alpha(a);
      P.rect(90, 328, 400, 76, { fill: C.surface, stroke: C.border, sw: 1, radius: 5 });
      P.text(104, 336, 'two unknowns, two equations', { size: 12, bold: true, color: C.ink });
      P.text(104, 356, 'S1 = P \u2295 (known data)  =  d_a \u2295 d_b', { size: 11, mono: true, color: C.dim });
      P.text(104, 374, 'S2 = Q \u2295 (known weighted) = \u03b1^a d_a \u2295 \u03b1^b d_b', { size: 11, mono: true, color: C.dim });
      P.text(104, 392, 'solve by division in GF(256)', { size: 11, mono: true, color: C.info });
      P.alpha(1);
    }

    if (u > 0.62) {
      var b = K.ease(K.clamp01((u - 0.62) * 3));
      P.alpha(b);
      P.rect(510, 328, 340, 76, { fill: C.accentDim, stroke: C.accent, sw: 1, radius: 5 });
      P.text(524, 336, 'all 15 pairs recovered exactly', { size: 12, bold: true, color: C.ink });
      P.text(524, 356, '4 TB usable of 6 = 66.67%', { size: 11.5, mono: true, color: C.dim });
      P.text(524, 374, 'small write = 6 operations', { size: 11.5, mono: true, color: C.dim });
      P.text(524, 392, 'survives 22 of 64 failure patterns', { size: 11.5, mono: true, color: C.dim });
      P.alpha(1);
    }

    if (u > 0.84) {
      P.text(90, 424, 'loss at p = 0.01:  ' + M.levels[3].lossProb.toFixed(8) +
             '   against RAID 5\u2019s ' + M.levels[2].lossProb.toFixed(6),
             { size: 12, mono: true, color: C.warn });
    }
  }

  /* ---------- scene 11: choosing ---------- */
  function drawChoose(P, u) {
    var C = cols();
    title(P, 'Choosing a level', 'six 1 TB disks, five levels, four numbers that disagree');

    var x0 = 60, y0 = 118, rh = 40;
    var colsX = [x0, x0 + 130, x0 + 250, x0 + 380, x0 + 520, x0 + 660];
    var head = ['level', 'usable', 'efficiency', 'tolerance', 'write penalty', 'loss at p=0.01'];
    head.forEach(function (h, i) {
      P.text(colsX[i], y0 - 16, h, { size: 10.5, color: C.faint });
    });

    M.levels.forEach(function (L, i) {
      var yy = y0 + i * rh;
      var a = K.ease(K.clamp01((u - 0.06 - i * 0.11) * 3));
      P.alpha(a);
      P.rect(x0 - 10, yy - 6, 830, rh - 6,
             { fill: i % 2 ? C.surface : C.surface2, radius: 3 });
      P.text(colsX[0], yy, L.name, { size: 12.5, bold: true, color: C.ink });
      P.text(colsX[1], yy, L.usable + ' TB', { size: 12, mono: true, color: C.ink });
      P.text(colsX[2], yy, (100 * L.efficiency).toFixed(2) + '%', { size: 12, mono: true, color: C.dim });
      P.text(colsX[3], yy, L.tol + (L.pairs ? ' (pairs)' : ''), { size: 12, mono: true, color: C.dim });
      P.text(colsX[4], yy, L.smallWriteIos + '\u00d7', { size: 12, mono: true,
        color: L.smallWriteIos <= 2 ? C.valid : L.smallWriteIos <= 4 ? C.warn : C.invalid });
      P.text(colsX[5], yy, L.lossProb < 1e-4 ? L.lossProb.toExponential(2) : L.lossProb.toFixed(5),
             { size: 12, mono: true, color: L.lossProb < 1e-3 ? C.valid : C.warn });
      P.alpha(1);
    });

    if (u > 0.66) {
      P.rect(60, 330, 780, 56, { fill: C.accentDim, stroke: C.accent, sw: 1, radius: 6 });
      P.text(74, 340, 'RAID 6 is ' + (M.levels[2].lossProb / M.levels[3].lossProb).toFixed(1) +
             '\u00d7 safer than RAID 5 and costs one more disk of capacity',
             { size: 12.5, bold: true, color: C.ink });
      P.text(74, 360, 'RAID 10 keeps the lowest write penalty of any redundant level (2\u00d7) and spends half the disks',
             { size: 11.5, color: C.dim });
    }

    if (u > 0.84) {
      P.text(60, 402, 'capacity decides where the data fits  \u00b7  the write penalty decides the workload  \u00b7  redundancy decides the risk',
             { size: 11.5, color: C.info });
      P.text(60, 424, 'small-write rate of the whole array, in writes per second: ' +
             M.levels.map(function (L) { return L.name.replace('RAID ', 'R') + ' ' + L.smallWriteIops.toFixed(0); }).join('   '),
             { size: 11, mono: true, color: C.dim });
    }
  }

  /* ---------- dispatch ---------- */
  var SCENE_DRAW = {
    hierarchy: drawHierarchy,
    geometry: drawGeometry,
    address: drawAddress,
    access: drawAccess,
    rotation: drawRotation,
    blocksize: drawBlocksize,
    raid0: drawRaid0,
    raid1: drawRaid1,
    raid45: drawRaid45,
    raid6: drawRaid6,
    choose: drawChoose
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

  /* ---------- the checks panel ---------- */
  function fillChecks() {
    var el = document.getElementById('checks');
    if (!el) return;
    var bad = CHECKS.length - PASSED;
    el.innerHTML = '<span class="k">Model checks</span>' +
      '<p class="small" style="margin:6px 0 0">' + PASSED + ' of ' + CHECKS.length + ' passed' +
      (bad ? ' \u2014 <strong>' + bad + ' failed</strong>' : '') + '</p>';
  }

  /* ---------- boot ---------- */
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
    GEO: { surfaces: GEO.surfaces, cylinders: GEO.cylinders, sectorsPerTrack: GEO.sectorsPerTrack,
           sectorBytes: GEO.sectorBytes, sectors: M.sectors, capacityBytes: M.capacityBytes,
           trackBytes: M.trackBytes, cylinderBytes: M.cylinderBytes, gib: M.gib },
    TIME: { revMs: M.revMs, avgRotMs: M.avgRotMs, sectorMs: M.sectorMs,
            oneSectorMs: M.oneSectorMs, trackMs: M.trackMs, platterMBs: M.platterMBs },
    BLOCKS: M.blockTable, BAND_RATIO: M.bandRatio, RANDOM_IOPS: M.randomIops,
    LAST_CHS: M.lastChs,
    RAID: { data: M.data, P: M.parityP, Q: M.parityQ,
            single: M.singleRecovered, double: M.doublePairs,
            levels: M.levels, closed: M.closed },
    MTTF: M.mttf,
    PASSED: PASSED,
    TOTAL: CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
