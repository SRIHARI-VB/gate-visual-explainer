/* ==========================================================================
   socket-api-and-connection-lifecycle — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no socket arithmetic of its own: every
   figure on the canvas was computed once here and checked against the rule it
   is supposed to satisfy (the port-space partition, the four-tuple space, the
   one-plus-two-N socket identity, a tick-by-tick backlog simulation, and the
   port-occupancy product behind ephemeral port exhaustion).
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

/* ---------- 1. the port space ----------
   Sixteen bits, 0 to 65535, split by RFC 6335 into the system range, the user
   or registered range and the dynamic range. The three sizes must partition
   the space exactly; a boundary counted twice breaks the sum. */

var PORTS = (function () {
  var p = {
    total: 65536,
    ranges: [
      { name: 'well-known', lo: 0, hi: 1023 },
      { name: 'registered', lo: 1024, hi: 49151 },
      { name: 'dynamic', lo: 49152, hi: 65535 }
    ]
  };
  p.ranges.forEach(function (r) { r.size = r.hi - r.lo + 1; });
  p.sum = p.ranges.reduce(function (s, r) { return s + r.size; }, 0);
  p.sizes = p.ranges.map(function (r) { return r.size; });
  return p;
})();

/* ---------- 2. the ephemeral range and the two TIME_WAIT durations ----------
   Linux default ip_local_port_range is 32768 to 60999 inclusive, which is
   28232 ports. RFC 793 takes the maximum segment lifetime to be two minutes
   and keeps TIME-WAIT for twice that; Linux hard-codes 60 seconds. */

var EPH = (function () {
  var e = { lo: 32768, hi: 60999 };
  e.count = e.hi - e.lo + 1;
  e.specHold = 240;            /* 2 x MSL, with MSL = 120 s (RFC 793) */
  e.linuxHold = 60;            /* TCP_TIMEWAIT_LEN */
  e.rateLinux = Math.floor(e.count / e.linuxHold);
  e.rateSpec = Math.floor(e.count / e.specHold);
  e.usedAtRate = e.rateLinux * e.linuxHold;
  e.usedOneMore = (e.rateLinux + 1) * e.linuxHold;
  e.exact = e.count / e.linuxHold;
  return e;
})();

/* the two durations, named so a caption cannot quote the wrong one */
var TW = { msl: 120, spec: 2 * 120, linux: 60 };

/* ---------- 3. the four-tuple space ----------
   Two addresses of 32 bits and two ports of 16 bits. With the server endpoint
   fixed, the free fields are the client address and the client port. */

var TUPLE = (function () {
  var t = {};
  t.addrBits = 32;
  t.portBits = 16;
  t.addrs = Math.pow(2, t.addrBits);
  t.ports = Math.pow(2, t.portBits);
  t.total = t.addrs * t.ports;                 /* 2^48 */
  t.perClient = EPH.count;                     /* one address, one endpoint */
  t.twoClients = 2 * EPH.count;
  t.log2 = Math.log(t.total) / Math.LN2;
  return t;
})();

/* ---------- 4. sockets in a running system ----------
   One listening socket, one connected socket per connection at the server,
   one socket per connection at the client. */

function socketsInSystem(n) { return 1 + 2 * n; }

var SOCKEX = [1, 5, 8, 100].map(function (n) {
  return { n: n, total: socketsInSystem(n), server: 1 + n, client: n };
});

/* ---------- 5. the handshake, in round trips ----------
   connect returns when the SYN-ACK arrives, at one round trip. The ACK is in
   flight then. accept returns when that ACK arrives, at one and a half. */

var HS = {
  connectAt: 1.0,
  acceptAt: 1.5,
  gap: 0.5,
  segments: [
    { name: 'SYN', from: 'client', sent: 0, arrives: 0.5 },
    { name: 'SYN-ACK', from: 'server', sent: 0.5, arrives: 1.0 },
    { name: 'ACK', from: 'client', sent: 1.0, arrives: 1.5 }
  ]
};

/* ---------- 6. the backlog, simulated ----------
   Six arrivals, a queue of two, two accepts. Every arrival is queued or
   dropped; every queued connection is accepted or still waiting. */

var BACKLOG = (function () {
  var arrivals = [0, 1, 2, 3, 4, 5];
  var accepts = [2.5, 4.5];
  var cap = 2;
  var q = [], dropped = 0, accepted = 0, trace = [];
  var events = arrivals.map(function (t, i) { return { t: t, kind: 'arrive', i: i }; })
    .concat(accepts.map(function (t) { return { t: t, kind: 'accept', i: -1 }; }));
  events.sort(function (a, b) {
    return a.t - b.t || (a.kind === 'arrive' ? -1 : 1);
  });
  events.forEach(function (e) {
    if (e.kind === 'arrive') {
      if (q.length < cap) {
        q.push(e.t);
        trace.push({ t: e.t, what: 'queued', depth: q.length, ok: true });
      } else {
        dropped++;
        trace.push({ t: e.t, what: 'dropped', depth: q.length, ok: false });
      }
    } else {
      if (q.length) {
        q.shift();
        accepted++;
        trace.push({ t: e.t, what: 'accepted', depth: q.length, ok: true });
      } else {
        trace.push({ t: e.t, what: 'idle', depth: 0, ok: true });
      }
    }
  });
  return {
    arrivals: arrivals, accepts: accepts, cap: cap, trace: trace,
    queued: accepted + q.length, accepted: accepted,
    waiting: q.length, dropped: dropped,
    totalArrivals: arrivals.length,
    identitiesHold: (accepted + q.length) + dropped === arrivals.length
  };
})();

/* ---------- 7. port occupancy against a connection rate ----------
   Ports in use is the rate multiplied by the seconds each port is held. */

var RATES = [100, 300, 470, 471].map(function (r) {
  var used = r * EPH.linuxHold;
  return { rate: r, used: used, fits: used <= EPH.count, over: Math.max(0, used - EPH.count) };
});

/* ---------- 8. the call sequences ---------- */

var CALLS = {
  server: [
    { call: 'socket()', does: 'returns an unbound descriptor' },
    { call: 'bind()', does: 'fixes the local address and port' },
    { call: 'listen()', does: 'marks the socket passive: state LISTEN' },
    { call: 'accept()', does: 'takes one completed connection off the queue' },
    { call: 'read() / write()', does: 'data on the new descriptor' },
    { call: 'close()', does: 'starts the teardown' }
  ],
  client: [
    { call: 'socket()', does: 'returns an unbound descriptor' },
    { call: 'connect()', does: 'binds an ephemeral port, sends the SYN' },
    { call: 'write() / read()', does: 'data on the connected descriptor' },
    { call: 'close()', does: 'starts the teardown' }
  ],
  udp: [
    { call: 'socket()', does: 'SOCK_DGRAM, one endpoint' },
    { call: 'bind()', does: 'optional: fixes the local port' },
    { call: 'sendto() / recvfrom()', does: 'the peer is named per datagram' },
    { call: 'close()', does: 'the port is free at once' }
  ]
};

/* ---------- 9. the two teardown paths ---------- */

var TEARDOWN = {
  active: ['ESTABLISHED', 'FIN-WAIT-1', 'FIN-WAIT-2', 'TIME-WAIT', 'CLOSED'],
  passive: ['ESTABLISHED', 'CLOSE-WAIT', 'LAST-ACK', 'CLOSED']
};

var V = {
  ports: PORTS, eph: EPH, tw: TW, tuple: TUPLE, sockex: SOCKEX,
  hs: HS, backlog: BACKLOG, rates: RATES, calls: CALLS, teardown: TEARDOWN,
  socketsInSystem: socketsInSystem
};

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* --- the port space --- */
chk('the three port ranges partition 65536 exactly', PORTS.sum === PORTS.total, PORTS.sum);
chk('the well-known range is 1024 ports', PORTS.sizes[0] === 1024, PORTS.sizes[0]);
chk('the registered range is 48128 ports', PORTS.sizes[1] === 48128, PORTS.sizes[1]);
chk('the dynamic range is 16384 ports', PORTS.sizes[2] === 16384, PORTS.sizes[2]);
chk('the ranges are contiguous with no gap or overlap',
  PORTS.ranges.every(function (r, i) {
    return i === 0 || r.lo === PORTS.ranges[i - 1].hi + 1;
  }));
chk('the last port is 65535', PORTS.ranges[2].hi === 65535);

/* --- the ephemeral range --- */
chk('the Linux default ephemeral range holds 28232 ports',
  EPH.count === 28232, EPH.count);
chk('28232 is 60999 + 1 - 32768', EPH.count === 60999 + 1 - 32768);
chk('the Linux default range starts inside the registered range and ends inside the dynamic one',
  EPH.lo >= 1024 && EPH.lo <= 49151 && EPH.hi >= 49152 && EPH.hi <= 65535,
  EPH.lo + '-' + EPH.hi);
chk('the Linux default range is not wholly inside the dynamic range',
  !(EPH.lo >= 49152), EPH.lo);
chk('the specification holds a port for 240 seconds', TW.spec === 2 * TW.msl, TW.spec);
chk('Linux holds a port for 60 seconds', TW.linux === 60, TW.linux);

/* --- the rate ceiling --- */
chk('28232 over 60 seconds gives 470 connections per second',
  EPH.rateLinux === 470, EPH.rateLinux);
chk('the ceiling is a floor, not a rounding: the exact quotient is 470.53',
  EPH.exact > 470 && EPH.exact < 471, EPH.exact.toFixed(2));
chk('470 connections a second use 28200 ports and fit',
  EPH.usedAtRate === 28200 && EPH.usedAtRate <= EPH.count, EPH.usedAtRate);
chk('471 connections a second use 28260 ports and do not fit',
  EPH.usedOneMore === 28260 && EPH.usedOneMore > EPH.count, EPH.usedOneMore);
chk('the same range against the specification duration gives 117 per second',
  EPH.rateSpec === 117, EPH.rateSpec);
chk('117 per second uses 28080 ports and 118 would use 28320',
  EPH.rateSpec * 240 === 28080 && (EPH.rateSpec + 1) * 240 === 28320);
chk('every rate in the table agrees with the product',
  RATES.every(function (r) { return r.used === r.rate * EPH.linuxHold; }));
chk('exactly one rate in the table exceeds the range',
  RATES.filter(function (r) { return !r.fits; }).length === 1);
chk('the failing rate overshoots by 28 ports', RATES[3].over === 28, RATES[3].over);
chk('the largest fitting rate is one less than the smallest failing rate',
  RATES[2].rate + 1 === RATES[3].rate);

/* --- the four-tuple --- */
chk('the four-tuple space for a fixed server endpoint is 2^48',
  TUPLE.total === Math.pow(2, 48), TUPLE.total);
chk('its logarithm base two is exactly 48', Math.abs(TUPLE.log2 - 48) < 1e-9, TUPLE.log2);
chk('the two addresses contribute 2^32 combinations', TUPLE.addrs === 4294967296);
chk('the two ports contribute 65536 combinations each side',
  TUPLE.ports === 65536 && Math.pow(TUPLE.ports, 1) === 65536);
chk('one client address against one endpoint admits 28232 connections',
  TUPLE.perClient === 28232, TUPLE.perClient);
chk('two client addresses double that, and the tuple space is far larger',
  TUPLE.twoClients === 56464 && TUPLE.total > TUPLE.twoClients * 1000);
chk('the tuple space is not 2^64', TUPLE.total !== Math.pow(2, 64));

/* --- sockets --- */
chk('one connection in the system is three sockets', socketsInSystem(1) === 3);
chk('eight connections in the system are seventeen sockets',
  socketsInSystem(8) === 17, socketsInSystem(8));
chk('a hundred connections are two hundred and one sockets',
  socketsInSystem(100) === 201, socketsInSystem(100));
chk('the identity is one listening plus N at the server plus N at the clients',
  SOCKEX.every(function (e) { return e.total === 1 + e.server + e.client - 1 + 0 || e.total === 1 + 2 * e.n; }));
chk('the server side holds one more socket than the number of connections',
  SOCKEX.every(function (e) { return e.server === e.n + 1; }));
chk('the system count is always odd', SOCKEX.every(function (e) { return e.total % 2 === 1; }));

/* --- the handshake --- */
chk('connect returns at one round trip', HS.connectAt === 1);
chk('accept returns at one and a half round trips', HS.acceptAt === 1.5);
chk('the gap between the two returns is half a round trip',
  Math.abs(HS.acceptAt - HS.connectAt - HS.gap) < 1e-9, HS.gap);
chk('the third segment is in flight when connect returns',
  HS.segments[2].sent === HS.connectAt && HS.segments[2].arrives > HS.connectAt);
chk('each segment takes half a round trip',
  HS.segments.every(function (s) { return Math.abs(s.arrives - s.sent - 0.5) < 1e-9; }));
chk('the segments are sent in order SYN, SYN-ACK, ACK',
  HS.segments.map(function (s) { return s.name; }).join(',') === 'SYN,SYN-ACK,ACK');
chk('the third segment is the only one sent by the client after the first',
  HS.segments[0].from === 'client' && HS.segments[1].from === 'server' &&
  HS.segments[2].from === 'client');

/* --- the backlog --- */
chk('the simulation admits six arrivals and two accepts',
  BACKLOG.totalArrivals === 6 && BACKLOG.accepts.length === 2);
chk('four of the six connections are queued', BACKLOG.queued === 4, BACKLOG.queued);
chk('two of the six are dropped', BACKLOG.dropped === 2, BACKLOG.dropped);
chk('two of the queued connections are accepted and two still wait',
  BACKLOG.accepted === 2 && BACKLOG.waiting === 2);
chk('queued equals accepted plus still waiting',
  BACKLOG.queued === BACKLOG.accepted + BACKLOG.waiting);
chk('arrivals equal queued plus dropped', BACKLOG.identitiesHold === true);
chk('the queue never holds more than its capacity of two',
  BACKLOG.trace.every(function (r) { return r.depth <= BACKLOG.cap; }));
chk('the first two arrivals fill the queue and the third is dropped',
  BACKLOG.trace[0].what === 'queued' && BACKLOG.trace[1].what === 'queued' &&
  BACKLOG.trace[2].what === 'dropped');
chk('each accept lowers the depth by one', (function () {
  var ok = true, prev = -1;
  BACKLOG.trace.forEach(function (r) {
    if (r.what === 'accepted') { if (!(r.depth === prev - 1)) ok = false; }
    prev = r.depth;
  });
  return ok;
})());

/* --- the calls --- */
chk('the server sequence is socket, bind, listen, accept',
  CALLS.server.slice(0, 4).map(function (c) { return c.call; }).join(',') ===
  'socket(),bind(),listen(),accept()');
chk('the client sequence has no bind and no listen',
  CALLS.client.every(function (c) { return c.call !== 'bind()' && c.call !== 'listen()'; }));
chk('connect is the client call that binds the ephemeral port',
  CALLS.client[1].call === 'connect()' && CALLS.client[1].does.indexOf('ephemeral') >= 0);
chk('the UDP sequence has no listen and no accept',
  CALLS.udp.every(function (c) { return c.call !== 'listen()' && c.call !== 'accept()'; }));
chk('the UDP sequence carries the peer per datagram',
  CALLS.udp[2].call.indexOf('sendto') >= 0);
chk('the server needs three setup calls before data', CALLS.server.length === 6 &&
  CALLS.server.filter(function (c) { return /listen|accept|bind/.test(c.call); }).length === 3);

/* --- the teardown --- */
chk('the active closer ends in TIME-WAIT', TEARDOWN.active.indexOf('TIME-WAIT') === 3);
chk('the passive closer passes through CLOSE-WAIT and LAST-ACK',
  TEARDOWN.passive[1] === 'CLOSE-WAIT' && TEARDOWN.passive[2] === 'LAST-ACK');
chk('only the active path contains TIME-WAIT',
  TEARDOWN.passive.indexOf('TIME-WAIT') < 0);
chk('both paths end in CLOSED',
  TEARDOWN.active[4] === 'CLOSED' &&
  TEARDOWN.passive[TEARDOWN.passive.length - 1] === 'CLOSED');

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function beat(t, sc, i) {
  var start = sc.start + i * 7.5;
  return K.clamp01((t - start) / 0.7);
}

function T(x, y, s, o) { P.text(x, y, s, o || {}); }

function box(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, {
    fill: o.fill === undefined ? SURF2 : o.fill,
    stroke: o.stroke === undefined ? BORDER : o.stroke,
    sw: o.sw || 1.2, radius: o.radius === undefined ? 6 : o.radius
  });
}

function arrow(x1, y1, x2, y2, colour) {
  P.arrow(x1, y1, x2, y2, { stroke: colour || BORDER, sw: 1.4, head: 8 });
}

function heading(s) { T(40, 20, s, { size: 13, bold: true }); }

function chip(x, y, w, h, s, o) {
  o = o || {};
  box(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, radius: 5 });
  T(x + w / 2, y + h / 2, s, { size: o.size || 10, mono: true, align: 'center', base: 'middle', color: o.color || INK });
}

function takeaway(y, line1, line2) {
  box(40, y, 820, 52, { fill: ACCDIM, stroke: ACC });
  T(54, y + 13, line1, { size: 11, bold: true, color: ACC });
  T(54, y + 33, line2, { size: 10, color: DIM });
}

/* ============================ scene 1 ============================ */

function drawEndpoints(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  heading('A socket is an endpoint, not a connection');

  P.alpha(b0);
  box(40, 48, 320, 86, { fill: SURF });
  T(54, 60, 'socket A — the client', { size: 11, bold: true });
  T(54, 80, '192.0.2.10:49152', { size: 13, mono: true });
  T(54, 102, 'address 192.0.2.10, port 49152', { size: 10, color: DIM });
  T(54, 118, 'the port was chosen by connect()', { size: 10, color: FAINT });

  P.alpha(b0);
  box(40, 148, 320, 86, { fill: SURF });
  T(54, 160, 'socket B — the server', { size: 11, bold: true });
  T(54, 180, '203.0.113.5:443', { size: 13, mono: true });
  T(54, 202, 'address 203.0.113.5, port 443', { size: 10, color: DIM });
  T(54, 218, 'the port was chosen by bind()', { size: 10, color: FAINT });

  P.alpha(b1);
  T(420, 52, 'One connection = four numbers', { size: 11, bold: true });
  var rows = [
    ['client address', '192.0.2.10'],
    ['client port', '49152'],
    ['server address', '203.0.113.5'],
    ['server port', '443']
  ];
  rows.forEach(function (r, i) {
    var y = 74 + i * 26;
    box(420, y, 420, 22, { fill: i < 2 ? SURF2 : SURF, stroke: BORDER, radius: 4 });
    T(432, y + 6, r[0], { size: 10, color: DIM });
    T(830, y + 6, r[1], { size: 10, mono: true, align: 'right' });
  });
  T(420, 188, 'the kernel demultiplexes on all four, not on the port alone',
    { size: 10, color: FAINT });

  P.alpha(b2);
  T(40, 268, 'The port space is 16 bits: 0 to 65535', { size: 11, bold: true });
  PORTS.ranges.forEach(function (r, i) {
    var y = 288 + i * 24;
    T(40, y, r.name, { size: 10 });
    T(170, y, r.lo + ' – ' + r.hi, { size: 10, mono: true, color: DIM });
    T(330, y, r.size + ' ports', { size: 10, mono: true, align: 'right' });
  });
  T(40, 360, 'sum', { size: 10, bold: true });
  T(330, 360, PORTS.sum + ' ports', { size: 10, mono: true, align: 'right', bold: true });

  P.alpha(b3);
  takeaway(378, 'A socket is a pair. A connection is a four-tuple.',
    'Name the unit before you compute: a socket question and a connection question have different answers.');
}

/* ============================ scene 2 ============================ */

function drawCalls(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  heading('The server makes five calls, the client two');

  T(40, 50, 'server', { size: 11, bold: true });
  T(500, 50, 'client', { size: 11, bold: true });

  CALLS.server.forEach(function (c, i) {
    var y = 66 + i * 30;
    var vis = i === 0 ? b0 : i < 3 ? b0 : b2;
    P.alpha(vis);
    box(40, y, 320, 26, { fill: i < 3 ? ACCDIM : SURF, stroke: i < 3 ? ACC : BORDER, radius: 4 });
    T(52, y + 8, (i + 1) + '.  ' + c.call, { size: 10, mono: true, bold: i < 3 });
    T(40, y + 30, '', { size: 1 });
    P.alpha(1);
  });

  CALLS.client.forEach(function (c, i) {
    var y = 66 + i * 30;
    var vis = i === 0 ? b0 : i < 2 ? b1 : b2;
    P.alpha(vis);
    box(500, y, 320, 26, { fill: i < 2 ? ACCDIM : SURF, stroke: i < 2 ? ACC : BORDER, radius: 4 });
    T(512, y + 8, (i + 1) + '.  ' + c.call, { size: 10, mono: true, bold: i < 2 });
    P.alpha(1);
  });

  P.alpha(b0);
  T(40, 262, 'socket() is the same call on both sides; bind() and listen() are not.',
    { size: 10, color: DIM });

  P.alpha(b2);
  T(40, 292, 'What each call changes in the kernel', { size: 11, bold: true });
  T(40, 314, 'bind    fixes the local address and port', { size: 10, mono: true });
  T(40, 336, 'listen  state becomes LISTEN; SYNs are answered', { size: 10, mono: true });
  T(40, 358, 'accept  one finished connection is taken off the queue', { size: 10, mono: true });
  T(500, 314, 'connect  picks an ephemeral port, sends the SYN', { size: 10, mono: true });
  T(500, 336, 'read/write  data on the connected descriptor', { size: 10, mono: true });

  P.alpha(b3);
  takeaway(384, 'The server has three setup calls; the client has one.',
    'Until listen() the port refuses; between listen() and accept() the handshake is finished by the kernel.');
}

/* ============================ scene 3 ============================ */

function drawAccept(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  heading('accept returns a new socket; the old one keeps listening');

  P.alpha(1);
  box(40, 52, 380, 214, { fill: SURF, stroke: BORDER });
  T(54, 62, 'server process', { size: 11, bold: true });

  P.alpha(b0);
  box(56, 84, 348, 66, { fill: SURF2 });
  T(68, 94, 'listening socket   fd 3', { size: 10, mono: true, bold: true });
  T(68, 112, 'local 203.0.113.5:443, no peer', { size: 10, color: DIM });
  T(68, 130, 'state LISTEN, accepts connections', { size: 10, color: FAINT });

  P.alpha(b1);
  box(56, 168, 348, 80, { fill: ACCDIM, stroke: ACC });
  T(68, 178, 'connected socket   fd 4', { size: 10, mono: true, bold: true, color: ACC });
  T(68, 196, 'local 203.0.113.5:443', { size: 10, color: DIM });
  T(68, 214, 'peer 192.0.2.10:49152', { size: 10, color: DIM });
  T(68, 232, 'state ESTABLISHED, carries data', { size: 10, color: FAINT });

  P.alpha(b1);
  box(560, 130, 300, 78, { fill: SURF, stroke: BORDER });
  T(572, 140, 'client', { size: 11, bold: true });
  T(572, 160, 'socket 192.0.2.10:49152', { size: 10, mono: true });
  T(572, 180, 'one socket, one connection', { size: 10, color: DIM });
  arrow(404, 208, 558, 176, ACC);

  P.alpha(b2);
  T(470, 72, 'Two sockets, one local port 443', { size: 11, bold: true });
  T(470, 94, 'they differ by their peer, the other', { size: 10, color: DIM });
  T(470, 112, 'half of the four-tuple', { size: 10, color: DIM });

  P.alpha(b2);
  T(40, 292, 'Sockets in the whole system = 1 + 2N', { size: 11, bold: true });
  SOCKEX.forEach(function (e, i) {
    T(40, 306 + i * 20, 'N = ' + e.n, { size: 10, mono: true });
    T(150, 306 + i * 20, 'server ' + e.server + ' + client ' + e.client + ' = ' + e.total,
      { size: 10, mono: true, color: DIM });
  });

  P.alpha(b3);
  takeaway(384, 'Every accept returns a fresh descriptor; the listener stays in LISTEN.',
    'The server scales by descriptors and memory, never by port numbers: one port serves every client.');
}

/* ============================ scene 4 ============================ */

function drawHandshake(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  heading('The handshake happens inside connect and accept');

  var cx = 170, sx = 730;
  P.alpha(1);
  T(cx, 46, 'client', { size: 11, bold: true, align: 'center' });
  T(sx, 46, 'server', { size: 11, bold: true, align: 'center' });
  P.line(cx, 64, cx, 292, { stroke: BORDER, sw: 1.2 });
  P.line(sx, 64, sx, 292, { stroke: BORDER, sw: 1.2 });

  var ticks = [0, 0.5, 1.0, 1.5];
  ticks.forEach(function (v, i) {
    var y = 64 + i * 70;
    T(70, y - 5, v.toFixed(1), { size: 9, mono: true, color: FAINT });
    T(70, y + 7, 'RTT', { size: 8, color: FAINT });
  });

  P.alpha(b0);
  arrow(cx, 64, sx, 134, INFO);
  T(450, 88, 'SYN', { size: 11, mono: true, bold: true, align: 'center', color: INFO });

  P.alpha(b0);
  arrow(sx, 134, cx, 204, INFO);
  T(450, 158, 'SYN-ACK', { size: 11, mono: true, bold: true, align: 'center', color: INFO });

  P.alpha(b1);
  arrow(cx, 204, sx, 274, INFO);
  T(450, 228, 'ACK', { size: 11, mono: true, bold: true, align: 'center', color: INFO });

  P.alpha(b1);
  P.circle(cx, 204, 5, { fill: ACC });
  T(cx + 14, 194, 'connect() returns at 1.0 RTT', { size: 10, color: ACC });

  P.alpha(b2);
  P.circle(sx, 274, 5, { fill: VAL });
  T(sx - 14, 286, 'accept() returns at 1.5 RTT', { size: 10, color: VAL, align: 'right' });

  P.alpha(b3);
  T(40, 316, 'states, in order', { size: 11, bold: true });
  chip(40, 334, 118, 26, 'SYN-SENT', { fill: SURF2 });
  arrow(162, 347, 190, 347, BORDER);
  chip(194, 334, 132, 26, 'ESTABLISHED', { fill: ACCDIM, stroke: ACC, color: ACC });
  chip(500, 334, 100, 26, 'LISTEN', { fill: SURF2 });
  arrow(604, 347, 630, 347, BORDER);
  chip(634, 334, 118, 26, 'SYN-RCVD', { fill: WARNDIM, stroke: WARN, color: WARN });
  arrow(756, 347, 780, 347, BORDER);
  chip(784, 334, 76, 26, 'ESTAB', { fill: ACCDIM, stroke: ACC, color: ACC });

  T(40, 376, 'The final ACK is in flight when connect returns, so the client can write',
    { size: 10, color: DIM });
  T(40, 394, 'half a round trip before the server has the connection.', { size: 10, color: DIM });

  P.alpha(b3);
  takeaway(408, 'connect returns at one round trip; accept returns at one and a half.',
    'The half round trip between them is the third segment travelling to the server.');
}

/* ============================ scene 5 ============================ */

function drawBacklog(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  heading('listen(fd, n): the queue behind accept');

  P.alpha(b0);
  T(40, 52, 'accept queue, capacity n = 2', { size: 11, bold: true });
  [0, 1].forEach(function (i) {
    chip(40 + i * 96, 74, 84, 40, i === 0 ? 'conn 1' : 'conn 2', { fill: SURF2, size: 9 });
  });
  T(40, 128, 'listen(fd, 2) lets two completed connections', { size: 10, color: DIM });
  T(40, 146, 'wait at once; the third is dropped.', { size: 10, color: DIM });
  T(40, 172, 'Linux also caps the value at somaxconn.', { size: 10, color: FAINT });

  P.alpha(b1);
  T(300, 52, 'the trace: 6 arrivals, accepts at 2.5 s and 4.5 s', { size: 11, bold: true });
  BACKLOG.trace.forEach(function (r, i) {
    var y = 76 + i * 26;
    var colour = r.what === 'dropped' ? BAD : r.what === 'accepted' ? VAL : INK;
    T(300, y, 't = ' + r.t.toFixed(1) + ' s', { size: 10, mono: true, color: DIM });
    T(392, y, r.what, { size: 10, mono: true, color: colour });
    T(500, y, 'queue ' + r.depth, { size: 10, mono: true, color: FAINT });
  });

  P.alpha(b2);
  T(40, 214, 'queued ' + BACKLOG.queued + '  =  accepted ' + BACKLOG.accepted +
    '  +  waiting ' + BACKLOG.waiting, { size: 11, mono: true, color: ACC });
  T(40, 238, 'arrivals ' + BACKLOG.totalArrivals + '  =  queued ' + BACKLOG.queued +
    '  +  dropped ' + BACKLOG.dropped, { size: 11, mono: true, color: ACC });

  P.alpha(b3);
  box(40, 266, 400, 74, { fill: SURF });
  T(54, 276, 'half-open queue (SYN queue)', { size: 10, bold: true });
  T(54, 296, 'connections that have sent SYN-ACK and', { size: 10, color: DIM });
  T(54, 314, 'not yet the final ACK', { size: 10, color: DIM });
  box(460, 266, 400, 74, { fill: SURF });
  T(474, 276, 'completed queue (accept queue)', { size: 10, bold: true });
  T(474, 296, 'connections that are established and', { size: 10, color: DIM });
  T(474, 314, 'waiting for an accept() call', { size: 10, color: DIM });

  P.alpha(b3);
  T(40, 360, 'A SYN flood fills the first queue; a slow accept loop fills the second.',
    { size: 10, color: DIM });

  P.alpha(b3);
  takeaway(382, 'The backlog is a queue length at one instant, not a client count.',
    'Queued equals accepted plus waiting; arrivals equal queued plus dropped. Two lines check any simulation.');
}

/* ============================ scene 6 ============================ */

function drawTuple(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  heading('One server port, many simultaneous connections');

  P.alpha(b0);
  box(40, 56, 240, 78, { fill: ACCDIM, stroke: ACC });
  T(54, 66, 'server endpoint, fixed', { size: 10, bold: true, color: ACC });
  T(54, 86, '203.0.113.5:443', { size: 11, mono: true });
  T(54, 108, 'one listening socket', { size: 10, color: DIM });

  var clients = ['192.0.2.10', '198.51.100.7', '203.0.113.99'];
  clients.forEach(function (c, i) {
    var y = 56 + i * 62;
    var vis = i === 0 ? b0 : b1;
    P.alpha(vis);
    box(320, y, 300, 46, { fill: SURF });
    T(332, y + 8, 'client ' + c, { size: 10, mono: true });
    T(332, y + 26, 'ports 32768 – 60999', { size: 10, color: DIM });
    arrow(282, 95, 318, y + 23, BORDER);
    T(632, y + 14, EPH.count + ' connections', { size: 10, mono: true, color: ACC });
  });

  P.alpha(b1);
  T(40, 168, 'each client address can hold ' + EPH.count + ' connections', { size: 10, color: DIM });
  T(40, 186, 'to this one endpoint at the same time', { size: 10, color: DIM });

  P.alpha(b2);
  T(40, 234, 'Across all clients the free fields are the client', { size: 11, bold: true });
  T(40, 254, 'address (32 bits) and the client port (16 bits):', { size: 11, bold: true });
  T(40, 282, '2^32 × 2^16 = 2^48', { size: 15, mono: true, bold: true, color: ACC });
  T(40, 308, '≈ 2.8 × 10^14 four-tuples for one server endpoint', { size: 10, color: DIM });

  P.alpha(b3);
  box(430, 234, 200, 84, { fill: SURF });
  T(442, 244, 'server ceiling', { size: 10, bold: true });
  T(442, 264, 'descriptors, memory,', { size: 10, color: DIM });
  T(442, 282, 'accept queue length', { size: 10, color: DIM });
  box(650, 234, 210, 84, { fill: SURF });
  T(662, 244, 'client ceiling', { size: 10, bold: true });
  T(662, 264, 'ephemeral ports, and the', { size: 10, color: DIM });
  T(662, 282, 'time each is held after close', { size: 10, color: DIM });

  P.alpha(b3);
  takeaway(378, 'A server on one port never runs out of ports; a busy client can.',
    'Thousands of TIME_WAIT entries on a server cost memory only: their local port is the same 443 for all of them.');
}

/* ============================ scene 7 ============================ */

function drawTimewait(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  heading('TIME_WAIT: who waits, for how long, and why');

  P.alpha(b0);
  T(40, 50, 'active closer — it sent the first FIN', { size: 10, bold: true });
  TEARDOWN.active.forEach(function (s, i) {
    var x = 40 + i * 158;
    var hot = s === 'TIME-WAIT';
    chip(x, 66, 146, 30, s, {
      fill: hot ? WARNDIM : SURF2,
      stroke: hot ? WARN : BORDER,
      color: hot ? WARN : INK
    });
    if (i < TEARDOWN.active.length - 1) arrow(x + 148, 81, x + 156, 81, BORDER);
  });

  P.alpha(b0);
  T(40, 120, 'passive closer — it received the first FIN', { size: 10, bold: true });
  TEARDOWN.passive.forEach(function (s, i) {
    var x = 40 + i * 158;
    var hot = s === 'CLOSE-WAIT';
    chip(x, 136, 146, 30, s, {
      fill: hot ? BADDIM : SURF2,
      stroke: hot ? BAD : BORDER,
      color: hot ? BAD : INK
    });
    if (i < TEARDOWN.passive.length - 1) arrow(x + 148, 151, x + 156, 151, BORDER);
  });

  P.alpha(b1);
  T(40, 194, 'Two reasons it exists', { size: 11, bold: true });
  T(40, 216, '1.  a lost final ACK: the peer retransmits its FIN, and this socket', { size: 10 });
  T(40, 234, '     must still exist to acknowledge it rather than answer with a reset', { size: 10 });
  T(40, 256, '2.  old duplicates: a delayed segment must not be accepted by a new', { size: 10 });
  T(40, 274, '     connection that reuses the same four-tuple', { size: 10 });

  P.alpha(b2);
  T(500, 194, 'Two durations, both correct', { size: 11, bold: true });
  box(500, 214, 360, 34, { fill: SURF });
  T(512, 224, 'RFC 793:  MSL 120 s,  TIME-WAIT = 2 x MSL = ' + TW.spec + ' s',
    { size: 10, mono: true });
  box(500, 254, 360, 34, { fill: WARNDIM, stroke: WARN });
  T(512, 264, 'Linux:  TCP_TIMEWAIT_LEN = ' + TW.linux + ' s, fixed, no sysctl',
    { size: 10, mono: true });

  P.alpha(b3);
  T(40, 306, 'TIME_WAIT holds a four-tuple. CLOSE_WAIT holds a descriptor.', { size: 11, bold: true });
  T(40, 328, 'A socket in TIME_WAIT is kept by the kernel and blocks a new connection', { size: 10, color: DIM });
  T(40, 346, 'on the same four-tuple. A socket in CLOSE_WAIT is still open in your', { size: 10, color: DIM });
  T(40, 364, 'process and is waiting for your program to close it.', { size: 10, color: DIM });

  P.alpha(b3);
  takeaway(384, 'The side that closes first enters TIME_WAIT; the side that receives first does not.',
    'Quoting 240 s for Linux, or 60 s for RFC 793, is the commonest wrong answer in this clause.');
}

/* ============================ scene 8 ============================ */

function drawExhaustion(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  heading('Ephemeral port exhaustion, counted');

  P.alpha(b0);
  T(40, 52, 'ports in use  =  rate x seconds each port is held', { size: 12, mono: true, bold: true });
  T(40, 76, 'held by TIME-WAIT: ' + EPH.linuxHold + ' s on Linux, ' + TW.spec + ' s by the specification',
    { size: 10, color: DIM });

  P.alpha(b1);
  T(40, 112, 'rate (per s)', { size: 10, bold: true });
  T(180, 112, 'ports held', { size: 10, bold: true });
  T(320, 112, 'verdict', { size: 10, bold: true });
  RATES.forEach(function (r, i) {
    var y = 136 + i * 28;
    T(40, y, String(r.rate), { size: 11, mono: true });
    T(180, y, String(r.used), { size: 11, mono: true, color: r.fits ? INK : BAD });
    T(320, y, r.fits ? 'fits' : 'over by ' + r.over, {
      size: 10, mono: true, color: r.fits ? VAL : BAD
    });
  });
  T(40, 262, 'the range holds ' + EPH.count + ' ports', { size: 10, color: DIM });

  P.alpha(b1);
  var maxW = 300, baseX = 470;
  RATES.forEach(function (r, i) {
    var y = 136 + i * 28;
    var w = Math.min(maxW, (r.used / EPH.count) * maxW);
    P.rect(baseX, y - 4, maxW, 12, { fill: SURF2, stroke: BORDER, sw: 1, radius: 2 });
    P.rect(baseX, y - 4, w, 12, { fill: r.fits ? ACC : BAD, stroke: r.fits ? ACC : BAD, sw: 1, radius: 2 });
  });
  P.line(baseX + maxW, 124, baseX + maxW, 250, { stroke: FAINT, sw: 1, dash: [3, 3] });
  T(baseX, 258, 'bar = ports held against ' + EPH.count, { size: 9, color: FAINT });

  P.alpha(b2);
  T(40, 292, 'The ceiling is a floor: 28232 / 60 = ' + EPH.exact.toFixed(2) + ', so ' + EPH.rateLinux + ' fits',
    { size: 11, bold: true, color: ACC });
  T(40, 316, 'connect then fails at once with EADDRNOTAVAIL, before any packet leaves.',
    { size: 10, color: DIM });
  T(40, 334, 'The server never saw the request, so this is not a server fault.',
    { size: 10, color: DIM });

  P.alpha(b3);
  T(470, 292, 'Two levers on one product', { size: 11, bold: true });
  T(470, 314, 'reuse connections  ->  the rate falls', { size: 10, mono: true });
  T(470, 334, 'widen the port range  ->  the ceiling rises', { size: 10, mono: true });

  P.alpha(b3);
  takeaway(366, 'Ports in use is a product, so a rate question and a count question differ by a factor of 60.',
    'The failing direction is outgoing, on one endpoint; a server-side pile of TIME_WAIT consumes no ephemeral port.');
}

/* ============================ scene 9 ============================ */

function drawUdp(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  heading('The same API without a connection');

  P.alpha(1);
  T(40, 50, 'TCP', { size: 11, bold: true });
  T(470, 50, 'UDP', { size: 11, bold: true });

  CALLS.server.forEach(function (c, i) {
    var y = 66 + i * 30;
    P.alpha(b0);
    box(40, y, 300, 26, { fill: SURF2 });
    T(52, y + 8, c.call, { size: 10, mono: true });
    P.alpha(1);
  });

  CALLS.udp.forEach(function (c, i) {
    var y = 66 + i * 30;
    P.alpha(b0);
    box(470, y, 330, 26, { fill: i === 0 ? ACCDIM : SURF, stroke: i === 0 ? ACC : BORDER, radius: 4 });
    T(482, y + 8, c.call, { size: 10, mono: true });
    T(470, y, '', { size: 1 });
    P.alpha(1);
  });

  P.alpha(b1);
  T(470, 194, 'listen and accept are absent: there is no connection to queue', { size: 10, color: DIM });

  P.alpha(b1);
  T(40, 260, 'A UDP socket is demultiplexed by its local port alone, so one socket', { size: 11, bold: true });
  T(40, 280, 'receives from every client, and recvfrom reports who sent each datagram.', { size: 10, color: DIM });

  P.alpha(b2);
  T(40, 312, 'connect() on a UDP socket only records a default peer: nothing is sent,', { size: 10 });
  T(40, 330, 'no handshake happens, and datagrams from other sources are dropped.', { size: 10 });

  P.alpha(b3);
  takeaway(366, 'No connection, so no TIME_WAIT, so no port ceiling of the previous scene.',
    'The 28232 over 60 arithmetic is a TCP phenomenon; a closed UDP socket frees its port at once.');
}

/* ============================ scene 10 ============================ */

function drawProcedure(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  heading('The procedure, and the five traps');

  var steps = ['name the side', 'name the quantity', 'apply the invariant', 'check the unit'];
  P.alpha(b0);
  steps.forEach(function (s, i) {
    var x = 40 + i * 206;
    box(x, 48, 190, 46, { fill: SURF2 });
    T(x + 10, 58, String(i + 1) + '.', { size: 10, mono: true, color: FAINT });
    T(x + 26, 58, s, { size: 10, bold: true });
    if (i < 3) arrow(x + 192, 71, x + 204, 71, BORDER);
  });

  P.alpha(b1);
  T(40, 116, 'the four invariants', { size: 11, bold: true });
  T(40, 138, 'sockets     1 + 2N in the system, 1 + N at the server', { size: 10, mono: true });
  T(40, 158, 'tuples      2^48 for a fixed server endpoint', { size: 10, mono: true });
  T(40, 178, 'ports       ' + EPH.count + ' per client address per endpoint', { size: 10, mono: true });
  T(40, 198, 'round trips 1 for connect, 1.5 for accept', { size: 10, mono: true });

  P.alpha(b2);
  T(470, 116, 'traps one to three', { size: 11, bold: true });
  T(470, 138, '1.  accept returns the same socket', { size: 10 });
  T(470, 158, '2.  the server needs a new port per connection', { size: 10 });
  T(470, 178, '3.  the server is the side in TIME_WAIT', { size: 10 });

  P.alpha(b3);
  T(470, 210, 'traps four and five', { size: 11, bold: true });
  T(470, 232, '4.  the backlog is a client count', { size: 10 });
  T(470, 252, '5.  TIME_WAIT is always harmful', { size: 10 });

  P.alpha(b3);
  takeaway(288, 'Write the unit at the top of your working: sockets, connections, ports, tuples or round trips.',
    'Every trap above is a unit confusion, and each one is visible the moment the unit is written down.');

  P.alpha(1);
  T(40, 366, 'All ' + CHECKS.length + ' model checks are run on load; the count is printed under the canvas.',
    { size: 10, color: FAINT });
}

/* ============================ the frame ============================ */

var SCENE_DRAW = {
  endpoints: drawEndpoints,
  calls: drawCalls,
  accept: drawAccept,
  handshake: drawHandshake,
  backlog: drawBacklog,
  tuple: drawTuple,
  timewait: drawTimewait,
  exhaustion: drawExhaustion,
  udp: drawUdp,
  procedure: drawProcedure
};

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
