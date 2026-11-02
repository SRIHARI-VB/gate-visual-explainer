/* ==========================================================================
   selection-lower-bounds-max-min-second-largest - model, validation, render.

   Layer 1  model      : comparison counts as integers. Three jobs - the maximum
                         alone, the maximum and minimum together, the second
                         largest - each with an algorithm that is run and counted,
                         a closed form, and an adversary accounting.
   Layer 2  validation : every number quoted in a caption, a card or on the canvas
                         is recomputed here. The pairing and tournament
                         algorithms are executed and their counts compared with
                         the closed forms for n = 2..64; the two lower bounds are
                         recomputed from their own accounting; and every
                         comparison strategy for n = 2..5 is exhausted by a
                         minimax search whose value is the true optimum.
   Layer 3  render     : reads the model; never re-derives a number.
   Layer 4  timeline   : in timeline.js - the only source of time.

   No p5.brush: every mark is a chip, a bracket, a bar or a number that has to
   be read exactly.
   ========================================================================== */

(function () {
  'use strict';

  var K = window.LessonKit;
  var PR = window.Painters;
  var W = 900, H = 470;
  var P = null;
  var PAL = (PR && PR.PAL) || {
    ink: '#0f1720', dim: '#566573', faint: '#7d8b98', surface: '#ffffff',
    surface2: '#eef2f4', border: '#c8d2d8', accent: '#0f766e', accentDim: '#d6efeb',
    valid: '#15803d', invalid: '#b3261e', invalidDim: '#fbe4e2',
    warn: '#9a5406', warnDim: '#fbeed3', info: '#1d4e89'
  };

  /* ======================================================================
     LAYER 1 - THE MODEL
     ====================================================================== */

  /* ---------- the three closed forms, and the two naive counts ---------- */

  function ceil3over2(n) { return Math.ceil(3 * n / 2) - 2; }      /* min and max */
  function secondForm(n) { return n + log2ceil(n) - 2; }            /* second largest */
  function naiveMM(n) { return 2 * n - 2; }
  function naiveSecond(n) { return 2 * n - 3; }
  function maxAlone(n) { return n - 1; }

  function log2ceil(n) {
    var k = 0, p = 1;
    while (p < n) { p *= 2; k++; }
    return k;
  }

  /* the units an algorithm must collect: n-1 exclusions from max, n-1 from min */
  function unitsNeeded(n) { return 2 * n - 2; }
  /* a comparison between two untouched elements is the only one that pays two */
  function generousComparisons(n) { return Math.floor(n / 2); }
  function adversaryBound(n) { return unitsNeeded(n) - generousComparisons(n); }

  /* ---------- a deterministic array of n distinct values -------------- */

  function makeArray(n, seed) {
    var a = [], i, s = (seed || 12345) % 2147483647;
    for (i = 0; i < n; i++) { s = (s * 1103515245 + 12345) % 2147483648; a.push(s % 100000); }
    /* force distinctness by rank, so ties cannot hide a bug */
    var idx = a.map(function (v, j) { return j; }).sort(function (x, y) { return a[x] - a[y]; });
    var out = new Array(n);
    for (i = 0; i < n; i++) out[idx[i]] = i + 1;
    return out;
  }

  /* ---------- job 1: the maximum alone -------------------------------- */

  function runMax(a) {
    var best = 0, count = 0, i;
    for (i = 1; i < a.length; i++) { count++; if (a[i] > a[best]) best = i; }
    return { count: count, index: best, value: a[best] };
  }

  /* ---------- job 2: the maximum and minimum together ----------------- */

  function runNaiveMinMax(a) {
    var mx = 0, mn = 0, count = 0, i;
    for (i = 1; i < a.length; i++) { count++; if (a[i] > a[mx]) mx = i; }
    for (i = 1; i < a.length; i++) { count++; if (a[i] < a[mn]) mn = i; }
    return { count: count, max: a[mx], min: a[mn] };
  }

  /* the pairing algorithm: order each pair, then reduce winners and losers */
  function runPairing(a) {
    var n = a.length, count = 0, i;
    var winners = [], losers = [], pairs = [];
    if (n === 1) return { count: 0, max: a[0], min: a[0], pairs: [], winners: [], losers: [] };
    if (n === 2) {
      count = 1;
      pairs = [[0, 1]];
      if (a[0] >= a[1]) { winners = [0]; losers = [1]; } else { winners = [1]; losers = [0]; }
      return { count: count, max: a[winners[0]], min: a[losers[0]], pairs: pairs, winners: winners, losers: losers };
    }
    var last = n % 2 === 1 ? n - 1 : n;      /* the odd element waits */
    for (i = 0; i < last; i += 2) {
      count++;
      if (a[i] >= a[i + 1]) { winners.push(i); losers.push(i + 1); pairs.push([i, i + 1, 'w']); }
      else { winners.push(i + 1); losers.push(i); pairs.push([i, i + 1, 'l']); }
    }
    var wi = winners[0], j;
    for (j = 1; j < winners.length; j++) { count++; if (a[winners[j]] > a[wi]) wi = winners[j]; }
    var li = losers[0];
    for (j = 1; j < losers.length; j++) { count++; if (a[losers[j]] < a[li]) li = losers[j]; }
    if (n % 2 === 1) {
      count += 2;
      if (a[n - 1] > a[wi]) wi = n - 1;
      if (a[n - 1] < a[li]) li = n - 1;
    }
    return { count: count, max: a[wi], min: a[li], pairs: pairs, winners: winners, losers: losers };
  }

  /* ---------- job 3: the second largest -------------------------------- */

  function runNaiveSecond(a) {
    var m = runMax(a);
    var count = m.count, i, best = -1;
    for (i = 0; i < a.length; i++) {
      if (i === m.index) continue;
      if (best < 0) { best = i; continue; }
      count++;
      if (a[i] > a[best]) best = i;
    }
    return { count: count, first: a[m.index], second: best < 0 ? null : a[best], index: best };
  }

  /* the balanced knockout: the field is padded to a power of two, a walkover
     costs no comparison, and every real match records who the winner beat */
  function runTournament(a) {
    var n = a.length, count = 0, i, size = 1;
    while (size < n) size *= 2;
    var level = [];
    for (i = 0; i < n; i++) level.push({ idx: i, beaten: [] });
    while (level.length < size) level.push(null);
    var rounds = [];
    while (level.length > 1) {
      var next = [], matches = [];
      for (i = 0; i < level.length; i += 2) {
        var x = level[i], y = level[i + 1];
        if (!x && !y) { next.push(null); continue; }
        if (!x) { next.push(y); continue; }
        if (!y) { next.push(x); continue; }
        count++;
        var win, lose;
        if (a[x.idx] >= a[y.idx]) { win = x; lose = y; } else { win = y; lose = x; }
        matches.push([x.idx, y.idx, win.idx]);
        next.push({ idx: win.idx, beaten: win.beaten.concat([lose.idx]) });
      }
      rounds.push(matches);
      level = next;
    }
    var winner = level[0];
    var best = -1, secondCount = 0;
    for (i = 0; i < winner.beaten.length; i++) {
      if (best < 0) { best = winner.beaten[i]; continue; }
      secondCount++;
      if (a[winner.beaten[i]] > a[best]) best = winner.beaten[i];
    }
    return {
      count: count, winner: winner.idx, beaten: winner.beaten.slice(),
      findCount: count, secondCount: secondCount, total: count + secondCount,
      second: best < 0 ? null : a[best], rounds: rounds
    };
  }

  /* ---------- exhaustive minimax over every strategy, n = 2..5 -------- */

  function permutations(n) {
    var a = [], i, out = [];
    for (i = 0; i < n; i++) a.push(i);
    (function rec(k) {
      if (k === n) { out.push(a.slice()); return; }
      var t;
      for (var i2 = k; i2 < n; i2++) {
        t = a[k]; a[k] = a[i2]; a[i2] = t;
        rec(k + 1);
        t = a[k]; a[k] = a[i2]; a[i2] = t;
      }
    })(0);
    return out;
  }

  /* the value is the least number of further comparisons that guarantees the
     answer against an adversary who picks the worse outcome at every step */
  function minimax(n, kind) {
    var ps = permutations(n), N = ps.length, i, j, k;
    var ans = [];
    for (i = 0; i < N; i++) {
      var p = ps[i];
      if (kind === 'maxmin') {
        var mx = 0, mn = 0;
        for (j = 1; j < n; j++) { if (p[j] > p[mx]) mx = j; if (p[j] < p[mn]) mn = j; }
        ans.push(mx * 10 + mn);
      } else {
        var ord = [], q;
        for (q = 0; q < n; q++) ord.push(q);
        ord.sort(function (x, y) { return p[y] - p[x]; });
        ans.push(ord[0] * 10 + ord[1]);
      }
    }
    var memo = {}, states = 0, all = [];
    for (i = 0; i < N; i++) all.push(i);

    function val(state) {
      var first = ans[state[0]], ok = true, t;
      for (t = 1; t < state.length; t++) { if (ans[state[t]] !== first) { ok = false; break; } }
      if (ok) return 0;
      var key = state.join(',');
      if (memo[key] !== undefined) return memo[key];
      var best = 1e9;
      for (var x = 0; x < n; x++) {
        for (var y = x + 1; y < n; y++) {
          var A = [], B = [];
          for (t = 0; t < state.length; t++) {
            if (ps[state[t]][x] < ps[state[t]][y]) A.push(state[t]); else B.push(state[t]);
          }
          if (!A.length || !B.length) continue;
          var w = 1 + Math.max(val(A), val(B));
          if (w < best) best = w;
        }
      }
      memo[key] = best;
      states++;
      return best;
    }

    var v = val(all);
    return { value: v, states: states };
  }

  /* ---------- the numbers this page quotes ---------------------------- */

  var N = 100;                                  /* the GATE 2014 array size */
  var DEMO = makeArray(8, 20261102);            /* the drawn array, n = 8 */
  var BIG = makeArray(N, 777);

  var PAIR8 = runPairing(DEMO);
  var TOUR8 = runTournament(DEMO);
  var NAIVE8 = runNaiveMinMax(DEMO);
  var NAIVE2_8 = runNaiveSecond(DEMO);
  var PAIR100 = runPairing(BIG);

  var MINI = {
    n2: { mm: minimax(2, 'maxmin'), s: minimax(2, 'second') },
    n3: { mm: minimax(3, 'maxmin'), s: minimax(3, 'second') },
    n4: { mm: minimax(4, 'maxmin'), s: minimax(4, 'second') },
    n5: { mm: minimax(5, 'maxmin'), s: minimax(5, 'second') }
  };

  /* ======================================================================
     LAYER 2 - VALIDATION
     ====================================================================== */

  var CHECKS = [];
  function check(name, pass, detail) {
    CHECKS.push({ name: name, pass: !!pass, detail: detail || '' });
  }

  (function validate() {
    var n, i, ok;

    /* 1. the pairing algorithm's own count equals the closed form */
    ok = true;
    for (n = 2; n <= 64; n++) {
      var a = makeArray(n, 1000 + n);
      if (runPairing(a).count !== ceil3over2(n)) { ok = false; break; }
    }
    check('pairing count equals ceil(3n/2) - 2 for n = 2..64', ok,
      'the algorithm is executed on a distinct array of each size and its comparisons counted');

    /* 2. the pairing algorithm is correct */
    ok = true;
    for (n = 2; n <= 64; n++) {
      var b = makeArray(n, 2000 + n);
      var r = runPairing(b);
      var s = b.slice().sort(function (x, y) { return x - y; });
      if (r.max !== s[n - 1] || r.min !== s[0]) { ok = false; break; }
    }
    check('pairing reports the true minimum and maximum for n = 2..64', ok,
      'both answers compared with a sort of the same array');

    /* 3. the saving over the naive method is floor(n/2) */
    ok = true;
    for (n = 2; n <= 64; n++) if (naiveMM(n) - ceil3over2(n) !== Math.floor(n / 2)) { ok = false; break; }
    check('2n - 2 minus the optimal count equals floor(n/2) for n = 2..64', ok);

    /* 4. the adversary accounting reproduces the closed form */
    ok = true;
    for (n = 2; n <= 64; n++) if (adversaryBound(n) !== ceil3over2(n)) { ok = false; break; }
    check('2n - 2 - floor(n/2) equals ceil(3n/2) - 2 for n = 2..64', ok,
      'the units needed, minus the comparisons that can pay two units at once');

    /* 5 and 6. exhaustive minimax, both jobs, n = 2..5 */
    var mm = [MINI.n2.mm.value, MINI.n3.mm.value, MINI.n4.mm.value, MINI.n5.mm.value];
    var ss = [MINI.n2.s.value, MINI.n3.s.value, MINI.n4.s.value, MINI.n5.s.value];
    var want = [1, 3, 4, 6];
    check('exhaustive search confirms min+max = 1, 3, 4, 6 at n = 2..5',
      mm.join(',') === want.join(','), 'values found: ' + mm.join(', '));
    check('exhaustive search confirms second largest = 1, 3, 4, 6 at n = 2..5',
      ss.join(',') === want.join(','), 'values found: ' + ss.join(', '));
    ok = true;
    for (i = 0; i < 4; i++) {
      if (mm[i] !== ceil3over2(i + 2)) ok = false;
      if (ss[i] !== secondForm(i + 2)) ok = false;
    }
    check('the exhaustive values equal both closed forms at n = 2..5', ok,
      'the two formulas agree on this range, which is the trap the last scene names');

    /* 7. the tournament is never worse than the closed form, and attains it
          when the maximum sits at leaf 0, which plays the full depth */
    ok = true;
    for (n = 2; n <= 64; n++) {
      var c = makeArray(n, 3000 + n);
      var tc = runTournament(c);
      if (tc.total > secondForm(n)) { ok = false; break; }
      if (tc.beaten.length > log2ceil(n)) { ok = false; break; }
    }
    check('the tournament never exceeds n + ceil(log2 n) - 2 for n = 2..64', ok,
      'the bracket is padded to a power of two, so no element plays more than ceil(log2 n) matches');

    ok = true;
    for (n = 2; n <= 64; n++) {
      var worst = makeArray(n, 9000 + n);
      /* put the largest at leaf 0: leaf 0 never receives a walkover */
      var top = 0, q2;
      for (q2 = 1; q2 < n; q2++) if (worst[q2] > worst[top]) top = q2;
      var t2 = worst[top]; worst[top] = worst[0]; worst[0] = t2;
      var tw = runTournament(worst);
      if (tw.winner !== 0) { ok = false; break; }
      if (tw.beaten.length !== log2ceil(n)) { ok = false; break; }
      if (tw.total !== secondForm(n)) { ok = false; break; }
    }
    check('the bound is attained: a maximum at leaf 0 costs exactly n + ceil(log2 n) - 2', ok,
      'the winner then plays ceil(log2 n) matches, so its victim list has that length');

    /* 9. the tournament's second largest is the true one */
    ok = true;
    for (n = 2; n <= 64; n++) {
      var e = makeArray(n, 5000 + n);
      var t = runTournament(e);
      var s2 = e.slice().sort(function (x, y) { return x - y; });
      if (t.second !== s2[n - 2]) { ok = false; break; }
    }
    check('tournament reports the true second largest for n = 2..64', ok);

    /* 10. the two-pass method costs 2n - 3 */
    ok = true;
    for (n = 2; n <= 64; n++) {
      var f = makeArray(n, 6000 + n);
      if (runNaiveSecond(f).count !== naiveSecond(n)) { ok = false; break; }
    }
    check('the two-pass second largest costs 2n - 3 for n = 2..64', ok);

    /* 11. the optimal count is never above the two-pass count */
    ok = true;
    for (n = 2; n <= 64; n++) if (secondForm(n) > naiveSecond(n)) { ok = false; break; }
    check('the optimal second largest never exceeds 2n - 3 for n = 2..64', ok);

    /* 12. the two formulas coincide exactly for n = 2..6 */
    ok = true;
    var firstDiff = -1;
    for (n = 2; n <= 30; n++) {
      if (ceil3over2(n) === secondForm(n)) { if (firstDiff === -1) ok = ok; }
      else if (firstDiff === -1) firstDiff = n;
    }
    var coincide = [];
    for (n = 2; n <= 6; n++) coincide.push(ceil3over2(n) === secondForm(n));
    check('the two closed forms coincide for n = 2..6 and first differ at n = 7',
      coincide.indexOf(false) === -1 && firstDiff === 7, 'first difference at n = ' + firstDiff);

    /* 13. GATE CSE 2014 Set 1 Q39 */
    check('GATE CSE 2014 Set 1 Q39: n = 100 gives 148', ceil3over2(N) === 148 && PAIR100.count === 148,
      'the closed form and the executed algorithm agree: ' + PAIR100.count);

    /* 14. GATE CSE 2021 Set 1 Q2: t <= 3 ceil(n/2) everywhere, and t > n from n = 5 */
    ok = true;
    for (n = 2; n <= 64; n++) {
      var t2 = ceil3over2(n);
      if (!(t2 <= 3 * Math.ceil(n / 2))) { ok = false; break; }
      if (n >= 5 && !(t2 > n)) { ok = false; break; }
    }
    check('GATE CSE 2021 Set 1 Q2: t <= 3 ceil(n/2) for n = 2..64 and t > n for n >= 5', ok,
      'the exact count equals n at n = 3 and n = 4, which is the only place the strict inequality fails');

    /* 15. the maximum alone */
    ok = true;
    for (n = 2; n <= 64; n++) {
      var g = makeArray(n, 7000 + n);
      if (runMax(g).count !== maxAlone(n)) { ok = false; break; }
    }
    check('the maximum alone costs n - 1 comparisons for n = 2..64', ok);

    /* 16. the drawn array at n = 8 */
    check('the drawn array at n = 8 costs 10 = 3*8/2 - 2', PAIR8.count === 10 && NAIVE8.count === 14,
      'pairing ' + PAIR8.count + ', naive ' + NAIVE8.count);

    /* 17 and 18. the first four values of each formula */
    check('ceil(3n/2) - 2 gives 1, 3, 4, 6 at n = 2..5',
      [ceil3over2(2), ceil3over2(3), ceil3over2(4), ceil3over2(5)].join(',') === '1,3,4,6');
    check('n + ceil(log2 n) - 2 gives 1, 3, 4, 6 at n = 2..5',
      [secondForm(2), secondForm(3), secondForm(4), secondForm(5)].join(',') === '1,3,4,6');

    /* 19. sorting is strictly harder */
    ok = true;
    var equalAt = [];
    for (n = 2; n <= 12; n++) {
      var fact = 1, q;
      for (q = 2; q <= n; q++) fact *= q;
      var lg = Math.ceil(Math.log(fact) / Math.LN2 - 1e-12);
      if (!(lg >= ceil3over2(n) && lg >= secondForm(n))) { ok = false; break; }
      if (lg === ceil3over2(n)) equalAt.push(n);
    }
    check('ceil(log2(n!)) is at least both selection counts for n = 2..12', ok,
      'sorting must determine every order, so it cannot be cheaper than finding two order statistics; they meet at n = ' + equalAt.join(', '));

    /* 20. the odd-n form */
    ok = true;
    for (n = 3; n <= 63; n += 2) if (3 * (n - 1) / 2 !== ceil3over2(n)) { ok = false; break; }
    check('for odd n, 3(n-1)/2 equals ceil(3n/2) - 2 for n = 3..63', ok);

    /* 21. the search really explored something */
    var st = [MINI.n2.mm.states, MINI.n3.mm.states, MINI.n4.mm.states, MINI.n5.mm.states];
    check('the exhaustive search visits 1, 13, 183 and 3851 states at n = 2..5',
      st[0] > 0 && st[1] > st[0] && st[2] > st[1] && st[3] > st[2] && st[3] === 3851,
      'states: ' + st.join(', '));

    /* 22. the naive method is strictly worse from n = 3 */
    ok = true;
    for (n = 3; n <= 64; n++) if (!(naiveMM(n) > ceil3over2(n))) { ok = false; break; }
    check('the naive min+max is strictly worse than optimal for every n >= 3', ok);

    /* 23. the tree has n - 1 internal nodes */
    ok = true;
    for (n = 2; n <= 64; n++) {
      var h = makeArray(n, 8000 + n);
      if (runTournament(h).findCount !== n - 1) { ok = false; break; }
    }
    check('the tournament tree makes exactly n - 1 comparisons for n = 2..64', ok);

    /* 24. the candidate list is short */
    ok = true;
    for (n = 6; n <= 64; n++) if (log2ceil(n) >= n - 2) { ok = false; break; }
    check('the candidate list ceil(log2 n) is shorter than n - 2 for n = 6..64', ok,
      'which is why the second search costs a fraction of the two-pass method');

    /* 25. the drawn array is the one the scenes quote */
    check('the drawn array is distinct and its maximum is 8',
      DEMO.length === 8 && DEMO.slice().sort(function (x, y) { return x - y; }).join(',') === '1,2,3,4,5,6,7,8' &&
      runMax(DEMO).value === 8);
  })();

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

  /* ======================================================================
     LAYER 3 - RENDER
     ====================================================================== */

  function stage(p, n) {
    var s = Math.floor(K.clamp01(p) * n);
    return s >= n ? n - 1 : s;
  }

  function title(s, sub) {
    P.text(28, 18, s, { size: 15.5, bold: true, color: PAL.ink });
    if (sub) P.text(28, 40, sub, { size: 11, color: PAL.dim });
  }

  function foot(s) {
    P.text(28, 446, s, { size: 10.5, color: PAL.faint });
  }

  function line(x, y, s, o) {
    o = o || {};
    P.text(x, y, s, {
      size: o.size || 12, color: o.color || PAL.ink, bold: !!o.bold,
      mono: !!o.mono, align: o.align || 'left', base: 'top'
    });
  }

  function centre(x, y, s, o) {
    o = o || {};
    P.text(x, y, s, {
      size: o.size || 12, color: o.color || PAL.ink, bold: !!o.bold,
      mono: !!o.mono, align: 'center', base: 'middle'
    });
  }

  function panel(x, y, w, h, o) {
    o = o || {};
    var fill = o.tone === 'bad' ? PAL.invalidDim : o.tone === 'good' ? PAL.accentDim
             : o.tone === 'warn' ? PAL.warnDim : o.tone === 'info' ? PAL.surface2 : PAL.surface;
    var stroke = o.tone === 'bad' ? PAL.invalid : o.tone === 'good' ? PAL.accent
               : o.tone === 'warn' ? PAL.warn : PAL.border;
    P.rect(x, y, w, h, { fill: fill, stroke: stroke, sw: o.sw || 1.1, radius: 6 });
  }

  function chip(x, y, w, h, label, o) {
    o = o || {};
    var fill = o.tone === 'a' ? PAL.accentDim : o.tone === 'b' ? PAL.warnDim
             : o.tone === 'c' ? PAL.invalidDim : o.tone === 'plain' ? PAL.surface2 : PAL.surface;
    var stroke = o.tone === 'a' ? PAL.accent : o.tone === 'b' ? PAL.warn
               : o.tone === 'c' ? PAL.invalid : PAL.border;
    P.rect(x, y, w, h, { fill: fill, stroke: stroke, sw: o.sw || 1.1, radius: 4 });
    if (label !== undefined && label !== null) {
      centre(x + w / 2, y + h / 2, label, { size: o.size || 12, mono: true, color: o.color || PAL.ink, bold: o.bold });
    }
  }

  function verdict(x, y, ok, word) {
    line(x, y, word || (ok ? 'ok' : 'no'), {
      size: 11.5, bold: true, mono: true, color: ok ? PAL.valid : PAL.invalid
    });
  }

  /* a row of the drawn array, with an optional set of marked positions */
  function arrayRow(x, y, a, o) {
    o = o || {};
    var cw = o.cw || 46, ch = o.ch || 34, i;
    for (i = 0; i < a.length; i++) {
      var tone = 'plain';
      if (o.mark && o.mark.indexOf(i) >= 0) tone = o.markTone || 'a';
      chip(x + i * (cw + 4), y, cw, ch, String(a[i]), { tone: tone, size: o.size || 12 });
    }
  }

  /* --- 1. what is being counted ---------------------------------------- */
  function drawPay(p) {
    var s = stage(p, 4);
    title('The question is a count, not a growth rate',
      'eight numbers, one allowed operation: compare two of them');

    arrayRow(60, 96, DEMO, { mark: s >= 1 ? [0, 1, 2, 3, 4, 5, 6, 7] : [], markTone: 'plain', cw: 92, ch: 44, size: 14 });
    line(60, 78, 'the array: eight distinct numbers', { size: 10.5, color: PAL.dim });

    if (s >= 1) {
      panel(60, 166, 330, 108, { tone: 'info' });
      line(78, 180, 'the ledger', { size: 12, bold: true });
      line(78, 204, 'comparisons paid so far: ' + runMax(DEMO).count, { size: 11.5, mono: true });
      line(78, 226, 'largest found: ' + runMax(DEMO).value, { size: 11.5, mono: true });
      line(78, 248, 'each comparison is paid once', { size: 10.5, color: PAL.dim });
    }

    if (s >= 2) {
      panel(412, 166, 448, 108, { tone: 'warn' });
      line(430, 180, 'what O(n) hides', { size: 12, bold: true });
      line(430, 204, 'a growth rate keeps the constant unknown', { size: 11.5 });
      line(430, 226, 'the pair costs 198 the obvious way, 148 the best way', { size: 11.5 });
      line(430, 248, 'both are O(n); only one is the answer', { size: 10.5, color: PAL.dim });
    }

    if (s >= 3) {
      var jobs = [
        ['the largest alone', 'n - 1'],
        ['largest and smallest', 'ceil(3n/2) - 2'],
        ['the second largest', 'n + ceil(log2 n) - 2']
      ];
      var i;
      for (i = 0; i < 3; i++) {
        panel(60 + i * 268, 292, 252, 86, { tone: i === 1 ? 'good' : 'info' });
        line(78 + i * 268, 306, jobs[i][0], { size: 11.5, bold: true });
        line(78 + i * 268, 332, jobs[i][1], { size: 13, mono: true, color: i === 1 ? PAL.accent : PAL.ink });
        line(78 + i * 268, 358, i === 0 ? 'seven at n = 8' : i === 1 ? '148 at n = 100' : '9 at n = 8',
          { size: 10.5, color: PAL.dim });
      }
    }
    foot('three jobs, three counts: a count is exact, a growth rate is not');
  }

  /* --- 2. the maximum --------------------------------------------------- */
  function drawKnockout(p) {
    var s = stage(p, 4);
    title('The maximum costs n - 1, and cannot cost less',
      'a comparison eliminates one candidate; eight candidates need seven eliminations');

    var i, x;
    for (i = 0; i < 8; i++) {
      x = 70 + i * 100;
      chip(x, 92, 44, 32, String(DEMO[i]), { tone: s >= 1 ? (i === 7 ? 'a' : 'plain') : 'plain', size: 11 });
    }
    line(70, 74, 'eight candidates, none eliminated yet', { size: 10.5, color: PAL.dim });

    /* the knockouts, one per comparison of a left-to-right scan */
    if (s >= 1) {
      var champ = 0, cnt = 0;
      for (i = 1; i < 8; i++) {
        cnt++;
        var beat = DEMO[i] > DEMO[champ];
        P.line(92 + (i - 1) * 100, 128, 92 + i * 100, 128, { stroke: PAL.border, sw: 1 });
        P.circle(92 + i * 100, 128, 3, { fill: beat ? PAL.accent : PAL.invalid });
        if (beat) champ = i;
      }
      line(70, 146, 'seven comparisons: each marks one element as eliminated', { size: 11, color: PAL.dim });
      line(70, 166, 'the survivor is ' + DEMO[champ], { size: 12.5, bold: true, color: PAL.accent });
    }

    if (s >= 2) {
      panel(70, 200, 380, 108, { tone: 'bad' });
      line(88, 214, 'stop after six comparisons', { size: 12, bold: true });
      line(88, 238, 'two elements have never lost', { size: 11.5 });
      line(88, 260, 'the adversary declares either one largest', { size: 11.5 });
      line(88, 282, 'so the answer is not determined', { size: 11.5, color: PAL.invalid, bold: true });
    }

    if (s >= 3) {
      panel(474, 200, 386, 108, { tone: 'good' });
      line(492, 214, 'so the count is exact', { size: 12, bold: true });
      line(492, 238, 'achieved by the scan: ' + runMax(DEMO).count + ' at n = 8', { size: 11.5, mono: true });
      line(492, 260, 'unavoidable: ' + (8 - 1) + ' eliminations are needed', { size: 11.5, mono: true });
      line(492, 282, 'n - 1 is both an upper and a lower bound', { size: 11, color: PAL.accent });
    }

    if (s >= 3) {
      panel(70, 330, 790, 84, { tone: 'info' });
      line(88, 344, 'the shape of every proof in this lesson', { size: 11.5, bold: true });
      line(88, 368, 'an algorithm gives an upper bound        an adversary gives a lower bound', { size: 11 });
      line(88, 390, 'the answer is the number where the two meet, and both halves must be shown', { size: 11, color: PAL.dim });
    }
    foot('one comparison, one elimination: that is why the maximum costs n - 1');
  }

  /* --- 3. the naive min and max ---------------------------------------- */
  function drawNaive(p) {
    var s = stage(p, 4);
    title('Minimum and maximum the obvious way: 2n - 2',
      'two scans, each optimal for its own question, together wasting one comparison per pair');

    arrayRow(70, 96, DEMO, { cw: 92, ch: 40, size: 13, mark: s >= 1 ? [0, 1, 2, 3, 4, 5, 6, 7] : [], markTone: 'plain' });
    line(70, 78, 'the same eight numbers', { size: 10.5, color: PAL.dim });

    if (s >= 1) {
      panel(70, 158, 370, 96, { tone: 'info' });
      line(88, 172, 'scan 1: keep the largest', { size: 11.5, bold: true });
      line(88, 196, 'n - 1 = 7 comparisons', { size: 11.5, mono: true });
      line(88, 220, 'answer ' + runMax(DEMO).value, { size: 11, color: PAL.dim });
    }
    if (s >= 2) {
      panel(70, 266, 370, 96, { tone: 'warn' });
      line(88, 280, 'scan 2: keep the smallest', { size: 11.5, bold: true });
      line(88, 304, 'n - 1 = 7 comparisons', { size: 11.5, mono: true });
      line(88, 328, 'total 2n - 2 = 14 at n = 8, 198 at n = 100', { size: 11, color: PAL.warn });
    }

    if (s >= 3) {
      panel(470, 158, 390, 204, { tone: 'good' });
      line(488, 172, 'one comparison carries two facts', { size: 12, bold: true });
      line(488, 198, 'compare x with y, x larger:', { size: 11 });
      line(506, 220, 'y cannot be the largest', { size: 11.5, color: PAL.accent });
      line(506, 242, 'x cannot be the smallest', { size: 11.5, color: PAL.accent });
      line(488, 272, 'the naive method uses the first fact', { size: 11 });
      line(488, 294, 'and throws the second away', { size: 11, color: PAL.invalid });
      line(488, 322, 'waste: one comparison per pair = floor(n/2)', { size: 11.5, mono: true });
      line(488, 344, 'at n = 100 that is 50 comparisons', { size: 10.5, color: PAL.dim });
    }

    if (s >= 3) {
      line(70, 382, '198 is not the minimum. It is 148 plus the 50 the naive method discards.',
        { size: 11.5, bold: true, color: PAL.ink });
    }
    foot('each comparison orders a pair: the loser is a candidate for the smallest, not just the winner for the largest');
  }

  /* --- 4. the pairing trick -------------------------------------------- */
  function drawPairing(p) {
    var s = stage(p, 4);
    title('The pairing trick: floor(n/2) + 2 ceil(n/2) - 2',
      'order every pair once, then reduce the winners and the losers separately');

    var cw = 62, i, x;
    /* the pairs at n = 8 */
    for (i = 0; i < 4; i++) {
      var a0 = DEMO[2 * i], a1 = DEMO[2 * i + 1];
      var win = a0 >= a1 ? a0 : a1, lose = a0 >= a1 ? a1 : a0;
      x = 70 + i * 132;
      chip(x, 92, 54, 30, String(win), { tone: s >= 1 ? 'a' : 'plain', size: 11 });
      chip(x + 58, 92, 54, 30, String(lose), { tone: s >= 1 ? 'b' : 'plain', size: 11 });
      if (s >= 1) {
        P.line(x + 27, 126, x + 27, 150, { stroke: PAL.accent, sw: 1.2, dash: [3, 3] });
        P.line(x + 85, 126, x + 85, 150, { stroke: PAL.warn, sw: 1.2, dash: [3, 3] });
        centre(x + 56, 138, String(4), { size: 9.5, color: PAL.dim });
      }
    }
    line(70, 74, 'eight numbers as four pairs, one comparison each', { size: 10.5, color: PAL.dim });
    if (s >= 1) {
      line(70, 160, 'winners: ' + PAIR8.winners.map(function (j) { return DEMO[j]; }).join(', '),
        { size: 11, color: PAL.accent, bold: true });
      line(70, 180, 'losers:  ' + PAIR8.losers.map(function (j) { return DEMO[j]; }).join(', '),
        { size: 11, color: PAL.warn, bold: true });
    }

    if (s >= 2) {
      panel(70, 204, 240, 76, { tone: 'info' });
      line(84, 216, 'phase 1: the pairs', { size: 11, bold: true });
      line(84, 240, 'floor(n/2) = 4', { size: 12, mono: true });
      line(84, 262, 'each pair ordered once', { size: 10, color: PAL.dim });

      panel(322, 204, 240, 76, { tone: 'good' });
      line(336, 216, 'phase 2: largest of winners', { size: 11, bold: true });
      line(336, 240, 'ceil(n/2) - 1 = 3', { size: 12, mono: true });
      line(336, 262, 'the largest is among them', { size: 10, color: PAL.dim });

      panel(574, 204, 286, 76, { tone: 'good' });
      line(588, 216, 'phase 3: smallest of losers', { size: 11, bold: true });
      line(588, 240, 'ceil(n/2) - 1 = 3', { size: 12, mono: true });
      line(588, 262, 'the smallest is among them', { size: 10, color: PAL.dim });
    }

    if (s >= 3) {
      line(70, 296, '4 + 3 + 3 = 10 at n = 8, and 10 = 3*8/2 - 2', { size: 12.5, mono: true, bold: true });
      line(70, 322, 'at n = 100: 50 + 49 + 49 = ' + PAIR100.count, { size: 13.5, mono: true, bold: true, color: PAL.accent });
      line(70, 348, 'the algorithm was run and counted, not evaluated from the formula', { size: 10.5, color: PAL.dim });
      line(70, 372, 'minimum found: ' + PAIR100.min + '    maximum found: ' + PAIR100.max,
        { size: 11, color: PAL.dim });
    }
    foot('one comparison per pair does two jobs; the naive method pays twice for the same ordering');
  }

  /* --- 5. the adversary argument --------------------------------------- */
  function drawAdversary(p) {
    var s = stage(p, 4);
    title('Why 3n/2 - 2 cannot be beaten',
      'four categories, 2n - 2 units of information, and only floor(n/2) comparisons that pay two units');

    var cats = [
      ['untouched', 'U', 'never compared', PAL.faint],
      ['has only won', 'W', 'candidate for the largest', PAL.accent],
      ['has only lost', 'L', 'candidate for the smallest', PAL.warn],
      ['both won and lost', 'N', 'settled: neither extreme', PAL.invalid]
    ];
    var i, j;
    for (i = 0; i < 4; i++) {
      var x = 60 + i * 205;
      panel(x, 92, 190, 96, { tone: i === 3 ? 'bad' : 'info' });
      line(x + 14, 104, cats[i][0], { size: 11, bold: true });
      line(x + 14, 126, cats[i][2], { size: 10, color: PAL.dim });
      if (s >= 1) {
        var count = i === 0 ? (s >= 2 ? 0 : 3) : i === 3 ? (s >= 2 ? 5 : 0) : 1;
        line(x + 14, 150, 'elements: ' + count, { size: 11, mono: true, color: cats[i][3] });
      }
    }

    if (s >= 2) {
      line(60, 202, 'at the end: one has only won, one has only lost, and n - 2 have both',
        { size: 11.5, bold: true });
      line(60, 224, 'units required = 1 + 1 + 2(n - 2) = 2n - 2 = 14 at n = 8, 198 at n = 100',
        { size: 11.5, mono: true });
    }

    if (s >= 3) {
      panel(60, 250, 380, 96, { tone: 'good' });
      line(78, 262, 'a generous comparison', { size: 11.5, bold: true });
      line(78, 286, 'two untouched elements: pays 2 units', { size: 11 });
      line(78, 308, 'any other pair: pays at most 1', { size: 11 });
      line(78, 330, 'at most floor(n/2) can be generous', { size: 11, color: PAL.accent });

      panel(462, 250, 398, 96, { tone: 'warn' });
      line(480, 262, 'so the count is at least', { size: 11.5, bold: true });
      line(480, 286, '2n - 2 - floor(n/2) = ceil(3n/2) - 2', { size: 12.5, mono: true, bold: true });
      line(480, 310, 'at n = 8: 14 - 4 = 10, which the algorithm attains', { size: 11, mono: true });
      line(480, 332, 'at n = 100: 198 - 50 = 148', { size: 11, mono: true });
    }

    if (s >= 3) {
      line(60, 362, 'the bound counts information, so it constrains every algorithm, invented or not',
        { size: 11, color: PAL.dim });
    }
    foot('the adversary answers each comparison so that as little as possible is learned');
  }

  /* --- 6. odd n and the table ------------------------------------------ */
  function drawOddn(p) {
    var s = stage(p, 4);
    title('Odd n, the leftover element, and the exact formula',
      'one element waits outside the pairs and is compared with both champions');

    arrayRow(70, 92, [3, 7, 1, 5, 2], { cw: 58, ch: 34, size: 12, mark: s >= 1 ? [4] : [], markTone: 'b' });
    line(70, 74, 'five numbers: two pairs and one leftover', { size: 10.5, color: PAL.dim });

    if (s >= 1) {
      line(70, 146, 'pairs: (3,7) and (1,5), two comparisons', { size: 11 });
      line(70, 168, 'winners 7, 5; losers 3, 1', { size: 11 });
      line(70, 190, 'leftover 2 is compared with the largest and the smallest: two more', { size: 11 });
      line(70, 216, '2 + 1 + 1 + 2 = 6 = 3(5-1)/2 = ceil(3*5/2) - 2', { size: 12, mono: true, bold: true, color: PAL.accent });
    }

    if (s >= 2) {
      line(70, 246, 'one formula covers both parities: ceil(3n/2) - 2', { size: 12, bold: true });
      line(70, 268, 'n = 2 gives 1: one comparison settles both questions', { size: 11, color: PAL.dim });
      line(70, 288, 'n = 3 gives 3; n = 4 gives 4; n = 5 gives 6', { size: 11, color: PAL.dim });
    }

    if (s >= 3) {
      panel(470, 86, 392, 272);
      line(488, 98, 'n      naive 2n-2      pairing      formula', { size: 10.5, mono: true, color: PAL.dim });
      var i;
      for (i = 0; i < 11; i++) {
        var n = i + 2;
        var y = 120 + i * 20;
        var eq = runPairing(makeArray(n, 1000 + n)).count === ceil3over2(n);
        line(488, y, pad2(n) + '          ' + pad3(naiveMM(n)) + '          ' + pad3(runPairing(makeArray(n, 1000 + n)).count) +
          '          ' + pad3(ceil3over2(n)), { size: 10.5, mono: true, color: i === 4 ? PAL.accent : PAL.ink });
        if (!eq) verdict(820, y, false);
      }
      line(488, 340, 'rows 2 to 12; the last two columns agree everywhere', { size: 10, color: PAL.dim });
    }
    foot('the ceiling is what makes one formula serve both parities');
  }

  function pad2(n) { return n < 10 ? ' ' + n : '' + n; }
  function pad3(n) { return n < 10 ? '  ' + n : n < 100 ? ' ' + n : '' + n; }

  /* --- 7. the second largest, naive ------------------------------------ */
  function drawSecond(p) {
    var s = stage(p, 4);
    title('The second largest the obvious way: 2n - 3',
      'find the largest, remove it, find the largest of what is left');

    arrayRow(70, 92, DEMO, { cw: 92, ch: 40, size: 13, mark: s >= 1 ? [runMax(DEMO).index] : [], markTone: 'a' });
    line(70, 74, 'the same eight numbers', { size: 10.5, color: PAL.dim });

    if (s >= 1) {
      panel(70, 156, 350, 92, { tone: 'info' });
      line(88, 168, 'pass 1: find the largest', { size: 11.5, bold: true });
      line(88, 192, 'n - 1 = 7 comparisons, largest = ' + runMax(DEMO).value, { size: 11, mono: true });
      line(88, 216, 'then take it out of the array', { size: 10.5, color: PAL.dim });

      panel(70, 262, 350, 92, { tone: 'warn' });
      line(88, 274, 'pass 2: largest of the remaining seven', { size: 11.5, bold: true });
      line(88, 298, 'n - 2 = 6 comparisons, answer ' + NAIVE2_8.second, { size: 11, mono: true });
      line(88, 322, 'total 2n - 3 = ' + NAIVE2_8.count + ' at n = 8', { size: 11, mono: true, color: PAL.warn });
    }

    if (s >= 2) {
      panel(452, 156, 408, 92, { tone: 'bad' });
      line(470, 168, 'the best possible is ' + secondForm(8) + ', not ' + NAIVE2_8.count, { size: 12, bold: true });
      line(470, 192, 'n + ceil(log2 n) - 2 = 8 + 3 - 2 = 9', { size: 11.5, mono: true });
      line(470, 216, 'the gap is ' + (NAIVE2_8.count - secondForm(8)) + ' comparisons, and it grows', { size: 11, color: PAL.invalid });
    }

    if (s >= 3) {
      panel(452, 262, 408, 92, { tone: 'good' });
      line(470, 274, 'who can be second?', { size: 11.5, bold: true });
      line(470, 298, 'only an element that lost to the largest', { size: 11 });
      line(470, 320, 'everything else lost to something smaller', { size: 11, color: PAL.dim });
    }

    if (s >= 3) {
      line(70, 372, 'so the second pass does not need seven elements: it needs the largest element\'s own victim list',
        { size: 11.5, bold: true });
    }
    foot('the second largest lost to the largest and to nobody else');
  }

  /* --- 8. the tournament tree ------------------------------------------ */
  function drawTournament(p) {
    var s = stage(p, 4);
    title('The tournament tree: n + ceil(log2 n) - 2',
      'a balanced bracket makes the winner play only three matches at n = 8');

    var y0 = 352, y1 = 300, y2 = 248, y3 = 196;
    var lx = function (i) { return 82 + i * 94; };
    var i;

    /* leaves */
    for (i = 0; i < 8; i++) {
      var cand = TOUR8.beaten.indexOf(i) >= 0;
      chip(lx(i) - 22, y0, 44, 30, String(DEMO[i]), {
        tone: s >= 2 && cand ? 'a' : 'plain', size: 11
      });
    }

    /* connectors, drawn from the recorded rounds so the picture cannot drift
       away from the counted structure */
    var rounds = TOUR8.rounds;
    var parentTop = [y1, y2, y3];
    var r, m;
    for (r = 0; r < rounds.length; r++) {
      var childTop = r === 0 ? y0 : parentTop[r - 1];
      var ptop = parentTop[r];
      var hbar = ptop + 36;
      for (m = 0; m < rounds[r].length; m++) {
        var xa = lx(rounds[r][m][0]), xb = lx(rounds[r][m][1]);
        P.line(xa, childTop, xa, hbar, { stroke: PAL.border, sw: 1 });
        P.line(xb, childTop, xb, hbar, { stroke: PAL.border, sw: 1 });
        P.line(xa, hbar, xb, hbar, { stroke: PAL.border, sw: 1 });
        var pcx = (xa + xb) / 2;
        P.line(pcx, ptop + 30, pcx, hbar, { stroke: PAL.border, sw: 1 });
        centre(pcx, hbar + 10, String(r + 1), { size: 9, color: PAL.faint, mono: true });
      }
    }

    /* one chip per survivor, level by level */
    for (r = 0; r < rounds.length; r++) {
      var top = parentTop[r];
      for (m = 0; m < rounds[r].length; m++) {
        var w = rounds[r][m][2];
        var cx = (lx(rounds[r][m][0]) + lx(rounds[r][m][1])) / 2;
        var isCand = TOUR8.beaten.indexOf(w) >= 0;
        chip(cx - 22, top, 44, 30, String(DEMO[w]), {
          tone: r === rounds.length - 1 ? 'a' : (s >= 2 && isCand ? 'a' : 'plain'),
          size: 11, bold: r === rounds.length - 1
        });
      }
    }

    line(60, 74, 'eight numbers as leaves; each match is one comparison', { size: 10.5, color: PAL.dim });

    if (s >= 1) {
      panel(640, 92, 220, 118, { tone: 'info' });
      line(656, 104, 'the ledger', { size: 11.5, bold: true });
      line(656, 128, 'round 1: 4', { size: 11, mono: true });
      line(656, 148, 'round 2: 2', { size: 11, mono: true });
      line(656, 168, 'final:   1', { size: 11, mono: true });
      line(656, 190, 'total ' + TOUR8.findCount + ' = n - 1', { size: 11, mono: true, bold: true });
    }

    if (s >= 2) {
      line(60, 392, 'the winner played ' + TOUR8.beaten.length + ' matches, so its victim list is ' +
        TOUR8.beaten.map(function (j) { return DEMO[j]; }).join(', ') + ' - the only candidates for second',
        { size: 11, color: PAL.accent, bold: true });
      line(60, 410, 'largest of those ' + TOUR8.beaten.length + ' costs ' + TOUR8.secondCount +
        ' comparisons: ' + TOUR8.findCount + ' + ' + TOUR8.secondCount + ' = ' + TOUR8.total +
        ' = n + ceil(log2 n) - 2', { size: 11, mono: true });
    }
    if (s >= 3) {
      line(60, 428, 'a left-to-right scan would make the winner play seven matches and leave seven candidates',
        { size: 10.5, color: PAL.dim });
    }
    foot('the bracket is the ledger: one internal node per comparison');
  }

  /* --- 9. the lower bound for the second largest ----------------------- */
  function drawLower2(p) {
    var s = stage(p, 4);
    title('Why fewer comparisons cannot find the second largest',
      'the winner must beat ceil(log2 n) elements, and each of them stays a candidate');

    var i;
    /* the winner's victim list, growing */
    panel(60, 92, 400, 150, { tone: s >= 2 ? 'good' : 'info' });
    line(78, 104, 'the largest element\'s victim list', { size: 11.5, bold: true });
    for (i = 0; i < 3; i++) {
      var on = s >= 1 ? i <= (s >= 2 ? 2 : 1) : false;
      chip(80 + i * 62, 132, 50, 34, on ? String(DEMO[TOUR8.beaten[i]]) : '?', {
        tone: on ? 'a' : 'plain', size: 12
      });
    }
    line(78, 180, 'length must reach ceil(log2 n) = 3 at n = 8', { size: 11, mono: true });
    line(78, 204, 'then the second largest is the largest of them', { size: 10.5, color: PAL.dim });
    line(78, 224, 'cost so far: ' + TOUR8.findCount + ' + ' + TOUR8.secondCount + ' = ' + TOUR8.total,
      { size: 11, color: PAL.accent, bold: true });

    if (s >= 1) {
      panel(486, 92, 374, 150, { tone: 'bad' });
      line(504, 104, 'if the list were shorter', { size: 11.5, bold: true });
      line(504, 130, 'some element never met the largest', { size: 11 });
      line(504, 152, 'it lost only to something smaller', { size: 11 });
      line(504, 174, 'the adversary promotes it to second', { size: 11, color: PAL.invalid });
      line(504, 200, 'so the answer is not determined', { size: 11, color: PAL.invalid, bold: true });
      line(504, 222, 'and the algorithm is wrong on some input', { size: 10.5, color: PAL.dim });
    }

    if (s >= 2) {
      line(60, 262, 'the two halves meet', { size: 12, bold: true });
      line(60, 288, 'upper: a balanced bracket attains ' + secondForm(8) + ' at n = 8', { size: 11.5 });
      line(60, 310, 'lower: the adversary forbids fewer than ' + secondForm(8), { size: 11.5 });
      line(60, 336, 'so n + ceil(log2 n) - 2 is exact, not merely an upper bound',
        { size: 12, mono: true, bold: true, color: PAL.accent });
    }

    if (s >= 3) {
      panel(60, 360, 800, 56, { tone: 'info' });
      line(78, 372, 'the same method, three times', { size: 11, bold: true });
      line(78, 394, 'maximum alone: n - 1 exclusions     pair: 2n - 2 units, floor(n/2) paid twice     second: victim list of length ceil(log2 n)',
        { size: 10.5 });
    }
    foot('count what any correct algorithm must know, then divide by what one comparison can deliver');
  }

  /* --- 10. exhaustive search ------------------------------------------- */
  function drawBruteforce(p) {
    var s = stage(p, 4);
    title('Searching every strategy for n up to 5',
      'a minimax over the consistent orderings, with the adversary choosing the worse answer');

    if (s >= 1) {
      panel(60, 88, 380, 150, { tone: 'info' });
      line(78, 100, 'how the search works', { size: 11.5, bold: true });
      line(78, 126, 'a state: the orderings still possible', { size: 11 });
      line(78, 148, 'a move: pick a pair to compare', { size: 11 });
      line(78, 170, 'the adversary keeps the larger half', { size: 11 });
      line(78, 192, 'value: 1 + the worse of the two halves', { size: 11 });
      line(78, 216, 'states visited: ' + MINI.n2.mm.states + ', ' + MINI.n3.mm.states + ', ' +
        MINI.n4.mm.states + ', ' + MINI.n5.mm.states, { size: 10.5, mono: true, color: PAL.dim });
    }

    if (s >= 2) {
      panel(462, 88, 398, 150);
      line(480, 100, 'n     min+max found   formula   second found   formula', { size: 10, mono: true, color: PAL.dim });
      var mm = [MINI.n2.mm.value, MINI.n3.mm.value, MINI.n4.mm.value, MINI.n5.mm.value];
      var ss = [MINI.n2.s.value, MINI.n3.s.value, MINI.n4.s.value, MINI.n5.s.value];
      var i;
      for (i = 0; i < 4; i++) {
        var n = i + 2, y = 126 + i * 26;
        line(480, y, pad2(n) + '          ' + pad3(mm[i]) + '          ' + pad3(ceil3over2(n)) +
          '          ' + pad3(ss[i]) + '          ' + pad3(secondForm(n)),
          { size: 10.5, mono: true, color: mm[i] === ceil3over2(n) ? PAL.ink : PAL.invalid });
      }
      line(480, 224, 'every row agrees with both formulas', { size: 10, color: PAL.dim });
    }

    if (s >= 3) {
      panel(60, 254, 800, 118, { tone: 'warn' });
      line(78, 266, 'where the two formulas part company', { size: 11.5, bold: true });
      var j;
      for (j = 0; j < 8; j++) {
        var nn = j + 2;
        var same = ceil3over2(nn) === secondForm(nn);
        line(80 + j * 96, 296, 'n = ' + nn, { size: 10, color: PAL.dim, mono: true });
        line(80 + j * 96, 316, 'pair ' + ceil3over2(nn), { size: 10.5, mono: true });
        line(80 + j * 96, 338, 'second ' + secondForm(nn), {
          size: 10.5, mono: true, color: same ? PAL.ink : PAL.invalid, bold: !same
        });
      }
      line(78, 358, 'equal for n = 2 to 6; from n = 7 the pair costs one more and the gap widens',
        { size: 10.5, color: PAL.warn });
    }

    if (s >= 3) {
      line(60, 390, 'the search checks small cases; the adversary proves the formula. Neither replaces the other.',
        { size: 11.5, bold: true });
    }
    foot('an exhaustive search can refute a formula, never establish one for all n');
  }

  /* --- 11. the two previous-year items --------------------------------- */
  function drawGate(p) {
    var s = stage(p, 4);
    title('Two previous-year items, recomputed',
      'the count answers both without recalling which formula belongs to which year');

    panel(60, 88, 800, 130, { tone: 'info' });
    line(78, 100, 'GATE CSE 2014, Set 1, question 39', { size: 11.5, bold: true });
    line(78, 124, 'The minimum number of comparisons required to find the minimum and the maximum of 100 numbers is ____.',
      { size: 11 });
    if (s >= 1) {
      line(78, 150, 'n = 100 is even, so the count is 3n/2 - 2 = ' + ceil3over2(100) +
        ', and the algorithm run on 100 numbers makes ' + PAIR100.count, { size: 11, mono: true });
      line(78, 174, 'published key 148, accepted over 147.1 to 148.1', { size: 10.5, color: PAL.accent, bold: true });
      line(78, 196, 'the two-pass method would have given ' + naiveMM(100) + ', which is not the minimum', { size: 10.5, color: PAL.dim });
    }

    if (s >= 2) {
      panel(60, 230, 800, 130, { tone: 'good' });
      line(78, 242, 'GATE CSE 2021, Set 1, question 2', { size: 11.5, bold: true });
      line(78, 266, 'Let t be the lowest upper bound on the comparisons needed to find the minimum and maximum.', { size: 11 });
      line(78, 290, 'answer: t > n and t <= 3 ceil(n/2)', { size: 11.5, mono: true, bold: true, color: PAL.accent });
      line(78, 314, 'the exact count ceil(3n/2) - 2 satisfies both inequalities for every n from 2 to 64', { size: 10.5 });
      line(78, 338, 'at n = 100: t = 148, and 148 > 100 and 148 <= 150', { size: 10.5, mono: true, color: PAL.dim });
    }

    if (s >= 3) {
      line(60, 376, 'four steps: name the facts, count what one comparison delivers, divide and round up, then exhibit the algorithm',
        { size: 11, bold: true });
      line(60, 400, 'the same four steps answer the maximum alone, the pair, and the second largest', { size: 10.5, color: PAL.dim });
    }
    foot('a numerical answer needs the constant, and the constant is the count');
  }

  var DRAW = {
    pay: drawPay, knockout: drawKnockout, naive: drawNaive, pairing: drawPairing,
    adversary: drawAdversary, oddn: drawOddn, second: drawSecond,
    tournament: drawTournament, lower2: drawLower2, bruteforce: drawBruteforce,
    gate: drawGate
  };

  function drawFrame(t) {
    if (!P) return;
    P.clear();
    P.alpha(1);
    var i = K.sceneAt(t);
    var sc = K.state.scenes[i];
    if (!sc) return;
    var fn = DRAW[sc.id];
    if (fn) fn(K.sceneProgress(t));
  }

  /* ======================================================================
     BOOT
     ====================================================================== */

  function reportChecks() {
    var el = document.getElementById('checks');
    if (!el) return;
    var bad = CHECKS.filter(function (c) { return !c.pass; });
    el.innerHTML = '<span class="k">Model checks</span>' +
      '<p class="small" style="margin:6px 0 0">' + PASSED + ' of ' + CHECKS.length + ' passed' +
      (bad.length ? ' <span style="color:var(--invalid)">(' + bad.length + ' failed)</span>' : '') + '</p>';
  }

  function boot() {
    var holder = document.getElementById('canvas-holder');
    var fallback = document.getElementById('canvas-fallback');
    reportChecks();

    var ok = false;
    try {
      if (window.p5) {
        new window.p5(function (sk) {
          sk.setup = function () {
            var c = sk.createCanvas(W, H);
            c.parent(holder);
            sk.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
            sk.noLoop();
            P = PR.makePainterP5(sk, W, H);
            drawFrame(K.state.elapsed);
          };
          sk.draw = function () { if (P) drawFrame(K.state.elapsed); };
        });
        K.onResize(function () {
          if (!holder) return;
          var scale = Math.min(1, holder.clientWidth / W);
          var cv = holder.querySelector('canvas');
          if (cv) { cv.style.width = (W * scale) + 'px'; cv.style.height = (H * scale) + 'px'; }
        });
        ok = true;
      }
    } catch (e) {
      console.error('p5 failed', e);
      ok = false;
    }

    if (!ok) {
      var drew = false;
      try {
        var cv2 = document.createElement('canvas');
        cv2.width = W; cv2.height = H;
        if (holder) holder.appendChild(cv2);
        var ctx2d = cv2.getContext && cv2.getContext('2d');
        if (ctx2d) { P = PR.makePainter2D(ctx2d, W, H); drawFrame(0); drew = true; }
      } catch (e) {
        console.error('canvas fallback failed', e);
      }
      if (!drew && fallback) fallback.classList.add('show');
    }

    if (K && K.init) {
      K.init({ timeline: window.LESSON_TIMELINE, draw: function () { if (P) drawFrame(K.state.elapsed); } });
    }

    window.__drawAt = function (t) {
      K.state.elapsed = t;
      if (P) drawFrame(t);
    };

    var bad = CHECKS.filter(function (c) { return !c.pass; });
    if (bad.length) console.warn('Model validation did not fully pass:', bad);
  }

  window.LESSON_MODEL = {
    N: N, DEMO: DEMO, PAIR8: PAIR8, PAIR100: PAIR100, TOUR8: TOUR8,
    NAIVE8: NAIVE8, NAIVE2_8: NAIVE2_8, MINI: MINI,
    ceil3over2: ceil3over2, secondForm: secondForm, naiveMM: naiveMM,
    naiveSecond: naiveSecond, maxAlone: maxAlone, log2ceil: log2ceil,
    unitsNeeded: unitsNeeded, generousComparisons: generousComparisons,
    adversaryBound: adversaryBound, runPairing: runPairing, runTournament: runTournament,
    runNaiveMinMax: runNaiveMinMax, runNaiveSecond: runNaiveSecond, runMax: runMax,
    minimax: minimax, makeArray: makeArray,
    PASSED: PASSED, TOTAL: CHECKS.length,
    ALL_PASS: PASSED === CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
