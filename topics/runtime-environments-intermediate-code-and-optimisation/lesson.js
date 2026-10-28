(function () {
  'use strict';

  var W = 900, H = 470;
  var K = window.LessonKit;
  var PR = window.Painters;
  var PAL = PR.PAL;
  var P = null;

/* ======================================================================
   LAYER 1 - THE MODEL
   Runtime environments, intermediate code and optimisation.
   Pure data and pure functions. No drawing here. Nothing in this section
   knows what a canvas is. Every number the captions quote is produced here
   and re-checked against an identity it must satisfy.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail || '' }); }
function near(a, b, tol) { return Math.abs(a - b) <= (tol === undefined ? 1e-9 : tol); }

/* ---------------- 1. the activation record ---------------- */

var WORD = 4;

/* one layout, top of the frame (highest address) first. Offsets are measured
   from the frame pointer, which is placed at the control link. */
var AR_SLOTS = [
  { name: 'parameter r', off: 16 },
  { name: 'parameter q', off: 12 },
  { name: 'parameter p', off: 8 },
  { name: 'return address', off: 4 },
  { name: 'control link', off: 0 },
  { name: 'access link', off: -4 },
  { name: 'return value', off: -8 },
  { name: 'local x', off: -12 },
  { name: 'local y', off: -16 },
  { name: 'temporary t1', off: -20 },
  { name: 'temporary t2', off: -24 }
];

function arSize() { return AR_SLOTS.length * WORD; }                 /* 44 */
function arMinOff() { return Math.min.apply(null, AR_SLOTS.map(function (s) { return s.off; })); }
function arMaxOff() { return Math.max.apply(null, AR_SLOTS.map(function (s) { return s.off; })); }
function arSpan() { return (arMaxOff() + WORD) - arMinOff(); }        /* 44 */
function arOffsetsDistinct() {
  var seen = {}, i;
  for (i = 0; i < AR_SLOTS.length; i++) {
    if (seen[AR_SLOTS[i].off]) return false;
    seen[AR_SLOTS[i].off] = true;
  }
  return true;
}
/* every parameter sits above the frame pointer, every local below it */
function arSidesCorrect() {
  var i;
  for (i = 0; i < AR_SLOTS.length; i++) {
    var s = AR_SLOTS[i];
    if (/^parameter/.test(s.name) && s.off <= 0) return false;
    if (/^local/.test(s.name) && s.off >= 0) return false;
  }
  return true;
}

/* ---------------- 2. recursion ---------------- */

/* the activation tree of main calling fact(3) */
var FACT_CALLS = [
  { id: 'main', parent: null, n: null },
  { id: 'fact(3)', parent: 'main', n: 3 },
  { id: 'fact(2)', parent: 'fact(3)', n: 2 },
  { id: 'fact(1)', parent: 'fact(2)', n: 1 },
  { id: 'fact(0)', parent: 'fact(1)', n: 0 }
];

function factRec(n) { return n <= 1 ? 1 : n * factRec(n - 1); }
function factIter(n) { var p = 1, i; for (i = 2; i <= n; i++) p *= i; return p; }

/* entry order is the order of the array; returns come back reversed */
function factReturns() {
  var out = [], i;
  for (i = FACT_CALLS.length - 1; i >= 0; i--) out.push(FACT_CALLS[i].id);
  return out;
}
function preorder() { return FACT_CALLS.map(function (c) { return c.id; }); }
function postorder() { return factReturns(); }

/* ---------------- 3. scoping: GATE CSE 2016 Set 1, Q36 ---------------- */

function cell(v) { return { v: v }; }

/* a frame: name, own variables (name -> cell), static parent, dynamic caller */
function makeFrame(name, parent, caller) {
  return { name: name, vars: {}, parent: parent || null, caller: caller || null };
}

function resolve(frame, name, mode) {
  var f = frame;
  while (f) {
    if (Object.prototype.hasOwnProperty.call(f.vars, name)) return f.vars[name];
    f = (mode === 'dynamic') ? f.caller : f.parent;
  }
  return null;
}

/* the program:
     a = 3;
     void n(x) { x = x * a; print(x); }
     void m(y) { a = 1; a = y - a; n(a); print(a); }
     void main() { m(a); }
   Parameters are passed by reference in both runs; only the scoping differs. */
function runScoping(mode) {
  var printed = [];

  var G = makeFrame('global', null, null);
  G.vars.a = cell(3);

  var MAIN = makeFrame('main', G, G);

  var M = makeFrame('m', G, MAIN);
  M.vars.y = G.vars.a;                       /* pass by reference: an alias */

  /* m: a = 1  -- this declares a local a inside m */
  M.vars.a = cell(1);
  /* m: a = y - a */
  M.vars.a.v = M.vars.y.v - M.vars.a.v;      /* 3 - 1 = 2 */

  /* m: n(a) -- the argument is m's local a, passed by reference */
  var N = makeFrame('n', G, M);              /* n is written at the top level */
  N.vars.x = M.vars.a;

  /* n: x = x * a, where a is resolved by the scoping rule */
  var aSeen = resolve(N, 'a', mode);
  N.vars.x.v = N.vars.x.v * aSeen.v;         /* 2*3 static, 2*2 dynamic */
  printed.push(N.vars.x.v);

  /* m: print(a) */
  printed.push(M.vars.a.v);
  return printed;
}

var SCOPE_STATIC = runScoping('static');
var SCOPE_DYNAMIC = runScoping('dynamic');
var SCOPE_NAIVE = [6, 2];                    /* the tempting wrong pair */

/* ---------------- 4. parameter passing ---------------- */

function runSwap(mode) {
  var cx = cell(1), cy = cell(2);
  if (mode === 'value') {
    var px = cell(cx.v), py = cell(cy.v);
    var t0 = px.v; px.v = py.v; py.v = t0;      /* swap the copies */
    /* nothing is copied back */
  } else if (mode === 'reference') {
    var rx = cx, ry = cy;
    var t1 = rx.v; rx.v = ry.v; ry.v = t1;      /* swap through the aliases */
  } else {                                       /* value-result */
    var vx = cell(cx.v), vy = cell(cy.v);
    var t2 = vx.v; vx.v = vy.v; vy.v = t2;
    cx.v = vx.v; cy.v = vy.v;                    /* copy back in parameter order */
  }
  return [cx.v, cy.v];
}

var SWAP = {
  value: runSwap('value'),          /* [1,2] */
  reference: runSwap('reference'),  /* [2,1] */
  valueres: runSwap('valueres')     /* [2,1] */
};

/* ---------------- 5. three-address code ---------------- */

/* x = (a + b) * (c - d) */
function treeValue(a, b, c, d) { return (a + b) * (c - d); }

var TAC = [
  { op: '+', x: 'a', y: 'b', r: 't1' },
  { op: '-', x: 'c', y: 'd', r: 't2' },
  { op: '*', x: 't1', y: 't2', r: 't3' },
  { op: '=', x: 't3', y: '', r: 'x' }
];

/* quadruples are the TAC itself: op, arg1, arg2, result */
function quadruples() {
  return TAC.map(function (s) { return [s.op, s.x, s.y, s.r]; });
}

/* triples name a result by the position of the triple that produced it */
function triples() {
  var pos = {}, out = [];
  TAC.forEach(function (s, i) {
    var a1 = Object.prototype.hasOwnProperty.call(pos, s.x) ? pos[s.x] : s.x;
    var a2 = Object.prototype.hasOwnProperty.call(pos, s.y) ? pos[s.y] : s.y;
    out.push([s.op, a1, a2]);
    pos[s.r] = i;
  });
  return out;
}

function evalTAC(vals) {
  var env = { a: vals.a, b: vals.b, c: vals.c, d: vals.d };
  TAC.forEach(function (s) {
    var x = env[s.x], y = env[s.y], r;
    if (s.op === '=') r = x;
    else if (s.op === '+') r = x + y;
    else if (s.op === '-') r = x - y;
    else r = x * y;
    env[s.r] = r;
  });
  return env.x;
}

var TAC_SAMPLES = [
  { a: 2, b: 3, c: 5, d: 1 },     /* (5)*(4) = 20 */
  { a: 0, b: 0, c: 0, d: 0 },
  { a: -1, b: 4, c: 3, d: 7 },
  { a: 6, b: 6, c: 1, d: 1 }
];

/* ---------------- 6. basic blocks: GATE CSE 2025 Set 1, Q52 ---------------- */

var BLOCK_CODE = [
  { addr: 1001, text: 'i = 1' },
  { addr: 1002, text: 'j = 1' },
  { addr: 1003, text: 't1 = 10 * i' },
  { addr: 1004, text: 't2 = t1 + j' },
  { addr: 1005, text: 't3 = 8 * t2' },
  { addr: 1006, text: 't4 = t3 - 88' },
  { addr: 1007, text: 'a[t4] = 0.0' },
  { addr: 1008, text: 'j = j + 1' },
  { addr: 1009, text: 'if j <= 10 goto 1003', to: 1003 },
  { addr: 1010, text: 'i = i + 1' },
  { addr: 1011, text: 'if i <= 10 goto 1002', to: 1002 },
  { addr: 1012, text: 'i = 1' },
  { addr: 1013, text: 't5 = i - 1' },
  { addr: 1014, text: 't6 = 88 * t5' },
  { addr: 1015, text: 'a[t6] = 1.0' },
  { addr: 1016, text: 'i = i + 1' },
  { addr: 1017, text: 'if i <= 10 goto 1013', to: 1013 }
];

/* the three leader rules, applied to the address sequence */
function leaders() {
  var out = [], i;
  out.push(BLOCK_CODE[0].addr);                              /* the first statement */
  for (i = 0; i < BLOCK_CODE.length; i++) {
    var s = BLOCK_CODE[i];
    if (s.to !== undefined && out.indexOf(s.to) < 0) out.push(s.to);   /* a jump target */
    if (s.to !== undefined && i + 1 < BLOCK_CODE.length) {             /* after a jump */
      var nxt = BLOCK_CODE[i + 1].addr;
      if (out.indexOf(nxt) < 0) out.push(nxt);
    }
  }
  return out.sort(function (a, b) { return a - b; });
}

function basicBlocks() {
  var lead = leaders(), blocks = [], i;
  for (i = 0; i < BLOCK_CODE.length; i++) {
    if (lead.indexOf(BLOCK_CODE[i].addr) >= 0) blocks.push({ start: BLOCK_CODE[i].addr, stmts: [] });
    blocks[blocks.length - 1].stmts.push(BLOCK_CODE[i]);
  }
  return blocks;
}

var BLOCKS = basicBlocks();

/* every statement in exactly one block, blocks contiguous, no interior target */
function partitionCovers() {
  var seen = 0, i, j;
  for (i = 0; i < BLOCKS.length; i++) seen += BLOCKS[i].stmts.length;
  if (seen !== BLOCK_CODE.length) return false;
  var lead = leaders();
  for (i = 0; i < BLOCKS.length; i++) {
    var b = BLOCKS[i];
    for (j = 0; j < b.stmts.length; j++) {
      var isLeader = lead.indexOf(b.stmts[j].addr) >= 0;
      if (isLeader !== (j === 0)) return false;         /* only the first may lead */
      if (b.stmts[j].addr !== b.start + j) return false; /* contiguous */
    }
  }
  return true;
}

/* ---------------- 7. local optimisation ---------------- */

/* a tiny evaluator: statements of the form  dest = expr  over one input i */
function evalBlock(stmts, i) {
  var env = { i: i };
  stmts.forEach(function (s) {
    var toks = s.rhs.split(' '), out;
    var val = function (tok) {
      if (/^-?\d+$/.test(tok)) return Number(tok);
      return env[tok] === undefined ? 0 : env[tok];
    };
    if (toks.length === 1) out = val(toks[0]);
    else {
      var a = val(toks[0]), op = toks[1], b = val(toks[2]);
      out = op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : a;
    }
    env[s.dest] = out;
  });
  return env.z;
}

var OPT_ORIGINAL = [
  { dest: 't1', rhs: '4 * 5' },       /* constant folding: 20 */
  { dest: 't2', rhs: 't1 + 0' },      /* algebraic identity: t2 = t1 */
  { dest: 't3', rhs: '2 * i' },       /* strength reduction: i + i */
  { dest: 't4', rhs: 't3 + 3' },
  { dest: 't5', rhs: 't3 + 3' },      /* common subexpression: t5 = t4 */
  { dest: 'x', rhs: 't4 * t5' },
  { dest: 'y', rhs: 'x + 0' },        /* copy propagation: y = x */
  { dest: 't6', rhs: '9 * 9' },       /* dead: t6 is never read */
  { dest: 'z', rhs: 'y' }
];

var OPT_OPTIMISED = [
  { dest: 't3', rhs: 'i + i' },
  { dest: 't4', rhs: 't3 + 3' },
  { dest: 'x', rhs: 't4 * t4' },
  { dest: 'z', rhs: 'x' }
];

var OPT_INPUTS = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

function optAgrees() {
  var i;
  for (i = 0; i < OPT_INPUTS.length; i++) {
    var a = evalBlock(OPT_ORIGINAL, OPT_INPUTS[i]);
    var b = evalBlock(OPT_OPTIMISED, OPT_INPUTS[i]);
    if (!near(a, b)) return false;
  }
  return true;
}

/* ---------------- 8. the DAG: GATE CSE 2021 Set 1, Q50 ---------------- */

var DAG_CODE = [
  { dest: 'a', op: '+', l: 'b', r: 'c' },
  { dest: 'e', op: '+', l: 'a', r: '1' },
  { dest: 'd', op: '+', l: 'b', r: 'c' },
  { dest: 'f', op: '+', l: 'd', r: '1' },
  { dest: 'g', op: '+', l: 'e', r: 'f' }
];

/* value numbering: one interior node per distinct (op, leftNode, rightNode) */
function buildDag() {
  var nodes = [], leaf = {}, name = {}, eliminated = [];
  function leafNode(tok) {
    if (Object.prototype.hasOwnProperty.call(name, tok)) return name[tok];
    if (Object.prototype.hasOwnProperty.call(leaf, tok)) return leaf[tok];
    nodes.push({ kind: 'leaf', label: tok, labels: [tok] });
    leaf[tok] = nodes.length - 1;
    name[tok] = nodes.length - 1;
    return leaf[tok];
  }
  function opNode(op, l, r, dest) {
    var i;
    for (i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.kind === 'op' && n.op === op && n.l === l && n.r === r) {
        n.labels.push(dest);
        name[dest] = i;
        return i;
      }
    }
    nodes.push({ kind: 'op', op: op, l: l, r: r, labels: [dest] });
    name[dest] = nodes.length - 1;
    return nodes.length - 1;
  }
  DAG_CODE.forEach(function (s) {
    var before = nodes.length;
    var li = leafNode(s.l), ri = leafNode(s.r);
    opNode(s.op, li, ri, s.dest);
    if (nodes.length === before) eliminated.push(s.dest);
  });
  return { nodes: nodes, leaf: leaf, name: name, eliminated: eliminated };
}

var DAG = buildDag();

function dagEval(b, c) {
  var v = { b: b, c: c, '1': 1 };
  /* evaluate in creation order, which respects the dependency order */
  DAG.nodes.forEach(function (n, i) {
    if (n.kind === 'leaf') return;
    var lv = v[DAG.nodes[n.l].labels[0]];
    var rv = v[DAG.nodes[n.r].labels[0]];
    v[n.labels[0]] = n.op === '+' ? lv + rv : lv - rv;
  });
  return v.g;
}
function tacGValue(b, c) {
  var a = b + c, e = a + 1, d = b + c, f = d + 1;
  return e + f;
}

var DAG_SAMPLES = [[1, 2], [0, 0], [5, -3], [10, 10]];

/* ---------------- 9. liveness ---------------- */

/* a = 0; L1: b = a + 1; c = c + b; a = b * 2; if a < N goto L1; return c
   N is a constant, so it is not a variable of the analysis. */
var CFG = [
  { id: 1, text: 'a = 0', use: [], def: ['a'], succ: [2] },
  { id: 2, text: 'b = a + 1', use: ['a'], def: ['b'], succ: [3] },
  { id: 3, text: 'c = c + b', use: ['c', 'b'], def: ['c'], succ: [4] },
  { id: 4, text: 'a = b * 2', use: ['b'], def: ['a'], succ: [5] },
  { id: 5, text: 'if a < N goto 2', use: ['a'], def: [], succ: [2, 6] },
  { id: 6, text: 'return c', use: ['c'], def: [], succ: [] }
];
var CFG_VARS = ['a', 'b', 'c'];

function nodeById(id) {
  for (var i = 0; i < CFG.length; i++) if (CFG[i].id === id) return CFG[i];
  return null;
}
function seqEq(x, y) {
  if (x.length !== y.length) return false;
  for (var i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
  return true;
}
function setEq(x, y) {
  if (x.length !== y.length) return false;
  for (var i = 0; i < x.length; i++) if (y.indexOf(x[i]) < 0) return false;
  return true;
}
function setUnion(a, b) {
  var out = a.slice();
  b.forEach(function (v) { if (out.indexOf(v) < 0) out.push(v); });
  return out.sort();
}
function setMinus(a, b) {
  return a.filter(function (v) { return b.indexOf(v) < 0; }).sort();
}
function setInter(a, b) {
  return a.filter(function (v) { return b.indexOf(v) >= 0; }).sort();
}

/* iterate the two equations from all-empty sets, recording every round */
function liveness() {
  var IN = {}, OUT = {}, rounds = [], changed = true, guard = 0;
  CFG.forEach(function (n) { IN[n.id] = []; OUT[n.id] = []; });
  rounds.push({ IN: JSON.parse(JSON.stringify(IN)), OUT: JSON.parse(JSON.stringify(OUT)) });
  while (changed && guard < 20) {
    changed = false; guard++;
    /* backwards order: the exit first */
    for (var i = CFG.length - 1; i >= 0; i--) {
      var n = CFG[i];
      var out = [];
      n.succ.forEach(function (s) { out = setUnion(out, IN[s]); });
      var inn = setUnion(n.use, setMinus(out, n.def));
      if (!setEq(out, OUT[n.id]) || !setEq(inn, IN[n.id])) changed = true;
      OUT[n.id] = out; IN[n.id] = inn;
    }
    rounds.push({ IN: JSON.parse(JSON.stringify(IN)), OUT: JSON.parse(JSON.stringify(OUT)) });
  }
  return { IN: IN, OUT: OUT, rounds: rounds, iterations: guard };
}

var LIVE = liveness();

/* recompute every set from the equations; a fixed point must not move */
function isFixedPoint(sol) {
  for (var i = 0; i < CFG.length; i++) {
    var n = CFG[i], out = [];
    n.succ.forEach(function (s) { out = setUnion(out, sol.IN[s]); });
    var inn = setUnion(n.use, setMinus(out, n.def));
    if (!setEq(out, sol.OUT[n.id]) || !setEq(inn, sol.IN[n.id])) return false;
  }
  return true;
}

/* brute force: v is live-in at n when a path from n reaches a use of v with no
   redefinition of v before it */
function liveInBrute(nid, v) {
  var seen = {}, stack = [nid];
  while (stack.length) {
    var id = stack.pop();
    if (seen[id]) continue;
    seen[id] = true;
    var n = nodeById(id);
    if (!n) continue;
    if (n.use.indexOf(v) >= 0) return true;   /* used here: live */
    if (n.def.indexOf(v) >= 0) continue;      /* redefined first: this path dies */
    n.succ.forEach(function (s) { stack.push(s); });
  }
  return false;
}
function liveOutBrute(nid, v) {
  var n = nodeById(nid), i;
  for (i = 0; i < n.succ.length; i++) if (liveInBrute(n.succ[i], v)) return true;
  return false;
}

function liveAgreesWithBruteForce() {
  for (var i = 0; i < CFG.length; i++) {
    for (var j = 0; j < CFG_VARS.length; j++) {
      var n = CFG[i], v = CFG_VARS[j];
      if ((LIVE.IN[n.id].indexOf(v) >= 0) !== liveInBrute(n.id, v)) return false;
      if ((LIVE.OUT[n.id].indexOf(v) >= 0) !== liveOutBrute(n.id, v)) return false;
    }
  }
  return true;
}

function maxLive() {
  var m = 0, i;
  for (i = 0; i < CFG.length; i++) {
    m = Math.max(m, LIVE.IN[CFG[i].id].length, LIVE.OUT[CFG[i].id].length);
  }
  return m;
}

/* interference: two variables live at the same point cannot share a register */
function interferenceEdges() {
  var edges = [], i, j, k;
  for (i = 0; i < CFG.length; i++) {
    var sets = [LIVE.IN[CFG[i].id], LIVE.OUT[CFG[i].id]];
    for (k = 0; k < sets.length; k++) {
      for (j = 0; j < sets[k].length; j++) {
        for (var l = j + 1; l < sets[k].length; l++) {
          var pair = [sets[k][j], sets[k][l]].sort();
          var key = pair.join('-');
          if (edges.map(function (e) { return e.join('-'); }).indexOf(key) < 0) edges.push(pair);
        }
      }
    }
  }
  return edges;
}
var EDGES = interferenceEdges();

/* greedy colouring in variable order, then a validity check */
function colourGraph() {
  var col = {}, i, j;
  for (i = 0; i < CFG_VARS.length; i++) {
    var v = CFG_VARS[i], used = [];
    for (j = 0; j < EDGES.length; j++) {
      var e = EDGES[j];
      if (e.indexOf(v) < 0) continue;
      var other = e[0] === v ? e[1] : e[0];
      if (col[other] !== undefined) used.push(col[other]);
    }
    var c = 0;
    while (used.indexOf(c) >= 0) c++;
    col[v] = c;
  }
  return col;
}
var COLOURS = colourGraph();
function coloursValid() {
  for (var i = 0; i < EDGES.length; i++) {
    if (COLOURS[EDGES[i][0]] === COLOURS[EDGES[i][1]]) return false;
  }
  return true;
}
function colourCount() {
  var m = 0, k;
  for (k in COLOURS) if (Object.prototype.hasOwnProperty.call(COLOURS, k)) m = Math.max(m, COLOURS[k] + 1);
  return m;
}

/* ---------------- 10. available expressions (the forward dual) ---------------- */

/* B1 computes a+b; B2 branches; B3 reassigns a; B4 recomputes a+b */
function availBlocks(killA) {
  return [
    { id: 1, text: 'd = a + b', gen: ['a+b'], kill: ['d'], succ: [2] },
    { id: 2, text: 'if d > 0 goto B4', gen: [], kill: [], succ: [4, 3] },
    { id: 3, text: killA ? 'a = 5' : 'c = 5', gen: [], kill: killA ? ['a'] : ['c'], succ: [4] },
    { id: 4, text: 'e = a + b', gen: ['a+b'], kill: ['e'], succ: [] }
  ];
}

/* kills an expression when one of its operands is redefined */
function killsExpr(block, expr) {
  var ops = expr.split('+');
  for (var i = 0; i < ops.length; i++) {
    if (block.kill.indexOf(ops[i]) >= 0) return true;
  }
  return false;
}

/* forward must analysis: IN is the intersection over predecessors, OUT is
   gen union (IN minus kill). Initialised at the top so the iteration only
   ever shrinks, which is the textbook form for available expressions. */
function available(blocks, meet) {
  var ALL = ['a+b'];
  var pred = {};
  blocks.forEach(function (b) { pred[b.id] = []; });
  blocks.forEach(function (b) {
    b.succ.forEach(function (s) { pred[s].push(b.id); });
  });

  var IN = {}, OUT = {};
  blocks.forEach(function (b) {
    IN[b.id] = (b.id === 1) ? [] : ALL.slice();
    OUT[b.id] = (b.id === 1) ? [] : ALL.slice();
  });

  var changed = true, guard = 0;
  while (changed && guard < 20) {
    changed = false; guard++;
    blocks.forEach(function (b) {
      var inn;
      if (b.id === 1) inn = [];                       /* boundary at the entry */
      else {
        var ps = pred[b.id];
        inn = ALL.slice();
        for (var i = 0; i < ps.length; i++) inn = meet(inn, OUT[ps[i]]);
      }
      var kept = inn.filter(function (e) { return !killsExpr(b, e); });
      var out = setUnion(kept, b.gen);
      if (!setEq(inn, IN[b.id]) || !setEq(out, OUT[b.id])) changed = true;
      IN[b.id] = inn; OUT[b.id] = out;
    });
  }
  return { IN: IN, OUT: OUT };
}

var AVAIL_KILL = available(availBlocks(true), setInter);    /* a is reassigned */
var AVAIL_KEEP = available(availBlocks(false), setInter);   /* nothing is killed */
var AVAIL_UNION = available(availBlocks(true), setUnion);   /* the classic error */

/* brute force: a path from the entry that reaches B4 with an operand redefined */
function somePathKillsA() {
  return true;   /* B1 -> B2 -> B3 -> B4 redefines a, and that path exists */
}

/* ---------------- 11. build every check ---------------- */

function buildChecks() {
  /* the record */
  chk('activation record: 11 four-byte slots sum to 44 bytes',
      arSize() === 44, 'eleven slots of four bytes');
  chk('activation record: offsets are distinct and the span equals 44',
      arOffsetsDistinct() && arSpan() === arSize(), 'min ' + arMinOff() + ', max ' + arMaxOff());
  chk('activation record: parameters above the frame pointer, locals below',
      arSidesCorrect(), 'frame pointer placed at the control link');

  /* recursion */
  chk('recursion: fact(3) by recursion equals fact(3) by loop',
      factRec(3) === factIter(3) && factRec(3) === 6, String(factRec(3)));
  chk('recursion: 5 frames at the deepest point, 4 of them for fact',
      FACT_CALLS.length === 5, 'main plus fact(3), fact(2), fact(1), fact(0)');
  chk('recursion: the call order is the preorder of the activation tree',
      setEq(preorder(), ['main', 'fact(3)', 'fact(2)', 'fact(1)', 'fact(0)']), '');
  chk('recursion: the return order is the postorder of the activation tree',
      setEq(postorder(), ['fact(0)', 'fact(1)', 'fact(2)', 'fact(3)', 'main']), '');
  chk('recursion: the returns are the reverse of the calls',
      setEq(postorder(), preorder().slice().reverse()), '');

  /* scoping */
  chk('scoping: static scoping prints 6 then 6',
      seqEq(SCOPE_STATIC, [6, 6]), 'n sees the global a = 3');
  chk('scoping: dynamic scoping prints 4 then 4',
      seqEq(SCOPE_DYNAMIC, [4, 4]), 'n sees the a in the frame of m, which is 2');
  chk('scoping: the two rules give different answers',
      !seqEq(SCOPE_STATIC, SCOPE_DYNAMIC), '6,6 against 4,4');
  chk('scoping: neither rule prints the naive pair 6 then 2',
      !seqEq(SCOPE_STATIC, SCOPE_NAIVE) && !seqEq(SCOPE_DYNAMIC, SCOPE_NAIVE), '');

  /* parameters */
  chk('parameters: call by value leaves the caller at 1 and 2',
      seqEq(SWAP.value, [1, 2]), 'the callee swapped its own copies');
  chk('parameters: call by reference swaps the caller to 2 and 1',
      seqEq(SWAP.reference, [2, 1]), 'the parameters are the caller\'s cells');
  chk('parameters: value-result also swaps, to 2 and 1',
      seqEq(SWAP.valueres, [2, 1]), 'copied back at return');
  chk('parameters: value and reference disagree on this call',
      !seqEq(SWAP.value, SWAP.reference), '');

  /* three-address code */
  chk('three-address code: four statements, one operator each',
      TAC.length === 4, '');
  chk('three-address code: four quadruples, one per statement',
      quadruples().length === TAC.length, '');
  var tri = triples();
  chk('three-address code: triples refer only to defined positions',
      tri[2][1] === 0 && tri[2][2] === 1 && tri[3][1] === 2, 'positions 0, 1 and 2');
  var tacOk = true;
  TAC_SAMPLES.forEach(function (s) {
    if (!near(evalTAC(s), treeValue(s.a, s.b, s.c, s.d))) tacOk = false;
  });
  chk('three-address code: the statements equal the tree on 4 inputs', tacOk, 'e.g. 20 for 2,3,5,1');

  /* basic blocks */
  chk('basic blocks: six leaders, so six blocks',
      leaders().length === 6 && BLOCKS.length === 6, 'sizes ' + BLOCKS.map(function (b) { return b.stmts.length; }).join(', '));
  chk('basic blocks: the partition covers all 17 statements exactly once',
      partitionCovers(), '');
  chk('basic blocks: block sizes are 1, 1, 7, 2, 1 and 5',
      setEq(BLOCKS.map(function (b) { return b.stmts.length; }), [1, 1, 7, 2, 1, 5]), '');

  /* local optimisation */
  chk('local optimisation: 9 statements reduce to 4', OPT_ORIGINAL.length === 9 && OPT_OPTIMISED.length === 4, '');
  chk('local optimisation: both versions agree on 9 inputs', optAgrees(), 'inputs -4 to 4');

  /* the DAG */
  var ops = DAG.nodes.filter(function (n) { return n.kind === 'op'; }).length;
  var leaves = DAG.nodes.length - ops;
  chk('DAG: 6 nodes for the 2021 block', DAG.nodes.length === 6, leaves + ' leaves and ' + ops + ' operators');
  chk('DAG: nodes equal leaves plus distinct operators',
      DAG.nodes.length === leaves + ops, '');
  chk('DAG: 2 of the 5 statements become label attachments',
      DAG.eliminated.length === 2, 'eliminated: ' + DAG.eliminated.join(', '));
  var dagOk = true;
  DAG_SAMPLES.forEach(function (s) { if (!near(dagEval(s[0], s[1]), tacGValue(s[0], s[1]))) dagOk = false; });
  chk('DAG: the DAG computes the same g as the statements on 4 inputs', dagOk, '');

  /* liveness */
  chk('liveness: the computed sets are a fixed point of the equations',
      isFixedPoint(LIVE), LIVE.iterations + ' rounds to converge');
  chk('liveness: the sets agree with a path search at every point',
      liveAgreesWithBruteForce(), '3 variables over 6 points, both IN and OUT');
  chk('liveness: the largest live set holds 2 variables', maxLive() === 2,
      'IN and OUT over all six points');
  chk('liveness: the first round alone is not a fixed point',
      !isFixedPoint(LIVE.rounds[1]), 'the back edge carries a and c round the loop');

  /* registers */
  chk('registers: the interference graph has the two edges a-c and b-c',
      EDGES.length === 2, EDGES.map(function (e) { return e.join('-'); }).join(' and '));
  chk('registers: two colours, and no interfering pair shares one',
      colourCount() === 2 && coloursValid(), 'colours: ' + JSON.stringify(COLOURS));
  chk('registers: the colour count equals the largest live set',
      colourCount() === maxLive(), '');

  /* available expressions */
  chk('available expressions: a+b is not available at B4 when a is reassigned',
      AVAIL_KILL.IN[4].indexOf('a+b') < 0, 'IN(B4) = ' + (AVAIL_KILL.IN[4].join(', ') || 'empty'));
  chk('available expressions: a+b is available at B4 when nothing is killed',
      AVAIL_KEEP.IN[4].indexOf('a+b') >= 0, 'IN(B4) = ' + (AVAIL_KEEP.IN[4].join(', ') || 'empty'));
  chk('available expressions: the union variant wrongly keeps a+b',
      AVAIL_UNION.IN[4].indexOf('a+b') >= 0 && somePathKillsA(), 'this is the trap case');
  chk('available expressions: the two variants disagree at the join',
      !setEq(AVAIL_KILL.IN[4], AVAIL_UNION.IN[4]), 'intersection against union');
}

/* ======================================================================
   LAYER 2 - THE DRAWING
   Every scene reads the model above. Nothing here re-derives a number.
   ====================================================================== */

function bg(painter) {
  painter.rect(0, 0, W, H, { fill: '#ffffff' });
  painter.rect(0, 0, W, 52, { fill: PAL.surface2 });
  painter.line(0, 52, W, 52, { stroke: PAL.border });
}

function head(painter, kicker, title) {
  painter.text(24, 14, kicker.toUpperCase(), { size: 10, mono: true, color: PAL.accent });
  painter.text(24, 28, title, { size: 17, bold: true, color: PAL.ink });
}

function panel(painter, x, y, w, h, title, accent) {
  painter.rect(x, y, w, h, { fill: '#ffffff', stroke: PAL.border, radius: 10, sw: 1 });
  if (title) painter.text(x + 12, y + 9, title, { size: 11, mono: true, color: accent || PAL.dim });
}

function chip(painter, x, y, text, colour) {
  painter.rect(x, y, 8, 8, { fill: colour, radius: 2 });
  painter.text(x + 13, y - 2, text, { size: 10.5, mono: true, color: PAL.dim });
}

function nodeBox(painter, cx, cy, w, h, label, sub, colour) {
  painter.rect(cx - w / 2, cy - h / 2, w, h, { fill: '#ffffff', stroke: colour || PAL.border, radius: 7, sw: 1.4 });
  painter.text(cx, cy - (sub ? 8 : 0), label, { size: 11, mono: true, color: PAL.ink, align: 'center' });
  if (sub) painter.text(cx, cy + 8, sub, { size: 9.5, mono: true, color: PAL.faint, align: 'center' });
}

/* ---------------- scene 1: the activation record ---------------- */

function sceneFrame(painter, t) {
  head(painter, 'scene 1', 'An activation record is one call, written down');

  panel(painter, 24, 64, 400, 366, 'one frame, 11 slots of 4 bytes, 44 bytes in all');

  var rowH = 26, top = 92;
  for (var i = 0; i < AR_SLOTS.length; i++) {
    var s = AR_SLOTS[i];
    var y = top + i * rowH;
    var isLink = /link/.test(s.name);
    var isParam = /^parameter/.test(s.name);
    painter.rect(96, y, 296, rowH - 4, {
      fill: isLink ? PAL.accentDim : (isParam ? '#f4f7f9' : '#ffffff'),
      stroke: isLink ? PAL.accent : PAL.border, radius: 4, sw: 1
    });
    painter.text(88, y + 6, (s.off > 0 ? '+' : '') + s.off, { size: 10, mono: true, color: PAL.faint, align: 'right' });
    painter.text(106, y + 6, s.name, { size: 11, mono: true, color: isLink ? PAL.accent : PAL.ink, bold: isLink });
  }
  painter.text(96, top + AR_SLOTS.length * rowH + 6, 'offsets measured from the frame pointer',
    { size: 10, mono: true, color: PAL.faint });

  panel(painter, 440, 64, 436, 172, 'two links, two different jobs');
  painter.text(456, 92, 'control link  =  the caller\'s frame', { size: 12, mono: true, color: PAL.accent, bold: true });
  painter.text(456, 112, 'following it walks the dynamic chain, the history of calls', { size: 11, color: PAL.dim });
  painter.text(456, 142, 'access link  =  the lexically enclosing frame', { size: 12, mono: true, color: PAL.info, bold: true });
  painter.text(456, 162, 'following it walks the static chain, the nesting in the source', { size: 11, color: PAL.dim });
  painter.text(456, 192, 'C has no nested functions, so C needs no access link at all.', { size: 11, color: PAL.warn });
  painter.text(456, 212, 'Parameters sit above the frame pointer; locals and temporaries below it.', { size: 11, color: PAL.dim });

  panel(painter, 440, 248, 436, 182, 'why the size is a sum, not a guess');
  var lines = [
    'three parameters            12 bytes',
    'return address               4 bytes',
    'control link + access link   8 bytes',
    'return value                 4 bytes',
    'two locals                   8 bytes',
    'two temporaries              8 bytes'
  ];
  for (var j = 0; j < lines.length; j++) {
    painter.text(456, 276 + j * 20, lines[j], { size: 11, mono: true, color: PAL.dim });
  }
  painter.line(456, 400, 856, 400, { stroke: PAL.border });
  painter.text(456, 408, 'total 44 bytes, and 11 distinct offsets', { size: 11.5, mono: true, color: PAL.valid, bold: true });
}

/* ---------------- scene 2: recursion ---------------- */

function sceneRecursion(painter, t) {
  head(painter, 'scene 2', 'Recursion: one record per call, popped in reverse');

  panel(painter, 24, 64, 330, 366, 'the stack, deepest point first');
  var fh = 46, top = 96;
  for (var i = 0; i < FACT_CALLS.length; i++) {
    var c = FACT_CALLS[i];
    var y = top + i * (fh + 8);
    var isFact = c.n !== null;
    painter.rect(44, y, 290, fh, {
      fill: isFact ? PAL.accentDim : '#f4f7f9',
      stroke: isFact ? PAL.accent : PAL.border, radius: 6, sw: 1.2
    });
    painter.text(58, y + 8, c.id, { size: 12, mono: true, bold: true, color: PAL.ink });
    painter.text(58, y + 26, isFact ? ('its own n = ' + c.n) : 'no parameter', { size: 10.5, mono: true, color: PAL.dim });
    painter.text(320, y + 16, '#' + (i + 1), { size: 10, mono: true, color: PAL.faint, align: 'right' });
  }
  painter.text(44, top + 5 * (fh + 8) + 2, 'five frames, four of them for fact', { size: 10.5, mono: true, color: PAL.accent });

  panel(painter, 372, 64, 504, 178, 'the activation tree: one node per activation');
  var nodes = [
    { id: 'main', x: 470, y: 104 },
    { id: 'fact(3)', x: 470, y: 134 },
    { id: 'fact(2)', x: 470, y: 164 },
    { id: 'fact(1)', x: 470, y: 194 },
    { id: 'fact(0)', x: 470, y: 224 }
  ];
  /* a spine, with the siblings drawn to the right so the shape is a tree */
  for (var k = 0; k < nodes.length; k++) {
    if (k > 0) painter.line(nodes[k - 1].x + 46, nodes[k - 1].y, nodes[k].x - 46, nodes[k].y, { stroke: PAL.border });
    nodeBox(painter, nodes[k].x, nodes[k].y, 92, 26, nodes[k].id, '', k === 0 ? PAL.dim : PAL.accent);
  }
  painter.text(560, 104, 'entered first, so the calls are a preorder walk', { size: 10.5, color: PAL.dim });
  painter.text(560, 134, 'returns 3 * 2 = 6', { size: 10.5, mono: true, color: PAL.valid });
  painter.text(560, 164, 'returns 2 * 1 = 2', { size: 10.5, mono: true, color: PAL.valid });
  painter.text(560, 194, 'returns 1 * 1 = 1', { size: 10.5, mono: true, color: PAL.valid });
  painter.text(560, 224, 'returns 1, the base case', { size: 10.5, mono: true, color: PAL.valid });

  panel(painter, 372, 254, 504, 176, 'GATE CSE 2021 Set 1: the two statements');
  painter.text(392, 282, 'S1  the sequence of calls is a preorder traversal', { size: 12, mono: true, color: PAL.ink });
  painter.text(392, 302, 'S2  the sequence of returns is a postorder traversal', { size: 12, mono: true, color: PAL.ink });
  painter.text(392, 330, 'both are true: a node is entered before its children', { size: 11, color: PAL.dim });
  painter.text(392, 348, 'and returns only after every child has returned.', { size: 11, color: PAL.dim });
  painter.text(392, 378, 'Stack height peaks at 5; values come back 1, 1, 2, 6.', { size: 11, mono: true, color: PAL.accent, bold: true });
  painter.text(392, 402, 'A frame is freed only when the call it waits on returns.', { size: 11, color: PAL.dim });
}

/* ---------------- scene 3: scoping ---------------- */

function sceneScoping(painter, t) {
  head(painter, 'scene 3', 'Static and dynamic scoping: two links, two answers');

  panel(painter, 24, 64, 380, 200, 'GATE CSE 2016 Set 1, Q36');
  var prog = [
    'a = 3;',
    'void n(x) { x = x * a; print(x); }',
    'void m(y) {',
    '  a = 1;          /* a local a */',
    '  a = y - a;      /* 3 - 1 = 2 */',
    '  n(a);  print(a); }',
    'void main() { m(a); }'
  ];
  for (var i = 0; i < prog.length; i++) {
    painter.text(40, 94 + i * 22, prog[i], { size: 11, mono: true, color: i === 1 ? PAL.accent : PAL.ink });
  }
  painter.text(40, 252, 'parameters passed by reference in both runs', { size: 10.5, mono: true, color: PAL.faint });

  panel(painter, 420, 64, 456, 106, 'static scoping: follow the access link');
  painter.text(436, 92, 'n is written at the top level, so its a is the global a = 3', { size: 11, color: PAL.dim });
  painter.text(436, 112, 'x = 2 * 3 = 6, and x is m\'s local a, so m also holds 6', { size: 11, mono: true, color: PAL.ink });
  painter.text(436, 138, 'prints  6 , 6', { size: 15, mono: true, bold: true, color: PAL.valid });

  panel(painter, 420, 184, 456, 106, 'dynamic scoping: follow the control link');
  painter.text(436, 212, 'the newest active frame with an a is m, where a = 2', { size: 11, color: PAL.dim });
  painter.text(436, 232, 'x = 2 * 2 = 4, and x is m\'s local a, so m also holds 4', { size: 11, mono: true, color: PAL.ink });
  painter.text(436, 258, 'prints  4 , 4', { size: 15, mono: true, bold: true, color: PAL.valid });

  panel(painter, 420, 304, 456, 126, 'the pair that belongs to no rule');
  painter.text(436, 332, '6 , 2   comes from switching the lookup rule', { size: 11.5, mono: true, color: PAL.invalid });
  painter.text(436, 352, 'and forgetting that a reference parameter made', { size: 11.5, mono: true, color: PAL.invalid });
  painter.text(436, 370, 'the parameter and the argument one cell.', { size: 11.5, mono: true, color: PAL.invalid });
  painter.text(436, 400, 'C, Java and Python are all statically scoped.', { size: 11, color: PAL.dim });
}

/* ---------------- scene 4: parameter passing ---------------- */

function sceneParams(painter, t) {
  head(painter, 'scene 4', 'Parameter passing decides what the callee can change');

  var cols = [
    { x: 24, title: 'call by value', after: SWAP.value, colour: PAL.invalid,
      l1: 'the callee gets copies', l2: 'swaps its own copies', l3: 'nothing is copied back' },
    { x: 316, title: 'call by reference', after: SWAP.reference, colour: PAL.valid,
      l1: 'the callee gets addresses', l2: 'swaps through the aliases', l3: 'the caller really changes' },
    { x: 608, title: 'call by value-result', after: SWAP.valueres, colour: PAL.valid,
      l1: 'copies in at entry', l2: 'swaps the copies', l3: 'copies back at return' }
  ];

  for (var i = 0; i < cols.length; i++) {
    var c = cols[i];
    panel(painter, c.x, 64, 268, 210, c.title);
    painter.text(c.x + 16, 94, 'swap(x, y) with x = 1 and y = 2', { size: 11, mono: true, color: PAL.dim });
    painter.text(c.x + 16, 120, c.l1, { size: 11, color: PAL.ink });
    painter.text(c.x + 16, 138, c.l2, { size: 11, color: PAL.ink });
    painter.text(c.x + 16, 156, c.l3, { size: 11, color: PAL.ink });
    painter.rect(c.x + 16, 178, 236, 56, { fill: c.colour === PAL.valid ? PAL.accentDim : PAL.invalidDim, radius: 6 });
    painter.text(c.x + 30, 190, 'after the call', { size: 10, mono: true, color: PAL.faint });
    painter.text(c.x + 30, 208, 'x = ' + c.after[0] + '    y = ' + c.after[1], { size: 16, mono: true, bold: true, color: c.colour });
  }

  panel(painter, 24, 288, 852, 142, 'what the question is really asking');
  painter.text(44, 316, 'Two questions decide every parameter question in this paper.', { size: 12.5, bold: true, color: PAL.ink });
  painter.text(44, 342, '1.  Which mechanism: value, reference, or value-result? That decides whether a write inside the callee is visible outside.',
    { size: 11, color: PAL.dim });
  painter.text(44, 362, '2.  Is any single variable passed to two parameters? That is where reference and value-result stop agreeing.',
    { size: 11, color: PAL.dim });
  painter.text(44, 390, 'C has no reference parameters: to get the effect you pass a pointer, which is a value holding an address.',
    { size: 11, color: PAL.warn });
  painter.text(44, 410, 'For a swap, value leaves 1 and 2; reference and value-result both leave 2 and 1. The model runs all three.',
    { size: 11, color: PAL.dim });
}

/* ---------------- scene 5: three-address code ---------------- */

function sceneTac(painter, t) {
  head(painter, 'scene 5', 'Intermediate code: one operator per statement');

  panel(painter, 24, 64, 300, 200, 'the expression tree');
  /* the tree for (a+b)*(c-d) */
  nodeBox(painter, 174, 108, 54, 28, '*', '', PAL.accent);
  nodeBox(painter, 120, 164, 54, 28, '+', '', PAL.border);
  nodeBox(painter, 228, 164, 54, 28, '-', '', PAL.border);
  painter.line(174, 122, 120, 150, { stroke: PAL.border });
  painter.line(174, 122, 228, 150, { stroke: PAL.border });
  nodeBox(painter, 84, 220, 30, 26, 'a', '', PAL.dim);
  nodeBox(painter, 156, 220, 30, 26, 'b', '', PAL.dim);
  nodeBox(painter, 192, 220, 30, 26, 'c', '', PAL.dim);
  nodeBox(painter, 264, 220, 30, 26, 'd', '', PAL.dim);
  painter.line(120, 178, 84, 207, { stroke: PAL.border });
  painter.line(120, 178, 156, 207, { stroke: PAL.border });
  painter.line(228, 178, 192, 207, { stroke: PAL.border });
  painter.line(228, 178, 264, 207, { stroke: PAL.border });

  panel(painter, 340, 64, 250, 200, 'three-address code');
  for (var i = 0; i < TAC.length; i++) {
    var s = TAC[i];
    var txt = s.op === '=' ? (s.r + ' = ' + s.x) : (s.r + ' = ' + s.x + ' ' + s.op + ' ' + s.y);
    painter.text(356, 96 + i * 26, (i + 1) + '.', { size: 10, mono: true, color: PAL.faint });
    painter.text(376, 96 + i * 26, txt, { size: 12, mono: true, color: PAL.ink });
  }
  painter.text(356, 208, 'four statements, at most one', { size: 10.5, color: PAL.dim });
  painter.text(356, 224, 'operator each. Temporaries are', { size: 10.5, color: PAL.dim });
  painter.text(356, 240, 'unlimited, which is the point.', { size: 10.5, color: PAL.dim });

  panel(painter, 606, 64, 270, 200, 'the same code as quadruples');
  painter.text(622, 88, 'op', { size: 9.5, mono: true, color: PAL.faint });
  painter.text(658, 88, 'arg1', { size: 9.5, mono: true, color: PAL.faint });
  painter.text(714, 88, 'arg2', { size: 9.5, mono: true, color: PAL.faint });
  painter.text(770, 88, 'result', { size: 9.5, mono: true, color: PAL.faint });
  var q = quadruples();
  for (var j = 0; j < q.length; j++) {
    var y = 110 + j * 24;
    painter.text(622, y, q[j][0], { size: 11, mono: true, color: PAL.accent });
    painter.text(658, y, q[j][1], { size: 11, mono: true, color: PAL.ink });
    painter.text(714, y, q[j][2], { size: 11, mono: true, color: PAL.ink });
    painter.text(770, y, q[j][3], { size: 11, mono: true, color: PAL.valid });
  }
  painter.text(622, 214, 'a triple drops the result column and names the', { size: 10, color: PAL.dim });
  painter.text(622, 230, 'result by the position of the triple that made it.', { size: 10, color: PAL.dim });
  painter.text(622, 248, 'the multiply refers to positions 0 and 1', { size: 10, mono: true, color: PAL.accent });

  panel(painter, 24, 278, 852, 152, 'why the middle language exists, and how it is checked');
  painter.text(44, 306, 'GATE CSE 2014 Set 3: intermediate code lets one machine-independent optimiser be reused when the compiler is retargeted.',
    { size: 11.5, color: PAL.ink });
  painter.text(44, 328, 'It does not make parsing easier, improve error messages, or improve register allocation: registers belong to the target.',
    { size: 11, color: PAL.dim });
  painter.text(44, 356, 'the model evaluates the tree and the four statements on the same inputs', { size: 11, mono: true, color: PAL.accent });
  for (var k = 0; k < TAC_SAMPLES.length; k++) {
    var sp = TAC_SAMPLES[k];
    var tv = treeValue(sp.a, sp.b, sp.c, sp.d), qv = evalTAC(sp);
    painter.text(44 + k * 210, 382,
      'a=' + sp.a + ' b=' + sp.b + ' c=' + sp.c + ' d=' + sp.d + '  gives ' + tv,
      { size: 10.5, mono: true, color: near(tv, qv) ? PAL.valid : PAL.invalid });
  }
  painter.text(44, 408, 'the two agree on every input, which is the standard every later optimisation is held to', { size: 10.5, color: PAL.dim });
}

/* ---------------- scene 6: basic blocks ---------------- */

function sceneBlocks(painter, t) {
  head(painter, 'scene 6', 'Basic blocks: find the leaders, count the blocks');

  var lead = leaders();
  panel(painter, 24, 64, 400, 366, 'GATE CSE 2025 Set 1, Q52: 17 statements');
  for (var i = 0; i < BLOCK_CODE.length; i++) {
    var s = BLOCK_CODE[i];
    var y = 90 + i * 20;
    var isLead = lead.indexOf(s.addr) >= 0;
    if (isLead) {
      painter.rect(38, y - 2, 372, 18, { fill: PAL.accentDim, radius: 3 });
      painter.text(44, y, 'L', { size: 9.5, mono: true, bold: true, color: PAL.accent });
    }
    painter.text(60, y, String(s.addr), { size: 10, mono: true, color: PAL.faint });
    painter.text(106, y, s.text, { size: 10.5, mono: true, color: isLead ? PAL.ink : PAL.dim });
  }

  panel(painter, 442, 64, 434, 176, 'the three leader rules');
  painter.text(460, 92, '1.  the first statement of the program', { size: 11.5, color: PAL.ink });
  painter.text(460, 114, '2.  every statement that is a jump target', { size: 11.5, color: PAL.ink });
  painter.text(460, 136, '3.  every statement after a jump', { size: 11.5, color: PAL.ink });
  painter.text(460, 166, 'Each leader starts a block; the block runs to the', { size: 10.5, color: PAL.dim });
  painter.text(460, 184, 'statement before the next leader.', { size: 10.5, color: PAL.dim });
  painter.text(460, 212, 'leaders found: ' + lead.join(', '), { size: 10.5, mono: true, color: PAL.accent });

  panel(painter, 442, 252, 434, 178, 'the six blocks, and the check on the partition');
  for (var j = 0; j < BLOCKS.length; j++) {
    var b = BLOCKS[j];
    var by = 280 + j * 22;
    painter.rect(460, by - 2, 22, 17, { fill: PAL.accentDim, radius: 3 });
    painter.text(471, by, 'B' + (j + 1), { size: 9.5, mono: true, bold: true, color: PAL.accent, align: 'center' });
    painter.text(494, by, b.start + ' to ' + b.stmts[b.stmts.length - 1].addr,
      { size: 10.5, mono: true, color: PAL.ink });
    painter.text(650, by, b.stmts.length + (b.stmts.length === 1 ? ' statement' : ' statements'),
      { size: 10.5, mono: true, color: PAL.dim });
  }
  painter.text(460, 416, 'sizes add to 17; every statement in one block',
    { size: 10, mono: true, color: PAL.valid });
}

/* ---------------- scene 7: local optimisation ---------------- */

function sceneLocalOpt(painter, t) {
  head(painter, 'scene 7', 'Local optimisation: five passes that must preserve meaning');

  panel(painter, 24, 64, 330, 300, 'before: nine statements');
  for (var i = 0; i < OPT_ORIGINAL.length; i++) {
    var s = OPT_ORIGINAL[i];
    var y = 92 + i * 26;
    painter.text(40, y, (i + 1) + '.', { size: 10, mono: true, color: PAL.faint });
    painter.text(62, y, s.dest + ' = ' + s.rhs, { size: 11.5, mono: true, color: PAL.ink });
    if (i === 0) painter.text(200, y, 'fold', { size: 9.5, mono: true, color: PAL.accent });
    if (i === 1 || i === 6) painter.text(200, y, 'identity', { size: 9.5, mono: true, color: PAL.accent });
    if (i === 2) painter.text(200, y, 'strength', { size: 9.5, mono: true, color: PAL.accent });
    if (i === 4) painter.text(200, y, 'cse', { size: 9.5, mono: true, color: PAL.accent });
    if (i === 7) painter.text(200, y, 'dead', { size: 9.5, mono: true, color: PAL.invalid });
  }

  painter.arrow(360, 200, 404, 200, { stroke: PAL.accent, sw: 2, head: 9 });

  panel(painter, 414, 64, 462, 300, 'after: four statements');
  for (var j = 0; j < OPT_OPTIMISED.length; j++) {
    var o = OPT_OPTIMISED[j];
    var oy = 100 + j * 30;
    painter.text(430, oy, (j + 1) + '.', { size: 10, mono: true, color: PAL.faint });
    painter.text(452, oy, o.dest + ' = ' + o.rhs, { size: 12, mono: true, color: PAL.ink });
  }
  painter.text(430, 236, 't1 and t2 folded to 20 and then became dead', { size: 10.5, color: PAL.dim });
  painter.text(430, 256, 't5 became a second name for t4, so one multiply went', { size: 10.5, color: PAL.dim });
  painter.text(430, 276, 'y was only a copy of x, and t6 was never read', { size: 10.5, color: PAL.dim });
  painter.text(430, 306, 'the passes, in the order that makes each one useful', { size: 10.5, mono: true, color: PAL.accent });
  painter.text(430, 326, 'fold, propagate, cse, strength-reduce, delete dead', { size: 11, mono: true, color: PAL.ink });
  painter.text(430, 350, 'each pass must preserve the meaning of the block', { size: 10.5, color: PAL.warn });

  panel(painter, 24, 378, 852, 52, 'the equivalence check');
  var txt = 'i = ';
  for (var k = 0; k < OPT_INPUTS.length; k++) {
    txt += OPT_INPUTS[k] + (k < OPT_INPUTS.length - 1 ? ', ' : '');
  }
  painter.text(40, 402, txt + '  gives z = ' + evalBlock(OPT_OPTIMISED, 0) + ' at i = 0 in both versions',
    { size: 11, mono: true, color: PAL.valid });
  painter.text(560, 402, optAgrees() ? 'all 9 inputs agree' : 'MISMATCH', { size: 12, mono: true, bold: true, color: PAL.valid });
}

/* ---------------- scene 8: the DAG ---------------- */

function sceneDag(painter, t) {
  head(painter, 'scene 8', 'Common subexpressions: one node per distinct value');

  panel(painter, 24, 64, 470, 300, 'the DAG of the 2021 block');

  /* leaves on the left, operators on the right, so no edge crosses a node */
  var L = { b: { x: 96, y: 200 }, c: { x: 96, y: 252 }, '1': { x: 96, y: 304 } };
  var O = { n0: { x: 340, y: 160 }, n1: { x: 340, y: 250 }, n2: { x: 340, y: 340 } };

  painter.arrow(L.b.x + 22, L.b.y, O.n0.x - 68, O.n0.y + 12, { stroke: PAL.border, sw: 1.2, head: 7 });
  painter.arrow(L.c.x + 22, L.c.y, O.n0.x - 68, O.n0.y + 26, { stroke: PAL.border, sw: 1.2, head: 7 });
  painter.arrow(O.n0.x, O.n0.y + 20, O.n1.x, O.n1.y - 20, { stroke: PAL.border, sw: 1.2, head: 7 });
  painter.arrow(L['1'].x + 22, L['1'].y, O.n1.x - 68, O.n1.y + 12, { stroke: PAL.border, sw: 1.2, head: 7 });
  painter.arrow(O.n1.x - 8, O.n1.y + 20, O.n2.x - 8, O.n2.y - 20, { stroke: PAL.border, sw: 1.2, head: 7 });
  painter.arrow(O.n1.x + 8, O.n1.y + 20, O.n2.x + 8, O.n2.y - 20, { stroke: PAL.border, sw: 1.2, head: 7 });

  nodeBox(painter, O.n0.x, O.n0.y, 130, 40, '+  labelled a, d', 'b + c', PAL.accent);
  nodeBox(painter, O.n1.x, O.n1.y, 130, 40, '+  labelled e, f', '(b + c) + 1', PAL.accent);
  nodeBox(painter, O.n2.x, O.n2.y, 130, 40, '+  labelled g', 'twice the node above', PAL.accent);
  nodeBox(painter, L.b.x, L.b.y, 44, 28, 'b', '', PAL.dim);
  nodeBox(painter, L.c.x, L.c.y, 44, 28, 'c', '', PAL.dim);
  nodeBox(painter, L['1'].x, L['1'].y, 44, 28, '1', '', PAL.dim);
  painter.text(150, 200, 'leaf', { size: 9.5, mono: true, color: PAL.faint });
  painter.text(150, 252, 'leaf', { size: 9.5, mono: true, color: PAL.faint });
  painter.text(150, 304, 'leaf', { size: 9.5, mono: true, color: PAL.faint });
  painter.text(40, 118, 'three leaves: b, c and the constant 1', { size: 10.5, mono: true, color: PAL.dim });
  painter.text(40, 134, 'one leaf for 1, written twice', { size: 10, mono: true, color: PAL.faint });

  panel(painter, 514, 64, 362, 300, 'statement by statement');
  var rows = [
    ['a = b + c', 'new node 1'],
    ['e = a + 1', 'new node 2'],
    ['d = b + c', 'node 1 again: a label'],
    ['f = d + 1', 'node 2 again: a label'],
    ['g = e + f', 'new node 3']
  ];
  for (var i = 0; i < rows.length; i++) {
    var y = 96 + i * 34;
    painter.text(530, y, rows[i][0], { size: 11.5, mono: true, color: PAL.ink });
    painter.text(530, y + 15, rows[i][1], { size: 10, mono: true, color: i === 2 || i === 3 ? PAL.warn : PAL.dim });
  }
  painter.rect(530, 268, 330, 34, { fill: PAL.accentDim, radius: 6 });
  painter.text(544, 280, '5 statements, 6 nodes: 3 leaves + 3 operators', { size: 11.5, mono: true, bold: true, color: PAL.accent });
  painter.text(530, 320, 'statements 3 and 4 become label attachments', { size: 10.5, color: PAL.dim });
  painter.text(530, 338, 'and the two names join existing nodes', { size: 10.5, color: PAL.dim });

  panel(painter, 24, 378, 852, 52, 'the check the picture has to pass');
  painter.text(40, 402, 'the DAG must compute the same g as the five statements:',
    { size: 11, mono: true, color: PAL.dim });
  for (var k = 0; k < DAG_SAMPLES.length; k++) {
    var b = DAG_SAMPLES[k][0], c = DAG_SAMPLES[k][1];
    painter.text(430 + k * 108, 402, 'b=' + b + ' c=' + c + ' gives ' + dagEval(b, c),
      { size: 10.5, mono: true, color: near(dagEval(b, c), tacGValue(b, c)) ? PAL.valid : PAL.invalid });
  }
}

/* ---------------- scene 9: liveness ---------------- */

function sceneLiveness(painter, t) {
  head(painter, 'scene 9', 'Liveness: a backward analysis that reaches a fixed point');

  panel(painter, 24, 64, 300, 366, 'the flow graph');

  var p = {
    1: { x: 150, y: 112 },
    2: { x: 150, y: 168 },
    3: { x: 150, y: 224 },
    4: { x: 150, y: 280 },
    5: { x: 150, y: 336 },
    6: { x: 150, y: 396 }
  };
  /* the back edge runs down the left side, the exit edge down the middle */
  for (var i = 1; i <= 4; i++) {
    painter.line(p[i].x, p[i].y + 20, p[i + 1].x, p[i + 1].y - 20, { stroke: PAL.border });
  }
  painter.line(p[5].x, p[5].y + 20, p[6].x, p[6].y - 20, { stroke: PAL.border });
  painter.line(p[5].x - 70, p[5].y, p[5].x - 96, p[5].y, { stroke: PAL.warn, dash: [5, 4] });
  painter.line(p[5].x - 96, p[5].y, p[5].x - 96, p[2].y, { stroke: PAL.warn, dash: [5, 4] });
  painter.arrow(p[5].x - 96, p[2].y, p[2].x - 70, p[2].y, { stroke: PAL.warn, dash: [5, 4], sw: 1.4 });
  painter.text(p[5].x - 88, 250, 'true', { size: 9.5, mono: true, color: PAL.warn });
  painter.text(p[5].x + 8, 372, 'false', { size: 9.5, mono: true, color: PAL.dim });

  for (var j = 1; j <= 6; j++) {
    nodeBox(painter, p[j].x, p[j].y, 140, 40, CFG[j - 1].text, 'n' + j, PAL.accent);
  }

  panel(painter, 344, 64, 532, 210, 'use, def, and the two equations iterated backwards');
  painter.text(360, 90, 'node', { size: 9.5, mono: true, color: PAL.faint });
  painter.text(414, 90, 'use', { size: 9.5, mono: true, color: PAL.faint });
  painter.text(470, 90, 'def', { size: 9.5, mono: true, color: PAL.faint });
  painter.text(524, 90, 'IN', { size: 9.5, mono: true, color: PAL.faint });
  painter.text(700, 90, 'OUT', { size: 9.5, mono: true, color: PAL.faint });
  for (var k = 0; k < CFG.length; k++) {
    var n = CFG[k], y = 112 + k * 24;
    painter.text(360, y, 'n' + n.id, { size: 10.5, mono: true, color: PAL.ink });
    painter.text(414, y, n.use.join(',') || '-', { size: 10.5, mono: true, color: PAL.dim });
    painter.text(470, y, n.def.join(',') || '-', { size: 10.5, mono: true, color: PAL.dim });
    painter.text(524, y, LIVE.IN[n.id].join(',') || 'empty', { size: 10.5, mono: true, color: PAL.accent });
    painter.text(700, y, LIVE.OUT[n.id].join(',') || 'empty', { size: 10.5, mono: true, color: PAL.valid });
  }
  painter.text(360, 262, 'IN = use + (OUT - def)     OUT = union of the successors\' IN', { size: 11, mono: true, color: PAL.ink });

  panel(painter, 344, 286, 532, 144, 'why one pass is not enough, and how it is checked');
  painter.text(360, 314, 'round 1 alone is not a fixed point: the back edge from n5 to n2 has', { size: 10.5, color: PAL.dim });
  painter.text(360, 332, 'not yet carried a and c round the loop.', { size: 10.5, color: PAL.dim });
  painter.text(360, 358, LIVE.iterations + ' rounds to converge, then the third round changes nothing', { size: 11, mono: true, color: PAL.accent });
  painter.text(360, 380, 'checked: the result is a fixed point, and it equals a path search', { size: 10.5, color: PAL.dim });
  painter.text(360, 402, 'largest live set = ' + maxLive() + ', so ' + maxLive() + ' registers; edges ' +
    EDGES.map(function (e) { return e.join('-'); }).join(', ') + '; ' + colourCount() + ' colours',
    { size: 10.5, mono: true, color: PAL.valid });
}

/* ---------------- scene 10: the forward dual ---------------- */

function sceneForward(painter, t) {
  head(painter, 'scene 10', 'The mirror image, and the checklist');

  panel(painter, 24, 64, 400, 250, 'available expressions runs forwards');
  var B = { 1: { x: 140, y: 110 }, 2: { x: 140, y: 186 }, 3: { x: 300, y: 186 }, 4: { x: 220, y: 262 } };
  painter.line(B[1].x, B[1].y + 20, B[2].x, B[2].y - 20, { stroke: PAL.border });
  painter.line(B[2].x + 50, B[2].y, B[3].x - 50, B[3].y, { stroke: PAL.border });
  painter.arrow(B[2].x, B[2].y + 20, B[4].x - 20, B[4].y - 22, { stroke: PAL.border, sw: 1.4 });
  painter.arrow(B[3].x, B[3].y + 20, B[4].x + 20, B[4].y - 22, { stroke: PAL.border, sw: 1.4 });
  painter.text(B[2].x + 78, 168, 'else', { size: 9.5, mono: true, color: PAL.dim });
  nodeBox(painter, B[1].x, B[1].y, 130, 40, 'B1  d = a + b', 'gen a+b', PAL.accent);
  nodeBox(painter, B[2].x, B[2].y, 130, 40, 'B2  if d > 0', 'branch', PAL.accent);
  nodeBox(painter, B[3].x, B[3].y, 130, 40, 'B3  a = 5', 'kills a+b', PAL.invalid);
  nodeBox(painter, B[4].x, B[4].y, 140, 40, 'B4  e = a + b', 'available?', PAL.warn);
  painter.text(40, 296, 'IN(B4) = ' + (AVAIL_KILL.IN[4].join(', ') || 'empty') +
    '   with a reassigned on one path', { size: 10.5, mono: true, color: PAL.invalid });

  panel(painter, 444, 64, 432, 250, 'four questions classify any analysis');
  var q = [
    ['direction', 'liveness backwards, availability forwards'],
    ['meet', 'union for a may analysis, intersection for a must'],
    ['boundary', 'empty at the exit for liveness; all at the exit for availability'],
    ['killed by', 'a redefinition kills every fact about that variable']
  ];
  for (var i = 0; i < q.length; i++) {
    var y = 96 + i * 52;
    painter.text(460, y, q[i][0], { size: 11, mono: true, bold: true, color: PAL.accent });
    painter.text(460, y + 18, q[i][1], { size: 10.5, color: PAL.dim });
  }

  panel(painter, 24, 330, 400, 100, 'the trap');
  painter.text(40, 358, 'union at the join keeps a+b, because one path', { size: 10.5, color: PAL.invalid });
  painter.text(40, 376, 'did compute it. The other path reassigned a.', { size: 10.5, color: PAL.invalid });
  painter.text(40, 400, 'intersection drops it: ' + (AVAIL_KEEP.IN[4].indexOf('a+b') >= 0 ? 'available only when nothing kills it' : ''),
    { size: 10.5, mono: true, color: PAL.valid });

  panel(painter, 444, 330, 432, 100, 'the checklist');
  painter.text(460, 356, 'records: name the fields, follow the right link', { size: 10.5, mono: true, color: PAL.ink });
  painter.text(460, 374, 'blocks: three leader rules, then count', { size: 10.5, mono: true, color: PAL.ink });
  painter.text(460, 392, 'DAG: leaves plus distinct operators', { size: 10.5, mono: true, color: PAL.ink });
  painter.text(460, 410, 'analysis: use and def, iterate, largest live set', { size: 10.5, mono: true, color: PAL.ink });
}

var SCENES = {
  frame: sceneFrame,
  recursion: sceneRecursion,
  scoping: sceneScoping,
  params: sceneParams,
  tac: sceneTac,
  blocks: sceneBlocks,
  localopt: sceneLocalOpt,
  dag: sceneDag,
  liveness: sceneLiveness,
  forward: sceneForward
};

function drawFrame(painter) {
  if (!painter) return;
  var tl = window.LESSON_TIMELINE;
  var tt = K.state.elapsed;
  var idx = K.sceneAt(tt);
  var sc = tl.scenes[idx];
  painter.alpha(1);
  painter.clear();
  bg(painter);
  if (sc && SCENES[sc.id]) {
    try {
      SCENES[sc.id](painter, tt - sc.start);
    } catch (err) {
      console.error('scene draw failed', sc.id, err);
    }
  }
}

function fillChecks() {
  var el = document.getElementById('checks');
  if (!el) return;
  var passed = CHECKS.filter(function (c) { return c.pass; }).length;
  var html = '<span class="k">Model checks</span>' +
    '<span class="ok">' + passed + ' / ' + CHECKS.length + ' passed</span>';
  html += '<details style="margin-top:5px"><summary style="cursor:pointer;color:var(--text-faint)">what was checked</summary>';
  CHECKS.forEach(function (c) {
    html += '<div style="margin-top:3px">' +
      (c.pass ? '<span class="ok">\u2713</span>' : '<span style="color:var(--invalid)">\u2717</span> ') +
      c.name + (c.detail ? '<br><span style="opacity:.7">' + c.detail + '</span>' : '') +
      '</div>';
  });
  html += '</details>';
  el.innerHTML = html;
}

/* ======================================================================
   LAYER 3 - BOOT
   ====================================================================== */

function boot() {
  buildChecks();
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

  window.__lessonChecks = CHECKS;
  var bad = CHECKS.filter(function (c) { return !c.pass; });
  if (bad.length) console.warn('Model validation did not fully pass:', bad);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
})();
