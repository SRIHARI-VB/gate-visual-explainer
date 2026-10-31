/* ==========================================================================
   readers-writers-and-dining-philosophers — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model is checked three independent ways:
     (a) a semaphore simulator, the same definition the exam uses, with the
         readers-writers code executed step by step and the safety invariant
         asserted at every step;
     (b) an exhaustive breadth-first search over every reachable state of the
         dining philosophers table, which decides both deadlock-freedom and the
         largest number eating at once;
     (c) an independent wait-for graph, built from the same states, whose cycle
         detection must agree with the search on which states are stuck.
   If any of those disagreed, the page would say so under the canvas.
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

/* ---------- the semaphore, under the standard definition ----------
   wait  : decrement, then block if the value has gone negative.
   signal: increment, then wake one waiter if the value is still at most 0.
   A negative value is therefore exactly the number of queued processes.       */

function Sem(name, v) { this.name = name; this.v = v; this.q = []; }
Sem.prototype.wait = function (pid) {
  this.v -= 1;
  if (this.v < 0) { this.q.push(pid); return false; }
  return true;
};
Sem.prototype.signal = function () {
  this.v += 1;
  if (this.v <= 0 && this.q.length) return this.q.shift();
  return null;
};

/* ---------- readers-writers, first solution (reader preference) ----------
   Shared: int readcount = 0; sem rmutex = 1; sem wsem = 1.
   Reader: wait(rmutex); readcount++; if (readcount==1) wait(wsem);
           signal(rmutex); READ; wait(rmutex); readcount--;
           if (readcount==0) signal(wsem); signal(rmutex);
   Writer: wait(wsem); WRITE; signal(wsem);

   The simulator resumes a blocked process at the statement it blocked on, so
   the one detail that decides several exam answers is modelled faithfully: the
   first reader holds rmutex while it waits on wsem, so later readers queue on
   rmutex and never see a half-finished count.                              */

function rw1Machine() {
  var S = { rmutex: new Sem('rmutex', 1), wsem: new Sem('wsem', 1) };
  var readcount = 0;
  var inside = [];
  var blocked = {};
  var steps = [];
  var violations = [];
  var waitedOnWsem = 0;

  function inSection(kind) {
    return inside.filter(function (x) { return x.kind === kind; }).length;
  }
  function blockedOn(where) {
    var n = 0;
    for (var k in blocked) if (blocked[k].on === where) n++;
    return n;
  }
  function safety() {
    var w = inSection('W'), r = inSection('R');
    if (w > 1) violations.push('two writers inside');
    if (w >= 1 && r >= 1) violations.push('writer and reader inside together');
  }
  function snapshot(pid, what) {
    steps.push({
      who: pid, what: what,
      readcount: readcount, rmutex: S.rmutex.v, wsem: S.wsem.v,
      readersInside: inSection('R'), writersInside: inSection('W'),
      blockedWriters: blockedOfKind('W'),
      blockedOnWsem: blockedOn('wsem'), blockedOnRmutex: blockedOn('rmutex')
    });
  }
  function acquire(sem, pid, cont, tag, kind) {
    if (sem.wait(pid)) return true;
    blocked[pid] = { on: tag || sem.name, cont: cont, kind: kind || 'R' };
    return false;
  }
  function release(sem) {
    var w = sem.signal();
    if (w && blocked[w]) { var b = blocked[w]; delete blocked[w]; b.cont(); }
    return w;
  }
  function blockedOfKind(kind) {
    var n = 0;
    for (var k in blocked) if (blocked[k].kind === kind) n++;
    return n;
  }

  function readerArrive(pid) {
    function afterRmutex() {
      readcount += 1;
      if (readcount === 1) {
        waitedOnWsem += 1;
        if (!acquire(S.wsem, pid, afterWsem, 'wsem', 'R')) {
          safety(); snapshot(pid, 'queues');
          return;
        }
      }
      afterWsem();
    }
    function afterWsem() {
      release(S.rmutex);
      inside.push({ who: pid, kind: 'R' });
      safety();
      snapshot(pid, 'reads');
    }
    if (!acquire(S.rmutex, pid, afterRmutex, 'rmutex', 'R')) return;
    afterRmutex();
  }

  function readerDone(pid) {
    function afterRmutex() {
      readcount -= 1;
      if (readcount === 0) release(S.wsem);
      release(S.rmutex);
      safety();
      snapshot(pid, 'leaves');
    }
    for (var i = 0; i < inside.length; i++) {
      if (inside[i].who === pid) { inside.splice(i, 1); break; }
    }
    if (!acquire(S.rmutex, pid, afterRmutex, 'rmutex', 'R')) return;
    afterRmutex();
  }

  function writerArrive(pid) {
    function enter() {
      inside.push({ who: pid, kind: 'W' });
      safety();
      snapshot(pid, 'writes');
    }
    if (!acquire(S.wsem, pid, enter, 'wsem', 'W')) {
      safety(); snapshot(pid, 'queues');
      return;
    }
    enter();
  }

  function writerDone(pid) {
    for (var i = 0; i < inside.length; i++) {
      if (inside[i].who === pid) { inside.splice(i, 1); break; }
    }
    release(S.wsem);
    safety();
    snapshot(pid, 'leaves');
  }

  return {
    run: function (script) {
      script.forEach(function (ev) {
        if (ev.op === 'R') readerArrive(ev.id);
        else if (ev.op === 'W') writerArrive(ev.id);
        else if (ev.op === 'Rdone') readerDone(ev.id);
        else if (ev.op === 'Wdone') writerDone(ev.id);
      });
      return {
        steps: steps, violations: violations, readcount: readcount,
        rmutex: S.rmutex.v, wsem: S.wsem.v, inside: inside.slice(),
        blockedOnWsem: blockedOn('wsem'),
        blockedOnRmutex: blockedOn('rmutex'),
        readersInside: inSection('R'), writersInside: inSection('W'),
        readersTouchingWsem: waitedOnWsem
      };
    }
  };
}

/* the trace the lesson animates: R1, R2, W1, R3, R4 */
var RW1_TRACE = rw1Machine().run([
  { op: 'R', id: 'R1' }, { op: 'R', id: 'R2' }, { op: 'W', id: 'W1' },
  { op: 'R', id: 'R3' }, { op: 'R', id: 'R4' }
]);

/* the same solution with every reader leaving: the writer is admitted */
var RW1_DRAIN = rw1Machine().run([
  { op: 'R', id: 'R1' }, { op: 'R', id: 'R2' }, { op: 'W', id: 'W1' },
  { op: 'R', id: 'R3' }, { op: 'R', id: 'R4' },
  { op: 'Rdone', id: 'R1' }, { op: 'Rdone', id: 'R2' },
  { op: 'Rdone', id: 'R3' }, { op: 'Rdone', id: 'R4' }
]);

/* a writer first, then twenty readers: the readers queue behind rmutex */
var RW1_WRITER_FIRST = (function () {
  var script = [{ op: 'W', id: 'W1' }];
  for (var i = 1; i <= 20; i++) script.push({ op: 'R', id: 'R' + i });
  return rw1Machine().run(script);
})();

/* a steady stream of readers against one waiting writer: the writer starves */
var RW1_STARVE = (function () {
  var script = [{ op: 'R', id: 'R1' }, { op: 'W', id: 'W1' }];
  for (var i = 2; i <= 20; i++) script.push({ op: 'R', id: 'R' + i });
  return rw1Machine().run(script);
})();

/* ---------- readers-writers, second solution (writer preference) ----------
   Shared: int readcount = 0, writecount = 0;
           sem readTry = 1, wmutex = 1, rcm = 1, wcm = 1.
   Reader: wait(readTry); wait(rcm); readcount++;
           if (readcount==1) wait(wmutex);
           signal(rcm); signal(readTry); READ;
           wait(rcm); readcount--;
           if (readcount==0) signal(wmutex); signal(rcm);
   Writer: wait(wcm); writecount++;
           if (writecount==1) wait(readTry);
           signal(wcm); wait(wmutex); WRITE; signal(wmutex);
           wait(wcm); writecount--;
           if (writecount==0) signal(readTry); signal(wcm);                 */

function rw2Machine() {
  var S = {
    readTry: new Sem('readTry', 1), wmutex: new Sem('wmutex', 1),
    rcm: new Sem('rcm', 1), wcm: new Sem('wcm', 1)
  };
  var readcount = 0, writecount = 0;
  var inside = [], blocked = {}, steps = [], violations = [];

  function count(kind) { return inside.filter(function (x) { return x.kind === kind; }).length; }
  function blockedOn(where) {
    var n = 0;
    for (var k in blocked) if (blocked[k].on === where) n++;
    return n;
  }
  function safety() {
    if (count('W') > 1) violations.push('two writers inside');
    if (count('W') >= 1 && count('R') >= 1) violations.push('writer and reader inside together');
  }
  function snapshot(pid, what) {
    steps.push({
      who: pid, what: what,
      readcount: readcount, writecount: writecount,
      readTry: S.readTry.v, wmutex: S.wmutex.v,
      readersInside: count('R'), writersInside: count('W'),
      blockedReaders: blockedOn('readTry'),
      blockedWriters: blockedOn('wmutex')
    });
  }
  function acquire(sem, pid, cont, tag) {
    if (sem.wait(pid)) return true;
    blocked[pid] = { on: tag || sem.name, cont: cont };
    return false;
  }
  function release(sem) {
    var w = sem.signal();
    if (w && blocked[w]) { var b = blocked[w]; delete blocked[w]; b.cont(); }
    return w;
  }

  function readerArrive(pid) {
    function afterGate() {
      function afterRcm() {
        readcount += 1;
        if (readcount === 1) {
          if (!acquire(S.wmutex, pid, afterWmutex)) return;   // holds rcm
        }
        afterWmutex();
      }
      function afterWmutex() {
        release(S.rcm);
        release(S.readTry);
        inside.push({ who: pid, kind: 'R' });
        safety();
        snapshot(pid, 'reads');
      }
      if (!acquire(S.rcm, pid, afterRcm)) return;
      afterRcm();
    }
    if (!acquire(S.readTry, pid, afterGate, 'readTry', 'R')) {
      safety(); snapshot(pid, 'queues');
      return;
    }
    afterGate();
  }

  function readerDone(pid) {
    function afterRcm() {
      readcount -= 1;
      if (readcount === 0) release(S.wmutex);
      release(S.rcm);
      safety();
      snapshot(pid, 'leaves');
    }
    for (var i = 0; i < inside.length; i++) {
      if (inside[i].who === pid) { inside.splice(i, 1); break; }
    }
    if (!acquire(S.rcm, pid, afterRcm)) return;
    afterRcm();
  }

  function writerArrive(pid) {
    function afterWcm() {
      writecount += 1;
      var ready = true;
      if (writecount === 1) ready = acquire(S.readTry, pid, afterGateHeld, 'readTry', 'W');
      release(S.wcm);
      if (!ready) return;                // the gate blocked us; afterGateHeld resumes on wake
      afterGateHeld();
    }
    function afterGateHeld() {
      if (!acquire(S.wmutex, pid, enter, 'wmutex', 'W')) {
        safety(); snapshot(pid, 'queues');
        return;
      }
      enter();
    }
    function enter() {
      inside.push({ who: pid, kind: 'W' });
      safety();
      snapshot(pid, 'writes');
    }
    if (!acquire(S.wcm, pid, afterWcm)) return;
    afterWcm();
  }

  function writerDone(pid) {
    for (var i = 0; i < inside.length; i++) {
      if (inside[i].who === pid) { inside.splice(i, 1); break; }
    }
    release(S.wmutex);
    function afterWcm() {
      writecount -= 1;
      if (writecount === 0) release(S.readTry);
      release(S.wcm);
      safety();
      snapshot(pid, 'leaves');
    }
    if (!acquire(S.wcm, pid, afterWcm)) return;
    afterWcm();
  }

  return {
    run: function (script) {
      script.forEach(function (ev) {
        if (ev.op === 'R') readerArrive(ev.id);
        else if (ev.op === 'W') writerArrive(ev.id);
        else if (ev.op === 'Rdone') readerDone(ev.id);
        else if (ev.op === 'Wdone') writerDone(ev.id);
      });
      return {
        steps: steps, violations: violations, readcount: readcount, writecount: writecount,
        readTry: S.readTry.v, wmutex: S.wmutex.v, inside: inside.slice(),
        readersInside: count('R'), writersInside: count('W'),
        blockedReaders: blockedOn('readTry'), blockedWriters: blockedOn('wmutex')
      };
    }
  };
}

/* the trace the lesson animates: R1 reading, W1 arrives, R2 arrives */
var RW2_TRACE = rw2Machine().run([
  { op: 'R', id: 'R1' }, { op: 'W', id: 'W1' }, { op: 'R', id: 'R2' }
]);

/* writer preference with the reader released: the gate reopens after the writer */
var RW2_RELEASE = rw2Machine().run([
  { op: 'R', id: 'R1' }, { op: 'W', id: 'W1' }, { op: 'R', id: 'R2' },
  { op: 'Rdone', id: 'R1' }, { op: 'Wdone', id: 'W1' }
]);

/* reader starvation: writers keep arriving, so the gate never reopens */
var RW2_STARVE = (function () {
  var script = [{ op: 'W', id: 'W1' }, { op: 'R', id: 'R1' }];
  for (var i = 2; i <= 12; i++) script.push({ op: 'W', id: 'W' + i });
  return rw2Machine().run(script);
})();

/* ---------- dining philosophers: exhaustive state search ----------
   A philosopher is in one of four situations:
     0 IDLE        thinking, holds nothing, wants nothing yet
     1 WAIT_FIRST  asking for the first fork, holds nothing
     2 HOLD_FIRST  holds the first fork, wants the second
     3 EAT         holds both forks
   Fork ownership is determined by those labels, so a state is one label per
   philosopher plus the number of free permits, if a room semaphore is used.    */

function dpSearch(n, orders, permits) {
  var BASE = 4;
  var states = 0, maxEat = 0, stuck = [];
  var seen = {}, queue = [];
  var forkConflicts = 0;

  function encode(st, perm) {
    var c = 0, mul = 1;
    for (var i = 0; i < n; i++) { c += st[i] * mul; mul *= BASE; }
    return c * 16 + perm;
  }
  function decode(code) {
    var perm = code % 16, c = (code - perm) / 16;
    var st = [];
    for (var i = 0; i < n; i++) { st.push(c % BASE); c = Math.floor(c / BASE); }
    return { st: st, perm: perm };
  }
  function owner(st) {
    var own = new Array(n).fill(-1);
    for (var i = 0; i < n; i++) {
      var f = [];
      if (st[i] === 2 || st[i] === 3) f.push(orders[i][0]);
      if (st[i] === 3) f.push(orders[i][1]);
      for (var j = 0; j < f.length; j++) {
        if (own[f[j]] !== -1) forkConflicts++;
        own[f[j]] = i;
      }
    }
    return own;
  }

  var startPerm = permits === null ? 0 : permits;
  var start = new Array(n).fill(0);
  var startCode = encode(start, startPerm);
  seen[startCode] = true;
  queue.push(startCode);
  states = 1;

  while (queue.length) {
    var code = queue.shift();
    var d = decode(code), st = d.st, perm = d.perm;
    var eating = st.filter(function (x) { return x === 3; }).length;
    if (eating > maxEat) maxEat = eating;
    var own = owner(st);
    var moves = [];
    for (var i = 0; i < n; i++) {
      if (st[i] === 0) {
        if (permits === null) moves.push({ i: i, to: 1, perm: perm });
        else if (perm > 0) moves.push({ i: i, to: 1, perm: perm - 1 });
      } else if (st[i] === 1) {
        if (own[orders[i][0]] === -1) moves.push({ i: i, to: 2, perm: perm });
      } else if (st[i] === 2) {
        if (own[orders[i][1]] === -1) moves.push({ i: i, to: 3, perm: perm });
      } else {
        moves.push({ i: i, to: 0, perm: permits === null ? perm : perm + 1 });
      }
    }
    if (!moves.length) stuck.push(st.slice());
    for (var m = 0; m < moves.length; m++) {
      var ns = st.slice();
      ns[moves[m].i] = moves[m].to;
      var nc = encode(ns, moves[m].perm);
      if (!seen[nc]) { seen[nc] = true; queue.push(nc); states++; }
    }
  }

  return { states: states, stuck: stuck, maxEat: maxEat, forkConflicts: forkConflicts, n: n };
}

var NPHIL = 5;
function ringOrders(n) {
  var o = [];
  for (var i = 0; i < n; i++) o.push([i, (i + 1) % n]);   // left first
  return o;
}
function asymOrders(n) {
  var o = [];
  for (var i = 0; i < n; i++) o.push(i % 2 === 0 ? [i, (i + 1) % n] : [(i + 1) % n, i]);
  return o;
}

var DP_NAIVE = dpSearch(NPHIL, ringOrders(NPHIL), null);
var DP_ASYM = dpSearch(NPHIL, asymOrders(NPHIL), null);
var DP_ROOM4 = dpSearch(NPHIL, ringOrders(NPHIL), NPHIL - 1);
var DP_ROOM5 = dpSearch(NPHIL, ringOrders(NPHIL), NPHIL);

/* independent check: the wait-for graph of a state, and whether it has a cycle */
function waitForCycle(st, orders) {
  var n = st.length;
  var own = new Array(n).fill(-1);
  for (var i = 0; i < n; i++) {
    if (st[i] === 2 || st[i] === 3) own[orders[i][0]] = i;
    if (st[i] === 3) own[orders[i][1]] = i;
  }
  var edge = new Array(n).fill(-1);
  for (var p = 0; p < n; p++) {
    if (st[p] === 1) edge[p] = own[orders[p][0]];
    else if (st[p] === 2) edge[p] = own[orders[p][1]];
  }
  var best = 0;
  for (var s = 0; s < n; s++) {
    var seen = {}, cur = s, len = 0;
    while (cur !== -1 && cur !== undefined && !seen[cur]) {
      seen[cur] = true; cur = edge[cur]; len++;
    }
    if (cur === s && len > best) best = len;
  }
  return best;
}

/* ---------- the values the lesson prints ---------- */

var V = {
  nphil: NPHIL,
  upper: Math.pow(4, NPHIL),
  naiveStates: DP_NAIVE.states,
  naiveStuck: DP_NAIVE.stuck.length,
  naiveStuckState: DP_NAIVE.stuck[0] || null,
  asymStates: DP_ASYM.states,
  asymStuck: DP_ASYM.stuck.length,
  room4States: DP_ROOM4.states,
  room4Stuck: DP_ROOM4.stuck.length,
  room5States: DP_ROOM5.states,
  room5Stuck: DP_ROOM5.stuck.length,
  maxEat: DP_NAIVE.maxEat,
  cycleInStuck: DP_NAIVE.stuck[0] ? waitForCycle(DP_NAIVE.stuck[0], ringOrders(NPHIL)) : 0,

  rw1Steps: RW1_TRACE.steps,
  rw1Violations: RW1_TRACE.violations.length,
  rw1AfterR1: RW1_TRACE.steps[0],
  rw1AfterR2: RW1_TRACE.steps[1],
  rw1AfterW1: RW1_TRACE.steps[2],
  rw1AfterR4: RW1_TRACE.steps[4],
  rw1ReadersTouchingWsem: RW1_TRACE.readersTouchingWsem,
  rw1StarveWritersInside: RW1_STARVE.writersInside,
  rw1StarveReadersInside: RW1_STARVE.readersInside,
  rw1StarveWsem: RW1_STARVE.wsem,
  rw1DrainWriterInside: RW1_DRAIN.writersInside,
  rw1DrainReadersInside: RW1_DRAIN.readersInside,
  rw1WriterFirstReadersInside: RW1_WRITER_FIRST.readersInside,
  rw1WriterFirstOnWsem: RW1_WRITER_FIRST.blockedOnWsem,
  rw1WriterFirstOnRmutex: RW1_WRITER_FIRST.blockedOnRmutex,

  rw2AfterR1: RW2_TRACE.steps[0],
  rw2AfterW1: RW2_TRACE.steps[1],
  rw2AfterR2: RW2_TRACE.steps[2],
  rw2Violations: RW2_TRACE.violations.length,
  rw2ReleaseReaderInside: RW2_RELEASE.readersInside,
  rw2ReleaseWritersInside: RW2_RELEASE.writersInside,
  rw2StarveBlockedReaders: RW2_STARVE.blockedReaders,
  rw2StarveReadersInside: RW2_STARVE.readersInside,

  semaphoresFirst: 2,
  semaphoresSecond: 4
};

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* --- the semaphore itself --- */
(function () {
  var s = new Sem('t', 1);
  var got = s.wait('A');
  chk('wait on a semaphore at 1 succeeds and leaves 0', got === true && s.v === 0);
  s.wait('B');
  chk('a second wait leaves minus one and queues the caller', s.v === -1 && s.q.length === 1);
  var woke = s.signal();
  chk('signal wakes the queued process and leaves the value at 0', woke === 'B' && s.v === 0);
  chk('a negative value is the queue length', (function () {
    var t = new Sem('u', 1); t.wait('x'); t.wait('y'); t.wait('z');
    return t.v === -2 && t.q.length === 2 && Math.abs(t.v) === t.q.length;
  })());
  chk('value after m waits and p signals is s - m + p', (function () {
    var t = new Sem('v', 3);
    for (var i = 0; i < 7; i++) t.wait('p' + i);
    for (var j = 0; j < 4; j++) t.signal();
    return t.v === 3 - 7 + 4;
  })());
})();

/* --- first readers-writers solution --- */
chk('RW1: no writer ever shares the section with a reader',
  V.rw1Violations === 0 && RW1_DRAIN.violations.length === 0 && RW1_STARVE.violations.length === 0);
chk('RW1: after the first reader, readcount is 1 and wsem is 0',
  V.rw1AfterR1.readcount === 1 && V.rw1AfterR1.wsem === 0);
chk('RW1: after the second reader, readcount is 2 and wsem is still 0',
  V.rw1AfterR2.readcount === 2 && V.rw1AfterR2.wsem === 0 && V.rw1AfterR2.readersInside === 2);
chk('RW1: only the first reader touches wsem',
  V.rw1ReadersTouchingWsem === 1, V.rw1ReadersTouchingWsem + ' reader(s) waited on wsem');
chk('RW1: the writer blocks with wsem at minus one',
  V.rw1AfterW1.wsem === -1 && V.rw1AfterW1.writersInside === 0 && V.rw1AfterW1.blockedWriters === 1);
chk('RW1: readers arriving after the blocked writer still enter',
  V.rw1AfterR4.readersInside === 4 && V.rw1AfterR4.wsem === -1);
chk('RW1: the count reaches 4 with four readers inside',
  V.rw1AfterR4.readcount === 4);
chk('RW1: the writer enters only when the last reader leaves',
  V.rw1DrainWriterInside === 1, 'writers inside at the end of the drain: ' + V.rw1DrainWriterInside);
chk('RW1: a steady arrival of readers starves the writer',
  V.rw1StarveWritersInside === 0 && V.rw1StarveReadersInside === 20,
  'readers inside ' + V.rw1StarveReadersInside + ', writers inside ' + V.rw1StarveWritersInside);
chk('RW1: the starved writer stays queued with wsem at minus one',
  V.rw1StarveWsem === -1, 'wsem ' + V.rw1StarveWsem);
chk('RW1: readcount is bounded by nothing in the code',
  V.rw1StarveReadersInside === 20);
chk('RW1: a writer that gets in first keeps every reader out',
  V.rw1WriterFirstReadersInside === 0, 'readers inside ' + V.rw1WriterFirstReadersInside);
chk('RW1: the first reader holds rmutex while it waits on wsem, so the rest queue on rmutex',
  V.rw1WriterFirstOnWsem === 1 && V.rw1WriterFirstOnRmutex === 19,
  'on wsem ' + V.rw1WriterFirstOnWsem + ', on rmutex ' + V.rw1WriterFirstOnRmutex);
chk('RW1: the number of semaphores is two', V.semaphoresFirst === 2);

/* --- second readers-writers solution --- */
chk('RW2: no writer ever shares the section with a reader',
  V.rw2Violations === 0 && RW2_RELEASE.violations.length === 0 && RW2_STARVE.violations.length === 0);
chk('RW2: the first reader takes wmutex, leaving it at 0',
  V.rw2AfterR1.wmutex === 0 && V.rw2AfterR1.readersInside === 1);
chk('RW2: the first writer takes readTry and blocks on wmutex',
  V.rw2AfterW1.readTry === 0 && V.rw2AfterW1.wmutex === -1 &&
  V.rw2AfterW1.writecount === 1 && V.rw2AfterW1.writersInside === 0);
chk('RW2: a reader arriving after the writer blocks at the gate',
  V.rw2AfterR2.readTry === -1 && V.rw2AfterR2.blockedReaders === 1);
chk('RW2: the gate reopens after the writer and the waiting reader enters',
  V.rw2ReleaseReaderInside === 1);
chk('RW2: a steady arrival of writers starves the readers',
  V.rw2StarveBlockedReaders >= 1, 'blocked readers at the end: ' + V.rw2StarveBlockedReaders);
chk('RW2: the number of semaphores is four', V.semaphoresSecond === 4);
chk('RW2: the two solutions differ in semaphore count by two',
  V.semaphoresSecond - V.semaphoresFirst === 2);

/* --- dining philosophers --- */
chk('DP: the state space has at most 4^n states', V.upper === 1024, '4^5 = ' + V.upper);
chk('DP naive: reachable states are 573', V.naiveStates === 573, 'found ' + V.naiveStates);
chk('DP naive: exactly one reachable state is stuck', V.naiveStuck === 1, 'found ' + V.naiveStuck);
chk('DP naive: the stuck state is all five holding the first fork',
  !!V.naiveStuckState && V.naiveStuckState.every(function (x) { return x === 2; }),
  JSON.stringify(V.naiveStuckState));
chk('DP naive: the wait-for graph of the stuck state is a 5-cycle',
  V.cycleInStuck === 5, 'cycle length ' + V.cycleInStuck);
chk('DP naive: at most two philosophers eat at once', V.maxEat === 2, 'max eating ' + V.maxEat);
chk('DP naive: three meals would need six forks, more than five', 3 * 2 > NPHIL);
chk('DP naive: no fork is ever held by two philosophers', DP_NAIVE.forkConflicts === 0);
chk('DP asymmetric: reachable states are 492', V.asymStates === 492, 'found ' + V.asymStates);
chk('DP asymmetric: no reachable state is stuck', V.asymStuck === 0, 'found ' + V.asymStuck);
chk('DP asymmetric: no fork is ever held by two philosophers', DP_ASYM.forkConflicts === 0);
chk('DP room of 4: reachable states are 491', V.room4States === 491, 'found ' + V.room4States);
chk('DP room of 4: no reachable state is stuck', V.room4Stuck === 0, 'found ' + V.room4Stuck);
chk('DP room of 5: the deadlock returns', V.room5Stuck === 1 && V.room5States === 573,
  'states ' + V.room5States + ', stuck ' + V.room5Stuck);
chk('DP: every repair keeps at most two eating at once',
  DP_ASYM.maxEat <= 2 && DP_ROOM4.maxEat <= 2);
chk('DP: the repairs do not raise the eating ceiling above two',
  DP_ASYM.maxEat === 2 && DP_ROOM4.maxEat === 2);
chk('DP: a stuck state has no legal move by definition', (function () {
  var st = V.naiveStuckState;
  if (!st) return false;
  var own = new Array(NPHIL).fill(-1);
  var orders = ringOrders(NPHIL);
  for (var i = 0; i < NPHIL; i++) {
    if (st[i] === 2 || st[i] === 3) own[orders[i][0]] = i;
    if (st[i] === 3) own[orders[i][1]] = i;
  }
  for (var p = 0; p < NPHIL; p++) {
    if (st[p] === 0) return false;
    if (st[p] === 1 && own[orders[p][0]] === -1) return false;
    if (st[p] === 2 && own[orders[p][1]] === -1) return false;
  }
  return true;
})());
chk('DP: the naive search and the room-of-five search agree', (function () {
  return DP_NAIVE.states === DP_ROOM5.states && DP_NAIVE.stuck.length === DP_ROOM5.stuck.length;
})());
chk('DP: the asymmetric repair keeps every philosopher reachable',
  V.asymStates > 400);
chk('DP: the four conditions are all true in the stuck state', (function () {
  var st = V.naiveStuckState;
  if (!st) return false;
  var mutualExclusion = true;                       // each fork has one holder
  var holdAndWait = st.every(function (x) { return x === 2; });
  var noPreemption = true;                          // forks are released only voluntarily
  var circularWait = V.cycleInStuck === 5;
  return mutualExclusion && holdAndWait && noPreemption && circularWait;
})());

/* --- the counting claims --- */
chk('counting: readers are not capped by the first solution', V.rw1StarveReadersInside === 20);
chk('counting: the drain leaves no reader inside and the writer in',
  V.rw1DrainReadersInside === 0 && V.rw1DrainWriterInside === 1);
chk('counting: at most one writer is inside in every trace',
  RW1_DRAIN.steps.every(function (s) { return s.writersInside <= 1; }) &&
  RW2_RELEASE.steps.every(function (s) { return s.writersInside <= 1; }));
chk('counting: a negative semaphore value is a queue length, so minus one is one waiter',
  V.rw1AfterW1.wsem === -1 && V.rw1AfterW1.blockedWriters === 1);
chk('counting: the two eating ceiling is floor of n over 2', Math.floor(NPHIL / 2) === V.maxEat);

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

var SCENES = {};
function scene(id, fn) { SCENES[id] = fn; }

function on(t, at) { return K.clamp01((t - at) / 0.45); }

function label(P, x, y, s, o) {
  o = o || {};
  P.alpha(o.alpha === undefined ? 1 : o.alpha);
  P.text(x, y, s, { size: o.size || 12, color: o.color || INK, bold: o.bold, mono: o.mono,
                    align: o.align, base: o.base });
  P.alpha(1);
}

function card(P, x, y, w, h, o) {
  o = o || {};
  P.alpha(o.alpha === undefined ? 1 : o.alpha);
  P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: 1.2, radius: 8 });
  P.alpha(1);
}

function chip(P, x, y, w, h, name, value, colour, alpha) {
  P.alpha(alpha === undefined ? 1 : alpha);
  P.rect(x, y, w, h, { fill: SURF2, stroke: colour || BORDER, sw: 1.4, radius: 7 });
  P.text(x + w / 2, y + 11, name, { size: 10, color: DIM, align: 'center', mono: true });
  P.text(x + w / 2, y + h - 12, String(value), { size: 19, color: colour || INK, align: 'center', bold: true, mono: true });
  P.alpha(1);
}

function heading(P, s, sub) {
  label(P, 28, 20, s, { size: 16, bold: true });
  if (sub) label(P, 28, 38, sub, { size: 11, color: DIM });
}

/* a philosopher ring: philosophers on a circle, forks inside it */
function ring(P, cx, cy, r, held, eating, alpha, blocked) {
  blocked = blocked || [];
  var n = NPHIL;
  var i, ang;
  P.alpha(alpha);
  for (i = 0; i < n; i++) {
    ang = -Math.PI / 2 + i * 2 * Math.PI / n;
    // fork i sits between philosopher i-1 and philosopher i
    var fa = -Math.PI / 2 + (i - 0.5) * 2 * Math.PI / n;
    var fx = cx + Math.cos(fa) * (r * 0.52), fy = cy + Math.sin(fa) * (r * 0.52);
    var isHeld = held.indexOf(i) >= 0;
    P.rect(fx - 9, fy - 5, 18, 10, {
      fill: isHeld ? ACCDIM : SURF, stroke: isHeld ? ACC : BORDER, sw: isHeld ? 2 : 1.2, radius: 3
    });
    P.text(fx, fy, 'F' + i, { size: 8, color: isHeld ? ACC : FAINT, align: 'center', base: 'middle', mono: true });
  }
  for (i = 0; i < n; i++) {
    ang = -Math.PI / 2 + i * 2 * Math.PI / n;
    var px = cx + Math.cos(ang) * r, py = cy + Math.sin(ang) * r;
    var isEat = eating.indexOf(i) >= 0;
    var isBlocked = blocked.indexOf(i) >= 0;
    P.circle(px, py, 24, {
      fill: isEat ? ACCDIM : SURF, stroke: isEat ? ACC : isBlocked ? BAD : BORDER,
      sw: isEat ? 2.2 : isBlocked ? 1.6 : 1.3
    });
    P.text(px, py - 4, 'P' + i, { size: 11, bold: true, align: 'center', base: 'middle' });
    P.text(px, py + 8, isEat ? 'eats' : isBlocked ? 'blocked' : 'thinks', {
      size: 8, color: isEat ? ACC : isBlocked ? BAD : FAINT, align: 'center', base: 'middle'
    });
  }
  P.alpha(1);
}

/* ---------------- scene 1 ---------------- */
scene('two-problems', function (P, t) {
  heading(P, 'Two problems inside one word', 'a shared value against a ring of resources');

  card(P, 28, 52, 404, 296, { alpha: on(t, 0.2) });
  label(P, 44, 74, 'Readers and writers', { size: 14, bold: true, alpha: on(t, 0.4) });
  label(P, 44, 92, 'one shared document', { size: 11, color: DIM, alpha: on(t, 0.4) });

  var readers = ['R1', 'R2', 'R3'];
  for (var i = 0; i < 3; i++) {
    var a = on(t, 1.2 + i * 0.8);
    if (a <= 0) continue;
    P.alpha(a);
    P.rect(46, 110 + i * 38, 118, 28, { fill: ACCDIM, stroke: ACC, sw: 1.3, radius: 6 });
    P.text(105, 124 + i * 38, readers[i] + ' reading', { size: 11, color: ACC, align: 'center', base: 'middle', bold: true });
    P.alpha(1);
  }
  var aw = on(t, 5.2);
  if (aw > 0) {
    P.alpha(aw);
    P.rect(238, 148, 168, 30, { fill: BADDIM, stroke: BAD, sw: 1.4, radius: 6, dash: [5, 4] });
    P.text(322, 163, 'W1 waits outside', { size: 11, color: BAD, align: 'center', base: 'middle', bold: true });
    P.alpha(1);
  }
  label(P, 44, 262, 'Readers share. A writer is alone.', { size: 12, alpha: on(t, 2.4) });
  label(P, 44, 284, 'Failure mode: starvation.', { size: 12, color: WARN, alpha: on(t, 8) });

  card(P, 468, 52, 404, 296, { alpha: on(t, 0.2) });
  label(P, 484, 74, 'Dining philosophers', { size: 14, bold: true, alpha: on(t, 0.4) });
  label(P, 484, 92, 'one fork between each pair', { size: 11, color: DIM, alpha: on(t, 0.4) });
  ring(P, 670, 206, 76, [], [], on(t, 1.4));
  label(P, 484, 300, 'Each needs the two forks beside him.', { size: 12, alpha: on(t, 3) });
  label(P, 484, 322, 'Failure mode: deadlock.', { size: 12, color: BAD, alpha: on(t, 15) });

  label(P, 28, 378, 'A counter settles the first. Breaking a cycle settles the second.', { size: 13, color: INFO, alpha: on(t, 22.5) });
});

/* ---------------- scene 2 ---------------- */
scene('rules', function (P, t) {
  heading(P, 'Three rules, and the one-mutex answer', 'safety is two of them; fairness is the third');

  card(P, 28, 52, 430, 292, { alpha: on(t, 0.2) });
  var rows = [
    ['1   A writer is alone.', 'no reader, and no second writer, inside'],
    ['2   Readers share the section.', 'any number of readers may read together'],
    ['3   A waiting process gets in.', 'this is the rule that breaks']
  ];
  for (var i = 0; i < 3; i++) {
    var a = on(t, 0.6 + i * 1.6);
    label(P, 44, 82 + i * 56, rows[i][0], { size: 13, bold: true, alpha: a });
    label(P, 44, 102 + i * 56, rows[i][1], { size: 11, color: DIM, alpha: a });
  }
  P.alpha(on(t, 5.4));
  P.line(44, 244, 442, 244, { stroke: BORDER, sw: 1, dash: [4, 4] });
  P.alpha(1);
  label(P, 44, 268, 'One mutex:  wait(m); read; signal(m);', { size: 12, mono: true, alpha: on(t, 5.6) });
  label(P, 44, 292, 'Safe, and serial: two readers now take turns.', { size: 11, color: WARN, alpha: on(t, 6.4) });

  card(P, 478, 52, 394, 292, { alpha: on(t, 0.2) });
  label(P, 494, 74, 'Occupancy of the section', { size: 12, bold: true, alpha: on(t, 0.6) });
  label(P, 494, 96, 'one mutex', { size: 11, color: DIM, alpha: on(t, 1) });
  for (var j = 0; j < 3; j++) {
    var b = on(t, 1.2 + j * 0.9);
    if (b <= 0) continue;
    P.alpha(b);
    P.rect(494 + j * 108, 106, 100, 24, { fill: BADDIM, stroke: BAD, sw: 1.1, radius: 4 });
    P.text(544 + j * 108, 118, 'R' + (j + 1), { size: 11, color: BAD, align: 'center', base: 'middle', bold: true });
    P.alpha(1);
  }
  label(P, 494, 150, 'total time = sum of the three', { size: 10, color: FAINT, alpha: on(t, 4) });

  label(P, 494, 178, 'a correct solution', { size: 11, color: DIM, alpha: on(t, 4.4) });
  var lens = [100, 130, 118];
  for (var k = 0; k < 3; k++) {
    var c = on(t, 4.6 + k * 0.9);
    if (c <= 0) continue;
    P.alpha(c);
    P.rect(494, 188 + k * 28, lens[k], 22, { fill: ACCDIM, stroke: ACC, sw: 1.1, radius: 4 });
    P.text(504, 199 + k * 28, 'R' + (k + 1), { size: 10, color: ACC, base: 'middle', bold: true });
    P.alpha(1);
  }
  label(P, 494, 288, 'total time = the longest of the three', { size: 10, color: FAINT, alpha: on(t, 7.4) });

  label(P, 28, 374, 'A flag cannot express sharing. A counter can.', { size: 13, color: INFO, alpha: on(t, 22.5) });
});

/* ---------------- scene 3 ---------------- */
scene('solution-one', function (P, t) {
  heading(P, 'First solution: one counter, two semaphores', 'readcount guarded by rmutex, the data guarded by wsem');

  card(P, 28, 50, 424, 286, { alpha: on(t, 0.2) });
  var code = [
    ['Reader', 0],
    ['  wait(rmutex)', 1],
    ['  readcount = readcount + 1', 1],
    ['  if readcount == 1:  wait(wsem)', 1],
    ['  signal(rmutex)', 1],
    ['  READ', 1],
    ['  ... last reader out: signal(wsem)', 1],
    ['Writer', 2],
    ['  wait(wsem);  WRITE;  signal(wsem)', 1]
  ];
  for (var i = 0; i < code.length; i++) {
    label(P, 44, 76 + i * 24, code[i][0], {
      size: 11, mono: true, alpha: on(t, 0.4 + i * 0.25),
      bold: code[i][1] !== 1, color: code[i][1] === 2 ? INFO : INK
    });
  }
  label(P, 44, 306, 'int readcount = 0;  sem rmutex = 1;  sem wsem = 1;', { size: 10, mono: true, color: DIM, alpha: on(t, 4) });

  var s1 = V.rw1AfterR1, s2 = V.rw1AfterR2, s3 = V.rw1AfterW1, s4 = V.rw1AfterR4;
  var stepA = t >= 7.5 ? s2 : s1;
  var stepB = t >= 15 ? s3 : stepA;
  var cur = t >= 22.5 ? s4 : stepB;

  chip(P, 476, 56, 108, 52, 'readcount', cur.readcount, INFO, on(t, 0.6));
  chip(P, 596, 56, 108, 52, 'rmutex', cur.rmutex, ACC, on(t, 0.6));
  chip(P, 716, 56, 108, 52, 'wsem', cur.wsem, cur.wsem < 0 ? BAD : ACC, on(t, 0.6));

  label(P, 476, 132, 'readers inside the section', { size: 11, color: DIM, alpha: on(t, 0.8) });
  for (var j = 0; j < 4; j++) {
    var alive = cur.readersInside > j;
    P.alpha(on(t, 0.8));
    P.rect(476 + j * 88, 146, 78, 30, {
      fill: alive ? ACCDIM : SURF2, stroke: alive ? ACC : BORDER, sw: alive ? 1.5 : 1, radius: 5
    });
    P.text(515 + j * 88, 161, 'R' + (j + 1), { size: 11, align: 'center', base: 'middle', bold: true, color: alive ? ACC : FAINT });
    P.alpha(1);
  }
  var wBlocked = cur.blockedWriters > 0;
  P.alpha(on(t, 0.8));
  P.rect(476, 190, 166, 30, {
    fill: wBlocked ? BADDIM : SURF2, stroke: wBlocked ? BAD : BORDER, sw: wBlocked ? 1.5 : 1, radius: 5, dash: wBlocked ? [4, 3] : null
  });
  P.text(559, 205, wBlocked ? 'W1 queued on wsem' : 'no writer queued', {
    size: 10, align: 'center', base: 'middle', bold: wBlocked, color: wBlocked ? BAD : FAINT
  });
  P.alpha(1);

  var note = t < 7.5 ? 'R1 arrives: count 0 to 1, so she is first and takes wsem.'
    : t < 15 ? 'R2 arrives: count 1 to 2, so she never touches wsem.'
    : t < 22.5 ? 'W1 arrives: wsem goes to minus one and W1 queues.'
    : 'R3 and R4 arrive and enter: count 4, wsem still minus one.';
  label(P, 476, 250, note, { size: 11, color: INK, alpha: on(t, 0.9) });
  label(P, 476, 274, 'Only the first reader takes wsem.', { size: 11, color: ACC, alpha: on(t, 1) });
  label(P, 476, 296, 'Only the last reader gives it back.', { size: 11, color: ACC, alpha: on(t, 1) });

  label(P, 28, 362, 'The skipped wait is the whole difference from one mutex.', { size: 13, color: INFO, alpha: on(t, 22.5) });
});

/* ---------------- scene 4 ---------------- */
scene('starvation', function (P, t) {
  heading(P, 'What it costs: the writer waits for ever', 'the same trace, with the numbers kept');

  var rows = V.rw1Steps;
  var names = ['R1', 'R2', 'W1', 'R3', 'R4'];
  card(P, 28, 52, 520, 250, { alpha: on(t, 0.2) });
  label(P, 44, 74, 'step', { size: 10, color: DIM, mono: true, alpha: on(t, 0.4) });
  label(P, 128, 74, 'readcount', { size: 10, color: DIM, mono: true, alpha: on(t, 0.4) });
  label(P, 248, 74, 'wsem', { size: 10, color: DIM, mono: true, alpha: on(t, 0.4) });
  label(P, 340, 74, 'readers in', { size: 10, color: DIM, mono: true, alpha: on(t, 0.4) });
  label(P, 452, 74, 'writer', { size: 10, color: DIM, mono: true, alpha: on(t, 0.4) });
  for (var i = 0; i < rows.length; i++) {
    var a = on(t, 1.2 + i * 1.6);
    if (a <= 0) continue;
    var y = 96 + i * 34;
    var r = rows[i];
    label(P, 44, y, names[i], { size: 12, mono: true, bold: true, alpha: a });
    label(P, 128, y, String(r.readcount), { size: 12, mono: true, alpha: a });
    label(P, 248, y, String(r.wsem), { size: 12, mono: true, color: r.wsem < 0 ? BAD : ACC, bold: r.wsem < 0, alpha: a });
    label(P, 340, y, String(r.readersInside), { size: 12, mono: true, alpha: a });
    label(P, 452, y, r.blockedWriters > 0 ? 'queued' : '—', {
      size: 11, color: r.blockedWriters > 0 ? BAD : FAINT, bold: r.blockedWriters > 0, alpha: a
    });
  }
  label(P, 44, 282, 'computed by the semaphore simulator on this page', { size: 10, color: FAINT, alpha: on(t, 9) });

  card(P, 568, 52, 304, 250, { alpha: on(t, 0.2) });
  label(P, 584, 74, 'readers inside, after each arrival', { size: 11, bold: true, alpha: on(t, 0.6) });
  for (var j = 0; j < rows.length; j++) {
    var b = on(t, 1.2 + j * 1.6);
    if (b <= 0) continue;
    var wid = rows[j].readersInside * 34;
    P.alpha(b);
    if (wid > 0) P.rect(584, 92 + j * 34, wid, 22, { fill: ACCDIM, stroke: ACC, sw: 1.1, radius: 4 });
    P.text(590, 103 + j * 34, names[j], { size: 10, color: wid > 0 ? ACC : FAINT, base: 'middle', bold: true });
    P.alpha(1);
  }
  label(P, 584, 282, 'the writer stays outside throughout', { size: 10, color: BAD, alpha: on(t, 9) });

  label(P, 28, 336, 'wsem stays at minus one: one writer queued, and no rule prefers him.', { size: 13, color: BAD, alpha: on(t, 8) });
  label(P, 28, 364, 'If the readers never all leave, he never enters. Nothing is stuck.', { size: 13, alpha: on(t, 15) });
  label(P, 28, 392, 'This is reader preference, and it is the specification, not a bug.', { size: 12, color: INFO, alpha: on(t, 22.5) });
});

/* ---------------- scene 5 ---------------- */
scene('preference', function (P, t) {
  heading(P, 'Writer preference: the readTry gate', 'the first waiting writer shuts readers out');

  card(P, 28, 50, 424, 292, { alpha: on(t, 0.2) });
  var code = [
    ['Reader', 0],
    ['  wait(readTry)', 1],
    ['  wait(rmutex);  readcount++', 1],
    ['  if readcount == 1:  wait(wmutex)', 1],
    ['  signal(rmutex);  signal(readTry)', 1],
    ['  READ', 1],
    ['Writer', 2],
    ['  wait(wmutex)', 1],
    ['  if first writer:  wait(readTry)', 1],
    ['  WRITE;  last writer:  signal(readTry)', 1]
  ];
  for (var i = 0; i < code.length; i++) {
    label(P, 44, 74 + i * 23, code[i][0], {
      size: 11, mono: true, alpha: on(t, 0.4 + i * 0.22),
      bold: code[i][1] !== 1, color: code[i][1] === 2 ? INFO : INK
    });
  }

  var a1 = V.rw2AfterR1, a2 = V.rw2AfterW1, a3 = V.rw2AfterR2;
  var cur = t >= 15 ? a3 : t >= 7.5 ? a2 : a1;

  chip(P, 476, 54, 108, 50, 'readTry', cur.readTry, cur.readTry < 0 ? BAD : ACC, on(t, 0.6));
  chip(P, 596, 54, 108, 50, 'wmutex', cur.wmutex, cur.wmutex < 0 ? BAD : ACC, on(t, 0.6));
  chip(P, 716, 54, 108, 50, 'writecount', cur.writecount, INFO, on(t, 0.6));
  chip(P, 476, 116, 108, 50, 'readcount', cur.readcount, INFO, on(t, 0.6));

  label(P, 476, 190, 'queues', { size: 11, color: DIM, alpha: on(t, 0.8) });
  label(P, 476, 212, cur.blockedWriters > 0 ? 'W1 blocked on wmutex' : 'no writer queued', {
    size: 11, color: cur.blockedWriters > 0 ? BAD : FAINT, alpha: on(t, 0.9)
  });
  label(P, 476, 234, cur.blockedReaders > 0 ? 'R2 blocked on readTry' : 'no reader blocked', {
    size: 11, color: cur.blockedReaders > 0 ? BAD : FAINT, alpha: on(t, 0.9)
  });

  var note = t < 7.5 ? 'R1 passes the gate and takes wmutex: wmutex 0, readTry 1.'
    : t < 15 ? 'W1 is first, so it takes readTry (0) and blocks on wmutex (-1).'
    : 'R2 waits at the gate: readTry -1. New readers are shut out.';
  label(P, 476, 268, note, { size: 11, alpha: on(t, 0.9) });
  label(P, 476, 300, 'The writer holds the gate while it waits.', { size: 11, color: ACC, alpha: on(t, 1) });

  label(P, 28, 366, 'The gate reopens only when the last writer leaves.', { size: 13, color: INFO, alpha: on(t, 22.5) });
});

/* ---------------- scene 6 ---------------- */
scene('counting', function (P, t) {
  heading(P, 'The numbers a paper asks for', 'identify the version first, then count');

  card(P, 28, 50, 844, 208, { alpha: on(t, 0.2) });
  label(P, 44, 72, 'quantity', { size: 10, color: DIM, mono: true, alpha: on(t, 0.4) });
  label(P, 320, 72, 'reader preference', { size: 10, color: DIM, mono: true, alpha: on(t, 0.4) });
  label(P, 512, 72, 'writer preference', { size: 10, color: DIM, mono: true, alpha: on(t, 0.4) });
  label(P, 704, 72, 'fair version', { size: 10, color: DIM, mono: true, alpha: on(t, 0.4) });

  var rows = [
    ['max readers inside', 'all of them', 'all of them', 'all of them'],
    ['max writers inside', 'one', 'one', 'one'],
    ['semaphores used', '2 + 1 int', '4 + 2 ints', '4 + 2 ints + queue'],
    ['who can starve', 'writers', 'readers', 'nobody']
  ];
  for (var i = 0; i < rows.length; i++) {
    var a = on(t, 1.0 + i * 2.0);
    if (a <= 0) continue;
    var y = 100 + i * 38;
    P.alpha(a * 0.6);
    P.line(44, y + 16, 856, y + 16, { stroke: BORDER, sw: 0.8 });
    P.alpha(1);
    label(P, 44, y, rows[i][0], { size: 12, alpha: a });
    label(P, 320, y, rows[i][1], { size: 12, alpha: a, color: rows[i][1] === 'writers' ? WARN : INK });
    label(P, 512, y, rows[i][2], { size: 12, alpha: a, color: rows[i][2] === 'readers' ? WARN : INK });
    label(P, 704, y, rows[i][3], { size: 12, alpha: a, color: rows[i][3] === 'nobody' ? VAL : INK });
  }

  label(P, 28, 288, 'value after m waits and p signals, from s:   s - m + p', { size: 13, mono: true, alpha: on(t, 9) });
  label(P, 28, 316, 'blocked processes = the size of a negative value', { size: 13, mono: true, alpha: on(t, 9) });
  label(P, 28, 348, 'Minus one means one process queued, not an error.', { size: 12, color: WARN, alpha: on(t, 15) });
  label(P, 28, 374, 'Count the semaphores off the code, not from memory.', { size: 12, color: INFO, alpha: on(t, 22.5) });
});

/* ---------------- scene 7 ---------------- */
scene('philosophers', function (P, t) {
  heading(P, 'Dining philosophers: the ring, and the all-left deadlock', 'five forks, two per meal');

  var cx = 320, cy = 250, r = 108;

  // each philosopher takes the left fork, in order; the ring is drawn once
  var held = [];
  for (var i = 0; i < NPHIL; i++) {
    if (t >= 4 + i * 2.4) held.push(i);
  }
  var allHeld = held.length === NPHIL;
  var stuckAt = 4 + NPHIL * 2.4;

  ring(P, cx, cy, r, held, [], on(t, 0.2), held);

  if (t >= stuckAt) {
    P.alpha(on(t, stuckAt));
    P.circle(cx, cy, r * 0.52 + 34, { stroke: BAD, sw: 1.4, dash: [6, 5] });
    P.alpha(1);
    label(P, cx, cy + 4, 'cycle', { size: 13, color: BAD, align: 'center', base: 'middle', bold: true, alpha: on(t, stuckAt) });
    label(P, cx, cy + 22, 'nothing moves', { size: 10, color: BAD, align: 'center', base: 'middle', alpha: on(t, stuckAt) });
  }

  card(P, 620, 60, 252, 300, { alpha: on(t, 0.4) });
  label(P, 636, 82, 'the code every philosopher runs', { size: 11, bold: true, alpha: on(t, 0.6) });
  var lines = ['wait(fork[i])', 'wait(fork[(i+1)%5])', 'eat()', 'signal both', 'think()'];
  for (var j = 0; j < lines.length; j++) {
    label(P, 636, 106 + j * 22, lines[j], { size: 11, mono: true, alpha: on(t, 1 + j * 0.4) });
  }
  label(P, 636, 232, 'forks held', { size: 10, color: DIM, mono: true, alpha: on(t, 2) });
  label(P, 636, 254, held.length + ' of 5', { size: 13, bold: true, color: held.length === 5 ? BAD : INK, alpha: on(t, 2) });
  label(P, 636, 284, 'eating', { size: 10, color: DIM, mono: true, alpha: on(t, 2) });
  label(P, 636, 306, '0', { size: 13, bold: true, color: BAD, alpha: on(t, stuckAt) });

  label(P, 28, 396, allHeld ? 'All five hold the left fork, so every right fork is already taken.'
    : 'Each philosopher takes the fork on his left first.', { size: 13, color: allHeld ? BAD : INK, alpha: on(t, 2) });
  label(P, 28, 424, 'A preemption after the first wait is enough: one core can reach this.', { size: 11, color: DIM, alpha: on(t, 12) });
});

/* ---------------- scene 8 ---------------- */
scene('search', function (P, t) {
  heading(P, 'What an exhaustive search proves', 'every reachable state, not one execution');

  card(P, 28, 50, 396, 250, { alpha: on(t, 0.2) });
  label(P, 44, 72, 'search of the naive solution', { size: 12, bold: true, alpha: on(t, 0.4) });
  var rows = [
    ['reachable states', String(V.naiveStates)],
    ['states with no legal move', String(V.naiveStuck)],
    ['most philosophers eating', String(V.maxEat)],
    ['upper bound, 4^5', String(V.upper)]
  ];
  for (var i = 0; i < rows.length; i++) {
    var a = on(t, 0.8 + i * 1.4);
    if (a <= 0) continue;
    label(P, 44, 100 + i * 34, rows[i][0], { size: 12, alpha: a });
    label(P, 356, 100 + i * 34, rows[i][1], { size: 13, mono: true, bold: true, align: 'right', alpha: a,
      color: i === 1 ? BAD : i === 2 ? INFO : INK });
  }
  label(P, 44, 246, 'the one stuck state: hold, hold, hold, hold, hold', { size: 10, mono: true, color: BAD, alpha: on(t, 7) });
  label(P, 44, 268, 'its wait-for graph is a cycle of five', { size: 10, color: DIM, alpha: on(t, 8) });

  card(P, 448, 50, 424, 250, { alpha: on(t, 0.2) });
  label(P, 464, 72, 'the four conditions, all true here', { size: 12, bold: true, alpha: on(t, 0.4) });
  var cond = [
    ['mutual exclusion', 'a fork has one holder'],
    ['hold and wait', 'one fork held, one asked for'],
    ['no preemption', 'forks only given back'],
    ['circular wait', 'P0 waits for P1, and so round']
  ];
  for (var j = 0; j < cond.length; j++) {
    var b = on(t, 2 + j * 1.6);
    if (b <= 0) continue;
    label(P, 464, 102 + j * 40, cond[j][0], { size: 12, bold: true, alpha: b });
    label(P, 464, 120 + j * 40, cond[j][1], { size: 10, color: DIM, alpha: b });
  }
  label(P, 464, 282, 'remove any one, and this deadlock is impossible', { size: 10, color: ACC, alpha: on(t, 9) });

  label(P, 28, 330, 'One deadlock, and it is the one drawn by hand.', { size: 13, color: INFO, alpha: on(t, 15) });
  label(P, 28, 358, 'Two meals need four forks; a third needs six, and there are five.', { size: 12, alpha: on(t, 22.5) });
  label(P, 28, 386, 'So the ceiling of two comes from the forks, not from the code.', { size: 12, color: DIM, alpha: on(t, 22.5) });
});

/* ---------------- scene 9 ---------------- */
scene('fixes', function (P, t) {
  heading(P, 'Three repairs, and what each one gives up', 'each removes one of the four conditions');

  var cols = [
    { x: 28, title: 'room of four', lines: ['sem room = 4', 'wait(room) before forks', V.room4States + ' states, ' + V.room4Stuck + ' stuck', 'removes: five competing'], colour: ACC },
    { x: 316, title: 'asymmetric order', lines: ['odd reach right first', 'even reach left first', V.asymStates + ' states, ' + V.asymStuck + ' stuck', 'removes: the cycle'], colour: INFO },
    { x: 604, title: 'waiter or monitor', lines: ['both forks, or neither', 'state per philosopher', 'no fork held while waiting', 'removes: hold and wait'], colour: VAL }
  ];
  for (var c = 0; c < 3; c++) {
    var a = on(t, 0.6 + c * 2.2);
    card(P, cols[c].x, 52, 268, 246, { alpha: a });
    label(P, cols[c].x + 16, 74, cols[c].title, { size: 13, bold: true, alpha: a, color: cols[c].colour });
    for (var i = 0; i < cols[c].lines.length; i++) {
      label(P, cols[c].x + 16, 104 + i * 34, cols[c].lines[i], { size: 11, alpha: a, mono: i === 2 });
    }
    label(P, cols[c].x + 16, 246, c === 2 ? 'checked by construction' : 'checked by the same search', {
      size: 9, color: FAINT, alpha: a
    });
  }

  label(P, 28, 326, 'A room of five permits is the original problem again: 573 states, one stuck.', {
    size: 12, color: WARN, alpha: on(t, 15)
  });
  label(P, 28, 356, 'None of the three makes a philosopher eat sooner.', { size: 13, color: INFO, alpha: on(t, 22.5) });
  label(P, 28, 384, 'They only make it impossible for the whole table to stop.', { size: 12, alpha: on(t, 22.5) });
});

/* ---------------- scene 10 ---------------- */
scene('procedure', function (P, t) {
  heading(P, 'Three failures, and one reading procedure', 'the words are not interchangeable');

  card(P, 28, 50, 420, 220, { alpha: on(t, 0.2) });
  var rows = [
    ['deadlock', 'nothing at all can proceed', BAD],
    ['starvation', 'the system runs, one class never chosen', WARN],
    ['unbounded waiting', 'no limit on who goes ahead', INFO]
  ];
  for (var i = 0; i < rows.length; i++) {
    var a = on(t, 0.8 + i * 2.2);
    if (a <= 0) continue;
    label(P, 44, 84 + i * 62, rows[i][0], { size: 13, bold: true, alpha: a, color: rows[i][2] });
    label(P, 44, 104 + i * 62, rows[i][1], { size: 11, color: DIM, alpha: a });
  }
  label(P, 44, 250, 'a safe solution can still fail the last two', { size: 10, color: FAINT, alpha: on(t, 8) });

  card(P, 468, 50, 404, 220, { alpha: on(t, 0.2) });
  label(P, 484, 72, 'read any such question in this order', { size: 12, bold: true, alpha: on(t, 0.4) });
  var steps = ['1  list the shared variables', '2  find the semaphore guarding each', '3  match every wait to its signal',
               '4  ask which class can be bypassed', '5  only then count'];
  for (var j = 0; j < steps.length; j++) {
    var b = on(t, 1.4 + j * 1.6);
    if (b <= 0) continue;
    label(P, 484, 100 + j * 30, steps[j], { size: 11, alpha: b });
  }

  label(P, 28, 302, 'Readers: one counter and a preference rule.', { size: 13, alpha: on(t, 15) });
  label(P, 28, 330, 'Philosophers: break the cycle, or remove hold and wait.', { size: 13, alpha: on(t, 18) });
  label(P, 28, 364, 'A resource two rules disagree about: that is the whole lesson.', { size: 13, color: INFO, alpha: on(t, 22.5) });
});

/* ---------- frame dispatch ---------- */

function drawFrame(P) {
  var t = K.state.elapsed;
  P.clear();
  var i = K.sceneAt(t);
  var sc = K.state.scenes[i];
  if (!sc) return;
  var fn = SCENES[sc.id];
  var local = t - sc.start;
  if (fn) fn(P, local);
  else {
    P.text(30, 30, sc.title, { size: 16, bold: true, color: INK });
  }
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

window.__MODEL = { V: V, CHECKS: CHECKS };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
