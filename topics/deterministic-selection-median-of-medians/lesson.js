/* ==========================================================================
   deterministic-selection-median-of-medians — lesson.js
   Four layers, in order:
     1. THE MODEL      — the selection problem, quickselect, the median-of-
                         medians algorithm with groups of g, and the two
                         recurrences. Every comparison is counted, not assumed.
     2. THE CHECKS     — each number the captions quote is recomputed here and
                         compared with the figure the caption states.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The claim under test is one sentence: the median of medians gives a pivot
   with at least 3n/10 - 6 keys on each side, so selection runs in O(n)
   comparisons in the worst case. The counting lemma is checked on real calls,
   the guarantee is checked at every level, and the comparison counts the
   captions quote are the counts this file makes.
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

  /* ---- a comparison counter ---- */
  function ctr() { return { n: 0 }; }
  function lt(a, b, c) { c.n++; return a < b; }

  /* ---- the median of five distinct keys, in at most 7 comparisons ----
     Four comparisons bracket the smallest and the largest of four of the
     five; three of the four survivors are then ordered against the fifth.
     Checked below against all 120 orderings of five distinct keys. */
  function median5(g, c) {
    var a = g[0], b = g[1], cc = g[2], d = g[3], e = g[4];
    var lo1, hi1, lo2, hi2;
    if (lt(a, b, c)) { lo1 = a; hi1 = b; } else { lo1 = b; hi1 = a; }
    if (lt(cc, d, c)) { lo2 = cc; hi2 = d; } else { lo2 = d; hi2 = cc; }
    /* the larger of the two highs is the maximum of the four -> discard it */
    var m1, m2;
    if (lt(hi1, hi2, c)) { m1 = hi1; m2 = hi2; } else { m1 = hi2; m2 = hi1; }
    /* the smaller of the two lows is the minimum of the four -> discard it */
    var n1, n2;
    if (lt(lo1, lo2, c)) { n1 = lo2; n2 = lo1; } else { n1 = lo1; n2 = lo2; }
    /* the two middle keys of the four are m1 and n1; add the fifth */
    var x = m1, y = n1;
    if (lt(x, y, c)) {
      if (lt(y, e, c)) return y;
      if (lt(x, e, c)) return e;
      return x;
    }
    if (lt(x, e, c)) return x;
    if (lt(y, e, c)) return e;
    return y;
  }

  /* ---- insertion sort with counted comparisons, for a short group ---- */
  function sortSmall(a, c) {
    var s = a.slice();
    for (var i = 1; i < s.length; i++) {
      var x = s[i], j = i - 1;
      while (j >= 0) {
        if (lt(x, s[j], c)) { s[j + 1] = s[j]; j--; } else break;
      }
      s[j + 1] = x;
    }
    return s;
  }

  /* ---- SELECT: median of medians with group size g ----
     Cost model, applied uniformly: one comparison per element tested against
     the pivot in the partition, and the real comparison count inside the
     group-median step and inside the short base case. */
  function select(arr, k, g, c, log, depth) {
    var n = arr.length;
    depth = depth || 0;
    if (n <= g) {
      var base = sortSmall(arr, c);
      return base[k - 1];
    }
    var groups = [], meds = [], i, grp;
    for (i = 0; i < n; i += g) groups.push(arr.slice(i, i + g));
    for (i = 0; i < groups.length; i++) {
      grp = groups[i];
      if (grp.length === g) meds.push(median5(grp, c));
      else meds.push(sortSmall(grp, c)[Math.floor((grp.length - 1) / 2)]);
    }
    var mm = select(meds, Math.floor((meds.length + 1) / 2), g, c, null, depth + 1);

    var lo = [], hi = [], eq = 0;
    for (i = 0; i < n; i++) {
      c.n++;                       /* one test of arr[i] against the pivot */
      if (arr[i] < mm) lo.push(arr[i]);
      else if (arr[i] > mm) hi.push(arr[i]);
      else eq++;
    }
    if (log) log.push({ n: n, less: lo.length, greater: hi.length, pivot: mm, depth: depth });

    if (k <= lo.length) return select(lo, k, g, c, log, depth + 1);
    if (k <= lo.length + eq) return mm;
    return select(hi, k - lo.length - eq, g, c, log, depth + 1);
  }

  function selectRun(arr, k, g) {
    var c = ctr(), log = [];
    var v = select(arr.slice(), k, g || 5, c, log, 0);
    return { value: v, cmp: c.n, log: log };
  }

  /* ---- the demo array: 25 keys in five groups of five ---- */
  var DEMO = [23, 8, 41, 3, 17, 35, 12, 29, 6, 44,
              19, 2, 38, 25, 10, 31, 14, 47, 5, 21,
              36, 9, 27, 16, 42];
  var DEMO_GROUPS = [], i;
  for (i = 0; i < 25; i += 5) DEMO_GROUPS.push(DEMO.slice(i, i + 5));
  var DEMO_MEDS = [];
  for (i = 0; i < DEMO_GROUPS.length; i++) {
    DEMO_MEDS.push(sortSmall(DEMO_GROUPS[i], ctr())[2]);
  }
  var DEMO_MEDS_SORTED = sortSmall(DEMO_MEDS, ctr());
  var DEMO_MOM = DEMO_MEDS_SORTED[2];
  var DEMO_LESS = DEMO.filter(function (v) { return v < DEMO_MOM; }).length;
  var DEMO_GREATER = DEMO.filter(function (v) { return v > DEMO_MOM; }).length;
  var DEMO_SORTED = sortSmall(DEMO, ctr());
  var DEMO_MOM_RANK = DEMO_SORTED.indexOf(DEMO_MOM) + 1;
  var DEMO_SELECT = selectRun(DEMO, 13, 5);

  /* ---- the second array, where the median of medians is NOT the median ---- */
  var DEMO2 = [66, 49, 94, 1, 85, 8, 20, 75, 5, 38,
               3, 34, 60, 76, 98, 54, 50, 73, 56, 17,
               46, 12, 4, 80, 63];
  var DEMO2_GROUPS = [];
  for (i = 0; i < 25; i += 5) DEMO2_GROUPS.push(DEMO2.slice(i, i + 5));
  var DEMO2_MEDS = [];
  for (i = 0; i < DEMO2_GROUPS.length; i++) DEMO2_MEDS.push(sortSmall(DEMO2_GROUPS[i], ctr())[2]);
  var DEMO2_MOM = sortSmall(DEMO2_MEDS, ctr())[2];
  var DEMO2_RANK = sortSmall(DEMO2, ctr()).indexOf(DEMO2_MOM) + 1;

  /* ---- median of five: the worst case over all 120 orderings ---- */
  var MED5_WORST = (function () {
    var perm = [0, 1, 2, 3, 4], worst = 0, bad = 0;
    function permute(k) {
      if (k === 5) {
        var c = ctr(), m = median5(perm, c);
        if (m !== 2) bad++;
        if (c.n > worst) worst = c.n;
        return;
      }
      for (var j = k; j < 5; j++) {
        var t = perm[k]; perm[k] = perm[j]; perm[j] = t;
        permute(k + 1);
        t = perm[k]; perm[k] = perm[j]; perm[j] = t;
      }
    }
    permute(0);
    return { worst: worst, bad: bad };
  })();

  /* ---- the counting lemma, checked at every call of a real run ---- */
  function guaranteeSlack(arr, k) {
    var run = selectRun(arr, k, 5), worst = Infinity;
    for (var j = 0; j < run.log.length; j++) {
      var L = run.log[j];
      if (L.n < 6) continue;
      var bound = 3 * L.n / 10 - 6;
      worst = Math.min(worst, L.less - bound, L.greater - bound);
    }
    return worst;
  }
  function seeded(seed) {
    var s = seed;
    return function () { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  }
  function shuffled(n, seed) {
    var rng = seeded(seed), a = [], j, t;
    for (j = 0; j < n; j++) a.push(j);
    for (j = n - 1; j > 0; j--) {
      var p = Math.floor(rng() * (j + 1));
      t = a[j]; a[j] = a[p]; a[p] = t;
    }
    return a;
  }

  var GUARANTEE_WORST = (function () {
    var worst = Infinity, sizes = [60, 101, 255, 500, 999];
    for (var t = 0; t < sizes.length; t++) {
      var a = shuffled(sizes[t], 17 + t);
      worst = Math.min(worst, guaranteeSlack(a, Math.floor((a.length + 1) / 2)));
    }
    return worst;
  })();

  /* ---- measured comparison counts of SELECT, groups of five ---- */
  function measured(n) {
    var a = shuffled(n, 91 + n);
    var run = selectRun(a, Math.floor((n + 1) / 2), 5);
    var sortedCopy = sortSmall(a, ctr());
    return { n: n, cmp: run.cmp, ratio: run.cmp / n,
             ok: run.value === sortedCopy[Math.floor((n + 1) / 2) - 1] };
  }
  var M25 = measured(25), M100 = measured(100), M257 = measured(257);
  var M1000 = measured(1000), M4096 = measured(4096);

  /* every rank of every small array, against a sort ---- */
  var ALL_K_BAD = (function () {
    var bad = 0, n, k, a, run;
    for (n = 1; n <= 40; n++) {
      a = shuffled(n, 300 + n);
      for (k = 1; k <= n; k++) {
        run = selectRun(a, k, 5);
        if (run.value !== sortSmall(a, ctr())[k - 1]) bad++;
      }
    }
    return bad;
  })();

  /* ---- quickselect: first element as pivot ---- */
  function quickselect(arr, k, c) {
    var n = arr.length;
    if (n === 1) return arr[0];
    var p = arr[0], lo = [], hi = [], i;
    for (i = 1; i < n; i++) { c.n++; if (arr[i] < p) lo.push(arr[i]); else hi.push(arr[i]); }
    if (k <= lo.length) return quickselect(lo, k, c);
    if (k === lo.length + 1) return p;
    return quickselect(hi, k - lo.length - 1, c);
  }
  function qs(n, k) {
    var a = [], i;
    for (i = 0; i < n; i++) a.push(i);
    var c = ctr();
    var v = quickselect(a, k, c);
    return { value: v, cmp: c.n };
  }
  var QS16_MAX = qs(16, 16), QS16_MID = qs(16, 8), QS64_MAX = qs(64, 64), QS64_MID = qs(64, 32);
  var QS8_MID = qs(8, 4);

  /* ---- randomised quickselect, twenty seeded runs ---- */
  function randQuick(arr, k, c, rng) {
    var n = arr.length;
    if (n === 1) return arr[0];
    var pi = Math.floor(rng() * n), p = arr[pi];
    var rest = arr.slice(0, pi).concat(arr.slice(pi + 1));
    var lo = [], hi = [], i;
    for (i = 0; i < rest.length; i++) { c.n++; if (rest[i] < p) lo.push(rest[i]); else hi.push(rest[i]); }
    if (k <= lo.length) return randQuick(lo, k, c, rng);
    if (k === lo.length + 1) return p;
    return randQuick(hi, k - lo.length - 1, c, rng);
  }
  var RAND = (function () {
    var rng = seeded(11), total = 0, worst = 0, t, a, c;
    for (t = 0; t < 20; t++) {
      a = shuffled(1024, 700 + t); c = ctr();
      randQuick(a, 512, c, rng);
      total += c.n; if (c.n > worst) worst = c.n;
    }
    return { avg: total / 20 / 1024, worst: worst / 1024 };
  })();

  /* ---- the two recurrences, solved from the base case ---- */
  function solveRec(g, N) {
    var T = new Array(N + 1), n, a, b;
    T[0] = 0;
    for (n = 1; n <= N; n++) {
      if (n <= 20) { T[n] = n; continue; }
      a = Math.ceil(n / g);
      b = (g === 5) ? Math.floor(7 * n / 10) + 6 : Math.ceil(2 * n / 3) + 4;
      if (a >= n) a = n - 1;
      if (b >= n) b = n - 1;
      T[n] = T[a] + T[b] + n;
    }
    return T;
  }
  var T5 = solveRec(5, 8192), T3 = solveRec(3, 8192);

  /* ---- the split guarantee for a general group size ---- */
  function splitFraction(g) { return 3 * (g + 1) / (4 * g); }
  var COEF = [3, 5, 7, 9].map(function (g) { return { g: g, f: splitFraction(g) }; });

  /* ======================================================================
     LAYER 2 - THE CHECKS
     ====================================================================== */

  var CHECKS = [];
  function check(name, pass, detail) {
    CHECKS.push({ name: name, pass: !!pass, detail: detail || '' });
  }

  check('median of five: all 120 orderings return the median',
    MED5_WORST.bad === 0, 'wrong=' + MED5_WORST.bad);
  check('median of five: at most 7 comparisons on every ordering',
    MED5_WORST.worst === 7, 'worst=' + MED5_WORST.worst);

  check('demo array: the five group medians are 17, 29, 19, 21, 27',
    DEMO_MEDS.join(',') === '17,29,19,21,27', DEMO_MEDS.join(','));
  check('demo array: the median of medians is 21',
    DEMO_MOM === 21, String(DEMO_MOM));
  check('demo array: 12 keys are smaller and 12 larger than 21',
    DEMO_LESS === 12 && DEMO_GREATER === 12, DEMO_LESS + '/' + DEMO_GREATER);
  check('demo array: 21 is the 13th smallest here (luck, not a promise)',
    DEMO_MOM_RANK === 13, 'rank=' + DEMO_MOM_RANK);
  check('demo array: select(13) returns 21 in 65 comparisons',
    DEMO_SELECT.value === 21 && DEMO_SELECT.cmp === 65,
    'value=' + DEMO_SELECT.value + ' cmp=' + DEMO_SELECT.cmp);

  check('second array: the median of medians is 54 at rank 14, not the median',
    DEMO2_MOM === 54 && DEMO2_RANK === 14, 'mom=' + DEMO2_MOM + ' rank=' + DEMO2_RANK);

  check('every rank of every array up to n = 40 matches a sort',
    ALL_K_BAD === 0, 'wrong=' + ALL_K_BAD);

  check('the counting lemma holds at every call of the sampled runs',
    GUARANTEE_WORST >= 0, 'slack=' + GUARANTEE_WORST.toFixed(2));

  check('sorted input, first pivot, k = n = 16 costs exactly n(n-1)/2 = 120',
    QS16_MAX.cmp === 120 && QS16_MAX.value === 15, 'cmp=' + QS16_MAX.cmp);
  check('sorted input, first pivot, k = n = 64 costs exactly 2,016',
    QS64_MAX.cmp === 2016 && QS64_MAX.value === 63, 'cmp=' + QS64_MAX.cmp);
  check('sorted input, the middle at n = 64 costs 1,520, not the 2,016 bound',
    QS64_MID.cmp === 1520, 'cmp=' + QS64_MID.cmp);
  check('sorted input, the middle at n = 8 costs 22',
    QS8_MID.cmp === 22, 'cmp=' + QS8_MID.cmp);

  check('randomised quickselect at n = 1024 averages 3.25n over 20 runs',
    Math.abs(RAND.avg - 3.25) < 0.02, 'avg=' + RAND.avg.toFixed(3) + 'n');
  check('its worst seeded run is 4.61n',
    Math.abs(RAND.worst - 4.61) < 0.02, 'worst=' + RAND.worst.toFixed(2) + 'n');

  check('SELECT at n = 25 costs 103 comparisons (4.12n)',
    M25.cmp === 103 && M25.ok, 'cmp=' + M25.cmp + ' ratio=' + M25.ratio.toFixed(2));
  check('SELECT at n = 1,000 costs 7,107 comparisons (7.11n)',
    M1000.cmp === 7107 && M1000.ok, 'cmp=' + M1000.cmp + ' ratio=' + M1000.ratio.toFixed(2));
  check('SELECT at n = 4,096 costs 29,505 comparisons (7.20n)',
    M4096.cmp === 29505 && M4096.ok, 'cmp=' + M4096.cmp + ' ratio=' + M4096.ratio.toFixed(2));
  check('every SELECT run returned the correct order statistic',
    M25.ok && M100.ok && M257.ok && M1000.ok && M4096.ok, 'all true');

  check('groups of 5: T(n)/n is 8.52 at n = 8192 and does not grow with log n',
    Math.abs(T5[8192] / 8192 - 8.52) < 0.01, (T5[8192] / 8192).toFixed(2));
  check('groups of 3: T(n)/n rises from 4.89 at n = 64 to 13.21 at n = 8192',
    Math.abs(T3[64] / 64 - 4.89) < 0.01 && Math.abs(T3[8192] / 8192 - 13.21) < 0.01,
    (T3[64] / 64).toFixed(2) + ' -> ' + (T3[8192] / 8192).toFixed(2));
  check('groups of 3: the two coefficients sum to exactly 1',
    Math.abs(1 / 3 + 2 / 3 - 1) < 1e-12 && Math.abs(splitFraction(3) - 1) < 1e-12,
    String(splitFraction(3)));
  check('groups of 5: the two coefficients sum to 0.9',
    Math.abs(splitFraction(5) - 0.9) < 1e-12, String(splitFraction(5)));
  check('groups of 7: the two coefficients sum to 6/7',
    Math.abs(splitFraction(7) - 6 / 7) < 1e-12, String(splitFraction(7)));

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

  function tw(s, size, mono) { return String(s).length * size * (mono ? 0.60 : 0.55); }

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

  function head(title, sub) {
    P.text(32, 20, title, { size: 16, bold: true, color: INK });
    if (sub) P.text(32, 42, sub, { size: 11.5, mono: true, color: DIM });
  }

  function cell(x, y, w, h, val, o) {
    o = o || {};
    P.rect(x, y, w, h, {
      fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1.2, radius: 4
    });
    P.text(x + w / 2, y + h / 2, val, {
      size: o.size || 13, mono: true, bold: !!o.bold, align: 'center', base: 'middle',
      color: o.color || INK
    });
  }

  function card(x, y, w, h, o) {
    o = o || {};
    P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1, radius: 6 });
  }

  var SCENE_DRAW = {};

  /* ---- 1. the problem ---- */
  SCENE_DRAW.problem = function (t, sc, p) {
    head('One rank, not the whole order', 'n = 9 keys, k = 4: which key is fourth smallest?');

    var vals = [23, 8, 41, 3, 17, 35, 12, 29, 6];
    var answer = 12;
    var cw = 52, gap = 8, x0 = 32;
    for (var i = 0; i < vals.length; i++) {
      var isAns = vals[i] === answer && p > 0.55;
      cell(x0 + i * (cw + gap), 74, cw, 40, vals[i], {
        fill: isAns ? '#e7f5ea' : SURF2,
        stroke: isAns ? VAL : BORDER,
        color: isAns ? VAL : INK, bold: isAns
      });
    }
    P.text(x0, 124, 'input, unsorted', { size: 10.5, mono: true, color: FAINT });

    if (p > 0.28) {
      P.text(x0, 152, 'sorted:  3  6  8  12  17  23  29  35  41', { size: 11.5, mono: true, color: DIM });
      P.text(x0, 172, 'position 4 holds 12. Sorting produced all nine ranks; k = 4 asked for one.', { size: 11, color: INK });
    }

    if (p > 0.4) {
      card(32, 200, 400, 92, { fill: SURF });
      P.text(48, 216, 'route 1: sort, then index', { size: 11, mono: true, color: WARN });
      P.text(48, 240, 'Theta(n log n) comparisons', { size: 13, mono: true, bold: true, color: INK });
      P.text(48, 262, 'n answers paid for, one answer asked', { size: 10.5, color: DIM });
      P.text(48, 280, 'stable, simple, and correct', { size: 10.5, color: DIM });
    }
    if (p > 0.52) {
      card(456, 200, 412, 92, { fill: ACCDIM, stroke: ACC });
      P.text(472, 216, 'route 2: select', { size: 11, mono: true, color: ACC });
      P.text(472, 240, 'Theta(n) comparisons, worst case', { size: 13, mono: true, bold: true, color: INK });
      P.text(472, 262, 'one rank, one pass down a recursion path', { size: 10.5, color: DIM });
      P.text(472, 280, 'the subject of this lesson', { size: 10.5, color: DIM });
    }
    if (p > 0.72) {
      P.text(32, 312, 'quickselect: partition, keep the side that holds k', { size: 11, mono: true, color: DIM });
      P.text(32, 334, 'expected 3.25n comparisons at n = 1024 (measured, 20 seeded runs)', { size: 11, mono: true, color: DIM });
      P.text(32, 356, 'worst case: n(n-1)/2 = 2,016 comparisons at n = 64', { size: 11, mono: true, color: BAD });
    }
    if (p > 0.88) {
      chip(32, 392, 'the answer is one key, not an order', true);
      P.text(300, 400, 'median of medians removes the quadratic case', { size: 11, color: INK });
    }
  };

  /* ---- 2. the lower bound ---- */
  SCENE_DRAW.lower = function (t, sc, p) {
    head('Why linear is the right target', 'the minimum needs n - 1 comparisons, and n - 1 suffice');

    var n = 8, i, x0 = 60, cw = 56, gap = 14;
    for (i = 0; i < n; i++) {
      var eliminated = p > 0.18 + i * 0.055;
      cell(x0 + i * (cw + gap), 74, cw, 38, 'k' + (i + 1), {
        fill: eliminated ? BADDIM : SURF2,
        stroke: eliminated ? BAD : BORDER,
        color: eliminated ? BAD : INK
      });
    }
    P.text(x0, 124, 'every key that is not the champion must lose one comparison', { size: 10.5, color: FAINT });

    if (p > 0.3) {
      P.text(32, 156, 'comparisons:  k1>k2   k1>k3   k1>k4   k1>k5   k1>k6   k1>k7   k1>k8', { size: 11.5, mono: true, color: INK });
      P.text(32, 178, 'that is 7 comparisons for 8 keys: n - 1, and no algorithm can use fewer', { size: 11, color: DIM });
    }
    if (p > 0.46) {
      card(32, 202, 400, 108, { fill: SURF });
      P.text(48, 218, 'the adversary', { size: 11, mono: true, color: WARN });
      wrap(48, 240, 'Answer each comparison so that the loser is a key that had not lost before. After t comparisons at most t keys have lost, so t must reach n - 1 before one undefeated key is left. The argument never looks at the algorithm.', 372, { size: 11, color: INK });
    }
    if (p > 0.6) {
      card(456, 202, 412, 108, { fill: SURF2 });
      P.text(472, 218, 'and n - 1 suffice', { size: 11, mono: true, color: VAL });
      P.text(472, 242, 'scan once, keep the smallest seen', { size: 11.5, color: INK });
      P.text(472, 264, 'n - 1 comparisons, matching the bound', { size: 11.5, mono: true, color: INK });
      P.text(472, 288, 'so linear time is optimal for selection', { size: 11, color: DIM });
    }
    if (p > 0.76) {
      P.text(32, 336, 'the sorting bound does not transfer', { size: 11, mono: true, color: WARN });
      P.text(32, 358, 'sorting must separate n! orderings: at least log2(n!) comparisons', { size: 11, mono: true, color: DIM });
      P.text(32, 380, 'selection must separate only n outcomes: at least log2(n)', { size: 11, mono: true, color: DIM });
    }
    if (p > 0.9) chip(32, 410, 'n log n bounds sorting, not selection', true);
  };

  /* ---- 3. quickselect ---- */
  SCENE_DRAW.quickselect = function (t, sc, p) {
    head('Quickselect: keep one side', 'partition costs n - 1 comparisons and fixes one rank');

    var vals = [23, 8, 41, 3, 17, 35, 12, 29, 6, 44, 19, 2];
    var pivotIdx = 5, pivot = vals[pivotIdx];
    var less = [], greater = [], i;
    for (i = 0; i < vals.length; i++) if (i !== pivotIdx) (vals[i] < pivot ? less : greater).push(vals[i]);
    var cw = 44, gap = 6, x0 = 32;

    for (i = 0; i < vals.length; i++) {
      var isPivot = i === pivotIdx;
      var isLeft = vals[i] < pivot && !isPivot;
      var dim = p > 0.42 && !isLeft && !isPivot;
      cell(x0 + i * (cw + gap), 74, cw, 38, vals[i], {
        fill: isPivot ? ACCDIM : (dim ? SURF2 : SURF),
        stroke: isPivot ? ACC : (dim ? BORDER : BORDER),
        color: dim ? FAINT : (isPivot ? ACC : INK),
        bold: isPivot
      });
    }
    P.text(x0, 122, 'pivot = ' + pivot + ' at index 6;  12 keys, k = 4', { size: 10.5, mono: true, color: FAINT });

    if (p > 0.24) {
      P.text(32, 152, 'partition:  smaller than ' + pivot + ' -> ' + less.length + ' keys   |   larger -> ' + greater.length + ' keys', { size: 11.5, mono: true, color: INK });
      P.text(32, 172, 'the pivot lands at rank ' + (less.length + 1) + '; k = 4 is on the left, so the right side is discarded', { size: 11, color: DIM });
    }
    if (p > 0.42) {
      card(32, 196, 400, 86, { fill: SURF });
      P.text(48, 212, 'one level', { size: 11, mono: true, color: WARN });
      P.text(48, 236, 'n - 1 = 11 comparisons here', { size: 12.5, mono: true, bold: true, color: INK });
      P.text(48, 258, 'then one side survives, the other is dropped', { size: 10.5, color: DIM });
    }
    if (p > 0.58) {
      card(456, 196, 412, 86, { fill: ACCDIM, stroke: ACC });
      P.text(472, 212, 'a middle pivot halves the problem', { size: 11, mono: true, color: ACC });
      P.text(472, 236, 'n + n/2 + n/4 + ... <= 2n', { size: 12.5, mono: true, bold: true, color: INK });
      P.text(472, 258, 'a geometric sum, because only one side recurses', { size: 10.5, color: DIM });
    }
    if (p > 0.74) {
      P.text(32, 300, 'measured, 20 seeded runs at n = 1024:', { size: 11, mono: true, color: DIM });
      P.text(32, 324, 'average 3.25n comparisons, worst run 4.61n', { size: 12, mono: true, bold: true, color: VAL });
      P.text(32, 348, 'expectation is over the algorithm\'s coin flips, not over the input', { size: 11, color: INK });
    }
    if (p > 0.88) {
      chip(32, 384, 'expected linear is not worst-case linear', true);
      P.text(320, 392, 'an examiner chooses the input', { size: 11, color: DIM });
    }
  };

  /* ---- 4. the worst case ---- */
  SCENE_DRAW.worst = function (t, sc, p) {
    head('The quadratic worst case', 'sorted input, pivot = first element, k = n');

    var rows = [
      [16, 15, 1], [15, 14, 2], [14, 13, 3], [13, 12, 4], [12, 11, 5]
    ];
    for (var i = 0; i < rows.length; i++) {
      if (p < 0.06 + i * 0.09) break;
      var y = 70 + i * 26;
      P.text(32, y + 6, 'level ' + (i + 1), { size: 10.5, mono: true, color: FAINT });
      P.text(96, y + 6, rows[i][0] + ' keys left', { size: 11, mono: true, color: INK });
      var bw = rows[i][1] * 12;
      P.rect(200, y, bw, 14, { fill: BADDIM, stroke: BAD, sw: 1, radius: 2 });
      P.text(206 + bw, y + 7, rows[i][1] + ' comparisons', { size: 10.5, mono: true, base: 'middle', color: BAD });
    }
    if (p > 0.42) {
      P.text(32, 206, '... one key leaves per level, so the costs fall by one each time', { size: 11, mono: true, color: DIM });
      P.text(32, 230, '15 + 14 + 13 + ... + 1  =  16 x 15 / 2  =  120', { size: 12, mono: true, bold: true, color: INK });
    }
    if (p > 0.58) {
      card(32, 252, 400, 96, { fill: SURF });
      P.text(48, 268, 'at n = 64', { size: 11, mono: true, color: WARN });
      P.text(48, 292, 'k = 64:  63 + ... + 1 = 2,016', { size: 12, mono: true, bold: true, color: BAD });
      P.text(48, 314, 'k = 32:  1,520 comparisons', { size: 12, mono: true, bold: true, color: BAD });
      P.text(48, 334, 'n(n-1)/2 = 2,016 is the bound; the middle is below it', { size: 10, color: DIM });
    }
    if (p > 0.72) {
      card(456, 252, 412, 96, { fill: SURF2 });
      P.text(472, 268, 'why the middle is not cheaper', { size: 11, mono: true, color: DIM });
      P.text(472, 292, 'the pivot is still the smallest key', { size: 11, color: INK });
      P.text(472, 312, 'so one key leaves and k is still far away', { size: 11, color: INK });
      P.text(472, 334, 'only k = 1 or k = n end after one pass', { size: 10.5, color: DIM });
    }
    if (p > 0.86) {
      chip(32, 368, 'the input is chosen, not sampled', false);
      P.text(280, 376, 'randomisation does not help against an adversary', { size: 11, color: INK });
      P.text(32, 404, 'so the pivot must be chosen by a rule with a proof: the median of medians', { size: 11.5, color: ACC });
    }
  };

  /* ---- 5. groups of five ---- */
  SCENE_DRAW.groups = function (t, sc, p) {
    head('Step 1: cut into groups of five', '25 keys, five groups, one median each');

    var cw = 32, ch = 26, gx = 9, x0 = 32, y0 = 68;
    for (var gi = 0; gi < 5; gi++) {
      for (var j = 0; j < 5; j++) {
        if (p < 0.03 + gi * 0.05) continue;
        var v = DEMO_GROUPS[gi][j];
        var isMed = (j === 2) && p > 0.42;
        cell(x0 + gi * (5 * cw + gx) + j * cw, y0 + j * ch, cw - 2, ch - 2, v, {
          fill: isMed ? ACCDIM : SURF,
          stroke: isMed ? ACC : BORDER,
          color: isMed ? ACC : INK,
          bold: isMed, size: 10.5
        });
      }
      if (p > 0.42) {
        P.text(x0 + gi * (5 * cw + gx) + 2 * cw + (cw - 2) / 2, y0 + 5 * ch + 4,
          'med ' + DEMO_MEDS[gi], { size: 10, mono: true, align: 'center', color: ACC });
      }
    }
    P.text(x0, 62, 'five groups of five, taken by position in the input', { size: 10, mono: true, color: FAINT });

    if (p > 0.2) {
      card(32, 226, 400, 92, { fill: SURF });
      P.text(48, 242, 'cost of one group of five', { size: 11, mono: true, color: WARN });
      P.text(48, 266, '4 comparisons to bracket, 3 to finish: at most 7', { size: 11.5, mono: true, color: INK });
      P.text(48, 288, 'checked on all 120 orderings of five keys', { size: 10.5, color: DIM });
      P.text(48, 306, '7 is a constant, so n/5 groups cost Theta(n)', { size: 10.5, color: DIM });
    }
    if (p > 0.6) {
      card(456, 226, 412, 92, { fill: SURF2 });
      P.text(472, 242, 'the five medians', { size: 11, mono: true, color: DIM });
      P.text(472, 266, DEMO_MEDS.join(',  '), { size: 13, mono: true, bold: true, color: ACC });
      P.text(472, 288, 'one key out of every five, each in the middle of its group', { size: 10.5, color: INK });
      P.text(472, 306, 'the last group may be short when n is not a multiple of 5', { size: 10, color: FAINT });
    }
    if (p > 0.8) {
      chip(32, 336, 'groups by position, not by value', true);
      P.text(300, 344, 'no sorting of the whole array happens here', { size: 11, color: DIM });
      P.text(32, 372, 'next: select the median of these five medians, by the same algorithm', { size: 11.5, color: INK });
    }
  };

  /* ---- 6. the median of medians ---- */
  SCENE_DRAW.mom = function (t, sc, p) {
    head('Step 2: the median of the medians', 'a recursive call on n/5 keys, not on n');

    var cw = 58, gap = 10, x0 = 60;
    for (var i = 0; i < 5; i++) {
      var chosen = DEMO_MEDS[i] === DEMO_MOM;
      cell(x0 + i * (cw + gap), 70, cw, 34, DEMO_MEDS[i], {
        fill: (chosen && p > 0.35) ? '#e7f5ea' : SURF2,
        stroke: (chosen && p > 0.35) ? VAL : BORDER,
        color: (chosen && p > 0.35) ? VAL : INK,
        bold: chosen && p > 0.35
      });
    }
    P.text(x0, 62, 'the five group medians', { size: 10.5, mono: true, color: FAINT });

    if (p > 0.14) {
      P.arrow(400, 108, 400, 138, { stroke: ACC, sw: 1.6 });
      P.text(414, 118, 'select(medians, 3)', { size: 11, mono: true, color: ACC });
      P.text(414, 134, '5 keys: a fifth of the input', { size: 10.5, color: DIM });
    }
    if (p > 0.35) {
      cell(340, 148, 120, 38, DEMO_MOM, { fill: '#e7f5ea', stroke: VAL, color: VAL, bold: true, size: 15 });
      P.text(470, 162, 'median of medians', { size: 11.5, color: VAL });
      P.text(470, 180, 'guaranteed near the middle, by step 3', { size: 10.5, color: DIM });
    }
    if (p > 0.55) {
      P.text(32, 206, 'partition the whole array around ' + DEMO_MOM + ':', { size: 11, mono: true, color: INK });
      P.rect(32, 224, 250, 26, { fill: SURF2, stroke: BORDER, sw: 1, radius: 4 });
      P.text(157, 237, DEMO_LESS + ' keys smaller', { size: 11, mono: true, align: 'center', base: 'middle', color: DIM });
      P.rect(290, 224, 74, 26, { fill: '#e7f5ea', stroke: VAL, sw: 1.2, radius: 4 });
      P.text(327, 237, DEMO_MOM, { size: 12, mono: true, bold: true, align: 'center', base: 'middle', color: VAL });
      P.rect(372, 224, 250, 26, { fill: SURF2, stroke: BORDER, sw: 1, radius: 4 });
      P.text(497, 237, DEMO_GREATER + ' keys larger', { size: 11, mono: true, align: 'center', base: 'middle', color: DIM });
      P.text(636, 237, 'rank ' + (DEMO_LESS + 1), { size: 10.5, mono: true, base: 'middle', color: FAINT });
    }
    if (p > 0.72) {
      P.text(32, 272, 'k = 13 is the pivot itself, so the search stops after one partition', { size: 11, color: INK });
      P.text(32, 294, 'the whole call made ' + DEMO_SELECT.cmp + ' comparisons for 25 keys: ' + DEMO_SELECT.cmp / 25 + 'n', { size: 11, mono: true, color: DIM });
    }
    if (p > 0.86) {
      chip(32, 326, 'here the median of medians IS the median', false);
      P.text(360, 334, 'that is luck: on the second array it is 54, at rank 14 of 25', { size: 11, color: BAD });
      P.text(32, 362, 'the guarantee is a rank band, never an exact rank', { size: 11.5, color: INK });
    }
  };

  /* ---- 7. the counting lemma ---- */
  SCENE_DRAW.guarantee = function (t, sc, p) {
    head('Step 3: the counting lemma', 'at least 3n/10 - 6 keys on each side of the pivot');

    /* five strips, ordered by their median: 17 19 | 21 | 27 29 */
    var order = [0, 2, 3, 4, 1];       /* group indices sorted by median: 17,19,21,27,29 */
    var x0 = 46, sw = 74, gap = 26, y0 = 70;
    for (var s = 0; s < 5; s++) {
      var gi = order[s];
      var grp = sortSmall(DEMO_GROUPS[gi], ctr());
      var med = DEMO_MEDS[gi];
      var above = (med > DEMO_MOM);
      var below = (med < DEMO_MOM);
      for (var j = 0; j < 5; j++) {
        var y = y0 + (4 - j) * 24;
        var shade = false;
        if (p > 0.3 && above && j >= 2) shade = true;      /* three at or above its median */
        if (p > 0.3 && below && j <= 2) shade = true;      /* three at or below its median */
        var isPivotGroup = (med === DEMO_MOM);
        cell(x0 + s * (sw + gap), y, sw, 22, grp[j], {
          fill: isPivotGroup && p > 0.2 ? '#e7f5ea' : (shade ? ACCDIM : SURF),
          stroke: isPivotGroup && p > 0.2 ? VAL : (shade ? ACC : BORDER),
          color: (isPivotGroup && p > 0.2) ? VAL : (shade ? ACC : INK),
          size: 11, bold: isPivotGroup && p > 0.2
        });
      }
      P.text(x0 + s * (sw + gap) + sw / 2, y0 + 5 * 24 + 2, 'med ' + med,
        { size: 10, mono: true, align: 'center', color: FAINT });
    }
    P.text(x0, 62, 'columns ordered by their median: 17, 19, 21, 27, 29', { size: 10, mono: true, color: FAINT });

    if (p > 0.44) {
      P.text(32, 218, 'half of the medians (3 of 5) are at or above ' + DEMO_MOM + ', and each contributes 3 keys at or above it', { size: 11, color: INK });
      P.text(32, 240, 'so at least (n/2g)(g+1)/2 = 3n/10 keys lie on each side, minus 6 for the pivot group and a short last group', { size: 11, color: INK });
    }
    if (p > 0.6) {
      card(32, 260, 400, 96, { fill: SURF });
      P.text(48, 276, 'this array, n = 25', { size: 11, mono: true, color: WARN });
      P.text(48, 300, 'bound 3n/10 - 6 = 1.5', { size: 12, mono: true, color: DIM });
      P.text(48, 322, 'actual: ' + DEMO_LESS + ' smaller, ' + DEMO_GREATER + ' larger', { size: 12.5, mono: true, bold: true, color: VAL });
      P.text(48, 342, 'the bound is weak at n = 25; it bites as n grows', { size: 10, color: FAINT });
    }
    if (p > 0.76) {
      card(456, 260, 412, 96, { fill: ACCDIM, stroke: ACC });
      P.text(472, 276, 'the inequality that drives everything', { size: 11, mono: true, color: ACC });
      P.text(472, 300, 'larger side <= n - (3n/10 - 6) = 7n/10 + 6', { size: 12, mono: true, bold: true, color: INK });
      P.text(472, 322, 'so the recursion is on at most seven tenths of the input', { size: 10.5, color: DIM });
      P.text(472, 342, 'checked at every call of five sampled runs', { size: 10, color: FAINT });
    }
    if (p > 0.9) {
      chip(32, 380, 'the lemma is a count, not a picture', true);
      P.text(320, 388, 'no arrangement of keys can beat it', { size: 11, color: DIM });
    }
  };

  /* ---- 8. the recurrence ---- */
  SCENE_DRAW.recurrence = function (t, sc, p) {
    head('The recurrence that gives linear time', 'T(n) <= T(n/5) + T(7n/10) + O(n)');

    if (p > 0.06) {
      P.text(32, 74, 'T(n)  <=  T(n/5)  +  T(7n/10)  +  O(n)', { size: 15, mono: true, bold: true, color: INK });
      P.text(32, 96, 'pivot        recurse      groups, medians, partition', { size: 10.5, mono: true, color: DIM });
    }
    if (p > 0.22) {
      P.text(32, 128, 'n/5 + 7n/10 = 9n/10  <  n', { size: 13, mono: true, color: ACC });
      P.text(32, 150, 'level 0: n     level 1: 0.9n     level 2: 0.81n     ...', { size: 11.5, mono: true, color: INK });
      P.text(32, 172, 'geometric with ratio 0.9, so the total is at most n / (1 - 0.9) = 10n', { size: 11.5, mono: true, color: INK });
    }
    if (p > 0.4) {
      /* the shrinking bars */
      var widths = [700, 630, 567, 510, 459];
      for (var i = 0; i < widths.length; i++) {
        if (p < 0.42 + i * 0.06) break;
        P.rect(32, 196 + i * 18, widths[i], 12, {
          fill: i === 0 ? ACCDIM : SURF2, stroke: i === 0 ? ACC : BORDER, sw: 1, radius: 2
        });
        P.text(40 + widths[i], 202 + i * 18, (1 * Math.pow(0.9, i)).toFixed(2) + 'n',
          { size: 10, mono: true, base: 'middle', color: DIM });
      }
    }
    if (p > 0.58) {
      card(32, 300, 400, 92, { fill: SURF });
      P.text(48, 316, 'substitution gives a constant', { size: 11, mono: true, color: WARN });
      P.text(48, 340, 'c n/5 + c(7n/10 + 6) + 2.4n <= c n', { size: 11.5, mono: true, color: INK });
      P.text(48, 362, 'needs c >= 10 x 2.4 = 24', { size: 12, mono: true, bold: true, color: INK });
      P.text(48, 382, 'so T(n) <= 24n comparisons, from the base case up', { size: 10.5, color: DIM });
    }
    if (p > 0.74) {
      card(456, 300, 412, 92, { fill: ACCDIM, stroke: ACC });
      P.text(472, 316, 'measured by this page\'s own implementation', { size: 11, mono: true, color: ACC });
      P.text(472, 340, 'n = 25: ' + M25.cmp + '   n = 1,000: ' + M1000.cmp, { size: 11.5, mono: true, color: INK });
      P.text(472, 360, 'n = 4,096: ' + M4096.cmp + '  (' + M4096.ratio.toFixed(2) + 'n)', { size: 11.5, mono: true, bold: true, color: INK });
      P.text(472, 380, 'the ratio settles near 7n, well inside the 24n bound', { size: 10.5, color: DIM });
    }
    if (p > 0.9) chip(32, 412, 'ratio 0.9 < 1 is the whole proof', true);
  };

  /* ---- 9. why five ---- */
  SCENE_DRAW.whyfive = function (t, sc, p) {
    head('Why five, and not three', 'each side keeps (g+1)/(4g); the survivor is 3(g+1)/(4g)');

    if (p > 0.06) {
      P.text(32, 72, 'each side gets at least (n/2g)((g+1)/2) keys, so the surviving work is', { size: 11, color: DIM });
      P.text(32, 94, '1/g  +  (1 - 3(g+1)/(4g))  =  3(g+1)/(4g)', { size: 13, mono: true, bold: true, color: INK });
    }
    var rows = COEF;
    var hy = 126;
    if (p > 0.2) {
      P.text(60, hy, 'g', { size: 10.5, mono: true, color: FAINT });
      P.text(140, hy, 'pivot share 1/g', { size: 10.5, mono: true, color: FAINT });
      P.text(320, hy, 'survivor 3(g+1)/(4g)', { size: 10.5, mono: true, color: FAINT });
      P.text(560, hy, 'decays?', { size: 10.5, mono: true, color: FAINT });
    }
    for (var i = 0; i < rows.length; i++) {
      if (p < 0.24 + i * 0.07) break;
      var y = hy + 26 + i * 28;
      var bad = rows[i].f >= 1 - 1e-9;
      P.text(60, y, 'g = ' + rows[i].g, { size: 12, mono: true, color: bad ? BAD : INK, bold: bad });
      P.text(140, y, (1 / rows[i].g).toFixed(4), { size: 12, mono: true, color: DIM });
      P.text(320, y, rows[i].f.toFixed(4), { size: 12, mono: true, color: bad ? BAD : VAL, bold: true });
      P.text(560, y, bad ? 'no: exactly 1' : 'yes', { size: 11.5, mono: true, color: bad ? BAD : VAL });
    }
    if (p > 0.52) {
      card(32, 268, 400, 96, { fill: SURF });
      P.text(48, 284, 'g = 3: 1/3 + 2/3 = 1', { size: 11.5, mono: true, bold: true, color: BAD });
      P.text(48, 306, 'T(n) <= T(n/3) + T(2n/3) + O(n)', { size: 11.5, mono: true, color: INK });
      P.text(48, 328, 'log n levels, n per level: Theta(n log n)', { size: 11.5, mono: true, color: BAD });
      P.text(48, 350, 'no better than sorting, which is the point of the exercise', { size: 10, color: DIM });
    }
    if (p > 0.68) {
      card(456, 268, 412, 96, { fill: ACCDIM, stroke: ACC });
      P.text(472, 284, 'solving both recurrences from the base case', { size: 11, mono: true, color: ACC });
      P.text(472, 306, 'T(n)/n, groups of 5: 6.20 -> 8.52', { size: 11.5, mono: true, color: VAL });
      P.text(472, 326, 'T(n)/n, groups of 3: 4.89 -> 13.21', { size: 11.5, mono: true, color: BAD });
      P.text(472, 346, 'n from 64 to 8,192: one settles, one keeps climbing', { size: 10, color: DIM });
    }
    if (p > 0.84) {
      P.text(32, 380, 'any odd g >= 5 gives decay: 5 -> 0.9, 7 -> 0.857, 9 -> 0.833', { size: 11, mono: true, color: INK });
      chip(32, 400, 'groups of 3 remove the decay, not just the constant', false);
    }
  };

  /* ---- 10. the exam ---- */
  SCENE_DRAW.exam = function (t, sc, p) {
    head('How GATE asks it', 'the guarantee first, the recurrence second');

    var cols = [
      ['GATE 2019', 'n arrays of n keys: median of medians', 'n medians at Theta(n) each', 'Theta(n^2)'],
      ['GATE 2008', 'a pivot with n/5 on each side', 'T(n/5) + T(4n/5) + n', 'option B'],
      ['GATE 2006', 'median pivot found in O(n)', '2T(n/2) + O(n)', 'Theta(n log n)']
    ];
    for (var i = 0; i < cols.length; i++) {
      if (p < 0.06 + i * 0.09) continue;
      var x = 32 + i * 288;
      card(x, 74, 268, 132, { fill: SURF });
      P.text(x + 16, 92, cols[i][0], { size: 12, mono: true, bold: true, color: ACC });
      wrap(x + 16, 116, cols[i][1], 236, { size: 11, color: INK });
      P.text(x + 16, 158, cols[i][2], { size: 10.5, mono: true, color: DIM });
      P.text(x + 16, 184, cols[i][3], { size: 12, mono: true, bold: true, color: WARN });
    }
    if (p > 0.4) {
      card(32, 220, 500, 96, { fill: ACCDIM, stroke: ACC });
      P.text(48, 238, 'the reading procedure', { size: 11, mono: true, color: ACC });
      P.text(48, 262, '1  find the guarantee: how much is on each side?', { size: 11.5, color: INK });
      P.text(48, 282, '2  write the recurrence with that split', { size: 11.5, color: INK });
      P.text(48, 302, '3  solve it: coefficients below 1 give linear', { size: 11.5, color: INK });
    }
    if (p > 0.58) {
      card(548, 220, 320, 96, { fill: SURF2 });
      P.text(564, 238, 'the trap in each', { size: 11, mono: true, color: WARN });
      P.text(564, 262, '2019: unsorted arrays, so each median is a selection', { size: 10, color: INK });
      P.text(564, 282, '2008: it is a sort, so both sides recurse', { size: 10, color: INK });
      P.text(564, 302, '2006: the pivot cost is absorbed by n log n', { size: 10, color: INK });
    }
    if (p > 0.76) {
      P.text(32, 340, 'quickselect vs median of medians: use the first in code, the second when the worst case is asked for', { size: 11, color: INK });
      chip(32, 372, 'a guaranteed good pivot removes the quadratic case', true);
    }
    if (p > 0.9) {
      P.text(32, 404, 'total comparisons for SELECT: at most 24n by substitution, about 7n measured', { size: 11, mono: true, color: DIM });
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
        new window.p5(function (s) {
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
    window.__model = {
      DEMO_GROUPS: DEMO_GROUPS, DEMO_MEDS: DEMO_MEDS, DEMO_MOM: DEMO_MOM,
      DEMO_LESS: DEMO_LESS, DEMO_GREATER: DEMO_GREATER, DEMO_SELECT: DEMO_SELECT,
      DEMO2_MEDS: DEMO2_MEDS, DEMO2_MOM: DEMO2_MOM, DEMO2_RANK: DEMO2_RANK,
      MED5_WORST: MED5_WORST, GUARANTEE_WORST: GUARANTEE_WORST,
      QS16_MAX: QS16_MAX, QS16_MID: QS16_MID, QS64_MAX: QS64_MAX, QS64_MID: QS64_MID,
      RAND: RAND, M25: M25, M100: M100, M257: M257, M1000: M1000, M4096: M4096,
      T5: { r64: T5[64] / 64, r8192: T5[8192] / 8192 },
      T3: { r64: T3[64] / 64, r8192: T3[8192] / 8192 },
      COEF: COEF, CHECKS: CHECKS
    };

    var bad = CHECKS.filter(function (c) { return !c.pass; });
    if (bad.length) console.warn('Model validation did not fully pass:', bad);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
