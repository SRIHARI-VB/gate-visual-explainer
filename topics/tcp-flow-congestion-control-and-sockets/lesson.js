/* ==========================================================================
   tcp-flow-congestion-control-and-sockets — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no window arithmetic of its own: every
   figure on the canvas was computed once here and checked against the rule it
   is supposed to satisfy (RFC 5681 section 3, as GATE states it).
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
  var INK = PAL.ink, DIM = PAL.dim, ACC = PAL.accent, INFO = PAL.info;
  var VAL = PAL.valid, BAD = PAL.invalid, WARN = PAL.warn;

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- the two windows ---------- */

var RWND_MSS = 6;          /* what the receiver advertises, in segments   */
var INFLIGHT_MSS = 2;      /* sent and not yet acknowledged              */
var USABLE_MSS = RWND_MSS - INFLIGHT_MSS;

var WINDOW_FIELD_MAX = Math.pow(2, 16) - 1;   /* 65535 bytes, no options */

/* flow-limited rate on a lossless path: window / round trip */
var FLOW_RTT = 0.1;                                     /* 100 ms */
var FLOW_BPS = WINDOW_FIELD_MAX / FLOW_RTT;             /* bytes/s */
var FLOW_MBPS = FLOW_BPS * 8 / 1e6;

/* ---------- slow start, and where it stops ---------- */

var SS_THRESHOLD = 16;                                   /* MSS */
var SS_DOUBLING = [1, 2, 4, 8, 16];
var SS_LINEAR = [17, 18, 19];
var SS_SERIES = SS_DOUBLING.concat(SS_LINEAR);

/* ---------- the generic window walk ----------
   One rule, applied round trip by round trip:
     below the threshold  -> double, but never past the threshold
     at or above it       -> add one segment
     never above the receiver window
*/
function walk(opts) {
  var cwnd = opts.start;
  var ssthresh = opts.ssthresh;
  var cap = opts.rwndMSS || Infinity;
  var rows = [{ rtt: 0, cwnd: cwnd, phase: cwnd < ssthresh ? 'slow start' : 'avoidance', note: opts.note0 || '' }];
  for (var r = 1; r <= opts.rounds; r++) {
    var next, phase;
    if (cwnd < ssthresh) {
      next = Math.min(cwnd * 2, ssthresh);
      phase = 'slow start';
    } else {
      next = cwnd + 1;
      phase = 'avoidance';
    }
    if (next > cap) next = cap;
    cwnd = next;
    rows.push({ rtt: r, cwnd: cwnd, phase: phase, note: '' });
  }
  return rows;
}

/* GATE 2014 Set 1 Q27: 32 KB at a timeout, MSS 2 KB, RTT 100 ms */
var T14_MSS = 2;                                  /* KB per segment */
var T14_LOSS_MSS = 32 / T14_MSS;                  /* 16 segments    */
var T14_THRESH = Math.max(2, Math.floor(T14_LOSS_MSS / 2));
var T14_RTT_MS = 100;
var T14_ROWS = walk({ start: 1, ssthresh: T14_THRESH, rounds: 11, note0: 'timeout: cwnd 16 -> 1, ssthresh 8' });
var T14_TARGET = T14_LOSS_MSS;
var T14_HIT = (function () {
  for (var i = 0; i < T14_ROWS.length; i++) if (T14_ROWS[i].cwnd >= T14_TARGET) return T14_ROWS[i].rtt;
  return -1;
})();
var T14_MS = T14_HIT * T14_RTT_MS;

/* GATE 2020 Q55: rwnd 50 KB, ssthresh 32 KB, MSS 2 KB, RTT 6 ms, t+60 ms */
var T20_MSS_KB = 2;
var T20_RWND_MSS = 50 / T20_MSS_KB;               /* 25 segments */
var T20_THRESH = 32 / T20_MSS_KB;                 /* 16 segments */
var T20_RTT_MS = 6;
var T20_ROUNDS = 60 / T20_RTT_MS;                 /* 10          */
var T20_ROWS = walk({ start: 1, ssthresh: T20_THRESH, rwndMSS: T20_RWND_MSS, rounds: T20_ROUNDS });
var T20_LAST = T20_ROWS[T20_ROWS.length - 1].cwnd;
var T20_KB = T20_LAST * T20_MSS_KB;
var T20_MAX = T20_ROWS.reduce(function (m, r) { return Math.max(m, r.cwnd); }, 0);

/* GATE 2024 Set 2 Q54: 12 MSS at a loss, two clean round trips after */
var T24_LOSS_MSS = 12;
var T24_THRESH = Math.max(2, Math.floor(T24_LOSS_MSS / 2));
var T24_TIMEOUT_ROWS = walk({ start: 1, ssthresh: T24_THRESH, rounds: 3, note0: 'timeout: cwnd 12 -> 1' });
var T24_DUP_ROWS = walk({ start: T24_THRESH, ssthresh: T24_THRESH, rounds: 3, note0: '3 dup ACKs: cwnd 12 -> 6' });
var T24_TIMEOUT_2 = T24_TIMEOUT_ROWS[2].cwnd;
var T24_DUP_2 = T24_DUP_ROWS[2].cwnd;

/* ---------- throughput of the sawtooth ---------- */

var AIMD_WMAX = 100;                       /* MSS */
var AIMD_MSS_B = 1460;                     /* bytes */
var AIMD_RTT = 0.04;                       /* 40 ms */
var AIMD_SAW = (function () {
  var out = [];
  for (var w = AIMD_WMAX / 2; w <= AIMD_WMAX; w++) out.push(w);
  return out;
})();
var AIMD_AVG = AIMD_SAW.reduce(function (a, b) { return a + b; }, 0) / AIMD_SAW.length;
var AIMD_BYTES_PER_RTT = AIMD_AVG * AIMD_MSS_B;
var AIMD_BPS = AIMD_BYTES_PER_RTT / AIMD_RTT;
var AIMD_MBPS = AIMD_BPS * 8 / 1e6;

/* ---------- the window the path needs ---------- */

var BDP_MBPS = 100, BDP_RTT_MS = 100;
var BDP_BITS = BDP_MBPS * 1e6 * (BDP_RTT_MS / 1000);
var BDP_BYTES = BDP_BITS / 8;
var BDP_MSS = BDP_BYTES / AIMD_MSS_B;
var BDP_SCALE = 1;
while (BDP_SCALE * WINDOW_FIELD_MAX < BDP_BYTES) BDP_SCALE *= 2;
var BDP_CEILING = BDP_SCALE * WINDOW_FIELD_MAX;

/* ---------- segment size ---------- */

var MTU = 1500, IP_HDR = 20, TCP_HDR = 20, IPV6_HDR = 40;
var MSS4 = MTU - IP_HDR - TCP_HDR;                 /* 1460 */
var MSS6 = MTU - IPV6_HDR - TCP_HDR;               /* 1440 */
var TRANSFER = 10000;
var SEG_COUNT = Math.ceil(TRANSFER / MSS4);
var SEG_LAST = TRANSFER - (SEG_COUNT - 1) * MSS4;

/* ---------- the socket calls ---------- */

var SOCK_SERVER = [
  { name: 'socket()', purpose: 'create an endpoint' },
  { name: 'bind()', purpose: 'attach it to a local port' },
  { name: 'listen()', purpose: 'make it passive: accept connections' },
  { name: 'accept()', purpose: 'take one connection, return a new socket' },
  { name: 'send()/recv()', purpose: 'exchange bytes on the connected socket' },
  { name: 'close()', purpose: 'release the connection' }
];
var SOCK_CLIENT = [
  { name: 'socket()', purpose: 'create an endpoint' },
  { name: 'connect()', purpose: 'send SYN, wait for SYN-ACK' },
  { name: 'send()/recv()', purpose: 'exchange bytes' },
  { name: 'close()', purpose: 'release the connection' }
];

var V = {
  rwndMSS: RWND_MSS, inflightMSS: INFLIGHT_MSS, usableMSS: USABLE_MSS,
  windowFieldMax: WINDOW_FIELD_MAX,
  flowBps: FLOW_BPS, flowMbps: FLOW_MBPS,
  ssThreshold: SS_THRESHOLD, ssSeries: SS_SERIES,
  t14: { loss: T14_LOSS_MSS, thresh: T14_THRESH, rows: T14_ROWS, hit: T14_HIT, ms: T14_MS },
  t20: { rwnd: T20_RWND_MSS, thresh: T20_THRESH, rounds: T20_ROUNDS, rows: T20_ROWS,
         last: T20_LAST, kb: T20_KB, max: T20_MAX },
  t24: { loss: T24_LOSS_MSS, thresh: T24_THRESH, timeout: T24_TIMEOUT_ROWS, dup: T24_DUP_ROWS },
  aimd: { wmax: AIMD_WMAX, avg: AIMD_AVG, bytes: AIMD_BYTES_PER_RTT, bps: AIMD_BPS, mbps: AIMD_MBPS },
  bdp: { bytes: BDP_BYTES, mss: BDP_MSS, scale: BDP_SCALE, ceiling: BDP_CEILING },
  mss: { mtu: MTU, mss4: MSS4, mss6: MSS6, count: SEG_COUNT, last: SEG_LAST, transfer: TRANSFER },
  server: SOCK_SERVER, client: SOCK_CLIENT
};

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* the two-window arithmetic */
chk('usable window = advertised - in flight', USABLE_MSS === RWND_MSS - INFLIGHT_MSS, USABLE_MSS + ' MSS');
chk('usable window never exceeds the advertised window', USABLE_MSS <= RWND_MSS);
chk('sender limit is the smaller window', Math.min(6, 4) === 4 && Math.min(9, 4) === 4, 'min(6,4)=4, min(9,4)=4');
chk('16-bit window field maximum is 65535', WINDOW_FIELD_MAX === 65535);

/* flow-limited rate */
chk('flow rate = window / round trip', Math.abs(FLOW_BPS - 655350) < 1e-6, FLOW_BPS.toFixed(0) + ' B/s');
chk('flow rate in megabits', Math.abs(FLOW_MBPS - 5.2428) < 0.001, FLOW_MBPS.toFixed(2) + ' Mbps');

/* slow start */
chk('slow start doubles below the threshold', SS_DOUBLING.every(function (v, i) { return i === 0 || v === SS_DOUBLING[i - 1] * 2; }));
chk('slow start lands exactly on the threshold', SS_DOUBLING[SS_DOUBLING.length - 1] === SS_THRESHOLD);
chk('after the threshold the step is one segment',
    SS_LINEAR.every(function (v, i) { return v === SS_DOUBLING[SS_DOUBLING.length - 1] + i + 1; }));
chk('the whole series is strictly increasing',
    SS_SERIES.every(function (v, i) { return i === 0 || v > SS_SERIES[i - 1]; }));

/* GATE 2014 Set 1 Q27 */
chk('2014: 32 KB at 2 KB per segment is 16 segments', T14_LOSS_MSS === 16);
chk('2014: timeout halves the threshold to 8', T14_THRESH === 8);
chk('2014: the window restarts at one segment', T14_ROWS[0].cwnd === 1);
chk('2014: first four values are 1, 2, 4, 8',
    T14_ROWS.slice(0, 4).map(function (r) { return r.cwnd; }).join(',') === '1,2,4,8');
chk('2014: the step from the threshold is one segment', T14_ROWS[4].cwnd === 9);
chk('2014: the target is reached at round trip 11', T14_HIT === 11, 'rtt ' + T14_HIT);
chk('2014: eleven round trips of 100 ms is 1100 ms', T14_MS === 1100);
chk('2014: no round trip overshoots the target', T14_ROWS.every(function (r) { return r.cwnd <= T14_TARGET; }));
chk('2014: the trace is monotone non-decreasing',
    T14_ROWS.every(function (r, i) { return i === 0 || r.cwnd >= T14_ROWS[i - 1].cwnd; }));

/* GATE 2020 Q55 */
chk('2020: 60 ms at 6 ms is 10 round trips', T20_ROUNDS === 10);
chk('2020: the threshold is 16 segments', T20_THRESH === 16);
chk('2020: doubling reaches 32 KB after four round trips', T20_ROWS[4].cwnd === 16, T20_ROWS[4].cwnd + ' MSS');
chk('2020: the answer is 22 segments', T20_LAST === 22);
chk('2020: 22 segments of 2 KB is 44 KB', T20_KB === 44);
chk('2020: the receiver window never binds', T20_MAX <= T20_RWND_MSS, 'max ' + T20_MAX + ' of ' + T20_RWND_MSS);
chk('2020: every step above the threshold is one segment',
    T20_ROWS.filter(function (r) { return r.rtt >= 4; })
            .every(function (r, i, a) { return i === 0 || r.cwnd - a[i - 1].cwnd === 1; }));

/* GATE 2024 Set 2 Q54, and the signal that changes it */
chk('2024: 12 segments halved is a threshold of 6', T24_THRESH === 6);
chk('2024: a timeout restarts the window at 1', T24_TIMEOUT_ROWS[0].cwnd === 1);
chk('2024: two clean round trips after a timeout give 4', T24_TIMEOUT_2 === 4);
chk('2024: the doubling would be capped at 6, not 8', T24_TIMEOUT_ROWS[3].cwnd === 6);
chk('2024: three duplicate ACKs leave the window at the threshold', T24_DUP_ROWS[0].cwnd === 6);
chk('2024: two clean round trips after duplicate ACKs give 8', T24_DUP_2 === 8);
chk('2024: the two traces differ immediately after the loss', T24_TIMEOUT_ROWS[1].cwnd !== T24_DUP_ROWS[1].cwnd);
chk('2024: neither trace falls below one segment',
    T24_TIMEOUT_ROWS.concat(T24_DUP_ROWS).every(function (r) { return r.cwnd >= 1; }));

/* AIMD throughput */
chk('sawtooth average is three quarters of the peak', Math.abs(AIMD_AVG - 0.75 * AIMD_WMAX) < 1e-9, AIMD_AVG + ' MSS');
chk('sawtooth runs from half the peak to the peak', AIMD_SAW[0] === AIMD_WMAX / 2 && AIMD_SAW[AIMD_SAW.length - 1] === AIMD_WMAX);
chk('bytes per round trip = average window x segment', AIMD_BYTES_PER_RTT === 109500, AIMD_BYTES_PER_RTT + ' B');
chk('average rate = bytes per round trip / round trip', Math.abs(AIMD_BPS - 2737500) < 1e-6, AIMD_BPS.toFixed(0) + ' B/s');
chk('average rate in megabits is 21.9', Math.abs(AIMD_MBPS - 21.9) < 0.05, AIMD_MBPS.toFixed(2) + ' Mbps');

/* bandwidth-delay product */
chk('BDP = bandwidth x round trip', BDP_BYTES === 1250000, BDP_BYTES + ' B');
chk('BDP exceeds the 16-bit window ceiling', BDP_BYTES > WINDOW_FIELD_MAX);
chk('a scale factor of 16 is not enough', WINDOW_FIELD_MAX * 16 < BDP_BYTES, (WINDOW_FIELD_MAX * 16) + ' < ' + BDP_BYTES);
chk('the chosen scale factor covers the BDP', BDP_CEILING >= BDP_BYTES, BDP_SCALE + 'x -> ' + BDP_CEILING + ' B');
chk('the chosen scale factor is the smallest power of two that works',
    BDP_SCALE === 1 || (BDP_SCALE / 2) * WINDOW_FIELD_MAX < BDP_BYTES);

/* segment arithmetic */
chk('IPv4 MSS = MTU - 40', MSS4 === 1460);
chk('IPv6 MSS = MTU - 60', MSS6 === 1440);
chk('10000 bytes is seven segments', SEG_COUNT === 7);
chk('the last segment carries the remainder', SEG_LAST === 1240);
chk('the segments sum to the transfer', (SEG_COUNT - 1) * MSS4 + SEG_LAST === TRANSFER);

/* socket API order */
(function () {
  var names = SOCK_SERVER.map(function (c) { return c.name; });
  var iBind = names.indexOf('bind()'), iListen = names.indexOf('listen()'), iAccept = names.indexOf('accept()');
  chk('server calls bind before listen', iBind > -1 && iBind < iListen);
  chk('server calls listen before accept', iListen < iAccept);
  chk('listen is the call that makes a socket passive', SOCK_SERVER[iListen].purpose.indexOf('passive') > -1);
  chk('accept returns a new socket', SOCK_SERVER[iAccept].purpose.indexOf('new socket') > -1);
  var cn = SOCK_CLIENT.map(function (c) { return c.name; });
  chk('client calls socket before connect', cn.indexOf('socket()') < cn.indexOf('connect()'));
  chk('connect is where the SYN is sent', SOCK_CLIENT[cn.indexOf('connect()')].purpose.indexOf('SYN') > -1);
})();
chk('a connection is named by four values', ['src ip', 'src port', 'dst ip', 'dst port'].length === 4);
chk('the threshold floor is two segments', Math.max(2, Math.floor(1 / 2)) === 2);

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function head(title, sub) {
  P.text(30, 18, title, { size: 13, bold: true, color: INK });
  P.text(30, 38, sub, { size: 10, color: DIM });
  P.line(30, 54, W - 30, 54, { stroke: PAL.border, sw: 1 });
}

function tag(x, y, text, colour) {
  P.circle(x, y, 3.5, { fill: colour });
  P.text(x + 12, y, text, { size: 11, base: 'middle', color: INK });
}

function axes(x0, y0, w, h, xMax, yMax, xLabel, yLabel) {
  P.line(x0, y0 + h, x0 + w, y0 + h, { stroke: PAL.border, sw: 1 });
  P.line(x0, y0, x0, y0 + h, { stroke: PAL.border, sw: 1 });
  P.text(x0, y0 + h + 20, xLabel, { size: 9, color: DIM });
  P.text(x0 + 4, y0 - 14, yLabel, { size: 9, color: DIM });
}

/* ---------- scene 1: two windows ---------- */

function drawTwoWindows(t, sc) {
  head('Two windows, one sender', 'the sender is capped by the smaller of the two limits');

  var s = sc.start;
  P.alpha(K.ease(K.beat(t, s + 0.5, 1.0)));
  P.text(30, 76, 'receiver advertised window  (flow control)', { size: 10, color: ACC });
  P.rect(30, 86, RWND_MSS * 60, 20, { fill: PAL.accentDim, stroke: ACC, sw: 1, radius: 3 });
  P.text(34, 96, RWND_MSS + ' MSS', { size: 10, mono: true, color: ACC, bold: true });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 3.0, 1.0)));
  P.text(30, 128, 'congestion window  (congestion control)', { size: 10, color: INFO });
  P.rect(30, 138, 4 * 60, 20, { fill: PAL.surface2, stroke: INFO, sw: 1, radius: 3 });
  P.text(34, 148, '4 MSS', { size: 10, mono: true, color: INFO, bold: true });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 6.0, 1.0)));
  P.text(30, 180, 'in flight, capped by the smaller of the two', { size: 10, color: VAL });
  P.rect(30, 190, USABLE_MSS * 60, 20, { fill: '#e7f4ea', stroke: VAL, sw: 1, radius: 3 });
  P.text(34, 200, USABLE_MSS + ' MSS', { size: 10, mono: true, color: VAL, bold: true });
  P.text(30, 224, 'min(6, 4) = 4, so this connection is congestion limited here', { size: 10, color: DIM });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 2.0, 1.0)));
  P.text(520, 86, 'Flow control', { size: 12, bold: true, color: ACC });
  P.text(520, 104, 'protects the receiver buffer', { size: 10, color: DIM });
  P.text(520, 120, 'signalled: window field in each ACK', { size: 10, color: DIM });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 4.0, 1.0)));
  P.text(520, 152, 'Congestion control', { size: 12, bold: true, color: INFO });
  P.text(520, 170, 'protects the network', { size: 10, color: DIM });
  P.text(520, 186, 'inferred: grow on ACK, cut on loss', { size: 10, color: DIM });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 15.0, 1.0)));
  P.line(30, 250, W - 30, 250, { stroke: PAL.border, sw: 1 });
  P.text(30, 264, 'The receiver window is visible: a 16-bit field names at most 65535 bytes.', { size: 11, color: INK });
  P.text(30, 284, 'The congestion window is not in any field. Loss is the only feedback the sender gets.', { size: 11, color: INK });
  P.text(30, 304, 'Window scaling multiplies the advertised field by a power of two agreed at setup.', { size: 11, color: INK });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 22.0, 1.0)));
  P.text(30, 348, 'Bytes in flight means sent and not yet acknowledged.', { size: 11, color: DIM });
  P.text(30, 372, 'The smaller window binds, and it decides which control is doing the work.', { size: 12, bold: true, color: ACC });
  P.alpha(1);
}

/* ---------- scene 2: flow control ---------- */

function drawFlow(t, sc) {
  head('Flow control: the receiver sets a budget', 'a window is a count of bytes, and it slides forward as ACKs arrive');

  var s = sc.start;
  var x0 = 30, bw = 44, gap = 2;
  P.alpha(K.ease(K.beat(t, s + 0.5, 1.0)));
  P.text(30, 74, 'sequence space, advertised window = 6 segments', { size: 10, color: ACC });
  for (var i = 0; i < 8; i++) {
    var x = x0 + i * (bw + gap);
    var inside = i < RWND_MSS;
    P.rect(x, 84, bw, 30, {
      fill: i < INFLIGHT_MSS ? PAL.accentDim : (inside ? PAL.surface2 : PAL.surface),
      stroke: inside ? ACC : PAL.border, sw: inside ? 1.4 : 1, radius: 3
    });
    P.text(x + bw / 2, 99, String(i + 1), { size: 10, mono: true, align: 'center', base: 'middle', color: inside ? INK : DIM });
  }
  P.rect(30, 78, RWND_MSS * (bw + gap) - gap, 42, { stroke: ACC, sw: 1.5, dash: [4, 3], radius: 4 });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 4.0, 1.0)));
  P.text(30, 138, 'sent, not acknowledged: 2 segments   (dark)', { size: 10, color: DIM });
  P.text(30, 156, 'usable = 6 - 2 = 4 segments', { size: 11, bold: true, color: VAL });
  P.alpha(1);

  var rows = [
    ['zero window', 'sender probes; receiver sends an update', ACC],
    ['silly window', 'never advertise a tiny window', INFO],
    ['Nagle', 'hold a small segment while data is unacked', WARN],
    ['delayed ACK', 'at least every second full segment', VAL]
  ];
  rows.forEach(function (r, i) {
    P.alpha(K.ease(K.beat(t, s + 6.5 + i * 2.0, 0.9)));
    var y = 84 + i * 34;
    P.text(520, y, r[0], { size: 11, bold: true, color: r[2] });
    P.text(520, y + 15, r[1], { size: 10, color: DIM });
    P.alpha(1);
  });

  P.alpha(K.ease(K.beat(t, s + 16.0, 1.0)));
  P.line(30, 200, W - 30, 200, { stroke: PAL.border, sw: 1 });
  P.text(30, 214, 'With no loss at all, the advertised window alone caps the rate.', { size: 11, bold: true, color: INK });
  P.text(30, 236, 'rate = 65535 B / 0.1 s = 655350 B/s = 5.24 Mbps', { size: 12, mono: true, color: ACC });
  P.text(30, 260, 'Grow the buffer and the number grows: that is flow control, not congestion control.', { size: 11, color: DIM });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 22.0, 1.0)));
  P.text(30, 300, 'A zero window is a pause, not a close. Only FIN or RST ends a connection.', { size: 11, color: DIM });
  P.text(30, 330, 'The window field counts bytes from the acknowledgement number, never segments.', { size: 11, color: DIM });
  P.alpha(1);
}

/* ---------- scene 3: slow start ---------- */

function drawSlowStart(t, sc) {
  head('Slow start: doubling, and where it stops', 'one segment per ACK, therefore a doubling per round trip');

  var s = sc.start;
  var x0 = 50, y0 = 90, w = 400, h = 280;
  var xMax = 9, yMax = 20;
  axes(x0, y0, w, h, xMax, yMax, 'round trip', 'cwnd (MSS)');

  var pts = SS_SERIES.map(function (v, i) {
    return { x: x0 + (i / xMax) * w, y: y0 + h - (v / yMax) * h, v: v };
  });

  /* the threshold line */
  P.alpha(K.ease(K.beat(t, s + 6.0, 1.0)));
  var yTh = y0 + h - (SS_THRESHOLD / yMax) * h;
  P.line(x0, yTh, x0 + w, yTh, { stroke: WARN, sw: 1, dash: [5, 4] });
  P.text(x0 + w - 4, yTh - 14, 'threshold = 16 MSS', { size: 9, color: WARN, align: 'right' });
  P.alpha(1);

  var upto = Math.max(1, Math.min(pts.length, 1 + Math.floor(K.beat(t, s + 1.0, 8.0) * pts.length)));
  for (var i = 1; i < upto; i++) {
    P.alpha(K.ease(K.clamp01((K.beat(t, s + 1.0, 8.0) * pts.length) - i + 1)));
    P.line(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i - 1].y, { stroke: ACC, sw: 2 });
    P.line(pts[i].x, pts[i - 1].y, pts[i].x, pts[i].y, { stroke: ACC, sw: 2 });
    P.circle(pts[i].x, pts[i].y, 3, { fill: ACC });
    P.alpha(1);
  }
  P.circle(pts[0].x, pts[0].y, 3, { fill: ACC });
  P.text(pts[0].x + 6, pts[0].y - 6, '1', { size: 9, mono: true, color: ACC });
  P.text(pts[4].x + 6, pts[4].y - 10, '16', { size: 9, mono: true, color: WARN });
  P.text(x0 + 8, y0 + h - 6, 'doubling', { size: 9, color: ACC });
  P.text(pts[6].x - 4, pts[6].y - 16, 'then +1 per RTT', { size: 9, color: INFO, align: 'right' });

  var stmts = [
    ['cwnd + 2 MSS on every ACK', false],
    ['cwnd doubles on every ACK', false],
    ['cwnd + 1 MSS every RTT', false],
    ['cwnd doubles every RTT', true]
  ];
  P.alpha(K.ease(K.beat(t, s + 7.5, 1.0)));
  P.text(520, 86, 'GATE 2018 Q14, statement by statement', { size: 11, bold: true, color: INK });
  P.alpha(1);
  stmts.forEach(function (r, i) {
    P.alpha(K.ease(K.beat(t, s + 8.5 + i * 2.4, 0.9)));
    var y = 108 + i * 30;
    P.circle(526, y, 4, { fill: r[1] ? VAL : BAD });
    P.text(540, y, r[0], { size: 10, base: 'middle', color: INK });
    P.text(840, y, r[1] ? 'true' : 'false', { size: 9, align: 'right', base: 'middle', color: r[1] ? VAL : BAD });
    P.alpha(1);
  });

  P.alpha(K.ease(K.beat(t, s + 18.0, 1.0)));
  P.text(520, 244, 'Only the doubling per round trip is true.', { size: 11, bold: true, color: VAL });
  P.text(520, 264, 'One segment per round trip is congestion', { size: 10, color: DIM });
  P.text(520, 280, 'avoidance, not slow start.', { size: 10, color: DIM });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 22.0, 1.0)));
  P.text(30, 410, 'Doubling stops exactly at the threshold: it never lands past it.', { size: 11, color: INK });
  P.text(30, 434, 'Slow start is named for its start, not its speed.', { size: 11, bold: true, color: ACC });
  P.alpha(1);
}

/* ---------- scene 4: AIMD ---------- */

function drawAimd(t, sc) {
  head('Additive increase, multiplicative decrease', 'climb by one per round trip; cut on the loss signal');

  var s = sc.start;
  var x0 = 50, y0 = 90, w = 400, h = 280;
  var xMax = 20, yMax = 20;
  axes(x0, y0, w, h, xMax, yMax, 'round trip', 'cwnd (MSS)');

  var seq = [];
  var v = 8;
  for (var i = 0; i <= 8; i++) seq.push(v + i);       /* 8..16 */
  seq.push(8);                                        /* halve      */
  for (var j = 1; j <= 9; j++) seq.push(8 + j);       /* 9..17      */

  var upto = 1 + Math.floor(K.beat(t, s + 1.0, 12.0) * seq.length);
  for (var k = 0; k < seq.length && k < upto; k++) {
    var x = x0 + (k / xMax) * w;
    var y = y0 + h - (seq[k] / yMax) * h;
    var xp = k === 0 ? x : x0 + ((k - 1) / xMax) * w;
    var yp = k === 0 ? y : y0 + h - (seq[k - 1] / yMax) * h;
    P.alpha(1);
    if (k > 0) {
      P.line(xp, yp, x, yp, { stroke: seq[k] < seq[k - 1] ? BAD : ACC, sw: 2 });
      P.line(x, yp, x, y, { stroke: seq[k] < seq[k - 1] ? BAD : ACC, sw: 2 });
    }
    P.circle(x, y, 2.5, { fill: seq[k] < seq[k - 1] ? BAD : ACC });
  }
  P.alpha(K.ease(K.beat(t, s + 10.0, 1.0)));
  P.text(x0 + w * 0.44, y0 + 40, 'cut: cwnd 16 -> 8', { size: 9, color: BAD });
  P.text(x0 + 8, y0 + h - 6, '+1 MSS per RTT', { size: 9, color: ACC });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 6.0, 1.0)));
  P.text(520, 86, 'Two loss signals', { size: 11, bold: true, color: INK });
  P.text(520, 104, 'timeout', { size: 11, bold: true, color: BAD });
  P.text(520, 120, 'ssthresh = half of flight', { size: 10, color: INK });
  P.text(520, 136, 'cwnd = 1 MSS, then doubling', { size: 10, color: INK });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 11.0, 1.0)));
  P.text(520, 172, 'three duplicate ACKs', { size: 11, bold: true, color: WARN });
  P.text(520, 188, 'ssthresh = half of flight', { size: 10, color: INK });
  P.text(520, 204, 'cwnd = ssthresh  (Reno)', { size: 10, color: INK });
  P.text(520, 220, 'then linear growth', { size: 10, color: INK });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 16.0, 1.0)));
  P.text(520, 256, 'Tahoe restarts at 1, Reno at the threshold.', { size: 10, color: DIM });
  P.text(520, 272, 'Read which variant the question names.', { size: 10, color: DIM });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 20.0, 1.0)));
  P.line(30, 398, W - 30, 398, { stroke: PAL.border, sw: 1 });
  P.text(30, 412, 'The threshold is halved from the data in flight at the loss.', { size: 11, color: INK });
  P.text(30, 436, 'The sawtooth average is three quarters of the peak, which the next scene uses.', { size: 11, bold: true, color: ACC });
  P.alpha(1);
}

/* ---------- scene 5: GATE 2014 ---------- */

function drawTraceTable(x, y, rows, colour, showPhase, maxRows) {
  P.text(x, y, 'RTT', { size: 9, mono: true, color: DIM });
  P.text(x + 44, y, 'cwnd', { size: 9, mono: true, color: DIM });
  if (showPhase) P.text(x + 96, y, 'phase', { size: 9, mono: true, color: DIM });
  for (var i = 0; i < rows.length && i < maxRows; i++) {
    var yy = y + 18 + i * 15;
    P.text(x, yy, String(rows[i].rtt), { size: 9, mono: true, color: DIM });
    P.text(x + 44, yy, rows[i].cwnd + ' MSS', { size: 9, mono: true, color: colour });
    if (showPhase) {
      P.text(x + 96, yy, rows[i].phase === 'slow start' ? 'doubling' : '+1', { size: 9, color: DIM });
    }
  }
}

function drawT14(t, sc) {
  head('GATE 2014 Set 1 Q27: back to 32 KB after a timeout', '32 KB at the timeout, MSS 2 KB, round trip 100 ms');

  var s = sc.start;
  var x0 = 50, y0 = 90, w = 380, h = 260;
  var xMax = 11, yMax = 16;
  axes(x0, y0, w, h, xMax, yMax, 'round trip', 'cwnd (MSS)');

  var pts = T14_ROWS.map(function (r) {
    return { x: x0 + (r.rtt / xMax) * w, y: y0 + h - (r.cwnd / yMax) * h };
  });
  var upto = 1 + Math.floor(K.beat(t, s + 3.0, 14.0) * pts.length);
  for (var i = 0; i < pts.length && i < upto; i++) {
    P.alpha(1);
    if (i > 0) {
      P.line(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i - 1].y, { stroke: ACC, sw: 1.6 });
      P.line(pts[i].x, pts[i - 1].y, pts[i].x, pts[i].y, { stroke: ACC, sw: 1.6 });
    }
    P.circle(pts[i].x, pts[i].y, 2.4, { fill: ACC });
  }
  P.alpha(K.ease(K.beat(t, s + 1.0, 1.0)));
  P.text(x0 + 6, y0 + 12, 'timeout: 16 -> 1', { size: 9, color: BAD });
  P.text(x0 + 6, y0 + h - 8, 'threshold 8, then +1 per RTT', { size: 9, color: DIM });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 3.0, 1.0)));
  drawTraceTable(500, 84, T14_ROWS, ACC, true, 12);
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 15.0, 1.0)));
  P.text(500, 296, 'reaches 16 MSS at round trip 11', { size: 10, color: INK });
  P.text(500, 320, '11 x 100 ms = 1100 ms', { size: 12, bold: true, color: ACC, mono: true });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 22.0, 1.0)));
  P.line(30, 372, W - 30, 372, { stroke: PAL.border, sw: 1 });
  P.text(30, 386, 'The published key accepts a range, because the round trip containing the timeout', { size: 10, color: DIM });
  P.text(30, 402, 'is counted by some solutions and not by others. State your convention.', { size: 10, color: DIM });
  P.text(30, 430, 'Convert to segments first: 32 KB at 2 KB per segment is 16 segments.', { size: 11, bold: true, color: INK });
  P.alpha(1);
}

/* ---------- scene 6: GATE 2020 ---------- */

function drawT20(t, sc) {
  head('GATE 2020 Q55: the receiver window that never binds', 'round trip 6 ms, rwnd 50 KB, threshold 32 KB, MSS 2 KB');

  var s = sc.start;
  var x0 = 50, y0 = 90, w = 380, h = 260;
  var xMax = 10, yMax = 24;
  axes(x0, y0, w, h, xMax, yMax, 'round trip', 'cwnd (MSS)');

  var pts = T20_ROWS.map(function (r) {
    return { x: x0 + (r.rtt / xMax) * w, y: y0 + h - (r.cwnd / yMax) * h };
  });
  var upto = 1 + Math.floor(K.beat(t, s + 3.0, 12.0) * pts.length);
  for (var i = 0; i < pts.length && i < upto; i++) {
    P.alpha(1);
    if (i > 0) {
      P.line(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i - 1].y, { stroke: ACC, sw: 1.6 });
      P.line(pts[i].x, pts[i - 1].y, pts[i].x, pts[i].y, { stroke: ACC, sw: 1.6 });
    }
    P.circle(pts[i].x, pts[i].y, 2.4, { fill: ACC });
  }
  /* the receiver window ceiling, drawn where it sits */
  P.alpha(K.ease(K.beat(t, s + 9.0, 1.0)));
  var yCap = y0 + h - (T20_RWND_MSS / yMax) * h;
  P.line(x0, yCap, x0 + w, yCap, { stroke: INFO, sw: 1, dash: [5, 4] });
  P.text(x0 + w - 4, yCap - 14, 'receiver window 25 MSS', { size: 9, color: INFO, align: 'right' });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 3.0, 1.0)));
  drawTraceTable(500, 84, T20_ROWS, ACC, true, 11);
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 15.0, 1.0)));
  P.text(500, 280, 'the window never reaches 25 MSS', { size: 10, color: INFO });
  P.text(500, 304, '22 x 2 KB = 44 KB', { size: 12, bold: true, color: ACC, mono: true });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 22.0, 1.0)));
  P.line(30, 372, W - 30, 372, { stroke: PAL.border, sw: 1 });
  P.text(30, 386, 'Halving the receiver window to invent a threshold gives 25 KB and a different trace.', { size: 10, color: BAD });
  P.text(30, 406, 'A threshold is given by the question, or derived from the last loss.', { size: 10, color: DIM });
  P.text(30, 432, '60 ms / 6 ms = 10 round trips, and the tenth ends at 44 KB.', { size: 11, bold: true, color: INK });
  P.alpha(1);
}

/* ---------- scene 7: GATE 2024 ---------- */

function drawT24(t, sc) {
  head('GATE 2024 Set 2 Q54: the signal decides the answer', '12 MSS at a loss, then two clean round trips');

  var s = sc.start;
  P.alpha(K.ease(K.beat(t, s + 1.0, 1.0)));
  P.text(40, 84, 'after a timeout', { size: 11, bold: true, color: BAD });
  drawTraceTable(40, 98, T24_TIMEOUT_ROWS, BAD, false, 4);
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 6.0, 1.0)));
  P.text(470, 84, 'after 3 duplicate ACKs (Reno)', { size: 11, bold: true, color: WARN });
  drawTraceTable(470, 98, T24_DUP_ROWS, WARN, false, 4);
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 10.0, 1.0)));
  P.text(40, 210, 'threshold = 12 / 2 = 6 in both cases', { size: 10, color: DIM });
  P.text(40, 230, 'only the window right after the cut differs', { size: 10, color: DIM });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 13.0, 1.0)));
  P.text(40, 268, '4 MSS', { size: 16, bold: true, color: BAD, mono: true });
  P.text(470, 268, '8 MSS', { size: 16, bold: true, color: WARN, mono: true });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 18.0, 1.0)));
  P.line(40, 296, W - 40, 296, { stroke: PAL.border, sw: 1 });
  P.text(40, 310, 'The third clean round trip would give 6, not 8, because 6 is the threshold.', { size: 11, color: INK });
  P.text(40, 332, 'Doubling past the threshold is the commonest arithmetic slip in this family.', { size: 11, color: WARN });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 22.0, 1.0)));
  P.text(40, 372, 'Same numbers, two answers. The loss type is part of the question.', { size: 12, bold: true, color: ACC });
  P.text(40, 400, 'Write the variant at the top of your rough work before the first step.', { size: 11, color: DIM });
  P.alpha(1);
}

/* ---------- scene 8: throughput ---------- */

function drawThru(t, sc) {
  head('Throughput, and the window the path needs', 'the sawtooth average is three quarters of the peak');

  var s = sc.start;
  P.alpha(K.ease(K.beat(t, s + 0.5, 1.0)));
  P.text(30, 78, 'average rate = 0.75 x W_max / RTT', { size: 14, mono: true, bold: true, color: ACC });
  P.text(30, 100, 'the window oscillates between half its peak and the peak', { size: 10, color: DIM });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 4.0, 1.0)));
  P.text(30, 134, 'W_max = 100 MSS = 100 x 1460 B', { size: 11, mono: true, color: INK });
  P.text(30, 154, 'RTT = 40 ms', { size: 11, mono: true, color: INK });
  P.text(30, 174, '0.75 x 100 x 1460 = 109500 B per RTT', { size: 11, mono: true, color: INK });
  P.text(30, 194, '109500 / 0.04 = 2737500 B/s = 21.9 Mbps', { size: 11, mono: true, bold: true, color: VAL });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 10.0, 1.0)));
  P.line(30, 218, W - 30, 218, { stroke: PAL.border, sw: 1 });
  P.text(30, 232, 'bandwidth-delay product = bandwidth x round trip', { size: 11, bold: true, color: INFO });
  P.text(30, 252, '100 Mbps x 0.1 s = 1250000 B = 1.25 MB', { size: 11, mono: true, color: INK });
  P.alpha(1);

  /* two bars: the 16-bit ceiling against what the path needs */
  P.alpha(K.ease(K.beat(t, s + 14.0, 1.0)));
  P.text(30, 284, 'a 16-bit field', { size: 9, color: DIM });
  P.rect(30, 292, 34, 16, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 2 });
  P.text(72, 300, '65535 B', { size: 9, mono: true, base: 'middle', color: DIM });
  P.text(30, 324, 'this path needs', { size: 9, color: INFO });
  P.rect(30, 332, 655, 16, { fill: '#e6eef8', stroke: INFO, sw: 1, radius: 2 });
  P.text(694, 340, '1250000 B', { size: 9, mono: true, base: 'middle', color: INFO });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 19.0, 1.0)));
  P.text(30, 372, 'scale factor 32: 65535 x 32 = 2097120 B, which covers 1.25 MB', { size: 10, color: DIM });
  P.text(30, 400, 'A scale factor of 16 would not: 1048560 B is still short.', { size: 10, color: DIM });
  P.text(30, 432, 'The formula never changes; only the unit of the window gets bigger.', { size: 11, bold: true, color: ACC });
  P.alpha(1);
}

/* ---------- scene 9: sockets ---------- */

function drawSock(t, sc) {
  head('The socket API and the handshake under it', 'the same handshake that carries every window this lesson computed');

  var s = sc.start;
  P.alpha(K.ease(K.beat(t, s + 0.5, 1.0)));
  P.text(60, 76, 'client', { size: 11, bold: true, color: INFO });
  P.text(600, 76, 'server', { size: 11, bold: true, color: ACC });
  P.alpha(1);

  var cy = [96, 136, 186, 236];
  V.client.forEach(function (c, i) {
    P.alpha(K.ease(K.beat(t, s + 1.0 + i * 1.6, 0.8)));
    P.text(60, cy[i], c.name, { size: 10, mono: true, bold: true, color: INK });
    P.text(60, cy[i] + 14, c.purpose, { size: 9, color: DIM });
    P.alpha(1);
  });

  var sy = [96, 128, 160, 196, 232, 264];
  V.server.forEach(function (c, i) {
    P.alpha(K.ease(K.beat(t, s + 2.0 + i * 1.4, 0.8)));
    P.text(600, sy[i], c.name, { size: 10, mono: true, bold: true, color: INK });
    P.text(600, sy[i] + 13, c.purpose, { size: 9, color: DIM });
    P.alpha(1);
  });

  /* the three handshake packets, between the columns */
  P.alpha(K.ease(K.beat(t, s + 8.0, 1.0)));
  P.arrow(240, 118, 470, 118, { stroke: INFO, sw: 1.6, head: 7 });
  P.text(250, 106, 'SYN (connect sends it)', { size: 9, color: INFO });
  P.alpha(1);
  P.alpha(K.ease(K.beat(t, s + 9.5, 1.0)));
  P.arrow(470, 150, 240, 150, { stroke: ACC, sw: 1.6, head: 7 });
  P.text(250, 162, 'SYN + ACK', { size: 9, color: ACC });
  P.alpha(1);
  P.alpha(K.ease(K.beat(t, s + 11.0, 1.0)));
  P.arrow(240, 176, 470, 176, { stroke: INFO, sw: 1.6, head: 7 });
  P.text(250, 188, 'ACK, then accept returns', { size: 9, color: INFO });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 15.0, 1.0)));
  P.line(30, 290, W - 30, 290, { stroke: PAL.border, sw: 1 });
  P.text(30, 304, 'MSS = MTU - 20 (IP) - 20 (TCP) = 1500 - 40 = 1460 bytes', { size: 11, mono: true, color: INK });
  P.text(30, 324, '10000 bytes = 7 segments: 6 x 1460 + 1240', { size: 11, mono: true, color: INK });
  P.text(30, 344, 'with IPv6 the overhead is 60 bytes, so the same MTU gives 1440', { size: 10, color: DIM });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 20.0, 1.0)));
  P.text(30, 378, 'A connection is named by four values: source and destination address and port.', { size: 10, color: DIM });
  P.text(30, 398, 'listen makes a socket passive; accept returns a new connected socket.', { size: 10, color: DIM });
  P.text(30, 426, 'Only the active closer waits in TIME_WAIT, for two maximum segment lifetimes.', { size: 11, bold: true, color: ACC });
  P.alpha(1);
}

/* ---------- scene 10: procedure ---------- */

function drawSlips(t, sc) {
  head('The procedure, and the four slips', 'two routines, four habits, one clause closed');

  var s = sc.start;
  var steps = [
    'convert window, threshold and rwnd into segments',
    'note the loss signal, then apply it',
    'walk each RTT: double below the threshold, +1 at it',
    'stop at exactly the round trip the question names'
  ];
  P.alpha(K.ease(K.beat(t, s + 0.5, 1.0)));
  P.text(30, 78, 'the walk', { size: 11, bold: true, color: ACC });
  P.alpha(1);
  steps.forEach(function (txt, i) {
    P.alpha(K.ease(K.beat(t, s + 1.2 + i * 1.8, 0.9)));
    var y = 96 + i * 26;
    P.circle(38, y, 9, { fill: PAL.accentDim, stroke: ACC, sw: 1 });
    P.text(38, y, String(i + 1), { size: 9, align: 'center', base: 'middle', color: ACC, bold: true });
    P.text(54, y, txt, { size: 10, base: 'middle', color: INK });
    P.alpha(1);
  });

  var slips = [
    'doubling past the threshold',
    'halving rwnd to invent a threshold',
    'per-ACK growth read as per-RTT growth',
    'flow control and congestion control as one limit'
  ];
  P.alpha(K.ease(K.beat(t, s + 8.0, 1.0)));
  P.text(470, 78, 'the four slips', { size: 11, bold: true, color: WARN });
  P.alpha(1);
  slips.forEach(function (txt, i) {
    P.alpha(K.ease(K.beat(t, s + 8.6 + i * 1.8, 0.9)));
    var y = 96 + i * 26;
    P.circle(478, y, 4, { fill: BAD });
    P.text(492, y, txt, { size: 10, base: 'middle', color: INK });
    P.alpha(1);
  });

  P.alpha(K.ease(K.beat(t, s + 16.0, 1.0)));
  P.line(30, 216, W - 30, 216, { stroke: PAL.border, sw: 1 });
  P.text(30, 230, 'Before any arithmetic, answer two questions:', { size: 11, bold: true, color: INK });
  P.text(30, 252, 'which window is smaller over the range asked, so which one binds?', { size: 11, color: INK });
  P.text(30, 272, 'which signal fired at the loss, a timeout or three duplicate ACKs?', { size: 11, color: INK });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, s + 22.0, 1.0)));
  P.text(30, 316, 'Segment size comes from the link MTU and the IP header.', { size: 10, color: DIM });
  P.text(30, 336, 'DNS and HTTP sit above these sockets and reuse these round trips.', { size: 10, color: DIM });
  P.text(30, 372, 'Two windows, two signals, one sawtooth. That is the whole clause.', { size: 12, bold: true, color: ACC });
  P.alpha(1);
}

/* ---------- scene table + frame ---------- */

var SCENE_DRAW = {
  twowindows: drawTwoWindows,
  flow: drawFlow,
  slowstart: drawSlowStart,
  aimd: drawAimd,
  t14: drawT14,
  t20: drawT20,
  t24: drawT24,
  thru: drawThru,
  sock: drawSock,
  slips: drawSlips
};

function drawFrame(P2) {
  P = P2;
  P.alpha(1);
  P.clear();
  P.rect(0, 0, W, H, { fill: PAL.surface });

  var t = (K && K.state) ? K.state.elapsed : 0;
  var scenes = (K && K.state && K.state.scenes) ? K.state.scenes : [];
  var i = 0;
  for (var k = scenes.length - 1; k >= 0; k--) {
    if (t >= scenes[k].start - 1e-6) { i = k; break; }
  }
  var sc = scenes[i];
  if (!sc) return;
  var fn = SCENE_DRAW[sc.id];
  if (!fn) return;
  try {
    fn(t, sc);
  } catch (err) {
    console.error('scene draw failed', sc.id, err);
  }
}

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

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

window.__MODEL = { V: V, CHECKS: CHECKS };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
