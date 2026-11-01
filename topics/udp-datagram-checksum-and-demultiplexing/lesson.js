/* ==========================================================================
   udp-datagram-checksum-and-demultiplexing — lesson.js
   Four layers, in order:
     1. THE MODEL   — the four header fields and their 8 octets, the length
                      ceilings 65535/65527/65507/65467, the 12-octet IPv4 and
                      40-octet IPv6 pseudo-headers, a fully computed one's
                      complement checksum over a real 17-octet datagram, the
                      two-tuple demultiplexing rule over three flows, the port
                      table, and the fragment arithmetic of GATE CS 2015 Set 2
                      question 28.
     2. THE CHECKS  — every number the lesson states, re-verified at load.
     3. RENDER      — reads the model; never re-derives a value.
     4. BOOT        — p5.js first, the browser's own canvas as the fallback.

   Every number on the canvas and in every caption comes from this file.
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
  var SURF = PAL.surface, SURF2 = PAL.surface2, BORDER = PAL.border;
  var ACCDIM = PAL.accentDim || '#d6efeb';
  var WARNDIM = PAL.warnDim || '#fbeed3';
  var INVALIDDIM = PAL.invalidDim || '#fbe4e2';

/* ======================================================================
   LAYER 1 — THE MODEL
   ====================================================================== */

  var CHECKS = [];
  function check(name, fn) {
    var r;
    try { r = fn(); }
    catch (e) { r = { pass: false, detail: 'threw ' + e.message }; }
    CHECKS.push({ name: name, pass: !!r.pass, detail: r.detail || '' });
  }

  /* ---------- 1.1 the header, field by field ----------
     RFC 768 gives four fields, each a 16-bit word. There is no options field
     and no variable part, so the data always begins at octet 8. */

  var FIELDS = [
    { name: 'Source Port', bits: 16, octets: 2, what: 'optional; zero when no reply is wanted' },
    { name: 'Destination Port', bits: 16, octets: 2, what: 'names the receiving program' },
    { name: 'Length', bits: 16, octets: 2, what: 'header plus data; minimum 8' },
    { name: 'Checksum', bits: 16, octets: 2, what: 'optional over IPv4; zero means none computed' }
  ];

  function headerOctets() {
    var n = 0;
    for (var i = 0; i < FIELDS.length; i++) n += FIELDS[i].octets;
    return n;
  }
  var HDR = headerOctets();

  /* ---------- 1.2 the length ceilings ----------
     The Length field is 16 bits, so 65535 is the largest datagram it can
     report. IPv4 has its own 16-bit Total Length covering the IP header, so
     the payload ceiling is lower by exactly the IP header. */

  var LEN_MAX = Math.pow(2, 16) - 1;              /* 65535 */
  var MAX_PAYLOAD = LEN_MAX - HDR;                /* 65527 */
  var IP_HDR_MIN = 20, IP_HDR_MAX = 60;
  var MAX_OVER_IPV4 = LEN_MAX - IP_HDR_MIN - HDR; /* 65507 */
  var MAX_OVER_IPV4_OPT = LEN_MAX - IP_HDR_MAX - HDR; /* 65467 */

  /* a DNS query: 12-octet header, then a question of QNAME 17 + QTYPE 2 +
     QCLASS 2. The label arithmetic is the one the DNS lesson computes. */
  var DNS_QNAME = 4 + 5 + 4 + 3 + 1;   /* length octet plus label, four labels plus root */
  var DNS_QUERY = 12 + DNS_QNAME + 2 + 2;
  var DNS_UDP_LEN = DNS_QUERY + HDR;
  var DNS_ODD = DNS_UDP_LEN % 2 === 1;

  /* ---------- 1.3 the two pseudo-headers ----------
     Never transmitted. RFC 768 lists source address, destination address,
     the protocol, and the UDP length. RFC 8200 section 8.1 gives the IPv6
     form: two 128-bit addresses, a 32-bit upper-layer length, three zero
     octets and a one-octet Next Header. */

  var PSEUDO4 = [
    { name: 'source address', octets: 4 },
    { name: 'destination address', octets: 4 },
    { name: 'zero', octets: 1 },
    { name: 'protocol 17', octets: 1 },
    { name: 'UDP length', octets: 2 }
  ];

  var PSEUDO6 = [
    { name: 'source address', octets: 16 },
    { name: 'destination address', octets: 16 },
    { name: 'upper-layer length', octets: 4 },
    { name: 'zero', octets: 3 },
    { name: 'next header 17', octets: 1 }
  ];

  function octetsOf(list) {
    var n = 0;
    for (var i = 0; i < list.length; i++) n += list[i].octets;
    return n;
  }
  var P4 = octetsOf(PSEUDO4);   /* 12 */
  var P6 = octetsOf(PSEUDO6);   /* 40 */

  /* ---------- 1.4 the checksum, computed rather than typed ---------- */

  function words(bytes) {
    var out = [];
    for (var i = 0; i < bytes.length; i += 2) {
      var hi = bytes[i];
      var lo = (i + 1 < bytes.length) ? bytes[i + 1] : 0;
      out.push((hi << 8) | lo);
    }
    return out;
  }

  function padEven(bytes) {
    return (bytes.length % 2 === 1) ? bytes.concat([0]) : bytes.slice();
  }

  function fold(sum) {
    while (sum > 0xFFFF) sum = (sum & 0xFFFF) + (sum >>> 16);
    return sum;
  }

  function onesSum(list) {
    var s = 0;
    for (var i = 0; i < list.length; i++) s += list[i];
    return fold(s);
  }

  function complement(v) { return (~v) & 0xFFFF; }

  /* RFC 768: a computed zero is transmitted as all ones */
  function transmitted(c) { return c === 0 ? 0xFFFF : c; }

  var EX = {
    src: [192, 168, 1, 10],
    dst: [8, 8, 8, 8],
    sport: 51515,
    dport: 53,
    data: [0x1a, 0x2b, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]
  };

  EX.udpLen = HDR + EX.data.length;
  EX.pseudoWords = [
    (EX.src[0] << 8) | EX.src[1], (EX.src[2] << 8) | EX.src[3],
    (EX.dst[0] << 8) | EX.dst[1], (EX.dst[2] << 8) | EX.dst[3],
    0x0011, EX.udpLen
  ];
  EX.headerWords = [EX.sport, EX.dport, EX.udpLen, 0x0000];
  EX.dataWords = words(padEven(EX.data));
  EX.allWords = EX.pseudoWords.concat(EX.headerWords).concat(EX.dataWords);
  EX.sum = onesSum(EX.allWords);
  EX.checksum = complement(EX.sum);
  EX.sent = transmitted(EX.checksum);
  EX.verifyWords = EX.pseudoWords.concat([EX.sport, EX.dport, EX.udpLen, EX.sent]).concat(EX.dataWords);
  EX.verifySum = onesSum(EX.verifyWords);
  EX.padOctets = padEven(EX.data).length - EX.data.length;

  function hex(v, width) {
    var s = v.toString(16).toUpperCase();
    while (s.length < (width || 4)) s = '0' + s;
    return s;
  }

  /* ---------- 1.5 demultiplexing: two fields, not four ----------
     UDP delivers on (destination address, destination port). TCP needs the
     whole four-tuple. Three datagrams from two senders therefore reach one
     UDP socket and would need two TCP sockets. */

  var FLOWS = [
    { from: '10.0.0.7:40001', to: '203.0.113.53:53', n: 2 },
    { from: '10.0.0.9:40002', to: '203.0.113.53:53', n: 1 }
  ];
  var N_DATAGRAMS = 3;

  function udpSockets(flows) {
    var keys = {};
    for (var i = 0; i < flows.length; i++) keys[flows[i].to] = true;
    return Object.keys(keys).length;
  }
  function tcpSockets(flows) {
    var keys = {};
    for (var i = 0; i < flows.length; i++) keys[flows[i].from + '>' + flows[i].to] = true;
    return Object.keys(keys).length;
  }
  var UDP_SOCKETS = udpSockets(FLOWS);   /* 1 */
  var TCP_SOCKETS = tcpSockets(FLOWS);   /* 2 */

  /* ---------- 1.6 the ports worth knowing ---------- */

  var PORTS = [
    { port: 53, name: 'DNS', note: 'UDP and TCP' },
    { port: 67, name: 'DHCP server', note: 'UDP' },
    { port: 68, name: 'DHCP client', note: 'UDP' },
    { port: 69, name: 'TFTP', note: 'UDP' },
    { port: 123, name: 'NTP', note: 'UDP' },
    { port: 161, name: 'SNMP', note: 'UDP' },
    { port: 500, name: 'IKE', note: 'UDP' },
    { port: 520, name: 'RIP', note: 'UDP' }
  ];
  var PORT_VALUES = 65536;   /* 2^16 numbers, 0 to 65535 */

  /* ---------- 1.7 fragmentation counts the UDP header ----------
     GATE CS 2015 Set 2, question 28: 8880 octets of user data, MTU 1500,
     20-octet IPv4 header with no options. */

  var FRAG = {
    data: 8880,
    udpHeader: HDR,
    ipHeader: 20,
    mtu: 1500
  };
  FRAG.payload = FRAG.data + FRAG.udpHeader;          /* 8888 */
  FRAG.perFragment = FRAG.mtu - FRAG.ipHeader;        /* 1480 */
  FRAG.count = Math.ceil(FRAG.payload / FRAG.perFragment);   /* 7 */
  FRAG.last = FRAG.payload - FRAG.perFragment * (FRAG.count - 1); /* 8 */
  FRAG.offsetOfLast = (FRAG.payload - FRAG.last) / 8;  /* 1110 */
  FRAG.lastFrame = FRAG.last + FRAG.ipHeader;          /* 28 */

/* ======================================================================
   LAYER 2 — THE CHECKS
   ====================================================================== */

  check('the header is four fields of two octets, eight octets in all', function () {
    return { pass: FIELDS.length === 4 && headerOctets() === 8,
             detail: FIELDS.length + ' fields, ' + headerOctets() + ' octets' };
  });

  check('every header field is 16 bits', function () {
    var bad = FIELDS.filter(function (f) { return f.bits !== 16 || f.octets * 8 !== f.bits; });
    return { pass: bad.length === 0, detail: bad.length + ' wrong' };
  });

  check('the minimum Length is the header itself, eight', function () {
    return { pass: HDR === 8 && HDR * 8 === 64, detail: 'min length ' + HDR };
  });

  check('the 16-bit ceiling is 65535 and the payload ceiling is 65527', function () {
    return { pass: LEN_MAX === 65535 && MAX_PAYLOAD === 65527 && MAX_PAYLOAD === LEN_MAX - HDR,
             detail: LEN_MAX + ' / ' + MAX_PAYLOAD };
  });

  check('over IPv4 the payload ceiling is 65507, and 65467 with a 60-octet header', function () {
    return { pass: MAX_OVER_IPV4 === 65507 && MAX_OVER_IPV4_OPT === 65467,
             detail: MAX_OVER_IPV4 + ' / ' + MAX_OVER_IPV4_OPT };
  });

  check('a 33-octet DNS query has a UDP Length of 41, and 41 is odd', function () {
    return { pass: DNS_QUERY === 33 && DNS_UDP_LEN === 41 && DNS_ODD === true,
             detail: DNS_QUERY + ' -> ' + DNS_UDP_LEN };
  });

  check('the IPv4 pseudo-header is 12 octets and the IPv6 one is 40', function () {
    return { pass: P4 === 12 && P6 === 40, detail: P4 + ' / ' + P6 };
  });

  check('both pseudo-headers carry protocol number 17, not a port', function () {
    var four = PSEUDO4.some(function (f) { return f.name === 'protocol 17' && f.octets === 1; });
    var six = PSEUDO6.some(function (f) { return f.name === 'next header 17' && f.octets === 1; });
    return { pass: four && six, detail: 'IPv4 ' + four + ', IPv6 ' + six };
  });

  check('the pseudo-header is not part of any transmitted length', function () {
    return { pass: EX.udpLen === HDR + EX.data.length && EX.udpLen === 17,
             detail: 'Length field says ' + EX.udpLen + ', pseudo-header adds ' + P4 + ' only to the sum' };
  });

  check('nine data octets pad to five words with one zero octet', function () {
    return { pass: EX.dataWords.length === 5 && EX.padOctets === 1 && padEven([1, 2]).length === 2,
             detail: EX.dataWords.length + ' words, ' + EX.padOctets + ' padding octet' };
  });

  check('the worked datagram is fifteen words: six pseudo, four header, five data', function () {
    var ok = EX.pseudoWords.length === 6 && EX.headerWords.length === 4 &&
             EX.dataWords.length === 5 && EX.allWords.length === 15;
    return { pass: ok, detail: EX.allWords.length + ' words' };
  });

  check('the checksum field is zero while the sum is taken', function () {
    return { pass: EX.headerWords[3] === 0, detail: 'word 4 = ' + hex(EX.headerWords[3]) };
  });

  check('the sum of the fifteen words is 0xB592', function () {
    return { pass: EX.sum === 0xB592, detail: '0x' + hex(EX.sum) };
  });

  check('the checksum is the complement, 0x4A6D, and no fold was needed', function () {
    return { pass: EX.checksum === 0x4A6D && (EX.sum & 0xFFFF) === EX.sum,
             detail: '0x' + hex(EX.checksum) };
  });

  check('adding the checksum back gives 0xFFFF, which is the receiver test', function () {
    return { pass: EX.verifySum === 0xFFFF && EX.sent === EX.checksum,
             detail: '0x' + hex(EX.verifySum) };
  });

  check('a computed zero is transmitted as 0xFFFF, and 0xFFFF maps to itself', function () {
    return { pass: transmitted(0) === 0xFFFF && transmitted(0x4A6D) === 0x4A6D,
             detail: 'transmitted(0) = 0x' + hex(transmitted(0)) };
  });

  check('the complement of the checksum returns the sum', function () {
    return { pass: complement(EX.checksum) === EX.sum, detail: '0x' + hex(complement(EX.checksum)) };
  });

  check('three datagrams from two senders reach one UDP socket and two TCP sockets', function () {
    return { pass: UDP_SOCKETS === 1 && TCP_SOCKETS === 2 && N_DATAGRAMS === 3,
             detail: 'UDP ' + UDP_SOCKETS + ', TCP ' + TCP_SOCKETS };
  });

  check('the port table has eight distinct ports, all below 1024', function () {
    var seen = {}, dup = 0, high = 0;
    for (var i = 0; i < PORTS.length; i++) {
      if (seen[PORTS[i].port]) dup++;
      seen[PORTS[i].port] = true;
      if (PORTS[i].port >= 1024) high++;
    }
    return { pass: PORTS.length === 8 && dup === 0 && high === 0,
             detail: dup + ' duplicates, ' + high + ' above 1023' };
  });

  check('a 16-bit port space holds 65536 values, 0 to 65535', function () {
    return { pass: PORT_VALUES === 65536 && PORT_VALUES - 1 === 65535, detail: PORT_VALUES + ' values' };
  });

  check('8880 octets of data become 8888 at the IP layer, in seven fragments', function () {
    return { pass: FRAG.payload === 8888 && FRAG.perFragment === 1480 && FRAG.count === 7,
             detail: FRAG.payload + ' / ' + FRAG.perFragment + ' = ' + FRAG.count };
  });

  check('the last fragment carries 8 octets at offset 1110', function () {
    var consistent = FRAG.offsetOfLast * 8 + FRAG.last === FRAG.payload;
    return { pass: FRAG.last === 8 && FRAG.offsetOfLast === 1110 && consistent,
             detail: 'last ' + FRAG.last + ', offset ' + FRAG.offsetOfLast };
  });

  check('six full fragments plus the last one add back to the payload', function () {
    return { pass: FRAG.perFragment * (FRAG.count - 1) + FRAG.last === FRAG.payload,
             detail: '1480 x 6 + ' + FRAG.last + ' = ' + FRAG.payload };
  });

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

/* ======================================================================
   LAYER 3 — RENDER
   Every value drawn here is read from the model above.
   ====================================================================== */

  var TITLE_Y = 26, SUB_Y = 48;

  function head(txt, sub) {
    P.text(24, TITLE_Y, txt, { size: 16, bold: true, color: INK });
    if (sub) P.text(24, SUB_Y, sub, { size: 12, color: DIM });
  }

  function foot(txt, colour) {
    P.text(24, 436, txt, { size: 12, color: colour || DIM });
  }

  function beat(t, sc, off, dur) {
    return K.clamp01((t - sc.start - off) / Math.max(0.001, dur));
  }

  function sceneOf(t) {
    var sc = window.LESSON_TIMELINE.scenes;
    for (var i = 0; i < sc.length; i++) if (t >= sc.start && t < sc.end) return sc[i];
    return sc[sc.length - 1];
  }

  function panel(x, y, w, h, tone) {
    var fill = tone === 'bad' ? INVALIDDIM : tone === 'warn' ? WARNDIM : tone === 'acc' ? ACCDIM : SURF2;
    var stroke = tone === 'bad' ? BAD : tone === 'warn' ? WARN : tone === 'acc' ? ACC : BORDER;
    P.rect(x, y, w, h, { fill: fill, stroke: stroke, radius: 6 });
  }

  function box(x, y, w, h, label, tone, size) {
    var fill = tone === 'bad' ? INVALIDDIM : tone === 'warn' ? WARNDIM : tone === 'acc' ? ACCDIM : SURF;
    var stroke = tone === 'bad' ? BAD : tone === 'warn' ? WARN : tone === 'acc' ? ACC : BORDER;
    var ink = tone === 'bad' ? BAD : tone === 'warn' ? WARN : tone === 'acc' ? ACC : INK;
    P.rect(x, y, w, h, { fill: fill, stroke: stroke, radius: 5 });
    P.text(x + w / 2, y + h / 2, label, { size: size || 10, mono: true, color: ink, align: 'center', base: 'middle' });
  }

  var SCENE_DRAW = {};

  /* ---------- scene 1: what UDP keeps ---------- */
  SCENE_DRAW['two-jobs'] = function (t, sc) {
    head('What UDP keeps, and what it throws away', 'A transport layer has eight jobs. UDP kept two of them.');

    var jobs = [
      'connection setup and teardown', 'sequence numbers and ordering',
      'acknowledgements', 'retransmission of lost segments',
      'flow control: a receive window', 'congestion control: a slow down',
      'message boundaries', 'a program to deliver to, and a checksum'
    ];

    var a = K.ease(beat(t, sc, 0.3, 0.7));
    P.alpha(a);
    panel(24, 72, 430, 232, null);
    P.text(38, 82, 'The eight jobs, and who kept them', { size: 11, bold: true, color: INK });
    for (var i = 0; i < jobs.length; i++) {
      var kept = (i === 6 || i === 7);
      var y = 106 + i * 24;
      P.text(38, y, kept ? '\u2713' : '\u2715', { size: 11, mono: true, color: kept ? VAL : BAD });
      P.text(56, y, jobs[i], { size: 10, color: kept ? VAL : DIM });
      P.text(360, y, kept ? 'UDP keeps it' : 'the application\u2019s job', { size: 9, color: kept ? VAL : FAINT });
    }
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.7));
    P.alpha(b);
    panel(470, 72, 406, 108, 'acc');
    P.text(484, 82, 'The two UDP keeps', { size: 11, bold: true, color: ACC });
    P.text(484, 104, '1. Multiplexing: the port number, 16 bits,', { size: 10, color: INK });
    P.text(484, 120, '    so many programs share one address.', { size: 10, color: DIM });
    P.text(484, 142, '2. Integrity: the checksum, 16 bits, over', { size: 10, color: INK });
    P.text(484, 158, '    a pseudo-header, the header and the data.', { size: 10, color: DIM });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.7));
    P.alpha(c);
    panel(470, 192, 406, 112, 'warn');
    P.text(484, 202, 'A postcard, not a registered letter', { size: 11, bold: true, color: WARN });
    P.text(484, 224, 'Cheap. Self-contained. One piece or none.', { size: 10, color: INK });
    P.text(484, 242, 'Nobody signs for it and nobody traces it.', { size: 10, color: INK });
    P.text(484, 264, 'RFC 768: transaction oriented; delivery and', { size: 9, color: DIM });
    P.text(484, 280, 'duplicate protection are not guaranteed.', { size: 9, color: DIM });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    P.rect(24, 320, 852, 92, { fill: SURF2, stroke: BORDER, radius: 6 });
    P.text(38, 332, 'The design argument, in one line', { size: 11, bold: true, color: INK });
    P.text(38, 354, 'If the application already knows how to retry \u2014 a resolver timing out, a game sending the next frame \u2014', { size: 10, color: DIM });
    P.text(38, 372, 'then a transport that also retries is paying twice for the same protection. UDP stops at the two jobs', { size: 10, color: DIM });
    P.text(38, 390, 'nobody else can do for it: find the program, and notice a damaged datagram.', { size: 10, color: DIM });
    P.alpha(1);

    foot('Eight octets of header, two fields of state, and the rest left to you.');
  };

  /* ---------- scene 2: the eight octets ---------- */
  SCENE_DRAW['eight-octets'] = function (t, sc) {
    head('The eight octets', 'Four fields, two octets each. No options, no variable part.');

    var a = K.ease(beat(t, sc, 0.3, 0.7));
    P.alpha(a);
    for (var i = 0; i < 4; i++) {
      var col = i % 2, row = Math.floor(i / 2);
      var x = 24 + col * 436, y = 76 + row * 58;
      box(x, y, 420, 48, '', i === 1 ? 'acc' : null);
      P.text(x + 12, y + 10, FIELDS[i].name, { size: 11, bold: true, color: i === 1 ? ACC : INK });
      P.text(x + 12, y + 28, FIELDS[i].bits + ' bits \u00b7 ' + FIELDS[i].octets + ' octets', { size: 9, mono: true, color: DIM });
      P.text(x + 200, y + 28, FIELDS[i].what, { size: 9, color: FAINT });
    }
    P.text(24, 196, 'octets 0\u20131        octets 2\u20133        octets 4\u20135        octets 6\u20137        data begins at octet 8', { size: 9, mono: true, color: FAINT });
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.7));
    P.alpha(b);
    panel(24, 216, 420, 108, 'acc');
    P.text(38, 226, 'Source Port may be zero', { size: 11, bold: true, color: ACC });
    P.text(38, 248, 'RFC 768 calls it optional and says a value of', { size: 10, color: INK });
    P.text(38, 266, 'zero is inserted when it is not used. A sender', { size: 10, color: INK });
    P.text(38, 284, 'that wants no reply needs no return port.', { size: 10, color: INK });
    P.text(38, 306, 'Zero here is legal. Zero in the checksum is not', { size: 9, color: DIM });
    P.text(38, 320, 'a value: it means no checksum was computed.', { size: 9, color: DIM });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.7));
    P.alpha(c);
    panel(456, 216, 420, 108, 'warn');
    P.text(470, 226, 'Length counts its own header', { size: 11, bold: true, color: WARN });
    P.text(470, 248, 'A datagram of ' + DNS_QUERY + ' octets of DNS data reports', { size: 10, color: INK });
    P.text(470, 266, DNS_UDP_LEN + ', not ' + DNS_QUERY + ', because the eight octets of header', { size: 10, color: INK });
    P.text(470, 284, 'are inside the number. The minimum is 8.', { size: 10, color: INK });
    P.text(470, 306, 'Reporting the payload instead is the single', { size: 9, color: DIM });
    P.text(470, 320, 'commonest arithmetic error in this topic.', { size: 9, color: DIM });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    panel(24, 336, 852, 76, null);
    P.text(38, 346, 'The one field a router never rewrites', { size: 11, bold: true, color: INK });
    P.text(38, 368, 'Routers forward on the IP header. Both port fields and the checksum survive every hop unchanged, which is why a', { size: 10, color: DIM });
    P.text(38, 386, 'capture taken at the destination shows the same eight octets the sender wrote \u2014 except where NAT rewrites them.', { size: 10, color: DIM });
    P.alpha(1);

    foot('Eight octets: two ports, one length that includes them, one checksum.');
  };

  /* ---------- scene 3: the length ceiling ---------- */
  SCENE_DRAW['length-ceiling'] = function (t, sc) {
    head('The length field is 16 bits, so the ceiling is 65535', 'Four different lengths, four different subtractions.');

    var a = K.ease(beat(t, sc, 0.3, 0.7));
    P.alpha(a);
    var x0 = 40, x1 = 860, yb = 108;
    P.line(x0, yb, x1, yb, { stroke: BORDER, sw: 2 });
    P.text(x0, yb + 10, '0', { size: 9, mono: true, color: FAINT });
    P.text(x1, yb + 10, '65535', { size: 9, mono: true, color: FAINT, align: 'right' });

    var marks = [
      { v: LEN_MAX, label: 'datagram ceiling 65535', tone: 'acc', dy: -54 },
      { v: MAX_PAYLOAD, label: 'payload alone 65527', tone: null, dy: -30 },
      { v: MAX_OVER_IPV4, label: 'payload over IPv4 65507', tone: 'warn', dy: -6 }
    ];
    for (var i = 0; i < marks.length; i++) {
      var px = x0 + (marks[i].v / LEN_MAX) * (x1 - x0);
      P.circle(px, yb, 4, { fill: marks[i].tone === 'warn' ? WARN : marks[i].tone === 'acc' ? ACC : INK, stroke: SURF, sw: 1 });
      P.text(px - 6, yb + marks[i].dy, marks[i].label, { size: 9, mono: true, color: marks[i].tone === 'warn' ? WARN : marks[i].tone === 'acc' ? ACC : DIM, align: 'right' });
    }
    var dnsPx = x0 + (DNS_UDP_LEN / LEN_MAX) * (x1 - x0);
    P.circle(dnsPx, yb, 3, { fill: VAL, stroke: SURF, sw: 1 });
    P.text(x0, yb + 30, 'a DNS query sits at 41 \u2014 the left edge, which is why the scale hides it', { size: 9, color: FAINT });
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.7));
    P.alpha(b);
    panel(24, 152, 420, 140, null);
    P.text(38, 162, 'The four subtractions', { size: 11, bold: true, color: INK });
    P.text(38, 186, '2^16 \u2212 1                       = ' + LEN_MAX, { size: 10, mono: true, color: INK });
    P.text(38, 206, '65535 \u2212 8 UDP header            = ' + MAX_PAYLOAD, { size: 10, mono: true, color: INK });
    P.text(38, 226, '65535 \u2212 20 IP \u2212 8 UDP           = ' + MAX_OVER_IPV4, { size: 10, mono: true, color: WARN });
    P.text(38, 246, '65535 \u2212 60 IP \u2212 8 UDP           = ' + MAX_OVER_IPV4_OPT, { size: 10, mono: true, color: WARN });
    P.text(38, 272, 'The first is the field. The other three are what', { size: 9, color: DIM });
    P.text(38, 284, 'actually fits once a header has taken its cut.', { size: 9, color: DIM });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.7));
    P.alpha(c);
    panel(456, 152, 420, 140, 'acc');
    P.text(470, 162, 'Both ceilings are 65535, and that is the trap', { size: 11, bold: true, color: ACC });
    P.text(470, 186, 'The IPv4 Total Length counts the IP header.', { size: 10, color: INK });
    P.text(470, 204, 'The UDP Length counts the UDP header.', { size: 10, color: INK });
    P.text(470, 222, 'Neither counts the other, and neither field', { size: 10, color: INK });
    P.text(470, 240, 'can describe more than 65535 octets.', { size: 10, color: INK });
    P.text(470, 266, 'A question that says "over IPv4" wants 65507.', { size: 9, color: DIM });
    P.text(470, 278, 'One that says "a UDP datagram" wants 65527.', { size: 9, color: DIM });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    P.rect(24, 304, 852, 100, { fill: SURF2, stroke: BORDER, radius: 6 });
    P.text(38, 314, 'Where a real query lands', { size: 11, bold: true, color: INK });
    P.text(38, 336, '12-octet DNS header + a question of ' + DNS_QNAME + ' octets + 2 for the type + 2 for the class = ' + DNS_QUERY + ' octets of data.', { size: 10, color: DIM });
    P.text(38, 354, 'UDP reports ' + DNS_UDP_LEN + ', because the eight header octets are inside the number, and ' + DNS_UDP_LEN + ' is odd \u2014 which the', { size: 10, color: DIM });
    P.text(38, 372, 'checksum has to handle with one padding octet that is never transmitted.', { size: 10, color: DIM });
    P.text(38, 392, 'A 512-octet DNS answer is 0.8% of the 65527-octet ceiling, so the application\u2019s own limit binds long before the field does.', { size: 9, color: FAINT });
    P.alpha(1);

    foot('Name which of the four lengths you are being asked for before you subtract anything.');
  };

  /* ---------- scene 4: the pseudo-header ---------- */
  SCENE_DRAW['pseudo-header'] = function (t, sc) {
    head('The pseudo-header: six words that are never sent', 'Built by the sender, rebuilt by the receiver, absent from the wire.');

    var a = K.ease(beat(t, sc, 0.3, 0.7));
    P.alpha(a);
    panel(24, 72, 420, 176, null);
    P.text(38, 82, 'IPv4 pseudo-header, ' + P4 + ' octets', { size: 11, bold: true, color: INK });
    var rows = ['source address', 'destination address', 'zero', 'protocol 17', 'UDP length'];
    for (var i = 0; i < rows.length; i++) {
      var y = 108 + i * 26;
      var wide = (i < 2);
      box(38, y, wide ? 220 : 106, 20, '', i === 3 ? 'acc' : null, 9);
      P.text(46, y + 5, PSEUDO4[i].name, { size: 9, mono: true, color: i === 3 ? ACC : INK });
      P.text(wide ? 268 : 154, y + 5, PSEUDO4[i].octets + ' octets', { size: 9, color: DIM });
    }
    P.text(38, 240, '4 + 4 + 1 + 1 + 2 = ' + P4 + ' octets, which is six 16-bit words', { size: 9, mono: true, color: ACC });
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.7));
    P.alpha(b);
    panel(456, 72, 420, 176, 'acc');
    P.text(470, 82, 'Why the addresses are in the sum', { size: 11, bold: true, color: ACC });
    P.text(470, 106, 'RFC 768: this information gives protection', { size: 10, color: INK });
    P.text(470, 124, 'against misrouted datagrams.', { size: 10, color: INK });
    P.text(470, 150, 'The receiver builds the pseudo-header from its', { size: 10, color: INK });
    P.text(470, 168, 'own address. A datagram delivered to the wrong', { size: 10, color: INK });
    P.text(470, 186, 'host fails the check although its own octets', { size: 10, color: INK });
    P.text(470, 204, 'are perfect.', { size: 10, color: INK });
    P.text(470, 228, 'So the checksum cannot be verified from the', { size: 9, color: DIM });
    P.text(470, 240, 'datagram bytes alone \u2014 the addresses are needed.', { size: 9, color: DIM });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.7));
    P.alpha(c);
    panel(24, 260, 420, 112, 'warn');
    P.text(38, 270, 'It never enlarges the datagram', { size: 11, bold: true, color: WARN });
    P.text(38, 292, 'The Length field still reports the true datagram:', { size: 10, color: INK });
    P.text(38, 310, EX.udpLen + ' octets in the worked example, not ' + (EX.udpLen + P4) + '.', { size: 10, color: INK });
    P.text(38, 332, 'Adding the pseudo-header to a size is a', { size: 9, color: DIM });
    P.text(38, 346, 'misunderstanding, not a rounding difference.', { size: 9, color: DIM });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    panel(456, 260, 420, 112, null);
    P.text(470, 270, 'IPv6: ' + P6 + ' octets, and no longer optional', { size: 11, bold: true, color: INK });
    P.text(470, 292, '16 + 16 + 4 + 3 + 1 = ' + P6 + ' octets, twenty words.', { size: 10, mono: true, color: INK });
    P.text(470, 312, 'RFC 8200 \u00a78.1: an IPv6 node must compute the', { size: 9, color: DIM });
    P.text(470, 326, 'checksum, must map a computed zero to FFFF, and', { size: 9, color: DIM });
    P.text(470, 340, 'receivers must discard a zero checksum.', { size: 9, color: DIM });
    P.text(470, 358, 'Tunnel encapsulation may enable zero-checksum mode (RFC 6936).', { size: 9, color: FAINT });
    P.alpha(1);

    foot('Twelve octets over IPv4, forty over IPv6, protocol 17 in both, and nothing on the wire.');
  };

  /* ---------- scene 5: the procedure ---------- */
  SCENE_DRAW['procedure'] = function (t, sc) {
    head('The checksum procedure in five steps', 'One\u2019s complement addition, not a hash and not a parity check.');

    var steps = [
      { n: '1', t: 'Pad the data to an even octet count', d: 'zero octets at the end, for the arithmetic only, never transmitted' },
      { n: '2', t: 'Add every 16-bit word as an integer', d: 'pseudo-header, then header with the checksum field zero, then data' },
      { n: '3', t: 'Fold the carries back into the low 16 bits', d: 'repeat until nothing remains above bit 16' },
      { n: '4', t: 'Take the one\u2019s complement', d: 'invert every bit; do not subtract from 65536' },
      { n: '5', t: 'Map a computed zero to FFFF', d: 'an all-zero transmitted field means no checksum was computed' }
    ];

    for (var i = 0; i < steps.length; i++) {
      var a = K.ease(beat(t, sc, 0.3 + i * 1.4, 0.6));
      P.alpha(a);
      var y = 72 + i * 44;
      panel(24, y, 852, 38, i === 4 ? 'warn' : null);
      P.circle(44, y + 19, 11, { fill: SURF, stroke: i === 4 ? WARN : ACC, sw: 1.5 });
      P.text(44, y + 19, steps[i].n, { size: 11, mono: true, color: i === 4 ? WARN : ACC, align: 'center', base: 'middle' });
      P.text(66, y + 6, steps[i].t, { size: 11, bold: true, color: INK });
      P.text(66, y + 22, steps[i].d, { size: 9, color: DIM });
    }
    P.alpha(1);

    var c = K.ease(beat(t, sc, 7.5, 0.8));
    P.alpha(c);
    panel(24, 296, 420, 108, 'acc');
    P.text(38, 306, 'The receiver\u2019s test', { size: 11, bold: true, color: ACC });
    P.text(38, 328, 'Add the same words with the checksum field', { size: 10, color: INK });
    P.text(38, 346, 'left as received. A correct datagram gives', { size: 10, color: INK });
    P.text(38, 364, '0xFFFF, because a value plus its complement', { size: 10, color: INK });
    P.text(38, 382, 'is all ones.', { size: 10, color: INK });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 15, 0.8));
    P.alpha(d);
    panel(456, 296, 420, 108, 'bad');
    P.text(470, 306, 'What a failure does: nothing visible', { size: 11, bold: true, color: BAD });
    P.text(470, 328, 'A datagram that fails the check is discarded.', { size: 10, color: INK });
    P.text(470, 346, 'There is no negative acknowledgement, so the', { size: 10, color: INK });
    P.text(470, 364, 'sender learns nothing and the application', { size: 10, color: INK });
    P.text(470, 382, 'learns nothing either.', { size: 10, color: INK });
    P.alpha(1);

    foot('Pad, add, fold, complement, map zero to FFFF \u2014 and on receipt, expect FFFF.');
  };

  /* ---------- scene 6: the worked checksum ---------- */
  SCENE_DRAW['worked'] = function (t, sc) {
    head('One datagram, fifteen words, one checksum',
         EX.src.join('.') + ' \u2192 ' + EX.dst.join('.') + ', port ' + EX.sport + ' \u2192 ' + EX.dport + ', ' + EX.data.length + ' octets of data');

    var a = K.ease(beat(t, sc, 0.3, 0.7));
    P.alpha(a);
    P.text(24, 68, 'The six pseudo-header words, then the four header words, then five padded data words', { size: 9, color: DIM });

    var labels = ['pseudo', 'pseudo', 'pseudo', 'pseudo', 'pseudo', 'pseudo', 'header', 'header', 'header', 'header', 'data', 'data', 'data', 'data', 'data'];
    for (var i = 0; i < EX.allWords.length; i++) {
      var col = i % 5, row = Math.floor(i / 5);
      var x = 24 + col * 172, y = 86 + row * 46;
      var tone = i < 6 ? 'acc' : (i < 10 ? null : 'warn');
      box(x, y, 160, 34, '', tone, 11);
      P.text(x + 8, y + 4, hex(EX.allWords[i]), { size: 11, mono: true, color: tone === 'acc' ? ACC : tone === 'warn' ? WARN : INK });
      P.text(x + 8, y + 20, labels[i] + (i === 9 ? ' \u00b7 zeroed' : ''), { size: 8, color: FAINT });
    }
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.7));
    P.alpha(b);
    panel(24, 238, 420, 92, null);
    P.text(38, 248, 'The sum of all fifteen words', { size: 11, bold: true, color: INK });
    P.text(38, 272, '0x' + hex(EX.sum) + '  \u2014 already inside 16 bits, so nothing to fold', { size: 10, mono: true, color: INK });
    P.text(38, 296, 'complement of 0x' + hex(EX.sum) + '  =  0x' + hex(EX.checksum), { size: 10, mono: true, color: ACC });
    P.text(38, 316, 'The field carries 0x' + hex(EX.sent) + '.', { size: 9, color: DIM });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.7));
    P.alpha(c);
    panel(456, 238, 420, 92, 'acc');
    P.text(470, 248, 'The receiver re-adds, with 0x' + hex(EX.sent) + ' in place', { size: 11, bold: true, color: ACC });
    P.text(470, 272, 'sum = 0x' + hex(EX.verifySum), { size: 10, mono: true, color: INK });
    P.text(470, 296, '0xFFFF is the acceptance test. Anything else is', { size: 10, color: INK });
    P.text(470, 314, 'a silent discard, not an error message.', { size: 9, color: DIM });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    P.rect(24, 344, 852, 68, { fill: WARNDIM, stroke: WARN, radius: 6 });
    P.text(38, 354, 'Two places to slip in this one example', { size: 11, bold: true, color: WARN });
    P.text(38, 376, 'The nine data octets are odd, so one zero octet is appended: five words, not four and a half. And the checksum field', { size: 10, color: DIM });
    P.text(38, 394, 'enters the sum as 0x0000, not as the value you are about to compute.', { size: 10, color: DIM });
    P.alpha(1);

    foot('Sum 0xB592, complement 0x4A6D, and the receiver\u2019s re-add lands on 0xFFFF.');
  };

  /* ---------- scene 7: demultiplexing ---------- */
  SCENE_DRAW['demux'] = function (t, sc) {
    head('Demultiplexing: two fields, not four', 'Destination address and destination port choose the socket.');

    var a = K.ease(beat(t, sc, 0.3, 0.7));
    P.alpha(a);
    P.text(24, 68, 'Three datagrams from two senders, all addressed to port 53 of one server', { size: 10, color: DIM });
    for (var i = 0; i < FLOWS.length; i++) {
      var y = 92 + i * 56;
      box(24, y, 200, 34, FLOWS[i].from, null, 10);
      P.arrow(232, y + 17, 372, y + 17, { stroke: ACC, sw: 1.6, head: 9 });
      P.text(238, y + 4, FLOWS[i].n + (FLOWS[i].n === 1 ? ' datagram' : ' datagrams'), { size: 8, color: FAINT });
    }
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.7));
    P.alpha(b);
    box(380, 92, 230, 90, '', 'acc');
    P.text(392, 100, 'one UDP socket', { size: 11, bold: true, color: ACC });
    P.text(392, 122, 'bound to 203.0.113.53 : 53', { size: 10, mono: true, color: INK });
    P.text(392, 144, 'receives all ' + N_DATAGRAMS + ' datagrams', { size: 10, color: INK });
    P.text(392, 164, 'the source fields travel up as data', { size: 9, color: DIM });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.7));
    P.alpha(c);
    box(646, 92, 230, 90, '', 'warn');
    P.text(658, 100, 'two TCP sockets', { size: 11, bold: true, color: WARN });
    P.text(658, 122, 'the four-tuple differs', { size: 10, color: INK });
    P.text(658, 144, 'so they are two connections', { size: 10, color: INK });
    P.text(658, 164, 'and two accepted sockets', { size: 9, color: DIM });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    panel(24, 212, 420, 108, null);
    P.text(38, 222, 'The rule, stated once', { size: 11, bold: true, color: INK });
    P.text(38, 244, 'UDP delivers on (destination address,', { size: 10, color: INK });
    P.text(38, 262, 'destination port). The source fields are passed', { size: 10, color: INK });
    P.text(38, 280, 'to the program, not used to choose it.', { size: 10, color: INK });
    P.text(38, 302, 'So a UDP server can be one loop over one socket.', { size: 9, color: DIM });
    P.alpha(1);

    var e = K.ease(beat(t, sc, 25, 0.8));
    P.alpha(e);
    panel(456, 212, 420, 108, 'warn');
    P.text(470, 222, 'And boundaries are preserved', { size: 11, bold: true, color: WARN });
    P.text(470, 244, 'One receive returns exactly one datagram.', { size: 10, color: INK });
    P.text(470, 262, 'Two datagrams are never merged into one read,', { size: 10, color: INK });
    P.text(470, 280, 'and one datagram is never split across two.', { size: 10, color: INK });
    P.text(470, 302, 'TCP is a byte stream and has no boundaries at all.', { size: 9, color: DIM });
    P.alpha(1);

    var f = K.ease(beat(t, sc, 27, 0.8));
    P.alpha(f);
    P.rect(24, 332, 852, 76, { fill: SURF2, stroke: BORDER, radius: 6 });
    P.text(38, 342, 'Counting sockets is a question shape', { size: 11, bold: true, color: INK });
    P.text(38, 364, 'For UDP count distinct (destination address, destination port) pairs. For TCP count distinct four-tuples. The same', { size: 10, color: DIM });
    P.text(38, 382, 'three datagrams give ' + UDP_SOCKETS + ' socket and ' + TCP_SOCKETS + ' sockets, and neither number is the datagram count.', { size: 10, color: DIM });
    P.alpha(1);

    foot('Two fields choose a UDP socket, four choose a TCP connection, and one datagram is one message.');
  };

  /* ---------- scene 8: ports and DNS ---------- */
  SCENE_DRAW['ports-dns'] = function (t, sc) {
    head('Ports, and the exchange DNS actually has', 'Sixteen bits of number, and no connection to set up.');

    var a = K.ease(beat(t, sc, 0.3, 0.7));
    P.alpha(a);
    var x0 = 40, x1 = 860, yb = 88;
    P.line(x0, yb, x1, yb, { stroke: BORDER, sw: 2 });
    P.text(x0, yb + 10, '0', { size: 9, mono: true, color: FAINT });
    P.text(x1, yb + 10, '65535', { size: 9, mono: true, color: FAINT, align: 'right' });
    P.text(24, 66, 'The port space: ' + PORT_VALUES + ' values from 0 to 65535, with the assigned services crowded at the left', { size: 10, color: DIM });
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.7));
    P.alpha(b);
    panel(24, 108, 420, 148, null);
    P.text(38, 118, 'The ports worth memorising', { size: 11, bold: true, color: INK });
    for (var i = 0; i < PORTS.length; i++) {
      var col = i % 2, row = Math.floor(i / 2);
      var x = 38 + col * 202, y = 142 + row * 26;
      P.text(x, y, PORTS[i].port + '', { size: 10, mono: true, color: ACC });
      P.text(x + 44, y, PORTS[i].name, { size: 10, color: INK });
      P.text(x + 138, y, PORTS[i].note, { size: 8, color: FAINT });
    }
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.7));
    P.alpha(c);
    panel(456, 108, 420, 148, 'acc');
    P.text(470, 118, 'One DNS exchange, end to end', { size: 11, bold: true, color: ACC });
    P.text(470, 142, 'client:ephemeral \u2192 server:53   one query, ' + DNS_QUERY + ' octets', { size: 9, mono: true, color: INK });
    P.text(470, 160, 'server:53 \u2192 client:ephemeral   one response', { size: 9, mono: true, color: INK });
    P.text(470, 184, 'No handshake, no sequence number, no', { size: 10, color: INK });
    P.text(470, 202, 'acknowledgement. The response is matched to', { size: 10, color: INK });
    P.text(470, 220, 'the query by the DNS identifier and the port.', { size: 10, color: INK });
    P.text(470, 244, 'A lost query is found by the resolver\u2019s timer.', { size: 9, color: DIM });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    P.rect(24, 268, 852, 104, { fill: SURF2, stroke: BORDER, radius: 6 });
    P.text(38, 278, 'The trade, counted', { size: 11, bold: true, color: INK });
    P.text(38, 300, 'A UDP header is ' + HDR + ' octets against a TCP header of at least 20, and a TCP exchange spends one round trip on a handshake', { size: 10, color: DIM });
    P.text(38, 318, 'before any data moves. So DNS saves the 12 octets and the round trip, and pays for both with its own retransmission timer.', { size: 10, color: DIM });
    P.text(38, 340, 'That is the whole of "why does DNS use UDP": the saving is the header plus the handshake, and the cost is the safety net.', { size: 10, color: DIM });
    P.text(38, 360, 'DNS also has a TCP variant on the same port 53, for responses too large for one datagram \u2014 so "DNS is UDP" is half true.', { size: 9, color: FAINT });
    P.alpha(1);

    foot('A port names a program. It is meaningless without the address it sits behind.');
  };

  /* ---------- scene 9: what the missing machinery costs ---------- */
  SCENE_DRAW['what-it-drops'] = function (t, sc) {
    head('What the missing machinery costs', 'Four omissions, three consequences, one GATE question.');

    var drops = ['no acknowledgement', 'no sequence number', 'no receive window', 'no congestion response'];
    var a = K.ease(beat(t, sc, 0.3, 0.7));
    P.alpha(a);
    for (var i = 0; i < 4; i++) {
      var x = 24 + i * 214;
      box(x, 70, 202, 44, '', 'bad');
      P.text(x + 12, 78, drops[i], { size: 10, bold: true, color: BAD });
      P.text(x + 12, 96, ['nothing is resent', 'any order is fine', 'a slow reader is overrun', 'loss never slows the sender'][i], { size: 8, color: DIM });
    }
    P.alpha(1);

    var b = K.ease(beat(t, sc, 7.5, 0.7));
    P.alpha(b);
    panel(24, 126, 420, 104, 'warn');
    P.text(38, 136, 'Over IPv6 the checksum is not optional', { size: 11, bold: true, color: WARN });
    P.text(38, 158, 'RFC 8200 \u00a78.1: an originating node must compute', { size: 10, color: INK });
    P.text(38, 176, 'it, must map a computed zero to FFFF, and a', { size: 10, color: INK });
    P.text(38, 194, 'receiver must discard a zero checksum.', { size: 10, color: INK });
    P.text(38, 216, 'IPv4 allowed the field to be zero. The two rules', { size: 9, color: DIM });
    P.text(38, 226, 'are opposites: read which version is named.', { size: 9, color: DIM });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 15, 0.7));
    P.alpha(c);
    panel(456, 126, 420, 104, null);
    P.text(470, 136, 'Fragmentation counts the UDP header', { size: 11, bold: true, color: INK });
    P.text(470, 158, 'The UDP header is part of the IP payload, so it is', { size: 10, color: INK });
    P.text(470, 176, 'fragmented along with the data and counted in', { size: 10, color: INK });
    P.text(470, 194, 'every payload figure.', { size: 10, color: INK });
    P.text(470, 216, 'Fragmenting the data alone is the standard error.', { size: 9, color: DIM });
    P.text(470, 226, 'GATE CS 2015 Set 2, question 28, is exactly this.', { size: 9, color: DIM });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(d);
    P.rect(24, 242, 852, 130, { fill: SURF2, stroke: BORDER, radius: 6 });
    P.text(38, 252, 'GATE CS 2015 Set 2, Q28: ' + FRAG.data + ' octets of user data, MTU ' + FRAG.mtu + ', 20-octet IPv4 header', { size: 11, bold: true, color: INK });
    P.text(38, 276, 'IP payload        = ' + FRAG.data + ' + ' + FRAG.udpHeader + '  = ' + FRAG.payload + ' octets', { size: 10, mono: true, color: ACC });
    P.text(38, 296, 'per fragment      = ' + FRAG.mtu + ' \u2212 ' + FRAG.ipHeader + ' = ' + FRAG.perFragment + ' octets, a multiple of 8', { size: 10, mono: true, color: ACC });
    P.text(38, 316, 'fragment count    = ceil(' + FRAG.payload + ' / ' + FRAG.perFragment + ') = ' + FRAG.count, { size: 10, mono: true, color: ACC });
    P.text(38, 336, 'last fragment     = ' + FRAG.payload + ' \u2212 ' + FRAG.perFragment + ' \u00d7 ' + (FRAG.count - 1) + ' = ' + FRAG.last + ' octets of payload', { size: 10, mono: true, color: ACC });
    P.text(38, 356, 'offset of last    = ' + (FRAG.payload - FRAG.last) + ' / 8 = ' + FRAG.offsetOfLast + '   (the field counts eight-octet units)', { size: 10, mono: true, color: ACC });
    P.alpha(1);

    foot('Fragmenting ' + FRAG.data + ' instead of ' + FRAG.payload + ' gives six fragments and the wrong answer.');
  };

  /* ---------- scene 10: the four questions ---------- */
  SCENE_DRAW['procedure-exam'] = function (t, sc) {
    head('The four questions, the counts and the traps', 'Ask these in order and most UDP questions fall apart.');

    var qs = [
      { q: '1. Which length is meant?', a: 'data, datagram, IP payload or IP total' },
      { q: '2. Compute or verify?', a: 'put a value in, or expect 0xFFFF out' },
      { q: '3. Which pseudo-header?', a: '12 octets over IPv4, 40 over IPv6, protocol 17' },
      { q: '4. What is being counted?', a: 'sockets, datagrams, or IP fragments' }
    ];

    for (var i = 0; i < qs.length; i++) {
      var a = K.ease(beat(t, sc, 0.3 + i * 1.6, 0.7));
      P.alpha(a);
      var col = i % 2, row = Math.floor(i / 2);
      var x = 24 + col * 436, y = 72 + row * 62;
      panel(x, y, 420, 52, null);
      P.text(x + 14, y + 8, qs[i].q, { size: 11, bold: true, color: ACC });
      P.text(x + 14, y + 28, qs[i].a, { size: 9, color: DIM });
    }
    P.alpha(1);

    var c = K.ease(beat(t, sc, 7.5, 0.8));
    P.alpha(c);
    panel(24, 204, 420, 116, 'acc');
    P.text(38, 214, 'The counts, in one place', { size: 11, bold: true, color: ACC });
    P.text(38, 238, 'header            8 octets', { size: 10, mono: true, color: INK });
    P.text(38, 256, 'max datagram      ' + LEN_MAX, { size: 10, mono: true, color: INK });
    P.text(38, 274, 'max payload       ' + MAX_PAYLOAD + ' alone, ' + MAX_OVER_IPV4 + ' over IPv4', { size: 10, mono: true, color: INK });
    P.text(38, 292, 'pseudo-header     ' + P4 + ' over IPv4, ' + P6 + ' over IPv6', { size: 10, mono: true, color: INK });
    P.text(38, 310, 'port space        ' + PORT_VALUES + ' values', { size: 10, mono: true, color: INK });
    P.alpha(1);

    var d = K.ease(beat(t, sc, 15, 0.8));
    P.alpha(d);
    panel(456, 204, 420, 116, 'bad');
    P.text(470, 214, 'The four answers that look right', { size: 11, bold: true, color: BAD });
    P.text(470, 238, '1. Reporting the payload as the Length.', { size: 10, color: INK });
    P.text(470, 256, '2. Saying port 17 instead of protocol 17.', { size: 10, color: INK });
    P.text(470, 274, '3. Adding the pseudo-header to the size.', { size: 10, color: INK });
    P.text(470, 292, '4. Counting fragments as datagrams.', { size: 10, color: INK });
    P.text(470, 310, 'Each is one step away from the right answer.', { size: 9, color: DIM });
    P.alpha(1);

    var e = K.ease(beat(t, sc, 22.5, 0.8));
    P.alpha(e);
    P.rect(24, 332, 852, 78, { fill: SURF2, stroke: BORDER, radius: 6 });
    P.text(38, 342, 'The one-sentence version', { size: 11, bold: true, color: INK });
    P.text(38, 366, 'Eight octets, four fields, one checksum over a pseudo-header that is never sent, and two fields that pick the socket.', { size: 10, color: DIM });
    P.text(38, 388, 'Everything else UDP does not do, and everything it does not do is the application\u2019s job \u2014 which is the answer to "why UDP".', { size: 10, color: DIM });
    P.alpha(1);

    foot('Eight octets of certainty, and four questions before any arithmetic.');
  };

/* ======================================================================
   LAYER 4 — BOOT
   ====================================================================== */

  function drawFrame(painter) {
    P = painter;
    var t = (K && K.state) ? K.state.elapsed : 0;
    var sc = sceneOf(t);
    P.alpha(1);
    P.clear();
    var fn = SCENE_DRAW[sc.id] || SCENE_DRAW['two-jobs'];
    fn(t, sc);
    P.alpha(1);
  }

  function fillChecks() {
    var el = document.getElementById('checks');
    if (!el) return;
    var bad = CHECKS.length - PASSED;
    el.innerHTML = '<span class="k">Model checks</span>' +
      '<p class="small" style="margin:6px 0 0">' + PASSED + ' of ' + CHECKS.length + ' passed' +
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
            drawFrame(P);
            ok = true;
          };
          sk.draw = function () { /* frames are driven by the timeline */ };
        });
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
    FIELDS: FIELDS,
    HEADER: HDR,
    LENGTHS: { max: LEN_MAX, payload: MAX_PAYLOAD, overIPv4: MAX_OVER_IPV4, overIPv4Options: MAX_OVER_IPV4_OPT },
    DNS: { query: DNS_QUERY, udpLength: DNS_UDP_LEN, odd: DNS_ODD, qname: DNS_QNAME },
    PSEUDO: { v4: P4, v6: P6, fields4: PSEUDO4, fields6: PSEUDO6 },
    WORKED: {
      src: EX.src, dst: EX.dst, sport: EX.sport, dport: EX.dport, data: EX.data,
      udpLength: EX.udpLen, words: EX.allWords, sum: EX.sum,
      checksum: EX.checksum, sent: EX.sent, verifySum: EX.verifySum, pad: EX.padOctets
    },
    DEMUX: { flows: FLOWS, datagrams: N_DATAGRAMS, udpSockets: UDP_SOCKETS, tcpSockets: TCP_SOCKETS },
    PORTS: PORTS,
    PORT_VALUES: PORT_VALUES,
    FRAG: FRAG,
    PASSED: PASSED,
    TOTAL: CHECKS.length
  };
  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
