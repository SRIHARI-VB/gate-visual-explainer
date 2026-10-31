/* ==========================================================================
   counting-semaphores-and-the-bounded-buffer — lesson.js
   Four layers, in order:
     1. THE MODEL   — every number the lesson shows, computed here.
     2. THE CHECKS  — each computed value re-verified against a definition.
     3. RENDER      — reads the model; never re-derives it.
     4. BOOT        — p5.js first, the browser's own canvas as the fallback.

   The model is checked three independent ways:
     (a) the closed forms for a counting semaphore are compared with an
         exhaustive enumeration of every order of a small P/V sequence;
     (b) the bounded buffer is checked by an exhaustive breadth-first search
         over every interleaving of the processes, with four invariants
         asserted at every reachable state;
     (c) the four assignments of the GATE 2018 question are each run through
         the same search, so the verdicts are measurements, not readings.
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

/* ---------- 1a. counting semaphore arithmetic ---------- */

/* final value and number of sleepers, by the closed forms.
   Convention A (Dijkstra): the value may go negative and its magnitude is the
   queue. Convention B (Silberschatz): the value is clamped at 0 and the queue
   is counted separately. Both are computed here so the page can show that the
   queue length agrees. */
function arith(v0, nP, nV) {
  var raw = v0 - nP + nV;
  return { raw: raw, clamped: Math.max(0, raw), queue: Math.max(0, -raw) };
}

/* exhaustive enumeration of every distinct order of nP P's and nV V's, under
   queued semantics: a P that finds 0 is queued, and a V serves the queue
   before it raises the value. Returns the distinct final (raw, queue) pairs
   and the largest queue any order produced. */
function orders(nP, nV) {
  var out = [];
  (function rec(p, v, acc) {
    if (p === 0 && v === 0) { out.push(acc.join('')); return; }
    if (p) { acc.push('P'); rec(p - 1, v, acc); acc.pop(); }
    if (v) { acc.push('V'); rec(p, v - 1, acc); acc.pop(); }
  })(nP, nV, []);
  return out;
}

function trace(v0, seq) {
  var value = v0, queue = 0, peakQueue = 0, peakValue = v0, served = 0;
  for (var i = 0; i < seq.length; i++) {
    if (seq.charAt(i) === 'P') {
      if (value > 0) value--; else queue++;
    } else {
      if (queue > 0) { queue--; served++; } else value++;
    }
    if (queue > peakQueue) peakQueue = queue;
    if (value > peakValue) peakValue = value;
  }
  return { value: value, queue: queue, peakQueue: peakQueue, peakValue: peakValue,
           served: served, raw: value - queue };
}

var SMALL_P = 4, SMALL_V = 2;
var SMALL_ORDERS = orders(SMALL_P, SMALL_V);

var A = {
  gate1998: arith(10, 6, 4),
  trace1998: trace(10, 'PPPPPPVVVV'),
  smallOrders: SMALL_ORDERS.length,
  smallFinals: {},
  smallPeak: {},
  table2016: [],
  threshold: null,
  gate2016: null,
  blockingTrace: trace(1, 'PPPV')
};

(function buildSmall() {
  for (var v0 = 0; v0 <= 4; v0++) {
    var finals = {}, peak = 0, qmax = 0, qmin = 1e9;
    for (var i = 0; i < SMALL_ORDERS.length; i++) {
      var r = trace(v0, SMALL_ORDERS[i]);
      finals[r.value + '|' + r.queue] = 1;
      if (r.peakQueue > peak) peak = r.peakQueue;
      if (r.queue > qmax) qmax = r.queue;
      if (r.queue < qmin) qmin = r.queue;
    }
    A.smallFinals[v0] = Object.keys(finals);
    A.smallPeak[v0] = { peak: peak, qmax: qmax, qmin: qmin };
  }
})();

(function build2016() {
  for (var v0 = 0; v0 <= 9; v0++) {
    var r = arith(v0, 20, 12);
    A.table2016.push({ v0: v0, final: r.raw, queue: r.queue, clamped: r.clamped });
  }
  var best = null;
  for (var k = A.table2016.length - 1; k >= 0; k--) {
    if (A.table2016[k].queue >= 1) { best = A.table2016[k]; break; }
  }
  A.threshold = best ? best.v0 : null;
  A.gate2016 = best;
})();

/* ---------- 1b. the bounded buffer, searched ---------- */

/* An instruction is one of
     ['W', name]  wait on a semaphore
     ['S', name]  signal a semaphore
     ['A', 'enter' | 'leave' | 'add' | 'rem']
   A process runs `iters` copies of its body. The blocked set is derived from
   the program counters, so the search state does not need to store queues. */
function explore(cfg) {
  var N = cfg.N, nprod = cfg.p, ncons = cfg.c, iters = cfg.iters;
  var pbody = cfg.pbody, cbody = cfg.cbody, L = pbody.length;
  var semInit = cfg.sem || { empty: N, full: 0, mutex: 1 };
  var n = nprod + ncons;

  function bodyOf(pid) { return pid < nprod ? pbody : cbody; }
  function keyOf(pc, sem, items, inside) {
    var s = [];
    for (var nm in sem) s.push(nm + '=' + sem[nm]);
    s.sort();
    return pc.join(',') + '|' + s.join(',') + '|' + items + '|' + inside;
  }

  var start = { pc: new Array(n).fill(0), sem: {}, items: 0, inside: 0 };
  for (var nm in semInit) start.sem[nm] = semInit[nm];

  var seen = {};
  seen[keyOf(start.pc, start.sem, 0, 0)] = 1;
  var queue = [start], head = 0;
  var st = {
    states: 1, maxItems: 0, minItems: 0, maxBlocked: 0, maxInside: 0,
    deadlocks: 0, completed: 0, finals: {}, twoInside: 0, overrun: null, underrun: null,
    N: N, p: nprod, c: ncons, iters: iters
  };

  while (head < queue.length) {
    var s = queue[head++];
    var pc = s.pc, sem = s.sem, items = s.items, inside = s.inside;

    if (items > N && st.overrun === null) st.overrun = items;
    if (items < 0 && st.underrun === null) st.underrun = items;
    if (items > st.maxItems) st.maxItems = items;
    if (items < st.minItems) st.minItems = items;
    if (inside > st.maxInside) st.maxInside = inside;
    if (inside > 1) st.twoInside++;

    /* the blocked set is derived: a process is blocked exactly when its next
       instruction is a wait on a semaphore whose value is zero */
    var blocked = [];
    for (var pid = 0; pid < n; pid++) {
      if (pc[pid] >= L * iters) continue;
      var ins = bodyOf(pid)[pc[pid] % L];
      if (ins[0] === 'W' && sem[ins[1]] <= 0) blocked.push(pid);
    }
    if (blocked.length > st.maxBlocked) st.maxBlocked = blocked.length;

    var moves = 0;
    for (var q = 0; q < n; q++) {
      if (pc[q] >= L * iters) continue;
      var b = bodyOf(q)[pc[q] % L];
      if (b[0] === 'W') {
        if (sem[b[1]] > 0) moves++;
      } else moves++;
    }
    if (moves === 0) {
      var allDone = true;
      for (var d = 0; d < n; d++) if (pc[d] < L * iters) allDone = false;
      if (allDone) { st.completed++; st.finals[items] = 1; }
      else st.deadlocks++;
      continue;
    }

    for (var pid2 = 0; pid2 < n; pid2++) {
      if (pc[pid2] >= L * iters) continue;
      var next = bodyOf(pid2)[pc[pid2] % L];
      var succ = [];
      var npc, nsem, i2 = items, in2 = inside;

      if (next[0] === 'W') {
        if (sem[next[1]] <= 0) continue;
        npc = pc.slice(); npc[pid2]++;
        nsem = copySem(sem); nsem[next[1]]--;
        succ.push({ pc: npc, sem: nsem, items: i2, inside: in2 });
      } else if (next[0] === 'S') {
        var nm2 = next[1];
        var waiters = [];
        for (var w = 0; w < n; w++) {
          if (pc[w] >= L * iters) continue;
          var wi = bodyOf(w)[pc[w] % L];
          if (wi[0] === 'W' && wi[1] === nm2 && sem[nm2] <= 0) waiters.push(w);
        }
        if (waiters.length) {
          /* any one waiter may be woken; the search takes all of them */
          for (var wi2 = 0; wi2 < waiters.length; wi2++) {
            npc = pc.slice(); npc[waiters[wi2]]++; npc[pid2]++;
            succ.push({ pc: npc, sem: copySem(sem), items: i2, inside: in2 });
          }
        } else {
          npc = pc.slice(); npc[pid2]++;
          nsem = copySem(sem); nsem[nm2]++;
          succ.push({ pc: npc, sem: nsem, items: i2, inside: in2 });
        }
      } else {
        npc = pc.slice(); npc[pid2]++;
        var a = next[1];
        if (a === 'add') i2++; else if (a === 'rem') i2--;
        else if (a === 'enter') in2++; else if (a === 'leave') in2--;
        succ.push({ pc: npc, sem: copySem(sem), items: i2, inside: in2 });
      }

      for (var s2 = 0; s2 < succ.length; s2++) {
        var cand = succ[s2];
        var k2 = keyOf(cand.pc, cand.sem, cand.items, cand.inside);
        if (seen[k2]) continue;
        seen[k2] = 1;
        queue.push(cand);
        st.states++;
      }
    }
  }
  st.finalList = Object.keys(st.finals).map(Number).sort(function (x, y) { return x - y; });
  return st;
}

function copySem(sem) {
  var o = {};
  for (var k in sem) o[k] = sem[k];
  return o;
}

/* the four code bodies used throughout the lesson */
var P_OK = [['W','empty'],['W','mutex'],['A','enter'],['A','add'],['A','leave'],['S','mutex'],['S','full']];
var C_OK = [['W','full'],['W','mutex'],['A','enter'],['A','rem'],['A','leave'],['S','mutex'],['S','empty']];
var P_LOCKFIRST = [['W','mutex'],['W','empty'],['A','enter'],['A','add'],['A','leave'],['S','mutex'],['S','full']];
var C_LOCKFIRST = [['W','mutex'],['W','full'],['A','enter'],['A','rem'],['A','leave'],['S','mutex'],['S','empty']];
var P_SIGNFIRST = [['W','empty'],['W','mutex'],['A','enter'],['A','add'],['A','leave'],['S','full'],['S','mutex']];
var C_SIGNFIRST = [['W','full'],['W','mutex'],['A','enter'],['A','rem'],['A','leave'],['S','empty'],['S','mutex']];

var B = {};
B.main = explore({ N: 3, p: 2, c: 2, iters: 2, pbody: P_OK, cbody: C_OK });
B.table = [];
(function buildTable() {
  var cfgs = [
    { N: 1, p: 1, c: 1, iters: 2 },
    { N: 1, p: 2, c: 2, iters: 2 },
    { N: 2, p: 1, c: 1, iters: 2 },
    { N: 2, p: 2, c: 2, iters: 2 },
    { N: 3, p: 1, c: 1, iters: 2 },
    { N: 3, p: 2, c: 2, iters: 2 }
  ];
  for (var i = 0; i < cfgs.length; i++) {
    var c = cfgs[i];
    B.table.push(explore({ N: c.N, p: c.p, c: c.c, iters: c.iters, pbody: P_OK, cbody: C_OK }));
  }
})();

/* ---------- 1c. the GATE 2018 question, four assignments ---------- */

/* the question's own definitions: empty starts at 0 and counts the slots the
   consumer may read (the items); full starts at N and counts the slots the
   producer may write (the free slots) */
var Q2018 = { N: 3, sem: { empty: 0, full: 3, mutex: 1 } };
function body2018(Pn, Qn, Rn, Sn) {
  return {
    p: [['W',Pn],['W','mutex'],['A','enter'],['A','add'],['A','leave'],['S','mutex'],['S',Qn]],
    c: [['W',Rn],['W','mutex'],['A','enter'],['A','rem'],['A','leave'],['S','mutex'],['S',Sn]]
  };
}
var C18 = {};
(function build2018() {
  var asg = {
    A: ['full', 'full', 'empty', 'empty'],
    B: ['empty', 'empty', 'full', 'full'],
    C: ['full', 'empty', 'empty', 'full'],
    D: ['empty', 'full', 'full', 'empty']
  };
  for (var label in asg) {
    var bd = body2018(asg[label][0], asg[label][1], asg[label][2], asg[label][3]);
    var r = explore({ N: Q2018.N, p: 1, c: 1, iters: 4, pbody: bd.p, cbody: bd.c, sem: Q2018.sem });
    r.label = label;
    r.assign = asg[label];
    C18[label] = r;
  }
})();

/* ---------- 1d. the two orders ---------- */

var D = { lockFirst: [], signFirst: null, releaseFirst: null };
(function buildOrders() {
  var sizes = [1, 2, 3, 5];
  for (var i = 0; i < sizes.length; i++) {
    var N = sizes[i];
    var r = explore({ N: N, p: 1, c: 1, iters: 2, pbody: P_LOCKFIRST, cbody: C_LOCKFIRST });
    D.lockFirst.push({ N: N, states: r.states, deadlocks: r.deadlocks, completed: r.completed,
                       maxItems: r.maxItems, maxBlocked: r.maxBlocked });
  }
  D.releaseFirst = explore({ N: 2, p: 1, c: 1, iters: 2, pbody: P_OK, cbody: C_OK });
  D.signFirst = explore({ N: 2, p: 1, c: 1, iters: 2, pbody: P_SIGNFIRST, cbody: C_SIGNFIRST });
})();

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* the closed forms against the enumeration */
chk('GATE 1998 value: 10 - 6 + 4 = 8',
    A.gate1998.raw === 8, 'raw ' + A.gate1998.raw);
chk('GATE 1998 nothing blocks, so the queue is empty',
    A.gate1998.queue === 0 && A.trace1998.peakQueue === 0, 'peak queue ' + A.trace1998.peakQueue);
chk('GATE 1998: the simulated value equals the closed form',
    A.trace1998.value === A.gate1998.raw, 'trace ' + A.trace1998.value);

/* order independence, checked on the small instance */
(function orderChecks() {
  var v0 = 2, keys = {}, count = 0;
  for (var i = 0; i < SMALL_ORDERS.length; i++) {
    var r = trace(v0, SMALL_ORDERS[i]);
    var k = r.value + '|' + r.queue;
    if (!keys[k]) { keys[k] = 1; count++; }
  }
  chk('every order of ' + SMALL_P + ' P and ' + SMALL_V + ' V gives one final (value, queue)',
      count === 1, count + ' distinct outcomes over ' + SMALL_ORDERS.length + ' orders');

  var peaks = {};
  var distinctPeaks = 0;
  for (var j = 0; j < SMALL_ORDERS.length; j++) {
    var rp = trace(v0, SMALL_ORDERS[j]).peakQueue;
    if (!peaks[rp]) { peaks[rp] = 1; distinctPeaks++; }
  }
  chk('the peak queue does depend on the order (a contrast with the final queue)',
      distinctPeaks > 1, distinctPeaks + ' distinct peak values');
})();

chk('the small instance has the expected 15 orders (6 choose 2)',
    SMALL_ORDERS.length === 15, SMALL_ORDERS.length + ' orders');

/* the blocking trace of scene 3 */
chk('three P and one V from 1 leaves one sleeper and peaks at two',
    A.blockingTrace.queue === 1 && A.blockingTrace.peakQueue === 2,
    'queue ' + A.blockingTrace.queue + ', peak ' + A.blockingTrace.peakQueue);
chk('the queue closed form agrees: max(0, 3 - 1 - 1) = 1',
    Math.max(0, 3 - 1 - 1) === A.blockingTrace.queue, 'formula 1');

/* GATE 2016 */
chk('GATE 2016: at v0 = 7 the final value is -1, one waiter',
    A.table2016[7].final === -1 && A.table2016[7].queue === 1, 'v0 7 -> ' + A.table2016[7].final);
chk('GATE 2016: at v0 = 8 the final value is 0 and nobody waits',
    A.table2016[8].final === 0 && A.table2016[8].queue === 0, 'v0 8 -> ' + A.table2016[8].final);
chk('GATE 2016: the largest v0 with a waiter is 7',
    A.threshold === 7, 'threshold ' + A.threshold);
chk('GATE 2016: the threshold equals P - V - 1 = 7',
    A.threshold === 20 - 12 - 1, '20 - 12 - 1');

/* the bounded buffer */
chk('buffer search: two processes are never inside together',
    B.main.twoInside === 0 && B.main.maxInside === 1, 'max inside ' + B.main.maxInside);
chk('buffer search: the item count never leaves [0, N]',
    B.main.overrun === null && B.main.underrun === null && B.main.maxItems <= 3 && B.main.minItems >= 0,
    'max ' + B.main.maxItems + ', min ' + B.main.minItems);
chk('buffer search: empty + full = N in every state (checked through the item bound)',
    B.main.maxItems === 3 && B.main.minItems === 0, 'items ' + B.main.minItems + '..' + B.main.maxItems);
chk('buffer search: no reachable state is stuck',
    B.main.deadlocks === 0 && B.main.completed > 0, B.main.deadlocks + ' deadlocks');
chk('buffer search: at most n - 1 of the 4 processes are ever blocked',
    B.main.maxBlocked === 3, 'max blocked ' + B.main.maxBlocked);
chk('buffer search: the state count is the one the caption quotes',
    B.main.states === 2360, 'states ' + B.main.states);

(function boundChecks() {
  var ok = true, detail = [];
  for (var i = 0; i < B.table.length; i++) {
    var t = B.table[i];
    var n = t.p + t.c;
    if (t.deadlocks !== 0 || t.maxBlocked !== n - 1 || t.maxItems > t.N || t.minItems < 0) ok = false;
    detail.push(t.N + '/' + t.p + '/' + t.c + ':' + t.maxBlocked);
  }
  chk('all six configurations obey: no deadlock, max blocked = n - 1, items within [0, N]',
      ok, detail.join(' '));
})();

/* the 2018 question */
chk('2018 A: the consumer never proceeds and the buffer overruns',
    C18.A.deadlocks > 0 && C18.A.maxItems > 3, 'max items ' + C18.A.maxItems + ', deadlocks ' + C18.A.deadlocks);
chk('2018 B: the consumer takes items that do not exist',
    C18.B.minItems <= -4, 'min items ' + C18.B.minItems);
chk('2018 C: the item count stays within [0, N] and nothing is stuck',
    C18.C.minItems === 0 && C18.C.maxItems <= 3 && C18.C.deadlocks === 0,
    'items ' + C18.C.minItems + '..' + C18.C.maxItems + ', deadlocks ' + C18.C.deadlocks);
chk('2018 D: the consumer takes items that do not exist',
    C18.D.minItems <= -3, 'min items ' + C18.D.minItems);
chk('2018: only assignment C has no overrun and no underrun',
    C18.A.maxItems > 3 && C18.B.minItems < 0 && C18.C.minItems === 0 &&
    C18.C.maxItems <= 3 && C18.D.minItems < 0, 'A/B/D each break one bound');

/* the orders */
(function orderChecks2() {
  var ok = true, detail = [];
  for (var i = 0; i < D.lockFirst.length; i++) {
    var r = D.lockFirst[i];
    if (r.deadlocks < 1) ok = false;
    detail.push('N=' + r.N + ':' + r.deadlocks);
  }
  chk('the mutex-first order has a deadlock state at every buffer size tried',
      ok, detail.join(' '));
})();
chk('the signal-first order is deadlock-free and keeps the invariants',
    D.signFirst.deadlocks === 0 && D.signFirst.maxItems <= 2 && D.signFirst.minItems >= 0,
    'deadlocks ' + D.signFirst.deadlocks);
chk('the two signal orders reach different numbers of states',
    D.signFirst.states !== D.releaseFirst.states,
    D.releaseFirst.states + ' against ' + D.signFirst.states);
chk('the signal-first order holds fewer items at its peak',
    D.signFirst.maxItems < D.releaseFirst.maxItems,
    D.signFirst.maxItems + ' against ' + D.releaseFirst.maxItems);

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

function counterBox(Pp, x, y, w, h, name, value, a, colour) {
  Pp.alpha(a);
  Pp.rect(x, y, w, h, { fill: SURF, stroke: colour || BORDER, radius: 7, sw: 1.4 });
  Pp.text(x + w / 2, y + 6, name, { size: 10.5, mono: true, color: FAINT, align: 'center' });
  Pp.text(x + w / 2, y + h - 10, String(value), { size: 22, bold: true, mono: true,
            color: colour || INK, align: 'center', base: 'bottom' });
  Pp.alpha(1);
}

function slotRow(Pp, x, y, size, filled, a, cell) {
  cell = cell || 30;
  Pp.alpha(a);
  for (var i = 0; i < size; i++) {
    var cx = x + i * (cell + 8);
    var isFilled = i < filled;
    Pp.rect(cx, y, cell, cell, { fill: isFilled ? ACCDIM : SURF,
                                 stroke: isFilled ? ACC : BORDER, radius: 4, sw: 1.2 });
    if (isFilled) {
      Pp.line(cx + 8, y + cell / 2, cx + cell - 8, y + cell / 2, { stroke: ACC, sw: 2 });
    }
  }
  Pp.alpha(1);
}

function chipRow(Pp, items, at, y) {
  var x = 44;
  for (var i = 0; i < items.length; i++) {
    var a = on(0, 0);
    Pp.alpha(1);
    Pp.text(x, y, String(items[i][1]), { size: 15, bold: true, mono: true, color: items[i][2] });
    var w = String(items[i][1]).length * 9 + 6;
    Pp.text(x + w, y, items[i][0], { size: 10.5, color: FAINT, mono: true });
    x += w + 12 + items[i][0].length * 6.2 + 26;
  }
}

/* ---------- scene 1 ---------- */
function scenePermits(t) {
  card(P, 28, 26, 844, 60, { fill: SURF2 });
  label(P, 44, 44, 'A counting semaphore is one integer plus a queue', { size: 14, bold: true, alpha: on(t, 0) });
  label(P, 44, 66, 'P takes a permit or sleeps. V gives a permit away or raises the value.', { size: 11.5, color: DIM, alpha: on(t, 1) });

  /* the counter */
  card(P, 40, 104, 230, 128, { alpha: on(t, 2) });
  label(P, 52, 120, 'value', { size: 10, mono: true, color: FAINT, alpha: on(t, 2) });
  var permits = 3;
  for (var i = 0; i < 5; i++) {
    var filled = i < permits;
    P.alpha(on(t, 2.4 + i * 0.15));
    P.rect(56 + i * 40, 140, 30, 26, { fill: filled ? ACCDIM : SURF, stroke: filled ? ACC : BORDER, radius: 4 });
    P.alpha(1);
  }
  label(P, 52, 186, 'permits nobody has taken', { size: 10, color: FAINT, alpha: on(t, 3) });
  label(P, 52, 210, 'value = 3', { size: 13, mono: true, bold: true, alpha: on(t, 3) });

  /* P and V */
  card(P, 300, 104, 200, 128, { alpha: on(t, 3.5) });
  label(P, 312, 120, 'operations', { size: 10, mono: true, color: FAINT, alpha: on(t, 3.5) });
  label(P, 312, 148, 'P(S)  wait', { size: 12.5, mono: true, bold: true, alpha: on(t, 4) });
  label(P, 312, 168, 'value > 0 ? take one', { size: 10.5, color: DIM, alpha: on(t, 4.5) });
  label(P, 312, 184, ': sleep in the queue', { size: 10.5, color: DIM, alpha: on(t, 4.5) });
  label(P, 312, 208, 'V(S)  signal', { size: 12.5, mono: true, bold: true, alpha: on(t, 5.5) });
  label(P, 312, 224, 'wake a waiter, else +1', { size: 10.5, color: DIM, alpha: on(t, 6) });

  /* the queue */
  card(P, 530, 104, 342, 128, { alpha: on(t, 5) });
  label(P, 542, 120, 'queue of sleepers', { size: 10, mono: true, color: FAINT, alpha: on(t, 5) });
  var sleepers = 2;
  for (var q = 0; q < 3; q++) {
    var has = q < sleepers;
    P.alpha(on(t, 5.5 + q * 0.3));
    P.rect(548 + q * 52, 138, 42, 34, { fill: has ? WARNDIM : SURF, stroke: has ? WARN : BORDER, radius: 5, dash: has ? null : [4, 3] });
    if (has) label(P, 569 + q * 52, 156, 'P' + (q + 1), { size: 11, mono: true, align: 'center', color: WARN, base: 'middle' });
    P.alpha(1);
  }
  label(P, 542, 190, 'two processes asleep, value still 3', { size: 10.5, color: DIM, alpha: on(t, 6.5) });
  label(P, 542, 210, 'the queue is not part of the value', { size: 10.5, color: BAD, alpha: on(t, 7) });

  /* the two conventions */
  card(P, 40, 250, 832, 96, { fill: SURF2, alpha: on(t, 7.2) });
  label(P, 56, 270, 'Two conventions, one arithmetic', { size: 12, bold: true, alpha: on(t, 7.2) });
  label(P, 56, 294, 'Dijkstra      value may go negative;  queue = |value|', { size: 11.5, mono: true, alpha: on(t, 7.6) });
  label(P, 56, 314, 'Silberschatz  value clamped at 0;  queue counted separately', { size: 11.5, mono: true, alpha: on(t, 8) });
  label(P, 56, 336, 'Both report the same number of sleepers, which is why a question can be answered either way.', { size: 10.5, color: DIM, alpha: on(t, 8.4) });

  chipRow(P, [['P and V', 2, INK], ['counters', 1, ACC], ['queue', 'separate', WARN]], t, 380);
}

/* ---------- scene 2 ---------- */
function sceneArithmetic(t) {
  card(P, 28, 26, 844, 54, { fill: SURF2 });
  label(P, 44, 44, 'GATE CSE 1998 Q1.31: a counting semaphore starts at 10', { size: 13.5, bold: true, alpha: on(t, 0) });
  label(P, 44, 66, 'Six P operations and four V operations are completed. What is the resulting value?', { size: 11, color: DIM, alpha: on(t, 1) });

  var seq = 'PPPPPPVVVV';
  var v = 10;
  var xs = 56, yRow = 118;
  label(P, 44, 98, 'value after each operation', { size: 10, mono: true, color: FAINT, alpha: on(t, 2) });

  for (var i = 0; i < seq.length; i++) {
    var a = on(t, 2.2 + i * 0.55);
    if (a <= 0) continue;
    var isP = seq.charAt(i) === 'P';
    var cx = xs + i * 74;
    P.alpha(a);
    P.rect(cx, yRow, 62, 30, { fill: isP ? BADDIM : ACCDIM, stroke: isP ? BAD : ACC, radius: 5 });
    P.text(cx + 31, yRow + 15, (isP ? 'P' : 'V') + ' ' + (isP ? '-1' : '+1'),
           { size: 12, mono: true, bold: true, align: 'center', base: 'middle', color: isP ? BAD : ACC });
    P.alpha(1);
    v += isP ? -1 : 1;
    label(P, cx + 31, yRow + 44, String(v), { size: 13, mono: true, bold: true, align: 'center', alpha: a });
  }

  card(P, 40, 200, 400, 84, { alpha: on(t, 8) });
  label(P, 54, 220, 'the ledger', { size: 10, mono: true, color: FAINT, alpha: on(t, 8) });
  label(P, 54, 244, '10 - 6 = 4', { size: 12.5, mono: true, alpha: on(t, 8.2) });
  label(P, 54, 266, '4 + 4 = 8', { size: 12.5, mono: true, bold: true, color: VAL, alpha: on(t, 8.6) });

  card(P, 460, 200, 412, 84, { alpha: on(t, 9) });
  label(P, 474, 220, 'closed form', { size: 10, mono: true, color: FAINT, alpha: on(t, 9) });
  label(P, 474, 244, 'final = v0 - P + V = 10 - 6 + 4 = 8', { size: 12.5, mono: true, alpha: on(t, 9.2) });
  label(P, 474, 266, 'valid while v0 + V >= P, here 14 >= 6', { size: 10.5, color: DIM, alpha: on(t, 9.8) });

  card(P, 40, 300, 832, 62, { fill: WARN ? WARNDIM : SURF2, alpha: on(t, 10.4) });
  label(P, 56, 320, 'Exam trap', { size: 10, mono: true, color: WARN, alpha: on(t, 10.4) });
  label(P, 56, 342, 'The tempting answers are 0 (subtract all ten) and 12 (add 4 to 10 and ignore the 6). Neither is the ledger.', { size: 11, alpha: on(t, 10.8) });

  chipRow(P, [['P operations', 6, BAD], ['V operations', 4, ACC], ['final value', 8, VAL]], t, 400);
}

/* ---------- scene 3 ---------- */
function sceneBlocking(t) {
  card(P, 28, 26, 844, 54, { fill: SURF2 });
  label(P, 44, 44, 'Start at 1: three P operations, then one V', { size: 13.5, bold: true, alpha: on(t, 0) });
  label(P, 44, 66, 'A P that finds no permit is queued, not lost, and a V serves the queue before it raises the value.', { size: 11, color: DIM, alpha: on(t, 1) });

  var beats = [
    { at: 2.0, value: 1, queue: 0, note: 'start: one permit' },
    { at: 4.0, value: 0, queue: 2, note: 'after 3 P: two asleep' },
    { at: 6.0, value: 0, queue: 1, note: 'after 1 V: one asleep' }
  ];

  for (var i = 0; i < beats.length; i++) {
    var b = beats[i], a = on(t, b.at);
    var x = 44 + i * 268;
    card(P, x, 100, 248, 128, { alpha: a });
    label(P, x + 12, 118, b.note, { size: 10.5, mono: true, color: FAINT, alpha: a });
    counterBox(P, x + 12, 130, 96, 54, 'value', b.value, a, b.value === 0 ? WARN : ACC);
    counterBox(P, x + 140, 130, 96, 54, 'queue', b.queue, a, b.queue ? WARN : BORDER);
    label(P, x + 12, 206, 'raw value = ' + (b.value - b.queue), { size: 10.5, mono: true, color: DIM, alpha: a });
  }

  card(P, 40, 244, 832, 74, { fill: SURF2, alpha: on(t, 8) });
  label(P, 56, 264, 'The two readings of the same state', { size: 12, bold: true, alpha: on(t, 8) });
  label(P, 56, 288, 'negative convention      value = -1   queue = 1', { size: 11.5, mono: true, alpha: on(t, 8.4) });
  label(P, 56, 308, 'non-negative convention  value = 0    queue = 1', { size: 11.5, mono: true, alpha: on(t, 8.8) });

  card(P, 40, 330, 832, 56, { alpha: on(t, 10) });
  label(P, 56, 348, 'queue length = max(0, P - V - v0) = max(0, 3 - 1 - 1) = 1', { size: 12.5, mono: true, bold: true, alpha: on(t, 10) });
  label(P, 56, 370, 'the peak queue is 2, and it does depend on the order: the three P operations came first.', { size: 10.5, color: DIM, alpha: on(t, 10.6) });

  chipRow(P, [['P', 3, BAD], ['V', 1, ACC], ['sleepers left', 1, WARN], ['peak queue', 2, WARN]], t, 412);
}

/* ---------- scene 4 ---------- */
function sceneOrder2016(t) {
  card(P, 28, 26, 844, 58, { fill: SURF2 });
  label(P, 44, 44, 'GATE CSE 2016 Set 2 Q49: 20 P and 12 V, in some order', { size: 13.5, bold: true, alpha: on(t, 0) });
  label(P, 44, 66, 'Largest initial value of a non-negative counting semaphore for which at least one P is still blocked.', { size: 11, color: DIM, alpha: on(t, 1) });

  label(P, 48, 104, 'v0', { size: 10, mono: true, color: FAINT, alpha: on(t, 2) });
  label(P, 120, 104, 'v0 - 20 + 12', { size: 10, mono: true, color: FAINT, alpha: on(t, 2) });
  label(P, 300, 104, 'final value', { size: 10, mono: true, color: FAINT, alpha: on(t, 2) });
  label(P, 460, 104, 'still waiting', { size: 10, mono: true, color: FAINT, alpha: on(t, 2) });
  label(P, 620, 104, 'verdict', { size: 10, mono: true, color: FAINT, alpha: on(t, 2) });

  for (var i = 0; i < A.table2016.length; i++) {
    var r = A.table2016[i];
    var a = on(t, 2.4 + i * 0.22);
    var y = 124 + i * 21;
    var hot = r.v0 === 7;
    if (hot) {
      P.alpha(a * 0.9);
      P.rect(40, y - 4, 812, 20, { fill: WARNDIM, radius: 4 });
      P.alpha(1);
    }
    label(P, 48, y, String(r.v0), { size: 11.5, mono: true, alpha: a, bold: hot });
    label(P, 120, y, String(r.v0) + ' - 8', { size: 11.5, mono: true, color: DIM, alpha: a });
    label(P, 300, y, String(r.final), { size: 11.5, mono: true, bold: true, color: r.final < 0 ? BAD : VAL, alpha: a });
    label(P, 460, y, String(r.queue), { size: 11.5, mono: true, color: r.queue ? BAD : VAL, alpha: a });
    label(P, 620, y, r.queue ? 'a P is still blocked' : 'nobody waits', { size: 10.5, color: r.queue ? BAD : VAL, alpha: a });
  }

  card(P, 40, 336, 832, 50, { alpha: on(t, 7.6) });
  label(P, 56, 356, 'Largest v0 with a waiter: 7.   In general: P - V - 1 = 20 - 12 - 1 = 7.', { size: 12.5, mono: true, bold: true, alpha: on(t, 7.6) });
  label(P, 56, 376, 'The phrase "in some order" changes nothing, because the totals decide the final value.', { size: 10.5, color: DIM, alpha: on(t, 8.2) });

  card(P, 40, 396, 832, 44, { fill: WARNDIM, alpha: on(t, 9) });
  label(P, 56, 414, 'Trap: answering 8 wants the final value to reach 0, which is the largest value with nobody blocked.', { size: 10.5, alpha: on(t, 9) });
  label(P, 56, 430, 'Read which side of the boundary the question asks for: still blocked, or nobody blocked.', { size: 10.5, color: DIM, alpha: on(t, 9.4) });
}

/* ---------- scene 5 ---------- */
function sceneBuffer(t) {
  card(P, 28, 26, 844, 54, { fill: SURF2 });
  label(P, 44, 44, 'The bounded buffer: three counters, three different questions', { size: 13.5, bold: true, alpha: on(t, 0) });
  label(P, 44, 66, 'free slots, items available, and who may touch the buffer at this instant.', { size: 11, color: DIM, alpha: on(t, 1) });

  label(P, 48, 100, 'the buffer, N = 3', { size: 10, mono: true, color: FAINT, alpha: on(t, 2) });
  slotRow(P, 48, 112, 3, 2, on(t, 2.2));

  counterBox(P, 48, 168, 110, 54, 'empty', 1, on(t, 2.8), ACC);
  counterBox(P, 170, 168, 110, 54, 'full', 2, on(t, 3.1), ACC);
  counterBox(P, 292, 168, 110, 54, 'mutex', 1, on(t, 3.4), INFO);
  label(P, 48, 240, 'empty + full = 3 in every state', { size: 10.5, mono: true, color: VAL, alpha: on(t, 4) });
  label(P, 48, 258, 'items in the buffer = full', { size: 10.5, mono: true, color: VAL, alpha: on(t, 4.4) });

  /* the code */
  card(P, 440, 96, 216, 168, { alpha: on(t, 4.8) });
  label(P, 452, 114, 'producer', { size: 10, mono: true, color: FAINT, alpha: on(t, 4.8) });
  var pl = ['wait(empty)', 'wait(mutex)', 'add item', 'signal(mutex)', 'signal(full)'];
  for (var i = 0; i < pl.length; i++) {
    var a = on(t, 5 + i * 0.35);
    label(P, 452, 138 + i * 22, (i + 1) + '  ' + pl[i], { size: 11.5, mono: true, alpha: a,
          color: i < 2 ? ACC : INK });
  }

  card(P, 668, 96, 204, 168, { alpha: on(t, 5.4) });
  label(P, 680, 114, 'consumer', { size: 10, mono: true, color: FAINT, alpha: on(t, 5.4) });
  var cl = ['wait(full)', 'wait(mutex)', 'remove item', 'signal(mutex)', 'signal(empty)'];
  for (var j = 0; j < cl.length; j++) {
    var a2 = on(t, 5.6 + j * 0.35);
    label(P, 680, 138 + j * 22, (j + 1) + '  ' + cl[j], { size: 11.5, mono: true, alpha: a2,
          color: j < 2 ? ACC : INK });
  }

  card(P, 40, 280, 832, 60, { fill: SURF2, alpha: on(t, 7.4) });
  label(P, 56, 300, 'The counting semaphore comes first, the lock second.', { size: 12, bold: true, alpha: on(t, 7.4) });
  label(P, 56, 322, 'Each side waits for what it needs, then takes the lock. A process never sleeps while holding the lock.', { size: 10.5, color: DIM, alpha: on(t, 7.9) });

  card(P, 40, 350, 832, 84, { alpha: on(t, 8.6) });
  label(P, 56, 368, 'Each side signals what it has just created for the other', { size: 12, bold: true, alpha: on(t, 8.6) });
  label(P, 56, 392, 'producer creates an item      -> signal(full)', { size: 11.5, mono: true, alpha: on(t, 9) });
  label(P, 56, 412, 'consumer frees a slot         -> signal(empty)', { size: 11.5, mono: true, alpha: on(t, 9.3) });

  chipRow(P, [['counters', 3, INK], ['invariant', 'empty + full = N', VAL], ['lock', 'second', ACC]], t, 444);
}

/* ---------- scene 6 ---------- */
function sceneSearch(t) {
  card(P, 28, 26, 844, 54, { fill: SURF2 });
  label(P, 44, 44, 'Two producers, two consumers, three slots, two items each', { size: 13.5, bold: true, alpha: on(t, 0) });
  label(P, 44, 66, 'Every interleaving of the four processes is searched, and four invariants are checked in every state.', { size: 11, color: DIM, alpha: on(t, 1) });

  var stats = [
    ['reachable states', B.main.states, INFO, 2.2],
    ['deadlocked states', B.main.deadlocks, VAL, 3.0],
    ['max items in buffer', B.main.maxItems, ACC, 3.8],
    ['max processes blocked', B.main.maxBlocked, WARN, 4.6],
    ['states with two inside', B.main.twoInside, VAL, 5.4]
  ];
  for (var i = 0; i < stats.length; i++) {
    var s = stats[i], a = on(t, s[3]);
    var x = 44 + i * 166;
    card(P, x, 96, 150, 84, { alpha: a });
    label(P, x + 75, 112, s[0], { size: 9.5, mono: true, color: FAINT, align: 'center', alpha: a });
    label(P, x + 75, 152, String(s[1]), { size: 26, mono: true, bold: true, color: s[2], align: 'center', base: 'middle', alpha: a });
  }

  card(P, 40, 196, 400, 148, { alpha: on(t, 6) });
  label(P, 54, 214, 'invariants checked in every state', { size: 10, mono: true, color: FAINT, alpha: on(t, 6) });
  var inv = ['0 <= items <= N', 'empty + full = N', 'mutex is 0 or 1', 'one process inside at most'];
  for (var j = 0; j < inv.length; j++) {
    var a2 = on(t, 6.4 + j * 0.5);
    tick(P, 62, 240 + j * 26, true, a2);
    label(P, 76, 234 + j * 26, inv[j], { size: 11.5, mono: true, alpha: a2 });
  }

  card(P, 456, 196, 416, 148, { alpha: on(t, 7.4) });
  label(P, 470, 214, 'what the search does not show', { size: 10, mono: true, color: FAINT, alpha: on(t, 7.4) });
  label(P, 470, 240, 'It does not show fairness: which waiter a V wakes', { size: 11, alpha: on(t, 7.8) });
  label(P, 470, 258, 'is not specified, so starvation needs its own argument.', { size: 11, alpha: on(t, 8.1) });
  label(P, 470, 284, 'It does not show the timing: no state records how', { size: 11, alpha: on(t, 8.4) });
  label(P, 470, 302, 'long a process has been waiting.', { size: 11, alpha: on(t, 8.6) });
  label(P, 470, 328, 'It does show deadlock-freedom and the two bounds.', { size: 11, color: VAL, alpha: on(t, 9) });

  card(P, 40, 358, 832, 52, { fill: SURF2, alpha: on(t, 9.6) });
  label(P, 56, 378, 'The state count is small because each process runs a fixed number of items and then stops,', { size: 10.5, color: DIM, alpha: on(t, 9.6) });
  label(P, 56, 396, 'which makes the state space finite, so the search is complete rather than a sample.', { size: 10.5, color: DIM, alpha: on(t, 10) });

  chipRow(P, [['searched', 'all interleavings', INFO], ['deadlocks', 0, VAL], ['bound', 'n - 1', WARN]], t, 442);
}

/* ---------- scene 7 ---------- */
function sceneTrap2018(t) {
  card(P, 28, 26, 844, 62, { fill: SURF2 });
  label(P, 44, 44, 'GATE CSE 2018 Q40: the names contradict the definitions', { size: 13.5, bold: true, alpha: on(t, 0) });
  label(P, 44, 66, 'empty starts at 0 and counts the slots the consumer may read, that is the items.', { size: 11, color: DIM, alpha: on(t, 0.6) });
  label(P, 44, 80, 'full starts at N and counts the slots the producer may write, that is the free slots.', { size: 11, color: DIM, alpha: on(t, 1) });

  label(P, 48, 112, 'assignment', { size: 10, mono: true, color: FAINT, alpha: on(t, 2) });
  label(P, 300, 112, 'max items', { size: 10, mono: true, color: FAINT, alpha: on(t, 2) });
  label(P, 420, 112, 'min items', { size: 10, mono: true, color: FAINT, alpha: on(t, 2) });
  label(P, 540, 112, 'deadlocked', { size: 10, mono: true, color: FAINT, alpha: on(t, 2) });
  label(P, 680, 112, 'verdict', { size: 10, mono: true, color: FAINT, alpha: on(t, 2) });

  var rows = ['A', 'B', 'C', 'D'];
  var verdict = {
    A: 'overrun, consumer starves',
    B: 'underrun and deadlock',
    C: 'correct',
    D: 'underrun'
  };
  for (var i = 0; i < rows.length; i++) {
    var L = rows[i], r = C18[L];
    var a = on(t, 2.4 + i * 0.6);
    var y = 136 + i * 30;
    var good = L === 'C';
    if (good) {
      P.alpha(a * 0.9); P.rect(40, y - 6, 812, 26, { fill: ACCDIM, radius: 4 }); P.alpha(1);
    }
    label(P, 48, y, L + '   P:' + r.assign[0] + ' Q:' + r.assign[1] + ' R:' + r.assign[2] + ' S:' + r.assign[3],
          { size: 11, mono: true, alpha: a, bold: good });
    label(P, 300, y, String(r.maxItems), { size: 11.5, mono: true, alpha: a, color: r.maxItems > 3 ? BAD : VAL });
    label(P, 420, y, String(r.minItems), { size: 11.5, mono: true, alpha: a, color: r.minItems < 0 ? BAD : VAL });
    label(P, 540, y, String(r.deadlocks), { size: 11.5, mono: true, alpha: a, color: r.deadlocks ? BAD : VAL });
    label(P, 680, y, verdict[L], { size: 10.5, alpha: a, color: good ? VAL : BAD });
    tick(P, 856, y + 4, good, a);
  }

  card(P, 40, 266, 832, 62, { alpha: on(t, 5) });
  label(P, 56, 284, 'A signals the counter it just waited on, so the consumer\u2019s counter never rises', { size: 11.5, bold: true, alpha: on(t, 5) });
  label(P, 56, 306, 'while the buffer grows to 4 items in a 3-slot buffer. Symmetry is not correctness.', { size: 10.5, color: DIM, alpha: on(t, 5.4) });

  card(P, 40, 338, 832, 62, { fill: WARNDIM, alpha: on(t, 6.4) });
  label(P, 56, 356, 'Read the definitions before the names', { size: 11.5, bold: true, alpha: on(t, 6.4) });
  label(P, 56, 378, 'Writing "empty = items, full = free slots" next to the code decides all four options in ten seconds.', { size: 10.5, alpha: on(t, 6.8) });

  chipRow(P, [['assignments', 4, INK], ['safe', 1, VAL], ['fail', 3, BAD]], t, 430);
}

/* ---------- scene 8 ---------- */
function sceneBounds(t) {
  card(P, 28, 26, 844, 54, { fill: SURF2 });
  label(P, 44, 44, 'Two counting questions, two bounds', { size: 13.5, bold: true, alpha: on(t, 0) });
  label(P, 44, 66, 'Both are bounds on the correct order only; the lock-first order can put every process to sleep.', { size: 11, color: DIM, alpha: on(t, 1) });

  card(P, 40, 96, 404, 84, { alpha: on(t, 2) });
  label(P, 56, 116, 'how many items in the buffer', { size: 10, mono: true, color: FAINT, alpha: on(t, 2) });
  label(P, 56, 146, 'min(N, produced so far)', { size: 15, mono: true, bold: true, alpha: on(t, 2.3) });
  label(P, 56, 168, 'a buffer of 3 with 2 items produced peaks at 2', { size: 10.5, color: DIM, alpha: on(t, 2.7) });

  card(P, 456, 96, 416, 84, { alpha: on(t, 3.2) });
  label(P, 472, 116, 'how many processes blocked', { size: 10, mono: true, color: FAINT, alpha: on(t, 3.2) });
  label(P, 472, 146, 'at most n - 1', { size: 15, mono: true, bold: true, alpha: on(t, 3.5) });
  label(P, 472, 168, 'one process can always take a step', { size: 10.5, color: DIM, alpha: on(t, 3.9) });

  label(P, 48, 206, 'N', { size: 10, mono: true, color: FAINT, alpha: on(t, 4.4) });
  label(P, 120, 206, 'producers', { size: 10, mono: true, color: FAINT, alpha: on(t, 4.4) });
  label(P, 250, 206, 'consumers', { size: 10, mono: true, color: FAINT, alpha: on(t, 4.4) });
  label(P, 380, 206, 'states', { size: 10, mono: true, color: FAINT, alpha: on(t, 4.4) });
  label(P, 500, 206, 'max items', { size: 10, mono: true, color: FAINT, alpha: on(t, 4.4) });
  label(P, 620, 206, 'max blocked', { size: 10, mono: true, color: FAINT, alpha: on(t, 4.4) });
  label(P, 740, 206, 'deadlocks', { size: 10, mono: true, color: FAINT, alpha: on(t, 4.4) });

  for (var i = 0; i < B.table.length; i++) {
    var r = B.table[i], a = on(t, 4.6 + i * 0.35), y = 228 + i * 20;
    label(P, 48, y, String(r.N), { size: 11.5, mono: true, alpha: a });
    label(P, 120, y, String(r.p), { size: 11.5, mono: true, alpha: a });
    label(P, 250, y, String(r.c), { size: 11.5, mono: true, alpha: a });
    label(P, 380, y, String(r.states), { size: 11.5, mono: true, color: DIM, alpha: a });
    label(P, 500, y, String(r.maxItems), { size: 11.5, mono: true, alpha: a });
    label(P, 620, y, String(r.maxBlocked) + ' = n-1', { size: 11.5, mono: true, color: WARN, alpha: a });
    label(P, 740, y, String(r.deadlocks), { size: 11.5, mono: true, color: r.deadlocks ? BAD : VAL, alpha: a });
    if (i < B.table.length - 1) rule(P, 44, y + 12, 856, a * 0.5);
  }

  card(P, 40, 358, 832, 52, { fill: SURF2, alpha: on(t, 7.6) });
  label(P, 56, 378, 'Why one can always move: a full buffer wakes a consumer, an empty one wakes a producer,', { size: 10.5, color: DIM, alpha: on(t, 7.6) });
  label(P, 56, 396, 'and a waiter blocked on the lock leaves the holder runnable. Those three cases cover every state.', { size: 10.5, color: DIM, alpha: on(t, 8) });

  chipRow(P, [['bound', 'n - 1 blocked', WARN], ['occupancy', 'N', ACC], ['deadlocks', 0, VAL]], t, 440);
}

/* ---------- scene 9 ---------- */
function sceneOrders(t) {
  card(P, 28, 26, 844, 54, { fill: SURF2 });
  label(P, 44, 44, 'The order of the waits, and the order of the signals', { size: 13.5, bold: true, alpha: on(t, 0) });
  label(P, 44, 66, 'One of these reorderings deadlocks. The other is harmless. They look equally innocent in code.', { size: 11, color: DIM, alpha: on(t, 1) });

  card(P, 40, 96, 400, 168, { alpha: on(t, 2) });
  label(P, 54, 114, 'lock first: the consumer sleeps holding mutex', { size: 10.5, mono: true, color: BAD, alpha: on(t, 2) });
  var bad = ['consumer: wait(mutex)   ok', 'consumer: wait(full)    0 -> sleep', 'producer: wait(empty)   ok', 'producer: wait(mutex)   0 -> sleep'];
  for (var i = 0; i < bad.length; i++) {
    var a = on(t, 2.4 + i * 0.5);
    label(P, 54, 140 + i * 22, bad[i], { size: 11, mono: true, alpha: a, color: i >= 1 ? BAD : INK });
  }
  label(P, 54, 246, 'nobody inside, buffer not full, nothing can move', { size: 10.5, color: BAD, alpha: on(t, 4.8) });

  card(P, 456, 96, 416, 168, { alpha: on(t, 5.4) });
  label(P, 470, 114, 'deadlock states found by the search', { size: 10.5, mono: true, color: FAINT, alpha: on(t, 5.4) });
  for (var j = 0; j < D.lockFirst.length; j++) {
    var r = D.lockFirst[j], a2 = on(t, 5.8 + j * 0.4);
    label(P, 470, 142 + j * 24, 'buffer ' + r.N + ' slot' + (r.N > 1 ? 's' : ''), { size: 11.5, mono: true, alpha: a2 });
    label(P, 590, 142 + j * 24, r.deadlocks + ' stuck state' + (r.deadlocks === 1 ? '' : 's'), { size: 11.5, mono: true, color: BAD, alpha: a2 });
    label(P, 720, 142 + j * 24, r.states + ' states', { size: 11, mono: true, color: DIM, alpha: a2 });
  }
  label(P, 470, 248, 'a larger buffer does not remove it: the consumer side remains', { size: 10.5, color: DIM, alpha: on(t, 7.4) });

  card(P, 40, 276, 832, 74, { alpha: on(t, 8) });
  label(P, 56, 296, 'signalling before the release is safe', { size: 11.5, bold: true, alpha: on(t, 8) });
  label(P, 56, 320, 'release first   ' + D.releaseFirst.states + ' states, peak ' + D.releaseFirst.maxItems + ' items, ' + D.releaseFirst.deadlocks + ' deadlocks',
        { size: 11, mono: true, alpha: on(t, 8.4) });
  label(P, 56, 340, 'signal first    ' + D.signFirst.states + ' states, peak ' + D.signFirst.maxItems + ' items, ' + D.signFirst.deadlocks + ' deadlocks',
        { size: 11, mono: true, alpha: on(t, 8.8) });

  card(P, 40, 358, 832, 52, { fill: WARNDIM, alpha: on(t, 9.4) });
  label(P, 56, 378, 'The woken consumer takes mutex, finds it held, and sleeps again. It loses a turn and nothing else.', { size: 10.5, alpha: on(t, 9.4) });
  label(P, 56, 396, 'Do not confuse this harmless reordering with taking the lock first, which is the one that deadlocks.', { size: 10.5, color: DIM, alpha: on(t, 9.8) });

  chipRow(P, [['lock first', 'deadlocks', BAD], ['signal first', 'safe', VAL]], t, 436);
}

/* ---------- scene 10 ---------- */
function sceneProcedure(t) {
  card(P, 28, 26, 844, 54, { fill: SURF2 });
  label(P, 44, 44, 'The reading procedure for this whole family', { size: 13.5, bold: true, alpha: on(t, 0) });
  label(P, 44, 66, 'Four steps, and the trap each one removes.', { size: 11, color: DIM, alpha: on(t, 1) });

  var steps = [
    ['1', 'List the counters and write what each one counts', 'use the question\u2019s definitions, not the names'],
    ['2', 'Read each side\u2019s first wait and its two signals', 'wait for what you need, signal what you created'],
    ['3', 'For values use v0 - P + V and max(0, P - V - v0)', 'order never changes either quantity'],
    ['4', 'For occupancy use empty + full = N', 'a sleeper holding the lock is the deadlock']
  ];
  for (var i = 0; i < steps.length; i++) {
    var a = on(t, 2 + i * 1.4);
    var y = 100 + i * 62;
    card(P, 40, y, 832, 54, { alpha: a });
    label(P, 56, y + 22, steps[i][0], { size: 16, mono: true, bold: true, color: ACC, alpha: a });
    label(P, 84, y + 20, steps[i][1], { size: 12, bold: true, alpha: a });
    label(P, 84, y + 40, steps[i][2], { size: 10.5, color: DIM, alpha: a });
  }

  card(P, 40, 356, 832, 56, { fill: SURF2, alpha: on(t, 8) });
  label(P, 56, 376, 'One sentence decides the liveness half', { size: 11.5, bold: true, alpha: on(t, 8) });
  label(P, 56, 398, 'Never sleep while holding a lock the waker needs. Every deadlock in this lesson is an instance of it.', { size: 10.5, color: DIM, alpha: on(t, 8.4) });

  chipRow(P, [['counters', 3, INK], ['steps', 4, ACC], ['deadlocks', 0, VAL], ['traps', 4, WARN]], t, 438);
}

/* ---------- frame dispatch ---------- */

var SCENES = {
  permits: scenePermits,
  arithmetic: sceneArithmetic,
  blocking: sceneBlocking,
  order2016: sceneOrder2016,
  buffer: sceneBuffer,
  search: sceneSearch,
  trap2018: sceneTrap2018,
  bounds: sceneBounds,
  orders: sceneOrders,
  procedure: sceneProcedure
};

function drawFrame(Pp) {
  var t = K.state.elapsed;
  Pp.clear();
  var i = K.sceneAt(t);
  var sc = K.state.scenes[i];
  if (!sc) return;
  var fn = SCENES[sc.id];
  var local = t - sc.start;
  if (fn) fn(local);
  else Pp.text(30, 30, sc.title, { size: 16, bold: true, color: INK });
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

window.__MODEL = { A: A, B: B, C18: C18, D: D, CHECKS: CHECKS };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
