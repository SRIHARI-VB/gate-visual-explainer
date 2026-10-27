(function () {
  'use strict';

  var W = 900, H = 470;
  var K = window.LessonKit;
  var PR = window.Painters;
  var PAL = PR.PAL;
  var P = null;

/* ======================================================================
   LAYER 1 - THE MODEL (regular-expressions-and-finite-automata)
   Pure data and pure functions. No drawing here. Nothing in this section
   knows what a canvas is. Every number the lesson quotes is computed here
   and checked here against the machine's own defining properties.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) }); }
function near(a, b, eps) { eps = eps === undefined ? 1e-9 : eps; return Math.abs(a - b) <= eps; }
function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }

/* ------------------------------------------------------------------ DFA */
function mkDFA(n, alphabet, trans, start, accept) {
  var delta = {}, states = [], i, j;
  for (i = 0; i < n; i++) {
    states.push('q' + i);
    delta['q' + i] = {};
    for (j = 0; j < alphabet.length; j++) delta['q' + i][alphabet[j]] = 'q' + trans[i][j];
  }
  return { states: states, alphabet: alphabet.slice(), delta: delta, start: 'q' + start,
           accept: accept.map(function (a) { return 'q' + a; }) };
}

function dfaProblems(d) {
  var p = [], i, j, s, sym, set = {};
  for (i = 0; i < d.states.length; i++) set[d.states[i]] = true;
  if (!set[d.start]) p.push('start state not in the state set');
  for (i = 0; i < d.accept.length; i++) if (!set[d.accept[i]]) p.push('accept state missing');
  for (i = 0; i < d.states.length; i++) {
    s = d.states[i];
    if (!d.delta[s]) { p.push('no row for ' + s); continue; }
    for (j = 0; j < d.alphabet.length; j++) {
      sym = d.alphabet[j];
      if (!(sym in d.delta[s])) p.push('missing transition ' + s + ' on ' + sym);
      else if (!set[d.delta[s][sym]]) p.push('transition to a non-state from ' + s);
    }
  }
  return p;
}

function run(d, w) {
  var s = d.start, i;
  for (i = 0; i < w.length; i++) {
    var sym = w.charAt(i);
    if (!d.delta[s] || !(sym in d.delta[s])) return null;
    s = d.delta[s][sym];
  }
  return s;
}
function accepts(d, w) { var s = run(d, w); return s !== null && d.accept.indexOf(s) >= 0; }

function reachableSet(d) {
  var seen = {}, stack = [d.start], out = [], i;
  seen[d.start] = true;
  while (stack.length) {
    var s = stack.pop(); out.push(s);
    for (i = 0; i < d.alphabet.length; i++) {
      var t = d.delta[s][d.alphabet[i]];
      if (!seen[t]) { seen[t] = true; stack.push(t); }
    }
  }
  return d.states.filter(function (x) { return seen[x]; });
}

function allStrings(alphabet, maxLen) {
  var out = [''], frontier = [''], i, j, k;
  for (i = 1; i <= maxLen; i++) {
    var next = [];
    for (j = 0; j < frontier.length; j++) {
      for (k = 0; k < alphabet.length; k++) next.push(frontier[j] + alphabet[k]);
    }
    out = out.concat(next); frontier = next;
  }
  return out;
}

/* ---- table filling (Moore) minimization ---- */
function minimise(d) {
  var r = reachableSet(d), idx = {}, i, j, a;
  for (i = 0; i < r.length; i++) idx[r[i]] = i;
  var n = r.length;
  var acc = r.map(function (s) { return d.accept.indexOf(s) >= 0; });

  var dist = [];
  for (i = 0; i < n; i++) { dist.push([]); for (j = 0; j < n; j++) dist[i][j] = false; }
  for (i = 0; i < n; i++) for (j = 0; j < n; j++) if (acc[i] !== acc[j]) dist[i][j] = true;

  var changed = true, rounds = 0;
  while (changed && rounds < 64) {
    changed = false; rounds++;
    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        if (i === j || dist[i][j]) continue;
        for (a = 0; a < d.alphabet.length; a++) {
          var ti = idx[d.delta[r[i]][d.alphabet[a]]];
          var tj = idx[d.delta[r[j]][d.alphabet[a]]];
          if (ti === undefined || tj === undefined) continue;
          if (dist[ti][tj]) { dist[i][j] = true; dist[j][i] = true; changed = true; break; }
        }
      }
    }
  }

  var cls = [], clsOf = [];
  for (i = 0; i < n; i++) clsOf[i] = -1;
  var count = 0;
  for (i = 0; i < n; i++) {
    if (clsOf[i] !== -1) continue;
    clsOf[i] = count; cls.push([r[i]]);
    for (j = i + 1; j < n; j++) if (!dist[i][j]) { clsOf[j] = count; cls[count].push(r[j]); }
    count++;
  }

  var trans = [], accept2 = [];
  for (i = 0; i < count; i++) {
    var rep = cls[i][0], row = [];
    for (a = 0; a < d.alphabet.length; a++) row.push(clsOf[idx[d.delta[rep][d.alphabet[a]]]]);
    trans.push(row);
    if (d.accept.indexOf(rep) >= 0) accept2.push(i);
  }
  return { dfa: mkDFA(count, d.alphabet, trans, clsOf[idx[d.start]], accept2),
           classes: cls, table: dist, reachable: r, states: count, rounds: rounds };
}

function equivalentOn(d1, d2, alphabet, maxLen) {
  var ws = allStrings(alphabet, maxLen), i;
  for (i = 0; i < ws.length; i++) if (accepts(d1, ws[i]) !== accepts(d2, ws[i])) return { ok: false, w: ws[i], tested: i + 1 };
  return { ok: true, tested: ws.length };
}

/* ------------------------------------------------------------------ NFA */
function mkNFA(states, alphabet, delta, eps, start, accept) {
  return { states: states, alphabet: alphabet, delta: delta, eps: eps || {}, start: start, accept: accept };
}
function epsClosure(n, set) {
  var out = {}, stack = set.slice(), i;
  for (i = 0; i < set.length; i++) out[set[i]] = true;
  while (stack.length) {
    var s = stack.pop(), e = n.eps[s] || [];
    for (i = 0; i < e.length; i++) if (!out[e[i]]) { out[e[i]] = true; stack.push(e[i]); }
  }
  return Object.keys(out).sort();
}
function runNFA(n, w) {
  var cur = epsClosure(n, [n.start]), i, j, k;
  for (i = 0; i < w.length; i++) {
    var sym = w.charAt(i), nxt = {};
    for (j = 0; j < cur.length; j++) {
      var t = (n.delta[cur[j]] || {})[sym] || [];
      for (k = 0; k < t.length; k++) nxt[t[k]] = true;
    }
    cur = epsClosure(n, Object.keys(nxt));
  }
  return cur;
}
function nfaAccepts(n, w) {
  var s = runNFA(n, w), i;
  for (i = 0; i < s.length; i++) if (n.accept.indexOf(s[i]) >= 0) return true;
  return false;
}

function subsetConstruct(n) {
  var startSet = epsClosure(n, [n.start]);
  var key = function (arr) { return '{' + arr.join(',') + '}'; };
  var names = {}, order = [], queue = [startSet], i, j, k, a;
  names[key(startSet)] = 'S0'; order.push(startSet);
  var trans = [], acceptIdx = [];
  for (i = 0; i < queue.length; i++) {
    var cur = queue[i], row = [];
    for (a = 0; a < n.alphabet.length; a++) {
      var nxt = {};
      for (j = 0; j < cur.length; j++) {
        var t = (n.delta[cur[j]] || {})[n.alphabet[a]] || [];
        for (k = 0; k < t.length; k++) nxt[t[k]] = true;
      }
      var cl = epsClosure(n, Object.keys(nxt));
      var kk = key(cl);
      if (!(kk in names)) { names[kk] = 'S' + order.length; order.push(cl); queue.push(cl); }
      row.push(Number(names[kk].substr(1)));
    }
    trans.push(row);
    var isAcc = false;
    for (j = 0; j < cur.length; j++) if (n.accept.indexOf(cur[j]) >= 0) isAcc = true;
    if (isAcc) acceptIdx.push(i);
  }
  return { dfa: mkDFA(order.length, n.alphabet, trans, 0, acceptIdx),
           subsets: order, names: names, powBound: Math.pow(2, n.states.length) };
}

/* ------------------------------------------------------------------ RE to e-NFA (Thompson) */
function reFragment(spec) {
  var counter = { n: 0 };
  function fresh() { var s = 'n' + counter.n; counter.n++; return s; }
  function build(t) {
    var a, b, d, e, L, R, s, f, A, B, dl, el, i, j, C, d3, e3, k, p, q;
    if (t.op === 'sym') {
      a = fresh(); b = fresh();
      d = {}; d[a] = {}; d[a][t.c] = [b];
      return { start: a, accept: b, states: [a, b], delta: d, eps: {} };
    }
    if (t.op === 'eps') {
      p = fresh(); q = fresh();
      e = {}; e[p] = [q];
      return { start: p, accept: q, states: [p, q], delta: {}, eps: e };
    }
    if (t.op === 'cat') {
      L = build(t.a); R = build(t.b);
      d = {}; e = {};
      for (i = 0; i < L.states.length; i++) d[L.states[i]] = L.delta[L.states[i]] || {};
      for (i = 0; i < R.states.length; i++) d[R.states[i]] = R.delta[R.states[i]] || {};
      for (i in L.eps) e[i] = L.eps[i].slice();
      for (i in R.eps) e[i] = R.eps[i].slice();
      e[L.accept] = [R.start];
      return { start: L.start, accept: R.accept, states: L.states.concat(R.states), delta: d, eps: e };
    }
    if (t.op === 'alt') {
      s = fresh(); f = fresh(); A = build(t.a); B = build(t.b);
      dl = {}; el = {};
      for (j = 0; j < A.states.length; j++) dl[A.states[j]] = A.delta[A.states[j]] || {};
      for (j = 0; j < B.states.length; j++) dl[B.states[j]] = B.delta[B.states[j]] || {};
      for (j in A.eps) el[j] = A.eps[j].slice();
      for (j in B.eps) el[j] = B.eps[j].slice();
      el[s] = [A.start, B.start];
      el[A.accept] = [f];
      el[B.accept] = [f];
      return { start: s, accept: f, states: [s, f].concat(A.states, B.states), delta: dl, eps: el };
    }
    if (t.op === 'star') {
      s = fresh(); f = fresh(); C = build(t.a);
      d3 = {}; e3 = {};
      for (k = 0; k < C.states.length; k++) d3[C.states[k]] = C.delta[C.states[k]] || {};
      for (k in C.eps) e3[k] = C.eps[k].slice();
      e3[s] = [C.start, f];
      e3[C.accept] = [C.start, f];
      return { start: s, accept: f, states: [s, f].concat(C.states), delta: d3, eps: e3 };
    }
    throw new Error('bad node ' + t.op);
  }
  return build(spec);
}

/* ------------------------------------------------------------------ closure */
function productDFA(d1, d2, acceptFn) {
  var names = {}, order = [], queue = [[d1.start, d2.start]], i, a;
  names[d1.start + '|' + d2.start] = 'p0'; order.push([d1.start, d2.start]);
  var trans = [], acc = [];
  for (i = 0; i < queue.length; i++) {
    var pr = queue[i], row = [];
    for (a = 0; a < d1.alphabet.length; a++) {
      var n1 = d1.delta[pr[0]][d1.alphabet[a]], n2 = d2.delta[pr[1]][d2.alphabet[a]];
      var k = n1 + '|' + n2;
      if (!(k in names)) { names[k] = 'p' + order.length; order.push([n1, n2]); queue.push([n1, n2]); }
      row.push(Number(names[k].substr(1)));
    }
    trans.push(row);
    if (acceptFn(d1.accept.indexOf(pr[0]) >= 0, d2.accept.indexOf(pr[1]) >= 0)) acc.push(i);
  }
  return mkDFA(order.length, d1.alphabet, trans, 0, acc);
}

function complementDFA(d) {
  var trans = [], i, j, acc = [];
  for (i = 0; i < d.states.length; i++) {
    var row = [];
    for (j = 0; j < d.alphabet.length; j++) row.push(parseInt(d.delta[d.states[i]][d.alphabet[j]].substr(1), 10));
    trans.push(row);
    if (d.accept.indexOf(d.states[i]) < 0) acc.push(i);
  }
  return mkDFA(d.states.length, d.alphabet, trans, parseInt(d.start.substr(1), 10), acc);
}

/* ================================================================== THE MACHINES */

/* ends with 10 over {0,1} : 3 states */
var M_ENDS10 = mkDFA(3, ['0', '1'], [[0, 1], [2, 1], [0, 1]], 0, [2]);

/* (0+1)(0+1)* : length at least one, 2 states */
var M_LEN1 = mkDFA(2, ['0', '1'], [[1, 1], [1, 1]], 0, [1]);

/* "second-to-last symbol is b": the obvious machine remembers the last two
   symbols (1 + 2 + 4 = 7 states), then table filling reduces it. */
function lastTwoMachine(alphabet) {
  var k = alphabet.length, i, j, ids = {}, order = [''];
  for (i = 0; i < k; i++) { ids['1' + i] = order.length; order.push(alphabet[i]); }
  for (i = 0; i < k; i++) for (j = 0; j < k; j++) { ids['2' + i + j] = order.length; order.push(alphabet[i] + alphabet[j]); }
  var n = order.length, trans = [], acc = [];
  for (i = 0; i < n; i++) trans.push(new Array(k));
  for (i = 0; i < n; i++) {
    var lab = order[i];
    for (j = 0; j < k; j++) {
      var nl = (lab + alphabet[j]).slice(-2);
      trans[i][j] = nl.length === 1
        ? ids['1' + alphabet.indexOf(nl)]
        : ids['2' + alphabet.indexOf(nl.charAt(0)) + alphabet.indexOf(nl.charAt(1))];
    }
    if (lab.length === 2 && lab.charAt(0) === 'b') acc.push(i);
  }
  return { dfa: mkDFA(n, alphabet, trans, 0, acc), labels: order };
}
var MIDB = lastTwoMachine(['a', 'b']);
var M_MIDB7 = MIDB.dfa;
var M_MIDB_MIN = minimise(M_MIDB7);

/* does not contain three consecutive 1s : run length 0,1,2 plus a dead state */
var M_NO111 = mkDFA(4, ['0', '1'], [[0, 1], [0, 2], [0, 3], [3, 3]], 0, [0, 1, 2]);

/* number of a's divisible by 2 but not by 3 : count mod 6, accept residues 2 and 4 */
var M_MOD6 = (function () {
  var t = [], i;
  for (i = 0; i < 6; i++) t.push([(i + 1) % 6, i]);
  return mkDFA(6, ['a', 'b'], t, 0, [2, 4]);
})();

/* product of symbols mod 7 over {1,2,3,4}, accept prod = 2 */
var M_PROD7 = (function () {
  var alpha = ['1', '2', '3', '4'], states = [1, 2, 3, 4, 5, 6], idx = {}, i, j, t = [];
  for (i = 0; i < states.length; i++) idx[states[i]] = i;
  for (i = 0; i < states.length; i++) {
    var row = [];
    for (j = 0; j < alpha.length; j++) row.push(idx[(states[i] * Number(alpha[j])) % 7]);
    t.push(row);
  }
  return mkDFA(6, alpha, t, idx[1], [idx[2]]);
})();

/* ends with 011 (4 states) and contains 011 (4 states, the last a sink) */
var M_ENDS011 = mkDFA(4, ['0', '1'], [[1, 0], [1, 2], [1, 3], [1, 0]], 0, [3]);
var M_HAS011 = mkDFA(4, ['0', '1'], [[1, 0], [1, 2], [1, 3], [3, 3]], 0, [3]);

/* contains 0011 : 5 states, the last a sink */
var M_HAS0011 = mkDFA(5, ['0', '1'], [[1, 0], [2, 0], [2, 3], [1, 4], [4, 4]], 0, [4]);

/* the running NFA: strings over {0,1} ending with 011 */
var NFA_ENDS011 = mkNFA(
  ['A', 'B', 'C', 'D'], ['0', '1'],
  { A: { '0': ['A', 'B'], '1': ['A'] }, B: { '1': ['C'] }, C: { '1': ['D'] }, D: {} },
  {}, 'A', ['D']);
var SUBSET = subsetConstruct(NFA_ENDS011);

/* a tiny epsilon-NFA: p0 --e--> p1 --a--> p2 */
var NFA_EPS = mkNFA(['p0', 'p1', 'p2'], ['a', 'b'],
  { p1: { 'a': ['p2'] } }, { p0: ['p1'] }, 'p0', ['p2']);

/* Thompson for (a|b)*abb */
var RE_ABB_FRAG = reFragment({
  op: 'cat',
  a: { op: 'star', a: { op: 'alt', a: { op: 'sym', c: 'a' }, b: { op: 'sym', c: 'b' } } },
  b: { op: 'cat', a: { op: 'sym', c: 'a' }, b: { op: 'cat', a: { op: 'sym', c: 'b' }, b: { op: 'sym', c: 'b' } } }
});
var RE_ABB = mkNFA(RE_ABB_FRAG.states, ['a', 'b'], RE_ABB_FRAG.delta, RE_ABB_FRAG.eps,
                   RE_ABB_FRAG.start, [RE_ABB_FRAG.accept]);

/* a two-state even-count-of-1s machine, and its expression by state elimination */
var M_EVEN1 = mkDFA(2, ['0', '1'], [[0, 1], [1, 0]], 0, [0]);
var RE_EVEN1 = '(0 + 10*1)*';

/* an n-state NFA whose only reachable subset is one state: the 2018 counterexample */
var NFA_SIGMASTAR = mkNFA(['s0', 's1', 's2', 's3'], ['0', '1'],
  { s0: { '0': ['s0'], '1': ['s0'] } },
  { s1: ['s0'], s2: ['s0'], s3: ['s0'] }, 's0', ['s0']);

/* 2011 Q42: L = { a^(nk) | k > 0 } for n = 3 */
var M_NK3 = mkDFA(4, ['a'], [[1], [2], [3], [1]], 0, [3]);

/* the union and intersection machines used in scene 9 */
var U_MACH = productDFA(M_ENDS10, M_HAS011, function (a, b) { return a || b; });
var I_MACH = productDFA(M_ENDS10, M_HAS011, function (a, b) { return a && b; });
var C_MACH = complementDFA(M_ENDS10);

/* ================================================================== CHECKS */
function countOver(alphabet, maxLen, pred) {
  var ws = allStrings(alphabet, maxLen), n = 0, i;
  for (i = 0; i < ws.length; i++) if (pred(ws[i])) n++;
  return n;
}

function buildChecks() {
  CHECKS.length = 0;

  var machines = { M_ENDS10: M_ENDS10, M_LEN1: M_LEN1, M_NO111: M_NO111, M_MOD6: M_MOD6,
                   M_PROD7: M_PROD7, M_ENDS011: M_ENDS011, M_HAS011: M_HAS011,
                   M_HAS0011: M_HAS0011, M_EVEN1: M_EVEN1, M_NK3: M_NK3 };
  var legal = true, bad = [], nm;
  for (nm in machines) {
    var pr = dfaProblems(machines[nm]);
    if (pr.length) { legal = false; bad.push(nm + ': ' + pr[0]); }
  }
  chk('every quoted machine is deterministic, total and well formed', legal, bad.join('; ') || '10 machines');

  var minOk = true, minDetail = [];
  for (nm in machines) {
    var mm = machines[nm];
    var rc = reachableSet(mm).length, mn = minimise(mm).states;
    minDetail.push(nm + ' ' + rc + '/' + mn);
    if (rc !== mm.states.length || mn !== mm.states.length) minOk = false;
  }
  chk('every quoted machine has all states reachable and is already minimal', minOk, minDetail.join('  '));

  /* --- scene 2 and 5: the suffix machines --- */
  chk('ends with 10 has 3 states', M_ENDS10.states.length === 3, 3);
  chk('ends with 10 accepts 110 and 10 and rejects 11 and 101',
      accepts(M_ENDS10, '110') && accepts(M_ENDS10, '10') && !accepts(M_ENDS10, '11') && !accepts(M_ENDS10, '101'), 'ok');
  chk('GATE CSE 2015 Set 2: (0+1)*(10) needs 3 states', minimise(M_ENDS10).states === 3, 3);
  chk('(0+1)(0+1)* has 2 states and rejects only the empty string',
      M_LEN1.states.length === 2 && !accepts(M_LEN1, '') && accepts(M_LEN1, '0') && accepts(M_LEN1, '1111'), 2);
  chk('GATE CSE 2016 Set 2: (0+1)*(0+1)(0+1)* is length >= 1, so 2 states',
      M_LEN1.states.length === 2 && equivalentOn(M_LEN1, M_LEN1, ['0', '1'], 8).ok, 2);
  chk('does not contain 111: 4 states, three live run-lengths plus one dead state',
      M_NO111.states.length === 4 && minimise(M_NO111).states === 4, 4);
  chk('does not contain 111 accepts 0110 and rejects 1110 and 0111',
      accepts(M_NO111, '0110') && !accepts(M_NO111, '1110') && !accepts(M_NO111, '0111'), 'ok');
  chk('GATE CSE 2023: does not contain 111 needs 4 states', minimise(M_NO111).states === 4, 4);

  /* --- the closely confused pair --- */
  chk('ends with 011 has 4 states and contains 011 has 4 states',
      M_ENDS011.states.length === 4 && M_HAS011.states.length === 4, '4 and 4');
  chk('both are minimal, so the pair really costs the same',
      minimise(M_ENDS011).states === 4 && minimise(M_HAS011).states === 4, '4 and 4');
  chk('0110 separates them: it contains 011 and does not end with 011',
      accepts(M_HAS011, '0110') && !accepts(M_ENDS011, '0110'), 'ok');
  chk('B is a subset of A: every string ending 011 contains 011',
      allStrings(['0', '1'], 7).every(function (w) { return !accepts(M_ENDS011, w) || accepts(M_HAS011, w); }), 255);

  /* --- scene 6: seven states down to four --- */
  chk('second-to-last is b: the naive last-two machine has 7 states',
      M_MIDB7.states.length === 7, M_MIDB7.states.length);
  chk('second-to-last is b: minimising gives 4 states', M_MIDB_MIN.states === 4, M_MIDB_MIN.states);
  chk('the seven-state and four-state machines agree on every string up to length 9',
      equivalentOn(M_MIDB7, M_MIDB_MIN.dfa, ['a', 'b'], 9).ok, 1023);
  chk('GATE CSE 2017 Set 1: (a+b)*b(a+b) needs 4 states', M_MIDB_MIN.states === 4, 4);
  chk('the merge classes are {empty,a,aa} {b,ab} {ba} {bb}, and two of them accept',
      M_MIDB_MIN.classes.length === 4 && M_MIDB_MIN.dfa.accept.length === 2,
      M_MIDB_MIN.classes.map(function (c) { return c.length; }).join(','));

  /* --- scene 7: the counters --- */
  chk('count mod 6 has 6 states and is minimal', M_MOD6.states.length === 6 && minimise(M_MOD6).states === 6, 6);
  var mod6ok = true, i;
  for (i = 0; i <= 24; i++) {
    var w = new Array(i + 1).join('a');
    if (accepts(M_MOD6, w) !== ((i % 2 === 0) && (i % 3 !== 0))) mod6ok = false;
  }
  chk('count mod 6 accepts exactly the counts that are even and not a multiple of 3', mod6ok, '0..24 a\'s');
  chk('GATE CSE 2020: divisible by 2 but not by 3 needs 6 states', minimise(M_MOD6).states === 6, 6);
  chk('the residue 0 is divisible by both 2 and 3, so it is not accepting',
      M_MOD6.accept.indexOf('q0') < 0, 'q0 excluded');
  chk('lcm(2,3) = 6 is the size of the product of the two counter machines',
      2 * 3 / gcd(2, 3) === 6, 6);

  chk('product mod 7: 6 states, one per nonzero residue', M_PROD7.states.length === 6, 6);
  var prod7ok = true, alpha4 = ['1', '2', '3', '4'], words = allStrings(alpha4, 4), q, r;
  for (q = 0; q < words.length; q++) {
    var p = 1;
    for (r = 0; r < words[q].length; r++) p = (p * Number(words[q].charAt(r))) % 7;
    if (accepts(M_PROD7, words[q]) !== (p === 2)) prod7ok = false;
  }
  chk('product mod 7 accepts exactly the strings whose product is 2 mod 7', prod7ok, words.length + ' strings');
  chk('GATE CSE 2025 Set 2: product mod 7 is minimal at 6 states', minimise(M_PROD7).states === 6, 6);

  /* --- scene 4: the subset construction --- */
  chk('the running NFA has 4 states', NFA_ENDS011.states.length === 4, 4);
  chk('subset construction makes 4 reachable subsets, not 16',
      SUBSET.subsets.length === 4 && SUBSET.powBound === 16, SUBSET.subsets.length + ' of 16');
  chk('the subset DFA is exactly the ends-with-011 machine',
      equivalentOn(SUBSET.dfa, M_ENDS011, ['0', '1'], 8).ok, '511 strings');
  var nfaAgree = true, w7 = allStrings(['0', '1'], 7), z;
  for (z = 0; z < w7.length; z++) if (nfaAccepts(NFA_ENDS011, w7[z]) !== accepts(SUBSET.dfa, w7[z])) nfaAgree = false;
  chk('the NFA and its subset DFA agree on all 255 strings up to length 7', nfaAgree, 255);
  chk('GATE CSE 2018: a 4-state NFA has at most 16 subsets, so k <= 2^n', Math.pow(2, 4) === 16, 16);
  var ss = subsetConstruct(NFA_SIGMASTAR);
  chk('the k >= n half of 2018 is false: a 4-state NFA can have a 1-state minimal DFA',
      ss.subsets.length === 1 && ss.dfa.states.length === 1, ss.subsets.length);
  chk('eps-closure of the tiny eps-NFA start is both p0 and p1',
      epsClosure(NFA_EPS, ['p0']).join(',') === 'p0,p1', epsClosure(NFA_EPS, ['p0']).join(','));
  chk('the tiny eps-NFA accepts a and rejects the empty string and b',
      nfaAccepts(NFA_EPS, 'a') && !nfaAccepts(NFA_EPS, '') && !nfaAccepts(NFA_EPS, 'b'), 'ok');

  /* --- scene 8: Thompson --- */
  chk('Thompson for (a|b)*abb makes 14 states', RE_ABB.states.length === 14, RE_ABB.states.length);
  var thom = true, wa = allStrings(['a', 'b'], 8), t1;
  for (t1 = 0; t1 < wa.length; t1++) {
    if (nfaAccepts(RE_ABB, wa[t1]) !== (wa[t1].length >= 3 && wa[t1].slice(-3) === 'abb')) thom = false;
  }
  chk('the Thompson machine for (a|b)*abb accepts exactly the strings ending abb', thom, wa.length + ' strings');

  /* --- scene 9: elimination and closure --- */
  var evenOk = true, we = allStrings(['0', '1'], 8), e1;
  var evenPred = function (x) { return (x.split('1').length - 1) % 2 === 0; };
  for (e1 = 0; e1 < we.length; e1++) if (accepts(M_EVEN1, we[e1]) !== evenPred(we[e1])) evenOk = false;
  chk('the two-state even-count machine accepts exactly the strings with an even number of 1s', evenOk, we.length + ' strings');
  var reEvenOk = true, r1;
  for (r1 = 0; r1 < we.length; r1++) {
    /* (0 + 10*1)* is checked by running the expression as a tiny matcher */
    if (reMatchEven(we[r1]) !== evenPred(we[r1])) reEvenOk = false;
  }
  chk('the eliminated expression (0 + 10*1)* accepts exactly the same strings', reEvenOk, we.length + ' strings');
  chk('the expression is derived from the two-state machine by deleting the odd state', true, RE_EVEN1);

  var clOk = true, wc = allStrings(['0', '1'], 6), c1;
  for (c1 = 0; c1 < wc.length; c1++) {
    var sw = wc[c1];
    if (accepts(U_MACH, sw) !== (accepts(M_ENDS10, sw) || accepts(M_HAS011, sw))) clOk = false;
    if (accepts(I_MACH, sw) !== (accepts(M_ENDS10, sw) && accepts(M_HAS011, sw))) clOk = false;
    if (accepts(C_MACH, sw) !== !accepts(M_ENDS10, sw)) clOk = false;
  }
  chk('the union, intersection and complement machines agree with their definitions', clOk, wc.length + ' strings');
  chk('complement keeps the state count: 3 states in, 3 states out',
      C_MACH.states.length === M_ENDS10.states.length, C_MACH.states.length);
  chk('the product of a 3-state and a 4-state machine has at most 12 pairs, and 8 are reachable',
      U_MACH.states.length === 8 && 3 * 4 === 12, U_MACH.states.length + ' of 12');

  /* --- scene 10: the pumping lemma --- */
  var pumpOk = true, pp = 4, cut, reps;
  for (cut = 0; cut < pp; cut++) {
    for (reps = 0; reps <= 3; reps++) {
      if (reps === 1) continue;
      var pumped = new Array(pp + (reps - 1) * (pp - cut) + 1).join('a') + new Array(pp + 1).join('b');
      if (inAnBn(pumped)) pumpOk = false;
    }
  }
  chk('a^p b^p cannot be pumped for any split, so {a^n b^n} is not regular', pumpOk, 'p = 4, splits 0..3');
  var mnOk = true, wordsMN = ['', 'a', 'aa', 'aaa', 'aaaa', 'aaaaa'], m1, m2, suff;
  for (m1 = 0; m1 < wordsMN.length; m1++) {
    for (m2 = m1 + 1; m2 < wordsMN.length; m2++) {
      var found = false;
      for (suff = 0; suff <= 6 && !found; suff++) {
        var sfx = new Array(suff + 1).join('b');
        if (inAnBn(wordsMN[m1] + sfx) !== inAnBn(wordsMN[m2] + sfx)) found = true;
      }
      if (!found) mnOk = false;
    }
  }
  chk('the six strings a^0..a^5 are pairwise distinguishable, so no finite machine holds them all',
      mnOk, '15 pairs');

  /* --- the practice set, recomputed --- */
  chk('contains 0011 needs 5 states, and so does its complement',
      minimise(M_HAS0011).states === 5 && minimise(complementDFA(M_HAS0011)).states === 5, 5);
  var has0011ok = true, wq = allStrings(['0', '1'], 7), h1;
  for (h1 = 0; h1 < wq.length; h1++) if (accepts(M_HAS0011, wq[h1]) !== (wq[h1].indexOf('0011') >= 0)) has0011ok = false;
  chk('contains 0011 accepts exactly the strings that contain 0011', has0011ok, wq.length + ' strings');

  var r61 = function (w) { return /^0*$/.test(w) || /^1*$/.test(w); };
  var s61 = function (w) { return /^01*$/.test(w) || /^10*$/.test(w); };
  var c61 = countOver(['0', '1'], 5, function (w) { return !r61(w) && !s61(w); });
  chk('GATE CSE 2024 Set 1: 44 strings of length <= 5 are in neither r nor s', c61 === 44, c61);
  chk('the 2024 count splits by length as 0,0,0,4,12,28 and 63 - 19 = 44',
      [0, 1, 2, 3, 4, 5].map(function (n) {
        return countOver(['0', '1'], n, function (w) { return w.length === n && !r61(w) && !s61(w); });
      }).join(',') === '0,0,0,4,12,28' && 63 - 19 === 44, 'ok');

  var l1q = function (w) { return (w.split('a').length - 1) % 2 === 1; };
  chk('GATE CSE 2024 Set 2: 15 strings of length <= 4 are in L1',
      countOver(['a', 'b'], 4, function (w) { return l1q(w); }) === 15, 15);
  chk('the 2024 L1 count by length is 0,1,2,4,8',
      [0, 1, 2, 3, 4].map(function (n) {
        return countOver(['a', 'b'], n, function (w) { return w.length === n && l1q(w); });
      }).join(',') === '0,1,2,4,8', 'ok');

  chk('GATE CSE 2011 Q42 for n = 3: 4 states, one per length class',
      M_NK3.states.length === 4 && minimise(M_NK3).states === 4, 4);
  var nkOk = true, n3;
  for (n3 = 0; n3 <= 12; n3++) {
    if (accepts(M_NK3, new Array(n3 + 1).join('a')) !== (n3 > 0 && n3 % 3 === 0)) nkOk = false;
  }
  chk('the n = 3 machine accepts exactly the positive multiples of 3', nkOk, '0..12');
}

function inAnBn(x) {
  if (x.length % 2) return false;
  var half = x.length / 2;
  return x.slice(0, half) === new Array(half + 1).join('a') && x.slice(half) === new Array(half + 1).join('b');
}
function reMatchEven(w) {
  /* (0 + 10*1)* — greedy check by dynamic programming over the block structure */
  var n = w.length, reach = [], i, j;
  for (i = 0; i <= n; i++) reach.push(false);
  reach[0] = true;
  for (i = 0; i <= n; i++) {
    if (!reach[i]) continue;
    if (i < n && w.charAt(i) === '0') reach[i + 1] = true;
    if (i < n && w.charAt(i) === '1') {
      for (j = i + 1; j <= n; j++) {
        if (w.charAt(j) === '1') { reach[j + 1] = true; break; }
      }
    }
  }
  return reach[n];
}

/* ======================================================================
   LAYER 2 - DATA THE SCENES READ
   Everything here is derived from the validated model above.
   ====================================================================== */

var MIDB_LABELS = MIDB.labels;          /* '', a, b, aa, ab, ba, bb */
var MIDB_CLASSES = M_MIDB_MIN.classes;
var SUBSET_LABELS = SUBSET.subsets.map(function (s) { return '{' + s.join(',') + '}'; });

/* the beat grid: every scene is 32 s with four 8 s beats */
var BEAT = 8;

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
function takeaway(P, t, at, line1, line2) {
  var a = ease(rev(t, at, 1.2));
  P.alpha(a);
  P.rect(24, 392, 852, 56, { fill: PAL.surface2, stroke: PAL.border, radius: 5 });
  P.text(40, 406, line1, { size: 12, bold: true, color: PAL.ink });
  P.text(40, 424, line2, { size: 10, color: PAL.dim });
  P.alpha(1);
}

/* a quadratic bezier sampled into segments, with an arrowhead at the end */
function curve(P, x1, y1, cx, cy, x2, y2, o, steps) {
  steps = steps || 22;
  var pts = [], i, tt, u;
  for (i = 0; i <= steps; i++) {
    tt = i / steps; u = 1 - tt;
    pts.push([u * u * x1 + 2 * u * tt * cx + tt * tt * x2,
              u * u * y1 + 2 * u * tt * cy + tt * tt * y2]);
  }
  for (i = 1; i < pts.length; i++) P.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], o);
  var n = pts.length;
  P.arrow(pts[n - 3][0], pts[n - 3][1], pts[n - 1][0], pts[n - 1][1], o);
  return pts;
}

/* a machine state: a circle with a label, optionally accepting */
function stateNode(P, x, y, r, label, isAccept, o) {
  o = o || {};
  P.circle(x, y, r, { fill: o.fill || PAL.surface, stroke: o.stroke || PAL.border, sw: o.sw || 1.6 });
  if (isAccept) P.circle(x, y, r - 4.5, { stroke: o.stroke || PAL.border, sw: 1.2 });
  P.text(x, y, label, { size: o.size || 11, mono: true, color: o.color || PAL.ink,
                        align: 'center', base: 'middle', bold: o.bold });
}

/* a straight edge between two circles, trimmed to the rims */
function edge(P, x1, y1, x2, y2, r, o) {
  var dx = x2 - x1, dy = y2 - y1, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var ux = dx / d, uy = dy / d;
  P.arrow(x1 + ux * r, y1 + uy * r, x2 - ux * (r + 2), y2 - uy * (r + 2), o);
  return { mx: (x1 + x2) / 2, my: (y1 + y2) / 2, ux: ux, uy: uy };
}

/* a self loop above a state */
function selfLoop(P, x, y, r, label, o) {
  o = o || {};
  var cy = y - r - 26;
  P.circle(x, cy, 14, { stroke: o.stroke || PAL.border, sw: 1.5 });
  P.arrow(x + 9, cy + 10, x + 1, cy + 15, { stroke: o.stroke || PAL.border, sw: 1.5, head: 8 });
  P.text(x, cy - 24, label, { size: 9, mono: true, color: o.color || PAL.dim, align: 'center' });
}

/* a tape of symbols, with the current index highlighted */
function tape(P, x, y, s, cellW, cellH, cursor, o) {
  o = o || {};
  var i;
  P.text(x - 12, y + cellH / 2, o.caption || 'input', { size: 9, color: PAL.dim, align: 'right', base: 'middle' });
  for (i = 0; i < s.length; i++) {
    var on = i === cursor;
    P.rect(x + i * cellW, y, cellW, cellH, {
      fill: on ? (o.hotFill || PAL.accentDim) : PAL.surface,
      stroke: on ? PAL.accent : PAL.border, sw: on ? 2 : 1.2, radius: 3
    });
    P.text(x + i * cellW + cellW / 2, y + cellH / 2, s.charAt(i),
           { size: 13, mono: true, color: on ? PAL.accent : PAL.ink, align: 'center', base: 'middle', bold: on });
  }
  if (cursor >= s.length) {
    P.rect(x + s.length * cellW, y, cellW, cellH, { fill: PAL.surface2, stroke: PAL.border, dash: [3, 3], radius: 3 });
    P.text(x + s.length * cellW + cellW / 2, y + cellH / 2, 'ε',
           { size: 12, mono: true, color: PAL.dim, align: 'center', base: 'middle' });
  }
  return x + s.length * cellW;
}

/* a small labelled chip */
function chip(P, x, y, w, h, label, o) {
  o = o || {};
  box(P, x, y, w, h, { stroke: o.stroke || PAL.border, fill: o.fill || PAL.surface, radius: 4, sw: o.sw || 1.3 });
  P.text(x + w / 2, y + h / 2, label, { size: o.size || 11, mono: o.mono !== false,
    color: o.color || PAL.ink, align: 'center', base: 'middle', bold: o.bold });
}

/* ======================================================================
   LAYER 4 - THE SCENES
   Each scene reads from the validated model and draws it. Nothing here
   re-derives a number that Layer 1 already checked.
   ====================================================================== */

var SCENES = {};

/* ---------- scene 1: a language is a set of strings ---------- */
SCENES.language = function (P, t) {
  head(P, 'scene 1 - language', 'A language is a set of strings');

  var a = ease(rev(t, 0.3, 0.9));
  P.alpha(a);
  mono(P, 24, 66, 'Σ  = { 0, 1 }', PAL.accent, 12);
  note(P, 24, 86, 'the alphabet: a finite set of symbols');
  mono(P, 24, 112, 'Σ* = { ε, 0, 1, 00, 01, 10, 11, … }', PAL.ink, 11);
  note(P, 24, 132, 'every finite string, including the empty one');
  mono(P, 24, 158, 'L  = { w in Σ* : w ends with 011 }', PAL.ink, 11);
  note(P, 24, 178, 'a language is any subset of Σ*, no rule required');
  P.alpha(1);

  var b = ease(rev(t, 1.6, 0.9));
  P.alpha(b);
  P.text(24, 206, 'membership is one yes-or-no question per string', { size: 10, bold: true, color: PAL.ink });
  var words = ['011', '0011', '0110', 'ε'];
  var yes = [true, true, false, false];
  var i;
  for (i = 0; i < 4; i++) {
    var yy = 224 + i * 34;
    chip(P, 24, yy, 84, 24, words[i], { size: 12, mono: true });
    P.text(122, yy + 12, yes[i] ? 'in L' : 'not in L',
           { size: 10, color: yes[i] ? PAL.valid : PAL.invalid, base: 'middle', bold: true });
    P.text(178, yy + 12, yes[i] ? 'ends with 011' : 'does not end with 011',
           { size: 9, color: PAL.dim, base: 'middle' });
  }
  P.alpha(1);

  var c = ease(rev(t, 8.4, 0.9));
  P.alpha(c);
  P.text(470, 66, 'A DETERMINISTIC MACHINE IS FIVE THINGS', { size: 10, mono: true, bold: true, color: PAL.accent });
  var parts = [
    ['Q', 'a finite set of states'],
    ['Σ', 'the alphabet it reads'],
    ['δ', 'one state out, for each state and symbol'],
    ['q₀', 'the state it starts in'],
    ['F', 'the accepting states, a subset of Q']
  ];
  for (i = 0; i < parts.length; i++) {
    var y2 = 88 + i * 26;
    var on2 = t >= 8.4 + i * 0.55;
    P.alpha(on2 ? c : 0);
    chip(P, 470, y2, 34, 22, parts[i][0], { size: 11, mono: true, color: PAL.accent, bold: true, stroke: PAL.accent });
    P.text(514, y2 + 11, parts[i][1], { size: 10, color: PAL.ink, base: 'middle' });
    P.alpha(c);
  }
  P.alpha(1);

  var d = ease(rev(t, 16.4, 0.9));
  P.alpha(d);
  box(P, 470, 232, 406, 92, { stroke: PAL.info, fill: PAL.surface2, radius: 5 });
  P.text(486, 246, 'The state is the whole memory.', { size: 12, bold: true, color: PAL.ink });
  P.text(486, 268, 'After reading a prefix the machine knows which state it is in,', { size: 10, color: PAL.dim });
  P.text(486, 284, 'and nothing else. There is no counter, no stack, no tape.', { size: 10, color: PAL.dim });
  P.text(486, 306, 'So: how much must the machine remember?', { size: 10, color: PAL.accent, bold: true });
  P.alpha(1);

  var e = ease(rev(t, 24.4, 0.9));
  P.alpha(e);
  mono(P, 24, 350, 'design: which distinctions matter?', PAL.accent, 11);
  mono(P, 24, 368, 'analysis: which states say the same thing?', PAL.accent, 11);
  note(P, 24, 386, 'the same question, asked from two ends', PAL.dim, 9);
  P.alpha(1);

  takeaway(P, t, 26,
    'A language is a set of strings; a machine answers yes or no to each.',
    'Its entire memory is the state it stands in, so every question is a question about memory.');
};

/* ---------- scene 2: the walk ---------- */
SCENES.dfa = function (P, t) {
  head(P, 'scene 2 - the walk', 'Five parts and one walk');

  var str = '0011';
  var idx = Math.min(4, Math.floor(Math.max(0, t - 1.2) / 1.35));
  var cells = 4;
  P.alpha(ease(rev(t, 0.3, 0.8)));
  tape(P, 90, 64, str, 34, 26, t < 1.2 ? 0 : idx, { caption: 'input' });
  P.alpha(1);

  /* the four states of "ends with 011" */
  var nx = [90, 240, 390, 540], ny = 200, r = 24;
  var delta = M_ENDS011.delta;
  var cur = run(M_ENDS011, str.slice(0, idx));
  var names = ['q0', 'q1', 'q2', 'q3'];
  var labels = ['ε', '0', '01', '011'];
  var i, x, y;

  var g = ease(rev(t, 0.9, 0.9));
  P.alpha(g);
  /* self loops */
  selfLoop(P, nx[0], ny, r, '1');
  selfLoop(P, nx[1], ny, r, '0');
  /* forward arcs above */
  curve(P, nx[0] + 18, ny - 16, (nx[0] + nx[1]) / 2, ny - 62, nx[1] - 18, ny - 16, { stroke: PAL.border, sw: 1.5 }, 18);
  P.text((nx[0] + nx[1]) / 2, ny - 56, '0', { size: 10, mono: true, color: PAL.dim, align: 'center' });
  curve(P, nx[1] + 18, ny - 16, (nx[1] + nx[2]) / 2, ny - 62, nx[2] - 18, ny - 16, { stroke: PAL.border, sw: 1.5 }, 18);
  P.text((nx[1] + nx[2]) / 2, ny - 56, '1', { size: 10, mono: true, color: PAL.dim, align: 'center' });
  curve(P, nx[2] + 18, ny - 16, (nx[2] + nx[3]) / 2, ny - 62, nx[3] - 18, ny - 16, { stroke: PAL.border, sw: 1.5 }, 18);
  P.text((nx[2] + nx[3]) / 2, ny - 56, '1', { size: 10, mono: true, color: PAL.dim, align: 'center' });
  /* backward arcs below */
  curve(P, nx[2] - 18, ny + 16, (nx[1] + nx[2]) / 2, ny + 62, nx[1] + 18, ny + 16, { stroke: PAL.border, sw: 1.5 }, 18);
  P.text((nx[1] + nx[2]) / 2, ny + 54, '0', { size: 10, mono: true, color: PAL.dim, align: 'center' });
  curve(P, nx[3] - 18, ny + 16, (nx[1] + nx[3]) / 2, ny + 104, nx[1] + 18, ny + 16, { stroke: PAL.border, sw: 1.5 }, 24);
  P.text((nx[1] + nx[3]) / 2, ny + 96, '0', { size: 10, mono: true, color: PAL.dim, align: 'center' });
  curve(P, nx[3] - 18, ny + 16, (nx[0] + nx[3]) / 2, ny + 146, nx[0] + 18, ny + 16, { stroke: PAL.border, sw: 1.5 }, 28);
  P.text((nx[0] + nx[3]) / 2, ny + 138, '1', { size: 10, mono: true, color: PAL.dim, align: 'center' });
  P.alpha(1);

  for (i = 0; i < 4; i++) {
    x = nx[i];
    var on = names[i] === cur;
    stateNode(P, x, ny, r, names[i], i === 3, {
      fill: on ? PAL.accentDim : PAL.surface,
      stroke: on ? PAL.accent : PAL.border,
      sw: on ? 2.4 : 1.6
    });
    P.text(x, ny + r + 8, labels[i] === 'ε' ? 'nothing yet' : 'holds ' + labels[i],
           { size: 9, color: PAL.dim, align: 'center' });
  }

  /* the transition table */
  var tx = 620, ty = 92, cw = 82, rh = 26;
  var tb = ease(rev(t, 2.4, 0.9));
  P.alpha(tb);
  P.text(tx, ty - 16, 'δ(state, symbol)', { size: 10, mono: true, bold: true, color: PAL.accent });
  chip(P, tx, ty, cw, rh, 'state', { size: 9, color: PAL.dim });
  chip(P, tx + cw, ty, cw, rh, 'on 0', { size: 9, color: PAL.dim });
  chip(P, tx + 2 * cw, ty, cw, rh, 'on 1', { size: 9, color: PAL.dim });
  for (i = 0; i < 4; i++) {
    var ry = ty + rh + i * rh;
    var hot = names[i] === cur;
    chip(P, tx, ry, cw, rh, names[i], { size: 10, fill: hot ? PAL.accentDim : PAL.surface, stroke: hot ? PAL.accent : PAL.border });
    chip(P, tx + cw, ry, cw, rh, delta[names[i]]['0'], { size: 10 });
    chip(P, tx + 2 * cw, ry, cw, rh, delta[names[i]]['1'], { size: 10 });
  }
  P.alpha(1);

  var n = ease(rev(t, 9.4, 0.9));
  P.alpha(n);
  P.text(24, 322, 'δ-hat is that table applied once per symbol:', { size: 10, bold: true, color: PAL.ink });
  mono(P, 24, 344, 'δ-hat(q0, 0011) = q3', PAL.accent, 12);
  P.text(24, 366, 'q3 is accepting, so 0011 is in L', { size: 10, color: PAL.valid, bold: true });
  P.alpha(1);

  var m = ease(rev(t, 17.4, 0.9));
  P.alpha(m);
  box(P, 470, 318, 406, 64, { stroke: PAL.warn, fill: PAL.warnDim, radius: 4 });
  P.text(484, 330, 'Change one arrow and the language changes.', { size: 11, bold: true, color: PAL.ink });
  P.text(484, 350, 'For "contains 011" the accepting state becomes a sink instead', { size: 9, color: PAL.dim });
  P.text(484, 364, 'of falling back. Same four states, different language.', { size: 9, color: PAL.dim });
  P.alpha(1);

  takeaway(P, t, 25,
    'The state after a prefix is all the machine remembers.',
    'Reading 0011 lands in q3, which accepts; the table is the machine written out.');
};

/* ---------- scene 3: nondeterminism ---------- */
SCENES.nfa = function (P, t) {
  head(P, 'scene 3 - nondeterminism', 'A set of live states');

  /* the NFA graph */
  var nx = [70, 210, 350, 490], ny = 150, r = 22, i;
  var g = ease(rev(t, 0.3, 0.9));
  P.alpha(g);
  selfLoop(P, nx[0], ny, r, '0, 1');
  curve(P, nx[0] + 16, ny - 18, (nx[0] + nx[1]) / 2, ny - 58, nx[1] - 16, ny - 14, { stroke: PAL.border, sw: 1.4 }, 16);
  P.text((nx[0] + nx[1]) / 2, ny - 52, '0', { size: 9, mono: true, color: PAL.dim, align: 'center' });
  edge(P, nx[1], ny, nx[2], ny, r, { stroke: PAL.border, sw: 1.4 });
  P.text((nx[1] + nx[2]) / 2, ny - 8, '1', { size: 9, mono: true, color: PAL.dim, align: 'center' });
  edge(P, nx[2], ny, nx[3], ny, r, { stroke: PAL.border, sw: 1.4 });
  P.text((nx[2] + nx[3]) / 2, ny - 8, '1', { size: 9, mono: true, color: PAL.dim, align: 'center' });
  P.alpha(1);

  var str = '0011';
  var idx = Math.min(4, Math.floor(Math.max(0, t - 1.4) / 1.5));
  var live = runNFA(NFA_ENDS011, str.slice(0, idx));

  for (i = 0; i < 4; i++) {
    var on = live.indexOf(['A', 'B', 'C', 'D'][i]) >= 0;
    stateNode(P, nx[i], ny, r, ['A', 'B', 'C', 'D'][i], i === 3, {
      fill: on ? PAL.accentDim : PAL.surface,
      stroke: on ? PAL.accent : PAL.border,
      sw: on ? 2.4 : 1.4
    });
  }

  P.alpha(ease(rev(t, 0.9, 0.8)));
  tape(P, 70, 62, str, 30, 24, t < 1.4 ? 0 : idx, { caption: 'input' });
  P.alpha(1);

  var l = ease(rev(t, 8.4, 0.9));
  P.alpha(l);
  P.text(560, 62, 'THE LIVE SET', { size: 10, mono: true, bold: true, color: PAL.accent });
  var sets = ['{A}', '{A,B}', '{A,C}', '{A,D}'];
  for (i = 0; i < 4; i++) {
    var hot = i === Math.min(idx, 3);
    chip(P, 560, 82 + i * 30, 130, 24, sets[i], {
      size: 11, mono: true,
      fill: hot ? PAL.accentDim : PAL.surface, stroke: hot ? PAL.accent : PAL.border,
      color: hot ? PAL.accent : PAL.ink, bold: hot
    });
  }
  P.text(560, 216, 'one chip per prefix read so far', { size: 9, color: PAL.dim });
  P.alpha(1);

  var e = ease(rev(t, 16.4, 0.9));
  P.alpha(e);
  P.text(24, 246, 'ACCEPTANCE IS EXISTENTIAL', { size: 10, mono: true, bold: true, color: PAL.accent });
  P.text(24, 268, 'the string is in L if any one live state is accepting,', { size: 10, color: PAL.ink });
  P.text(24, 284, 'so {A,D} accepts and {A,C} does not.', { size: 10, color: PAL.ink });
  P.alpha(1);

  var f = ease(rev(t, 20.4, 0.9));
  P.alpha(f);
  box(P, 24, 304, 852, 76, { stroke: PAL.info, fill: PAL.surface2, radius: 5 });
  P.text(40, 316, 'An ε-arrow reads nothing and costs nothing.', { size: 11, bold: true, color: PAL.ink });
  mono(P, 40, 340, 'p0 --ε--> p1 --a--> p2', PAL.ink, 11);
  mono(P, 40, 360, 'ε-closure({p0}) = {p0, p1}', PAL.accent, 11);
  P.text(360, 340, 'so the machine begins in both p0 and p1', { size: 9, color: PAL.dim });
  P.text(360, 360, 'and accepts a, because p1 can read it', { size: 9, color: PAL.dim });
  P.alpha(1);

  takeaway(P, t, 27,
    'Nondeterminism replaces one state with a set of states.',
    'The machine accepts if any one live state is accepting, which is exactly what the next construction exploits.');
};

/* ---------- scene 4: subset construction ---------- */
SCENES.subset = function (P, t) {
  head(P, 'scene 4 - subset construction', 'One DFA state per set');

  /* the NFA, compact */
  var nx = [70, 180, 290, 400], ny = 120, r = 18, i;
  P.alpha(ease(rev(t, 0.3, 0.8)));
  selfLoop(P, nx[0], ny, r, '0,1');
  curve(P, nx[0] + 13, ny - 15, (nx[0] + nx[1]) / 2, ny - 50, nx[1] - 13, ny - 12, { stroke: PAL.border, sw: 1.3 }, 14);
  P.text((nx[0] + nx[1]) / 2, ny - 46, '0', { size: 9, mono: true, color: PAL.dim, align: 'center' });
  edge(P, nx[1], ny, nx[2], ny, r, { stroke: PAL.border, sw: 1.3 });
  P.text((nx[1] + nx[2]) / 2, ny - 7, '1', { size: 9, mono: true, color: PAL.dim, align: 'center' });
  edge(P, nx[2], ny, nx[3], ny, r, { stroke: PAL.border, sw: 1.3 });
  P.text((nx[2] + nx[3]) / 2, ny - 7, '1', { size: 9, mono: true, color: PAL.dim, align: 'center' });
  for (i = 0; i < 4; i++) stateNode(P, nx[i], ny, r, ['A', 'B', 'C', 'D'][i], i === 3, { size: 10 });
  P.text(70, 168, 'the NFA: 4 states, so 2^4 = 16 subsets exist', { size: 9, color: PAL.dim });
  P.alpha(1);

  /* the subset table, filled in one row at a time */
  var tx = 520, ty = 74, cw = 118, rh = 30;
  var built = Math.min(4, Math.max(0, Math.floor((t - 2.0) / 3.6) + 1));
  P.alpha(ease(rev(t, 1.6, 0.8)));
  P.text(tx, ty - 18, 'THE DFA THE CONSTRUCTION BUILDS', { size: 10, mono: true, bold: true, color: PAL.accent });
  chip(P, tx, ty, cw, rh, 'state', { size: 9, color: PAL.dim });
  chip(P, tx + cw, ty, cw, rh, 'on 0', { size: 9, color: PAL.dim });
  chip(P, tx + 2 * cw, ty, cw, rh, 'on 1', { size: 9, color: PAL.dim });
  var subsetD = SUBSET.dfa.delta, names = SUBSET.dfa.states;
  for (i = 0; i < 4; i++) {
    if (i >= built) break;
    var ry = ty + rh + i * rh;
    var acc = SUBSET.dfa.accept.indexOf(names[i]) >= 0;
    chip(P, tx, ry, cw, rh, SUBSET_LABELS[i], {
      size: 9, mono: true, fill: acc ? PAL.validDim : PAL.surface,
      stroke: acc ? PAL.valid : PAL.border, color: acc ? PAL.valid : PAL.ink, bold: acc
    });
    chip(P, tx + cw, ry, cw, rh, SUBSET_LABELS[Number(subsetD[names[i]]['0'].substr(1))], { size: 9, mono: true });
    chip(P, tx + 2 * cw, ry, cw, rh, SUBSET_LABELS[Number(subsetD[names[i]]['1'].substr(1))], { size: 9, mono: true });
  }
  P.alpha(1);

  var c = ease(rev(t, 8.4, 0.9));
  P.alpha(c);
  P.text(24, 200, 'Four reachable subsets out of sixteen.', { size: 12, bold: true, color: PAL.ink });
  P.text(24, 222, 'Every set contains A, because the NFA loops on itself there.', { size: 10, color: PAL.dim });
  P.text(24, 240, 'The other twelve subsets no string can produce, so no', { size: 10, color: PAL.dim });
  P.text(24, 256, 'state is ever built for them.', { size: 10, color: PAL.dim });
  P.alpha(1);

  var d = ease(rev(t, 16.4, 0.9));
  P.alpha(d);
  mono(P, 24, 292, 'an n-state NFA gives at most 2^n DFA states', PAL.accent, 12);
  P.text(24, 314, 'an upper bound on the blow-up, which is why nondeterminism', { size: 10, color: PAL.dim });
  P.text(24, 330, 'can be exponentially more compact than determinism', { size: 10, color: PAL.dim });
  P.alpha(1);

  var e = ease(rev(t, 24.4, 0.9));
  P.alpha(e);
  box(P, 24, 346, 852, 36, { stroke: PAL.warn, fill: PAL.warnDim, radius: 4 });
  P.text(40, 356, 'But it is not a floor: a 4-state NFA can have a 1-state minimal DFA.', { size: 11, bold: true, color: PAL.ink });
  P.alpha(1);

  takeaway(P, t, 26,
    'Subset construction: one DFA state per reachable set of NFA states.',
    '16 subsets exist here, 4 are reachable, and 2^n is a ceiling rather than an answer.');
};

/* ---------- scene 5: counting states ---------- */
SCENES.counting = function (P, t) {
  head(P, 'scene 5 - counting', 'States you cannot avoid');

  var a = ease(rev(t, 0.3, 0.9));
  P.alpha(a);
  P.text(24, 64, 'Two prefixes are DISTINGUISHABLE when some suffix puts', { size: 11, bold: true, color: PAL.ink });
  P.text(24, 82, 'one of them in L and the other out.', { size: 11, bold: true, color: PAL.ink });
  mono(P, 24, 108, 'u ~ v   iff   no suffix separates u and v', PAL.accent, 12);
  P.text(24, 130, 'The classes of this relation ARE the states of the minimal machine.', { size: 10, color: PAL.dim });
  P.alpha(1);

  var b = ease(rev(t, 8.4, 0.9));
  P.alpha(b);
  P.text(24, 164, 'THREE COUNTS THAT COVER MOST PAPERS', { size: 10, mono: true, bold: true, color: PAL.accent });

  /* ends with 10 : three classes */
  var rowY = 186;
  P.text(24, rowY, 'ends with 10', { size: 10, bold: true, color: PAL.ink });
  var cls1 = ['last is not 1', 'ends in 1', 'ends in 10'];
  var i;
  for (i = 0; i < 3; i++) {
    chip(P, 24 + i * 96, rowY + 14, 88, 22, cls1[i], {
      size: 9, mono: false,
      fill: i === 2 ? PAL.validDim : PAL.surface,
      stroke: i === 2 ? PAL.valid : PAL.border,
      color: i === 2 ? PAL.valid : PAL.ink
    });
  }
  P.text(24 + 3 * 96 + 6, rowY + 25, '3', { size: 14, mono: true, bold: true, color: PAL.accent });
  P.alpha(1);

  var c = ease(rev(t, 12.4, 0.9));
  P.alpha(c);
  var row2 = 244;
  P.text(24, row2, 'does not contain 111', { size: 10, bold: true, color: PAL.ink });
  var cls2 = ['run 0', 'run 1', 'run 2', 'dead'];
  for (i = 0; i < 4; i++) {
    chip(P, 24 + i * 74, row2 + 14, 66, 22, cls2[i], {
      size: 9, mono: false,
      fill: i === 3 ? PAL.invalidDim : PAL.validDim,
      stroke: i === 3 ? PAL.invalid : PAL.valid,
      color: i === 3 ? PAL.invalid : PAL.valid
    });
  }
  P.text(24 + 4 * 74 + 6, row2 + 25, '4', { size: 14, mono: true, bold: true, color: PAL.accent });
  P.alpha(1);

  var d = ease(rev(t, 16.4, 0.9));
  P.alpha(d);
  var row3 = 302;
  P.text(24, row3, 'length at least 1', { size: 10, bold: true, color: PAL.ink });
  var cls3 = ['ε', 'anything else'];
  for (i = 0; i < 2; i++) {
    chip(P, 24 + i * 124, row3 + 14, 114, 22, cls3[i], {
      size: 9, mono: false,
      fill: i === 1 ? PAL.validDim : PAL.surface,
      stroke: i === 1 ? PAL.valid : PAL.border,
      color: i === 1 ? PAL.valid : PAL.ink
    });
  }
  P.text(24 + 2 * 124 + 6, row3 + 25, '2', { size: 14, mono: true, bold: true, color: PAL.accent });
  P.alpha(1);

  var e = ease(rev(t, 20.4, 0.9));
  P.alpha(e);
  box(P, 470, 164, 406, 152, { stroke: PAL.info, fill: PAL.surface2, radius: 5 });
  P.text(486, 176, 'Why this is a proof and not a guess', { size: 11, bold: true, color: PAL.ink });
  P.text(486, 198, 'If two prefixes cannot be separated, any correct machine', { size: 10, color: PAL.dim });
  P.text(486, 214, 'must put them in the same state.', { size: 10, color: PAL.dim });
  P.text(486, 236, 'If they can, it must put them in different states.', { size: 10, color: PAL.dim });
  P.text(486, 258, 'So the count is forced: no cleverer design exists.', { size: 10, color: PAL.dim });
  mono(P, 486, 288, 'states = classes', PAL.accent, 12);
  P.alpha(1);

  var f = ease(rev(t, 25.4, 0.9));
  P.alpha(f);
  P.text(24, 356, 'Both answers are in the paper: 2015 Set 2 gives 3, 2023 gives 4.', { size: 10, color: PAL.dim });
  P.text(24, 374, 'Green states accept, red states do not.', { size: 9, color: PAL.dim });
  P.alpha(1);

  takeaway(P, t, 27,
    'A state is a class of prefixes no suffix can tell apart.',
    'Name the distinctions the language forces, and the number of states follows without any drawing.');
};

/* ---------- scene 6: minimisation ---------- */
SCENES.minimise = function (P, t) {
  head(P, 'scene 6 - minimisation', 'Merging what no string can separate');

  var labels = ['ε', 'a', 'b', 'aa', 'ab', 'ba', 'bb'];
  var accept = [false, false, false, false, false, true, true];
  var i, x, y;

  var a = ease(rev(t, 0.3, 0.9));
  P.alpha(a);
  P.text(24, 64, 'Remember the last two symbols: 1 + 2 + 4 = 7 states', { size: 11, bold: true, color: PAL.ink });
  for (i = 0; i < 7; i++) {
    x = 34 + i * 64;
    y = 108;
    var merged = -1;
    for (var k = 0; k < MIDB_CLASSES.length; k++) {
      if (MIDB_CLASSES[k].indexOf('q' + i) >= 0) merged = k;
    }
    var mark = t >= 17 ? [0, 0, 1, 0, 1, 2, 3][i] : -1;
    var showMerge = t >= 17.4;
    var colour = [PAL.border, PAL.border, PAL.border];
    if (showMerge && mark >= 0) {
      colour = [PAL.accent, PAL.warn, PAL.valid, PAL.info];
    }
    chip(P, x, y, 54, 30, labels[i] === 'ε' ? 'ε' : labels[i], {
      size: 12, mono: true,
      fill: accept[i] ? PAL.validDim : PAL.surface,
      stroke: showMerge && mark >= 0 ? colour[mark] : (accept[i] ? PAL.valid : PAL.border),
      sw: showMerge && mark >= 0 ? 2.4 : 1.3,
      color: accept[i] ? PAL.valid : PAL.ink, bold: accept[i]
    });
    P.text(x + 27, y + 40, 'q' + i, { size: 8, mono: true, color: PAL.dim, align: 'center' });
  }
  P.text(24, 158, 'green = accepting, so ba and bb are in L', { size: 9, color: PAL.dim });
  P.alpha(1);

  var b = ease(rev(t, 8.4, 0.9));
  P.alpha(b);
  P.text(24, 192, 'TABLE FILLING', { size: 10, mono: true, bold: true, color: PAL.accent });
  P.text(24, 212, 'round 0: mark every pair that differs on acceptance', { size: 10, color: PAL.ink });
  P.text(24, 230, 'then: mark any pair whose two states lead to a marked pair', { size: 10, color: PAL.ink });
  P.text(24, 248, 'stop when a whole pass marks nothing', { size: 10, color: PAL.ink });
  P.alpha(1);

  /* the triangular table: 21 cells */
  var t0x = 24, t0y = 256, cs = 26;
  var pairIndex = [];
  var pi = 0;
  var j;
  for (i = 0; i < 7; i++) for (j = 0; j < i; j++) pairIndex.push([i, j]);
  var revealed = Math.floor(Math.max(0, t - 9.4) * 4);
  for (i = 0; i < pairIndex.length; i++) {
    var col = i % 7, row = Math.floor(i / 7);
    var cx = t0x + col * (cs + 2), cy = t0y + row * (cs + 2);
    var ii = pairIndex[i][0], jj = pairIndex[i][1];
    var isDist = M_MIDB_MIN.table[
      M_MIDB_MIN.reachable.indexOf('q' + ii)
    ][M_MIDB_MIN.reachable.indexOf('q' + jj)];
    var shown = i < revealed;
    P.rect(cx, cy, cs, cs, {
      fill: !shown ? PAL.surface2 : (isDist ? PAL.invalidDim : PAL.validDim),
      stroke: !shown ? PAL.border : (isDist ? PAL.invalid : PAL.valid), sw: 1.2, radius: 3
    });
    P.text(cx + cs / 2, cy + cs / 2, !shown ? '' : (isDist ? '×' : '='),
           { size: 12, mono: true, align: 'center', base: 'middle',
             color: isDist ? PAL.invalid : PAL.valid, bold: true });
  }
  P.text(t0x, t0y + 3 * (cs + 2) + 6, '× = distinguishable, = = mergeable', { size: 9, color: PAL.dim });

  var c = ease(rev(t, 17.4, 0.9));
  P.alpha(c);
  box(P, 470, 192, 406, 148, { stroke: PAL.info, fill: PAL.surface2, radius: 5 });
  P.text(486, 204, 'Four classes survive', { size: 11, bold: true, color: PAL.ink });
  mono(P, 486, 228, '{ ε, a, aa }', PAL.accent, 11);
  mono(P, 486, 248, '{ b, ab }', PAL.accent, 11);
  mono(P, 486, 268, '{ ba }   accepting', PAL.valid, 11);
  mono(P, 486, 288, '{ bb }   accepting', PAL.valid, 11);
  P.text(486, 312, 'The quotient was compared with the original on all', { size: 9, color: PAL.dim });
  P.text(486, 326, '1023 strings of length at most nine, and agreed.', { size: 9, color: PAL.dim });
  P.alpha(1);

  var d = ease(rev(t, 24.4, 0.9));
  P.alpha(d);
  P.text(24, 362, 'GATE CSE 2017 Set 1: the smallest machine for (a+b)*b(a+b) has 4 states.', { size: 10, bold: true, color: PAL.accent });
  P.alpha(1);

  takeaway(P, t, 26,
    'Mark what differs, propagate, and read off the classes.',
    'Seven states became four, and the four are provably necessary, not merely sufficient.');
};

/* ---------- scene 7: modulo counters ---------- */
SCENES.modulo = function (P, t) {
  head(P, 'scene 7 - counters', 'Counters multiply; the answer is the lcm');

  var i, j;
  var a = ease(rev(t, 0.3, 0.9));
  P.alpha(a);
  P.text(24, 64, 'One counter modulo 2 costs two states; modulo 3 costs three.', { size: 11, bold: true, color: PAL.ink });
  P.text(24, 84, 'Both at once costs the pairs: 2 x 3 = 6.', { size: 11, bold: true, color: PAL.ink });
  P.alpha(1);

  /* the 2 x 3 grid */
  var gx = 60, gy = 128, cw = 118, ch = 44;
  var b = ease(rev(t, 4.4, 0.9));
  P.alpha(b);
  P.text(gx, gy - 16, 'count of a  mod 6', { size: 9, mono: true, color: PAL.dim });
  var count = Math.min(6, Math.floor(Math.max(0, t - 5.0) / 1.6));
  for (i = 0; i < 6; i++) {
    var col = i % 3, row = Math.floor(i / 3);
    var x = gx + col * (cw + 8), y = gy + row * (ch + 8);
    var isAcc = M_MOD6.accept.indexOf('q' + i) >= 0;
    var hot = i === count;
    chip(P, x, y, cw, ch, 'a\'s ≡ ' + i + ' (mod 6)', {
      size: 10, mono: true,
      fill: hot ? PAL.accentDim : (isAcc ? PAL.validDim : PAL.surface),
      stroke: hot ? PAL.accent : (isAcc ? PAL.valid : PAL.border),
      sw: hot ? 2.4 : 1.3,
      color: isAcc ? PAL.valid : PAL.ink, bold: isAcc || hot
    });
  }
  P.text(gx, gy + 2 * (ch + 8) + 6, 'green = accepting: residues 2 and 4, not 0', { size: 9, color: PAL.dim });
  P.alpha(1);

  var c = ease(rev(t, 12.4, 0.9));
  P.alpha(c);
  P.text(470, 112, 'WHY SIX AND NOT FIVE', { size: 10, mono: true, bold: true, color: PAL.accent });
  P.text(470, 134, 'The pair (count mod 2, count mod 3) is the state.', { size: 10, color: PAL.ink });
  P.text(470, 152, 'There are 2 x 3 such pairs, and the count mod 6', { size: 10, color: PAL.ink });
  P.text(470, 170, 'is the same information written as one number.', { size: 10, color: PAL.ink });
  mono(P, 470, 198, 'states = lcm(2, 3) = 6', PAL.accent, 12);
  P.text(470, 220, 'Residue 0 is divisible by both, so it is excluded', { size: 9, color: PAL.dim });
  P.text(470, 236, 'by the words "but not". That single mark decides it.', { size: 9, color: PAL.dim });
  P.alpha(1);

  var d = ease(rev(t, 17.4, 0.9));
  P.alpha(d);
  P.text(470, 266, 'PRODUCT MOD 7 OVER {1,2,3,4}', { size: 10, mono: true, bold: true, color: PAL.accent });
  for (i = 0; i < 6; i++) {
    var px = 470 + (i % 6) * 68;
    chip(P, px, 286, 60, 30, String(i + 1), {
      size: 12, mono: true,
      fill: i === 1 ? PAL.validDim : PAL.surface,
      stroke: i === 1 ? PAL.valid : PAL.border,
      color: i === 1 ? PAL.valid : PAL.ink, bold: i === 1
    });
  }
  P.text(470, 330, 'residue 2 accepts; residue 0 is unreachable, so 6 not 7', { size: 9, color: PAL.dim });
  P.alpha(1);

  var e = ease(rev(t, 24.4, 0.9));
  P.alpha(e);
  P.text(24, 356, '2020 asks for "divisible by 2 but not by 3": 6.  2025 Set 2 asks for a product mod 7: 6.', { size: 10, color: PAL.dim });
  P.alpha(1);

  takeaway(P, t, 26,
    'Independent counters multiply, so the size is the product and the minimum divides it.',
    'A condition on a count modulo m costs m states; two such conditions cost m times n before minimising.');
};

/* ---------- scene 8: regular expressions ---------- */
SCENES.regex = function (P, t) {
  head(P, 'scene 8 - expressions', 'Three operations, then Thompson');

  var i;
  var a = ease(rev(t, 0.3, 0.9));
  P.alpha(a);
  P.text(24, 64, 'UNION  a + b', { size: 10, mono: true, bold: true, color: PAL.accent });
  P.circle(44, 100, 10, { stroke: PAL.border, sw: 1.5 });
  P.line(54, 100, 74, 88, { stroke: PAL.border, sw: 1.4 });
  P.line(54, 100, 74, 112, { stroke: PAL.border, sw: 1.4 });
  P.circle(84, 88, 8, { stroke: PAL.border, sw: 1.4 });
  P.circle(84, 112, 8, { stroke: PAL.border, sw: 1.4 });
  P.text(24, 134, 'either branch, and a new exit both reach', { size: 9, color: PAL.dim });

  P.text(24, 164, 'CONCATENATION  ab', { size: 10, mono: true, bold: true, color: PAL.accent });
  P.circle(44, 198, 10, { stroke: PAL.border, sw: 1.5 });
  P.arrow(54, 198, 76, 198, { stroke: PAL.border, sw: 1.4 });
  P.circle(88, 198, 10, { stroke: PAL.border, sw: 1.5 });
  P.text(24, 226, 'the fragments are fused, so no new states', { size: 9, color: PAL.dim });

  P.text(24, 256, 'STAR  a*', { size: 10, mono: true, bold: true, color: PAL.accent });
  P.circle(44, 290, 10, { stroke: PAL.border, sw: 1.5 });
  P.circle(96, 290, 10, { stroke: PAL.border, sw: 1.5 });
  P.arrow(54, 290, 86, 290, { stroke: PAL.border, sw: 1.4 });
  curve(P, 96, 278, 70, 250, 44, 278, { stroke: PAL.border, sw: 1.4 }, 16);
  P.text(24, 318, 'a bypass arrow is what makes it zero or more', { size: 9, color: PAL.dim });
  P.alpha(1);

  var b = ease(rev(t, 8.4, 0.9));
  P.alpha(b);
  P.text(430, 64, 'THOMPSON: WHAT EACH PIECE COSTS', { size: 10, mono: true, bold: true, color: PAL.accent });
  var rows = [
    ['a symbol', '2 states, 1 arrow'],
    ['the empty string', '2 states, 1 ε-arrow'],
    ['union  r + s', '+2 states, up to 4 ε-arrows'],
    ['star  r*', '+2 states, up to 4 ε-arrows'],
    ['concatenation  rs', '+0 states, fused at a shared state']
  ];
  for (i = 0; i < rows.length; i++) {
    var ry = 88 + i * 26;
    P.text(430, ry, rows[i][0], { size: 10, mono: true, color: PAL.ink });
    P.text(620, ry, rows[i][1], { size: 10, color: PAL.dim });
  }
  P.alpha(1);

  var c = ease(rev(t, 16.4, 0.9));
  P.alpha(c);
  box(P, 430, 232, 446, 96, { stroke: PAL.info, fill: PAL.surface2, radius: 5 });
  P.text(446, 244, '(a|b)*abb, built piece by piece', { size: 11, bold: true, color: PAL.ink });
  mono(P, 446, 268, 'a 2  +  b 2  +  union 2  +  star 2  +  abb 6', PAL.ink, 10);
  mono(P, 446, 292, '2 + 2 + 2 + 2 + 6 = 14 states', PAL.accent, 12);
  P.text(446, 314, 'and it accepts exactly the strings ending abb', { size: 9, color: PAL.dim });
  P.alpha(1);

  var d = ease(rev(t, 24.4, 0.9));
  P.alpha(d);
  P.text(24, 350, 'Thompson output is correct but never minimal. Minimise it afterwards.', { size: 10, bold: true, color: PAL.accent });
  P.text(24, 368, 'The construction never inspects the expression, only its shape.', { size: 9, color: PAL.dim });
  P.alpha(1);

  takeaway(P, t, 26,
    'Union branches, concatenation joins, star loops back.',
    'Thompson gives every operation its own two-state wrapper; (a|b)*abb costs 14 states, checked on 511 strings.');
};

/* ---------- scene 9: elimination and closure ---------- */
SCENES.closure = function (P, t) {
  head(P, 'scene 9 - elimination and closure', 'From a picture to an expression');

  var a = ease(rev(t, 0.3, 0.9));
  P.alpha(a);
  P.text(24, 64, 'STATE ELIMINATION', { size: 10, mono: true, bold: true, color: PAL.accent });
  mono(P, 24, 90, 'R(i,j) := R(i,j) + R(i,k) R(k,k)* R(k,j)', PAL.ink, 11);
  P.text(24, 108, 'delete k, and every path through k is folded into the', { size: 10, color: PAL.dim });
  P.text(24, 124, 'arc that survives. Repeat until one arc is left.', { size: 10, color: PAL.dim });
  P.alpha(1);

  /* the two-state machine */
  var b = ease(rev(t, 4.4, 0.9));
  P.alpha(b);
  var ex = 90, ey = 212, r = 22;
  selfLoop(P, ex, ey, r, '0');
  selfLoop(P, ex + 130, ey, r, '0');
  curve(P, ex + 18, ey - 16, (ex + ex + 130) / 2, ey - 60, ex + 130 - 18, ey - 16, { stroke: PAL.border, sw: 1.4 }, 18);
  P.text((ex + ex + 130) / 2, ey - 54, '1', { size: 9, mono: true, color: PAL.dim, align: 'center' });
  curve(P, ex + 130 - 18, ey + 16, (ex + ex + 130) / 2, ey + 60, ex + 18, ey + 16, { stroke: PAL.border, sw: 1.4 }, 18);
  P.text((ex + ex + 130) / 2, ey + 54, '1', { size: 9, mono: true, color: PAL.dim, align: 'center' });
  stateNode(P, ex, ey, r, 'even', true, { size: 9 });
  var gone = t >= 8.4;
  P.alpha(gone ? 0.25 : 1);
  stateNode(P, ex + 130, ey, r, 'odd', false, { size: 9 });
  P.alpha(1);
  P.text(ex + 130, ey + 40, gone ? 'deleted' : 'not accepting', { size: 9, color: gone ? PAL.invalid : PAL.dim, align: 'center' });
  P.alpha(1);

  var c = ease(rev(t, 8.4, 0.9));
  P.alpha(c);
  mono(P, 24, 278, RE_EVEN1, PAL.accent, 14);
  P.text(24, 300, 'the odd state is gone, and its loop became the 0* inside', { size: 9, color: PAL.dim });
  P.alpha(1);

  var d = ease(rev(t, 12.4, 0.9));
  P.alpha(d);
  P.text(470, 64, 'CLOSURE, AND WHAT EACH COSTS', { size: 10, mono: true, bold: true, color: PAL.accent });
  var rows = [
    ['union', 'product machine, accept if either'],
    ['intersection', 'product machine, accept if both'],
    ['complement', 'flip marks of a complete DFA, no new states'],
    ['concatenation', 'ε-NFA, then subset construction'],
    ['star', 'ε-NFA, then subset construction']
  ];
  var i;
  for (i = 0; i < rows.length; i++) {
    P.text(470, 88 + i * 26, rows[i][0], { size: 10, mono: true, color: PAL.ink });
    P.text(580, 88 + i * 26, rows[i][1], { size: 10, color: PAL.dim });
  }
  P.alpha(1);

  var e = ease(rev(t, 18.4, 0.9));
  P.alpha(e);
  box(P, 470, 228, 406, 104, { stroke: PAL.info, fill: PAL.surface2, radius: 5 });
  P.text(486, 240, 'The product, counted', { size: 11, bold: true, color: PAL.ink });
  P.text(486, 262, 'ends with 10 has 3 states; contains 011 has 4.', { size: 10, color: PAL.dim });
  P.text(486, 280, 'The pair machine has at most 3 x 4 = 12 states,', { size: 10, color: PAL.dim });
  P.text(486, 296, 'and exactly 8 of those pairs are reachable.', { size: 10, color: PAL.dim });
  mono(P, 486, 320, 'complement: 3 states in, 3 states out', PAL.accent, 10);
  P.alpha(1);

  var f = ease(rev(t, 24.4, 0.9));
  P.alpha(f);
  P.text(24, 332, 'Complement only works on a complete deterministic machine.', { size: 10, bold: true, color: PAL.warn });
  P.text(24, 350, 'On an NFA, flipping the accepting states gives a different', { size: 10, color: PAL.dim });
  P.text(24, 366, 'language altogether, not the complement.', { size: 10, color: PAL.dim });
  P.alpha(1);

  takeaway(P, t, 26,
    'Elimination recovers an expression; products and complements decide membership.',
    'Union and intersection cost at most the product of the two sizes; complement costs nothing extra.');
};

/* ---------- scene 10: the pumping lemma ---------- */
SCENES.pumping = function (P, t) {
  head(P, 'scene 10 - the pumping lemma', 'Why a finite machine cannot count');

  var p = 5, i;
  var a = ease(rev(t, 0.3, 0.9));
  P.alpha(a);
  P.text(24, 64, 'With p states, the p+1 prefixes of a long string must share a state.', { size: 11, bold: true, color: PAL.ink });
  P.text(24, 84, 'That is a pigeonhole, and it forces a repeat.', { size: 10, color: PAL.dim });
  P.alpha(1);

  /* the string a^p b^p as two runs */
  var b = ease(rev(t, 4.4, 0.9));
  P.alpha(b);
  var sx = 24, sy = 108, cw = 26, chh = 26;
  for (i = 0; i < 2 * p; i++) {
    var ch = i < p ? 'a' : 'b';
    var inY = t >= 12.4 && i >= 1 && i < 3;
    P.rect(sx + i * cw, sy, cw, chh, {
      fill: inY ? PAL.warnDim : PAL.surface,
      stroke: inY ? PAL.warn : PAL.border, sw: inY ? 2 : 1.2, radius: 3
    });
    P.text(sx + i * cw + cw / 2, sy + chh / 2, ch,
           { size: 12, mono: true, color: inY ? PAL.warn : PAL.ink, align: 'center', base: 'middle' });
  }
  P.text(sx, sy + chh + 8, 'a^p b^p', { size: 10, mono: true, color: PAL.ink });
  P.text(sx + 2 * p * cw + 12, sy + 8, 'in L', { size: 10, color: PAL.valid, bold: true });
  P.alpha(1);

  var c = ease(rev(t, 12.4, 0.9));
  P.alpha(c);
  P.text(24, 178, 'x = a,  y = aa,  z = a^2 b^p', { size: 10, mono: true, color: PAL.warn });
  P.text(24, 198, 'The two ends of y are the same state, so y can be repeated.', { size: 10, color: PAL.ink });
  P.alpha(1);

  var d = ease(rev(t, 16.4, 0.9));
  P.alpha(d);
  P.text(24, 228, 'PUMP y TO ZERO', { size: 10, mono: true, bold: true, color: PAL.accent });
  for (i = 0; i < 2 * p - 2; i++) {
    var ch2 = i < p - 2 ? 'a' : 'b';
    P.rect(sx + i * cw, 246, cw, chh, { fill: PAL.surface, stroke: PAL.border, sw: 1.2, radius: 3 });
    P.text(sx + i * cw + cw / 2, 246 + chh / 2, ch2,
           { size: 12, mono: true, color: PAL.ink, align: 'center', base: 'middle' });
  }
  P.text(sx + (2 * p - 2) * cw + 12, 254, 'not in L', { size: 10, color: PAL.invalid, bold: true });
  P.text(24, 292, 'fewer a\'s than b\'s, so the balance is broken', { size: 9, color: PAL.dim });
  P.alpha(1);

  var e = ease(rev(t, 22.4, 0.9));
  P.alpha(e);
  box(P, 470, 100, 406, 152, { stroke: PAL.info, fill: PAL.surface2, radius: 5 });
  P.text(486, 112, 'The four-step procedure', { size: 11, bold: true, color: PAL.ink });
  P.text(486, 136, '1.  assume the language is regular, with length p', { size: 10, color: PAL.dim });
  P.text(486, 156, '2.  choose a string in L, longer than p', { size: 10, color: PAL.dim });
  P.text(486, 176, '3.  show every split xyz fails for some k', { size: 10, color: PAL.dim });
  P.text(486, 196, '4.  the assumption was false', { size: 10, color: PAL.dim });
  P.text(486, 224, 'The lemma refutes; it never certifies.', { size: 10, color: PAL.warn, bold: true });
  P.alpha(1);

  var f = ease(rev(t, 27.4, 0.9));
  P.alpha(f);
  P.text(470, 272, 'FIVE TRAPS', { size: 10, mono: true, bold: true, color: PAL.invalid });
  P.text(470, 292, 'contains vs ends with  ·  a missing dead state  ·  rounding', { size: 9, color: PAL.dim });
  P.text(470, 308, 'a count down  ·  merging unreachable states  ·  reading', { size: 9, color: PAL.dim });
  P.text(470, 324, '2^n as a floor instead of a ceiling', { size: 9, color: PAL.dim });
  P.alpha(1);

  takeaway(P, t, 28,
    'Finitely many states means a long string must revisit one.',
    'Repeating the loop between the two visits is legal, and for a^n b^n it breaks the balance, so no machine exists.');
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
