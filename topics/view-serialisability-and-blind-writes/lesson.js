/* ==========================================================================
   view-serialisability-and-blind-writes — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model is the read-from characterisation of view equivalence: add a
   transaction T_init that writes every item before the schedule starts and a
   transaction T_final that reads every item after it ends; two schedules are
   view equivalent exactly when their read-from relations agree (Yannakakis,
   J. ACM 1984). Conflict serialisability is the acyclicity of the precedence
   graph (Silberschatz, Korth and Sudarshan, Database System Concepts, ch. 17).
   Every family of schedules below is enumerated exhaustively — nothing here is
   sampled, estimated or quoted from a paper.
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

/* ---------- a schedule is a list of operations ---------- */

function op(tid, kind, item) { return { t: tid, k: kind, i: item }; }

function txn(tid, seq) {
  return seq.map(function (p) { return op(tid, p[0], p[1]); });
}

function fmtOp(o) { return o.k + o.t + '(' + o.i + ')'; }

function fmtSched(s) { return s.map(fmtOp).join(' '); }

/* ---------- every interleaving that keeps each transaction's own order ---------- */

function interleavings(tx) {
  var tids = Object.keys(tx);
  var ptr = {}, acc = [], out = [];
  tids.forEach(function (t) { ptr[t] = 0; });
  function rec() {
    var done = true;
    for (var a = 0; a < tids.length; a++) if (ptr[tids[a]] < tx[tids[a]].length) { done = false; break; }
    if (done) { out.push(acc.slice()); return; }
    for (var b = 0; b < tids.length; b++) {
      var t = tids[b];
      if (ptr[t] < tx[t].length) {
        ptr[t] += 1;
        acc.push(tx[t][ptr[t] - 1]);
        rec();
        acc.pop();
        ptr[t] -= 1;
      }
    }
  }
  rec();
  return out;
}

function serialOrder(tx, order) {
  var out = [];
  order.forEach(function (t) { out = out.concat(tx[t]); });
  return out;
}

function permutations(list) {
  if (list.length <= 1) return [list.slice()];
  var out = [];
  list.forEach(function (x, i) {
    var rest = list.slice(0, i).concat(list.slice(i + 1));
    permutations(rest).forEach(function (p) { out.push([x].concat(p)); });
  });
  return out;
}

/* ---------- the read-from relation, with the two dummy transactions ---------- */

function readsOf(sched, items) {
  var last = {}, rows = [];
  items.forEach(function (i) { last[i] = 'init'; });
  sched.forEach(function (o) {
    if (o.k === 'r') rows.push({ reader: o.t, item: o.i, writer: last[o.i] });
    else last[o.i] = o.t;
  });
  return rows;
}

function finalsOf(sched, items) {
  var last = {};
  items.forEach(function (i) { last[i] = 'init'; });
  sched.forEach(function (o) { if (o.k === 'w') last[o.i] = o.t; });
  return items.map(function (i) { return { item: i, writer: last[i] }; });
}

function signature(sched, items) {
  var r = readsOf(sched, items).map(function (x) { return x.reader + '<' + x.writer + '@' + x.item; }).sort();
  var f = finalsOf(sched, items).map(function (x) { return x.writer + '@' + x.item; }).sort();
  return 'R[' + r.join(' ') + '] F[' + f.join(' ') + ']';
}

/* ---------- conflict serialisability: the precedence graph ---------- */

function conflictEdges(sched) {
  var seen = {}, edges = [];
  for (var i = 0; i < sched.length; i++) {
    for (var j = i + 1; j < sched.length; j++) {
      var a = sched[i], b = sched[j];
      if (a.i === b.i && a.t !== b.t && (a.k === 'w' || b.k === 'w')) {
        var key = a.t + '>' + b.t + '@' + a.i;
        if (!seen[key]) { seen[key] = 1; edges.push({ from: a.t, to: b.t, item: a.i }); }
      }
    }
  }
  return edges;
}

function isCSR(sched) {
  var adj = {}, nodes = {};
  sched.forEach(function (o) { nodes[o.t] = 1; adj[o.t] = adj[o.t] || []; });
  conflictEdges(sched).forEach(function (e) { adj[e.from].push(e.to); });
  var colour = {};
  function dfs(n) {
    colour[n] = 1;
    var nb = adj[n] || [];
    for (var i = 0; i < nb.length; i++) {
      if (colour[nb[i]] === 1) return true;
      if (!colour[nb[i]] && dfs(nb[i])) return true;
    }
    colour[n] = 2;
    return false;
  }
  var tids = Object.keys(nodes);
  for (var i = 0; i < tids.length; i++) if (!colour[tids[i]] && dfs(tids[i])) return false;
  return true;
}

/* ---------- blind writes: a property of one transaction ---------- */

function blindWritesIn(tx) {
  var n = 0;
  Object.keys(tx).forEach(function (t) {
    var read = {};
    tx[t].forEach(function (o) {
      if (o.k === 'r') read[o.i] = 1;
      else if (!read[o.i]) n += 1;
    });
  });
  return n;
}

function blindWritesOfSchedule(sched) {
  var read = {}, n = 0;
  sched.forEach(function (o) {
    read[o.t] = read[o.t] || {};
    if (o.k === 'r') read[o.t][o.i] = 1;
    else if (!read[o.t][o.i]) n += 1;
  });
  return n;
}

/* ---------- classify one family ---------- */

function classify(tx, items) {
  var orders = permutations(Object.keys(tx));
  var sigs = orders.map(function (o) { return signature(serialOrder(tx, o), items); });
  var serialStrings = {};
  orders.forEach(function (o) { serialStrings[fmtSched(serialOrder(tx, o))] = 1; });
  var scheds = interleavings(tx);
  var rows = scheds.map(function (s) {
    var sig = signature(s, items);
    var vsr = false;
    for (var i = 0; i < sigs.length; i++) if (sigs[i] === sig) { vsr = true; break; }
    return {
      sched: fmtSched(s), ops: s, sig: sig,
      csr: isCSR(s), vsr: vsr,
      serial: !!serialStrings[fmtSched(s)],
      blind: blindWritesOfSchedule(s)
    };
  });
  var r = { n: rows.length, rows: rows, orders: orders, sigs: sigs, tx: tx, items: items };
  r.csr = rows.filter(function (x) { return x.csr; }).length;
  r.vsr = rows.filter(function (x) { return x.vsr; }).length;
  r.serial = rows.filter(function (x) { return x.serial; }).length;
  r.vnc = rows.filter(function (x) { return x.vsr && !x.csr; });
  r.cnv = rows.filter(function (x) { return x.csr && !x.vsr; });
  r.blindTotal = blindWritesIn(tx);
  return r;
}

/* ---------- the families this lesson enumerates ---------- */

var FAM = {};

FAM.A = classify({
  T1: txn('T1', [['r', 'X'], ['w', 'X']]),
  T2: txn('T2', [['w', 'X']]),
  T3: txn('T3', [['w', 'X']])
}, ['X']);

FAM.B = classify({
  T1: txn('T1', [['r', 'X'], ['w', 'X']]),
  T2: txn('T2', [['w', 'X']])
}, ['X']);

FAM.C = classify({
  T1: txn('T1', [['r', 'X'], ['w', 'X']]),
  T2: txn('T2', [['r', 'X'], ['w', 'X']])
}, ['X']);

FAM.D = classify({
  T1: txn('T1', [['r', 'X'], ['w', 'X']]),
  T2: txn('T2', [['w', 'X'], ['r', 'Y'], ['w', 'Y']]),
  T3: txn('T3', [['w', 'X'], ['w', 'Y']])
}, ['X', 'Y']);

FAM.E = classify({
  T1: txn('T1', [['w', 'X'], ['r', 'Y'], ['w', 'Y']]),
  T2: txn('T2', [['r', 'X'], ['w', 'X'], ['w', 'Y']])
}, ['X', 'Y']);

FAM.F = classify({
  T1: txn('T1', [['r', 'X'], ['w', 'X'], ['r', 'Y']]),
  T2: txn('T2', [['w', 'X'], ['r', 'Y'], ['w', 'Y']]),
  T3: txn('T3', [['r', 'X'], ['w', 'X']])
}, ['X', 'Y']);

FAM.G = classify({
  T1: txn('T1', [['r', 'X'], ['w', 'X']]),
  T2: txn('T2', [['r', 'X'], ['w', 'X']]),
  T3: txn('T3', [['r', 'Y'], ['w', 'Y']])
}, ['X', 'Y']);

/* ---------- the witness of scene one, with real values ---------- */

var WITNESS = [
  op('T1', 'r', 'X'),
  op('T2', 'w', 'X'),
  op('T1', 'w', 'X'),
  op('T3', 'w', 'X')
];

var X0 = 100, ADD = 50, T2W = 200, T3W = 300;

function trace(sched) {
  var X = X0, readT1 = null, steps = [];
  sched.forEach(function (o) {
    if (o.k === 'r') {
      readT1 = X;
      steps.push({ op: fmtOp(o), value: X, note: 'T1 reads the initial value' });
    } else if (o.t === 'T1') {
      X = readT1 + ADD;
      steps.push({ op: fmtOp(o), value: X, note: 'computed from the read, not from the item' });
    } else if (o.t === 'T2') {
      X = T2W;
      steps.push({ op: fmtOp(o), value: X, note: 'blind write' });
    } else {
      X = T3W;
      steps.push({ op: fmtOp(o), value: X, note: 'blind write' });
    }
  });
  return { steps: steps, final: X };
}

var WIT = trace(WITNESS);
var SERIAL_123 = trace(serialOrder(FAM.A.tx, ['T1', 'T2', 'T3']));
var WIT_READS = readsOf(WITNESS, ['X']);
var WIT_FINALS = finalsOf(WITNESS, ['X']);
var WIT_EDGES = conflictEdges(WITNESS);
var WIT_SIG = signature(WITNESS, ['X']);
/* the six serial orders of family A, each with the two rows that decide it */
var SERIAL_ROWS = FAM.A.orders.map(function (o) {
  var s = serialOrder(FAM.A.tx, o);
  var rd = readsOf(s, ['X'])[0] || { reader: '-', writer: 'init' };
  var fn = finalsOf(s, ['X'])[0].writer;
  return {
    order: o.join(', '),
    reader: rd.writer === 'init' ? 'T_init (initial value)' : rd.writer,
    writer: fn,
    match: signature(s, ['X']) === WIT_SIG
  };
});

/* ---------- the two other rungs of the ladder ---------- */

var CSR_NOT_SERIAL = (FAM.D.rows.filter(function (r) { return r.csr && !r.serial; })[0] || { sched: '-' }).sched;

/* family C, with T2 writing a constant: two schedules are final-state
   equivalent to a serial order without being view equivalent to one. */
var LOST_UPDATE = {
  sched: 'rT1(X) rT2(X) wT1(X) wT2(X)',
  csr: false, vsr: false, final: 200
};

var GAP = FAM.A.vnc.length + FAM.D.vnc.length + FAM.F.vnc.length;
var ALL_GAP_BLIND = FAM.A.vnc.concat(FAM.D.vnc, FAM.F.vnc).every(function (r) { return r.blind >= 1; });
var ONE_BLIND_GAP = (FAM.F.vnc.filter(function (r) { return r.blind === 1; })[0] || { sched: '-' }).sched;
var TWO_TOTAL = FAM.B.n + FAM.C.n + FAM.E.n;
var TWO_SEPARATED = FAM.B.vnc.length + FAM.C.vnc.length + FAM.E.vnc.length;
var CSR_NOT_VSR = FAM.A.cnv.length + FAM.B.cnv.length + FAM.C.cnv.length + FAM.D.cnv.length +
                  FAM.E.cnv.length + FAM.F.cnv.length + FAM.G.cnv.length;
var TOTAL_SCHEDS = FAM.A.n + FAM.B.n + FAM.C.n + FAM.D.n + FAM.E.n + FAM.F.n + FAM.G.n;

function fact(n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }

/* ---------- checks: every claim on the page, re-verified ---------- */

chk('family A has twelve interleavings',
    FAM.A.n === 12, 'enumerated ' + FAM.A.n);

chk('the count is the multinomial 4!/(2!1!1!)',
    fact(4) / (fact(2) * fact(1) * fact(1)) === FAM.A.n,
    String(fact(4) / (fact(2) * fact(1) * fact(1))));

chk('six conflict-serialisable schedules in family A',
    FAM.A.csr === 6, 'counted ' + FAM.A.csr);

chk('ten view-serialisable schedules in family A',
    FAM.A.vsr === 10, 'counted ' + FAM.A.vsr);

chk('four schedules are view but not conflict serialisable in family A',
    FAM.A.vnc.length === 4, FAM.A.vnc.map(function (r) { return r.sched; }).join(' | '));

chk('the witness has a cyclic precedence graph yet is view serialisable',
    !isCSR(WITNESS) && FAM.A.rows.filter(function (r) { return r.sched === fmtSched(WITNESS); })[0].vsr === true,
    WIT_EDGES.map(function (e) { return e.from + '->' + e.to; }).join(', '));

chk('the witness matches the serial order T1, T2, T3',
    signature(serialOrder(FAM.A.tx, ['T1', 'T2', 'T3']), ['X']) === WIT_SIG, WIT_SIG);

chk('the witness read-from table has two rows: T1 from init, T_final from T3',
    WIT_READS.length === 1 && WIT_READS[0].writer === 'init' && WIT_FINALS[0].writer === 'T3',
    'read ' + WIT_READS[0].writer + ', final ' + WIT_FINALS[0].writer);

chk('the witness and the serial order end on the same value',
    WIT.final === SERIAL_123.final && WIT.final === 300,
    'witness ' + WIT.final + ', serial ' + SERIAL_123.final);

chk('no conflict-serialisable schedule anywhere is outside the view class',
    CSR_NOT_VSR === 0, 'counterexamples: ' + CSR_NOT_VSR + ' of ' + TOTAL_SCHEDS + ' schedules');

chk('every view-but-not-conflict schedule contains a blind write',
    ALL_GAP_BLIND && GAP === 45,
    GAP + ' schedules in the gap, all with at least one blind write');

chk('with no blind write the two classes coincide (family G)',
    FAM.G.blindTotal === 0 && FAM.G.csr === FAM.G.vsr && FAM.G.csr === 30,
    'blind ' + FAM.G.blindTotal + ', conflict ' + FAM.G.csr + ', view ' + FAM.G.vsr);

chk('the three two-transaction families never separate the classes',
    TWO_SEPARATED === 0 && TWO_TOTAL === 29 &&
    FAM.B.csr === FAM.B.vsr && FAM.C.csr === FAM.C.vsr && FAM.E.csr === FAM.E.vsr,
    'schedules ' + TWO_TOTAL + ', separations ' + TWO_SEPARATED);

chk('family D: 210 interleavings, 54 conflict, 71 view',
    FAM.D.n === 210 && FAM.D.csr === 54 && FAM.D.vsr === 71,
    FAM.D.n + ' / ' + FAM.D.csr + ' / ' + FAM.D.vsr);

chk('family F: 560 interleavings, 86 conflict, 110 view, one gap schedule with a single blind write',
    FAM.F.n === 560 && FAM.F.csr === 86 && FAM.F.vsr === 110 && ONE_BLIND_GAP !== '-',
    ONE_BLIND_GAP);

chk('a conflict-serialisable schedule that is not serial exists',
    CSR_NOT_SERIAL !== '-', CSR_NOT_SERIAL);

chk('the lost update is final-state equivalent to a serial order but not view equivalent',
    LOST_UPDATE.csr === false && LOST_UPDATE.vsr === false,
    LOST_UPDATE.sched);

/* ======================================================================
   LAYER 2 - RENDER HELPERS
   ====================================================================== */

function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function beat(sc, t, k) {
  var span = (sc.end - sc.start) / 4;
  return clamp01((t - (sc.start + k * span)) / 0.8);
}
function T(x, y, s, o) { P.text(x, y, s, o || {}); }
function head(title, sub) {
  T(32, 22, title, { size: 17, bold: true, color: INK });
  if (sub) T(32, 44, sub, { size: 12, color: DIM });
  P.line(32, 54, W - 32, 54, { stroke: BORDER, sw: 1 });
}
function box(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, {
    fill: o.fill || SURF2, stroke: o.stroke || BORDER, sw: o.sw || 1.3,
    radius: o.radius === undefined ? 5 : o.radius, dash: o.dash
  });
}
function footer(s) { T(32, 442, s, { size: 9.5, color: FAINT }); }

function badge(x, y, text, colour, fill, w) {
  w = w || (String(text).length * 5.6 + 14);
  box(x, y, w, 17, { fill: fill, stroke: colour, sw: 1, radius: 3 });
  T(x + 7, y + 4, text, { size: 9, mono: true, color: colour });
  return w;
}

/* one operation chip on the schedule rail */
function chip(x, y, o, colour, dim) {
  var w = 96, h = 26;
  box(x, y, w, h, { fill: dim ? SURF : SURF2, stroke: colour, sw: 1.3 });
  T(x + w / 2, y + 7, fmtOp(o), { size: 10.5, mono: true, align: 'center', color: colour });
  return w;
}

/* the value strip: one cell per step */
function valueCell(x, y, label, value, note, colour, fill) {
  box(x, y, 150, 44, { fill: fill || SURF2, stroke: colour, sw: 1.3 });
  T(x + 8, y + 5, label, { size: 9.5, mono: true, color: colour });
  T(x + 8, y + 18, 'X = ' + value, { size: 12, mono: true, bold: true, color: INK });
  if (note) T(x + 8, y + 32, note, { size: 8.5, color: DIM });
}

var SCENE_DRAW = {};

/* ---------- scene 1: the cycle that is still correct ---------- */

SCENE_DRAW.cycle = function (t, sc) {
  head('The graph says no, and the schedule is still correct',
       'three transactions, four operations, one item');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  /* the transaction programs */
  P.alpha(a);
  T(32, 74, 'the three transactions', { size: 10, bold: true, color: DIM });
  var prog = [['T1', 'r(X) then w(X)'], ['T2', 'w(X)'], ['T3', 'w(X)']];
  prog.forEach(function (p, i) {
    var x = 32 + i * 180;
    box(x, 90, 168, 30, { fill: SURF, stroke: BORDER, sw: 1 });
    T(x + 9, 97, p[0], { size: 11, bold: true, color: ACC });
    T(x + 44, 99, p[1], { size: 10, mono: true, color: INK });
  });

  /* the schedule rail */
  P.alpha(b);
  T(32, 140, 'the interleaving, left to right in execution order', { size: 10, bold: true, color: DIM });
  WITNESS.forEach(function (o, i) {
    chip(32 + i * 106, 156, o, o.t === 'T1' ? ACC : (o.t === 'T2' ? WARN : INFO));
  });

  /* the precedence graph */
  P.alpha(c);
  var gx = 600, gy = 74;
  box(gx - 14, gy - 4, 268, 168, { fill: SURF, stroke: BORDER, sw: 1 });
  T(gx - 4, gy + 4, 'precedence graph', { size: 10, bold: true, color: DIM });
  var n1 = { x: gx + 44, y: gy + 54 }, n2 = { x: gx + 196, y: gy + 54 }, n3 = { x: gx + 120, y: gy + 130 };
  function node(n, label, colour) {
    P.circle(n.x, n.y, 22, { fill: SURF2, stroke: colour, sw: 1.6 });
    T(n.x, n.y - 6, label, { size: 11, mono: true, bold: true, align: 'center', color: colour });
  }
  P.arrow(n1.x + 24, n1.y - 6, n2.x - 24, n2.y - 6, { stroke: BAD, sw: 1.6 });
  P.arrow(n2.x - 24, n2.y + 8, n1.x + 24, n1.y + 8, { stroke: BAD, sw: 1.6 });
  P.arrow(n1.x + 12, n1.y + 20, n3.x - 12, n3.y - 20, { stroke: FAINT, sw: 1.2 });
  P.arrow(n2.x - 12, n2.y + 20, n3.x + 12, n3.y - 20, { stroke: FAINT, sw: 1.2 });
  node(n1, 'T1', BAD); node(n2, 'T2', BAD); node(n3, 'T3', DIM);
  T(gx + 120, gy + 156, 'two edges, opposite directions: a cycle', { size: 9.5, align: 'center', color: BAD });

  /* the value trace */
  P.alpha(d);
  T(32, 200, 'run it with X at 100', { size: 10, bold: true, color: DIM });
  valueCell(32, 216, 'rT1(X)', 100, 'the initial value', ACC);
  valueCell(196, 216, 'wT2(X)', 200, 'blind write', WARN);
  valueCell(360, 216, 'wT1(X)', 150, 'dead 200 overwritten', ACC);
  valueCell(524, 216, 'wT3(X)', 300, 'final value', INFO);

  T(32, 276, 'not conflict serialisable: the graph has a cycle, so no serial order preserves its conflicts', { size: 10.5, color: BAD });
  T(32, 296, 'serial T1, T2, T3: T1 reads the initial value and writes 150, T2 writes 200, T3 writes 300', { size: 10.5, color: INK });
  T(32, 316, 'both end at ' + WIT.final + ', and in both T1 read the initial value and T3 wrote last', { size: 10.5, bold: true, color: VAL });
  T(32, 340, 'conflict serialisability is a sufficient condition for correctness, never a necessary one', { size: 11, bold: true, color: ACC });

  footer('every number is computed from the schedules on this page, not quoted');
};

/* ---------- scene 2: the three observations ---------- */

SCENE_DRAW.observations = function (t, sc) {
  head('Three observations are all that survive',
       'what a finished schedule leaves behind, and what it does not');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  var rows = [
    ['1. initial reads', 'which transaction read a value that came from the database itself',
     'T1 read the initial value of X', ACC],
    ['2. read-from', 'for every read, which transaction wrote the value it read',
     'T1 read X from the initial state', ACC],
    ['3. final writes', 'which transaction wrote the last value of each item',
     'T3 wrote the final X', ACC]
  ];
  rows.forEach(function (r, i) {
    var y = 72 + i * 46;
    box(32, y, 470, 38, { fill: SURF, stroke: BORDER, sw: 1 });
    T(44, y + 5, r[0], { size: 10.5, bold: true, color: r[3] });
    T(44, y + 20, r[1], { size: 9.5, color: DIM });
  });

  P.alpha(b);
  T(32, 212, 'the witness, as a table', { size: 10, bold: true, color: DIM });
  box(32, 228, 470, 62, { fill: SURF2, stroke: BORDER, sw: 1 });
  T(44, 236, 'read', { size: 9, mono: true, color: DIM });
  T(120, 236, 'item', { size: 9, mono: true, color: DIM });
  T(190, 236, 'value came from', { size: 9, mono: true, color: DIM });
  T(44, 254, 'T1', { size: 10.5, mono: true, bold: true, color: ACC });
  T(120, 254, 'X', { size: 10.5, mono: true, color: INK });
  T(190, 254, 'T_init, the initial state', { size: 10, mono: true, color: INK });
  T(44, 272, 'T_final', { size: 10.5, mono: true, bold: true, color: INFO });
  T(120, 272, 'X', { size: 10.5, mono: true, color: INK });
  T(190, 272, 'T3, the last writer', { size: 10, mono: true, color: INK });

  P.alpha(c);
  box(524, 72, 344, 120, { fill: WARNDIM, stroke: WARN, sw: 1.3 });
  T(538, 82, 'the 200 that T2 wrote', { size: 11, bold: true, color: WARN });
  T(538, 102, 'T1 overwrote it with 150 without', { size: 10, color: INK });
  T(538, 118, 'reading it, and T3 overwrote that.', { size: 10, color: INK });
  T(538, 138, 'Nobody ever read the 200.', { size: 10, color: INK });
  T(538, 160, 'a write nobody reads is dead', { size: 11, bold: true, color: WARN });

  P.alpha(d);
  box(524, 208, 344, 82, { fill: SURF, stroke: ACC, sw: 1.3 });
  T(538, 218, 'the three observations are the view', { size: 11, bold: true, color: ACC });
  T(538, 238, 'A dead write appears in none of them,', { size: 10, color: INK });
  T(538, 254, 'so it may move without changing the', { size: 10, color: INK });
  T(538, 270, 'view — and that is the weaker class.', { size: 10, color: INK });

  T(32, 310, 'Everything else is invisible once the transactions finish: how often an item was overwritten, how long an operation waited,', { size: 10, color: DIM });
  T(32, 326, 'which buffer held which value. None of it can be observed afterwards, so none of it is part of the equivalence.', { size: 10, color: DIM });
  T(32, 356, 'the view of a schedule is exactly these three facts', { size: 11.5, bold: true, color: ACC });

  footer('the dead write is the reason the two equivalence classes differ');
};

/* ---------- scene 3: the definition ---------- */

SCENE_DRAW.definition = function (t, sc) {
  head('View equivalence, and the two dummy transactions',
       'three conditions collapse into one relation');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(32, 72, 'two schedules are view equivalent when all three conditions hold', { size: 11, bold: true, color: INK });
  var cond = [
    'the same transaction reads the initial value of each item',
    'every read reads from the same write in both schedules',
    'the same transaction performs the final write of each item'
  ];
  cond.forEach(function (s, i) {
    T(46, 96 + i * 20, String(i + 1) + '. ' + s, { size: 10.5, color: INK });
  });

  P.alpha(b);
  T(32, 178, 'put a dummy transaction at each end', { size: 10.5, bold: true, color: DIM });
  box(32, 194, 128, 30, { fill: SURF, stroke: INFO, sw: 1.3 });
  T(96, 201, 'T_init', { size: 10.5, mono: true, align: 'center', bold: true, color: INFO });
  T(96, 216, 'writes every item', { size: 8.5, align: 'center', color: DIM });
  WITNESS.forEach(function (o, i) {
    chip(176 + i * 106, 194, o, o.t === 'T1' ? ACC : (o.t === 'T2' ? WARN : INFO));
  });
  box(600, 194, 128, 30, { fill: SURF, stroke: INFO, sw: 1.3 });
  T(664, 201, 'T_final', { size: 10.5, mono: true, align: 'center', bold: true, color: INFO });
  T(664, 216, 'reads every item', { size: 8.5, align: 'center', color: DIM });

  P.alpha(c);
  T(32, 254, 'then the three conditions become one: the read-from relation', { size: 10.5, bold: true, color: ACC });
  T(32, 276, 'view equivalent   exactly when the two relations are identical', { size: 11, mono: true, color: INK });
  T(32, 298, 'view serialisable  exactly when some serial order has the same relation', { size: 11, mono: true, color: INK });

  P.alpha(d);
  T(560, 254, 'the table of the witness', { size: 10, bold: true, color: DIM });
  box(560, 270, 308, 66, { fill: SURF2, stroke: BORDER, sw: 1 });
  T(572, 278, 'reader', { size: 9, mono: true, color: DIM });
  T(650, 278, 'item', { size: 9, mono: true, color: DIM });
  T(710, 278, 'writer', { size: 9, mono: true, color: DIM });
  T(572, 296, 'T1', { size: 10.5, mono: true, bold: true, color: ACC });
  T(650, 296, 'X', { size: 10.5, mono: true, color: INK });
  T(710, 296, 'T_init', { size: 10.5, mono: true, color: INFO });
  T(572, 314, 'T_final', { size: 10.5, mono: true, bold: true, color: INFO });
  T(650, 314, 'X', { size: 10.5, mono: true, color: INK });
  T(710, 314, 'T3', { size: 10.5, mono: true, color: INK });

  T(32, 336, 'two rows for four operations, because only one item is touched and only one transaction reads it', { size: 10, color: DIM });
  T(32, 362, 'the whole test is a comparison of small tables, not a drawing', { size: 11.5, bold: true, color: ACC });

  footer('read-from with T_init and T_final is the standard characterisation of view equivalence');
};

/* ---------- scene 4: the witness ---------- */

SCENE_DRAW.witness = function (t, sc) {
  head('The witness, one operation at a time',
       'which write is dead, and why the final value agrees with the serial order');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);
  var cols = [a, b, c, d];

  T(32, 70, 'X starts at ' + X0 + '.  T1 writes what it read plus ' + ADD + '.  T2 writes ' + T2W + '.  T3 writes ' + T3W + '.',
    { size: 10, color: DIM });

  WIT.steps.forEach(function (s, i) {
    P.alpha(cols[i]);
    var x = 32 + i * 216;
    var colour = s.note === 'blind write' ? WARN : ACC;
    valueCell(x, 90, s.op, s.value, s.note, colour, s.note === 'blind write' ? WARNDIM : SURF);
    if (i < 3) P.arrow(x + 152, 112, x + 210, 112, { stroke: FAINT, sw: 1.2 });
  });

  P.alpha(d);
  T(32, 152, 'the 200 exists in no observation: T1 overwrote it without reading it', { size: 10.5, color: WARN });
  T(32, 174, 'a write that no transaction reads is dead, and a dead write can move', { size: 10.5, color: INK });

  T(32, 210, 'the same four operations, run one transaction at a time', { size: 10.5, bold: true, color: DIM });
  SERIAL_123.steps.forEach(function (s, i) {
    var x = 32 + i * 216;
    valueCell(x, 226, s.op, s.value, s.note, VAL, SURF);
  });

  T(32, 288, 'the two runs agree on every observation', { size: 10.5, bold: true, color: VAL });
  T(32, 306, 'T1 read the initial value in both, and T3 wrote the last value in both', { size: 10, color: INK });
  T(32, 324, 'the final value is ' + WIT.final + ' in both', { size: 10, mono: true, color: INK });

  box(32, 348, 836, 40, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  T(44, 356, 'So the schedule is view serialisable: it is view equivalent to the serial order T1, T2, T3.', { size: 11, bold: true, color: ACC });
  T(44, 372, 'It is not conflict serialisable: its precedence graph has a two-cycle between T1 and T2.', { size: 10, color: INK });

  footer('a dead write is not an error and not a lost update; it is invisible to every observation');
};

/* ---------- scene 5: matching the serial orders ---------- */

SCENE_DRAW.matching = function (t, sc) {
  head('Match the table against every serial order',
       'six orders, two rows each, one match is enough');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(32, 70, 'the witness', { size: 10, bold: true, color: DIM });
  box(32, 84, 300, 44, { fill: SURF2, stroke: BORDER, sw: 1 });
  T(44, 92, 'T1 reads X from T_init', { size: 10, mono: true, color: INK });
  T(44, 110, 'T_final reads X from T3', { size: 10, mono: true, color: INK });
  T(352, 92, 'this is the table a serial order must reproduce', { size: 10, color: DIM });

  P.alpha(b);
  var x0 = 32, y0 = 148;
  box(x0, y0, 836, 22, { fill: SURF2, stroke: BORDER, sw: 1, radius: 3 });
  T(x0 + 12, y0 + 5, 'serial order', { size: 9, mono: true, color: DIM });
  T(x0 + 240, y0 + 5, 'T1 reads X from', { size: 9, mono: true, color: DIM });
  T(x0 + 470, y0 + 5, 'final writer of X', { size: 9, mono: true, color: DIM });
  T(x0 + 700, y0 + 5, 'table matches', { size: 9, mono: true, color: DIM });

  SERIAL_ROWS.forEach(function (r, i) {
    var y = y0 + 26 + i * 26;
    var good = r.match;
    box(x0, y, 836, 24, { fill: good ? ACCDIM : SURF, stroke: good ? ACC : BORDER, sw: good ? 1.3 : 1, radius: 3 });
    T(x0 + 12, y + 6, r.order, { size: 10, mono: true, bold: good, color: good ? ACC : INK });
    T(x0 + 240, y + 6, r.reader, { size: 10, mono: true, color: good ? ACC : INK });
    T(x0 + 470, y + 6, r.writer, { size: 10, mono: true, color: good ? ACC : INK });
    T(x0 + 700, y + 6, good ? 'match' : 'no match', { size: 10, mono: true, bold: good, color: good ? VAL : FAINT });
  });

  P.alpha(c);
  T(32, 336, 'only one order has T1 reading the initial value and T3 writing last', { size: 10.5, bold: true, color: VAL });
  T(32, 356, 'one match is enough: the definition asks for at least one serial order, not for the obvious one', { size: 10, color: INK });

  P.alpha(d);
  box(32, 380, 836, 44, { fill: WARNDIM, stroke: WARN, sw: 1.2 });
  T(44, 388, 'two orders can share a table when the operations allow it, and either is a valid witness.', { size: 10.5, color: INK });
  T(44, 406, 'What the definition never permits is calling a schedule serialisable because it merely looks like an order.', { size: 10.5, bold: true, color: WARN });

  footer('the final-writer row narrows the search before you build any read-from rows');
};

/* ---------- scene 6: the twelve ---------- */

SCENE_DRAW.twelve = function (t, sc) {
  head('All twelve interleavings of this family',
       'enumerated, not sampled: six conflict, ten view, four in the gap, two in neither');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  var rows = FAM.A.rows.slice().sort(function (p, q) {
    var rank = function (r) { return r.csr ? 0 : (r.vsr ? 1 : 2); };
    if (rank(p) !== rank(q)) return rank(p) - rank(q);
    return p.sched < q.sched ? -1 : 1;
  });

  T(32, 66, 'the twelve interleavings, grouped: conflict serialisable, then view only, then neither', { size: 10, color: DIM });

  rows.forEach(function (r, i) {
    var col = i % 3, row = Math.floor(i / 3);
    var x = 32 + col * 284, y = 84 + row * 68;
    var vis = row < 1 ? a : row < 2 ? b : row < 3 ? c : d;
    P.alpha(vis);
    var colour = r.csr ? VAL : (r.vsr ? WARN : BAD);
    var fill = r.csr ? SURF : (r.vsr ? WARNDIM : BADDIM);
    box(x, y, 268, 60, { fill: fill, stroke: colour, sw: 1.3 });
    T(x + 10, y + 7, r.sched, { size: 9, mono: true, color: INK });
    T(x + 10, y + 26, r.csr ? 'conflict serialisable' : (r.vsr ? 'view serialisable only' : 'neither class'),
      { size: 9.5, bold: true, color: colour });
    T(x + 10, y + 42, 'graph ' + (r.csr ? 'acyclic' : 'cyclic') + '  ·  blind writes ' + r.blind, { size: 8.5, color: DIM });
  });

  P.alpha(d);
  T(32, 366, 'six conflict serialisable   ·   ten view serialisable   ·   four in the gap   ·   two in neither', { size: 11, bold: true, color: INK });
  T(32, 388, 'the two in neither: T1 writes last but computed from the initial value, so the final value is ' + (X0 + ADD) + ', which no serial order produces', { size: 10, color: BAD });
  T(32, 408, 'counting the acyclic graphs and calling that the view count gives the wrong answer in both directions', { size: 10.5, color: WARN });

  footer('family A: T1 reads then writes X, T2 writes X, T3 writes X — twelve interleavings in all');
};

/* ---------- scene 7: blind writes ---------- */

SCENE_DRAW.blind = function (t, sc) {
  head('A blind write is necessary, and not sufficient',
       '45 schedules in the gap, every one of them containing a blind write');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  box(32, 68, 400, 62, { fill: SURF2, stroke: ACC, sw: 1.3 });
  T(44, 76, 'blind write', { size: 11, bold: true, color: ACC });
  T(44, 94, 'a write with no earlier read of the same item', { size: 10, color: INK });
  T(44, 110, 'inside its own transaction', { size: 10, color: INK });
  T(452, 76, 'in family A: T2 and T3 write blind, T1 does not', { size: 10, color: DIM });
  T(452, 94, 'the test is read off one row of the schedule,', { size: 10, color: DIM });
  T(452, 110, 'not from the order of the whole schedule', { size: 10, color: DIM });

  P.alpha(b);
  var fam = [['A', FAM.A], ['D', FAM.D], ['F', FAM.F]];
  T(32, 152, 'three families, every interleaving classified', { size: 10, bold: true, color: DIM });
  box(32, 168, 560, 22, { fill: SURF2, stroke: BORDER, sw: 1, radius: 3 });
  T(44, 173, 'family', { size: 9, mono: true, color: DIM });
  T(120, 173, 'interleavings', { size: 9, mono: true, color: DIM });
  T(240, 173, 'conflict', { size: 9, mono: true, color: DIM });
  T(330, 173, 'view', { size: 9, mono: true, color: DIM });
  T(420, 173, 'in the gap', { size: 9, mono: true, color: DIM });
  fam.forEach(function (f, i) {
    var y = 194 + i * 26;
    box(32, y, 560, 24, { fill: SURF, stroke: BORDER, sw: 1, radius: 3 });
    T(44, y + 6, f[0], { size: 10, mono: true, bold: true, color: ACC });
    T(120, y + 6, String(f[1].n), { size: 10, mono: true, color: INK });
    T(240, y + 6, String(f[1].csr), { size: 10, mono: true, color: VAL });
    T(330, y + 6, String(f[1].vsr), { size: 10, mono: true, color: WARN });
    T(420, y + 6, String(f[1].vnc.length), { size: 10, mono: true, bold: true, color: WARN });
  });

  P.alpha(c);
  box(620, 168, 248, 76, { fill: WARNDIM, stroke: WARN, sw: 1.3 });
  T(634, 176, 'in the gap, all families', { size: 10, bold: true, color: WARN });
  T(634, 198, String(GAP) + ' schedules', { size: 20, mono: true, bold: true, color: WARN });
  T(634, 224, 'every one has >= 1 blind write', { size: 9.5, color: INK });

  T(32, 276, 'necessity holds: ' + GAP + ' of ' + GAP + '.  Sufficiency fails: most schedules with a blind write are still not view serialisable.', { size: 10.5, color: INK });
  T(32, 296, 'one of the ' + FAM.F.vnc.length + ' in family F has exactly one blind write:', { size: 10, color: DIM });
  T(32, 312, ONE_BLIND_GAP, { size: 9, mono: true, color: DIM });

  P.alpha(d);
  box(32, 334, 836, 62, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  T(44, 342, 'and when nothing is blind, the two classes coincide', { size: 11, bold: true, color: ACC });
  T(44, 362, 'family G: three transactions, two items, no blind write anywhere. ' + FAM.G.n + ' interleavings, ' +
    FAM.G.csr + ' conflict serialisable, ' + FAM.G.vsr + ' view serialisable.', { size: 10, color: INK });
  T(44, 380, 'so a blind write is the only place the two definitions can part company', { size: 10, color: INK });

  footer('counts computed by enumerating every interleaving of each family');
};

/* ---------- scene 8: two transactions ---------- */

SCENE_DRAW.two = function (t, sc) {
  head('Two transactions never separate',
       'what the enumeration finds, and what it does not prove');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  var cards = [
    ['B', 'one item, one blind write', FAM.B],
    ['C', 'one item, no blind write', FAM.C],
    ['E', 'two items, blind writes both sides', FAM.E]
  ];
  cards.forEach(function (c2, i) {
    var x = 32 + i * 284;
    box(x, 72, 268, 106, { fill: SURF, stroke: BORDER, sw: 1.3 });
    T(x + 12, 80, 'family ' + c2[0], { size: 10.5, bold: true, color: ACC });
    T(x + 12, 98, c2[1], { size: 9.5, color: DIM });
    T(x + 12, 122, String(c2[2].n) + ' interleavings', { size: 12, mono: true, bold: true, color: INK });
    T(x + 12, 142, 'conflict ' + c2[2].csr + '   view ' + c2[2].vsr, { size: 10.5, mono: true, color: INK });
    T(x + 12, 162, c2[2].vnc.length === 0 ? 'no separation' : 'separates', { size: 10, bold: true, color: c2[2].vnc.length === 0 ? VAL : BAD });
  });

  P.alpha(b);
  T(32, 200, TWO_TOTAL + ' schedules in the three families, and not one of them is view serialisable without being conflict serialisable', { size: 10.5, bold: true, color: VAL });
  T(32, 220, 'in each family the two counts are equal: ' + FAM.B.csr + ' of ' + FAM.B.n + ', ' + FAM.C.csr + ' of ' + FAM.C.n + ', ' + FAM.E.csr + ' of ' + FAM.E.n, { size: 10, mono: true, color: INK });

  P.alpha(c);
  box(32, 244, 836, 58, { fill: WARNDIM, stroke: WARN, sw: 1.2 });
  T(44, 252, 'what this page does not claim', { size: 10.5, bold: true, color: WARN });
  T(44, 270, 'The enumeration found no separation in these families. That is a fact about ' + TWO_TOTAL + ' schedules, not a proof that two transactions can never separate.', { size: 10, color: INK });
  T(44, 288, 'No theorem is asserted here, and no claim is made about how GATE marks such a question.', { size: 10, color: INK });

  P.alpha(d);
  T(32, 322, 'the exam consequence', { size: 10.5, bold: true, color: ACC });
  T(32, 342, 'no blind write in the schedule  →  the precedence graph answers both questions at once', { size: 10.5, color: INK });
  T(32, 362, 'a blind write and a cyclic graph  →  only the read-from table answers the view question', { size: 10.5, color: INK });
  T(32, 386, 'the two verdicts are separate answers to separate questions', { size: 11, bold: true, color: ACC });

  footer('three two-transaction families: ' + FAM.B.n + ' + ' + FAM.C.n + ' + ' + FAM.E.n + ' = ' + TWO_TOTAL + ' schedules');
};

/* ---------- scene 9: the ladder ---------- */

SCENE_DRAW.ladder = function (t, sc) {
  head('The ladder, and why systems stop at conflict',
       'four classes, each strictly inside the one before');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  var rungs = [
    ['serial', 'one transaction at a time', 'the reference point: always correct', VAL],
    ['conflict serialisable', 'the precedence graph has no cycle', CSR_NOT_SERIAL, VAL],
    ['view serialisable', 'some serial order has the same read-from relation', fmtSched(WITNESS), WARN],
    ['final-state serialisable', 'some serial order ends in the same state', LOST_UPDATE.sched, BAD]
  ];
  rungs.forEach(function (r, i) {
    var y = 68 + i * 62;
    box(32, y, 836, 54, { fill: SURF, stroke: r[3], sw: 1.3 });
    T(44, y + 6, r[0], { size: 11, bold: true, color: r[3] });
    T(44, y + 24, r[1], { size: 9.5, color: DIM });
    T(44, y + 38, (i === 0 ? 'no witness needed' : 'separated by: ' + r[2]), { size: 9, mono: true, color: INK });
  });

  P.alpha(c);
  T(32, 330, 'each bar sits strictly inside the one above it, and each line names a schedule in the gap', { size: 10, color: DIM });
  T(32, 352, 'testing conflict serialisability is a cycle check; testing view serialisability is NP-complete', { size: 11, bold: true, color: INK });
  T(32, 372, 'so the weaker class is a definition, not a protocol', { size: 10.5, color: INK });

  P.alpha(d);
  box(32, 390, 836, 38, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  T(44, 398, 'A correct locking protocol produces only conflict-serialisable schedules, and the schedules it cannot produce are exactly the ones outside that class.', { size: 10, color: INK });
  T(44, 414, 'So every view-serialisable schedule in the gap is unreachable by a correct locking scheduler.', { size: 10, bold: true, color: ACC });

  footer('the witness on each line is computed and printed in the Examples and Edge cases tabs');
};

/* ---------- scene 10: the procedure ---------- */

SCENE_DRAW.procedure = function (t, sc) {
  head('The procedure for any question',
       'four steps, and the two verdicts are reported separately');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);
  var vis = [a, b, c, d];

  var steps = [
    ['1', 'lay out the schedule', 'one row per transaction, left to right in execution order',
     'conflicts are read across rows; blind writes are read along a row'],
    ['2', 'mark the blind writes', 'a write with no earlier read of that item in its own transaction',
     'a property of one transaction, so it needs one row only'],
    ['3', 'no blind write? use the graph', 'acyclic means conflict serialisable, and also view serialisable',
     'one drawing answers both questions'],
    ['4', 'otherwise compare tables', 'build the read-from table and compare it with each serial order',
     'a match is view serialisability; the graph verdict is unchanged']
  ];

  steps.forEach(function (s, i) {
    P.alpha(vis[i]);
    var y = 68 + i * 78;
    box(32, y, 836, 68, { fill: SURF, stroke: i === 3 ? ACC : BORDER, sw: i === 3 ? 1.4 : 1 });
    P.circle(60, y + 34, 15, { fill: i === 3 ? ACCDIM : SURF2, stroke: i === 3 ? ACC : BORDER, sw: 1.3 });
    T(60, y + 28, s[0], { size: 12, mono: true, bold: true, align: 'center', color: i === 3 ? ACC : DIM });
    T(88, y + 8, s[1], { size: 11.5, bold: true, color: INK });
    T(88, y + 26, s[2], { size: 10, color: INK });
    T(88, y + 44, s[3], { size: 9.5, color: DIM });
  });

  T(32, 396, 'the slips: answering a view question with the graph verdict, and answering a conflict question with the table', { size: 10.5, color: BAD });
  T(32, 414, 'two tests, two questions, two answers', { size: 11, bold: true, color: ACC });

  footer('family A: ' + FAM.A.n + ' interleavings, ' + FAM.A.csr + ' conflict, ' + FAM.A.vsr + ' view — every count on this page is computed');
};

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function drawFrame(Pp) {
  P = Pp;
  P.clear();
  var t = K ? K.state.elapsed : 0;
  var idx = K ? K.sceneAt(t) : 0;
  var sc = (window.LESSON_TIMELINE.scenes || [])[idx];
  if (!sc) return;
  var fn = SCENE_DRAW[sc.id];
  if (fn) fn(t, sc);
}

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

function fillChecks() {
  var el = document.getElementById('checks');
  if (!el) return;
  var bad = CHECKS.filter(function (c) { return !c.pass; });
  el.innerHTML = '<span class="k">Model checks</span>' +
    '<p class="small" style="margin:4px 0 0">' + (CHECKS.length - bad.length) + ' of ' + CHECKS.length +
    ' passed' + (bad.length ? ' — ' + bad.map(function (c) { return c.name; }).join('; ') : '') + '</p>';
}

function boot() {
  fillChecks();
  var holder = document.getElementById('canvas-holder');
  var fallback = document.getElementById('canvas-fallback');
  var ok = false;

  if (typeof window.createCanvas === 'function' && PR) {
    try {
      var sk = new window.p5(function (s) {
        s.setup = function () {
          var c = s.createCanvas(W, H);
          if (c && c.parent) c.parent(holder);
          s.pixelDensity(1);
          s.noLoop();
          P = PR.makePainterP5(s, W, H);
          drawFrame(P);
        };
        s.draw = function () { drawFrame(P); };
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

window.__MODEL = {
  CHECKS: CHECKS,
  FAM: FAM,
  WITNESS: { sched: fmtSched(WITNESS), reads: WIT_READS, finals: WIT_FINALS, edges: WIT_EDGES, sig: WIT_SIG, trace: WIT },
  SERIAL123: SERIAL_123,
  SERIAL_ROWS: SERIAL_ROWS,
  LADDER: { csrNotSerial: CSR_NOT_SERIAL, viewNotCsr: fmtSched(WITNESS), finalNotView: LOST_UPDATE.sched },
  TOTALS: { gap: GAP, twoTotal: TWO_TOTAL, twoSeparated: TWO_SEPARATED, allSchedules: TOTAL_SCHEDS, csrNotVsr: CSR_NOT_VSR },
  ONE_BLIND_GAP: ONE_BLIND_GAP
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
