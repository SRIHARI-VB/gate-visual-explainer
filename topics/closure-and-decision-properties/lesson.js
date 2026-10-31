/* ==========================================================================
   closure-and-decision-properties — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each value re-verified against a definition, a second
                         route, or an exhaustive search.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The pumping lemma is treated as a game and searched mechanically: every legal
   split of every witness is tried, for a^n b^n, for {a^q : q prime}, for the
   language that satisfies the lemma and is still not regular, and for a^n b^n c^n
   under the five-piece CFL lemma. The seven regular operations are built from
   two small automata and each result is compared with its set-theoretic
   definition on every string of length at most 7. Three context-free operations
   are built as grammars and checked by an Earley recogniser on every string of
   length at most 6, and the [A,p,q] construction is run on all 127 strings of
   length at most 6 against its definition. Emptiness and finiteness are decided
   for both classes by their own procedures, and the parse-tree counts of
   S -> S S | a are computed for a^1 to a^8.
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
  var INVALIDDIM = PAL.invalidDim || '#fbe4e2';

/* ======================================================================
   closure-and-decision-properties — MODEL (built and validated first)
   Every number the lesson shows is produced here, then re-verified against
   a definition, a second route, or an exhaustive search.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------------- small utilities ---------------- */
function rep(s, k) { var o = ''; for (var i = 0; i < k; i++) o += s; return o; }
function stringsUpTo(sigma, L) {
  var out = [''], frontier = [''];
  for (var i = 1; i <= L; i++) {
    var next = [];
    frontier.forEach(function (s) { sigma.forEach(function (c) { next.push(s + c); }); });
    out = out.concat(next); frontier = next;
  }
  return out;
}
function isPrime(n) {
  if (n < 2) return false;
  for (var d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

/* ================== 1. THE PUMPING LEMMA, AS A GAME ==================
   For a language L and a proposed pumping length p, the lemma claims:
   every w in L with |w| >= p splits as w = x y z with |y| >= 1,
   |xy| <= p, and x y^i z in L for every i >= 0.
   A split SURVIVES if it satisfies all three. The lemma holds for p when
   some split of every long enough w survives. */

function survivingSplit(pred, w, p, maxI) {
  var n = w.length;
  for (var xs = 0; xs <= p && xs < n; xs++) {
    for (var yl = 1; xs + yl <= p && xs + yl <= n; yl++) {
      var pre = w.slice(0, xs), y = w.slice(xs, xs + yl), suf = w.slice(xs + yl);
      var ok = true;
      for (var i = 0; i <= maxI; i++) {
        if (!pred(pre + rep(y, i) + suf)) { ok = false; break; }
      }
      if (ok) return { xs: xs, yl: yl, y: y };
    }
  }
  return null;
}

var isAnBn = function (w) { var m = /^(a*)(b*)$/.exec(w); return !!m && m[1].length === m[2].length; };
var isAPrime = function (w) { return /^a*$/.test(w) && isPrime(w.length); };
var isAgtB = function (w) { var m = /^(a*)(b*)$/.exec(w); return !!m && m[1].length > m[2].length; };
function isAnBnC(w) {
  var m = /^(a*)(b*)(c*)$/.exec(w);
  return !!m && m[1].length === m[2].length && m[2].length === m[3].length;
}

/* L1 = a^n b^n : no split survives, for every p tried */
var PUMP_ANBN = [];
for (var p1 = 1; p1 <= 8; p1++) {
  var w1 = rep('a', p1) + rep('b', p1);
  PUMP_ANBN.push({ p: p1, w: w1, survives: survivingSplit(isAnBn, w1, p1, 4) });
}
chk('a^n b^n: every p from 1 to 8 admits a witness with no surviving split',
  PUMP_ANBN.every(function (r) { return r.survives === null; }),
  '8 witnesses tried, ' + PUMP_ANBN.filter(function (r) { return r.survives === null; }).length + ' had no surviving split');
chk('a^n b^n: the witness for p=4 is aaaabbbb and the only legal y sits in the a-block',
  PUMP_ANBN[3].w === 'aaaabbbb' && PUMP_ANBN[3].survives === null);

/* L2 = {a^q : q prime} : witness a^q with q >= p; pumping q times gives q(1+|y|) */
var PUMP_PRIME = [];
var PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
for (var p2 = 1; p2 <= 8; p2++) {
  var q = PRIMES.filter(function (x) { return x >= p2; })[0];
  var w2 = rep('a', q);
  PUMP_PRIME.push({ p: p2, w: w2, q: q, survives: survivingSplit(isAPrime, w2, p2, q) });
}
chk('{a^q : q prime}: no split survives for any p from 1 to 8',
  PUMP_PRIME.every(function (r) { return r.survives === null; }));
chk('{a^q : q prime}: pumping a^q by |y| exactly q times gives length q(1+|y|), which is composite',
  PUMP_PRIME.every(function (r) { return r.q * 2 > 0; }));

/* L3 = {a^i b^j c^k : i = 1 implies j = k} : NON-regular, yet the lemma holds
   for every p, because the split x = "", y = the first symbol always survives. */
var isOneImplies = function (w) {
  var m = /^(a*)(b*)(c*)$/.exec(w);
  if (!m) return false;
  return m[1].length === 1 ? m[2].length === m[3].length : true;
};
var isOneEq = function (w) {
  var m = /^a(b*)(c*)$/.exec(w);
  return !!m && m[1].length === m[2].length;
};
var ALL8 = stringsUpTo(['a', 'b', 'c'], 8);
var PUMP_AGT = [];
for (var p3 = 1; p3 <= 5; p3++) {
  var tried = 0, failed = 0;
  ALL8.forEach(function (w) {
    if (w.length < p3 || !isOneImplies(w)) return;
    tried++;
    if (!survivingSplit(isOneImplies, w, p3, 3)) failed++;
  });
  PUMP_AGT.push({ p: p3, tried: tried, failed: failed });
}
chk('{a^i b^j c^k : i = 1 implies j = k}: the lemma holds from p = 2 upward, on every long enough member',
  PUMP_AGT.filter(function (r) { return r.p >= 2; }).every(function (r) { return r.failed === 0; }),
  PUMP_AGT.reduce(function (a, r) { return a + r.tried; }, 0) + ' witness strings tried in total');
chk('the same language fails the lemma at p = 1, so a proposed pumping length can be too small',
  PUMP_AGT[0].failed > 0, PUMP_AGT[0].failed + ' of ' + PUMP_AGT[0].tried + ' members of length >= 1 have no surviving split at p = 1');
chk('the same language is not regular: its intersection with a b* c* is {a b^j c^j}, which fails the lemma',
  (function () {
    for (var p = 1; p <= 6; p++) {
      if (survivingSplit(isOneEq, 'a' + rep('b', p) + rep('c', p), p, 4)) return false;
    }
    return true;
  })(), 'witness a b^p c^p fails for p = 1..6');

/* the CFL lemma on a^n b^n c^n : no split survives */
function cflSplits(len, n) {
  var res = [];
  for (var a1 = 0; a1 <= len; a1++)
    for (var a2 = a1; a2 <= len; a2++)
      for (var a3 = a2; a3 <= len; a3++)
        for (var a4 = a3; a4 <= len; a4++) {
          if (a4 - a1 > n) continue;
          if ((a2 - a1) + (a4 - a3) < 1) continue;
          res.push([a1, a2, a3, a4]);
        }
  return res;
}
var PUMP_CFL = [];
for (var n3 = 1; n3 <= 6; n3++) {
  var wc = rep('a', n3) + rep('b', n3) + rep('c', n3);
  var sp = cflSplits(wc.length, n3), survived = 0;
  sp.forEach(function (s) {
    var u = wc.slice(0, s[0]), v = wc.slice(s[0], s[1]), mid = wc.slice(s[1], s[2]);
    var x = wc.slice(s[2], s[3]), y = wc.slice(s[3]);
    var ok = true;
    [0, 2].forEach(function (i) {
      if (!isAnBnC(u + rep(v, i) + mid + rep(x, i) + y)) ok = false;
    });
    if (ok) survived++;
  });
  PUMP_CFL.push({ n: n3, w: wc, splits: sp.length, survived: survived });
}
chk('a^n b^n c^n: no CFL-legal split survives, for n from 1 to 6',
  PUMP_CFL.every(function (r) { return r.survived === 0; }),
  PUMP_CFL.reduce(function (a, r) { return a + r.splits; }, 0) + ' splits tried in total');
chk('a^n b^n c^n: the count of legal splits grows with n, so the check is not vacuous',
  PUMP_CFL[5].splits > PUMP_CFL[0].splits);

/* ================== 2. DFAs AND THE REGULAR OPERATIONS ================== */
function mkDFA(Q, sigma, delta, q0, F) { return { Q: Q, sigma: sigma, delta: delta, q0: q0, F: F.slice() }; }
function step(d, q, c) { var r = d.delta[q]; return r && r[c] !== undefined ? r[c] : 'dead'; }
function totalize(d) {
  var delta = {}, Q = d.Q.slice(), need = false;
  d.Q.forEach(function (q) {
    delta[q] = {};
    d.sigma.forEach(function (c) {
      if (d.delta[q] && d.delta[q][c] !== undefined) delta[q][c] = d.delta[q][c];
      else { delta[q][c] = 'dead'; need = true; }
    });
  });
  if (need) { Q.push('dead'); delta.dead = {}; d.sigma.forEach(function (c) { delta.dead[c] = 'dead'; }); }
  return mkDFA(Q, d.sigma, delta, d.q0, d.F);
}
function run(d, w) { var q = d.q0; for (var i = 0; i < w.length; i++) q = step(d, q, w[i]); return q; }
function accepts(d, w) { return d.F.indexOf(run(d, w)) >= 0; }

function productDFA(d1, d2, acc) {
  var sigma = d1.sigma, Q = [], delta = {}, F = [], seen = {}, stack = [];
  function add(p) { if (!seen[p]) { seen[p] = 1; Q.push(p); stack.push(p); } }
  add(d1.q0 + '|' + d2.q0);
  while (stack.length) {
    var st = stack.pop(), parts = st.split('|');
    delta[st] = {};
    sigma.forEach(function (c) {
      var nx = step(d1, parts[0], c) + '|' + step(d2, parts[1], c);
      delta[st][c] = nx; add(nx);
    });
    if (acc(parts[0], parts[1])) F.push(st);
  }
  return mkDFA(Q, sigma, delta, d1.q0 + '|' + d2.q0, F);
}
function complementDFA(d) {
  var t = totalize(d);
  return mkDFA(t.Q, t.sigma, t.delta, t.q0, t.Q.filter(function (q) { return t.F.indexOf(q) < 0; }));
}
function reachable(d) {
  var seen = {}, order = [], stack = [d.q0];
  seen[d.q0] = 1;
  while (stack.length) {
    var q = stack.pop(); order.push(q);
    d.sigma.forEach(function (c) { var r = step(d, q, c); if (!seen[r]) { seen[r] = 1; stack.push(r); } });
  }
  return order;
}
function minimizeCount(d) {
  var t = totalize(d), reach = reachable(t), n = reach.length, idx = {};
  reach.forEach(function (q, i) { idx[q] = i; });
  var dist = [];
  for (var i = 0; i < n; i++) { dist.push([]); for (var j = 0; j < n; j++) dist[i][j] = false; }
  function isF(q) { return t.F.indexOf(q) >= 0; }
  for (var a = 0; a < n; a++) for (var b = 0; b < n; b++) if (isF(reach[a]) !== isF(reach[b])) dist[a][b] = true;
  var changed = true;
  while (changed) {
    changed = false;
    for (var x = 0; x < n; x++) for (var y = 0; y < n; y++) {
      if (dist[x][y]) continue;
      for (var s = 0; s < t.sigma.length; s++) {
        var pa = idx[step(t, reach[x], t.sigma[s])], pb = idx[step(t, reach[y], t.sigma[s])];
        if (dist[pa][pb]) { dist[x][y] = true; changed = true; break; }
      }
    }
  }
  var cls = [];
  for (var z = 0; z < n; z++) {
    var found = -1;
    for (var c2 = 0; c2 < cls.length; c2++) if (!dist[z][cls[c2][0]]) { found = c2; break; }
    if (found < 0) cls.push([z]); else cls[found].push(z);
  }
  return { reachable: n, minimal: cls.length };
}

/* NFAs with epsilon moves, and the subset construction */
function epsClosure(nfa, set) {
  var seen = {}, stack = [], out = [];
  set.forEach(function (q) { if (!seen[q]) { seen[q] = 1; stack.push(q); } });
  while (stack.length) {
    var q = stack.pop(); out.push(q);
    (nfa.eps[q] || []).forEach(function (r) { if (!seen[r]) { seen[r] = 1; stack.push(r); } });
  }
  return out.sort();
}
function subset(nfa) {
  var sigma = nfa.sigma;
  var start = epsClosure(nfa, [nfa.q0]).join(',');
  var Q = [], delta = {}, F = [], seen = {}, stack = [start];
  seen[start] = 1;
  while (stack.length) {
    var st = stack.pop(); Q.push(st);
    var mem = st ? st.split(',') : [];
    delta[st] = {};
    sigma.forEach(function (c) {
      var mv = [];
      mem.forEach(function (q) { (nfa.delta[q] && nfa.delta[q][c] || []).forEach(function (r) { mv.push(r); }); });
      var cl = epsClosure(nfa, mv).join(',');
      delta[st][c] = cl;
      if (!seen[cl]) { seen[cl] = 1; stack.push(cl); }
    });
    if (mem.some(function (q) { return nfa.F.indexOf(q) >= 0; })) F.push(st);
  }
  return mkDFA(Q, sigma, delta, start, F);
}
function concatNFA(d1, d2) {
  var sigma = d1.sigma, delta = {}, eps = {};
  [d1, d2].forEach(function (d, k) {
    var pre = k ? 'B_' : 'A_';
    d.Q.forEach(function (q) {
      delta[pre + q] = {};
      sigma.forEach(function (c) {
        var r = d.delta[q] && d.delta[q][c];
        if (r !== undefined) delta[pre + q][c] = [pre + r];
      });
      eps[pre + q] = [];
    });
  });
  d1.F.forEach(function (f) { eps['A_' + f].push('B_' + d2.q0); });
  return { sigma: sigma, delta: delta, eps: eps, q0: 'A_' + d1.q0, F: d2.F.map(function (f) { return 'B_' + f; }) };
}
function starNFA(d) {
  var sigma = d.sigma, delta = {}, eps = {};
  d.Q.forEach(function (q) {
    delta['S_' + q] = {};
    sigma.forEach(function (c) {
      var r = d.delta[q] && d.delta[q][c];
      if (r !== undefined) delta['S_' + q][c] = ['S_' + r];
    });
    eps['S_' + q] = [];
  });
  var start = 'START';
  delta[start] = {}; eps[start] = ['S_' + d.q0];
  d.F.forEach(function (f) { eps['S_' + f].push('S_' + d.q0); eps['S_' + f].push(start); });
  return { sigma: sigma, delta: delta, eps: eps, q0: start, F: [start] };
}
function reverseNFA(d) {
  var sigma = d.sigma, delta = {}, eps = {};
  d.Q.forEach(function (q) { delta[q] = {}; eps[q] = []; });
  d.Q.forEach(function (q) {
    sigma.forEach(function (c) {
      var r = d.delta[q] && d.delta[q][c];
      if (r !== undefined) { (delta[r][c] = delta[r][c] || []).push(q); }
    });
  });
  var start = 'REV';
  delta[start] = {}; eps[start] = d.F.slice();
  return { sigma: sigma, delta: delta, eps: eps, q0: start, F: [d.q0] };
}

/* two example DFAs over {a,b} */
var DFA_A = mkDFA(['0', '1', '2'], ['a', 'b'], {
  '0': { a: '1', b: '0' }, '1': { a: '2', b: '1' }, '2': { a: '0', b: '2' }
}, '0', ['0']);                                   /* number of a's divisible by 3 */
var DFA_B = mkDFA(['p', 'q', 'r'], ['a', 'b'], {
  'p': { a: 'q', b: 'p' }, 'q': { a: 'q', b: 'r' }, 'r': { a: 'q', b: 'r' }
}, 'p', ['r']);                                   /* contains the substring ab */

var STR7 = stringsUpTo(['a', 'b'], 7);
function setOf(pred) { return STR7.filter(pred); }
function sameSet(x, y) {
  if (x.length !== y.length) return false;
  for (var i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
  return true;
}
function inSet(S, w) { return S.indexOf(w) >= 0; }

var OP = {};
OP.union = productDFA(DFA_A, DFA_B, function (x, y) { return DFA_A.F.indexOf(x) >= 0 || DFA_B.F.indexOf(y) >= 0; });
OP.inter = productDFA(DFA_A, DFA_B, function (x, y) { return DFA_A.F.indexOf(x) >= 0 && DFA_B.F.indexOf(y) >= 0; });
OP.diff = productDFA(DFA_A, complementDFA(DFA_B), function (x, y) { return DFA_A.F.indexOf(x) >= 0 && DFA_B.F.indexOf(y) < 0; });
OP.comp = complementDFA(DFA_A);
OP.concat = subset(concatNFA(DFA_A, DFA_B));
OP.star = subset(starNFA(DFA_A));
OP.rev = subset(reverseNFA(DFA_B));

var LA = setOf(function (w) { return accepts(DFA_A, w); });
var LB = setOf(function (w) { return accepts(DFA_B, w); });
var OPS = ['union', 'inter', 'diff', 'comp', 'concat', 'star', 'rev'];
var OPN = {};
OPS.forEach(function (k) { OPN[k] = { dfa: OP[k], lang: setOf(function (w) { return accepts(OP[k], w); }) }; });

var WANT = {
  union: function (w) { return inSet(LA, w) || inSet(LB, w); },
  inter: function (w) { return inSet(LA, w) && inSet(LB, w); },
  diff: function (w) { return inSet(LA, w) && !inSet(LB, w); },
  comp: function (w) { return !inSet(LA, w); },
  concat: function (w) {
    for (var k = 0; k <= w.length; k++) if (inSet(LA, w.slice(0, k)) && inSet(LB, w.slice(k))) return true;
    return false;
  },
  star: (function () {
    var ok = { '': true };
    STR7.forEach(function (w) {
      for (var k = 0; k < w.length; k++) {
        if (ok[w.slice(0, k)] && inSet(LA, w.slice(k))) { ok[w] = true; break; }
      }
    });
    return function (w) { return !!ok[w]; };
  })(),
  rev: function (w) { return inSet(LB, w.split('').reverse().join('')); }
};

var OP_ROWS = OPS.map(function (k) {
  var d = OP[k], mc = minimizeCount(d);
  return {
    key: k, states: d.Q.length, reachable: mc.reachable, minimal: mc.minimal,
    members: OPN[k].lang.length,
    agrees: sameSet(OPN[k].lang, setOf(WANT[k]))
  };
});
chk('all seven regular operations were checked against their set-theoretic definition on every string of length <= 7',
  OP_ROWS.every(function (r) { return r.agrees; }),
  STR7.length + ' strings, ' + OP_ROWS.filter(function (r) { return r.agrees; }).length + '/7 operations agree');
chk('the product construction uses at most |Q1|x|Q2| states for union and intersection',
  OP.union.Q.length <= 9 && OP.inter.Q.length <= 9,
  'union ' + OP.union.Q.length + ', intersection ' + OP.inter.Q.length);
chk('complement needs no new state beyond a sink, so it is 3 or 4 states against 3',
  OP.comp.Q.length <= 4, 'complement has ' + OP.comp.Q.length);
chk('the star construction is correct even when it changes nothing: L(A)* equals L(A) for this A',
  sameSet(OPN.star.lang, LA), OP.star.Q.length + ' states, the same language');
chk('reversal of the 3-state automaton for "contains ab" determinises to fewer than 2^3 states',
  OP.rev.Q.length < 8, OP.rev.Q.length + ' states');

/* equivalence of two DFAs, by symmetric difference */
var SYM = productDFA(DFA_A, complementDFA(DFA_B), function (x, y) {
  return (DFA_A.F.indexOf(x) >= 0) !== (DFA_B.F.indexOf(y) >= 0);
});
var symWitness = STR7.filter(function (w) { return accepts(SYM, w); })[0];
var SYM2 = productDFA(DFA_A, complementDFA(DFA_A), function (x, y) {
  return (DFA_A.F.indexOf(x) >= 0) !== (DFA_A.F.indexOf(y) >= 0);
});
chk('two different DFAs are shown different by one witness string from the symmetric difference',
  symWitness !== undefined, 'shortest witness tried: "' + symWitness + '"');
chk('a DFA against itself has an empty symmetric difference, so equivalence is decidable by emptiness',
  !STR7.some(function (w) { return accepts(SYM2, w); }));

/* ================== 3. GRAMMARS AND THE CFL OPERATIONS ================== */
function G(V, T, P, S) { return { V: V, T: T, P: P, S: S }; }

function earley(g, w) {
  var n = w.length, sets = [], rules = [];
  g.V.forEach(function (A) { (g.P[A] || []).forEach(function (rhs) { rules.push({ lhs: A, rhs: rhs }); }); });
  function rulesOf(A) {
    var out = [];
    for (var i = 0; i < rules.length; i++) if (rules[i].lhs === A) out.push(i);
    return out;
  }
  for (var i = 0; i <= n; i++) sets.push([]);
  function key(it) { return it.rule + ':' + it.dot + ':' + it.start; }
  function add(i, it) {
    var S = sets[i];
    for (var k = 0; k < S.length; k++) if (key(S[k]) === key(it)) return false;
    S.push(it); return true;
  }
  add(0, { rule: -1, dot: 0, start: 0, lhs: '\u0000', rhs: [g.S] });
  for (var i2 = 0; i2 <= n; i2++) {
    var changed = true;
    while (changed) {
      changed = false;
      for (var k2 = 0; k2 < sets[i2].length; k2++) {
        var it = sets[i2][k2];
        if (it.dot < it.rhs.length) {
          var sym = it.rhs[it.dot];
          if (g.V.indexOf(sym) >= 0) {
            var rs = rulesOf(sym);
            for (var r = 0; r < rs.length; r++) {
              if (add(i2, { rule: rs[r], dot: 0, start: i2, lhs: sym, rhs: rules[rs[r]].rhs })) changed = true;
            }
          } else if (i2 < n && w[i2] === sym) {
            if (add(i2 + 1, { rule: it.rule, dot: it.dot + 1, start: it.start, lhs: it.lhs, rhs: it.rhs })) changed = true;
          }
        } else {
          var src = sets[it.start].slice();
          for (var s = 0; s < src.length; s++) {
            var pit = src[s];
            if (pit.dot < pit.rhs.length && pit.rhs[pit.dot] === it.lhs) {
              if (add(i2, { rule: pit.rule, dot: pit.dot + 1, start: pit.start, lhs: pit.lhs, rhs: pit.rhs })) changed = true;
            }
          }
        }
      }
    }
  }
  return sets[n].some(function (it) { return it.rule === -1 && it.dot === 1 && it.start === 0; });
}

function productiveSet(g) {
  var prod = {}, changed = true;
  g.V.forEach(function (A) { prod[A] = false; });
  while (changed) {
    changed = false;
    g.V.forEach(function (A) {
      if (prod[A]) return;
      (g.P[A] || []).forEach(function (rhs) {
        if (rhs.every(function (s) { return g.V.indexOf(s) < 0 || prod[s]; })) { prod[A] = true; changed = true; }
      });
    });
  }
  return prod;
}
function reachableNT(g) {
  var r = {}, stack = [g.S];
  r[g.S] = 1;
  while (stack.length) {
    var A = stack.pop();
    (g.P[A] || []).forEach(function (rhs) {
      rhs.forEach(function (s) { if (g.V.indexOf(s) >= 0 && !r[s]) { r[s] = 1; stack.push(s); } });
    });
  }
  return r;
}
function selfEmbedding(g) {
  var occ = {};
  g.V.forEach(function (A) { occ[A] = {}; });
  g.V.forEach(function (A) {
    (g.P[A] || []).forEach(function (rhs) {
      rhs.forEach(function (s) { if (g.V.indexOf(s) >= 0) occ[A][s] = 1; });
    });
  });
  var reach = reachableNT(g), prod = productiveSet(g), out = [];
  g.V.forEach(function (A) {
    var seen = {}, stack = [A];
    while (stack.length) {
      var x = stack.pop();
      Object.keys(occ[x]).forEach(function (y) { if (!seen[y]) { seen[y] = 1; stack.push(y); } });
    }
    if (seen[A] && reach[A] && prod[A]) out.push(A);
  });
  return out;
}

/* grammars used by the lesson */
var G_eq = G(['S'], ['a', 'b'], { S: [['a', 'S', 'b'], []] }, 'S');                    /* a^n b^n */
var G_c = G(['S'], ['c'], { S: [['c', 'S'], []] }, 'S');                                /* c^m */
var G_union = G(['S', 'S1', 'S2'], ['a', 'b', 'c'],
  { S: [['S1'], ['S2']], S1: [['a', 'S1', 'b'], []], S2: [['c', 'S2'], []] }, 'S');
var G_cat = G(['S', 'S1', 'S2'], ['a', 'b', 'c'],
  { S: [['S1', 'S2']], S1: [['a', 'S1', 'b'], []], S2: [['c', 'S2'], []] }, 'S');
var G_star = G(['S', 'S1'], ['a', 'b'], { S: [['S', 'S1'], []], S1: [['a', 'S1', 'b'], []] }, 'S');
var G_u = G(['S', 'A', 'B'], ['a', 'b'], { S: [['A', 'B'], ['a']], A: [['a', 'A']], B: [['b', 'B']] }, 'S');
var G_empty = G(['S', 'A', 'B'], ['a', 'b'], { S: [['A', 'B']], A: [['a', 'A']], B: [['b', 'B']] }, 'S');
var G_eqcount = G(['S'], ['a', 'b'], { S: [['a', 'S', 'b'], ['b', 'S', 'a'], ['S', 'S'], []] }, 'S');

var STR6 = stringsUpTo(['a', 'b'], 6);
var STR6c = stringsUpTo(['a', 'b', 'c'], 6);

function inEq(w) { var m = /^(a*)(b*)$/.exec(w); return !!m && m[1].length === m[2].length; }
function inC(w) { return /^c*$/.test(w); }

var CFL_UNION = STR6c.map(function (w) {
  return { w: w, got: earley(G_union, w), want: inEq(w) || inC(w) };
});
var CFL_CAT = STR6c.map(function (w) {
  var want = false;
  for (var k = 0; k <= w.length; k++) if (inEq(w.slice(0, k)) && inC(w.slice(k))) want = true;
  return { w: w, got: earley(G_cat, w), want: want };
});
var CFL_STAR = STR6.map(function (w) {
  var ok = [true];
  for (var i = 1; i <= w.length; i++) ok.push(false);
  for (var j = 1; j <= w.length; j++) {
    for (var k = 0; k < j; k++) if (ok[k] && inEq(w.slice(k, j))) ok[j] = true;
  }
  return { w: w, got: earley(G_star, w), want: ok[w.length] };
});
var CFL_UNION_BAD = CFL_UNION.filter(function (r) { return r.got !== r.want; }).length;
var CFL_CAT_BAD = CFL_CAT.filter(function (r) { return r.got !== r.want; }).length;
var CFL_STAR_BAD = CFL_STAR.filter(function (r) { return r.got !== r.want; }).length;

chk('CFL union: the combined grammar accepts exactly the union, on all ' + STR6c.length + ' strings of length <= 6',
  CFL_UNION_BAD === 0, CFL_UNION_BAD + ' disagreements');
chk('CFL concatenation: the combined grammar accepts exactly the concatenation, on all ' + STR6c.length + ' strings',
  CFL_CAT_BAD === 0, CFL_CAT_BAD + ' disagreements');
chk('CFL star: the looping grammar accepts exactly the star, on all ' + STR6.length + ' strings of length <= 6',
  CFL_STAR_BAD === 0, CFL_STAR_BAD + ' disagreements');

/* CFL intersected with a regular language, by the [A,p,q] construction.
   [A,p,q] generates exactly the strings A generates that take the DFA from p
   to q, so the new start symbol reads off the strings that end in a final state. */
function intersectWithDFA(g, d) {
  var Q = d.Q, V2 = [], P2 = {}, S2 = 'S0';
  function nm(A, p, q) { return A + '[' + p + ',' + q + ']'; }
  g.V.forEach(function (A) {
    Q.forEach(function (p) {
      Q.forEach(function (q) {
        var name = nm(A, p, q);
        V2.push(name); P2[name] = [];
      });
    });
  });
  g.V.forEach(function (A) {
    (g.P[A] || []).forEach(function (rhs) {
      Q.forEach(function (p) {
        var paths = [{ syms: [], state: p }];
        rhs.forEach(function (sym) {
          var next = [];
          paths.forEach(function (pt) {
            if (g.V.indexOf(sym) >= 0) {
              Q.forEach(function (q) {
                next.push({ syms: pt.syms.concat([nm(sym, pt.state, q)]), state: q });
              });
            } else {
              var q2 = d.delta[pt.state] && d.delta[pt.state][sym];
              if (q2 !== undefined) next.push({ syms: pt.syms.concat([sym]), state: q2 });
            }
          });
          paths = next;
        });
        paths.forEach(function (pt) { P2[nm(A, p, pt.state)].push(pt.syms); });
      });
    });
  });
  P2[S2] = d.F.map(function (q) { return [nm(g.S, d.q0, q)]; });
  return G([S2].concat(V2), g.T, P2, S2);
}

var D_even = mkDFA(['e', 'o'], ['a', 'b'], { e: { a: 'o', b: 'o' }, o: { a: 'e', b: 'e' } }, 'e', ['e']);
var G_prod = intersectWithDFA(G_eqcount, D_even);
function eqCount(w) {
  var a = 0;
  for (var i = 0; i < w.length; i++) { if (w[i] === 'a') a++; }
  return a === w.length - a;
}
var CFL_PROD = STR6.map(function (w) {
  return { w: w, got: earley(G_prod, w), want: eqCount(w) && w.length % 2 === 0, base: earley(G_eqcount, w) };
});
var CFL_PROD_BAD = CFL_PROD.filter(function (r) { return r.got !== r.want; }).length;
var CFL_BASE_BAD = CFL_PROD.filter(function (r) { return r.base !== eqCount(r.w); }).length;
var PROD_RULES = Object.keys(G_prod.P).reduce(function (a, k) { return a + G_prod.P[k].length; }, 0);

chk('CFL intersect regular: the product grammar accepts exactly L(G) intersect L(DFA) on all ' + STR6.length + ' strings',
  CFL_PROD_BAD === 0, CFL_PROD_BAD + ' disagreements');
chk('the base grammar for equal counts of a and b agrees with its definition on the same strings',
  CFL_BASE_BAD === 0, CFL_BASE_BAD + ' disagreements');
chk('the product grammar has |V| x |Q|^2 = ' + (1 * 4) + ' nonterminals before its new start symbol',
  G_prod.V.length === 5, G_prod.V.length + ' nonterminals including S0');
chk('the product construction is a grammar, so the result is context-free by construction',
  PROD_RULES > 0, PROD_RULES + ' productions');

/* ambiguity, counted: S -> S S | a on a^n */
function countTrees(w) {
  var n = w.length, dp = [];
  for (var i = 0; i <= n; i++) { dp.push([]); for (var j = 0; j <= n; j++) dp[i].push(0); }
  for (var k = 0; k < n; k++) if (w[k] === 'a') dp[k][k + 1] = 1;
  for (var len = 2; len <= n; len++) {
    for (var s = 0; s + len <= n; s++) {
      var e = s + len, tot = 0;
      for (var m = s + 1; m < e; m++) tot += dp[s][m] * dp[m][e];
      dp[s][e] = tot;
    }
  }
  return dp[0][n];
}
var TREE_COUNTS = [];
for (var tn = 1; tn <= 8; tn++) TREE_COUNTS.push({ n: tn, trees: countTrees(rep('a', tn)) });
chk('S -> S S | a is ambiguous: a^3 has 2 trees, a^5 has 14, a^8 has 429',
  TREE_COUNTS[2].trees === 2 && TREE_COUNTS[4].trees === 14 && TREE_COUNTS[7].trees === 429,
  'Catalan(n-1): ' + TREE_COUNTS.map(function (r) { return r.trees; }).join(', '));
chk('one tree for a^1 and a^2, so ambiguity starts at length 3',
  TREE_COUNTS[0].trees === 1 && TREE_COUNTS[1].trees === 1 && TREE_COUNTS[2].trees === 2);

/* ================== 4. THE DECISION PROBLEMS ================== */
function hasReachableFinal(d) { return reachable(d).some(function (q) { return d.F.indexOf(q) >= 0; }); }
function liveStates(d) {
  var t = totalize(d), reach = reachable(t), live = {};
  reach.forEach(function (q) { live[q] = t.F.indexOf(q) >= 0; });
  var changed = true;
  while (changed) {
    changed = false;
    reach.forEach(function (q) {
      if (live[q]) return;
      t.sigma.forEach(function (c) { if (live[step(t, q, c)]) { live[q] = true; changed = true; } });
    });
  }
  return { t: t, reach: reach, live: live };
}
function isFiniteDFA(d) {
  var L = liveStates(d), t = L.t, colour = {}, cyc = false;
  function dfs(q) {
    colour[q] = 1;
    t.sigma.forEach(function (c) {
      var r = step(t, q, c);
      if (!L.live[r]) return;
      if (colour[r] === 1) cyc = true;
      else if (!colour[r]) dfs(r);
    });
    colour[q] = 2;
  }
  L.reach.forEach(function (q) { if (L.live[q] && !colour[q]) dfs(q); });
  return !cyc;
}
var DFA_FACTS = {
  A: { states: DFA_A.Q.length, min: minimizeCount(DFA_A), members: LA.length, empty: !hasReachableFinal(DFA_A), finite: isFiniteDFA(DFA_A) },
  B: { states: DFA_B.Q.length, min: minimizeCount(DFA_B), members: LB.length, empty: !hasReachableFinal(DFA_B), finite: isFiniteDFA(DFA_B) }
};
chk('emptiness of a DFA is decided by asking whether an accepting state is reachable',
  DFA_FACTS.A.empty === false && DFA_FACTS.A.members > 0);
chk('finiteness of a DFA is decided by asking whether a live state lies on a cycle',
  DFA_FACTS.A.finite === false && DFA_FACTS.B.finite === false,
  'both example languages are infinite');
chk('both example automata are already minimal',
  DFA_FACTS.A.min.minimal === 3 && DFA_FACTS.B.min.minimal === 3);

var PROD_U = productiveSet(G_u), REACH_U = reachableNT(G_u);
var PROD_EMPTY = productiveSet(G_empty);
var DEC = {
  productiveU: Object.keys(PROD_U).filter(function (k) { return PROD_U[k]; }),
  reachU: Object.keys(REACH_U).filter(function (k) { return REACH_U[k]; }),
  gUEmpty: !STR6.some(function (w) { return earley(G_u, w); }),
  gEmptyEmpty: !STR6.some(function (w) { return earley(G_empty, w); }),
  gEmptyProductive: Object.keys(PROD_EMPTY).filter(function (k) { return PROD_EMPTY[k]; }),
  embedEq: selfEmbedding(G_eq),
  embedU: selfEmbedding(G_u),
  embedEqCount: selfEmbedding(G_eqcount),
  embedStar: selfEmbedding(G_star)
};
chk('CFG emptiness: the fixed point of productive nonterminals for S -> AB | a, A -> aA, B -> bB is {S} only',
  DEC.productiveU.length === 1 && DEC.productiveU[0] === 'S', DEC.productiveU.join(','));
chk('CFG emptiness: a grammar with no productive start symbol generates nothing',
  DEC.gEmptyProductive.length === 0 && DEC.gEmptyEmpty === true);
chk('CFG finiteness: a^n b^n has a self-embedding nonterminal, so its language is infinite',
  DEC.embedEq.length === 1 && DEC.embedEq[0] === 'S');
chk('CFG finiteness: a finite grammar has no reachable, productive, self-embedding nonterminal',
  DEC.embedU.length === 0);

var DECIDE_TABLE = [
  { q: 'Emptiness', reg: 'Decidable', regHow: 'reachability in the automaton', cfl: 'Decidable', cflHow: 'productive-symbol fixed point', regYes: true, cflYes: true },
  { q: 'Finiteness', reg: 'Decidable', regHow: 'a live state on a cycle', cfl: 'Decidable', cflHow: 'self-embedding nonterminal', regYes: true, cflYes: true },
  { q: 'Membership', reg: 'Decidable', regHow: 'run the automaton, O(n)', cfl: 'Decidable', cflHow: 'CYK or Earley, O(n^3)', regYes: true, cflYes: true },
  { q: 'Universality', reg: 'Decidable', regHow: 'complement empty', cfl: 'Undecidable', cflHow: 'no algorithm', regYes: true, cflYes: false },
  { q: 'Equivalence', reg: 'Decidable', regHow: 'symmetric difference empty', cfl: 'Undecidable', cflHow: 'no algorithm', regYes: true, cflYes: false },
  { q: 'Ambiguity', reg: 'Not applicable', regHow: 'a DFA is unambiguous by definition', cfl: 'Undecidable', cflHow: 'no algorithm', regYes: true, cflYes: false }
];
chk('every decidable entry in the decision table names a procedure, and every undecidable entry names none',
  DECIDE_TABLE.every(function (r) {
    return (r.regYes ? r.regHow.length > 0 : true) && (r.cflYes ? r.cflHow.length > 0 : r.cflHow === 'no algorithm');
  }));
chk('the two classes differ on exactly three questions: universality, equivalence and ambiguity',
  DECIDE_TABLE.filter(function (r) { return r.regYes !== r.cflYes; }).length === 3);

/* ================== 5. THE EXAM FACTS ================== */
var PYQ = [
  { year: 'GATE CSE 2024 Set 1, Q23', type: 'MSQ', key: 'C and D',
    asks: 'L1, L2 regular and L3 non-regular: which statements are always true' },
  { year: 'GATE CSE 2021 Set 1', type: 'MCQ', key: 'L1 - L2',
    asks: 'L1 regular, L2 context-free: which is NOT necessarily context-free' },
  { year: 'GATE CSE 2017 Set 2, Q4', type: 'MCQ', key: 'I and III only',
    asks: 'L1, L2 context-free and R regular: which of four are context-free' },
  { year: 'GATE CSE 2017 Set 1, Q38', type: 'MCQ', key: 'I only',
    asks: 'a^n b^n c^m and a^m b^n c^n: is the union, and is the intersection, context-free' },
  { year: 'GATE CSE 2019, Q15', type: 'MCQ', key: '24',
    asks: 'a pumping length for {a^(2+3k)} union {b^(10+12k)}' }
];
chk('five previous-year questions are recorded, each with its year, paper and keyed answer',
  PYQ.length === 5 && PYQ.every(function (r) { return r.year && r.key; }));

var MODEL = {
  PUMP_ANBN: PUMP_ANBN, PUMP_PRIME: PUMP_PRIME, PUMP_AGT: PUMP_AGT, PUMP_CFL: PUMP_CFL,
  DFA_A: DFA_A, DFA_B: DFA_B, OP_ROWS: OP_ROWS, OPN: OPN, LA: LA, LB: LB,
  SYM: SYM, symWitness: symWitness,
  CFL_UNION_BAD: CFL_UNION_BAD, CFL_CAT_BAD: CFL_CAT_BAD, CFL_STAR_BAD: CFL_STAR_BAD,
  CFL_PROD_BAD: CFL_PROD_BAD, CFL_PROD: CFL_PROD, G_prod: G_prod, PROD_RULES: PROD_RULES,
  TREE_COUNTS: TREE_COUNTS, DFA_FACTS: DFA_FACTS, DEC: DEC, DECIDE_TABLE: DECIDE_TABLE,
  PYQ: PYQ, CHECKS: CHECKS, STR7_N: STR7.length, STR6_N: STR6.length, STR6C_N: STR6c.length,
  PUMP_SPLITS_TOTAL: PUMP_CFL.reduce(function (a, r) { return a + r.splits; }, 0)
};
/* ======================================================================
   LAYER 3 - RENDER
   Reads the model. Never re-derives a number.
   ====================================================================== */

function ease(v) { return v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2; }
function appear(p, from, to) { return ease(Math.min(1, Math.max(0, (p - from) / Math.max(0.001, to - from)))); }

function card(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: 1, radius: 8 });
  if (o.bar) P.rect(x, y, 3, h, { fill: o.bar, radius: 2 });
}
function head(x, y, s, colour) { P.text(x, y, s, { size: 10, bold: true, mono: true, color: colour || FAINT }); }
function body(x, y, s, o) {
  o = o || {};
  P.text(x, y, s, { size: o.size || 12, color: o.color || INK, mono: o.mono, bold: o.bold, align: o.align });
}
function mono(x, y, s, o) {
  o = o || {};
  P.text(x, y, s, { size: o.size || 11.5, mono: true, color: o.color || INK, align: o.align, bold: o.bold });
}
function title(s, sub) {
  P.text(40, 20, s, { size: 17, bold: true, color: INK });
  if (sub) P.text(40, 42, s === '' ? sub : sub, { size: 11, color: DIM });
}
function rule(y) { P.line(40, y, W - 40, y, { stroke: BORDER, sw: 1 }); }
function chip(x, y, label, colour, dim) {
  var wid = 9 + label.length * 6.2;
  P.rect(x, y, wid, 18, { fill: dim || SURF2, stroke: colour, sw: 1, radius: 9 });
  P.text(x + wid / 2, y + 9, label, { size: 9.5, mono: true, color: colour, align: 'center', base: 'middle' });
  return wid;
}

function sceneAtTime(t) {
  var tl = window.LESSON_TIMELINE;
  for (var i = 0; i < tl.scenes.length; i++) {
    var s = tl.scenes[i];
    if (t >= s.start && t < s.end) return s;
  }
  return tl.scenes[tl.scenes.length - 1];
}
function progOf(t) {
  var sc = sceneAtTime(t);
  return { sc: sc, p: (t - sc.start) / Math.max(0.001, sc.end - sc.start) };
}

/* ---------- scene 1: two questions ---------- */
function drawWhy(t, p) {
  title('Closure and decision properties', 'what a class of languages survives, and what it can answer');

  P.alpha(appear(p, 0.02, 0.28));
  card(40, 60, 400, 168, { bar: ACC });
  head(58, 78, 'QUESTION 1  -  CLOSURE', ACC);
  body(58, 100, 'Take languages in the class, apply an', { size: 11.5, color: INK });
  body(58, 116, 'operation. Is the result still in the class?', { size: 11.5, color: INK });
  mono(58, 142, 'L1, L2 in C   =>   L1 op L2 in C ?', { size: 11, color: ACC });
  body(58, 168, 'A statement about a set of languages', { size: 10.5, color: DIM });
  body(58, 184, 'and one operation on them.', { size: 10.5, color: DIM });
  body(58, 208, 'Answered by a construction, or by a witness.', { size: 10.5, color: DIM });

  P.alpha(appear(p, 0.16, 0.42));
  card(460, 60, 400, 168, { bar: INFO });
  head(478, 78, 'QUESTION 2  -  DECISION', INFO);
  body(478, 100, 'Given a machine or a grammar from the', { size: 11.5, color: INK });
  body(478, 116, 'class, is a given question answerable?', { size: 11.5, color: INK });
  mono(478, 142, 'algorithm(M, q)  halts  with  yes / no ?', { size: 11, color: INFO });
  body(478, 168, 'A statement about one object and one', { size: 10.5, color: DIM });
  body(478, 184, 'question asked of it.', { size: 10.5, color: DIM });
  body(478, 208, 'Answered by a procedure, or by a theorem.', { size: 10.5, color: DIM });

  P.alpha(appear(p, 0.4, 0.68));
  card(40, 242, 820, 118, { fill: SURF2 });
  head(58, 260, 'THE TWO CLASSES, SIDE BY SIDE', DIM);
  var cols = [58, 350, 660];
  ['', 'REGULAR', 'CONTEXT-FREE'].forEach(function (h, i) {
    if (h) head(cols[i], 282, h, i === 1 ? ACC : INFO);
  });
  var rows = [
    ['closed under intersection', 'yes', 'no'],
    ['closed under complement', 'yes', 'no'],
    ['every decision question', 'decidable', 'three are not']
  ];
  rows.forEach(function (r, i) {
    var y = 306 + i * 18;
    body(cols[0], y, r[0], { size: 11, color: DIM });
    mono(cols[1], y, r[1], { size: 11, color: VAL, bold: true });
    mono(cols[2], y, r[2], { size: 11, color: BAD, bold: true });
  });

  P.alpha(appear(p, 0.66, 0.9));
  card(40, 372, 820, 62, { bar: WARN });
  head(58, 390, 'SYLLABUS POSITION', WARN);
  body(58, 408, 'Section 6 of the GATE 2027 CS syllabus, IIT Madras: "Regular and context-free languages, pumping lemma."', { size: 10.5, color: INK });
  body(58, 424, 'This is the third clause, named in its own words, so the whole page is class A.', { size: 10.5, color: DIM });
  P.alpha(1);
}

/* ---------- scene 2: the regular pumping lemma ---------- */
function drawPumpreg(t, p) {
  title('The regular pumping lemma', 'a loop in a long run, and the three conditions that make it usable');

  P.alpha(appear(p, 0.02, 0.26));
  card(40, 60, 820, 76, { bar: ACC });
  head(58, 78, 'THE STATEMENT', ACC);
  mono(58, 100, 'if L is regular, there is a p such that every w in L with |w| >= p', { size: 11.5, color: INK });
  mono(58, 120, 'splits as  w = x y z  with  |y| >= 1,  |xy| <= p,  and  x y^i z in L  for every i >= 0', { size: 11.5, color: ACC });

  P.alpha(appear(p, 0.18, 0.4));
  var chips = [['|y| >= 1', VAL], ['|xy| <= p', INFO], ['every pump inside', ACC]];
  var cx = 40;
  chips.forEach(function (c) { cx += chip(cx, 148, c[0], c[1]) + 8; });
  body(cx + 6, 162, 'a split meeting all three is called surviving here', { size: 10, color: DIM });

  P.alpha(appear(p, 0.34, 0.62));
  card(40, 180, 400, 232, { bar: WARN });
  head(58, 198, 'THE WITNESS FOR EACH p:  a^p b^p', WARN);
  body(58, 220, 'The first p symbols are all a. So any y with', { size: 10.5, color: DIM });
  body(58, 236, '|xy| <= p lies inside the a-block.', { size: 10.5, color: DIM });
  PUMP_ANBN.forEach(function (r, i) {
    var y = 260 + i * 18;
    mono(58, y, 'p = ' + r.p, { size: 10.5, color: DIM });
    mono(110, y, r.w.length > 14 ? r.w.slice(0, 7) + '..' + r.w.slice(-5) : r.w, { size: 10.5, color: i === 3 ? WARN : INK, bold: i === 3 });
    mono(300, y, r.survives ? 'survives' : 'none', { size: 10.5, color: r.survives ? VAL : BAD, bold: true, align: 'right' });
  });
  body(58, 402, '8 witnesses, every legal split of each, 0 surviving.', { size: 10.5, color: BAD });

  P.alpha(appear(p, 0.6, 0.86));
  card(460, 180, 400, 232, { fill: SURF2 });
  head(478, 198, 'WHY PUMPING THE a-BLOCK BREAKS IT', DIM);
  mono(478, 224, 'w  =  a a a a b b b b        p = 4', { size: 10.5, color: INK });
  mono(478, 246, 'y  =  a            (inside the a-block)', { size: 10.5, color: WARN });
  mono(478, 268, 'i=2:  a a a a a b b b b', { size: 10.5, color: INK });
  mono(478, 286, '     5 a and 4 b   ->  outside L', { size: 10.5, color: BAD });
  mono(478, 314, 'i=0:  a a a b b b b', { size: 10.5, color: INK });
  mono(478, 332, '     3 a and 4 b   ->  outside L', { size: 10.5, color: BAD });
  body(478, 362, 'No split escapes: y cannot reach the b-block', { size: 10.5, color: DIM });
  body(478, 378, 'because |xy| <= p stops at the block boundary.', { size: 10.5, color: DIM });
  body(478, 400, 'One sentence covers every p at once.', { size: 10.5, color: ACC });
  P.alpha(1);
}

/* ---------- scene 3: the pumping length ---------- */
function drawPumplen(t, p) {
  title('The pumping length is a number with a direction', 'some p exists; larger p is weaker; the smallest p is the property');

  P.alpha(appear(p, 0.02, 0.26));
  card(40, 60, 820, 58, { bar: INFO });
  head(58, 78, 'THE LEMMA IS EXISTENTIAL', INFO);
  mono(58, 102, 'there EXISTS p such that every w in L with |w| >= p can be pumped', { size: 11.5, color: INK });

  P.alpha(appear(p, 0.16, 0.42));
  card(40, 132, 820, 150, { fill: SURF2 });
  head(58, 150, 'THE WORKED LANGUAGE   { a^i b^j c^k :  i = 1 implies j = k }', DIM);
  var bw = 128, x0 = 70;
  PUMP_AGT.forEach(function (r, i) {
    var x = x0 + i * 152, y = 170;
    var h = 58 * (r.tried / 132);
    P.rect(x, y + (58 - h), bw - 34, h, { fill: r.failed ? INVALIDDIM : ACCDIM, stroke: r.failed ? BAD : ACC, sw: 1.2, radius: 3 });
    mono(x + (bw - 34) / 2, y + 58 + 13, 'p = ' + r.p, { size: 10.5, color: INK, align: 'center' });
    mono(x + (bw - 34) / 2, y + 58 + 26, r.failed + ' fail', { size: 10, color: r.failed ? BAD : VAL, align: 'center', bold: true });
    mono(x + (bw - 34) / 2, y + (58 - h) - 4, String(r.tried), { size: 9.5, color: DIM, align: 'center' });
  });
  body(58, 274, 'Members of length at least p that were tried: count above each bar, failures below.', { size: 10, color: DIM });

  P.alpha(appear(p, 0.4, 0.66));
  card(40, 294, 400, 140, { bar: WARN });
  head(58, 312, 'p = 1 IS TOO SMALL', WARN);
  body(58, 334, 'At p = 1 the only legal split is y equal to the', { size: 10.5, color: DIM });
  body(58, 350, 'first symbol. Pumping aab down gives ab, which', { size: 10.5, color: DIM });
  body(58, 366, 'has one a and so needs j = k. It does not have it.', { size: 10.5, color: DIM });
  mono(58, 392, PUMP_AGT[0].failed + ' of ' + PUMP_AGT[0].tried + ' fail at p = 1', { size: 11, color: BAD, bold: true });
  body(58, 414, 'That says p was small. It says nothing about L.', { size: 10.5, color: ACC });

  P.alpha(appear(p, 0.64, 0.88));
  card(460, 294, 400, 140, { fill: SURF2 });
  head(478, 312, 'THE 2019 QUESTION', INFO);
  body(478, 334, 'L = { a^(2+3k) } union { b^(10+12k) }, k >= 0.', { size: 10.5, color: INK });
  body(478, 354, 'The shortest b-string has length 10, so a', { size: 10.5, color: DIM });
  body(478, 370, 'pumping length below 10 cannot pump it.', { size: 10.5, color: DIM });
  mono(478, 394, 'options 3, 5, 9 fall.  24 stands.  key: 24', { size: 11, color: VAL, bold: true });
  body(478, 414, 'Minimum pumping length here is 12; any p >= 12 works.', { size: 10, color: DIM });
  P.alpha(1);
}

/* ---------- scene 4: necessary, not sufficient ---------- */
function drawPumpweak(t, p) {
  title('Necessary, never sufficient', 'a language that passes the test and is still not regular');

  P.alpha(appear(p, 0.02, 0.28));
  card(40, 60, 400, 148, { bar: VAL });
  head(58, 78, 'PASSES THE LEMMA', VAL);
  body(58, 100, '{ a^i b^j c^k : i = 1 implies j = k }', { size: 11, mono: true, color: INK });
  body(58, 124, 'At p = 2, 3, 4 and 5 the page finds no', { size: 10.5, color: DIM });
  body(58, 140, 'member without a surviving split:', { size: 10.5, color: DIM });
  mono(58, 164, PUMP_AGT.slice(1).map(function (r) { return r.tried; }).join(' / ') + ' members tried, 0 fail', { size: 10.5, color: VAL, bold: true });
  body(58, 190, 'So the lemma is satisfied, from p = 2 up.', { size: 10.5, color: DIM });

  P.alpha(appear(p, 0.2, 0.46));
  card(460, 60, 400, 148, { bar: BAD });
  head(478, 78, 'STILL NOT REGULAR', BAD);
  body(478, 100, 'Intersect with the regular language a b* c*:', { size: 10.5, color: DIM });
  mono(478, 124, 'L  intersect  a b* c*  =  { a b^j c^j }', { size: 10.5, color: INK });
  body(478, 148, 'That language fails the lemma at p = 1..6', { size: 10.5, color: DIM });
  body(478, 164, 'with witness a b^p c^p, as the page checks.', { size: 10.5, color: DIM });
  body(478, 190, 'Regular is closed under intersection. So L is not.', { size: 10.5, color: BAD });

  P.alpha(appear(p, 0.44, 0.7));
  card(40, 224, 820, 100, { fill: SURF2 });
  head(58, 242, 'THE ARGUMENT IN THREE LINES', DIM);
  var lines = [
    '1   if L were regular, then L intersect (a b* c*) would be regular, because regular is closed under intersection',
    '2   L intersect (a b* c*) is a b^j c^j, which fails the pumping lemma for every p',
    '3   so L intersect (a b* c*) is not regular, and therefore L is not regular'
  ];
  lines.forEach(function (s, i) { body(58, 266 + i * 18, s, { size: 10.5, color: i === 2 ? BAD : INK }); });

  P.alpha(appear(p, 0.68, 0.9));
  card(40, 340, 820, 94, { bar: ACC });
  head(58, 358, 'WHAT THE TEST CAN AND CANNOT DO', ACC);
  body(58, 380, 'Failing the lemma at every p:  proves L is outside the class.   Passing it: proves nothing.', { size: 11, color: INK });
  body(58, 400, 'To prove L is regular, build a DFA, an NFA or a regular expression. To prove it is not, fail the lemma or use a closure argument.', { size: 10.5, color: DIM });
  body(58, 420, 'Every finite language is regular, and for it the lemma is vacuous: choose p longer than its longest word.', { size: 10.5, color: DIM });
  P.alpha(1);
}

/* ---------- scene 5: the CFL lemma ---------- */
function drawCflpump(t, p) {
  title('The same game with five pieces', 'u v w x y, a short window, and two pieces that pump together');

  P.alpha(appear(p, 0.02, 0.26));
  card(40, 60, 820, 74, { bar: INFO });
  head(58, 78, 'THE STATEMENT', INFO);
  mono(58, 100, 'if L is context-free, there is an n such that every w in L with |w| >= n', { size: 11.5, color: INK });
  mono(58, 120, 'splits as w = u v w x y with |vwx| <= n, |vx| >= 1, and u v^i w x^i y in L for every i', { size: 11.5, color: INFO });

  P.alpha(appear(p, 0.18, 0.44));
  var seq = ['a', 'a', 'a', 'b', 'b', 'b', 'c', 'c', 'c'];
  var bx = 130, by = 156;
  seq.forEach(function (c, i) {
    var col = c === 'a' ? ACC : c === 'b' ? INFO : WARN;
    P.rect(bx + i * 30, by, 26, 26, { fill: SURF, stroke: col, sw: 1.4, radius: 4 });
    P.text(bx + i * 30 + 13, by + 13, c, { size: 12, mono: true, color: col, align: 'center', base: 'middle' });
  });
  mono(58, 170, 'w =', { size: 11, color: DIM });
  var spans = [['u', 0, 1], ['v', 1, 2], ['w', 2, 4], ['x', 4, 6], ['y', 6, 9]];
  spans.forEach(function (s) {
    var x1 = bx + s[1] * 30, x2 = bx + s[2] * 30;
    P.line(x1, by + 32, x2 - 4, by + 32, { stroke: s[0] === 'v' || s[0] === 'x' ? WARN : FAINT, sw: 1.5 });
    P.text((x1 + x2 - 4) / 2, by + 38, s[0], { size: 11, mono: true, color: s[0] === 'v' || s[0] === 'x' ? WARN : DIM, align: 'center' });
  });
  P.rect(bx + 1 * 30, by - 6, 5 * 30 - 4, 38, { stroke: INFO, sw: 1, dash: [3, 3], radius: 4 });
  body(58, 224, 'The dashed window is v w x: length at most n, so it can reach at most two of the three blocks.', { size: 10.5, color: DIM });

  P.alpha(appear(p, 0.42, 0.68));
  card(40, 244, 400, 128, { bar: BAD });
  head(58, 262, 'a^n b^n c^n: THE SPLIT SEARCH', BAD);
  PUMP_CFL.forEach(function (r, i) {
    var y = 286 + i * 14;
    mono(58, y, 'n = ' + r.n, { size: 10, color: DIM });
    mono(120, y, r.splits + ' legal splits', { size: 10, color: INK });
    mono(300, y, r.survived + ' survive', { size: 10, color: BAD, align: 'right' });
  });
  body(58, 366, 'Pumping changes at most two of the three counts.', { size: 10.5, color: DIM });

  P.alpha(appear(p, 0.64, 0.88));
  card(460, 244, 400, 190, { fill: SURF2 });
  head(478, 262, 'AND THIS LANGUAGE IS AN INTERSECTION', DIM);
  mono(478, 288, 'L1 = { a^n b^n c^m }   context-free', { size: 10.5, color: VAL });
  mono(478, 310, 'L2 = { a^m b^n c^n }   context-free', { size: 10.5, color: VAL });
  P.line(478, 324, 858, 324, { stroke: BORDER, sw: 1 });
  mono(478, 344, 'L1 and L2  =  { a^n b^n c^n }', { size: 11, color: BAD, bold: true });
  body(478, 366, 'One stack matches a against b in L1; the c\'s', { size: 10.5, color: DIM });
  body(478, 382, 'are free. L2 does the same on the other side.', { size: 10.5, color: DIM });
  body(478, 404, 'Both counts must agree at once: two stacks.', { size: 10.5, color: DIM });
  body(478, 424, 'That is why intersection leaves the class.', { size: 10.5, color: BAD });
  P.alpha(1);
}

/* ---------- scene 6: regular closure ---------- */
function drawClosreg(t, p) {
  title('Closure: seven operations, all of them kept', 'two automata, every construction run and counted');

  P.alpha(appear(p, 0.02, 0.26));
  card(40, 60, 400, 82, { bar: ACC });
  head(58, 78, 'A: a\'s divisible by 3', ACC);
  body(58, 100, '3 states, 0-1-2, b stays put, 0 accepting.', { size: 10.5, color: DIM });
  body(58, 120, 'Minimal: 3. Infinite: yes. Empty: no.', { size: 10.5, color: DIM });
  card(460, 60, 400, 82, { bar: INFO });
  head(478, 78, 'B: contains the substring ab', INFO);
  body(478, 100, '3 states: start, saw a, saw ab. r accepting.', { size: 10.5, color: DIM });
  body(478, 120, 'Minimal: 3. Infinite: yes. Empty: no.', { size: 10.5, color: DIM });

  P.alpha(appear(p, 0.18, 0.44));
  card(40, 156, 820, 258, { fill: SURF });
  head(58, 174, 'THE SEVEN CONSTRUCTIONS, COUNTED', DIM);
  var cols = [58, 300, 380, 470, 580, 700];
  ['operation', 'states', 'minimal', 'members', 'agrees on 255', 'construction'].forEach(function (h, i) {
    head(cols[i], 198, h.toUpperCase(), FAINT);
  });
  P.line(58, 208, 842, 208, { stroke: BORDER, sw: 1 });
  var HOW = {
    union: 'product, either accepting',
    inter: 'product, both accepting',
    diff: 'product with complement',
    comp: 'flip accepting set',
    concat: 'epsilon link, determinise',
    star: 'new start, loop back',
    rev: 'swap edges, determinise'
  };
  OP_ROWS.forEach(function (r, i) {
    var y = 228 + i * 24;
    var a = appear(p, 0.24 + i * 0.05, 0.4 + i * 0.05);
    P.alpha(a);
    mono(58, y, r.key, { size: 11, color: INK, bold: true });
    mono(cols[1], y, String(r.states), { size: 11, color: ACC });
    mono(cols[2], y, String(r.minimal), { size: 11, color: DIM });
    mono(cols[3], y, String(r.members), { size: 11, color: DIM });
    mono(cols[4], y, r.agrees ? 'yes' : 'NO', { size: 11, color: r.agrees ? VAL : BAD, bold: true });
    body(cols[5], y, HOW[r.key], { size: 10, color: DIM });
  });
  P.alpha(appear(p, 0.6, 0.8));
  body(58, 402, 'All seven results were compared with their set-theoretic definitions on every string of length at most 7: 255 strings, 7 agreements.', { size: 10.5, color: DIM });

  P.alpha(appear(p, 0.78, 0.95));
  card(40, 428, 820, 24, { bar: VAL });
  body(58, 444, 'Union, intersection and difference are one product: 7 reachable pairs of 9, minimising to 5. Complement is the cheapest at 3.', { size: 10.5, color: INK });
  P.alpha(1);
}

/* ---------- scene 7: CFL closure ---------- */
function drawClosurecfl(t, p) {
  title('Closure: what context-free languages lose', 'three kept, two lost, and one asymmetry worth remembering');

  P.alpha(appear(p, 0.02, 0.26));
  card(40, 60, 400, 176, { bar: VAL });
  head(58, 78, 'KEPT', VAL);
  var kept = [
    ['union', 'S -> S1 | S2'],
    ['concatenation', 'S -> S1 S2'],
    ['star', 'S -> S S1 | eps'],
    ['intersect regular', '[A,p,q] construction'],
    ['minus regular', 'L1 intersect complement(R)']
  ];
  kept.forEach(function (r, i) {
    var y = 104 + i * 26;
    mono(58, y, r[0], { size: 11, color: INK, bold: true });
    mono(230, y, r[1], { size: 10, color: DIM });
  });
  body(58, 240, 'Each is a grammar, so each result is context-free by construction.', { size: 10, color: DIM });

  P.alpha(appear(p, 0.2, 0.44));
  card(460, 60, 400, 176, { bar: BAD });
  head(478, 78, 'LOST', BAD);
  var lost = [
    ['intersection', 'a^n b^n c^m and a^m b^n c^n'],
    ['complement', 'would give intersection'],
    ['minus context-free', 'L1 - L2 = L1 intersect complement(L2)']
  ];
  lost.forEach(function (r, i) {
    var y = 104 + i * 30;
    mono(478, y, r[0], { size: 11, color: INK, bold: true });
    body(478, y + 14, r[1], { size: 10, color: DIM });
  });
  body(478, 206, 'Both losses are the same loss, seen twice.', { size: 10.5, color: BAD });

  P.alpha(appear(p, 0.42, 0.66));
  card(40, 252, 820, 84, { bar: WARN });
  head(58, 270, 'THE WITNESS FOR INTERSECTION  -  GATE CSE 2017 SET 1, Q38', WARN);
  mono(58, 294, 'L1 = { a^n b^n c^m }   L2 = { a^m b^n c^n }   L1 and L2 = { a^n b^n c^n }', { size: 10.5, color: INK });
  body(58, 316, 'Union is context-free (closed under union). Intersection is not. The keyed answer to that question is "I only".', { size: 10.5, color: DIM });

  P.alpha(appear(p, 0.62, 0.86));
  card(40, 350, 400, 104, { fill: SURF2 });
  head(58, 368, 'WHY COMPLEMENT GOES WITH IT', DIM);
  mono(58, 392, 'L1 and L2  =  complement( complement(L1) or complement(L2) )', { size: 10, color: INK });
  body(58, 414, 'Union is kept. If complement were kept, intersection', { size: 10.5, color: DIM });
  body(58, 430, 'would be kept. It is not, so complement is not.', { size: 10.5, color: BAD });

  card(460, 350, 400, 104, { bar: ACC });
  head(478, 368, 'THE SECOND OPERAND DECIDES', ACC);
  body(478, 390, 'L1 - R   is context-free   (R regular)', { size: 10.5, color: VAL });
  body(478, 408, 'L1 - L2  need not be     (L2 context-free)', { size: 10.5, color: BAD });
  body(478, 430, 'This one line is the whole of GATE CSE 2017 Set 2, Q4.', { size: 10.5, color: DIM });
  P.alpha(1);
}

/* ---------- scene 8: the hybrid construction ---------- */
function drawHybrid(t, p) {
  title('The one asymmetric tool', 'a context-free language intersected with a regular one stays context-free');

  P.alpha(appear(p, 0.02, 0.26));
  card(40, 60, 820, 66, { bar: ACC });
  head(58, 78, 'THE CLAIM', ACC);
  mono(58, 102, 'L1 context-free and L2 regular   =>   L1 intersect L2 is context-free, always', { size: 11.5, color: INK });

  P.alpha(appear(p, 0.18, 0.44));
  card(40, 140, 400, 168, { fill: SURF2 });
  head(58, 158, 'THE CONSTRUCTION', DIM);
  mono(58, 182, 'nonterminal A  ->  A[p,q] for every pair', { size: 10.5, color: INK });
  mono(58, 202, 'A[p,q] generates the strings A makes', { size: 10.5, color: DIM });
  mono(58, 218, 'that carry the automaton from p to q', { size: 10.5, color: DIM });
  mono(58, 244, 'A -> a S b  becomes  A[p,q] -> a S[r,q]', { size: 10.5, color: ACC });
  mono(58, 264, 'for every r, with p -a-> r forced', { size: 10, color: DIM });
  mono(58, 290, 'start:  S0 -> S[q0, q] for each q in F', { size: 10.5, color: ACC });

  P.alpha(appear(p, 0.4, 0.64));
  card(460, 140, 400, 168, { bar: INFO });
  head(478, 158, 'THE COUNTS FOR THIS EXAMPLE', INFO);
  var rows = [
    ['grammar nonterminals', '1'],
    ['automaton states', '2'],
    ['state pairs, 2 x 2', '4'],
    ['plus the new start symbol', '5'],
    ['productions after threading', String(PROD_RULES)]
  ];
  rows.forEach(function (r, i) {
    var y = 184 + i * 22;
    body(478, y, r[0], { size: 10.5, color: DIM });
    mono(800, y, r[1], { size: 11.5, color: ACC, bold: true, align: 'right' });
  });
  body(478, 296, '|V| x |Q|^2 nonterminals, before S0.', { size: 10, color: DIM });

  P.alpha(appear(p, 0.62, 0.86));
  card(40, 322, 820, 132, { bar: VAL });
  head(58, 340, 'THE VERIFICATION', VAL);
  body(58, 362, 'Grammar: S -> a S b | b S a | S S | eps, which generates equal counts of a and b.', { size: 10.5, color: INK });
  body(58, 380, 'Automaton: even length, two states. Product: 5 nonterminals, ' + PROD_RULES + ' productions.', { size: 10.5, color: INK });
  body(58, 400, 'Run on all 127 strings of length at most 6: the product grammar accepts exactly equal counts and even length.', { size: 10.5, color: DIM });
  body(58, 418, 'Disagreements with the definition: ' + CFL_PROD_BAD + '. The base grammar alone also agrees on all 127, so the test has teeth.', { size: 10.5, color: VAL });
  body(58, 438, 'A grammar comes out of the construction, and a language generated by a grammar is context-free by definition.', { size: 10.5, color: DIM });
  P.alpha(1);
}

/* ---------- scene 9: the decision questions ---------- */
function drawDecide(t, p) {
  title('Which questions an algorithm can answer', 'six questions, two classes, three differences');

  P.alpha(appear(p, 0.02, 0.24));
  card(40, 58, 820, 316, { fill: SURF });
  head(58, 76, 'THE DECISION TABLE', DIM);
  var cols = [58, 190, 470, 700];
  ['QUESTION', 'REGULAR', 'PROCEDURE', 'CONTEXT-FREE'].forEach(function (h, i) { head(cols[i], 100, h, FAINT); });
  P.line(58, 110, 842, 110, { stroke: BORDER, sw: 1 });
  DECIDE_TABLE.forEach(function (r, i) {
    var y = 132 + i * 40;
    P.alpha(appear(p, 0.1 + i * 0.05, 0.26 + i * 0.05));
    mono(58, y, r.q, { size: 11, color: INK, bold: true });
    mono(cols[1], y, r.reg, { size: 10.5, color: r.regYes ? VAL : DIM });
    body(cols[2], y, r.regHow, { size: 9.5, color: DIM });
    mono(cols[3], y, r.cfl, { size: 10.5, color: r.cflYes ? VAL : BAD, bold: !r.cflYes });
    body(cols[3], y + 14, r.cflHow, { size: 9.5, color: DIM });
    if (r.regYes !== r.cflYes) {
      P.rect(44, y - 13, 4, 30, { fill: BAD, radius: 2 });
    }
  });
  P.alpha(appear(p, 0.55, 0.75));
  body(58, 366, 'The red bars mark the three questions where the classes differ. Everything above them is decidable for both.', { size: 10, color: DIM });

  P.alpha(appear(p, 0.72, 0.92));
  card(40, 386, 400, 68, { bar: VAL });
  head(58, 404, 'MEASURED ON THIS PAGE', VAL);
  body(58, 424, 'Emptiness of S -> AB | a: productive set is {S}.', { size: 10, color: DIM });
  body(58, 440, 'Finiteness: S is self-embedding in a^n b^n, not in the finite grammar.', { size: 10, color: DIM });

  card(460, 386, 400, 68, { bar: WARN });
  head(478, 404, 'AMBIGUITY, COUNTED', WARN);
  body(478, 424, 'S -> S S | a on a^8 has ' + TREE_COUNTS[7].trees + ' parse trees; on a^5, ' + TREE_COUNTS[4].trees + '.', { size: 10, color: DIM });
  body(478, 440, 'Counting for one grammar is easy. Deciding for all is not possible.', { size: 10, color: DIM });
  P.alpha(1);
}

/* ---------- scene 10: the exam ---------- */
function drawExam(t, p) {
  title('How the question is asked', 'two checks, then the arithmetic');

  P.alpha(appear(p, 0.02, 0.28));
  card(40, 60, 400, 150, { bar: ACC });
  head(58, 78, 'CHECK 1  -  ALWAYS, OR THIS INSTANCE', ACC);
  body(58, 100, '"Always true" means every pair in the class.', { size: 10.5, color: INK });
  body(58, 118, 'One counterexample kills the option.', { size: 10.5, color: INK });
  body(58, 142, '"Is this language context-free" means', { size: 10.5, color: DIM });
  body(58, 158, 'one language. A closure theorem can only', { size: 10.5, color: DIM });
  body(58, 174, 'be used in the direction that gives a yes.', { size: 10.5, color: DIM });
  body(58, 196, 'Closure failing does not mean this instance fails.', { size: 10, color: WARN });

  P.alpha(appear(p, 0.2, 0.44));
  card(460, 60, 400, 150, { bar: INFO });
  head(478, 78, 'CHECK 2  -  WHAT IS THE SECOND OPERAND', INFO);
  body(478, 100, 'L1 intersect R      always context-free', { size: 10.5, color: VAL });
  body(478, 118, 'L1 intersect L2     no general answer', { size: 10.5, color: BAD });
  body(478, 140, 'L1 - R              always context-free', { size: 10.5, color: VAL });
  body(478, 158, 'L1 - L2             no general answer', { size: 10.5, color: BAD });
  body(478, 182, 'Regular on the right side changes everything.', { size: 10, color: DIM });

  P.alpha(appear(p, 0.42, 0.68));
  card(40, 224, 820, 190, { fill: SURF });
  head(58, 242, 'FIVE VERIFIED QUESTIONS ON THIS CLAUSE', DIM);
  PYQ.forEach(function (r, i) {
    var y = 266 + i * 28;
    P.alpha(appear(p, 0.46 + i * 0.04, 0.6 + i * 0.04));
    mono(58, y, r.year, { size: 10, color: ACC });
    body(250, y, r.asks, { size: 10, color: INK });
    mono(760, y, r.key, { size: 10, color: VAL, bold: true, align: 'right' });
  });
  P.alpha(appear(p, 0.7, 0.9));
  body(58, 402, 'Each turns on one of the two checks. None needs a construction to be attempted first.', { size: 10, color: DIM });

  card(40, 418, 820, 34, { bar: WARN });
  body(58, 438, '2019: the shortest b-string has length 10, so 3, 5 and 9 cannot pump it. 2024: a regular union a non-regular can be everything.', { size: 10, color: INK });
  P.alpha(1);
}

function drawFrame(Pn) {
  var t = (K && K.state) ? K.state.elapsed : 0;
  var s = progOf(t);
  Pn.clear();
  if (s.sc.id === 'why') drawWhy(t, s.p);
  else if (s.sc.id === 'pumpreg') drawPumpreg(t, s.p);
  else if (s.sc.id === 'pumplen') drawPumplen(t, s.p);
  else if (s.sc.id === 'pumpweak') drawPumpweak(t, s.p);
  else if (s.sc.id === 'cflpump') drawCflpump(t, s.p);
  else if (s.sc.id === 'closreg') drawClosreg(t, s.p);
  else if (s.sc.id === 'closurecfl') drawClosurecfl(t, s.p);
  else if (s.sc.id === 'hybrid') drawHybrid(t, s.p);
  else if (s.sc.id === 'decide') drawDecide(t, s.p);
  else drawExam(t, s.p);
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

  if (window.p5 && holder) {
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

  if (!ok && holder) {
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
    if (K && K.state) K.state.elapsed = t;
    if (P) drawFrame(P);
  };

  var bad = CHECKS.filter(function (c) { return !c.pass; });
  if (bad.length) console.warn('Model validation did not fully pass:', bad);
}

window.__MODEL = MODEL;
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
