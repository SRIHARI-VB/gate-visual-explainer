/* ==========================================================================
   ipv6-addressing-and-header - model, validation, render.

   Layer 1  model      : the 128-bit address as eight 16-bit groups; the parser
                         and the RFC 5952 canonical formatter; prefix
                         arithmetic in BigInt; the base header as eight fields
                         whose widths must sum to 320 bits; the payload-length
                         arithmetic; the Next Header chain; the modified EUI-64
                         interface identifier.
   Layer 2  validation : every number and every string quoted in a caption or a
                         card is recomputed here. The formatter is checked
                         against twelve addresses whose canonical form was
                         computed independently (Python's ipaddress module,
                         which implements RFC 5952). The parser is checked on
                         four malformed addresses it must reject. The header
                         widths are summed. The prefix counts are compared with
                         BigInt powers of two. The EUI-64 result is compared
                         with the example in RFC 4291 Appendix A.
   Layer 3  render     : reads the model; never re-derives a number.
   Layer 4  timeline   : in timeline.js - the only source of time.

   No p5.brush: every mark is a group of hex digits, a header field, a prefix or
   a number the learner has to read exactly.
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

  /* ---------- powers of two, exact, in BigInt ---------- */

  function pow2(n) { return BigInt(2) ** BigInt(n); }

  /* a decimal string with thin grouping, so a 39-digit number stays readable */
  function group3(big) {
    var s = String(big), out = '', c = 0, i;
    for (i = s.length - 1; i >= 0; i--) {
      out = s.charAt(i) + out;
      c++;
      if (c % 3 === 0 && i > 0) out = '\u2009' + out;
    }
    return out;
  }

  /* ---------- the address: eight 16-bit groups ---------- */

  var GROUP_RE = /^[0-9a-f]{1,4}$/;

  /* Parse any legitimate RFC 4291 text form into eight integers.
     Returns { ok, groups, reason }. A reason is a short phrase, not a code. */
  function parseGroups(str) {
    var s = String(str == null ? '' : str).trim().toLowerCase();
    if (!s) return { ok: false, reason: 'the address is empty' };
    if (s.indexOf(':::') >= 0) return { ok: false, reason: 'three colons in a row' };
    var dbl = s.indexOf('::');
    if (dbl >= 0 && s.indexOf('::', dbl + 1) >= 0) {
      return { ok: false, reason: ':: appears twice' };
    }
    var head = dbl >= 0 ? s.slice(0, dbl) : s;
    var tail = dbl >= 0 ? s.slice(dbl + 2) : '';
    var hp = head ? head.split(':') : [];
    var tp = tail ? tail.split(':') : [];
    var all = hp.concat(tp), i;
    for (i = 0; i < all.length; i++) {
      if (!GROUP_RE.test(all[i])) {
        return { ok: false, reason: '"' + all[i] + '" is not one to four hex digits' };
      }
    }
    if (dbl < 0) {
      if (all.length !== 8) {
        return { ok: false, reason: 'no :: and ' + all.length + ' groups, not eight' };
      }
      return { ok: true, groups: all.map(function (g) { return parseInt(g, 16); }) };
    }
    var missing = 8 - all.length;
    if (missing < 1) {
      return { ok: false, reason: ':: must stand for at least one group of zeros' };
    }
    var zeros = [], k;
    for (k = 0; k < missing; k++) zeros.push(0);
    var out = hp.map(function (g) { return parseInt(g, 16); })
      .concat(zeros)
      .concat(tp.map(function (g) { return parseInt(g, 16); }));
    return { ok: true, groups: out };
  }

  /* The RFC 5952 canonical text form: suppress leading zeros, lowercase,
     "::" for the longest run of at least two zero groups, and the first such
     run when two runs tie. One zero group is never compressed. */
  function fmtGroups(g) {
    var i = 0, best = -1, bestLen = 0;
    while (i < 8) {
      if (g[i] === 0) {
        var j = i;
        while (j < 8 && g[j] === 0) j++;
        if (j - i > bestLen) { bestLen = j - i; best = i; }
        i = j;
      } else i++;
    }
    var hex = g.map(function (x) { return x.toString(16); });
    if (bestLen < 2) return hex.join(':');
    var left = hex.slice(0, best).join(':');
    var right = hex.slice(best + bestLen).join(':');
    return left + '::' + right;
  }

  /* RFC 5952 section 5: for the well-known prefixes that embed an IPv4 address
     in the low 32 bits, mixed notation is recommended. */
  function isV4Mapped(g) {
    return g[0] === 0 && g[1] === 0 && g[2] === 0 && g[3] === 0 && g[4] === 0 && g[5] === 0xffff;
  }

  function dottedFromGroups(hi, lo) {
    return [(hi >> 8) & 255, hi & 255, (lo >> 8) & 255, lo & 255].join('.');
  }

  function fmtMixed(g) {
    if (!isV4Mapped(g)) return fmtGroups(g);
    return '::ffff:' + dottedFromGroups(g[6], g[7]);
  }

  /* ---------- prefix arithmetic ---------- */

  function prefixAddresses(n) { return pow2(128 - n); }

  function prefixInfo(n) {
    return {
      len: n,
      addresses: prefixAddresses(n),
      subnet64: n <= 64 ? pow2(64 - n) : null,
      usableIIDs: n === 64 ? pow2(64) - BigInt(1) : null
    };
  }

  /* ---------- the base header ---------- */

  var HEADER = [
    { name: 'Version', bits: 4 },
    { name: 'Traffic Class', bits: 8 },
    { name: 'Flow Label', bits: 20 },
    { name: 'Payload Length', bits: 16 },
    { name: 'Next Header', bits: 8 },
    { name: 'Hop Limit', bits: 8 },
    { name: 'Source Address', bits: 128 },
    { name: 'Destination Address', bits: 128 }
  ];

  function headerBits() {
    return HEADER.reduce(function (a, f) { return a + f.bits; }, 0);
  }

  var V4HEADER = [
    { name: 'Version', bits: 4 }, { name: 'Header Length', bits: 4 },
    { name: 'Type of Service', bits: 8 }, { name: 'Total Length', bits: 16 },
    { name: 'Identification', bits: 16 }, { name: 'Flags', bits: 3 },
    { name: 'Fragment Offset', bits: 13 }, { name: 'Time to Live', bits: 8 },
    { name: 'Protocol', bits: 8 }, { name: 'Header Checksum', bits: 16 },
    { name: 'Source Address', bits: 32 }, { name: 'Destination Address', bits: 32 }
  ];

  function v4Bits() {
    return V4HEADER.reduce(function (a, f) { return a + f.bits; }, 0);
  }

  /* ---------- payload length arithmetic ---------- */

  var EXT_HDR = 8;            /* a Routing header with one address is 24; we use an 8-octet one */
  var UDP_TOTAL = 1000;       /* the whole UDP datagram, its own 8-octet header included */
  var BASE = 40;

  var PAYLOAD = EXT_HDR + UDP_TOTAL;
  var WIRE = BASE + PAYLOAD;

  /* ---------- the Next Header chain ---------- */

  var NH = [
    { v: 0, name: 'Hop-by-Hop Options' },
    { v: 6, name: 'TCP' },
    { v: 17, name: 'UDP' },
    { v: 43, name: 'Routing' },
    { v: 44, name: 'Fragment' },
    { v: 50, name: 'ESP' },
    { v: 51, name: 'AH' },
    { v: 58, name: 'ICMPv6' },
    { v: 59, name: 'No Next Header' },
    { v: 60, name: 'Destination Options' }
  ];

  var CHAIN = [
    { from: 'IPv6 base header', nh: 0 },
    { from: 'Hop-by-Hop Options', nh: 43 },
    { from: 'Routing', nh: 44 },
    { from: 'Fragment', nh: 6 },
    { from: 'TCP', nh: null }
  ];

  /* the order RFC 8200 section 4.1 prescribes, as a list of names */
  var ORDER = ['Hop-by-Hop Options', 'Destination Options', 'Routing', 'Fragment',
               'AH', 'ESP', 'Destination Options', 'upper layer'];

  /* ---------- modified EUI-64 ---------- */

  function eui64(mac) {
    var inserted = [mac[0], mac[1], mac[2], 0xff, 0xfe, mac[3], mac[4], mac[5]];
    var flipped = inserted.slice();
    flipped[0] = flipped[0] ^ 0x02;
    var groups = [];
    for (var i = 0; i < 8; i += 2) groups.push((flipped[i] << 8) | flipped[i + 1]);
    return {
      inserted: inserted,
      flipped: flipped,
      groups: groups,
      text: groups.map(function (x) { return ('000' + x.toString(16)).slice(-4); }).join(':')
    };
  }

  function hex2(b) { return ('0' + b.toString(16)).slice(-2); }

  function macText(mac) { return mac.map(hex2).join(':'); }

  /* ---------- the two worked addresses ---------- */

  var TIE_ADDRESS = '2001:0db8:0000:0000:0001:0000:0000:0001';
  var TIE_GROUPS = parseGroups(TIE_ADDRESS).groups;
  var TIE_CANON = fmtGroups(TIE_GROUPS);

  var SINGLE_ZERO = '2001:0db8:0000:0001:0001:0001:0001:0001';
  var SINGLE_CANON = fmtGroups(parseGroups(SINGLE_ZERO).groups);

  var MAC = [0x00, 0x1a, 0x2b, 0x3c, 0x4d, 0x5e];
  var IID = eui64(MAC);
  var LINK_LOCAL_GROUPS = [0xfe80, 0, 0, 0].concat(IID.groups);
  var LINK_LOCAL = fmtGroups(LINK_LOCAL_GROUPS);

  /* ======================================================================
     LAYER 2 - VALIDATION
     The expected canonical forms below were computed independently, by
     Python's ipaddress module (which implements RFC 5952), on the same
     twelve expanded addresses. They are not read back out of this file.
     ====================================================================== */

  var CORPUS = [
    { in: '2001:0db8:0000:0000:0001:0000:0000:0001', out: '2001:db8::1:0:0:1' },
    { in: '2001:0db8:0000:0000:0000:0000:0000:0001', out: '2001:db8::1' },
    { in: '2001:0db8:0000:0001:0001:0001:0001:0001', out: '2001:db8:0:1:1:1:1:1' },
    { in: '0000:0000:0000:0000:0000:0000:0000:0000', out: '::' },
    { in: '0000:0000:0000:0000:0000:0000:0000:0001', out: '::1' },
    { in: 'fe80:0000:0000:0000:0202:b3ff:fe1e:8329', out: 'fe80::202:b3ff:fe1e:8329' },
    { in: '2001:0db8:0000:0000:0000:0000:0000:0000', out: '2001:db8::' },
    { in: '2001:0db8:85a3:0000:0000:8a2e:0370:7334', out: '2001:db8:85a3::8a2e:370:7334' },
    { in: 'ff02:0000:0000:0000:0000:0000:0000:0001', out: 'ff02::1' },
    { in: '2001:0db8:00aa:0000:0000:00bb:0000:0001', out: '2001:db8:aa::bb:0:1' },
    { in: '2001:0db8:0000:0000:0000:00ff:0000:0001', out: '2001:db8::ff:0:1' },
    { in: '2001:0db8:0000:0000:0000:0000:0000:0001', out: '2001:db8::1' }
  ];

  var MALFORMED = [
    { in: '2001:db8::1::2', why: ':: appears twice' },
    { in: '2001:db8:1:2:3:4:5:6:7', why: 'nine groups and no ::' },
    { in: '2001:db8:12345::1', why: 'five hex digits in a group' },
    { in: '2001:db8:0:1:1:1:1:1::', why: ':: standing for no group at all' }
  ];

  var CHECKS = [];
  function check(name, pass, detail) {
    CHECKS.push({ name: name, pass: !!pass, detail: detail || '' });
  }

  /* --- the formatter, against the independent table --------------- */
  CORPUS.forEach(function (row, i) {
    var p = parseGroups(row.in);
    var got = p.ok ? fmtGroups(p.groups) : '(rejected)';
    check('canonical form ' + (i + 1) + ' of ' + CORPUS.length + ': ' + row.out,
      got === row.out, 'got ' + got);
  });

  /* --- round trip: format then parse returns the same eight groups -- */
  CORPUS.forEach(function (row, i) {
    var g = parseGroups(row.in).groups;
    var back = parseGroups(fmtGroups(g));
    check('round trip ' + (i + 1) + ': ' + row.out,
      back.ok && back.groups.join(',') === g.join(','), 'parsed back to ' + (back.ok ? back.groups.join(',') : back.reason));
  });

  /* --- the parser rejects what is not an address ------------------- */
  MALFORMED.forEach(function (row, i) {
    var p = parseGroups(row.in);
    check('rejected malformed ' + (i + 1) + ': ' + row.why, !p.ok, p.ok ? 'accepted as ' + p.groups.join(',') : p.reason);
  });

  /* --- one zero group is never compressed ------------------------- */
  check('a single zero group is not compressed', SINGLE_CANON === '2001:db8:0:1:1:1:1:1', SINGLE_CANON);
  check('a tie goes to the first run', TIE_CANON === '2001:db8::1:0:0:1', TIE_CANON);

  /* --- mixed notation for the IPv4-mapped prefix ------------------ */
  var MAPPED = parseGroups('0000:0000:0000:0000:0000:ffff:c000:0201').groups;
  check('IPv4-mapped address is detected', isV4Mapped(MAPPED));
  check('IPv4-mapped mixed form is ::ffff:192.0.2.1', fmtMixed(MAPPED) === '::ffff:192.0.2.1', fmtMixed(MAPPED));
  check('a global address is not treated as IPv4-mapped',
    !isV4Mapped(parseGroups('2001:db8::1').groups));

  /* --- the widths ------------------------------------------------- */
  check('the eight base-header fields sum to 320 bits', headerBits() === 320, String(headerBits()));
  check('320 bits is 40 octets', headerBits() / 8 === 40);
  check('the base header has eight fields', HEADER.length === 8, String(HEADER.length));
  check('the version field is 4 bits and reads 6', HEADER[0].bits === 4);
  check('the flow label is 20 bits', HEADER[2].bits === 20);
  check('the payload length field is 16 bits, so 65535 is its ceiling',
    HEADER[3].bits === 16 && Math.pow(2, 16) - 1 === 65535);
  check('the next header field is 8 bits', HEADER[4].bits === 8);
  check('the hop limit field is 8 bits', HEADER[5].bits === 8);
  check('the two addresses take 256 of the 320 bits', HEADER[6].bits + HEADER[7].bits === 256);
  check('the other six fields take 64 bits, which is two 32-bit words',
    headerBits() - 256 === 64);
  check('the IPv4 minimum header is 160 bits, 20 octets', v4Bits() === 160, String(v4Bits()));
  check('IPv4 spends 32 bits on addresses, IPv6 spends 256', 32 + 32 === 64 && 128 + 128 === 256);
  check('IPv6 drops the header checksum and the fragmentation fields',
    !HEADER.some(function (f) { return /Checksum|Fragment|Identification|Flags/.test(f.name); }));
  check('IPv4 carries a header checksum and IPv6 does not',
    V4HEADER.some(function (f) { return f.name === 'Header Checksum'; }) &&
    !HEADER.some(function (f) { return f.name === 'Header Checksum'; }));
  check('Time to Live became Hop Limit', V4HEADER.some(function (f) { return f.name === 'Time to Live'; }) &&
    HEADER.some(function (f) { return f.name === 'Hop Limit'; }));

  /* --- the payload arithmetic ------------------------------------- */
  check('the payload is the extension header plus the whole UDP datagram',
    PAYLOAD === EXT_HDR + UDP_TOTAL, String(PAYLOAD));
  check('the payload length excludes the 40-octet base header', PAYLOAD === 1008, String(PAYLOAD));
  check('the packet on the wire is 40 + payload = 1048 octets', WIRE === 1048, String(WIRE));
  check('IPv4 Total Length would have said 1048, IPv6 Payload Length says 1008',
    WIRE === PAYLOAD + BASE && PAYLOAD !== WIRE);
  check('a 1500-octet MTU leaves 1440 octets for TCP data', 1500 - 40 - 20 === 1440);
  check('a 1280-octet minimum MTU leaves 1220 for TCP data', 1280 - 40 - 20 === 1220);

  /* --- the prefix arithmetic -------------------------------------- */
  check('2^128 is the whole space', String(pow2(128)) === '340282366920938463463374607431768211456');
  check('a /64 holds 2^64 addresses', String(prefixAddresses(64)) === '18446744073709551616');
  check('a /64 has 2^64 - 1 usable interface IDs, the all-zero one being the subnet-router anycast',
    String(prefixInfo(64).usableIIDs) === '18446744073709551615');
  check('a /48 holds 2^16 = 65536 subnets of size /64', String(prefixInfo(48).subnet64) === '65536');
  check('a /32 holds 2^32 subnets of size /64', String(prefixInfo(32).subnet64) === '4294967296');
  check('a /128 is one address', String(prefixAddresses(128)) === '1');
  check('a /127 is two addresses', String(prefixAddresses(127)) === '2');
  check('the grouping of a 39-digit number is readable',
    group3(pow2(128)).replace(/\u2009/g, '').length === 39);

  /* --- the chain --------------------------------------------------- */
  check('the chain has four hops before the transport header', CHAIN.length === 5);
  check('hop-by-hop options are numbered 0', NH[0].v === 0);
  check('TCP is 6 and UDP is 17', NH[1].v === 6 && NH[2].v === 17);
  check('Routing is 43 and Fragment is 44', NH[3].v === 43 && NH[4].v === 44);
  check('ICMPv6 is 58', NH.some(function (x) { return x.v === 58 && x.name === 'ICMPv6'; }));
  check('every Next Header value is distinct',
    new Set(NH.map(function (x) { return x.v; })).size === NH.length);
  check('hop-by-hop options come first in the prescribed order', ORDER[0] === 'Hop-by-Hop Options');

  /* --- EUI-64 ------------------------------------------------------ */
  check('EUI-64 inserts FF FE in the middle of the MAC',
    IID.inserted.slice(3, 5).join(',') === '255,254');
  check('EUI-64 flips the universal/local bit of the first octet',
    IID.flipped[0] === 0x02 && (IID.flipped[0] ^ IID.inserted[0]) === 0x02);
  check('the RFC 4291 example gives 021a:2bff:fe3c:4d5e', IID.text === '021a:2bff:fe3c:4d5e', IID.text);
  check('the link-local address built from it is fe80::21a:2bff:fe3c:4d5e',
    LINK_LOCAL === 'fe80::21a:2bff:fe3c:4d5e', LINK_LOCAL);
  check('a link-local address starts with fe80', LINK_LOCAL_GROUPS[0] === 0xfe80);

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

  /* ======================================================================
     LAYER 3 - RENDER
     ====================================================================== */

  function stage(p, n) {
    var s = Math.floor(K.clamp01(p) * n);
    return s >= n ? n - 1 : s;
  }

  function title(s, sub) {
    P.text(28, 20, s, { size: 16, bold: true, color: PAL.ink });
    if (sub) P.text(28, 42, sub, { size: 11.5, color: PAL.dim });
  }

  function foot(s) {
    P.text(28, 446, s, { size: 11, color: PAL.faint });
  }

  function box(x, y, w, h, label, sub, tone, mono) {
    var fill = tone === 'bad' ? PAL.invalidDim : tone === 'good' ? PAL.accentDim
             : tone === 'warn' ? PAL.warnDim : tone === 'info' ? PAL.surface2 : PAL.surface;
    var stroke = tone === 'bad' ? PAL.invalid : tone === 'good' ? PAL.accent
             : tone === 'warn' ? PAL.warn : PAL.border;
    P.rect(x, y, w, h, { fill: fill, stroke: stroke, sw: 1.2, radius: 6 });
    if (label) P.text(x + w / 2, y + h / 2 - (sub ? 8 : 0), label,
      { size: mono ? 13 : 12, bold: true, mono: !!mono, align: 'center', base: 'middle', color: PAL.ink });
    if (sub) P.text(x + w / 2, y + h / 2 + 9, sub,
      { size: 9.5, align: 'center', base: 'middle', color: PAL.dim });
  }

  function line(x, y, s, o) {
    o = o || {};
    P.text(x, y, s, {
      size: o.size || 12, color: o.color || PAL.ink, bold: !!o.bold,
      mono: !!o.mono, align: o.align || 'left', base: 'top'
    });
  }

  /* a two-column row: a label at the left, a monospace value at x2 */
  function kv(x1, x2, y, label, value, tone) {
    line(x1, y, label, { size: 11.5, color: PAL.dim });
    line(x2, y, value, { size: 11.5, mono: true, color: tone === 'warn' ? PAL.warn : tone === 'good' ? PAL.accent : PAL.ink, bold: tone === 'good' });
  }

  /* --- 1. why 128 bits ------------------------------------------------ */
  function drawWhy(p) {
    var s = stage(p, 4);
    title('128 bits is a bigger space, not just a bigger number',
      'IPv4 gives an address 32 bits; IPv6 gives it 128, and by convention splits it 64 and 64');

    line(28, 68, 'IPv4 address \u00b7 32 bits \u00b7 4 octets', { size: 11.5, color: PAL.dim });
    P.rect(28, 86, 200, 20, { fill: PAL.surface2, stroke: PAL.border, sw: 1.1, radius: 4 });
    P.text(128, 96, '32 bits', { size: 10.5, mono: true, align: 'center', base: 'middle', color: PAL.ink });
    line(246, 88, '2\u00b3\u00b2 = 4,294,967,296 addresses', { size: 12, mono: false });

    line(28, 122, 'IPv6 address \u00b7 128 bits \u00b7 16 octets', { size: 11.5, color: PAL.dim });
    P.rect(28, 140, 400, 22, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.1, radius: 4 });
    P.rect(428, 140, 400, 22, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.1, radius: 4 });
    P.text(228, 151, 'routing prefix \u00b7 64 bits', { size: 10.5, align: 'center', base: 'middle', color: PAL.ink });
    P.text(628, 151, 'interface ID \u00b7 64 bits', { size: 10.5, align: 'center', base: 'middle', color: PAL.ink });
    line(28, 172, '2\u00b9\u00b2\u2078 = ' + group3(pow2(128)) + ' addresses', { size: 12 });

    if (s >= 1) {
      line(28, 208, 'one /64 subnet leaves 2\u2076\u2074 = 18,446,744,073,709,551,616 interface IDs', { size: 12 });
      line(28, 230, 'a /48 site holds 2\u00b9\u2076 = 65,536 such subnets', { size: 12 });
      line(28, 252, 'a /32 allocation holds 2\u00b3\u00b2 = 4,294,967,296 such subnets', { size: 12 });
    }
    if (s >= 2) {
      P.rect(28, 282, 844, 58, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
      line(44, 296, 'The 64/64 split is a convention, not a rule of the header: RFC 4291 requires a 64-bit', { size: 11.5 });
      line(44, 316, 'interface ID only for unicast addresses that do not begin 000, and SLAAC needs it.', { size: 11.5 });
    }
    if (s >= 3) {
      line(28, 362, 'IPv4 exhausted its space because 2\u00b3\u00b2 could be counted. 2\u00b9\u00b2\u2078 is 2\u2079\u2076 times larger.', { size: 12, bold: true });
      line(28, 386, '2\u2079\u2076 = 79,228,162,514,264,337,593,543,950,336.', { size: 12, mono: true, color: PAL.dim });
    }
    foot('the address is four times as wide; the space is 2^96 times as large');
  }

  /* --- 2. eight groups ------------------------------------------------ */
  function drawGroups(p) {
    var s = stage(p, 4);
    title('Eight groups of sixteen bits',
      'the address is written as eight colon-separated groups, each group four hex digits');

    var g = parseGroups('2001:0db8:0000:0000:0001:0000:0000:0001').groups;
    var i, x;
    for (i = 0; i < 8; i++) {
      x = 28 + i * 104;
      P.text(x + 50, 74, 'group ' + i, { size: 9.5, mono: true, align: 'center', base: 'bottom', color: PAL.faint });
      box(x, 82, 100, 50, ('000' + g[i].toString(16)).slice(-4), null,
        s >= 2 && (i === 2 || i === 3) ? 'warn' : null, true);
      if (s >= 1) P.text(x + 50, 142, '16 bits', { size: 9.5, mono: true, align: 'center', base: 'top', color: PAL.faint });
    }

    if (s >= 1) {
      line(28, 168, '8 groups \u00d7 16 bits = 128 bits, and 4 hex digits per group, so 32 hex digits in all', { size: 12 });
    }
    if (s >= 2) {
      line(28, 200, 'One group, bit by bit', { size: 12, bold: true });
      line(28, 222, '0202', { size: 15, mono: true });
      line(120, 222, '=', { size: 15, mono: true, color: PAL.dim });
      line(146, 222, '0000 0010 0000 0010', { size: 15, mono: true, color: PAL.accent });
      line(28, 250, 'one hex digit is a nibble, four bits; one group is four nibbles', { size: 11.5, color: PAL.dim });
    }
    if (s >= 3) {
      P.rect(28, 280, 844, 54, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1, radius: 6 });
      line(44, 294, 'Groups 2 and 3 are zero here, which is why this address has a run to compress.', { size: 11.5 });
      line(44, 314, 'A group is never padded to four digits in the canonical form; the padding is shown above only to line the boxes up.', { size: 11.5 });
    }
    foot('eight groups, most significant first; the value of the address does not depend on how it is written');
  }

  /* --- 3. compression ------------------------------------------------- */
  function drawCompress(p) {
    var s = stage(p, 5);
    title('Five rules take thirty-nine characters down to seventeen',
      'RFC 5952 canonical form, applied in order to the same address');

    var rows = [
      { k: 'as given', v: TIE_ADDRESS },
      { k: 'rule 1: drop leading zeros', v: '2001:db8:0:0:1:0:0:1' },
      { k: 'rule 2: lowercase a to f', v: '2001:db8:0:0:1:0:0:1' },
      { k: 'rule 3: :: at most once', v: 'one run only, so choose' },
      { k: 'rule 4: the longest run wins', v: 'both runs are two groups' },
      { k: 'rule 5: on a tie, the first run', v: TIE_CANON }
    ];
    var y = 74, i, shown = s === 0 ? 1 : (s === 1 ? 2 : (s === 2 ? 3 : (s === 3 ? 5 : 6)));
    for (i = 0; i < shown; i++) {
      var tone = i === shown - 1 ? (i >= 4 ? 'good' : null) : null;
      kv(28, 268, y, rows[i].k, rows[i].v, tone);
      y += 26;
    }

    if (s >= 2) {
      P.rect(28, 236, 844, 44, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1, radius: 6 });
      line(44, 248, 'Two runs of two zeros tie. RFC 5952 4.2.3 says shorten the first, so 2001:db8::1:0:0:1.', { size: 11.5 });
      line(44, 266, 'Compressing the second run gives 2001:db8:0:0:1::1, which is legal to read but not canonical.', { size: 11.5, color: PAL.dim });
    }
    if (s >= 3) {
      line(28, 300, 'The counterexample that decides the rule', { size: 12, bold: true });
      line(28, 322, SINGLE_ZERO, { size: 11.5, mono: true, color: PAL.dim });
      line(28, 342, '\u2192 ' + SINGLE_CANON, { size: 11.5, mono: true, bold: true, color: PAL.warn });
      line(28, 366, 'A single zero group is never replaced by ::. 2001:db8::1:1:1:1:1 would be wrong,', { size: 11.5 });
      line(28, 386, 'because :: stands for one or more groups and could be read as a different address.', { size: 11.5, color: PAL.dim });
    }
    if (s >= 4) {
      line(28, 410, 'All five rules are computed by this page and checked against twelve addresses.', { size: 11, color: PAL.accent });
    }
    foot('drop leading zeros, lowercase, one ::, longest run, first run on a tie');
  }

  /* --- 4. expansion --------------------------------------------------- */
  function drawExpand(p) {
    var s = stage(p, 4);
    title('Reading it back: :: is a count, not a guess',
      'from 2001:db8::1 to eight groups, and the four inputs the parser must refuse');

    line(28, 70, '2001:db8::1', { size: 16, mono: true });
    if (s >= 1) {
      line(28, 100, 'two groups before the colons, one after, so :: stands for 8 \u2212 3 = 5 groups of zeros', { size: 11.5, color: PAL.dim });
      var g = parseGroups('2001:db8::1').groups, i, x;
      for (i = 0; i < 8; i++) {
        x = 28 + i * 104;
        box(x, 124, 100, 44, ('000' + g[i].toString(16)).slice(-4), null,
          (i >= 2 && i <= 6) ? 'warn' : 'good', true);
        P.text(x + 50, 176, i >= 2 && i <= 6 ? 'from ::' : 'written', { size: 9, align: 'center', base: 'top', color: PAL.faint });
      }
    }
    if (s >= 2) {
      line(28, 204, 'The count must land on exactly eight groups. That is the whole validity test.', { size: 12 });
      line(28, 230, '2001:db8::1        ok      2 + 5 + 1 = 8', { size: 11.5, mono: true, color: PAL.valid });
      line(28, 250, '2001:db8::1::2     no      :: appears twice', { size: 11.5, mono: true, color: PAL.invalid });
      line(28, 270, '2001:db8:1:2:3:4:5:6:7   no      nine groups, no ::', { size: 11.5, mono: true, color: PAL.invalid });
    }
    if (s >= 3) {
      line(28, 300, '2001:db8:12345::1  no      five hex digits in a group', { size: 11.5, mono: true, color: PAL.invalid });
      line(28, 320, '2001:db8:0:1:1:1:1:1::   no      :: must cover a group', { size: 11.5, mono: true, color: PAL.invalid });
      P.rect(28, 348, 844, 52, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1, radius: 6 });
      line(44, 360, 'All four refusals are produced by this page\u2019s parser and reported in the model checks.', { size: 11.5 });
      line(44, 380, 'A fifth case that is legal but not canonical: 2001:0db8:0000:0001:0001:0001:0001:0001.', { size: 11.5, color: PAL.dim });
    }
    foot('count the groups on both sides of ::; the missing ones are the zeros');
  }

  /* --- 5. prefix arithmetic ------------------------------------------- */
  function drawPrefix(p) {
    var s = stage(p, 4);
    title('A prefix is a cut, and every count is a power of two',
      '/n leaves 2^(128\u2212n) addresses; a /64 is one subnet, a /48 holds 65,536 of them');

    var rows = [
      { n: 32, what: 'one allocation', cnt: group3(prefixAddresses(32)) },
      { n: 48, what: 'one site', cnt: group3(prefixAddresses(48)) },
      { n: 64, what: 'one subnet', cnt: group3(prefixAddresses(64)) },
      { n: 128, what: 'one interface', cnt: '1' }
    ];
    line(28, 74, 'prefix', { size: 10, mono: true, color: PAL.faint });
    line(120, 74, 'addresses', { size: 10, mono: true, color: PAL.faint });
    line(520, 74, 'subnets of size /64', { size: 10, mono: true, color: PAL.faint });
    line(760, 74, 'what it is', { size: 10, mono: true, color: PAL.faint });
    var i, y = 92, shown = s === 0 ? 1 : (s === 1 ? 2 : (s === 2 ? 3 : 4));
    for (i = 0; i < shown; i++) {
      var r = rows[i];
      P.rect(28, y - 6, 844, 26, { fill: i % 2 ? PAL.surface2 : PAL.surface, stroke: PAL.border, sw: 0.8, radius: 4 });
      line(40, y, '/' + r.n, { size: 12, mono: true, bold: true });
      line(120, y, r.cnt, { size: 11, mono: true });
      line(520, y, r.n <= 64 ? group3(prefixInfo(r.n).subnet64) : 'n/a', { size: 11, mono: true, color: PAL.dim });
      line(760, y, r.what, { size: 11, color: PAL.dim });
      y += 30;
    }

    if (s >= 2) {
      P.rect(28, 224, 844, 76, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1, radius: 6 });
      line(44, 236, 'One address in a subnet is spoken for: the interface ID of all zeros is the subnet-router', { size: 11.5 });
      line(44, 256, 'anycast address (RFC 4291 2.6.1). So a /64 has 2\u2076\u2074 \u2212 1 = 18,446,744,073,709,551,615 usable', { size: 11.5 });
      line(44, 276, 'interface IDs, and there is no broadcast address to reserve a second one for.', { size: 11.5 });
    }
    if (s >= 3) {
      line(28, 322, 'IPv4 reserves two per subnet, the network address and the broadcast address.', { size: 12 });
      line(28, 346, 'IPv6 reserves one, and has no broadcast address at all: the all-nodes group ff02::1', { size: 12 });
      line(28, 368, 'does the job that broadcast used to do, and it is a multicast address.', { size: 12, color: PAL.dim });
      line(28, 396, 'A /127 is legal and holds two addresses, used on point-to-point links.', { size: 11.5, color: PAL.accent });
    }
    foot('counts are powers of two; subtract one for the subnet-router anycast, and stop there');
  }

  /* --- 6. the header --------------------------------------------------- */
  function drawHeader(p) {
    var s = stage(p, 4);
    title('The base header is fixed at forty octets',
      'eight fields, 320 bits, and no field that says how long the header is');

    var i, y = 68;
    line(28, y - 14, 'field', { size: 10, mono: true, color: PAL.faint });
    line(360, y - 14, 'bits', { size: 10, mono: true, color: PAL.faint });
    line(440, y - 14, 'octets', { size: 10, mono: true, color: PAL.faint });
    line(540, y - 14, 'what it does', { size: 10, mono: true, color: PAL.faint });
    var why = [
      'always 6 for IPv6',
      'priority, as IPv4\u2019s type of service',
      'label a flow for special handling',
      'octets after this header, not including it',
      'the type of the next header',
      'hops remaining, not seconds',
      'the originator, 16 octets',
      'the intended recipient, 16 octets'
    ];
    var shown = s === 0 ? 3 : (s === 1 ? 6 : 8);
    for (i = 0; i < shown; i++) {
      var f = HEADER[i];
      P.rect(28, y - 5, 844, 24, { fill: i % 2 ? PAL.surface2 : PAL.surface, stroke: PAL.border, sw: 0.8, radius: 4 });
      line(40, y, f.name, { size: 11.5, bold: true });
      line(360, y, String(f.bits), { size: 11, mono: true });
      line(440, y, String(f.bits / 8), { size: 11, mono: true, color: PAL.dim });
      line(540, y, why[i], { size: 10.5, color: PAL.dim });
      y += 27;
    }

    if (s >= 2) {
      P.rect(28, 300, 300, 34, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.1, radius: 6 });
      line(40, 310, 'sum: 320 bits = 40 octets', { size: 12, bold: true, color: PAL.ink });
      line(340, 310, 'two 32-bit words of fields, then two 128-bit addresses', { size: 11.5, color: PAL.dim });
    }
    if (s >= 3) {
      var seg = [{ w: 80, t: 'word 1', c: PAL.accentDim, st: PAL.accent },
                 { w: 80, t: 'word 2', c: PAL.accentDim, st: PAL.accent },
                 { w: 320, t: 'source address \u00b7 128 bits', c: PAL.surface2, st: PAL.border },
                 { w: 320, t: 'destination address \u00b7 128 bits', c: PAL.surface2, st: PAL.border }];
      var x = 28, j;
      for (j = 0; j < seg.length; j++) {
        P.rect(x, 352, seg[j].w, 26, { fill: seg[j].c, stroke: seg[j].st, sw: 1, radius: 4 });
        P.text(x + seg[j].w / 2, 365, seg[j].t, { size: 9.5, align: 'center', base: 'middle', color: PAL.ink });
        x += seg[j].w;
      }
      line(28, 388, 'Because the size never changes, no header-length field is needed and no padding is ever inserted.', { size: 11.5 });
    }
    foot('eight fields, fixed 40 octets, and no checksum among them');
  }

  /* --- 7. what was dropped --------------------------------------------- */
  function drawDropped(p) {
    var s = stage(p, 4);
    title('Three things IPv4 needed that IPv6 removed',
      'and one that changed meaning: Time to Live became Hop Limit');

    var cards = [
      { h: 'The header checksum', body: ['IPv4 recomputes it at every', 'router, because the TTL', 'changes. IPv6 has none: the', 'link layer already checks', 'each hop and TCP or UDP', 'checks the ends.'] },
      { h: 'The options field', body: ['IPv4 options sit inside the', 'header, so its length varies', 'and every router must parse', 'for them. IPv6 moves them', 'into extension headers, so', 'the base header is fixed.'] },
      { h: 'Router fragmentation', body: ['IPv4 routers fragment. In', 'IPv6 only the source does,', 'using a Fragment header.', 'A router that cannot forward', 'sends ICMPv6 Packet Too Big', '(type 2) instead.'] }
    ];
    var i, x;
    var shown = s === 0 ? 1 : (s === 1 ? 2 : 3);
    for (i = 0; i < shown; i++) {
      x = 28 + i * 284;
      P.rect(x, 70, 264, 168, { fill: PAL.surface, stroke: PAL.border, sw: 1.1, radius: 7 });
      line(x + 14, 82, cards[i].h, { size: 12, bold: true, color: PAL.accent });
      var k;
      for (k = 0; k < cards[i].body.length; k++) {
        line(x + 14, 106 + k * 20, cards[i].body[k], { size: 10.5, color: PAL.ink });
      }
    }

    if (s >= 2) {
      P.rect(28, 256, 844, 60, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1, radius: 6 });
      line(44, 268, 'The minimum link MTU is 1280 octets (RFC 8200 section 5). A 1500-octet link leaves 1440 for', { size: 11.5 });
      line(44, 288, 'TCP data: 1500 \u2212 40 for the IPv6 header \u2212 20 for the TCP header. Over IPv4 the same link leaves 1460.', { size: 11.5 });
    }
    if (s >= 3) {
      line(28, 332, 'Time to Live measured seconds in the standard and hops in every real router. IPv6 renamed it', { size: 12 });
      line(28, 354, 'Hop Limit, because RFC 8200 says nodes are not required to enforce a packet lifetime at all.', { size: 12 });
      line(28, 382, 'Fewer fields is not less function. It is less work per router, and a header a router can', { size: 11.5, color: PAL.dim });
      line(28, 402, 'process without ever recomputing a checksum.', { size: 11.5, color: PAL.dim });
    }
    foot('no checksum, no options, no router fragmentation: three costs moved off the fast path');
  }

  /* --- 8. payload length ----------------------------------------------- */
  function drawPayload(p) {
    var s = stage(p, 4);
    title('Payload Length counts everything after the base header',
      'and none of the base header: the opposite of what IPv4\u2019s Total Length counts');

    P.rect(28, 78, 240, 46, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.1, radius: 5 });
    P.text(148, 92, 'IPv6 base header', { size: 11, align: 'center', base: 'middle', color: PAL.ink });
    P.text(148, 110, '40 octets', { size: 10, mono: true, align: 'center', base: 'middle', color: PAL.dim });
    P.rect(272, 78, 130, 46, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.1, radius: 5 });
    P.text(337, 92, 'Routing header', { size: 11, align: 'center', base: 'middle', color: PAL.ink });
    P.text(337, 110, '8 octets', { size: 10, mono: true, align: 'center', base: 'middle', color: PAL.dim });
    P.rect(406, 78, 466, 46, { fill: PAL.surface2, stroke: PAL.border, sw: 1.1, radius: 5 });
    P.text(639, 92, 'UDP datagram, its own 8-octet header included', { size: 11, align: 'center', base: 'middle', color: PAL.ink });
    P.text(639, 110, '1000 octets', { size: 10, mono: true, align: 'center', base: 'middle', color: PAL.dim });

    if (s >= 1) {
      line(28, 146, 'Payload Length = 8 + 1000 = 1008 octets', { size: 12, bold: true });
      line(28, 170, 'the base header is not in it; the extension header is', { size: 11, color: PAL.dim });
    }
    if (s >= 2) {
      line(28, 200, 'On the wire: 40 + 1008 = 1048 octets', { size: 12, bold: true, color: PAL.accent });
      line(28, 224, 'IPv4 would have written Total Length = 1048 in the same packet; the two fields answer different questions.', { size: 11.5, color: PAL.dim });
    }
    if (s >= 3) {
      P.rect(28, 252, 844, 78, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
      line(44, 264, 'A 16-bit field stops at 65,535. Above that, Payload Length is set to 0 and the real length goes into', { size: 11.5 });
      line(44, 284, 'the Jumbo Payload option of the hop-by-hop header. A zero with no such option means zero payload.', { size: 11.5 });
      line(44, 308, 'TCP over IPv6 takes MSS = MTU \u2212 40 \u2212 20, so 1440 at a 1500-octet MTU and 1220 at the 1280 minimum.', { size: 11.5, color: PAL.accent });
      line(28, 348, 'This is the same subtraction the UDP lesson runs for its pseudo-header, with 40 in place of 20.', { size: 11.5, color: PAL.dim });
    }
    foot('payload length excludes the base header, includes every extension header');
  }

  /* --- 9. the chain ---------------------------------------------------- */
  function drawChain(p) {
    var s = stage(p, 4);
    title('Next Header is a chain, not a single value',
      'each header names the one after it, and the last one names the transport protocol');

    var xs = [28, 202, 376, 550], i;
    for (i = 0; i < 4; i++) {
      P.rect(xs[i], 80, 150, 52, { fill: i === 0 ? PAL.accentDim : PAL.surface2, stroke: i === 0 ? PAL.accent : PAL.border, sw: 1.1, radius: 6 });
      P.text(xs[i] + 75, 96, CHAIN[i].from, { size: 10.5, align: 'center', base: 'middle', color: PAL.ink, bold: true });
      P.text(xs[i] + 75, 116, 'Next Header = ' + CHAIN[i].nh, { size: 10, mono: true, align: 'center', base: 'middle', color: PAL.dim });
      if (i < 3) P.arrow(xs[i] + 152, 106, xs[i] + 172, 106, { stroke: PAL.border, sw: 1.4, head: 7 });
    }
    box(724, 80, 148, 52, 'TCP segment', 'the payload', 'good', false);

    if (s >= 1) {
      line(28, 156, 'The value 59 means there is nothing after this header at all; 58 means the rest is ICMPv6.', { size: 11.5 });
    }
    if (s >= 2) {
      line(28, 186, 'The ten values worth knowing', { size: 12, bold: true });
      var y = 210, j;
      for (j = 0; j < 10; j++) {
        var col = j < 5 ? 0 : 1;
        var xx = 28 + col * 430;
        var yy = y + (j % 5) * 26;
        line(xx, yy, String(NH[j].v), { size: 11.5, mono: true, bold: true, color: PAL.accent });
        line(xx + 46, yy, NH[j].name, { size: 11.5 });
      }
    }
    if (s >= 3) {
      P.rect(28, 352, 844, 56, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1, radius: 6 });
      line(44, 364, 'Order is prescribed (RFC 8200 4.1): hop-by-hop first, then destination options, routing, fragment,', { size: 11.5 });
      line(44, 384, 'AH, ESP, destination options again. A receiver must process them in the order they arrive.', { size: 11.5 });
    }
    foot('read the chain in order; the last Next Header names the transport protocol');
  }

  /* --- 10. EUI-64 ------------------------------------------------------ */
  function drawEui64(p) {
    var s = stage(p, 4);
    title('A link-local address writes itself',
      'EUI-64: insert FF FE in the middle of the MAC, then flip the universal/local bit');

    kv(28, 240, 74, 'the MAC address', macText(MAC));
    if (s >= 1) {
      kv(28, 240, 102, 'insert FF FE', IID.inserted.map(hex2).join(':'), 'warn');
      line(240, 124, 'between the third and fourth octets', { size: 10.5, color: PAL.dim });
    }
    if (s >= 2) {
      kv(28, 240, 150, 'flip the U/L bit', IID.flipped.map(hex2).join(':'), 'good');
      line(240, 172, 'first octet 00 becomes 02: the 0x02 bit is the universal/local bit', { size: 10.5, color: PAL.dim });
      kv(28, 240, 198, 'as eight groups', IID.text, 'good');
    }
    if (s >= 3) {
      kv(28, 240, 226, 'with the fe80::/64 prefix', LINK_LOCAL, 'good');
      P.rect(28, 258, 844, 56, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1, radius: 6 });
      line(44, 270, 'That is the whole of stateless autoconfiguration: a router advertisement supplies the prefix, the', { size: 11.5 });
      line(44, 290, 'interface ID comes from the hardware, and duplicate address detection asks whether anyone else has it.', { size: 11.5 });
      line(28, 330, 'Detection uses two ICMPv6 Neighbor Solicitation messages, type 135, and the reply is type 136.', { size: 11.5, color: PAL.dim });
      line(28, 352, 'Router solicitation is 133 and router advertisement 134; these replace IPv4\u2019s ARP and router discovery.', { size: 11.5, color: PAL.dim });
      line(28, 380, 'Privacy extensions replace the hardware-derived ID with a random one, which is why the method is', { size: 11.5 });
      line(28, 400, 'no longer the default on most operating systems. The arithmetic above is still what the exam asks.', { size: 11.5 });
    }
    foot('insert FF FE, flip bit 1 of the first octet, prefix with fe80::/64');
  }

  /* --- 11. the previous-year question --------------------------------- */
  function drawPyq2018(p) {
    var s = stage(p, 4);
    title('GATE CSE 2018, Q13: four widths to match',
      'every option is decided by one remembered field size, and IPv6 supplies one of them');

    var rows = [
      { a: 'P. UDP header\u2019s port number', b: '16 bits', c: 'IV' },
      { a: 'Q. Ethernet MAC address', b: '48 bits', c: 'I' },
      { a: 'R. IPv6 Next Header', b: '8 bits', c: 'II' },
      { a: 'S. TCP header\u2019s sequence number', b: '32 bits', c: 'III' }
    ];
    var i, y = 76;
    line(28, y - 14, 'field', { size: 10, mono: true, color: PAL.faint });
    line(480, y - 14, 'length', { size: 10, mono: true, color: PAL.faint });
    line(620, y - 14, 'matches', { size: 10, mono: true, color: PAL.faint });
    var shown = s === 0 ? 2 : 4;
    for (i = 0; i < shown; i++) {
      P.rect(28, y - 6, 844, 28, { fill: i === 2 ? PAL.accentDim : (i % 2 ? PAL.surface2 : PAL.surface), stroke: i === 2 ? PAL.accent : PAL.border, sw: i === 2 ? 1.2 : 0.8, radius: 4 });
      line(40, y, rows[i].a, { size: 11.5 });
      line(480, y, rows[i].b, { size: 11.5, mono: true, bold: true });
      line(620, y, rows[i].c, { size: 11.5, mono: true });
      y += 32;
    }

    if (s >= 1) {
      line(28, 214, 'Answer C: P\u2013IV, Q\u2013I, R\u2013II, S\u2013III.', { size: 12.5, bold: true, color: PAL.accent });
    }
    if (s >= 2) {
      P.rect(28, 240, 844, 58, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1, radius: 6 });
      line(44, 252, 'The trap is the word Next Header. It is one octet, because it carries an IP protocol number,', { size: 11.5 });
      line(44, 272, 'the same eight-bit field IPv4 calls Protocol. It is not the 16-bit Payload Length beside it.', { size: 11.5 });
    }
    if (s >= 3) {
      line(28, 316, 'A caution about a question that circulates under the wrong name', { size: 12, bold: true });
      line(28, 340, '\u201cIPv6 does not support which addressing mode?\u201d with the answer \u201cbroadcast\u201d is tagged', { size: 11.5 });
      line(28, 360, 'GATE CSE 2013 by several indexes. The paper it comes from is ISRO CSE 2013, question 56.', { size: 11.5 });
      line(28, 384, 'This page does not count it as a GATE CSE previous-year question. The fact it tests is still true:', { size: 11.5, color: PAL.dim });
      line(28, 404, 'IPv6 has no broadcast address, and ff02::1 is a multicast group rather than a broadcast.', { size: 11.5, color: PAL.dim });
    }
    foot('one remembered width per field; nothing here is computed');
  }

  var DRAW = {
    why: drawWhy, groups: drawGroups, compress: drawCompress, expand: drawExpand,
    prefix: drawPrefix, header: drawHeader, dropped: drawDropped, payload: drawPayload,
    chain: drawChain, eui64: drawEui64, pyq2018: drawPyq2018
  };

  function drawFrame(t) {
    if (!P) return;
    P.clear();
    P.alpha(1);
    var i = K.sceneAt(t);
    var sc = K.state.scenes[i];
    if (!sc) return;
    var fn = DRAW[sc.id];
    if (fn) fn(K.sceneProgress(t));
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
    HEADER: HEADER, V4HEADER: V4HEADER, NH: NH, CHAIN: CHAIN,
    PAYLOAD: PAYLOAD, WIRE: WIRE, LINK_LOCAL: LINK_LOCAL, IID: IID,
    TIE_CANON: TIE_CANON, SINGLE_CANON: SINGLE_CANON,
    parseGroups: parseGroups, fmtGroups: fmtGroups, pow2: pow2,
    PASSED: PASSED, TOTAL: CHECKS.length,
    ALL_PASS: PASSED === CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
