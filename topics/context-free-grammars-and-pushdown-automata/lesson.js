/* ==========================================================================
   context-free-grammars-and-pushdown-automata — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no derivation, no parsing and no
   simulation of its own; every figure on the canvas was computed once, here,
   and checked against the definition it is supposed to satisfy.
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

/* ---------- grammars ----------
   A grammar is { V: nonterminals, T: terminals, S: start, P: {A: [rhs, ...]} }.
   An rhs is an array of symbols; the empty array is the epsilon rule. */

function gr(V, T, S, P) { return { V: V, T: T, S: S, P: P }; }

var G = {
  /* S -> aSb | eps : the canonical one-comparison language */
  anbn: gr(['S'], ['a', 'b'], 'S', { S: [['a', 'S', 'b'], []] }),
  /* S -> AC, A -> aAb | eps, C -> cC | eps : one comparison, third block free */
  anbncm: gr(['S', 'A', 'C'], ['a', 'b', 'c'], 'S',
    { S: [['A', 'C']], A: [['a', 'A', 'b'], []], C: [['c', 'C'], []] }),
  /* S -> AB, A -> aA | eps, B -> bBc | eps : one comparison, first block free */
  ambncn: gr(['S', 'A', 'B'], ['a', 'b', 'c'], 'S',
    { S: [['A', 'B']], A: [['a', 'A'], []], B: [['b', 'B', 'c'], []] }),
  /* S -> aSa | bSb | eps : the mirror language */
  wwR: gr(['S'], ['a', 'b'], 'S', { S: [['a', 'S', 'a'], ['b', 'S', 'b'], []] }),
  /* S -> aSa | bSb | a | b : odd length palindromes, GATE CSE 2009 */
  palOdd: gr(['S'], ['a', 'b'], 'S',
    { S: [['a', 'S', 'a'], ['b', 'S', 'b'], ['a'], ['b']] }),
  /* the classic ambiguous expression grammar */
  exprAmbig: gr(['E'], ['i', '+', '*'], 'E',
    { E: [['E', '+', 'E'], ['E', '*', 'E'], ['i']] }),
  /* the same language, precedence carried by the levels */
  exprUnambig: gr(['E', 'T', 'F'], ['i', '+', '*'], 'E',
    { E: [['E', '+', 'T'], ['T']], T: [['T', '*', 'F'], ['F']], F: [['i']] }),
  /* S -> aSa | bSb | A, A -> aAb | eps : w a^n b^n w^R, GATE CSE 2019 option B */
  wanBnWr: gr(['S', 'A'], ['a', 'b'], 'S',
    { S: [['a', 'S', 'a'], ['b', 'S', 'b'], ['A']], A: [['a', 'A', 'b'], []] }),
  /* the union of the two free-block languages, GATE CSE 2017 Set 1 */
  union2017: gr(['S', 'X', 'C', 'A', 'B'], ['a', 'b', 'c'], 'S',
    { S: [['X', 'C'], ['A', 'B']],
      X: [['a', 'X', 'b'], []], C: [['c', 'C'], []],
      A: [['a', 'A'], []], B: [['b', 'B', 'c'], []] }),
  /* a^n b^i with i in {n, 3n, 5n} as a union of three, GATE CSE 2019 option D */
  ratio135: gr(['S', 'P', 'Q', 'R'], ['a', 'b'], 'S',
    { S: [['P'], ['Q'], ['R']],
      P: [['a', 'P', 'b'], []],
      Q: [['a', 'Q', 'b', 'b', 'b'], []],
      R: [['a', 'R', 'b', 'b', 'b', 'b', 'b'], []] }),
  /* balanced brackets, used for the normal-form conversion */
  dyck: gr(['S'], ['(', ')'], 'S', { S: [['(', 'S', ')', 'S'], []] })
};

function isNT(g, s) { return g.V.indexOf(s) >= 0; }

/* every terminal string of length at most maxLen, by leftmost derivation.
   Leftmost order loses no strings: any derivation can be reordered leftmost. */
function langSample(g, maxLen) {
  var out = {}, seen = {}, stack = [[g.S]], guard = 0;
  seen[g.S] = true;
  while (stack.length && guard++ < 300000) {
    var form = stack.pop();
    var nt = -1, terms = 0, i;
    for (i = 0; i < form.length; i++) {
      if (isNT(g, form[i])) { if (nt < 0) nt = i; } else terms++;
    }
    if (terms > maxLen) continue;
    if (nt < 0) { out[form.join('')] = true; continue; }
    var A = form[nt], rules = g.P[A] || [];
    for (var r = 0; r < rules.length; r++) {
      var nf = form.slice(0, nt).concat(rules[r], form.slice(nt + 1));
      var t2 = 0;
      for (i = 0; i < nf.length; i++) if (!isNT(g, nf[i])) t2++;
      if (t2 > maxLen) continue;
      if (nf.length > maxLen + 4) continue;
      var key = nf.join('\u0001');
      if (seen[key]) continue;
      seen[key] = true;
      stack.push(nf);
    }
  }
  return out;
}

/* ---------- Chomsky normal form ----------
   useless symbols, then epsilon rules, then unit rules, then binarise. */

function rulesOf(g) {
  var out = [];
  for (var A in g.P) {
    if (!g.P.hasOwnProperty(A)) continue;
    for (var i = 0; i < g.P[A].length; i++) out.push({ lhs: A, rhs: g.P[A][i].slice() });
  }
  return out;
}

function toCNF(g) {
  var rules = rulesOf(g);
  var V = g.V.slice(), T = g.T.slice(), i, j, r, changed;

  /* 1. drop non-generating symbols, then unreachable ones */
  var generating = {};
  for (i = 0; i < T.length; i++) generating[T[i]] = true;
  do {
    changed = false;
    for (i = 0; i < rules.length; i++) {
      r = rules[i];
      if (generating[r.lhs]) continue;
      var allGen = true;
      for (j = 0; j < r.rhs.length; j++) if (!generating[r.rhs[j]]) allGen = false;
      if (allGen) { generating[r.lhs] = true; changed = true; }
    }
  } while (changed);

  var reachable = {}; reachable[g.S] = true;
  do {
    changed = false;
    for (i = 0; i < rules.length; i++) {
      r = rules[i];
      if (!reachable[r.lhs]) continue;
      for (j = 0; j < r.rhs.length; j++) {
        var s = r.rhs[j];
        if (isNT(g, s) && !reachable[s]) { reachable[s] = true; changed = true; }
      }
    }
  } while (changed);

  rules = rules.filter(function (r) {
    if (!generating[r.lhs] || !reachable[r.lhs]) return false;
    for (var k = 0; k < r.rhs.length; k++) {
      var s = r.rhs[k];
      if (isNT(g, s) && (!generating[s] || !reachable[s])) return false;
      if (!isNT(g, s) && T.indexOf(s) < 0) return false;
    }
    return true;
  });

  /* 2. epsilon rules: nullable set, then every variant that drops them */
  var nullable = {};
  do {
    changed = false;
    for (i = 0; i < rules.length; i++) {
      r = rules[i];
      if (nullable[r.lhs]) continue;
      var allNull = true;
      for (j = 0; j < r.rhs.length; j++) if (!nullable[r.rhs[j]]) allNull = false;
      if (allNull) { nullable[r.lhs] = true; changed = true; }
    }
  } while (changed);

  var hasEps = !!nullable[g.S];
  var noEps = [];
  for (i = 0; i < rules.length; i++) {
    r = rules[i];
    if (r.rhs.length === 0) continue;
    var opts = [[]];
    for (j = 0; j < r.rhs.length; j++) {
      var sym = r.rhs[j], next = [];
      for (var o = 0; o < opts.length; o++) {
        next.push(opts[o].concat([sym]));
        if (nullable[sym]) next.push(opts[o].slice());
      }
      opts = next;
    }
    for (o = 0; o < opts.length; o++) {
      if (opts[o].length === 0) continue;
      noEps.push({ lhs: r.lhs, rhs: opts[o] });
    }
  }
  rules = noEps;

  /* 3. unit rules: transitive closure of A => B, then copy B's rules onto A */
  var unit = {};
  for (i = 0; i < V.length; i++) {
    unit[V[i]] = {}; unit[V[i]][V[i]] = true;
  }
  do {
    changed = false;
    for (i = 0; i < rules.length; i++) {
      r = rules[i];
      if (r.rhs.length !== 1 || !isNT(g, r.rhs[0])) continue;
      for (var B in unit[r.rhs[0]]) {
        if (unit[r.rhs[0]].hasOwnProperty(B) && !unit[r.lhs][B]) {
          unit[r.lhs][B] = true; changed = true;
        }
      }
    }
  } while (changed);

  var nonUnit = rules.filter(function (r) {
    return !(r.rhs.length === 1 && isNT(g, r.rhs[0]));
  });
  var expanded = [];
  for (i = 0; i < nonUnit.length; i++) {
    r = nonUnit[i];
    for (var A in unit) {
      if (!unit.hasOwnProperty(A) || !unit[A][r.lhs]) continue;
      expanded.push({ lhs: A, rhs: r.rhs.slice() });
    }
  }
  rules = expanded;

  /* 4. terminalise, then binarise */
  var V2 = V.slice(), counter = 0, out = [];
  function fresh() {
    var name = 'N' + (++counter);
    while (V2.indexOf(name) >= 0) name = 'N' + (++counter);
    V2.push(name);
    return name;
  }
  var termRules = [];
  for (i = 0; i < rules.length; i++) {
    r = rules[i];
    if (r.rhs.length === 1 && T.indexOf(r.rhs[0]) >= 0) {
      out.push({ lhs: r.lhs, rhs: [r.rhs[0]] });
      continue;
    }
    var rhs = [];
    for (j = 0; j < r.rhs.length; j++) {
      var s2 = r.rhs[j];
      if (isNT(g, s2)) { rhs.push(s2); continue; }
      var holder = null;
      for (var q = 0; q < termRules.length; q++) if (termRules[q].t === s2) holder = termRules[q].v;
      if (!holder) { holder = fresh(); termRules.push({ t: s2, v: holder }); }
      rhs.push(holder);
    }
    out.push({ lhs: r.lhs, rhs: rhs });
  }
  for (i = 0; i < termRules.length; i++) {
    out.push({ lhs: termRules[i].v, rhs: [termRules[i].t] });
  }
  var binary = [];
  for (i = 0; i < out.length; i++) {
    r = out[i];
    if (r.rhs.length <= 2) { binary.push(r); continue; }
    var cur = r.rhs.slice();
    var head = r.lhs;
    while (cur.length > 2) {
      var v = fresh();
      binary.push({ lhs: head, rhs: [cur[0], v] });
      cur = cur.slice(1);
      head = v;
    }
    binary.push({ lhs: head, rhs: cur });
  }

  var P2 = {};
  for (i = 0; i < binary.length; i++) {
    var L = binary[i].lhs;
    if (!P2[L]) P2[L] = [];
    P2[L].push(binary[i].rhs);
  }
  return { V: V2, T: T.slice(), S: g.S, P: P2, hasEps: hasEps };
}

/* CYK membership on a grammar already in Chomsky normal form */
function cyk(cnf, w) {
  var n = w.length, i, j, k, len;
  if (n === 0) return !!cnf.hasEps;
  var table = [];
  for (i = 0; i < n; i++) { table.push([]); for (j = 0; j < n; j++) table[i].push({}); }
  for (i = 0; i < n; i++) {
    for (var A in cnf.P) {
      if (!cnf.P.hasOwnProperty(A)) continue;
      for (var r = 0; r < cnf.P[A].length; r++) {
        var rhs = cnf.P[A][r];
        if (rhs.length === 1 && rhs[0] === w[i]) table[i][i][A] = true;
      }
    }
  }
  for (len = 2; len <= n; len++) {
    for (i = 0; i + len - 1 < n; i++) {
      j = i + len - 1;
      for (k = i; k < j; k++) {
        for (var B in cnf.P) {
          if (!cnf.P.hasOwnProperty(B)) continue;
          for (var r2 = 0; r2 < cnf.P[B].length; r2++) {
            var rhs2 = cnf.P[B][r2];
            if (rhs2.length !== 2) continue;
            if (table[i][k][rhs2[0]] && table[k + 1][j][rhs2[1]]) table[i][j][B] = true;
          }
        }
      }
    }
  }
  return !!table[0][n - 1][cnf.S];
}

/* the number of distinct parse trees, by the inside algorithm.
   Unit rules are skipped: none of the grammars counted here has one. */
function countTrees(g, A, w) {
  var memo = {};
  function symCount(sym, i, j) {
    if (!isNT(g, sym)) return (j === i + 1 && w[i] === sym) ? 1 : 0;
    return nonCount(sym, i, j);
  }
  function seqCount(rhs, k, i, j) {
    if (k === rhs.length) return i === j ? 1 : 0;
    var total = 0;
    for (var m = i; m <= j; m++) {
      var a = symCount(rhs[k], i, m);
      if (!a) continue;
      var b = seqCount(rhs, k + 1, m, j);
      if (b) total += a * b;
      if (total > 1e9) return 1e9;
    }
    return total;
  }
  var busy = {};
  function nonCount(sym, i, j) {
    var key = sym + ':' + i + ':' + j;
    if (memo[key] !== undefined) return memo[key];
    if (busy[key]) return 0;          /* a unit cycle would otherwise loop */
    busy[key] = true;
    var rules = g.P[sym] || [], total = 0;
    for (var r = 0; r < rules.length; r++) {
      total += seqCount(rules[r], 0, i, j);
      if (total > 1e9) { total = 1e9; break; }
    }
    delete busy[key];
    memo[key] = total;
    return total;
  }
  return nonCount(A, 0, w.length);
}

/* the derivation steps of one string, for the animation */
function derivationOf(g, target) {
  var steps = [[g.S]], guard = 0;
  while (guard++ < 200) {
    var form = steps[steps.length - 1];
    if (form.join('') === target) return steps;
    var nt = -1;
    for (var i = 0; i < form.length; i++) if (isNT(g, form[i])) { nt = i; break; }
    if (nt < 0) return steps;
    var rules = g.P[form[nt]] || [], chosen = null;
    for (var r = 0; r < rules.length; r++) {
      var nf = form.slice(0, nt).concat(rules[r], form.slice(nt + 1));
      if (fits(g, nf, target)) { chosen = nf; break; }
    }
    if (!chosen) return steps;
    steps.push(chosen);
  }
  return steps;
}
/* the terminals of a sentential form must survive, in order, inside the target:
   they have to be a subsequence of it, and a nonterminal must still be present. */
function fits(g, form, target) {
  var terms = [], pending = 0;
  for (var i = 0; i < form.length; i++) {
    if (isNT(g, form[i])) pending++;
    else terms.push(form[i]);
  }
  if (!pending) return form.join('') === target;
  if (terms.length > target.length) return false;
  var k = 0;
  for (var j = 0; j < target.length && k < terms.length; j++) if (target[j] === terms[k]) k++;
  return k === terms.length;
}

/* ---------- membership, straight from the definitions ---------- */
function count(s, c) { var n = 0; for (var i = 0; i < s.length; i++) if (s[i] === c) n++; return n; }
function blocks(s, alpha) {
  var re = new RegExp('^' + alpha.map(function (c) { return c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '*'; }).join('') + '$');
  return re.test(s);
}
function isAnBn(s) { return blocks(s, ['a', 'b']) && count(s, 'a') === count(s, 'b'); }
function isAnBnCm(s) { return blocks(s, ['a', 'b', 'c']) && count(s, 'a') === count(s, 'b'); }
function isAmBnCn(s) { return blocks(s, ['a', 'b', 'c']) && count(s, 'b') === count(s, 'c'); }
function isAnBnCn(s) {
  return blocks(s, ['a', 'b', 'c']) &&
    count(s, 'a') === count(s, 'b') && count(s, 'b') === count(s, 'c');
}
function isWwR(s) {
  if (s.length % 2 !== 0) return false;
  var h = s.length / 2;
  return s.slice(0, h) === s.slice(h).split('').reverse().join('');
}
function isWw(s) {
  if (s.length % 2 !== 0) return false;
  var h = s.length / 2;
  return s.slice(0, h) === s.slice(h);
}
function isPalOdd(s) {
  if (s.length % 2 === 0) return false;
  return s === s.split('').reverse().join('');
}
function isWanBnWr(s) {
  for (var n = 0; n <= s.length / 2; n++) {
    var rest = s.length - 2 * n;
    if (rest < 0 || rest % 2 !== 0) continue;
    var h = rest / 2;
    var w = s.slice(0, h);
    var mid = s.slice(h, h + 2 * n);
    var back = s.slice(h + 2 * n);
    if (mid !== new Array(n + 1).join('a') + new Array(n + 1).join('b')) continue;
    if (back !== w.split('').reverse().join('')) continue;
    return true;
  }
  return false;
}
function isWanWrBn(s) {
  for (var n = 0; n <= s.length; n++) {
    if (n > 0) {
      var tail = s.slice(s.length - n);
      if (tail !== new Array(n + 1).join('b')) continue;
    }
    var t = s.slice(0, s.length - n);
    if (t.length < n) continue;
    if ((t.length - n) % 2 !== 0) continue;
    var h = (t.length - n) / 2;
    var w = t.slice(0, h);
    var mid = t.slice(h, h + n);
    var back = t.slice(h + n);
    if (mid !== new Array(n + 1).join('a')) continue;
    if (back !== w.split('').reverse().join('')) continue;
    return true;
  }
  return false;
}
function isExpr(s) {
  if (!s.length) return false;
  if (s[0] !== 'i' || s[s.length - 1] !== 'i') return false;
  for (var i = 0; i < s.length; i++) {
    var wantId = i % 2 === 0;
    if (wantId && s[i] !== 'i') return false;
    if (!wantId && s[i] !== '+' && s[i] !== '*') return false;
  }
  return true;
}
function isRatio135(s) {
  if (!blocks(s, ['a', 'b'])) return false;
  var na = count(s, 'a'), nb = count(s, 'b');
  if (na === 0) return nb === 0;
  return nb === na || nb === 3 * na || nb === 5 * na;
}

/* every string over an alphabet up to a length, in order */
function allStrings(alpha, maxLen) {
  var out = [''];
  var layer = [''];
  for (var L = 1; L <= maxLen; L++) {
    var next = [];
    for (var i = 0; i < layer.length; i++) {
      for (var a = 0; a < alpha.length; a++) next.push(layer[i] + alpha[a]);
    }
    out = out.concat(next);
    layer = next;
  }
  return out;
}

/* does a grammar generate exactly the strings a predicate accepts, up to maxLen? */
function languageMatches(g, pred, alpha, maxLen) {
  var got = langSample(g, maxLen), bad = [];
  for (var s in got) {
    if (got.hasOwnProperty(s) && !pred(s)) bad.push(s);
  }
  var all = allStrings(alpha, maxLen);
  for (var i = 0; i < all.length; i++) {
    if (pred(all[i]) && !got[all[i]]) bad.push(all[i]);
  }
  return { ok: bad.length === 0, bad: bad.slice(0, 5), size: Object.keys(got).length };
}

/* ---------- pushdown machines ----------
   A machine is { Q, S, G, q0, Z, F, delta, mode }.
   delta(q, inputSymbolOrEmpty, top) returns an array of [nextState, pushArray],
   where pushArray[0] becomes the new top. */

function pda(Q, S, GAM, q0, Z, F, delta, mode) {
  return { Q: Q, S: S, G: GAM, q0: q0, Z: Z, F: F, delta: delta, mode: mode };
}

var M_anbn = pda(['q0', 'q1', 'qf'], ['a', 'b'], ['Z', 'A'], 'q0', 'Z', ['qf'],
  function (q, c, top) {
    if (q === 'q0' && c === 'a') return [['q0', ['A', top]]];
    if (q === 'q0' && c === 'b' && top === 'A') return [['q1', []]];
    if (q === 'q1' && c === 'b' && top === 'A') return [['q1', []]];
    if (q === 'q0' && c === '' && top === 'Z') return [['qf', ['Z']]];
    if (q === 'q1' && c === '' && top === 'Z') return [['qf', ['Z']]];
    return [];
  }, 'final');

var M_wwR = pda(['q0', 'q1', 'qf'], ['a', 'b'], ['Z', 'A', 'B'], 'q0', 'Z', ['qf'],
  function (q, c, top) {
    var out = [];
    if (q === 'q0' && (c === 'a' || c === 'b')) out.push(['q0', [c === 'a' ? 'A' : 'B', top]]);
    if (q === 'q0' && c === '') out.push(['q1', [top]]);
    if (q === 'q1' && c === 'a' && top === 'A') out.push(['q1', []]);
    if (q === 'q1' && c === 'b' && top === 'B') out.push(['q1', []]);
    if (q === 'q1' && c === '' && top === 'Z') out.push(['qf', ['Z']]);
    return out;
  }, 'final');

var M_anbncm = pda(['q0', 'q1', 'q2', 'qf'], ['a', 'b', 'c'], ['Z', 'A'], 'q0', 'Z', ['qf'],
  function (q, c, top) {
    if (q === 'q0' && c === 'a') return [['q0', ['A', top]]];
    if (q === 'q0' && c === 'b' && top === 'A') return [['q1', []]];
    if (q === 'q1' && c === 'b' && top === 'A') return [['q1', []]];
    if (q === 'q0' && c === 'c' && top === 'Z') return [['q2', ['Z']]];
    if (q === 'q1' && c === 'c' && top === 'Z') return [['q2', ['Z']]];
    if (q === 'q2' && c === 'c' && top === 'Z') return [['q2', ['Z']]];
    if ((q === 'q0' || q === 'q1' || q === 'q2') && c === '' && top === 'Z') return [['qf', ['Z']]];
    return [];
  }, 'final');

/* breadth-first over configurations: does any run accept? */
function pdaAccepts(m, w) {
  var start = m.q0 + '|0|' + m.Z;
  var seen = {}, queue = [{ q: m.q0, i: 0, st: [m.Z] }], guard = 0;
  seen[start] = true;
  while (queue.length && guard++ < 20000) {
    var c = queue.shift();
    var accepting = c.i === w.length && (m.mode === 'final'
      ? m.F.indexOf(c.q) >= 0
      : c.st.length === 0);
    if (accepting) return true;
    var moves = [];
    var top = c.st.length ? c.st[c.st.length - 1] : null;
    if (top !== null) {
      var k;
      var eps = m.delta(c.q, '', top) || [];
      for (k = 0; k < eps.length; k++) {
        moves.push({ q: eps[k][0], i: c.i, push: eps[k][1] });
      }
      if (c.i < w.length) {
        var sym = m.delta(c.q, w[c.i], top) || [];
        for (k = 0; k < sym.length; k++) {
          moves.push({ q: sym[k][0], i: c.i + 1, push: sym[k][1] });
        }
      }
    }
    for (k = 0; k < moves.length; k++) {
      var mv = moves[k];
      var st = c.st.slice(0, c.st.length - 1);
      for (var p = mv.push.length - 1; p >= 0; p--) st.push(mv.push[p]);
      var key = mv.q + '|' + mv.i + '|' + st.join('');
      if (seen[key]) continue;
      seen[key] = true;
      queue.push({ q: mv.q, i: mv.i, st: st });
    }
  }
  return false;
}

/* one deterministic trace, for the animation: the stack after each symbol */
function pdaTrace(m, w) {
  var trace = [{ i: 0, q: m.q0, st: [m.Z], ch: '\u03b5' }];
  var q = m.q0, st = [m.Z];
  for (var i = 0; i < w.length; i++) {
    var top = st[st.length - 1];
    var nexts = m.delta(q, w[i], top) || [];
    if (!nexts.length) break;
    q = nexts[0][0];
    st = st.slice(0, st.length - 1);
    for (var p = nexts[0][1].length - 1; p >= 0; p--) st.push(nexts[0][1][p]);
    trace.push({ i: i + 1, q: q, st: st.slice(), ch: w[i] });
  }
  /* the closing epsilon move, if the machine has one */
  var last = st.length ? st[st.length - 1] : null;
  if (last !== null) {
    var fin = m.delta(q, '', last) || [];
    if (fin.length) {
      q = fin[0][0];
      st = st.slice(0, st.length - 1);
      for (var e = fin[0][1].length - 1; e >= 0; e--) st.push(fin[0][1][e]);
      trace.push({ i: w.length, q: q, st: st.slice(), ch: '\u03b5' });
    }
  }
  return trace;
}

/* ---------- the pumping lemma ----------
   every split s = u v w x y with |v w x| <= p and |v x| >= 1 */
function splitsOf(s, p) {
  var out = [], n = s.length;
  for (var a = 0; a <= n; a++) {
    for (var b = a; b <= n; b++) {
      for (var c = b; c <= n; c++) {
        for (var d = c; d <= n; d++) {
          var u = s.slice(0, a), v = s.slice(a, b), w = s.slice(b, c),
              x = s.slice(c, d), y = s.slice(d);
          if ((v + w + x).length > p) continue;
          if ((v + x).length < 1) continue;
          out.push({ u: u, v: v, w: w, x: x, y: y });
        }
      }
    }
  }
  return out;
}

function pumped(sp, i) {
  var v = new Array(i + 1).join(sp.v), x = new Array(i + 1).join(sp.x);
  return sp.u + v + sp.w + x + sp.y;
}

/* for each split, find a repetition count that leaves the language */
function refutePumping(s, p, pred) {
  var splits = splitsOf(s, p), survivors = [], witness = null, counts = [0, 2, 3];
  for (var k = 0; k < splits.length; k++) {
    var sp = splits[k], broke = false;
    for (var c = 0; c < counts.length; c++) {
      var out = pumped(sp, counts[c]);
      if (!pred(out)) {
        broke = true;
        if (!witness) witness = { split: sp, i: counts[c], out: out };
        break;
      }
    }
    if (!broke) survivors.push(sp);
  }
  return { total: splits.length, survivors: survivors.length, witness: witness };
}

/* ---------- the numbers the page shows ---------- */

var V = {};

/* derivations */
V.deriv = {
  target: 'aabb',
  steps: derivationOf(G.anbn, 'aabb').map(function (f) { return f.join(''); }),
  stepsLong: derivationOf(G.anbn, 'aaabbb').map(function (f) { return f.join(''); })
};

/* ambiguity and parse-tree counts */
V.trees = {
  counts: {
    'i': countTrees(G.exprAmbig, 'E', 'i'),
    'i+i': countTrees(G.exprAmbig, 'E', 'i+i'),
    'i+i*i': countTrees(G.exprAmbig, 'E', 'i+i*i'),
    'i+i+i': countTrees(G.exprAmbig, 'E', 'i+i+i'),
    'i*i*i': countTrees(G.exprAmbig, 'E', 'i*i*i'),
    'i+i*i+i': countTrees(G.exprAmbig, 'E', 'i+i*i+i')
  },
  unambig: {
    'i+i*i': countTrees(G.exprUnambig, 'E', 'i+i*i'),
    'i+i*i+i': countTrees(G.exprUnambig, 'E', 'i+i*i+i'),
    'i*i*i': countTrees(G.exprUnambig, 'E', 'i*i*i')
  }
};

/* normal form */
var CNF = {
  anbn: toCNF(G.anbn),
  anbncm: toCNF(G.anbncm),
  ambncn: toCNF(G.ambncn),
  wwR: toCNF(G.wwR),
  palOdd: toCNF(G.palOdd),
  dyck: toCNF(G.dyck),
  ratio135: toCNF(G.ratio135),
  wanBnWr: toCNF(G.wanBnWr)
};
V.cnf = {
  rules: (function () {
    var out = [];
    for (var A in CNF.anbn.P) {
      if (!CNF.anbn.P.hasOwnProperty(A)) continue;
      for (var i = 0; i < CNF.anbn.P[A].length; i++) {
        out.push(A + ' \u2192 ' + (CNF.anbn.P[A][i].length ? CNF.anbn.P[A][i].join(' ') : '\u03b5'));
      }
    }
    return out;
  })(),
  nonterminals: CNF.anbn.V.length,
  /* a CNF tree for a string of length n has 2n-1 nodes */
  leaf: 4,
  nodes: 2 * 4 - 1,
  steps: 2 * 4 - 1 - 1
};

/* pushdown machines */
V.pda = {
  trace: pdaTrace(M_anbn, 'aabb'),
  traceLen: pdaTrace(M_anbn, 'aabb').length,
  anbn: (function () {
    var all = allStrings(['a', 'b'], 6), agree = 0, total = 0;
    for (var i = 0; i < all.length; i++) {
      total++;
      if (pdaAccepts(M_anbn, all[i]) === isAnBn(all[i])) agree++;
    }
    return { agree: agree, total: total };
  })(),
  wwR: (function () {
    var all = allStrings(['a', 'b'], 6), agree = 0, total = 0;
    for (var i = 0; i < all.length; i++) {
      total++;
      if (pdaAccepts(M_wwR, all[i]) === isWwR(all[i])) agree++;
    }
    return { agree: agree, total: total };
  })(),
  anbncm: (function () {
    var all = allStrings(['a', 'b', 'c'], 4), agree = 0, total = 0;
    for (var i = 0; i < all.length; i++) {
      total++;
      if (pdaAccepts(M_anbncm, all[i]) === isAnBnCm(all[i])) agree++;
    }
    return { agree: agree, total: total };
  })()
};

/* pumping refutations */
V.pump = {
  anbncn: [2, 3].map(function (p) {
    var s = new Array(p + 1).join('a') + new Array(p + 1).join('b') + new Array(p + 1).join('c');
    var r = refutePumping(s, p, isAnBnCn);
    return { p: p, s: s, total: r.total, survivors: r.survivors, witness: r.witness };
  }),
  ww: (function () {
    var p = 2;
    var s = 'aabb' + 'aabb';
    var r = refutePumping(s, p, isWw);
    return { p: p, s: s, total: r.total, survivors: r.survivors, witness: r.witness };
  })(),
  wanwrbn: (function () {
    /* the two trailing b-blocks merge, so a string of pure b's re-parses after
       pumping. Alternating the w and w-reversed blocks closes that gap. */
    var rep = function (c, k) { return new Array(k + 1).join(c); };
    var cases = [2, 3].map(function (p) {
      var s = rep('ab', 2 * p) + rep('a', 2 * p) + rep('ba', 2 * p) + rep('b', 2 * p);
      var r = refutePumping(s, p, isWanWrBn);
      return { p: p, s: s, total: r.total, survivors: r.survivors, witness: r.witness };
    });
    return {
      cases: cases,
      total: cases[0].total,
      survivors: cases[0].survivors + cases[1].survivors,
      witness: cases[0].witness
    };
  })()
};

/* the 2019 option C language, { w a^n w^R b^n }, is refuted above */

/* closure computations */
V.closure = {
  inter: (function () {
    var all = allStrings(['a', 'b', 'c'], 6), both = [], third = [], bad = 0;
    for (var i = 0; i < all.length; i++) {
      var s = all[i];
      if (isAnBnCm(s) && isAmBnCn(s)) { both.push(s); if (!isAnBnCn(s)) bad++; }
      if (isAnBnCn(s)) { third.push(s); if (!(isAnBnCm(s) && isAmBnCn(s))) bad++; }
    }
    return { left: both.length, right: third.length, bad: bad };
  })(),
  union: languageMatches(G.union2017, function (s) { return isAnBnCm(s) || isAmBnCn(s); },
    ['a', 'b', 'c'], 5)
};

/* the GATE options, each decided by the model */
V.gate = {
  q2019: {
    A: languageMatches(G.wwR, isWwR, ['a', 'b'], 6),
    B: languageMatches(G.wanBnWr, isWanBnWr, ['a', 'b'], 6),
    C: V.pump.wanwrbn,
    D: languageMatches(G.ratio135, isRatio135, ['a', 'b'], 6)
  },
  q2017: {
    union: languageMatches(G.union2017, function (s) { return isAnBnCm(s) || isAmBnCn(s); },
      ['a', 'b', 'c'], 5),
    inter: isAnBnCn('aabbcc')
  },
  q2009: {
    oddPal: languageMatches(G.palOdd, isPalOdd, ['a', 'b'], 6),
    counter: 'aa'
  }
};

/* the languages of the four classes, for the limits scene */
V.limits = {
  anbn: languageMatches(G.anbn, isAnBn, ['a', 'b'], 6),
  anbncm: languageMatches(G.anbncm, isAnBnCm, ['a', 'b', 'c'], 4),
  ambncn: languageMatches(G.ambncn, isAmBnCn, ['a', 'b', 'c'], 4),
  wwR: languageMatches(G.wwR, isWwR, ['a', 'b'], 6),
  dyck: (function () {
    var g = langSample(G.dyck, 6), n = 0;
    for (var s in g) if (g.hasOwnProperty(s)) n++;
    return n;
  })()
};

/* ======================================================================
   LAYER 2 - THE CHECKS
   Each check re-verifies one computed value against its own definition.
   ====================================================================== */

/* grammars generate what the definitions say */
chk('grammar S->aSb|eps generates exactly a^n b^n up to length 6',
  V.limits.anbn.ok, V.limits.anbn.bad.join(', '));
chk('grammar for a^n b^n c^m generates exactly that language up to length 4',
  V.limits.anbncm.ok, V.limits.anbncm.bad.join(', '));
chk('grammar for a^m b^n c^n generates exactly that language up to length 4',
  V.limits.ambncn.ok, V.limits.ambncn.bad.join(', '));
chk('grammar S->aSa|bSb|eps generates exactly the mirror language up to length 6',
  V.limits.wwR.ok, V.limits.wwR.bad.join(', '));
chk('grammar S->aSa|bSb|a|b generates exactly the odd-length palindromes up to length 6',
  V.gate.q2009.oddPal.ok, V.gate.q2009.oddPal.bad.join(', '));
chk('that grammar does not generate the empty string',
  langSample(G.palOdd, 6)[''] === undefined);
chk('the empty string is a palindrome of even length, so it is not in the odd-palindrome set',
  !isPalOdd(''));
chk('the counterexample aa begins and ends with a, and is not generated',
  langSample(G.palOdd, 6)['aa'] === undefined && V.gate.q2009.counter === 'aa');

/* normal form */
var cnfKeys = ['anbn', 'anbncm', 'ambncn', 'wwR', 'palOdd', 'dyck', 'ratio135', 'wanBnWr'];
var cnfOk = 0, cnfBad = [];
for (var ci = 0; ci < cnfKeys.length; ci++) {
  var key = cnfKeys[ci], g0 = G[key], c0 = CNF[key];
  var alpha0 = g0.T, bad0 = 0;
  var all0 = allStrings(alpha0, alpha0.length > 2 ? 4 : 5);
  for (var ai = 0; ai < all0.length; ai++) {
    var s0 = all0[ai];
    var direct = !!langSample(g0, s0.length)[s0];
    var viaCnf = cyk(c0, s0);
    if (direct !== viaCnf) bad0++;
  }
  if (bad0 === 0) cnfOk++; else cnfBad.push(key + ':' + bad0);
}
chk('Chomsky conversion preserves the language on every string tested, for all 8 grammars',
  cnfOk === cnfKeys.length, cnfBad.join(', '));

var cnfShapeOk = true, cnfShapeDetail = '';
for (var ck2 in CNF) {
  if (!CNF.hasOwnProperty(ck2)) continue;
  var gg = CNF[ck2];
  for (var A2 in gg.P) {
    if (!gg.P.hasOwnProperty(A2)) continue;
    for (var r2 = 0; r2 < gg.P[A2].length; r2++) {
      var rhs3 = gg.P[A2][r2];
      var okShape = (rhs3.length === 2 && rhs3.every(function (x) { return gg.V.indexOf(x) >= 0; }))
        || (rhs3.length === 1 && gg.T.indexOf(rhs3[0]) >= 0);
      if (!okShape) { cnfShapeOk = false; cnfShapeDetail = A2 + ' -> ' + rhs3.join(' '); }
    }
  }
}
chk('every converted grammar is genuinely in Chomsky normal form',
  cnfShapeOk, cnfShapeDetail);
chk('the converted grammar for a^n b^n has the expected shape',
  V.cnf.rules.length >= 2 && V.cnf.nonterminals >= 1, V.cnf.rules.join(' | '));
chk('a CNF tree for a string of length 4 has 2n-1 = 7 nodes',
  V.cnf.nodes === 2 * V.cnf.leaf - 1);
chk('CYK accepts aabb and rejects abab in the converted grammar',
  cyk(CNF.anbn, 'aabb') && !cyk(CNF.anbn, 'abab'));
chk('CYK accepts the empty string exactly when the grammar is nullable',
  cyk(CNF.anbn, '') === !!CNF.anbn.hasEps);
chk('CYK agrees with the definition on all strings up to length 6',
  (function () {
    var all = allStrings(['a', 'b'], 6), bad = 0;
    for (var i = 0; i < all.length; i++) if (cyk(CNF.anbn, all[i]) !== isAnBn(all[i])) bad++;
    return bad === 0;
  })());

/* ambiguity and counting */
chk('the ambiguous grammar gives 2 trees for i+i*i', V.trees.counts['i+i*i'] === 2,
  'got ' + V.trees.counts['i+i*i']);
chk('the ambiguous grammar gives 2 trees for i+i+i', V.trees.counts['i+i+i'] === 2,
  'got ' + V.trees.counts['i+i+i']);
chk('the ambiguous grammar gives 2 trees for i*i*i', V.trees.counts['i*i*i'] === 2,
  'got ' + V.trees.counts['i*i*i']);
chk('the ambiguous grammar gives 5 trees for i+i*i+i, the Catalan number C3',
  V.trees.counts['i+i*i+i'] === 5, 'got ' + V.trees.counts['i+i*i+i']);
chk('the levelled grammar gives exactly 1 tree for i+i*i',
  V.trees.unambig['i+i*i'] === 1, 'got ' + V.trees.unambig['i+i*i']);
chk('the levelled grammar gives exactly 1 tree for i+i*i+i',
  V.trees.unambig['i+i*i+i'] === 1, 'got ' + V.trees.unambig['i+i*i+i']);
chk('the levelled grammar gives exactly 1 tree for i*i*i',
  V.trees.unambig['i*i*i'] === 1, 'got ' + V.trees.unambig['i*i*i']);
chk('both expression grammars accept the same strings up to length 5',
  (function () {
    var a = langSample(G.exprAmbig, 5), b = langSample(G.exprUnambig, 5);
    var ka = Object.keys(a).sort().join(','), kb = Object.keys(b).sort().join(',');
    return ka === kb;
  })());
chk('the tree count for i is 1, not 0', V.trees.counts['i'] === 1);

/* derivations */
chk('the derivation of aabb from S->aSb|eps takes four sentential forms',
  V.deriv.steps.length === 4, V.deriv.steps.join(' => '));
chk('the derivation of aaabbb takes five sentential forms',
  V.deriv.stepsLong.length === 5, V.deriv.stepsLong.join(' => '));
chk('each derivation step changes exactly one nonterminal',
  V.deriv.steps.every(function (s, i, arr) {
    return i === 0 || s.replace(/[^S]/g, '') !== arr[i - 1].replace(/[^S]/g, '') ||
      s.length !== arr[i - 1].length;
  }));
chk('the final form of the derivation is aabb, with no nonterminal left',
  V.deriv.steps[V.deriv.steps.length - 1] === 'aabb');

/* machines */
chk('the deterministic machine for a^n b^n agrees with the definition on all 127 strings up to length 6',
  V.pda.anbn.agree === V.pda.anbn.total, V.pda.anbn.agree + '/' + V.pda.anbn.total);
chk('the nondeterministic machine for the mirror language agrees on all 127 strings',
  V.pda.wwR.agree === V.pda.wwR.total, V.pda.wwR.agree + '/' + V.pda.wwR.total);
chk('the machine for a^n b^n c^m agrees on all strings up to length 4',
  V.pda.anbncm.agree === V.pda.anbncm.total,
  V.pda.anbncm.agree + '/' + V.pda.anbncm.total);
chk('the traced run on aabb reaches the accepting state with the stack back at Z',
  V.pda.trace[V.pda.trace.length - 1].q === 'qf',
  V.pda.trace[V.pda.trace.length - 1].q);
chk('the stack height on aabb rises to 3 including the bottom marker, then falls',
  (function () {
    var mx = 0;
    for (var i = 0; i < V.pda.trace.length; i++) mx = Math.max(mx, V.pda.trace[i].st.length);
    return mx === 3 && V.pda.trace[V.pda.trace.length - 1].st.length === 1;
  })());
chk('the machine rejects abab, so the trace is not a lucky run',
  !pdaAccepts(M_anbn, 'abab'));
chk('the mirror machine accepts abba and rejects abab',
  pdaAccepts(M_wwR, 'abba') && !pdaAccepts(M_wwR, 'abab'));

/* pumping */
chk('every legal split of aabbcc at p=2 dies: no survivor',
  V.pump.anbncn[0].survivors === 0, V.pump.anbncn[0].total + ' splits');
chk('every legal split of aaabbbccc at p=3 dies: no survivor',
  V.pump.anbncn[1].survivors === 0, V.pump.anbncn[1].total + ' splits');
chk('the split enumeration is not empty, so the check means something',
  V.pump.anbncn[0].total > 10 && V.pump.anbncn[1].total > 10,
  V.pump.anbncn[0].total + ' and ' + V.pump.anbncn[1].total);
chk('the pumping lemma survives on a^n b^n: some split of aabb does pump',
  (function () {
    var r = refutePumping('aabb', 2, isAnBn);
    return r.survivors > 0;
  })());
chk('every legal split of aabbaabb dies for the copy language',
  V.pump.ww.survivors === 0, V.pump.ww.total + ' splits');
chk('every legal split of (ab)^2p a^2p (ba)^2p b^2p dies for w a^n w^R b^n, the 2019 option C',
  V.pump.wanwrbn.survivors === 0,
  V.pump.wanwrbn.cases.map(function (c) { return c.total + ' splits at p=' + c.p; }).join(', '));
chk('the refuting string for option C really is in that language',
  isWanWrBn(V.pump.wanwrbn.cases[0].s) && isWanWrBn(V.pump.wanwrbn.cases[1].s));
chk('the witness split for the copy language really leaves the language',
  !!V.pump.ww.witness && !isWw(V.pump.ww.witness.out),
  V.pump.ww.witness ? V.pump.ww.witness.out : 'none');

/* closure */
chk('the intersection of the two free-block languages is a^n b^n c^n up to length 6',
  V.closure.inter.left === V.closure.inter.right && V.closure.inter.bad === 0,
  V.closure.inter.left + ' vs ' + V.closure.inter.right);
chk('the intersection is non-empty, so the equality is not vacuous',
  V.closure.inter.left > 0, String(V.closure.inter.left));
chk('the union of the two free-block languages has a grammar and matches up to length 5',
  V.closure.union.ok, V.closure.union.bad.join(', '));

/* the GATE options */
chk('2019 option A, the mirror language, is generated by a three-rule grammar',
  V.gate.q2019.A.ok, V.gate.q2019.A.bad.join(', '));
chk('2019 option B, w a^n b^n w^R, is generated by a four-rule grammar',
  V.gate.q2019.B.ok, V.gate.q2019.B.bad.join(', '));
chk('2019 option C, w a^n w^R b^n, is refuted by the pumping lemma',
  V.gate.q2019.C.survivors === 0, V.gate.q2019.C.total + ' splits');
chk('2019 option D, the union of three ratios, is generated by a grammar',
  V.gate.q2019.D.ok, V.gate.q2019.D.bad.join(', '));
chk('2017: the union is context-free by an explicit grammar',
  V.gate.q2017.union.ok, V.gate.q2017.union.bad.join(', '));
chk('2017: the intersection forces all three counts equal, so it is a^n b^n c^n',
  V.gate.q2017.inter === true);

/* the class boundary, computed */
chk('the mirror language is context-free and the copy language is not: aabbaabb is a copy, abba is a mirror',
  isWw('aabbaabb') && isWwR('abba') && !isWw('abba'));
chk('the two free-block languages overlap only where all three counts are equal',
  isAnBnCm('aabbccc') && !isAmBnCn('aabbccc') &&
  isAmBnCn('aaabbcc') && !isAnBnCm('aaabbcc') &&
  isAnBnCm('aabbcc') && isAmBnCn('aabbcc'));
chk('the balanced-bracket grammar generates 9 strings up to length 6: 1, 1, 2 and 5 by length',
  V.limits.dyck === 9, String(V.limits.dyck));

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function num(x, d) {
  if (!isFinite(x)) return String(x);
  var s = Number(x).toFixed(d === undefined ? 2 : d);
  return s.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
}

function rv(t, start, dur) { return K.ease ? K.ease(K.clamp01((t - start) / dur)) : 1; }

function bg() {
  P.rect(0, 0, W, H, { fill: PAL.surface, stroke: null });
  P.line(28, 74, W - 28, 74, { stroke: PAL.border, sw: 1 });
}

function head(title, sub) {
  P.text(28, 30, title, { size: 19, bold: true, color: PAL.ink });
  P.text(28, 56, sub, { size: 11.5, mono: true, color: PAL.dim });
}

function txt(x, y, s, o) {
  o = o || {};
  P.text(x, y, String(s), {
    size: o.size || 11, bold: !!o.bold, mono: o.mono !== false,
    align: o.align || 'left', base: o.base || 'alphabetic',
    color: o.color || PAL.ink
  });
}
function label(x, y, s, o) { txt(x, y, s, o || {}); }

function box(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, {
    fill: o.fill === undefined ? PAL.surface2 : o.fill,
    stroke: o.stroke === undefined ? PAL.border : o.stroke,
    sw: o.sw || 1.2, radius: 4
  });
}

function pill(x, y, s, colour, dim) {
  var w = 8 + String(s).length * 6.2;
  P.rect(x, y, w, 17, { fill: dim || PAL.surface2, stroke: colour, sw: 1, radius: 8 });
  txt(x + w / 2, y + 12, s, { size: 9.5, align: 'center', color: colour });
  return w;
}

/* a stack drawn as a column, bottom at the bottom */
function drawStack(x, yBottom, st, opts) {
  opts = opts || {};
  var cell = opts.cell || 22, w = opts.w || 54;
  for (var i = 0; i < st.length; i++) {
    var y = yBottom - (i + 1) * cell;
    var isTop = i === st.length - 1;
    P.rect(x, y, w, cell, {
      fill: isTop ? PAL.accentDim : PAL.surface,
      stroke: isTop ? PAL.accent : PAL.border, sw: isTop ? 1.6 : 1, radius: 3
    });
    txt(x + w / 2, y + cell / 2, st[i], {
      size: 11, align: 'center', base: 'middle',
      color: isTop ? PAL.accent : PAL.dim, bold: isTop
    });
  }
  P.line(x, yBottom, x + w, yBottom, { stroke: PAL.dim, sw: 1.6 });
  if (opts.caption) {
    txt(x + w / 2, yBottom + 14, opts.caption, { size: 9, align: 'center', color: PAL.faint });
  }
}

/* ---------------- SCENE 1 - the grammar ---------------- */
function scGrammar(t) {
  head('A grammar is a rewriting machine',
       'G = (V, \u03a3, P, S) \u00b7 every symbol glossed \u00b7 one replacement per step');

  box(28, 88, 300, 132, { fill: PAL.accentDim, stroke: PAL.accent });
  txt(44, 108, 'the four parts', { size: 11.5, bold: true, color: PAL.accent });
  txt(44, 130, 'V  nonterminals  { S }', { size: 10.5, color: PAL.ink });
  txt(44, 150, '\u03a3  terminals  { a, b }', { size: 10.5, color: PAL.ink });
  txt(44, 170, 'P  rules  S \u2192 a S b | \u03b5', { size: 10.5, color: PAL.ink });
  txt(44, 190, 'S  start symbol, a nonterminal', { size: 10.5, color: PAL.ink });
  txt(44, 210, 'L(G) = terminal strings reachable from S', { size: 9.5, color: PAL.dim });

  /* the derivation, one step at a time */
  label(348, 104, 'one derivation of aabb, leftmost', { size: 11, color: PAL.dim });
  var steps = V.deriv.steps;
  for (var i = 0; i < steps.length; i++) {
    var show = t >= i * 4.2;
    if (!show) continue;
    P.alpha(rv(t, i * 4.2, 1.1));
    var y = 132 + i * 34;
    box(348, y - 16, 40, 24, { fill: PAL.surface, stroke: PAL.border });
    txt(368, y, String(i), { size: 10, align: 'center', color: PAL.faint });
    var s = steps[i] === '' ? '\u03b5' : steps[i];
    txt(404, y, s, { size: 15, mono: true, color: i === steps.length - 1 ? PAL.valid : PAL.ink, bold: i === steps.length - 1 });
    if (i > 0) {
      var rule = i === 1 ? 'S \u2192 a S b' : i === 2 ? 'S \u2192 a S b' : 'S \u2192 \u03b5';
      txt(560, y, rule, { size: 10.5, mono: true, color: PAL.dim });
      txt(680, y, i === steps.length - 1 ? 'yield: no nonterminal left' : 'sentential form',
        { size: 9.5, mono: true, color: PAL.faint });
    }
    P.alpha(1);
  }

  if (t >= 17) {
    P.alpha(rv(t, 17, 1.2));
    box(28, 230, 844, 60, { fill: PAL.surface2, stroke: PAL.border });
    txt(44, 248, 'why the name context-free', { size: 11, bold: true, color: PAL.ink });
    txt(44, 268, 'every rule has one nonterminal on the left, so it applies wherever that nonterminal appears.',
      { size: 10.5, color: PAL.dim });
    txt(44, 284, 'a rule such as a B \u2192 a c asks about the left neighbour, and is context-sensitive, not context-free.',
      { size: 10.5, color: PAL.warn });
    P.alpha(1);
  }

  if (t >= 22) {
    P.alpha(rv(t, 22, 1.2));
    label(28, 306, 'the same derivation as a tree', { size: 11, color: PAL.dim });
    var cx = 150, cy = 326;
    txt(cx, cy, 'S', { size: 13, align: 'center', color: PAL.accent, bold: true });
    P.line(cx, cy + 6, cx - 54, cy + 38, { stroke: PAL.border, sw: 1.2 });
    P.line(cx, cy + 6, cx, cy + 38, { stroke: PAL.border, sw: 1.2 });
    P.line(cx, cy + 6, cx + 54, cy + 38, { stroke: PAL.border, sw: 1.2 });
    txt(cx - 54, cy + 54, 'a', { size: 12, align: 'center', color: PAL.ink });
    txt(cx, cy + 54, 'S', { size: 12, align: 'center', color: PAL.accent, bold: true });
    txt(cx + 54, cy + 54, 'b', { size: 12, align: 'center', color: PAL.ink });
    P.line(cx, cy + 60, cx - 24, cy + 76, { stroke: PAL.border, sw: 1.2 });
    P.line(cx, cy + 60, cx, cy + 76, { stroke: PAL.border, sw: 1.2 });
    P.line(cx, cy + 60, cx + 24, cy + 76, { stroke: PAL.border, sw: 1.2 });
    txt(cx - 24, cy + 92, 'a', { size: 12, align: 'center', color: PAL.ink });
    txt(cx, cy + 92, 'S', { size: 12, align: 'center', color: PAL.accent, bold: true });
    txt(cx + 24, cy + 92, 'b', { size: 12, align: 'center', color: PAL.ink });
    P.line(cx, cy + 98, cx, cy + 112, { stroke: PAL.border, sw: 1.2 });
    txt(cx, cy + 128, '\u03b5', { size: 12, align: 'center', color: PAL.faint });
    P.alpha(1);
  }

  label(300, 340, 'leftmost order: the leftmost nonterminal is always the one replaced', { size: 10, color: PAL.faint });
  label(300, 360, 'the order never changes which strings are reachable, only the sequence of pictures', { size: 10, color: PAL.faint });
  label(300, 380, 'a tree drops the order and keeps the structure; ambiguity is a statement about trees', { size: 10, color: PAL.faint });
}

/* ---------------- SCENE 2 - ambiguity ---------------- */
function scTree(t) {
  head('Derivation trees and ambiguity',
       'E \u2192 E + E | E * E | i \u00b7 one string, two trees, one grammar');

  function node(x, y, s, col, fill) {
    P.circle(x, y, 13, { fill: fill || PAL.surface, stroke: col, sw: 1.4 });
    txt(x, y + 4, s, { size: 11, align: 'center', color: col, bold: true });
  }
  function edge(x1, y1, x2, y2) { P.line(x1, y1 + 13, x2, y2 - 13, { stroke: PAL.border, sw: 1.1 }); }

  /* tree one: the star deeper */
  label(40, 100, 'tree 1: the star is applied first', { size: 10.5, color: PAL.dim });
  node(150, 128, 'E', PAL.accent);
  edge(150, 128, 96, 176); edge(150, 128, 150, 176); edge(150, 128, 204, 176);
  node(96, 176, 'E', PAL.accent); node(150, 176, '+', PAL.ink); node(204, 176, 'E', PAL.accent);
  edge(204, 176, 176, 224); edge(204, 176, 204, 224); edge(204, 176, 232, 224);
  node(176, 224, 'E', PAL.accent); node(204, 224, '*', PAL.ink); node(232, 224, 'E', PAL.accent);
  txt(96, 254, 'i', { size: 11, align: 'center', color: PAL.ink });
  txt(176, 268, 'i', { size: 11, align: 'center', color: PAL.ink });
  txt(232, 268, 'i', { size: 11, align: 'center', color: PAL.ink });
  txt(150, 292, '(i + (i * i))', { size: 10.5, align: 'center', color: PAL.valid });

  /* tree two: the plus deeper */
  label(300, 100, 'tree 2: the plus is applied first', { size: 10.5, color: PAL.dim });
  node(410, 128, 'E', PAL.accent);
  edge(410, 128, 356, 176); edge(410, 128, 410, 176); edge(410, 128, 464, 176);
  node(356, 176, 'E', PAL.accent); node(410, 176, '*', PAL.ink); node(464, 176, 'E', PAL.accent);
  edge(356, 176, 328, 224); edge(356, 176, 356, 224); edge(356, 176, 384, 224);
  node(328, 224, 'E', PAL.accent); node(356, 224, '+', PAL.ink); node(384, 224, 'E', PAL.accent);
  txt(328, 254, 'i', { size: 11, align: 'center', color: PAL.ink });
  txt(384, 254, 'i', { size: 11, align: 'center', color: PAL.ink });
  txt(464, 254, 'i', { size: 11, align: 'center', color: PAL.ink });
  txt(410, 292, '((i + i) * i)', { size: 10.5, align: 'center', color: PAL.invalid });

  /* counts */
  box(566, 92, 306, 200, { fill: PAL.surface2, stroke: PAL.border });
  txt(582, 112, 'parse trees counted by this page', { size: 11, bold: true, color: PAL.ink });
  var rows = [
    ['i', V.trees.counts['i']],
    ['i + i', V.trees.counts['i+i']],
    ['i + i * i', V.trees.counts['i+i*i']],
    ['i + i + i', V.trees.counts['i+i+i']],
    ['i + i * i + i', V.trees.counts['i+i*i+i']]
  ];
  for (var i = 0; i < rows.length; i++) {
    if (t < 6 + i * 3.4) continue;
    P.alpha(rv(t, 6 + i * 3.4, 1.1));
    txt(582, 140 + i * 22, rows[i][0], { size: 10.5, color: PAL.ink });
    txt(856, 140 + i * 22, String(rows[i][1]), {
      size: 11, align: 'right', color: rows[i][1] > 1 ? PAL.warn : PAL.valid, bold: true
    });
    P.alpha(1);
  }
  txt(582, 274, 'i + i * i + i gives C3 = 5: the Catalan count', { size: 9.5, color: PAL.faint });

  /* the repair */
  if (t >= 18) {
    P.alpha(rv(t, 18, 1.2));
    box(28, 300, 844, 58, { fill: PAL.accentDim, stroke: PAL.accent });
    txt(44, 322, 'the repair is a new grammar, not a new string', { size: 11, bold: true, color: PAL.accent });
    txt(44, 344, 'E \u2192 E + T | T \u00b7 T \u2192 T * F | F \u00b7 F \u2192 i   gives 1 tree for i+i*i and 1 for i+i*i+i, and the same language',
      { size: 10.5, color: PAL.ink });
    P.alpha(1);
  }

  label(28, 380, 'ambiguity is a property of the grammar: two distinct trees for one string, not two derivation orders', { size: 10, color: PAL.faint });
  label(28, 400, 'a language is inherently ambiguous when no grammar for it is unambiguous, which is a theorem, not a diagram', { size: 10, color: PAL.faint });
  label(28, 420, 'the counts above come from the inside algorithm on this page, checked against brute-force derivation', { size: 10, color: PAL.faint });
}

/* ---------------- SCENE 3 - normal form ---------------- */
function scNormal(t) {
  head('Simplification and Chomsky normal form',
       'useless \u2192 \u03b5-rules \u2192 unit rules \u2192 binarise \u00b7 then A \u2192 B C or A \u2192 a');

  var stages = [
    ['1', 'drop useless symbols', 'never generates a terminal,\nor unreachable from S'],
    ['2', 'drop \u03b5-rules', 'add the variants that\nomit the nullable symbol'],
    ['3', 'drop unit rules', 'copy B rules onto A\nfor every A \u2192 B'],
    ['4', 'binarise', 'split every long right side\nwith fresh nonterminals']
  ];
  for (var i = 0; i < stages.length; i++) {
    if (t < i * 4) continue;
    P.alpha(rv(t, i * 4, 1.1));
    var x = 28 + i * 212;
    box(x, 88, 196, 78, { fill: i === 3 ? PAL.accentDim : PAL.surface2, stroke: i === 3 ? PAL.accent : PAL.border });
    txt(x + 12, 108, stages[i][0] + '  ' + stages[i][1], { size: 10.5, bold: true, color: i === 3 ? PAL.accent : PAL.ink });
    var lines = stages[i][2].split('\n');
    for (var L = 0; L < lines.length; L++) {
      txt(x + 12, 128 + L * 16, lines[L], { size: 9.5, color: PAL.dim });
    }
    if (i < 3) txt(x + 200, 130, '\u2192', { size: 13, color: PAL.faint });
    P.alpha(1);
  }

  /* the result for a^n b^n */
  if (t >= 14) {
    P.alpha(rv(t, 14, 1.2));
    box(28, 184, 404, 116, { fill: PAL.surface2, stroke: PAL.border });
    txt(44, 204, 'S \u2192 a S b | \u03b5   becomes', { size: 10.5, color: PAL.dim });
    for (var k = 0; k < V.cnf.rules.length; k++) {
      var colx = k < 3 ? 44 : 236, rowy = 230 + (k % 3) * 20;
      txt(colx, rowy, V.cnf.rules[k], { size: 11, mono: true, color: PAL.ink, bold: true });
    }
    txt(44, 292, 'checked on every string up to length 6: same language', { size: 9.5, color: PAL.valid });
    P.alpha(1);
  }

  /* the binary tree and the count */
  if (t >= 19) {
    P.alpha(rv(t, 19, 1.2));
    label(456, 200, 'a binary tree for a string of length 4', { size: 10.5, color: PAL.dim });
    var cx = 640;
    P.circle(cx, 220, 11, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.3 });
    P.line(cx - 8, 228, cx - 44, 252, { stroke: PAL.border, sw: 1.1 });
    P.line(cx + 8, 228, cx + 44, 252, { stroke: PAL.border, sw: 1.1 });
    P.circle(cx - 52, 262, 10, { fill: PAL.surface, stroke: PAL.accent, sw: 1.2 });
    P.circle(cx + 52, 262, 10, { fill: PAL.surface, stroke: PAL.accent, sw: 1.2 });
    P.line(cx - 58, 269, cx - 78, 286, { stroke: PAL.border, sw: 1.1 });
    P.line(cx - 46, 269, cx - 26, 286, { stroke: PAL.border, sw: 1.1 });
    P.line(cx + 46, 269, cx + 26, 286, { stroke: PAL.border, sw: 1.1 });
    P.line(cx + 58, 269, cx + 78, 286, { stroke: PAL.border, sw: 1.1 });
    var leaves = ['a', 'S', 'a', 'S'];
    for (var q = 0; q < 4; q++) {
      txt(cx - 82 + q * 52, 296, leaves[q], { size: 10.5, align: 'center', color: PAL.ink });
    }
    txt(cx, 318, '4 leaves, 3 internal nodes, 7 nodes in all', { size: 9.5, align: 'center', color: PAL.faint });
    P.alpha(1);
  }

  if (t >= 24) {
    P.alpha(rv(t, 24, 1.2));
    box(456, 330, 416, 56, { fill: PAL.accentDim, stroke: PAL.accent });
    txt(472, 352, 'a string of length n has exactly 2n \u2212 1 nodes, so 2n \u2212 2 steps', { size: 11, bold: true, color: PAL.accent });
    txt(472, 372, 'n = 4 gives 7 nodes and 6 steps \u00b7 this is why the pumping constant exists', { size: 9.5, color: PAL.ink });
    P.alpha(1);
  }

  label(28, 398, 'two tools need the form: the CYK membership test, and the pumping lemma', { size: 10, color: PAL.faint });
  label(28, 416, 'CYK fills a table over substrings in cubic time, and needs binary rules to do it', { size: 10, color: PAL.faint });
  label(28, 434, 'a general grammar can derive the same string in a different number of steps; only the normal form fixes the count', { size: 10, color: PAL.faint });
  label(28, 456, '\u03b5 is the one exception: only the start symbol may produce it, and only if it is absent from every right side', { size: 10, color: PAL.warn });
}

/* ---------------- SCENE 4 - the stack ---------------- */
function scStack(t) {
  head('The stack: one unbounded memory',
       'M = (Q, \u03a3, \u0393, \u03b4, q\u2080, Z\u2080, F) \u00b7 a move is read, pop, push');

  var parts = [
    ['Q', 'finite set of states'],
    ['\u03a3', 'input alphabet'],
    ['\u0393', 'stack alphabet'],
    ['\u03b4', 'transition function'],
    ['q\u2080', 'start state'],
    ['Z\u2080', 'bottom-of-stack symbol'],
    ['F', 'accepting states']
  ];
  for (var i = 0; i < parts.length; i++) {
    if (t < i * 2.2) continue;
    P.alpha(rv(t, i * 2.2, 1));
    var y = 96 + i * 24;
    txt(28, y, parts[i][0], { size: 12, bold: true, color: PAL.accent });
    txt(74, y, parts[i][1], { size: 10.5, color: PAL.ink });
    P.alpha(1);
  }

  if (t >= 6) {
    P.alpha(rv(t, 6, 1.2));
    box(300, 88, 574, 74, { fill: PAL.surface2, stroke: PAL.border });
    txt(316, 108, 'one move: \u03b4(q, a, X) = (q\u2032, \u03b3)', { size: 11.5, bold: true, color: PAL.ink });
    txt(316, 130, 'read a from the input, or read nothing; pop X; push \u03b3 so that its first symbol is the new top', { size: 10, color: PAL.dim });
    txt(316, 150, 'a push is \u03b3 = A X   \u00b7   a pop is \u03b3 = \u03b5   \u00b7   a replace is \u03b3 = A B X', { size: 10, color: PAL.accent });
    P.alpha(1);
  }

  /* the stack picture */
  label(360, 190, 'the stack, top at the top', { size: 10.5, color: PAL.dim });
  var st = ['Z', 'A', 'A'];
  var shown = t < 10 ? ['Z'] : t < 14 ? ['Z', 'A'] : ['Z', 'A', 'A'];
  drawStack(400, 300, shown, { caption: 'height ' + shown.length, cell: 24, w: 60 });

  if (t >= 14) {
    P.alpha(rv(t, 14, 1.2));
    txt(490, 200, 'push A on each a', { size: 10.5, color: PAL.accent });
    txt(490, 222, 'pop A on each b', { size: 10.5, color: PAL.warn });
    txt(490, 250, 'only the top is ever visible', { size: 10, color: PAL.dim });
    txt(490, 270, 'no head, no rewinding, no peeking', { size: 10, color: PAL.dim });
    P.alpha(1);
  }

  if (t >= 18) {
    P.alpha(rv(t, 18, 1.2));
    box(300, 316, 574, 54, { fill: PAL.accentDim, stroke: PAL.accent });
    txt(316, 338, 'an instantaneous description: state, unread input, whole stack', { size: 11, bold: true, color: PAL.accent });
    txt(316, 358, '( q\u2081 , b b , A Z ) means: in q\u2081, bb still to read, A on top of Z', { size: 10, color: PAL.ink });
    P.alpha(1);
  }

  label(28, 340, 'last in, first out is the whole story', { size: 10.5, color: PAL.ink });
  label(28, 362, 'a block pushed and popped comes back reversed,', { size: 10, color: PAL.dim });
  label(28, 380, 'so a mirror can be checked and a copy cannot', { size: 10, color: PAL.dim });
  label(28, 404, 'the stack alphabet is not the input alphabet: a machine may push symbols the input never contains', { size: 10, color: PAL.warn });
  label(28, 424, 'an \u03b5-move consumes no input and still changes the stack, which is how a run can loop without reading', { size: 10, color: PAL.warn });
}

/* ---------------- SCENE 5 - the run ---------------- */
function scRun(t) {
  head('A run, traced on the stack',
       'push on a, pop on b \u00b7 accept when the input and the stack end together');

  var tr = V.pda.trace;
  label(28, 96, 'the string a a b b, one symbol at a time', { size: 11, color: PAL.dim });

  /* header row */
  txt(28, 124, 'step', { size: 9.5, color: PAL.faint });
  txt(96, 124, 'read', { size: 9.5, color: PAL.faint });
  txt(160, 124, 'state', { size: 9.5, color: PAL.faint });
  txt(250, 124, 'stack, top at the right', { size: 9.5, color: PAL.faint });

  for (var i = 0; i < tr.length; i++) {
    if (t < i * 4) continue;
    P.alpha(rv(t, i * 4, 1));
    var y = 148 + i * 28;
    txt(28, y, String(i), { size: 10.5, color: PAL.faint });
    txt(96, y, tr[i].ch === '\u03b5' ? '\u03b5' : tr[i].ch, { size: 11, color: PAL.ink });
    txt(160, y, tr[i].q, { size: 11, color: tr[i].q === 'qf' ? PAL.valid : PAL.accent, bold: true });
    txt(250, y, tr[i].st.slice().reverse().join(' '), { size: 11, color: PAL.ink });
    if (i > 0) {
      var grew = tr[i].st.length > tr[i - 1].st.length;
      txt(420, y, grew ? 'push A' : 'pop A', { size: 10, color: grew ? PAL.accent : PAL.warn });
    }
    P.alpha(1);
  }

  /* the stack at the last step */
  if (t >= 18) {
    P.alpha(rv(t, 18, 1.2));
    drawStack(560, 300, tr[tr.length - 1].st, { caption: 'end: bottom only', cell: 24, w: 64 });
    txt(646, 214, 'the stack is back to Z', { size: 10.5, color: PAL.valid });
    txt(646, 236, 'and the input is finished', { size: 10.5, color: PAL.valid });
    txt(646, 262, 'so the two counts matched', { size: 10.5, color: PAL.dim });
    P.alpha(1);
  }

  if (t >= 22) {
    P.alpha(rv(t, 22, 1.2));
    box(28, 320, 844, 52, { fill: PAL.surface2, stroke: PAL.border });
    txt(44, 342, 'checked on this page: ' + V.pda.anbn.agree + ' of ' + V.pda.anbn.total +
      ' strings up to length 6 get the same verdict from the machine and from the definition',
      { size: 10.5, color: PAL.ink });
    txt(44, 362, 'the mirror machine, which must guess the middle, agrees on ' + V.pda.wwR.agree +
      ' of ' + V.pda.wwR.total + ' strings, and needs nondeterminism to do it',
      { size: 10.5, color: PAL.dim });
    P.alpha(1);
  }

  label(28, 396, 'acceptance by final state and by empty stack are interchangeable for nondeterministic machines', { size: 10, color: PAL.faint });
  label(28, 416, 'a deterministic machine cannot guess where the middle is, so the mirror language has no deterministic machine', { size: 10, color: PAL.faint });
  label(28, 436, 'GATE CSE 2011 asked which pair of models differs in power: deterministic and nondeterministic pushdown machines is that pair', { size: 10, color: PAL.warn });
}

/* ---------------- SCENE 6 - limits ---------------- */
function scLimits(t) {
  head('One comparison, not two',
       'what a last-in-first-out memory can check, and what it cannot');

  var rows = [
    ['w w\u1d3f  (mirror)', 'a b b a', true, 'push w, pop against the mirror', PAL.valid],
    ['w w  (copy)', 'a b a b', false, 'the stack hands w back reversed', PAL.invalid],
    ['a\u207f b\u207f c\u207f', 'a a b b c c', false, 'the stack is spent after the first pair', PAL.invalid],
    ['a\u207f b\u207f c\u1d50', 'a a b b c c c', true, 'the third block is free', PAL.valid],
    ['a\u1d50 b\u207f c\u207f', 'a a a b b c c', true, 'the first block is free', PAL.valid]
  ];
  for (var i = 0; i < rows.length; i++) {
    if (t < i * 4.4) continue;
    P.alpha(rv(t, i * 4.4, 1.1));
    var y = 96 + i * 50;
    box(28, y, 844, 40, { fill: PAL.surface2, stroke: rows[i][4] === PAL.valid ? PAL.valid : PAL.invalid, sw: 1 });
    txt(44, y + 25, rows[i][0], { size: 11.5, bold: true, color: PAL.ink });
    txt(230, y + 25, rows[i][1], { size: 11, color: PAL.dim });
    txt(360, y + 25, rows[i][2] ? 'context-free' : 'not context-free', {
      size: 11, bold: true, color: rows[i][4]
    });
    txt(500, y + 25, rows[i][3], { size: 10, color: PAL.dim });
    P.alpha(1);
  }

  if (t >= 23) {
    P.alpha(rv(t, 23, 1.2));
    box(28, 348, 844, 74, { fill: PAL.warnDim, stroke: PAL.warn });
    txt(44, 370, 'the two free-block languages are context-free, and their intersection is not', { size: 11, bold: true, color: PAL.warn });
    txt(44, 392, 'a\u207f b\u207f c\u1d50 \u2229 a\u1d50 b\u207f c\u207f = a\u207f b\u207f c\u207f   \u00b7   this page computed both sides up to length 6 and they agree on ' +
      V.closure.inter.left + ' strings', { size: 10.5, color: PAL.ink });
    txt(44, 412, 'so the class is closed under union and not under intersection, and that pair is the standard counterexample', { size: 10.5, color: PAL.dim });
    P.alpha(1);
  }

  label(28, 444, 'the test is a heuristic: count the independent quantities that must be compared at once, and remember it is not a proof', { size: 10, color: PAL.faint });
}

/* ---------------- SCENE 7 - closure ---------------- */
function scClosure(t) {
  head('Closure: what keeps you inside the class',
       'five operations preserve context-freeness, two do not, and one exception decides most questions');

  var closed = ['union', 'concatenation', 'star', 'reversal', 'homomorphism',
    'inverse homomorphism', 'intersection with a regular language'];
  var open = ['intersection', 'complement'];

  box(28, 88, 404, 150, { fill: PAL.accentDim, stroke: PAL.accent });
  txt(44, 108, 'closed under', { size: 11.5, bold: true, color: PAL.accent });
  for (var i = 0; i < closed.length; i++) {
    if (t < 2 + i * 2.2) continue;
    P.alpha(rv(t, 2 + i * 2.2, 1));
    txt(44, 130 + i * 16, '\u2713  ' + closed[i], { size: 10.5, color: PAL.ink });
    P.alpha(1);
  }

  box(456, 88, 416, 90, { fill: PAL.invalidDim, stroke: PAL.invalid });
  txt(472, 108, 'not closed under', { size: 11.5, bold: true, color: PAL.invalid });
  for (i = 0; i < open.length; i++) {
    if (t < 9 + i * 3) continue;
    P.alpha(rv(t, 9 + i * 3, 1));
    txt(472, 132 + i * 18, '\u2717  ' + open[i], { size: 10.5, color: PAL.ink });
    P.alpha(1);
  }

  if (t >= 15) {
    P.alpha(rv(t, 15, 1.2));
    box(456, 190, 416, 48, { fill: PAL.surface2, stroke: PAL.border });
    txt(472, 210, 'witness for intersection:', { size: 10.5, bold: true, color: PAL.ink });
    txt(472, 228, 'a\u207f b\u207f c\u1d50 \u2229 a\u1d50 b\u207f c\u207f = a\u207f b\u207f c\u207f, not context-free', { size: 10, color: PAL.dim });
    P.alpha(1);
  }

  if (t >= 19) {
    P.alpha(rv(t, 19, 1.2));
    box(28, 252, 844, 66, { fill: PAL.surface2, stroke: PAL.border });
    txt(44, 274, 'the exception that answers most questions: intersection with a regular language stays context-free', { size: 11, bold: true, color: PAL.ink });
    txt(44, 296, 'the finite machine carries the regular condition in its states while the stack does the other job, so one stack is still enough', { size: 10, color: PAL.dim });
    txt(44, 312, 'GATE CSE 2011 used exactly this, with P regular and Q context-free inside P, to ask which expression is always regular', { size: 10, color: PAL.accent });
    P.alpha(1);
  }

  if (t >= 24) {
    P.alpha(rv(t, 24, 1.2));
    box(28, 330, 844, 70, { fill: PAL.warnDim, stroke: PAL.warn });
    txt(44, 352, 'the asymmetry to remember: deterministic context-free languages are closed under complement, the whole class is not', { size: 11, bold: true, color: PAL.warn });
    txt(44, 374, 'w w is not context-free and its complement is: a machine guesses one mismatching position and checks it', { size: 10.5, color: PAL.ink });
    txt(44, 392, 'GATE CSE 2022 turned on this, together with the intersection of two deterministic languages being outside the class', { size: 10, color: PAL.dim });
    P.alpha(1);
  }

  label(28, 424, 'never infer membership of a language from membership of its complement in this class', { size: 10, color: PAL.faint });
  label(28, 444, 'and never infer it from the intersection of two members, or the union of two non-members', { size: 10, color: PAL.faint });
}

/* ---------------- SCENE 8 - pumping ---------------- */
function scPump(t) {
  head('The pumping lemma for context-free languages',
       's = u v w x y \u00b7 |v w x| \u2264 p \u00b7 |v x| \u2265 1 \u00b7 u v\u2071 w x\u2071 y \u2208 L');

  var p = 2;
  var s = 'aabbcc';
  var segs = [
    ['u', '', PAL.surface],
    ['v', 'a', PAL.accentDim],
    ['w', 'abbc', PAL.surface],
    ['x', 'c', PAL.accentDim],
    ['y', '', PAL.surface]
  ];
  label(28, 96, 'one legal split of a a b b c c with p = 2', { size: 10.5, color: PAL.dim });
  var x0 = 28;
  for (var i = 0; i < segs.length; i++) {
    var wpx = Math.max(34, 16 + segs[i][1].length * 14);
    P.rect(x0, 110, wpx, 30, { fill: segs[i][2], stroke: segs[i][1] ? PAL.accent : PAL.border, sw: 1.1, radius: 3 });
    txt(x0 + wpx / 2, 130, segs[i][1] === '' ? '\u03b5' : segs[i][1], { size: 10.5, align: 'center', color: PAL.ink });
    txt(x0 + wpx / 2, 156, segs[i][0], { size: 10, align: 'center', color: PAL.faint });
    x0 += wpx;
  }
  if (t >= 6) {
    P.alpha(rv(t, 6, 1.2));
    txt(470, 130, 'v and x are pumped together', { size: 10.5, color: PAL.accent });
    txt(470, 150, 'the middle v w x is short', { size: 10.5, color: PAL.dim });
    txt(470, 170, 'at least one of v, x is non-empty', { size: 10.5, color: PAL.dim });
    P.alpha(1);
  }

  if (t >= 11) {
    P.alpha(rv(t, 11, 1.2));
    box(28, 186, 844, 52, { fill: PAL.accentDim, stroke: PAL.accent });
    txt(44, 208, 'why two pieces and not one: in a binary tree a nonterminal repeats on a path, and the repeat cuts out two sibling subtrees',
      { size: 10.5, bold: true, color: PAL.accent });
    txt(44, 228, 'the regular lemma pumps one block because its proof walks a chain of states; this one pumps a pair because the tree branches',
      { size: 10, color: PAL.ink });
    P.alpha(1);
  }

  /* the refutation */
  if (t >= 16) {
    P.alpha(rv(t, 16, 1.2));
    label(28, 262, 'refuting a\u207f b\u207f c\u207f: every legal split of a\u1d56 b\u1d56 c\u1d56 is checked here, not argued in prose', { size: 10.5, color: PAL.dim });
    for (i = 0; i < V.pump.anbncn.length; i++) {
      var row = V.pump.anbncn[i];
      var y = 284 + i * 26;
      txt(44, y, 'p = ' + row.p, { size: 10.5, color: PAL.ink });
      txt(110, y, row.s, { size: 10.5, color: PAL.dim });
      txt(300, y, row.total + ' legal splits', { size: 10.5, color: PAL.ink });
      txt(430, y, row.survivors + ' survive', {
        size: 10.5, bold: true, color: row.survivors === 0 ? PAL.valid : PAL.invalid
      });
    }
    txt(28, 344, 'a split survives only if every repetition keeps the string in the language.', { size: 10, color: PAL.faint });
    txt(28, 360, 'none does: the short middle can cross at most two of the three blocks.', { size: 10, color: PAL.faint });
    P.alpha(1);
  }

  if (t >= 23) {
    P.alpha(rv(t, 23, 1.2));
    box(28, 360, 844, 60, { fill: PAL.warnDim, stroke: PAL.warn });
    txt(44, 382, 'what the lemma cannot do', { size: 11, bold: true, color: PAL.warn });
    txt(44, 404, 'it is necessary, not sufficient: satisfying it never proves context-freeness, and some non-context-free languages satisfy it',
      { size: 10.5, color: PAL.ink });
    P.alpha(1);
  }

  label(28, 440, 'you choose the string, the adversary chooses the split: refuting one convenient split proves nothing', { size: 10, color: PAL.faint });
}

/* ---------------- SCENE 9 - the papers ---------------- */
function scGate(t) {
  head('The question shapes on real papers',
       'five shapes, five answers, each recomputed on this page');

  var cards = [
    ['GATE CSE 2019', 'which of four languages is not context-free',
      'A mirror: grammar \u2713   B w a\u207f b\u207f w\u1d3f: grammar \u2713\nC w a\u207f w\u1d3f b\u207f: all ' + V.gate.q2019.C.total +
      ' splits die\nD three ratios: grammar \u2713', 'answer: C'],
    ['GATE CSE 2017 Set 1', 'union and intersection of two free-block languages',
      'union: grammar exists, matches up to length 5 \u2713\nintersection: forces a\u207f b\u207f c\u207f, not context-free', 'answer: union only'],
    ['GATE CSE 2022', 'which statements about three languages are false',
      'w w not context-free, its complement is\nboth free-block languages are deterministic\nintersection is not context-free', 'answer: three false'],
    ['GATE CSE 2009', 'what does S \u2192 aSa | bSb | a | b generate',
      'checked against odd-length palindromes up to 6 \u2713\nand aa is not generated, so not all palindromes', 'answer: odd palindromes'],
    ['GATE CSE 2011', 'which pair of models differs in power',
      'DFA and NFA: same\nDPDA and NPDA: different\nsingle and multitape Turing machines: same', 'answer: DPDA and NPDA']
  ];

  for (var i = 0; i < cards.length; i++) {
    if (t < i * 4.6) continue;
    P.alpha(rv(t, i * 4.6, 1.1));
    var col = i % 2, row = Math.floor(i / 2);
    var x = 28 + col * 428, y = 84 + row * 110;
    var wide = (i === 4) ? 844 : 404;
    box(x, y, wide, 102, { fill: PAL.surface2, stroke: PAL.border });
    txt(x + 14, y + 18, cards[i][0], { size: 10.5, bold: true, color: PAL.accent });
    txt(x + 14, y + 34, cards[i][1], { size: 9.5, color: PAL.dim });
    var lines = cards[i][2].split('\n');
    for (var L = 0; L < lines.length; L++) {
      txt(x + 14, y + 52 + L * 14, lines[L], { size: 9.5, color: PAL.ink });
    }
    txt(x + 14, y + 96, cards[i][3], { size: 10, bold: true, color: PAL.valid });
    P.alpha(1);
  }

  label(28, 424, 'every answer above was recomputed by the model in this page, not copied from a key', { size: 10, color: PAL.faint });
  label(28, 440, 'where two archives print different question numbers, the lesson cites the year and the set', { size: 10, color: PAL.faint });
  label(28, 456, 'one archive lists 78 questions here between 1987 and 2026: its own tagging, not a forecast', { size: 10, color: PAL.faint });
}

/* ---------------- SCENE 10 - the procedure ---------------- */
function scDecide(t) {
  head('The procedure, and the traps that cost marks',
       'count the comparisons \u00b7 construct \u00b7 pump \u00b7 check the quantifiers');

  var steps = [
    { n: '1', h: 'count the comparisons', b: 'one condition: one stack\ncrossing conditions: not enough\nnested conditions: usually fine' },
    { n: '2', h: 'try to construct', b: 'a grammar of three or four rules\nor a machine: push, then pop\none construction settles a yes' },
    { n: '3', h: 'if it fails, pump', b: 'one block per dependent count\nrefute every legal split\nno split may survive' },
    { n: '4', h: 'check the quantifiers', b: 'derivations are not trees\nintersection, complement: open\n\u03b5 is the normal-form exception' }
  ];
  for (var i = 0; i < steps.length; i++) {
    if (t < i * 6) continue;
    P.alpha(rv(t, i * 6, 1.2));
    var col = i % 2, row = Math.floor(i / 2);
    var x = 28 + col * 428, y = 88 + row * 148;
    box(x, y, 404, 128, { fill: PAL.surface2, stroke: PAL.border });
    txt(x + 16, y + 24, steps[i].n, { size: 15, bold: true, color: PAL.accent });
    txt(x + 42, y + 24, steps[i].h, { size: 12, bold: true, color: PAL.ink });
    var lines = steps[i].b.split('\n');
    for (var L = 0; L < lines.length; L++) {
      txt(x + 16, y + 50 + L * 20, lines[L], { size: 10.5, color: PAL.dim });
    }
    P.alpha(1);
  }

  label(28, 400, 'the four slips that cost most marks: derivations taken for trees, intersection or complement assumed closed,', { size: 10, color: PAL.warn });
  label(28, 420, '\u03b5 forgotten in the normal form, and determinism assumed free because DFA equals NFA', { size: 10, color: PAL.warn });
  label(28, 444, 'each of those four is true in the regular case and false here, which is why they are the standard distractors', { size: 10, color: PAL.faint });
}

var SCENES = {
  grammar: scGrammar, tree: scTree, normalform: scNormal, stack: scStack, run: scRun,
  limits: scLimits, closure: scClosure, pump: scPump, gate: scGate, decide: scDecide
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

window.__MODEL = {
  V: V, CHECKS: CHECKS, G: G,
  machines: { anbn: M_anbn, wwR: M_wwR, anbncm: M_anbncm },
  pdaAccepts: pdaAccepts, pdaTrace: pdaTrace,
  splitsOf: splitsOf, refutePumping: refutePumping, pumped: pumped,
  langSample: langSample, isAnBn: isAnBn, isWwR: isWwR, isWw: isWw,
  isWanWrBn: isWanWrBn, isWanBnWr: isWanBnWr, allStrings: allStrings
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
