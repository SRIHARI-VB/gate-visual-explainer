/* ==========================================================================
   tcp-handshake-and-teardown — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model is RFC 9293 (TCP, August 2022): section 3.1 for the header and the
   control bits, 3.3.2 for the eleven states, 3.4.1 for the initial sequence
   number generator, 3.5 with Figures 6 and 7 for the handshake and simultaneous
   open, 3.5.2 for reset generation, 3.6 with Figures 12 and 13 for the close and
   simultaneous close, 3.7.1 for the MSS option and its defaults, and MUST-13 with
   MAY-2 for TIME-WAIT and its one legal early exit.
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

/* ---------- header constants, in octets ---------- */
var HDR_FIXED = 20;        /* fixed TCP header */
var OPT_MAX_SPACE = 40;    /* data offset 15 words x 4 = 60, minus the fixed 20 */
var HDR_MAX = HDR_FIXED + OPT_MAX_SPACE;   /* 60 */
var IP4_MAX = 65535;       /* 16-bit total length field */
var MSS_MAX_IP4 = IP4_MAX - 40;            /* 65495 */
var MSS_DEFAULT_IP4 = 576 - 40;            /* 536 */
var MSS_DEFAULT_IP6 = 1280 - 60;           /* 1220 */

/* ---------- the six control bits of the original design ---------- */
var FLAGS = [
  { name: 'URG', bit: 5, means: 'the urgent pointer is meaningful', cost: 0 },
  { name: 'ACK', bit: 4, means: 'the acknowledgment field is meaningful', cost: 0 },
  { name: 'PSH', bit: 3, means: 'deliver the data to the application now', cost: 0 },
  { name: 'RST', bit: 2, means: 'abort the connection', cost: 0 },
  { name: 'SYN', bit: 1, means: 'synchronise sequence numbers', cost: 1 },
  { name: 'FIN', bit: 0, means: 'no more data from the sender', cost: 1 }
];
/* the two reserved bits that later became congestion signals */
var ECN_BITS = ['CWR', 'ECE'];

/* ---------- the eleven states, RFC 9293 section 3.3.2 ---------- */
var STATES = ['LISTEN', 'SYN-SENT', 'SYN-RECEIVED', 'ESTABLISHED', 'FIN-WAIT-1',
              'FIN-WAIT-2', 'CLOSE-WAIT', 'CLOSING', 'LAST-ACK', 'TIME-WAIT', 'CLOSED'];
/* the two states that hold no timer of their own */
var UNTIMED_STATES = ['CLOSE-WAIT', 'FIN-WAIT-2'];

/* ---------- the opening exchange ---------- */
var ISN_A = 100, ISN_B = 300;              /* RFC 9293 Figure 6 */
var HS = [
  { id: 1, from: 'A', flags: ['SYN'], seq: ISN_A, ack: null, occupied: 1,
    aState: 'SYN-SENT', bState: 'SYN-RECEIVED' },
  { id: 2, from: 'B', flags: ['SYN', 'ACK'], seq: ISN_B, ack: ISN_A + 1, occupied: 1,
    aState: 'ESTABLISHED', bState: 'SYN-RECEIVED' },
  { id: 3, from: 'A', flags: ['ACK'], seq: ISN_A + 1, ack: ISN_B + 1, occupied: 0,
    aState: 'ESTABLISHED', bState: 'ESTABLISHED' }
];
var HS_ACK_A = HS[1].ack;                  /* 101 */
var HS_ACK_B = HS[2].ack;                  /* 301 */
var HS_SEQ_FINAL = HS[2].seq;              /* 101 */

/* ---------- the data, then the closing exchange ---------- */
var DATA_BYTES = 1000;
var DATA_FIRST = ISN_A + 1;                /* 101 */
var DATA_LAST = DATA_FIRST + DATA_BYTES - 1;  /* 1100 */
var FIN_A = DATA_LAST + 1;                 /* 1101 */
var ACK_OF_FIN_A = FIN_A + 1;              /* 1102 */
var FIN_B = ISN_B + 1;                     /* 301: B sent no data */
var ACK_OF_FIN_B = FIN_B + 1;              /* 302 */
var TD = [
  { id: 1, from: 'A', flags: ['FIN', 'ACK'], seq: FIN_A, ack: ISN_B + 1, occupied: 1,
    aState: 'FIN-WAIT-1', bState: 'CLOSE-WAIT' },
  { id: 2, from: 'B', flags: ['ACK'], seq: ISN_B + 1, ack: ACK_OF_FIN_A, occupied: 0,
    aState: 'FIN-WAIT-2', bState: 'CLOSE-WAIT' },
  { id: 3, from: 'B', flags: ['FIN', 'ACK'], seq: FIN_B, ack: ACK_OF_FIN_A, occupied: 1,
    aState: 'TIME-WAIT', bState: 'LAST-ACK' },
  { id: 4, from: 'A', flags: ['ACK'], seq: ACK_OF_FIN_A, ack: ACK_OF_FIN_B, occupied: 0,
    aState: 'TIME-WAIT', bState: 'CLOSED' }
];

/* ---------- the initial sequence number generator ---------- */
var TICK_US = 4;                                  /* microseconds per tick */
var SPACE = Math.pow(2, 32);                      /* 4,294,967,296 values */
var SPACE_MAX = SPACE - 1;                        /* 4,294,967,295 */
var CYCLE_S = SPACE * TICK_US / 1e6;              /* 17179.87 seconds */
var CYCLE_H = CYCLE_S / 3600;                     /* 4.7722 hours */
var RFC_CYCLE_H = 4.55;                           /* what RFC 9293 prints */
var RFC_IMPLIED_US = RFC_CYCLE_H * 3600 * 1e6 / SPACE;   /* the tick the 4.55 figure implies */
var MSL = 120;                                    /* seconds, RFC 9293 */
var TICKS_PER_MSL = MSL * 1e6 / TICK_US;          /* 30,000,000 */
var CYCLE_OVER_MSL = CYCLE_S / MSL;               /* 143.2 */

/* ---------- TIME-WAIT ---------- */
var TIME_WAIT = 2 * MSL;                          /* 240 seconds */
var TIME_WAIT_MIN = TIME_WAIT / 60;               /* 4 minutes */

/* ---------- the option block of a modern SYN ---------- */
var OPTIONS = [
  { name: 'MSS', kind: 2, bytes: 4 },
  { name: 'SACK-permitted', kind: 4, bytes: 2 },
  { name: 'Timestamps', kind: 8, bytes: 10 },
  { name: 'NOP', kind: 1, bytes: 1 },
  { name: 'Window scale', kind: 3, bytes: 3 }
];
var OPT_TOTAL = OPTIONS.reduce(function (a, o) { return a + o.bytes; }, 0);   /* 20 */
var SYN_BYTES = HDR_FIXED + OPT_TOTAL;                                        /* 40 */

/* ---------- the three shapes that break client and server ---------- */
var SIM_OPEN_SEGMENTS = 4;      /* two SYNs and two SYN,ACKs */
var SIM_CLOSE_SEGMENTS = 4;     /* two FINs and two ACKs */
var NORMAL_CLOSE_SEGMENTS = TD.length;
var OPEN_AND_CLOSE = HS.length + NORMAL_CLOSE_SEGMENTS;   /* 7 */
var SIM_CLOSE_TIME_WAIT_SOCKETS = 2;

/* ======================================================================
   THE CHECKS - every figure above, verified against its own definition
   ====================================================================== */

chk('the SYN-ACK acknowledges the opener SYN plus one',
    HS[1].ack === ISN_A + 1, '101 = 100 + 1');

chk('the final ACK acknowledges the listener SYN plus one',
    HS[2].ack === ISN_B + 1, '301 = 300 + 1');

chk('the final ACK reuses the opener next number',
    HS[2].seq === HS[1].ack, 'seq 101, the same 101 it acknowledged');

chk('an ACK occupies no sequence number',
    HS[2].occupied === 0 && TD[1].occupied === 0 && TD[3].occupied === 0,
    'three acknowledgments, zero numbers');

chk('SYN and FIN occupy exactly one number each',
    FLAGS.filter(function (f) { return f.cost === 1; }).length === 2 &&
    FLAGS.filter(function (f) { return f.name === 'SYN' || f.name === 'FIN'; })
      .every(function (f) { return f.cost === 1; }),
    'SYN and FIN only');

chk('the handshake is three segments and carries no data',
    HS.length === 3 && HS.every(function (s) { return s.occupied <= 1; }),
    'one number per SYN, none for the ACK');

chk('the data run ends at 1100', DATA_LAST === 1100, '101 + 1000 - 1 = 1100');

chk('the FIN sits at the number after the last data byte',
    FIN_A === DATA_LAST + 1, '1101 = 1100 + 1');

chk('the acknowledgment of that FIN is 1102',
    ACK_OF_FIN_A === FIN_A + 1, '1102 = 1101 + 1');

chk('the listener FIN sits right after the listener SYN',
    FIN_B === ISN_B + 1, '301 = 300 + 1');

chk('the last acknowledgment is 302',
    ACK_OF_FIN_B === FIN_B + 1, '302 = 301 + 1');

chk('the close is four segments with two numbered FINs',
    TD.length === 4 &&
    TD.filter(function (s) { return s.flags.indexOf('FIN') >= 0; }).length === 2,
    'FIN, ACK, FIN, ACK');

chk('every acknowledgment in the close is a plus-one step',
    TD[1].ack === TD[0].seq + 1 && TD[3].ack === TD[2].seq + 1,
    '1102 = 1101 + 1 and 302 = 301 + 1');

chk('the close ends with the opener in TIME-WAIT and the listener closed',
    TD[3].aState === 'TIME-WAIT' && TD[3].bState === 'CLOSED',
    'only the active closer waits');

chk('the eleven states are the eleven the standard lists',
    STATES.length === 11 && STATES[9] === 'TIME-WAIT', 'LISTEN to CLOSED');

chk('only CLOSE-WAIT and FIN-WAIT-2 carry no timer',
    UNTIMED_STATES.length === 2 &&
    UNTIMED_STATES.every(function (s) { return STATES.indexOf(s) >= 0; }),
    'the half-close can last forever');

chk('TIME-WAIT is twice the maximum segment lifetime',
    TIME_WAIT === 2 * MSL && TIME_WAIT === 240, '2 x 120 = 240 seconds');

chk('the sequence space is 2 to the 32 and its highest value one less',
    SPACE === 4294967296 && SPACE_MAX === 4294967295, '4,294,967,296 values');

chk('the clock wraps in 4.7722 hours at one tick per 4 microseconds',
    Math.abs(CYCLE_H - 4.7722) < 0.001, CYCLE_S.toFixed(2) + ' seconds');

chk('the 4.55 hour figure the standard prints implies a shorter tick',
    Math.abs(RFC_IMPLIED_US - TICK_US) < 1 && RFC_IMPLIED_US < TICK_US,
    RFC_IMPLIED_US.toFixed(3) + ' microseconds against 4');

chk('one maximum segment lifetime spans 30 million ticks',
    TICKS_PER_MSL === 30000000, '120 s / 4 us = 30,000,000');

chk('the wrap time is more than a hundred maximum segment lifetimes',
    CYCLE_OVER_MSL > 100, CYCLE_OVER_MSL.toFixed(1) + ' times');

chk('the option block of a modern SYN is 20 bytes',
    OPT_TOTAL === 20 && SYN_BYTES === 40, '4 + 2 + 10 + 1 + 3 = 20, plus 20');

chk('the SYN header fits inside the 60-byte maximum',
    SYN_BYTES <= HDR_MAX && OPT_MAX_SPACE === 40, '40 of 60');

chk('the default MSS values are 536 and 1220',
    MSS_DEFAULT_IP4 === 536 && MSS_DEFAULT_IP6 === 1220, '576 - 40 and 1280 - 60');

chk('the largest advertisable MSS is 65495',
    MSS_MAX_IP4 === 65495, '65535 - 40');

chk('a simultaneous open costs one segment more than a normal open',
    SIM_OPEN_SEGMENTS === HS.length + 1, '4 against 3');

chk('a simultaneous close leaves two sockets in TIME-WAIT',
    SIM_CLOSE_TIME_WAIT_SOCKETS === 2 && SIM_CLOSE_SEGMENTS === 4,
    'four segments, two waiters');

chk('an open and a close together cost seven segments',
    OPEN_AND_CLOSE === 7, '3 + 4');

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
function footer(s) { T(32, 444, s, { size: 9.5, color: FAINT }); }
function n(x) { return Number(x).toLocaleString('en-US'); }

/* a lifeline: the vertical line that a sequence diagram hangs its arrows on */
function lifeline(x, top, bottom, name, sub) {
  P.line(x, top, bottom, { stroke: BORDER, sw: 1.5, dash: [5, 5] });
  box(x - 74, top - 34, 148, 30, { fill: SURF, stroke: BORDER, sw: 1.2, radius: 5 });
  T(x, top - 26, name, { size: 11, bold: true, color: INK, align: 'center' });
  if (sub) T(x, top - 10, sub, { size: 8.5, color: FAINT, align: 'center' });
}

/* one arrow of a sequence diagram, with its label above the midpoint */
function seg(x1, x2, y, label, sub, col) {
  var c = col || INFO;
  var dir = x2 > x1 ? 1 : -1;
  P.arrow(x1, y, x2, y, { stroke: c, sw: 1.8, head: 9 });
  var mid = (x1 + x2) / 2;
  T(mid, y - 26, label, { size: 10, bold: true, color: c, align: 'center' });
  if (sub) T(mid, y - 13, sub, { size: 9, mono: true, color: INK, align: 'center' });
  return dir;
}

var SCENE_DRAW = {};

/* ---------- scene 1: two counters, two exchanges ---------- */

SCENE_DRAW.counters = function (t, sc) {
  head('Two counters, three segments to open, four to close',
       'one sequence number space per direction; nothing shared but the acknowledgment fields');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  lifeline(190, 116, 386, 'Peer A', 'opens actively');
  lifeline(710, 116, 386, 'Peer B', 'listens');
  box(120, 58, 140, 22, { fill: ACCDIM, stroke: ACC, sw: 1, radius: 5 });
  T(190, 64, 'next = ' + ISN_A, { size: 10.5, mono: true, color: ACC, align: 'center' });
  box(640, 58, 140, 22, { fill: ACCDIM, stroke: ACC, sw: 1, radius: 5 });
  T(710, 64, 'next = ' + ISN_B, { size: 10.5, mono: true, color: ACC, align: 'center' });

  P.alpha(b);
  T(40, 128, 'open', { size: 10, bold: true, color: VAL });
  seg(190, 710, 150, 'SYN', 'seq ' + ISN_A);
  seg(710, 190, 182, 'SYN, ACK', 'seq ' + ISN_B + ', ack ' + HS_ACK_A);
  seg(190, 710, 214, 'ACK', 'seq ' + HS_SEQ_FINAL + ', ack ' + HS_ACK_B);

  P.alpha(c);
  T(40, 246, 'close', { size: 10, bold: true, color: BAD });
  seg(190, 710, 268, 'FIN, ACK', 'seq ' + FIN_A, BAD);
  seg(710, 190, 300, 'ACK', 'ack ' + ACK_OF_FIN_A, BAD);
  seg(710, 190, 332, 'FIN, ACK', 'seq ' + FIN_B, BAD);
  seg(190, 710, 364, 'ACK', 'ack ' + ACK_OF_FIN_B, BAD);
  T(710, 386, 'waits ' + TIME_WAIT + ' s', { size: 9.5, bold: true, color: WARN, align: 'center' });

  P.alpha(d);
  box(40, 400, 820, 32, { fill: WARNDIM, stroke: WARN, sw: 1, radius: 5 });
  T(52, 410, 'each counter is 32 bits: ' + n(SPACE) + ' values, highest ' + n(SPACE_MAX) +
    ', then it wraps; every data byte, and every SYN and FIN, consumes one', { size: 10, color: INK });
  footer('RFC 9293 Figure 6 for the open and Figure 12 for the close; the numbers are computed on load');
};

/* ---------- scene 2: the flags ---------- */

SCENE_DRAW.flags = function (t, sc) {
  head('Six control bits, and the two that cost a sequence number',
       'a flag is one bit; a numbered flag is one bit that also moves the counter');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  var vis = [a, a, b, b, c, c];
  FLAGS.forEach(function (f, i) {
    P.alpha(vis[i]);
    var y = 74 + i * 40;
    var costs = f.cost === 1;
    box(40, y, 820, 34, {
      fill: costs ? ACCDIM : SURF, stroke: costs ? ACC : BORDER,
      sw: costs ? 1.6 : 1, radius: 4
    });
    T(54, y + 10, f.name, { size: 11.5, bold: true, mono: true, color: costs ? ACC : INK });
    T(130, y + 10, 'bit ' + f.bit, { size: 9.5, mono: true, color: FAINT });
    T(200, y + 11, f.means, { size: 10, color: INK });
    T(730, y + 11, costs ? 'occupies 1 sequence number' : 'occupies no sequence number',
      { size: 10, bold: costs, color: costs ? ACC : DIM });
  });

  P.alpha(d);
  box(40, 314, 820, 44, { fill: SURF2, stroke: BORDER, sw: 1, radius: 5 });
  T(52, 322, 'two reserved bits became congestion signals: ' + ECN_BITS.join(' and ') +
    ', so the flag octet now carries eight bits', { size: 10, color: INK });
  T(52, 338, 'the rule that does all the arithmetic: a SYN numbered x is acknowledged x + 1, ' +
    'and a FIN numbered f is acknowledged f + 1', { size: 10, color: ACC });

  P.alpha(d);
  T(40, 376, 'because an ACK is not numbered, the same number can be used again on the next segment:',
    { size: 10, color: INK });
  T(40, 396, 'the third segment of the handshake carries seq ' + HS_SEQ_FINAL +
    ', and so will the first data byte', { size: 10, mono: true, color: ACC });
  T(40, 420, 'this is why 101 appears twice in the exchange and 102 never does',
    { size: 10, color: DIM });
  footer('RFC 9293 section 3.1: the control bits, and the rule that SYN and FIN occupy sequence space');
};

/* ---------- scene 3: the handshake ---------- */

SCENE_DRAW.handshake = function (t, sc) {
  head('The three-way handshake, byte for byte',
       'two plus-one steps, carried in three segments and one round trip');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  lifeline(200, 110, 390, 'Peer A', 'ISN ' + ISN_A);
  lifeline(700, 110, 390, 'Peer B', 'LISTEN, ISN ' + ISN_B);

  P.alpha(a);
  seg(200, 700, 150, 'SYN', 'seq ' + ISN_A + ', no acknowledgment');
  T(200, 172, 'SYN-SENT', { size: 9, mono: true, color: INFO, align: 'center' });

  P.alpha(b);
  seg(700, 200, 216, 'SYN, ACK', 'seq ' + ISN_B + ', ack ' + HS_ACK_A);
  T(200, 238, 'ESTABLISHED', { size: 9, mono: true, color: VAL, align: 'center' });
  T(700, 238, 'SYN-RECEIVED', { size: 9, mono: true, color: INFO, align: 'center' });

  P.alpha(c);
  seg(200, 700, 282, 'ACK', 'seq ' + HS_SEQ_FINAL + ', ack ' + HS_ACK_B);
  T(700, 304, 'ESTABLISHED', { size: 9, mono: true, color: VAL, align: 'center' });

  P.alpha(d);
  box(40, 330, 820, 92, { fill: SURF2, stroke: BORDER, sw: 1, radius: 5 });
  T(52, 340, 'where each number comes from', { size: 10.5, bold: true, color: ACC });
  T(52, 358, 'ack ' + HS_ACK_A + ' = ' + ISN_A + ' + 1', { size: 10.5, mono: true, color: INK });
  T(300, 358, 'ack ' + HS_ACK_B + ' = ' + ISN_B + ' + 1', { size: 10.5, mono: true, color: INK });
  T(548, 358, 'seq ' + HS_SEQ_FINAL + ' = ' + ISN_A + ' + 1', { size: 10.5, mono: true, color: INK });
  T(52, 380, 'the third segment acknowledges ' + HS_ACK_B + ' and is itself numbered ' + HS_SEQ_FINAL +
    ', because an acknowledgment takes no number', { size: 10, color: DIM });
  T(52, 400, 'the listener reaches ESTABLISHED when that third segment arrives, half a round trip ' +
    'after the opener', { size: 10, color: DIM });
  footer('RFC 9293 Figure 6; the states are shown after the departure or arrival of each segment');
};

/* ---------- scene 4: why three ---------- */

SCENE_DRAW.whythree = function (t, sc) {
  head('Why three messages and not two',
       'the third message carries no number of its own; it carries proof');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  box(40, 70, 400, 158, { fill: SURF, stroke: BORDER, sw: 1, radius: 6 });
  T(54, 80, 'after two messages', { size: 11, bold: true, color: INFO });
  var knows = [
    ['B knows A starts at ' + ISN_A, true],
    ['A knows B starts at ' + ISN_B, true],
    ['B knows A received ' + ISN_B, false]
  ];
  knows.forEach(function (k, i) {
    T(54, 104 + i * 24, (k[1] ? 'known   ' : 'unknown ') + k[0],
      { size: 10, color: k[1] ? VAL : BAD, mono: false });
  });
  T(54, 182, 'so B has to wait, holding state, until A answers', { size: 10, color: DIM });
  T(54, 202, 'that wait is what a half-open connection is', { size: 10, color: DIM });

  P.alpha(b);
  box(460, 70, 400, 158, { fill: SURF, stroke: BORDER, sw: 1, radius: 6 });
  T(474, 80, 'a stale SYN looks identical', { size: 11, bold: true, color: BAD });
  T(474, 104, 'an old SYN numbered ' + ISN_A + ' arrives late, from a connection', { size: 10, color: INK });
  T(474, 124, 'that has already finished. Nothing in the header says so.', { size: 10, color: INK });
  T(474, 152, 'sequence numbers are not tied to a clock in the network,', { size: 10, color: INK });
  T(474, 172, 'so the receiver cannot tell new from duplicate.', { size: 10, color: INK });
  T(474, 200, 'it must ask the sender to confirm.', { size: 10, color: ACC });

  P.alpha(c);
  box(40, 244, 820, 60, { fill: ACCDIM, stroke: ACC, sw: 1.2, radius: 6 });
  T(54, 254, 'the third message is the confirmation: it acknowledges ' + ISN_B +
    ', a number only the real sender was offered', { size: 10.5, color: INK });
  T(54, 276, 'a duplicate SYN produces an acknowledgment of a number nobody offered, and the ' +
    'confusion is caught', { size: 10, color: DIM });

  P.alpha(d);
  box(40, 316, 400, 96, { fill: SURF2, stroke: BORDER, sw: 1, radius: 6 });
  T(54, 326, 'cost for the opener', { size: 10.5, bold: true, color: INFO });
  T(54, 350, 'one round trip: it is ESTABLISHED the moment it', { size: 10, color: INK });
  T(54, 370, 'sends the third segment', { size: 10, color: INK });
  T(54, 392, 'three segments, ' + (HS.length) + ' numbers occupied', { size: 10, mono: true, color: ACC });

  box(460, 316, 400, 96, { fill: SURF2, stroke: BORDER, sw: 1, radius: 6 });
  T(474, 326, 'cost for the listener', { size: 10.5, bold: true, color: INFO });
  T(474, 350, 'one and a half round trips: it is ESTABLISHED', { size: 10, color: INK });
  T(474, 370, 'when that segment arrives', { size: 10, color: INK });
  T(474, 392, 'the half is the third segment travelling back', { size: 10, color: DIM });
  footer('RFC 9293 section 3.5: the principal reason for the handshake is to defeat old duplicate initiations');
};

/* ---------- scene 5: the initial number ---------- */

SCENE_DRAW.isn = function (t, sc) {
  head('The initial number is a clock plus a hash',
       'ISN = M + F(local ip, local port, remote ip, remote port, secret key)');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  box(40, 70, 400, 96, { fill: SURF, stroke: BORDER, sw: 1, radius: 6 });
  T(54, 80, 'M, the clock', { size: 11, bold: true, color: ACC });
  T(54, 102, 'a 32-bit counter that climbs until it wraps', { size: 10, color: INK });
  T(54, 122, 'one tick every ' + TICK_US + ' microseconds, roughly', { size: 10, color: INK });
  T(54, 144, 'neither realtime nor precise, and not kept across reboots', { size: 9.5, color: DIM });

  box(460, 70, 400, 96, { fill: SURF, stroke: BORDER, sw: 1, radius: 6 });
  T(474, 80, 'F, the hash', { size: 11, bold: true, color: ACC });
  T(474, 102, 'a pseudorandom function of the four identifiers', { size: 10, color: INK });
  T(474, 122, 'and a secret key, so the value cannot be predicted', { size: 10, color: INK });
  T(474, 144, 'guessing it would let an off-path attacker inject data', { size: 9.5, color: DIM });

  P.alpha(b);
  T(40, 190, 'the clock line, from 0 to 2 to the 32', { size: 10, bold: true, color: INK });
  box(40, 204, 820, 26, { fill: SURF2, stroke: BORDER, sw: 1, radius: 4 });
  P.rect(40, 204, 820 * (MSL / CYCLE_S), 26, { fill: ACC, stroke: null, radius: 4 });
  T(52, 210, 'one MSL: ' + MSL + ' s', { size: 9, color: SURF, bold: true });
  T(240, 210, 'the whole wrap: ' + CYCLE_S.toFixed(2) + ' s = ' + CYCLE_H.toFixed(4) + ' hours',
    { size: 9.5, color: INK });
  T(40, 236, 'the first band is the only part of the line an MSL covers; the rest is the reason ' +
    'an ISN cannot repeat while a segment lives', { size: 9.5, color: DIM });

  P.alpha(c);
  box(40, 262, 400, 106, { fill: WARNDIM, stroke: WARN, sw: 1, radius: 6 });
  T(54, 272, 'the arithmetic, two ways', { size: 10.5, bold: true, color: WARN });
  T(54, 294, n(SPACE) + ' x ' + TICK_US + ' us = ' + CYCLE_S.toFixed(2) + ' s', { size: 10, mono: true, color: INK });
  T(54, 314, '= ' + CYCLE_H.toFixed(4) + ' hours, which is 4.77 hours', { size: 10, mono: true, color: INK });
  T(54, 336, 'the standard prints 4.55 hours, which implies ' + RFC_IMPLIED_US.toFixed(3) + ' us a tick', { size: 9.5, color: INK });
  T(54, 354, 'both are approximations of one mechanism, as the text itself says', { size: 9.5, color: DIM });

  box(460, 262, 400, 106, { fill: SURF2, stroke: BORDER, sw: 1, radius: 6 });
  T(474, 272, 'why it dwarfs the maximum segment lifetime', { size: 10.5, bold: true, color: ACC });
  T(474, 294, 'one MSL = ' + MSL + ' s = ' + n(TICKS_PER_MSL) + ' ticks', { size: 10, mono: true, color: INK });
  T(474, 314, 'the wrap is ' + CYCLE_OVER_MSL.toFixed(1) + ' maximum segment lifetimes', { size: 10, mono: true, color: INK });
  T(474, 336, 'so a number cannot come round again while any segment', { size: 9.5, color: INK });
  T(474, 354, 'from an earlier incarnation could still be in the network', { size: 9.5, color: INK });

  P.alpha(d);
  box(40, 382, 820, 40, { fill: BADDIM, stroke: BAD, sw: 1, radius: 6 });
  T(54, 390, 'a fixed start, such as zero, makes every incarnation of the same four values use the ' +
    'same numbers:', { size: 10, color: INK });
  T(54, 406, 'an old duplicate then fits the current window and is accepted as data. That is the ' +
    'problem the clock exists to prevent.', { size: 10, color: INK });
  footer('RFC 9293 sections 3.4.1 and 3.3.2: the clock-driven generator, and the MSL it must outlast');
};

/* ---------- scene 6: the options ---------- */

SCENE_DRAW.options = function (t, sc) {
  head('The options ride only on the opening segments',
       'a modern SYN is 40 bytes: 20 fixed, 20 of options, inside a 60-byte maximum');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  /* the header bar, drawn to scale: 40 bytes over 720 px, 18 px per byte */
  var X0 = 60, PXB = 17, Y0 = 88, HB = 40;
  P.alpha(a);
  box(X0, Y0, HDR_FIXED * PXB, HB, { fill: SURF2, stroke: BORDER, sw: 1.2, radius: 4 });
  T(X0 + HDR_FIXED * PXB / 2, Y0 + 14, 'fixed header', { size: 9.5, color: INK, align: 'center' });
  T(X0 + HDR_FIXED * PXB / 2, Y0 + 28, HDR_FIXED + ' bytes', { size: 9, mono: true, color: DIM, align: 'center' });

  var colours = [ACC, INFO, WARN, DIM, VAL];
  var x = X0 + HDR_FIXED * PXB;
  P.alpha(b);
  OPTIONS.forEach(function (o, i) {
    var w = o.bytes * PXB;
    P.rect(x, Y0, w, HB, { fill: colours[i], stroke: SURF, sw: 1.2, radius: 2 });
    T(x + w / 2, Y0 + 10, o.name, { size: 8.5, bold: true, color: SURF, align: 'center' });
    T(x + w / 2, Y0 + 24, o.bytes, { size: 9, mono: true, color: SURF, align: 'center' });
    x += w;
  });

  T(40, 76, 'a SYN, to scale: ' + SYN_BYTES + ' bytes, ' + (SYN_BYTES / 4) + ' words, so data offset ' +
    (SYN_BYTES / 4), { size: 9.5, color: DIM });

  P.alpha(c);
  box(40, 146, 820, 52, { fill: SURF2, stroke: BORDER, sw: 1, radius: 6 });
  T(52, 156, 'the sum: ' + OPTIONS.map(function (o) { return o.bytes; }).join(' + ') + ' = ' +
    OPT_TOTAL + ' bytes of options, plus ' + HDR_FIXED + ' fixed = ' + SYN_BYTES,
    { size: 10.5, mono: true, color: ACC });
  T(52, 178, 'the data offset field counts 4-byte words and holds 4 bits, so 15 words is the ' +
    'ceiling: ' + HDR_MAX + ' bytes, leaving ' + OPT_MAX_SPACE + ' for options',
    { size: 10, color: INK });

  P.alpha(c);
  box(40, 210, 400, 108, { fill: SURF, stroke: BORDER, sw: 1, radius: 6 });
  T(54, 220, 'what is negotiated, once', { size: 10.5, bold: true, color: INFO });
  T(54, 244, 'MSS: the largest segment the sender will receive', { size: 10, color: INK });
  T(54, 264, 'window scale: a left shift applied to every window', { size: 10, color: INK });
  T(54, 284, 'timestamps: round-trip measurement and wrap protection', { size: 10, color: INK });
  T(54, 304, 'SACK-permitted: whether selective acknowledgment is used', { size: 10, color: INK });

  box(460, 210, 400, 108, { fill: SURF, stroke: BORDER, sw: 1, radius: 6 });
  T(474, 220, 'what may not be sent again', { size: 10.5, bold: true, color: BAD });
  T(474, 244, 'the MSS option must not appear on any segment', { size: 10, color: INK });
  T(474, 264, 'without the SYN bit: a size is agreed once', { size: 10, color: INK });
  T(474, 284, 'options are part of the header, so they consume', { size: 10, color: INK });
  T(474, 304, 'payload space on that segment, not extra space', { size: 10, color: INK });

  P.alpha(d);
  box(40, 330, 820, 90, { fill: WARNDIM, stroke: WARN, sw: 1, radius: 6 });
  T(52, 340, 'if no MSS option arrives, the sender must assume a default', { size: 10.5, bold: true, color: WARN });
  T(52, 362, 'IPv4: ' + MSS_DEFAULT_IP4 + ' = 576 - 40', { size: 10.5, mono: true, color: INK });
  T(300, 362, 'IPv6: ' + MSS_DEFAULT_IP6 + ' = 1280 - 60', { size: 10.5, mono: true, color: INK });
  T(548, 362, 'largest advertisable: ' + n(MSS_MAX_IP4) + ' = 65535 - 40', { size: 10.5, mono: true, color: INK });
  T(52, 388, 'a SYN of ' + SYN_BYTES + ' bytes is the whole reason the effective segment size is the ' +
    'path minus 40 or minus 60, never minus 20', { size: 10, color: INK });
  T(52, 406, 'the window scale and timestamps agreed here are assumed for the rest of the connection',
    { size: 9.5, color: DIM });
  footer('RFC 9293 section 3.7.1 for the MSS option and its defaults; section 3.1 for the data offset ceiling');
};

/* ---------- scene 7: the teardown ---------- */

SCENE_DRAW.teardown = function (t, sc) {
  head('The close, after 1000 bytes of data',
       'two FINs, two acknowledgments, and one sequence number per FIN');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  lifeline(200, 108, 392, 'Peer A', 'closes first');
  lifeline(700, 108, 392, 'Peer B', 'closes second');

  P.alpha(a);
  seg(200, 700, 138, 'DATA', DATA_FIRST + ' to ' + DATA_LAST + ', ' + n(DATA_BYTES) + ' bytes', VAL);
  seg(200, 700, 176, 'FIN, ACK', 'seq ' + FIN_A, BAD);
  T(200, 198, 'FIN-WAIT-1', { size: 9, mono: true, color: BAD, align: 'center' });

  P.alpha(b);
  seg(700, 200, 222, 'ACK', 'ack ' + ACK_OF_FIN_A, BAD);
  T(200, 244, 'FIN-WAIT-2', { size: 9, mono: true, color: BAD, align: 'center' });
  T(700, 244, 'CLOSE-WAIT', { size: 9, mono: true, color: WARN, align: 'center' });

  P.alpha(c);
  seg(700, 200, 272, 'FIN, ACK', 'seq ' + FIN_B, BAD);
  T(700, 294, 'LAST-ACK', { size: 9, mono: true, color: WARN, align: 'center' });

  P.alpha(d);
  seg(200, 700, 322, 'ACK', 'ack ' + ACK_OF_FIN_B, BAD);
  T(200, 344, 'TIME-WAIT', { size: 9, mono: true, color: WARN, align: 'center' });
  T(700, 344, 'CLOSED', { size: 9, mono: true, color: DIM, align: 'center' });

  box(40, 356, 820, 76, { fill: SURF2, stroke: BORDER, sw: 1, radius: 5 });
  T(52, 364, 'the four numbers, each one a plus-one step', { size: 10, bold: true, color: ACC });
  T(52, 384, 'data ends ' + DATA_LAST + '  ->  FIN ' + FIN_A + '  ->  ack ' + ACK_OF_FIN_A,
    { size: 10, mono: true, color: INK });
  T(52, 402, 'B sent no data, so its FIN sits at ' + FIN_B + '  ->  ack ' + ACK_OF_FIN_B,
    { size: 10, mono: true, color: INK });
  T(500, 384, 'A waits ' + TIME_WAIT + ' s', { size: 10.5, bold: true, color: WARN });
  T(500, 402, 'B is finished at once', { size: 9.5, color: DIM });
  footer('RFC 9293 Figure 12: the normal close sequence, which delivers buffered data in both directions');
};

/* ---------- scene 8: TIME-WAIT ---------- */

SCENE_DRAW.timewait = function (t, sc) {
  head('TIME-WAIT lasts twice the maximum segment lifetime',
       '2 x ' + MSL + ' seconds = ' + TIME_WAIT + ' seconds, held by the side that closed first');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  var X0 = 60, BW = 780;
  box(X0, 84, BW, 34, { fill: SURF2, stroke: BORDER, sw: 1, radius: 5 });
  P.rect(X0, 84, BW / 2, 34, { fill: ACC, stroke: null, radius: 5 });
  P.rect(X0 + BW / 2, 84, BW / 2, 34, { fill: INFO, stroke: null, radius: 5 });
  T(X0 + BW / 4, 94, 'MSL ' + MSL + ' s', { size: 10, bold: true, color: SURF, align: 'center' });
  T(X0 + 3 * BW / 4, 94, 'MSL ' + MSL + ' s', { size: 10, bold: true, color: SURF, align: 'center' });
  T(X0, 126, '0', { size: 9, mono: true, color: DIM });
  T(X0 + BW, 126, TIME_WAIT + ' s', { size: 9, mono: true, color: DIM, align: 'right' });
  T(X0 + BW / 2, 126, 'one MSL, ' + MSL + ' s', { size: 9, mono: true, color: DIM, align: 'center' });
  T(40, 148, 'the maximum segment lifetime is 2 minutes, an engineering choice the standard says may ' +
    'be changed; twice it is ' + TIME_WAIT_MIN + ' minutes', { size: 9.5, color: DIM });

  P.alpha(b);
  box(40, 172, 400, 116, { fill: SURF, stroke: ACC, sw: 1.2, radius: 6 });
  T(54, 182, 'reason one: the last acknowledgment', { size: 10.5, bold: true, color: ACC });
  T(54, 206, 'if that ACK is lost, the peer retransmits its FIN', { size: 10, color: INK });
  T(54, 226, 'a socket still in TIME-WAIT answers again', { size: 10, color: INK });
  T(54, 246, 'a closed socket would answer with a reset,', { size: 10, color: INK });
  T(54, 266, 'which the peer reports to its application as an error', { size: 10, color: DIM });

  P.alpha(c);
  box(460, 172, 400, 116, { fill: SURF, stroke: INFO, sw: 1.2, radius: 6 });
  T(474, 182, 'reason two: delayed duplicates', { size: 10.5, bold: true, color: INFO });
  T(474, 206, 'the same four values may be reused at once', { size: 10, color: INK });
  T(474, 226, 'a segment from the old connection would then', { size: 10, color: INK });
  T(474, 246, 'fit the new window and be accepted as data', { size: 10, color: INK });
  T(474, 266, 'waiting out twice the lifetime makes that impossible', { size: 10, color: DIM });

  P.alpha(d);
  box(40, 300, 820, 68, { fill: ACCDIM, stroke: ACC, sw: 1, radius: 6 });
  T(52, 310, 'the one legal early exit, from TIME-WAIT straight into a new connection',
    { size: 10.5, bold: true, color: ACC });
  T(52, 332, 'a new SYN may be accepted if the new initial number is larger than the largest number ' +
    'used on the previous incarnation,', { size: 10, color: INK });
  T(52, 352, 'and the socket returns to TIME-WAIT if that SYN turns out to be an old duplicate. ' +
    'Timestamps make a cheaper version of this possible.', { size: 10, color: INK });

  T(40, 386, 'four consequences are usually listed for the wait: the lost ACK, the retransmitted FIN, ' +
    'the death of old duplicates, and no reuse of the pair;', { size: 9.5, color: INK });
  T(40, 404, 'the standard itself names the first and the fourth as the purpose of the state',
    { size: 9.5, color: DIM });
  footer('RFC 9293 MUST-13 for the wait, MAY-2 for the early exit, and section 3.3.2 for the stated purpose');
};

/* ---------- scene 9: the three odd shapes ---------- */

SCENE_DRAW.edges = function (t, sc) {
  head('Simultaneous open, simultaneous close, half-close',
       'three shapes the client-and-server picture does not cover');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  box(40, 70, 400, 148, { fill: SURF, stroke: BORDER, sw: 1, radius: 6 });
  T(54, 80, 'simultaneous open', { size: 11, bold: true, color: INFO });
  T(54, 102, 'A sends SYN ' + ISN_A + ', B sends SYN ' + ISN_B + ', neither', { size: 10, color: INK });
  T(54, 122, 'is listening; both answers are SYN and ACK', { size: 10, color: INK });
  T(54, 150, SIM_OPEN_SEGMENTS + ' segments instead of ' + HS.length, { size: 10.5, mono: true, color: ACC });
  T(54, 172, 'an implementation is required to support it', { size: 9.5, color: DIM });
  T(54, 194, 'both pass through SYN-RECEIVED, by the active path', { size: 9.5, color: DIM });

  P.alpha(b);
  box(460, 70, 400, 148, { fill: SURF, stroke: BORDER, sw: 1, radius: 6 });
  T(474, 80, 'the path through the states', { size: 11, bold: true, color: INFO });
  var path = ['CLOSED', 'SYN-SENT', 'SYN-RECEIVED', 'ESTABLISHED'];
  path.forEach(function (s, i) {
    var y = 104 + i * 26;
    T(474, y, s, { size: 9.5, mono: true, color: i === 3 ? VAL : INK });
    if (i < 3) T(560, y, '->', { size: 9.5, color: FAINT });
  });
  T(474, 208, 'normally SYN-RECEIVED is reached from LISTEN;', { size: 9, color: DIM });

  P.alpha(c);
  box(40, 232, 400, 132, { fill: SURF, stroke: BORDER, sw: 1, radius: 6 });
  T(54, 242, 'simultaneous close', { size: 11, bold: true, color: BAD });
  T(54, 264, 'each side sends FIN before receiving one, so', { size: 10, color: INK });
  T(54, 284, 'each is the active closer', { size: 10, color: INK });
  T(54, 310, SIM_CLOSE_SEGMENTS + ' segments, but ' + SIM_CLOSE_TIME_WAIT_SOCKETS +
    ' sockets in TIME-WAIT', { size: 10.5, mono: true, color: BAD });
  T(54, 332, 'against 1 in the normal close', { size: 9.5, color: DIM });
  T(54, 352, 'both then wait ' + TIME_WAIT + ' seconds, not one', { size: 9.5, color: DIM });

  P.alpha(d);
  box(460, 232, 400, 132, { fill: SURF, stroke: BORDER, sw: 1, radius: 6 });
  T(474, 242, 'half-close', { size: 11, bold: true, color: WARN });
  T(474, 264, 'a FIN closes one direction only', { size: 10, color: INK });
  T(474, 284, 'the receiver stays in CLOSE-WAIT until its own', { size: 10, color: INK });
  T(474, 306, 'application closes, which may be never', { size: 10, color: INK });
  T(474, 328, 'CLOSE-WAIT and FIN-WAIT-2 hold no timer', { size: 10.5, mono: true, color: WARN });
  T(474, 350, 'so a server may answer long after the client stopped sending', { size: 9, color: DIM });

  box(40, 378, 820, 44, { fill: SURF2, stroke: BORDER, sw: 1, radius: 6 });
  T(52, 386, 'the common thread: a connection is symmetric, so every rule about opening and closing ' +
    'applies to both sides', { size: 10, color: INK });
  T(52, 404, 'and the only asymmetry the protocol keeps is who closed first, which decides who waits',
    { size: 10, color: ACC });
  footer('RFC 9293 MUST-10 for simultaneous open, Figure 13 for simultaneous close, MAY-1 for the half-close');
};

/* ---------- scene 10: consolidation ---------- */

SCENE_DRAW.consolidate = function (t, sc) {
  head('The chain, from the flags to the wait',
       'four steps, in the order the numbers are needed');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  var chain = [
    ['the rule', 'SYN and FIN occupy one number, ACK none', 'cost 1 / 1 / 0'],
    ['the open', 'two plus-one steps in three segments', HS_ACK_A + ' and ' + HS_ACK_B],
    ['the close', 'data, then one FIN each way', ACK_OF_FIN_A + ' and ' + ACK_OF_FIN_B],
    ['the wait', 'twice the maximum segment lifetime', TIME_WAIT + ' seconds']
  ];
  chain.forEach(function (r, i) {
    var vis = i < 1 ? a : i < 2 ? b : i < 3 ? c : d;
    P.alpha(vis);
    var y = 74 + i * 44;
    box(40, y - 12, 820, 36, { fill: i % 2 ? SURF2 : SURF, stroke: BORDER, sw: 1, radius: 4 });
    T(52, y - 4, (i + 1) + '. ' + r[0], { size: 10.5, bold: true, color: ACC });
    T(190, y - 4, r[1], { size: 10, color: INK });
    T(650, y - 4, r[2], { size: 10, mono: true, color: INK });
  });

  P.alpha(d);
  T(40, 232, 'the six slips', { size: 10.5, bold: true, color: BAD });
  var slips = [
    'counting an ACK as a sequence number, so the third segment would read 102 instead of 101',
    'giving a FIN no number, so the acknowledgment would be 1101 instead of 1102',
    'starting at zero, which makes every incarnation use the same numbers',
    'sending the MSS option on a data segment, where the standard forbids it',
    'assuming both directions close together, so the close is drawn with two segments',
    'reusing the four values with no wait, so a delayed duplicate is taken for new data'
  ];
  slips.forEach(function (s, i) {
    T(48, 254 + i * 21, (i + 1) + '.  ' + s, { size: 9.8, color: INK });
  });
  T(40, 402, 'two counters, three segments to open, four to close, and one side waits twice a lifetime',
    { size: 11, color: ACC });
  footer('every number on this page is computed at load and printed under the canvas');
};

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

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

  if (typeof window.createCanvas === 'function' && PR) {
    try {
      var sk = new window.p5(function (s) {
        s.setup = function () {
          var c = s.createCanvas(W, H);
          if (c && c.parent) c.parent(holder);
          s.pixelDensity(1);
          s.noLoop();
          P = PR.makePainterP5(s, W, H);
          drawFrame(P);
        };
        s.draw = function () { drawFrame(P); };
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
  CONST: {
    hdrFixed: HDR_FIXED, optMax: OPT_MAX_SPACE, hdrMax: HDR_MAX,
    mssMaxIp4: MSS_MAX_IP4, mssDefaultIp4: MSS_DEFAULT_IP4, mssDefaultIp6: MSS_DEFAULT_IP6
  },
  FLAGS: FLAGS,
  ECN: ECN_BITS,
  STATES: STATES,
  HANDSHAKE: { isn: [ISN_A, ISN_B], segments: HS, ackA: HS_ACK_A, ackB: HS_ACK_B },
  CLOSE: {
    data: DATA_BYTES, first: DATA_FIRST, last: DATA_LAST,
    finA: FIN_A, ackFinA: ACK_OF_FIN_A, finB: FIN_B, ackFinB: ACK_OF_FIN_B, segments: TD
  },
  ISN: {
    tickUs: TICK_US, space: SPACE, spaceMax: SPACE_MAX, cycleS: CYCLE_S, cycleH: CYCLE_H,
    rfcCycleH: RFC_CYCLE_H, impliedUs: RFC_IMPLIED_US, msl: MSL,
    ticksPerMsl: TICKS_PER_MSL, cycleOverMsl: CYCLE_OVER_MSL
  },
  TIMEWAIT: { seconds: TIME_WAIT, minutes: TIME_WAIT_MIN, msl: MSL },
  OPTIONS: { list: OPTIONS, total: OPT_TOTAL, synBytes: SYN_BYTES },
  SHAPES: {
    simOpen: SIM_OPEN_SEGMENTS, simClose: SIM_CLOSE_SEGMENTS,
    normalClose: NORMAL_CLOSE_SEGMENTS, openAndClose: OPEN_AND_CLOSE,
    simCloseWaiters: SIM_CLOSE_TIME_WAIT_SOCKETS, untimed: UNTIMED_STATES
  }
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
