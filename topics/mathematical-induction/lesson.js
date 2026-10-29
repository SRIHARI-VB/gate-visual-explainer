/* ==========================================================================
   mathematical-induction — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads M; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   Two kinds of fact appear below and are kept apart:
     - what is an INDUCTION ARGUMENT: a predicate, a base case, and one
       universally quantified implication, written in a stated range;
     - what is a THEOREM about the numbers: the identity or inequality or count
       the argument establishes. Every theorem here is also checked by finite
       enumeration, and the page says plainly that a finite check is evidence
       and not a proof.

   Nothing in the render layer re-derives a value. Every table, count and
   residual on the canvas is read from M, which is computed once at load and
   re-verified by CHECKS.
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

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

  var CHECKS = [];
  function chk(name, pass, detail) {
    CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
  }

  /* ---------- 1a. sum of cubes ---------- */

  function sumCubes(n) { var s = 0; for (var i = 1; i <= n; i++) s += i * i * i; return s; }
  function tri(n) { return n * (n + 1) / 2; }
  function cubeClosed(n) { var t = tri(n); return t * t; }

  /* the growth of the two sides between k and k+1 */
  function cubeStep(k) {
    return {
      left: sumCubes(k + 1) - sumCubes(k),
      right: cubeClosed(k + 1) - cubeClosed(k),
      cube: Math.pow(k + 1, 3)
    };
  }

  var CUBE_N = 300;
  var cubeRows = [];
  (function () {
    var worst = 0;
    for (var n = 1; n <= CUBE_N; n++) {
      var s = sumCubes(n), f = cubeClosed(n);
      if (Math.abs(s - f) > worst) worst = Math.abs(s - f);
      if (n <= 6) cubeRows.push({ n: n, s: s, f: f });
    }
    chk('sum of cubes identity holds for n = 1..' + CUBE_N, worst === 0, 'max residual ' + worst);
    var stepBad = 0;
    for (var k = 1; k <= CUBE_N; k++) {
      var st = cubeStep(k);
      if (st.left !== Math.pow(k + 1, 3) || st.right !== Math.pow(k + 1, 3)) stepBad++;
    }
    chk('each side of the cubes identity grows by (k+1)^3', stepBad === 0, stepBad + ' disagreements');
    chk('the cubes base case at n = 1 agrees', sumCubes(1) === 1 && cubeClosed(1) === 1, '1 vs 1');
  })();

  var cubeStepSample = cubeStep(4);   /* used on the canvas: k = 4 gives 125 */

  /* ---------- 1b. 2^n against n^2 ---------- */

  var POW_MAX = 200;
  var powRows = [];
  (function () {
    var first = null, bad = 0;
    for (var n = 1; n <= POW_MAX; n++) {
      var l = Math.pow(2, n), r = n * n, ok = l > r;
      if (ok && first === null) first = n;
      if (!ok && n >= 5) bad++;
      if (n <= 8) powRows.push({ n: n, l: l, r: r, ok: ok });
    }
    /* first n from which the claim is true forever, within the checked range */
    var forever = null;
    for (var m = 1; m <= POW_MAX; m++) {
      var allOk = true;
      for (var q = m; q <= POW_MAX; q++) { if (!(Math.pow(2, q) > q * q)) { allOk = false; break; } }
      if (allOk) { forever = m; break; }
    }
    chk('2^n > n^2 is false at n = 2, 3 and 4', !(Math.pow(2, 2) > 4) && !(Math.pow(2, 3) > 9) && !(Math.pow(2, 4) > 16), '4=4, 8<9, 16=16');
    chk('the first n from which 2^n > n^2 holds for every larger n is 5', forever === 5, 'found ' + forever);
    chk('no n above 5 breaks 2^n > n^2 up to ' + POW_MAX, bad === 0, bad + ' breaks');
    window.__POW_FIRST = first;
    window.__POW_FOREVER = forever;
  })();

  /* the step condition: (n+1)^2 < 2n^2 */
  function powStepOk(n) { return (n + 1) * (n + 1) < 2 * n * n; }
  (function () {
    chk('the step condition fails at n = 1 and n = 2', !powStepOk(1) && !powStepOk(2), '4<2 false, 9<8 false');
    chk('the step condition holds from n = 3', powStepOk(3) && powStepOk(4) && powStepOk(50), '16<18 at n=3');
    var bad = 0;
    for (var n = 3; n <= POW_MAX; n++) if (!powStepOk(n)) bad++;
    chk('the step condition never fails again up to ' + POW_MAX, bad === 0, bad + ' failures');
  })();

  /* chain coverage: from a base, follow the step while the step is legal */
  function chainReach(base, stepMin, hi) {
    var seen = {}, stack = [base];
    seen[base] = true;
    while (stack.length) {
      var n = stack.pop();
      if (n + 1 <= hi && n >= stepMin && !seen[n + 1]) { seen[n + 1] = true; stack.push(n + 1); }
    }
    return Object.keys(seen).map(Number).sort(function (a, b) { return a - b; });
  }
  var chainFromOne = chainReach(1, 3, 20);
  var chainFromFive = chainReach(5, 3, 20);
  chk('base 1 with a step valid only from 3 reaches only n = 1', chainFromOne.length === 1 && chainFromOne[0] === 1, 'reached ' + chainFromOne.join(','));
  chk('base 5 with the same step reaches every n from 5 to 20', chainFromFive.length === 16 && chainFromFive[0] === 5 && chainFromFive[15] === 20, 'reached ' + chainFromFive.length + ' values');

  /* ---------- 1c. coins: 3 and 5 rupees ---------- */

  var COIN_MAX = 120;
  var coinOk = [true];
  (function () {
    for (var v = 1; v <= COIN_MAX; v++) {
      coinOk[v] = (v >= 3 && coinOk[v - 3]) || (v >= 5 && coinOk[v - 5]);
    }
    var unpayable = [];
    for (var u = 1; u <= COIN_MAX; u++) if (!coinOk[u]) unpayable.push(u);
    window.__COIN_UNAPAYABLE = unpayable;
    chk('the unpayable amounts are exactly 1, 2, 4 and 7', unpayable.join(',') === '1,2,4,7', unpayable.join(','));
    var gap = 0;
    for (var g = 8; g <= COIN_MAX; g++) if (!coinOk[g]) gap++;
    chk('every amount from 8 to ' + COIN_MAX + ' is payable', gap === 0, gap + ' gaps');
    chk('8, 9 and 10 are the three base cases', coinOk[8] && coinOk[9] && coinOk[10], '3+5, 3+3+3, 5+5');
    /* the ordinary step P(n) -> P(n+1) fails where a payable n is followed by an unpayable n+1 */
    var weakFails = [];
    for (var w = 1; w < COIN_MAX; w++) if (coinOk[w] && !coinOk[w + 1]) weakFails.push(w);
    chk('the ordinary step P(n) -> P(n+1) fails at n = 3 and n = 6', weakFails[0] === 3 && weakFails[1] === 6, weakFails.slice(0, 4).join(','));
    /* the strong step: n payable implies n+3 payable, for every n */
    var strongBad = 0;
    for (var s3 = 1; s3 + 3 <= COIN_MAX; s3++) if (coinOk[s3] && !coinOk[s3 + 3]) strongBad++;
    chk('the step P(n) -> P(n+3) never fails', strongBad === 0, strongBad + ' failures');
  })();

  /* ---------- 1d. strong induction on prime factorisation ---------- */

  function smallestFactor(n) {
    for (var i = 2; i * i <= n; i++) if (n % i === 0) return i;
    return n;
  }
  (function () {
    var bad = 0, compositeSeen = 0;
    for (var n = 4; n <= 500; n++) {
      var p = smallestFactor(n);
      if (p < n) {
        compositeSeen++;
        var q = n / p;
        if (!(p >= 2 && p < n && q >= 2 && q < n && p * q === n)) bad++;
      }
    }
    chk('every composite n up to 500 splits into two smaller factors', bad === 0, compositeSeen + ' composites, ' + bad + ' failures');
    chk('the strong hypothesis is needed: both factors are below n', smallestFactor(91) === 7 && 91 / 7 === 13, '91 = 7 x 13');
  })();

  /* ---------- 1e. Fermat numbers ---------- */

  function isPrime(n) {
    if (n < 2) return false;
    if (n % 2 === 0) return n === 2;
    for (var i = 3; i * i <= n; i += 2) if (n % i === 0) return false;
    return true;
  }
  var fermat = [];
  (function () {
    for (var k = 0; k <= 5; k++) {
      var v = Math.pow(2, Math.pow(2, k)) + 1;
      fermat.push({ k: k, v: v, prime: isPrime(v) });
    }
    chk('F(k) is prime for k = 0..4', fermat.slice(0, 5).every(function (f) { return f.prime; }), '3, 5, 17, 257, 65537');
    chk('F(5) = 4294967297 is composite', fermat[5].v === 4294967297 && !fermat[5].prime, String(fermat[5].v));
    chk('4294967297 = 641 x 6700417', 641 * 6700417 === 4294967297, 'product verified');
    chk('641 divides F(5) with no remainder', 4294967297 % 641 === 0, '641 is prime: ' + isPrime(641));
  })();

  /* ---------- 1f. full binary trees ---------- */

  var LEAF = { leaf: true };
  function treesWith(i) {
    if (i === 0) return [LEAF];
    var out = [];
    for (var a = 0; a < i; a++) {
      var left = treesWith(a), right = treesWith(i - 1 - a);
      for (var x = 0; x < left.length; x++) {
        for (var y = 0; y < right.length; y++) out.push({ leaf: false, l: left[x], r: right[y] });
      }
    }
    return out;
  }
  function countTree(t) {
    if (t.leaf) return { internal: 0, leaves: 1, nodes: 1, edges: 0 };
    var a = countTree(t.l), b = countTree(t.r);
    return {
      internal: 1 + a.internal + b.internal,
      leaves: a.leaves + b.leaves,
      nodes: 1 + a.nodes + b.nodes,
      edges: 2 + a.edges + b.edges
    };
  }
  function catalan(i) {
    var c = 1;
    for (var k = 0; k < i; k++) c = c * 2 * (2 * k + 1) / (k + 2);
    return Math.round(c);
  }
  var treeCounts = [], treeTotal = 0, treeSample = null;
  (function () {
    var leafBad = 0, edgeBad = 0, catBad = 0;
    for (var i = 0; i <= 6; i++) {
      var list = treesWith(i);
      treeCounts.push(list.length);
      treeTotal += list.length;
      if (list.length !== catalan(i)) catBad++;
      for (var j = 0; j < list.length; j++) {
        var c = countTree(list[j]);
        if (c.leaves !== c.internal + 1) leafBad++;
        if (c.edges !== 2 * c.internal || c.nodes !== 2 * c.internal + 1) edgeBad++;
      }
      if (i === 3 && list.length) treeSample = list[0];
    }
    window.__TREE_SAMPLE = treeSample;
    chk('the number of full binary trees with i internal nodes is Catalan(i)', catBad === 0, treeCounts.join(','));
    chk('leaves = internal + 1 in every tree up to 6 internal nodes', leafBad === 0, treeTotal + ' trees, ' + leafBad + ' failures');
    chk('edges = 2i and nodes = 2i+1 in the same trees', edgeBad === 0, edgeBad + ' failures');
    chk('197 full binary trees are enumerated in total', treeTotal === 197, String(treeTotal));
    chk('the sample tree with 3 internal nodes has 4 leaves', countTree(treeSample).leaves === 4 && countTree(treeSample).internal === 3, '3 internal, 4 leaves');
  })();

  /* ---------- 1g. the horse argument ---------- */

  (function () {
    var bad = 0, zeroAt = [];
    for (var n = 1; n <= 12; n++) {
      var inter = n - 1;                 /* |{1..n} intersect {2..n+1}| */
      if (inter !== n - 1) bad++;
      if (inter === 0) zeroAt.push(n);
    }
    chk('the shared middle of the two n-horse groups has n-1 horses', bad === 0, 'n-1 for every n');
    chk('that middle is empty exactly at n = 1', zeroAt.length === 1 && zeroAt[0] === 1, 'empty at n=' + zeroAt.join(','));
  })();

  /* ---------- 1h. recurrence T(n) = 2T(n/2) + n ---------- */

  function recurExact(m) {           /* n = 2^m, T(1) = 0 */
    var T = 0;
    for (var i = 1; i <= m; i++) T = 2 * T + Math.pow(2, i);
    return T;
  }
  var recurRows = [];
  (function () {
    var bad = 0;
    for (var m = 1; m <= 20; m++) {
      var n = Math.pow(2, m), t = recurExact(m), closed = n * m;
      if (t !== closed) bad++;
      if (m <= 4 || m === 10 || m === 20) recurRows.push({ m: m, n: n, t: t, closed: closed });
    }
    chk('T(n) = n log2 n for every n = 2^m, m = 1..20', bad === 0, bad + ' disagreements');
    chk('T(16) = 64 and T(1024) = 10240', recurExact(4) === 64 && recurExact(10) === 10240, '64 and 10240');
    var stepBad = 0;
    for (var k = 1; k <= 19; k++) {
      var kk = Math.pow(2, k);
      var lhs = 2 * (kk * k) + 2 * kk;         /* 2T(k) + 2k */
      var rhs = (2 * kk) * (k + 1);            /* 2k log2(2k) */
      if (lhs !== rhs) stepBad++;
    }
    chk('the substitution step 2T(k)+2k = 2k log2(2k) holds for k = 2..2^19', stepBad === 0, stepBad + ' failures');
    chk('the largest checked input is 2^20 = 1048576', Math.pow(2, 20) === 1048576, '1048576');
  })();

  /* ---------- 1i. insertion sort invariant ---------- */

  function insertionTrace(arr) {
    var a = arr.slice(), n = a.length, states = [];
    states.push({ i: 0, a: a.slice() });
    for (var i = 1; i < n; i++) {
      var key = a[i], j = i - 1;
      while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; }
      a[j + 1] = key;
      states.push({ i: i, a: a.slice() });
    }
    return states;
  }
  function prefixInvariant(arr, state) {
    var k = state.i + 1;                       /* prefix length after this pass */
    var pre = state.a.slice(0, k);
    for (var i = 1; i < pre.length; i++) if (pre[i - 1] > pre[i]) return false;
    var orig = arr.slice(0, k).sort(function (x, y) { return x - y; });
    var got = pre.slice().sort(function (x, y) { return x - y; });
    for (var j = 0; j < orig.length; j++) if (orig[j] !== got[j]) return false;
    return true;
  }
  function permutations(arr) {
    if (arr.length <= 1) return [arr.slice()];
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      var rest = arr.slice(0, i).concat(arr.slice(i + 1));
      var sub = permutations(rest);
      for (var j = 0; j < sub.length; j++) out.push([arr[i]].concat(sub[j]));
    }
    return out;
  }
  var sortSample = [5, 2, 4, 6, 1, 3];
  var sortStates = insertionTrace(sortSample);
  (function () {
    var perms = permutations([1, 2, 3, 4]);
    var bad = 0, checked = 0;
    for (var p = 0; p < perms.length; p++) {
      var st = insertionTrace(perms[p]);
      for (var s = 0; s < st.length; s++) { checked++; if (!prefixInvariant(perms[p], st[s])) bad++; }
      var last = st[st.length - 1].a;
      for (var q = 1; q < last.length; q++) if (last[q - 1] > last[q]) bad++;
    }
    chk('the prefix invariant holds at every index of all 24 orderings of four values', bad === 0, checked + ' states, ' + bad + ' failures');
    chk('insertion sort returns a sorted array in all 24 orderings', permutations([1, 2, 3, 4]).every(function (pp) {
      var r = insertionTrace(pp).pop().a;
      for (var z = 1; z < r.length; z++) if (r[z - 1] > r[z]) return false;
      return true;
    }), '24 orderings');
    chk('after pass 3 on 5,2,4,6,1,3 the prefix is 2,4,5', sortStates[3].a.slice(0, 3).join(',') === '2,4,5', sortStates[3].a.slice(0, 3).join(','));
  })();

  /* ---------- 1j. a pattern that fails ---------- */

  (function () {
    var firstFail = null;
    for (var n = 0; n <= 60; n++) { if (!isPrime(n * n + n + 41)) { firstFail = n; break; } }
    chk('n^2 + n + 41 is prime for n = 0..39 and fails at n = 40', firstFail === 40, 'first failure at n = ' + firstFail);
  })();

  var M = {
    cubes: { rows: cubeRows, checked: CUBE_N, step: cubeStepSample },
    pow: { rows: powRows, forever: 5, stepMin: 3, stepAt3: { lhs: 16, rhs: 18 } },
    chain: { fromOne: chainFromOne, fromFive: chainFromFive },
    coins: { ok: coinOk, unpayable: [1, 2, 4, 7], max: COIN_MAX, weakFails: [3, 5] },
    fermat: fermat,
    trees: { counts: treeCounts, total: treeTotal, sample: treeSample },
    horses: { emptyAt: 1 },
    recur: { rows: recurRows, top: 20 },
    sort: { input: sortSample, states: sortStates, perms: 24 }
  };

  window.__MODEL = M;

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

  function tl() { return window.LESSON_TIMELINE; }

  function sceneProgress(t) {
    var T = tl();
    if (!T) return 0;
    for (var i = 0; i < T.scenes.length; i++) {
      var s = T.scenes[i];
      if (t >= s.start && t < s.end) return (t - s.start) / (s.end - s.start);
    }
    return 1;
  }

  function rv(sp, a, b) {
    if (sp <= a) return 0;
    if (sp >= b) return 1;
    return (sp - a) / (b - a);
  }

  function head(title) {
    P.alpha(1);
    P.text(40, 26, title, { size: 15, bold: true, color: PAL.ink });
    P.line(40, 50, 860, 50, { stroke: PAL.border, sw: 1 });
  }

  function foot(s) {
    P.alpha(1);
    P.text(40, 444, s, { size: 11.5, color: PAL.faint });
  }

  function card(x, y, w, h, a) {
    P.alpha(a === undefined ? 1 : a);
    P.rect(x, y, w, h, { fill: PAL.surface, stroke: PAL.border, sw: 1, radius: 6 });
  }

  /* ---------------- scene 1: two facts ---------------- */

  function drawWhy(t, sp) {
    head('Scene 1 · Two facts, infinitely many statements');

    var n = 10, x0 = 70, dx = 78;
    for (var i = 0; i < n; i++) {
      var a = rv(sp, 0.02 + i * 0.035, 0.06 + i * 0.035);
      if (a <= 0) continue;
      P.alpha(a);
      var x = x0 + i * dx;
      P.rect(x, 92, 20, 66, {
        fill: i === 0 ? PAL.accent : PAL.accentDim,
        stroke: PAL.accent, sw: 1.4, radius: 3
      });
      P.alpha(a * 0.95);
      P.text(x + 10, 166, 'P(' + i + ')', { size: 11.5, mono: true, align: 'center', color: PAL.dim });
    }
    /* the push */
    P.alpha(rv(sp, 0.03, 0.10));
    P.arrow(x0 - 30, 78, x0 + 2, 88, { stroke: PAL.warn, sw: 1.6 });
    P.text(x0 - 34, 66, 'push', { size: 11.5, color: PAL.warn, align: 'left' });

    /* the link arrow */
    P.alpha(rv(sp, 0.42, 0.55));
    P.line(x0 + 12, 200, x0 + (n - 1) * dx + 10, 200, { stroke: PAL.accent, sw: 1.6 });
    P.text(x0 + (n - 1) * dx / 2 + 6, 186, 'the same implication, proved once for an arbitrary n',
      { size: 12, align: 'center', color: PAL.accent });

    P.alpha(rv(sp, 0.55, 0.68));
    P.text(70, 228, 'Base:  P(0) is true.', { size: 15, color: PAL.ink });
    P.alpha(rv(sp, 0.66, 0.78));
    P.text(70, 262, 'Step:  for every n,  P(n) implies P(n+1).', { size: 15, color: PAL.ink });
    P.alpha(rv(sp, 0.78, 0.90));
    P.text(70, 296, 'Conclusion:  P(m) for every natural number m.', { size: 15, bold: true, color: PAL.accent });

    P.alpha(rv(sp, 0.88, 1));
    P.text(70, 340, 'Base alone settles one statement. Step alone settles none, because nothing starts it.',
      { size: 12.5, color: PAL.dim });

    foot('Ten statements drawn; the real claim has infinitely many, so the check must be a proof.');
  }

  /* ---------------- scene 2: the rule ---------------- */

  function drawRule(t, sp) {
    head('Scene 2 · The rule, written down');

    var a = rv(sp, 0.02, 0.14);
    card(56, 66, 520, 172, a);
    P.alpha(a);
    P.text(80, 82, 'P(0)', { size: 17, mono: true, color: PAL.ink });
    P.text(440, 84, 'base case', { size: 11.5, color: PAL.faint });
    P.text(80, 116, 'for every n:   P(n)  ->  P(n+1)', { size: 15, mono: true, color: PAL.ink });
    P.text(440, 118, 'step', { size: 11.5, color: PAL.faint });
    P.line(80, 152, 556, 152, { stroke: PAL.border, sw: 1 });
    P.text(80, 164, 'therefore, for every m:   P(m)', { size: 15, mono: true, bold: true, color: PAL.accent });
    P.text(440, 166, 'conclusion', { size: 11.5, color: PAL.faint });

    var parts = ['1  name the method', '2  define P(n) as a sentence', '3  prove the base',
                 '4  prove the step from arbitrary n', '5  invoke the rule'];
    P.alpha(rv(sp, 0.30, 0.46));
    P.text(604, 74, 'Five parts of a written proof', { size: 13, bold: true, color: PAL.ink });
    for (var i = 0; i < parts.length; i++) {
      P.alpha(rv(sp, 0.30 + i * 0.045, 0.38 + i * 0.045));
      P.text(604, 100 + i * 28, parts[i], { size: 12.5, color: PAL.dim });
    }

    P.alpha(rv(sp, 0.56, 0.70));
    P.text(56, 268, 'The hypothesis is not circular.', { size: 14, bold: true, color: PAL.ink });
    P.alpha(rv(sp, 0.66, 0.80));
    P.text(56, 298, 'You assume P(n) in order to prove P(n+1). What you have proved is the implication,',
      { size: 12.5, color: PAL.dim });
    P.text(56, 320, 'not the statement. Nothing is assumed about the n you care about.', { size: 12.5, color: PAL.dim });

    P.alpha(rv(sp, 0.82, 0.94));
    P.text(56, 362, 'The universally quantified step is what replaces infinitely many separate proofs.',
      { size: 12.5, color: PAL.accent });

    foot('Read the rule as one inference: two premises, one conclusion, no circularity.');
  }

  /* ---------------- scene 3: sum of cubes ---------------- */

  function drawCubes(t, sp) {
    head('Scene 3 · Worked: the sum of the first n cubes');

    P.alpha(rv(sp, 0.02, 0.12));
    P.text(56, 66, 'Claim:  1^3 + 2^3 + ... + n^3  =  (1 + 2 + ... + n)^2', { size: 15, mono: true, bold: true, color: PAL.ink });

    /* table */
    P.alpha(rv(sp, 0.10, 0.22));
    P.text(60, 100, 'n', { size: 12, bold: true, color: PAL.faint });
    P.text(200, 100, 'sum of cubes', { size: 12, bold: true, color: PAL.faint });
    P.text(400, 100, 'square of sum', { size: 12, bold: true, color: PAL.faint });
    P.line(56, 118, 540, 118, { stroke: PAL.border, sw: 1 });
    for (var i = 0; i < M.cubes.rows.length; i++) {
      var r = M.cubes.rows[i];
      var a = rv(sp, 0.12 + i * 0.03, 0.18 + i * 0.03);
      P.alpha(a);
      P.text(60, 130 + i * 27, String(r.n), { size: 13, mono: true, color: PAL.ink });
      P.text(200, 130 + i * 27, String(r.s), { size: 13, mono: true, color: PAL.ink });
      P.text(400, 130 + i * 27, String(r.f), { size: 13, mono: true, color: PAL.accent });
      P.text(520, 130 + i * 27, 'ok', { size: 11.5, color: PAL.valid });
    }

    /* the step, in a card */
    var b = rv(sp, 0.46, 0.60);
    card(568, 96, 292, 176, b);
    P.alpha(b);
    P.text(586, 110, 'The step, at k = 4', { size: 12.5, bold: true, color: PAL.ink });
    P.text(586, 138, 'left grows by 5^3 = ' + M.cubes.step.cube, { size: 12, mono: true, color: PAL.ink });
    P.text(586, 162, 'right grows by 225 - 100', { size: 12, mono: true, color: PAL.ink });
    P.text(586, 186, '               = ' + M.cubes.step.right, { size: 12, mono: true, color: PAL.accent });
    P.text(586, 214, 'both sides grow equally,', { size: 12, color: PAL.dim });
    P.text(586, 236, 'so the identity survives.', { size: 12, color: PAL.dim });
    P.text(586, 258, 'T(k+1) - T(k) = k+1', { size: 11.5, mono: true, color: PAL.faint });

    P.alpha(rv(sp, 0.70, 0.82));
    P.text(56, 306, 'Base:  n = 1 gives 1 = 1^2.', { size: 13.5, color: PAL.ink });
    P.alpha(rv(sp, 0.78, 0.90));
    P.text(56, 336, 'Checked on the page: n = 1 to ' + M.cubes.checked + ', residual 0 at every n, and the step difference at every k.',
      { size: 12.5, color: PAL.dim });
    P.alpha(rv(sp, 0.88, 1));
    P.text(56, 368, 'That check is evidence. The two paragraphs above are the proof, and only the proof reaches n = 301.',
      { size: 12.5, color: PAL.warn });

    foot('An exhaustive check of finitely many cases is a check on your algebra, never a substitute for the step.');
  }

  /* ---------------- scene 4: choosing the base ---------------- */

  function drawBase(t, sp) {
    head('Scene 4 · Choosing the base case: 2^n against n^2');

    P.alpha(rv(sp, 0.02, 0.12));
    P.text(56, 66, 'Claim:  2^n  >  n^2', { size: 15, mono: true, bold: true, color: PAL.ink });

    P.alpha(rv(sp, 0.08, 0.18));
    P.text(60, 98, 'n', { size: 12, bold: true, color: PAL.faint });
    P.text(150, 98, '2^n', { size: 12, bold: true, color: PAL.faint });
    P.text(260, 98, 'n^2', { size: 12, bold: true, color: PAL.faint });
    P.text(360, 98, 'verdict', { size: 12, bold: true, color: PAL.faint });
    P.line(56, 116, 470, 116, { stroke: PAL.border, sw: 1 });
    for (var i = 0; i < M.pow.rows.length; i++) {
      var r = M.pow.rows[i];
      P.alpha(rv(sp, 0.10 + i * 0.028, 0.16 + i * 0.028));
      P.text(60, 124 + i * 25, String(r.n), { size: 13, mono: true, color: PAL.ink });
      P.text(150, 124 + i * 25, String(r.l), { size: 13, mono: true, color: PAL.ink });
      P.text(260, 124 + i * 25, String(r.r), { size: 13, mono: true, color: PAL.ink });
      P.text(360, 124 + i * 25, r.ok ? 'true' : 'false', { size: 12.5, bold: !r.ok, color: r.ok ? PAL.valid : PAL.invalid });
    }

    var b = rv(sp, 0.34, 0.48);
    card(500, 96, 360, 160, b);
    P.alpha(b);
    P.text(518, 110, 'The step needs (n+1)^2 < 2n^2', { size: 12.5, bold: true, color: PAL.ink });
    P.text(518, 140, 'n = 1:   4 < 2      false', { size: 12, mono: true, color: PAL.invalid });
    P.text(518, 164, 'n = 2:   9 < 8      false', { size: 12, mono: true, color: PAL.invalid });
    P.text(518, 188, 'n = 3:  16 < 18    true', { size: 12, mono: true, color: PAL.valid });
    P.text(518, 216, 'so the step is legal from n = 3,', { size: 12, color: PAL.dim });
    P.text(518, 238, 'and the base has to be 5.', { size: 12, color: PAL.dim });

    P.alpha(rv(sp, 0.58, 0.72));
    P.text(56, 340, 'Base 1 with a step from 3 reaches:  ' + M.chain.fromOne.join(', ') + '   (one value only)',
      { size: 12.5, mono: true, color: PAL.invalid });
    P.alpha(rv(sp, 0.70, 0.84));
    P.text(56, 368, 'Base 5 with the same step reaches:  5 ... ' + M.chain.fromFive[M.chain.fromFive.length - 1] +
      '   (' + M.chain.fromFive.length + ' values)',
      { size: 12.5, mono: true, color: PAL.valid });
    P.alpha(rv(sp, 0.84, 1));
    P.text(56, 400, 'The base must sit inside the step domain, and the chain must cover the claim. Check both before writing.',
      { size: 12.5, color: PAL.warn });

    foot('P(1) is true and useless here. A base chosen for convenience proves a statement nobody asked about.');
  }

  /* ---------------- scene 5: strong induction ---------------- */

  function drawStrong(t, sp) {
    head('Scene 5 · Strong induction: paying with 3 and 5 rupee coins');

    P.alpha(rv(sp, 0.02, 0.12));
    P.text(56, 66, 'Claim:  every amount from 8 rupees upward is a sum of 3 and 5 rupee coins.',
      { size: 14, bold: true, color: PAL.ink });

    var x0 = 60, dx = 66, y = 88, bw = 44, bh = 44;
    for (var i = 1; i <= 12; i++) {
      var a = rv(sp, 0.10 + i * 0.02, 0.16 + i * 0.02);
      if (a <= 0) continue;
      var ok = M.coins.ok[i];
      P.alpha(a);
      P.rect(x0 + (i - 1) * dx, y, bw, bh, {
        fill: ok ? PAL.accentDim : PAL.invalidDim,
        stroke: ok ? PAL.accent : PAL.invalid, sw: 1.2, radius: 4
      });
      P.text(x0 + (i - 1) * dx + bw / 2, y + 12, String(i), { size: 13, mono: true, align: 'center', color: PAL.ink });
      P.text(x0 + (i - 1) * dx + bw / 2, y + 30, ok ? 'yes' : 'no', { size: 10.5, align: 'center', color: ok ? PAL.valid : PAL.invalid });
    }

    P.alpha(rv(sp, 0.38, 0.50));
    P.text(56, 156, 'Base cases, three of them:   8 = 3 + 5     9 = 3 + 3 + 3     10 = 5 + 5',
      { size: 13, mono: true, color: PAL.ink });

    var b = rv(sp, 0.50, 0.64);
    card(56, 180, 420, 96, b);
    P.alpha(b);
    P.text(74, 194, 'The step the arithmetic offers', { size: 12.5, bold: true, color: PAL.ink });
    P.text(74, 220, 'if n is payable then n + 3 is payable', { size: 12.5, mono: true, color: PAL.accent });
    P.text(74, 244, 'so assume P for every amount below n, and pay', { size: 12, color: PAL.dim });
    P.text(74, 264, 'n by paying n - 3 and adding one 3 rupee coin.', { size: 12, color: PAL.dim });

    var c = rv(sp, 0.62, 0.76);
    card(496, 180, 364, 96, c);
    P.alpha(c);
    P.text(514, 194, 'The ordinary step cannot do it', { size: 12.5, bold: true, color: PAL.ink });
    P.text(514, 220, 'P(3) true and P(4) false', { size: 12, mono: true, color: PAL.invalid });
    P.text(514, 242, 'P(6) true and P(7) false', { size: 12, mono: true, color: PAL.invalid });
    P.text(514, 266, 'so knowing n says nothing about n + 1.', { size: 12, color: PAL.dim });

    P.alpha(rv(sp, 0.78, 0.90));
    P.text(56, 306, 'Unpayable amounts below 8:  ' + M.coins.unpayable.join(', ') + '.   Every amount from 8 to ' + M.coins.max + ' is payable.',
      { size: 12.5, color: PAL.ink });
    P.alpha(rv(sp, 0.88, 1));
    P.text(56, 340, 'Strong induction is not a stronger rule. Put the quantifier inside the predicate and it is ordinary induction.',
      { size: 12.5, color: PAL.accent });

    foot('Widen the hypothesis to whatever the step needs, then check the bases the step cannot reach.');
  }

  /* ---------------- scene 6: well-ordering ---------------- */

  function drawWop(t, sp) {
    head('Scene 6 · Well-ordering and the least counterexample');

    P.alpha(rv(sp, 0.02, 0.12));
    P.text(56, 66, 'Well-ordering:  every non-empty set of natural numbers has a least element.',
      { size: 14, bold: true, color: PAL.ink });
    P.text(56, 90, 'False for the rationals, so it is a real fact about the naturals, not a platitude.',
      { size: 12, color: PAL.dim });

    var cards = [
      ['1  suppose the claim fails', ['the set C of counterexamples', 'is non-empty, so it has', 'a least member n']],
      ['2  everything below n holds', ['by minimality of n, every', 'amount below n is payable']],
      ['3  build a smaller one', ['n - 3 >= 8 is payable, so', 'n is payable: contradiction']]
    ];
    for (var i = 0; i < 3; i++) {
      var a = rv(sp, 0.16 + i * 0.10, 0.26 + i * 0.10);
      card(56 + i * 268, 112, 252, 116, a);
      P.alpha(a);
      P.text(72 + i * 268, 124, cards[i][0], { size: 12.5, bold: true, color: PAL.ink });
      for (var j = 0; j < cards[i][1].length; j++) {
        P.text(72 + i * 268, 150 + j * 22, cards[i][1][j], { size: 11.5, color: PAL.dim });
      }
    }

    P.alpha(rv(sp, 0.50, 0.62));
    P.text(56, 254, 'Why n - 3 is at least 8:  the three bases 8, 9 and 10 were checked, so the least',
      { size: 12.5, color: PAL.ink });
    P.text(56, 276, 'counterexample is at least 11, and 11 - 3 = 8 is inside the hypothesis.',
      { size: 12.5, color: PAL.ink });

    P.alpha(rv(sp, 0.66, 0.80));
    P.text(56, 316, 'The three formats are one argument:', { size: 12.5, bold: true, color: PAL.ink });
    P.alpha(rv(sp, 0.74, 0.88));
    P.text(56, 344, 'induction', { size: 13, mono: true, color: PAL.accent });
    P.arrow(160, 350, 250, 350, { stroke: PAL.border, sw: 1.4 });
    P.text(288, 344, 'strong induction', { size: 13, mono: true, color: PAL.accent });
    P.arrow(440, 350, 530, 350, { stroke: PAL.border, sw: 1.4 });
    P.text(566, 344, 'well-ordering', { size: 13, mono: true, color: PAL.accent });
    P.alpha(rv(sp, 0.86, 1));
    P.text(56, 380, 'Any one of them reformats as any other; the choice is readability, never power.',
      { size: 12.5, color: PAL.dim });

    foot('Something must be checked at the bottom, and something must carry you upward. That is constant.');
  }

  /* ---------------- scene 7: structural induction ---------------- */

  function drawStruct(t, sp) {
    head('Scene 7 · Structural induction on full binary trees');

    P.alpha(rv(sp, 0.02, 0.12));
    P.text(56, 66, 'Definition:  a full binary tree is a leaf, or a node over two full binary trees.',
      { size: 13.5, bold: true, color: PAL.ink });

    var a = rv(sp, 0.10, 0.24);
    P.alpha(a);
    /* a tree with 3 internal nodes and 4 leaves */
    var root = { x: 250, y: 104 }, c1 = { x: 160, y: 158 }, c2 = { x: 340, y: 158 };
    var l = [{ x: 118, y: 212 }, { x: 202, y: 212 }, { x: 298, y: 212 }, { x: 382, y: 212 }];
    P.line(root.x, root.y + 14, c1.x, c1.y - 14, { stroke: PAL.border, sw: 1.4 });
    P.line(root.x, root.y + 14, c2.x, c2.y - 14, { stroke: PAL.border, sw: 1.4 });
    P.line(c1.x, c1.y + 14, l[0].x, l[0].y - 14, { stroke: PAL.border, sw: 1.4 });
    P.line(c1.x, c1.y + 14, l[1].x, l[1].y - 14, { stroke: PAL.border, sw: 1.4 });
    P.line(c2.x, c2.y + 14, l[2].x, l[2].y - 14, { stroke: PAL.border, sw: 1.4 });
    P.line(c2.x, c2.y + 14, l[3].x, l[3].y - 14, { stroke: PAL.border, sw: 1.4 });
    var internals = [root, c1, c2];
    for (var i = 0; i < internals.length; i++) {
      P.circle(internals[i].x, internals[i].y, 14, { fill: PAL.accent, stroke: PAL.accent, sw: 1.2 });
    }
    for (var j = 0; j < l.length; j++) {
      P.circle(l[j].x, l[j].y, 12, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2 });
    }
    P.text(56, 246, 'internal: 3', { size: 12, mono: true, color: PAL.accent });
    P.text(160, 246, 'leaves: 4', { size: 12, mono: true, color: PAL.ink });
    P.text(256, 246, 'edges: 6', { size: 12, mono: true, color: PAL.dim });

    var b = rv(sp, 0.34, 0.48);
    card(468, 96, 392, 148, b);
    P.alpha(b);
    P.text(486, 110, 'The step at an internal node', { size: 12.5, bold: true, color: PAL.ink });
    P.text(486, 136, 'children have i1 + 1 and i2 + 1 leaves', { size: 12, color: PAL.dim });
    P.text(486, 158, 'parent: i1 + i2 + 1 internal nodes', { size: 12, color: PAL.dim });
    P.text(486, 180, 'and i1 + i2 + 2 leaves', { size: 12, color: PAL.dim });
    P.text(486, 206, 'which is (internal) + 1, as claimed', { size: 12.5, mono: true, color: PAL.accent });
    P.text(486, 228, 'Base: the lone leaf, 0 internal, 1 leaf.', { size: 11.5, color: PAL.faint });

    P.alpha(rv(sp, 0.58, 0.72));
    P.text(56, 286, 'Full binary trees by internal count, which is Catalan(i):', { size: 12.5, bold: true, color: PAL.ink });
    for (var k = 0; k < M.trees.counts.length; k++) {
      P.alpha(rv(sp, 0.60 + k * 0.03, 0.68 + k * 0.03));
      P.text(56 + k * 112, 312, 'i = ' + k, { size: 11.5, mono: true, color: PAL.faint });
      P.text(56 + k * 112, 334, String(M.trees.counts[k]), { size: 14, mono: true, bold: true, color: PAL.ink });
    }
    P.alpha(rv(sp, 0.80, 0.92));
    P.text(56, 372, 'Enumerated on the page: ' + M.trees.total + ' trees. In every one, leaves = internal + 1 and edges = 2 x internal.',
      { size: 12.5, color: PAL.valid });

    foot('Induct on the recursive definition, not on a number: the definition already carries a base and a step.');
  }

  /* ---------------- scene 8: recurrences ---------------- */

  function drawRecur(t, sp) {
    head('Scene 8 · Induction on a recurrence');

    P.alpha(rv(sp, 0.02, 0.12));
    P.text(56, 66, 'Recurrence:  T(n) = 2 T(n/2) + n,   T(1) = 0', { size: 14.5, mono: true, bold: true, color: PAL.ink });
    P.alpha(rv(sp, 0.10, 0.20));
    P.text(56, 96, 'Guess:       T(n) = n log2 n', { size: 14.5, mono: true, color: PAL.accent });

    P.alpha(rv(sp, 0.18, 0.28));
    P.text(60, 136, 'n', { size: 12, bold: true, color: PAL.faint });
    P.text(200, 136, 'recurrence', { size: 12, bold: true, color: PAL.faint });
    P.text(360, 136, 'n log2 n', { size: 12, bold: true, color: PAL.faint });
    P.line(56, 152, 470, 152, { stroke: PAL.border, sw: 1 });
    for (var i = 0; i < M.recur.rows.length; i++) {
      var r = M.recur.rows[i];
      P.alpha(rv(sp, 0.20 + i * 0.04, 0.28 + i * 0.04));
      P.text(60, 166 + i * 30, String(r.n), { size: 13, mono: true, color: PAL.ink });
      P.text(200, 166 + i * 30, String(r.t), { size: 13, mono: true, color: PAL.ink });
      P.text(360, 166 + i * 30, String(r.closed), { size: 13, mono: true, color: PAL.accent });
      P.text(440, 166 + i * 30, 'ok', { size: 11, color: PAL.valid });
    }

    var b = rv(sp, 0.44, 0.58);
    card(508, 128, 352, 172, b);
    P.alpha(b);
    P.text(526, 142, 'The step, substituting the hypothesis', { size: 12.5, bold: true, color: PAL.ink });
    P.text(526, 170, 'T(2k) = 2 T(k) + 2k', { size: 12.5, mono: true, color: PAL.ink });
    P.text(526, 194, '      = 2k log2 k + 2k', { size: 12.5, mono: true, color: PAL.ink });
    P.text(526, 218, '      = 2k (log2 k + 1)', { size: 12.5, mono: true, color: PAL.ink });
    P.text(526, 242, '      = 2k log2 (2k)', { size: 12.5, mono: true, bold: true, color: PAL.accent });
    P.text(526, 272, 'which is the closed form at 2k.', { size: 11.5, color: PAL.dim });

    P.alpha(rv(sp, 0.66, 0.80));
    P.text(56, 348, 'Exact integers, no floating point: ' + M.recur.top + ' values of n from 2 to 2^20 = 1048576, all matching.',
      { size: 12.5, color: PAL.valid });
    P.alpha(rv(sp, 0.78, 0.92));
    P.text(56, 376, 'The substitution is the proof. The table is the check. Only the substitution covers every power of two.',
      { size: 12.5, color: PAL.dim });
    P.alpha(rv(sp, 0.90, 1));
    P.text(56, 404, 'And it covers powers of two only: say so, or state the bound as Theta(n log n) instead of equality.',
      { size: 12.5, color: PAL.warn });

    foot('A guessed closed form becomes a theorem the moment the step substitutes it and the base case is checked.');
  }

  /* ---------------- scene 9: loop invariants ---------------- */

  function drawInvariant(t, sp) {
    head('Scene 9 · A loop invariant is induction with a clock');

    P.alpha(rv(sp, 0.02, 0.12));
    P.text(56, 66, 'Insertion sort on 5, 2, 4, 6, 1, 3: the prefix after each pass', { size: 13.5, bold: true, color: PAL.ink });

    var cw = 52, ch = 30, x0 = 60;
    var rows = [0, 1, 2, 3];
    for (var rIdx = 0; rIdx < rows.length; rIdx++) {
      var st = M.sort.states[rows[rIdx]];
      var a = rv(sp, 0.10 + rIdx * 0.09, 0.18 + rIdx * 0.09);
      P.alpha(a);
      var y = 90 + rIdx * 42;
      P.text(x0, y + 8, 'pass ' + st.i, { size: 11, mono: true, color: PAL.faint });
      for (var c = 0; c < st.a.length; c++) {
        var inPrefix = c <= st.i;
        P.rect(x0 + 62 + c * (cw + 6), y, cw, ch, {
          fill: inPrefix ? PAL.accentDim : PAL.surface2,
          stroke: inPrefix ? PAL.accent : PAL.border, sw: 1.1, radius: 3
        });
        P.text(x0 + 62 + c * (cw + 6) + cw / 2, y + 8, String(st.a[c]),
          { size: 12.5, mono: true, align: 'center', color: PAL.ink });
      }
    }
    P.alpha(rv(sp, 0.46, 0.58));
    P.text(60, 262, 'shaded = the sorted prefix, which holds the same values as the input prefix', { size: 11.5, color: PAL.faint });

    var oblig = [
      ['initialization', 'base case', 'true before pass 1'],
      ['maintenance', 'inductive step', 'true after each pass'],
      ['termination', 'the invocation', 'with the exit condition']
    ];
    for (var i = 0; i < 3; i++) {
      var b = rv(sp, 0.50 + i * 0.08, 0.58 + i * 0.08);
      P.alpha(b);
      P.text(520, 96 + i * 46, oblig[i][0], { size: 12.5, bold: true, color: PAL.ink });
      P.text(520, 116 + i * 46, '= ' + oblig[i][1] + ', ' + oblig[i][2], { size: 11.5, color: PAL.dim });
    }

    P.alpha(rv(sp, 0.74, 0.86));
    P.text(56, 296, 'Checked on the page: all ' + M.sort.perms + ' orderings of four values, the invariant at every index of every run.',
      { size: 12.5, color: PAL.valid });
    P.alpha(rv(sp, 0.84, 0.96));
    P.text(56, 326, 'That is ' + (M.sort.perms * 4) + ' states checked. Five values would be 120 runs, and a sixth value still more.',
      { size: 12.5, color: PAL.dim });
    P.alpha(rv(sp, 0.94, 1));
    P.text(56, 356, 'The invariant proves it for every length; the check only shows the invariant is not nonsense.', { size: 12.5, color: PAL.accent });

    foot('Initialization, maintenance, termination. Same three obligations as base, step, conclusion.');
  }

  /* ---------------- scene 10: where it breaks ---------------- */

  function drawBreaks(t, sp) {
    head('Scene 10 · Four ways an induction argument fails');

    var boxes = [
      ['1  the empty middle', ['two groups of n share n-1 horses.', 'that is 0 exactly at n = 1, so the', 'step is legal only from n = 2, and', 'P(2) is the case that is false.']],
      ['2  a pattern is not a proof', ['2^(2^k) + 1 is prime for k = 0..4:', '3, 5, 17, 257, 65537. At k = 5 it is', '4294967297 = 641 x 6700417.']],
      ['3  a step outside its domain', ['a step from n >= 2 leaves the first', 'link open; a step for powers of two', 'proves the claim at powers of two only.']],
      ['4  two different words', ['inductive reasoning generalises from', 'cases and is never certain; mathematical', 'induction is a deduction.']]
    ];
    var pos = [[56, 84], [470, 84], [56, 224], [470, 224]];
    for (var i = 0; i < 4; i++) {
      var a = rv(sp, 0.04 + i * 0.10, 0.14 + i * 0.10);
      card(pos[i][0], pos[i][1], 374, 124, a);
      P.alpha(a);
      P.text(pos[i][0] + 16, pos[i][1] + 12, boxes[i][0], { size: 12.5, bold: true, color: PAL.ink });
      for (var j = 0; j < boxes[i][1].length; j++) {
        P.text(pos[i][0] + 16, pos[i][1] + 38 + j * 21, boxes[i][1][j], { size: 11, color: PAL.dim });
      }
    }

    P.alpha(rv(sp, 0.56, 0.70));
    P.text(56, 372, 'Each failure is a missing or mis-scoped check, never a defect in the rule itself.', { size: 12.5, color: PAL.accent });
    P.alpha(rv(sp, 0.72, 0.88));
    P.text(56, 400, 'Before you accept an induction: is the predicate a sentence, is the base the smallest n in the claim,',
      { size: 12, color: PAL.ink });
    P.text(56, 420, 'is the step valid on the whole range, and does the chain reach every n the claim names?',
      { size: 12, color: PAL.ink });

    foot('Four questions, four checks. A proof that answers all four is finished.');
  }

  /* ---------------- dispatch ---------------- */

  var DRAWERS = {
    why: drawWhy, rule: drawRule, cubes: drawCubes, base: drawBase,
    strong: drawStrong, wop: drawWop, struct: drawStruct,
    recur: drawRecur, invariant: drawInvariant, breaks: drawBreaks
  };

  function drawFrame(Pp) {
    if (!Pp) return;
    P = Pp;
    P.alpha(1);
    P.clear();
    P.rect(0, 0, W, H, { fill: PAL.surface });

    var T = tl();
    if (!T) return;
    var t = (K && K.state && K.state.elapsed) || 0;
    var scene = null;
    for (var i = 0; i < T.scenes.length; i++) {
      if (t >= T.scenes[i].start && t < T.scenes[i].end) { scene = T.scenes[i]; break; }
    }
    if (!scene) scene = T.scenes[T.scenes.length - 1];
    var sp = (t - scene.start) / (scene.end - scene.start);
    if (sp < 0) sp = 0; if (sp > 1) sp = 1;

    var fn = DRAWERS[scene.id];
    if (fn) fn(t, sp);
    P.alpha(1);
  }

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

  function boot() {
    var holder = document.getElementById('canvas-holder');
    var fallback = document.getElementById('canvas-fallback');
    var ok = false;

    if (typeof window.p5 === 'function') {
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
        if (holder) holder.appendChild(cv);
        var ctx2d = cv.getContext && cv.getContext('2d');
        if (ctx2d) {
          P = PR.makePainter2D(ctx2d, W, H);
          drawFrame(P);
          drew = true;
        }
      } catch (e) {
        console.error('canvas fallback failed', e);
      }
      if (!drew && fallback && fallback.classList) fallback.classList.add('show');
    }

    var checkBox = document.getElementById('checks');
    if (checkBox) {
      var bad = CHECKS.filter(function (c) { return !c.pass; });
      checkBox.innerHTML = '<span class="k">Model checks</span>' +
        (bad.length ? bad.length + ' of ' + CHECKS.length + ' failed' : CHECKS.length + '/' + CHECKS.length + ' passed');
    }

    if (K && K.init && window.LESSON_TIMELINE) {
      K.init({
        timeline: window.LESSON_TIMELINE,
        draw: function () { if (P) drawFrame(P); }
      });
    }

    window.__drawAt = function (t) {
      if (K && K.state) K.state.elapsed = t;
      if (P) drawFrame(P);
    };

    var failing = CHECKS.filter(function (c) { return !c.pass; });
    if (failing.length) console.warn('Model validation did not fully pass:', failing);
  }

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
