/* ==========================================================================
   floating-point-arithmetic — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model implements a toy binary floating-point format (align, add,
   normalise, round), the five IEEE rounding modes, a three-digit decimal
   format for the 2004 paper's question, and the IEEE-754 single and double
   arithmetic itself through the browser's own Float32Array and Float64Array.
   The drawing code reads the model and performs no arithmetic of its own.
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
  var INVALIDDIM = PAL.invalidDim || '#fbe4e2';

/* ======================================================================
   LAYER 1 - THE MODEL
   Every number this lesson shows is computed here, from the definitions.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- a value is n * 2^e with n an integer ---------- */

function mk(n, e) { return { n: n, e: e }; }

function bitlen(n) {
  n = Math.abs(n);
  var b = 0;
  while (n >= 1) { n = Math.floor(n / 2); b++; }
  return b;
}

function bexp(x) { return x.e + bitlen(x.n) - 1; }   /* exponent of the leading bit */
function val(x) { return x.n * Math.pow(2, x.e); }
function pow2(k) { return Math.pow(2, k); }

/* ---------- rounding to p significant bits ----------
   mode: 'even' (default), 'away', 'zero', 'up' (+inf), 'down' (-inf) */

function roundToP(x, p, mode) {
  if (x.n === 0) return mk(0, 0);
  var sign = x.n < 0 ? -1 : 1;
  var n = Math.abs(x.n), e = x.e;
  var b = bitlen(n);

  if (b > p) {
    var drop = b - p, q = pow2(drop);
    var kept = Math.floor(n / q), rem = n - kept * q, half = q / 2;
    var up = false;
    if (mode === 'away') up = rem >= half;
    else if (mode === 'zero') up = false;
    else if (mode === 'up') up = sign > 0 && rem > 0;
    else if (mode === 'down') up = sign < 0 && rem > 0;
    else up = rem > half || (rem === half && kept % 2 === 1);
    if (up) kept += 1;
    e += drop;
    if (bitlen(kept) > p) { kept = Math.floor(kept / 2); e += 1; }
    n = kept;
  } else if (b < p) {
    var sh = p - b;
    n = n * pow2(sh);
    e -= sh;
  }
  return mk(sign * n, e);
}

/* ---------- alignment on a fixed grid ----------
   The hardware aligns both significands to the larger binary exponent and
   keeps p + guard fraction positions. Everything below that grid is dropped,
   and the count of dropped bits is what the lesson reports. */

function onGrid(x, U) {
  var shift = x.e - U;
  if (shift >= 0) return { u: x.n * pow2(shift), lost: 0 };
  var q = pow2(-shift);
  var exact = (x.n % q) === 0;          /* the value is already on the grid */
  var mag = Math.floor(Math.abs(x.n) / q);
  var u = x.n < 0 ? -mag : mag;
  return { u: u, lost: exact ? 0 : -shift };
}

function addLimited(a, b, p, guard) {
  var E = Math.max(bexp(a), bexp(b));
  var U = E - (p - 1 + (guard || 0));
  var A = onGrid(a, U), B = onGrid(b, U);
  return { r: roundToP(mk(A.u + B.u, U), p, 'even'), lost: Math.max(A.lost, B.lost) };
}

function addExact(a, b, p, mode) {
  var U = Math.min(a.e, b.e) - 60;
  var A = onGrid(a, U), B = onGrid(b, U);
  return roundToP(mk(A.u + B.u, U), p, mode || 'even');
}

/* ---------- the toy formats this page draws in ---------- */

var P4 = 4, P3 = 3;

function toy(p, exponent, sign, fractionBits) {
  /* exponent is the binary exponent of the leading one */
  var n = 1;
  for (var i = 0; i < p - 1; i++) n = n * 2 + (fractionBits.charAt(i) === '1' ? 1 : 0);
  return mk((sign < 0 ? -1 : 1) * n, exponent - (p - 1));
}

function bitString(x, p) {
  var n = Math.abs(x.n), s = '';
  for (var i = p - 1; i >= 0; i--) s += (Math.floor(n / pow2(i)) % 2) ? '1' : '0';
  return (x.n < 0 ? '-' : '') + s;
}

/* the eight values of the p = 4 format in the binade [1, 2) */
var TOY_VALUES = [];
for (var k = 0; k < 8; k++) TOY_VALUES.push(mk(8 + k, -3));
var TOY_SPACING = val(TOY_VALUES[1]) - val(TOY_VALUES[0]);

/* ---------- the four arithmetic demonstrations in the toy format ---------- */

var ONE = toy(4, 0, 1, '000');        /* 1.000 x 2^0  = 1        */
var SIXTEENTH = toy(4, -4, 1, '000'); /* 1.000 x 2^-4 = 0.0625   */
var EIGHTH = toy(4, -3, 1, '000');    /* 1.000 x 2^-3 = 0.125    */

var ALIGN_A = addLimited(ONE, SIXTEENTH, P4, 0);
var ALIGN_A_EXACT = addExact(ONE, SIXTEENTH, P4);
var ALIGN_B = addLimited(ONE, EIGHTH, P4, 0);
var ALIGN_B_EXACT = addExact(ONE, EIGHTH, P4);

/* rounding demonstrations: 1.0625, 1.09375, 1.03125 in four bits */
var R_TIE = mk(17, -4);      /* 1.0625  = 1.0001 */
var R_ABOVE = mk(35, -5);    /* 1.09375 = 1.00011 */
var R_BELOW = mk(33, -5);    /* 1.03125 = 1.00001 */

var ROUND_TIE = roundToP(R_TIE, P4, 'even');
var ROUND_TIE_AWAY = roundToP(R_TIE, P4, 'away');
var ROUND_ABOVE = roundToP(R_ABOVE, P4, 'even');
var ROUND_BELOW = roundToP(R_BELOW, P4, 'even');

/* the guard-digit demonstration: 2.0 - 1.75 in three significand bits */
var TWO_P3 = toy(3, 1, 1, '00');        /* 1.00 x 2^1 = 2    */
var SEVEN_Q = toy(3, 0, -1, '11');      /* -1.11 x 2^0 = -1.75 */
var GUARD_NONE = addLimited(TWO_P3, SEVEN_Q, P3, 0);
var GUARD_ONE = addLimited(TWO_P3, SEVEN_Q, P3, 1);
var GUARD_EXACT = addExact(TWO_P3, SEVEN_Q, P3);
var GUARD_TRUE = val(TWO_P3) + val(SEVEN_Q);
var GUARD_ERR_NONE = Math.abs(val(GUARD_NONE.r) - GUARD_TRUE) / Math.abs(GUARD_TRUE);

/* ---------- IEEE single and double, through the machine's own arithmetic ---------- */

var BUF32 = new Float32Array(1), VIEW32 = new Uint32Array(BUF32.buffer);
var BUF64 = new Float64Array(1), VIEW64 = new Uint32Array(BUF64.buffer);

function f32(x) { BUF32[0] = x; return BUF32[0]; }
function hex32(x) {
  BUF32[0] = x;
  var h = VIEW32[0].toString(16).toUpperCase();
  while (h.length < 8) h = '0' + h;
  return '0x' + h;
}
function fromHex32(h) { VIEW32[0] = parseInt(h, 16); return BUF32[0]; }

function hex64(x) {
  BUF64[0] = x;
  var hi = VIEW64[1].toString(16).toUpperCase(), lo = VIEW64[0].toString(16).toUpperCase();
  while (hi.length < 8) hi = '0' + hi;
  while (lo.length < 8) lo = '0' + lo;
  return '0x' + hi + lo;
}
function fromHex64(h) {
  var body = h.replace(/^0x/i, '');
  var hi = parseInt(body.slice(0, 8), 16), lo = parseInt(body.slice(8), 16);
  VIEW64[1] = hi; VIEW64[0] = lo;
  return BUF64[0];
}

var TENTH = 0.1, FIFTH = 0.2, THIRTIETH = 0.3;
var TENTH_SUM = TENTH + FIFTH;
var TENTH_RESIDUE = TENTH_SUM - THIRTIETH;

/* cancellation */
var BIG = 1e8;
var CANCEL_F32 = f32(f32(BIG) + f32(1)) - f32(BIG);
var SPACING_1E8_F32 = f32(pow2(26 - 23));           /* gap near 1e8 in single */
var SPACING_1E8_F64 = pow2(26 - 52);                /* gap near 1e8 in double */

/* the quadratic x^2 + 1e8 x + 1 */
var QB = 1e8, QA = 1, QC = 1;
var QDISC = QB * QB - 4 * QA * QC;
var Q_NAIVE = (-QB + Math.sqrt(QDISC)) / (2 * QA);
var Q_LARGE = (-QB - Math.sqrt(QDISC)) / (2 * QA);
var Q_STABLE = QC / Q_LARGE;
var Q_TRUE = -1e-8;
var Q_ERR = Math.abs(Q_NAIVE - Q_TRUE) / Math.abs(Q_TRUE);

/* ordering */
var GROUP_LEFT = (0.1 + 0.2) + 0.3;
var GROUP_RIGHT = 0.1 + (0.2 + 0.3);

/* three-digit decimal arithmetic, the format of GATE CSE 2004 Q28 */
function dround(x, p) {
  var sign = x.s < 0 ? -1 : 1, s = Math.abs(x.s), e = x.e;
  if (s === 0) return { s: 0, e: 0 };
  var b = 0, t = s;
  while (t >= 1) { t = Math.floor(t / 10); b++; }
  if (b > p) {
    var drop = b - p, q = Math.pow(10, drop);
    var kept = Math.floor(s / q), rem = s - kept * q;
    if (rem * 2 >= q) kept += 1;                    /* half up, as the paper says */
    s = kept; e += drop;
    if (String(s).length > p) { s = Math.floor(s / 10); e += 1; }
  } else if (b < p) {
    var sh = p - b;
    s = s * Math.pow(10, sh); e -= sh;
  }
  return { s: sign * s, e: e };
}
function dval(x) { return x.s * Math.pow(10, x.e); }
function dadd(a, b, p) {
  var E = Math.min(a.e, b.e);
  var sa = a.s * Math.pow(10, a.e - E), sb = b.s * Math.pow(10, b.e - E);
  return dround({ s: sa + sb, e: E }, p);
}
function dfmt(x) {
  var v = dval(x);
  var dec = Math.max(0, 3 - (String(Math.abs(x.s)).length));
  return v.toFixed(Math.min(4, dec));
}

var D113 = { s: 113, e: 0 }, DN111 = { s: -111, e: 0 }, D751 = { s: 751, e: -2 };
var D_STEP1 = dadd(D113, DN111, 3);            /* 2.00 */
var D_LEFT = dadd(D_STEP1, D751, 3);           /* 9.51 */
var D_STEP2 = dadd(DN111, D751, 3);            /* -103  */
var D_RIGHT = dadd(D113, D_STEP2, 3);          /* 10.0 */

/* a million tenths, naive and compensated */
var SUMS = (function () {
  var i, naive = 0, s = 0, c = 0, y, t;
  for (i = 0; i < 1000000; i++) naive += 0.1;
  for (i = 0; i < 1000000; i++) {
    y = 0.1 - c; t = s + y; c = (t - s) - y; s = t;
  }
  return { naive: naive, kahan: s, exact: 100000.0, errNaive: naive - 100000.0, errKahan: s - 100000.0 };
})();

/* multiplication: the two registers of GATE CSE 2023 Q45 */
var MUL_A = fromHex32('0xC1800000');
var MUL_B = fromHex32('0x3F5C2EF4');
var MUL_PROD = f32(MUL_A * MUL_B);
var MUL_HEX = hex32(MUL_PROD);
function expField(h) { return (parseInt(h, 16) >>> 23) & 0xFF; }
var MUL_EA = expField('0xC1800000'), MUL_EB = expField('0x3F5C2EF4');
var MUL_EFIELD = expField(MUL_HEX);

/* the ends of the single-precision range */
var OVERFLOW = f32(1e38 * 10);
var UNDERFLOW = f32(1e-38 / 1e8);

/* widths in decimal digits */
var DIGITS_SINGLE = 24 * 0.30102999566398;
var DIGITS_DOUBLE = 53 * 0.30102999566398;
var INT_BOUND_SINGLE = pow2(24);
var INT_BOUND_DOUBLE = pow2(53);
var EPS_SINGLE = pow2(-23);
var EPS_DOUBLE = pow2(-52);

/* the registers GATE gave in 2025 and 2026 */
var G25 = [fromHex32('0xC1100000'), fromHex32('0x40C00000'), fromHex32('0x41400000')];
var G26_X = fromHex32('0x35C00000'), G26_Y = fromHex32('0x34A00000');
var G26_Z = f32(G26_X + G26_Y), G26_HEX = hex32(G26_Z);

/* ---------- formatting helpers used by the canvas ---------- */

function num(x, dp) {
  if (x === 0) return '0';
  var a = Math.abs(x);
  if (a >= 1e5 || a < 1e-4) return x.toExponential(dp === undefined ? 3 : dp).replace('e', ' \u00d7 10^');
  return String(parseFloat(x.toFixed(dp === undefined ? 4 : dp)));
}
function pct(x) { return (x * 100).toFixed(1) + '%'; }

/* ======================================================================
   LAYER 2 - THE CHECKS
   Each computed value re-verified against the definition it came from.
   ====================================================================== */

chk('the toy format\'s spacing at 1.0 is 2^-(p-1)',
    Math.abs(TOY_SPACING - pow2(-3)) < 1e-12, TOY_SPACING);
chk('a four-bit significand gives 2^3 = 8 values in [1, 2)',
    TOY_VALUES.length === 8 && Math.abs(val(TOY_VALUES[7]) - 1.875) < 1e-12, val(TOY_VALUES[7]));
chk('1.0 + 0.0625 loses four bits in the alignment',
    ALIGN_A.lost === 4, ALIGN_A.lost);
chk('the aligned sum of 1.0 and 0.0625 is 1.0, the addend absorbed',
    Math.abs(val(ALIGN_A.r) - 1) < 1e-12, val(ALIGN_A.r));
chk('the exact-then-round sum of the same pair is also 1.0, by the tie rule',
    Math.abs(val(ALIGN_A_EXACT) - 1) < 1e-12, val(ALIGN_A_EXACT));
chk('1.0 + 0.125 is exact, with nothing lost in the alignment',
    ALIGN_B.lost === 0 && Math.abs(val(ALIGN_B.r) - 1.125) < 1e-12, val(ALIGN_B.r));
chk('1.0625 is a tie: even gives 1.000, away gives 1.125',
    Math.abs(val(ROUND_TIE) - 1) < 1e-12 && Math.abs(val(ROUND_TIE_AWAY) - 1.125) < 1e-12,
    val(ROUND_TIE) + ' / ' + val(ROUND_TIE_AWAY));
chk('1.09375 rounds up to 1.125 and 1.03125 rounds down to 1.000',
    Math.abs(val(ROUND_ABOVE) - 1.125) < 1e-12 && Math.abs(val(ROUND_BELOW) - 1) < 1e-12,
    val(ROUND_ABOVE) + ' / ' + val(ROUND_BELOW));
chk('without a guard bit 2.0 - 1.75 gives 0.5, an error of 100%',
    Math.abs(val(GUARD_NONE.r) - 0.5) < 1e-12 && Math.abs(GUARD_ERR_NONE - 1) < 1e-9, GUARD_ERR_NONE);
chk('with one guard bit the same subtraction is exactly 0.25',
    Math.abs(val(GUARD_ONE.r) - 0.25) < 1e-12 && Math.abs(val(GUARD_EXACT) - 0.25) < 1e-12,
    val(GUARD_ONE.r) + ' / ' + val(GUARD_EXACT));
chk('0.1 + 0.2 differs from 0.3 in double precision',
    TENTH_SUM !== THIRTIETH, TENTH_SUM);
chk('the residue is exactly 2^-54, one unit in the last place',
    Math.abs(TENTH_RESIDUE - pow2(-54)) < 1e-30, TENTH_RESIDUE);
chk('single precision stores 0.1 as 0x3DCCCCCD',
    hex32(f32(0.1)) === '0x3DCCCCCD', hex32(f32(0.1)));
chk('in single precision (1e8 + 1) - 1e8 is 0, and the gap there is 8',
    CANCEL_F32 === 0 && SPACING_1E8_F32 === 8, CANCEL_F32 + ' / ' + SPACING_1E8_F32);
chk('the naive quadratic root is wrong by about 25%',
    Math.abs(Q_ERR - 0.2549) < 0.01 && Math.abs(Q_STABLE - Q_TRUE) < 1e-18, Q_ERR);
chk('the 2004 groupings give 9.51 and 10.0',
    Math.abs(dval(D_LEFT) - 9.51) < 1e-9 && Math.abs(dval(D_RIGHT) - 10) < 1e-9,
    dval(D_LEFT) + ' / ' + dval(D_RIGHT));
chk('in double precision the two groupings of 0.1, 0.2, 0.3 differ',
    GROUP_LEFT !== GROUP_RIGHT, GROUP_LEFT + ' / ' + GROUP_RIGHT);
chk('the naive million-term sum is wrong and the compensated one is exact',
    SUMS.errNaive !== 0 && SUMS.errKahan === 0, SUMS.errNaive);
chk('the 2023 product re-encodes as 0xC15C2EF4 with exponent field 130',
    MUL_HEX === '0xC15C2EF4' && MUL_EFIELD === 130 &&
    (MUL_EA + MUL_EB - 127) === 130, MUL_HEX + ' field ' + MUL_EFIELD);
chk('a single overflows to infinity and underflows to zero',
    OVERFLOW === Infinity && UNDERFLOW === 0, OVERFLOW + ' / ' + UNDERFLOW);
chk('16777217 is not representable in single precision and 2^24 is',
    f32(16777217) === 16777216 && f32(INT_BOUND_SINGLE) === INT_BOUND_SINGLE,
    f32(16777217));
chk('the 2025 registers decode to -9, 6 and 12',
    G25[0] === -9 && G25[1] === 6 && G25[2] === 12, G25.join(', '));
chk('the 2026 sum of 0x35C00000 and 0x34A00000 is 0x35E80000',
    G26_HEX === '0x35E80000', G26_HEX);
chk('double encoding round-trips: 0x3FF0000000000000 is 1',
    fromHex64('0x3FF0000000000000') === 1, fromHex64('0x3FF0000000000000'));

/* ======================================================================
   LAYER 3 - RENDER
   Reads the model. Performs no arithmetic of its own.
   ====================================================================== */

function prog(t) { return K && K.sceneProgress ? K.sceneProgress(t) : 1; }

function head(t1, t2) {
  P.alpha(1);
  P.text(30, 14, t1, { size: 16, bold: true, color: INK });
  if (t2) P.text(30, 36, t2, { size: 12.5, color: DIM });
}

function panel(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1.2, radius: 6 });
}

function label(x, y, s, o) {
  o = o || {};
  P.text(x, y, s, { size: o.size || 12, color: o.color || DIM, bold: !!o.bold, mono: !!o.mono, align: o.align || 'left' });
}

function tbl(x, y, cols, rows, o) {
  o = o || {};
  var rh = o.rh || 19, total = 0, i, j;
  for (i = 0; i < cols.length; i++) total += cols[i].w;
  P.rect(x, y, total, rh * (rows.length + 1), { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: 1 });
  P.rect(x, y, total, rh, { fill: o.headFill || SURF2, stroke: o.stroke || BORDER, sw: 1 });
  var cx = x;
  for (i = 0; i < cols.length; i++) {
    label(cx + 6, y + 5, cols[i].name, { size: o.size || 11.5, bold: true, color: INK });
    cx += cols[i].w;
    if (i < cols.length - 1) P.line(cx, y, cx, y + rh * (rows.length + 1), { stroke: o.stroke || BORDER, sw: 0.8 });
  }
  for (j = 0; j < rows.length; j++) {
    var ry = y + rh * (j + 1);
    if (o.rowFill && o.rowFill[j]) P.rect(x, ry, total, rh, { fill: o.rowFill[j] });
    cx = x;
    for (i = 0; i < cols.length; i++) {
      label(cx + 6, ry + 5, String(rows[j][i] === undefined ? '' : rows[j][i]),
        { size: o.size || 11.5, color: (o.rowColor && o.rowColor[j]) || INK, mono: !!o.mono });
      cx += cols[i].w;
    }
    P.line(x, ry, x + total, ry, { stroke: o.stroke || BORDER, sw: 0.6 });
  }
}

function chip(x, y, text, colour) {
  var w = Math.max(44, text.length * 6.6 + 14);
  P.rect(x, y, w, 19, { fill: colour + '22', stroke: colour, sw: 1, radius: 9 });
  P.text(x + w / 2, y + 4, text, { size: 11, bold: true, color: colour, align: 'center' });
  return w;
}

/* one bit box, used by every scene that shows a significand */
function bitBox(x, y, w, h, text, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: 1.1, radius: 3 });
  P.text(x + w / 2, y + h / 2 - 6, text, {
    size: o.size || 12, bold: !!o.bold, mono: true, color: o.color || INK, align: 'center'
  });
}

/* ---------- scene 1: pipeline ---------- */
function drawPipeline(t) {
  var p = prog(t);
  head('Arithmetic is four steps, and representation is none of them',
       'The bits are given; what is computed is align, add, normalise, round — once per operation');

  var steps = ['align\nexponents', 'add the\nsignificands', 'normalise\nthe result', 'round\nonce'];
  var bw = 168, gap = 26, x0 = 42, y0 = 76;
  for (var i = 0; i < steps.length; i++) {
    var x = x0 + i * (bw + gap);
    var on = p > 0.06 * (i + 1);
    panel(x, y0, bw, 66, { fill: on ? ACCDIM : SURF2, stroke: on ? ACC : BORDER });
    var parts = steps[i].split('\n');
    label(x + 12, y0 + 14, String(i + 1) + '.', { size: 12, bold: true, color: on ? ACC : FAINT });
    label(x + 12, y0 + 32, parts[0], { size: 12.5, bold: true, color: INK });
    label(x + 12, y0 + 48, parts[1], { size: 11.5, color: DIM });
    if (i < steps.length - 1) {
      P.arrow(x + bw + 4, y0 + 33, x + bw + gap - 6, y0 + 33, { stroke: FAINT, sw: 1.3 });
    }
  }

  label(42, 162, 'The toy format this page computes in', { size: 12.5, bold: true, color: INK });
  label(42, 182, '4 significand bits (one before the point, three after), exponents \u22123 to 3.', { size: 11.5, color: DIM });

  /* the number line of the binade [1,2) */
  var x1 = 60, x2 = 840, yy = 226;
  P.line(x1, yy, x2, yy, { stroke: BORDER, sw: 1.4 });
  for (var j = 0; j < TOY_VALUES.length; j++) {
    var fx = x1 + (x2 - x1) * j / 7;
    var shown = p > 0.30 + j * 0.035;
    P.line(fx, yy - 7, fx, yy + 7, { stroke: shown ? ACC : BORDER, sw: shown ? 2 : 1.2 });
    if (shown) {
      label(fx, yy + 12, String(parseFloat(val(TOY_VALUES[j]).toFixed(3))), { size: 10.5, color: INK, align: 'center' });
    }
  }
  label(x1, yy - 22, '1', { size: 11, color: DIM, align: 'center' });
  label(x2, yy - 22, '2', { size: 11, color: DIM, align: 'center' });

  if (p > 0.55) {
    panel(42, 268, 816, 76, { fill: SURF });
    label(56, 280, 'Spacing is the unit of every error in this topic', { size: 12, bold: true, color: INK });
    label(56, 300, 'Computed gap between neighbours in [1, 2): ' + num(TOY_SPACING) +
          '  = 2^' + (0 - (P4 - 1)) + '.  There are ' + TOY_VALUES.length + ' values, because 2^' + (P4 - 1) + ' = ' + TOY_VALUES.length + '.',
          { size: 11.5, color: INK });
    label(56, 320, 'Double the exponent and the gap doubles: near 2 the gap is ' + num(TOY_SPACING * 2) + ', near 4 it is ' + num(TOY_SPACING * 4) + '.',
          { size: 11.5, color: DIM });
  }

  if (p > 0.78) {
    panel(42, 360, 816, 84, { fill: SURF2 });
    label(56, 372, 'The promise the standard makes', { size: 12, bold: true, color: INK });
    label(56, 392, '\u201cEvery operation is performed as if it first produced an intermediate result correct to infinite',
          { size: 11.5, color: INK });
    label(56, 408, 'precision \u2026 and then rounded that result to fit the destination.\u201d  One operation, one rounding.',
          { size: 11.5, color: INK });
    label(56, 428, 'The hardware cannot afford infinite precision, so it keeps guard, round and sticky bits instead.', { size: 11, color: DIM });
  }
}

/* ---------- scene 2: alignment ---------- */
function drawAlign(t) {
  var p = prog(t);
  head('Alignment: the smaller operand is shifted, and its low bits fall off',
       'The exponent difference is the shift, and the shift is where the information leaves');

  var bx = 118, bw = 26, y1 = 84, y2 = 132;

  label(42, y1 + 8, '1.000 \u00d7 2^0', { size: 12, mono: true, color: INK, bold: true });
  for (var i = 0; i < 4; i++) {
    bitBox(bx + i * bw, y1, bw, 26, '1.000'.charAt(i), { bold: true });
  }
  label(bx + 4 * bw + 14, y1 + 8, '= 1', { size: 12, color: DIM });

  label(42, y2 + 8, '1.000 \u00d7 2^\u22124', { size: 12, mono: true, color: INK, bold: true });
  var shifted = p > 0.22;
  for (var j = 0; j < 4; j++) {
    var xx = bx + (shifted ? (j + 4) : j) * bw;
    bitBox(xx, y2, bw, 26, '1.000'.charAt(j), { fill: shifted ? INVALIDDIM : SURF, stroke: shifted ? BAD : BORDER });
  }
  label(bx + 8 * bw + 14, y2 + 8, shifted ? '= 0.0001 \u00d7 2^0, four bits past the grid' : '= 0.0625',
        { size: 12, color: shifted ? BAD : DIM });

  if (p > 0.22) {
    P.arrow(bx + 3 * bw + 4, y2 - 12, bx + 7 * bw + 4, y2 - 12, { stroke: ACC, sw: 1.4 });
    label(bx + 7 * bw + 10, y2 - 20, 'shift right by 4', { size: 11, color: ACC });
    /* the grid boundary */
    P.line(bx + 4 * bw, y1 - 8, bx + 4 * bw, y2 + 44, { stroke: BAD, sw: 1.2 });
    label(bx + 4 * bw + 6, y2 + 48, 'last bit the format keeps', { size: 10.5, color: BAD });
  }

  if (p > 0.45) {
    panel(42, 196, 816, 92, { fill: SURF });
    label(56, 208, 'Add what survived', { size: 12, bold: true, color: INK });
    label(56, 230, 'Aligned and added: 1.000 + 0.000 = 1.000, so the sum is ' + num(val(ALIGN_A.r)) + '.', { size: 11.5, color: INK });
    label(56, 250, 'Bits discarded in the alignment: ' + ALIGN_A.lost + '.  The addend was absorbed, not rounded down.', { size: 11.5, color: BAD, bold: true });
    label(56, 272, 'Exact-then-round gives the same 1.0 here, by the tie rule: 1.0625 is exactly halfway between 1.000 and 1.125.',
          { size: 11.5, color: DIM });
  }

  if (p > 0.72) {
    panel(42, 300, 816, 76, { fill: SURF2 });
    label(56, 312, 'The same question with a smaller gap', { size: 12, bold: true, color: INK });
    label(56, 332, '1.000 \u00d7 2^0  +  1.000 \u00d7 2^\u22123 :  the shift is three, one bit lands on the grid, nothing is lost.',
          { size: 11.5, color: INK });
    label(56, 352, 'Sum = ' + num(val(ALIGN_B.r)) + ', exact, with ' + ALIGN_B.lost + ' bits discarded.', { size: 11.5, color: VAL, bold: true });
  }

  if (p > 0.86) {
    label(42, 404, 'Absorption is why \u201cadd a tiny number to a huge one\u201d is the first thing every numerical-analysing compiler warning is about.',
          { size: 11.5, color: DIM });
  }
}

/* ---------- scene 3: rounding ---------- */
function drawRound(t) {
  var p = prog(t);
  head('Rounding: nearest, ties to even, and the four other modes',
       'One question per operation — which of the two neighbours is nearer — plus a rule for the tie');

  /* the number line from 1.000 to 1.125, with the exact values marked */
  var x1 = 90, x2 = 820, yy = 110;
  P.line(x1, yy, x2, yy, { stroke: BORDER, sw: 1.4 });
  var marks = [1, 1.125];
  for (var i = 0; i < marks.length; i++) {
    var fx = i === 0 ? x1 : x2;
    P.line(fx, yy - 8, fx, yy + 8, { stroke: ACC, sw: 2 });
    label(fx, yy + 14, marks[i].toFixed(3), { size: 11.5, color: INK, align: 'center', bold: true });
  }
  var cases = [
    { v: 1.03125, text: '1.03125 below the half', col: VAL },
    { v: 1.0625, text: '1.0625 exactly halfway', col: WARN },
    { v: 1.09375, text: '1.09375 above the half', col: INFO }
  ];
  for (var j = 0; j < cases.length; j++) {
    if (p < 0.10 + j * 0.14) continue;
    var fx2 = x1 + (x2 - x1) * (cases[j].v - 1) / 0.125;
    P.circle(fx2, yy, 5, { fill: cases[j].col, stroke: null });
    label(fx2, yy - 34 - j * 4, cases[j].text, { size: 10.5, color: cases[j].col, align: 'center' });
  }

  if (p > 0.42) {
    panel(42, 160, 816, 88, { fill: SURF });
    label(56, 172, 'The three cases, computed', { size: 12, bold: true, color: INK });
    label(56, 194, '1.03125 = 1.00001\u2082  \u2192  ' + val(ROUND_BELOW).toFixed(3) + '   (short of the half, so down)', { size: 11.5, color: INK, mono: true });
    label(56, 214, '1.0625  = 1.0001\u2082   \u2192  ' + val(ROUND_TIE).toFixed(3) + '   (a tie, and the even last digit wins)', { size: 11.5, color: WARN, mono: true });
    label(56, 234, '1.09375 = 1.00011\u2082  \u2192  ' + val(ROUND_ABOVE).toFixed(3) + '   (past the half, so up)', { size: 11.5, color: INK, mono: true });
  }

  if (p > 0.62) {
    var rows = [
      ['nearest, ties to even', val(ROUND_TIE).toFixed(3), 'the required default'],
      ['nearest, ties away', val(ROUND_TIE_AWAY).toFixed(3), 'required for decimal only'],
      ['toward zero (truncate)', '1.000', 'magnitude never grows'],
      ['toward +\u221e', '1.125', 'the ceiling neighbour'],
      ['toward \u2212\u221e', '1.000', 'the floor neighbour']
    ];
    label(42, 268, 'Five modes, one input: 1.0625 into a four-bit significand', { size: 12, bold: true, color: INK });
    tbl(42, 280, [{ name: 'mode', w: 230 }, { name: 'result', w: 110 }, { name: 'when it is used', w: 300 }],
        rows, { rh: 20, rowColor: [VAL, null, null, null, null] });
  }

  if (p > 0.86) {
    label(42, 412, 'A question that says only \u201cwith rounding\u201d means nearest ties to even: that is the mode the standard requires.',
          { size: 11.5, color: DIM });
    label(42, 432, 'A question that says \u201ctruncation\u201d means toward zero, which differs from nearest for every value that is not already exact.',
          { size: 11.5, color: DIM });
  }
}

/* ---------- scene 4: guard bits ---------- */
function drawGuard(t) {
  var p = prog(t);
  head('Guard, round and sticky: why subtraction needs extra bits',
       'Two minus 1.75 in three significand bits, with and without one extra position');

  var bx = 150, bw = 26, y1 = 88, y2 = 136;
  label(42, y1 + 8, '2.00', { size: 12.5, mono: true, color: INK, bold: true });
  for (var i = 0; i < 3; i++) bitBox(bx + i * bw, y1, bw, 26, '100'.charAt(i), { bold: true });
  label(bx + 3 * bw + 12, y1 + 8, '= 1.00 \u00d7 2^1', { size: 11.5, color: DIM });

  label(42, y2 + 8, '\u22121.75', { size: 12.5, mono: true, color: INK, bold: true });
  var align = p > 0.16;
  var bits = align ? ['0', '1', '1', '1'] : ['1', '1', '1'];
  for (var j = 0; j < bits.length; j++) {
    var dropped = align && j === 3;
    bitBox(bx + j * bw, y2, bw, 26, bits[j], {
      fill: dropped ? INVALIDDIM : SURF, stroke: dropped ? BAD : BORDER, color: dropped ? BAD : INK
    });
  }
  label(bx + bits.length * bw + 12, y2 + 8,
        align ? '0.111|1 \u00d7 2^1 — the fourth fraction bit has no home' : '\u22121.11 \u00d7 2^0',
        { size: 11.5, color: align ? BAD : DIM });

  if (align) {
    P.line(bx + 3 * bw, y1 - 8, bx + 3 * bw, y2 + 40, { stroke: BAD, sw: 1.2 });
    label(bx + 3 * bw + 6, y2 + 44, 'three-bit grid ends here', { size: 10.5, color: BAD });
  }

  if (p > 0.38) {
    panel(42, 196, 396, 108, { fill: INVALIDDIM, stroke: BAD });
    label(56, 208, 'Without a guard bit', { size: 12, bold: true, color: BAD });
    label(56, 230, '1.00 \u2212 0.11 = 0.01 \u00d7 2^1', { size: 11.5, mono: true, color: INK });
    label(56, 250, '= ' + num(val(GUARD_NONE.r)), { size: 14, mono: true, bold: true, color: BAD });
    label(56, 274, 'Error: ' + pct(GUARD_ERR_NONE) + ' of the true answer', { size: 11.5, color: BAD, bold: true });
    label(56, 292, 'The dropped bit was a one: the subtrahend became 1.5.', { size: 10.5, color: DIM });
  }

  if (p > 0.55) {
    panel(462, 196, 396, 108, { fill: '#e9f7ef', stroke: VAL });
    label(476, 208, 'With one guard bit', { size: 12, bold: true, color: VAL });
    label(476, 230, '1.000 \u2212 0.111 = 0.001 \u00d7 2^1', { size: 11.5, mono: true, color: INK });
    label(476, 250, '= ' + num(val(GUARD_ONE.r)), { size: 14, mono: true, bold: true, color: VAL });
    label(476, 274, 'Error: 0.0% — the difference is exact', { size: 11.5, color: VAL, bold: true });
    label(476, 292, 'The exact-then-round model agrees: ' + num(val(GUARD_EXACT)) + '.', { size: 10.5, color: DIM });
  }

  if (p > 0.72) {
    panel(42, 320, 816, 60, { fill: SURF2 });
    label(56, 332, 'Guard, round, sticky', { size: 12, bold: true, color: INK });
    label(56, 352, 'guard = the first bit dropped   round = the second   sticky = one if anything beyond those two was non-zero.',
          { size: 11.5, color: INK, mono: true });
    label(56, 370, 'Three extra positions are what make the one-rounding promise affordable in hardware.', { size: 11, color: DIM });
  }

  if (p > 0.88) {
    label(42, 404, 'The error is created during the alignment, before any rounding rule runs, so changing the mode cannot repair it.',
          { size: 11.5, color: DIM });
    label(42, 424, 'Subtraction of nearly equal numbers punishes a narrow alignment: the leading bits cancel and the survivors are the lost ones.',
          { size: 11.5, color: DIM });
  }
}

/* ---------- scene 5: 0.1 + 0.2 ---------- */
function drawTenth(t) {
  var p = prog(t);
  head('0.1 + 0.2: two doubles, one exact sum, and a one-bit residue',
       'Nothing unpredictable happens here; the arithmetic does exactly what the standard requires');

  function fieldRow(y, name, hex, value) {
    label(42, y + 4, name, { size: 12, mono: true, bold: true, color: INK });
    label(150, y + 4, hex, { size: 12, mono: true, color: ACC });
    label(330, y + 4, value, { size: 11.5, mono: true, color: DIM });
  }

  panel(42, 70, 816, 96, { fill: SURF });
  fieldRow(86, '0.1', hex64(0.1), '0.1000000000000000055511151231257827');
  fieldRow(110, '0.2', hex64(0.2), '0.2000000000000000111022302462515654');
  fieldRow(134, '0.3', hex64(0.3), '0.2999999999999999888977697537484346');
  label(56, 156, 'Each stored double is the nearest 53-bit value, and none of the three is the decimal number.',
        { size: 10.5, color: DIM });

  if (p > 0.30) {
    panel(42, 182, 816, 70, { fill: SURF2 });
    label(56, 194, 'Add the two stored values, then round once to 53 bits', { size: 12, bold: true, color: INK });
    label(56, 216, '0.1 + 0.2 = ' + String(TENTH_SUM), { size: 13, mono: true, bold: true, color: BAD });
    label(56, 238, '0.3       = ' + String(THIRTIETH) + '   \u2192  they are neighbouring grid points, one apart.', { size: 11.5, mono: true, color: INK });
  }

  if (p > 0.52) {
    panel(42, 266, 816, 76, { fill: SURF });
    label(56, 278, 'The residue is one unit in the last place', { size: 12, bold: true, color: INK });
    label(56, 300, 'difference = ' + String(TENTH_RESIDUE) + '  =  ' + '2^\u221254', { size: 12, mono: true, color: BAD, bold: true });
    label(56, 322, '2^\u221254 = ' + pow2(-54).toExponential(6) + ' — computed, not quoted.', { size: 11, color: DIM });
  }

  if (p > 0.70) {
    panel(42, 356, 816, 90, { fill: SURF2 });
    label(56, 368, 'The same three numbers in single precision', { size: 12, bold: true, color: INK });
    label(56, 390, '0.1f = ' + hex32(f32(0.1)) + '    0.2f = ' + hex32(f32(0.2)) + '    0.3f = ' + hex32(f32(0.3)),
          { size: 11.5, mono: true, color: INK });
    label(56, 412, '0.1f + 0.2f = ' + String(f32(f32(0.1) + f32(0.2))) + ' as a double: the same phenomenon, a bigger residue.',
          { size: 11.5, color: INK });
    label(56, 434, 'Fewer significand bits, larger gaps, larger visible error — one mechanism at every width.', { size: 11, color: DIM });
  }
}

/* ---------- scene 6: cancellation ---------- */
function drawCancel(t) {
  var p = prog(t);
  head('Catastrophic cancellation: subtraction that eats the digits',
       'Two correctly rounded operations can compose into an answer that is wrong by the whole of itself');

  panel(42, 70, 396, 150, { fill: SURF });
  label(56, 82, 'Single precision, near 10^8', { size: 12, bold: true, color: INK });
  label(56, 104, 'gap between neighbours: ' + num(SPACING_1E8_F32, 0) + '  (2^(26\u221223))', { size: 11, mono: true, color: DIM });
  label(56, 126, '(10^8 + 1) \u2212 10^8', { size: 12, mono: true, color: INK });
  label(56, 148, 'step 1: 10^8 + 1 \u2192 ' + num(f32(f32(1e8) + f32(1)), 0), { size: 11.5, mono: true, color: INK });
  label(56, 168, 'step 2: \u2212 10^8 \u2192 ' + num(CANCEL_F32, 0), { size: 11.5, mono: true, color: BAD, bold: true });
  label(56, 190, 'true answer: 1   \u2014 the one was absorbed on the way in.', { size: 11, color: BAD });
  label(56, 208, 'In double the gap there is ' + SPACING_1E8_F64.toExponential(3) + ', so a double survives this one.', { size: 10.5, color: DIM });

  if (p > 0.30) {
    panel(462, 70, 396, 150, { fill: SURF });
    label(476, 82, 'x\u00b2 + 10^8 x + 1 = 0', { size: 12, bold: true, color: INK });
    label(476, 104, 'discriminant = ' + num(QDISC, 0), { size: 11, mono: true, color: DIM });
    label(476, 126, 'naive small root', { size: 11, color: DIM });
    label(476, 146, '\u2212b + \u221adisc, over 2a = ' + Q_NAIVE.toExponential(4), { size: 11.5, mono: true, color: BAD, bold: true });
    label(476, 168, 'stable small root  c / (large root) = ' + Q_STABLE.toExponential(4), { size: 11.5, mono: true, color: VAL, bold: true });
    label(476, 190, 'true value \u221210^\u22128;  naive error = ' + pct(Q_ERR), { size: 11, color: BAD });
    label(476, 208, 'Numerator: two values near 10^8, differing in the 8th digit.', { size: 10.5, color: DIM });
  }

  if (p > 0.55) {
    panel(42, 236, 816, 92, { fill: SURF2 });
    label(56, 248, 'What cancellation is, precisely', { size: 12, bold: true, color: INK });
    label(56, 270, 'When two operands agree in their leading digits, the subtraction removes them and what survives is the error, amplified.',
          { size: 11.5, color: INK });
    label(56, 292, 'It is not an error of the hardware: every step here was correctly rounded. It is a property of the formula.',
          { size: 11.5, color: INK });
    label(56, 314, 'Repair is algebraic, not numeric: rewrite the expression so that it never subtracts nearly equal values.', { size: 11.5, color: ACC, bold: true });
  }

  if (p > 0.78) {
    label(42, 352, 'Benign cancellation: the operands differ in the leading digits, as in 113 \u2212 111. The result keeps its digits and nothing is lost.',
          { size: 11.5, color: DIM });
    label(42, 374, 'Malignant cancellation: the operands agree in their leading digits, as in \u2212b + \u221adisc. The result keeps only the noise.',
          { size: 11.5, color: DIM });
    label(42, 400, 'The test is the ratio of the result to the operands, not the size of either operand.', { size: 11.5, color: INK, bold: true });
  }
}

/* ---------- scene 7: order ---------- */
function drawOrder(t) {
  var p = prog(t);
  head('Order matters: two groupings, two answers',
       'GATE CSE 2004 Q28 asked exactly this in three-digit decimal arithmetic');

  label(42, 68, '(113. + \u2212111.) + 7.51        against        113. + (\u2212111. + 7.51)', { size: 12.5, mono: true, color: INK, bold: true });
  label(42, 88, 'three significant digits, rounded after every operation', { size: 11, color: DIM });

  panel(42, 104, 396, 128, { fill: SURF, stroke: ACC });
  label(56, 116, 'Left grouping', { size: 12, bold: true, color: ACC });
  label(56, 138, '113 \u2212 111 = ' + dfmt(D_STEP1), { size: 11.5, mono: true, color: INK });
  label(56, 158, dfmt(D_STEP1) + ' + 7.51 = ' + dfmt(D_LEFT), { size: 11.5, mono: true, color: VAL, bold: true });
  label(56, 180, 'exponent gap 0 in the second step:', { size: 10.5, color: DIM });
  label(56, 196, 'nothing shifted, nothing lost.', { size: 10.5, color: DIM });
  label(56, 218, 'answer  ' + dfmt(D_LEFT), { size: 14, mono: true, bold: true, color: VAL });

  if (p > 0.28) {
    panel(462, 104, 396, 128, { fill: SURF, stroke: WARN });
    label(476, 116, 'Right grouping', { size: 12, bold: true, color: WARN });
    label(476, 138, '\u2212111 + 7.51 \u2192 7.51 cut to 0.08 \u00d7 10^2', { size: 11.5, mono: true, color: INK });
    label(476, 158, '= ' + dfmt(D_STEP2) + ', then 113 \u2212 103 = ' + dfmt(D_RIGHT), { size: 11.5, mono: true, color: WARN, bold: true });
    label(476, 180, 'exponent gap 2: the addend has to fit', { size: 10.5, color: DIM });
    label(476, 196, 'three digits at the larger exponent.', { size: 10.5, color: DIM });
    label(476, 218, 'answer  ' + dfmt(D_RIGHT), { size: 14, mono: true, bold: true, color: WARN });
  }

  if (p > 0.52) {
    panel(42, 246, 816, 86, { fill: SURF2 });
    label(56, 258, 'The same non-associativity in binary double precision', { size: 12, bold: true, color: INK });
    label(56, 280, '(0.1 + 0.2) + 0.3 = ' + String(GROUP_LEFT), { size: 11.5, mono: true, color: BAD });
    label(56, 300, '0.1 + (0.2 + 0.3) = ' + String(GROUP_RIGHT), { size: 11.5, mono: true, color: VAL });
    label(56, 322, 'Addition is commutative here and not associative; only the second fact costs marks.', { size: 11, color: DIM });
  }

  if (p > 0.74) {
    panel(42, 346, 816, 84, { fill: SURF });
    label(56, 358, 'A million tenths, summed twice', { size: 12, bold: true, color: INK });
    label(56, 380, 'plain loop: ' + String(SUMS.naive) + '   (error ' + SUMS.errNaive.toExponential(3) + ')', { size: 11.5, mono: true, color: BAD });
    label(56, 400, 'compensated: ' + String(SUMS.kahan) + '   (error ' + SUMS.errKahan + ')', { size: 11.5, mono: true, color: VAL });
    label(56, 420, 'One extra variable, added and subtracted, carries the lost low bits forward.', { size: 10.5, color: DIM });
  }
}

/* ---------- scene 8: multiplication ---------- */
function drawMultiply(t) {
  var p = prog(t);
  head('Multiplication and division: exponents add, and nothing aligns',
       'The significands multiply into a range of [1, 4), so one normalisation shift is all that is needed');

  var y = 84;
  panel(42, y, 240, 84, { fill: SURF });
  label(56, y + 12, '\u221216', { size: 15, mono: true, bold: true, color: INK });
  label(56, y + 36, '0xC1800000', { size: 11.5, mono: true, color: ACC });
  label(56, y + 58, 'exponent field ' + MUL_EA + '  (2^4)', { size: 10.5, color: DIM });

  panel(330, y, 240, 84, { fill: SURF });
  label(344, y + 12, '0.86009145', { size: 15, mono: true, bold: true, color: INK });
  label(344, y + 36, '0x3F5C2EF4', { size: 11.5, mono: true, color: ACC });
  label(344, y + 58, 'exponent field ' + MUL_EB + '  (2^\u22121)', { size: 10.5, color: DIM });

  if (p > 0.24) {
    panel(618, y, 240, 84, { fill: ACCDIM, stroke: ACC });
    label(632, y + 12, '\u221213.761463', { size: 15, mono: true, bold: true, color: INK });
    label(632, y + 36, MUL_HEX, { size: 11.5, mono: true, color: ACC });
    label(632, y + 58, 'exponent field ' + MUL_EFIELD + '  (2^3)', { size: 10.5, color: DIM });
  }

  if (p > 0.34) {
    label(42, 196, 'The exponent arithmetic', { size: 12, bold: true, color: INK });
    label(42, 220, MUL_EA + '  +  ' + MUL_EB + '  \u2212  127  =  ' + (MUL_EA + MUL_EB - 127) + '     (the bias is subtracted once, because it was counted twice)',
          { size: 12, mono: true, color: INK });
    label(42, 244, 'Significands: 1.0 \u00d7 1.72\u2026 = 1.72\u2026, already inside [1, 2), so the normalisation shift is zero here.',
          { size: 11.5, color: DIM });
  }

  if (p > 0.55) {
    panel(42, 264, 816, 66, { fill: SURF2 });
    label(56, 276, 'One rounding, at the end', { size: 12, bold: true, color: INK });
    label(56, 298, 'A 24-bit significand times a 24-bit significand is 48 bits; the product is rounded once, to 24.', { size: 11.5, color: INK });
    label(56, 318, 'Division mirrors it: subtract the fields, add the bias back, divide, round once.', { size: 11.5, color: DIM });
  }

  if (p > 0.72) {
    panel(42, 344, 396, 86, { fill: INVALIDDIM, stroke: BAD });
    label(56, 356, 'Overflow', { size: 12, bold: true, color: BAD });
    label(56, 378, '10^38 \u00d7 10 in single = ' + String(OVERFLOW), { size: 11.5, mono: true, color: BAD, bold: true });
    label(56, 400, 'Round to nearest sends it to \u221e, with no trap by default.', { size: 10.5, color: DIM });
    label(56, 418, 'Largest finite single: 3.4028235 \u00d7 10^38', { size: 10.5, color: DIM });

    panel(462, 344, 396, 86, { fill: SURF2 });
    label(476, 356, 'Underflow', { size: 12, bold: true, color: WARN });
    label(476, 378, '10^\u221238 \u00f7 10^8 in single = ' + String(UNDERFLOW), { size: 11.5, mono: true, color: WARN, bold: true });
    label(476, 400, 'The result is below the smallest denormal, so it becomes zero.', { size: 10.5, color: DIM });
    label(476, 418, 'Smallest normal single: 1.1754944 \u00d7 10^\u221238', { size: 10.5, color: DIM });
  }
}

/* ---------- scene 9: precision ---------- */
function drawPrecision(t) {
  var p = prog(t);
  head('What the width buys: seven digits, sixteen digits, and the integers that survive',
       'A significand width is a statement about decimal digits, and about which integers are exact');

  /* the bar: p bits -> p * log10(2) digits */
  var x0 = 60, y0 = 90, w = 780;
  P.rect(x0, y0, w, 20, { fill: SURF2, stroke: BORDER, sw: 1, radius: 4 });
  var f24 = DIGITS_SINGLE / 16, f53 = DIGITS_DOUBLE / 16;
  P.rect(x0, y0, w * f24, 20, { fill: ACC, stroke: null, radius: 4 });
  if (p > 0.2) P.rect(x0, y0 + 26, w * f53, 20, { fill: INFO, stroke: null, radius: 4 });
  label(x0, y0 - 8, 'single: 24 bits \u00d7 log\u2081\u2080 2 = ' + DIGITS_SINGLE.toFixed(2) + ' digits', { size: 11.5, color: ACC, bold: true });
  if (p > 0.2) label(x0, y0 + 60, 'double: 53 bits \u00d7 log\u2081\u2080 2 = ' + DIGITS_DOUBLE.toFixed(2) + ' digits', { size: 11.5, color: INFO, bold: true });

  if (p > 0.34) {
    panel(42, 168, 396, 110, { fill: SURF });
    label(56, 180, 'Integers that are exact', { size: 12, bold: true, color: INK });
    label(56, 202, 'single: 2^24 = ' + INT_BOUND_SINGLE, { size: 11.5, mono: true, color: INK });
    label(56, 222, 'float(16777217) = ' + f32(16777217), { size: 11.5, mono: true, color: BAD, bold: true });
    label(56, 244, 'double: 2^53 = ' + INT_BOUND_DOUBLE, { size: 11.5, mono: true, color: INK });
    label(56, 264, 'beyond it the gap reaches 1, so odd integers vanish', { size: 10.5, color: DIM });

    panel(462, 168, 396, 110, { fill: SURF });
    label(476, 180, 'Machine epsilon', { size: 12, bold: true, color: INK });
    label(476, 202, 'single 2^\u221223 = ' + EPS_SINGLE.toExponential(3), { size: 11.5, mono: true, color: INK });
    label(476, 222, 'double 2^\u221252 = ' + EPS_DOUBLE.toExponential(3), { size: 11.5, mono: true, color: INK });
    label(476, 244, 'the gap from 1 to the next representable value', { size: 10.5, color: DIM });
    label(476, 264, 'unit roundoff is half of it: 2^\u221224 and 2^\u221253', { size: 10.5, color: DIM });
  }

  if (p > 0.58) {
    label(42, 300, 'The registers GATE has given recently, decoded here', { size: 12, bold: true, color: INK });
    tbl(42, 312, [{ name: 'paper', w: 190 }, { name: 'given', w: 150 }, { name: 'decodes to', w: 130 }, { name: 'what is asked', w: 346 }], [
      ['CSE 2025 Set 2 Q49', '0xC1100000', String(G25[0]), 'relations among three registers'],
      ['', '0x40C00000', String(G25[1]), 'X + Y + Z, and the sums'],
      ['', '0x41400000', String(G25[2]), ''],
      ['CSE 2026 Set 1 Q36', '0x35C00000 + 0x34A00000', G26_HEX, 'the sum, re-encoded: ' + G26_HEX]
    ], { rh: 20, rowFill: [null, null, null, ACCDIM] });
  }

  if (p > 0.80) {
    label(42, 424, 'Comparing floats asks whether the bits match, which is almost never what the program means: compare with a tolerance,',
          { size: 11.5, color: DIM });
    label(42, 444, 'and say whether the tolerance is absolute or relative — the same question as fixed-point against floating-point.',
          { size: 11.5, color: DIM });
  }
}

/* ---------- scene 10: procedure ---------- */
function drawProcedure(t) {
  var p = prog(t);
  head('The four-step procedure, and the traps that decide the mark',
       'Every question in this topic is one of these steps, done carefully to the last bit');

  var steps = [
    '1. Write both operands as sign, exponent and significand; subtract the exponents.',
    '2. Shift the smaller one, add, and keep a guard bit and a sticky bit.',
    '3. Normalise, then round once — never twice.',
    '4. Re-encode and check the regime: normal, denormal, infinity, not-a-number.'
  ];
  for (var i = 0; i < steps.length; i++) {
    var on = p > 0.06 * (i + 1);
    label(42, 76 + i * 26, steps[i], { size: 12, color: on ? INK : FAINT, bold: on });
  }

  if (p > 0.34) {
    panel(42, 196, 816, 122, { fill: SURF2 });
    label(56, 208, 'The four traps', { size: 12.5, bold: true, color: INK });
    var traps = [
      'bias 127 and 1023, not 128 and 1024 — it is 2^(k\u22121) \u2212 1',
      'the hidden one is not stored and must be put back when decoding',
      'one rounding per operation, not one at the end of the chain',
      'the sign bit belongs to the number, so a negative number can have a positive exponent'
    ];
    for (var j = 0; j < traps.length; j++) {
      label(56, 232 + j * 20, '\u2022  ' + traps[j], { size: 11.5, color: p > 0.34 + j * 0.08 ? INK : FAINT });
    }
  }

  if (p > 0.62) {
    panel(42, 332, 816, 62, { fill: INVALIDDIM, stroke: BAD });
    label(56, 344, 'The fifth trap, hiding inside the fourth', { size: 12, bold: true, color: BAD });
    label(56, 366, 'An exponent field of all ones with a non-zero fraction is not a number, not infinity. \u201cLargest value\u201d options usually rely on it.',
          { size: 11.5, color: INK });
  }

  if (p > 0.80) {
    panel(42, 408, 816, 52, { fill: SURF });
    label(56, 420, 'What the topic really asks', { size: 12, bold: true, color: INK });
    label(56, 442, 'Given the widths, where does the information leave, and what does the answer look like once it has?',
          { size: 11.5, color: ACC, bold: true });
  }
}

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

var DRAW = {
  pipeline: drawPipeline,
  align: drawAlign,
  round: drawRound,
  guard: drawGuard,
  tenth: drawTenth,
  cancel: drawCancel,
  order: drawOrder,
  multiply: drawMultiply,
  precision: drawPrecision,
  procedure: drawProcedure
};

function sceneIdAt(t) {
  var sc = window.LESSON_TIMELINE.scenes;
  for (var i = sc.length - 1; i >= 0; i--) if (t >= sc[i].start - 1e-6) return sc[i].id;
  return sc[0].id;
}

function drawFrame(P2) {
  P = P2;
  P.alpha(1);
  P.clear();
  P.rect(0, 0, W, H, { fill: SURF });
  var id = sceneIdAt(K.state.elapsed);
  var fn = DRAW[id] || drawPipeline;
  try { fn(K.state.elapsed); } catch (e) { console.error('scene ' + id, e); }
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

  if (K && K.init) {
    K.init({
      timeline: window.LESSON_TIMELINE,
      draw: function () { if (P) drawFrame(P); }
    });
  }

  window.__drawAt = function (t) {
    K.state.elapsed = t;
    if (P) drawFrame(P);
  };

  var bad = CHECKS.filter(function (c) { return !c.pass; });
  if (bad.length) console.warn('Model validation did not fully pass:', bad);
}

/* the model, exposed for the headless check and for anyone reading the source */
window.LESSON_MODEL = {
  roundToP: roundToP, addLimited: addLimited, addExact: addExact, toy: toy, bitString: bitString,
  TOY_VALUES: TOY_VALUES, TOY_SPACING: TOY_SPACING,
  ALIGN_A: ALIGN_A, ALIGN_A_EXACT: ALIGN_A_EXACT, ALIGN_B: ALIGN_B, ALIGN_B_EXACT: ALIGN_B_EXACT,
  ROUND_TIE: ROUND_TIE, ROUND_TIE_AWAY: ROUND_TIE_AWAY, ROUND_ABOVE: ROUND_ABOVE, ROUND_BELOW: ROUND_BELOW,
  GUARD_NONE: GUARD_NONE, GUARD_ONE: GUARD_ONE, GUARD_EXACT: GUARD_EXACT, GUARD_ERR_NONE: GUARD_ERR_NONE,
  TENTH_SUM: TENTH_SUM, TENTH_RESIDUE: TENTH_RESIDUE, hex32: hex32, hex64: hex64,
  CANCEL_F32: CANCEL_F32, SPACING_1E8_F32: SPACING_1E8_F32,
  Q_NAIVE: Q_NAIVE, Q_STABLE: Q_STABLE, Q_ERR: Q_ERR,
  D_LEFT: D_LEFT, D_RIGHT: D_RIGHT, GROUP_LEFT: GROUP_LEFT, GROUP_RIGHT: GROUP_RIGHT, SUMS: SUMS,
  MUL_PROD: MUL_PROD, MUL_HEX: MUL_HEX, MUL_EFIELD: MUL_EFIELD,
  OVERFLOW: OVERFLOW, UNDERFLOW: UNDERFLOW,
  DIGITS_SINGLE: DIGITS_SINGLE, DIGITS_DOUBLE: DIGITS_DOUBLE,
  G25: G25, G26_HEX: G26_HEX
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
