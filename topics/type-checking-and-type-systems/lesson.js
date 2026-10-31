/* ==========================================================================
   type-checking-and-type-systems — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model implements type expressions, structural and name equivalence,
   the compatibility and coercion relations, overload resolution, and a small
   syntax-directed type checker over thirteen programs. The drawing code reads
   the model and performs no type arithmetic of its own.
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
   Every number this lesson shows is computed here, from the definitions.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- type expressions ---------- */

var NEXT_ID = 1;
function stamp(o) { o.id = NEXT_ID++; return o; }

function B(n) { return stamp({ k: 'b', n: n }); }               // base type
function AR(n, t) { return stamp({ k: 'a', n: n, t: t }); }     // array(size, type)
function PT(t) { return stamp({ k: 'p', t: t }); }              // pointer(type)
function RC(tag, f) { return stamp({ k: 'r', tag: tag, f: f }); } // record(tag, [[name,type]])
function FN(ps, r) { return stamp({ k: 'f', ps: ps, r: r }); }  // function(params -> result)
var ERR = stamp({ k: 'e' });                                    // the error type

function show(t) {
  if (!t) return '?';
  switch (t.k) {
    case 'b': return t.n;
    case 'e': return 'type_error';
    case 'a': return 'array(' + t.n + ', ' + show(t.t) + ')';
    case 'p': return 'pointer(' + show(t.t) + ')';
    case 'r': return 'record(' + t.f.map(function (p) { return '(' + p[0] + ' \u00d7 ' + show(p[1]) + ')'; }).join(' \u00d7 ') + ')';
    case 'f': return '(' + t.ps.map(show).join(' \u00d7 ') + ') \u2192 ' + show(t.r);
  }
  return '?';
}

function size(t) {
  if (!t) return 0;
  switch (t.k) {
    case 'b': case 'e': return 1;
    case 'a': case 'p': return 1 + size(t.t);
    case 'r': return 1 + t.f.reduce(function (s, p) { return s + size(p[1]); }, 0);
    case 'f': return 1 + t.ps.reduce(function (s, x) { return s + size(x); }, 0) + size(t.r);
  }
  return 1;
}

/* ---------- structural equivalence ----------
   Same constructor, same size or arity, components equivalent recursively.
   The record tag is NOT compared; the field name IS. Pairs already under
   comparison are assumed equal, which is what makes a cyclic type terminate. */

function equiv(x, y, assume) {
  assume = assume || {};
  if (!x || !y) return false;
  if (x.k === 'e' || y.k === 'e') return true;          // error matches everything
  if (x === y) return true;
  var k = x.id + '~' + y.id;
  if (assume[k]) return true;
  if (x.k !== y.k) return false;
  var i;
  switch (x.k) {
    case 'b': return x.n === y.n;
    case 'a': assume[k] = 1; return x.n === y.n && equiv(x.t, y.t, assume);
    case 'p': assume[k] = 1; return equiv(x.t, y.t, assume);
    case 'r':
      if (x.f.length !== y.f.length) return false;
      assume[k] = 1;
      for (i = 0; i < x.f.length; i++) {
        if (x.f[i][0] !== y.f[i][0]) return false;
        if (!equiv(x.f[i][1], y.f[i][1], assume)) return false;
      }
      return true;
    case 'f':
      if (x.ps.length !== y.ps.length) return false;
      assume[k] = 1;
      for (i = 0; i < x.ps.length; i++) if (!equiv(x.ps[i], y.ps[i], assume)) return false;
      return equiv(x.r, y.r, assume);
  }
  return false;
}

/* ---------- name equivalence ----------
   Structural, but a record carries its identity in its tag as well. */

function nameEquiv(x, y, assume) {
  assume = assume || {};
  if (!x || !y) return false;
  if (x.k === 'e' || y.k === 'e') return true;
  if (x === y) return true;
  var k = 'n' + x.id + '~' + y.id;
  if (assume[k]) return true;
  if (x.k !== y.k) return false;
  var i;
  switch (x.k) {
    case 'b': return x.n === y.n;
    case 'a': assume[k] = 1; return x.n === y.n && nameEquiv(x.t, y.t, assume);
    case 'p': assume[k] = 1; return nameEquiv(x.t, y.t, assume);
    case 'r':
      if (x.tag !== y.tag || x.f.length !== y.f.length) return false;
      assume[k] = 1;
      for (i = 0; i < x.f.length; i++) {
        if (x.f[i][0] !== y.f[i][0]) return false;
        if (!nameEquiv(x.f[i][1], y.f[i][1], assume)) return false;
      }
      return true;
    case 'f':
      if (x.ps.length !== y.ps.length) return false;
      assume[k] = 1;
      for (i = 0; i < x.ps.length; i++) if (!nameEquiv(x.ps[i], y.ps[i], assume)) return false;
      return nameEquiv(x.r, y.r, assume);
  }
  return false;
}

/* ---------- the nine declarations ----------
   Two synonyms of int, three records, and four pointer types. Fresh objects
   everywhere, so nothing is equal by identity. */

var DECLS = [
  { n: 'Meters',   d: 'typedef int Meters;',    t: B('int') },
  { n: 'Seconds',  d: 'typedef int Seconds;',   t: B('int') },
  { n: 'point',    d: 'struct point {int x, y;}', t: RC('point', [['x', B('int')], ['y', B('int')]]) },
  { n: 'vec',      d: 'struct vec {int x, y;}',   t: RC('vec',   [['x', B('int')], ['y', B('int')]]) },
  { n: 'pt2',      d: 'struct pt2 {float x, y;}', t: RC('pt2',   [['x', B('float')], ['y', B('float')]]) },
  { n: 'intp',     d: 'int *',                    t: PT(B('int')) },
  { n: 'Metersp',  d: 'Meters *',                 t: PT(B('int')) },
  { n: 'pointp',   d: 'struct point *',           t: PT(RC('point', [['x', B('int')], ['y', B('int')]])) },
  { n: 'vecp',     d: 'struct vec *',             t: PT(RC('vec',   [['x', B('int')], ['y', B('int')]])) }
];

/* partition the declarations by a predicate, returning an array of arrays of names */
function partition(eq) {
  var cls = [], i, j, placed;
  for (i = 0; i < DECLS.length; i++) {
    placed = false;
    for (j = 0; j < cls.length; j++) {
      if (eq(DECLS[cls[j][0]].t, DECLS[i].t)) { cls[j].push(i); placed = true; break; }
    }
    if (!placed) cls.push([i]);
  }
  return cls.map(function (g) { return g.map(function (ix) { return DECLS[ix].n; }); });
}

var STRUCT_CLASSES = partition(function (a, b) { return equiv(a, b); });
var NAME_CLASSES = partition(function (a, b) { return nameEquiv(a, b); });

/* unordered pairs over the nine declarations */
var PAIRS = { total: 0, agree: 0, differ: 0, differing: [] };
(function () {
  var i, j, s, nm;
  for (i = 0; i < DECLS.length; i++) {
    for (j = i + 1; j < DECLS.length; j++) {
      s = equiv(DECLS[i].t, DECLS[j].t);
      nm = nameEquiv(DECLS[i].t, DECLS[j].t);
      PAIRS.total++;
      if (s === nm) PAIRS.agree++;
      else { PAIRS.differ++; PAIRS.differing.push(DECLS[i].n + ' / ' + DECLS[j].n); }
    }
  }
})();

/* ---------- the widening chain and the compatibility relations ---------- */

var NUM = ['char', 'short', 'int', 'long', 'float', 'double'];
function isNum(t) { return t && t.k === 'b' && NUM.indexOf(t.n) >= 0; }
function rank(t) { return t && t.k === 'b' ? NUM.indexOf(t.n) : -1; }

function identical(a, b) { return show(a) === show(b); }
function widens(from, to) {                    // may be coerced silently
  if (!from || !to) return false;
  if (from.k === 'e' || to.k === 'e') return true;
  if (identical(from, to)) return true;
  return isNum(from) && isNum(to) && rank(to) > rank(from);
}
function assignable(from, to, strict) { return strict ? identical(from, to) : widens(from, to); }

var GRID = (function () {
  var base = ['int', 'float', 'bool'], out = { strict: 0, coercing: 0, cells: [] };
  base.forEach(function (a) {
    var row = [];
    base.forEach(function (b) {
      var t1 = B(a), t2 = B(b);
      var st = assignable(t1, t2, true) ? 1 : 0;
      var co = assignable(t1, t2, false) ? 1 : 0;
      row.push({ from: a, to: b, strict: st, coercing: co });
      out.strict += st; out.coercing += co;
    });
    out.cells.push(row);
  });
  return out;
})();

/* ---------- overload resolution ---------- */

var OVERLOADS = [
  { name: 'f', sig: FN([B('int'), B('float')], B('bool')) },
  { name: 'f', sig: FN([B('float'), B('int')], B('bool')) }
];

function resolve(args) {                        // args: array of types
  var applicable = [], exact = [];
  OVERLOADS.forEach(function (o, i) {
    if (o.sig.ps.length !== args.length) return;
    var ok = true, ex = true;
    o.sig.ps.forEach(function (p, k) {
      if (!widens(args[k], p)) ok = false;
      if (!identical(args[k], p)) ex = false;
    });
    if (ok) applicable.push(i);
    if (ok && ex) exact.push(i);
  });
  if (exact.length) return { kind: 'exact', pick: exact[0], applicable: applicable };
  if (applicable.length === 1) return { kind: 'unique', pick: applicable[0], applicable: applicable };
  if (applicable.length > 1) return { kind: 'ambiguous', pick: null, applicable: applicable };
  return { kind: 'none', pick: null, applicable: [] };
}

var RES_CASES = [
  { args: [B('int'), B('float')], label: '(int, float)' },
  { args: [B('int'), B('int')],   label: '(int, int)' },
  { args: [B('int'), B('bool')],  label: '(int, bool)' }
];
RES_CASES.forEach(function (c) { c.result = resolve(c.args); });

/* ---------- a small syntax-directed type checker ----------
   One synthesized attribute, type. The error type matches everything, which is
   what stops a single mistake producing a cascade of messages. */

function isBool(t) { return t && t.k === 'b' && t.n === 'bool'; }
function isInt(t) { return t && t.k === 'b' && t.n === 'int'; }
function isNumeric(t) { return isNum(t); }
function wider(a, b) {
  if (!isNumeric(a) || !isNumeric(b)) return ERR;
  return rank(a) >= rank(b) ? a : b;
}

function newEnv() {
  return {
    x: B('int'), y: B('float'), b: B('bool'), i: B('int'),
    p: AR(4, B('int')), q: B('int'), r: PT(B('int')),
    s: B('str')
  };
}

function sigOf(env, name) {
  if (name === 'f') return FN([B('int'), B('float')], B('bool'));
  return null;
}

/* returns a type; pushes {node, why} into st.msgs on failure */
function checkExpr(e, env, st) {
  function fail(node, why) { st.msgs.push({ node: node, why: why }); return ERR; }
  var L, R, C, A, Bv, sig, i;

  switch (e.k) {
    case 'num': return B(e.t);
    case 'id':
      if (!env[e.n]) return fail(e.n, 'undeclared name ' + e.n);
      return env[e.n];

    case 'bin':
      L = checkExpr(e.l, env, st);
      R = checkExpr(e.r, env, st);
      if (e.op === '<') {
        if (isNumeric(L) && isNumeric(R)) return B('bool');
        return fail(e.op, e.op + ' needs two numeric operands');
      }
      if (isNumeric(L) && isNumeric(R)) return wider(L, R);
      return fail(e.op, e.op + ' applied to ' + show(L) + ' and ' + show(R));

    case 'if':
      C = checkExpr(e.c, env, st);
      A = checkExpr(e.a, env, st);
      Bv = checkExpr(e.b, env, st);
      if (!isBool(C)) return fail('if', 'condition is ' + show(C) + ', not bool');
      if (!assignable(A, Bv, st.strict) && !assignable(Bv, A, st.strict)) {
        return fail('if', 'branches ' + show(A) + ' and ' + show(Bv) + ' are not compatible');
      }
      return wider(A, Bv);

    case 'index':
      L = checkExpr(e.base, env, st);
      R = checkExpr(e.idx, env, st);
      if (!L || L.k !== 'a') return fail('index', 'indexing ' + show(L) + ', not an array');
      if (!isInt(R)) return fail('index', 'subscript is ' + show(R) + ', not int');
      return L.t;

    case 'deref':
      L = checkExpr(e.e, env, st);
      if (!L || L.k !== 'p') return fail('deref', 'dereferencing ' + show(L) + ', not a pointer');
      return L.t;

    case 'assign':
      if (!env[e.n]) return fail('assign', 'undeclared name ' + e.n);
      R = checkExpr(e.e, env, st);
      if (!assignable(R, env[e.n], st.strict)) {
        return fail('assign', show(R) + ' is not assignable to ' + e.n + ' : ' + show(env[e.n]));
      }
      return env[e.n];

    case 'call':
      sig = sigOf(env, e.f);
      if (!sig) return fail('call', 'no such function ' + e.f);
      if (sig.ps.length !== e.args.length) {
        return fail('call', 'arity ' + e.args.length + ' against ' + sig.ps.length + ' parameters');
      }
      for (i = 0; i < e.args.length; i++) {
        var at = checkExpr(e.args[i], env, st);
        if (!assignable(at, sig.ps[i], st.strict)) {
          return fail('call', 'argument ' + (i + 1) + ' is ' + show(at) + ', parameter is ' + show(sig.ps[i]));
        }
      }
      return sig.r;

    case 'cast':
      checkExpr(e.e, env, st);
      return e.to;
  }
  return fail('?', 'no rule for this node');
}

/* shorthand AST builders */
function N(t) { return { k: 'num', t: t }; }
function Nv(t, v) { return { k: 'num', t: t, v: v }; }
function ID(n) { return { k: 'id', n: n }; }
function BIN(op, l, r) { return { k: 'bin', op: op, l: l, r: r }; }
function IF(c, a, b) { return { k: 'if', c: c, a: a, b: b }; }
function IDX(b, i) { return { k: 'index', base: b, idx: i }; }
function DREF(e) { return { k: 'deref', e: e }; }
function ASG(n, e) { return { k: 'assign', n: n, e: e }; }
function CALL(f, args) { return { k: 'call', f: f, args: args }; }
function CAST(t, e) { return { k: 'cast', to: t, e: e }; }

/* thirteen programs, each with the verdict the definitions give it */
var PROGRAMS = [
  { id: 'P1',  src: 'x + 1',              e: BIN('+', ID('x'), N('int')),        ok: true,  ty: 'int' },
  { id: 'P2',  src: 'x + b',              e: BIN('+', ID('x'), ID('b')),         ok: false, ty: 'type_error' },
  { id: 'P3',  src: 'if b then 1 else 2.0', e: IF(ID('b'), N('int'), N('float')), ok: true, ty: 'float', strictOk: false },
  { id: 'P4',  src: 'if x then 1 else 2', e: IF(ID('x'), N('int'), N('int')),    ok: false, ty: 'type_error' },
  { id: 'P5',  src: 'p[i]',               e: IDX(ID('p'), ID('i')),              ok: true,  ty: 'int' },
  { id: 'P6',  src: 'p[y]',               e: IDX(ID('p'), ID('y')),              ok: false, ty: 'type_error' },
  { id: 'P7',  src: '*q',                 e: DREF(ID('q')),                      ok: false, ty: 'type_error' },
  { id: 'P8',  src: '*r',                 e: DREF(ID('r')),                      ok: true,  ty: 'int' },
  { id: 'P9',  src: 'f(1, 2.0)',          e: CALL('f', [N('int'), N('float')]),  ok: true,  ty: 'bool' },
  { id: 'P10', src: 'f(1)',               e: CALL('f', [N('int')]),              ok: false, ty: 'type_error' },
  { id: 'P11', src: 'f(1, 2)',            e: CALL('f', [N('int'), N('int')]),    ok: true,  ty: 'bool', strictOk: false },
  { id: 'P12', src: 'x = 2.5',            e: ASG('x', N('float')),               ok: false, ty: 'type_error' },
  { id: 'P13', src: 'y = 2',              e: ASG('y', N('int')),                 ok: true,  ty: 'float', strictOk: false }
];

function runPrograms(strict) {
  return PROGRAMS.map(function (p) {
    var st = { msgs: [], strict: !!strict };
    var t = checkExpr(p.e, newEnv(), st);
    var ok = st.msgs.length === 0 && t.k !== 'e';
    return { id: p.id, src: p.src, ok: ok, ty: show(t), msgs: st.msgs };
  });
}
var RUN_COERCE = runPrograms(false);
var RUN_STRICT = runPrograms(true);

function agrees(run, strict) {
  var bad = [];
  PROGRAMS.forEach(function (p, i) {
    var want = strict && p.strictOk === false ? false : p.ok;
    if (run[i].ok !== want) bad.push(p.id);
  });
  return bad;
}

/* ---------- the poison type, counted on one tree ---------- */

var POISON_TREE = BIN('/', BIN('-', BIN('*', BIN('+', ID('x'), ID('z')), N('int')), N('int')), N('int'));
var POISON_ENV = { x: B('int'), z: B('bool') };

function poisonRun(poison) {
  /* poison on  : error matches everything, so the first failure is the only one
     poison off : error matches nothing, so every operator above it fails too */
  var msgs = [];
  function fail(why) { msgs.push(why); return ERR; }
  function go(e) {
    var L, R;
    switch (e.k) {
      case 'num': return B(e.t);
      case 'id': return POISON_ENV[e.n] || ERR;
      case 'bin':
        L = go(e.l); R = go(e.r);
        var Lbad = L.k === 'e', Rbad = R.k === 'e';
        if (!poison && (Lbad || Rbad)) return fail('operand is type_error');
        if (Lbad || Rbad) return ERR;
        if (isNumeric(L) && isNumeric(R)) return wider(L, R);
        return fail('arithmetic on ' + show(L) + ' and ' + show(R));
    }
    return ERR;
  }
  go(POISON_TREE);
  return msgs.length;
}
var POISON_ON = poisonRun(true);
var POISON_OFF = poisonRun(false);

/* ---------- sound but incomplete: two witnesses ---------- */

var ACCEPT_FAIL = (function () {
  /* p[5] where p is array(4, int): the type rule only asks that the subscript be
     an int, so the checker accepts; the access is out of bounds at run time. */
  var st = { msgs: [], strict: false };
  var idxNode = Nv('int', 5);
  var t = checkExpr(IDX(ID('p'), idxNode), newEnv(), st);
  var arr = newEnv().p;
  return { accepted: st.msgs.length === 0, index: idxNode.v, length: arr.n, type: show(t) };
})();

var REJECT_RUN = (function () {
  /* if true then x = 1 else x = "s": the branches are incompatible, so the
     checker rejects; the condition is the literal true, so the else branch never
     runs and no type error could ever occur. */
  var st = { msgs: [], strict: false };
  var t = checkExpr(IF({ k: 'num', t: 'bool', v: true }, ASG('x', N('int')), ASG('x', N('str'))), newEnv(), st);
  return { rejected: st.msgs.length > 0, elseReachable: false, type: show(t), why: st.msgs[0] ? st.msgs[0].why : '' };
})();

/* ---------- the recursive type ---------- */

var CYCLE = (function () {
  var a = RC('node', [['info', B('int')], ['next', PT(null)]]);
  a.f[1][1].t = a;                                  // next : pointer(node)
  var b = RC('node', [['info', B('int')], ['next', PT(null)]]);
  b.f[1][1].t = b;
  var c = RC('other', [['info', B('int')], ['next', PT(null)]]);
  c.f[1][1].t = c;
  return { a: a, b: b, c: c };
})();

/* ---------- the type-expression sizes shown in scene 2 ---------- */

var SIZES = {
  arr: AR(10, B('int')),
  ptr: PT(B('char')),
  rec: RC('point', [['x', B('int')], ['y', B('int')]]),
  fn: FN([B('int'), B('float')], B('bool'))
};
var SIZE_ROWS = [
  { s: show(SIZES.arr), n: size(SIZES.arr) },
  { s: show(SIZES.ptr), n: size(SIZES.ptr) },
  { s: show(SIZES.rec), n: size(SIZES.rec) },
  { s: show(SIZES.fn),  n: size(SIZES.fn) }
];

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* --- type expressions --- */
chk('size(array(10,int)) = 2', size(SIZES.arr) === 2, size(SIZES.arr));
chk('size(pointer(char)) = 2', size(SIZES.ptr) === 2, size(SIZES.ptr));
chk('size(record of two int fields) = 3', size(SIZES.rec) === 3, size(SIZES.rec));
chk('size((int x float) -> bool) = 4', size(SIZES.fn) === 4, size(SIZES.fn));
chk('array length is part of the type: array(10,int) = array(10,int) but not array(20,int)',
    equiv(SIZES.arr, AR(10, B('int'))) && !equiv(SIZES.arr, AR(20, B('int'))));

/* --- structural equivalence --- */
chk('structural: point and vec (same fields, different tags) are equal',
    equiv(DECLS[2].t, DECLS[3].t));
chk('structural: renaming a field breaks equality',
    !equiv(RC('a', [['x', B('int')]]), RC('b', [['u', B('int')]])));
chk('structural: differing field types break equality',
    !equiv(DECLS[2].t, DECLS[4].t));
chk('structural: pointer types follow their pointee', equiv(DECLS[7].t, DECLS[8].t));
chk('structural: a cyclic type terminates and matches its twin', equiv(CYCLE.a, CYCLE.b));

/* --- name equivalence --- */
chk('name: point and vec are different types', !nameEquiv(DECLS[2].t, DECLS[3].t));
chk('name: pointer to point and pointer to vec differ too', !nameEquiv(DECLS[7].t, DECLS[8].t));
chk('name: a typedef is not a new type (Meters = int)', nameEquiv(DECLS[0].t, B('int')));
chk('name: Meters and Seconds are the same type', nameEquiv(DECLS[0].t, DECLS[1].t));
chk('name: a cyclic type terminates and matches its twin', nameEquiv(CYCLE.a, CYCLE.b));
chk('name: a cyclic type with a different tag is rejected', !nameEquiv(CYCLE.a, CYCLE.c));

/* --- the two partitions --- */
chk('structure gives five classes over the nine declarations', STRUCT_CLASSES.length === 5, STRUCT_CLASSES.length);
chk('name gives seven classes over the nine declarations', NAME_CLASSES.length === 7, NAME_CLASSES.length);
chk('name equivalence refines structural equivalence',
    NAME_CLASSES.every(function (g) {
      return STRUCT_CLASSES.some(function (h) { return g.every(function (n) { return h.indexOf(n) >= 0; }); });
    }));
chk('34 of the 36 unordered pairs agree, 2 differ', PAIRS.agree === 34 && PAIRS.differ === 2, PAIRS.agree + '/' + PAIRS.differ);
chk('the two differing pairs are the record pair and the pointer pair',
    PAIRS.differing.length === 2 && PAIRS.differing.join(', ').indexOf('point / vec') >= 0);

/* --- compatibility and coercion --- */
chk('strict assignment allows 3 of 9 pairs', GRID.strict === 3, GRID.strict);
chk('coercing assignment allows 4 of 9 pairs', GRID.coercing === 4, GRID.coercing);
chk('int widens to float', widens(B('int'), B('float')));
chk('float does not widen to int', !widens(B('float'), B('int')));
chk('bool is not numeric, so it coerces to nothing', !widens(B('bool'), B('int')) && !widens(B('bool'), B('float')));

/* --- overload resolution --- */
chk('(int, float) matches one overload exactly',
    RES_CASES[0].result.kind === 'exact' && RES_CASES[0].result.applicable.length === 1);
chk('(int, int) is ambiguous: both overloads need one widening',
    RES_CASES[1].result.kind === 'ambiguous' && RES_CASES[1].result.applicable.length === 2);
chk('(int, bool) matches no overload', RES_CASES[2].result.kind === 'none');

/* --- the checker against its thirteen programs --- */
chk('checker verdicts match on all 13 programs, coercing mode',
    agrees(RUN_COERCE, false).length === 0, agrees(RUN_COERCE, false).join(','));
chk('checker verdicts match on all 13 programs, strict mode',
    agrees(RUN_STRICT, true).length === 0, agrees(RUN_STRICT, true).join(','));
chk('the two modes differ on exactly three programs: the two widening cases and the branch mix',
    RUN_COERCE.filter(function (r, i) { return r.ok !== RUN_STRICT[i].ok; }).length === 3,
    RUN_COERCE.filter(function (r, i) { return r.ok !== RUN_STRICT[i].ok; }).map(function (r) { return r.id; }).join(','));
chk('if b then 1 else 2.0 has type float, the wider branch',
    RUN_COERCE[2].ok && RUN_COERCE[2].ty === 'float');
chk('f(1, 2) is accepted because int widens to the float parameter', RUN_COERCE[10].ok);
chk('x = 2.5 is rejected in both modes: narrowing is not a coercion',
    !RUN_COERCE[11].ok && !RUN_STRICT[11].ok);

/* --- the poison type --- */
chk('with the error type, one mistake gives one message', POISON_ON === 1, POISON_ON);
chk('without it, the four operators above the mistake all fail', POISON_OFF === 4, POISON_OFF);
chk('the poison removes exactly the three cascade messages', POISON_OFF - POISON_ON === 3);

/* --- sound but incomplete --- */
chk('the checker accepts p[5] although the array holds four elements',
    ACCEPT_FAIL.accepted && ACCEPT_FAIL.index >= ACCEPT_FAIL.length);
chk('the checker rejects the incompatible branch although the else never runs',
    REJECT_RUN.rejected && REJECT_RUN.elseReachable === false);

/* ======================================================================
   LAYER 3 - RENDER
   Reads the model. Performs no type arithmetic of its own.
   ====================================================================== */

function prog(t) { return K && K.sceneProgress ? K.sceneProgress(t) : 1; }

function head(t1, t2) {
  P.alpha(1);
  P.text(30, 14, t1, { size: 16, bold: true, color: INK });
  if (t2) P.text(30, 36, t2, { size: 12.5, color: DIM });
}

function panel(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1.2, radius: 6 });
}

function label(x, y, s, o) {
  o = o || {};
  P.text(x, y, s, { size: o.size || 12, color: o.color || DIM, bold: !!o.bold, mono: !!o.mono, align: o.align || 'left' });
}

function tbl(x, y, cols, rows, o) {
  o = o || {};
  var rh = o.rh || 19, total = 0, i, j;
  for (i = 0; i < cols.length; i++) total += cols[i].w;
  P.rect(x, y, total, rh * (rows.length + 1), { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: 1 });
  P.rect(x, y, total, rh, { fill: o.headFill || SURF2, stroke: o.stroke || BORDER, sw: 1 });
  var cx = x;
  for (i = 0; i < cols.length; i++) {
    label(cx + 6, y + 5, cols[i].name, { size: o.size || 11.5, bold: true, color: INK });
    cx += cols[i].w;
    if (i < cols.length - 1) P.line(cx, y, cx, y + rh * (rows.length + 1), { stroke: o.stroke || BORDER, sw: 0.8 });
  }
  for (j = 0; j < rows.length; j++) {
    var ry = y + rh * (j + 1);
    if (o.rowFill && o.rowFill[j]) P.rect(x, ry, total, rh, { fill: o.rowFill[j] });
    cx = x;
    for (i = 0; i < cols.length; i++) {
      label(cx + 6, ry + 5, String(rows[j][i] === undefined ? '' : rows[j][i]),
        { size: o.size || 11.5, color: (o.rowColor && o.rowColor[j]) || INK, mono: !!o.mono });
      cx += cols[i].w;
    }
    P.line(x, ry, x + total, ry, { stroke: o.stroke || BORDER, sw: 0.6 });
  }
}

function chip(x, y, text, colour) {
  var w = Math.max(44, text.length * 6.6 + 14);
  P.rect(x, y, w, 19, { fill: colour + '22', stroke: colour, sw: 1, radius: 9 });
  P.text(x + w / 2, y + 4, text, { size: 11, bold: true, color: colour, align: 'center' });
  return w;
}

function tick(x, y, ok) {
  P.circle(x, y, 7, { fill: ok ? VAL : BAD, stroke: null });
  P.text(x, y - 5, ok ? '\u2713' : '\u2717', { size: 11, bold: true, color: '#ffffff', align: 'center' });
}

/* ---------- scene 1: position ---------- */
function drawPosition(t) {
  var p = prog(t);
  head('Where the type checker sits, and what it is asked',
       'After the parser, before intermediate code: it reads a tree and writes types onto it');

  var boxes = ['source', 'tokens', 'parse tree', 'TYPE CHECK', 'annotated tree', 'intermediate code'];
  var bw = 125, gap = 20, x0 = 30, y0 = 74;
  for (var i = 0; i < boxes.length; i++) {
    var x = x0 + i * (bw + gap);
    var hot = i === 3;
    panel(x, y0, bw, 40, { fill: hot ? ACCDIM : SURF2, stroke: hot ? ACC : BORDER, sw: hot ? 2 : 1.2 });
    label(x + bw / 2, y0 + 13, boxes[i], { size: 11.5, bold: true, align: 'center', color: hot ? ACC : INK });
    if (i < boxes.length - 1) P.arrow(x + bw + 3, y0 + 20, x + bw + gap - 4, y0 + 20, { stroke: DIM, sw: 1.2 });
  }
  label(x0, y0 - 16, 'the pipeline, left to right', { size: 11, color: FAINT });

  if (p > 0.3) {
    panel(30, 140, 400, 104, { fill: SURF });
    label(44, 152, 'What the checker needs', { size: 12.5, bold: true, color: INK });
    label(44, 174, 'a syntax tree, so parsing must already be done', { size: 11.5, color: INK });
    label(44, 194, 'a symbol table: each name and its declared type', { size: 11.5, color: INK });
    label(44, 214, 'the type rules of the language, one per construct', { size: 11.5, color: INK });
    label(44, 232, 'compatibility: what may be converted to what', { size: 11.5, color: INK });

    panel(470, 140, 400, 104, { fill: SURF });
    label(484, 152, 'What it produces', { size: 12.5, bold: true, color: INK });
    label(484, 174, 'the same tree, with a type on every expression', { size: 11.5, color: INK });
    label(484, 194, 'a list of type errors, each at one node', { size: 11.5, color: INK });
    label(484, 214, 'conversions inserted where the rules allow them', { size: 11.5, color: INK });
    label(484, 232, 'or the error type, where a rule could not fire', { size: 11.5, color: INK });
  }

  if (p > 0.55) {
    panel(30, 262, 400, 84, { fill: SURF });
    chip(44, 274, 'GATE CSE 2018', ACC);
    label(44, 302, 'Which statement is FALSE?  "Type checking is done before parsing."', { size: 11.5, color: INK });
    label(44, 322, 'That statement is the false one.', { size: 11.5, color: DIM });
  }
  if (p > 0.75) {
    panel(470, 262, 400, 84, { fill: SURF });
    chip(484, 274, 'GATE CSE 1998', ACC);
    label(484, 302, '"Type checking is normally done during ..."', { size: 11.5, color: INK });
    label(484, 322, 'Semantic analysis. The same fact, twenty years earlier.', { size: 11.5, color: DIM });

    panel(30, 360, 840, 76, { fill: SURF2 });
    label(44, 372, 'The one-line version worth keeping', { size: 12.5, bold: true, color: INK });
    label(44, 396, 'Type checking is the activity of ensuring that the operands of an operator are of compatible types,', { size: 11.5, color: INK });
    label(44, 416, 'where a compatible type is legal for the operator or convertible to one that is.', { size: 11.5, color: DIM });
  }
}

/* ---------- scene 2: type expressions ---------- */
function drawTypeExpr(t) {
  var p = prog(t);
  head('Type expressions: a tree that describes values, not syntax',
       'A base type, or a constructor applied to type expressions \u2014 and the size is part of the type');

  var rows = [
    { y: 70,  txt: 'array(10, int)',     note: 'ten elements, each an int' },
    { y: 134, txt: 'pointer(char)',      note: 'a pointer to a char' },
    { y: 198, txt: 'record((x \u00d7 int) \u00d7 (y \u00d7 int))', note: 'two named fields' },
    { y: 262, txt: '(int \u00d7 float) \u2192 bool', note: 'a function type' }
  ];
  rows.forEach(function (r, i) {
    if (p < 0.1 * (i + 1)) return;
    panel(30, r.y, 430, 52, { fill: SURF });
    label(44, r.y + 10, r.txt, { size: 12.5, mono: true, color: ACC, bold: true });
    label(44, r.y + 30, r.note, { size: 11.5, color: DIM });
    label(376, r.y + 30, 'size ' + SIZE_ROWS[i].n, { size: 11.5, color: INK, align: 'right' });
  });

  if (p > 0.45) {
    panel(480, 70, 390, 150, { fill: SURF2 });
    label(494, 82, 'The four constructors', { size: 12.5, bold: true, color: INK });
    label(494, 106, 'array(size, type)', { size: 11.5, mono: true, color: INK });
    label(494, 126, 'pointer(type)', { size: 11.5, mono: true, color: INK });
    label(494, 146, 'record(name \u00d7 type, ...)', { size: 11.5, mono: true, color: INK });
    label(494, 166, 'function(product of types \u2192 type)', { size: 11.5, mono: true, color: INK });
    label(494, 196, 'Size is counted as nodes, so it is a fact about the', { size: 11.5, color: DIM });
    label(494, 212, 'type, not about the machine.', { size: 11.5, color: DIM });
  }

  if (p > 0.7) {
    panel(480, 236, 390, 110, { fill: INVALIDDIM });
    label(494, 248, 'A type expression is not a syntax tree', { size: 12.5, bold: true, color: INK });
    label(494, 272, '2 + 3 as syntax: a plus node with two literal children.', { size: 11.5, color: INK });
    label(494, 292, '2 + 3 as a type: int. One node. Nothing about addition.', { size: 11.5, color: INK });
    label(494, 316, 'The checker keeps its own representation of types, because', { size: 11.5, color: DIM });
    label(494, 332, 'types may say more than the source does.', { size: 11.5, color: DIM });

    panel(30, 330, 430, 100, { fill: SURF });
    label(44, 342, 'Why the array length matters', { size: 12.5, bold: true, color: INK });
    label(44, 366, 'array(10, int) and array(20, int) are different types.', { size: 11.5, color: INK });
    label(44, 386, 'The length is one of the two components the comparison', { size: 11.5, color: DIM });
    label(44, 404, 'must check, so it belongs to the type, not to the value.', { size: 11.5, color: DIM });
  }
}

/* ---------- scene 3: structural equivalence ---------- */
function drawStructural(t) {
  var p = prog(t);
  head('Structural equivalence: same shape, recursively',
       'Walk both type expressions together; compare constructors, sizes, field names and components');

  var left = ['record', 'x : int', 'y : int'];
  var right = ['record', 'x : int', 'y : int'];
  if (p > 0.28) {
    panel(30, 74, 240, 118, { fill: SURF });
    label(44, 84, 'struct point', { size: 11.5, bold: true, color: INK });
    left.forEach(function (s, i) {
      label(44, 106 + i * 22, (i ? '\u00b7 ' : '') + s, { size: 11.5, mono: true, color: i ? DIM : ACC });
    });
    panel(300, 74, 240, 118, { fill: SURF });
    label(314, 84, 'struct vec', { size: 11.5, bold: true, color: INK });
    right.forEach(function (s, i) {
      label(314, 106 + i * 22, (i ? '\u00b7 ' : '') + s, { size: 11.5, mono: true, color: i ? DIM : ACC });
    });
    label(270, 128, '=', { size: 20, bold: true, color: VAL, align: 'center' });
  }

  if (p > 0.42) {
    var steps = [
      ['constructor', 'record = record', true],
      ['field count', '2 = 2', true],
      ['field name', 'x = x, y = y', true],
      ['field type', 'int = int', true]
    ];
    panel(580, 74, 290, 118, { fill: SURF2 });
    label(594, 84, 'the comparison, in order', { size: 11.5, bold: true, color: INK });
    steps.forEach(function (s, i) {
      tick(600, 108 + i * 22, s[2]);
      label(616, 102 + i * 22, s[0] + ':  ' + s[1], { size: 11.5, color: INK });
    });
    label(594, 184, 'the tag "point" was never compared', { size: 11, color: VAL });
  }

  if (p > 0.6) {
    panel(30, 208, 420, 104, { fill: INVALIDDIM });
    label(44, 220, 'Rename a field and equality is lost', { size: 12.5, bold: true, color: INK });
    label(44, 244, 'record((x \u00d7 int))  against  record((u \u00d7 int))', { size: 11.5, mono: true, color: INK });
    label(44, 268, 'Aho writes a record as a product of field name and field', { size: 11.5, color: DIM });
    label(44, 286, 'type, so the label is part of the type expression.', { size: 11.5, color: DIM });

    panel(470, 208, 400, 104, { fill: SURF });
    label(484, 220, 'A cyclic type would loop forever', { size: 12.5, bold: true, color: INK });
    label(484, 244, 'struct node { int info; struct node *next; }', { size: 11.5, mono: true, color: INK });
    label(484, 268, 'Mark each pair already under comparison and treat a', { size: 11.5, color: DIM });
    label(484, 286, 'repeat as provisionally equal. The walk then ends.', { size: 11.5, color: DIM });
  }

  if (p > 0.8) {
    panel(30, 328, 840, 108, { fill: SURF2 });
    label(44, 340, 'The algorithm, in four lines', { size: 12.5, bold: true, color: INK });
    label(44, 364, '1. both are base types: equal iff the same base type', { size: 11.5, mono: true, color: INK });
    label(44, 384, '2. both are the same constructor: compare size or arity, then every component', { size: 11.5, mono: true, color: INK });
    label(44, 404, '3. records: compare field names, then field types', { size: 11.5, mono: true, color: INK });
    label(44, 424, '4. anything else: not equivalent \u2014 and a pair already on the stack counts as equal', { size: 11.5, mono: true, color: INK });
  }
}

/* ---------- scene 4: name equivalence ---------- */
function drawName(t) {
  var p = prog(t);
  head('Name equivalence, the typedef rule, and what C does',
       'Nine declarations, partitioned twice: by structure, and by name');

  if (p > 0.2) {
    var rows = DECLS.map(function (d) { return [d.n, d.d]; });
    tbl(30, 66, [{ name: 'declaration', w: 104 }, { name: 'written as', w: 176 }], rows, { rh: 18, size: 11 });
  }

  if (p > 0.4) {
    panel(330, 66, 262, 200, { fill: SURF2 });
    label(344, 76, 'structure: ' + STRUCT_CLASSES.length + ' classes', { size: 12, bold: true, color: VAL });
    STRUCT_CLASSES.forEach(function (g, i) {
      label(344, 100 + i * 30, g.join(' = '), { size: 11, color: INK });
    });
    label(344, 248, 'point = vec, and pointp = vecp', { size: 11, color: DIM });
  }

  if (p > 0.55) {
    panel(610, 66, 260, 200, { fill: SURF2 });
    label(624, 76, 'name: ' + NAME_CLASSES.length + ' classes', { size: 12, bold: true, color: INFO });
    NAME_CLASSES.forEach(function (g, i) {
      label(624, 98 + i * 23, g.join(' = '), { size: 11, color: INK });
    });
    label(624, 252, 'typedef adds no type', { size: 10.5, color: DIM });
  }

  if (p > 0.68) {
    panel(30, 282, 420, 72, { fill: SURF });
    label(44, 292, 'The count over all pairs', { size: 12, bold: true, color: INK });
    label(44, 314, PAIRS.total + ' unordered pairs: ' + PAIRS.agree + ' agree, ' + PAIRS.differ + ' differ.', { size: 11.5, color: INK });
    label(44, 334, 'They differ on: ' + PAIRS.differing.join('   and   '), { size: 11.5, color: WARN });

    panel(470, 282, 400, 72, { fill: SURF });
    label(484, 292, 'A typedef is not a new type', { size: 12, bold: true, color: INK });
    label(484, 314, 'typedef int Meters; makes Meters another spelling of int,', { size: 11.5, color: INK });
    label(484, 334, 'so even name equivalence keeps it equal to int.', { size: 11.5, color: DIM });
  }

  if (p > 0.82) {
    panel(30, 366, 840, 70, { fill: SURF });
    label(44, 376, "C's rule: structural everywhere, except struct and union, where the tag is the identity", { size: 12, bold: true, color: ACC });
    label(44, 400, 'Two structs with identical members and different tags are different types;', { size: 11.5, color: INK });
    label(44, 420, 'two pointer or array types built from the same components are the same type.', { size: 11.5, color: DIM });
  }
}

/* ---------- scene 5: static against dynamic ---------- */
function drawStaticDynamic(t) {
  var p = prog(t);
  head('Static against dynamic, strong against weak: two questions',
       'When a type is checked is not the same question as whether every type error is caught');

  if (p > 0.18) {
    label(300, 68, 'checked before execution', { size: 11.5, bold: true, color: DIM, align: 'center' });
    label(620, 68, 'checked during execution', { size: 11.5, bold: true, color: DIM, align: 'center' });
    label(210, 150, 'no type error', { size: 11.5, bold: true, color: DIM, align: 'center' });
    label(210, 170, 'can slip through', { size: 11.5, bold: true, color: DIM, align: 'center' });
    label(210, 330, 'errors are', { size: 11.5, bold: true, color: DIM, align: 'center' });
    label(210, 350, 'guaranteed caught', { size: 11.5, bold: true, color: DIM, align: 'center' });

    var cells = [
      { x: 270, y: 90,  w: 260, h: 140, name: 'Java', sub: 'static, strong', fill: SURF2, c: VAL },
      { x: 560, y: 90,  w: 260, h: 140, name: 'C', sub: 'static, weak: unions, casts', fill: INVALIDDIM, c: BAD },
      { x: 270, y: 250, w: 260, h: 140, name: 'Python', sub: 'dynamic, strong', fill: SURF2, c: VAL },
      { x: 560, y: 250, w: 260, h: 140, name: 'assembly', sub: 'no types at all', fill: SURF, c: DIM }
    ];
    cells.forEach(function (c, i) {
      if (p < 0.3 + i * 0.12) return;
      panel(c.x, c.y, c.w, c.h, { fill: c.fill, stroke: BORDER });
      label(c.x + c.w / 2, c.y + 52, c.name, { size: 20, bold: true, color: c.c, align: 'center' });
      label(c.x + c.w / 2, c.y + 82, c.sub, { size: 11.5, color: INK, align: 'center' });
    });
  }

  if (p > 0.78) {
    panel(30, 404, 840, 52, { fill: WARNDIM });
    label(44, 414, 'The definition decides the answer', { size: 12, bold: true, color: INK });
    label(44, 436, 'Some texts call a language strongly typed when all its bindings are static; others when no operator can ever meet a wrong type.', { size: 11, color: INK });
  }
}

/* ---------- scene 6: the rules ---------- */
function drawRules(t) {
  var p = prog(t);
  head('A type system is a set of rules, and a program is a derivation',
       'Premises above the line, a judgment below; a node with no firing rule is the error');

  function rule(x, y, w, prem, concl, title) {
    panel(x, y, w, 96, { fill: SURF });
    label(x + 10, y + 8, title, { size: 11.5, bold: true, color: ACC });
    prem.forEach(function (s, i) { label(x + 10, y + 30 + i * 18, s, { size: 11, mono: true, color: INK }); });
    P.line(x + 8, y + 66, x + w - 8, y + 66, { stroke: INK, sw: 1.2 });
    label(x + 10, y + 74, concl, { size: 11, mono: true, color: VAL });
  }

  if (p > 0.15) {
    rule(30, 66, 268, ['e1 : numeric', 'e2 : numeric'], 'e1 + e2 : wider(e1, e2)', 'addition');
  }
  if (p > 0.32) {
    rule(316, 66, 268, ['e : T', 'T assignable to type(x)'], 'x = e : type(x)', 'assignment');
  }
  if (p > 0.48) {
    rule(602, 66, 268, ['c : bool', 'e1, e2 compatible'], 'if c then e1 else e2 : wider(e1, e2)', 'if-expression');
  }

  if (p > 0.62) {
    panel(30, 180, 420, 150, { fill: SURF2 });
    label(44, 190, 'Reading a rule', { size: 12, bold: true, color: INK });
    label(44, 214, 'The judgment is written  e : T  and read "e has type T".', { size: 11.5, color: INK });
    label(44, 236, 'The premises are themselves judgments, about the children.', { size: 11.5, color: INK });
    label(44, 258, 'The environment is implicit: the same expression can have', { size: 11.5, color: DIM });
    label(44, 276, 'different types under different declarations.', { size: 11.5, color: DIM });
    label(44, 302, 'Every premise is separately failable, which is why the', { size: 11.5, color: INK });
    label(44, 320, 'rules for if are two rules and not one.', { size: 11.5, color: INK });

    panel(470, 180, 400, 150, { fill: INVALIDDIM });
    label(484, 190, 'No rule fires', { size: 12, bold: true, color: BAD });
    label(484, 214, 'x + b   with x : int, b : bool', { size: 11.5, mono: true, color: INK });
    label(484, 238, 'The premise "b is numeric" is false, so the conclusion', { size: 11.5, color: INK });
    label(484, 258, 'cannot be drawn. There is no default type: the node is', { size: 11.5, color: INK });
    label(484, 278, 'a type error, not an int.', { size: 11.5, color: INK });
    label(484, 306, 'The page runs this program and reports the failing node.', { size: 11, color: DIM });
  }

  if (p > 0.82) {
    panel(30, 346, 840, 106, { fill: SURF });
    label(44, 356, 'The derivation is the whole check', { size: 12.5, bold: true, color: INK });
    label(44, 380, 'Start at the leaves: a literal has a type by construction, an identifier by lookup.', { size: 11.5, color: INK });
    label(44, 400, 'Apply one rule per node, bottom up. The program is accepted when the root gets a type.', { size: 11.5, color: INK });
    label(44, 420, 'Rejection needs no extra machinery: it is the absence of a rule at some node.', { size: 11.5, color: DIM });
    label(44, 440, 'Thirteen programs on this page are checked this way, and every verdict matches its definition.', { size: 11, color: ACC });
  }
}

/* ---------- scene 7: coercion ---------- */
function drawCoercion(t) {
  var p = prog(t);
  head('Compatibility, coercion, cast and overload resolution',
       'Identical, assignable and coercible are three relations; only one of them is symmetric');

  if (p > 0.18) {
    label(30, 66, 'the widening chain, as this toy language orders it', { size: 11, color: FAINT });
    var chain = ['char', 'short', 'int', 'long', 'float', 'double'];
    chain.forEach(function (s, i) {
      var x = 30 + i * 100;
      panel(x, 84, 82, 30, { fill: i >= 2 && i <= 4 ? ACCDIM : SURF2, stroke: BORDER });
      label(x + 41, 92, s, { size: 11.5, mono: true, align: 'center', color: INK });
      if (i < chain.length - 1) P.arrow(x + 84, 99, x + 97, 99, { stroke: DIM, sw: 1 });
    });
    label(30, 122, 'left to right is widening, which may be coerced; right to left is narrowing, which needs a cast', { size: 11, color: DIM });
  }

  if (p > 0.38) {
    label(30, 152, 'assignable(from \u2192 to): nine ordered pairs', { size: 11, color: FAINT });
    var rows = GRID.cells.map(function (row) {
      return [row[0].from].concat(row.map(function (c) {
        return (c.coercing ? '\u2713' : '\u2717') + (c.strict ? '' : c.coercing ? ' c' : '');
      }));
    });
    tbl(30, 170, [{ name: 'from \\ to', w: 80 }, { name: 'int', w: 60 }, { name: 'float', w: 60 }, { name: 'bool', w: 60 }], rows, { rh: 20, size: 11 });
    label(30, 262, 'strict ' + GRID.strict + ' of 9 \u00b7 coercing ' + GRID.coercing + ' of 9', { size: 11.5, color: INK });
    label(30, 282, 'c marks a cell that is legal only because of a coercion', { size: 11, color: DIM });
  }

  if (p > 0.56) {
    panel(310, 150, 256, 130, { fill: SURF });
    label(324, 160, 'coercion', { size: 12, bold: true, color: ACC });
    label(324, 182, 'inserted by the compiler', { size: 11.5, color: INK });
    label(324, 202, 'only where widening is', { size: 11.5, color: INK });
    label(324, 222, 'allowed by the rules', { size: 11.5, color: INK });
    label(324, 250, 'invisible in the source', { size: 11.5, color: DIM });
    label(324, 268, 'cannot lose information', { size: 11.5, color: DIM });
  }
  if (p > 0.66) {
    panel(576, 150, 294, 130, { fill: SURF });
    label(590, 160, 'cast', { size: 12, bold: true, color: WARN });
    label(590, 182, 'written by the programmer', { size: 11.5, color: INK });
    label(590, 202, 'may narrow or reinterpret', { size: 11.5, color: INK });
    label(590, 222, 'is the escape hatch that', { size: 11.5, color: INK });
    label(590, 242, 'makes C not strongly typed', { size: 11.5, color: INK });
    label(590, 266, 'the checker stops asking', { size: 11.5, color: DIM });
  }

  if (p > 0.8) {
    panel(30, 300, 840, 152, { fill: SURF2 });
    label(44, 310, 'Overload resolution: f(int, float) and f(float, int)', { size: 12.5, bold: true, color: INK });
    RES_CASES.forEach(function (c, i) {
      var y = 336 + i * 26;
      var verdict = c.result.kind === 'exact' ? 'exact match, chosen'
        : c.result.kind === 'ambiguous' ? 'two applicable, neither exact: ambiguous'
        : 'no applicable candidate: error';
      var col = c.result.kind === 'exact' ? VAL : c.result.kind === 'ambiguous' ? WARN : BAD;
      label(44, y, 'call ' + c.label, { size: 11.5, mono: true, color: INK });
      label(240, y, c.result.applicable.length + ' applicable', { size: 11.5, color: DIM });
      label(370, y, verdict, { size: 11.5, color: col, bold: true });
    });
    label(44, 418, 'Applicability first, then exactness. Picking one of two equally distant candidates is not a rule a language may use.', { size: 11, color: DIM });
    label(44, 438, 'The page resolves all three calls and reports which one is ambiguous.', { size: 11, color: ACC });
  }
}

/* ---------- scene 8: the checker ---------- */
function drawChecker(t) {
  var p = prog(t);
  head('A simple type checker: one attribute, and a poison type',
       '((x + z) * 2 - 3) / 4  with x : int and z : bool \u2014 one mistake, four operators above it');

  var nodes = [
    { x: 450, y: 66,  s: '/',  ty: 'type_error', bad: true },
    { x: 330, y: 136, s: '-',  ty: 'type_error', bad: true },
    { x: 570, y: 136, s: '4',  ty: 'int', bad: false },
    { x: 250, y: 206, s: '*',  ty: 'type_error', bad: true },
    { x: 410, y: 206, s: '3',  ty: 'int', bad: false },
    { x: 170, y: 276, s: '+',  ty: 'type_error', bad: true },
    { x: 330, y: 276, s: '2',  ty: 'int', bad: false },
    { x: 110, y: 346, s: 'x',  ty: 'int', bad: false },
    { x: 230, y: 346, s: 'z',  ty: 'bool', bad: false }
  ];
  var edges = [[0, 1], [0, 2], [1, 3], [1, 4], [3, 5], [3, 6], [5, 7], [5, 8]];
  edges.forEach(function (e) {
    P.line(nodes[e[0]].x, nodes[e[0]].y + 26, nodes[e[1]].x, nodes[e[1]].y, { stroke: BORDER, sw: 1.2 });
  });
  nodes.forEach(function (n, i) {
    if (p < 0.1 + i * 0.03) return;
    var bad = n.bad && p > 0.55;
    panel(n.x - 20, n.y, 40, 26, { fill: bad ? INVALIDDIM : SURF2, stroke: bad ? BAD : BORDER, sw: bad ? 1.6 : 1 });
    label(n.x, n.y + 6, n.s, { size: 12, mono: true, bold: true, align: 'center', color: INK });
    if (n.x > 380) label(n.x - 26, n.y + 8, n.ty, { size: 10.5, color: bad ? BAD : DIM, align: 'right' });
    else label(n.x + 26, n.y + 8, n.ty, { size: 10.5, color: bad ? BAD : DIM });
  });

  if (p > 0.55) {
    panel(420, 176, 450, 118, { fill: INVALIDDIM });
    label(434, 186, 'The lowest failing node is the only real mistake', { size: 12, bold: true, color: INK });
    label(434, 210, 'x + z : int + bool fails, so that node gets type_error.', { size: 11.5, color: INK });
    label(434, 230, 'type_error matches every type, so * , - and / each accept', { size: 11.5, color: INK });
    label(434, 250, 'it and pass it up without a new message.', { size: 11.5, color: INK });
    label(434, 274, 'Report: ' + POISON_ON + ' message with the poison, ' + POISON_OFF + ' without it.', { size: 11.5, bold: true, color: BAD });
  }

  if (p > 0.78) {
    panel(30, 386, 840, 66, { fill: SURF2 });
    label(44, 396, 'Why the poison type is a type and not an exception', { size: 12, bold: true, color: INK });
    label(44, 420, 'An exception would stop at the first failure and hide every independent error later in the tree.', { size: 11.5, color: INK });
    label(44, 440, 'A type lets the walk finish, so a compiler can report all the real mistakes in one pass.', { size: 11.5, color: DIM });
  }
}

/* ---------- scene 9: statements ---------- */
function drawStatements(t) {
  var p = prog(t);
  head('Statements and declarations: the rules that are not about expressions',
       'Declare-before-use, arity, parameter types and return types \u2014 none of them decidable by a grammar');

  if (p > 0.18) {
    var rows = [
      ['assignment', 'type(x) accepts type(e)'],
      ['if / while', 'condition : bool, body : statement'],
      ['declaration', 'name not already declared in this scope'],
      ['identifier use', 'name is in the symbol table'],
      ['call', 'arity matches, every argument assignable'],
      ['return', 'type(e) assignable to the declared result']
    ];
    tbl(30, 66, [{ name: 'construct', w: 104 }, { name: 'premise the rule must satisfy', w: 326 }], rows, { rh: 21, size: 11 });
  }

  if (p > 0.4) {
    panel(490, 66, 380, 110, { fill: SURF });
    label(504, 76, 'Two of these are pure lookup', { size: 12, bold: true, color: INK });
    label(504, 100, 'Declare-before-use fails when the name is absent from', { size: 11.5, color: INK });
    label(504, 120, 'the symbol table at the point of use. No grammar can', { size: 11.5, color: INK });
    label(504, 140, 'express "declared earlier", which is why it is semantic.', { size: 11.5, color: INK });
    label(504, 164, 'GATE CSE 2020 tested exactly this distinction.', { size: 11, color: DIM });
  }

  if (p > 0.58) {
    panel(30, 220, 420, 106, { fill: SURF2 });
    chip(44, 228, 'GATE CSE 2021 Set 1', ACC);
    label(44, 250, 'An SDT for declarations and expressions with int and bool.', { size: 11.5, color: INK });
    label(44, 270, 'The identifier rule set E.type := int unconditionally, so a', { size: 11.5, color: INK });
    label(44, 288, 'boolean variable was indistinguishable from an integer one.', { size: 11.5, color: INK });
    label(44, 310, 'Correct option: it type-checks integer declarations and integer', { size: 11, color: VAL, bold: true });
  }

  if (p > 0.72) {
    panel(470, 220, 400, 106, { fill: SURF2 });
    chip(484, 228, 'GATE CSE 2026 Set 1', ACC);
    label(484, 250, 'Two SDDs for the same declaration grammar.', { size: 11.5, color: INK });
    label(484, 270, 'The second is S-attributed: every attribute synthesized.', { size: 11.5, color: INK });
    label(484, 288, 'The first passes the type down as an inherited attribute.', { size: 11.5, color: INK });
    label(484, 310, 'Both add the same entries and generate the same language.', { size: 11, color: VAL, bold: true });
  }

  if (p > 0.86) {
    panel(30, 334, 840, 118, { fill: SURF });
    label(44, 344, 'Where this sits relative to the rest of the front end', { size: 12.5, bold: true, color: INK });
    label(44, 368, 'Syntax-directed translation supplies the machinery: attributes, rules, an evaluation order.', { size: 11.5, color: INK });
    label(44, 388, 'This topic supplies the meaning: what a type is, when two are equal, and which conversions are legal.', { size: 11.5, color: INK });
    label(44, 408, 'Runtime environments then take the types as given: a type decides the size of a slot in an activation record.', { size: 11.5, color: DIM });
    label(44, 430, 'The three tabs that follow cover the misconceptions, the exam patterns and the practice set.', { size: 11, color: ACC });
  }
}

/* ---------- scene 10: procedure ---------- */
function drawProcedure(t) {
  var p = prog(t);
  head('Sound but incomplete, and the four-step procedure',
       'What the checker cannot see, what it rejects for safety, and the order to work in');

  if (p > 0.2) {
    panel(30, 66, 400, 128, { fill: INVALIDDIM });
    label(44, 76, 'Accepted, and still fails at run time', { size: 12, bold: true, color: BAD });
    label(44, 100, 'p[5]  where  p : array(4, int)', { size: 12, mono: true, color: INK });
    label(44, 124, 'The rule asks only that the subscript be an int.', { size: 11.5, color: INK });
    label(44, 144, 'The index is a value, known only when the program runs.', { size: 11.5, color: INK });
    label(44, 170, 'Computed: accepted = ' + ACCEPT_FAIL.accepted + ', index ' + ACCEPT_FAIL.index + ' of ' + ACCEPT_FAIL.length + '.', { size: 11.5, bold: true, color: BAD });

    panel(470, 66, 400, 128, { fill: SURF2 });
    label(484, 76, 'Rejected, and would have run', { size: 12, bold: true, color: WARN });
    label(484, 100, 'if true then x = 1 else x = "s"', { size: 12, mono: true, color: INK });
    label(484, 124, 'The two branches are incompatible, so the rule fails.', { size: 11.5, color: INK });
    label(484, 144, 'The condition is the literal true: the else never runs.', { size: 11.5, color: INK });
    label(484, 170, 'Computed: rejected = ' + REJECT_RUN.rejected + ', else reachable = ' + REJECT_RUN.elseReachable + '.', { size: 11.5, bold: true, color: WARN });
  }

  if (p > 0.5) {
    panel(30, 208, 840, 132, { fill: SURF });
    label(44, 218, 'The four steps', { size: 12.5, bold: true, color: INK });
    var steps = [
      '1. Build a type expression for every declaration and store it with the name.',
      '2. Walk the tree bottom up, one rule per node, with type_error as a type.',
      '3. Report the lowest failing node, then check statements: scope, arity, result.',
      '4. Keep equivalence and compatibility apart: same type, against may be used as.'
    ];
    steps.forEach(function (s, i) { label(44, 244 + i * 22, s, { size: 11.5, color: INK }); });
    label(44, 334, 'Nothing here needs the animation: the four lines are the whole procedure.', { size: 11, color: DIM });
  }

  if (p > 0.74) {
    panel(30, 352, 840, 100, { fill: SURF2 });
    label(44, 362, 'Three distinctions that decide the mark', { size: 12.5, bold: true, color: INK });
    label(44, 386, 'equivalence against compatibility \u2014 are these the same type, or may one be used as the other', { size: 11.5, color: INK });
    label(44, 406, 'structural against name \u2014 does the record tag count, and does a typedef create a type', { size: 11.5, color: INK });
    label(44, 426, 'static against strong \u2014 when is it checked, against is every error caught', { size: 11.5, color: INK });
  }
}

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

var DRAW = {
  position: drawPosition,
  typeexpr: drawTypeExpr,
  structural: drawStructural,
  name: drawName,
  staticdynamic: drawStaticDynamic,
  rules: drawRules,
  coercion: drawCoercion,
  checker: drawChecker,
  statements: drawStatements,
  procedure: drawProcedure
};

function sceneIdAt(t) {
  var sc = window.LESSON_TIMELINE.scenes;
  for (var i = sc.length - 1; i >= 0; i--) if (t >= sc[i].start - 1e-6) return sc[i].id;
  return sc[0].id;
}

function drawFrame(P2) {
  P = P2;
  P.alpha(1);
  P.clear();
  P.rect(0, 0, W, H, { fill: SURF });
  var id = sceneIdAt(K.state.elapsed);
  var fn = DRAW[id] || drawPosition;
  try { fn(K.state.elapsed); } catch (e) { console.error('scene ' + id, e); }
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

/* the model, exposed for the headless check and for anyone reading the source */
window.LESSON_MODEL = {
  show: show, size: size, equiv: equiv, nameEquiv: nameEquiv,
  STRUCT_CLASSES: STRUCT_CLASSES, NAME_CLASSES: NAME_CLASSES, PAIRS: PAIRS,
  GRID: GRID, RES_CASES: RES_CASES, PROGRAMS: PROGRAMS,
  RUN_COERCE: RUN_COERCE, RUN_STRICT: RUN_STRICT,
  POISON_ON: POISON_ON, POISON_OFF: POISON_OFF,
  ACCEPT_FAIL: ACCEPT_FAIL, REJECT_RUN: REJECT_RUN, SIZE_ROWS: SIZE_ROWS
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
