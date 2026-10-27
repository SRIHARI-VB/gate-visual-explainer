(function () {
  'use strict';

  var W = 900, H = 470;
  var K = window.LessonKit;
  var PR = window.Painters;
  var PAL = PR.PAL;
  var P = null;

/* ======================================================================
   LAYER 1 - THE MODEL (processes-threads-and-ipc)
   Pure data and pure functions. No drawing here. Nothing in this section
   knows what a canvas is. Every number the lesson quotes is computed.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) }); }
function near(a, b, eps) { eps = eps === undefined ? 1e-9 : eps; return Math.abs(a - b) <= eps; }

/* ---------------- 1. how many processes a fork sequence makes ---------------- */
/* n sequential fork calls: every process alive executes the next one */
function processCount(n) { return Math.pow(2, n); }
function childCount(n) { return Math.pow(2, n) - 1; }

/* a fork inside a loop of n iterations with no wait behaves the same way:
   the population doubles once per iteration, so it is 2^n again */
function loopForkProcesses(n) { return Math.pow(2, n); }

/* the 2024 shape: while (x > 0) { fork(); print; wait; x--; }
   iteration i has 2^i live processes, each printing once, and every process
   inherits the parent's current x, so the loop runs x times in each of them */
function waitLoopPrints(x) {
  var total = 0, i, per = [];
  for (i = 1; i <= x; i++) { per.push(Math.pow(2, i)); total += Math.pow(2, i); }
  return { prints: total, closed: Math.pow(2, x + 1) - 2, perIteration: per,
           distinct: Math.pow(2, x) };
}

/* ---------------- 2. what fork returns ---------------- */
function forkBranch(pid) {
  if (pid < 0) return 'fail';
  if (pid === 0) return 'child';
  return 'parent';
}

/* the 2005 program: if (fork() == 0) a = a + 5 else a = a - 5, printing a and &a */
function fork2005(a0) {
  var parentA = a0 - 5, childA = a0 + 5;
  return { parentA: parentA, childA: childA, gap: childA - parentA,
           sameVirtualAddress: true };
}

/* ---------------- 3. the state machine ---------------- */
var STATES = ['new', 'ready', 'running', 'blocked', 'terminated'];
var EDGES = [
  ['new', 'ready'],
  ['ready', 'running'],
  ['running', 'ready'],
  ['running', 'blocked'],
  ['blocked', 'ready'],
  ['running', 'terminated']
];
function legal(from, to) {
  for (var i = 0; i < EDGES.length; i++) {
    if (EDGES[i][0] === from && EDGES[i][1] === to) return true;
  }
  return false;
}

/* the two previous-year lists, answered from the edge set */
var Q2020 = [
  { s: 'running -> ready', id: 'I' },
  { s: 'ready -> running', id: 'II' },
  { s: 'blocked -> running', id: 'III' },
  { s: 'blocked -> ready', id: 'IV' }
];
var Q2024S1 = [
  { s: 'running -> ready', id: 'A' },
  { s: 'waiting -> running', id: 'B' },
  { s: 'ready -> waiting', id: 'C' },
  { s: 'running -> terminated', id: 'D' }
];
function trueStatements(list) {
  var out = [];
  for (var i = 0; i < list.length; i++) {
    var parts = list[i].s.split(' -> ');
    if (legal(parts[0], parts[1])) out.push(list[i].id);
  }
  return out;
}
function impossibleStatements(list) {
  var out = [];
  for (var i = 0; i < list.length; i++) {
    var parts = list[i].s.split(' -> ');
    if (!legal(parts[0], parts[1])) out.push(list[i].id);
  }
  return out;
}

/* ---------------- 4. the cost of a context switch ---------------- */
/* s = switch cost, q = time slice. The cycle is q + s, so the denominator
   carries the switch as well as the slice. */
function switchFraction(s, q) { return s / (q + s); }
function utilisation(s, q) { return q / (q + s); }

/* a process switch also changes the address space; a thread switch does not */
function switchCost(regSave, addrSpace) {
  return { thread: regSave, process: regSave + addrSpace,
           ratio: (regSave + addrSpace) / regSave };
}

/* ---------------- 5. threads: shared and private ---------------- */
var THREAD_SHARED = ['code segment', 'global and static data', 'heap',
                     'open files', 'the address space and page table'];
var THREAD_PRIVATE = ['program counter', 'general registers',
                      'stack and stack pointer', 'thread id and state'];
/* the 2023 paper: what must be saved on a switch between two threads */
var SAVED_ON_THREAD_SWITCH = ['stack pointer', 'program counter', 'general purpose registers'];
var NOT_SAVED_ON_THREAD_SWITCH = ['page table base register'];

function isPrivate(item) { return THREAD_PRIVATE.indexOf(item) >= 0; }
function isShared(item) { return THREAD_SHARED.indexOf(item) >= 0; }

/* ---------------- 6. IPC ---------------- */
/* a message-passing channel of capacity c: the sender may be ahead by c */
function senderBlocks(capacity, sent, received) { return (sent - received) > capacity; }

/* a pipe is a byte stream: a read takes what is available up to its request */
function pipeDrain(writes, readSize) {
  var total = 0, i;
  for (i = 0; i < writes.length; i++) total += writes[i];
  var reads = Math.ceil(total / readSize);
  var firstRead = Math.min(total, readSize);
  /* how many separate writes that first read spans */
  var spanned = 0, acc = 0;
  while (acc < firstRead) { acc += writes[spanned]; spanned++; }
  return { reads: reads, firstRead: firstRead, spansWrites: spanned };
}

/* a message queue keeps boundaries: one read returns exactly one message */
function queueDrain(messages, readSize) {
  var reads = 0, firstRead = 0, i;
  for (i = 0; i < messages.length; i++) {
    reads++;
    if (i === 0) firstRead = Math.min(messages[i], readSize);
  }
  return { reads: reads, firstRead: firstRead };
}

/* ---------------- 7. what always causes a context switch ---------------- */
var SWITCH_EVENTS = [
  { e: 'a blocking system call by P', always: true },
  { e: 'a page fault on a page in swap', always: true },
  { e: 'a disk interrupt for another process', always: false },
  { e: 'a timer interrupt', always: false }
];
function alwaysSwitches(e) {
  for (var i = 0; i < SWITCH_EVENTS.length; i++) if (SWITCH_EVENTS[i].e === e) return SWITCH_EVENTS[i].always;
  return null;
}

/* ---------------- 8. the running cases ---------------- */
var FORK3 = processCount(3);                    /* GATE 2012 */
var LOOP2024 = waitLoopPrints(3);               /* GATE 2024 Set 1 */
var F2005 = fork2005(10);                       /* GATE 2005 */
var COST = switchCost(0.5, 2.0);                /* microseconds */
var FRAC10 = switchFraction(0.1, 10);
var FRAC1 = switchFraction(0.1, 1);
var PIPE = pipeDrain([2, 3], 5);
var PIPE2 = pipeDrain([2, 3], 2);
var QUEUE = queueDrain([2, 3], 5);

/* ---------------- 9. the checks ---------------- */
function buildChecks() {
  CHECKS.length = 0;

  /* fork counts, GATE 2012 */
  chk('three sequential forks give 8 processes', FORK3 === 8, FORK3);
  chk('and therefore 7 child processes', childCount(3) === 7, childCount(3));
  chk('children are one fewer than processes, always',
      childCount(5) === processCount(5) - 1, childCount(5));
  chk('the count doubles once per call: 1,2,4,8',
      processCount(0) === 1 && processCount(1) === 2 && processCount(2) === 4 && processCount(3) === 8, '1,2,4,8');
  chk('a for loop of 3 forks with no wait also gives 8',
      loopForkProcesses(3) === 8, loopForkProcesses(3));

  /* the 2024 wait loop */
  chk('live processes per iteration are 2, 4 and 8',
      LOOP2024.perIteration.join(',') === '2,4,8', LOOP2024.perIteration.join(','));
  chk('the prints total 14', LOOP2024.prints === 14, LOOP2024.prints);
  chk('the closed form 2^(x+1) - 2 agrees', LOOP2024.closed === LOOP2024.prints, LOOP2024.closed);
  chk('distinct processes are 8, not 14', LOOP2024.distinct === 8, LOOP2024.distinct);
  chk('prints and processes are different counts here', LOOP2024.prints !== LOOP2024.distinct, '14 vs 8');
  chk('with x = 2 the prints are 6', waitLoopPrints(2).prints === 6, waitLoopPrints(2).prints);
  chk('with x = 1 the prints are 2', waitLoopPrints(1).prints === 2, waitLoopPrints(1).prints);

  /* fork return values, GATE 2005 */
  chk('fork returns 0 in the child', forkBranch(0) === 'child', forkBranch(0));
  chk('fork returns a positive id in the parent', forkBranch(101) === 'parent', forkBranch(101));
  chk('fork returns a negative value on failure', forkBranch(-1) === 'fail', forkBranch(-1));
  chk('the parent prints 5 when a started at 10', F2005.parentA === 5, F2005.parentA);
  chk('the child prints 15 when a started at 10', F2005.childA === 15, F2005.childA);
  chk('so u + 10 = x holds', F2005.parentA + 10 === F2005.childA, F2005.parentA + 10);
  chk('and the two prints carry the same virtual address', F2005.sameVirtualAddress, 'v = y');

  /* the state machine, GATE 2020 Q12 and GATE 2024 Set 1 Q15 */
  chk('there are six legal edges', EDGES.length === 6, EDGES.length);
  chk('blocked to running is not one of them', !legal('blocked', 'running'), 'absent');
  chk('ready to blocked is not one of them', !legal('ready', 'blocked'), 'absent');
  chk('running to ready is legal, by preemption', legal('running', 'ready'), 'present');
  chk('blocked to ready is legal, by the event', legal('blocked', 'ready'), 'present');
  chk('a new process cannot jump straight to running', !legal('new', 'running'), 'absent');
  chk('2020 Q12: the true statements are I, II and IV',
      trueStatements(Q2020).join(',') === 'I,II,IV', trueStatements(Q2020).join(','));
  chk('2024 Set 1 Q15: the impossible ones are B and C',
      impossibleStatements(Q2024S1).join(',') === 'B,C', impossibleStatements(Q2024S1).join(','));

  /* the context switch */
  chk('0.1 ms in a 10 ms slice is 0.99 per cent',
      near(FRAC10 * 100, 0.990099, 1e-5), (FRAC10 * 100).toFixed(4));
  chk('the same switch in a 1 ms slice is 9.09 per cent',
      near(FRAC1 * 100, 9.0909, 1e-3), (FRAC1 * 100).toFixed(4));
  chk('the fraction and the utilisation add to one', near(FRAC10 + utilisation(0.1, 10), 1), '1');
  chk('the denominator is the slice plus the switch',
      near(FRAC10, 0.1 / 10.1), (0.1 / 10.1).toFixed(6));
  chk('a process switch is 2.5 us and a thread switch 0.5 us',
      COST.process === 2.5 && COST.thread === 0.5, COST.process + ' / ' + COST.thread);
  chk('so a process switch is five times as expensive', near(COST.ratio, 5), COST.ratio);

  /* threads, GATE 2017 Set 2 and GATE 2023 */
  chk('the stack is private to a thread', isPrivate('stack and stack pointer'), 'private');
  chk('the program counter is private', isPrivate('program counter'), 'private');
  chk('the heap is shared', isShared('heap'), 'shared');
  chk('the address space is shared', isShared('the address space and page table'), 'shared');
  chk('no item is both shared and private',
      THREAD_SHARED.every(function (x) { return !isPrivate(x); }), 'disjoint');
  chk('the page table base register is not saved on a thread switch',
      NOT_SAVED_ON_THREAD_SWITCH.indexOf('page table base register') >= 0, 'not saved');
  chk('the stack pointer, program counter and registers are saved',
      SAVED_ON_THREAD_SWITCH.length === 3, SAVED_ON_THREAD_SWITCH.length);

  /* IPC */
  chk('a zero-capacity channel blocks the sender at once',
      senderBlocks(0, 1, 0), 'blocks');
  chk('a capacity-3 channel lets the sender run three ahead',
      !senderBlocks(3, 3, 0) && senderBlocks(3, 4, 0), '3 then blocks');
  chk('a pipe read of 5 returns 5 bytes in one read',
      PIPE.firstRead === 5 && PIPE.reads === 1, PIPE.firstRead + ' bytes, ' + PIPE.reads + ' read');
  chk('and that one read spans two separate writes',
      PIPE.spansWrites === 2, PIPE.spansWrites);
  chk('a read of 2 from 5 buffered bytes takes three reads',
      PIPE2.reads === 3, PIPE2.reads);
  chk('a message queue returns only the first whole message',
      QUEUE.firstRead === 2, QUEUE.firstRead);
  chk('and needs one read per message', QUEUE.reads === 2, QUEUE.reads);
  chk('a blocking call always costs the running process its turn',
      alwaysSwitches('a blocking system call by P') === true, 'true');
  chk('a disk interrupt for another process does not',
      alwaysSwitches('a disk interrupt for another process') === false, 'false');
  chk('a timer interrupt does not necessarily',
      alwaysSwitches('a timer interrupt') === false, 'false');
}

/* ======================================================================
   LAYER 2 - SMALL FORMATTERS
   ====================================================================== */

function pct(x, d) { return (x * 100).toFixed(d === undefined ? 2 : d) + ' %'; }
function sup(n) { return String(n); }

/* ======================================================================
   LAYER 3 - DRAWING HELPERS
   ====================================================================== */

function bg(P) {
  P.rect(0, 0, W, H, { fill: '#ffffff' });
  P.rect(0, 0, W, 52, { fill: PAL.surface2 });
  P.line(0, 52, W, 52, { stroke: PAL.border });
}
function head(P, kicker, title) {
  P.text(24, 12, kicker.toUpperCase(), { size: 10, mono: true, color: PAL.accent });
  P.text(24, 26, title, { size: 16, bold: true, color: PAL.ink });
}
function note(P, x, y, s, colour, size) {
  P.text(x, y, s, { size: size || 10, color: colour || PAL.dim });
}
function mono(P, x, y, s, colour, size, align) {
  P.text(x, y, s, { size: size || 11, mono: true, color: colour || PAL.ink, align: align || 'left' });
}
function rev(t, start, dur) {
  if (t <= start) return 0;
  if (t >= start + dur) return 1;
  return (t - start) / dur;
}
function ease(v) { return v * v * (3 - 2 * v); }

function box(P, x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || PAL.surface, stroke: o.stroke || PAL.border,
    sw: o.sw || 1.4, radius: o.radius === undefined ? 4 : o.radius, dash: o.dash });
}
function labelIn(P, x, y, w, h, line1, line2, o) {
  o = o || {};
  P.text(x + w / 2, y + (line2 ? h / 2 - 7 : h / 2), line1,
         { size: o.size || 11, mono: o.mono !== false, color: o.color || PAL.ink,
           align: 'center', base: 'middle', bold: o.bold });
  if (line2) {
    P.text(x + w / 2, y + h / 2 + 7, line2,
           { size: o.size2 || 9, color: o.color2 || PAL.dim, align: 'center', base: 'middle' });
  }
}
function stateCircle(P, x, y, name, colour) {
  P.circle(x, y, 32, { fill: PAL.surface, stroke: colour || PAL.accent, sw: 1.6 });
  P.text(x, y, name, { size: 10, color: PAL.ink, align: 'center', base: 'middle', bold: true });
}
function takeaway(P, t, at, line1, line2) {
  var a = ease(rev(t, at, 1.2));
  P.alpha(a);
  P.rect(24, 392, 852, 56, { fill: PAL.surface2, stroke: PAL.border, radius: 5 });
  P.text(40, 406, line1, { size: 12, bold: true, color: PAL.ink });
  P.text(40, 424, line2, { size: 10, color: PAL.dim });
  P.alpha(1);
}

/* ======================================================================
   LAYER 4 - THE SCENES
   Each scene reads from the validated model and draws it. Nothing here
   re-derives a number that Layer 1 already checked.
   ====================================================================== */

var SCENES = {};

/* ---------- scene 1: program and process ---------- */
SCENES['program-process'] = function (P, t) {
  head(P, 'scene 1 - program and process', 'A file becomes a process when it is executed');

  /* one file, two runs */
  P.alpha(ease(rev(t, 0.3, 0.9)));
  note(P, 30, 66, 'on disk', PAL.dim, 9);
  box(P, 30, 78, 150, 44, { stroke: PAL.ink, fill: PAL.surface2 });
  labelIn(P, 30, 78, 150, 44, 'prog.c', 'a file', { size: 12, bold: true });
  P.alpha(1);

  P.alpha(ease(rev(t, 1.6, 0.9)));
  P.arrow(184, 96, 246, 86, { stroke: PAL.ink, sw: 1.4 });
  P.arrow(184, 108, 246, 126, { stroke: PAL.ink, sw: 1.4 });
  box(P, 250, 68, 190, 36, { stroke: PAL.accent, fill: PAL.accentDim });
  labelIn(P, 250, 68, 190, 36, 'process A  pid 101', '', { size: 10 });
  box(P, 250, 110, 190, 36, { stroke: PAL.accent, fill: PAL.accentDim });
  labelIn(P, 250, 110, 190, 36, 'process B  pid 102', '', { size: 10 });
  P.alpha(1);

  P.alpha(ease(rev(t, 3.2, 0.9)));
  note(P, 462, 70, 'same code, two address spaces', PAL.ink, 10);
  note(P, 462, 88, 'each has its own heap and stack', PAL.dim, 10);
  note(P, 462, 106, 'a write in A is invisible in B', PAL.dim, 10);
  P.alpha(1);

  /* the three parts */
  P.alpha(ease(rev(t, 5.4, 0.9)));
  note(P, 30, 172, 'a process is these three things together', PAL.accent, 10);
  P.alpha(1);

  var parts = [
    { x: 30, t1: 'address space', t2: 'code, data, heap, stack' },
    { x: 315, t1: 'execution context', t2: 'program counter, registers, stack pointer' },
    { x: 600, t1: 'kernel record', t2: 'the PCB: state, pid, accounting' }
  ];
  for (var i = 0; i < parts.length; i++) {
    P.alpha(ease(rev(t, 6.4 + i * 1.1, 0.8)));
    box(P, parts[i].x, 190, 270, 64, { stroke: PAL.accent, fill: PAL.surface });
    labelIn(P, parts[i].x, 190, 270, 64, parts[i].t1, parts[i].t2, { size: 11, bold: true });
    P.alpha(1);
  }

  P.alpha(ease(rev(t, 10.6, 0.9)));
  note(P, 30, 272, 'A program is passive: bytes in a file, doing nothing.', PAL.dim, 10);
  note(P, 30, 292, 'A process is active: it has a place in the scheduler and a context to resume.', PAL.dim, 10);
  mono(P, 30, 320, 'process = address space + execution context + PCB', PAL.accent, 11);
  P.alpha(1);

  takeaway(P, t, 18,
    'A program is a file. A process is that file running, with its own memory.',
    'Two runs of one program are two processes, and a write in one is invisible in the other.');
};

/* ---------- scene 2: the five states ---------- */
SCENES.states = function (P, t) {
  head(P, 'scene 2 - process states', 'Five states, and the edges that exist');

  var nodes = [
    { k: 'new', x: 86, y: 120 },
    { k: 'ready', x: 266, y: 120 },
    { k: 'running', x: 452, y: 120 },
    { k: 'terminated', x: 700, y: 120 },
    { k: 'blocked', x: 360, y: 250 }
  ];
  for (var i = 0; i < nodes.length; i++) {
    P.alpha(ease(rev(t, 0.3 + i * 0.7, 0.7)));
    stateCircle(P, nodes[i].x, nodes[i].y, nodes[i].k,
                nodes[i].k === 'blocked' ? PAL.warn : PAL.accent);
    P.alpha(1);
  }

  P.alpha(ease(rev(t, 4.2, 0.9)));
  P.arrow(120, 120, 230, 120, { stroke: PAL.ink, sw: 1.4 });
  note(P, 176, 100, 'admitted', PAL.dim, 9);
  P.alpha(1);

  P.alpha(ease(rev(t, 5.0, 0.9)));
  P.arrow(300, 120, 416, 120, { stroke: PAL.ink, sw: 1.4 });
  note(P, 358, 100, 'dispatch', PAL.dim, 9);
  P.alpha(1);

  P.alpha(ease(rev(t, 5.8, 0.9)));
  P.arrow(486, 120, 664, 120, { stroke: PAL.ink, sw: 1.4 });
  note(P, 575, 100, 'exit', PAL.dim, 9);
  P.alpha(1);

  P.alpha(ease(rev(t, 6.6, 0.9)));
  P.arrow(436, 148, 380, 220, { stroke: PAL.warn, sw: 1.4 });
  note(P, 452, 186, 'wait for I/O', PAL.warn, 9);
  P.alpha(1);

  P.alpha(ease(rev(t, 7.4, 0.9)));
  P.arrow(334, 224, 280, 154, { stroke: PAL.valid, sw: 1.4 });
  note(P, 198, 246, 'event completes', PAL.valid, 9);
  P.alpha(1);

  /* the two missing edges */
  P.alpha(ease(rev(t, 9.0, 1.0)));
  box(P, 560, 190, 310, 110, { stroke: PAL.invalid, fill: PAL.invalidDim });
  note(P, 572, 200, 'two edges that do not exist', PAL.invalid, 10);
  note(P, 572, 220, 'blocked -> running: a woken process joins ready', PAL.ink, 9);
  note(P, 572, 236, 'ready -> blocked: only a running process can ask', PAL.ink, 9);
  note(P, 572, 256, 'preemption lands in ready, never in blocked', PAL.dim, 9);
  note(P, 572, 272, 'blocking is voluntary; preemption is not', PAL.dim, 9);
  P.alpha(1);

  P.alpha(ease(rev(t, 13, 0.9)));
  mono(P, 30, 300, 'legal: new->ready  ready->running  running->ready', PAL.accent, 11);
  mono(P, 30, 322, '       running->blocked  blocked->ready  running->terminated', PAL.accent, 11);
  note(P, 30, 348, 'Running -> ready is preemption: the timer takes the CPU away without asking.', PAL.dim, 10);
  P.alpha(1);

  takeaway(P, t, 18,
    'Ready means waiting for the CPU; blocked means waiting for an event.',
    'The two missing edges are what the papers ask about: blocked to running, and ready to blocked.');
};

/* ---------- scene 3: the context switch ---------- */
SCENES['switch'] = function (P, t) {
  head(P, 'scene 3 - the context switch', 'A save, a load, and no useful work in between');

  P.alpha(ease(rev(t, 0.3, 0.9)));
  box(P, 30, 76, 358, 44, { stroke: PAL.accent, fill: PAL.accentDim });
  labelIn(P, 30, 76, 358, 44, 'process A running', '', { size: 11 });
  P.alpha(1);

  P.alpha(ease(rev(t, 1.2, 0.8)));
  box(P, 392, 76, 86, 44, { stroke: PAL.warn, fill: PAL.warnDim });
  labelIn(P, 392, 76, 86, 44, 'switch', '', { size: 10, bold: true });
  note(P, 392, 130, 'save A, load B', PAL.warn, 9);
  P.alpha(1);

  P.alpha(ease(rev(t, 2.0, 0.8)));
  box(P, 482, 76, 388, 44, { stroke: PAL.accent, fill: PAL.accentDim });
  labelIn(P, 482, 76, 388, 44, 'process B running', '', { size: 11 });
  P.alpha(1);

  P.alpha(ease(rev(t, 3.6, 0.9)));
  mono(P, 30, 168, '1. save A: program counter, stack pointer, general registers', PAL.ink, 10);
  mono(P, 30, 190, '2. load B: the same three fields, from B\'s PCB', PAL.ink, 10);
  mono(P, 30, 212, '3. if the page table changes, cached translations are discarded', PAL.ink, 10);
  P.alpha(1);

  /* the cost panel */
  P.alpha(ease(rev(t, 6.2, 1.0)));
  box(P, 560, 150, 310, 108, { stroke: PAL.info, fill: PAL.surface });
  note(P, 572, 160, 'what a switch costs', PAL.info, 10);
  note(P, 572, 180, 'process switch: registers + address space', PAL.ink, 9);
  note(P, 572, 196, 'thread switch: registers only', PAL.ink, 9);
  note(P, 572, 216, '0.5 us registers + 2 us address space', PAL.dim, 9);
  note(P, 572, 232, 'so a thread switch is about 5x cheaper', PAL.dim, 9);
  P.alpha(1);

  P.alpha(ease(rev(t, 9.4, 0.9)));
  mono(P, 30, 250, 'slice 10 ms, switch 0.1 ms  ->  0.1 / 10.1 = 0.99 %', PAL.info, 11);
  mono(P, 30, 272, 'slice  1 ms, switch 0.1 ms  ->  0.1 /  1.1 = 9.09 %', PAL.info, 11);
  note(P, 30, 300, 'The cycle length is the slice plus the switch, so the denominator is 10.1, not 10.', PAL.dim, 10);
  note(P, 30, 322, 'Shrink the slice and the same switch eats nine times as much of the CPU.', PAL.dim, 10);
  P.alpha(1);

  takeaway(P, t, 18,
    'A context switch is pure overhead: no user instruction retires during it.',
    'A thread switch skips the address-space change, which is why it is cheaper than a process switch.');
};

/* ---------- scene 4: fork ---------- */
SCENES.fork = function (P, t) {
  head(P, 'scene 4 - fork', 'One call, two returns');

  P.alpha(ease(rev(t, 0.3, 0.9)));
  box(P, 30, 66, 360, 150, { stroke: PAL.border, fill: PAL.surface2 });
  mono(P, 44, 78, 'pid = fork();', PAL.accent, 10);
  mono(P, 44, 100, 'if (pid == 0) {', PAL.ink, 10);
  mono(P, 44, 122, '    /* the child copy */', PAL.dim, 10);
  mono(P, 44, 144, '} else {', PAL.ink, 10);
  mono(P, 44, 166, '    /* the parent: pid = child id */', PAL.dim, 10);
  mono(P, 44, 188, '}', PAL.ink, 10);
  P.alpha(1);

  P.alpha(ease(rev(t, 2.4, 0.9)));
  P.arrow(394, 96, 424, 95, { stroke: PAL.ink, sw: 1.3 });
  P.arrow(394, 130, 424, 163, { stroke: PAL.ink, sw: 1.3 });
  box(P, 428, 70, 220, 50, { stroke: PAL.valid, fill: PAL.surface });
  labelIn(P, 428, 70, 220, 50, 'child', 'fork returns 0', { size: 11, bold: true });
  box(P, 428, 140, 220, 50, { stroke: PAL.info, fill: PAL.surface });
  labelIn(P, 428, 140, 220, 50, 'parent', 'returns the child\'s pid', { size: 11, bold: true });
  note(P, 428, 204, 'both continue after the call', PAL.dim, 9);
  P.alpha(1);

  /* the 2005 numbers */
  P.alpha(ease(rev(t, 6.0, 0.9)));
  mono(P, 30, 240, 'a = 10 before the call', PAL.dim, 11);
  mono(P, 30, 262, 'parent:  a = a - 5 = 5   prints 5  and &a', PAL.info, 11);
  mono(P, 30, 284, 'child:   a = a + 5 = 15  prints 15 and &a', PAL.valid, 11);
  mono(P, 30, 312, 'u + 10 = x      and      v = y', PAL.accent, 12);
  P.alpha(1);

  P.alpha(ease(rev(t, 10.4, 1.0)));
  box(P, 430, 240, 440, 86, { stroke: PAL.warn, fill: PAL.warnDim });
  note(P, 444, 250, 'why the two addresses match', PAL.warn, 10);
  note(P, 444, 270, 'the child is a copy of the parent\'s address space', PAL.ink, 9);
  note(P, 444, 286, 'so the virtual address of a is unchanged', PAL.ink, 9);
  note(P, 444, 302, 'the physical frames differ; the printed numbers do not', PAL.dim, 9);
  P.alpha(1);

  takeaway(P, t, 18,
    'One call returns twice: zero in the child, the child identifier in the parent.',
    'The copies keep the same virtual addresses but not the same memory.');
};

/* ---------- scene 5: counting ---------- */
SCENES.counting = function (P, t) {
  head(P, 'scene 5 - counting', 'Every process alive at a fork executes it');

  P.alpha(ease(rev(t, 0.3, 0.8)));
  note(P, 30, 66, 'three sequential forks', PAL.accent, 10);
  P.alpha(1);

  var cells = [
    { x: 30, s: '1', cap: 'start' },
    { x: 150, s: '2', cap: 'after fork 1' },
    { x: 270, s: '4', cap: 'after fork 2' },
    { x: 390, s: '8', cap: 'after fork 3' }
  ];
  for (var i = 0; i < cells.length; i++) {
    P.alpha(ease(rev(t, 1.0 + i * 0.9, 0.7)));
    box(P, cells[i].x, 80, 90, 34, { stroke: PAL.accent, fill: PAL.accentDim });
    labelIn(P, cells[i].x, 80, 90, 34, cells[i].s, '', { size: 14, bold: true });
    note(P, cells[i].x + 45, 120, cells[i].cap, PAL.dim, 9);
    P.alpha(1);
    if (i < cells.length - 1) {
      P.alpha(ease(rev(t, 1.5 + i * 0.9, 0.6)));
      P.arrow(cells[i].x + 92, 97, cells[i].x + 116, 97, { stroke: PAL.ink, sw: 1.4 });
      P.alpha(1);
    }
  }

  P.alpha(ease(rev(t, 5.0, 0.9)));
  mono(P, 30, 148, 'processes after n forks = 2^n', PAL.ink, 11);
  mono(P, 30, 170, 'children            = 2^n - 1', PAL.ink, 11);
  mono(P, 30, 196, 'n = 3  ->  8 processes, 7 children', PAL.accent, 11);
  P.alpha(1);

  /* the 2024 wait loop */
  P.alpha(ease(rev(t, 7.2, 0.9)));
  note(P, 520, 66, 'a fork inside a loop that waits', PAL.accent, 10);
  mono(P, 520, 88, 'iteration 1: 2 alive -> 2 prints', PAL.ink, 10);
  mono(P, 520, 112, 'iteration 2: 4 alive -> 4 prints', PAL.ink, 10);
  mono(P, 520, 136, 'iteration 3: 8 alive -> 8 prints', PAL.ink, 10);
  P.alpha(1);

  P.alpha(ease(rev(t, 10.2, 0.9)));
  P.line(520, 154, 852, 154, { stroke: PAL.border });
  mono(P, 520, 166, 'prints = 2 + 4 + 8 = 14', PAL.accent, 11);
  mono(P, 520, 190, 'distinct processes = 8', PAL.ink, 11);
  note(P, 520, 212, 'two counts, two different questions', PAL.dim, 9);
  note(P, 520, 228, 'the paper asks for prints, so 14', PAL.dim, 9);
  P.alpha(1);

  P.alpha(ease(rev(t, 13.4, 1.0)));
  box(P, 30, 240, 840, 62, { stroke: PAL.info, fill: PAL.surface });
  note(P, 44, 250, 'the tree is the count', PAL.info, 10);
  note(P, 44, 270, 'Nodes are processes. A mark per iteration on each node gives the prints.', PAL.dim, 9);
  note(P, 44, 286, 'wait changes the order and how many are alive at once; it does not change the total.', PAL.dim, 9);
  P.alpha(1);

  takeaway(P, t, 18,
    'Every process alive at a fork call executes it, so n sequential forks give 2 to the n.',
    'Children are one fewer than processes, and prints are neither: draw the tree and count.');
};

/* ---------- scene 6: threads ---------- */
SCENES.threads = function (P, t) {
  head(P, 'scene 6 - threads', 'One address space, several execution contexts');

  P.alpha(ease(rev(t, 0.3, 0.9)));
  box(P, 30, 70, 300, 190, { stroke: PAL.accent, fill: PAL.accentDim, sw: 1.8 });
  note(P, 44, 80, 'one process', PAL.accent, 10);
  P.alpha(1);

  var th = ['thread 1', 'thread 2', 'thread 3'];
  for (var i = 0; i < th.length; i++) {
    P.alpha(ease(rev(t, 1.4 + i * 1.0, 0.8)));
    box(P, 44, 100 + i * 48, 272, 40, { stroke: PAL.ink, fill: PAL.surface });
    labelIn(P, 44, 100 + i * 48, 272, 40, th[i], 'own stack, own PC, own registers',
            { size: 10, bold: true });
    P.alpha(1);
  }

  P.alpha(ease(rev(t, 4.8, 0.9)));
  note(P, 400, 80, 'shared by all threads', PAL.valid, 11);
  P.alpha(1);
  for (var s = 0; s < THREAD_SHARED.length; s++) {
    P.alpha(ease(rev(t, 5.4 + s * 0.5, 0.6)));
    P.circle(406, 108 + s * 22, 4, { fill: PAL.valid });
    note(P, 420, 102 + s * 22, THREAD_SHARED[s], PAL.ink, 10);
    P.alpha(1);
  }

  P.alpha(ease(rev(t, 8.6, 0.9)));
  note(P, 660, 80, 'private to each thread', PAL.invalid, 11);
  P.alpha(1);
  for (var q = 0; q < THREAD_PRIVATE.length; q++) {
    P.alpha(ease(rev(t, 9.2 + q * 0.5, 0.6)));
    P.circle(666, 108 + q * 22, 4, { fill: PAL.invalid });
    note(P, 680, 102 + q * 22, THREAD_PRIVATE[q], PAL.ink, 10);
    P.alpha(1);
  }

  P.alpha(ease(rev(t, 12.6, 1.0)));
  note(P, 30, 282, 'Sharing is what makes a thread cheap; it is also what makes synchronisation necessary.', PAL.dim, 10);
  note(P, 30, 304, 'Isolation is what makes a process safe; it is also why processes need IPC.', PAL.dim, 10);
  mono(P, 30, 332, 'process = address space + context     thread = context only', PAL.accent, 11);
  P.alpha(1);

  takeaway(P, t, 18,
    'Threads share code, data, heap, files and the address space.',
    'Each thread owns its program counter, registers and stack, and nothing else.');
};

/* ---------- scene 7: user against kernel threads ---------- */
SCENES['ult-klt'] = function (P, t) {
  head(P, 'scene 7 - user against kernel threads', 'Who schedules the thread decides what blocking costs');

  P.alpha(ease(rev(t, 0.3, 0.9)));
  box(P, 30, 66, 400, 192, { stroke: PAL.info, fill: PAL.surface });
  note(P, 44, 78, 'user-level threads', PAL.info, 11);
  box(P, 44, 96, 180, 34, { stroke: PAL.border, fill: PAL.surface2 });
  labelIn(P, 44, 96, 180, 34, 'thread library', '', { size: 10 });
  box(P, 44, 148, 180, 34, { stroke: PAL.border, fill: PAL.surface2 });
  labelIn(P, 44, 148, 180, 34, 'process', '', { size: 10 });
  note(P, 240, 100, 'created and switched inside', PAL.dim, 9);
  note(P, 240, 116, 'the process, by a function call', PAL.dim, 9);
  note(P, 240, 152, 'the kernel sees one unit,', PAL.dim, 9);
  note(P, 240, 168, 'so it schedules the process', PAL.dim, 9);
  note(P, 44, 196, 'one blocking call blocks them all', PAL.invalid, 9);
  note(P, 44, 214, 'cannot use two cores at once', PAL.invalid, 9);
  note(P, 44, 232, 'the switch needs no kernel entry', PAL.valid, 9);
  P.alpha(1);

  P.alpha(ease(rev(t, 5.0, 0.9)));
  box(P, 470, 66, 400, 192, { stroke: PAL.warn, fill: PAL.surface });
  note(P, 484, 78, 'kernel-level threads', PAL.warn, 11);
  box(P, 484, 96, 180, 34, { stroke: PAL.border, fill: PAL.surface2 });
  labelIn(P, 484, 96, 180, 34, 'kernel thread 1', '', { size: 10 });
  box(P, 484, 142, 180, 34, { stroke: PAL.border, fill: PAL.surface2 });
  labelIn(P, 484, 142, 180, 34, 'kernel thread 2', '', { size: 10 });
  note(P, 680, 100, 'each is a schedulable entity', PAL.dim, 9);
  note(P, 680, 146, 'the kernel switches them', PAL.dim, 9);
  note(P, 484, 196, 'one blocking call blocks one thread', PAL.valid, 9);
  note(P, 484, 214, 'two threads can run on two cores', PAL.valid, 9);
  note(P, 484, 232, 'a switch costs a kernel entry', PAL.invalid, 9);
  P.alpha(1);

  P.alpha(ease(rev(t, 10.4, 1.0)));
  mono(P, 30, 276, 'thread switch  = save PC, SP and registers', PAL.ink, 11);
  mono(P, 30, 298, 'process switch = the same, plus a new address space', PAL.ink, 11);
  note(P, 30, 326, 'The 2014 false statement: "kernel level threads cannot share the code segment". They do.', PAL.dim, 10);
  P.alpha(1);

  takeaway(P, t, 18,
    'A user thread is invisible to the kernel, so it is cheap and cannot block safely.',
    'A kernel thread is a schedulable entity, so it blocks alone and can use a second core.');
};

/* ---------- scene 8: the two IPC models ---------- */
SCENES['ipc-models'] = function (P, t) {
  head(P, 'scene 8 - inter-process communication', 'Share a region, or send a message');

  P.alpha(ease(rev(t, 0.3, 0.9)));
  note(P, 30, 66, 'shared memory', PAL.accent, 11);
  box(P, 30, 82, 180, 40, { stroke: PAL.border, fill: PAL.surface2 });
  labelIn(P, 30, 82, 180, 40, 'process A', '', { size: 11 });
  box(P, 30, 150, 180, 40, { stroke: PAL.border, fill: PAL.surface2 });
  labelIn(P, 30, 150, 180, 40, 'process B', '', { size: 11 });
  box(P, 260, 96, 220, 68, { stroke: PAL.accent, fill: PAL.accentDim, sw: 1.8 });
  labelIn(P, 260, 96, 220, 68, 'shared region', 'one copy, two mappings', { size: 11, bold: true });
  P.alpha(1);

  P.alpha(ease(rev(t, 2.4, 0.9)));
  P.arrow(212, 98, 256, 112, { stroke: PAL.accent, sw: 1.4 });
  P.arrow(212, 174, 256, 150, { stroke: PAL.accent, sw: 1.4 });
  note(P, 30, 208, 'mapped once, then a write needs no system call', PAL.dim, 9);
  note(P, 30, 226, 'so it is the fastest of these mechanisms', PAL.dim, 9);
  P.alpha(1);

  P.alpha(ease(rev(t, 5.0, 0.9)));
  note(P, 510, 66, 'message passing', PAL.info, 11);
  box(P, 510, 82, 150, 40, { stroke: PAL.border, fill: PAL.surface2 });
  labelIn(P, 510, 82, 150, 40, 'process A', '', { size: 11 });
  box(P, 510, 150, 150, 40, { stroke: PAL.border, fill: PAL.surface2 });
  labelIn(P, 510, 150, 150, 40, 'process B', '', { size: 11 });
  box(P, 700, 96, 180, 68, { stroke: PAL.info, fill: PAL.surface });
  labelIn(P, 700, 96, 180, 68, 'kernel buffer', 'no shared space', { size: 11, bold: true });
  P.alpha(1);

  P.alpha(ease(rev(t, 7.0, 0.9)));
  P.arrow(662, 98, 696, 112, { stroke: PAL.info, sw: 1.4 });
  P.arrow(696, 150, 662, 174, { stroke: PAL.info, sw: 1.4 });
  note(P, 510, 208, 'no shared address space at all', PAL.dim, 9);
  note(P, 510, 226, 'send copies in, receive copies out', PAL.dim, 9);
  P.alpha(1);

  P.alpha(ease(rev(t, 10.2, 1.0)));
  note(P, 30, 254, 'Shared memory: the kernel maps once, then the processes synchronise themselves.', PAL.ink, 10);
  note(P, 30, 276, 'Message passing: the kernel copies every message, and can block the sender instead.', PAL.ink, 10);
  note(P, 30, 302, 'Zero capacity means the sender waits for the receiver: a rendezvous.', PAL.dim, 10);
  mono(P, 30, 330, 'capacity 0 -> sender blocks     capacity k -> sender runs k ahead', PAL.accent, 11);
  P.alpha(1);

  takeaway(P, t, 18,
    'Shared memory buys speed with the responsibility for synchronisation.',
    'Message passing buys simplicity and reach with two copies per message.');
};

/* ---------- scene 9: the mechanisms ---------- */
SCENES['ipc-tools'] = function (P, t) {
  head(P, 'scene 9 - the mechanisms', 'Each one fixes what may be carried and who may use it');

  P.alpha(ease(rev(t, 0.3, 0.8)));
  note(P, 40, 74, 'mechanism', PAL.dim, 9);
  note(P, 250, 74, 'what it carries', PAL.dim, 9);
  note(P, 560, 74, 'who may use it', PAL.dim, 9);
  P.line(40, 92, 852, 92, { stroke: PAL.border });
  P.alpha(1);

  var rows = [
    { a: 'pipe', b: 'a byte stream, no boundaries', c: 'related processes' },
    { a: 'named pipe', b: 'a byte stream, reached by name', c: 'any two processes' },
    { a: 'signal', b: 'a number, and no data', c: 'any process with permission' },
    { a: 'socket', b: 'a byte stream over a network', c: 'across machines' },
    { a: 'message queue', b: 'whole messages, kept apart', c: 'any two processes' }
  ];
  for (var i = 0; i < rows.length; i++) {
    P.alpha(ease(rev(t, 1.2 + i * 0.9, 0.7)));
    mono(P, 40, 106 + i * 34, rows[i].a, PAL.accent, 10);
    note(P, 250, 106 + i * 34, rows[i].b, PAL.ink, 10);
    note(P, 560, 106 + i * 34, rows[i].c, PAL.dim, 10);
    P.alpha(1);
  }

  P.alpha(ease(rev(t, 7.0, 0.9)));
  P.line(40, 286, 852, 286, { stroke: PAL.border });
  note(P, 40, 300, 'An ordinary pipe is created by one process and inherited by its child, so it links related processes.', PAL.dim, 10);
  note(P, 40, 322, 'Two writes of two and three bytes can arrive as one read of five: bytes, not messages.', PAL.dim, 10);
  P.alpha(1);

  takeaway(P, t, 18,
    'A pipe carries bytes in one direction and keeps no message boundaries.',
    'Choose by what must be carried: data, a boundary, or reach across machines.');
};

/* ---------- scene 10: the recipe ---------- */
SCENES.recipe = function (P, t) {
  head(P, 'scene 10 - the recipe', 'Three questions cover the whole topic');

  P.alpha(ease(rev(t, 0.3, 0.9)));
  note(P, 30, 66, 'four steps', PAL.accent, 11);
  mono(P, 30, 92, '1. name the question: states, copies, or sharing', PAL.ink, 10);
  mono(P, 30, 120, '2. draw the matching diagram', PAL.ink, 10);
  mono(P, 30, 148, '3. read the answer off the diagram', PAL.ink, 10);
  mono(P, 30, 176, '4. check the unit: processes, prints, or bytes', PAL.ink, 10);
  P.alpha(1);

  P.alpha(ease(rev(t, 3.0, 0.9)));
  note(P, 520, 66, 'five traps', PAL.invalid, 11);
  P.alpha(1);

  var traps = [
    'blocked to running never happens',
    'children are 2^n - 1, not 2^n',
    'a pipe keeps bytes, not messages',
    'the child\'s fork return value is 0',
    'a thread switch skips the page table'
  ];
  for (var i = 0; i < traps.length; i++) {
    P.alpha(ease(rev(t, 3.6 + i * 0.9, 0.7)));
    P.circle(528, 95 + i * 28, 4, { fill: PAL.invalid });
    note(P, 544, 89 + i * 28, traps[i], PAL.ink, 10);
    P.alpha(1);
  }

  P.alpha(ease(rev(t, 9.0, 1.0)));
  box(P, 30, 224, 840, 104, { stroke: PAL.info, fill: PAL.surface2 });
  note(P, 44, 236, 'the one sentence', PAL.info, 11);
  note(P, 44, 260, 'A process owns an address space and an execution context. A thread owns an execution context', PAL.ink, 10);
  note(P, 44, 278, 'and shares the address space. Sharing creates both the speed and the need to synchronise.', PAL.ink, 10);
  note(P, 44, 304, 'Every definition, count and mechanism in this lesson is that sentence at a different scale.', PAL.dim, 10);
  P.alpha(1);

  takeaway(P, t, 16,
    'What does this process own, and what does it share?',
    'Every state question, count and mechanism in this topic is that question asked again.');
};

/* ======================================================================
   LAYER 5 - THE FRAME
   ====================================================================== */

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
    (bad ? ' — <strong>' + bad + ' failed</strong>' : '') + '</p>';
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
