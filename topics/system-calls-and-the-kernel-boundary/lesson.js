/* ==========================================================================
   system-calls-and-the-kernel-boundary — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The behaviour modelled here is the one the Sources tab cites: fork gives the
   child copies of the descriptor table that refer to the SAME open file
   description; execve replaces the program image and preserves the descriptors;
   stdout is line buffered at a terminal and fully buffered elsewhere. The
   process-tree, buffer and descriptor models below are executed, and both
   previous-year counts are produced by running them rather than by asserting an
   answer.
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

/* ---------- the system call numbers, from two independent listings ---------- */

/* Listing A: arch/x86/entry/syscalls/syscall_64.tbl in the Linux kernel tree.
   Listing B: the searchable x86-64 table derived from the same file. They are
   transcribed separately here so that a typo in one is caught by the other. */
var TABLE_A = { read: 0, write: 1, open: 2, close: 3, dup: 32, dup2: 33,
                getpid: 39, clone: 56, fork: 57, execve: 59, exit: 60, wait4: 61 };
var TABLE_B = { read: 0, write: 1, open: 2, close: 3, dup: 32, dup2: 33,
                getpid: 39, clone: 56, fork: 57, execve: 59, exit: 60, wait4: 61 };

var CALL_NAMES = Object.keys(TABLE_A);
var SYSCALLS = CALL_NAMES.map(function (n) {
  return { name: n, nr: TABLE_A[n], nr2: TABLE_B[n] };
});

var ERRNO_LOW = -4095, ERRNO_HIGH = -1;   /* the kernel's error window */

/* ---------- fork: how many processes, how many children ---------- */

function processes(n) { return Math.pow(2, n); }
function children(n) { return Math.pow(2, n) - 1; }

/* The 2019 paper: for (i = 0; i < 10; i++) if (i % 2 == 0) fork();
   i takes 0,2,4,6,8, so five forks are reached. */
function evenLoopForks(n) {
  var k = 0;
  for (var i = 0; i < n; i++) if (i % 2 === 0) k++;
  return k;
}
var EVEN_FORKS = evenLoopForks(10);

/* ---------- the 2024 Set 1 loop: fork, printf, wait, x-- ---------- */

/* Route 1: round by round. Every live process forks once per iteration, so the
   population doubles, and every live process prints once. */
function roundsModel(x0) {
  var prints = 0, live = 1, x = x0, rows = [];
  while (x > 0) {
    live *= 2;
    prints += live;
    rows.push({ x: x, live: live, prints: live });
    x--;
  }
  return { prints: prints, live: live, rows: rows };
}

/* Route 2: build the tree. A process created in round r inherits the loop
   counter of that round, so it still has (x0 - r + 1) iterations to print in. */
function treeModel(x0) {
  var nodes = [{ id: 'P', x: x0, round: 0, parent: null }];
  var frontier = [nodes[0]];
  for (var r = 1; r <= x0; r++) {
    var born = [];
    for (var i = 0; i < frontier.length; i++) {
      var c = { id: frontier[i].id + '.' + r, x: x0 - (r - 1), round: r, parent: frontier[i].id };
      nodes.push(c); born.push(c);
    }
    frontier = frontier.concat(born);
  }
  var prints = nodes.reduce(function (a, n) { return a + Math.max(0, n.x); }, 0);
  return { nodes: nodes, prints: prints };
}

var RUN_2024 = roundsModel(3);
var TREE_2024 = treeModel(3);
var CLOSED_2024 = Math.pow(2, 4) - 2;

/* ---------- stdio buffering ---------- */

var BUF = 4096;                       /* the block size used for the arithmetic */
function ceilDiv(a, b) { return Math.floor((a + b - 1) / b); }

/* One print of L bytes, with or without a trailing newline. */
function writesTerminal(prints, bytesPerPrint, hasNewline) {
  /* line buffered: a newline flushes one print; without one nothing flushes
     until exit, which is still one write for the whole run. */
  return hasNewline ? prints : 1;
}
function writesFile(prints, bytesPerPrint) {
  return ceilDiv(prints * bytesPerPrint, BUF);
}

var SMALL = { prints: 5, bytes: 6 };            /* five lines of "hello\n" */
var LARGE = { prints: 2000, bytes: 10 };        /* 20000 bytes */

var BUFFER_ROWS = [
  { label: '5 lines of 6 bytes', term: writesTerminal(SMALL.prints, SMALL.bytes, true),
    file: writesFile(SMALL.prints, SMALL.bytes), bytes: SMALL.prints * SMALL.bytes },
  { label: '2000 lines of 10 bytes', term: writesTerminal(LARGE.prints, LARGE.bytes, true),
    file: writesFile(LARGE.prints, LARGE.bytes), bytes: LARGE.prints * LARGE.bytes }
];

/* ---------- fork copies the unflushed buffer ---------- */

function copiesFlushed(forks, buffered) { return buffered ? processes(forks) : 1; }
var DUP_FORKS = 3;
var DUP_BUFFERED = copiesFlushed(DUP_FORKS, true);
var DUP_LINE = copiesFlushed(DUP_FORKS, false);

/* ---------- file descriptors and open file descriptions ---------- */

function makeDesc(name) { return { name: name, offset: 0, flags: 'O_RDONLY', closeOnExec: false }; }

function readFrom(desc, k) {
  var from = desc.offset;
  desc.offset += k;
  return { from: from, to: desc.offset };
}

/* fork copies the descriptor table; the entries still point at the same
   descriptions, so the offset is shared. */
function forkTable(parentTable) {
  var child = {};
  Object.keys(parentTable).forEach(function (fd) { child[fd] = parentTable[fd]; });
  return child;
}

/* exec keeps every descriptor whose close-on-exec flag is clear. */
function execTable(table) {
  var kept = {};
  Object.keys(table).forEach(function (fd) {
    if (!table[fd].closeOnExec) kept[fd] = table[fd];
  });
  return kept;
}

var SHARED = (function () {
  var d = makeDesc('log.txt');
  var parent = { 3: d };
  var child = forkTable(parent);
  var pRead = readFrom(parent[3], 4);
  var cRead = readFrom(child[3], 4);
  return { parent: pRead, child: cRead, shared: parent[3] === child[3], desc: d };
})();

var SEPARATE = (function () {
  var a = makeDesc('log.txt');
  var b = makeDesc('log.txt');
  var first = readFrom(a, 4);
  var second = readFrom(b, 4);
  return { first: first, second: second, shared: a === b };
})();

var CLOEXEC = (function () {
  var kept = makeDesc('data.bin');
  var dropped = makeDesc('tmp.bin');
  dropped.closeOnExec = true;
  var table = { 3: kept, 5: dropped };
  var after = execTable(table);
  return { before: Object.keys(table).length, after: Object.keys(after).length, keptFd: Object.keys(after).join(',') };
})();

/* ---------- the exit status is a packed integer ---------- */

function exitStatus(status) { return status & 0xff; }
var STATUS_CASES = [0, 7, 255, 256, 258, 512].map(function (s) {
  return { given: s, reported: exitStatus(s) };
});

/* ---------- the two switches, as sets of steps ---------- */

var MODE_STEPS = [
  'save the program counter and status word',
  'switch the mode bit to kernel',
  'jump to the handler through the trap vector',
  'restore the saved state and return to user mode'
];
var PROC_STEPS = MODE_STEPS.concat([
  'run the scheduler to choose another process',
  'save the full register set of the old process',
  'load the page table base of the new process',
  'disturb the translation cache for the new address space'
]);

/* ---------- what execve replaces and what it preserves ---------- */

/* Replaced list: execve(2), "Effect on process attributes". Preserved list: the
   same section's exceptions plus the identity, descriptor and directory facts. */
var EXEC_REPLACED = [
  'the text, data, heap and stack',
  'caught signal handlers, back to default',
  'the alternate signal stack',
  'memory mappings and shared segments',
  'timers and open directory streams',
  'exit handlers, and the floating-point state'
];
var EXEC_PRESERVED = [
  'the process identifier and parent identifier',
  'open descriptors without close-on-exec',
  'the working directory',
  'the umask and the resource limits',
  'the real and effective user and group ids',
  'the ignored-signal settings'
];

/* ---------- derived display values ---------- */

var V = {
  calls: SYSCALLS,
  errLow: ERRNO_LOW, errHigh: ERRNO_HIGH,
  forks3: { processes: processes(3), children: children(3) },
  evenForks: EVEN_FORKS,
  evenChildren: children(EVEN_FORKS),
  run2024: RUN_2024,
  tree2024: { count: TREE_2024.nodes.length, prints: TREE_2024.prints },
  closed2024: CLOSED_2024,
  bufferRows: BUFFER_ROWS,
  bufSize: BUF,
  dup: { forks: DUP_FORKS, buffered: DUP_BUFFERED, line: DUP_LINE },
  shared: SHARED,
  separate: SEPARATE,
  cloexec: CLOEXEC,
  status: STATUS_CASES,
  modeSteps: MODE_STEPS,
  procSteps: PROC_STEPS,
  execReplaced: EXEC_REPLACED,
  execPreserved: EXEC_PRESERVED
};

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

(function () {
  /* 1-4: the call numbers, checked between the two listings and against the
     four numbers this lesson leans on most. */
  var disagree = SYSCALLS.filter(function (s) { return s.nr !== s.nr2; });
  chk('the two syscall listings agree on all 12 numbers', disagree.length === 0,
      disagree.map(function (s) { return s.name; }).join(','));
  chk('read is 0 and write is 1', TABLE_A.read === 0 && TABLE_A.write === 1, '');
  chk('fork 57, execve 59, exit 60, wait4 61',
      TABLE_A.fork === 57 && TABLE_A.execve === 59 && TABLE_A.exit === 60 && TABLE_A.wait4 === 61, '');
  var numbers = SYSCALLS.map(function (s) { return s.nr; });
  chk('the 12 numbers are distinct', new Set(numbers).size === numbers.length, '');

  /* 5-10: the fork counts. */
  chk('3 sequential forks give 8 processes and 7 children',
      V.forks3.processes === 8 && V.forks3.children === 7, '');
  chk('the even-i loop reaches 5 forks in 10 iterations', EVEN_FORKS === 5, String(EVEN_FORKS));
  chk('5 forks give 31 children', V.evenChildren === 31, String(V.evenChildren));
  chk('2024 Set 1: the round model gives 14 prints', RUN_2024.prints === 14, String(RUN_2024.prints));
  chk('2024 Set 1: the population is 8 processes', RUN_2024.live === 8, String(RUN_2024.live));
  chk('2024 Set 1: the tree model agrees with the round model',
      TREE_2024.prints === RUN_2024.prints && TREE_2024.nodes.length === RUN_2024.live,
      TREE_2024.prints + ' vs ' + RUN_2024.prints);
  chk('2024 Set 1: the closed form 2^(k+1)-2 agrees', CLOSED_2024 === RUN_2024.prints, String(CLOSED_2024));

  /* 11-16: buffering. */
  chk('30 bytes fit in one buffer', ceilDiv(30, BUF) === 1, '');
  chk('20000 bytes need 5 buffers', ceilDiv(20000, BUF) === 5, String(ceilDiv(20000, BUF)));
  chk('at a terminal one newline per print means one write per print',
      BUFFER_ROWS[0].term === SMALL.prints, '');
  chk('the large terminal count is 2000', BUFFER_ROWS[1].term === 2000, '');
  chk('the small redirected count is one', BUFFER_ROWS[0].file === 1, '');
  chk('the ratio between the two large columns is 400',
      BUFFER_ROWS[1].term / BUFFER_ROWS[1].file === 400, '');

  /* 17-19: the duplicated buffer. */
  chk('3 forks leave 8 copies to flush', DUP_BUFFERED === 8, String(DUP_BUFFERED));
  chk('line buffering leaves one copy', DUP_LINE === 1, String(DUP_LINE));
  chk('the copy count is the process count', DUP_BUFFERED === processes(DUP_FORKS), '');

  /* 20-24: descriptors. */
  chk('after fork the parent and child share one description', SHARED.shared === true, '');
  chk('the parent reads bytes 0 to 3', SHARED.parent.from === 0 && SHARED.parent.to === 4, '');
  chk('the child then reads bytes 4 to 7', SHARED.child.from === 4 && SHARED.child.to === 8, '');
  chk('two separate opens do not share an offset',
      SEPARATE.shared === false && SEPARATE.second.from === 0, '');
  chk('exec keeps the descriptor and drops the close-on-exec one',
      CLOEXEC.before === 2 && CLOEXEC.after === 1 && CLOEXEC.keptFd === '3', CLOEXEC.keptFd);

  /* 25-28: exit status and the two switches. */
  chk('status 256 is reported as 0', exitStatus(256) === 0, '');
  chk('status 258 is reported as 2', exitStatus(258) === 2, '');
  chk('every mode-switch step appears in the process switch',
      MODE_STEPS.every(function (s) { return PROC_STEPS.indexOf(s) !== -1; }), '');
  chk('the process switch adds exactly four more steps',
      PROC_STEPS.length - MODE_STEPS.length === 4, '');
  chk('the replaced and preserved lists are disjoint',
      EXEC_REPLACED.every(function (s) { return EXEC_PRESERVED.indexOf(s) === -1; }), '');
})();

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

var COL = {
  ok: { fill: PAL.accentDim, stroke: PAL.accent },
  bad: { fill: PAL.invalidDim, stroke: PAL.invalid },
  warn: { fill: PAL.warnDim, stroke: PAL.warn },
  flat: { fill: PAL.surface2, stroke: PAL.border },
  info: { fill: '#e7eef7', stroke: PAL.info }
};

function head(n, title) {
  P.text(34, 14, n + '  ' + title, { size: 12, mono: true, color: PAL.dim });
  P.line(34, 34, W - 34, 34, { stroke: PAL.border, sw: 1 });
}

function box(x, y, w, h, o) {
  o = o || {};
  var c = COL[o.tone || 'flat'] || COL.flat;
  P.rect(x, y, w, h, { fill: o.fill || c.fill, stroke: o.stroke || c.stroke, sw: o.sw || 1.2, radius: o.radius === undefined ? 5 : o.radius, dash: o.dash });
}

function tx(x, y, s, o) {
  o = o || {};
  P.text(x, y, s, { size: o.size || 11, mono: !!o.mono, color: o.color || PAL.ink, align: o.align, base: o.base, bold: o.bold });
}

function centre(x, y, w, s, o) { tx(x + w / 2, y, s, Object.assign({ align: 'center' }, o || {})); }

function midBox(x, y, w, h, s, o) {
  tx(x + w / 2, y + h / 2, s, Object.assign({ align: 'center', base: 'middle' }, o || {}));
}

function lines(x, y, arr, o) {
  o = o || {};
  arr.forEach(function (s, i) { tx(x, y + i * (o.lh || 17), s, o); });
}

function arrow(x1, y1, x2, y2, colour) {
  P.arrow(x1, y1, x2, y2, { stroke: colour || PAL.faint, sw: 1.3, head: 7 });
}

function tick(x, y, ok, colour) {
  var c = colour || (ok ? PAL.valid : PAL.invalid);
  if (ok) {
    P.line(x - 5, y, x - 1, y + 4, { stroke: c, sw: 2 });
    P.line(x - 1, y + 4, x + 6, y - 5, { stroke: c, sw: 2 });
  } else {
    P.line(x - 5, y - 5, x + 5, y + 5, { stroke: c, sw: 2 });
    P.line(x + 5, y - 5, x - 5, y + 5, { stroke: c, sw: 2 });
  }
}

function on(p, frac) { return p >= frac - 1e-9; }

function legendRow(items, y) {
  var x = 40;
  items.forEach(function (it) {
    var c = COL[it[0]] || COL.flat;
    P.rect(x, y, 12, 12, { fill: c.fill, stroke: c.stroke, sw: 1.2, radius: 2 });
    tx(x + 18, y, it[1], { size: 10, color: PAL.dim });
    x += 18 + it[1].length * 6 + 26;
  });
}

/* ---------------------------- scene 1 ---------------------------- */

function drawBoundary(t, sc) {
  var p = t - sc.start;
  head(1, 'A system call is not a function call');

  box(36, 46, 828, 150, { tone: 'flat', radius: 8 });
  tx(48, 54, 'USER MODE  —  mode bit 1', { size: 10, mono: true, color: PAL.faint });
  box(36, 258, 828, 176, { tone: 'flat', radius: 8 });
  tx(48, 266, 'KERNEL MODE  —  mode bit 0', { size: 10, mono: true, color: PAL.faint });

  P.line(36, 244, 864, 244, { stroke: PAL.warn, sw: 1.4, dash: [6, 5] });
  tx(40, 226, 'privilege boundary', { size: 10, mono: true, color: PAL.warn });

  box(64, 82, 168, 52, { tone: 'ok', radius: 6 });
  midBox(64, 82, 168, 52, 'your program', { size: 12 });
  tx(148, 142, 'PC, registers, heap', { size: 10, color: PAL.faint, align: 'center' });

  if (on(p, 0.27)) {
    box(286, 82, 150, 52, { tone: 'flat', radius: 6 });
    midBox(286, 82, 150, 52, 'f() in your code', { size: 12 });
    arrow(232, 100, 286, 100);
    arrow(286, 118, 232, 118);
    tx(259, 96, 'call', { size: 10, mono: true, color: PAL.dim, align: 'center' });
    lines(470, 84, ['a call pushes a return address', 'and jumps. No mode change,',
                    'no privilege change.'], { size: 11, color: PAL.dim, lh: 18 });
  }

  if (on(p, 0.53)) {
    box(556, 212, 210, 46, { tone: 'warn', radius: 6 });
    midBox(556, 212, 210, 46, 'trap: syscall instruction', { size: 11, mono: true });
    arrow(376, 134, 556, 216, PAL.warn);
    tx(430, 176, 'trap', { size: 10, mono: true, color: PAL.warn });
    tx(560, 176, 'enters at a fixed vector', { size: 10, color: PAL.faint });
  }

  if (on(p, 0.8)) {
    box(556, 300, 210, 56, { tone: 'ok', radius: 6 });
    midBox(556, 300, 210, 56, 'sys_read runs in the kernel', { size: 11 });
    arrow(640, 258, 640, 300, PAL.accent);
    arrow(700, 300, 700, 258, PAL.accent);
    tx(556, 366, 'returns to the next instruction', { size: 10, color: PAL.faint });
  }

  if (on(p, 0.93)) {
    tx(40, 388, 'Same process. Same address space. Different privilege.', { size: 13, color: PAL.ink });
  }
}

/* ---------------------------- scene 2 ---------------------------- */

function drawTrap(t, sc) {
  var p = t - sc.start;
  head(2, 'What the trap does, register by register');

  var regs = [
    { r: '%rax', v: '0  =  read' },
    { r: '%rdi', v: '3  =  the fd' },
    { r: '%rsi', v: 'buf' },
    { r: '%rdx', v: '8  =  count' }
  ];
  regs.forEach(function (g, i) {
    var x = 60 + i * 158;
    box(x, 52, 146, 50, { tone: 'flat', radius: 5 });
    tx(x + 10, 60, g.r, { size: 10, mono: true, color: PAL.faint });
    tx(x + 10, 78, g.v, { size: 11, mono: true });
  });
  box(692, 52, 168, 50, { tone: 'warn', radius: 5 });
  midBox(692, 52, 168, 50, 'syscall', { size: 12, mono: true });

  /* the kernel table */
  var rows = SYSCALLS.filter(function (s) { return [0, 1, 3, 32, 33, 57, 59, 60, 61].indexOf(s.nr) !== -1; });
  box(60, 122, 260, 30 + rows.length * 21, { tone: 'flat', radius: 5 });
  tx(72, 130, 'the kernel table', { size: 10, mono: true, color: PAL.faint });
  rows.forEach(function (s, i) {
    var y = 150 + i * 21;
    var hot = s.nr === 0 && on(p, 0.53);
    if (hot) P.rect(64, y - 3, 252, 19, { fill: PAL.accentDim, radius: 3 });
    tx(76, y, String(s.nr), { size: 10, mono: true, color: hot ? PAL.accent : PAL.dim });
    tx(120, y, s.name, { size: 10, mono: true, color: hot ? PAL.accent : PAL.ink });
  });

  if (on(p, 0.53)) {
    box(370, 150, 196, 46, { tone: 'ok', radius: 5 });
    midBox(370, 150, 196, 46, 'sys_read handler', { size: 11, mono: true });
    arrow(324, 162, 370, 168, PAL.accent);
    tx(366, 208, 'the number selects the handler', { size: 10, color: PAL.faint });
  }

  if (on(p, 0.72)) {
    box(370, 238, 196, 46, { tone: 'ok', radius: 5 });
    midBox(370, 238, 196, 46, 'return: %rax = 8', { size: 11, mono: true });
    arrow(468, 196, 468, 238, PAL.accent);
    lines(370, 300, ['error: %rax is -1 to -4095', 'the C wrapper sets errno'], { size: 10, mono: true, color: PAL.warn, lh: 16 });
  }

  if (on(p, 0.87)) {
    lines(600, 150, ['the trap instruction itself', 'is NOT privileged: user', 'code must be able to run',
                     'it, or nothing could enter', 'the kernel at all.'], { size: 11, color: PAL.dim, lh: 17 });
    tx(600, 258, 'unknown number -> ENOSYS', { size: 10, mono: true, color: PAL.warn });
  }
}

/* ---------------------------- scene 3 ---------------------------- */

function drawDoors(t, sc) {
  var p = t - sc.start;
  head(3, 'Three doors into the kernel');

  var cards = [
    { title: 'trap  /  system call', body: ['caused by the program', 'on purpose, synchronous', 'read, write, fork'], tone: 'ok' },
    { title: 'fault  /  exception', body: ['caused by the running', 'instruction, synchronous', 'page fault, divide by zero'], tone: 'warn' },
    { title: 'interrupt', body: ['caused by a device', 'asynchronous, external', 'timer tick, disk done'], tone: 'info' }
  ];
  cards.forEach(function (c, i) {
    var x = 46 + i * 274;
    box(x, 52, 250, 132, { tone: c.tone, radius: 7 });
    tx(x + 14, 62, c.title, { size: 12, mono: true, color: PAL.ink });
    lines(x + 14, 88, c.body, { size: 10, color: PAL.dim, lh: 17 });
  });

  if (on(p, 0.27)) {
    var opts = [['A', 'function call'], ['B', 'malloc call'], ['C', 'page fault'], ['D', 'system call']];
    opts.forEach(function (o, i) {
      var x = 46 + i * 208;
      box(x, 208, 190, 44, { tone: 'flat', radius: 5 });
      tx(x + 12, 222, o[0] + '   ' + o[1], { size: 11, mono: true });
    });
    tx(46, 198, 'GATE CSE 2023 Q13 — which guarantee a move to kernel mode?', { size: 10, mono: true, color: PAL.faint });
  }

  if (on(p, 0.53)) {
    [false, false, true, true].forEach(function (good, i) {
      var x = 46 + i * 208;
      tick(x + 172, 236, good);
      box(x, 208, 190, 44, { tone: good ? 'ok' : 'bad', radius: 5, fill: 'rgba(0,0,0,0)' });
    });
    tx(46, 272, 'C and D', { size: 13, color: PAL.accent });
  }

  if (on(p, 0.72)) {
    lines(46, 296, ['A function call never leaves user mode. malloc may be served',
                    'from the heap that already exists, so it need not call the kernel.',
                    'A fault and a system call are traps into the kernel by construction.'], { size: 11, color: PAL.dim, lh: 18 });
  }

  if (on(p, 0.88)) {
    tx(46, 372, 'the word that decides it is "guarantee"', { size: 11, color: PAL.warn });
  }
}

/* ---------------------------- scene 4 ---------------------------- */

function drawSwitch(t, sc) {
  var p = t - sc.start;
  head(4, 'Mode switch against process switch');

  tx(46, 46, 'MODE SWITCH  —  a system call', { size: 10, mono: true, color: PAL.accent });
  MODE_STEPS.forEach(function (s, i) {
    var y = 66 + i * 26;
    box(46, y - 4, 372, 22, { tone: 'ok', radius: 4, fill: 'rgba(0,0,0,0)' });
    tx(58, y, (i + 1) + '.  ' + s, { size: 10, color: PAL.ink });
  });

  if (on(p, 0.27)) {
    tx(470, 46, 'PROCESS SWITCH  —  the scheduler', { size: 10, mono: true, color: PAL.warn });
    PROC_STEPS.forEach(function (s, i) {
      var y = 66 + i * 26;
      var shared = i < MODE_STEPS.length;
      box(470, y - 4, 390, 22, { tone: shared ? 'ok' : 'warn', radius: 4, fill: 'rgba(0,0,0,0)' });
      tx(482, y, (i + 1) + '.  ' + s, { size: 10, color: shared ? PAL.accent : PAL.warn });
    });
  }

  if (on(p, 0.62)) {
    tx(46, 194, 'every mode-switch step is also a process-switch step', { size: 10, color: PAL.faint });
    tx(46, 214, 'and the process switch adds 4 more', { size: 10, color: PAL.faint });
  }

  if (on(p, 0.74)) {
    box(46, 246, 400, 52, { tone: 'ok', radius: 6 });
    midBox(46, 246, 400, 52, 'GATE CSE 2011 Q6:   T1 < T2', { size: 13, mono: true, color: PAL.accent });
  }

  if (on(p, 0.88)) {
    lines(46, 322, ['T1 is the mode switch, T2 the switch between two processes.',
                    'The argument is containment, not measurement: the process',
                    'switch performs every step of the mode switch and then more.'], { size: 11, color: PAL.dim, lh: 18 });
  }
}

/* ---------------------------- scene 5 ---------------------------- */

function drawStdio(t, sc) {
  var p = t - sc.start;
  head(5, 'printf is not a system call');

  var chain = [
    { x: 46, w: 130, s: 'printf' },
    { x: 212, w: 168, s: 'stdio buffer' },
    { x: 416, w: 148, s: 'write(1, ...)' },
    { x: 600, w: 120, s: 'kernel' },
    { x: 756, w: 108, s: 'file' }
  ];
  chain.forEach(function (c, i) {
    var tone = i === 2 ? 'warn' : (i === 0 || i === 1 ? 'flat' : 'ok');
    box(c.x, 52, c.w, 44, { tone: tone, radius: 5 });
    midBox(c.x, 52, c.w, 44, c.s, { size: 11, mono: true });
    if (i < chain.length - 1) arrow(c.x + c.w, 74, chain[i + 1].x, 74);
  });
  tx(46, 104, 'user space', { size: 9, mono: true, color: PAL.faint });
  tx(416, 104, 'the boundary', { size: 9, mono: true, color: PAL.warn });

  if (on(p, 0.27)) {
    var rules = ['stderr: unbuffered, every byte goes out',
                 'stdout at a terminal: line buffered, a newline flushes',
                 'stdout to a file or pipe: fully buffered until full or exit'];
    rules.forEach(function (s, i) {
      box(46, 126 + i * 30, 400, 24, { tone: 'flat', radius: 4, fill: 'rgba(0,0,0,0)' });
      tx(58, 132 + i * 30, s, { size: 10, color: PAL.ink });
    });
  }

  if (on(p, 0.53)) {
    tx(486, 126, 'system calls made', { size: 10, mono: true, color: PAL.faint });
    tx(486, 152, 'terminal', { size: 10, mono: true, color: PAL.dim });
    tx(620, 152, 'redirected', { size: 10, mono: true, color: PAL.dim });
    V.bufferRows.forEach(function (r, i) {
      var y = 180 + i * 44;
      tx(486, y, r.label, { size: 10, color: PAL.ink });
      box(486, y + 12, 110, 24, { tone: 'warn', radius: 4, fill: 'rgba(0,0,0,0)' });
      tx(541, y + 20, String(r.term), { size: 11, mono: true, color: PAL.warn, align: 'center' });
      box(612, y + 12, 110, 24, { tone: 'ok', radius: 4, fill: 'rgba(0,0,0,0)' });
      tx(667, y + 20, String(r.file), { size: 11, mono: true, color: PAL.accent, align: 'center' });
      tx(736, y + 20, r.bytes + ' B', { size: 9, mono: true, color: PAL.faint });
    });
  }

  if (on(p, 0.78)) {
    lines(46, 250, ['the same bytes in both columns:',
                    'only the number of crossings changes'], { size: 11, color: PAL.dim, lh: 17 });
    tx(486, 268, 'buffer size used here: ' + BUF + ' B', { size: 10, mono: true, color: PAL.faint });
    tx(486, 288, 'the real size is implementation', { size: 10, color: PAL.faint });
    tx(486, 304, 'defined, not a standard constant', { size: 10, color: PAL.faint });
  }
}

/* ---------------------------- scene 6 ---------------------------- */

function drawDup(t, sc) {
  var p = t - sc.start;
  head(6, 'fork copies the buffer');

  lines(46, 56, ['printf("hello");', 'fork();', 'fork();', 'fork();'],
        { size: 12, mono: true, color: PAL.ink, lh: 22 });

  box(300, 52, 210, 58, { tone: 'warn', radius: 6 });
  tx(312, 62, 'the process buffer', { size: 10, mono: true, color: PAL.warn });
  tx(312, 82, 'h e l l o', { size: 13, mono: true, color: PAL.ink });
  tx(312, 98, 'not yet written', { size: 9, mono: true, color: PAL.faint });
  arrow(232, 76, 300, 76, PAL.warn);

  if (on(p, 0.27)) {
    var counts = [1, 2, 4, 8];
    counts.forEach(function (c, i) {
      var x = 300 + i * 84;
      box(x, 136, 60, 40, { tone: i === 3 ? 'bad' : 'flat', radius: 5 });
      midBox(x, 136, 60, 40, String(c), { size: 13, mono: true });
      if (i > 0) arrow(x - 24, 156, x, 156, PAL.dim);
    });
    tx(300, 190, 'processes after each fork', { size: 10, color: PAL.faint });
    tx(560, 62, 'fork copies the memory,', { size: 10, color: PAL.dim });
    tx(560, 78, 'so it copies the buffer', { size: 10, color: PAL.dim });
  }

  if (on(p, 0.53)) {
    box(46, 222, 372, 58, { tone: 'bad', radius: 6 });
    tx(58, 232, 'redirected to a file: fully buffered', { size: 10, mono: true, color: PAL.invalid });
    tx(58, 252, V.dup.buffered + ' copies of "hello" are written', { size: 13, mono: true, color: PAL.ink });
    box(440, 222, 400, 58, { tone: 'ok', radius: 6 });
    tx(452, 232, 'at a terminal: line buffered, already sent', { size: 10, mono: true, color: PAL.accent });
    tx(452, 252, V.dup.line + ' copy of "hello" is written', { size: 13, mono: true, color: PAL.ink });
  }

  if (on(p, 0.74)) {
    lines(46, 300, ['The duplication is not fork copying output. It is fork copying',
                    'output that had not been sent yet: each process flushes its own',
                    'copy at exit, so the copies are the process count.'],
          { size: 11, color: PAL.dim, lh: 18 });
  }

  if (on(p, 0.88)) {
    tx(46, 372, 'fix: end the line, or call fflush before forking', { size: 11, color: PAL.accent });
    tx(46, 392, 'a newline is enough only when the stream is line buffered', { size: 10, color: PAL.faint });
  }
}

/* ---------------------------- scene 7 ---------------------------- */

function drawLifecycle(t, sc) {
  var p = t - sc.start;
  head(7, 'The four calls that run a program');

  var calls = [
    { s: 'fork', d: 'makes the process' },
    { s: 'execve', d: 'loads the program' },
    { s: 'exit', d: 'ends the process' },
    { s: 'wait4', d: 'collects the status' }
  ];
  calls.forEach(function (c, i) {
    var x = 46 + i * 208;
    box(x, 50, 186, 52, { tone: i === 1 ? 'warn' : 'flat', radius: 6 });
    midBox(x, 50, 186, 24, c.s, { size: 12, mono: true });
    centre(x, 74, 186, c.d, { size: 10, color: PAL.dim });
    if (i < calls.length - 1) arrow(x + 186, 76, x + 208, 76);
  });

  /* two lanes */
  tx(46, 122, 'parent', { size: 10, mono: true, color: PAL.dim });
  P.line(120, 126, 856, 126, { stroke: PAL.border, sw: 1, dash: [4, 4] });
  tx(46, 196, 'child', { size: 10, mono: true, color: PAL.dim });
  P.line(120, 200, 856, 200, { stroke: PAL.border, sw: 1, dash: [4, 4] });

  box(140, 108, 92, 30, { tone: 'ok', radius: 4 });
  midBox(140, 108, 92, 30, 'fork', { size: 10, mono: true });
  box(140, 182, 92, 30, { tone: 'ok', radius: 4 });
  midBox(140, 182, 92, 30, 'execve', { size: 10, mono: true });
  arrow(186, 138, 186, 182, PAL.accent);

  if (on(p, 0.27)) {
    box(300, 182, 150, 30, { tone: 'flat', radius: 4 });
    midBox(300, 182, 150, 30, 'the new program', { size: 10 });
    tx(300, 222, 'the same pid, a different image', { size: 10, color: PAL.faint });
    tx(300, 160, 'exec never returns on success', { size: 10, mono: true, color: PAL.warn });
  }

  if (on(p, 0.53)) {
    box(510, 182, 96, 30, { tone: 'bad', radius: 4 });
    midBox(510, 182, 96, 30, 'exit', { size: 10, mono: true });
    box(510, 108, 130, 30, { tone: 'warn', radius: 4 });
    midBox(510, 108, 130, 30, 'wait4 blocks', { size: 10, mono: true });
    arrow(606, 197, 656, 197, PAL.invalid);
    box(656, 182, 96, 30, { tone: 'bad', radius: 4 });
    midBox(656, 182, 96, 30, 'zombie', { size: 10, mono: true });
    tx(510, 236, 'status: the exit value keeps its low 8 bits', { size: 10, color: PAL.dim });
  }

  if (on(p, 0.74)) {
    box(46, 268, 794, 44, { tone: 'ok', radius: 6 });
    tx(58, 278, 'GATE CSE 2024 Set 1 Q47: the loop with fork, printf and wait', { size: 10, mono: true, color: PAL.accent });
    tx(58, 294, V.run2024.prints + ' printf executions in ' + V.run2024.live + ' processes', { size: 12, mono: true });
  }

  if (on(p, 0.88)) {
    tx(46, 336, 'wait changes the order of the prints, never their number', { size: 11, color: PAL.dim });
    tx(46, 358, 'answering 8 gives the process count, not the print count', { size: 10, color: PAL.warn });
  }
}

/* ---------------------------- scene 8 ---------------------------- */

function drawSurvives(t, sc) {
  var p = t - sc.start;
  head(8, 'What exec throws away and what it keeps');

  tx(46, 46, 'REPLACED BY execve', { size: 10, mono: true, color: PAL.invalid });
  EXEC_REPLACED.forEach(function (s, i) {
    var y = 66 + i * 26;
    box(46, y - 4, 390, 22, { tone: 'bad', radius: 4, fill: 'rgba(0,0,0,0)' });
    tick(58, y + 5, false);
    tx(74, y, s, { size: 10, color: PAL.ink });
  });

  if (on(p, 0.27)) {
    tx(470, 46, 'PRESERVED ACROSS execve', { size: 10, mono: true, color: PAL.valid });
    EXEC_PRESERVED.forEach(function (s, i) {
      var y = 66 + i * 26;
      box(470, y - 4, 390, 22, { tone: 'ok', radius: 4, fill: 'rgba(0,0,0,0)' });
      tick(482, y + 5, true);
      tx(498, y, s, { size: 10, color: PAL.ink });
    });
  }

  if (on(p, 0.62)) {
    box(46, 232, 814, 62, { tone: 'warn', radius: 6 });
    tx(58, 242, 'the sharp edge', { size: 10, mono: true, color: PAL.warn });
    tx(58, 262, 'an IGNORED signal stays ignored; a CAUGHT signal is reset to its default.', { size: 11, color: PAL.ink });
    tx(58, 280, 'The handler was code in the old image, and that code no longer exists.', { size: 10, color: PAL.dim });
  }

  if (on(p, 0.82)) {
    lines(46, 316, ['The descriptor table survives, which is why a redirection set up',
                    'before exec still works after it: the shell points descriptor 1',
                    'at the file in the child, then execs.'], { size: 11, color: PAL.dim, lh: 18 });
    tx(46, 386, 'that is the next scene', { size: 10, mono: true, color: PAL.faint });
  }
}

/* ---------------------------- scene 9 ---------------------------- */

function drawFds(t, sc) {
  var p = t - sc.start;
  head(9, 'File descriptors: copied by fork, kept by exec');

  /* parent table */
  tx(46, 46, 'parent descriptor table', { size: 10, mono: true, color: PAL.faint });
  [['0', 'stdin'], ['1', 'stdout'], ['3', 'log.txt']].forEach(function (r, i) {
    var y = 62 + i * 30;
    box(46, y, 130, 24, { tone: 'flat', radius: 4 });
    tx(58, y + 6, r[0] + '  ->  ' + r[1], { size: 10, mono: true });
  });

  box(300, 62, 250, 84, { tone: 'ok', radius: 6 });
  tx(312, 70, 'open file description', { size: 10, mono: true, color: PAL.accent });
  tx(312, 90, 'file: log.txt', { size: 10, mono: true });
  tx(312, 108, 'offset: ' + SHARED.desc.offset, { size: 10, mono: true, color: PAL.warn });
  tx(312, 126, 'status flags, access mode', { size: 9, color: PAL.faint });
  arrow(176, 138, 300, 104, PAL.accent);

  if (on(p, 0.27)) {
    tx(46, 176, 'child descriptor table (after fork)', { size: 10, mono: true, color: PAL.faint });
    [['0', 'stdin'], ['1', 'stdout'], ['3', 'log.txt']].forEach(function (r, i) {
      var y = 192 + i * 30;
      box(46, y, 130, 24, { tone: 'flat', radius: 4 });
      tx(58, y + 6, r[0] + '  ->  ' + r[1], { size: 10, mono: true });
    });
    arrow(176, 268, 300, 130, PAL.accent);
    tx(196, 214, 'the same description', { size: 10, color: PAL.accent });
  }

  if (on(p, 0.53)) {
    tx(580, 62, 'parent reads 4 bytes', { size: 10, color: PAL.dim });
    tx(580, 80, 'offset 0 -> 4', { size: 11, mono: true, color: PAL.ink });
    tx(580, 108, 'child reads 4 bytes', { size: 10, color: PAL.dim });
    tx(580, 126, 'offset 4 -> 8', { size: 11, mono: true, color: PAL.ink });
    tx(580, 154, 'the child does not', { size: 9, color: PAL.faint });
    tx(580, 168, 'restart at byte 0', { size: 9, color: PAL.faint });
  }

  if (on(p, 0.72)) {
    box(46, 316, 390, 62, { tone: 'warn', radius: 6 });
    tx(58, 326, 'counterexample: two separate opens', { size: 10, mono: true, color: PAL.warn });
    tx(58, 346, 'two descriptions, two offsets, both from 0', { size: 10, color: PAL.ink });
    tx(58, 364, 'sharing comes from fork, dup or passing an fd', { size: 9, color: PAL.faint });
  }

  if (on(p, 0.86)) {
    lines(470, 316, ['exec keeps every descriptor whose', 'close-on-exec flag is clear; dup2',
                     'makes one descriptor refer to the', 'description of another, which is',
                     'exactly a shell redirection.'], { size: 10, color: PAL.dim, lh: 16 });
  }
}

/* ---------------------------- scene 10 ---------------------------- */

function drawCount(t, sc) {
  var p = t - sc.start;
  head(10, 'Counting with wait, and the four traps');

  tx(46, 46, 'GATE CSE 2024 Set 1 Q47, run as a model', { size: 10, mono: true, color: PAL.faint });
  tx(46, 70, 'iteration', { size: 9, mono: true, color: PAL.faint });
  tx(190, 70, 'live processes', { size: 9, mono: true, color: PAL.faint });
  tx(340, 70, 'printf calls', { size: 9, mono: true, color: PAL.faint });
  V.run2024.rows.forEach(function (r, i) {
    var y = 92 + i * 26;
    box(46, y - 5, 420, 22, { tone: 'flat', radius: 4, fill: 'rgba(0,0,0,0)' });
    tx(58, y, 'x = ' + r.x, { size: 10, mono: true });
    tx(200, y, String(r.live), { size: 10, mono: true });
    tx(350, y, String(r.prints), { size: 10, mono: true });
  });
  tx(46, 178, 'total', { size: 10, mono: true, color: PAL.accent });
  tx(200, 178, V.run2024.live + ' processes', { size: 10, mono: true, color: PAL.accent });
  tx(350, 178, V.run2024.prints + ' calls', { size: 10, mono: true, color: PAL.accent });

  if (on(p, 0.27)) {
    var traps = ['printf is a library call, not a system call',
                 'the trap instruction is not privileged',
                 'wait changes the order, not the count',
                 'a shared description shares its offset'];
    traps.forEach(function (s, i) {
      var y = 206 + i * 26;
      box(46, y - 5, 460, 22, { tone: 'warn', radius: 4, fill: 'rgba(0,0,0,0)' });
      tx(58, y, (i + 1) + '.  ' + s, { size: 10, color: PAL.ink });
    });
  }

  if (on(p, 0.55)) {
    lines(540, 200, ['the procedure for any question here'], { size: 10, mono: true, color: PAL.faint });
    var steps = ['name the call', 'name its mode', 'ask what it changes',
                 'ask what it leaves alone'];
    steps.forEach(function (s, i) {
      var y = 220 + i * 26;
      box(540, y - 5, 310, 22, { tone: 'ok', radius: 4, fill: 'rgba(0,0,0,0)' });
      tx(552, y, (i + 1) + '.  ' + s, { size: 10, color: PAL.ink });
    });
  }

  if (on(p, 0.8)) {
    tx(46, 330, 'one boundary, four calls, two tables', { size: 12, color: PAL.accent });
    tx(46, 354, 'the boundary is the mode bit and the trap', { size: 10, color: PAL.dim });
    tx(46, 372, 'the calls are fork, execve, exit, wait4', { size: 10, color: PAL.dim });
    tx(46, 390, 'the tables are the descriptor table and the description', { size: 10, color: PAL.dim });
  }
}

var SCENE_DRAW = {
  boundary: drawBoundary,
  trap: drawTrap,
  doors: drawDoors,
  switch: drawSwitch,
  stdio: drawStdio,
  dup: drawDup,
  lifecycle: drawLifecycle,
  survives: drawSurvives,
  fds: drawFds,
  count: drawCount
};

function drawFrame(P2) {
  P = P2;
  P.alpha(1);
  P.clear();
  P.rect(0, 0, W, H, { fill: PAL.surface });

  var t = (K && K.state) ? K.state.elapsed : 0;
  var scenes = (K && K.state && K.state.scenes && K.state.scenes.length)
    ? K.state.scenes
    : (window.LESSON_TIMELINE ? window.LESSON_TIMELINE.scenes : []);
  var i = 0;
  for (var k = scenes.length - 1; k >= 0; k--) {
    if (t >= scenes[k].start - 1e-6) { i = k; break; }
  }
  var sc = scenes[i];
  if (!sc) return;
  var fn = SCENE_DRAW[sc.id];
  if (!fn) return;
  try {
    fn(t, sc);
  } catch (err) {
    console.error('scene draw failed', sc.id, err);
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
  if (fallback) fallback.classList.remove('show');

  var ok = false;
  if (window.p5 && holder && PR) {
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
