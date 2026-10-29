/* ==========================================================================
   local-optimisation-and-basic-blocks — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here:
                         the leader algorithm run on two GATE programs, the
                         control-flow graph it induces, a value-numbering DAG,
                         a small local optimiser, and an interpreter that
                         checks the optimiser against the unoptimised block.
     2. THE CHECKS     — each computed value re-verified against a definition,
                         and each claimed rewrite re-verified by executing the
                         block before and after on every input in a grid.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   Nothing on this page is quoted from a real compiler's output: the two GATE
   programs are transcribed from the question text, and every count is produced
   by the code below and printed on the canvas.
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

/* ---------------------------------------------------------------------
   1a. Two GATE programs, transcribed from the question text.

   Every instruction carries an address, the printed text, and — when it is a
   jump — the address it jumps to. A conditional jump also falls through to
   the next instruction; that is the whole of the difference.
   --------------------------------------------------------------------- */

var P2025 = {
  name: 'GATE CSE 2025 Set 1 Q52',
  ins: [
    { a: 1001, t: 'i = 1' },
    { a: 1002, t: 'j = 1' },
    { a: 1003, t: 't1 = 10 * i' },
    { a: 1004, t: 't2 = t1 + j' },
    { a: 1005, t: 't3 = 8 * t2' },
    { a: 1006, t: 't4 = t3 - 88' },
    { a: 1007, t: 'a[t4] = 0.0' },
    { a: 1008, t: 'j = j + 1' },
    { a: 1009, t: 'if j <= 10 goto 1003', j: 1003, cond: true },
    { a: 1010, t: 'i = i + 1' },
    { a: 1011, t: 'if i <= 10 goto 1002', j: 1002, cond: true },
    { a: 1012, t: 'i = 1' },
    { a: 1013, t: 't5 = i - 1' },
    { a: 1014, t: 't6 = 88 * t5' },
    { a: 1015, t: 'a[t6] = 1.0' },
    { a: 1016, t: 'i = i + 1' },
    { a: 1017, t: 'if i <= 10 goto 1013', j: 1013, cond: true }
  ]
};

var P2024 = {
  name: 'GATE CSE 2024 Set 1 Q39',
  ins: [
    { a: 'L1', t: 't1 = -1' },
    { a: 'L2', t: 't2 = 0' },
    { a: 'L3', t: 't3 = 0' },
    { a: 'L4', t: 't4 = 4 * t3' },
    { a: 'L5', t: 't5 = 4 * t2' },
    { a: 'L6', t: 't6 = t5 * M' },
    { a: 'L7', t: 't7 = t4 + t6' },
    { a: 'L8', t: 't8 = a[t7]' },
    { a: 'L9', t: 'if t8 <= max goto L11', j: 'L11', cond: true },
    { a: 'L10', t: 't1 = t8' },
    { a: 'L11', t: 't3 = t3 + 1' },
    { a: 'L12', t: 'if t3 < M goto L4', j: 'L4', cond: true },
    { a: 'L13', t: 't2 = t2 + 1' },
    { a: 'L14', t: 'if t2 < N goto L3', j: 'L3', cond: true },
    { a: 'L15', t: 'max = t1' }
  ]
};

/* ---------------------------------------------------------------------
   1b. The leader algorithm and the block partition it induces.

   A leader is (1) the first instruction, (2) the target of any jump,
   (3) the instruction printed immediately after any jump.
   A block runs from its leader up to, but not including, the next leader.
   --------------------------------------------------------------------- */

function analyse(prog) {
  var ins = prog.ins, i, isLeader = {}, out = {};

  for (i = 0; i < ins.length; i++) {
    ins[i].next = (i + 1 < ins.length) ? ins[i + 1].a : null;
  }
  isLeader[ins[0].a] = true;
  for (i = 0; i < ins.length; i++) {
    if (ins[i].j !== undefined) {
      isLeader[ins[i].j] = true;                       /* rule 2 */
      if (ins[i].next !== null) isLeader[ins[i].next] = true;   /* rule 3 */
    }
  }

  var leaders = ins.filter(function (x) { return isLeader[x.a]; })
                   .map(function (x) { return x.a; });

  var blocks = [], cur = null;
  ins.forEach(function (x) {
    if (isLeader[x.a]) { cur = { leader: x.a, instrs: [] }; blocks.push(cur); }
    cur.instrs.push(x);
  });
  blocks.forEach(function (b, k) {
    b.id = 'B' + (k + 1);
    b.last = b.instrs[b.instrs.length - 1];
  });

  var byLeader = {};
  blocks.forEach(function (b) { byLeader[b.leader] = b; });

  var edges = [], exitEdges = 0;
  blocks.forEach(function (b) {
    var last = b.last;
    if (last.j !== undefined) {
      var tgt = byLeader[last.j];
      if (tgt) edges.push([b.id, tgt.id]); else exitEdges++;
      if (last.cond) {
        var ft = last.next === null ? null : byLeader[last.next];
        if (ft) edges.push([b.id, ft.id]); else exitEdges++;
      }
    } else {
      var ft2 = last.next === null ? null : byLeader[last.next];
      if (ft2) edges.push([b.id, ft2.id]); else exitEdges++;
    }
  });

  out.name = prog.name;
  out.leaders = leaders;
  out.blocks = blocks;
  out.byLeader = byLeader;
  out.edges = edges;
  out.exitEdges = exitEdges;
  out.sizes = blocks.map(function (b) { return b.instrs.length; });
  out.instrCount = ins.length;
  out.selfLoops = edges.filter(function (e) { return e[0] === e[1]; });
  out.largest = out.sizes.reduce(function (m, v) { return v > m ? v : m; }, 0);
  return out;
}

var A2025 = analyse(P2025);
var A2024 = analyse(P2024);

function edgeStr(e) { return e[0] + '\u2192' + e[1]; }
function edgeList(edges) { return edges.map(edgeStr).join('  '); }

/* ---------------------------------------------------------------------
   1c. A value-numbering DAG for one small block.

   Same operator, same operand nodes  ->  the same node, so the second
   computation is the first one reused. Commutative operators are matched
   in either order. Leaves are the initial values of the variables plus
   every constant.
   --------------------------------------------------------------------- */

var DAG_STMTS = [
  { d: 'u', op: '+', x: 'b', y: 'c' },
  { d: 'v', op: '+', x: 'b', y: 'c' },
  { d: 'w', op: '*', x: 'u', y: '2' },
  { d: 'x', op: '*', x: 'u', y: '2' },
  { d: 'y', op: '+', x: 'v', y: '2' }
];

function buildDag(stmts) {
  var nodes = [], cur = {}, ops = {};

  function leaf(name) {
    if (!(name in cur)) {
      nodes.push({ op: 'leaf', name: name, labels: [name] });
      cur[name] = nodes.length - 1;
    }
    return cur[name];
  }

  stmts.forEach(function (s) {
    var id, ai, bi, k1, k2;
    if (s.op === 'copy') {
      id = leaf(s.x);
    } else {
      ai = leaf(s.x);
      bi = leaf(s.y);
      k1 = s.op + '#' + ai + '#' + bi;
      k2 = (s.op === '+' || s.op === '*') ? (s.op + '#' + bi + '#' + ai) : null;
      if (k1 in ops) id = ops[k1];
      else if (k2 !== null && k2 in ops) id = ops[k2];
      else {
        nodes.push({ op: s.op, a: ai, b: bi, labels: [] });
        id = nodes.length - 1;
        ops[k1] = id;
      }
    }
    if (nodes[id].labels.indexOf(s.d) < 0) nodes[id].labels.push(s.d);
    cur[s.d] = id;
  });

  var opNodes = nodes.filter(function (n) { return n.op !== 'leaf'; });
  var edgeCount = opNodes.reduce(function (n, nd) { return n + (nd.b === undefined ? 1 : 2); }, 0);
  return { nodes: nodes, ops: opNodes, leaves: nodes.length - opNodes.length, edges: edgeCount, cur: cur };
}

var DAG = buildDag(DAG_STMTS);
var SHARED_ADD = DAG.ops[0].labels.join(',');
var SHARED_MUL = DAG.ops[1].labels.join(',');

/* ---------------------------------------------------------------------
   1d. A small local optimiser: fold, simplify, propagate copies, remove
   common subexpressions by value numbering, delete dead assignments.

   Operands are variable names; a numeric literal is a name whose value is
   already known, which is how "2 * 8" folds without special-casing.
   --------------------------------------------------------------------- */

function uses(st) {
  var u = [];
  if (st.op === '+' || st.op === '*' || st.op === '-' || st.op === '/') { u.push(st.x); u.push(st.y); }
  else if (st.op === 'copy') u.push(st.x);
  return u;
}
function clone(st) { return { d: st.d, op: st.op, x: st.x, y: st.y, k: st.k, se: st.se }; }
function isNum(n) { return /^-?\d+$/.test(String(n)); }

function seedEnv(stmts) {
  var env = {};
  stmts.forEach(function (s) {
    uses(s).forEach(function (u) { if (isNum(u)) env[u] = parseInt(u, 10); });
    if (s.op === 'const') env[String(s.k)] = s.k;
  });
  return env;
}

/* pass A: substitute known constants, then evaluate an operation on two of them */
function passFold(stmts, seed) {
  var env = {}, out = [], k;
  for (k in seed) env[k] = seed[k];
  stmts.forEach(function (s) {
    var t = clone(s), a, b, v;
    if (t.op === '+' || t.op === '*' || t.op === '-') {
      if (t.x in env) t.x = String(env[t.x]);
      if (t.y in env) t.y = String(env[t.y]);
      if ((t.x in env) && (t.y in env) && canFold(t.op, env[t.x], env[t.y])) {
        a = env[t.x]; b = env[t.y];
        if (t.op === '+') v = (a + b) | 0;
        else if (t.op === '-') v = (a - b) | 0;
        else v = Math.imul(a, b);
        out.push({ d: t.d, op: 'const', k: v });
        env[t.d] = v;
        return;
      }
    }
    if (t.op === 'copy' && (t.x in env)) {
      out.push({ d: t.d, op: 'const', k: env[t.x] });
      env[t.d] = env[t.x];
      return;
    }
    if (t.op === 'const') { env[t.d] = t.k; out.push(t); return; }
    delete env[t.d];
    out.push(t);
  });
  return out;
}

/* the guard that stops a fold the machine is not allowed to perform */
function canFold(op, a, b) {
  if (op === '+' || op === '-' || op === '*') return true;
  if (op === '/') return b !== 0;
  return false;
}

/* pass B: the algebraic identities, each valid for 32-bit integers */
function passAlgebraic(stmts) {
  return stmts.map(function (s) {
    var t = clone(s);
    if (t.op === '+') {
      if (t.y === '0') return { d: t.d, op: 'copy', x: t.x, se: t.se };
      if (t.x === '0') return { d: t.d, op: 'copy', x: t.y, se: t.se };
    }
    if (t.op === '-') {
      if (t.y === '0') return { d: t.d, op: 'copy', x: t.x, se: t.se };
    }
    if (t.op === '*') {
      if (t.y === '1') return { d: t.d, op: 'copy', x: t.x, se: t.se };
      if (t.x === '1') return { d: t.d, op: 'copy', x: t.y, se: t.se };
      if (t.x === '0' || t.y === '0') return { d: t.d, op: 'const', k: 0 };
    }
    return t;
  });
}

/* pass C: after d = s, later uses of d become uses of s, until either is redefined */
function passCopyProp(stmts) {
  var subst = {}, st = stmts.map(clone);
  st.forEach(function (s) {
    var k;
    if (s.x && subst[s.x] !== undefined) s.x = subst[s.x];
    if (s.y && subst[s.y] !== undefined) s.y = subst[s.y];
    for (k in subst) if (subst[k] === s.d) delete subst[k];   /* the source was redefined */
    if (s.op === 'copy' && s.x !== s.d) subst[s.d] = s.x;
    else delete subst[s.d];
  });
  return st;
}

/* pass D: value numbering inside the block */
function passCSE(stmts) {
  var cur = {}, ops = {}, out = [];
  stmts.forEach(function (s) {
    var t = clone(s), ax, ay, k1, k2;
    if (t.op === 'const') {
      k1 = 'k#' + t.k;
      if (k1 in ops) { out.push({ d: t.d, op: 'copy', x: ops[k1] }); cur[t.d] = ops[k1]; return; }
      ops[k1] = t.d; cur[t.d] = t.d; out.push(t); return;
    }
    if (t.op === 'copy') { out.push(t); cur[t.d] = t.x; return; }
    ax = (t.x in cur) ? cur[t.x] : t.x;
    ay = (t.y in cur) ? cur[t.y] : t.y;
    k1 = t.op + '#' + ax + '#' + ay;
    k2 = (t.op === '+' || t.op === '*') ? (t.op + '#' + ay + '#' + ax) : null;
    if (k1 in ops) { out.push({ d: t.d, op: 'copy', x: ops[k1] }); cur[t.d] = ops[k1]; return; }
    if (k2 !== null && (k2 in ops)) { out.push({ d: t.d, op: 'copy', x: ops[k2] }); cur[t.d] = ops[k2]; return; }
    ops[k1] = t.d; cur[t.d] = t.d; out.push(t);
  });
  return out;
}

/* pass E: an assignment nobody reads is removed — unless it has a side effect */
function passDCE(stmts, liveOut) {
  var live = {}, keep = [], i;
  liveOut.forEach(function (v) { live[v] = true; });
  for (i = stmts.length - 1; i >= 0; i--) {
    var s = stmts[i];
    if (s.se) {
      keep[i] = true;
      uses(s).forEach(function (u) { live[u] = true; });
      continue;
    }
    if (!live[s.d]) { keep[i] = false; continue; }
    keep[i] = true;
    delete live[s.d];
    uses(s).forEach(function (u) { live[u] = true; });
  }
  return stmts.filter(function (s, idx) { return keep[idx]; });
}

/* the pipeline, run to a fixed point because one pass exposes another */
function optimise(stmts, liveOut, rounds) {
  var cur = stmts.map(clone), seed = seedEnv(stmts), i, steps = [];
  for (i = 0; i < (rounds || 4); i++) {
    cur = passFold(cur, seed);
    cur = passAlgebraic(cur);
    cur = passCopyProp(cur);
    cur = passCSE(cur);
    cur = passDCE(cur, liveOut);
    steps.push(cur.length);
  }
  return { out: cur, steps: steps };
}

/* the block this page optimises, and the live-out set the question would give */
var BLOCK = [
  { d: 't1', op: '+', x: 'b', y: 'c' },
  { d: 't2', op: '+', x: 'b', y: 'c' },
  { d: 't3', op: '*', x: 'b', y: '4' },
  { d: 't4', op: '*', x: '2', y: '8' },
  { d: 't5', op: '+', x: 't1', y: '0' },
  { d: 't6', op: 'copy', x: 't5' },
  { d: 'x', op: '+', x: 't4', y: 't6' },
  { d: 'y', op: '*', x: 'b', y: '4' },
  { d: 'z', op: 'const', k: 7 }
];
var LIVE_OUT = ['x', 'y'];
var OPT = optimise(BLOCK, LIVE_OUT, 4);

/* ---------------------------------------------------------------------
   1e. An interpreter, so "the rewrite preserved the meaning" is measured
   rather than asserted. 32-bit wrapping, because that is what the machine
   these rewrites target does.
   --------------------------------------------------------------------- */

function run(stmts, env0) {
  var env = {}, k;
  for (k in env0) env[k] = env0[k];
  /* a numeric literal is a name whose value is fixed, so seed it here too */
  stmts.forEach(function (s) {
    uses(s).forEach(function (u) { if (isNum(u)) env[u] = parseInt(u, 10); });
  });
  stmts.forEach(function (s) {
    if (s.op === 'const') env[s.d] = s.k;
    else if (s.op === 'copy') env[s.d] = env[s.x];
    else if (s.op === '+') env[s.d] = (env[s.x] + env[s.y]) | 0;
    else if (s.op === '-') env[s.d] = (env[s.x] - env[s.y]) | 0;
    else if (s.op === '*') env[s.d] = Math.imul(env[s.x], env[s.y]);
  });
  return env;
}

var EQUIV = (function () {
  var b, c, agree = 0, total = 0, seed = seedEnv(BLOCK);
  for (b = -3; b <= 6; b++) {
    for (c = -3; c <= 6; c++) {
      var env0 = { b: b, c: c }, k;
      for (k in seed) env0[k] = seed[k];
      var before = run(BLOCK, env0), after = run(OPT.out, env0);
      total++;
      if (before.x === after.x && before.y === after.y) agree++;
    }
  }
  return { agree: agree, total: total };
})();

/* the block printed back as three-address code */
function show(st) {
  if (st.op === 'const') return st.d + ' = ' + st.k;
  if (st.op === 'copy') return st.d + ' = ' + st.x;
  return st.d + ' = ' + st.x + ' ' + st.op + ' ' + st.y;
}
var OPT_TEXT = OPT.out.map(show);

/* ---------------------------------------------------------------------
   1f. Dead-code elimination with the side-effect guard.
   --------------------------------------------------------------------- */

var SIDE_BLOCK = [
  { d: 't1', op: '+', x: 'a', y: 'b' },
  { d: '*p', op: 'const', k: 5, se: true },
  { d: 't2', op: 'copy', x: 't1' }
];
var SIDE_OPT = passDCE(SIDE_BLOCK, []);

/* ---------------------------------------------------------------------
   1g. The counterexamples: each one is a rewrite that looks right and is
   not. Each is shown by a witness found by search, not by assertion.
   --------------------------------------------------------------------- */

var FP_CANDS = [0.1, 0.2, 0.3, 1e16, 1, -1e16, 1e-16, 3.5];
var FP_W = (function () {
  for (var i = 0; i < FP_CANDS.length; i++) {
    for (var j = 0; j < FP_CANDS.length; j++) {
      for (var k = 0; k < FP_CANDS.length; k++) {
        var a = FP_CANDS[i], b = FP_CANDS[j], c = FP_CANDS[k];
        if (((a + b) + c) !== (a + (b + c))) {
          return { a: a, b: b, c: c, lhs: (a + b) + c, rhs: a + (b + c) };
        }
      }
    }
  }
  return null;
})();

var SHIFT_X = -3;
var SHIFT_DIV = Math.trunc(SHIFT_X / 2);   /* C truncates toward zero */
var SHIFT_SHR = SHIFT_X >> 1;              /* an arithmetic shift rounds down */

var NAN_W = { x: NaN, times0: NaN * 0, zero: 0 };

var OVERFLOW = { a: 2147483647, b: 1, folded: (2147483647 + 1) | 0, exact: 2147483648 };

/* aliasing: a[i] may be the same location as a[j] */
var ALIAS = (function () {
  var mem = [10, 20, 30], i = 1, j = 1;
  var t = mem[i];
  mem[j] = 5;
  var u = mem[i];
  return { t: t, u: u, same: t === u };
})();

/* ---------------------------------------------------------------------
   1h. Where local stops: a fact computed in one block is invisible in the
   next, so the second computation cannot be removed without global analysis.
   --------------------------------------------------------------------- */

var DIAMOND = {
  blocks: { B1: 'a + b computed', B2: 'a + b used again', B3: 'a overwritten', B4: 'a + b used again' },
  localSays: 'not available \u2014 this block computes nothing it can reuse',
  globalSays: 'available on the left path only, not after the join'
};

/* ---------------------------------------------------------------------
   1i. The counting question: GATE CSE 2021 Set 2 Q30, recomputed.
   --------------------------------------------------------------------- */

var Q2021 = (function () {
  var iters = Math.floor(200 / 2);
  var addsOutside = 3;
  var addsPerIter = 2 + 1;                 /* two branch additions plus i = i + 2 */
  var derefsOutside = 2;
  return {
    iters: iters,
    addsOutside: addsOutside,
    addsPerIter: addsPerIter,
    adds: addsOutside + iters * addsPerIter,
    derefs: derefsOutside + iters * 0
  };
})();

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* --- the leader algorithm on the 2025 program --- */
chk('2025: six leaders', A2025.leaders.length === 6, A2025.leaders.join(', '));
chk('2025: the leaders are 1001, 1002, 1003, 1010, 1012, 1013',
    A2025.leaders.join(',') === '1001,1002,1003,1010,1012,1013', A2025.leaders.join(','));
chk('2025: six basic blocks', A2025.blocks.length === 6, A2025.blocks.length);
chk('2025: blocks and leaders are in bijection',
    A2025.blocks.length === A2025.leaders.length);
chk('2025: the blocks partition all 17 instructions',
    A2025.sizes.reduce(function (a, b) { return a + b; }, 0) === 17 && A2025.instrCount === 17,
    A2025.sizes.join('+'));
chk('2025: block sizes are 1,1,7,2,1,5', A2025.sizes.join(',') === '1,1,7,2,1,5', A2025.sizes.join(','));

/* a block has exactly one entry: no jump lands inside it */
(function () {
  var targets = {};
  P2025.ins.forEach(function (x) { if (x.j !== undefined) targets[x.j] = true; });
  var bad = 0;
  A2025.blocks.forEach(function (b) {
    b.instrs.slice(1).forEach(function (x) { if (targets[x.a]) bad++; });
  });
  chk('2025: no jump lands inside a block', bad === 0, bad + ' violations');
})();

/* a block has one exit: no jump sits inside it except as its last instruction */
(function () {
  var bad = 0;
  A2025.blocks.forEach(function (b) {
    b.instrs.slice(0, -1).forEach(function (x) { if (x.j !== undefined) bad++; });
  });
  chk('2025: no block contains a jump except as its last instruction', bad === 0, bad + ' violations');
})();

chk('2025: eight edges between blocks', A2025.edges.length === 8, edgeList(A2025.edges));
chk('2025: one edge leaves the program, to EXIT', A2025.exitEdges === 1, A2025.exitEdges);
chk('2025: the edges are exactly the printed set',
    edgeList(A2025.edges) === 'B1\u2192B2  B2\u2192B3  B3\u2192B3  B3\u2192B4  B4\u2192B2  B4\u2192B5  B5\u2192B6  B6\u2192B6',
    edgeList(A2025.edges));
chk('2025: two blocks jump to themselves', A2025.selfLoops.length === 2,
    A2025.selfLoops.map(edgeStr).join(', '));

/* --- the same algorithm on the 2024 program --- */
chk('2024: seven leaders', A2024.leaders.length === 7, A2024.leaders.join(', '));
chk('2024: the leaders are L1, L3, L4, L10, L11, L13, L15',
    A2024.leaders.join(',') === 'L1,L3,L4,L10,L11,L13,L15', A2024.leaders.join(','));
chk('2024: seven basic blocks', A2024.blocks.length === 7, A2024.blocks.length);
chk('2024: block sizes are 2,1,6,1,2,2,1', A2024.sizes.join(',') === '2,1,6,1,2,2,1', A2024.sizes.join(','));
chk('2024: the sizes add up to all 15 instructions',
    A2024.sizes.reduce(function (a, b) { return a + b; }, 0) === 15, A2024.instrCount);
chk('2024: the largest block holds six instructions', A2024.largest === 6, A2024.largest);
chk('2024: the answer is 7 and 6, which is option D', A2024.blocks.length === 7 && A2024.largest === 6);
chk('2024: L3 is a jump target, so L1 and L2 are two blocks',
    A2024.byLeader.L3 !== undefined && A2024.byLeader.L1.instrs.length === 2);
chk('2024: nine edges between blocks', A2024.edges.length === 9, edgeList(A2024.edges));

/* --- the DAG --- */
chk('DAG: six nodes', DAG.nodes.length === 6, DAG.nodes.length);
chk('DAG: three leaves and three operators', DAG.leaves === 3 && DAG.ops.length === 3,
    DAG.leaves + ' leaves, ' + DAG.ops.length + ' operators');
chk('DAG: six edges', DAG.edges === 6, DAG.edges);
chk('DAG: the two additions b + c share one node', SHARED_ADD === 'u,v', SHARED_ADD);
chk('DAG: the two multiplications u * 2 share one node', SHARED_MUL === 'w,x', SHARED_MUL);
chk('DAG: five statements become three computations', DAG.ops.length === 3, DAG.ops.length);
chk('DAG: node count is leaves plus operators', DAG.nodes.length === DAG.leaves + DAG.ops.length);

/* --- the optimiser --- */
chk('optimiser: nine statements become four', OPT.out.length === 4, OPT.out.length);
chk('optimiser: it reaches a fixed point', OPT.steps[OPT.steps.length - 1] === OPT.steps[OPT.steps.length - 2],
    OPT.steps.join(' \u2192 '));
chk('optimiser: the folded constant 16 survives in the block',
    OPT.out.some(function (s) { return s.x === '16' || (s.op === 'const' && s.k === 16); }),
    OPT_TEXT.join(' ; '));
chk('optimiser: z = 7 is gone, because z is not live out',
    !OPT.out.some(function (s) { return s.d === 'z'; }));
chk('optimiser: the dead copy t2 = t1 is gone',
    !OPT.out.some(function (s) { return s.d === 't2'; }));
chk('optimiser: the value of x is unchanged on every input in the grid',
    EQUIV.agree === EQUIV.total, EQUIV.agree + '/' + EQUIV.total);
chk('optimiser: the grid is big enough to be worth running', EQUIV.total === 100, EQUIV.total);

/* --- the side-effect guard --- */
chk('DCE: an unused arithmetic result is deleted', SIDE_OPT.length === 1, SIDE_OPT.length);
chk('DCE: the store through a pointer is kept', SIDE_OPT.some(function (s) { return s.se; }));

/* --- the counterexamples --- */
chk('FP: a reassociation witness exists', FP_W !== null,
    FP_W ? '(' + FP_W.a + '+' + FP_W.b + ')+' + FP_W.c + ' = ' + FP_W.lhs + ' but ' + FP_W.rhs : '');
chk('FP: the two groupings differ', FP_W !== null && FP_W.lhs !== FP_W.rhs);
chk('shift: x/2 and x>>1 differ on a negative x', SHIFT_DIV !== SHIFT_SHR,
    SHIFT_X + ': /2 = ' + SHIFT_DIV + ', >>1 = ' + SHIFT_SHR);
chk('NaN: x * 0 is not 0 when x is NaN', NAN_W.times0 !== NAN_W.zero, String(NAN_W.times0));
chk('overflow: a 32-bit fold wraps, it does not widen', OVERFLOW.folded !== OVERFLOW.exact,
    OVERFLOW.folded + ' vs ' + OVERFLOW.exact);
chk('folding: a division by a zero constant is refused', canFold('/', 1, 0) === false);
chk('folding: a division by a non-zero constant is allowed', canFold('/', 4, 2) === true);
chk('aliasing: reusing a[i] across a[j] = 5 changes the value', ALIAS.same === false,
    'a[i] = ' + ALIAS.t + ' before the store, ' + ALIAS.u + ' after');

/* --- the counting question --- */
chk('2021 Q30: 100 iterations', Q2021.iters === 100, Q2021.iters);
chk('2021 Q30: 303 additions', Q2021.adds === 303, Q2021.adds);
chk('2021 Q30: 2 dereferences', Q2021.derefs === 2, Q2021.derefs);

/* --- the two the lesson keeps apart --- */
chk('folding evaluates constants; CSE reuses a value already computed',
    canFold('*', 2, 8) === true && DAG.ops.length === 3);

/* ======================================================================
   LAYER 3 - RENDER
   Reads the model. Never re-derives a count.
   ====================================================================== */

function panel(P_, x, y, w, h, o) {
  o = o || {};
  P_.rect(x, y, w, h, {
    fill: o.fill || PAL.surface,
    stroke: o.stroke || PAL.border,
    sw: o.sw || 1.5,
    radius: o.radius === undefined ? 9 : o.radius
  });
}

function header(P_, s, sub) {
  P_.text(20, 12, s, { size: 15, bold: true, color: PAL.ink });
  if (sub) P_.text(20, 33, sub, { size: 11, color: PAL.dim });
}

function rv(elapsed, t0, dur) { return K.ease(K.beat(elapsed, t0, dur === undefined ? 0.8 : dur)); }
function fade(P_, a) { P_.alpha(a); }
function at(e, base, k) { return rv(e, base + k * 10, 0.9); }

/* ---------- scene 1: where local sits ---------- */
function drawWhereLocal(P_, t, e) {
  header(P_, 'Local optimisation looks at one basic block',
         'Section 7 of the syllabus names it first: "Local optimisation, Data flow analyses: ..."');

  var stages = [
    { t: 'front end', s: 'lex, parse, SDT', c: PAL.border, note: '' },
    { t: 'IR', s: 'three-address code', c: PAL.border, note: '' },
    { t: 'LOCAL', s: 'one basic block', c: PAL.accent, note: 'this page' },
    { t: 'GLOBAL', s: 'the whole CFG', c: PAL.info, note: 'data-flow lesson' },
    { t: 'code gen', s: 'registers, machine', c: PAL.border, note: '' }
  ];
  var a1 = at(e, 0, 0);
  if (a1 > 0) {
    fade(P_, a1);
    stages.forEach(function (st, i) {
      var x = 20 + i * 174;
      panel(P_, x, 52, 164, 60, { fill: i === 2 ? PAL.accentDim : PAL.surface, stroke: st.c, sw: i === 2 ? 2 : 1.4 });
      P_.text(x + 10, 60, st.t, { size: 12, bold: true, mono: true, color: i === 2 ? PAL.accent : PAL.ink });
      P_.text(x + 10, 78, st.s, { size: 11, color: PAL.dim });
      if (st.note) P_.text(x + 10, 94, st.note, { size: 10, mono: true, color: i === 2 ? PAL.accent : PAL.info });
    });
    fade(P_, 1);
  }

  var a2 = at(e, 0, 1);
  if (a2 > 0) {
    fade(P_, a2);
    panel(P_, 20, 126, 860, 96, { fill: PAL.surface2, stroke: PAL.border });
    P_.text(34, 136, 'Why a block is the natural unit', { size: 12, bold: true, mono: true, color: PAL.accent });
    P_.text(34, 156, 'Inside one block there is no branch, so control enters once and leaves once.', { size: 12, color: PAL.ink });
    P_.text(34, 174, 'A single top-to-bottom scan therefore knows every value the block computes.', { size: 12, color: PAL.ink });
    P_.text(34, 192, 'The only thing the scan needs from outside is which variables are live at the exit.', { size: 12, color: PAL.ink });
    fade(P_, 1);
  }

  var a3 = at(e, 0, 2);
  if (a3 > 0) {
    fade(P_, a3);
    panel(P_, 20, 236, 424, 194, { fill: PAL.validDim, stroke: PAL.valid, sw: 1.6 });
    P_.text(34, 246, 'DECIDABLE IN ONE BLOCK', { size: 11, bold: true, mono: true, color: PAL.valid });
    P_.text(34, 268, 'evaluate a constant expression', { size: 12, color: PAL.ink });
    P_.text(34, 288, 'reuse a value computed earlier here', { size: 12, color: PAL.ink });
    P_.text(34, 308, 'drop a store nobody will read', { size: 12, color: PAL.ink });
    P_.text(34, 328, 'replace a costly operation by a cheap one', { size: 12, color: PAL.ink });
    P_.text(34, 348, 'simplify by an algebraic identity', { size: 12, color: PAL.ink });
    P_.text(34, 376, 'Each needs only the block and its live-out set.', { size: 11, color: PAL.dim });
    P_.text(34, 396, 'No iteration, no fixed point, no lattice.', { size: 11, color: PAL.dim });

    panel(P_, 456, 236, 424, 194, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.6 });
    P_.text(470, 246, 'NOT DECIDABLE HERE', { size: 11, bold: true, mono: true, color: PAL.warn });
    P_.text(470, 268, 'what another block already computed', { size: 12, color: PAL.ink });
    P_.text(470, 288, 'whether a value survives a branch', { size: 12, color: PAL.ink });
    P_.text(470, 308, 'whether a loop recomputes the same thing', { size: 12, color: PAL.ink });
    P_.text(470, 328, 'which variables are live at the exit', { size: 12, color: PAL.ink });
    P_.text(470, 356, 'Every item in this column needs facts about', { size: 11, color: PAL.dim });
    P_.text(470, 374, 'other blocks, which is data-flow analysis.', { size: 11, color: PAL.dim });
    P_.text(470, 396, 'Local optimisation is the half that does not.', { size: 11, color: PAL.dim });
    fade(P_, 1);
  }
}

/* ---------- scene 2: the three leader rules ---------- */
function drawLeaders(P_, t, e) {
  header(P_, 'A basic block starts at a leader',
         'Three rules find every leader; the number of leaders is the number of blocks.');

  var rules = [
    { n: 'rule 1', h: 'the first instruction', d: 'the program starts somewhere' },
    { n: 'rule 2', h: 'the target of a jump', d: 'control can arrive here from elsewhere' },
    { n: 'rule 3', h: 'the one after a jump', d: 'control may not arrive here at all' }
  ];
  var a1 = at(e, 30, 0);
  if (a1 > 0) {
    fade(P_, a1);
    rules.forEach(function (r, i) {
      var x = 20 + i * 294;
      panel(P_, x, 54, 280, 92, { fill: PAL.surface, stroke: PAL.accentDim, sw: 1.6 });
      P_.text(x + 12, 62, r.n, { size: 10, bold: true, mono: true, color: PAL.accent });
      P_.text(x + 12, 82, r.h, { size: 13, bold: true, color: PAL.ink });
      P_.text(x + 12, 106, r.d, { size: 11, color: PAL.dim });
      P_.text(x + 12, 126, i === 0 ? 'always' : (i === 1 ? 'every goto and if-goto' : 'after any jump'), { size: 10, mono: true, color: PAL.faint });
    });
    fade(P_, 1);
  }

  var a2 = at(e, 30, 1);
  if (a2 > 0) {
    fade(P_, a2);
    var code = ['1:  a = 1', '2:  b = 2', '3:  t = a * b', '4:  if t > 9 goto 6',
                '5:  b = b + 1', '6:  c = a + b', '7:  if c < 4 goto 3', '8:  d = c', '9:  e = d + a'];
    panel(P_, 20, 158, 300, 176, { fill: PAL.surface, stroke: PAL.border });
    P_.text(32, 166, 'a nine-instruction program', { size: 11, bold: true, mono: true, color: PAL.accent });
    code.forEach(function (ln, i) {
      P_.text(32, 188 + i * 16, ln, { size: 11, mono: true, color: PAL.ink });
    });
    /* leader marks: 1 (rule 1), 6 and 3 (targets), 5 and 7 (after a jump) */
    [[0, 'rule 1'], [2, 'rule 2'], [4, 'rule 3'], [5, 'rule 2'], [6, 'rule 3']].forEach(function (m) {
      P_.circle(310, 194 + m[0] * 16, 4, { fill: PAL.accent });
    });
    fade(P_, 1);
  }

  var a3 = at(e, 30, 2);
  if (a3 > 0) {
    fade(P_, a3);
    panel(P_, 336, 158, 544, 176, { fill: PAL.surface2, stroke: PAL.border });
    P_.text(350, 166, 'reading the marks', { size: 11, bold: true, mono: true, color: PAL.accent });
    P_.text(350, 188, 'leaders: 1, 3, 5, 6, 7  \u2014 five of them', { size: 13, mono: true, color: PAL.ink });
    P_.text(350, 212, 'B1 = 1-2   B2 = 3-4   B3 = 5', { size: 12, mono: true, color: PAL.ink });
    P_.text(350, 232, 'B4 = 6   B5 = 7-9', { size: 12, mono: true, color: PAL.ink });
    P_.text(350, 258, 'Instruction 3 is a leader because line 7 jumps to it,', { size: 11, color: PAL.dim });
    P_.text(350, 274, 'so line 1 and line 2 are a block of two, not a block of four.', { size: 11, color: PAL.dim });
    P_.text(350, 298, 'Instruction 5 is a leader because line 4 jumps away.', { size: 11, color: PAL.dim });
    P_.text(350, 320, 'A block ends at the instruction before the next leader.', { size: 11, color: PAL.dim });
    fade(P_, 1);
  }

  panel(P_, 20, 348, 860, 84, { fill: PAL.surface, stroke: PAL.accentDim, sw: 1.6 });
  P_.text(34, 358, 'Definition, in words', { size: 11, bold: true, mono: true, color: PAL.accent });
  P_.text(34, 380, 'A basic block is a maximal run of consecutive instructions with one entry at the top', { size: 12, color: PAL.ink });
  P_.text(34, 398, 'and one exit at the bottom: control enters only at the first instruction and leaves only', { size: 12, color: PAL.ink });
  P_.text(34, 416, 'after the last. "Maximal" is why the three rules give the answer with no choices to make.', { size: 12, color: PAL.ink });
}

/* ---------- scene 3: the 2025 program ---------- */
function draw2025(P_, t, e) {
  header(P_, 'GATE CSE 2025 Set 1 Q52: how many basic blocks?',
         'Seventeen instructions, three jumps. The leader rules decide it.');

  var a1 = at(e, 60, 0);
  if (a1 > 0) {
    fade(P_, a1);
    panel(P_, 20, 52, 234, 262, { fill: PAL.surface, stroke: PAL.border });
    P2025.ins.forEach(function (x, i) {
      var isL = A2025.byLeader[x.a] !== undefined;
      P_.text(32, 62 + i * 14.6, String(x.a), { size: 10, mono: true, color: isL ? PAL.accent : PAL.faint });
      P_.text(70, 62 + i * 14.6, x.t, { size: 10, mono: true, color: PAL.ink });
    });
    fade(P_, 1);
  }

  var a2 = at(e, 60, 1);
  if (a2 > 0) {
    fade(P_, a2);
    panel(P_, 268, 52, 612, 112, { fill: PAL.surface2, stroke: PAL.border });
    P_.text(282, 60, 'leaders found by the three rules', { size: 11, bold: true, mono: true, color: PAL.accent });
    P_.text(282, 82, A2025.leaders.join(',  '), { size: 14, mono: true, color: PAL.ink });
    P_.text(282, 104, 'rule 1: 1001.   rule 2: 1003, 1002, 1013.   rule 3: 1010, 1012.', { size: 11, color: PAL.dim });
    P_.text(282, 124, 'That is ' + A2025.leaders.length + ' leaders, so ' + A2025.blocks.length + ' blocks.', { size: 12, bold: true, color: PAL.ink });
    P_.text(282, 146, 'Nothing follows 1017, so rule 3 adds no leader there.', { size: 11, color: PAL.dim });
    fade(P_, 1);
  }

  var a3 = at(e, 60, 2);
  if (a3 > 0) {
    fade(P_, a3);
    var bw = 92, gap = 8, y = 186;
    A2025.blocks.forEach(function (b, i) {
      var x = 268 + i * (bw + gap);
      panel(P_, x, y, bw, 46, { fill: PAL.surface, stroke: PAL.accent, sw: 1.6, radius: 7 });
      P_.text(x + 8, y + 5, b.id, { size: 11, bold: true, mono: true, color: PAL.accent });
      P_.text(x + 8, y + 21, b.instrs.length + ' instr', { size: 10, mono: true, color: PAL.ink });
      P_.text(x + 8, y + 34, String(b.leader), { size: 9, mono: true, color: PAL.faint });
      if (i < A2025.blocks.length - 1) {
        P_.arrow(x + bw + 1, y + 23, x + bw + gap - 1, y + 23, { stroke: PAL.dim, sw: 1.2, head: 5 });
      }
    });
    P_.text(268, 242, 'fall-through edges drawn; the two self-loops are B3\u2192B3 and B6\u2192B6', { size: 10, mono: true, color: PAL.dim });

    panel(P_, 268, 262, 612, 112, { fill: PAL.surface, stroke: PAL.border });
    P_.text(282, 270, 'the control-flow graph, computed', { size: 11, bold: true, mono: true, color: PAL.accent });
    P_.text(282, 292, A2025.edges.slice(0, 4).map(edgeStr).join('   '), { size: 12, mono: true, color: PAL.ink });
    P_.text(282, 312, A2025.edges.slice(4).map(edgeStr).join('   '), { size: 12, mono: true, color: PAL.ink });
    P_.text(282, 336, A2025.edges.length + ' edges between blocks, plus ' + A2025.exitEdges + ' from B6 to EXIT.', { size: 11, color: PAL.dim });
    P_.text(282, 356, 'Whether EXIT counts is a convention; the question asked for blocks only.', { size: 11, color: PAL.dim });
    fade(P_, 1);
  }

  panel(P_, 20, 328, 234, 104, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.6 });
  P_.text(34, 338, 'the answer', { size: 11, bold: true, mono: true, color: PAL.accent });
  P_.text(34, 362, String(A2025.blocks.length) + ' basic blocks', { size: 18, bold: true, mono: true, color: PAL.ink });
  P_.text(34, 392, 'six leaders, six blocks', { size: 11, color: PAL.dim });
  P_.text(34, 410, 'matched to the official key', { size: 11, color: PAL.dim });
}

/* ---------- scene 4: the 2024 program ---------- */
function draw2024(P_, t, e) {
  header(P_, 'GATE CSE 2024 Set 1 Q39: blocks, and the largest block',
         'Fifteen instructions, three jumps, and one leader that is easy to miss.');

  var a1 = at(e, 90, 0);
  if (a1 > 0) {
    fade(P_, a1);
    panel(P_, 20, 52, 250, 234, { fill: PAL.surface, stroke: PAL.border });
    P2024.ins.forEach(function (x, i) {
      var isL = A2024.byLeader[x.a] !== undefined;
      P_.text(32, 62 + i * 14.6, x.a, { size: 10, mono: true, color: isL ? PAL.accent : PAL.faint });
      P_.text(66, 62 + i * 14.6, x.t, { size: 10, mono: true, color: PAL.ink });
    });
    fade(P_, 1);
  }

  var a2 = at(e, 90, 1);
  if (a2 > 0) {
    fade(P_, a2);
    panel(P_, 284, 52, 596, 234, { fill: PAL.surface2, stroke: PAL.border });
    P_.text(298, 60, 'the seven blocks and their sizes', { size: 11, bold: true, mono: true, color: PAL.accent });
    P_.text(298, 82, 'leaders: ' + A2024.leaders.join(', '), { size: 11, mono: true, color: PAL.ink });
    A2024.blocks.forEach(function (b, i) {
      var y = 104 + i * 22;
      var big = b.instrs.length === A2024.largest;
      if (big) panel(P_, 296, y - 3, 300, 20, { fill: PAL.validDim, stroke: PAL.valid, radius: 5, sw: 1.2 });
      P_.text(304, y, b.id, { size: 11, bold: true, mono: true, color: PAL.accent });
      P_.text(340, y, b.instrs[0].a + ' \u2026 ' + b.last.a, { size: 11, mono: true, color: PAL.ink });
      P_.text(470, y, b.instrs.length + (b.instrs.length === 1 ? ' instruction' : ' instructions'),
              { size: 11, mono: true, color: big ? PAL.valid : PAL.dim });
    });
    P_.text(620, 104, 'largest = ' + A2024.largest, { size: 13, bold: true, mono: true, color: PAL.valid });
    P_.text(620, 128, 'blocks = ' + A2024.blocks.length, { size: 13, bold: true, mono: true, color: PAL.accent });
    P_.text(620, 160, 'sizes sum to ' + A2024.sizes.reduce(function (a, b) { return a + b; }, 0), { size: 11, mono: true, color: PAL.dim });
    P_.text(620, 180, '= all ' + A2024.instrCount + ' instructions,', { size: 11, mono: true, color: PAL.dim });
    P_.text(620, 196, 'so nothing was dropped', { size: 11, mono: true, color: PAL.dim });
    fade(P_, 1);
  }

  var a3 = at(e, 90, 2);
  if (a3 > 0) {
    fade(P_, a3);
    panel(P_, 20, 298, 860, 134, { fill: PAL.surface, stroke: PAL.border });
    P_.text(34, 306, 'the trap, and the answer', { size: 11, bold: true, mono: true, color: PAL.warn });
    P_.text(34, 330, 'L3 is the target of the jump at L14, so L1 and L2 are two blocks, not one.', { size: 12, color: PAL.ink });
    P_.text(34, 350, 'Counting only the forward targets gives six blocks and the wrong option.', { size: 12, color: PAL.ink });
    P_.text(34, 376, A2024.blocks.length + ' basic blocks, largest ' + A2024.largest + ' instructions  \u2192  option D', { size: 15, bold: true, mono: true, color: PAL.valid });
    P_.text(34, 404, 'The same leader algorithm produced both answers on this page; only the program changed.', { size: 11, color: PAL.dim });
    fade(P_, 1);
  }
}

/* ---------- scene 5: the DAG ---------- */
function drawDag(P_, t, e) {
  header(P_, 'Two computations of the same value are one node',
         'Value numbering turns the block into a DAG, and the DAG is the redundancy.');

  var a1 = at(e, 120, 0);
  if (a1 > 0) {
    fade(P_, a1);
    panel(P_, 20, 52, 268, 130, { fill: PAL.surface, stroke: PAL.border });
    P_.text(32, 60, 'the block', { size: 11, bold: true, mono: true, color: PAL.accent });
    DAG_STMTS.forEach(function (s, i) {
      P_.text(32, 82 + i * 18, show(s), { size: 12, mono: true, color: PAL.ink });
    });
    fade(P_, 1);
  }

  var a2 = at(e, 120, 1);
  if (a2 > 0) {
    fade(P_, a2);
    var N = {
      b: { x: 330, y: 300, l: 'b' },
      c: { x: 420, y: 300, l: 'c' },
      two: { x: 510, y: 300, l: '2' },
      add1: { x: 375, y: 216, l: 'u, v' },
      mul: { x: 465, y: 132, l: 'w, x' },
      add2: { x: 570, y: 216, l: 'y' }
    };
    function box(n, o) {
      panel(P_, n.x - 38, n.y - 15, 76, 30, { fill: o.fill || PAL.surface, stroke: o.stroke || PAL.border, sw: 1.6, radius: 7 });
      P_.text(n.x, n.y, n.l, { size: 12, mono: true, align: 'center', base: 'middle', color: o.color || PAL.ink });
    }
    /* edges first, so the boxes sit on top */
    P_.line(N.b.x, N.b.y - 16, N.add1.x - 12, N.add1.y + 16, { stroke: PAL.border, sw: 1.4 });
    P_.line(N.c.x, N.c.y - 16, N.add1.x + 14, N.add1.y + 16, { stroke: PAL.border, sw: 1.4 });
    P_.line(N.add1.x, N.add1.y - 16, N.mul.x - 10, N.mul.y + 16, { stroke: PAL.border, sw: 1.4 });
    P_.line(N.two.x, N.two.y - 16, N.mul.x + 16, N.mul.y + 16, { stroke: PAL.border, sw: 1.4 });
    P_.line(N.add1.x + 16, N.add1.y - 14, N.add2.x - 18, N.add2.y + 16, { stroke: PAL.border, sw: 1.4 });
    P_.line(N.two.x - 8, N.two.y - 16, N.add2.x + 16, N.add2.y + 16, { stroke: PAL.border, sw: 1.4 });

    box(N.b, {}); box(N.c, {}); box(N.two, {});
    box(N.add1, { fill: PAL.accentDim, stroke: PAL.accent });
    box(N.mul, { fill: PAL.accentDim, stroke: PAL.accent });
    box(N.add2, { fill: PAL.accentDim, stroke: PAL.accent });
    P_.text(N.add1.x, N.add1.y - 22, 'b + c', { size: 10, mono: true, align: 'center', color: PAL.accent });
    P_.text(N.mul.x, N.mul.y - 22, 'u * 2', { size: 10, mono: true, align: 'center', color: PAL.accent });
    P_.text(N.add2.x, N.add2.y - 22, 'v + 2', { size: 10, mono: true, align: 'center', color: PAL.accent });
    P_.text(690, 150, 'a leaf is an initial value', { size: 10, color: PAL.dim });
    P_.text(690, 168, 'or a constant', { size: 10, color: PAL.dim });
    P_.text(690, 196, 'a shaded node is an', { size: 10, color: PAL.dim });
    P_.text(690, 214, 'operation, with the', { size: 10, color: PAL.dim });
    P_.text(690, 232, 'variables holding it', { size: 10, color: PAL.dim });
    fade(P_, 1);
  }

  var a3 = at(e, 120, 2);
  if (a3 > 0) {
    fade(P_, a3);
    panel(P_, 20, 196, 268, 118, { fill: PAL.surface2, stroke: PAL.border });
    P_.text(32, 204, 'what the counts mean', { size: 11, bold: true, mono: true, color: PAL.accent });
    P_.text(32, 226, DAG.nodes.length + ' nodes = ' + DAG.leaves + ' leaves', { size: 12, mono: true, color: PAL.ink });
    P_.text(32, 244, '           + ' + DAG.ops.length + ' operators', { size: 12, mono: true, color: PAL.ink });
    P_.text(32, 266, DAG.edges + ' edges, one per operand', { size: 12, mono: true, color: PAL.ink });
    P_.text(32, 290, '5 statements, 3 computations', { size: 11, mono: true, color: PAL.dim });

    panel(P_, 20, 330, 860, 102, { fill: PAL.surface, stroke: PAL.accentDim, sw: 1.6 });
    P_.text(34, 338, 'Read the convention before you count', { size: 11, bold: true, mono: true, color: PAL.warn });
    P_.text(34, 360, 'A question asking for DAG nodes may or may not count the leaves, and may or may not', { size: 12, color: PAL.ink });
    P_.text(34, 378, 'count a constant as a leaf. Here the count is ' + DAG.nodes.length + ' including three leaves, and ' + DAG.ops.length + ' without them.', { size: 12, color: PAL.ink });
    P_.text(34, 402, 'The structure is not in doubt; only the arithmetic convention is. Say which one you used.', { size: 11, color: PAL.dim });
    P_.text(34, 420, 'Commutativity is usually allowed: b + c and c + b are the same node.', { size: 11, color: PAL.dim });
    fade(P_, 1);
  }
}

/* ---------- scene 6: the six rewrites ---------- */
function drawRewrites(P_, t, e) {
  header(P_, 'Six rewrites, six conditions',
         'Each is local. Each is safe only while its condition holds.');

  var cards = [
    { n: 'constant folding', b: 'x = 2 * 8 \u2192 x = 16', c: 'both operands are constants, and the machine may perform the operation' },
    { n: 'constant propagation', b: 'x = 3; y = x + 1 \u2192 y = 4', c: 'x is not reassigned between the two lines' },
    { n: 'copy propagation', b: 'x = y; z = x + 1 \u2192 z = y + 1', c: 'neither x nor y is reassigned in between' },
    { n: 'common subexpression', b: 'u = b + c; v = b + c \u2192 v = u', c: 'no operand was redefined between the two' },
    { n: 'algebraic identity', b: 'x + 0 \u2192 x,  x * 1 \u2192 x', c: 'the identity holds for the type; x * 0 \u2192 0 does not hold for floats' },
    { n: 'strength reduction', b: 'x * 4 \u2192 x << 2', c: 'the cheaper form gives the identical result for every input' }
  ];
  var a1 = at(e, 150, 0);
  if (a1 > 0) {
    fade(P_, a1);
    cards.forEach(function (c, i) {
      var x = 20 + (i % 3) * 294;
      var y = 52 + Math.floor(i / 3) * 122;
      panel(P_, x, y, 280, 110, { fill: PAL.surface, stroke: PAL.accentDim, sw: 1.5 });
      P_.text(x + 12, y + 8, c.n, { size: 11, bold: true, mono: true, color: PAL.accent });
      P_.text(x + 12, y + 30, c.b, { size: 11, mono: true, color: PAL.ink });
      P_.text(x + 12, y + 58, 'condition', { size: 9, mono: true, color: PAL.faint });
      P_.text(x + 12, y + 74, c.c.slice(0, 40), { size: 10, color: PAL.dim });
      if (c.c.length > 40) P_.text(x + 12, y + 88, c.c.slice(40, 80), { size: 10, color: PAL.dim });
      if (c.c.length > 80) P_.text(x + 12, y + 100, c.c.slice(80), { size: 10, color: PAL.dim });
    });
    fade(P_, 1);
  }

  var a2 = at(e, 150, 1);
  if (a2 > 0) {
    fade(P_, a2);
    panel(P_, 20, 300, 860, 132, { fill: PAL.surface2, stroke: PAL.border });
    P_.text(34, 308, 'the block this page runs them on, and what came out', { size: 11, bold: true, mono: true, color: PAL.accent });
    P_.text(34, 330, 'before: ' + BLOCK.length + ' statements', { size: 12, mono: true, color: PAL.ink });
    P_.text(34, 350, 'after:  ' + OPT.out.length + ' statements  \u2014  ' + OPT_TEXT.join(' ; '), { size: 11, mono: true, color: PAL.ink });
    P_.text(34, 376, 'The pass order is fold, simplify, propagate copies, value-number, delete dead code,', { size: 11, color: PAL.dim });
    P_.text(34, 394, 'repeated because one pass exposes another: folding t4 = 16 is what lets x = t4 + t6', { size: 11, color: PAL.dim });
    P_.text(34, 412, 'become x = 16 + t1, which is what makes t4 and t6 dead.', { size: 11, color: PAL.dim });
    fade(P_, 1);
  }
}

/* ---------- scene 7: dead code ---------- */
function drawDead(P_, t, e) {
  header(P_, 'Dead code: what nobody reads can go',
         'Scan the block backwards from the live-out set; the guard is the side effect.');

  var a1 = at(e, 180, 0);
  if (a1 > 0) {
    fade(P_, a1);
    panel(P_, 20, 52, 420, 236, { fill: PAL.surface, stroke: PAL.border });
    P_.text(34, 60, 'the block, with x and y live out', { size: 11, bold: true, mono: true, color: PAL.accent });
    BLOCK.forEach(function (s, i) {
      var dead = !OPT.out.some(function (o) { return o.d === s.d; });
      P_.text(34, 84 + i * 22, show(s), { size: 12, mono: true, color: dead ? PAL.invalid : PAL.ink });
      if (dead) P_.line(34, 92 + i * 22, 34 + show(s).length * 7.2, 92 + i * 22, { stroke: PAL.invalid, sw: 1.4 });
    });
    P_.text(34, 272, 'struck through: removed by this page\'s optimiser', { size: 10, color: PAL.dim });
    fade(P_, 1);
  }

  var a2 = at(e, 180, 1);
  if (a2 > 0) {
    fade(P_, a2);
    panel(P_, 456, 52, 424, 236, { fill: PAL.surface2, stroke: PAL.border });
    P_.text(470, 60, 'why each one is safe to drop', { size: 11, bold: true, mono: true, color: PAL.accent });
    P_.text(470, 84, 'z = 7        z is not live out, and', { size: 11, mono: true, color: PAL.ink });
    P_.text(470, 102, '             nothing reads it', { size: 11, mono: true, color: PAL.dim });
    P_.text(470, 126, 't2 = b + c   the value is already in t1,', { size: 11, mono: true, color: PAL.ink });
    P_.text(470, 144, '             and nobody reads t2', { size: 11, mono: true, color: PAL.dim });
    P_.text(470, 168, 't5, t6       copies, all uses replaced', { size: 11, mono: true, color: PAL.ink });
    P_.text(470, 192, 'x, y         live out, so they stay', { size: 11, mono: true, color: PAL.valid });
    P_.text(470, 222, 'Deleting a dead assignment cannot change', { size: 11, color: PAL.dim });
    P_.text(470, 240, 'what the block computes, because by', { size: 11, color: PAL.dim });
    P_.text(470, 258, 'definition nothing reads the value.', { size: 11, color: PAL.dim });
    fade(P_, 1);
  }

  var a3 = at(e, 180, 2);
  if (a3 > 0) {
    fade(P_, a3);
    panel(P_, 20, 300, 860, 132, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.6 });
    P_.text(34, 308, 'the guard: an assignment with a side effect is never dead', { size: 11, bold: true, mono: true, color: PAL.warn });
    P_.text(34, 330, '*p = 5   a[i] = 0   volatile flag = 1   t = f()', { size: 12, mono: true, color: PAL.ink });
    P_.text(34, 354, 'None of these writes a variable the block reads again, so a naive liveness test calls', { size: 11, color: PAL.ink });
    P_.text(34, 372, 'them dead. They are not: the store is the whole point of the statement.', { size: 11, color: PAL.ink });
    P_.text(34, 398, 'On this page the side-effect flag is what stops the deletion, and the check below', { size: 11, color: PAL.dim });
    P_.text(34, 416, 'confirms that a store through a pointer survives a sweep that removes its neighbour.', { size: 11, color: PAL.dim });
    fade(P_, 1);
  }
}

/* ---------- scene 8: soundness ---------- */
function drawSound(P_, t, e) {
  header(P_, 'Four rewrites that look right and are not',
         'Each witness below was found by search, not quoted.');

  var cards = [
    { n: 'reassociation', b: '(a+b)+c \u2192 a+(b+c)', w: FP_W ? '(' + FP_W.a + '+' + FP_W.b + ')+' + FP_W.c + ' = ' + FP_W.lhs : '', w2: FP_W ? 'a+(' + FP_W.b + '+' + FP_W.c + ') = ' + FP_W.rhs : '', note: 'floating point addition is not associative' },
    { n: 'division by shifting', b: 'x / 2 \u2192 x >> 1', w: 'x = ' + SHIFT_X + ':  x / 2 = ' + SHIFT_DIV, w2: 'x >> 1 = ' + SHIFT_SHR, note: 'C truncates toward zero; the shift rounds down' },
    { n: 'multiplying by zero', b: 'x * 0 \u2192 0', w: 'x = NaN:  x * 0 = ' + String(NAN_W.times0), w2: 'the rewrite gives 0', note: 'NaN absorbs the multiplication' },
    { n: 'folding a division', b: 'x = 1 / 0 \u2192 x = ?', w: 'integer division by zero traps', w2: 'the fold is refused here', note: 'canFold returns false for a zero divisor' }
  ];
  var a1 = at(e, 210, 0);
  if (a1 > 0) {
    fade(P_, a1);
    cards.forEach(function (c, i) {
      var x = 20 + (i % 2) * 440;
      var y = 52 + Math.floor(i / 2) * 120;
      panel(P_, x, y, 420, 108, { fill: PAL.invalidDim, stroke: PAL.invalid, sw: 1.5 });
      P_.text(x + 12, y + 8, c.n, { size: 11, bold: true, mono: true, color: PAL.invalid });
      P_.text(x + 12, y + 28, c.b, { size: 12, mono: true, color: PAL.ink });
      P_.text(x + 12, y + 50, c.w, { size: 10, mono: true, color: PAL.ink });
      P_.text(x + 12, y + 66, c.w2, { size: 10, mono: true, color: PAL.ink });
      P_.text(x + 12, y + 88, c.note, { size: 10, color: PAL.dim });
    });
    fade(P_, 1);
  }

  var a2 = at(e, 210, 1);
  if (a2 > 0) {
    fade(P_, a2);
    panel(P_, 20, 292, 860, 68, { fill: PAL.surface2, stroke: PAL.border });
    P_.text(34, 300, 'and two more, from the machine rather than the mathematics', { size: 11, bold: true, mono: true, color: PAL.accent });
    P_.text(34, 322, 'Overflow: folding 2147483647 + 1 in 32 bits gives ' + OVERFLOW.folded + ', not ' + OVERFLOW.exact + '.', { size: 11, mono: true, color: PAL.ink });
    P_.text(34, 342, 'Aliasing: after a[j] = 5, reusing an earlier a[i] gives ' + ALIAS.t + ' instead of ' + ALIAS.u + ' when i = j.', { size: 11, mono: true, color: PAL.ink });
    fade(P_, 1);
  }

  var a3 = at(e, 210, 2);
  if (a3 > 0) {
    fade(P_, a3);
    panel(P_, 20, 372, 860, 60, { fill: PAL.surface, stroke: PAL.accentDim, sw: 1.6 });
    P_.text(34, 380, 'The rule behind all six', { size: 11, bold: true, mono: true, color: PAL.accent });
    P_.text(34, 402, 'A rewrite is allowed only if every input the program can supply gives the same result,', { size: 11, color: PAL.ink });
    P_.text(34, 418, 'and no observable behaviour is lost. Where the mathematics and the machine disagree,', { size: 11, color: PAL.ink });
    fade(P_, 1);
  }
}

/* ---------- scene 9: where local stops ---------- */
function drawStops(P_, t, e) {
  header(P_, 'A fact in one block is invisible in the next',
         'This is the boundary between local optimisation and data-flow analysis.');

  var a1 = at(e, 240, 0);
  if (a1 > 0) {
    fade(P_, a1);
    var n = {
      b1: { x: 150, y: 76 }, b2: { x: 80, y: 168 }, b3: { x: 220, y: 168 }, b4: { x: 150, y: 262 }
    };
    P_.arrow(n.b1.x, n.b1.y + 20, n.b2.x + 14, n.b2.y - 20, { stroke: PAL.dim, sw: 1.4, head: 6 });
    P_.arrow(n.b1.x, n.b1.y + 20, n.b3.x - 14, n.b3.y - 20, { stroke: PAL.dim, sw: 1.4, head: 6 });
    P_.arrow(n.b2.x, n.b2.y + 20, n.b4.x - 14, n.b4.y - 20, { stroke: PAL.dim, sw: 1.4, head: 6 });
    P_.arrow(n.b3.x, n.b3.y + 20, n.b4.x + 14, n.b4.y - 20, { stroke: PAL.dim, sw: 1.4, head: 6 });
    [['B1', n.b1, 't = a + b'], ['B2', n.b2, 'u = a + b'], ['B3', n.b3, 'a = 5'], ['B4', n.b4, 'v = a + b']].forEach(function (b) {
      panel(P_, b[1].x - 52, b[1].y - 20, 104, 40, { fill: PAL.surface, stroke: PAL.accent, sw: 1.5, radius: 7 });
      P_.text(b[1].x - 44, b[1].y - 14, b[0], { size: 11, bold: true, mono: true, color: PAL.accent });
      P_.text(b[1].x - 44, b[1].y + 2, b[2], { size: 11, mono: true, color: PAL.ink });
    });
    fade(P_, 1);
  }

  var a2 = at(e, 240, 1);
  if (a2 > 0) {
    fade(P_, a2);
    panel(P_, 310, 52, 570, 118, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.5 });
    P_.text(324, 60, 'what a local pass can say', { size: 11, bold: true, mono: true, color: PAL.warn });
    P_.text(324, 82, 'Inside B2 the block computes a + b itself and reads nothing', { size: 11, color: PAL.ink });
    P_.text(324, 100, 'computed before it, so there is no local redundancy to remove.', { size: 11, color: PAL.ink });
    P_.text(324, 124, 'B1 computed the same expression, but B1 is a different block,', { size: 11, color: PAL.ink });
    P_.text(324, 142, 'and nothing inside B2 mentions B1.', { size: 11, color: PAL.ink });

    panel(P_, 310, 182, 570, 106, { fill: PAL.validDim, stroke: PAL.valid, sw: 1.5 });
    P_.text(324, 190, 'what a global pass can say', { size: 11, bold: true, mono: true, color: PAL.valid });
    P_.text(324, 212, 'Available expressions over the whole graph finds a + b available', { size: 11, color: PAL.ink });
    P_.text(324, 230, 'at the entry of B2, so the second computation can be replaced.', { size: 11, color: PAL.ink });
    P_.text(324, 254, 'After the join it is not available, because B3 overwrote a.', { size: 11, color: PAL.ink });
    P_.text(324, 272, 'That whole argument is the previous lesson, not this one.', { size: 11, color: PAL.dim });
    fade(P_, 1);
  }

  var a3 = at(e, 240, 2);
  if (a3 > 0) {
    fade(P_, a3);
    panel(P_, 20, 300, 860, 132, { fill: PAL.surface, stroke: PAL.border });
    P_.text(34, 308, 'GATE CSE 2021 Set 2 Q30, counted', { size: 11, bold: true, mono: true, color: PAL.accent });
    P_.text(34, 330, 'The loop runs ' + Q2021.iters + ' times. Each turn costs ' + Q2021.addsPerIter + ' additions (two in the branch, one in i = i + 2).', { size: 11, color: PAL.ink });
    P_.text(34, 348, 'Hoisting x + 3, y->f1 and y->f2 out of the loop leaves ' + Q2021.addsOutside + ' additions before it.', { size: 11, color: PAL.ink });
    P_.text(34, 368, Q2021.addsOutside + ' + ' + Q2021.iters + ' \u00d7 ' + Q2021.addsPerIter + ' = ' + Q2021.adds + ' additions, and ' + Q2021.derefs + ' dereferences  \u2192  option D', { size: 13, bold: true, mono: true, color: PAL.valid });
    P_.text(34, 398, 'The hoisting is not local: it needs the fact that the loop body never changes x, y,', { size: 11, color: PAL.dim });
    P_.text(34, 416, 'y->f1 or y->f2, which is a statement about every block in the loop at once.', { size: 11, color: PAL.dim });
    fade(P_, 1);
  }
}

/* ---------- scene 10: the procedure ---------- */
function drawProcedure(P_, t, e) {
  header(P_, 'Five steps, three traps',
         'The order matters: leaders first, then blocks, then edges, then the rewrite.');

  var a1 = at(e, 270, 0);
  if (a1 > 0) {
    fade(P_, a1);
    panel(P_, 20, 52, 520, 268, { fill: PAL.surface, stroke: PAL.border });
    P_.text(34, 60, 'any local-optimisation question', { size: 11, bold: true, mono: true, color: PAL.accent });
    var steps = [
      '1  mark the leaders: first, targets, after jumps',
      '2  cut at every leader; count the cuts',
      '3  add an edge for each jump and each fall-through',
      '4  apply the rewrite the question names, in order',
      '5  re-count, and re-check the condition each time'
    ];
    steps.forEach(function (s, i) {
      P_.text(34, 88 + i * 26, s, { size: 12, mono: true, color: PAL.ink });
    });
    P_.text(34, 232, 'Steps 1 to 3 are always the same three rules.', { size: 11, color: PAL.dim });
    P_.text(34, 250, 'Step 4 is the only part that changes with the topic.', { size: 11, color: PAL.dim });
    P_.text(34, 276, 'A question about blocks never needs an optimisation,', { size: 11, color: PAL.dim });
    P_.text(34, 294, 'and a question about a rewrite never needs the edges.', { size: 11, color: PAL.dim });
    fade(P_, 1);
  }

  var a2 = at(e, 270, 1);
  if (a2 > 0) {
    fade(P_, a2);
    panel(P_, 556, 52, 324, 268, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.5 });
    P_.text(570, 60, 'three traps', { size: 11, bold: true, mono: true, color: PAL.warn });
    P_.text(570, 84, 'a backward jump target', { size: 12, bold: true, color: PAL.ink });
    P_.text(570, 102, 'starts a block too, so L3 in', { size: 10, color: PAL.dim });
    P_.text(570, 118, 'the 2024 paper is a leader', { size: 10, color: PAL.dim });
    P_.text(570, 146, 'the instruction after a jump', { size: 12, bold: true, color: PAL.ink });
    P_.text(570, 164, 'is a leader even when the jump', { size: 10, color: PAL.dim });
    P_.text(570, 180, 'is unconditional', { size: 10, color: PAL.dim });
    P_.text(570, 208, 'whether EXIT counts', { size: 12, bold: true, color: PAL.ink });
    P_.text(570, 226, 'as a node changes the node', { size: 10, color: PAL.dim });
    P_.text(570, 242, 'and edge count, not the blocks', { size: 10, color: PAL.dim });
    P_.text(570, 272, 'Read what the question counts', { size: 11, color: PAL.warn });
    P_.text(570, 290, 'before you count anything.', { size: 11, color: PAL.warn });
    fade(P_, 1);
  }

  panel(P_, 20, 336, 860, 96, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.6 });
  P_.text(34, 344, 'Takeaway', { size: 11, bold: true, mono: true, color: PAL.accent });
  P_.text(34, 368, 'Local optimisation is the set of rewrites a single block can justify on its own:', { size: 12, color: PAL.ink });
  P_.text(34, 386, 'fold, propagate, reuse, simplify, cheapen, delete. Everything it cannot justify is a', { size: 12, color: PAL.ink });
  P_.text(34, 404, 'question about other blocks, and that is where data-flow analysis begins.', { size: 12, color: PAL.ink });
}

/* ---------- frame ---------- */

var SCENE_DRAW = {
  'where-local': drawWhereLocal,
  'leaders': drawLeaders,
  'cfg-2025': draw2025,
  'cfg-2024': draw2024,
  'dag': drawDag,
  'rewrites': drawRewrites,
  'dead-code': drawDead,
  'soundness': drawSound,
  'where-local-stops': drawStops,
  'procedure': drawProcedure
};

function drawFrame(P_) {
  if (!P_) return;
  P_.alpha(1);
  P_.clear();
  var scenes = (window.LESSON_TIMELINE && window.LESSON_TIMELINE.scenes) || [];
  var e = K ? K.state.elapsed : 0;
  var i = K ? K.sceneAt(e) : 0;
  var sc = scenes[i];
  if (!sc) return;
  var fn = SCENE_DRAW[sc.id];
  if (fn) fn(P_, e, e);
  P_.alpha(1);
  P_.line(20, 450, 880, 450, { stroke: PAL.border, sw: 1 });
  P_.text(20, 456, 'scene ' + (i + 1) + ' of ' + scenes.length + '  \u00b7  ' + sc.title,
          { size: 10, mono: true, color: PAL.faint });
  P_.text(880, 456, 'all numbers computed by this page', { size: 10, mono: true, align: 'right', color: PAL.faint });
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
  if (fallback) fallback.classList.remove('show');

  var ok = false;
  if (window.p5 && holder && PR) {
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
    } catch (err) {
      console.error('p5 failed', err);
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
    } catch (err) {
      console.error('canvas fallback failed', err);
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
  a2025: A2025, a2024: A2024, dag: DAG, opt: OPT, equiv: EQUIV,
  q2021: Q2021, fp: FP_W, alias: ALIAS
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
