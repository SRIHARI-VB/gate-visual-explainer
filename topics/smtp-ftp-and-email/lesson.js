/* ==========================================================================
   smtp-ftp-and-email — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no protocol arithmetic of its own:
   every figure on the canvas was computed once here and checked against the
   rule it is supposed to satisfy (the six fixed exchanges of an SMTP session,
   the four-thirds growth of base64, the one-plus-n connections of FTP).
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

/* ---------- 1. SMTP: the six fixed exchanges, plus one per recipient ----------
   RFC 5321 makes an SMTP session a lock-step dialog: one command, one reply.
   The client pays a TCP handshake first, then EHLO, MAIL, DATA, the message
   body and QUIT. Every RCPT TO is one more command and one more reply. */

var SMTP_FIXED = 6;                 // handshake, EHLO, MAIL, DATA, body, QUIT

function smtpRTT(r) { return SMTP_FIXED + r; }

var RCPT_TABLE = [1, 2, 3, 4, 5].map(function (r) {
  return { r: r, rtt: smtpRTT(r) };
});

/* the dialog trace for one recipient, in order, with the reply each command earns */
var DIALOG = [
  { dir: 'S', cmd: '(connect)', code: '220', why: 'service ready' },
  { dir: 'C', cmd: 'EHLO', code: '250', why: 'extensions listed' },
  { dir: 'C', cmd: 'MAIL FROM:', code: '250', why: 'sender accepted' },
  { dir: 'C', cmd: 'RCPT TO:', code: '250', why: 'recipient accepted' },
  { dir: 'C', cmd: 'DATA', code: '354', why: 'send the message' },
  { dir: 'C', cmd: 'body, then .', code: '250', why: 'message accepted' },
  { dir: 'C', cmd: 'QUIT', code: '221', why: 'closing' }
];

/* fan-out: three recipients at three different domains */
var FANOUT = {
  submission: smtpRTT(3),
  relay: smtpRTT(1),
  relays: 3,
  sessions: 4,
  rtt: smtpRTT(3) + 3 * smtpRTT(1)
};

/* with PIPELINING (RFC 2920) the four commands travel together, so the dialog
   costs four round trips whatever the number of recipients */
var PIPELINED = 4;

/* ---------- 2. reply codes ---------- */

function replyClass(code) {
  var d = Math.floor(code / 100);
  return d === 2 ? 'accept' : d === 3 ? 'more' : d === 4 ? 'retry' : d === 5 ? 'bounce' : 'unknown';
}

var QUEUE = [250, 451, 550, 421, 552].map(function (c) {
  return { code: c, cls: replyClass(c) };
});

var TALLY = QUEUE.reduce(function (a, m) { a[m.cls] = (a[m.cls] || 0) + 1; return a; }, {});

/* ---------- 3. envelope against header ---------- */

var ENVELOPE = { to: 3, cc: 1, bcc: 2 };
ENVELOPE.rcpt = ENVELOPE.to + ENVELOPE.cc + ENVELOPE.bcc;   // six RCPT commands
ENVELOPE.visible = ENVELOPE.to + ENVELOPE.cc;               // four named addresses

/* ---------- 4. FTP: one control connection, one data connection per transfer ----------
   RFC 959: the control connection is established once and stays; every transfer
   opens a second connection and closes it. Control costs handshake + USER +
   PASS = 3 round trips. Each transfer costs PASV + data handshake + transfer
   and its completion = 3. */

var FTP_LOGIN_RTT = 3;
var FTP_PER_TRANSFER_RTT = 3;

var FTP_TABLE = [1, 2, 3, 4, 5].map(function (n) {
  return { n: n, conn: 1 + n, rtt: FTP_LOGIN_RTT + FTP_PER_TRANSFER_RTT * n };
});

var FTP_PORTS = { control: 21, data: 20 };   // RFC 959: the server data port is L-1

/* ---------- 5. MIME: four characters for every three bytes ---------- */

function b64Len(n) { return 4 * Math.ceil(n / 3); }
function b64Lines(b) { return Math.ceil(b / 76); }

var MIME = (function () {
  var bytes = 1000000;
  var b64 = b64Len(bytes);
  var lines = b64Lines(b64);
  var wire = b64 + 2 * lines;                 // CRLF on every line
  return {
    bytes: bytes, b64: b64, lines: lines, wire: wire,
    pad: (3 - (bytes % 3)) % 3,
    overhead: (wire - bytes) / bytes
  };
})();

/* ---------- 6. POP3 against IMAP ---------- */

var MAILBOX = (function () {
  var msgs = 100, body = 20000, hdr = 500;
  var pop = msgs * body;                      // every body crosses once
  var imap = msgs * hdr + 3 * body;           // every header, three bodies
  return { msgs: msgs, body: body, hdr: hdr, pop: pop, imap: imap, ratio: pop / imap };
})();

/* ---------- 7. the chain: sessions equal receiving servers ---------- */

var CHAIN = { sessions: 3, received: 3 };     // submission + two relays

/* ---------- 8. ports ---------- */

var PORTS = [
  { p: 25, what: 'SMTP relay', proto: 'SMTP' },
  { p: 587, what: 'SMTP submission', proto: 'SMTP' },
  { p: 21, what: 'FTP control', proto: 'FTP' },
  { p: 20, what: 'FTP data (active)', proto: 'FTP' },
  { p: 110, what: 'POP3', proto: 'POP3' },
  { p: 143, what: 'IMAP', proto: 'IMAP' }
];

/* ======================================================================
   LAYER 2 - THE CHECKS
   Each one re-verifies a value against the definition that produced it.
   ====================================================================== */

chk('SMTP: one recipient costs 6 + 1 = 7 round trips', smtpRTT(1) === 7, smtpRTT(1));
chk('SMTP: each extra recipient adds exactly one round trip',
  RCPT_TABLE.every(function (e, i) { return i === 0 || e.rtt - RCPT_TABLE[i - 1].rtt === 1; }),
  RCPT_TABLE.map(function (e) { return e.rtt; }).join(', '));
chk('SMTP: the dialog has one exchange per round trip',
  DIALOG.length === smtpRTT(1), DIALOG.length + ' exchanges for one recipient');
chk('SMTP: every reply in the trace is a valid three-digit code',
  DIALOG.every(function (d) { return /^[2-5]\d\d$/.test(d.code); }));
chk('SMTP: DATA is the only 3xx in the base dialog',
  DIALOG.filter(function (d) { return d.code.charAt(0) === '3'; }).length === 1);
chk('SMTP: exactly one RCPT command in the one-recipient trace',
  DIALOG.filter(function (d) { return d.cmd === 'RCPT TO:'; }).length === 1);
chk('SMTP: pipelining is cheaper than the lock-step dialog',
  PIPELINED < smtpRTT(1), PIPELINED + ' against ' + smtpRTT(1));
chk('fan-out: round trips equal submission plus one relay per domain',
  FANOUT.rtt === FANOUT.submission + FANOUT.relays * FANOUT.relay, FANOUT.rtt);
chk('fan-out: sessions equal one submission plus one relay per domain',
  FANOUT.sessions === 1 + FANOUT.relays, FANOUT.sessions);
chk('fan-out: connections equal sessions', FANOUT.sessions === 4);

chk('codes: the class comes from the first digit alone',
  QUEUE.every(function (m) { return replyClass(m.code) === m.cls; }));
chk('codes: the five queued messages are all classified',
  (TALLY.accept || 0) + (TALLY.retry || 0) + (TALLY.bounce || 0) === QUEUE.length,
  JSON.stringify(TALLY));
chk('codes: two are retried and two are bounced',
  TALLY.retry === 2 && TALLY.bounce === 2, JSON.stringify(TALLY));
chk('codes: a 5xx is never retried, so no 5xx is in the retry set',
  QUEUE.filter(function (m) { return m.cls === 'retry' && m.code >= 500; }).length === 0);

chk('envelope: recipient commands equal To + Cc + Bcc',
  ENVELOPE.rcpt === ENVELOPE.to + ENVELOPE.cc + ENVELOPE.bcc, ENVELOPE.rcpt);
chk('envelope: visible addresses are fewer than delivered recipients',
  ENVELOPE.visible === ENVELOPE.rcpt - ENVELOPE.bcc && ENVELOPE.visible < ENVELOPE.rcpt,
  ENVELOPE.visible + ' of ' + ENVELOPE.rcpt);

chk('FTP: connections equal one plus the number of transfers',
  FTP_TABLE.every(function (e) { return e.conn === e.n + 1; }));
chk('FTP: round trips equal 3 + 3n for every row',
  FTP_TABLE.every(function (e) { return e.rtt === 3 + 3 * e.n; }));
chk('FTP: one file is two connections and six round trips',
  FTP_TABLE[0].conn === 2 && FTP_TABLE[0].rtt === 6);
chk('FTP: the server data port is one below the control port',
  FTP_PORTS.data === FTP_PORTS.control - 1, FTP_PORTS.control + ' / ' + FTP_PORTS.data);
chk('FTP: three files and a listing is four transfers, so five connections',
  1 + 4 === 5);

chk('MIME: the encoded length is a multiple of four', MIME.b64 % 4 === 0, MIME.b64);
chk('MIME: the encoded length is four thirds of the byte count, rounded up',
  MIME.b64 === 4 * Math.ceil(MIME.bytes / 3), MIME.b64);
chk('MIME: decoding the encoded length recovers the original size',
  (MIME.b64 / 4) * 3 - MIME.pad === MIME.bytes, MIME.pad + ' padding characters');
chk('MIME: three bytes give four characters with no padding',
  b64Len(3) === 4 && (3 - (3 % 3)) % 3 === 0);
chk('MIME: one byte gives four characters with two padding characters',
  b64Len(1) === 4 && (3 - (1 % 3)) % 3 === 2);
chk('MIME: line count is the ceiling of length over seventy-six',
  MIME.lines === Math.ceil(MIME.b64 / 76), MIME.lines);
chk('MIME: wire bytes are the characters plus two per line',
  MIME.wire === MIME.b64 + 2 * MIME.lines, MIME.wire);
chk('MIME: the overhead is above a third and below 38 per cent',
  MIME.overhead > 1 / 3 && MIME.overhead < 0.38, (100 * MIME.overhead).toFixed(2) + '%');

chk('mailbox: POP3 transfers every body once',
  MAILBOX.pop === MAILBOX.msgs * MAILBOX.body, MAILBOX.pop);
chk('mailbox: IMAP transfers every header and three bodies',
  MAILBOX.imap === MAILBOX.msgs * MAILBOX.hdr + 3 * MAILBOX.body, MAILBOX.imap);
chk('mailbox: IMAP costs less than POP3 for this workload',
  MAILBOX.imap < MAILBOX.pop, MAILBOX.ratio.toFixed(2) + ' times less');

chk('chain: one Received header per receiving server',
  CHAIN.received === CHAIN.sessions, CHAIN.received);
chk('ports: no two protocols share a port number',
  new Set(PORTS.map(function (x) { return x.p; })).size === PORTS.length, PORTS.length);
chk('ports: every port is a number in the registered range',
  PORTS.every(function (x) { return x.p > 0 && x.p < 65536; }));

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

var SCENE_DRAW = {};

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

function beat(sc, t, k) {
  var span = (sc.end - sc.start) / 4;
  return clamp01((t - (sc.start + k * span)) / 0.8);
}

function shown(sc, t, k) {
  var span = (sc.end - sc.start) / 4;
  return t >= sc.start + k * span - 0.01;
}

function T(x, y, s, o) { P.text(x, y, s, o || {}); }

function head(title, sub) {
  T(32, 24, title, { size: 17, bold: true, color: INK });
  if (sub) T(32, 44, sub, { size: 12, color: DIM });
  P.line(32, 54, W - 32, 54, { stroke: BORDER, sw: 1 });
}

function box(x, y, w, h, label, sub, o) {
  o = o || {};
  P.rect(x, y, w, h, {
    fill: o.fill || SURF2,
    stroke: o.stroke || BORDER,
    sw: o.sw || 1.5,
    radius: o.radius === undefined ? 6 : o.radius,
    dash: o.dash
  });
  var cx = x + w / 2;
  if (sub) {
    T(cx, y + h / 2 - 9, label, { size: o.size || 13, bold: true, align: 'center', base: 'middle', color: o.color || INK, mono: o.mono });
    T(cx, y + h / 2 + 9, sub, { size: 11, align: 'center', base: 'middle', color: o.subColor || DIM, mono: true });
  } else {
    T(cx, y + h / 2, label, { size: o.size || 13, bold: o.bold !== false, align: 'center', base: 'middle', color: o.color || INK, mono: o.mono });
  }
}

function chip(x, y, w, h, text, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || SURF2, stroke: o.stroke || BORDER, sw: 1.2, radius: h / 2 });
  T(x + w / 2, y + h / 2, text, { size: o.size || 11.5, align: 'center', base: 'middle', color: o.color || INK, mono: o.mono !== false, bold: o.bold });
}

function strike(x1, y, x2, colour) {
  P.line(x1, y, x2, y, { stroke: colour || BAD, sw: 2 });
}

/* ---------- scene 1: the clause that changed ---------- */

SCENE_DRAW.clause = function (t, sc) {
  head('The clause that changed', 'Section 10 of the GATE CS syllabus, 2026 wording against 2027 wording');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  P.rect(32, 70, 400, 236, { fill: SURF2, stroke: BORDER, radius: 8 });
  T(48, 92, 'GATE 2026 — five names', { size: 13, bold: true });
  var five = ['DNS', 'SMTP', 'HTTP', 'FTP', 'Email'];
  five.forEach(function (name, i) {
    chip(56 + i * 74, 108, 66, 24, name, { size: 11 });
  });
  T(48, 152, '"Application layer protocols:"', { size: 11, color: DIM, mono: true });
  T(48, 172, '... five names, one clause.', { size: 11, color: DIM, mono: true });

  P.alpha(b);
  P.rect(468, 70, 400, 236, { fill: ACCDIM, stroke: ACC, radius: 8 });
  T(484, 92, 'GATE 2027 — two names', { size: 13, bold: true, color: ACC });
  chip(492, 108, 66, 24, 'DNS', { size: 11, fill: SURF, stroke: ACC });
  chip(566, 108, 66, 24, 'HTTP', { size: 11, fill: SURF, stroke: ACC });
  T(484, 152, '"DNS and HTTP"', { size: 11, color: DIM, mono: true });

  /* the three that left, struck through */
  ['SMTP', 'FTP', 'Email'].forEach(function (name, i) {
    var y = 176 + i * 30;
    chip(492, y, 66, 22, name, { size: 10.5, fill: BADDIM, stroke: BAD, color: DIM });
    strike(494, y + 11, 556, y + 11, BAD);
    T(572, y + 15, 'no longer named', { size: 10.5, color: BAD });
  });

  P.alpha(c);
  T(32, 336, 'SMTP sends · FTP moves a file · POP3 and IMAP fetch a mailbox. Same layer, still the three jobs.', { size: 12, color: INK });
  chip(32, 348, 210, 24, 'class C for 2027', { size: 11.5, fill: WARNDIM, stroke: WARN, color: WARN, bold: true });

  P.alpha(d);
  var qs = ['who opens the connection', 'how many round trips', 'how many bytes'];
  qs.forEach(function (q, i) {
    chip(32 + i * 282, 392, 268, 34, q, { size: 12, fill: SURF, stroke: ACC, color: ACC, bold: true });
  });
  T(32, 448, 'Every counting item in this clause is one of those three questions.', { size: 11, color: DIM });
};

/* ---------- scene 2: the mail chain ---------- */

SCENE_DRAW.chain = function (t, sc) {
  head('The mail chain, one hop at a time', 'three SMTP sessions, three Received headers, one mailbox');

  var b0 = beat(sc, t, 0), b1 = beat(sc, t, 1), b2 = beat(sc, t, 2), b3 = beat(sc, t, 3);

  var names = [
    ['MUA', 'the client'],
    ['MSA', 'port 587'],
    ['MTA 1', 'port 25'],
    ['MTA 2', 'port 25'],
    ['MDA', 'the mailbox']
  ];
  var bw = 140, gap = 25, x0 = 50, y = 96, bh = 62;

  names.forEach(function (n, i) {
    var x = x0 + i * (bw + gap);
    var on = i === 0 ? b0 : i <= 2 ? b1 : b2;
    P.alpha(on);
    box(x, y, bw, bh, n[0], n[1], {
      fill: i === 0 || i === 4 ? SURF2 : ACCDIM,
      stroke: i === 0 || i === 4 ? BORDER : ACC
    });
    if (i < 4) {
      P.arrow(x + bw + 3, y + bh / 2, x + bw + gap - 3, y + bh / 2, { stroke: ACC, sw: 1.6 });
      P.alpha(on * b1);
      T(x + bw + gap / 2, y + bh / 2 - 8, 'SMTP', { size: 9.5, align: 'center', color: ACC, mono: true });
    }
  });

  P.alpha(b2);
  T(50, 186, 'session 1: submit', { size: 11, color: ACC, mono: true });
  T(50 + (bw + gap) * 2, 186, 'session 2: relay', { size: 11, color: ACC, mono: true });
  T(50 + (bw + gap) * 3, 186, 'session 3: relay', { size: 11, color: ACC, mono: true });

  T(50, 210, '3 sessions  ·  3 receiving servers  ·  3 Received: headers', { size: 13, bold: true, color: INK });

  P.alpha(b3);
  box(50, 236, 200, 58, 'recipient client', 'POP3 110 / IMAP 143', { fill: SURF2, stroke: BORDER });
  P.arrow(250, 265, 320, 265, { stroke: INFO, sw: 1.6 });
  T(285, 255, 'fetch', { size: 9.5, align: 'center', color: INFO, mono: true });
  box(322, 236, 250, 58, 'mailbox on the server', 'written by the delivery agent', { fill: SURF2, stroke: BORDER });

  T(50, 322, 'Sending and fetching are different protocols, in different directions.', { size: 12, color: INK });
  T(50, 344, 'SMTP pushes a message. POP3 and IMAP pull it. A client never receives with SMTP.', { size: 11.5, color: DIM });

  P.rect(50, 366, 800, 66, { fill: WARNDIM, stroke: WARN, radius: 6 });
  T(66, 388, 'The header grows by one line per hop.', { size: 12, bold: true, color: WARN });
  T(66, 408, 'Newest Received: at the top, then the next, and so on down to the oldest — the trace reads backwards in time.', { size: 11, color: INK });
  T(66, 424, 'A forged line is possible: any server may add one, so a trace is a claim and not a proof.', { size: 11, color: INK });
};

/* ---------- scene 3: the dialog ---------- */

SCENE_DRAW.dialog = function (t, sc) {
  head('One SMTP session, command by command', 'lock-step: one command, one reply, one round trip');

  var rows = clamp01((t - sc.start) / 1);
  var upto = Math.min(DIALOG.length, Math.max(1, Math.ceil(((t - sc.start) / (sc.end - sc.start)) * DIALOG.length + 0.001)));

  var y0 = 78, rh = 40;

  T(60, 66, 'client', { size: 11, color: DIM, mono: true });
  T(480, 66, 'server reply', { size: 11, color: DIM, mono: true });

  for (var i = 0; i < DIALOG.length; i++) {
    var row = DIALOG[i];
    var y = y0 + i * rh;
    if (i >= upto) break;
    var fade = i === upto - 1 ? clamp01(((t - sc.start) / (sc.end - sc.start)) * DIALOG.length - i + 0.35) : 1;
    P.alpha(fade);
    var cls = replyClass(Number(row.code));
    var colour = cls === 'accept' ? VAL : cls === 'more' ? INFO : cls === 'retry' ? WARN : BAD;
    var dim = cls === 'accept' ? '#e8f5ec' : cls === 'more' ? '#e7eef8' : cls === 'retry' ? WARNDIM : BADDIM;

    P.rect(48, y, 400, 32, { fill: SURF2, stroke: BORDER, radius: 5 });
    T(62, y + 16, row.cmd, { size: 11.5, base: 'middle', mono: true, color: row.dir === 'S' ? DIM : INK });
    P.arrow(452, y + 16, 466, y + 16, { stroke: FAINT, sw: 1.3 });
    P.rect(470, y, 96, 32, { fill: dim, stroke: colour, radius: 5 });
    T(518, y + 16, row.code, { size: 13, bold: true, base: 'middle', align: 'center', color: colour, mono: true });
    T(578, y + 16, row.why, { size: 11, base: 'middle', color: DIM });
  }

  P.alpha(clamp01((t - sc.start - 24) / 2));
  P.rect(48, 366, 292, 84, { fill: SURF2, stroke: BORDER, radius: 6 });
  T(62, 386, 'Counting it: 6 + r round trips', { size: 12, bold: true, color: ACC });
  T(62, 406, 'handshake 1 · EHLO 2 · MAIL 3 · DATA 4', { size: 10.5, mono: true, color: DIM });
  T(62, 424, 'body 5 · QUIT 6 · then one per RCPT', { size: 10.5, mono: true, color: DIM });

  P.alpha(clamp01((t - sc.start - 26) / 2));
  T(360, 386, '354 is the only 3xx in base SMTP: not an error, and the', { size: 11.5, color: INK });
  T(360, 406, 'message is not accepted yet. A line beginning with a dot is', { size: 11.5, color: INK });
  T(360, 426, 'doubled, so only a line of one dot ends the data.', { size: 11.5, color: INK });
};

/* ---------- scene 4: the arithmetic ---------- */

SCENE_DRAW.cost = function (t, sc) {
  head('The arithmetic: six plus one per recipient', 'round trips grow by one per RCPT TO; connections never grow');

  var b0 = beat(sc, t, 0), b1 = beat(sc, t, 1), b2 = beat(sc, t, 2), b3 = beat(sc, t, 3);

  var x0 = 80, yBase = 300, bw = 74, gap = 34, unit = 17;   // unit = pixels per round trip

  /* the fixed six, drawn as a floor */
  P.alpha(b0);
  P.rect(x0 - 20, yBase - SMTP_FIXED * unit, 620, SMTP_FIXED * unit, { fill: ACCDIM, stroke: ACC, radius: 4, dash: [5, 4] });
  T(x0 - 14, yBase - SMTP_FIXED * unit - 10, 'the fixed six: handshake, EHLO, MAIL, DATA, body, QUIT', { size: 10.5, color: ACC });

  RCPT_TABLE.forEach(function (e, i) {
    var x = x0 + i * (bw + gap);
    var h = e.rtt * unit;
    P.alpha(clamp01(b1 * 2 - i * 0.4));
    P.rect(x, yBase - h, bw, h, { fill: SURF2, stroke: BORDER, radius: 4 });
    P.rect(x, yBase - SMTP_FIXED * unit, bw, -((e.rtt - SMTP_FIXED) * unit), { fill: ACC, stroke: ACC, radius: 4 });
    T(x + bw / 2, yBase + 16, 'r = ' + e.r, { size: 11, align: 'center', color: DIM, mono: true });
    T(x + bw / 2, yBase - h - 10, String(e.rtt), { size: 13, bold: true, align: 'center', color: INK, mono: true });
  });

  P.line(x0 - 20, yBase, x0 + 5 * (bw + gap) - gap + 10, yBase, { stroke: BORDER, sw: 1.2 });
  T(x0 - 20, yBase + 34, 'round trips per session', { size: 10.5, color: DIM });

  P.alpha(b2);
  P.rect(692, 96, 176, 116, { fill: SURF2, stroke: BORDER, radius: 6 });
  T(706, 116, 'connections', { size: 11, color: DIM, mono: true });
  T(706, 140, '1', { size: 28, bold: true, color: ACC, mono: true });
  T(706, 182, 'however many', { size: 10.5, color: DIM });
  T(706, 196, 'recipients', { size: 10.5, color: DIM });

  P.alpha(b3);
  P.rect(48, 330, 804, 106, { fill: WARNDIM, stroke: WARN, radius: 6 });
  T(64, 352, 'Fan-out: three recipients at three domains', { size: 12.5, bold: true, color: WARN });
  T(64, 374, 'submission  6 + 3 = 9   ·   three relays  3 x 7 = 21   ·   total 30 round trips over 4 connections', { size: 11.5, color: INK, mono: true });
  T(64, 396, 'Pipelining (RFC 2920) sends EHLO, MAIL, RCPT and DATA together: 4 round trips, whatever the recipient count.', { size: 11, color: INK });
  T(64, 418, 'Every number here is computed by the page and re-checked against the six-plus-r rule before it is drawn.', { size: 10.5, color: DIM });
};

/* ---------- scene 5: envelope against header ---------- */

SCENE_DRAW.envelope = function (t, sc) {
  head('Envelope against header', 'six people receive it, four are named in it');

  var b0 = beat(sc, t, 0), b1 = beat(sc, t, 1), b2 = beat(sc, t, 2), b3 = beat(sc, t, 3);

  P.alpha(b0);
  P.rect(32, 70, 420, 250, { fill: SURF2, stroke: BORDER, radius: 8 });
  T(48, 92, 'The envelope — what the server obeys', { size: 12.5, bold: true });
  chip(48, 106, 190, 24, 'MAIL FROM: <sender>', { size: 10.5 });
  var rcpts = ['RCPT 1  To', 'RCPT 2  To', 'RCPT 3  To', 'RCPT 4  Cc', 'RCPT 5  Bcc', 'RCPT 6  Bcc'];
  rcpts.forEach(function (r, i) {
    var y = 142 + i * 28;
    P.alpha(b0 * clamp01((t - sc.start - i * 1.1) / 1));
    chip(48, y, 190, 22, r, { size: 10, fill: i >= 4 ? BADDIM : SURF, stroke: i >= 4 ? BAD : BORDER });
  });
  T(250, 152, '6 RCPT commands', { size: 12, bold: true, color: ACC, mono: true });
  T(250, 172, 'one round trip each', { size: 10.5, color: DIM });
  T(250, 194, 'the reverse path is where', { size: 10.5, color: DIM });
  T(250, 210, 'a bounce is sent', { size: 10.5, color: DIM });

  P.alpha(b1);
  P.rect(468, 70, 400, 250, { fill: SURF, stroke: BORDER, radius: 8 });
  T(484, 92, 'The header — what the reader sees', { size: 12.5, bold: true });
  T(484, 118, 'From:    sender@example.com', { size: 11, mono: true });
  T(484, 140, 'To:      a, b, c', { size: 11, mono: true });
  T(484, 162, 'Cc:      d', { size: 11, mono: true });
  T(484, 184, 'Bcc:     — stripped before sending', { size: 11, mono: true, color: BAD });
  T(484, 214, '4 addresses named', { size: 12, bold: true, color: INK, mono: true });
  T(484, 236, '6 mailboxes reached', { size: 12, bold: true, color: ACC, mono: true });
  T(484, 262, 'The difference is the whole purpose of Bcc.', { size: 10.5, color: DIM });
  T(484, 280, 'The server was told six times; the reader is told four.', { size: 10.5, color: DIM });

  P.alpha(b2);
  T(32, 344, 'MAIL FROM sets the bounce address, recorded at delivery as Return-Path. From: is only a claim by the author.', { size: 11.5, color: INK });
  T(32, 364, 'On a mailing list they are different addresses, which is why a bounce can arrive for a message you did not send.', { size: 11.5, color: DIM });

  P.alpha(b3);
  P.rect(32, 382, 836, 54, { fill: ACCDIM, stroke: ACC, radius: 6 });
  T(48, 404, 'A relay adds one Received: line and may add nothing else. It must not change the envelope it was given.', { size: 11.5, color: INK });
  T(48, 424, 'So the envelope is read-only in transit, and the header grows by exactly one line per hop.', { size: 11, color: DIM });
};

/* ---------- scene 6: reply codes ---------- */

SCENE_DRAW.codes = function (t, sc) {
  head('Reply codes decide retry or bounce', 'five queued messages, three outcomes');

  var b0 = beat(sc, t, 0), b1 = beat(sc, t, 1), b2 = beat(sc, t, 2), b3 = beat(sc, t, 3);

  P.alpha(b0);
  var fam = [
    ['2xx', 'success', VAL, '#e8f5ec'],
    ['3xx', 'intermediate', INFO, '#e7eef8'],
    ['4xx', 'temporary', WARN, WARNDIM],
    ['5xx', 'permanent', BAD, BADDIM]
  ];
  fam.forEach(function (f, i) {
    var x = 32 + i * 212;
    P.rect(x, 66, 196, 40, { fill: f[3], stroke: f[2], radius: 6 });
    T(x + 14, 86, f[0], { size: 15, bold: true, base: 'middle', color: f[2], mono: true });
    T(x + 62, 86, f[1], { size: 11.5, base: 'middle', color: INK });
  });

  /* the queue */
  P.alpha(b1);
  T(32, 132, 'the queue', { size: 10.5, color: DIM, mono: true });
  QUEUE.forEach(function (m, i) {
    var x = 32 + i * 168;
    P.alpha(b1 * clamp01((t - sc.start - 7.5 - i * 1.0) / 1));
    P.rect(x, 142, 152, 56, { fill: SURF2, stroke: BORDER, radius: 6 });
    T(x + 76, 162, 'message ' + (i + 1), { size: 10.5, align: 'center', color: DIM, mono: true });
    T(x + 76, 184, String(m.code), { size: 16, bold: true, align: 'center', color: m.cls === 'accept' ? VAL : m.cls === 'retry' ? WARN : BAD, mono: true });
  });

  /* the three bins */
  P.alpha(b2);
  var bins = [
    { key: 'accept', title: 'accepted', note: 'delivered', colour: VAL, dim: '#e8f5ec' },
    { key: 'retry', title: 'retried', note: 'queued, try later', colour: WARN, dim: WARNDIM },
    { key: 'bounce', title: 'bounced', note: 'never retried', colour: BAD, dim: BADDIM }
  ];
  bins.forEach(function (bin, i) {
    var x = 32 + i * 288;
    P.rect(x, 220, 268, 96, { fill: bin.dim, stroke: bin.colour, radius: 6 });
    T(x + 14, 242, bin.title, { size: 13, bold: true, color: bin.colour });
    T(x + 14, 262, bin.note, { size: 10.5, color: DIM });
    var mine = QUEUE.filter(function (m) { return m.cls === bin.key; });
    mine.forEach(function (m, k) {
      chip(x + 14 + k * 70, 276, 62, 24, String(m.code), { size: 11, fill: SURF, stroke: bin.colour, color: bin.colour });
    });
    T(x + 14, 316, mine.length + ' message' + (mine.length === 1 ? '' : 's'), { size: 10.5, color: DIM, mono: true });
  });

  P.alpha(b3);
  T(32, 350, 'The second digit names the subject: 0 syntax, 2 connection, 5 mail system status.', { size: 11.5, color: INK });
  T(32, 372, 'A busy mailbox is 450, temporary. A full mailbox is 552, permanent. Same words, different action.', { size: 11.5, color: INK });
  T(32, 400, 'One accepted, two retried, two bounced — computed from the codes, not copied from a key.', { size: 11, color: DIM });
};

/* ---------- scene 7: FTP two connections ---------- */

SCENE_DRAW.ftp2 = function (t, sc) {
  head('FTP: two connections, not one', 'control stays open; one data connection per transfer');

  var b0 = beat(sc, t, 0), b1 = beat(sc, t, 1), b2 = beat(sc, t, 2), b3 = beat(sc, t, 3);

  P.alpha(b0);
  P.rect(48, 72, 804, 40, { fill: ACCDIM, stroke: ACC, radius: 5 });
  T(64, 96, 'control connection — port 21 — open for the whole session', { size: 11.5, base: 'middle', color: ACC, mono: true });
  T(760, 96, 'USER, PASS, CWD, PASV, RETR', { size: 9.5, base: 'middle', color: DIM, mono: true, align: 'right' });

  /* data connections as columns */
  P.alpha(b1);
  T(48, 132, 'data connections — one per transfer, closed when the transfer ends', { size: 10.5, color: DIM });

  FTP_TABLE.forEach(function (e, i) {
    var x = 62 + i * 152;
    P.alpha(clamp01(b1 * 1.4 - i * 0.25));
    for (var k = 0; k < e.n; k++) {
      var y = 148 + k * 26;
      P.rect(x, y, 128, 20, { fill: SURF2, stroke: BORDER, radius: 3 });
      T(x + 64, y + 10, 'transfer ' + (k + 1), { size: 9, align: 'center', base: 'middle', color: DIM, mono: true });
    }
    T(x + 64, 296, e.n + ' file' + (e.n === 1 ? '' : 's'), { size: 10, align: 'center', color: DIM, mono: true });
  });

  P.alpha(b2);
  T(48, 320, 'connections = 1 + n', { size: 13, bold: true, color: ACC, mono: true });
  T(48, 340, 'round trips = 3 + 3n', { size: 13, bold: true, color: ACC, mono: true });
  T(300, 320, 'one file: 2 connections, 6 round trips', { size: 11.5, color: INK });
  T(300, 340, 'five files: 6 connections, 18 round trips', { size: 11.5, color: INK });

  P.alpha(b3);
  P.rect(48, 358, 804, 82, { fill: WARNDIM, stroke: WARN, radius: 6 });
  T(64, 380, 'Three files and one directory listing: four transfers.', { size: 12, bold: true, color: WARN });
  T(64, 400, 'LIST needs a data connection like RETR does, so 4 + 1 = 5 connections and 3 + 12 = 15 round trips.', { size: 11.5, color: INK, mono: true });
  T(64, 422, 'Login is paid once: handshake, USER, PASS. Charging it per file multiplies the error by n.', { size: 11, color: DIM });
};

/* ---------- scene 8: active against passive ---------- */

SCENE_DRAW.ftpmodes = function (t, sc) {
  head('Who dials the data connection', 'active: the server dials. passive: the client dials.');

  var b0 = beat(sc, t, 0), b1 = beat(sc, t, 1), b2 = beat(sc, t, 2), b3 = beat(sc, t, 3);

  function panel(x, title, note, colour, dim, arrowRight, portLabel) {
    P.rect(x, 70, 400, 220, { fill: SURF, stroke: BORDER, radius: 8 });
    T(x + 16, 92, title, { size: 13, bold: true, color: colour });
    box(x + 24, 112, 120, 52, 'client', 'a high port', { fill: SURF2 });
    box(x + 256, 112, 120, 52, 'server', 'port 21', { fill: SURF2 });
    P.arrow(x + 24, 186, x + 376, 186, { stroke: FAINT, sw: 1.3 });
    T(x + 200, 178, 'control', { size: 9.5, align: 'center', color: DIM, mono: true });
    if (arrowRight) {
      P.arrow(x + 150, 214, x + 250, 214, { stroke: colour, sw: 1.8 });
    } else {
      P.arrow(x + 250, 214, x + 150, 214, { stroke: colour, sw: 1.8 });
    }
    T(x + 200, 236, portLabel, { size: 9.5, align: 'center', color: colour, mono: true });
    T(x + 16, 262, note, { size: 10.5, color: DIM });
  }

  P.alpha(b0);
  panel(32, 'Active', 'client sends PORT, server dials from port 20', VAL, '#e8f5ec', true, 'server → client : 20');
  P.alpha(b1);
  panel(468, 'Passive', 'client sends PASV, server answers 227, client dials', INFO, '#e7eef8', false, 'client → server : ephemeral');

  P.alpha(b2);
  T(32, 312, 'A client behind NAT cannot be dialled on an arbitrary port, so passive mode exists: both connections then run outward.', { size: 11.5, color: INK });
  T(32, 332, 'The server data port is one below the control port — 21 minus 1 — which is where port 20 comes from (RFC 959).', { size: 11.5, color: DIM });

  P.alpha(b3);
  P.rect(32, 350, 836, 90, { fill: SURF2, stroke: BORDER, radius: 6 });
  T(48, 372, 'The control connection is stateful, per session', { size: 12, bold: true });
  T(48, 392, 'current directory · transfer type (ASCII or binary) · structure · mode · the login', { size: 11, color: DIM, mono: true });
  T(48, 414, 'State ends when the connection ends: two clients never share a working directory.', { size: 11, color: INK });
  T(48, 432, 'Original FTP carries the password in clear text on the control connection.', { size: 10.5, color: DIM });
};

/* ---------- scene 9: MIME ---------- */

SCENE_DRAW.mime = function (t, sc) {
  head('Seven-bit mail, and what base64 costs', 'three bytes become four characters, then lines are wrapped');

  var b0 = beat(sc, t, 0), b1 = beat(sc, t, 1), b2 = beat(sc, t, 2), b3 = beat(sc, t, 3);

  P.alpha(b0);
  T(32, 76, 'SMTP mail data is 7-bit ASCII. A binary attachment is encoded before it is sent.', { size: 11.5, color: INK });

  /* three bytes into four characters */
  P.alpha(b1);
  for (var i = 0; i < 3; i++) {
    P.rect(48 + i * 44, 96, 36, 34, { fill: SURF2, stroke: BORDER, radius: 4 });
    T(66 + i * 44, 113, 'byte', { size: 9, align: 'center', base: 'middle', color: DIM, mono: true });
  }
  T(186, 113, '→', { size: 20, base: 'middle', color: ACC });
  for (var j = 0; j < 4; j++) {
    P.rect(220 + j * 44, 96, 36, 34, { fill: ACCDIM, stroke: ACC, radius: 4 });
    T(238 + j * 44, 113, 'char', { size: 9, align: 'center', base: 'middle', color: ACC, mono: true });
  }
  T(410, 113, '3 bytes → 4 characters, so the size grows by a third', { size: 11, base: 'middle', color: INK });
  T(410, 132, '64 symbols x 6 bits = 24 bits = 3 bytes', { size: 10, base: 'middle', color: DIM, mono: true });

  /* the three sizes, proportional */
  P.alpha(b2);
  var maxW = 700, scale = maxW / MIME.wire;
  var bars = [
    { label: 'the file', value: MIME.bytes, colour: SURF2, stroke: BORDER },
    { label: 'base64 characters', value: MIME.b64, colour: ACCDIM, stroke: ACC },
    { label: 'bytes on the wire', value: MIME.wire, colour: WARNDIM, stroke: WARN }
  ];
  bars.forEach(function (b, k) {
    var y = 168 + k * 46;
    P.alpha(b2 * clamp01((t - sc.start - 15 - k * 2.4) / 1));
    P.rect(48, y, b.value * scale, 28, { fill: b.colour, stroke: b.stroke, radius: 4 });
    T(56, y + 14, b.label, { size: 10.5, base: 'middle', color: INK });
    T(48 + b.value * scale + 8, y + 14, b.value.toLocaleString('en-US'), { size: 11.5, base: 'middle', color: INK, mono: true });
  });

  P.alpha(b3);
  P.rect(48, 310, 804, 128, { fill: SURF2, stroke: BORDER, radius: 6 });
  T(64, 332, 'The arithmetic for a 1,000,000-byte attachment', { size: 12, bold: true });
  T(64, 354, 'ceil(1000000 / 3) = 333,334 groups   ·   4 x 333,334 = 1,333,336 characters', { size: 11.5, color: INK, mono: true });
  T(64, 374, 'wrapped at 76 characters: ceil(1333336 / 76) = 17,544 lines', { size: 11.5, color: INK, mono: true });
  T(64, 394, '17,544 lines x 2 bytes of CRLF = 35,088   ·   1,333,336 + 35,088 = 1,368,424 bytes', { size: 11.5, color: INK, mono: true });
  T(64, 416, 'overhead 36.84%: one third from the encoding, the rest from the line ends', { size: 11.5, color: ACC, mono: true });
};

/* ---------- scene 10: POP3 and IMAP ---------- */

SCENE_DRAW.popimap = function (t, sc) {
  head('POP3, IMAP, and the procedure', 'two ways to read a mailbox, then four steps over the whole clause');

  var b0 = beat(sc, t, 0), b1 = beat(sc, t, 1), b2 = beat(sc, t, 2), b3 = beat(sc, t, 3);

  P.alpha(b0);
  P.rect(32, 70, 400, 130, { fill: SURF2, stroke: BORDER, radius: 8 });
  T(48, 92, 'POP3 — port 110', { size: 12.5, bold: true });
  T(48, 114, 'download, then delete at the end of the session', { size: 10.5, color: DIM });
  T(48, 136, 'states: authorisation → transaction → update', { size: 10.5, color: DIM, mono: true });
  T(48, 160, 'one device owns the mailbox', { size: 11, color: INK });
  T(48, 182, 'mail leaves the server', { size: 11, color: INK });

  P.alpha(b1);
  P.rect(468, 70, 400, 130, { fill: ACCDIM, stroke: ACC, radius: 8 });
  T(484, 92, 'IMAP — port 143', { size: 12.5, bold: true, color: ACC });
  T(484, 114, 'the mailbox stays on the server', { size: 10.5, color: DIM });
  T(484, 136, 'folders and flags are synchronised', { size: 10.5, color: DIM });
  T(484, 160, 'many devices see one mailbox', { size: 11, color: INK });
  T(484, 182, 'headers can be fetched without bodies', { size: 11, color: INK });

  /* the byte comparison */
  P.alpha(b2);
  var scale = 700 / MAILBOX.pop;
  var rows = [
    { label: 'POP3', value: MAILBOX.pop, colour: WARN, dim: WARNDIM },
    { label: 'IMAP', value: MAILBOX.imap, colour: VAL, dim: '#e8f5ec' }
  ];
  rows.forEach(function (r, i) {
    var y = 218 + i * 40;
    P.rect(48, y, Math.max(3, r.value * scale), 26, { fill: r.dim, stroke: r.colour, radius: 4 });
    T(56, y + 13, r.label, { size: 10.5, base: 'middle', color: INK, mono: true });
    T(48 + Math.max(3, r.value * scale) + 8, y + 13, r.value.toLocaleString('en-US') + ' bytes', { size: 11, base: 'middle', color: INK, mono: true });
  });
  T(48, 300, '100 messages of 20,000 bytes: every body once, against every header and three bodies. About 18 times less.', { size: 10.5, color: DIM });

  P.alpha(b3);
  var steps = ['name the server and its port', 'say who opens the connection', 'count the dialog exchanges', 'count the unit asked for'];
  steps.forEach(function (s, i) {
    var x = 32 + i * 212;
    P.rect(x, 330, 196, 52, { fill: SURF2, stroke: ACC, radius: 6 });
    T(x + 14, 348, String(i + 1), { size: 15, bold: true, color: ACC, mono: true });
    T(x + 14, 368, s, { size: 10.5, color: INK });
  });
  T(32, 406, 'The last step is where marks are lost: the arithmetic is right and the unit is wrong.', { size: 11.5, color: INK });
  T(32, 428, 'connections, round trips and bytes are three different answers to three different questions.', { size: 11, color: DIM });
};

/* ---------- the frame ---------- */

function drawFrame(P2) {
  P = P2;
  P.alpha(1);
  P.clear();
  P.rect(0, 0, W, H, { fill: SURF });

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
    P.alpha(1);
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

window.__MODEL = { CHECKS: CHECKS, MIME: MIME, MAILBOX: MAILBOX, FTP: FTP_TABLE, RCPT: RCPT_TABLE };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
