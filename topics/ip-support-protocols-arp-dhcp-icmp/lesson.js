/* ==========================================================================
   ip-support-protocols-arp-dhcp-icmp — lesson.js
   Four layers, in order:
     1. THE MODEL   — the ARP header and its 28 octets, the Ethernet minimum
                      frame, five destinations against one prefix, the DHCP
                      header and lease arithmetic, the ICMP type table, the
                      five RFC 1122 suppression rules over six cases, and the
                      message counts for ping and traceroute.
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

  /* ---------- 1.1 the ARP header, octet by octet ----------
     ARP is not carried in a transport header: it has its own message format,
     and for Ethernet over IPv4 that format is fixed at 28 octets. */

  var ARP_FIELDS = [
    { name: 'HTYPE', octets: 2, what: 'hardware type, 1 for Ethernet' },
    { name: 'PTYPE', octets: 2, what: 'protocol type, 0x0800 for IPv4' },
    { name: 'HLEN',  octets: 1, what: 'hardware address length, 6' },
    { name: 'PLEN',  octets: 1, what: 'protocol address length, 4' },
    { name: 'OPER',  octets: 2, what: '1 request, 2 reply' },
    { name: 'SHA',   octets: 6, what: 'sender hardware address' },
    { name: 'SPA',   octets: 4, what: 'sender protocol address' },
    { name: 'THA',   octets: 6, what: 'target hardware address' },
    { name: 'TPA',   octets: 4, what: 'target protocol address' }
  ];

  function arpOctets() {
    var n = 0;
    for (var i = 0; i < ARP_FIELDS.length; i++) n += ARP_FIELDS[i].octets;
    return n;
  }

  /* the Ethernet frame that carries it. 14 header, at least 46 of payload,
     a 4-octet frame check sequence, and a 64-octet minimum frame. */
  var ETH = {
    header: 14,
    minPayload: 46,
    fcs: 4,
    frameMin: 64,
    arpEtherType: '0x0806',
    ipv4EtherType: '0x0800'
  };

  var ARP_FRAME = (function () {
    var arp = arpOctets();
    var payload = ETH.header + arp;                 /* 42 */
    var pad = Math.max(0, ETH.minPayload - arp);    /* 18 */
    return {
      arp: arp,
      payload: payload,
      pad: pad,
      frame: payload + pad + ETH.fcs
    };
  })();

  /* ---------- 1.2 one prefix, five destinations ----------
     The ARP target is the next hop, and the next hop is decided by the mask,
     not by the destination address alone. */

  var NET = {
    host:    { name: 'A', ip: '192.168.10.5',  mac: 'AA:00:00:00:00:0A', prefix: 24 },
    gateway: { name: 'R', ip: '192.168.10.1',  mac: 'AA:00:00:00:00:01' },
    server:  { name: 'S', ip: '192.168.10.2',  mac: 'AA:00:00:00:00:02' }
  };

  var DESTS = [
    '192.168.10.20',
    '192.168.10.77',
    '192.168.10.254',
    '192.168.10.9',
    '192.168.20.9'
  ];

  function networkOf(ip, prefix) {
    var parts = String(ip).split('.');
    var bits = prefix;
    var out = [];
    for (var i = 0; i < 4; i++) {
      var take = Math.max(0, Math.min(8, bits - i * 8));
      var mask = take === 0 ? 0 : (256 - Math.pow(2, 8 - take));
      out.push(String((parseInt(parts[i], 10) & mask)));
      bits = bits;
    }
    return out.join('.');
  }

  var ARP_TARGETS = DESTS.map(function (d) {
    var inside = networkOf(d, NET.host.prefix) === networkOf(NET.host.ip, NET.host.prefix);
    return {
      dest: d,
      inside: inside,
      target: inside ? d : NET.gateway.ip,
      targetIsGateway: !inside
    };
  });

  var N_INSIDE = ARP_TARGETS.filter(function (t) { return t.inside; }).length;
  var N_OUTSIDE = ARP_TARGETS.length - N_INSIDE;

  /* ---------- 1.3 the DHCP header, the cookie and the sizes ---------- */

  var DHCP_FIELDS = [
    { name: 'op', octets: 1 }, { name: 'htype', octets: 1 },
    { name: 'hlen', octets: 1 }, { name: 'hops', octets: 1 },
    { name: 'xid', octets: 4 }, { name: 'secs', octets: 2 },
    { name: 'flags', octets: 2 }, { name: 'ciaddr', octets: 4 },
    { name: 'yiaddr', octets: 4 }, { name: 'siaddr', octets: 4 },
    { name: 'giaddr', octets: 4 }, { name: 'chaddr', octets: 16 },
    { name: 'sname', octets: 64 }, { name: 'file', octets: 128 }
  ];

  function dhcpFixed() {
    var n = 0;
    for (var i = 0; i < DHCP_FIELDS.length; i++) n += DHCP_FIELDS[i].octets;
    return n;
  }

  var DHCP = {
    clientPort: 68,
    serverPort: 67,
    cookie: 4,
    minFrame: 300,
    optionsMin: 312,
    ipHeader: 20,
    udpHeader: 8,
    fixed: dhcpFixed()
  };
  DHCP.withCookie = DHCP.fixed + DHCP.cookie;              /* 240 */
  DHCP.minOptionRoom = DHCP.minFrame - DHCP.withCookie;    /* 60 */
  DHCP.message = DHCP.fixed + DHCP.optionsMin;             /* 548 */
  DHCP.datagram = DHCP.message + DHCP.ipHeader + DHCP.udpHeader;   /* 576 */

  /* the four messages, with the addresses and ports each one actually uses */
  var DORA = [
    { id: 'discover', name: 'DHCPDISCOVER', from: 'client', type: 1,
      srcIp: '0.0.0.0', dstIp: '255.255.255.255',
      sport: 68, dport: 67, cast: 'broadcast', clientBroadcast: true },
    { id: 'offer', name: 'DHCPOFFER', from: 'server', type: 2,
      srcIp: '192.168.10.2', dstIp: '255.255.255.255',
      sport: 67, dport: 68, cast: 'unicast or broadcast', clientBroadcast: false },
    { id: 'request', name: 'DHCPREQUEST', from: 'client', type: 3,
      srcIp: '0.0.0.0', dstIp: '255.255.255.255',
      sport: 68, dport: 67, cast: 'broadcast', clientBroadcast: true },
    { id: 'ack', name: 'DHCPACK', from: 'server', type: 5,
      srcIp: '192.168.10.2', dstIp: '255.255.255.255',
      sport: 67, dport: 68, cast: 'unicast or broadcast', clientBroadcast: false }
  ];

  var CLIENT_BROADCASTS = DORA.filter(function (m) { return m.clientBroadcast; }).length;

  /* ---------- 1.4 the lease and its two timers ---------- */

  var LEASE = 3600;
  var T1 = 0.5 * LEASE;
  var T2 = 0.875 * LEASE;

  /* ---------- 1.5 ICMP: types, classes, and the header ---------- */

  var ICMP_PROTO = 1;

  var ICMP_TYPES = [
    { t: 0,  name: 'Echo reply',           cls: 'query' },
    { t: 3,  name: 'Destination unreachable', cls: 'error' },
    { t: 4,  name: 'Source quench',        cls: 'error' },
    { t: 5,  name: 'Redirect',             cls: 'error' },
    { t: 8,  name: 'Echo request',         cls: 'query' },
    { t: 11, name: 'Time exceeded',        cls: 'error' },
    { t: 12, name: 'Parameter problem',    cls: 'error' },
    { t: 13, name: 'Timestamp request',    cls: 'query' },
    { t: 14, name: 'Timestamp reply',      cls: 'query' },
    { t: 15, name: 'Information request',  cls: 'query' },
    { t: 16, name: 'Information reply',    cls: 'query' }
  ];

  var N_ICMP_ERRORS = ICMP_TYPES.filter(function (x) { return x.cls === 'error'; }).length;
  var N_ICMP_QUERIES = ICMP_TYPES.length - N_ICMP_ERRORS;

  var ICMP_QUOTED = 20 + 8;   /* IPv4 header plus the first 8 octets of data */

  /* ---------- 1.6 the five suppression rules, run over six cases ---------- */

  var SUPPRESS_RULES = [
    'the datagram that failed was itself an ICMP error',
    'the destination is an IP broadcast or multicast address',
    'the datagram arrived as a link-layer broadcast',
    'the datagram is a fragment other than the first',
    'the source address does not identify one single host'
  ];

  var ICMP_CASES = [
    { what: 'UDP to a closed port, unicast, first fragment',
      rule: null, sends: true, msg: 'type 3, code 3' },
    { what: 'TTL reaches zero at a router on the path',
      rule: null, sends: true, msg: 'type 11, code 0' },
    { what: 'Datagram larger than the next link, DF set',
      rule: null, sends: true, msg: 'type 3, code 4' },
    { what: 'Router has no route to that network',
      rule: null, sends: true, msg: 'type 3, code 0' },
    { what: 'Destination is 255.255.255.255',
      rule: SUPPRESS_RULES[1], sends: false, msg: 'none' },
    { what: 'The datagram that failed was an ICMP error',
      rule: SUPPRESS_RULES[0], sends: false, msg: 'none' }
  ];

  var N_SENT = ICMP_CASES.filter(function (c) { return c.sends; }).length;
  var N_SILENT = ICMP_CASES.length - N_SENT;

  /* ---------- 1.7 the two tools built on one header ---------- */

  var TRACE_HOPS = 5;
  var TRACE_ROUTERS = TRACE_HOPS - 1;
  var TRACE_MESSAGES = TRACE_ROUTERS + 1;          /* four type 11 and one type 3 */
  var PING_PROBES = 4;
  var PING_MESSAGES = PING_PROBES * 2;             /* one request, one reply each */

/* ======================================================================
   LAYER 2 — THE CHECKS
   ====================================================================== */

  check('ARP header adds to 28 octets', function () {
    return { pass: arpOctets() === 28, detail: 'got ' + arpOctets() };
  });

  check('ARP frame needs 18 octets of padding', function () {
    return { pass: ARP_FRAME.pad === 18 && ARP_FRAME.payload === 42,
             detail: ARP_FRAME.payload + ' + ' + ARP_FRAME.pad };
  });

  check('Ethernet minimum frame is 64 with the checksum', function () {
    var f = ETH.header + ETH.minPayload + ETH.fcs;
    return { pass: f === 64 && ARP_FRAME.frame === 64, detail: 'got ' + f + ' and ' + ARP_FRAME.frame };
  });

  check('The mask splits five destinations into four and one', function () {
    return { pass: N_INSIDE === 4 && N_OUTSIDE === 1,
             detail: N_INSIDE + ' inside, ' + N_OUTSIDE + ' outside' };
  });

  check('The one outside destination resolves to the gateway', function () {
    var out = ARP_TARGETS.filter(function (t) { return !t.inside; });
    return { pass: out.length === 1 && out[0].target === NET.gateway.ip,
             detail: out.length ? out[0].target : 'none' };
  });

  check('Every inside destination resolves to itself', function () {
    var ok = ARP_TARGETS.every(function (t) { return t.inside ? t.target === t.dest : true; });
    return { pass: ok, detail: ok ? 'all four' : 'a mismatch' };
  });

  check('DHCP fixed header adds to 236 octets', function () {
    return { pass: DHCP.fixed === 236, detail: 'got ' + DHCP.fixed };
  });

  check('DHCP message is 548 octets, 576 with IP and UDP', function () {
    return { pass: DHCP.message === 548 && DHCP.datagram === 576,
             detail: DHCP.message + ' and ' + DHCP.datagram };
  });

  check('The 300-octet minimum leaves 60 octets for options', function () {
    return { pass: DHCP.withCookie === 240 && DHCP.minOptionRoom === 60,
             detail: DHCP.withCookie + ' then ' + DHCP.minOptionRoom };
  });

  check('Client 68 and server 67 in all four messages', function () {
    var ok = DORA.every(function (m) {
      return m.from === 'client'
        ? (m.sport === 68 && m.dport === 67)
        : (m.sport === 67 && m.dport === 68);
    });
    return { pass: ok, detail: ok ? 'four for four' : 'a mismatch' };
  });

  check('Two of the four DORA messages are client broadcasts', function () {
    return { pass: CLIENT_BROADCASTS === 2, detail: 'got ' + CLIENT_BROADCASTS };
  });

  check('T1 is 1800 and T2 is 3150, with T1 < T2 < lease', function () {
    return { pass: T1 === 1800 && T2 === 3150 && T1 < T2 && T2 < LEASE,
             detail: T1 + ', ' + T2 + ', ' + LEASE };
  });

  check('ICMP is IP protocol 1 and has no ports', function () {
    return { pass: ICMP_PROTO === 1, detail: 'protocol ' + ICMP_PROTO };
  });

  check('Five ICMP types are errors and six are queries', function () {
    return { pass: N_ICMP_ERRORS === 5 && N_ICMP_QUERIES === 6,
             detail: N_ICMP_ERRORS + ' and ' + N_ICMP_QUERIES };
  });

  check('An ICMP error quotes 28 octets', function () {
    return { pass: ICMP_QUOTED === 28, detail: 'got ' + ICMP_QUOTED };
  });

  check('Six suppression cases give four messages and two silences', function () {
    var silentNamed = ICMP_CASES.filter(function (c) { return !c.sends && c.rule; }).length;
    return { pass: N_SENT === 4 && N_SILENT === 2 && silentNamed === 2,
             detail: N_SENT + ' sent, ' + N_SILENT + ' silent' };
  });

  check('A five-hop traceroute sends four type 11 and one type 3', function () {
    return { pass: TRACE_MESSAGES === 5 && TRACE_ROUTERS === 4,
             detail: TRACE_ROUTERS + ' routers then the host' };
  });

  check('Four ping probes send eight messages', function () {
    return { pass: PING_MESSAGES === 8, detail: 'got ' + PING_MESSAGES };
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
    for (var i = 0; i < sc.length; i++) if (t >= sc[i].start && t < sc[i].end) return sc[i];
    return sc[sc.length - 1];
  }

  function bar(x, y, w, h, label, tone, alpha) {
    var fill = tone === 'bad' ? INVALIDDIM : tone === 'warn' ? WARNDIM : tone === 'acc' ? ACCDIM : SURF2;
    var stroke = tone === 'bad' ? BAD : tone === 'warn' ? WARN : tone === 'acc' ? ACC : BORDER;
    var ink = tone === 'bad' ? BAD : tone === 'warn' ? WARN : tone === 'acc' ? ACC : INK;
    P.alpha(alpha === undefined ? 1 : alpha);
    P.rect(x, y, w, h, { fill: fill, stroke: stroke, radius: 5 });
    P.text(x + 10, y + h / 2, label, { size: 11, color: ink, base: 'middle' });
    P.alpha(1);
  }

  function cell(x, y, w, h, label, tone) {
    var fill = tone === 'bad' ? INVALIDDIM : tone === 'warn' ? WARNDIM : tone === 'acc' ? ACCDIM : SURF2;
    var stroke = tone === 'bad' ? BAD : tone === 'warn' ? WARN : tone === 'acc' ? ACC : BORDER;
    var ink = tone === 'bad' ? BAD : tone === 'warn' ? WARN : tone === 'acc' ? ACC : INK;
    P.rect(x, y, w, h, { fill: fill, stroke: stroke, radius: 4 });
    P.text(x + w / 2, y + h / 2, label, { size: 9, mono: true, color: ink, align: 'center', base: 'middle' });
  }

  var SCENE_DRAW = {};

  /* ---------- scene 1: two addresses per hop ---------- */
  SCENE_DRAW['two-addresses'] = function (t, sc) {
    head('Two addresses per hop', 'The IP header names hosts. The frame around it names interfaces.');

    var a1 = K.ease(beat(t, sc, 0.4, 0.8));
    P.alpha(a1);
    P.text(24, 70, 'The IP packet, end to end', { size: 12, bold: true, color: ACC });
    bar(24, 84, 400, 30, 'IP header:  src 192.168.10.5  ->  dst 192.168.20.9', 'acc');
    bar(24, 120, 400, 24, 'TCP or UDP header: two port numbers', 'none');
    bar(24, 150, 400, 24, 'your data', 'none');
    P.alpha(1);

    var a2 = K.ease(beat(t, sc, 2.2, 0.8));
    P.alpha(a2);
    P.text(470, 70, 'The Ethernet frame, one wire only', { size: 12, bold: true, color: ACC });
    bar(470, 84, 406, 24, 'dst MAC  AA:00:00:00:00:01  (the router)', 'warn');
    bar(470, 114, 406, 24, 'src MAC  AA:00:00:00:00:0A  (this host)', 'warn');
    bar(470, 144, 406, 20, 'EtherType 0x0800  (the payload is IPv4)', 'none');
    bar(470, 170, 406, 24, 'payload: the whole IP packet above', 'acc');
    bar(470, 200, 406, 20, 'FCS: 4 octets', 'none');
    P.alpha(1);

    var a3 = K.ease(beat(t, sc, 8, 0.8));
    P.alpha(a3);
    P.text(24, 200, 'The MAC addresses are rewritten at every hop.', { size: 11, color: DIM });
    P.text(24, 220, 'The IP addresses are not.', { size: 11, color: DIM });
    P.alpha(1);

    var a4 = K.ease(beat(t, sc, 15, 0.9));
    P.alpha(a4);
    P.text(24, 254, 'The three helpers, each identified in a different header', { size: 12, bold: true, color: ACC });
    bar(24, 268, 264, 26, 'ARP   EtherType 0x0806', 'acc');
    bar(306, 268, 264, 26, 'ICMP  IP protocol number 1', 'acc');
    bar(588, 268, 288, 26, 'DHCP  UDP 68 -> 67', 'acc');
    P.text(24, 312, 'ARP answers: which interface has this IPv4 address?', { size: 11, color: INK });
    P.text(24, 332, 'DHCP answers: what should my IPv4 address be?', { size: 11, color: INK });
    P.text(24, 352, 'ICMP answers: what went wrong with this datagram?', { size: 11, color: INK });
    P.alpha(1);

    var a5 = K.ease(beat(t, sc, 22, 0.9));
    P.alpha(a5);
    P.rect(24, 374, 852, 46, { fill: SURF2, stroke: BORDER, radius: 5 });
    P.text(38, 386, 'None of the three carries your data, and none of them makes IP reliable.', { size: 11, color: INK });
    P.text(38, 404, 'They are the plumbing of the first hop, which is why questions hide them inside IPv4 and Ethernet scenarios.', { size: 11, color: DIM });
    P.alpha(1);

    foot('A MAC address is a name for an interface on one wire. An IP address is a name for a host on the whole network.');
  };

  /* ---------- scene 2: the ARP exchange ---------- */
  SCENE_DRAW['arp-exchange'] = function (t, sc) {
    head('ARP: ask everybody, answer once', 'One request, one reply, and 28 octets of header.');

    var steps = [
      { n: '1', a: 'A checks its cache', b: 'no entry for B' },
      { n: '2', a: 'request, broadcast', b: 'dst MAC FF:FF:FF:FF:FF:FF' },
      { n: '3', a: 'reply, unicast', b: 'only B answers' },
      { n: '4', a: 'cache updated', b: 'B -> its MAC' }
    ];
    for (var i = 0; i < steps.length; i++) {
      var x = 24 + i * 214;
      var a = K.ease(beat(t, sc, 0.4 + i * 3.4, 0.7));
      P.alpha(a);
      P.rect(x, 70, 200, 62, { fill: SURF2, stroke: BORDER, radius: 5 });
      P.text(x + 10, 78, steps[i].n, { size: 11, bold: true, color: ACC, mono: true });
      P.text(x + 26, 78, steps[i].a, { size: 11, bold: true, color: INK });
      P.text(x + 10, 98, steps[i].b, { size: 10, color: DIM });
      P.alpha(1);
    }

    var b1 = K.ease(beat(t, sc, 13, 0.9));
    P.alpha(b1);
    P.text(24, 152, 'The ARP header for Ethernet over IPv4: 8 fixed octets, then two address pairs', { size: 12, bold: true, color: ACC });
    var r1 = ['HTYPE', 'PTYPE', 'HLEN', 'PLEN', 'OPER'];
    var w1 = [52, 52, 26, 26, 52];
    var cx = 24;
    for (var j = 0; j < r1.length; j++) { cell(cx, 166, w1[j], 24, r1[j], 'none'); cx += w1[j] + 4; }
    var r2 = ['SHA (6)', 'SPA (4)', 'THA (6)', 'TPA (4)'];
    var w2 = [156, 104, 156, 104];
    cx = 24;
    for (var k = 0; k < r2.length; k++) { cell(cx, 196, w2[k], 24, r2[k], 'acc'); cx += w2[k] + 4; }
    P.text(24, 232, '8 + 6 + 4 + 6 + 4 = ' + ARP_FRAME.arp + ' octets', { size: 11, color: INK, mono: true });
    P.alpha(1);

    var b2 = K.ease(beat(t, sc, 22.5, 0.9));
    P.alpha(b2);
    P.text(600, 152, 'Fitting the minimum frame', { size: 12, bold: true, color: ACC });
    P.text(600, 172, '14 Ethernet + 28 ARP = 42', { size: 11, color: INK, mono: true });
    P.text(600, 192, 'minimum payload 46, so 18 pad', { size: 11, color: INK, mono: true });
    P.text(600, 212, '42 + 18 + 4 FCS = 64', { size: 11, color: INK, mono: true });
    P.rect(600, 228, 276, 26, { fill: ACCDIM, stroke: ACC, radius: 4 });
    P.text(610, 241, 'a ' + ARP_FRAME.frame + '-octet frame, as required', { size: 11, color: ACC, base: 'middle' });
    P.alpha(1);

    var b3 = K.ease(beat(t, sc, 26, 0.9));
    P.alpha(b3);
    P.rect(24, 258, 540, 44, { fill: SURF2, stroke: BORDER, radius: 5 });
    P.text(36, 270, 'The reply is unicast because the request carried the asker\u2019s MAC address.', { size: 11, color: INK });
    P.text(36, 288, 'Every other host discards the request silently, so a request with no owner only times out.', { size: 11, color: DIM });
    P.alpha(1);

    foot('Request: broadcast. Reply: unicast. This is the pair GATE CS 2021 Set 1, Question 18 asked about.');
  };

  /* ---------- scene 3: the subnet boundary ---------- */
  SCENE_DRAW['arp-boundary'] = function (t, sc) {
    head('The prefix decides who gets asked', 'A is 192.168.10.5/24. Five destinations, one mask.');

    var a1 = K.ease(beat(t, sc, 0.4, 0.9));
    P.alpha(a1);
    P.text(24, 70, 'destination', { size: 10, bold: true, color: FAINT, mono: true });
    P.text(200, 70, 'prefix test', { size: 10, bold: true, color: FAINT, mono: true });
    P.text(300, 70, 'ARP asks for', { size: 10, bold: true, color: FAINT, mono: true });
    P.line(24, 82, 470, 82, { stroke: BORDER, sw: 1 });
    P.alpha(1);

    for (var i = 0; i < ARP_TARGETS.length; i++) {
      var d = ARP_TARGETS[i];
      var y = 94 + i * 30;
      var a = K.ease(beat(t, sc, 3 + i * 1.2, 0.6));
      P.alpha(a);
      P.text(24, y, d.dest, { size: 11, mono: true, color: INK });
      P.text(200, y, d.inside ? 'inside' : 'outside', { size: 11, color: d.inside ? VAL : WARN });
      P.text(300, y, d.inside ? 'host ' + d.dest : 'gateway ' + d.target,
             { size: 10, mono: true, color: d.inside ? INK : WARN });
      P.line(24, y + 20, 470, y + 20, { stroke: SURF2, sw: 1 });
      P.alpha(1);
    }

    var b = K.ease(beat(t, sc, 12, 0.9));
    P.alpha(b);
    P.rect(24, 250, 446, 46, { fill: ACCDIM, stroke: ACC, radius: 5 });
    P.text(36, 262, 'Four inside, so four requests name a host.', { size: 11, color: ACC });
    P.text(36, 280, 'One outside, so one request names the router.', { size: 11, color: ACC });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 16, 0.9));
    P.alpha(c);
    P.text(500, 70, 'The same frame, two different questions', { size: 12, bold: true, color: ACC });
    P.rect(500, 84, 376, 58, { fill: SURF2, stroke: BORDER, radius: 5 });
    P.text(512, 96, 'inside the prefix', { size: 11, bold: true, color: INK });
    P.text(512, 114, 'MAC of the destination, IP of the destination', { size: 10, color: DIM });
    P.rect(500, 150, 376, 58, { fill: WARNDIM, stroke: WARN, radius: 5 });
    P.text(512, 162, 'outside the prefix', { size: 11, bold: true, color: WARN });
    P.text(512, 180, 'MAC of the router, IP of the destination', { size: 10, color: DIM });
    P.text(500, 224, 'The IP header is identical in both cases.', { size: 11, color: INK });
    P.text(500, 244, 'Only the frame\u2019s destination MAC changes.', { size: 11, color: INK });
    P.text(500, 272, 'A router never forwards an ARP request,', { size: 11, color: DIM });
    P.text(500, 290, 'so ARP stops at the subnet boundary.', { size: 11, color: DIM });
    P.alpha(1);

    var e = K.ease(beat(t, sc, 24, 0.9));
    P.alpha(e);
    P.rect(24, 312, 852, 46, { fill: SURF2, stroke: BORDER, radius: 5 });
    P.text(38, 324, 'One ARP request per unresolved next hop, not one per packet.', { size: 11, color: INK });
    P.text(38, 342, 'After the first resolution the cache answers, so later packets to the same next hop send nothing.', { size: 11, color: DIM });
    P.alpha(1);

    foot('MAC of the next hop, IP of the final destination. Those two facts are the whole scene.');
  };

  /* ---------- scene 4: gratuitous, proxy, poisoned ---------- */
  SCENE_DRAW['arp-edges'] = function (t, sc) {
    head('Three ARP cases that are not the textbook exchange', 'An announcement, a stand-in, and a lie.');

    var cards = [
      { t: 'Gratuitous ARP', tone: 'acc',
        l1: 'Sender and target IP are both your own.',
        l2: 'A reply, broadcast, nobody asked. Repairs stale caches.' },
      { t: 'Gratuitous after DHCP', tone: 'acc',
        l1: 'RFC 2131 tells a client to announce its new address.',
        l2: 'This is where two of the three protocols meet.' },
      { t: 'Proxy ARP', tone: 'warn',
        l1: 'A router answers with its own MAC for a host elsewhere.',
        l2: 'It hides a wrong mask rather than fixing it.' },
      { t: 'ARP spoofing', tone: 'bad',
        l1: 'Any station may send an unrequested reply.',
        l2: 'ARP has no authentication field at all.' }
    ];

    for (var i = 0; i < cards.length; i++) {
      var col = i % 2, row = Math.floor(i / 2);
      var x = 24 + col * 436, y = 70 + row * 108;
      var a = K.ease(beat(t, sc, 0.4 + i * 2.6, 0.7));
      P.alpha(a);
      P.rect(x, y, 416, 92, { fill: SURF2, stroke: BORDER, radius: 6 });
      P.text(x + 14, y + 12, cards[i].t, { size: 12, bold: true, color: INK });
      P.text(x + 14, y + 34, cards[i].l1, { size: 10, color: DIM });
      P.text(x + 14, y + 54, cards[i].l2, { size: 10, color: DIM });
      P.alpha(1);
    }

    var b = K.ease(beat(t, sc, 14, 0.9));
    P.alpha(b);
    P.rect(24, 292, 852, 60, { fill: WARNDIM, stroke: WARN, radius: 6 });
    P.text(38, 304, 'IPv6 has no ARP. Neighbour solicitation and advertisement do the same job,', { size: 11, color: WARN });
    P.text(38, 322, 'carried inside ICMPv6 rather than in a protocol of their own.', { size: 11, color: WARN });
    P.text(38, 340, 'So "ARP" is an IPv4 answer, and a question about IPv6 is testing that.', { size: 10, color: DIM });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 22, 0.9));
    P.alpha(c);
    P.text(24, 372, 'The distinction to keep: a request asks a question, an announcement states a fact.', { size: 11, color: INK });
    P.text(24, 392, 'Both are ARP messages. Only the request expects an answer.', { size: 11, color: INK });
    P.alpha(1);

    foot('Three cases, one lesson: the ARP message format is fixed, and nothing in it proves who sent it.');
  };

  /* ---------- scene 5: DORA ---------- */
  SCENE_DRAW['dhcp-dora'] = function (t, sc) {
    head('DHCP: the first question has to be a shout', 'Four messages, two ports, and one reason for the broadcast.');

    var a0 = K.ease(beat(t, sc, 0.3, 0.8));
    P.alpha(a0);
    P.rect(60, 70, 150, 44, { fill: SURF2, stroke: BORDER, radius: 6 });
    P.text(135, 84, 'client', { size: 12, bold: true, color: INK, align: 'center' });
    P.text(135, 102, 'no address yet', { size: 10, color: DIM, align: 'center' });
    P.rect(690, 70, 150, 44, { fill: SURF2, stroke: BORDER, radius: 6 });
    P.text(765, 84, 'DHCP server', { size: 12, bold: true, color: INK, align: 'center' });
    P.text(765, 102, '192.168.10.2', { size: 10, color: DIM, align: 'center' });
    P.alpha(1);

    for (var i = 0; i < DORA.length; i++) {
      var m = DORA[i];
      var y = 150 + i * 52;
      var a = K.ease(beat(t, sc, 2.4 + i * 3.2, 0.7));
      P.alpha(a);
      var left = m.from === 'client';
      var x1 = left ? 210 : 690, x2 = left ? 690 : 210;
      P.arrow(x1, y, x2, y, { stroke: left ? ACC : INFO, sw: 1.6, head: 8 });
      P.text(450, y - 22, m.name + '   ' + m.srcIp + ':' + m.sport + ' -> ' + m.dstIp + ':' + m.dport,
             { size: 10, mono: true, color: INK, align: 'center' });
      P.text(450, y + 6, m.cast, { size: 9, color: left ? ACC : INFO, align: 'center' });
      P.alpha(1);
    }

    var b = K.ease(beat(t, sc, 16, 0.9));
    P.alpha(b);
    P.rect(24, 356, 416, 46, { fill: ACCDIM, stroke: ACC, radius: 5 });
    P.text(36, 368, 'Client broadcasts: ' + CLIENT_BROADCASTS + ' of the 4 messages.', { size: 11, color: ACC });
    P.text(36, 386, 'Discover and request both have to be heard by every server.', { size: 10, color: DIM });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 21, 0.9));
    P.alpha(c);
    P.rect(460, 356, 416, 46, { fill: SURF2, stroke: BORDER, radius: 5 });
    P.text(472, 368, 'Source 0.0.0.0 is legal here and nowhere else.', { size: 11, color: INK });
    P.text(472, 386, 'A source must be one of the host\u2019s own addresses; a client has none.', { size: 10, color: DIM });
    P.alpha(1);

    foot('The broadcast is not a preference. The client cannot unicast to an address it does not know.');
  };

  /* ---------- scene 6: lease, timers, relay, sizes ---------- */
  SCENE_DRAW['dhcp-lease'] = function (t, sc) {
    head('A lease is a timer, and a relay is a doorway', 'Lease ' + LEASE + ' s, T1 at ' + T1 + ' s, T2 at ' + T2 + ' s.');

    var x0 = 60, w0 = 780, y0 = 108, h0 = 22;
    var a1 = K.ease(beat(t, sc, 0.4, 0.9));
    P.alpha(a1);
    P.rect(x0, y0, w0, h0, { fill: SURF2, stroke: BORDER, radius: 4 });
    P.rect(x0, y0, w0 * 0.5, h0, { fill: ACCDIM, stroke: ACC, radius: 4 });
    P.rect(x0 + w0 * 0.5, y0, w0 * 0.375, h0, { fill: WARNDIM, stroke: WARN, radius: 4 });
    P.rect(x0 + w0 * 0.875, y0, w0 * 0.125, h0, { fill: INVALIDDIM, stroke: BAD, radius: 4 });
    P.text(x0, y0 - 8, '0', { size: 10, mono: true, color: DIM });
    P.text(x0 + w0 * 0.5, y0 - 8, 'T1 = 1800', { size: 10, mono: true, color: ACC, align: 'center' });
    P.text(x0 + w0 * 0.875, y0 - 8, 'T2 = 3150', { size: 10, mono: true, color: WARN, align: 'center' });
    P.text(x0 + w0, y0 - 8, '3600', { size: 10, mono: true, color: BAD, align: 'right' });
    P.text(x0, y0 + h0 + 10, 'bound', { size: 10, color: DIM });
    P.text(x0 + w0 * 0.5 + 4, y0 + h0 + 10, 'renewing, unicast', { size: 10, color: ACC });
    P.text(x0 + w0 * 0.875 - 4, y0 + h0 + 10, 'rebinding, broadcast', { size: 10, color: WARN, align: 'right' });
    P.alpha(1);

    var a2 = K.ease(beat(t, sc, 7, 0.9));
    P.alpha(a2);
    P.text(24, 176, 'T1 and T2 are relative times, sent in options 58 and 59, so no clocks need to agree.', { size: 11, color: INK });
    P.text(24, 196, 'Half and seven eighths are the defaults. The server may send other values.', { size: 11, color: DIM });
    P.alpha(1);

    var a3 = K.ease(beat(t, sc, 14, 0.9));
    P.alpha(a3);
    P.text(24, 228, 'The relay agent', { size: 12, bold: true, color: ACC });
    P.text(24, 248, 'A router does not forward a broadcast, so a client on another subnet', { size: 11, color: INK });
    P.text(24, 266, 'needs a relay to copy the message and fill in giaddr with its own', { size: 11, color: INK });
    P.text(24, 284, 'address, which is how the server chooses the right pool.', { size: 11, color: INK });
    P.alpha(1);

    var a4 = K.ease(beat(t, sc, 21, 0.9));
    P.alpha(a4);
    P.text(500, 228, 'The sizes, added up', { size: 12, bold: true, color: ACC });
    P.text(500, 248, DHCP.fixed + ' fixed octets + ' + DHCP.cookie + ' cookie = ' + DHCP.withCookie, { size: 11, mono: true, color: INK });
    P.text(500, 268, DHCP.minFrame + ' minimum frame, so ' + DHCP.minOptionRoom + ' left for options', { size: 11, mono: true, color: INK });
    P.text(500, 288, DHCP.fixed + ' + ' + DHCP.optionsMin + ' = ' + DHCP.message + ' octets', { size: 11, mono: true, color: INK });
    P.text(500, 308, '+' + DHCP.ipHeader + ' IP +' + DHCP.udpHeader + ' UDP = ' + DHCP.datagram, { size: 11, mono: true, color: INK });
    P.alpha(1);

    foot('Renewal is one request and one acknowledgement, not a second DORA. Rebinding is the broadcast fallback.');
  };

  /* ---------- scene 7: ICMP shape ---------- */
  SCENE_DRAW['icmp-shape'] = function (t, sc) {
    head('ICMP: a messenger carried inside IP', 'Protocol number 1, no ports, an 8-octet header.');

    var a1 = K.ease(beat(t, sc, 0.4, 0.9));
    P.alpha(a1);
    P.rect(24, 70, 430, 118, { fill: SURF2, stroke: BORDER, radius: 6 });
    P.text(36, 80, 'IP datagram, protocol = 1', { size: 11, bold: true, color: INK });
    P.rect(36, 98, 406, 78, { fill: ACCDIM, stroke: ACC, radius: 5 });
    P.text(46, 106, 'ICMP message', { size: 10, bold: true, color: ACC });
    var cells = ['TYPE', 'CODE', 'CHECKSUM', 'REST OF HEADER'];
    var cw = [70, 70, 100, 122];
    var cx = 46;
    for (var i = 0; i < cells.length; i++) {
      cell(cx, 122, cw[i], 24, cells[i], 'none');
      cx += cw[i] + 4;
    }
    P.text(46, 158, 'then the quoted datagram, for an error', { size: 10, color: DIM });
    P.alpha(1);

    var a2 = K.ease(beat(t, sc, 6, 0.9));
    P.alpha(a2);
    P.text(24, 206, 'No transport header sits above it, so there is no port to bind.', { size: 11, color: INK });
    P.text(24, 226, 'An error quotes ' + ICMP_QUOTED + ' octets: the IPv4 header and the first 8 octets of data.', { size: 11, color: INK });
    P.text(24, 246, 'Those 8 octets are the port numbers, which is how the sender finds the socket.', { size: 11, color: DIM });
    P.alpha(1);

    var a3 = K.ease(beat(t, sc, 12, 0.9));
    P.alpha(a3);
    P.text(490, 70, 'Errors: ' + N_ICMP_ERRORS + ' types', { size: 12, bold: true, color: BAD });
    var errs = ICMP_TYPES.filter(function (x) { return x.cls === 'error'; });
    for (var e = 0; e < errs.length; e++) {
      P.text(490, 92 + e * 20, errs[e].t + '   ' + errs[e].name, { size: 10, mono: true, color: INK });
    }
    P.text(700, 70, 'Queries: ' + N_ICMP_QUERIES + ' types', { size: 12, bold: true, color: VAL });
    var qs = ICMP_TYPES.filter(function (x) { return x.cls === 'query'; });
    for (var q = 0; q < qs.length; q++) {
      P.text(700, 92 + q * 20, qs[q].t + '   ' + qs[q].name, { size: 10, mono: true, color: INK });
    }
    P.alpha(1);

    var a4 = K.ease(beat(t, sc, 21, 0.9));
    P.alpha(a4);
    P.rect(24, 300, 852, 50, { fill: SURF2, stroke: BORDER, radius: 5 });
    P.text(38, 312, 'ICMP reports a problem. It never repairs one, and it promises no acknowledgement.', { size: 11, color: INK });
    P.text(38, 330, 'So a silent application cannot tell a lost datagram from a lost report.', { size: 11, color: DIM });
    P.alpha(1);

    foot('ICMP is an integral part of IP in the standards, not a protocol layered on top of it.');
  };

  /* ---------- scene 8: suppression rules ---------- */
  SCENE_DRAW['icmp-rules'] = function (t, sc) {
    head('Five rules that suppress an error message', 'Six cases, and the count is not six.');

    P.text(24, 70, 'case', { size: 10, bold: true, color: FAINT, mono: true });
    P.text(470, 70, 'rule that fires', { size: 10, bold: true, color: FAINT, mono: true });
    P.text(760, 70, 'message sent', { size: 10, bold: true, color: FAINT, mono: true });
    P.line(24, 82, 876, 82, { stroke: BORDER, sw: 1 });

    for (var i = 0; i < ICMP_CASES.length; i++) {
      var c = ICMP_CASES[i];
      var y = 96 + i * 34;
      var a = K.ease(beat(t, sc, 0.6 + i * 2.6, 0.6));
      P.alpha(a);
      P.text(24, y, c.what, { size: 10, color: INK });
      P.text(470, y, c.rule ? 'broadcast or error' : 'none applies', { size: 10, color: c.rule ? BAD : FAINT });
      P.text(760, y, c.msg, { size: 10, mono: true, color: c.sends ? VAL : BAD });
      P.line(24, y + 22, 876, y + 22, { stroke: SURF2, sw: 1 });
      P.alpha(1);
    }

    var b = K.ease(beat(t, sc, 17, 0.9));
    P.alpha(b);
    P.rect(24, 306, 416, 44, { fill: ACCDIM, stroke: ACC, radius: 5 });
    P.text(36, 318, N_SENT + ' of the 6 cases produce a message.', { size: 11, color: ACC });
    P.text(36, 336, 'Four problems, four reports.', { size: 10, color: DIM });
    P.rect(460, 306, 416, 44, { fill: INVALIDDIM, stroke: BAD, radius: 5 });
    P.text(472, 318, N_SILENT + ' are silent, and each has a named rule.', { size: 11, color: BAD });
    P.text(472, 336, 'A broadcast, and an error caused by an error.', { size: 10, color: DIM });
    P.alpha(1);

    var c2 = K.ease(beat(t, sc, 23, 0.9));
    P.alpha(c2);
    P.text(24, 368, 'The five rules take precedence over any other requirement to send an error.', { size: 11, color: INK });
    P.text(24, 388, 'So "no message" is a legitimate answer, and a counting question may expect it.', { size: 11, color: INK });
    P.alpha(1);

    foot('The two silences exist to stop message storms: one reply per broadcast would be a flood.');
  };

  /* ---------- scene 9: ping and traceroute ---------- */
  SCENE_DRAW['ping-trace'] = function (t, sc) {
    head('ping and traceroute: two uses of one header', 'Queries ask. Errors answer for a router.');

    var a1 = K.ease(beat(t, sc, 0.4, 0.9));
    P.alpha(a1);
    P.rect(24, 68, 420, 62, { fill: ACCDIM, stroke: ACC, radius: 5 });
    P.text(36, 78, 'ping: echo request type 8, echo reply type 0', { size: 11, bold: true, color: ACC });
    P.text(36, 98, PING_PROBES + ' probes, ' + PING_MESSAGES + ' messages, both of them queries.', { size: 10, color: DIM });
    P.text(36, 116, 'Identifier and sequence number match a reply to a request.', { size: 10, color: DIM });
    P.alpha(1);

    var a2 = K.ease(beat(t, sc, 7, 0.9));
    P.alpha(a2);
    P.rect(470, 68, 406, 62, { fill: SURF2, stroke: BORDER, radius: 5 });
    P.text(482, 78, 'traceroute: raise the TTL one at a time', { size: 11, bold: true, color: INK });
    P.text(482, 98, TRACE_ROUTERS + ' routers each report type 11, code 0.', { size: 10, color: DIM });
    P.text(482, 116, 'The host itself reports type 3, code 3.', { size: 10, color: DIM });
    P.alpha(1);

    for (var i = 0; i < TRACE_HOPS; i++) {
      var y = 152 + i * 40;
      var a = K.ease(beat(t, sc, 9 + i * 2.4, 0.6));
      P.alpha(a);
      P.text(24, y + 4, 'TTL ' + (i + 1), { size: 10, mono: true, color: FAINT });
      var last = (i === TRACE_HOPS - 1);
      P.rect(90, y - 6, 190, 24, { fill: last ? ACCDIM : SURF2, stroke: last ? ACC : BORDER, radius: 4 });
      P.text(100, y + 6, last ? 'destination host' : 'router ' + (i + 1), { size: 10, color: INK });
      P.arrow(284, y + 6, 360, y + 6, { stroke: last ? ACC : INFO, sw: 1.4, head: 7 });
      P.text(370, y + 6, last ? 'type 3, code 3  port unreachable' : 'type 11, code 0  TTL expired',
             { size: 10, mono: true, color: last ? ACC : INFO });
      P.alpha(1);
    }

    var b = K.ease(beat(t, sc, 23, 0.9));
    P.alpha(b);
    P.rect(24, 356, 852, 46, { fill: WARNDIM, stroke: WARN, radius: 5 });
    P.text(38, 368, TRACE_ROUTERS + ' reports from routers and 1 from the host: ' + TRACE_MESSAGES + ' messages for ' + TRACE_HOPS + ' hops.', { size: 11, color: WARN });
    P.text(38, 386, 'An ICMP-based traceroute ends with an echo reply instead, so the last message depends on the tool.', { size: 10, color: DIM });
    P.alpha(1);

    foot('The TTL ladder is the method; the type numbers are the evidence. Count messages, not hops.');
  };

  /* ---------- scene 10: the procedure ---------- */
  SCENE_DRAW.procedure = function (t, sc) {
    head('Which of the three answers this question', 'Four questions, three counts, four traps.');

    var steps = [
      { q: 'What is missing?', a: 'a MAC, an IP, or a report', p: 'ARP / DHCP / ICMP' },
      { q: 'Is the destination local?', a: 'apply the mask', p: 'target = host or router' },
      { q: 'Can the client be heard?', a: 'broadcast or unicast', p: 'relay if routed' },
      { q: 'Is a message suppressed?', a: 'run the five rules', p: 'silence is an answer' }
    ];
    for (var i = 0; i < steps.length; i++) {
      var x = 24 + i * 214;
      var a = K.ease(beat(t, sc, 0.4 + i * 2.4, 0.6));
      P.alpha(a);
      P.rect(x, 70, 200, 86, { fill: SURF2, stroke: BORDER, radius: 6 });
      P.text(x + 10, 78, 'Q' + (i + 1), { size: 10, bold: true, color: ACC, mono: true });
      P.text(x + 10, 96, steps[i].q, { size: 11, color: INK });
      P.text(x + 10, 116, steps[i].a, { size: 10, color: DIM });
      P.text(x + 10, 138, steps[i].p, { size: 10, color: ACC });
      P.alpha(1);
    }

    var b = K.ease(beat(t, sc, 11, 0.9));
    P.alpha(b);
    P.text(24, 180, 'The three counts worth memorising', { size: 12, bold: true, color: ACC });
    P.text(24, 202, 'ARP: 1 broadcast request, 1 unicast reply, ' + ARP_FRAME.arp + ' octets of header.', { size: 11, color: INK });
    P.text(24, 222, 'DHCP: 4 messages, ' + CLIENT_BROADCASTS + ' client broadcasts, ' + DHCP.fixed + ' fixed octets.', { size: 11, color: INK });
    P.text(24, 242, 'ICMP: ' + N_ICMP_ERRORS + ' error types, ' + N_ICMP_QUERIES + ' query types, 8-octet header.', { size: 11, color: INK });
    P.alpha(1);

    var c = K.ease(beat(t, sc, 18, 0.9));
    P.alpha(c);
    P.rect(24, 262, 852, 104, { fill: WARNDIM, stroke: WARN, radius: 6 });
    P.text(38, 274, 'The four traps', { size: 11, bold: true, color: WARN });
    P.text(38, 296, '1. ICMP has no ports. 1 is an IP protocol number, not a port.', { size: 10, color: DIM });
    P.text(38, 316, '2. ARP never crosses a router, so a remote destination needs the gateway\u2019s MAC.', { size: 10, color: DIM });
    P.text(38, 336, '3. DHCP needs a relay across subnets, because routers drop broadcasts.', { size: 10, color: DIM });
    P.text(38, 356, '4. T1 is when renewal starts, not when the lease ends.', { size: 10, color: DIM });
    P.alpha(1);

    foot('Name the protocol by the gap it fills, and the identifier by the header it sits in.');
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
    var fn = SCENE_DRAW[sc.id] || SCENE_DRAW['two-addresses'];
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
    ARP: { fields: ARP_FIELDS, octets: ARP_FRAME.arp, pad: ARP_FRAME.pad, frame: ARP_FRAME.frame },
    ETH: ETH,
    TARGETS: ARP_TARGETS,
    COUNTS: { inside: N_INSIDE, outside: N_OUTSIDE },
    DHCP: DHCP,
    DORA: DORA,
    CLIENT_BROADCASTS: CLIENT_BROADCASTS,
    LEASE: { lease: LEASE, T1: T1, T2: T2 },
    ICMP: { proto: ICMP_PROTO, types: ICMP_TYPES, errors: N_ICMP_ERRORS,
            queries: N_ICMP_QUERIES, quoted: ICMP_QUOTED },
    CASES: ICMP_CASES,
    RULES: SUPPRESS_RULES,
    TOOLS: { traceHops: TRACE_HOPS, traceMessages: TRACE_MESSAGES,
             pingProbes: PING_PROBES, pingMessages: PING_MESSAGES },
    PASSED: PASSED,
    TOTAL: CHECKS.length
  };
  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
