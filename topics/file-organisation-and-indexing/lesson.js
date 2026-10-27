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
   LAYER 1 - THE MODEL.
   A B+ tree and a B-tree, implemented here, plus the fan-out arithmetic.
   Pure data and pure functions: no drawing. Every number the lesson quotes
   is computed in this layer, and the checks at the end re-verify each
   computed value against the definition it came from.

   Node parameters are given by the minimum degree t, the form in which the
   occupancy rules are least ambiguous:
     maximum keys per node = 2t - 1      minimum keys (non-root) = t - 1
   Separator convention: keys[j] = smallest key in the subtree of
   children[j+1]  (the "copy the smallest key of the new right node up" rule).
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- B+ tree ---------- */
function bpLeaf() { return { leaf: true, keys: [], next: null }; }
function bpNode() { return { leaf: false, keys: [], children: [] }; }
function bpMin(n) { return n.leaf ? n.keys[0] : bpMin(n.children[0]); }
function bpRefresh(n) { if (!n.leaf) n.keys = n.children.slice(1).map(bpMin); }
function bpHeight(n) { var h = 1; while (!n.leaf) { n = n.children[0]; h++; } return h; }

function bpClone(root) {
  var map = new Map();
  function cl(n) {
    if (!n) return null;
    if (map.has(n)) return map.get(n);
    var m = n.leaf ? { leaf: true, keys: n.keys.slice(), next: null }
                   : { leaf: false, keys: n.keys.slice(), children: [] };
    map.set(n, m);
    if (n.leaf) m.next = n.next ? cl(n.next) : null;
    else m.children = n.children.map(cl);
    return m;
  }
  return cl(root);
}

function bpInsert(root, key, t) {
  var maxKeys = 2 * t - 1, splits = 0, path = [], n = root;
  while (!n.leaf) {
    var i = 0; while (i < n.keys.length && key >= n.keys[i]) i++;
    path.push({ node: n, i: i });
    n = n.children[i];
  }
  var pos = 0; while (pos < n.keys.length && n.keys[pos] < key) pos++;
  if (n.keys[pos] === key) return { root: root, splits: 0, dup: true };
  n.keys.splice(pos, 0, key);
  if (n.keys.length <= maxKeys) return { root: root, splits: 0 };

  var mid = Math.ceil(n.keys.length / 2);
  var right = bpLeaf();
  right.keys = n.keys.slice(mid);
  right.next = n.next;
  n.keys = n.keys.slice(0, mid);
  n.next = right;
  splits++;
  var sep = right.keys[0], newNode = right;

  for (;;) {
    if (path.length === 0) {
      var nr = bpNode(); nr.keys = [sep]; nr.children = [root, newNode];
      return { root: nr, splits: splits, rootSplit: true };
    }
    var fr = path.pop(), parent = fr.node;
    parent.children.splice(fr.i + 1, 0, newNode);
    bpRefresh(parent);
    if (parent.keys.length <= maxKeys) return { root: root, splits: splits };
    var C = parent.children, Kk = parent.keys;
    var leftK = Kk.slice(0, t - 1), leftC = C.slice(0, t);
    var rightK = Kk.slice(t), rightC = C.slice(t);
    var rn = bpNode(); rn.keys = rightK; rn.children = rightC;
    parent.keys = leftK; parent.children = leftC;
    splits++;
    sep = bpMin(rn);
    newNode = rn;
  }
}

function bpDelete(root, key, t, log) {
  var minK = t - 1, stack = [], n = root;
  while (!n.leaf) {
    var i = 0; while (i < n.keys.length && key >= n.keys[i]) i++;
    stack.push({ node: n, i: i });
    n = n.children[i];
  }
  var p = n.keys.indexOf(key);
  if (p < 0) return { root: root, deleted: false };
  n.keys.splice(p, 1);
  if (n === root) return { root: root, deleted: true };

  var child = n;
  while (stack.length) {
    var fr = stack.pop(), parent = fr.node, ci = fr.i;
    bpRefresh(parent);
    if (child.keys.length >= minK) continue;

    var sibR = parent.children[ci + 1], sibL = parent.children[ci - 1];
    if (sibR && sibR.keys.length > minK) {
      if (child.leaf) { child.keys.push(sibR.keys.shift()); }
      else { child.children.push(sibR.children.shift()); }
      bpRefresh(sibR);
      if (log) log.push('borrow-right');
    } else if (sibL && sibL.keys.length > minK) {
      if (child.leaf) { child.keys.unshift(sibL.keys.pop()); }
      else { child.children.unshift(sibL.children.pop()); }
      bpRefresh(sibL);
      if (log) log.push('borrow-left');
    } else if (sibR) {
      if (child.leaf) { child.keys = child.keys.concat(sibR.keys); child.next = sibR.next; }
      else { child.children = child.children.concat(sibR.children); }
      parent.children.splice(ci + 1, 1);
      if (log) log.push('merge-right');
    } else if (sibL) {
      if (child.leaf) { sibL.keys = sibL.keys.concat(child.keys); sibL.next = child.next; child = sibL; }
      else { sibL.children = sibL.children.concat(child.children); child = sibL; }
      parent.children.splice(ci, 1);
      if (log) log.push('merge-left');
    }
    bpRefresh(parent);
    if (parent === root && parent.keys.length === 0 && parent.children.length === 1) {
      if (log) log.push('root-collapse');
      return { root: parent.children[0], deleted: true };
    }
  }
  return { root: root, deleted: true };
}

/* Full structural validation: returns a list of violations, empty if sound. */
function bpValidate(root, t, expected) {
  var v = [], maxKeys = 2 * t - 1, minK = t - 1;
  var leaves = [], depth0 = -1;
  (function walk(n, d) {
    if (n.leaf) {
      if (depth0 < 0) depth0 = d;
      else if (d !== depth0) v.push('leaf at depth ' + d + ', expected ' + depth0);
      leaves.push(n);
      if (n.keys.length > maxKeys) v.push('leaf overfull: ' + n.keys.length);
      for (var k = 1; k < n.keys.length; k++) if (n.keys[k - 1] >= n.keys[k]) v.push('leaf keys out of order');
      return;
    }
    if (n.children.length !== n.keys.length + 1) v.push('internal arity ' + n.children.length + ' for ' + n.keys.length + ' keys');
    if (n.keys.length > maxKeys) v.push('internal overfull: ' + n.keys.length);
    for (var j = 0; j < n.keys.length; j++) {
      if (n.keys[j] !== bpMin(n.children[j + 1])) {
        v.push('separator ' + j + ' is ' + n.keys[j] + ', right subtree starts at ' + bpMin(n.children[j + 1]));
      }
    }
    for (var c = 0; c < n.children.length; c++) walk(n.children[c], d + 1);
  })(root, 0);
  if (!root.leaf && root.keys.length === 0) v.push('root has no keys but has children');
  if (!root.leaf && root.children.length < 2) v.push('root is internal with one child');
  (function occ(n, isRoot) {
    if (!isRoot && n.keys.length < minK) v.push('underfull node with ' + n.keys.length + ' keys');
    if (!n.leaf) n.children.forEach(function (c) { occ(c, false); });
  })(root, true);
  var chain = [];
  for (var i = 0; i < leaves.length; i++) {
    chain = chain.concat(leaves[i].keys);
    if (i < leaves.length - 1 && leaves[i].next !== leaves[i + 1]) v.push('leaf chain broken at leaf ' + i);
  }
  if (leaves.length && leaves[leaves.length - 1].next) v.push('last leaf carries a next pointer');
  for (var q = 1; q < chain.length; q++) if (chain[q - 1] >= chain[q]) v.push('leaf chain not ascending');
  var sorted = expected.slice().sort(function (a, b) { return a - b; });
  if (chain.join(',') !== sorted.join(',')) v.push('leaf keys differ from the inserted set');
  return v;
}

function bpKeyCopies(root) {
  var total = 0;
  (function walk(n) { total += n.keys.length; if (!n.leaf) n.children.forEach(walk); })(root);
  return total;
}
function bpInternalKeys(root) {
  var total = 0;
  (function walk(n) { if (!n.leaf) { total += n.keys.length; n.children.forEach(walk); } })(root);
  return total;
}
function bpLeaves(root) { var out = []; (function walk(n) { if (n.leaf) out.push(n); else n.children.forEach(walk); })(root); return out; }
function bpNodes(root) { var c = 0; (function walk(n) { c++; if (!n.leaf) n.children.forEach(walk); })(root); return c; }

function bpSearch(root, key) {
  var n = root, fetched = 1;
  while (!n.leaf) { var i = 0; while (i < n.keys.length && key >= n.keys[i]) i++; n = n.children[i]; fetched++; }
  return { found: n.keys.indexOf(key) >= 0, fetched: fetched, leaf: n.keys.slice() };
}

function bpRange(root, lo, hi) {
  var n = root, fetched = 1, path = [n];
  while (!n.leaf) { var i = 0; while (i < n.keys.length && lo >= n.keys[i]) i++; n = n.children[i]; path.push(n); fetched++; }
  var got = [], leaves = 0, chainNodes = [];
  while (n) {
    leaves++; chainNodes.push(n);
    for (var k = 0; k < n.keys.length; k++) if (n.keys[k] >= lo && n.keys[k] < hi) got.push(n.keys[k]);
    if (n.keys.length && n.keys[0] >= hi) break;
    n = n.next;
    if (n) fetched++;
  }
  return { keys: got, fetched: fetched, leaves: leaves, descent: path, chain: chainNodes };
}

/* ---------- B-tree, for the comparison ---------- */
function btNode(leaf) { return { leaf: !!leaf, keys: [], children: [] }; }
function btHeight(n) { var h = 1; while (!n.leaf) { n = n.children[0]; h++; } return h; }
function btInsert(root, key, t) {
  var maxKeys = 2 * t - 1;
  if (root.keys.length === maxKeys) {
    var s = btNode(false); s.children.push(root); btSplit(s, 0, t); root = s;
  }
  var n = root;
  for (;;) {
    if (n.leaf) {
      var pos = 0; while (pos < n.keys.length && n.keys[pos] < key) pos++;
      n.keys.splice(pos, 0, key); return root;
    }
    var i = 0; while (i < n.keys.length && key >= n.keys[i]) i++;
    if (n.children[i].keys.length === maxKeys) { btSplit(n, i, t); if (key >= n.keys[i]) i++; }
    n = n.children[i];
  }
}
function btSplit(parent, i, t) {
  var y = parent.children[i];
  var z = btNode(y.leaf);
  z.keys = y.keys.splice(t);
  if (!y.leaf) z.children = y.children.splice(t);
  parent.keys.splice(i, 0, y.keys.pop());
  parent.children.splice(i + 1, 0, z);
}
function btAllKeys(n, out) {
  out = out || [];
  for (var i = 0; i < n.keys.length; i++) { if (!n.leaf) btAllKeys(n.children[i], out); out.push(n.keys[i]); }
  if (!n.leaf) btAllKeys(n.children[n.keys.length], out);
  return out;
}
function btValidate(root, t, expected) {
  var v = [], maxKeys = 2 * t - 1, minK = t - 1, d0 = -1;
  (function walk(n, d, isRoot) {
    if (n.leaf) { if (d0 < 0) d0 = d; else if (d !== d0) v.push('bt leaves at different depths'); }
    else if (n.children.length !== n.keys.length + 1) v.push('bt arity');
    if (!isRoot && n.keys.length < minK) v.push('bt underfull');
    if (n.keys.length > maxKeys) v.push('bt overfull');
    for (var k = 1; k < n.keys.length; k++) if (n.keys[k - 1] >= n.keys[k]) v.push('bt keys unsorted');
    if (!n.leaf) n.children.forEach(function (c) { walk(c, d + 1, false); });
  })(root, 0, true);
  var got = btAllKeys(root).sort(function (a, b) { return a - b; });
  var exp = expected.slice().sort(function (a, b) { return a - b; });
  if (got.join(',') !== exp.join(',')) v.push('bt key set differs');
  return v;
}

/* ---------- fan-out arithmetic ---------- */
function internalOrder(block, keySize, ptrSize) { return Math.floor((block + keySize) / (keySize + ptrSize)); }
function leafEntries(block, keySize, recordPtr, nextPtr) { return Math.floor((block - nextPtr) / (keySize + recordPtr)); }
function minKeysFromMax(maxKeys) { return Math.ceil(maxKeys / 2) - 1; }
function indexLevels(records, leafCap, order) {
  var nodes = Math.ceil(records / leafCap), levels = 1;
  while (nodes > 1) { nodes = Math.ceil(nodes / order); levels++; }
  return levels;
}
function maxKeysAtHeight(p, h) { return (p - 1) * Math.pow(p, h - 1); }
function minKeysAtHeight(p, h) {
  var minPtr = Math.ceil(p / 2);
  return Math.pow(minPtr, h - 1) * (minPtr - 1);
}

/* ---------- the GATE 2015 Set 2 index, rebuilt from its stated shape ---------- */
function gate2015Tree() {
  function leaf(keys, next) { var n = bpLeaf(); n.keys = keys; n.next = next || null; return n; }
  var l13 = leaf([13, 15]);
  var l9 = leaf([9, 11], l13);
  var l5 = leaf([5, 7], l9);
  var l1 = leaf([1, 3], l5);
  var n13 = bpNode(); n13.children = [l9, l13]; bpRefresh(n13);
  var n5 = bpNode(); n5.children = [l1, l5]; bpRefresh(n5);
  var root = bpNode(); root.children = [n5, n13]; bpRefresh(root);
  return root;
}

/* ======================================================================
   LAYER 2 - THE VALUES. Everything the render layer is allowed to print.
   ====================================================================== */

var SEQ = [10, 20, 30, 40, 50, 60, 70, 80, 90];
var T = 2;                       // minimum degree: max 3 keys, min 1 key
var ORDER = 2 * T;               // maximum children

/* build the main tree, recording a snapshot after every insertion */
var mainTree = bpLeaf();
var INS = [];
var splitsTotal = 0;
SEQ.forEach(function (k, idx) {
  var res = bpInsert(mainTree, k, T);
  mainTree = res.root;
  splitsTotal += res.splits;
  INS.push({
    key: k, splits: res.splits, rootSplit: !!res.rootSplit,
    height: bpHeight(mainTree), nodes: bpNodes(mainTree),
    copies: bpKeyCopies(mainTree), snapshot: bpClone(mainTree),
    inserted: SEQ.slice(0, idx + 1)
  });
});

/* the same keys in a B-tree, for the comparison scene */
var btTree = btNode(true);
SEQ.forEach(function (k) { btTree = btInsert(btTree, k, T); });

/* a deletion trace on a fresh copy of the full tree */
var DEL = [];
var delTree = bpClone(mainTree), delLeft = SEQ.slice();
[50, 10, 90, 20, 70, 40].forEach(function (k) {
  var log = [];
  var before = bpNodes(delTree);
  var res = bpDelete(delTree, k, T, log);
  delTree = res.root;
  delLeft = delLeft.filter(function (x) { return x !== k; });
  DEL.push({
    key: k, actions: log, before: before, after: bpNodes(delTree),
    height: bpHeight(delTree), snapshot: bpClone(delTree), left: delLeft.slice(),
    violations: bpValidate(delTree, T, delLeft)
  });
});

/* the four verified order computations */
var ORDER_CASES = [
  {
    label: 'GATE 2015 Set 3 — non-leaf keys',
    eq: '8p + 12(p-1) \u2264 1024',
    order: internalOrder(1024, 12, 8),
    keys: internalOrder(1024, 12, 8) - 1,
    note: 'key 12 B, block pointer 8 B; the 10 B record pointer is a decoy',
    answer: '50 keys'
  },
  {
    label: 'GATE 2007 — leaf order',
    eq: '16n + 6 \u2264 1024',
    order: leafEntries(1024, 9, 7, 6),
    keys: leafEntries(1024, 9, 7, 6),
    note: '9 B key + 7 B record pointer per entry, plus one 6 B chain pointer',
    answer: '63 entries'
  },
  {
    label: 'GATE 2020 — internal order',
    eq: '8p + 12(p-1) \u2264 4096',
    order: internalOrder(4096, 12, 8),
    keys: internalOrder(4096, 12, 8) - 1,
    note: 'leaf capacity ' + leafEntries(4096, 12, 8, 8) + ' entries',
    answer: 'order 205'
  },
  {
    label: 'GATE 2010 — minimum occupancy',
    eq: 'max keys 5 \u2192 order 6',
    order: 6,
    keys: minKeysFromMax(5),
    note: 'minimum children \u23086/2\u2309 = 3, so minimum keys 2',
    answer: '2 keys'
  }
];

var G15 = gate2015Tree();
var G15_KEYS = [1, 3, 5, 7, 9, 11, 13, 15];
var RANGE = bpRange(G15, 7, 15);
var POINT = bpSearch(G15, 11);

var V = {
  seq: SEQ, t: T, order: ORDER,
  maxKeys: 2 * T - 1, minKeys: T - 1,
  ins: INS, splits: splitsTotal,
  tree: mainTree, height: bpHeight(mainTree), nodes: bpNodes(mainTree),
  copies: bpKeyCopies(mainTree), internalKeys: bpInternalKeys(mainTree),
  leaves: bpLeaves(mainTree).length,
  del: DEL,
  bt: { height: btHeight(btTree), keys: btAllKeys(btTree).length },
  orderCases: ORDER_CASES,
  g15: G15, g15Keys: G15_KEYS, range: RANGE, point: POINT,
  /* the file-cost figures of scene 1 */
  records: 1000000, recPerBlock: 100,
  dataBlocks: 1000000 / 100,
  scanAvg: 5000,
  /* fan-out of the GATE 2020 index, used by scene 1 and scene 5 */
  idxOrder: internalOrder(4096, 12, 8),
  idxLeaf: leafEntries(4096, 12, 8, 8),
  idxLevels: indexLevels(1000000, 204, 205)
};
V.idxAccess = V.idxLevels + 1;

/* ======================================================================
   LAYER 2b - THE CHECKS. Each one re-derives a quoted value from a
   definition, or re-validates a structure against its own invariants.
   ====================================================================== */

/* -- order arithmetic, against the four verified answers -- */
chk('order from block: GATE 2015 Set 3 gives 51 pointers, 50 keys',
  internalOrder(1024, 12, 8) === 51 && internalOrder(1024, 12, 8) - 1 === 50,
  internalOrder(1024, 12, 8) + ' pointers');
chk('order from block: GATE 2007 leaf holds 63 entries',
  leafEntries(1024, 9, 7, 6) === 63, String(leafEntries(1024, 9, 7, 6)));
chk('order from block: GATE 2020 internal order 205, leaf 204',
  internalOrder(4096, 12, 8) === 205 && leafEntries(4096, 12, 8, 8) === 204,
  internalOrder(4096, 12, 8) + '/' + leafEntries(4096, 12, 8, 8));
chk('GATE 2020: one million records need three index levels',
  indexLevels(1000000, 204, 205) === 3, String(indexLevels(1000000, 204, 205)));
chk('GATE 2020: three index reads plus the record block is four',
  indexLevels(1000000, 204, 205) + 1 === 4, String(indexLevels(1000000, 204, 205) + 1));
chk('occupancy: maximum 5 keys means order 6 and minimum 2 keys',
  minKeysFromMax(5) === 2, String(minKeysFromMax(5)));
chk('occupancy rule holds for every odd maximum from 3 to 31',
  [3, 5, 7, 9, 11, 15, 21, 31].every(function (m) {
    return minKeysFromMax(m) === Math.ceil((m + 1) / 2) - 1;
  }));

/* -- height bounds are computed, not quoted -- */
chk('a full B+ tree of order 4 and height 2 holds 12 keys',
  maxKeysAtHeight(4, 2) === 12, String(maxKeysAtHeight(4, 2)));
chk('a minimum B+ tree of order 4 and height 2 holds 2 keys',
  minKeysAtHeight(4, 2) === 2, String(minKeysAtHeight(4, 2)));
chk('nine keys cannot fit in one node of order 4, so height is at least 2',
  SEQ.length > maxKeysAtHeight(4, 1), SEQ.length + ' vs ' + maxKeysAtHeight(4, 1));
chk('nine keys do fit in height 2, so height 2 is the minimum',
  SEQ.length <= maxKeysAtHeight(4, 2), SEQ.length + ' vs ' + maxKeysAtHeight(4, 2));

/* -- the main tree, validated against its own invariants -- */
var mainViolations = bpValidate(mainTree, T, SEQ);
chk('main tree: every invariant holds (depth, order, separators, chain, occupancy)',
  mainViolations.length === 0, mainViolations.join('; '));
chk('main tree: height is 2', bpHeight(mainTree) === 2, String(bpHeight(mainTree)));
chk('main tree: four leaves, all at the same depth',
  bpLeaves(mainTree).length === 4 && bpValidate(mainTree, T, SEQ).length === 0,
  bpLeaves(mainTree).length + ' leaves');
chk('main tree: separators equal the minimum of the right subtree',
  (function () {
    var ok = true;
    (function walk(n) {
      if (n.leaf) return;
      for (var j = 0; j < n.keys.length; j++) if (n.keys[j] !== bpMin(n.children[j + 1])) ok = false;
      n.children.forEach(walk);
    })(mainTree);
    return ok;
  })());
chk('main tree: the leaf chain reads 10..90 in ascending order',
  bpLeaves(mainTree).map(function (l) { return l.keys.join('-'); }).join('|') === '10-20|30-40|50-60|70-80-90',
  bpLeaves(mainTree).map(function (l) { return l.keys.join('-'); }).join('|'));
chk('main tree: nine keys occupy twelve key slots (nine leaves plus three separators)',
  bpKeyCopies(mainTree) === 12 && bpInternalKeys(mainTree) === 3,
  bpKeyCopies(mainTree) + ' copies, ' + bpInternalKeys(mainTree) + ' separators');
chk('main tree: no record pointer above the leaf level, so every search costs the height',
  bpSearch(mainTree, 70).fetched === bpHeight(mainTree),
  bpSearch(mainTree, 70).fetched + ' vs height ' + bpHeight(mainTree));

/* -- the insertion trace -- */
chk('nine insertions cause three splits',
  splitsTotal === 3, String(splitsTotal));
chk('exactly one of those splits is at the root',
  INS.filter(function (r) { return r.rootSplit; }).length === 1,
  String(INS.filter(function (r) { return r.rootSplit; }).length));
chk('the height rises once, from 1 to 2, and only at a root split',
  (function () {
    var prev = 1, bad = 0;
    INS.forEach(function (r) {
      if (r.height > prev && !r.rootSplit) bad++;
      if (r.height < prev) bad++;
      prev = r.height;
    });
    return bad === 0 && INS[INS.length - 1].height === 2;
  })());
chk('every snapshot of the insertion trace is a valid B+ tree',
  INS.every(function (r) { return bpValidate(r.snapshot, T, r.inserted).length === 0; }),
  (function () {
    var bad = INS.filter(function (r) { return bpValidate(r.snapshot, T, r.inserted).length; });
    return bad.length ? bad[0].inserted.join(',') + ': ' + bpValidate(bad[0].snapshot, T, bad[0].inserted).join('; ') : '';
  })());
chk('the first split happens on the fourth insertion',
  INS.filter(function (r) { return r.splits > 0; })[0].key === 40,
  String(INS.filter(function (r) { return r.splits > 0; })[0].key));

/* -- the deletion trace -- */
chk('every step of the deletion trace leaves a valid B+ tree',
  DEL.every(function (r) { return r.violations.length === 0; }),
  (function () {
    var bad = DEL.filter(function (r) { return r.violations.length; });
    return bad.length ? 'delete ' + bad[0].key + ': ' + bad[0].violations.join('; ') : '';
  })());
chk('a deletion that causes no underflow changes no node count',
  DEL[0].before === DEL[0].after, DEL[0].key + ': ' + DEL[0].before + ' -> ' + DEL[0].after);
chk('at least one deletion borrows and at least one merges',
  DEL.some(function (r) { return /borrow/.test(r.actions.join(',')); }) &&
  DEL.some(function (r) { return /merge/.test(r.actions.join(',')); }),
  DEL.map(function (r) { return r.key + ':' + (r.actions.join('+') || 'none'); }).join(' | '));
chk('the deletion trace removes exactly the six keys asked for',
  DEL[DEL.length - 1].left.join(',') === '30,60,80',
  DEL[DEL.length - 1].left.join(','));
chk('deleting all nine keys returns the tree to a single empty leaf',
  (function () {
    var r = bpClone(mainTree), left = SEQ.slice();
    SEQ.forEach(function (k) { r = bpDelete(r, k, T).root; left = left.filter(function (x) { return x !== k; }); });
    return r.leaf === true && r.keys.length === 0 && bpValidate(r, T, []).length === 0;
  })());

/* -- the B-tree comparison -- */
chk('the B-tree holds the same nine keys and validates',
  btValidate(btTree, T, SEQ).length === 0, btValidate(btTree, T, SEQ).join('; '));
chk('the B-tree stores each key exactly once: nine keys, nine slots',
  btAllKeys(btTree).length === 9, String(btAllKeys(btTree).length));
chk('on the same keys the B-tree is taller than the B+ tree',
  btHeight(btTree) > bpHeight(mainTree),
  'B-tree ' + btHeight(btTree) + ' vs B+ ' + bpHeight(mainTree));

/* -- the GATE 2015 Set 2 index and its measurements -- */
chk('the GATE 2015 Set 2 index validates as a B+ tree',
  bpValidate(G15, T, G15_KEYS).length === 0, bpValidate(G15, T, G15_KEYS).join('; '));
chk('the GATE 2015 Set 2 range [7, 15) fetches five nodes',
  RANGE.fetched === 5, String(RANGE.fetched));
chk('that range returns exactly 7, 9, 11 and 13 — 15 is excluded',
  RANGE.keys.join(',') === '7,9,11,13', RANGE.keys.join(','));
chk('the descent is three nodes and the chain adds two more',
  RANGE.descent.length === 3 && RANGE.chain.length === 3,
  RANGE.descent.length + ' + ' + (RANGE.chain.length - 1));
chk('a point query on that index costs three node fetches',
  POINT.fetched === 3 && POINT.found === true, String(POINT.fetched));
chk('a point query costs exactly the height',
  POINT.fetched === bpHeight(G15), POINT.fetched + ' vs ' + bpHeight(G15));

/* -- scene 1 arithmetic -- */
chk('one million records at a hundred per block occupy ten thousand blocks',
  V.dataBlocks === 10000, String(V.dataBlocks));
chk('a linear scan averages five thousand block reads against four for the index',
  V.scanAvg === 5000 && V.idxAccess === 4, V.scanAvg + ' vs ' + V.idxAccess);

/* ======================================================================
   LAYER 3 - RENDER. Reads the model; never re-derives it.
   ====================================================================== */

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function rv(t, a, d) { return clamp01((t - a) / (d || 1)); }
function ease(v) { return v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2; }
function txt(x, y, s, o) { P.text(x, y, s, o || {}); }

function wrap(s, max) {
  var words = String(s).split(' '), lines = [], cur = '';
  words.forEach(function (w) {
    if ((cur + ' ' + w).trim().length > max) { if (cur) lines.push(cur); cur = w; }
    else cur = (cur ? cur + ' ' : '') + w;
  });
  if (cur) lines.push(cur);
  return lines;
}
function para(x, y, s, max, o) {
  o = o || {};
  var lines = wrap(s, max), lh = o.lh || 17;
  lines.forEach(function (l, i) {
    txt(x, y + i * lh, l, { size: o.size || 13, color: o.color || PAL.dim, mono: !!o.mono });
  });
  return y + lines.length * lh;
}
function box(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, {
    fill: o.fill, stroke: o.stroke, sw: o.sw || 1.4,
    radius: o.radius === undefined ? 8 : o.radius, dash: o.dash
  });
}
function label(x, y, s, o) {
  o = o || {};
  txt(x, y, s, { size: o.size || 11, mono: true, color: o.color || PAL.faint, bold: !!o.bold, align: o.align });
}
function head(s, sub) {
  txt(40, 22, s, { size: 17, bold: true, color: PAL.ink });
  if (sub) txt(40, 44, sub, { size: 12, mono: true, color: PAL.faint });
  P.line(40, 58, W - 40, 58, { stroke: PAL.border, sw: 1 });
}
function bg() {
  P.rect(0, 0, W, H, { fill: PAL.surface });
  P.rect(0, 0, W, 4, { fill: PAL.accent });
}

/* ---------- tree layout and drawing ---------- */

/* assign depth and a slot to every node; x is the mean of the children */
function layoutBPlus(root) {
  var leaves = bpLeaves(root);
  var n = 0;
  leaves.forEach(function (l) { l.__slot = n++; });
  var nodes = [];
  function place(node, depth) {
    if (node.leaf) { node.__x = node.__slot; node.__d = depth; nodes.push(node); return; }
    node.children.forEach(function (c) { place(c, depth + 1); });
    node.__x = node.children.reduce(function (s, c) { return s + c.__x; }, 0) / node.children.length;
    node.__d = depth;
    nodes.push(node);
  }
  place(root, 0);
  return { nodes: nodes, leafCount: leaves.length, leaves: leaves };
}

function nodeWidth(keys) { return Math.max(44, keys.length * 26 + 16); }

function drawBPlus(root, o) {
  o = o || {};
  var lay = layoutBPlus(root);
  var x0 = o.x0 === undefined ? 60 : o.x0;
  var x1 = o.x1 === undefined ? W - 60 : o.x1;
  var y0 = o.y0 === undefined ? 92 : o.y0;
  var dy = o.dy === undefined ? 92 : o.dy;
  var span = x1 - x0;
  var step = lay.leafCount > 1 ? span / (lay.leafCount - 1) : 0;
  function X(n) { return lay.leafCount > 1 ? x0 + n.__x * step : (x0 + x1) / 2; }
  function Y(n) { return y0 + n.__d * dy; }
  var hi = o.highlight || {};
  var nw = o.nodeW || 46, nh = o.nodeH || 30;

  /* edges first, so boxes sit on top */
  lay.nodes.forEach(function (n) {
    if (n.leaf) return;
    n.children.forEach(function (c) {
      P.line(X(n), Y(n) + nh, X(c), Y(c), { stroke: PAL.border, sw: 1.2 });
    });
  });

  /* leaf chain */
  lay.leaves.forEach(function (l, i) {
    if (!l.next) return;
    var x = X(l), y = Y(l) + nh;
    P.arrow(x + nw / 2 + 2, y + 8, X(l.next) - nw / 2 - 2, y + 8, { stroke: PAL.accent, sw: 1.4, head: 7 });
  });

  lay.nodes.forEach(function (n) {
    var w = Math.max(nw, nodeWidth(n.keys)), h = nh;
    var x = X(n) - w / 2, y = Y(n);
    var key = String(n.__d) + ':' + n.keys.join(',');
    var isHi = hi[key] !== undefined;
    var fill = n.leaf ? (o.leafFill || PAL.accentDim) : (o.intFill || PAL.surface2);
    if (isHi) fill = hi[key];
    box(x, y, w, h, {
      fill: fill,
      stroke: isHi ? PAL.accent : (n.leaf ? PAL.accent : PAL.border),
      sw: isHi ? 2 : 1.3, radius: 5
    });
    var t = n.keys.length ? n.keys.join(' ') : '·';
    txt(x + w / 2, y + h / 2, t, {
      mono: true, size: o.size || 12, bold: !!o.bold,
      align: 'center', base: 'middle', color: PAL.ink
    });
  });
  return { X: X, Y: Y, nh: nh, nw: nw, lay: lay };
}

function layoutBTree(root) {
  var nodes = [], count = { n: 0 };
  function place(node, depth) {
    node.__d = depth;
    if (node.leaf) { node.__x = count.n++; }
    else {
      node.children.forEach(function (c) { place(c, depth + 1); });
      node.__x = node.children.reduce(function (s, c) { return s + c.__x; }, 0) / node.children.length;
    }
    nodes.push(node);
  }
  place(root, 0);
  return { nodes: nodes, slots: count.n };
}

function drawBTree(root, o) {
  o = o || {};
  var lay = layoutBTree(root);
  var x0 = o.x0 === undefined ? 60 : o.x0;
  var x1 = o.x1 === undefined ? W - 60 : o.x1;
  var y0 = o.y0 === undefined ? 96 : o.y0;
  var dy = o.dy === undefined ? 78 : o.dy;
  var span = x1 - x0;
  var step = lay.slots > 1 ? span / (lay.slots - 1) : 0;
  function X(n) { return lay.slots > 1 ? x0 + n.__x * step : (x0 + x1) / 2; }
  function Y(n) { return y0 + n.__d * dy; }
  var nw = o.nodeW || 44, nh = o.nodeH || 28;
  lay.nodes.forEach(function (n) {
    if (n.leaf) return;
    n.children.forEach(function (c) { P.line(X(n), Y(n) + nh, X(c), Y(c), { stroke: PAL.border, sw: 1.2 }); });
  });
  lay.nodes.forEach(function (n) {
    var w = Math.max(nw, nodeWidth(n.keys)), h = nh;
    var x = X(n) - w / 2, y = Y(n);
    box(x, y, w, h, {
      fill: n.leaf ? PAL.accentDim : PAL.surface2,
      stroke: n.leaf ? PAL.accent : PAL.border, sw: 1.3, radius: 5
    });
    txt(x + w / 2, y + h / 2, n.keys.join(' '), {
      mono: true, size: o.size || 12, align: 'center', base: 'middle', color: PAL.ink
    });
    /* the record pointer that makes a B-tree node wider than a B+ node */
    if (o.showRecords) {
      for (var i = 0; i < n.keys.length; i++) {
        P.circle(x + 10 + i * 26 + 8, y + h - 5, 2.2, { fill: PAL.warn });
      }
    }
  });
  return { lay: lay };
}

/* ======================================================================
   SCENES
   ====================================================================== */

/* ---------------- scene 1: what a query costs ---------------- */
function scCost(t) {
  head('Why a database keeps a tree beside its data',
    'the only cost that matters: how many blocks a query touches');

  var bx = 60, by = 96, bw = 780, bh = 40;
  label(bx, by - 14, 'the data file — 10,000 blocks of 100 records each');
  box(bx, by, bw, bh, { fill: PAL.surface2, stroke: PAL.border, radius: 4 });
  for (var i = 1; i < 40; i++) {
    P.line(bx + i * bw / 40, by, bx + i * bw / 40, by + bh, { stroke: PAL.border, sw: 0.7 });
  }

  /* the scan: half the file */
  var sp = rv(t, 7.5, 7.5);
  if (sp > 0) {
    P.alpha(0.55);
    P.rect(bx, by, bw * 0.5 * ease(sp), bh, { fill: PAL.invalid });
    P.alpha(1);
    if (sp > 0.6) {
      txt(bx + bw * 0.25, by + bh / 2, '5,000 blocks read, on average', {
        size: 12, bold: true, align: 'center', base: 'middle', color: '#ffffff'
      });
    }
    label(bx, by + bh + 18, 'no index: read until the record appears', { color: PAL.invalid });
  }

  /* the index: three levels */
  var ip = rv(t, 15, 6);
  if (ip > 0) {
    P.alpha(ease(ip));
    label(bx, 214, 'the index — three levels, one block each');
    var lv = [
      { y: 232, n: 1, label: 'root' },
      { y: 288, n: 3, label: 'internal' },
      { y: 344, n: 9, label: 'leaves' }
    ];
    var colX = 216;
    lv.forEach(function (row, ri) {
      var gap = 14, w = 30;
      var total = row.n * w + (row.n - 1) * gap;
      var sx = colX - total / 2;
      for (var k = 0; k < row.n; k++) {
        var on = (ri === 0) || (ri === 1 && k === 1) || (ri === 2 && k === 4);
        box(sx + k * (w + gap), row.y, w, 26, {
          fill: on ? PAL.accentDim : PAL.surface2,
          stroke: on ? PAL.accent : PAL.border, sw: on ? 1.8 : 1.2, radius: 4
        });
        if (k === 0) label(60, row.y + 17, row.label, { align: 'left' });
      }
    });
    P.arrow(colX, 258, colX, 288, { stroke: PAL.accent, sw: 1.3, head: 7 });
    P.arrow(colX, 314, colX, 344, { stroke: PAL.accent, sw: 1.3, head: 7 });
    P.alpha(1);
  }

  /* the comparison */
  var cp = rv(t, 22.5, 5);
  if (cp > 0) {
    P.alpha(ease(cp));
    box(430, 214, 410, 150, { fill: PAL.warnDim, stroke: PAL.warn, radius: 8 });
    txt(448, 232, 'the same query, two ways', { size: 13, bold: true, color: PAL.warn });
    txt(448, 262, '5,000', { size: 30, bold: true, mono: true, color: PAL.invalid });
    txt(556, 262, 'block reads without an index', { size: 12, color: PAL.ink });
    txt(448, 306, '4', { size: 30, bold: true, mono: true, color: PAL.valid });
    txt(478, 306, 'with one: three index blocks plus the record', { size: 12, color: PAL.ink });
    txt(448, 344, '3 index levels + 1 record block = 4', { size: 11, mono: true, color: PAL.dim });
    P.alpha(1);
  }

  if (t > 26) {
    txt(40, 400, 'Everything in this lesson is a count of blocks, never a count of comparisons.', {
      size: 13, bold: true, color: PAL.ink
    });
    txt(40, 424, 'An index is a small sorted file of (key, block pointer) entries. Small, because it copies one column.', {
      size: 12, color: PAL.dim
    });
  }
}

/* ---------------- scene 2: file organisation and index vocabulary ---------------- */
function scFiles(t) {
  head('File organisation, and four adjectives an index can carry',
    'how records are laid out is a separate decision from how they are indexed');

  var cards = [
    { a: 0, title: 'heap', body: 'append to any block with room', good: 'insert is one block', bad: 'search is a full scan' },
    { a: 0, title: 'sorted', body: 'records kept in key order', good: 'binary search on the key', bad: 'insert may shift blocks' },
    { a: 0, title: 'hashed', body: 'bucket by hash of the key', good: 'equality is one block', bad: 'ranges are hopeless' }
  ];
  cards.forEach(function (c, i) {
    var p = rv(t, c.a, 1.2);
    if (p <= 0) return;
    var x = 40 + i * 276;
    P.alpha(p);
    box(x, 78, 258, 92, { fill: PAL.surface, stroke: PAL.border, radius: 8 });
    txt(x + 14, 94, c.title, { size: 14, bold: true, mono: true, color: PAL.accent });
    txt(x + 14, 116, c.body, { size: 12, color: PAL.dim });
    txt(x + 14, 138, '+ ' + c.good, { size: 11, color: PAL.valid });
    txt(x + 14, 156, '\u2212 ' + c.bad, { size: 11, color: PAL.invalid });
    P.alpha(1);
  });
  label(40, 186, 'file organisation: where the records sit');

  /* dense vs sparse */
  var dp = rv(t, 7.5, 3);
  if (dp > 0) {
    P.alpha(ease(dp));
    var dy = 210;
    label(40, dy - 6, 'index type: how many entries');
    /* dense: one entry per record */
    for (var r = 0; r < 3; r++) {
      for (var c2 = 0; c2 < 4; c2++) {
        box(44 + c2 * 22, dy + 10 + r * 20, 18, 16, { fill: PAL.surface2, stroke: PAL.border, radius: 3, sw: 1 });
        box(44 + c2 * 22, dy + 78 + r * 20, 18, 16, { fill: PAL.accentDim, stroke: PAL.accent, radius: 3, sw: 1 });
      }
    }
    txt(44, dy + 68, 'records', { size: 10, mono: true, color: PAL.faint });
    txt(140, dy + 92, 'dense: one entry per record', { size: 12, bold: true, color: PAL.accent });
    txt(140, dy + 110, 'works on any file, but the index is as long as the file', { size: 11, color: PAL.dim });

    /* sparse: one entry per block */
    for (var c3 = 0; c3 < 4; c3++) {
      box(430 + c3 * 30, dy + 78, 24, 16, { fill: PAL.accentDim, stroke: PAL.accent, radius: 3, sw: 1 });
      P.line(430 + c3 * 30 - 4, dy + 86, 430 + c3 * 30 + 4, dy + 86, { stroke: PAL.accent, sw: 1 });
    }
    txt(430, dy + 68, 'one entry per block', { size: 10, mono: true, color: PAL.faint });
    txt(566, dy + 92, 'sparse: one entry per block', { size: 12, bold: true, color: PAL.accent });
    txt(566, dy + 110, 'shorter, but only on a file sorted by the key', { size: 11, color: PAL.dim });
    P.alpha(1);
  }

  /* clustered vs unclustered */
  var cp = rv(t, 15, 3);
  if (cp > 0) {
    P.alpha(ease(cp));
    var cy = 340;
    label(40, cy - 6, 'clustering: whether the file order matches the key order');
    for (var i2 = 0; i2 < 8; i2++) {
      var hot = i2 >= 2 && i2 <= 4;
      box(44 + i2 * 26, cy + 10, 22, 18, { fill: hot ? PAL.valid : PAL.surface2, stroke: hot ? PAL.valid : PAL.border, radius: 3, sw: 1 });
    }
    txt(44, cy + 44, 'clustered: the three matches share neighbouring blocks', { size: 11, color: PAL.valid });
    for (var i3 = 0; i3 < 8; i3++) {
      var hot2 = i3 === 1 || i3 === 4 || i3 === 6;
      box(430 + i3 * 26, cy + 10, 22, 18, { fill: hot2 ? PAL.invalid : PAL.surface2, stroke: hot2 ? PAL.invalid : PAL.border, radius: 3, sw: 1 });
    }
    txt(430, cy + 44, 'unclustered: three matches, three separate blocks', { size: 11, color: PAL.invalid });
    P.alpha(1);
  }

  var mp = rv(t, 22.5, 3);
  if (mp > 0) {
    P.alpha(ease(mp));
    box(40, 396, 820, 46, { fill: PAL.accentDim, stroke: PAL.accent, radius: 6 });
    txt(54, 408, 'The index is a file too, so it can be indexed: a multilevel index. Its top level is small enough to stay in memory,', { size: 12, color: PAL.ink });
    txt(54, 426, 'so a descent starts in RAM. That is how ten thousand data blocks become four reads.', { size: 12, color: PAL.ink });
    P.alpha(1);
  }
}

/* ---------------- scene 3: B-tree anatomy ---------------- */
function scBtree(t) {
  head('The B-tree: order, occupancy, and where the records live',
    'order p = maximum children, so at most p-1 keys');

  var p = rv(t, 0, 1.5);
  if (p > 0) {
    P.alpha(ease(p));
    drawBTree(btTree, { x0: 70, x1: 470, y0: 92, dy: 74, showRecords: t > 6 });
    label(70, 78, 'nine keys, minimum degree 2 — height ' + V.bt.height);
    P.alpha(1);
  }

  var a = rv(t, 4, 2);
  if (a > 0) {
    P.alpha(ease(a));
    box(520, 84, 340, 96, { fill: PAL.surface2, stroke: PAL.border, radius: 8 });
    txt(536, 100, 'one node of order p', { size: 13, bold: true, color: PAL.accent });
    txt(536, 124, 'p child pointers, p-1 keys', { size: 12, mono: true, color: PAL.ink });
    txt(536, 144, 'and a record pointer beside every key', { size: 12, color: PAL.ink });
    txt(536, 164, 'occupancy: \u2308p/2\u2309-1 \u2026 p-1 keys', { size: 11, mono: true, color: PAL.dim });
    P.alpha(1);
  }

  var b = rv(t, 11, 2);
  if (b > 0) {
    P.alpha(ease(b));
    box(520, 192, 340, 78, { fill: PAL.accentDim, stroke: PAL.accent, radius: 8 });
    txt(536, 208, 'each key appears exactly once', { size: 12, bold: true, color: PAL.accent });
    para(536, 228, 'So a search may stop at an internal node: the record address is right there, beside the key.', 42, { size: 12 });
    P.alpha(1);
  }

  var c = rv(t, 17, 2);
  if (c > 0) {
    P.alpha(ease(c));
    box(520, 282, 340, 70, { fill: PAL.surface, stroke: PAL.valid, radius: 8 });
    txt(536, 298, 'balanced means equal, not nearly equal', { size: 12, bold: true, color: PAL.valid });
    para(536, 318, 'Every root-to-leaf path has the same length. GATE 2016 Set 2 keys exactly this wording.', 42, { size: 12 });
    P.alpha(1);
  }

  var d = rv(t, 23, 2);
  if (d > 0) {
    P.alpha(ease(d));
    box(40, 356, 820, 84, { fill: PAL.warnDim, stroke: PAL.warn, radius: 8 });
    txt(56, 372, 'the two occupancy adjustments', { size: 12, bold: true, mono: true, color: PAL.warn });
    txt(56, 394, '1.  order counts children, not keys: maximum keys = order - 1  (GATE 2005: order 5 means 4 keys)', { size: 12, color: PAL.ink });
    txt(56, 416, '2.  the root is exempt: it may hold a single key, because a two-level tree needs one (GATE 2024 Set 1)', { size: 12, color: PAL.ink });
    P.alpha(1);
  }
}

/* ---------------- scene 4: B+ tree anatomy ---------------- */
function scBplus(t) {
  head('The B+ tree: separators above, every record below',
    'keys[j] = smallest key in the subtree of children[j+1]');

  var p = rv(t, 0, 1.5);
  if (p > 0) {
    P.alpha(ease(p));
    drawBPlus(mainTree, { x0: 90, x1: 500, y0: 96, dy: 86, nodeW: 76, size: 13, bold: true });
    label(90, 80, 'nine keys, minimum degree 2 — height ' + V.height);
    P.alpha(1);
  }

  var a = rv(t, 7.5, 2);
  if (a > 0) {
    P.alpha(ease(a));
    box(540, 82, 320, 82, { fill: PAL.accentDim, stroke: PAL.accent, radius: 8 });
    txt(556, 98, 'internal nodes hold no records', { size: 12, bold: true, color: PAL.accent });
    para(556, 118, 'Only keys and child pointers. That is the whole design change, and the fan-out follows from it.', 40, { size: 12 });
    P.alpha(1);
  }

  var b = rv(t, 14, 2);
  if (b > 0) {
    P.alpha(ease(b));
    box(540, 176, 320, 82, { fill: PAL.surface, stroke: PAL.border, radius: 8 });
    txt(556, 192, 'the separator is a copy, not a move', { size: 12, bold: true, color: PAL.ink });
    txt(556, 214, '40 \u2264 70  \u2192  go right', { size: 12, mono: true, color: PAL.accent });
    para(556, 234, 'Read the figure\u2019s convention before imposing one: minimum of the right child, or maximum of the left.', 40, { size: 11 });
    P.alpha(1);
  }

  var c = rv(t, 21, 2);
  if (c > 0) {
    P.alpha(ease(c));
    box(540, 270, 320, 78, { fill: PAL.valid === PAL.valid ? PAL.surface : PAL.surface, stroke: PAL.valid, radius: 8 });
    txt(556, 286, 'the leaves are chained in key order', { size: 12, bold: true, color: PAL.valid });
    para(556, 306, 'One descent, then walk right. A range scan never returns to the root.', 40, { size: 12 });
    P.alpha(1);
  }

  var d = rv(t, 27, 2);
  if (d > 0) {
    P.alpha(ease(d));
    box(40, 366, 820, 74, { fill: PAL.warnDim, stroke: PAL.warn, radius: 8 });
    txt(56, 382, 'what this costs, and what it buys', { size: 12, bold: true, mono: true, color: PAL.warn });
    txt(56, 404, 'cost: a key may appear twice — ' + V.copies + ' key slots for ' + V.seq.length + ' keys, because a separator duplicates a leaf key', { size: 12, color: PAL.ink });
    txt(56, 426, 'buys: no search can end early, so every search costs exactly the height — ' + V.height + ' here', { size: 12, color: PAL.ink });
    P.alpha(1);
  }
}

/* ---------------- scene 5: order arithmetic ---------------- */
function scOrder(t) {
  head('Order is arithmetic: the block equation',
    'a node must fit in one block — write the inequality, then round down');

  var cards = V.orderCases;
  cards.forEach(function (c, i) {
    var p = rv(t, i * 6, 2);
    if (p <= 0) return;
    var col = i % 2, row = Math.floor(i / 2);
    var x = 40 + col * 420, y = 80 + row * 152;
    P.alpha(ease(p));
    box(x, y, 400, 132, { fill: PAL.surface, stroke: PAL.border, radius: 8 });
    txt(x + 14, y + 10, c.label, { size: 11, mono: true, bold: true, color: PAL.accent });
    txt(x + 14, y + 34, c.eq, { size: 15, mono: true, bold: true, color: PAL.ink });
    txt(x + 14, y + 62, c.note, { size: 11, color: PAL.dim });
    box(x + 14, y + 82, 372, 36, { fill: PAL.accentDim, stroke: PAL.accent, radius: 5 });
    txt(x + 200, y + 100, c.answer, { size: 15, mono: true, bold: true, align: 'center', base: 'middle', color: PAL.accent });
    P.alpha(1);
  });

  var w = rv(t, 25, 3);
  if (w > 0) {
    P.alpha(ease(w));
    txt(40, 400, 'Floor, always. An order that does not fit in the block is not an order.', { size: 13, bold: true, color: PAL.ink });
    txt(40, 424, 'GATE 2020: order 205, leaf 204, one million records \u2192 ' + V.idxLevels + ' levels \u2192 ' + V.idxAccess + ' block reads including the record.', { size: 12, color: PAL.dim });
    P.alpha(1);
  }
}

/* ---------------- scene 6: insertion ---------------- */
function scInsert(t) {
  head('Insertion: fill, split, copy up, and the one way the tree grows taller',
    'maximum 3 keys per node, minimum degree 2');

  var step = Math.min(V.ins.length - 1, Math.floor(t / 3.2));
  var rec = V.ins[step];

  /* the strip of inserted keys */
  V.seq.forEach(function (k, i) {
    var on = i <= step;
    var x = 40 + i * 46, y = 74;
    box(x, y, 38, 24, {
      fill: on ? (V.ins[i].splits > 0 ? PAL.warnDim : PAL.accentDim) : PAL.surface,
      stroke: on ? (V.ins[i].splits > 0 ? PAL.warn : PAL.accent) : PAL.border,
      sw: 1.2, radius: 4
    });
    txt(x + 19, y + 12, String(k), { mono: true, size: 12, align: 'center', base: 'middle', color: on ? PAL.ink : PAL.faint });
  });
  label(40, 66, 'inserted so far');
  label(470, 66, 'amber = this insertion split a node');

  drawBPlus(rec.snapshot, { x0: 110, x1: 790, y0: 128, dy: 92, nodeW: 74, size: 13, bold: true });

  /* the live numbers */
  box(40, 372, 268, 68, { fill: PAL.surface2, stroke: PAL.border, radius: 8 });
  txt(54, 386, 'after ' + rec.inserted.length + ' insertions', { size: 11, mono: true, color: PAL.dim });
  txt(54, 408, 'height ' + rec.height + '   nodes ' + rec.nodes + '   slots ' + rec.copies, { size: 12, mono: true, bold: true, color: PAL.ink });
  txt(54, 428, 'splits so far: ' + V.ins.slice(0, step + 1).reduce(function (a, r) { return a + r.splits; }, 0), { size: 11, mono: true, color: PAL.accent });

  if (rec.splits > 0) {
    box(320, 372, 540, 68, { fill: rec.rootSplit ? PAL.warnDim : PAL.accentDim, stroke: rec.rootSplit ? PAL.warn : PAL.accent, radius: 8 });
    txt(336, 386, rec.rootSplit
      ? 'root split: a new root was created, so the height rose by one'
      : 'a node overflowed and split; the right half\u2019s smallest key was copied up', {
      size: 12, bold: true, color: rec.rootSplit ? PAL.warn : PAL.accent
    });
    txt(336, 408, rec.rootSplit
      ? 'the only event that changes the height, so every leaf stays at one depth'
      : 'the parent absorbed one more separator and one more child pointer', { size: 11, color: PAL.ink });
    txt(336, 428, 'copied, not moved: the separator still exists in the leaf below', { size: 11, color: PAL.dim });
  } else {
    box(320, 372, 540, 68, { fill: PAL.surface, stroke: PAL.border, radius: 8 });
    txt(336, 388, 'the leaf had room, so the insertion stopped there', { size: 12, bold: true, color: PAL.ink });
    txt(336, 412, 'one descent, one block written. No structural change above.', { size: 11, color: PAL.dim });
  }
}

/* ---------------- scene 7: deletion ---------------- */
function scDel(t) {
  head('Deletion: borrow from a sibling, or merge and cascade',
    'underflow means fewer than t-1 = ' + V.minKeys + ' key in a non-root node');

  var step = Math.min(V.del.length - 1, Math.floor(t / 4.6));
  var rec = V.del[step];

  V.del.forEach(function (d, i) {
    var on = i <= step;
    var x = 40 + i * 76, y = 74;
    box(x, y, 66, 24, {
      fill: on ? (d.actions.length ? PAL.warnDim : PAL.accentDim) : PAL.surface,
      stroke: on ? (d.actions.length ? PAL.warn : PAL.accent) : PAL.border, sw: 1.2, radius: 4
    });
    txt(x + 33, y + 12, 'del ' + d.key, { mono: true, size: 11, align: 'center', base: 'middle', color: on ? PAL.ink : PAL.faint });
  });
  label(40, 66, 'deletion trace on the full tree');

  drawBPlus(rec.snapshot, { x0: 110, x1: 790, y0: 128, dy: 92, nodeW: 74, size: 13, bold: true });

  box(40, 372, 260, 68, { fill: PAL.surface2, stroke: PAL.border, radius: 8 });
  txt(56, 386, 'after deleting ' + rec.key, { size: 11, mono: true, color: PAL.dim });
  txt(56, 408, 'height ' + rec.height + '   nodes ' + rec.before + ' \u2192 ' + rec.after, { size: 13, mono: true, bold: true, color: PAL.ink });
  txt(56, 428, 'remaining: ' + rec.left.join(' '), { size: 11, mono: true, color: PAL.accent });

  var what = rec.actions.length ? rec.actions.join(', then ') : 'none';
  var explain = {
    'none': ['the leaf still had at least the minimum, so no repair was needed',
      'only the separator above is refreshed to the leaf\u2019s new smallest key'],
    'borrow-right': ['underflow repaired by borrowing from the right sibling',
      'the sibling had a key to spare; both separators above are refreshed'],
    'borrow-left': ['underflow repaired by borrowing from the left sibling',
      'the sibling had a key to spare; both separators above are refreshed'],
    'merge-right': ['both nodes were at the minimum, so they merged into one',
      'the parent lost a child and the separator that divided them'],
    'merge-left': ['both nodes were at the minimum, so they merged into one',
      'the parent lost a child and the separator that divided them']
  }[rec.actions[0] || 'none'] || ['the repair cascaded above the leaf', 'a merge can leave the parent underfull'];

  box(320, 372, 540, 68, {
    fill: rec.actions.length ? PAL.warnDim : PAL.surface,
    stroke: rec.actions.length ? PAL.warn : PAL.border, radius: 8
  });
  txt(336, 388, 'repair: ' + what, { size: 12, bold: true, mono: true, color: rec.actions.length ? PAL.warn : PAL.ink });
  txt(336, 412, explain[0], { size: 12, color: PAL.ink });
  txt(336, 430, explain[1], { size: 11, color: PAL.dim });
}

/* ---------------- scene 8: query cost ---------------- */
function scQuery(t) {
  head('Counting what a query costs',
    'nodes fetched, not keys compared — the GATE 2015 Set 2 index');

  var hi = {};
  var beats = [
    { a: 0, keys: [] },
    { a: 2, keys: ['0:9'] },
    { a: 4, keys: ['0:9', '1:5'] },
    { a: 6, keys: ['0:9', '1:5', '2:5,7'] },
    { a: 9, keys: ['0:9', '1:5', '2:5,7', '2:9,11'] },
    { a: 12, keys: ['0:9', '1:5', '2:5,7', '2:9,11', '2:13,15'] }
  ];
  var shown = beats[0].keys;
  beats.forEach(function (b) { if (t >= b.a) shown = b.keys; });
  shown.forEach(function (k) { hi[k] = PAL.warnDim; });

  drawBPlus(V.g15, { x0: 90, x1: 500, y0: 96, dy: 84, nodeW: 70, size: 12, bold: true, highlight: hi });

  label(90, 78, 'the index of the question: order 1, leaves chained');

  /* the fetched counter */
  var n = shown.length;
  box(540, 84, 320, 74, { fill: n ? PAL.warnDim : PAL.surface2, stroke: n ? PAL.warn : PAL.border, radius: 8 });
  txt(556, 100, 'nodes fetched so far', { size: 11, mono: true, color: PAL.dim });
  txt(556, 118, String(n), { size: 30, mono: true, bold: true, color: n ? PAL.warn : PAL.ink });
  txt(596, 132, n ? 'for the range 7 \u2264 key < 15' : 'press play', { size: 12, color: PAL.ink });

  /* the walk */
  var walk = [
    '7 < 9, so follow the left pointer of the root',
    '7 \u2265 5, so follow the right pointer',
    'leaf 5,7 holds the lower bound',
    'the chain gives 9 and 11',
    'the chain gives 13, and 15 stops the scan'
  ];
  for (var i = 0; i < Math.max(0, n - 1); i++) {
    var y = 176 + i * 26;
    txt(540, y, (i + 1) + '.  ' + walk[i], { size: 11, color: i === n - 2 ? PAL.warn : PAL.dim });
  }

  var done = rv(t, 14, 3);
  if (done > 0) {
    P.alpha(ease(done));
    box(540, 316, 320, 62, { fill: PAL.surface, stroke: PAL.valid, radius: 8 });
    txt(556, 332, 'answer: 5', { size: 16, bold: true, mono: true, color: PAL.valid });
    txt(556, 354, '3 in the descent + 2 more leaves', { size: 11, color: PAL.dim });
    txt(556, 370, 'keys returned: ' + V.range.keys.join(', '), { size: 11, mono: true, color: PAL.ink });
    P.alpha(1);
  }

  box(40, 372, 480, 68, { fill: PAL.warnDim, stroke: PAL.warn, radius: 8 });
  txt(56, 388, 'four would be wrong', { size: 12, bold: true, color: PAL.warn });
  para(56, 408, 'The bound is "less than 15", so 13 counts and 15 does not — but the leaf holding both must still be read for 13.', 56, { size: 11 });
}

/* ---------------- scene 9: why B+ over B ---------------- */
function scWhy(t) {
  head('Why databases chose the B+ tree over the B-tree',
    'same nine keys, same minimum degree 2 — two different heights');

  var p = rv(t, 0, 2);
  if (p > 0) {
    P.alpha(ease(p));
    label(60, 76, 'B-tree — ' + V.bt.height + ' levels, a record pointer in every node', { color: PAL.warn });
    drawBTree(btTree, { x0: 60, x1: 400, y0: 96, dy: 62, nodeW: 40, size: 10 });
    label(470, 76, 'B+ tree — ' + V.height + ' levels, records only at the leaves', { color: PAL.valid });
    drawBPlus(mainTree, { x0: 470, x1: 860, y0: 96, dy: 62, nodeW: 62, size: 10 });
    P.alpha(1);
  }

  var q = rv(t, 9, 2.5);
  if (q > 0) {
    P.alpha(ease(q));
    box(40, 268, 820, 56, { fill: PAL.accentDim, stroke: PAL.accent, radius: 8 });
    txt(56, 282, 'the same block holds more keys, because no record pointer is spent', { size: 12, bold: true, color: PAL.accent });
    txt(56, 304, 'B-tree node: keys + record pointers + child pointers.   B+ internal node: keys + child pointers only.', { size: 11, mono: true, color: PAL.ink });
    P.alpha(1);
  }

  var r = rv(t, 16, 2.5);
  if (r > 0) {
    P.alpha(ease(r));
    var rows = [
      ['levels on these 9 keys', String(V.bt.height), String(V.height)],
      ['key slots used', String(V.bt.keys), V.copies + ' (' + V.seq.length + ' + ' + V.internalKeys + ')'],
      ['a range scan', 'traversal', 'leaf chain'],
      ['can a search end early?', 'yes', 'no']
    ];
    var x0 = 40, y0 = 334, cw = [230, 290, 290], rh = 22;
    box(x0, y0, 820, rh, { fill: PAL.surface2, stroke: PAL.border, radius: 3 });
    ['', 'B-tree', 'B+ tree'].forEach(function (h, i) {
      var cx = x0 + cw.slice(0, i).reduce(function (a, b) { return a + b; }, 0);
      txt(cx + 10, y0 + 11, h, { size: 11, mono: true, bold: true, base: 'middle', color: PAL.ink });
    });
    rows.forEach(function (row, ri) {
      var ry = y0 + rh * (ri + 1);
      box(x0, ry, 820, rh, { fill: PAL.surface, stroke: PAL.border, radius: 3, sw: 0.8 });
      row.forEach(function (cell, ci) {
        var cx = x0 + cw.slice(0, ci).reduce(function (a, b) { return a + b; }, 0);
        txt(cx + 10, ry + 11, cell, { size: 11, mono: ci > 0, base: 'middle', color: ci === 0 ? PAL.dim : PAL.ink });
      });
    });
    P.alpha(1);
  }
}

/* ---------------- scene 10: the procedure ---------------- */
function scDecide(t) {
  head('The five-step procedure these questions actually reward',
    'every question in this area is one of two computations');

  var steps = [
    { a: 0, n: '1', t: 'Name the node', b: 'Internal or leaf? B+ or B-tree? Each has a different byte equation.' },
    { a: 4, n: '2', t: 'Write the inequality', b: 'pointers\u00d7size + keys\u00d7size \u2264 block. Solve, then floor.' },
    { a: 9, n: '3', t: 'Read what is asked', b: 'Pointers, keys, or entries are three different numbers.' },
    { a: 14, n: '4', t: 'Occupancy', b: 'order = max keys + 1; min keys = \u2308order/2\u2309 - 1; root exempt.' },
    { a: 19, n: '5', t: 'Cost, or count', b: 'fan-out \u2192 levels \u2192 +1 record block; or descent + leaves scanned.' }
  ];
  steps.forEach(function (s, i) {
    var p = rv(t, s.a, 2);
    if (p <= 0) return;
    var y = 76 + i * 62;
    P.alpha(ease(p));
    box(40, y, 820, 54, { fill: i === 4 ? PAL.accentDim : PAL.surface, stroke: i === 4 ? PAL.accent : PAL.border, radius: 8 });
    txt(56, y + 27, s.n, { size: 20, mono: true, bold: true, base: 'middle', color: PAL.accent });
    txt(90, y + 16, s.t, { size: 13, bold: true, color: PAL.ink });
    txt(90, y + 36, s.b, { size: 11, mono: true, color: PAL.dim });
    P.alpha(1);
  });

  var f = rv(t, 25, 3);
  if (f > 0) {
    P.alpha(ease(f));
    box(40, 392, 820, 50, { fill: PAL.warnDim, stroke: PAL.warn, radius: 8 });
    txt(56, 408, 'The two lost marks, every year', { size: 12, bold: true, color: PAL.warn });
    txt(56, 428, 'forgetting the final record block, and treating an open upper bound as closed.', { size: 12, color: PAL.ink });
    P.alpha(1);
  }
}

var SCENES = {
  cost: scCost, files: scFiles, btree: scBtree, bplus: scBplus, order: scOrder,
  insert: scInsert, del: scDel, query: scQuery, why: scWhy, decide: scDecide
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
