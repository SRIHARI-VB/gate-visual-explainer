/* ==========================================================================
   contiguous-memory-allocation-and-fit-policies — model, validation, render.

   Layer 1  model      : fixed partitioning, variable partitioning as a list of
                         address-ordered segments, the four placement policies,
                         split and coalesce, fragmentation diagnostics,
                         compaction, and a seeded allocation simulation.
   Layer 2  validation : every claim the lesson makes is recomputed and checked
                         against its own definition before anything is drawn.
   Layer 3  render     : reads the model; never re-derives a structure.
   Layer 4  timeline   : in timeline.js — the only source of time.

   No p5.brush: every mark is a boundary the learner has to judge (a partition
   edge, a leftover hole, a rover position). A random stroke offset would blur
   exactly the thing the question asks about.
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

  var CFG = {
    fixed: {
      totalKB: 1024,
      partKB: 128,
      procs: [
        { n: 'P1', kb: 110 }, { n: 'P2', kb: 95 }, { n: 'P3', kb: 128 },
        { n: 'P4', kb: 40 }, { n: 'P5', kb: 76 }, { n: 'P6', kb: 130 }
      ]
    },
    /* the six holes are the configuration of a real past question (2015 Set 2);
       the 50 KB blocks between them stand for processes already resident, so the
       address space is a real one and compaction can be measured in bytes moved */
    vmem: {
      totalKB: 2500,
      fillerKB: 50,
      holes: [200, 400, 600, 500, 300, 250],
      reqs: [357, 210, 468, 491]
    },
    old1994: {
      /* GATE CSE 1994 Q1.24, in the units the question used */
      segs: [50, 150, 300, 350, 600],   // alternating in use / free, from low address
      reqs: [300, 25, 125, 50]
    }
  };

  var M = {};

  /* ---------------- 1. fixed partitioning ---------------- */

  M.FIX = (function () {
    var partKB = CFG.fixed.partKB;
    var n = Math.floor(CFG.fixed.totalKB / partKB);
    var slots = new Array(n).fill(null);
    var rejected = [];
    var steps = [];

    CFG.fixed.procs.forEach(function (p) {
      var idx = -1;
      for (var i = 0; i < n; i++) { if (slots[i] === null) { idx = i; break; } }
      if (p.kb > partKB) { rejected.push(p); steps.push({ n: p.n, kb: p.kb, part: null, frag: null, why: 'larger than a partition' }); return; }
      if (idx < 0) { rejected.push(p); steps.push({ n: p.n, kb: p.kb, part: null, frag: null, why: 'no free partition' }); return; }
      slots[idx] = p;
      steps.push({ n: p.n, kb: p.kb, part: idx + 1, frag: partKB - p.kb, why: null });
    });

    var placed = slots.filter(Boolean);
    var internal = placed.reduce(function (a, p) { return a + (partKB - p.kb); }, 0);
    var usedBytes = placed.reduce(function (a, p) { return a + p.kb; }, 0);
    var freeParts = slots.filter(function (s) { return s === null; }).length;

    return {
      partKB: partKB, parts: n, slots: slots, steps: steps, rejected: rejected,
      placedCount: placed.length, internalKB: internal, usedKB: usedBytes,
      freeParts: freeParts, freeKB: freeParts * partKB,
      wasteKB: internal + freeParts * partKB,
      wastePct: (internal + freeParts * partKB) / CFG.fixed.totalKB * 100,
      largestProcess: Math.max.apply(null, CFG.fixed.procs.map(function (p) { return p.kb; })),
      maxRunnable: partKB,
      degreeOfMultiprogramming: n
    };
  })();

  /* ---------------- 2. variable partitioning as segments ---------------- */

  function buildVMem() {
    var segs = [], pos = 0;
    for (var i = 0; i < CFG.vmem.holes.length; i++) {
      if (i > 0) {
        segs.push({ start: pos, size: CFG.vmem.fillerKB, free: false, kind: 'filler', label: 'in use' });
        pos += CFG.vmem.fillerKB;
      }
      segs.push({ start: pos, size: CFG.vmem.holes[i], free: true, kind: 'hole', label: 'H' + (i + 1) });
      pos += CFG.vmem.holes[i];
    }
    return { segs: segs, end: pos };
  }

  function totalKB(segs) {
    return segs.reduce(function (a, s) { return a + s.size; }, 0);
  }
  function freeSegs(segs) {
    return segs.filter(function (s) { return s.free; });
  }
  function freeKB(segs) {
    return freeSegs(segs).reduce(function (a, s) { return a + s.size; }, 0);
  }
  function largestHole(segs) {
    var f = freeSegs(segs);
    return f.length ? Math.max.apply(null, f.map(function (s) { return s.size; })) : 0;
  }

  /* place one request; policy is 'first' | 'next' | 'best' | 'worst'.
     state.rover carries the next-fit position between calls. */
  function place(segs, req, policy, state) {
    var i, idx = -1, best = null, worst = null, order = [];

    if (policy === 'first') {
      for (i = 0; i < segs.length; i++) { if (segs[i].free && segs[i].size >= req) { idx = i; break; } }
    } else if (policy === 'next') {
      for (i = 0; i < segs.length; i++) { order.push((state.rover + i) % segs.length); }
      for (i = 0; i < order.length; i++) {
        var t = order[i];
        if (segs[t].free && segs[t].size >= req) { idx = t; break; }
      }
    } else if (policy === 'best') {
      for (i = 0; i < segs.length; i++) {
        if (segs[i].free && segs[i].size >= req && (best === null || segs[i].size < segs[best].size)) best = i;
      }
      idx = best === null ? -1 : best;
    } else if (policy === 'worst') {
      for (i = 0; i < segs.length; i++) {
        if (segs[i].free && segs[i].size >= req && (worst === null || segs[i].size > segs[worst].size)) worst = i;
      }
      idx = worst === null ? -1 : worst;
    }

    if (idx < 0) return { ok: false, req: req };

    var hole = segs[idx];
    var leftover = hole.size - req;
    var taken = { start: hole.start, size: req, free: false, kind: 'proc', label: '?' };
    var rest = [];
    if (leftover > 0) rest.push({ start: hole.start + req, size: leftover, free: true, kind: 'hole', label: hole.label });

    segs.splice.apply(segs, [idx, 1].concat([taken], rest));
    if (policy === 'next') state.rover = idx + 1;

    return { ok: true, req: req, holeLabel: hole.label, holeSize: hole.size,
             start: hole.start, leftover: leftover, seg: taken };
  }

  function coalesce(segs) {
    var out = [];
    segs.forEach(function (s) {
      var last = out[out.length - 1];
      if (last && last.free && s.free) { last.size += s.size; last.merged = (last.merged || 1) + 1; }
      else out.push({ start: s.start, size: s.size, free: s.free, kind: s.kind, label: s.label, merged: 1 });
    });
    return out;
  }

  function runTrace(policy) {
    var built = buildVMem();
    var segs = built.segs.map(function (s) { return { start: s.start, size: s.size, free: s.free, kind: s.kind, label: s.label }; });
    var state = { rover: 0 };
    var steps = [];
    CFG.vmem.reqs.forEach(function (r, i) {
      var res = place(segs, r, policy, state);
      if (res.ok) res.seg.label = 'P' + (i + 1);
      steps.push(res);
    });
    var merged = coalesce(segs);
    return {
      policy: policy,
      steps: steps,
      segs: segs,
      merged: merged,
      allocated: steps.filter(function (s) { return s.ok; }).length,
      failed: steps.filter(function (s) { return !s.ok; }),
      freeKB: freeKB(segs),
      largest: largestHole(segs),
      holes: freeSegs(merged).length,
      total: totalKB(segs)
    };
  }

  M.VAR = {
    first: runTrace('first'),
    next: runTrace('next'),
    best: runTrace('best'),
    worst: runTrace('worst')
  };
  M.POLICIES = ['first', 'next', 'best', 'worst'];
  M.TRACES = M.POLICIES.map(function (p) { return M.VAR[p]; });

  M.vmemTotal = buildVMem().end;
  M.vmemHoleSum = CFG.vmem.holes.reduce(function (a, b) { return a + b; }, 0);
  M.vmemFillerSum = M.vmemTotal - M.vmemHoleSum;

  /* the six-hole best-fit result, which is the answer to the 2015 question:
     which partitions received no process at all — a partition that received one
     and kept a remainder is still allotted */
  M.unallotted = (function () {
    var chosen = {};
    M.VAR.best.steps.forEach(function (s) { if (s.ok) chosen[s.holeLabel] = true; });
    return buildVMem().segs.filter(function (s) { return s.free && !chosen[s.label]; })
      .map(function (s) { return s.size; });
  })();

  /* ---------------- 3. fragmentation diagnostics ---------------- */

  /* a request fails from external fragmentation when the total free space is
     enough but no single hole is */
  function diagnosis(trace, req) {
    return {
      req: req,
      totalFree: trace.freeKB,
      largest: trace.largest,
      capacityShort: trace.freeKB < req,
      external: trace.freeKB >= req && trace.largest < req,
      fits: trace.largest >= req
    };
  }
  M.DIAG = M.POLICIES.reduce(function (acc, p) {
    acc[p] = M.VAR[p].steps.filter(function (s) { return !s.ok; }).map(function (s) {
      return diagnosis(M.VAR[p], s.req);
    });
    return acc;
  }, {});

  /* ---------------- 4. compaction ---------------- */

  function compact(segs) {
    var pos = 0, moved = 0, out = [], movedCount = 0;
    segs.forEach(function (s) {
      if (s.free) return;
      if (s.start !== pos) { moved += s.size; movedCount++; }
      out.push({ start: pos, size: s.size, free: false, kind: s.kind, label: s.label, from: s.start });
      pos += s.size;
    });
    var rest = totalKB(segs) - pos;
    out.push({ start: pos, size: rest, free: true, kind: 'hole', label: 'free', from: pos });
    return { segs: out, movedKB: moved, movedBlocks: movedCount, freeKB: rest, largest: rest };
  }

  M.COMPACT = (function () {
    var before = M.VAR.first;
    var after = compact(before.segs);
    /* the first request that the scattered state refuses and the packed state takes */
    var witness = null;
    CFG.vmem.reqs.forEach(function (r) {
      var d = diagnosis(before, r);
      if (d.external && after.largest >= r) witness = d;
    });
    if (!witness) {
      for (var r2 = 1; r2 <= before.freeKB; r2++) {
        if (before.largest < r2) { witness = diagnosis(before, r2); break; }
      }
    }
    return { before: before, after: after, witness: witness };
  })();

  /* ---------------- 5. the two fragmentation kinds ---------------- */

  M.FRAG = {
    /* fixed partitioning: the waste lives inside an allocated partition, so the
       allocator cannot hand it to anyone — it is not in the free list at all */
    internalKB: M.FIX.internalKB,
    internalBlocks: M.FIX.placedCount,
    internalLargest: M.FIX.placedCount
      ? Math.max.apply(null, M.FIX.slots.filter(Boolean).map(function (p) { return M.FIX.partKB - p.kb; }))
      : 0,
    /* variable partitioning: the waste is in the free list but in pieces */
    externalKB: M.VAR.first.freeKB,
    externalHoles: M.VAR.first.holes,
    externalLargest: M.VAR.first.largest,
    externalRatio: M.VAR.first.freeKB / M.VAR.first.holes
  };

  /* ---------------- 6. best fit is not always best (GATE 1994) ---------------- */

  function runOld(policy) {
    /* segments alternate in use / free starting with in use */
    var segs = [], pos = 0;
    CFG.old1994.segs.forEach(function (s, i) {
      segs.push({ start: pos, size: s, free: i % 2 === 1, kind: i % 2 === 1 ? 'hole' : 'filler', label: 'B' + (i + 1) });
      pos += s;
    });
    var state = { rover: 0 };
    var steps = [];
    CFG.old1994.reqs.forEach(function (r, i) {
      var res = place(segs, r, policy, state);
      if (res.ok) res.seg.label = 'R' + (i + 1);
      steps.push(res);
    });
    return { policy: policy, steps: steps, segs: segs, merged: coalesce(segs),
             allocated: steps.filter(function (s) { return s.ok; }).length };
  }
  M.OLD = { first: runOld('first'), best: runOld('best') };

  /* ---------------- 7. exhaustive check: best fit's leftover is minimal ---------------- */

  M.LEFTOVER = (function () {
    var cases = 0, violations = 0, worstGap = 0;
    var sizes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    function trial(holes, req) {
      var segs = [], pos = 0;
      holes.forEach(function (h, i) {
        if (i > 0) { segs.push({ start: pos, size: 1, free: false, kind: 'filler', label: 'x' }); pos += 1; }
        segs.push({ start: pos, size: h, free: true, kind: 'hole', label: 'H' + (i + 1) });
        pos += h;
      });
      var a = JSON.parse(JSON.stringify(segs));
      var b = JSON.parse(JSON.stringify(segs));
      var rf = place(a, req, 'first', { rover: 0 });
      var rb = place(b, req, 'best', { rover: 0 });
      if (!rf.ok && !rb.ok) return null;
      if (!rf.ok || !rb.ok) return null;
      cases++;
      var gap = rf.leftover - rb.leftover;
      if (gap < 0) violations++;
      if (gap > worstGap) worstGap = gap;
      return { firstLeft: rf.leftover, bestLeft: rb.leftover };
    }

    for (var i = 0; i < sizes.length; i++) {
      for (var j = i; j < sizes.length; j++) {
        for (var k = j; k < sizes.length; k++) {
          for (var r = 1; r <= 12; r++) trial([sizes[i], sizes[j], sizes[k]], r);
        }
      }
    }
    return { cases: cases, violations: violations, worstGap: worstGap };
  })();

  /* ---------------- 8. next fit against first fit ---------------- */

  M.NEXTWITNESS = (function () {
    /* two requests: the first moves the rover past a hole, the second shows the
       difference. Found by search, not asserted; the widest difference wins. */
    var sizes = [100, 200, 300, 400, 500, 600, 700];
    var reqs = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600];
    var found = null;
    for (var i = 0; i < sizes.length; i++) {
      for (var j = 0; j < sizes.length; j++) {
        for (var k = 0; k < sizes.length; k++) {
          var holes = [sizes[i], sizes[j], sizes[k]];
          for (var a = 0; a < reqs.length; a++) {
            for (var b = 0; b < reqs.length; b++) {
              var r1 = reqs[a], r2 = reqs[b];
              var mk = function () {
                var segs = [], pos = 0;
                holes.forEach(function (h, idx) {
                  if (idx > 0) { segs.push({ start: pos, size: 1, free: false, kind: 'filler', label: 'x' }); pos += 1; }
                  segs.push({ start: pos, size: h, free: true, kind: 'hole', label: 'H' + (idx + 1) });
                  pos += h;
                });
                return segs;
              };
              var sN = mk(), stN = { rover: 0 };
              var a1 = place(sN, r1, 'next', stN);
              var a2 = place(sN, r2, 'next', stN);
              var sF = mk();
              var b1 = place(sF, r1, 'first', { rover: 0 });
              var b2 = place(sF, r2, 'first', { rover: 0 });
              if (!a1.ok || !a2.ok || !b1.ok || !b2.ok) continue;
              var diff = a2.leftover - b2.leftover;
              if (diff !== 0 && (!found || Math.abs(diff) > Math.abs(found.diff))) {
                found = { holes: holes.slice(), r1: r1, r2: r2,
                          nextLeft: a2.leftover, firstLeft: b2.leftover,
                          nextHole: a2.holeSize, firstHole: b2.holeSize, diff: diff };
              }
            }
          }
        }
      }
    }
    return found;
  })();

  /* ---------------- 9. the 50-percent rule, measured ---------------- */

  M.SIM = (function () {
    /* Knuth's simulation result: under first fit, the expected number of free
       holes is about half the number of allocated blocks. Re-measured here with
       a fixed seed, so the page is deterministic. */
    var seed = 12345;
    function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }

    var segs = [{ start: 0, size: 1000, free: true, kind: 'hole', label: 'H1' }];
    var live = [];
    var ratios = [];

    for (var step = 0; step < 4000; step++) {
      var doAlloc = live.length === 0 || rnd() < 0.55;
      if (doAlloc) {
        var req = 1 + Math.floor(rnd() * 40);
        var res = place(segs, req, 'first', { rover: 0 });
        if (res.ok) live.push(res.seg);
        segs = coalesce(segs);
      } else {
        var which = Math.floor(rnd() * live.length);
        var target = live.splice(which, 1)[0];
        for (var i = 0; i < segs.length; i++) {
          if (!segs[i].free && segs[i].start === target.start) { segs[i].free = true; segs[i].kind = 'hole'; segs[i].label = 'free'; break; }
        }
        segs = coalesce(segs);
      }
      if (step > 400) {
        var holes = freeSegs(segs).length;
        if (live.length > 0) ratios.push(holes / live.length);
      }
    }
    var mean = ratios.reduce(function (a, b) { return a + b; }, 0) / ratios.length;
    return { mean: mean, samples: ratios.length, live: live.length };
  })();

  /* ======================================================================
     LAYER 2 — VALIDATION
     ====================================================================== */

  var CHECKS = [];
  function check(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail }); }
  function near(a, b, tol) { return Math.abs(a - b) <= (tol === undefined ? 1e-9 : tol); }

  var F = M.FIX, V = M.VAR;

  check('fixed: 1024 KB in 128 KB partitions gives exactly 8 partitions',
        F.parts === 8 && F.partKB * F.parts === CFG.fixed.totalKB, 'parts=' + F.parts);

  check('fixed: internal waste of a placement is partition minus request',
        F.steps.filter(function (s) { return s.part !== null; })
          .every(function (s) { return s.frag === F.partKB - s.kb; }),
        'five placements');

  check('fixed: the internal waste sums to 191 KB',
        F.internalKB === 191, 'internalKB=' + F.internalKB);

  check('fixed: allocated + internal + free partitions accounts for all 1024 KB',
        F.usedKB + F.internalKB + F.freeKB === CFG.fixed.totalKB,
        F.usedKB + '+' + F.internalKB + '+' + F.freeKB);

  check('fixed: a 130 KB process cannot run in a 128 KB partition although three partitions are free',
        F.rejected.length === 1 && F.rejected[0].kb === 130 && F.freeParts === 3,
        'rejected=' + F.rejected.map(function (p) { return p.n + ':' + p.kb; }).join(','));

  check('variable: the address space is 2500 KB and holds six holes of 2250 KB',
        M.vmemTotal === 2500 && M.vmemHoleSum === 2250, M.vmemTotal + ' / ' + M.vmemHoleSum);

  M.POLICIES.forEach(function (p) {
    var t = V[p];
    check('variable/' + p + ': allocated plus free equals the whole 2500 KB',
          t.freeKB + t.segs.filter(function (s) { return !s.free; })
            .reduce(function (a, s) { return a + s.size; }, 0) === 2500,
          'free=' + t.freeKB);
  });

  check('variable: every leftover is the chosen hole minus the request',
        M.POLICIES.every(function (p) {
          return V[p].steps.filter(function (s) { return s.ok; })
            .every(function (s) { return s.leftover === s.holeSize - s.req; });
        }), 'four policies');

  check('variable: no leftover is negative',
        M.POLICIES.every(function (p) {
          return V[p].steps.filter(function (s) { return s.ok; })
            .every(function (s) { return s.leftover >= 0; });
        }), 'four policies');

  check('best fit on the six holes reproduces the 2015 Set 2 answer: 200 and 300 left over',
        M.unallotted.length === 2 && M.unallotted.indexOf(200) >= 0 && M.unallotted.indexOf(300) >= 0,
        'left over: ' + M.unallotted.join(', '));

  check('the four policies do not agree on the same request stream',
        V.first.allocated === 3 && V.next.allocated === 3 &&
        V.best.allocated === 4 && V.worst.allocated === 2,
        'first=' + V.first.allocated + ' next=' + V.next.allocated +
        ' best=' + V.best.allocated + ' worst=' + V.worst.allocated);

  check('worst fit refuses the third request with ' + V.worst.freeKB + ' KB free and only ' + V.worst.largest + ' KB in one hole',
        V.worst.failed.length >= 1 && V.worst.failed[0].req === 468 && V.worst.freeKB >= 468,
        'free=' + V.worst.freeKB + ' largest=' + V.worst.largest);

  check('external fragmentation: at least one failure had enough total free space',
        M.POLICIES.some(function (p) { return M.DIAG[p].some(function (d) { return d.external; }); }),
        'counted per policy');

  check('best fit always leaves a leftover no larger than first fit (exhaustive)',
        M.LEFTOVER.violations === 0 && M.LEFTOVER.cases > 200,
        M.LEFTOVER.cases + ' cases, ' + M.LEFTOVER.violations + ' violations');

  check('next fit can leave a different leftover from first fit on the same holes',
        !!M.NEXTWITNESS && M.NEXTWITNESS.nextLeft !== M.NEXTWITNESS.firstLeft,
        M.NEXTWITNESS ? ('next=' + M.NEXTWITNESS.nextLeft + ' first=' + M.NEXTWITNESS.firstLeft) : 'no witness');

  check('1994 trace: first fit places all four requests',
        M.OLD.first.allocated === 4, 'allocated=' + M.OLD.first.allocated);

  check('1994 trace: best fit places only three, so best fit is not always better',
        M.OLD.best.allocated === 3, 'allocated=' + M.OLD.best.allocated);

  check('compaction turns the scattered free space into one hole of the same total',
        near(M.COMPACT.after.freeKB, M.COMPACT.before.freeKB) &&
        M.COMPACT.after.largest === M.COMPACT.after.freeKB,
        'free=' + M.COMPACT.after.freeKB);

  check('compaction moves only the live bytes above the first hole, and moves them once',
        M.COMPACT.after.movedKB > 0 &&
        M.COMPACT.after.segs.every(function (s, i, arr) {
          return i === 0 || s.start === arr[i - 1].start + arr[i - 1].size;
        }),
        'moved=' + M.COMPACT.after.movedKB + ' KB in ' + M.COMPACT.after.movedBlocks + ' blocks');

  check('the compacted request is refused before and accepted after',
        !!M.COMPACT.witness && M.COMPACT.witness.external &&
        M.COMPACT.after.largest >= M.COMPACT.witness.req,
        M.COMPACT.witness ? ('req=' + M.COMPACT.witness.req) : 'none');

  check('coalescing merges adjacent holes and leaves separated ones apart',
        (function () {
          var t = { segs: [
            { start: 0, size: 10, free: true }, { start: 10, size: 20, free: true },
            { start: 30, size: 5, free: false }, { start: 35, size: 7, free: true },
            { start: 42, size: 3, free: true }] };
          var c = coalesce(t.segs.map(function (s) { return { start: s.start, size: s.size, free: s.free }; }));
          return c.length === 3 && c[0].size === 30 && c[1].size === 5 && c[2].size === 10;
        })(), 'three segments after merge');

  check('the 50-percent rule measures about one hole per two allocated blocks',
        M.SIM.mean > 0.3 && M.SIM.mean < 0.7,
        'measured ' + M.SIM.mean.toFixed(3) + ' over ' + M.SIM.samples + ' samples');

  check('internal fragmentation is invisible to the free list while external fragmentation is in it',
        F.internalKB > 0 && freeSegs(M.VAR.first.segs).length === M.FRAG.externalHoles,
        'internal=' + F.internalKB + ' external holes=' + M.FRAG.externalHoles);

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

  /* ======================================================================
     LAYER 3 — RENDER
     ====================================================================== */

  var C = PR.PAL;

  function title(P, s) { P.text(30, 18, s, { size: 12.5, bold: true, color: C.dim }); }

  function foot(P, s, y) {
    P.text(30, y === undefined ? H - 22 : y, s, { size: 11, color: C.dim });
  }

  /* one memory bar: segments laid out by size in address order */
  function memBar(P, x, y, w, h, segs, total, o) {
    o = o || {};
    var scale = w / total;
    segs.forEach(function (s) {
      var sx = x + s.start * scale, sw = Math.max(1, s.size * scale);
      var fill = s.free ? (o.holeFill || C.surface2) : (s.kind === 'filler' ? C.border : (o.usedFill || C.accentDim));
      var stroke = s.free ? C.border : (s.kind === 'filler' ? C.border : C.accent);
      P.rect(sx, y, sw, h, { fill: fill, stroke: stroke, sw: 1, radius: 2 });
      if (sw > 26 && !o.bare) {
        P.text(sx + sw / 2, y + h / 2, s.label || '', {
          size: sw > 54 ? 11 : 9, mono: true, align: 'center', base: 'middle',
          color: s.free ? C.dim : C.ink
        });
      }
    });
    if (o.ticks !== false) {
      P.text(x, y + h + 6, '0', { size: 9, mono: true, color: C.faint });
      P.text(x + w, y + h + 6, total + ' KB', { size: 9, mono: true, color: C.faint, align: 'right' });
    }
    return scale;
  }

  /* a small table of request rows */
  function traceTable(P, x, y, steps, opts) {
    opts = opts || {};
    var rh = 22;
    P.text(x, y, 'request', { size: 10, mono: true, color: C.faint });
    P.text(x + 86, y, 'hole', { size: 10, mono: true, color: C.faint });
    P.text(x + 168, y, 'left over', { size: 10, mono: true, color: C.faint });
    steps.forEach(function (s, i) {
      var ry = y + 16 + i * rh;
      P.text(x, ry, s.req + ' KB', { size: 11, mono: true, color: C.ink });
      if (s.ok) {
        P.text(x + 86, ry, s.holeLabel + ' (' + s.holeSize + ')', { size: 11, mono: true, color: C.dim });
        P.text(x + 168, ry, s.leftover + ' KB', { size: 11, mono: true, color: s.leftover === 0 ? C.valid : C.accent });
      } else {
        P.text(x + 86, ry, 'none fits', { size: 11, mono: true, color: C.invalid });
        P.text(x + 168, ry, 'waits', { size: 11, mono: true, color: C.invalid });
      }
    });
  }

  /* ---------------- scene 1: the map ---------------- */

  function drawMap(P2, u) {
    var t = K.ease(K.beat(K.state.elapsed, 0, 3));
    title(P2, 'Contiguous allocation: one process, one uninterrupted block');
    P2.text(30, 44, 'Every scheme on this page assumes the same thing. If it breaks, paging replaces it.',
            { size: 12, color: C.dim });

    var segs = [
      { start: 0, size: 1024, free: false, kind: 'proc', label: 'one process' }
    ];
    memBar(P2, 60, 96, 780, 54, segs, 1024, { usedFill: C.accentDim });
    P2.text(60, 76, 'physical memory', { size: 11, mono: true, color: C.faint });
    P2.text(60, 168, 'the process occupies bytes 0 to 1023 with nothing of another process inside',
            { size: 11.5, color: C.dim });

    P2.alpha(t);
    P2.rect(60, 208, 250, 66, { fill: C.surface, stroke: C.border, sw: 1, radius: 3 });
    P2.text(72, 220, 'base register', { size: 10.5, mono: true, color: C.faint });
    P2.text(72, 238, '0', { size: 18, mono: true, color: C.ink });
    P2.rect(330, 208, 250, 66, { fill: C.surface, stroke: C.border, sw: 1, radius: 3 });
    P2.text(342, 220, 'limit register', { size: 10.5, mono: true, color: C.faint });
    P2.text(342, 238, '1024 KB', { size: 18, mono: true, color: C.ink });

    P2.alpha(1);
    P2.text(60, 306, 'Two questions follow from that one assumption:', { size: 12, bold: true, color: C.ink });
    P2.text(60, 330, '1.  where does the block go, when several free blocks are large enough?',
            { size: 12, color: C.dim });
    P2.text(60, 352, '2.  what happens to the free space as processes come and go?',
            { size: 12, color: C.dim });
    foot(P2, 'The answer to the first is a placement policy. The answer to the second is fragmentation.');
  }

  /* ---------------- scene 2: fixed partitioning ---------------- */

  function drawFixed(P2, u) {
    title(P2, 'Fixed partitioning: the partitions exist before the processes do');
    var segs = [];
    F.slots.forEach(function (p, i) {
      segs.push({ start: i * F.partKB, size: F.partKB, free: p === null,
                  kind: p ? 'proc' : 'hole', label: p ? p.n : 'free' });
    });
    memBar(P2, 40, 74, 820, 58, segs, CFG.fixed.totalKB, { usedFill: C.accentDim });

    /* internal waste, hatched inside each used partition */
    var scale = 820 / CFG.fixed.totalKB;
    F.slots.forEach(function (p, i) {
      if (!p) return;
      var frag = F.partKB - p.kb;
      if (frag <= 0) return;
      var x0 = 40 + (i * F.partKB + p.kb) * scale;
      var wf = frag * scale;
      P2.rect(x0, 74, wf, 58, { fill: PR.rgba(C.warn, 0.22), stroke: C.warn, sw: 1 });
      if (wf > 30) P2.text(x0 + wf / 2, 74 + 58 / 2, frag + '', { size: 10, mono: true, align: 'center', base: 'middle', color: C.warn });
    });

    P2.text(40, 156, 'shaded strip = the bytes of the partition this process does not use, and no one else can have',
            { size: 11, color: C.warn });

    var rows = [
      ['partitions', F.parts + ' of ' + F.partKB + ' KB'],
      ['placed', F.placedCount + ' processes'],
      ['internal waste', F.internalKB + ' KB'],
      ['free partitions', F.freeParts + ' \u00d7 ' + F.partKB + ' = ' + F.freeKB + ' KB'],
      ['unusable total', F.wasteKB + ' KB = ' + F.wastePct.toFixed(1) + ' per cent']
    ];
    rows.forEach(function (r, i) {
      var y = 194 + i * 26;
      P2.text(40, y, r[0], { size: 11.5, mono: true, color: C.faint });
      P2.text(210, y, r[1], { size: 12, mono: true, color: i === 4 ? C.invalid : C.ink, bold: i === 4 });
    });

    P2.rect(400, 190, 460, 74, { fill: C.surface, stroke: C.invalid, sw: 1, radius: 3 });
    P2.text(414, 202, 'P6 asks for 130 KB', { size: 12, bold: true, color: C.invalid });
    P2.text(414, 222, 'three partitions are free and none of them can hold it,',
            { size: 11.5, color: C.dim });
    P2.text(414, 242, 'because a partition is a container of one fixed size.',
            { size: 11.5, color: C.dim });

    foot(P2, 'The degree of multiprogramming is the number of partitions, not the number of processes waiting.');
  }

  /* ---------------- scene 3: variable partitioning ---------------- */

  function drawVariable(P2, u) {
    title(P2, 'Variable partitioning: the partition is cut to fit the request');
    var built = buildVMem();
    var segs = built.segs.map(function (s) { return { start: s.start, size: s.size, free: s.free, kind: s.kind, label: s.label }; });
    var total = built.end;

    var req = CFG.vmem.reqs[0];
    var res = place(segs, req, 'best', { rover: 0 });

    memBar(P2, 40, 74, 820, 56, segs, total, {});

    /* mark the chosen hole and its leftover */
    var scale = 820 / total;
    if (res.ok) {
      var hx = 40 + (res.holeSize === CFG.vmem.holes[1] ? CFG.vmem.holes[0] + CFG.vmem.fillerKB : 0) * scale;
      P2.arrow(40 + res.start * scale + 2, 148, 40 + res.start * scale + 2, 138,
               { stroke: C.accent, sw: 1.5, head: 8 });
      P2.text(40 + res.start * scale + 8, 150, 'P1 takes ' + req + ' KB of H2 (' + res.holeSize + ' KB)',
              { size: 11.5, color: C.accent, bold: true });
      P2.text(40 + (res.start + req) * scale + 6, 168, 'remainder ' + res.holeSize + ' \u2212 ' + req + ' = ' + res.leftover + ' KB stays a hole',
              { size: 11.5, color: C.dim });
    }

    P2.text(40, 200, 'The one arithmetic that every variable-partition question runs:', { size: 12, bold: true, color: C.ink });
    P2.text(40, 224, 'left over  =  size of the chosen hole  \u2212  size of the request', { size: 13, mono: true, color: C.accent });
    P2.text(40, 252, 'The remainder is not lost and it is not inside the allocation. It returns to the free list,', { size: 11.5, color: C.dim });
    P2.text(40, 272, 'at the address just past the allocation, and the next request may use it.', { size: 11.5, color: C.dim });

    P2.rect(40, 300, 820, 62, { fill: C.surface, stroke: C.border, sw: 1, radius: 3 });
    P2.text(54, 312, 'When a process leaves, its block becomes a hole. Two holes that touch are merged into one (coalescing);', { size: 11.5, color: C.dim });
    P2.text(54, 332, 'two holes separated by a live block are not. That single rule is why the largest hole can shrink while the total free space does not.', { size: 11.5, color: C.dim });

    foot(P2, 'Total free space is ' + M.vmemHoleSum + ' KB in ' + CFG.vmem.holes.length + ' holes. The largest is ' + Math.max.apply(null, CFG.vmem.holes) + ' KB.');
  }

  /* ---------------- scene 4: first fit ---------------- */

  function drawFirstFit(P2, u) {
    title(P2, 'First fit: scan from address zero, take the first hole that is large enough');
    var t = M.VAR.first;
    var built = buildVMem();
    var segs = built.segs.map(function (s) { return { start: s.start, size: s.size, free: s.free, kind: s.kind, label: s.label }; });
    var state = { rover: 0 };
    var shown = Math.min(4, Math.floor(u * 4) + 1);
    var steps = [];
    for (var i = 0; i < shown; i++) {
      var r = place(segs, CFG.vmem.reqs[i], 'first', state);
      if (r.ok) r.seg.label = 'P' + (i + 1);
      steps.push(r);
    }
    memBar(P2, 40, 72, 470, 54, segs, built.end, {});
    traceTable(P2, 545, 70, steps);

    var last = steps[steps.length - 1];
    P2.text(40, 150, 'request ' + CFG.vmem.reqs[shown - 1] + ' KB', { size: 12, bold: true, color: C.accent });
    if (last && !last.ok) {
      P2.text(40, 172, 'no hole from address zero onward is large enough, so it waits', { size: 11.5, color: C.invalid });
    } else if (last) {
      P2.text(40, 172, 'chosen: ' + last.holeLabel + ' of ' + last.holeSize + ' KB, leaving ' + last.leftover + ' KB', { size: 11.5, color: C.dim });
    }

    var rows = [
      ['placed', t.allocated + ' of 4'],
      ['free total', t.freeKB + ' KB'],
      ['largest hole', t.largest + ' KB'],
      ['holes', String(t.holes)]
    ];
    rows.forEach(function (row, i) {
      P2.text(40 + i * 190, 216, row[0], { size: 10.5, mono: true, color: C.faint });
      P2.text(40 + i * 190, 236, row[1], { size: 15, mono: true, color: C.ink, bold: true });
    });

    P2.rect(40, 268, 820, 96, { fill: C.surface, stroke: C.border, sw: 1, radius: 3 });
    P2.text(54, 280, 'Why it is the default in real kernels', { size: 12, bold: true, color: C.ink });
    P2.text(54, 302, 'It usually stops after a few holes, so it is cheap. The cost is that the low addresses are', { size: 11.5, color: C.dim });
    P2.text(54, 322, 'scanned again for every request, and the small leftovers pile up near the bottom of memory.', { size: 11.5, color: C.dim });
    P2.text(54, 344, 'Here that costs the last request: ' + t.freeKB + ' KB is free, and the largest hole is ' + t.largest + ' KB.', { size: 11.5, color: C.invalid });

    foot(P2, 'First fit is not optimal and never claims to be. It is the fastest of the four to run.');
  }

  /* ---------------- scene 5: best fit and worst fit ---------------- */

  function drawBestWorst(P2, u) {
    title(P2, 'The same four requests under best fit and under worst fit');
    var b = M.VAR.best, w = M.VAR.worst;

    P2.text(40, 46, 'best fit \u2014 the smallest hole that is large enough', { size: 11.5, bold: true, color: C.valid });
    memBar(P2, 40, 62, 820, 44, b.merged, 2500, { holeFill: C.surface2, ticks: false });
    P2.text(40, 118, 'all four placed; ' + b.freeKB + ' KB free in ' + b.holes + ' holes, largest ' + b.largest + ' KB',
            { size: 11, color: C.dim });

    P2.text(40, 156, 'worst fit \u2014 the largest hole, so the remainder is as big as possible', { size: 11.5, bold: true, color: C.warn });
    memBar(P2, 40, 172, 820, 44, w.merged, 2500, { holeFill: C.surface2, ticks: false });
    P2.text(40, 228, 'two placed; the third request of 468 KB is refused with ' + w.freeKB + ' KB free in ' + w.holes + ' holes, largest ' + w.largest + ' KB',
            { size: 11, color: C.invalid });

    P2.rect(40, 254, 400, 112, { fill: C.surface, stroke: C.border, sw: 1, radius: 3 });
    P2.text(54, 266, 'What best fit buys', { size: 12, bold: true, color: C.ink });
    P2.text(54, 288, 'the smallest possible leftover at each step, so the', { size: 11.5, color: C.dim });
    P2.text(54, 306, 'large holes survive for the large requests that', { size: 11.5, color: C.dim });
    P2.text(54, 324, 'will arrive later. It must scan every hole to know', { size: 11.5, color: C.dim });
    P2.text(54, 342, 'which one is smallest, so it is slower than first fit.', { size: 11.5, color: C.dim });

    P2.rect(460, 254, 400, 112, { fill: C.surface, stroke: C.border, sw: 1, radius: 3 });
    P2.text(474, 266, 'What worst fit destroys', { size: 12, bold: true, color: C.ink });
    P2.text(474, 288, 'it consumes the one hole big enough for a large', { size: 11.5, color: C.dim });
    P2.text(474, 306, 'request, and leaves remainders that are still too', { size: 11.5, color: C.dim });
    P2.text(474, 324, 'small for it. Textbook result: first fit and best fit', { size: 11.5, color: C.dim });
    P2.text(474, 342, 'beat worst fit on speed and on utilisation.', { size: 11.5, color: C.dim });

    foot(P2, 'Neither name is a promise. The stream decides, which is why the trace is written out and not guessed.');
  }

  /* ---------------- scene 6: next fit ---------------- */

  function drawNextFit(P2, u) {
    title(P2, 'Next fit: the same rule as first fit, starting where the last allocation stopped');
    var t = M.VAR.next;
    var built = buildVMem();
    var segs = built.segs.map(function (s) { return { start: s.start, size: s.size, free: s.free, kind: s.kind, label: s.label }; });
    var state = { rover: 0 };
    var steps = [];
    var shown = Math.min(4, Math.floor(u * 4) + 1);
    for (var i = 0; i < shown; i++) {
      var r = place(segs, CFG.vmem.reqs[i], 'next', state);
      if (r.ok) r.seg.label = 'P' + (i + 1);
      steps.push(r);
    }
    memBar(P2, 40, 72, 820, 50, segs, built.end, {});

    /* the rover */
    var scale = 820 / built.end;
    var roverSeg = segs[Math.min(state.rover, segs.length - 1)];
    if (roverSeg) {
      var rx = 40 + roverSeg.start * scale;
      P2.tri(rx - 7, 66, rx + 7, 66, rx, 56, { fill: C.warn });
      P2.text(rx, 40, 'rover', { size: 10, mono: true, align: 'center', color: C.warn });
    }

    traceTable(P2, 40, 140, steps);
    P2.text(300, 140, 'next fit differs from first fit in exactly one way:', { size: 12, bold: true, color: C.ink });
    P2.text(300, 164, 'the scan does not restart at address zero.', { size: 12, color: C.dim });
    P2.text(300, 192, 'That spreads the scan over the whole memory, so the', { size: 11.5, color: C.dim });
    P2.text(300, 210, 'low addresses are not re-read for every request.', { size: 11.5, color: C.dim });
    P2.text(300, 238, 'It also means the hole chosen depends on history:', { size: 11.5, color: C.dim });
    P2.text(300, 256, 'the same holes and the same request can give a', { size: 11.5, color: C.dim });
    P2.text(300, 274, 'different leftover from first fit.', { size: 11.5, color: C.dim });

    if (M.NEXTWITNESS) {
      P2.rect(300, 300, 560, 76, { fill: C.surface, stroke: C.warn, sw: 1, radius: 3 });
      P2.text(314, 312, 'witness found by search: holes ' + M.NEXTWITNESS.holes.join(', ') +
              ', then requests ' + M.NEXTWITNESS.r1 + ' and ' + M.NEXTWITNESS.r2, { size: 11, mono: true, color: C.ink });
      P2.text(314, 334, 'first fit leaves ' + M.NEXTWITNESS.firstLeft + ' KB of the ' + M.NEXTWITNESS.firstHole +
              ' KB hole; next fit leaves ' + M.NEXTWITNESS.nextLeft + ' KB of the ' + M.NEXTWITNESS.nextHole + ' KB hole',
              { size: 11, mono: true, color: C.warn });
      P2.text(314, 356, 'same holes, same requests, different result \u2014 the rover position is the only difference',
              { size: 10.5, color: C.dim });
    }

    foot(P2, 'On this stream next fit places ' + t.allocated + ' of 4, the same count as first fit, with a different layout.');
  }

  /* ---------------- scene 7: external fragmentation ---------------- */

  function drawExternal(P2, u) {
    title(P2, 'External fragmentation: enough free memory, in the wrong shape');
    var t = M.VAR.first;
    var frees = freeSegs(t.merged);
    var witness = M.COMPACT.witness || { req: 491, totalFree: t.freeKB, largest: t.largest };

    memBar(P2, 40, 70, 820, 44, t.merged, 2500, { holeFill: C.warnDim });

    /* bar chart of hole sizes against the request */
    var x0 = 60, y0 = 250, bw = 62, maxH = 90;
    var maxSize = Math.max.apply(null, frees.map(function (s) { return s.size; }).concat([witness.req]));
    frees.forEach(function (s, i) {
      var h = s.size / maxSize * maxH;
      P2.rect(x0 + i * bw, y0 - h, bw - 14, h, { fill: C.warnDim, stroke: C.warn, sw: 1, radius: 2 });
      P2.text(x0 + i * bw + (bw - 14) / 2, y0 - h - 4, String(s.size), { size: 10, mono: true, align: 'center', base: 'bottom', color: C.warn });
    });
    P2.line(x0, y0, x0 + frees.length * bw + 10, y0, { stroke: C.border, sw: 1 });

    var reqY = y0 - witness.req / maxSize * maxH;
    P2.line(x0, reqY, x0 + frees.length * bw + 10, reqY, { stroke: C.invalid, sw: 1.5, dash: [6, 4] });
    P2.text(x0 + frees.length * bw + 16, reqY, 'request ' + witness.req + ' KB', { size: 11, mono: true, color: C.invalid, base: 'middle' });

    P2.text(40, 274, 'the six holes left after the first-fit trace, in address order', { size: 10.5, color: C.faint });

    var box = [
      ['total free', witness.totalFree + ' KB'],
      ['largest single hole', witness.largest + ' KB'],
      ['request', witness.req + ' KB']
    ];
    box.forEach(function (r, i) {
      P2.text(560, 150 + i * 26, r[0], { size: 11, mono: true, color: C.faint });
      P2.text(760, 150 + i * 26, r[1], { size: 13, mono: true, color: i === 2 ? C.invalid : C.ink, align: 'right', bold: true });
    });

    P2.rect(40, 300, 820, 62, { fill: C.surface, stroke: C.invalid, sw: 1, radius: 3 });
    P2.text(54, 312, 'The test that separates the two failures:', { size: 12, bold: true, color: C.ink });
    P2.text(54, 332, 'total free < request  \u2192  capacity shortage', { size: 11.5, mono: true, color: C.invalid });
    P2.text(54, 350, 'total free \u2265 request but largest hole < request  \u2192  external fragmentation',
            { size: 11.5, mono: true, color: C.invalid });

    foot(P2, 'The free bytes are real. No contiguous request can reach them, and that is a different problem from having too little memory.');
  }

  /* ---------------- scene 8: internal against external ---------------- */

  function drawTwo(P2, u) {
    title(P2, 'Internal and external: the same word, two different places for the waste');

    /* left: fixed partitioning, waste inside */
    P2.text(40, 52, 'internal \u2014 the waste is inside an allocation', { size: 11.5, bold: true, color: C.warn });
    var segsL = [];
    F.slots.forEach(function (p, i) {
      segsL.push({ start: i * F.partKB, size: F.partKB, free: p === null, kind: p ? 'proc' : 'hole', label: p ? p.n : 'free' });
    });
    var sc = 380 / CFG.fixed.totalKB;
    segsL.forEach(function (s, i) {
      P2.rect(40 + s.start * sc, 66, s.size * sc, 40, {
        fill: s.free ? C.surface2 : C.accentDim, stroke: s.free ? C.border : C.accent, sw: 1, radius: 2
      });
    });
    F.slots.forEach(function (p, i) {
      if (!p) return;
      var frag = F.partKB - p.kb;
      if (frag <= 0) return;
      P2.rect(40 + (i * F.partKB + p.kb) * sc, 66, frag * sc, 40, { fill: PR.rgba(C.warn, 0.3), stroke: C.warn, sw: 1 });
    });
    P2.text(40, 118, 'the allocator has already given these bytes away', { size: 10.5, color: C.dim });
    P2.text(40, 138, 'it cannot see them in the free list at all', { size: 10.5, color: C.dim });
    P2.text(40, 164, F.internalKB + ' KB wasted, inside ' + F.internalBlocks + ' allocations,', { size: 11.5, mono: true, color: C.warn });
    P2.text(40, 182, 'the largest single piece being ' + M.FRAG.internalLargest + ' KB', { size: 11.5, mono: true, color: C.warn });
    P2.text(40, 208, 'compaction cannot recover it', { size: 11, color: C.invalid });
    P2.text(40, 226, 'paging does not remove it either', { size: 11, color: C.invalid });

    /* right: variable partitioning, waste between */
    P2.text(470, 52, 'external \u2014 the waste is between allocations', { size: 11.5, bold: true, color: C.warn });
    var t = M.VAR.first;
    var sc2 = 380 / 2500;
    t.merged.forEach(function (s) {
      P2.rect(470 + s.start * sc2, 66, Math.max(1, s.size * sc2), 40, {
        fill: s.free ? C.warnDim : (s.kind === 'filler' ? C.border : C.accentDim),
        stroke: s.free ? C.warn : C.border, sw: 1, radius: 2
      });
    });
    P2.text(470, 118, 'these bytes are in the free list and offered to every', { size: 10.5, color: C.dim });
    P2.text(470, 138, 'request, but only as ' + t.holes + ' separate pieces', { size: 10.5, color: C.dim });
    P2.text(470, 164, t.freeKB + ' KB free, in ' + t.holes + ' holes, largest ' + t.largest + ' KB,', { size: 11.5, mono: true, color: C.warn });
    P2.text(470, 182, 'average hole ' + M.FRAG.externalRatio.toFixed(1) + ' KB', { size: 11.5, mono: true, color: C.warn });
    P2.text(470, 208, 'compaction can recover it', { size: 11, color: C.valid });
    P2.text(470, 226, 'if relocation is dynamic', { size: 11, color: C.dim });

    P2.rect(40, 256, 820, 104, { fill: C.surface, stroke: C.border, sw: 1, radius: 3 });
    P2.text(54, 268, 'The one-line test', { size: 12, bold: true, color: C.ink });
    P2.text(54, 290, 'Ask who owns the wasted bytes. If the allocator has already handed them to a process, the waste is internal.', { size: 11.5, color: C.dim });
    P2.text(54, 310, 'If they are still on the free list but split, the waste is external. A system can have both at once, at', { size: 11.5, color: C.dim });
    P2.text(54, 330, 'different layers: a page table rounds each segment up (internal) while the segment holes are scattered (external).', { size: 11.5, color: C.dim });

    foot(P2, 'Fixed partitioning produces internal waste by construction; variable partitioning produces external waste by history.');
  }

  /* ---------------- scene 9: compaction ---------------- */

  function drawCompact(P2, u) {
    title(P2, 'Compaction: move the live blocks together so the holes become one');
    var c = M.COMPACT;
    P2.text(40, 46, 'before', { size: 11, mono: true, color: C.faint });
    memBar(P2, 40, 60, 820, 44, c.before.merged, 2500, { holeFill: C.warnDim, ticks: false });
    P2.text(40, 116, c.before.freeKB + ' KB free in ' + c.before.holes + ' holes, largest ' + c.before.largest + ' KB',
            { size: 11, color: C.warn });

    var shift = K.ease(K.clamp01((u - 0.15) / 0.5));
    P2.alpha(0.25 + 0.75 * shift);
    P2.text(40, 160, 'after', { size: 11, mono: true, color: C.faint });
    memBar(P2, 40, 174, 820, 44, c.after.segs, 2500, { holeFill: C.accentDim, ticks: false });
    P2.alpha(1);
    P2.text(40, 230, c.after.freeKB + ' KB free in one hole, largest ' + c.after.largest + ' KB',
            { size: 11, color: C.valid });

    P2.text(40, 258, 'bytes copied: ' + c.after.movedKB + ' KB in ' + c.after.movedBlocks + ' blocks', { size: 12, mono: true, color: C.ink, bold: true });
    P2.text(40, 280, 'the total free space did not change; only its shape did', { size: 11, color: C.dim });

    P2.rect(40, 304, 400, 108, { fill: C.surface, stroke: C.valid, sw: 1, radius: 3 });
    P2.text(54, 316, 'What it needs', { size: 12, bold: true, color: C.ink });
    P2.text(54, 338, 'dynamic relocation, so every address a process', { size: 11.5, color: C.dim });
    P2.text(54, 356, 'holds can be rewritten at run time. With static', { size: 11.5, color: C.dim });
    P2.text(54, 374, 'relocation the process cannot be moved at all,', { size: 11.5, color: C.dim });
    P2.text(54, 392, 'and compaction is not available.', { size: 11.5, color: C.dim });

    P2.rect(460, 304, 400, 108, { fill: C.surface, stroke: C.warn, sw: 1, radius: 3 });
    P2.text(474, 316, 'What it costs', { size: 12, bold: true, color: C.ink });
    P2.text(474, 338, 'copying, proportional to the live bytes moved,', { size: 11.5, color: C.dim });
    P2.text(474, 356, 'and a pause while nothing else runs. A block', { size: 11.5, color: C.dim });
    P2.text(474, 374, 'doing I/O must not move under the device, so', { size: 11.5, color: C.dim });
    P2.text(474, 392, 'it is pinned or the I/O goes through buffers.', { size: 11.5, color: C.dim });

    foot(P2, 'Compaction fixes external fragmentation only. It cannot recover one byte of internal waste.');
  }

  /* ---------------- scene 10: best fit is not best ---------------- */

  function drawNotBest(P2, u) {
    title(P2, 'Best fit is a name, not a result');
    P2.text(40, 46, 'A 1994 GATE question: blocks in increasing address order 50 used, 150 free, 300 used, 350 free, 600 used;',
            { size: 11.5, color: C.dim });
    P2.text(40, 64, 'requests 300, 25, 125, 50 arrive in that order. Which policy can satisfy all four?',
            { size: 11.5, color: C.dim });

    function row(P2, y, label, trace, color) {
      P2.text(40, y, label, { size: 11.5, mono: true, bold: true, color: color });
      var segs = trace.segs;
      var total = segs.reduce(function (a, s) { return a + s.size; }, 0);
      memBar(P2, 40, y + 18, 620, 32, coalesce(segs), total, { holeFill: C.warnDim });
      var okN = trace.allocated;
      P2.text(680, y + 26, okN + ' of 4 placed', { size: 12, mono: true, color: okN === 4 ? C.valid : C.invalid, bold: true });
      var lastFail = trace.steps.filter(function (s) { return !s.ok; })[0];
      if (lastFail) P2.text(680, y + 44, 'request ' + lastFail.req + ' KB waits', { size: 11, color: C.invalid });
    }

    row(P2, 100, 'first fit', M.OLD.first, C.valid);
    row(P2, 190, 'best fit', M.OLD.best, C.invalid);

    P2.rect(40, 268, 820, 90, { fill: C.surface, stroke: C.border, sw: 1, radius: 3 });
    P2.text(54, 280, 'Why the better-looking policy loses here', { size: 12, bold: true, color: C.ink });
    P2.text(54, 302, 'Best fit takes the smallest hole that works, so the 25 KB request is served from the 50 KB hole and leaves 25 KB.', { size: 11.5, color: C.dim });
    P2.text(54, 322, 'The 125 KB request then takes the 150 KB hole and leaves another 25 KB. Two 25 KB holes cannot hold 50 KB,', { size: 11.5, color: C.dim });
    P2.text(54, 342, 'because they are not adjacent. First fit had left the 50 KB hole intact and served it exactly.', { size: 11.5, color: C.dim });

    foot(P2, 'A trace decides a question. A policy name decides nothing.');
  }

  /* ---------------- scene 11: procedure ---------------- */

  function drawProcedure(P2, u) {
    title(P2, 'The procedure that answers an allocation question');

    var cards = [
      ['1', 'Fix what the question fixes', [
        'a partition table and one policy \u2192 one trace',
        'a count of processes \u2192 count placements',
        'a failure to explain \u2192 compare free total',
        'and largest hole'
      ]],
      ['2', 'Trace mechanically, in order', [
        'keep holes in address order',
        'take the request in the given order',
        'write the leftover immediately',
        'never reuse the original hole size'
      ]],
      ['3', 'Check the two diagnostics', [
        'internal: inside an allocation, so invisible',
        'external: free total enough, largest hole not',
        'compaction fixes the second, never the first',
        'first and best fit beat worst fit'
      ]]
    ];

    cards.forEach(function (c, i) {
      var x = 40 + i * 280;
      P2.rect(x, 60, 260, 200, { fill: C.surface, stroke: C.border, sw: 1, radius: 3 });
      P2.circle(x + 26, 88, 14, { fill: C.accentDim, stroke: C.accent, sw: 1 });
      P2.text(x + 26, 88, c[0], { size: 12, mono: true, align: 'center', base: 'middle', color: C.accent, bold: true });
      P2.text(x + 50, 80, c[1], { size: 12, bold: true, color: C.ink });
      c[2].forEach(function (line, j) {
        P2.text(x + 16, 116 + j * 30, line, { size: 10.5, color: C.dim });
      });
    });

    P2.rect(40, 280, 820, 84, { fill: C.surface, stroke: C.accent, sw: 1, radius: 3 });
    P2.text(54, 292, 'The three numbers every answer needs, on this page\'s own stream', { size: 12, bold: true, color: C.ink });
    var line = M.POLICIES.map(function (p) {
      var t = M.VAR[p];
      return p + ' ' + t.allocated + '/4';
    }).join('     ');
    P2.text(54, 316, line, { size: 13, mono: true, color: C.accent });
    P2.text(54, 340, 'free ' + M.VAR.best.freeKB + ' KB in ' + M.VAR.best.holes + ' holes after best fit, largest ' + M.VAR.best.largest + ' KB',
            { size: 11, mono: true, color: C.dim });

    foot(P2, 'Model checks: ' + PASSED + ' of ' + CHECKS.length + ' passed \u2014 every figure above is computed, not typed in.');
  }

  /* ---------------- dispatch ---------------- */

  var SCENE_DRAW = {
    map: drawMap,
    fixed: drawFixed,
    variable: drawVariable,
    firstfit: drawFirstFit,
    bestworst: drawBestWorst,
    nextfit: drawNextFit,
    external: drawExternal,
    twofrags: drawTwo,
    compaction: drawCompact,
    notbest: drawNotBest,
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

  /* ---------------- the checks panel ---------------- */

  function fillChecks() {
    var el = document.getElementById('checks');
    if (!el) return;
    var bad = CHECKS.length - PASSED;
    el.innerHTML = '<span class="k">Model checks</span>' +
      '<p class="small" style="margin:6px 0 0">' + PASSED + ' of ' + CHECKS.length + ' passed' +
      (bad ? ' \u2014 <strong>' + bad + ' failed</strong>' : '') + '</p>';
  }

  /* ---------------- boot ---------------- */

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
    FIXED: { parts: F.parts, partKB: F.partKB, internalKB: F.internalKB, freeKB: F.freeKB,
             wasteKB: F.wasteKB, wastePct: F.wastePct, placed: F.placedCount,
             rejected: F.rejected, slots: F.slots.map(function (s) { return s ? s.n : null; }) },
    VAR: M.POLICIES.reduce(function (acc, p) {
      acc[p] = { allocated: M.VAR[p].allocated, freeKB: M.VAR[p].freeKB,
                 largest: M.VAR[p].largest, holes: M.VAR[p].holes,
                 steps: M.VAR[p].steps.map(function (s) {
                   return { req: s.req, ok: s.ok, hole: s.holeLabel || null,
                            holeSize: s.holeSize || null, leftover: s.leftover === undefined ? null : s.leftover };
                 }) };
      return acc;
    }, {}),
    UNALLOTTED: M.unallotted,
    COMPACT: { movedKB: M.COMPACT.after.movedKB, freeKB: M.COMPACT.after.freeKB,
               witness: M.COMPACT.witness },
    LEFTOVER: M.LEFTOVER,
    NEXTWITNESS: M.NEXTWITNESS,
    SIM: M.SIM,
    OLD1994: { first: M.OLD.first.allocated, best: M.OLD.best.allocated },
    PASSED: PASSED,
    TOTAL: CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
