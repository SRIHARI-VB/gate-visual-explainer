/* ==========================================================================
   sequencing-and-order-of-evaluation-in-c — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model is ISO/IEC 9899:2018 (C17): 5.1.2.3 paragraphs 2 and 3 for the
   definitions of side effect, sequenced before, unsequenced and indeterminately
   sequenced; 6.5 paragraph 2 for the rule on an unsequenced side effect;
   6.5.2.2 for the call and its arguments; 6.5.13, 6.5.14, 6.5.15 and 6.5.17 for
   the sequence points of &&, ||, ?: and the comma operator; 6.5.16 for the
   assignment store; 6.5.2.4 for postfix and prefix increment; and Annex C for
   the summary of the sequence points.
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

/* ---------- the sequencing relation, built from the atoms ---------- */

/* An atom is one indivisible evaluation: it reads or writes a named object.
   seqAfter lists the atoms that must finish before this one starts. */

function transitiveSeqAfter(atoms) {
  var byId = {};
  atoms.forEach(function (a) { byId[a.id] = a; });
  var after = {};
  atoms.forEach(function (a) {
    var set = {};
    var stack = (a.seqAfter || []).slice();
    while (stack.length) {
      var id = stack.pop();
      if (set[id]) continue;
      set[id] = true;
      var p = byId[id];
      if (p && p.seqAfter) p.seqAfter.forEach(function (x) { stack.push(x); });
    }
    after[a.id] = set;
  });
  return after;
}

/* every linear extension of the partial order = every allowable ordering */
function linearExtensions(atoms, after) {
  var out = [], used = {}, cur = [];
  function rec() {
    if (cur.length === atoms.length) { out.push(cur.slice()); return; }
    for (var i = 0; i < atoms.length; i++) {
      var a = atoms[i];
      if (used[a.id]) continue;
      var pre = Object.keys(after[a.id]);
      var ok = true;
      for (var j = 0; j < pre.length; j++) if (!used[pre[j]]) { ok = false; break; }
      if (!ok) continue;
      used[a.id] = true; cur.push(a);
      rec();
      cur.pop(); used[a.id] = false;
    }
  }
  rec();
  return out;
}

function accessesOf(a) {
  return (a.reads || []).concat(a.writes || []);
}

/* two atoms conflict when they touch one scalar, at least one writes, and
   neither is sequenced before the other */
function conflictsOf(atoms, after) {
  var out = [];
  for (var i = 0; i < atoms.length; i++) {
    for (var j = i + 1; j < atoms.length; j++) {
      var a = atoms[i], b = atoms[j];
      var aBefore = !!after[b.id][a.id];
      var bBefore = !!after[a.id][b.id];
      if (aBefore || bBefore) continue;
      var shared = accessesOf(a).filter(function (o) {
        return accessesOf(b).indexOf(o) >= 0;
      });
      if (!shared.length) continue;
      var writes = (a.writes || []).length > 0 || (b.writes || []).length > 0;
      if (writes) out.push({ pair: a.id + ' vs ' + b.id, object: shared[0] });
    }
  }
  return out;
}

/* simulate one ordering and read the observable */
function runOrdering(form, seq) {
  var st = {}, slots = {};
  Object.keys(form.init).forEach(function (k) { st[k] = form.init[k]; });
  seq.forEach(function (a) { a.apply(st, slots); });
  return form.result(slots, st);
}

function analyse(form) {
  var after = transitiveSeqAfter(form.atoms);
  var orders = linearExtensions(form.atoms, after);
  var values = orders.map(function (seq) { return runOrdering(form, seq); });
  var conflicts = conflictsOf(form.atoms, after);
  var distinct = [];
  values.forEach(function (v) { if (distinct.indexOf(v) < 0) distinct.push(v); });
  distinct.sort(function (x, y) { return x - y; });
  return {
    key: form.key, code: form.code, note: form.note, repair: form.repair,
    orderings: orders.length,
    values: values,
    answers: distinct,
    conflicts: conflicts,
    defined: conflicts.length === 0
  };
}

/* ---------- the atoms, as builders ---------- */

/* read i into a slot */
function readI(id, slot) {
  return { id: id, reads: ['i'], apply: function (st, s) { s[slot] = st.i; } };
}
/* store slot + 1 into i, optionally publishing the stored value */
function writeI(id, slot, after, outSlot) {
  return {
    id: id, writes: ['i'], seqAfter: after,
    apply: function (st, s) { st.i = s[slot] + 1; if (outSlot) s[outSlot] = st.i; }
  };
}

var FORMS = [
  {
    key: 'postpluspost', code: 'i++ + i++',
    note: 'two postfix increments of the same variable',
    repair: 'a = i; b = i; i += 2',
    init: { i: 5 },
    atoms: [readI('rA', 'a'), writeI('wA', 'a', ['rA']),
            readI('rB', 'b'), writeI('wB', 'b', ['rB'])],
    result: function (s) { return s.a + s.b; }
  },
  {
    key: 'postpluspre', code: 'i++ + ++i',
    note: 'one postfix and one prefix increment',
    repair: 'a = i++; b = ++i',
    init: { i: 5 },
    atoms: [readI('rA', 'a'), writeI('wA', 'a', ['rA']),
            readI('rB', 'b'), writeI('wB', 'b', ['rB'], 'vB')],
    result: function (s) { return s.a + s.vB; }
  },
  {
    key: 'postplusplain', code: 'i++ + i',
    note: 'one increment and one plain read',
    repair: 'a = i++; b = a + 1',
    init: { i: 5 },
    atoms: [readI('rA', 'a'), writeI('wA', 'a', ['rA']), readI('rB', 'b')],
    result: function (s) { return s.a + s.b; }
  },
  {
    key: 'assignpost', code: 'i = i++ + 1',
    note: 'the assignment store against the increment store',
    repair: 'i = i + 1',
    init: { i: 5 },
    atoms: [readI('rA', 'a'), writeI('wA', 'a', ['rA']),
            { id: 'wSet', writes: ['i'], seqAfter: ['rA'],
              apply: function (st, s) { st.i = s.a + 1; s.res = st.i; } }],
    result: function (s) { return s.res; }
  },
  {
    key: 'twoassign', code: '(i = 3) + (i = 4)',
    note: 'two assignments to one variable in one expression',
    repair: 'i = 4; x = 3 + i',
    init: { i: 5 },
    atoms: [
      { id: 'w3', writes: ['i'], apply: function (st, s) { st.i = 3; s.v3 = 3; } },
      { id: 'w4', writes: ['i'], apply: function (st, s) { st.i = 4; s.v4 = 4; } }
    ],
    result: function (s) { return s.v3 + s.v4; }
  },
  {
    key: 'comma', code: 'x = (i++, i)',
    note: 'the comma operator supplies a barrier',
    repair: 'already defined',
    init: { i: 5 },
    atoms: [readI('rA', 'a'), writeI('wA', 'a', ['rA']),
            { id: 'rC', reads: ['i'], seqAfter: ['wA'],
              apply: function (st, s) { s.c = st.i; } }],
    result: function (s) { return s.c; }
  },
  {
    key: 'twocalls', code: 'f() + g()',
    note: 'two calls that share nothing',
    repair: 'already defined',
    init: { i: 5 },
    atoms: [
      { id: 'cf', reads: [], writes: [], apply: function (st, s) { s.f = 2; } },
      { id: 'cg', reads: [], writes: [], apply: function (st, s) { s.g = 3; } }
    ],
    result: function (s) { return s.f + s.g; }
  },
  {
    key: 'arrayindex', code: 'a[i] = i++',
    note: 'the index read against the increment store',
    repair: 'a[i] = i + 1; i++',
    init: { i: 5 },
    atoms: [readI('rIdx', 'idx'), readI('rA', 'a'), writeI('wA', 'a', ['rA'])],
    result: function (s) { return s.idx; }
  },
  {
    key: 'twoargs', code: 'f(i++, i)',
    note: 'two arguments, one variable',
    repair: 't = i++; f(t, i)',
    init: { i: 5 },
    atoms: [readI('rA', 'a'), writeI('wA', 'a', ['rA']), readI('rB', 'b')],
    result: function (s) { return s.a * 10 + s.b; }
  },
  {
    key: 'definedadd', code: 'x = i + 1',
    note: 'no write at all',
    repair: 'already defined',
    init: { i: 5 },
    atoms: [{ id: 'rA', reads: ['i'], apply: function (st, s) { s.a = st.i; } }],
    result: function (s) { return s.a + 1; }
  }
];

var MODEL = {};
FORMS.forEach(function (f) { MODEL[f.key] = analyse(f); });

/* the enumeration the fifth scene shows in full */
var SIX = MODEL.postpluspost.values;

/* ---------- the sequence points ---------- */

/* Eight places, grouped from the standard's Annex C summary. Each entry names
   the clause that carries it. `barrier` marks the ones that appear inside an
   expression, which are the ones a question turns on. */
var POINTS = [
  { id: 'call', where: 'after the designator and the arguments, before the call', clause: '6.5.2.2p10', barrier: true },
  { id: 'and', where: 'after the left operand of &&', clause: '6.5.13p3', barrier: true },
  { id: 'or', where: 'after the left operand of ||', clause: '6.5.14p3', barrier: true },
  { id: 'commaop', where: 'after the left operand of the comma operator', clause: '6.5.17p2', barrier: true },
  { id: 'cond', where: 'after the first operand of ?:', clause: '6.5.15p4', barrier: true },
  { id: 'fullexpr', where: 'after a full expression, before the next one', clause: '6.8p4', barrier: false },
  { id: 'declarator', where: 'at the end of a full declarator', clause: 'Annex C', barrier: false },
  { id: 'library', where: 'before a library function returns', clause: 'Annex C', barrier: false }
];

/* the comma in an argument list is punctuation, not the comma operator */
var ARG_COMMA = {
  text: 'f(a, b)',
  isSequencePoint: false,
  why: 'the comma separates arguments; there is no sequence point between them'
};

/* ---------- the three verdicts ---------- */

var VERDICTS = [
  { key: 'twocalls', label: 'one answer, free order', order: 'two or more', answers: 'one',
    why: 'unspecified order: any ordering is correct, and the value is the same in all of them' },
  { key: 'twoargs', label: 'several answers', order: 'three', answers: 'two',
    why: 'undefined: the two arguments are unsequenced and one writes what the other reads' },
  { key: 'definedadd', label: 'one answer, fixed order', order: 'one', answers: 'one',
    why: 'nothing is written, so no side effect can be unsequenced' }
];

/* ---------- the four shapes a question takes ---------- */

var SHAPES = ['postpluspost', 'arrayindex', 'twoargs', 'assignpost'];

/* ---------- aggregate counts, all derived from the ten analyses ---------- */

function sum(field) {
  return FORMS.reduce(function (n, f) { return n + MODEL[f.key][field].length; }, 0);
}
var TOTAL_ORDERINGS = FORMS.reduce(function (n, f) { return n + MODEL[f.key].orderings; }, 0);
var TOTAL_CONFLICTS = sum('conflicts');
var DEFINED_COUNT = FORMS.filter(function (f) { return MODEL[f.key].defined; }).length;
var UNDEFINED_COUNT = FORMS.length - DEFINED_COUNT;

/* ---------- an independent cross-check of one enumeration ----------
   Brute force: every permutation of the four atoms, keep the ones that respect
   the sequencing constraints, and collect the sums. It must agree with the
   linear-extension walk above, or one of the two is wrong. */
function bruteForce(form) {
  var ids = form.atoms.map(function (a) { return a.id; });
  var byId = {};
  form.atoms.forEach(function (a) { byId[a.id] = a; });
  var perms = [];
  (function perm(cur, rest) {
    if (!rest.length) { perms.push(cur.slice()); return; }
    rest.forEach(function (id, i) {
      perm(cur.concat([id]), rest.slice(0, i).concat(rest.slice(i + 1)));
    });
  })([], ids);
  var sums = [], kept = 0;
  perms.forEach(function (order) {
    var pos = {};
    order.forEach(function (id, i) { pos[id] = i; });
    var legal = form.atoms.every(function (a) {
      return (a.seqAfter || []).every(function (p) { return pos[p] < pos[a.id]; });
    });
    if (!legal) return;
    kept++;
    sums.push(runOrdering(form, order.map(function (id) { return byId[id]; })));
  });
  var distinct = [];
  sums.forEach(function (v) { if (distinct.indexOf(v) < 0) distinct.push(v); });
  return { permutations: perms.length, kept: kept, distinct: distinct.sort(function (x, y) { return x - y; }) };
}

var BRUTE = bruteForce(FORMS[0]);

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* each form's ordering count and answer set, against the figures this page
   prints — the figures were read off the enumeration, so a drift in the model
   shows up as a failure rather than as a wrong caption */
var EXPECT = {
  postpluspost: { orderings: 6, answers: [10, 11], defined: false },
  postpluspre: { orderings: 6, answers: [11, 12], defined: false },
  postplusplain: { orderings: 3, answers: [10, 11], defined: false },
  assignpost: { orderings: 2, answers: [6], defined: false },
  twoassign: { orderings: 2, answers: [7], defined: false },
  comma: { orderings: 1, answers: [6], defined: true },
  twocalls: { orderings: 2, answers: [5], defined: true },
  arrayindex: { orderings: 3, answers: [5, 6], defined: false },
  twoargs: { orderings: 3, answers: [55, 56], defined: false },
  definedadd: { orderings: 1, answers: [6], defined: true }
};

FORMS.forEach(function (f) {
  var m = MODEL[f.key], e = EXPECT[f.key];
  chk('orderings of ' + f.code, m.orderings === e.orderings, m.orderings + ' found, ' + e.orderings + ' expected');
  chk('answers of ' + f.code, m.answers.join(',') === e.answers.join(','), '[' + m.answers.join(',') + '] found');
});

chk('three of the ten forms are defined', DEFINED_COUNT === 3, DEFINED_COUNT + ' defined');
chk('seven of the ten are undefined', UNDEFINED_COUNT === 7, UNDEFINED_COUNT + ' undefined');
chk('29 orderings across the ten forms', TOTAL_ORDERINGS === 29, TOTAL_ORDERINGS + ' orderings');
chk('11 conflicting pairs across the ten forms', TOTAL_CONFLICTS === 11, TOTAL_CONFLICTS + ' pairs');

chk('a defined form has no conflicting pair',
  FORMS.every(function (f) { return MODEL[f.key].defined === (MODEL[f.key].conflicts.length === 0); }),
  'defined and conflict-free agree on all ten');
chk('every conflicting pair involves a write',
  FORMS.every(function (f) {
    var byId = {};
    f.atoms.forEach(function (a) { byId[a.id] = a; });
    return MODEL[f.key].conflicts.every(function (c) {
      var ids = c.pair.split(' vs ');
      return (byId[ids[0]].writes || []).length > 0 || (byId[ids[1]].writes || []).length > 0;
    });
  }), 'no read-read pair is counted');

/* the counterexample the lesson leans on: one answer, still undefined */
chk('i = i++ + 1 has one answer and is undefined',
  MODEL.assignpost.answers.length === 1 && MODEL.assignpost.answers[0] === 6 && !MODEL.assignpost.defined,
  'answers [' + MODEL.assignpost.answers.join(',') + '], defined ' + MODEL.assignpost.defined);
chk('(i = 3) + (i = 4) has one answer and is undefined',
  MODEL.twoassign.answers.length === 1 && !MODEL.twoassign.defined,
  'answers [' + MODEL.twoassign.answers.join(',') + ']');

/* the postfix value computation must be sequenced before its own store */
chk('postfix value computation is sequenced before its store',
  FORMS.every(function (f) {
    var pairs = f.atoms.filter(function (a) { return a.id === 'wA'; });
    return pairs.every(function (a) { return (a.seqAfter || []).indexOf('rA') >= 0; });
  }), 'every wA lists rA in seqAfter');

/* the independent enumeration must agree with the linear-extension walk */
chk('brute force agrees with the linear-extension walk',
  BRUTE.kept === MODEL.postpluspost.orderings &&
  BRUTE.distinct.join(',') === MODEL.postpluspost.answers.join(','),
  BRUTE.kept + ' legal permutations of ' + BRUTE.permutations + ', answers [' + BRUTE.distinct.join(',') + ']');
chk('i++ + i++ gives four orderings of 10 and two of 11',
  SIX.filter(function (v) { return v === 10; }).length === 4 &&
  SIX.filter(function (v) { return v === 11; }).length === 2,
  '10 appears ' + SIX.filter(function (v) { return v === 10; }).length +
  ' times, 11 appears ' + SIX.filter(function (v) { return v === 11; }).length);
chk('no form has more than four distinct answers',
  FORMS.every(function (f) { return MODEL[f.key].answers.length <= 4; }), 'the largest set has ' +
  Math.max.apply(null, FORMS.map(function (f) { return MODEL[f.key].answers.length; })));

/* the sequence points */
chk('eight sequence-point places are listed', POINTS.length === 8, POINTS.length + ' listed');
chk('every listed place names a clause', POINTS.every(function (p) { return !!p.clause; }), 'all eight carry a clause reference');
chk('the four in-expression barriers are present',
  ['and', 'or', 'commaop', 'cond'].every(function (id) {
    return POINTS.some(function (p) { return p.id === id && p.barrier; });
  }), 'and, or, comma operator and ?: are marked as barriers');
chk('the argument comma is not a sequence point', ARG_COMMA.isSequencePoint === false, ARG_COMMA.why);
chk('the argument comma is not in the list',
  !POINTS.some(function (p) { return p.id === 'argcomma'; }), 'no entry for the separator');

/* the verdict table */
chk('three verdicts are stated', VERDICTS.length === 3, VERDICTS.length + ' rows');
chk('each verdict matches its form',
  VERDICTS.every(function (v) {
    var m = MODEL[v.key];
    if (v.key === 'twoargs') return !m.defined && m.answers.length === 2;
    if (v.key === 'twocalls') return m.defined && m.answers.length === 1 && m.orderings > 1;
    return m.defined && m.answers.length === 1 && m.orderings === 1;
  }), 'free order, several answers and fixed order are each demonstrated');

/* the four question shapes */
chk('all four question shapes are undefined',
  SHAPES.every(function (k) { return !MODEL[k].defined; }), 'four of four undefined');
chk('all four question shapes carry a rewrite',
  SHAPES.every(function (k) {
    return FORMS.filter(function (f) { return f.key === k; })[0].repair !== 'already defined';
  }), 'each row names a defined replacement');

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function ink(on) { return on ? INK : FAINT; }
function soft(on) { return on ? DIM : FAINT; }

function head(kicker) {
  P.alpha(1);
  P.text(28, 14, kicker, { size: 11, color: FAINT });
  P.line(28, 32, 872, 32, { stroke: BORDER, sw: 1 });
}

function panel(x, y, w, h, fill, stroke) {
  P.rect(x, y, w, h, { fill: fill || SURF2, stroke: stroke || BORDER, radius: 8, sw: 1.2 });
}

function node(x, y, label, r, on, fill) {
  P.circle(x, y, r, { fill: fill || (on ? SURF : SURF2), stroke: on ? ACC : BORDER, sw: 1.6 });
  P.text(x, y, label, { size: 12, mono: true, align: 'center', base: 'middle', color: ink(on) });
}

function beat(t, sc, n, of) {
  /* true once beat n of `of` inside scene sc has started */
  var span = (sc.end - sc.start) / of;
  return t >= sc.start + span * (n - 1) + 0.01;
}

/* ---------------- scene 1: grouping ---------------- */

function drawGrouping(sc, t) {
  head('Precedence groups the syntax. The schedule is a different question.');
  P.text(28, 44, 'f() + g() * h()', { size: 19, mono: true, bold: true, color: INK });
  P.text(300, 50, 'parsed as   f() + (g() * h())', { size: 12, mono: true, color: soft(beat(t, sc, 2, 4)) });

  var root = { x: 190, y: 118 }, f = { x: 96, y: 196 }, star = { x: 288, y: 196 };
  var g = { x: 238, y: 272 }, h = { x: 344, y: 272 };
  var on2 = beat(t, sc, 2, 4), on3 = beat(t, sc, 3, 4);

  P.line(root.x, root.y + 18, f.x, f.y - 18, { stroke: BORDER, sw: 1.4 });
  P.line(root.x, root.y + 18, star.x, star.y - 18, { stroke: BORDER, sw: 1.4 });
  P.line(star.x, star.y + 18, g.x, g.y - 18, { stroke: BORDER, sw: 1.4 });
  P.line(star.x, star.y + 18, h.x, h.y - 18, { stroke: BORDER, sw: 1.4 });

  node(root.x, root.y, '+', 18, true);
  node(f.x, f.y, 'f()', 20, true);
  node(star.x, star.y, '*', 18, on2);
  node(g.x, g.y, 'g()', 20, on3);
  node(h.x, h.y, 'h()', 20, on3);

  P.text(28, 310, 'The tree is fixed by the grammar.', { size: 12, color: INK });
  P.text(28, 332, 'Nothing in the tree says which call runs first.', { size: 11, color: FAINT });

  /* right column: three schedules */
  P.text(470, 108, 'Three legal schedules', { size: 13, bold: true, color: INK });
  P.text(470, 130, 'all of them compute the same value', { size: 11, color: FAINT });
  var rows = ['g() , h() , f()', 'f() , g() , h()', 'h() , g() , f()'];
  rows.forEach(function (r, i) {
    var y = 162 + i * 30;
    var on = beat(t, sc, 3, 4);
    panel(470, y - 16, 300, 26, on ? ACCDIM : SURF2, on ? ACC : BORDER);
    P.text(482, y - 3, (i + 1) + '.', { size: 11, mono: true, color: FAINT });
    P.text(504, y - 3, r, { size: 12, mono: true, color: ink(on) });
  });
  P.text(470, 268, 'No call writes what another reads,', { size: 11, color: FAINT });
  P.text(470, 288, 'so the order cannot change the answer.', { size: 11, color: FAINT });

  panel(28, 358, 844, 82, WARNDIM, WARN);
  P.text(44, 372, 'grouping  =  precedence + associativity  (which operator takes which operand)', { size: 12, mono: false, color: INK });
  P.text(44, 398, 'order of evaluation  =  unspecified, except across a sequence point', { size: 12, color: INK });
  P.text(44, 420, 'The two questions are independent. Every error on this topic starts by confusing them.', { size: 11, color: DIM });
}

/* ---------------- scene 2: evaluations ---------------- */

function drawEvaluations(sc, t) {
  head('One evaluation, two parts: a value computation and a side effect.');
  var on2 = beat(t, sc, 2, 4), on3 = beat(t, sc, 3, 4), on4 = beat(t, sc, 4, 4);

  P.text(28, 52, 'i++', { size: 20, mono: true, bold: true, color: INK });
  P.text(28, 78, 'i is 5', { size: 11, mono: true, color: FAINT });
  panel(120, 44, 250, 54, SURF, BORDER);
  P.text(132, 54, 'value computation', { size: 11, color: FAINT });
  P.text(132, 74, 'reads i, gives 5', { size: 12, mono: true, color: INK });
  P.arrow(374, 71, 424, 71, { stroke: ACC, sw: 1.6, head: 8 });
  P.text(399, 50, 'then', { size: 10, align: 'center', color: ACC });
  panel(430, 44, 250, 54, on2 ? ACCDIM : SURF, on2 ? ACC : BORDER);
  P.text(442, 54, 'side effect', { size: 11, color: FAINT });
  P.text(442, 74, 'stores 6', { size: 12, mono: true, color: INK });

  P.text(28, 142, '++i', { size: 20, mono: true, bold: true, color: INK });
  P.text(28, 168, 'i is 5', { size: 11, mono: true, color: FAINT });
  panel(120, 134, 250, 54, SURF, BORDER);
  P.text(132, 144, 'value computation', { size: 11, color: FAINT });
  P.text(132, 164, 'reads i, then stores', { size: 12, mono: true, color: INK });
  P.arrow(374, 161, 424, 161, { stroke: ACC, sw: 1.6, head: 8 });
  P.text(399, 140, 'then', { size: 10, align: 'center', color: ACC });
  panel(430, 134, 250, 54, on3 ? ACCDIM : SURF, on3 ? ACC : BORDER);
  P.text(442, 144, 'side effect', { size: 11, color: FAINT });
  P.text(442, 164, 'stores 6, yields 6', { size: 12, mono: true, color: INK });
  P.text(694, 152, 'the value it yields', { size: 11, color: FAINT });
  P.text(694, 172, 'is the stored one', { size: 11, color: FAINT });

  P.text(28, 236, 'i = i++ + 1', { size: 17, mono: true, bold: true, color: INK });
  panel(120, 250, 250, 54, SURF, BORDER);
  P.text(132, 260, 'value computations of both sides', { size: 11, color: FAINT });
  P.text(132, 280, 'right side gives 5 + 1', { size: 12, mono: true, color: INK });
  P.arrow(374, 277, 424, 277, { stroke: ACC, sw: 1.6, head: 8 });
  P.text(399, 256, 'then', { size: 10, align: 'center', color: ACC });
  panel(430, 250, 250, 54, on4 ? BADDIM : SURF, on4 ? BAD : BORDER);
  P.text(442, 260, 'store to the left side', { size: 11, color: FAINT });
  P.text(442, 280, 'stores 6 into i', { size: 12, mono: true, color: INK });
  P.text(694, 268, 'but i++ also stored,', { size: 11, color: BAD });
  P.text(694, 288, 'and nothing orders the two', { size: 11, color: BAD });

  P.text(28, 344, 'An evaluation has a value part and, sometimes, a side effect.', { size: 12, color: INK });
  P.text(28, 368, 'Reading an object is a value computation. Modifying an object is a side effect.', { size: 11, color: DIM });
  P.text(28, 392, 'The standard orders the two separately, which is why a store can be moved.', { size: 11, color: DIM });
  P.text(28, 420, 'i++ = read then store.   ++i = read then store, yielding the stored value.   = stores last.', { size: 11, mono: true, color: ACC });
}

/* ---------------- scene 3: sequence points ---------------- */

function drawPoints(sc, t) {
  head('A sequence point is a barrier: everything on its left is finished first.');
  var on2 = beat(t, sc, 2, 4), on3 = beat(t, sc, 3, 4);

  P.line(56, 130, 844, 130, { stroke: BORDER, sw: 2 });
  var marks = [
    { x: 120, label: 'call' }, { x: 250, label: '&&' }, { x: 380, label: '||' },
    { x: 510, label: ',' }, { x: 640, label: '?:' }, { x: 770, label: ';' }
  ];
  marks.forEach(function (m) {
    P.line(m.x, 106, m.x, 154, { stroke: on2 ? ACC : BORDER, sw: 1.8 });
    P.text(m.x, 160, m.label, { size: 12, mono: true, align: 'center', color: ink(on2) });
  });
  P.text(56, 96, 'free', { size: 10, color: FAINT });
  P.text(186, 96, 'free', { size: 10, color: FAINT });
  P.text(316, 96, 'free', { size: 10, color: FAINT });
  P.text(446, 96, 'free', { size: 10, color: FAINT });
  P.text(576, 96, 'free', { size: 10, color: FAINT });
  P.text(706, 96, 'free', { size: 10, color: FAINT });

  P.text(28, 196, 'The eight places, grouped from Annex C', { size: 12, bold: true, color: INK });
  var left = POINTS.slice(0, 4), right = POINTS.slice(4);
  left.forEach(function (p, i) {
    var y = 222 + i * 26;
    P.text(28, y, (i + 1) + '.', { size: 11, mono: true, color: FAINT });
    P.text(46, y, p.where, { size: 11, color: ink(on2) });
    P.text(46, y + 13, p.clause, { size: 9, mono: true, color: FAINT });
  });
  right.forEach(function (p, i) {
    var y = 222 + i * 26;
    P.text(470, y, (i + 5) + '.', { size: 11, mono: true, color: FAINT });
    P.text(488, y, p.where, { size: 11, color: ink(on2) });
    P.text(488, y + 13, p.clause, { size: 9, mono: true, color: FAINT });
  });

  panel(28, 350, 844, 92, on3 ? ACCDIM : SURF2, on3 ? ACC : BORDER);
  P.text(44, 364, 'A full expression is one that is not part of another: to the semicolon,', { size: 12, color: INK });
  P.text(44, 386, 'the condition of if or while, each part of a for header, or the expression in return.', { size: 12, color: INK });
  P.text(44, 410, 'Between two barriers nothing is ordered. Inside that gap the next scene applies the rule.', { size: 11, color: DIM });
  P.text(44, 428, 'The value computations of operands precede the result; their side effects do not.', { size: 11, color: DIM });
}

/* ---------------- scene 4: the rule ---------------- */

function drawUnsequenced(sc, t) {
  head('The rule that decides every question on this topic.');
  var on2 = beat(t, sc, 2, 4), on3 = beat(t, sc, 3, 4), on4 = beat(t, sc, 4, 4);

  panel(28, 42, 844, 88, BADDIM, BAD);
  P.text(44, 54, 'If a side effect on a scalar object is unsequenced relative to', { size: 12, color: INK });
  P.text(44, 76, 'another side effect on it, or to a value computation using its value,', { size: 12, color: INK });
  P.text(44, 98, 'the behaviour is undefined.        C17 6.5 paragraph 2', { size: 12, color: INK });

  P.text(28, 156, 'i = i++ + 1', { size: 18, mono: true, bold: true, color: INK });
  panel(120, 176, 240, 52, SURF, BORDER);
  P.text(132, 186, 'store from i++', { size: 11, color: FAINT });
  P.text(132, 206, 'i becomes 6', { size: 12, mono: true, color: INK });
  panel(470, 176, 240, 52, SURF, BORDER);
  P.text(482, 186, 'store from the assignment', { size: 11, color: FAINT });
  P.text(482, 206, 'i becomes 6', { size: 12, mono: true, color: INK });
  P.line(364, 202, 466, 202, { stroke: BAD, sw: 1.6, dash: [5, 4] });
  P.text(415, 178, 'unsequenced', { size: 11, align: 'center', color: BAD });
  P.text(728, 192, 'no barrier', { size: 11, color: BAD });
  P.text(728, 212, 'between them', { size: 11, color: BAD });

  P.text(28, 252, 'Both orderings leave i equal to 6, and the statement is undefined all the same.', { size: 12, color: ink(on3) });
  P.text(28, 276, 'A value you can compute is not evidence that the value is specified.', { size: 11, color: ink(on4) });

  panel(28, 300, 844, 96, WARNDIM, WARN);
  P.text(44, 314, 'Undefined is not "unknown": the standard imposes no requirement at all.', { size: 12, color: INK });
  P.text(44, 338, 'It may print 6, print something else, trap, or be removed by an optimiser', { size: 11, color: DIM });
  P.text(44, 360, 'that is allowed to assume the expression cannot occur.', { size: 11, color: DIM });
  P.text(44, 382, 'Unspecified is the weaker verdict: two or more possibilities, and any is correct.', { size: 11, color: DIM });

  P.text(28, 420, 'This is why the answer to a question about i = i++ + 1 is the verdict, not a number.', { size: 11, color: ink(on2) });
}

/* ---------------- scene 5: the enumeration ---------------- */

function drawEnumerate(sc, t) {
  head('i = 5;   i++ + i++   — every allowable ordering, enumerated');
  var on2 = beat(t, sc, 2, 4), on3 = beat(t, sc, 3, 4);

  var labels = ['rA  wA  rB  wB', 'rA  rB  wA  wB', 'rA  rB  wB  wA',
                'rB  rA  wA  wB', 'rB  rA  wB  wA', 'rB  wB  rA  wA'];
  var reads = ['5, 6', '5, 5', '5, 5', '5, 5', '5, 5', '5, 6'];
  var sums = SIX;

  P.text(28, 50, 'ordering of the four events', { size: 10, color: FAINT });
  P.text(300, 50, 'the two reads see', { size: 10, color: FAINT });
  P.text(430, 50, 'sum', { size: 10, color: FAINT });
  P.line(28, 64, 560, 64, { stroke: BORDER, sw: 1 });

  labels.forEach(function (lab, i) {
    var y = 74 + i * 26;
    P.text(28, y, lab, { size: 11.5, mono: true, color: INK });
    P.text(300, y, reads[i], { size: 11.5, mono: true, color: DIM });
    P.text(430, y, String(sums[i]), { size: 12, mono: true, bold: true, color: on2 ? ACC : INK });
  });

  panel(590, 44, 282, 200, on3 ? BADDIM : SURF2, on3 ? BAD : BORDER);
  P.text(604, 58, 'the set of answers', { size: 11, color: FAINT });
  P.text(604, 78, '10  and  11', { size: 17, mono: true, bold: true, color: INK });
  P.text(604, 106, 'four orderings give 10', { size: 11, color: DIM });
  P.text(604, 126, 'two orderings give 11', { size: 11, color: DIM });
  P.text(604, 152, 'unsequenced pairs: 3', { size: 11, color: BAD });
  P.text(604, 172, 'rA vs wB', { size: 11, mono: true, color: DIM });
  P.text(604, 190, 'wA vs rB', { size: 11, mono: true, color: DIM });
  P.text(604, 208, 'wA vs wB', { size: 11, mono: true, color: DIM });

  P.text(28, 252, 'Each read must come before its own store; nothing else is ordered.', { size: 11, color: DIM });
  P.text(28, 276, 'So the answer is not 10 and not 11. The statement is undefined.', { size: 12, color: ink(on3) });
  P.text(28, 302, 'A question that asks for the value of this expression has no answer to mark.', { size: 11, color: FAINT });

  panel(28, 336, 844, 100, SURF2, BORDER);
  P.text(44, 350, 'The same enumeration, run on all ten forms at load:', { size: 12, color: INK });
  P.text(44, 374, TOTAL_ORDERINGS + ' orderings,  ' + TOTAL_CONFLICTS + ' conflicting pairs,  ' +
         DEFINED_COUNT + ' of ' + FORMS.length + ' forms defined.', { size: 13, mono: true, bold: true, color: ACC });
  P.text(44, 398, 'These numbers are computed by the page, not quoted: the model checks under the canvas', { size: 11, color: DIM });
  P.text(44, 418, 're-run every count and fail loudly if a figure drifts.', { size: 11, color: DIM });
}

/* ---------------- scene 6: three verdicts ---------------- */

function drawVerdicts(sc, t) {
  head('Three verdicts, not two.');
  var on2 = beat(t, sc, 2, 4), on3 = beat(t, sc, 3, 4);

  var cards = [
    { x: 28, label: 'one answer, free order', code: 'f() + g()', m: MODEL.twocalls, colour: VAL, dim: ACCDIM },
    { x: 315, label: 'several answers', code: 'f(i++, i)', m: MODEL.twoargs, colour: BAD, dim: BADDIM },
    { x: 602, label: 'one answer, fixed order', code: 'x = i + 1', m: MODEL.definedadd, colour: VAL, dim: ACCDIM }
  ];
  cards.forEach(function (c, i) {
    var on = i === 0 ? true : (i === 1 ? on2 : on3);
    panel(c.x, 44, 270, 176, on ? c.dim : SURF2, on ? c.colour : BORDER);
    P.text(c.x + 14, 56, c.label, { size: 11.5, bold: true, color: ink(on) });
    P.text(c.x + 14, 80, c.code, { size: 14, mono: true, bold: true, color: INK });
    P.text(c.x + 14, 110, 'orderings: ' + c.m.orderings, { size: 11, color: DIM });
    P.text(c.x + 14, 130, 'answers: ' + c.m.answers.length, { size: 11, color: DIM });
    P.text(c.x + 14, 150, c.m.defined ? 'defined' : 'undefined', { size: 11.5, bold: true, color: c.colour });
    P.text(c.x + 14, 174, c.m.defined ? 'any order is correct' : 'no order is promised', { size: 10.5, color: FAINT });
  });

  panel(28, 240, 844, 84, WARNDIM, WARN);
  P.text(44, 254, 'unspecified: two or more possibilities, and every one of them is correct.', { size: 12, color: INK });
  P.text(44, 278, 'undefined: no requirement at all — not one of the possibilities is promised.', { size: 12, color: INK });
  P.text(44, 302, 'The middle verdict, several answers, is the one that is really undefined behaviour.', { size: 11, color: DIM });

  P.text(28, 348, 'Ten forms are enumerated on this page: ' + TOTAL_ORDERINGS + ' orderings, ' +
         TOTAL_CONFLICTS + ' conflicting pairs, ' + DEFINED_COUNT + ' defined.', { size: 11, color: DIM });
  P.text(28, 376, 'The verdict is an answer in its own right, and it is the answer a good question asks for.', { size: 12, color: INK });
  P.text(28, 404, 'An examiner who prints one number for an undefined statement has asked a broken question.', { size: 11, color: FAINT });
  P.text(28, 428, 'Saying so is the correct response; guessing the number is not.', { size: 11, color: FAINT });
}

/* ---------------- scene 7: short circuit ---------------- */

function drawShortCircuit(sc, t) {
  head('The operators that build their own barrier.');
  var on1 = true, on2 = beat(t, sc, 2, 4), on3 = beat(t, sc, 3, 4), on4 = beat(t, sc, 4, 4);

  P.text(28, 46, 'i < n && a[i] == x', { size: 18, mono: true, bold: true, color: INK });
  panel(28, 74, 300, 56, ACCDIM, ACC);
  P.text(40, 84, 'left operand', { size: 10.5, color: FAINT });
  P.text(40, 104, 'i < n', { size: 13, mono: true, color: INK });
  P.line(360, 62, 360, 142, { stroke: ACC, sw: 2.2 });
  P.text(360, 52, 'sequence point', { size: 10.5, align: 'center', color: ACC });
  panel(400, 74, 300, 56, SURF, BORDER);
  P.text(412, 84, 'right operand, evaluated after', { size: 10.5, color: FAINT });
  P.text(412, 104, 'a[i] == x', { size: 13, mono: true, color: INK });
  P.text(722, 92, 'safe: i is already', { size: 11, color: VAL });
  P.text(722, 112, 'checked against n', { size: 11, color: VAL });

  P.text(28, 176, 'a[i] == x && i < n', { size: 17, mono: true, bold: true, color: on2 ? INK : FAINT });
  P.text(360, 182, 'the read happens before the guard, so the guard protects nothing', { size: 11, color: on2 ? BAD : FAINT });

  P.text(28, 226, 'f(a, b)', { size: 15, mono: true, bold: true, color: on3 ? INK : FAINT });
  P.text(160, 230, 'comma as separator: no sequence point between the arguments', { size: 11, color: on3 ? DIM : FAINT });
  P.text(28, 264, '(a, b)', { size: 15, mono: true, bold: true, color: on3 ? INK : FAINT });
  P.text(160, 268, 'comma as operator: a sequence point after the left operand', { size: 11, color: on3 ? DIM : FAINT });

  panel(28, 296, 844, 100, on4 ? ACCDIM : SURF2, on4 ? ACC : BORDER);
  P.text(44, 310, 'x = (i++, i)   has one ordering and one answer: 6.', { size: 13, mono: true, bold: true, color: INK });
  P.text(44, 336, 'The parentheses matter: without them the comma separates arguments instead.', { size: 11, color: DIM });
  P.text(44, 358, '&&, ||, the comma operator and ?: each carry a sequence point; the call carries one', { size: 11, color: DIM });
  P.text(44, 378, 'after all its arguments, which is not the same as between them.', { size: 11, color: DIM });

  P.text(28, 424, 'A barrier is the usual repair, and it is cheaper than a temporary variable.', { size: 11, color: on4 ? INK : FAINT });
}

/* ---------------- scene 8: four forms ---------------- */

function drawFourForms(sc, t) {
  head('Four shapes, four verdicts, four rewrites.');
  var beats = [true, beat(t, sc, 2, 4), beat(t, sc, 3, 4), beat(t, sc, 4, 4)];
  var rows = SHAPES.map(function (k) {
    return FORMS.filter(function (f) { return f.key === k; })[0];
  });

  P.text(28, 50, 'form', { size: 10, color: FAINT });
  P.text(250, 50, 'verdict', { size: 10, color: FAINT });
  P.text(400, 50, 'answers', { size: 10, color: FAINT });
  P.text(560, 50, 'defined rewrite', { size: 10, color: FAINT });
  P.line(28, 64, 872, 64, { stroke: BORDER, sw: 1 });

  rows.forEach(function (f, i) {
    var m = MODEL[f.key], on = beats[i], y = 82 + i * 66;
    P.line(28, y + 46, 872, y + 46, { stroke: BORDER, sw: 0.8, dash: [3, 4] });
    P.text(28, y, f.code, { size: 13, mono: true, bold: true, color: ink(on) });
    P.text(28, y + 22, f.note, { size: 10, color: FAINT });
    P.text(250, y, m.defined ? 'defined' : 'undefined', { size: 12, bold: true, color: m.defined ? VAL : (on ? BAD : FAINT) });
    P.text(400, y, m.answers.length === 1 ? String(m.answers[0]) : m.answers.length + ' answers', { size: 11.5, mono: true, color: ink(on) });
    P.text(560, y, f.repair, { size: 11, mono: true, color: ink(on) });
  });

  P.text(28, 348, 'Three of the four have more than one answer. The fourth has exactly one and is undefined.', { size: 12, color: INK });
  P.text(28, 374, 'i = i++ + 1 is the row that teaches the rule: the arithmetic looks settled and the', { size: 11, color: DIM });
  P.text(28, 396, 'behaviour is not, so no compiler is obliged to produce that 6.', { size: 11, color: DIM });

  panel(28, 414, 844, 44, WARNDIM, WARN);
  P.text(44, 428, 'Correct output is not evidence of defined behaviour. That is the trap in row four.', { size: 11.5, color: INK });
}

/* ---------------- scene 9: the procedure ---------------- */

function drawExam(sc, t) {
  head('A five-step procedure that works on any expression.');
  var beats = [true, beat(t, sc, 2, 4), beat(t, sc, 3, 4), beat(t, sc, 4, 4), beat(t, sc, 4, 4)];

  var steps = [
    ['Find the full expression.', 'Up to the semicolon, or the controlling condition.'],
    ['Mark the barriers inside it.', 'The call, &&, ||, the comma operator, ?:.'],
    ['List every access to each variable.', 'One segment at a time; mark which accesses are writes.'],
    ['If two are unsequenced and one writes, stop.', 'The answer is: the behaviour is undefined.'],
    ['Otherwise the value is fixed.', 'Only the order of calls sharing nothing is free.']
  ];
  steps.forEach(function (s, i) {
    var y = 56 + i * 62, on = beats[i];
    P.circle(46, y + 12, 14, { fill: on ? ACCDIM : SURF2, stroke: on ? ACC : BORDER, sw: 1.4 });
    P.text(46, y + 12, String(i + 1), { size: 12, mono: true, align: 'center', base: 'middle', color: ink(on) });
    P.text(74, y, s[0], { size: 12.5, bold: true, color: ink(on) });
    P.text(74, y + 22, s[1], { size: 11, color: FAINT });
  });

  panel(28, 372, 844, 84, SURF2, BORDER);
  P.text(44, 386, 'A well-posed question either avoids the conflict or asks for the verdict.', { size: 12, color: INK });
  P.text(44, 410, 'A question that prints one number for an undefined statement has a broken premise,', { size: 11, color: DIM });
  P.text(44, 432, 'and the defensible answer is to say so rather than to guess the number.', { size: 11, color: DIM });
}

/* ---------------- scene 10: consolidation ---------------- */

function drawConsolidate(sc, t) {
  head('The chain, the six slips, and the one-line test.');
  var on2 = beat(t, sc, 2, 4), on3 = beat(t, sc, 3, 4);

  var chain = ['an expression', 'is events', 'barriers', 'order them', 'a gap', 'lets them move', 'a write in', 'the gap', 'undefined'];
  var xs = [28, 202, 376, 550, 724];
  xs.forEach(function (x, i) {
    panel(x, 44, 158, 56, i === 4 ? BADDIM : SURF2, i === 4 ? BAD : BORDER);
    P.text(x + 10, 54, chain[i * 2], { size: 10.5, color: FAINT });
    P.text(x + 10, 76, chain[i * 2 + 1], { size: 11.5, bold: true, color: INK });
    if (i < 4) P.arrow(x + 160, 72, x + 172, 72, { stroke: BORDER, sw: 1.4, head: 6 });
  });

  P.text(28, 128, 'Six slips', { size: 12, bold: true, color: INK });
  var slips = [
    'associativity read as execution order',
    'unspecified order called undefined',
    'the argument comma taken for the comma operator',
    'one printed answer trusted as a definition',
    'a call assumed to order its arguments',
    'an array assumed to be one scalar object'
  ];
  slips.forEach(function (s, i) {
    var y = 152 + i * 24;
    P.text(28, y, (i + 1) + '.', { size: 10.5, mono: true, color: FAINT });
    P.text(46, y, s, { size: 11, color: ink(on2) });
  });

  panel(28, 306, 844, 110, on3 ? ACCDIM : SURF2, on3 ? ACC : BORDER);
  P.text(44, 320, 'The one-line test: name the barriers, then ask what writes and what reads inside the gap.', { size: 12, color: INK });
  P.text(44, 344, 'Nothing writes what anything else reads  ->  the answer is computable.', { size: 11, color: VAL });
  P.text(44, 366, 'Something does  ->  the answer is the verdict, not a number.', { size: 11, color: BAD });
  P.text(44, 392, TOTAL_ORDERINGS + ' orderings, ' + TOTAL_CONFLICTS + ' conflicting pairs, ' +
         DEFINED_COUNT + ' of ' + FORMS.length + ' forms defined — recomputed at load.', { size: 11, mono: true, color: DIM });

  P.text(28, 434, 'Three verdicts, four rewrites, and a habit: read the events, not the arithmetic.', { size: 11, color: INK });
}

/* ---------------- dispatch ---------------- */

var SCENES = {
  grouping: drawGrouping,
  evaluations: drawEvaluations,
  points: drawPoints,
  unsequenced: drawUnsequenced,
  enumerate: drawEnumerate,
  verdicts: drawVerdicts,
  shortcircuit: drawShortCircuit,
  fourforms: drawFourForms,
  exam: drawExam,
  consolidate: drawConsolidate
};

function sceneAt(t) {
  var tl = window.LESSON_TIMELINE;
  for (var i = tl.scenes.length - 1; i >= 0; i--) {
    if (t >= tl.scenes[i].start - 1e-6) return tl.scenes[i];
  }
  return tl.scenes[0];
}

function drawFrame(t) {
  if (!P) return;
  P.clear();
  P.alpha(1);
  var sc = sceneAt(t);
  var fn = SCENES[sc.id];
  if (fn) fn(sc, t);
}

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

function boot() {
  var holder = document.getElementById('canvas-holder');
  var fallback = document.getElementById('canvas-fallback');
  var checksEl = document.getElementById('checks');

  if (checksEl) {
    var passed = CHECKS.filter(function (c) { return c.pass; }).length;
    checksEl.innerHTML = '<span class="k">Model checks</span>' + passed + ' of ' + CHECKS.length +
      ' pass &middot; ' + TOTAL_ORDERINGS + ' orderings &middot; ' + TOTAL_CONFLICTS + ' conflicts';
  }

  var ok = false;
  if (window.p5 && holder) {
    try {
      new window.p5(function (sk) {
        sk.setup = function () {
          var c = sk.createCanvas(W, H);
          c.parent(holder);
          P = PR.makePainterP5(sk, W, H);
          drawFrame(0);
        };
        sk.draw = function () {
          drawFrame(K && K.state ? K.state.elapsed : 0);
        };
      });
      ok = true;
    } catch (e) {
      console.warn('p5 failed', e);
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
        drawFrame(0);
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
      draw: function () { if (P) drawFrame(K.state.elapsed); }
    });
  }

  window.__drawAt = function (t) {
    if (K && K.state) K.state.elapsed = t;
    if (P) drawFrame(t);
  };

  var bad = CHECKS.filter(function (c) { return !c.pass; });
  if (bad.length) console.warn('Model validation did not fully pass:', bad);
}

window.__MODEL = {
  CHECKS: CHECKS,
  FORMS: MODEL,
  POINTS: POINTS,
  ARG_COMMA: ARG_COMMA,
  VERDICTS: VERDICTS,
  SHAPES: SHAPES,
  TOTALS: {
    orderings: TOTAL_ORDERINGS, conflicts: TOTAL_CONFLICTS,
    defined: DEFINED_COUNT, undefined: UNDEFINED_COUNT, forms: FORMS.length
  },
  BRUTE: BRUTE
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
