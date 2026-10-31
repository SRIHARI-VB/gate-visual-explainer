/* ==========================================================================
   barriers-and-their-implementations — lesson.js
   Four layers, in order:
     1. THE MODEL   — every number this lesson shows, computed here.
     2. THE CHECKS  — each computed value re-verified against a definition.
     3. RENDER      — reads the model; never re-derives it.
     4. BOOT        — p5.js first, the browser's own canvas as the fallback.

   The model is a statement-granularity simulator plus an exhaustive
   breadth-first search over every interleaving of three processes, run over
   ten barrier programs:
     the GATE CSE 2006 barrier, and the four candidate repairs of its second
     question; the naive "spin until the count is n" barrier; the
     sense-reversing barrier; and the two-phase semaphore barrier, with an
     atomic and a non-atomic counter.
   "It deadlocks" and "it lets a process through early" are therefore measured
   over the complete reachable state graph, not read off one convenient trace.
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
   1a. THE MACHINE

   An instruction is one atomic statement.  Ops:
     P / V            binary semaphore take and give
     inc / dec / set  a shared counter
     fetchdec         atomic fetch-and-decrement; the old value goes to reg[i]
     ifEq / ifNe / ifGe / ifGt0   conditional jumps
     goto             unconditional jump
     spinNe           `while (x != v);`  -- one step is one test
     spinSense        `repeat until sense == local_sense;`
     flip / setSense  the sense-reversing pair
     ldreg / stregInc / stregDec   a deliberately NON-atomic read-modify-write
     end              the invocation finishes here
   ---------------------------------------------------------------------- */

function initState(cfg) {
  var n = cfg.n, i;
  var st = {
    n: n, R: cfg.rounds,
    pc: [], rnd: [], done: [], blocked: [], reg: [],
    arr: 0, left: 0, leftP: [], c: 0, count: n, sense: 1, ls: [],
    sem: {}, arrivals: []
  };
  for (i = 0; i < n; i++) {
    st.pc.push(0); st.rnd.push(0); st.done.push(false);
    st.blocked.push(null); st.reg.push(0);
    st.leftP.push(0);
    st.ls.push(1);
  }
  for (i = 0; i < cfg.rounds; i++) st.arrivals.push(0);
  st.sem = {
    S: { v: 1, q: [] },
    arrival: { v: 1, q: [] },
    departure: { v: 0, q: [] }
  };
  st.count = cfg.n;                                  // sense-reversing: count starts at n
  if (cfg.kind === 'two' || cfg.kind === 'twoRacy') st.count = 0;
  return st;
}

function clone(st) {
  var s = {
    n: st.n, R: st.R,
    pc: st.pc.slice(), rnd: st.rnd.slice(), done: st.done.slice(),
    blocked: st.blocked.slice(), reg: st.reg.slice(),
    arr: st.arr, left: st.left, leftP: st.leftP.slice(), c: st.c,
    count: st.count, sense: st.sense, ls: st.ls.slice(),
    sem: {}, arrivals: st.arrivals.slice()
  };
  for (var k in st.sem) s.sem[k] = { v: st.sem[k].v, q: st.sem[k].q.slice() };
  return s;
}

function key(st) {
  var sem = [];
  for (var k in st.sem) sem.push(k + ':' + st.sem[k].v + '/' + st.sem[k].q.join(''));
  return st.pc.join(',') + '|' + st.rnd.join(',') + '|' + st.done.map(Number).join('') +
    '|' + st.blocked.join(',') + '|' + st.reg.join(',') + '|' + st.arr + ',' + st.left + ',' + st.c +
    ',' + st.leftP.join(',') + '|' + st.count + ',' + st.sense + ',' + st.ls.join('') +
    '|' + sem.join(';') + '|' + st.arrivals.join(',');
}

function finishRound(s, i) {
  if (s.rnd[i] + 1 >= s.R) { s.done[i] = true; s.pc[i] = -1; }
  else { s.rnd[i]++; s.pc[i] = 0; }
  return { next: s };
}

function step(st, i, prog) {
  var ins = prog[st.pc[i]];
  var s = clone(st);
  if (!ins) return finishRound(s, i);
  if (ins.tag === 'arrive') s.arrivals[s.rnd[i]]++;

  switch (ins.op) {
    case 'P': {
      var sem = s.sem[ins.sem];
      if (sem.v > 0) { sem.v--; s.pc[i]++; }
      else { sem.q.push(i); s.blocked[i] = ins.sem; s.pc[i]++; }
      return { next: s };
    }
    case 'V': {
      var s2 = s.sem[ins.sem];
      if (s2.q.length) { var j = s2.q.shift(); s.blocked[j] = null; }
      else s2.v++;
      s.pc[i]++;
      return { next: s };
    }
    case 'inc': {
      if (ins.v === 'arr') s.arr++;
      else if (ins.v === 'leftP') s.leftP[i]++;
      else s[ins.v]++;
      s.pc[i]++;
      return { next: s };
    }
    case 'dec': {
      if (ins.v === 'leftP') s.leftP[i]--;
      else s[ins.v]--;
      s.pc[i]++;
      return { next: s };
    }
    case 'set': {
      if (ins.v === 'leftP') s.leftP[i] = ins.val;
      else s[ins.v] = ins.val;
      s.pc[i]++;
      return { next: s };
    }
    case 'fetchdec': {
      s.reg[i] = s[ins.v];
      s[ins.v] = s[ins.v] - 1;
      s.pc[i]++;
      return { next: s };
    }
    case 'ldreg': { s.reg[i] = s[ins.v]; s.pc[i]++; return { next: s }; }
    case 'stregInc': { s[ins.v] = s.reg[i] + 1; s.pc[i]++; return { next: s }; }
    case 'stregDec': { s[ins.v] = s.reg[i] - 1; s.pc[i]++; return { next: s }; }
    case 'ifEq': {
      var a = ins.r === 'reg' ? s.reg[i] : s[ins.v];
      s.pc[i] = (a === ins.val) ? ins.to : s.pc[i] + 1;
      return { next: s };
    }
    case 'ifNe': {
      var b = ins.v === 'leftP' ? s.leftP[i] : s[ins.v];
      s.pc[i] = (b !== ins.val) ? ins.to : s.pc[i] + 1;
      return { next: s };
    }
    case 'ifGe': {
      var c1 = ins.v === 'leftP' ? s.leftP[i] : s[ins.v];
      s.pc[i] = (c1 >= ins.val) ? ins.to : s.pc[i] + 1;
      return { next: s };
    }
    case 'ifGt0': {
      var d = ins.v === 'leftP' ? s.leftP[i] : s[ins.v];
      s.pc[i] = (d > 0) ? ins.to : s.pc[i] + 1;
      return { next: s };
    }
    case 'goto': { s.pc[i] = ins.to; return { next: s }; }
    case 'spinNe': {
      if (s[ins.v] === ins.val) s.pc[i] = s.pc[i] + 1;    // one failed test, no progress
      return { next: s };
    }
    case 'spinSense': {
      if (s.sense === s.ls[i]) s.pc[i] = s.pc[i] + 1;
      return { next: s };
    }
    case 'flip': { s.ls[i] = 1 - s.ls[i]; s.pc[i]++; return { next: s }; }
    case 'setSense': { s.sense = s.ls[i]; s.pc[i]++; return { next: s }; }
    case 'end': { return finishRound(s, i); }
    default: throw new Error('unknown op ' + ins.op);
  }
}

/* ----------------------------------------------------------------------
   1b. THE PROGRAMS
   ---------------------------------------------------------------------- */

function prog2006(n, variant) {
  var p = [];
  if (variant === 'B') p.push({ op: 'spinNe', v: 'arr', val: 0, tag: 'gate' });
  p.push({ op: 'P', sem: 'S' });                                  // 1
  p.push({ op: 'inc', v: 'arr', tag: 'arrive' });                 // 2
  p.push({ op: 'V', sem: 'S' });                                  // 3
  p.push({ op: 'spinNe', v: 'arr', val: n, tag: 'spin' });        // 4
  if (variant === 'A') {
    p.push({ op: 'P', sem: 'S' });                                // 5
    p.push({ op: 'dec', v: 'arr' });                              // replaces 6-10
    p.push({ op: 'V', sem: 'S' });                                // 11
    p.push({ op: 'end', tag: 'end' });
    return p;
  }
  p.push({ op: 'P', sem: 'S' });                                  // 5
  p.push({ op: 'inc', v: variant === 'D' ? 'leftP' : 'left' });   // 6
  var jmp = p.length;
  p.push({ op: 'ifNe', v: variant === 'D' ? 'leftP' : 'left', val: n, to: 0 }); // 7
  p.push({ op: 'set', v: 'arr', val: 0 });                        // 8
  p.push({ op: 'set', v: 'left', val: 0 });                       // 9
  var vIdx = p.length;
  p.push({ op: 'V', sem: 'S' });                                  // 11
  p.push({ op: 'end', tag: 'end' });
  p[jmp].to = vIdx;
  return p;
}

function progSense(n) {
  /* 0 flip  1 fetchdec  2 ifEq(last)  3 spinSense  4 goto end
     5 reset count  6 flip the global sense  7 end */
  return [
    { op: 'flip', v: 'ls', tag: 'arrive' },
    { op: 'fetchdec', v: 'count' },
    { op: 'ifEq', r: 'reg', val: 1, to: 5 },
    { op: 'spinSense' },
    { op: 'goto', to: 7 },
    { op: 'set', v: 'count', val: n },
    { op: 'setSense' },
    { op: 'end', tag: 'end' }
  ];
}

function progNaive(n) {
  /* 0 fetchdec  1 ifEq(last)  2 spin until count == n  3 goto end
     4 reset count  5 end */
  return [
    { op: 'fetchdec', v: 'count', tag: 'arrive' },
    { op: 'ifEq', r: 'reg', val: 1, to: 4 },
    { op: 'spinNe', v: 'count', val: n },
    { op: 'goto', to: 5 },
    { op: 'set', v: 'count', val: n },
    { op: 'end', tag: 'end' }
  ];
}

function progTwoPhase(n, racy) {
  var p = [];
  function add(ins) { p.push(ins); return p.length - 1; }
  add({ op: 'P', sem: 'arrival' });
  if (racy) { add({ op: 'ldreg', v: 'c', tag: 'arrive' }); add({ op: 'stregInc', v: 'c' }); }
  else add({ op: 'inc', v: 'c', tag: 'arrive' });
  var geIdx = add({ op: 'ifGe', v: 'c', val: n, to: -1 });   // last to arrive?
  add({ op: 'V', sem: 'arrival' });                          // let the next one in
  var gotoWait = add({ op: 'goto', to: -1 });
  var lastIdx = add({ op: 'V', sem: 'departure' });          // open the exit
  var waitIdx = add({ op: 'P', sem: 'departure' });          // everyone waits here
  if (racy) { add({ op: 'ldreg', v: 'c' }); add({ op: 'stregDec', v: 'c' }); }
  else add({ op: 'dec', v: 'c' });
  var gtIdx = add({ op: 'ifGt0', v: 'c', to: -1 });          // more still to leave?
  add({ op: 'V', sem: 'arrival' });                          // last out: re-arm the gate
  var gotoEnd = add({ op: 'goto', to: -1 });
  var relIdx = add({ op: 'V', sem: 'departure' });           // pass the exit on
  var endIdx = add({ op: 'end', tag: 'end' });
  p[geIdx].to = lastIdx;
  p[gotoWait].to = waitIdx;
  p[gtIdx].to = relIdx;
  p[gotoEnd].to = endIdx;
  return p;
}

function program(cfg) {
  if (cfg.kind === 'sense') return progSense(cfg.n);
  if (cfg.kind === 'naive') return progNaive(cfg.n);
  if (cfg.kind === 'two') return progTwoPhase(cfg.n, false);
  if (cfg.kind === 'twoRacy') return progTwoPhase(cfg.n, true);
  return prog2006(cfg.n, cfg.kind);
}

/* ----------------------------------------------------------------------
   1c. THE EXHAUSTIVE SEARCH
   ---------------------------------------------------------------------- */

function isSpinning(st, i, prog) {
  var ins = prog[st.pc[i]];
  if (!ins) return false;
  if (ins.op === 'spinNe') return st[ins.v] !== ins.val;
  if (ins.op === 'spinSense') return st.sense !== st.ls[i];
  return false;
}

/* one whole invocation with no context switch, for option C */
function runAtomic(st, i, prog) {
  var s = clone(st);
  var guard = 0;
  while (guard++ < 200) {
    if (s.done[i]) return { next: s };
    var ins = prog[s.pc[i]];
    if (ins && ((ins.op === 'spinNe' && s[ins.v] !== ins.val) ||
                (ins.op === 'spinSense' && s.sense !== s.ls[i]))) {
      return { stuck: true, next: s };
    }
    if (ins && ins.op === 'P' && s.sem[ins.sem].v <= 0) return { stuck: true, next: s };
    s = step(s, i, prog).next;
  }
  return { stuck: true, next: s };
}

function search(cfg) {
  var prog = program(cfg);
  var start = initState(cfg);
  var nodes = [{ st: start, parent: -1, label: '' }];
  var seen = new Map([[key(start), 0]]);
  var head = 0;
  var res = {
    states: 0, stuck: 0, stuckPath: null, stuckState: null,
    violations: 0, violPath: null, violState: null,
    maxArr: 0, maxCount: 0, maxSpinners: 0, maxBlocked: 0,
    completed: 0, allDoneState: null, truncated: false
  };

  function pathOf(idx) {
    var out = [];
    while (idx > 0) { out.unshift(nodes[idx].label); idx = nodes[idx].parent; }
    return out;
  }

  while (head < nodes.length) {
    var cur = nodes[head++];
    var st = cur.st;
    res.states++;
    if (res.states > cfg.cap) { res.truncated = true; break; }

    if (st.arr > res.maxArr) res.maxArr = st.arr;
    if (st.count > res.maxCount) res.maxCount = st.count;

    var spinners = 0, blocked = 0, j, k;
    for (j = 0; j < cfg.n; j++) {
      if (st.done[j]) continue;
      if (st.blocked[j]) blocked++;
      else if (isSpinning(st, j, prog)) spinners++;
    }
    if (spinners > res.maxSpinners) res.maxSpinners = spinners;
    if (spinners + blocked > res.maxBlocked) res.maxBlocked = spinners + blocked;

    var runnable = [];
    for (j = 0; j < cfg.n; j++) {
      if (st.done[j] || st.blocked[j]) continue;
      if (isSpinning(st, j, prog)) continue;      // a failed test cannot change the state
      runnable.push(j);
    }

    if (!runnable.length) {
      var allDone = st.done.every(function (d) { return d; });
      if (allDone) { res.completed++; if (!res.allDoneState) res.allDoneState = st; }
      else { res.stuck++; if (!res.stuckState) { res.stuckPath = pathOf(head - 1); res.stuckState = st; } }
      continue;
    }

    for (k = 0; k < runnable.length; k++) {
      var who = runnable[k];
      var ins = prog[st.pc[who]];
      var r = cfg.atomic ? runAtomic(st, who, prog) : step(st, who, prog);
      if (!r) continue;
      var nx = r.next;
      var lbl = (who + 1) + ':' + (ins ? (ins.op + (ins.v ? ' ' + ins.v : '') + (ins.sem ? ' ' + ins.sem : '')) : 'end');

      /* a process may not finish round k before all n have arrived in round k */
      if (ins && ins.tag === 'end' && st.arrivals[st.rnd[who]] !== cfg.n) {
        res.violations++;
        if (!res.violPath) { res.violPath = pathOf(head - 1).concat([lbl]); res.violState = nx; }
      }
      if (r.stuck) {
        res.stuck++;
        if (!res.stuckPath) { res.stuckPath = pathOf(head - 1).concat([lbl]); res.stuckState = nx; }
        continue;
      }
      var kk = key(nx);
      if (seen.has(kk)) continue;
      seen.set(kk, nodes.length);
      nodes.push({ st: nx, parent: head - 1, label: lbl });
    }
  }
  return res;
}

/* ----------------------------------------------------------------------
   1d. THE MEASUREMENTS THIS LESSON QUOTES
   ---------------------------------------------------------------------- */

var M = {};

M.one     = search({ kind: 'none', n: 3, rounds: 1, cap: 300000 });
M.two     = search({ kind: 'none', n: 3, rounds: 2, cap: 300000 });
M.A       = search({ kind: 'A', n: 3, rounds: 2, cap: 300000 });
M.B       = search({ kind: 'B', n: 3, rounds: 2, cap: 300000 });
M.C       = search({ kind: 'C', n: 3, rounds: 2, atomic: true, cap: 300000 });
M.D       = search({ kind: 'D', n: 3, rounds: 2, cap: 300000 });
M.naive   = search({ kind: 'naive', n: 3, rounds: 2, cap: 300000 });
M.sense   = search({ kind: 'sense', n: 3, rounds: 2, cap: 300000 });
M.two2    = search({ kind: 'two', n: 3, rounds: 2, cap: 300000 });
M.twoRacy = search({ kind: 'twoRacy', n: 3, rounds: 2, cap: 300000 });

/* the largest counter value reachable, as a function of n */
M.byN = [];
for (var nn = 2; nn <= 4; nn++) {
  var r1 = search({ kind: 'none', n: nn, rounds: 1, cap: 200000 });
  var r2 = search({ kind: 'none', n: nn, rounds: 2, cap: 200000 });
  M.byN.push({ n: nn, oneRoundMax: r1.maxArr, twoRoundMax: r2.maxArr,
               twoRoundStuck: r2.stuck, twoRoundStates: r2.states });
}

/* how many processes can be inside the spin at the same time */
M.spinBound = [];
for (var m = 2; m <= 5; m++) {
  var rr = search({ kind: 'none', n: m, rounds: 1, cap: 200000 });
  M.spinBound.push({ n: m, maxSpinners: rr.maxSpinners });
}

/* ----------------------------------------------------------------------
   1e. THE CHECKS
   ---------------------------------------------------------------------- */

chk('one invocation of the 2006 barrier lets all 3 processes through',
    M.one.stuck === 0 && M.one.violations === 0,
    M.one.stuck + ' stuck, ' + M.one.violations + ' early departures');
chk('one invocation never pushes process_arrived above n = 3',
    M.one.maxArr === 3, 'max arr = ' + M.one.maxArr);
chk('two invocations in immediate succession deadlock',
    M.two.stuck > 0, M.two.stuck + ' stuck terminal states');
chk('the shortest deadlock trace leaves all three spinning with process_arrived = 4',
    !!M.two.stuckState && M.two.stuckState.arr === 4,
    'arr at the first stuck state = ' + (M.two.stuckState && M.two.stuckState.arr));
chk('at most n - 1 = 2 processes spin at once',
    M.one.maxSpinners === 2, 'max spinners = ' + M.one.maxSpinners);
chk('option A (arr--) lets the barrier be passed without all arrivals',
    M.A.violations > 0, M.A.violations + ' early departures');
chk('option B keeps process_arrived at or below n',
    M.B.maxArr <= 3, 'max arr = ' + M.B.maxArr);
chk('option C (no context switch) is stuck at the first invocation',
    M.C.stuck > 0, M.C.stuck + ' stuck');
chk('option D (private process_left) deadlocks in the second invocation',
    M.D.stuck > 0, M.D.stuck + ' stuck');
chk('option D pushes the counter to 2n',
    M.D.maxArr === 6, 'max arr = ' + M.D.maxArr);
chk('the naive count == n barrier deadlocks in the second invocation',
    M.naive.stuck > 0, M.naive.stuck + ' stuck');
chk('the sense-reversing barrier completes two invocations with no deadlock',
    M.sense.stuck === 0, M.sense.stuck + ' stuck');
chk('the sense-reversing barrier never releases a process early',
    M.sense.violations === 0, M.sense.violations + ' early departures');
chk('the two-phase semaphore barrier completes two invocations',
    M.two2.stuck === 0 && M.two2.violations === 0,
    M.two2.stuck + ' stuck, ' + M.two2.violations + ' early departures');
chk('a non-atomic counter does not break the two-phase barrier, because both counters sit inside a protected region',
    M.twoRacy.stuck === 0 && M.twoRacy.violations === 0,
    M.twoRacy.stuck + ' stuck, ' + M.twoRacy.violations + ' early departures');
chk('two invocations push process_arrived to 2n - 1, not to n + 1 (n = 2..4)',
    M.byN.every(function (r) { return r.twoRoundMax === 2 * r.n - 1; }),
    M.byN.map(function (r) { return r.n + ':' + r.twoRoundMax; }).join(' '));
chk('two invocations of the 2006 barrier deadlock for every n from 2 to 4',
    M.byN.every(function (r) { return r.twoRoundStuck > 0; }),
    M.byN.map(function (r) { return r.n + ':' + r.twoRoundStuck; }).join(' '));
chk('the spin bound is n - 1 for every n from 2 to 5',
    M.spinBound.every(function (r) { return r.maxSpinners === r.n - 1; }),
    M.spinBound.map(function (r) { return r.n + ':' + r.maxSpinners; }).join(' '));

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
  card(Pp, 28, 20, 844, 54, { fill: SURF2 });
  label(Pp, 44, 34, title, { size: 13.5, bold: true, alpha: on(t, 0) });
  if (sub) label(Pp, 44, 54, sub, { size: 10.5, color: DIM, alpha: on(t, 1) });
}

function chip(Pp, x, y, text, colour, a) {
  var w = text.length * 6.1 + 14;
  Pp.alpha(a === undefined ? 1 : a);
  Pp.rect(x, y, w, 18, { fill: SURF, stroke: colour, radius: 9, sw: 1.2 });
  Pp.alpha(a === undefined ? 1 : a);
  Pp.text(x + w / 2, y + 4, text, { size: 9.5, bold: true, color: colour, align: 'center' });
  Pp.alpha(1);
  return w;
}

function kv(Pp, x, y, k, v, o) {
  o = o || {};
  label(Pp, x, y, k, { size: 9.5, color: DIM, alpha: o.alpha });
  label(Pp, x, y + 15, v, { size: o.size || 15, bold: true, mono: true,
                            color: o.color || INK, alpha: o.alpha });
}

function describe(lbl) {
  var str = String(lbl);
  var ci = str.indexOf(':');
  var who = ci < 0 ? '' : str.slice(0, ci);
  var parts = (ci < 0 ? str : str.slice(ci + 1)).split(' ');
  var op = parts[0] || '';
  var arg = parts[1] || '';
  var txt;
  switch (op) {
    case 'P': txt = 'P(' + arg + ')'; break;
    case 'V': txt = 'V(' + arg + ')'; break;
    case 'inc':
      txt = arg === 'arr' ? 'process_arrived++'
          : arg === 'c' ? 'counter++'
          : 'process_left++'; break;
    case 'dec':
      txt = arg === 'arr' ? 'process_arrived--'
          : arg === 'c' ? 'counter--' : 'counter--'; break;
    case 'set':
      txt = arg === 'arr' ? 'process_arrived = 0'
          : arg === 'left' ? 'process_left = 0'
          : 'count = n'; break;
    case 'spinNe':
      txt = arg === 'arr' ? 'while (process_arrived != 3);'
          : 'spin until count == n'; break;
    case 'ifNe': txt = 'if (process_left == 3)'; break;
    case 'ifEq': txt = 'was I the last to arrive?'; break;
    case 'ifGe': txt = 'counter == n ?'; break;
    case 'ifGt0': txt = 'counter > 0 ?'; break;
    case 'fetchdec': txt = 'fetch_and_decrement(count)'; break;
    case 'flip': txt = 'local_sense = !local_sense'; break;
    case 'setSense': txt = 'sense = local_sense'; break;
    case 'spinSense': txt = 'repeat until sense == local_sense'; break;
    case 'ldreg': txt = 'read counter into a register'; break;
    case 'stregInc': txt = 'write register + 1 back'; break;
    case 'stregDec': txt = 'write register - 1 back'; break;
    case 'goto': txt = '(continue)'; break;
    case 'end': txt = 'returns'; break;
    default: txt = op;
  }
  return { who: who, text: txt };
}

/* ======================================================================
   SCENE 1 - what a barrier is
   ====================================================================== */
function sceneWhat(t) {
  header(P, t, 'What a barrier is', 'No process may pass until every process has arrived — and a barrier must work again next round');

  var names = ['P1', 'P2', 'P3'];
  var laneY = [116, 176, 236];
  var bx = 470;

  for (var i = 0; i < 3; i++) {
    label(P, 40, laneY[i] - 6, names[i], { size: 11, bold: true, mono: true, alpha: on(t, 0.4 + i * 0.2) });
    P.alpha(on(t, 0.4 + i * 0.2) * 0.5);
    P.line(76, laneY[i], 856, laneY[i], { stroke: BORDER, sw: 0.8 });
    P.alpha(1);
  }

  /* the barrier line */
  P.alpha(on(t, 0.8) * 0.9);
  P.line(bx, 96, bx, 258, { stroke: ACC, sw: 2, dash: [5, 4] });
  P.alpha(1);
  label(P, bx + 8, 96, 'the barrier', { size: 9.5, bold: true, color: ACC, alpha: on(t, 0.8) });

  /* tokens: travel to the barrier, wait, then leave together */
  var arriveAt = [1.2, 2.4, 3.6];
  var releaseAt = 5.4;
  for (var j = 0; j < 3; j++) {
    var a = on(t, arriveAt[j]);
    var tx = 96 + (bx - 40 - 96) * a;
    if (t > releaseAt) {
      var b = K.ease(K.clamp01((t - releaseAt) / 1.6));
      tx = (bx - 40) + (300) * b;
    }
    var waiting = t > arriveAt[j] + 0.6 && t < releaseAt;
    P.circle(tx, laneY[j], 11, {
      fill: waiting ? WARNDIM : ACCDIM,
      stroke: waiting ? WARN : ACC, sw: 1.6
    });
    label(P, tx - 4, laneY[j] - 5, names[j], { size: 9, mono: true, bold: true, color: INK });
    if (waiting) label(P, tx + 16, laneY[j] - 5, 'waiting', { size: 9, color: WARN });
  }

  /* the two jobs */
  card(P, 40, 278, 400, 104, { alpha: on(t, 6.6) });
  label(P, 56, 292, 'Job 1 — the arrival gate', { size: 11, bold: true, alpha: on(t, 6.6) });
  label(P, 56, 312, 'A process that arrives early must wait.', { size: 10, color: DIM, alpha: on(t, 7.0) });
  label(P, 56, 328, 'It leaves only when the count reaches n.', { size: 10, color: DIM, alpha: on(t, 7.4) });
  label(P, 56, 348, 'Here n = 3, so the third arrival releases', { size: 10, color: DIM, alpha: on(t, 7.8) });
  label(P, 56, 364, 'all three at once.', { size: 10, color: DIM, alpha: on(t, 8.2) });

  card(P, 460, 278, 400, 104, { alpha: on(t, 8.6) });
  label(P, 476, 292, 'Job 2 — the departure gate', { size: 11, bold: true, alpha: on(t, 8.6) });
  label(P, 476, 312, 'The counter must be reset for the next round,', { size: 10, color: DIM, alpha: on(t, 9.0) });
  label(P, 476, 328, 'and nobody may start round k+1 until round k', { size: 10, color: DIM, alpha: on(t, 9.4) });
  label(P, 476, 344, 'is over.', { size: 10, color: DIM, alpha: on(t, 9.8) });
  label(P, 476, 364, 'Almost every wrong barrier fails here.', { size: 10, bold: true, color: BAD, alpha: on(t, 10.2) });

  card(P, 40, 394, 820, 52, { fill: ACCDIM, stroke: ACC, alpha: on(t, 11) });
  label(P, 56, 408, 'The whole topic in one sentence', { size: 10, bold: true, color: ACC, alpha: on(t, 11) });
  label(P, 56, 426, 'A barrier is a counter plus a release condition; reusing it needs a way to tell round k from round k+1.',
        { size: 10.5, alpha: on(t, 11.4) });
}

/* ======================================================================
   SCENE 2 - the 2006 program
   ====================================================================== */
var CODE2006 = [
  '1   P(S);',
  '2   process_arrived++;',
  '3   V(S);',
  '4   while (process_arrived != 3);',
  '5   P(S);',
  '6   process_left++;',
  '7   if (process_left == 3) {',
  '8      process_arrived = 0;',
  '9      process_left = 0;',
  '10  }',
  '11  V(S);'
];

function sceneCode(t) {
  header(P, t, 'The GATE CSE 2006 barrier, line by line', 'Binary semaphore S = 1; process_arrived and process_left are shared and start at 0');

  card(P, 40, 88, 430, 300);
  for (var i = 0; i < CODE2006.length; i++) {
    label(P, 58, 106 + i * 24, CODE2006[i], {
      size: 11, mono: true, alpha: on(t, 0.6 + i * 0.35),
      color: i === 3 ? BAD : (i < 3 ? ACC : INK)
    });
  }
  label(P, 58, 372, 'n = 3 processes call this at the same time.', { size: 9.5, color: DIM, alpha: on(t, 5.6) });

  card(P, 490, 88, 370, 92, { alpha: on(t, 5.2) });
  label(P, 506, 102, 'Lines 1-3: the arrival gate', { size: 11, bold: true, color: ACC, alpha: on(t, 5.2) });
  label(P, 506, 122, 'The increment sits inside P(S) and V(S), so', { size: 10, color: DIM, alpha: on(t, 5.5) });
  label(P, 506, 138, 'two processes cannot lose an arrival.', { size: 10, color: DIM, alpha: on(t, 5.8) });
  label(P, 506, 160, 'This part is correct.', { size: 10, bold: true, color: VAL, alpha: on(t, 6.1) });

  card(P, 490, 192, 370, 100, { stroke: BAD, alpha: on(t, 6.4) });
  label(P, 506, 206, 'Line 4: the wait, and its flaw', { size: 11, bold: true, color: BAD, alpha: on(t, 6.4) });
  label(P, 506, 226, 'The test is OUTSIDE the critical section.', { size: 10, color: DIM, alpha: on(t, 6.7) });
  label(P, 506, 242, 'So the read of the counter can interleave with', { size: 10, color: DIM, alpha: on(t, 7.0) });
  label(P, 506, 258, 'line 2 of another invocation.', { size: 10, color: DIM, alpha: on(t, 7.3) });
  label(P, 506, 278, 'That single fact is the whole question.', { size: 10, bold: true, color: BAD, alpha: on(t, 7.6) });

  card(P, 490, 304, 370, 84, { alpha: on(t, 7.9) });
  label(P, 506, 318, 'Lines 5-11: the departure gate', { size: 11, bold: true, color: ACC, alpha: on(t, 7.9) });
  label(P, 506, 338, 'The last one out resets both counters, so the', { size: 10, color: DIM, alpha: on(t, 8.2) });
  label(P, 506, 354, 'barrier is re-armed for the next round.', { size: 10, color: DIM, alpha: on(t, 8.5) });
  label(P, 506, 376, 'Correct — but only if the reset happens in time.', { size: 10, color: DIM, alpha: on(t, 8.8) });

  card(P, 40, 400, 820, 46, { fill: SURF2, alpha: on(t, 9.4) });
  label(P, 56, 414, 'Read the code as three blocks, not eleven lines', { size: 10, bold: true, alpha: on(t, 9.4) });
  label(P, 56, 432, 'arrival (protected) → wait (unprotected) → departure (protected). The defect lives in the middle block.',
        { size: 10, color: DIM, alpha: on(t, 9.8) });
}

/* ======================================================================
   SCENE 3 - one invocation, measured
   ====================================================================== */
function sceneRound1(t) {
  header(P, t, 'One invocation, executed', 'The search explores every interleaving of the three processes, so "no run does X" means all runs');

  card(P, 40, 88, 400, 176);
  label(P, 56, 102, 'Live state at the end of round 1', { size: 10.5, bold: true, alpha: on(t, 0.6) });
  kv(P, 56, 128, 'process_arrived', String(M.one.maxArr), { alpha: on(t, 1.0) });
  kv(P, 210, 128, 'process_left', '3', { alpha: on(t, 1.4) });
  kv(P, 330, 128, 'S', '1', { alpha: on(t, 1.8) });
  label(P, 56, 190, 'The counter climbs 0 → 1 → 2 → 3 and then', { size: 10, color: DIM, alpha: on(t, 2.2) });
  label(P, 56, 206, 'stops: no process can increment a fourth time,', { size: 10, color: DIM, alpha: on(t, 2.5) });
  label(P, 56, 222, 'because only three processes exist.', { size: 10, color: DIM, alpha: on(t, 2.8) });
  label(P, 56, 246, 'The departure gate then resets it to 0.', { size: 10, bold: true, color: VAL, alpha: on(t, 3.2) });

  card(P, 460, 88, 400, 176);
  label(P, 476, 102, 'What the search measured', { size: 10.5, bold: true, alpha: on(t, 3.6) });
  var rows = [
    ['reachable states', String(M.one.states), INK],
    ['deadlocked end states', String(M.one.stuck), VAL],
    ['processes released early', String(M.one.violations), VAL],
    ['most processes spinning at once', String(M.one.maxSpinners), INK]
  ];
  for (var i = 0; i < rows.length; i++) {
    label(P, 476, 128 + i * 30, rows[i][0], { size: 10, color: DIM, alpha: on(t, 3.8 + i * 0.4) });
    label(P, 836, 128 + i * 30, rows[i][1], { size: 13, bold: true, mono: true, align: 'right',
                                              color: rows[i][2], alpha: on(t, 3.8 + i * 0.4) });
    rule(P, 476, 146 + i * 30, 844, on(t, 3.8 + i * 0.4) * 0.6);
  }

  /* the arrival bar */
  card(P, 40, 282, 820, 96, { alpha: on(t, 5.6) });
  label(P, 56, 296, 'process_arrived, sampled across every reachable state', { size: 10, bold: true, alpha: on(t, 5.6) });
  var vals = [0, 1, 2, 3];
  for (var v = 0; v < vals.length; v++) {
    var x = 80 + v * 150;
    P.alpha(on(t, 6.0 + v * 0.4));
    P.rect(x, 318, 100, 34, { fill: v === 3 ? ACCDIM : SURF2, stroke: v === 3 ? ACC : BORDER, radius: 6, sw: 1 });
    P.alpha(1);
    label(P, x + 50, 328, String(vals[v]), { size: 15, bold: true, mono: true, align: 'center', alpha: on(t, 6.0 + v * 0.4) });
    if (v < vals.length - 1) {
      label(P, x + 106, 328, '→', { size: 13, color: FAINT, alpha: on(t, 6.0 + v * 0.4) });
    }
  }
  label(P, 700, 328, 'never 4', { size: 11, bold: true, color: VAL, alpha: on(t, 7.8) });

  card(P, 40, 392, 820, 54, { fill: ACCDIM, stroke: ACC, alpha: on(t, 8.4) });
  label(P, 56, 406, 'So the first invocation is correct', { size: 10, bold: true, color: ACC, alpha: on(t, 8.4) });
  label(P, 56, 424, 'Every process waits for the third arrival, and the counter is reset by the last one out. The exam question is about the SECOND invocation.',
        { size: 10, alpha: on(t, 8.8) });
}

/* ======================================================================
   SCENE 4 - two invocations, the deadlock
   ====================================================================== */
function sceneDeadlock(t) {
  header(P, t, 'Two invocations in immediate succession', 'Q78: the implementation is incorrect — and here is the shortest run that shows it');

  card(P, 40, 88, 470, 316);
  label(P, 56, 102, 'Shortest deadlocking interleaving', { size: 10.5, bold: true, alpha: on(t, 0.6) });
  var path = M.two.stuckPath || [];
  var shown = path.slice(-11);
  for (var i = 0; i < shown.length; i++) {
    var d = describe(shown[i]);
    var y = 128 + i * 25;
    var hot = i >= shown.length - 4;
    label(P, 56, y, (path.length - shown.length + i + 1) + '.', { size: 9, mono: true, color: FAINT, alpha: on(t, 1.0 + i * 0.5) });
    label(P, 78, y, 'P' + d.who, { size: 9.5, mono: true, bold: true, color: hot ? BAD : ACC, alpha: on(t, 1.0 + i * 0.5) });
    label(P, 104, y, d.text, { size: 9.5, mono: true, color: hot ? BAD : INK, alpha: on(t, 1.0 + i * 0.5) });
  }
  label(P, 56, 400, 'Steps ' + (path.length - shown.length + 1) + '–' + path.length + ' of ' + path.length + '; the rest only repeat P1.',
        { size: 9, color: DIM, alpha: on(t, 7.2) });

  card(P, 530, 88, 330, 180, { stroke: BAD });
  label(P, 546, 102, 'The end state', { size: 10.5, bold: true, alpha: on(t, 3.0) });
  var arr = M.two.stuckState ? M.two.stuckState.arr : 4;
  for (var k = 0; k < 3; k++) {
    var y2 = 126 + k * 30;
    P.alpha(on(t, 3.2 + k * 0.3));
    P.rect(546, y2, 60, 22, { fill: BADDIM, stroke: BAD, radius: 5, sw: 1 });
    P.alpha(1);
    label(P, 556, y2 + 5, 'P' + (k + 1), { size: 10, mono: true, bold: true, alpha: on(t, 3.2 + k * 0.3) });
    label(P, 616, y2 + 5, 'at line 4, spinning', { size: 9.5, color: BAD, alpha: on(t, 3.2 + k * 0.3) });
  }
  label(P, 546, 226, 'process_arrived = ' + arr, { size: 12, bold: true, mono: true, color: BAD, alpha: on(t, 4.4) });
  label(P, 546, 246, '4 ≠ 3, so the test never passes.', { size: 9.5, color: DIM, alpha: on(t, 4.7) });

  card(P, 530, 282, 330, 122, { fill: WARNDIM, stroke: WARN, alpha: on(t, 5.2) });
  label(P, 546, 296, 'Why 4 and not 3', { size: 10, bold: true, color: WARN, alpha: on(t, 5.2) });
  label(P, 546, 316, 'P1 saw 3, left the loop, and re-entered', { size: 9.5, color: DIM, alpha: on(t, 5.5) });
  label(P, 546, 332, 'the barrier before P2 and P3 read the', { size: 9.5, color: DIM, alpha: on(t, 5.8) });
  label(P, 546, 348, 'counter. Its second arrival made it 4.', { size: 9.5, color: DIM, alpha: on(t, 6.1) });
  label(P, 546, 372, 'Nobody can bring it back to 3.', { size: 9.5, bold: true, color: BAD, alpha: on(t, 6.4) });

  card(P, 40, 416, 820, 40, { fill: BADDIM, stroke: BAD, alpha: on(t, 7.6) });
  label(P, 56, 428, 'Measured: ' + M.two.stuck + ' deadlocked end states out of ' + M.two.states +
        ' reachable states; the counter reaches ' + M.two.maxArr + ' = 2n − 1 somewhere in the graph.',
        { size: 10, color: BAD, bold: true, alpha: on(t, 7.6) });
}

/* ======================================================================
   SCENE 5 - the four candidate repairs
   ====================================================================== */
function sceneRepairs(t) {
  header(P, t, 'Q79: the four candidate repairs, executed', 'Each option was transcribed and run, so the verdict is a measurement and not a recollection');

  var rows = [
    ['A', 'Lines 6-10 replaced by process_arrived--',
     M.A.violations + ' early departures', 'fails', BAD],
    ['B', 'Wait at the start until process_arrived is 0',
     'counter stays at ' + M.B.maxArr, 'the keyed answer', WARN],
    ['C', 'Context switch disabled across the barrier',
     'stuck at the first invocation', 'fails', BAD],
    ['D', 'process_left made private',
     'counter reaches ' + M.D.maxArr + ' = 2n', 'fails', BAD]
  ];
  for (var i = 0; i < rows.length; i++) {
    var y = 92 + i * 78;
    var a = on(t, 0.8 + i * 1.5);
    card(P, 40, y, 820, 66, { alpha: a });
    P.alpha(a);
    P.rect(52, y + 18, 30, 30, { fill: SURF2, stroke: BORDER, radius: 6, sw: 1 });
    P.alpha(1);
    label(P, 67, y + 26, rows[i][0], { size: 14, bold: true, mono: true, align: 'center', alpha: a });
    label(P, 96, y + 16, rows[i][1], { size: 10.5, bold: true, alpha: a });
    label(P, 96, y + 38, rows[i][2], { size: 10, mono: true, color: rows[i][4], alpha: a });
    chip(P, 700, y + 22, rows[i][3], rows[i][4], a);
  }

  card(P, 40, 408, 820, 50, { fill: SURF2, alpha: on(t, 7.0) });
  label(P, 56, 420, 'Only B is keyed, and only B addresses the counter bound', { size: 10, bold: true, alpha: on(t, 7.0) });
  label(P, 56, 438, 'A lets a process through without all arrivals; C removes the very context switch the spin needs; D never resets the counter.',
        { size: 10, color: DIM, alpha: on(t, 7.4) });
}

/* ======================================================================
   SCENE 6 - what the keyed repair leaves
   ====================================================================== */
function sceneKeyed(t) {
  header(P, t, 'What the keyed repair fixes, and what it leaves open', 'Option B bounds the counter — and a full search still finds a stuck second round');

  card(P, 40, 88, 400, 150, { stroke: VAL });
  label(P, 56, 102, 'Fixed, measured', { size: 10.5, bold: true, color: VAL, alpha: on(t, 0.8) });
  label(P, 56, 126, 'max process_arrived  =  ' + M.B.maxArr, { size: 12, mono: true, bold: true, alpha: on(t, 1.2) });
  label(P, 56, 148, 'was ' + M.two.maxArr + ' without the gate', { size: 9.5, color: DIM, alpha: on(t, 1.5) });
  label(P, 56, 174, 'The counter can no longer pass n, so the', { size: 10, color: DIM, alpha: on(t, 1.9) });
  label(P, 56, 190, 'defect Q78 names cannot happen.', { size: 10, color: DIM, alpha: on(t, 2.2) });
  label(P, 56, 216, M.B.states + ' states explored', { size: 9, mono: true, color: FAINT, alpha: on(t, 2.5) });

  card(P, 460, 88, 400, 150, { stroke: BAD });
  label(P, 476, 102, 'Still found, measured', { size: 10.5, bold: true, color: BAD, alpha: on(t, 3.0) });
  label(P, 476, 126, M.B.stuck + ' stuck end states', { size: 12, mono: true, bold: true, color: BAD, alpha: on(t, 3.3) });
  label(P, 476, 150, 'The gate is cleared only by the reset,', { size: 10, color: DIM, alpha: on(t, 3.6) });
  label(P, 476, 166, 'and the reset needs all n to pass line 6.', { size: 10, color: DIM, alpha: on(t, 3.9) });
  label(P, 476, 192, 'So round 2 can stall waiting for round 2.', { size: 10, bold: true, color: BAD, alpha: on(t, 4.2) });
  label(P, 476, 216, M.B.states + ' states explored', { size: 9, mono: true, color: FAINT, alpha: on(t, 4.5) });

  /* the trace that shows the stall */
  card(P, 40, 254, 820, 122);
  label(P, 56, 268, 'The interleaving that stalls under B', { size: 10, bold: true, alpha: on(t, 5.0) });
  var lines = [
    ['1', 'all three pass round 1; the last one out resets process_arrived to 0'],
    ['2', 'P1 enters round 2: the gate reads 0, so it passes, and increments to 1'],
    ['3', 'P2 and P3 reach the gate and read 1, so they wait for 0'],
    ['4', 'only a completed round 2 can reset the counter — and round 2 needs P2 and P3']
  ];
  for (var i = 0; i < lines.length; i++) {
    label(P, 56, 292 + i * 20, lines[i][0] + '.', { size: 9, mono: true, color: FAINT, alpha: on(t, 5.2 + i * 0.5) });
    label(P, 74, 292 + i * 20, lines[i][1], { size: 9.5, color: i === 3 ? BAD : INK, alpha: on(t, 5.2 + i * 0.5) });
  }

  card(P, 40, 386, 820, 70, { fill: WARNDIM, stroke: WARN, alpha: on(t, 8.0) });
  label(P, 56, 398, 'The exam answer and the reusable barrier are two different things', { size: 10, bold: true, color: WARN, alpha: on(t, 8.0) });
  label(P, 56, 418, 'B answers the question the paper asks: stop the counter exceeding n.', { size: 10, color: DIM, alpha: on(t, 8.4) });
  label(P, 56, 436, 'A barrier that must survive many rounds needs the sense trick of the next two scenes.', { size: 10, color: DIM, alpha: on(t, 8.6) });
}

/* ======================================================================
   SCENE 7 - the naive barrier and the sense trick
   ====================================================================== */
function sceneNaive(t) {
  header(P, t, 'The naive counter barrier, and why it fails', 'Spin until the counter returns to n — the same defect in its purest form');

  card(P, 40, 88, 400, 168);
  var naive = [
    'central_barrier():',
    '  if (fetch_and_dec(count) == 1)',
    '     count = n;',
    '  else',
    '     repeat until count == n;'
  ];
  for (var i = 0; i < naive.length; i++) {
    label(P, 56, 108 + i * 24, naive[i], { size: 10.5, mono: true, alpha: on(t, 0.6 + i * 0.4) });
  }
  label(P, 56, 236, 'count starts at n = 3', { size: 9.5, color: DIM, alpha: on(t, 2.6) });

  card(P, 460, 88, 400, 168);
  label(P, 476, 102, 'Measured over two invocations', { size: 10.5, bold: true, alpha: on(t, 3.0) });
  label(P, 476, 128, 'stuck end states', { size: 10, color: DIM, alpha: on(t, 3.2) });
  label(P, 844, 128, String(M.naive.stuck), { size: 13, bold: true, mono: true, align: 'right', color: BAD, alpha: on(t, 3.2) });
  label(P, 476, 154, 'runs that finish both rounds', { size: 10, color: DIM, alpha: on(t, 3.5) });
  label(P, 844, 154, String(M.naive.completed), { size: 13, bold: true, mono: true, align: 'right', color: VAL, alpha: on(t, 3.5) });
  label(P, 476, 180, 'states explored', { size: 10, color: DIM, alpha: on(t, 3.8) });
  label(P, 844, 180, String(M.naive.states), { size: 13, bold: true, mono: true, align: 'right', alpha: on(t, 3.8) });
  label(P, 476, 210, 'So it works — sometimes. That is the trap.', { size: 9.5, bold: true, color: BAD, alpha: on(t, 4.1) });
  label(P, 476, 234, 'A barrier must work for every interleaving.', { size: 9.5, color: DIM, alpha: on(t, 4.4) });

  /* the race */
  card(P, 40, 272, 820, 104, { fill: BADDIM, stroke: BAD, alpha: on(t, 5.0) });
  label(P, 56, 286, 'The race, in three moves', { size: 10, bold: true, color: BAD, alpha: on(t, 5.0) });
  label(P, 56, 308, 'count = 3 (round 1 done)  →  a fast process re-enters and decrements to 2  →  a slow process reads 2 and spins for 3 for ever',
        { size: 9.5, mono: true, color: INK, alpha: on(t, 5.4) });
  label(P, 56, 332, 'The slow process is waiting for a value that has already been and gone. The reset is not the problem; the reset being a VALUE is.',
        { size: 9.5, color: DIM, alpha: on(t, 5.8) });
  label(P, 56, 356, 'Repair: make each round use a different value, so a stale read can never be mistaken for the current round.',
        { size: 9.5, bold: true, color: ACC, alpha: on(t, 6.2) });

  card(P, 40, 386, 820, 70, { fill: ACCDIM, stroke: ACC, alpha: on(t, 7.0) });
  label(P, 56, 398, 'The sense trick', { size: 10, bold: true, color: ACC, alpha: on(t, 7.0) });
  label(P, 56, 418, 'One shared boolean flips at every barrier. Each process flips its own copy first, then waits', { size: 10, alpha: on(t, 7.4) });
  label(P, 56, 436, 'for the shared one to match. Round k and round k+1 therefore differ by construction.', { size: 10, alpha: on(t, 7.6) });
}

/* ======================================================================
   SCENE 8 - the sense-reversing barrier
   ====================================================================== */
function sceneSense(t) {
  header(P, t, 'The sense-reversing barrier', 'Each process flips its own flag; the last arrival flips the shared one');

  card(P, 40, 88, 400, 200);
  var code = [
    'shared count = n;',
    'shared sense = true;',
    'private local = true;',
    '',
    'barrier():',
    '  local = !local;',
    '  if (fetch_and_dec(count) == 1)',
    '     count = n;',
    '     sense = local;',
    '  else',
    '     repeat until sense == local;'
  ];
  for (var i = 0; i < code.length; i++) {
    label(P, 56, 102 + i * 16.5, code[i], { size: 9.5, mono: true, alpha: on(t, 0.5 + i * 0.3) });
  }

  card(P, 460, 88, 400, 200);
  label(P, 476, 102, 'Measured over two invocations', { size: 10.5, bold: true, alpha: on(t, 3.6) });
  var rows = [
    ['states explored', String(M.sense.states), INK],
    ['stuck end states', String(M.sense.stuck), VAL],
    ['processes released early', String(M.sense.violations), VAL],
    ['runs that finish both rounds', String(M.sense.completed), VAL]
  ];
  for (var r = 0; r < rows.length; r++) {
    label(P, 476, 128 + r * 26, rows[r][0], { size: 10, color: DIM, alpha: on(t, 3.8 + r * 0.4) });
    label(P, 844, 128 + r * 26, rows[r][1], { size: 12.5, bold: true, mono: true, align: 'right',
                                              color: rows[r][2], alpha: on(t, 3.8 + r * 0.4) });
  }
  label(P, 476, 240, 'The one number that matters: 0 stuck.', { size: 10, bold: true, color: VAL, alpha: on(t, 5.6) });
  label(P, 476, 262, 'And 0 early releases, so the gate holds.', { size: 9.5, color: DIM, alpha: on(t, 5.9) });

  /* the sense timeline */
  card(P, 40, 302, 820, 84, { alpha: on(t, 6.4) });
  label(P, 56, 316, 'sense across three rounds, with local = !local at every entry', { size: 10, bold: true, alpha: on(t, 6.4) });
  var steps = [['round 1', 'true', 'flip to false, wait for false'], ['round 2', 'false', 'flip to true, wait for true'], ['round 3', 'true', 'flip to false again']];
  for (var s = 0; s < 3; s++) {
    var x = 70 + s * 260;
    P.alpha(on(t, 6.8 + s * 0.5));
    P.rect(x, 338, 230, 34, { fill: SURF2, stroke: BORDER, radius: 6, sw: 1 });
    P.alpha(1);
    label(P, x + 10, 346, steps[s][0], { size: 9.5, bold: true, alpha: on(t, 6.8 + s * 0.5) });
    label(P, x + 66, 346, 'sense = ' + steps[s][1], { size: 9.5, mono: true, color: ACC, alpha: on(t, 6.8 + s * 0.5) });
    label(P, x + 10, 362, steps[s][2], { size: 8.5, color: DIM, alpha: on(t, 6.8 + s * 0.5) });
  }

  card(P, 40, 392, 820, 66, { fill: ACCDIM, stroke: ACC, alpha: on(t, 8.6) });
  label(P, 56, 404, 'Why it cannot deadlock', { size: 10, bold: true, color: ACC, alpha: on(t, 8.6) });
  label(P, 56, 424, 'A process waiting in round k holds local = the value of round k. The shared flag can reach', { size: 9.5, alpha: on(t, 9.0) });
  label(P, 56, 440, 'that value again only by the flip that ends round k, so a stale read is impossible.', { size: 9.5, alpha: on(t, 9.2) });
}

/* ======================================================================
   SCENE 9 - the two-phase barrier
   ====================================================================== */
function sceneTwoPhase(t) {
  header(P, t, 'The two-phase barrier, and the counting question', 'An arrival semaphore, a departure semaphore, and one counter');

  card(P, 40, 88, 400, 200);
  var code = [
    'P(arrival);',
    'if (++counter < n)',
    '   V(arrival);',
    'else',
    '   V(departure);',
    'P(departure);',
    'if (--counter > 0)',
    '   V(departure);',
    'else',
    '   V(arrival);'
  ];
  for (var i = 0; i < code.length; i++) {
    label(P, 56, 104 + i * 18, code[i], { size: 9.5, mono: true, alpha: on(t, 0.5 + i * 0.3) });
  }
  label(P, 56, 288, 'arrival = 1, departure = 0, counter = 0', { size: 9, mono: true, color: DIM, alpha: on(t, 3.6) });

  card(P, 460, 88, 400, 200);
  label(P, 476, 102, 'Measured over two invocations', { size: 10.5, bold: true, alpha: on(t, 3.8) });
  var rows = [
    ['states, atomic counter', String(M.two2.states), INK],
    ['stuck end states', String(M.two2.stuck), VAL],
    ['processes released early', String(M.two2.violations), VAL],
    ['states, non-atomic counter', String(M.twoRacy.states), INK],
    ['stuck with a non-atomic counter', String(M.twoRacy.stuck), VAL]
  ];
  for (var r = 0; r < rows.length; r++) {
    label(P, 476, 126 + r * 24, rows[r][0], { size: 9.5, color: DIM, alpha: on(t, 4.0 + r * 0.4) });
    label(P, 844, 126 + r * 24, rows[r][1], { size: 11.5, bold: true, mono: true, align: 'right',
                                              color: rows[r][2], alpha: on(t, 4.0 + r * 0.4) });
  }
  label(P, 476, 258, 'Both counters are still correct.', { size: 10, bold: true, color: VAL, alpha: on(t, 6.2) });
  label(P, 476, 276, 'Each sits inside a semaphore-protected region.', { size: 9.5, color: DIM, alpha: on(t, 6.5) });

  card(P, 40, 300, 400, 96, { alpha: on(t, 6.8) });
  label(P, 56, 314, 'Why two phases', { size: 10, bold: true, alpha: on(t, 6.8) });
  label(P, 56, 334, 'Arrival counts up to n; departure counts back', { size: 9.5, color: DIM, alpha: on(t, 7.0) });
  label(P, 56, 350, 'down to 0. The counter is therefore never', { size: 9.5, color: DIM, alpha: on(t, 7.2) });
  label(P, 56, 366, 'reset to a constant, so no stale value exists.', { size: 9.5, color: DIM, alpha: on(t, 7.4) });
  label(P, 56, 384, 'counter = processes still inside the barrier', { size: 9, mono: true, color: ACC, alpha: on(t, 7.6) });

  card(P, 460, 300, 400, 96, { alpha: on(t, 8.0) });
  label(P, 476, 314, 'The counting questions', { size: 10, bold: true, alpha: on(t, 8.0) });
  label(P, 476, 334, 'blocked at once: at most n − 1', { size: 9.5, mono: true, color: INK, alpha: on(t, 8.2) });
  label(P, 476, 350, 'V(departure) issued by the last arrival: 1', { size: 9.5, mono: true, color: INK, alpha: on(t, 8.4) });
  label(P, 476, 366, 'each process passes departure exactly once', { size: 9.5, mono: true, color: INK, alpha: on(t, 8.6) });
  label(P, 476, 384, 'arrival is re-armed by the last one out', { size: 9.5, mono: true, color: INK, alpha: on(t, 8.8) });

  card(P, 40, 408, 820, 44, { fill: SURF2, alpha: on(t, 9.2) });
  label(P, 56, 420, 'Three barriers, three answers to "how do I know which round this is?"', { size: 9.5, bold: true, alpha: on(t, 9.2) });
  label(P, 56, 436, 'reset a constant (2006 code, wrong) · flip a flag (sense reversing, right) · count up then down (two phase, right)', { size: 9.5, color: DIM, alpha: on(t, 9.6) });
}

/* ======================================================================
   SCENE 10 - counts, procedure, traps
   ====================================================================== */
function sceneProcedure(t) {
  header(P, t, 'Counts, reading procedure, and the traps');

  card(P, 40, 84, 400, 208);
  label(P, 56, 98, 'The counts worth knowing', { size: 10.5, bold: true, alpha: on(t, 0.6) });
  var rows = [
    ['processes spinning at once', 'n − 1'],
    ['largest counter value, 2 invocations', '2n − 1'],
    ['largest counter value, option D', '2n'],
    ['processes that must arrive to release', 'n'],
    ['wake-ups from the last arrival', 'n − 1']
  ];
  for (var i = 0; i < rows.length; i++) {
    label(P, 56, 124 + i * 30, rows[i][0], { size: 9.5, color: DIM, alpha: on(t, 0.9 + i * 0.4) });
    label(P, 424, 124 + i * 30, rows[i][1], { size: 11, bold: true, mono: true, align: 'right', alpha: on(t, 0.9 + i * 0.4) });
    rule(P, 56, 142 + i * 30, 424, on(t, 0.9 + i * 0.4) * 0.5);
  }
  label(P, 56, 284, 'measured for n = 2..5; 2n − 1 by derivation', { size: 8.5, color: FAINT, alpha: on(t, 3.6) });

  card(P, 460, 84, 400, 208);
  label(P, 476, 98, 'The reading procedure', { size: 10.5, bold: true, alpha: on(t, 3.8) });
  var steps = [
    '1. Find the counter and who resets it.',
    '2. Ask when the reset can be late.',
    '3. Ask what a stale read can see.',
    '4. Try two invocations, not one.'
  ];
  for (var s = 0; s < steps.length; s++) {
    label(P, 476, 128 + s * 34, steps[s], { size: 10, alpha: on(t, 4.0 + s * 0.5) });
  }
  label(P, 476, 268, 'One invocation correct proves very little.', { size: 9.5, bold: true, color: WARN, alpha: on(t, 6.2) });

  card(P, 40, 306, 820, 84, { fill: WARNDIM, stroke: WARN, alpha: on(t, 6.8) });
  label(P, 56, 320, 'The four traps', { size: 10, bold: true, color: WARN, alpha: on(t, 6.8) });
  label(P, 56, 340, '1. Testing one trace and declaring the barrier correct — ' + M.naive.completed + ' of the runs in scene 7 finish, and it is still broken.',
        { size: 9.5, color: DIM, alpha: on(t, 7.0) });
  label(P, 56, 356, '2. Confusing "spins" with "blocked": a spinning process is runnable, so an OS cannot see the deadlock.',
        { size: 9.5, color: DIM, alpha: on(t, 7.2) });
  label(P, 56, 372, '3. Thinking n arrivals suffice — they do only if the departure gate re-arms the counter in time.',
        { size: 9.5, color: DIM, alpha: on(t, 7.4) });

  card(P, 40, 402, 820, 50, { fill: ACCDIM, stroke: ACC, alpha: on(t, 8.0) });
  label(P, 56, 414, 'The sentence to keep', { size: 10, bold: true, color: ACC, alpha: on(t, 8.0) });
  label(P, 56, 432, 'A barrier needs an arrival gate and a departure gate, and the departure gate must make round k+1 distinguishable from round k.',
        { size: 10, alpha: on(t, 8.4) });
}

/* ---------- the frame ---------- */
var SCENES = [sceneWhat, sceneCode, sceneRound1, sceneDeadlock, sceneRepairs,
              sceneKeyed, sceneNaive, sceneSense, sceneTwoPhase, sceneProcedure];

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
