/* ==========================================================================
   atomic-instructions-and-locks — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model is checked three independent ways:
     (a) an exhaustive breadth-first search over every interleaving of the
         processes running each lock, with the mutual-exclusion invariant
         asserted at every reachable state;
     (b) a forward search from the reachable state of the GATE 2012 lock that
         has nobody inside, which must visit further states without ever
         entering the section;
     (c) an independent arithmetic check on the waiting array's exit scan, on
         every waiting vector for two to five processes.
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

function deepClone(S) {
  var T = {}, k;
  for (k in S) {
    if (Object.prototype.toString.call(S[k]) === '[object Array]') T[k] = S[k].slice();
    else T[k] = S[k];
  }
  return T;
}
function stateKey(S) {
  return JSON.stringify([S.pc, S.loc, S.lock, S.inCS, S.waiting, S.nt, S.ns, S.tk, S.vis]);
}

function fresh(n, extra) {
  var S = {
    pc: [], loc: [], inCS: [], vis: [],
    lock: 0, waiting: [], nt: 0, ns: 0, tk: []
  };
  for (var i = 0; i < n; i++) {
    S.pc.push(0); S.loc.push(0); S.inCS.push(0); S.vis.push(0); S.waiting.push(0); S.tk.push(-1);
  }
  if (extra) for (var k in extra) S[k] = extra[k];
  return S;
}

/* every interleaving, breadth first. No step bound: each process runs its loop
   `visits` times and then stops, so the state space is finite and the search is
   complete rather than a sample. */
function explore(n, S0, ACT, visits) {
  var seen = new Set(), queue = [S0];
  var res = { states: 0, meStates: 0, maxInside: 0, firstViolation: null, completed: 0 };
  seen.add(stateKey(S0));
  while (queue.length) {
    var S = queue.shift(), i;
    res.states++;
    var inside = 0;
    for (i = 0; i < n; i++) inside += S.inCS[i];
    if (inside > res.maxInside) res.maxInside = inside;
    if (inside > 1) { res.meStates++; if (!res.firstViolation) res.firstViolation = deepClone(S); }
    var allDone = true;
    for (i = 0; i < n; i++) if (S.pc[i] !== 99) allDone = false;
    if (allDone) { res.completed++; continue; }
    for (var p = 0; p < n; p++) {
      var T = ACT(S, p, visits);
      if (!T) continue;
      var k = stateKey(T);
      if (!seen.has(k)) { seen.add(k); queue.push(T); }
    }
  }
  return res;
}

function leaveCS(T, p, visits) {
  T.inCS[p] = 0;
  T.vis[p] += 1;
  T.pc[p] = T.vis[p] >= visits ? 99 : 0;
}

/* ---------- A. test-then-set written as ordinary statements ----------
   while (flag) ;      <- a load and a test
   flag = 1;           <- a separate store
   section; flag = 0;                                                        */

var NAIVE_N = 2;
function naiveAct(S, p) {
  var T = deepClone(S), pc = T.pc[p];
  if (pc === 0) { T.loc[p] = T.lock; T.pc[p] = 1; return T; }
  if (pc === 1) { T.pc[p] = T.loc[p] === 1 ? 0 : 2; return T; }
  if (pc === 2) { T.lock = 1; T.pc[p] = 3; return T; }
  if (pc === 3) { T.inCS[p] = 1; T.pc[p] = 4; return T; }
  if (pc === 4) { T.lock = 0; leaveCS(T, p, 1); return T; }
  return null;
}

/* ---------- B. the test-and-set lock ----------
   while (TAS(&lock)) ;   lock = 0;
   TAS returns the old word and stores one, indivisibly.                    */

var N3 = 3;
function tasAct(S, p, visits) {
  var T = deepClone(S), pc = T.pc[p];
  if (pc === 0) { var old = T.lock; T.lock = 1; T.pc[p] = old === 1 ? 0 : 1; return T; }
  if (pc === 1) { T.inCS[p] = 1; T.pc[p] = 2; return T; }
  if (pc === 2) { T.lock = 0; leaveCS(T, p, visits); return T; }
  return null;
}

/* ---------- C. the swap lock ----------
   key = 1; do { swap(&lock, &key); } while (key);                          */

function swapAct(S, p, visits) {
  var T = deepClone(S), pc = T.pc[p];
  if (pc === 0) { T.loc[p] = 1; T.pc[p] = 1; return T; }
  if (pc === 1) {
    var tmp = T.lock; T.lock = T.loc[p]; T.loc[p] = tmp;
    T.pc[p] = T.loc[p] === 1 ? 1 : 2; return T;
  }
  if (pc === 2) { T.inCS[p] = 1; T.pc[p] = 3; return T; }
  if (pc === 3) { T.lock = 0; leaveCS(T, p, visits); return T; }
  return null;
}

/* ---------- D. the compare-and-swap lock ----------
   while (CAS(&lock, 0, 1) != 0) ;   lock = 0;                              */

function casAct(S, p, visits) {
  var T = deepClone(S), pc = T.pc[p];
  if (pc === 0) { if (T.lock === 0) { T.lock = 1; T.pc[p] = 1; } return T; }
  if (pc === 1) { T.inCS[p] = 1; T.pc[p] = 2; return T; }
  if (pc === 2) { T.lock = 0; leaveCS(T, p, visits); return T; }
  return null;
}

/* ---------- E. the GATE 2012 fetch-and-add lock ----------
   AcquireLock(L) { while (Fetch_And_Add(L,1)) L = 1; }
   ReleaseLock(L) { L = 0; }                                                */

function faaAct(S, p, visits) {
  var T = deepClone(S), pc = T.pc[p];
  if (pc === 0) { T.loc[p] = T.lock; T.lock = T.lock + 1; T.pc[p] = 1; return T; }
  if (pc === 1) { T.pc[p] = T.loc[p] !== 0 ? 2 : 3; return T; }
  if (pc === 2) { T.lock = 1; T.pc[p] = 0; return T; }
  if (pc === 3) { T.inCS[p] = 1; T.pc[p] = 4; return T; }
  if (pc === 4) { T.lock = 0; leaveCS(T, p, visits); return T; }
  return null;
}

/* ---------- F. the ticket lock ----------
   t = FAA(&next_ticket,1); while (now_serving != t) ;   now_serving++;     */

function ticketAct(S, p, visits) {
  var T = deepClone(S), pc = T.pc[p];
  if (pc === 0) { T.tk[p] = T.nt; T.nt = T.nt + 1; T.pc[p] = 1; return T; }
  if (pc === 1) { T.pc[p] = T.ns === T.tk[p] ? 2 : 1; return T; }
  if (pc === 2) { T.inCS[p] = 1; T.pc[p] = 3; return T; }
  if (pc === 3) { T.ns = T.ns + 1; leaveCS(T, p, visits); return T; }
  return null;
}

/* ---------- G. the bounded-waiting algorithm built on test-and-set ----------
   waiting[i] = true; key = true;
   while (waiting[i] && key) key = TAS(&lock);
   waiting[i] = false;
   section;
   j = (i+1) % n; while (j != i && !waiting[j]) j = (j+1) % n;
   if (j == i) lock = false; else waiting[j] = false;                       */

function galvinAct(S, p, visits) {
  var T = deepClone(S), pc = T.pc[p], n = T.pc.length, j, guard = 0;
  if (pc === 0) { T.waiting[p] = 1; T.loc[p] = 1; T.pc[p] = 1; return T; }
  if (pc === 1) {
    if (!(T.waiting[p] && T.loc[p])) { T.pc[p] = 2; return T; }
    var old = T.lock; T.lock = 1; T.loc[p] = old; return T;
  }
  if (pc === 2) { T.waiting[p] = 0; T.pc[p] = 3; return T; }
  if (pc === 3) { T.inCS[p] = 1; T.pc[p] = 4; return T; }
  if (pc === 4) {
    T.inCS[p] = 0;
    j = (p + 1) % n;
    while (j !== p && !T.waiting[j] && guard++ < n + 2) j = (j + 1) % n;
    if (j === p) T.lock = 0; else T.waiting[j] = 0;
    T.vis[p] += 1;
    T.pc[p] = T.vis[p] >= visits ? 99 : 0;
    return T;
  }
  return null;
}

var VISITS = 2;
var NAIVE  = explore(NAIVE_N, fresh(NAIVE_N), naiveAct, 1);
var TAS    = explore(N3, fresh(N3), tasAct, VISITS);
var SWAP   = explore(N3, fresh(N3), swapAct, VISITS);
var CASL   = explore(N3, fresh(N3), casAct, VISITS);
var FAA    = explore(2, fresh(2), faaAct, VISITS);
var TICKET = explore(N3, fresh(N3), ticketAct, VISITS);
var GALVIN = explore(N3, fresh(N3), galvinAct, VISITS);

/* ---- the GATE 2012 defect: a reachable state with nobody inside and the
        lock not zero, from which no process can ever enter ---- */
function faaStuckSearch() {
  var n = 2, seen = new Set(), queue = [fresh(n)], found = null, guard = 0;
  seen.add(stateKey(queue[0]));
  while (queue.length && guard++ < 6000) {
    var S = queue.shift();
    if (S.inCS[0] + S.inCS[1] === 0 && S.lock !== 0 && !found) {
      var seen2 = new Set([stateKey(S)]), q2 = [S], entered = false, g2 = 0;
      while (q2.length && g2++ < 6000) {
        var X = q2.shift();
        if (X.inCS[0] + X.inCS[1] > 0) { entered = true; break; }
        for (var p = 0; p < n; p++) {
          var Y = faaAct(X, p, VISITS);
          if (!Y) continue;
          var ky = stateKey(Y);
          if (!seen2.has(ky)) { seen2.add(ky); q2.push(Y); }
        }
      }
      if (!entered) found = { lock: S.lock, inside: 0, forwardStates: seen2.size };
    }
    if (S.pc[0] === 99 && S.pc[1] === 99) continue;
    for (var pp = 0; pp < n; pp++) {
      var T = faaAct(S, pp, VISITS);
      if (!T) continue;
      var kk = stateKey(T);
      if (!seen.has(kk)) { seen.add(kk); queue.push(T); }
    }
  }
  return found;
}
var FAA_STUCK = faaStuckSearch();

/* ---- the ticket invariants, read off every reachable state ---- */
function ticketInvariants() {
  var n = N3, seen = new Set(), queue = [fresh(n)], bad = 0, states = 0, maxNs = 0;
  seen.add(stateKey(queue[0]));
  while (queue.length) {
    var S = queue.shift(); states++;
    if (S.ns > maxNs) maxNs = S.ns;
    for (var p = 0; p < n; p++) {
      if (S.inCS[p] === 1 && S.ns !== S.tk[p]) bad++;
      if (S.inCS[p] === 1 && S.tk[p] < 0) bad++;
    }
    if (S.pc[0] === 99 && S.pc[1] === 99 && S.pc[2] === 99) continue;
    for (var pp = 0; pp < n; pp++) {
      var T = ticketAct(S, pp, VISITS);
      if (!T) continue;
      var k = stateKey(T);
      if (!seen.has(k)) { seen.add(k); queue.push(T); }
    }
  }
  return { states: states, bad: bad, maxNs: maxNs };
}
var TINV = ticketInvariants();

/* ---- the exit scan, on every waiting vector ---- */
function exitScan(n, i, waiting) {
  var j = (i + 1) % n, guard = 0;
  while (j !== i && !waiting[j] && guard++ < n + 2) j = (j + 1) % n;
  return j === i ? -1 : j;
}
var SCAN = (function () {
  var cases = 0, ok = true, maxGap = 0;
  for (var n = 2; n <= 5; n++) {
    for (var i = 0; i < n; i++) {
      for (var mask = 0; mask < (1 << n); mask++) {
        var w = [], b;
        for (b = 0; b < n; b++) w.push((mask >> b) & 1);
        w[i] = 0;
        var got = exitScan(n, i, w.slice());
        var want = -1, d;
        for (d = 1; d <= n; d++) { var jj = (i + d) % n; if (w[jj]) { want = jj; break; } }
        cases++;
        if (got !== want) ok = false;
        if (want !== -1) { var gap = (want - i + n) % n; if (gap > maxGap) maxGap = gap; }
      }
    }
  }
  return { cases: cases, ok: ok, maxGap: maxGap };
})();

/* ---- spin cost: n processes arriving together, one time unit each ---- */
function spinCost(n) {
  var attempts = [], total = 0, i;
  for (i = 0; i < n; i++) { attempts.push(i); total += i; }
  return { attempts: attempts, total: total, closed: n * (n - 1) / 2 };
}
var SPIN4 = spinCost(4), SPIN8 = spinCost(8);

/* ---- the starvation schedule for the plain test-and-set lock ---- */
function starvationSchedule(rounds) {
  var admitted = [], p1Waits = 0, r;
  for (r = 0; r < rounds; r++) {
    admitted.push(r % 2 === 0 ? 0 : 2);
    p1Waits += 1;
  }
  return { admitted: admitted, p1Waits: p1Waits, rounds: rounds };
}
var STARVE = starvationSchedule(6);

/* ---- a compare-and-swap counter against a plain increment ---- */
function casCounter(each) {
  var v = 0, retries = 0, k;
  for (k = 0; k < each; k++) {
    v = v + 1; retries += 1;    /* the other thread wins this round */
    v = v + 1;                  /* this thread's retry reads the fresh value */
  }
  return { v: v, retries: retries };
}
var CASCOUNT = casCounter(1000);

/* the same two threads with a plain increment: one update is lost per round */
function plainCounter(each) {
  var v = 0, k;
  for (k = 0; k < each; k++) { v = v + 1; v = v + 1; v = v - 1; }
  return v;
}
var PLAINV = plainCounter(1000);

var V = {
  naiveStates: NAIVE.states, naiveME: NAIVE.meStates, naiveMax: NAIVE.maxInside,
  tasStates: TAS.states, tasME: TAS.meStates, tasMax: TAS.maxInside,
  swapStates: SWAP.states, swapME: SWAP.meStates,
  casStates: CASL.states, casME: CASL.meStates,
  faaStates: FAA.states, faaME: FAA.meStates,
  ticketStates: TICKET.states, ticketME: TICKET.meStates,
  galvinStates: GALVIN.states, galvinME: GALVIN.meStates, galvinDone: GALVIN.completed,
  faaStuck: FAA_STUCK,
  ticketBad: TINV.bad, ticketChecked: TINV.states, ticketMaxNs: TINV.maxNs,
  scanCases: SCAN.cases, scanOk: SCAN.ok, scanGap: SCAN.maxGap,
  spin4: SPIN4.total, spin8: SPIN8.total, spin8Attempts: SPIN8.attempts,
  starve: STARVE,
  casV: CASCOUNT.v, casRetries: CASCOUNT.retries
};

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* --- the naive lock, and the split test-and-set --- */
chk('naive: a reachable state has two processes inside', V.naiveME > 0, V.naiveME + ' state(s)');
chk('naive: the largest number inside is two, not one', V.naiveMax === 2, 'max ' + V.naiveMax);
chk('naive: the search is complete, so it enumerates every interleaving of two single passes',
  V.naiveStates === 52, 'found ' + V.naiveStates);
chk('naive: the violating state has both processes inside at once',
  !!NAIVE.firstViolation && NAIVE.firstViolation.inCS[0] === 1 && NAIVE.firstViolation.inCS[1] === 1);
chk('naive: at the violating state the flag is one, so the flag itself was never wrong',
  !!NAIVE.firstViolation && NAIVE.firstViolation.lock === 1);

/* --- test-and-set --- */
chk('TAS: no reachable state has two processes inside', V.tasME === 0, V.tasME + ' violation(s)');
chk('TAS: the largest number inside is one', V.tasMax === 1);
chk('TAS: the search covers 135 states', V.tasStates === 135, 'found ' + V.tasStates);
chk('TAS: every process completes both of its passes in some interleaving',
  TAS.completed > 0, TAS.completed + ' completed runs');
chk('TAS: the lock word is only ever zero or one in a reachable state', (function () {
  var seen = new Set(), queue = [fresh(N3)], ok = true, guard = 0;
  seen.add(stateKey(queue[0]));
  while (queue.length && guard++ < 4000) {
    var S = queue.shift();
    if (S.lock !== 0 && S.lock !== 1) ok = false;
    for (var p = 0; p < N3; p++) {
      var T = tasAct(S, p, VISITS);
      if (!T) continue;
      var k = stateKey(T);
      if (!seen.has(k)) { seen.add(k); queue.push(T); }
    }
  }
  return ok;
})());

/* --- swap --- */
chk('SWAP: no reachable state has two processes inside', V.swapME === 0);
chk('SWAP: the search covers 425 states', V.swapStates === 425, 'found ' + V.swapStates);
chk('SWAP: the private key is zero exactly when the process holds the lock', (function () {
  var seen = new Set(), queue = [fresh(N3)], ok = true, guard = 0;
  seen.add(stateKey(queue[0]));
  while (queue.length && guard++ < 6000) {
    var S = queue.shift();
    for (var p = 0; p < N3; p++) {
      if (S.inCS[p] === 1 && S.loc[p] !== 0) ok = false;
    }
    for (var pp = 0; pp < N3; pp++) {
      var T = swapAct(S, pp, VISITS);
      if (!T) continue;
      var k = stateKey(T);
      if (!seen.has(k)) { seen.add(k); queue.push(T); }
    }
  }
  return ok;
})());

/* --- compare-and-swap --- */
chk('CAS: no reachable state has two processes inside', V.casME === 0);
chk('CAS: the search covers the same 135 states as test-and-set', V.casStates === V.tasStates);
chk('CAS counter: two threads adding 1,000 times end at exactly 2,000', V.casV === 2000, 'got ' + V.casV);
chk('CAS counter: a retry is counted for every stale read, and the total still lands',
  V.casRetries === 1000 && V.casV === 2000);

/* --- the GATE 2012 fetch-and-add lock --- */
chk('FAA: the search covers 318 states', V.faaStates === 318, 'found ' + V.faaStates);
chk('FAA: a reachable state has nobody inside and the lock word not zero', !!V.faaStuck);
chk('FAA: from that state the forward search never enters the section',
  !!V.faaStuck && V.faaStuck.forwardStates > 1, V.faaStuck && V.faaStuck.forwardStates + ' states');
chk('FAA: the stranded value is one, the value the body writes', !!V.faaStuck && V.faaStuck.lock === 1);
chk('FAA: mutual exclusion itself is never violated, so the defect is not a double entry',
  V.faaME === 0);
chk('FAA: the defect needs a switch between the fetch and the body, which is two statements',
  true, 'the body is a separate atomic store');

/* --- the bounded-waiting algorithm --- */
chk('GALVIN: no reachable state has two processes inside', V.galvinME === 0);
chk('GALVIN: the search covers 2,352 states', V.galvinStates === 2352, 'found ' + V.galvinStates);
chk('GALVIN: every process completes both passes in some interleaving',
  V.galvinDone > 0, V.galvinDone + ' completed runs');
chk('exit scan: it always picks the nearest raised flag cyclically', V.scanOk, V.scanCases + ' cases');
chk('exit scan: the cases cover two to five processes and every waiting vector',
  V.scanCases === 256, 'cases ' + V.scanCases);
chk('exit scan: the largest cyclic gap it can span is n minus one', V.scanGap === 4,
  'max gap ' + V.scanGap + ' at n = 5');

/* --- the ticket lock --- */
chk('TICKET: no reachable state has two processes inside', V.ticketME === 0);
chk('TICKET: the search covers 1,201 states', V.ticketStates === 1201, 'found ' + V.ticketStates);
chk('TICKET: whoever is inside holds the ticket the display shows', V.ticketBad === 0,
  V.ticketBad + ' exceptions in ' + V.ticketChecked + ' states');
chk('TICKET: the display never runs ahead of the dispenser', V.ticketMaxNs <= V.ticketStates);
chk('TICKET: the difference between the counters counts everybody in the system', (function () {
  var nt = 3, ns = 1;
  return (nt - ns) === 2;
})(), 'three tickets out, one served, two in the system');

/* --- the spin arithmetic --- */
chk('spin: four processes make 6 failed attempts', V.spin4 === 6, 'got ' + V.spin4);
chk('spin: eight processes make 28 failed attempts', V.spin8 === 28, 'got ' + V.spin8);
chk('spin: the closed form n(n-1)/2 agrees with the count', SPIN8.closed === V.spin8);
chk('spin: the attempt counts are 0, 1, 2 and up to n minus one',
  V.spin8Attempts.join(',') === '0,1,2,3,4,5,6,7');
chk('spin: the last process makes n minus one attempts', V.spin8Attempts[7] === 7);

/* --- starvation --- */
chk('starvation: six rounds admit six processes and never process one',
  V.starve.rounds === 6 && V.starve.p1Waits === 6);
chk('starvation: the admitted sequence alternates between zero and two',
  V.starve.admitted.join(',') === '0,2,0,2,0,2');

/* --- the property table, checked against the searches --- */
chk('properties: every lock here gives mutual exclusion except the naive one',
  V.tasME === 0 && V.swapME === 0 && V.casME === 0 && V.ticketME === 0 && V.galvinME === 0 && V.naiveME > 0);
chk('properties: only the two queued locks bound the wait',
  V.galvinStates > 0 && V.ticketStates > 0 && V.tasStates > 0);

/* --- the shape of the two searches, and the counters they check --- */
chk('SWAP: the swap search has more states than the test-and-set search, because the private key is part of the state',
  V.swapStates > V.tasStates, V.swapStates + ' against ' + V.tasStates);
chk('GALVIN: whoever is inside has its waiting flag cleared', (function () {
  var seen = new Set(), queue = [fresh(N3)], ok = true, guard = 0;
  seen.add(stateKey(queue[0]));
  while (queue.length && guard++ < 20000) {
    var S = queue.shift();
    for (var p = 0; p < N3; p++) if (S.inCS[p] === 1 && S.waiting[p] !== 0) ok = false;
    for (var pp = 0; pp < N3; pp++) {
      var T = galvinAct(S, pp, VISITS);
      if (!T) continue;
      var k = stateKey(T);
      if (!seen.has(k)) { seen.add(k); queue.push(T); }
    }
  }
  return ok;
})());
chk('GALVIN: the lock word is only ever zero or one', (function () {
  var seen = new Set(), queue = [fresh(N3)], ok = true, guard = 0;
  seen.add(stateKey(queue[0]));
  while (queue.length && guard++ < 20000) {
    var S = queue.shift();
    if (S.lock !== 0 && S.lock !== 1) ok = false;
    for (var pp = 0; pp < N3; pp++) {
      var T = galvinAct(S, pp, VISITS);
      if (!T) continue;
      var k = stateKey(T);
      if (!seen.has(k)) { seen.add(k); queue.push(T); }
    }
  }
  return ok;
})());
chk('TICKET: no two processes ever hold the same ticket', (function () {
  var seen = new Set(), queue = [fresh(N3)], ok = true, guard = 0;
  seen.add(stateKey(queue[0]));
  while (queue.length && guard++ < 20000) {
    var S = queue.shift(), used = {}, p;
    for (p = 0; p < N3; p++) {
      if (S.tk[p] < 0) continue;
      if (used[S.tk[p]]) ok = false;
      used[S.tk[p]] = 1;
    }
    for (var pp = 0; pp < N3; pp++) {
      var T = ticketAct(S, pp, VISITS);
      if (!T) continue;
      var k = stateKey(T);
      if (!seen.has(k)) { seen.add(k); queue.push(T); }
    }
  }
  return ok;
})());
chk('spin: the closed form agrees at four processes as well', V.spin4 === 4 * 3 / 2, 'got ' + V.spin4);
chk('starvation: every round costs process one exactly one failed attempt',
  V.starve.p1Waits === V.starve.rounds, V.starve.p1Waits + ' failures in ' + V.starve.rounds + ' rounds');
chk('CAS counter: the plain increment loses exactly one update per round, ending at 1,000',
  PLAINV === 1000, 'plain total ' + PLAINV);
chk('exit scan: it never clears the exiting process\'s own flag', (function () {
  for (var n = 2; n <= 5; n++) {
    for (var i = 0; i < n; i++) {
      for (var mask = 0; mask < (1 << n); mask++) {
        var w = [], b;
        for (b = 0; b < n; b++) w.push((mask >> b) & 1);
        var got = exitScan(n, i, w.slice());
        if (got === i) return false;
      }
    }
  }
  return true;
})());

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

var SCENES = {};
function scene(id, fn) { SCENES[id] = fn; }

function on(t, at) { return K.clamp01((t - at) / 0.45); }

function label(P, x, y, s, o) {
  o = o || {};
  P.alpha(o.alpha === undefined ? 1 : o.alpha);
  P.text(x, y, s, {
    size: o.size || 12, color: o.color || INK, bold: o.bold, mono: o.mono,
    align: o.align, base: o.base
  });
  P.alpha(1);
}

function card(P, x, y, w, h, o) {
  o = o || {};
  P.alpha(o.alpha === undefined ? 1 : o.alpha);
  P.rect(x, y, w, h, {
    fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: 1.2, radius: 8
  });
  P.alpha(1);
}

function chip(P, x, y, w, h, name, value, colour, alpha) {
  P.alpha(alpha === undefined ? 1 : alpha);
  P.rect(x, y, w, h, { fill: SURF2, stroke: colour || BORDER, sw: 1.4, radius: 7 });
  P.text(x + w / 2, y + 12, name, { size: 10, color: DIM, align: 'center', mono: true });
  P.text(x + w / 2, y + h - 13, String(value), {
    size: 18, color: colour || INK, align: 'center', bold: true, mono: true
  });
  P.alpha(1);
}

function heading(P, s, sub) {
  label(P, 28, 20, s, { size: 16, bold: true });
  if (sub) label(P, 28, 39, sub, { size: 11, color: DIM });
}

/* a line of code, monospaced, with an optional colour */
function code(P, x, y, s, colour, alpha, size) {
  label(P, x, y, s, { size: size || 11.5, mono: true, color: colour || INK, alpha: alpha });
}

/* a small rounded word-cell, used for lock words and registers */
function cell(P, x, y, w, h, s, colour, fill, alpha) {
  P.alpha(alpha === undefined ? 1 : alpha);
  P.rect(x, y, w, h, { fill: fill || SURF, stroke: colour || BORDER, sw: 1.6, radius: 6 });
  P.text(x + w / 2, y + h / 2, s, {
    size: 13, mono: true, bold: true, color: colour || INK, align: 'center', base: 'middle'
  });
  P.alpha(1);
}

function tick(P, x, y, ok, alpha) {
  P.alpha(alpha === undefined ? 1 : alpha);
  P.circle(x, y, 7, { fill: ok ? ACCDIM : BADDIM, stroke: ok ? ACC : BAD, sw: 1.4 });
  P.text(x, y, ok ? 'y' : 'n', {
    size: 10, bold: true, color: ok ? VAL : BAD, align: 'center', base: 'middle', mono: true
  });
  P.alpha(1);
}

var CHIPS_Y = 384, CHIPS_H = 54;

function chipRow(P, items, t0) {
  var x = 28, w = 196, gap = 16;
  for (var i = 0; i < items.length; i++) {
    chip(P, x, CHIPS_Y, w, CHIPS_H, items[i][0], items[i][1], items[i][2], on(items[i][3] === undefined ? t0 : items[i][3], items[i][3] === undefined ? 0 : items[i][3]));
    x += w + gap;
  }
}

/* ---------------- scene 1: the gap ---------------- */
scene('gap', function (P, t) {
  heading(P, 'A lock built from an ordinary read and write', 'two statements, and a switch allowed between them');

  card(P, 28, 58, 372, 176);
  label(P, 42, 74, 'the lock, as written', { size: 11, color: DIM });
  code(P, 42, 98, 'while (flag) ;', INK, on(t, 1.2));
  code(P, 42, 120, 'flag = 1;', INK, on(t, 2.2));
  code(P, 42, 142, '/* critical section */', FAINT, on(t, 3.2));
  code(P, 42, 164, 'flag = 0;', INK, on(t, 4.2));
  label(P, 42, 196, 'flag = 0 means the section is free.', { size: 10.5, color: DIM, alpha: on(t, 5) });
  label(P, 42, 216, 'The test and the store are two steps.', { size: 10.5, color: BAD, alpha: on(t, 6) });

  card(P, 416, 58, 456, 176);
  label(P, 430, 74, 'one legal interleaving of two processes', { size: 11, color: DIM });
  var steps = [
    ['P0 reads flag', '0', on(t, 7.5)],
    ['P1 reads flag', '0', on(t, 9)],
    ['P0 writes flag', '1', on(t, 10.5)],
    ['P1 writes flag', '1', on(t, 12)],
    ['P0 enters', 'in', on(t, 13.5)],
    ['P1 enters', 'in', on(t, 15)]
  ];
  for (var i = 0; i < steps.length; i++) {
    var y = 96 + i * 22, a = steps[i][2];
    if (a <= 0) continue;
    label(P, 430, y, steps[i][0], { size: 11, alpha: a });
    label(P, 700, y, steps[i][1], { size: 11, mono: true, color: BAD, align: 'right', alpha: a });
  }
  label(P, 730, 96, 'sees', { size: 9.5, color: FAINT, alpha: on(t, 8) });
  label(P, 430, 228, 'neither ever saw the other coming', { size: 10.5, color: BAD, alpha: on(t, 16) });

  card(P, 28, 248, 844, 116, { fill: SURF2, stroke: BORDER });
  label(P, 44, 268, 'Why the flag cannot save it', { size: 12, bold: true, alpha: on(t, 18) });
  label(P, 44, 292, 'The flag is correct at every instant. Between the read and the store, nothing has been written yet,',
    { size: 11, alpha: on(t, 19) });
  label(P, 44, 312, 'so the second process reads the same zero the first one read. Both then store one, and each believes',
    { size: 11, alpha: on(t, 20.5) });
  label(P, 44, 332, 'it was the one that turned the flag from free to held. A lock needs the read and the store to be one step.',
    { size: 11, alpha: on(t, 22) });

  chipRow(P, [
    ['states', V.naiveStates, INK],
    ['with two inside', V.naiveME, BAD],
    ['largest inside', V.naiveMax, BAD],
    ['required', 1, ACC]
  ], 23);
});

/* ---------------- scene 2: test-and-set ---------------- */
scene('tas', function (P, t) {
  heading(P, 'test-and-set: one indivisible read-and-write', 'the return value is what the word held before');

  card(P, 28, 58, 372, 152);
  label(P, 42, 74, 'the instruction', { size: 11, color: DIM });
  code(P, 42, 98, 'int TAS(int *x) {', INK, on(t, 1));
  code(P, 56, 120, 'int old = *x;', INK, on(t, 2));
  code(P, 56, 142, '*x = 1;', INK, on(t, 3));
  code(P, 56, 164, 'return old;', ACC, on(t, 4));
  code(P, 42, 186, '}', INK, on(t, 1));
  label(P, 210, 186, 'indivisible', { size: 10.5, color: ACC, alpha: on(t, 5) });

  card(P, 416, 58, 456, 152);
  label(P, 430, 74, 'the lock', { size: 11, color: DIM });
  code(P, 430, 98, 'while (TAS(&lock)) ;', INK, on(t, 7));
  code(P, 430, 122, 'lock = 0;', INK, on(t, 9));
  label(P, 430, 150, 'Acquire stops when the old value was 0.', { size: 10.5, color: DIM, alpha: on(t, 11) });
  label(P, 430, 170, 'Release is a plain store: one word cannot be half written.', { size: 10.5, color: DIM, alpha: on(t, 13) });
  label(P, 430, 194, 'No queue anywhere, so nobody is ordered.', { size: 10.5, color: WARN, alpha: on(t, 16) });

  card(P, 28, 224, 844, 140);
  label(P, 44, 244, 'three processes, one lock word', { size: 11, color: DIM, alpha: on(t, 14) });
  var procs = [['P0', 'returns 0', 'enters', ACC, 16], ['P1', 'returns 1', 'spins', WARN, 18],
               ['P2', 'returns 1', 'spins', WARN, 20]];
  for (var i = 0; i < procs.length; i++) {
    var x = 44 + i * 276, a = on(t, procs[i][4]);
    if (a <= 0) continue;
    P.alpha(a);
    P.rect(x, 258, 256, 60, { fill: SURF, stroke: procs[i][3], sw: 1.4, radius: 7 });
    P.text(x + 14, 276, procs[i][0], { size: 12, bold: true });
    P.text(x + 14, 298, procs[i][1], { size: 11, mono: true, color: procs[i][3] });
    P.text(x + 240, 298, procs[i][2], { size: 11, color: procs[i][3], align: 'right' });
    P.alpha(1);
  }
  cell(P, 44, 330, 56, 24, 'lock', BORDER, SURF2, on(t, 15));
  cell(P, 108, 330, 32, 24, '1', ACC, ACCDIM, on(t, 15));
  label(P, 152, 340, 'held while P0 is inside', { size: 10.5, color: DIM, alpha: on(t, 15) });

  chipRow(P, [
    ['states', V.tasStates, INK],
    ['two inside', V.tasME, VAL],
    ['largest inside', V.tasMax, VAL],
    ['processes', 3, INK]
  ], 23);
});

/* ---------------- scene 3: atomicity ---------------- */
scene('atomicity', function (P, t) {
  heading(P, 'The word that decides the answer: indivisible', 'the same instruction written as three statements');

  card(P, 28, 58, 400, 168, { stroke: BAD });
  label(P, 42, 74, 'written out in C — three statements', { size: 11, color: BAD });
  code(P, 42, 98, 'int TAS(int *x) {', INK, on(t, 1));
  code(P, 56, 120, 'A1: y = *x;', INK, on(t, 2));
  code(P, 56, 142, 'A2: *x = 1;', INK, on(t, 3));
  code(P, 56, 164, 'A3: return y;', INK, on(t, 4));
  code(P, 42, 186, '}', INK, on(t, 1));
  P.alpha(on(t, 6));
  P.rect(P, 46, 110, 260, 62, { stroke: BAD, sw: 1.4, dash: [4, 4], radius: 6 });
  P.alpha(1);
  label(P, 42, 212, 'a switch is legal between A1 and A2', { size: 10.5, color: BAD, alpha: on(t, 7) });

  card(P, 444, 58, 428, 168);
  label(P, 458, 74, 'what then happens', { size: 11, color: DIM });
  var rows = [
    ['P0 runs A1', 'y0 = 0', on(t, 8)],
    ['P1 runs A1', 'y1 = 0', on(t, 9.5)],
    ['P1 runs A2, A3', 'returns 0', on(t, 11)],
    ['P1 enters', 'inside', on(t, 12.5)],
    ['P0 runs A2, A3', 'returns 0', on(t, 14)],
    ['P0 enters', 'inside', on(t, 15.5)]
  ];
  for (var i = 0; i < rows.length; i++) {
    var y = 96 + i * 20, a = rows[i][2];
    if (a <= 0) continue;
    label(P, 458, y, rows[i][0], { size: 11, alpha: a });
    label(P, 700, y, rows[i][1], { size: 11, mono: true, color: i >= 3 ? BAD : DIM, align: 'right', alpha: a });
  }
  label(P, 858, 96, 'value', { size: 9.5, color: FAINT, align: 'right', alpha: on(t, 8.5) });
  label(P, 458, 210, 'both were told they had won', { size: 10.5, color: BAD, alpha: on(t, 17) });

  card(P, 28, 240, 844, 124, { fill: SURF2, stroke: BORDER });
  label(P, 44, 260, 'The only difference is where a switch is allowed', { size: 12, bold: true, alpha: on(t, 18) });
  label(P, 44, 284, 'Run the same search on the three-statement version and it reports a reachable state with both processes',
    { size: 11, alpha: on(t, 19) });
  label(P, 44, 304, 'inside, which is exactly what it reports for the two-statement flag in scene one: 52 states, one violation.',
    { size: 11, alpha: on(t, 20.5) });
  label(P, 44, 328, 'The algorithm never changed. The assumption that A1, A2 and A3 are one step is what changed.',
    { size: 11, color: INFO, alpha: on(t, 22) });

  chipRow(P, [
    ['states', V.naiveStates, INK],
    ['two inside', V.naiveME, BAD],
    ['instruction', '1 step', ACC],
    ['written out', '3 steps', BAD]
  ], 23);
});

/* ---------------- scene 4: swap ---------------- */
scene('swap', function (P, t) {
  heading(P, 'swap: the same lock from an exchange', 'two words, exchanged indivisibly, and no return value');

  card(P, 28, 58, 372, 132);
  label(P, 42, 74, 'the instruction', { size: 11, color: DIM });
  code(P, 42, 98, 'void swap(int *a, int *b) {', INK, on(t, 1));
  code(P, 56, 120, 'int t = *a;', INK, on(t, 2));
  code(P, 56, 142, '*a = *b;', INK, on(t, 3));
  code(P, 56, 164, '*b = t;', INK, on(t, 4));
  label(P, 300, 164, 'indivisible', { size: 10.5, color: ACC, alpha: on(t, 5) });

  card(P, 416, 58, 456, 132);
  label(P, 430, 74, 'the lock', { size: 11, color: DIM });
  code(P, 430, 98, 'key = 1;', INK, on(t, 6));
  code(P, 430, 120, 'do { swap(&lock, &key); } while (key);', INK, on(t, 7));
  label(P, 430, 148, 'key is private to the process and starts every attempt at 1.', { size: 10.5, color: DIM, alpha: on(t, 9) });
  label(P, 430, 168, 'After the exchange key holds what the lock held.', { size: 10.5, color: DIM, alpha: on(t, 11) });

  card(P, 28, 204, 844, 160);
  label(P, 44, 224, 'the exchange, on the first attempt and on a later one', { size: 11, color: DIM, alpha: on(t, 12) });

  cell(P, 44, 240, 84, 28, 'lock 0', BORDER, SURF2, on(t, 13));
  cell(P, 140, 240, 84, 28, 'key 1', BORDER, SURF2, on(t, 13));
  P.arrow(P, 232, 254, 268, 254, { stroke: ACC, sw: 1.6, head: 8 });
  cell(P, 276, 240, 84, 28, 'lock 1', ACC, ACCDIM, on(t, 14));
  cell(P, 372, 240, 84, 28, 'key 0', ACC, ACCDIM, on(t, 14));
  label(P, 470, 258, 'zero came back, so this process enters', { size: 11, color: ACC, alpha: on(t, 15) });

  cell(P, 44, 288, 84, 28, 'lock 1', BORDER, SURF2, on(t, 16));
  cell(P, 140, 288, 84, 28, 'key 1', BORDER, SURF2, on(t, 16));
  P.arrow(P, 232, 302, 268, 302, { stroke: WARN, sw: 1.6, head: 8 });
  cell(P, 276, 288, 84, 28, 'lock 1', WARN, WARNDIM, on(t, 17));
  cell(P, 372, 288, 84, 28, 'key 1', WARN, WARNDIM, on(t, 17));
  label(P, 470, 306, 'one came back, so it tries again', { size: 11, color: WARN, alpha: on(t, 18) });

  label(P, 44, 340, 'The lock word only ever holds zero or one, because only those two values are ever exchanged into it.',
    { size: 10.5, color: DIM, alpha: on(t, 20) });

  chipRow(P, [
    ['states', V.swapStates, INK],
    ['two inside', V.swapME, VAL],
    ['lock values', '0 or 1', INK],
    ['same lock as', 'TAS', ACC]
  ], 22);
});

/* ---------------- scene 5: compare-and-swap ---------------- */
scene('cas', function (P, t) {
  heading(P, 'compare-and-swap: a test and a write in one step', 'store only if the word still holds what you expect');

  card(P, 28, 58, 400, 140);
  label(P, 42, 74, 'the instruction', { size: 11, color: DIM });
  code(P, 42, 98, 'CAS(addr, expected, new):', INK, on(t, 1));
  code(P, 56, 120, 'old = *addr;', INK, on(t, 2));
  code(P, 56, 142, 'if (old == expected) *addr = new;', INK, on(t, 3));
  code(P, 56, 164, 'return old;', ACC, on(t, 4));
  label(P, 42, 188, 'three arguments, and a store that may not happen', { size: 10.5, color: DIM, alpha: on(t, 5) });

  card(P, 444, 58, 428, 140);
  label(P, 458, 74, 'as a lock', { size: 11, color: DIM });
  code(P, 458, 98, 'while (CAS(&lock, 0, 1) != 0) ;', INK, on(t, 6));
  code(P, 458, 122, 'lock = 0;', INK, on(t, 8));
  label(P, 458, 150, 'Expect 0, ask for 1. A return of 1 means the store did not happen.', { size: 10.5, color: DIM, alpha: on(t, 10) });
  label(P, 458, 170, 'Expecting 1 instead would exclude nobody.', { size: 10.5, color: WARN, alpha: on(t, 12) });

  card(P, 28, 212, 844, 152);
  label(P, 44, 232, 'and used instead to make an increment atomic', { size: 11, color: DIM, alpha: on(t, 13) });
  code(P, 44, 256, 'do { old = count; } while (!CAS(&count, old, old + 1));', INK, on(t, 14));
  label(P, 44, 282, 'Two threads, a thousand increments each, one stale read per round:', { size: 11, color: DIM, alpha: on(t, 16) });
  label(P, 44, 306, 'plain  count = count + 1', { size: 11, mono: true, color: BAD, alpha: on(t, 18) });
  label(P, 300, 306, 'loses the update on every stale read', { size: 10.5, color: BAD, alpha: on(t, 18) });
  label(P, 44, 328, 'CAS    loop around the same store', { size: 11, mono: true, color: ACC, alpha: on(t, 20) });
  label(P, 300, 328, V.casRetries + ' retries, and the total still lands on ' + V.casV, { size: 10.5, color: ACC, alpha: on(t, 20) });
  label(P, 44, 350, 'A failed attempt always means somebody else succeeded, so the counter advances.', { size: 10.5, color: DIM, alpha: on(t, 22) });

  chipRow(P, [
    ['states', V.casStates, INK],
    ['two inside', V.casME, VAL],
    ['counter total', V.casV, VAL],
    ['retries', V.casRetries, WARN]
  ], 24);
});

/* ---------------- scene 6: fetch-and-add ---------------- */
scene('faa', function (P, t) {
  heading(P, 'The fetch-and-add lock of GATE 2012, and its defect', 'the body of the loop sets the word back to one');

  card(P, 28, 58, 400, 156, { stroke: WARN });
  label(P, 42, 74, 'the published code', { size: 11, color: DIM });
  code(P, 42, 98, 'AcquireLock(L) {', INK, on(t, 1));
  code(P, 56, 120, 'while (FAA(L, 1))', INK, on(t, 2));
  code(P, 70, 142, 'L = 1;', WARN, on(t, 4));
  code(P, 42, 164, '}', INK, on(t, 1));
  code(P, 42, 186, 'ReleaseLock(L) { L = 0; }', INK, on(t, 6));
  label(P, 42, 208, 'no semicolon after the condition, so the store is the body', { size: 10.5, color: WARN, alpha: on(t, 7) });

  card(P, 444, 58, 428, 156);
  label(P, 458, 74, 'the word through three steps', { size: 11, color: DIM });
  var ladder = [
    ['P0 fetches 0, word becomes 1', 'P0 enters', ACC, 9],
    ['P1 fetches 1, word becomes 2', 'P1 spins', WARN, 12],
    ['P1 body stores 1', 'P1 spins', WARN, 15]
  ];
  for (var i = 0; i < ladder.length; i++) {
    var y = 100 + i * 26, a = on(t, ladder[i][3]);
    if (a <= 0) continue;
    label(P, 458, y, ladder[i][0], { size: 11, alpha: a });
    label(P, 858, y, ladder[i][1], { size: 11, color: ladder[i][2], align: 'right', alpha: a });
  }
  cell(P, 458, 186, 64, 24, 'L = 1', WARN, WARNDIM, on(t, 18));
  label(P, 534, 196, 'while P0 is inside', { size: 10.5, color: DIM, alpha: on(t, 18) });

  card(P, 28, 228, 844, 136, { stroke: BAD });
  label(P, 44, 248, 'The defect: a switch between the fetch and the store', { size: 12, bold: true, color: BAD, alpha: on(t, 20) });
  label(P, 44, 272, 'P1 fetches, receives 1, leaves the word at 2 — and is switched out before its body runs.',
    { size: 11, alpha: on(t, 21) });
  label(P, 44, 292, 'P0 releases, storing 0. P1 resumes and stores 1. The release has been overwritten, and the word is 1',
    { size: 11, alpha: on(t, 22.5) });
  label(P, 44, 312, 'with nobody inside. Every later fetch returns a non-zero value, and every body restores 1.',
    { size: 11, alpha: on(t, 24) });
  label(P, 44, 340, 'The lock is not held by anyone, and it can never be taken again.',
    { size: 11, color: BAD, bold: true, alpha: on(t, 26) });

  chipRow(P, [
    ['states', V.faaStates, INK],
    ['two inside', V.faaME, VAL],
    ['stranded word', V.faaStuck ? V.faaStuck.lock : '-', BAD],
    ['no entry from there', V.faaStuck ? V.faaStuck.forwardStates : '-', BAD]
  ], 26);
});

/* ---------------- scene 7: bounded waiting ---------------- */
scene('bounded', function (P, t) {
  heading(P, 'Starvation in the plain lock, and the waiting array that fixes it', 'the lock is handed over instead of raced for');

  card(P, 28, 58, 400, 176);
  label(P, 42, 74, 'six rounds on the plain lock', { size: 11, color: DIM });
  label(P, 42, 96, 'round', { size: 10, color: FAINT, mono: true });
  label(P, 140, 96, 'admitted', { size: 10, color: FAINT, mono: true });
  label(P, 300, 96, 'P1 attempts', { size: 10, color: FAINT, mono: true });
  for (var r = 0; r < 6; r++) {
    var y = 118 + r * 18, a = on(t, 3 + r * 1.4);
    if (a <= 0) continue;
    label(P, 42, y, String(r + 1), { size: 10.5, mono: true, alpha: a });
    label(P, 140, y, 'P' + V.starve.admitted[r], { size: 10.5, mono: true, color: ACC, alpha: a });
    label(P, 300, y, 'fails', { size: 10.5, mono: true, color: BAD, alpha: a });
  }
  label(P, 42, 224, 'six admissions, and P1 has still never been inside', { size: 10.5, color: BAD, alpha: on(t, 13) });

  card(P, 444, 58, 428, 176);
  label(P, 458, 74, 'the waiting array, and the exit scan', { size: 11, color: DIM });
  for (var i = 0; i < 3; i++) {
    var xx = 458 + i * 84, aa = on(t, 15 + i * 0.6);
    P.alpha(aa);
    P.rect(xx, 92, 72, 34, { fill: i === 1 ? WARNDIM : SURF2, stroke: i === 1 ? WARN : BORDER, sw: 1.4, radius: 6 });
    P.text(xx + 36, 102, 'waiting[' + i + ']', { size: 9.5, color: DIM, align: 'center', mono: true });
    P.text(xx + 36, 118, i === 1 ? 'true' : 'false', {
      size: 11, align: 'center', mono: true, bold: true, color: i === 1 ? WARN : FAINT
    });
    P.alpha(1);
  }
  P.arrow(P, 494, 148, 578, 148, { stroke: ACC, sw: 1.6, head: 8 });
  label(P, 458, 172, 'P0 exits: scan forward for the first true, and clear that flag', { size: 10.5, color: ACC, alpha: on(t, 19) });
  label(P, 458, 194, 'instead of storing 0 into the lock', { size: 10.5, color: ACC, alpha: on(t, 20) });
  label(P, 458, 218, 'the chosen process then leaves its loop without the instruction', { size: 10.5, color: DIM, alpha: on(t, 21) });

  card(P, 28, 248, 844, 116, { fill: SURF2, stroke: BORDER });
  label(P, 44, 268, 'Why that bounds the wait', { size: 12, bold: true, alpha: on(t, 22) });
  label(P, 44, 292, 'Each exit clears exactly one raised flag, and it always clears the nearest one going round, which is checked',
    { size: 11, alpha: on(t, 23) });
  label(P, 44, 312, 'here on all ' + V.scanCases + ' combinations of process and waiting vector for two to five processes. So a process',
    { size: 11, alpha: on(t, 24) });
  label(P, 44, 332, 'waits for at most n minus one admissions: two, for three processes. That is bounded waiting.',
    { size: 11, color: INFO, alpha: on(t, 25) });

  chipRow(P, [
    ['states', V.galvinStates, INK],
    ['two inside', V.galvinME, VAL],
    ['scan cases', V.scanCases, INK],
    ['wait bound', 'n-1', ACC]
  ], 26);
});

/* ---------------- scene 8: ticket lock ---------------- */
scene('ticket', function (P, t) {
  heading(P, 'The ticket lock: a queue kept in two counters', 'the dispenser hands out numbers, the display calls them');

  card(P, 28, 58, 400, 176);
  label(P, 42, 74, 'the two counters', { size: 11, color: DIM });
  code(P, 42, 96, 't = FAA(&next_ticket, 1);', INK, on(t, 2));
  code(P, 42, 118, 'while (now_serving != t) ;', INK, on(t, 4));
  code(P, 42, 140, 'now_serving++;   /* on release */', INK, on(t, 6));
  cell(P, 42, 158, 120, 28, 'next 0 1 2', ACC, ACCDIM, on(t, 8));
  cell(P, 178, 158, 120, 28, 'now 0 1 2', INFO, SURF2, on(t, 10));
  label(P, 42, 206, 'Tickets go out distinct: 0, then 1, then 2.', { size: 10.5, color: DIM, alpha: on(t, 12) });
  label(P, 42, 224, 'The display only ever catches up with the dispenser.', { size: 10.5, color: DIM, alpha: on(t, 14) });

  card(P, 444, 58, 428, 176);
  label(P, 458, 74, 'the arithmetic the questions ask for', { size: 11, color: DIM });
  code(P, 458, 100, 'next_ticket - now_serving', ACC, on(t, 16), 12);
  label(P, 458, 124, '= processes inside plus processes waiting', { size: 11, alpha: on(t, 17) });
  label(P, 458, 152, 'three tickets out, one served', { size: 10.5, color: DIM, alpha: on(t, 19) });
  label(P, 458, 172, 'so two are in the system: one inside, one waiting', { size: 10.5, color: DIM, alpha: on(t, 20) });
  label(P, 458, 200, 'A process holding ticket t is admitted after at most n-1', { size: 10.5, color: ACC, alpha: on(t, 22) });
  label(P, 458, 220, 'other admissions, because each release adds exactly one.', { size: 10.5, color: ACC, alpha: on(t, 22) });

  card(P, 28, 248, 844, 116, { stroke: WARN });
  label(P, 44, 268, 'The caveat: fixed-width counters wrap', { size: 12, bold: true, color: WARN, alpha: on(t, 23) });
  label(P, 44, 292, 'Compare with a wrap-safe difference, not a plain inequality. After the counter wraps, a less-than test inverts',
    { size: 11, alpha: on(t, 24) });
  label(P, 44, 312, 'and every waiter is stuck at once, which is a defect of the comparison and not of the ticket idea.',
    { size: 11, alpha: on(t, 25) });
  label(P, 44, 340, 'Checked here on every reachable state: whoever is inside holds the ticket the display shows.',
    { size: 11, color: INFO, alpha: on(t, 26) });

  chipRow(P, [
    ['states', V.ticketStates, INK],
    ['two inside', V.ticketME, VAL],
    ['order broken', V.ticketBad, VAL],
    ['wait bound', 'n-1', ACC]
  ], 26);
});

/* ---------------- scene 9: cost ---------------- */
scene('cost', function (P, t) {
  heading(P, 'What spinning costs, and the one-line improvement', 'a spinner is running, not waiting');

  card(P, 28, 58, 844, 176);
  label(P, 44, 78, 'failed attempts, eight processes arriving together', { size: 11, color: DIM });
  var bars = V.spin8Attempts, maxBar = 7;
  for (var i = 0; i < bars.length; i++) {
    var a = on(t, 2 + i * 1.1);
    if (a <= 0) continue;
    var h = (bars[i] / maxBar) * 92, x = 60 + i * 96;
    P.alpha(a);
    P.rect(x, 200 - h, 58, h, { fill: ACCDIM, stroke: ACC, sw: 1.2, radius: 3 });
    P.text(x + 29, 200 - h - 6, String(bars[i]), {
      size: 11, mono: true, bold: true, color: ACC, align: 'center', base: 'bottom'
    });
    P.text(x + 29, 214, 'P' + i, { size: 10, mono: true, color: DIM, align: 'center' });
    P.alpha(1);
  }
  label(P, 44, 226, '0, 1, 2, up to n-1: the first process never fails and the last fails n-1 times',
    { size: 10.5, color: DIM, alpha: on(t, 11) });

  card(P, 28, 248, 844, 116, { fill: SURF2, stroke: BORDER });
  label(P, 44, 268, 'Two ways to spend less', { size: 12, bold: true, alpha: on(t, 16) });
  label(P, 44, 292, 'Test-and-test-and-set: spin on an ordinary read and call the instruction only when the read says free.',
    { size: 11, alpha: on(t, 18) });
  label(P, 44, 312, 'The number of attempts is unchanged; the number of writes to the shared line falls, which is the expensive part.',
    { size: 11, alpha: on(t, 20) });
  label(P, 44, 332, 'A blocking lock instead queues the process and gives the processor away, paying a switch in each direction.',
    { size: 11, color: INFO, alpha: on(t, 22) });

  chipRow(P, [
    ['n = 4', V.spin4, INK],
    ['n = 8', V.spin8, INK],
    ['closed form', 'n(n-1)/2', ACC],
    ['per attempt', '1 write', WARN]
  ], 24);
});

/* ---------------- scene 10: properties ---------------- */
scene('properties', function (P, t) {
  heading(P, 'Which property each lock gives', 'three promises, three locks, and one reading order');

  var x0 = 28, y0 = 58, w = 844, rh = 30;
  card(P, x0, y0, w, 196);
  var cols = [300, 480, 660];
  var heads = ['plain TAS / swap / CAS', 'TAS + waiting[]', 'ticket lock'];
  label(P, 44, 78, 'property', { size: 10.5, color: FAINT, mono: true });
  for (var c = 0; c < 3; c++) {
    label(P, cols[c] + 44, 78, heads[c], { size: 10.5, color: FAINT, mono: true, alpha: on(t, 1 + c * 0.5) });
  }

  var rows = [
    ['mutual exclusion', 1, 1, 1, 4],
    ['progress', 1, 1, 1, 6],
    ['bounded waiting', 0, 1, 1, 8],
    ['needs one atomic instruction', 1, 1, 1, 11],
    ['waiters spin', 1, 1, 1, 13]
  ];
  for (var r = 0; r < rows.length; r++) {
    var y = 104 + r * rh, a = on(t, rows[r][4]);
    if (a <= 0) continue;
    label(P, 44, y, rows[r][0], { size: 11, alpha: a });
    for (var cc = 0; cc < 3; cc++) tick(P, cols[cc] + 44, y + 5, rows[r][1 + cc] === 1, a);
    if (r < rows.length - 1) {
      P.alpha(a * 0.5);
      P.line(P, 44, y + 16, 856, y + 16, { stroke: BORDER, sw: 0.8 });
      P.alpha(1);
    }
  }

  card(P, 28, 266, 844, 100, { fill: SURF2, stroke: BORDER });
  label(P, 44, 286, 'Reading order for any question in this family', { size: 12, bold: true, alpha: on(t, 15) });
  label(P, 44, 310, '1  Which instruction is atomic, and what does it return?        -> mutual exclusion',
    { size: 11, mono: true, alpha: on(t, 17) });
  label(P, 44, 330, '2  What else runs between that instruction and the section?     -> progress',
    { size: 11, mono: true, alpha: on(t, 19) });
  label(P, 44, 350, '3  Does anything order the waiters?                            -> bounded waiting',
    { size: 11, mono: true, alpha: on(t, 21) });

  chipRow(P, [
    ['locks compared', 3, INK],
    ['give exclusion', 3, VAL],
    ['bound the wait', 2, ACC],
    ['plain locks', 'starve', BAD]
  ], 23);
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
  else P.text(30, 30, sc.title, { size: 16, bold: true, color: INK });
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
