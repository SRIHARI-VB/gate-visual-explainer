/* ==========================================================================
   vlsm-subnet-design-longest-prefix-and-aggregation — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model is a small address-arithmetic engine: it converts a requirement
   list into prefixes, allocates blocks, decomposes the free space, resolves
   destinations by longest prefix match, and merges routing entries. The drawing
   code reads those results. Nothing on the canvas is typed in by hand.
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

/* ---------- 1. addresses as numbers ---------- */

function ipToInt(s) {
  var p = String(s).split('.');
  return (((+p[0] & 255) << 24) >>> 0) + ((+p[1] & 255) << 16) + ((+p[2] & 255) << 8) + (+p[3] & 255);
}

function intToIp(v) {
  v = v >>> 0;
  return [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255].join('.');
}

function maskOf(p) { return p === 0 ? 0 : ((0xFFFFFFFF << (32 - p)) >>> 0); }
function netOf(a, p) { return (a & maskOf(p)) >>> 0; }
function bsize(p) { return Math.pow(2, 32 - p); }
function alignedAt(a, p) { return a % bsize(p) === 0; }

function hostsIn(p) {
  if (p === 32) return 1;          // a host route
  if (p === 31) return 2;          // RFC 3021, point-to-point
  return bsize(p) - 2;             // network + broadcast reserved
}

/* the smallest block whose usable count covers h: the largest prefix length
   that still holds the requirement. Scanned from /32 downwards, because a
   larger prefix means a smaller block. */
function prefixFor(h) {
  for (var p = 32; p >= 0; p--) if (hostsIn(p) >= h) return p;
  return null;
}

function bitsOf(a, n) {
  var s = '';
  for (var i = 0; i < n; i++) s += String((a >>> (31 - i)) & 1);
  return s;
}

function cidr(a, p) { return intToIp(a) + '/' + p; }

/* ---------- 2. the block, the requirements, the allocation ---------- */

var BASE = ipToInt('100.64.0.0');
var BASEP = 22;
var BASE_LAST = BASE + bsize(BASEP) - 1;

var REQS = [
  { name: 'LAN-A', hosts: 400 },
  { name: 'LAN-B', hosts: 200 },
  { name: 'LAN-C', hosts: 100 },
  { name: 'LAN-D', hosts: 50 },
  { name: 'WAN', hosts: 2 }
];

REQS.forEach(function (r) {
  r.prefix = prefixFor(r.hosts);
  r.size = bsize(r.prefix);
  r.usable = hostsIn(r.prefix);
});

/* largest block first; each block at the lowest address that is aligned for
   its own size and does not overlap a block already placed. */
function allocate(base, bp, demands) {
  var order = demands.slice().sort(function (x, y) { return x.prefix - y.prefix; });
  var out = [];
  for (var i = 0; i < order.length; i++) {
    var d = order[i], s = bsize(d.prefix), placed = null;
    for (var a = base; a + s - 1 <= base + bsize(bp) - 1; a++) {
      if (!alignedAt(a, d.prefix)) continue;
      var clash = out.some(function (b) { return a <= b.last && b.first <= a + s - 1; });
      if (!clash) { placed = { name: d.name, hosts: d.hosts, prefix: d.prefix, first: a, last: a + s - 1, size: s }; break; }
    }
    if (!placed) return { blocks: out, complete: false, failed: d.name };
    out.push(placed);
  }
  return { blocks: out, complete: true, failed: null };
}

var DESIGN = allocate(BASE, BASEP, REQS);
var ALLOC = DESIGN.blocks;
var ALLOC_TOTAL = ALLOC.reduce(function (s, b) { return s + b.size; }, 0);

/* the free space, as maximal aligned blocks */
function freeBlocks(base, bp, used) {
  var lo = base, hi = base + bsize(bp) - 1;
  var sorted = used.slice().sort(function (a, b) { return a.first - b.first; });
  var gaps = [], cur = lo;
  sorted.forEach(function (b) {
    if (b.first > cur) gaps.push([cur, b.first - 1]);
    cur = Math.max(cur, b.last + 1);
  });
  if (cur <= hi) gaps.push([cur, hi]);

  var out = [];
  gaps.forEach(function (g) {
    var a = g[0], b = g[1];
    while (a <= b) {
      var p = 0;
      while (p < 32 && (!alignedAt(a, p) || a + bsize(p) - 1 > b)) p++;
      out.push({ first: a, last: a + bsize(p) - 1, prefix: p, size: bsize(p) });
      a += bsize(p);
    }
  });
  return { gaps: gaps, blocks: out };
}

var FREE = freeBlocks(BASE, BASEP, ALLOC);
var FREE_TOTAL = FREE.blocks.reduce(function (s, b) { return s + b.size; }, 0);
var FREE_MAX = FREE.blocks.reduce(function (m, b) { return Math.max(m, b.size); }, 0);

/* does a block of this prefix fit in the free space? */
function fitsInFree(p) {
  return FREE.blocks.some(function (b) { return b.size >= bsize(p); });
}

/* ---------- 3. the failing example: hosts fit, blocks do not ---------- */

var TRAP_PARENT = { addr: ipToInt('192.168.10.0'), prefix: 24 };
var TRAP_REQS = [100, 60, 60, 30].map(function (h) {
  var p = prefixFor(h);
  return { hosts: h, prefix: p, size: bsize(p), usable: hostsIn(p) };
});
var TRAP_HOST_SUM = TRAP_REQS.reduce(function (s, r) { return s + r.hosts; }, 0);
var TRAP_BLOCK_SUM = TRAP_REQS.reduce(function (s, r) { return s + r.size; }, 0);
var TRAP_PARENT_USABLE = hostsIn(TRAP_PARENT.prefix);
var TRAP_PARENT_SIZE = bsize(TRAP_PARENT.prefix);
var TRAP_FITS = allocate(TRAP_PARENT.addr, TRAP_PARENT.prefix,
  TRAP_REQS.map(function (r, i) { return { name: 'N' + i, hosts: r.hosts, prefix: r.prefix }; }));

/* ---------- 4. the forwarding table and longest prefix match ---------- */

function parseCidr(s) {
  var parts = String(s).split('/');
  return { addr: netOf(ipToInt(parts[0]), +parts[1]), prefix: +parts[1] };
}

var TABLE = [
  { cidr: '0.0.0.0/0', hop: 'ISP' },
  { cidr: '100.64.0.0/22', hop: 'core' },
  { cidr: '100.64.0.0/23', hop: 'LAN-A' },
  { cidr: '100.64.2.0/24', hop: 'LAN-B' },
  { cidr: '100.64.3.0/25', hop: 'LAN-C' },
  { cidr: '100.64.3.128/26', hop: 'LAN-D' },
  { cidr: '100.64.3.192/31', hop: 'WAN' }
].map(function (r) {
  var q = parseCidr(r.cidr);
  return { cidr: r.cidr, hop: r.hop, addr: q.addr, prefix: q.prefix };
});

var DESTS = ['100.64.1.7', '100.64.2.7', '100.64.3.9', '100.64.3.150',
             '100.64.3.193', '100.64.3.201', '100.64.9.9'];

function matchesFor(a, table) {
  return table.filter(function (r) { return netOf(a, r.prefix) === r.addr; });
}

/* the rule, applied: the longest prefix among the rows that match */
function lpm(a, table) {
  var m = matchesFor(a, table);
  if (!m.length) return null;
  return m.reduce(function (best, r) { return r.prefix > best.prefix ? r : best; });
}

/* an independent check of the same rule, written differently: compare the
   first p bits of the address with the first p bits of the route */
function lpmBitwise(a, table) {
  var best = null;
  table.forEach(function (r) {
    if (bitsOf(a, r.prefix) === bitsOf(r.addr, r.prefix)) {
      if (!best || r.prefix > best.prefix) best = r;
    }
  });
  return best;
}

var LOOKUPS = DESTS.map(function (d) {
  var a = ipToInt(d);
  var m = matchesFor(a, TABLE);
  return { dest: d, addr: a, matches: m, best: lpm(a, TABLE), bits: lpmBitwise(a, TABLE) };
});

/* ---------- 5. aggregation ---------- */

function lcpLen(a, b) {
  var x = (a ^ b) >>> 0, n = 0;
  for (var i = 31; i >= 0; i--) { if ((x >>> i) & 1) break; n++; }
  return n;
}

function addrsOf(blocks) {
  var set = {};
  blocks.forEach(function (b) {
    for (var v = b.first; v <= b.last; v++) set[v] = 1;
  });
  return set;
}

function unionSize(blocks) { return Object.keys(addrsOf(blocks)).length; }

function sameUnion(a, b) {
  var A = addrsOf(a), B = addrsOf(b);
  var ka = Object.keys(A), kb = Object.keys(B);
  if (ka.length !== kb.length) return false;
  return ka.every(function (k) { return B[k] === 1; });
}

/* drop contained blocks, then merge sibling pairs until none is left */
function minimise(blocks) {
  var cur = blocks.map(function (b) { return { first: b.first, prefix: b.prefix }; });
  var changed = true, guard = 0;
  while (changed && guard++ < 200) {
    changed = false;
    var keep = cur.filter(function (b) {
      return !cur.some(function (o) {
        return o !== b && o.prefix < b.prefix && netOf(b.first, o.prefix) === o.first;
      });
    });
    if (keep.length !== cur.length) { cur = keep; changed = true; continue; }
    for (var i = 0; i < cur.length && !changed; i++) {
      for (var j = i + 1; j < cur.length && !changed; j++) {
        var a = cur[i], b = cur[j];
        if (a.prefix === b.prefix && a.prefix > 0) {
          var ha = a.first >>> (32 - a.prefix), hb = b.first >>> (32 - b.prefix);
          if ((ha ^ hb) === 1) {
            var merged = { first: netOf(Math.min(a.first, b.first), a.prefix - 1), prefix: a.prefix - 1 };
            cur = cur.filter(function (c) { return c !== a && c !== b; }).concat([merged]);
            changed = true;
          }
        }
      }
    }
  }
  return cur.map(function (b) {
    return { first: b.first, last: b.first + bsize(b.prefix) - 1, prefix: b.prefix, size: bsize(b.prefix) };
  }).sort(function (x, y) { return x.first - y.first; });
}

var AGG_FOUR = minimise([
  { first: ipToInt('100.64.0.0'), prefix: 24 },
  { first: ipToInt('100.64.1.0'), prefix: 24 },
  { first: ipToInt('100.64.2.0'), prefix: 24 },
  { first: ipToInt('100.64.3.0'), prefix: 24 }
]);

var AGG_HOLE_IN = [
  { first: ipToInt('100.64.0.0'), prefix: 24 },
  { first: ipToInt('100.64.1.0'), prefix: 24 },
  { first: ipToInt('100.64.2.0'), prefix: 24 },
  { first: ipToInt('100.64.3.0'), prefix: 24 },
  { first: ipToInt('100.64.6.0'), prefix: 24 }
];
var AGG_HOLE = minimise(AGG_HOLE_IN);
var AGG_HOLE_COVER = AGG_HOLE.reduce(function (s, b) { return s + b.size; }, 0);

var NON_SIB_A = { first: ipToInt('100.64.4.0'), prefix: 24 };
var NON_SIB_B = { first: ipToInt('100.64.6.0'), prefix: 24 };
var NON_SIB_LCP = lcpLen(NON_SIB_A.first, NON_SIB_B.first);
var NON_SIB_BLOCK = { first: netOf(NON_SIB_A.first, NON_SIB_LCP), prefix: NON_SIB_LCP };
NON_SIB_BLOCK.size = bsize(NON_SIB_BLOCK.prefix);
var NON_SIB_UNOWNED = NON_SIB_BLOCK.size - 2 * 256;

/* ---------- 6. the checks ---------- */

chk('base block spans 1024 addresses and starts at a multiple of 1024',
    bsize(BASEP) === 1024 && alignedAt(BASE, BASEP) && intToIp(BASE_LAST) === '100.64.3.255',
    intToIp(BASE) + '/' + BASEP + ' .. ' + intToIp(BASE_LAST));

chk('each requirement maps to the smallest block that holds it',
    REQS.every(function (r) {
      return hostsIn(r.prefix) >= r.hosts && (r.prefix === 32 || hostsIn(r.prefix + 1) < r.hosts);
    }),
    REQS.map(function (r) { return r.hosts + '->/' + r.prefix; }).join(' '));

chk('all five blocks are placed, aligned, disjoint and inside the base',
    DESIGN.complete && ALLOC.length === 5 && ALLOC.every(function (b) {
      return alignedAt(b.first, b.prefix) && b.first >= BASE && b.last <= BASE_LAST &&
             b.last - b.first + 1 === bsize(b.prefix);
    }) && ALLOC.every(function (b, i) {
      return ALLOC.every(function (c, j) { return i === j || b.last < c.first || c.last < b.first; });
    }),
    ALLOC.map(function (b) { return cidr(b.first, b.prefix); }).join(' '));

chk('allocated plus free equals the parent size',
    ALLOC_TOTAL + FREE_TOTAL === bsize(BASEP),
    ALLOC_TOTAL + ' + ' + FREE_TOTAL + ' = ' + (ALLOC_TOTAL + FREE_TOTAL));

chk('the free space is five maximal aligned blocks summing to 62',
    FREE.blocks.length === 5 && FREE_TOTAL === 62 && FREE.blocks.every(function (b) {
      return alignedAt(b.first, b.prefix);
    }),
    FREE.blocks.map(function (b) { return cidr(b.first, b.prefix); }).join(' '));

chk('no /26 fits in the free space, though 62 addresses are free',
    !fitsInFree(26) && FREE_MAX === 32 && FREE_TOTAL > 62 - 1,
    'largest free block ' + FREE_MAX + ' addresses, /26 needs 64');

chk('hosts fit a /24 (250 <= 254) but the blocks do not (288 > 256)',
    TRAP_HOST_SUM <= TRAP_PARENT_USABLE && TRAP_BLOCK_SUM > TRAP_PARENT_SIZE &&
    TRAP_HOST_SUM === 250 && TRAP_BLOCK_SUM === 288 && !TRAP_FITS.complete,
    TRAP_HOST_SUM + ' hosts vs ' + TRAP_PARENT_USABLE + ' usable; ' +
    TRAP_BLOCK_SUM + ' addresses vs ' + TRAP_PARENT_SIZE);

chk('longest prefix match agrees with a bit-by-bit match on all seven destinations',
    LOOKUPS.every(function (l) { return l.best && l.bits && l.best.cidr === l.bits.cidr; }),
    LOOKUPS.map(function (l) { return l.dest + '->' + l.best.hop; }).join(' '));

chk('the /31 wins for 100.64.3.193 and the /22 catches 100.64.3.201',
    LOOKUPS.filter(function (l) { return l.dest === '100.64.3.193'; })[0].best.cidr === '100.64.3.192/31' &&
    LOOKUPS.filter(function (l) { return l.dest === '100.64.3.201'; })[0].best.cidr === '100.64.0.0/22',
    'two destinations, two different reasons');

chk('row order does not change any answer',
    DESTS.every(function (d) {
      var a = ipToInt(d);
      var shuffled = TABLE.slice().reverse();
      var rotated = TABLE.slice(3).concat(TABLE.slice(0, 3));
      return lpm(a, TABLE).cidr === lpm(a, shuffled).cidr &&
             lpm(a, TABLE).cidr === lpm(a, rotated).cidr;
    }),
    'reversed and rotated tables give the same seven answers');

chk('four sibling /24s merge to one /22 covering exactly the same 1024 addresses',
    AGG_FOUR.length === 1 && AGG_FOUR[0].prefix === 22 && unionSize(AGG_FOUR) === 1024 &&
    sameUnion(AGG_FOUR, [
      { first: ipToInt('100.64.0.0'), last: ipToInt('100.64.0.255') },
      { first: ipToInt('100.64.1.0'), last: ipToInt('100.64.1.255') },
      { first: ipToInt('100.64.2.0'), last: ipToInt('100.64.2.255') },
      { first: ipToInt('100.64.3.0'), last: ipToInt('100.64.3.255') }
    ]),
    AGG_FOUR.map(function (b) { return cidr(b.first, b.prefix); }).join(' '));

chk('the minimal aggregate of four /24s plus a hole is two rows covering exactly 1280 addresses',
    AGG_HOLE.length === 2 && AGG_HOLE_COVER === 1280 && unionSize(AGG_HOLE) === 1280 &&
    sameUnion(AGG_HOLE, AGG_HOLE_IN.map(function (b) {
      return { first: b.first, last: b.first + 255 };
    })),
    AGG_HOLE.map(function (b) { return cidr(b.first, b.prefix); }).join(' ') + ' = ' + AGG_HOLE_COVER);

chk('100.64.4.0/24 and 100.64.6.0/24 are not siblings: their only common block covers 512 unowned addresses',
    NON_SIB_LCP === 22 && NON_SIB_BLOCK.size === 1024 && NON_SIB_UNOWNED === 512 &&
    (AGG_HOLE_IN[0].first >> 0) === ipToInt('100.64.0.0'),
    'common prefix ' + NON_SIB_LCP + ' bits, block ' +
    cidr(NON_SIB_BLOCK.first, NON_SIB_BLOCK.prefix) + ' covers ' + NON_SIB_UNOWNED + ' unowned');

/* ======================================================================
   LAYER 2 - RENDER HELPERS
   ====================================================================== */

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

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

function bitsStrip(x, y, cell, a, markFrom, markTo, cFrom, cTo) {
  var s = bitsOf(a, 32);
  for (var i = 0; i < 32; i++) {
    var on = i >= markFrom && i < markTo;
    box(x + i * cell, y, cell - 2, 20, {
      fill: on ? (cFrom || ACCDIM) : (cTo || SURF2),
      stroke: on ? ACC : BORDER, sw: 1, radius: 2
    });
    T(x + i * cell + (cell - 2) / 2, y + 10, s.charAt(i), {
      size: 10, mono: true, align: 'center', base: 'middle',
      color: on ? ACC : DIM
    });
  }
}

/* a proportional bar over an address range */
function rangeBar(x, y, w, from, to, parts, opts) {
  opts = opts || {};
  var span = to - from + 1;
  var px = function (v) { return x + ((v - from) / span) * w; };
  box(x, y, w, opts.h || 26, { fill: SURF, stroke: BORDER, radius: 3 });
  parts.forEach(function (p) {
    var x0 = px(p.first), x1 = px(p.last + 1);
    P.rect(x0, y, Math.max(1, x1 - x0), opts.h || 26, {
      fill: p.fill || ACCDIM, stroke: p.stroke || ACC, sw: 1, radius: 0
    });
    if (p.label && (x1 - x0) > 26) {
      T((x0 + x1) / 2, y + (opts.h || 26) / 2, p.label, {
        size: 9.5, mono: true, align: 'center', base: 'middle', color: p.colour || ACC
      });
    }
  });
  return px;
}

/* ======================================================================
   LAYER 3 - SCENES
   ====================================================================== */

var SCENE_DRAW = {};

/* ---------- scene 1: an address, a prefix, a block ---------- */

SCENE_DRAW.block = function (t, sc) {
  head('An address is 32 bits; a prefix is a length',
       '100.64.0.0/22 fixes 22 bits from the left and leaves 10 free');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  bitsStrip(32, 76, 26, BASE, 0, 22, ACCDIM, SURF2);
  T(32, 104, '100.64.0.0 = 01100100 01000000 00000000 00000000', { size: 10.5, mono: true, color: DIM });
  T(32 + 22 * 26 - 4, 122, 'first 22 bits fixed by the prefix', { size: 10, color: ACC, align: 'right' });
  T(32, 122, 'last 10 bits free: the host field', { size: 10, color: WARN });

  P.alpha(b);
  box(32, 146, 836, 58, { fill: SURF, stroke: BORDER });
  T(46, 158, 'the block: 2^(32-22) = 2^10 = 1024 addresses', { size: 11, bold: true, color: INK });
  rangeBar(46, 172, 808, 0, 3, [
    { first: 0, last: 0, label: '.0.0-.0.255' },
    { first: 1, last: 1, label: '.1.0-.1.255' },
    { first: 2, last: 2, label: '.2.0-.2.255' },
    { first: 3, last: 3, label: '.3.0-.3.255' }
  ], { h: 22 });
  T(46, 198, 'four /24s: 100.64.0.0 to 100.64.3.255', { size: 9.5, color: DIM });

  P.alpha(c);
  box(32, 214, 400, 62, { fill: SURF, stroke: VAL });
  T(46, 226, 'alignment holds', { size: 11, bold: true, color: VAL });
  tick(46, 246, VAL);
  T(70, 240, '1024 divides 100.64.0.0, so /22 is legal here', { size: 10, color: INK });
  T(70, 258, 'the next /22 starts at 100.64.4.0', { size: 10, color: DIM });

  P.alpha(d);
  box(448, 214, 420, 62, { fill: BADDIM, stroke: BAD });
  T(462, 226, 'alignment fails', { size: 11, bold: true, color: BAD });
  cross(462, 244, BAD);
  T(486, 238, '100.64.0.48/26: 64 does not divide 48', { size: 10, color: INK });
  T(486, 256, 'so it names 100.64.0.0/26', { size: 10, bold: true, color: BAD });

  P.alpha(1);
  T(32, 300, 'Size follows from the prefix alone. Position does not: a block starts at a multiple of its own size.', { size: 10.5, color: DIM });
  T(32, 320, 'Class A: the 2027 clause is "IPv4 - Fragmentation, CIDR Notation, Network Address Translation".', { size: 10, color: FAINT });
  T(32, 340, 'Every number on this canvas is computed by the page: ' + cidr(BASE, BASEP) + ' holds ' + bsize(BASEP) + ' addresses.', { size: 10, color: FAINT });
};

/* ---------- scene 2: halving ---------- */

SCENE_DRAW.split = function (t, sc) {
  head('Halving: equal subnets, and what they cost',
       'each split fixes one more bit, so 2^k equal subnets have prefix p+k');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(32, 66, 'one /22', { size: 10, color: DIM });
  rangeBar(120, 62, 748, 0, 3, [{ first: 0, last: 3, label: '/22  ·  1024 addresses' }], { h: 22 });

  T(32, 106, 'two /23s', { size: 10, color: DIM });
  rangeBar(120, 102, 748, 0, 3, [
    { first: 0, last: 1, label: '/23' },
    { first: 2, last: 3, label: '/23', fill: WARNDIM, stroke: WARN, colour: WARN }
  ], { h: 22 });

  T(32, 146, 'four /24s', { size: 10, color: DIM });
  rangeBar(120, 142, 748, 0, 3, [
    { first: 0, last: 0, label: '/24' },
    { first: 1, last: 1, label: '/24', fill: WARNDIM, stroke: WARN, colour: WARN },
    { first: 2, last: 2, label: '/24' },
    { first: 3, last: 3, label: '/24', fill: WARNDIM, stroke: WARN, colour: WARN }
  ], { h: 22 });

  P.alpha(b);
  box(32, 178, 836, 44, { fill: ACCDIM, stroke: ACC });
  T(46, 192, '2^k equal subnets  ·  prefix p + k  ·  size 2^(32-p-k)  ·  here k = 2 gives four /24s of 256', {
    size: 11, mono: true, color: INK
  });

  P.alpha(c);
  T(32, 240, 'the two needs, as blocks', { size: 10.5, bold: true, color: INK });
  T(32, 262, '400 hosts  →  needs 510 usable  →  /23  →  512 addresses', { size: 10.5, mono: true, color: INK });
  T(32, 282, '2 hosts    →  needs 2 usable    →  /31  →  2 addresses', { size: 10.5, mono: true, color: INK });
  rangeBar(32, 296, 836, 0, 511, [
    { first: 0, last: 401, label: '400 hosts need 402 addresses of the 512', fill: ACCDIM, stroke: ACC },
    { first: 402, last: 511, label: '', fill: SURF, stroke: BORDER }
  ], { h: 22 });

  P.alpha(d);
  box(32, 330, 836, 56, { fill: WARNDIM, stroke: WARN });
  T(46, 344, 'equal subnets: the 2-host link would also get a /23, holding 512 addresses for 2', { size: 11, color: INK });
  T(46, 364, 'a quarter of the /22 spent on two endpoints — unequal prefixes are what recover it', { size: 10.5, color: WARN });

  P.alpha(1);
  T(32, 404, 'The 512 of the /23 is the block, not the usable count: 510 addresses can carry a host.', { size: 10, color: DIM });
  T(32, 424, 'A split never creates addresses. The four /24s together are the same 1024.', { size: 10, color: FAINT });
};

/* ---------- scene 3: how many hosts ---------- */

SCENE_DRAW.hosts = function (t, sc) {
  head('What a block holds: 2^h − 2, and its exceptions',
       'the two reserved addresses are per block, and two prefixes escape the formula');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  box(32, 68, 400, 64, { fill: ACCDIM, stroke: ACC });
  T(46, 82, 'a block with h host bits', { size: 11, bold: true, color: ACC });
  T(46, 102, '2^h addresses, two reserved', { size: 10.5, color: INK });
  T(46, 120, 'usable hosts = 2^h − 2', { size: 12, mono: true, bold: true, color: INK });

  P.alpha(b);
  var rows = [24, 25, 26, 27, 28, 29, 30, 31, 32];
  box(456, 68, 412, 24 + rows.length * 22, { fill: SURF, stroke: BORDER });
  T(470, 80, 'prefix', { size: 9.5, color: DIM });
  T(556, 80, 'addresses', { size: 9.5, color: DIM });
  T(660, 80, 'usable hosts', { size: 9.5, color: DIM });
  T(790, 80, 'note', { size: 9.5, color: DIM });
  rows.forEach(function (p, i) {
    var y = 98 + i * 22;
    var special = (p === 31 || p === 32);
    if (special) P.rect(462, y - 3, 400, 20, { fill: WARNDIM, stroke: WARNDIM, radius: 3 });
    T(470, y, '/' + p, { size: 10.5, mono: true, color: special ? WARN : INK });
    T(556, y, String(bsize(p)), { size: 10.5, mono: true, color: DIM });
    T(660, y, String(hostsIn(p)), { size: 10.5, mono: true, bold: special, color: special ? WARN : INK });
    if (p === 31) T(790, y, 'RFC 3021', { size: 9.5, color: WARN });
    if (p === 32) T(790, y, 'host route', { size: 9.5, color: WARN });
  });

  P.alpha(c);
  box(32, 150, 400, 96, { fill: SURF, stroke: WARN });
  T(46, 164, '/31 on a point-to-point link', { size: 11, bold: true, color: WARN });
  T(46, 184, '2^1 − 2 = 0 by the formula, but RFC 3021', { size: 10, color: INK });
  T(46, 202, 'gives both addresses to the two ends.', { size: 10, color: INK });
  T(46, 222, 'no directed broadcast exists on that link,', { size: 10, color: DIM });
  T(46, 238, 'so 2 hosts and no reserved pair.', { size: 10, color: DIM });

  P.alpha(d);
  box(32, 258, 400, 74, { fill: SURF, stroke: INFO });
  T(46, 272, '/32 is one address', { size: 11, bold: true, color: INFO });
  T(46, 292, '2^0 − 2 = −1, which is the formula telling', { size: 10, color: INK });
  T(46, 310, 'you it was not written for this case.', { size: 10, color: INK });

  P.alpha(1);
  T(32, 356, 'The sequence 254, 126, 62, 30, 14, 6, 2 is the fastest conversion from a host count to a prefix.', { size: 10.5, color: DIM });
  T(32, 376, 'Each step halves the block and then removes the two reserved addresses: that is why 30 goes to 14, not to 15.', { size: 10, color: DIM });
  T(32, 396, 'Verified fact: RFC 3021, "Using 31-Bit Prefixes on IPv4 Point-to-Point Links", December 2000.', { size: 10, color: FAINT });
};

/* ---------- scene 4: the design ---------- */

SCENE_DRAW.design = function (t, sc) {
  head('The design: largest first, each block aligned',
       'five needs inside ' + cidr(BASE, BASEP) + ', converted to prefixes and placed');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  box(32, 68, 372, 34 + REQS.length * 30, { fill: SURF, stroke: BORDER });
  T(46, 82, 'need', { size: 9.5, color: DIM });
  T(120, 82, 'hosts', { size: 9.5, color: DIM });
  T(200, 82, 'usable', { size: 9.5, color: DIM });
  T(290, 82, 'prefix', { size: 9.5, color: DIM });
  REQS.forEach(function (r, i) {
    var y = 106 + i * 30;
    T(46, y, r.name, { size: 10.5, mono: true, color: INK });
    T(120, y, String(r.hosts), { size: 10.5, mono: true, color: DIM });
    T(200, y, String(r.usable), { size: 10.5, mono: true, color: DIM });
    T(290, y, '/' + r.prefix, { size: 11, mono: true, bold: true, color: ACC });
  });

  P.alpha(b);
  box(420, 68, 448, 46, { fill: ACCDIM, stroke: ACC });
  T(434, 82, 'smallest block that holds the need', { size: 10.5, bold: true, color: ACC });
  T(434, 100, '400 does not fit 254, so /23;  200 does not fit 126, so /24', { size: 10, color: INK });

  P.alpha(c);
  var px = rangeBar(32, 148, 836, BASE, BASE_LAST, ALLOC.map(function (bl) {
    return { first: bl.first, last: bl.last, label: '/' + bl.prefix, fill: ACCDIM, stroke: ACC };
  }), { h: 34 });
  ALLOC.forEach(function (bl) {
    T(px(bl.first) + 4, 190, intToIp(bl.first) + '/' + bl.prefix, { size: 9, mono: true, color: DIM });
  });
  T(32, 208, 'placed at the lowest address aligned for their size: /23, /24, /25, /26, /31', { size: 10, color: DIM });

  P.alpha(d);
  box(32, 228, 836, 66, { fill: SURF, stroke: BORDER });
  T(46, 242, 'addresses used: ' + ALLOC_TOTAL + ' of ' + bsize(BASEP) + '   ·   free: ' + FREE_TOTAL +
             '   ·   blocks placed: ' + ALLOC.length + ' of 5', { size: 11, mono: true, bold: true, color: INK });
  T(46, 264, 'largest first works because a big block needs a big aligned hole, and holes only shrink.', { size: 10.5, color: DIM });
  T(46, 282, 'A /31 placed first at the bottom would cut the free space into pieces of 2, 4, 8 … 256.', { size: 10, color: DIM });

  P.alpha(1);
  T(32, 314, 'Check each line of the answer twice: the prefix comes from the requirement, the address from the alignment.', { size: 10.5, color: DIM });
  T(32, 334, 'This is a procedure, not a theorem about every order. The page checks this design; it does not claim every other order fails.', { size: 10, color: FAINT });
  T(32, 354, 'Every figure above is computed from the five host counts when the page loads.', { size: 10, color: FAINT });
};

/* ---------- scene 5: what is left ---------- */

SCENE_DRAW.leftover = function (t, sc) {
  head('What is left is five blocks, not one number',
       FREE_TOTAL + ' free addresses, the largest block holding ' + FREE_MAX);

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(32, 66, 'the last /24 of the block: 100.64.3.0 to 100.64.3.255', { size: 10.5, color: DIM });
  var px = rangeBar(32, 80, 836, 0, 255, [
    { first: 0, last: 127, label: 'LAN-C /25', fill: ACCDIM, stroke: ACC },
    { first: 128, last: 191, label: 'LAN-D /26', fill: ACCDIM, stroke: ACC },
    { first: 192, last: 193, label: '', fill: WARNDIM, stroke: WARN },
    { first: 194, last: 255, label: 'free: 62 addresses', fill: WARNDIM, stroke: WARN, colour: WARN }
  ], { h: 30 });
  T(px(192) - 2, 120, '/31', { size: 9, mono: true, color: WARN });
  T(px(194) + 4, 120, '194 is not a multiple of 64, so this is not one block', { size: 9.5, color: WARN });

  P.alpha(b);
  box(32, 138, 836, 74, { fill: SURF, stroke: BORDER });
  T(46, 152, 'decomposed into maximal aligned blocks', { size: 10.5, bold: true, color: INK });
  var fx = 46;
  FREE.blocks.forEach(function (fb) {
    var w = fb.size * 2.4;
    box(fx, 164, Math.max(18, w), 26, { fill: WARNDIM, stroke: WARN, radius: 3 });
    T(fx + Math.max(18, w) / 2, 177, String(fb.size), { size: 9.5, mono: true, align: 'center', base: 'middle', color: WARN });
    T(fx, 198, '/' + fb.prefix, { size: 9, mono: true, color: DIM });
    fx += Math.max(18, w) + 10;
  });
  T(700, 152, FREE_TOTAL + ' = 2+4+8+16+32', { size: 10, mono: true, color: ACC });

  P.alpha(c);
  box(32, 224, 400, 76, { fill: BADDIM, stroke: BAD });
  T(46, 238, 'a new LAN needing 40 hosts', { size: 11, bold: true, color: BAD });
  cross(46, 256, BAD);
  T(70, 250, 'wants a /26: 64 addresses', { size: 10, color: INK });
  T(70, 268, 'largest free block is ' + FREE_MAX + ': does not fit', { size: 10, bold: true, color: BAD });
  T(70, 286, 'though ' + FREE_TOTAL + ' addresses are free', { size: 10, color: DIM });

  box(448, 224, 420, 76, { fill: SURF, stroke: VAL });
  T(462, 238, 'a LAN needing 30 hosts', { size: 11, bold: true, color: VAL });
  tick(462, 258, VAL);
  T(486, 250, 'wants a /27: 32 addresses', { size: 10, color: INK });
  T(486, 268, 'the /27 at 100.64.3.224 fits exactly', { size: 10, color: VAL });

  P.alpha(d);
  box(32, 312, 836, 54, { fill: ACCDIM, stroke: ACC });
  T(46, 326, 'free space is a set of blocks, not a number.', { size: 11.5, bold: true, color: INK });
  T(46, 346, 'A count answers "how many"; the design question is "of what size, at which aligned address".', { size: 10.5, color: INK });

  P.alpha(1);
  T(32, 384, 'Decomposition is unique: take the largest block that fits at the current address, then move past it.', { size: 10, color: DIM });
  T(32, 404, 'Two plans can leave the same total free and support different growth. Only the shape distinguishes them.', { size: 10, color: FAINT });
};

/* ---------- scene 6: the wrong test ---------- */

SCENE_DRAW.trap = function (t, sc) {
  head('The sum of hosts is the wrong test',
       'a /24, and four needs of 100, 60, 60 and 30 hosts');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  box(32, 68, 400, 84, { fill: SURF, stroke: VAL });
  T(46, 82, 'hosts: the sum fits', { size: 11, bold: true, color: VAL });
  tick(46, 104, VAL);
  T(70, 96, TRAP_HOST_SUM + ' needed  ≤  ' + TRAP_PARENT_USABLE + ' usable', { size: 11, mono: true, color: INK });
  T(70, 116, '100 + 60 + 60 + 30 = ' + TRAP_HOST_SUM, { size: 10, mono: true, color: DIM });
  T(70, 136, 'four addresses to spare', { size: 10, color: DIM });

  P.alpha(b);
  box(32, 164, 400, 84, { fill: SURF, stroke: BORDER });
  T(46, 178, 'the blocks those needs require', { size: 11, bold: true, color: INK });
  TRAP_REQS.forEach(function (r, i) {
    T(46 + i * 96, 200, '/' + r.prefix, { size: 11, mono: true, bold: true, color: ACC });
    T(46 + i * 96, 218, String(r.size), { size: 10, mono: true, color: DIM });
  });
  T(46, 240, 'rounded up to a power of two, each with 2 reserved', { size: 9.5, color: DIM });

  P.alpha(c);
  box(456, 68, 412, 84, { fill: BADDIM, stroke: BAD });
  T(470, 82, 'addresses: the sum does not fit', { size: 11, bold: true, color: BAD });
  cross(470, 104, BAD);
  T(494, 96, TRAP_BLOCK_SUM + ' needed  >  ' + TRAP_PARENT_SIZE + ' available', { size: 11, mono: true, color: INK });
  T(494, 116, '128 + 64 + 64 + 32 = ' + TRAP_BLOCK_SUM, { size: 10, mono: true, color: DIM });
  T(494, 136, 'short by ' + (TRAP_BLOCK_SUM - TRAP_PARENT_SIZE) + ' addresses', { size: 10, bold: true, color: BAD });

  P.alpha(d);
  var acc = 0;
  TRAP_REQS.forEach(function (r, i) {
    var w = r.size * 2.9;
    box(32 + acc * 2.9, 282, w - 2, 30, { fill: BADDIM, stroke: BAD, radius: 3 });
    T(32 + acc * 2.9 + (w - 2) / 2, 297, '/' + r.prefix, { size: 9.5, mono: true, align: 'center', base: 'middle', color: BAD });
    acc += r.size;
  });
  T(32, 330, 'the parent is 256 addresses wide, and the four blocks need 288', { size: 10.5, color: INK });
  T(32, 350, 'the page tries every order and none succeeds: this is a failure by capacity, not by fragmentation', { size: 10, color: DIM });

  P.alpha(1);
  box(32, 368, 836, 46, { fill: ACCDIM, stroke: ACC });
  T(46, 382, 'Add block sizes, not host counts.', { size: 11.5, bold: true, color: INK });
  T(46, 402, 'The gap is two reserved addresses per block, plus rounding each need up to a power of two.', { size: 10.5, color: INK });
};

/* ---------- scene 7: longest prefix match ---------- */

SCENE_DRAW.lpm = function (t, sc) {
  head('Longest prefix match',
       'a destination can match several rows; the longest prefix among them wins');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  var hl = LOOKUPS.filter(function (l) { return l.dest === '100.64.3.201'; })[0];
  var hh = LOOKUPS.filter(function (l) { return l.dest === '100.64.3.193'; })[0];
  var hd = LOOKUPS.filter(function (l) { return l.dest === '100.64.9.9'; })[0];

  function table(hi, chosen) {
    box(32, 68, 452, 34 + TABLE.length * 26, { fill: SURF, stroke: BORDER });
    T(46, 82, 'prefix', { size: 9.5, color: DIM });
    T(220, 82, 'next hop', { size: 9.5, color: DIM });
    T(340, 82, 'length', { size: 9.5, color: DIM });
    TABLE.forEach(function (r, i) {
      var y = 106 + i * 26;
      var isMatch = hi && hi.matches.indexOf(r) >= 0;
      var isWin = chosen && r.cidr === chosen.cidr;
      if (isWin) P.rect(38, y - 5, 440, 22, { fill: ACCDIM, stroke: ACC, radius: 3 });
      else if (isMatch) P.rect(38, y - 5, 440, 22, { fill: SURF2, stroke: SURF2, radius: 3 });
      T(46, y, r.cidr, { size: 10, mono: true, color: isWin ? ACC : isMatch ? INK : FAINT });
      T(220, y, r.hop, { size: 10, color: isWin ? ACC : isMatch ? INK : FAINT });
      T(340, y, String(r.prefix), { size: 10, mono: true, bold: isWin, color: isWin ? ACC : FAINT });
    });
  }

  P.alpha(a);
  table(null, null);
  T(500, 82, 'a table of seven rows:', { size: 10.5, color: DIM });
  T(500, 100, 'the default route, the parent', { size: 10.5, color: DIM });
  T(500, 118, '/22, and the five allocations.', { size: 10.5, color: DIM });

  P.alpha(b);
  P.alpha(1);
  if (b > 0.5) {
    table(hl, hl.best);
    box(500, 150, 368, 60, { fill: WARNDIM, stroke: WARN });
    T(514, 164, 'destination 100.64.3.201', { size: 11, bold: true, color: WARN });
    T(514, 184, 'matches /0 and /22 only', { size: 10, color: INK });
    T(514, 200, 'answer: ' + hl.best.cidr + ' (' + hl.best.hop + ')', { size: 10, mono: true, bold: true, color: WARN });
  }

  P.alpha(c);
  if (c > 0.5) {
    table(hh, hh.best);
    box(500, 220, 368, 60, { fill: ACCDIM, stroke: ACC });
    T(514, 234, 'destination 100.64.3.193', { size: 11, bold: true, color: ACC });
    T(514, 254, 'matches /0, /22 and /31', { size: 10, color: INK });
    T(514, 270, 'answer: ' + hh.best.cidr + ' (' + hh.best.hop + ')', { size: 10, mono: true, bold: true, color: ACC });
  }

  P.alpha(d);
  if (d > 0.5) {
    box(500, 290, 368, 56, { fill: SURF, stroke: BORDER });
    T(514, 304, 'destination 100.64.9.9', { size: 11, bold: true, color: INK });
    T(514, 324, 'outside the /22, so only the default matches', { size: 10, color: DIM });
    T(514, 340, 'answer: ' + hd.best.cidr + ' (' + hd.best.hop + ')', { size: 10, mono: true, bold: true, color: INK });
  }

  P.alpha(1);
  T(32, 262, 'Row order is irrelevant: the answer is the maximum length among the rows that match.', { size: 10.5, color: DIM });
  T(32, 282, 'Verified fact: RFC 4632 §5.1, "Forwarding in the Internet is done on a longest-match basis."', { size: 10, color: FAINT });
  T(32, 302, 'The page reverses and rotates the table and checks that all seven destinations keep their answer.', { size: 10, color: FAINT });
};

/* ---------- scene 8: the trie walk ---------- */

SCENE_DRAW.trie = function (t, sc) {
  head('The lookup is a walk down the bits',
       'one branch per bit, remembering the deepest stored prefix on the path');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  var dest = ipToInt('100.64.3.201');

  P.alpha(a);
  bitsStrip(32, 72, 26, dest, 0, 22, ACCDIM, SURF2);
  T(32, 100, '100.64.3.201, bit by bit', { size: 10, mono: true, color: DIM });
  T(32 + 22 * 26 - 4, 118, 'the first 22 bits are the /22 path', { size: 10, color: ACC, align: 'right' });
  T(32, 118, 'bits 23-32 decide the rest', { size: 10, color: WARN });

  P.alpha(b);
  box(32, 136, 836, 76, { fill: SURF, stroke: BORDER });
  T(46, 150, 'stored prefixes, as marks at their depth', { size: 10.5, bold: true, color: INK });
  var marks = [
    { p: 0, label: 'root', hit: true },
    { p: 22, label: '/22', hit: true },
    { p: 23, label: '/23', hit: false },
    { p: 24, label: '/24', hit: false },
    { p: 25, label: '/25', hit: false },
    { p: 26, label: '/26', hit: false },
    { p: 31, label: '/31', hit: false }
  ];
  marks.forEach(function (m, i) {
    var x = 60 + m.p * 24;
    P.circle(x, 186, 5, { fill: m.hit ? ACCDIM : SURF2, stroke: m.hit ? ACC : BORDER, sw: 1.2 });
    T(x, 204, m.label, { size: 9, mono: true, align: 'center', color: m.hit ? ACC : FAINT });
    T(x, 176, String(m.p), { size: 8, mono: true, align: 'center', color: FAINT });
  });
  T(700, 204, 'green: on this path', { size: 9, color: ACC });

  P.alpha(c);
  box(32, 224, 836, 66, { fill: SURF, stroke: BORDER });
  T(46, 238, 'the walk for 100.64.3.201', { size: 10.5, bold: true, color: INK });
  T(46, 258, 'bits 1-22 agree with 100.64.0.0/22  →  mark at 22', { size: 10, mono: true, color: ACC });
  T(46, 276, 'bit 23 sends it to 100.64.2.0/23, not to the design\'s 100.64.0.0/23', { size: 10, mono: true, color: DIM });

  P.alpha(d);
  box(32, 302, 836, 60, { fill: ACCDIM, stroke: ACC });
  T(46, 316, 'deepest mark on the path: /22  →  next hop ' + LOOKUPS.filter(function (l) { return l.dest === '100.64.3.201'; })[0].best.hop,
    { size: 11.5, bold: true, color: INK });
  T(46, 338, 'the /25 and /26 of the design end at other nodes, so the walk never reaches them', { size: 10, color: INK });

  P.alpha(1);
  T(32, 380, 'The walk costs at most 32 steps for IPv4 and 128 for IPv6, whatever the table holds.', { size: 10.5, color: DIM });
  T(32, 400, 'Remember the deepest mark on the path, not the deepest mark in the tree.', { size: 10, color: DIM });
  T(32, 420, 'A plain binary trie has that bound; a compressed trie or a TCAM does not, and neither is claimed here.', { size: 10, color: FAINT });
};

/* ---------- scene 9: aggregation ---------- */

SCENE_DRAW.aggregate = function (t, sc) {
  head('Aggregation: siblings only, and the hole',
       'two blocks of equal size differing in one prefix bit are the two halves of one parent');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(32, 66, 'four /24s', { size: 10, color: DIM });
  rangeBar(120, 62, 748, 0, 3, [
    { first: 0, last: 0, label: '.0.0/24' },
    { first: 1, last: 1, label: '.1.0/24' },
    { first: 2, last: 2, label: '.2.0/24' },
    { first: 3, last: 3, label: '.3.0/24' }
  ], { h: 24 });
  T(32, 106, 'two /23s', { size: 10, color: DIM });
  rangeBar(120, 102, 748, 0, 3, [
    { first: 0, last: 1, label: '.0.0/23' },
    { first: 2, last: 3, label: '.2.0/23' }
  ], { h: 24 });
  T(32, 146, 'one /22', { size: 10, color: DIM });
  rangeBar(120, 142, 748, 0, 3, [{ first: 0, last: 3, label: '100.64.0.0/22  ·  1024 addresses' }], { h: 24 });

  P.alpha(b);
  box(32, 180, 836, 50, { fill: ACCDIM, stroke: ACC });
  T(46, 194, 'merge until no pair of siblings is left: four /24s → two /23s → one /22', { size: 11, bold: true, color: INK });
  T(46, 214, 'the page then checks the union of addresses is exactly the same 1024', { size: 10, color: INK });

  P.alpha(c);
  T(32, 248, 'not siblings: 100.64.4.0/24 and 100.64.6.0/24', { size: 10.5, bold: true, color: BAD });
  rangeBar(32, 258, 836, 4, 7, [
    { first: 4, last: 4, label: '4.0 owned', fill: ACCDIM, stroke: ACC },
    { first: 5, last: 5, label: '5.0 unowned', fill: BADDIM, stroke: BAD, colour: BAD },
    { first: 6, last: 6, label: '6.0 owned', fill: ACCDIM, stroke: ACC },
    { first: 7, last: 7, label: '7.0 unowned', fill: BADDIM, stroke: BAD, colour: BAD }
  ], { h: 26 });
  T(32, 300, 'their common prefix is ' + NON_SIB_LCP + ' bits, so the only block holding both is 100.64.4.0/22', { size: 10, color: INK });
  T(32, 318, 'that block covers ' + NON_SIB_UNOWNED + ' addresses nobody owns: advertising it is wrong', { size: 10, bold: true, color: BAD });

  P.alpha(d);
  box(32, 336, 836, 56, { fill: SURF, stroke: ACC });
  T(46, 350, 'the hole stays: ' + AGG_HOLE.map(function (x) { return cidr(x.first, x.prefix); }).join('  +  ') +
             '  =  ' + AGG_HOLE_COVER + ' addresses in 2 rows', { size: 10.5, mono: true, bold: true, color: ACC });
  T(46, 372, 'RFC 4632 §5.1: a re-homed network is advertised explicitly, and the /24 wins by longest match', { size: 10, color: INK });

  P.alpha(1);
  T(32, 410, 'An aggregate is a parent whose two halves you own. Anything else is an over-claim, however tidy it looks.', { size: 10.5, color: DIM });
  T(32, 430, 'Verified fact: RFC 4632, "Classless Inter-Domain Routing (CIDR): an Address Assignment and Aggregation Strategy".', { size: 10, color: FAINT });
};

/* ---------- scene 10: the procedure ---------- */

SCENE_DRAW.procedure = function (t, sc) {
  head('Five steps, two traps, one sentence', 'the whole topic as a procedure');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  var steps = [
    { k: '1', t: 'convert each need to a prefix', s: 'the smallest block whose usable count covers it' },
    { k: '2', t: 'sort largest first', s: 'a big block needs a big aligned hole' },
    { k: '3', t: 'place at the lowest aligned free address', s: 'check the divisibility, then the overlap' },
    { k: '4', t: 'read what is left as blocks', s: 'decompose, then compare sizes' },
    { k: '5', t: 'aggregate siblings only', s: 'keep a more specific route beside a hole' }
  ];
  steps.forEach(function (st, i) {
    var y = 72 + i * 40;
    P.alpha(a);
    P.circle(48, y + 10, 11, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
    T(48, y + 10, st.k, { size: 11, mono: true, bold: true, align: 'center', base: 'middle', color: ACC });
    T(70, y + 2, st.t, { size: 11.5, bold: true, color: INK });
    T(70, y + 20, st.s, { size: 10, color: DIM });
  });

  P.alpha(b);
  box(330, 72, 538, 92, { fill: ACCDIM, stroke: ACC });
  T(346, 88, 'the numbers this page computed', { size: 11, bold: true, color: ACC });
  T(346, 110, bsize(BASEP) + ' addresses · ' + ALLOC_TOTAL + ' allocated · ' + FREE_TOTAL + ' free', { size: 11, mono: true, color: INK });
  T(346, 130, FREE.blocks.length + ' free blocks · largest ' + FREE_MAX + ' · no /26 fits', { size: 11, mono: true, color: INK });
  T(346, 150, '288 > 256 in the failing example · 1280 addresses in 2 aggregate rows', { size: 10, mono: true, color: DIM });

  P.alpha(c);
  box(330, 176, 538, 80, { fill: SURF, stroke: BAD });
  T(346, 192, 'the two traps', { size: 11, bold: true, color: BAD });
  T(346, 212, '1  adding host counts instead of block sizes', { size: 10.5, color: INK });
  T(346, 232, '2  reading the longest prefix in the table as the answer', { size: 10.5, color: INK });

  P.alpha(d);
  box(32, 272, 836, 52, { fill: SURF, stroke: ACC });
  T(48, 290, 'A subnet is a power-of-two block at an aligned address.', { size: 13, bold: true, color: INK });
  T(48, 310, 'Every question here — design, forwarding, aggregation — is that sentence plus arithmetic.', { size: 11, color: DIM });

  P.alpha(1);
  T(32, 344, 'Class A: "IPv4 - Fragmentation, CIDR Notation, Network Address Translation", GATE 2027 Section 10.', { size: 10, color: FAINT });
  T(32, 364, 'Nothing on this page is a previous-year question. The practice set is labelled original.', { size: 10, color: FAINT });
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
  BASE: BASE, BASEP: BASEP, REQS: REQS, ALLOC: ALLOC,
  FREE: FREE, FREE_TOTAL: FREE_TOTAL, FREE_MAX: FREE_MAX,
  TRAP: { reqs: TRAP_REQS, hostSum: TRAP_HOST_SUM, blockSum: TRAP_BLOCK_SUM,
          parentUsable: TRAP_PARENT_USABLE, parentSize: TRAP_PARENT_SIZE, fits: TRAP_FITS },
  TABLE: TABLE, LOOKUPS: LOOKUPS,
  AGG_FOUR: AGG_FOUR, AGG_HOLE: AGG_HOLE, AGG_HOLE_COVER: AGG_HOLE_COVER,
  NON_SIB: { lcp: NON_SIB_LCP, block: NON_SIB_BLOCK, unowned: NON_SIB_UNOWNED }
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
