/* ==========================================================================
   algorithm-correctness-loop-invariants — lesson.js
   Four layers, in order:
     1. THE MODEL      — the array, the two searches, the max loop, and the
                         enumeration that counts invariant violations, wrong
                         answers and hangs.
     2. THE CHECKS     — each number the captions quote is recomputed here and
                         compared with the figure the caption states.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The claim under test is not "the loop looks right". It is: an invariant that
   holds at the top of every iteration, plus a guard that must fail, plus a
   variant that strictly decreases — and each of those three is counted here.
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
  var INK = PAL.ink, DIM = PAL.dim, FAINT = PAL.faint, ACC = PAL.accent;
  var INFO = PAL.info, VAL = PAL.valid, BAD = PAL.invalid, WARN = PAL.warn;
  var SURF2 = PAL.surface2, BORDER = PAL.border, SURF = PAL.surface;
  var ACCDIM = PAL.accentDim || '#d6efeb';
  var WARNDIM = PAL.warnDim || '#fbeed3';
  var BADDIM = PAL.invalidDim || '#fbe4e2';

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

  var A = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
  var AMAX = [3, 9, 4, 7, 1, 8];

  /* ---- the correct binary search, traced ---- */
  function search(arr, x) {
    var lo = 0, hi = arr.length - 1, steps = [], found = -1;
    while (lo <= hi) {
      var mid = (lo + hi) >> 1;
      var size = hi - lo + 1;
      if (arr[mid] === x) {
        steps.push({ lo: lo, hi: hi, mid: mid, val: arr[mid], size: size, hit: true });
        found = mid;
        break;
      }
      steps.push({ lo: lo, hi: hi, mid: mid, val: arr[mid], size: size, hit: false });
      if (arr[mid] < x) lo = mid + 1; else hi = mid - 1;
    }
    return { steps: steps, found: found, lo: lo, hi: hi, sizes: steps.map(function (s) { return s.size; }) };
  }

  /* ---- the invariant: "if x occurs, some occurrence is inside [lo,hi]" ---- */
  function invariantHolds(arr, x, lo, hi) {
    if (arr.indexOf(x) < 0) return true;             /* vacuously true when absent */
    for (var i = Math.max(0, lo); i <= Math.min(hi, arr.length - 1); i++) {
      if (arr[i] === x) return true;
    }
    return false;
  }

  /* ---- the GATE CSE 2008 program, verbatim in structure ---- */
  function buggy(arr, x, cap) {
    cap = cap || 200;
    var n = arr.length, i = 0, j = n - 1, steps = [];
    for (var t = 0; t < cap; t++) {
      var k = (i + j) >> 1;
      var size = j - i + 1;
      steps.push({ i: i, j: j, k: k, val: arr[k], size: size });
      if (arr[k] < x) i = k; else j = k;
      if (!(arr[k] !== x && i < j)) {
        return { halt: true, steps: steps, found: arr[k] === x, sizes: steps.map(function (s) { return s.size; }) };
      }
    }
    return { halt: false, steps: steps, found: false, sizes: steps.map(function (s) { return s.size; }) };
  }

  /* ---- option A of that question: exclude the probe, keep the guard i < j ---- */
  function fixedA(arr, x, cap) {
    cap = cap || 200;
    var n = arr.length, i = 0, j = n - 1;
    if (n === 0) return { halt: true, found: false };
    for (var t = 0; t < cap; t++) {
      var k = (i + j) >> 1;
      if (arr[k] < x) i = k + 1; else j = k - 1;
      if (!(arr[k] !== x && i < j)) return { halt: true, found: arr[k] === x };
    }
    return { halt: false, found: false };
  }

  /* ---- the complete fix: exclude the probe and test i <= j ---- */
  function completeFix(arr, x) {
    var lo = 0, hi = arr.length - 1, it = 0;
    while (lo <= hi) {
      var mid = (lo + hi) >> 1; it++;
      if (arr[mid] === x) return { found: true, it: it };
      if (arr[mid] < x) lo = mid + 1; else hi = mid - 1;
    }
    return { found: false, it: it };
  }

  /* ---- every sorted array of length 1..5 over 1..6 ---- */
  function smallArrays() {
    var out = [];
    var n, i;
    for (n = 1; n <= 5; n++) {
      (function () {
        var idx = new Array(n).fill(0);
        var total = 1;
        for (i = 0; i < n; i++) total *= 6;
        for (var t = 0; t < total; t++) {
          var v = [], rem = t;
          for (i = 0; i < n; i++) { v.push((rem % 6) + 1); rem = Math.floor(rem / 6); }
          v.sort(function (a, b) { return a - b; });
          out.push(v);
        }
      })();
    }
    /* deduplicate the sorted forms */
    var seen = {}, uniq = [];
    out.forEach(function (v) {
      var key = v.join(',');
      if (!seen[key]) { seen[key] = 1; uniq.push(v); }
    });
    uniq.sort(function (a, b) { return a.length - b.length || (a.join() < b.join() ? -1 : 1); });
    return uniq;
  }

  var TARGETS = [0, 1, 2, 3, 4, 5, 6, 7];

  var ENUM = (function () {
    var arrs = smallArrays();
    var cases = 0, invFail = 0, wrong = 0, probes = 0, maxProbes = 0, measFail = 0;
    var present = 0, presentHang = 0, absent = 0, absentHang = 0, buggyWrong = 0;
    var fixPresent = 0, fixMissed = 0, fixHang = 0;
    var goodPresent = 0, goodMissed = 0;

    arrs.forEach(function (arr) {
      TARGETS.forEach(function (x) {
        cases++;
        /* --- the correct loop --- */
        var r = search(arr, x);
        probes += r.steps.length;
        if (r.steps.length > maxProbes) maxProbes = r.steps.length;
        var lo = 0, hi = arr.length - 1;
        if (!invariantHolds(arr, x, lo, hi)) invFail++;
        for (var s = 0; s < r.steps.length; s++) {
          var st = r.steps[s];
          if (st.hit) break;
          var prevSize = st.size;
          if (arr[st.mid] < x) lo = st.mid + 1; else hi = st.mid - 1;
          if (!invariantHolds(arr, x, lo, hi)) invFail++;
          if (hi - lo + 1 >= prevSize) measFail++;
        }
        var brute = arr.indexOf(x);
        if ((r.found >= 0) !== (brute >= 0)) wrong++;
        var g = completeFix(arr, x);
        if (brute >= 0) { goodPresent++; if (!g.found) goodMissed++; }

        /* --- the 2008 program --- */
        var b = buggy(arr, x, 200);
        if (brute >= 0) {
          present++;
          if (!b.halt) presentHang++;
          else if (!b.found) buggyWrong++;
        } else {
          absent++;
          if (!b.halt) absentHang++;
        }

        /* --- option A only --- */
        var f = fixedA(arr, x, 200);
        if (brute >= 0) { fixPresent++; if (!f.halt) fixHang++; else if (!f.found) fixMissed++; }
      });
    });

    return {
      arrays: arrs.length, cases: cases,
      invFail: invFail, wrong: wrong, probes: probes, maxProbes: maxProbes, measFail: measFail,
      present: present, presentHang: presentHang, absent: absent, absentHang: absentHang,
      buggyWrong: buggyWrong,
      fixPresent: fixPresent, fixMissed: fixMissed, fixHang: fixHang,
      goodPresent: goodPresent, goodMissed: goodMissed
    };
  })();

  /* ---- the max loop, with its prefix invariant ---- */
  function maxLoop(arr) {
    var best = arr[0], rows = [{ i: 1, best: best, prefix: [arr[0]], ok: best === Math.max.apply(null, [arr[0]]) }];
    for (var i = 1; i < arr.length; i++) {
      if (arr[i] > best) best = arr[i];
      var prefix = arr.slice(0, i + 1);
      rows.push({ i: i + 1, best: best, prefix: prefix, ok: best === Math.max.apply(null, prefix) });
    }
    return { rows: rows, best: best };
  }

  var MAXTRACE = maxLoop(AMAX);

  var FIND23 = search(A, 23);
  var FIND3 = search(A, 3);
  var BUG3 = buggy(A, 3, 60);
  var FIX3 = fixedA(A, 3, 200);
  var FIX91 = fixedA(A, 91, 200);
  var GOOD91 = completeFix(A, 91);
  var AWRONG = (function () {
    var out = [];
    for (var x = 0; x < 100; x++) {
      var f = fixedA(A, x, 200);
      var present = A.indexOf(x) >= 0;
      if (f.halt && f.found !== present) out.push(x);
    }
    return out;
  })();

  var FACT10 = 3628800;
  var TESTCASES = FACT10 * 10;

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

  var CHECKS = [];
  function check(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail }); }

  check('search for 23 finds index 5 in 3 probes',
    FIND23.found === 5 && FIND23.steps.length === 3,
    'found=' + FIND23.found + ' probes=' + FIND23.steps.length);
  check('search for 23 window sizes are 10, 5, 2',
    FIND23.sizes.join(',') === '10,5,2', FIND23.sizes.join(','));
  check('search for 3 reports absent in 3 probes',
    FIND3.found === -1 && FIND3.steps.length === 3, 'probes=' + FIND3.steps.length);
  check('search for 3 window sizes are 10, 4, 1',
    FIND3.sizes.join(',') === '10,4,1', FIND3.sizes.join(','));
  check('invariant holds at every loop boundary in all ' + ENUM.cases + ' cases',
    ENUM.invFail === 0, 'violations=' + ENUM.invFail);
  check('correct loop never answers wrongly (' + ENUM.cases + ' cases)',
    ENUM.wrong === 0, 'wrong=' + ENUM.wrong);
  check('window size strictly decreases on every iteration',
    ENUM.measFail === 0, 'violations=' + ENUM.measFail);
  check('total probes equals the sum over cases (8091)',
    ENUM.probes === 8091, 'probes=' + ENUM.probes);
  check('at most 3 probes per search for length <= 5',
    ENUM.maxProbes === 3, 'max=' + ENUM.maxProbes);
  check('2008 program hangs on 246 of 1260 present cases',
    ENUM.present === 1260 && ENUM.presentHang === 246, ENUM.presentHang + '/' + ENUM.present);
  check('2008 program hangs on 1490 of 2428 absent cases',
    ENUM.absent === 2428 && ENUM.absentHang === 1490, ENUM.absentHang + '/' + ENUM.absent);
  check('2008 program never answers wrongly when it does answer',
    ENUM.buggyWrong === 0, 'wrong=' + ENUM.buggyWrong);
  check('2008 program on (A, 3) is the 2-cycle 0,1 -> 0,1',
    BUG3.halt === false && BUG3.steps[3] && BUG3.steps[4] &&
    BUG3.steps[3].i === 0 && BUG3.steps[3].j === 1 && BUG3.steps[3].k === 0 &&
    BUG3.steps[4].i === 0 && BUG3.steps[4].j === 1 && BUG3.steps[4].k === 0,
    BUG3.halt ? 'halted' : 'stalled at size ' + BUG3.sizes[BUG3.sizes.length - 1]);
  check('2008 program window sizes are 10, 5, 3, 2, 2',
    BUG3.sizes.slice(0, 5).join(',') === '10,5,3,2,2', BUG3.sizes.slice(0, 5).join(','));
  check('option A alone: no hangs, but 407 of 1260 present targets missed',
    ENUM.fixHang === 0 && ENUM.fixMissed === 407, 'hang=' + ENUM.fixHang + ' missed=' + ENUM.fixMissed + '/' + ENUM.fixPresent);
  check('option A alone is wrong on exactly 4 of targets 0..99 for the ten-value array',
    AWRONG.join(',') === '2,12,38,91', AWRONG.join(','));
  check('option A alone misses the last element 91',
    FIX91.halt === true && FIX91.found === false, 'found=' + FIX91.found);
  check('complete fix finds 91 and misses none of 1260',
    GOOD91.found === true && ENUM.goodMissed === 0, 'missed=' + ENUM.goodMissed);
  check('max loop invariant holds at every iteration on the six values',
    MAXTRACE.rows.every(function (r) { return r.ok; }) && MAXTRACE.best === 9,
    'best=' + MAXTRACE.best + ' rows=' + MAXTRACE.rows.length);
  check('max loop best sequence is 3, 9, 9, 9, 9, 9',
    MAXTRACE.rows.map(function (r) { return r.best; }).join(',') === '3,9,9,9,9,9',
    MAXTRACE.rows.map(function (r) { return r.best; }).join(','));
  check('10! x 10 = 36,288,000 as the caption states',
    TESTCASES === 36288000, String(TESTCASES));
  check('3,688 enumerated cases as the caption states',
    ENUM.cases === 3688, String(ENUM.cases));

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

  function tw(s, size, mono) { return String(s).length * size * (mono ? 0.6 : 0.52); }

  function wrap(x, y, text, maxW, o) {
    o = o || {};
    var size = o.size || 13;
    var words = String(text).split(' ');
    var line = '', ly = y, n = 0;
    for (var i = 0; i < words.length; i++) {
      var probe = line ? line + ' ' + words[i] : words[i];
      if (tw(probe, size, o.mono) > maxW && line) {
        P.text(x, ly, line, o); ly += size + 5; line = words[i]; n++;
        if (o.maxLines && n >= o.maxLines) return ly;
      } else line = probe;
    }
    if (line) { P.text(x, ly, line, o); ly += size + 5; }
    return ly;
  }

  function chip(x, y, label, ok) {
    var w = tw(label, 11, true) + 16;
    P.rect(x, y, w, 20, { fill: ok ? '#e7f5ea' : BADDIM, stroke: ok ? VAL : BAD, sw: 1, radius: 4 });
    P.text(x + 8, y + 10, label, { size: 11, mono: true, base: 'middle', color: ok ? VAL : BAD });
    return w;
  }

  function cell(x, y, w, h, val, o) {
    o = o || {};
    P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1.5, radius: 3 });
    P.text(x + w / 2, y + h / 2, String(val), { size: 14, mono: true, align: 'center', base: 'middle', color: o.color || INK, bold: !!o.bold });
  }

  /* the array row with an optional window, probe and target */
  function arrayRow(x0, y0, arr, o) {
    o = o || {};
    var cw = o.cw || 66, ch = o.ch || 34;
    for (var i = 0; i < arr.length; i++) {
      var inWin = (o.lo === undefined) || (i >= o.lo && i <= o.hi);
      var isMid = i === o.mid;
      cell(x0 + i * cw, y0, cw - 6, ch, arr[i], {
        fill: isMid ? ACCDIM : (inWin ? SURF : SURF2),
        stroke: isMid ? ACC : BORDER,
        sw: isMid ? 2.5 : 1.2,
        color: inWin ? INK : FAINT,
        bold: isMid
      });
      P.text(x0 + i * cw + (cw - 6) / 2, y0 + ch + 9, String(i), { size: 10, mono: true, align: 'center', color: FAINT });
    }
    if (o.target !== undefined) {
      P.text(x0, y0 - 20, 'target x = ' + o.target, { size: 12, mono: true, color: INFO });
    }
    return { cw: cw, ch: ch, w: arr.length * cw };
  }

  function bracket(x0, y0, cw, lo, hi, label, colour) {
    if (hi < lo) return;
    var x = x0 + lo * cw, w = (hi - lo + 1) * cw - 6;
    P.rect(x, y0, w, 4, { fill: colour || ACC, radius: 2 });
    P.text(x + w / 2, y0 - 6, label || ('[' + lo + ' .. ' + hi + ']'), { size: 11, mono: true, align: 'center', color: colour || ACC });
  }

  function bar(x, y, w, h, label, val, max, colour) {
    P.text(x, y + 10, label, { size: 11, mono: true, color: DIM });
    var bw = Math.max(2, (val / max) * (w - 90));
    P.rect(x + 80, y, bw, 14, { fill: colour || ACCDIM, stroke: colour || ACC, sw: 1.2, radius: 2 });
    P.text(x + 80 + bw + 6, y + 7, String(val), { size: 11, mono: true, base: 'middle', color: colour || ACC, bold: true });
  }

  var SCENE_DRAW = {};

  /* ---- 1. a loop is a claim ---- */
  SCENE_DRAW.claim = function (t, sc, p) {
    P.text(40, 26, 'Three questions, three independent answers', { size: 16, bold: true, color: INK });
    var rows = [
      ['Does it stop?', 'termination', 'a variant that strictly decreases'],
      ['Is the answer right?', 'partial correctness', 'an invariant plus the exit argument'],
      ['How fast is it?', 'complexity', 'a count of steps, and it implies neither']
    ];
    rows.forEach(function (r, i) {
      if (p < 0.08 + i * 0.12) return;
      var y = 66 + i * 62;
      P.alpha(Math.min(1, (p - (0.08 + i * 0.12)) / 0.08));
      P.rect(40, y, 470, 50, { fill: SURF, stroke: BORDER, sw: 1.2, radius: 6 });
      P.text(56, y + 18, r[0], { size: 14, bold: true, color: INK });
      P.text(56, y + 36, r[1] + ' — ' + r[2], { size: 11.5, mono: false, color: DIM });
      P.alpha(1);
    });

    if (p > 0.45) {
      P.rect(540, 66, 320, 190, { fill: SURF2, stroke: BORDER, sw: 1, radius: 6 });
      P.text(556, 84, 'binary search, the loop', { size: 11, mono: true, color: DIM });
      var code = ['lo = 0; hi = n - 1;', 'while (lo <= hi) {', '  mid = (lo + hi) / 2;', '  if (A[mid] == x) return mid;', '  if (A[mid] <  x) lo = mid + 1;', '  else            hi = mid - 1;', '}', 'return -1;'];
      code.forEach(function (c, i) { P.text(556, 104 + i * 18, c, { size: 11.5, mono: true, color: i >= 2 && i <= 5 ? INK : DIM }); });
    }
    if (p > 0.7) {
      P.text(540, 286, 'total correctness =', { size: 12, mono: true, color: ACC });
      P.text(540, 304, 'termination + partial correctness', { size: 12, mono: true, color: ACC });
      wrap(540, 330, 'No one of the three follows from another: a fast loop can be wrong, a right loop can run for ever, and a loop that stops with the right answer can still be slower than the exam allows.', 320, { size: 12, color: DIM });
    }
  };

  /* ---- 2. the window ---- */
  SCENE_DRAW.window = function (t, sc, p) {
    var r = arrayRow(40, 92, A, { target: 23, cw: 80, ch: 34 });
    P.text(40, 26, 'Invariant: if 23 occurs, an occurrence is inside the window', { size: 15, bold: true, color: INK });

    var step = Math.min(FIND23.steps.length, Math.floor(p * 4.4) + 1);
    var cur = FIND23.steps[step - 1];
    bracket(40, 152, 80, cur.lo, cur.hi, 'window ' + cur.lo + ' to ' + cur.hi + ', size ' + cur.size);
    /* redraw with the window shading */
    arrayRow(40, 92, A, { target: 23, cw: 80, ch: 34, lo: cur.lo, hi: cur.hi, mid: cur.mid });

    P.text(40, 182, 'probe ' + step + ': position ' + cur.mid + ', value ' + cur.val +
      (cur.hit ? ' — equals the target' : (cur.val < 23 ? ' — below the target, drop the left side' : ' — above the target, drop the right side')),
      { size: 12.5, mono: false, color: cur.hit ? VAL : INK });

    if (p > 0.55) {
      P.text(40, 216, 'the window after each probe', { size: 11, mono: true, color: DIM });
      FIND23.steps.forEach(function (s, i) {
        if (p < 0.55 + i * 0.12) return;
        bar(40, 232 + i * 26, 330, 14, 'probe ' + (i + 1) + '  [' + s.lo + ',' + s.hi + ']', s.size, 10, s.hit ? VAL : ACC);
      });
    }
    if (p > 0.75) {
      P.text(430, 216, 'Why the drop is safe', { size: 11, mono: true, color: DIM });
      wrap(430, 236, 'The array is sorted. If A[mid] < x then every index at or below mid holds a value at most A[mid], which is below x — so no occurrence can be on that side.', 420, { size: 12.5, color: INK });
      wrap(430, 300, 'Each probe removes a side that cannot hold the target, and the sentence stays true. That sentence is the invariant.', 420, { size: 12.5, color: DIM });
      chip(430, 360, FIND23.steps.length + ' probes for 10 values', true);
    }
  };

  /* ---- 3. initialization and maintenance ---- */
  SCENE_DRAW.threeobligations = function (t, sc, p) {
    P.text(40, 26, 'Two checks per iteration, and one before the loop', { size: 16, bold: true, color: INK });

    if (p > 0.04) {
      P.rect(40, 52, 400, 132, { fill: SURF, stroke: BORDER, sw: 1.2, radius: 6 });
      P.text(56, 72, '1  Initialization', { size: 13.5, bold: true, color: ACC });
      P.text(56, 92, 'before the first iteration: lo = 0, hi = n - 1', { size: 11.5, mono: true, color: INK });
      arrayRow(56, 112, A, { cw: 38, ch: 24, lo: 0, hi: 9 });
      P.text(56, 162, 'the window is every position, so the sentence is true', { size: 11.5, color: DIM });
    }
    if (p > 0.28) {
      P.rect(40, 200, 400, 210, { fill: SURF, stroke: BORDER, sw: 1.2, radius: 6 });
      P.text(56, 220, '2  Maintenance', { size: 13.5, bold: true, color: ACC });
      P.text(56, 242, 'case A[mid] < x  →  lo = mid + 1', { size: 11.5, mono: true, color: INK });
      P.text(56, 262, 'case A[mid] > x  →  hi = mid - 1', { size: 11.5, mono: true, color: INK });
      P.text(56, 282, 'case A[mid] = x  →  the loop exits here', { size: 11.5, mono: true, color: VAL });
      wrap(56, 306, 'Both moves keep only positions that could still hold the target, so the invariant is true again at the top of the next iteration.', 368, { size: 12, color: DIM });
      chip(56, 368, 'initialization + maintenance = induction', true);
    }
    if (p > 0.6) {
      P.rect(470, 52, 390, 358, { fill: SURF2, stroke: BORDER, sw: 1, radius: 6 });
      P.text(488, 74, 'What is not claimed', { size: 11, mono: true, color: DIM });
      wrap(488, 96, 'The invariant is not a statement about every line. While mid is being compared, the window is briefly neither the old one nor the new one.', 354, { size: 12.5, color: INK });
      wrap(488, 160, 'It is a statement about the two moments control reaches the top of the loop: once before the first iteration, and once after each body finishes.', 354, { size: 12.5, color: INK });
      P.rect(488, 250, 354, 56, { fill: WARNDIM, stroke: WARN, sw: 1.2, radius: 5 });
      P.text(500, 268, 'trap', { size: 10.5, mono: true, color: WARN });
      wrap(500, 284, 'An invariant that must hold on every line is a much stronger claim, and usually a false one.', 330, { size: 12, color: INK });
      if (p > 0.8) {
        P.text(488, 336, 'the induction, in one line', { size: 11, mono: true, color: DIM });
        P.text(488, 358, 'P(0) ∧ ∀k (P(k) → P(k+1))  ⟹  ∀k P(k)', { size: 12.5, mono: true, color: ACC });
      }
    }
  };

  /* ---- 4. the exit ---- */
  SCENE_DRAW.exit = function (t, sc, p) {
    P.text(40, 26, 'Searching for 3, which is absent', { size: 16, bold: true, color: INK });
    var step = Math.min(FIND3.steps.length, Math.floor(p * 4.2) + 1);
    var cur = FIND3.steps[step - 1];
    arrayRow(40, 92, A, { target: 3, cw: 80, ch: 34, lo: cur.lo, hi: cur.hi, mid: cur.mid });
    bracket(40, 152, 80, cur.lo, cur.hi, 'window ' + cur.lo + ' to ' + cur.hi + ', size ' + cur.size);
    P.text(40, 182, 'probe ' + step + ' at position ' + cur.mid + ': value ' + cur.val +
      (cur.val < 3 ? ' — below 3, move lo past mid' : ' — above 3, move hi below mid'), { size: 12.5, color: INK });

    if (p > 0.55) {
      P.rect(40, 200, 380, 120, { fill: BADDIM, stroke: BAD, sw: 1.2, radius: 6 });
      P.text(56, 220, 'the state after the last probe', { size: 11, mono: true, color: BAD });
      P.text(56, 246, 'lo = 1,  hi = 0', { size: 16, mono: true, color: INK, bold: true });
      P.text(56, 274, 'window size = hi − lo + 1 = 0', { size: 12, mono: true, color: INK });
      P.text(56, 296, 'the guard lo ≤ hi is false: the loop stops', { size: 12, color: DIM });
    }
    if (p > 0.72) {
      P.rect(440, 200, 420, 168, { fill: '#e7f5ea', stroke: VAL, sw: 1.2, radius: 6 });
      P.text(456, 220, 'the exit argument', { size: 11, mono: true, color: VAL });
      P.text(456, 246, 'invariant:  an occurrence would be in [lo,hi]', { size: 12, mono: true, color: INK });
      P.text(456, 268, 'not-guard:  [lo,hi] is empty', { size: 12, mono: true, color: INK });
      P.line(456, 282, 840, 282, { stroke: VAL, sw: 1 });
      P.text(456, 296, 'therefore:  no occurrence exists', { size: 12.5, mono: true, color: VAL, bold: true });
      wrap(456, 320, 'Two true sentences give a third. No array was tested to get here, and no array is mentioned.', 388, { size: 12, color: DIM });
      chip(456, 352, 'proof, not a test', true);
    }
  };

  /* ---- 5. the variant ---- */
  SCENE_DRAW.measure = function (t, sc, p) {
    P.text(40, 26, 'The variant: a positive integer that strictly decreases', { size: 16, bold: true, color: INK });
    P.text(40, 52, 'here it is the window size, hi − lo + 1, measured at the top of each iteration', { size: 12, color: DIM });

    var seq = [10, 4, 1, 0];
    var n = Math.min(seq.length, Math.floor(p * 5) + 1);
    for (var i = 0; i < n; i++) {
      var y = 92 + i * 44;
      bar(40, y, 420, 16, 'iteration ' + i, seq[i], 10, seq[i] === 0 ? BAD : ACC);
      if (i > 0) {
        P.arrow(492, y + 8, 492, y - 28, { stroke: DIM, sw: 1.2, head: 7 });
        P.text(504, y - 6, '−' + (seq[i - 1] - seq[i]), { size: 11, mono: true, color: DIM });
      }
    }
    if (p > 0.5) {
      P.text(40, 330, 'why it must decrease', { size: 11, mono: true, color: DIM });
      P.text(40, 352, 'A[mid] < x  →  lo = mid + 1  →  lo grows by at least 1', { size: 12, mono: true, color: INK });
      P.text(40, 372, 'A[mid] > x  →  hi = mid − 1  →  hi shrinks by at least 1', { size: 12, mono: true, color: INK });
      P.text(40, 400, 'so the size drops by at least one, every time', { size: 12.5, color: ACC, bold: true });
    }
    if (p > 0.7) {
      P.rect(560, 92, 300, 300, { fill: SURF2, stroke: BORDER, sw: 1, radius: 6 });
      P.text(578, 114, 'the argument', { size: 11, mono: true, color: DIM });
      wrap(578, 136, 'A positive integer cannot strictly decrease for ever. After at most n iterations the window is empty and the guard fails.', 264, { size: 12.5, color: INK });
      wrap(578, 214, 'Termination needs only the decrease. The logarithmic running time needs a separate halving argument — a different claim.', 264, { size: 12.5, color: INK });
      chip(578, 300, '0 exceptions in 8,091 probes', true);
      chip(578, 330, 'variant ≠ invariant', true);
    }
  };

  /* ---- 6. the 2008 program ---- */
  SCENE_DRAW.gateverdict = function (t, sc, p) {
    P.text(40, 26, 'The erroneous binary search, and the state that repeats', { size: 15.5, bold: true, color: INK });

    P.rect(40, 50, 380, 250, { fill: SURF2, stroke: BORDER, sw: 1, radius: 6 });
    var code = [
      'i = 0;  j = 9;',
      'do {',
      '  k = (i + j) / 2;',
      '  if (Y[k] < x) i = k;',
      '  else          j = k;',
      '} while (Y[k] != x && i < j);'
    ];
    code.forEach(function (c, i) {
      var hot = (i === 3 || i === 4) && p > 0.2;
      if (hot) P.rect(48, 66 + i * 30, 364, 24, { fill: WARNDIM, radius: 3 });
      P.text(56, 72 + i * 30, c, { size: 12, mono: true, color: hot ? WARN : INK, bold: hot });
    });
    P.text(56, 262, 'the probe k stays inside the new window', { size: 11.5, color: WARN });
    P.text(56, 282, 'so the window may not shrink at all', { size: 11.5, color: DIM });

    var step = Math.min(BUG3.steps.length, Math.floor(p * 6) + 1);
    var cur = BUG3.steps[Math.min(step, 4) - 1];
    P.text(440, 58, 'search for 3 in the ten-value array', { size: 11, mono: true, color: DIM });
    arrayRow(440, 92, A, { cw: 46, ch: 26, lo: cur.i, hi: cur.j, mid: cur.k, target: 3 });
    P.text(440, 152, 'i = ' + cur.i + ',  j = ' + cur.j + ',  k = ' + cur.k + ',  Y[k] = ' + cur.val, { size: 12.5, mono: true, color: INK });

    if (p > 0.35) {
      P.text(440, 186, 'window size per iteration', { size: 11, mono: true, color: DIM });
      BUG3.sizes.slice(0, 6).forEach(function (s, i) {
        if (p < 0.35 + i * 0.07) return;
        bar(440, 202 + i * 24, 250, 12, 'iter ' + i, s, 10, i >= 3 ? BAD : ACC);
      });
    }
    if (p > 0.72) {
      P.rect(440, 350, 420, 84, { fill: BADDIM, stroke: BAD, sw: 1.2, radius: 6 });
      P.text(456, 370, 'stuck at 2 — the variant never decreases', { size: 12.5, mono: true, color: BAD, bold: true });
      wrap(456, 392, 'i = 0, j = 1 gives k = 0 for ever: the state repeats, so the loop repeats, and the program prints nothing at all.', 388, { size: 12, color: INK });
    }
  };

  /* ---- 7. the enumeration ---- */
  SCENE_DRAW.exhaustive = function (t, sc, p) {
    P.text(40, 26, 'Every claim on this page, counted over the whole small input space', { size: 15.5, bold: true, color: INK });
    P.text(40, 50, ENUM.arrays + ' sorted arrays of length 1 to 5 over values 1 to 6, each with 8 targets = ' + ENUM.cases + ' cases', { size: 12, mono: false, color: DIM });

    var cards = [
      ['the correct loop', [
        ['invariant violations', ENUM.invFail, true],
        ['wrong answers', ENUM.wrong, true],
        ['probes in total', ENUM.probes, true],
        ['most probes in one search', ENUM.maxProbes, true]
      ]],
      ['the 2008 program', [
        ['hangs, target present', ENUM.presentHang + ' of ' + ENUM.present, false],
        ['hangs, target absent', ENUM.absentHang + ' of ' + ENUM.absent, false],
        ['wrong answers when it answers', ENUM.buggyWrong, true]
      ]]
    ];
    cards.forEach(function (c, ci) {
      if (p < 0.06 + ci * 0.22) return;
      var x = 40 + ci * 430, y = 84;
      P.alpha(Math.min(1, (p - (0.06 + ci * 0.22)) / 0.1));
      P.rect(x, y, 410, 250, { fill: SURF, stroke: ci === 0 ? VAL : BAD, sw: 1.4, radius: 6 });
      P.text(x + 16, y + 22, c[0], { size: 13.5, bold: true, color: ci === 0 ? VAL : BAD });
      c[1].forEach(function (row, i) {
        var ry = y + 56 + i * 44;
        P.text(x + 16, ry, row[0], { size: 12, color: DIM });
        P.text(x + 394, ry, String(row[1]), { size: 15, mono: true, align: 'right', color: row[2] ? VAL : BAD, bold: true });
        P.line(x + 16, ry + 20, x + 394, ry + 20, { stroke: BORDER, sw: 0.8 });
      });
      P.alpha(1);
    });
    if (p > 0.72) {
      wrap(40, 356, 'Zero wrong answers in the right-hand column is the trap, not the reassurance: a hang produces no output at all, so a test that compares output never sees a wrong answer — it sees nothing.', 800, { size: 12.5, color: INK });
      chip(40, 410, 'smallest hang: array 1, 1 with target 2', false);
    }
  };

  /* ---- 8. the intended correction ---- */
  SCENE_DRAW.fixedonly = function (t, sc, p) {
    P.text(40, 26, 'Option A restores termination and leaves the answer wrong', { size: 15.5, bold: true, color: INK });

    if (p > 0.04) {
      P.rect(40, 56, 410, 130, { fill: SURF, stroke: BORDER, sw: 1.2, radius: 6 });
      P.text(56, 76, 'option A: exclude the probe, keep the guard i < j', { size: 12, mono: true, color: INK });
      P.text(56, 102, 'i = k + 1;  j = k − 1;   while (... && i < j)', { size: 12, mono: true, color: ACC });
      P.text(56, 132, 'hangs: 0 of ' + ENUM.cases + ' cases', { size: 12.5, mono: true, color: VAL, bold: true });
      P.text(56, 156, 'missed present targets: ' + ENUM.fixMissed + ' of ' + ENUM.fixPresent, { size: 12.5, mono: true, color: BAD, bold: true });
    }
    if (p > 0.3) {
      P.rect(470, 56, 390, 130, { fill: '#e7f5ea', stroke: VAL, sw: 1.2, radius: 6 });
      P.text(486, 76, 'complete fix: also test i ≤ j', { size: 12, mono: true, color: INK });
      P.text(486, 102, 'while (lo <= hi)', { size: 12, mono: true, color: VAL });
      P.text(486, 132, 'missed present targets: ' + ENUM.goodMissed + ' of ' + ENUM.goodPresent, { size: 12.5, mono: true, color: VAL, bold: true });
      P.text(486, 156, 'and it finds 91, which option A reports absent', { size: 11.5, color: DIM });
    }
    if (p > 0.55) {
      P.text(40, 212, 'the window option A never looks at', { size: 11, mono: true, color: DIM });
      arrayRow(40, 240, A, { cw: 80, ch: 30, lo: 9, hi: 9, mid: 9 });
      P.text(40, 240 + 30 + 26, 'window [9, 9], target 91', { size: 11, mono: true, color: INFO });
      P.text(40, 312, 'i = 9, j = 9: the guard i < j fails, so position 9 is never compared with 91', { size: 12, color: BAD });
      P.text(40, 334, 'on this array the same happens at positions 0, 3, 6 and 9 — targets 2, 12, 38 and 91', { size: 12, color: DIM });
    }
    if (p > 0.78) {
      P.rect(40, 352, 820, 82, { fill: SURF2, stroke: BORDER, sw: 1, radius: 6 });
      P.text(56, 372, 'why the invariant finds it', { size: 11, mono: true, color: DIM });
      wrap(56, 392, 'At the exit the invariant must still be true. With i = j the window is not empty, so an occurrence can still be inside it — and the program reports "absent" while the sentence is still saying otherwise. Termination and correctness are two repairs, not one.', 788, { size: 12.5, color: INK });
    }
  };

  /* ---- 9. the max loop ---- */
  SCENE_DRAW.maxloop = function (t, sc, p) {
    P.text(40, 26, 'The same three obligations, on a loop that is not a search', { size: 15.5, bold: true, color: INK });
    var k = Math.min(MAXTRACE.rows.length, Math.floor(p * 6) + 1);
    var row = MAXTRACE.rows[k - 1];
    arrayRow(40, 88, AMAX, { cw: 64, ch: 34, lo: 0, hi: row.i - 1, mid: row.i - 1 });
    P.text(40, 66, 'prefix examined: positions 0 to ' + (row.i - 1), { size: 11.5, mono: true, color: DIM });
    P.text(40, 152, 'best = ' + row.best + '  after ' + row.i + ' iteration' + (row.i === 1 ? '' : 's'), { size: 13, mono: true, color: INK });
    P.text(40, 172, 'max of the prefix = ' + Math.max.apply(null, row.prefix), { size: 12, mono: true, color: DIM });
    chip(40, 190, row.ok ? 'invariant holds' : 'invariant fails', row.ok);

    if (p > 0.4) {
      P.text(40, 214, 'best after each iteration', { size: 11, mono: true, color: DIM });
      MAXTRACE.rows.forEach(function (r, i) {
        if (p < 0.4 + i * 0.08) return;
        bar(40, 232 + i * 26, 300, 13, 'i = ' + r.i, r.best, 9, ACC);
      });
    }
    if (p > 0.62) {
      P.rect(430, 88, 430, 240, { fill: SURF2, stroke: BORDER, sw: 1, radius: 6 });
      P.text(446, 108, 'the three obligations, restated', { size: 11, mono: true, color: DIM });
      var lines = [
        ['initialization', 'i = 1, prefix is position 0, best = A[0]'],
        ['maintenance', 'either A[i] is larger and best becomes it, or best already was the maximum'],
        ['exit', 'i = n, the prefix is the whole array, so best is the maximum'],
        ['variant', 'n − i, which drops by one every iteration']
      ];
      lines.forEach(function (l, i) {
        P.text(446, 134 + i * 46, l[0], { size: 11.5, mono: true, color: ACC });
        wrap(446, 150 + i * 46, l[1], 398, { size: 11.5, color: INK, maxLines: 2 });
      });
    }
    if (p > 0.85) {
      P.text(430, 352, 'the method is not about searching; it is about what stays true', { size: 12, color: ACC, bold: true });
    }
  };

  /* ---- 10. testing versus proof ---- */
  SCENE_DRAW.testing = function (t, sc, p) {
    P.text(40, 26, 'The size of the input space, and the size of the proof', { size: 15.5, bold: true, color: INK });

    if (p > 0.04) {
      P.rect(40, 60, 400, 150, { fill: SURF, stroke: BORDER, sw: 1.2, radius: 6 });
      P.text(56, 82, 'testing one array length', { size: 11, mono: true, color: DIM });
      P.text(56, 108, '10!  =  3,628,800', { size: 13, mono: true, color: INK });
      P.text(56, 132, '× 10 targets', { size: 13, mono: true, color: DIM });
      P.text(56, 162, '36,288,000 cases', { size: 17, mono: true, color: BAD, bold: true });
      P.text(56, 188, 'for one length — and the exam can use any length', { size: 11.5, color: DIM });
    }
    if (p > 0.26) {
      P.rect(470, 60, 390, 150, { fill: '#e7f5ea', stroke: VAL, sw: 1.2, radius: 6 });
      P.text(486, 82, 'proving all lengths at once', { size: 11, mono: true, color: VAL });
      P.text(486, 110, '1. initialization: true before the loop', { size: 12, mono: true, color: INK });
      P.text(486, 132, '2. maintenance: true again each time', { size: 12, mono: true, color: INK });
      P.text(486, 154, '3. exit: invariant + not-guard ⟹ answer', { size: 12, mono: true, color: INK });
      P.text(486, 176, '4. variant: the loop must end', { size: 12, mono: true, color: INK });
      P.text(486, 200, 'no array is named anywhere in the four lines', { size: 11.5, color: DIM });
    }
    if (p > 0.52) {
      P.text(40, 246, 'the two sentences, and what each one buys', { size: 11, mono: true, color: DIM });
      P.rect(40, 264, 400, 70, { fill: ACCDIM, stroke: ACC, sw: 1.2, radius: 6 });
      P.text(56, 284, 'invariant', { size: 12.5, mono: true, color: ACC, bold: true });
      P.text(56, 306, 'carries the answer: what is true at the top', { size: 12, color: INK });
      P.text(56, 324, 'proved by initialization + maintenance', { size: 11.5, color: DIM });
      P.rect(470, 264, 390, 70, { fill: WARNDIM, stroke: WARN, sw: 1.2, radius: 6 });
      P.text(486, 284, 'variant', { size: 12.5, mono: true, color: WARN, bold: true });
      P.text(486, 306, 'carries the ending: what strictly decreases', { size: 12, color: INK });
      P.text(486, 324, 'proved by counting, not by induction on truth', { size: 11.5, color: DIM });
    }
    if (p > 0.78) {
      P.text(40, 366, 'a passing test suite is evidence; these four lines are a proof', { size: 13, color: INK, bold: true });
      chip(40, 392, 'read every loop as these three claims', true);
    }
  };

  function drawFrame(t) {
    if (!P) return;
    P.clear();
    P.alpha(1);
    var i = K.sceneAt ? K.sceneAt(t) : 0;
    var sc = window.LESSON_TIMELINE.scenes[i];
    if (!sc) return;
    var span = Math.max(0.001, sc.end - sc.start);
    var p = K.clamp01((t - sc.start) / span);
    var fn = SCENE_DRAW[sc.id];
    if (fn) {
      try { fn(t, sc, p); }
      catch (e) { P.text(24, 240, 'draw error: ' + e.message, { size: 12, color: BAD }); }
    }
  }

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

  function fillChecks() {
    var el = document.getElementById('checks');
    if (!el) return;
    var bad = CHECKS.filter(function (c) { return !c.pass; });
    el.innerHTML = '<span class="k">Model checks</span>' +
      '<p class="small" style="margin:4px 0 0">' + (CHECKS.length - bad.length) + ' of ' + CHECKS.length +
      ' passed' + (bad.length ? ' \u2014 ' + bad.map(function (c) { return c.name; }).join('; ') : '') + '</p>';
  }

  function boot() {
    fillChecks();
    var holder = document.getElementById('canvas-holder');
    var fallback = document.getElementById('canvas-fallback');
    var ok = false;

    if (typeof window.createCanvas === 'function' && PR) {
      try {
        var sk = new window.p5(function (s) {
          s.setup = function () {
            var c = s.createCanvas(W, H);
            if (c && c.parent) c.parent(holder);
            s.pixelDensity(1);
            s.noLoop();
            P = PR.makePainterP5(s, W, H);
            drawFrame(K.state.elapsed);
          };
          s.draw = function () { drawFrame(K.state.elapsed); };
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
          drawFrame(0);
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
        draw: function () { if (P) drawFrame(K.state.elapsed); }
      });
    }

    window.__drawAt = function (t) {
      K.state.elapsed = t;
      if (P) drawFrame(t);
    };
    window.__lessonChecks = CHECKS;
    window.__model = { ENUM: ENUM, FIND23: FIND23, FIND3: FIND3, BUG3: BUG3, CHECKS: CHECKS };

    var bad = CHECKS.filter(function (c) { return !c.pass; });
    if (bad.length) console.warn('Model validation did not fully pass:', bad);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
