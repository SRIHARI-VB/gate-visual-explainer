/* ==========================================================================
   path-mtu-discovery-and-effective-mss — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model is RFC 1191 (classic IPv4 PMTUD: the DF bit, the Datagram Too Big
   message, the Next-Hop MTU field, the plateau table and the timers), RFC 8201
   and RFC 8200 section 5 (the IPv6 minimum link MTU of 1280 and the Packet Too
   Big floor), RFC 1122's 576-octet rule as quoted by RFC 1191 section 3.1, and
   RFC 8899 (Packetization Layer PMTUD, which does not depend on ICMP at all).
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

/* header sizes, in octets: fixed IPv4, fixed IPv6, fixed TCP */
var IP4 = 20, IP6 = 40, TCP = 20;
var MSS_IP4 = IP4 + TCP;   // 40: what the MSS leaves out over IPv4
var MSS_IP6 = IP6 + TCP;   // 60: and over IPv6

/* the two floors the standards name */
var FLOOR_IP4 = 68;         // RFC 1191: never reduce the PMTU below 68 octets
var FLOOR_IP6 = 1280;       // RFC 8200: the IPv6 minimum link MTU
var DGRAM_DEFAULT = 576;    // RFC 1122's rule, quoted in RFC 1191 section 3.1
var MSS_DEFAULT = DGRAM_DEFAULT - MSS_IP4;   // 536

/* four paths, each a list of link MTUs; the PMTU is the smallest of them */
function pmtuOf(hops) {
  var m = hops[0];
  for (var i = 1; i < hops.length; i++) if (hops[i] < m) m = hops[i];
  return m;
}
var PATHS = [
  { key: 'eth',   name: 'Ethernet, end to end', hops: [1500, 1500, 1500] },
  { key: 'pppoe', name: 'one PPPoE hop',        hops: [1500, 1492, 1500] },
  { key: 'tun',   name: 'one tunnel hop',       hops: [1500, 1400, 1500] },
  { key: 'v6',    name: 'one narrow IPv6 hop',  hops: [1500, 1280, 1500] }
].map(function (p) {
  var pm = pmtuOf(p.hops);
  var m4 = pm - MSS_IP4, m6 = pm - MSS_IP6;
  return {
    key: p.key, name: p.name, hops: p.hops, pmtu: pm,
    mss4: m4, mss6: m6,
    eff4: m4 / pm * 100, eff6: m6 / pm * 100,
    bottleneck: p.hops.indexOf(pm)
  };
});
function pathBy(k) {
  for (var i = 0; i < PATHS.length; i++) if (PATHS[i].key === k) return PATHS[i];
  return PATHS[0];
}
var ETH = pathBy('eth'), PPPOE = pathBy('pppoe'), TUN = pathBy('tun'), V6PATH = pathBy('v6');

/* the promise the host makes from its own link, and the datagram it builds */
var LOCAL_MSS = ETH.mss4;                    // 1460, from the 1500-byte local link
var FULL_DGRAM = LOCAL_MSS + MSS_IP4;        // 1500
var PATH_DGRAM = TUN.pmtu;                   // 1400
var OVERSHOOT = FULL_DGRAM - PATH_DGRAM;     // 100

/* the effective send size: the smaller of the peer's promise and the path */
var PEER_MSS = 1300;
var EFFECTIVE_TUNNEL = Math.min(TUN.mss4, PEER_MSS);   // 1300
var EFFECTIVE_ONLY_PATH = TUN.mss4;                    // 1360

/* RFC 1191 table 7-1: the plateaus, highest first */
var PLATEAU = [65535, 32000, 17914, 8166, 4352, 2002, 1492, 1006, 508, 296, 68];
function plateauBelow(x) {
  var best = 0;
  for (var i = 0; i < PLATEAU.length; i++) if (PLATEAU[i] < x && PLATEAU[i] > best) best = PLATEAU[i];
  return best;
}
/* an old-style search from a 1500-byte datagram over a 1400-byte bottleneck */
var SEARCH = [FULL_DGRAM, plateauBelow(FULL_DGRAM), plateauBelow(plateauBelow(FULL_DGRAM))];
var SEARCH_UNDER = TUN.pmtu - SEARCH[2];                  // 394
var SEARCH_UNDER_PCT = SEARCH_UNDER / TUN.pmtu * 100;     // 28.14 per cent
var PLATEAU_OF_576 = plateauBelow(DGRAM_DEFAULT);         // 508

/* the timers RFC 1191 section 3 names, in seconds */
var TIMERS = {
  ageSeconds: 600,          // "on the order of 10 minutes": reset to the first hop
  minAfterTooBig: 300,      // MUST NOT probe upwards sooner than 5 minutes
  minAfterIncrease: 60,     // MUST NOT probe again sooner than 1 minute
  recAfterTooBig: 600,      // recommended: twice the minimum
  recAfterIncrease: 120
};

/* the IPv6 case: a floor, not a suggestion */
var V6_FLOOR = FLOOR_IP6;                 // 1280
var V6_MSS = V6_FLOOR - MSS_IP6;          // 1220
var V6_MSS_IP4 = V6_FLOOR - MSS_IP4;      // 1240, for comparison only
var V6_REPORTED = 1000;                   // a Packet Too Big that must be discarded
var V6_KEPT = V6_FLOOR;                   // what the estimate stays at

/* the black hole: small packets pass, full-size ones vanish */
var BH_HANDSHAKE = 60;                    // a SYN of 60 bytes
var BH_HANDSHAKE_OK = BH_HANDSHAKE <= TUN.pmtu;
var BH_DATA = FULL_DGRAM;                 // 1500
var BH_DATA_OK = BH_DATA <= TUN.pmtu;
var BH_CLAMP_MSS = TUN.mss4;              // 1360 after clamping

/* packetization-layer PMTUD: probing without ICMP */
var PL_BASE = 1200, PL_RAISE_SECONDS = 600;
var PL_STEPS = [PL_BASE, PL_BASE + 32, PL_BASE + 64, PL_BASE + 96];

/* ---------- the checks ---------- */

chk('the PMTU of a path is its smallest hop MTU',
  ETH.pmtu === 1500 && PPPOE.pmtu === 1492 && TUN.pmtu === 1400 && V6PATH.pmtu === 1280,
  [ETH.pmtu, PPPOE.pmtu, TUN.pmtu, V6PATH.pmtu].join(', '));
chk('every path PMTU equals the minimum of its own hop list',
  PATHS.every(function (p) { return p.pmtu === pmtuOf(p.hops); }), PATHS.length + ' paths');
chk('the tunnel path is the bottleneck hop, not the first hop',
  TUN.bottleneck === 1 && TUN.hops[0] === 1500, 'hop index ' + TUN.bottleneck);
chk('the MSS subtracts forty over IPv4',
  ETH.mss4 === 1460 && PPPOE.mss4 === 1452 && TUN.mss4 === 1360 && V6PATH.mss4 === 1240,
  PATHS.map(function (p) { return p.mss4; }).join(', '));
chk('the MSS subtracts sixty over IPv6',
  ETH.mss6 === 1440 && TUN.mss6 === 1340 && V6PATH.mss6 === 1220,
  PATHS.map(function (p) { return p.mss6; }).join(', '));
chk('every MSS plus its headers is exactly the path MTU',
  PATHS.every(function (p) { return p.mss4 + MSS_IP4 === p.pmtu && p.mss6 + MSS_IP6 === p.pmtu; }),
  'eight identities');
chk('the promise from the local link is 1460, and the datagram it builds is 1500',
  LOCAL_MSS === 1460 && FULL_DGRAM === 1500, LOCAL_MSS + ' / ' + FULL_DGRAM);
chk('that datagram is 100 bytes too big for the tunnel path',
  OVERSHOOT === 100 && FULL_DGRAM - PATH_DGRAM === OVERSHOOT, OVERSHOOT);
chk('the effective size is the smaller of the promise and the path',
  EFFECTIVE_TUNNEL === 1300 && EFFECTIVE_ONLY_PATH === 1360,
  EFFECTIVE_TUNNEL + ' / ' + EFFECTIVE_ONLY_PATH);
chk('the payload efficiency of 1460 on 1500 is 97.33 per cent',
  Math.abs(ETH.eff4 - 97.3333) < 0.0001, ETH.eff4.toFixed(4));
chk('the efficiency on the tunnel path is 97.14 per cent',
  Math.abs(TUN.eff4 - 97.1429) < 0.0001, TUN.eff4.toFixed(4));
chk('over IPv6 on a 1280-byte path the efficiency is 95.31 per cent',
  Math.abs(V6PATH.eff6 - 95.3125) < 0.0001, V6PATH.eff6.toFixed(4));
chk('the plateau table has eleven entries, in decreasing order',
  PLATEAU.length === 11 && PLATEAU.every(function (v, i) { return i === 0 || PLATEAU[i - 1] > v; }),
  PLATEAU.join(', '));
chk('1492 is a plateau, because it is the lowest of 1536, 1500 and 1492',
  PLATEAU.indexOf(1492) === 6 && plateauBelow(1500) === 1492, plateauBelow(1500));
chk('1500 itself is not a plateau', PLATEAU.indexOf(1500) === -1, 'absent');
chk('the greatest plateau below 1492 is 1006',
  plateauBelow(1492) === 1006, plateauBelow(1492));
chk('the greatest plateau below 1400 is also 1006',
  plateauBelow(1400) === 1006, plateauBelow(1400));
chk('the old-style search runs 1500, 1492, 1006',
  SEARCH[0] === 1500 && SEARCH[1] === 1492 && SEARCH[2] === 1006, SEARCH.join(' -> '));
chk('that search ends 394 bytes below the true path MTU',
  SEARCH_UNDER === 394, SEARCH_UNDER);
chk('which is an underestimate of 28.14 per cent',
  Math.abs(SEARCH_UNDER_PCT - 28.1429) < 0.0005, SEARCH_UNDER_PCT.toFixed(4));
chk('576 sits inside the 508 plateau, so the search for it gives 508',
  PLATEAU_OF_576 === 508, PLATEAU_OF_576);
chk('the default datagram of 576 gives a default MSS of 536',
  MSS_DEFAULT === 536 && DGRAM_DEFAULT - MSS_IP4 === 536, MSS_DEFAULT);
chk('the IPv4 floor is 68 and the IPv6 floor is 1280',
  FLOOR_IP4 === 68 && FLOOR_IP6 === 1280, FLOOR_IP4 + ' / ' + FLOOR_IP6);
chk('a 1280-byte path gives 1220 over IPv6 and 1240 over IPv4',
  V6_MSS === 1220 && V6_MSS_IP4 === 1240, V6_MSS + ' / ' + V6_MSS_IP4);
chk('a Packet Too Big reporting 1000 is below the floor and is discarded',
  V6_REPORTED < V6_FLOOR && V6_KEPT === 1280, V6_REPORTED + ' < ' + V6_FLOOR);
chk('the minimum after a Too Big message is five minutes, recommended ten',
  TIMERS.minAfterTooBig === 300 && TIMERS.recAfterTooBig === 600,
  TIMERS.minAfterTooBig + ' / ' + TIMERS.recAfterTooBig);
chk('the minimum after a successful increase is one minute, recommended two',
  TIMERS.minAfterIncrease === 60 && TIMERS.recAfterIncrease === 120,
  TIMERS.minAfterIncrease + ' / ' + TIMERS.recAfterIncrease);
chk('cached estimates age out after ten minutes',
  TIMERS.ageSeconds === 600 && TIMERS.ageSeconds === TIMERS.recAfterTooBig,
  TIMERS.ageSeconds);
chk('the handshake packet passes the bottleneck but the data packet does not',
  BH_HANDSHAKE_OK === true && BH_DATA_OK === false,
  BH_HANDSHAKE + ' ok, ' + BH_DATA + ' dropped');
chk('clamping the advertised MSS to the path gives 1360',
  BH_CLAMP_MSS === 1360 && BH_CLAMP_MSS + MSS_IP4 === TUN.pmtu, BH_CLAMP_MSS);
chk('packetization-layer discovery starts at 1200 and raises every 600 seconds',
  PL_BASE === 1200 && PL_RAISE_SECONDS === 600, PL_BASE + ' / ' + PL_RAISE_SECONDS);
chk('the probe ladder climbs in 32-byte steps from 1200',
  PL_STEPS[1] - PL_STEPS[0] === 32 && PL_STEPS[3] === 1296,
  PL_STEPS.join(', '));
chk('no effective size exceeds the path MTU',
  PATHS.every(function (p) { return p.mss4 + MSS_IP4 <= p.pmtu && p.mss6 + MSS_IP6 <= p.pmtu; }),
  'eight bounds');

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
function footer(s) { T(32, 442, s, { size: 9.5, color: FAINT }); }
function n(x) { return x.toLocaleString('en-US'); }

var SCENE_DRAW = {};

/* ---------- scene 1: the promise and the path ---------- */

SCENE_DRAW.problem = function (t, sc) {
  head('The promise is made from the wrong link',
       'a host promises what its own link can take, and the path may take less');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(48, 70, 'the host, on its own 1500-byte link', { size: 10.5, color: DIM });
  box(48, 82, 250, 54, { fill: SURF, stroke: ACC, sw: 1.6 });
  T(64, 94, 'advertised MSS', { size: 9.5, color: DIM });
  T(64, 108, '1460 bytes of data', { size: 13, bold: true, color: ACC });

  P.alpha(b);
  T(48, 156, 'the path it actually uses', { size: 10.5, color: DIM });
  var hops = TUN.hops;
  for (var i = 0; i < hops.length; i++) {
    var narrow = i === TUN.bottleneck;
    box(48 + i * 172, 168, 158, 46, {
      fill: narrow ? BADDIM : SURF, stroke: narrow ? BAD : BORDER, sw: narrow ? 1.8 : 1.2
    });
    T(48 + i * 172 + 8, 176, 'link ' + (i + 1), { size: 9, color: FAINT });
    T(48 + i * 172 + 8, 190, n(hops[i]) + ' bytes', {
      size: 13, bold: true, mono: true, color: narrow ? BAD : INK
    });
    if (narrow) T(48 + i * 172 + 8, 204, 'the bottleneck', { size: 9, color: BAD });
  }
  T(568, 176, 'the path MTU is the', { size: 10, color: DIM });
  T(568, 190, 'smallest of them: 1400', { size: 11, bold: true, color: BAD });

  P.alpha(c);
  box(48, 232, 420, 46, { fill: WARNDIM, stroke: WARN, sw: 1.2, dash: [4, 3] });
  T(64, 242, 'the datagram the host builds', { size: 9.5, color: DIM });
  T(64, 256, '1460 + 40 = 1500 bytes, with the DF bit set', { size: 11.5, mono: true, color: INK });

  P.alpha(d);
  T(48, 302, '1500  -  1400  =  100 bytes too big', { size: 15, mono: true, bold: true, color: BAD });
  T(48, 326, 'the router cannot forward it and cannot fragment it, because DF is set', { size: 10.5, color: INK });
  T(48, 344, 'so it is discarded, and the host is told why', { size: 10.5, color: DIM });
  T(48, 372, 'nothing is wrong with the segment; the promise was simply made about the wrong link', { size: 10.5, color: ACC });
  footer('the MSS option is a promise about the receiver; the PMTU is a fact about the path');
};

/* ---------- scene 2: the minimum ---------- */

SCENE_DRAW.min = function (t, sc) {
  head('The path MTU is the smallest hop on the way',
       'four paths, their hop MTUs, and the size each one leaves for data');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  T(48, 68, 'path', { size: 9.5, color: FAINT });
  T(268, 68, 'hop 1', { size: 9.5, color: FAINT });
  T(368, 68, 'hop 2', { size: 9.5, color: FAINT });
  T(468, 68, 'hop 3', { size: 9.5, color: FAINT });
  T(590, 68, 'path MTU', { size: 9.5, color: FAINT });
  T(700, 68, 'MSS over IPv4', { size: 9.5, color: FAINT });

  var rows = [ETH, PPPOE, TUN, V6PATH];
  rows.forEach(function (p, i) {
    var vis = i < 1 ? a : i < 2 ? b : i < 3 ? c : d;
    P.alpha(vis);
    var y = 84 + i * 44;
    T(48, y + 12, p.name, { size: 10, color: INK });
    p.hops.forEach(function (h, j) {
      var narrow = j === p.bottleneck;
      box(268 + j * 100, y, 84, 26, {
        fill: narrow ? BADDIM : SURF2, stroke: narrow ? BAD : BORDER, sw: 1
      });
      T(268 + j * 100 + 42, y + 7, n(h), { size: 10.5, mono: true, align: 'center', color: narrow ? BAD : INK });
    });
    T(590, y + 7, n(p.pmtu), { size: 12, mono: true, bold: true, color: BAD });
    T(700, y + 7, n(p.mss4), { size: 12, mono: true, bold: true, color: ACC });
    T(800, y + 8, n(p.mss6), { size: 9.5, mono: true, color: DIM });
  });
  T(790, 68, 'over IPv6', { size: 9.5, color: FAINT });

  P.alpha(1);
  T(48, 282, 'the first hop is not the path: every row above has a 1500-byte first hop', { size: 10.5, color: INK });
  T(48, 306, 'MSS over IPv4 = path MTU - 40      MSS over IPv6 = path MTU - 60', { size: 11.5, mono: true, color: ACC });
  T(48, 330, 'the subtraction counts only the fixed headers, which is why an MSS plus its headers is exactly the path MTU', { size: 9.8, color: DIM });
  footer('the path MTU changes with the route, so a size discovered once is a cached estimate, not a constant');
};

/* ---------- scene 3: the probe with the DF bit ---------- */

SCENE_DRAW.dfprobe = function (t, sc) {
  head('Send too big, be told, send smaller',
       'the Don\'t Fragment bit turns a silent drop into a measurement');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(48, 72, '1. the host assumes the first-hop MTU and sets DF on every datagram', { size: 10.5, color: INK });
  box(48, 86, 120, 30, { fill: SURF, stroke: ACC, sw: 1.4 });
  T(108, 94, '1500 DF=1', { size: 11, mono: true, align: 'center', color: ACC });

  P.alpha(b);
  P.arrow(180, 101, 300, 101, { stroke: BAD, sw: 1.6 });
  T(196, 82, 'the 1400-byte hop', { size: 9.5, color: BAD });
  box(306, 86, 150, 30, { fill: BADDIM, stroke: BAD, sw: 1.4 });
  T(381, 94, 'cannot forward', { size: 10.5, align: 'center', color: BAD });

  P.alpha(c);
  P.arrow(381, 122, 381, 152, { stroke: INFO, sw: 1.4 });
  box(306, 158, 470, 30, { fill: SURF, stroke: INFO, sw: 1.3 });
  T(318, 166, 'ICMP type 3 code 4, "fragmentation needed and DF set", next-hop MTU = 1400',
    { size: 9.8, mono: true, color: INFO });
  T(48, 166, 'the answer:', { size: 10, color: DIM });

  P.alpha(d);
  T(48, 212, '2. the host lowers its estimate to 1400 and sends again', { size: 10.5, color: INK });
  box(48, 226, 120, 30, { fill: SURF, stroke: VAL, sw: 1.4 });
  T(108, 234, '1400 DF=1', { size: 11, mono: true, align: 'center', color: VAL });
  P.arrow(180, 241, 300, 241, { stroke: VAL, sw: 1.6 });
  T(318, 234, 'forwarded, and delivered', { size: 10.5, color: VAL });
  T(48, 274, '3. a narrower hop further along answers the same way, and the estimate falls again', { size: 10.5, color: INK });
  T(48, 298, 'one probe per decrease; the process ends when the estimate fits', { size: 10, color: DIM });
  T(48, 330, 'the number in the message is what makes this one step instead of a search', { size: 11, color: ACC });
  footer('RFC 1191 section 2: start at the first hop, set DF, and reduce on every Datagram Too Big message');
};

/* ---------- scene 4: the field that carries the answer ---------- */

SCENE_DRAW.nextmtu = function (t, sc) {
  head('The Next-Hop MTU field',
       'two bytes that say exactly how large the datagram could have been');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  box(48, 72, 800, 34, { fill: SURF, stroke: BORDER, sw: 1.2 });
  T(60, 80, 'type = 3', { size: 10, mono: true, color: INK });
  T(180, 80, 'code = 4', { size: 10, mono: true, color: INK });
  T(300, 80, 'checksum', { size: 10, mono: true, color: DIM });
  T(470, 80, 'unused = 0', { size: 10, mono: true, color: DIM });
  T(650, 80, 'Next-Hop MTU', { size: 10, mono: true, bold: true, color: INFO });
  P.line(440, 72, 440, 106, { stroke: BORDER, sw: 1 });
  P.line(620, 72, 620, 106, { stroke: BORDER, sw: 1 });
  P.line(700, 72, 700, 106, { stroke: BORDER, sw: 1 });
  T(48, 116, '16 bits of the header that used to be padding', { size: 9.5, color: DIM });

  P.alpha(b);
  T(48, 148, 'the value it carries, in the specification\'s own terms:', { size: 10.5, color: INK });
  T(48, 168, 'the largest datagram that could be forwarded without fragmenting here,', { size: 10.5, color: ACC });
  T(48, 186, 'counting the IP header and the IP data, and not counting link headers', { size: 10.5, color: ACC });

  P.alpha(c);
  box(48, 212, 380, 44, { fill: SURF2, stroke: BORDER, sw: 1 });
  T(62, 222, 'so it is a datagram size, not a payload size', { size: 10, color: INK });
  T(62, 240, '1400 here means 1400 including the 20-byte IP header', { size: 10, mono: true, color: INK });

  P.alpha(d);
  T(48, 282, 'two boundaries on the field:', { size: 10.5, color: INK });
  T(48, 302, 'it is never below 68, because every router must forward 68 octets', { size: 10, color: DIM });
  T(48, 320, 'a zero means the router was never upgraded: an old-style message', { size: 10, color: DIM });
  T(48, 348, 'with a zero the host must fall back to a search of the plateau table', { size: 10.5, color: WARN });
  footer('RFC 1191 section 4: the low-order 16 bits carry the MTU of that next hop; the high-order 16 stay zero');
};

/* ---------- scene 5: the effective size ---------- */

SCENE_DRAW.effective = function (t, sc) {
  head('The effective send size is the smaller of two numbers',
       'what the peer said it can take, and what the path can carry');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(48, 68, 'path MTU', { size: 9.5, color: FAINT });
  T(180, 68, 'MSS over IPv4', { size: 9.5, color: FAINT });
  T(330, 68, 'MSS over IPv6', { size: 9.5, color: FAINT });
  T(490, 68, 'data as a share of the path', { size: 9.5, color: FAINT });
  [ETH, PPPOE, TUN, V6PATH].forEach(function (p, i) {
    var y = 84 + i * 40;
    box(40, y - 8, 820, 34, { fill: i % 2 ? SURF2 : SURF, stroke: BORDER, sw: 1, radius: 4 });
    T(48, y, n(p.pmtu), { size: 11, mono: true, bold: true, color: INK });
    T(180, y, n(p.mss4), { size: 11, mono: true, bold: true, color: ACC });
    T(330, y, n(p.mss6), { size: 11, mono: true, color: DIM });
    T(490, y, p.eff4.toFixed(2) + '% over IPv4, ' + p.eff6.toFixed(2) + '% over IPv6',
      { size: 10, color: INK });
  });

  P.alpha(b);
  T(48, 262, 'the path sets a ceiling; the peer sets a promise, and the smaller of the two is used', { size: 10.5, color: INK });
  T(48, 284, 'peer advertises 1300 on the 1400-byte path  ->  effective size 1300', { size: 11, mono: true, color: VAL });
  T(48, 302, 'peer advertises 1460 on the same path       ->  effective size 1360', { size: 11, mono: true, color: VAL });

  P.alpha(c);
  T(48, 334, 'a segment of 1300 data is 1340 bytes on the wire, which fits 1400', { size: 10.5, color: INK });
  T(48, 352, 'a segment of 1460 data is 1500 bytes on the wire, which does not', { size: 10.5, color: BAD });

  P.alpha(d);
  T(48, 384, 'so the promise is never lowered; the sender lowers what it puts in the segment', { size: 11, color: ACC });
  footer('RFC 6691 keeps the advertised MSS as a promise; RFC 1191 section 3.1 caps the datagram at 40 plus the peer\'s MSS');
};

/* ---------- scene 6: the plateau search ---------- */

SCENE_DRAW.plateau = function (t, sc) {
  head('Without the field, the host has to search',
       'the plateau table from RFC 1191, and the two steps it costs');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(48, 68, 'plateau   covers', { size: 9.5, color: FAINT });
  var labels = ['65535', '32000', '17914', '8166', '4352', '2002', '1492', '1006', '508', '296', '68'];
  var covers = ['the architectural maximum', 'a round number kept just in case', '16 Mbit token ring',
    'IEEE 802.4', 'FDDI, within 1 per cent', 'IEEE 802.5 at 4 Mbit, within 2 per cent',
    '1536, 1500 and 1492, within 3 per cent', 'SLIP and the ARPANET',
    '576, 544, 512 and 508, within 13 per cent', 'a low-delay serial link', 'the official minimum'];
  labels.forEach(function (v, i) {
    var y = 84 + i * 21;
    T(48, y, v, { size: 9.5, mono: true, bold: i === 6 || i === 7, color: i === 6 || i === 7 ? ACC : INK });
    T(130, y, covers[i], { size: 9, color: i === 6 || i === 7 ? INK : DIM });
  });

  P.alpha(b);
  T(470, 84, 'a host that sent 1500 bytes', { size: 10, color: INK });
  T(470, 102, 'and was told only "too big"', { size: 10, color: INK });
  T(470, 126, 'has one number to work with:', { size: 10, color: DIM });
  T(470, 144, 'the total length it sent', { size: 10.5, mono: true, color: INK });

  P.alpha(c);
  T(470, 176, 'step 1: greatest plateau below 1500 is 1492', { size: 10.5, mono: true, color: WARN });
  T(470, 194, 'still too big, so it fails again', { size: 9.8, color: DIM });
  T(470, 218, 'step 2: greatest plateau below 1492 is 1006', { size: 10.5, mono: true, color: VAL });
  T(470, 236, 'which fits, and stops the search', { size: 9.8, color: DIM });

  P.alpha(d);
  T(470, 268, 'true path MTU 1400, estimate 1006', { size: 10.5, mono: true, color: INK });
  T(470, 288, '394 bytes given up, 28.14 per cent of the path', { size: 10.5, color: BAD });
  T(470, 312, 'with the next-hop field it is one step, not two', { size: 10, color: ACC });
  footer('RFC 1191 section 5: use the greatest plateau below the returned total length; section 7 gives the table');
};

/* ---------- scene 7: the rules and the timers ---------- */

SCENE_DRAW.rules = function (t, sc) {
  head('What a host is allowed to do with the estimate',
       'five rules, and the four timers that keep the search cheap');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  var rules = [
    'on a Too Big message, reduce the estimate, and stop eliciting more of them',
    'never reduce the estimate below 68 octets',
    'never raise the estimate because a message says the path grew',
    'raising is allowed, but not sooner than five minutes after a Too Big message',
    'and not sooner than one minute after a successful raise'
  ];
  P.alpha(a);
  rules.slice(0, 2).forEach(function (r, i) {
    var y = 76 + i * 34;
    box(40, y - 10, 560, 28, { fill: SURF, stroke: BORDER, sw: 1, radius: 4 });
    T(52, y - 2, (i + 1) + '.  ' + r, { size: 9.8, color: INK });
  });
  P.alpha(b);
  rules.slice(2).forEach(function (r, i) {
    var y = 144 + i * 34;
    box(40, y - 10, 560, 28, { fill: SURF, stroke: BORDER, sw: 1, radius: 4 });
    T(52, y - 2, (i + 3) + '.  ' + r, { size: 9.8, color: INK });
  });

  P.alpha(c);
  T(48, 268, 'the timers, in seconds', { size: 10, color: DIM });
  var t4 = [
    ['age a cached estimate', TIMERS.ageSeconds, 'reset to the first hop'],
    ['minimum before a raise', TIMERS.minAfterTooBig, 'after a Too Big message'],
    ['minimum before another raise', TIMERS.minAfterIncrease, 'after a successful one'],
    ['recommended values', TIMERS.recAfterIncrease, 'twice the minimum, so 600 and 120']
  ];
  t4.forEach(function (r, i) {
    var y = 288 + i * 26;
    T(48, y, r[0], { size: 9.8, color: INK });
    T(300, y, n(r[1]) + ' s', { size: 9.8, mono: true, bold: true, color: ACC });
    T(380, y, r[2], { size: 9.2, color: DIM });
  });

  P.alpha(d);
  T(48, 400, 'a route change is why the estimate ages: a size discovered once is not a property of the destination', { size: 10.5, color: INK });
  footer('RFC 1191 sections 3 and 6.3; RFC 8201 section 4 repeats the same timers for IPv6');
};

/* ---------- scene 8: IPv6 ---------- */

SCENE_DRAW.ipv6 = function (t, sc) {
  head('IPv6 has no DF bit and no router fragmentation',
       'so the floor is 1280, and a message below it is discarded');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(48, 72, 'IPv6 routers never fragment a packet, so an oversized packet is simply dropped', { size: 10.5, color: INK });
  T(48, 94, 'the message back is ICMPv6 type 2, Packet Too Big, carrying an MTU field', { size: 10.5, color: INFO });
  T(48, 116, 'there is no bit to set: every IPv6 packet is already unfragmentable in transit', { size: 10, color: DIM });

  P.alpha(b);
  T(48, 152, 'the floor is a requirement, not a default', { size: 10.5, color: INK });
  box(48, 166, 300, 46, { fill: SURF, stroke: ACC, sw: 1.5 });
  T(64, 176, 'every IPv6 link must carry 1280', { size: 10, color: DIM });
  T(64, 194, 'so the estimate stops at 1280', { size: 11.5, bold: true, color: ACC });

  P.alpha(c);
  box(400, 166, 448, 46, { fill: BADDIM, stroke: BAD, sw: 1.3 });
  T(414, 176, 'a Packet Too Big reporting ' + n(V6_REPORTED), { size: 10, color: INK });
  T(414, 194, 'is below the floor, so it is discarded and the estimate stays 1280', { size: 10, color: BAD });

  P.alpha(d);
  T(48, 240, 'what that leaves for data', { size: 10.5, color: INK });
  T(48, 264, '1280  -  60  =  1220 bytes over IPv6', { size: 13, mono: true, bold: true, color: ACC });
  T(48, 286, '1280  -  40  =  1240 bytes over IPv4, for comparison only', { size: 11, mono: true, color: DIM });
  T(48, 314, 'a node that does not implement discovery must simply never send more than 1280', { size: 10.5, color: INK });
  T(48, 336, 'which is legal, and wastes the difference on every packet', { size: 10, color: DIM });
  footer('RFC 8200 section 5, RFC 8201 sections 1 and 4, RFC 4443 for the Packet Too Big message');
};

/* ---------- scene 9: the black hole ---------- */

SCENE_DRAW.blackhole = function (t, sc) {
  head('When the answer never arrives',
       'the handshake completes, the data does not, and nothing says why');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(48, 72, 'a firewall drops every ICMP error, which is a common policy', { size: 10.5, color: INK });
  box(48, 88, 200, 30, { fill: SURF, stroke: VAL, sw: 1.3 });
  T(148, 96, 'SYN, 60 bytes', { size: 10.5, mono: true, align: 'center', color: VAL });
  T(264, 96, 'passes: 60 is inside 1400, and the connection opens', { size: 10, color: VAL });

  P.alpha(b);
  box(48, 132, 200, 30, { fill: BADDIM, stroke: BAD, sw: 1.3 });
  T(148, 140, 'data, 1500 bytes', { size: 10.5, mono: true, align: 'center', color: BAD });
  T(264, 140, 'dropped at the 1400-byte hop, and no message comes back', { size: 10, color: BAD });

  P.alpha(c);
  T(48, 186, 'so the sender retransmits the same 1500 bytes, and the path drops them again', { size: 10.5, color: INK });
  T(48, 208, 'the connection is open and silent: a black hole', { size: 11.5, bold: true, color: BAD });
  T(48, 232, 'the cure on the middlebox is to clamp the advertised MSS to the path', { size: 10.5, color: INK });
  T(48, 254, 'advertise ' + n(BH_CLAMP_MSS) + ' instead of 1460, and the sender builds 1400-byte datagrams', { size: 11, mono: true, color: VAL });

  P.alpha(d);
  T(48, 290, 'the cure at the ends is to stop depending on ICMP at all', { size: 10.5, color: INK });
  T(48, 312, 'packetization-layer discovery probes with packets of known size and waits for an acknowledgement', { size: 10, color: INK });
  T(48, 334, 'it starts from a base of ' + n(PL_BASE) + ' bytes, climbs in 32-byte steps, and treats silence as a ceiling', { size: 10, mono: true, color: ACC });
  T(48, 356, 'and it raises the estimate again only every ' + n(PL_RAISE_SECONDS) + ' seconds', { size: 10, color: DIM });
  footer('RFC 8201 section 1 names the black-hole connection; RFC 8899 defines discovery that does not need the message');
};

/* ---------- scene 10: consolidation ---------- */

SCENE_DRAW.consolidate = function (t, sc) {
  head('The chain, from the path to the segment',
       'five steps, in the order the numbers are needed');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  var chain = [
    ['path MTU', 'the smallest hop MTU on the path', '1400'],
    ['MSS from the path', 'path MTU minus the fixed headers', '1360 over IPv4'],
    ['effective size', 'the smaller of that and the peer\'s MSS', '1300 with a 1300 peer'],
    ['probe', 'DF set, Too Big answered, estimate lowered', 'one step with the field'],
    ['fallback', 'floors of 68 and 1280; probing when ICMP is lost', '1220 at the IPv6 floor']
  ];
  chain.forEach(function (r, i) {
    var vis = i < 1 ? a : i < 2 ? b : i < 3 ? c : 1;
    P.alpha(vis);
    var y = 76 + i * 44;
    box(40, y - 12, 820, 36, { fill: i % 2 ? SURF2 : SURF, stroke: BORDER, sw: 1, radius: 4 });
    T(52, y - 4, (i + 1) + '. ' + r[0], { size: 10.5, bold: true, color: ACC });
    T(240, y - 4, r[1], { size: 10, color: INK });
    T(620, y - 4, r[2], { size: 10, mono: true, color: INK });
  });

  P.alpha(d);
  T(48, 318, 'the five slips', { size: 10.5, bold: true, color: BAD });
  T(48, 338, 'using the first-hop MTU as the path; counting headers inside the MSS;', { size: 10, color: INK });
  T(48, 356, 'raising the estimate because a message says so; lowering it below 68 or 1280;', { size: 10, color: INK });
  T(48, 374, 'and assuming the ICMP answer will always arrive.', { size: 10, color: INK });
  T(48, 402, 'a promise is what the receiver can take; the path is what will actually carry it.', { size: 11, color: ACC });
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
  CONST: { ip4: IP4, ip6: IP6, tcp: TCP, floor4: FLOOR_IP4, floor6: FLOOR_IP6, dgram: DGRAM_DEFAULT, mssDefault: MSS_DEFAULT },
  PATHS: PATHS,
  PROMISE: { localMss: LOCAL_MSS, dgram: FULL_DGRAM, path: PATH_DGRAM, over: OVERSHOOT },
  EFFECTIVE: { tunnel: EFFECTIVE_ONLY_PATH, peer: PEER_MSS, used: EFFECTIVE_TUNNEL },
  PLATEAU: { values: PLATEAU, search: SEARCH, under: SEARCH_UNDER, underPct: SEARCH_UNDER_PCT, of576: PLATEAU_OF_576 },
  TIMERS: TIMERS,
  V6: { floor: V6_FLOOR, mss: V6_MSS, mssIp4: V6_MSS_IP4, reported: V6_REPORTED, kept: V6_KEPT },
  BLACKHOLE: { handshake: BH_HANDSHAKE, data: BH_DATA, clamp: BH_CLAMP_MSS, base: PL_BASE, raise: PL_RAISE_SECONDS, steps: PL_STEPS }
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
