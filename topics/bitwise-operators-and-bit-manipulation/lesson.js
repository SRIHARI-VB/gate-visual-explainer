/* ==========================================================================
   bitwise-operators-and-bit-manipulation - model, validation, render.

   Layer 1  model      : the eight-bit cell is the unit. Every operator is
                         defined once, on a byte, and every derived quantity
                         (popcount, lowest set bit, field, parity, swap) is
                         computed from those definitions and nothing else.
   Layer 2  validation : each identity the lesson teaches is checked against
                         its own definition by exhaustive enumeration over all
                         bytes, all bit positions, all widths and all pairs -
                         and the false belief is checked too, so the page can
                         report the exact set of inputs on which it fails.
   Layer 3  render     : reads the model. No scene recomputes a number.
   Layer 4  timeline   : in timeline.js - the only source of time.

   No p5.brush: every mark is a cell, a bar or a digit that has to be read
   exactly, and a random stroke offset would move a bit out of its column.
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

  function u8(x) { return x & 0xFF; }
  function s8(x) { return (x << 24) >> 24; }
  function bits8(x) {
    var v = u8(x), out = [], i;
    for (i = 7; i >= 0; i--) out.push((v >> i) & 1);
    return out;
  }
  function bitStr(x) { return bits8(x).join(''); }
  function bit(x, k) { return (u8(x) >> k) & 1; }
  function popcount(x) { var v = u8(x), n = 0; while (v) { v = u8(v & (v - 1)); n++; } return n; }
  function ctz(x) { var k; for (k = 0; k < 8; k++) if (bit(x, k)) return k; return -1; }
  function maskOf(n) { return (1 << n) - 1; }
  function field(x, k, w) { return u8(u8(x >> k) & maskOf(w)); }
  function parityFold(x) { var v = u8(x); v ^= v >> 4; v ^= v >> 2; v ^= v >> 1; return v & 1; }
  function kernighanSteps(x) { var v = u8(x), n = 0; while (v) { v = u8(v & (v - 1)); n++; } return n; }

  /* the bytes the lesson draws, chosen so every case appears once */
  var A = 0xB6;              /* 182 = 10110110: five ones, lowest set bit at 1 */
  var B = 0x3C;              /*  60 = 00111100                                     */
  var MASK_BIT = 1 << 3;     /*   8 = 00001000: bit three, absent in A             */
  var MASK_BIT2 = 1 << 2;    /*   4 = 00000100: bit two, present in A              */

  var WK = {
    A: A, B: B,
    and: u8(A & B), or: u8(A | B), xor: u8(A ^ B),
    notA: u8(~A),
    set: u8(A | MASK_BIT), clear: u8(A & ~MASK_BIT), toggle: u8(A ^ MASK_BIT),
    test3: bit(A, 3), test2: bit(A, 2),
    clear2: u8(A & ~MASK_BIT2),
    field: field(A, 2, 4), fieldMask: maskOf(4),
    wrongOrder: u8(u8(A & maskOf(4)) >> 2),
    pop: popcount(A), ctz: ctz(A),
    drain: (function () { var v = A, out = [v]; while (v) { v = u8(v & (v - 1)); out.push(v); } return out; })(),
    lowest: u8(A & (256 - A)),
    negA: u8(256 - A),
    parity: parityFold(A),
    kern: kernighanSteps(A)
  };

  /* the two previous-year items, recomputed */
  var CH_P = 80, CH_X = 120, CH_STAR = 42, CH_MINUS = 45, CH_PLUS = 43;
  var ITEM2022 = {
    andVal: u8(CH_P & CH_X), orVal: u8(CH_P | CH_X), xorVal: u8(CH_P ^ CH_X),
    c: u8(CH_P & CH_X) + CH_STAR,
    d: u8(CH_P | CH_X) - CH_MINUS,
    e: u8(CH_P ^ CH_X) + CH_PLUS,
    printed: String.fromCharCode(u8(CH_P & CH_X) + CH_STAR) + ' ' +
             String.fromCharCode(u8(CH_P | CH_X) - CH_MINUS) + ' ' +
             String.fromCharCode(u8(CH_P ^ CH_X) + CH_PLUS)
  };

  var ITEM2017 = (function () {
    var count = 0, x = 0, rows = [], i;
    for (i = 5; i > 0; i--) {
      var v = i, c = 0;
      while (v) { count += (v & 1); v >>= 1; c++; }
      x = x + count;
      rows.push({ i: i, ones: popcount(i), running: count, x: x });
    }
    return { rows: rows, total: x };
  })();

  /* ======================================================================
     LAYER 2 - THE CHECKS
     Each check states the claim, enumerates the domain, and reports the
     exact set of inputs on which the claim fails - empty when it holds.
     ====================================================================== */

  var CHECKS = [];
  function check(name, fn) {
    var r;
    try { r = fn(); } catch (e) { r = { pass: false, detail: 'threw: ' + e.message }; }
    CHECKS.push({ name: name, pass: !!r.pass, detail: r.detail || '' });
  }

  /* 1. the columns are independent: for every operator and every pair */
  check('&, | and ^ decide each column alone (3 x 65536 pairs)', function () {
    var ops = [['&', function (a, b) { return a & b; }],
               ['|', function (a, b) { return a | b; }],
               ['^', function (a, b) { return a ^ b; }]], bad = 0, a, b, k, i;
    for (i = 0; i < ops.length; i++) {
      for (a = 0; a < 256; a++) {
        for (b = 0; b < 256; b++) {
          var r = u8(ops[i][1](a, b));
          for (k = 0; k < 8; k++) {
            if (bit(r, k) !== ops[i][1](bit(a, k), bit(b, k))) bad++;
          }
        }
      }
    }
    return { pass: bad === 0, detail: bad + ' disagreeing columns' };
  });

  /* 2. De Morgan holds bitwise, on every pair */
  check("De Morgan's two laws hold on all 65536 pairs", function () {
    var bad = 0, a, b;
    for (a = 0; a < 256; a++) {
      for (b = 0; b < 256; b++) {
        if (u8(~(a & b)) !== u8(u8(~a) | u8(~b))) bad++;
        if (u8(~(a | b)) !== u8(u8(~a) & u8(~b))) bad++;
      }
    }
    return { pass: bad === 0, detail: bad + ' counterexamples' };
  });

  /* 3. the complement identity, on every signed byte */
  check('~x equals -x-1 for all 256 signed byte values', function () {
    var bad = [], x;
    for (x = 0; x < 256; x++) if (s8(u8(~x)) !== (-s8(x) - 1)) bad.push(x);
    return { pass: bad.length === 0, detail: bad.length + ' failures' };
  });

  /* 4. x & (x-1) removes exactly the lowest set bit */
  check('x & (x-1) clears the lowest set bit and nothing else (x = 1..255)', function () {
    var bad = 0, x;
    for (x = 1; x < 256; x++) {
      var k = ctz(x);
      if (u8(x & (x - 1)) !== u8(x & ~(1 << k))) bad++;
      if (popcount(x & (x - 1)) !== popcount(x) - 1) bad++;
    }
    return { pass: bad === 0, detail: bad + ' disagreements' };
  });

  /* 5. the power-of-two test, and the exact set of false positives */
  check('x & (x-1) == 0 agrees with "one bit set" except on a reported set', function () {
    var falsePos = [], x;
    for (x = 0; x < 256; x++) {
      var passes = u8(x & (x - 1)) === 0;
      if (passes !== (popcount(x) === 1)) falsePos.push(x);
    }
    return { pass: falsePos.length === 1 && falsePos[0] === 0,
             detail: 'false positives: {' + falsePos.join(',') + '}' };
  });

  /* 6. x & -x isolates the lowest set bit */
  check('x & -x equals 1<<ctz(x) for every non-zero byte', function () {
    var bad = 0, x;
    for (x = 1; x < 256; x++) if (u8(x & (256 - x)) !== u8(1 << ctz(x))) bad++;
    return { pass: bad === 0, detail: bad + ' failures; x = 0 gives ' + u8(0 & 256) };
  });

  /* 7. Kernighan's loop runs popcount times */
  check('the clearing loop runs popcount(x) times (x = 0..255)', function () {
    var bad = 0, x;
    for (x = 0; x < 256; x++) if (kernighanSteps(x) !== popcount(x)) bad++;
    return { pass: bad === 0, detail: bad + ' failures' };
  });

  /* 8. masks: the sum form, and the legal shift counts */
  check('(1<<n)-1 equals the sum of 2^i for n = 0..8, and legal counts are 0..7', function () {
    var bad = 0, n, i, legal = 0;
    for (n = 0; n <= 8; n++) {
      var s = 0;
      for (i = 0; i < n; i++) s += Math.pow(2, i);
      if (maskOf(n) !== s) bad++;
    }
    for (n = 0; n < 8; n++) legal++;
    return { pass: bad === 0 && legal === 8,
             detail: bad + ' mask failures; ' + legal + ' legal counts for a byte, and 8 is undefined' };
  });

  /* 9. the four single-bit operations, for every byte and every position */
  check('set, clear, toggle and test act on bit k only (256 x 8 cases)', function () {
    var bad = 0, x, k;
    for (x = 0; x < 256; x++) {
      for (k = 0; k < 8; k++) {
        var m = 1 << k;
        if (bit(u8(x | m), k) !== 1) bad++;
        if (bit(u8(x & ~m), k) !== 0) bad++;
        if (bit(u8(x ^ m), k) === bit(x, k)) bad++;
        for (var j = 0; j < 8; j++) {
          if (j !== k && bit(u8(x | m), j) !== bit(x, j)) bad++;
          if (j !== k && bit(u8(x & ~m), j) !== bit(x, j)) bad++;
        }
      }
    }
    return { pass: bad === 0, detail: bad + ' wrong bits' };
  });

  /* 10. field extraction round trip */
  check('(x>>k) & ((1<<w)-1) returns bits k..k+w-1 for every x, k, w', function () {
    var bad = 0, x, k, w, i;
    for (x = 0; x < 256; x++) {
      for (k = 0; k < 8; k++) {
        for (w = 1; k + w <= 8; w++) {
          var want = 0;
          for (i = 0; i < w; i++) want |= bit(x, k + i) << i;
          if (field(x, k, w) !== want) bad++;
        }
      }
    }
    return { pass: bad === 0, detail: bad + ' failures' };
  });

  /* 11. parity fold */
  check('the three-step XOR fold gives popcount parity (x = 0..255)', function () {
    var bad = 0, x;
    for (x = 0; x < 256; x++) if (parityFold(x) !== (popcount(x) % 2)) bad++;
    return { pass: bad === 0, detail: bad + ' failures' };
  });

  /* 12. XOR swap, on distinct operands and on one aliased object.
     Aliasing is modelled as one object, not as two equal ones: the three
     operations then act on the same storage, which is the whole failure. */
  check('three XORs exchange distinct values, and zero an aliased object', function () {
    var bad = 0, zeroed = 0, a, b, v;
    for (a = 0; a < 256; a++) {
      for (b = 0; b < 256; b++) {
        var x = a, y = b;
        x = u8(x ^ y); y = u8(x ^ y); x = u8(x ^ y);
        if (a !== b && (x !== b || y !== a)) bad++;
      }
    }
    for (v = 0; v < 256; v++) {
      var o = v;
      o = u8(o ^ o); o = u8(o ^ o); o = u8(o ^ o);
      if (o === 0) zeroed++;
    }
    return { pass: bad === 0 && zeroed === 256,
             detail: bad + ' failed swaps; ' + zeroed + ' of 256 aliased objects end at 0, the one that started at 0 included' };
  });

  /* 13. the precedence trap, and how often it disagrees */
  check('x & 1 == 0 is always 0, and differs from (x&1)==0 on every even x', function () {
    var alwaysZero = true, disagree = 0, x;
    for (x = 0; x < 256; x++) {
      var written = u8(x & (1 === 0 ? 1 : 0));
      if (written !== 0) alwaysZero = false;
      if ((u8(x & 1) === 0) !== (written === 0)) disagree++;
    }
    return { pass: alwaysZero && disagree === 128,
             detail: 'disagreements: ' + disagree + ' of 256 (all even x)' };
  });

  /* 14. sign extension, and the two shift conventions */
  check('sign extension and the two right-shift conventions on all bytes', function () {
    var bad = 0, diff = 0, x;
    for (x = 0; x < 256; x++) {
      if (s8(x) !== (x < 128 ? x : x - 256)) bad++;
      if (x >= 128 && s8(s8(x) >> 1) !== u8(u8(x) >> 1)) diff++;
    }
    return { pass: bad === 0 && diff === 128,
             detail: bad + ' sign failures; arithmetic and logical >> differ on ' + diff + ' of 128 negative bytes' };
  });

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

  /* ======================================================================
     LAYER 3 - RENDER
     One drawing vocabulary. Rows of eight cells are the only picture, because
     a byte is the only object the topic is about.
     ====================================================================== */

  var CW = 34, CH = 28, PITCH = 38, ROWX = 110;

  function head(p, s) { p.text(30, 16, s, { size: 19, bold: true, color: PAL.ink }); }
  function sub(p, s) { p.text(30, 42, s, { size: 13, color: PAL.dim }); }

  function rowWidth() { return 8 * PITCH - (PITCH - CW); }

  /* one byte as eight cells, label on the left, value on the right */
  function byteRow(p, y, val, label, opts) {
    opts = opts || {};
    var i, v = bits8(val);
    if (label) {
      p.text(ROWX - 10, y + CH / 2, label, { size: 13, mono: true, align: 'right', base: 'middle', color: opts.labelColor || PAL.dim });
    }
    for (i = 0; i < 8; i++) {
      var x = ROWX + i * PITCH;
      var hi = (opts.mark !== undefined && opts.mark === i);
      p.rect(x, y, CW, CH, {
        fill: hi ? (opts.markFill || PAL.accentDim) : (v[i] ? PAL.surface2 : PAL.surface),
        stroke: hi ? PAL.accent : PAL.border,
        sw: hi ? 2 : 1,
        radius: 4
      });
      p.text(x + CW / 2, y + CH / 2, String(v[i]),
        { size: 15, mono: true, align: 'center', base: 'middle', bold: !!v[i], color: v[i] ? PAL.ink : PAL.faint });
    }
    if (opts.value !== false) {
      p.text(ROWX + rowWidth() + 16, y + CH / 2,
        (opts.valueText || '') + String(u8(val)),
        { size: 13, mono: true, base: 'middle', color: opts.valueColor || PAL.ink });
    }
  }

  /* a short line of text in a panel */
  function line(p, x, y, s, o) {
    o = o || {};
    p.text(x, y, s, { size: o.size || 13, mono: o.mono !== false, bold: !!o.bold,
                      color: o.color || PAL.ink });
  }

  /* a boxed statement with a coloured edge */
  function note(p, x, y, w, s, o) {
    o = o || {};
    p.rect(x, y, w, o.h || 30, { fill: o.fill || PAL.surface2, stroke: o.stroke || PAL.border, sw: 1, radius: 5 });
    p.text(x + 10, y + (o.h || 30) / 2, s,
      { size: o.size || 12.5, mono: true, base: 'middle', color: o.color || PAL.ink });
  }

  /* ---------------- scene 1: eight columns ---------------- */
  function drawCols(p, q) {
    head(p, 'A bitwise operator works down the columns');
    sub(p, 'two bytes, most significant bit on the left; the result is a byte');
    byteRow(p, 66, WK.A, 'a', { valueText: '' });
    byteRow(p, 108, WK.B, 'b', { valueText: '' });
    p.line(ROWX, 150, ROWX + rowWidth(), 150, { stroke: PAL.border, sw: 1, dash: [4, 4] });
    if (q > 0.28) byteRow(p, 168, WK.and, 'a & b', { mark: 5, markFill: PAL.accentDim, valueColor: PAL.accent });
    if (q > 0.52) byteRow(p, 210, WK.or, 'a | b', { valueColor: PAL.ink });
    if (q > 0.76) byteRow(p, 252, WK.xor, 'a ^ b', { valueColor: PAL.ink });

    line(p, 470, 74, 'one rule per column,', { bold: true, size: 14, mono: false });
    line(p, 470, 94, 'eight decisions, no carry', { size: 13, mono: false, color: PAL.dim });
    line(p, 470, 132, '6 & 3 = 2   a number', { size: 13, color: PAL.accent });
    line(p, 470, 154, '6 && 3 = 1  a truth value', { size: 13, color: PAL.invalid });
    line(p, 470, 188, '&& stops early; & never does', { size: 12.5, mono: false, color: PAL.dim });
    line(p, 470, 222, 'both operands are promoted', { size: 12.5, mono: false, color: PAL.dim });
    line(p, 470, 240, 'to int before the operator', { size: 12.5, mono: false, color: PAL.dim });
    note(p, 470, 268, 360, '1 char & 1 char is an int, not a char', { color: PAL.warn, stroke: PAL.warn });
    line(p, 470, 322, 'the width never grows:', { size: 12.5, mono: false, color: PAL.dim });
    line(p, 470, 340, 'eight bits in, eight bits out', { size: 12.5, mono: false, color: PAL.dim });
  }

  /* ---------------- scene 2: three tables ---------------- */
  function truthTable(p, x, y, rows, title, rule) {
    var r;
    line(p, x, y, 'a b  out', { size: 13, bold: true, color: PAL.ink });
    for (r = 0; r < 4; r++) {
      line(p, x, y + 22 + r * 22, rows[r], { size: 13, color: PAL.ink });
    }
    line(p, x, y + 132, title, { size: 13, bold: true, mono: false, color: PAL.accent });
    line(p, x, y + 152, rule, { size: 12, mono: false, color: PAL.dim });
  }

  function drawTables(p, q) {
    head(p, 'Three tables, one rule per column');
    sub(p, 'the Boolean tables of Digital Logic, applied to all eight columns at once');
    truthTable(p, 60, 76, ['0 0   0', '0 1   0', '1 0   0', '1 1   1'], 'AND  &', 'one only where both are one');
    if (q > 0.25) truthTable(p, 360, 76, ['0 0   0', '0 1   1', '1 0   1', '1 1   1'], 'OR  |', 'one unless both are zero');
    if (q > 0.5) truthTable(p, 660, 76, ['0 0   0', '0 1   1', '1 0   1', '1 1   0'], 'XOR  ^', 'one where they differ');

    if (q > 0.5) {
      line(p, 60, 274, 'sixteen binary Boolean functions exist; C gives three, plus the unary complement', { size: 12.5, mono: false, color: PAL.ink });
      note(p, 60, 296, 500, '~(a & b) == (~a | ~b)   De Morgan, column by column', { color: PAL.accent, stroke: PAL.accent });
      line(p, 60, 344, 'checked on all 65536 pairs of bytes, no disagreement', { size: 12.5, mono: false, color: PAL.dim });
      line(p, 60, 366, 'the same law as the logic lesson, applied eight times at once', { size: 12.5, mono: false, color: PAL.dim });
    }
  }

  /* ---------------- scene 3: masks ---------------- */
  function drawMask(p, q) {
    head(p, 'One mask, four operations');
    sub(p, 'a mask has one one in it, and its position is the bit it addresses');
    byteRow(p, 66, WK.A, 'x', { mark: 3, markFill: PAL.warnDim });
    byteRow(p, 108, MASK_BIT, '1<<3', { mark: 3, markFill: PAL.accentDim });
    if (q > 0.3) {
      line(p, 470, 72, 'set     x | m', { size: 13.5, bold: true });
      line(p, 470, 92, '= ' + WK.set, { size: 13, color: PAL.accent });
      line(p, 470, 124, 'clear   x & ~m', { size: 13.5, bold: true });
      line(p, 470, 144, '= ' + WK.clear + '   bit 3 was already 0', { size: 13, color: PAL.dim });
      line(p, 470, 176, 'toggle  x ^ m', { size: 13.5, bold: true });
      line(p, 470, 196, '= ' + WK.toggle, { size: 13, color: PAL.accent });
      line(p, 470, 228, 'test    x & m', { size: 13.5, bold: true });
      line(p, 470, 248, '= ' + u8(WK.A & MASK_BIT) + '   bit 3 is clear', { size: 13, color: PAL.dim });
    }
    if (q > 0.62) {
      byteRow(p, 168, WK.clear2, 'x & ~4', { mark: 2, markFill: PAL.accentDim });
      line(p, 470, 286, 'bit 2 is set, so clearing it', { size: 12.5, mono: false, color: PAL.dim });
      line(p, 470, 304, 'subtracts four: 182 -> 178', { size: 12.5, mono: false, color: PAL.dim });
      note(p, 60, 240, 340, 'clearing needs ~m, not m', { color: PAL.warn, stroke: PAL.warn });
      note(p, 60, 280, 340, 'x & m keeps the bit; it does not clear it', { color: PAL.invalid, stroke: PAL.invalid, size: 12 });
    }
  }

  /* ---------------- scene 4: fields ---------------- */
  function drawField(p, q) {
    head(p, 'Extract bits 5..2: shift, then mask');
    sub(p, 'the field is four bits wide and starts at bit two');
    byteRow(p, 66, WK.A, 'x', { mark: 5, markFill: PAL.warnDim });
    if (q > 0.22) byteRow(p, 108, u8(WK.A >> 2), 'x>>2', { mark: 3, markFill: PAL.accentDim });
    if (q > 0.46) byteRow(p, 150, WK.field, '& 15', { mark: 3, markFill: PAL.accentDim, valueColor: PAL.accent });
    if (q > 0.46) {
      line(p, 470, 72, 'field = ' + WK.field + ' = ' + bitStr(WK.field).slice(4), { size: 14, bold: true, color: PAL.accent });
      line(p, 470, 100, 'mask = (1<<4)-1 = ' + WK.fieldMask, { size: 13 });
      line(p, 470, 124, 'shift drops the low two bits', { size: 12.5, mono: false, color: PAL.dim });
      line(p, 470, 142, 'mask drops everything above', { size: 12.5, mono: false, color: PAL.dim });
    }
    if (q > 0.7) {
      note(p, 60, 214, 350, 'mask first: ' + u8(WK.A & 15) + ', then >>2 = ' + WK.wrongOrder, { color: PAL.invalid, stroke: PAL.invalid, size: 12 });
      line(p, 470, 178, 'the other order answers', { size: 12.5, mono: false, color: PAL.invalid });
      line(p, 470, 196, 'a different question: ' + WK.wrongOrder + ', not ' + WK.field, { size: 12.5, mono: false, color: PAL.invalid });
      line(p, 470, 228, 'insertion is the reverse:', { size: 12.5, mono: false, color: PAL.dim });
      line(p, 470, 246, 'mask, shift, then OR', { size: 12.5, mono: false, color: PAL.dim });
      note(p, 60, 262, 350, 'w equal to the width: (1<<32)-1 is undefined', { color: PAL.warn, stroke: PAL.warn, size: 12 });
    }
  }

  /* ---------------- scene 5: two's complement ---------------- */
  function drawTwos(p, q) {
    head(p, 'Complement is minus x minus one');
    sub(p, 'the same eight bits read as a signed value');
    byteRow(p, 66, 5, '5', {});
    if (q > 0.22) byteRow(p, 108, u8(~5), '~5', { mark: 7, markFill: PAL.warnDim });
    if (q > 0.46) byteRow(p, 150, u8(256 - 6), '-6', { mark: 7, markFill: PAL.accentDim, valueColor: PAL.accent });
    if (q > 0.46) {
      line(p, 470, 72, '~5 = -6 = -5-1', { size: 14, bold: true, color: PAL.accent });
      line(p, 470, 100, 'checked on all 256 signed bytes', { size: 12.5, mono: false, color: PAL.dim });
    }
    if (q > 0.68) {
      line(p, 470, 132, '-6 & 0x0F = ' + u8(u8(256 - 6) & 15), { size: 13 });
      line(p, 470, 152, 'leading ones survive until masked', { size: 12.5, mono: false, color: PAL.dim });
      note(p, 60, 214, 350, '~x is -x-1, never -x', { color: PAL.invalid, stroke: PAL.invalid });
      line(p, 470, 190, '0xF8 as int8  = ' + s8(0xF8), { size: 13 });
      line(p, 470, 210, '0xF8 as uint8 = ' + u8(0xF8), { size: 13 });
      line(p, 470, 236, 'widening copies the sign bit:', { size: 12.5, mono: false, color: PAL.dim });
      line(p, 470, 254, 'int8 -8 -> 0xFFFFFFF8', { size: 12.5, color: PAL.ink });
    }
  }

  /* ---------------- scene 6: shifts ---------------- */
  function drawShift(p, q) {
    head(p, 'Shifts: the count decides everything');
    sub(p, 'for a byte the legal counts are 0 to 7; eight is not a count');
    var i;
    for (i = 0; i < 8; i++) {
      var x = ROWX + i * PITCH;
      p.rect(x, 68, CW, CH, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1, radius: 4 });
      p.text(x + CW / 2, 68 + CH / 2, String(i), { size: 15, mono: true, align: 'center', base: 'middle', color: PAL.ink });
    }
    p.rect(ROWX + 8 * PITCH, 68, CW, CH, { fill: PAL.invalidDim, stroke: PAL.invalid, sw: 1.5, radius: 4 });
    p.text(ROWX + 8 * PITCH + CW / 2, 68 + CH / 2, '8', { size: 15, mono: true, align: 'center', base: 'middle', bold: true, color: PAL.invalid });
    line(p, 470, 72, 'legal band: 0 .. width-1', { size: 12.5, color: PAL.accent });
    line(p, 470, 96, '8 is outside the band: undefined', { size: 12.5, color: PAL.invalid });

    if (q > 0.22) {
      byteRow(p, 116, u8(1 << 3), '1<<3', { valueColor: PAL.ink });
      line(p, 470, 118, '<<  multiplies by 2^k', { size: 13, mono: false });
      line(p, 470, 138, '1 << 3 = 8, vacated bits 0', { size: 12.5, color: PAL.dim });
    }
    if (q > 0.42) {
      byteRow(p, 158, u8(WK.A >> 2), 'x>>2', { valueColor: PAL.ink });
      line(p, 470, 160, '>>  divides, dropping the rest', { size: 13, mono: false });
      line(p, 470, 180, '182 >> 2 = 45 = floor(182/4)', { size: 12.5, color: PAL.dim });
    }
    if (q > 0.62) {
      note(p, 60, 206, 350, 'count < 0        undefined', { color: PAL.invalid, stroke: PAL.invalid, size: 12 });
      note(p, 60, 240, 350, 'count >= width   undefined', { color: PAL.invalid, stroke: PAL.invalid, size: 12 });
      note(p, 60, 274, 350, 'negative << or into sign bit: undefined', { color: PAL.invalid, stroke: PAL.invalid, size: 11.5 });
      line(p, 470, 212, 'right shift of a negative value', { size: 13, mono: false, bold: true, color: PAL.warn });
      line(p, 470, 232, '-8 >> 1 = -4   arithmetic', { size: 12.5, color: PAL.ink });
      line(p, 470, 250, '-8 >> 1 = 124  logical', { size: 12.5, color: PAL.ink });
      line(p, 470, 272, 'implementation-defined: neither is portable', { size: 12, mono: false, color: PAL.warn });
      line(p, 470, 300, 'arithmetic shift floors: -7 >> 1 = -4', { size: 12.5, color: PAL.dim });
      line(p, 470, 318, 'while -7 / 2 = -3', { size: 12.5, color: PAL.dim });
    }
  }

  /* ---------------- scene 7: x & (x-1) ---------------- */
  function drawTrick1(p, q) {
    head(p, 'x & (x-1) removes the lowest set bit');
    sub(p, 'subtracting one borrows from the first place that can lend');
    byteRow(p, 66, WK.A, 'x', { mark: 1, markFill: PAL.warnDim });
    if (q > 0.22) byteRow(p, 108, u8(WK.A - 1), 'x-1', { mark: 1, markFill: PAL.warnDim });
    if (q > 0.44) byteRow(p, 150, u8(WK.A & (WK.A - 1)), 'x&(x-1)', { mark: 1, markFill: PAL.accentDim, valueColor: PAL.accent });
    if (q > 0.44) {
      line(p, 470, 72, 'bit 1 goes, bits above stay', { size: 13.5, bold: true, color: PAL.accent });
      line(p, 470, 100, 'drain: ' + WK.drain.join(' -> '), { size: 12.5 });
      line(p, 470, 122, WK.pop + ' steps for ' + WK.pop + ' ones', { size: 12.5, mono: false, color: PAL.dim });
    }
    if (q > 0.66) {
      note(p, 60, 214, 350, 'x & (x-1) == 0  <=>  one bit set', { color: PAL.accent, stroke: PAL.accent });
      line(p, 470, 156, 'power-of-two test, for x > 0', { size: 13, mono: false });
      line(p, 470, 178, 'the exception is x = 0:', { size: 12.5, mono: false, color: PAL.invalid });
      line(p, 470, 196, '0 & -1 = 0, and 0 is no power of two', { size: 12.5, color: PAL.invalid });
      line(p, 470, 224, 'so the guarded form is', { size: 12.5, mono: false, color: PAL.dim });
      line(p, 470, 242, 'x && !(x & (x-1))', { size: 12.5, color: PAL.ink });
    }
  }

  /* ---------------- scene 8: x & -x, and counting ---------------- */
  function drawTrick2(p, q) {
    head(p, 'x & -x keeps only the lowest set bit');
    sub(p, 'negation is complement plus one, so the low bits align');
    byteRow(p, 66, WK.A, 'x', { mark: 1, markFill: PAL.warnDim });
    if (q > 0.22) byteRow(p, 108, WK.negA, '-x', { mark: 1, markFill: PAL.warnDim });
    if (q > 0.44) byteRow(p, 150, WK.lowest, 'x & -x', { mark: 1, markFill: PAL.accentDim, valueColor: PAL.accent });
    if (q > 0.44) {
      line(p, 470, 72, 'lowest set bit at position ' + WK.ctz, { size: 13.5, bold: true, color: PAL.accent });
      line(p, 470, 94, 'so x & -x = ' + WK.lowest + ' = 1<<' + WK.ctz, { size: 12.5 });
      line(p, 470, 118, 'for x = 0 the expression gives 0', { size: 12.5, mono: false, color: PAL.dim });
    }
    if (q > 0.66) {
      note(p, 60, 214, 350, 'clearing loop: ' + WK.kern + ' turns for ' + WK.pop + ' ones', { color: PAL.accent, stroke: PAL.accent, size: 12 });
      line(p, 470, 152, 'a shift loop would always take 8', { size: 12.5, mono: false, color: PAL.dim });
      line(p, 470, 180, 'parity: v^=v>>4; v^=v>>2; v^=v>>1;', { size: 12.5 });
      line(p, 470, 200, 'lowest bit is the parity = ' + WK.parity, { size: 12.5, color: PAL.accent });
      line(p, 470, 228, 'three operations, no table', { size: 12.5, mono: false, color: PAL.dim });
    }
  }

  /* ---------------- scene 9: precedence ---------------- */
  function drawPrec(p, q) {
    head(p, 'x & 1 == 0 is parsed as x & (1 == 0)');
    sub(p, 'the ladder, tightest binding at the top');
    var rows = [
      ['==  !=', 'comparison', PAL.ink],
      ['&', 'bitwise and', PAL.accent],
      ['^', 'bitwise xor', PAL.ink],
      ['|', 'bitwise or', PAL.ink],
      ['&&  ||', 'logical', PAL.dim],
      ['=', 'assignment', PAL.dim]
    ], i;
    for (i = 0; i < rows.length; i++) {
      var y = 68 + i * 30;
      p.rect(60, y, 200, 24, { fill: rows[i][2] === PAL.accent ? PAL.accentDim : PAL.surface2,
                               stroke: rows[i][2] === PAL.accent ? PAL.accent : PAL.border, sw: 1, radius: 4 });
      p.text(70, y + 12, rows[i][0], { size: 13, mono: true, base: 'middle', bold: rows[i][2] === PAL.accent });
      p.text(276, y + 12, rows[i][1], { size: 12.5, base: 'middle', color: PAL.dim });
    }
    if (q > 0.3) {
      line(p, 470, 72, '1 == 0   is 0', { size: 13 });
      line(p, 470, 94, 'x & 0    is 0', { size: 13 });
      line(p, 470, 116, 'so the test never passes', { size: 12.5, mono: false, color: PAL.invalid });
      note(p, 470, 136, 360, 'x & 1 == 0  is always false', { color: PAL.invalid, stroke: PAL.invalid, size: 12.5 });
    }
    if (q > 0.56) {
      line(p, 470, 190, 'for x = 5:', { size: 13, bold: true });
      line(p, 470, 210, '(x & 1) == 0   ->  ' + ((u8(5 & 1) === 0) ? 1 : 0), { size: 13, color: PAL.accent });
      line(p, 470, 230, 'x & 1 == 0     ->  0', { size: 13, color: PAL.invalid });
      line(p, 470, 258, 'the two differ on 128 of 256 bytes,', { size: 12.5, mono: false, color: PAL.dim });
      line(p, 470, 276, 'which is every even value', { size: 12.5, mono: false, color: PAL.dim });
    }
    if (q > 0.78) {
      note(p, 60, 262, 350, 'repair: (x & 1) == 0', { color: PAL.accent, stroke: PAL.accent });
      line(p, 470, 306, 'also: count += v & 1 groups as', { size: 12.5, mono: false, color: PAL.dim });
      line(p, 470, 324, 'count += (v & 1), because += is loosest', { size: 12.5, color: PAL.dim });
    }
  }

  /* ---------------- scene 10: XOR swap ---------------- */
  function drawSwap(p, q) {
    head(p, 'Three XORs exchange two bytes');
    sub(p, 'exclusive or is its own inverse, so no temporary is needed');
    line(p, 90, 76, 'step', { size: 13, bold: true });
    line(p, 190, 76, 'x', { size: 13, bold: true });
    line(p, 260, 76, 'y', { size: 13, bold: true });
    var a = 5, b = 9, rows = [['start', a, b]];
    a = u8(a ^ b); rows.push(['x ^= y', a, b]);
    b = u8(a ^ b); rows.push(['y ^= x', a, b]);
    a = u8(a ^ b); rows.push(['x ^= y', a, b]);
    var i, n = q > 0.4 ? 4 : q > 0.2 ? 3 : 2;
    for (i = 0; i < n; i++) {
      var y = 104 + i * 30;
      line(p, 90, y, rows[i][0], { size: 13, color: i === 3 ? PAL.accent : PAL.ink });
      line(p, 190, y, String(rows[i][1]), { size: 13, color: i === 3 ? PAL.accent : PAL.ink });
      line(p, 260, y, String(rows[i][2]), { size: 13, color: i === 3 ? PAL.accent : PAL.ink });
    }
    if (q > 0.6) {
      note(p, 60, 236, 350, 'i ^= i is 0, then 0 ^ 0 stays 0', { color: PAL.invalid, stroke: PAL.invalid, size: 12 });
      line(p, 470, 72, 'aliased: both names, one object', { size: 13.5, bold: true, color: PAL.invalid });
      line(p, 470, 98, 'all 256 aliased objects end at 0', { size: 12.5, mono: false, color: PAL.invalid });
      line(p, 470, 116, 'including the one that started at 0', { size: 12.5, mono: false, color: PAL.dim });
      line(p, 470, 146, 'guard: if (x != y)', { size: 13 });
      line(p, 470, 168, 'or use a temporary, which has no', { size: 12.5, mono: false, color: PAL.dim });
      line(p, 470, 186, 'aliasing case at all', { size: 12.5, mono: false, color: PAL.dim });
      line(p, 470, 214, 'a compiler swaps through a register:', { size: 12.5, mono: false, color: PAL.dim });
      line(p, 470, 232, 'the trick is for reading, not writing', { size: 12.5, mono: false, color: PAL.dim });
    }
  }

  /* ---------------- scene 11: the two items ---------------- */
  function drawGate(p, q) {
    head(p, 'Two previous-year items, recomputed');
    sub(p, 'every value below is produced by the page, not copied from a key');
    line(p, 40, 72, 'GATE 2022, Q44', { size: 14, bold: true, mono: false, color: PAL.accent });
    line(p, 40, 96, "'P' = 80  = 01010000", { size: 13 });
    line(p, 40, 118, "'x' = 120 = 01111000", { size: 13 });
    if (q > 0.22) {
      line(p, 40, 148, "&  = 80  + 42 = " + ITEM2022.c, { size: 13, color: PAL.ink });
      line(p, 40, 170, "|  = 120 - 45 = " + ITEM2022.d, { size: 13, color: PAL.ink });
      line(p, 40, 192, "^  = 40  + 43 = " + ITEM2022.e, { size: 13, color: PAL.ink });
      note(p, 40, 216, 380, 'printed: ' + ITEM2022.printed + '   (option A)', { color: PAL.accent, stroke: PAL.accent, size: 13 });
    }
    if (q > 0.5) {
      line(p, 470, 72, 'GATE 2017, Set 1, Q55', { size: 14, bold: true, mono: false, color: PAL.accent });
      line(p, 470, 96, 'while (v) { count += v & 1; v >>= 1; }', { size: 12.5 });
      line(p, 470, 118, 'adds the low bit, then drops it', { size: 12.5, mono: false, color: PAL.dim });
      line(p, 470, 146, 'i   ones   running', { size: 12.5, bold: true });
      var i;
      for (i = 0; i < ITEM2017.rows.length; i++) {
        var r = ITEM2017.rows[i];
        line(p, 470, 168 + i * 22, r.i + '     ' + r.ones + '        ' + r.running, { size: 12.5 });
      }
      note(p, 470, 292, 380, 'sum = ' + ITEM2017.total + '   (numerical answer)', { color: PAL.accent, stroke: PAL.accent, size: 13 });
    }
  }

  /* ---------------- scene 12: the procedure ---------------- */
  function drawProc(p, q) {
    head(p, 'Five steps, in this order');
    sub(p, 'each step exists because the one before it is not enough');
    var rows = [
      ['1', 'Name the width and the signedness'],
      ['2', 'Write masks as 1u<<k or (1u<<w)-1'],
      ['3', 'Fields: shift then mask. Counts: x&(x-1)'],
      ['4', 'Check the sign, and the shift count'],
      ['5', 'Verify one byte by hand, then answer']
    ], i, n = q > 0.75 ? 5 : q > 0.5 ? 4 : q > 0.25 ? 3 : 2;
    for (i = 0; i < n; i++) {
      var y = 78 + i * 44;
      p.rect(60, y, 44, 32, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1, radius: 5 });
      p.text(82, y + 16, rows[i][0], { size: 15, mono: true, align: 'center', base: 'middle', bold: true, color: PAL.accent });
      p.text(120, y + 16, rows[i][1], { size: 14, base: 'middle', color: PAL.ink });
    }
    if (q > 0.75) {
      note(p, 60, 306, 350, 'undefined means no number is the answer', { color: PAL.invalid, stroke: PAL.invalid, size: 12 });
      line(p, 470, 92, 'five forms this lesson covers:', { size: 13, bold: true, mono: false });
      line(p, 470, 116, 'shift by width, or by a negative', { size: 12.5, mono: false, color: PAL.dim });
      line(p, 470, 134, 'left shift of a negative, or overflow', { size: 12.5, mono: false, color: PAL.dim });
      line(p, 470, 152, 'right shift of a negative (defined by', { size: 12.5, mono: false, color: PAL.dim });
      line(p, 470, 170, 'the implementation, so not portable)', { size: 12.5, mono: false, color: PAL.dim });
      line(p, 470, 196, 'a question that offers a value for any', { size: 12.5, mono: false, color: PAL.dim });
      line(p, 470, 214, 'of these is testing that you know it', { size: 12.5, mono: false, color: PAL.dim });
      line(p, 470, 232, 'has none', { size: 12.5, mono: false, color: PAL.dim });
    }
  }

  var DRAW = {
    cols: drawCols, tables: drawTables, mask: drawMask, field: drawField,
    twos: drawTwos, shift: drawShift, trick1: drawTrick1, trick2: drawTrick2,
    prec: drawPrec, swap: drawSwap, gate: drawGate, proc: drawProc
  };

  function drawFrame(t) {
    if (!P) return;
    P.clear();
    P.alpha(1);
    var i = K.sceneAt(t);
    var sc = K.state.scenes[i];
    if (!sc) return;
    var fn = DRAW[sc.id];
    if (fn) fn(P, K.sceneProgress(t));
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
    u8: u8, s8: s8, bits8: bits8, bitStr: bitStr, bit: bit, popcount: popcount,
    ctz: ctz, maskOf: maskOf, field: field, parityFold: parityFold,
    kernighanSteps: kernighanSteps,
    WK: WK, ITEM2022: ITEM2022, ITEM2017: ITEM2017,
    PASSED: PASSED, TOTAL: CHECKS.length, ALL_PASS: PASSED === CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
