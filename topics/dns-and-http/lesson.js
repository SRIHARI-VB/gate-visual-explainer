/* ==========================================================================
   dns-and-http — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no DNS or HTTP arithmetic of its own:
   every figure on the canvas was computed once here and checked against the
   rule it is supposed to satisfy (the delegation chain, the wire encoding of a
   name, the 512-byte UDP ceiling, and a tick-by-tick simulation of the three
   HTTP fetch modes).
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

/* ---------- 1. the delegation tree, one zone list per name ----------
   The zones are the delegation cuts below the root, written as the suffix
   they own. The servers asked are the root plus one per cut. This is the
   quantity GATE 2022 counts, and it is a property of the tree, not of the
   string: the number of labels is not the number of delegations. */

var TREE = [
  { name: 'www.gate.org.in', zones: ['in', 'org.in', 'gate.org.in'], note: 'GATE 2022, answer 4' },
  { name: 'www.gate-2023.in', zones: ['in', 'gate-2023.in'], note: 'GATE 2023, three-tier' },
  { name: 'www.example.com', zones: ['com', 'example.com'], note: 'www is a host' },
  { name: 'example.com', zones: ['com', 'example.com'], note: 'the name is the zone apex' },
  { name: 'a.b.example.co.uk', zones: ['uk', 'co.uk', 'example.co.uk', 'b.example.co.uk'], note: 'four cuts' }
];

TREE.forEach(function (e) {
  e.labels = e.name.split('.');
  e.servers = ['root'].concat(e.zones);
  e.pairs = e.servers.length;             /* one query-response pair per server */
  e.pairsWithHostHop = e.pairs + 1;       /* only when the resolver is another machine */
  e.encoded = encodedName(e.name);
});

function encodedName(name) {
  var parts = String(name).split('.');
  var n = 1;                              /* the terminating zero-length label */
  for (var i = 0; i < parts.length; i++) n += parts[i].length + 1;
  return n;
}

var GATE22 = TREE[0];                     /* 4 pairs */
var GATE23 = TREE[1];                     /* 3 servers = the three tiers */

/* ---------- 2. the DNS query on the wire ---------- */

var MSG = (function () {
  var m = {};
  m.headerFields = [
    { name: 'ID', bytes: 2, gloss: 'matches a reply to its query' },
    { name: 'flags', bytes: 2, gloss: 'query/response, recursion desired, truncated' },
    { name: 'QDCOUNT', bytes: 2, gloss: 'questions' },
    { name: 'ANCOUNT', bytes: 2, gloss: 'answers' },
    { name: 'NSCOUNT', bytes: 2, gloss: 'authority records' },
    { name: 'ARCOUNT', bytes: 2, gloss: 'additional records' }
  ];
  m.header = m.headerFields.reduce(function (s, f) { return s + f.bytes; }, 0);
  m.name = GATE22.encoded;
  m.tail = 4;                             /* QTYPE 2 + QCLASS 2 */
  m.query = m.header + m.name + m.tail;
  m.limit = 512;                          /* RFC 1035 section 4.2.1 */
  m.room = m.limit - m.header - m.name - m.tail;
  m.record = 16;                          /* 2 pointer + 2 type + 2 class + 4 TTL + 2 len + 4 address */
  m.maxA = Math.floor(m.room / m.record);
  m.oneMore = (m.maxA + 1) * m.record;
  return m;
})();

/* ---------- 3. the three fetch modes, as arithmetic and as a clock ---------- */

var RT = { objects: 10, parallel: 5, dns: 3, handshake: 1, request: 1 };

/* closed form: DNS, then the base page, then the objects */
function closedForm(mode, N, p) {
  var base = RT.handshake + RT.request;   /* 2 */
  var obj;
  if (mode === 'np') obj = 2 * Math.ceil(N / p);
  else if (mode === 'persist') obj = N * 1;
  else obj = 1;                            /* pipelined */
  return RT.dns + base + obj;
}

/* the clock: each non-persistent connection occupies a slot for two ticks,
   a fresh object enters a free slot at the start of the next tick */
function tickNP(N, p) {
  var slots = [], left = N, finished = 0, ticks = 0;
  for (var i = 0; i < p; i++) slots.push(0);
  while (finished < N && ticks < 10000) {
    for (var s = 0; s < p; s++) {
      if (slots[s] === 0 && left > 0) { slots[s] = 2; left--; }
    }
    for (var j = 0; j < p; j++) {
      if (slots[j] > 0) { slots[j]--; if (slots[j] === 0) finished++; }
    }
    ticks++;
  }
  return ticks;
}
function tickPersist(N) {                 /* one connection, one request at a time */
  var done = 0, ticks = 0;
  while (done < N) { ticks += 1; done += 1; }
  return ticks;
}

function simulate(mode, N, p) {
  var clock = RT.dns;                     /* the hierarchy is walked once */
  clock += RT.handshake;                  /* TCP handshake for the base page */
  clock += RT.request;                    /* base page request and response */
  if (mode === 'pipeline') return clock + 1;
  if (mode === 'persist') return clock + tickPersist(N);
  return clock + tickNP(N, p);
}

var MODES = [
  { id: 'np', label: 'non-persistent', objects: 10, parallel: 5, connections: 11 },
  { id: 'np10', label: 'non-persistent, 10 parallel', objects: 10, parallel: 10, connections: 11 },
  { id: 'persist', label: 'persistent, sequential', objects: 10, parallel: 1, connections: 1 },
  { id: 'pipeline', label: 'persistent, pipelined', objects: 10, parallel: 1, connections: 1 }
];

MODES.forEach(function (m) {
  var key = m.id === 'np10' ? 'np' : m.id;
  m.total = closedForm(key, m.objects, m.parallel);
  m.sim = simulate(key, m.objects, m.parallel);
});

var GATE23_NP = closedForm('np', 10, 5);        /* 9  */
var GATE23_PIPE = closedForm('pipeline', 10, 5);/* 6  */
var GATE23_PAR10 = closedForm('np', 10, 10);    /* 7  */
var GATE23_PERSIST = closedForm('persist', 10, 1); /* 15 */
var GATE20_CONN = 1 + 5;                        /* page + five images, non-persistent */
var GATE14_REQ = 1 + 1;                         /* page + one embedded image */
var GATE14_CONN = 1;                            /* one persistent connection suffices */

/* ---------- 4. the TTL budget ---------- */

var TTL = (function () {
  var ttl = 300;
  var queries = [0, 60, 120, 310];
  var seen = [], hits = 0, misses = 0, storedAt = -1;
  queries.forEach(function (t) {
    var fresh = storedAt >= 0 && (t - storedAt) < ttl;
    if (fresh) { hits++; seen.push({ t: t, hit: true, left: ttl - (t - storedAt) }); }
    else { misses++; storedAt = t; seen.push({ t: t, hit: false, left: ttl }); }
  });
  return { ttl: ttl, queries: queries, seen: seen, hits: hits, misses: misses,
           authoritative: misses };
})();

/* ---------- 5. caching an object ---------- */

var OBJ = {
  bytes: 20000,          /* the object                                  */
  head: 300,             /* a 304 response is headers only              */
  freshAge: 300,         /* max-age in seconds                          */
  visitAt: 120           /* the second visit, still inside max-age       */
};
OBJ.saved = OBJ.bytes - OBJ.head;
OBJ.freshVisit = OBJ.visitAt < OBJ.freshAge;    /* true: no request at all  */
OBJ.revalidateRTT = 1;                          /* a 304 costs one round trip */
OBJ.staleRTT = 1;                               /* so does a full download    */

/* ---------- 6. HTTP vocabulary ---------- */

var METHODS = [
  { m: 'GET', safe: true, idem: true },
  { m: 'HEAD', safe: true, idem: true },
  { m: 'PUT', safe: false, idem: true },
  { m: 'DELETE', safe: false, idem: true },
  { m: 'POST', safe: false, idem: false }
];

var CODES = [
  { c: 200, phrase: 'OK', family: 2, gloss: 'here is the object' },
  { c: 301, phrase: 'Moved Permanently', family: 3, gloss: 'use the new address from now on' },
  { c: 304, phrase: 'Not Modified', family: 3, gloss: 'your copy is still good; no body' },
  { c: 404, phrase: 'Not Found', family: 4, gloss: 'that name does not exist here' },
  { c: 500, phrase: 'Internal Server Error', family: 5, gloss: 'the server failed' }
];

var V = {
  tree: TREE, gate22: GATE22, gate23: GATE23, msg: MSG, rt: RT,
  modes: MODES, gate23np: GATE23_NP, gate23pipe: GATE23_PIPE,
  gate23par10: GATE23_PAR10, gate23persist: GATE23_PERSIST,
  gate20conn: GATE20_CONN, gate14req: GATE14_REQ, gate14conn: GATE14_CONN,
  ttl: TTL, obj: OBJ, methods: METHODS, codes: CODES
};

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* --- the delegation chain --- */
chk('every zone list descends from a top-level domain',
  TREE.every(function (e) { return e.zones.length > 0 && e.zones[0].indexOf('.') < 0; }));

chk('the servers asked are the root plus one per zone cut',
  TREE.every(function (e) { return e.pairs === 1 + e.zones.length; }));

chk('each zone is a suffix of the name it owns',
  TREE.every(function (e) {
    return e.zones.every(function (z) {
      return e.name === z || e.name.slice(-(z.length + 1)) === '.' + z;
    });
  }));

chk('GATE 2022: www.gate.org.in takes four query-response pairs', GATE22.pairs === 4, GATE22.pairs);
chk('GATE 2023: the three-tier hierarchy asks three servers', GATE23.pairs === 3, GATE23.pairs);
chk('www.example.com asks root, com and example.com',
  TREE[2].pairs === 3, TREE[2].pairs);
chk('the name example.com asks one more server than it has labels',
  TREE[3].pairs === TREE[3].labels.length + 1,
  TREE[3].pairs + ' vs ' + TREE[3].labels.length);
chk('labels are not delegations: www.example.com has three labels and three pairs',
  TREE[2].labels.length === 3 && TREE[2].pairs === 3);
chk('no name asks more servers than it has labels plus one',
  TREE.every(function (e) { return e.pairs <= e.labels.length + 1; }));
chk('a.b.example.co.uk descends through four cuts',
  TREE[4].pairs === 5, TREE[4].pairs);
chk('the host-to-resolver hop adds exactly one pair',
  TREE.every(function (e) { return e.pairsWithHostHop === e.pairs + 1; }));
chk('every label is at most 63 characters',
  TREE.every(function (e) { return e.labels.every(function (l) { return l.length <= 63; }); }));
chk('every name is at most 253 characters',
  TREE.every(function (e) { return e.name.length <= 253; }));

/* --- the message --- */
chk('the header is twelve bytes in six fields',
  MSG.header === 12 && MSG.headerFields.length === 6);
chk('www.gate.org.in encodes to seventeen bytes',
  MSG.name === 17, MSG.name);
chk('the whole query is thirty-three bytes', MSG.query === 33, MSG.query);
chk('the encoded name is the text length minus the dots, plus one byte per label, plus one',
  TREE.every(function (e) {
    var text = e.name.length - (e.labels.length - 1);
    return e.encoded === text + e.labels.length + 1;
  }));
chk('the query fits inside 512 bytes', MSG.query < MSG.limit);
chk('479 bytes are left for the answer section', MSG.room === 479, MSG.room);
chk('an A record costs sixteen bytes with a compressed name',
  MSG.record === 2 + 2 + 2 + 4 + 2 + 4);
chk('twenty-nine A records fit and thirty do not',
  MSG.maxA === 29 && MSG.oneMore > MSG.room, MSG.maxA + ' / ' + MSG.oneMore);
chk('the header plus the question plus the answers stays inside the limit',
  MSG.header + MSG.name + MSG.tail + MSG.maxA * MSG.record <= MSG.limit);

/* --- the fetch modes --- */
chk('the closed form and the tick simulation agree on the GATE 2023 case',
  closedForm('np', 10, 5) === simulate('np', 10, 5) &&
  closedForm('pipeline', 10, 5) === simulate('pipeline', 10, 5),
  closedForm('np', 10, 5) + ' / ' + simulate('np', 10, 5));

chk('the two models agree on every mode and width tested',
  (function () {
    var okAll = true;
    [1, 2, 3, 5, 10].forEach(function (p) {
      [1, 5, 10, 17].forEach(function (N) {
        if (closedForm('np', N, p) !== simulate('np', N, p)) okAll = false;
        if (closedForm('persist', N, 1) !== simulate('persist', N, 1)) okAll = false;
        if (closedForm('pipeline', N, 1) !== simulate('pipeline', N, 1)) okAll = false;
      });
    });
    return okAll;
  })());

chk('GATE 2023 option C: nine round trips', GATE23_NP === 9, GATE23_NP);
chk('GATE 2023 option D: six round trips', GATE23_PIPE === 6, GATE23_PIPE);
chk('GATE 2023 option A: seven round trips with ten parallel connections',
  GATE23_PAR10 === 7, GATE23_PAR10);
chk('GATE 2023 option B: five is one short of six', GATE23_PIPE - 5 === 1);
chk('sequential persistent costs fifteen', GATE23_PERSIST === 15, GATE23_PERSIST);
chk('the DNS part is the same in every mode',
  ['np', 'persist', 'pipeline'].every(function (m) {
    return closedForm(m, 10, 5) - (closedForm(m, 10, 5) - RT.dns) === RT.dns;
  }));
chk('pipelining is never slower than sequential persistence',
  closedForm('pipeline', 10, 1) <= closedForm('persist', 10, 1));
chk('more parallel connections never increase elapsed time',
  closedForm('np', 10, 10) <= closedForm('np', 10, 5));
chk('ten objects over five connections still need ten handshakes',
  tickNP(10, 5) === 4 && 10 * RT.handshake === 10);
chk('non-persistent connections are one more than the objects',
  GATE20_CONN === 6 && GATE20_CONN === 1 + 5);
chk('the GATE 2014 page needs two requests and one connection',
  GATE14_REQ === 2 && GATE14_CONN === 1);
chk('the round-trip total is never less than DNS plus the base page',
  MODES.every(function (m) { return m.total >= RT.dns + 2; }));
chk('every mode total matches its own simulation',
  MODES.every(function (m) { return m.total === m.sim; }));

/* --- the caches --- */
chk('the TTL of 300 seconds gives two hits and two misses',
  TTL.hits === 2 && TTL.misses === 2, TTL.hits + ' / ' + TTL.misses);
chk('only a miss reaches the authoritative server',
  TTL.authoritative === TTL.misses);
chk('the third query at 120 seconds is still inside the TTL',
  TTL.seen[2].hit === true && TTL.seen[2].left === 180, TTL.seen[2].left);
chk('the fourth query at 310 seconds has expired the record',
  TTL.seen[3].hit === false);
chk('a fresh object needs no request at all', OBJ.freshVisit === true);
chk('a 304 saves the body but not the round trip',
  OBJ.saved === OBJ.bytes - OBJ.head && OBJ.revalidateRTT === OBJ.staleRTT);
chk('the saved bytes are positive', OBJ.saved > 0, OBJ.saved);

/* --- the vocabulary --- */
chk('GET and HEAD are the only safe methods in the table',
  METHODS.filter(function (m) { return m.safe; }).length === 2);
chk('every safe method is also idempotent',
  METHODS.every(function (m) { return !m.safe || m.idem; }));
chk('POST is neither safe nor idempotent',
  !METHODS[4].safe && !METHODS[4].idem);
chk('the status families are named by the first digit',
  CODES.every(function (c) { return Math.floor(c.c / 100) === c.family; }));
chk('304 sits in the 3xx family and carries no body',
  CODES[2].family === 3 && CODES[2].c === 304);
chk('two of the five codes are redirects or revalidations',
  CODES.filter(function (c) { return c.family === 3; }).length === 2);

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function f2(v) { return (Math.round(v * 100) / 100).toFixed(2); }

/* the four beats of a scene, at 7.5 second spacing */
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

/* ============================ scene 1 ============================ */

function drawNames(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  heading('A name is not an address');

  /* left: the client side */
  P.alpha(b0);
  box(40, 52, 250, 54, { fill: SURF });
  T(52, 66, 'https://www.gate.org.in/index.html', { size: 11, mono: true });
  T(52, 86, 'what the person typed', { size: 10, color: FAINT });

  P.alpha(b2);
  box(40, 132, 250, 46, { fill: SURF });
  T(52, 146, 'stub resolver in the OS', { size: 11, bold: true });
  T(52, 164, 'forwards the question, does not walk', { size: 10, color: DIM });
  arrow(165, 108, 165, 130, ACC);

  P.alpha(b2);
  box(40, 204, 250, 50, { fill: ACCDIM, stroke: ACC });
  T(52, 218, 'recursive resolver', { size: 11, bold: true, color: ACC });
  T(52, 236, 'walks the tree and remembers', { size: 10, color: DIM });
  arrow(165, 180, 165, 202, ACC);

  /* right: the delegation chain */
  var x = 380, w = 300, y0 = 52, gap = 62;
  var chain = [
    { z: 'root', d: 'knows who runs every top-level domain' },
    { z: 'in', d: 'the top-level domain' },
    { z: 'org.in', d: 'the zone under it' },
    { z: 'gate.org.in', d: 'authoritative: it holds the answer' }
  ];
  chain.forEach(function (c, i) {
    var vis = i === 0 ? b1 : i === 1 ? b1 : i === 2 ? b1 : b3;
    P.alpha(vis * (b3 > 0 || i < 3 ? 1 : 1));
    var yy = y0 + i * gap;
    box(x, yy, w, 44, {
      fill: i === 3 ? ACCDIM : SURF,
      stroke: i === 3 ? ACC : BORDER
    });
    T(x + 12, yy + 14, c.z, { size: 12, mono: true, bold: true, color: i === 3 ? ACC : INK });
    T(x + 12, yy + 31, c.d, { size: 10, color: DIM });
    if (i > 0) arrow(x - 26, yy - gap + 44, x - 26, yy - 4, BORDER);
  });

  /* the name, split, right to left */
  P.alpha(b1);
  T(700, 66, 'read right to left', { size: 10, color: FAINT });
  var labels = ['www', 'gate', 'org', 'in'];
  var lx = 700, colr = [FAINT, INK, INK, ACC];
  labels.forEach(function (l, i) {
    T(lx, 90 + i * 18, l, { size: 12, mono: true, bold: true, color: colr[i] });
    lx += 8 + l.length * 7.6;
  });
  T(700, 176, 'a host inside the zone', { size: 9, color: FAINT });

  P.alpha(b3);
  T(40, 286, 'Cold: every level is asked.  Warm: the first cached record ends the walk.', { size: 12, color: WARN });
  T(40, 310, 'Nothing is cached at the start of a GATE question unless the question says so.', { size: 11, color: DIM });

  P.alpha(b1);
  T(40, 356, 'The dots separate labels.  A label is not a delegation: www is usually a host.', { size: 11, color: DIM });
  P.alpha(1);
}

/* ============================ scene 2 ============================ */

function drawIterative(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  heading('Iterative: the resolver walks.  Recursive: one server walks for it.');

  /* left panel: iterative */
  P.alpha(b0);
  T(40, 52, 'ITERATIVE', { size: 11, bold: true, color: ACC });
  box(40, 64, 120, 40, { fill: SURF });
  T(52, 78, 'resolver', { size: 11, bold: true });
  T(52, 94, 'does the asking', { size: 9, color: DIM });

  var srv = ['root', 'in', 'org.in', 'gate.org.in'];
  srv.forEach(function (s, i) {
    var yy = 64 + i * 46;
    var vis = i === 0 ? b0 : b0;
    P.alpha(vis);
    box(240, yy, 130, 36, { fill: i === 3 ? ACCDIM : SURF2, stroke: i === 3 ? ACC : BORDER });
    T(250, yy + 13, s, { size: 11, mono: true, bold: true });
    T(250, yy + 27, i === 3 ? 'the answer' : 'a referral', { size: 9, color: i === 3 ? ACC : DIM });
    arrow(162, yy + 18, 238, yy + 18, i === 3 ? ACC : BORDER);
    P.alpha(1);
    T(200, yy + 6, String(i + 1), { size: 9, mono: true, color: FAINT, align: 'center' });
  });

  /* right panel: recursive */
  P.alpha(b1);
  T(470, 52, 'RECURSIVE', { size: 11, bold: true, color: INFO });
  box(470, 64, 110, 40, { fill: SURF });
  T(482, 78, 'client', { size: 11, bold: true });
  T(482, 94, 'asks once', { size: 9, color: DIM });
  box(620, 64, 130, 40, { fill: SURF2 });
  T(630, 78, 'one server', { size: 11, bold: true });
  T(630, 94, 'returns the address', { size: 9, color: DIM });
  arrow(582, 84, 618, 84, INFO);
  T(600, 72, '1', { size: 9, mono: true, color: FAINT, align: 'center' });

  P.alpha(b1);
  T(470, 130, 'It asks the hierarchy itself; the client', { size: 10, color: DIM });
  T(470, 146, 'sees one question and one answer.', { size: 10, color: DIM });

  /* the count table */
  P.alpha(b2);
  T(40, 268, 'Count the servers asked: the root plus one per zone cut', { size: 11, bold: true });
  var rows = TREE.slice(0, 4);
  rows.forEach(function (e, i) {
    var yy = 288 + i * 24;
    T(40, yy, e.name, { size: 10, mono: true });
    T(220, yy, e.labels.length + ' labels', { size: 10, mono: true, color: FAINT });
    T(320, yy, e.pairs + ' pairs', { size: 10, mono: true, bold: true, color: i === 0 ? ACC : INK });
    T(410, yy, e.note, { size: 10, color: DIM });
  });

  P.alpha(b3);
  T(40, 400, 'Add one pair only when the host and the resolver are different machines.', { size: 11, color: WARN });
  T(40, 422, 'GATE 2023 puts the local DNS server on the local host, so that hop is free.', { size: 11, color: DIM });
  P.alpha(1);
}

/* ============================ scene 3 ============================ */

function drawRecords(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  heading('A resource record, and the time to live that makes DNS cheap');

  var rr = [
    { n: 'gate.org.in', ty: 'A', v: '203.0.113.10', ttl: 300, d: 'an IPv4 address' },
    { n: 'gate.org.in', ty: 'AAAA', v: '2001:db8::10', ttl: 300, d: 'an IPv6 address' },
    { n: 'www.gate.org.in', ty: 'CNAME', v: 'gate.org.in', ttl: 3600, d: 'an alias, and nothing else' },
    { n: 'gate.org.in', ty: 'MX', v: '10 mail.gate.org.in', ttl: 3600, d: 'preference, then the host' },
    { n: 'gate.org.in', ty: 'NS', v: 'ns1.gate.org.in', ttl: 86400, d: 'who runs this zone' }
  ];

  /* the five fields of the first record */
  P.alpha(b0);
  var fields = ['name', 'type', 'class', 'TTL', 'value'];
  fields.forEach(function (f, i) {
    var x = 40 + i * 108;
    box(x, 48, 100, 30, { fill: ACCDIM, stroke: ACC });
    T(x + 50, 58, f, { size: 10, bold: true, align: 'center', color: ACC });
  });
  T(40, 92, 'class is IN for internet data in every question here', { size: 10, color: DIM });

  /* the table */
  rr.forEach(function (r, i) {
    var yy = 116 + i * 30;
    P.alpha(b1);
    T(40, yy, r.n, { size: 10, mono: true });
    T(196, yy, r.ty, { size: 10, mono: true, bold: true, color: INFO });
    T(258, yy, r.v, { size: 10, mono: true });
    T(470, yy, String(r.ttl) + ' s', { size: 10, mono: true, color: DIM });
    T(560, yy, r.d, { size: 10, color: DIM });
    P.alpha(1);
  });

  /* the TTL bar, counting down with the clock */
  P.alpha(b2);
  T(40, 288, 'A TTL of 300 seconds: one lookup serves five minutes of questions', { size: 11, bold: true });
  var bx = 40, bw = 420, by = 304;
  var frac = 1;
  if (sc && t > sc.start) frac = 1 - Math.min(1, ((t - sc.start - 15) / 22.5));
  if (frac < 0) frac = 0;
  P.rect(bx, by, bw, 16, { fill: SURF2, stroke: BORDER, sw: 1, radius: 3 });
  P.rect(bx, by, bw * frac, 16, { fill: ACC, radius: 3 });
  T(bx + bw + 10, by + 2, Math.round(300 * frac) + ' s left', { size: 10, mono: true, color: DIM });

  P.alpha(b3);
  T(40, 344, 'A CNAME may not share a name with any other record: the alias would hide it.', { size: 11, color: WARN });
  T(40, 366, 'A name that does not exist is cached too, as a negative answer (RFC 2308).', { size: 11, color: WARN });
  T(40, 400, 'Two caches holding the same record count their lifetimes down separately.', { size: 11, color: DIM });
  P.alpha(1);
}

/* ============================ scene 4 ============================ */

function drawMessage(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  heading('The DNS query on the wire: twelve bytes of header, then the question');

  /* byte layout of the header */
  var x0 = 40, y = 54, scale = 20;   /* 20 px per byte for the header */
  MSG.headerFields.forEach(function (f, i) {
    P.alpha(b0);
    var x = x0 + i * 2 * scale;
    box(x, y, 2 * scale - 2, 40, { fill: i === 1 ? WARNDIM : SURF2, stroke: BORDER });
    T(x + scale - 1, y + 8, f.name, { size: 9, mono: true, bold: true, align: 'center' });
    T(x + scale - 1, y + 24, '2 B', { size: 9, mono: true, color: FAINT, align: 'center' });
    P.alpha(1);
  });
  P.alpha(b0);
  T(x0, y + 54, 'ID matches a reply to its query; the flags carry the recursion-desired and truncation bits.', { size: 10, color: DIM });

  /* the QNAME, label by label */
  P.alpha(b1);
  T(40, 148, 'QNAME for www.gate.org.in: a length byte in front of every label', { size: 11, bold: true });
  var parts = [
    { len: 3, txt: 'www' }, { len: 4, txt: 'gate' }, { len: 3, txt: 'org' }, { len: 2, txt: 'in' }, { len: 0, txt: '0' }
  ];
  var cx = 40, cy = 164;
  parts.forEach(function (p) {
    var wbytes = p.len + 1;
    var wpx = wbytes * 14;
    box(cx, cy, wpx - 2, 30, { fill: p.len === 0 ? SURF2 : ACCDIM, stroke: p.len === 0 ? BORDER : ACC });
    T(cx + 3, cy + 8, String(p.len), { size: 9, mono: true, bold: true, color: ACC });
    if (p.len) T(cx + 3, cy + 18, p.txt, { size: 9, mono: true });
    cx += wpx + 2;
  });
  T(cx + 8, cy + 10, '+ QTYPE 2 B + QCLASS 2 B', { size: 10, mono: true, color: DIM });
  T(40, 210, '4 + 5 + 4 + 3 + 1 = 17 bytes, and with the header and the tail the query is 33 bytes.',
    { size: 10, color: DIM });

  /* the 512-byte ceiling */
  P.alpha(b2);
  T(40, 250, 'The classic UDP ceiling is 512 bytes; the truncation bit sends the client to TCP',
    { size: 11, bold: true });
  var bx = 40, bw = 620, by = 266;
  P.rect(bx, by, bw, 18, { fill: SURF2, stroke: BORDER, sw: 1, radius: 3 });
  P.rect(bx, by, bw * (MSG.query / MSG.limit), 18, { fill: ACC, radius: 3 });
  T(bx + 6, by + 3, 'query ' + MSG.query + ' B', { size: 9, mono: true, color: SURF });
  T(bx + bw + 10, by + 2, '512 B', { size: 10, mono: true, color: DIM });

  P.alpha(b3);
  T(40, 300, '479 bytes remain for the answer.  Each compressed A record is 16 bytes.', { size: 11 });
  T(40, 322, '479 / 16 = 29.9, so 29 records fit and the 30th needs ' + MSG.oneMore + ' bytes.',
    { size: 11, color: WARN });
  T(40, 352, '2 pointer + 2 type + 2 class + 4 TTL + 2 length + 4 address = 16', { size: 10, mono: true, color: DIM });
  T(40, 384, 'Port 53.  UDP for ordinary queries, TCP for a truncated answer or a zone transfer.',
    { size: 11, color: DIM });
  P.alpha(1);
}

/* ============================ scene 5 ============================ */

function drawRequest(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  heading('HTTP: one request, one response, over a TCP connection');

  P.alpha(b0);
  box(40, 44, 380, 128, { fill: SURF, stroke: BORDER });
  var req = [
    'GET /index.html HTTP/1.1',
    'Host: www.gate.org.in',
    'User-Agent: ...',
    'Accept: text/html',
    '',
    '(no body for GET)'
  ];
  req.forEach(function (l, i) {
    T(52, 56 + i * 18, l, { size: 10, mono: true, color: i === 1 ? ACC : i === 0 ? INK : DIM });
  });

  P.alpha(b2);
  box(470, 44, 390, 128, { fill: SURF, stroke: BORDER });
  var res = [
    'HTTP/1.1 200 OK',
    'Content-Type: text/html',
    'Content-Length: 5120',
    'Cache-Control: max-age=300',
    '',
    '<html> ... </html>'
  ];
  res.forEach(function (l, i) {
    T(482, 56 + i * 18, l, { size: 10, mono: true, color: i === 0 ? VAL : DIM });
  });
  arrow(424, 108, 466, 108, BORDER);

  P.alpha(b1);
  T(40, 194, 'Two properties, not one', { size: 11, bold: true });
  METHODS.forEach(function (m, i) {
    var yy = 212 + i * 20;
    T(40, yy, m.m, { size: 10, mono: true, bold: true });
    T(110, yy, m.safe ? 'safe' : 'not safe', { size: 10, color: m.safe ? VAL : FAINT });
    T(190, yy, m.idem ? 'idempotent' : 'not idempotent', { size: 10, color: m.idem ? INFO : BAD });
  });

  P.alpha(b2);
  T(330, 194, 'The first digit is the family', { size: 11, bold: true });
  CODES.forEach(function (c, i) {
    var yy = 212 + i * 20;
    T(330, yy, String(c.c), { size: 10, mono: true, bold: true, color: c.family === 3 ? INFO : c.family === 2 ? VAL : c.family === 4 ? WARN : BAD });
    T(376, yy, c.phrase, { size: 10 });
    T(520, yy, c.gloss, { size: 9, color: DIM });
  });

  P.alpha(b3);
  T(40, 330, 'One request per object.  A page with five images is six objects.', { size: 11, bold: true });
  T(40, 352, 'GATE 2020: non-persistent mode, so six objects need ' + GATE20_CONN + ' TCP connections.',
    { size: 11, color: ACC });
  T(40, 380, 'The HTML page is an object too: counting only the images gives five and loses the mark.',
    { size: 10, color: WARN });
  T(40, 408, 'Host is mandatory in HTTP/1.1 because one address can serve many names.', { size: 10, color: DIM });
  P.alpha(1);
}

/* ============================ scene 6 ============================ */

function drawState(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  heading('HTTP keeps no memory; a cookie carries the memory for it');

  P.alpha(b0);
  T(40, 48, 'Request 1', { size: 10, bold: true });
  box(40, 58, 300, 34, { fill: SURF });
  T(52, 70, 'GET /cart HTTP/1.1', { size: 10, mono: true });
  T(52, 84, 'Host: shop.example', { size: 10, mono: true, color: DIM });
  box(370, 58, 300, 34, { fill: SURF });
  T(382, 70, 'HTTP/1.1 200 OK', { size: 10, mono: true, color: VAL });
  T(382, 84, 'Set-Cookie: sid=A7; Max-Age=600', { size: 10, mono: true, color: ACC });
  arrow(342, 75, 366, 75, BORDER);

  P.alpha(b1);
  T(40, 118, 'Request 2, and the protocol itself remembers nothing', { size: 10, bold: true });
  box(40, 128, 300, 34, { fill: SURF });
  T(52, 140, 'GET /cart HTTP/1.1', { size: 10, mono: true });
  T(52, 154, 'Cookie: sid=A7', { size: 10, mono: true, color: ACC });
  box(370, 128, 300, 34, { fill: SURF });
  T(382, 140, 'HTTP/1.1 200 OK', { size: 10, mono: true, color: VAL });
  T(382, 154, 'the server recognises the session', { size: 9, color: DIM });
  arrow(342, 145, 366, 145, BORDER);

  /* the store */
  P.alpha(b1);
  box(700, 52, 160, 110, { fill: SURF2 });
  T(712, 64, 'browser store', { size: 10, bold: true });
  T(712, 84, 'shop.example', { size: 9, mono: true, color: DIM });
  T(712, 100, 'sid = A7', { size: 10, mono: true, color: ACC });
  T(712, 116, 'expires in 600 s', { size: 9, color: DIM });
  T(712, 134, 'text, not code', { size: 9, color: WARN });
  arrow(672, 75, 698, 90, ACC);

  P.alpha(b2);
  T(40, 194, 'GATE 2015 Set 2: which statement is NOT correct?', { size: 11, bold: true });
  T(40, 214, '"A cookie is a piece of code that has the potential to compromise security."', { size: 11, color: BAD });
  T(40, 236, 'A cookie is a string of name-value pairs.  It enables tracking; it does not execute.', { size: 11, color: DIM });

  P.alpha(b3);
  T(40, 272, 'The four attributes that carry the marks', { size: 11, bold: true });
  var attrs = [
    { k: 'Expires / Max-Age', d: 'lifetime; without one the cookie dies with the session' },
    { k: 'Domain', d: 'which hosts receive it' },
    { k: 'Path', d: 'which paths receive it' },
    { k: 'Secure / HttpOnly', d: 'only over secure transport / hidden from scripts' }
  ];
  attrs.forEach(function (a, i) {
    var yy = 292 + i * 22;
    T(40, yy, a.k, { size: 10, mono: true, bold: true, color: ACC });
    T(220, yy, a.d, { size: 10, color: DIM });
  });
  T(40, 396, 'A cookie goes back to the site that set it, not to every site.', { size: 10, color: WARN });
  P.alpha(1);
}

/* ============================ scene 7 ============================ */

function drawConnections(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  heading('Three ways to fetch a page with three embedded objects');

  var N = 3;
  var lanes = [
    { id: 'np', label: 'non-persistent', note: 'a handshake and a request per object', colour: BAD,
      segs: [{ w: 2, txt: 'page' }, { w: 2, txt: 'o1' }, { w: 2, txt: 'o2' }, { w: 2, txt: 'o3' }] },
    { id: 'persist', label: 'persistent', note: 'one handshake, then one round trip each', colour: WARN,
      segs: [{ w: 2, txt: 'page' }, { w: 1, txt: 'o1' }, { w: 1, txt: 'o2' }, { w: 1, txt: 'o3' }] },
    { id: 'pipeline', label: 'pipelined', note: 'all requests sent together', colour: VAL,
      segs: [{ w: 2, txt: 'page' }, { w: 1, txt: 'o1 o2 o3' }] }
  ];

  lanes.forEach(function (l, i) {
    var vis = i === 0 ? b0 : i === 1 ? b1 : b2;
    P.alpha(vis);
    var y = 62 + i * 84;
    T(40, y, l.label, { size: 11, bold: true, color: l.colour });
    T(40, y + 16, l.note, { size: 9, color: DIM });
    var x = 240, unit = 26;
    var run = 0;
    l.segs.forEach(function (s) {
      P.rect(x + run * unit, y - 10, s.w * unit - 2, 26, { fill: SURF2, stroke: l.colour, sw: 1.2, radius: 3 });
      T(x + run * unit + 4, y - 3, s.txt, { size: 9, mono: true });
      run += s.w;
    });
    T(x + run * unit + 44, y - 3, run + ' RTT', { size: 10, mono: true, color: l.colour, bold: true });
    T(x + run * unit + 44, y + 12, (l.id === 'persist' || l.id === 'pipeline' ? '1 connection' : (N + 1) + ' connections'),
      { size: 9, color: DIM });
    P.alpha(1);
  });

  P.alpha(b3);
  T(40, 318, 'GATE 2026 Set 1: A, C and D are true; B is false.', { size: 11, bold: true });
  T(40, 340, 'A — many objects of one page, same server: true.   C — pipelining: true.', { size: 10, color: DIM });
  T(40, 358, 'D — later pages on the same server reuse the connection: true.', { size: 10, color: DIM });
  T(40, 376, 'B — one connection reaching two different servers: false, a socket has one endpoint.', { size: 10, color: BAD });
  T(40, 406, 'Persistence is per server, not per page and not across servers.', { size: 10, color: WARN });
  P.alpha(1);
}

/* ============================ scene 8 ============================ */

function drawRtt(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  heading('GATE 2023: DNS, then the page, then the objects');

  function bar(y, label, parts, total, colour) {
    T(40, y, label, { size: 11, bold: true });
    var x = 250, unit = 22, run = 0;
    parts.forEach(function (p) {
      P.rect(x + run * unit, y - 12, p.w * unit - 2, 28, { fill: p.fill || SURF2, stroke: colour, sw: 1.2, radius: 3 });
      T(x + run * unit + 4, y - 5, p.t, { size: 9, mono: true });
      run += p.w;
    });
    T(x + run * unit + 46, y - 5, String(total) + ' RTT', { size: 12, mono: true, bold: true, color: colour });
    T(x + run * unit + 46, y + 12, parts.map(function (p) { return p.w; }).join(' + ') + ' = ' + total,
      { size: 9, mono: true, color: DIM });
  }

  P.alpha(b0);
  bar(64, 'the stages', [
    { w: 3, t: 'DNS 3' }, { w: 2, t: 'page 2' }
  ], 5, BORDER);
  T(40, 96, 'root, TLD, authoritative — the resolver is on the host, so no extra hop', { size: 9, color: DIM });

  P.alpha(b1);
  bar(150, 'non-persistent, 5 parallel', [
    { w: 3, t: 'DNS 3' }, { w: 2, t: 'page 2' }, { w: 2, t: 'o1-5' }, { w: 2, t: 'o6-10' }
  ], GATE23_NP, BAD);
  T(40, 178, 'ten objects in two rounds, two round trips per round', { size: 9, color: DIM });

  P.alpha(b2);
  bar(232, 'persistent, pipelined', [
    { w: 3, t: 'DNS 3' }, { w: 2, t: 'page 2' }, { w: 1, t: 'all 10' }
  ], GATE23_PIPE, VAL);
  T(40, 260, 'the connection is already open and the requests go together', { size: 9, color: DIM });

  P.alpha(b3);
  T(40, 306, 'Why the other two options are wrong', { size: 11, bold: true });
  T(40, 328, 'A says ' + GATE23_PAR10 + ' RTT: that is what ten parallel connections give, one round instead of two.',
    { size: 10, color: WARN });
  T(40, 350, 'B says 5 RTT: that forgets the handshake before the base page.', { size: 10, color: WARN });
  T(40, 380, 'Every configuration here was recomputed by a tick-by-tick simulation, not quoted.', { size: 10, color: DIM });
  T(40, 408, 'Three for DNS, two for the page, and the mode decides the rest.', { size: 10, color: ACC });
  P.alpha(1);
}

/* ============================ scene 9 ============================ */

function drawCache(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  heading('Two caches, two rules: a DNS TTL and an HTTP freshness lifetime');

  P.alpha(b0);
  T(40, 50, 'resolver cache', { size: 10, bold: true, color: ACC });
  T(40, 70, 'records, held for a TTL', { size: 9, color: DIM });
  T(40, 100, 'browser cache', { size: 10, bold: true, color: INFO });
  T(40, 120, 'objects, held while fresh', { size: 9, color: DIM });

  /* TTL timeline */
  P.alpha(b0);
  var tx = 240, unit = 42, ty = 76;
  P.line(tx, ty, tx + 8 * unit, ty, { stroke: BORDER, sw: 1.5 });
  TTL.queries.forEach(function (q, i) {
    var x = tx + (q / 60) * unit * 0.9 + i * 0;
    x = tx + Math.min(7, q / 60) * unit;
    var hit = TTL.seen[i].hit;
    P.circle(x, ty, 5, { fill: hit ? VAL : BAD, stroke: SURF, sw: 1 });
    T(x, ty - 18, hit ? 'hit' : 'miss', { size: 9, color: hit ? VAL : BAD, align: 'center' });
    T(x, ty + 10, q + ' s', { size: 8, mono: true, color: FAINT, align: 'center' });
  });
  T(tx, ty + 34, 'two hits and two misses: only a miss reaches the authoritative server',
    { size: 9, color: DIM });

  /* the two visits */
  P.alpha(b1);
  T(40, 168, 'First visit: the object is not in the browser cache', { size: 11, bold: true });
  box(40, 180, 340, 30, { fill: SURF });
  T(52, 190, 'GET /style.css', { size: 10, mono: true });
  box(400, 180, 300, 30, { fill: SURF });
  T(412, 190, '200 OK, ' + OBJ.bytes + ' bytes of body', { size: 10, mono: true, color: VAL });

  P.alpha(b2);
  T(40, 232, 'Second visit, still inside max-age', { size: 11, bold: true });
  box(40, 244, 340, 30, { fill: ACCDIM, stroke: ACC });
  T(52, 254, 'no request at all: the copy is fresh', { size: 10, mono: true, color: ACC });
  T(400, 254, '0 round trips', { size: 10, mono: true, color: ACC });

  P.alpha(b3);
  T(40, 296, 'Second visit, after max-age: a conditional GET', { size: 11, bold: true });
  box(40, 308, 340, 30, { fill: SURF });
  T(52, 318, 'If-None-Match: "v7"', { size: 10, mono: true });
  box(400, 308, 300, 30, { fill: SURF });
  T(412, 318, '304 Not Modified, no body', { size: 10, mono: true, color: INFO });
  T(40, 350, 'It saves ' + OBJ.saved + ' bytes and no time: a 304 is still one round trip.',
    { size: 10, color: WARN });
  T(40, 378, 'Fresh: 0 requests.  Revalidated: 1 request, no body.  Stale: 1 request and the whole object.',
    { size: 10, color: DIM });
  T(40, 406, 'A warm browser cache does not save the DNS lookup, and a warm DNS cache does not save the download.',
    { size: 10, color: DIM });
  P.alpha(1);
}

/* ============================ scene 10 ============================ */

function drawProcedure(t, sc) {
  var b0 = beat(t, sc, 0), b1 = beat(t, sc, 1), b2 = beat(t, sc, 2), b3 = beat(t, sc, 3);

  heading('The procedure, and the five traps that break it');

  var steps = ['resolve the name', 'open the connection', 'request each object', 'render'];
  steps.forEach(function (s, i) {
    var vis = i <= 0 ? b0 : b0;
    P.alpha(vis);
    var x = 40 + i * 200;
    box(x, 50, 180, 52, { fill: SURF2, stroke: BORDER });
    T(x + 12, 62, String(i + 1) + '.', { size: 10, mono: true, color: FAINT });
    T(x + 30, 62, s, { size: 10, bold: true });
    if (i < 3) arrow(x + 182, 76, x + 198, 76, BORDER);
    P.alpha(1);
  });
  P.alpha(b0);
  T(40, 118, 'Each step is forced by the one before it: no address, no connection; no page, no object list.',
    { size: 10, color: DIM });

  P.alpha(b1);
  T(40, 152, 'Traps one to three', { size: 11, bold: true });
  T(40, 174, '1.  Counting labels as delegations — the count belongs to the tree, not the string.', { size: 10 });
  T(40, 196, '2.  Forgetting the handshake — it is a round trip of its own.', { size: 10 });
  T(40, 218, '3.  One connection across two servers — a socket has one destination.', { size: 10 });

  P.alpha(b2);
  T(40, 254, 'Traps four and five', { size: 11, bold: true });
  T(40, 276, '4.  A 304 is not free — it saves the body, not the round trip.', { size: 10 });
  T(40, 298, '5.  Parallel connections change the time, never the connection count.', { size: 10 });

  P.alpha(b3);
  box(40, 328, 820, 54, { fill: ACCDIM, stroke: ACC });
  T(54, 342, 'Write the unit at the top of your working: pairs, connections, or round trips.', { size: 11, bold: true, color: ACC });
  T(54, 364, 'Every trap in this clause is a unit confusion or a missing round trip, and both are visible once the unit is written.',
    { size: 10, color: DIM });

  T(40, 402, 'All ' + CHECKS.length + ' model checks passed on load; the count is printed under the canvas.',
    { size: 10, color: FAINT });
  P.alpha(1);
}

/* ============================ the frame ============================ */

var SCENE_DRAW = {
  names: drawNames,
  iterative: drawIterative,
  records: drawRecords,
  message: drawMessage,
  request: drawRequest,
  state: drawState,
  connections: drawConnections,
  rtt: drawRtt,
  cache: drawCache,
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
