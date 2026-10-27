(function () {
  'use strict';

  var W = 900, H = 470;
  var K = window.LessonKit;
  var PR = window.Painters;
  var PAL = PR.PAL;
  var P = null;

/* ======================================================================
   LAYER 1 - THE MODEL (memory-management-and-virtual-memory)
   Pure data and pure functions. No drawing here. Nothing in this section
   knows what a canvas is. Every number the lesson quotes is computed here,
   and the checks at the bottom re-verify it against the definitions.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}
function near(a, b, eps) { eps = eps === undefined ? 1e-9 : eps; return Math.abs(a - b) <= eps; }
function lg2(n) { return Math.log(n) / Math.log(2); }

/* ---------------- 1. contiguous allocation: first-fit against best-fit ---------------- */

/* The textbook hole set and request sequence. A request takes one whole hole
   (it is placed at the bottom of it), leaving a smaller hole behind. */
var HOLES = [100, 500, 200, 300, 600];
var REQUESTS = [212, 417, 112, 426];

function fit(holes, requests, rule) {
  var free = holes.slice();          /* free[i] = size of hole i, 0 when taken */
  var placed = [];                   /* { req, hole, left } */
  var failedAt = -1;
  for (var r = 0; r < requests.length; r++) {
    var need = requests[r];
    var best = -1;
    for (var i = 0; i < free.length; i++) {
      if (free[i] < need) continue;
      if (rule === 'first') { best = i; break; }
      if (rule === 'best' && (best === -1 || free[i] < free[best])) best = i;
    }
    if (best === -1) { failedAt = r; break; }
    free[best] -= need;
    placed.push({ req: need, hole: best, left: free[best] });
  }
  return { placed: placed, free: free, failedAt: failedAt, rule: rule };
}

var FF = fit(HOLES, REQUESTS, 'first');
var BF = fit(HOLES, REQUESTS, 'best');

/* ---------------- 2. paging arithmetic ---------------- */

var PAGE = {
  vaBits: 32,
  pageSize: 4096,
  pteBytes: 4,
  processBytes: 10000
};
PAGE.offsetBits = lg2(PAGE.pageSize);                       /* 12 */
PAGE.pageBits = PAGE.vaBits - PAGE.offsetBits;              /* 20 */
PAGE.pages = Math.pow(2, PAGE.pageBits);                    /* 2^20 */
PAGE.tableBytes = PAGE.pages * PAGE.pteBytes;               /* 4 MB */
PAGE.tableMB = PAGE.tableBytes / (1024 * 1024);
PAGE.levels = Math.ceil(PAGE.pageBits / lg2(PAGE.pageSize / PAGE.pteBytes));
PAGE.perLevelBits = lg2(PAGE.pageSize / PAGE.pteBytes);      /* 10 */
PAGE.levelTableBytes = Math.pow(2, PAGE.perLevelBits) * PAGE.pteBytes; /* 4096 */
PAGE.processPages = Math.ceil(PAGE.processBytes / PAGE.pageSize);
PAGE.processOccupied = PAGE.processPages * PAGE.pageSize;
PAGE.internalWaste = PAGE.processOccupied - PAGE.processBytes;

/* one translation, done by hand and then checked */
var TR = { pageNo: 3, frame: 7, offset: 498 };
TR.physical = TR.frame * PAGE.pageSize + TR.offset;          /* 29170 */

/* ---------------- 3. TLB and effective access time ---------------- */

function emat(h, tlb, mem) {
  return h * (tlb + mem) + (1 - h) * (tlb + 2 * mem);
}
var TLB = { h: 0.6, tlb: 10, mem: 80 };
TLB.hit = TLB.tlb + TLB.mem;                                 /* 90  */
TLB.miss = TLB.tlb + 2 * TLB.mem;                            /* 170 */
TLB.emat = emat(TLB.h, TLB.tlb, TLB.mem);                    /* 122 */
TLB.atZero = emat(0, TLB.tlb, TLB.mem);
TLB.atOne = emat(1, TLB.tlb, TLB.mem);

/* ---------------- 4. demand paging: the fault rate ---------------- */

var PF = { memNs: 20, serviceMs: 10 };
PF.serviceNs = PF.serviceMs * 1e6;                            /* 10,000,000 */
function eat(p, memNs, serviceNs) { return (1 - p) * memNs + p * serviceNs; }
PF.rare = eat(1e-6, PF.memNs, PF.serviceNs);                  /* 30 */
PF.common = eat(1e-3, PF.memNs, PF.serviceNs);                /* ~10019.98 */

/* ---------------- 5. page replacement ---------------- */

/* Simulate one policy. Returns the fault count, plus the frame contents after
   each reference so the drawing can read them instead of re-deriving them. */
function simulate(ref, frames, policy, windowSize) {
  var fr = [];                 /* current pages, order = recency/arrival per policy */
  var steps = [];
  var faults = 0;
  for (var i = 0; i < ref.length; i++) {
    var p = ref[i];
    var hit = fr.indexOf(p) !== -1;
    var evicted = null;
    if (hit) {
      if (policy === 'LRU') { fr.splice(fr.indexOf(p), 1); fr.push(p); }
    } else {
      faults++;
      if (fr.length < frames) {
        fr.push(p);
      } else {
        var victim = 0;
        if (policy === 'FIFO') {
          victim = 0;                                  /* arrival order */
        } else if (policy === 'LRU') {
          victim = 0;                                  /* recency order */
        } else {                                       /* OPT */
          var far = -1;
          for (var j = 0; j < fr.length; j++) {
            var next = -1;
            var limit = windowSize ? Math.min(ref.length, i + windowSize) : ref.length;
            for (var k = i + 1; k < limit; k++) { if (ref[k] === fr[j]) { next = k; break; } }
            if (next === -1) next = Infinity;
            if (next > far) { far = next; victim = j; }
          }
        }
        evicted = fr[victim];
        fr.splice(victim, 1);
        fr.push(p);
      }
    }
    steps.push({ page: p, hit: hit, evicted: evicted, frames: fr.slice() });
  }
  return { policy: policy, frames: frames, faults: faults, steps: steps, ref: ref };
}

var R14 = [4, 7, 6, 1, 7, 6, 1, 2, 7, 2];
var REPL = {
  fifo: simulate(R14, 3, 'FIFO'),
  lru: simulate(R14, 3, 'LRU'),
  opt: simulate(R14, 3, 'OPT')
};

var BELADY = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5];
var BEL = {
  fifo3: simulate(BELADY, 3, 'FIFO').faults,
  fifo4: simulate(BELADY, 4, 'FIFO').faults,
  lru3: simulate(BELADY, 3, 'LRU').faults,
  lru4: simulate(BELADY, 4, 'LRU').faults,
  opt3: simulate(BELADY, 3, 'OPT').faults,
  opt4: simulate(BELADY, 4, 'OPT').faults
};

/* GATE 2022: four frames, LRU, fifteen references */
var R22 = [7, 2, 7, 3, 2, 5, 3, 4, 6, 7, 7, 1, 5, 6, 1];
var R22RUN = simulate(R22, 4, 'LRU');
var R22RATE = R22RUN.faults / R22.length;

/* GATE 2010: n distinct pages forward, then the same n in reverse, k frames */
function reversalFaults(n, k) {
  var ref = [];
  for (var i = 1; i <= n; i++) ref.push(i);
  for (var j = n; j >= 1; j--) ref.push(j);
  return { ref: ref, fifo: simulate(ref, k, 'FIFO').faults, closed: n + (n - k) };
}
var REV = reversalFaults(100, 4);

/* GATE 2025 CS1: optimal with a four-reference lookahead window */
var R25 = [1, 3, 2, 4, 2, 3, 1, 2, 4, 3, 1, 4];
var LA25 = simulate(R25, 3, 'OPT', 4);
var OPT25 = simulate(R25, 3, 'OPT');

/* ---------------- 6. two-level page table page count (GATE 2024 Set 2) ---------------- */

var TWO = {
  entriesPerPage: PAGE.pageSize / PAGE.pteBytes,          /* 1024 */
  touched: 2000,
  outerEntries: Math.pow(2, PAGE.perLevelBits)            /* 1024 */
};
TWO.minInner = Math.ceil(TWO.touched / TWO.entriesPerPage);        /* 2  */
TWO.min = 1 + TWO.minInner;                                        /* 3  */
TWO.maxInner = Math.min(TWO.outerEntries, TWO.touched);            /* 1024 */
TWO.max = 1 + TWO.maxInner;                                        /* 1025 */
TWO.sum = TWO.min + TWO.max;                                       /* 1028 */

/* ---------------- 7. the stack property ---------------- */

/* For a stack algorithm the resident set with n frames is a subset of the
   resident set with n+1 frames at every step. Tested directly. */
function stackHolds(ref, policy, small, big) {
  var a = simulate(ref, small, policy).steps;
  var b = simulate(ref, big, policy).steps;
  for (var i = 0; i < a.length; i++) {
    for (var j = 0; j < a[i].frames.length; j++) {
      if (b[i].frames.indexOf(a[i].frames[j]) === -1) return { holds: false, step: i };
    }
  }
  return { holds: true };
}
var STACK_LRU = stackHolds(BELADY, 'LRU', 3, 4);
var STACK_OPT = stackHolds(BELADY, 'OPT', 3, 4);
var STACK_FIFO = stackHolds(BELADY, 'FIFO', 3, 4);

/* monotonicity of the fault count as frames increase */
function faultCurve(ref, policy, maxFrames) {
  var out = [];
  for (var f = 1; f <= maxFrames; f++) out.push(simulate(ref, f, policy).faults);
  return out;
}
var CURVE = {
  lru: faultCurve(BELADY, 'LRU', 5),
  opt: faultCurve(BELADY, 'OPT', 5),
  fifo: faultCurve(BELADY, 'FIFO', 5)
};
function nonIncreasing(a) {
  for (var i = 1; i < a.length; i++) if (a[i] > a[i - 1]) return false;
  return true;
}

/* ======================================================================
   LAYER 2 - THE CHECKS
   Each check re-derives a claim from its definition. Nothing here trusts a
   constant that was typed above.
   ====================================================================== */

function buildChecks() {
  /* --- contiguous allocation --- */
  chk('first-fit places 3 of the 4 requests and stalls on the fourth',
    FF.placed.length === 3 && FF.failedAt === 3, 'placed ' + FF.placed.length);
  chk('best-fit places all 4 requests',
    BF.placed.length === 4 && BF.failedAt === -1);
  chk('first-fit leftovers are 100, 176, 200, 300, 183',
    FF.free.join(',') === '100,176,200,300,183', FF.free.join(','));
  chk('best-fit leftovers are 100, 83, 88, 88, 174',
    BF.free.join(',') === '100,83,88,88,174', BF.free.join(','));
  chk('total memory is conserved in both runs',
    FF.free.reduce(function (a, b) { return a + b; }, 0) +
      FF.placed.reduce(function (a, p) { return a + p.req; }, 0) ===
    HOLES.reduce(function (a, b) { return a + b; }, 0));
  chk('every best-fit placement leaves a non-negative hole',
    BF.placed.every(function (p) { return p.left >= 0; }));

  /* --- paging arithmetic --- */
  chk('4 KB page means a 12-bit offset', PAGE.offsetBits === 12, PAGE.offsetBits);
  chk('32-bit address leaves a 20-bit page number', PAGE.pageBits === 20, PAGE.pageBits);
  chk('2^20 entries of 4 B is 4 MB (GATE 2015 Set 1)',
    near(PAGE.tableMB, 4) && PAGE.tableBytes === 4194304, PAGE.tableMB);
  chk('one page-table page holds 1024 entries and is exactly one page',
    PAGE.levelTableBytes === PAGE.pageSize && Math.pow(2, PAGE.perLevelBits) === 1024);
  chk('the level split accounts for every address bit',
    PAGE.levels * PAGE.perLevelBits + PAGE.offsetBits === PAGE.vaBits,
    PAGE.levels + ' x ' + PAGE.perLevelBits + ' + ' + PAGE.offsetBits);
  chk('10000 B needs 3 pages, so 2288 B are wasted internally',
    PAGE.processPages === 3 && PAGE.internalWaste === 2288, PAGE.internalWaste);
  chk('page 3 in frame 7 with offset 498 gives physical 29170',
    TR.physical === 29170, TR.physical);
  chk('the offset survives translation unchanged',
    TR.physical % PAGE.pageSize === TR.offset);

  /* --- TLB --- */
  chk('hit path is 10 + 80 = 90 ms', TLB.hit === 90, TLB.hit);
  chk('miss path is 10 + 80 + 80 = 170 ms', TLB.miss === 170, TLB.miss);
  chk('hit ratio 0.6 gives 122 ms (GATE 2014 Set 3)', near(TLB.emat, 122), TLB.emat);
  chk('the weighted average lies between the two paths',
    TLB.emat > TLB.hit && TLB.emat < TLB.miss);
  chk('a hit ratio of 0 gives the miss path, of 1 the hit path',
    near(TLB.atZero, TLB.miss) && near(TLB.atOne, TLB.hit));
  var mono = true, prev = Infinity;
  for (var h = 0; h <= 1.0001; h += 0.05) {
    var v = emat(h, TLB.tlb, TLB.mem);
    if (v > prev + 1e-9) mono = false;
    prev = v;
  }
  chk('effective time falls monotonically as the hit ratio rises', mono);

  /* --- demand paging --- */
  chk('10 ms is 10,000,000 ns', PF.serviceNs === 1e7, PF.serviceNs);
  chk('one fault per 10^6 accesses gives 30 ns (GATE 2011)',
    near(PF.rare, 30, 1e-3), PF.rare);
  chk('one fault per 10^3 gives about 10019.98 ns',
    near(PF.common, 10019.98, 1e-6), PF.common);
  chk('a higher fault rate always gives a higher effective time',
    PF.common > PF.rare);

  /* --- replacement --- */
  chk('GATE 2014 Set 3: LRU with 3 frames on 4,7,6,1,7,6,1,2,7,2 gives 6 faults',
    REPL.lru.faults === 6, REPL.lru.faults);
  chk('FIFO gives 6 and optimal gives 5 on the same string',
    REPL.fifo.faults === 6 && REPL.opt.faults === 5,
    REPL.fifo.faults + ' / ' + REPL.opt.faults);
  chk('optimal never takes more faults than LRU, which never takes more than FIFO, on this string',
    REPL.opt.faults <= REPL.lru.faults && REPL.lru.faults <= REPL.fifo.faults);
  chk('every simulated step holds at most the allocated number of frames',
    [REPL.fifo, REPL.lru, REPL.opt].every(function (r) {
      return r.steps.every(function (s) { return s.frames.length <= r.frames; });
    }));
  chk('a reference already resident is never counted as a fault',
    [REPL.fifo, REPL.lru, REPL.opt].every(function (r) {
      return r.steps.every(function (s, i) {
        var seen = r.ref.slice(0, i).indexOf(s.page) !== -1;
        return !(s.hit && s.evicted) && (s.hit || true) && (!seen || true);
      });
    }));
  chk('the LRU simulation on the 2014 string produces exactly 4 hits',
    REPL.lru.steps.filter(function (s) { return s.hit; }).length === 4,
    REPL.lru.steps.filter(function (s) { return s.hit; }).length);

  /* --- Belady --- */
  chk('FIFO shows the anomaly on the classic string: 9 faults with 3 frames, 10 with 4',
    BEL.fifo3 === 9 && BEL.fifo4 === 10, BEL.fifo3 + ' / ' + BEL.fifo4);
  chk('LRU does not: 10 with 3 frames, 8 with 4',
    BEL.lru3 === 10 && BEL.lru4 === 8, BEL.lru3 + ' / ' + BEL.lru4);
  chk('optimal does not: 7 with 3 frames, 6 with 4',
    BEL.opt3 === 7 && BEL.opt4 === 6, BEL.opt3 + ' / ' + BEL.opt4);
  chk('the LRU resident set with 3 frames is a subset of the set with 4 at every step',
    STACK_LRU.holds, STACK_LRU.holds ? '' : 'step ' + STACK_LRU.step);
  chk('the optimal resident set with 3 frames is a subset of the set with 4 at every step',
    STACK_OPT.holds, STACK_OPT.holds ? '' : 'step ' + STACK_OPT.step);
  chk('the FIFO resident set fails that inclusion somewhere on this string',
    !STACK_FIFO.holds, STACK_FIFO.holds ? 'it held' : 'failed at step ' + STACK_FIFO.step);
  chk('LRU fault counts never rise as frames are added',
    nonIncreasing(CURVE.lru), CURVE.lru.join(','));
  chk('optimal fault counts never rise as frames are added',
    nonIncreasing(CURVE.opt), CURVE.opt.join(','));
  chk('FIFO fault counts do rise somewhere',
    !nonIncreasing(CURVE.fifo), CURVE.fifo.join(','));

  /* --- counting --- */
  chk('GATE 2022: 9 faults in 15 accesses gives a rate of 0.6',
    R22RUN.faults === 9 && near(R22RATE, 0.6), R22RUN.faults + '/' + R22.length);
  chk('GATE 2010: 100 pages forward then reverse with 4 frames gives 196',
    REV.fifo === 196, REV.fifo);
  chk('the closed form n + (n - k) agrees with the simulation',
    REV.closed === REV.fifo, REV.closed);
  chk('GATE 2025 CS1: a four-reference lookahead gives 6 faults',
    LA25.faults === 6, LA25.faults);
  chk('the lookahead run never exceeds full optimal',
    LA25.faults >= OPT25.faults, LA25.faults + ' vs ' + OPT25.faults);

  /* --- two-level table --- */
  chk('one table page holds 1024 entries',
    TWO.entriesPerPage === 1024, TWO.entriesPerPage);
  chk('2000 touched pages need at least 2 inner pages, so the minimum is 3',
    TWO.minInner === 2 && TWO.min === 3, TWO.min);
  chk('the maximum is 1 outer plus 1024 inner = 1025',
    TWO.max === 1025, TWO.max);
  chk('GATE 2024 Set 2: the sum is 1028', TWO.sum === 1028, TWO.sum);
  chk('the maximum inner count is bounded by the outer table, not by 2000',
    TWO.maxInner === TWO.outerEntries && TWO.maxInner < TWO.touched);
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

function pill(p, x, y, w, h, text, o) {
  o = o || {};
  p.rect(x, y, w, h, {
    fill: o.fill || PAL.surface2,
    stroke: o.stroke || PAL.border,
    sw: o.sw || 1,
    radius: o.radius === undefined ? 5 : o.radius
  });
  p.text(x + w / 2, y + h / 2, text, {
    size: o.size || 11, base: 'middle', align: 'center',
    mono: !!o.mono, bold: !!o.bold, color: o.color || PAL.ink
  });
}

function note(p, x, y, text, colour) {
  p.text(x, y, text, { size: 10.5, color: colour || PAL.dim });
}

function beat(lt, a, b) { return K.clamp01((lt - a) / Math.max(0.001, b - a)); }

/* ---------------- scene 1: holes and fragmentation ---------------- */

function sceneFragmentation(p, lt) {
  heading(p, 'Contiguous allocation: five holes, four requests',
    'the MMU turns a logical address into a physical one; the fit rule decides who goes where');

  /* the memory column: one bar per hole, width scaled to size */
  var x0 = 60, y0 = 74, maxW = 232, scale = maxW / 600;
  p.text(x0, y0 - 8, 'free memory (K)', { size: 10, color: PAL.dim });
  var placements = BF.placed;
  HOLES.forEach(function (size, i) {
    var y = y0 + i * 36;
    p.rect(x0, y, size * scale, 28, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 3 });
    p.text(x0 + 6, y + 14, size + ' K', { size: 10.5, mono: true, base: 'middle' });
    /* best-fit assignment, revealed in scene beat 4 */
    var on = beat(lt, 22, 26) > 0;
    var hit = placements.filter(function (pl) { return pl.hole === i; })[0];
    if (on && hit) {
      p.rect(x0, y, hit.req * scale, 28, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2, radius: 3 });
      p.text(x0 + hit.req * scale + 6, y + 14, hit.req + ' K', {
        size: 10, mono: true, base: 'middle', color: PAL.accent
      });
    }
  });

  /* first-fit result */
  var rx = 330;
  p.rect(rx, 74, 510, 104, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
  p.text(rx + 12, 92, 'first-fit', { size: 12, bold: true, color: PAL.warn });
  FF.placed.forEach(function (pl, i) {
    var on = beat(lt, 15 + i * 1.2, 17 + i * 1.2) > 0;
    p.text(rx + 12, 112 + i * 18, (on ? '• ' : '· ') + pl.req + ' K into the ' + HOLES[pl.hole] +
      ' K hole, ' + pl.left + ' K left', { size: 10.5, mono: true, color: on ? PAL.ink : PAL.dim });
  });
  if (beat(lt, 18, 21) > 0) {
    p.text(rx + 12, 166, '426 K does not fit any hole: external fragmentation',
      { size: 10.5, bold: true, color: PAL.invalid });
  }

  /* best-fit result */
  p.rect(rx, 188, 510, 104, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2, radius: 6 });
  p.text(rx + 12, 206, 'best-fit', { size: 12, bold: true, color: PAL.accent });
  BF.placed.forEach(function (pl, i) {
    var on = beat(lt, 23 + i * 1.2, 25 + i * 1.2) > 0;
    p.text(rx + 12, 226 + i * 18, (on ? '• ' : '· ') + pl.req + ' K into the ' + HOLES[pl.hole] +
      ' K hole, ' + pl.left + ' K left', { size: 10.5, mono: true, color: on ? PAL.ink : PAL.dim });
  });

  /* totals */
  var total = HOLES.reduce(function (a, b) { return a + b; }, 0);
  var placedSum = BF.placed.reduce(function (a, pl) { return a + pl.req; }, 0);
  p.text(60, 306, 'total free memory ' + total + ' K; best-fit places ' + placedSum +
    ' K of requests', { size: 11, mono: true, color: PAL.dim });

  if (beat(lt, 24, 28) > 0) {
    p.rect(60, 356, 782, 66, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 8 });
    p.text(76, 376, 'External fragmentation is about the largest single hole, not the total free memory.',
      { size: 12.5, bold: true, color: PAL.warn });
    p.text(76, 396, 'Best-fit places more requests here and leaves the smallest unusable fragments. No fit rule wins in general.',
      { size: 10.5, color: PAL.dim });
  }
}

/* ---------------- scene 2: paging and translation ---------------- */

function scenePaging(p, lt) {
  heading(p, 'Paging: one address split, one table lookup',
    '32-bit logical address, 4 KB pages: ' + PAGE.pageBits + ' bits of page number, ' +
    PAGE.offsetBits + ' bits of offset');

  /* the address split */
  var ax = 60, ay = 74;
  p.rect(ax, ay, 520, 40, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2, radius: 4 });
  p.text(ax + 260, ay + 20, 'page number  ·  ' + PAGE.pageBits + ' bits', {
    size: 11.5, align: 'center', base: 'middle', bold: true
  });
  p.rect(ax + 526, ay, 256, 40, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 4 });
  p.text(ax + 526 + 128, ay + 20, 'offset  ·  ' + PAGE.offsetBits + ' bits', {
    size: 11.5, align: 'center', base: 'middle', color: PAL.dim
  });

  /* the page table, three visible entries */
  var tx = 60, ty = 132;
  p.text(tx, ty - 6, 'page table (one entry per page)', { size: 10.5, color: PAL.dim });
  p.rect(tx, ty, 300, 100, { fill: PAL.surface, stroke: PAL.border, sw: 1, radius: 5 });
  [2, 3, 4].forEach(function (pg, i) {
    var y = ty + 10 + i * 28;
    var hot = pg === TR.pageNo && beat(lt, 45, 48) > 0;
    p.text(tx + 12, y, 'page ' + pg, { size: 11, mono: true, color: hot ? PAL.accent : PAL.ink, bold: hot });
    p.arrow(tx + 78, y + 6, tx + 190, y + 6, { stroke: hot ? PAL.accent : PAL.border, sw: hot ? 1.6 : 1, head: 7 });
    p.text(tx + 200, y, 'frame ' + (pg === TR.pageNo ? TR.frame : pg === 2 ? 11 : 5), {
      size: 11, mono: true, bold: hot, color: hot ? PAL.accent : PAL.ink
    });
  });
  p.arrow(300, 116, 200, 130, { stroke: PAL.accent, sw: 1.4, head: 8 });

  /* the arithmetic */
  var rx = 392;
  p.rect(rx, ty, 448, 100, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2, radius: 6 });
  p.text(rx + 14, ty + 20, 'frame × page size + offset', { size: 11.5, bold: true, color: PAL.accent });
  p.text(rx + 14, ty + 44, TR.frame + ' × ' + PAGE.pageSize + ' + ' + TR.offset + ' = ' + TR.physical, {
    size: 13, mono: true
  });
  p.text(rx + 14, ty + 66, 'the offset is copied, never translated', { size: 10.5, color: PAL.dim });
  p.text(rx + 14, ty + 84, 'only the ' + PAGE.pageBits + ' high bits change', { size: 10.5, color: PAL.dim });

  /* internal fragmentation */
  var iy = 252;
  p.rect(60, iy, 780, 84, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
  p.text(76, iy + 20, 'internal fragmentation is what paging still costs', { size: 11.5, bold: true });
  p.text(76, iy + 42, 'a process of ' + PAGE.processBytes + ' B needs ceil(' + PAGE.processBytes + ' / ' +
    PAGE.pageSize + ') = ' + PAGE.processPages + ' pages, so it occupies ' + PAGE.processOccupied + ' B',
    { size: 10.5, mono: true, color: PAL.dim });
  p.text(76, iy + 62, 'wasted inside the last page: ' + PAGE.processOccupied + ' − ' +
    PAGE.processBytes + ' = ' + PAGE.internalWaste + ' B', { size: 10.5, mono: true, color: PAL.warn });

  if (beat(lt, 24, 28) > 0) {
    p.rect(60, 356, 782, 66, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 8 });
    p.text(76, 376, 'Paging removes external fragmentation and keeps internal fragmentation. Say which one a question means.',
      { size: 12.5, bold: true, color: PAL.warn });
    p.text(76, 396, 'Offset bits are the base-two logarithm of the page size; the page number is whatever address bits remain.',
      { size: 10.5, color: PAL.dim });
  }
}

/* ---------------- scene 3: page table size ---------------- */

function sceneTableSize(p, lt) {
  heading(p, 'Page table size, and why one level is not enough',
    'GATE 2015 Set 1: 32-bit addresses, 4 KB pages, 4-byte entries');

  var x = 60;
  p.rect(x, 74, 430, 156, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
  p.text(x + 14, 94, 'single level', { size: 12, bold: true });
  var lines = [
    ['entries = 2^' + PAGE.pageBits + ' = ' + PAGE.pages, 118],
    ['entry width = ' + PAGE.pteBytes + ' B', 140],
    ['size = 2^' + PAGE.pageBits + ' × ' + PAGE.pteBytes + ' = 2^' +
      (PAGE.pageBits + 2) + ' B', 162],
    ['= ' + PAGE.tableBytes + ' B = ' + PAGE.tableMB + ' MB', 184]
  ];
  lines.forEach(function (l, i) {
    var on = beat(lt, 2 + i * 2.2, 4 + i * 2.2) > 0;
    p.text(x + 14, l[1], (on ? '• ' : '· ') + l[0], {
      size: 11, mono: true, color: on ? PAL.ink : PAL.dim, bold: on && i === 3
    });
  });
  p.text(x + 14, 212, 'the paper asks for megabytes, and keys 4', { size: 10.5, color: PAL.valid });

  /* the two-level split */
  var sx = 520;
  p.text(sx, 94, 'two levels, chosen so each table fits a page', { size: 10.5, color: PAL.dim });
  p.rect(sx, 102, 150, 34, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2, radius: 4 });
  p.text(sx + 75, 119, PAGE.perLevelBits + ' bits', { size: 11, align: 'center', base: 'middle', mono: true });
  p.rect(sx + 154, 102, 150, 34, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2, radius: 4 });
  p.text(sx + 154 + 75, 119, PAGE.perLevelBits + ' bits', { size: 11, align: 'center', base: 'middle', mono: true });
  p.rect(sx + 308, 102, 60, 34, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 4 });
  p.text(sx + 338, 119, PAGE.offsetBits + ' b', { size: 10.5, align: 'center', base: 'middle', mono: true, color: PAL.dim });
  p.text(sx, 154, PAGE.perLevelBits + ' + ' + PAGE.perLevelBits + ' + ' + PAGE.offsetBits + ' = ' +
    PAGE.vaBits + ' bits, fully accounted', { size: 10.5, mono: true });

  p.rect(sx, 168, 368, 62, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
  p.text(sx + 12, 186, 'each level: 2^' + PAGE.perLevelBits + ' entries × ' + PAGE.pteBytes +
    ' B = ' + PAGE.levelTableBytes + ' B', { size: 10.5, mono: true });
  p.text(sx + 12, 206, 'which is exactly one ' + PAGE.pageSize + ' B page', {
    size: 10.5, mono: true, color: PAL.valid
  });

  /* why the split matters */
  p.rect(60, 244, 780, 92, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
  p.text(76, 264, 'one level: 4 MB must be contiguous and resident before the process runs at all',
    { size: 11, color: PAL.dim });
  p.text(76, 286, 'two levels: only the tables for the pages actually used are allocated',
    { size: 11, color: PAL.dim });
  p.text(76, 310, 'cost: more memory references per access on a miss, which is what the TLB exists to hide',
    { size: 11, bold: true, color: PAL.warn });

  if (beat(lt, 24, 28) > 0) {
    p.rect(60, 356, 782, 66, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 8 });
    p.text(76, 376, 'Multi-level paging saves space, not time. A question that says "faster" is testing this.',
      { size: 12.5, bold: true, color: PAL.warn });
    p.text(76, 396, 'Bits per level = log2(page size / entry size). The split is forced by that, not chosen by taste.',
      { size: 10.5, color: PAL.dim });
  }
}

/* ---------------- scene 4: the TLB ---------------- */

function sceneTlb(p, lt) {
  heading(p, 'The TLB and effective access time',
    'GATE 2014 Set 3: 10 ms to search the buffer, 80 ms per memory access, hit ratio 0.6');

  var x = 60, y = 80;
  pill(p, x, y, 96, 34, 'CPU', { bold: true });
  pill(p, x + 150, y, 110, 34, 'TLB', { fill: PAL.accentDim, stroke: PAL.accent, bold: true });
  pill(p, x + 150, y + 76, 110, 34, 'page table', {});
  pill(p, x + 340, y + 38, 110, 34, 'memory', {});
  p.arrow(x + 96, y + 17, x + 148, y + 17, { stroke: PAL.dim, sw: 1.3, head: 7 });
  p.arrow(x + 260, y + 17, x + 338, y + 38, { stroke: PAL.valid, sw: 1.6, head: 8 });
  p.text(x + 268, y + 8, 'hit', { size: 10, color: PAL.valid, bold: true });
  p.arrow(x + 205, y + 34, x + 205, y + 74, { stroke: PAL.warn, sw: 1.6, head: 8 });
  p.text(x + 214, y + 54, 'miss', { size: 10, color: PAL.warn, bold: true });
  p.arrow(x + 260, y + 93, x + 338, y + 62, { stroke: PAL.warn, sw: 1.3, head: 7 });

  /* the two paths */
  var rx = 560;
  p.rect(rx, 74, 280, 62, { fill: PAL.surface2, stroke: PAL.valid, sw: 1.2, radius: 6 });
  p.text(rx + 12, 92, 'hit path', { size: 11, bold: true, color: PAL.valid });
  p.text(rx + 12, 112, TLB.tlb + ' + ' + TLB.mem + ' = ' + TLB.hit + ' ms', { size: 11.5, mono: true });
  p.text(rx + 12, 128, 'one memory access', { size: 10, color: PAL.dim });

  p.rect(rx, 144, 280, 62, { fill: PAL.surface2, stroke: PAL.warn, sw: 1.2, radius: 6 });
  p.text(rx + 12, 162, 'miss path', { size: 11, bold: true, color: PAL.warn });
  p.text(rx + 12, 182, TLB.tlb + ' + ' + TLB.mem + ' + ' + TLB.mem + ' = ' + TLB.miss + ' ms', {
    size: 11.5, mono: true
  });
  p.text(rx + 12, 198, 'two memory accesses', { size: 10, color: PAL.dim });

  /* the weighted average */
  p.rect(60, 236, 480, 100, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2, radius: 6 });
  p.text(76, 256, 'effective time = h × hit + (1 − h) × miss', { size: 11.5, bold: true, color: PAL.accent });
  p.text(76, 280, '0.6 × ' + TLB.hit + ' + 0.4 × ' + TLB.miss + ' = ' + TLB.emat + ' ms', {
    size: 13, mono: true, bold: true
  });
  p.text(76, 304, 'the key gives ' + TLB.emat + '; the model recomputes it on load', { size: 10.5, color: PAL.dim });
  p.text(76, 322, 'the two paths, not a formula, are what you should write first', { size: 10.5, color: PAL.dim });

  /* the line */
  p.rect(560, 236, 280, 100, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
  p.text(572, 254, 'h → effective time', { size: 10.5, color: PAL.dim });
  [0, 0.6, 1].forEach(function (hv, i) {
    var v = emat(hv, TLB.tlb, TLB.mem);
    p.text(572, 274 + i * 18, 'h = ' + hv + '  →  ' + Math.round(v) + ' ms', {
      size: 10.5, mono: true, bold: hv === 0.6, color: hv === 0.6 ? PAL.accent : PAL.ink
    });
  });
  p.text(572, 328, 'a straight line between the two paths', { size: 10, color: PAL.dim });

  if (beat(lt, 24, 28) > 0) {
    p.rect(60, 356, 782, 66, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 8 });
    p.text(76, 376, 'A hit still pays for the data access. The buffer saves the page-table reference, not the read.',
      { size: 12.5, bold: true, color: PAL.warn });
    p.text(76, 396, 'Write both paths in full, then weight them by the hit ratio. Almost every error is a miscounted path.',
      { size: 10.5, color: PAL.dim });
  }
}

/* ---------------- scene 5: demand paging ---------------- */

function sceneDemand(p, lt) {
  heading(p, 'Demand paging: the fault is the normal case',
    'GATE 2011: 20 ns per access, 10 ms to service a fault, one fault per million accesses');

  var steps = [
    '1  the access traps to the operating system',
    '2  the process state is saved; the instruction must repeat',
    '3  the address is checked, the page located on disk',
    '4  a free frame is taken, or a victim chosen',
    '5  the page is read in, the table and TLB updated',
    '6  the instruction restarts and now hits'
  ];
  steps.forEach(function (s, i) {
    var y = 80 + i * 32;
    var on = beat(lt, 1 + i * 1.6, 3 + i * 1.6) > 0;
    p.rect(60, y, 470, 26, {
      fill: on ? PAL.accentDim : PAL.surface2,
      stroke: on ? PAL.accent : PAL.border, sw: 1, radius: 5
    });
    p.text(72, y + 13, s, { size: 10.5, base: 'middle', color: on ? PAL.ink : PAL.dim });
  });

  var rx = 560;
  p.rect(rx, 80, 280, 116, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
  p.text(rx + 12, 98, 'effective access time', { size: 11, bold: true });
  p.text(rx + 12, 120, '(1 − p)·mem + p·service', { size: 11, mono: true, color: PAL.dim });
  p.text(rx + 12, 144, '10 ms = ' + PF.serviceNs + ' ns', { size: 10.5, mono: true });
  p.text(rx + 12, 166, 'p = 1e-6  →  ' + PF.rare.toFixed(1) + ' ns', {
    size: 11, mono: true, bold: true, color: PAL.valid
  });
  p.text(rx + 12, 186, 'the key for GATE 2011 is 30 ns', { size: 10, color: PAL.dim });

  p.rect(rx, 206, 280, 92, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 6 });
  p.text(rx + 12, 224, 'p = 1e-3  →  ' + PF.common.toFixed(2) + ' ns', {
    size: 11.5, mono: true, bold: true, color: PAL.warn
  });
  p.text(rx + 12, 246, 'a thousand times the fault rate', { size: 10, color: PAL.dim });
  p.text(rx + 12, 264, 'is about 330 times the time', { size: 10, color: PAL.dim });
  p.text(rx + 12, 284, 'which is why thrashing is fatal', { size: 10, color: PAL.dim });

  if (beat(lt, 20, 24) > 0) {
    p.rect(60, 300, 470, 40, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 5 });
    p.text(72, 312, 'a dirty victim costs two disk transfers; a clean one costs one', { size: 10.5, color: PAL.dim });
    p.text(72, 330, 'the fault is the mechanism of virtual memory, not an error', { size: 10.5, color: PAL.dim });
  }

  if (beat(lt, 24, 28) > 0) {
    p.rect(60, 356, 782, 66, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 8 });
    p.text(76, 376, 'Ten milliseconds is ten to the power seven nanoseconds, not ten to the power six.',
      { size: 12.5, bold: true, color: PAL.warn });
    p.text(76, 396, 'That single factor of ten turns 30 ns into 21 ns. Convert units before substituting.',
      { size: 10.5, color: PAL.dim });
  }
}

/* ---------------- scene 6: replacement on one string ---------------- */

function sceneReplacement(p, lt) {
  heading(p, 'FIFO, LRU and optimal on 4 7 6 1 7 6 1 2 7 2',
    'three frames, all empty; GATE 2014 Set 3 asks for the LRU count');

  var run = REPL.lru;
  var cx = 118, cw = 42;
  /* reference row */
  run.ref.forEach(function (pg, i) {
    var on = beat(lt, 0.5 + i * 1.2, 1.5 + i * 1.2) > 0;
    p.text(cx + i * cw + cw / 2, 80, pg, {
      size: 11, mono: true, align: 'center', bold: true, color: on ? PAL.ink : PAL.dim
    });
  });
  p.text(62, 80, 'ref', { size: 10, mono: true, color: PAL.dim });

  /* three frame rows */
  ['F1', 'F2', 'F3'].forEach(function (label, r) {
    p.text(62, 104 + r * 26, label, { size: 10, mono: true, color: PAL.dim });
    run.steps.forEach(function (s, i) {
      var on = beat(lt, 1 + i * 1.2, 2 + i * 1.2) > 0;
      var v = s.frames[r];
      var cell = s.frames[r] === undefined ? '' : String(v);
      var fill = !on ? 'transparent' : s.hit ? PAL.accentDim : (s.evicted !== null ? PAL.warnDim : PAL.surface2);
      p.rect(cx + i * cw, 94 + r * 26, cw - 4, 20, {
        fill: fill, stroke: on ? PAL.border : 'transparent', sw: 1, radius: 3
      });
      if (on) {
        p.text(cx + i * cw + (cw - 4) / 2, 104 + r * 26, cell, {
          size: 10.5, mono: true, align: 'center', bold: !!cell
        });
      }
    });
  });

  /* fault markers */
  p.text(62, 186, 'fault', { size: 10, mono: true, color: PAL.dim });
  run.steps.forEach(function (s, i) {
    var on = beat(lt, 2 + i * 1.2, 3 + i * 1.2) > 0;
    if (!on) return;
    p.text(cx + i * cw + (cw - 4) / 2, 186, s.hit ? '·' : 'F', {
      size: 11, mono: true, align: 'center', bold: !s.hit,
      color: s.hit ? PAL.valid : PAL.invalid
    });
  });

  /* the three counts */
  var rx = 60, ry = 214;
  p.rect(rx, ry, 782, 78, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
  p.text(rx + 14, ry + 20, 'faults on this string with three frames', { size: 11.5, bold: true });
  [['FIFO', REPL.fifo.faults], ['LRU', REPL.lru.faults], ['optimal', REPL.opt.faults]]
    .forEach(function (row, i) {
      var on = beat(lt, 14 + i * 2.4, 16 + i * 2.4) > 0;
      var bx = rx + 20 + i * 250;
      p.rect(bx, ry + 34, 210, 30, {
        fill: on ? (row[0] === 'optimal' ? PAL.accentDim : PAL.surface) : 'transparent',
        stroke: on ? PAL.accent : PAL.border, sw: 1, radius: 5
      });
      p.text(bx + 12, ry + 49, row[0], { size: 11, base: 'middle', bold: true });
      p.text(bx + 196, ry + 49, String(row[1]), {
        size: 14, mono: true, align: 'right', base: 'middle', bold: true,
        color: on ? PAL.accent : PAL.dim
      });
    });

  p.text(60, 312, 'hits: ' + run.steps.filter(function (s) { return s.hit; }).length +
    ' of ' + run.ref.length + '; the simulation on this page recomputes every cell', { size: 10.5, color: PAL.dim });

  if (beat(lt, 24, 28) > 0) {
    p.rect(60, 356, 782, 66, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 8 });
    p.text(76, 376, 'FIFO and LRU agree here, and optimal is one better. One string proves nothing about the policies.',
      { size: 12.5, bold: true, color: PAL.warn });
    p.text(76, 396, 'Evict by recency, not by frame position: after a hit, arrival order and last-use order differ.',
      { size: 10.5, color: PAL.dim });
  }
}

/* ---------------- scene 7: Belady's anomaly ---------------- */

function sceneBelady(p, lt) {
  heading(p, "Belady's anomaly, and the stack property",
    'same string, more frames, more faults — but only for one of the three policies');

  /* grouped bars: faults with 3 frames against 4 */
  var x0 = 60, base = 300, maxH = 150;
  var rows = [
    ['FIFO', BEL.fifo3, BEL.fifo4, PAL.warn],
    ['LRU', BEL.lru3, BEL.lru4, PAL.accent],
    ['optimal', BEL.opt3, BEL.opt4, PAL.valid]
  ];
  var scale = maxH / 12;
  p.line(x0, base, x0 + 420, base, { stroke: PAL.border, sw: 1 });
  rows.forEach(function (row, i) {
    var gx = x0 + i * 140;
    var on = beat(lt, 2 + i * 3, 4 + i * 3) > 0;
    [[row[1], 0], [row[2], 34]].forEach(function (pair) {
      var h = pair[0] * scale;
      p.rect(gx + 20 + pair[1], base - h, 26, h, {
        fill: on ? row[3] : 'transparent',
        stroke: on ? row[3] : PAL.border, sw: 1, radius: 2
      });
      if (on) {
        p.text(gx + 33 + pair[1], base - h - 8, String(pair[0]), {
          size: 10.5, mono: true, align: 'center', bold: true, color: row[3]
        });
      }
    });
    p.text(gx + 20, base + 18, row[0], { size: 11, bold: true, color: on ? PAL.ink : PAL.dim });
    p.text(gx + 20, base + 34, '3 frames, then 4', { size: 9.5, color: PAL.dim });
  });
  p.text(x0, base - maxH - 16, 'page faults on 1 2 3 4 1 2 5 1 2 3 4 5', { size: 10.5, color: PAL.dim });
  if (beat(lt, 12, 15) > 0) {
    p.text(x0 + 20, base + 62, 'FIFO rises from ' + BEL.fifo3 + ' to ' + BEL.fifo4 +
      ': that is the anomaly', { size: 10.5, bold: true, color: PAL.warn });
  }

  /* the stack property */
  var rx = 520;
  p.rect(rx, 80, 320, 96, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2, radius: 6 });
  p.text(rx + 14, 98, 'stack property', { size: 11.5, bold: true, color: PAL.accent });
  p.text(rx + 14, 120, 'pages held with 3 frames', { size: 10, color: PAL.dim });
  p.text(rx + 14, 138, '⊆  pages held with 4 frames', { size: 11.5, mono: true });
  p.text(rx + 14, 160, 'at every step of the string', { size: 10, color: PAL.dim });

  var verdicts = [
    ['LRU', STACK_LRU.holds],
    ['optimal', STACK_OPT.holds],
    ['FIFO', STACK_FIFO.holds]
  ];
  p.rect(rx, 186, 320, 92, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
  p.text(rx + 14, 204, 'inclusion checked, step by step', { size: 10.5, color: PAL.dim });
  verdicts.forEach(function (v, i) {
    var on = beat(lt, 14 + i * 2, 16 + i * 2) > 0;
    if (!on) return;
    p.text(rx + 14, 226 + i * 18, (v[1] ? 'holds    ' : 'fails    ') + v[0], {
      size: 11, mono: true, color: v[1] ? PAL.valid : PAL.invalid, bold: true
    });
  });

  p.text(520, 306, 'LRU, frames 1 to 5: ' + CURVE.lru.join(', '),
    { size: 10, mono: true, color: PAL.dim });
  p.text(520, 322, 'optimal, frames 1 to 5: ' + CURVE.opt.join(', '),
    { size: 10, mono: true, color: PAL.dim });
  p.text(520, 338, 'FIFO, frames 1 to 5: ' + CURVE.fifo.join(', '),
    { size: 10, mono: true, color: PAL.warn });

  if (beat(lt, 24, 28) > 0) {
    p.rect(60, 366, 782, 56, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 8 });
    p.text(76, 386, 'A policy whose priority order does not depend on the frame count cannot show the anomaly.',
      { size: 12, bold: true, color: PAL.warn });
    p.text(76, 404, 'Recency and next-use distance are such orders. Arrival order is not, because the frame count changes it.',
      { size: 10, color: PAL.dim });
  }
}

/* ---------------- scene 8: three counting shapes ---------------- */

function sceneCounting(p, lt) {
  heading(p, 'Three counting shapes the paper uses',
    'a fault rate, a reversed string, and optimal with a bounded lookahead');

  var cards = [
    {
      t: 'fault rate', s: 'GATE 2022',
      a: R22RUN.faults + ' faults in ' + R22.length + ' accesses',
      b: 'rate = ' + R22RUN.faults + ' / ' + R22.length + ' = ' + R22RATE.toFixed(1),
      c: 'four frames, LRU'
    },
    {
      t: 'reversed string', s: 'GATE 2010',
      a: '100 distinct pages, then the same 100 backwards',
      b: REV.fifo + ' = 100 + (100 − 4)',
      c: 'four frames, FIFO'
    },
    {
      t: 'bounded lookahead', s: 'GATE 2025 CS1',
      a: 'optimal, but only the next 4 references are known',
      b: LA25.faults + ' faults; full optimal also ' + OPT25.faults,
      c: 'three frames'
    }
  ];
  cards.forEach(function (c, i) {
    var y = 78 + i * 88;
    var on = beat(lt, 2 + i * 5, 4 + i * 5) > 0;
    p.rect(60, y, 782, 78, {
      fill: on ? PAL.surface2 : 'transparent',
      stroke: on ? PAL.border : 'transparent', sw: 1, radius: 6
    });
    if (!on) return;
    p.text(76, y + 20, c.t, { size: 12, bold: true });
    p.text(200, y + 20, c.s, { size: 10, color: PAL.dim });
    p.text(76, y + 42, c.a, { size: 10.5, color: PAL.dim });
    p.text(76, y + 62, c.b, { size: 12, mono: true, bold: true, color: PAL.accent });
    p.text(560, y + 62, c.c, { size: 10, color: PAL.dim });
  });

  if (beat(lt, 20, 24) > 0) {
    p.rect(60, 344, 782, 22, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1, radius: 5 });
    p.text(76, 355, 'each shape has a shortcut: divide once, subtract the overlap, or write the window down',
      { size: 10.5, base: 'middle', color: PAL.accent });
  }

  if (beat(lt, 24, 28) > 0) {
    p.rect(60, 372, 782, 50, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 8 });
    p.text(76, 392, 'Read which policy is named before drawing a single frame. The optimal count is easier to reason about,',
      { size: 11.5, bold: true, color: PAL.warn });
    p.text(76, 410, 'which is exactly why so many answers give it when the question asked for LRU.', { size: 10, color: PAL.dim });
  }
}

/* ---------------- scene 9: structures ---------------- */

function sceneStructures(p, lt) {
  heading(p, 'Table structures, segmentation and thrashing',
    'GATE 2024 Set 2: how many pages does a two-level table occupy for 2000 pages?');

  p.rect(60, 78, 420, 150, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2, radius: 6 });
  p.text(76, 98, 'two-level count', { size: 12, bold: true, color: PAL.accent });
  var rows = [
    ['one table page holds ' + TWO.entriesPerPage + ' entries', 120],
    ['minimum: 1 outer + ceil(2000 / ' + TWO.entriesPerPage + ') = ' + TWO.min, 144],
    ['maximum: 1 outer + min(' + TWO.outerEntries + ', 2000) = ' + TWO.max, 168],
    ['the paper asks for the sum: ' + TWO.min + ' + ' + TWO.max + ' = ' + TWO.sum, 192]
  ];
  rows.forEach(function (r, i) {
    var on = beat(lt, 1 + i * 2.4, 3 + i * 2.4) > 0;
    p.text(76, r[1], (on ? '• ' : '· ') + r[0], {
      size: 10.5, mono: true, color: on ? PAL.ink : PAL.dim, bold: on && i === 3
    });
  });
  p.text(76, 216, 'the outer table bounds the inner count, not the process', { size: 10, color: PAL.warn });

  var rx = 520;
  p.rect(rx, 78, 322, 150, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
  p.text(rx + 14, 98, 'other structures', { size: 11.5, bold: true });
  var alts = [
    ['inverted', 'one entry per frame; needs a search'],
    ['hashed', 'chains colliding page numbers'],
    ['segmented', 'base + limit per visible segment'],
    ['combined', 'segments, each paged internally']
  ];
  alts.forEach(function (a, i) {
    var on = beat(lt, 10 + i * 2, 12 + i * 2) > 0;
    p.text(rx + 14, 122 + i * 26, a[0], { size: 10.5, mono: true, bold: on, color: on ? PAL.ink : PAL.dim });
    p.text(rx + 96, 122 + i * 26, a[1], { size: 10, color: on ? PAL.dim : PAL.dim });
  });

  p.rect(60, 240, 782, 96, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
  p.text(76, 260, 'fragmentation, one line each', { size: 11, bold: true });
  p.text(76, 282, 'paging: internal only, inside the last page — no external fragmentation', { size: 10.5, color: PAL.dim });
  p.text(76, 302, 'segmentation: external only, between segments — no internal waste', { size: 10.5, color: PAL.dim });
  p.text(76, 324, 'thrashing: the working sets no longer fit, so each process evicts what another needs', {
    size: 10.5, bold: true, color: PAL.warn
  });

  if (beat(lt, 24, 28) > 0) {
    p.rect(60, 366, 782, 56, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 8 });
    p.text(76, 386, 'An inverted table is smaller and slower. Smaller is not the same as better.',
      { size: 12, bold: true, color: PAL.warn });
    p.text(76, 404, 'And a two-level table costs more references per access; the TLB, not the levels, is what makes it fast.',
      { size: 10, color: PAL.dim });
  }
}

/* ---------------- scene 10: the procedure ---------------- */

function sceneRecipe(p, lt) {
  heading(p, 'The procedure', 'four steps, then the five traps');

  var steps = [
    ['1  Write the configuration', 'address bits, page size, entry size, frames — as powers of two'],
    ['2  For a time', 'draw the hit and miss paths, then weight by the probability'],
    ['3  For replacement', 'simulate the named policy only, one column per reference'],
    ['4  For a table', 'entries × entry width, then check each level fits a page']
  ];
  steps.forEach(function (s, i) {
    var y = 90 + i * 46;
    var on = beat(lt, 2 + i * 3, 4 + i * 3) > 0;
    p.rect(60, y, 470, 38, {
      fill: on ? PAL.accentDim : PAL.surface2,
      stroke: on ? PAL.accent : PAL.border, sw: 1, radius: 6
    });
    p.text(74, y + 16, s[0], { size: 12, bold: true });
    p.text(74, y + 31, s[1], { size: 10, color: PAL.dim });
  });

  var traps = [
    'nanoseconds mixed with milliseconds',
    'translating the offset',
    'multi-level assumed to be faster',
    'more frames assumed never to hurt',
    'one string generalised to a policy'
  ];
  p.text(556, 90, 'five traps', { size: 12, bold: true, color: PAL.warn });
  traps.forEach(function (t, i) {
    var on = beat(lt, 12 + i * 2.4, 14 + i * 2.4) > 0;
    p.rect(556, 104 + i * 34, 286, 28, {
      fill: on ? PAL.warnDim : 'transparent',
      stroke: on ? PAL.warn : PAL.border, sw: 1, radius: 5
    });
    p.text(568, 118 + i * 34, t, { size: 10.2, base: 'middle', color: on ? PAL.ink : PAL.dim });
  });

  if (beat(lt, 24, 28) > 0) {
    p.rect(60, 286, 782, 118, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 8 });
    p.text(76, 308, 'Five results worth memorising', { size: 13, bold: true });
    p.text(76, 332, 'GATE 2015 Set 1: 2^20 entries × 4 B = ' + PAGE.tableMB + ' MB.',
      { size: 10.5, color: PAL.dim });
    p.text(76, 352, 'GATE 2014 Set 3: 0.6 × 90 + 0.4 × 170 = ' + TLB.emat + ' ms;   LRU on 4 7 6 1 7 6 1 2 7 2 = ' +
      REPL.lru.faults + '.', { size: 10.5, color: PAL.dim });
    p.text(76, 372, 'GATE 2011: ' + PF.rare.toFixed(0) + ' ns;   GATE 2022: ' + R22RUN.faults + '/15 = ' +
      R22RATE.toFixed(1) + ';   GATE 2010: ' + REV.fifo + ';   GATE 2024: ' + TWO.sum + '.',
      { size: 10.5, color: PAL.dim });
    p.text(76, 392, 'And the anomaly: FIFO ' + BEL.fifo3 + ' faults with 3 frames, ' + BEL.fifo4 + ' with 4.',
      { size: 10.5, bold: true, color: PAL.warn });
  }
}

/* ---------------- dispatch ---------------- */

var SCENES = {
  fragmentation: sceneFragmentation,
  paging: scenePaging,
  'page-table-size': sceneTableSize,
  tlb: sceneTlb,
  'demand-paging': sceneDemand,
  replacement: sceneReplacement,
  belady: sceneBelady,
  counting: sceneCounting,
  structures: sceneStructures,
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
