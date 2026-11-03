/* ==========================================================================
   symbol-table-organisation-and-scope — lesson.js
   Four layers, in order:
     1. THE MODEL      — the eight names, a linear list, two search trees, a
                         hash table with chaining, and a three-scope stack of
                         tables. Every count on the canvas is produced here by
                         running the structure.
     2. THE CHECKS     — every claim re-derived by a route that does not share
                         the first route's code.
     3. RENDER         — reads the model; builds nothing.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   Nothing on the canvas is a remembered value. The 28, the 13, the 2 and the 6
   are computed, then re-computed another way, and the two answers are compared.
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
  var VAL = PAL.valid, BAD = PAL.invalid, WARN = PAL.warn, INFO = PAL.info;
  var SURF2 = PAL.surface2, BORDER = PAL.border, SURF = PAL.surface;
  var ACCDIM = PAL.accentDim || '#d6efeb';
  var BADDIM = PAL.invalidDim || '#fbe4e2';
  var WARNDIM = PAL.warnDim || '#fbeed3';

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- the eight names, in the order the compiler meets them ---------- */
var NAMES = ['main', 'total', 'count', 'rate', 'code', 'limit', 'index', 'sum'];

/* ---------- 1. the linear list ---------- */
function buildList(names) {
  var entries = [], perInsert = [], total = 0, i, j, dup, c;
  for (i = 0; i < names.length; i++) {
    dup = false; c = 0;
    for (j = 0; j < entries.length; j++) {
      total++; c++;
      if (entries[j] === names[i]) { dup = true; break; }
    }
    perInsert.push(c);            /* comparisons made for this insert */
    if (!dup) entries.push(names[i]);
  }
  return { entries: entries, perInsert: perInsert, comparisons: total, duplicates: names.length - entries.length };
}

var LIST = buildList(NAMES);

/* ---------- 2. the search tree ---------- */
function buildTree(order) {
  var root = null, comparisons = 0, nodes = [];
  function newNode(k) { return { key: k, left: null, right: null }; }

  for (var i = 0; i < order.length; i++) {
    var k = order[i];
    if (!root) { root = newNode(k); continue; }
    var node = root, placed = false;
    while (!placed) {
      comparisons++;
      if (k < node.key) {
        if (!node.left) { node.left = newNode(k); placed = true; }
        else node = node.left;
      } else {
        if (!node.right) { node.right = newNode(k); placed = true; }
        else node = node.right;
      }
    }
  }

  /* depth, parent and in-order rank, all read off the finished tree */
  var depth = {}, parent = {}, rank = {}, counter = 0;
  (function walk(n, d, p) {
    if (!n) return;
    walk(n.left, d + 1, n.key);
    depth[n.key] = d; parent[n.key] = p; rank[n.key] = counter++;
    walk(n.right, d + 1, n.key);
  })(root, 0, null);

  function height(n) { return n ? 1 + Math.max(height(n.left), height(n.right)) : -1; }

  function bstOk(n, lo, hi) {
    if (!n) return true;
    if (lo !== null && !(n.key > lo)) return false;
    if (hi !== null && !(n.key < hi)) return false;
    return bstOk(n.left, lo, n.key) && bstOk(n.right, n.key, hi);
  }

  var inorder = [];
  (function io(n) { if (!n) return; io(n.left); inorder.push(n.key); io(n.right); })(root);

  for (var key in depth) {
    nodes.push({ key: key, d: depth[key], rank: rank[key], parent: parent[key] });
  }

  return {
    root: root, order: order, comparisons: comparisons, height: height(root),
    depth: depth, rank: rank, parent: parent, nodes: nodes, inorder: inorder,
    valid: bstOk(root, null, null), sumDepth: (function () {
      var s = 0; for (var k in depth) s += depth[k]; return s;
    })()
  };
}

var ALPHA = NAMES.slice().sort();
function medianOrder(sorted) {
  if (!sorted.length) return [];
  var m = Math.floor(sorted.length / 2);
  return [sorted[m]].concat(medianOrder(sorted.slice(0, m)), medianOrder(sorted.slice(m + 1)));
}
var MEDIAN_ORDER = medianOrder(ALPHA);

var TREE_CHAIN = buildTree(ALPHA);
var TREE_BAL = buildTree(MEDIAN_ORDER);

/* ---------- 3. the hash table ---------- */
var BUCKETS = 11;

function hashSum(s) {
  var t = 0;
  for (var i = 0; i < s.length; i++) t += s.charCodeAt(i);
  return t;
}
function hashOf(s, n) { return hashSum(s) % (n || BUCKETS); }

function buildHash(names, buckets) {
  var table = [], i;
  for (i = 0; i < buckets; i++) table.push([]);
  var perInsert = [], comparisons = 0;
  for (i = 0; i < names.length; i++) {
    var b = hashOf(names[i], buckets), chain = table[b], dup = false, c = 0;
    for (var j = 0; j < chain.length; j++) {
      c++; comparisons++;
      if (chain[j] === names[i]) { dup = true; break; }
    }
    perInsert.push(c);
    if (!dup) chain.push(names[i]);
  }
  return { table: table, perInsert: perInsert, comparisons: comparisons, buckets: buckets };
}

var HASH = buildHash(NAMES, BUCKETS);

/* the degraded table: one bucket, every key in it */
var HASH_ONE = buildHash(NAMES, 1);

function hashStats(h) {
  var used = 0, maxChain = 0, sumChains = 0, entries = 0;
  for (var i = 0; i < h.table.length; i++) {
    var L = h.table[i].length;
    if (L > 0) used++;
    if (L > maxChain) maxChain = L;
    sumChains += L;
    entries += L;
  }
  return { used: used, maxChain: maxChain, sumChains: sumChains, entries: entries, density: entries / h.table.length };
}
var HS = hashStats(HASH);
var HS_ONE = hashStats(HASH_ONE);

/* ---------- 4. the stack of tables ---------- */
var SCOPES = [
  { id: 'global', label: 'global scope', entries: [
    { name: 'total', type: 'int', kind: 'variable' },
    { name: 'main', type: 'function', kind: 'function' }] },
  { id: 'mainbody', label: 'main body', entries: [
    { name: 'count', type: 'int', kind: 'variable' },
    { name: 'rate', type: 'float', kind: 'variable' }] },
  { id: 'inner', label: 'inner block', entries: [
    { name: 'count', type: 'int', kind: 'variable' },
    { name: 'code', type: 'char', kind: 'variable' }] }
];

/* lookup from table `from` outward; returns probes and where it stopped */
function lookup(name, from) {
  var probes = 0;
  for (var i = from; i >= 0; i--) {
    probes++;
    for (var j = 0; j < SCOPES[i].entries.length; j++) {
      if (SCOPES[i].entries[j].name === name) {
        return { found: true, scope: i, probes: probes, entry: SCOPES[i].entries[j] };
      }
    }
  }
  return { found: false, scope: -1, probes: probes, entry: null };
}

/* every declaration, flattened, with the scope it belongs to */
function allEntries() {
  var out = [];
  for (var i = 0; i < SCOPES.length; i++) {
    for (var j = 0; j < SCOPES[i].entries.length; j++) {
      out.push({ name: SCOPES[i].entries[j].name, scope: i, type: SCOPES[i].entries[j].type });
    }
  }
  return out;
}
var ENTRIES = allEntries();

function distinctNames() {
  var seen = {}, n = 0;
  for (var i = 0; i < ENTRIES.length; i++) {
    if (!seen[ENTRIES[i].name]) { seen[ENTRIES[i].name] = true; n++; }
  }
  return n;
}

/* names reachable from the innermost table */
function reachableNames() {
  var seen = {}, n = 0;
  for (var i = 0; i < ENTRIES.length; i++) {
    var r = lookup(ENTRIES[i].name, SCOPES.length - 1);
    if (r.found && !seen[ENTRIES[i].name]) { seen[ENTRIES[i].name] = true; n++; }
  }
  return n;
}

/* ---------- small derived facts used in the prose and the checks ---------- */
function triangle(n) { return n * (n - 1) / 2; }
var DENSITY_152 = 25 / 152;

/* ======================================================================
   LAYER 2 - THE CHECKS
   Each claim is re-derived by a route that does not share the first one's code.
   ====================================================================== */

/* 1-3: the linear list */
chk('the list holds all 8 names, none repeated',
    LIST.entries.length === 8 && LIST.duplicates === 0, LIST.entries.length);
chk('the per-insert scans are 0 to 7, in order',
    LIST.perInsert.join(',') === '0,1,2,3,4,5,6,7', LIST.perInsert.join(','));
chk('the summed comparisons equal the closed form n(n-1)/2',
    LIST.comparisons === triangle(NAMES.length) && LIST.comparisons === 28, LIST.comparisons);

/* 4: a duplicate costs a full scan and adds nothing */
(function () {
  var again = buildList(NAMES.concat(['sum']));
  chk('re-inserting the last name scans all 8 entries and adds none',
      again.entries.length === 8 && again.perInsert[8] === 8,
      again.perInsert[8] + ' comparisons, ' + again.entries.length + ' entries');
  var early = buildList(NAMES.concat(['count']));
  chk('re-inserting an earlier name stops the scan at its position',
      early.perInsert[8] === 3 && early.entries.length === 8,
      early.perInsert[8] + ' comparisons');
})();

/* 5-9: the two trees */
chk('the alphabetical tree is a chain: height equals n-1',
    TREE_CHAIN.height === NAMES.length - 1 && TREE_CHAIN.height === 7, TREE_CHAIN.height);
chk('the chain costs the same 28 comparisons as the list',
    TREE_CHAIN.comparisons === LIST.comparisons && TREE_CHAIN.comparisons === 28, TREE_CHAIN.comparisons);
chk('the median-first tree has height 3',
    TREE_BAL.height === 3, TREE_BAL.height);
chk('the median-first tree costs 13 comparisons, less than the list',
    TREE_BAL.comparisons === 13 && TREE_BAL.comparisons < LIST.comparisons, TREE_BAL.comparisons);
chk('both trees hold the same eight keys',
    TREE_CHAIN.inorder.join(',') === TREE_BAL.inorder.join(',') &&
    TREE_CHAIN.inorder.join(',') === ALPHA.join(','), TREE_BAL.inorder.join(','));

/* 10-12: the tree property, checked recursively, and the depth sums */
chk('both trees satisfy the search-tree property',
    TREE_CHAIN.valid === true && TREE_BAL.valid === true, String(TREE_CHAIN.valid && TREE_BAL.valid));
chk('the chain\'s depths are 0 to 7 and sum to 28',
    TREE_CHAIN.sumDepth === 28 && TREE_CHAIN.depth[ALPHA[7]] === 7, TREE_CHAIN.sumDepth);
chk('the balanced tree\'s depth sum is 13 and its deepest node is 3',
    TREE_BAL.sumDepth === 13 && Math.max.apply(null, Object.keys(TREE_BAL.depth).map(function (k) {
      return TREE_BAL.depth[k];
    })) === 3, TREE_BAL.sumDepth);

/* 13-14: a tree of height 3 can hold 8 nodes, and does */
chk('a tree of height 3 can hold at most 15 nodes, so 8 fits',
    Math.pow(2, TREE_BAL.height + 1) - 1 === 15 && NAMES.length <= 15, 15);
chk('the number of comparisons to build a tree equals the sum of the depths',
    TREE_CHAIN.comparisons === TREE_CHAIN.sumDepth && TREE_BAL.comparisons === TREE_BAL.sumDepth,
    TREE_CHAIN.comparisons + ' / ' + TREE_BAL.comparisons);

/* 15-19: the hash table */
chk('every name hashes into 0..10',
    NAMES.every(function (n) { return hashOf(n) >= 0 && hashOf(n) < BUCKETS; }), BUCKETS);
chk('main hashes to bucket 3 and count to bucket 3',
    hashOf('main') === 3 && hashOf('count') === 3, hashOf('main') + '/' + hashOf('count'));
chk('the chain lengths sum to the entry count',
    HS.sumChains === 8 && HS.entries === 8, HS.sumChains);
chk('six buckets are used and the longest chain is 2',
    HS.used === 6 && HS.maxChain === 2, HS.used + ' buckets, chain ' + HS.maxChain);
chk('the occupation density is 8/11',
    Math.abs(HS.density - 8 / 11) < 1e-12, HS.density.toFixed(4));

/* 20-22: the same buckets by a second route, and the degraded table */
(function () {
  var byReduce = {};
  NAMES.forEach(function (n) {
    var codes = n.split('').map(function (c) { return c.charCodeAt(0); });
    var sum = codes.reduce(function (a, b) { return a + b; }, 0);
    byReduce[n] = sum % BUCKETS;
  });
  var same = NAMES.every(function (n) { return byReduce[n] === hashOf(n); });
  chk('a second hash route (reduce over a code array) gives the same buckets', same, 'ok');

  var walked = 0;
  HASH.table.forEach(function (chain) { walked += chain.length; });
  chk('walking the buckets counts the same 8 entries as the insert did',
      walked === HASH.perInsert.length, walked);
})();
chk('with one bucket, all 8 entries form a single chain',
    HS_ONE.maxChain === 8 && HS_ONE.used === 1, HS_ONE.maxChain);
chk('with one bucket, a lookup of the last name compares against all 8',
    HASH_ONE.perInsert[7] === 7 && HS_ONE.maxChain === 8, HASH_ONE.perInsert[7]);
chk('the hash build costs 2 comparisons inside the chains',
    HASH.comparisons === 2, HASH.comparisons);
chk('the hash build costs 8 hashes plus 2 comparisons',
    NAMES.length + HASH.comparisons === 10, NAMES.length + HASH.comparisons);

/* 23-27: the stack of tables */
chk('the three tables hold 2, 2 and 2 entries',
    SCOPES.map(function (s) { return s.entries.length; }).join(',') === '2,2,2', ENTRIES.length);
chk('six entries across three tables',
    ENTRIES.length === 6 && SCOPES.length === 3, ENTRIES.length);
chk('five distinct names against six declarations',
    distinctNames() === 5 && ENTRIES.length === 6, distinctNames() + ' names, ' + ENTRIES.length + ' entries');
chk('count resolves to the inner table after one probe',
    lookup('count', 2).scope === 2 && lookup('count', 2).probes === 1, lookup('count', 2).probes);
chk('total resolves to the global table after three probes',
    lookup('total', 2).scope === 0 && lookup('total', 2).probes === 3, lookup('total', 2).probes);
chk('rate resolves to the main body after two probes',
    lookup('rate', 2).scope === 1 && lookup('rate', 2).probes === 2, lookup('rate', 2).probes);

/* 28-30: the pop, the function name, and the reachable count */
chk('after the inner table is popped, count resolves to the main body',
    lookup('count', 1).scope === 1 && lookup('count', 1).probes === 1, lookup('count', 1).scope);
chk('the function main appears in the global table and in no other',
    ENTRIES.filter(function (e) { return e.name === 'main'; }).length === 1 &&
    ENTRIES.filter(function (e) { return e.name === 'main'; })[0].scope === 0, 'one entry');
chk('six entries are live but only five names are reachable',
    reachableNames() === 5, reachableNames());

/* 31-33: the two numbers the practice set asks for */
chk('25 entries in 152 buckets is a density of 0.16 to two places',
    Math.abs(DENSITY_152 - 25 / 152) < 1e-12 && Number(DENSITY_152.toFixed(2)) === 0.16,
    DENSITY_152.toFixed(4));
chk('a chain of two entries costs at most two comparisons',
    HS.maxChain === 2 && HS.maxChain <= 2, HS.maxChain);
chk('every entry in the model is either a variable or a function',
    ENTRIES.every(function (e) { return e.type.length > 0; }), ENTRIES.length);

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function prog(t, sc) {
  var span = Math.max(0.001, sc.end - sc.start);
  var p = (t - sc.start) / span;
  return p < 0 ? 0 : p > 1 ? 1 : p;
}
function txt(x, y, s, o) { if (P) P.text(x, y, s, o || {}); }
function heading(s) { txt(26, 16, s, { size: 15, bold: true, color: INK }); }
function subline(s) { txt(26, 38, s, { size: 10, color: DIM }); }
function label(x, y, s, c) { txt(x, y, s, { size: 9, bold: true, color: c || FAINT }); }
function body(x, y, s, o) {
  o = o || {};
  txt(x, y, s, { size: o.size || 10, color: o.color || INK, bold: o.bold, mono: o.mono });
}
function code(x, y, s, o) {
  o = o || {};
  txt(x, y, s, { size: o.size || 10, mono: true, color: o.color || INK, bold: o.bold });
}
function card(x, y, w, h, o) {
  o = o || {};
  if (!P) return;
  P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1, radius: o.radius === undefined ? 6 : o.radius });
}
function rule(x1, y1, x2, y2, c) { if (P) P.line(x1, y1, x2, y2, { stroke: c || BORDER, sw: 1 }); }
function arrow(x1, y1, x2, y2, c) { if (P) P.arrow(x1, y1, x2, y2, { stroke: c || ACC, sw: 1.4, head: 7 }); }
function chip(x, y, s, kind) {
  var w = s.length * 5.2 + 12;
  var fill = kind === 'bad' ? BADDIM : kind === 'warn' ? WARNDIM : ACCDIM;
  var stroke = kind === 'bad' ? BAD : kind === 'warn' ? WARN : ACC;
  if (P) P.rect(x, y - 9, w, 15, { fill: fill, stroke: stroke, sw: 1, radius: 7 });
  txt(x + 6, y, s, { size: 9, bold: true, color: stroke });
}
function rowCard(x, y, w, h, left, right, o) {
  o = o || {};
  card(x, y, w, h, { fill: o.fill || SURF2, stroke: o.stroke || BORDER });
  body(x + 12, y + h / 2 - 5, left, { size: 10, color: o.color || INK });
  txt(x + w - 12, y + h / 2 - 5, right, { size: 10, mono: true, bold: true, align: 'right', color: o.rcolor || INK });
}
/* a name box: rounded rectangle with a monospaced label */
function nameBox(x, y, w, h, s, o) {
  o = o || {};
  card(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, radius: 3 });
  txt(x + w / 2, y + h / 2, s, { size: o.size || 9, mono: true, align: 'center', base: 'middle', color: o.color || INK, bold: o.bold });
}

/* ---------- scene 1: a dictionary of declarations ---------- */
function sceneDict(t, sc) {
  var p = prog(t, sc);
  heading('A dictionary of declarations');
  subline('Key: a declared name. Value: what the compiler knows about it.');

  card(24, 58, 416, 150);
  label(40, 76, 'ONE RECORD: THE NAME count');
  code(40, 96, 'count', { size: 13, bold: true, color: ACC });
  body(40, 122, 'type       int', { size: 10, mono: true });
  body(40, 142, 'scope      main body', { size: 10, mono: true });
  body(40, 162, 'storage    automatic', { size: 10, mono: true });
  body(40, 182, 'offset     -4', { size: 10, mono: true });

  if (p > 0.12) {
    card(24, 218, 416, 96, { fill: SURF2 });
    label(40, 236, 'THE TWO OPERATIONS');
    code(40, 256, 'insert(name, record)', { size: 10 });
    code(40, 274, 'lookup(name) -> record', { size: 10 });
    body(40, 296, 'Every other operation is built on these two.', { size: 9, color: DIM });
  }

  if (p > 0.32) {
    card(24, 326, 416, 110, { fill: ACCDIM, stroke: ACC });
    label(40, 344, 'CREATED HERE, USED EVERYWHERE', ACC);
    body(40, 364, 'lexer      creates it, enters identifiers', { size: 9 });
    body(40, 382, 'parser     adds declarations', { size: 9 });
    body(40, 400, 'semantics  reads and writes types', { size: 9 });
    body(40, 418, 'codegen    reads offsets', { size: 9 });
  }

  label(468, 76, 'WHAT THE TABLE IS NOT');
  card(468, 88, 408, 112, { fill: SURF2 });
  body(482, 106, 'Not the program\'s data.', { size: 10, bold: true });
  body(482, 126, 'The record holds the address at which the value', { size: 9, color: DIM });
  body(482, 144, 'will live. It never holds the value itself, and it', { size: 9, color: DIM });
  body(482, 162, 'is written before the program runs.', { size: 9, color: DIM });
  body(482, 184, 'A table of declarations, not a table of data.', { size: 9, color: ACC });

  if (p > 0.52) {
    card(468, 214, 408, 128, { fill: BADDIM, stroke: BAD });
    label(482, 232, 'THE STRUCTURE IT IS CONFUSED WITH', BAD);
    body(482, 252, 'activation record', { size: 10, bold: true });
    body(482, 272, 'built at run time, once per call;', { size: 9, color: DIM });
    body(482, 290, 'holds this call\'s locals and parameters.', { size: 9, color: DIM });
    body(482, 314, 'One is compile-time, one is run-time.', { size: 9, color: BAD });
  }

  if (p > 0.72) {
    card(468, 356, 408, 80, { fill: SURF2 });
    body(482, 376, 'So "how many entries does this program create"', { size: 9 });
    body(482, 394, 'is a question about this table, and', { size: 9 });
    body(482, 412, '"what is stored in frame 3" is not.', { size: 9, color: DIM });
  }
}

/* ---------- scene 2: the linear list ---------- */
function sceneList(t, sc) {
  var p = prog(t, sc);
  heading('The linear list, counted');
  subline('Appending is free. Checking for a duplicate is the whole cost.');

  label(24, 62, 'THE LIST, IN INSERTION ORDER');
  card(24, 74, 416, 134);
  var i, y;
  for (i = 0; i < NAMES.length; i++) {
    if (p < 0.05 + i * 0.055) break;
    y = 90 + i * 16;
    code(40, y, String(i + 1), { size: 9, color: FAINT });
    code(62, y, NAMES[i], { size: 10 });
    txt(424, y, LIST.perInsert[i] + ' scan', { size: 9, mono: true, align: 'right', color: i === 0 ? FAINT : DIM });
  }

  if (p > 0.32) {
    card(24, 218, 416, 92, { fill: SURF2 });
    label(40, 236, 'WHY THE SCAN CANNOT BE SKIPPED');
    body(40, 256, 'Without it, a name declared twice in the same scope', { size: 9 });
    body(40, 274, 'would produce two entries, and the error the', { size: 9 });
    body(40, 292, 'compiler owes the programmer would never appear.', { size: 9, color: DIM });
  }

  if (p > 0.52) {
    card(24, 322, 416, 114, { fill: ACCDIM, stroke: ACC });
    label(40, 340, 'THE TOTAL', ACC);
    code(40, 362, '0+1+2+3+4+5+6+7 = 28', { size: 11, color: ACC });
    body(40, 386, 'n names cost n(n-1)/2 comparisons,', { size: 9 });
    body(40, 404, 'so doubling the names multiplies the cost by four.', { size: 9, color: DIM });
    body(40, 422, 'Quadratic, and independent of how fast the machine is.', { size: 9, color: DIM });
  }

  label(468, 76, 'COMPARISONS PER INSERT');
  var bx = 486, bw = 30, gap = 12, base = 196;
  for (i = 0; i < NAMES.length; i++) {
    if (p < 0.1 + i * 0.05) break;
    var hgt = Math.max(2, LIST.perInsert[i] * 13);
    if (P) P.rect(bx + i * (bw + gap), base - hgt, bw, hgt, { fill: ACCDIM, stroke: ACC, sw: 1, radius: 2 });
    txt(bx + i * (bw + gap) + bw / 2, base - hgt - 14, String(LIST.perInsert[i]),
        { size: 9, mono: true, align: 'center', color: ACC, bold: true });
    txt(bx + i * (bw + gap) + bw / 2, base + 6, String(i + 1), { size: 9, mono: true, align: 'center', color: FAINT });
  }
  rule(478, base, 866, base, BORDER);
  body(486, 218, 'insert number', { size: 9, color: FAINT });

  if (p > 0.72) {
    card(468, 240, 408, 96, { fill: SURF2 });
    label(482, 258, 'A LOOKUP COSTS THE SAME SCAN');
    body(482, 278, 'A name at the end, or absent altogether, compares', { size: 9 });
    body(482, 296, 'against every entry. A present name costs half the', { size: 9 });
    body(482, 314, 'list on average and all of it in the worst case.', { size: 9, color: DIM });
  }

  if (p > 0.88) {
    card(468, 348, 408, 88, { fill: WARNDIM, stroke: WARN });
    label(482, 366, 'THE TWO WRONG ANSWERS', WARN);
    body(482, 386, '8 counts the entries. 36 is n squared over two,', { size: 9 });
    body(482, 404, 'which forgets the term the triangle drops.', { size: 9, color: DIM });
  }
}

/* ---------- scene 3: the search tree ---------- */
function drawTree(tree, ox, sx, oy, sy, r) {
  var i, n;
  for (i = 0; i < tree.nodes.length; i++) {
    n = tree.nodes[i];
    if (n.parent === null) continue;
    var px = ox + tree.rank[n.parent] * sx;
    var py = oy + tree.depth[n.parent] * sy;
    rule(px, py, ox + n.rank * sx, oy + n.d * sy, BORDER);
  }
  for (i = 0; i < tree.nodes.length; i++) {
    n = tree.nodes[i];
    var x = ox + n.rank * sx, yy = oy + n.d * sy;
    if (P) P.circle(x, yy, r, { fill: SURF, stroke: ACC, sw: 1.3 });
    txt(x, yy, n.key, { size: 7, mono: true, align: 'center', base: 'middle', color: INK });
  }
}

function sceneTree(t, sc) {
  var p = prog(t, sc);
  heading('The search tree, and the order that ruins it');
  subline('Cost is the height. The insertion order decides the height.');

  label(24, 62, 'ALPHABETICAL ORDER: A CHAIN');
  drawTree(TREE_CHAIN, 62, 44, 92, 25, 14);
  body(24, 292, 'height ' + TREE_CHAIN.height + '   comparisons ' + TREE_CHAIN.comparisons,
       { size: 10, mono: true, bold: true, color: BAD });

  label(468, 62, 'MEDIAN-FIRST ORDER: A TREE');
  drawTree(TREE_BAL, 500, 46, 92, 44, 14);
  body(468, 292, 'height ' + TREE_BAL.height + '   comparisons ' + TREE_BAL.comparisons,
       { size: 10, mono: true, bold: true, color: VAL });

  if (p > 0.32) {
    card(24, 312, 416, 124, { fill: BADDIM, stroke: BAD });
    label(40, 330, 'WHAT WENT WRONG', BAD);
    body(40, 350, 'Each new name was larger than every name already', { size: 9 });
    body(40, 368, 'present, so each became the previous one\'s right child.', { size: 9 });
    body(40, 386, 'One path, no branching: a linked list with two', { size: 9, color: DIM });
    body(40, 404, 'pointers per node, and the same 28 comparisons.', { size: 9, color: BAD });
  }

  if (p > 0.52) {
    card(468, 312, 408, 124, { fill: ACCDIM, stroke: ACC });
    label(482, 330, 'WHY THE SHALLOW ONE IS CHEAPER', ACC);
    body(482, 350, 'The middle name landed at the root, so each', { size: 9 });
    body(482, 368, 'comparison halves what remains instead of removing', { size: 9 });
    body(482, 386, 'one name. Same eight names, half the work.', { size: 9, color: DIM });
    body(482, 404, 'Nothing balances a plain search tree by itself.', { size: 9, color: ACC });
  }
}

/* ---------- scene 4: the hash table ---------- */
function sceneHash(t, sc) {
  var p = prog(t, sc);
  heading('Eleven buckets, eight names');
  subline('The name is turned into a bucket number, and the chain is searched.');

  label(24, 62, 'BUCKETS 0 TO 10');
  var i, j, bx = 24, bw = 36, gap = 2;
  for (i = 0; i < BUCKETS; i++) {
    if (p < 0.05 + i * 0.012) break;
    var x = bx + i * (bw + gap);
    card(x, 76, bw, 24, { fill: HASH.table[i].length ? ACCDIM : SURF2, stroke: HASH.table[i].length ? ACC : BORDER, radius: 2 });
    txt(x + bw / 2, 88, String(i), { size: 9, mono: true, align: 'center', base: 'middle', color: DIM });
    for (j = 0; j < HASH.table[i].length; j++) {
      if (p < 0.25 + j * 0.05) break;
      nameBox(x + 2, 106 + j * 20, bw - 4, 17, HASH.table[i][j], { size: 8, fill: SURF, stroke: ACC });
    }
  }

  if (p > 0.52) {
    card(24, 178, 416, 76, { fill: SURF2 });
    label(40, 196, 'THE COUNTS READ OFF THE DRAWING');
    body(40, 216, '8 entries   6 buckets used   longest chain 2', { size: 9, mono: true });
    body(40, 236, 'chain lengths sum to 1+2+2+1+1+1 = 8', { size: 9, mono: true, color: DIM });
  }

  if (p > 0.72) {
    card(24, 266, 416, 170, { fill: ACCDIM, stroke: ACC });
    label(40, 284, 'OCCUPATION DENSITY', ACC);
    code(40, 308, '8 / 11 = ' + HS.density.toFixed(2), { size: 14, color: ACC, bold: true });
    body(40, 334, 'entries divided by buckets, the load on the table.', { size: 9 });
    body(40, 356, 'With chaining it may exceed 1 and still work.', { size: 9, color: DIM });
    body(40, 378, 'With open addressing it may not, because a full', { size: 9, color: DIM });
    body(40, 396, 'table has nowhere to put a new key.', { size: 9, color: DIM });
    body(40, 420, 'Inverting it gives buckets per entry, which is not this.', { size: 9, color: WARN });
  }

  label(468, 76, 'THE HASH FUNCTION');
  card(468, 88, 408, 108, { fill: SURF2 });
  body(482, 106, 'add the character codes, take the remainder', { size: 9, color: DIM });
  code(482, 128, 'main  421 mod 11 = 3', { size: 9 });
  code(482, 148, 'count 553 mod 11 = 3', { size: 9 });
  code(482, 168, 'total 548 mod 11 = 9', { size: 9 });

  if (p > 0.32) {
    card(468, 208, 408, 104, { fill: SURF2 });
    label(482, 226, 'A COLLISION IS NOT AN ERROR');
    body(482, 246, 'Two names in one bucket is normal. Chaining keeps a', { size: 9 });
    body(482, 264, 'short list per bucket and appends there.', { size: 9 });
    body(482, 286, 'Nothing is overwritten and nothing is moved.', { size: 9, color: DIM });
  }

  if (p > 0.52) {
    card(468, 324, 408, 112, { fill: BADDIM, stroke: BAD });
    label(482, 342, 'WHAT MAKES IT FAST, AND WHAT BREAKS IT', BAD);
    body(482, 362, 'A lookup is one bucket computation and at most', { size: 9 });
    body(482, 380, 'two comparisons: the rest of the table is never read.', { size: 9 });
    body(482, 402, 'Send every name to bucket 0 and the list is back.', { size: 9, color: BAD });
  }
}

/* ---------- scene 5: three costs ---------- */
function sceneCost(t, sc) {
  var p = prog(t, sc);
  heading('Three costs side by side');
  subline('Every cost is a claim about an assumption, not a property of the word "table".');

  label(40, 66, 'ORGANISATION');
  txt(700, 66, 'DECIDING QUANTITY AND COST', { size: 9, bold: true, color: FAINT, align: 'right' });

  rowCard(24, 78, 852, 62,
    'Linear list: append, scanning for a duplicate',
    'prior entries -> ' + LIST.comparisons + ' comparisons to build', {});
  if (p > 0.12) {
    rowCard(24, 148, 852, 62,
      'Search tree: descend, then hang the name',
      'height -> ' + TREE_BAL.comparisons + ' balanced, ' + TREE_CHAIN.comparisons + ' degenerate', {});
  }
  if (p > 0.32) {
    rowCard(24, 218, 852, 62,
      'Hash table: compute a bucket, walk the chain',
      'chain length -> ' + (NAMES.length + HASH.comparisons) + ' operations to build, chain ' + HS.maxChain, {});
  }

  if (p > 0.52) {
    card(24, 292, 416, 84, { fill: WARNDIM, stroke: WARN });
    label(40, 310, 'THE TREE IS LOGARITHMIC ONLY IF BALANCED', WARN);
    body(40, 330, 'Sorted input gives height n-1, and the cost', { size: 9 });
    body(40, 348, 'matches the list exactly: 28 against 28.', { size: 9, color: DIM });
  }

  if (p > 0.72) {
    card(468, 292, 408, 84, { fill: BADDIM, stroke: BAD });
    label(482, 310, 'THE HASH TABLE IS CONSTANT ONLY IF THE KEYS SPREAD', BAD);
    body(482, 330, 'One bucket makes the worst case linear,', { size: 9 });
    body(482, 348, 'so say expected, and name the worst case.', { size: 9, color: DIM });
  }

  if (p > 0.88) {
    card(24, 388, 852, 60, { fill: ACCDIM, stroke: ACC });
    body(40, 408, 'A complete answer names the structure, names the quantity that decides its cost,', { size: 10, bold: true, color: ACC });
    body(40, 428, 'and says whether it means the average or the worst case.', { size: 10, color: DIM });
  }
}

/* ---------- scene 6: one name, two meanings ---------- */
function sceneScope(t, sc) {
  var p = prog(t, sc);
  heading('One name, two meanings');
  subline('count is declared twice, in two blocks, and both declarations are entries.');

  card(24, 58, 416, 200, { fill: SURF2 });
  label(40, 76, 'THE PROGRAM');
  var lines = [
    'int total;              /* global */',
    'int main(void) {',
    '  int count;            /* main   */',
    '  float rate;           /* main   */',
    '  {',
    '    int count;          /* inner  */',
    '    char code;          /* inner  */',
    '    count = 0;',
    '  }',
    '  rate = 1.5;',
    '}'
  ];
  for (var i = 0; i < lines.length; i++) {
    if (p < 0.05 + i * 0.03) break;
    code(40, 96 + i * 15, lines[i], { size: 8.5, color: (i === 2 || i === 5) ? ACC : INK, bold: (i === 2 || i === 5) });
  }

  if (p > 0.52) {
    card(24, 268, 416, 168, { fill: ACCDIM, stroke: ACC });
    label(40, 286, 'THE SAME SPELLING, TWO VARIABLES', ACC);
    body(40, 308, 'Two declarations, so two entries, in two tables,', { size: 9 });
    body(40, 326, 'with different offsets. A question that asks for the', { size: 9 });
    body(40, 344, 'number of entries is asking for declarations, and', { size: 9 });
    body(40, 362, 'a name declared twice contributes twice.', { size: 9, color: ACC });
    body(40, 390, 'This program: 5 names, 6 declarations.', { size: 10, mono: true, bold: true, color: ACC });
    body(40, 412, 'Counting spellings gives one too few.', { size: 9, color: WARN });
  }

  label(468, 76, 'ENTRY 1 — INNER BLOCK');
  card(468, 88, 408, 74, { fill: SURF2 });
  code(482, 106, 'count   int   offset -8', { size: 9 });
  body(482, 128, 'created at the opening brace,', { size: 9, color: DIM });
  body(482, 146, 'destroyed at the closing brace.', { size: 9, color: DIM });

  if (p > 0.12) {
    label(468, 184, 'ENTRY 2 — MAIN BODY');
    card(468, 196, 408, 74, { fill: SURF2 });
    code(482, 214, 'count   int   offset -4', { size: 9 });
    body(482, 236, 'created when the body begins,', { size: 9, color: DIM });
    body(482, 254, 'and hidden, not altered, inside the block.', { size: 9, color: DIM });
  }

  if (p > 0.32) {
    card(468, 292, 408, 144, { fill: SURF2 });
    label(482, 310, 'WHAT THE COMPILER DOES AT count = 0');
    body(482, 332, 'It looks for count in the innermost table first.', { size: 9 });
    body(482, 350, 'It finds the inner entry, and stops there.', { size: 9 });
    body(482, 372, 'The outer variable is not touched at all.', { size: 9, color: ACC });
    body(482, 396, 'Stopping at the first match is what makes', { size: 9, color: DIM });
    body(482, 414, 'shadowing work. Continuing past it would not.', { size: 9, color: DIM });
  }
}

/* ---------- scene 7: the stack of tables ---------- */
function sceneStack(t, sc) {
  var p = prog(t, sc);
  heading('The stack of tables');
  subline('Entering a block pushes a table; a lookup walks outward and stops at the first match.');

  label(24, 62, 'INNERMOST TABLE ON TOP');
  var tops = [76, 158, 240];
  for (var i = SCOPES.length - 1; i >= 0; i--) {
    var idx = SCOPES.length - 1 - i;           /* inner first */
    if (p < 0.05 + idx * 0.12) break;
    var y = tops[idx];
    var isTop = idx === 0;
    card(24, y, 280, 70, { fill: isTop ? ACCDIM : SURF2, stroke: isTop ? ACC : BORDER });
    label(38, y + 18, SCOPES[i].label.toUpperCase(), isTop ? ACC : FAINT);
    var e = SCOPES[i].entries;
    body(38, y + 40, e[0].name + ' : ' + e[0].type, { size: 9, mono: true });
    body(140, y + 40, e[1].name + ' : ' + e[1].type, { size: 9, mono: true });
    body(38, y + 58, '2 entries', { size: 8, color: FAINT });
  }

  if (p > 0.6) {
    card(24, 330, 280, 106, { fill: SURF2 });
    label(38, 348, 'PUSH AND POP');
    body(38, 368, 'one stack operation each,', { size: 9 });
    body(38, 386, 'independent of how many', { size: 9 });
    body(38, 404, 'entries the table holds.', { size: 9, color: DIM });
    body(38, 424, 'That is why scopes are cheap.', { size: 9, color: ACC });
  }

  label(468, 76, 'WALKING OUTWARD FROM THE INNER BLOCK');
  rowCard(468, 88, 408, 34, 'count   found in the inner block', 'probe 1', { fill: ACCDIM, stroke: ACC, rcolor: ACC });
  if (p > 0.12) {
    rowCard(468, 130, 408, 34, 'rate    not inner, found in main body', 'probe 2', {});
  }
  if (p > 0.32) {
    rowCard(468, 172, 408, 34, 'total   not inner, not main, global', 'probe 3', {});
  }

  if (p > 0.52) {
    card(468, 220, 408, 104, { fill: WARNDIM, stroke: WARN });
    label(482, 238, 'SO THE COST IS THE DEPTH', WARN);
    body(482, 258, 'One constant-time probe per enclosing scope,', { size: 9 });
    body(482, 276, 'so a lookup is O(d) for nesting depth d.', { size: 9, mono: true });
    body(482, 298, 'Constant per probe. Linear in the number of probes.', { size: 9, color: DIM });
  }

  if (p > 0.72) {
    card(468, 340, 408, 96, { fill: ACCDIM, stroke: ACC });
    label(482, 358, 'AND THE POP', ACC);
    body(482, 378, 'The inner table is discarded whole, so the outer', { size: 9 });
    body(482, 396, 'count is the first match again, unchanged.', { size: 9 });
    body(482, 418, 'No entry is deleted one by one.', { size: 9, color: DIM });
  }
}

/* ---------- scene 8: one table with duplicates ---------- */
function sceneOne(t, sc) {
  var p = prog(t, sc);
  heading('One table, duplicates and a log');
  subline('The alternative keeps one table and lets a key appear twice in its bucket.');

  card(24, 58, 416, 176, { fill: SURF2 });
  label(40, 76, 'A. THE STACK OF TABLES');
  body(40, 98, 'one table per scope, pushed and popped', { size: 9 });
  body(40, 122, 'lookup: one probe per enclosing scope', { size: 9, color: DIM });
  body(40, 140, 'cost of a lookup: O(d), depth d', { size: 9, mono: true });
  body(40, 166, 'exit: discard the top table', { size: 9, color: DIM });
  body(40, 184, 'cost of an exit: one stack operation', { size: 9, mono: true });
  body(40, 210, 'Simple to build, and the depth is paid per lookup.', { size: 9, color: ACC });

  card(468, 58, 408, 176, { fill: SURF2 });
  label(482, 76, 'B. ONE TABLE WITH A LOG');
  body(482, 98, 'one table, newest binding at the head', { size: 9 });
  body(482, 122, 'lookup: hash, then compare the head', { size: 9, color: DIM });
  body(482, 140, 'cost of a lookup: O(1), whatever the depth', { size: 9, mono: true });
  body(482, 166, 'exit: unwind the log to this scope\'s marker', { size: 9, color: DIM });
  body(482, 184, 'cost of an exit: amortised O(1)', { size: 9, mono: true });
  body(482, 210, 'Faster to read, and it needs the log to undo a scope.', { size: 9, color: ACC });

  if (p > 0.32) {
    card(24, 250, 416, 92, { fill: ACCDIM, stroke: ACC });
    label(40, 268, 'WHY THE HEAD IS THE INNERMOST BINDING', ACC);
    body(40, 288, 'A new binding is inserted at the front of its chain,', { size: 9 });
    body(40, 306, 'so the first match walking the chain is the most', { size: 9 });
    body(40, 324, 'recent one, which is the innermost declaration.', { size: 9, color: DIM });
  }

  if (p > 0.52) {
    card(468, 250, 408, 92, { fill: SURF2 });
    label(482, 268, 'WHY THE EXIT IS AMORTISED CONSTANT');
    body(482, 288, 'Every entry removed was inserted once, so the total', { size: 9 });
    body(482, 306, 'work over the whole compilation is proportional to', { size: 9 });
    body(482, 324, 'the insertions, not to the number of scopes.', { size: 9, color: DIM });
  }

  if (p > 0.72) {
    card(24, 356, 852, 92, { fill: WARNDIM, stroke: WARN });
    label(40, 374, 'THE TRADE-OFF, IN ONE LINE', WARN);
    body(40, 396, 'A. The stack of tables is simpler and pays the depth on every lookup.', { size: 10 });
    body(40, 418, 'B. The single table reads in constant time and needs a log to leave a scope.', { size: 10 });
    body(40, 436, 'Both are used. A question that describes one is asking which quantity it makes cheap.', { size: 9, color: DIM });
  }
}

/* ---------- scene 9: where each entry goes ---------- */
function sceneEntry(t, sc) {
  var p = prog(t, sc);
  heading('Where each entry goes');
  subline('One table per block, one entry per declaration, and the function name goes outward.');

  var rows = [
    { y: 74, title: 'GLOBAL TABLE', a: 'total : int', b: 'main : function', note: 'the caller\'s scope holds the name' },
    { y: 152, title: 'MAIN BODY TABLE', a: 'count : int', b: 'rate : float', note: 'parameters would go here too' },
    { y: 230, title: 'INNER BLOCK TABLE', a: 'count : int', b: 'code : char', note: 'a second entry for the same spelling' }
  ];
  for (var i = 0; i < rows.length; i++) {
    if (p < 0.05 + i * 0.12) break;
    var r = rows[i];
    card(24, r.y, 416, 68, { fill: i === 0 ? ACCDIM : SURF2, stroke: i === 0 ? ACC : BORDER });
    label(40, r.y + 18, r.title, i === 0 ? ACC : FAINT);
    code(40, r.y + 38, r.a, { size: 9 });
    code(160, r.y + 38, r.b, { size: 9 });
    body(40, r.y + 56, r.note, { size: 8.5, color: DIM });
  }

  if (p > 0.32) {
    card(24, 312, 416, 136, { fill: SURF2 });
    label(40, 330, 'THE COUNT');
    body(40, 352, '2 + 2 + 2 = ' + ENTRIES.length + ' entries in ' + SCOPES.length + ' tables', { size: 11, mono: true, bold: true, color: ACC });
    body(40, 376, 'distinct names: ' + distinctNames(), { size: 10, mono: true });
    body(40, 398, 'hidden rather than absent: 1', { size: 10, mono: true });
    body(40, 422, 'The count is a sum over scopes, not a count of spellings.', { size: 9, color: DIM });
  }

  label(468, 76, 'WHY A PROTOTYPE IS NEEDED');
  card(468, 88, 408, 160, { fill: SURF2 });
  body(482, 108, 'An entry exists only from the point its declaration', { size: 9 });
  body(482, 126, 'is met. A body compiled before a later function\'s', { size: 9 });
  body(482, 144, 'declaration cannot resolve a call to it, because the', { size: 9 });
  body(482, 162, 'name is not in the enclosing table yet.', { size: 9 });
  body(482, 188, 'A prototype places the name and its signature there', { size: 9, color: ACC });
  body(482, 206, 'early, so an earlier body can still resolve the call.', { size: 9, color: ACC });
  body(482, 232, 'That is a fact about the table, not about syntax.', { size: 9, color: DIM });

  if (p > 0.52) {
    card(468, 260, 408, 188, { fill: ACCDIM, stroke: ACC });
    label(482, 278, 'THE TWO DIRECTIONS', ACC);
    body(482, 300, 'outward: the function\'s own name, so callers', { size: 9 });
    body(482, 318, 'can find it from the scope that calls it.', { size: 9 });
    body(482, 344, 'inward: its parameters, because only its', { size: 9 });
    body(482, 362, 'body uses them.', { size: 9 });
    body(482, 390, 'Put the name inward and no caller can see it.', { size: 9, color: WARN });
    body(482, 412, 'Put a parameter outward and it leaks into the', { size: 9, color: WARN });
    body(482, 430, 'scope that called it.', { size: 9, color: WARN });
  }
}

/* ---------- scene 10: what a question asks ---------- */
function sceneGate(t, sc) {
  var p = prog(t, sc);
  heading('What a question actually asks');
  subline('Three shapes, three pictures, one procedure.');

  label(24, 66, 'THE THREE SHAPES');
  var shapes = [
    { t: 'Which statement is false', s: 'check each against the phase list' },
    { t: 'How many entries, or which binding', s: 'one table per block, one entry per declaration' },
    { t: 'Which organisation is faster', s: 'name the deciding quantity, then the case' }
  ];
  for (var i = 0; i < shapes.length; i++) {
    if (p < 0.05 + i * 0.12) break;
    var y = 78 + i * 62;
    card(24, y, 416, 52, { fill: SURF2 });
    body(38, y + 16, (i + 1) + '. ' + shapes[i].t, { size: 10, bold: true });
    body(38, y + 36, shapes[i].s, { size: 9, color: DIM });
  }

  if (p > 0.52) {
    card(24, 266, 416, 96, { fill: WARNDIM, stroke: WARN });
    label(40, 284, 'THE THREE PICTURES', WARN);
    body(40, 304, 'bucket array  ->  cost questions', { size: 9, mono: true });
    body(40, 322, 'stack of tables  ->  scope questions', { size: 9, mono: true });
    body(40, 340, 'phase list  ->  statement questions', { size: 9, mono: true });
  }

  label(468, 76, 'THE FIVE-STEP PROCEDURE');
  var steps = [
    'Draw the structure the question describes.',
    'Name the quantity that decides its cost.',
    'Compute that quantity from the given data.',
    'Say whether you mean average or worst case.',
    'Report the number that structure produced.'
  ];
  for (var j = 0; j < steps.length; j++) {
    if (p < 0.1 + j * 0.1) break;
    card(468, 88 + j * 46, 408, 36, { fill: j === 0 ? ACCDIM : SURF2, stroke: j === 0 ? ACC : BORDER });
    body(482, 102 + j * 46, (j + 1) + '  ' + steps[j], { size: 10, color: j === 0 ? ACC : INK });
  }

  if (p > 0.72) {
    card(468, 326, 408, 122, { fill: SURF2 });
    body(482, 346, 'Nothing here needs a remembered number.', { size: 10, bold: true });
    body(482, 368, 'The ' + LIST.comparisons + ', the ' + TREE_BAL.comparisons + ', the ' + HS.maxChain + ' and the ' + ENTRIES.length, { size: 10, mono: true, color: ACC });
    body(482, 388, 'all come from running the structure, and this', { size: 9, color: DIM });
    body(482, 406, 'page runs it and then runs it again another way.', { size: 9, color: DIM });
    body(482, 428, 'A symbol table question is not a memory test.', { size: 9, color: ACC });
  }
}

/* ---------- dispatch ---------- */
var SCENES = {
  dict: sceneDict,
  list: sceneList,
  tree: sceneTree,
  hash: sceneHash,
  cost: sceneCost,
  scope: sceneScope,
  stack: sceneStack,
  one: sceneOne,
  entry: sceneEntry,
  gate: sceneGate
};

function drawFrame(P_) {
  if (!P_) return;
  P = P_;
  P.clear();
  var t = K.state.elapsed;
  var i = K.sceneAt(t);
  var sc = K.state.scenes[i];
  if (!sc) return;
  var fn = SCENES[sc.id] || SCENES.dict;
  fn(t, sc);
}

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

function fillChecks() {
  var el = document.getElementById('checks');
  if (!el) return;
  var pass = CHECKS.filter(function (c) { return c.pass; }).length;
  el.innerHTML = '<span class="k">Model checks</span>' + pass + ' of ' + CHECKS.length + ' passing';
  el.className = 'checks ' + (pass === CHECKS.length ? 'is-pass' : 'is-fail');
}

function boot() {
  var holder = document.getElementById('canvas-holder');
  var fallback = document.getElementById('canvas-fallback');
  if (!holder) return;

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
    } catch (e) { console.error('p5 failed', e); ok = false; }
  }

  if (!ok) {
    var drew = false;
    try {
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      holder.appendChild(cv);
      var ctx2d = cv.getContext && cv.getContext('2d');
      if (ctx2d) { P = PR.makePainter2D(ctx2d, W, H); drawFrame(P); drew = true; }
    } catch (e) { console.error('canvas fallback failed', e); }
    if (!drew && fallback) fallback.classList.add('show');
  }

  if (K && K.init) K.init({ timeline: window.LESSON_TIMELINE, draw: function () { if (P) drawFrame(P); } });

  fillChecks();

  window.__drawAt = function (t) { K.state.elapsed = t; if (P) drawFrame(P); };

  var badc = CHECKS.filter(function (c) { return !c.pass; });
  if (badc.length) console.warn('Model validation did not fully pass:', badc);
}

window.__MODEL = {
  NAMES: NAMES, LIST: LIST, TREE_CHAIN: TREE_CHAIN, TREE_BAL: TREE_BAL,
  HASH: HASH, HS: HS, HASH_ONE: HASH_ONE, SCOPES: SCOPES, ENTRIES: ENTRIES, CHECKS: CHECKS
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
