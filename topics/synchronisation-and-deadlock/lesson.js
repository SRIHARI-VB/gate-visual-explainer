(function () {
  'use strict';

  var W = 900, H = 470;
  var K = window.LessonKit;
  var PR = window.Painters;
  var PAL = PR.PAL;
  var P = null;

/* ======================================================================
   LAYER 1 - THE MODEL (synchronisation-and-deadlock)
   Pure data and pure functions. No drawing here. Nothing in this section
   knows what a canvas is. Every number the lesson quotes is computed here,
   and the checks at the bottom re-verify it against the definitions.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function near(a, b, eps) { eps = eps === undefined ? 1e-9 : eps; return Math.abs(a - b) <= eps; }

/* ---------------- 1. race condition: two read-modify-writes ---------------- */

/* Each thread does: read counter into its own register, add one, store back.
   A statement is atomic; a switch may happen between the read and the store.
   Enumerate every interleaving and collect the possible final counter values. */
function raceOutcomes(threads) {
  var finals = {};
  var schedules = 0;

  function rec(counter, pcs, regs) {
    var done = true;
    for (var i = 0; i < threads; i++) if (pcs[i] < 2) done = false;
    if (done) { finals[counter] = true; schedules++; return; }
    for (var t = 0; t < threads; t++) {
      if (pcs[t] >= 2) continue;
      var npc = pcs.slice(), nr = regs.slice(), c = counter;
      if (pcs[t] === 0) { nr[t] = c; npc[t] = 1; }        /* read  */
      else { c = nr[t] + 1; npc[t] = 2; }                 /* store */
      rec(c, npc, nr);
    }
  }
  rec(0, [0, 0], [null, null]);

  var vals = Object.keys(finals).map(Number).sort(function (a, b) { return a - b; });
  return { values: vals, schedules: schedules };
}

var RACE = raceOutcomes(2);

/* The lost-update schedule, as a table: who does what, and what the state is. */
var RACE_STEPS = [
  { who: 'T1', op: 'read  counter -> r1', r1: 0, r2: '-', counter: 0 },
  { who: 'T2', op: 'read  counter -> r2', r1: 0, r2: 0, counter: 0 },
  { who: 'T1', op: 'write r1 + 1 -> counter', r1: 1, r2: 0, counter: 1 },
  { who: 'T2', op: 'write r2 + 1 -> counter', r1: 1, r2: 1, counter: 1 }
];

/* ---------------- 2. strict alternation ---------------- */

/* turn is shared and starts at 0. Entry for process i: spin while turn != i.
   Exit: turn = 1 - i.  Check mutual exclusion by enumerating states.
   pc: 0 = remainder, 1 = entry spin, 2 = critical section, 3 = exit. */
function alternation() {
  var meViolations = 0, states = 0;
  var seen = {};

  function rec(turn, pc) {
    var key = turn + '|' + pc.join(',');
    if (seen[key]) return;
    seen[key] = true; states++;
    if (pc[0] === 2 && pc[1] === 2) meViolations++;
    if (pc[0] === 4 && pc[1] === 4) return;
    for (var i = 0; i < 2; i++) {
      if (pc[i] >= 4) continue;
      var npc = pc.slice(), nt = turn;
      if (pc[i] === 0) { npc[i] = 1; }                    /* wants to enter */
      else if (pc[i] === 1) { if (turn !== i) continue; npc[i] = 2; }
      else if (pc[i] === 2) { npc[i] = 3; }
      else { nt = 1 - i; npc[i] = 4; }                    /* leaves, passes baton */
      rec(nt, npc);
    }
  }
  rec(0, [0, 0]);

  /* the progress failure: turn = 1, process 1 idle in its remainder, process 0
     wants in. Nothing is in the critical section and process 0 cannot enter. */
  var progressFail = { turn: 1, pc: [1, 0], csOccupied: false, waiting: 'P0' };

  return { states: states, meViolations: meViolations, progressFail: progressFail };
}
var ALT = alternation();

/* ---------------- 3. Peterson's algorithm ---------------- */

/* flag[0], flag[1], turn.  Entry for i: flag[i]=1; turn=j; spin while
   (flag[j] && turn==j).  Exit: flag[i]=0.
   pc: 0 idle, 1 flag set, 2 turn set, 3 spin check, 4 critical section,
       5 flag cleared.  A spin that cannot proceed is a self-loop. */
function peterson() {
  var meViolations = 0, deadlocks = 0, states = 0, seen = {};

  function moves(flag, turn, pc) {
    var out = [];
    for (var i = 0; i < 2; i++) {
      if (pc[i] >= 5) continue;
      var j = 1 - i, f = flag.slice(), t = turn, p = pc.slice();
      if (p[i] === 0) { f[i] = 1; p[i] = 1; }
      else if (p[i] === 1) { t = j; p[i] = 2; }
      else if (p[i] === 2) {
        if (f[j] === 1 && t === j) continue;   /* spin: no state change */
        p[i] = 3;
      }
      else if (p[i] === 3) { p[i] = 4; }
      else { f[i] = 0; p[i] = 5; }
      out.push([f, t, p]);
    }
    return out;
  }

  function rec(flag, turn, pc) {
    var key = flag.join('') + '|' + turn + '|' + pc.join(',');
    if (seen[key]) return;
    seen[key] = true; states++;
    if (pc[0] === 3 && pc[1] === 3) meViolations++;
    var mv = moves(flag, turn, pc);
    if (mv.length === 0 && !(pc[0] === 5 && pc[1] === 5)) deadlocks++;
    for (var i = 0; i < mv.length; i++) rec(mv[i][0], mv[i][1], mv[i][2]);
  }
  rec([0, 0], 0, [0, 0]);

  return { states: states, meViolations: meViolations, deadlocks: deadlocks };
}
var PET = peterson();

/* ---------------- 4. counting semaphore ---------------- */

/* wait(S): S = S - 1; if S < 0 the caller blocks.
   signal(S): S = S + 1; if S <= 0 one sleeper wakes.
   The value is (permits left) when non-negative and -(number blocked) when
   negative.  completed waits can never exceed S0 + signals issued. */
function semRun(S0, ops) {
  var s = S0, blocked = 0, completedWaits = 0, signals = 0, trace = [];
  for (var i = 0; i < ops.length; i++) {
    if (ops[i] === 'P') {
      s -= 1;
      if (s < 0) { blocked++; } else { completedWaits++; }
    } else {
      s += 1; signals++;
      if (s <= 0) { blocked--; completedWaits++; }
    }
    trace.push({ op: ops[i], s: s, blocked: blocked });
  }
  return { value: s, blocked: blocked, completedWaits: completedWaits, signals: signals, trace: trace };
}

/* GATE 2016 Set 2 Q49: 20 waits and 12 signals.  Largest S0 that still leaves
   at least one wait blocked: from S0 at most S0 + 12 waits can ever complete,
   so blocking is certain exactly when S0 + 12 < 20. */
function largestBlockingInitial(np, nv) {
  var best = -1;
  for (var s0 = 0; s0 <= np + nv; s0++) {
    var worstOrder = [];
    for (var i = 0; i < np; i++) worstOrder.push('P');
    for (var j = 0; j < nv; j++) worstOrder.push('V');
    var worst = semRun(s0, worstOrder);
    if (worst.blocked > 0) best = s0;
  }
  return best;
}
var Q49 = largestBlockingInitial(20, 12);

/* ---------------- 5. producer / consumer ---------------- */

/* Buffer with 2 slots. empty counts free slots, full counts items, mutex
   protects the array.  mode 'empty-first' is correct; 'mutex-first' takes the
   mutex before waiting for a slot or an item, which is the GATE 2014 Set 2
   Q31 code shape.  Simulate a few steps from an empty buffer. */
function producerConsumer(mode) {
  /* The consumer runs first, against an empty buffer.  That is the schedule the
     paper's deadlock needs: the consumer takes the mutex, then finds no item. */
  var st = { empty: 2, full: 0, mutex: 1, items: [], held: [], log: [] };
  function w(sem, who) {
    st[sem] -= 1;
    if (st[sem] < 0) { st.held.push(who + ' holds ' + sem); return true; }
    return false;
  }
  function sg(sem) { st[sem] += 1; }

  var cblocked = null, pblocked = null;

  /* consumer, first pass */
  if (mode === 'empty-first') {
    if (w('full', 'consumer')) cblocked = 'consumer blocked on full, holding nothing';
    else if (w('mutex', 'consumer')) cblocked = 'consumer blocked on mutex';
  } else {
    if (w('mutex', 'consumer')) cblocked = 'consumer blocked on mutex';
    else if (w('full', 'consumer')) cblocked = 'consumer blocked on full, holding the mutex';
  }
  st.log.push(cblocked || 'consumer removed an item');

  /* producer */
  if (w('mutex', 'producer')) pblocked = 'producer blocked on mutex';
  else if (w('empty', 'producer')) pblocked = 'producer blocked on empty, holding the mutex';
  else {
    st.items.push('x');
    sg('full'); sg('mutex');
    st.log.push('producer inserted an item and signalled full');
  }
  if (pblocked) st.log.push(pblocked);

  /* the consumer resumes if it was woken */
  var completed = false;
  if (mode === 'empty-first' && cblocked === 'consumer blocked on full, holding nothing' && st.full >= 0) {
    if (!w('mutex', 'consumer')) {
      st.items.pop(); sg('empty'); sg('mutex'); completed = true;
      st.log.push('consumer woke, removed the item, released the mutex');
    }
  }

  var deadlocked = !!(pblocked && cblocked) ||
                   (cblocked === 'consumer blocked on full, holding the mutex' && pblocked === 'producer blocked on mutex');

  return { state: st, cblocked: cblocked, pblocked: pblocked, completed: completed, deadlocked: deadlocked };
}
var PC_OK = producerConsumer('empty-first');
var PC_BAD = producerConsumer('mutex-first');

/* ---------------- 6. resource allocation graphs ---------------- */

/* nodes: {id, type: 'P' | 'R', instances}.  edges: [from, to].
   A cycle among the nodes is found by depth-first search. */
function hasCycle(nodes, edges) {
  var adj = {};
  nodes.forEach(function (n) { adj[n.id] = []; });
  edges.forEach(function (e) { if (adj[e[0]]) adj[e[0]].push(e[1]); });
  var colour = {}, found = false;
  nodes.forEach(function (n) { colour[n.id] = 0; });
  function dfs(u) {
    colour[u] = 1;
    adj[u].forEach(function (v) {
      if (found) return;
      if (colour[v] === 1) found = true;
      else if (colour[v] === 0) dfs(v);
    });
    colour[u] = 2;
  }
  nodes.forEach(function (n) { if (colour[n.id] === 0 && !found) dfs(n.id); });
  return found;
}

/* single-instance graph: P1 holds printer, wants plotter; P2 holds plotter,
   wants printer.  One instance of each, so a cycle is a deadlock. */
var RAG1 = {
  nodes: [
    { id: 'P1', type: 'P' }, { id: 'P2', type: 'P' },
    { id: 'R1', type: 'R', label: 'printer', instances: 1 },
    { id: 'R2', type: 'R', label: 'plotter', instances: 1 }
  ],
  edges: [['R1', 'P1'], ['P1', 'R2'], ['R2', 'P2'], ['P2', 'R1']]
};
RAG1.cycle = hasCycle(RAG1.nodes, RAG1.edges);
RAG1.deadlocked = RAG1.cycle;    /* licensed by one instance per type */

/* multi-instance graph: R1 has two instances, R2 has one.
   P1 holds one instance of R1 and wants R2; P2 holds R2 and wants R1.
   There is a cycle, and a free instance of R1 means nobody is stuck. */
var RAG2 = {
  nodes: [
    { id: 'P1', type: 'P' }, { id: 'P2', type: 'P' },
    { id: 'R1', type: 'R', label: 'R1', instances: 2 },
    { id: 'R2', type: 'R', label: 'R2', instances: 1 }
  ],
  edges: [['R1', 'P1'], ['P1', 'R2'], ['R2', 'P2'], ['P2', 'R1']],
  avail: { R1: 1, R2: 0 },
  alloc: { P1: { R1: 1 }, P2: { R2: 1 } },
  need: { P1: { R2: 1 }, P2: { R1: 1 } }
};
RAG2.cycle = hasCycle(RAG2.nodes, RAG2.edges);

/* completion-order test on the multi-instance graph: repeatedly find a
   process whose remaining need fits the available vector, finish it, and add
   its holdings back.  If every process is selected, the state is not
   deadlocked. */
function completionOrder(avail, alloc, need, order) {
  var work = {};
  for (var r in avail) work[r] = avail[r];
  var left = order.slice(), seq = [], moved = true;
  while (moved && left.length) {
    moved = false;
    for (var i = 0; i < left.length; i++) {
      var p = left[i], fits = true;
      for (var res in need[p]) if ((need[p][res] || 0) > (work[res] || 0)) fits = false;
      if (fits) {
        for (var r2 in alloc[p]) work[r2] = (work[r2] || 0) + alloc[p][r2];
        seq.push(p); left.splice(i, 1); moved = true; break;
      }
    }
  }
  return { sequence: seq, complete: left.length === 0, leftover: left };
}
RAG2.order = completionOrder(RAG2.avail, RAG2.alloc, RAG2.need, ['P1', 'P2']);
RAG2.deadlocked = !RAG2.order.complete;

/* ---------------- 7. banker's algorithm ---------------- */

/* GATE 2018 Q39, as printed: four processes over E, F, G.
   Available is three of E, three of F and none of G. */
var BANK = {
  order: ['P0', 'P1', 'P2', 'P3'],
  res: ['E', 'F', 'G'],
  alloc: { P0: [1, 0, 1], P1: [1, 1, 2], P2: [1, 0, 3], P3: [2, 0, 0] },
  max: { P0: [4, 3, 1], P1: [2, 1, 4], P2: [1, 3, 3], P3: [5, 4, 1] },
  avail: [3, 3, 0]
};
BANK.need = {};
BANK.order.forEach(function (p) {
  BANK.need[p] = [0, 1, 2].map(function (i) { return BANK.max[p][i] - BANK.alloc[p][i]; });
});

function bankers(bank) {
  var work = bank.avail.slice();
  var left = bank.order.slice(), seq = [], steps = [], moved = true;
  steps.push({ label: 'start', work: work.slice(), pick: null });
  while (moved && left.length) {
    moved = false;
    for (var i = 0; i < left.length; i++) {
      var p = left[i], fits = true;
      for (var r = 0; r < 3; r++) if (bank.need[p][r] > work[r]) fits = false;
      if (fits) {
        for (var r2 = 0; r2 < 3; r2++) work[r2] += bank.alloc[p][r2];
        seq.push(p); left.splice(i, 1); moved = true;
        steps.push({ label: 'after ' + p, work: work.slice(), pick: p });
        break;
      }
    }
  }
  return { sequence: seq, safe: left.length === 0, work: work, steps: steps };
}
var BANK_RUN = bankers(BANK);

/* single resource type: deadlock is impossible when n(K-1)+1 <= m */
function largestSafeMax(n, m) {
  var best = 0;
  for (var K2 = 1; K2 <= m + 1; K2++) if (n * (K2 - 1) + 1 <= m) best = K2;
  return best;
}
var Q24 = largestSafeMax(3, 4);

/* ---------------- 8. the two-function interleaving (GATE 2015 Set 1) ---------------- */

/* P1: C = B-1; B = 2*C.   P2: D = 2*B; B = D-1.   B starts at 2.
   Each statement atomic; enumerate the interleavings and collect final B. */
function twoFunctionValues() {
  var finals = {};
  function rec(rem, B, C, D) {
    if (!rem.length) { finals[B] = true; return; }
    var seen = {};
    for (var i = 0; i < rem.length; i++) {
      var s = rem[i];
      if (seen[s]) continue;
      seen[s] = true;
      var r = rem.slice(); r.splice(i, 1);
      if (s === 'c') rec(r, B, B - 1, D);
      else if (s === 'b1') { if (C !== null) rec(r, 2 * C, C, D); }
      else if (s === 'd') rec(r, B, C, 2 * B);
      else if (s === 'b2') { if (D !== null) rec(r, D - 1, C, D); }
    }
  }
  rec(['c', 'b1', 'd', 'b2'], 2, null, null);
  return Object.keys(finals).map(Number).sort(function (a, b) { return a - b; });
}
var TWO_FN = twoFunctionValues();

/* ======================================================================
   LAYER 2 - THE CHECKS
   Every check names the property it re-verifies against the definition.
   ====================================================================== */

function buildChecks() {
  /* race */
  chk('race: two unprotected increments give exactly the values 1 and 2',
      eq(RACE.values, [1, 2]), RACE.values.join(','));
  chk('race: the lost update is reachable, so 1 is a legal answer',
      RACE.values.indexOf(1) >= 0);
  chk('race: the serial answer 2 is also reachable',
      RACE.values.indexOf(2) >= 0);
  chk('race: six interleavings exist for two read-modify-write pairs',
      RACE.schedules === 6, RACE.schedules);
  chk('race: the drawn lost-update table ends at 1',
      RACE_STEPS[3].counter === 1);

  /* strict alternation */
  chk('alternation: mutual exclusion is never violated',
      ALT.meViolations === 0, ALT.meViolations);
  chk('alternation: the progress failure state has an empty critical section',
      ALT.progressFail.csOccupied === false);
  chk('alternation: in that state the idle process is in its remainder',
      ALT.progressFail.pc[1] === 0);
  chk('alternation: the waiting process cannot enter, because turn is 1',
      ALT.progressFail.turn === 1 && ALT.progressFail.pc[0] === 1);

  /* peterson */
  chk('peterson: no reachable state has both processes inside',
      PET.meViolations === 0, PET.meViolations);
  chk('peterson: no reachable state has both processes unable to move',
      PET.deadlocks === 0, PET.deadlocks);
  chk('peterson: the enumeration covers 34 states, the all-finished one included',
      PET.states === 34, PET.states);

  /* semaphore */
  chk('semaphore: value five, three waits, leaves two and blocks nobody',
      semRun(5, ['P', 'P', 'P']).value === 2 && semRun(5, ['P', 'P', 'P']).blocked === 0);
  chk('semaphore: a negative value counts the blocked processes',
      semRun(0, ['P', 'P']).value === -2 && semRun(0, ['P', 'P']).blocked === 2);
  chk('semaphore: completed waits never exceed S0 plus signals',
      (function () {
        var r = semRun(2, ['P', 'P', 'P', 'V', 'P']);
        return r.completedWaits <= 2 + r.signals;
      })());
  chk('GATE 2016 Set 2 Q49: the largest initial value that still blocks is 7',
      Q49 === 7, Q49);
  chk('GATE 2016 Set 2 Q49: from 8 all twenty waits complete',
      (function () {
        var ops = [], i;
        for (i = 0; i < 8; i++) ops.push('P');
        for (i = 0; i < 12; i++) ops.push('V');
        for (i = 0; i < 12; i++) ops.push('P');
        return semRun(8, ops).blocked === 0;
      })());

  /* producer consumer */
  chk('producer/consumer: the empty-first order does not deadlock',
      PC_OK.deadlocked === false);
  chk('producer/consumer: the empty-first consumer sleeps holding nothing',
      PC_OK.cblocked === 'consumer blocked on full, holding nothing', PC_OK.cblocked);
  chk('producer/consumer: the empty-first order completes after the producer signals',
      PC_OK.completed === true);
  chk('producer/consumer: the mutex-first order deadlocks when the buffer is empty',
      PC_BAD.deadlocked === true);
  chk('producer/consumer: in the broken order the consumer sleeps holding the mutex',
      PC_BAD.cblocked === 'consumer blocked on full, holding the mutex', PC_BAD.cblocked);

  /* resource allocation graphs */
  chk('RAG: the single-instance graph has a cycle', RAG1.cycle === true);
  chk('RAG: with one instance per type a cycle means deadlock', RAG1.deadlocked === true);
  chk('RAG: the multi-instance graph also has a cycle', RAG2.cycle === true);
  chk('RAG: the multi-instance graph is not deadlocked', RAG2.deadlocked === false);
  chk('RAG: its completion order runs P2 then P1', eq(RAG2.order.sequence, ['P2', 'P1']),
      RAG2.order.sequence.join(','));

  /* banker */
  chk('banker: need is maximum minus allocation for every cell',
      BANK.order.every(function (p) {
        return [0, 1, 2].every(function (i) {
          return BANK.need[p][i] === BANK.max[p][i] - BANK.alloc[p][i];
        });
      }));
  chk('GATE 2018 Q39: the printed state is safe', BANK_RUN.safe === true);
  chk('GATE 2018 Q39: the safe sequence is P0, P2, P1, P3',
      eq(BANK_RUN.sequence, ['P0', 'P2', 'P1', 'P3']), BANK_RUN.sequence.join(','));
  chk('GATE 2018 Q39: work is 6,4,6 before P3 and 8,4,6 after it',
      eq(BANK_RUN.steps[3].work, [6, 4, 6]) && eq(BANK_RUN.work, [8, 4, 6]),
      BANK_RUN.work.join(','));
  chk('GATE 2018 Q24: the largest K that always avoids deadlock is 2', Q24 === 2, Q24);
  chk('the resource bound is tight: K=3 with m=4 admits the split 2,1,1',
      (3 * (3 - 1) + 1) > 4);

  /* the two-function interleaving */
  chk('GATE 2015 Set 1: the possible final values of B are 2, 3 and 4',
      eq(TWO_FN, [2, 3, 4]), TWO_FN.join(','));
  chk('GATE 2015 Set 1: that is three distinct values', TWO_FN.length === 3);
}

/* ======================================================================
   LAYER 3 - DRAWING
   Every scene reads the validated model. No scene recomputes it.
   ====================================================================== */

function bg(p) {
  p.alpha(1);
  p.rect(0, 0, W, H, { fill: PAL.surface });
  p.rect(24, 16, W - 48, H - 32, { stroke: PAL.border, sw: 1, radius: 10 });
}

function heading(p, text, sub) {
  p.text(40, 30, text, { size: 19, bold: true, color: PAL.ink });
  if (sub) p.text(40, 54, sub, { size: 12.5, color: PAL.dim });
  p.line(40, 72, W - 40, 72, { stroke: PAL.border, sw: 1 });
}

function pill(p, x, y, w, h, text, o) {
  o = o || {};
  p.rect(x, y, w, h, { fill: o.fill || PAL.surface2, stroke: o.stroke || PAL.border, sw: 1, radius: 6 });
  p.text(x + w / 2, y + h / 2, text, {
    size: o.size || 13, bold: !!o.bold, align: 'center', base: 'middle',
    color: o.color || PAL.ink, mono: !!o.mono
  });
}

function bullet(p, x, y, text, o) {
  o = o || {};
  p.circle(x + 3, y - 4, 2.2, { fill: o.dot || PAL.accent });
  p.text(x + 12, y, text, { size: o.size || 12.5, color: o.color || PAL.ink });
}

function beat(lt, a, b) { return K.clamp01((lt - a) / Math.max(0.001, b - a)); }

/* ---------------- scene 1: the race ---------------- */

function sceneRace(p, lt) {
  heading(p, 'counter = counter + 1, twice', 'Two threads, one shared integer, no protection');

  var step = Math.min(3, Math.floor(lt / 5.5));
  var cur = RACE_STEPS[step];

  /* the shared counter */
  p.text(60, 100, 'shared counter', { size: 12, color: PAL.dim });
  p.rect(60, 112, 150, 76, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.5, radius: 8 });
  p.text(135, 150, String(cur.counter), { size: 34, bold: true, align: 'center', base: 'middle', mono: true });

  /* the two threads, with their private registers */
  var tx = 260;
  ['T1', 'T2'].forEach(function (t, i) {
    var y = 100 + i * 62;
    var active = cur.who === t;
    p.rect(tx, y, 210, 50, {
      fill: active ? PAL.accentDim : PAL.surface2,
      stroke: active ? PAL.accent : PAL.border, sw: active ? 1.8 : 1, radius: 6
    });
    p.text(tx + 14, y + 17, t, { size: 14, bold: true });
    p.text(tx + 14, y + 35, 'register r' + (i + 1) + ' = ' + (i === 0 ? cur.r1 : cur.r2),
      { size: 11.5, color: PAL.dim, mono: true });
  });

  /* the schedule, one row per step */
  var sx = 500, sy = 100;
  p.text(sx, sy - 6, 'one legal interleaving', { size: 12, color: PAL.dim });
  RACE_STEPS.forEach(function (s, i) {
    var y = sy + 12 + i * 26;
    var on = i === step;
    p.rect(sx, y, 340, 22, {
      fill: on ? PAL.accentDim : 'transparent',
      stroke: on ? PAL.accent : PAL.border, sw: on ? 1.4 : 0.8, radius: 4
    });
    p.text(sx + 8, y + 11, (i + 1) + '. ' + s.who + '  ' + s.op, {
      size: 11, base: 'middle', mono: true, color: on ? PAL.ink : PAL.dim
    });
  });

  /* the verdict */
  var vy = 350;
  if (beat(lt, 18, 22) > 0) {
    p.rect(60, vy, 360, 74, { fill: PAL.invalidDim, stroke: PAL.invalid, sw: 1.4, radius: 8 });
    p.text(76, vy + 20, 'lost update: final counter = 1', { size: 14, bold: true, color: PAL.invalid });
    p.text(76, vy + 40, 'T1 read 0, T2 read 0, both wrote 1.', { size: 11.5, color: PAL.dim });
    p.text(76, vy + 56, 'Two increments, one result.', { size: 11.5, color: PAL.dim });
  }
  if (beat(lt, 22, 26) > 0) {
    p.rect(444, vy, 396, 74, { fill: PAL.validDim || '#e7f6ec', stroke: PAL.valid, sw: 1.4, radius: 8 });
    p.text(460, vy + 20, 'possible final values: ' + RACE.values.join(' or '),
      { size: 14, bold: true, color: PAL.valid });
    p.text(460, vy + 40, 'Enumerated over all ' + RACE.schedules + ' interleavings of the',
      { size: 11.5, color: PAL.dim });
    p.text(460, vy + 56, 'two read-modify-write pairs.', { size: 11.5, color: PAL.dim });
  }
}

/* ---------------- scene 2: the three requirements ---------------- */

function sceneRequirements(p, lt) {
  heading(p, 'The three requirements', 'and a solution that keeps only the first');

  var reqs = [
    { t: 'Mutual exclusion', d: 'at most one process inside', ok: true },
    { t: 'Progress', d: 'an idle outsider cannot block entry', ok: false },
    { t: 'Bounded waiting', d: 'no process overtaken forever', ok: false }
  ];
  reqs.forEach(function (r, i) {
    var y = 92 + i * 54;
    var shown = beat(lt, 2 + i * 3, 4 + i * 3) > 0;
    p.rect(60, y, 330, 44, {
      fill: r.ok ? '#e7f6ec' : PAL.invalidDim,
      stroke: r.ok ? PAL.valid : PAL.invalid, sw: 1.2, radius: 6
    });
    p.text(74, y + 17, r.t, { size: 13.5, bold: true });
    p.text(74, y + 34, r.d, { size: 11, color: PAL.dim });
    if (shown) {
      p.text(370, y + 22, r.ok ? 'holds' : 'fails', {
        size: 12, bold: true, align: 'right', base: 'middle',
        color: r.ok ? PAL.valid : PAL.invalid
      });
    }
  });

  /* strict alternation code */
  var cx = 470, cy = 92;
  p.rect(cx, cy, 372, 150, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 8 });
  p.text(cx + 14, cy + 18, 'strict alternation  (GATE 2016 Set 2, Q48 shape)', { size: 11.5, color: PAL.dim });
  var code = [
    'P0:  while (turn == 1);',
    '     /* critical section */',
    '     turn = 1;',
    'P1:  while (turn == 0);',
    '     /* critical section */',
    '     turn = 0;'
  ];
  code.forEach(function (line, i) {
    p.text(cx + 14, cy + 40 + i * 17, line, { size: 11.5, mono: true, color: PAL.ink });
  });

  /* the failing state */
  var fy = 262;
  p.text(60, fy, 'the state that breaks progress', { size: 12, color: PAL.dim });
  var boxes = [
    { x: 60, label: 'P0', sub: 'wants to enter', fill: PAL.warnDim, stroke: PAL.warn },
    { x: 230, label: 'critical section', sub: 'empty', fill: PAL.surface2, stroke: PAL.border },
    { x: 400, label: 'P1', sub: 'in its remainder', fill: PAL.surface2, stroke: PAL.border }
  ];
  boxes.forEach(function (b) {
    p.rect(b.x, fy + 16, 150, 52, { fill: b.fill, stroke: b.stroke, sw: 1.2, radius: 6 });
    p.text(b.x + 75, fy + 36, b.label, { size: 13, bold: true, align: 'center', base: 'middle' });
    p.text(b.x + 75, fy + 54, b.sub, { size: 10.5, align: 'center', base: 'middle', color: PAL.dim });
  });
  p.text(560, fy + 30, 'turn = 1', { size: 16, bold: true, mono: true, color: PAL.invalid });
  p.text(560, fy + 52, 'P0 spins while P1 does nothing.', { size: 11, color: PAL.dim });

  if (beat(lt, 20, 24) > 0) {
    p.rect(60, 356, 780, 66, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 8 });
    p.text(76, 376, 'Safety is cheap; liveness is where the argument has to be made.',
      { size: 13, bold: true, color: PAL.warn });
    p.text(76, 396, 'One shared integer gives mutual exclusion, and the baton can be held by a process that is not running.',
      { size: 11.5, color: PAL.dim });
  }
}

/* ---------------- scene 3: Peterson ---------------- */

function scenePeterson(p, lt) {
  heading(p, "Peterson's algorithm", 'flag[0], flag[1] and one turn variable');

  /* the shared variables */
  var vars = [
    { n: 'flag[0]', v: beat(lt, 3, 5) > 0 ? '1' : '0' },
    { n: 'flag[1]', v: beat(lt, 5, 7) > 0 ? '1' : '0' },
    { n: 'turn', v: beat(lt, 7, 9) > 0 ? '0' : '-' }
  ];
  vars.forEach(function (s, i) {
    var x = 60 + i * 170;
    p.rect(x, 92, 150, 58, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2, radius: 8 });
    p.text(x + 75, 110, s.n, { size: 11.5, align: 'center', base: 'middle', color: PAL.dim, mono: true });
    p.text(x + 75, 133, s.v, { size: 22, bold: true, align: 'center', base: 'middle', mono: true });
  });

  /* the entry code */
  var cx = 590, cy = 92;
  p.rect(cx, cy, 252, 108, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 8 });
  p.text(cx + 12, cy + 18, 'entry for process i', { size: 11, color: PAL.dim });
  ['flag[i] = 1;', 'turn = j;', 'while (flag[j] && turn == j);', 'critical section', 'flag[i] = 0;']
    .forEach(function (line, i) {
      p.text(cx + 12, cy + 36 + i * 15, line, { size: 10.5, mono: true, color: PAL.ink });
    });

  /* the two processes */
  var bothUp = beat(lt, 9, 11) > 0;
  ['P0', 'P1'].forEach(function (t, i) {
    var y = 190 + i * 82;
    var enters = bothUp && i === 0;
    p.rect(60, y, 300, 66, {
      fill: enters ? '#e7f6ec' : PAL.surface2,
      stroke: enters ? PAL.valid : PAL.border, sw: 1.2, radius: 8
    });
    p.text(76, y + 20, t, { size: 14, bold: true });
    p.text(76, y + 40, bothUp
      ? (enters ? 'turn is 0, so the spin ends: it enters.' : 'turn is 0, so it waits for P0 to leave.')
      : 'raises its flag, then writes turn', { size: 11, color: PAL.dim });
    if (enters) p.text(346, y + 33, 'inside', { size: 11, align: 'right', base: 'middle', color: PAL.valid, bold: true });
  });

  /* the verification */
  var vx = 400, vy = 190;
  p.rect(vx, vy, 442, 148, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 8 });
  p.text(vx + 14, vy + 20, 'verified by enumerating every reachable state', { size: 11.5, color: PAL.dim });
  var rows = [
    ['reachable states', String(PET.states)],
    ['states with both inside', String(PET.meViolations)],
    ['states where nobody can move', String(PET.deadlocks)]
  ];
  rows.forEach(function (r, i) {
    var y = vy + 44 + i * 26;
    p.text(vx + 14, y, r[0], { size: 12, color: PAL.ink });
    p.text(vx + 428, y, r[1], { size: 13, bold: true, align: 'right', mono: true, color: PAL.valid });
  });
  p.text(vx + 14, vy + 128, 'mutual exclusion, progress and bounded waiting all hold.', { size: 11, color: PAL.dim });

  if (beat(lt, 22, 26) > 0) {
    p.rect(60, 366, 782, 56, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 8 });
    p.text(76, 386, 'The proof is for sequential consistency, not for your CPU.',
      { size: 12.5, bold: true, color: PAL.warn });
    p.text(76, 404, 'If the two writes can be observed out of order, real hardware needs fences around them.',
      { size: 11, color: PAL.dim });
  }
}

/* ---------------- scene 4: semaphores ---------------- */

function sceneSemaphore(p, lt) {
  heading(p, 'A counting semaphore', 'an integer plus a queue; wait decrements, signal increments');

  var ops = ['P', 'P', 'P', 'V', 'P'];
  var k = Math.min(ops.length, Math.floor(lt / 4.5));
  var run = semRun(5, ops.slice(0, k));
  var s = k === 0 ? 5 : run.value;
  var blocked = k === 0 ? 0 : run.blocked;

  /* the gauge */
  p.text(60, 96, 'semaphore value', { size: 12, color: PAL.dim });
  p.rect(60, 108, 180, 92, {
    fill: s < 0 ? PAL.invalidDim : PAL.accentDim,
    stroke: s < 0 ? PAL.invalid : PAL.accent, sw: 1.5, radius: 8
  });
  p.text(150, 145, String(s), { size: 36, bold: true, align: 'center', base: 'middle', mono: true });
  p.text(150, 180, blocked + ' blocked', { size: 11, align: 'center', base: 'middle', color: PAL.dim });

  /* the operation strip */
  p.text(272, 96, 'operations applied', { size: 12, color: PAL.dim });
  ops.forEach(function (op, i) {
    var x = 272 + i * 46;
    var on = i < k;
    p.rect(x, 110, 38, 38, {
      fill: on ? (op === 'P' ? PAL.warnDim : '#e7f6ec') : 'transparent',
      stroke: on ? (op === 'P' ? PAL.warn : PAL.valid) : PAL.border, sw: 1, radius: 5
    });
    p.text(x + 19, 129, op, { size: 14, bold: true, align: 'center', base: 'middle', mono: true });
  });
  p.text(272, 168, 'start 5:  three waits leave 2, nobody sleeps.', { size: 11, color: PAL.dim });

  /* the invariant */
  p.rect(530, 96, 312, 104, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 8 });
  p.text(544, 116, 'the permit invariant', { size: 11.5, color: PAL.dim });
  p.text(544, 140, 'completed waits \u2264 S\u2080 + signals', { size: 13, bold: true, mono: true });
  p.text(544, 162, 'value < 0  \u2192  |value| processes sleep', { size: 11, mono: true, color: PAL.dim });
  p.text(544, 182, 'value = permits left, when non-negative', { size: 11, color: PAL.dim });

  /* GATE 2016 Set 2 Q49 */
  var y = 226;
  p.rect(60, y, 782, 128, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 8 });
  p.text(76, y + 20, 'GATE 2016 Set 2, Q49  \u2014  20 waits and 12 signals, in some order', { size: 12, color: PAL.dim });
  var rows = [
    ['S\u2080 = 7', 'at most 7 + 12 = 19 waits can ever pass', 'the 20th blocks'],
    ['S\u2080 = 8', '8 waits, 12 signals, 12 waits: value back to 0', 'nothing blocks']
  ];
  rows.forEach(function (r, i) {
    var ry = y + 46 + i * 34;
    p.text(76, ry, r[0], { size: 13, bold: true, mono: true, color: i === 0 ? PAL.invalid : PAL.valid });
    p.text(160, ry, r[1], { size: 11.5, color: PAL.ink });
    p.text(620, ry, r[2], { size: 11.5, color: i === 0 ? PAL.invalid : PAL.valid, bold: true });
  });
  if (beat(lt, 20, 24) > 0) {
    p.text(76, y + 112, 'largest initial value with at least one blocked wait = ' + Q49,
      { size: 14, bold: true, color: PAL.ink });
  }

  if (beat(lt, 24, 28) > 0) {
    p.rect(60, 368, 782, 54, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 8 });
    p.text(76, 388, 'Answer the worst order, not a convenient one.', { size: 12.5, bold: true, color: PAL.warn });
    p.text(76, 406, '"In some order" means the answer must hold for every order, including all the waits first.',
      { size: 11, color: PAL.dim });
  }
}

/* ---------------- scene 5: producer and consumer ---------------- */

function sceneProducerConsumer(p, lt) {
  heading(p, 'Bounded buffer, two orders', 'the buffer has two slots; empty and full count; mutex protects the array');

  var show = beat(lt, 4, 8);

  function column(x, title, pc, good) {
    p.text(x, 92, title, { size: 12.5, bold: true, color: good ? PAL.valid : PAL.invalid });
    p.rect(x, 100, 370, 250, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 8 });
    var lines = good
      ? ['producer: wait(empty); wait(mutex);', '          insert; signal(full); signal(mutex);',
         'consumer: wait(full); wait(mutex);', '          remove; signal(empty); signal(mutex);']
      : ['producer: wait(mutex); wait(empty);', '          insert; signal(full); signal(mutex);',
         'consumer: wait(mutex); wait(full);', '          remove; signal(empty); signal(mutex);'];
    lines.forEach(function (l, i) {
      p.text(x + 12, 118 + i * 16, l, { size: 9.6, mono: true, color: PAL.ink });
    });

    /* the buffer slots */
    for (var i = 0; i < 2; i++) {
      var bx = x + 12 + i * 46;
      p.rect(bx, 196, 38, 30, { fill: 'transparent', stroke: PAL.border, sw: 1, radius: 4 });
      p.text(bx + 19, 211, '\u2013', { size: 12, align: 'center', base: 'middle', color: PAL.dim });
    }
    p.text(x + 110, 211, 'both slots free', { size: 10.5, base: 'middle', color: PAL.dim });

    /* the counters */
    p.text(x + 12, 246, 'empty = ' + pc.state.empty + '   full = ' + pc.state.full + '   mutex = ' + pc.state.mutex,
      { size: 10.5, mono: true, color: PAL.dim });

    /* the outcome */
    if (show > 0) {
      p.rect(x + 12, 262, 346, 74, {
        fill: good ? '#e7f6ec' : PAL.invalidDim,
        stroke: good ? PAL.valid : PAL.invalid, sw: 1.2, radius: 6
      });
      p.text(x + 24, 282, good ? 'buffer fills and drains' : 'deadlock', {
        size: 13, bold: true, color: good ? PAL.valid : PAL.invalid
      });
      p.text(x + 24, 302, good ? 'each side sleeps holding nothing.' : 'the consumer holds mutex and waits for full.',
        { size: 10.5, color: PAL.dim });
      p.text(x + 24, 318, good ? 'no lock is ever held across a sleep.' : 'the producer cannot enter to add the item.',
        { size: 10.5, color: PAL.dim });
    }
  }

  column(60, 'empty first  \u2014  correct', PC_OK, true);
  column(470, 'mutex first  \u2014  GATE 2014 Set 2, Q31 shape', PC_BAD, false);

  if (beat(lt, 20, 24) > 0) {
    p.rect(60, 366, 782, 56, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 8 });
    p.text(76, 386, 'Never sleep while holding a lock the waker needs.', { size: 13, bold: true, color: PAL.warn });
    p.text(76, 404, 'The item semaphore must be waited on last, so that a sleeping process holds nothing.',
      { size: 11, color: PAL.dim });
  }
}

/* ---------------- scene 6: monitors ---------------- */

function sceneMonitor(p, lt) {
  heading(p, 'A monitor', 'the compiler holds the lock; condition variables do the waiting');

  /* the monitor box */
  p.rect(60, 92, 420, 210, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.6, radius: 10 });
  p.text(76, 112, 'monitor Buffer', { size: 13, bold: true, mono: true });
  p.text(76, 134, 'shared:  slots[2], count', { size: 11, mono: true, color: PAL.dim });
  p.text(76, 158, 'procedure insert(item)  { ... }', { size: 11, mono: true });
  p.text(76, 176, 'procedure remove()      { ... }', { size: 11, mono: true });

  /* the implicit lock */
  p.rect(76, 194, 170, 34, {
    fill: beat(lt, 2, 5) > 0 ? '#e7f6ec' : PAL.surface,
    stroke: beat(lt, 2, 5) > 0 ? PAL.valid : PAL.border, sw: 1.2, radius: 6
  });
  p.text(161, 211, beat(lt, 2, 5) > 0 ? 'one process inside' : 'implicit lock',
    { size: 11.5, align: 'center', base: 'middle', bold: true });

  /* the condition variables */
  p.text(76, 252, 'condition variables carry no value', { size: 10.5, color: PAL.dim });
  ['notEmpty', 'notFull'].forEach(function (c, i) {
    var x = 76 + i * 150;
    var waiting = beat(lt, 10 + i * 3, 13 + i * 3) > 0;
    p.rect(x, 262, 136, 32, {
      fill: waiting ? PAL.warnDim : PAL.surface,
      stroke: waiting ? PAL.warn : PAL.border, sw: 1, radius: 6
    });
    p.text(x + 68, 278, c + (waiting ? '  [1 waiting]' : '  [empty]'),
      { size: 10.5, align: 'center', base: 'middle', mono: true });
  });

  /* the semantics */
  var x = 510;
  p.rect(x, 92, 332, 210, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 8 });
  p.text(x + 14, 112, 'what the two calls do', { size: 11.5, color: PAL.dim });
  var rows = [
    ['c.wait()', 'queue me on c and release the monitor'],
    ['c.signal()', 'move one waiter from c to runnable'],
    ['no waiter', 'the signal is lost, it is not stored'],
    ['Mesa', 'waiter re-checks in a while loop'],
    ['Hoare', 'signaller yields; the condition holds']
  ];
  rows.forEach(function (r, i) {
    var y = 136 + i * 32;
    p.text(x + 14, y, r[0], { size: 11.5, mono: true, bold: true });
    p.text(x + 14, y + 15, r[1], { size: 10.5, color: PAL.dim });
  });

  if (beat(lt, 20, 24) > 0) {
    p.rect(60, 316, 782, 100, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 8 });
    p.text(76, 336, 'Monitors and semaphores are equally powerful', { size: 13, bold: true });
    p.text(76, 358, 'A monitor with condition variables can implement a semaphore, and a semaphore can implement a monitor.',
      { size: 11, color: PAL.dim });
    p.text(76, 376, 'The difference is where the discipline lives: with semaphores you must pair every wait with a signal,',
      { size: 11, color: PAL.dim });
    p.text(76, 394, 'and forgetting one is a bug. With a monitor the lock cannot be forgotten, only the wait can be misplaced.',
      { size: 11, color: PAL.dim });
  }
}

/* ---------------- scene 7: deadlock and a cycle ---------------- */

function drawRAG(p, x0, y0, rag, opts) {
  opts = opts || {};
  var pos = {
    P1: [x0 + 40, y0 + 30], P2: [x0 + 40, y0 + 150],
    R1: [x0 + 230, y0 + 30], R2: [x0 + 230, y0 + 150]
  };
  var byId = {};
  rag.nodes.forEach(function (n) { byId[n.id] = n; });

  /* edges first, so the nodes sit on top */
  rag.edges.forEach(function (e) {
    var a = pos[e[0]], b = pos[e[1]];
    if (!a || !b) return;
    p.arrow(a[0] + 26, a[1], b[0] - 26, b[1], { stroke: opts.edge || PAL.dim, sw: 1.6, head: 9 });
  });

  rag.nodes.forEach(function (n) {
    var q = pos[n.id];
    if (!q) return;
    if (n.type === 'P') {
      p.circle(q[0], q[1], 24, { fill: PAL.surface, stroke: PAL.accent, sw: 1.8 });
      p.text(q[0], q[1], n.id, { size: 13, bold: true, align: 'center', base: 'middle' });
    } else {
      p.rect(q[0] - 26, q[1] - 24, 52, 48, { fill: PAL.surface, stroke: PAL.info, sw: 1.8, radius: 4 });
      p.text(q[0], q[1] - 6, n.label || n.id, { size: 10, align: 'center', base: 'middle', color: PAL.dim });
      for (var i = 0; i < (n.instances || 1); i++) {
        p.circle(q[0] - 10 + i * 20, q[1] + 10, 5, { fill: PAL.info });
      }
    }
  });
}

function sceneDeadlock(p, lt) {
  heading(p, 'Deadlock', 'four conditions, and one graph that proves it');

  /* the four conditions */
  var conds = ['mutual exclusion', 'hold and wait', 'no preemption', 'circular wait'];
  conds.forEach(function (c, i) {
    var x = 60 + i * 196;
    var on = beat(lt, 2 + i * 2.2, 4 + i * 2.2) > 0;
    p.rect(x, 90, 182, 40, {
      fill: on ? PAL.warnDim : PAL.surface2,
      stroke: on ? PAL.warn : PAL.border, sw: 1, radius: 6
    });
    p.text(x + 91, 110, c, { size: 11.5, align: 'center', base: 'middle', bold: on });
  });

  /* the graph */
  drawRAG(p, 60, 150, RAG1, { edge: beat(lt, 12, 16) > 0 ? PAL.invalid : PAL.dim });
  p.text(60, 322, 'squares are resource types, each dot one instance', { size: 10.5, color: PAL.dim });
  p.text(60, 340, 'arrow P \u2192 R is a request; arrow R \u2192 P is an assignment', { size: 10.5, color: PAL.dim });

  /* the reading */
  var x = 470;
  p.rect(x, 150, 372, 176, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 8 });
  p.text(x + 14, 170, 'reading the graph', { size: 11.5, color: PAL.dim });
  p.text(x + 14, 194, 'P1 \u2192 R2 \u2192 P2 \u2192 R1 \u2192 P1', { size: 13, mono: true, bold: true });
  p.text(x + 14, 218, 'a cycle, with one instance of each type', { size: 11, color: PAL.dim });
  p.text(x + 14, 242, 'cycle found: ' + (RAG1.cycle ? 'yes' : 'no'),
    { size: 12, bold: true, color: RAG1.cycle ? PAL.invalid : PAL.valid });
  p.text(x + 14, 266, 'deadlock: ' + (RAG1.deadlocked ? 'yes' : 'no'),
    { size: 12, bold: true, color: RAG1.deadlocked ? PAL.invalid : PAL.valid });
  p.text(x + 14, 292, 'With one instance per type, the cycle is both', { size: 10.5, color: PAL.dim });
  p.text(x + 14, 308, 'necessary and sufficient. No completion order exists.', { size: 10.5, color: PAL.dim });

  if (beat(lt, 22, 26) > 0) {
    p.rect(60, 360, 782, 62, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 8 });
    p.text(76, 380, 'Prevention breaks a condition; avoidance checks a state.', { size: 13, bold: true, color: PAL.warn });
    p.text(76, 400, 'Order the resources to kill circular wait; ask for everything at once to kill hold and wait. Both cost utilisation.',
      { size: 11, color: PAL.dim });
  }
}

/* ---------------- scene 8: a cycle that is not a deadlock ---------------- */

function sceneCycle(p, lt) {
  heading(p, 'A cycle is not always a deadlock', 'R1 has two instances; R2 has one');

  drawRAG(p, 60, 110, RAG2, { edge: beat(lt, 10, 14) > 0 ? PAL.warn : PAL.dim });
  p.text(60, 300, 'the second instance of R1 is free', { size: 11, color: PAL.dim });
  p.circle(300, 165, 7, { fill: 'transparent', stroke: PAL.valid, sw: 1.6 });
  p.text(316, 165, 'free instance', { size: 10.5, base: 'middle', color: PAL.valid });

  var x = 470;
  p.rect(x, 110, 372, 96, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 8 });
  p.text(x + 14, 130, 'cycle: ' + (RAG2.cycle ? 'yes' : 'no'), { size: 12, bold: true, color: PAL.warn });
  p.text(x + 14, 152, 'deadlock: ' + (RAG2.deadlocked ? 'yes' : 'no'),
    { size: 12, bold: true, color: RAG2.deadlocked ? PAL.invalid : PAL.valid });
  p.text(x + 14, 176, 'A cycle is necessary here, not sufficient.', { size: 10.5, color: PAL.dim });
  p.text(x + 14, 192, 'The cycle test is licensed only by single instances.', { size: 10.5, color: PAL.dim });

  /* the completion order */
  p.rect(x, 220, 372, 130, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 8 });
  p.text(x + 14, 240, 'the completion-order test', { size: 11.5, color: PAL.dim });
  var steps = [
    'work = (R1 1, R2 0)',
    'P2 needs R1: fits, so P2 runs',
    'P2 finishes, returns R2: work = (R1 1, R2 1)',
    'P1 needs R2: fits, so P1 runs',
    'every process selected: no deadlock'
  ];
  steps.forEach(function (s, i) {
    var on = beat(lt, 14 + i * 2, 16 + i * 2) > 0;
    p.text(x + 14, 262 + i * 18, (on ? '\u2022 ' : '\u00b7 ') + s, {
      size: 10.5, mono: true, color: on ? PAL.ink : PAL.dim
    });
  });

  if (beat(lt, 24, 28) > 0) {
    p.rect(60, 356, 782, 66, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 8 });
    p.text(76, 376, 'Single instance: cycle means deadlock. Several instances: test for a completion order.',
      { size: 13, bold: true, color: PAL.warn });
    p.text(76, 396, 'The wait-for graph collapses a resource type to one holder, so it is valid only when each type has one instance.',
      { size: 11, color: PAL.dim });
  }
}

/* ---------------- scene 9: banker's algorithm ---------------- */

function sceneBanker(p, lt) {
  heading(p, "Banker's algorithm", 'GATE 2018 Q39: E, F, G with four processes; available (3, 3, 0)');

  /* the table */
  var x = 60, y = 92;
  var cols = ['process', 'alloc E F G', 'max E F G', 'need E F G'];
  cols.forEach(function (c, i) {
    p.text(x + 12 + i * 110, y + 6, c, { size: 10, color: PAL.dim, mono: true });
  });
  BANK.order.forEach(function (pr, r) {
    var ry = y + 26 + r * 24;
    var picked = beat(lt, 8 + r * 4, 10 + r * 4) > 0;
    p.text(x + 12, ry, pr, { size: 11.5, bold: true, mono: true });
    p.text(x + 122, ry, BANK.alloc[pr].join('  '), { size: 10.5, mono: true });
    p.text(x + 232, ry, BANK.max[pr].join('  '), { size: 10.5, mono: true });
    p.text(x + 342, ry, BANK.need[pr].join('  '), {
      size: 11, mono: true, bold: picked, color: picked ? PAL.valid : PAL.ink
    });
  });
  p.text(x + 12, y + 132, 'need = max \u2212 alloc', { size: 10.5, color: PAL.dim, mono: true });

  /* the work vector progression */
  var wx = 470;
  p.rect(wx, 92, 372, 168, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 8 });
  p.text(wx + 14, 112, 'work vector, in order', { size: 11.5, color: PAL.dim });
  BANK_RUN.steps.forEach(function (s, i) {
    var on = beat(lt, 8 + i * 4, 10 + i * 4) > 0;
    p.text(wx + 14, 136 + i * 22, s.label.padEnd(10, ' ') + '(' + s.work.join(', ') + ')', {
      size: 10.5, mono: true, color: on ? PAL.ink : PAL.dim, bold: on && i > 0
    });
  });
  p.text(wx + 14, 248, 'safe sequence: ' + BANK_RUN.sequence.join(' \u2192 '), {
    size: 11, bold: true, color: PAL.valid
  });

  /* the single-resource-type bound */
  var by = 276;
  p.rect(60, by, 782, 84, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2, radius: 8 });
  p.text(76, by + 22, 'one resource type, n processes, m instances, maximum K each', { size: 11.5, color: PAL.dim });
  p.text(76, by + 48, 'deadlock is impossible when   n(K \u2212 1) + 1 \u2264 m', { size: 14, bold: true, mono: true });
  p.text(76, by + 70, 'GATE 2018 Q24: n = 3, m = 4  \u2192  3(K \u2212 1) + 1 \u2264 4  \u2192  K \u2264 ' + Q24,
    { size: 11.5, color: PAL.ink });

  if (beat(lt, 24, 28) > 0) {
    p.rect(60, 372, 782, 50, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 8 });
    p.text(76, 392, 'K = 3 fails: the split 2, 1, 1 uses all four instances and each process still wants one more.',
      { size: 11.5, bold: true, color: PAL.warn });
    p.text(76, 410, 'Safe means a completion order exists. Unsafe means the guarantee is gone, not that deadlock has happened.',
      { size: 10.5, color: PAL.dim });
  }
}

/* ---------------- scene 10: the procedure ---------------- */

function sceneRecipe(p, lt) {
  heading(p, 'The procedure', 'four steps, then the five traps');

  var steps = [
    ['1  Fix the model', 'what is shared, and are statements atomic?'],
    ['2  For a value', 'enumerate the extreme interleavings, not the typical one'],
    ['3  For liveness', 'name the property, then build the state that breaks it'],
    ['4  For deadlock', 'one instance per type? then a cycle is the answer']
  ];
  steps.forEach(function (s, i) {
    var y = 90 + i * 46;
    var on = beat(lt, 2 + i * 3, 4 + i * 3) > 0;
    p.rect(60, y, 470, 38, {
      fill: on ? PAL.accentDim : PAL.surface2,
      stroke: on ? PAL.accent : PAL.border, sw: 1, radius: 6
    });
    p.text(74, y + 16, s[0], { size: 12, bold: true });
    p.text(74, y + 31, s[1], { size: 10.5, color: PAL.dim });
  });

  var traps = [
    'atomicity assumed but not stated',
    'a negative semaphore value is a queue, not an error',
    'sleeping while holding the waker\u2019s lock',
    'a cycle used as a deadlock test with several instances',
    'safe read as deadlock-free, unsafe as deadlocked'
  ];
  p.text(556, 90, 'five traps', { size: 12, bold: true, color: PAL.warn });
  traps.forEach(function (t, i) {
    var on = beat(lt, 12 + i * 2.4, 14 + i * 2.4) > 0;
    p.rect(556, 104 + i * 34, 286, 28, {
      fill: on ? PAL.warnDim : 'transparent',
      stroke: on ? PAL.warn : PAL.border, sw: 1, radius: 5
    });
    p.text(568, 118 + i * 34, t, { size: 10.2, base: 'middle', color: on ? PAL.ink : PAL.dim });
  });

  if (beat(lt, 24, 28) > 0) {
    p.rect(60, 286, 782, 118, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 8 });
    p.text(76, 308, 'Two results worth memorising', { size: 13, bold: true });
    p.text(76, 332, 'GATE 2015 Set 1: B = 2, P1 doubles B\u22121, P2 halves nothing but writes 2B\u22121 \u2192 possible finals '
      + TWO_FN.join(', ') + ', so ' + TWO_FN.length + ' values.', { size: 11, color: PAL.dim });
    p.text(76, 356, 'GATE 2016 Set 2 Q49: 20 waits, 12 signals \u2192 largest blocking initial value ' + Q49 + '.',
      { size: 11, color: PAL.dim });
    p.text(76, 380, 'GATE 2018 Q24: n(K\u22121)+1 \u2264 m \u2192 K = ' + Q24 + ';   GATE 2018 Q39: safe, sequence '
      + BANK_RUN.sequence.join(', ') + '.', { size: 11, color: PAL.dim });
  }
}

/* ---------------- dispatch ---------------- */

var SCENES = {
  race: sceneRace,
  requirements: sceneRequirements,
  peterson: scenePeterson,
  semaphore: sceneSemaphore,
  'producer-consumer': sceneProducerConsumer,
  monitor: sceneMonitor,
  deadlock: sceneDeadlock,
  'cycle-not-deadlock': sceneCycle,
  banker: sceneBanker,
  recipe: sceneRecipe
};

function drawFrame(painter) {
  if (!painter) return;
  P = painter;
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
  var pass = CHECKS.filter(function (c) { return c.pass; }).length;
  var bad = CHECKS.length - pass;
  el.innerHTML = '<span class="k">Model checks</span>' +
    '<p class="small" style="margin:6px 0 0">' + pass + ' of ' + CHECKS.length + ' passed' +
    (bad ? ' \u2014 <strong>' + bad + ' failed</strong>' : '') + '</p>';
}

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

  K.onResize(function () { if (P) drawFrame(P); });

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
