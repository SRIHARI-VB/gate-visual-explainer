/* ==========================================================================
   monitors-and-condition-variables — lesson.js
   Four layers, in order:
     1. THE MODEL   — every number the lesson shows, computed here.
     2. THE CHECKS  — each computed value re-verified against a definition.
     3. RENDER      — reads the model; never re-derives it.
     4. BOOT        — p5.js first, the browser's own canvas as the fallback.

   The model is a small executable monitor, not a table typed by hand:
     (a) a statement-granularity simulator of a monitor under Mesa semantics,
         with an explicit monitor lock and explicit condition-variable queues;
     (b) an exhaustive breadth-first search over every interleaving of a few
         threads, so "the while loop is required" is a measured claim;
     (c) the same search run twice, once with signal and once with broadcast,
         so "broadcast is what makes this run finish" is measured too;
     (d) a semaphore-level simulator of the standard monitor construction, run
         against all four options of the 2006 question, so the answer to that
         question is a measurement rather than a reading.
   If any check failed, the page would say so under the canvas.
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

/* ----------------------------------------------------------------------
   1a. THE MONITOR SIMULATOR

   A monitor is modelled exactly as the definition says: one lock, some
   condition-variable queues, and a body of code that only the lock holder may
   execute.  A state is

     { pc[], flag[], done[], sleep[], count, avail, cap, lock, cv{} }

   where sleep[t] is null while t is runnable and the *wait condition* of t
   while t is asleep on a condition variable.  Only the lock holder may run;
   when the lock is free, any runnable thread may take it.  A thread woken from
   a condition variable becomes runnable but does NOT get the lock — that is
   Mesa semantics, and it is the whole reason the while loop is needed.
   ---------------------------------------------------------------------- */

var PREDS = {
  'full':     function (s) { return s.count >= s.cap; },
  'empty':    function (s) { return s.count <= 0; },
  'avail<16': function (s) { return s.avail < 16; },
  'avail<6':  function (s) { return s.avail < 6; }
};

function cloneState(s) {
  var cv = {};
  for (var k in s.cv) cv[k] = s.cv[k].slice();
  return {
    pc: s.pc.slice(), flag: s.flag.slice(), done: s.done.slice(),
    sleep: s.sleep.slice(), count: s.count, avail: s.avail, cap: s.cap,
    lock: s.lock, cv: cv
  };
}

function keyOf(s) {
  return s.pc.join(',') + '|' + s.flag.join('') + '|' + s.done.join('') + '|' +
         s.sleep.join(',') + '|' + s.count + '|' + s.avail + '|' + s.lock + '|' +
         Object.keys(s.cv).sort().map(function (k) { return k + ':' + s.cv[k].join('-'); }).join(';');
}

function runnable(s, t) {
  if (s.done[t]) return false;
  if (s.sleep[t] !== null) return false;
  return s.lock === -1 || s.lock === t;
}

function anyRunnable(s) {
  for (var t = 0; t < s.pc.length; t++) if (runnable(s, t)) return true;
  return false;
}

/* one step of thread t. Returns the successor state, or null if illegal. */
function stepOf(prog, names, s, t) {
  var st = cloneState(s);
  var ins = prog[t][st.pc[t]];
  if (!ins) return null;
  if (st.lock === -1) st.lock = t;            // the thread takes the free lock
  if (st.lock !== t) return null;             // only the holder may execute

  switch (ins.op) {
    case 'test':
      st.flag[t] = PREDS[ins.pred](st) ? 1 : 0;
      st.pc[t]++;
      return { s: st, label: names[t] + ': test ' + ins.pred + ' -> ' + (st.flag[t] ? 'true' : 'false') };

    case 'jf':
      st.pc[t] = st.flag[t] ? st.pc[t] + 1 : ins.to;
      return { s: st, label: null };

    case 'jmp':
      st.pc[t] = ins.to;
      return { s: st, label: null };

    case 'wait':
      st.sleep[t] = ins.cond;
      st.cv[ins.cv].push(t);
      st.lock = -1;                            // wait releases the monitor lock
      st.pc[t]++;
      return { s: st, label: names[t] + ': wait(' + ins.cv + ')  [lock released]' };

    case 'signal':
      if (st.cv[ins.cv].length) {
        var w1 = st.cv[ins.cv].shift();
        st.sleep[w1] = null;                   // runnable, but no lock yet
        st.pc[t]++;
        return { s: st, label: names[t] + ': signal(' + ins.cv + ') wakes ' + names[w1] };
      }
      st.pc[t]++;
      return { s: st, label: names[t] + ': signal(' + ins.cv + ') — nobody waiting, LOST' };

    case 'broadcast':
      var woke = [];
      while (st.cv[ins.cv].length) {
        var w2 = st.cv[ins.cv].shift();
        st.sleep[w2] = null;
        woke.push(names[w2]);
      }
      st.pc[t]++;
      return { s: st, label: names[t] + ': broadcast(' + ins.cv + ') wakes ' + (woke.length ? woke.join('+') : 'nobody') };

    case 'inc':
      st.count++;
      st.pc[t]++;
      return { s: st, label: names[t] + ': add one item  (count ' + (st.count - 1) + ' -> ' + st.count + ')' };

    case 'dec':
      st.count--;
      st.pc[t]++;
      return { s: st, label: names[t] + ': take one item (count ' + (st.count + 1) + ' -> ' + st.count + ')' };

    case 'give':
      st.avail += ins.amt;
      st.pc[t]++;
      return { s: st, label: names[t] + ': free ' + ins.amt + ' units  (avail ' + (st.avail - ins.amt) + ' -> ' + st.avail + ')' };

    case 'take':
      st.avail -= ins.amt;
      st.pc[t]++;
      return { s: st, label: names[t] + ': allocate ' + ins.amt + ' units (avail ' + (st.avail + ins.amt) + ' -> ' + st.avail + ')' };

    case 'exit':
      st.done[t] = true;
      st.lock = -1;
      st.pc[t]++;
      return { s: st, label: names[t] + ': leaves the monitor' };

    default:
      return null;
  }
}

/* A terminal state is one with no runnable thread.
   A STALL is a terminal state in which some thread is asleep although its own
   wait condition is false — it could proceed, and it does not.  Threads whose
   condition is still true are correctly asleep and are not counted. */
function isStall(s) {
  if (anyRunnable(s)) return false;
  for (var t = 0; t < s.pc.length; t++) {
    if (s.sleep[t] !== null && PREDS[s.sleep[t]](s) === false) return true;
  }
  return false;
}

function search(prog, names, init, opts) {
  opts = opts || {};
  var start = cloneState(init);
  var queue = [{ s: start, trace: [] }];
  var seen = {};
  seen[keyOf(start)] = true;
  var states = 0, terminal = 0, stalls = 0, violations = 0;
  var firstStall = null, firstViolation = null;

  while (queue.length) {
    var cur = queue.shift();
    states++;
    var moved = false;

    for (var t = 0; t < cur.s.pc.length; t++) {
      if (!runnable(cur.s, t)) continue;
      var r = stepOf(prog, names, cur.s, t);
      if (!r) continue;
      moved = true;
      var nk = keyOf(r.s);
      if (seen[nk]) continue;
      seen[nk] = true;
      var tr = cur.trace.slice();
      if (r.label) tr.push(r.label);

      if (opts.violation && opts.violation(r.s)) {
        violations++;
        if (!firstViolation) firstViolation = { trace: tr, state: r.s };
      }
      if (isStall(r.s)) {
        stalls++;
        if (!firstStall) firstStall = { trace: tr, state: r.s };
      }
      queue.push({ s: r.s, trace: tr });
    }
    if (!moved) terminal++;
  }
  return {
    states: states, terminal: terminal, stalls: stalls, violations: violations,
    firstStall: firstStall, firstViolation: firstViolation
  };
}

/* ----------------------------------------------------------------------
   1b. THE BOUNDED BUFFER: one producer, two consumers, one slot
   Written twice, once with `while` and once with `if`, and searched in full.
   ---------------------------------------------------------------------- */

function bufferProgram(guard) {
  var back = guard === 'while' ? 0 : 4;   // after a wake, re-test or go straight on
  var prod = [
    { op: 'test', pred: 'full' },          // 0
    { op: 'jf', to: 4 },                   // 1
    { op: 'wait', cv: 'notFull', cond: 'full' },   // 2
    { op: 'jmp', to: back },               // 3
    { op: 'inc' },                         // 4
    { op: 'signal', cv: 'notEmpty' },      // 5
    { op: 'exit' }                         // 6
  ];
  var cons = [
    { op: 'test', pred: 'empty' },
    { op: 'jf', to: 4 },
    { op: 'wait', cv: 'notEmpty', cond: 'empty' },
    { op: 'jmp', to: back },
    { op: 'dec' },
    { op: 'signal', cv: 'notFull' },
    { op: 'exit' }
  ];
  return [prod, cons, cons];
}

function bufferInit() {
  return {
    pc: [0, 0, 0], flag: [0, 0, 0], done: [false, false, false],
    sleep: [null, null, null], count: 0, avail: 0, cap: 1, lock: -1,
    cv: { notFull: [], notEmpty: [] }
  };
}

var BUF_NAMES = ['P', 'C1', 'C2'];
var BUF_WHILE = search(bufferProgram('while'), BUF_NAMES, bufferInit(),
                       { violation: function (s) { return s.count < 0; } });
var BUF_IF = search(bufferProgram('if'), BUF_NAMES, bufferInit(),
                    { violation: function (s) { return s.count < 0; } });

/* ----------------------------------------------------------------------
   1c. THE VARIABLE-SIZE ALLOCATOR: one condition variable, two needs
   This is the Mesa paper's own motivating example.  Free 10 units once.
   A thread needing 16 waits; a thread needing 6 waits.  One signal reaches
   one of them, and the wake is consumed.
   ---------------------------------------------------------------------- */

function allocProgram(wakeOp) {
  function waiter(need) {
    return [
      { op: 'test', pred: 'avail<' + need },             // 0
      { op: 'jf', to: 4 },                               // 1
      { op: 'wait', cv: 'cv', cond: 'avail<' + need },   // 2
      { op: 'jmp', to: 0 },                              // 3
      { op: 'take', amt: need },                         // 4
      { op: wakeOp, cv: 'cv' },                          // 5
      { op: 'exit' }                                     // 6
    ];
  }
  return [waiter(16), waiter(6), [
    { op: 'give', amt: 10 },                             // 0
    { op: wakeOp, cv: 'cv' },                            // 1
    { op: 'exit' }                                       // 2
  ]];
}

function allocInit() {
  return {
    pc: [0, 0, 0], flag: [0, 0, 0], done: [false, false, false],
    sleep: [null, null, null], count: 0, avail: 0, cap: 1, lock: -1,
    cv: { cv: [] }
  };
}

var ALLOC_NAMES = ['W16', 'W6', 'Free'];
var ALLOC_SIGNAL = search(allocProgram('signal'), ALLOC_NAMES, allocInit(), {});
var ALLOC_BCAST = search(allocProgram('broadcast'), ALLOC_NAMES, allocInit(), {});

/* ----------------------------------------------------------------------
   1d. THE MONITOR BUILT FROM SEMAPHORES
   The construction the 2006 question asks about, executed rather than read.
   Semaphores are simulated with values and wait queues; a woken thread is
   granted its P and resumes.
   ---------------------------------------------------------------------- */

function semScenario(E1, E2) {
  var sem = { mutex: 1, next: 0, x_sem: 0 };
  var q = { mutex: [], next: [], x_sem: [] };
  var grant = { mutex: 0, next: 0, x_sem: 0 };
  var V = { x_count: 0, next_count: 0 };

  var waiter = [
    { op: 'P', s: 'mutex' },        // 0  enter the monitor
    { op: 'inc', v: 'x_count' },    // 1  x.wait begins
    { op: 'jnz', v: 'next_count', to: 5 },   // 2
    { op: 'V', s: 'mutex' },        // 3
    { op: 'jmp', to: 6 },           // 4
    { op: 'V', s: 'next' },         // 5
    { op: 'X', s: E1 },             // 6  E1
    { op: 'dec', v: 'x_count' },    // 7
    { op: 'jnz', v: 'next_count', to: 11 },  // 8  leave the monitor
    { op: 'V', s: 'mutex' },        // 9
    { op: 'jmp', to: 12 },          // 10
    { op: 'V', s: 'next' },         // 11
    { op: 'end' }                   // 12
  ];

  var signaller = [
    { op: 'P', s: 'mutex' },        // 0  enter the monitor
    { op: 'jz', v: 'x_count', to: 7 },       // 1  if (x_count > 0) {
    { op: 'inc', v: 'next_count' }, // 2
    { op: 'X', s: E2 },             // 3  E2
    { op: 'P', s: 'next' },         // 4
    { op: 'dec', v: 'next_count' }, // 5
    { op: 'nop' },                  // 6  }
    { op: 'jnz', v: 'next_count', to: 10 },  // 7  leave the monitor
    { op: 'V', s: 'mutex' },        // 8
    { op: 'jmp', to: 11 },          // 9
    { op: 'V', s: 'next' },         // 10
    { op: 'end' }                   // 11
  ];

  var prog = { waiter: waiter, signaller: signaller };
  var pc = { waiter: 0, signaller: 0 };
  var blocked = { waiter: false, signaller: false };
  var done = { waiter: false, signaller: false };
  var ready = ['waiter', 'signaller'];
  var log = [];
  var steps = 0;
  var holdsLock = 0, maxHolds = 0;

  function semP(s) {
    if (grant[s] > 0) { grant[s]--; return true; }
    if (sem[s] > 0) { sem[s]--; return true; }
    q[s].push(current);
    blocked[current] = true;
    return false;
  }
  function semV(s) {
    if (q[s].length) {
      var t = q[s].shift();
      grant[s]++;
      blocked[t] = false;
      ready.push(t);
    } else {
      sem[s]++;
    }
  }

  var current = null;
  var guard = 0;
  while (ready.length && guard++ < 400) {
    current = ready.shift();
    if (blocked[current] || done[current]) continue;
    var ins = prog[current][pc[current]];
    if (!ins) { done[current] = true; continue; }
    steps++;
    switch (ins.op) {
      case 'P':
        if (semP(ins.s)) pc[current]++;
        break;
      case 'V':
        semV(ins.s); pc[current]++;
        break;
      case 'X':
        if (ins.s === 'P(x_sem)') { if (semP('x_sem')) pc[current]++; }
        else if (ins.s === 'V(x_sem)') { semV('x_sem'); pc[current]++; }
        else if (ins.s === 'P(next)') { if (semP('next')) pc[current]++; }
        else if (ins.s === 'V(next)') { semV('next'); pc[current]++; }
        else pc[current]++;
        break;
      case 'inc': V[ins.v]++; pc[current]++; break;
      case 'dec': V[ins.v]--; pc[current]++; break;
      case 'jz': pc[current] = (V[ins.v] === 0) ? ins.to : pc[current] + 1; break;
      case 'jnz': pc[current] = (V[ins.v] !== 0) ? ins.to : pc[current] + 1; break;
      case 'jmp': pc[current] = ins.to; break;
      case 'nop': pc[current]++; break;
      case 'end': done[current] = true; break;
    }
    holdsLock = (sem.mutex === 0 ? 1 : 0);
    if (holdsLock > maxHolds) maxHolds = holdsLock;
    if (!done[current] && !blocked[current] && pc[current] < prog[current].length) {
      ready.push(current);
    }
  }

  var completed = done.waiter && done.signaller;
  return {
    E1: E1, E2: E2,
    completed: completed,
    waiterDone: done.waiter, signallerDone: done.signaller,
    waiterAt: pc.waiter, signallerAt: pc.signaller,
    x_sem: sem.x_sem, next: sem.next, mutex: sem.mutex,
    maxHolds: maxHolds, steps: steps,
    log: log
  };
}

var SEM_A = semScenario('P(x_sem)', 'V(next)');
var SEM_B = semScenario('V(next)', 'P(x_sem)');
var SEM_C = semScenario('P(next)', 'V(x_sem)');
var SEM_D = semScenario('P(x_sem)', 'V(x_sem)');
var SEM_OPTS = [SEM_A, SEM_B, SEM_C, SEM_D];
var SEM_LETTERS = ['A', 'B', 'C', 'D'];

/* ----------------------------------------------------------------------
   1e. THE COUNTS THE LESSON QUOTES
   ---------------------------------------------------------------------- */

/* context switches added by one signal that finds a waiter */
var SWITCH = { hoare: 2, mesa: 0 };
var SWITCH_TABLE = [1, 2, 3, 4].map(function (k) {
  return { k: k, hoare: SWITCH.hoare * k, mesa: SWITCH.mesa * k };
});

/* the bounded buffer in monitor form: how many can be asleep at once */
var MON_CAP = 4, MON_PROD = 3, MON_CONS = 2;
var MON_MAX_ITEMS = MON_CAP;
var MON_MAX_ASLEEP = MON_PROD + MON_CONS;

var M = {
  bufWhile: BUF_WHILE,
  bufIf: BUF_IF,
  allocSignal: ALLOC_SIGNAL,
  allocBcast: ALLOC_BCAST,
  semOpts: SEM_OPTS,
  switchTable: SWITCH_TABLE,
  mon: { cap: MON_CAP, prod: MON_PROD, cons: MON_CONS,
         maxItems: MON_MAX_ITEMS, maxAsleep: MON_MAX_ASLEEP }
};

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* the search engine itself: a known-good run must terminate with everyone done */
chk('the buffer search terminates with the producer finished',
    BUF_WHILE.states > 0 && BUF_WHILE.firstViolation === null,
    'states ' + BUF_WHILE.states);

chk('the `while` buffer never takes an item from an empty buffer',
    BUF_WHILE.violations === 0,
    BUF_WHILE.violations + ' violating states');

chk('the `if` buffer does take an item from an empty buffer',
    BUF_IF.violations > 0,
    BUF_IF.violations + ' violating states');

chk('the `if` violation is a single reachable state, not every state',
    BUF_IF.violations > 0 && BUF_IF.violations < BUF_IF.states,
    BUF_IF.violations + ' of ' + BUF_IF.states);

chk('signal leaves a thread asleep whose condition is already true',
    ALLOC_SIGNAL.stalls > 0,
    ALLOC_SIGNAL.stalls + ' stalling states');

chk('broadcast leaves no thread asleep whose condition is already true',
    ALLOC_BCAST.stalls === 0,
    ALLOC_BCAST.stalls + ' stalling states');

chk('broadcast merges states rather than creating them',
    ALLOC_BCAST.states <= ALLOC_SIGNAL.states,
    ALLOC_SIGNAL.states + ' vs ' + ALLOC_BCAST.states);

/* the semaphore construction: only one of the four options finishes */
chk('option A (P(x_sem), V(next)) stalls',
    SEM_A.completed === false, 'waiterDone ' + SEM_A.waiterDone);

chk('option B (V(next), P(x_sem)) stalls',
    SEM_B.completed === false, 'waiterDone ' + SEM_B.waiterDone);

chk('option C (P(next), V(x_sem)) stalls',
    SEM_C.completed === false, 'waiterDone ' + SEM_C.waiterDone);

chk('option D (P(x_sem), V(x_sem)) completes',
    SEM_D.completed === true, 'waiterDone ' + SEM_D.waiterDone);

chk('exactly one of the four options completes',
    SEM_OPTS.filter(function (o) { return o.completed; }).length === 1,
    SEM_OPTS.filter(function (o) { return o.completed; }).length + ' complete');

chk('the mutex is held by at most one thread throughout',
    SEM_OPTS.every(function (o) { return o.maxHolds <= 1; }), 'max 1');

/* the counting claims */
chk('Hoare adds two context switches per signal, Mesa adds none',
    SWITCH_TABLE.every(function (r) { return r.hoare === 2 * r.k && r.mesa === 0; }),
    'k=4 gives ' + SWITCH_TABLE[3].hoare + ' vs ' + SWITCH_TABLE[3].mesa);

chk('at most N items can be in a monitor buffer of N slots',
    MON_MAX_ITEMS === MON_CAP, String(MON_MAX_ITEMS));

chk('at most P + C threads can be asleep on the two condition variables',
    MON_MAX_ASLEEP === MON_PROD + MON_CONS, String(MON_MAX_ASLEEP));

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function label(Pp, x, y, s, o) {
  o = o || {};
  Pp.alpha(o.alpha === undefined ? 1 : o.alpha);
  Pp.text(x, y, s, { size: o.size || 12, bold: o.bold, mono: o.mono,
                     color: o.color || INK, align: o.align, base: o.base });
  Pp.alpha(1);
}

function on(t, at) { return K.ease(K.clamp01((t - at) / 0.55)); }

function card(Pp, x, y, w, h, o) {
  o = o || {};
  Pp.alpha(o.alpha === undefined ? 1 : o.alpha);
  Pp.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, radius: 8, sw: 1 });
  Pp.alpha(1);
}

function rule(Pp, x1, y, x2, a) {
  Pp.alpha((a === undefined ? 1 : a) * 0.55);
  Pp.line(x1, y, x2, y, { stroke: BORDER, sw: 0.8 });
  Pp.alpha(1);
}

function tick(Pp, x, y, ok, a) {
  Pp.alpha(a === undefined ? 1 : a);
  if (ok) {
    Pp.line(x - 4, y, x - 1, y + 3.5, { stroke: VAL, sw: 2 });
    Pp.line(x - 1, y + 3.5, x + 5, y - 4, { stroke: VAL, sw: 2 });
  } else {
    Pp.line(x - 4, y - 4, x + 4, y + 4, { stroke: BAD, sw: 2 });
    Pp.line(x + 4, y - 4, x - 4, y + 4, { stroke: BAD, sw: 2 });
  }
  Pp.alpha(1);
}

function header(Pp, t, title, sub) {
  card(Pp, 28, 24, 844, 56, { fill: SURF2 });
  label(Pp, 44, 40, title, { size: 13.5, bold: true, alpha: on(t, 0) });
  if (sub) label(Pp, 44, 62, sub, { size: 11, color: DIM, alpha: on(t, 1) });
}

function slotRow(Pp, x, y, size, filled, cell, a) {
  cell = cell || 26;
  Pp.alpha(a === undefined ? 1 : a);
  for (var i = 0; i < size; i++) {
    var cx = x + i * (cell + 6);
    var isFilled = i < filled;
    Pp.rect(cx, y, cell, cell, { fill: isFilled ? ACCDIM : SURF,
                                 stroke: isFilled ? ACC : BORDER, radius: 4, sw: 1.2 });
    if (isFilled) Pp.line(cx + 7, y + cell / 2, cx + cell - 7, y + cell / 2, { stroke: ACC, sw: 2 });
  }
  Pp.alpha(1);
}

function queueBox(Pp, x, y, w, h, title, items, colour, a) {
  Pp.alpha(a);
  Pp.rect(x, y, w, h, { fill: SURF, stroke: colour || BORDER, radius: 7, sw: 1.3 });
  Pp.text(x + 8, y + 5, title, { size: 9.5, mono: true, color: FAINT });
  for (var i = 0; i < items.length; i++) {
    Pp.rect(x + 8 + i * 40, y + 20, 34, 20, { fill: WARNDIM, stroke: WARN, radius: 4 });
    Pp.text(x + 25 + i * 40, y + 30, items[i], { size: 9.5, mono: true, color: WARN,
             align: 'center', base: 'middle' });
  }
  Pp.alpha(1);
}

/* ---------- scene 1: why mutual exclusion is not enough ---------- */
function sceneWhy(t) {
  header(P, t, 'One lock is not enough: a thread can need something only another thread can give',
         'A monitor gives mutual exclusion for free. The question is what happens when the condition is false.');

  /* the room */
  card(P, 40, 100, 400, 200, { alpha: on(t, 1.5) });
  label(P, 56, 116, 'the monitor: one thread inside at a time', { size: 10.5, mono: true, color: FAINT, alpha: on(t, 1.5) });
  P.alpha(on(t, 2));
  P.rect(60, 136, 360, 146, { fill: SURF2, stroke: BORDER, radius: 6, dash: [5, 4] });
  P.alpha(1);
  label(P, 76, 152, 'T1 is inside', { size: 11.5, bold: true, alpha: on(t, 2.4) });
  label(P, 76, 176, 'it needs buffer not empty', { size: 10.5, color: DIM, alpha: on(t, 3) });
  label(P, 76, 196, 'but only T2 can put an item in', { size: 10.5, color: DIM, alpha: on(t, 3.4) });
  label(P, 76, 224, 'busy-waiting here spins forever:', { size: 10.5, color: BAD, alpha: on(t, 4.2) });
  label(P, 76, 244, 'T2 can never enter, because T1 holds the lock', { size: 10.5, color: BAD, alpha: on(t, 4.8) });

  /* the door and the queue */
  card(P, 470, 100, 390, 200, { alpha: on(t, 5) });
  label(P, 486, 116, 'what is needed: a way to step out and sleep', { size: 10.5, mono: true, color: FAINT, alpha: on(t, 5) });
  label(P, 486, 146, '1  release the lock', { size: 12, mono: true, alpha: on(t, 5.6) });
  label(P, 486, 170, '2  join a queue for this condition', { size: 12, mono: true, alpha: on(t, 6.2) });
  label(P, 486, 194, '3  sleep until somebody signals', { size: 12, mono: true, alpha: on(t, 6.8) });
  label(P, 486, 224, 'then compete for the lock again and re-check', { size: 12, mono: true, bold: true, color: ACC, alpha: on(t, 7.6) });
  label(P, 486, 258, 'that queue is a condition variable', { size: 11.5, color: ACC, alpha: on(t, 8.2) });
  label(P, 486, 280, 'it holds waiters, and nothing else', { size: 10.5, color: DIM, alpha: on(t, 8.6) });

  card(P, 40, 316, 820, 46, { fill: WARNDIM, stroke: WARN, alpha: on(t, 9) });
  label(P, 56, 334, 'The lock solves exclusion. The condition variable solves waiting. They are two different jobs.',
        { size: 11.5, bold: true, color: WARN, alpha: on(t, 9.4) });
  label(P, 56, 352, 'A monitor is both together, and that is the whole design.', { size: 10.5, color: DIM, alpha: on(t, 10) });

  label(P, 44, 396, 'T1', { size: 10, mono: true, color: FAINT, alpha: on(t, 3) });
  label(P, 44, 414, 'T2', { size: 10, mono: true, color: FAINT, alpha: on(t, 3.4) });
  P.alpha(on(t, 3));
  P.rect(70, 392, 210, 12, { fill: ACCDIM, stroke: ACC, radius: 3 });
  P.rect(286, 410, 150, 12, { fill: BADDIM, stroke: BAD, radius: 3 });
  P.alpha(1);
  label(P, 292, 396, 'T2 waits at the door for the whole time T1 spins', { size: 9.5, color: BAD, alpha: on(t, 4.6) });
}

/* ---------- scene 2: what a monitor is ---------- */
function sceneAnatomy(t) {
  header(P, t, 'A monitor is four things: data, procedures, one lock, and condition variables',
         'The lock is not written by the programmer. The compiler puts it at the start and the end of every procedure.');

  card(P, 40, 96, 250, 120, { alpha: on(t, 1.4) });
  label(P, 54, 112, 'private data', { size: 10.5, mono: true, color: FAINT, alpha: on(t, 1.4) });
  label(P, 54, 138, 'int count;', { size: 12, mono: true, alpha: on(t, 1.8) });
  label(P, 54, 158, 'Item buf[N];', { size: 12, mono: true, alpha: on(t, 2) });
  label(P, 54, 186, 'reachable only through the', { size: 10, color: DIM, alpha: on(t, 2.4) });
  label(P, 54, 202, 'monitor\u2019s own procedures', { size: 10, color: DIM, alpha: on(t, 2.4) });

  card(P, 306, 96, 250, 120, { alpha: on(t, 3) });
  label(P, 320, 112, 'procedures (entry points)', { size: 10.5, mono: true, color: FAINT, alpha: on(t, 3) });
  label(P, 320, 138, 'insert(item)', { size: 12, mono: true, alpha: on(t, 3.4) });
  label(P, 320, 158, 'remove()', { size: 12, mono: true, alpha: on(t, 3.6) });
  label(P, 320, 186, 'only one thread may be', { size: 10, color: DIM, alpha: on(t, 4) });
  label(P, 320, 202, 'inside any of them at once', { size: 10, color: DIM, alpha: on(t, 4) });

  card(P, 572, 96, 288, 120, { alpha: on(t, 4.6) });
  label(P, 586, 112, 'the implicit lock', { size: 10.5, mono: true, color: FAINT, alpha: on(t, 4.6) });
  label(P, 586, 138, 'acquired on entry', { size: 11.5, mono: true, alpha: on(t, 5) });
  label(P, 586, 158, 'released on exit', { size: 11.5, mono: true, alpha: on(t, 5.2) });
  label(P, 586, 186, 'released and re-acquired', { size: 10, color: DIM, alpha: on(t, 5.6) });
  label(P, 586, 202, 'around every wait', { size: 10, color: DIM, alpha: on(t, 5.6) });

  /* condition variables */
  label(P, 44, 240, 'condition variables: one queue each, no value', { size: 11, bold: true, alpha: on(t, 6.2) });
  queueBox(P, 44, 252, 200, 52, 'notFull', ['P1', 'P2'], ACC, on(t, 6.6));
  queueBox(P, 260, 252, 200, 52, 'notEmpty', ['C1'], ACC, on(t, 7));
  label(P, 476, 264, 'wait(cv)   always blocks, and releases the lock', { size: 11, mono: true, alpha: on(t, 7.4) });
  label(P, 476, 284, 'signal(cv) wakes one waiter, if there is one', { size: 11, mono: true, alpha: on(t, 7.8) });
  label(P, 476, 304, 'broadcast(cv) wakes every waiter', { size: 11, mono: true, alpha: on(t, 8.2) });

  card(P, 40, 320, 820, 62, { fill: SURF2, alpha: on(t, 8.8) });
  label(P, 56, 338, 'Monitor against semaphore, in one line each', { size: 11.5, bold: true, alpha: on(t, 8.8) });
  label(P, 56, 360, 'a semaphore is a counter you hold and give back  \u00b7  a monitor is a room you enter, with named queues inside it',
        { size: 11, mono: true, alpha: on(t, 9.2) });

  label(P, 44, 400, 'A condition variable is not a semaphore with another name. The next two scenes are exactly that difference.',
        { size: 10.5, color: DIM, alpha: on(t, 9.8) });
}

/* ---------- scene 3: wait is three steps in one ---------- */
function sceneWait(t) {
  header(P, t, 'wait(cv) does three things at once, and the atomicity is the point',
         'If the release and the sleep could be separated, a signal could arrive in the gap and be lost.');

  card(P, 40, 96, 380, 150, { alpha: on(t, 1.4) });
  label(P, 54, 112, 'the three steps, indivisible', { size: 10.5, mono: true, color: FAINT, alpha: on(t, 1.4) });
  label(P, 54, 140, '1  release the monitor lock', { size: 12, mono: true, alpha: on(t, 2) });
  label(P, 54, 164, '2  put this thread on cv\u2019s queue', { size: 12, mono: true, alpha: on(t, 2.6) });
  label(P, 54, 188, '3  sleep', { size: 12, mono: true, alpha: on(t, 3.2) });
  label(P, 54, 220, 'on waking: re-acquire the lock, then return', { size: 11, mono: true, bold: true, color: ACC, alpha: on(t, 4) });

  card(P, 440, 96, 420, 150, { alpha: on(t, 4.6) });
  label(P, 454, 112, 'why step 1 and step 3 cannot be separated', { size: 10.5, mono: true, color: FAINT, alpha: on(t, 4.6) });
  label(P, 454, 140, 'thread A:  release the lock', { size: 11, mono: true, alpha: on(t, 5) });
  label(P, 454, 160, 'thread B:  takes the lock, signals cv', { size: 11, mono: true, color: BAD, alpha: on(t, 5.6) });
  label(P, 454, 180, 'thread A:  now sleeps \u2014 the signal is gone', { size: 11, mono: true, color: BAD, alpha: on(t, 6.2) });
  label(P, 454, 208, 'nobody will signal again, so A sleeps forever', { size: 10.5, color: BAD, alpha: on(t, 6.8) });
  label(P, 454, 230, 'holding the lock across both is what forbids this', { size: 10.5, color: VAL, alpha: on(t, 7.4) });

  /* the two queues */
  label(P, 44, 274, 'the state after three waits and one signal', { size: 11, bold: true, alpha: on(t, 8) });
  queueBox(P, 44, 286, 210, 54, 'cv queue (asleep)', ['C1', 'C2', 'C3'], WARN, on(t, 8.4));
  queueBox(P, 272, 286, 210, 54, 'entry (runnable)', ['C1'], ACC, on(t, 9));
  label(P, 500, 296, 'signal moved exactly one thread', { size: 10.5, color: DIM, alpha: on(t, 9.4) });
  label(P, 500, 314, 'from the queue to runnable', { size: 10.5, color: DIM, alpha: on(t, 9.6) });
  label(P, 500, 332, 'C1 still does not hold the lock', { size: 10.5, color: BAD, alpha: on(t, 10) });

  card(P, 40, 356, 820, 44, { fill: WARNDIM, stroke: WARN, alpha: on(t, 10.6) });
  label(P, 56, 374, 'wait must be called while holding the lock. Calling it outside the monitor is an error, not a no-op.',
        { size: 11, bold: true, color: WARN, alpha: on(t, 11) });
  label(P, 56, 392, 'In Java that error is a thrown IllegalMonitorStateException.', { size: 10.5, color: DIM, alpha: on(t, 11.4) });
}

/* ---------- scene 4: signal has no memory ---------- */
function sceneNoMemory(t) {
  header(P, t, 'signal on a condition variable is lost if nobody is waiting. V on a semaphore is not.',
         'This single row decides more exam questions than any other fact in the topic.');

  /* table header */
  label(P, 44, 96, '', { size: 10 });
  label(P, 250, 100, 'semaphore', { size: 11, bold: true, mono: true, align: 'center', alpha: on(t, 1.4) });
  label(P, 610, 100, 'condition variable', { size: 11, bold: true, mono: true, align: 'center', alpha: on(t, 1.4) });
  rule(P, 40, 110, 860, on(t, 1.4));

  var rows = [
    ['has a value?', 'yes, an integer', 'no, only a queue'],
    ['the take operation', 'P: decrement, block at 0', 'wait: always blocks'],
    ['the give operation', 'V: increment or wake one', 'signal: wake one, or nothing'],
    ['give with no waiter', 'value goes up, remembered', 'lost, and not remembered'],
    ['take with no giver', 'blocks only if value is 0', 'always blocks, always'],
    ['legal outside a monitor?', 'yes', 'no, the lock is required']
  ];
  for (var i = 0; i < rows.length; i++) {
    var a = on(t, 2 + i * 0.9);
    var y = 128 + i * 34;
    if (i === 3) {
      P.alpha(a * 0.5);
      P.rect(420, y - 6, 380, 26, { fill: BADDIM, radius: 4 });
      P.alpha(1);
    }
    label(P, 44, y, rows[i][0], { size: 11, color: DIM, alpha: a });
    label(P, 250, y, rows[i][1], { size: 11, mono: true, align: 'center', alpha: a });
    label(P, 610, y, rows[i][2], { size: 11, mono: true, align: 'center',
            color: i === 3 ? BAD : INK, alpha: a, bold: i === 3 });
  }
  rule(P, 40, 340, 860, on(t, 7.4));

  card(P, 40, 352, 400, 60, { fill: SURF2, alpha: on(t, 7.8) });
  label(P, 54, 370, 'V(sem) with no waiter', { size: 11, bold: true, alpha: on(t, 7.8) });
  label(P, 54, 392, 'sem = sem + 1; the next P spends it', { size: 11, mono: true, color: VAL, alpha: on(t, 8.2) });

  card(P, 460, 352, 400, 60, { fill: WARNDIM, stroke: WARN, alpha: on(t, 8.6) });
  label(P, 474, 370, 'signal(cv) with no waiter', { size: 11, bold: true, color: WARN, alpha: on(t, 8.6) });
  label(P, 474, 392, 'nothing happens; the next wait still blocks', { size: 11, mono: true, color: WARN, alpha: on(t, 9) });

  label(P, 44, 434, 'That is why the condition is tested under the lock before waiting: a signal cannot slip into the gap.',
        { size: 10.5, color: DIM, alpha: on(t, 9.6) });
}

/* ---------- scene 5: Hoare against Mesa ---------- */
function sceneHoareMesa(t) {
  header(P, t, 'Hoare and Mesa answer one question differently: who runs after the signal?',
         'Both are monitors. The difference is a scheduling rule, and it changes whether an `if` is safe.');

  /* Hoare lane */
  card(P, 40, 96, 400, 160, { stroke: INFO, alpha: on(t, 1.4) });
  label(P, 54, 112, 'Hoare — signal and urgent wait', { size: 11.5, bold: true, color: INFO, alpha: on(t, 1.4) });
  label(P, 54, 140, 'the signaller hands over lock and CPU', { size: 10.5, alpha: on(t, 1.8) });
  label(P, 54, 160, 'the waiter runs immediately', { size: 10.5, alpha: on(t, 2.2) });
  label(P, 54, 180, 'the signaller resumes when the waiter', { size: 10.5, alpha: on(t, 2.6) });
  label(P, 54, 196, 'exits or waits again', { size: 10.5, alpha: on(t, 2.6) });
  label(P, 54, 224, 'the condition is still true on return', { size: 10.5, bold: true, color: VAL, alpha: on(t, 3.2) });
  label(P, 54, 244, 'so `if` is enough', { size: 10.5, color: VAL, alpha: on(t, 3.4) });

  /* Mesa lane */
  card(P, 460, 96, 400, 160, { stroke: ACC, alpha: on(t, 3.8) });
  label(P, 474, 112, 'Mesa — signal and continue', { size: 11.5, bold: true, color: ACC, alpha: on(t, 3.8) });
  label(P, 474, 140, 'the signaller keeps the lock and the CPU', { size: 10.5, alpha: on(t, 4.2) });
  label(P, 474, 160, 'the waiter becomes runnable only', { size: 10.5, alpha: on(t, 4.6) });
  label(P, 474, 180, 'another thread may enter first', { size: 10.5, alpha: on(t, 5) });
  label(P, 474, 196, 'and change the state', { size: 10.5, alpha: on(t, 5) });
  label(P, 474, 224, 'the condition may be false on return', { size: 10.5, bold: true, color: BAD, alpha: on(t, 5.6) });
  label(P, 474, 244, 'so `while` is required', { size: 10.5, color: BAD, alpha: on(t, 5.8) });

  /* the switch cost table */
  label(P, 44, 282, 'context switches added by one signal that finds a waiter', { size: 11, bold: true, alpha: on(t, 6.4) });
  label(P, 300, 304, 'signals k', { size: 9.5, mono: true, color: FAINT, align: 'center', alpha: on(t, 6.6) });
  label(P, 450, 304, 'Hoare: 2k', { size: 9.5, mono: true, color: FAINT, align: 'center', alpha: on(t, 6.6) });
  label(P, 620, 304, 'Mesa: 0', { size: 9.5, mono: true, color: FAINT, align: 'center', alpha: on(t, 6.6) });
  for (var i = 0; i < SWITCH_TABLE.length; i++) {
    var r = SWITCH_TABLE[i], a = on(t, 6.8 + i * 0.4), y = 322 + i * 20;
    label(P, 300, y, String(r.k), { size: 11, mono: true, align: 'center', alpha: a });
    label(P, 450, y, String(r.hoare), { size: 11, mono: true, align: 'center', color: INFO, alpha: a });
    label(P, 620, y, String(r.mesa), { size: 11, mono: true, align: 'center', color: ACC, alpha: a });
  }

  card(P, 44, 408, 816, 44, { fill: SURF2, alpha: on(t, 9.4) });
  label(P, 58, 426, 'Mesa is what real systems run: Java\u2019s wait/notify, POSIX condition variables, C# Monitor, Go\u2019s sync.Cond.',
        { size: 10.5, mono: true, alpha: on(t, 9.4) });
  label(P, 58, 444, 'Textbooks often draw Hoare. Read the question\u2019s own wording before you answer.', { size: 10.5, color: DIM, alpha: on(t, 9.8) });
}

/* ---------- scene 6: the while rule, computed ---------- */
function sceneWhile(t) {
  header(P, t, 'The `if` against `while` question, answered by searching every interleaving',
         'One producer, two consumers, one slot. Every order of every statement is enumerated.');

  /* the code */
  card(P, 40, 96, 400, 176, { alpha: on(t, 1.4) });
  label(P, 54, 112, 'the two versions of remove()', { size: 10.5, mono: true, color: FAINT, alpha: on(t, 1.4) });
  label(P, 54, 138, 'while (count == 0) wait(notEmpty);', { size: 10.5, mono: true, color: VAL, alpha: on(t, 1.8) });
  label(P, 54, 156, 'count--;  signal(notFull);', { size: 10.5, mono: true, alpha: on(t, 2) });
  label(P, 54, 184, 'if (count == 0) wait(notEmpty);', { size: 10.5, mono: true, color: BAD, alpha: on(t, 2.6) });
  label(P, 54, 202, 'count--;  signal(notFull);', { size: 10.5, mono: true, alpha: on(t, 2.8) });
  label(P, 54, 232, 'insert(): while (count == 1) wait(notFull);', { size: 10, mono: true, color: DIM, alpha: on(t, 3.4) });
  label(P, 54, 250, '          count++;  signal(notEmpty);', { size: 10, mono: true, color: DIM, alpha: on(t, 3.6) });

  /* the measured results */
  card(P, 460, 96, 400, 176, { alpha: on(t, 4.2) });
  label(P, 474, 112, 'what the search found', { size: 10.5, mono: true, color: FAINT, alpha: on(t, 4.2) });
  label(P, 474, 140, 'states explored, while version', { size: 10.5, color: DIM, alpha: on(t, 4.6) });
  label(P, 844, 140, String(M.bufWhile.states), { size: 11, mono: true, align: 'right', alpha: on(t, 4.6) });
  label(P, 474, 160, 'states explored, if version', { size: 10.5, color: DIM, alpha: on(t, 4.9) });
  label(P, 844, 160, String(M.bufIf.states), { size: 11, mono: true, align: 'right', alpha: on(t, 4.9) });
  label(P, 474, 188, 'runs that take from an empty buffer, while', { size: 10.5, color: DIM, alpha: on(t, 5.4) });
  label(P, 844, 188, String(M.bufWhile.violations), { size: 11, mono: true, align: 'right', color: VAL, bold: true, alpha: on(t, 5.4) });
  label(P, 474, 208, 'runs that take from an empty buffer, if', { size: 10.5, color: DIM, alpha: on(t, 5.8) });
  label(P, 844, 208, String(M.bufIf.violations), { size: 11, mono: true, align: 'right', color: BAD, bold: true, alpha: on(t, 5.8) });
  tick(P, 462, 186, M.bufWhile.violations === 0, on(t, 6.2));
  tick(P, 462, 206, M.bufIf.violations === 0, on(t, 6.4));

  /* the trace, in two columns */
  label(P, 44, 292, 'the shortest way the `if` version goes wrong, step by step', { size: 11, bold: true, alpha: on(t, 6.8) });
  var tr = M.bufIf.firstViolation ? M.bufIf.firstViolation.trace : [];
  var half = 6;
  for (var i = 0; i < tr.length; i++) {
    var col = i < half ? 0 : 1;
    var row = col === 0 ? i : i - half;
    var a2 = on(t, 7.1 + i * 0.28);
    var bad = /take one item/.test(tr[i]) && /-1/.test(tr[i]);
    label(P, 48 + col * 344, 310 + row * 16, (i + 1) + '. ' + tr[i],
          { size: 9, mono: true, alpha: a2, color: bad ? BAD : INK });
  }
  label(P, 396, 310 + 5 * 16, 'the last line is the item that was never there',
        { size: 9.5, color: BAD, alpha: on(t, 10.4) });

  card(P, 40, 402, 820, 32, { fill: WARNDIM, stroke: WARN, alpha: on(t, 10.8) });
  label(P, 56, 414, 'Mesa guarantees only that the state changed. It never guarantees the predicate you were waiting for.',
        { size: 10.5, bold: true, color: WARN, alpha: on(t, 10.8) });
  label(P, 44, 448, 'So the predicate is re-tested in a loop, and each extra pass through the loop is a lost notification.',
        { size: 10.5, color: DIM, alpha: on(t, 11.2) });
}

/* ---------- scene 7: signal against broadcast ---------- */
function sceneSignalBroadcast(t) {
  header(P, t, 'When one signal cannot reach the right waiter, broadcast is not optional',
         'A pool of 10 free units. One thread needs 16, another needs 6. Same search, two wake rules.');

  /* signal */
  card(P, 40, 96, 400, 150, { stroke: BAD, alpha: on(t, 1.4) });
  label(P, 54, 112, 'signal(cv) — one waiter woken', { size: 11.5, bold: true, color: BAD, alpha: on(t, 1.4) });
  label(P, 54, 140, 'W16 is woken, finds 10 < 16, waits again', { size: 10.5, alpha: on(t, 1.9) });
  label(P, 54, 158, 'its wake-up is spent and not passed on', { size: 10.5, alpha: on(t, 2.3) });
  label(P, 54, 186, 'W6 is asleep with 10 \u2265 6 already true', { size: 10.5, color: BAD, bold: true, alpha: on(t, 2.9) });
  label(P, 54, 206, 'and no thread can ever signal it again', { size: 10.5, color: BAD, alpha: on(t, 3.3) });
  label(P, 54, 230, 'stalling states found: ' + M.allocSignal.stalls, { size: 10.5, mono: true, color: BAD, alpha: on(t, 3.8) });

  /* broadcast */
  card(P, 460, 96, 400, 150, { stroke: VAL, alpha: on(t, 4.4) });
  label(P, 474, 112, 'broadcast(cv) — every waiter woken', { size: 11.5, bold: true, color: VAL, alpha: on(t, 4.4) });
  label(P, 474, 140, 'both wake; W16 re-waits, W6 takes 6', { size: 10.5, alpha: on(t, 4.9) });
  label(P, 474, 158, 'nobody whose condition is true stays asleep', { size: 10.5, alpha: on(t, 5.3) });
  label(P, 474, 186, 'the run finishes', { size: 10.5, color: VAL, bold: true, alpha: on(t, 5.9) });
  label(P, 474, 206, 'and no thread is left waiting on a true condition', { size: 10.5, color: VAL, alpha: on(t, 6.3) });
  label(P, 474, 230, 'stalling states found: ' + M.allocBcast.stalls, { size: 10.5, mono: true, color: VAL, alpha: on(t, 6.8) });

  /* the two states side by side */
  label(P, 44, 274, 'the state both searches agree on, and disagree about', { size: 11, bold: true, alpha: on(t, 7.2) });
  card(P, 40, 286, 820, 62, { fill: SURF2, alpha: on(t, 7.6) });
  label(P, 54, 304, 'avail = 10    W16 asleep, needs 16  (correctly asleep)    W6 asleep, needs 6  (should not be asleep)',
        { size: 11, mono: true, alpha: on(t, 7.6) });
  label(P, 54, 328, 'Both searches reach this state. Under signal it is terminal; under broadcast it is not.',
        { size: 10.5, color: DIM, alpha: on(t, 8.2) });

  card(P, 40, 360, 400, 84, { fill: SURF2, alpha: on(t, 8.8) });
  label(P, 54, 378, 'signal is correct when', { size: 10.5, bold: true, alpha: on(t, 8.8) });
  label(P, 54, 400, 'every waiter on that cv can be', { size: 10, color: DIM, alpha: on(t, 9.1) });
  label(P, 54, 416, 'satisfied by the same change', { size: 10, color: DIM, alpha: on(t, 9.1) });
  label(P, 54, 434, 'one cv per predicate, one waiter each', { size: 10, color: ACC, alpha: on(t, 9.5) });

  card(P, 460, 360, 400, 84, { fill: SURF2, alpha: on(t, 9.8) });
  label(P, 474, 378, 'broadcast is always correct', { size: 10.5, bold: true, alpha: on(t, 9.8) });
  label(P, 474, 400, 'the while loop absorbs the extra', { size: 10, color: DIM, alpha: on(t, 10.1) });
  label(P, 474, 416, 'wake-ups, at the cost of switches', { size: 10, color: DIM, alpha: on(t, 10.1) });
  label(P, 474, 434, 'use it when one cv serves two predicates', { size: 10, color: VAL, alpha: on(t, 10.5) });
}

/* ---------- scene 8: the monitor from semaphores ---------- */
function sceneSemaphores(t) {
  header(P, t, 'The standard construction, executed against all four options',
         'mutex, next, x_sem and two counters are enough to build a Hoare monitor. Two of the blanks are the question.');

  card(P, 40, 96, 430, 190, { alpha: on(t, 1.4) });
  label(P, 54, 112, 'the construction', { size: 10.5, mono: true, color: FAINT, alpha: on(t, 1.4) });
  label(P, 54, 138, 'mutex = 1     one thread in the body', { size: 10, mono: true, alpha: on(t, 1.8) });
  label(P, 54, 156, 'next = 0      the signaller parks here', { size: 10, mono: true, alpha: on(t, 2.1) });
  label(P, 54, 174, 'x_sem = 0     the waiter parks here', { size: 10, mono: true, alpha: on(t, 2.4) });
  label(P, 54, 192, 'next_count, x_count', { size: 10, mono: true, alpha: on(t, 2.7) });
  rule(P, 54, 204, 456, on(t, 3));
  label(P, 54, 220, 'entry:  P(mutex) \u2026 exit: if next_count>0', { size: 9.5, mono: true, alpha: on(t, 3.2) });
  label(P, 54, 236, '        V(next) else V(mutex)', { size: 9.5, mono: true, alpha: on(t, 3.2) });
  label(P, 54, 258, 'x.wait:   E1   \u2026  the blank', { size: 9.5, mono: true, color: ACC, bold: true, alpha: on(t, 3.6) });
  label(P, 54, 274, 'x.signal: E2   \u2026  the blank', { size: 9.5, mono: true, color: ACC, bold: true, alpha: on(t, 3.6) });

  /* the four options */
  label(P, 490, 112, 'the four candidate answers, run', { size: 10.5, mono: true, color: FAINT, alpha: on(t, 4.2) });
  for (var i = 0; i < SEM_OPTS.length; i++) {
    var o = SEM_OPTS[i], a = on(t, 4.5 + i * 0.7), y = 134 + i * 38;
    card(P, 490, y - 14, 370, 32, { alpha: a, stroke: o.completed ? VAL : BORDER,
         fill: o.completed ? '#eaf7ee' : SURF });
    label(P, 502, y, SEM_LETTERS[i], { size: 12, mono: true, bold: true, alpha: a });
    label(P, 522, y, o.E1 + ', ' + o.E2, { size: 10, mono: true, alpha: a });
    tick(P, 770, y + 5, o.completed, a);
    label(P, 790, y, o.completed ? 'finishes' : 'stalls', { size: 10, mono: true,
          color: o.completed ? VAL : BAD, alpha: a, bold: true });
  }

  card(P, 490, 292, 370, 76, { fill: SURF2, alpha: on(t, 7.6) });
  label(P, 504, 308, 'why the three fail, in one line each', { size: 10, bold: true, alpha: on(t, 7.6) });
  label(P, 504, 328, 'A  the waiter is never released', { size: 9.5, mono: true, color: BAD, alpha: on(t, 7.9) });
  label(P, 504, 344, 'B  signaller blocks before releasing it', { size: 9.5, mono: true, color: BAD, alpha: on(t, 8.1) });
  label(P, 504, 360, 'C  both park on next, nobody frees either', { size: 9.5, mono: true, color: BAD, alpha: on(t, 8.3) });

  card(P, 40, 300, 430, 68, { fill: WARNDIM, stroke: WARN, alpha: on(t, 8.8) });
  label(P, 54, 318, 'The rule the answer follows', { size: 10.5, bold: true, color: WARN, alpha: on(t, 8.8) });
  label(P, 54, 340, 'wait parks on its own semaphore;', { size: 10, color: DIM, alpha: on(t, 9.1) });
  label(P, 54, 356, 'signal releases that same semaphore.', { size: 10, color: DIM, alpha: on(t, 9.1) });

  card(P, 40, 380, 820, 68, { fill: SURF2, alpha: on(t, 9.6) });
  label(P, 56, 398, 'This is the Hoare monitor written with semaphores: the signaller is the one that parks, on next,',
        { size: 10.5, alpha: on(t, 9.6) });
  label(P, 56, 416, 'and the waiter gets the lock next. That is why the waiter is released before the signaller blocks,',
        { size: 10.5, alpha: on(t, 9.9) });
  label(P, 56, 434, 'and why E1 and E2 must name the same semaphore, x_sem, in opposite directions.', { size: 10.5, color: ACC, alpha: on(t, 10.2) });
}

/* ---------- scene 9: the bounded buffer in monitor form ---------- */
function sceneBufferMonitor(t) {
  header(P, t, 'The bounded buffer as a monitor: two condition variables, two while loops',
         'The semaphore version counts; this version waits. Same invariant, different bookkeeping.');

  card(P, 40, 96, 430, 200, { alpha: on(t, 1.4) });
  label(P, 54, 112, 'monitor Buffer', { size: 11, mono: true, bold: true, alpha: on(t, 1.4) });
  label(P, 54, 138, 'int count = 0, cap = N;', { size: 10, mono: true, alpha: on(t, 1.8) });
  label(P, 54, 156, 'condition notFull, notEmpty;', { size: 10, mono: true, alpha: on(t, 2.1) });
  rule(P, 54, 168, 456, on(t, 2.4));
  label(P, 54, 186, 'insert(x):', { size: 10, mono: true, bold: true, alpha: on(t, 2.6) });
  label(P, 68, 204, 'while (count == cap) wait(notFull);', { size: 10, mono: true, alpha: on(t, 2.9) });
  label(P, 68, 222, 'put x;  count++;', { size: 10, mono: true, alpha: on(t, 3.2) });
  label(P, 68, 240, 'signal(notEmpty);', { size: 10, mono: true, alpha: on(t, 3.5) });
  label(P, 54, 262, 'remove():', { size: 10, mono: true, bold: true, alpha: on(t, 3.8) });
  label(P, 68, 280, 'while (count == 0) wait(notEmpty);', { size: 10, mono: true, alpha: on(t, 4.1) });

  /* the counts */
  card(P, 490, 96, 370, 200, { alpha: on(t, 4.8) });
  label(P, 504, 112, 'the four counts', { size: 10.5, mono: true, color: FAINT, alpha: on(t, 4.8) });
  label(P, 504, 140, 'items in the buffer, at most', { size: 10.5, color: DIM, alpha: on(t, 5.1) });
  label(P, 844, 140, 'N = ' + M.mon.cap, { size: 11, mono: true, align: 'right', alpha: on(t, 5.1) });
  label(P, 504, 162, 'producers asleep, at most', { size: 10.5, color: DIM, alpha: on(t, 5.4) });
  label(P, 844, 162, String(M.mon.prod), { size: 11, mono: true, align: 'right', alpha: on(t, 5.4) });
  label(P, 504, 184, 'consumers asleep, at most', { size: 10.5, color: DIM, alpha: on(t, 5.7) });
  label(P, 844, 184, String(M.mon.cons), { size: 11, mono: true, align: 'right', alpha: on(t, 5.7) });
  label(P, 504, 206, 'asleep on both, at most', { size: 10.5, color: DIM, alpha: on(t, 6) });
  label(P, 844, 206, 'P + C = ' + M.mon.maxAsleep, { size: 11, mono: true, align: 'right', color: ACC, alpha: on(t, 6) });
  rule(P, 504, 220, 846, on(t, 6.3));
  label(P, 504, 238, 'a producer and a consumer are never', { size: 10, color: DIM, alpha: on(t, 6.5) });
  label(P, 504, 254, 'asleep at the same time when N = 1', { size: 10, color: DIM, alpha: on(t, 6.5) });
  label(P, 504, 276, 'because count = 1 excludes count = 0', { size: 10, color: ACC, alpha: on(t, 6.8) });

  /* the mapping */
  label(P, 44, 322, 'the same three names in real systems', { size: 11, bold: true, alpha: on(t, 7.4) });
  var rows = [
    ['Java', 'synchronized method', 'this.wait() / notifyAll()'],
    ['POSIX', 'pthread_mutex_t', 'pthread_cond_wait / broadcast'],
    ['C#', 'lock (o) { }', 'Monitor.Wait / PulseAll'],
    ['Go', 'sync.Mutex', 'sync.Cond.Wait / Broadcast']
  ];
  for (var i = 0; i < rows.length; i++) {
    var a = on(t, 7.7 + i * 0.45), y = 342 + i * 20;
    label(P, 52, y, rows[i][0], { size: 10, mono: true, bold: true, alpha: a });
    label(P, 150, y, rows[i][1], { size: 10, mono: true, color: DIM, alpha: a });
    label(P, 420, y, rows[i][2], { size: 10, mono: true, color: ACC, alpha: a });
  }

  card(P, 40, 424, 820, 36, { fill: WARNDIM, stroke: WARN, alpha: on(t, 9.8) });
  label(P, 56, 440, 'Two condition variables are what let one signal reach the right kind of waiter. One cv would need broadcast.',
        { size: 10.5, bold: true, color: WARN, alpha: on(t, 9.8) });
}

/* ---------- scene 10: the reading procedure ---------- */
function sceneProcedure(t) {
  header(P, t, 'The reading procedure for any monitor question',
         'Four steps, then the four traps that decide the answer.');

  var steps = [
    ['1', 'Name the lock and the queues', 'one lock, then one queue per condition variable'],
    ['2', 'Read who runs after signal', 'Hoare hands over; Mesa continues. This decides `if` against `while`'],
    ['3', 'Check the predicate, not the name', 'the condition tested in the loop, and whether it is re-tested'],
    ['4', 'Count the waiters and the wake-ups', 'a lost signal is lost; a broadcast wakes everyone']
  ];
  for (var i = 0; i < steps.length; i++) {
    var a = on(t, 1.2 + i * 0.8), y = 100 + i * 46;
    card(P, 40, y, 430, 38, { alpha: a });
    label(P, 54, y + 12, steps[i][0], { size: 13, mono: true, bold: true, color: ACC, alpha: a });
    label(P, 76, y + 6, steps[i][1], { size: 11, bold: true, alpha: a });
    label(P, 76, y + 22, steps[i][2], { size: 9.5, color: DIM, alpha: a });
  }

  var traps = [
    ['signal is not V', 'no value, so no memory'],
    ['wait is not P', 'it always blocks'],
    ['a wake-up is not a promise', 'Mesa wakes you, then re-test'],
    ['broadcast is not wasteful', 'it is the safe default']
  ];
  for (var j = 0; j < traps.length; j++) {
    var a2 = on(t, 4.6 + j * 0.7), y2 = 100 + j * 46;
    card(P, 490, y2, 370, 38, { alpha: a2, stroke: WARN });
    label(P, 504, y2 + 6, traps[j][0], { size: 10.5, bold: true, color: WARN, alpha: a2 });
    label(P, 504, y2 + 22, traps[j][1], { size: 9.5, color: DIM, alpha: a2 });
  }

  card(P, 40, 296, 820, 74, { fill: SURF2, alpha: on(t, 7.6) });
  label(P, 56, 314, 'The one sentence worth keeping', { size: 11, bold: true, alpha: on(t, 7.6) });
  label(P, 56, 338, 'A monitor gives exclusion for free; a condition variable gives waiting; and every wait must be',
        { size: 11, alpha: on(t, 8) });
  label(P, 56, 358, 're-tested in a loop, because under Mesa a signal is a hint and not a guarantee.',
        { size: 11, color: ACC, bold: true, alpha: on(t, 8.4) });

  card(P, 40, 382, 820, 62, { fill: WARNDIM, stroke: WARN, alpha: on(t, 9) });
  label(P, 56, 400, 'Before you answer, find the word that settles it', { size: 10.5, bold: true, color: WARN, alpha: on(t, 9) });
  label(P, 56, 422, '"immediately" or "urgent wait" means Hoare.  "keeps the lock", "notify", "notifyAll", "spurious" means Mesa.',
        { size: 10.5, mono: true, color: DIM, alpha: on(t, 9.4) });
  label(P, 56, 438, 'If the question never says, the safe reading is Mesa, because that is what the systems it names actually do.',
        { size: 10, color: DIM, alpha: on(t, 9.8) });
}

/* ---------- the frame ---------- */
var SCENES = [sceneWhy, sceneAnatomy, sceneWait, sceneNoMemory, sceneHoareMesa,
              sceneWhile, sceneSignalBroadcast, sceneSemaphores, sceneBufferMonitor,
              sceneProcedure];

function drawFrame(Pp) {
  Pp.clear();
  var t = K.state.elapsed;
  var idx = K.sceneAt(t);
  var sc = K.state.scenes[idx];
  var local = sc ? t - sc.start : t;
  var fn = SCENES[idx] || SCENES[0];
  fn(local);
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

  if (window.p5 && PR) {
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
      if (ctx2d && PR) {
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

window.__MODEL = { M: M, CHECKS: CHECKS };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
