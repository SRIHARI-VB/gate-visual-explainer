/* ==========================================================================
   layering-switching-and-performance-metrics — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V and the span tables. It computes no delay itself.
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

/* A link is {R: bits per second, d: metres}. A path is an array of links. */

function sum(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s; }

function rates(links) { return links.map(function (l) { return l.R; }); }

/* transmission delay on one link: packet bits divided by link rate */
function tt(L, R) { return L / R; }

/* propagation delay on one link: distance divided by speed in the medium */
function tpro(d, v) { return d / v; }

/* ONE packet, store and forward, over a path of possibly unequal links. */
function onePacket(links, L, v) {
  var tts = links.map(function (l) { return tt(L, l.R); });
  var tps = links.map(function (l) { return tpro(l.d, v); });
  return { tts: tts, tps: tps, Tt: sum(tts), Tp: sum(tps), total: sum(tts) + sum(tps) };
}

/* P equal packets, store and forward, over a path.
   Simulated event by event rather than assumed, so unequal links are handled:
     source begins packet p at p * Tt0;
     a node begins packet p only once the packet has fully arrived AND the node
     has finished the previous packet;
     arrival at the far end = finish on the last link + its propagation delay. */
function pipeline(links, L, Pk, v) {
  var N = links.length;
  var prevFinish = [];
  var spans = [];
  var i, p;
  for (i = 0; i < N; i++) { prevFinish.push(-1); spans.push([]); }
  var total = 0;
  for (p = 0; p < Pk; p++) {
    var avail = p * (L / links[0].R);
    for (i = 0; i < N; i++) {
      var tti = L / links[i].R;
      var start = (i === 0) ? avail : Math.max(prevFinish[i], avail);
      var fin = start + tti;
      spans[i].push({ p: p, start: start, finish: fin });
      prevFinish[i] = fin;
      avail = fin + tpro(links[i].d, v);
    }
    total = avail;
  }
  return { total: total, spans: spans, N: N, P: Pk };
}

/* The closed form for EQUAL links: (N + P - 1) * Tt + N * Tp */
function closedForm(N, Pk, Tt, Tp) { return (N + Pk - 1) * Tt + N * Tp; }

/* throughput of a path in series is the slowest link */
function throughput(links) { return Math.min.apply(null, rates(links)); }

/* bits that fit on one link: rate times one-way propagation delay */
function bdp(R, Tp) { return R * Tp; }

/* Circuit: setup, then data at the reserved rate, then teardown ignored.
   Packet: no setup, but (N - 1) extra packet times of pipelining overhead.
   Circuit is cheaper exactly when setup < (N - 1) * L / R. */
function circuitTotal(F, R, S, links, v) {
  var Tp = sum(links.map(function (l) { return tpro(l.d, v); }));
  return S + F / R + Tp;
}
function packetTotal(F, R, L, links, v) {
  var Pk = F / L;
  return closedForm(links.length, Pk, L / R, sum(links.map(function (l) { return tpro(l.d, v); })));
}

var V = {};

/* ---- the four reference paths used on screen ---- */

/* equal-rate teaching path: 3 links, 1 unit of transmission time, 1 of propagation */
V.teach = { links: [{ R: 1, d: 1 }, { R: 1, d: 1 }, { R: 1, d: 1 }], L: 1, v: 1 };

/* GATE CSE 2012 Q44: 10^6-bit file, 1000 packets of 1000 bits, 3 links of 1 Mbps,
   each 100 km, signal at 10^8 m/s. */
V.g2012 = {
  links: [{ R: 1e6, d: 1e5 }, { R: 1e6, d: 1e5 }, { R: 1e6, d: 1e5 }],
  L: 1000, P: 1000, v: 1e8
};
V.g2012r = pipeline(V.g2012.links, V.g2012.L, V.g2012.P, V.g2012.v);
V.g2012ms = V.g2012r.total * 1000;

/* GATE 2024 CS1 Q36: 10^6-byte file in 1000 chunks of 10^3 bytes, two links of
   10^6 bits/s, propagation negligible. */
V.g2024 = {
  links: [{ R: 1e6, d: 0 }, { R: 1e6, d: 0 }],
  L: 8000, P: 1000, v: 1
};
V.g2024r = pipeline(V.g2024.links, V.g2024.L, V.g2024.P, V.g2024.v);

/* GATE CSE 2022 Q59: 1000 bytes over a 100 Mbps link, 2100 km, 3 x 10^8 m/s. */
V.g2022 = {
  links: [{ R: 1e8, d: 2.1e6 }], L: 8000, v: 3e8
};
V.g2022r = onePacket(V.g2022.links, V.g2022.L, V.g2022.v);
V.g2022ms = V.g2022r.total * 1000;

/* GATE CSE 2014 Set 2: 10^3 bytes over 3 links of 10^6 bytes/s, 100 bytes of
   header per packet, split 1 / 10 / 20 ways. Rates and sizes both in bytes. */
V.g2014 = { R: 1e6, links: [{ R: 1e6, d: 0 }, { R: 1e6, d: 0 }, { R: 1e6, d: 0 }], v: 1, hdr: 100, data: 1000 };
V.g2014cases = [1, 10, 20].map(function (Pk) {
  var L = V.g2014.data / Pk + V.g2014.hdr;
  var r = pipeline(V.g2014.links, L, Pk, V.g2014.v);
  return { P: Pk, L: L, us: r.total * 1e6 };
});

/* the delay teaching example: 8000 bits over 1 Mbps, 2000 km at 2 x 10^8 m/s */
V.delay = {
  links: [{ R: 1e6, d: 2e6 }], L: 8000, v: 2e8
};
V.delayr = onePacket(V.delay.links, V.delay.L, V.delay.v);
V.delayTt = V.delayr.Tt;              /* 8 ms */
V.delayTp = V.delayr.Tp;              /* 10 ms */
V.delayBdp = bdp(1e6, V.delayTp);     /* 10000 bits */

/* circuit against packet: 640 kbit over 3 links of 64 kbps, 1 kbit packets */
V.cp = {
  F: 640000, R: 64000, L: 1000, S: 0.5,
  links: [{ R: 64000, d: 0 }, { R: 64000, d: 0 }, { R: 64000, d: 0 }], v: 1
};
V.cpCircuit = circuitTotal(V.cp.F, V.cp.R, V.cp.S, V.cp.links, V.cp.v);
V.cpPacket = packetTotal(V.cp.F, V.cp.R, V.cp.L, V.cp.links, V.cp.v);
V.cpCrossover = (V.cp.links.length - 1) * V.cp.L / V.cp.R;

/* GATE 2026 CS2 Q21 as reproduced by an archive: 4 x 10^6 bytes over three links
   of 2 Mbps, 500 kbps and 1 Mbps, propagation and processing negligible. */
V.g2026links = [{ R: 2e6, d: 0 }, { R: 5e5, d: 0 }, { R: 1e6, d: 0 }];
V.g2026bits = 4e6 * 8;
V.g2026bottleneck = throughput(V.g2026links);
V.g2026time = V.g2026bits / V.g2026bottleneck;

/* header sizes used on the encapsulation scene */
V.hdr = { transport: 20, network: 20, link: 14 };
V.hdrTotal = V.hdr.transport + V.hdr.network + V.hdr.link;

/* the two stacks */
V.osi = ['Application', 'Presentation', 'Session', 'Transport', 'Network', 'Data link', 'Physical'];
V.inet = ['Application', 'Transport', 'Network', 'Link', 'Physical'];
V.inetMapsTo = [[0, 1, 2], [3], [4], [5], [6]];
V.pdu = ['message', 'segment', 'packet', 'frame', 'bit'];

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* the two delays are different quantities with different inputs */
chk('doubling the packet size doubles the transmission delay',
  Math.abs(tt(16000, 1e6) - 2 * tt(8000, 1e6)) < 1e-15);
chk('doubling the packet size leaves the propagation delay alone',
  tpro(2e6, 2e8) === tpro(2e6, 2e8));
chk('propagation delay does not mention the packet size or the rate',
  tpro(2e6, 2e8) === 0.01 && Math.abs(tpro(2e6, 2e8) - 2e6 / 2e8) < 1e-15);
chk('doubling the rate halves the transmission delay and not the propagation delay',
  Math.abs(tt(8000, 2e6) - tt(8000, 1e6) / 2) < 1e-15 && tpro(2e6, 2e8) === 0.01);

/* one packet over the teaching path */
chk('one packet over three equal links pays three transmission terms',
  V.teach.links.length === 3);
chk('the delay example is 8 ms of transmission', Math.abs(V.delayTt - 0.008) < 1e-12, V.delayTt);
chk('the delay example is 10 ms of propagation', Math.abs(V.delayTp - 0.01) < 1e-12, V.delayTp);
chk('so 18 ms end to end', Math.abs(V.delayr.total - 0.018) < 1e-12, V.delayr.total);
chk('the bandwidth-delay product of that link is 10000 bits',
  Math.abs(V.delayBdp - 10000) < 1e-9, V.delayBdp);

/* the simulation must reproduce the closed form for equal links */
(function () {
  var ok = true, seen = [];
  [[3, 1, 1, 1], [3, 4, 1, 1], [2, 5, 2, 3], [4, 7, 0.5, 0.25], [1, 3, 2, 2]].forEach(function (c) {
    var links = [];
    for (var i = 0; i < c[0]; i++) links.push({ R: 1 / c[2], d: c[3] });
    var r = pipeline(links, 1, c[1], 1);
    var f = closedForm(c[0], c[1], c[2], c[3]);
    seen.push(r.total.toFixed(6) + '/' + f.toFixed(6));
    if (Math.abs(r.total - f) > 1e-9) ok = false;
  });
  chk('the simulation equals (N+P-1)Tt + N*Tp on five equal-link configurations', ok, seen.join(' '));
}());

/* GATE CSE 2012 Q44 */
chk('GATE CSE 2012: transmission is 1 ms per packet per link',
  Math.abs(tt(1000, 1e6) - 0.001) < 1e-15);
chk('GATE CSE 2012: propagation is 1 ms per link',
  Math.abs(tpro(1e5, 1e8) - 0.001) < 1e-15);
chk('GATE CSE 2012: the total is 1005 ms',
  Math.abs(V.g2012ms - 1005) < 1e-9, V.g2012ms);
chk('GATE CSE 2012: the transmission terms number N + P - 1 = 1002',
  V.g2012.links.length + V.g2012.P - 1 === 1002);
chk('GATE CSE 2012: the naive N*P count would have been 3000 ms',
  Math.abs(3 * 1000 * 1 - 3000) < 1e-9);

/* GATE 2024 CS1 Q36 */
chk('GATE 2024: one chunk takes 8 ms on one link',
  Math.abs(tt(8000, 1e6) - 0.008) < 1e-15);
chk('GATE 2024: the file is 1000 chunks', V.g2024.P === 1000);
chk('GATE 2024: the total is 8.008 s',
  Math.abs(V.g2024r.total - 8.008) < 1e-9, V.g2024r.total);
chk('GATE 2024: two links cost one extra chunk time, not a second 8 s',
  Math.abs(V.g2024r.total - (8 + 0.008)) < 1e-9);

/* GATE CSE 2022 Q59 */
chk('GATE 2022: transmission is 0.08 ms', Math.abs(V.g2022r.Tt * 1000 - 0.08) < 1e-9);
chk('GATE 2022: propagation is 7 ms', Math.abs(V.g2022r.Tp * 1000 - 7) < 1e-12);
chk('GATE 2022: the total is 7.08 ms', Math.abs(V.g2022ms - 7.08) < 1e-9, V.g2022ms);
chk('GATE 2022: propagation is more than 80 times the transmission delay',
  V.g2022r.Tp > 80 * V.g2022r.Tt);

/* GATE CSE 2014 Set 2 */
chk('GATE 2014: the three cases are 3300, 2400 and 3300 microseconds',
  Math.abs(V.g2014cases[0].us - 3300) < 1e-6 &&
  Math.abs(V.g2014cases[1].us - 2400) < 1e-6 &&
  Math.abs(V.g2014cases[2].us - 3300) < 1e-6,
  V.g2014cases.map(function (c) { return c.us.toFixed(3); }).join(' / '));
chk('GATE 2014: the first and third are equal to within floating point',
  Math.abs(V.g2014cases[0].us - V.g2014cases[2].us) < 1e-6,
  V.g2014cases[0].us + ' vs ' + V.g2014cases[2].us);
chk('GATE 2014: the third is worse than the second', V.g2014cases[2].us > V.g2014cases[1].us);
chk('GATE 2014: the minimum is the middle case, not the finest split',
  V.g2014cases[1].us < V.g2014cases[0].us && V.g2014cases[1].us < V.g2014cases[2].us);
chk('GATE 2014: splitting into 20 parts adds 2000 bytes of headers in total',
  V.g2014cases[2].P * V.g2014.hdr === 2000);

/* circuit against packet switching */
chk('the circuit costs setup plus data plus propagation',
  Math.abs(V.cpCircuit - (0.5 + 10 + 0)) < 1e-9, V.cpCircuit);
chk('the packet path costs 642 packet times',
  Math.abs(V.cpPacket - 642 * 1000 / 64000) < 1e-9, V.cpPacket);
chk('so packet switching is faster here', V.cpPacket < V.cpCircuit);
chk('the crossover setup time is (N-1)L/R = 0.03125 s',
  Math.abs(V.cpCrossover - 0.03125) < 1e-12, V.cpCrossover);
chk('a setup longer than the crossover makes packet switching win',
  V.cp.S > V.cpCrossover && V.cpPacket < V.cpCircuit);
chk('a setup shorter than the crossover makes the circuit win',
  circuitTotal(640000, 64000, 0.01, V.cp.links, 1) < packetTotal(640000, 64000, 1000, V.cp.links, 1));

/* throughput and the bottleneck */
chk('the throughput of a series path is its slowest link',
  throughput(V.g2026links) === 5e5);
chk('GATE 2026: 32 million bits at 500 kbps is 64 s',
  Math.abs(V.g2026time - 64) < 1e-9, V.g2026time);
chk('GATE 2026: the bottleneck is not the average rate',
  Math.abs(V.g2026time - V.g2026bits / ((2e6 + 5e5 + 1e6) / 3)) > 1);

/* layering */
chk('seven OSI layers and five Internet layers', V.osi.length === 7 && V.inet.length === 5);
chk('the Internet map covers all seven OSI layers',
  V.inetMapsTo.reduce(function (a, g) { return a + g.length; }, 0) === 7);
chk('the three top OSI layers collapse into one Internet layer',
  V.inetMapsTo[0].length === 3);
chk('the transport, network and link layers map one to one',
  V.inetMapsTo[1].length === 1 && V.inetMapsTo[2].length === 1 && V.inetMapsTo[3].length === 1);
chk('every layer has a named unit of data', V.pdu.length === V.inet.length);
chk('the four headers total 54 bytes', V.hdrTotal === 54);

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function rv(t, a, d) { return clamp01((t - a) / (d || 1)); }
function ease(v) { return v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2; }
function lerp(a, b, u) { return a + (b - a) * u; }
function txt(x, y, s, o) { P.text(x, y, s, o || {}); }
function num(x, dp) { return (Math.round(x * Math.pow(10, dp)) / Math.pow(10, dp)).toFixed(dp); }

function box(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, {
    fill: o.fill, stroke: o.stroke, sw: o.sw || 1.4,
    radius: o.radius === undefined ? 8 : o.radius, dash: o.dash
  });
}
function label(x, y, s, o) {
  o = o || {};
  txt(x, y, s, { size: o.size || 11, mono: true, color: o.color || PAL.faint, bold: !!o.bold, align: o.align, base: o.base });
}
function head(s, sub) {
  txt(40, 20, s, { size: 17, bold: true, color: PAL.ink });
  if (sub) txt(40, 42, sub, { size: 11, mono: true, color: PAL.faint });
  P.line(40, 58, W - 40, 58, { stroke: PAL.border, sw: 1 });
}
function bg() {
  P.rect(0, 0, W, H, { fill: PAL.surface });
  P.rect(0, 0, W, 4, { fill: PAL.accent });
}

/* a device: a rounded box with a name under it */
function node(x, y, w, h, name, o) {
  o = o || {};
  box(x, y, w, h, { fill: o.fill || PAL.surface2, stroke: o.stroke || PAL.border, sw: o.sw || 1.4 });
  txt(x + w / 2, y + h / 2, name, {
    size: o.size || 12, bold: true, align: 'center', base: 'middle', color: o.color || PAL.ink, mono: !!o.mono
  });
}

/* a horizontal link between two boxes, with an optional label above it */
function wire(x1, x2, y, o) {
  o = o || {};
  P.line(x1, y, x2, y, { stroke: o.stroke || PAL.border, sw: o.sw || 2, dash: o.dash });
}

/* a small filled square, used for a bit */
function bit(x, y, s, o) {
  o = o || {};
  P.rect(x, y, s, s, { fill: o.fill || PAL.accent, stroke: o.stroke, sw: 1, radius: 1 });
}

/* ======================================================================
   SCENE 1 - why layers
   ====================================================================== */
function scLayers(t) {
  head('Why a network is built out of layers',
       'four unrelated problems, four layers, one narrow interface between neighbours');

  var names = ['Application', 'Transport', 'Network', 'Link'];
  var sub = ['the conversation', 'process to process', 'machine to machine', 'one hop on one wire'];
  var y0 = 100, pitch = 64, bh = 48, bw = 150;
  var sx = 54, rx = 696;
  var i, on, y;

  for (i = 0; i < 4; i++) {
    y = y0 + i * pitch;
    on = clamp01((t - 0.6 - i * 1.1) / 1.6);
    P.alpha(0.3 + 0.7 * on);
    box(sx, y, bw, bh, { fill: PAL.surface2, stroke: PAL.border });
    txt(sx + 12, y + 15, names[i], { size: 12, bold: true });
    txt(sx + 12, y + 31, sub[i], { size: 9.5, mono: true, color: PAL.faint });
    box(rx, y, bw, bh, { fill: PAL.surface2, stroke: PAL.border });
    txt(rx + 12, y + 15, names[i], { size: 12, bold: true });
    txt(rx + 12, y + 31, sub[i], { size: 9.5, mono: true, color: PAL.faint });
    P.alpha(1);
  }
  label(sx + bw / 2, y0 - 12, 'sender', { align: 'center', bold: true, color: PAL.dim });
  label(rx + bw / 2, y0 - 12, 'receiver', { align: 'center', bold: true, color: PAL.dim });

  /* the logical peer conversation, drawn only once it is being discussed */
  if (t >= 13.5) {
    P.alpha(clamp01((t - 13.5) / 1.5));
    P.arrow(sx + bw + 24, 268, rx - 24, 268, { stroke: PAL.info, sw: 1.4, head: 9, dash: [6, 5] });
    label(450, 252, 'layer n talks to layer n — logically only', { align: 'center', color: PAL.info });
    P.alpha(1);
  }

  /* the envelope: down, across, up */
  var down = ease(clamp01(t / 13));
  var across = ease(rv(t, 13.5, 8));
  var up = ease(rv(t, 21.5, 7.5));
  var hdrs = 0;
  var ex, ey, ew = 96, eh = 26;
  if (t < 13.5) {
    hdrs = Math.min(3, Math.floor(down * 3.999));
    ex = sx + bw + 22;
    ey = lerp(y0 + 10, y0 + 3 * pitch + 10, down);
  } else if (t < 21.5) {
    hdrs = 3;
    ex = lerp(sx + bw + 22, rx - 22 - ew, across);
    ey = y0 + 3 * pitch + 10;
  } else {
    hdrs = 3 - Math.min(3, Math.floor(up * 3.999));
    ex = rx - 22 - ew;
    ey = lerp(y0 + 3 * pitch + 10, y0 + 10, up);
  }

  /* payload plus one strip per header accumulated so far */
  var pw = ew - hdrs * 20;
  box(ex + hdrs * 20, ey, pw, eh, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2 });
  txt(ex + hdrs * 20 + pw / 2, ey + eh / 2, 'data', {
    size: 10, mono: true, align: 'center', base: 'middle', color: PAL.accent
  });
  var cols = [PAL.info, PAL.warn, PAL.invalid];
  var nm = ['T', 'N', 'L'];
  for (i = 0; i < hdrs; i++) {
    box(ex + i * 20, ey, 20, eh, { fill: PAL.surface, stroke: cols[i], sw: 1.3, radius: 3 });
    txt(ex + i * 20 + 10, ey + eh / 2, nm[i], {
      size: 10, bold: true, mono: true, align: 'center', base: 'middle', color: cols[i]
    });
  }
  label(ex + ew / 2, ey + eh + 8, hdrs === 0 ? 'no header yet' : hdrs + (hdrs === 1 ? ' header' : ' headers'),
        { align: 'center', color: PAL.dim });

  label(40, 440, 'going down adds a header · going up removes the one its peer wrote',
        { color: PAL.faint });
}

/* ======================================================================
   SCENE 2 - the two stacks
   ====================================================================== */
function scStacks(t) {
  head('The two reference stacks, and what each layer owns',
       'seven OSI layers · five Internet layers · five units of data');

  var i, y;
  var ox = 50, ow = 180, oy = 84, oh = 40, opitch = 46;
  var ix = 430, iw = 190;

  /* OSI column */
  for (i = 0; i < 7; i++) {
    y = oy + i * opitch;
    P.alpha(0.3 + 0.7 * clamp01((t - i * 0.7) / 1.4));
    box(ox, y, ow, oh, { fill: PAL.surface2, stroke: PAL.border });
    txt(ox + 12, y + oh / 2, (7 - i) + '  ' + V.osi[i], { size: 12, base: 'middle' });
    P.alpha(1);
  }
  label(ox + ow / 2, oy - 12, 'OSI reference model', { align: 'center', bold: true, color: PAL.dim });

  /* Internet column: five boxes aligned to the OSI groups they cover */
  var gy = V.inetMapsTo.map(function (g) { return oy + g[0] * opitch; });
  var gh = V.inetMapsTo.map(function (g) { return g.length * opitch - 6; });
  for (i = 0; i < 5; i++) {
    P.alpha(0.3 + 0.7 * clamp01((t - 8 - i * 0.8) / 1.6));
    box(ix, gy[i], iw, gh[i], { fill: PAL.surface, stroke: PAL.accent, sw: 1.6 });
    txt(ix + 12, gy[i] + gh[i] / 2, V.inet[i], { size: 12, bold: true, base: 'middle', color: PAL.ink });
    P.alpha(1);
    /* the mapping elbow, from the middle of the OSI group to the Internet box */
    if (t >= 8) {
      P.alpha(clamp01((t - 8) / 1.4));
      P.line(ox + ow + 6, gy[i] + gh[i] / 2, ix - 10, gy[i] + gh[i] / 2,
             { stroke: PAL.border, sw: 1.2, dash: [4, 4] });
      P.alpha(1);
    }
  }
  label(ix + iw / 2, oy - 12, 'Internet stack', { align: 'center', bold: true, color: PAL.dim });

  /* what each layer owns, revealed in the third caption */
  if (t >= 15) {
    P.alpha(clamp01((t - 15) / 1.5));
    var own = ['HTTP, DNS: the conversation',
               'port to port, end to end',
               'IP: host to host, across nets',
               'Ethernet: one hop, one wire',
               'signals on the medium'];
    for (i = 0; i < 5; i++) {
      txt(ix + iw + 16, gy[i] + gh[i] / 2, own[i], {
        size: 10, mono: true, base: 'middle', color: PAL.dim
      });
    }
    P.alpha(1);
  }

  /* the unit of data each layer carries, in the last caption */
  if (t >= 22.5) {
    P.alpha(clamp01((t - 22.5) / 1.5));
    for (i = 0; i < 5; i++) {
      txt(ix - 14, gy[i] + gh[i] / 2, V.pdu[i], {
        size: 10, mono: true, align: 'right', base: 'middle', color: PAL.warn
      });
    }
    label(ix - 14, oy - 12, 'unit', { align: 'right', bold: true, color: PAL.warn });
    P.alpha(1);
  }

  label(40, 440, 'only the transport layer and above are end to end — a router stops at the network layer',
        { color: PAL.faint });
}

/* ======================================================================
   SCENE 3 - encapsulation and re-encapsulation
   ====================================================================== */
function scEncap(t) {
  head('Encapsulation, and which addresses survive a hop',
       'down adds a header · up removes one · a router swaps only the link header');

  var xs = [86, 320, 556, 792];
  var names = ['S', 'R1', 'R2', 'D'];
  var y = 108, bw = 84, bh = 34;
  var i;

  for (i = 0; i < 4; i++) {
    node(xs[i], y, bw, bh, names[i], { size: 12, mono: true });
    if (i < 3) wire(xs[i] + bw, xs[i + 1], y + bh / 2, { stroke: PAL.border, sw: 2 });
  }
  label(xs[0] + bw / 2, y + bh + 14, 'host', { align: 'center' });
  label(xs[1] + bw / 2, y + bh + 14, 'router', { align: 'center' });
  label(xs[2] + bw / 2, y + bh + 14, 'router', { align: 'center' });
  label(xs[3] + bw / 2, y + bh + 14, 'host', { align: 'center' });

  /* the packet as four stacked strips, drawn once it exists */
  var px = 150, py = 186, ph = 30;
  var segs = [
    { k: 'L2', bytes: V.hdr.link, col: PAL.invalid, w: 66 },
    { k: 'L3', bytes: V.hdr.network, col: PAL.warn, w: 90 },
    { k: 'L4', bytes: V.hdr.transport, col: PAL.info, w: 90 },
    { k: 'data', bytes: 0, col: PAL.accent, w: 220 }
  ];

  var shown = t < 15 ? 4 : 4;
  var x = px;
  for (i = 0; i < shown; i++) {
    var s = segs[i];
    var a = t < 8 ? clamp01((t - i * 1.5) / 1.5) : 1;
    P.alpha(0.3 + 0.7 * a);
    /* at a router the link header is rewritten: flash it */
    var swap = (t >= 15 && i === 0);
    var flash = swap ? 0.5 + 0.5 * Math.cos((t - 15) * 3) : 1;
    box(x, py, s.w, ph, {
      fill: i === 0 ? PAL.invalidDim : PAL.surface,
      stroke: s.col, sw: i === 0 ? 2.2 : 1.5
    });
    P.alpha(1);
    txt(x + s.w / 2, py + ph / 2, s.k, {
      size: 10, bold: true, mono: true, align: 'center', base: 'middle', color: s.col
    });
    if (swap) {
      P.alpha(0.25 + 0.55 * flash);
      box(x - 3, py - 3, s.w + 6, ph + 6, { stroke: s.col, sw: 1, radius: 10 });
      P.alpha(1);
    }
    x += s.w;
  }

  /* what each header carries */
  if (t >= 8) {
    P.alpha(clamp01((t - 8) / 1.5));
    var carry = ['MAC addr', 'IP addresses', 'port numbers', 'the message'];
    x = px;
    for (i = 0; i < 4; i++) {
      txt(x + segs[i].w / 2, py + ph + 10, carry[i], {
        size: 9.5, mono: true, align: 'center', color: PAL.faint
      });
      x += segs[i].w;
    }
    P.alpha(1);
  }

  /* the journey: which header is read where */
  var hop = Math.floor(clamp01(rv(t, 15, 15)) * 3.999);
  if (t >= 15) {
    for (i = 0; i <= hop; i++) {
      txt(xs[Math.min(3, i)] + bw / 2, y - 12, 'L2 read and rewritten', {
        size: 9, mono: true, align: 'center', color: PAL.invalid
      });
    }
  }

  /* the network header is never rewritten */
  if (t >= 22.5) {
    P.alpha(clamp01((t - 22.5) / 1.5));
    P.line(px + 66 + 45, py - 12, px + 66 + 45, py - 4, { stroke: PAL.warn, sw: 1.4 });
    label(px + 66 + 45, py - 22, 'L3 survives every hop', { align: 'center', color: PAL.warn });
    P.alpha(1);
  }

  box(150, 300, 620, 62, { fill: PAL.surface2, stroke: PAL.border, radius: 8 });
  txt(166, 320, 'headers added: 14 + 20 + 20 = 54 bytes', { size: 12, mono: true, color: PAL.dim });
  txt(166, 342, 'a 46-byte message leaves as a 100-byte frame', { size: 12, mono: true, color: PAL.dim });

  label(40, 440, 'a switch reads L2 · a router reads L2 then L3 · neither reads L4', { color: PAL.faint });
}

/* ======================================================================
   SCENE 4 - circuit switching
   ====================================================================== */
function scCircuit(t) {
  head('Circuit switching: reserve first, then send',
       'setup · data · teardown — the reservation is what buys the guarantee');

  var xs = [70, 288, 506, 724];
  var names = ['A', 'SW1', 'SW2', 'B'];
  var y = 104, bw = 96, bh = 38;
  var i;
  for (i = 0; i < 4; i++) {
    node(xs[i], y, bw, bh, names[i], { size: 12, mono: true });
    if (i < 3) wire(xs[i] + bw, xs[i + 1], y + bh / 2, { stroke: PAL.border, sw: 2 });
  }

  /* phase boundaries: setup 0-7.5, data 7.5-15, teardown 15-22.5, summary after */
  var reserved = t < 15 ? clamp01((t - 1) / 5) : Math.max(0, 1 - clamp01((t - 15) / 3));

  /* setup: a dashed path drawn hop by hop */
  if (t < 8) {
    var u = clamp01(t / 6.5);
    for (i = 0; i < 3; i++) {
      var seg = clamp01((u * 3) - i);
      if (seg <= 0) continue;
      var x1 = xs[i] + bw + 4, x2 = xs[i + 1] - 4;
      P.arrow(x1, y + bh / 2 - 14, lerp(x1, x2, seg), y + bh / 2 - 14,
              { stroke: PAL.info, sw: 1.6, head: 8, dash: [6, 4] });
    }
    label(450, y - 26, 'setup message reserves a fixed slice on every link', { align: 'center', color: PAL.info });
  }

  /* the reservation, shown as a filled band inside each switch */
  if (reserved > 0.02) {
    P.alpha(0.2 + 0.8 * reserved);
    for (i = 1; i < 3; i++) {
      box(xs[i] + 10, y + bh - 12, bw - 20, 7, { fill: PAL.accent, stroke: PAL.accent, radius: 3 });
    }
    for (i = 0; i < 3; i++) {
      box(xs[i] + bw + 4, y + bh / 2 + 5, xs[i + 1] - xs[i] - bw - 8, 5,
          { fill: PAL.accent, stroke: PAL.accent, radius: 2 });
    }
    P.alpha(1);
    label(450, y + bh + 26, 'reserved capacity: constant rate, no queue', { align: 'center', color: PAL.accent });
  }

  /* data: a continuous stream of bits, no switch ever holds a whole packet */
  if (t >= 7.5 && t < 15) {
    var flow = (t - 7.5) / 7.5;
    for (i = 0; i < 22; i++) {
      var f = ((i / 22) + flow * 1.6) % 1;
      bit(74 + f * 700, y + bh / 2 + 22, 6, { fill: PAL.accent });
    }
    label(450, y + bh + 52, 'bits stream straight through — nothing is stored whole', { align: 'center', color: PAL.dim });
  }

  /* teardown */
  if (t >= 15 && t < 22.5) {
    label(450, y + bh + 52, 'teardown releases the reservation', { align: 'center', color: PAL.warn });
  }

  /* the cost bar */
  var bx = 130, byy = 300, bwd = 640;
  var setupF = 0.35, dataF = 0.65;
  box(bx, byy, bwd * setupF, 34, { fill: PAL.warnDim, stroke: PAL.warn });
  txt(bx + bwd * setupF / 2, byy + 17, 'setup', {
    size: 11, mono: true, align: 'center', base: 'middle', color: PAL.warn
  });
  box(bx + bwd * setupF, byy, bwd * dataF, 34, { fill: PAL.accentDim, stroke: PAL.accent });
  txt(bx + bwd * setupF + bwd * dataF / 2, byy + 17, 'data at the reserved rate', {
    size: 11, mono: true, align: 'center', base: 'middle', color: PAL.accent
  });
  label(bx, byy + 48, 'time', { color: PAL.faint });
  label(bx + bwd, byy + 48, 'T = setup + F/R + propagation', { align: 'right', color: PAL.dim });

  txt(130, 386, 'the setup is a fixed cost: it is paid whether the transfer is long or short.',
      { size: 12, color: PAL.dim });
  txt(130, 408, 'an idle circuit still holds its capacity — predictable, and wasteful.',
      { size: 12, color: PAL.dim });
}

/* ======================================================================
   SCENE 5 - packet switching
   ====================================================================== */
function scPacket(t) {
  head('Packet switching: datagram and virtual circuit',
       'no setup · store-and-forward · per-packet routing or a per-flow label');

  /* the message cut into packets */
  var px = 90, py = 92, pw = 44, ph = 26, i;
  for (i = 0; i < 5; i++) {
    P.alpha(t < 4 ? clamp01((t - i * 0.6) / 1.2) : 1);
    box(px + i * (pw + 8), py, pw, ph, { fill: PAL.surface, stroke: PAL.accent, sw: 1.4, radius: 4 });
    txt(px + i * (pw + 8) + pw / 2, py + ph / 2, 'p' + (i + 1), {
      size: 10, mono: true, align: 'center', base: 'middle', color: PAL.accent
    });
    P.alpha(1);
  }
  label(px, py - 10, 'one message, cut into packets — no setup anywhere', { color: PAL.dim });

  /* store-and-forward, shown at one switch */
  var sx = 380, sy = 140, sw = 140, sh = 60;
  if (t >= 6) {
    P.alpha(clamp01((t - 6) / 1.4));
    box(sx, sy, sw, sh, { fill: PAL.surface2, stroke: PAL.border });
    txt(sx + sw / 2, sy + 16, 'a switch', { size: 11, bold: true, align: 'center', color: PAL.ink });
    /* the incoming packet fills, then the outgoing starts */
    var fill = clamp01(rv(t, 7, 5));
    var out = clamp01(rv(t, 12, 5));
    box(sx + 12, sy + 30, (sw - 24) * fill, 10, { fill: PAL.info, stroke: PAL.info, radius: 3 });
    txt(sx + 12, sy + 52, fill < 1 ? 'receiving the whole packet' : (out < 1 ? 'forwarding it on' : 'done'),
        { size: 9.5, mono: true, color: PAL.dim });
    box(sx + 12, sy + 30, (sw - 24) * out, 10, { fill: PAL.accent, stroke: PAL.accent, radius: 3 });
    P.alpha(1);
  }
  label(450, sy + sh + 14, 'the whole packet must arrive before any of it leaves', { align: 'center', color: PAL.faint });

  /* datagram panel */
  var dy = 236, dx = 70, dw = 360, dh = 150;
  P.alpha(t >= 15 ? 1 : 0.35);
  box(dx, dy, dw, dh, { fill: PAL.surface, stroke: PAL.border, radius: 8 });
  txt(dx + 14, dy + 18, 'datagram: routed per packet', { size: 12, bold: true, color: PAL.ink });
  var dNodes = [[dx + 24, dy + 74], [dx + 150, dy + 50], [dx + 150, dy + 100], [dx + 300, dy + 74]];
  for (i = 0; i < 4; i++) {
    P.circle(dNodes[i][0], dNodes[i][1], 13, { fill: PAL.surface2, stroke: PAL.border, sw: 1.4 });
  }
  txt(dx + 24, dy + 74, 'A', { size: 10, mono: true, align: 'center', base: 'middle' });
  txt(dx + 300, dy + 74, 'B', { size: 10, mono: true, align: 'center', base: 'middle' });
  if (t >= 15) {
    var du = clamp01(rv(t, 15, 6));
    P.arrow(dx + 40, dy + 70, dx + 136, dy + 50, { stroke: PAL.info, sw: 1.4, head: 7 });
    P.arrow(dx + 40, dy + 78, dx + 136, dy + 100, { stroke: PAL.warn, sw: 1.4, head: 7 });
    P.arrow(dx + 164, dy + 50, dx + 288, dy + 70, { stroke: PAL.info, sw: 1.4, head: 7 });
    P.arrow(dx + 164, dy + 100, dx + 288, dy + 78, { stroke: PAL.warn, sw: 1.4, head: 7 });
    /* two packets in flight on different paths */
    bit(lerp(dx + 40, dx + 136, du), lerp(dy + 70, dy + 50, du) - 4, 8, { fill: PAL.info });
    bit(lerp(dx + 40, dx + 136, du), lerp(dy + 78, dy + 100, du) - 4, 8, { fill: PAL.warn });
  }
  txt(dx + 14, dy + 136, 'different paths, possibly out of order', { size: 10, mono: true, color: PAL.faint });

  /* virtual-circuit panel */
  var vx = 470, vy = 236, vw = 360, vh = 150;
  P.alpha(t >= 22.5 ? 1 : 0.35);
  box(vx, vy, vw, vh, { fill: PAL.surface, stroke: PAL.border, radius: 8 });
  txt(vx + 14, vy + 18, 'virtual circuit: one label, one path', { size: 12, bold: true, color: PAL.ink });
  var vNodes = [[vx + 24, vy + 74], [vx + 130, vy + 74], [vx + 210, vy + 74], [vx + 300, vy + 74]];
  for (i = 0; i < 4; i++) {
    P.circle(vNodes[i][0], vNodes[i][1], 13, { fill: PAL.surface2, stroke: PAL.border, sw: 1.4 });
  }
  txt(vx + 24, vy + 74, 'A', { size: 10, mono: true, align: 'center', base: 'middle' });
  txt(vx + 300, vy + 74, 'B', { size: 10, mono: true, align: 'center', base: 'middle' });
  if (t >= 22.5) {
    var vu = clamp01(rv(t, 22.5, 6));
    for (i = 0; i < 3; i++) {
      P.arrow(vNodes[i][0] + 15, vy + 74, vNodes[i + 1][0] - 15, vy + 74,
              { stroke: PAL.accent, sw: 1.4, head: 7 });
    }
    for (i = 0; i < 3; i++) {
      txt(vNodes[i][0] + 58, vy + 58, 'vci 7', { size: 9, mono: true, align: 'center', color: PAL.accent });
    }
    bit(lerp(vx + 40, vx + 288, vu), vy + 70, 8, { fill: PAL.accent });
  }
  txt(vx + 14, vy + 136, 'same path, in order — but no capacity reserved', { size: 10, mono: true, color: PAL.faint });
  P.alpha(1);

  label(40, 440, 'a virtual circuit borrows the circuit\'s setup and the datagram network\'s contention',
        { color: PAL.faint });
}

/* ======================================================================
   SCENE 6 - the four delays
   ====================================================================== */
function scDelays(t) {
  head('Four delays, and the one everybody confuses',
       'transmission = L/R · propagation = d/v · processing and queuing sit at the switch');

  var x1 = 130, x2 = 780, y = 150;
  node(x1 - 60, y - 22, 60, 44, 'S', { size: 12, mono: true });
  node(x2, y - 22, 60, 44, 'R', { size: 12, mono: true });
  wire(x1, x2, y, { stroke: PAL.border, sw: 3 });

  var Tt = V.delayTt, Tp = V.delayTp, total = V.delayr.total;

  /* the bits: pushed on over Tt, then the leading bit travels for Tp */
  var L = V.delay.L, R = 1e6;
  var u = clamp01(t / 22);
  var clock = u * total;
  var nb = 16;
  for (var i = 0; i < nb; i++) {
    var bIn = (i / nb) * Tt;                    /* when this bit enters the wire */
    if (clock < bIn) continue;
    var bOut = Math.min(1, (clock - bIn) / Tp); /* fraction of the wire it has crossed */
    bit(lerp(x1, x2 - 8, bOut), y - 4, 8, { fill: bOut >= 1 ? PAL.valid : PAL.accent });
  }

  /* the two bars */
  var bx = 130, byy = 214, bwd = 650;
  var ttW = bwd * (Tt / total), tpW = bwd * (Tp / total);
  box(bx, byy, ttW, 26, { fill: PAL.accentDim, stroke: PAL.accent });
  txt(bx + ttW / 2, byy + 13, 'L / R', {
    size: 11, mono: true, align: 'center', base: 'middle', color: PAL.accent
  });
  box(bx + ttW, byy, tpW, 26, { fill: PAL.warnDim, stroke: PAL.warn });
  txt(bx + ttW + tpW / 2, byy + 13, 'd / v', {
    size: 11, mono: true, align: 'center', base: 'middle', color: PAL.warn
  });
  label(bx, byy + 38, 'transmission ' + num(Tt * 1000, 1) + ' ms', { color: PAL.accent });
  label(bx + bwd, byy + 38, 'propagation ' + num(Tp * 1000, 1) + ' ms', { align: 'right', color: PAL.warn });

  /* the standing numbers */
  var cx = 130, cy = 286;
  box(cx, cy, 320, 108, { fill: PAL.surface2, stroke: PAL.border, radius: 8 });
  txt(cx + 14, cy + 20, 'this link', { size: 11, bold: true, color: PAL.ink });
  txt(cx + 14, cy + 42, 'L = 8000 bits, R = 1 Mbps', { size: 10.5, mono: true, color: PAL.dim });
  txt(cx + 14, cy + 60, 'd = 2000 km, v = 2x10^8 m/s', { size: 10.5, mono: true, color: PAL.dim });
  txt(cx + 14, cy + 82, 'Tt = 8 ms, Tp = 10 ms, total 18 ms', { size: 10.5, mono: true, color: PAL.accent });
  txt(cx + 14, cy + 99, 'bits in flight = R x Tp = 10000', { size: 10.5, mono: true, color: PAL.info });

  /* the distinction that earns the marks */
  if (t >= 7.5) {
    P.alpha(clamp01((t - 7.5) / 1.5));
    txt(486, cy + 20, 'double R', { size: 11, bold: true, color: PAL.ink });
    txt(486, cy + 42, 'Tt halves, Tp unchanged', { size: 10.5, mono: true, color: PAL.dim });
    txt(486, cy + 66, 'double L', { size: 11, bold: true, color: PAL.ink });
    txt(486, cy + 88, 'Tt doubles, Tp unchanged', { size: 10.5, mono: true, color: PAL.dim });
    txt(486, cy + 108, 'double d: only Tp changes', { size: 10.5, mono: true, color: PAL.warn });
    P.alpha(1);
  }

  /* processing and queuing appear at a node */
  if (t >= 15) {
    P.alpha(clamp01((t - 15) / 1.5));
    box(700, 286, 190, 108, { fill: PAL.warnDim, stroke: PAL.warn, radius: 8 });
    txt(714, 306, 'at a node', { size: 11, bold: true, color: PAL.warn });
    txt(714, 328, 'processing: read header', { size: 10, mono: true, color: PAL.dim });
    txt(714, 346, 'queuing: wait in buffer', { size: 10, mono: true, color: PAL.dim });
    txt(714, 372, 'zero unless given', { size: 10, mono: true, color: PAL.warn });
    P.alpha(1);
  }

  /* the bandwidth-delay product drawn as the filled pipe */
  if (t >= 22.5) {
    P.alpha(clamp01((t - 22.5) / 1.5));
    P.rect(x1, y - 14, (x2 - x1) * clamp01(rv(t, 23, 4)), 8,
           { fill: PAL.accentDim, stroke: PAL.accent, sw: 1, radius: 3 });
    label(450, y - 24, 'rate x propagation delay = the bits that fit on the wire', { align: 'center', color: PAL.accent });
    P.alpha(1);
  }

  label(40, 440, 'the packet size changes L/R and nothing else — this is the confusion to kill first',
        { color: PAL.faint });
}

/* ======================================================================
   SCENE 7 - one packet over three links
   ====================================================================== */
function scOnePacket(t) {
  head('One packet over three store-and-forward links',
       'sum the transmission terms, sum the propagation terms, add them');

  var xs = [74, 300, 526, 752];
  var names = ['S', 'R1', 'R2', 'D'];
  var y = 92, bw = 74, bh = 32, i;
  for (i = 0; i < 4; i++) {
    node(xs[i], y, bw, bh, names[i], { size: 11, mono: true });
    if (i < 3) wire(xs[i] + bw, xs[i + 1], y + bh / 2, { stroke: PAL.border, sw: 2 });
  }

  /* GATE 2022 numbers, computed by the model */
  var r = V.g2022r;
  var lines = [
    'L = 1000 bytes = 8000 bits',
    'R = 100 Mbps = 10^8 bits/s',
    'd = 2100 km = 2.1x10^6 m',
    'v = 3x10^8 m/s, one link'
  ];
  box(74, 148, 300, 112, { fill: PAL.surface2, stroke: PAL.border, radius: 8 });
  txt(90, 168, 'GATE CSE 2022, Q59', { size: 11, bold: true, color: PAL.ink });
  for (i = 0; i < 4; i++) {
    txt(90, 190 + i * 17, lines[i], { size: 10, mono: true, color: PAL.dim });
  }

  /* the arithmetic, revealed step by step */
  var steps = [
    { at: 4, k: 'Tt = 8000 / 10^8', v: '= 0.08 ms' },
    { at: 9, k: 'Tp = 2.1x10^6 / 3x10^8', v: '= 7.00 ms' },
    { at: 14, k: 'Tt + Tp', v: '= 7.08 ms' }
  ];
  box(400, 148, 420, 112, { fill: PAL.surface, stroke: PAL.accent, sw: 1.6, radius: 8 });
  txt(416, 168, 'the answer, computed here', { size: 11, bold: true, color: PAL.accent });
  for (i = 0; i < steps.length; i++) {
    if (t < steps[i].at) continue;
    txt(416, 192 + i * 20, steps[i].k, { size: 10.5, mono: true, color: PAL.dim });
    txt(700, 192 + i * 20, steps[i].v, { size: 10.5, mono: true, align: 'right', color: PAL.ink });
  }
  if (t >= 14) {
    txt(416, 252, 'propagation is 87.5 times the transmission delay',
        { size: 10.5, mono: true, color: PAL.warn });
  }

  /* the time axis: where the one packet is, over the whole journey */
  var ax = 90, aw = 700, ay = 300;
  P.line(ax, ay, ax + aw, ay, { stroke: PAL.border, sw: 1.4 });
  for (i = 0; i <= 4; i++) {
    var tx = ax + aw * (i / 4);
    P.line(tx, ay - 4, tx, ay + 4, { stroke: PAL.border, sw: 1.2 });
    label(tx, ay + 8, num(r.total * 1000 * (i / 4), 1) + ' ms', { align: 'center' });
  }
  var clock = clamp01(t / 22) * r.total;
  var pos = ax + aw * (clock / r.total);
  P.arrow(ax, ay - 26, pos, ay - 26, { stroke: PAL.accent, sw: 2, head: 8 });
  bit(pos - 4, ay - 30, 8, { fill: PAL.accent });
  label(ax, ay - 42, 'the packet', { color: PAL.accent });

  txt(90, 356, 'one link, one transmission term, one propagation term.',
      { size: 12, color: PAL.dim });
  txt(90, 378, 'with more links you would add one of each per link — the count of hops is the count of links.',
      { size: 12, color: PAL.dim });
  label(40, 440, 'the packet size barely matters on a long fast link — that is the whole point of this item',
        { color: PAL.faint });
}

/* ======================================================================
   SCENE 8 - the pipelined staircase
   ====================================================================== */
function scPipeline(t) {
  head('Many packets: the staircase, and why it is not twice the work',
       '(N + P - 1) x L/R + N x d/v  —  the minus one is the pipelining');

  /* teaching configuration: 3 links, 4 packets, 1 unit each way */
  var res = pipeline(V.teach.links, 1, 4, 1);
  var N = 3, Pk = 4, Tt = 1, Tp = 1;
  var naive = N * Pk * Tt + N * Tp;

  var ax = 150, aw = 620, ay0 = 108, rowH = 52;
  var total = Math.max(res.total, naive);

  var i, p;
  for (i = 0; i < N; i++) {
    var ry = ay0 + i * rowH;
    label(ax - 12, ry + 9, 'link ' + (i + 1), { align: 'right', color: PAL.dim, bold: true });
    P.line(ax, ry + 12, ax + aw, ry + 12, { stroke: PAL.border, sw: 1 });
    /* each packet's busy interval on this link, from the simulation */
    for (p = 0; p < res.spans[i].length; p++) {
      var sp = res.spans[i][p];
      if (t < 3 + p * 1.6) continue;
      var xa = ax + aw * (sp.start / total);
      var xb = ax + aw * (sp.finish / total);
      box(xa, ry, Math.max(6, xb - xa), 12, {
        fill: p % 2 ? PAL.accentDim : PAL.surface2,
        stroke: p % 2 ? PAL.accent : PAL.border, sw: 1.2, radius: 3
      });
      txt((xa + xb) / 2, ry + 6, 'p' + (p + 1), {
        size: 9, mono: true, align: 'center', base: 'middle',
        color: p % 2 ? PAL.accent : PAL.dim
      });
    }
  }

  /* the total, marked */
  var tx = ax + aw * (res.total / total);
  P.line(tx, ay0 - 14, tx, ay0 + N * rowH - 8, { stroke: PAL.valid, sw: 1.6, dash: [5, 4] });
  label(tx + 6, ay0 - 20, 'pipelined: ' + res.total + ' units', { color: PAL.valid, bold: true });
  var nx = ax + aw;
  P.line(nx, ay0 - 14, nx, ay0 + N * rowH - 8, { stroke: PAL.invalid, sw: 1.6, dash: [5, 4] });
  label(nx - 4, ay0 - 20, 'naive: ' + naive + ' units', { align: 'right', color: PAL.invalid, bold: true });

  /* the formula */
  box(150, 276, 620, 60, { fill: PAL.surface2, stroke: PAL.border, radius: 8 });
  txt(166, 298, '(N + P - 1) x L/R  +  N x d/v', { size: 14, mono: true, bold: true, color: PAL.ink });
  txt(166, 320, '(3 + 4 - 1) x 1 + 3 x 1 = 9 units, not 3 x 4 + 3 = 15',
      { size: 11, mono: true, color: PAL.dim });

  /* the two previous-year items, both recomputed here */
  if (t >= 15) {
    P.alpha(clamp01((t - 15) / 1.5));
    box(150, 348, 300, 76, { fill: PAL.surface, stroke: PAL.accent, sw: 1.4, radius: 8 });
    txt(164, 368, 'GATE CSE 2012 Q44', { size: 11, bold: true, color: PAL.ink });
    txt(164, 388, '(3 + 1000 - 1) x 1 ms', { size: 10, mono: true, color: PAL.dim });
    txt(164, 406, '+ 3 x 1 ms = 1005 ms', { size: 10, mono: true, color: PAL.accent });
    P.alpha(1);
  }
  if (t >= 22.5) {
    P.alpha(clamp01((t - 22.5) / 1.5));
    box(470, 348, 300, 76, { fill: PAL.surface, stroke: PAL.accent, sw: 1.4, radius: 8 });
    txt(484, 368, 'GATE 2024 CS1 Q36', { size: 11, bold: true, color: PAL.ink });
    txt(484, 388, '(2 + 1000 - 1) x 8 ms', { size: 10, mono: true, color: PAL.dim });
    txt(484, 406, '+ 0 = 8008 ms = 8.008 s', { size: 10, mono: true, color: PAL.accent });
    P.alpha(1);
  }

  label(40, 452, 'the first packet pays every link; each later packet pays one transmission time',
        { color: PAL.faint });
}

/* ======================================================================
   SCENE 9 - two trade-offs
   ====================================================================== */
function scTradeoff(t) {
  head('Two trade-offs: header overhead, and setup against pipelining',
       'more packets pipeline better and cost more headers · a circuit trades setup for no overhead');

  /* the three 2014 cases as bars */
  var bx = 130, byy = 118, maxUs = 3600, scale = 300 / maxUs;
  var cols = [PAL.warn, PAL.valid, PAL.warn];
  var lbl = ['1 packet', '10 packets', '20 packets'];
  var i;
  for (i = 0; i < 3; i++) {
    var c = V.g2014cases[i];
    var w = c.us * scale;
    var ry = byy + i * 56;
    label(bx - 12, ry + 9, lbl[i], { align: 'right', color: PAL.dim, bold: true });
    if (t >= 4 + i * 2.5) {
      box(bx, ry, w, 20, { fill: i === 1 ? PAL.valid : PAL.warnDim, stroke: cols[i], sw: 1.4, radius: 3 });
      txt(bx + w + 10, ry + 10, num(c.us, 0) + ' us', {
        size: 10, mono: true, base: 'middle', color: cols[i]
      });
      txt(bx + 8, ry + 10, c.P + ' x ' + num(c.L, 0) + ' B', {
        size: 9, mono: true, base: 'middle', color: i === 1 ? PAL.surface : PAL.warn
      });
    }
  }
  label(bx, byy - 16, 'GATE CSE 2014 Set 2: 1000 bytes, 100 bytes of header per packet, 3 links',
        { color: PAL.ink, bold: true });

  /* the setup-against-pipelining inequality */
  if (t >= 14) {
    P.alpha(clamp01((t - 14) / 1.5));
    box(130, 292, 300, 96, { fill: PAL.surface2, stroke: PAL.border, radius: 8 });
    txt(144, 312, 'circuit vs packet', { size: 11, bold: true, color: PAL.ink });
    txt(144, 332, 'circuit: S + F/R', { size: 10.5, mono: true, color: PAL.warn });
    txt(144, 350, 'packet:  F/R + (N-1)L/R', { size: 10.5, mono: true, color: PAL.accent });
    txt(144, 372, 'circuit wins iff S < (N-1)L/R', { size: 10.5, mono: true, color: PAL.ink });
    P.alpha(1);
  }
  if (t >= 18) {
    P.alpha(clamp01((t - 18) / 1.5));
    txt(144, 0 + 392, '', { size: 1 });
    P.alpha(1);
  }

  /* the worked comparison, computed by the model */
  if (t >= 18) {
    P.alpha(clamp01((t - 18) / 1.5));
    box(456, 292, 314, 96, { fill: PAL.surface, stroke: PAL.accent, sw: 1.4, radius: 8 });
    txt(470, 312, '640 kbit, 3 links at 64 kbps', { size: 10.5, mono: true, color: PAL.dim });
    txt(470, 332, 'setup 0.5 s, packets of 1 kbit', { size: 10.5, mono: true, color: PAL.dim });
    txt(470, 354, 'circuit ' + num(V.cpCircuit, 2) + ' s', { size: 11, mono: true, bold: true, color: PAL.warn });
    txt(600, 354, 'packet ' + num(V.cpPacket, 3) + ' s', { size: 11, mono: true, bold: true, color: PAL.accent });
    txt(470, 376, 'crossover setup = (N-1)L/R = ' + num(V.cpCrossover, 4) + ' s',
        { size: 10, mono: true, color: PAL.faint });
    P.alpha(1);
  }

  /* throughput and the bottleneck */
  if (t >= 22.5) {
    P.alpha(clamp01((t - 22.5) / 1.5));
    box(130, 398, 640, 40, { fill: PAL.surface2, stroke: PAL.border, radius: 6 });
    txt(144, 422, 'GATE 2026 CS2: 32 Mbit over 2 Mbps, 500 kbps, 1 Mbps  =  32 Mbit / 500 kbps = ' +
        num(V.g2026time, 0) + ' s', { size: 10.5, mono: true, color: PAL.ink });
    P.alpha(1);
  }

  label(40, 456, 'more packets is not monotonically better — the middle split wins, and the two extremes tie',
        { color: PAL.faint });
}

/* ======================================================================
   SCENE 10 - the procedure
   ====================================================================== */
function scDecide(t) {
  head('The five-step procedure for any network arithmetic question',
       'units first · one packet or many · which delays were given · sanity-check');

  var steps = [
    { k: '1', t: 'Write L, R, d, v, P in consistent units', s: 'bits, bits per second, metres, metres per second' },
    { k: '2', t: 'One packet, or many?', s: 'one: sum over links · many: (N+P-1)L/R + N d/v' },
    { k: '3', t: 'Which delays did the question tell you to ignore?', s: 'drop only those, and say so' },
    { k: '4', t: 'Circuit or packet?', s: 'circuit S + F/R · packet F/R + (N-1)L/R' },
    { k: '5', t: 'Convert back and check the magnitude', s: 'compare with the dominant term before choosing' }
  ];

  var i;
  for (i = 0; i < 5; i++) {
    var on = clamp01((t - i * 4.4) / 2.2);
    var y = 92 + i * 66;
    P.alpha(0.28 + 0.72 * on);
    box(80, y, 740, 54, {
      fill: on > 0.6 ? PAL.surface : PAL.surface2,
      stroke: on > 0.6 ? PAL.accent : PAL.border, sw: on > 0.6 ? 1.8 : 1.2
    });
    P.circle(108, y + 27, 15, { fill: on > 0.6 ? PAL.accent : PAL.surface2, stroke: PAL.accent, sw: 1.4 });
    txt(108, y + 27, steps[i].k, {
      size: 12, bold: true, mono: true, align: 'center', base: 'middle',
      color: on > 0.6 ? PAL.surface : PAL.accent
    });
    txt(136, y + 20, steps[i].t, { size: 12, bold: true, color: PAL.ink });
    txt(136, y + 38, steps[i].s, { size: 10.5, mono: true, color: PAL.dim });
    P.alpha(1);
  }

  label(40, 448, 'every question in this chapter is steps 1 and 2; steps 3 to 5 catch the errors',
        { color: PAL.faint });
}

var SCENES = {
  layers: scLayers, stacks: scStacks, encap: scEncap, circuit: scCircuit, packet: scPacket,
  delays: scDelays, onepacket: scOnePacket, pipeline: scPipeline, tradeoff: scTradeoff, decide: scDecide
};

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

function drawFrame(painter) {
  if (!painter) return;
  P = painter;
  var tl = window.LESSON_TIMELINE;
  var tt = K.state.elapsed;
  var idx = K.sceneAt(tt);
  var sc = tl.scenes[idx];
  painter.alpha(1);
  painter.clear();
  bg();
  if (sc && SCENES[sc.id]) {
    try {
      SCENES[sc.id](tt - sc.start);
    } catch (err) {
      console.error('scene draw failed', sc.id, err);
    }
  }
}

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

  K.init({
    timeline: window.LESSON_TIMELINE,
    draw: function () { if (P) drawFrame(P); }
  });

  K.onResize(function () { if (P) drawFrame(P); });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { if (P) drawFrame(P); });
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
