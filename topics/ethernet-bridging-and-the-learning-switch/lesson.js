/* ==========================================================================
   ethernet-bridging-and-the-learning-switch — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no bridging arithmetic of its own:
   every figure on the canvas came from a simulation or a shortest-path run
   here, and was checked against the rule it is supposed to satisfy (one
   designated port per segment, blocked ports equal to E-(B-1), the forwarding
   graph a tree, the doubling of a broadcast storm, and the domain counts of
   five topologies).
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

  var V = {};
  var CHECKS = [];
  function chk(name, pass, detail) {
    CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
  }

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

/* ---------- 1. one learning switch, eight frames ----------
   A four-port switch: A on port 1, B on port 2, C on port 3 (which never
   sends), and port 4 is the uplink to a second switch that holds D and E.
   The trace is fixed, so the same frame sequence produces the same table on
   every replay. */

V.PORTS = [1, 2, 3, 4];

V.TRACE = [
  { n: 1, src: 'A', dst: 'B', inPort: 1 },
  { n: 2, src: 'B', dst: 'A', inPort: 2 },
  { n: 3, src: 'A', dst: 'B', inPort: 1 },
  { n: 4, src: 'D', dst: 'A', inPort: 4 },
  { n: 5, src: 'A', dst: 'D', inPort: 1 },
  { n: 6, src: 'D', dst: 'E', inPort: 4 },
  { n: 7, src: 'E', dst: 'D', inPort: 4 },
  { n: 8, src: 'A', dst: 'B', inPort: 1 }
];

function copyTable(t) {
  var o = {};
  for (var k in t) { if (Object.prototype.hasOwnProperty.call(t, k)) o[k] = t[k]; }
  return o;
}

/* The three actions, applied to one frame, in the order the standard applies
   them: learn the source first, then decide with the table as it was before
   this frame's own learning changed nothing about the destination. */
function stepFrame(table, frame, ports) {
  var before = copyTable(table);
  table[frame.src] = frame.inPort;                 /* learn: source + ingress */
  var dstPort = before[frame.dst];
  var action, outs;
  if (dstPort === undefined) {
    action = 'flood';
    outs = ports.filter(function (p) { return p !== frame.inPort; });
  } else if (dstPort === frame.inPort) {
    action = 'filter';
    outs = [];
  } else {
    action = 'forward';
    outs = [dstPort];
  }
  return { frame: frame, before: before, action: action, outs: outs, copies: outs.length,
           after: copyTable(table) };
}

V.TRACE_RUN = (function () {
  var table = {};
  return V.TRACE.map(function (f) { return stepFrame(table, f, V.PORTS); });
})();

V.TRACE_STATS = (function () {
  var s = { floods: 0, forwards: 0, filters: 0, copies: 0, floodedCopies: 0 };
  V.TRACE_RUN.forEach(function (r) {
    if (r.action === 'flood') { s.floods++; s.floodedCopies += r.copies; }
    else if (r.action === 'forward') { s.forwards++; }
    else { s.filters++; }
    s.copies += r.copies;
  });
  s.table = copyTable(V.TRACE_RUN[V.TRACE_RUN.length - 1].after);
  s.entries = Object.keys(s.table).length;
  s.distinctSources = V.TRACE.map(function (f) { return f.src; })
    .filter(function (v, i, a) { return a.indexOf(v) === i; }).length;
  return s;
})();

/* ---------- 2. the same frame across two switches ----------
   S1: 4 ports (1 A, 2 B, 3 C, 4 uplink). S2: 3 ports (1 uplink, 2 D, 3 E).
   One unknown unicast from A to D: S1 floods three copies, S2 floods two. */

V.TWO_SWITCH = (function () {
  var s1 = { id: 'S1', ports: [1, 2, 3, 4] };
  var s2 = { id: 'S2', ports: [1, 2, 3] };
  var t1 = {}, t2 = {};
  /* the request: A to D, nobody has spoken yet */
  var r1 = stepFrame(t1, { src: 'A', dst: 'D', inPort: 1 }, s1.ports);
  var r2 = stepFrame(t2, { src: 'A', dst: 'D', inPort: 1 }, s2.ports);
  /* the reply: D to A. Both switches now know A, on the port it came from. */
  var r1b = stepFrame(t1, { src: 'D', dst: 'A', inPort: 4 }, s1.ports);
  var r2b = stepFrame(t2, { src: 'D', dst: 'A', inPort: 2 }, s2.ports);
  return {
    firstCopies: r1.copies + r2.copies,
    firstSplit: [r1.copies, r2.copies],
    replyCopies: r1b.copies + r2b.copies,
    replySplit: [r1b.copies, r2b.copies],
    s1Action: r1.action, s2Action: r2.action,
    s1Action2: r1b.action, s2Action2: r2b.action
  };
})();

/* ---------- 3. the loop: a broadcast storm ----------
   Three bridges in a triangle, two ports each. A broadcast frame is copied
   once into the ring; every bridge that receives a copy floods it out of its
   other port. Copies in flight therefore double every round, and no frame
   ever dies. Simulated link by link, not assumed. */

V.STORM = (function () {
  /* four bridges, fully meshed: every bridge has a trunk to each of the other
     three, plus one host port. A copy arriving on one port is flooded out of
     the other three: one of those goes to a host and stops, two keep going, so
     the frames per round double from the second round on and nothing ever
     stops. */
  var NAMES = ['B1', 'B2', 'B3', 'B4'];
  var bridges = {};
  NAMES.forEach(function (b) {
    bridges[b] = NAMES.filter(function (x) { return x !== b; }).concat(['host']);
  });
  var rounds = [{ round: 0, copies: 0, trunk: 0, host: 0, total: 0 }];
  var current = [{ bridge: 'B1', ingress: 'host' }];
  var total = 0;
  for (var r = 1; r <= 20; r++) {
    var next = [];
    current.forEach(function (c) {
      bridges[c.bridge].forEach(function (p) {
        if (p === c.ingress) return;
        next.push({ bridge: p === 'host' ? c.bridge : p, ingress: c.bridge, host: p === 'host' });
      });
    });
    var hostCopies = next.filter(function (c) { return c.host; }).length;
    total += next.length;
    rounds.push({ round: r, copies: next.length, trunk: next.length - hostCopies,
                  host: hostCopies, total: total });
    /* a copy delivered to a host stops there; trunk copies keep circulating */
    current = next.filter(function (c) { return !c.host; });
  }
  return {
    rounds: rounds,
    at: function (r) { return rounds[Math.min(r, rounds.length - 1)]; },
    perRound10: rounds[10].total,
    perRound20: rounds[20].total,
    tripling: rounds.slice(1).every(function (x) { return x.copies === Math.pow(3, x.round); }),
    trunkDoubling: rounds.slice(1).every(function (x) {
      return x.trunk === 3 * Math.pow(2, x.round - 1);
    }),
    forever: rounds[20].copies === Math.pow(3, 20)
  };
})();

/* ---------- 4. collision domains and broadcast domains, counted ----------
   A collision domain is one shared medium: a hub repeats every bit onto all
   its ports, so a hub's ports and every link touching them are one domain.
   A switch port is a domain of its own. A broadcast domain is everything a
   broadcast frame reaches, so a router ends one and a switch does not.
   Both are counted with union-find over the ports and the devices. */

function UF(n) {
  var p = [], r = [];
  for (var i = 0; i < n; i++) { p.push(i); r.push(0); }
  function find(x) { while (p[x] !== x) { p[x] = p[p[x]]; x = p[x]; } return x; }
  function union(a, b) {
    a = find(a); b = find(b);
    if (a === b) return false;
    if (r[a] < r[b]) { p[a] = b; } else if (r[a] > r[b]) { p[b] = a; }
    else { p[b] = a; r[a]++; }
    return true;
  }
  function count() {
    var s = {};
    for (var i = 0; i < n; i++) s[find(i)] = true;
    return Object.keys(s).length;
  }
  return { find: find, union: union, count: count };
}

function countDomains(topo) {
  /* one node per (device, port) */
  var idx = {}, nodes = [];
  topo.devices.forEach(function (d) {
    for (var p = 1; p <= d.ports; p++) { idx[d.id + ':' + p] = nodes.length; nodes.push(d.id + ':' + p); }
  });
  var uf = UF(nodes.length);
  /* a hub is one medium: all its ports are the same collision domain */
  topo.devices.forEach(function (d) {
    if (d.type !== 'hub') return;
    for (var p = 2; p <= d.ports; p++) uf.union(idx[d.id + ':1'], idx[d.id + ':' + p]);
  });
  /* a link is one medium: it joins its two ends */
  topo.links.forEach(function (l) { uf.union(idx[l.a], idx[l.b]); });
  var collision = uf.count();

  /* broadcast domains: delete every router, then count the pieces that still
     hold a switch, a hub or a host. A router ends the domain, so it is not a
     domain of its own. */
  var devIdx = {}, devs = [];
  topo.devices.forEach(function (d) {
    if (d.type === 'router') return;
    devIdx[d.id] = devs.length; devs.push(d.id);
  });
  var bf = UF(devs.length);
  var typeOf = {};
  topo.devices.forEach(function (d) { typeOf[d.id] = d.type; });
  topo.links.forEach(function (l) {
    var da = l.a.split(':')[0], db = l.b.split(':')[0];
    if (typeOf[da] === 'router' || typeOf[db] === 'router') return;
    bf.union(devIdx[da], devIdx[db]);
  });
  var broots = {};
  devs.forEach(function (d) { broots[bf.find(devIdx[d])] = true; });
  return { collision: collision, broadcast: Object.keys(broots).length, ports: nodes.length };
}

V.TOPOS = (function () {
  var hub4 = {
    name: 'one hub, four PCs',
    devices: [{ id: 'H', type: 'hub', ports: 4 }, { id: 'P1', type: 'host', ports: 1 },
              { id: 'P2', type: 'host', ports: 1 }, { id: 'P3', type: 'host', ports: 1 },
              { id: 'P4', type: 'host', ports: 1 }],
    links: [{ a: 'H:1', b: 'P1:1' }, { a: 'H:2', b: 'P2:1' },
            { a: 'H:3', b: 'P3:1' }, { a: 'H:4', b: 'P4:1' }]
  };
  var sw4 = {
    name: 'one switch, four PCs',
    devices: [{ id: 'S', type: 'switch', ports: 4 }, { id: 'P1', type: 'host', ports: 1 },
              { id: 'P2', type: 'host', ports: 1 }, { id: 'P3', type: 'host', ports: 1 },
              { id: 'P4', type: 'host', ports: 1 }],
    links: [{ a: 'S:1', b: 'P1:1' }, { a: 'S:2', b: 'P2:1' },
            { a: 'S:3', b: 'P3:1' }, { a: 'S:4', b: 'P4:1' }]
  };
  var swsw = {
    name: 'two switches joined, three PCs each',
    devices: [{ id: 'S1', type: 'switch', ports: 4 }, { id: 'S2', type: 'switch', ports: 4 },
              { id: 'P1', type: 'host', ports: 1 }, { id: 'P2', type: 'host', ports: 1 },
              { id: 'P3', type: 'host', ports: 1 }, { id: 'P4', type: 'host', ports: 1 },
              { id: 'P5', type: 'host', ports: 1 }, { id: 'P6', type: 'host', ports: 1 }],
    links: [{ a: 'S1:1', b: 'P1:1' }, { a: 'S1:2', b: 'P2:1' }, { a: 'S1:3', b: 'P3:1' },
            { a: 'S1:4', b: 'S2:4' },
            { a: 'S2:1', b: 'P4:1' }, { a: 'S2:2', b: 'P5:1' }, { a: 'S2:3', b: 'P6:1' }]
  };
  var swrsw = {
    name: 'two switches joined by a router',
    devices: [{ id: 'S1', type: 'switch', ports: 4 }, { id: 'S2', type: 'switch', ports: 4 },
              { id: 'R', type: 'router', ports: 2 },
              { id: 'P1', type: 'host', ports: 1 }, { id: 'P2', type: 'host', ports: 1 },
              { id: 'P3', type: 'host', ports: 1 }, { id: 'P4', type: 'host', ports: 1 },
              { id: 'P5', type: 'host', ports: 1 }, { id: 'P6', type: 'host', ports: 1 }],
    links: [{ a: 'S1:1', b: 'P1:1' }, { a: 'S1:2', b: 'P2:1' }, { a: 'S1:3', b: 'P3:1' },
            { a: 'S1:4', b: 'R:1' }, { a: 'R:2', b: 'S2:4' },
            { a: 'S2:1', b: 'P4:1' }, { a: 'S2:2', b: 'P5:1' }, { a: 'S2:3', b: 'P6:1' }]
  };
  var hubsw = {
    name: 'a hub of three PCs on one switch port',
    devices: [{ id: 'S', type: 'switch', ports: 3 }, { id: 'H', type: 'hub', ports: 4 },
              { id: 'P1', type: 'host', ports: 1 }, { id: 'P2', type: 'host', ports: 1 },
              { id: 'P3', type: 'host', ports: 1 }, { id: 'P4', type: 'host', ports: 1 },
              { id: 'P5', type: 'host', ports: 1 }],
    links: [{ a: 'S:1', b: 'H:4' }, { a: 'H:1', b: 'P1:1' }, { a: 'H:2', b: 'P2:1' },
            { a: 'H:3', b: 'P3:1' }, { a: 'S:2', b: 'P4:1' }, { a: 'S:3', b: 'P5:1' }]
  };
  var all = [hub4, sw4, swsw, swrsw, hubsw];
  return all.map(function (t) {
    var c = countDomains(t);
    return { name: t.name, collision: c.collision, broadcast: c.broadcast, ports: c.ports };
  });
})();

/* ---------- 5. spanning tree: root, root ports, designated ports ----------
   Four bridges, all at the default priority 32768, so the bridge ID is decided
   by the MAC. Five links, so the loop count is E - (B - 1) = 2.
   Link costs are the IEEE 802.1D short table: 100 for 10 Mb/s, 19 for 100 Mb/s,
   4 for 1 Gb/s, 2 for 10 Gb/s. */

V.STP = (function () {
  var bridges = [
    { id: 'B1', prio: 32768, mac: '0000.0000.0001' },
    { id: 'B2', prio: 32768, mac: '0000.0000.0002' },
    { id: 'B3', prio: 32768, mac: '0000.0000.0003' },
    { id: 'B4', prio: 32768, mac: '0000.0000.0004' }
  ];
  var links = [
    { a: 'B1', b: 'B2', cost: 19, speed: '100 Mb/s' },
    { a: 'B2', b: 'B3', cost: 19, speed: '100 Mb/s' },
    { a: 'B3', b: 'B4', cost: 19, speed: '100 Mb/s' },
    { a: 'B4', b: 'B1', cost: 19, speed: '100 Mb/s' },
    { a: 'B2', b: 'B4', cost: 100, speed: '10 Mb/s' }
  ];
  /* root: lowest bridge ID = priority, then MAC */
  var byId = bridges.slice().sort(function (x, y) {
    return x.prio !== y.prio ? x.prio - y.prio : (x.mac < y.mac ? -1 : 1);
  });
  var root = byId[0].id;

  /* root path cost, with the standard tie-break: equal cost goes to the
     lower neighbouring bridge ID */
  var best = {};
  bridges.forEach(function (b) { best[b.id] = { cost: Infinity, via: null }; });
  best[root] = { cost: 0, via: null };
  for (var pass = 0; pass < bridges.length; pass++) {
    links.forEach(function (l) {
      [[l.a, l.b], [l.b, l.a]].forEach(function (pair) {
        var from = pair[0], to = pair[1];
        if (best[from].cost === Infinity) return;
        var c = best[from].cost + l.cost;
        var cur = best[to];
        if (c < cur.cost || (c === cur.cost && from < (cur.via || 'zzz'))) {
          best[to] = { cost: c, via: from };
        }
      });
    });
  }

  /* root ports: the port towards the neighbour the best path came from */
  var rootPort = {};
  bridges.forEach(function (b) {
    if (b.id !== root && best[b.id].via) rootPort[b.id] = best[b.id].via;
  });

  /* designated port per link: the end with the lower (root path cost, bridge ID) */
  var segs = links.map(function (l) {
    var ca = best[l.a].cost, cb = best[l.b].cost;
    var win;
    if (ca !== cb) win = ca < cb ? l.a : l.b;
    else win = l.a < l.b ? l.a : l.b;
    return { a: l.a, b: l.b, cost: l.cost, speed: l.speed, designated: win };
  });

  /* every port state: forwarding when it is a root port or a designated port */
  var blocked = [];
  segs.forEach(function (s) {
    var loser = s.designated === s.a ? s.b : s.a;
    var isRootPort = rootPort[loser] === s.designated;
    if (!isRootPort) blocked.push({ bridge: loser, towards: s.designated, link: s.a + '-' + s.b });
  });

  /* the forwarding graph: a link is in the tree when neither end blocks it */
  var inTree = segs.filter(function (s) {
    var loser = s.designated === s.a ? s.b : s.a;
    return !blocked.some(function (b) { return b.bridge === loser && b.link === s.a + '-' + s.b; });
  });

  /* verify it is a tree: B-1 edges, connected, acyclic */
  var uf = UF(bridges.length);
  var bi = {}; bridges.forEach(function (b, i) { bi[b.id] = i; });
  var acyclic = inTree.every(function (s) { return uf.union(bi[s.a], bi[s.b]); });
  var connected = uf.count() === 1;

  return {
    bridges: bridges, links: links, segs: segs, root: root,
    order: byId.map(function (b) { return b.id; }),
    costs: best, rootPort: rootPort, blocked: blocked, inTree: inTree,
    blockedCount: blocked.length,
    identity: links.length - (bridges.length - 1),
    treeEdges: inTree.length, acyclic: acyclic, connected: connected,
    totalPorts: links.length * 2
  };
})();

/* ---------- 6. the timers, and the two convergence figures ---------- */
V.TIMERS = (function () {
  var t = { hello: 2, maxAge: 20, fwdDelay: 15, ageing: 300 };
  t.listening = t.fwdDelay;
  t.learning = t.fwdDelay;
  t.blockingToForwarding = t.listening + t.learning;      /* 30 s */
  t.worstCase = t.maxAge + t.listening + t.learning;      /* 50 s */
  t.directFailure = t.listening + t.learning;             /* 30 s */
  t.bpdusPerMaxAge = t.maxAge / t.hello;                  /* 10 */
  t.rootBpdusPerHello = 4;                                /* one per port */
  return t;
})();

/* ---------- 7. store-and-forward, fragment-free, cut-through ----------
   The same 1514-octet Ethernet frame at 100 Mb/s. Store-and-forward waits for
   the whole frame; fragment-free for 64 octets; cut-through for the 6-octet
   destination address only. */

V.MODES = (function () {
  var frameOctets = 1514, payload = 1500, header = 14;
  var bits = frameOctets * 8;
  var rate = 100e6;                                    /* 100 Mb/s */
  var us = function (b) { return (b / rate) * 1e6; };
  return {
    frameOctets: frameOctets, payload: payload, header: header, bits: bits,
    store: us(bits),
    fragment: us(64 * 8),
    cut: us(6 * 8),
    at1G: { store: us(bits) / 10, fragment: us(64 * 8) / 10, cut: us(6 * 8) / 10 },
    ratioStoreCut: us(bits) / us(6 * 8)
  };
})();

/* ---------- 8. one line to keep ---------- */
V.ONELINE = 'A bridge learns the source, decides with the table, floods what it does not know, ' +
            'and needs a spanning tree only because a loop has no end.';

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

(function runChecks() {
  var s = V.TRACE_STATS;

  chk('the first frame floods, because the table is empty',
      V.TRACE_RUN[0].action === 'flood' && V.TRACE_RUN[0].copies === 3,
      V.TRACE_RUN[0].action + ' ' + V.TRACE_RUN[0].copies);

  chk('a flooded frame leaves every port except the one it arrived on',
      V.TRACE_RUN.every(function (r) {
        return r.action !== 'flood' || r.copies === V.PORTS.length - 1;
      }));

  chk('a known unicast is forwarded to exactly one port',
      V.TRACE_RUN.filter(function (r) { return r.action === 'forward'; })
        .every(function (r) { return r.copies === 1 && r.outs[0] === r.before[r.frame.dst]; }));

  chk('a destination learned on the ingress port is filtered, not forwarded',
      V.TRACE_RUN.some(function (r) {
        return r.action === 'filter' && r.before[r.frame.dst] === r.frame.inPort && r.copies === 0;
      }));

  chk('eight frames give two floods, five forwards and one filter',
      s.floods === 2 && s.forwards === 5 && s.filters === 1,
      s.floods + '/' + s.forwards + '/' + s.filters);

  chk('the copies add up: 6 flooded + 5 forwarded + 0 filtered = 11',
      s.copies === 11 && s.floodedCopies + s.forwards === 11,
      s.copies + ' ' + s.floodedCopies);

  chk('the table holds one entry per distinct source, and never one per destination',
      s.entries === s.distinctSources && s.entries === 4,
      s.entries + ' vs ' + s.distinctSources);

  chk('a station that never sends is never learned (C is absent)',
      s.table.C === undefined);

  chk('across two switches one unknown frame costs 3 + 2 = 5 copies',
      V.TWO_SWITCH.firstCopies === 5 && V.TWO_SWITCH.firstSplit[0] === 3 &&
      V.TWO_SWITCH.firstSplit[1] === 2,
      V.TWO_SWITCH.firstCopies);

  chk('the reply D to A costs 2 copies, because both switches now know A',
      V.TWO_SWITCH.replyCopies === 2 && V.TWO_SWITCH.replySplit[0] === 1 &&
      V.TWO_SWITCH.replySplit[1] === 1, V.TWO_SWITCH.replyCopies);

  chk('a copy arriving is flooded three ways, so round two costs 3 x 3 = 9 frames',
      V.STORM.rounds[1].copies === 3 && V.STORM.rounds[2].copies === 9,
      V.STORM.rounds[1].copies + ' then ' + V.STORM.rounds[2].copies);

  chk('the copies still on trunks double every round: 3, 6, 12, 24',
      V.STORM.trunkDoubling && V.STORM.rounds[4].trunk === 24, V.STORM.rounds[4].trunk);

  chk('nothing in the storm ever dies: 10 rounds cost 4602 frames and it is still growing',
      V.STORM.perRound10 === 4602 && V.STORM.rounds[10].copies === 2304, V.STORM.perRound10);

  chk('the frames per round double from round two on: 9, 18, 36, 72',
      V.STORM.rounds[3].copies === 18 && V.STORM.rounds[5].copies === 72, V.STORM.rounds[5].copies);

  chk('a hub is one collision domain',
      V.TOPOS[0].collision === 1 && V.TOPOS[0].broadcast === 1,
      V.TOPOS[0].collision + '/' + V.TOPOS[0].broadcast);

  chk('a switch port is its own collision domain',
      V.TOPOS[1].collision === 4 && V.TOPOS[1].broadcast === 1,
      V.TOPOS[1].collision + '/' + V.TOPOS[1].broadcast);

  chk('joining two switches gives 3 + 3 + 1 = 7 collision domains and one broadcast domain',
      V.TOPOS[2].collision === 7 && V.TOPOS[2].broadcast === 1,
      V.TOPOS[2].collision + '/' + V.TOPOS[2].broadcast);

  chk('a router between the same two switches makes two broadcast domains, not three',
      V.TOPOS[3].broadcast === 2 && V.TOPOS[3].broadcast === V.TOPOS[2].broadcast + 1,
      V.TOPOS[3].broadcast);

  chk('a hub of three PCs on one switch port costs one collision domain, not three',
      V.TOPOS[4].collision === 3 && V.TOPOS[4].broadcast === 1,
      V.TOPOS[4].collision);

  chk('the root is the lowest bridge ID, which at equal priority is the lowest MAC',
      V.STP.root === 'B1' && V.STP.order[0] === 'B1', V.STP.root);

  chk('B3 ties at cost 38 by two routes and takes the lower neighbour, B2',
      V.STP.costs.B3.cost === 38 && V.STP.costs.B3.via === 'B2',
      V.STP.costs.B3.cost + ' via ' + V.STP.costs.B3.via);

  chk('every segment has exactly one designated port',
      V.STP.segs.every(function (s) { return s.designated === s.a || s.designated === s.b; }) &&
      V.STP.segs.length === V.STP.links.length);

  chk('blocked ports equal E - (B - 1) = 5 - 3 = 2',
      V.STP.blockedCount === V.STP.identity && V.STP.blockedCount === 2,
      V.STP.blockedCount + ' vs ' + V.STP.identity);

  chk('the forwarding links form a tree: B - 1 edges, connected, acyclic',
      V.STP.treeEdges === V.STP.bridges.length - 1 && V.STP.connected && V.STP.acyclic,
      V.STP.treeEdges + ' edges');

  chk('the two ends of every link are accounted for: 10 ports, 2 of them blocked',
      V.STP.totalPorts === 10 && V.STP.blockedCount === 2);

  chk('a blocking port reaches forwarding in 15 + 15 = 30 seconds',
      V.TIMERS.blockingToForwarding === 30);

  chk('worst-case convergence is 20 + 15 + 15 = 50 seconds',
      V.TIMERS.worstCase === 50 && V.TIMERS.worstCase - V.TIMERS.maxAge === 30);

  chk('the 1514-octet frame is 12112 bits, sent in 121.12 microseconds at 100 Mb/s',
      V.MODES.bits === 12112 && Math.abs(V.MODES.store - 121.12) < 1e-6,
      V.MODES.store);

  chk('cut-through reads 6 octets and starts forwarding after 0.48 microseconds',
      Math.abs(V.MODES.cut - 0.48) < 1e-9, V.MODES.cut);

  chk('the store-and-forward wait is about 252 times the cut-through wait',
      Math.round(V.MODES.ratioStoreCut) === 252, V.MODES.ratioStoreCut);
})();

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function txt(x, y, s, o) { P.text(x, y, s, o || {}); }

function head(title, sub) {
  txt(24, 16, title, { size: 17, bold: true, color: INK });
  if (sub) txt(24, 38, sub, { size: 12.5, color: DIM });
}

function takeaway(y, s) {
  P.rect(24, y - 15, 852, 30, { fill: ACCDIM, radius: 6 });
  txt(36, y, s, { size: 12.5, bold: true, color: ACC, base: 'middle' });
}

function box(x, y, w, h, label, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || SURF2, stroke: o.stroke || BORDER, radius: 6, sw: o.sw || 1.4 });
  if (label) txt(x + w / 2, y + h / 2, label, { size: o.size || 12.5, color: o.color || INK,
    align: 'center', base: 'middle', bold: !!o.bold, mono: !!o.mono });
}

function chip(x, y, s, colour, dim) {
  P.rect(x, y - 9, Math.max(46, s.length * 6.6 + 14), 18, { fill: dim || SURF2, radius: 9 });
  txt(x + Math.max(46, s.length * 6.6 + 14) / 2, y, s, { size: 10.5, color: colour, align: 'center',
    base: 'middle', bold: true });
}

/* ---------- scene 1: what a bridge does ---------- */
function drawBridge(t, sc) {
  var p = K.sceneProgress(t);
  head('A bridge joins two segments and looks at one field',
       'The destination MAC address. Nothing else in the frame is read or changed.');
  box(40, 110, 250, 150, '', { fill: SURF2 });
  txt(165, 132, 'segment 1', { size: 12, color: DIM, align: 'center' });
  box(70, 150, 70, 40, 'A', { bold: true });
  box(190, 150, 70, 40, 'B', { bold: true });
  box(380, 130, 140, 110, '', { fill: ACCDIM, stroke: ACC });
  txt(450, 170, 'bridge', { size: 14, bold: true, color: ACC, align: 'center' });
  txt(450, 192, 'or switch', { size: 11, color: ACC, align: 'center' });
  box(610, 110, 250, 150, '', { fill: SURF2 });
  txt(735, 132, 'segment 2', { size: 12, color: DIM, align: 'center' });
  box(640, 150, 70, 40, 'C', { bold: true });
  box(760, 150, 70, 40, 'D', { bold: true });

  P.line(290, 185, 380, 185, { stroke: BORDER, sw: 2 });
  P.line(520, 185, 610, 185, { stroke: BORDER, sw: 2 });

  if (p > 0.18) {
    P.arrow(105, 165, 640, 165, { stroke: ACC, sw: 2, head: 9 });
    txt(372, 152, 'frame A \u2192 D', { size: 11.5, color: ACC, align: 'center', bold: true });
  }
  if (p > 0.42) {
    txt(450, 262, 'the bridge reads dst = D, knows D is on segment 2, and forwards it',
        { size: 12, color: DIM, align: 'center' });
  }
  if (p > 0.58) {
    box(40, 288, 380, 58, '', { fill: SURF, stroke: BORDER });
    txt(52, 300, 'bridge: forwards by MAC address, changes nothing', { size: 11.5, color: INK });
    txt(52, 322, 'router: rewrites the frame, forwards by IP address', { size: 11.5, color: DIM });
  }
  if (p > 0.72) {
    box(470, 288, 390, 58, '', { fill: SURF, stroke: BORDER });
    txt(482, 300, 'collision domains: 2 (one per segment)', { size: 11.5, color: VAL });
    txt(482, 322, 'broadcast domains: 1 (the bridge does not split it)', { size: 11.5, color: WARN });
  }
  takeaway(438, 'The bridge is transparent: it filters by destination, and it never edits the frame.');
}

/* ---------- scene 2: the algorithm ---------- */
function drawLearn(t, sc) {
  var p = K.sceneProgress(t);
  head('Three actions, decided in this order',
       'Learn the source, look up the destination, then flood, forward or filter.');

  var steps = [
    ['1', 'learn', 'source MAC \u2192 the port it arrived on'],
    ['2', 'look up', 'the destination MAC in the table'],
    ['3', 'act', 'not there: flood  \u00b7  same port: filter  \u00b7  other: forward']
  ];
  steps.forEach(function (s, i) {
    var show = p > 0.12 + i * 0.16;
    if (!show) return;
    var y = 78 + i * 52;
    P.circle(52, y + 8, 12, { fill: ACCDIM, stroke: ACC, sw: 1.4 });
    txt(52, y + 8, s[0], { size: 12, color: ACC, align: 'center', base: 'middle', bold: true });
    txt(74, y, s[1], { size: 13, bold: true, color: INK });
    txt(74, y + 20, s[2], { size: 11.5, color: DIM });
  });

  box(560, 66, 310, 120, '', { fill: SURF, stroke: BORDER });
  txt(572, 82, 'forwarding table', { size: 11.5, color: DIM });
  txt(572, 104, 'MAC        port    age', { size: 11, color: FAINT, mono: true });
  var rows = [['A', '1'], ['B', '2'], ['D', '4'], ['E', '4']];
  rows.forEach(function (r, i) {
    if (p < 0.55 + i * 0.07) return;
    txt(572, 126 + i * 14, r[0] + '          ' + r[1] + '        ' + (12 + i * 3) + ' s',
        { size: 11, color: INK, mono: true });
  });

  if (p > 0.62) {
    box(560, 200, 310, 76, '', { fill: SURF2, stroke: BORDER });
    txt(572, 214, 'the table is built from SOURCE addresses', { size: 11.5, bold: true, color: ACC });
    txt(572, 234, 'an entry ages out after 300 s of silence', { size: 11.5, color: DIM });
    txt(572, 254, 'so a station that never sends is never learned', { size: 11.5, color: DIM });
  }
  if (p > 0.8) {
    txt(24, 300, 'A broadcast destination (ff:ff:ff:ff:ff:ff) is never in the table, so it is always flooded.',
        { size: 12, color: INK });
    txt(24, 322, 'That is why one broadcast domain is exactly one set of switch ports.',
        { size: 12, color: DIM });
  }
  takeaway(438, 'Learn the source, decide with the table, and flood only what the table cannot answer.');
}

/* ---------- scene 3: the trace ---------- */
function drawTrace(t, sc) {
  var p = K.sceneProgress(t);
  var n = Math.min(V.TRACE_RUN.length, Math.max(1, Math.floor(p * 8) + 1));
  var r = V.TRACE_RUN[n - 1];
  head('Eight frames through one switch, counted',
       'Frame ' + n + ' of 8. The table is shown as it was before this frame arrived.');

  box(24, 72, 250, 96, '', { fill: SURF2, stroke: BORDER });
  txt(38, 88, 'frame ' + r.frame.n, { size: 12, color: DIM });
  txt(38, 112, 'src ' + r.frame.src + '  \u2192  dst ' + r.frame.dst, { size: 14, bold: true, color: INK, mono: true });
  txt(38, 136, 'arrives on port ' + r.frame.inPort, { size: 12, color: DIM });

  box(300, 72, 250, 96, '', { fill: SURF, stroke: BORDER });
  txt(314, 88, 'table before', { size: 11.5, color: DIM });
  var keys = Object.keys(r.before);
  if (!keys.length) txt(314, 112, '(empty)', { size: 12, color: FAINT, mono: true });
  keys.forEach(function (k, i) {
    txt(314, 112 + i * 16, k + ' \u2192 port ' + r.before[k], { size: 12, color: INK, mono: true });
  });

  var colour = r.action === 'flood' ? WARN : r.action === 'forward' ? VAL : BAD;
  var dimc = r.action === 'flood' ? WARNDIM : r.action === 'forward' ? '#e3f2e8' : BADDIM;
  box(576, 72, 294, 96, '', { fill: dimc, stroke: colour });
  txt(590, 90, r.action.toUpperCase(), { size: 18, bold: true, color: colour });
  txt(590, 118, r.copies + (r.copies === 1 ? ' copy' : ' copies') +
      (r.copies ? ' out of port' + (r.copies > 1 ? 's ' : ' ') + r.outs.join(', ') : ''),
      { size: 12, color: INK });
  txt(590, 142, r.action === 'filter' ? 'destination is on the ingress port' : '', { size: 11, color: DIM });

  /* running totals */
  var done = V.TRACE_RUN.slice(0, n);
  var floods = done.filter(function (x) { return x.action === 'flood'; }).length;
  var fwds = done.filter(function (x) { return x.action === 'forward'; }).length;
  var filt = done.filter(function (x) { return x.action === 'filter'; }).length;
  var copies = done.reduce(function (a, x) { return a + x.copies; }, 0);
  txt(24, 196, 'so far', { size: 11.5, color: DIM });
  txt(24, 218, 'flooded ' + floods + '   forwarded ' + fwds + '   filtered ' + filt +
      '   copies on the wire ' + copies, { size: 13, color: INK, mono: true });

  /* bar of copies per frame */
  var bx = 24, by = 244;
  txt(bx, by - 8, 'copies per frame', { size: 11, color: DIM });
  V.TRACE_RUN.forEach(function (x, i) {
    var h = 8 + x.copies * 16;
    var c = i < n ? (x.action === 'flood' ? WARN : x.action === 'forward' ? VAL : BAD) : BORDER;
    P.rect(bx + i * 40, by + 64 - h, 24, h, { fill: c, radius: 2 });
    txt(bx + i * 40 + 12, by + 74, String(x.frame.n), { size: 10, color: FAINT, align: 'center' });
  });
  txt(bx + 8 * 40 + 20, by + 30, 'total 11', { size: 12, color: ACC, bold: true });

  if (p > 0.8) {
    txt(560, 214, 'Frame 7 is the filter case: E sends to D,', { size: 11.5, color: INK });
    txt(560, 232, 'and D was learned on the same port, so', { size: 11.5, color: INK });
    txt(560, 250, 'the switch drops it instead of sending', { size: 11.5, color: INK });
    txt(560, 268, 'it back out of that port.', { size: 11.5, color: INK });
  }
  takeaway(438, 'Two floods and five forwards in eight frames: the table earns its keep after one exchange.');
}

/* ---------- scene 4: domains ---------- */
function drawDomains(t, sc) {
  var p = K.sceneProgress(t);
  head('Collision domains and broadcast domains are two different counts',
       'A hub repeats; a switch stores and forwards per port; a router ends a broadcast domain.');

  var rows = [
    ['one hub, four PCs', V.TOPOS[0], 'every port shares one wire'],
    ['one switch, four PCs', V.TOPOS[1], 'each port is its own wire'],
    ['two switches joined', V.TOPOS[2], 'still one broadcast domain'],
    ['two switches, one router', V.TOPOS[3], 'the router splits the broadcast'],
    ['a hub on one switch port', V.TOPOS[4], 'the hub is one domain']
  ];
  rows.forEach(function (row, i) {
    if (p < 0.1 + i * 0.15) return;
    var y = 74 + i * 56;
    txt(24, y, row[0], { size: 12.5, bold: true, color: INK });
    txt(24, y + 18, row[2], { size: 11, color: DIM });
    chip(430, y + 8, row[1].collision + ' collision', INFO, SURF2);
    chip(560, y + 8, row[1].broadcast + ' broadcast', ACC, ACCDIM);
  });
  if (p > 0.85) {
    txt(24, 362, 'Count rule: a switch port is one collision domain; a hub is one for all its ports;',
        { size: 12, color: INK });
    txt(24, 382, 'a broadcast domain ends only at a router, or at a VLAN boundary inside a switch.',
        { size: 12, color: DIM });
  }
  takeaway(438, 'A switch multiplies collision domains and leaves the broadcast domain exactly as it was.');
}

/* ---------- scene 5: the loop ---------- */
function drawLoop(t, sc) {
  var p = K.sceneProgress(t);
  var r = Math.min(10, Math.floor(p * 7) + 1);
  var st = V.STORM.at(r);
  head('A loop has no end: the broadcast storm',
       'Four bridges, fully meshed. Every copy received is flooded three ways, and one of those reaches a host.');

  var cx = 250, cy = 214, rad = 86;
  var pos = {
    B1: [cx, cy - rad], B2: [cx + rad, cy], B3: [cx, cy + rad], B4: [cx - rad, cy]
  };
  ['B1', 'B2', 'B3', 'B4'].forEach(function (a) {
    ['B1', 'B2', 'B3', 'B4'].forEach(function (b) {
      if (a >= b) return;
      P.line(pos[a][0], pos[a][1], pos[b][0], pos[b][1], { stroke: BORDER, sw: 2 });
    });
  });
  ['B1', 'B2', 'B3', 'B4'].forEach(function (b) {
    P.circle(pos[b][0], pos[b][1], 24, { fill: SURF2, stroke: INK, sw: 1.6 });
    txt(pos[b][0], pos[b][1], b, { size: 12, bold: true, color: INK, align: 'center', base: 'middle' });
  });
  txt(cx, cy + 4, 'no bridge knows', { size: 11, color: FAINT, align: 'center' });
  txt(cx, cy + 20, 'the others exist', { size: 11, color: FAINT, align: 'center' });

  if (p > 0.1) {
    box(400, 74, 470, 62, '', { fill: WARNDIM, stroke: WARN });
    txt(414, 90, 'round ' + st.round, { size: 12, color: WARN, bold: true });
    txt(414, 112, 'frames ' + st.copies + '  \u00b7  host ' + st.host +
        '  \u00b7  trunk ' + st.trunk + '  \u00b7  total ' + st.total,
        { size: 11, color: INK, mono: true });
  }
  if (p > 0.35) {
    txt(400, 158, 'frames per round, log height', { size: 10.5, color: DIM });
    V.STORM.rounds.slice(1, 11).forEach(function (b, i) {
      var h = 6 + Math.log(b.copies) / Math.log(3) * 16;
      var on = b.round <= r;
      P.rect(404 + i * 45, 262 - h, 26, h, { fill: on ? WARN : BORDER, radius: 2 });
      txt(417 + i * 45, 276, String(b.round), { size: 9.5, color: FAINT, align: 'center' });
    });
  }
  if (p > 0.62) {
    box(400, 300, 470, 92, '', { fill: SURF, stroke: BORDER });
    txt(412, 316, 'Ten rounds cost ' + V.STORM.perRound10 + ' frames and the count is still rising.',
        { size: 11.5, color: INK });
    txt(412, 338, 'Each host receives the same broadcast again and again.', { size: 11.5, color: DIM });
    txt(412, 360, 'The source MAC is also seen on two ports in turn, so the', { size: 11.5, color: DIM });
    txt(412, 380, 'bridge keeps moving its entry: the table never settles.', { size: 11.5, color: DIM });
  }
  takeaway(438, 'No bridge is misbehaving: each one floods correctly, and the loop is why the frames never stop.');
}

/* ---------- scene 6: the root ---------- */
function drawRoot(t, sc) {
  var p = K.sceneProgress(t);
  head('Spanning tree, step one: elect a root',
       'Lowest bridge ID wins. The ID is a 2-octet priority and a 6-octet MAC, default priority 32768.');

  V.STP.bridges.forEach(function (b, i) {
    if (p < 0.1 + i * 0.12) return;
    var y = 76 + i * 46;
    var isRoot = b.id === V.STP.root;
    box(24, y, 330, 36, '', { fill: isRoot ? ACCDIM : SURF2, stroke: isRoot ? ACC : BORDER });
    txt(38, y + 18, b.id + '   ' + b.prio + ' + ' + b.mac,
        { size: 11.5, color: isRoot ? ACC : INK, mono: true, base: 'middle', bold: isRoot });
    if (isRoot) txt(300, y + 18, 'root', { size: 11, color: ACC, bold: true, align: 'right', base: 'middle' });
  });

  if (p > 0.5) {
    box(400, 76, 470, 150, '', { fill: SURF, stroke: BORDER });
    txt(414, 92, 'what the BPDU carries', { size: 12, bold: true, color: INK });
    [['root bridge ID', 'who the sender believes the root is'],
     ['root path cost', 'what it costs the sender to reach that root'],
     ['sender bridge ID', 'who sent this BPDU'],
     ['port ID', 'which of its ports sent it'],
     ['timers', 'hello 2 s, max age 20 s, forward delay 15 s']
    ].forEach(function (r, i) {
      txt(414, 116 + i * 20, r[0], { size: 11, color: ACC, mono: true });
      txt(540, 116 + i * 20, r[1], { size: 11, color: DIM });
    });
  }
  if (p > 0.72) {
    txt(400, 250, 'All four bridges are at 32768, so the MAC decides: B1.', { size: 12, color: INK });
    txt(400, 272, 'The root sends a configuration BPDU every 2 s out of every port.', { size: 12, color: DIM });
    txt(400, 294, 'Only the root originates; everyone else relays and adds cost.', { size: 12, color: DIM });
  }
  takeaway(438, 'The root is not chosen for being fastest: it is chosen for having the lowest ID.');
}

/* ---------- scene 7: the ports ---------- */
function drawPorts(t, sc) {
  var p = K.sceneProgress(t);
  head('Step two: one root port, one designated port per segment, the rest blocked',
       'Root path costs from B1. Two ports end up blocked, and E - (B - 1) = 2 says so.');

  var pos = { B1: [110, 120], B2: [330, 120], B3: [330, 280], B4: [110, 280] };
  function stateOf(a, b) {
    var seg = V.STP.segs.filter(function (s) {
      return (s.a === a && s.b === b) || (s.a === b && s.b === a);
    })[0];
    var loser = seg.designated === seg.a ? seg.b : seg.a;
    var blockedHere = V.STP.blocked.some(function (x) { return x.bridge === loser && x.link === seg.a + '-' + seg.b; });
    return { seg: seg, loser: loser, blocked: blockedHere };
  }

  V.STP.links.forEach(function (l) {
    var st = stateOf(l.a, l.b);
    var inTree = !st.blocked;
    P.line(pos[l.a][0], pos[l.a][1], pos[l.b][0], pos[l.b][1],
      { stroke: inTree ? VAL : BAD, sw: inTree ? 3 : 2, dash: inTree ? null : [7, 6] });
    var mx = (pos[l.a][0] + pos[l.b][0]) / 2, my = (pos[l.a][1] + pos[l.b][1]) / 2;
    txt(mx, my - 8, String(l.cost), { size: 10.5, color: inTree ? VAL : BAD, align: 'center', mono: true });
  });

  ['B1', 'B2', 'B3', 'B4'].forEach(function (b) {
    P.circle(pos[b][0], pos[b][1], 24, { fill: SURF2, stroke: INK, sw: 1.6 });
    txt(pos[b][0], pos[b][1] - 2, b, { size: 12, bold: true, color: INK, align: 'center', base: 'middle' });
    txt(pos[b][0], pos[b][1] + 12, 'cost ' + V.STP.costs[b].cost,
        { size: 9.5, color: DIM, align: 'center', base: 'middle' });
  });

  if (p > 0.45) {
    var bx = 500, by = 76;
    txt(bx, by, 'port states', { size: 12, bold: true, color: INK });
    var rows = [
      ['B2 port to B1', 'root', ACC],
      ['B4 port to B1', 'root', ACC],
      ['B3 port to B2', 'root', ACC],
      ['B1 ports (2)', 'designated', VAL],
      ['B4 port to B3', 'designated', VAL],
      ['B2 port to B4', 'designated', VAL],
      ['B3 port to B4', 'blocked', BAD],
      ['B4 port to B2', 'blocked', BAD]
    ];
    rows.forEach(function (r, i) {
      if (p < 0.5 + i * 0.045) return;
      txt(bx, by + 22 + i * 19, r[0], { size: 11, color: INK });
      txt(bx + 240, by + 22 + i * 19, r[1], { size: 11, color: r[2], bold: true });
    });
  }
  if (p > 0.8) {
    txt(500, 250, 'Two blocked ports, so two loops are cut.', { size: 11.5, color: INK });
    txt(500, 270, 'Forwarding links: ' + V.STP.treeEdges + ' = B - 1 = 3, connected and acyclic.',
        { size: 11.5, color: VAL });
    txt(500, 290, 'The B3 tie at cost 38 went to the lower neighbour, B2.', { size: 11.5, color: DIM });
  }
  takeaway(438, 'Blocking is not a fault: it is the only reason the frames stop circling.');
}

/* ---------- scene 8: the timers ---------- */
function drawTimers(t, sc) {
  var p = K.sceneProgress(t);
  head('From blocking to forwarding, in seconds',
       'A port listens, then learns, then forwards. Each wait is one forward delay.');

  var y = 120, x0 = 60;
  var segs = [
    ['blocking', 20, BORDER, SURF2, 'max age: no BPDU heard'],
    ['listening', 15, INFO, SURF2, 'no learning, no forwarding'],
    ['learning', 15, ACC, ACCDIM, 'learns, still not forwarding'],
    ['forwarding', 30, VAL, '#e3f2e8', 'frames pass']
  ];
  var total = 80;
  var x = x0;
  segs.forEach(function (s, i) {
    if (p < 0.1 + i * 0.14) return;
    var w = (s[1] / total) * 560;
    P.rect(x, y, w, 44, { fill: s[3], stroke: s[2], radius: 3 });
    txt(x + w / 2, y + 14, s[0], { size: 11.5, color: s[2], align: 'center', bold: true });
    txt(x + w / 2, y + 31, s[1] + ' s', { size: 11, color: INK, align: 'center', mono: true });
    x += w;
  });
  if (p > 0.5) {
    txt(60, 196, 'listening and learning each last one forward delay; only then do frames pass',
        { size: 11, color: DIM });
  }

  if (p > 0.62) {
    box(60, 200, 300, 90, '', { fill: SURF, stroke: BORDER });
    txt(72, 216, 'worst case after a change', { size: 11.5, color: DIM });
    txt(72, 242, '20 + 15 + 15 = 50 s', { size: 16, bold: true, color: INK, mono: true });
    txt(72, 266, 'a directly failed link skips max age: 30 s', { size: 11, color: DIM });

    box(380, 200, 300, 90, '', { fill: SURF, stroke: BORDER });
    txt(392, 216, 'the other two numbers', { size: 11.5, color: DIM });
    txt(392, 242, 'hello 2 s \u00b7 max age 20 s', { size: 13, bold: true, color: INK, mono: true });
    txt(392, 266, '20 / 2 = 10 BPDUs lost before a port gives up', { size: 11, color: DIM });
  }
  if (p > 0.82) {
    txt(60, 316, 'The ageing time of a MAC entry is separate: 300 s of silence, not 15.', { size: 12, color: INK });
    txt(60, 338, 'Changing a timer is a global decision: every bridge must agree, or the tree flaps.', { size: 12, color: DIM });
  }
  takeaway(438, 'Convergence is slow on purpose: the two forward delays are what stop a transient loop.');
}

/* ---------- scene 9: forwarding modes ---------- */
function drawModes(t, sc) {
  var p = K.sceneProgress(t);
  var M = V.MODES;
  head('Where the delay goes: three forwarding modes',
       'The same ' + M.frameOctets + '-octet frame (' + M.bits + ' bits) at 100 Mb/s.');

  var rows = [
    ['store and forward', 'waits for the whole frame', M.store, ACC],
    ['fragment free', 'waits for 64 octets', M.fragment, INFO],
    ['cut through', 'waits for 6 octets of address', M.cut, VAL]
  ];
  rows.forEach(function (r, i) {
    if (p < 0.12 + i * 0.16) return;
    var y = 88 + i * 76;
    txt(24, y, r[0], { size: 13, bold: true, color: r[3] });
    txt(24, y + 20, r[1], { size: 11.5, color: DIM });
    var w = Math.max(6, (Math.log(r[2]) / Math.log(200)) * 420);
    P.rect(300, y - 10, w, 22, { fill: r[3], radius: 3 });
    txt(300 + w + 10, y + 1, r[2].toFixed(2) + ' \u00b5s', { size: 11.5, color: INK, mono: true, base: 'middle' });
  });
  txt(300, 74, 'bar length is logarithmic, so all three fit', { size: 10, color: FAINT });

  if (p > 0.6) {
    box(24, 300, 400, 76, '', { fill: SURF2, stroke: BORDER });
    txt(36, 316, 'at 1 Gb/s the same three are ' + M.at1G.store.toFixed(2) + ', ' +
        M.at1G.fragment.toFixed(2) + ', ' + M.at1G.cut.toFixed(2) + ' \u00b5s',
        { size: 11.5, color: INK });
    txt(36, 338, 'Divide by ten, never by 100: the frame does not change.', { size: 11.5, color: DIM });
    txt(36, 360, 'The cost of cut-through is that a bad frame is already gone.', { size: 11.5, color: WARN });
  }
  takeaway(438, 'Store-and-forward buys a check and pays ' + Math.round(M.ratioStoreCut) +
    ' times the cut-through wait for it.');
}

/* ---------- scene 10: the procedure ---------- */
function drawProcedure(t, sc) {
  var p = K.sceneProgress(t);
  head('Four steps, and the three traps that survive them',
       'Every bridging question is a count, a table state, or a port state.');

  var steps = [
    ['1', 'Which device', 'hub: 1 \u00b7 switch: one per port \u00b7 router: ends it'],
    ['2', 'Which table state', 'before or after this frame learned its source'],
    ['3', 'Which action', 'unknown: flood \u00b7 same port: filter \u00b7 other: forward'],
    ['4', 'Which topology', 'is there a loop, and what did the spanning tree block']
  ];
  steps.forEach(function (s, i) {
    if (p < 0.1 + i * 0.14) return;
    var y = 76 + i * 50;
    P.circle(44, y + 6, 11, { fill: ACCDIM, stroke: ACC, sw: 1.4 });
    txt(44, y + 6, s[0], { size: 11.5, color: ACC, align: 'center', base: 'middle', bold: true });
    txt(66, y, s[1], { size: 12.5, bold: true, color: INK });
    txt(66, y + 18, s[2], { size: 11, color: DIM });
  });

  if (p > 0.62) {
    box(470, 74, 400, 150, '', { fill: BADDIM, stroke: BAD });
    txt(482, 90, 'the three traps', { size: 12, bold: true, color: BAD });
    txt(482, 114, '1  "a switch splits the broadcast domain"', { size: 11.5, color: INK });
    txt(482, 134, '2  "the switch learns the destination address"', { size: 11.5, color: INK });
    txt(482, 154, '3  "a blocked port is a broken port"', { size: 11.5, color: INK });
    txt(482, 180, 'each one turns a correct count into a wrong one', { size: 11, color: DIM });
    txt(482, 202, 'by exactly one domain, one entry, or one link', { size: 11, color: DIM });
  }
  if (p > 0.82) {
    txt(24, 300, 'Say the unit before you compute: domains, entries, copies, ports or seconds.', { size: 12, color: INK });
    txt(24, 322, 'Four of the five quantities are counts on a small diagram; the fifth is a sum of timers.', { size: 12, color: DIM });
  }
  takeaway(438, 'Identify the device, the table state, the action and the topology. Then count.');
}

var SCENE_DRAW = {
  bridge: drawBridge,
  learn: drawLearn,
  trace: drawTrace,
  domains: drawDomains,
  loop: drawLoop,
  root: drawRoot,
  ports: drawPorts,
  timers: drawTimers,
  modes: drawModes,
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

  K.onResize(function () {
    if (P) drawFrame(P);
  });

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
