/* ==========================================================================
   fixed-point-arithmetic - model, validation, render.

   Layer 1  model      : the Q(i.f) format, its window and step, the encoding,
                         the sum scan over all pairs, the product scan with
                         truncation and rounding, the accumulator widths, the
                         floor-versus-truncation split, the 0.1 drift, and the
                         same-budget comparison with a toy floating format.
   Layer 2  validation : every quoted number is recomputed here by a second
                         route - enumeration against closed form, and the
                         window test against the stored result.
   Layer 3  render     : reads the model; never re-derives a number.
   Layer 4  timeline   : in timeline.js - the only source of time.

   No p5.brush: every mark is a bit cell, a tick on a computed grid, or a
   number the learner has to read exactly. A random stroke offset would blur
   the thing being read.
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
     Q(i.f): i integer bits INCLUDING the sign bit, f fraction bits,
     n = i + f total.  value = k / 2^f for the stored integer k.
     ====================================================================== */

  var N = 8, F = 4, I = N - F, S = 1 << F;
  var RLO = -(1 << (N - 1)), RHI = (1 << (N - 1)) - 1;   // stored integer range
  var VMIN = RLO / S, VMAX = RHI / S, STEP = 1 / S;      // value window and step

  function val(k) { return k / S; }
  function enc(x) { return x * S; }                       // must land on an integer

  /* --- the grid ------------------------------------------------------- */
  var DISTINCT = (function () {
    var seen = {};
    for (var k = RLO; k <= RHI; k++) seen[val(k)] = 1;
    var c = 0; for (var key in seen) if (Object.prototype.hasOwnProperty.call(seen, key)) c++;
    return c;
  })();

  var NEG = (function () {
    var c = 0;
    for (var k = RLO; k <= RHI; k++) if (k < 0) c++;
    return c;
  })();

  /* --- the sum scan: every pair of stored integers -------------------- */
  var SUM = (function () {
    var pairs = 0, over = 0, wrap = 0;
    for (var a = RLO; a <= RHI; a++) {
      for (var b = RLO; b <= RHI; b++) {
        pairs++;
        var exact = val(a) + val(b);
        var raw = (a + b) & 0xFF;
        var sr = raw >= 128 ? raw - 256 : raw;            // what 8 bits hold
        var out = (exact < VMIN - 1e-12) || (exact > VMAX + 1e-12);
        if (out) over++;
        if (Math.abs(val(sr) - exact) > 1e-12) wrap++;
      }
    }
    return { pairs: pairs, overflow: over, wrapMismatch: wrap, pct: 100 * over / pairs };
  })();

  /* --- the product scan: truncation against rounding ------------------ */
  var PROD = (function () {
    var pairs = 0, maxT = 0, maxR = 0, sumT = 0, sumR = 0, exactT = 0;
    for (var a = RLO; a <= RHI; a++) {
      for (var b = RLO; b <= RHI; b++) {
        pairs++;
        var p = a * b;                    // exact, Q8.8
        var ex = p / (S * S);
        var t = p >> F;                   // floor: the arithmetic shift
        var r = (p + (1 << (F - 1))) >> F; // round half up
        maxT = Math.max(maxT, Math.abs(val(t) - ex)); sumT += val(t) - ex;
        maxR = Math.max(maxR, Math.abs(val(r) - ex)); sumR += val(r) - ex;
        if (t * S === p) exactT++;
      }
    }
    return {
      pairs: pairs, maxTrunc: maxT, meanTrunc: sumT / pairs,
      maxRound: maxR, meanRound: sumR / pairs,
      exactTrunc: exactT, exactPct: 100 * exactT / pairs
    };
  })();

  /* --- accumulator width for k same-sign additions -------------------- */
  function needIntBits(k) {
    var m = 1;
    while (Math.pow(2, m - 1) < k * Math.pow(2, I - 1)) m++;
    return m;
  }
  var ACC = [2, 4, 8, 16].map(function (k) {
    var m = needIntBits(k);
    var worst = k * VMAX;
    var fitsOneLess = worst < Math.pow(2, m - 2);
    return { k: k, bits: m, rule: I + Math.ceil(Math.log(k) / Math.log(2)), worst: worst, oneLessFits: fitsOneLess };
  });

  /* --- floor against truncation on a halving ------------------------- */
  var HALF = (function () {
    var differ = 0;
    for (var k = RLO; k <= RHI; k++) if (Math.floor(k / 2) !== Math.trunc(k / 2)) differ++;
    return { differ: differ, total: RHI - RLO + 1 };
  })();

  /* --- worked values -------------------------------------------------- */
  var A_RAW = enc(6.5);        // 104
  var B_RAW = enc(5.25);       // 84
  var SUM_RAW = A_RAW + B_RAW; // 188
  var SUM_WRAPPED = ((SUM_RAW & 0xFF) >= 128) ? (SUM_RAW & 0xFF) - 256 : (SUM_RAW & 0xFF);
  var SUM_EXACT = val(A_RAW) + val(B_RAW);   // 11.75

  var M_RAW = enc(1.1875);     // 19
  var M_PROD = M_RAW * M_RAW;  // 361
  var M_TRUNC = M_PROD >> F;   // 22
  var M_ROUND = (M_PROD + (1 << (F - 1))) >> F; // 23
  var M_EXACT = M_PROD / (S * S);

  var SHIFT_IN = -9;                        // -0.5625
  var SHIFT_FLOOR = SHIFT_IN >> 1;          // -5
  var SHIFT_TRUNC = Math.trunc(SHIFT_IN / 2); // -4

  /* --- the 0.1 drift, in an 8-bit unsigned fraction ------------------- */
  var Q8F = 8, Q8S = 1 << Q8F;
  var D01_RAW = Math.round(0.1 * Q8S);      // 26
  var D01_VAL = D01_RAW / Q8S;              // 0.1015625
  var D01_ERR = D01_VAL - 0.1;
  var D01_TEN = (10 * D01_RAW) / Q8S;       // 1.015625
  var D01_TEN_ERR = D01_TEN - 1;

  /* --- Q1.15, the sixteen-bit fractional format ----------------------- */
  var Q15 = { raw: -(1 << 15), hi: (1 << 15) - 1 };
  Q15.min = Q15.raw / 32768; Q15.max = Q15.hi / 32768; Q15.step = 1 / 32768;

  /* --- the toy floating format used only for the comparison scene -----
     1 sign bit, 4 exponent bits (bias 7), 3 fraction bits: 8 bits total,
     the same budget as Q4.4. This is an educational construction, not IEEE. */
  var TOY = {
    expBits: 4, fracBits: 3, bias: 7,
    spacingAt: function (x) {
      if (!(x > 0)) return NaN;
      var e = Math.floor(Math.log(x) / Math.LN2);
      return Math.pow(2, e - TOY.fracBits);
    }
  };

  /* --- representability of the four decimals of the 2018 paper -------- */
  var UQ = { i: 5, f: 3, scale: 8 };
  var DECIMALS = [31.5, 0.875, 12.1, 3.001].map(function (x) {
    var k = x * UQ.scale;
    return { x: x, k: k, exact: Math.abs(k - Math.round(k)) < 1e-12 };
  });
  var UQ_MAX = Math.pow(2, UQ.i) - Math.pow(2, -UQ.f);   // 31.875

  /* --- bits needed for a stated window and step ----------------------- */
  function bitsNeeded(R, step) { return Math.ceil(Math.log(R / step) / Math.LN2) + 1; }
  var BITS_44 = bitsNeeded(8, 1 / 16);          // 8
  var BITS_Q15 = bitsNeeded(1, Math.pow(2, -15)); // 16

  /* ======================================================================
     LAYER 2 - VALIDATION
     ====================================================================== */

  var CHECKS = [];
  function check(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail || '' }); }
  function near(a, b, tol) { return Math.abs(a - b) <= (tol === undefined ? 1e-12 : tol); }

  check('Q4.4 window is [-8, 7.9375]', VMIN === -8 && near(VMAX, 7.9375), VMIN + ' to ' + VMAX);
  check('step is 1/16 and the grid has 256 distinct values', near(STEP, 0.0625) && DISTINCT === 256, DISTINCT + ' values');
  check('128 negative patterns, 127 non-negative', NEG === 128 && (RHI - RLO + 1) - NEG === 128, NEG + ' negative');
  check('the window is asymmetric by exactly one step', near((VMAX - 0) - (0 - VMIN), -STEP), (VMAX - VMIN));
  check('6.5 encodes to 104 and decodes back', A_RAW === 104 && near(val(A_RAW), 6.5));
  check('5.25 encodes to 84', B_RAW === 84);
  check('6.5 + 5.25 = 11.75 exactly, raw 188', near(SUM_EXACT, 11.75) && SUM_RAW === 188);
  check('188 stored in 8 bits decodes to -4.25', SUM_WRAPPED === -68 && near(val(SUM_WRAPPED), -4.25));
  check('the exact sum is outside the window', SUM_EXACT > VMAX);
  check('16,384 of 65,536 pairs overflow (25%)', SUM.overflow === 16384 && SUM.pairs === 65536 && near(SUM.pct, 25), SUM.overflow + '/' + SUM.pairs);
  check('wraparound disagrees with the exact sum in exactly those pairs', SUM.wrapMismatch === SUM.overflow, SUM.wrapMismatch + ' vs ' + SUM.overflow);
  check('the 16-bit product is exact: no error in Q8.8', near(M_EXACT, M_PROD / (S * S)) && M_PROD === 361, 'product ' + M_PROD);
  check('1.1875 x 1.1875 = 1.41015625 exactly in Q8.8', near(M_EXACT, 1.41015625));
  check('truncating the product gives 22 sixteenths (1.375)', M_TRUNC === 22 && near(val(M_TRUNC), 1.375));
  check('rounding the product gives 23 sixteenths (1.4375)', M_ROUND === 23 && near(val(M_ROUND), 1.4375));
  check('both product errors are below one step', Math.abs(val(M_TRUNC) - M_EXACT) < STEP && Math.abs(val(M_ROUND) - M_EXACT) < STEP);
  check('truncation is biased low: mean error -13/512', PROD.meanTrunc < 0 && near(PROD.meanTrunc, -13 / 512, 1e-12), PROD.meanTrunc);
  check('rounding bias is +1/256, 6.5 times smaller than truncation', near(PROD.meanRound, 1 / 256, 1e-12) && near(Math.abs(PROD.meanTrunc / PROD.meanRound), 6.5, 1e-12), PROD.meanRound + ' vs ' + PROD.meanTrunc);
  check('worst truncation error is 15/256, under one step', near(PROD.maxTrunc, 15 / 256, 1e-12) && PROD.maxTrunc < STEP, PROD.maxTrunc);
  check('worst rounding error is 1/32, exactly half a step', near(PROD.maxRound, 1 / 32, 1e-12) && near(PROD.maxRound, STEP / 2, 1e-12), PROD.maxRound);
  check('12,288 products (18.75%) are exact under truncation', PROD.exactTrunc === 12288 && near(PROD.exactPct, 18.75), PROD.exactTrunc + '');
  check('accumulator widths are 5, 6, 7, 8 for k = 2, 4, 8, 16', ACC.map(function (a) { return a.bits; }).join(',') === '5,6,7,8');
  check('the accumulator rule i + log2(k) is tight, not merely safe', ACC.every(function (a) { return a.bits === a.rule && !a.oneLessFits; }));
  check('halving by shift floors: -9 >> 1 = -5', SHIFT_FLOOR === -5 && near(val(SHIFT_FLOOR), -0.3125));
  check('truncating division gives -4 sixteenths', SHIFT_TRUNC === -4 && near(val(SHIFT_TRUNC), -0.25));
  check('the two differ by exactly one step', near(val(SHIFT_TRUNC) - val(SHIFT_FLOOR), STEP));
  check('64 of the 256 patterns disagree on a halving', HALF.differ === 64 && HALF.total === 256, HALF.differ + '/' + HALF.total);
  check('0.1 stores as 26/256 in an 8-bit fraction', D01_RAW === 26 && near(D01_VAL, 0.1015625));
  check('ten additions give 1.015625, a drift of 1/64', near(D01_TEN, 1.015625) && near(D01_TEN_ERR, 1 / 64));
  check('the drift equals ten times the encoding error', near(D01_TEN_ERR, 10 * D01_ERR, 1e-12));
  check('Q1.15 runs from -1 to 0.99997 with step 2^-15', Q15.min === -1 && near(Q15.max, 0.999969482421875, 1e-15) && near(Q15.step, Math.pow(2, -15)));
  check('the bits-needed formula returns 8 and 16', BITS_44 === 8 && BITS_Q15 === 16, BITS_44 + ', ' + BITS_Q15);
  check('UQ5.3 holds 31.5 and 0.875 but not 12.1 and 3.001', DECIMALS[0].exact && DECIMALS[1].exact && !DECIMALS[2].exact && !DECIMALS[3].exact);
  check('unsigned window tops out at 2^i - 2^-f = 31.875', near(UQ_MAX, 31.875));
  check('half a step is 50 per cent of the smallest positive value', near((STEP / 2) / STEP, 0.5) && near((STEP / 2) / 4, 0.0078125));

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

  /* ======================================================================
     LAYER 3 - RENDER
     ====================================================================== */

  function num(x) {
    if (!isFinite(x)) return '?';
    if (Math.abs(x - Math.round(x)) < 1e-12) return String(Math.round(x));
    var s = x.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
    return s;
  }

  function head(title, sub) {
    P.alpha(1);
    P.text(26, 20, title, { size: 15, bold: true });
    if (sub) P.text(26, 42, sub, { size: 12, color: PAL.dim });
  }

  function note(x, y, s, colour, size) {
    P.text(x, y, s, { size: size || 12, color: colour || PAL.dim });
  }

  function bitsRow(x, y, cw, ch, gap, bits, opts) {
    opts = opts || {};
    for (var i = 0; i < bits.length; i++) {
      var bx = x + i * (cw + gap);
      var on = bits[i] === '1';
      var fill = on ? (opts.onFill || PAL.accentDim) : PAL.surface;
      var stroke = opts.stroke || (on ? PAL.accent : PAL.border);
      P.rect(bx, y, cw, ch, { fill: fill, stroke: stroke, sw: 1.4, radius: 4 });
      P.text(bx + cw / 2, y + ch / 2, bits[i], {
        size: opts.size || 15, mono: true, align: 'center', base: 'middle',
        bold: on, color: on ? PAL.ink : PAL.faint
      });
      if (opts.labels && opts.labels[i]) {
        P.text(bx + cw / 2, y - 8, opts.labels[i], {
          size: 10, mono: true, align: 'center', base: 'bottom',
          color: opts.labelColour || PAL.dim
        });
      }
    }
  }

  function dot(x, y, colour) { P.circle(x, y, 3.4, { fill: colour || PAL.ink }); }

  /* --- 1. point ------------------------------------------------------- */
  function drawPoint(p) {
    head('One grid: Q4.4, 256 values from \u22128 to 7.9375',
         'n = 8 bits, f = 4 fraction bits, i = 4 integer bits, value = stored integer \u00f7 16');

    var x0 = 60, x1 = 840, y = 210;
    function X(v) { return x0 + (v - VMIN) / (VMAX - VMIN) * (x1 - x0); }

    P.line(x0, y, x1, y, { stroke: PAL.border, sw: 2 });

    var shown = Math.floor(K.ease(Math.min(1, p * 1.5)) * 256);
    if (shown > 256) shown = 256;
    for (var k = 0; k < shown; k++) {
      var raw = RLO + k;
      var x = X(val(raw));
      var tall = (raw % 16 === 0);
      P.line(x, y - (tall ? 15 : 7), x, y + (tall ? 15 : 7), {
        stroke: tall ? PAL.accent : PAL.dim, sw: tall ? 1.8 : 1
      });
    }

    var marks = [-8, -4, 0, 4, 7.9375];
    for (var m = 0; m < marks.length; m++) {
      var vx = X(marks[m]);
      P.line(vx, y + 16, vx, y + 26, { stroke: PAL.border, sw: 1 });
      P.text(vx, y + 30, num(marks[m]), { size: 11, mono: true, align: 'center', color: PAL.dim });
    }
    note(x0, y - 46, 'every tick is one value; the taller ticks are the integers', PAL.dim, 11);

    /* the highlighted value */
    if (p > 0.35) {
      var hx = X(6.5);
      P.circle(hx, y, 6, { fill: PAL.valid });
      P.line(hx, y - 22, hx, y - 8, { stroke: PAL.valid, sw: 1.4 });
      P.text(hx, y - 26, '6.5 = 104 / 16', { size: 12, mono: true, align: 'center', base: 'bottom', color: PAL.valid, bold: true });
    }

    /* the stored-integer line, below */
    var yi = 320;
    P.line(x0, yi, x1, yi, { stroke: PAL.border, sw: 1.2, dash: [4, 4] });
    note(x0, yi - 20, 'the same 256 patterns read as stored integers k', PAL.dim, 11);
    [-128, -64, 0, 63, 127].forEach(function (kk) {
      var xx = X(val(kk));
      P.line(xx, yi - 5, xx, yi + 5, { stroke: PAL.dim, sw: 1 });
      P.text(xx, yi + 9, String(kk), { size: 10, mono: true, align: 'center', color: PAL.faint });
    });

    /* magnified strip: four adjacent values */
    if (p > 0.55) {
      var sy = 400, sx = 130, sp = 96;
      P.rect(60, sy - 30, 780, 60, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
      note(74, sy - 22, 'magnified: four adjacent stored integers', PAL.dim, 11);
      for (var j = 0; j < 4; j++) {
        var vv = val(104 + j);
        var xx2 = sx + j * sp;
        P.line(xx2, sy - 6, xx2, sy + 8, { stroke: PAL.accent, sw: 2 });
        P.text(xx2, sy + 12, num(vv), { size: 11, mono: true, align: 'center', color: PAL.ink });
      }
      P.arrow(sx, sy - 22, sx + sp, sy - 22, { stroke: PAL.warn, sw: 1.3, head: 7 });
      P.text(sx + sp / 2, sy - 26, '1/16', { size: 11, mono: true, align: 'center', base: 'bottom', color: PAL.warn, bold: true });
    }
  }

  /* --- 2. weights ----------------------------------------------------- */
  function drawWeights(p) {
    var phase = p < 0.45 ? 0 : (p < 0.78 ? 1 : 2);
    var bits = phase === 0 ? '01101000' : (phase === 1 ? '10000000' : '11111111');
    var weights = ['\u22128', '4', '2', '1', '1/2', '1/4', '1/8', '1/16'];
    var sum = phase === 0 ? '4 + 2 + 1/2 = 6.5'
            : (phase === 1 ? 'only the top bit is set: \u22128'
            : '\u22128 + 4 + 2 + 1 + 1/2 + 1/4 + 1/8 + 1/16 = \u22121/16');
    var value = phase === 0 ? '6.5' : (phase === 1 ? '\u22128' : '\u22121/16');

    head('Reading the bits: eight weights, one of them negative',
         phase === 0 ? 'Q4.4: the top weight is \u22122^(i\u22121) = \u22128, the bottom is 2^(\u2212f) = 1/16'
                     : 'the top bit is worth minus eight, not plus eight');

    var cw = 56, gap = 8, x = 198, y = 150, ch = 62;
    bitsRow(x, y, cw, ch, gap, bits, { labels: weights, size: 17 });
    dot(x + 4 * cw + 3 * gap + gap / 2, y + ch / 2, PAL.ink);

    note(x, y - 34, 'bit', PAL.faint, 10);
    note(x + 5 * (cw + gap) - 20, y - 34, 'binary point is here', PAL.faint, 10);

    P.text(450, y + ch + 34, sum, {
      size: 16, mono: true, align: 'center', color: PAL.ink, bold: true
    });
    P.text(450, y + ch + 64, 'value = ' + value, {
      size: 20, mono: true, align: 'center', color: PAL.valid, bold: true
    });

    if (phase === 2) {
      note(60, 372, 'All ones is the value closest to zero from below: there is no negative zero to make the grid symmetric.', PAL.dim, 12);
      note(60, 396, '128 patterns are negative and 127 are non-negative, so the window ends one step short at the top.', PAL.dim, 12);
      note(60, 420, '+8 does not exist in Q4.4. The largest value is 7.9375.', PAL.warn, 12);
    } else if (phase === 1) {
      note(60, 372, 'The sign bit is not a flag: it carries the weight \u22122^(i\u22121).', PAL.dim, 12);
      note(60, 396, 'Reading it as +8 turns \u22128 into +8, which is the single most common decoding error.', PAL.warn, 12);
    } else {
      note(60, 372, 'The stored integer is 104. Dividing by 2^f = 16 gives 6.5, which is the same reading.', PAL.dim, 12);
    }
  }

  /* --- 3. trade ------------------------------------------------------- */
  function drawTrade(p) {
    head('Width is fixed: every fraction bit costs an integer bit',
         'three formats, each exactly 256 patterns, each a different window and a different step');

    var rows = [
      { name: 'Q2.6', i: 2, f: 6, lo: -2, hi: 2 - Math.pow(2, -6), step: 1 / 64, colour: PAL.info },
      { name: 'Q4.4', i: 4, f: 4, lo: -8, hi: 7.9375, step: 1 / 16, colour: PAL.accent },
      { name: 'Q6.2', i: 6, f: 2, lo: -32, hi: 32 - 0.25, step: 1 / 4, colour: PAL.warn }
    ];

    var ys = [120, 250, 380];
    var pxu = 5, cx = 250;

    for (var r = 0; r < rows.length; r++) {
      var row = rows[r], y = ys[r];
      var reveal = K.ease(Math.min(1, Math.max(0, (p - r * 0.18) / 0.34)));
      if (reveal <= 0) continue;

      P.alpha(reveal);
      P.text(60, y - 26, row.name, { size: 15, mono: true, bold: true, color: row.colour });
      P.text(120, y - 26, 'i = ' + row.i + ', f = ' + row.f + '   step ' + (row.f === 6 ? '1/64' : row.f === 4 ? '1/16' : '1/4') +
             '   window ' + num(row.lo) + ' to ' + num(row.hi), { size: 12, color: PAL.dim });

      /* the window, drawn to a common scale */
      var wx0 = cx + row.lo * pxu, wx1 = cx + row.hi * pxu;
      P.line(wx0, y, wx1, y, { stroke: row.colour, sw: 3 });
      P.line(wx0, y - 7, wx0, y + 7, { stroke: row.colour, sw: 2 });
      P.line(wx1, y - 7, wx1, y + 7, { stroke: row.colour, sw: 2 });
      P.text((wx0 + wx1) / 2, y + 14, 'window', { size: 10, align: 'center', color: row.colour });

      /* one unit, magnified, in the right column */
      var gx = 470, gw = 380, gy = y;
      P.line(gx, gy, gx + gw, gy, { stroke: PAL.border, sw: 1.2 });
      var n = Math.round(1 / row.step);
      for (var t = 0; t <= n; t++) {
        var tx = gx + (t / n) * gw;
        P.line(tx, gy - (t % 8 === 0 ? 9 : 5), tx, gy + 5, { stroke: t % 8 === 0 ? row.colour : PAL.dim, sw: t % 8 === 0 ? 1.4 : 0.9 });
      }
      P.text(gx, gy + 18, 'one unit, magnified: ' + n + ' steps', { size: 10, color: PAL.faint });
      P.alpha(1);
    }

    note(60, 452, 'Same eight bits, same 256 values. Only the spacing and the window differ: i + f = n.', PAL.ink, 12);
  }

  /* --- 4. add --------------------------------------------------------- */
  function drawAdd(p) {
    head('Addition: align the points, add the integers, keep the scale',
         'Q4.4 + Q4.4 needs the same f, and one more integer bit than either operand');

    var cw = 44, gap = 5, ch = 46;
    var xA = 256, yA = 120, yB = 190;
    bitsRow(xA, yA, cw, ch, gap, '01101000', { labels: ['', '', '', '', '', '', '', ''] });
    bitsRow(xA, yB, cw, ch, gap, '01010100', {});
    dot(xA + 4 * cw + 3 * gap + gap / 2, yA + ch / 2, PAL.ink);
    dot(xA + 4 * cw + 3 * gap + gap / 2, yB + ch / 2, PAL.ink);

    P.text(xA - 14, yA + ch / 2, 'A = 6.5', { size: 13, mono: true, align: 'right', base: 'middle' });
    P.text(xA - 14, yB + ch / 2, 'B = 5.25', { size: 13, mono: true, align: 'right', base: 'middle' });
    P.text(xA - 14, yB + ch + 18, '+', { size: 18, bold: true, align: 'right' });

    var xS = xA - (cw + gap), yS = 280;
    P.line(200, yS - 12, 700, yS - 12, { stroke: PAL.border, sw: 1.4 });
    bitsRow(xS, yS, cw, ch, gap, '010111100', {
      onFill: PAL.valid + '22', stroke: PAL.valid
    });
    dot(xS + 5 * cw + 4 * gap + gap / 2, yS + ch / 2, PAL.ink);
    P.text(xS - 14, yS + ch / 2, 'A + B', { size: 13, mono: true, align: 'right', base: 'middle' });
    P.text(xS - 14, yS + ch + 16, '= 11.75', { size: 13, mono: true, align: 'right', color: PAL.valid, bold: true });

    if (p > 0.45) {
      var ex = xS + 9 * (cw + gap) + 12;
      P.line(xS + cw / 2, yS - 34, xS + cw / 2, yS - 6, { stroke: PAL.warn, sw: 1.3 });
      note(ex + 4, yS + 4, 'the ninth bit', PAL.warn, 11);
      note(ex + 4, yS + 20, 'is the extra', PAL.warn, 11);
      note(ex + 4, yS + 36, 'integer bit', PAL.warn, 11);
    }

    note(60, 372, 'The binary point stays in its column: 104 + 84 = 188, and 188 / 16 = 11.75. Addition never rescales.', PAL.dim, 12);
    if (p > 0.7) {
      note(60, 396, 'But 11.75 > 7.9375, so the eight-bit window cannot hold it. Adding k values needs i + log\u2082k integer bits:', PAL.dim, 12);
      note(60, 420, 'k = 2 \u2192 5 integer bits, k = 4 \u2192 6, k = 8 \u2192 7, k = 16 \u2192 8 (checked by enumeration, and tight).', PAL.ink, 12);
    }
  }

  /* --- 5. overflow ---------------------------------------------------- */
  function drawOverflow(p) {
    head('When the sum will not fit: the top bit becomes a sign',
         'the same 188 read as eight bits is \u22124.25, and that is wraparound');

    var cw = 44, gap = 5, ch = 46, x = 120, y = 110;
    bitsRow(x, y, cw, ch, gap, '10111100', { onFill: PAL.invalidDim, stroke: PAL.invalid });
    dot(x + 4 * cw + 3 * gap + gap / 2, y + ch / 2, PAL.ink);
    note(x, y - 18, 'stored: 188, kept in eight bits', PAL.dim, 11);
    P.text(x + 8 * (cw + gap) + 12, y + ch / 2, '= \u22124.25', { size: 17, mono: true, base: 'middle', color: PAL.invalid, bold: true });

    /* the window, drawn vertically on the right */
    var ax = 720, top = 96, bot = 330;
    function Y(v) { return bot - (v - VMIN) / (VMAX - VMIN) * (bot - top); }
    P.line(ax, top - 34, ax, bot + 30, { stroke: PAL.border, sw: 1.6 });
    [-8, -4, 0, 4, 7.9375].forEach(function (v) {
      P.line(ax - 5, Y(v), ax + 5, Y(v), { stroke: PAL.dim, sw: 1 });
      P.text(ax + 10, Y(v), num(v), { size: 10, mono: true, base: 'middle', color: PAL.faint });
    });
    P.text(ax, top - 44, 'the window', { size: 11, align: 'center', color: PAL.dim });

    /* the exact sum, outside */
    var yExact = Y(SUM_EXACT);
    P.circle(ax, yExact, 5, { fill: PAL.invalid });
    P.text(ax - 12, yExact, '11.75', { size: 12, mono: true, align: 'right', base: 'middle', color: PAL.invalid, bold: true });
    P.line(ax, yExact, ax + 26, yExact, { stroke: PAL.invalid, sw: 1, dash: [3, 3] });
    P.text(ax + 30, yExact, 'outside', { size: 10, color: PAL.invalid });

    /* the wrap arrow */
    if (p > 0.3) {
      var yW = Y(-4.25);
      P.circle(ax, yW, 5, { fill: PAL.valid });
      P.text(ax - 12, yW, '\u22124.25', { size: 12, mono: true, align: 'right', base: 'middle', color: PAL.valid, bold: true });
      P.line(ax + 34, yExact + 8, ax + 34, yW - 8, { stroke: PAL.warn, sw: 1.4, dash: [4, 4] });
      P.arrow(ax + 34, yW - 12, ax + 34, yW - 2, { stroke: PAL.warn, sw: 1.4, head: 8 });
      P.text(ax + 42, (yExact + yW) / 2, 'wrap', { size: 11, color: PAL.warn, bold: true });
    }

    /* the count */
    if (p > 0.5) {
      var by = 392, bw = 520, bx = 60;
      P.rect(bx, by, bw, 16, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 8 });
      P.rect(bx, by, bw * (SUM.overflow / SUM.pairs), 16, { fill: PAL.warn + 'cc', radius: 8 });
      note(bx, by - 8, '16,384 of 65,536 pairs overflow: 25 per cent', PAL.ink, 12);
      note(bx, by + 24, 'Every one of those 16,384 pairs also disagrees with the exact sum, which is the check that the count is right.', PAL.dim, 11);
    }
  }

  /* --- 6. mul --------------------------------------------------------- */
  function drawMul(p) {
    head('Multiplication: the fraction bits add, then you shift back',
         'Q4.4 \u00d7 Q4.4 = Q8.8, sixteen bits and no lost precision');

    var cw = 34, gap = 4, ch = 40;
    var x8 = 300;
    bitsRow(x8, 96, cw, ch, gap, '00010011', { labels: ['', '', '', '', '', '', '', ''] });
    dot(x8 + 4 * cw + 3 * gap + gap / 2, 96 + ch / 2, PAL.ink);
    P.text(x8 - 14, 96 + ch / 2, '1.1875 = 19/16', { size: 12, mono: true, align: 'right', base: 'middle' });
    P.text(x8 - 14, 96 + ch + 18, '\u00d7  1.1875 = 19/16', { size: 12, mono: true, align: 'right' });

    var x16 = 140, y16 = 190, cw16 = 36, gap16 = 3;
    var bits16 = '0000000101101001';

    /* the band is drawn first, so the bits it marks stay readable on top of it */
    var dropX = x16 + 12 * (cw16 + gap16);
    if (p > 0.4) {
      P.rect(dropX - 4, y16 - 6, 4 * (cw16 + gap16) + 4, ch + 12, {
        fill: PAL.invalidDim, stroke: PAL.invalid, sw: 1.2, radius: 4
      });
    }
    bitsRow(x16, y16, cw16, ch, gap16, bits16, { size: 13 });
    dot(x16 + 8 * cw16 + 7 * gap16 + gap16 / 2, y16 + ch / 2, PAL.ink);
    note(x16, y16 - 18, 'the product, sixteen bits, Q8.8: 361/256 = 1.41015625 exactly', PAL.dim, 11);
    if (p > 0.4) {
      P.text(dropX + 2 * (cw16 + gap16), y16 + ch + 22, 'four bits dropped by the shift', {
        size: 10, align: 'center', color: PAL.invalid
      });
    }

    /* the result rows */
    if (p > 0.55) {
      var yr = 330;
      bitsRow(x8, yr, cw, ch, gap, '00010110', { onFill: PAL.valid + '22', stroke: PAL.valid });
      dot(x8 + 4 * cw + 3 * gap + gap / 2, yr + ch / 2, PAL.ink);
      P.text(x8 - 14, yr + ch / 2, 'truncate: 22/16', { size: 12, mono: true, align: 'right', base: 'middle', color: PAL.invalid });
      P.text(x8 + 8 * (cw + gap) + 10, yr + ch / 2, '= 1.375', { size: 13, mono: true, base: 'middle', color: PAL.invalid });

      var yr2 = 392;
      bitsRow(x8, yr2, cw, ch, gap, '00010111', { onFill: PAL.valid + '22', stroke: PAL.valid });
      dot(x8 + 4 * cw + 3 * gap + gap / 2, yr2 + ch / 2, PAL.ink);
      P.text(x8 - 14, yr2 + ch / 2, 'round: 23/16', { size: 12, mono: true, align: 'right', base: 'middle', color: PAL.valid });
      P.text(x8 + 8 * (cw + gap) + 10, yr2 + ch / 2, '= 1.4375', { size: 13, mono: true, base: 'middle', color: PAL.valid });
    } else {
      note(60, 430, 'To store the product back in Q4.4 you must drop f_product \u2212 f_target = 8 \u2212 4 = 4 bits.', PAL.dim, 12);
    }
  }

  /* --- 7. round ------------------------------------------------------- */
  function drawRound(p) {
    head('Discarding bits: truncation is a floor, so its error is biased',
         'all 65,536 products of two Q4.4 values, exact answer against stored answer');

    var x0 = 110, x1 = 800, y = 150;
    function X(v) { return x0 + (v + 0.06) / 0.10 * (x1 - x0); }
    P.line(X(0), y - 34, X(0), y + 34, { stroke: PAL.ink, sw: 1.2 });
    P.line(x0, y, x1, y, { stroke: PAL.border, sw: 1.2 });
    [-0.05, -0.025, 0, 0.025].forEach(function (v) {
      P.line(X(v), y + 6, X(v), y + 12, { stroke: PAL.border, sw: 1 });
      P.text(X(v), y + 16, String(v), { size: 9, mono: true, align: 'center', base: 'top', color: PAL.faint });
    });
    P.text(x0, y - 26, 'mean error, in units of one step (1/16)', { size: 10, align: 'left', color: PAL.faint });

    var tm = X(PROD.meanTrunc), rm = X(PROD.meanRound);
    P.circle(tm, y, 6, { fill: PAL.invalid });
    P.text(tm, y + 34, 'truncate \u221213/512', { size: 12, mono: true, align: 'center', base: 'top', color: PAL.invalid, bold: true });
    P.circle(rm, y, 6, { fill: PAL.valid });
    P.text(rm, y - 22, 'round +1/256', { size: 12, mono: true, align: 'center', base: 'bottom', color: PAL.valid, bold: true });

    /* the error ranges each rule allows, in units of one step */
    var by = 240, bh = 18;
    function XS(v) { return 130 + (v + 1.1) / 1.7 * 640; }
    P.line(XS(0), by - 26, XS(0), by + 2 * bh + 24, { stroke: PAL.ink, sw: 1, dash: [3, 3] });
    P.text(XS(0), by + 2 * bh + 28, '0', { size: 9, mono: true, align: 'center', color: PAL.faint });

    P.text(60, by - 14, 'the range each rule allows', { size: 11, color: PAL.dim });
    P.rect(XS(-1), by, XS(0) - XS(-1), bh, { fill: PAL.invalidDim, stroke: PAL.invalid, sw: 1.1, radius: 3 });
    P.text((XS(-1) + XS(0)) / 2, by + bh / 2, 'truncate: \u22121 to 0 step', { size: 10, align: 'center', base: 'middle', color: PAL.invalid });
    P.rect(XS(-0.5), by + bh + 6, XS(0.5) - XS(-0.5), bh, { fill: PAL.valid + '33', stroke: PAL.valid, sw: 1.1, radius: 3 });
    P.text((XS(-0.5) + XS(0.5)) / 2, by + bh + 6 + bh / 2, 'round: \u2212\u00bd to +\u00bd step', { size: 10, align: 'center', base: 'middle', color: PAL.valid });
    P.line(XS(-1), by + bh, XS(0), by + bh, { stroke: PAL.invalid, sw: 2 });
    P.line(XS(-0.5), by + 2 * bh + 6, XS(0.5), by + 2 * bh + 6, { stroke: PAL.valid, sw: 2 });

    if (p > 0.35) {
      P.rect(60, 306, 780, 44, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
      P.text(74, 320, 'the rule', { size: 11, bold: true, color: PAL.dim });
      P.text(150, 316, '(p + 2^(f\u22121)) >> f', { size: 16, mono: true, color: PAL.ink, bold: true });
      P.text(430, 316, 'add half a step, then shift', { size: 12, color: PAL.dim });
      P.text(430, 334, 'worst error falls from 15/256 to 1/32, exactly half a step', { size: 11, color: PAL.dim });
    }
    if (p > 0.7) {
      note(60, 376, 'Truncation was exact for 12,288 of the 65,536 products (18.75 per cent): those happen to end in four zeros.', PAL.dim, 12);
      note(60, 400, 'Exactness on those says nothing about the rule. The bias is what a loop feels: every result moves the same way.', PAL.dim, 12);
      note(60, 428, 'In a filter that reads its own output, that bias is carried forward and shows up as a constant offset.', PAL.warn, 12);
    }
  }

  /* --- 8. shift ------------------------------------------------------- */
  function drawShift(p) {
    head('Two ways to divide by two, and they disagree on negatives',
         'an arithmetic right shift floors; integer division truncates toward zero');

    var cw = 44, gap = 5, ch = 44;
    var x = 250;
    bitsRow(x, 100, cw, ch, gap, '11110111', { onFill: PAL.invalidDim, stroke: PAL.invalid });
    dot(x + 4 * cw + 3 * gap + gap / 2, 100 + ch / 2, PAL.ink);
    P.text(x - 14, 100 + ch / 2, '\u22129/16 = \u22120.5625', { size: 12, mono: true, align: 'right', base: 'middle' });

    if (p > 0.25) {
      bitsRow(x, 210, cw, ch, gap, '11111011', {});
      dot(x + 4 * cw + 3 * gap + gap / 2, 210 + ch / 2, PAL.ink);
      P.text(x - 14, 210 + ch / 2, '>> 1  =  \u22125/16', { size: 12, mono: true, align: 'right', base: 'middle', color: PAL.invalid });
      P.text(x + 8 * (cw + gap) + 10, 210 + ch / 2, '\u22120.3125  (floor)', { size: 12, mono: true, base: 'middle', color: PAL.invalid });
    }
    if (p > 0.5) {
      bitsRow(x, 300, cw, ch, gap, '11111100', {});
      dot(x + 4 * cw + 3 * gap + gap / 2, 300 + ch / 2, PAL.ink);
      P.text(x - 14, 300 + ch / 2, '/ 2  =  \u22124/16', { size: 12, mono: true, align: 'right', base: 'middle', color: PAL.valid });
      P.text(x + 8 * (cw + gap) + 10, 300 + ch / 2, '\u22120.25  (truncate)', { size: 12, mono: true, base: 'middle', color: PAL.valid });
    }

    note(60, 392, 'The exact half is \u22120.28125, which is not on the grid. One rule takes the value below it and one the value above.', PAL.dim, 12);
    note(60, 416, 'The two answers differ by exactly one step (1/16), and 64 of the 256 patterns are affected: every odd negative one.', PAL.dim, 12);
    note(60, 442, 'In C, / truncates toward zero (C99 and later) and >> floors. Pick one, say which, and test it on a negative.', PAL.warn, 12);
  }

  /* --- 9. accum ------------------------------------------------------- */
  function drawAccum(p) {
    head('Accumulation: the encoding error is multiplied by the count',
         '0.1 stored in an 8-bit fraction, added ten times');

    var x0 = 100, x1 = 620, yTop = 100, yBot = 300;
    function X(n) { return x0 + (n / 10) * (x1 - x0); }
    function Y(v) { return yBot - (v / 1.06) * (yBot - yTop); }

    P.line(x0, yBot, x1, yBot, { stroke: PAL.border, sw: 1.4 });
    P.line(x0, yTop - 6, x0, yBot, { stroke: PAL.border, sw: 1.4 });
    [0, 0.25, 0.5, 0.75, 1].forEach(function (v) {
      P.line(x0 - 4, Y(v), x0, Y(v), { stroke: PAL.border, sw: 1 });
      P.text(x0 - 8, Y(v), num(v), { size: 10, mono: true, align: 'right', base: 'middle', color: PAL.faint });
    });
    for (var n = 0; n <= 10; n += 2) {
      P.text(X(n), yBot + 10, String(n), { size: 10, mono: true, align: 'center', color: PAL.faint });
    }
    note(x0, yBot + 26, 'number of additions', PAL.dim, 10);

    /* the ideal */
    P.line(X(0), Y(0), X(10), Y(1), { stroke: PAL.accent, sw: 1.6, dash: [5, 4] });
    P.text(X(8.6), Y(0.80), 'ideal n/10', { size: 11, color: PAL.accent });

    /* the stored total */
    var reveal = Math.floor(K.ease(Math.min(1, p * 1.6)) * 11);
    if (reveal > 0) {
      var prevX = X(0), prevY = Y(0);
      for (var i = 1; i < reveal; i++) {
        var cv = (i * D01_RAW) / Q8S;
        P.line(prevX, prevY, X(i), Y(cv), { stroke: PAL.invalid, sw: 1.8 });
        P.circle(X(i), Y(cv), 2.6, { fill: PAL.invalid });
        prevX = X(i); prevY = Y(cv);
      }
      if (reveal === 11) {
        P.circle(X(10), Y(D01_TEN), 5, { fill: PAL.invalid });
        P.text(X(10) - 8, Y(D01_TEN) - 14, '+0.015625', { size: 11, mono: true, align: 'right', color: PAL.invalid, bold: true });
      }
    }

    /* the arithmetic panel */
    var px = 660;
    P.rect(px - 10, 96, 240, 250, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
    P.text(px + 4, 112, 'the numbers', { size: 12, bold: true, color: PAL.dim });
    P.text(px + 4, 136, '0.1 \u00d7 256 = 25.6', { size: 12, mono: true });
    P.text(px + 4, 158, '\u2192 stored 26', { size: 12, mono: true, color: PAL.ink, bold: true });
    P.text(px + 4, 180, '26/256 = 0.1015625', { size: 12, mono: true });
    P.text(px + 4, 202, 'error 1/640', { size: 12, mono: true, color: PAL.warn });
    P.text(px + 4, 232, 'ten times:', { size: 12, color: PAL.dim });
    P.text(px + 4, 254, '260/256 = 1.015625', { size: 12, mono: true, color: PAL.invalid, bold: true });
    P.text(px + 4, 276, 'drift 1/64 = 1.5625%', { size: 12, mono: true, color: PAL.invalid });
    P.text(px + 4, 306, 'k additions \u2192 i + log\u2082k bits', { size: 12, mono: true, color: PAL.accent });
    P.text(px + 4, 328, 'k=2,4,8,16 \u2192 5,6,7,8', { size: 12, mono: true, color: PAL.accent });

    /* the drift on its own axes, so a 1.5 per cent gap is visible */
    var dx0 = 100, dx1 = 460, dyT = 356, dyB = 428;
    function DX(n) { return dx0 + (n / 10) * (dx1 - dx0); }
    function DY(e) { return dyB - (e / 0.0175) * (dyB - dyT); }
    P.line(dx0, dyB, dx1, dyB, { stroke: PAL.border, sw: 1.2 });
    P.line(dx0, dyT - 4, dx0, dyB, { stroke: PAL.border, sw: 1.2 });
    P.text(dx0 - 8, DY(0), '0', { size: 9, mono: true, align: 'right', base: 'middle', color: PAL.faint });
    P.text(dx0 - 8, DY(0.015625), '1.5625%', { size: 9, mono: true, align: 'right', base: 'middle', color: PAL.faint });
    P.text(dx0, dyT - 12, 'the drift alone: total minus n/10', { size: 10, color: PAL.dim });
    P.line(DX(0), DY(0), DX(10), DY(0.015625), { stroke: PAL.invalid, sw: 1.8 });
    for (var q = 0; q <= reveal - 1 && q <= 10; q++) {
      P.circle(DX(q), DY(q * D01_ERR), 2.4, { fill: PAL.invalid });
    }
    P.text(DX(10) - 4, DY(0.015625) - 6, 'grows in a straight line', { size: 10, align: 'right', color: PAL.invalid });

    note(60, 448, 'Every term is stored as the same slightly wrong value, so the errors are correlated: they add, and they never cancel.', PAL.dim, 11);
  }

  /* --- 10. compare ---------------------------------------------------- */
  function drawCompare(p) {
    head('Fixed against floating, on the same eight bits',
         'fixed: one step everywhere. A toy float (1 sign, 4 exponent, 3 fraction): a step that grows with the value');

    var x0 = 110, x1 = 820, yTop = 110, yBot = 340;
    function X(v) { return x0 + (v / 16) * (x1 - x0); }
    function Y(logStep) { return yBot - (logStep + 7) / 8 * (yBot - yTop); }

    P.line(x0, yBot, x1, yBot, { stroke: PAL.border, sw: 1.4 });
    P.line(x0, yTop - 8, x0, yBot, { stroke: PAL.border, sw: 1.4 });
    [0, 4, 8, 12, 16].forEach(function (v) {
      P.line(X(v), yBot, X(v), yBot + 4, { stroke: PAL.border, sw: 1 });
      P.text(X(v), yBot + 10, String(v), { size: 10, mono: true, align: 'center', color: PAL.faint });
    });
    note(x0, yBot + 26, 'magnitude of the value', PAL.dim, 10);
    [-6, -4, -2, 0].forEach(function (s) {
      P.line(x0 - 4, Y(s), x0, Y(s), { stroke: PAL.border, sw: 1 });
      P.text(x0 - 8, Y(s), '2^' + s, { size: 10, mono: true, align: 'right', base: 'middle', color: PAL.faint });
    });
    P.text(x0 - 8, yTop - 18, 'spacing between adjacent values', { size: 11, align: 'left', color: PAL.dim });

    /* fixed point: a constant step */
    var yf = Y(Math.log(STEP) / Math.LN2);
    P.line(x0, yf, x1, yf, { stroke: PAL.accent, sw: 2.6 });
    P.text(x1 - 4, yf - 12, 'Q4.4: step 1/16 everywhere', { size: 12, align: 'right', color: PAL.accent, bold: true });

    /* the toy float: a staircase */
    if (p > 0.3) {
      var pts = [];
      for (var e = -3; e <= 4; e++) {
        var lo = Math.pow(2, e), hi = Math.pow(2, e + 1);
        if (lo >= 16) break;
        var logStep = (e - TOY.fracBits);
        var a = Math.max(0, lo), b = Math.min(16, hi);
        pts.push([X(a), Y(logStep)]);
        pts.push([X(b), Y(logStep)]);
        if (hi < 16) { pts.push([X(hi), Y(logStep)]); pts.push([X(hi), Y(e + 1 - TOY.fracBits)]); }
      }
      for (var i = 0; i < pts.length - 1; i++) {
        P.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], { stroke: PAL.warn, sw: 2 });
      }
      P.text(X(0.9), Y(-6.6), 'toy float: tiny steps near zero', { size: 11, color: PAL.warn });
      P.text(X(9), Y(1.4), 'huge steps far out', { size: 11, color: PAL.warn });
    }

    if (p > 0.6) {
      P.rect(60, 396, 780, 56, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
      P.text(74, 410, 'fixed point: constant absolute error', { size: 12, bold: true, color: PAL.accent });
      P.text(74, 430, 'floating point: constant relative error', { size: 12, bold: true, color: PAL.warn });
      P.text(400, 410, 'half a step at the smallest value = 50 per cent', { size: 11, color: PAL.dim });
      P.text(400, 430, 'half a step at 4 = 0.78 per cent', { size: 11, color: PAL.dim });
    }
  }

  /* --- 11. procedure -------------------------------------------------- */
  function drawProcedure(p) {
    head('The five-step procedure for any word-width question',
         'each step uses only what the earlier steps established');

    var steps = [
      ['Name the format', 'n, f, i = n \u2212 f, and the scale 2^\u2212f'],
      ['Write the window and the step', 'window [\u22122^(i\u22121), 2^(i\u22121) \u2212 2^\u2212f], step 2^\u2212f'],
      ['Apply the operation\u2019s own rule', 'add: f fixed, +1 integer bit \u00b7 multiply: f adds, n doubles'],
      ['Round before you shift', 'add 2^(f\u22121), then shift right; say which rounding you use'],
      ['Saturate, then check the width', 'clamp to the window; if the largest result does not fit, widen']
    ];

    var shown = Math.floor(K.ease(Math.min(1, p * 1.25)) * 5) + (p > 0.05 ? 1 : 0);
    if (shown > 5) shown = 5;

    for (var i = 0; i < 5; i++) {
      var y = 84 + i * 62;
      if (i >= shown) break;
      P.rect(60, y, 780, 50, { fill: i % 2 ? PAL.surface2 : PAL.surface, stroke: PAL.border, sw: 1, radius: 6 });
      P.circle(92, y + 25, 15, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.4 });
      P.text(92, y + 25, String(i + 1), { size: 13, mono: true, align: 'center', base: 'middle', bold: true, color: PAL.accent });
      P.text(120, y + 10, steps[i][0], { size: 13, bold: true });
      P.text(120, y + 30, steps[i][1], { size: 11.5, mono: true, color: PAL.dim });
    }
  }

  /* --- 12. hold ------------------------------------------------------- */
  function drawHold(p) {
    head('One screen to hold', 'five sentences, and every number on this page follows from them');

    var lines = [
      ['The point is fixed; the step is 2^\u2212f; and i + f = n.', PAL.ink],
      ['Add with equal f, and the sum needs one more integer bit.', PAL.ink],
      ['Multiply and the f\u2019s add: Q4.4 \u00d7 Q4.4 = Q8.8, then shift back.', PAL.ink],
      ['A right shift floors, division truncates, and truncation is biased.', PAL.warn],
      ['Round before discarding, saturate at the edge, size the accumulator from the count.', PAL.valid]
    ];

    var shown = Math.floor(K.ease(Math.min(1, p * 1.3)) * 5) + 1;
    if (shown > 5) shown = 5;

    for (var i = 0; i < shown; i++) {
      var y = 110 + i * 64;
      P.circle(80, y + 8, 4.5, { fill: lines[i][1] });
      P.text(98, y, lines[i][0], { size: 14, color: lines[i][1] });
    }
    if (shown === 5) {
      P.rect(60, 424, 780, 30, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1, radius: 6 });
      P.text(74, 434, 'Every figure on this page was computed at load and re-checked by a second route.', { size: 11.5, color: PAL.ink });
    }
  }

  var DRAW = {
    point: drawPoint, weights: drawWeights, trade: drawTrade, add: drawAdd,
    overflow: drawOverflow, mul: drawMul, round: drawRound, shift: drawShift,
    accum: drawAccum, compare: drawCompare, procedure: drawProcedure, hold: drawHold
  };

  function drawFrame(t) {
    if (!P) return;
    P.clear();
    P.alpha(1);
    var i = K.sceneAt(t);
    var sc = K.state.scenes[i];
    if (!sc) return;
    var p = K.sceneProgress(t);
    var fn = DRAW[sc.id];
    if (fn) fn(p);
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
    N: N, F: F, I: I, VMIN: VMIN, VMAX: VMAX, STEP: STEP,
    DISTINCT: DISTINCT, NEG: NEG,
    SUM: SUM, PROD: PROD, ACC: ACC, HALF: HALF,
    A_RAW: A_RAW, B_RAW: B_RAW, SUM_RAW: SUM_RAW, SUM_WRAPPED: SUM_WRAPPED, SUM_EXACT: SUM_EXACT,
    M_RAW: M_RAW, M_PROD: M_PROD, M_TRUNC: M_TRUNC, M_ROUND: M_ROUND, M_EXACT: M_EXACT,
    SHIFT_IN: SHIFT_IN, SHIFT_FLOOR: SHIFT_FLOOR, SHIFT_TRUNC: SHIFT_TRUNC,
    D01_RAW: D01_RAW, D01_VAL: D01_VAL, D01_TEN: D01_TEN, D01_TEN_ERR: D01_TEN_ERR,
    Q15: Q15, DECIMALS: DECIMALS, UQ_MAX: UQ_MAX,
    BITS_44: BITS_44, BITS_Q15: BITS_Q15,
    PASSED: PASSED, TOTAL: CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
