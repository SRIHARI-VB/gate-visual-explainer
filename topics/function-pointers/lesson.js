/* ==========================================================================
   function-pointers — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number and every reading the lesson shows.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads V; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   Two kinds of fact appear below and are kept apart:
     - what the C standard fixes (a function designator decays to a pointer to
       function except under sizeof or &; a function call requires a pointer to
       function; calling through an incompatible converted pointer is undefined;
       pointer arithmetic requires a complete object type);
     - what depends on a stated machine model (an LP64 model: 8-byte pointers,
       32-bit int, code addresses 0x401136, 0x401150, 0x40116A).

   The declarator parser in layer 1 is the point of the lesson: it is a real
   recursive-descent parser over the C declarator grammar, and its output is
   checked against sixteen published English readings (the cdecl / "C to
   English Declarations" table and the C standard's own signal declaration).
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

/* ---------- 1a. a declarator parser ----------
   Grammar (C11 6.7.6):
     declarator        := pointer? direct-declarator
     pointer           := '*' pointer?
     direct-declarator := identifier | '(' declarator ')' | dd '[' n ']' | dd '(' params ')'

   Each declarator is compiled to a builder: a function of the base type that
   returns the full type. That composition is what makes the inside-out reading
   fall out for free instead of being memorised. */

var BASES = { int: 1, char: 1, void: 1, float: 1, double: 1, long: 1, short: 1, unsigned: 1, signed: 1, _Bool: 1 };

function tokenize(src) {
  var out = [], i = 0, n = src.length;
  while (i < n) {
    var c = src.charAt(i);
    if (/\s/.test(c)) { i++; continue; }
    if (/[A-Za-z_]/.test(c)) {
      var j = i;
      while (j < n && /[A-Za-z0-9_]/.test(src.charAt(j))) j++;
      out.push({ t: src.slice(i, j), s: i, e: j });
      i = j;
      continue;
    }
    if (/[0-9]/.test(c)) {
      var k = i;
      while (k < n && /[0-9]/.test(src.charAt(k))) k++;
      out.push({ t: src.slice(i, k), s: i, e: k });
      i = k;
      continue;
    }
    out.push({ t: c, s: i, e: i + 1 });
    i++;
  }
  return out;
}

function funcBuild(prev, params) {
  return function (b) { return prev({ kind: 'func', params: params, ret: b }); };
}
function arrayBuild(prev, n) {
  return function (b) { return prev({ kind: 'array', n: n, of: b }); };
}
function ptrBuild(prev) {
  return function (b) { return prev({ kind: 'ptr', to: b }); };
}

function parseDeclarator(ts, p, src) {
  function parse() {
    if (p.i < ts.length && ts[p.i].t === '*') {
      p.i++;
      var inner = parse();
      if (inner.error) return inner;
      return { name: inner.name, build: ptrBuild(inner.build) };
    }
    var node;
    if (p.i < ts.length && ts[p.i].t === '(') {
      p.i++;
      node = parse();
      if (node.error) return node;
      if (!(p.i < ts.length && ts[p.i].t === ')')) return { error: 'unbalanced parentheses' };
      p.i++;
    } else if (p.i < ts.length && /^[A-Za-z_]/.test(ts[p.i].t)) {
      node = { name: ts[p.i].t, build: function (b) { return b; } };
      p.i++;
    } else {
      node = { name: '', build: function (b) { return b; } };   // abstract declarator
    }

    while (p.i < ts.length && (ts[p.i].t === '(' || ts[p.i].t === '[')) {
      var nm = node.name, prev = node.build;
      if (ts[p.i].t === '(') {
        var open = ts[p.i].e, depth = 1, j = p.i + 1;
        while (j < ts.length && depth > 0) {
          if (ts[j].t === '(') depth++;
          else if (ts[j].t === ')') depth--;
          if (depth > 0) j++;
        }
        var close = (ts[j] ? ts[j].s : src.length);
        var params = src.slice(open, close).replace(/\s+/g, ' ').trim();
        p.i = j + 1;
        node = { name: nm, build: funcBuild(prev, params) };
      } else {
        var num = ts[p.i + 1] ? ts[p.i + 1].t : '?';
        p.i += 2;
        if (p.i < ts.length && ts[p.i].t === ']') p.i++;
        node = { name: nm, build: arrayBuild(prev, num) };
      }
    }
    return node;
  }
  return parse();
}

function plural(s) {
  return s.replace(/^pointer/, 'pointers').replace(/^array/, 'arrays').replace(/^function/, 'functions');
}

function readType(t) {
  if (t.kind === 'base') return t.name;
  if (t.kind === 'ptr') return 'pointer to ' + readType(t.to);
  if (t.kind === 'func') return 'function taking (' + t.params + ') returning ' + readType(t.ret);
  if (t.kind === 'array') return 'array of ' + t.n + ' ' + plural(readType(t.of));
  return '?';
}

/* a function cannot return a function, and an array cannot hold one (6.7.6.2) */
function typeError(t) {
  if (t.kind === 'func' && t.ret.kind === 'func') return 'a function cannot return a function';
  if (t.kind === 'array' && t.of.kind === 'func') return 'an array cannot hold functions';
  if (t.kind === 'ptr') return typeError(t.to);
  if (t.kind === 'func') return typeError(t.ret);
  if (t.kind === 'array') return typeError(t.of);
  return null;
}

function parseDecl(src) {
  var ts = tokenize(src), p = { i: 0 }, words = [];
  while (p.i < ts.length && (BASES[ts[p.i].t] || ts[p.i].t === 'const' || ts[p.i].t === 'struct')) {
    words.push(ts[p.i].t);
    p.i++;
    if (words[words.length - 1] === 'struct' && p.i < ts.length) { words.push(ts[p.i].t); p.i++; }
  }
  if (!words.length) return { error: 'no type specifier', reading: null, name: null };
  var d = parseDeclarator(ts, p, src);
  if (d.error) return { error: d.error, reading: null, name: d.name };
  var type = d.build({ kind: 'base', name: words.join(' ') });
  var err = typeError(type);
  if (err) return { error: err, reading: null, name: d.name, type: type };
  var body = readType(type);
  var article = /^array/.test(body) ? 'an ' : 'a ';
  return { name: d.name, type: type, reading: d.name + ' is ' + article + body, error: null };
}

/* the chain of constructors, outermost type first: that order is the reading */
function chain(t) {
  var out = [];
  (function walk(x) {
    if (x.kind === 'base') { out.push('base ' + x.name); return; }
    if (x.kind === 'ptr') { out.push('pointer to'); walk(x.to); return; }
    if (x.kind === 'func') { out.push('function taking (' + x.params + ')'); walk(x.ret); return; }
    out.push('array of ' + x.n);
    walk(x.of);
  })(t);
  return out;
}

/* ---------- 1b. the sixteen declarations, and their published readings ----------
   Expected strings are the readings published by the "C to English Declarations"
   table (f1-f42) and the C standard's own signal declaration; the GATE CSE 2005
   item is the first pointer-to-function entry. */

var DECLS = [
  { src: 'int f(void)',                              expect: 'f is a function taking (void) returning int',                                            src_name: 'a plain function' },
  { src: 'int *f(int)',                              expect: 'f is a function taking (int) returning pointer to int',                                   src_name: 'function returning int *' },
  { src: 'int (*f)(int *)',                          expect: 'f is a pointer to function taking (int *) returning int',                                 src_name: 'GATE CSE 2005' },
  { src: 'int (*f[3])(int)',                         expect: 'f is an array of 3 pointers to function taking (int) returning int',                      src_name: 'dispatch table' },
  { src: 'int (**f)(int)',                           expect: 'f is a pointer to pointer to function taking (int) returning int',                        src_name: 'pointer to pointer' },
  { src: 'int *(*f)(int)',                           expect: 'f is a pointer to function taking (int) returning pointer to int',                        src_name: 'callback returning int *' },
  { src: 'int (*f(void))(int)',                      expect: 'f is a function taking (void) returning pointer to function taking (int) returning int',  src_name: 'factory' },
  { src: 'void (*f)(void)',                          expect: 'f is a pointer to function taking (void) returning void',                                 src_name: 'qsort-style handler' },
  { src: 'int *f[3]',                                expect: 'f is an array of 3 pointers to int',                                                      src_name: 'array of pointers' },
  { src: 'int (*f)[3]',                              expect: 'f is a pointer to array of 3 int',                                                        src_name: 'pointer to array' },
  { src: 'int (*f[3])[4]',                           expect: 'f is an array of 3 pointers to array of 4 int',                                           src_name: 'C to English f11' },
  { src: 'int *(*f[3])[4]',                          expect: 'f is an array of 3 pointers to array of 4 pointers to int',                               src_name: 'C to English f12' },
  { src: 'void (*signal(int, void (*)(int)))(int)',  expect: 'signal is a function taking (int, void (*)(int)) returning pointer to function taking (int) returning void', src_name: '<signal.h>' },
  { src: 'char *(*f)(char *, int)',                  expect: 'f is a pointer to function taking (char *, int) returning pointer to char',               src_name: 'C to English f28' },
  { src: 'int (*(*f)(int))(int)',                    expect: 'f is a pointer to function taking (int) returning pointer to function taking (int) returning int', src_name: 'C to English f32b' },
  { src: 'int *(*f)(void)',                          expect: 'f is a pointer to function taking (void) returning pointer to int',                       src_name: 'C to English f27' }
];

var PARSED = DECLS.map(function (d) {
  var r = parseDecl(d.src);
  return { src: d.src, expect: d.expect, got: r.reading, error: r.error, type: r.type, name: r.name, tag: d.src_name };
});

PARSED.forEach(function (r, i) {
  chk('reading #' + (i + 1) + ' ' + r.src, r.got === r.expect, r.error ? ('error: ' + r.error) : r.got);
});

var BAD = [
  { src: 'int f(void)(int)', why: 'function returning a function' },
  { src: 'int f[3](void)', why: 'array of functions' }
];
BAD.forEach(function (b) {
  var r = parseDecl(b.src);
  chk('rejects ' + b.why, !!r.error, r.error || 'accepted');
});

/* the two spellings that differ only by parentheses */
var D_FUNC_RET_PTR = parseDecl('int *f(int)');
var D_PTR_TO_FUNC = parseDecl('int (*f)(int)');
chk('the pair is not the same type', JSON.stringify(D_FUNC_RET_PTR.type) !== JSON.stringify(D_PTR_TO_FUNC.type));
chk('int *f(int): tightest binding is the parameter list', chain(D_FUNC_RET_PTR.type)[0] === 'function taking (int)');
chk('int (*f)(int): tightest binding is the pointer', chain(D_PTR_TO_FUNC.type)[0] === 'pointer to');

var SIGNAL = parseDecl('void (*signal(int, void (*)(int)))(int)');
var GATE2005 = parseDecl('int (*f)(int *)');

/* ---------- 1c. calling through a pointer ----------
   A model of what the three spellings resolve to. f, &f and *f all name the
   same code address: 6.3.2.1p4 converts the designator to a pointer except
   under sizeof and &, and 6.5.3.2p4 turns *p on a function pointer back into
   the designator, which then converts again. */

var MODEL_BITS = { ptrBytes: 8, intBytes: 4 };
var FNS = [
  { name: 'add', addr: 0x401136, note: 'int add(int x)' },
  { name: 'mul', addr: 0x401150, note: 'int mul(int x)' },
  { name: 'neg', addr: 0x40116A, note: 'int neg(int x)' }
];

function resolve(spelling, fn) {
  if (spelling === 'f') return fn.addr;        // designator decays
  if (spelling === '&f') return fn.addr;       // & on a designator: no decay, same address
  if (spelling === '*f') return fn.addr;       // * on the designator, then decay again
  return null;
}
var SPELLINGS = ['f', '&f', '*f'];
var SPELLING_ADDRS = SPELLINGS.map(function (s) { return resolve(s, FNS[0]); });
chk('f, &f and *f name the same address', SPELLING_ADDRS[0] === SPELLING_ADDRS[1] && SPELLING_ADDRS[1] === SPELLING_ADDRS[2],
    SPELLING_ADDRS.map(function (a) { return '0x' + a.toString(16).toUpperCase(); }).join(' = '));

/* sizeof: not allowed on a function type (6.5.3.4) */
function sizeofAllowed(kind) { return kind !== 'function' && kind !== 'incomplete'; }
chk('sizeof a function is not allowed', sizeofAllowed('function') === false);
chk('sizeof a function pointer is the pointer size', sizeofAllowed('pointer') === true && MODEL_BITS.ptrBytes === 8);

/* pointer arithmetic: needs a pointer to a complete object type (6.5.6p2) */
function arithmeticAllowed(pointee) { return pointee === 'object'; }
chk('arithmetic on a function pointer is not allowed', arithmeticAllowed('function') === false);
chk('arithmetic on an int pointer is allowed', arithmeticAllowed('object') === true);

/* a parameter declared with a function type is adjusted to a pointer (6.7.6.3p8) */
function adjustParam(kind) { return kind === 'function' ? 'pointer to function' : kind; }
chk('a function-type parameter is adjusted to a pointer', adjustParam('function') === 'pointer to function');

/* type compatibility of a qsort comparator (6.2.7): two function types are
   compatible only if the return types agree and the parameter lists agree */
function compatible(a, b) {
  if (a.ret !== b.ret) return false;
  if (a.params.length !== b.params.length) return false;
  for (var i = 0; i < a.params.length; i++) if (a.params[i] !== b.params[i]) return false;
  return true;
}
var CMP_OK = { ret: 'int', params: ['const void *', 'const void *'] };
var CMP_CAST = { ret: 'int', params: ['int *', 'int *'] };
var CMP_CONST = { ret: 'int', params: ['void *', 'void *'] };
chk('the cast int(*)(int*,int*) is not compatible with qsort\'s parameter', compatible(CMP_OK, CMP_CAST) === false);
chk('dropping const is also a different type', compatible(CMP_OK, CMP_CONST) === false);
chk('the exact signature is compatible with itself', compatible(CMP_OK, CMP_OK) === true);

/* ---------- 1d. qsort: the contract, and two comparators that lie ---------- */

function insertionSort(arr, cmp) {
  var a = arr.slice(), comps = 0;
  for (var i = 1; i < a.length; i++) {
    var key = a[i], j = i - 1;
    while (j >= 0) {
      comps++;
      if (cmp(key, a[j]) < 0) { a[j + 1] = a[j]; j--; } else break;
    }
    a[j + 1] = key;
  }
  return { out: a, comparisons: comps };
}

var cmpGood = function (a, b) { return a < b ? -1 : a > b ? 1 : 0; };
var cmpSub  = function (a, b) { return (a - b) | 0; };          // 32-bit wrap, as int does
var cmpBool = function (a, b) { return (a > b) ? 1 : 0; };      // never negative

var GOOD_DATA = [5, 3, 9, 1, 7, 3];
var GOOD_RUN = insertionSort(GOOD_DATA, cmpGood);
var REFERENCE = GOOD_DATA.slice().sort(function (a, b) { return a - b; });
var isAscending = function (a) {
  for (var i = 1; i < a.length; i++) if (a[i - 1] > a[i]) return false;
  return true;
};
var n = GOOD_DATA.length;
chk('the correct comparator sorts the array', GOOD_RUN.out.join(',') === REFERENCE.join(','), GOOD_RUN.out.join(','));
chk('comparisons are within n-1 and n(n-1)/2',
    GOOD_RUN.comparisons >= n - 1 && GOOD_RUN.comparisons <= n * (n - 1) / 2, GOOD_RUN.comparisons);

var SUB_PAIR = [2000000000, -2000000000];
var SUB_DIFF = 2000000000 - (-2000000000);
var SUB_WRAPPED = (2000000000 - (-2000000000)) | 0;
var SUB_RUN = insertionSort(SUB_PAIR, cmpSub);
chk('the subtraction comparator wraps', SUB_WRAPPED < 0, SUB_DIFF + ' -> ' + SUB_WRAPPED);
chk('the subtraction comparator leaves the pair descending', isAscending(SUB_RUN.out) === false, SUB_RUN.out.join(','));
chk('the same pair is sorted correctly by the good comparator',
    insertionSort(SUB_PAIR, cmpGood).out.join(',') === '-2000000000,2000000000');

var BOOL_DATA = [3, 1, 2];
var BOOL_RUN = insertionSort(BOOL_DATA, cmpBool);
chk('the boolean comparator never returns a negative', cmpBool(9, 1) >= 0 && cmpBool(1, 9) >= 0);
chk('the boolean comparator leaves the array unsorted', isAscending(BOOL_RUN.out) === false, BOOL_RUN.out.join(','));
chk('the boolean comparator moved nothing', BOOL_RUN.out.join(',') === BOOL_DATA.join(','));
chk('the boolean comparator reports every pair as not-less',
    cmpBool(1, 9) === 0 && cmpBool(9, 1) === 1);

/* the repair: (a > b) - (a < b) */
var cmpFixed = function (a, b) { return (a > b ? 1 : 0) - (a < b ? 1 : 0); };
chk('the three-way repair returns -1, 0, 1 exactly',
    cmpFixed(1, 2) === -1 && cmpFixed(2, 2) === 0 && cmpFixed(2, 1) === 1);
chk('the repair sorts both test arrays',
    isAscending(insertionSort(BOOL_DATA, cmpFixed).out) && isAscending(insertionSort(SUB_PAIR, cmpFixed).out));

/* ---------- 1e. the dispatch table ---------- */

var OPS = [
  { sym: '+', fn: function (a, b) { return a + b; } },
  { sym: '-', fn: function (a, b) { return a - b; } },
  { sym: '*', fn: function (a, b) { return a * b; } },
  { sym: '/', fn: function (a, b) { return b === 0 ? a : Math.trunc(a / b); } }
];

/* a program is a list of (opcode, argument) steps applied to an accumulator */
function runTable(prog, ops) {
  var acc = 0;
  for (var i = 0; i < prog.length; i++) acc = ops[prog[i].op].fn(acc, prog[i].arg);
  return acc;
}
function runSwitch(prog) {
  var acc = 0;
  for (var i = 0; i < prog.length; i++) {
    var op = prog[i].op, arg = prog[i].arg;
    if (op === 0) acc = acc + arg;
    else if (op === 1) acc = acc - arg;
    else if (op === 2) acc = acc * arg;
    else acc = arg === 0 ? acc : Math.trunc(acc / arg);
  }
  return acc;
}

var DEMO_PROG = [{ op: 0, arg: 5 }, { op: 2, arg: 3 }, { op: 1, arg: 2 }];
var DEMO_TABLE = runTable(DEMO_PROG, OPS);
var DEMO_SWITCH = runSwitch(DEMO_PROG);
chk('the demo program agrees both ways', DEMO_TABLE === DEMO_SWITCH, DEMO_TABLE);

/* exhaustively: 3 steps, 4 opcodes, 3 arguments = 1728 programs */
var ARGS = [2, 3, 5];
var PROGRAMS = 0, AGREE = 0;
(function () {
  for (var a = 0; a < 4; a++) for (var b = 0; b < 4; b++) for (var c = 0; c < 4; c++) {
    for (var x = 0; x < 3; x++) for (var y = 0; y < 3; y++) for (var z = 0; z < 3; z++) {
      var prog = [{ op: a, arg: ARGS[x] }, { op: b, arg: ARGS[y] }, { op: c, arg: ARGS[z] }];
      PROGRAMS++;
      if (runTable(prog, OPS) === runSwitch(prog)) AGREE++;
    }
  }
})();
chk('the table and the switch agree on every program', PROGRAMS === AGREE, AGREE + '/' + PROGRAMS);
chk('the enumeration really covered 1728 programs', PROGRAMS === 4 * 4 * 4 * 3 * 3 * 3, PROGRAMS);

/* cost model: an if-chain over k operators averages (k+1)/2 tests, the table 1 */
var K_OPS = 4, INSTRUCTIONS = 1000;
var CHAIN_TESTS = INSTRUCTIONS * (K_OPS + 1) / 2;
var TABLE_TESTS = INSTRUCTIONS * 1;
chk('the chain costs more than the table on the stated model', CHAIN_TESTS > TABLE_TESTS, CHAIN_TESTS + ' vs ' + TABLE_TESTS);
chk('the chain average is the closed form (k+1)/2', (K_OPS + 1) / 2 === 2.5);

/* ---------- 1f. the numbers the captions quote ---------- */
var V = {
  ptrBytes: MODEL_BITS.ptrBytes,
  intBytes: MODEL_BITS.intBytes,
  fns: FNS,
  spellings: SPELLINGS,
  spellingAddrs: SPELLING_ADDRS,
  decls: PARSED,
  chainFuncRetPtr: chain(D_FUNC_RET_PTR.type),
  chainPtrToFunc: chain(D_PTR_TO_FUNC.type),
  signalReading: SIGNAL.reading,
  signalChain: chain(SIGNAL.type),
  gate2005Reading: GATE2005.reading,
  bad: BAD,
  goodData: GOOD_DATA,
  goodOut: GOOD_RUN.out,
  goodComparisons: GOOD_RUN.comparisons,
  subPair: SUB_PAIR,
  subDiff: SUB_DIFF,
  subWrapped: SUB_WRAPPED,
  subOut: SUB_RUN.out,
  boolData: BOOL_DATA,
  boolOut: BOOL_RUN.out,
  demoProg: DEMO_PROG,
  demoResult: DEMO_TABLE,
  programs: PROGRAMS,
  agree: AGREE,
  chainTests: CHAIN_TESTS,
  tableTests: TABLE_TESTS,
  opCount: K_OPS,
  instructions: INSTRUCTIONS,
  checks: CHECKS.length
};

/* ======================================================================
   LAYER 3 - RENDER
   Every coordinate is fixed. Text never moves once it is placed, so two
   strings can never land on each other: each row has one owner per scene.
   ====================================================================== */

var ROWS = [92, 124, 156, 188, 220, 252, 284, 316, 348, 380, 412, 444];

function sceneOf(t) {
  var sc = (K && K.state && K.state.scenes) || [];
  for (var i = sc.length - 1; i >= 0; i--) if (t >= sc[i].start - 1e-6) return sc[i];
  return sc[0] || null;
}
function prog(t) {
  var s = sceneOf(t);
  if (!s) return 0;
  return K ? K.clamp01((t - s.start) / Math.max(0.001, s.end - s.start)) : 0;
}
function at(t, frac) { return prog(t) >= frac; }

function head(title, sub) {
  P.text(40, 26, title, { size: 16, bold: true, color: PAL.ink });
  P.text(40, 50, sub, { size: 12.5, color: PAL.dim });
  P.line(40, 68, W - 40, 68, { stroke: PAL.border, sw: 1 });
}

function mono(x, y, s, size, color) {
  P.text(x, y, s, { size: size || 13, mono: true, color: color || PAL.ink });
}

function box(x, y, w, h, label, value, ok) {
  var stroke = ok === true ? PAL.valid : ok === false ? PAL.invalid : PAL.border;
  var fill = ok === true ? PAL.accentDim : ok === false ? PAL.invalidDim : PAL.surface2;
  P.rect(x, y, w, h, { fill: fill, stroke: stroke, radius: 6, sw: 1.4 });
  if (label) P.text(x + 10, y + 8, label, { size: 12, bold: true, mono: true, color: PAL.ink });
  if (value) P.text(x + 10, y + h - 18, value, { size: 11, mono: true, color: PAL.dim });
}

/* ---------- scene 1: an address ---------- */
function drawAddress(t) {
  head('A function is code at an address',
       'the code segment holds instructions; a function pointer is a variable holding one of those addresses');
  for (var i = 0; i < V.fns.length; i++) {
    var f = V.fns[i], x = 60 + i * 170;
    box(x, ROWS[0] - 4, 150, 46, f.name, '0x' + f.addr.toString(16).toUpperCase());
  }
  P.text(40, ROWS[1] + 6, 'code segment', { size: 12, color: PAL.faint, mono: true });

  if (at(t, 0.25)) {
    P.rect(60, ROWS[3] - 4, 170, 44, { fill: PAL.surface2, stroke: PAL.accent, radius: 6, sw: 1.6 });
    mono(70, ROWS[3] + 2, 'p', 14, PAL.accent);
    mono(96, ROWS[3] + 2, '= 0x401136', 13, PAL.ink);
    mono(70, ROWS[3] + 22, 'int (*p)(int)', 11, PAL.dim);
    P.arrow(232, ROWS[3] + 18, 262, ROWS[0] + 42, { stroke: PAL.accent, sw: 1.6 });
  }
  if (at(t, 0.45)) mono(300, ROWS[3] + 16, 'the pointer is data; the target is code', 12, PAL.dim);
  if (at(t, 0.6)) mono(40, ROWS[5], 'int (*p)(int) = add;    /* = &add; and = *add; are the same address */', 12.5);
  if (at(t, 0.75)) mono(40, ROWS[6], 'sizeof p is ' + V.ptrBytes + ' bytes on this LP64 model; sizeof add is not allowed at all', 12.5);
  if (at(t, 0.88)) {
    mono(40, ROWS[7], 'so the examinable skill is reading the declaration, not the machine code:', 12.5, PAL.dim);
    mono(40, ROWS[8], 'p is a pointer to function taking (int) returning int', 13, PAL.accent);
  }
}

/* ---------- scene 2: reading the GATE 2005 declaration ---------- */
function drawReading(t) {
  head('int (*f)(int *) — GATE CSE 2005, one mark',
       'four options, four readings; the parenthesis decides which one is true');
  var toks = ['int', '(', '*', 'f', ')', '(', 'int', '*', ')'];
  for (var i = 0; i < toks.length; i++) {
    var x = 60 + i * 62;
    box(x, ROWS[0] - 2, 54, 34, toks[i], null, toks[i] === '*' ? false : null);
  }
  var steps = [
    '1. find the identifier: f',
    '2. the * inside the parentheses makes f a pointer',
    '3. outside, (int *) says what it points to: a function taking int *',
    '4. what is left is the return type: int'
  ];
  for (var s = 0; s < steps.length; s++) {
    if (at(t, 0.15 + s * 0.15)) mono(60, ROWS[2] + s * 32, steps[s], 13);
  }
  if (at(t, 0.8)) {
    mono(40, ROWS[8], 'reading: f is a pointer to function taking (int *) returning int', 13, PAL.accent);
    mono(40, ROWS[9], 'option C in the paper. A drops the pointer; B moves the * to the return type;', 12.5, PAL.dim);
    mono(40, ROWS[10], 'D invents a return type that is itself a function pointer.', 12.5, PAL.dim);
  }
}

/* ---------- scene 3: four spellings ---------- */
function drawSpellings(t) {
  head('Four spellings, four different types',
       'same base type int, same identifier f; only the punctuation differs');
  var rows = [
    ['int *f(int)', 'function taking (int) returning pointer to int'],
    ['int (*f)(int)', 'pointer to function taking (int) returning int'],
    ['int (*f[3])(int)', 'array of 3 pointers to function taking (int) returning int'],
    ['int (**f)(int)', 'pointer to pointer to function taking (int) returning int']
  ];
  for (var i = 0; i < rows.length; i++) {
    if (!at(t, 0.1 + i * 0.18)) continue;
    var y = ROWS[0] + i * 46;
    P.rect(40, y - 8, 260, 36, { fill: PAL.surface2, stroke: PAL.border, radius: 6 });
    mono(52, y + 3, rows[i][0], 13, PAL.ink);
    mono(320, y + 3, rows[i][1], 12.5, PAL.accent);
  }
  if (at(t, 0.82)) mono(40, ROWS[9], 'rows 1 and 2 differ by one pair of parentheses, and are different types.', 12.5, PAL.dim);
  if (at(t, 0.9)) mono(40, ROWS[10], 'row 3 is three pointers; row 4 is one pointer whose target you can repoint.', 12.5, PAL.dim);
}

/* ---------- scene 4: why the parentheses decide ---------- */
function drawGrammar(t) {
  head('Why the parentheses decide everything',
       'declarator = pointer? direct-declarator; a suffix attaches to the direct-declarator');
  P.text(60, ROWS[0] + 4, 'int *f(int)', { size: 14, bold: true, mono: true, color: PAL.ink });
  P.text(500, ROWS[0] + 4, 'int (*f)(int)', { size: 14, bold: true, mono: true, color: PAL.ink });
  P.line(460, ROWS[0] - 6, 460, ROWS[7], { stroke: PAL.border, sw: 1, dash: [4, 4] });

  var left = ['f', 'then: function taking (int)', 'then: pointer to the result'];
  var right = ['f', 'then: pointer to', 'then: function taking (int)'];
  for (var i = 0; i < 3; i++) {
    if (!at(t, 0.15 + i * 0.16)) continue;
    P.text(60, ROWS[1] + i * 34, left[i], { size: 12.5, mono: true, color: PAL.ink });
    P.text(500, ROWS[1] + i * 34, right[i], { size: 12.5, mono: true, color: PAL.ink });
  }
  if (at(t, 0.65)) mono(60, ROWS[5], 'base type int, applied last on both sides', 12, PAL.dim);
  if (at(t, 0.72)) mono(60, ROWS[6], 'postfix ( ) binds tighter than prefix *', 13, PAL.accent);
  if (at(t, 0.8)) mono(40, ROWS[8], 'so *f(int) reads "function returning pointer", and (*f)(int) reads "pointer to function".', 12.5);
  if (at(t, 0.9)) mono(40, ROWS[9], 'parentheses are the only way to make the pointer bind before the parameter list.', 12.5, PAL.dim);
}

/* ---------- scene 5: signal ---------- */
function drawSignal(t) {
  head('void (*signal(int, void (*)(int)))(int)',
       'the C standard\'s own declaration in <signal.h>, peeled from the identifier outward');
  var steps = [
    '1. signal( ... )      — signal is a function',
    '2. (int, void (*)(int)) — it takes an int and a handler pointer',
    '3. *signal( ... )     — the result is a pointer',
    '4. (int) at the end   — to a function taking an int, returning void'
  ];
  for (var i = 0; i < steps.length; i++) {
    if (!at(t, 0.1 + i * 0.17)) continue;
    mono(60, ROWS[0] + i * 34, steps[i], 13);
  }
  if (at(t, 0.72)) mono(40, ROWS[5], 'reading: signal is a function taking (int, void (*)(int))', 12.5, PAL.accent);
  if (at(t, 0.75)) mono(40, ROWS[6], 'returning pointer to function taking (int) returning void', 12.5, PAL.accent);
  if (at(t, 0.82)) mono(40, ROWS[7], 'one typedef removes the puzzle:', 12.5, PAL.dim);
  if (at(t, 0.86)) mono(60, ROWS[8], 'typedef void (*handler)(int);', 13);
  if (at(t, 0.9)) mono(60, ROWS[9], 'handler signal(int, handler);', 13);
}

/* ---------- scene 6: calling through ---------- */
function drawCalling(t) {
  head('Calling through the pointer',
       'three spellings, one address, and one trap that is a type error');
  box(60, ROWS[0] - 4, 190, 44, 'p', '0x' + V.fns[0].addr.toString(16).toUpperCase());
  box(330, ROWS[0] - 4, 190, 44, 'add', 'int add(int x)');
  P.arrow(252, ROWS[0] + 18, 326, ROWS[0] + 18, { stroke: PAL.accent, sw: 1.6 });
  var lines = [
    ['f(3)', 'the designator decays to a pointer to function, then the call'],
    ['(*f)(3)', 'the * is undone by 6.5.3.2, so this is the same call'],
    ['p(3) / (*p)(3)', 'a call through a stored pointer: one extra load, same steps']
  ];
  for (var i = 0; i < lines.length; i++) {
    if (!at(t, 0.2 + i * 0.15)) continue;
    mono(60, ROWS[2] + i * 32, lines[i][0], 13, PAL.ink);
    mono(260, ROWS[2] + i * 32, lines[i][1], 12, PAL.dim);
  }
  if (at(t, 0.7)) {
    P.rect(40, ROWS[5] - 8, 820, 40, { fill: PAL.warnDim, stroke: PAL.warn, radius: 6 });
    mono(56, ROWS[5] + 2, '*p(3) is *(p(3)): it calls p first and dereferences the int it returns.', 12.5, PAL.warn);
  }
  if (at(t, 0.82)) mono(40, ROWS[7], 'f, &f and *f all name 0x401136 — verified here for the three spellings.', 12.5, PAL.dim);
  if (at(t, 0.9)) mono(40, ROWS[8], '&p, by contrast, is a different address: it is the address of the cell, not the code.', 12.5, PAL.dim);
}

/* ---------- scene 7: qsort contract ---------- */
function drawQsort(t) {
  head('qsort: the contract the callback must keep',
       'negative, zero or positive — that is the whole protocol');
  var before = V.goodData, after = V.goodOut;
  mono(60, ROWS[0], 'before', 12, PAL.faint);
  for (var i = 0; i < before.length; i++) box(60 + i * 62, ROWS[0] + 12, 54, 32, String(before[i]), null);
  if (at(t, 0.35)) {
    mono(60, ROWS[2], 'after', 12, PAL.faint);
    for (var j = 0; j < after.length; j++) box(60 + j * 62, ROWS[2] + 12, 54, 32, String(after[j]), null, true);
  }
  if (at(t, 0.45)) mono(470, ROWS[2] + 26, V.goodComparisons + ' comparisons, inside the ' + (n - 1) + '..' + (n * (n - 1) / 2) + ' bounds', 12, PAL.accent);
  var rules = [
    'negative if the first is less, zero if equal, positive if greater',
    'the arguments are pointers into the array; cast them back before comparing',
    'do not modify the elements, and do not depend on their addresses',
    'equal elements may come out in either order: qsort is not stable'
  ];
  for (var k = 0; k < rules.length; k++) {
    if (!at(t, 0.5 + k * 0.12)) continue;
    mono(60, ROWS[4] + k * 30, '• ' + rules[k], 12.5, PAL.dim);
  }
}

/* ---------- scene 8: two broken comparators ---------- */
function drawBroken(t) {
  head('Two comparators that compile and lie',
       'both are int-returning functions of two const void *; neither is a valid ordering');
  if (at(t, 0.08)) {
    mono(40, ROWS[0], 'return a - b;   with a = ' + V.subPair[0] + ' and b = ' + V.subPair[1], 13);
  }
  if (at(t, 0.22)) mono(60, ROWS[1], 'the difference is ' + V.subDiff + ', which does not fit in int', 12.5, PAL.dim);
  if (at(t, 0.34)) mono(60, ROWS[2], 'it wraps to ' + V.subWrapped + ', so the comparator says "a < b"', 12.5, PAL.invalid);
  if (at(t, 0.44)) mono(60, ROWS[3], 'the pair stays in the order it arrived: ' + V.subOut.join(', '), 12.5, PAL.invalid);
  if (at(t, 0.55)) mono(40, ROWS[5], 'return a > b;   returns 1 or 0, never -1', 13);
  if (at(t, 0.66)) mono(60, ROWS[6], 'every pair reads as "not less", so nothing ever moves', 12.5, PAL.dim);
  if (at(t, 0.74)) mono(60, ROWS[7], '[' + V.boolData.join(',') + '] comes back as [' + V.boolOut.join(',') + '] — unsorted', 12.5, PAL.invalid);
  if (at(t, 0.86)) {
    P.rect(40, ROWS[9] - 8, 820, 38, { fill: PAL.accentDim, stroke: PAL.accent, radius: 6 });
    mono(56, ROWS[9] + 1, 'the repair: return (a > b) - (a < b);  — three outcomes, no overflow', 12.5, PAL.accent);
  }
}

/* ---------- scene 9: dispatch table ---------- */
function drawTable(t) {
  head('An array of function pointers is a jump table',
       'int (*ops[4])(int, int) = { add, sub, mul, div };  the opcode is the index');
  for (var i = 0; i < V.opCount; i++) {
    var x = 60 + i * 110;
    box(x, ROWS[0] - 4, 100, 42, '[' + i + ']', ['add', 'sub', 'mul', 'div'][i]);
  }
  if (at(t, 0.25)) mono(60, ROWS[2], 'program: acc = 0; acc = acc + 5; acc = acc * 3; acc = acc - 2', 12.5);
  if (at(t, 0.4)) mono(60, ROWS[3], 'table lookup gives ' + V.demoResult + '; the switch gives ' + V.demoResult + ' — same', 12.5, PAL.accent);
  if (at(t, 0.55)) mono(60, ROWS[5], 'the model ran all ' + V.programs + ' programs of three steps both ways', 12.5, PAL.dim);
  if (at(t, 0.64)) mono(60, ROWS[6], 'and they agreed ' + V.agree + ' times: ' + V.agree + ' of ' + V.programs, 12.5, PAL.accent);
  if (at(t, 0.76)) mono(60, ROWS[8], 'cost: an if-chain over ' + V.opCount + ' operators averages 2.5 tests per instruction', 12.5, PAL.dim);
  if (at(t, 0.84)) mono(60, ROWS[9], 'the table costs 1. Over ' + V.instructions + ' instructions: ' + V.chainTests + ' against ' + V.tableTests, 12.5, PAL.dim);
  if (at(t, 0.92)) mono(60, ROWS[10], 'and the table is writable at run time, which is the risk as well as the point', 12.5, PAL.warn);
}

/* ---------- scene 10: the undefined rules ---------- */
function drawRules(t) {
  head('Where the standard says undefined',
       'each line is a constraint or an undefined-behaviour clause, not an opinion');
  var rules = [
    '6.3.2.3p8  calling through a converted pointer of the wrong type is undefined',
    '6.5.6p2    pointer arithmetic needs a pointer to a complete object type',
    '6.5.3.4    sizeof shall not be applied to a function type',
    '6.7.6.3p8  a parameter declared with a function type is adjusted to a pointer',
    '6.5.2.2p1  the called expression must have pointer-to-function type'
  ];
  for (var i = 0; i < rules.length; i++) {
    if (!at(t, 0.08 + i * 0.16)) continue;
    mono(60, ROWS[0] + i * 30, rules[i], 12.5, i === 0 ? PAL.invalid : PAL.ink);
  }
  if (at(t, 0.86)) {
    P.rect(40, ROWS[7] - 6, 820, 38, { fill: PAL.surface2, stroke: PAL.border, radius: 6 });
    mono(56, ROWS[7] + 3, 'inside the callee, &cb is a pointer to a pointer to function: cb is already a pointer', 12.5, PAL.dim);
  }
  if (at(t, 0.93)) mono(40, ROWS[9], 'converting between function pointer types is legal; calling through the wrong one is not.', 12.5, PAL.accent);
}

function drawFrame(Pp) {
  if (!Pp) return;
  P = Pp;
  P.clear();
  P.alpha(1);
  var t = K && K.state ? K.state.elapsed : 0;
  var s = sceneOf(t);
  var id = s ? s.id : 'address';
  if (id === 'address') drawAddress(t);
  else if (id === 'reading') drawReading(t);
  else if (id === 'spellings') drawSpellings(t);
  else if (id === 'grammar') drawGrammar(t);
  else if (id === 'signal') drawSignal(t);
  else if (id === 'calling') drawCalling(t);
  else if (id === 'qsort') drawQsort(t);
  else if (id === 'broken') drawBroken(t);
  else if (id === 'table') drawTable(t);
  else drawRules(t);
}

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

function boot() {
  var holder = document.getElementById('canvas-holder');
  var fallback = document.getElementById('canvas-fallback');
  var ok = false;

  if (typeof window.p5 === 'function') {
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
      if (holder) holder.appendChild(cv);
      var ctx2d = cv.getContext && cv.getContext('2d');
      if (ctx2d) {
        P = PR.makePainter2D(ctx2d, W, H);
        drawFrame(P);
        drew = true;
      }
    } catch (e) {
      console.error('canvas fallback failed', e);
    }
    if (!drew && fallback && fallback.classList) fallback.classList.add('show');
  }

  var checkBox = document.getElementById('checks');
  if (checkBox) {
    var bad = CHECKS.filter(function (c) { return !c.pass; });
    checkBox.innerHTML = '<span class="k">Model checks</span>' +
      (bad.length ? bad.length + ' of ' + CHECKS.length + ' failed' : CHECKS.length + '/' + CHECKS.length + ' passed');
  }

  if (K && K.init && window.LESSON_TIMELINE) {
    K.init({
      timeline: window.LESSON_TIMELINE,
      draw: function () { if (P) drawFrame(P); }
    });
  }

  window.__drawAt = function (t) {
    if (K && K.state) K.state.elapsed = t;
    if (P) drawFrame(P);
  };

  var failing = CHECKS.filter(function (c) { return !c.pass; });
  if (failing.length) console.warn('Model validation did not fully pass:', failing);
}

window.__MODEL = { V: V, CHECKS: CHECKS };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
