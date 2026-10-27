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
   LAYER 1 - THE MODEL.
   Schedules are plain arrays of operations. Every number this lesson quotes
   is computed here, and the checks at the end re-verify each one against the
   definition it came from. No drawing code computes anything.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

function mk(t, op, item) { return { t: t, op: op, item: item }; }

/* a compact parser: 'r1X w2X' -> [{t:1,op:'r',item:'X'}, ...] */
function parse(str) {
  return str.trim().split(/\s+/).map(function (tok) {
    return mk(Number(tok.charAt(1)), tok.charAt(0), tok.charAt(2));
  });
}

/* ---- 1. the conflict relation ---- */
function conflicts(a, b) {
  return a.t !== b.t && a.item === b.item && (a.op === 'w' || b.op === 'w');
}

/* ---- 2. the precedence graph ---- */
function precGraph(sched) {
  var txs = [];
  sched.forEach(function (o) { if (txs.indexOf(o.t) < 0) txs.push(o.t); });
  txs.sort();
  var edges = [], seen = {};
  for (var i = 0; i < sched.length; i++) {
    for (var j = i + 1; j < sched.length; j++) {
      if (!conflicts(sched[i], sched[j])) continue;
      var k = sched[i].t + '>' + sched[j].t;
      if (seen[k]) { seen[k].why.push([sched[i], sched[j]]); continue; }
      seen[k] = { from: sched[i].t, to: sched[j].t, why: [[sched[i], sched[j]]] };
      edges.push(seen[k]);
    }
  }
  return { nodes: txs, edges: edges };
}

function hasCycle(g) {
  var adj = {}, indeg = {};
  g.nodes.forEach(function (n) { adj[n] = []; indeg[n] = 0; });
  g.edges.forEach(function (e) { adj[e.from].push(e.to); indeg[e.to]++; });
  var q = g.nodes.filter(function (n) { return indeg[n] === 0; });
  var seen = 0;
  while (q.length) {
    var n = q.shift(); seen++;
    adj[n].forEach(function (m) { if (--indeg[m] === 0) q.push(m); });
  }
  return seen !== g.nodes.length;
}

function topoOrders(g) {
  var out = [];
  var adj = {}, indeg = {};
  g.nodes.forEach(function (n) { adj[n] = []; indeg[n] = 0; });
  g.edges.forEach(function (e) { adj[e.from].push(e.to); indeg[e.to]++; });
  function rec(deg, acc) {
    if (acc.length === g.nodes.length) { out.push(acc.slice()); return; }
    for (var i = 0; i < g.nodes.length; i++) {
      var n = g.nodes[i];
      if (deg[n] !== 0) continue;
      var d2 = {};
      for (var k in deg) d2[k] = deg[k];
      adj[n].forEach(function (m) { d2[m]--; });
      d2[n] = -1;
      acc.push(n); rec(d2, acc); acc.pop();
    }
  }
  var d0 = {};
  for (var k in indeg) d0[k] = indeg[k];
  rec(d0, []);
  return out;
}

/* ---- 3. reads-from and final writes ---- */
function readsFrom(sched) {
  var lastW = {}, out = [];
  sched.forEach(function (o, i) {
    if (o.op === 'r') out.push({ i: i, t: o.t, item: o.item, from: lastW[o.item] === undefined ? 0 : lastW[o.item] });
    else lastW[o.item] = o.t;
  });
  return { reads: out, lastW: lastW };
}

function finalWrites(sched) {
  var fw = {};
  sched.forEach(function (o) { if (o.op === 'w') fw[o.item] = o.t; });
  return fw;
}

function serialSchedule(order, prog) {
  var out = [];
  order.forEach(function (t) {
    prog[t].forEach(function (o) { out.push(mk(t, o.op, o.item)); });
  });
  return out;
}

function sameView(a, b) {
  var ra = readsFrom(a), rb = readsFrom(b);
  if (ra.reads.length !== rb.reads.length) return false;
  function key(list) {
    var m = {};
    list.forEach(function (r) {
      var k = r.t + '|' + r.item;
      if (m[k] === undefined) m[k] = [];
      m[k].push(r.from);
    });
    return m;
  }
  var ka = key(ra.reads), kb = key(rb.reads), ks = Object.keys(ka);
  if (ks.length !== Object.keys(kb).length) return false;
  for (var i = 0; i < ks.length; i++) {
    var x = ka[ks[i]], y = kb[ks[i]];
    if (!y || x.length !== y.length) return false;
    for (var j = 0; j < x.length; j++) if (x[j] !== y[j]) return false;
  }
  var fa = finalWrites(a), fb = finalWrites(b), fk = Object.keys(fa);
  for (var m = 0; m < fk.length; m++) if (fa[fk[m]] !== fb[fk[m]]) return false;
  return true;
}

function perms(arr) {
  if (arr.length <= 1) return [arr.slice()];
  var out = [];
  arr.forEach(function (x, i) {
    var rest = arr.slice(0, i).concat(arr.slice(i + 1));
    perms(rest).forEach(function (p) { out.push([x].concat(p)); });
  });
  return out;
}

function isViewSerializable(sched, prog) {
  var txs = Object.keys(prog).map(Number);
  return perms(txs).some(function (order) { return sameView(sched, serialSchedule(order, prog)); });
}

/* ---- 4. the recovery ladder ---- */
function commitPos(sched, t) {
  for (var i = 0; i < sched.length; i++) if (sched[i].t === t && sched[i].op === 'c') return i;
  return Infinity;
}

function prevWrite(sched, i, item) {
  for (var j = i - 1; j >= 0; j--) if (sched[j].op === 'w' && sched[j].item === item) return sched[j];
  return null;
}

function isRecoverable(sched) {
  var ra = readsFrom(sched);
  return ra.reads.every(function (r) {
    if (!r.from || r.from === r.t) return true;
    return commitPos(sched, r.from) < commitPos(sched, r.t);
  });
}

function isCascadeless(sched) {
  return sched.every(function (o, i) {
    if (o.op !== 'r') return true;
    var w = prevWrite(sched, i, o.item);
    if (!w || w.t === o.t) return true;
    return commitPos(sched, w.t) < i;
  });
}

function isStrict(sched) {
  return sched.every(function (o, i) {
    if (o.op === 'c') return true;
    var w = prevWrite(sched, i, o.item);
    if (!w || w.t === o.t) return true;
    return commitPos(sched, w.t) < i;
  });
}

/* ---- 5. two-phase locking as a span test ---- */
function lockSpans(sched) {
  var lp = {};
  sched.forEach(function (o, i) {
    if (o.op === 'c') return;
    if (!lp[o.t]) lp[o.t] = {};
    if (lp[o.t][o.item] === undefined) lp[o.t][o.item] = { acq: i, rel: i };
    else lp[o.t][o.item].rel = i;
  });
  return lp;
}

function is2PL(sched) {
  var lp = lockSpans(sched), byItem = {}, detail = [], ok = true;
  Object.keys(lp).forEach(function (t) {
    Object.keys(lp[t]).forEach(function (x) {
      (byItem[x] = byItem[x] || []).push({ t: Number(t), acq: lp[t][x].acq, rel: lp[t][x].rel });
    });
  });
  Object.keys(byItem).forEach(function (x) {
    var list = byItem[x];
    for (var i = 0; i < list.length; i++) {
      for (var j = i + 1; j < list.length; j++) {
        var a = list[i], b = list[j];
        if (a.acq <= b.rel && b.acq <= a.rel) {
          ok = false;
          detail.push('T' + a.t + ' and T' + b.t + ' both need ' + x +
            ' across positions ' + Math.max(a.acq, b.acq) + '-' + Math.min(a.rel, b.rel));
        }
      }
    }
  });
  return { ok: ok, bad: detail, lp: lp };
}

/* ---- 6. enumeration ---- */
function shuffles(a, b) {
  var out = [];
  function rec(i, j, acc) {
    if (i === a.length && j === b.length) { out.push(acc.slice()); return; }
    if (i < a.length) { acc.push(a[i]); rec(i + 1, j, acc); acc.pop(); }
    if (j < b.length) { acc.push(b[j]); rec(i, j + 1, acc); acc.pop(); }
  }
  rec(0, 0, []);
  return out;
}

function binom(n, k) {
  var r = 1;
  for (var i = 1; i <= k; i++) r = r * (n - k + i) / i;
  return Math.round(r);
}

/* ---- 7. timestamp ordering ---- */
function tso(sched, ts) {
  var R = {}, Wt = {}, log = [];
  sched.forEach(function (o) {
    if (o.op === 'c') { log.push({ op: 'c', t: o.t, action: 'commit' }); return; }
    var x = o.item, T = ts[o.t];
    if (o.op === 'r') {
      if (Wt[x] !== undefined && T < Wt[x]) {
        log.push({ op: 'r', t: o.t, item: x, action: 'abort', why: 'W_TS(' + x + ')=' + Wt[x] + ' > ' + T });
        return;
      }
      R[x] = Math.max(R[x] === undefined ? -1 : R[x], T);
      log.push({ op: 'r', t: o.t, item: x, action: 'read', rts: R[x], wts: Wt[x] });
    } else {
      if (R[x] !== undefined && T < R[x]) {
        log.push({ op: 'w', t: o.t, item: x, action: 'abort', why: 'R_TS(' + x + ')=' + R[x] + ' > ' + T });
        return;
      }
      if (Wt[x] !== undefined && T < Wt[x]) {
        log.push({ op: 'w', t: o.t, item: x, action: 'thomas', why: 'W_TS(' + x + ')=' + Wt[x] + ' > ' + T });
        return;
      }
      Wt[x] = T;
      log.push({ op: 'w', t: o.t, item: x, action: 'write', rts: R[x], wts: Wt[x] });
    }
  });
  return log;
}

/* ======================================================================
   THE DATA THIS LESSON USES
   ====================================================================== */

/* GATE CSE 2014 Set 3 - three transactions, two schedules */
var P2014 = {
  1: [mk(1, 'r', 'X'), mk(1, 'r', 'Z'), mk(1, 'w', 'X'), mk(1, 'w', 'Z')],
  2: [mk(2, 'r', 'Y'), mk(2, 'r', 'Z'), mk(2, 'w', 'Z')],
  3: [mk(3, 'r', 'Y'), mk(3, 'r', 'X'), mk(3, 'w', 'Y')]
};
var S1 = parse('r1X r3Y r3X r2Y r2Z w3Y w2Z r1Z w1X w1Z');
var S2 = parse('r1X r3Y r2Y r3X r1Z r2Z w3Y w1X w2Z w1Z');

/* the blind-write schedule: view serialisable, not conflict serialisable */
var PBLIND = {
  1: [mk(1, 'r', 'A'), mk(1, 'w', 'A')],
  2: [mk(2, 'w', 'A')],
  3: [mk(3, 'w', 'A')]
};
var SBLIND = parse('r1A w2A w1A w3A');

/* GATE CSE 2017 Set 2 - the counting question */
var T2017A = [mk(1, 'r', 'X'), mk(1, 'w', 'X'), mk(1, 'r', 'Y'), mk(1, 'w', 'Y')];
var T2017B = [mk(2, 'r', 'Y'), mk(2, 'w', 'Y'), mk(2, 'r', 'Z'), mk(2, 'w', 'Z')];

/* GATE CSE 2022 - one schedule, four candidate serial orders */
var S2022 = parse('r4X r2X r3X r1Y w1Y w2X w3Y r4Y');

/* GATE CSE 2025 Set 2 Q53 - four candidate schedules */
var S2025 = {
  A: parse('r1X w2X w1Y w2Y r1X w1X'),
  B: parse('w2X r1X w2Y w1Y r1X w1X'),
  C: parse('r1X w1Y w2X w2Y r1X w1X'),
  D: parse('w2X r1X w1Y w2Y r1X w1X')
};

/* the recovery ladder, one witness schedule per rung */
var SREC = {
  notRec: parse('w1X r2X c2 c1'),
  recNotAca: parse('w1X r2X c1 c2'),
  aca: parse('w1X c1 r2X c2')
};

/* the timestamp-ordering trace */
var STSO = parse('r1X w2X w1X r1X w2X');
var TSTSO = { 1: 10, 2: 20 };

/* ---------- compute everything once ---------- */
var G1 = precGraph(S1), G2 = precGraph(S2), GB = precGraph(SBLIND);
var GB2022 = precGraph(S2022);
var ALL2017 = shuffles(T2017A, T2017B);
var CS2017 = ALL2017.filter(function (s) { return !hasCycle(precGraph(s)); });
var TSO_LOG = tso(STSO, TSTSO);
var SPANS_S1 = lockSpans(S1);

var V = {
  S1edges: G1.edges, S1cycle: hasCycle(G1), S1topo: topoOrders(G1),
  S2edges: G2.edges, S2cycle: hasCycle(G2),
  S1view: isViewSerializable(S1, P2014),
  blindCycle: hasCycle(GB), blindView: isViewSerializable(SBLIND, PBLIND),
  total2017: ALL2017.length, cs2017: CS2017.length,
  binom2017: binom(8, 4),
  cs2017NotView: CS2017.filter(function (s) { return !isViewSerializable(s, { 1: T2017A, 2: T2017B }); }).length,
  s2plOnAll2017: ALL2017.filter(function (s) { return is2PL(s).ok; }).length,
  twoPlViolations: ALL2017.filter(function (s) { return is2PL(s).ok && hasCycle(precGraph(s)); }).length,
  s1is2PL: is2PL(S1).ok, s1is2PLwhy: is2PL(S1).bad,
  rec: {
    notRec: { rec: isRecoverable(SREC.notRec), aca: isCascadeless(SREC.notRec), strict: isStrict(SREC.notRec) },
    recNotAca: { rec: isRecoverable(SREC.recNotAca), aca: isCascadeless(SREC.recNotAca), strict: isStrict(SREC.recNotAca) },
    aca: { rec: isRecoverable(SREC.aca), aca: isCascadeless(SREC.aca), strict: isStrict(SREC.aca) }
  },
  s2022topo: topoOrders(GB2022),
  s2022cycle: hasCycle(GB2022),
  s2025: {
    A: !hasCycle(precGraph(S2025.A)),
    B: !hasCycle(precGraph(S2025.B)),
    C: !hasCycle(precGraph(S2025.C)),
    D: !hasCycle(precGraph(S2025.D))
  },
  tsoLog: TSO_LOG,
  tsoAborts: TSO_LOG.filter(function (l) { return l.action === 'abort'; }).length,
  tsoThomas: TSO_LOG.filter(function (l) { return l.action === 'thomas'; }).length,
  spansS1: SPANS_S1
};

/* ======================================================================
   LAYER 2 - THE CHECKS. Each one re-verifies a computed value against the
   definition it came from, so a bug in the model fails loudly.
   ====================================================================== */

chk('a read and a write of the same item by different transactions conflict',
  conflicts(mk(1, 'r', 'X'), mk(2, 'w', 'X')));
chk('two reads of the same item do not conflict',
  !conflicts(mk(1, 'r', 'X'), mk(2, 'r', 'X')));
chk('two writes of the same item conflict',
  conflicts(mk(1, 'w', 'X'), mk(2, 'w', 'X')));
chk('operations of the same transaction never conflict, even on the same item',
  !conflicts(mk(1, 'r', 'X'), mk(1, 'w', 'X')));
chk('operations on different items never conflict',
  !conflicts(mk(1, 'w', 'X'), mk(2, 'w', 'Y')));

chk('S1 (GATE 2014 Set 3) has exactly three distinct edges',
  V.S1edges.length === 3, V.S1edges.map(function (e) { return e.from + '->' + e.to; }).join(','));
chk('S1 is conflict serialisable', !V.S1cycle);
chk('S1 has exactly one topological order', V.S1topo.length === 1);
chk('that order is T2, T3, T1', V.S1topo[0] && V.S1topo[0].join(',') === '2,3,1',
  V.S1topo[0] && V.S1topo[0].join(','));
chk('S2 is not conflict serialisable', V.S2cycle);
chk('S2 has no topological order', topoOrders(G2).length === 0);
chk('S1, being conflict serialisable, is also view serialisable', V.S1view);
chk('exactly one of the two schedules is conflict serialisable',
  (!V.S1cycle) !== (!V.S2cycle));

chk('the blind-write schedule has a cycle', V.blindCycle);
chk('the blind-write schedule is still view serialisable', V.blindView);
chk('so conflict serialisability does not imply its converse',
  V.blindView && V.blindCycle);
chk('T2 writes A without reading it first, which is what makes it a blind write',
  PBLIND[2].every(function (o) { return o.op !== 'r'; }));
chk('the blind-write schedule reads A exactly once', readsFrom(SBLIND).reads.length === 1);
chk('that read sees the initial value, as it does in the serial order T1, T2, T3',
  readsFrom(SBLIND).reads[0].from === 0 && readsFrom(serialSchedule([1, 2, 3], PBLIND)).reads[0].from === 0);
chk('and the last writer of A is T3, again as in that serial order',
  finalWrites(SBLIND).A === 3 && finalWrites(serialSchedule([1, 2, 3], PBLIND)).A === 3);

chk('the 2017 pair has C(8,4) = 70 interleavings', V.total2017 === 70, V.total2017);
chk('the binomial computation agrees with the enumeration', V.binom2017 === V.total2017);
chk('exactly 54 of them are conflict serialisable', V.cs2017 === 54, V.cs2017);
chk('1 + 53 = 54, the split the solution uses', 1 + 53 === V.cs2017);
chk('every conflict-serialisable interleaving is also view serialisable',
  V.cs2017NotView === 0, V.cs2017NotView + ' counterexamples');

chk('two-phase locking never produces a schedule with a cycle',
  V.twoPlViolations === 0, V.twoPlViolations + ' violations');
chk('S1 is conflict serialisable but not producible under two-phase locking',
  !V.S1cycle && !V.s1is2PL);
chk('the reason is an overlap on X between T1 and T3',
  V.s1is2PLwhy.some(function (d) { return d.indexOf('X') >= 0 && d.indexOf('T1') >= 0 && d.indexOf('T3') >= 0; }),
  V.s1is2PLwhy.join(' | '));

chk('w1X r2X c2 c1 is not recoverable', !V.rec.notRec.rec);
chk('w1X r2X c1 c2 is recoverable', V.rec.recNotAca.rec);
chk('w1X r2X c1 c2 is not cascadeless', !V.rec.recNotAca.aca);
chk('w1X c1 r2X c2 is cascadeless', V.rec.aca.aca);
chk('and therefore recoverable as well', V.rec.aca.rec);
chk('a cascadeless schedule is always strict on these witnesses', V.rec.aca.strict);

chk('the 2022 schedule is acyclic', !V.s2022cycle);
chk('and its only topological order is T1, T3, T4, T2',
  V.s2022topo.length === 1 && V.s2022topo[0].join(',') === '1,3,4,2',
  V.s2022topo.map(function (o) { return o.join(','); }).join(' / '));
chk('exactly one of the four 2025 options is conflict serialisable',
  ['A', 'B', 'C', 'D'].filter(function (k) { return V.s2025[k]; }).length === 1);
chk('that option is B', V.s2025.B && !V.s2025.A && !V.s2025.C && !V.s2025.D);

chk('the timestamp trace aborts the late read', V.tsoAborts === 1, V.tsoAborts + ' aborts');
chk('the Thomas rule ignores the obsolete write instead of aborting it', V.tsoThomas === 1, V.tsoThomas);
chk('no operation in the trace waits, which is why timestamp ordering cannot deadlock',
  TSO_LOG.every(function (l) { return l.action !== 'wait'; }));

/* ======================================================================
   LAYER 3 - RENDER. Reads the model; never re-derives it.
   ====================================================================== */

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function rv(t, a, d) { return clamp01((t - a) / (d || 1)); }
function ease(v) { return v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2; }
function txt(x, y, s, o) { P.text(x, y, s, o || {}); }

function box(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, {
    fill: o.fill, stroke: o.stroke, sw: o.sw || 1.4,
    radius: o.radius === undefined ? 8 : o.radius, dash: o.dash
  });
}
function label(x, y, s, o) {
  o = o || {};
  txt(x, y, s, { size: o.size || 11, mono: true, color: o.color || PAL.faint, bold: !!o.bold, align: o.align });
}
function head(s, sub) {
  txt(40, 22, s, { size: 17, bold: true, color: PAL.ink });
  if (sub) txt(40, 44, s === sub ? '' : sub, { size: 12, mono: true, color: PAL.faint });
  P.line(40, 58, W - 40, 58, { stroke: PAL.border, sw: 1 });
}
function bg() {
  P.rect(0, 0, W, H, { fill: PAL.surface });
  P.rect(0, 0, W, 4, { fill: PAL.accent });
}

/* one operation as a short string: r1(X) */
function opStr(o) {
  if (o.op === 'c') return 'c' + o.t;
  return o.op + o.t + '(' + o.item + ')';
}

/* the GATE table: one column per transaction, one row per position.
   A cell is {t, op, item} or null. */
function scheduleTable(x, y, cols, rows, o) {
  o = o || {};
  var cw = o.cw || 96, rh = o.rh || 24;
  var i, r, c;
  for (c = 0; c < cols.length; c++) {
    var hx = x + c * (cw + 6);
    box(hx, y, cw, rh - 2, { fill: PAL.surface2, stroke: PAL.border, radius: 4 });
    txt(hx + cw / 2, y + (rh - 2) / 2, 'T' + cols[c], {
      size: 11, bold: true, mono: true, align: 'center', base: 'middle', color: PAL.dim
    });
  }
  for (r = 0; r < rows.length; r++) {
    var ry = y + rh + 4 + r * rh;
    for (c = 0; c < cols.length; c++) {
      var cell = rows[r][c];
      if (!cell) continue;
      var cx = x + c * (cw + 6);
      var hot = o.highlight && o.highlight.indexOf(r) >= 0;
      box(cx, ry, cw, rh - 4, {
        fill: hot ? PAL.warnDim : PAL.surface,
        stroke: hot ? PAL.warn : PAL.border, sw: hot ? 1.6 : 1, radius: 4
      });
      txt(cx + cw / 2, ry + (rh - 4) / 2, opStr(cell), {
        size: 11, mono: true, align: 'center', base: 'middle',
        color: cell.op === 'w' ? PAL.invalid : PAL.ink, bold: cell.op === 'w'
      });
    }
  }
  return y + rh + 4 + rows.length * rh;
}

/* turn a schedule into table rows for the given transaction columns */
function toRows(sched, cols) {
  var rows = [];
  sched.forEach(function (op) {
    var row = cols.map(function () { return null; });
    row[cols.indexOf(op.t)] = op;
    rows.push(row);
  });
  return rows;
}

/* a node of a precedence graph, with its label under it */
function gnode(x, y, r, name, o) {
  o = o || {};
  P.circle(x, y, r, {
    fill: o.fill || PAL.surface, stroke: o.stroke || PAL.accent, sw: o.sw || 2
  });
  txt(x, y, name, { size: 13, bold: true, mono: true, align: 'center', base: 'middle', color: o.color || PAL.ink });
}

/* a straight arrow between two circles, trimmed to their rims */
function gedge(x1, y1, x2, y2, r, o) {
  o = o || {};
  var dx = x2 - x1, dy = y2 - y1;
  var d = Math.sqrt(dx * dx + dy * dy) || 1;
  var ux = dx / d, uy = dy / d;
  P.arrow(x1 + ux * r, y1 + uy * r, x2 - ux * r, y2 - uy * r, {
    stroke: o.stroke || PAL.dim, sw: o.sw || 1.6, head: 8, dash: o.dash
  });
}

/* ======================================================================
   SCENES
   ====================================================================== */

/* ---------------- scene 1: the lost update ---------------- */
function scLost(t) {
  head('Why a database cannot just run transactions one at a time',
    'one interleaving, two reads of the same value, one lost update');

  var a = rv(t, 1, 3);
  if (a > 0) {
    P.alpha(ease(a));
    label(40, 74, 'serial: T1 then T2');
    var rowsS = [
      [{ t: 1, op: 'r', item: 'B' }, null],
      [{ t: 1, op: 'w', item: 'B' }, null],
      [null, { t: 2, op: 'r', item: 'B' }],
      [null, { t: 2, op: 'w', item: 'B' }]
    ];
    scheduleTable(40, 86, [1, 2], rowsS, { cw: 92, rh: 24 });
    box(40, 208, 190, 34, { fill: PAL.accentDim, stroke: PAL.accent, radius: 6 });
    txt(52, 220, 'balance 150 \u2212 50 + 100', { size: 11, mono: true, color: PAL.accent });
    txt(52, 234, '= 200, correct', { size: 11, mono: true, bold: true, color: PAL.accent });
    P.alpha(1);
  }

  var b = rv(t, 8, 3);
  if (b > 0) {
    P.alpha(ease(b));
    label(470, 74, 'interleaved: both read before either writes');
    var rowsI = [
      [{ t: 1, op: 'r', item: 'B' }, null],
      [null, { t: 2, op: 'r', item: 'B' }],
      [{ t: 1, op: 'w', item: 'B' }, null],
      [null, { t: 2, op: 'w', item: 'B' }]
    ];
    scheduleTable(470, 86, [1, 2], rowsI, { cw: 92, rh: 24, highlight: [0, 1] });
    box(470, 208, 200, 34, { fill: PAL.invalidDim, stroke: PAL.invalid, radius: 6 });
    txt(482, 220, 'balance 100 \u2212 50 + 100', { size: 11, mono: true, color: PAL.invalid });
    txt(482, 234, '= 150, one update lost', { size: 11, mono: true, bold: true, color: PAL.invalid });
    P.alpha(1);
  }

  var c = rv(t, 15, 3);
  if (c > 0) {
    P.alpha(ease(c));
    box(40, 258, 380, 62, { fill: PAL.surface2, stroke: PAL.border, radius: 8 });
    txt(56, 272, 'Both transactions read the same stale value.', { size: 12, color: PAL.ink });
    txt(56, 290, 'Both computed from it. The second write', { size: 12, color: PAL.ink });
    txt(56, 308, 'overwrote the first, and no error was raised.', { size: 12, color: PAL.ink });

    box(470, 258, 390, 62, { fill: PAL.accentDim, stroke: PAL.accent, radius: 8 });
    txt(486, 272, 'The demand is not "run serially". It is:', { size: 12, color: PAL.ink });
    txt(486, 290, 'the result must equal SOME serial order.', { size: 12, bold: true, color: PAL.accent });
    txt(486, 308, 'That demand is called serialisability.', { size: 12, color: PAL.ink });
    P.alpha(1);
  }

  var d = rv(t, 23, 3);
  if (d > 0) {
    P.alpha(ease(d));
    box(40, 336, 820, 108, { fill: PAL.warnDim, stroke: PAL.warn, radius: 8 });
    txt(56, 352, 'Why the fix cannot be "one at a time"', { size: 13, bold: true, color: PAL.warn });
    txt(56, 376, 'Throughput is the reason concurrency exists. Serial execution wastes the disk wait of', { size: 12, color: PAL.ink });
    txt(56, 394, 'every transaction, so the system interleaves and then has to prove the interleaving safe.', { size: 12, color: PAL.ink });
    txt(56, 418, 'A lost update raises no error: the check must be structural, not a runtime detection.', { size: 12, color: PAL.ink });
    P.alpha(1);
  }
}

/* ---------------- scene 2: ACID ---------------- */
function scAcid(t) {
  head('ACID, and the mechanism each letter buys',
    'four promises, four different parts of the system');

  var cards = [
    { k: 'A', name: 'Atomicity', body: 'all of it, or none of it', mech: 'the log and undo on restart', col: PAL.invalid, dim: PAL.invalidDim, at: 1 },
    { k: 'C', name: 'Consistency', body: 'valid state to valid state', mech: 'constraints, plus the application', col: PAL.warn, dim: PAL.warnDim, at: 8 },
    { k: 'I', name: 'Isolation', body: 'equivalent to some serial order', mech: 'the concurrency-control protocol', col: PAL.accent, dim: PAL.accentDim, at: 15 },
    { k: 'D', name: 'Durability', body: 'a commit survives a crash', mech: 'the write-ahead log on stable storage', col: PAL.info, dim: PAL.surface2, at: 22 }
  ];

  cards.forEach(function (c, i) {
    var p = rv(t, c.at, 3);
    if (p <= 0) return;
    P.alpha(ease(p));
    var x = 40 + (i % 2) * 420, y = 76 + Math.floor(i / 2) * 118;
    box(x, y, 400, 104, { fill: c.dim, stroke: c.col, radius: 8 });
    txt(x + 16, y + 12, c.k, { size: 22, bold: true, mono: true, color: c.col });
    txt(x + 44, y + 16, c.name, { size: 14, bold: true, color: PAL.ink });
    txt(x + 16, y + 46, c.body, { size: 12, color: PAL.ink });
    txt(x + 16, y + 68, 'enforced by:', { size: 10, mono: true, color: PAL.faint });
    txt(x + 16, y + 82, c.mech, { size: 11, mono: true, color: c.col });
    P.alpha(1);
  });

  var f = rv(t, 27, 3);
  if (f > 0) {
    P.alpha(ease(f));
    box(40, 336, 820, 104, { fill: PAL.surface2, stroke: PAL.border, radius: 8 });
    txt(56, 352, 'Only one of the four is this lesson', { size: 13, bold: true, color: PAL.ink });
    txt(56, 376, 'Atomicity and durability are recovery properties: they are about a crash. Isolation is the', { size: 12, color: PAL.ink });
    txt(56, 394, 'concurrency property: it is about two live transactions touching the same item. Consistency', { size: 12, color: PAL.ink });
    txt(56, 412, 'is the one letter no engine can enforce alone, because it depends on what the data means.', { size: 12, color: PAL.ink });
    P.alpha(1);
  }
}

/* ---------------- scene 3: the conflict ---------------- */
function scConflict(t) {
  head('The conflict: same item, two transactions, one write',
    'three conditions, all required, and the pair that fails one');

  var a = rv(t, 1, 3);
  if (a > 0) {
    P.alpha(ease(a));
    var conds = ['same data item', 'different transactions', 'at least one is a write'];
    conds.forEach(function (s, i) {
      var y = 78 + i * 44;
      box(40, y, 340, 36, { fill: PAL.accentDim, stroke: PAL.accent, radius: 6 });
      txt(56, y + 10, String(i + 1) + '.', { size: 12, bold: true, mono: true, color: PAL.accent });
      txt(84, y + 10, s, { size: 12, color: PAL.ink });
    });
    txt(40, 224, 'All three, or it is not a conflict.', { size: 12, bold: true, color: PAL.ink });
    P.alpha(1);
  }

  var b = rv(t, 8, 3);
  if (b > 0) {
    P.alpha(ease(b));
    label(430, 74, 'the three shapes');
    var pairs = [
      { a: 'r1(X)', b: 'w2(X)', n: 'read then write', ok: true },
      { a: 'w1(X)', b: 'r2(X)', n: 'write then read', ok: true },
      { a: 'w1(X)', b: 'w2(X)', n: 'write then write', ok: true },
      { a: 'r1(X)', b: 'r2(X)', n: 'read then read', ok: false }
    ];
    pairs.forEach(function (p, i) {
      var y = 88 + i * 38;
      box(430, y, 410, 30, {
        fill: p.ok ? PAL.invalidDim : PAL.valid === undefined ? PAL.surface2 : PAL.surface2,
        stroke: p.ok ? PAL.invalid : PAL.border, sw: p.ok ? 1.5 : 1, radius: 5
      });
      txt(444, y + 8, p.a, { size: 11, mono: true, color: PAL.ink });
      txt(508, y + 8, p.b, { size: 11, mono: true, color: PAL.ink });
      txt(576, y + 8, p.n, { size: 11, color: PAL.dim });
      txt(792, y + 8, p.ok ? 'conflict' : 'not a conflict', {
        size: 10, mono: true, align: 'right', color: p.ok ? PAL.invalid : PAL.valid, bold: true
      });
    });
    P.alpha(1);
  }

  var c = rv(t, 15, 3);
  if (c > 0) {
    P.alpha(ease(c));
    box(40, 250, 380, 96, { fill: PAL.surface2, stroke: PAL.border, radius: 8 });
    txt(56, 264, 'What a conflict pins down', { size: 12, bold: true, color: PAL.ink });
    txt(56, 286, 'The earlier operation must stay earlier in any', { size: 11, color: PAL.ink });
    txt(56, 302, 'equivalent serial order. One conflict, one edge.', { size: 11, color: PAL.ink });
    txt(56, 326, 'Everything else may be reordered freely.', { size: 11, mono: true, color: PAL.dim });

    box(440, 250, 420, 96, { fill: PAL.warnDim, stroke: PAL.warn, radius: 8 });
    txt(456, 264, 'The trap in this scene', { size: 12, bold: true, color: PAL.warn });
    txt(456, 286, 'Read-read is never a conflict, however many', { size: 11, color: PAL.ink });
    txt(456, 302, 'transactions read the item. Reads change nothing,', { size: 11, color: PAL.ink });
    txt(456, 318, 'so they constrain no order.', { size: 11, color: PAL.ink });
    P.alpha(1);
  }

  var d = rv(t, 23, 3);
  if (d > 0) {
    P.alpha(ease(d));
    box(40, 360, 820, 84, { fill: PAL.accentDim, stroke: PAL.accent, radius: 8 });
    txt(56, 374, 'Conflict serialisable, in one sentence', { size: 13, bold: true, color: PAL.accent });
    txt(56, 398, 'A schedule is conflict serialisable when all the orders its conflicts pin down can be', { size: 12, color: PAL.ink });
    txt(56, 416, 'satisfied at once — and a set of orders is satisfiable at once exactly when it has no cycle.', { size: 12, color: PAL.ink });
    P.alpha(1);
  }
}

/* ---------------- scene 4: the precedence graph ---------------- */
function scPrec(t) {
  head('The precedence graph decides conflict serialisability',
    'GATE CSE 2014 Set 3 \u2014 three transactions, two schedules');

  var a = rv(t, 1, 3);
  if (a > 0) {
    P.alpha(ease(a));
    label(40, 68, 'S1');
    scheduleTable(40, 76, [1, 2, 3], toRows(S1, [1, 2, 3]), { cw: 68, rh: 16 });
    label(40, 258, 'S2 \u2014 one read on Z moved to the front');
    scheduleTable(40, 278, [1, 2, 3], toRows(S2, [1, 2, 3]), { cw: 68, rh: 16 });
    P.alpha(1);
  }

  var b = rv(t, 8, 3);
  if (b > 0) {
    P.alpha(ease(b));
    var r = 24;
    label(490, 72, 'precedence graph of S1');
    gnode(570, 120, r, 'T2', { stroke: PAL.accent, fill: PAL.accentDim });
    gnode(722, 120, r, 'T3', { stroke: PAL.accent, fill: PAL.surface });
    gnode(646, 202, r, 'T1', { stroke: PAL.accent, fill: PAL.surface });
    gedge(570, 120, 722, 120, r, { stroke: PAL.accent });
    gedge(722, 120, 646, 202, r, { stroke: PAL.accent });
    gedge(570, 120, 646, 202, r, { stroke: PAL.dim, dash: [5, 4] });
    txt(490, 242, 'Y: r2 before w3  \u2192  T2 \u2192 T3', { size: 11, mono: true, color: PAL.dim });
    txt(490, 258, 'X: r3 before w1  \u2192  T3 \u2192 T1', { size: 11, mono: true, color: PAL.dim });
    txt(490, 274, 'Z: w2 before r1  \u2192  T2 \u2192 T1', { size: 11, mono: true, color: PAL.dim });
    box(490, 288, 380, 26, { fill: PAL.accentDim, stroke: PAL.accent, radius: 5 });
    txt(502, 296, 'acyclic \u2192 conflict serialisable, order T2, T3, T1', { size: 11, mono: true, bold: true, color: PAL.accent });
    P.alpha(1);
  }

  var c = rv(t, 15, 3);
  if (c > 0) {
    P.alpha(ease(c));
    var r2 = 20;
    label(490, 330, 'precedence graph of S2 \u2014 the cycle');
    gnode(545, 368, r2, 'T1', { stroke: PAL.invalid, fill: PAL.invalidDim });
    gnode(745, 368, r2, 'T2', { stroke: PAL.invalid, fill: PAL.invalidDim });
    gedge(545, 368, 745, 368, r2, { stroke: PAL.invalid });
    P.alpha(ease(c));
    txt(645, 350, 'r1(Z) before w2(Z)', { size: 10, mono: true, align: 'center', color: PAL.invalid });
    txt(645, 392, 'w2(Z) before w1(Z)', { size: 10, mono: true, align: 'center', color: PAL.invalid });
    P.alpha(1);
  }

  var d = rv(t, 23, 3);
  if (d > 0) {
    P.alpha(ease(d));
    box(490, 410, 380, 44, { fill: PAL.invalidDim, stroke: PAL.invalid, radius: 5 });
    txt(502, 416, 'cycle \u2192 not conflict serialisable', { size: 11, mono: true, bold: true, color: PAL.invalid });
    txt(502, 434, 'answer: only S1 \u2014 option A', { size: 11, mono: true, color: PAL.ink });
    P.alpha(1);
  }
}

/* ---------------- scene 5: view serialisability ---------------- */
function scView(t) {
  head('View serialisability, and the blind write that separates them',
    'a cycle in the graph, and still an equivalent serial order');

  var a = rv(t, 1, 3);
  if (a > 0) {
    P.alpha(ease(a));
    label(40, 74, 'the schedule: r1(A), w2(A), w1(A), w3(A)');
    var rows = [
      [{ t: 1, op: 'r', item: 'A' }, null, null],
      [null, { t: 2, op: 'w', item: 'A' }, null],
      [{ t: 1, op: 'w', item: 'A' }, null, null],
      [null, null, { t: 3, op: 'w', item: 'A' }]
    ];
    scheduleTable(40, 86, [1, 2, 3], rows, { cw: 80, rh: 24 });
    label(40, 216, 'T2 and T3 write A without reading it: blind writes');
    P.alpha(1);
  }

  var b = rv(t, 8, 3);
  if (b > 0) {
    P.alpha(ease(b));
    var cx = 190, cy = 300, r = 24;
    label(40, 246, 'its precedence graph');
    gnode(cx - 62, cy, r, 'T1', { stroke: PAL.invalid, fill: PAL.invalidDim });
    gnode(cx + 66, cy, r, 'T2', { stroke: PAL.invalid, fill: PAL.invalidDim });
    gedge(cx - 62, cy - 12, cx + 66, cy - 12, r, { stroke: PAL.invalid });
    gedge(cx + 66, cy + 12, cx - 62, cy + 12, r, { stroke: PAL.invalid });
    txt(cx + 2, cy - 34, 'T1 \u2192 T2', { size: 10, mono: true, align: 'center', color: PAL.invalid });
    txt(cx + 2, cy + 26, 'T2 \u2192 T1', { size: 10, mono: true, align: 'center', color: PAL.invalid });
    txt(40, 344, 'a cycle \u2192 not conflict serialisable', { size: 11, mono: true, color: PAL.invalid });
    P.alpha(1);
  }

  var c = rv(t, 15, 3);
  if (c > 0) {
    P.alpha(ease(c));
    label(360, 246, 'but compare it with the serial order T1, T2, T3');
    box(360, 258, 500, 92, { fill: PAL.accentDim, stroke: PAL.accent, radius: 8 });
    txt(376, 272, 'reads-from', { size: 11, mono: true, color: PAL.accent });
    txt(376, 290, 'T1 reads A from the initial value, in both', { size: 12, color: PAL.ink });
    txt(376, 314, 'final writer', { size: 11, mono: true, color: PAL.accent });
    txt(376, 332, 'T3 writes A last, in both', { size: 12, color: PAL.ink });
    P.alpha(1);
  }

  var d = rv(t, 23, 3);
  if (d > 0) {
    P.alpha(ease(d));
    box(360, 366, 500, 78, { fill: PAL.warnDim, stroke: PAL.warn, radius: 8 });
    txt(376, 380, 'the containment, and it is strict', { size: 12, bold: true, color: PAL.warn });
    txt(376, 402, 'conflict serialisable \u2282 view serialisable \u2282 serialisable', { size: 12, mono: true, color: PAL.ink });
    txt(376, 424, 'the blind write above is the witness for the left-hand strictness', { size: 11, color: PAL.dim });
    P.alpha(1);
  }
}

/* ---------------- scene 6: counting ---------------- */
function scCount(t) {
  head('Counting: 70 interleavings, 54 of them conflict serialisable',
    'GATE CSE 2017 Set 2 — counted here by enumeration, not recalled');

  var a = rv(t, 1, 3);
  if (a > 0) {
    P.alpha(ease(a));
    label(40, 74, 'the two transactions');
    box(40, 86, 400, 54, { fill: PAL.surface2, stroke: PAL.border, radius: 6 });
    txt(56, 96, 'T1: r1(X) w1(X) r1(Y) w1(Y)', { size: 12, mono: true, color: PAL.ink });
    txt(56, 116, 'T2: r2(Y) w2(Y) r2(Z) w2(Z)', { size: 12, mono: true, color: PAL.ink });
    txt(56, 132, 'X is private to T1, Z is private to T2', { size: 11, mono: true, color: PAL.dim });
    P.alpha(1);
  }

  var b = rv(t, 8, 3);
  if (b > 0) {
    P.alpha(ease(b));
    box(40, 160, 400, 92, { fill: PAL.accentDim, stroke: PAL.accent, radius: 8 });
    txt(56, 172, 'total interleavings', { size: 12, bold: true, color: PAL.accent });
    txt(56, 194, 'choose 4 of the 8 positions for T1', { size: 11, color: PAL.ink });
    txt(56, 216, 'C(8,4) = 70', { size: 20, mono: true, bold: true, color: PAL.accent });
    P.alpha(1);
  }

  var c = rv(t, 15, 3);
  if (c > 0) {
    P.alpha(ease(c));
    var bx = 480, by = 160, bw = 380, bh = 26;
    box(bx, by, bw, bh, { fill: PAL.surface2, stroke: PAL.border, radius: 5 });
    var f = V.cs2017 / V.total2017;
    box(bx, by, bw * f, bh, { fill: PAL.accent, stroke: PAL.accent, radius: 5 });
    txt(bx + 8, by + 7, '54 conflict serialisable', { size: 11, bold: true, mono: true, color: '#ffffff' });
    txt(bx + bw - 8, by + 7, '16 are not', { size: 11, mono: true, align: 'right', color: PAL.dim });
    txt(bx, by - 22, 'of the 70 interleavings, this many pass the graph test', { size: 11, mono: true, color: PAL.faint });

    txt(480, 214, 'the split', { size: 11, mono: true, color: PAL.faint });
    txt(480, 236, 'T1 wholly before T2: 1', { size: 12, mono: true, color: PAL.ink });
    txt(480, 256, 'equivalent to T2 then T1: 53', { size: 12, mono: true, color: PAL.ink });
    txt(480, 276, '1 + 53 = 54', { size: 14, mono: true, bold: true, color: PAL.accent });
    P.alpha(1);
  }

  var d = rv(t, 23, 3);
  if (d > 0) {
    P.alpha(ease(d));
    box(40, 274, 400, 70, { fill: PAL.surface2, stroke: PAL.border, radius: 8 });
    txt(56, 286, 'why only one T1-before-T2 schedule', { size: 12, bold: true, color: PAL.ink });
    txt(56, 308, 'T1 \u2192 T2 needs w1(Y) before r2(Y): T1\u2019s last', { size: 11, color: PAL.ink });
    txt(56, 326, 'operation before T2\u2019s first. Only serial works.', { size: 11, color: PAL.ink });

    box(40, 360, 820, 84, { fill: PAL.warnDim, stroke: PAL.warn, radius: 8 });
    txt(56, 374, 'The two arithmetic slips that cost this mark', { size: 12, bold: true, color: PAL.warn });
    txt(56, 398, '53 comes from forgetting the single T1-before-T2 schedule. 55 comes from counting both', { size: 12, color: PAL.ink });
    txt(56, 416, 'serial orders twice. The filter is the precedence graph, not a remembered formula.', { size: 12, color: PAL.ink });
    P.alpha(1);
  }
}

/* ---------------- scene 7: the recovery ladder ---------------- */
function scRecover(t) {
  head('Recoverable, cascadeless, strict \u2014 three different promises',
    'one-way implications, and a witness schedule for each failure');

  var a = rv(t, 1, 3);
  if (a > 0) {
    P.alpha(ease(a));
    var rungs = [
      { n: 'recoverable', d: 'if T2 read T1\u2019s value, T1 commits before T2', s: 'w1X r2X c2 c1  \u2014 fails', ok: false, y: 76 },
      { n: 'cascadeless', d: 'read only values whose writer has committed', s: 'w1X r2X c1 c2  \u2014 fails', ok: false, y: 146 },
      { n: 'strict', d: 'read or write only after the last writer commits', s: 'w1X c1 r2X c2  \u2014 holds', ok: true, y: 216 }
    ];
    rungs.forEach(function (r) {
      box(40, r.y, 420, 58, {
        fill: r.ok ? PAL.accentDim : PAL.surface2,
        stroke: r.ok ? PAL.accent : PAL.border, radius: 7
      });
      txt(56, r.y + 8, r.n, { size: 13, bold: true, color: r.ok ? PAL.accent : PAL.ink });
      txt(56, r.y + 28, r.d, { size: 11, color: PAL.dim });
      txt(56, r.y + 44, r.s, { size: 10, mono: true, color: r.ok ? PAL.accent : PAL.invalid });
    });
    P.arrow(250, 134, 250, 146, { stroke: PAL.dim, sw: 1.4, head: 7 });
    P.arrow(250, 204, 250, 216, { stroke: PAL.dim, sw: 1.4, head: 7 });
    P.alpha(1);
  }

  var b = rv(t, 8, 3);
  if (b > 0) {
    P.alpha(ease(b));
    label(500, 74, 'the same three schedules, tested');
    var rows = [
      ['w1X r2X c2 c1', 'no', 'no', 'no'],
      ['w1X r2X c1 c2', 'yes', 'no', 'no'],
      ['w1X c1 r2X c2', 'yes', 'yes', 'yes']
    ];
    var hy = 88;
    txt(500, hy, 'schedule', { size: 10, mono: true, color: PAL.faint });
    txt(700, hy, 'recoverable', { size: 10, mono: true, color: PAL.faint });
    txt(776, hy, 'cascadeless', { size: 10, mono: true, color: PAL.faint });
    txt(846, hy, 'strict', { size: 10, mono: true, color: PAL.faint });
    rows.forEach(function (r, i) {
      var y = hy + 22 + i * 30;
      txt(500, y, r[0], { size: 10, mono: true, color: PAL.ink });
      [1, 2, 3].forEach(function (k) {
        var yes = r[k] === 'yes';
        txt(700 + (k - 1) * 76, y, r[k], {
          size: 10, mono: true, bold: yes, color: yes ? PAL.valid : PAL.invalid
        });
      });
      P.line(500, y + 18, 870, y + 18, { stroke: PAL.border, sw: 0.6 });
    });
    P.alpha(1);
  }

  var c = rv(t, 15, 3);
  if (c > 0) {
    P.alpha(ease(c));
    box(500, 202, 370, 88, { fill: PAL.warnDim, stroke: PAL.warn, radius: 8 });
    txt(516, 214, 'the difference, in one line each', { size: 12, bold: true, color: PAL.warn });
    txt(516, 236, 'recoverable: compares two COMMIT points', { size: 11, color: PAL.ink });
    txt(516, 254, 'cascadeless: compares a commit with a READ', { size: 11, color: PAL.ink });
    txt(516, 272, 'strict: compares a commit with any access', { size: 11, color: PAL.ink });
    P.alpha(1);
  }

  var d = rv(t, 23, 3);
  if (d > 0) {
    P.alpha(ease(d));
    box(40, 296, 830, 148, { fill: PAL.surface2, stroke: PAL.border, radius: 8 });
    txt(56, 310, 'What each promise buys, and what it costs', { size: 13, bold: true, color: PAL.ink });
    txt(56, 336, 'Recoverable is the minimum for correctness: without it, aborting T1 can leave T2 holding a', { size: 12, color: PAL.ink });
    txt(56, 354, 'value that never existed, and T2 has already committed. Cascadeless stops the rollback from', { size: 12, color: PAL.ink });
    txt(56, 372, 'spreading. Strict is what real engines implement, because it lets undo restore an old value in', { size: 12, color: PAL.ink });
    txt(56, 390, 'place instead of writing a compensation record.', { size: 12, color: PAL.ink });
    txt(56, 416, 'The ladder is one-way. Strict implies cascadeless implies recoverable; neither arrow reverses.', {
      size: 12, mono: true, bold: true, color: PAL.accent
    });
    P.alpha(1);
  }
}

/* ---------------- scene 8: two-phase locking ---------------- */
function scLock(t) {
  head('Two-phase locking: the lock point and what it forbids',
    'a protocol that guarantees the property instead of testing it');

  var a = rv(t, 1, 3);
  if (a > 0) {
    P.alpha(ease(a));
    box(40, 74, 400, 46, { fill: PAL.accentDim, stroke: PAL.accent, radius: 7 });
    txt(56, 84, 'growing: acquire only', { size: 12, bold: true, color: PAL.accent });
    txt(56, 102, 'shrinking: release only \u2014 never acquire again', { size: 11, color: PAL.ink });
    box(460, 74, 400, 46, { fill: PAL.warnDim, stroke: PAL.warn, radius: 7 });
    txt(476, 84, 'the lock point', { size: 12, bold: true, color: PAL.warn });
    txt(476, 102, 'the moment the last lock is taken', { size: 11, color: PAL.ink });

    /* a growing/shrinking bar */
    var gx = 40, gy = 140, gw = 820;
    box(gx, gy, gw * 0.55, 20, { fill: PAL.accentDim, stroke: PAL.accent, radius: 4 });
    box(gx + gw * 0.55, gy, gw * 0.45, 20, { fill: PAL.warnDim, stroke: PAL.warn, radius: 4 });
    txt(gx + gw * 0.275, gy + 4, 'growing', { size: 11, mono: true, align: 'center', color: PAL.accent });
    txt(gx + gw * 0.775, gy + 4, 'shrinking', { size: 11, mono: true, align: 'center', color: PAL.warn });
    P.line(gx + gw * 0.55, gy - 8, gx + gw * 0.55, gy + 28, { stroke: PAL.ink, sw: 1.4 });
    txt(gx + gw * 0.55 + 6, gy + 28, 'lock point', { size: 10, mono: true, color: PAL.ink });
    P.alpha(1);
  }

  var b = rv(t, 8, 3);
  if (b > 0) {
    P.alpha(ease(b));
    label(40, 190, 'the span each transaction needs on each item, in schedule S1');
    var items = ['X', 'Y', 'Z'];
    var txs = [1, 2, 3];
    var n = S1.length;
    var px0 = 90, pw = 780;
    txs.forEach(function (tt, ti) {
      var y = 208 + ti * 40;
      txt(40, y + 5, 'T' + tt, { size: 11, mono: true, bold: true, color: PAL.dim });
      items.forEach(function (it, ii) {
        var sp = V.spansS1[tt] && V.spansS1[tt][it];
        if (!sp) return;
        var x1 = px0 + (sp.acq / n) * pw;
        var x2 = px0 + (sp.rel / n) * pw;
        var w = Math.max(6, x2 - x1);
        var yy = y + ii * 9;
        var clash = (tt === 1 || tt === 3) && it === 'X';
        box(x1, yy, w, 7, {
          fill: clash ? PAL.invalid : PAL.accentDim,
          stroke: clash ? PAL.invalid : PAL.accent, sw: 1, radius: 2
        });
        txt(x1 + w + 4, yy - 1, it, { size: 9, mono: true, color: clash ? PAL.invalid : PAL.faint });
      });
    });
    txt(40, 336, 'T1 needs X from position 0 to 8; T3 needs X at position 2.', { size: 11, mono: true, color: PAL.invalid });
    P.alpha(1);
  }

  var c = rv(t, 15, 3);
  if (c > 0) {
    P.alpha(ease(c));
    box(40, 356, 400, 88, { fill: PAL.invalidDim, stroke: PAL.invalid, radius: 8 });
    txt(56, 368, 'so no 2PL execution produces S1', { size: 12, bold: true, color: PAL.invalid });
    txt(56, 390, 'Whichever transaction holds the lock on X,', { size: 11, color: PAL.ink });
    txt(56, 406, 'the other cannot be inside its own span.', { size: 11, color: PAL.ink });
    txt(56, 426, 'S1 is still conflict serialisable.', { size: 11, bold: true, color: PAL.invalid });

    box(460, 356, 400, 88, { fill: PAL.accentDim, stroke: PAL.accent, radius: 8 });
    txt(476, 368, '2PL buys exactly one thing', { size: 12, bold: true, color: PAL.accent });
    txt(476, 390, 'conflict serialisability \u2014 sufficient, not', { size: 11, color: PAL.ink });
    txt(476, 406, 'necessary. It does not prevent deadlock, and', { size: 11, color: PAL.ink });
    txt(476, 426, 'it does not by itself make a schedule strict.', { size: 11, color: PAL.ink });
    P.alpha(1);
  }
}

/* ---------------- scene 9: timestamp ordering ---------------- */
function scTs(t) {
  head('Timestamp ordering and the Thomas write rule',
    'no waiting, so no deadlock \u2014 the price is an abort');

  var a = rv(t, 1, 3);
  if (a > 0) {
    P.alpha(ease(a));
    box(40, 74, 400, 60, { fill: PAL.surface2, stroke: PAL.border, radius: 7 });
    txt(56, 86, 'ts(T1) = 10, ts(T2) = 20', { size: 13, mono: true, bold: true, color: PAL.ink });
    txt(56, 108, 'the protocol enforces timestamp order,', { size: 11, color: PAL.dim });
    txt(56, 122, 'not arrival order', { size: 11, color: PAL.dim });
    box(460, 74, 400, 60, { fill: PAL.accentDim, stroke: PAL.accent, radius: 7 });
    txt(476, 86, 'each item keeps R_TS and W_TS', { size: 12, mono: true, bold: true, color: PAL.accent });
    txt(476, 108, 'the largest timestamp that has read it,', { size: 11, color: PAL.ink });
    txt(476, 122, 'and the largest that has written it', { size: 11, color: PAL.ink });
    P.alpha(1);
  }

  var b = rv(t, 8, 3);
  if (b > 0) {
    P.alpha(ease(b));
    label(40, 148, 'the trace: r1(X) w2(X) w1(X) r1(X) w2(X)');
    var y0 = 166;
    txt(40, y0, 'step', { size: 10, mono: true, color: PAL.faint });
    txt(110, y0, 'operation', { size: 10, mono: true, color: PAL.faint });
    txt(230, y0, 'decision', { size: 10, mono: true, color: PAL.faint });
    txt(400, y0, 'why', { size: 10, mono: true, color: PAL.faint });
    V.tsoLog.forEach(function (l, i) {
      var y = y0 + 20 + i * 26;
      txt(40, y, String(i + 1), { size: 10, mono: true, color: PAL.faint });
      txt(110, y, l.op + l.t + '(' + (l.item || '\u2014') + ')', { size: 10, mono: true, color: PAL.ink });
      var col = l.action === 'abort' ? PAL.invalid : l.action === 'thomas' ? PAL.warn : PAL.valid;
      txt(230, y, l.action, { size: 10, mono: true, bold: true, color: col });
      if (l.why) txt(400, y, l.why, { size: 10, mono: true, color: PAL.dim });
      P.line(40, y + 16, 860, y + 16, { stroke: PAL.border, sw: 0.5 });
    });
    P.alpha(1);
  }

  var c = rv(t, 15, 3);
  if (c > 0) {
    P.alpha(ease(c));
    box(40, 310, 400, 78, { fill: PAL.invalidDim, stroke: PAL.invalid, radius: 8 });
    txt(56, 322, 'the read at step 4 is too late', { size: 12, bold: true, color: PAL.invalid });
    txt(56, 344, 'T1 has timestamp 10, but T2 with 20 has', { size: 11, color: PAL.ink });
    txt(56, 360, 'already written X. T1 must restart.', { size: 11, color: PAL.ink });
    txt(56, 376, 'it cannot wait, so it cannot deadlock', { size: 10, mono: true, color: PAL.dim });

    box(460, 310, 400, 78, { fill: PAL.warnDim, stroke: PAL.warn, radius: 8 });
    txt(476, 322, 'the write at step 3 is only obsolete', { size: 12, bold: true, color: PAL.warn });
    txt(476, 344, 'T1 writes X with timestamp 10 while W_TS(X)', { size: 11, color: PAL.ink });
    txt(476, 360, 'is already 20. Nothing observable changes,', { size: 11, color: PAL.ink });
    txt(476, 376, 'so the Thomas rule ignores it: no abort.', { size: 11, color: PAL.ink });
    P.alpha(1);
  }

  var d = rv(t, 23, 3);
  if (d > 0) {
    P.alpha(ease(d));
    box(40, 400, 820, 44, { fill: PAL.accentDim, stroke: PAL.accent, radius: 7 });
    txt(56, 410, 'Locks wait and can deadlock. Timestamps refuse and restart.', { size: 12, bold: true, color: PAL.accent });
    txt(56, 428, 'Deadlock-free is not starvation-free: a small timestamp can be restarted repeatedly.', { size: 11, color: PAL.ink });
    P.alpha(1);
  }
}

/* ---------------- scene 10: the procedure ---------------- */
function scDecide(t) {
  head('The five-step procedure, and the marks it saves',
    'start from what the question asks, never from what you remember');

  var steps = [
    { n: '1', h: 'read what is asked', b: 'conflict, view, recovery and locking are four tests', at: 1 },
    { n: '2', h: 'lay the schedule out as a table', b: 'one column per transaction, one row per position', at: 8 },
    { n: '3', h: 'add an edge per conflicting pair', b: 'same item, different transactions, at least one write', at: 15 },
    { n: '4', h: 'look only for a cycle', b: 'if none, read the topological order and stop', at: 15 },
    { n: '5', h: 'counting and locking are arithmetic', b: 'C(total, one transaction) then filter; spans then overlap', at: 23 }
  ];

  steps.forEach(function (s, i) {
    var p = rv(t, s.at, 3);
    if (p <= 0) return;
    P.alpha(ease(p));
    var y = 74 + i * 62;
    box(40, y, 820, 52, {
      fill: i === 3 ? PAL.invalidDim : PAL.surface2,
      stroke: i === 3 ? PAL.invalid : PAL.border, radius: 7
    });
    P.circle(68, y + 26, 15, { fill: i === 3 ? PAL.invalid : PAL.accent, stroke: i === 3 ? PAL.invalid : PAL.accent });
    txt(68, y + 26, s.n, { size: 12, bold: true, mono: true, align: 'center', base: 'middle', color: '#ffffff' });
    txt(96, y + 10, s.h, { size: 13, bold: true, color: PAL.ink });
    txt(96, y + 32, s.b, { size: 11, color: PAL.dim });
    P.alpha(1);
  });

  var f = rv(t, 27, 3);
  if (f > 0) {
    P.alpha(ease(f));
    box(40, 392, 820, 52, { fill: PAL.warnDim, stroke: PAL.warn, radius: 7 });
    txt(56, 402, 'The most expensive error in this chapter', { size: 12, bold: true, color: PAL.warn });
    txt(56, 422, 'Testing a schedule for a property the question did not ask about. Step one is the whole answer.', { size: 11, color: PAL.ink });
    P.alpha(1);
  }
}

var SCENES = {
  lost: scLost, acid: scAcid, conflict: scConflict, prec: scPrec, view: scView,
  count: scCount, recover: scRecover, lock: scLock, ts: scTs, decide: scDecide
};

/* ======================================================================
   LAYER 4 - BOOT
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
  bg();
  if (sc && SCENES[sc.id]) {
    try {
      SCENES[sc.id](tt - sc.start);
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
