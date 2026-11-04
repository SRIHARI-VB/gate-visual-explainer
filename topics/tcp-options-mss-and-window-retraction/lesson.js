/* ==========================================================================
   tcp-options-mss-and-window-retraction — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model is RFC 9293 (the option format and the 60-byte header), RFC 6691
   (the MSS arithmetic), RFC 1122 (the default of 536) and RFC 7323 section 2.4
   with Appendix F (the scaled window's step, and the retraction it forces).
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

var BASE_HDR = 20;          // RFC 9293: the fixed TCP header
var MAX_HDR = 60;           // 4-bit data offset, 15 words of four bytes
var WORDS_MIN = 5, WORDS_MAX = 15;
var OPT_BUDGET = MAX_HDR - BASE_HDR;   // 40

/* option lengths, from the IANA registry and RFC 9293 section 3.1 */
var OPT = { mss: 4, ws: 3, sack: 2, ts: 10, md5: 18, eol: 1, nop: 1 };

/* the four handshake options, raw and padded to a multiple of four */
var RAW4 = OPT.mss + OPT.ws + OPT.sack + OPT.ts;
function pad4(n) { return Math.ceil(n / 4) * 4; }
var PAD4 = pad4(RAW4);
var HDR4 = BASE_HDR + PAD4;
var FREE4 = OPT_BUDGET - RAW4;

/* a stack that pads each option to its own word boundary */
var ALIGN_RAW = OPT.mss + (OPT.nop + OPT.ws) + OPT.sack + (2 * OPT.nop + OPT.ts);
var ALIGN_PAD = pad4(ALIGN_RAW);
var HDR_ALIGN = BASE_HDR + ALIGN_PAD;

/* the MSS: the effective MTU minus the fixed headers, data only */
var MTU = 1500, IP4 = 20, IP6 = 40;
function mssFor(mtu, ip) { return mtu - ip - BASE_HDR; }
var MSSROWS = [
  { label: 'IPv4, minimum MTU', mtu: 576, ip: IP4 },
  { label: 'IPv4, Ethernet', mtu: 1500, ip: IP4 },
  { label: 'IPv4, jumbo frame', mtu: 9000, ip: IP4 },
  { label: 'IPv6, Ethernet', mtu: 1500, ip: IP6 },
  { label: 'IPv6, minimum MTU', mtu: 1280, ip: IP6 },
  { label: 'IPv4, smallest legal', mtu: 68, ip: IP4 }
].map(function (r) {
  return { label: r.label, mtu: r.mtu, ip: r.ip, mss: mssFor(r.mtu, r.ip) };
});
var MSS_DEFAULT = 536;      // RFC 1122: assumed when no MSS option arrives

/* what a segment can hold: MTU minus the IP header minus the whole TCP header */
function dataFor(optBytes) { return MTU - IP4 - (BASE_HDR + optBytes); }
var DATA = [
  { label: 'no options', opt: 0, hdr: BASE_HDR },
  { label: '20 bytes of options', opt: PAD4, hdr: HDR4 },
  { label: '24 bytes of options', opt: ALIGN_PAD, hdr: HDR_ALIGN },
  { label: '40 bytes of options', opt: OPT_BUDGET, hdr: MAX_HDR }
].map(function (r) {
  var d = dataFor(r.opt);
  return { label: r.label, opt: r.opt, hdr: r.hdr, data: d, eff: d / MTU * 100 };
});
var MSS_ETH = mssFor(MTU, IP4);          // 1460
var OVERSHOOT = MSS_ETH + BASE_HDR + PAD4 + IP4;   // 1520
var OVER = OVERSHOOT - MTU;                        // 20

/* the ledger: the four options plus an 18-byte MD5 signature */
var LEDGER = {
  committed: RAW4,                 // 19
  free: OPT_BUDGET - RAW4,         // 21
  withMd5: RAW4 + OPT.md5,         // 37
  padded: pad4(RAW4 + OPT.md5),    // 40
  hdr: BASE_HDR + pad4(RAW4 + OPT.md5),   // 60
  data: dataFor(pad4(RAW4 + OPT.md5)),    // 1420
  plus4: RAW4 + OPT.md5 + 4        // 41
};

/* the scaled window: steps of 2^s, and the retraction they force */
var SHIFT = 7, STEP = Math.pow(2, SHIFT);      // 128
var TRUE_EDGE = 1300, TRUE_ACK = 1000;
var EDGES = [1, 2, 3].map(function (k) {
  return { k: k, field: k, edge: TRUE_ACK + k * STEP };
});
function edgeFor(ack, field) { return ack + field * STEP; }
var RETRACT = [
  { ack: 1000, field: 2, note: 'first acknowledgement' },
  { ack: 1040, field: 2, note: 'after 40 bytes' },
  { ack: 1045, field: 2, note: '5 more bytes: too far' },
  { ack: 1045, field: 1, note: 'the only other field' }
].map(function (r) {
  var e = edgeFor(r.ack, r.field);
  return {
    ack: r.ack, field: r.field, edge: e, note: r.note,
    win: r.field * STEP, gap: TRUE_EDGE - e,
    verdict: e > TRUE_EDGE ? 'past the buffer' : (r.field === 1 ? 'retracted' : 'short')
  };
});
var BOUND7 = STEP - 1;                       // 127
var BOUND14 = Math.pow(2, 14) - 1;           // 16,383
var BOUND0 = Math.pow(2, 0) - 1;             // 0
var SEGS_IN_BOUND = BOUND14 / MSS_ETH;       // 11.22

/* ---------- the checks ---------- */

chk('the header runs from 5 to 15 words of four bytes',
  WORDS_MIN * 4 === BASE_HDR && WORDS_MAX * 4 === MAX_HDR,
  WORDS_MIN * 4 + ' to ' + WORDS_MAX * 4);
chk('the option budget is forty bytes', OPT_BUDGET === 40, OPT_BUDGET);
chk('the four handshake options cost nineteen raw bytes', RAW4 === 19, RAW4);
chk('nineteen rounds up to twenty and the header to forty',
  PAD4 === 20 && HDR4 === 40, PAD4 + ' / ' + HDR4);
chk('the per-option padding costs four more bytes',
  ALIGN_RAW === 22 && ALIGN_PAD === 24 && HDR_ALIGN === 44,
  ALIGN_RAW + ' / ' + ALIGN_PAD + ' / ' + HDR_ALIGN);
chk('the budget still has 21 bytes free after the four options',
  FREE4 === 21 && FREE4 === OPT_BUDGET - RAW4, FREE4);
chk('an Ethernet MTU gives an MSS of 1460', MSS_ETH === 1460, MSS_ETH);
chk('a 576-byte MTU gives 536, the default when the option is absent',
  mssFor(576, IP4) === 536 && MSS_DEFAULT === 536, mssFor(576, IP4));
chk('a 9000-byte MTU gives 8960', mssFor(9000, IP4) === 8960, mssFor(9000, IP4));
chk('IPv6 subtracts sixty, giving 1440 on Ethernet and 1220 at the minimum',
  mssFor(1500, IP6) === 1440 && mssFor(1280, IP6) === 1220,
  mssFor(1500, IP6) + ' / ' + mssFor(1280, IP6));
chk('the smallest legal IPv4 MTU gives 28', mssFor(68, IP4) === 28, mssFor(68, IP4));
chk('every MSS is the MTU minus its headers',
  MSSROWS.every(function (r) { return r.mss === r.mtu - r.ip - 20; }),
  MSSROWS.length + ' rows');
chk('the MSS counts data only, so the headers fit exactly',
  MSS_ETH + IP4 + BASE_HDR === MTU, MSS_ETH + IP4 + BASE_HDR);
chk('twenty bytes of options leave 1440 bytes of data',
  DATA[1].data === 1440 && DATA[1].hdr === 40, DATA[1].data);
chk('twenty-four bytes leave 1436 and forty leave 1420',
  DATA[2].data === 1436 && DATA[3].data === 1420,
  DATA[2].data + ' / ' + DATA[3].data);
chk('payload efficiency falls from 97.33 to 96.00 per cent',
  Math.abs(DATA[0].eff - 97.3333) < 0.0001 && Math.abs(DATA[1].eff - 96.0) < 0.0001,
  DATA[0].eff.toFixed(4) + ' -> ' + DATA[1].eff.toFixed(4));
chk('sending the full MSS with the options overshoots by twenty bytes',
  OVERSHOOT === 1520 && OVER === 20, OVERSHOOT + ' / ' + OVER);
chk('the four options plus MD5 cost 37 bytes and pad to 40',
  LEDGER.withMd5 === 37 && LEDGER.padded === 40, LEDGER.withMd5 + ' -> ' + LEDGER.padded);
chk('a full option area makes a 60-byte header and 1420 bytes of data',
  LEDGER.hdr === 60 && LEDGER.data === 1420, LEDGER.hdr + ' / ' + LEDGER.data);
chk('one more four-byte option reaches 41 and does not fit',
  LEDGER.plus4 === 41 && LEDGER.plus4 > OPT_BUDGET, LEDGER.plus4);
chk('the shift count of seven gives a step of 128 bytes',
  STEP === 128, STEP);
chk('the expressible edges from acknowledgement 1000 are 1128, 1256 and 1384',
  EDGES[0].edge === 1128 && EDGES[1].edge === 1256 && EDGES[2].edge === 1384,
  EDGES.map(function (e) { return e.edge; }).join(', '));
chk('the true edge 1300 is not expressible from any whole field value',
  EDGES.every(function (e) { return e.edge !== TRUE_EDGE; }), TRUE_EDGE);
chk('a field of 2 from acknowledgement 1000 is 44 bytes short',
  RETRACT[0].edge === 1256 && RETRACT[0].gap === 44, RETRACT[0].gap);
chk('a field of 2 from acknowledgement 1040 is 4 bytes short',
  RETRACT[1].edge === 1296 && RETRACT[1].gap === 4, RETRACT[1].gap);
chk('a field of 2 from acknowledgement 1045 is one byte past the buffer',
  RETRACT[2].edge === 1301 && RETRACT[2].gap === -1, RETRACT[2].gap);
chk('a field of 1 from acknowledgement 1045 retracts 127 bytes',
  RETRACT[3].edge === 1173 && RETRACT[3].gap === 127, RETRACT[3].gap);
chk('the retraction in the example equals the bound of 127',
  RETRACT[3].gap === BOUND7 && BOUND7 === STEP - 1, BOUND7);
chk('the bound at shift 14 is 16,383 bytes',
  BOUND14 === 16383 && BOUND14 === Math.pow(2, 14) - 1, BOUND14);
chk('a shift of zero cannot retract anything', BOUND0 === 0, BOUND0);
chk('the worst retraction is more than eleven segments',
  Math.abs(SEGS_IN_BOUND - 11.2212) < 0.001 && SEGS_IN_BOUND > 11, SEGS_IN_BOUND.toFixed(4));
chk('every retracted edge still lies below the true edge',
  RETRACT.filter(function (r) { return r.gap > 0; })
    .every(function (r) { return r.edge < TRUE_EDGE; }), 'four rows checked');

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
function footer(s) {
  T(32, 440, s, { size: 9.5, color: FAINT });
}
function group(n) { return n.toLocaleString('en-US'); }

var SCENE_DRAW = {};

/* ---------- scene 1: the budget ---------- */

SCENE_DRAW.budget = function (t, sc) {
  head('The option space is forty bytes',
       'the data offset counts 32-bit words, so the header runs from 20 to 60 bytes');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(48, 66, 'one cell = one 32-bit word = 4 bytes', { size: 9.5, color: DIM });
  for (var i = 0; i < 15; i++) {
    var fixed = i < 5;
    box(48 + i * 30, 78, 28, 26, {
      fill: fixed ? SURF2 : ACCDIM, stroke: fixed ? BORDER : ACC, sw: 1, radius: 2
    });
    T(48 + i * 30 + 14, 86, String(i + 1), { size: 8, mono: true, align: 'center', color: FAINT });
  }
  T(48, 116, 'words 1 to 5: the fixed header, 20 bytes', { size: 9.5, color: INK });
  T(268, 116, 'words 6 to 15: the options, at most 40 bytes', { size: 9.5, color: ACC });

  P.alpha(b);
  T(48, 146, 'the data offset is 4 bits and holds 5 to 15, so the header is 20 to 60 bytes', { size: 11, color: INK });

  P.alpha(c);
  T(48, 178, '60  -  20  =  40 bytes of option space', { size: 15, mono: true, bold: true, color: ACC });
  T(48, 204, 'every option a connection uses is paid for out of that one budget', { size: 10.5, color: DIM });

  P.alpha(d);
  var names = ['MSS', 'window scale', 'SACK-permitted', 'timestamps'];
  names.forEach(function (n, k) {
    box(48 + k * 152, 232, 140, 30, { fill: SURF, stroke: ACC, sw: 1.2, radius: 4 });
    T(48 + k * 152 + 70, 240, n, { size: 10, align: 'center', color: INK });
  });
  box(48, 282, 804, 52, { fill: SURF, stroke: ACC });
  T(64, 294, 'The four options a modern handshake negotiates all live in the same forty bytes.', { size: 11.5, bold: true, color: INK });
  T(64, 316, 'Their prices are bytes, and the prices add: the header grows on every segment that carries them.', { size: 10.5, color: DIM });

  P.alpha(1);
  footer('Class B: RFC 9293 section 3.1 fixes the header format; the 60-byte ceiling is the 4-bit data offset.');
};

/* ---------- scene 2: the sizes ---------- */

SCENE_DRAW.sizes = function (t, sc) {
  head('Four handshake options, nineteen bytes',
       'add the lengths, then round the total up to a multiple of four, because the offset counts whole words');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(48, 66, 'option', { size: 9.5, color: FAINT });
  T(300, 66, 'kind', { size: 9.5, color: FAINT });
  T(380, 66, 'length', { size: 9.5, color: FAINT });
  T(470, 66, 'what it carries', { size: 9.5, color: FAINT });
  var rows = [
    ['maximum segment size', '2', '4', 'a 16-bit value, data octets only'],
    ['window scale', '3', '3', 'one byte: the shift count']
  ];
  rows.forEach(function (r, i) {
    var y = 88 + i * 24;
    T(48, y, r[0], { size: 11, color: INK });
    T(300, y, r[1], { size: 11, mono: true, color: ACC });
    T(380, y, r[2] + ' bytes', { size: 11, mono: true, color: ACC });
    T(470, y, r[3], { size: 10, color: DIM });
  });

  P.alpha(b);
  var rows2 = [
    ['SACK-permitted', '4', '2', 'a bare permission, no data'],
    ['timestamps', '8', '10', 'two header bytes and two 4-byte values']
  ];
  rows2.forEach(function (r, i) {
    var y = 136 + i * 24;
    T(48, y, r[0], { size: 11, color: INK });
    T(300, y, r[1], { size: 11, mono: true, color: ACC });
    T(380, y, r[2] + ' bytes', { size: 11, mono: true, color: ACC });
    T(470, y, r[3], { size: 10, color: DIM });
  });

  P.alpha(c);
  T(48, 202, '4 + 3 + 2 + 10 = 19 bytes of option data', { size: 13, mono: true, bold: true, color: INK });

  P.alpha(d);
  T(48, 232, 'the header must end on a 4-byte boundary, so 19 becomes 20 and the header becomes 40 bytes', { size: 11, color: INK });
  box(48, 254, 392, 74, { fill: SURF, stroke: ACC });
  T(64, 264, 'one padding at the end', { size: 10, bold: true, color: INK });
  T(64, 284, '19 -> 20, header 40', { size: 11, mono: true, color: ACC });
  T(64, 304, 'data 1440 on a 1500 MTU', { size: 9.5, color: DIM });
  box(460, 254, 392, 74, { fill: SURF, stroke: WARN });
  T(476, 264, 'each option padded with NOPs', { size: 10, bold: true, color: INK });
  T(476, 284, '22 -> 24, header 44', { size: 11, mono: true, color: WARN });
  T(476, 304, 'data 1436 on a 1500 MTU', { size: 9.5, color: DIM });

  P.alpha(1);
  footer('Option kinds and lengths: IANA TCP parameters, read 2026-11-04; RFC 9293 section 3.1 for the format.');
};

/* ---------- scene 3: the MSS ---------- */

SCENE_DRAW.mss = function (t, sc) {
  head('MSS = MTU minus the fixed headers',
       'the MSS counts data octets only, and each side advertises the size it can receive');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  box(48, 72, 804, 34, { fill: SURF, stroke: ACC });
  T(64, 82, 'MSS option: kind 2, length 4, a 16-bit value sent in the SYN', { size: 11, mono: true, color: INK });

  P.alpha(b);
  T(48, 126, 'the value counts data only: not the TCP header, not the IP header', { size: 11, color: INK });
  var barY = 148;
  var segs = [
    { w: 20 / 60 * 600, label: 'IPv4 20', fill: SURF2, stroke: BORDER },
    { w: 20 / 60 * 600, label: 'TCP 20', fill: SURF2, stroke: BORDER },
    { w: 20 / 60 * 600, label: 'data = MSS', fill: ACCDIM, stroke: ACC }
  ];
  var x = 48;
  segs.forEach(function (s) {
    box(x, barY, s.w, 30, { fill: s.fill, stroke: s.stroke, sw: 1.2, radius: 2 });
    T(x + s.w / 2, barY + 9, s.label, { size: 9.5, align: 'center', color: INK });
    x += s.w;
  });
  T(48, barY + 38, 'the three parts must fit one MTU: headers plus data is at most the MTU', { size: 9.5, color: DIM });

  P.alpha(c);
  T(48, 232, 'MSS = MTU - 20 (IPv4 header) - 20 (TCP header) = MTU - 40', { size: 13, mono: true, bold: true, color: ACC });

  P.alpha(d);
  T(48, 262, 'MTU', { size: 9.5, color: FAINT });
  T(150, 262, 'IP header', { size: 9.5, color: FAINT });
  T(280, 262, 'MSS', { size: 9.5, color: FAINT });
  T(400, 262, 'where it is used', { size: 9.5, color: FAINT });
  MSSROWS.forEach(function (r, i) {
    var y = 284 + i * 21;
    T(48, y, group(r.mtu), { size: 10.5, mono: true, color: INK });
    T(150, y, String(r.ip), { size: 10.5, mono: true, color: INK });
    T(280, y, group(r.mss), { size: 10.5, mono: true, bold: true, color: i === 1 || i === 3 ? ACC : INK });
    T(400, y, r.label, { size: 10, color: DIM });
  });
  T(48, 418, '536 is also the value assumed when no MSS option arrives at all', { size: 9.5, color: WARN });

  P.alpha(1);
  footer('RFC 6691 section 2 and RFC 1122 section 4.2.2.6, read 2026-11-04: the fixed headers are subtracted, and 536 is the default.');
};

/* ---------- scene 4: the data, not the MSS ---------- */

SCENE_DRAW.nodata = function (t, sc) {
  head('Options do not lower the MSS; they lower the data',
       'the promise stays 1460 while the segment that carries options carries 1440');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(48, 70, 'RFC 6691: "the MTU value SHOULD be decreased by only the size of the fixed IP and TCP headers"', { size: 11, color: INK });
  T(48, 92, 'so options are not subtracted from the MSS that is advertised', { size: 10.5, color: DIM });

  P.alpha(b);
  T(48, 122, 'a host that will send timestamps still advertises 1460, not 1448', { size: 11, color: INK });
  box(48, 142, 380, 30, { fill: SURF, stroke: ACC });
  T(64, 151, 'advertised MSS   1460', { size: 11, mono: true, color: ACC });
  box(472, 142, 380, 30, { fill: SURF, stroke: BORDER });
  T(488, 151, 'and it stays 1460 for the connection', { size: 10, color: DIM });

  P.alpha(c);
  T(48, 200, 'but the sender must cut the data by the options it actually sends', { size: 11, color: INK });
  var rows = [
    ['no options', 20, 1460],
    ['20 bytes of options', 40, 1440],
    ['24 bytes of options', 44, 1436],
    ['40 bytes of options', 60, 1420]
  ];
  T(48, 224, 'TCP header', { size: 9.5, color: FAINT });
  T(220, 224, 'data sent', { size: 9.5, color: FAINT });
  T(400, 224, 'efficiency of the 1500-byte MTU', { size: 9.5, color: FAINT });
  rows.forEach(function (r, i) {
    var y = 246 + i * 22;
    T(48, y, r[0] + ': ' + r[1] + ' bytes', { size: 10.5, color: INK });
    T(220, y, group(r[2]), { size: 10.5, mono: true, bold: true, color: i === 1 ? ACC : INK });
    T(400, y, (r[2] / 1500 * 100).toFixed(2) + ' per cent', { size: 10.5, mono: true, color: DIM });
  });

  P.alpha(d);
  box(48, 344, 804, 52, { fill: BADDIM, stroke: BAD });
  T(64, 356, '1460 data + 40 TCP header + 20 IP header = 1520 bytes: 20 past a 1500-byte MTU', { size: 11, bold: true, color: INK });
  T(64, 378, 'IP would have to fragment the segment, which is the outcome the MSS exists to prevent.', { size: 10.5, color: DIM });

  P.alpha(1);
  footer('The quotation is RFC 6691 section 2; the fragmentation outcome is arithmetic on the four sizes.');
};

/* ---------- scene 5: the ledger ---------- */

SCENE_DRAW.ledger = function (t, sc) {
  head('Spending the whole budget',
       'the options compete for one space, so adding one can force another out');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  /* a 40-byte bar: 19 committed, then free, then MD5 fills it */
  var barX = 48, barW = 804, per = barW / OPT_BUDGET;
  P.alpha(a);
  T(48, 66, 'the 40-byte option area', { size: 9.5, color: DIM });
  box(barX, 80, per * RAW4, 34, { fill: ACCDIM, stroke: ACC, sw: 1.2, radius: 3 });
  T(barX + 4, 90, '19: MSS 4, WS 3, SACK 2, TS 10', { size: 9.5, color: ACC });
  box(barX + per * RAW4, 80, per * FREE4, 34, { fill: SURF, stroke: BORDER, dash: [4, 4], radius: 3 });
  T(barX + per * OPT_BUDGET - 6, 90, '21 free', { size: 9.5, align: 'right', color: DIM });
  T(48, 126, 'the four handshake options commit 19 bytes and leave 21', { size: 11, color: INK });

  P.alpha(b);
  box(barX + per * RAW4, 80, per * OPT.md5, 34, { fill: WARNDIM, stroke: WARN, sw: 1.2, radius: 3 });
  T(barX + per * RAW4 + 6, 90, 'MD5 18', { size: 9.5, color: WARN });
  T(48, 152, 'a TCP MD5 signature option is 18 bytes: 19 + 18 = 37, which pads to 40', { size: 11, color: INK });

  P.alpha(c);
  T(48, 182, 'header = 20 + 40 = 60 bytes, the maximum the data offset can name', { size: 11, mono: true, color: ACC });
  T(48, 206, 'data on a 1500-byte MTU = 1500 - 20 - 60 = 1420 bytes', { size: 11, mono: true, color: INK });
  T(48, 230, 'efficiency 94.67 per cent, against 97.33 with no options', { size: 10.5, color: DIM });

  P.alpha(d);
  box(48, 258, 804, 54, { fill: BADDIM, stroke: BAD });
  T(64, 270, '37 + 4 = 41: one more four-byte option does not fit, even before padding', { size: 11.5, bold: true, color: INK });
  T(64, 292, 'The budget is shared, not per option, so a combination question is an addition followed by a comparison.', { size: 10.5, color: DIM });

  P.alpha(1);
  T(48, 336, 'Options that fit together: MSS 4 + WS 3 + SACK-permitted 2 + timestamps 10 = 19 of 40.', { size: 10.5, color: INK });
  T(48, 358, 'Options that fill it: those four plus MD5 18 = 37, padded to 40, leaving no room at all.', { size: 10.5, color: INK });
  footer('Option lengths from the IANA registry; the padding rule from the 4-bit data offset in RFC 9293.');
};

/* ---------- scene 6: the granularity ---------- */

SCENE_DRAW.granularity = function (t, sc) {
  head('The window is counted in steps of 2^s',
       'with a shift count of 7 the field counts 128-byte steps, so the right edge lands only on some points');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(48, 70, 'field value k means k x 2^s bytes of window', { size: 11, color: INK });
  T(48, 92, 's = 7  ->  one step is 128 bytes', { size: 11, mono: true, color: ACC });

  P.alpha(b);
  T(48, 122, 'right edge = acknowledgement + k x 2^s', { size: 12, mono: true, bold: true, color: INK });

  P.alpha(c);
  /* a line from ACK 1000 to 1450, with the expressible edges marked */
  var x0 = 90, x1 = 830, lo = 980, hi = 1460;
  function X(v) { return x0 + (v - lo) / (hi - lo) * (x1 - x0); }
  P.line(x0, 190, x1, 190, { stroke: BORDER, sw: 2 });
  EDGES.forEach(function (e) {
    P.line(X(e.edge), 180, X(e.edge), 200, { stroke: ACC, sw: 2 });
    T(X(e.edge), 204, String(e.edge), { size: 9.5, mono: true, align: 'center', color: ACC });
    T(X(e.edge), 164, 'field ' + e.field, { size: 9.5, align: 'center', color: DIM });
  });
  P.line(X(TRUE_ACK), 176, X(TRUE_ACK), 204, { stroke: INK, sw: 2 });
  T(X(TRUE_ACK), 208, 'ACK 1000', { size: 9.5, mono: true, align: 'center', color: INK });
  T(48, 236, 'from ACK 1000 the field can name 1128, 1256 or 1384, and nothing in between', { size: 10.5, color: INK });

  P.alpha(d);
  P.line(X(TRUE_EDGE), 158, X(TRUE_EDGE), 226, { stroke: BAD, sw: 2, dash: [5, 4] });
  T(X(TRUE_EDGE), 144, 'buffer ends at 1300', { size: 10, align: 'center', color: BAD });
  box(48, 266, 804, 54, { fill: SURF, stroke: BAD });
  T(64, 278, 'The buffer end at 1300 is not a step boundary, so no field value names it exactly.', { size: 11.5, bold: true, color: INK });
  T(64, 300, 'Field 2 understates it by 44 bytes; field 3 overstates it by 84 and would invite a byte the buffer cannot hold.', { size: 10.5, color: DIM });

  P.alpha(1);
  T(48, 340, 'The window field names a length, but only lengths that are whole numbers of steps are expressible.', { size: 10.5, color: DIM });
  footer('RFC 7323 sections 2.3 and 2.4: SEG.WND is right-shifted by Rcv.Wind.Shift, so the field counts steps.');
};

/* ---------- scene 7: the retraction ---------- */

SCENE_DRAW.retraction = function (t, sc) {
  head('The retraction: 1301 is past the buffer, 1173 is 127 short',
       'four acknowledgements from the appendix, and the only two fields available at the last one');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(48, 66, 'ACK', { size: 9.5, color: FAINT });
  T(140, 66, 'field', { size: 9.5, color: FAINT });
  T(220, 66, 'window', { size: 9.5, color: FAINT });
  T(320, 66, 'right edge', { size: 9.5, color: FAINT });
  T(450, 66, 'against the 1300-byte buffer', { size: 9.5, color: FAINT });

  function row(r, i, show) {
    var y = 88 + i * 26;
    if (!show) return;
    T(48, y, String(r.ack), { size: 11, mono: true, color: INK });
    T(140, y, String(r.field), { size: 11, mono: true, color: INK });
    T(220, y, String(r.win), { size: 11, mono: true, color: INK });
    T(320, y, String(r.edge), { size: 11, mono: true, bold: true, color: r.gap < 0 ? BAD : ACC });
    T(450, y, r.gap < 0 ? (Math.abs(r.gap) + ' byte past the buffer') : (r.gap + ' bytes short'), { size: 10.5, color: r.gap < 0 ? BAD : DIM });
    T(660, y, r.note, { size: 9.5, color: FAINT });
  }
  row(RETRACT[0], 0, a > 0);
  row(RETRACT[1], 1, b > 0);
  row(RETRACT[2], 2, c > 0);
  row(RETRACT[3], 3, d > 0);

  P.alpha(c);
  box(48, 196, 804, 46, { fill: BADDIM, stroke: BAD });
  T(64, 206, 'A field of 2 at ACK 1045 gives 1301: one byte beyond what the buffer can store.', { size: 11, bold: true, color: INK });
  T(64, 226, 'A field of 3 would be worse; there is no field between 1 and 2.', { size: 10, color: DIM });

  P.alpha(d);
  box(48, 256, 804, 46, { fill: WARNDIM, stroke: WARN });
  T(64, 266, 'A field of 1 gives 1173: the advertised window falls from 256 bytes to 128.', { size: 11, bold: true, color: INK });
  T(64, 286, 'The window has been retracted, and both ends must handle it.', { size: 10, color: DIM });

  P.alpha(1);
  T(48, 326, 'The receiver chose the smaller window, because the larger one would have promised a byte it could not keep.', { size: 10.5, color: INK });
  T(48, 348, 'This happens whenever the sender writes fewer bytes than one step of the scale factor.', { size: 10.5, color: DIM });
  footer('The four rows are RFC 7323 Appendix F, read 2026-11-04; the gaps are arithmetic on the edges.');
};

/* ---------- scene 8: the rules ---------- */

SCENE_DRAW.rules = function (t, sc) {
  head('Three rules that make the shrink safe',
       'one on the receiving side, two on the sending side, and one piece of bookkeeping');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  box(48, 72, 804, 62, { fill: SURF, stroke: ACC });
  T(64, 82, '1  the receiver honours what it has already promised', { size: 11.5, bold: true, color: INK });
  T(64, 104, 'any segment that would have been in window for any acknowledgement it has sent is still in window', { size: 10.5, color: DIM });

  P.alpha(b);
  box(48, 148, 804, 62, { fill: SURF, stroke: ACC });
  T(64, 158, '2  the first retransmission may ignore the window', { size: 11.5, bold: true, color: INK });
  T(64, 180, 'allowed when the sequence number is out of window by less than 2^s, if the original was in window when sent', { size: 10.5, color: DIM });

  P.alpha(c);
  box(48, 224, 804, 62, { fill: SURF, stroke: ACC });
  T(64, 234, '3  later retransmissions obey the latest window', { size: 11.5, bold: true, color: INK });
  T(64, 256, 'the allowance is one segment wide, not a general licence to ignore the receiver', { size: 10.5, color: DIM });

  P.alpha(d);
  box(48, 300, 804, 62, { fill: SURF2, stroke: BORDER });
  T(64, 310, 'and the bookkeeping: a scaled receiver tracks the largest right edge it has advertised', { size: 11.5, bold: true, color: INK });
  T(64, 332, 'its latest acknowledgement may name a smaller edge than the data it has already accepted', { size: 10.5, color: DIM });

  P.alpha(1);
  T(48, 384, 'Read together: the promise is the older, larger window; the permission is the newer, smaller one.', { size: 10.5, color: DIM });
  footer('RFC 7323 section 2.4, rules 1 to 5, and RFC 1122 section 4.2.2.16 on shrinking windows.');
};

/* ---------- scene 9: the cost ---------- */

SCENE_DRAW.cost = function (t, sc) {
  head('The cost is bounded by 2^s minus one',
       'a true edge can sit just below the next expressible one, so the worst shrink is one step minus a byte');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(48, 70, 'two expressible edges are one step apart: 2^s bytes', { size: 11, color: INK });
  T(48, 96, 'so a true edge can fall at most 2^s - 1 bytes below the next one', { size: 12, mono: true, bold: true, color: ACC });

  P.alpha(b);
  T(48, 130, 'shift count', { size: 9.5, color: FAINT });
  T(200, 130, 'step, bytes', { size: 9.5, color: FAINT });
  T(360, 130, 'worst retraction', { size: 9.5, color: FAINT });
  T(560, 130, 'in 1460-byte segments', { size: 9.5, color: FAINT });
  var bounds = [
    { s: 0, step: 1, bound: 0 },
    { s: 7, step: 128, bound: 127 },
    { s: 10, step: 1024, bound: 1023 },
    { s: 14, step: 16384, bound: 16383 }
  ];
  bounds.forEach(function (r, i) {
    var y = 152 + i * 22;
    T(48, y, String(r.s), { size: 10.5, mono: true, color: INK });
    T(200, y, group(r.step), { size: 10.5, mono: true, color: INK });
    T(360, y, group(r.bound), { size: 10.5, mono: true, bold: true, color: i === 3 ? BAD : ACC });
    T(560, y, r.bound === 0 ? 'none' : (r.bound / 1460).toFixed(2), { size: 10.5, mono: true, color: DIM });
  });

  P.alpha(c);
  box(48, 250, 804, 50, { fill: SURF, stroke: BAD });
  T(64, 262, 'At the largest legal shift count, 14, a single retraction can withdraw 16,383 bytes.', { size: 11.5, bold: true, color: INK });
  T(64, 284, 'That is 11.22 segments of 1460 bytes: more than a whole window of ordinary segments.', { size: 10.5, color: DIM });

  P.alpha(d);
  T(48, 318, 'why stacks rarely show it: windows are announced in whole segments, rounded up to the next step,', { size: 10.5, color: INK });
  T(48, 338, 'and small window updates are suppressed, so the window advances more often than it retreats.', { size: 10.5, color: INK });

  P.alpha(1);
  T(48, 372, 'A step of 1 can never retract anything, which is why an unscaled connection has no such rule.', { size: 10.5, color: DIM });
  footer('The bound is arithmetic on RFC 7323 section 2.4 and the cap of 14 in section 2.3.');
};

/* ---------- scene 10: consolidation ---------- */

SCENE_DRAW.consolidate = function (t, sc) {
  head('Consolidation: the ledger, the arithmetic and the bound',
       'four rules to carry, and the five slips that cost a mark');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(48, 72, '1  budget: 40 bytes, the option lengths summed and rounded up to a multiple of four', { size: 11, color: INK });
  T(48, 94, '19 raw becomes 20, so a header of 40; 37 becomes 40, so a header of 60', { size: 10, color: DIM });

  P.alpha(b);
  T(48, 124, '2  MSS: the MTU minus the fixed headers, counting data only', { size: 11, color: INK });
  T(48, 146, '1500 IPv4 gives 1460; 1500 IPv6 gives 1440; 576 gives 536, also the default', { size: 10, color: DIM });

  P.alpha(c);
  T(48, 176, '3  options do not lower the MSS: they lower the data in the segment that carries them', { size: 11, color: INK });
  T(48, 198, '1460 advertised, 1440 sent with 20 bytes of options, 1420 with a full 40', { size: 10, color: DIM });

  P.alpha(d);
  T(48, 228, '4  a scaled window can retract by 2^s - 1 bytes, and the rules say to handle it', { size: 11, color: INK });
  T(48, 250, '127 bytes at a step of 128, 16,383 at a step of 16,384', { size: 10, color: DIM });

  box(48, 278, 804, 78, { fill: SURF, stroke: ACC });
  T(64, 288, 'the five slips', { size: 11, bold: true, color: INK });
  T(64, 308, 'headers counted inside the MSS  ·  an MSS lowered for options  ·  one shared MSS for both directions', { size: 10, color: INK });
  T(64, 328, '40 bytes read as a per-option limit  ·  a shrinking window treated as an error', { size: 10, color: INK });

  P.alpha(1);
  footer('No previous-year question is reproduced or attributed on this page; every number is computed here.');
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
  CONST: { base: BASE_HDR, max: MAX_HDR, budget: OPT_BUDGET, opt: OPT },
  PACK: { raw: RAW4, padded: PAD4, header: HDR4, free: FREE4, alignedRaw: ALIGN_RAW, alignedPadded: ALIGN_PAD, alignedHeader: HDR_ALIGN },
  MSS: { rows: MSSROWS, eth: MSS_ETH, def: MSS_DEFAULT, overshoot: OVERSHOOT, over: OVER },
  DATA: DATA,
  LEDGER: LEDGER,
  SCALE: { shift: SHIFT, step: STEP, trueEdge: TRUE_EDGE, edges: EDGES, retract: RETRACT },
  BOUND: { s0: BOUND0, s7: BOUND7, s14: BOUND14, segs: SEGS_IN_BOUND }
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
