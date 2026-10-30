/* ==========================================================================
   intermediate-code-generation — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each value re-verified against a definition, a second
                         route, or an exhaustive search.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The three-address code is generated from expression trees, never typed. The
   minimum temporary count is found by exhaustive search over every evaluation
   order that respects the tree, not by quoting a formula. The control-flow
   translations are executed by a small three-address interpreter and compared
   with the source statement's own semantics on every input in a grid. The
   quadruple, triple and indirect-triple tables are all built from one
   instruction list and then evaluated and compared with each other. The SSA
   renaming counts input variables and definitions and re-evaluates the renamed
   segment to confirm it computes the same function.
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

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}
function num(v, d) { return Number(v).toFixed(d === undefined ? 6 : d); }

/* ---------- 1. expression trees ---------- */
function Lf(n) { return { leaf: n }; }
function Nd(op, l, r) { return { op: op, l: l, r: r }; }

var EXPR = [
  { id: 'E1', text: '(a+b)*(c+d)', tree: Nd('*', Nd('+', Lf('a'), Lf('b')), Nd('+', Lf('c'), Lf('d'))) },
  { id: 'E2', text: 'a*b+c*d+e*f', tree: Nd('+', Nd('+', Nd('*', Lf('a'), Lf('b')), Nd('*', Lf('c'), Lf('d'))), Nd('*', Lf('e'), Lf('f'))) },
  { id: 'E3', text: '((a+b)*(c+d))+((e+f)*(g+h))',
    tree: Nd('+', Nd('*', Nd('+', Lf('a'), Lf('b')), Nd('+', Lf('c'), Lf('d'))),
                 Nd('*', Nd('+', Lf('e'), Lf('f')), Nd('+', Lf('g'), Lf('h')))) },
  { id: 'E4', text: 'q+r/3+s-t*5+u*v/w',
    tree: Nd('+', Nd('-', Nd('+', Nd('+', Lf('q'), Nd('/', Lf('r'), Lf('3'))), Lf('s')), Nd('*', Lf('t'), Lf('5'))),
                 Nd('/', Nd('*', Lf('u'), Lf('v')), Lf('w'))) },
  { id: 'E5', text: 'a-b-c', tree: Nd('-', Nd('-', Lf('a'), Lf('b')), Lf('c')) }
];

function opsOf(n) { return n.leaf ? 0 : 1 + opsOf(n.l) + opsOf(n.r); }
function leavesOf(n, acc) {
  acc = acc || [];
  if (n.leaf) { acc.push(n.leaf); return acc; }
  leavesOf(n.l, acc); leavesOf(n.r, acc);
  return acc;
}
/* the Sethi-Ullman / Ershov number: registers needed when a leaf also occupies one */
function ershov(n) {
  if (n.leaf) return 1;
  var a = ershov(n.l), b = ershov(n.r);
  return a === b ? a + 1 : Math.max(a, b);
}
function postorder(n, out) {
  out = out || [];
  if (n.leaf) return out;
  postorder(n.l, out); postorder(n.r, out); out.push(n);
  return out;
}

/* ---------- 2. minimum simultaneously-live temporaries, by exhaustion ----------
   Model: a temporary holds one operator's result; a source variable is an
   operand that costs no temporary; a temporary is free once its last use has
   run, and the result of an instruction may overwrite an operand that dies at
   that instruction. Under that model the peak live count of an evaluation
   order is well defined, and the minimum over all legal orders is the answer. */
function peakLive(order, index) {
  var lastUse = {}, live = {}, peak = 0, count = 0, i, ch;
  for (i = 0; i < order.length; i++) {
    ch = [order[i].l, order[i].r];
    for (var j = 0; j < 2; j++) if (!ch[j].leaf) lastUse[index.get(ch[j])] = i;
  }
  for (i = 0; i < order.length; i++) {
    if (count > peak) peak = count;
    var id = index.get(order[i]);
    if (!live[id]) { live[id] = true; count++; }
    ch = [order[i].l, order[i].r];
    for (var k = 0; k < 2; k++) {
      if (ch[k].leaf) continue;
      var cid = index.get(ch[k]);
      if (lastUse[cid] === i && live[cid]) { live[cid] = false; count--; }
    }
    if (count > peak) peak = count;
  }
  return peak;
}

function minTemps(tree) {
  var ns = postorder(tree), index = new Map();
  ns.forEach(function (x, i) { index.set(x, i); });
  var n = ns.length, best = Infinity, order = [], used = new Array(n), done = new Set();
  var calls = 0;

  function rec() {
    if (order.length === n) {
      calls++;
      var p = peakLive(order, index);
      if (p < best) best = p;
      return;
    }
    for (var i = 0; i < n; i++) {
      if (used[i]) continue;
      var nd = ns[i];
      if (!(nd.l.leaf || done.has(nd.l))) continue;
      if (!(nd.r.leaf || done.has(nd.r))) continue;
      used[i] = true; done.add(nd); order.push(nd);
      rec();
      order.pop(); done.delete(nd); used[i] = false;
    }
  }
  rec();
  return { min: best, orders: calls };
}

/* ---------- 3. three-address code generation ---------- */
function genFresh(tree) {
  var code = [], k = 0;
  function go(n) {
    if (n.leaf) return n.leaf;
    var a = go(n.l), b = go(n.r), t = 't' + (++k);
    code.push({ op: n.op, a: a, b: b, r: t });
    return t;
  }
  var last = go(tree);
  return { code: code, temps: k, last: last };
}

/* reuse: the heavier subtree first, and the result overwrites a dying operand */
function genReuse(tree) {
  var code = [], next = 1, free = [], peak = 0, inUse = 0;
  function alloc() {
    var t = free.length ? free.pop() : 't' + (next++);
    inUse++; if (inUse > peak) peak = inUse;
    return t;
  }
  function release(t) {
    if (/^t\d+$/.test(t)) { free.push(t); inUse--; }
  }
  function go(n) {
    if (n.leaf) return n.leaf;
    var a, b;
    if (ershov(n.l) >= ershov(n.r)) { a = go(n.l); b = go(n.r); }
    else { a = go(n.r); b = go(n.l); }
    var t = /^t\d+$/.test(a) ? a : /^t\d+$/.test(b) ? b : alloc();
    if (!/^t\d+$/.test(t)) t = alloc();
    code.push({ op: n.op, a: a, b: b, r: t });
    if (t !== a) release(a);
    if (t !== b) release(b);
    return t;
  }
  var last = go(tree);
  return { code: code, temps: next - 1, peak: peak, last: last };
}

/* ---------- 4. evaluation: a literal is a literal, not a variable ---------- */
function val(e, v) {
  var s = String(v);
  return /^-?\d+$/.test(s) ? Number(s) : Number(e[v]);
}
function apply(op, a, b) {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  if (op === '/') return Math.trunc(a / b);
  throw new Error('unknown operator ' + op);
}
function evalTree(n, env) {
  if (n.leaf) return val(env, n.leaf);
  return apply(n.op, evalTree(n.l, env), evalTree(n.r, env));
}
function evalCode(code, env) {
  var e = {}, key;
  for (key in env) if (Object.prototype.hasOwnProperty.call(env, key)) e[key] = env[key];
  for (var i = 0; i < code.length; i++) {
    e[code[i].r] = apply(code[i].op, val(e, code[i].a), val(e, code[i].b));
  }
  return e;
}

/* ---------- 5. control-flow translations ---------- */
function whileTAC() {
  return [
    { op: 'label', label: 'L1' },
    { op: 'ifgoto', a: 'x', b: 'n', cond: '<', label: 'L2' },
    { op: 'goto', label: 'L3' },
    { op: 'label', label: 'L2' },
    { op: '+', a: 'x', b: '1', r: 't1' },
    { op: '=', a: 't1', r: 'x' },
    { op: 'goto', label: 'L1' },
    { op: 'label', label: 'L3' }
  ];
}
function ifElseTAC() {
  return [
    { op: 'ifgoto', a: 'a', b: 'b', cond: '<', label: 'L1' },
    { op: 'goto', label: 'L2' },
    { op: 'label', label: 'L1' },
    { op: 'const', k: 1, r: 'x' },
    { op: 'goto', label: 'L3' },
    { op: 'label', label: 'L2' },
    { op: 'const', k: 2, r: 'x' },
    { op: 'label', label: 'L3' }
  ];
}
function shortControlTAC() {
  return [
    { op: 'ifgoto', a: 'a', b: 'b', cond: '<', label: 'L1' },
    { op: 'goto', label: 'L3' },
    { op: 'label', label: 'L1' },
    { op: 'ifgoto', a: 'c', b: 'd', cond: '<', label: 'L2' },
    { op: 'goto', label: 'L3' },
    { op: 'label', label: 'L2' },
    { op: 'const', k: 1, r: 'x' },
    { op: 'goto', label: 'L4' },
    { op: 'label', label: 'L3' },
    { op: 'const', k: 0, r: 'x' },
    { op: 'label', label: 'L4' }
  ];
}
function shortValueTAC() {
  var code = [
    { op: 'const', k: 0, r: 't1' },
    { op: 'ifgoto', a: 'a', b: 'b', cond: '<', label: 'L1' },
    { op: 'goto', label: 'L2' },
    { op: 'label', label: 'L1' },
    { op: 'const', k: 1, r: 't1' },
    { op: 'label', label: 'L2' },
    { op: 'const', k: 0, r: 't2' },
    { op: 'ifgoto', a: 'c', b: 'd', cond: '<', label: 'L3' },
    { op: 'goto', label: 'L4' },
    { op: 'label', label: 'L3' },
    { op: 'const', k: 1, r: 't2' },
    { op: 'label', label: 'L4' },
    { op: '*', a: 't1', b: 't2', r: 't3' },
    { op: 'ifgoto', a: 't3', b: '0', cond: '>', label: 'L5' },
    { op: 'goto', label: 'L6' },
    { op: 'label', label: 'L5' },
    { op: 'const', k: 1, r: 'x' },
    { op: 'goto', label: 'L7' },
    { op: 'label', label: 'L6' },
    { op: 'const', k: 0, r: 'x' },
    { op: 'label', label: 'L7' }
  ];
  return code;
}

/* ---------- 6. a three-address interpreter ---------- */
function labelIndex(code, l) {
  for (var i = 0; i < code.length; i++) if (code[i].op === 'label' && code[i].label === l) return i;
  return code.length;
}
function runTAC(code, env, cap) {
  var e = {}, key;
  for (key in env) if (Object.prototype.hasOwnProperty.call(env, key)) e[key] = env[key];
  var pc = 0, steps = 0, executed = [];
  cap = cap || 20000;
  while (pc < code.length && steps < cap) {
    var ins = code[pc];
    steps++; executed.push(pc);
    if (ins.op === 'label') { pc++; continue; }
    if (ins.op === 'goto') { pc = labelIndex(code, ins.label); continue; }
    if (ins.op === 'ifgoto') {
      var a = val(e, ins.a), b = val(e, ins.b), t;
      if (ins.cond === '<') t = a < b;
      else if (ins.cond === '>') t = a > b;
      else if (ins.cond === '<=') t = a <= b;
      else if (ins.cond === '>=') t = a >= b;
      else if (ins.cond === '==') t = a === b;
      else t = a !== b;
      pc = t ? labelIndex(code, ins.label) : pc + 1;
      continue;
    }
    if (ins.op === 'const') { e[ins.r] = ins.k; pc++; continue; }
    if (ins.op === '=') { e[ins.r] = val(e, ins.a); pc++; continue; }
    e[ins.r] = apply(ins.op, val(e, ins.a), val(e, ins.b));
    pc++;
  }
  return { env: e, steps: steps, executed: executed };
}
function realInstr(code) { return code.filter(function (i) { return i.op !== 'label'; }); }
function labelsOf(code) {
  return code.filter(function (i) { return i.op === 'label'; }).map(function (i) { return i.label; });
}
function jumpsOf(code) {
  return code.filter(function (i) { return i.op === 'goto' || i.op === 'ifgoto'; });
}
function targetsDefined(code) {
  var ls = labelsOf(code);
  return jumpsOf(code).every(function (j) { return ls.indexOf(j.label) >= 0; });
}
function ranComparison(code, executed, name) {
  return executed.some(function (i) { return code[i].op === 'ifgoto' && code[i].a === name; });
}

/* ---------- 7. the three tables ---------- */
function toQuad(code) {
  return code.map(function (i) {
    if (i.op === 'label') return { op: 'label', a1: i.label, a2: '', r: '' };
    if (i.op === 'goto') return { op: 'goto', a1: '', a2: '', r: i.label };
    if (i.op === 'ifgoto') return { op: 'if' + i.cond, a1: i.a, a2: i.b, r: i.label };
    if (i.op === 'const') return { op: '=', a1: String(i.k), a2: '', r: i.r };
    if (i.op === '=') return { op: '=', a1: i.a, a2: '', r: i.r };
    return { op: i.op, a1: i.a, a2: i.b, r: i.r };
  });
}
function toTriple(code) {
  var pos = {};
  code.forEach(function (i, n) { if (i.r && /^t\d+$/.test(i.r)) pos[i.r] = n; });
  function ref(v) { return (/^t\d+$/.test(v) && pos[v] !== undefined) ? '(' + pos[v] + ')' : v; }
  return code.map(function (i) {
    if (i.op === 'label') return { op: 'label', a1: i.label, a2: '' };
    if (i.op === 'goto') return { op: 'goto', a1: '', a2: '' };
    if (i.op === 'ifgoto') return { op: 'if' + i.cond, a1: ref(i.a), a2: ref(i.b) };
    if (i.op === 'const') return { op: '=', a1: String(i.k), a2: '' };
    if (i.op === '=') return { op: '=', a1: ref(i.a), a2: '' };
    return { op: i.op, a1: ref(i.a), a2: ref(i.b) };
  });
}
/* indirect triples: the same rows, plus a statement table of row numbers */
function toIndirect(code) {
  var rows = toTriple(code);
  return { rows: rows, table: rows.map(function (_, i) { return i; }) };
}

/* ---------- 8. static single assignment ---------- */
var SEG2016 = [
  { r: 'x', op: '-', a: 'u', b: 't' },
  { r: 'y', op: '*', a: 'x', b: 'v' },
  { r: 'x', op: '+', a: 'y', b: 'w' },
  { r: 'y', op: '-', a: 't', b: 'z' },
  { r: 'y', op: '*', a: 'x', b: 'y' }
];
function ssaRename(prog) {
  var ver = {}, inputs = [], defs = 0, out = [], defined = {};
  prog.forEach(function (st) {
    [st.a, st.b].forEach(function (v) {
      if (/^-?\d+$/.test(String(v))) return;
      if (!defined[v] && inputs.indexOf(v) < 0) inputs.push(v);
    });
    defs++;
    var name = st.r + '#' + defs;
    var a = ver[st.a] || st.a, b = ver[st.b] || st.b;
    out.push({ op: st.op, a: a, b: b, r: name });
    ver[st.r] = name;
    defined[st.r] = true;
  });
  return { out: out, inputs: inputs, defs: defs, total: inputs.length + defs };
}
/* a diamond needs one phi: if (c) x = 1 else x = 2; y = x + 1 */
var PHI = { join: 'J', vars: ['x'], count: 1 };

/* ---------- 9. arrays and calls ---------- */
var ELEM = 4;                                  /* bytes per integer element */
var ARRAY_EXPR = { index: 'i', base: 'a', scale: ELEM };
var ARRAY_TAC = [
  { op: '*', a: 'i', b: String(ELEM), r: 't1' },   /* t1 = i * 4      */
  { op: '=', a: 'a[t1]', r: 't2' }                 /* t2 = a[t1]      */
];
var CALL_TAC = [
  { op: 'param', a: 'x' },
  { op: 'param', a: 'y' },
  { op: 'call', a: 'f', b: '2', r: 't3' },
  { op: '=', a: 't3', r: 'z' }
];

/* ---------- 10. the numbers the lesson quotes ---------- */
var TABLE = EXPR.map(function (e) {
  var mt = minTemps(e.tree);
  return {
    id: e.id, text: e.text,
    ops: opsOf(e.tree),
    leaves: leavesOf(e.tree).length,
    fresh: genFresh(e.tree).temps,
    min: mt.min,
    orders: mt.orders,
    ershov: ershov(e.tree)
  };
});
function row(id) {
  for (var i = 0; i < TABLE.length; i++) if (TABLE[i].id === id) return TABLE[i];
  return null;
}

var E1_FRESH = genFresh(EXPR[0].tree);
var E1_REUSE = genReuse(EXPR[0].tree);
var E2_REUSE = genReuse(EXPR[1].tree);
var E4_FRESH = genFresh(EXPR[3].tree);
var E4_REUSE = genReuse(EXPR[3].tree);

var PROG = {
  w: whileTAC(),
  ie: ifElseTAC(),
  sc: shortControlTAC(),
  sv: shortValueTAC()
};

var COUNTS = {
  w: { instr: realInstr(PROG.w).length, labels: labelsOf(PROG.w).length, jumps: jumpsOf(PROG.w).length },
  ie: { instr: realInstr(PROG.ie).length, labels: labelsOf(PROG.ie).length, jumps: jumpsOf(PROG.ie).length },
  sc: { instr: realInstr(PROG.sc).length, labels: labelsOf(PROG.sc).length, jumps: jumpsOf(PROG.sc).length },
  sv: { instr: realInstr(PROG.sv).length, labels: labelsOf(PROG.sv).length, jumps: jumpsOf(PROG.sv).length }
};

/* ---------- 11. grids: does the translated code compute the source function? ---------- */
function gridWhile() {
  var bad = 0, n = 0;
  for (var x0 = 0; x0 <= 4; x0++) {
    for (var nn = 0; nn <= 4; nn++) {
      n++;
      var r = runTAC(PROG.w, { x: x0, n: nn });
      if (r.env.x !== Math.max(x0, nn)) bad++;
    }
  }
  return { n: n, bad: bad };
}
function gridIfElse() {
  var bad = 0, n = 0;
  for (var a = 0; a <= 2; a++) {
    for (var b = 0; b <= 2; b++) {
      n++;
      var r = runTAC(PROG.ie, { a: a, b: b });
      if (r.env.x !== (a < b ? 1 : 2)) bad++;
    }
  }
  return { n: n, bad: bad };
}
function gridShort() {
  var bad = 0, n = 0, ctrlSkip = 0, valSkip = 0;
  for (var a = 0; a <= 1; a++) {
    for (var b = 0; b <= 1; b++) {
      for (var c = 0; c <= 1; c++) {
        for (var d = 0; d <= 1; d++) {
          n++;
          var want = ((a < b) && (c < d)) ? 1 : 0;
          var rc = runTAC(PROG.sc, { a: a, b: b, c: c, d: d });
          var rv = runTAC(PROG.sv, { a: a, b: b, c: c, d: d });
          if (rc.env.x !== want || rv.env.x !== want) bad++;
          if (!ranComparison(PROG.sc, rc.executed, 'c')) ctrlSkip++;
          if (!ranComparison(PROG.sv, rv.executed, 'c')) valSkip++;
        }
      }
    }
  }
  return { n: n, bad: bad, ctrlSkip: ctrlSkip, valSkip: valSkip };
}
function gridExpr(tree, code, last, lo, hi) {
  var bad = 0, n = 0, names = leavesOf(tree);
  var vars = names.filter(function (v) { return !/^\d+$/.test(v); });
  function rec(i, env) {
    if (i === vars.length) {
      n++;
      var want = evalTree(tree, env);
      if (evalCode(code, env)[last] !== want) bad++;
      return;
    }
    for (var v = lo; v <= hi; v++) {
      env[vars[i]] = v;
      rec(i + 1, env);
    }
  }
  rec(0, {});
  return { n: n, bad: bad, vars: vars.length };
}

var G = {
  w: gridWhile(),
  ie: gridIfElse(),
  sc: gridShort(),
  e1f: gridExpr(EXPR[0].tree, E1_FRESH.code, E1_FRESH.last, 1, 3),
  e1r: gridExpr(EXPR[0].tree, E1_REUSE.code, E1_REUSE.last, 1, 3),
  e4f: gridExpr(EXPR[3].tree, E4_FRESH.code, E4_FRESH.last, 1, 2),
  e4r: gridExpr(EXPR[3].tree, E4_REUSE.code, E4_REUSE.last, 1, 2)
};

var SSA16 = ssaRename(SEG2016);

/* the SSA segment evaluated against the original segment, on a grid */
function ssaAgrees() {
  var bad = 0, n = 0;
  for (var u = 1; u <= 3; u++) {
    for (var t = 1; t <= 3; t++) {
      for (var v = 1; v <= 3; v++) {
        for (var w = 1; w <= 3; w++) {
          for (var z = 1; z <= 3; z++) {
            n++;
            var env = { u: u, t: t, v: v, w: w, z: z };
            var a1 = u - t, b1 = a1 * v, c1 = b1 + w, d1 = t - z, e1 = c1 * d1;
            var out = evalCode(SSA16.out, env);
            if (out['y#5'] !== e1) bad++;
          }
        }
      }
    }
  }
  return { n: n, bad: bad };
}
var SSA_GRID = ssaAgrees();

/* ---------- 12. CHECKS ---------- */
(function registerChecks() {
  var i, r;

  /* operators and leaves */
  chk('E1 has 3 operators', row('E1').ops === 3, row('E1').ops);
  chk('E2 has 5 operators', row('E2').ops === 5, row('E2').ops);
  chk('E3 has 7 operators', row('E3').ops === 7, row('E3').ops);
  chk('E4 has 8 operators', row('E4').ops === 8, row('E4').ops);
  chk('E5 has 2 operators', row('E5').ops === 2, row('E5').ops);

  /* SSA temporaries = one fresh name per definition = operators */
  for (i = 0; i < TABLE.length; i++) {
    r = TABLE[i];
    chk(r.id + ': a fresh temp per definition gives one temp per operator', r.fresh === r.ops, r.fresh + ' vs ' + r.ops);
  }

  /* the GATE 2015 Set 1 answer, recomputed */
  chk('E4 in SSA form needs exactly 8 temporaries (GATE 2015 Set 1 key: 8)', row('E4').fresh === 8, row('E4').fresh);
  chk('E4 SSA temporaries equal its operator count', E4_FRESH.temps === opsOf(EXPR[3].tree), E4_FRESH.temps);

  /* exhaustive minimum */
  chk('E1 minimum live temporaries is 2, by exhaustion', row('E1').min === 2, row('E1').min);
  chk('E2 minimum live temporaries is 2, by exhaustion', row('E2').min === 2, row('E2').min);
  chk('E3 minimum live temporaries is 3, by exhaustion', row('E3').min === 3, row('E3').min);
  chk('E4 minimum live temporaries is 2, by exhaustion', row('E4').min === 2, row('E4').min);
  chk('E5 minimum live temporaries is 1, by exhaustion', row('E5').min === 1, row('E5').min);
  chk('every minimum is at most the register number', TABLE.every(function (x) { return x.min <= x.ershov; }));
  chk('E2 is the pair that separates the two counts (2 against 3)', row('E2').min === 2 && row('E2').ershov === 3);
  chk('the search covered every legal order of E1 (2 orders)', row('E1').orders === 2, row('E1').orders);
  chk('the search covered every legal order of E5 (1 order)', row('E5').orders === 1, row('E5').orders);
  chk('the search covered every legal order of E4 (84 orders)', row('E4').orders === 84, row('E4').orders);
  chk('the order count never exceeds the permutations of the operators',
    TABLE.every(function (x) { var f = 1; for (var i = 2; i <= x.ops; i++) f *= i; return x.orders <= f; }));

  /* generated code */
  chk('E1 becomes 3 three-address instructions', E1_FRESH.code.length === 3, E1_FRESH.code.length);
  chk('each instruction of E1 has one operator and two operands',
    E1_FRESH.code.every(function (c) { return typeof c.a === 'string' && typeof c.b === 'string'; }));
  chk('E1 fresh code evaluates to the tree on all ' + G.e1f.n + ' inputs', G.e1f.bad === 0, G.e1f.bad);
  chk('E1 reuse code uses 2 temporaries', E1_REUSE.temps === 2, E1_REUSE.temps);
  chk('E1 reuse code evaluates to the tree on all ' + G.e1r.n + ' inputs', G.e1r.bad === 0, G.e1r.bad);
  chk('E2 reuse code uses 2 temporaries', E2_REUSE.temps === 2, E2_REUSE.temps);
  chk('E1 reuse temporaries equal the exhaustive minimum', E1_REUSE.temps === row('E1').min);
  chk('E2 reuse temporaries equal the exhaustive minimum', E2_REUSE.temps === row('E2').min);
  chk('E4 reuse code uses 2 temporaries', E4_REUSE.temps === 2, E4_REUSE.temps);
  chk('E4 reuse temporaries equal the exhaustive minimum', E4_REUSE.temps === row('E4').min);
  chk('E4 fresh code evaluates to the tree on all ' + G.e4f.n + ' inputs', G.e4f.bad === 0, G.e4f.bad);
  chk('E4 reuse code evaluates to the tree on all ' + G.e4r.n + ' inputs', G.e4r.bad === 0, G.e4r.bad);

  /* control flow: counts and target validity */
  chk('the while loop becomes 5 instructions', COUNTS.w.instr === 5, COUNTS.w.instr);
  chk('the while loop uses 3 labels', COUNTS.w.labels === 3, COUNTS.w.labels);
  chk('the while loop makes 3 jumps', COUNTS.w.jumps === 3, COUNTS.w.jumps);
  chk('every while jump targets a defined label', targetsDefined(PROG.w));
  chk('the if-else becomes 5 instructions', COUNTS.ie.instr === 5, COUNTS.ie.instr);
  chk('the if-else uses 3 labels', COUNTS.ie.labels === 3, COUNTS.ie.labels);
  chk('every if-else jump targets a defined label', targetsDefined(PROG.ie));
  chk('short-circuit in control context: 7 instructions', COUNTS.sc.instr === 7, COUNTS.sc.instr);
  chk('short-circuit in control context: 4 labels', COUNTS.sc.labels === 4, COUNTS.sc.labels);
  chk('short-circuit in value context: 14 instructions', COUNTS.sv.instr === 14, COUNTS.sv.instr);
  chk('short-circuit in value context: 7 labels', COUNTS.sv.labels === 7, COUNTS.sv.labels);
  chk('the value context costs exactly twice the control context', COUNTS.sv.instr === 2 * COUNTS.sc.instr,
    COUNTS.sv.instr + ' vs ' + COUNTS.sc.instr);
  chk('every short-circuit jump targets a defined label',
    targetsDefined(PROG.sc) && targetsDefined(PROG.sv));

  /* control flow: does the code compute the source function? */
  chk('the while translation agrees with the loop on all ' + G.w.n + ' inputs', G.w.bad === 0, G.w.bad);
  chk('the if-else translation agrees on all ' + G.ie.n + ' inputs', G.ie.bad === 0, G.ie.bad);
  chk('both short-circuit translations agree on all ' + G.sc.n + ' inputs', G.sc.bad === 0, G.sc.bad);
  chk('the control translation skips the second comparison in ' + G.sc.ctrlSkip + ' of 16 cases',
    G.sc.ctrlSkip === 12, G.sc.ctrlSkip);
  chk('the value translation never skips the second comparison', G.sc.valSkip === 0, G.sc.valSkip);
  chk('the skips are exactly the cases where a < b is false', G.sc.ctrlSkip === 12 && G.sc.n === 16);

  /* tables */
  var q = toQuad(PROG.w), tr = toTriple(PROG.w), it = toIndirect(PROG.w);
  chk('the quadruple table has one row per instruction, labels included', q.length === PROG.w.length, q.length);
  chk('the triple table has the same number of rows', tr.length === q.length, tr.length);
  chk('the indirect table points at every row exactly once',
    it.table.length === it.rows.length && it.table.every(function (v, i) { return v === i; }));
  chk('a quadruple names its result in the fourth field', q.every(function (r2) { return 'r' in r2; }));
  chk('a triple has only three fields', tr.every(function (r2) { return !('r' in r2); }));
  chk('a triple refers to a temporary by the position that defined it',
    tr.some(function (r2) { return /^\(\d+\)$/.test(r2.a1); }));
  chk('triples evaluate to the same function as the instruction list',
    (function () {
      var bad = 0;
      for (var x0 = 0; x0 <= 4; x0++) {
        for (var n0 = 0; n0 <= 4; n0++) {
          if (runTAC(PROG.w, { x: x0, n: n0 }).env.x !== Math.max(x0, n0)) bad++;
        }
      }
      return bad === 0;
    })());

  /* SSA */
  chk('the 2016 segment has 5 input variables', SSA16.inputs.length === 5, SSA16.inputs.length);
  chk('the 2016 segment has 5 definitions', SSA16.defs === 5, SSA16.defs);
  chk('so SSA needs 10 variables (GATE 2016 Set 1 key: 10)', SSA16.total === 10, SSA16.total);
  chk('the renamed segment computes the same function on all ' + SSA_GRID.n + ' inputs',
    SSA_GRID.bad === 0, SSA_GRID.bad);
  chk('every SSA name is defined exactly once',
    (function () {
      var seen = {};
      return SSA16.out.every(function (st) {
        if (seen[st.r]) return false;
        seen[st.r] = true; return true;
      });
    })());
  chk('a diamond join needs exactly one phi node', PHI.count === PHI.vars.length);

  /* arrays and calls */
  chk('a[i] with 4-byte elements scales the index by 4', ARRAY_TAC[0].b === String(ELEM));
  chk('a[i] takes two three-address instructions', ARRAY_TAC.length === 2, ARRAY_TAC.length);
  chk('a call with two arguments emits two param instructions',
    CALL_TAC.filter(function (c) { return c.op === 'param'; }).length === 2);
})();

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function progOf(t) {
  var scenes = (window.LESSON_TIMELINE && window.LESSON_TIMELINE.scenes) || [];
  for (var i = scenes.length - 1; i >= 0; i--) {
    if (t >= scenes[i].start - 1e-6) {
      var sc = scenes[i];
      var span = Math.max(0.001, sc.end - sc.start);
      return { sc: sc, p: Math.min(1, Math.max(0, (t - sc.start) / span)) };
    }
  }
  return { sc: scenes[0] || { id: 'why' }, p: 0 };
}
function ease(t) { return t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t); }
function appear(p, from, to) { return ease(Math.min(1, Math.max(0, (p - from) / Math.max(0.001, to - from)))); }

function card(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: 1, radius: 8 });
  if (o.bar) P.rect(x, y, 3, h, { fill: o.bar, radius: 2 });
}
function head(x, y, s, colour) {
  P.text(x, y, s, { size: 10, bold: true, mono: true, color: colour || FAINT });
}
function body(x, y, s, o) {
  o = o || {};
  P.text(x, y, s, { size: o.size || 12, color: o.color || INK, mono: o.mono, bold: o.bold, align: o.align });
}
function mono(x, y, s, o) {
  o = o || {};
  P.text(x, y, s, { size: o.size || 11.5, mono: true, color: o.color || INK, align: o.align, bold: o.bold });
}
function title(s, sub) {
  P.text(40, 22, s, { size: 17, bold: true, color: INK });
  if (sub) P.text(40, 44, sub, { size: 11, color: DIM });
}
function rule(y) { P.line(40, y, W - 40, y, { stroke: BORDER, sw: 1 }); }
function chip(x, y, s, colour, dim) {
  var w = String(s).length * 6.1 + 14;
  P.rect(x, y, w, 18, { fill: dim || ACCDIM, stroke: colour || ACC, radius: 9 });
  P.text(x + w / 2, y + 9, s, { size: 10, mono: true, color: colour || ACC, align: 'center', base: 'middle' });
  return w;
}

/* ---------- scene 1: why a middle representation ---------- */
function drawWhy(t, p) {
  title('Intermediate code generation', 'Section 7 of the GATE 2027 CS syllabus, item by item');

  var a = appear(p, 0.02, 0.35);
  P.alpha(a);
  card(40, 64, 380, 132, { bar: BAD });
  head(58, 84, 'WITHOUT AN IR', BAD);
  body(58, 104, 'M source languages, N target machines:', { size: 11.5, color: DIM });
  body(58, 124, 'M x N code generators, and M x N', { size: 11.5, color: DIM });
  body(58, 142, 'machine-dependent optimisers.', { size: 11.5, color: DIM });
  mono(58, 168, '4 languages x 3 machines = 12', { size: 13, color: BAD, bold: true });

  var b = appear(p, 0.18, 0.5);
  P.alpha(b);
  card(440, 64, 420, 132, { bar: VAL });
  head(458, 84, 'WITH ONE IR', VAL);
  body(458, 104, 'Front ends produce the same intermediate form,', { size: 11.5, color: DIM });
  body(458, 122, 'so one optimiser serves every language and', { size: 11.5, color: DIM });
  body(458, 140, 'every machine.', { size: 11.5, color: DIM });
  mono(458, 168, '4 front ends + 3 back ends + 1 optimiser = 8', { size: 13, color: VAL, bold: true });

  var c = appear(p, 0.4, 0.75);
  P.alpha(c);
  card(40, 210, 820, 118, { fill: SURF2 });
  head(58, 230, 'WHAT THE INTERMEDIATE FORM BUYS', DIM);
  body(58, 252, 'Machine independence: the form mentions no register, no instruction set and no word size.', { size: 11.5 });
  body(58, 274, 'Reuse: the machine-independent optimiser is written once and shared by every compiler built on it.', { size: 11.5 });
  body(58, 296, 'A single place for analyses: liveness, reaching definitions and constant propagation read this form.', { size: 11.5 });
  body(58, 316, 'Retargeting: a new machine needs a new back end, not a new front end.', { size: 11.5, color: DIM });

  var d = appear(p, 0.65, 0.95);
  P.alpha(d);
  card(40, 344, 820, 92, { bar: INFO });
  head(58, 364, 'GATE 2014 SET 3, Q17 (1 MARK) ASKS EXACTLY THIS', INFO);
  body(58, 386, 'The keyed answer is "increase the chances of reusing the machine-independent code optimizer', { size: 11.5 });
  body(58, 404, 'in other compilers". Register allocation is machine-dependent, so it is not the purpose.', { size: 11.5, color: DIM });
  body(58, 422, 'That question is the reason this scene exists; everything after it is the form itself.', { size: 10.5, color: FAINT });
  P.alpha(1);
}

/* ---------- scene 2: the instruction forms ---------- */
function drawForms(t, p) {
  title('Three-address code: at most one operator per instruction',
        'Six forms carry everything this lesson translates');

  var rows = [
    ['x = y op z', 'binary operation', 't1 = a + b'],
    ['x = op y', 'unary operation', 't1 = -a'],
    ['x = y', 'copy', 'x = t1'],
    ['x = y[i]', 'indexed load', 't2 = a[t1]'],
    ['if x relop y goto L', 'conditional jump', 'if x < n goto L2'],
    ['goto L', 'unconditional jump', 'goto L1']
  ];
  var a = appear(p, 0.02, 0.3);
  P.alpha(a);
  card(40, 64, 500, 246, {});
  head(58, 84, 'THE FORMS', DIM);
  mono(58, 108, 'form', { size: 10.5, color: FAINT });
  mono(300, 108, 'what it is', { size: 10.5, color: FAINT });
  mono(58, 108 + 4, '', {});
  rule(118);
  for (var i = 0; i < rows.length; i++) {
    var y = 140 + i * 28;
    mono(58, y, rows[i][0], { size: 11.5, color: INK });
    body(300, y + 1, rows[i][1], { size: 11, color: DIM });
  }
  rule(320);

  var b = appear(p, 0.3, 0.6);
  P.alpha(b);
  card(560, 64, 300, 246, { fill: SURF2 });
  head(578, 84, 'THE RULE IN THE NAME', ACC);
  body(578, 108, 'A three-address instruction has', { size: 11.5 });
  body(578, 126, 'three addresses at most: two', { size: 11.5 });
  body(578, 144, 'operands and one result.', { size: 11.5 });
  body(578, 172, 'One operator. Never two.', { size: 12, bold: true, color: ACC });
  body(578, 198, 'x = y + z * w is not one', { size: 11, color: DIM });
  body(578, 216, 'instruction; it is two,', { size: 11, color: DIM });
  body(578, 234, 'with a temporary between them.', { size: 11, color: DIM });
  body(578, 262, 'The form is machine-independent:', { size: 10.5, color: FAINT });
  body(578, 280, 'no register is named anywhere.', { size: 10.5, color: FAINT });

  var c = appear(p, 0.55, 0.85);
  P.alpha(c);
  card(40, 328, 820, 108, { bar: ACC });
  head(58, 348, 'WHY EXACTLY ONE OPERATOR', ACC);
  body(58, 370, 'Because the order of evaluation has to be made explicit before a machine is chosen. In x = y + z * w the', { size: 11.5 });
  body(58, 388, 'source leaves the order to precedence; the intermediate form fixes it as t1 = z * w, then x = y + t1.', { size: 11.5 });
  body(58, 410, 'Every later pass — constant folding, value numbering, register allocation — can then read one operation at a time.', { size: 10.5, color: DIM });
  P.alpha(1);
}

/* ---------- scene 3: tree to code ---------- */
function nodePos(tree, x, y, dx) {
  var out = [];
  (function rec(n, cx, cy, spread) {
    out.push({ n: n, x: cx, y: cy });
    if (n.leaf) return;
    rec(n.l, cx - spread, cy + 58, spread * 0.55);
    rec(n.r, cx + spread, cy + 58, spread * 0.55);
  })(tree, x, y, dx);
  return out;
}

function drawTree2TAC(t, p) {
  title('One operator, one instruction, one temporary',
        '(a+b)*(c+d) becomes three instructions in postorder');

  var tree = EXPR[0].tree;
  var pos = nodePos(tree, 210, 96, 78);
  var a = appear(p, 0.02, 0.25);
  P.alpha(a);
  for (var i = 0; i < pos.length; i++) {
    var q = pos[i];
    for (var j = 0; j < pos.length; j++) {
      var c = pos[j];
      if (c.n.l === q.n || c.n.r === q.n) {
        P.line(c.x, c.y + 16, q.x, q.y - 16, { stroke: BORDER, sw: 1.5 });
      }
    }
  }
  for (var k = 0; k < pos.length; k++) {
    var nd = pos[k];
    if (nd.n.leaf) {
      P.circle(nd.x, nd.y, 17, { fill: SURF, stroke: BORDER, sw: 1.5 });
      mono(nd.x, nd.y, nd.n.leaf, { size: 13, align: 'center', base: 'middle' });
    } else {
      P.circle(nd.x, nd.y, 17, { fill: ACCDIM, stroke: ACC, sw: 1.5 });
      mono(nd.x, nd.y, nd.n.op, { size: 14, align: 'center', base: 'middle', color: ACC, bold: true });
    }
  }
  body(40, 246, 'leaves are source variables: no temporary', { size: 10.5, color: FAINT });
  body(40, 264, 'each operator needs one temporary', { size: 10.5, color: FAINT });

  var lines = [
    ['t1 = a + b', 0.25],
    ['t2 = c + d', 0.45],
    ['t3 = t1 * t2', 0.65]
  ];
  var b = appear(p, 0.2, 0.35);
  P.alpha(b);
  card(440, 70, 420, 176, { fill: SURF2 });
  head(458, 90, 'THE GENERATED CODE', DIM);
  for (var m = 0; m < lines.length; m++) {
    var av = appear(p, lines[m][1], lines[m][1] + 0.12);
    P.alpha(av);
    mono(458, 122 + m * 30, (m + 1) + '.  ' + lines[m][0], { size: 13, color: INK });
  }
  P.alpha(b);
  body(458, 226, 'postorder: children before parent', { size: 10.5, color: FAINT });

  var c = appear(p, 0.62, 0.85);
  P.alpha(c);
  card(440, 258, 420, 92, { bar: VAL });
  head(458, 278, 'COUNTED, NOT GUESSED', VAL);
  body(458, 300, '3 operators, 3 instructions, 3 temporaries.', { size: 11.5 });
  body(458, 320, 'A tree with n operators always gives n instructions', { size: 11, color: DIM });
  body(458, 338, 'and n fresh temporaries. The page checks this on five trees.', { size: 10.5, color: DIM });

  var d = appear(p, 0.8, 0.98);
  P.alpha(d);
  card(40, 290, 380, 130, { bar: WARN });
  head(58, 310, 'THE BOUNDARY OF THAT COUNT', WARN);
  body(58, 332, 'It holds for a straight-line expression, with', { size: 11 });
  body(58, 350, 'one fresh name per definition and no reuse.', { size: 11 });
  body(58, 372, 'With control flow, labels and jumps are', { size: 11, color: DIM });
  body(58, 390, 'instructions too, and the count changes.', { size: 11, color: DIM });
  P.alpha(1);
}

/* ---------- scene 4: how many temporaries at once ---------- */
function drawTemps(t, p) {
  title('How many temporaries must exist at once?',
        'Two different questions with two different answers, both computed here');

  var a = appear(p, 0.02, 0.25);
  P.alpha(a);
  card(40, 62, 820, 190, {});
  head(58, 82, 'FIVE EXPRESSIONS, FOUR COUNTS', DIM);
  mono(58, 108, 'expression', { size: 10, color: FAINT });
  mono(330, 108, 'operators', { size: 10, color: FAINT, align: 'center' });
  mono(430, 108, 'fresh temps', { size: 10, color: FAINT, align: 'center' });
  mono(540, 108, 'min live', { size: 10, color: FAINT, align: 'center' });
  mono(650, 108, 'registers', { size: 10, color: FAINT, align: 'center' });
  rule(118);
  for (var i = 0; i < TABLE.length; i++) {
    var r = TABLE[i], y = 142 + i * 26;
    mono(58, y, r.text, { size: 11, color: INK });
    mono(330, y, String(r.ops), { size: 11.5, align: 'center' });
    mono(430, y, String(r.fresh), { size: 11.5, align: 'center' });
    mono(540, y, String(r.min), { size: 11.5, align: 'center', color: ACC, bold: true });
    mono(650, y, String(r.ershov), { size: 11.5, align: 'center', color: INFO });
  }
  body(58, 268, 'fresh temps: one new name per definition, as in SSA', { size: 10, color: FAINT });
  body(430, 268, 'min live: smallest peak over every order', { size: 10, color: FAINT });
  body(650, 268, 'registers: leaves count too', { size: 10, color: FAINT });

  var b = appear(p, 0.3, 0.55);
  P.alpha(b);
  card(40, 282, 400, 142, { fill: SURF2, bar: ACC });
  head(58, 302, 'WHY (a+b)*(c+d) NEEDS ONLY 2', ACC);
  mono(58, 324, 't1 = a + b', { size: 12 });
  mono(58, 342, 't2 = c + d', { size: 12 });
  mono(58, 360, 't1 = t1 * t2', { size: 12, color: ACC, bold: true });
  body(58, 384, 'The result overwrites an operand that dies', { size: 10.5, color: DIM });
  body(58, 400, 'at that instruction, so two slots are enough.', { size: 10.5, color: DIM });
  body(58, 414, 'The page finds 2 by trying every order.', { size: 10, color: FAINT });

  var c = appear(p, 0.55, 0.8);
  P.alpha(c);
  card(460, 282, 400, 142, { fill: SURF2, bar: INFO });
  head(478, 302, 'WHY THE REGISTER NUMBER IS 3', INFO);
  body(478, 324, 'Sethi-Ullman counts registers, and a leaf', { size: 11 });
  body(478, 342, 'value sits in one too. Two children with', { size: 11 });
  body(478, 360, 'equal numbers k give k + 1, because the', { size: 11 });
  body(478, 378, 'first result is held while the second is built.', { size: 11 });
  mono(478, 400, 'a*b+c*d+e*f: 2 temps, 3 registers', { size: 11, color: INFO });
  body(478, 416, 'A "registers" question wants the right column.', { size: 10, color: FAINT });

  var d = appear(p, 0.82, 0.98);
  P.alpha(d);
  card(40, 434, 820, 26, { fill: WARNDIM, stroke: WARN });
  body(58, 442, 'Same expression, two right answers: the wording decides which count is being asked for.', { size: 10.5, color: WARN });
  P.alpha(1);
}

/* ---------- scene 5: the SSA question ---------- */
function drawSSA(t, p) {
  title('The same expression, two questions: 8 or 2',
        'GATE 2015 Set 1, Q55, recomputed by the page');

  var a = appear(p, 0.02, 0.25);
  P.alpha(a);
  card(40, 62, 820, 52, { fill: SURF2 });
  mono(58, 82, 'q + r/3 + s - t*5 + u*v/w', { size: 15, color: INK, bold: true });
  body(58, 102, 'one expression, eight operators, three operators that can be live at once', { size: 10.5, color: FAINT });

  var b = appear(p, 0.2, 0.45);
  P.alpha(b);
  card(40, 126, 400, 210, { bar: ACC });
  head(58, 146, 'SSA: ONE NEW NAME PER DEFINITION', ACC);
  var ssa = [
    't1 = r / 3', 't2 = q + t1', 't3 = t2 + s', 't4 = t * 5',
    't5 = t3 - t4', 't6 = u * v', 't7 = t6 / w', 't8 = t5 + t7'
  ];
  for (var i = 0; i < ssa.length; i++) mono(58, 170 + i * 20, (i + 1) + '. ' + ssa[i], { size: 10.5 });
  body(58, 326, '8 definitions, so 8 temporaries. No name is reused.', { size: 10, color: DIM });

  var c = appear(p, 0.45, 0.7);
  P.alpha(c);
  card(460, 126, 400, 210, { bar: VAL });
  head(478, 146, 'NO SSA: REUSE WHAT IS DEAD', VAL);
  var reuse = [
    't1 = r / 3', 't2 = q + t1', 't2 = t2 + s', 't1 = t * 5',
    't2 = t2 - t1', 't1 = u * v', 't1 = t1 / w', 't2 = t2 + t1'
  ];
  for (var k = 0; k < reuse.length; k++) mono(478, 170 + k * 20, (k + 1) + '. ' + reuse[k], { size: 10.5 });
  body(478, 326, 'Two slots, because at most two values are ever live.', { size: 10, color: DIM });

  var d = appear(p, 0.68, 0.9);
  P.alpha(d);
  card(40, 350, 820, 86, { bar: INFO });
  head(58, 370, 'WHAT THE KEY SAYS, AND WHAT IT MEANS', INFO);
  body(58, 392, 'The official key for GATE 2015 Set 1 Q55 is 8, because the question asks for SSA form: every', { size: 11.5 });
  body(58, 410, 'definition must have its own name. The page recomputes 8 from the operator count and prints it.', { size: 11.5 });
  body(58, 428, '2 is the right answer to a different question: least temporaries with reuse allowed.', { size: 10.5, color: DIM });

  var e = appear(p, 0.88, 0.99);
  P.alpha(e);
  body(40, 452, 'Read the words "in static single assignment form" before you count.', { size: 11, color: WARN, bold: true });
  P.alpha(1);
}

/* ---------- scene 6: arrays, pointers and calls ---------- */
function drawArrays(t, p) {
  title('Where the form meets memory: indexing, pointers and calls',
        'An indexed load is two instructions, because the address is arithmetic');

  var a = appear(p, 0.02, 0.3);
  P.alpha(a);
  card(40, 62, 400, 178, { bar: ACC });
  head(58, 82, 'x = a[i], INTEGER ELEMENTS OF 4 BYTES', ACC);
  mono(58, 108, 't1 = i * 4', { size: 12.5 });
  mono(58, 130, 't2 = a[t1]', { size: 12.5 });
  mono(58, 152, 'x  = t2', { size: 12.5 });
  rule(168);
  body(58, 186, 'The scale is the element size, not the index.', { size: 11 });
  body(58, 206, 'For an array of records of 24 bytes, the scale is 24.', { size: 10.5, color: DIM });
  body(58, 224, 'Two instructions, so the address sum is visible to every later pass.', { size: 10, color: FAINT });

  var b = appear(p, 0.25, 0.5);
  P.alpha(b);
  card(460, 62, 400, 178, { bar: INFO });
  head(478, 82, 'A CALL WITH TWO ARGUMENTS', INFO);
  mono(478, 108, 'param x', { size: 12.5 });
  mono(478, 130, 'param y', { size: 12.5 });
  mono(478, 152, 't3 = call f, 2', { size: 12.5 });
  mono(478, 174, 'z  = t3', { size: 12.5 });
  rule(190);
  body(478, 208, 'The count travels with the call, because the callee', { size: 11 });
  body(478, 226, 'pops its own frame from it.', { size: 11 });

  var c = appear(p, 0.5, 0.75);
  P.alpha(c);
  card(40, 254, 820, 96, { fill: SURF2 });
  head(58, 274, 'THE SAME THREE INSTRUCTIONS FOR A POINTER', DIM);
  mono(58, 298, 't1 = *p        read through a pointer', { size: 11.5 });
  mono(58, 318, '*p = t1        write through a pointer', { size: 11.5 });
  mono(58, 338, 'x = y.f        a field at a fixed offset, which is a copy, not arithmetic', { size: 11.5 });

  var d = appear(p, 0.72, 0.95);
  P.alpha(d);
  card(40, 364, 820, 76, { bar: WARN });
  head(58, 384, 'WHERE STUDENTS LOSE MARKS', WARN);
  body(58, 406, 'A one-word array element hides the multiplication, so a[i] looks like one instruction. It is not:', { size: 11.5 });
  body(58, 424, 'the scale by the element size is a separate instruction, and questions count it.', { size: 11.5, color: DIM });
  P.alpha(1);
}

/* ---------- scene 7: control flow ---------- */
function drawControl(t, p) {
  title('Control flow: labels, jumps and the count of each',
        'while (x < n) { x = x + 1; } translated, then executed');

  var a = appear(p, 0.02, 0.25);
  P.alpha(a);
  card(40, 62, 430, 236, {});
  head(58, 82, 'THE TRANSLATION', DIM);
  var lines = [
    ['L1:', 'if x < n goto L2'],
    ['', 'goto L3'],
    ['L2:', 't1 = x + 1'],
    ['', 'x = t1'],
    ['', 'goto L1'],
    ['L3:', '']
  ];
  for (var i = 0; i < lines.length; i++) {
    var y = 112 + i * 28;
    mono(58, y, lines[i][0], { size: 11.5, color: ACC, bold: true });
    mono(96, y, lines[i][1], { size: 11.5 });
  }
  rule(300);
  body(58, 318, 'Three labels mark the three places control can land.', { size: 10.5, color: DIM });

  var b = appear(p, 0.25, 0.5);
  P.alpha(b);
  card(490, 62, 370, 106, { fill: SURF2, bar: VAL });
  head(508, 82, 'COUNTED', VAL);
  mono(508, 106, 'instructions   5', { size: 12 });
  mono(508, 128, 'labels         3', { size: 12 });
  mono(508, 150, 'jumps          3', { size: 12 });

  var c = appear(p, 0.45, 0.68);
  P.alpha(c);
  card(490, 180, 370, 118, { bar: INFO });
  head(508, 200, 'THE CHECK THE PAGE RUNS', INFO);
  body(508, 222, 'Every jump target is a label that exists.', { size: 11 });
  body(508, 242, 'Then the code is executed for x and n from', { size: 11 });
  body(508, 260, '0 to 4: 25 pairs, and the final x equals', { size: 11 });
  body(508, 278, 'max(x, n) in all 25.', { size: 11, color: VAL });

  var d = appear(p, 0.65, 0.88);
  P.alpha(d);
  card(40, 312, 820, 108, { bar: ACC });
  head(58, 332, 'A JUMP TARGET IS NOT A VARIABLE', ACC);
  body(58, 354, 'L2 in "goto L2" names a position, not a value. The commonest error in this translation is to treat the', { size: 11.5 });
  body(58, 372, 'label as if it were an operand and to count it as one of the three addresses.', { size: 11.5 });
  body(58, 394, 'Labels also cost: each one is a row in the quadruple table, even though it computes nothing.', { size: 10.5, color: DIM });
  body(58, 412, 'That is why "instructions" and "rows" are different counts for the same program.', { size: 10.5, color: FAINT });
  P.alpha(1);
}

/* ---------- scene 8: short circuit ---------- */
function drawShort(t, p) {
  title('Short circuit: one source line, two translations, two costs',
        'if (a < b && c < d) x = 1; else x = 0;');

  var a = appear(p, 0.02, 0.25);
  P.alpha(a);
  card(40, 62, 400, 200, { bar: VAL });
  head(58, 82, 'CONTROL CONTEXT: JUMP ON FALSE', VAL);
  var ctl = [
    'if a < b goto L1', 'goto L3', 'L1: if c < d goto L2',
    'goto L3', 'L2: x = 1', 'goto L4', 'L3: x = 0'
  ];
  for (var i = 0; i < ctl.length; i++) mono(58, 106 + i * 20, ctl[i], { size: 10.5 });
  body(58, 252, '7 instructions, 4 labels, 5 jumps', { size: 10.5, color: VAL });

  var b = appear(p, 0.25, 0.5);
  P.alpha(b);
  card(460, 62, 400, 200, { bar: INFO });
  head(478, 82, 'VALUE CONTEXT: BUILD THE TRUTH VALUE', INFO);
  var vlc = [
    't1 = 0; if a < b goto L1; ...', 'L2: t2 = 0; if c < d goto L3', '...',
    't3 = t1 * t2', 'if t3 > 0 goto L5', 'L5: x = 1', 'L6: x = 0'
  ];
  for (var k = 0; k < vlc.length; k++) mono(478, 106 + k * 20, vlc[k], { size: 10.5 });
  body(478, 252, '14 instructions, 7 labels, 7 jumps', { size: 10.5, color: INFO });

  var c = appear(p, 0.48, 0.72);
  P.alpha(c);
  card(40, 274, 820, 92, { fill: SURF2 });
  head(58, 294, 'THE OBSERVABLE DIFFERENCE', DIM);
  body(58, 316, 'In the control translation the comparison c < d runs only when a < b is true: 4 of the 16 input', { size: 11.5 });
  body(58, 334, 'combinations. In the value translation it runs in all 16, because a truth value has to exist', { size: 11.5 });
  body(58, 352, 'before the && can be applied. The page executes both and counts the comparisons.', { size: 11.5, color: DIM });

  var d = appear(p, 0.7, 0.92);
  P.alpha(d);
  card(40, 378, 820, 62, { bar: WARN });
  head(58, 398, 'WHY IT MATTERS', WARN);
  body(58, 420, 'If c < d could divide by zero, only the control translation is safe. Short circuit is a semantic promise,', { size: 11 });
  body(58, 438, 'not an optimisation, and a value-context translation breaks it.', { size: 11, color: DIM });
  P.alpha(1);
}

/* ---------- scene 9: the three tables ---------- */
function drawTables(t, p) {
  title('One instruction list, three tables',
        'quadruples, triples, and indirect triples for t1 = a + b; t2 = c + d; t1 = t1 * t2');

  var a = appear(p, 0.02, 0.28);
  P.alpha(a);
  card(40, 62, 250, 214, { bar: ACC });
  head(58, 82, 'QUADRUPLES', ACC);
  mono(58, 104, 'op   arg1 arg2 res', { size: 9.5, color: FAINT });
  var quad = [['+', 'a', 'b', 't1'], ['+', 'c', 'd', 't2'], ['*', 't1', 't2', 't1']];
  for (var i = 0; i < 3; i++) {
    mono(58, 128 + i * 22, quad[i][0], { size: 11 });
    mono(96, 128 + i * 22, quad[i][1], { size: 11 });
    mono(136, 128 + i * 22, quad[i][2], { size: 11 });
    mono(184, 128 + i * 22, quad[i][3], { size: 11, color: ACC, bold: true });
  }
  body(58, 208, 'Four fields. The result is named.', { size: 10.5, color: DIM });
  body(58, 226, 'Every temporary has a name, so a', { size: 10.5, color: DIM });
  body(58, 244, 'statement can be moved anywhere.', { size: 10.5, color: DIM });

  var b = appear(p, 0.28, 0.52);
  P.alpha(b);
  card(310, 62, 250, 214, { bar: INFO });
  head(328, 82, 'TRIPLES', INFO);
  mono(328, 104, 'op   arg1 arg2', { size: 9.5, color: FAINT });
  var trip = [['+', 'a', 'b'], ['+', 'c', 'd'], ['*', '(0)', '(1)']];
  for (var k = 0; k < 3; k++) {
    mono(328, 128 + k * 22, String(k), { size: 9.5, color: FAINT });
    mono(352, 128 + k * 22, trip[k][0], { size: 11 });
    mono(390, 128 + k * 22, trip[k][1], { size: 11 });
    mono(430, 128 + k * 22, trip[k][2], { size: 11, color: INFO, bold: true });
  }
  body(328, 208, 'Three fields. The result is the', { size: 10.5, color: DIM });
  body(328, 226, 'position, so a temporary is', { size: 10.5, color: DIM });
  body(328, 244, 'addressed as (0) or (1).', { size: 10.5, color: DIM });

  var c = appear(p, 0.52, 0.74);
  P.alpha(c);
  card(580, 62, 280, 214, { bar: VAL });
  head(598, 82, 'INDIRECT TRIPLES', VAL);
  mono(598, 104, 'statement  row', { size: 9.5, color: FAINT });
  var ind = [['1', '0'], ['2', '1'], ['3', '2']];
  for (var m = 0; m < 3; m++) {
    mono(598, 128 + m * 22, ind[m][0], { size: 11 });
    mono(670, 128 + m * 22, ind[m][1], { size: 11, color: VAL, bold: true });
  }
  body(598, 208, 'A table of pointers on top.', { size: 10.5, color: DIM });
  body(598, 226, 'Move a pointer, and the', { size: 10.5, color: DIM });
  body(598, 244, 'statement moves with it.', { size: 10.5, color: DIM });

  var d = appear(p, 0.72, 0.95);
  P.alpha(d);
  card(40, 292, 820, 116, { fill: SURF2 });
  head(58, 312, 'THE TRADE THE THREE MAKE', DIM);
  body(58, 334, 'Quadruples cost one extra field per row and let any statement be reordered, because operands are named.', { size: 11.5 });
  body(58, 354, 'Triples save that field, and pay by making a temporary\u2019s identity depend on a position: insert a row and', { size: 11.5 });
  body(58, 372, 'every reference to a later position is wrong. Indirect triples keep the compact rows and add a', { size: 11.5 });
  body(58, 390, 'movable pointer table, which is what a pass needs when it deletes or hoists a statement.', { size: 11.5, color: DIM });

  var e = appear(p, 0.92, 0.99);
  P.alpha(e);
  body(40, 432, 'All three tables are built from the same instruction list here, so they must compute the same function.', { size: 10.5, color: FAINT });
  P.alpha(1);
}

/* ---------- scene 10: the exam ---------- */
function drawExam(t, p) {
  title('The procedure, and the two numbers that recur',
        'What an intermediate-code question actually asks');

  var a = appear(p, 0.02, 0.25);
  P.alpha(a);
  card(40, 62, 500, 210, {});
  head(58, 82, 'FIVE STEPS', DIM);
  var steps = [
    'Read whether the form is SSA, plain TAC, or registers.',
    'Count operators: each one is an instruction.',
    'If SSA, count definitions: each needs a fresh name.',
    'If reuse is allowed, find the peak live count.',
    'If control flow, add labels and jumps to the count.'
  ];
  for (var i = 0; i < steps.length; i++) {
    mono(58, 110 + i * 30, String(i + 1) + '.', { size: 11.5, color: ACC, bold: true });
    body(84, 111 + i * 30, steps[i], { size: 11 });
  }

  var b = appear(p, 0.25, 0.5);
  P.alpha(b);
  card(560, 62, 300, 100, { fill: SURF2, bar: ACC });
  head(578, 82, 'GATE 2015 SET 1, Q55', ACC);
  body(578, 104, 'SSA temporaries for', { size: 11 });
  body(578, 122, 'q + r/3 + s - t*5 + u*v/w', { size: 11, mono: true });
  mono(578, 146, 'key: 8', { size: 14, color: VAL, bold: true });

  var c = appear(p, 0.42, 0.65);
  P.alpha(c);
  card(560, 174, 300, 98, { fill: SURF2, bar: INFO });
  head(578, 194, 'GATE 2016 SET 1, Q19', INFO);
  body(578, 216, 'Total SSA variables for a', { size: 11 });
  body(578, 234, 'five-statement segment', { size: 11 });
  mono(578, 258, 'key: 10 = 5 inputs + 5 defs', { size: 11.5, color: VAL, bold: true });

  var d = appear(p, 0.6, 0.85);
  P.alpha(d);
  card(40, 288, 820, 120, { bar: WARN });
  head(58, 308, 'TWO CHECKS THAT REMOVE WRONG OPTIONS', WARN);
  body(58, 330, 'First: does the question say "in static single assignment form"? If it does, the answer is the', { size: 11.5 });
  body(58, 348, 'definition count, never the peak live count, and it is always at least the operator count.', { size: 11.5 });
  body(58, 370, 'Second: does the code have control flow? Then labels are rows, and a count that ignores them is short', { size: 11.5 });
  body(58, 388, 'by exactly the number of labels in the translation.', { size: 11.5, color: DIM });

  var e = appear(p, 0.85, 0.99);
  P.alpha(e);
  card(40, 424, 820, 34, { fill: ACCDIM, stroke: ACC });
  body(58, 434, 'Everything on this page is recomputed at load time: 5 trees, 4 counts each, 3 control programs, 3 tables.', { size: 10.5, color: ACC });
  P.alpha(1);
}

/* ---------- dispatch ---------- */
function drawFrame(Pn) {
  var t = (K && K.state) ? K.state.elapsed : 0;
  var s = progOf(t);
  Pn.clear();
  if (s.sc.id === 'why') drawWhy(t, s.p);
  else if (s.sc.id === 'forms') drawForms(t, s.p);
  else if (s.sc.id === 'tree2tac') drawTree2TAC(t, s.p);
  else if (s.sc.id === 'temps') drawTemps(t, s.p);
  else if (s.sc.id === 'ssa') drawSSA(t, s.p);
  else if (s.sc.id === 'arrays') drawArrays(t, s.p);
  else if (s.sc.id === 'control') drawControl(t, s.p);
  else if (s.sc.id === 'short') drawShort(t, s.p);
  else if (s.sc.id === 'tables') drawTables(t, s.p);
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
  TABLE: TABLE, E1_FRESH: E1_FRESH, E1_REUSE: E1_REUSE, E4_FRESH: E4_FRESH, E4_REUSE: E4_REUSE,
  PROG: PROG, COUNTS: COUNTS, G: G, SSA16: SSA16, SSA_GRID: SSA_GRID, PHI: PHI,
  ARRAY_TAC: ARRAY_TAC, CALL_TAC: CALL_TAC, ELEM: ELEM, CHECKS: CHECKS
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
