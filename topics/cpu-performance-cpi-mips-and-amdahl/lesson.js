/* ==========================================================================
   cpu-performance-cpi-mips-and-amdahl — model, validation, render.

   Layer 1  model      : the CPU performance equation, the instruction-mix CPI,
                         the two-machine comparison, MIPS and its three
                         failures, the speedup ratio and its percentage
                         conversions, Amdahl's law forward and backward, the
                         stall-cycle split, and the pipeline limit.
   Layer 2  validation : every quoted number is recomputed by a second route and
                         compared, and every formula is checked against a direct
                         time computation over a grid rather than against a
                         stored answer.
   Layer 3  render     : reads the model; never re-derives a number.
   Layer 4  timeline   : in timeline.js — the only source of time.

   No p5.brush: every mark on this page is a number, an axis or a bar the learner
   has to read exactly. A random stroke offset would blur the thing being read.
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

  /* --- the instruction mix -------------------------------------------- */
  var MIX = [
    { name: 'ALU and integer', share: 0.50, cpi: 1 },
    { name: 'Load and store',  share: 0.25, cpi: 2 },
    { name: 'Branch',          share: 0.15, cpi: 3 },
    { name: 'Floating point',  share: 0.10, cpi: 5 }
  ];

  var IC = 1e6;          // instructions executed by the program
  var FA = 2e9;          // machine A clock rate, Hz
  var IC_B = 1.3e6;      // machine B: the compiler emits 30% more instructions
  var CPI_B = 2.4;
  var FB = 3e9;

  function weightedCPI(mix) {
    var s = 0;
    for (var i = 0; i < mix.length; i++) s += mix[i].share * mix[i].cpi;
    return s;
  }

  /* the same average by the other route: total cycles / total instructions */
  function cpiByCounts(mix, counts) {
    var cyc = 0, n = 0;
    for (var i = 0; i < mix.length; i++) { cyc += counts[i] * mix[i].cpi; n += counts[i]; }
    return cyc / n;
  }

  var CPI_A = weightedCPI(MIX);
  var CYCLES_A = IC * CPI_A;
  var TA = CYCLES_A / FA;                 // seconds
  var CYCLES_B = IC_B * CPI_B;
  var TB = CYCLES_B / FB;
  var MIPS_A = FA / (CPI_A * 1e6);
  var MIPS_B = FB / (CPI_B * 1e6);
  var FASTER = TB / TA;                   // A is FASTER times faster than B

  /* --- clock conversions ---------------------------------------------- */
  var CLOCKS = [
    { rate: 1e6, label: '1 MHz' },
    { rate: 1e8, label: '100 MHz' },
    { rate: 1e9, label: '1 GHz' },
    { rate: 2e9, label: '2 GHz' },
    { rate: 3e9, label: '3 GHz' }
  ];
  function periodNs(rateHz) { return 1000 / (rateHz / 1e6); }   // ns

  /* --- MIPS on one machine, two programs ------------------------------ */
  var SAME_CPU = 2e9;
  var CPI_INT = 1.5, CPI_FP = 4.0;
  var MIPS_INT = SAME_CPU / (CPI_INT * 1e6);
  var MIPS_FP = SAME_CPU / (CPI_FP * 1e6);
  var MIPS_ARITH = (MIPS_INT + MIPS_FP) / 2;
  var MIPS_HARM = 2 / (1 / MIPS_INT + 1 / MIPS_FP);

  /* the aggregate rate, computed from totals rather than from the mean */
  var T_INT = IC * CPI_INT / SAME_CPU;
  var T_FP = IC * CPI_FP / SAME_CPU;
  var MIPS_AGG = (2 * IC) / ((T_INT + T_FP) * 1e6);

  /* --- speedup and its two percentage forms --------------------------- */
  function pctFasterToTimeFrac(x) { return 1 / (1 + x); }
  function pctLessTimeToSpeedup(x) { return 1 / (1 - x); }
  var SPEED_P20 = 1.20;
  var TIME_FRAC = pctFasterToTimeFrac(0.20);        // 0.8333
  var TIME_CUT = 1 - TIME_FRAC;                      // 0.1667
  var SPEED_FROM_CUT = pctLessTimeToSpeedup(0.20);   // 1.25

  /* --- Amdahl ---------------------------------------------------------- */
  function amdahl(p, s) { return 1 / ((1 - p) + p / s); }
  function amdahlCeiling(p) { return 1 / (1 - p); }
  /* solve for the local speedup that reaches a target overall speedup */
  function amdahlSolveS(p, target) {
    var denom = 1 / target;                 // (1-p) + p/s
    var rest = denom - (1 - p);             // p/s
    if (rest <= 0) return null;             // target at or above the ceiling
    return p / rest;
  }

  var AM_P = 0.6, AM_S = 4;
  var AM_SPEEDUP = amdahl(AM_P, AM_S);            // 1.8181...
  var AM_TIME_FRAC = (1 - AM_P) + AM_P / AM_S;    // 0.55
  var AM_CEIL = amdahlCeiling(AM_P);              // 2.5
  var AM_GRID = [1, 1.5, 2, 4, 8, 16, 64, 1e9];

  var REV_P = 0.9, REV_TARGET = 2;
  var REV_S = amdahlSolveS(REV_P, REV_TARGET);    // 2.25
  var REV_CEIL = amdahlCeiling(REV_P);            // 10
  var IMP_P = 0.6, IMP_TARGET = 3;                // above the ceiling of 2.5
  var IMP_S = amdahlSolveS(IMP_P, IMP_TARGET);    // null

  /* --- stall cycles ---------------------------------------------------- */
  var BASE_CPI = 1.2, MISS_RATE = 0.03, PENALTY = 60;
  var STALL_CPI = MISS_RATE * PENALTY;            // 1.8
  var REAL_CPI = BASE_CPI + STALL_CPI;            // 3.0
  var T_REAL = IC * REAL_CPI / FA;                // 1.5 ms
  var T_PERFECT = IC * BASE_CPI / FA;             // 0.6 ms
  var CACHE_SPEEDUP = T_REAL / T_PERFECT;         // 2.5
  var TARGET_CPI = 2.0;
  var NEEDED_MISS = (TARGET_CPI - BASE_CPI) / PENALTY;   // 0.01333

  /* --- pipeline -------------------------------------------------------- */
  var K_STAGES = 5, STALLS_PER_INSTR = 0.2;
  var PIPE_CPI = 1 + STALLS_PER_INSTR;            // 1.2
  var PIPE_LIMIT = K_STAGES / PIPE_CPI;           // 4.1667
  var PIPE_N = 1000;
  var PIPE_CYCLES = K_STAGES + PIPE_N - 1 + Math.round(STALLS_PER_INSTR * PIPE_N);
  var PIPE_BASE_CYCLES = PIPE_N * K_STAGES;
  var PIPE_EXACT = PIPE_BASE_CYCLES / PIPE_CYCLES;  // 4.1528

  var M = {
    MIX: MIX, IC: IC,
    CPI_A: CPI_A, CYCLES_A: CYCLES_A, TA: TA,
    IC_B: IC_B, CPI_B: CPI_B, FB: FB, CYCLES_B: CYCLES_B, TB: TB,
    MIPS_A: MIPS_A, MIPS_B: MIPS_B, FASTER: FASTER,
    CLOCKS: CLOCKS,
    SAME_CPU: SAME_CPU, CPI_INT: CPI_INT, CPI_FP: CPI_FP,
    MIPS_INT: MIPS_INT, MIPS_FP: MIPS_FP,
    MIPS_ARITH: MIPS_ARITH, MIPS_HARM: MIPS_HARM, MIPS_AGG: MIPS_AGG,
    TIME_FRAC: TIME_FRAC, TIME_CUT: TIME_CUT, SPEED_FROM_CUT: SPEED_FROM_CUT,
    AM_P: AM_P, AM_S: AM_S, AM_SPEEDUP: AM_SPEEDUP, AM_TIME_FRAC: AM_TIME_FRAC,
    AM_CEIL: AM_CEIL, AM_GRID: AM_GRID,
    REV_P: REV_P, REV_TARGET: REV_TARGET, REV_S: REV_S, REV_CEIL: REV_CEIL,
    IMP_P: IMP_P, IMP_TARGET: IMP_TARGET, IMP_S: IMP_S,
    BASE_CPI: BASE_CPI, MISS_RATE: MISS_RATE, PENALTY: PENALTY,
    STALL_CPI: STALL_CPI, REAL_CPI: REAL_CPI, T_REAL: T_REAL, T_PERFECT: T_PERFECT,
    CACHE_SPEEDUP: CACHE_SPEEDUP, TARGET_CPI: TARGET_CPI, NEEDED_MISS: NEEDED_MISS,
    K_STAGES: K_STAGES, PIPE_CPI: PIPE_CPI, PIPE_LIMIT: PIPE_LIMIT,
    PIPE_EXACT: PIPE_EXACT, PIPE_CYCLES: PIPE_CYCLES
  };

  /* ======================================================================
     LAYER 2 — VALIDATION
     Each check recomputes a claim from the definitions by a route that does
     not reuse the value being checked.
     ====================================================================== */

  var CHECKS = [];
  function chk(name, pass, detail) {
    CHECKS.push({ name: name, pass: !!pass, detail: detail || '' });
  }
  function close(a, b, tol) {
    if (!isFinite(a) || !isFinite(b)) return false;
    return Math.abs(a - b) <= (tol === undefined ? 1e-9 : tol) * Math.max(1, Math.abs(b));
  }

  /* 1. the shares are a distribution */
  var shareSum = 0;
  for (var i = 0; i < MIX.length; i++) shareSum += MIX[i].share;
  chk('instruction-mix shares sum to 1', close(shareSum, 1, 1e-12), 'sum = ' + shareSum.toFixed(12));

  /* 2. weighted CPI by two routes: frequencies, and raw counts */
  var counts = MIX.map(function (m) { return Math.round(m.share * 1e6); });
  var cpiCounts = cpiByCounts(MIX, counts);
  chk('weighted CPI equals total cycles / total instructions',
      close(CPI_A, cpiCounts, 1e-6), 'weighted ' + CPI_A.toFixed(6) + ' vs counts ' + cpiCounts.toFixed(6));

  /* 3. the plain average is a different number (the trap is real) */
  var plainAvg = MIX.reduce(function (a, m) { return a + m.cpi; }, 0) / MIX.length;
  chk('the unweighted mean differs from the weighted CPI',
      Math.abs(plainAvg - CPI_A) > 0.5, 'plain ' + plainAvg + ' vs weighted ' + CPI_A);

  /* 4. CPU time from the product equals cycles / clock rate */
  var tByProduct = IC * CPI_A * (1 / FA);
  chk('CPU time = IC x CPI x cycle time matches cycles / rate',
      close(tByProduct, TA, 1e-12), TA.toExponential(6) + ' s');

  /* 5. clock period and rate are reciprocals across the table */
  var recipOk = CLOCKS.every(function (c) {
    var periodSec = 1 / c.rate;
    return close(periodSec * 1e9, periodNs(c.rate), 1e-9);
  });
  chk('period in ns = 1000 / rate in MHz, for every clock in the table', recipOk);

  /* 6. the two-machine comparison: B has the higher clock and the longer time */
  chk('the faster clock is the slower machine',
      FB > FA && TB > TA, 'B ' + (FB / 1e9) + ' GHz takes ' + (TB * 1e3).toFixed(4) + ' ms vs ' +
      (TA * 1e3).toFixed(4) + ' ms');

  /* 7. the same conclusion by the ratio, not by the difference */
  chk('the A/B time ratio equals the reported factor',
      close(TB / TA, FASTER, 1e-12) && FASTER > 1, 'A is ' + FASTER.toFixed(4) + 'x faster');

  /* 8. MIPS from the rate/CPI form equals MIPS from count/time */
  var mipsA_byTime = IC / (TA * 1e6);
  var mipsB_byTime = IC_B / (TB * 1e6);
  chk('MIPS = rate / (CPI x 1e6) equals instruction count / (time x 1e6)',
      close(MIPS_A, mipsA_byTime, 1e-9) && close(MIPS_B, mipsB_byTime, 1e-9),
      MIPS_A.toFixed(2) + ' and ' + MIPS_B.toFixed(2));

  /* 9. the inversion: higher MIPS, longer time */
  chk('the higher MIPS machine is the slower one',
      MIPS_B > MIPS_A && TB > TA, 'MIPS ' + MIPS_B.toFixed(0) + ' > ' + MIPS_A.toFixed(0) +
      ', time ' + (TB * 1e3).toFixed(3) + ' ms > ' + (TA * 1e3).toFixed(3) + ' ms');

  /* 10. MIPS varies between programs on one machine */
  chk('one machine, two programs, two MIPS figures',
      close(MIPS_INT, SAME_CPU / (CPI_INT * 1e6), 1e-12) && MIPS_INT > MIPS_FP * 2,
      MIPS_INT.toFixed(1) + ' vs ' + MIPS_FP.toFixed(1));

  /* 11. harmonic mean equals the aggregate rate; the arithmetic mean does not */
  chk('harmonic mean of rates equals total instructions / total time',
      close(MIPS_HARM, MIPS_AGG, 1e-9), 'harmonic ' + MIPS_HARM.toFixed(3) +
      ' vs aggregate ' + MIPS_AGG.toFixed(3));
  chk('the arithmetic mean of rates overstates the aggregate',
      MIPS_ARITH > MIPS_AGG + 1, 'arithmetic ' + MIPS_ARITH.toFixed(2));

  /* 12. speedup is a ratio of times, and the two percentage forms are inverses */
  chk('1/(1 + x) and 1/(1 - x) are inverse conversions',
      close(pctFasterToTimeFrac(0.2), 1 / SPEED_P20, 1e-12) &&
      close(SPEED_FROM_CUT, 1 / (1 - 0.2), 1e-12),
      '20% faster -> ' + (TIME_FRAC * 100).toFixed(2) + '% of the time; 20% less time -> ' + SPEED_FROM_CUT + 'x');

  /* 13. Amdahl equals a direct two-part time computation over a grid */
  var amdahlOk = true, amdahlWorst = 0;
  for (var gi = 0; gi < AM_GRID.length; gi++) {
    var s = AM_GRID[gi];
    var direct = 1 / ((1 - AM_P) * 1 + (AM_P * 1) / s);   // old time 1, new time (1-p) + p/s
    var d = Math.abs(direct - amdahl(AM_P, s));
    if (d > amdahlWorst) amdahlWorst = d;
    if (d > 1e-12) amdahlOk = false;
  }
  chk('Amdahl matches a direct time computation on the whole grid', amdahlOk,
      'max difference ' + amdahlWorst.toExponential(2));

  /* 14. the ceiling is approached but never reached */
  chk('as the local speedup grows, the overall speedup tends to 1/(1-p)',
      amdahl(AM_P, 1e9) < AM_CEIL && close(amdahl(AM_P, 1e9), AM_CEIL, 1e-6),
      'limit ' + AM_CEIL + ', at s = 1e9 it is ' + amdahl(AM_P, 1e9).toFixed(6));

  /* 15. the two neutral elements of Amdahl */
  chk('Amdahl gives 1 for no improvement and 1 for no improvable part',
      close(amdahl(AM_P, 1), 1, 1e-12) && close(amdahl(0, 50), 1, 1e-12));

  /* 16. monotonicity in both arguments */
  var monoOk = true;
  for (var mi = 1; mi < AM_GRID.length; mi++) {
    if (!(amdahl(AM_P, AM_GRID[mi]) > amdahl(AM_P, AM_GRID[mi - 1]))) monoOk = false;
  }
  for (var pi = 1; pi <= 9; pi++) {
    if (!(amdahl(pi / 10, 4) > amdahl((pi - 1) / 10, 4))) monoOk = false;
  }
  chk('Amdahl increases with the local speedup and with the improvable fraction', monoOk);

  /* 17. the reverse solve recovers the target */
  chk('solving Amdahl backwards recovers the target exactly',
      REV_S !== null && close(amdahl(REV_P, REV_S), REV_TARGET, 1e-12),
      's = ' + REV_S + ' gives ' + amdahl(REV_P, REV_S).toFixed(12));

  /* 18. a target above the ceiling has no solution */
  chk('a target above 1/(1-p) has no positive local speedup',
      IMP_TARGET > amdahlCeiling(IMP_P) && IMP_S === null,
      'target ' + IMP_TARGET + ' vs ceiling ' + amdahlCeiling(IMP_P));

  /* 19. stall cycles: the split, the times and the solve */
  chk('CPI = base + miss rate x penalty, and the times follow',
      close(BASE_CPI + STALL_CPI, REAL_CPI, 1e-12) &&
      close(T_REAL, IC * REAL_CPI / FA, 1e-12) &&
      close(CACHE_SPEEDUP, REAL_CPI / BASE_CPI, 1e-12),
      'CPI ' + REAL_CPI + ', ' + (T_REAL * 1e3).toFixed(3) + ' ms vs ' + (T_PERFECT * 1e3).toFixed(3) + ' ms');
  chk('the miss rate that reaches the target CPI, substituted back, gives the target',
      close(BASE_CPI + NEEDED_MISS * PENALTY, TARGET_CPI, 1e-12),
      'm = ' + (NEEDED_MISS * 100).toFixed(4) + '%');

  /* 20. pipeline: the limit and the exact count bracket each other */
  chk('pipeline speedup approaches k / (1 + stalls) and the exact count is below it',
      close(K_STAGES / PIPE_CPI, PIPE_LIMIT, 1e-12) &&
      PIPE_EXACT < PIPE_LIMIT && PIPE_EXACT > PIPE_LIMIT * 0.99,
      'limit ' + PIPE_LIMIT.toFixed(4) + ', exact ' + PIPE_EXACT.toFixed(4));

  /* 21. doubling the clock while doubling the CPI is exactly no speedup */
  var tOld = IC * 2 / 2e9, tNew = IC * 4 / 4e9;
  chk('doubling rate and CPI together gives speedup 1', close(tOld / tNew, 1, 1e-12));

  /* 22. every caption number is finite */
  var finiteOk = true;
  for (var key in M) {
    if (typeof M[key] === 'number' && !isFinite(M[key])) finiteOk = false;
  }
  chk('every model quantity is a finite number', finiteOk);

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

  /* ======================================================================
     LAYER 3 — RENDER
     ====================================================================== */

  function stage(p, from, to) { return K.ease(K.clamp01((p - from) / (to - from))); }
  function ms(sec) { return (sec * 1e3); }

  function head(P, title, sub) {
    P.text(28, 26, title, { size: 17, bold: true, color: PR.PAL.ink });
    if (sub) P.text(28, 50, sub, { size: 11.5, color: PR.PAL.dim });
    P.line(28, 64, W - 28, 64, { stroke: PR.PAL.border, sw: 1 });
  }

  function chip(P, x, y, label, colour) {
    var w = Math.max(46, label.length * 6.4 + 14);
    P.rect(x, y, w, 20, { fill: colour, radius: 5, stroke: colour });
    P.text(x + w / 2, y + 10, label, { size: 10.5, bold: true, color: '#ffffff', align: 'center', base: 'middle' });
    return w;
  }

  function card(P, x, y, w, h, o) {
    o = o || {};
    P.rect(x, y, w, h, { fill: o.fill || PR.PAL.surface2, stroke: o.stroke || PR.PAL.border, radius: 8, sw: 1 });
  }

  function hbar(P, x, y, w, h, frac, colour, a) {
    P.alpha(a === undefined ? 1 : a);
    P.rect(x, y, w, h, { fill: PR.PAL.surface2, radius: 4 });
    P.rect(x, y, Math.max(2, w * K.clamp01(frac)), h, { fill: colour, radius: 4 });
    P.alpha(1);
  }

  /* ---------------- scene 1: the equation ---------------------------- */
  function drawEquation(P, t, p) {
    head(P, 'CPU time = instruction count \u00d7 CPI \u00d7 clock cycle time',
         'The CPU performance equation. Three factors, three different owners.');

    var boxes = [
      { t: 'Instruction count', s: 'set by the program,\nthe compiler, the ISA', v: '1 000 000' },
      { t: 'CPI', s: 'set by the datapath,\nthe pipeline, the cache', v: '1.95' },
      { t: 'Clock cycle time', s: 'set by the clock rate:\n0.5 ns at 2 GHz', v: '0.5 ns' }
    ];
    var bw = 218, bh = 118, gap = 42, x0 = 28;
    for (var i = 0; i < 3; i++) {
      var a = stage(p, 0.02 + i * 0.13, 0.16 + i * 0.13);
      var x = x0 + i * (bw + gap);
      P.alpha(a);
      card(P, x, 96, bw, bh, { fill: PR.PAL.surface2 });
      P.text(x + 14, 112, boxes[i].t, { size: 13, bold: true, color: PR.PAL.accent });
      P.text(x + 14, 138, boxes[i].v, { size: 20, bold: true, mono: true, color: PR.PAL.ink });
      var lines = boxes[i].s.split('\n');
      for (var li = 0; li < lines.length; li++) {
        P.text(x + 14, 172 + li * 15, lines[li], { size: 10.5, color: PR.PAL.dim });
      }
      P.alpha(1);
      if (i < 2) {
        var am = stage(p, 0.16 + i * 0.13, 0.22 + i * 0.13);
        P.alpha(am);
        P.text(x + bw + gap / 2, 150, '\u00d7', { size: 22, color: PR.PAL.dim, align: 'center', base: 'middle' });
        P.alpha(1);
      }
    }

    var ar = stage(p, 0.50, 0.64);
    P.alpha(ar);
    P.rect(28, 238, W - 56, 52, { fill: PR.PAL.accentDim, stroke: PR.PAL.accent, radius: 8 });
    P.text(44, 254, 'Product, with the units carried through:', { size: 11.5, color: PR.PAL.dim });
    P.text(44, 272, 'instructions \u00d7 cycles/instruction \u00d7 seconds/cycle = seconds', { size: 14, bold: true, mono: true, color: PR.PAL.accent });
    P.alpha(1);

    var aw = stage(p, 0.66, 0.82);
    P.alpha(aw);
    P.text(28, 316, 'Worked, with this lesson\u2019s mix:', { size: 11.5, color: PR.PAL.dim });
    P.text(28, 342, '1 000 000 \u00d7 1.95 \u00d7 0.5 ns  =  1 950 000 cycles  =  0.975 ms',
           { size: 15, bold: true, mono: true, color: PR.PAL.ink });
    P.alpha(1);

    var an = stage(p, 0.84, 0.98);
    P.alpha(an);
    P.text(28, 392, 'Every later formula on this page is this product, rearranged.', { size: 11.5, color: PR.PAL.dim });
    P.text(28, 412, 'A faster clock only moves the third factor. The other two can move against it.', { size: 11.5, color: PR.PAL.dim });
    P.alpha(1);
  }

  /* ---------------- scene 2: the clock -------------------------------- */
  function drawClock(P, t, p) {
    head(P, 'Rate and period are reciprocals', '2 GHz is 0.5 ns per cycle. The equation wants the period.');

    var x0 = 40, y0 = 150, wpx = 470, amp = 52, cyclesShown = 8;
    var rev2 = stage(p, 0.02, 0.30);
    var n = Math.max(1, Math.round(cyclesShown * rev2));

    P.line(x0, y0, x0 + wpx, y0, { stroke: PR.PAL.border, sw: 1 });
    P.text(x0 - 6, y0, 'time \u2192', { size: 10, color: PR.PAL.faint, align: 'right', base: 'middle' });

    var cw = wpx / cyclesShown;
    for (var i = 0; i < n; i++) {
      var xa = x0 + i * cw, xb = xa + cw;
      var yHi = y0 - amp, yLo = y0;
      P.line(xa, yLo, xa, yHi, { stroke: PR.PAL.accent, sw: 2 });
      P.line(xa, yHi, xa + cw * 0.5, yHi, { stroke: PR.PAL.accent, sw: 2 });
      P.line(xa + cw * 0.5, yHi, xa + cw * 0.5, yLo, { stroke: PR.PAL.accent, sw: 2 });
      P.line(xa + cw * 0.5, yLo, xb, yLo, { stroke: PR.PAL.accent, sw: 2 });
      if (i < 3) {
        P.text(xa + cw * 0.5, y0 + 18, (i + 1), { size: 9.5, color: PR.PAL.faint, align: 'center' });
      }
    }
    P.text(x0, y0 - amp - 14, 'clock signal', { size: 10.5, color: PR.PAL.dim });

    var a1 = stage(p, 0.32, 0.46);
    P.alpha(a1);
    P.arrow(x0 + cw, y0 + 34, x0 + 2 * cw, y0 + 34, { stroke: PR.PAL.info, sw: 1.5, head: 8 });
    P.text(x0 + 1.5 * cw, y0 + 50, 'one period = 0.5 ns', { size: 10.5, color: PR.PAL.info, align: 'center' });
    P.alpha(1);

    /* the conversion table */
    var a2 = stage(p, 0.40, 0.60);
    P.alpha(a2);
    var tx = 546, ty = 96;
    card(P, tx, ty, 320, 202, { fill: PR.PAL.surface2 });
    P.text(tx + 14, ty + 12, 'period (ns) = 1000 / rate (MHz)', { size: 11, bold: true, mono: true, color: PR.PAL.accent });
    P.line(tx + 14, ty + 34, tx + 306, ty + 34, { stroke: PR.PAL.border, sw: 1 });
    for (var c = 0; c < CLOCKS.length; c++) {
      var yy = ty + 48 + c * 28;
      var hi = CLOCKS[c].rate === 2e9;
      if (hi) P.rect(tx + 8, yy - 6, 304, 24, { fill: PR.PAL.accentDim, radius: 4 });
      P.text(tx + 18, yy, CLOCKS[c].label, { size: 11.5, mono: true, color: hi ? PR.PAL.accent : PR.PAL.ink, bold: hi });
      P.text(tx + 300, yy, periodNs(CLOCKS[c].rate).toFixed(periodNs(CLOCKS[c].rate) >= 10 ? 0 : 3) + ' ns',
             { size: 11.5, mono: true, align: 'right', color: hi ? PR.PAL.accent : PR.PAL.ink, bold: hi });
    }
    P.alpha(1);

    var a3 = stage(p, 0.64, 0.80);
    P.alpha(a3);
    P.rect(28, 300, W - 56, 44, { fill: PR.PAL.accentDim, radius: 8 });
    P.text(44, 314, 'Doubling the rate halves the period, and would halve the time \u2014', { size: 11.5, color: PR.PAL.dim });
    P.text(44, 330, 'if the instruction count and the CPI stayed where they were.', { size: 12.5, bold: true, color: PR.PAL.accent });
    P.alpha(1);

    var a4 = stage(p, 0.82, 0.98);
    P.alpha(a4);
    P.text(28, 368, 'They do not stay where they were. A deeper pipeline buys frequency and pays in CPI;', { size: 11.5, color: PR.PAL.dim });
    P.text(28, 388, 'a cache lowers CPI and lengthens the cycle. The three factors trade.', { size: 11.5, color: PR.PAL.dim });
    P.alpha(1);
  }

  /* ---------------- scene 3: the instruction mix ---------------------- */
  function drawMix(P, t, p) {
    head(P, 'Average CPI from the mix', 'CPI = \u03a3 (share \u00d7 class CPI). The plain average of the class CPIs is wrong.');

    var x = 28, y = 84, rowH = 34;
    var cols = [x + 14, x + 214, x + 300, x + 402];
    P.text(cols[0], y, 'class', { size: 10.5, bold: true, color: PR.PAL.faint });
    P.text(cols[1], y, 'share', { size: 10.5, bold: true, color: PR.PAL.faint, align: 'right' });
    P.text(cols[2], y, 'CPI', { size: 10.5, bold: true, color: PR.PAL.faint, align: 'right' });
    P.text(cols[3], y, 'contribution to CPI', { size: 10.5, bold: true, color: PR.PAL.faint });

    for (var i = 0; i < MIX.length; i++) {
      var a = stage(p, 0.04 + i * 0.10, 0.18 + i * 0.10);
      var yy = y + 20 + i * rowH;
      P.alpha(a);
      P.text(cols[0], yy, MIX[i].name, { size: 12, color: PR.PAL.ink });
      P.text(cols[1], yy, (MIX[i].share * 100).toFixed(0) + '%', { size: 12, mono: true, align: 'right', color: PR.PAL.ink });
      P.text(cols[2], yy, String(MIX[i].cpi), { size: 12, mono: true, align: 'right', color: PR.PAL.ink });
      hbar(P, cols[3], yy - 4, 250, 16, (MIX[i].share * MIX[i].cpi) / 1.2, PR.PAL.accent, a);
      P.text(cols[3] + 258, yy, (MIX[i].share * MIX[i].cpi).toFixed(2), { size: 11.5, mono: true, color: PR.PAL.dim });
      P.alpha(1);
    }

    var at = stage(p, 0.48, 0.62);
    P.alpha(at);
    var ty = y + 20 + MIX.length * rowH + 6;
    P.line(x + 10, ty - 8, W - 40, ty - 8, { stroke: PR.PAL.border, sw: 1 });
    P.text(cols[0], ty + 8, 'weighted average', { size: 12.5, bold: true, color: PR.PAL.accent });
    P.text(cols[1], ty + 8, '100%', { size: 12, mono: true, align: 'right', color: PR.PAL.accent });
    P.text(cols[3], ty + 8, CPI_A.toFixed(2) + ' cycles per instruction',
           { size: 13, bold: true, mono: true, color: PR.PAL.accent });
    P.alpha(1);

    var aw = stage(p, 0.64, 0.76);
    P.alpha(aw);
    P.rect(28, ty + 26, W - 56, 38, { fill: PR.PAL.invalidDim, radius: 8 });
    P.text(44, ty + 38, 'The unweighted mean of 1, 2, 3 and 5 is ' + plainAvg.toFixed(2) + '. It is wrong here: the four classes are not equally frequent.',
           { size: 11.5, color: PR.PAL.invalid });
    P.alpha(1);

    var af = stage(p, 0.80, 0.96);
    P.alpha(af);
    P.text(28, ty + 88, '1 000 000 \u00d7 1.95 = 1 950 000 cycles, and at 2 GHz that is 0.975 ms.',
           { size: 13.5, bold: true, mono: true, color: PR.PAL.ink });
    P.text(28, ty + 110, 'The same 1.95 comes out of total cycles \u00f7 total instructions, which is the check run on this page.',
           { size: 11, color: PR.PAL.dim });
    P.alpha(1);
  }

  /* ---------------- scene 4: two machines ----------------------------- */
  function drawMachines(P, t, p) {
    head(P, 'Two machines, one program', 'A faster clock with a worse CPI and a bigger instruction count.');

    var maxT = Math.max(TA, TB) * 1.25;
    var x0 = 150, wpx = 690;

    var rows = [
      { name: 'Machine A', clock: '2 GHz', ic: '1 000 000 instr', cpi: 'CPI 1.95', tt: TA, col: PR.PAL.accent },
      { name: 'Machine B', clock: '3 GHz', ic: '1 300 000 instr', cpi: 'CPI 2.40', tt: TB, col: PR.PAL.warn }
    ];

    for (var i = 0; i < rows.length; i++) {
      var a = stage(p, 0.04 + i * 0.16, 0.24 + i * 0.16);
      var y = 110 + i * 104;
      P.alpha(a);
      P.text(28, y + 4, rows[i].name, { size: 13, bold: true, color: rows[i].col });
      P.text(28, y + 24, rows[i].clock + ' \u00b7 ' + rows[i].cpi, { size: 10.5, color: PR.PAL.dim });
      P.text(28, y + 40, rows[i].ic, { size: 10.5, color: PR.PAL.dim });
      hbar(P, x0, y - 6, wpx, 26, rows[i].tt / maxT, rows[i].col, a);
      P.text(x0 + wpx * (rows[i].tt / maxT) + 8, y + 8, ms(rows[i].tt).toFixed(3) + ' ms',
             { size: 12.5, bold: true, mono: true, color: rows[i].col, base: 'middle' });
      P.alpha(1);
    }

    var av = stage(p, 0.56, 0.72);
    P.alpha(av);
    P.rect(28, 316, W - 56, 54, { fill: PR.PAL.warnDim, radius: 8 });
    P.text(44, 332, 'B has 50% more clock rate and finishes 6.7% later. The frequency rose, the time did not fall.',
           { size: 12.5, bold: true, color: PR.PAL.warn });
    P.text(44, 352, 'A is faster by a factor of ' + FASTER.toFixed(4) + ', which is the ratio of the two times and nothing else.',
           { size: 11.5, color: PR.PAL.dim });
    P.alpha(1);

    var ac = stage(p, 0.74, 0.92);
    P.alpha(ac);
    P.text(28, 396, 'Cycle counts, from the equation:  A ' + Math.round(CYCLES_A).toLocaleString('en-US') +
           ' cycles,  B ' + Math.round(CYCLES_B).toLocaleString('en-US') + ' cycles.',
           { size: 11.5, mono: true, color: PR.PAL.ink });
    P.text(28, 418, 'A clock rate alone cannot rank these two machines. Two of the three factors are missing.',
           { size: 11.5, color: PR.PAL.dim });
    P.alpha(1);
  }

  /* ---------------- scene 5: MIPS ------------------------------------- */
  function drawMips(P, t, p) {
    head(P, 'MIPS, and three ways it misleads', 'MIPS = rate / (CPI \u00d7 10\u2076) = instructions / (time \u00d7 10\u2076).');

    /* the two bars: MIPS, and the time */
    var maxM = Math.max(MIPS_A, MIPS_B) * 1.2;
    var a1 = stage(p, 0.03, 0.20);
    P.alpha(a1);
    P.text(28, 86, 'MIPS (higher looks better)', { size: 10.5, bold: true, color: PR.PAL.faint });
    hbar(P, 28, 96, 200, 18, MIPS_A / maxM, PR.PAL.accent, 1);
    P.text(236, 105, MIPS_A.toFixed(0), { size: 11.5, mono: true, color: PR.PAL.accent, base: 'middle' });
    hbar(P, 28, 122, 200, 18, MIPS_B / maxM, PR.PAL.warn, 1);
    P.text(236, 131, MIPS_B.toFixed(0), { size: 11.5, mono: true, color: PR.PAL.warn, base: 'middle' });

    var maxT = Math.max(TA, TB) * 1.2;
    P.text(320, 86, 'execution time (lower is better)', { size: 10.5, bold: true, color: PR.PAL.faint });
    hbar(P, 320, 96, 200, 18, TA / maxT, PR.PAL.accent, 1);
    P.text(528, 105, ms(TA).toFixed(3) + ' ms', { size: 11.5, mono: true, color: PR.PAL.accent, base: 'middle' });
    hbar(P, 320, 122, 200, 18, TB / maxT, PR.PAL.warn, 1);
    P.text(528, 131, ms(TB).toFixed(3) + ' ms', { size: 11.5, mono: true, color: PR.PAL.warn, base: 'middle' });
    P.text(28, 152, 'A is green, B is amber. B is ahead on MIPS and behind on time.', { size: 10.5, color: PR.PAL.dim });
    P.alpha(1);

    var a2 = stage(p, 0.22, 0.36);
    P.alpha(a2);
    P.line(28, 172, W - 28, 172, { stroke: PR.PAL.border, sw: 1 });
    P.alpha(1);

    /* the three failures */
    var fails = [
      { t: 'It ignores what an instruction does',
        s: 'One instruction that does the work of two lowers the count and the MIPS, and finishes sooner.' },
      { t: 'It varies between programs on one machine',
        s: 'The same 2 GHz CPU reads ' + MIPS_INT.toFixed(0) + ' MIPS at CPI 1.5 and ' + MIPS_FP.toFixed(0) + ' MIPS at CPI 4.' },
      { t: 'It can move opposite to performance',
        s: 'Exactly what happened above: ' + MIPS_B.toFixed(0) + ' MIPS took ' + ms(TB).toFixed(3) + ' ms, ' + MIPS_A.toFixed(0) + ' MIPS took ' + ms(TA).toFixed(3) + ' ms.' }
    ];
    for (var i = 0; i < fails.length; i++) {
      var a = stage(p, 0.30 + i * 0.14, 0.44 + i * 0.14);
      var y = 186 + i * 62;
      P.alpha(a);
      card(P, 28, y, W - 56, 54, { fill: i === 2 ? PR.PAL.invalidDim : PR.PAL.surface2, stroke: PR.PAL.border });
      P.text(44, y + 12, (i + 1) + '. ' + fails[i].t, { size: 12.5, bold: true, color: i === 2 ? PR.PAL.invalid : PR.PAL.ink });
      P.text(44, y + 32, fails[i].s, { size: 11, color: PR.PAL.dim });
      P.alpha(1);
    }

    var a3 = stage(p, 0.74, 0.88);
    P.alpha(a3);
    P.text(28, 380, 'Valid only when the program, the ISA and the compiler are the same. Then the instruction counts match.',
           { size: 11.5, color: PR.PAL.dim });
    P.alpha(1);

    var a4 = stage(p, 0.88, 0.99);
    P.alpha(a4);
    P.text(28, 404, 'Averaging rates needs the harmonic mean: ' + MIPS_HARM.toFixed(0) + ', not the arithmetic ' +
           MIPS_ARITH.toFixed(0) + '. Total instructions \u00f7 total time gives ' + MIPS_AGG.toFixed(0) + '.',
           { size: 11.5, mono: true, color: PR.PAL.accent });
    P.alpha(1);
  }

  /* ---------------- scene 6: speedup ---------------------------------- */
  function drawSpeedup(P, t, p) {
    head(P, 'Speedup is a ratio of times', 'Speedup = old time / new time. Performance is the reciprocal of time.');

    var x0 = 170, wpx = 560;
    var a1 = stage(p, 0.03, 0.20);
    P.alpha(a1);
    P.text(28, 96, 'old time', { size: 11.5, color: PR.PAL.dim });
    hbar(P, x0, 86, wpx, 26, 1, PR.PAL.border, 1);
    P.text(x0 + wpx + 10, 99, '1.000', { size: 12, mono: true, color: PR.PAL.dim, base: 'middle' });

    var a2 = stage(p, 0.22, 0.40);
    P.alpha(a2);
    P.text(28, 148, '20% faster', { size: 11.5, color: PR.PAL.accent });
    hbar(P, x0, 138, wpx, 26, TIME_FRAC, PR.PAL.accent, 1);
    P.text(x0 + wpx * TIME_FRAC + 10, 151, TIME_FRAC.toFixed(4) + ' of the old time', { size: 12, mono: true, color: PR.PAL.accent, base: 'middle' });
    P.alpha(1);

    var a3 = stage(p, 0.42, 0.58);
    P.alpha(a3);
    P.rect(28, 190, W - 56, 46, { fill: PR.PAL.accentDim, radius: 8 });
    P.text(44, 204, 'Speedup 1.2 means the time is 1/1.2 = ' + TIME_FRAC.toFixed(4) + ' of the old, a fall of ' +
           (TIME_CUT * 100).toFixed(2) + '%.', { size: 12, color: PR.PAL.accent });
    P.text(44, 222, 'Twenty percent more speed is sixteen point seven percent less time. They are different claims.',
           { size: 11, color: PR.PAL.dim });
    P.alpha(1);

    var a4 = stage(p, 0.60, 0.78);
    P.alpha(a4);
    P.text(28, 268, 'The other direction: a time cut by 20% is a speedup of 1 / 0.8 = ' + SPEED_FROM_CUT.toFixed(4) + '.',
           { size: 12.5, mono: true, color: PR.PAL.ink });
    P.text(28, 292, 'These two conversions are inverses, and mixing them is the commonest arithmetic error in the topic.',
           { size: 11, color: PR.PAL.dim });
    P.alpha(1);

    var a5 = stage(p, 0.80, 0.97);
    P.alpha(a5);
    P.rect(28, 318, W - 56, 92, { fill: PR.PAL.surface2, radius: 8 });
    P.text(44, 332, 'Write down which one the question gave you, before any arithmetic:', { size: 11, color: PR.PAL.dim });
    P.text(44, 354, '"20% faster"        \u2192  speedup 1.20  \u2192  time factor ' + TIME_FRAC.toFixed(4),
           { size: 12.5, mono: true, color: PR.PAL.ink });
    P.text(44, 376, '"20% less time"     \u2192  time factor 0.80  \u2192  speedup ' + SPEED_FROM_CUT.toFixed(4),
           { size: 12.5, mono: true, color: PR.PAL.ink });
    P.text(44, 398, 'Same words, different machines. One line of notation decides it.', { size: 11, color: PR.PAL.dim });
    P.alpha(1);
  }

  /* ---------------- scene 7: Amdahl forward --------------------------- */
  function drawAmdahl(P, t, p) {
    head(P, 'Amdahl\u2019s law', 'Speedup = 1 / ((1 \u2212 p) + p/s). p is a fraction of time.');

    var gx = 90, gy = 96, gw = 470, gh = 250;
    var sMax = 64, yMax = 2.7;

    P.line(gx, gy + gh, gx + gw, gy + gh, { stroke: PR.PAL.border, sw: 1.2 });
    P.line(gx, gy, gx, gy + gh, { stroke: PR.PAL.border, sw: 1.2 });
    P.text(gx + gw / 2, gy + gh + 34, 'local speedup s of the improved part', { size: 10.5, color: PR.PAL.faint, align: 'center' });
    P.text(gx - 10, gy - 12, 'overall speedup', { size: 10.5, color: PR.PAL.faint });

    for (var g = 1; g <= 64; g *= 2) {
      var xx = gx + gw * (Math.log(g) / Math.log(sMax));
      P.line(xx, gy + gh, xx, gy + gh + 4, { stroke: PR.PAL.border, sw: 1 });
      P.text(xx, gy + gh + 16, String(g), { size: 9.5, color: PR.PAL.faint, align: 'center' });
    }
    for (var yv = 1; yv <= 2.5; yv += 0.5) {
      var yy2 = gy + gh - gh * (yv / yMax);
      P.line(gx - 4, yy2, gx, yy2, { stroke: PR.PAL.border, sw: 1 });
      P.text(gx - 8, yy2, yv.toFixed(1), { size: 9.5, color: PR.PAL.faint, align: 'right', base: 'middle' });
    }

    var aC = stage(p, 0.03, 0.18);
    P.alpha(aC);
    P.line(gx, gy + gh - gh * (1 / yMax), gx + gw, gy + gh - gh * (1 / yMax), { stroke: PR.PAL.faint, sw: 1, dash: [3, 4] });
    P.text(gx + gw - 4, gy + gh - gh * (1 / yMax) - 12, 's = 1: no improvement, speedup 1',
           { size: 10, color: PR.PAL.faint, align: 'right' });
    P.alpha(1);

    var aA = stage(p, 0.12, 0.30);
    P.alpha(aA);
    P.line(gx, gy + gh - gh * (AM_CEIL / yMax), gx + gw, gy + gh - gh * (AM_CEIL / yMax),
           { stroke: PR.PAL.invalid, sw: 1.4, dash: [6, 4] });
    P.text(gx + gw - 4, gy + gh - gh * (AM_CEIL / yMax) - 12,
           'ceiling 1/(1\u2212p) = ' + AM_CEIL.toFixed(2), { size: 10.5, bold: true, color: PR.PAL.invalid, align: 'right' });
    P.alpha(1);

    /* the curve, drawn up to the revealed s */
    var aK = stage(p, 0.18, 0.44);
    var sReveal = Math.max(1, 1 * Math.pow(sMax, aK));
    var prevX = gx, prevY = gy + gh - gh * (1 / yMax);
    for (var ss = 1.02; ss <= sReveal; ss *= 1.06) {
      var v = amdahl(AM_P, ss);
      var X = gx + gw * (Math.log(ss) / Math.log(sMax));
      var Y = gy + gh - gh * Math.min(v, yMax) / yMax;
      P.line(prevX, prevY, X, Y, { stroke: PR.PAL.accent, sw: 2.4 });
      prevX = X; prevY = Y;
    }

    var aM = stage(p, 0.46, 0.62);
    P.alpha(aM);
    var mX = gx + gw * (Math.log(AM_S) / Math.log(sMax));
    var mY = gy + gh - gh * (AM_SPEEDUP / yMax);
    P.circle(mX, mY, 5, { fill: PR.PAL.accent });
    P.line(mX, mY, mX, gy + gh, { stroke: PR.PAL.accent, sw: 1, dash: [3, 3] });
    P.line(mX, mY, gx, mY, { stroke: PR.PAL.accent, sw: 1, dash: [3, 3] });
    P.text(mX + 10, mY - 10, 's = 4 \u2192 ' + AM_SPEEDUP.toFixed(3), { size: 11, bold: true, color: PR.PAL.accent });
    P.alpha(1);

    /* the working */
    var aW = stage(p, 0.58, 0.74);
    P.alpha(aW);
    var px = 586;
    card(P, px, gy, 286, 128, { fill: PR.PAL.surface2 });
    P.text(px + 14, gy + 12, 'p = 0.60, s = 4', { size: 12, bold: true, mono: true, color: PR.PAL.ink });
    P.text(px + 14, gy + 36, 'untouched part   0.40', { size: 11.5, mono: true, color: PR.PAL.dim });
    P.text(px + 14, gy + 54, 'improved part    0.60/4 = 0.15', { size: 11.5, mono: true, color: PR.PAL.dim });
    P.line(px + 14, gy + 66, px + 272, gy + 66, { stroke: PR.PAL.border, sw: 1 });
    P.text(px + 14, gy + 82, 'new time  ' + AM_TIME_FRAC.toFixed(2) + ' of the old', { size: 11.5, mono: true, bold: true, color: PR.PAL.accent });
    P.text(px + 14, gy + 104, 'speedup  1/0.55 = ' + AM_SPEEDUP.toFixed(4), { size: 11.5, mono: true, bold: true, color: PR.PAL.accent });
    P.alpha(1);

    var aT = stage(p, 0.74, 0.90);
    P.alpha(aT);
    P.rect(586, 236, 286, 110, { fill: PR.PAL.warnDim, radius: 8 });
    P.text(600, 248, 'The 0.40 did not move.', { size: 12, bold: true, color: PR.PAL.warn });
    P.text(600, 268, 'It started as 40% of the run and is', { size: 11, color: PR.PAL.dim });
    P.text(600, 286, 'now 73% of it. However fast the rest', { size: 11, color: PR.PAL.dim });
    P.text(600, 304, 'becomes, this part sets the floor.', { size: 11, color: PR.PAL.dim });
    P.text(600, 328, 'p is a fraction of TIME, not of code.', { size: 11, bold: true, color: PR.PAL.warn });
    P.alpha(1);
  }

  /* ---------------- scene 8: Amdahl backwards ------------------------- */
  function drawReverse(P, t, p) {
    head(P, 'Amdahl backwards', 'Given the target, solve for the local speedup. Check feasibility first.');

    var gx = 80, gy = 92, gw = 330, gh = 230;
    var sMax = 16, yMax = 3.0;
    P.line(gx, gy + gh, gx + gw, gy + gh, { stroke: PR.PAL.border, sw: 1.2 });
    P.line(gx, gy, gx, gy + gh, { stroke: PR.PAL.border, sw: 1.2 });
    P.text(gx + gw / 2, gy + gh + 32, 'local speedup s (p = 0.90)', { size: 10.5, color: PR.PAL.faint, align: 'center' });
    P.text(gx - 8, gy - 12, 'overall', { size: 10.5, color: PR.PAL.faint });

    for (var g = 1; g <= 16; g *= 2) {
      var xx = gx + gw * (Math.log(g) / Math.log(sMax));
      P.text(xx, gy + gh + 15, String(g), { size: 9.5, color: PR.PAL.faint, align: 'center' });
    }
    for (var yv = 1; yv <= 3; yv += 1) {
      var yy2 = gy + gh - gh * (yv / yMax);
      P.text(gx - 8, yy2, yv.toFixed(1), { size: 9.5, color: PR.PAL.faint, align: 'right', base: 'middle' });
    }

    var aC = stage(p, 0.04, 0.22);
    P.alpha(aC);
    var prevX = gx, prevY = gy + gh - gh / yMax;
    for (var ss = 1.02; ss <= sMax; ss *= 1.04) {
      var v = amdahl(REV_P, ss);
      var X = gx + gw * (Math.log(ss) / Math.log(sMax));
      var Y = gy + gh - gh * Math.min(v, yMax) / yMax;
      P.line(prevX, prevY, X, Y, { stroke: PR.PAL.accent, sw: 2.2 });
      prevX = X; prevY = Y;
    }
    P.alpha(1);

    var aT = stage(p, 0.24, 0.40);
    P.alpha(aT);
    var tY = gy + gh - gh * (REV_TARGET / yMax);
    P.line(gx, tY, gx + gw, tY, { stroke: PR.PAL.info, sw: 1.4, dash: [6, 4] });
    P.text(gx + 6, tY - 10, 'target 2.0', { size: 10.5, bold: true, color: PR.PAL.info });
    P.alpha(1);

    var aS = stage(p, 0.42, 0.58);
    P.alpha(aS);
    var sX = gx + gw * (Math.log(REV_S) / Math.log(sMax));
    P.circle(sX, tY, 5, { fill: PR.PAL.info });
    P.line(sX, tY, sX, gy + gh, { stroke: PR.PAL.info, sw: 1, dash: [3, 3] });
    P.text(sX + 8, tY + 16, 's = ' + REV_S, { size: 11.5, bold: true, color: PR.PAL.info });
    P.alpha(1);

    var aW = stage(p, 0.48, 0.66);
    P.alpha(aW);
    card(P, 440, gy, 432, 100, { fill: PR.PAL.surface2 });
    P.text(454, gy + 12, 'target 2 = 1 / (0.1 + 0.9/s)', { size: 12, bold: true, mono: true, color: PR.PAL.ink });
    P.text(454, gy + 34, '0.1 + 0.9/s = 0.5   \u2192   0.9/s = 0.4', { size: 11.5, mono: true, color: PR.PAL.dim });
    P.text(454, gy + 54, 's = 0.9 / 0.4 = ' + REV_S, { size: 12.5, mono: true, bold: true, color: PR.PAL.accent });
    P.text(454, gy + 78, 'Substituted back: 1/(0.1 + 0.4) = 2.000. Exact.', { size: 11, color: PR.PAL.dim });
    P.alpha(1);

    var aI = stage(p, 0.66, 0.84);
    P.alpha(aI);
    card(P, 440, 208, 432, 114, { fill: PR.PAL.invalidDim });
    P.text(454, 220, 'The impossible target', { size: 12, bold: true, color: PR.PAL.invalid });
    P.text(454, 242, 'p = 0.60 gives a ceiling of 1/0.40 = 2.50.', { size: 11.5, mono: true, color: PR.PAL.ink });
    P.text(454, 262, 'A target of 3.00 is above it, so the equation', { size: 11.5, color: PR.PAL.dim });
    P.text(454, 280, 'has no positive solution for s.', { size: 11.5, color: PR.PAL.dim });
    P.text(454, 304, 'Answer: no speedup of that part achieves it.', { size: 11.5, bold: true, color: PR.PAL.invalid });
    P.alpha(1);

    var aF = stage(p, 0.86, 0.99);
    P.alpha(aF);
    P.text(28, 400, 'Feasibility is one division. Do it before the algebra and the impossible question answers itself.',
           { size: 11.5, color: PR.PAL.dim });
    P.alpha(1);
  }

  /* ---------------- scene 9: stall cycles ----------------------------- */
  function drawStalls(P, t, p) {
    head(P, 'Where the cycles go', 'CPI = ideal CPI + (miss rate \u00d7 miss penalty in cycles).');

    var x0 = 60, wpx = 780, y = 110;
    var a1 = stage(p, 0.03, 0.18);
    P.alpha(a1);
    P.text(28, 88, 'the average CPI, split into two parts', { size: 10.5, color: PR.PAL.faint });
    var total = REAL_CPI;
    var wIdeal = wpx * (BASE_CPI / total), wStall = wpx * (STALL_CPI / total);
    P.rect(x0, y, wIdeal, 40, { fill: PR.PAL.accent, radius: 6 });
    P.text(x0 + wIdeal / 2, y + 20, 'ideal ' + BASE_CPI.toFixed(2), { size: 12, bold: true, color: '#ffffff', align: 'center', base: 'middle' });
    P.rect(x0 + wIdeal, y, wStall, 40, { fill: PR.PAL.warn, radius: 6 });
    P.text(x0 + wIdeal + wStall / 2, y + 20, 'stalls ' + STALL_CPI.toFixed(2), { size: 12, bold: true, color: '#ffffff', align: 'center', base: 'middle' });
    P.text(x0 + wpx, y - 12, 'total CPI ' + total.toFixed(2), { size: 12.5, bold: true, mono: true, color: PR.PAL.ink, align: 'right' });
    P.alpha(1);

    var a2 = stage(p, 0.20, 0.36);
    P.alpha(a2);
    P.text(28, 176, '0.03 \u00d7 60 = ' + STALL_CPI.toFixed(2) + ' stall cycles per instruction, on top of ' + BASE_CPI.toFixed(2) + ' ideal cycles.',
           { size: 12.5, mono: true, color: PR.PAL.ink });
    P.text(28, 196, 'The memory system is responsible for ' + ((STALL_CPI / total) * 100).toFixed(0) + '% of the CPI, and it changed nothing else.',
           { size: 11, color: PR.PAL.dim });
    P.alpha(1);

    var a3 = stage(p, 0.38, 0.56);
    P.alpha(a3);
    card(P, 28, 216, 414, 104, { fill: PR.PAL.surface2 });
    P.text(42, 228, 'The cache, measured in CPI', { size: 12, bold: true, color: PR.PAL.accent });
    P.text(42, 250, 'CPI ' + total.toFixed(2) + ' \u2192 ' + ms(T_REAL).toFixed(2) + ' ms', { size: 12, mono: true, color: PR.PAL.ink });
    P.text(42, 270, 'CPI ' + BASE_CPI.toFixed(2) + ' \u2192 ' + ms(T_PERFECT).toFixed(2) + ' ms  (perfect cache)', { size: 12, mono: true, color: PR.PAL.ink });
    P.text(42, 294, 'speedup = ' + total.toFixed(2) + ' / ' + BASE_CPI.toFixed(2) + ' = ' + CACHE_SPEEDUP.toFixed(2) + '\u00d7', { size: 12.5, mono: true, bold: true, color: PR.PAL.accent });
    P.alpha(1);

    var a4 = stage(p, 0.58, 0.76);
    P.alpha(a4);
    card(P, 458, 216, 414, 104, { fill: PR.PAL.surface2 });
    P.text(472, 228, 'Turned around: solve for the miss rate', { size: 12, bold: true, color: PR.PAL.info });
    P.text(472, 250, BASE_CPI.toFixed(1) + ' + m \u00d7 ' + PENALTY + ' = ' + TARGET_CPI.toFixed(1), { size: 12, mono: true, color: PR.PAL.ink });
    P.text(472, 270, 'm = ' + ((TARGET_CPI - BASE_CPI) / PENALTY).toFixed(4) + ' = ' + (NEEDED_MISS * 100).toFixed(2) + '%', { size: 12, mono: true, color: PR.PAL.ink });
    P.text(472, 294, 'Substituted back: ' + (BASE_CPI + NEEDED_MISS * PENALTY).toFixed(4) + '. Exact.', { size: 11.5, color: PR.PAL.dim });
    P.alpha(1);

    var a5 = stage(p, 0.78, 0.96);
    P.alpha(a5);
    P.text(28, 350, 'Same equation, one number replaced. A cache does not change the clock or the instruction count;',
           { size: 11.5, color: PR.PAL.dim });
    P.text(28, 370, 'it changes the average cycles per instruction, through the miss rate and the penalty.',
           { size: 11.5, color: PR.PAL.dim });
    P.text(28, 398, 'This is the bridge to the cache lesson: a miss rate is only interesting because of what it does to CPI.',
           { size: 11.5, bold: true, color: PR.PAL.accent });
    P.alpha(1);
  }

  /* ---------------- scene 10: pipeline -------------------------------- */
  function drawPipeline(P, t, p) {
    head(P, 'The pipeline is the same equation', 'Ideal speedup k. Stalls raise the CPI, and the gain is k / (1 + stalls).');

    var x0 = 150, wpx = 620;
    var rows = [
      { l: 'ideal, 5 stages, no stalls', v: K_STAGES, s: 'CPI 1.00', c: PR.PAL.accent },
      { l: '5 stages, 0.2 stall cycles per instruction', v: PIPE_LIMIT, s: 'CPI ' + PIPE_CPI.toFixed(2), c: PR.PAL.warn },
      { l: 'exact count for 1000 instructions', v: PIPE_EXACT, s: PIPE_CYCLES + ' cycles', c: PR.PAL.info }
    ];
    for (var i = 0; i < rows.length; i++) {
      var a = stage(p, 0.04 + i * 0.15, 0.20 + i * 0.15);
      var y = 100 + i * 62;
      P.alpha(a);
      P.text(28, y + 4, rows[i].l, { size: 11, color: PR.PAL.dim });
      P.text(28, y + 20, rows[i].s, { size: 10.5, mono: true, color: PR.PAL.faint });
      hbar(P, x0, y - 2, wpx, 24, rows[i].v / (K_STAGES * 1.05), rows[i].c, 1);
      P.text(x0 + wpx * (rows[i].v / (K_STAGES * 1.05)) + 8, y + 10, rows[i].v.toFixed(2) + '\u00d7',
             { size: 12.5, bold: true, mono: true, color: rows[i].c, base: 'middle' });
      P.alpha(1);
    }

    var a1 = stage(p, 0.52, 0.68);
    P.alpha(a1);
    P.text(28, 296, 'k / (1 + stalls) = ' + K_STAGES + ' / ' + PIPE_CPI.toFixed(2) + ' = ' + PIPE_LIMIT.toFixed(4) +
           '. The exact count is slightly lower, because the pipeline is not yet full.',
           { size: 11.5, mono: true, color: PR.PAL.dim });
    P.alpha(1);

    var a2 = stage(p, 0.70, 0.86);
    P.alpha(a2);
    P.rect(28, 316, W - 56, 62, { fill: PR.PAL.invalidDim, radius: 8 });
    P.text(44, 330, 'Doubling the clock rate while doubling the CPI is exactly no speedup:', { size: 12, bold: true, color: PR.PAL.invalid });
    P.text(44, 352, 'time = count \u00d7 CPI / rate, and (2 \u00d7 CPI) / (2 \u00d7 rate) = CPI / rate. Speedup 1, for twice the frequency.',
           { size: 11.5, mono: true, color: PR.PAL.ink });
    P.alpha(1);

    var a3 = stage(p, 0.88, 0.99);
    P.alpha(a3);
    P.text(28, 402, 'Deeper pipelining buys frequency and spends CPI. That is the trade-off, stated in the three dials.',
           { size: 11.5, color: PR.PAL.dim });
    P.alpha(1);
  }

  /* ---------------- scene 11: procedure ------------------------------- */
  function drawProcedure(P, t, p) {
    head(P, 'The procedure, and the four numbers that get confused', 'Four steps, then two bounds that catch arithmetic slips.');

    var steps = [
      { t: 'Write the three quantities with units', s: 'Frequency is not time. Convert first: period = 1 / rate.' },
      { t: 'Get the average CPI', s: 'Weight the mix by frequency, or divide total cycles by the count. Do both as a check.' },
      { t: 'Multiply, keeping the powers of ten', s: 'A nanosecond is 10\u207b\u2079 s, a millisecond 10\u207b\u00b3 s. Carry the exponent, not the decimal point.' },
      { t: 'Answer the quantity that was asked for', s: 'Time, CPI, MIPS and speedup are four different answers.' }
    ];
    for (var i = 0; i < steps.length; i++) {
      var a = stage(p, 0.03 + i * 0.13, 0.17 + i * 0.13);
      var y = 88 + i * 62;
      P.alpha(a);
      card(P, 28, y, W - 56, 54, { fill: PR.PAL.surface2 });
      P.circle(56, y + 27, 14, { fill: PR.PAL.accent });
      P.text(56, y + 27, String(i + 1), { size: 13, bold: true, color: '#ffffff', align: 'center', base: 'middle' });
      P.text(82, y + 12, steps[i].t, { size: 12.5, bold: true, color: PR.PAL.ink });
      P.text(82, y + 32, steps[i].s, { size: 11, color: PR.PAL.dim });
      P.alpha(1);
    }

    var a5 = stage(p, 0.58, 0.76);
    P.alpha(a5);
    card(P, 28, 344, W - 56, 66, { fill: PR.PAL.warnDim });
    P.text(44, 356, 'Two bounds that catch most slips', { size: 12, bold: true, color: PR.PAL.warn });
    P.text(44, 378, 'A speedup cannot exceed 1/(1\u2212p).  A scalar pipeline cannot have a CPI below 1.',
           { size: 11.5, mono: true, color: PR.PAL.ink });
    P.alpha(1);

    var a6 = stage(p, 0.80, 0.97);
    P.alpha(a6);
    P.text(28, 432, 'Unit and quantity slips lose more marks here than conceptual errors do.', { size: 11.5, color: PR.PAL.dim });
    P.alpha(1);
  }

  /* ---------------- scene 12: summary --------------------------------- */
  function drawSummary(P, t, p) {
    head(P, 'One equation, four consequences', 'Everything on this page is a rearrangement of the product.');

    var a1 = stage(p, 0.03, 0.22);
    P.alpha(a1);
    P.text(28, 92, 'time = instruction count \u00d7 CPI \u00d7 clock cycle time', { size: 16, bold: true, mono: true, color: PR.PAL.ink });
    P.text(28, 116, 'Here: 1 000 000 \u00d7 1.95 \u00d7 0.5 ns = 0.975 ms', { size: 12, mono: true, color: PR.PAL.dim });
    P.alpha(1);

    var a2 = stage(p, 0.24, 0.42);
    P.alpha(a2);
    P.line(28, 134, W - 28, 134, { stroke: PR.PAL.border, sw: 1 });
    P.text(28, 148, 'speedup = old time / new time', { size: 15, bold: true, mono: true, color: PR.PAL.accent });
    P.text(28, 170, 'A 20% faster machine keeps 0.8333 of the time. A machine with 20% less time is 1.25\u00d7 faster.', { size: 11.5, color: PR.PAL.dim });
    P.alpha(1);

    var a3 = stage(p, 0.44, 0.62);
    P.alpha(a3);
    P.line(28, 188, W - 28, 188, { stroke: PR.PAL.border, sw: 1 });
    P.text(28, 202, 'Amdahl: 1 / ((1 \u2212 p) + p/s), ceiling 1/(1 \u2212 p)', { size: 15, bold: true, mono: true, color: PR.PAL.warn });
    P.text(28, 224, 'With p = 0.6 and s = 4 the speedup is 1.818, and no improvement exceeds 2.5.', { size: 11.5, color: PR.PAL.dim });
    P.alpha(1);

    var a4 = stage(p, 0.64, 0.82);
    P.alpha(a4);
    P.line(28, 242, W - 28, 242, { stroke: PR.PAL.border, sw: 1 });
    P.text(28, 256, 'MIPS is throughput, not speed', { size: 15, bold: true, mono: true, color: PR.PAL.info });
    P.text(28, 278, 'Valid only for the same program, ISA and compiler. Here ' + MIPS_B.toFixed(0) + ' MIPS lost to ' + MIPS_A.toFixed(0) + '.',
           { size: 11.5, color: PR.PAL.dim });
    P.alpha(1);

    var a5 = stage(p, 0.84, 0.99);
    P.alpha(a5);
    P.rect(28, 304, W - 56, 96, { fill: PR.PAL.accentDim, radius: 8 });
    P.text(44, 320, 'Every remaining topic in this subject is an argument about which dial it moves.', { size: 12.5, bold: true, color: PR.PAL.accent });
    P.text(44, 344, 'A cache lowers CPI through the miss rate. A pipeline lowers CPI or raises the clock, and spends CPI doing it.', { size: 11.5, color: PR.PAL.dim });
    P.text(44, 364, 'A compiler changes the instruction count and the CPI together. None of them moves one dial alone.', { size: 11.5, color: PR.PAL.dim });
    P.text(44, 386, 'That is why the equation is worth memorising: it is the question every other lesson answers.', { size: 11.5, bold: true, color: PR.PAL.accent });
    P.alpha(1);
  }

  /* ---------------- dispatch ------------------------------------------ */
  var SCENES = {
    equation: drawEquation,
    clock: drawClock,
    mix: drawMix,
    machines: drawMachines,
    mips: drawMips,
    speedup: drawSpeedup,
    amdahl: drawAmdahl,
    reverse: drawReverse,
    stalls: drawStalls,
    pipeline: drawPipeline,
    procedure: drawProcedure,
    summary: drawSummary
  };

  function drawFrame(P) {
    if (!P) return;
    P.clear();
    var st = K.state;
    var tl = window.LESSON_TIMELINE;
    var t = st.elapsed;
    var idx = 0;
    for (var i = tl.scenes.length - 1; i >= 0; i--) {
      if (t >= tl.scenes[i].start - 1e-6) { idx = i; break; }
    }
    var sc = tl.scenes[idx];
    var p = K.clamp01((t - sc.start) / Math.max(0.001, sc.end - sc.start));
    var fn = SCENES[sc.id];
    if (fn) fn(P, t, p);
  }

  /* ======================================================================
     boot
     ====================================================================== */

  function reportChecks() {
    var el = document.getElementById('checks');
    if (!el) return;
    var bad = CHECKS.length - PASSED;
    el.innerHTML = '<span class="k">Model checks</span>' +
      '<p class="small" style="margin:6px 0 0">' + PASSED + ' of ' + CHECKS.length + ' passed' +
      (bad ? ' <span style="color:var(--invalid)">(' + bad + ' failed)</span>' : '') + '</p>';
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
            drawFrame(P);
          };
          sk.draw = function () { if (P) drawFrame(P); };
        });
        K.onResize(function () {
          var wrap = holder;
          if (!wrap) return;
          var scale = Math.min(1, wrap.clientWidth / W);
          var cv = wrap.querySelector('canvas');
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
    MIX: MIX,
    CPI_A: CPI_A, CYCLES_A: CYCLES_A, TA: TA,
    IC_B: IC_B, CPI_B: CPI_B, CYCLES_B: CYCLES_B, TB: TB,
    MIPS_A: MIPS_A, MIPS_B: MIPS_B, FASTER: FASTER,
    MIPS_INT: MIPS_INT, MIPS_FP: MIPS_FP,
    MIPS_ARITH: MIPS_ARITH, MIPS_HARM: MIPS_HARM, MIPS_AGG: MIPS_AGG,
    TIME_FRAC: TIME_FRAC, TIME_CUT: TIME_CUT, SPEED_FROM_CUT: SPEED_FROM_CUT,
    AM_SPEEDUP: AM_SPEEDUP, AM_TIME_FRAC: AM_TIME_FRAC, AM_CEIL: AM_CEIL,
    REV_S: REV_S, IMP_S: IMP_S,
    STALL_CPI: STALL_CPI, REAL_CPI: REAL_CPI, T_REAL: T_REAL, T_PERFECT: T_PERFECT,
    CACHE_SPEEDUP: CACHE_SPEEDUP, NEEDED_MISS: NEEDED_MISS,
    PIPE_LIMIT: PIPE_LIMIT, PIPE_EXACT: PIPE_EXACT,
    PASSED: PASSED,
    TOTAL: CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
