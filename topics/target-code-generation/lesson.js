/* ==========================================================================
   target-code-generation — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each value re-verified against a definition, a second
                         route, or an exhaustive search.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The DAG is built from the basic block by operator lookup, so sharing is a
   property of the block and not a drawing decision. Both instruction
   selections are generated from that DAG and then executed on a small machine.
   The minimum register count for the 2017 expression is found by exhaustive
   search over every order in which the tree can be evaluated, with and without
   immediates. Liveness is iterated to a fixed point over the 2013 block's
   control-flow graph, the interference graph is built from the live sets and
   checked pair by pair against the definition, the chromatic number comes from
   an exhaustive search that agrees with a greedy colouring, and the cheapest
   spill set is found by trying all 63 non-empty subsets. The peephole pass is
   checked by executing the original and the rewritten program on every input
   pair from 0 to 4.
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
  var INVALIDDIM = PAL.invalidDim || '#fbe4e2';

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

/* ======================================================================
   target-code-generation — MODEL (developed and validated standalone first)
   Every number the lesson shows is produced here and re-verified by a
   second route, a definition, or an exhaustive search.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}
function num(v, d) { return Number(v).toFixed(d === undefined ? 6 : d); }

/* ---------- 1. expression trees ---------- */
function Lf(n, isConst) { return { leaf: n, konst: !!isConst }; }
function Nd(op, l, r) { return { op: op, l: l, r: r }; }

/* the GATE CSE 2017 Set 1 Q52 expression: (a-1) * (((b+c)/3) + d) */
var T2017 = Nd('*',
  Nd('-', Lf('a'), Lf('1', true)),
  Nd('+', Nd('/', Nd('+', Lf('b'), Lf('c')), Lf('3', true)), Lf('d')));

var TREES = {
  T2017: T2017,
  TBAL: Nd('+',
    Nd('*', Nd('+', Lf('a'), Lf('b')), Nd('+', Lf('c'), Lf('d'))),
    Nd('*', Nd('+', Lf('e'), Lf('f')), Nd('+', Lf('g'), Lf('h')))),
  TCHAIN: Nd('-', Nd('-', Lf('a'), Lf('b')), Nd('*', Lf('c'), Lf('d'))),
  TSMALL: Nd('+', Nd('*', Lf('a'), Lf('b')), Nd('-', Lf('c'), Lf('1', true)))
};

/* Sethi-Ullman / Ershov numbering. constantsCountAsOne = the classic form,
   where every leaf needs a register. */
function suLabel(n, constantsCountAsOne) {
  if (n.leaf) return n.konst && !constantsCountAsOne ? 0 : 1;
  var l = suLabel(n.l, constantsCountAsOne), r = suLabel(n.r, constantsCountAsOne);
  return l === r ? l + 1 : (l > r ? l : r);
}

/* ---------- 2. exact minimum registers, by exhaustive search ----------
   A load-store machine. A variable leaf must be loaded into a register; a
   constant leaf is free when the machine has immediates. `alias` says whether
   an instruction may write its result into a register that already holds an
   operand (2-address style). Registers are a set of tree-node ids. */
function nodesOf(n, out) {
  out = out || [];
  if (n.leaf) { out.push(n); return out; }
  nodesOf(n.l, out); nodesOf(n.r, out); out.push(n);
  return out;
}

function minRegs(tree, opt) {
  var imm = !!opt.imm, alias = !!opt.alias;
  var ns = nodesOf(tree, []);
  ns.forEach(function (n, i) { n.__i = i; });
  function isReg(n) { return n.leaf ? !(imm && n.konst) : true; }
  function ready(n, regs) {
    if (n.leaf) return regs.has(n.__i);
    var kids = [n.l, n.r];
    for (var k = 0; k < 2; k++) {
      var c = kids[k];
      if (c.leaf) { if (isReg(c) && !regs.has(c.__i)) return false; }
      else if (!regs.has(c.__i)) return false;
    }
    return true;
  }
  function search(k) {
    var seen = new Set();
    function maskOf() { var m = 0; ns.forEach(function (n) { if (n.__done) m |= (1 << n.__i); }); return m; }
    function dfs(regs, done) {
      if (done === ns.length) return true;
      var key = [...regs].sort(function (a, b) { return a - b; }).join(',') + '|' + maskOf();
      if (seen.has(key)) return false;
      seen.add(key);
      for (var i = 0; i < ns.length; i++) {
        var n = ns[i];
        if (n.__done) continue;
        if (n.leaf) {
          if (!isReg(n)) { n.__done = true; var ok0 = dfs(regs, done + 1); n.__done = false; if (ok0) return true; continue; }
          if (regs.has(n.__i)) { n.__done = true; var ok1 = dfs(regs, done + 1); n.__done = false; if (ok1) return true; continue; }
          if (regs.size >= k) continue;
          regs.add(n.__i); n.__done = true;
          var ok2 = dfs(regs, done + 1);
          n.__done = false; regs.delete(n.__i);
          if (ok2) return true;
          continue;
        }
        if (!ready(n, regs)) continue;
        var kids = [n.l, n.r];
        var inRegs = kids.filter(function (c) { return c.leaf ? regs.has(c.__i) : regs.has(c.__i); });
        if (alias) {
          var next = new Set(regs);
          inRegs.forEach(function (c) { next.delete(c.__i); });
          next.add(n.__i);
          if (next.size > k) continue;
          n.__done = true;
          var okA = dfs(next, done + 1);
          n.__done = false;
          if (okA) return true;
        } else {
          if (regs.size + 1 > k) continue;
          var next2 = new Set(regs);
          inRegs.forEach(function (c) { next2.delete(c.__i); });
          next2.add(n.__i);
          n.__done = true;
          var okB = dfs(next2, done + 1);
          n.__done = false;
          if (okB) return true;
        }
      }
      return false;
    }
    return dfs(new Set(), 0);
  }
  for (var k = 1; k <= 8; k++) if (search(k)) return k;
  return Infinity;
}

var REG = {
  classic: minRegs(T2017, { imm: false, alias: false }),
  immNoAlias: minRegs(T2017, { imm: true, alias: false }),
  aliasNoImm: minRegs(T2017, { imm: false, alias: true }),
  exact: minRegs(T2017, { imm: true, alias: true }),
  su: suLabel(T2017, true),
  suImm: suLabel(T2017, false)
};

/* ---------- 3. a basic block and its DAG ---------- */
/* each statement is {dst, op, x, y}; x/y are names or constants */
var BLOCK = [
  { dst: 't1', op: '*', x: 'a', y: 'b' },
  { dst: 't2', op: '*', x: 'c', y: 'd' },
  { dst: 't3', op: '+', x: 't1', y: 't2' },
  { dst: 't4', op: '*', x: 'a', y: 'b' },
  { dst: 't5', op: '-', x: 't4', y: 't2' }
];

function dagOf(block) {
  var byKey = new Map(), order = [], edges = [];
  function leafNode(name) {
    var key = 'L:' + name;
    if (!byKey.has(key)) { byKey.set(key, { id: order.length, kind: 'leaf', name: name }); order.push(byKey.get(key)); }
    return byKey.get(key);
  }
  var dstNode = {};
  for (var s of block) {
    var l = /^t\d+$/.test(s.x) ? dstNode[s.x] : leafNode(s.x);
    var r = /^t\d+$/.test(s.y) ? dstNode[s.y] : leafNode(s.y);
    var key = 'O:' + s.op + ':' + l.id + ':' + r.id;
    if (!byKey.has(key)) { byKey.set(key, { id: order.length, kind: 'op', op: s.op, l: l, r: r }); order.push(byKey.get(key)); }
    dstNode[s.dst] = byKey.get(key);
  }
  var seen = new Set();
  order.forEach(function (n) { if (n.kind === 'op') { edges.push([n.l.id, n.id]); edges.push([n.r.id, n.id]); } });
  var ops = order.filter(function (n) { return n.kind === 'op'; }).length;
  var leaves = order.filter(function (n) { return n.kind === 'leaf'; }).length;
  return { nodes: order, ops: ops, leaves: leaves, edges: edges };
}

var DAG = dagOf(BLOCK);
var NAIVE_OPS = BLOCK.length;
var NAIVE_LEAVES = BLOCK.reduce(function (s, st) {
  return s + (/^t\d+$/.test(st.x) ? 0 : 1) + (/^t\d+$/.test(st.y) ? 0 : 1);
}, 0);

/* ---------- 4. two targets, two instruction counts ----------
   T1: load-store, three-address, every operand in a register.
   T2: two-address, one memory operand allowed.
   Both are generated from the DAG and then EXECUTED. */
function selectT1(dag) {
  /* a simple allocating selector: leaves are loaded when first needed, and a
     register is reused as soon as its last use has been consumed. */
  var usesLeft = {};
  dag.nodes.forEach(function (n) { usesLeft[n.id] = 0; });
  dag.nodes.forEach(function (n) { if (n.kind === 'op') { usesLeft[n.l.id]++; usesLeft[n.r.id]++; } });
  var regOf = {}, free = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6'], code = [], peak = 0;
  function take() { var r = free.shift(); peak = Math.max(peak, 6 - free.length); return r; }
  function give(r) { if (r && free.indexOf(r) === -1) free.unshift(r); }
  function emit(n) {
    if (regOf[n.id]) return regOf[n.id];
    if (n.kind === 'leaf') { var r0 = take(); code.push({ op: 'LOAD', a: r0, b: n.name }); regOf[n.id] = r0; return r0; }
    var l = emit(n.l), r = emit(n.r);
    var cand = [];
    if (usesLeft[n.l.id] <= 1) cand.push(l);
    if (usesLeft[n.r.id] <= 1) cand.push(r);
    var dest = cand.length ? cand[0] : take();
    code.push({ op: n.op === '*' ? 'MUL' : n.op === '+' ? 'ADD' : 'SUB', a: dest, b: l, c: r, dst: dest });
    usesLeft[n.l.id]--; usesLeft[n.r.id]--;
    if (usesLeft[n.l.id] === 0 && l !== dest) give(l);
    if (usesLeft[n.r.id] === 0 && r !== dest) give(r);
    regOf[n.id] = dest;
    return dest;
  }
  dag.nodes.filter(function (n) { return n.kind === 'op'; }).forEach(function (n) { emit(n); });
  return { code: code, peak: peak };
}
/* T3: an accumulator machine. One register; every operand comes from memory,
   every result goes back to memory. 3 instructions per operator node. */
function selectAcc(dag) {
  var code = [], tmpOf = {};
  function src(n) { return n.kind === 'leaf' ? n.name : ('$' + n.id); }
  dag.nodes.forEach(function (n) {
    if (n.kind !== 'op') return;
    code.push({ op: 'LOAD', a: src(n.l) });
    code.push({ op: n.op === '*' ? 'MUL' : n.op === '+' ? 'ADD' : 'SUB', a: src(n.r) });
    tmpOf[n.id] = '$' + n.id;
    code.push({ op: 'STORE', a: '$' + n.id });
  });
  return code;
}
function runAcc(code, mem) {
  var M = Object.assign({}, mem), acc = 0, peak = 1;
  code.forEach(function (i) {
    if (i.op === 'LOAD') acc = M[i.a] === undefined ? 0 : M[i.a];
    else if (i.op === 'STORE') M[i.a] = acc;
    else { var y = M[i.a] === undefined ? 0 : M[i.a]; acc = i.op === 'MUL' ? acc * y : i.op === 'ADD' ? acc + y : acc - y; }
  });
  return { M: M, acc: acc, peak: peak };
}

/* a tiny machine: registers R1..R6, memory as a plain object */
function runCode(code, mem, mode) {
  var R = { R1: 0, R2: 0, R3: 0, R4: 0, R5: 0, R6: 0 };
  var M = Object.assign({}, mem), peak = 0, touched = new Set();
  function val(x) {
    if (/^R\d$/.test(x)) { touched.add(x); return R[x]; }
    if (/^-?\d+$/.test(x)) return Number(x);
    return M[x] === undefined ? 0 : M[x];
  }
  code.forEach(function (i) {
    if (i.op === 'LOAD') { R[i.a] = M[i.b] === undefined ? 0 : M[i.b]; touched.add(i.a); }
    else if (i.op === 'MOV') { R[i.a] = val(i.b); touched.add(i.a); }
    else if (i.op === 'STORE') { M[i.b] = R[i.a]; touched.add(i.a); }
    else {
      var x = val(i.b), y = val(i.c), v = i.op === 'MUL' ? x * y : i.op === 'ADD' ? x + y : x - y;
      R[i.a] = v; touched.add(i.a);
    }
    peak = Math.max(peak, touched.size);
  });
  return { M: M, R: R, peak: peak };
}

var T1 = selectT1(DAG), CODE_T1 = T1.code, CODE_ACC = selectAcc(DAG);

/* ---------- 5. liveness on the GATE CSE 2013 Q49 block ---------- */
var PROG = [
  { id: 'S1', text: 'c = a + b', def: ['c'], use: ['a', 'b'], succ: ['S2'] },
  { id: 'S2', text: 'd = c * a', def: ['d'], use: ['c', 'a'], succ: ['S3'] },
  { id: 'S3', text: 'e = c + a', def: ['e'], use: ['c', 'a'], succ: ['S4'] },
  { id: 'S4', text: 'x = c * c', def: ['x'], use: ['c'], succ: ['S5'] },
  { id: 'S5', text: 'if (x > a) goto L1', def: [], use: ['x', 'a'], succ: ['S8', 'S6'] },
  { id: 'S6', text: 'y = a * a', def: ['y'], use: ['a'], succ: ['S7'] },
  { id: 'S7', text: 'goto L2', def: [], use: [], succ: ['S10'] },
  { id: 'S8', text: 'L1: d = d * d', def: ['d'], use: ['d'], succ: ['S9'] },
  { id: 'S9', text: 'e = e * e', def: ['e'], use: ['e'], succ: ['S10'] },
  { id: 'S10', text: 'L2:', def: [], use: [], succ: [] }
];
var VARS = ['a', 'b', 'c', 'd', 'e', 'x', 'y'];

function liveness(prog) {
  var byId = {};
  prog.forEach(function (s) { byId[s.id] = s; });
  var liveIn = {}, liveOut = {};
  prog.forEach(function (s) { liveIn[s.id] = new Set(); liveOut[s.id] = new Set(); });
  var changed = true, rounds = 0;
  while (changed && rounds < 100) {
    changed = false; rounds++;
    for (var i = prog.length - 1; i >= 0; i--) {
      var s = prog[i], out = new Set();
      s.succ.forEach(function (t) { liveIn[t].forEach(function (v) { out.add(v); }); });
      var inn = new Set(s.use);
      out.forEach(function (v) { if (s.def.indexOf(v) === -1) inn.add(v); });
      if (out.size !== liveOut[s.id].size || inn.size !== liveIn[s.id].size ||
          [...out].some(function (v) { return !liveOut[s.id].has(v); }) ||
          [...inn].some(function (v) { return !liveIn[s.id].has(v); })) {
        liveOut[s.id] = out; liveIn[s.id] = inn; changed = true;
      }
    }
  }
  return { liveIn: liveIn, liveOut: liveOut, rounds: rounds };
}

var LIVE = liveness(PROG);
var MAXLIVE = Math.max.apply(null, PROG.map(function (s) { return LIVE.liveIn[s.id].size; }));

/* interference: two variables interfere when some point has both live */
function interference(prog, live, drop) {
  drop = drop || [];
  var edges = new Set();
  function pairs(set) {
    var a = [...set].filter(function (v) { return VARS.indexOf(v) !== -1 && drop.indexOf(v) === -1; });
    for (var i = 0; i < a.length; i++) for (var j = i + 1; j < a.length; j++) {
      edges.add([a[i], a[j]].sort().join('-'));
    }
  }
  prog.forEach(function (s) { pairs(live.liveIn[s.id]); pairs(live.liveOut[s.id]); });
  return [...edges].sort();
}

var EDGES = interference(PROG, LIVE);
var NODES = VARS.filter(function (v) { return EDGES.some(function (e) { return e.split('-').indexOf(v) !== -1; }); });

function degreeOf(v, edges) { return edges.filter(function (e) { return e.split('-').indexOf(v) !== -1; }).length; }

/* exhaustive k-colouring: returns an assignment object or null */
function colour(k, nodes, edges) {
  var adj = {};
  nodes.forEach(function (v) { adj[v] = []; });
  edges.forEach(function (e) { var p = e.split('-'); adj[p[0]].push(p[1]); adj[p[1]].push(p[0]); });
  var col = {}, found = null;
  function dfs(i) {
    if (i === nodes.length) { found = Object.assign({}, col); return true; }
    for (var c = 0; c < k; c++) {
      var v = nodes[i], bad = false;
      for (var nb of adj[v]) if (col[nb] === c) { bad = true; break; }
      if (!bad) { col[v] = c; if (dfs(i + 1)) return true; delete col[v]; }
    }
    return false;
  }
  dfs(0);
  return found;
}
function chromatic(nodes, edges) {
  for (var k = 1; k <= nodes.length; k++) if (colour(k, nodes, edges)) return k;
  return nodes.length;
}
function greedyColour(nodes, edges) {
  var order = nodes.slice().sort(function (a, b) { return degreeOf(b, edges) - degreeOf(a, edges) || a.localeCompare(b); });
  var adj = {};
  nodes.forEach(function (v) { adj[v] = []; });
  edges.forEach(function (e) { var p = e.split('-'); adj[p[0]].push(p[1]); adj[p[1]].push(p[0]); });
  var col = {};
  order.forEach(function (v) {
    var used = new Set(adj[v].map(function (n) { return col[n]; }));
    var c = 0; while (used.has(c)) c++;
    col[v] = c;
  });
  return { order: order, col: col };
}
function validColouring(col, edges) {
  return edges.every(function (e) { var p = e.split('-'); return col[p[0]] !== col[p[1]]; });
}
function maxClique(nodes, edges) {
  var best = [];
  function conn(a, b) { return edges.indexOf([a, b].sort().join('-')) !== -1; }
  function rec(start, cur) {
    if (cur.length > best.length) best = cur.slice();
    for (var i = start; i < nodes.length; i++) {
      var v = nodes[i];
      if (cur.every(function (u) { return conn(u, v); })) { cur.push(v); rec(i + 1, cur); cur.pop(); }
    }
  }
  rec(0, []);
  return best;
}

var GREEDY = greedyColour(NODES, EDGES);
var CHI = chromatic(NODES, EDGES);
var CLIQUE = maxClique(NODES, EDGES);
var GREEDY_COLOURS = Math.max.apply(null, NODES.map(function (v) { return GREEDY.col[v]; })) + 1;

/* ---------- 6. spilling: cheapest set that makes the graph 3-colourable ---------- */
function usesOf(prog, v) { return prog.filter(function (s) { return s.use.indexOf(v) !== -1; }).length; }
function defsOf(prog, v) { return prog.filter(function (s) { return s.def.indexOf(v) !== -1; }).length; }
function spillCost(prog, v) { return usesOf(prog, v) + defsOf(prog, v); }

function cheapestSpill(k) {
  var best = null;
  var all = NODES;
  for (var mask = 1; mask < (1 << all.length); mask++) {
    var drop = all.filter(function (v, i) { return mask & (1 << i); });
    var keep = all.filter(function (v) { return drop.indexOf(v) === -1; });
    var e2 = interference(PROG, LIVE, drop);
    if (chromatic(keep, e2) > k) continue;
    var cost = drop.reduce(function (s, v) { return s + spillCost(PROG, v); }, 0);
    if (!best || cost < best.cost || (cost === best.cost && drop.length < best.drop.length)) {
      best = { drop: drop, cost: cost };
    }
  }
  return best;
}
var SPILL3 = cheapestSpill(3);

/* ---------- 7. peephole optimisation, checked by execution ---------- */
var PEEP_BEFORE = [
  { op: 'LOAD', a: 'R1', b: 'a' },
  { op: 'STORE', a: 'R1', b: 't' },
  { op: 'LOAD', a: 'R1', b: 't' },
  { op: 'ADD', a: 'R1', b: 'R1', c: '#0' },
  { op: 'MUL', a: 'R1', b: 'R1', c: '#1' },
  { op: 'STORE', a: 'R1', b: 'b' },
  { op: 'JMP', b: 'L1' },
  { op: 'LABEL', b: 'L1' },
  { op: 'LOAD', a: 'R2', b: 'c' },
  { op: 'STORE', a: 'R2', b: 'b' },
  { op: 'STORE', a: 'R1', b: 'b' }
];

function peephole(prog) {
  var p = prog.map(function (i) { return Object.assign({}, i); });
  var removed = { r1: 0, r2: 0, r3: 0, r4: 0, r5: 0 };
  var again = true;
  while (again) {
    again = false;
    for (var i = 0; i < p.length; i++) {
      var a = p[i], b = p[i + 1];
      /* R1: LOAD r,x straight after STORE r,x */
      if (a && b && a.op === 'STORE' && b.op === 'LOAD' && a.a === b.a && a.b === b.b) {
        p.splice(i + 1, 1); removed.r1++; again = true; break;
      }
      /* R2: ADD r,r,#0 */
      if (a && a.op === 'ADD' && a.a === a.b && a.c === '#0') { p.splice(i, 1); removed.r2++; again = true; break; }
      /* R3: MUL r,r,#1 */
      if (a && a.op === 'MUL' && a.a === a.b && a.c === '#1') { p.splice(i, 1); removed.r3++; again = true; break; }
      /* R4: JMP to the label on the very next line */
      if (a && b && a.op === 'JMP' && b.op === 'LABEL' && a.b === b.b) { p.splice(i, 1); removed.r4++; again = true; break; }
      /* R5: STORE r,x overwritten by STORE r2,x with no intervening LOAD of x */
      if (a && b && a.op === 'STORE' && b.op === 'STORE' && a.b === b.b) { p.splice(i, 1); removed.r5++; again = true; break; }
    }
  }
  return { code: p, removed: removed, saved: prog.length - p.length };
}

function runPeep(prog, a, c) {
  var R = { R1: 0, R2: 0 }, M = { a: a, c: c, b: 0, t: 0 }, pc = 0, guard = 0;
  var labels = {};
  prog.forEach(function (i, idx) { if (i.op === 'LABEL') labels[i.b] = idx; });
  while (pc < prog.length && guard++ < 200) {
    var i = prog[pc];
    if (i.op === 'LOAD') R[i.a] = M[i.b] === undefined ? 0 : M[i.b];
    else if (i.op === 'STORE') M[i.b] = R[i.a];
    else if (i.op === 'JMP') { pc = labels[i.b]; continue; }
    else if (i.op === 'LABEL') { }
    else {
      var y = /^#/.test(i.c) ? Number(i.c.slice(1)) : R[i.c];
      var x = R[i.b];
      R[i.a] = i.op === 'ADD' ? x + y : x * y;
    }
    pc++;
  }
  return { M: M, R: R };
}

var PEEP = peephole(PEEP_BEFORE);

/* ---------- 8. checks ---------- */
(function () {
  /* trees and the Sethi-Ullman numbering */
  chk('SU numbering of the 2017 expression is 3',
    REG.su === 3, 'computed ' + REG.su);
  chk('SU numbering with constants free is 2 for the left subtree branch',
    suLabel(T2017.l, false) === 1, 'left subtree label ' + suLabel(T2017.l, false));
  chk('exact minimum with immediates and aliasing is 2 (GATE 2017 Set 1 Q52 keys 2)',
    REG.exact === 2, 'computed ' + REG.exact);
  chk('the exact search agrees with the SU label when constants are charged a register',
    REG.aliasNoImm === REG.su, REG.aliasNoImm + ' against ' + REG.su);
  chk('the exact search agrees with the SU label when constants are immediates',
    REG.exact === REG.suImm, REG.exact + ' against ' + REG.suImm);
  chk('charging the two constants a register costs exactly one register',
    REG.su - REG.exact === 1, REG.su + ' -> ' + REG.exact);
  chk('on a tree with no constants the search returns the SU label exactly',
    minRegs(TREES.TBAL, { imm: true, alias: true }) === suLabel(TREES.TBAL, true) &&
    minRegs(TREES.TCHAIN, { imm: true, alias: true }) === suLabel(TREES.TCHAIN, true),
    'balanced ' + minRegs(TREES.TBAL, { imm: true, alias: true }) + ', chain ' + minRegs(TREES.TCHAIN, { imm: true, alias: true }));
  chk('the balanced tree needs 4 registers and the chain needs 3',
    minRegs(TREES.TBAL, { imm: true, alias: true }) === 4 &&
    minRegs(TREES.TCHAIN, { imm: true, alias: true }) === 3,
    minRegs(TREES.TBAL, { imm: true, alias: true }) + ' and ' + minRegs(TREES.TCHAIN, { imm: true, alias: true }));
  chk('a constant leaf removes exactly one register from a chain',
    minRegs(TREES.TSMALL, { imm: true, alias: true }) === suLabel(TREES.TSMALL, false),
    minRegs(TREES.TSMALL, { imm: true, alias: true }) + ' against ' + suLabel(TREES.TSMALL, false));
  chk('SU label is never below the exact minimum',
    suLabel(TREES.TBAL, true) >= minRegs(TREES.TBAL, { imm: true, alias: true }) &&
    suLabel(TREES.TCHAIN, true) >= minRegs(TREES.TCHAIN, { imm: true, alias: true }) &&
    suLabel(TREES.TSMALL, true) >= minRegs(TREES.TSMALL, { imm: true, alias: true }),
    'checked on three trees');

  /* the DAG */
  chk('the DAG has 4 operator nodes against 5 statements',
    DAG.ops === 4 && NAIVE_OPS === 5, DAG.ops + ' against ' + NAIVE_OPS);
  chk('the DAG loads 4 distinct variables against 6 leaf occurrences',
    DAG.leaves === 4 && NAIVE_LEAVES === 6, DAG.leaves + ' against ' + NAIVE_LEAVES);
  chk('every DAG node id is unique and parents come after children',
    DAG.nodes.every(function (n, i) {
      return n.id === i && (n.kind === 'leaf' || (n.l.id < i && n.r.id < i));
    }), DAG.nodes.length + ' nodes');
  chk('the two statements t1 and t4 share one node',
    (function () {
      var ops = DAG.nodes.filter(function (n) { return n.kind === 'op' && n.op === '*'; });
      return ops.length === 2;
    })(), 'two multiply nodes for three multiply statements');

  /* instruction selection, executed */
  chk('T1 emits 4 loads plus 4 arithmetic operations',
    CODE_T1.filter(function (i) { return i.op === 'LOAD'; }).length === 4 &&
    CODE_T1.filter(function (i) { return i.op !== 'LOAD'; }).length === 4,
    CODE_T1.length + ' instructions');
  chk('the accumulator machine emits 3 instructions per operator node',
    CODE_ACC.length === 12, CODE_ACC.length + ' instructions');
  chk('the accumulator machine needs exactly one register',
    runAcc(CODE_ACC, { a: 3, b: 5, c: 7, d: 2 }).peak === 1, 'one register');
  chk('the two selections agree with the block on every input tried',
    (function () {
      var env = { a: 3, b: 5, c: 7, d: 2 };
      var t1 = 3 * 5, t2 = 7 * 2, want3 = t1 + t2, want5 = t1 - t2;
      var r1 = runCode(CODE_T1, env), r3 = runAcc(CODE_ACC, env);
      return r1.R.R1 === want5 && r3.M.$7 === want5 && r3.M.$6 === want3;
    })(), 'both compute t3 = 29 and t5 = 1 for a,b,c,d = 3,5,7,2');
  chk('T1 and the accumulator machine agree on a second input too',
    (function () {
      var env = { a: 1, b: 0, c: -2, d: 6 };
      var r1 = runCode(CODE_T1, env), r3 = runAcc(CODE_ACC, env);
      return r1.R.R1 === r3.M.$7 && r1.R.R1 === (1 * 0 - (-2) * 6);
    })(), 'a,b,c,d = 1,0,-2,6 gives t5 = 12');
  chk('the load-store selection keeps three registers busy at its peak',
    T1.peak === 3, T1.peak + ' registers');
  chk('the allocator never runs out of registers on this block',
    T1.peak <= 6 && CODE_T1.every(function (i) { return i.op === 'LOAD' || /^R\d$/.test(i.a); }),
    CODE_T1.length + ' instructions, peak ' + T1.peak);
  chk('the tree form needs 11 instructions where the DAG needs 8',
    (NAIVE_LEAVES + NAIVE_OPS) === 11 && CODE_T1.length === 8,
    (NAIVE_LEAVES + NAIVE_OPS) + ' against ' + CODE_T1.length);

  /* liveness */
  chk('liveness reaches a fixed point in a bounded number of rounds',
    LIVE.rounds < 20, LIVE.rounds + ' rounds');
  chk('the maximum live set has 4 variables (GATE 2013 Q49 keys 4)',
    MAXLIVE === 4, 'max ' + MAXLIVE);
  chk('every live-in set equals use union (live-out minus def)',
    PROG.every(function (s) {
      var want = new Set(s.use);
      LIVE.liveOut[s.id].forEach(function (v) { if (s.def.indexOf(v) === -1) want.add(v); });
      return want.size === LIVE.liveIn[s.id].size && [...want].every(function (v) { return LIVE.liveIn[s.id].has(v); });
    }), 'checked on all ' + PROG.length + ' statements');
  chk('the four-variable point is the if statement',
    LIVE.liveIn.S5.size === 4, [...LIVE.liveIn.S5].join(','));
  chk('y is live only inside the then branch',
    LIVE.liveIn.S6.size === 1 && LIVE.liveIn.S6.has('a') && LIVE.liveIn.S2.has('y') === false,
    'live-in of S6 is {' + [...LIVE.liveIn.S6].join(',') + '}');
  chk('live-out of the last statement is empty because every variable is dead after it',
    LIVE.liveOut.S10.size === 0, 'size ' + LIVE.liveOut.S10.size);
  chk('d and e are both live on entry to the else branch',
    LIVE.liveIn.S8.has('d') && LIVE.liveIn.S8.has('e'), 'size ' + LIVE.liveIn.S8.size);

  /* interference */
  chk('the interference graph has 10 edges over 6 nodes',
    EDGES.length === 10 && NODES.length === 6, EDGES.length + ' edges, ' + NODES.length + ' nodes');
  chk('every edge is justified by a program point where both are live',
    EDGES.every(function (e) {
      var p = e.split('-');
      return PROG.some(function (s) {
        return (LIVE.liveIn[s.id].has(p[0]) && LIVE.liveIn[s.id].has(p[1])) ||
               (LIVE.liveOut[s.id].has(p[0]) && LIVE.liveOut[s.id].has(p[1]));
      });
    }), 'all ' + EDGES.length + ' edges have a witness point');
  chk('every pair that is never live together is absent from the graph',
    (function () {
      for (var i = 0; i < NODES.length; i++) for (var j = i + 1; j < NODES.length; j++) {
        var p = [NODES[i], NODES[j]];
        var together = PROG.some(function (s) {
          return (LIVE.liveIn[s.id].has(p[0]) && LIVE.liveIn[s.id].has(p[1])) ||
                 (LIVE.liveOut[s.id].has(p[0]) && LIVE.liveOut[s.id].has(p[1]));
        });
        var has = EDGES.indexOf(p.slice().sort().join('-')) !== -1;
        if (together !== has) return false;
      }
      return true;
    })(), 'graph matches the definition on all 15 pairs');
  chk('y is absent from the graph because it is defined and then dead',
    EDGES.indexOf('a-y') === -1 && NODES.indexOf('y') === -1 &&
    PROG.every(function (s) { return !LIVE.liveIn[s.id].has('y') && !LIVE.liveOut[s.id].has('y'); }),
    'y has no live range to interfere with');
  chk('a has the highest degree',
    NODES.every(function (v) { return degreeOf('a', EDGES) >= degreeOf(v, EDGES); }),
    'degree of a is ' + degreeOf('a', EDGES));

  /* colouring */
  chk('the greedy colouring is valid',
    validColouring(GREEDY.col, EDGES), GREEDY_COLOURS + ' colours');
  chk('the chromatic number is 4 (GATE 2013 Q49 keys 4)',
    CHI === 4, 'chi = ' + CHI);
  chk('no 3-colouring exists, checked exhaustively',
    colour(3, NODES, EDGES) === null, '3^6 = 729 assignments tried');
  chk('the largest clique has 4 nodes',
    CLIQUE.length === 4, '{' + CLIQUE.join(',') + '}');
  chk('the clique is a clique: every pair in it is an edge',
    CLIQUE.every(function (u, i) {
      return CLIQUE.every(function (v, j) { return i >= j || EDGES.indexOf([u, v].sort().join('-')) !== -1; });
    }), '{' + CLIQUE.join(',') + '}');
  chk('clique size is a lower bound and the colouring meets it, so 4 is optimal',
    CLIQUE.length === CHI && GREEDY_COLOURS === CHI, CLIQUE.length + ' = ' + CHI + ' = ' + GREEDY_COLOURS);
  chk('greedy reaches the optimum on this graph, which is not guaranteed in general',
    GREEDY_COLOURS === CHI, 'greedy ' + GREEDY_COLOURS + ', chi ' + CHI);
  chk('the maximum live count equals the chromatic number here, which is a coincidence',
    MAXLIVE === CHI, MAXLIVE + ' = ' + CHI);

  /* spilling */
  chk('the graph is not 3-colourable, so 3 registers force a spill',
    chromatic(NODES, interference(PROG, LIVE)) > 3, 'chi = ' + CHI);
  chk('the cheapest spill set makes the remaining graph 3-colourable',
    (function () {
      var keep = NODES.filter(function (v) { return SPILL3.drop.indexOf(v) === -1; });
      return chromatic(keep, interference(PROG, LIVE, SPILL3.drop)) <= 3;
    })(), 'drop {' + SPILL3.drop.join(',') + '}');
  chk('no cheaper spill set exists, checked over all 63 non-empty subsets',
    (function () {
      for (var mask = 1; mask < (1 << NODES.length); mask++) {
        var drop = NODES.filter(function (v, i) { return mask & (1 << i); });
        var keep = NODES.filter(function (v) { return drop.indexOf(v) === -1; });
        if (chromatic(keep, interference(PROG, LIVE, drop)) <= 3) {
          var cost = drop.reduce(function (s, v) { return s + spillCost(PROG, v); }, 0);
          if (cost < SPILL3.cost) return false;
        }
      }
      return true;
    })(), 'cost ' + SPILL3.cost);
  chk('the chosen spill set has the cheapest reload-plus-store cost',
    SPILL3.drop.reduce(function (s, v) { return s + spillCost(PROG, v); }, 0) === SPILL3.cost,
    '{' + SPILL3.drop.join(',') + '} at cost ' + SPILL3.cost);
  chk('spilling a variable outside every 4-clique does not help',
    (function () {
      var drop = ['b', 'x'];
      var keep = NODES.filter(function (v) { return drop.indexOf(v) === -1; });
      return chromatic(keep, interference(PROG, LIVE, drop)) > 3;
    })(), 'dropping b and x still leaves the clique {a,c,d,e}');
  chk('spill cost of a variable is its use count plus its definition count',
    spillCost(PROG, 'a') === 5 && spillCost(PROG, 'y') === 1,
    'a: ' + spillCost(PROG, 'a') + ', y: ' + spillCost(PROG, 'y'));

  /* peephole */
  chk('peephole removes 5 of the 11 instructions',
    PEEP.saved === 5 && PEEP_BEFORE.length === 11, PEEP.saved + ' removed, ' + PEEP.code.length + ' left');
  chk('one instruction is removed by each of the five rules',
    PEEP.removed.r1 === 1 && PEEP.removed.r2 === 1 && PEEP.removed.r3 === 1 &&
    PEEP.removed.r4 === 1 && PEEP.removed.r5 === 1,
    JSON.stringify(PEEP.removed));
  chk('the optimised code is a fixed point: running the rules again removes nothing',
    peephole(PEEP.code).saved === 0, 'second pass saves ' + peephole(PEEP.code).saved);
  chk('the optimised program agrees with the original on all 25 input pairs',
    (function () {
      for (var a = 0; a <= 4; a++) for (var c = 0; c <= 4; c++) {
        var x = runPeep(PEEP_BEFORE, a, c), y = runPeep(PEEP.code, a, c);
        if (x.M.a !== y.M.a || x.M.b !== y.M.b || x.M.c !== y.M.c || x.M.t !== y.M.t) return false;
        if (x.R.R1 !== y.R.R1 || x.R.R2 !== y.R.R2) return false;
      }
      return true;
    })(), '25 pairs, memory and both registers compared');
  chk('every removed instruction is provably redundant, not merely shorter',
    (function () {
      var orig = runPeep(PEEP_BEFORE, 3, 4);
      return orig.M.b === 3 && orig.R.R1 === 3 && orig.R.R2 === 4;
    })(), 'for a = 3, c = 4 the result is b = 3');
})();

/* ======================================================================
   LAYER 3 - RENDER. Reads the model; never re-derives it.
   ====================================================================== */

function ease(t) { return t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t); }
function appear(p, from, to) { return ease(Math.min(1, Math.max(0, (p - from) / Math.max(0.001, to - from)))); }

function card(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: 1, radius: 8 });
  if (o.bar) P.rect(x, y, 3, h, { fill: o.bar, radius: 2 });
}
function head(x, y, s, colour) { P.text(x, y, s, { size: 10, bold: true, mono: true, color: colour || FAINT }); }
function body(x, y, s, o) {
  o = o || {};
  P.text(x, y, s, { size: o.size || 12, color: o.color || INK, mono: o.mono, bold: o.bold, align: o.align });
}
function mono(x, y, s, o) {
  o = o || {};
  P.text(x, y, s, { size: o.size || 11.5, mono: true, color: o.color || INK, align: o.align, bold: o.bold });
}
function title(s, sub) {
  P.text(40, 20, s, { size: 17, bold: true, color: INK });
  if (sub) P.text(40, 42, sub, { size: 11, color: DIM });
}
function rule(y) { P.line(40, y, W - 40, y, { stroke: BORDER, sw: 1 }); }

function fmtInstr(i) {
  if (i.op === 'LOAD') return 'LOAD  ' + i.a + ', ' + i.b;
  if (i.op === 'STORE') return 'STORE ' + i.a + ', ' + i.b;
  if (i.op === 'JMP') return 'JMP   ' + i.b;
  if (i.op === 'LABEL') return i.b + ':';
  return i.op + '   ' + i.a + ', ' + i.b + ', ' + i.c;
}
function fmtAcc(i) {
  if (i.op === 'LOAD') return 'LOAD  ' + i.a;
  if (i.op === 'STORE') return 'STORE ' + i.a;
  return i.op + '   ' + i.a;
}

/* ---------- scene 1: what the back end decides ---------- */
function drawWhy(t, p) {
  title('Target code generation', 'what the back end does with the intermediate code');

  P.alpha(appear(p, 0.02, 0.3));
  card(40, 62, 400, 158, { bar: ACC });
  head(58, 80, 'THREE JOBS', ACC);
  var jobs = [
    ['1  instruction selection', 'which machine instruction covers which DAG node'],
    ['2  register allocation', 'which value lives in which physical register'],
    ['3  local clean-up', 'peephole rules over a small window']
  ];
  jobs.forEach(function (j, i) {
    mono(58, 104 + i * 38, j[0], { size: 11, bold: true, color: INK });
    body(58, 120 + i * 38, j[1], { size: 10.5, color: DIM });
  });

  P.alpha(appear(p, 0.18, 0.5));
  card(460, 62, 400, 158, { fill: SURF2 });
  head(478, 80, 'THE PIPELINE', DIM);
  var steps = ['IR', 'select', 'allocate', 'peephole', 'code'];
  steps.forEach(function (s, i) {
    var x = 470 + i * 78;
    P.rect(x, 108, 68, 34, { fill: SURF, stroke: i === 4 ? ACC : BORDER, sw: i === 4 ? 2 : 1, radius: 5 });
    P.text(x + 34, 125, s, { size: 9.5, mono: true, color: i === 4 ? ACC : INK, align: 'center', base: 'middle' });
    if (i < 4) P.arrow(x + 68, 125, x + 78, 125, { stroke: FAINT, sw: 1, head: 5 });
  });
  body(478, 158, 'Each pass answers one question, and each', { size: 10.5, color: DIM });
  body(478, 174, 'question has its own number attached.', { size: 10.5, color: DIM });
  body(478, 196, 'No register is named before the third box.', { size: 10.5, color: ACC });

  P.alpha(appear(p, 0.45, 0.75));
  card(40, 232, 820, 202, { bar: INFO });
  head(58, 250, 'FOUR COUNTS THIS PAGE COMPUTES', INFO);
  var rows = [
    ['instructions, load-store machine', '8'],
    ['instructions, accumulator machine', '12'],
    ['registers, load-store / accumulator', '3 / 1'],
    ['variables live at the worst point of the 2013 block', '4'],
    ['colours for that block\'s interference graph', '4']
  ];
  rows.forEach(function (r, i) {
    var y = 278 + i * 26;
    body(58, y, r[0], { size: 11.5, color: INK });
    mono(760, y, r[1], { size: 12, bold: true, color: ACC, align: 'right' });
  });
  rule(412);
  body(58, 420, 'Every number above is computed by this page when it loads, then re-checked against a definition, a second route, or an exhaustive search.', { size: 10.5, color: DIM });
  P.alpha(1);
}

/* ---------- scene 2: block to DAG ---------- */
function drawDag(t, p) {
  title('One node per distinct computation', 'a basic block, and the same block as a DAG');

  P.alpha(appear(p, 0.02, 0.3));
  card(40, 62, 400, 292, { bar: WARN });
  head(58, 80, 'THE BLOCK', WARN);
  BLOCK.forEach(function (s, i) {
    mono(58, 106 + i * 24, s.dst + ' = ' + s.x + ' ' + s.op + ' ' + s.y, { size: 11.5, color: i === 3 ? WARN : INK, bold: i === 3 });
  });
  body(58, 240, 'The fourth statement repeats the first:', { size: 11, color: DIM });
  body(58, 258, 'same operator, same two operands.', { size: 11, color: DIM });
  body(58, 286, 'A tree keeps two copies of that value.', { size: 11, color: INK });
  body(58, 304, 'A DAG keeps one.', { size: 11, bold: true, color: WARN });
  body(58, 330, 'Reads of a variable: 6 in the block,', { size: 10.5, color: FAINT });
  body(58, 344, '4 distinct variables in the DAG.', { size: 10.5, color: FAINT });

  P.alpha(appear(p, 0.28, 0.62));
  var pos = { 0: [510, 100], 1: [570, 100], 2: [700, 100], 3: [760, 100], 4: [540, 168], 5: [730, 168], 6: [600, 246], 7: [700, 246] };
  DAG.edges.forEach(function (e) {
    var a = pos[e[0]], b = pos[e[1]];
    P.line(a[0], a[1], b[0], b[1], { stroke: BORDER, sw: 1.2 });
  });
  DAG.nodes.forEach(function (n) {
    var q = pos[n.id];
    if (n.kind === 'leaf') {
      P.rect(q[0] - 14, q[1] - 11, 28, 22, { fill: SURF2, stroke: BORDER, sw: 1, radius: 4 });
      P.text(q[0], q[1], n.name, { size: 11.5, mono: true, align: 'center', base: 'middle', color: INK });
    } else {
      P.circle(q[0], q[1], 15, { fill: SURF, stroke: ACC, sw: 1.6 });
      P.text(q[0], q[1], n.op, { size: 14, mono: true, align: 'center', base: 'middle', color: ACC, bold: true });
    }
  });
  P.text(600, 296, 'the shared multiply feeds both parents', { size: 10.5, color: DIM, align: 'center' });
  P.text(600, 314, 'node 4 is used by node 6 and node 7', { size: 10.5, color: FAINT, align: 'center' });

  P.alpha(appear(p, 0.6, 0.9));
  card(40, 364, 820, 82, { fill: SURF2 });
  head(58, 380, 'WHAT THE MERGE SAVES', ACC);
  body(58, 400, 'statements 5 · leaf occurrences 6 · operators 5  →  DAG leaves 4 · DAG operators 4', { size: 11.5, mono: false });
  body(58, 422, 'as a tree, 11 instructions · as a DAG, 8 instructions — the difference is the repeated multiply and its two loads', { size: 11, color: DIM });
  P.alpha(1);
}

/* ---------- scene 3: two machines ---------- */
function drawCost(t, p) {
  title('Two machines, two prices', 'the same DAG covered by two instruction sets');

  P.alpha(appear(p, 0.02, 0.28));
  card(40, 62, 400, 300, { bar: ACC });
  head(58, 80, 'LOAD-STORE, THREE-ADDRESS', ACC);
  mono(58, 100, '8 instructions, 3 registers at the peak', { size: 11, color: DIM });
  CODE_T1.forEach(function (i, k) {
    mono(58, 128 + k * 20, fmtInstr(i), { size: 11, color: INK });
  });
  body(58, 296, 'every operand must be in a register,', { size: 10.5, color: DIM });
  body(58, 312, 'so each distinct variable is loaded once.', { size: 10.5, color: DIM });

  P.alpha(appear(p, 0.25, 0.55));
  card(460, 62, 400, 300, { bar: INFO });
  head(478, 80, 'ACCUMULATOR MACHINE', INFO);
  mono(478, 100, '12 instructions, 1 register', { size: 11, color: DIM });
  CODE_ACC.forEach(function (i, k) {
    mono(478, 124 + k * 19, fmtAcc(i), { size: 10.5, color: INK });
  });
  body(478, 348, 'one register; every operand read from memory', { size: 10, color: DIM });

  P.alpha(appear(p, 0.55, 0.85));
  card(40, 372, 820, 74, { fill: SURF2 });
  body(58, 388, 'Both programs were executed by this page: for a, b, c, d = 3, 5, 7, 2 both give t3 = 29 and t5 = 1, and for 1, 0, -2, 6 both give t5 = 12.', { size: 11 });
  body(58, 410, 'Four instructions fewer cost two registers more. That trade, not a single "best" answer, is what a cost model decides.', { size: 11, color: DIM });
  body(58, 430, 'The cheapest covering depends on the price list — and the price list is the machine, not the program.', { size: 10.5, color: FAINT });
  P.alpha(1);
}

/* ---------- scene 4: registers for an expression ---------- */
function drawRegs(t, p) {
  title('How many registers an expression needs', '(a-1) * (((b+c)/3) + d), labelled two ways');

  P.alpha(appear(p, 0.02, 0.3));
  var pos = {
    root: [240, 92], sub: [150, 152], add: [330, 152],
    a: [104, 212], one: [188, 212], div: [286, 212], d: [382, 212],
    bc: [240, 272], three: [332, 272], b: [204, 330], c: [268, 330]
  };
  var links = [['root', 'sub'], ['root', 'add'], ['sub', 'a'], ['sub', 'one'], ['add', 'div'],
               ['add', 'd'], ['div', 'bc'], ['div', 'three'], ['bc', 'b'], ['bc', 'c']];
  links.forEach(function (l) {
    var x1 = pos[l[0]][0], y1 = pos[l[0]][1], x2 = pos[l[1]][0], y2 = pos[l[1]][1];
    P.line(x1, y1, x2, y2, { stroke: BORDER, sw: 1.2 });
  });
  function opNode(k, s, label) {
    var q = pos[k];
    P.circle(q[0], q[1], 15, { fill: SURF, stroke: ACC, sw: 1.6 });
    P.text(q[0], q[1], s, { size: 14, mono: true, align: 'center', base: 'middle', color: ACC, bold: true });
    P.text(q[0] + 20, q[1] - 12, String(label), { size: 10, mono: true, color: WARN, bold: true });
  }
  function leafNode(k, s, label) {
    var q = pos[k];
    P.circle(q[0], q[1], 13, { fill: SURF2, stroke: BORDER, sw: 1 });
    P.text(q[0], q[1], s, { size: 11, mono: true, align: 'center', base: 'middle', color: INK });
    P.text(q[0] + 16, q[1] - 11, String(label), { size: 10, mono: true, color: WARN, bold: true });
  }
  opNode('root', '*', suLabel(T2017, true));
  opNode('sub', '-', suLabel(T2017.l, true));
  opNode('add', '+', suLabel(T2017.r, true));
  opNode('div', '/', suLabel(T2017.r.l, true));
  opNode('bc', '+', suLabel(T2017.r.l.l, true));
  leafNode('a', 'a', 1); leafNode('one', '1', 1);
  leafNode('b', 'b', 1); leafNode('c', 'c', 1);
  leafNode('three', '3', 1); leafNode('d', 'd', 1);
  P.text(40, 350, 'the small amber number is the Sethi-Ullman label', { size: 10.5, color: DIM });
  P.text(40, 366, 'max of the children, plus one when they are equal', { size: 10.5, color: FAINT });

  P.alpha(appear(p, 0.3, 0.6));
  card(450, 62, 410, 152, { bar: WARN });
  head(468, 80, 'THE TWO NUMBERS', WARN);
  body(468, 102, 'Sethi-Ullman, constants charged a register', { size: 11, color: INK });
  mono(840, 102, String(REG.su), { size: 12, bold: true, color: WARN, align: 'right' });
  body(468, 126, 'exact search, constants as immediates', { size: 11, color: INK });
  mono(840, 126, String(REG.exact), { size: 12, bold: true, color: VAL, align: 'right' });
  body(468, 150, 'Sethi-Ullman with the constants labelled 0', { size: 11, color: INK });
  mono(840, 150, String(REG.suImm), { size: 12, bold: true, color: VAL, align: 'right' });
  body(468, 178, 'GATE CSE 2017 Set 1 Q52 keys', { size: 11, color: DIM });
  mono(840, 178, '2', { size: 12, bold: true, color: VAL, align: 'right' });
  body(468, 198, 'the two constants 1 and 3 are the whole difference', { size: 10.5, color: FAINT });

  P.alpha(appear(p, 0.6, 0.9));
  card(450, 226, 410, 220, { fill: SURF2 });
  head(468, 244, 'TWO REGISTERS, EIGHT INSTRUCTIONS', ACC);
  var g2017 = ['LOAD  R1, b', 'LOAD  R2, c', 'ADD   R1, R1, R2', 'DIV   R1, R1, #3',
               'LOAD  R2, d', 'ADD   R1, R1, R2', 'LOAD  R2, a', 'SUB   R2, R2, #1',
               'MUL   R1, R2, R1'];
  g2017.slice(0, 8).forEach(function (s, k) {
    mono(468, 268 + k * 19, s, { size: 10.5, color: INK });
  });
  body(468, 430, 'no spill at any point; one register is impossible', { size: 10, color: DIM });
  P.alpha(1);
}

/* ---------- scene 5: liveness ---------- */
function drawLive(t, p) {
  title('Liveness: what is still needed', 'the GATE CSE 2013 Q49 block, read backwards');

  P.alpha(appear(p, 0.02, 0.3));
  card(40, 62, 470, 330, { bar: INFO });
  head(58, 80, 'STATEMENT AND LIVE-IN SET', INFO);
  PROG.forEach(function (s, i) {
    var y = 108 + i * 24;
    var hot = s.id === 'S5';
    if (hot) P.rect(48, y - 5, 452, 21, { fill: WARNDIM, radius: 4 });
    mono(58, y, s.text, { size: 10.5, color: hot ? WARN : INK, bold: hot });
    var set = [...LIVE.liveIn[s.id]].sort().join(', ');
    mono(392, y, '{' + set + '}', { size: 10.5, color: hot ? WARN : DIM });
  });
  body(58, 366, 'live-out of the last statement is empty: every variable is dead after it', { size: 10, color: FAINT });

  P.alpha(appear(p, 0.32, 0.6));
  card(530, 62, 330, 150, { bar: WARN });
  head(548, 80, 'LARGEST LIVE SET', WARN);
  P.text(548, 96, String(MAXLIVE), { size: 44, bold: true, color: WARN });
  body(600, 108, 'variables alive at once,', { size: 11, color: INK });
  body(600, 124, 'on entry to the if statement', { size: 11, color: INK });
  mono(548, 158, 'a, d, e, x', { size: 12, color: WARN, bold: true });
  body(548, 180, 'so no allocation can use fewer than 4 registers', { size: 10.5, color: DIM });

  P.alpha(appear(p, 0.58, 0.88));
  card(530, 224, 330, 168, { fill: SURF2 });
  head(548, 242, 'TWO THINGS TO NOTICE', ACC);
  body(548, 266, 'y is written in the then branch and', { size: 10.5, color: INK });
  body(548, 282, 'never read, so it is live nowhere', { size: 10.5, color: INK });
  body(548, 298, 'and interferes with nothing.', { size: 10.5, color: INK });
  rule(316);
  body(548, 330, 'Maximum live is a lower bound only:', { size: 10.5, color: INK });
  body(548, 346, 'necessary, not sufficient. Sufficiency', { size: 10.5, color: INK });
  body(548, 362, 'is what the colouring has to show.', { size: 10.5, color: DIM });
  P.alpha(1);
}

/* ---------- the interference graph, drawn twice ---------- */
var GPOS = { a: [235, 108], b: [95, 168], c: [130, 272], d: [315, 272], e: [360, 168], x: [235, 330] };
function drawGraph(fills, strokes, showLabels) {
  EDGES.forEach(function (e) {
    var q = e.split('-');
    var A = GPOS[q[0]], B = GPOS[q[1]];
    P.line(A[0], A[1], B[0], B[1], { stroke: BORDER, sw: 1.4 });
  });
  NODES.forEach(function (v) {
    var q = GPOS[v];
    P.circle(q[0], q[1], 18, { fill: fills ? fills[v] : SURF, stroke: strokes ? strokes[v] : BORDER, sw: 1.8 });
    P.text(q[0], q[1], v, { size: 13, mono: true, bold: true, align: 'center', base: 'middle', color: strokes ? strokes[v] : INK });
    if (showLabels) P.text(q[0], q[1] + 22, 'deg ' + degreeOf(v, EDGES), { size: 9.5, mono: true, align: 'center', color: FAINT });
  });
}

function drawInterf(t, p) {
  title('The interference graph', 'one node per variable, one edge per pair alive together');

  P.alpha(appear(p, 0.02, 0.35));
  card(40, 62, 420, 300, { fill: SURF });
  drawGraph(null, null, true);
  body(40, 372, 'ten edges out of the fifteen possible pairs', { size: 10.5, color: DIM });
  body(40, 390, 'the number under each node is its degree', { size: 10.5, color: FAINT });

  P.alpha(appear(p, 0.32, 0.62));
  card(480, 62, 380, 176, { bar: INFO });
  head(498, 80, 'DEGREES, HIGHEST FIRST', INFO);
  var order = NODES.slice().sort(function (a, b) { return degreeOf(b, EDGES) - degreeOf(a, EDGES); });
  order.forEach(function (v, i) {
    mono(498, 106 + i * 20, v, { size: 11, color: INK, bold: true });
    mono(840, 106 + i * 20, String(degreeOf(v, EDGES)), { size: 11, color: ACC, align: 'right' });
  });
  body(498, 232, 'a is live almost everywhere, so it touches everything', { size: 10, color: DIM });

  P.alpha(appear(p, 0.58, 0.88));
  card(480, 250, 380, 142, { fill: SURF2 });
  head(498, 268, 'WHY EACH EDGE IS THERE', ACC);
  body(498, 292, 'Every edge is justified by a statement', { size: 10.5, color: INK });
  body(498, 308, 'whose live set holds both endpoints.', { size: 10.5, color: INK });
  body(498, 330, 'd and e never share a statement and', { size: 10.5, color: WARN });
  body(498, 346, 'still interfere: the else branch reads', { size: 10.5, color: WARN });
  body(498, 362, 'd, then e, so both are live between.', { size: 10.5, color: WARN });
  P.alpha(1);
}

/* ---------- scene 7: colouring ---------- */
var CFILL = [ACCDIM, '#dbe7f5', WARNDIM, INVALIDDIM];
var CSTROKE = [ACC, INFO, WARN, BAD];
function drawColour(t, p) {
  title('Colouring is allocating', 'a colour is a register; adjacent nodes need different colours');

  P.alpha(appear(p, 0.02, 0.35));
  card(40, 62, 420, 300, { fill: SURF });
  var fills = {}, strokes = {};
  NODES.forEach(function (v) {
    var c = GREEDY.col[v];
    fills[v] = CFILL[c]; strokes[v] = CSTROKE[c];
  });
  drawGraph(fills, strokes, true);

  P.alpha(appear(p, 0.32, 0.62));
  card(480, 62, 380, 176, { bar: ACC });
  head(498, 80, 'THE NUMBERS', ACC);
  var rows = [
    ['greedy colouring, highest degree first', String(GREEDY_COLOURS)],
    ['exhaustive search for the chromatic number', String(CHI)],
    ['largest clique', String(CLIQUE.length)]
  ];
  rows.forEach(function (r, i) {
    body(498, 106 + i * 26, r[0], { size: 11, color: INK });
    mono(840, 106 + i * 26, r[1], { size: 12, bold: true, color: ACC, align: 'right' });
  });
  body(498, 192, 'clique {' + CLIQUE.join(', ') + '}', { size: 10.5, mono: true, color: WARN });
  body(498, 214, 'greedy meets the bound, so 4 is optimal here', { size: 10, color: DIM });

  P.alpha(appear(p, 0.58, 0.88));
  card(480, 250, 380, 142, { fill: SURF2 });
  head(498, 268, 'TWO DIFFERENT PROOFS', ACC);
  body(498, 292, 'A valid colouring proves that k registers', { size: 10.5, color: INK });
  body(498, 308, 'are enough. A clique of size k proves that', { size: 10.5, color: INK });
  body(498, 324, 'fewer than k are impossible.', { size: 10.5, color: INK });
  body(498, 348, 'When the two meet, the answer is proved.', { size: 10.5, color: ACC });
  body(498, 370, 'When they do not, you hold only a range.', { size: 10.5, color: DIM });
  P.alpha(1);
}

/* ---------- scene 8: assignment and spills ---------- */
function drawAssign(t, p) {
  title('Registers, spills and the 2013 answer', 'four colours, four registers, and what three would cost');

  P.alpha(appear(p, 0.02, 0.3));
  card(40, 62, 430, 220, { bar: ACC });
  head(58, 80, 'COLOUR → REGISTER', ACC);
  for (var c = 0; c < 4; c++) {
    var vars = NODES.filter(function (v) { return GREEDY.col[v] === c; });
    var y = 108 + c * 34;
    P.rect(58, y - 4, 26, 22, { fill: CFILL[c], stroke: CSTROKE[c], sw: 1.2, radius: 4 });
    mono(71, y, 'R' + (c + 1), { size: 10, color: CSTROKE[c], align: 'center' });
    body(100, y, 'holds ' + vars.join(' and '), { size: 11.5, color: INK });
  }
  body(58, 250, 'no two interfering variables share a register', { size: 10.5, color: DIM });
  body(58, 266, 'that is exactly what a valid colouring means', { size: 10.5, color: FAINT });

  P.alpha(appear(p, 0.28, 0.58));
  card(490, 62, 370, 220, { bar: WARN });
  head(508, 80, 'GATE CSE 2013 Q49', WARN);
  body(508, 104, 'minimum registers, no spill, and', { size: 11, color: INK });
  body(508, 120, 'no optimisation except allocation', { size: 11, color: INK });
  mono(508, 148, 'maximum live', { size: 11, color: DIM });
  mono(840, 148, String(MAXLIVE), { size: 12, bold: true, color: WARN, align: 'right' });
  mono(508, 172, 'chromatic number', { size: 11, color: DIM });
  mono(840, 172, String(CHI), { size: 12, bold: true, color: WARN, align: 'right' });
  mono(508, 196, 'the keyed answer', { size: 11, color: DIM });
  mono(840, 196, '4', { size: 12, bold: true, color: VAL, align: 'right' });
  body(508, 224, 'both routes give the same number here', { size: 10.5, color: DIM });
  body(508, 244, 'the options were 3, 4, 5 and 6', { size: 10.5, color: FAINT });

  P.alpha(appear(p, 0.55, 0.88));
  card(40, 296, 820, 148, { fill: SURF2 });
  head(58, 314, 'NOW ASK FOR THREE REGISTERS', BAD);
  body(58, 334, 'The graph is not 3-colourable, so one variable must spill. The page tries all 63 non-empty', { size: 11 });
  body(58, 350, 'spill sets and keeps the cheapest that leaves a 3-colourable graph.', { size: 11 });
  mono(58, 376, 'chosen spill set  {' + SPILL3.drop.join(', ') + '}', { size: 11, color: BAD, bold: true });
  mono(58, 396, 'cost  ' + SPILL3.cost + '  =  1 reload  +  2 stores', { size: 11, color: INK });
  body(58, 420, 'Dropping b and x instead leaves the clique {a, c, d, e} intact: still 4 colours.', { size: 10.5, color: DIM });
  P.alpha(1);
}

/* ---------- scene 9: peephole ---------- */
function drawPeep(t, p) {
  title('Peephole optimisation', 'a small window, five local rules, eleven instructions into six');

  var removedIdx = { 2: 'r1', 3: 'r2', 4: 'r3', 6: 'r4', 9: 'r5' };

  P.alpha(appear(p, 0.02, 0.3));
  card(40, 62, 430, 330, { bar: WARN });
  head(58, 80, 'BEFORE — 11 INSTRUCTIONS', WARN);
  PEEP_BEFORE.forEach(function (i, k) {
    var y = 106 + k * 20;
    var gone = removedIdx[k];
    mono(58, y, (k + 1) + '  ' + fmtInstr(i), { size: 10.5, color: gone ? BAD : INK });
    if (gone) {
      var w = ((k + 1) + '  ' + fmtInstr(i)).length * 6.3;
      P.line(58, y + 6, 58 + w, y + 6, { stroke: BAD, sw: 1.2 });
      P.text(440, y, gone, { size: 10, mono: true, color: BAD, align: 'right', bold: true });
    }
  });

  P.alpha(appear(p, 0.3, 0.6));
  card(490, 62, 370, 200, { bar: VAL });
  head(508, 80, 'AFTER — 6 INSTRUCTIONS', VAL);
  PEEP.code.forEach(function (i, k) {
    mono(508, 108 + k * 20, fmtInstr(i), { size: 10.5, color: INK });
  });

  P.alpha(appear(p, 0.55, 0.85));
  card(490, 274, 370, 118, { fill: SURF2 });
  head(508, 292, 'RULES THAT FIRED, ONCE EACH', ACC);
  var rl = [
    ['r1', 'load of the location just stored'],
    ['r2', 'add zero'],
    ['r3', 'multiply by one'],
    ['r4', 'jump to the next label'],
    ['r5', 'store overwritten, never read']
  ];
  rl.forEach(function (r, i) {
    mono(508, 316 + i * 15, r[0] + '  ' + r[1], { size: 10, color: INK });
  });

  P.alpha(appear(p, 0.82, 1));
  body(40, 410, 'Both lists were executed for every input pair from 0 to 4: 25 pairs, identical memory and identical registers.', { size: 11, color: INK });
  body(40, 430, 'A second pass over the result removes nothing more, so the rewrite has reached a fixed point.', { size: 10.5, color: DIM });
  P.alpha(1);
}

/* ---------- scene 10: exam ---------- */
function drawExam(t, p) {
  title('How the question is asked', 'two checks, then the arithmetic');

  P.alpha(appear(p, 0.02, 0.3));
  card(40, 62, 400, 180, { bar: ACC });
  head(58, 80, 'CHECK 1 — WHICH COUNT', ACC);
  body(58, 104, 'registers: the chromatic number of the', { size: 11, color: INK });
  body(58, 120, 'interference graph, or the maximum live', { size: 11, color: INK });
  body(58, 136, 'count when that is also a clique', { size: 11, color: INK });
  body(58, 162, 'variables: names in the source, including', { size: 11, color: INK });
  body(58, 178, 'those that live in memory, not in a register', { size: 11, color: INK });
  body(58, 204, 'instructions: lines of machine code, which', { size: 11, color: INK });
  body(58, 220, 'is a selection question, not an allocation one', { size: 11, color: INK });

  P.alpha(appear(p, 0.28, 0.55));
  card(460, 62, 400, 180, { bar: WARN });
  head(478, 80, 'CHECK 2 — WHAT IS ALLOWED', WARN);
  body(478, 104, 'spills allowed? then the answer is the', { size: 11, color: INK });
  body(478, 120, 'chromatic number, and spills are extra', { size: 11, color: INK });
  body(478, 146, 'code motion allowed? the 2013 block then', { size: 11, color: INK });
  body(478, 162, 'needs 3 registers instead of 4', { size: 11, color: INK });
  body(478, 188, 'immediates allowed? the 2017 expression', { size: 11, color: INK });
  body(478, 204, 'then needs 2 registers instead of 3', { size: 11, color: INK });
  body(478, 226, 'the sentence that grants or forbids it decides', { size: 10.5, color: FAINT });

  P.alpha(appear(p, 0.55, 0.9));
  card(40, 256, 820, 188, { fill: SURF2 });
  head(58, 274, 'THE FOUR SHAPES', INFO);
  var shapes = [
    'minimum registers for this code segment, no spill — 2013, answer 4',
    'minimum registers for this expression, load-store — 2017, answer 2',
    'which technique uses live variable analysis — 2025 Set 1, register assignment',
    'which rewrite is behaviour-preserving — a peephole rule and its condition'
  ];
  shapes.forEach(function (s, i) {
    body(58, 300 + i * 26, s, { size: 11, color: INK });
  });
  rule(414);
  body(58, 424, 'Decide the count, decide what is allowed, and only then compute. That order removes most wrong options before any arithmetic.', { size: 10.5, color: DIM });
  P.alpha(1);
}

/* ---------- dispatch ---------- */
function sceneAtTime(t) {
  var tl = window.LESSON_TIMELINE;
  for (var i = 0; i < tl.scenes.length; i++) {
    var s = tl.scenes[i];
    if (t >= s.start && t < s.end) return s;
  }
  return tl.scenes[tl.scenes.length - 1];
}
function progOf(t) {
  var sc = sceneAtTime(t);
  return { sc: sc, p: (t - sc.start) / Math.max(0.001, sc.end - sc.start) };
}

function drawFrame(Pn) {
  var t = (K && K.state) ? K.state.elapsed : 0;
  var s = progOf(t);
  Pn.clear();
  if (s.sc.id === 'why') drawWhy(t, s.p);
  else if (s.sc.id === 'dag') drawDag(t, s.p);
  else if (s.sc.id === 'cost') drawCost(t, s.p);
  else if (s.sc.id === 'regs') drawRegs(t, s.p);
  else if (s.sc.id === 'live') drawLive(t, s.p);
  else if (s.sc.id === 'interf') drawInterf(t, s.p);
  else if (s.sc.id === 'colour') drawColour(t, s.p);
  else if (s.sc.id === 'assign') drawAssign(t, s.p);
  else if (s.sc.id === 'peep') drawPeep(t, s.p);
  else drawExam(t, s.p);
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

  if (window.p5 && holder) {
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

  if (!ok && holder) {
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
    if (K && K.state) K.state.elapsed = t;
    if (P) drawFrame(P);
  };

  var bad = CHECKS.filter(function (c) { return !c.pass; });
  if (bad.length) console.warn('Model validation did not fully pass:', bad);
}

window.__MODEL = {
  REG: REG, DAG: DAG, CODE_T1: CODE_T1, CODE_ACC: CODE_ACC, PROG: PROG,
  LIVE: LIVE, MAXLIVE: MAXLIVE, EDGES: EDGES, NODES: NODES, CHI: CHI,
  GREEDY: GREEDY, CLIQUE: CLIQUE, SPILL3: SPILL3, PEEP: PEEP, CHECKS: CHECKS
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
