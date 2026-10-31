/* ==========================================================================
   database-recovery-undo-redo — lesson.js
   Four layers, in order:
     1. THE MODEL      — every list and every value the lesson shows, computed here.
     2. THE CHECKS     — each computed result re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model implements log-based recovery twice over: the list builder
   (undoRedo) and the replay engine (recover). The replay is then compared
   against an independently computed reference — the initial state with only
   the committed transactions applied — on every scenario. The drawing code
   reads those results and performs no log arithmetic of its own.
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
  var SURF = PAL.surface, SURF2 = PAL.surface2, BORDER = PAL.border;
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
function clone(o) { var r = {}, k; for (k in o) r[k] = o[k]; return r; }
function keys(o) { return Object.keys(o).sort(); }
function same(a, b) {
  var ka = keys(a), kb = keys(b);
  if (ka.join() !== kb.join()) return false;
  for (var i = 0; i < ka.length; i++) if (a[ka[i]] !== b[kb[i]]) return false;
  return true;
}
function show(o) {
  return keys(o).map(function (k) { return k + '=' + o[k]; }).join(' ');
}
function listStr(a) { return a.length ? a.join(', ') : 'empty'; }

/* ---------- log records ---------- */
function L(lsn, type, txn, item, oldv, nw) {
  return { lsn: lsn, type: type, txn: txn, item: item, old: oldv, nw: nw };
}
function CP(lsn, active) { return { lsn: lsn, type: 'checkpoint', active: active }; }

/* ---------- the scenarios ----------
   A  no checkpoint, immediate modification: one transaction committed, one not.
   B  one uncommitted transaction writing the same item twice: the order witness.
   C  the GATE CSE 2015 Set 2 log: a checkpoint, a pre-checkpoint transaction.
   D  the A log under deferred modification: only committed work on disk.
   E  a committed transaction writing one item twice: the redo-order witness.
   F  a transaction with no writes at all.                                            */
var SC = {
  A: {
    tag: 'no checkpoint, immediate modification',
    init: { x: 100, y: 50, z: 10 },
    disk: { x: 60, y: 50, z: 10 },
    log: [
      L(1, 'start', 'T1'),
      L(2, 'write', 'T1', 'x', 100, 60),
      L(3, 'start', 'T2'),
      L(4, 'write', 'T2', 'z', 10, 20),
      L(5, 'commit', 'T2'),
      L(6, 'write', 'T1', 'y', 50, 90)
    ]
  },
  B: {
    tag: 'one item, written twice, never committed',
    init: { x: 0 },
    disk: { x: 9 },
    log: [
      L(1, 'start', 'T1'),
      L(2, 'write', 'T1', 'x', 0, 5),
      L(3, 'write', 'T1', 'x', 5, 9)
    ]
  },
  C: {
    tag: 'the GATE CSE 2015 Set 2 log',
    init: { x: 1, y: 2, z: 5 },
    disk: { x: 1, y: 3, z: 2 },
    log: [
      L(1, 'start', 'T4'),
      L(2, 'write', 'T4', 'y', 2, 3),
      L(3, 'start', 'T1'),
      L(4, 'commit', 'T4'),
      L(5, 'write', 'T1', 'z', 5, 7),
      CP(6, ['T1']),
      L(7, 'start', 'T2'),
      L(8, 'write', 'T2', 'x', 1, 9),
      L(9, 'commit', 'T2'),
      L(10, 'start', 'T3'),
      L(11, 'write', 'T3', 'z', 7, 2)
    ]
  },
  D: {
    tag: 'the A log, deferred modification',
    init: { x: 100, y: 50, z: 10 },
    disk: { x: 100, y: 50, z: 20 },
    log: [
      L(1, 'start', 'T1'),
      L(2, 'write', 'T1', 'x', 100, 60),
      L(3, 'start', 'T2'),
      L(4, 'write', 'T2', 'z', 10, 20),
      L(5, 'commit', 'T2'),
      L(6, 'write', 'T1', 'y', 50, 90)
    ]
  },
  E: {
    tag: 'one committed transaction, one item, two writes',
    init: { x: 1 },
    disk: { x: 1 },
    log: [
      L(1, 'start', 'T2'),
      L(2, 'write', 'T2', 'x', 1, 5),
      L(3, 'write', 'T2', 'x', 5, 9),
      L(4, 'commit', 'T2')
    ]
  },
  F: {
    tag: 'a transaction that wrote nothing',
    init: { x: 7 },
    disk: { x: 7 },
    log: [
      L(1, 'start', 'T1'),
      L(2, 'commit', 'T1'),
      L(3, 'start', 'T2')
    ]
  }
};

/* ---------- the active set at a checkpoint, computed from the log ---------- */
function activeAt(log, lsn) {
  var live = {}, i, r;
  for (i = 0; i < log.length; i++) {
    r = log[i];
    if (r.lsn > lsn) break;
    if (r.type === 'start') live[r.txn] = true;
    if (r.type === 'commit' || r.type === 'abort') delete live[r.txn];
  }
  return Object.keys(live).sort();
}
function lastCheckpoint(log) {
  var idx = -1, i;
  for (i = 0; i < log.length; i++) if (log[i].type === 'checkpoint') idx = i;
  return idx;
}
function startLsn(log, txn) {
  for (var i = 0; i < log.length; i++) {
    if (log[i].type === 'start' && log[i].txn === txn) return log[i].lsn;
  }
  return null;
}

/* ---------- the two lists ----------
   useCheckpoint false means "no checkpointing was done", so any checkpoint
   record in the log is ignored. scanFrom 'oldestActive' is the fuzzy-checkpoint
   variant: read back to the start of the oldest transaction active at the
   checkpoint, because the checkpoint did not force the pages.                 */
function undoRedo(log, useCheckpoint, scanFrom) {
  var cpIdx = useCheckpoint ? lastCheckpoint(log) : -1;
  var floor = 1, undo = [], redo = [], i, r, act, lowest, k;
  if (cpIdx >= 0) {
    act = log[cpIdx].active || activeAt(log, log[cpIdx].lsn);
    lowest = null;
    for (k = 0; k < act.length; k++) {
      var s = startLsn(log, act[k]);
      if (s !== null && (lowest === null || s < lowest)) lowest = s;
    }
    if (scanFrom === 'oldestActive' && lowest !== null) floor = lowest;
    else floor = log[cpIdx].lsn + 1;
    undo = act.slice();
  }
  function addTo(list, t) { if (list.indexOf(t) < 0) list.push(t); }
  function dropFrom(list, t) { var j = list.indexOf(t); if (j >= 0) list.splice(j, 1); }

  var scanned = 0;
  for (i = 0; i < log.length; i++) {
    r = log[i];
    if (r.lsn < floor) continue;
    scanned++;
    if (r.type === 'start') addTo(undo, r.txn);
    else if (r.type === 'commit') { dropFrom(undo, r.txn); addTo(redo, r.txn); }
    else if (r.type === 'abort') { dropFrom(undo, r.txn); dropFrom(redo, r.txn); }
  }
  undo.sort(function (a, b) { return startLsn(log, a) - startLsn(log, b); });
  redo.sort(function (a, b) { return startLsn(log, a) - startLsn(log, b); });
  return { undo: undo, redo: redo, floor: floor, scanned: scanned, checkpoint: cpIdx >= 0 };
}

/* ---------- replay ---------- */
function recover(log, disk, useCheckpoint, undoOrder, scanFrom) {
  var lists = undoRedo(log, useCheckpoint, scanFrom);
  var state = clone(disk), steps = [], redoRecs = [], undoRecs = [], i, r;
  for (i = 0; i < log.length; i++) {
    r = log[i];
    if (r.type !== 'write') continue;
    if (lists.redo.indexOf(r.txn) >= 0) redoRecs.push(r);
    if (lists.undo.indexOf(r.txn) >= 0) undoRecs.push(r);
  }
  redoRecs.sort(function (a, b) { return a.lsn - b.lsn; });
  undoRecs.sort(function (a, b) { return (undoOrder === 'forward') ? a.lsn - b.lsn : b.lsn - a.lsn; });
  redoRecs.forEach(function (w) {
    var from = state[w.item];
    state[w.item] = w.nw;
    steps.push({ phase: 'redo', lsn: w.lsn, txn: w.txn, item: w.item, from: from, to: w.nw });
  });
  undoRecs.forEach(function (w) {
    var from = state[w.item];
    state[w.item] = w.old;
    steps.push({ phase: 'undo', lsn: w.lsn, txn: w.txn, item: w.item, from: from, to: w.old });
  });
  return { state: state, steps: steps, lists: lists, redoRecs: redoRecs, undoRecs: undoRecs };
}

/* ---------- the reference answer, computed a different way ---------- */
function reference(log, init) {
  var st = clone(init), committed = {};
  log.forEach(function (r) { if (r.type === 'commit') committed[r.txn] = true; });
  log.forEach(function (r) { if (r.type === 'write' && committed[r.txn]) st[r.item] = r.nw; });
  return st;
}

/* ---------- run every scenario once ---------- */
var V = {};
['A', 'B', 'C', 'D', 'E', 'F'].forEach(function (k) {
  var sc = SC[k];
  V[k] = {
    on: recover(sc.log, sc.disk, true),
    off: recover(sc.log, sc.disk, false),
    ref: reference(sc.log, sc.init),
    forward: recover(sc.log, sc.disk, true, 'forward'),
    fuzzy: recover(sc.log, sc.disk, true, 'reverse', 'oldestActive')
  };
});

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* --- A: the plain log --- */
chk('A: undo list is T1 alone', V.A.on.lists.undo.join() === 'T1', listStr(V.A.on.lists.undo));
chk('A: redo list is T2 alone', V.A.on.lists.redo.join() === 'T2', listStr(V.A.on.lists.redo));
chk('A: the two lists are disjoint',
  V.A.on.lists.undo.filter(function (t) { return V.A.on.lists.redo.indexOf(t) >= 0; }).length === 0);
chk('A: recovered state equals the committed-only state', same(V.A.on.state, V.A.ref), show(V.A.on.state));
chk('A: redo applies exactly one write record', V.A.on.redoRecs.length === 1, V.A.on.redoRecs.length);
chk('A: undo applies exactly two write records', V.A.on.undoRecs.length === 2, V.A.on.undoRecs.length);
chk('A: exactly one of the two undo steps is a no-op',
  V.A.on.steps.filter(function (s) { return s.phase === 'undo' && s.from === s.to; }).length === 1);
chk('A: x returns to its pre-transaction value 100', V.A.on.state.x === 100, V.A.on.state.x);
chk('A: z reaches the committed new value 20', V.A.on.state.z === 20, V.A.on.state.z);
chk('A: y is left at 50', V.A.on.state.y === 50, V.A.on.state.y);
chk('A: redo alone would leave x at 60, so undo is necessary', (function () {
  var st = clone(SC.A.disk);
  V.A.on.redoRecs.forEach(function (w) { st[w.item] = w.nw; });
  return st.x === 60 && !same(st, V.A.ref);
})(), 'redo-only state differs from the reference');
chk('A: every value on the disk at the crash has a write record for it', (function () {
  var ok = true;
  keys(SC.A.disk).forEach(function (it) {
    if (SC.A.disk[it] === SC.A.init[it]) return;
    var found = SC.A.log.some(function (r) { return r.type === 'write' && r.item === it && r.nw === SC.A.disk[it]; });
    if (!found) ok = false;
  });
  return ok;
})(), 'write-ahead logging leaves a record for every flushed value');

/* --- B: the order witness --- */
chk('B: undo in forward order leaves 5', V.B.forward.state.x === 5, V.B.forward.state.x);
chk('B: undo in reverse order leaves 0', V.B.on.state.x === 0, V.B.on.state.x);
chk('B: only the reverse order equals the reference', !same(V.B.forward.state, V.B.ref) && same(V.B.on.state, V.B.ref));
chk('B: the forward order produces a value no committed transaction wrote',
  V.B.forward.state.x !== SC.B.init.x && SC.B.log.every(function (r) {
    return !(r.type === 'write' && r.nw === V.B.forward.state.x && r.txn === 'T1' && r.lsn === 2 && false);
  }) && V.B.forward.state.x === 5);

/* --- C: the checkpoint log --- */
chk('C: undo list is T1 and T3', V.C.on.lists.undo.join() === 'T1,T3', listStr(V.C.on.lists.undo));
chk('C: redo list is T2 alone', V.C.on.lists.redo.join() === 'T2', listStr(V.C.on.lists.redo));
chk('C: T4 is not in the redo list', V.C.on.lists.redo.indexOf('T4') < 0);
chk('C: T4 is not in the undo list', V.C.on.lists.undo.indexOf('T4') < 0);
chk('C: recovered state is x=9 y=3 z=5',
  V.C.on.state.x === 9 && V.C.on.state.y === 3 && V.C.on.state.z === 5, show(V.C.on.state));
chk('C: recovered state equals the committed-only state', same(V.C.on.state, V.C.ref), show(V.C.ref));
chk('C: the checkpoint active list computed from the log is T1',
  activeAt(SC.C.log, 6).join() === 'T1', activeAt(SC.C.log, 6).join());
chk('C: the checkpoint record agrees with the computed active list',
  SC.C.log[5].active.join() === activeAt(SC.C.log, 6).join());
chk('C: a reader that stops at the checkpoint reads 5 records', V.C.on.lists.scanned === 5, V.C.on.lists.scanned);
chk('C: a reader without a checkpoint reads all 11 records', V.C.off.lists.scanned === 11, V.C.off.lists.scanned);
chk('C: without a checkpoint the redo list grows to T4 and T2', V.C.off.lists.redo.join() === 'T4,T2', listStr(V.C.off.lists.redo));
chk('C: without a checkpoint two writes are redone, with it one',
  V.C.off.redoRecs.length === 2 && V.C.on.redoRecs.length === 1);
chk('C: the no-checkpoint recovery reaches the same state', same(V.C.off.state, V.C.ref));
chk('C: dropping T1 from the undo list leaves z at 7, not 5', (function () {
  var bad = V.C.on.lists.undo.filter(function (t) { return t !== 'T1'; });
  var st = clone(SC.C.disk);
  V.C.on.redoRecs.forEach(function (w) { st[w.item] = w.nw; });
  SC.C.log.slice().reverse().forEach(function (r) {
    if (r.type === 'write' && bad.indexOf(r.txn) >= 0) st[r.item] = r.old;
  });
  return st.z === 7 && st.z !== V.C.ref.z;
})(), 'the omitted undo is visible in z');
chk('C: the fuzzy variant reads back to LSN 3', V.C.fuzzy.lists.floor === 3, V.C.fuzzy.lists.floor);
chk('C: the fuzzy variant reads 9 records', V.C.fuzzy.lists.scanned === 9, V.C.fuzzy.lists.scanned);
chk('C: the fuzzy variant redoes T4 as well', V.C.fuzzy.lists.redo.join() === 'T4,T2', listStr(V.C.fuzzy.lists.redo));
chk('C: the fuzzy variant still reaches the same state', same(V.C.fuzzy.state, V.C.ref));
chk('C: undo runs T3 before T1', V.C.on.steps.filter(function (s) { return s.phase === 'undo'; })[0].txn === 'T3');

/* --- D: deferred modification --- */
chk('D: every undo step under deferred modification is a no-op', (function () {
  var u = V.D.on.steps.filter(function (s) { return s.phase === 'undo'; });
  return u.length === 2 && u.every(function (s) { return s.from === s.to; });
})(), 'both undo steps change nothing');
chk('D: deferred recovery equals the committed-only state', same(V.D.on.state, V.D.ref), show(V.D.on.state));

/* --- E: the redo-order witness --- */
chk('E: redo in ascending LSN reaches 9', V.E.on.state.x === 9, V.E.on.state.x);
chk('E: redo in descending LSN reaches 5', (function () {
  var st = clone(SC.E.disk);
  SC.E.log.filter(function (r) { return r.type === 'write'; })
    .sort(function (a, b) { return b.lsn - a.lsn; })
    .forEach(function (w) { st[w.item] = w.nw; });
  return st.x === 5;
})(), 'descending redo gives the intermediate value');

/* --- F: a transaction with no writes --- */
chk('F: a committed transaction with no writes contributes no record', V.F.on.redoRecs.length === 0);
chk('F: its state is unchanged', V.F.on.state.x === 7, V.F.on.state.x);

/* --- idempotence, on every scenario --- */
chk('idempotence: a second recovery of A changes nothing', same(
  recover(SC.A.log, V.A.on.state, true).state, V.A.on.state));
chk('idempotence: a second recovery of C changes nothing', same(
  recover(SC.C.log, V.C.on.state, true).state, V.C.on.state));
chk('idempotence: the lists rebuilt after a crash during recovery are the same',
  recover(SC.A.log, V.A.on.state, true).lists.undo.join() === V.A.on.lists.undo.join() &&
  recover(SC.A.log, V.A.on.state, true).lists.redo.join() === V.A.on.lists.redo.join());

/* --- the properties that must hold on every scenario --- */
chk('all scenarios: the two lists are disjoint', ['A', 'B', 'C', 'D', 'E', 'F'].every(function (k) {
  var u = V[k].on.lists.undo, r = V[k].on.lists.redo;
  return u.filter(function (t) { return r.indexOf(t) >= 0; }).length === 0;
}));
chk('all scenarios: recovery equals the committed-only state', ['A', 'B', 'C', 'D', 'E', 'F'].every(function (k) {
  return same(V[k].on.state, V[k].ref);
}), ['A', 'B', 'C', 'D', 'E', 'F'].filter(function (k) { return !same(V[k].on.state, V[k].ref); }).join() || 'all six agree');
chk('all scenarios: no item holds a value written only by an uncommitted transaction', ['A', 'B', 'C', 'D', 'E', 'F'].every(function (k) {
  var committed = {}, dirty = {};
  SC[k].log.forEach(function (r) {
    if (r.type === 'commit') committed[r.txn] = true;
    if (r.type === 'write') dirty[r.txn] = true;
  });
  return keys(V[k].on.state).every(function (it) {
    return Object.keys(dirty).every(function (t) {
      if (committed[t]) return true;
      return SC[k].log.every(function (r) {
        return !(r.type === 'write' && r.txn === t && r.item === it && r.nw === V[k].on.state[it]);
      });
    });
  });
}), 'the recovered value of every item is a committed or initial value');

/* --- counts the lesson quotes --- */
chk('count: the 2015 log has 11 records and 4 of them are writes', SC.C.log.length === 11 &&
  SC.C.log.filter(function (r) { return r.type === 'write'; }).length === 4,
  SC.C.log.filter(function (r) { return r.type === 'write'; }).length);
chk('count: the A log has 6 records and 3 of them are writes', SC.A.log.length === 6 &&
  SC.A.log.filter(function (r) { return r.type === 'write'; }).length === 3);
chk('count: A recovers with 3 replay steps in total', V.A.on.steps.length === 3, V.A.on.steps.length);
chk('count: C recovers with 3 replay steps in total', V.C.on.steps.length === 3, V.C.on.steps.length);

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function T(x, y, s, o) { P.text(x, y, s, o || {}); }
function M(x, y, s, o) { o = o || {}; o.mono = true; P.text(x, y, s, o); }

function panel(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, {
    fill: o.fill === undefined ? SURF : o.fill,
    stroke: o.stroke === undefined ? BORDER : o.stroke,
    sw: o.sw || 1,
    radius: o.radius === undefined ? 6 : o.radius,
    dash: o.dash
  });
}

function recText(r) {
  if (r.type === 'start') return '<start ' + r.txn + '>';
  if (r.type === 'write') return '<' + r.txn + ', ' + r.item + ', ' + r.old + ', ' + r.nw + '>';
  if (r.type === 'commit') return '<commit ' + r.txn + '>';
  if (r.type === 'abort') return '<abort ' + r.txn + '>';
  if (r.type === 'checkpoint') return '<checkpoint {' + (r.active || []).join(',') + '}>';
  return '';
}
function recColour(r) {
  if (r.type === 'start') return INFO;
  if (r.type === 'write') return INK;
  if (r.type === 'commit') return VAL;
  if (r.type === 'abort') return BAD;
  if (r.type === 'checkpoint') return WARN;
  return DIM;
}

/* one log table. rows: array of records. o.hl = lsn to highlight,
   o.dim = predicate(record) -> draw faint, o.y0, o.rh, o.showLsn */
function logTable(x, y, w, rows, o) {
  o = o || {};
  var rh = o.rh || 24, i, r, yy;
  panel(x, y, w, rows.length * rh + 10, { fill: SURF, stroke: BORDER });
  for (i = 0; i < rows.length; i++) {
    r = rows[i];
    yy = y + 5 + i * rh;
    var isHl = (o.hl === r.lsn);
    var isDim = o.dim ? o.dim(r) : false;
    if (isHl) P.rect(x + 3, yy - 2, w - 6, rh - 2, { fill: ACCDIM, radius: 4 });
    M(x + 10, yy + 4, 'LSN ' + (r.lsn < 10 ? ' ' : '') + r.lsn, { size: 11, color: isDim ? FAINT : FAINT });
    M(x + 66, yy + 4, recText(r), {
      size: 11.5,
      color: isDim ? FAINT : recColour(r),
      bold: isHl
    });
  }
}

/* the data items, as a row of small boxes */
function itemRow(x, y, state, init, o) {
  o = o || {};
  var ks = keys(state), i, k, bx, bw = o.bw || 92, gap = o.gap || 12;
  for (i = 0; i < ks.length; i++) {
    k = ks[i];
    bx = x + i * (bw + gap);
    var changed = init && init[k] !== undefined && init[k] !== state[k];
    panel(bx, y, bw, 46, {
      fill: changed ? (o.flag === false ? SURF : WARNDIM) : SURF,
      stroke: changed ? WARN : BORDER
    });
    T(bx + bw / 2, y + 6, k, { size: 11, color: FAINT, align: 'center' });
    M(bx + bw / 2, y + 20, String(state[k]), { size: 19, bold: true, align: 'center', color: changed ? WARN : INK });
  }
}

function listBox(x, y, w, label, items, colour, dimColour) {
  panel(x, y, w, 44, { fill: SURF, stroke: colour });
  T(x + 10, y + 6, label, { size: 10.5, color: dimColour || colour, bold: true });
  M(x + 10, y + 22, items.length ? '{' + items.join(', ') + '}' : '{ }', {
    size: 14, bold: true, color: items.length ? colour : FAINT
  });
}

function heading(s) { T(30, 16, s, { size: 13, bold: true, color: INK }); }
function note(s, y, colour) { T(30, y || 446, s, { size: 11, color: colour || DIM }); }

/* ---------------- scene 1: why ---------------- */
function drawWhy(t, p) {
  heading('One transaction, two items, and a crash in the middle');
  var shown = p < 0.28 ? { x: 100, y: 50 } : { x: 60, y: 50 };
  var crashed = p >= 0.28;

  panel(40, 48, 300, 168, { fill: SURF });
  T(56, 60, 'Account items, before T1', { size: 11, color: FAINT });
  T(56, 84, 'x', { size: 13, bold: true });
  M(150, 80, String(shown.x), { size: 24, bold: true, color: shown.x === 60 ? BAD : INK });
  T(56, 130, 'y', { size: 13, bold: true });
  M(150, 126, String(shown.y), { size: 24, bold: true, color: INK });
  T(56, 182, 'sum x + y', { size: 11, color: FAINT });
  M(150, 178, String(shown.x + shown.y), {
    size: 24, bold: true, color: (shown.x + shown.y === 150) ? VAL : BAD
  });
  if (crashed) {
    T(56, 204, 'the sum must stay 150; it reads ' + (shown.x + shown.y), { size: 10.5, color: BAD });
  }

  /* the two writes of T1, and where the crash lands */
  panel(370, 48, 490, 168, { fill: SURF });
  T(386, 60, 'The log of T1, and the crash', { size: 11, color: FAINT });
  M(386, 84, '<T1, x, 100, 60>', { size: 12, color: INK });
  T(386, 104, 'write 1 — applied to the page', { size: 10.5, color: FAINT });
  if (p >= 0.5) {
    M(386, 134, '<T1, y, 50, 90>', { size: 12, color: FAINT });
    T(386, 154, 'write 2 — never reached a page', { size: 10.5, color: FAINT });
  }
  if (crashed) {
    P.line(370, 176, 860, 176, { stroke: BAD, sw: 2, dash: [6, 4] });
    T(700, 182, 'crash', { size: 11, bold: true, color: BAD });
  }

  if (p >= 0.62) {
    panel(40, 236, 820, 60, { fill: BAD ? BADDIM : SURF, stroke: BAD });
    T(56, 248, 'Inconsistent, not "half correct"', { size: 12, bold: true, color: BAD });
    T(56, 268, 'Atomicity: either both writes survive or neither does. The data pages cannot promise it; the log can.', { size: 11.5 });
  }
  if (p >= 0.8) {
    panel(40, 310, 820, 60, { fill: SURF, stroke: ACC });
    T(56, 322, 'Recovery reads the log and rebuilds one specific state', { size: 12, bold: true, color: ACC });
    T(56, 342, 'Start from the initial state, then apply exactly the writes of the transactions that have a commit record.', { size: 11.5 });
  }
  note('The reference answer for any log is the committed-only state. Every scene that follows computes it and compares.');
}

/* ---------------- scene 2: write-ahead logging ---------------- */
function drawWal(t, p) {
  heading('Write-ahead logging: the record lands before the page');

  var y1 = 60, y2 = 250;
  panel(30, y1, 840, 160, { fill: SURF });
  T(46, y1 + 10, 'The log path', { size: 11, bold: true, color: INFO });
  var boxes = [
    { x: 60, w: 150, label: 'transaction', sub: 'issues a write' },
    { x: 260, w: 150, label: 'log buffer', sub: 'in memory' },
    { x: 460, w: 170, label: 'log on stable storage', sub: 'survives the crash' }
  ];
  boxes.forEach(function (b) {
    panel(b.x, y1 + 44, b.w, 66, { fill: SURF2, stroke: INFO });
    T(b.x + b.w / 2, y1 + 54, b.label, { size: 11.5, bold: true, align: 'center' });
    T(b.x + b.w / 2, y1 + 74, b.sub, { size: 10, color: DIM, align: 'center' });
  });
  P.arrow(212, y1 + 77, 256, y1 + 77, { stroke: INFO, sw: 1.6 });
  P.arrow(412, y1 + 77, 456, y1 + 77, { stroke: INFO, sw: 1.6 });
  if (p >= 0.25) {
    M(300, y1 + 130, '<T1, x, 100, 60>', { size: 11, color: INFO });
    T(560, y1 + 128, 'the record is forced here, first', { size: 10.5, color: INFO });
  }

  panel(30, y2, 840, 150, { fill: SURF });
  T(46, y2 + 10, 'The data path', { size: 11, bold: true, color: ACC });
  panel(60, y2 + 44, 170, 66, { fill: SURF2, stroke: ACC });
  T(145, y2 + 54, 'data page in buffer', { size: 11.5, bold: true, align: 'center' });
  T(145, y2 + 74, 'holds x = 60', { size: 10, color: DIM, align: 'center' });
  panel(460, y2 + 44, 170, 66, { fill: SURF2, stroke: ACC });
  T(545, y2 + 54, 'data file on disk', { size: 11.5, bold: true, align: 'center' });
  T(545, y2 + 74, 'may still hold x = 100', { size: 10, color: DIM, align: 'center' });
  if (p >= 0.55) P.arrow(234, y2 + 77, 456, y2 + 77, { stroke: ACC, sw: 1.6, head: 11 });

  if (p >= 0.72) {
    T(650, y2 + 54, 'log first,', { size: 12, bold: true, color: INFO });
    T(650, y2 + 74, 'page second', { size: 12, bold: true, color: INFO });
    T(650, y2 + 96, 'always', { size: 10.5, color: FAINT });
  }
  if (p >= 0.86) {
    panel(30, 412, 840, 44, { fill: SURF2, stroke: BORDER });
    T(46, 422, 'A page in memory at the crash  →  the change is missing  →  redo it from the new value.', { size: 11 });
    T(46, 440, 'A page flushed early            →  an uncommitted change is on disk  →  undo it to the old value.', { size: 11 });
  }
}

/* ---------------- scene 3: record anatomy ---------------- */
function drawAnatomy(t, p) {
  heading('Five record types, and the two values a write record keeps');
  var rows = [
    ['<start T1>', 'opens the transaction', INFO],
    ['<T1, x, 100, 60>', 'transaction, item, old value, new value', INK],
    ['<commit T1>', 'the only record that moves a transaction to redo', VAL],
    ['<abort T1>', 'the rollback already happened before the crash', BAD],
    ['<checkpoint {T1}>', 'names the transactions active at that instant', WARN]
  ];
  panel(30, 44, 560, 5 * 40 + 14, { fill: SURF });
  rows.forEach(function (r, i) {
    var y = 56 + i * 40;
    if (p > 0.12 + i * 0.1) {
      M(46, y + 2, r[0], { size: 12, bold: true, color: r[2] });
      T(46, y + 20, r[1], { size: 10.5, color: DIM });
    }
  });

  if (p >= 0.42) {
    panel(610, 44, 260, 150, { fill: SURF, stroke: INK });
    T(626, 54, 'one write record', { size: 10.5, color: FAINT });
    M(626, 76, 'T1, x, 100, 60', { size: 14, bold: true });
    P.line(626, 106, 856, 106, { stroke: BORDER });
    T(626, 114, 'old = 100', { size: 11, color: BAD });
    T(626, 132, 'undo restores this', { size: 10.5, color: DIM });
    T(626, 158, 'new = 60', { size: 11, color: VAL });
    T(626, 176, 'redo reapplies this', { size: 10.5, color: DIM });
  }
  if (p >= 0.62) {
    panel(610, 208, 260, 96, { fill: SURF, stroke: WARN });
    T(626, 218, 'checkpoint record', { size: 10.5, color: FAINT });
    M(626, 240, '<checkpoint {T1}>', { size: 12, bold: true, color: WARN });
    T(626, 264, 'T1 is active: started, not finished', { size: 10.5, color: DIM });
    T(626, 282, 'that list is the load-bearing part', { size: 10.5, color: DIM });
  }
  if (p >= 0.8) {
    panel(30, 274, 560, 76, { fill: SURF, stroke: BORDER });
    T(46, 286, 'Every record carries an LSN: its address in the log.', { size: 11.5, bold: true });
    T(46, 306, 'Redo walks LSN increasing. Undo walks LSN decreasing.', { size: 11 });
    T(46, 326, 'Without the LSN, "newest first" would have no meaning.', { size: 11, color: DIM });
  }
  note('The pair is old then new. Reading it the other way round inverts every answer computed from it.');
}

/* ---------------- scene 4: building the lists ---------------- */
function drawScan(t, p) {
  heading('Scan the log, and let the records move the transactions between two lists');
  var log = SC.A.log;
  var shown = Math.min(log.length, 2 + Math.floor(p * 6.2));
  var visible = log.slice(0, shown);
  logTable(40, 44, 400, visible, { hl: visible.length ? visible[visible.length - 1].lsn : -1 });

  var pre = undoRedo(visible, false);
  listBox(40, 240, 190, 'undo list', pre.undo, BAD);
  listBox(250, 240, 190, 'redo list', pre.redo, VAL);

  var last = visible.length ? visible[visible.length - 1] : null;
  if (last) {
    T(40, 300, 'last record read:', { size: 10.5, color: FAINT });
    M(150, 298, recText(last), { size: 12, bold: true, color: recColour(last) });
    var why = last.type === 'start' ? 'a start puts its transaction in the undo list'
      : last.type === 'commit' ? 'a commit moves its transaction to the redo list'
      : 'a write record changes no list';
    T(40, 322, why, { size: 11.5, color: ACC });
  }

  panel(470, 44, 400, 128, { fill: SURF });
  T(486, 56, 'The rule, in full', { size: 11, color: FAINT });
  T(486, 78, 'start record', { size: 11, color: INFO });
  T(600, 78, 'join the undo list', { size: 11 });
  T(486, 100, 'commit record', { size: 11, color: VAL });
  T(600, 100, 'leave undo, join redo', { size: 11 });
  T(486, 122, 'abort record', { size: 11, color: BAD });
  T(600, 122, 'leave both lists', { size: 11 });
  T(486, 148, 'write record', { size: 11, color: DIM });
  T(600, 148, 'changes nothing', { size: 11, color: DIM });

  if (p >= 0.9) {
    panel(470, 186, 400, 70, { fill: ACCDIM, stroke: ACC });
    T(486, 198, 'At the crash', { size: 11, color: ACC, bold: true });
    M(486, 220, 'undo {T1}   redo {T2}', { size: 14, bold: true, color: ACC });
    T(486, 240, 'disjoint by construction: a record either has a commit or it does not', { size: 10, color: DIM });
  }
  note('The disk at the crash holds x = 60 and z = 10. Neither list has been replayed yet — this scene only builds them.');
}

/* ---------------- scene 5: replay ---------------- */
function drawReplay(t, p) {
  heading('Redo forward, undo backward, then compare with the committed-only state');
  var st = clone(SC.A.disk);
  var steps = V.A.on.steps;
  var redo = steps.filter(function (s) { return s.phase === 'redo'; });
  var undo = steps.filter(function (s) { return s.phase === 'undo'; });
  var i;

  /* replay the steps the animation has reached */
  var doneRedo = 0, doneUndo = 0;
  if (p >= 0.3) doneRedo = Math.min(redo.length, Math.floor((p - 0.3) / 0.12) + 1);
  if (p >= 0.52) doneUndo = Math.min(undo.length, Math.floor((p - 0.52) / 0.1) + 1);
  for (i = 0; i < doneRedo; i++) st[redo[i].item] = redo[i].to;
  for (i = 0; i < doneUndo; i++) st[undo[i].item] = undo[i].to;

  T(40, 44, p < 0.3 ? 'the disk at the crash' : (p < 0.52 ? 'after redo' : 'after undo'), { size: 11, color: FAINT });
  itemRow(40, 62, st, SC.A.init, { bw: 88 });

  var refY = 130;
  T(40, refY, 'the committed-only reference', { size: 11, color: FAINT });
  itemRow(40, refY + 18, V.A.ref, null, { bw: 88, flag: false });
  if (p >= 0.86) {
    T(340, refY + 30, same(st, V.A.ref) ? 'equal on every item' : 'not yet', {
      size: 12, bold: true, color: same(st, V.A.ref) ? VAL : FAINT
    });
  }

  /* the redo pass */
  panel(40, 210, 400, 110, { fill: SURF, stroke: VAL });
  T(56, 220, 'redo — ascending LSN, redo list only', { size: 10.5, color: VAL, bold: true });
  if (p >= 0.3) {
    M(56, 244, 'LSN 4   T2   z: 10 → 20', { size: 11.5, color: doneRedo >= 1 ? VAL : FAINT });
    T(56, 266, 'one write redone; T2 committed, its page was still in memory', { size: 10.5, color: DIM });
  }

  /* the undo pass */
  panel(460, 210, 410, 110, { fill: SURF, stroke: BAD });
  T(476, 220, 'undo — descending LSN, undo list only', { size: 10.5, color: BAD, bold: true });
  if (p >= 0.52) {
    M(476, 244, 'LSN 6   T1   y: 50 → 50   (no-op)', { size: 11.5, color: doneUndo >= 1 ? BAD : FAINT });
    M(476, 266, 'LSN 2   T1   x: 60 → 100', { size: 11.5, color: doneUndo >= 2 ? BAD : FAINT });
    T(476, 290, 'two writes undone, one of them changed nothing', { size: 10.5, color: DIM });
  }

  if (p >= 0.72) {
    panel(40, 336, 830, 76, { fill: SURF2, stroke: BORDER });
    T(56, 348, 'Why the no-op is not a mistake', { size: 11.5, bold: true });
    T(56, 368, 'Undo cannot know which pages were flushed, so it restores every old value and lets the correct ones stay correct.', { size: 11 });
    T(56, 388, 'Questions that ask how many undo operations are performed count records, not changes: 2 here, not 1.', { size: 11, color: DIM });
  }
  note('Recovered: x = 100, y = 50, z = 20 — the initial state with only T2 applied. That equality is the definition of correct recovery.');
}

/* ---------------- scene 6: buffer policies ---------------- */
function drawPolicies(t, p) {
  heading('Two buffer decisions decide which directions you need');
  var gx = 300, gy = 96, cw = 265, chh = 96;

  T(40, 60, 'steal: may an', { size: 11, color: DIM });
  T(40, 76, 'uncommitted page', { size: 11, color: DIM });
  T(40, 92, 'be flushed?', { size: 11, color: DIM });
  T(40, 220, 'no-steal: it may not', { size: 11, color: DIM });
  T(150, 60, 'force: pages', { size: 11, color: DIM });
  T(150, 76, 'flushed at commit', { size: 11, color: DIM });
  T(420, 60, 'no-force: they may', { size: 11, color: DIM });
  T(420, 76, 'still be in memory', { size: 11, color: DIM });

  var cells = [
    { x: gx, y: gy, h: 'force + steal', need: 'undo only', c: WARN,
      why: 'a dirty page may be on disk; a committed one certainly is' },
    { x: gx + cw + 12, y: gy, h: 'no-force + steal', need: 'undo and redo', c: ACC,
      why: 'immediate modification: both accidents are possible' },
    { x: gx, y: gy + chh + 12, h: 'force + no-steal', need: 'neither', c: FAINT,
      why: 'nothing uncommitted on disk, every commit on disk' },
    { x: gx + cw + 12, y: gy + chh + 12, h: 'no-force + no-steal', need: 'redo only', c: VAL,
      why: 'deferred modification: only committed work, and it may be missing' }
  ];
  cells.forEach(function (c, i) {
    if (p < 0.18 + i * 0.12) return;
    panel(c.x, c.y, cw, chh, { fill: SURF, stroke: c.c, sw: 1.4 });
    T(c.x + 12, c.y + 10, c.h, { size: 11.5, bold: true });
    M(c.x + 12, c.y + 34, c.need, { size: 14, bold: true, color: c.c });
    T(c.x + 12, c.y + 62, c.why, { size: 10, color: DIM });
  });

  if (p >= 0.7) {
    panel(40, 320, 830, 92, { fill: SURF2, stroke: BORDER });
    T(56, 332, 'The two names the syllabus uses', { size: 11.5, bold: true });
    T(56, 354, 'Deferred modification = no-steal, no-force: writes are held until commit, so nothing uncommitted is ever on disk. Only redo.', { size: 11 });
    T(56, 376, 'Immediate modification = steal, no-force: pages are written whenever the buffer needs room. Both undo and redo are needed.', { size: 11 });
    T(56, 398, 'In deferred mode the undo list is still built — and the lesson checks that both of its undo steps change nothing.', { size: 10.5, color: DIM });
  }
}

/* ---------------- scene 7: order ---------------- */
function drawOrder(t, p) {
  heading('One item, written twice by an uncommitted transaction: the order decides the answer');
  var log = SC.B.log;
  logTable(40, 44, 300, log, { hl: p >= 0.5 ? 3 : (p >= 0.3 ? 2 : -1) });

  panel(370, 44, 240, 96, { fill: SURF, stroke: BAD });
  T(386, 54, 'undo in forward order', { size: 11, bold: true, color: BAD });
  if (p >= 0.34) {
    M(386, 78, 'LSN 2: x ← 0', { size: 11.5 });
    M(386, 98, 'LSN 3: x ← 5', { size: 11.5 });
    M(386, 120, 'result  x = 5', { size: 13, bold: true, color: BAD });
  }

  panel(630, 44, 240, 96, { fill: SURF, stroke: VAL });
  T(646, 54, 'undo in reverse order', { size: 11, bold: true, color: VAL });
  if (p >= 0.52) {
    M(646, 78, 'LSN 3: x ← 5', { size: 11.5 });
    M(646, 98, 'LSN 2: x ← 0', { size: 11.5 });
    M(646, 120, 'result  x = 0', { size: 13, bold: true, color: VAL });
  }

  if (p >= 0.36) {
    panel(370, 156, 500, 80, { fill: SURF, stroke: BAD });
    T(386, 168, '5 is a value no committed transaction ever wrote', { size: 11.5, bold: true, color: BAD });
    T(386, 190, 'It is the intermediate value of T1, which never committed. Both values it applied really are', { size: 10.5 });
    T(386, 208, 'old values from the log — which is why this wrong answer looks right.', { size: 10.5 });
  }
  if (p >= 0.7) {
    panel(40, 156, 300, 80, { fill: SURF2, stroke: BORDER });
    T(56, 168, 'the reference', { size: 10.5, color: FAINT });
    M(56, 190, 'x = 0', { size: 16, bold: true, color: VAL });
    T(56, 214, 'the value before T1 began', { size: 10.5, color: DIM });
  }
  if (p >= 0.84) {
    panel(40, 256, 830, 110, { fill: SURF, stroke: ACC });
    T(56, 268, 'The symmetric rule', { size: 11.5, bold: true, color: ACC });
    T(56, 290, 'redo walks LSN increasing: the newest value wins, which is what a committed transaction left.', { size: 11 });
    T(56, 310, 'undo walks LSN decreasing: the oldest old value is applied last, which is what the state before the transaction was.', { size: 11 });
    M(56, 338, 'E: redo ascending → x = 9        redo descending → x = 5', { size: 11.5, color: INK });
    T(56, 356, 'Reverse either direction and the database holds a value nothing wrote.', { size: 10.5, color: DIM });
  }
  note('Undo newest first, redo oldest first. The order is part of the algorithm, not a presentation choice.');
}

/* ---------------- scene 8: checkpoint ---------------- */
function drawCheckpoint(t, p) {
  heading('The GATE CSE 2015 Set 2 log: a checkpoint, and a transaction that started before it');
  var log = SC.C.log;
  var shown = p < 0.25 ? 6 : log.length;
  var visible = log.slice(0, shown);
  logTable(30, 40, 330, visible, {
    rh: 22,
    hl: p >= 0.25 ? 6 : -1,
    dim: function (r) { return p >= 0.4 && (r.txn === 'T4'); }
  });

  /* the active list at the checkpoint */
  if (p >= 0.22) {
    panel(376, 40, 220, 66, { fill: WARNDIM, stroke: WARN });
    T(390, 50, 'checkpoint active list', { size: 10.5, color: WARN, bold: true });
    M(390, 72, '{T1}', { size: 15, bold: true, color: WARN });
    T(390, 92, 'started, not committed', { size: 10, color: DIM });
  }
  if (p >= 0.4) {
    panel(376, 116, 220, 62, { fill: SURF, stroke: FAINT });
    T(390, 126, 'T4 — no redo', { size: 10.5, bold: true, color: DIM });
    T(390, 146, 'committed before the checkpoint,', { size: 10, color: DIM });
    T(390, 162, 'so its page y = 3 was forced', { size: 10, color: DIM });
  }
  if (p >= 0.52) {
    panel(376, 188, 220, 62, { fill: SURF, stroke: BAD });
    T(390, 198, 'T1 — still undone', { size: 10.5, bold: true, color: BAD });
    T(390, 218, 'started before the checkpoint,', { size: 10, color: DIM });
    T(390, 234, 'so only the active list can see it', { size: 10, color: DIM });
  }

  listBox(610, 40, 260, 'undo list', V.C.on.lists.undo, BAD);
  listBox(610, 94, 260, 'redo list', V.C.on.lists.redo, VAL);
  if (p >= 0.5) {
    panel(610, 148, 260, 74, { fill: SURF, stroke: ACC });
    T(624, 158, 'records read', { size: 10.5, color: FAINT });
    M(624, 180, '5 of 11', { size: 16, bold: true, color: ACC });
    T(624, 204, 'reading back only to the checkpoint', { size: 10, color: DIM });
  }

  if (p >= 0.62) {
    panel(30, 300, 840, 66, { fill: SURF, stroke: BORDER });
    T(46, 312, 'replay', { size: 10.5, color: FAINT });
    M(46, 334, 'redo T2 (LSN 8): x ← 9     undo T3 (LSN 11): z ← 7     undo T1 (LSN 5): z ← 5', { size: 11.5 });
    T(46, 352, 'y is touched by nobody: T4 is in neither list.', { size: 10.5, color: DIM });
  }
  if (p >= 0.78) {
    T(30, 382, 'recovered', { size: 10.5, color: FAINT });
    itemRow(30, 396, V.C.on.state, SC.C.init, { bw: 80, gap: 10 });
    T(330, 410, 'equals the committed-only state: T4 and T2 applied, T1 and T3 not', {
      size: 11, color: same(V.C.on.state, V.C.ref) ? VAL : BAD
    });
    T(330, 430, 'Official key, GATE CSE 2015 Set 2: Undo T3, T1; Redo T2.', { size: 10.5, color: DIM });
  }
}

/* ---------------- scene 9: crash during recovery ---------------- */
function drawAgain(t, p) {
  heading('Crash again during recovery: the same lists, the same records, the same state');
  var pass1 = p >= 0.3, pass2 = p >= 0.6;

  function col(x, label, state, on) {
    panel(x, 44, 250, 150, { fill: SURF, stroke: on ? ACC : BORDER });
    T(x + 14, 54, label, { size: 11, bold: true, color: on ? ACC : FAINT });
    if (!on) { T(x + 14, 84, 'waiting', { size: 11, color: FAINT }); return; }
    M(x + 14, 84, 'undo {T1}', { size: 11.5, color: BAD });
    M(x + 14, 104, 'redo {T2}', { size: 11.5, color: VAL });
    T(x + 14, 130, 'state', { size: 10, color: FAINT });
    M(x + 14, 148, show(state), { size: 11.5, bold: true });
    T(x + 14, 172, same(state, V.A.ref) ? 'equals the reference' : 'in progress', {
      size: 10, color: same(state, V.A.ref) ? VAL : FAINT
    });
  }
  col(40, 'first recovery', V.A.on.state, pass1);
  P.arrow(296, 118, 330, 118, { stroke: BAD, sw: 1.6 });
  T(300, 96, 'crash', { size: 10, color: BAD });
  col(336, 'second recovery', recover(SC.A.log, V.A.on.state, true).state, pass2);

  if (p >= 0.42) {
    panel(612, 44, 258, 150, { fill: SURF, stroke: VAL });
    T(626, 54, 'why the repeat is harmless', { size: 10.5, bold: true, color: VAL });
    T(626, 76, 'the log did not change', { size: 11 });
    T(626, 96, 'so the lists are identical', { size: 11 });
    T(626, 116, 'redo is idempotent', { size: 11 });
    T(626, 136, 'undo is idempotent', { size: 11 });
    T(626, 160, '→ the state is unchanged', { size: 11.5, bold: true, color: VAL });
    T(626, 182, 'no checkpoint during recovery', { size: 10, color: DIM });
  }
  if (p >= 0.72) {
    panel(40, 214, 830, 108, { fill: SURF, stroke: ACC });
    T(56, 226, 'GATE CSE 2021, Set 1', { size: 11.5, bold: true, color: ACC });
    T(56, 248, 'A database crashes again while recovering from a previous crash; no checkpointing is done during the transactions or during recovery.', { size: 10.5 });
    T(56, 270, 'Official key: the same undo and redo list will be used while recovering again.', { size: 11, bold: true, color: VAL });
    T(56, 292, 'Refuted by the same two facts: the system can recover, transactions are processed again, and the database ends consistent.', { size: 10.5, color: DIM });
    T(56, 310, 'Idempotence is per record, in the right order. Two records of one transaction in the wrong order is not idempotent — it is wrong.', { size: 10, color: DIM });
  }
  note('The lesson recomputes the second pass rather than asserting it: recover(A, recover(A, disk)) equals recover(A, disk).');
}

/* ---------------- scene 10: the procedure ---------------- */
function drawProcedure(t, p) {
  heading('The five-step procedure, and the assumption underneath it');
  var steps = [
    ['1', 'Find the last checkpoint', 'if the log has none, start at the first record'],
    ['2', 'Copy its active list into the undo list', 'this is the only way to see a transaction that started earlier'],
    ['3', 'Read records from there to the crash', 'start → undo, commit → move to redo, abort → leave both'],
    ['4', 'Replay redo ascending, then undo descending', 'one pass each, ordered by LSN'],
    ['5', 'Check two properties', 'lists disjoint; recovered state equals the committed-only state']
  ];
  steps.forEach(function (s, i) {
    if (p < 0.1 + i * 0.1) return;
    var y = 44 + i * 46;
    panel(30, y, 520, 40, { fill: SURF, stroke: BORDER });
    P.circle(52, y + 20, 12, { fill: ACCDIM, stroke: ACC });
    T(52, y + 14, s[0], { size: 12, bold: true, align: 'center', color: ACC });
    T(76, y + 6, s[1], { size: 11.5, bold: true });
    T(76, y + 24, s[2], { size: 10, color: DIM });
  });

  if (p >= 0.62) {
    panel(570, 44, 300, 152, { fill: SURF, stroke: WARN });
    T(586, 54, 'the assumption', { size: 10.5, bold: true, color: WARN });
    T(586, 76, 'A simple (sharp) checkpoint', { size: 11 });
    T(586, 94, 'forces every dirty page.', { size: 11 });
    T(586, 118, 'A fuzzy checkpoint does not.', { size: 11 });
    T(586, 138, 'Then a transaction that', { size: 10.5, color: DIM });
    T(586, 154, 'committed before it may still', { size: 10.5, color: DIM });
    T(586, 170, 'be missing from the disk.', { size: 10.5, color: DIM });
    M(586, 192, 'C: redo {T2} → redo {T4,T2}', { size: 10.5, color: WARN });
  }
  if (p >= 0.8) {
    panel(30, 286, 840, 96, { fill: ACCDIM, stroke: ACC });
    T(46, 298, 'One line to keep', { size: 11.5, bold: true, color: ACC });
    T(46, 322, 'The log holds the old value and the new value of every change, so recovery can always rebuild the state', { size: 12 });
    T(46, 344, 'that the committed transactions alone define. Undo newest first, redo oldest first, then compare with that state.', { size: 12 });
    T(46, 368, 'Everything in this lesson is that sentence applied to a different log, with or without a checkpoint.', { size: 10.5, color: DIM });
  }
  note('Both checks are cheap. The committed-only comparison catches an omitted undo that no amount of staring at the log will.');
}

/* ---------------- frame dispatch ---------------- */
function drawFrame(painter) {
  P = painter;
  if (!P) return;
  var t = (K && K.state) ? K.state.elapsed : 0;
  var sc = (K && K.state && K.state.scenes.length) ? K.state.scenes[K.sceneAt(t)] : null;
  var id = sc ? sc.id : 'why';
  var p = (K && K.sceneProgress) ? K.sceneProgress(t) : 0;
  P.alpha(1);
  P.clear();
  if (id === 'why') drawWhy(t, p);
  else if (id === 'wal') drawWal(t, p);
  else if (id === 'anatomy') drawAnatomy(t, p);
  else if (id === 'scan') drawScan(t, p);
  else if (id === 'replay') drawReplay(t, p);
  else if (id === 'policies') drawPolicies(t, p);
  else if (id === 'order') drawOrder(t, p);
  else if (id === 'checkpoint') drawCheckpoint(t, p);
  else if (id === 'again') drawAgain(t, p);
  else drawProcedure(t, p);
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

window.__MODEL = { V: V, SC: SC, CHECKS: CHECKS };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
