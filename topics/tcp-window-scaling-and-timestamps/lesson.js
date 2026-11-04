/* ==========================================================================
   tcp-window-scaling-and-timestamps — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model is RFC 7323: the sixteen-bit window field and its throughput
   ceiling, the bandwidth-delay product that forces an extension, the shift
   count and its cap at 14, the two window shift counters, the choice of a
   shift from a buffer, the ten-byte timestamps option, the PAWS comparison in
   a modular 32-bit space, and the echo that makes Karn's rule optional.
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

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

var WMAX16 = 65535;                 // 2^16 - 1: the largest 16-bit window field
var SMAX = 14;                      // RFC 7323 section 2.3: the shift count is capped at 14
var TWO30 = Math.pow(2, 30);
var TWO31 = Math.pow(2, 31);
var TWO32 = Math.pow(2, 32);
var PAYLOAD = 1460;                 // the payload used for the efficiency arithmetic
var BASE_HDR = 20;                  // the TCP header with no options
var MAX_OPTS = 40;                  // the option space a header can carry

/* the maximum window a shift count can describe */
function maxWindow(s) { return WMAX16 * Math.pow(2, s); }

/* the throughput ceiling of an unscaled connection */
function ceilingBps(rttMs) { return WMAX16 * 8 / (rttMs / 1000); }
var CEIL = [10, 100, 1000].map(function (rtt) {
  return { rtt: rtt, bps: ceilingBps(rtt), mbps: ceilingBps(rtt) / 1e6 };
});

/* the bandwidth-delay product, in bytes */
function bdpBytes(gbps, rttMs) { return gbps * 1e9 * (rttMs / 1000) / 8; }

/* the smallest shift whose maximum window covers a buffer, capped at 14 */
function rawShift(buf) {
  var s = 0;
  while (maxWindow(s) < buf) s++;
  return s;
}
function shiftFor(buf) { return Math.min(SMAX, rawShift(buf)); }

/* the ladder of shift counts */
var LADDER = [];
for (var s0 = 0; s0 <= SMAX; s0++) {
  LADDER.push({ s: s0, win: maxWindow(s0), tp100: maxWindow(s0) * 8 / 0.1 });
}

/* three pipes and the window each needs */
var BDP = [
  { rate: 0.1, rtt: 20 },
  { rate: 1, rtt: 100 },
  { rate: 10, rtt: 50 }
].map(function (r) {
  var b = bdpBytes(r.rate, r.rtt);
  var sh = shiftFor(b);
  return {
    rate: r.rate, rtt: r.rtt, bdp: b, shift: sh,
    win: maxWindow(sh), below: maxWindow(sh - 1),
    ratio: b / WMAX16
  };
});

/* the bound that fixes the cap: twice the window must stay under 2^31 */
var TWICE14 = 2 * maxWindow(14);
var TWICE15 = 2 * maxWindow(15);
var MARGIN = TWO31 - TWICE14;
var LARGEST_S = 0;
for (var s1 = 0; s1 <= 20; s1++) { if (maxWindow(s1) < TWO30) LARGEST_S = s1; }

/* the worked pair: two buffers, two shifts, one advertised field value */
var A_BUF = 8000000, B_BUF = 1000000;
var A_SHIFT = shiftFor(A_BUF), B_SHIFT = shiftFor(B_BUF);
var A_FIELD = Math.floor(A_BUF / Math.pow(2, A_SHIFT));
var B_FIELD = Math.floor(B_BUF / Math.pow(2, B_SHIFT));
var A_BACK = A_FIELD * Math.pow(2, A_SHIFT);
var B_BACK = B_FIELD * Math.pow(2, B_SHIFT);
var MISREAD = B_FIELD * Math.pow(2, A_SHIFT);
var MISREAD_FACTOR = MISREAD / B_BACK;
var SYN_ERR = WMAX16 * Math.pow(2, A_SHIFT);
var GRANULARITY7 = Math.pow(2, 7) - 1;

/* choosing a shift: the mebibyte trap and the four-gigabyte clamp */
var MIB = 1048576;
var MIB_RATIO = MIB / WMAX16;
var MIB_S4 = maxWindow(4);
var MIB_SHORT = MIB - MIB_S4;
var MIB_SHIFT = shiftFor(MIB);
var GIB4 = Math.pow(2, 32);
var GIB4_RATIO = GIB4 / WMAX16;
var GIB4_RAW = rawShift(GIB4);
var GIB4_SHIFT = shiftFor(GIB4);
var GIB4_MAX = maxWindow(GIB4_SHIFT);

/* the two options and what they cost in the header */
var TS_BYTES = 10, WS_BYTES = 3, WS_PADDED = 4;
var HDRS = [
  { label: 'no options', h: BASE_HDR },
  { label: 'with TSopt', h: BASE_HDR + TS_BYTES },
  { label: 'with TSopt + WSopt', h: BASE_HDR + TS_BYTES + WS_PADDED }
].map(function (r) {
  var eff = PAYLOAD / (PAYLOAD + r.h) * 100;
  return { label: r.label, h: r.h, eff: eff };
});

/* PAWS: the modular comparison */
function diffMod(a, b) { return ((a - b) >>> 0); }
function isOlder(val, recent) {
  var d = diffMod(recent, val);
  return d > 0 && d < TWO31;
}
var PAWS = [
  { name: 'behind', recent: 5000000, val: 4999000 },
  { name: 'ahead', recent: 5000000, val: 5000100 },
  { name: 'after a wrap', recent: 4294000000, val: 100 }
].map(function (r) {
  return {
    name: r.name, recent: r.recent, val: r.val,
    diff: diffMod(r.recent, r.val), older: isOlder(r.val, r.recent)
  };
});

/* the timestamp clock bounds */
var TS_WRAP_1MS_DAYS = TWO31 / 86400000;   // sign-bit wrap at one tick per millisecond
var TS_WRAP_1S_DAYS = TWO31 / 86400;       // sign-bit wrap at one tick per second
var IDLE_LIMIT_DAYS = 24;

/* how long the sequence space lasts at a gigabit per second */
var SEQ_SECONDS = TWO32 / (1e9 / 8);

/* Karn with and without the echo */
var KARN = {
  sendAt: 0, reAt: 400, ackAt: 500,
  ts0: 1000, ts1: 1400,
  sampleRe: 0, sampleOrig: 0
};
KARN.sampleRe = KARN.ackAt - KARN.reAt;     // the echo names the retransmission
KARN.sampleOrig = KARN.ackAt - KARN.sendAt; // the echo names the original

/* the echo that must be refused */
var RTTM = { trueRtt: 40, pause: 60, measured: 100 };
RTTM.factor = RTTM.measured / RTTM.trueRtt;

/* ---------- the checks ---------- */

chk('the window field holds 2^16 - 1', WMAX16 === 65535, WMAX16);
chk('the 100 ms ceiling is 5,242,800 bit/s',
  CEIL[1].bps === 5242800 && CEIL[1].bps === WMAX16 * 8 / 0.1, CEIL[1].bps);
chk('a longer path lowers the ceiling and a shorter one raises it',
  CEIL[0].bps > CEIL[1].bps && CEIL[1].bps > CEIL[2].bps,
  CEIL.map(function (c) { return c.bps; }).join(' > '));
chk('the top window is 2^30 - 2^14',
  maxWindow(SMAX) === TWO30 - 16384 && maxWindow(SMAX) === 1073725440, maxWindow(SMAX));
chk('every rung of the ladder is the field shifted left',
  LADDER.every(function (r) { return r.win === (WMAX16 << r.s); }),
  LADDER.length + ' rungs');
chk('shift 14 clears 2^31 by 32,768 bytes',
  TWICE14 < TWO31 && MARGIN === 32768, TWICE14 + ' / margin ' + MARGIN);
chk('shift 15 breaks the bound', TWICE15 > TWO31, TWICE15);
chk('fourteen is the largest shift whose window stays under 2^30',
  LARGEST_S === SMAX && maxWindow(15) > TWO30, LARGEST_S);
chk('each bandwidth-delay product is rate times delay over eight',
  BDP.every(function (r) {
    return Math.abs(r.bdp - r.rate * 1e9 * (r.rtt / 1000) / 8) < 1e-6;
  }), BDP.map(function (r) { return r.bdp; }).join(', '));
chk('each shift is the smallest that covers its pipe',
  BDP.every(function (r) { return r.win >= r.bdp && r.below < r.bdp; }),
  BDP.map(function (r) { return r.shift; }).join(', '));
chk('a one-mebibyte buffer needs shift 5', MIB_SHIFT === 5, MIB_SHIFT);
chk('shift 4 falls exactly 16 bytes short of a mebibyte',
  MIB_SHORT === 16 && MIB_S4 === 1048560, MIB_S4);
chk('the division by 65,536 gives 16 and the wrong shift',
  Math.floor(MIB / 65536) === 16 && MIB_RATIO > 16, MIB_RATIO);
chk('a four-gigabyte buffer wants 17 and is clamped to 14',
  GIB4_RAW === 17 && GIB4_SHIFT === SMAX, GIB4_RAW + ' -> ' + GIB4_SHIFT);
chk('the clamped window is smaller than the buffer',
  GIB4_MAX < GIB4 && GIB4_MAX === 1073725440, GIB4_MAX);
chk('both hosts advertise the same field value',
  A_FIELD === 62500 && B_FIELD === 62500, A_FIELD + ' / ' + B_FIELD);
chk('the same field means eight times more from one side',
  A_BACK === 8 * B_BACK && A_BACK === A_BUF, A_BACK + ' / ' + B_BACK);
chk('reading the peer field with your own shift is eight times too large',
  MISREAD_FACTOR === Math.pow(2, A_SHIFT - B_SHIFT) && MISREAD === 8000000, MISREAD);
chk('a SYN window field read with shift 7 is 128 times too large',
  SYN_ERR / WMAX16 === 128, SYN_ERR);
chk('the right shift at count 7 loses at most 127 bytes',
  GRANULARITY7 === 127, GRANULARITY7);
chk('the timestamps option is ten bytes', 1 + 1 + 4 + 4 === TS_BYTES, TS_BYTES);
chk('the headers are 20, 30 and 34 bytes',
  HDRS[0].h === 20 && HDRS[1].h === 30 && HDRS[2].h === 34,
  HDRS.map(function (r) { return r.h; }).join(', '));
chk('efficiency falls from 98.6486 to 97.7242 per cent',
  Math.abs(HDRS[0].eff - 98.6486) < 0.0001 && Math.abs(HDRS[2].eff - 97.7242) < 0.0001,
  HDRS[0].eff.toFixed(4) + ' -> ' + HDRS[2].eff.toFixed(4));
chk('a value 1,000 behind is older and is rejected',
  PAWS[0].older === true && PAWS[0].diff === 1000, PAWS[0].diff);
chk('a value 100 ahead is newer and is accepted',
  PAWS[1].older === false && PAWS[1].diff === 4294967196, PAWS[1].diff);
chk('after the wrap a small value is newer and is accepted',
  PAWS[2].older === false && PAWS[2].diff === 4293999900, PAWS[2].diff);
chk('the sign bit wraps in 24.855 days at one millisecond per tick',
  Math.abs(TS_WRAP_1MS_DAYS - 24.8551) < 0.0002, TS_WRAP_1MS_DAYS.toFixed(4));
chk('the sign bit wraps in 24,855 days at one second per tick',
  Math.abs(TS_WRAP_1S_DAYS - 24855.13) < 0.01, TS_WRAP_1S_DAYS.toFixed(2));
chk('the 24-day invalidation comes before the wrap',
  IDLE_LIMIT_DAYS < TS_WRAP_1MS_DAYS, IDLE_LIMIT_DAYS + ' < ' + TS_WRAP_1MS_DAYS.toFixed(2));
chk('the sequence space lasts about 34 seconds at a gigabit per second',
  Math.abs(SEQ_SECONDS - 34.3597) < 0.001, SEQ_SECONDS.toFixed(4));
chk('an echo of 1400 measures 100 ms and an echo of 1000 measures 500 ms',
  KARN.sampleRe === 100 && KARN.sampleOrig === 500,
  KARN.sampleRe + ' / ' + KARN.sampleOrig);
chk('the paused echo inflates the sample by two and a half',
  RTTM.factor === 2.5, RTTM.factor);
chk('every BDP pipe is wider than the unscaled window',
  BDP.every(function (r) { return r.bdp > WMAX16; }),
  BDP.map(function (r) { return r.ratio.toFixed(1); }).join(', '));

/* ======================================================================
   LAYER 2 - SCENE HELPERS
   ====================================================================== */

function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function beat(sc, t, k) {
  var span = (sc.end - sc.start) / 4;
  return clamp01((t - (sc.start + k * span)) / 0.8);
}
function T(x, y, s, o) { P.text(x, y, s, o || {}); }
function head(title, sub) {
  T(32, 22, title, { size: 17, bold: true, color: INK });
  if (sub) T(32, 44, sub, { size: 12, color: DIM });
  P.line(32, 54, W - 32, 54, { stroke: BORDER, sw: 1 });
}
function box(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, {
    fill: o.fill || SURF2, stroke: o.stroke || BORDER, sw: o.sw || 1.5,
    radius: o.radius === undefined ? 6 : o.radius, dash: o.dash
  });
}
function tick(x, y, colour) {
  P.line(x, y, x + 5, y + 6, { stroke: colour || VAL, sw: 2 });
  P.line(x + 5, y + 6, x + 14, y - 7, { stroke: colour || VAL, sw: 2 });
}
function cross(x, y, colour) {
  P.line(x, y, x + 11, y + 11, { stroke: colour || BAD, sw: 2 });
  P.line(x + 11, y, x, y + 11, { stroke: colour || BAD, sw: 2 });
}
function footer(s) {
  T(32, 440, s, { size: 9.5, color: FAINT });
}
function group(n) { return n.toLocaleString('en-US'); }

var SCENE_DRAW = {};

/* ---------- scene 1: the wall at 65,535 bytes ---------- */

SCENE_DRAW.ceiling = function (t, sc) {
  head('The wall at 65,535 bytes',
       'the window field is 16 bits wide, and the field width sets the throughput ceiling');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(48, 66, 'the 16-bit window field', { size: 9.5, color: DIM });
  for (var i = 0; i < 16; i++) {
    box(48 + i * 22, 80, 20, 22, { fill: i === 0 || i === 15 ? ACCDIM : SURF, stroke: ACC, sw: 1, radius: 2 });
  }
  T(400 + 12, 86, 'holds 0 to 65,535', { size: 10, mono: true, color: DIM });

  P.alpha(b);
  T(48, 132, 'ceiling = window / round-trip time = 65,535 bytes / RTT', { size: 12, mono: true, color: INK });

  P.alpha(c);
  T(48, 168, 'round trip', { size: 9.5, color: FAINT });
  T(200, 168, 'ceiling, bit/s', { size: 9.5, color: FAINT });
  T(470, 168, 'in Mbit/s', { size: 9.5, color: FAINT });
  CEIL.forEach(function (row, i) {
    var y = 190 + i * 24;
    T(48, y, (row.rtt / 1000).toFixed(3).replace(/0+$/, '').replace(/\.$/, '') + ' s', { size: 11, mono: true, color: INK });
    T(200, y, group(row.bps), { size: 11, mono: true, color: i === 1 ? ACC : INK });
    T(470, y, row.mbps.toFixed(i === 1 ? 2 : 2) + ' Mbit/s', { size: 11, mono: true, color: DIM });
  });

  P.alpha(d);
  box(48, 268, 804, 56, { fill: SURF, stroke: ACC });
  T(64, 280, 'On a 100 ms path the ceiling is 5,242,800 bit/s: about 5.24 Mbit/s, whatever the link can carry.', { size: 11.5, bold: true, color: INK });
  T(64, 302, 'The ceiling is a property of the header, not of the network. A faster link does not move it.', { size: 10.5, color: DIM });

  P.alpha(1);
  T(48, 344, 'A shorter path raises the ceiling in proportion; a longer path lowers it. Raising the link rate changes nothing,', { size: 10.5, color: DIM });
  T(48, 362, 'because the limit is the number of bytes the receiver may leave unacknowledged.', { size: 10.5, color: DIM });
  footer('Class B: the mechanism behind the named clause "TCP- flow control and congestion control", GATE 2027 Section 10.');
};

/* ---------- scene 2: the pipe ---------- */

SCENE_DRAW.bdp = function (t, sc) {
  head('The window is a pipe, and the pipe has a length',
       'bandwidth times delay is how much data the path can hold, and a smaller window leaves the link idle');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  box(48, 76, 804, 44, { fill: SURF2, stroke: BORDER, radius: 4 });
  var fillW = 804 * (WMAX16 / BDP[1].bdp);
  P.rect(48, 76, Math.max(4, fillW), 44, { fill: ACC, stroke: ACC, radius: 4 });
  T(62, 88, 'the path: 1 Gbit/s, 100 ms round trip', { size: 10, color: INK });
  T(62, 104, 'the water in it is 12,500,000 bytes; the window is 65,535', { size: 10, color: DIM });
  T(48, 130, 'the window fills about one part in 191 of the pipe', { size: 9.5, color: ACC });

  P.alpha(b);
  T(48, 158, 'bandwidth-delay product = rate x delay', { size: 12, mono: true, color: INK });
  T(48, 180, '= 1,000,000,000 bit/s x 0.1 s / 8 = 12,500,000 bytes', { size: 11, mono: true, color: DIM });

  P.alpha(c);
  T(48, 210, 'link', { size: 9.5, color: FAINT });
  T(180, 210, 'round trip', { size: 9.5, color: FAINT });
  T(320, 210, 'pipe, bytes', { size: 9.5, color: FAINT });
  T(560, 210, 'shift needed', { size: 9.5, color: FAINT });
  BDP.forEach(function (row, i) {
    var y = 232 + i * 22;
    T(48, y, (row.rate * 1000) + ' Mbit/s', { size: 10.5, mono: true, color: INK });
    T(180, y, row.rtt + ' ms', { size: 10.5, mono: true, color: INK });
    T(320, y, group(row.bdp), { size: 10.5, mono: true, color: i === 1 ? ACC : INK });
    T(560, y, row.shift + '  ->  ' + group(row.win), { size: 10.5, mono: true, color: ACC });
  });

  P.alpha(d);
  box(48, 304, 804, 54, { fill: SURF, stroke: ACC });
  T(64, 316, 'Every pipe here is wider than 65,535 bytes, so the field cannot name the window the link needs.', { size: 11.5, bold: true, color: INK });
  T(64, 338, 'The field cannot grow and the header cannot move: the way out is a multiplier agreed in the handshake.', { size: 10.5, color: DIM });

  P.alpha(1);
  footer('Bandwidth-delay product is a standard performance metric named in GATE 2027 Section 10 ("performance metrics").');
};

/* ---------- scene 3: one shift count ---------- */

SCENE_DRAW.shift = function (t, sc) {
  head('One shift count, thirty bits of window',
       'the true window is the field shifted left by the count, so the same field means 2^s times as much');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  box(48, 74, 96, 30, { fill: SURF, stroke: ACC, sw: 1.2, radius: 3 });
  T(96, 82, 'kind 3', { size: 10, mono: true, align: 'center', color: INK });
  box(144, 74, 96, 30, { fill: SURF, stroke: ACC, sw: 1.2, radius: 3 });
  T(192, 82, 'length 3', { size: 10, mono: true, align: 'center', color: INK });
  box(240, 74, 120, 30, { fill: ACCDIM, stroke: ACC, sw: 1.2, radius: 3 });
  T(300, 82, 'shift count', { size: 10, mono: true, align: 'center', color: ACC });
  T(376, 84, 'three bytes, sent in the handshake and never again', { size: 10, color: DIM });
  T(48, 118, 'true window = SEG.WND << s   =   SEG.WND x 2^s', { size: 11.5, mono: true, color: INK });

  P.alpha(b);
  var x0 = 60, pitch = 52, base = 280;
  LADDER.forEach(function (r) {
    var h = 24 + r.s * 8;
    var x = x0 + r.s * pitch;
    P.rect(x, base - h, 36, h, { fill: r.s === SMAX ? ACCDIM : SURF2, stroke: r.s === SMAX ? ACC : BORDER, sw: 1.2, radius: 2 });
    T(x + 18, base + 6, String(r.s), { size: 8.5, mono: true, align: 'center', color: FAINT });
  });
  T(x0 + 18, base - 24 - 16, '65,535', { size: 9, mono: true, align: 'center', color: DIM });
  T(x0 + 8 * pitch + 18, base - (24 + 8 * 8) - 16, '16,776,960', { size: 9, mono: true, align: 'center', color: DIM });
  T(x0 + 14 * pitch + 18, base - (24 + 14 * 8) - 16, '1,073,725,440', { size: 9, mono: true, align: 'center', color: ACC });

  P.alpha(c);
  T(48, 300, 'the top of the range is 2^30 - 2^14 = 1,073,725,440 bytes, which is 16,384 bytes short of a gibibyte', { size: 10.5, color: INK });

  P.alpha(d);
  T(48, 322, 'on a 100 ms path the ceiling becomes 85,898,035,200 bit/s, about 85.9 Gbit/s: up by 2^14', { size: 10.5, color: INK });

  P.alpha(1);
  T(48, 352, 'Each rung multiplies the window by two, so the count is an exponent and not a multiplier: shift 3 is eight, not three.', { size: 10, color: DIM });
  footer('RFC 7323 section 2.3: the maximum shift count is 14, for a maximum receive window of 2^(14+16) = 1 GiB.');
};

/* ---------- scene 4: why fourteen ---------- */

SCENE_DRAW.why14 = function (t, sc) {
  head('Why the limit is fourteen and not sixteen',
       'twice the largest window must stay below 2^31, so the largest window must stay below 2^30');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(48, 74, 'TCP decides old from new over a 32-bit sequence space read as a line:', { size: 10.5, color: INK });
  T(48, 96, 'new   iff   0 < (seq - left edge) mod 2^32 < 2^31', { size: 11.5, mono: true, color: ACC });

  P.alpha(b);
  P.line(140, 140, 840, 140, { stroke: BORDER, sw: 1.2 });
  T(140, 122, '0', { size: 9, mono: true, align: 'left', color: FAINT });
  T(840, 122, '2^31 = 2,147,483,648', { size: 9, mono: true, align: 'right', color: FAINT });
  T(48, 152, 'shift 14', { size: 10, mono: true, color: INK });
  P.rect(140, 150, 700 * (TWICE14 / TWO31), 18, { fill: ACCDIM, stroke: ACC, sw: 1.2, radius: 3 });
  T(834, 154, '2,147,450,880', { size: 9, mono: true, align: 'right', color: ACC });
  T(48, 182, 'shift 15', { size: 10, mono: true, color: BAD });
  P.rect(140, 180, 690, 18, { fill: BADDIM, stroke: BAD, sw: 1.2, radius: 3 });
  P.arrow(830, 189, 856, 189, { stroke: BAD, sw: 1.6, head: 8 });
  T(600, 184, '4,294,901,760: past the limit', { size: 9, mono: true, color: BAD });

  P.alpha(c);
  T(48, 222, 'shift', { size: 9.5, color: FAINT });
  T(140, 222, 'largest window', { size: 9.5, color: FAINT });
  T(400, 222, 'twice that window', { size: 9.5, color: FAINT });
  T(700, 222, 'against 2^31', { size: 9.5, color: FAINT });
  [
    { s: 13, w: maxWindow(13), ok: true, note: 'clears' },
    { s: 14, w: maxWindow(14), ok: true, note: 'clears by 32,768' },
    { s: 15, w: maxWindow(15), ok: false, note: 'over' }
  ].forEach(function (r, i) {
    var y = 244 + i * 22;
    T(48, y, String(r.s), { size: 10.5, mono: true, color: INK });
    T(140, y, group(r.w), { size: 10.5, mono: true, color: INK });
    T(400, y, group(2 * r.w), { size: 10.5, mono: true, color: r.ok ? INK : BAD });
    if (r.ok) tick(700, y + 4); else cross(700, y + 2);
    T(724, y, r.note, { size: 10, color: r.ok ? VAL : BAD });
  });

  P.alpha(d);
  box(48, 318, 804, 56, { fill: SURF, stroke: ACC });
  T(64, 330, 'A peer that sends a count above 14 is logged as an error and read as 14, because a sender may always use less.', { size: 11, bold: true, color: INK });
  T(64, 352, 'The bound comes from the sequence test, not from the buffer: this is why 15 is not available however much memory you buy.', { size: 10.5, color: DIM });

  P.alpha(1);
  footer('RFC 7323 section 2.3: "the shift count MUST be limited to 14 (which allows windows of 2^30 = 1 GiB)".');
};

/* ---------- scene 5: the handshake ---------- */

SCENE_DRAW.handshake = function (t, sc) {
  head('The offer in the SYN, and the field that is not scaled',
       'the option is three bytes, both sides must send it, and a SYN window field is never scaled');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  box(48, 72, 260, 74, { fill: SURF, stroke: ACC });
  T(62, 82, 'SYN', { size: 11.5, bold: true, color: ACC });
  T(62, 102, 'WSopt: shift 7', { size: 10, mono: true, color: INK });
  T(62, 122, 'window field 65,535', { size: 10, mono: true, color: INK });
  box(330, 72, 260, 74, { fill: SURF, stroke: ACC });
  T(344, 82, 'SYN, ACK', { size: 11.5, bold: true, color: ACC });
  T(344, 102, 'WSopt: shift 4', { size: 10, mono: true, color: INK });
  T(344, 122, 'window field 65,535', { size: 10, mono: true, color: INK });
  box(612, 72, 240, 74, { fill: SURF2, stroke: BORDER });
  T(626, 82, 'ACK', { size: 11.5, bold: true, color: DIM });
  T(626, 102, 'no options', { size: 10, mono: true, color: DIM });
  T(626, 122, 'scaling now fixed', { size: 10, mono: true, color: DIM });

  P.alpha(b);
  T(48, 168, 'the SYN window field is never scaled: reading 65,535 with shift 7 gives 8,388,480, which is 128 times too large', { size: 10.5, color: BAD });
  T(48, 190, 'both sides must send the option, or neither direction is scaled at all', { size: 10.5, color: INK });

  P.alpha(c);
  T(48, 220, 'host A: buffer 8,000,000 bytes  ->  shift 7   (shift 6 reaches only 4,194,240)', { size: 10.5, mono: true, color: INK });
  T(48, 242, 'host B: buffer 1,000,000 bytes  ->  shift 4   (shift 3 reaches only   524,280)', { size: 10.5, mono: true, color: INK });

  P.alpha(d);
  box(48, 266, 804, 64, { fill: SURF, stroke: ACC });
  T(64, 278, 'Both then advertise the same field, 62,500: 8,000,000 >> 7 = 62,500 and 1,000,000 >> 4 = 62,500.', { size: 11, bold: true, color: INK });
  T(64, 300, 'The same sixteen-bit number in the two directions means 8,000,000 bytes from A and 1,000,000 from B.', { size: 10.5, color: DIM });

  P.alpha(1);
  footer('RFC 7323 sections 2.2 and 2.3: the option is sent in <SYN> only, and "the window field in a segment where the SYN bit is set MUST NOT be scaled".');
};

/* ---------- scene 6: two counters ---------- */

SCENE_DRAW.sides = function (t, sc) {
  head('Two counters, one for each direction',
       'yours scales what you send; the peer\'s scales what you receive, and the two need not be equal');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  box(48, 72, 230, 62, { fill: SURF, stroke: ACC });
  T(62, 82, 'host A', { size: 11, bold: true, color: INK });
  T(62, 100, 'Rcv.Wind.Shift 7', { size: 9.5, mono: true, color: ACC });
  T(62, 118, 'Snd.Wind.Shift 4', { size: 9.5, mono: true, color: INFO });
  box(622, 72, 230, 62, { fill: SURF, stroke: ACC });
  T(636, 82, 'host B', { size: 11, bold: true, color: INK });
  T(636, 100, 'Rcv.Wind.Shift 4', { size: 9.5, mono: true, color: ACC });
  T(636, 118, 'Snd.Wind.Shift 7', { size: 9.5, mono: true, color: INFO });
  P.arrow(284, 94, 616, 94, { stroke: ACC, sw: 1.4, head: 8 });
  T(450, 76, 'A sends: field 62,500', { size: 9.5, mono: true, align: 'center', color: ACC });
  P.arrow(616, 120, 284, 120, { stroke: INFO, sw: 1.4, head: 8 });
  T(450, 126, 'B sends: field 62,500', { size: 9.5, mono: true, align: 'center', color: INFO });

  P.alpha(b);
  T(48, 160, 'SEG.WND = RCV.WND >> Rcv.Wind.Shift      what you send, right-shifted by your own count', { size: 10.5, mono: true, color: INK });
  T(48, 182, 'SND.WND = SEG.WND << Snd.Wind.Shift      what you receive, left-shifted by the peer\'s count', { size: 10.5, mono: true, color: INK });

  P.alpha(c);
  T(48, 214, 'A reads 62,500 with its own count 7 and gets 8,000,000; with B\'s count 4 it gets 1,000,000, which is right', { size: 10.5, color: INK });
  T(48, 236, 'the error factor is 2^(7 - 4) = 8, so the window is overstated by exactly eight times', { size: 10.5, color: BAD });

  P.alpha(d);
  box(48, 260, 804, 54, { fill: SURF, stroke: ACC });
  T(64, 272, 'The scale applies to the window field only. The congestion window is a local 32-bit number and is never scaled.', { size: 11, bold: true, color: INK });
  T(64, 294, 'So scaling adds no quantisation to slow start, and a question about the congestion window wants the unscaled value.', { size: 10.5, color: DIM });

  P.alpha(1);
  T(48, 336, 'The right shift is lossy: at count 7 the advertised field can lag the true window by up to 127 bytes.', { size: 10, color: DIM });
  footer('RFC 7323 section 2.3: "the scale factor applies only to the window field as transmitted in the TCP header".');
};

/* ---------- scene 7: choosing your shift ---------- */

SCENE_DRAW.choosing = function (t, sc) {
  head('Choosing your own shift count',
       'the smallest count whose maximum window covers the receive buffer, chosen before the connection opens');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(48, 76, 'maxWindow(s) = 65,535 x 2^s      choose the smallest s with maxWindow(s) >= buffer', { size: 11.5, mono: true, color: INK });

  P.alpha(b);
  T(48, 108, 'buffer 1,048,576 bytes / 65,535 = 16.00024   ->   the obvious answer is shift 4, since 2^16 = 65,536', { size: 10.5, mono: true, color: INK });
  T(48, 130, 'but maxWindow(4) = 65,535 x 16 = 1,048,560   ->   sixteen bytes short of the buffer', { size: 10.5, mono: true, color: BAD });
  P.rect(48, 150, 792, 16, { fill: ACCDIM, stroke: ACC, sw: 1, radius: 3 });
  P.rect(828, 150, 12, 16, { fill: BADDIM, stroke: BAD, sw: 1.2, radius: 2 });
  T(52, 153, '1,048,560', { size: 8.5, mono: true, color: ACC });
  T(840, 172, '16 bytes', { size: 8.5, mono: true, align: 'right', color: BAD });

  P.alpha(c);
  T(48, 196, 'so the answer is 5: maxWindow(5) = 2,097,120 bytes, which covers the buffer', { size: 10.5, color: INK });
  T(48, 218, 'state the rule as a comparison of maximum windows, never as a division', { size: 10.5, color: DIM });

  P.alpha(d);
  box(48, 242, 804, 78, { fill: SURF, stroke: ACC });
  T(64, 254, 'A 4 GiB buffer: 2^32 / 65,535 = 65,537, whose base-two logarithm is 16.00002, so the raw answer is 17.', { size: 10.5, color: INK });
  T(64, 276, 'The count is capped at 14, so at most 1,073,725,440 bytes can be advertised, whatever the buffer holds.', { size: 10.5, color: INK });
  T(64, 298, 'The rest of the buffer cannot be used by this connection: the cap binds from above as well as below.', { size: 10.5, color: DIM });

  P.alpha(1);
  T(48, 344, 'The count is fixed when the connection opens and cannot change, so a buffer that grows later cannot raise it.', { size: 10, color: DIM });
  footer('RFC 7323 section 2.1: the maximum receive window, and therefore the scale factor, is set by the maximum receive buffer space.');
};

/* ---------- scene 8: the timestamps option ---------- */

SCENE_DRAW.tsopt = function (t, sc) {
  head('The ten-byte timestamps option',
       'kind 8, length 10, a four-byte value and a four-byte echo, and two jobs that share them');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  box(48, 74, 54, 30, { fill: SURF, stroke: ACC, sw: 1.2, radius: 3 });
  T(75, 82, 'kind 8', { size: 9, mono: true, align: 'center', color: INK });
  box(102, 74, 60, 30, { fill: SURF, stroke: ACC, sw: 1.2, radius: 3 });
  T(132, 82, 'len 10', { size: 9, mono: true, align: 'center', color: INK });
  box(162, 74, 180, 30, { fill: ACCDIM, stroke: ACC, sw: 1.2, radius: 3 });
  T(252, 82, 'TSval', { size: 10, mono: true, align: 'center', color: ACC });
  box(342, 74, 180, 30, { fill: WARNDIM, stroke: WARN, sw: 1.2, radius: 3 });
  T(432, 82, 'TSecr', { size: 10, mono: true, align: 'center', color: WARN });
  T(162, 110, "the sender's clock", { size: 8.5, color: FAINT });
  T(342, 110, 'an echo of a value received', { size: 8.5, color: FAINT });

  P.alpha(b);
  var scale = 12;
  HDRS.forEach(function (r, i) {
    var y = 134 + i * 32;
    T(48, y + 4, r.label, { size: 10, color: INK });
    P.rect(160, y, r.h * scale, 22, { fill: i === 2 ? ACCDIM : SURF2, stroke: i === 2 ? ACC : BORDER, sw: 1.2, radius: 3 });
    T(160 + r.h * scale + 10, y + 4, r.h + ' bytes', { size: 9.5, mono: true, color: i === 2 ? ACC : DIM });
  });

  P.alpha(c);
  T(48, 240, 'payload 1,460 bytes: efficiency 98.6486%, then 97.9866%, then 97.7242%', { size: 10.5, mono: true, color: INK });
  T(48, 262, 'the option spends 10 of the 40 bytes of option space a header may carry', { size: 10.5, color: DIM });

  P.alpha(d);
  box(48, 286, 804, 66, { fill: SURF, stroke: ACC });
  T(64, 296, 'One saved value per connection, TS.Recent, updated only if the incoming value is at least it', { size: 10.5, bold: true, color: INK });
  T(64, 314, 'and the segment lies within the last acknowledgement sent.', { size: 10.5, bold: true, color: INK });
  T(64, 334, 'Every outgoing option echoes that one slot, so one number serves both jobs.', { size: 10.5, color: DIM });

  P.alpha(1);
  footer('RFC 7323 sections 3.2 and 4.3: the option is kind 8 with length 10, and section 4.3 gives the rule for which value is echoed.');
};

/* ---------- scene 9: PAWS ---------- */

SCENE_DRAW.paws = function (t, sc) {
  head('PAWS: rejecting a segment from the past',
       'a timestamp is a serial number: older means the modular difference lies in the backward half');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  P.circle(170, 240, 80, { stroke: BORDER, sw: 1.4 });
  P.circle(170, 240, 80, { stroke: ACC, sw: 1.4, dash: [4, 4] });
  P.circle(170, 160, 4, { fill: ACC, stroke: ACC });
  T(170, 142, 'saved 5,000,000', { size: 9, mono: true, align: 'center', color: ACC });
  P.circle(250, 240, 4, { fill: VAL, stroke: VAL });
  T(258, 236, '5,000,100', { size: 9, mono: true, color: VAL });
  P.circle(90, 240, 4, { fill: BAD, stroke: BAD });
  T(82, 236, '4,999,000', { size: 9, mono: true, align: 'right', color: BAD });
  T(170, 330, 'the 32-bit space as a circle', { size: 9, align: 'center', color: FAINT });

  P.alpha(b);
  T(340, 118, 'older   iff   0 < (recent - val) mod 2^32 < 2^31', { size: 11, mono: true, color: INK });

  P.alpha(c);
  [
    { at: 148, val: '4,999,000', diff: PAWS[0].diff, note: 'old: acknowledge, then drop', ok: false },
    { at: 178, val: '5,000,100', diff: PAWS[1].diff, note: 'new: accept and save it', ok: true },
    { at: 208, val: '100 after the wrap', diff: PAWS[2].diff, note: 'new: accept', ok: true }
  ].forEach(function (r) {
    if (r.ok) tick(340, r.at + 4); else cross(340, r.at + 2);
    T(364, r.at, r.val, { size: 10, mono: true, color: INK });
    T(560, r.at, group(r.diff), { size: 10, mono: true, color: r.ok ? VAL : BAD });
    T(680, r.at, r.note, { size: 9.5, color: r.ok ? VAL : BAD });
  });

  P.alpha(d);
  box(340, 244, 512, 82, { fill: SURF, stroke: ACC });
  T(356, 254, 'The clock ticks between once a millisecond and once a second, so its sign', { size: 9.5, color: INK });
  T(356, 272, 'bit wraps in 24.855 days at the fast end and 24,855 days at the slow end.', { size: 9.5, color: INK });
  T(356, 290, 'A value saved before 24 days of silence is discarded, so an idle connection', { size: 9.5, color: INK });
  T(356, 308, 'cannot freeze itself: the next segment is accepted whatever its timestamp.', { size: 9.5, color: INK });

  P.alpha(1);
  footer('RFC 7323 sections 5.3 to 5.5: the comparison, the clock bounds, and the 24-day invalidation of TS.Recent.');
};

/* ---------- scene 10: Karn and the echo ---------- */

SCENE_DRAW.karn = function (t, sc) {
  head("Why the timestamp makes Karn's rule optional",
       'the echo names which copy the acknowledgement answered, so the sample is no longer ambiguous');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  P.line(60, 96, 840, 96, { stroke: BORDER, sw: 1.2 });
  var px = function (ms) { return 60 + (ms / 600) * 780; };
  [[0, 'send 0'], [400, 'retransmit 400'], [500, 'ACK 500']].forEach(function (m) {
    P.circle(px(m[0]), 96, 4, { fill: SURF, stroke: ACC, sw: 2 });
    T(px(m[0]), 74, m[1], { size: 9.5, mono: true, align: 'center', color: DIM });
  });
  T(px(0) + 6, 104, 'TSval 1000', { size: 8.5, mono: true, color: ACC });
  T(px(400) + 6, 104, 'TSval 1400', { size: 8.5, mono: true, color: ACC });

  P.alpha(b);
  T(48, 140, 'echo 1400  ->  sample 500 - 400 = 100 ms, the round trip of the retransmission', { size: 10.5, mono: true, color: VAL });
  T(48, 162, 'echo 1000  ->  sample 500 - 0 = 500 ms, the original, which was late rather than lost', { size: 10.5, mono: true, color: INK });

  P.alpha(c);
  T(48, 194, 'without timestamps there is no sample at all: the acknowledgement does not say which copy it answered', { size: 10.5, color: BAD });
  T(48, 216, 'the guard: an echo updates the estimate only when the segment advances the left edge of the send window', { size: 10.5, color: INK });
  T(48, 238, 'a 40 ms path with a 60 ms pause reads 100 ms, two and a half times the truth, and that echo is refused', { size: 10.5, color: DIM });

  P.alpha(d);
  T(48, 270, '1  scaling the SYN window field', { size: 9.5, color: INK });
  T(48, 288, '2  the peer\'s field read with your own shift', { size: 9.5, color: INK });
  T(48, 306, '3  the shift chosen by division', { size: 9.5, color: INK });
  T(460, 270, '4  timestamps compared as signed numbers', { size: 9.5, color: INK });
  T(460, 288, '5  a sample from a segment that advances nothing', { size: 9.5, color: INK });
  box(48, 322, 804, 50, { fill: SURF, stroke: ACC });
  T(64, 334, 'Three bytes buy a window of 2^30; ten bytes buy a measurement on nearly every segment and a test that survives the wrap.', { size: 11, bold: true, color: INK });
  T(64, 354, 'Neither changes the field layout: both ride in the option space of the handshake and the header.', { size: 10, color: DIM });

  P.alpha(1);
  footer('Class B: RFC 7323 is the mechanism behind the named TCP flow-control clause. No PYQ is claimed anywhere on this page.');
};

/* ---------- dispatch ---------- */

function drawFrame(Pp) {
  P = Pp;
  P.clear();
  var t = K ? K.state.elapsed : 0;
  var idx = K ? K.sceneAt(t) : 0;
  var sc = (window.LESSON_TIMELINE.scenes || [])[idx];
  if (!sc) return;
  var fn = SCENE_DRAW[sc.id];
  if (fn) fn(t, sc);
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
    ' passed' + (bad.length ? ' — ' + bad.map(function (c) { return c.name; }).join('; ') : '') + '</p>';
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

window.__MODEL = {
  CHECKS: CHECKS,
  CONST: { WMAX16: WMAX16, SMAX: SMAX, TWO30: TWO30, TWO31: TWO31, PAYLOAD: PAYLOAD },
  CEIL: CEIL, BDP: BDP, LADDER: LADDER,
  BOUND: { twice14: TWICE14, twice15: TWICE15, margin: MARGIN, largestS: LARGEST_S },
  PAIR: {
    aBuf: A_BUF, bBuf: B_BUF, aShift: A_SHIFT, bShift: B_SHIFT,
    aField: A_FIELD, bField: B_FIELD, misread: MISREAD, factor: MISREAD_FACTOR, synErr: SYN_ERR
  },
  BUFFER: {
    mib: MIB, mibRatio: MIB_RATIO, s4: MIB_S4, short: MIB_SHORT, shift: MIB_SHIFT,
    gib4: GIB4, raw: GIB4_RAW, clamped: GIB4_SHIFT, max: GIB4_MAX
  },
  OPTS: { ts: TS_BYTES, ws: WS_BYTES, hdrs: HDRS },
  PAWS: PAWS, CLOCK: { ms: TS_WRAP_1MS_DAYS, s: TS_WRAP_1S_DAYS, idle: IDLE_LIMIT_DAYS },
  SEQ_SECONDS: SEQ_SECONDS, KARN: KARN, RTTM: RTTM
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
