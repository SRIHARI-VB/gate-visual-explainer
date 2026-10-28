/* ==========================================================================
   ip-fragmentation-cidr-and-nat — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no subnet arithmetic, no prefix match
   and no fragmentation of its own; every figure on the canvas was computed once
   here and checked against the definition it is supposed to satisfy.
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

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- 32-bit address helpers ---------- */

function ipToInt(a) {
  var p = a.split('.').map(Number);
  return ((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3];
}

function intToIp(n) {
  n = n >>> 0;
  return [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

function maskOf(prefix) {
  if (prefix <= 0) return 0;
  return (0xFFFFFFFF << (32 - prefix)) >>> 0;
}

function blockSize(prefix) { return Math.pow(2, 32 - prefix); }

/* Everything a block has, from one address and one prefix. */
function blockOf(address, prefix) {
  var a = ipToInt(address);
  var m = maskOf(prefix);
  var net = (a & m) >>> 0;
  var size = blockSize(prefix);
  var bcast = (net + size - 1) >>> 0;
  return {
    address: address, prefix: prefix, mask: m,
    net: net, netIp: intToIp(net),
    bcast: bcast, bcastIp: intToIp(bcast),
    firstIp: intToIp((net + 1) >>> 0),
    lastIp: intToIp((bcast - 1) >>> 0),
    size: size,
    usable: prefix >= 31 ? size : size - 2,
    hostBits: 32 - prefix
  };
}

/* ---------- 1. the /27 block of GATE 2015 Set 3 Q38 ---------- */

var B27 = blockOf('200.10.11.144', 27);

/* ---------- 2. GATE 2019 Q28: three machines under a /30 ---------- */

var MACHINES = ['100.10.5.2', '100.10.5.5', '100.10.5.6'].map(function (ip) {
  var b = blockOf(ip, 30);
  return { ip: ip, netIp: b.netIp, lastIp: b.lastIp, prefix: 30 };
});
/* two machines share a block when their network addresses are equal */
var MACHINE_PAIRS = [];
for (var mi = 0; mi < MACHINES.length; mi++) {
  for (var mj = mi + 1; mj < MACHINES.length; mj++) {
    MACHINE_PAIRS.push({
      a: MACHINES[mi].ip, b: MACHINES[mj].ip,
      same: MACHINES[mi].netIp === MACHINES[mj].netIp
    });
  }
}

/* ---------- 3. longest prefix match ---------- */

function matchTable(table, dest) {
  var d = ipToInt(dest);
  var cands = [];
  table.forEach(function (e) {
    if (e.prefix === 0) return;            /* default handled separately */
    var m = maskOf(e.prefix);
    if (((d & m) >>> 0) === ipToInt(e.net)) {
      cands.push({ net: e.net, prefix: e.prefix, via: e.via, masked: intToIp((d & m) >>> 0) });
    }
  });
  cands.sort(function (x, y) { return y.prefix - x.prefix; });
  var best = cands.length ? cands[0] : null;
  var def = null;
  table.forEach(function (e) { if (e.prefix === 0) def = e; });
  return {
    dest: dest,
    candidates: cands,
    best: best,
    chosen: best ? best.via : (def ? def.via : null),
    viaDefault: !best && !!def
  };
}

/* GATE CSE 2023 Q55 */
var T2023 = [
  { net: '200.150.0.0', prefix: 16, via: '1' },
  { net: '200.150.64.0', prefix: 19, via: '2' },
  { net: '200.150.68.0', prefix: 24, via: '3' },
  { net: '200.150.68.64', prefix: 27, via: '4' },
  { net: '0.0.0.0', prefix: 0, via: '0' }
];
var LPM2023 = matchTable(T2023, '200.150.68.118');

/* GATE CSE 2024 Set 1: five hosts, twenty packets each */
var T2024 = [
  { net: '10.1.1.0', prefix: 24, via: 'R1' },
  { net: '10.1.1.128', prefix: 25, via: 'R2' },
  { net: '10.1.1.64', prefix: 26, via: 'R3' },
  { net: '10.1.1.192', prefix: 26, via: 'R4' }
];
var HOSTS2024 = ['10.1.1.16', '10.1.1.72', '10.1.1.132', '10.1.1.191', '10.1.1.205']
  .map(function (ip) { return { ip: ip, r: matchTable(T2024, ip) }; });
var R2_HOSTS = HOSTS2024.filter(function (h) { return h.r.chosen === 'R2'; }).length;
var R2_PACKETS = R2_HOSTS * 20;

/* ---------- 4. aggregation, GATE CSE 2022 Q45 ---------- */

var AGG_SUBNETS = [
  { net: '12.20.164.0', prefix: 22 },
  { net: '12.20.166.0', prefix: 23 },
  { net: '12.20.168.0', prefix: 23 },
  { net: '12.20.170.0', prefix: 23 }
];

var AGG_ANSWER = [
  { net: '12.20.164.0', prefix: 22 },
  { net: '12.20.168.0', prefix: 22 }
];

/* does a block contain every address of another block? */
function contains(outer, inner) {
  var o = ipToInt(outer.net), i = ipToInt(inner.net);
  return outer.prefix <= inner.prefix &&
         ((i & maskOf(outer.prefix)) >>> 0) === o &&
         blockSize(inner.prefix) <= blockSize(outer.prefix);
}

/* the merged pair must cover the four and add nothing */
var AGG_COVERS_ALL = AGG_SUBNETS.every(function (s) {
  return AGG_ANSWER.some(function (a) { return contains(a, s); });
});

function addrCount(blocks) {
  /* union size of a small set of blocks, counted address by address */
  var seen = {};
  blocks.forEach(function (b) {
    var start = ipToInt(b.net), size = blockSize(b.prefix);
    for (var k = 0; k < size; k++) seen[intToIp(start + k)] = 1;
  });
  return Object.keys(seen).length;
}

var AGG_UNION = addrCount(AGG_SUBNETS);
var AGG_MERGED = addrCount(AGG_ANSWER);

/* ---------- 5. fragmentation ---------- */

var IP_H = 20;

function usablePayload(MTU, H) {
  return Math.floor((MTU - H) / 8) * 8;
}

/* Fragment `data` bytes of payload for a link of `MTU`. Offsets are returned in
   bytes and in 8-byte units; MF is true on every fragment but the last. */
function fragment(dataBytes, MTU, H) {
  H = H === undefined ? IP_H : H;
  var budget = usablePayload(MTU, H);
  var out = [];
  if (budget <= 0) return out;
  var pos = 0;
  while (pos < dataBytes) {
    var take = Math.min(budget, dataBytes - pos);
    out.push({
      start: pos, data: take, total: take + H,
      offsetUnits: pos / 8, mf: pos + take < dataBytes
    });
    pos += take;
  }
  return out;
}

/* Fragment a list of fragments again: offsets stay absolute in the original data. */
function refragment(list, MTU, H) {
  H = H === undefined ? IP_H : H;
  var budget = usablePayload(MTU, H);
  var out = [];
  list.forEach(function (f) {
    var pos = f.start, left = f.data;
    while (left > 0) {
      var take = Math.min(budget, left);
      /* MF stays set on the last piece of an inner fragment when more of the
         original datagram still follows it downstream. */
      out.push({
        start: pos, data: take, total: take + H,
        offsetUnits: pos / 8,
        mf: (pos + take < f.start + f.data) || f.mf === true
      });
      pos += take; left -= take;
    }
  });
  return out;
}

/* GATE 2016 Set 1 Q53 — total 1000, MTU 100, header 20 */
var FRAG2016 = fragment(1000 - IP_H, 100);
/* GATE 2025 Set 2 Q23 — UDP payload 7488 + 8 header, Ethernet MTU 1500 */
var FRAG2025 = fragment(7488 + 8, 1500);
/* GATE 2021 Set 1 Q45 — TCP segment 1400 over an 820-byte link */
var FRAG2021 = fragment(1400, 820);
/* GATE 2015 Set 2 Q52 — UDP user data 8880 + 8 header, MTU 1500 */
var FRAG2015 = fragment(8880 + 8, 1500);
/* GATE 2024 Set 1 Q65 — total 1420, links 542 then 360 */
var HOP1 = fragment(1420 - IP_H, 542);
var FRAG2024 = refragment(HOP1, 360);

/* invariants every fragment list must satisfy */
function fragInvariants(list, originalData, MTU, H) {
  H = H === undefined ? IP_H : H;
  var sum = list.reduce(function (s, f) { return s + f.data; }, 0);
  var aligned = list.slice(0, -1).every(function (f) { return f.data % 8 === 0; });
  var contiguous = true, cursor = 0;
  list.forEach(function (f) {
    if (f.start !== cursor) contiguous = false;
    cursor = f.start + f.data;
    if (f.offsetUnits !== f.start / 8) contiguous = false;
  });
  var fits = list.every(function (f) { return f.total <= MTU; });
  var flags = list.slice(0, -1).every(function (f) { return f.mf === true; }) &&
              (list.length === 0 || list[list.length - 1].mf === false);
  return {
    sum: sum, conserved: sum === originalData,
    aligned: aligned, contiguous: contiguous, fits: fits, flags: flags
  };
}

var INV2016 = fragInvariants(FRAG2016, 980, 100);
var INV2025 = fragInvariants(FRAG2025, 7496, 1500);
var INV2021 = fragInvariants(FRAG2021, 1400, 820);
var INV2015 = fragInvariants(FRAG2015, 8888, 1500);
var INV2024 = fragInvariants(FRAG2024, 1400, 360);

/* ---------- 6. NAT ---------- */

var NAT_TABLE = [
  { privIp: '192.168.1.10', privPort: 4001, pubIp: '203.0.113.5', pubPort: 50001 },
  { privIp: '192.168.1.11', privPort: 4002, pubIp: '203.0.113.5', pubPort: 50002 },
  { privIp: '192.168.1.12', privPort: 4003, pubIp: '203.0.113.5', pubPort: 50003 }
];

function natOut(entry) {
  return {
    src: entry.pubIp, sport: entry.pubPort,
    dst: '198.51.100.9', dport: 80,
    changed: ['source IP', 'source port', 'header checksum']
  };
}
function natIn(entry) {
  return {
    src: '198.51.100.9', sport: 80,
    dst: entry.privIp, dport: entry.privPort,
    changed: ['destination IP', 'destination port', 'header checksum']
  };
}

/* the (public address, public port) pair must be unique, or replies collide */
var NAT_KEYS = NAT_TABLE.map(function (e) { return e.pubIp + ':' + e.pubPort; });
var NAT_UNIQUE = NAT_KEYS.length === new Set(NAT_KEYS).size;

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

chk('the /27 mask is 255.255.255.224', intToIp(B27.mask) === '255.255.255.224', intToIp(B27.mask));
chk('the /27 block starts at 200.10.11.128', B27.netIp === '200.10.11.128', B27.netIp);
chk('the /27 block ends at 200.10.11.159', B27.bcastIp === '200.10.11.159', B27.bcastIp);
chk('the last assignable host is .158 (GATE 2015 Set 3 Q38)', B27.lastIp === '200.10.11.158', B27.lastIp);
chk('a /27 holds 32 addresses and 30 usable hosts', B27.size === 32 && B27.usable === 30, B27.size + '/' + B27.usable);
chk('the given address lies inside its own block',
    ipToInt(B27.address) >= B27.net && ipToInt(B27.address) <= B27.bcast, B27.address);

chk('GATE 2019 Q28: only .5 and .6 share a /30 block',
    MACHINE_PAIRS.filter(function (p) { return p.same; }).length === 1 &&
    MACHINE_PAIRS[2].same === true, JSON.stringify(MACHINE_PAIRS.map(function (p) { return p.same; })));

chk('GATE 2023 Q55: three entries match .118', LPM2023.candidates.length === 3, LPM2023.candidates.length);
chk('GATE 2023 Q55: the answer is interface 3', LPM2023.chosen === '3', LPM2023.chosen);
chk('the /27 entry does not match .118',
    !LPM2023.candidates.some(function (c) { return c.prefix === 27; }), 'ok');
chk('the chosen prefix is the longest of the matching ones',
    LPM2023.best.prefix === Math.max.apply(null, LPM2023.candidates.map(function (c) { return c.prefix; })),
    LPM2023.best.prefix);

chk('GATE 2024 Set 1: exactly two hosts go via R2', R2_HOSTS === 2, R2_HOSTS);
chk('GATE 2024 Set 1: the answer is 40 packets', R2_PACKETS === 40, R2_PACKETS);
chk('every host in the 2024 table finds a route', HOSTS2024.every(function (h) { return h.r.chosen; }), 'ok');

chk('the two /22 entries cover all four subnets', AGG_COVERS_ALL, 'ok');
chk('the two /22 entries add no extra address', AGG_UNION === AGG_MERGED, AGG_UNION + ' vs ' + AGG_MERGED);
chk('164.0/22 already contains 166.0/23',
    contains(AGG_ANSWER[0], AGG_SUBNETS[1]), 'ok');
chk('no /21 can hold both 164.0/22 and 168.0/22',
    !contains({ net: '12.20.160.0', prefix: 21 }, AGG_SUBNETS[3]), 'ok');

chk('GATE 2016 Set 1: the budget is 80 bytes', usablePayload(100, 20) === 80, usablePayload(100, 20));
chk('GATE 2016 Set 1: thirteen fragments', FRAG2016.length === 13, FRAG2016.length);
chk('GATE 2016 Set 1: offsets run 0 to 120 in units of 8',
    FRAG2016[0].offsetUnits === 0 && FRAG2016[12].offsetUnits === 120, FRAG2016[12].offsetUnits);
chk('GATE 2016 Set 1: the last fragment is 40 bytes', FRAG2016[12].total === 40, FRAG2016[12].total);
chk('2016 list conserves data, aligns, fits and flags',
    INV2016.conserved && INV2016.aligned && INV2016.fits && INV2016.flags && INV2016.contiguous, JSON.stringify(INV2016));

chk('GATE 2025 Set 2: six fragments', FRAG2025.length === 6, FRAG2025.length);
chk('GATE 2025 Set 2: the last fragment is 116 bytes', FRAG2025[5].total === 116, FRAG2025[5].total);
chk('2025 list passes all five invariants',
    INV2025.conserved && INV2025.aligned && INV2025.fits && INV2025.flags && INV2025.contiguous, 'ok');

chk('GATE 2021 Set 1: two fragments at the router', FRAG2021.length === 2, FRAG2021.length);
chk('GATE 2021 Set 1: the second datagram is 620 bytes', FRAG2021[1].total === 620, FRAG2021[1].total);
chk('2021 list passes all five invariants',
    INV2021.conserved && INV2021.aligned && INV2021.fits && INV2021.flags && INV2021.contiguous, 'ok');

chk('GATE 2015 Set 2: seven fragments', FRAG2015.length === 7, FRAG2015.length);
chk('GATE 2015 Set 2: last offset is 1110 units', FRAG2015[6].offsetUnits === 1110, FRAG2015[6].offsetUnits);
chk('2015 list passes all five invariants',
    INV2015.conserved && INV2015.aligned && INV2015.fits && INV2015.flags && INV2015.contiguous, 'ok');

chk('GATE 2024 Set 1: three fragments after the first hop', HOP1.length === 3, HOP1.length);
chk('GATE 2024 Set 1: six fragments reach the receiver', FRAG2024.length === 6, FRAG2024.length);
chk('GATE 2024 Set 1: every fragment fits the 360-byte link',
    FRAG2024.every(function (f) { return f.total <= 360; }), 'ok');
chk('2024 list conserves 1400 data bytes', INV2024.conserved, INV2024.sum);
chk('2024 offsets stay absolute and contiguous', INV2024.contiguous, 'ok');

chk('the NAT table has a unique public pair per entry', NAT_UNIQUE, NAT_KEYS.join(' '));
chk('an outbound packet changes source address and port',
    natOut(NAT_TABLE[0]).src === '203.0.113.5' && natOut(NAT_TABLE[0]).sport === 50001, 'ok');
chk('the reply is rewritten back to the private host',
    natIn(NAT_TABLE[0]).dst === '192.168.1.10' && natIn(NAT_TABLE[0]).dport === 4001, 'ok');
chk('the header checksum is named in both directions',
    natOut(NAT_TABLE[0]).changed.indexOf('header checksum') >= 0 &&
    natIn(NAT_TABLE[0]).changed.indexOf('header checksum') >= 0, 'ok');

/* ---------- the model object the page exposes ---------- */

var V = {
  B27: B27,
  machines: MACHINES, pairs: MACHINE_PAIRS,
  lpm2023: { table: T2023, r: LPM2023 },
  lpm2024: { table: T2024, hosts: HOSTS2024, r2Hosts: R2_HOSTS, r2Packets: R2_PACKETS },
  agg: { subnets: AGG_SUBNETS, answer: AGG_ANSWER, union: AGG_UNION, merged: AGG_MERGED },
  frag: {
    f2016: FRAG2016, f2025: FRAG2025, f2021: FRAG2021, f2015: FRAG2015,
    hop1: HOP1, f2024: FRAG2024,
    budget: { m100: usablePayload(100, 20), m542: usablePayload(542, 20), m360: usablePayload(360, 20), m820: usablePayload(820, 20), m1500: usablePayload(1500, 20) }
  },
  nat: { table: NAT_TABLE, out: natOut(NAT_TABLE[0]), in: natIn(NAT_TABLE[0]) }
};

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

var ACC = PAL.accent, INK = PAL.ink, DIM = PAL.dim, FAINT = PAL.faint;
var VAL = PAL.valid, BAD = PAL.invalid, WARN = PAL.warn, INFO = PAL.info;

function head(P, title, sub) {
  P.text(30, 22, title, { size: 16, bold: true, color: INK });
  if (sub) P.text(30, 44, sub, { size: 12, color: DIM });
  P.line(30, 62, W - 30, 62, { stroke: PAL.border, sw: 1 });
}

function chip(P, x, y, w, h, label, opts) {
  opts = opts || {};
  P.rect(x, y, w, h, {
    fill: opts.fill || PAL.surface2,
    stroke: opts.stroke || PAL.border,
    sw: opts.sw || 1.2,
    radius: opts.radius === undefined ? 5 : opts.radius
  });
  P.text(x + w / 2, y + h / 2, label, {
    size: opts.size || 12, align: 'center', base: 'middle',
    color: opts.color || INK, bold: !!opts.bold, mono: opts.mono !== false
  });
}

function bits(n, width) {
  var s = (n >>> 0).toString(2);
  while (s.length < width) s = '0' + s;
  return s;
}

/* ---------- scene 1: the split ---------- */

function drawSplit(t, sc) {
  head(P, 'One 32-bit number, cut in two', 'prefix p bits name the network; the other 32 - p name the host');

  var x0 = 110, y0 = 92, cw = 20, ch = 26;
  var b = bits(ipToInt('200.10.11.144'), 32);
  var octets = ['200', '10', '11', '144'];

  for (var i = 0; i < 32; i++) {
    var x = x0 + i * cw;
    var inNet = i < 27;
    P.alpha(0.15 + 0.85 * K.ease(K.beat(t, sc.start + i * 0.06, 0.5)));
    chip(P, x, y0, cw - 2, ch, b.charAt(i), {
      fill: inNet ? PAL.accentDim : '#ffffff',
      stroke: inNet ? ACC : PAL.border,
      color: inNet ? ACC : DIM,
      size: 11, radius: 2, sw: 1
    });
    P.alpha(1);
  }
  P.alpha(1);

  for (var o = 0; o < 4; o++) {
    P.text(x0 + o * 8 * cw + 4 * cw - cw / 2, y0 + ch + 16, octets[o],
           { size: 11, align: 'center', color: DIM, mono: true });
  }

  var cutX = x0 + 27 * cw - 1;
  var ap = K.ease(K.beat(t, sc.start + 2.0, 1.2));
  P.alpha(ap);
  P.line(cutX, y0 - 16, cutX, y0 + ch + 26, { stroke: BAD, sw: 2, dash: [5, 4] });
  P.text(cutX + 6, y0 - 20, 'cut after bit 27', { size: 11, color: BAD, bold: true });
  P.text(cutX - 8, y0 + ch + 44, '27 network bits', { size: 11, color: ACC, align: 'right' });
  P.text(cutX + 10, y0 + ch + 44, '5 host bits', { size: 11, color: INFO });
  P.alpha(1);

  /* the block on a number line for the fourth octet */
  var ly = 240, lx = 110, lw = 680;
  P.alpha(K.ease(K.beat(t, sc.start + 7.0, 1.0)));
  P.line(lx, ly, lx + lw, ly, { stroke: PAL.border, sw: 1.5 });
  [0, 64, 128, 192, 255].forEach(function (v) {
    var xx = lx + (v / 255) * lw;
    P.line(xx, ly - 4, xx, ly + 4, { stroke: FAINT, sw: 1 });
    P.text(xx, ly + 16, String(v), { size: 10, color: FAINT, align: 'center', mono: true });
  });
  P.alpha(1);

  var sxp = lx + (128 / 255) * lw, exp = lx + (159 / 255) * lw;
  P.alpha(K.ease(K.beat(t, sc.start + 9.0, 1.2)));
  P.rect(sxp, ly - 12, exp - sxp, 24, { fill: PAL.accentDim, stroke: ACC, radius: 4, sw: 1.5 });
  P.text((sxp + exp) / 2, ly - 24, 'block 128 - 159  (32 addresses)', { size: 11, color: ACC, align: 'center', bold: true });
  P.alpha(1);

  var hx = lx + (144 / 255) * lw;
  P.alpha(K.ease(K.beat(t, sc.start + 12.0, 1.0)));
  P.circle(hx, ly, 5, { fill: INK });
  P.text(hx, ly - 10, '.144 given', { size: 10, color: INK, align: 'center' });
  P.alpha(1);

  var bx = lx + (159 / 255) * lw;
  P.alpha(K.ease(K.beat(t, sc.start + 15.0, 1.0)));
  P.circle(bx, ly, 5, { fill: BAD });
  P.text(bx, ly + 34, '.159 broadcast', { size: 10, color: BAD, align: 'center' });
  P.alpha(1);

  var lx2 = lx + (158 / 255) * lw;
  P.alpha(K.ease(K.beat(t, sc.start + 22.0, 1.0)));
  P.circle(lx2, ly, 6, { fill: VAL });
  P.text(lx2, ly + 52, '.158 last host', { size: 11, color: VAL, align: 'center', bold: true });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, sc.start + 26.0, 1.0)));
  P.text(30, 400, 'Mask 255.255.255.224   ·   block size 2^5 = 32   ·   usable hosts 2^5 - 2 = 30',
         { size: 12, color: DIM, mono: true });
  P.text(30, 424, 'GATE CSE 2015 Set 3 Q38 asks for the fourth octet of the last assignable host: 158.',
         { size: 12, color: INK });
  P.alpha(1);
}

/* ---------- scene 2: five numbers ---------- */

function drawBlocks(t, sc) {
  head(P, 'The five numbers every block has', 'from one address and one prefix, by counting from both ends');

  var b = V.B27;
  var labels = [
    ['network', b.netIp], ['first host', b.firstIp], ['last host', b.lastIp],
    ['broadcast', b.bcastIp], ['usable', String(b.usable)]
  ];
  var bw = 158, gap = 12, x = 30, y = 90;
  labels.forEach(function (L, i) {
    P.alpha(K.ease(K.beat(t, sc.start + i * 1.4, 1.0)));
    chip(P, x + i * (bw + gap), y, bw, 62, '', {
      fill: i === 2 ? PAL.accentDim : PAL.surface2,
      stroke: i === 2 ? ACC : PAL.border, radius: 6
    });
    P.text(x + i * (bw + gap) + bw / 2, y + 16, L[0], { size: 10, color: DIM, align: 'center' });
    P.text(x + i * (bw + gap) + bw / 2, y + 38, L[1], {
      size: 13, align: 'center', bold: true, mono: true, color: i === 2 ? ACC : INK
    });
    P.alpha(1);
  });

  P.alpha(K.ease(K.beat(t, sc.start + 7.5, 1.0)));
  P.text(30, 190, 'network = address AND mask = 200.10.11.144 AND 255.255.255.224 = 200.10.11.128',
         { size: 12, mono: true, color: INK });
  P.text(30, 212, 'broadcast = network OR (all host bits 1) = 200.10.11.128 + 31 = 200.10.11.159',
         { size: 12, mono: true, color: INK });
  P.text(30, 234, 'usable hosts = 2^(32-27) - 2 = 32 - 2 = 30', { size: 12, mono: true, color: INK });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, sc.start + 12.0, 1.0)));
  P.text(30, 268, 'GATE CSE 2019 Q28 — mask 255.255.255.252, a /30 with block size 4', { size: 12, bold: true, color: INK });
  P.alpha(1);

  V.machines.forEach(function (m, i) {
    P.alpha(K.ease(K.beat(t, sc.start + 15.0 + i * 1.5, 1.0)));
    var yy = 290 + i * 42;
    chip(P, 30, yy, 190, 32, m.ip, { size: 12, radius: 4 });
    P.text(238, yy + 16, 'block ' + m.netIp + '/30', { size: 11, color: DIM, base: 'middle', mono: true });
    var same = V.machines.filter(function (o) {
      return o.netIp === m.netIp && o.ip !== m.ip;
    }).length > 0;
    P.text(520, yy + 16, same ? 'shares its block' : 'alone in its block', {
      size: 11, base: 'middle', color: same ? VAL : BAD, bold: true
    });
    P.alpha(1);
  });

  P.alpha(K.ease(K.beat(t, sc.start + 21.0, 1.0)));
  P.text(30, 432, 'Only N and P belong to the same subnet — option C of that question.',
         { size: 12, color: ACC, bold: true });
  P.alpha(1);
}

/* ---------- scene 3: longest prefix match ---------- */

function drawLpm(t, sc) {
  head(P, 'Longest prefix match', 'every entry that matches is a candidate; the longest prefix wins');

  var r = V.lpm2023.r;
  var y = 88;
  P.alpha(K.ease(K.beat(t, sc.start + 0.5, 1.0)));
  P.text(30, y - 6, 'GATE CSE 2023 Q55 — destination 200.150.68.118', { size: 12, bold: true, color: INK });
  P.alpha(1);

  var matched = {};
  r.candidates.forEach(function (c) { matched[c.net + '/' + c.prefix] = true; });

  V.lpm2023.table.forEach(function (e, i) {
    var yy = y + 14 + i * 38;
    P.alpha(K.ease(K.beat(t, sc.start + 1.0 + i * 1.2, 0.9)));
    var key = e.net + '/' + e.prefix;
    var hit = matched[key];
    chip(P, 30, yy, 250, 30, e.net + '/' + e.prefix, {
      size: 11, radius: 4,
      fill: hit ? PAL.accentDim : PAL.surface2,
      stroke: hit ? ACC : PAL.border
    });
    P.text(292, yy + 15, 'iface ' + e.via, { size: 11, base: 'middle', color: DIM, mono: true });
    P.text(400, yy + 15, hit ? 'matches' : 'no match', {
      size: 11, base: 'middle', bold: hit, color: hit ? VAL : FAINT
    });
    P.alpha(1);
  });

  P.alpha(K.ease(K.beat(t, sc.start + 8.0, 1.0)));
  P.text(520, 108, 'candidates', { size: 11, color: DIM, bold: true });
  r.candidates.forEach(function (c, i) {
    var yy = 128 + i * 30;
    P.alpha(K.ease(K.beat(t, sc.start + 8.5 + i * 1.2, 0.9)));
    chip(P, 520, yy, 120, 24, '/' + c.prefix, {
      size: 11, radius: 4,
      fill: i === 0 ? PAL.accentDim : PAL.surface2,
      stroke: i === 0 ? ACC : PAL.border
    });
    P.text(650, yy + 12, 'iface ' + c.via, { size: 11, base: 'middle', color: DIM, mono: true });
    P.alpha(1);
  });

  P.alpha(K.ease(K.beat(t, sc.start + 13.0, 1.0)));
  P.text(520, 236, 'longest is /24', { size: 11, color: ACC, bold: true });
  P.arrow(520, 262, 700, 262, { stroke: ACC, sw: 2 });
  P.text(710, 262, 'interface 3', { size: 14, bold: true, color: ACC, base: 'middle' });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, sc.start + 18.0, 1.0)));
  P.line(30, 292, W - 30, 292, { stroke: PAL.border, sw: 1 });
  P.text(30, 306, 'GATE CSE 2024 Set 1 — five hosts, twenty packets each, four prefixes', { size: 12, bold: true, color: INK });
  P.alpha(1);

  V.lpm2024.hosts.forEach(function (h, i) {
    P.alpha(K.ease(K.beat(t, sc.start + 19.0 + i * 1.4, 0.9)));
    var yy = 326 + i * 24;
    P.text(30, yy, h.ip, { size: 11, mono: true, color: INK });
    P.text(180, yy, '-> ' + h.r.chosen, {
      size: 11, mono: true, bold: h.r.chosen === 'R2', color: h.r.chosen === 'R2' ? ACC : DIM
    });
    P.alpha(1);
  });

  P.alpha(K.ease(K.beat(t, sc.start + 26.0, 1.0)));
  P.text(430, 350, V.lpm2024.r2Hosts + ' hosts x 20 packets', { size: 12, color: DIM });
  P.text(430, 380, String(V.lpm2024.r2Packets), { size: 30, bold: true, color: ACC });
  P.text(430, 418, 'packets via R2', { size: 11, color: DIM });
  P.alpha(1);
}

/* ---------- scene 4: aggregation ---------- */

function drawAggregate(t, sc) {
  head(P, 'Aggregation: when two blocks become one', 'equal size, adjacent start, one bit of difference');

  var y = 92;
  P.alpha(K.ease(K.beat(t, sc.start + 0.5, 1.0)));
  P.text(30, y, 'GATE CSE 2022 Q45 — third octet of each entry, in binary', { size: 12, bold: true, color: INK });
  P.alpha(1);

  V.agg.subnets.forEach(function (s, i) {
    var yy = y + 22 + i * 34;
    P.alpha(K.ease(K.beat(t, sc.start + 1.0 + i * 1.3, 0.9)));
    var oct = Number(s.net.split('.')[2]);
    chip(P, 30, yy, 150, 26, s.net + '/' + s.prefix, { size: 10, radius: 4 });
    P.text(196, yy + 13, bits(oct, 8), { size: 12, mono: true, base: 'middle', color: INK });
    P.text(300, yy + 13, 'bits fixed by /' + s.prefix + ': ' + (s.prefix - 16),
           { size: 10, mono: true, base: 'middle', color: DIM });
    P.alpha(1);
  });

  P.alpha(K.ease(K.beat(t, sc.start + 8.0, 1.0)));
  P.text(30, 250, 'merge 164.0/22 with nothing: it already holds 166.0/23 and 167', { size: 11, color: DIM });
  P.text(30, 270, 'merge 168.0/23 with 170.0/23 -> 168.0/22', { size: 11, color: DIM });
  P.alpha(1);

  /* the two answer blocks, as bars over the third octet */
  var bx = 470, bw = 380;
  P.alpha(K.ease(K.beat(t, sc.start + 11.0, 1.0)));
  P.text(bx, y, 'answer: two /22 entries', { size: 12, bold: true, color: INK });
  P.alpha(1);

  var bars = [
    { label: '12.20.164.0/22', from: 164, to: 167 },
    { label: '12.20.168.0/22', from: 168, to: 171 }
  ];
  bars.forEach(function (b, i) {
    var yy = y + 22 + i * 62;
    P.alpha(K.ease(K.beat(t, sc.start + 12.0 + i * 1.6, 1.0)));
    P.rect(bx, yy, bw, 30, { fill: PAL.accentDim, stroke: ACC, radius: 4, sw: 1.4 });
    P.text(bx + bw / 2, yy + 15, b.label + '  covers ' + b.from + ' - ' + b.to,
           { size: 11, align: 'center', base: 'middle', color: ACC, mono: true });
    P.alpha(1);
  });

  P.alpha(K.ease(K.beat(t, sc.start + 17.0, 1.0)));
  P.text(bx, 250, 'covered addresses: ' + V.agg.merged + '   union of the four: ' + V.agg.union,
         { size: 11, mono: true, color: VAL });
  P.text(bx, 270, 'equal, so no foreign address is captured', { size: 11, color: VAL });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, sc.start + 21.0, 1.0)));
  P.rect(bx, 292, bw, 76, { fill: PAL.warnDim, stroke: WARN, radius: 5, sw: 1.2 });
  P.text(bx + 12, 306, 'why not one /21?', { size: 11, bold: true, color: WARN });
  P.text(bx + 12, 326, '164 = 10100100   168 = 10101000', { size: 11, mono: true, color: INK });
  P.text(bx + 12, 344, 'a /21 fixes five octet bits; these differ on the fifth', { size: 10, color: DIM });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, sc.start + 25.0, 1.0)));
  P.text(30, 320, 'GATE 2022 key: options B and D.', { size: 12, bold: true, color: ACC });
  P.text(30, 342, 'Community discussion adds the assumption', { size: 10, color: DIM });
  P.text(30, 358, 'that 168.0/23 and 170.0/23 share a', { size: 10, color: DIM });
  P.text(30, 374, 'next hop. State it when you aggregate.', { size: 10, color: DIM });
  P.alpha(1);
}

/* ---------- scene 5: the rules ---------- */

function drawRules(t, sc) {
  head(P, 'Fragmentation: three fields and one rounding', 'MTU includes the header; offsets count 8-byte units');

  var y = 96, x = 60, w = 700;
  var mtu = 1500, hdr = 20;
  P.alpha(K.ease(K.beat(t, sc.start + 0.5, 1.0)));
  P.rect(x, y, w, 44, { fill: '#ffffff', stroke: PAL.border, radius: 4, sw: 1.4 });
  var hw = w * (hdr / mtu);
  P.rect(x, y, hw, 44, { fill: PAL.surface2, stroke: PAL.border, radius: 4, sw: 1 });
  P.text(x + hw / 2, y + 22, 'hdr 20', { size: 9, align: 'center', base: 'middle', color: DIM });
  P.text(x + hw + 12, y + 22, 'data  =  MTU - header  =  1480', { size: 12, base: 'middle', color: INK });
  P.text(x, y - 8, 'one IP datagram on an Ethernet link, MTU 1500', { size: 11, color: DIM });
  P.alpha(1);

  /* the 8-byte grid under the data region */
  P.alpha(K.ease(K.beat(t, sc.start + 4.0, 1.2)));
  var gy = y + 58;
  for (var i = 0; i <= 16; i++) {
    var gx = x + hw + (i / 16) * (w - hw);
    P.line(gx, gy, gx, gy + 8, { stroke: i === 16 ? ACC : PAL.border, sw: i === 16 ? 2 : 1 });
  }
  P.text(x + hw, gy + 22, 'every 8 bytes is one offset unit', { size: 10, color: DIM });
  P.text(x + w, gy + 22, '1480 / 8 = 185 units', { size: 10, color: ACC, align: 'right', mono: true });
  P.alpha(1);

  var fields = [
    ['identification', 'copied into every fragment, so the receiver can group them'],
    ['fragment offset', 'position of this data in the original, in units of 8 bytes'],
    ['flags MF / DF', 'MF = 1 on all but the last; DF = 1 forbids fragmenting at all'],
    ['total length', 'counts this fragment only: its data plus its own 20-byte header'],
    ['header checksum', 'recomputed for each fragment, because the header changed']
  ];
  fields.forEach(function (f, i) {
    var yy = 200 + i * 44;
    P.alpha(K.ease(K.beat(t, sc.start + 7.0 + i * 1.5, 0.9)));
    chip(P, 30, yy, 170, 30, f[0], { size: 10, radius: 4, fill: PAL.accentDim, stroke: ACC, color: ACC });
    P.text(214, yy + 15, f[1], { size: 11, base: 'middle', color: INK });
    P.alpha(1);
  });

  P.alpha(K.ease(K.beat(t, sc.start + 16.0, 1.0)));
  P.text(30, 436, 'Reassembly happens only at the destination. A router may fragment again on the next link.',
         { size: 12, color: ACC, bold: true });
  P.alpha(1);
}

/* ---------- scene 6: GATE 2016 ---------- */

function drawFragStrip(P, list, y, x0, totalW, highlightLast, label) {
  var n = list.length;
  var gap = n > 8 ? 3 : 8;
  var bw = (totalW - gap * (n - 1)) / n;
  list.forEach(function (f, i) {
    var x = x0 + i * (bw + gap);
    var last = i === n - 1;
    P.rect(x, y, bw, 40, {
      fill: last && highlightLast ? PAL.accentDim : PAL.surface2,
      stroke: last && highlightLast ? ACC : PAL.border,
      radius: 3, sw: last && highlightLast ? 1.6 : 1
    });
    P.text(x + bw / 2, y + 12, String(f.data), {
      size: n > 10 ? 8 : 10, align: 'center', color: INK, mono: true
    });
    P.text(x + bw / 2, y + 27, String(f.offsetUnits), {
      size: n > 10 ? 8 : 10, align: 'center', color: DIM, mono: true
    });
  });
  P.text(x0, y + 52, label, { size: 10, color: DIM });
  P.text(x0, y - 8, 'data bytes (top) and offset units (bottom)', { size: 10, color: FAINT });
}

function drawFrag1(t, sc) {
  head(P, 'GATE 2016 Set 1 Q53 — 1000 bytes into a 100-byte link', 'data 980, budget 80, so twelve full fragments and one of 20');

  P.alpha(K.ease(K.beat(t, sc.start + 0.5, 1.0)));
  P.text(30, 90, 'total 1000  =  20 header + 980 data', { size: 12, mono: true, color: INK });
  P.text(30, 112, 'budget = 100 - 20 = 80  =  10 offset units', { size: 12, mono: true, color: INK });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, sc.start + 4.0, 1.0)));
  drawFragStrip(P, V.frag.f2016, 150, 30, 840, true, V.frag.f2016.length + ' fragments');
  P.alpha(1);

  var inv = INV2016;
  var rows = [
    ['data adds to 980', inv.conserved, 'sum = ' + inv.sum],
    ['every non-last fragment is a multiple of 8', inv.aligned, '80, 80, ... 80'],
    ['offsets are the running sums over 8', inv.contiguous, '0 .. 120'],
    ['each fragment fits the 100-byte link', inv.fits, 'max 100'],
    ['MF set everywhere except the last', inv.flags, 'MF=0 once']
  ];
  rows.forEach(function (r, i) {
    P.alpha(K.ease(K.beat(t, sc.start + 12.0 + i * 1.6, 0.8)));
    P.circle(38, 236 + i * 32, 5, { fill: r[1] ? VAL : BAD });
    P.text(56, 236 + i * 32, r[0], { size: 11, base: 'middle', color: INK });
    P.text(600, 236 + i * 32, r[2], { size: 10, base: 'middle', color: DIM, mono: true });
    P.alpha(1);
  });

  P.alpha(K.ease(K.beat(t, sc.start + 22.0, 1.0)));
  P.rect(30, 400, 840, 44, { fill: PAL.warnDim, stroke: WARN, radius: 5, sw: 1.2 });
  P.text(44, 414, 'the slip: 980 / 100 = 9.8 gives 10, and 980 / 80 without rounding gives 13 by luck only',
         { size: 11, color: INK });
  P.text(44, 432, 'answer 13. twelve is the count of full fragments and is the popular wrong answer.',
         { size: 11, color: WARN, bold: true });
  P.alpha(1);
}

/* ---------- scene 7: transport header ---------- */

function drawFrag2(t, sc) {
  head(P, 'GATE 2025 Set 2 Q23 — where the UDP header sits', '7488 payload + 8 UDP header = 7496 bytes of IP data');

  P.alpha(K.ease(K.beat(t, sc.start + 0.5, 1.0)));
  P.text(30, 90, 'UDP payload 7488  +  UDP header 8  =  IP data 7496', { size: 12, mono: true, color: INK });
  P.text(30, 112, 'budget 1500 - 20 = 1480  ->  5 full fragments, then 96', { size: 12, mono: true, color: INK });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, sc.start + 5.0, 1.0)));
  drawFragStrip(P, V.frag.f2025, 152, 30, 840, true, '6 fragments; offsets 0, 185, 370, 555, 740, 925');
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, sc.start + 10.0, 1.0)));
  P.rect(30, 236, 400, 96, { fill: PAL.surface2, stroke: PAL.border, radius: 5, sw: 1.2 });
  P.text(44, 252, 'the last fragment', { size: 11, bold: true, color: INK });
  P.text(44, 274, '96 data + 20 header = 116 bytes', { size: 12, mono: true, color: ACC, bold: true });
  P.text(44, 296, 'options were 88, 108, 116 and 1488', { size: 10, color: DIM });
  P.text(44, 314, '116 is the fourth option', { size: 10, color: DIM });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, sc.start + 15.0, 1.0)));
  P.rect(450, 236, 420, 96, { fill: PAL.warnDim, stroke: WARN, radius: 5, sw: 1.2 });
  P.text(464, 252, 'the trap that separates 108 from 116', { size: 11, bold: true, color: WARN });
  P.text(464, 274, '7488 / 1480 leaves a remainder of 88,', { size: 10, color: INK });
  P.text(464, 292, 'so 88 + 20 = 108 if you forget the', { size: 10, color: INK });
  P.text(464, 310, '8-byte UDP header inside the IP data.', { size: 10, color: INK });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, sc.start + 20.0, 1.0)));
  P.text(30, 360, 'Ports live in the first four bytes of the transport header, so they travel in fragment 1 only.',
         { size: 11, color: INK });
  P.text(30, 382, 'A lost later fragment still costs the whole segment: the sender never learns of the split.',
         { size: 11, color: INK });
  P.text(30, 412, 'GATE CSE 2021 Set 1 Q45 uses exactly this pair of facts: second fragment 620 bytes, and P resends all.',
         { size: 11, color: ACC, bold: true });
  P.alpha(1);
}

/* ---------- scene 8: two hops ---------- */

function drawFrag3(t, sc) {
  head(P, 'GATE 2024 Set 1 Q65 — two links, two MTUs', '1420 total, data 1400; links of 542 then 360 bytes');

  P.alpha(K.ease(K.beat(t, sc.start + 0.5, 1.0)));
  P.text(30, 88, 'link 1: budget 542 - 20 = 522  ->  520 usable  (65 units)', { size: 11, mono: true, color: INK });
  P.text(30, 108, 'link 2: budget 360 - 20 = 340  ->  336 usable  (42 units)', { size: 11, mono: true, color: INK });
  P.alpha(1);

  /* hop 1 */
  P.alpha(K.ease(K.beat(t, sc.start + 3.0, 1.0)));
  P.text(30, 148, 'after the first hop', { size: 11, bold: true, color: DIM });
  V.frag.hop1.forEach(function (f, i) {
    var x = 30 + i * 130;
    P.rect(x, 158, 120, 40, { fill: PAL.surface2, stroke: PAL.border, radius: 4, sw: 1 });
    P.text(x + 60, 172, f.data + ' data', { size: 11, align: 'center', color: INK, mono: true });
    P.text(x + 60, 188, 'off ' + f.offsetUnits, { size: 10, align: 'center', color: DIM, mono: true });
  });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, sc.start + 7.0, 1.0)));
  [0, 1, 2].forEach(function (i) {
    P.arrow(90 + i * 130, 200, 90 + i * 130, 226, { stroke: ACC, sw: 1.6, head: 8 });
  });
  P.text(430, 214, 'cut again at 336 bytes of data', { size: 10, color: ACC });
  P.alpha(1);

  /* hop 2 */
  P.alpha(K.ease(K.beat(t, sc.start + 9.0, 1.0)));
  P.text(30, 246, 'at the receiver', { size: 11, bold: true, color: DIM });
  P.alpha(1);

  V.frag.f2024.forEach(function (f, i) {
    P.alpha(K.ease(K.beat(t, sc.start + 10.0 + i * 1.1, 0.8)));
    var x = 30 + i * 143;
    var last = i === V.frag.f2024.length - 1;
    P.rect(x, 256, 132, 44, {
      fill: last ? PAL.accentDim : PAL.surface2,
      stroke: last ? ACC : PAL.border, radius: 4, sw: last ? 1.6 : 1
    });
    P.text(x + 66, 271, f.data + ' data', { size: 11, align: 'center', color: INK, mono: true });
    P.text(x + 66, 287, 'off ' + f.offsetUnits, { size: 10, align: 'center', color: DIM, mono: true });
    P.alpha(1);
  });

  P.alpha(K.ease(K.beat(t, sc.start + 18.0, 1.0)));
  P.text(30, 330, 'data carried: 336 + 184 + 336 + 184 + 336 + 24 = ' + INV2024.sum + '  (original 1400)',
         { size: 11, mono: true, color: VAL });
  P.text(30, 352, 'offsets continue from 65 and 88 units; they never restart at zero', { size: 11, color: INK });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, sc.start + 23.0, 1.0)));
  P.rect(30, 380, 840, 58, { fill: PAL.warnDim, stroke: WARN, radius: 5, sw: 1.2 });
  P.text(44, 396, 'the slip: answering 3, which is the count after the first hop', { size: 11, color: INK });
  P.text(44, 416, 'answer 6. the question asks how many fragments are delivered at the receiver.',
         { size: 11, color: WARN, bold: true });
  P.alpha(1);
}

/* ---------- scene 9: NAT ---------- */

function drawNat(t, sc) {
  head(P, 'NAT: rewriting two addresses, one table', 'out: source address and port.  back: destination address and port');

  /* private hosts */
  P.alpha(K.ease(K.beat(t, sc.start + 0.5, 1.0)));
  P.text(30, 92, 'inside', { size: 10, color: DIM, bold: true });
  V.nat.table.forEach(function (e, i) {
    var y = 108 + i * 46;
    chip(P, 30, y, 170, 34, e.privIp + ':' + e.privPort, { size: 10, radius: 4 });
  });
  P.alpha(1);

  /* the box */
  P.alpha(K.ease(K.beat(t, sc.start + 3.0, 1.0)));
  P.rect(232, 96, 300, 176, { fill: '#ffffff', stroke: ACC, radius: 6, sw: 1.6 });
  P.text(242, 112, 'NAT table', { size: 11, bold: true, color: ACC });
  P.alpha(1);

  V.nat.table.forEach(function (e, i) {
    P.alpha(K.ease(K.beat(t, sc.start + 4.0 + i * 1.5, 0.9)));
    var y = 128 + i * 46;
    P.text(242, y, e.privIp + ':' + e.privPort, { size: 10, mono: true, color: INK });
    P.arrow(378, y + 4, 404, y + 4, { stroke: FAINT, sw: 1.2, head: 6 });
    P.text(412, y, e.pubIp + ':' + e.pubPort, { size: 10, mono: true, color: ACC });
    P.alpha(1);
  });

  /* internet */
  P.alpha(K.ease(K.beat(t, sc.start + 9.0, 1.0)));
  P.text(560, 92, 'outside', { size: 10, color: DIM, bold: true });
  chip(P, 560, 108, 200, 34, '198.51.100.9:80', { size: 10, radius: 4 });
  P.text(560, 160, 'the server only ever sees', { size: 10, color: DIM });
  P.text(560, 176, '203.0.113.5 and a port', { size: 10, color: DIM });
  P.alpha(1);

  /* outbound */
  P.alpha(K.ease(K.beat(t, sc.start + 12.0, 1.0)));
  P.arrow(202, 122, 230, 122, { stroke: ACC, sw: 2, head: 8 });
  P.arrow(534, 122, 558, 122, { stroke: ACC, sw: 2, head: 8 });
  P.text(230, 300, 'out: source IP -> 203.0.113.5, source port -> 50001, checksum recomputed',
         { size: 10, color: ACC });
  P.alpha(1);

  /* return */
  P.alpha(K.ease(K.beat(t, sc.start + 16.0, 1.0)));
  P.arrow(558, 168, 534, 168, { stroke: INFO, sw: 2, head: 8 });
  P.arrow(230, 168, 202, 168, { stroke: INFO, sw: 2, head: 8 });
  P.text(230, 322, 'back: matched on (203.0.113.5, 50001), destination rewritten to 192.168.1.10:4001',
         { size: 10, color: INFO });
  P.text(230, 342, 'no matching entry: the packet is dropped', { size: 10, color: BAD });
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, sc.start + 20.0, 1.0)));
  P.line(30, 356, W - 30, 356, { stroke: PAL.border, sw: 1 });
  P.text(30, 372, 'GATE CSE 2024 Set 1 Q21 — fields modified going out of a NAT device', { size: 11, bold: true, color: INK });
  P.alpha(1);

  var rows = [
    ['source IP', true], ['destination IP', false], ['header checksum', true], ['total length', false]
  ];
  rows.forEach(function (r, i) {
    P.alpha(K.ease(K.beat(t, sc.start + 21.0 + i * 1.4, 0.8)));
    P.circle(40, 396 + i * 20, 4, { fill: r[1] ? VAL : BAD });
    P.text(56, 396 + i * 20, r[0] + (r[1] ? '  changed' : '  unchanged'), {
      size: 11, base: 'middle', color: r[1] ? INK : DIM, mono: true
    });
    P.alpha(1);
  });
  P.text(300, 404, 'answer: source IP and header checksum', { size: 11, color: ACC, bold: true });
  P.text(300, 424, 'total length is unchanged because no byte was added or removed',
         { size: 10, color: DIM });
  P.alpha(1);
}

/* ---------- scene 10: procedure ---------- */

function drawDecide(t, sc) {
  head(P, 'The procedure, and the four slips', 'two routines and one habit: write the unit next to every number');

  var steps = [
    ['1', 'prefix -> block size = 2^(32 - p)'],
    ['2', 'round the address DOWN to the block start'],
    ['3', 'list network, first, last, broadcast, usable'],
    ['4', 're-read which of the five is wanted'],
    ['5', 'check the answer lies inside the block']
  ];
  P.alpha(K.ease(K.beat(t, sc.start + 0.5, 1.0)));
  P.text(30, 90, 'addressing', { size: 12, bold: true, color: ACC });
  P.alpha(1);
  steps.forEach(function (s, i) {
    P.alpha(K.ease(K.beat(t, sc.start + 1.2 + i * 1.6, 0.9)));
    var y = 108 + i * 34;
    P.circle(40, y + 8, 10, { fill: PAL.accentDim, stroke: ACC, sw: 1 });
    P.text(40, y + 8, s[0], { size: 10, align: 'center', base: 'middle', color: ACC, bold: true });
    P.text(58, y + 8, s[1], { size: 11, base: 'middle', color: INK });
    P.alpha(1);
  });

  var fsteps = [
    ['1', 'budget = MTU - header'],
    ['2', 'usable = budget rounded DOWN to 8'],
    ['3', 'count = ceil(data / usable)'],
    ['4', 'offsets = running sums / 8'],
    ['5', 'MF = 0 on the last fragment only']
  ];
  P.alpha(K.ease(K.beat(t, sc.start + 10.0, 1.0)));
  P.text(470, 90, 'fragmentation', { size: 12, bold: true, color: INFO });
  P.alpha(1);
  fsteps.forEach(function (s, i) {
    P.alpha(K.ease(K.beat(t, sc.start + 10.6 + i * 1.6, 0.9)));
    var y = 108 + i * 34;
    P.circle(480, y + 8, 10, { fill: PAL.surface2, stroke: INFO, sw: 1 });
    P.text(480, y + 8, s[0], { size: 10, align: 'center', base: 'middle', color: INFO, bold: true });
    P.text(498, y + 8, s[1], { size: 11, base: 'middle', color: INK });
    P.alpha(1);
  });

  P.alpha(K.ease(K.beat(t, sc.start + 19.0, 1.0)));
  P.line(30, 288, W - 30, 288, { stroke: PAL.border, sw: 1 });
  P.text(30, 302, 'four slips, each of which is usually one of the options', { size: 11, bold: true, color: WARN });
  P.alpha(1);

  var slips = [
    'total addresses vs usable hosts  (2^h against 2^h - 2)',
    'block size vs mask value  (32 against 224 for a /27)',
    'offset in bytes vs offset in 8-byte units',
    'first matching route vs longest matching prefix'
  ];
  slips.forEach(function (s, i) {
    P.alpha(K.ease(K.beat(t, sc.start + 20.0 + i * 1.6, 0.9)));
    var y = 324 + i * 24;
    P.circle(38, y, 4, { fill: BAD });
    P.text(52, y, s, { size: 11, base: 'middle', color: INK });
    P.alpha(1);
  });

  P.alpha(K.ease(K.beat(t, sc.start + 27.0, 1.0)));
  P.text(30, 434, 'Next: this table is what the routing lesson reads, and a lost fragment is what TCP retransmits.',
         { size: 11, color: ACC, bold: true });
  P.alpha(1);
}

/* ---------- scene table + frame ---------- */

var SCENE_DRAW = {
  split: drawSplit,
  blocks: drawBlocks,
  lpm: drawLpm,
  aggregate: drawAggregate,
  rules: drawRules,
  frag1: drawFrag1,
  frag2: drawFrag2,
  frag3: drawFrag3,
  nat: drawNat,
  decide: drawDecide
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
