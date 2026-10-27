(function () {
  'use strict';

  var W = 900, H = 470;
  var K = window.LessonKit;
  var PR = window.Painters;
  var PAL = PR.PAL;
  var P = null;

/* ======================================================================
   LAYER 1 - THE MODEL (cpu-scheduling)
   Pure data and pure functions. No drawing here. Nothing in this section
   knows what a canvas is. Every number the lesson quotes is computed here,
   and the checks below re-verify it against the definitions.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}
function near(a, b, eps) { eps = eps === undefined ? 1e-9 : eps; return Math.abs(a - b) <= eps; }

/* the process set used in every scene: (id, arrival, burst) */
var PROCS = [
  { id: 'A', arrival: 0, burst: 10 },
  { id: 'B', arrival: 2, burst: 6 },
  { id: 'C', arrival: 4, burst: 3 },
  { id: 'D', arrival: 6, burst: 7 }
];
/* the priority example: (id, arrival, burst, priority) - larger number = higher */
var PRIO = [
  { id: 'P1', arrival: 0, burst: 8, prio: 2 },
  { id: 'P2', arrival: 1, burst: 3, prio: 1 },
  { id: 'P3', arrival: 2, burst: 2, prio: 3 }
];

function ids(procs) { return procs.map(function (p) { return p.id; }); }
function byId(procs, id) {
  for (var i = 0; i < procs.length; i++) if (procs[i].id === id) return procs[i];
  return null;
}
function totalBurst(procs) {
  var s = 0;
  for (var i = 0; i < procs.length; i++) s += procs[i].burst;
  return s;
}
function firstArrival(procs) {
  var m = Infinity;
  for (var i = 0; i < procs.length; i++) if (procs[i].arrival < m) m = procs[i].arrival;
  return m;
}

/* a segment is one contiguous run of one process: {id, start, end} */
function pushSeg(segs, id, start, end) {
  if (end <= start) return;
  var last = segs[segs.length - 1];
  if (last && last.id === id && near(last.end, start)) last.end = end;
  else segs.push({ id: id, start: start, end: end });
}

/* ---------------- the simulators ---------------- */

/* First Come First Served: arrival order, never preempts */
function fcfs(procs) {
  var order = procs.slice().sort(function (a, b) {
    return a.arrival - b.arrival || ids(procs).indexOf(a.id) - ids(procs).indexOf(b.id);
  });
  var t = 0, segs = [], comp = {};
  for (var i = 0; i < order.length; i++) {
    var p = order[i];
    if (t < p.arrival) t = p.arrival;          /* the axis advances through idle time */
    pushSeg(segs, p.id, t, t + p.burst);
    t += p.burst;
    comp[p.id] = t;
  }
  return { segs: segs, comp: comp };
}

/* non-preemptive Shortest Job First: shortest burst among those that have arrived */
function sjf(procs) {
  var t = firstArrival(procs), segs = [], comp = {}, done = {};
  while (Object.keys(done).length < procs.length) {
    var avail = procs.filter(function (p) { return !done[p.id] && p.arrival <= t; });
    if (!avail.length) {
      var next = Infinity;
      procs.forEach(function (p) { if (!done[p.id] && p.arrival > t && p.arrival < next) next = p.arrival; });
      t = next;
      continue;
    }
    var pick = avail[0];
    for (var i = 1; i < avail.length; i++) {
      if (avail[i].burst < pick.burst) pick = avail[i];
      else if (avail[i].burst === pick.burst && avail[i].arrival < pick.arrival) pick = avail[i];
    }
    pushSeg(segs, pick.id, t, t + pick.burst);
    t += pick.burst;
    comp[pick.id] = t;
    done[pick.id] = true;
  }
  return { segs: segs, comp: comp };
}

/* Shortest Remaining Time First: preempt only at an arrival */
function srtf(procs) {
  var t = firstArrival(procs), segs = [], comp = {}, rem = {}, done = {};
  procs.forEach(function (p) { rem[p.id] = p.burst; });
  while (Object.keys(done).length < procs.length) {
    var avail = procs.filter(function (p) { return !done[p.id] && p.arrival <= t; });
    if (!avail.length) {
      var next = Infinity;
      procs.forEach(function (p) { if (!done[p.id] && p.arrival > t && p.arrival < next) next = p.arrival; });
      t = next;
      continue;
    }
    var pick = avail[0];
    for (var i = 1; i < avail.length; i++) {
      if (rem[avail[i].id] < rem[pick.id]) pick = avail[i];
      else if (rem[avail[i].id] === rem[pick.id] && avail[i].arrival < pick.arrival) pick = avail[i];
    }
    /* run until the next arrival, or until it finishes, whichever is first */
    var horizon = Infinity;
    procs.forEach(function (p) {
      if (!done[p.id] && p.arrival > t && p.arrival < horizon) horizon = p.arrival;
    });
    var run = Math.min(rem[pick.id], horizon - t);
    pushSeg(segs, pick.id, t, t + run);
    t += run;
    rem[pick.id] -= run;
    if (rem[pick.id] <= 0) { comp[pick.id] = t; done[pick.id] = true; }
  }
  return { segs: segs, comp: comp };
}

/* Round Robin with quantum q: FIFO ready queue, timer preemption */
function rr(procs, q) {
  var order = ids(procs), arr = {}, rem = {}, comp = {}, done = {};
  procs.forEach(function (p) { arr[p.id] = p.arrival; rem[p.id] = p.burst; });
  var t = firstArrival(procs), segs = [], queue = [];
  order.forEach(function (id) { if (arr[id] <= t) queue.push(id); });
  while (Object.keys(done).length < procs.length) {
    if (!queue.length) {
      var next = Infinity;
      order.forEach(function (id) { if (!done[id] && arr[id] > t && arr[id] < next) next = arr[id]; });
      t = next;
      order.forEach(function (id) {
        if (!done[id] && arr[id] <= t && queue.indexOf(id) < 0) queue.push(id);
      });
      continue;
    }
    var pid = queue.shift();
    if (done[pid]) continue;
    var run = Math.min(q, rem[pid]);
    pushSeg(segs, pid, t, t + run);
    var from = t;
    t += run;
    rem[pid] -= run;
    /* arrivals during the slice join the tail, ahead of the preempted process */
    order.forEach(function (id) {
      if (!done[id] && id !== pid && arr[id] > from && arr[id] <= t && queue.indexOf(id) < 0) queue.push(id);
    });
    if (rem[pid] <= 0) { comp[pid] = t; done[pid] = true; }
    else queue.push(pid);
  }
  return { segs: segs, comp: comp };
}

/* priority: preemptive or not; larger number = higher priority */
function prio(procs, preemptive) {
  var t = firstArrival(procs), segs = [], comp = {}, rem = {}, done = {};
  procs.forEach(function (p) { rem[p.id] = p.burst; });
  while (Object.keys(done).length < procs.length) {
    var avail = procs.filter(function (p) { return !done[p.id] && p.arrival <= t; });
    if (!avail.length) {
      var next = Infinity;
      procs.forEach(function (p) { if (!done[p.id] && p.arrival > t && p.arrival < next) next = p.arrival; });
      t = next;
      continue;
    }
    var pick = avail[0];
    for (var i = 1; i < avail.length; i++) {
      if (avail[i].prio > pick.prio) pick = avail[i];
      else if (avail[i].prio === pick.prio && avail[i].arrival < pick.arrival) pick = avail[i];
    }
    var run;
    if (preemptive) {
      var horizon = Infinity;
      procs.forEach(function (p) {
        if (!done[p.id] && p.arrival > t && p.arrival < horizon) horizon = p.arrival;
      });
      run = Math.min(rem[pick.id], horizon - t);
    } else {
      run = rem[pick.id];
    }
    pushSeg(segs, pick.id, t, t + run);
    t += run;
    rem[pick.id] -= run;
    if (rem[pick.id] <= 0) { comp[pick.id] = t; done[pick.id] = true; }
  }
  return { segs: segs, comp: comp };
}

/* multilevel feedback queue: quanta[0] at the top, last queue is FCFS */
function mlfq(procs, quanta) {
  var order = ids(procs), arr = {}, rem = {}, comp = {}, done = {};
  procs.forEach(function (p) { arr[p.id] = p.arrival; rem[p.id] = p.burst; });
  var queues = quanta.map(function () { return []; });
  var t = firstArrival(procs), segs = [];
  order.forEach(function (id) { if (arr[id] <= t) queues[0].push(id); });
  while (Object.keys(done).length < procs.length) {
    var lvl = -1;
    for (var i = 0; i < queues.length; i++) { if (queues[i].length) { lvl = i; break; } }
    if (lvl < 0) {
      var next = Infinity;
      order.forEach(function (id) { if (!done[id] && arr[id] > t && arr[id] < next) next = arr[id]; });
      t = next;
      order.forEach(function (id) { if (!done[id] && arr[id] <= t && queues[0].indexOf(id) < 0) queues[0].push(id); });
      continue;
    }
    var pid = queues[lvl].shift();
    if (done[pid]) continue;
    var quantum = quanta[lvl];
    var run = isFinite(quantum) ? Math.min(quantum, rem[pid]) : rem[pid];
    pushSeg(segs, pid, t, t + run);
    var from = t;
    t += run;
    rem[pid] -= run;
    order.forEach(function (id) {
      if (!done[id] && id !== pid && arr[id] > from && arr[id] <= t) {
        if (queues[0].indexOf(id) < 0) queues[0].push(id);
      }
    });
    if (rem[pid] <= 0) { comp[pid] = t; done[pid] = true; }
    else {
      var down = Math.min(lvl + 1, queues.length - 1);
      queues[down].push(pid);
    }
  }
  return { segs: segs, comp: comp };
}

/* ---------------- the metrics ---------------- */

function metrics(res, procs) {
  var wait = {}, tat = {}, resp = {}, first = {};
  res.segs.forEach(function (s) { if (first[s.id] === undefined) first[s.id] = s.start; });
  procs.forEach(function (p) {
    tat[p.id] = res.comp[p.id] - p.arrival;
    wait[p.id] = tat[p.id] - p.burst;
    resp[p.id] = first[p.id] - p.arrival;
  });
  return {
    wait: wait, tat: tat, resp: resp, first: first,
    avgWait: mean(procs.map(function (p) { return wait[p.id]; })),
    avgTat: mean(procs.map(function (p) { return tat[p.id]; })),
    avgResp: mean(procs.map(function (p) { return resp[p.id]; }))
  };
}
function mean(a) {
  var s = 0;
  for (var i = 0; i < a.length; i++) s += a[i];
  return a.length ? s / a.length : 0;
}

/* ---------------- the runs the lesson quotes ---------------- */

var R_FCFS = fcfs(PROCS);   R_FCFS.m = metrics(R_FCFS, PROCS);
var R_SJF  = sjf(PROCS);    R_SJF.m  = metrics(R_SJF, PROCS);
var R_SRTF = srtf(PROCS);   R_SRTF.m = metrics(R_SRTF, PROCS);
var R_RR4  = rr(PROCS, 4);  R_RR4.m  = metrics(R_RR4, PROCS);
var R_RR10 = rr(PROCS, 10); R_RR10.m = metrics(R_RR10, PROCS);
var R_RR20 = rr(PROCS, 20); R_RR20.m = metrics(R_RR20, PROCS);
var R_PP   = prio(PRIO, true);  R_PP.m  = metrics(R_PP, PRIO);
var R_PN   = prio(PRIO, false); R_PN.m  = metrics(R_PN, PRIO);
var R_MLFQ = mlfq(PROCS, [2, 4, Infinity]); R_MLFQ.m = metrics(R_MLFQ, PROCS);

var SEQ = function (res) {
  return res.segs.map(function (s) { return s.id; }).join('');
};

/* ---------------- optimality by enumeration ---------------- */

/* every order that respects arrivals and non-preemption */
function feasibleOrders(procs) {
  var out = [];
  var list = procs.slice();
  (function permute(prefix, rest) {
    if (!rest.length) { out.push(prefix.slice()); return; }
    for (var i = 0; i < rest.length; i++) {
      var next = rest.slice(0, i).concat(rest.slice(i + 1));
      prefix.push(rest[i]);
      permute(prefix, next);
      prefix.pop();
    }
  })([], list);
  return out.filter(function (order) {
    var t = 0;
    for (var i = 0; i < order.length; i++) {
      if (order[i].arrival > t) {
        for (var j = i; j < order.length; j++) if (order[j].arrival <= t) return false;
        t = order[i].arrival;
      }
      t += order[i].burst;
    }
    return true;
  });
}

function avgWaitOfOrder(order) {
  var t = 0, sum = 0;
  for (var i = 0; i < order.length; i++) {
    if (order[i].arrival > t) t = order[i].arrival;
    sum += t - order[i].arrival;
    t += order[i].burst;
  }
  return sum / order.length;
}

function bestFeasibleAvgWait(procs) {
  var best = Infinity, bestOrder = null;
  feasibleOrders(procs).forEach(function (o) {
    var v = avgWaitOfOrder(o);
    if (v < best - 1e-12) { best = v; bestOrder = o.map(function (p) { return p.id; }).join(''); }
  });
  return { value: best, order: bestOrder };
}

/* ---------------- the switch cost ---------------- */

function utilisation(s, q) { return q / (q + s); }
function lossFraction(s, q) { return s / (q + s); }

/* ---------------- previous-year instances ---------------- */

/* GATE CSE 2025 Set 2, Q26: SRTF, average turnaround */
var G25 = [
  { id: 'P1', arrival: 0, burst: 10 },
  { id: 'P2', arrival: 1, burst: 13 },
  { id: 'P3', arrival: 2, burst: 6 },
  { id: 'P4', arrival: 8, burst: 9 }
];
var R_G25 = srtf(G25); R_G25.m = metrics(R_G25, G25);

/* GATE CSE 2021 Set 1, Q25: three bursts at time zero, non-preemptive, known */
var G21 = [
  { id: 'X', arrival: 0, burst: 16 },
  { id: 'Y', arrival: 0, burst: 20 },
  { id: 'Z', arrival: 0, burst: 10 }
];
var R_G21 = sjf(G21); R_G21.m = metrics(R_G21, G21);

/* GATE CSE 2022, Q42: round robin, quantum 4, count the transitions */
function transitions(res) {
  var out = [];
  for (var i = 1; i < res.segs.length; i++) {
    out.push(res.segs[i - 1].id + '>' + res.segs[i].id);
  }
  return out;
}
function countOf(list, x) {
  var c = 0;
  for (var i = 0; i < list.length; i++) if (list[i] === x) c++;
  return c;
}
var G22 = {
  A: [4, 10, 6, 2], B: [2, 9, 5, 1], C: [4, 12, 5, 4], D: [3, 7, 7, 3]
};
function g22Run(opt) {
  var b = G22[opt];
  var procs = [
    { id: 'P', arrival: 0, burst: b[0] },
    { id: 'Q', arrival: 0, burst: b[1] },
    { id: 'R', arrival: 0, burst: b[2] },
    { id: 'S', arrival: 0, burst: b[3] }
  ];
  return transitions(rr(procs, 4));
}

/* ---------------- the checks ---------------- */

function buildChecks() {
  var total = totalBurst(PROCS);

  /* the charts are real charts: segments tile the timeline, lengths add up */
  chk('FCFS draws four segments', R_FCFS.segs.length === 4, R_FCFS.segs.length);
  chk('every segment has positive length',
      R_FCFS.segs.every(function (s) { return s.end > s.start; }), 'ok');
  chk('FCFS segments are contiguous', (function () {
    for (var i = 1; i < R_FCFS.segs.length; i++) {
      if (!near(R_FCFS.segs[i].start, R_FCFS.segs[i - 1].end)) return false;
    }
    return true;
  })(), 'contiguous');
  chk('the four bursts sum to 26', total === 26, total);
  chk('FCFS ends at 26', R_FCFS.segs[3].end === 26, R_FCFS.segs[3].end);
  chk('every algorithm consumes exactly the total burst',
      [R_SJF, R_SRTF, R_RR4, R_MLFQ].every(function (r) {
        return near(r.segs.reduce(function (a, s) { return a + (s.end - s.start); }, 0), total);
      }), '26 each');

  /* FCFS */
  chk('FCFS order is A B C D', SEQ(R_FCFS) === 'ABCD', SEQ(R_FCFS));
  chk('FCFS average waiting is 8.25', near(R_FCFS.m.avgWait, 8.25), R_FCFS.m.avgWait);
  chk('FCFS average turnaround is 14.75', near(R_FCFS.m.avgTat, 14.75), R_FCFS.m.avgTat);
  chk('C waits 12 for 3 units of work (the convoy effect)',
      R_FCFS.m.wait.C === 12 && byId(PROCS, 'C').burst === 3, R_FCFS.m.wait.C);

  /* SJF */
  chk('SJF order is A C B D', SEQ(R_SJF) === 'ACBD', SEQ(R_SJF));
  chk('SJF average waiting is 7.5', near(R_SJF.m.avgWait, 7.5), R_SJF.m.avgWait);
  chk('SJF beats FCFS on the average', R_SJF.m.avgWait < R_FCFS.m.avgWait, '7.5 < 8.25');
  chk('but B is worse off under SJF (8 -> 11)',
      R_SJF.m.wait.B > R_FCFS.m.wait.B, R_FCFS.m.wait.B + ' -> ' + R_SJF.m.wait.B);
  chk('SJF is optimal among feasible non-preemptive orders',
      near(bestFeasibleAvgWait(PROCS).value, R_SJF.m.avgWait), bestFeasibleAvgWait(PROCS).value);
  chk('the optimal feasible order is the one SJF produced',
      bestFeasibleAvgWait(PROCS).order === SEQ(R_SJF), bestFeasibleAvgWait(PROCS).order);

  /* SRTF */
  chk('SRTF draws six segments', R_SRTF.segs.length === 6, R_SRTF.segs.length);
  chk('SRTF average waiting is 6', near(R_SRTF.m.avgWait, 6), R_SRTF.m.avgWait);
  chk('SRTF is better than SJF on the average',
      R_SRTF.m.avgWait < R_SJF.m.avgWait, '6 < 7.5');
  chk('A waits 16 under SRTF after waiting 0 under FCFS',
      R_SRTF.m.wait.A === 16 && R_FCFS.m.wait.A === 0, R_SRTF.m.wait.A);
  chk('SRTF average response is 1.25', near(R_SRTF.m.avgResp, 1.25), R_SRTF.m.avgResp);

  /* round robin */
  chk('RR with quantum 4 draws eight segments', R_RR4.segs.length === 8, R_RR4.segs.length);
  chk('RR quantum 4 average waiting is 10.75', near(R_RR4.m.avgWait, 10.75), R_RR4.m.avgWait);
  chk('RR quantum 4 average response is 3.75', near(R_RR4.m.avgResp, 3.75), R_RR4.m.avgResp);
  chk('RR response beats FCFS response',
      R_RR4.m.avgResp < R_FCFS.m.avgResp, '3.75 < 8.25');
  chk('RR waiting is worse than FCFS waiting',
      R_RR4.m.avgWait > R_FCFS.m.avgWait, '10.75 > 8.25');
  chk('a quantum of 10 degenerates to the FCFS order', SEQ(R_RR10) === SEQ(R_FCFS), SEQ(R_RR10));
  chk('a quantum of 20 degenerates to the FCFS order', SEQ(R_RR20) === SEQ(R_FCFS), SEQ(R_RR20));
  chk('and its average waiting matches FCFS',
      near(R_RR20.m.avgWait, R_FCFS.m.avgWait), R_RR20.m.avgWait);

  /* the identities that must hold for every run */
  var allRuns = [R_FCFS, R_SJF, R_SRTF, R_RR4, R_MLFQ];
  chk('turnaround = waiting + burst, in every run', allRuns.every(function (r) {
    return PROCS.every(function (p) {
      return near(r.m.tat[p.id], r.m.wait[p.id] + p.burst);
    });
  }), 'holds');
  chk('no waiting time is negative', allRuns.every(function (r) {
    return PROCS.every(function (p) { return r.m.wait[p.id] >= -1e-9; });
  }), 'none');
  chk('response time never exceeds waiting time', allRuns.every(function (r) {
    return PROCS.every(function (p) { return r.m.resp[p.id] <= r.m.wait[p.id] + 1e-9; });
  }), 'holds');

  /* priority */
  chk('preemptive priority draws four segments', R_PP.segs.length === 4, R_PP.segs.length);
  chk('preemptive priority average waiting is 11/3', near(R_PP.m.avgWait, 11 / 3, 1e-9), R_PP.m.avgWait);
  chk('non-preemptive priority average waiting is 5', near(R_PN.m.avgWait, 5), R_PN.m.avgWait);
  chk('preemption lowers the average here', R_PP.m.avgWait < R_PN.m.avgWait, '3.67 < 5.0');
  chk('P3, the highest priority, waits 0 when preemption is allowed', R_PP.m.wait.P3 === 0, R_PP.m.wait.P3);

  /* multilevel feedback */
  chk('MLFQ average waiting is 11.5', near(R_MLFQ.m.avgWait, 11.5), R_MLFQ.m.avgWait);
  chk('MLFQ gives every process a response time of 0', near(R_MLFQ.m.avgResp, 0), R_MLFQ.m.avgResp);
  chk('MLFQ costs more waiting than round robin on this set',
      R_MLFQ.m.avgWait > R_RR4.m.avgWait, '11.5 > 10.75');

  /* the quantum against the switch cost */
  chk('s = 1, q = 10 gives 90.9 per cent utilisation',
      near(utilisation(1, 10) * 100, 90.909, 1e-2), (utilisation(1, 10) * 100).toFixed(2));
  chk('s = 1, q = 4 gives 80 per cent', near(utilisation(1, 4), 0.8), utilisation(1, 4));
  chk('s = 1, q = 2 gives 66.7 per cent',
      near(utilisation(1, 2) * 100, 66.667, 1e-2), (utilisation(1, 2) * 100).toFixed(2));
  chk('s = 1, q = 1 gives exactly 50 per cent', near(utilisation(1, 1), 0.5), utilisation(1, 1));
  chk('utilisation plus loss is 1', near(utilisation(1, 7) + lossFraction(1, 7), 1), '1');
  chk('halving the quantum raises the loss',
      lossFraction(1, 4) > lossFraction(1, 8), 'yes');

  /* previous-year instances, recomputed */
  chk('GATE 2025 Set 2 Q26: SRTF average turnaround is 19', near(R_G25.m.avgTat, 19), R_G25.m.avgTat);
  chk('GATE 2025 Set 2 Q26: P3 finishes first, then P1, P4, P2',
      G25.slice().sort(function (a, b) { return R_G25.comp[a.id] - R_G25.comp[b.id]; })
        .map(function (p) { return p.id; }).join('') === 'P3P1P4P2',
      G25.slice().sort(function (a, b) { return R_G25.comp[a.id] - R_G25.comp[b.id]; })
        .map(function (p) { return p.id; }).join(''));
  chk('GATE 2021 Set 1 Q25: the minimum average waiting is 12', near(R_G21.m.avgWait, 12), R_G21.m.avgWait);
  chk('GATE 2022 Q42: option D has no R-to-Q transition',
      countOf(g22Run('D'), 'R>Q') === 0, countOf(g22Run('D'), 'R>Q'));
  chk('GATE 2022 Q42: options A, B and C each have exactly one R-to-Q transition',
      ['A', 'B', 'C'].every(function (o) { return countOf(g22Run(o), 'R>Q') === 1; }), '1 each');
  chk('GATE 2022 Q42: every option has exactly two Q-to-R transitions',
      ['A', 'B', 'C', 'D'].every(function (o) { return countOf(g22Run(o), 'Q>R') === 2; }), '2 each');
  chk('GATE 2022 Q42: every option has exactly one S-to-Q transition',
      ['A', 'B', 'C', 'D'].every(function (o) { return countOf(g22Run(o), 'S>Q') === 1; }), '1 each');
}

/* ======================================================================
   LAYER 2 - SMALL FORMATTERS
   ====================================================================== */

function f2(x) { return (Math.round(x * 100) / 100).toFixed(2); }
function f1(x) { return (Math.round(x * 10) / 10).toFixed(1); }
function frac3(x) {
  var r = Math.round(x * 100) / 100;
  return (Math.abs(r - Math.round(r)) < 1e-9) ? String(Math.round(r)) : r.toFixed(2);
}

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
function appear(P, t, at, dur) { P.alpha(ease(rev(t, at, dur === undefined ? 0.9 : dur))); }

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
function takeaway(P, t, at, line1, line2) {
  appear(P, t, at, 1.2);
  P.rect(24, 392, 852, 56, { fill: PAL.surface2, stroke: PAL.border, radius: 5 });
  P.text(40, 406, line1, { size: 12, bold: true, color: PAL.ink });
  P.text(40, 424, line2, { size: 10, color: PAL.dim });
  P.alpha(1);
}

/* the process colours. The letter inside the bar is the primary signal;
   colour only reinforces it. */
var PCOL = { A: PAL.accent, B: PAL.info, C: PAL.valid, D: PAL.warn,
             P1: PAL.accent, P2: PAL.info, P3: PAL.valid,
             P: PAL.accent, Q: PAL.info, R: PAL.valid, S: PAL.warn,
             X: PAL.accent, Y: PAL.info, Z: PAL.valid };
function colOf(id) { return PCOL[id] || PAL.dim; }
function hexA(hex, a) {
  var c = String(hex).trim();
  if (c.charAt(0) !== '#') return c;
  if (c.length === 4) c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
  var r = parseInt(c.substr(1, 2), 16), g = parseInt(c.substr(3, 2), 16), b = parseInt(c.substr(5, 2), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

/* the Gantt chart: one bar per segment, an axis in time units, arrival ticks */
function gantt(P, res, o) {
  o = o || {};
  var x0 = o.x === undefined ? 44 : o.x;
  var w = o.w === undefined ? 812 : o.w;
  var y = o.y === undefined ? 96 : o.y;
  var h = o.h === undefined ? 34 : o.h;
  var tmax = o.tmax || 26;
  var sc = w / tmax;
  var tick = o.tick || 2;

  /* axis */
  P.line(x0, y + h + 4, x0 + w, y + h + 4, { stroke: PAL.border, sw: 1.2 });
  for (var t = 0; t <= tmax + 1e-9; t += tick) {
    var x = x0 + t * sc;
    P.line(x, y + h + 4, x, y + h + 9, { stroke: PAL.border, sw: 1 });
    P.text(x, y + h + 12, String(t), { size: 8, mono: true, color: PAL.faint, align: 'center' });
  }

  /* arrival ticks above the chart */
  if (o.arrivals) {
    o.arrivals.forEach(function (a) {
      var ax = x0 + a * sc;
      P.line(ax, y - 8, ax, y, { stroke: PAL.warn, sw: 1.2, dash: [3, 3] });
    });
  }

  /* bars */
  res.segs.forEach(function (s) {
    var sx = x0 + s.start * sc;
    var sw = (s.end - s.start) * sc;
    var col = colOf(s.id);
    P.rect(sx + 1, y, sw - 2, h, { fill: hexA(col, 0.16), stroke: col, sw: 1.3, radius: 3 });
    if (sw > 18) {
      P.text(sx + sw / 2, y + h / 2, s.id,
             { size: 11, mono: true, bold: true, color: PAL.ink, align: 'center', base: 'middle' });
    }
  });

  /* completion markers */
  if (o.markCompletions) {
    res.segs.forEach(function (s, i) {
      if (i === res.segs.length - 1 || res.segs[i + 1].start !== s.end) {
        var cx = x0 + s.end * sc;
        P.circle(cx, y + h + 4, 2.5, { fill: PAL.ink });
      }
    });
  }
  return { x0: x0, w: w, y: y, h: h, sc: sc };
}

/* the waiting bracket: arrival to first service, for each process */
function waits(P, res, procs, o) {
  o = o || {};
  var x0 = o.x === undefined ? 44 : o.x;
  var w = o.w === undefined ? 812 : o.w;
  var y = o.y === undefined ? 152 : o.y;
  var tmax = o.tmax || 26;
  var sc = w / tmax;
  procs.forEach(function (p, i) {
    var start = res.m.first[p.id];
    var ax = x0 + p.arrival * sc;
    var bx = x0 + start * sc;
    var yy = y + i * 13;
    P.text(x0 - 8, yy + 4, p.id, { size: 9, mono: true, color: colOf(p.id), align: 'right', bold: true });
    P.line(ax, yy, Math.max(bx, ax + 2), yy, { stroke: colOf(p.id), sw: 1.2 });
    P.line(ax, yy - 3, ax, yy + 3, { stroke: colOf(p.id), sw: 1.2 });
    if (bx > ax + 4) {
      P.line(bx, yy - 3, bx, yy + 3, { stroke: colOf(p.id), sw: 1.2 });
      P.text(bx + 5, yy + 3, 'waits ' + res.m.wait[p.id], { size: 8, mono: true, color: PAL.dim });
    }
  });
}

/* ======================================================================
   LAYER 4 - THE SCENES
   Each scene reads from the validated model and draws it. Nothing here
   re-derives a number that Layer 1 already checked.
   ====================================================================== */

var SCENES = {};

/* ---------- scene 1: the decision and the metrics ---------- */
SCENES.metrics = function (P, t) {
  head(P, 'scene 1 - the decision and the metrics', 'One choice, five numbers');

  /* the ready queue and the CPU */
  appear(P, t, 0.2);
  note(P, 30, 68, 'ready queue', PAL.dim, 9);
  var chips = ['A', 'B', 'C', 'D'];
  for (var i = 0; i < chips.length; i++) {
    appear(P, t, 0.5 + i * 0.45);
    box(P, 30 + i * 48, 80, 40, 28, { stroke: colOf(chips[i]), fill: hexA(colOf(chips[i]), 0.14) });
    labelIn(P, 30 + i * 48, 80, 40, 28, chips[i], '', { size: 11, bold: true });
  }
  P.alpha(1);
  appear(P, t, 2.8);
  P.arrow(120, 116, 120, 146, { stroke: PAL.ink, sw: 1.3 });
  note(P, 128, 128, 'the scheduler chooses one', PAL.dim, 9);
  P.alpha(1);
  appear(P, t, 3.2);
  box(P, 60, 150, 120, 40, { stroke: PAL.accent, fill: PAL.accentDim });
  labelIn(P, 60, 150, 120, 40, 'CPU', 'one at a time', { size: 11, bold: true });
  P.alpha(1);

  appear(P, t, 4.6);
  note(P, 30, 216, 'the other three stay ready, in an order the policy decides', PAL.dim, 9);
  P.alpha(1);

  /* the five metrics */
  var rows = [
    ['CPU utilisation', 'busy time / total time'],
    ['throughput', 'processes completed per unit time'],
    ['turnaround  T', 'completion - arrival'],
    ['waiting     W', 'T - burst'],
    ['response    R', 'first service - arrival']
  ];
  for (var j = 0; j < rows.length; j++) {
    appear(P, t, 6.0 + j * 1.1);
    var y = 74 + j * 26;
    P.text(420, y, rows[j][0], { size: 10, mono: true, color: PAL.ink, bold: true });
    P.text(560, y, rows[j][1], { size: 10, color: PAL.dim });
    P.line(420, y + 16, 866, y + 16, { stroke: PAL.border, sw: 0.6 });
  }
  P.alpha(1);

  appear(P, t, 12.0);
  mono(P, 420, 210, 'W  =  T - burst', PAL.accent, 12);
  note(P, 420, 226, 'turnaround carries the burst; waiting does not', PAL.dim, 9);
  P.alpha(1);

  appear(P, t, 14.4);
  mono(P, 420, 254, 'on a fixed set:  sum(T) = sum(W) + sum(burst)', PAL.ink, 11);
  note(P, 420, 270, 'so minimising average turnaround and average waiting is one problem', PAL.dim, 9);
  P.alpha(1);

  appear(P, t, 17.4);
  box(P, 30, 246, 360, 66, { stroke: PAL.info, fill: PAL.surface });
  labelIn(P, 30, 246, 360, 66, 'response stops at the first slice', 'R = first start - arrival', { size: 10, bold: true });
  P.alpha(1);

  appear(P, t, 20.6);
  note(P, 30, 330, 'A process can be served first and finish last: R small, T large.', PAL.ink, 10);
  note(P, 30, 348, 'That is the trade every policy in this lesson makes.', PAL.dim, 10);
  P.alpha(1);

  takeaway(P, t, 23,
    'The scheduler picks one ready process; five numbers score the choice.',
    'T = C - A, W = T - B, R = first service - A. Waiting and turnaround differ by the burst.');
};

/* ---------- scene 2: FCFS ---------- */
SCENES.fcfs = function (P, t) {
  head(P, 'scene 2 - first come first served', 'In arrival order, to completion');

  appear(P, t, 0.2);
  note(P, 30, 66, 'A (0,10)   B (2,6)   C (4,3)   D (6,7)   -   arrival, burst', PAL.dim, 10);
  P.alpha(1);

  appear(P, t, 1.0, 1.2);
  gantt(P, R_FCFS, { y: 92, arrivals: [0, 2, 4, 6], markCompletions: true });
  P.alpha(1);

  appear(P, t, 3.2);
  note(P, 44, 168, 'dashed marks are arrivals; dots are completions', PAL.faint, 8);
  P.alpha(1);

  appear(P, t, 6.0);
  waits(P, R_FCFS, PROCS, { y: 190 });
  P.alpha(1);

  appear(P, t, 10.5);
  mono(P, 560, 200, 'W:  A 0   B 8   C 12   D 13', PAL.ink, 11);
  mono(P, 560, 218, 'average W = 33 / 4 = 8.25', PAL.accent, 11);
  P.alpha(1);

  appear(P, t, 14.0);
  box(P, 44, 250, 812, 54, { stroke: PAL.warn, fill: PAL.warnDim });
  note(P, 58, 262, 'convoy effect', PAL.warn, 10);
  note(P, 58, 278, 'C needs 3 units and waits 12, because A held the CPU for 10.', PAL.ink, 10);
  note(P, 58, 293, 'Waiting under FCFS = the sum of the bursts of everyone ahead of you.', PAL.dim, 9);
  P.alpha(1);

  appear(P, t, 19.4);
  note(P, 44, 322, 'no starvation: every process reaches the head of the queue', PAL.valid, 10);
  note(P, 44, 340, 'no preemption: a 10-unit job must finish before a 1-unit job starts', PAL.dim, 10);
  P.alpha(1);

  takeaway(P, t, 22,
    'FCFS: average waiting 8.25 on this set, and C waits four times its own burst.',
    'One long job at the head delays every job behind it. That is the convoy effect.');
};

/* ---------- scene 3: SJF ---------- */
SCENES.sjf = function (P, t) {
  head(P, 'scene 3 - shortest job first', 'Shortest burst among those that have arrived');

  appear(P, t, 0.3);
  note(P, 44, 68, 'at t = 0 only A has arrived, so A must run: SJF has no choice', PAL.dim, 10);
  P.alpha(1);

  appear(P, t, 1.2, 1.2);
  gantt(P, R_SJF, { y: 88, arrivals: [0, 2, 4, 6], markCompletions: true });
  P.alpha(1);

  appear(P, t, 3.4);
  note(P, 44, 164, 'at t = 10, B (6), C (3) and D (7) are waiting: C goes first', PAL.ink, 9);
  P.alpha(1);

  appear(P, t, 5.6);
  waits(P, R_SJF, PROCS, { y: 186 });
  P.alpha(1);

  appear(P, t, 9.4);
  mono(P, 560, 196, 'W:  A 0   B 11   C 6   D 13', PAL.ink, 11);
  mono(P, 560, 214, 'average W = 30 / 4 = 7.50', PAL.accent, 11);
  note(P, 560, 232, 'FCFS was 8.25; B went from 8 to 11', PAL.dim, 9);
  P.alpha(1);

  /* the exchange argument, drawn */
  appear(P, t, 13.0);
  note(P, 44, 262, 'the exchange argument', PAL.accent, 10);
  P.alpha(1);

  appear(P, t, 14.0);
  var bx = 44, by = 278, bw = 330, sc = bw / 20;
  P.rect(bx, by, 13 * sc, 22, { fill: hexA(PAL.invalid, 0.16), stroke: PAL.invalid, radius: 3 });
  P.rect(bx + 13 * sc, by, 3 * sc, 22, { fill: hexA(PAL.valid, 0.16), stroke: PAL.valid, radius: 3 });
  P.text(bx + 6.5 * sc, by + 11, 'long 13', { size: 9, mono: true, align: 'center', base: 'middle' });
  P.text(bx + 14.5 * sc, by + 11, 'short', { size: 9, mono: true, align: 'center', base: 'middle' });
  note(P, bx, by - 12, 'long before short', PAL.invalid, 9);
  P.alpha(1);

  appear(P, t, 16.0);
  var cy = by + 34;
  P.rect(bx, cy, 3 * sc, 22, { fill: hexA(PAL.valid, 0.16), stroke: PAL.valid, radius: 3 });
  P.rect(bx + 3 * sc, cy, 13 * sc, 22, { fill: hexA(PAL.invalid, 0.16), stroke: PAL.invalid, radius: 3 });
  P.text(bx + 1.5 * sc, cy + 11, 's', { size: 9, mono: true, align: 'center', base: 'middle' });
  P.text(bx + 9.5 * sc, cy + 11, 'long 13', { size: 9, mono: true, align: 'center', base: 'middle' });
  note(P, bx, cy - 12, 'short before long', PAL.valid, 9);
  P.alpha(1);

  appear(P, t, 18.4);
  note(P, 400, 278, 'swapping the pair leaves every other completion time', PAL.ink, 9);
  note(P, 400, 294, 'unchanged, and shortens the short job by 13 - 3 = 10.', PAL.ink, 9);
  note(P, 400, 310, 'So the sum of waiting times strictly falls.', PAL.ink, 9);
  P.alpha(1);

  appear(P, t, 21.0);
  box(P, 44, 326, 812, 44, { stroke: PAL.warn, fill: PAL.warnDim });
  note(P, 58, 336, 'the assumption: the burst lengths are known', PAL.warn, 10);
  note(P, 58, 352, 'otherwise they must be predicted, and the optimality guarantee is gone', PAL.ink, 9);
  P.alpha(1);

  takeaway(P, t, 24,
    'SJF: average waiting 7.5, and no feasible non-preemptive order does better.',
    'The proof is an exchange argument, and it assumes the bursts are known in advance.');
};

/* ---------- scene 4: SRTF ---------- */
SCENES.srtf = function (P, t) {
  head(P, 'scene 4 - shortest remaining time first', 'Preempt at arrivals, compare what is left');

  appear(P, t, 0.3);
  note(P, 44, 68, 'A has 8 left when B arrives at 2 with 6: B is shorter, so B runs', PAL.dim, 10);
  P.alpha(1);

  appear(P, t, 1.2, 1.2);
  gantt(P, R_SRTF, { y: 86, arrivals: [0, 2, 4, 6], markCompletions: true });
  P.alpha(1);

  appear(P, t, 3.4);
  note(P, 44, 162, 'C has 1 left when D arrives at 6 with 7, so C keeps the CPU', PAL.ink, 9);
  P.alpha(1);

  appear(P, t, 5.6);
  waits(P, R_SRTF, PROCS, { y: 184 });
  P.alpha(1);

  appear(P, t, 9.6);
  mono(P, 560, 194, 'W:  A 16   B 3   C 0   D 5', PAL.ink, 11);
  mono(P, 560, 212, 'average W = 24 / 4 = 6.00', PAL.accent, 11);
  note(P, 560, 230, 'SJF was 7.50, FCFS 8.25', PAL.dim, 9);
  P.alpha(1);

  appear(P, t, 13.0);
  box(P, 44, 256, 396, 60, { stroke: PAL.valid, fill: PAL.surface });
  note(P, 58, 268, 'what improves', PAL.valid, 9);
  note(P, 58, 284, 'average waiting 8.25 -> 6.00', PAL.ink, 10);
  note(P, 58, 300, 'average response 8.25 -> 1.25', PAL.ink, 10);
  P.alpha(1);

  appear(P, t, 16.0);
  box(P, 460, 256, 396, 60, { stroke: PAL.invalid, fill: PAL.invalidDim });
  note(P, 474, 268, 'what pays for it', PAL.invalid, 9);
  note(P, 474, 284, 'A waits 16 instead of 0', PAL.ink, 10);
  note(P, 474, 300, 'a stream of short jobs can starve a long one', PAL.ink, 10);
  P.alpha(1);

  appear(P, t, 19.6);
  note(P, 44, 334, 'six segments, not four: B resumes at 7 and A resumes at 18', PAL.ink, 10);
  note(P, 44, 352, 'preemption happens at arrivals only, never mid-slice', PAL.dim, 10);
  P.alpha(1);

  takeaway(P, t, 22,
    'SRTF: average waiting 6.0 and response 1.25, both the best of the four.',
    'A pays 16 units for it. Minimising an average always leaves someone worse off.');
};

/* ---------- scene 5: round robin ---------- */
SCENES.rr = function (P, t) {
  head(P, 'scene 5 - round robin', 'A fixed slice, then the back of the queue');

  appear(P, t, 0.3);
  note(P, 44, 66, 'quantum q = 4: run at most four units, then rejoin the tail', PAL.dim, 10);
  P.alpha(1);

  appear(P, t, 1.0, 1.2);
  gantt(P, R_RR4, { y: 82, arrivals: [0, 2, 4, 6], tick: 2 });
  P.alpha(1);

  appear(P, t, 3.0);
  note(P, 44, 132, 'eight segments: A B C A D B A D', PAL.ink, 9);
  P.alpha(1);

  appear(P, t, 6.0);
  mono(P, 44, 158, 'W:  A 13   B 13   C 4   D 12        average W = 43 / 4 = 10.75', PAL.ink, 10);
  mono(P, 44, 176, 'R:  A 0    B 2    C 4   D 9         average R = 15 / 4 = 3.75', PAL.accent, 10);
  P.alpha(1);

  appear(P, t, 9.6);
  note(P, 44, 200, 'worse than SJF and worse than FCFS on waiting, better than both on response', PAL.dim, 10);
  P.alpha(1);

  /* the degenerate limit, drawn */
  appear(P, t, 12.0);
  note(P, 44, 226, 'raise the quantum to 10, which is the longest burst here:', PAL.ink, 9);
  P.alpha(1);
  appear(P, t, 13.4, 1.2);
  gantt(P, R_RR10, { y: 236, h: 24, tick: 4 });
  P.alpha(1);
  appear(P, t, 15.4);
  mono(P, 44, 274, 'A B C D  -  identical to FCFS, average W 8.25', PAL.warn, 10);
  P.alpha(1);

  appear(P, t, 18.4);
  note(P, 44, 306, 'lower the quantum instead and the switch cost grows: q / (q + s) falls', PAL.ink, 10);
  note(P, 44, 324, 'so q is a compromise: response time against wasted CPU', PAL.dim, 10);
  P.alpha(1);

  appear(P, t, 21.0);
  mono(P, 560, 306, 'q >= longest burst  ->  FCFS', PAL.ink, 10);
  mono(P, 560, 324, 'q -> 0  ->  switches dominate', PAL.ink, 10);
  P.alpha(1);

  takeaway(P, t, 23,
    'Round robin buys response time (3.75) and pays in waiting time (10.75).',
    'A quantum at least as long as the longest burst makes it exactly FCFS.');
};

/* ---------- scene 6: priority ---------- */
SCENES.priority = function (P, t) {
  head(P, 'scene 6 - priority scheduling', 'Preemptive, non-preemptive, and starvation');

  appear(P, t, 0.3);
  note(P, 44, 66, 'P1 (0,8,p2)   P2 (1,3,p1)   P3 (2,2,p3)   -   larger priority number wins', PAL.dim, 10);
  P.alpha(1);

  appear(P, t, 1.2, 1.2);
  gantt(P, R_PP, { y: 80, h: 28, tmax: 13, tick: 1 });
  P.alpha(1);
  appear(P, t, 2.6);
  note(P, 44, 120, 'preemptive: P1 0-2, P3 2-4, P1 4-10, P2 10-13', PAL.ink, 9);
  mono(P, 44, 136, 'average W = 11 / 3 = 3.67', PAL.accent, 10);
  P.alpha(1);

  appear(P, t, 5.6, 1.2);
  gantt(P, R_PN, { y: 168, h: 28, tmax: 13, tick: 1 });
  P.alpha(1);
  appear(P, t, 7.0);
  note(P, 44, 208, 'non-preemptive: P1 0-8, P3 8-10, P2 10-13', PAL.ink, 9);
  mono(P, 44, 224, 'average W = 15 / 3 = 5.00', PAL.ink, 10);
  P.alpha(1);

  appear(P, t, 10.4);
  box(P, 44, 246, 396, 62, { stroke: PAL.warn, fill: PAL.warnDim });
  note(P, 58, 258, 'starvation', PAL.warn, 10);
  note(P, 58, 274, 'a steady stream of higher priorities means the low', PAL.ink, 9);
  note(P, 58, 289, 'priority job never runs. No finite bound on its wait.', PAL.ink, 9);
  P.alpha(1);

  appear(P, t, 14.0);
  box(P, 460, 246, 396, 62, { stroke: PAL.valid, fill: PAL.surface });
  note(P, 474, 258, 'aging', PAL.valid, 10);
  note(P, 474, 274, 'raise priority with waiting time, so the starved', PAL.ink, 9);
  note(P, 474, 289, 'process eventually outranks the newcomers.', PAL.ink, 9);
  P.alpha(1);

  appear(P, t, 17.6);
  note(P, 44, 326, 'once everyone has aged, priorities collapse towards equal', PAL.ink, 10);
  note(P, 44, 344, 'and the policy behaves like round robin - which is what GATE 2013 asked', PAL.dim, 10);
  P.alpha(1);

  takeaway(P, t, 21,
    'Preemptive priority: 3.67 average waiting here; non-preemptive: 5.00.',
    'Priority scheduling is the one that starves. Aging is the fix, and aging degrades to round robin.');
};

/* ---------- scene 7: MLFQ ---------- */
SCENES.mlfq = function (P, t) {
  head(P, 'scene 7 - multilevel feedback queue', 'Three queues, growing quanta, one Gantt chart');

  /* the three queues */
  var qs = [['Q0', 'quantum 2', PAL.accent], ['Q1', 'quantum 4', PAL.info], ['Q2', 'FCFS', PAL.warn]];
  for (var i = 0; i < qs.length; i++) {
    appear(P, t, 0.3 + i * 0.8);
    box(P, 30, 76 + i * 44, 210, 34, { stroke: qs[i][2], fill: hexA(qs[i][2], 0.12) });
    labelIn(P, 30, 76 + i * 44, 210, 34, qs[i][0] + '  ' + qs[i][1], '', { size: 10, bold: true });
  }
  P.alpha(1);

  appear(P, t, 3.0);
  P.arrow(136, 194, 136, 214, { stroke: PAL.dim, sw: 1.2 });
  note(P, 146, 200, 'use the full slice: demote', PAL.dim, 9);
  P.alpha(1);

  appear(P, t, 4.2, 1.2);
  gantt(P, R_MLFQ, { y: 76, x: 268, w: 596, arrivals: [0, 2, 4, 6], tick: 2 });
  P.alpha(1);

  appear(P, t, 6.4);
  note(P, 268, 128, 'every process is served in Q0 on arrival, so every response time is 0', PAL.valid, 9);
  P.alpha(1);

  appear(P, t, 9.0);
  mono(P, 268, 154, 'W:  A 15   B 8   C 10   D 13', PAL.ink, 10);
  mono(P, 268, 172, 'average W = 46 / 4 = 11.50', PAL.accent, 10);
  P.alpha(1);

  appear(P, t, 12.0);
  note(P, 268, 196, 'round robin with q = 4 managed 10.75 on the same set', PAL.dim, 10);
  note(P, 268, 214, 'so feedback costs average waiting time and buys response time', PAL.dim, 10);
  P.alpha(1);

  appear(P, t, 15.6);
  box(P, 30, 240, 396, 66, { stroke: PAL.valid, fill: PAL.surface });
  note(P, 44, 252, 'what it buys', PAL.valid, 9);
  note(P, 44, 268, 'response time 0 for all four processes', PAL.ink, 10);
  note(P, 44, 284, 'no burst lengths needed: behaviour is inferred', PAL.ink, 10);
  P.alpha(1);

  appear(P, t, 18.6);
  box(P, 460, 240, 396, 66, { stroke: PAL.invalid, fill: PAL.invalidDim });
  note(P, 474, 252, 'what it costs', PAL.invalid, 9);
  note(P, 474, 268, 'average waiting 11.50, worse than every single queue', PAL.ink, 10);
  note(P, 474, 284, 'starvation at the bottom without periodic promotion', PAL.ink, 10);
  P.alpha(1);

  appear(P, t, 21.6);
  note(P, 30, 328, 'the bottom queue must be FCFS, not round robin, or a long job can be demoted forever', PAL.dim, 10);
  note(P, 30, 346, 'periodic promotion to the top queue is the standard anti-starvation rule', PAL.dim, 10);
  P.alpha(1);

  takeaway(P, t, 24,
    'MLFQ: response 0 for everyone, average waiting 11.5. It optimises what users notice.',
    'Demotion is a prediction, not a punishment: a job that uses its whole slice is probably long.');
};

/* ---------- scene 8: the quantum against the switch cost ---------- */
SCENES.overhead = function (P, t) {
  head(P, 'scene 8 - the quantum against the switch', 'Utilisation = q / (q + s)');

  appear(P, t, 0.3);
  note(P, 44, 68, 'one cycle is a slice q and a switch s; only q does user work', PAL.dim, 10);
  P.alpha(1);

  /* the cycle bar */
  appear(P, t, 1.2);
  var cy = 86, cw = 520;
  var qw = cw * (10 / 11), sw = cw * (1 / 11);
  P.rect(44, cy, qw, 26, { fill: hexA(PAL.accent, 0.16), stroke: PAL.accent, radius: 3 });
  P.rect(44 + qw, cy, sw, 26, { fill: hexA(PAL.warn, 0.3), stroke: PAL.warn, radius: 3 });
  P.text(44 + qw / 2, cy + 13, 'q = 10 ms of user work', { size: 9, mono: true, align: 'center', base: 'middle' });
  note(P, 44, cy + 36, 's = 1 ms of switching, no user instruction retires', PAL.warn, 9);
  P.alpha(1);

  /* the curve */
  appear(P, t, 5.0);
  var gx = 120, gy = 340, gw = 460, gh = 190;
  P.line(gx, gy, gx + gw, gy, { stroke: PAL.border, sw: 1.2 });
  P.line(gx, gy, gx, gy - gh, { stroke: PAL.border, sw: 1.2 });
  note(P, gx + gw - 30, gy + 12, 'q (ms)', PAL.faint, 9);
  note(P, gx - 26, gy - gh - 8, 'utilisation', PAL.faint, 9);
  for (var q = 1; q <= 20; q += 0.25) {
    var u = utilisation(1, q);
    var px = gx + (q / 20) * gw;
    var py = gy - u * gh;
    P.circle(px, py, 0.9, { fill: PAL.accent });
  }
  var marks = [[1, '1'], [2, '2'], [4, '4'], [10, '10'], [20, '20']];
  marks.forEach(function (m) {
    var u = utilisation(1, m[0]);
    var px = gx + (m[0] / 20) * gw;
    var py = gy - u * gh;
    P.circle(px, py, 3, { fill: PAL.accent });
    P.text(px, py - 8, (u * 100).toFixed(u * 100 < 70 ? 1 : 1) + '%', { size: 8, mono: true, color: PAL.ink, align: 'center' });
    P.text(px, gy + 8, m[1], { size: 8, mono: true, color: PAL.faint, align: 'center' });
  });
  note(P, gx, gy + 26, 's = 1 ms in every point of this curve', PAL.dim, 9);
  P.alpha(1);

  /* the arithmetic */
  appear(P, t, 10.0);
  mono(P, 620, 132, 's = 1, q = 10', PAL.dim, 9);
  mono(P, 620, 148, 'U = 10/11 = 90.9%', PAL.accent, 11);
  mono(P, 620, 172, 's = 1, q = 4', PAL.dim, 9);
  mono(P, 620, 188, 'U = 4/5 = 80.0%', PAL.accent, 11);
  mono(P, 620, 212, 's = 1, q = 2', PAL.dim, 9);
  mono(P, 620, 228, 'U = 2/3 = 66.7%', PAL.accent, 11);
  mono(P, 620, 252, 's = 1, q = 1', PAL.dim, 9);
  mono(P, 620, 268, 'U = 1/2 = 50.0%', PAL.accent, 11);
  P.alpha(1);

  appear(P, t, 16.0);
  note(P, 620, 300, 'halve q and the loss doubles', PAL.ink, 10);
  note(P, 620, 318, 'the curve is steep below a few s, flat above', PAL.dim, 9);
  P.alpha(1);

  appear(P, t, 19.4);
  note(P, 44, 360, 'so q is chosen comfortably above s, and small enough that most bursts end inside one slice', PAL.ink, 10);
  P.alpha(1);

  takeaway(P, t, 22,
    'Lost fraction = s / (q + s); utilisation = q / (q + s).',
    'This is a model with one switch per cycle, not a measurement. Divide by q alone and the effect vanishes.');
};

/* ---------- scene 9: CPU and I/O ---------- */
SCENES.io = function (P, t) {
  head(P, 'scene 9 - cpu and i/o scheduling', 'Bursts alternate, and the CPU can be filled');

  appear(P, t, 0.3);
  note(P, 44, 68, 'CPU-bound: long bursts, few of them. I/O-bound: short bursts, frequent waits.', PAL.dim, 10);
  P.alpha(1);

  /* one process: CPU then idle */
  appear(P, t, 1.4);
  var x0 = 44, bw = 40, y1 = 96;
  note(P, x0, y1 - 12, 'one process', PAL.ink, 9);
  for (var i = 0; i < 6; i++) {
    var isCpu = i % 2 === 0;
    P.rect(x0 + i * bw, y1, bw - 2, 26, {
      fill: isCpu ? hexA(PAL.accent, 0.2) : hexA(PAL.faint, 0.12),
      stroke: isCpu ? PAL.accent : PAL.faint, radius: 3
    });
    P.text(x0 + i * bw + bw / 2 - 1, y1 + 13, isCpu ? 'CPU' : 'I/O', { size: 8, mono: true, align: 'center', base: 'middle' });
  }
  note(P, x0 + 6 * bw + 8, y1 + 16, 'the CPU is idle for every I/O burst', PAL.invalid, 9);
  P.alpha(1);

  /* two processes interleaved */
  appear(P, t, 6.0);
  var y2 = 156;
  note(P, x0, y2 - 12, 'two processes, offset', PAL.ink, 9);
  for (var j = 0; j < 6; j++) {
    var isC2 = j % 2 === 0;
    P.rect(x0 + j * bw, y2, bw - 2, 26, {
      fill: isC2 ? hexA(PAL.accent, 0.2) : hexA(PAL.faint, 0.12),
      stroke: isC2 ? PAL.accent : PAL.faint, radius: 3
    });
    P.text(x0 + j * bw + bw / 2 - 1, y2 + 13, isC2 ? 'CPU' : 'I/O', { size: 8, mono: true, align: 'center', base: 'middle' });
    var isC3 = j % 2 === 1;
    P.rect(x0 + j * bw, y2 + 32, bw - 2, 26, {
      fill: isC3 ? hexA(PAL.info, 0.2) : hexA(PAL.faint, 0.12),
      stroke: isC3 ? PAL.info : PAL.faint, radius: 3
    });
    P.text(x0 + j * bw + bw / 2 - 1, y2 + 45, isC3 ? 'CPU' : 'I/O', { size: 8, mono: true, align: 'center', base: 'middle' });
  }
  note(P, x0 + 6 * bw + 8, y2 + 30, 'one process computes while the other waits', PAL.valid, 9);
  P.alpha(1);

  appear(P, t, 12.0);
  box(P, 400, 92, 456, 60, { stroke: PAL.valid, fill: PAL.surface });
  note(P, 414, 104, 'total CPU work is fixed by the programs', PAL.valid, 9);
  note(P, 414, 120, 'scheduling only changes how much of the timeline is idle', PAL.ink, 10);
  note(P, 414, 136, 'and who waits, which is what the five metrics measure', PAL.dim, 9);
  P.alpha(1);

  appear(P, t, 15.6);
  note(P, 44, 250, 'favouring short bursts keeps I/O-bound processes responsive', PAL.ink, 10);
  note(P, 44, 268, 'and keeps the devices busy while another process computes', PAL.dim, 10);
  P.alpha(1);

  appear(P, t, 18.6);
  box(P, 44, 288, 812, 56, { stroke: PAL.warn, fill: PAL.warnDim });
  note(P, 58, 300, 'the syllabus says "CPU and I/O scheduling"; these are two schedulers', PAL.warn, 10);
  note(P, 58, 316, 'the disk side (FCFS, SSTF, SCAN, C-SCAN, LOOK, head movement) is a separate', PAL.ink, 9);
  note(P, 58, 331, 'lesson with its own diagram, and is still recorded as uncovered', PAL.dim, 9);
  P.alpha(1);

  takeaway(P, t, 22,
    'Scheduling cannot reduce total CPU work; it changes idle time and who waits.',
    'Short bursts help twice: better response for the process, less idle for the CPU.');
};

/* ---------- scene 10: the recipe ---------- */
SCENES.recipe = function (P, t) {
  head(P, 'scene 10 - the procedure', 'Four steps and five traps');

  var steps = [
    ['1  fix the rules', 'preemptive or not, bursts known or not, which metric'],
    ['2  draw the chart', 'mark arrivals, then one segment per run'],
    ['3  read completions', 'T = C - A, W = T - B, R = first - A'],
    ['4  average and check', 'divide by the set size; no waiting time is negative']
  ];
  for (var i = 0; i < steps.length; i++) {
    appear(P, t, 0.4 + i * 2.2);
    box(P, 30, 72 + i * 46, 400, 38, { stroke: PAL.accent, fill: i === 0 ? PAL.accentDim : PAL.surface });
    P.text(44, 84 + i * 46, steps[i][0], { size: 10, mono: true, bold: true, color: PAL.ink });
    P.text(44, 100 + i * 46, steps[i][1], { size: 9, color: PAL.dim });
  }
  P.alpha(1);

  var traps = [
    'divide by the processes in the set, not by those arrived',
    'advance the axis through idle time',
    'do not preempt on a tie unless told to',
    'answer the metric that was asked, W or T',
    'add the switch cost to the cycle, or ignore it if told'
  ];
  appear(P, t, 10.4);
  note(P, 460, 80, 'the five traps', PAL.warn, 10);
  P.alpha(1);
  for (var j = 0; j < traps.length; j++) {
    appear(P, t, 11.2 + j * 1.6);
    note(P, 460, 100 + j * 22, '- ' + traps[j], PAL.ink, 10);
  }
  P.alpha(1);

  appear(P, t, 20.0);
  mono(P, 30, 276, 'two algorithms often share a prefix: read the difference off the chart', PAL.dim, 10);
  P.alpha(1);

  appear(P, t, 22.0);
  mono(P, 30, 302, 'check: sum of segment lengths = sum of bursts', PAL.accent, 10);
  mono(P, 30, 320, 'check: every waiting time >= 0', PAL.accent, 10);
  mono(P, 30, 338, 'check: T = W + burst, process by process', PAL.accent, 10);
  P.alpha(1);

  takeaway(P, t, 25,
    'Rules, chart, subtraction, average. The chart is the answer; the numbers are a reading.',
    'Most lost marks come from the divisor, idle time, ties, the wrong metric, or the forgotten switch cost.');
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
