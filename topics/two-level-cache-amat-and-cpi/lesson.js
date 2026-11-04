/* ==========================================================================
   two-level-cache-amat-and-cpi — lesson.js
   Four layers, in order:
     1. THE MODEL      — a two-level hierarchy as a partition of one access into
                         three outcomes, the weighted average, the factored form,
                         both time conventions, both miss-rate denominators, the
                         quadratic that solving backwards produces, and the CPI
                         arithmetic. Exact rational arithmetic, not floats.
     2. THE CHECKS     — every number the captions quote is recomputed here and
                         compared with the figure the caption states.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The claim under test is one sentence: average memory access time is the
   weighted average of the three mutually exclusive outcomes of one access, and
   its factored form T1 + m1 T2 + m1 m2 T3 is that same average regrouped.
   Everything else on this page — the two time conventions, local versus global
   miss rate, the quadratic, the CPI conversion — is that sentence applied.
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

  /* ---- exact rationals. Every quoted figure is a ratio of small integers,
     so exactness is available and floats are not needed. ---- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function Fr(n, d) {
    if (d === undefined) d = 1;
    if (d < 0) { n = -n; d = -d; }
    var g = gcd(n, d) || 1;
    return { n: n / g, d: d / g };
  }
  var Z = function (n) { return Fr(n, 1); };
  function add(a, b) { return Fr(a.n * b.d + b.n * a.d, a.d * b.d); }
  function sub(a, b) { return Fr(a.n * b.d - b.n * a.d, a.d * b.d); }
  function mul(a, b) { return Fr(a.n * b.n, a.d * b.d); }
  function div(a, b) { return Fr(a.n * b.d, a.d * b.n); }
  function eq(a, b) { return a.n * b.d === b.n * a.d; }
  function val(a) { return a.n / a.d; }
  function str(a) { return a.d === 1 ? String(a.n) : (a.n + '/' + a.d); }
  function fix(a, k) { return val(a).toFixed(k === undefined ? 2 : k); }

  /* ---- one access, three outcomes ----
     A configuration states each level's OWN access time and each level's LOCAL
     miss rate. Nothing here knows about conventions; those are applied later. */
  function outcomes(c) {
    return [
      { id: 'hit1', p: sub(Z(1), c.m1), T: c.t1, label: 'L1 hit' },
      { id: 'hit2', p: mul(c.m1, sub(Z(1), c.m2)), T: add(c.t1, c.t2), label: 'L1 miss, L2 hit' },
      { id: 'miss', p: mul(c.m1, c.m2), T: add(add(c.t1, c.t2), c.t3), label: 'both miss' }
    ];
  }
  function weighted(c) {
    var o = outcomes(c), s = Z(0);
    for (var i = 0; i < o.length; i++) s = add(s, mul(o[i].p, o[i].T));
    return s;
  }
  function factored(c) { return add(add(c.t1, mul(c.m1, c.t2)), mul(mul(c.m1, c.m2), c.t3)); }
  /* the wrong form: the local L2 miss rate used where the product belongs */
  function m2Only(c) { return add(add(c.t1, mul(c.m1, c.t2)), mul(c.m2, c.t3)); }

  var CFG = { t1: Z(1), m1: Fr(1, 10), t2: Z(8), m2: Fr(1, 4), t3: Z(100) };
  var OUT = outcomes(CFG);
  var AMAT = weighted(CFG);
  var AMAT_FACT = factored(CFG);
  var AMAT_WRONG = m2Only(CFG);
  var P_SUM = add(add(OUT[0].p, OUT[1].p), OUT[2].p);
  var TERM1 = mul(OUT[0].p, OUT[0].T);
  var TERM2 = mul(OUT[1].p, OUT[1].T);
  var TERM3 = mul(OUT[2].p, OUT[2].T);

  /* ---- the two time conventions, on the GATE CSE 2025 Set 1 numbers ----
     s1, s2, s3 are the printed times. INCLUSIVE means s2 already contains the
     L1 lookup and s3 already contains both. */
  var C25 = { s1: Z(10), s2: Z(20), s3: Z(200), m1: Fr(5, 100), m2: Fr(15, 100) };
  var C25_P = [
    sub(Z(1), C25.m1),
    mul(C25.m1, sub(Z(1), C25.m2)),
    mul(C25.m1, C25.m2)
  ];
  function c25Weighted() {
    return add(add(mul(C25_P[0], C25.s1), mul(C25_P[1], C25.s2)), mul(C25_P[2], C25.s3));
  }
  function c25Increments() {
    var d2 = sub(C25.s2, C25.s1), d3 = sub(C25.s3, C25.s2);
    return add(add(C25.s1, mul(C25.m1, d2)), mul(mul(C25.m1, C25.m2), d3));
  }
  function c25Naive() {
    return add(add(C25.s1, mul(C25.m1, C25.s2)), mul(mul(C25.m1, C25.m2), C25.s3));
  }
  var A25 = c25Weighted(), A25_INC = c25Increments(), A25_BAD = c25Naive();

  /* ---- GATE CSE 2017 Set 2: solve 9x^2 + 8x - 1 = 0 for the L1 miss rate ----
     AMAT = 1 + 8x + 18 x (x/2) = 2, with m1 = x and m2 = x/2. */
  var Q_A = Z(9), Q_B = Z(8), Q_C = Z(-1);
  var DISC = sub(mul(Q_B, Q_B), mul(Z(4), mul(Q_A, Q_C)));
  var ROOT_POS = div(add(Z(-8), Z(10)), Z(18));   /* sqrt(100) = 10 */
  var ROOT_NEG = div(sub(Z(-8), Z(10)), Z(18));
  var P17B_M1 = ROOT_POS;
  var P17B_M2 = div(ROOT_POS, Z(2));
  var P17B_AMAT = add(add(Z(1), mul(Z(8), P17B_M1)), mul(mul(P17B_M1, P17B_M2), Z(18)));
  var P17B_GLOBAL = mul(P17B_M1, P17B_M2);

  /* ---- GATE CSE 2017 Set 1: counts per 1,000 instructions ---- */
  var ACC = Z(1400), L1_MISSES = mul(ACC, Fr(1, 10)), L2_MISSES = Z(7);
  var LOCAL17 = div(L2_MISSES, L1_MISSES);
  var GLOBAL17 = div(L2_MISSES, ACC);
  var PER_INSTR17 = div(L2_MISSES, Z(1000));

  /* ---- GATE CSE 2016: hierarchical against simultaneous ---- */
  var C16 = { t1: Z(1), m1: Fr(2, 10), t2: Z(10), m2: Fr(1, 10), t3: Z(500) };
  var AMAT16 = factored(C16);
  var SIM16 = add(add(mul(Fr(8, 10), Z(1)), mul(Fr(2, 10), Z(10))),
                  mul(mul(Fr(2, 10), Fr(1, 10)), Z(500)));

  /* ---- the CPI conversion ---- */
  var BASE_CPI = Z(1), ACC_PER_INSTR = Fr(14, 10);
  var EXTRA = sub(AMAT, CFG.t1);
  var STALLS = mul(ACC_PER_INSTR, EXTRA);
  var CPI = add(BASE_CPI, STALLS);
  var DECOMP_L2 = mul(mul(ACC_PER_INSTR, CFG.m1), CFG.t2);
  var DECOMP_MM = mul(mul(mul(ACC_PER_INSTR, CFG.m1), CFG.m2), CFG.t3);
  var DECOMP_SUM = add(DECOMP_L2, DECOMP_MM);

  var CFG_HALF_L1 = { t1: CFG.t1, m1: Fr(1, 20), t2: CFG.t2, m2: CFG.m2, t3: CFG.t3 };
  var CFG_HALF_L2 = { t1: CFG.t1, m1: CFG.m1, t2: CFG.t2, m2: Fr(1, 8), t3: CFG.t3 };
  var AMAT_H1 = factored(CFG_HALF_L1), AMAT_H2 = factored(CFG_HALF_L2);
  var STALL_H1 = mul(ACC_PER_INSTR, sub(AMAT_H1, CFG.t1));
  var STALL_H2 = mul(ACC_PER_INSTR, sub(AMAT_H2, CFG.t1));
  var CPI_H1 = add(BASE_CPI, STALL_H1), CPI_H2 = add(BASE_CPI, STALL_H2);
  var SPEED_H1 = div(CPI, CPI_H1), SPEED_H2 = div(CPI, CPI_H2);
  var PERFECT_SPEEDUP = div(CPI, BASE_CPI);
  var TIME_CUT_H1 = sub(Z(1), div(CPI_H1, CPI));

  /* ---- the four traps, as numbers ---- */
  var TRAPS = [
    { name: 'm2 where m1 m2 belongs', right: fix(AMAT, 1) + ' cycles', wrong: fix(AMAT_WRONG, 1) + ' cycles' },
    { name: 'inclusive time added again', right: fix(A25, 2) + ' ns', wrong: fix(A25_BAD, 2) + ' ns' },
    { name: 'global rate quoted as local', right: fix(LOCAL17, 2), wrong: fix(GLOBAL17, 3) },
    { name: 'per access used as per instruction', right: fix(AMAT, 1) + ' cycles', wrong: fix(mul(ACC_PER_INSTR, AMAT), 2) + ' cycles' }
  ];

  /* ---- a sweep over random configurations, for the identity checks ---- */
  var SWEEP = (function () {
    var worstPartition = 0, worstIdentity = 0, worstMonotone = 0, badGlobal = 0, n = 500;
    var seed = 12345;
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    for (var k = 0; k < n; k++) {
      var c = {
        t1: Fr(Math.max(1, Math.round(rnd() * 4)), 1),
        m1: Fr(Math.max(1, Math.round(rnd() * 40)), 100),
        t2: Fr(Math.max(1, Math.round(rnd() * 30)), 1),
        m2: Fr(Math.max(1, Math.round(rnd() * 60)), 100),
        t3: Fr(Math.max(1, Math.round(rnd() * 400)), 1)
      };
      var o = outcomes(c), s = Z(0), w = Z(0);
      for (var i = 0; i < o.length; i++) { s = add(s, o[i].p); w = add(w, mul(o[i].p, o[i].T)); }
      var dp = Math.abs(val(s) - 1);
      if (dp > worstPartition) worstPartition = dp;
      var di = Math.abs(val(w) - val(factored(c)));
      if (di > worstIdentity) worstIdentity = di;
      /* monotone: raising m1 never lowers the average */
      var hi = { t1: c.t1, m1: add(c.m1, Fr(1, 100)), t2: c.t2, m2: c.m2, t3: c.t3 };
      if (val(factored(hi)) < val(factored(c)) - 1e-12) worstMonotone = 1;
      /* global never exceeds local */
      if (val(mul(c.m1, c.m2)) > val(c.m2) + 1e-12) badGlobal++;
    }
    return { n: n, partition: worstPartition, identity: worstIdentity, monotone: worstMonotone, global: badGlobal };
  })();

  /* ---- a counterexample search: does the m2-only form ever agree? ----
     It agrees only when m1 = 1, that is when L1 never hits. */
  var M2ONLY_AGREE = (function () {
    var agree = 0, tested = 0;
    for (var m1 = 1; m1 <= 20; m1++) {
      for (var m2 = 1; m2 <= 20; m2++) {
        tested++;
        var c = { t1: Z(1), m1: Fr(m1, 20), m2: Fr(m2, 20), t2: Z(8), t3: Z(100) };
        if (eq(factored(c), m2Only(c))) agree++;
      }
    }
    return { agree: agree, tested: tested };
  })();

  /* ---- a counterexample for the inclusive-time trap: how big can the gap be? ---- */
  var INCLUSIVE_GAP = (function () {
    var worst = 0, at = null, identityViolations = 0, n = 0;
    for (var m1 = 1; m1 <= 30; m1++) {
      for (var m2 = 1; m2 <= 30; m2++) {
        n++;
        var p1 = sub(Z(1), Fr(m1, 100)), p2 = mul(Fr(m1, 100), sub(Z(1), Fr(m2, 100))), p3 = mul(Fr(m1, 100), Fr(m2, 100));
        var s1 = Z(10), s2 = Z(20), s3 = Z(200);
        var q = Fr(m1, 100);
        var ok = add(add(mul(p1, s1), mul(p2, s2)), mul(p3, s3));
        /* the naive reading: the inclusive times added along the path */
        var bad = add(add(s1, mul(q, s2)), mul(p3, s3));
        var g = Math.abs(val(ok) - val(bad));
        /* the gap has a closed form: m1 (s1 + m2 s2) */
        var closed = val(mul(Fr(m1, 100), add(s1, mul(Fr(m2, 100), s2))));
        if (Math.abs(g - closed) > 1e-12) identityViolations++;
        if (g > worst) { worst = g; at = { m1: m1, m2: m2, ok: val(ok), bad: val(bad) }; }
      }
    }
    return { worst: worst, at: at, n: n, identityViolations: identityViolations };
  })();
  /* the gap on the GATE CSE 2025 Set 1 numbers, exactly */
  var GAP25 = sub(A25_BAD, A25);

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

  var CHECKS = [];
  function check(name, pass, detail) {
    CHECKS.push({ name: name, pass: !!pass, detail: detail || '' });
  }

  check('the three outcomes are exhaustive: their probabilities sum to exactly 1',
    eq(P_SUM, Z(1)), str(P_SUM));
  check('demo configuration: the average is exactly 4.3 cycles, both ways',
    eq(AMAT, Fr(43, 10)) && eq(AMAT_FACT, Fr(43, 10)), str(AMAT) + ' / ' + str(AMAT_FACT));
  check('demo configuration: the three weighted terms are 9/10, 27/40 and 109/40',
    eq(TERM1, Fr(9, 10)) && eq(TERM2, Fr(27, 40)) && eq(TERM3, Fr(109, 40)),
    str(TERM1) + ' ' + str(TERM2) + ' ' + str(TERM3));
  check('the weighted terms add to the factored form, not to a different number',
    eq(add(add(TERM1, TERM2), TERM3), AMAT_FACT), str(add(add(TERM1, TERM2), TERM3)));
  check('the m2-only form gives 26.8 cycles on the same configuration',
    eq(AMAT_WRONG, Fr(134, 5)), str(AMAT_WRONG));

  check('sweep of 500 random configurations: probabilities sum to 1 every time',
    SWEEP.partition < 1e-12, 'worst=' + SWEEP.partition.toExponential(2));
  check('sweep of 500 random configurations: weighted average equals the factored form',
    SWEEP.identity < 1e-9, 'worst=' + SWEEP.identity.toExponential(2));
  check('sweep of 500 random configurations: raising m1 never lowers the average',
    SWEEP.monotone === 0, 'violations=' + SWEEP.monotone);
  check('sweep of 500 random configurations: the global miss rate never exceeds the local one',
    SWEEP.global === 0, 'violations=' + SWEEP.global);

  check('the m2-only form agrees with the true average only when m1 = 1 (L1 never hits)',
    M2ONLY_AGREE.agree === 20 && M2ONLY_AGREE.tested === 400,
    M2ONLY_AGREE.agree + ' of ' + M2ONLY_AGREE.tested);

  check('GATE 2025 Set 1: the three outcome probabilities are 0.95, 0.0425 and 0.0075',
    eq(C25_P[0], Fr(95, 100)) && eq(C25_P[1], Fr(425, 10000)) && eq(C25_P[2], Fr(75, 10000)),
    str(C25_P[0]) + ' ' + str(C25_P[1]) + ' ' + str(C25_P[2]));
  check('GATE 2025 Set 1: weighting the inclusive times gives 11.85 ns',
    eq(A25, Fr(237, 20)), str(A25));
  check('GATE 2025 Set 1: differencing into increments gives the same 11.85 ns',
    eq(A25_INC, A25), str(A25_INC));
  check('GATE 2025 Set 1: adding the inclusive times again gives 12.5 ns, not 11.85',
    eq(A25_BAD, Fr(25, 2)) && !eq(A25_BAD, A25), str(A25_BAD));

  check('GATE 2017 Set 2: the discriminant of 9x^2 + 8x - 1 is 100',
    eq(DISC, Z(100)), str(DISC));
  check('GATE 2017 Set 2: the roots are exactly 1/9 and -1',
    eq(ROOT_POS, Fr(1, 9)) && eq(ROOT_NEG, Z(-1)), str(ROOT_POS) + ' ' + str(ROOT_NEG));
  check('GATE 2017 Set 2: m1 = 1/9 and m2 = 1/18 reproduce the average of exactly 2 cycles',
    eq(P17B_AMAT, Z(2)), str(P17B_AMAT));
  check('GATE 2017 Set 2: the negative root is not a rate',
    val(ROOT_NEG) < 0, str(ROOT_NEG));

  check('GATE 2017 Set 1: 1,400 accesses give 140 L1 misses and 7 L2 misses',
    eq(ACC, Z(1400)) && eq(L1_MISSES, Z(140)) && eq(L2_MISSES, Z(7)),
    str(ACC) + ' ' + str(L1_MISSES) + ' ' + str(L2_MISSES));
  check('GATE 2017 Set 1: the local miss rate of L2 is exactly 0.05',
    eq(LOCAL17, Fr(1, 20)), str(LOCAL17));
  check('GATE 2017 Set 1: the global miss rate is 0.005 and the per-instruction count is 0.007',
    eq(GLOBAL17, Fr(1, 200)) && eq(PER_INSTR17, Fr(7, 1000)), str(GLOBAL17) + ' ' + str(PER_INSTR17));
  check('the global miss rate equals m1 times the local miss rate',
    eq(GLOBAL17, mul(Fr(1, 10), LOCAL17)), str(mul(Fr(1, 10), LOCAL17)));

  check('GATE 2016: the hierarchical reading gives exactly 13.0 ns',
    eq(AMAT16, Z(13)), str(AMAT16));
  check('GATE 2016: the simultaneous reading gives 12.8 ns',
    eq(SIM16, Fr(64, 5)), str(SIM16));
  check('GATE 2016: the two conventions differ by 0.2 ns, and both are options',
    eq(sub(AMAT16, SIM16), Fr(1, 5)), str(sub(AMAT16, SIM16)));

  check('CPI: 1.4 accesses per instruction waste 4.62 cycles beyond the base',
    eq(STALLS, Fr(231, 50)), str(STALLS));
  check('CPI: the stall cycles split by level and add back exactly',
    eq(DECOMP_SUM, STALLS), str(DECOMP_L2) + ' + ' + str(DECOMP_MM));
  check('CPI: base 1.0 plus 4.62 is 5.62',
    eq(CPI, Fr(281, 50)), str(CPI));
  check('CPI: a perfect cache would be 5.62 times faster, the ceiling',
    eq(PERFECT_SPEEDUP, CPI), str(PERFECT_SPEEDUP));

  check('halving m1 gives an average of 2.65 cycles and a CPI of 3.31',
    eq(AMAT_H1, Fr(53, 20)) && eq(CPI_H1, Fr(331, 100)), str(AMAT_H1) + ' ' + str(CPI_H1));
  check('halving m2 gives an average of 3.05 cycles and a CPI of 3.87',
    eq(AMAT_H2, Fr(61, 20)) && eq(CPI_H2, Fr(387, 100)), str(AMAT_H2) + ' ' + str(CPI_H2));
  check('halving the L1 miss rate beats halving the L2 local miss rate: 1.70 against 1.45',
    val(SPEED_H1) > val(SPEED_H2) && Math.abs(val(SPEED_H1) - 1.70) < 0.005 &&
    Math.abs(val(SPEED_H2) - 1.45) < 0.005,
    fix(SPEED_H1, 3) + ' vs ' + fix(SPEED_H2, 3));
  check('halving the L1 miss rate cuts execution time by 41 per cent, not 50',
    Math.abs(val(TIME_CUT_H1) - 0.411) < 0.002, fix(TIME_CUT_H1, 3));

  check('the inclusive-time gap on the GATE 2025 Set 1 numbers is exactly 0.65 ns',
    eq(GAP25, Fr(13, 20)), str(GAP25));
  check('the gap has the closed form m1 (s1 + m2 s2) on all 900 swept configurations',
    INCLUSIVE_GAP.identityViolations === 0 && INCLUSIVE_GAP.n === 900,
    INCLUSIVE_GAP.identityViolations + ' of ' + INCLUSIVE_GAP.n);
  check('with a 30 per cent L1 miss rate and a 10 ns L1 time the gap reaches 4.8 ns',
    Math.abs(INCLUSIVE_GAP.worst - 4.8) < 1e-9, 'worst=' + INCLUSIVE_GAP.worst.toFixed(2) + ' ns');

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

  function cell(x, y, w, h, label, o) {
    o = o || {};
    P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1.2, radius: 5 });
    P.text(x + w / 2, y + h / 2, label, {
      size: o.size || 12, mono: o.mono !== false, bold: !!o.bold, align: 'center', base: 'middle',
      color: o.color || INK
    });
  }

  function card(x, y, w, h, o) {
    o = o || {};
    P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1, radius: 6 });
  }

  var SCENE_DRAW = {};

  /* ---- 1. the partition ---- */
  SCENE_DRAW.partition = function (t, sc, p) {
    head('Three levels, three outcomes',
      'T1 = 1, m1 = 0.10, T2 = 8, m2 = 0.25, T3 = 100 cycles; m2 is L2 local');

    var lv = [
      ['L1', '1 cycle'],
      ['L2', '8 cycles'],
      ['main memory', '100 cycles']
    ];
    for (var i = 0; i < 3; i++) {
      var y = 76 + i * 68;
      card(32, y, 236, 50, { fill: i === 0 ? ACCDIM : SURF2, stroke: i === 0 ? ACC : BORDER });
      P.text(48, y + 20, lv[i][0], { size: 13, bold: true, color: i === 0 ? ACC : INK });
      P.text(48, y + 38, lv[i][1], { size: 11, mono: true, color: DIM });
      if (i < 2) {
        P.arrow(150, y + 50, 150, y + 68, { color: FAINT, sw: 1.2 });
        P.text(160, y + 63, 'only on a miss', { size: 9.5, color: FAINT });
      }
    }

    var rows = [
      ['L1 hit', 'p = 1 - m1 = 0.90', 'cost 1'],
      ['L1 miss, L2 hit', 'p = 0.10 x 0.75 = 0.075', 'cost 1 + 8 = 9'],
      ['miss in both', 'p = 0.10 x 0.25 = 0.025', 'cost 1 + 8 + 100 = 109']
    ];
    var appear = [0.12, 0.40, 0.68];
    for (var j = 0; j < 3; j++) {
      if (p < appear[j]) continue;
      var yy = 76 + j * 68;
      card(292, yy, 576, 50, { fill: SURF, stroke: j === 2 ? WARN : BORDER });
      P.text(308, yy + 20, rows[j][0], { size: 12, bold: true, color: j === 2 ? WARN : INK });
      P.text(308, yy + 38, rows[j][1], { size: 10.5, mono: true, color: DIM });
      P.text(600, yy + 30, rows[j][2], { size: 11, mono: true, color: INK });
    }

    if (p > 0.88) {
      P.text(32, 306, '0.90 + 0.075 + 0.025 = 1.000 exactly', { size: 12, mono: true, bold: true, color: VAL });
      chip(32, 324, 'the three cases exhaust every access', true);
      chip(340, 324, 'and they cannot overlap', true);
    }
    if (p > 0.55) {
      wrap(32, 366, 'If the three probabilities do not add to one, an outcome has been dropped or counted twice.', 820,
        { size: 11.5, color: INK, maxLines: 2 });
    }
  };

  /* ---- 2. the weighted average ---- */
  SCENE_DRAW.amat = function (t, sc, p) {
    head('The weighted average, and the same sum regrouped',
      'every figure below is computed from the configuration, exactly');

    if (p > 0.05) {
      P.text(32, 84, 'AMAT = 0.90(1) + 0.075(9) + 0.025(109)', { size: 13, mono: true, color: INK });
      P.text(560, 84, '= 4.3 cycles', { size: 13, mono: true, bold: true, color: VAL });
    }
    if (p > 0.30) {
      P.text(32, 114, '     = 1 + 0.10(8) + 0.10(0.25)(100)', { size: 13, mono: true, color: DIM });
      P.text(560, 114, '= 4.3 cycles', { size: 13, mono: true, bold: true, color: VAL });
    }
    if (p > 0.55) {
      P.text(32, 144, '     = 1 + 0.8 + 2.5', { size: 13, mono: true, color: DIM });
      P.text(560, 144, '= 4.3 cycles', { size: 13, mono: true, bold: true, color: VAL });
    }

    /* contribution bar: where the 4.3 cycles go */
    if (p > 0.62) {
      var total = 4.3, scale = 700 / total;
      var segs = [
        [val(TERM1), 'L1 hit  0.90', ACC],
        [val(TERM2), 'L2 lookups  0.675', INFO],
        [val(TERM3), 'main memory  2.725', WARN]
      ];
      var x = 32;
      P.text(32, 176, 'where the 4.3 cycles go', { size: 10.5, mono: true, color: FAINT });
      for (var i = 0; i < 3; i++) {
        var w = segs[i][0] * scale;
        P.rect(x, 186, w, 30, { fill: segs[i][2], stroke: segs[i][2], sw: 1, radius: 3 });
        P.text(x + 6, 201, segs[i][0].toFixed(3), { size: 10, mono: true, color: '#ffffff', base: 'middle' });
        x += w;
      }
      var xl = 32;
      for (var k = 0; k < 3; k++) {
        P.text(xl, 232, segs[k][1], { size: 10, mono: true, color: DIM });
        xl += segs[k][0] * scale;
      }
    }

    if (p > 0.72) {
      card(32, 258, 576, 96, { fill: BADDIM, stroke: BAD });
      P.text(48, 276, 'the wrong form, on the same numbers', { size: 11, mono: true, color: BAD });
      P.text(48, 300, 'T1 + m1 T2 + m2 T3 = 1 + 0.8 + 25 = 26.8 cycles', { size: 12, mono: true, color: INK });
      wrap(48, 320, '0.25 is the fraction of L2 accesses that miss, not the fraction of all accesses that reach main memory.', 540,
        { size: 10.5, color: DIM, maxLines: 2 });
    }
    if (p > 0.9) {
      chip(32, 380, 'the product m1 m2 is the probability of reaching main memory', true);
    }
  };

  /* ---- 3. which time is given ---- */
  SCENE_DRAW.convention = function (t, sc, p) {
    head('Which time does the question give?',
      'GATE CSE 2025 Set 1: 0.95 at 10 ns, 0.85 at 20 ns, 200 ns for main memory');

    if (p > 0.05) {
      card(32, 70, 410, 132, { fill: SURF, stroke: BORDER });
      P.text(48, 88, 'own access time (add along the path)', { size: 11, mono: true, bold: true, color: ACC });
      P.text(48, 112, 'T2 is the L2 lookup alone', { size: 11, color: INK });
      P.text(48, 132, 'path costs  T1, T1+T2, T1+T2+T3', { size: 10.5, mono: true, color: DIM });
      P.text(48, 152, 'weight the path costs', { size: 11, color: INK });
      P.text(48, 176, 'GATE 2016 and 2017 Set 2 print these', { size: 10, mono: true, color: FAINT });
    }
    if (p > 0.35) {
      card(458, 70, 410, 132, { fill: SURF, stroke: BORDER });
      P.text(474, 88, 'inclusive time (difference first)', { size: 11, mono: true, bold: true, color: INFO });
      P.text(474, 112, '20 ns already contains the L1 lookup', { size: 11, color: INK });
      P.text(474, 132, 'increments  10, 20-10, 200-20', { size: 10.5, mono: true, color: DIM });
      P.text(474, 152, 'weight the increments', { size: 11, color: INK });
      P.text(474, 176, 'GATE 2025 Set 1 prints these', { size: 10, mono: true, color: FAINT });
    }
    if (p > 0.5) {
      P.text(32, 224, 'path cost     10        20        200', { size: 11, mono: true, color: INK });
      P.text(32, 244, 'increment     10        10        180', { size: 11, mono: true, color: DIM });
      P.text(32, 264, 'probability   0.95      0.0425    0.0075', { size: 11, mono: true, color: DIM });
    }
    if (p > 0.66) {
      P.text(32, 302, '0.95(10) + 0.0425(20) + 0.0075(200) = 11.85 ns', { size: 12, mono: true, bold: true, color: VAL });
      P.text(32, 326, '10 + 0.05(10) + 0.0075(180) = 11.85 ns', { size: 12, mono: true, color: VAL });
    }
    if (p > 0.82) {
      P.text(32, 356, '10 + 0.05(20) + 0.0075(200) = 12.5 ns', { size: 12, mono: true, color: BAD });
      P.text(430, 356, 'the L1 lookup is charged twice', { size: 10.5, color: DIM });
      chip(32, 378, 'published key: 11.83 to 11.87 ns', true);
    }
  };

  /* ---- 4. local and global miss rate ---- */
  SCENE_DRAW.localglobal = function (t, sc, p) {
    head('Local and global miss rate',
      'GATE CSE 2017 Set 1: 1.4 memory accesses per instruction, L1 miss rate 0.1');

    var boxes = [
      ['1,000 instructions', SURF2, BORDER],
      ['1,400 accesses', SURF2, BORDER],
      ['140 L1 misses', WARNDIM, WARN],
      ['7 L2 misses', BADDIM, BAD]
    ];
    for (var i = 0; i < 4; i++) {
      if (p < 0.06 + i * 0.13) break;
      var x = 32 + i * 212;
      cell(x, 74, 190, 50, boxes[i][0], { fill: boxes[i][1], stroke: boxes[i][2], size: 11.5 });
      if (i < 3) {
        P.arrow(x + 192, 99, x + 210, 99, { color: FAINT, sw: 1.2 });
      }
    }
    if (p > 0.34) {
      P.text(32, 146, 'x 1.4', { size: 10, mono: true, color: FAINT });
      P.text(246, 146, 'x 0.10', { size: 10, mono: true, color: FAINT });
      P.text(458, 146, '7 of 140', { size: 10, mono: true, color: FAINT });
    }
    if (p > 0.46) {
      P.text(32, 186, 'local miss rate of L2   = 7 / 140  = 0.05', { size: 12, mono: true, color: VAL });
      P.text(32, 210, 'global miss rate of L2  = 7 / 1400 = 0.005', { size: 12, mono: true, color: INFO });
      P.text(32, 234, 'misses per instruction  = 7 / 1000 = 0.007', { size: 12, mono: true, color: DIM });
    }
    if (p > 0.62) {
      card(32, 258, 540, 60, { fill: ACCDIM, stroke: ACC });
      P.text(48, 278, 'global = m1 x local = 0.10 x 0.05 = 0.005', { size: 12, mono: true, color: ACC });
      P.text(48, 300, 'one factor apart, so the denominator decides the answer', { size: 10.5, color: INK });
    }
    if (p > 0.8) {
      chip(32, 336, 'the question asks for the local rate: 0.05', true);
      chip(32, 364, '0.007 is a count per instruction, not a rate', false);
    }
  };

  /* ---- 5. solving backwards ---- */
  SCENE_DRAW.backwards = function (t, sc, p) {
    head('Solving backwards for both miss rates',
      'GATE CSE 2017 Set 2: 1 and 8 cycles, main memory penalty 18, average 2 cycles');

    if (p > 0.05) {
      P.text(32, 78, '1 + 8x + 18 (x)(x/2) = 2      with m1 = x and m2 = x/2', { size: 12, mono: true, color: INK });
    }
    if (p > 0.25) {
      P.text(32, 106, '9x^2 + 8x - 1 = 0            discriminant 64 + 36 = 100', { size: 12, mono: true, color: INK });
    }

    /* the number line */
    if (p > 0.42) {
      var x0 = 90, x1 = 700, lo = -1.25, hi = 0.45;
      function map(v) { return x0 + (v - lo) / (hi - lo) * (x1 - x0); }
      var ly = 168;
      P.line(x0, ly, x1, ly, { color: BORDER, sw: 1.4 });
      P.line(map(0), ly - 8, map(0), ly + 8, { color: FAINT, sw: 1.2 });
      P.text(map(0) - 4, ly + 18, '0', { size: 10, mono: true, color: FAINT });
      /* negative root */
      P.circle(map(-1), ly, 5, { fill: BADDIM, stroke: BAD, sw: 1.4 });
      P.text(map(-1) - 24, ly - 22, 'x = -1', { size: 11, mono: true, color: BAD });
      P.text(map(-1) - 40, ly + 18, 'not a rate: reject', { size: 10, color: BAD });
      /* positive root */
      P.circle(map(1 / 9), ly, 5, { fill: '#e7f5ea', stroke: VAL, sw: 1.4 });
      P.text(map(1 / 9) - 40, ly - 22, 'x = 1/9 = 0.111', { size: 11, mono: true, color: VAL });
      P.text(map(1 / 9) - 30, ly + 40, 'the L1 miss rate', { size: 10, color: VAL });
    }

    if (p > 0.58) {
      P.text(32, 234, 'check:  1 + 8/9 + 1/9 = 2.0 cycles exactly', { size: 12, mono: true, color: INK });
    }
    if (p > 0.72) {
      P.text(32, 268, 'm1 = 0.111        m2 = m1/2 = 0.056', { size: 12, mono: true, bold: true, color: VAL });
      P.text(32, 292, 'global miss rate of L2 = 1/9 x 1/18 = 1/162 = 0.0062', { size: 11, mono: true, color: DIM });
    }
    if (p > 0.86) {
      chip(32, 322, 'a probability cannot be negative: that sentence is the answer', true);
      P.text(32, 360, 'the quadratic appears because m1 and m2 are tied to each other', { size: 10.5, color: DIM });
    }
  };

  /* ---- 6. hierarchical and simultaneous ---- */
  SCENE_DRAW.simultaneous = function (t, sc, p) {
    head('Two hardware conventions, one data set',
      'GATE CSE 2016: 1 ns at 0.8, 10 ns at 0.9, 500 ns for main memory');

    if (p > 0.05) {
      card(32, 70, 410, 130, { fill: SURF, stroke: ACC });
      P.text(48, 88, 'hierarchical: levels tried in turn', { size: 11, mono: true, bold: true, color: ACC });
      P.text(48, 114, '1 + 0.2(10) + 0.2(0.1)(500)', { size: 12, mono: true, color: INK });
      P.text(48, 138, '= 1 + 2 + 10', { size: 12, mono: true, color: DIM });
      P.text(48, 168, '13.0 ns', { size: 17, mono: true, bold: true, color: VAL });
      P.text(48, 190, 'every level on the path is charged', { size: 10, color: DIM });
    }
    if (p > 0.35) {
      card(458, 70, 410, 130, { fill: SURF, stroke: BORDER });
      P.text(474, 88, 'simultaneous: levels start together', { size: 11, mono: true, bold: true, color: INFO });
      P.text(474, 114, '0.8(1) + 0.2(10) + 0.02(500)', { size: 12, mono: true, color: INK });
      P.text(474, 138, '= 0.8 + 2 + 10', { size: 12, mono: true, color: DIM });
      P.text(474, 168, '12.8 ns', { size: 17, mono: true, bold: true, color: INFO });
      P.text(474, 190, 'an L1 hit never pays for L2', { size: 10, color: DIM });
    }
    if (p > 0.55) {
      P.text(32, 226, 'the options on that paper', { size: 10.5, mono: true, color: FAINT });
      cell(32, 238, 96, 34, '13.0', { fill: '#e7f5ea', stroke: VAL, bold: true, color: VAL });
      cell(140, 238, 96, 34, '12.8', { fill: SURF2, stroke: BORDER });
      cell(248, 238, 96, 34, '12.6', { fill: SURF2, stroke: BORDER });
      cell(356, 238, 96, 34, '12.4', { fill: SURF2, stroke: BORDER });
      P.text(470, 256, 'the key is 13.0: the hierarchy is hierarchical', { size: 11, color: INK });
    }
    if (p > 0.75) {
      wrap(32, 296, 'The difference is 0.2 ns and both numbers are offered, so the convention is the question. Read the sentence that describes the hardware, not the table of times.', 820,
        { size: 11.5, color: INK, maxLines: 2 });
      chip(32, 348, 'when nothing is said, hierarchical is the default', true);
    }
  };

  /* ---- 7. AMAT to CPI ---- */
  SCENE_DRAW.cpi = function (t, sc, p) {
    head('From a per-access cost to a per-instruction cost',
      'base CPI 1.0, 1.4 memory accesses per instruction');

    if (p > 0.05) {
      P.text(32, 74, 'the CPI, split into what the base pays and what the misses add', { size: 10.5, mono: true, color: FAINT });
      var total = 5.62, scale = 760 / total;
      var segs = [
        [1.0, 'base 1.00', ACC],
        [1.12, 'L2 1.12', INFO],
        [3.5, 'main memory 3.50', WARN]
      ];
      var x = 32;
      for (var i = 0; i < 3; i++) {
        var w = segs[i][0] * scale;
        P.rect(x, 86, w, 34, { fill: segs[i][2], stroke: segs[i][2], sw: 1, radius: 3 });
        if (w > 90) P.text(x + 6, 103, segs[i][1], { size: 10, mono: true, color: '#ffffff', base: 'middle' });
        x += w;
      }
      var xl = 32;
      for (var k = 0; k < 3; k++) {
        if (segs[k][0] * scale <= 90) {
          P.text(xl, 136, segs[k][1], { size: 10, mono: true, color: DIM });
        }
        xl += segs[k][0] * scale;
      }
      P.text(700, 136, 'CPI 5.62', { size: 12, mono: true, bold: true, color: INK });
    }
    if (p > 0.32) {
      P.text(32, 176, 'AMAT 4.3 cycles, hit time 1 cycle, so 3.3 cycles are wasted per access', { size: 11.5, mono: true, color: INK });
    }
    if (p > 0.5) {
      P.text(32, 206, 'stalls per instruction = 1.4 x 3.3 = 4.62 cycles', { size: 12, mono: true, color: INK });
      P.text(32, 230, 'CPI = 1.0 + 4.62 = 5.62', { size: 12, mono: true, bold: true, color: VAL });
    }
    if (p > 0.66) {
      P.text(32, 262, 'the same 4.62 by level: 1.4 x 0.10 x 8 = 1.12  and  1.4 x 0.025 x 100 = 3.50', { size: 11, mono: true, color: DIM });
    }
    if (p > 0.8) {
      card(32, 286, 640, 70, { fill: WARNDIM, stroke: WARN });
      P.text(48, 304, 'the assumption, stated', { size: 10.5, mono: true, color: WARN });
      wrap(48, 324, 'The base CPI already pays one cycle for the access, so the extra cost is AMAT minus T1. Charging the full 4.3 again would count the L1 lookup twice.', 600,
        { size: 10.5, color: INK, maxLines: 2 });
      chip(32, 374, 'a perfect cache would give 5.62x: that is the ceiling', true);
    }
  };

  /* ---- 8. which level ---- */
  SCENE_DRAW.speedup = function (t, sc, p) {
    head('Which upgrade is worth more?', 'two changes of the same relative size, priced by the same arithmetic');

    var cols = [32, 300, 430, 550, 680];
    var hdr = ['configuration', 'AMAT', 'stalls', 'CPI', 'speedup'];
    P.text(cols[0], 78, hdr[0], { size: 10.5, mono: true, color: FAINT });
    for (var c = 1; c < 5; c++) P.text(cols[c], 78, hdr[c], { size: 10.5, mono: true, color: FAINT });

    var rows = [
      ['baseline: m1 0.10, m2 0.25', '4.30', '4.62', '5.62', '1.00x', SURF, BORDER, INK],
      ['halve the L1 miss rate', '2.65', '2.31', '3.31', '1.70x', '#e7f5ea', VAL, VAL],
      ['halve the L2 local miss rate', '3.05', '2.87', '3.87', '1.45x', SURF2, BORDER, INK]
    ];
    var appear = [0.08, 0.36, 0.62];
    for (var r = 0; r < 3; r++) {
      if (p < appear[r]) continue;
      var y = 92 + r * 42;
      card(32, y, 836, 34, { fill: rows[r][5], stroke: rows[r][6], sw: r === 1 ? 1.6 : 1 });
      P.text(cols[0] + 10, y + 21, rows[r][0], { size: 11, color: rows[r][7], bold: r === 1 });
      for (var q = 1; q < 5; q++) {
        P.text(cols[q], y + 21, rows[r][q], { size: 11.5, mono: true, color: rows[r][7], bold: q === 4 && r === 1 });
      }
    }
    if (p > 0.72) {
      P.text(32, 240, 'T2 is multiplied by m1 and T3 by m1 m2, so lowering m1 shrinks both lower terms', { size: 11.5, color: INK });
      P.text(32, 264, 'lowering m2 shrinks only the last one', { size: 11.5, color: INK });
    }
    if (p > 0.85) {
      P.text(32, 300, 'a perfect cache would still pay the base CPI, so time falls by 41 per cent, not 50', { size: 11.5, mono: true, color: DIM });
      chip(32, 330, 'tune the hierarchy from the inside out', true);
    }
  };

  /* ---- 9. the traps ---- */
  SCENE_DRAW.traps = function (t, sc, p) {
    head('Four traps, each with its number', 'the configuration used throughout this lesson, plus the two papers quoted');

    var appear = [0.05, 0.28, 0.50, 0.72];
    for (var i = 0; i < TRAPS.length; i++) {
      if (p < appear[i]) continue;
      var y = 72 + i * 70;
      card(32, y, 836, 56, { fill: SURF, stroke: BORDER });
      P.rect(32, y, 4, 56, { fill: WARN, stroke: WARN, sw: 0, radius: 2 });
      P.text(52, y + 22, 'trap ' + (i + 1) + ': ' + TRAPS[i].name, { size: 11.5, bold: true, color: INK });
      P.text(52, y + 42, 'wrong ' + TRAPS[i].wrong + '   against   right ' + TRAPS[i].right, { size: 10.5, mono: true, color: DIM });
    }
    if (p > 0.9) {
      chip(32, 372, 'every wrong option on these questions is one of these four substitutions', true);
    }
  };

  /* ---- 10. how GATE asks it ---- */
  SCENE_DRAW.exam = function (t, sc, p) {
    head('How GATE asks it', 'four previous-year questions, one procedure');

    var qs = [
      ['GATE CSE 2016', 'two hit rates, average access time', '13.0 ns (hierarchical)'],
      ['GATE CSE 2017 Set 1', 'counts per 1000 instructions', 'local miss rate 0.05'],
      ['GATE CSE 2017 Set 2', 'average given, both rates unknown', '0.111 and 0.056'],
      ['GATE CSE 2025 Set 1', 'inclusive times, nanoseconds', '11.85 ns']
    ];
    for (var i = 0; i < 4; i++) {
      if (p < 0.05 + i * 0.1) continue;
      var x = 32 + (i % 2) * 426, y = 70 + Math.floor(i / 2) * 86;
      card(x, y, 410, 74, { fill: SURF, stroke: BORDER });
      P.text(x + 16, y + 20, qs[i][0], { size: 11, mono: true, bold: true, color: ACC });
      P.text(x + 16, y + 40, qs[i][1], { size: 10.5, color: DIM });
      P.text(x + 16, y + 60, qs[i][2], { size: 11.5, mono: true, color: VAL });
    }
    if (p > 0.5) {
      P.text(32, 258, 'the procedure, in four lines', { size: 10.5, mono: true, color: FAINT });
      P.text(32, 280, '1  write the three outcomes and check that the probabilities sum to one', { size: 11, color: INK });
      P.text(32, 302, '2  read whether each time is a level\'s own or already inclusive', { size: 11, color: INK });
      P.text(32, 324, '3  read the denominator of every rate and the unit of the answer', { size: 11, color: INK });
      P.text(32, 346, '4  weight, then compare with the options and name the substitution behind each', { size: 11, color: INK });
    }
    if (p > 0.85) {
      chip(32, 374, 'one partition, four numbers: that is the whole topic', true);
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
      CFG: CFG, OUT: OUT, AMAT: str(AMAT), AMAT_FACT: str(AMAT_FACT), AMAT_WRONG: str(AMAT_WRONG),
      TERMS: [str(TERM1), str(TERM2), str(TERM3)],
      C25: { weighted: str(A25), increments: str(A25_INC), naive: str(A25_BAD) },
      P17B: { roots: [str(ROOT_POS), str(ROOT_NEG)], m1: str(P17B_M1), m2: str(P17B_M2), amat: str(P17B_AMAT) },
      P17A: { acc: str(ACC), l1: str(L1_MISSES), l2: str(L2_MISSES), local: str(LOCAL17), global: str(GLOBAL17) },
      P16: { hierarchical: str(AMAT16), simultaneous: str(SIM16) },
      CPI: { base: str(BASE_CPI), extra: str(EXTRA), stalls: str(STALLS), cpi: str(CPI), split: [str(DECOMP_L2), str(DECOMP_MM)] },
      HALF: {
        l1: { amat: str(AMAT_H1), cpi: str(CPI_H1), speedup: fix(SPEED_H1, 3) },
        l2: { amat: str(AMAT_H2), cpi: str(CPI_H2), speedup: fix(SPEED_H2, 3) }
      },
      TRAPS: TRAPS, SWEEP: SWEEP, CHECKS: CHECKS
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
