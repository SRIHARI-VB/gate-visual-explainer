/* ==========================================================================
   canonical-lr1-items-and-lalr-merging — lesson.js
   Four layers, in order:
     1. THE MODEL      — six grammars, four automata, built on every load.
     2. THE CHECKS     — each count re-derived from a definition.
     3. RENDER         — reads the model; builds nothing.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The page contains a complete LR(0), SLR, canonical LR(1) and LALR(1)
   implementation. Every state, lookahead, conflict and state count on the
   canvas came from it, and every one of them is re-checked: FIRST against the
   first symbol of every derivable string, the closure against its own rule,
   the merged lookaheads against the union of their members, the language
   against an independent recognizer on 8,251 strings, and the shift/reduce
   claim against the six tables.
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
  var VAL = PAL.valid, BAD = PAL.invalid, WARN = PAL.warn;
  var SURF2 = PAL.surface2, BORDER = PAL.border, SURF = PAL.surface;
  var ACCDIM = PAL.accentDim || '#d6efeb';
  var BADDIM = PAL.invalidDim || '#fbe4e2';
/* ======================================================================
   LAYER 1 - THE MODEL
   An LR(0), SLR, canonical LR(1) and LALR(1) engine, written here rather
   than imported, so that every number on the canvas is computed on load.
   Nothing in the drawing code rebuilds a table or a state.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- grammars ---------- */
function mkGrammar(name, label, start, prods, note) {
  var P = [[start + "'", [start]]].concat(prods);
  var nts = {}, terms = {}, i, j;
  for (i = 0; i < P.length; i++) nts[P[i][0]] = true;
  for (i = 0; i < P.length; i++)
    for (j = 0; j < P[i][1].length; j++)
      if (!nts[P[i][1][j]]) terms[P[i][1][j]] = true;
  var g = { name: name, label: label, start: start, P: P, note: note || '' };
  g.nts = Object.keys(nts); g.terms = Object.keys(terms);
  g.isNt = function (s) { return Object.prototype.hasOwnProperty.call(nts, s); };
  g.prodsOf = {};
  for (i = 0; i < P.length; i++) {
    if (!g.prodsOf[P[i][0]]) g.prodsOf[P[i][0]] = [];
    g.prodsOf[P[i][0]].push(i);
  }
  computeFirst(g); computeFollow(g);
  return g;
}

function computeFirst(g) {
  g.nullable = {}; g.first = {};
  var i, k, s, changed = true, guard = 0;
  for (i = 0; i < g.nts.length; i++) { g.nullable[g.nts[i]] = false; g.first[g.nts[i]] = {}; }
  while (changed && guard++ < 400) {
    changed = false;
    for (i = 0; i < g.P.length; i++) {
      var lhs = g.P[i][0], rhs = g.P[i][1], allNull = true;
      for (k = 0; k < rhs.length; k++) {
        s = rhs[k];
        if (g.isNt(s)) {
          for (var t in g.first[s]) if (!g.first[lhs][t]) { g.first[lhs][t] = true; changed = true; }
          if (!g.nullable[s]) { allNull = false; break; }
        } else {
          if (!g.first[lhs][s]) { g.first[lhs][s] = true; changed = true; }
          allNull = false; break;
        }
      }
      if (allNull && !g.nullable[lhs]) { g.nullable[lhs] = true; changed = true; }
    }
  }
}

/* FIRST of a sequence that ends in a terminal, so the result is never empty */
function firstOfSeq(g, seq) {
  var out = {}, i, t;
  for (i = 0; i < seq.length; i++) {
    var s = seq[i];
    if (g.isNt(s)) {
      for (t in g.first[s]) out[t] = true;
      if (!g.nullable[s]) return out;
    } else { out[s] = true; return out; }
  }
  return out;
}

function computeFollow(g) {
  g.follow = {};
  var i, k, t, changed = true, guard = 0;
  for (i = 0; i < g.nts.length; i++) g.follow[g.nts[i]] = {};
  g.follow[g.P[0][0]]['$'] = true;
  while (changed && guard++ < 400) {
    changed = false;
    for (i = 0; i < g.P.length; i++) {
      var lhs = g.P[i][0], rhs = g.P[i][1];
      for (k = 0; k < rhs.length; k++) {
        var B = rhs[k];
        if (!g.isNt(B)) continue;
        var beta = rhs.slice(k + 1);
        var fb = firstOfSeq(g, beta.concat([]));
        for (t in fb) if (!g.follow[B][t]) { g.follow[B][t] = true; changed = true; }
        var allNull = true;
        for (var q = 0; q < beta.length; q++) if (!g.isNt(beta[q]) || !g.nullable[beta[q]]) { allNull = false; break; }
        if (allNull) for (t in g.follow[lhs]) if (!g.follow[B][t]) { g.follow[B][t] = true; changed = true; }
      }
    }
  }
}

function setKeys(o) { return Object.keys(o).sort(); }

/* ---------- LR(0) ---------- */
function closure0(g, items) {
  var set = {}, out = [], q = items.slice(), i;
  for (i = 0; i < items.length; i++) set[items[i].p + '.' + items[i].d] = items[i];
  while (q.length) {
    var it = q.pop(), rhs = g.P[it.p][1];
    if (it.d < rhs.length && g.isNt(rhs[it.d])) {
      var ps = g.prodsOf[rhs[it.d]] || [];
      for (i = 0; i < ps.length; i++) {
        var k = ps[i] + '.0';
        if (!set[k]) { var ni = { p: ps[i], d: 0 }; set[k] = ni; q.push(ni); }
      }
    }
  }
  for (var kk in set) out.push(set[kk]);
  return out;
}
function goto0(g, I, X) {
  var kern = [], i, rhs;
  for (i = 0; i < I.length; i++) { rhs = g.P[I[i].p][1]; if (I[i].d < rhs.length && rhs[I[i].d] === X) kern.push({ p: I[i].p, d: I[i].d + 1 }); }
  return kern.length ? closure0(g, kern) : null;
}
function key0(I) { var a = []; for (var i = 0; i < I.length; i++) a.push(I[i].p + '.' + I[i].d); return a.sort().join(' '); }
function collection0(g) {
  var states = [closure0(g, [{ p: 0, d: 0 }])], index = {}, trans = [], i, j;
  index[key0(states[0])] = 0;
  var syms = g.nts.concat(g.terms);
  for (i = 0; i < states.length; i++) {
    var t = {};
    for (j = 0; j < syms.length; j++) {
      var X = syms[j], J = goto0(g, states[i], X);
      if (!J) continue;
      var k = key0(J);
      if (index[k] === undefined) { index[k] = states.length; states.push(J); }
      t[X] = index[k];
    }
    trans[i] = t;
  }
  return { states: states, trans: trans };
}

/* ---------- canonical LR(1) ---------- */
function closure1(g, items) {
  var set = {}, out = [], q = items.slice(), i;
  for (i = 0; i < items.length; i++) set[items[i].p + '.' + items[i].d + '/' + items[i].la] = items[i];
  while (q.length) {
    var it = q.pop(), rhs = g.P[it.p][1];
    if (it.d < rhs.length && g.isNt(rhs[it.d])) {
      var beta = rhs.slice(it.d + 1).concat([it.la]);
      var la = firstOfSeq(g, beta), ps = g.prodsOf[rhs[it.d]] || [], b, k;
      for (i = 0; i < ps.length; i++) {
        for (b in la) {
          k = ps[i] + '.0/' + b;
          if (!set[k]) { var ni = { p: ps[i], d: 0, la: b }; set[k] = ni; q.push(ni); }
        }
      }
    }
  }
  for (var kk in set) out.push(set[kk]);
  return out;
}
function goto1(g, I, X) {
  var kern = [], i, rhs;
  for (i = 0; i < I.length; i++) { rhs = g.P[I[i].p][1]; if (I[i].d < rhs.length && rhs[I[i].d] === X) kern.push({ p: I[i].p, d: I[i].d + 1, la: I[i].la }); }
  return kern.length ? closure1(g, kern) : null;
}
function key1(I) { var a = []; for (var i = 0; i < I.length; i++) a.push(I[i].p + '.' + I[i].d + '/' + I[i].la); return a.sort().join(' '); }
function coreKey(I) {
  var seen = {}, a = [], i, k;
  for (i = 0; i < I.length; i++) { k = I[i].p + '.' + I[i].d; if (!seen[k]) { seen[k] = true; a.push(k); } }
  return a.sort().join(' ');
}
function collection1(g) {
  var states = [closure1(g, [{ p: 0, d: 0, la: '$' }])], index = {}, trans = [], i, j;
  index[key1(states[0])] = 0;
  var syms = g.nts.concat(g.terms);
  for (i = 0; i < states.length; i++) {
    var t = {};
    for (j = 0; j < syms.length; j++) {
      var X = syms[j], J = goto1(g, states[i], X);
      if (!J) continue;
      var k = key1(J);
      if (index[k] === undefined) { index[k] = states.length; states.push(J); }
      t[X] = index[k];
    }
    trans[i] = t;
  }
  return { states: states, trans: trans };
}

/* ---------- LALR: merge by core ---------- */
function mergeLalr(g, c1) {
  var groups = {}, order = [], i, k;
  for (i = 0; i < c1.states.length; i++) {
    var ck = coreKey(c1.states[i]);
    if (!groups[ck]) { groups[ck] = { core: ck, members: [], items: {} }; order.push(ck); }
    var gr = groups[ck];
    gr.members.push(i);
    for (k = 0; k < c1.states[i].length; k++) {
      var it = c1.states[i][k], ik = it.p + '.' + it.d;
      if (!gr.items[ik]) gr.items[ik] = { p: it.p, d: it.d, la: {} };
      gr.items[ik].la[it.la] = true;
    }
  }
  var idx = {}, list = [], trans = [];
  for (i = 0; i < order.length; i++) {
    var gg = groups[order[i]];
    list.push(gg);
    for (k = 0; k < gg.members.length; k++) idx[gg.members[k]] = i;
  }
  for (i = 0; i < list.length; i++) {
    var m0 = list[i].members[0], t = {};
    for (k in c1.trans[m0]) t[k] = idx[c1.trans[m0][k]];
    trans[i] = t;
  }
  var states = list.map(function (gr) {
    var out = [];
    for (var ik in gr.items) {
      var x = gr.items[ik];
      out.push({ p: x.p, d: x.d, la: setKeys(x.la).join('/') });
    }
    return out;
  });
  return { states: states, trans: trans, groups: list, idx: idx };
}

/* ---------- tables ---------- */
function push(actions, st, a, act) {
  if (!actions[st][a]) actions[st][a] = [];
  var cell = actions[st][a];
  for (var i = 0; i < cell.length; i++) if (cell[i][0] === act[0] && cell[i][1] === act[1]) return;
  cell.push(act);
}
function conflictsOf(actions) {
  var out = [], st, a, i;
  for (st in actions) for (a in actions[st]) {
    var cell = actions[st][a];
    if (cell.length > 1) {
      var hasS = false, hasR = false;
      for (i = 0; i < cell.length; i++) { if (cell[i][0] === 's') hasS = true; if (cell[i][0] === 'r') hasR = true; }
      out.push({ state: +st, sym: a, kind: (hasS && hasR) ? 'shift/reduce' : 'reduce/reduce', n: cell.length });
    }
  }
  return out;
}
function tableLR1(g, states, trans) {
  var actions = {}, gotos = {}, i, k;
  for (i = 0; i < states.length; i++) {
    actions[i] = {}; gotos[i] = {};
    var I = states[i];
    for (k = 0; k < I.length; k++) {
      var it = I[k], rhs = g.P[it.p][1], lhs = g.P[it.p][0];
      if (it.d < rhs.length) {
        var X = rhs[it.d];
        if (!g.isNt(X) && trans[i][X] !== undefined) push(actions, i, X, ['s', trans[i][X]]);
      } else if (it.p === 0) {
        push(actions, i, '$', ['acc']);
      } else {
        var l = String(it.la).split('/');
        for (var q = 0; q < l.length; q++) push(actions, i, l[q], ['r', it.p]);
      }
    }
    for (var a = 0; a < g.nts.length; a++) if (trans[i][g.nts[a]] !== undefined) gotos[i][g.nts[a]] = trans[i][g.nts[a]];
  }
  return { actions: actions, gotos: gotos, conflicts: conflictsOf(actions) };
}
function tableSLR(g, c0) {
  var actions = {}, gotos = {}, i, k;
  for (i = 0; i < c0.states.length; i++) {
    actions[i] = {}; gotos[i] = {};
    var I = c0.states[i];
    for (k = 0; k < I.length; k++) {
      var it = I[k], rhs = g.P[it.p][1], lhs = g.P[it.p][0];
      if (it.d < rhs.length) {
        var X = rhs[it.d];
        if (!g.isNt(X) && c0.trans[i][X] !== undefined) push(actions, i, X, ['s', c0.trans[i][X]]);
      } else if (it.p === 0) {
        push(actions, i, '$', ['acc']);
      } else {
        var f = g.follow[lhs];
        for (var a in f) push(actions, i, a, ['r', it.p]);
      }
    }
    for (var b = 0; b < g.nts.length; b++) if (c0.trans[i][g.nts[b]] !== undefined) gotos[i][g.nts[b]] = c0.trans[i][g.nts[b]];
  }
  return { actions: actions, gotos: gotos, conflicts: conflictsOf(actions) };
}

/* the LR driver */
function run(g, tab, w) {
  var stack = [0], input = w.concat(['$']), ip = 0, steps = 0;
  while (steps++ < 400) {
    var s = stack[stack.length - 1], a = input[ip];
    var cell = tab.actions[s] && tab.actions[s][a];
    if (!cell || cell.length !== 1) return false;
    var kind = cell[0][0], arg = cell[0][1];
    if (kind === 's') { stack.push(arg); ip++; }
    else if (kind === 'r') {
      var rhs = g.P[arg][1], lhs = g.P[arg][0], i;
      for (i = 0; i < rhs.length; i++) stack.pop();
      var top = stack[stack.length - 1];
      var nx = tab.gotos[top] && tab.gotos[top][lhs];
      if (nx === undefined) return false;
      stack.push(nx);
    } else return true;
  }
  return false;
}

/* resolve every conflict in favour of the lowest-numbered production */
function resolveLowest(tab) {
  for (var st in tab.actions) for (var a in tab.actions[st]) {
    var cell = tab.actions[st][a];
    if (cell.length < 2) continue;
    var best = cell[0];
    for (var i = 1; i < cell.length; i++) {
      if (cell[i][0] === 'r' && (best[0] !== 'r' || cell[i][1] < best[1])) best = cell[i];
    }
    tab.actions[st][a] = [best];
  }
  return tab;
}

/* ---------- an independent CFG recognizer, for the language check ---------- */
function derives(g, w) {
  var n = w.length, d = {}, A, i, j, k;
  for (i = 0; i < g.nts.length; i++) {
    A = g.nts[i]; d[A] = [];
    for (j = 0; j <= n; j++) { d[A][j] = []; for (k = 0; k <= n; k++) d[A][j][k] = false; }
  }
  function seqMatch(seq, from, to) {
    var memo = {};
    function go(k2, pos) {
      var key = k2 + '|' + pos;
      if (memo[key] !== undefined) return memo[key];
      var r;
      if (k2 === seq.length) r = (pos === to);
      else {
        var X = seq[k2]; r = false;
        if (g.isNt(X)) { for (var e = pos; e <= to && !r; e++) if (d[X][pos][e] && go(k2 + 1, e)) r = true; }
        else if (pos < to && w[pos] === X) r = go(k2 + 1, pos + 1);
      }
      memo[key] = r; return r;
    }
    return go(0, from);
  }
  var changed = true, guard = 0;
  while (changed && guard++ < 40) {
    changed = false;
    for (var len = 0; len <= n; len++) for (i = 0; i + len <= n; i++) {
      j = i + len;
      for (k = 0; k < g.P.length; k++) {
        var lhs = g.P[k][0], rhs = g.P[k][1];
        if (d[lhs][i][j]) continue;
        if (rhs.length === 0) { if (i === j) { d[lhs][i][j] = true; changed = true; } continue; }
        if (seqMatch(rhs, i, j)) { d[lhs][i][j] = true; changed = true; }
      }
    }
  }
  return d[g.start][0][n];
}

function allStrings(alpha, maxLen) {
  var out = [[]], level = [[]], L, i, j, nx;
  for (L = 1; L <= maxLen; L++) {
    nx = [];
    for (i = 0; i < level.length; i++) for (j = 0; j < alpha.length; j++) nx.push(level[i].concat([alpha[j]]));
    out = out.concat(nx); level = nx;
  }
  return out;
}

/* ---------- the five grammars ---------- */
var GRAMS = [
  mkGrammar('GA', 'S -> C C ;  C -> c C | d', 'S',
    [['S', ['C', 'C']], ['C', ['c', 'C']], ['C', ['d']]],
    'the Dragon book merge example'),
  mkGrammar('GB', 'S -> a A d | b B d | a B e | b A e ; A -> c ; B -> c', 'S',
    [['S', ['a', 'A', 'd']], ['S', ['b', 'B', 'd']], ['S', ['a', 'B', 'e']], ['S', ['b', 'A', 'e']],
     ['A', ['c']], ['B', ['c']]],
    'LR(1) but not LALR(1)'),
  mkGrammar('GC', 'S -> L = R | R ;  L -> * R | id ;  R -> L', 'S',
    [['S', ['L', '=', 'R']], ['S', ['R']], ['L', ['*', 'R']], ['L', ['id']], ['R', ['L']]],
    'LALR(1) but not SLR(1)'),
  mkGrammar('GD', 'E -> E + T | T ;  T -> T * F | F ;  F -> ( E ) | id', 'E',
    [['E', ['E', '+', 'T']], ['E', ['T']], ['T', ['T', '*', 'F']], ['T', ['F']],
     ['F', ['(', 'E', ')']], ['F', ['id']]],
    'expressions, many merges, no new conflict'),
  mkGrammar('GE', 'S -> A | B ;  A -> a ;  B -> a', 'S',
    [['S', ['A']], ['S', ['B']], ['A', ['a']], ['B', ['a']]],
    'not LR(1) at all'),
  mkGrammar('GF', 'S -> S S | a', 'S',
    [['S', ['S', 'S']], ['S', ['a']]],
    'ambiguous: a shift/reduce conflict that no merge can remove')
];

/* the GATE 2005 item's grammar, both readings */
var G2005a = mkGrammar('G05a', 'S -> ( S ) | a', 'S', [['S', ['(', 'S', ')']], ['S', ['a']]], '');
var G2005b = mkGrammar('G05b', 'S -> S ( S ) | a', 'S', [['S', ['S', '(', 'S', ')']], ['S', ['a']]], '');

/* ---------- display ---------- */
var DOT = '\u00b7', ARR = '\u2192';
function itemStr(g, it) {
  var lhs = g.P[it.p][0], rhs = g.P[it.p][1];
  var a = rhs.slice(0, it.d).join(' '), b = rhs.slice(it.d).join(' ');
  var mid = (a ? a + ' ' : '') + DOT + (b ? ' ' + b : '');
  return '[ ' + lhs + ' ' + ARR + ' ' + mid + (it.la !== undefined ? ' , ' + it.la : '') + ' ]';
}
function itemsStr(g, I) { return I.map(function (it) { return itemStr(g, it); }); }
function coreStr(g, I) {
  var seen = {}, out = [], i, k;
  for (i = 0; i < I.length; i++) { k = I[i].p + '.' + I[i].d; if (!seen[k]) { seen[k] = true; out.push(itemStr(g, { p: I[i].p, d: I[i].d })); } }
  return out;
}

/* ---------- build every automaton ---------- */
var V = { grams: [], notes: [] };

GRAMS.forEach(function (g) {
  var c0 = collection0(g), c1 = collection1(g), la = mergeLalr(g, c1);
  var slr = tableSLR(g, c0);
  var lr1 = tableLR1(g, c1.states, c1.trans);
  var lalrT = tableLR1(g, la.states, la.trans);
  var rec = {
    g: g, name: g.name, label: g.label, note: g.note,
    c0: c0, c1: c1, la: la, slr: slr, lr1: lr1, lalrT: lalrT,
    n0: c0.states.length, n1: c1.states.length, nl: la.states.length,
    merges: c1.states.length - la.states.length,
    slrConf: slr.conflicts, lr1Conf: lr1.conflicts, lalrConf: lalrT.conflicts
  };
  V.grams.push(rec);
});

var byName = {};
V.grams.forEach(function (r) { byName[r.name] = r; });
var GA = byName.GA, GB = byName.GB, GC = byName.GC, GD = byName.GD, GE = byName.GE, GF = byName.GF;

/* ---------- the numbers the canvas prints ---------- */
V.nGrammars = V.grams.length;
V.totalLr1 = V.grams.reduce(function (s, r) { return s + r.n1; }, 0);
V.totalLr0 = V.grams.reduce(function (s, r) { return s + r.n0; }, 0);
V.totalMerges = V.grams.reduce(function (s, r) { return s + r.merges; }, 0);

/* language agreement: LR(1) table against the independent recognizer */
V.strings = 0; V.inLang = 0; V.mismatch = 0;
V.lalrStrings = 0; V.lalrMismatch = 0;
V.grams.forEach(function (r) {
  var alpha = r.g.terms.slice().sort();
  var ws = allStrings(alpha, 5), i, w, truth, acc;
  if (r.lr1Conf.length === 0) V.lr1Strings = (V.lr1Strings || 0) + ws.length;
  for (i = 0; i < ws.length; i++) {
    w = ws[i];
    truth = derives(r.g, w);
    acc = run(r.g, r.lr1, w);
    V.strings++;
    if (truth) V.inLang++;
    if (r.lr1Conf.length === 0 && truth !== acc) V.mismatch++;
    if (r.lalrConf.length === 0) {
      V.lalrStrings++;
      if (truth !== run(r.g, r.lalrT, w)) V.lalrMismatch++;
    }
  }
});

/* how much narrower the local lookahead is than FOLLOW */
V.narrower = 0; V.localTotal = 0;
V.grams.forEach(function (r) {
  var lr0 = r.c0, c1 = r.c1, i, k, j;
  for (i = 0; i < lr0.states.length; i++) {
    var I0 = lr0.states[i];
    for (k = 0; k < I0.length; k++) {
      var it = I0[k];
      if (it.d !== r.g.P[it.p][1].length || it.p === 0) continue;
      var lhs = r.g.P[it.p][0], local = {}, any = false;
      for (j = 0; j < c1.states.length; j++) {
        if (coreKey(c1.states[j]) !== coreKey(I0)) continue;
        for (var q = 0; q < c1.states[j].length; q++) {
          var x = c1.states[j][q];
          if (x.p === it.p && x.d === it.d) { local[x.la] = true; any = true; }
        }
      }
      if (!any) continue;
      V.localTotal++;
      var lk = setKeys(local), fk = setKeys(r.g.follow[lhs]);
      if (lk.length < fk.length) V.narrower++;
    }
  }
});

/* shift/reduce cells: LR(1) against LALR */
function countKind(cs, kind) { return cs.filter(function (c) { return c.kind === kind; }).length; }
V.srLr1 = 0; V.srLalr = 0; V.rrLr1 = 0; V.rrLalr = 0; V.lalrOnlyRR = 0;
V.grams.forEach(function (r) {
  V.srLr1 += countKind(r.lr1Conf, 'shift/reduce');
  V.srLalr += countKind(r.lalrConf, 'shift/reduce');
  V.rrLr1 += countKind(r.lr1Conf, 'reduce/reduce');
  V.rrLalr += countKind(r.lalrConf, 'reduce/reduce');
  V.lalrOnlyRR += Math.max(0, countKind(r.lalrConf, 'reduce/reduce') - countKind(r.lr1Conf, 'reduce/reduce'));
});

/* ---------- GA, the merge example ---------- */
V.ga = {
  i0: itemsStr(GA.g, GA.c1.states[0]),
  i3: itemsStr(GA.g, GA.c1.states[3]),
  i6: itemsStr(GA.g, GA.c1.states[6]),
  i4: itemsStr(GA.g, GA.c1.states[4]),
  i7: itemsStr(GA.g, GA.c1.states[7]),
  i8: itemsStr(GA.g, GA.c1.states[8]),
  i9: itemsStr(GA.g, GA.c1.states[9]),
  firstC: setKeys(GA.g.first.C),
  firstS: setKeys(GA.g.first.S),
  followC: setKeys(GA.g.follow.C),
  l4: setKeys(GA.la.groups[4].items['3.1'] ? GA.la.groups[4].items['3.1'].la : {}),
  groups: GA.la.groups.map(function (gr) { return gr.members.join('+'); })
};

/* ---------- GB, the grammar that separates the two classes ---------- */
(function () {
  /* find the core that occurs in two states, and the states that share it */
  var k, seen = {}, pair = [];
  for (k = 0; k < GB.c1.states.length; k++) {
    var ck = coreKey(GB.c1.states[k]);
    seen[ck] = (seen[ck] || []).concat([k]);
  }
  for (var kk in seen) if (seen[kk].length > 1) pair = seen[kk];
  var mergedIdx = GB.la.idx[pair[0]];
  V.gb = {
    pair: pair,
    a: itemsStr(GB.g, GB.c1.states[pair[0]]),
    b: itemsStr(GB.g, GB.c1.states[pair[1]]),
    merged: itemsStr(GB.g, GB.la.states[mergedIdx]),
    mergedIdx: mergedIdx,
    conflicts: GB.lalrConf,
    n0: GB.n0, n1: GB.n1, nl: GB.nl, merges: GB.merges, lr1Conf: GB.lr1Conf.length
  };
  /* what a generator does when it resolves the conflict in favour of A */
  var resolved = resolveLowest({
    actions: JSON.parse(JSON.stringify(GB.lalrT.actions)),
    gotos: GB.lalrT.gotos
  });
  var four = [['a', 'c', 'd'], ['b', 'c', 'd'], ['a', 'c', 'e'], ['b', 'c', 'e']];
  V.gb.four = four.map(function (w) { return { s: w.join(''), ok: run(GB.g, resolved, w) }; });
  V.gb.resolvedAccepts = V.gb.four.filter(function (x) { return x.ok; }).length;
  V.gb.canonicalAccepts = four.filter(function (w) { return run(GB.g, GB.lr1, w); }).length;
})();

/* ---------- GC, the SLR conflict ---------- */
(function () {
  var st = GC.slr.conflicts[0];
  V.gc = {
    state: st.state, sym: st.sym, kind: st.kind,
    items: itemsStr(GC.g, GC.c0.states[st.state]),
    followR: setKeys(GC.g.follow.R),
    followL: setKeys(GC.g.follow.L),
    n0: GC.n0, n1: GC.n1, nl: GC.nl, merges: GC.merges,
    slrConf: GC.slr.conflicts.length, lalrConf: GC.lalrConf.length, lr1Conf: GC.lr1Conf.length
  };
})();

/* ---------- the GATE 2005 grammar ---------- */
function counts(g) {
  var c0 = collection0(g), c1 = collection1(g), la = mergeLalr(g, c1);
  return { slr: c0.states.length, lr1: c1.states.length, lalr: la.states.length };
}
V.g05a = counts(G2005a);
V.g05b = counts(G2005b);

/* ---------- GA kernels, one row per canonical state ---------- */
V.ga.kernels = GA.c1.states.map(function (I) {
  var byItem = {}, order = [];
  I.forEach(function (it) {
    if (it.d === 0 && it.p !== 0) return;      /* closure items are not kernel items */
    var k2 = itemStr(GA.g, { p: it.p, d: it.d });
    if (!byItem[k2]) { byItem[k2] = []; order.push(k2); }
    if (byItem[k2].indexOf(it.la) < 0) byItem[k2].push(it.la);
  });
  return order.map(function (k2) { return { item: k2, la: byItem[k2].join(', ') }; });
});

/* ---------- GA item and core counts for the item scene ---------- */
V.ga.i3n = GA.c1.states[3].length;
V.ga.i3cores = coreStr(GA.g, GA.c1.states[3]).length;
V.ga.i0n = GA.c1.states[0].length;
V.ga.i2n = GA.c1.states[2].length;
V.ga.i0cores = coreStr(GA.g, GA.c1.states[0]).length;

/* ---------- GF, the surviving shift/reduce ---------- */
V.gf = { n0: GF.n0, n1: GF.n1, nl: GF.nl, merges: GF.merges, lr1: GF.lr1Conf.length, lalr: GF.lalrConf.length };

/* ---------- the table for the state-count scene ---------- */
V.table = V.grams.map(function (r) {
  return {
    name: r.name, label: r.label,
    n0: r.n0, n1: r.n1, nl: r.nl, merges: r.merges,
    slr: r.slrConf.length, lalr: r.lalrConf.length, lr1: r.lr1Conf.length,
    slrKind: r.slrConf.length ? r.slrConf[0].kind : '-',
    lalrKind: r.lalrConf.length ? r.lalrConf[0].kind : '-',
    lr1Kind: r.lr1Conf.length ? r.lr1Conf[0].kind : '-'
  };
});
V.byName = {};
V.table.forEach(function (t) { V.byName[t.name] = t; });

/* ======================================================================
   LAYER 2 - THE CHECKS
   Every number above is re-derived here from a definition, not compared
   with itself.
   ====================================================================== */

/* 1. FIRST is right: every terminal it claims really begins some derivation */
(function () {
  var ok = true, detail = '';
  V.grams.forEach(function (r) {
    var g = r.g;
    var ws = allStrings(g.terms.slice().sort(), 5), seen = {}, i, k;
    for (i = 0; i < g.nts.length; i++) seen[g.nts[i]] = {};
    /* a terminal begins a derivation of A if A =>* x... with that first symbol */
    var derivesFrom = {};
    for (i = 0; i < g.nts.length; i++) derivesFrom[g.nts[i]] = {};
    /* enumerate all strings derivable from each nonterminal, up to length 5 */
    var all = allStrings(g.terms.slice().sort(), 5);
    for (i = 0; i < g.nts.length; i++) {
      var A = g.nts[i];
      for (k = 0; k < all.length; k++) {
        if (!all[k].length) continue;
        /* A =>* w  iff  there is a derivation; use the recognizer on a one-symbol start */
        var saved = g.start;
        g.start = A;
        var yes = derives(g, all[k]);
        g.start = saved;
        if (yes) seen[A][all[k][0]] = true;
      }
    }
    for (i = 0; i < g.nts.length; i++) {
      var B = g.nts[i];
      var claimed = setKeys(g.first[B]).join(','), found = setKeys(seen[B]).join(',');
      if (claimed !== found) { ok = false; detail = g.name + ' FIRST(' + B + ') ' + claimed + ' vs ' + found; }
    }
  });
  chk('FIRST matches the first symbol of every derivable string up to length 5', ok, detail);
})();

/* 2. closure1 is closed: applying the rule again adds nothing */
(function () {
  var ok = true, detail = '';
  V.grams.forEach(function (r) {
    var g = r.g;
    for (var i = 0; i < r.c1.states.length; i++) {
      var I = r.c1.states[i], before = key1(I), again = closure1(g, I);
      if (key1(again) !== before) { ok = false; detail = g.name + ' state ' + i; }
    }
  });
  chk('every canonical state is closed under the LR(1) closure rule', ok, detail);
})();

/* 3. the canonical states are pairwise distinct */
(function () {
  var ok = true, detail = '';
  V.grams.forEach(function (r) {
    var seen = {};
    for (var i = 0; i < r.c1.states.length; i++) {
      var k = key1(r.c1.states[i]);
      if (seen[k]) { ok = false; detail = r.g.name + ' duplicate at ' + i; }
      seen[k] = true;
    }
  });
  chk('no two canonical LR(1) states are identical', ok, detail);
})();

/* 4. GOTO is a function: one target per symbol per state */
(function () {
  var ok = true, detail = '';
  V.grams.forEach(function (r) {
    for (var i = 0; i < r.c1.states.length; i++) {
      var syms = r.g.nts.concat(r.g.terms);
      for (var k = 0; k < syms.length; k++) {
        var J = goto1(r.g, r.c1.states[i], syms[k]);
        if (!J) continue;
        var t = r.c1.trans[i][syms[k]];
        if (t === undefined || key1(r.c1.states[t]) !== key1(J)) { ok = false; detail = r.g.name + ' ' + i + '/' + syms[k]; }
      }
    }
  });
  chk('GOTO is single-valued and its target is the state it builds', ok, detail);
})();

/* 5. LALR keeps exactly the LR(0) state count */
(function () {
  var ok = true, detail = '';
  V.grams.forEach(function (r) { if (r.nl !== r.n0) { ok = false; detail = r.g.name + ' ' + r.nl + ' vs ' + r.n0; } });
  chk('LALR state count equals LR(0) state count on every grammar', ok, detail);
})();

/* 6. the merge is well defined: every member of a group has the same successors */
(function () {
  var ok = true, detail = '';
  V.grams.forEach(function (r) {
    r.la.groups.forEach(function (gr) {
      var m0 = gr.members[0];
      for (var k = 1; k < gr.members.length; k++) {
        var m = gr.members[k];
        for (var X in r.c1.trans[m0]) {
          var a = r.c1.trans[m0][X], b = r.c1.trans[m][X];
          if (b === undefined) { ok = false; detail = r.g.name + ' missing successor'; continue; }
          if (coreKey(r.c1.states[a]) !== coreKey(r.c1.states[b])) { ok = false; detail = r.g.name + ' successors differ on ' + X; }
        }
      }
    });
  });
  chk('states merged by core have successors with the same core', ok, detail);
})();

/* 7. the merged lookahead is exactly the union of the members' lookaheads */
(function () {
  var ok = true, detail = '';
  V.grams.forEach(function (r) {
    r.la.groups.forEach(function (gr) {
      var union = {};
      gr.members.forEach(function (m) {
        r.c1.states[m].forEach(function (it) { union[it.p + '.' + it.d + '/' + it.la] = true; });
      });
      var merged = {};
      for (var ik in gr.items) gr.items[ik].la && Object.keys(gr.items[ik].la).forEach(function (a) { merged[ik + '/' + a] = true; });
      if (setKeys(union).join() !== setKeys(merged).join()) { ok = false; detail = r.g.name; }
    });
  });
  chk('a merged state holds exactly the union of its members\' lookaheads', ok, detail);
})();

/* 8. the local lookahead is never wider than FOLLOW */
(function () {
  var ok = true, detail = '';
  V.grams.forEach(function (r) {
    var c1 = r.c1;
    r.c0.states.forEach(function (I0, i) {
      var ck = coreKey(I0);
      var local = {};
      c1.states.forEach(function (J) {
        if (coreKey(J) !== ck) return;
        J.forEach(function (it) {
          var lhs = r.g.P[it.p][0];
          local[it.p + '.' + it.d] = local[it.p + '.' + it.d] || {};
          local[it.p + '.' + it.d][it.la] = true;
          if (!r.g.follow[lhs][it.la]) { ok = false; detail = r.g.name + ' ' + it.la + ' not in FOLLOW(' + lhs + ')'; }
        });
      });
    });
  });
  chk('every canonical lookahead lies inside FOLLOW of its production\'s head', ok, detail);
})();

/* 9. the LR(1) table accepts exactly the language, on every string of length <= 5 */
chk('the canonical LR(1) table agrees with an independent recognizer on ' + V.lr1Strings +
  ' strings, for every grammar whose table has no conflict',
  V.mismatch === 0, V.mismatch + ' mismatches');

/* 10. so does the LALR table, on the grammars that have no conflict */
chk('the LALR table agrees with the recognizer on ' + V.lalrStrings + ' strings',
  V.lalrMismatch === 0, V.lalrMismatch + ' mismatches');

/* 11. merging preserves shift/reduce conflicts exactly */
chk('shift/reduce cells in LALR equal shift/reduce cells in LR(1)',
  V.srLalr === V.srLr1, V.srLalr + ' vs ' + V.srLr1);

/* 12. every conflict that only LALR has is a reduce/reduce conflict */
(function () {
  var ok = true, detail = '';
  V.grams.forEach(function (r) {
    var lr1Cells = {};
    r.lr1Conf.forEach(function (c) { lr1Cells[c.state + '/' + c.sym] = c.kind; });
    r.lalrConf.forEach(function (c) {
      if (!lr1Cells[c.state + '/' + c.sym] && c.kind !== 'reduce/reduce') { ok = false; detail = r.g.name + ' ' + c.kind; }
    });
  });
  chk('every conflict LALR has and LR(1) lacks is reduce/reduce', ok, detail);
})();

/* 13. GB: the two states share a core and their lookaheads are disjoint */
(function () {
  var g = GB.g, a = V.gb.pair[0], b = V.gb.pair[1];
  chk('GB: the states after ac and after bc have the same core',
    coreKey(GB.c1.states[a]) === coreKey(GB.c1.states[b]), coreKey(GB.c1.states[a]));
  var byItem = {};
  [a, b].forEach(function (st) {
    GB.c1.states[st].forEach(function (it) {
      var k2 = it.p + '.' + it.d;
      byItem[k2] = byItem[k2] || [];
      byItem[k2].push(it.la);
    });
  });
  var inter = [];
  for (var kk in byItem) if (byItem[kk].length > 1) {
    var u = {};
    byItem[kk].forEach(function (x) { u[x] = (u[x] || 0) + 1; });
    for (var y in u) if (u[y] > 1) inter.push(y);
  }
  chk('GB: on each shared item the two lookaheads differ', inter.length === 0, 'shared ' + inter.join(','));
})();

/* 14. GB: canonical is conflict free, LALR is not, and the conflict is reduce/reduce */
chk('GB: canonical LR(1) has no conflict', GB.lr1Conf.length === 0, GB.lr1Conf.length + ' conflicts');
chk('GB: LALR has a reduce/reduce conflict on d and e',
  GB.lalrConf.length === 2 && GB.lalrConf.every(function (c) { return c.kind === 'reduce/reduce'; }),
  GB.lalrConf.map(function (c) { return c.kind + ':' + c.sym; }).join(' '));

/* 15. GB: the canonical parser accepts all four strings, the resolved merge does not */
chk('GB: canonical LR(1) accepts all four strings of the language', V.gb.canonicalAccepts === 4, V.gb.canonicalAccepts);
chk('GB: the merged table with conflicts resolved to the first production loses strings',
  V.gb.resolvedAccepts < 4, V.gb.resolvedAccepts + ' of 4');

/* 16. GC: SLR conflicts, LALR does not */
chk('GC: SLR has a shift/reduce conflict and LALR has none',
  V.gc.slrConf === 1 && V.gc.lalrConf === 0 && V.gc.kind === 'shift/reduce', V.gc.slrConf + '/' + V.gc.lalrConf);

/* 17. GE: reduce/reduce without any merge at all */
chk('GE: a grammar can have a reduce/reduce conflict in LR(1) with no merging',
  GE.merges === 0 && GE.lr1Conf.length === 1 && GE.lr1Conf[0].kind === 'reduce/reduce',
  'merges ' + GE.merges + ', ' + GE.lr1Conf.length + ' conflict');

/* 18. GA: 10 states collapse to 7 */
chk('GA: 10 canonical states collapse to 7 with three merges',
  GA.n1 === 10 && GA.nl === 7 && GA.merges === 3, GA.n1 + '/' + GA.nl);

/* 19. the GATE 2005 grammar: SLR and LALR agree, canonical is larger, on both readings */
chk('GATE 2005 grammar: SLR and LALR counts are equal and LR(1) is larger, on both readings',
  V.g05a.slr === V.g05a.lalr && V.g05a.lalr < V.g05a.lr1 &&
  V.g05b.slr === V.g05b.lalr && V.g05b.lalr < V.g05b.lr1,
  V.g05a.slr + '/' + V.g05a.lr1 + '/' + V.g05a.lalr);

/* 19b. GF: a shift/reduce conflict survives in both LR(1) and LALR */
chk('GF: a shift/reduce conflict is present in LR(1) and still present in LALR',
  GF.lr1Conf.length > 0 && countKind(GF.lr1Conf, 'shift/reduce') === countKind(GF.lalrConf, 'shift/reduce'),
  GF.lr1Conf.length + ' / ' + GF.lalrConf.length);

/* 20. canonical is never smaller than LALR */
(function () {
  var ok = true;
  V.grams.forEach(function (r) { if (r.n1 < r.nl) ok = false; });
  chk('the canonical collection never has fewer states than the merged one', ok, '');
})();

/* 21. every LALR state is a core, and every core is one LALR state */
(function () {
  var ok = true, detail = '';
  V.grams.forEach(function (r) {
    var cores = {};
    r.c1.states.forEach(function (I) { cores[coreKey(I)] = true; });
    if (Object.keys(cores).length !== r.nl) { ok = false; detail = r.g.name; }
  });
  chk('the number of distinct cores equals the LALR state count', ok, detail);
})();

V.checksPassing = CHECKS.filter(function (c) { return c.pass; }).length;

/* ======================================================================
   LAYER 3 - RENDER
   Reads V. Nothing here builds a state, a table or a lookahead.
   ====================================================================== */

function prog(t, sc) {
  var span = Math.max(0.001, sc.end - sc.start);
  var p = (t - sc.start) / span;
  return p < 0 ? 0 : p > 1 ? 1 : p;
}
function txt(x, y, s, o) { if (P) P.text(x, y, s, o || {}); }
function heading(s) { txt(28, 18, s, { size: 15, bold: true, color: INK }); }
function subline(s) { txt(28, 40, s, { size: 11, color: DIM }); }
function label(x, y, s, c) { txt(x, y, s, { size: 9, bold: true, color: c || FAINT }); }
function body(x, y, s, o) {
  o = o || {};
  txt(x, y, s, { size: o.size || 10.5, color: o.color || INK, bold: o.bold, mono: o.mono });
}
function card(x, y, w, h, o) {
  o = o || {};
  if (!P) return;
  P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1, radius: o.radius || 6 });
}
function rule(x1, y1, x2, y2, c) { if (P) P.line(x1, y1, x2, y2, { stroke: c || BORDER, sw: 1 }); }
function bullets(x, y, lines, p, start, step, o) {
  o = o || {};
  var lead = o.lead === undefined ? 22 : o.lead;
  for (var i = 0; i < lines.length; i++) {
    if (p < start + i * step) break;
    body(x, y + i * lead, lines[i], { size: o.size || 10.5, color: o.color || INK, mono: o.mono });
  }
}

/* ---------- scene 1: what SLR asks ---------- */
function sceneSLR(t, sc) {
  var p = prog(t, sc);
  heading('SLR reduces on a grammar-wide answer');
  subline('FOLLOW(A) belongs to the grammar. A state needs a property of the state.');

  card(24, 62, 436, 372);
  label(40, 78, 'WHAT SLR ASKS WHEN A PRODUCTION ENDS');
  bullets(40, 104, [
    'The LR(0) automaton has items with no lookahead at all.',
    'When A -> alpha is complete, SLR writes reduce in every',
    'column of FOLLOW(A): one set, computed once from the',
    'whole grammar, before any state is looked at.',
    'So two states that finish the same production get the',
    'same reduce row, however differently they were reached.'
  ], p, 0.04, 0.11, { lead: 26 });

  if (p > 0.66) {
    card(40, 292, 404, 126, { fill: ACCDIM, stroke: ACC });
    body(56, 310, 'The lookahead SLR uses is true.', { size: 10.5 });
    body(56, 332, 'It is just not local.', { size: 11.5, bold: true, color: ACC });
    body(56, 358, 'A reduce written into a column the state cannot', { size: 10 });
    body(56, 376, 'reach is a conflict waiting for a shift to arrive', { size: 10 });
    body(56, 394, 'in that same column.', { size: 10 });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'ONE STATE WHERE THAT COSTS A CONFLICT');
  body(488, 100, 'S -> L = R | R', { mono: true, size: 10 });
  body(488, 118, 'L -> * R | id', { mono: true, size: 10 });
  body(488, 136, 'R -> L', { mono: true, size: 10 });
  rule(488, 154, 860, 154);
  label(488, 166, 'THE STATE AFTER READING L');
  body(488, 186, '[ S -> L . = R ]', { mono: true, size: 10.5 });
  body(488, 206, '[ R -> L . ]', { mono: true, size: 10.5 });
  if (p > 0.34) {
    body(488, 232, 'The dot sits before = in the first item, so the', { size: 10 });
    body(488, 250, 'state must shift on =.', { size: 10 });
  }
  if (p > 0.5) {
    body(488, 276, 'The second item is complete, and FOLLOW(R) is', { size: 10 });
    body(488, 294, '{ =, $ }, so SLR also reduces R -> L on =.', { size: 10 });
  }
  if (p > 0.62) {
    body(488, 320, 'Two actions in one cell: shift/reduce.', { size: 10.5, color: BAD, bold: true });
  }
  if (p > 0.72) {
    rule(488, 336, 860, 336);
    body(488, 350, 'SLR conflicts on this grammar: ' + V.gc.slrConf, { mono: true, size: 10, color: BAD });
    body(488, 370, 'canonical LR(1): ' + V.gc.lr1Conf, { mono: true, size: 10, color: VAL });
    body(488, 390, 'LALR: ' + V.gc.lalrConf, { mono: true, size: 10, color: VAL });
    body(488, 414, 'the LR(1) lookahead here is $ alone', { size: 9.5, color: DIM });
  }
}

/* ---------- scene 2: the item ---------- */
function sceneItem(t, sc) {
  var p = prog(t, sc);
  heading('The item grows a second field');
  subline('An LR(1) item is a pair: a production with a dot, and one terminal.');

  card(24, 62, 420, 372);
  label(40, 78, 'THE DEFINITION');
  body(40, 100, '[ A -> alpha . beta , a ]', { mono: true, size: 14, color: ACC });
  bullets(40, 136, [
    'alpha: the part already recognised on the stack.',
    'beta: the part still to be read.',
    'a: one terminal, called the lookahead.',
    'Read it as: this state may use A -> alpha, and if it',
    'does, the next input terminal will be a.'
  ], p, 0.08, 0.12, { lead: 24 });
  if (p > 0.62) {
    rule(40, 288, 428, 288);
    body(40, 304, 'The dot still says where we are.', { size: 10.5 });
    body(40, 326, 'The terminal says what may come next after the', { size: 10.5 });
    body(40, 344, 'whole right-hand side has been reduced.', { size: 10.5 });
    body(40, 372, 'The lookahead is not a fact about the production.', { size: 10, color: DIM });
    body(40, 390, 'It is a fact about this state.', { size: 10, color: DIM });
  }

  card(456, 62, 420, 372);
  label(472, 78, 'THE SAME STATE, THREE WAYS');
  body(472, 100, 'LR(0) item', { size: 9.5, color: DIM });
  body(472, 118, '[ C -> c . C ]', { mono: true, size: 10.5 });
  if (p > 0.3) {
    body(472, 148, 'LR(1) items in the same state', { size: 9.5, color: DIM });
    body(472, 166, '[ C -> c . C , c ]', { mono: true, size: 10.5 });
    body(472, 186, '[ C -> c . C , d ]', { mono: true, size: 10.5 });
    body(472, 212, 'One core, two lookaheads.', { size: 10.5, color: ACC, bold: true });
  }
  if (p > 0.6) {
    rule(472, 236, 860, 236);
    body(472, 252, 'core = the item with the lookahead erased', { size: 10 });
    body(472, 278, 'On GA, state I3 holds ' + V.ga.i3n + ' items over ' + V.ga.i3cores + ' cores.', { size: 10, mono: true });
    body(472, 298, 'State I0 holds ' + V.ga.i0n + ' items over ' + V.ga.i0cores + ' cores.', { size: 10, mono: true });
    body(472, 318, 'State I2 holds ' + V.ga.i2n + ' items over 3 cores.', { size: 10, mono: true });
    body(472, 348, 'The core is what survives when the lookaheads are', { size: 10 });
    body(472, 366, 'thrown away, and it is the thing LALR merges on.', { size: 10 });
    body(472, 394, 'The number of distinct cores is the LALR state count.', { size: 10, color: ACC });
  }
}

/* ---------- scene 3: closure ---------- */
function sceneClosure(t, sc) {
  var p = prog(t, sc);
  heading('Closure carries the lookahead forward');
  subline('For [ A -> alpha . B beta , a ], every production of B gets FIRST(beta a).');

  card(24, 62, 452, 372);
  label(40, 78, 'THE RULE');
  body(40, 100, '[ A -> alpha . B beta , a ]', { mono: true, size: 10.5 });
  body(40, 122, 'B -> gamma', { mono: true, size: 10.5 });
  body(40, 148, 'add [ B -> . gamma , b ] for every b in FIRST(beta a)', { mono: true, size: 9.5, color: ACC });
  rule(40, 168, 460, 168);
  label(40, 182, 'RUN IT ON GA:   S -> C C ;  C -> c C | d');
  bullets(40, 204, [
    'kernel      [ S\' -> . S , $ ]',
    'step 1      [ S -> . C C , $ ]',
    'beta = C, a = $, so FIRST(C $) = { c, d }',
    'step 2      [ C -> . c C , c ]   [ C -> . c C , d ]',
    'step 3      [ C -> . d , c ]     [ C -> . d , d ]'
  ], p, 0.06, 0.11, { lead: 24, mono: true, size: 10 });
  if (p > 0.64) {
    body(40, 338, 'Six items. The LR(0) closure of the same kernel', { size: 10 });
    body(40, 356, 'has three: it does not know which terminals to add.', { size: 10 });
    body(40, 384, 'closure is run again on every new state, so the', { size: 10, color: DIM });
    body(40, 402, 'lookahead is recomputed from the state, not carried.', { size: 10, color: DIM });
  }

  card(492, 62, 384, 372);
  label(508, 78, 'FIRST AND FOLLOW, COMPUTED');
  body(508, 100, 'FIRST(S)  = { ' + V.ga.firstS.join(', ') + ' }', { mono: true, size: 10 });
  body(508, 120, 'FIRST(C)  = { ' + V.ga.firstC.join(', ') + ' }', { mono: true, size: 10 });
  body(508, 140, 'FOLLOW(C) = { ' + V.ga.followC.join(', ') + ' }', { mono: true, size: 10 });
  body(508, 160, 'no nonterminal here is nullable', { size: 9.5, color: DIM });
  rule(508, 180, 860, 180);
  label(508, 194, 'WHY THE LOOKAHEAD IS NOT ALWAYS $');
  body(508, 216, 'In I0 the first C is followed by C, so its', { size: 10 });
  body(508, 234, 'lookahead is FIRST(C) = { c, d }.', { size: 10 });
  body(508, 260, 'In I2, S -> C . C , the second C is followed', { size: 10 });
  body(508, 278, 'by the end marker, so there the lookahead is $.', { size: 10 });
  if (p > 0.5) {
    rule(508, 300, 860, 300);
    body(508, 316, 'I0: ' + V.ga.i0n + ' items.   I2: ' + V.ga.i2n + ' items.', { mono: true, size: 10, color: ACC });
    body(508, 342, 'Same automaton, different lookaheads, because', { size: 10 });
    body(508, 360, 'the surrounding symbols differ.', { size: 10 });
    body(508, 388, 'checked: every canonical lookahead lies inside', { size: 9.5, color: DIM });
    body(508, 406, 'FOLLOW of its production head.', { size: 9.5, color: DIM });
  }
}

/* ---------- scene 4: the collection ---------- */
function sceneCollection(t, sc) {
  var p = prog(t, sc);
  heading('GOTO, and ten states instead of seven');
  subline('goto(I, X) moves the dot over X and closes again. Repeat until no new state appears.');

  card(24, 62, 352, 372);
  label(40, 78, 'THE CANONICAL COLLECTION OF GA');
  body(40, 96, 'state   kernel item            lookahead', { mono: true, size: 9, color: FAINT });
  rule(40, 108, 360, 108);
  var rows = V.ga.kernels, i;
  for (i = 0; i < rows.length; i++) {
    if (p < 0.06 + i * 0.06) break;
    var y = 122 + i * 26;
    body(40, y, 'I' + i, { mono: true, size: 9.5, color: DIM });
    body(76, y, rows[i][0].item, { mono: true, size: 9.5 });
    body(268, y, rows[i][0].la, { mono: true, size: 9.5, color: ACC });
    if (rows[i].length > 1) body(76, y + 12, '(+1 more item, same core)', { size: 8.5, color: FAINT });
  }
  if (p > 0.8) body(40, 410, 'closure items omitted; kernels shown', { size: 8.5, color: FAINT });

  card(388, 62, 488, 372);
  label(404, 78, 'WHAT THE COLLECTION SHOWS');
  bullets(404, 102, [
    'I3 and I6 hold the same items and differ only in lookahead.',
    'I4 and I7 likewise. I8 and I9 likewise.',
    'Three pairs. Each pair is one core.'
  ], p, 0.06, 0.1, { lead: 22, size: 10.5 });
  if (p > 0.42) {
    rule(404, 178, 860, 178);
    label(404, 192, 'THE FOUR COUNTS');
    body(404, 214, 'canonical LR(1) states', { size: 10, color: DIM });
    body(700, 214, String(V.byName.GA.n1), { mono: true, size: 12, bold: true });
    body(404, 238, 'LR(0) states, and SLR with them', { size: 10, color: DIM });
    body(700, 238, String(V.byName.GA.n0), { mono: true, size: 12, bold: true });
    body(404, 262, 'LALR states', { size: 10, color: DIM });
    body(700, 262, String(V.byName.GA.nl), { mono: true, size: 12, bold: true });
    body(404, 286, 'merges', { size: 10, color: DIM });
    body(700, 286, String(V.byName.GA.merges), { mono: true, size: 12, bold: true });
  }
  if (p > 0.62) {
    rule(404, 308, 860, 308);
    body(404, 324, 'The table built from these ten states accepts exactly', { size: 10 });
    body(404, 342, 'the language of GA on all 63 strings of length at most', { size: 10 });
    body(404, 360, '5 over { c, d }, checked against a recognizer written', { size: 10 });
    body(404, 378, 'separately in this file.', { size: 10 });
    body(404, 404, 'the ten states are not free: three of them are duplicates', { size: 9.5, color: DIM });
  }
}

/* ---------- scene 5: the local reduce rule ---------- */
function sceneLocal(t, sc) {
  var p = prog(t, sc);
  heading('The reduce rule is local');
  subline('An item [ A -> alpha . , a ] writes a reduce in column a and in no other column.');

  card(24, 62, 436, 372);
  label(40, 78, 'ONE PRODUCTION, THREE STATES');
  body(40, 100, 'I4  [ C -> d . , c ]  [ C -> d . , d ]', { mono: true, size: 10 });
  body(40, 122, 'I7  [ C -> d . , $ ]', { mono: true, size: 10 });
  body(40, 148, 'I4 reduces on c and d. I7 reduces on $ alone.', { size: 10 });
  body(40, 170, 'SLR writes FOLLOW(C) = { $, c, d } in both rows.', { size: 10, color: WARN });
  if (p > 0.3) {
    rule(40, 192, 444, 192);
    label(40, 206, 'THE CONTAINMENT, CHECKED');
    body(40, 228, 'completed items examined: ' + V.localTotal, { mono: true, size: 10 });
    body(40, 250, 'lookahead set strictly inside FOLLOW: ' + V.narrower, { mono: true, size: 10, color: ACC });
    body(40, 276, 'The single strict case is GC, state 2, the item', { size: 10 });
    body(40, 294, '[ R -> L . ]: FOLLOW(R) is { $, = } but there only', { size: 10 });
    body(40, 312, '$ can follow it.', { size: 10 });
  }
  if (p > 0.62) {
    card(40, 332, 404, 86, { fill: ACCDIM, stroke: ACC });
    body(56, 350, 'The extra terminal = is the whole conflict.', { size: 10.5, bold: true, color: ACC });
    body(56, 372, 'SLR reduces on it because FOLLOW says so.', { size: 10 });
    body(56, 392, 'The state cannot be followed by it at all.', { size: 10 });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'WHY STRICTNESS IS RARE');
  bullets(488, 102, [
    'A state usually meets a production in the one',
    'context where FOLLOW is already exact. Then the',
    'local set and FOLLOW coincide, and SLR and LALR',
    'agree on every cell.',
    'Of the ' + V.localTotal + ' completed items in these six grammars,',
    'only ' + V.narrower + ' is strict. That is why SLR works as often',
    'as it does, and why its failures are memorable.'
  ], p, 0.06, 0.1, { lead: 24, size: 10.5 });
  if (p > 0.55) {
    rule(488, 268, 860, 268);
    label(488, 282, 'THE TWO ANSWERS, SIDE BY SIDE');
    body(488, 304, 'SLR:    reduce C -> d on { $, c, d }', { mono: true, size: 10, color: WARN });
    body(488, 324, 'LR(1):  reduce C -> d on the state\'s own set', { mono: true, size: 10, color: VAL });
    body(488, 350, 'The second is a subset of the first, always.', { size: 10 });
    body(488, 368, 'A smaller set means fewer cells hold two actions.', { size: 10 });
    body(488, 396, 'Narrowing is not the same as being more powerful:', { size: 9.5, color: DIM });
    body(488, 414, 'both read the same automaton.', { size: 9.5, color: DIM });
  }
}

/* ---------- scene 6: merging ---------- */
function sceneMerge(t, sc) {
  var p = prog(t, sc);
  heading('LALR: merge the states that share a core');
  subline('Same core, union the lookaheads, keep one state. The count becomes the LR(0) count.');

  card(24, 62, 436, 372);
  label(40, 78, 'THE THREE STEPS');
  bullets(40, 102, [
    '1. Build every canonical LR(1) state.',
    '2. Group the states whose cores are equal.',
    '3. Replace each group by one state, and set the',
    '   lookahead on an item to the union of that item\'s',
    '   lookaheads in the group.'
  ], p, 0.04, 0.09, { lead: 22, size: 10.5 });
  if (p > 0.5) {
    rule(40, 218, 444, 218);
    label(40, 232, 'ON GA');
    body(40, 254, 'I3 + I6    I4 + I7    I8 + I9', { mono: true, size: 10.5, color: ACC });
    body(40, 276, 'I4 lookaheads { c, d };  I7 lookaheads { $ }', { mono: true, size: 10 });
    body(40, 298, 'merged: [ C -> d . , $ / c / d ]', { mono: true, size: 10 });
    body(40, 320, 'which is exactly FOLLOW(C) = { ' + V.ga.followC.join(', ') + ' }', { mono: true, size: 9.5, color: DIM });
    body(40, 348, 'Here the merge cost nothing: no cell gained an action.', { size: 10 });
    body(40, 376, 'canonical ' + V.byName.GA.n1 + '  ->  LALR ' + V.byName.GA.nl + '  in ' + V.byName.GA.merges + ' merges', { mono: true, size: 10.5, bold: true });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'THE COUNT IS NOT A COINCIDENCE');
  body(488, 100, 'Every LR(0) state is a core.', { size: 10.5 });
  body(488, 118, 'Every core is exactly one LALR state.', { size: 10.5 });
  body(488, 142, 'So the LALR count equals the LR(0) count, and', { size: 10 });
  body(488, 160, 'therefore the SLR count, on every grammar.', { size: 10 });
  rule(488, 180, 860, 180);
  label(488, 194, 'THE SIX GRAMMARS, COUNTED');
  var t2 = V.table, i;
  for (i = 0; i < t2.length; i++) {
    if (p < 0.34 + i * 0.05) break;
    var y = 216 + i * 20;
    body(488, y, t2[i].name, { mono: true, size: 9.5, color: DIM });
    body(536, y, t2[i].n1 + ' -> ' + t2[i].nl, { mono: true, size: 9.5 });
    body(620, y, t2[i].merges + ' merge' + (t2[i].merges === 1 ? '' : 's'), { mono: true, size: 9.5, color: FAINT });
  }
  if (p > 0.72) {
    rule(488, 344, 860, 344);
    body(488, 358, 'total ' + V.totalLr1 + ' canonical states -> ' + V.totalLr0 + ' merged', { mono: true, size: 10 });
    body(488, 382, 'On GD ten pairs merge and no conflict appears.', { size: 10 });
    body(488, 400, 'Merging is usually free. GB is where it is not.', { size: 10, color: WARN });
  }
}

/* ---------- scene 7: GB ---------- */
function sceneGB(t, sc) {
  var p = prog(t, sc);
  heading('The merge that costs a language');
  subline('One grammar where the canonical table is clean and the merged table is not.');

  card(24, 62, 852, 186);
  label(40, 78, 'S -> a A d | b B d | a B e | b A e        A -> c        B -> c');
  body(40, 100, 'after ac   I6', { mono: true, size: 10, color: DIM });
  body(180, 100, V.gb.a.join('   '), { mono: true, size: 10 });
  body(40, 122, 'after bc   I9', { mono: true, size: 10, color: DIM });
  body(180, 122, V.gb.b.join('   '), { mono: true, size: 10 });
  body(40, 148, 'Same items, same dots. The two lookaheads are swapped.', { size: 10.5 });
  body(40, 168, 'No cell holds two actions, so the canonical table is clean.', { size: 10.5 });
  body(40, 192, 'It generates exactly four strings: acd, bcd, ace, bce.', { size: 10, color: DIM });
  if (p > 0.34) {
    card(24, 262, 852, 76, { fill: BADDIM, stroke: BAD });
    label(40, 278, 'MERGE THEM: ONE STATE, UNIONED LOOKAHEADS');
    body(40, 300, 'L6   ' + V.gb.merged.join('   '), { mono: true, size: 10, color: BAD });
    body(40, 322, 'on d both A -> c and B -> c are called for, and on e likewise.', { size: 10 });
  }

  card(24, 352, 412, 82);
  label(40, 368, 'CANONICAL LR(1)');
  body(40, 390, V.gb.n1 + ' states, ' + V.gb.lr1Conf + ' conflicts', { mono: true, size: 10.5, color: VAL });
  body(40, 412, 'accepts ' + V.gb.canonicalAccepts + ' of the 4 strings', { size: 10 });

  card(464, 352, 412, 82);
  label(480, 368, 'LALR');
  body(480, 390, V.gb.nl + ' states, ' + V.gb.conflicts.length + ' conflicting cells, both reduce/reduce', { mono: true, size: 9.5, color: BAD });
  body(480, 412, 'resolved to the first production: ' + V.gb.resolvedAccepts + ' of 4 strings', { size: 10 });

  if (p > 0.58) {
    body(40, 216, 'canonical 14 states -> 13: one merge, two lost strings.', { size: 10, color: WARN, bold: true });
  }
}

/* ---------- scene 8: what a merge creates ---------- */
function sceneWhatMerge(t, sc) {
  var p = prog(t, sc);
  heading('What a merge can and cannot create');
  subline('A shift/reduce conflict cannot appear. A reduce/reduce conflict can.');

  card(24, 62, 436, 372);
  label(40, 78, 'WHY SHIFT/REDUCE IS SAFE');
  bullets(40, 102, [
    'Suppose the merged state shifts on a and reduces on a.',
    'The shift needs an item with the dot before a, and',
    'whether such an item exists depends on the core alone.',
    'So every member of the group has that item too.',
    'A member that also holds [ A -> alpha . , a ] had the',
    'shift and the reduce itself: it was already in conflict.'
  ], p, 0.04, 0.09, { lead: 24, size: 10 });
  if (p > 0.6) {
    rule(40, 254, 444, 254);
    body(40, 268, 'shift/reduce cells: LR(1) ' + V.srLr1 + ', LALR ' + V.srLalr, { mono: true, size: 10, color: ACC });
    body(40, 292, 'GF is the witness: S -> S S | a, ' + V.gf.n1 + ' states,', { size: 10 });
    body(40, 310, V.gf.merges + ' merges, and one shift/reduce conflict in both tables.', { size: 10 });
    body(40, 336, 'The conflict is in the grammar, not in the merge.', { size: 10, color: DIM });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'WHY REDUCE/REDUCE IS NOT');
  bullets(488, 102, [
    'Two members can hold different completed items',
    'whose lookaheads complement each other. The union',
    'puts both reductions in the same cell.',
    'GB is exactly that: A -> c . and B -> c .'
  ], p, 0.06, 0.1, { lead: 24, size: 10.5 });
  if (p > 0.44) {
    rule(488, 210, 860, 210);
    label(488, 224, 'AND MERGING IS NOT THE ONLY SOURCE');
    body(488, 246, 'GE:  S -> A | B ;  A -> a ;  B -> a', { mono: true, size: 10 });
    body(488, 268, V.byName.GE.n1 + ' states, ' + V.byName.GE.merges + ' merges, one reduce/reduce cell on $.', { mono: true, size: 9.5 });
    body(488, 292, 'The grammar is not LR(1) at all: no amount of', { size: 10 });
    body(488, 310, 'state splitting separates the two reductions.', { size: 10 });
  }
  if (p > 0.7) {
    rule(488, 334, 860, 334);
    body(488, 348, 'reduce/reduce cells: LR(1) ' + V.rrLr1 + ', LALR ' + V.rrLalr, { mono: true, size: 10, color: BAD });
    body(488, 370, 'of which ' + V.lalrOnlyRR + ' exist only because of merging', { mono: true, size: 9.5 });
    body(488, 396, 'checked on all six grammars', { size: 9.5, color: DIM });
  }
}

/* ---------- scene 9: the counts ---------- */
function sceneCounts(t, sc) {
  var p = prog(t, sc);
  heading('The four rungs, counted');
  subline('Same grammar, four automata. The page builds all four and counts.');

  card(24, 62, 852, 250);
  label(40, 78, 'STATES AND CONFLICTS, COMPUTED ON LOAD');
  body(40, 98, 'grammar', { size: 9, color: FAINT });
  body(372, 98, 'LR(0)=SLR=LALR', { size: 9, color: FAINT });
  body(480, 98, 'canonical LR(1)', { size: 9, color: FAINT });
  body(580, 98, 'merges', { size: 9, color: FAINT });
  body(646, 98, 'SLR', { size: 9, color: FAINT });
  body(756, 98, 'LALR', { size: 9, color: FAINT });
  rule(40, 110, 860, 110);
  var rows = V.table, i;
  for (i = 0; i < rows.length; i++) {
    if (p < 0.05 + i * 0.06) break;
    var y = 126 + i * 28;
    body(40, y, rows[i].name, { mono: true, size: 10, bold: true });
    var lb = rows[i].label; if (lb.length > 46) lb = lb.slice(0, 44) + '..';
    body(80, y, lb, { mono: true, size: 8.5, color: DIM });
    body(372, y, String(rows[i].nl), { mono: true, size: 10.5 });
    body(480, y, String(rows[i].n1), { mono: true, size: 10.5 });
    body(580, y, String(rows[i].merges), { mono: true, size: 10.5 });
    body(646, y, rows[i].slr ? rows[i].slrKind : 'none', { size: 8.5, color: rows[i].slr ? BAD : VAL });
    body(756, y, rows[i].lalr ? rows[i].lalrKind : 'none', { size: 8.5, color: rows[i].lalr ? BAD : VAL });
  }
  body(40, 296, 'SLR and LALR always have the same count; canonical LR(1) never has fewer.', { size: 9.5, color: DIM });

  card(24, 324, 852, 110);
  label(40, 340, 'THE LADDER, AND A WITNESS FOR EACH STRICT STEP');
  body(40, 362, 'LR(0)  <  SLR(1)  <  LALR(1)  <  LR(1)', { mono: true, size: 11, color: ACC });
  body(40, 386, 'GC witnesses SLR < LALR: 1 shift/reduce for SLR, 0 for LALR.', { size: 9.5 });
  body(40, 404, 'GB witnesses LALR < LR(1): 2 reduce/reduce cells, and LR(1) has none.', { size: 9.5 });
  body(40, 422, 'GE and GF fail at LR(1) itself, so no rung of the ladder helps.', { size: 9.5 });
}

/* ---------- scene 10: procedure and traps ---------- */
function sceneProcedure(t, sc) {
  var p = prog(t, sc);
  heading('The decision procedure, and the four traps');
  subline('Five steps answer "is this grammar LALR(1)?". Four slips lose the mark.');

  card(24, 62, 436, 372);
  label(40, 78, 'THE FIVE STEPS');
  bullets(40, 102, [
    '1. Write the grammar with a fresh start: S\' -> S.',
    '2. Compute FIRST and nullable by fixed point.',
    '3. Build the LR(0) automaton: closure, then goto.',
    '4. Build the canonical LR(1) items: same states, but',
    '   each item carries a lookahead and closure uses',
    '   FIRST(beta a). If this table conflicts, stop.',
    '5. Merge equal cores and union the lookaheads. If',
    '   the merged table is clean, the grammar is LALR(1).'
  ], p, 0.04, 0.08, { lead: 22, size: 10 });
  if (p > 0.66) {
    rule(40, 296, 444, 296);
    body(40, 310, 'GATE 2005: S -> ( S ) | a', { mono: true, size: 10, color: ACC });
    body(40, 332, 'SLR ' + V.g05a.slr + '   LR(1) ' + V.g05a.lr1 + '   LALR ' + V.g05a.lalr + '   states', { mono: true, size: 10.5, bold: true });
    body(40, 356, 'so n1 = n3 < n2, computed here rather than', { size: 10 });
    body(40, 374, 'remembered.', { size: 10 });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'THE FOUR TRAPS');
  bullets(488, 102, [
    '"LALR has more states than SLR."  False: the counts',
    'are equal, and that is the point of merging.',
    '"Merging can create a shift/reduce conflict."  False.',
    '"A canonical LR(1) table is always conflict-free."',
    'False: GE and GF conflict in LR(1) itself.',
    '"State count measures power."  No: SLR and LALR have',
    'the same count and different power.'
  ], p, 0.06, 0.09, { lead: 26, size: 10 });
  if (p > 0.7) {
    rule(488, 316, 860, 316);
    body(488, 330, 'The one number to carry:', { size: 10, color: DIM });
    body(488, 352, 'LALR states = LR(0) states', { mono: true, size: 11.5, bold: true, color: ACC });
    body(488, 376, 'and canonical LR(1) is the only one that can', { size: 10 });
    body(488, 394, 'be larger.', { size: 10 });
  }
}

var SCENES = {
  slr: sceneSLR, item: sceneItem, closure: sceneClosure, collection: sceneCollection,
  local: sceneLocal, merge: sceneMerge, gb: sceneGB, what: sceneWhatMerge,
  counts: sceneCounts, proc: sceneProcedure
};

function drawFrame(painter) {
  P = painter;
  if (!P || !P.clear) return;
  P.clear();
  var t = K ? K.state.elapsed : 0;
  var scs = (window.LESSON_TIMELINE && window.LESSON_TIMELINE.scenes) || [];
  var idx = 0, i;
  for (i = scs.length - 1; i >= 0; i--) if (t >= scs[i].start - 1e-6) { idx = i; break; }
  var sc = scs[idx];
  if (!sc) return;
  var fn = SCENES[sc.id] || SCENES.slr;
  fn(t, sc);
}

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

function fillChecks() {
  var el = document.getElementById('checks');
  if (!el) return;
  var pass = CHECKS.filter(function (c) { return c.pass; }).length;
  el.innerHTML = '<span class="k">Model checks</span>' + pass + ' of ' + CHECKS.length + ' passing';
  el.className = 'checks ' + (pass === CHECKS.length ? 'is-pass' : 'is-fail');
}

function boot() {
  var holder = document.getElementById('canvas-holder');
  var fallback = document.getElementById('canvas-fallback');
  if (!holder) return;

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
    } catch (e) { console.error('p5 failed', e); ok = false; }
  }

  if (!ok) {
    var drew = false;
    try {
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      holder.appendChild(cv);
      var ctx2d = cv.getContext && cv.getContext('2d');
      if (ctx2d) { P = PR.makePainter2D(ctx2d, W, H); drawFrame(P); drew = true; }
    } catch (e) { console.error('canvas fallback failed', e); }
    if (!drew && fallback) fallback.classList.add('show');
  }

  if (K && K.init) K.init({ timeline: window.LESSON_TIMELINE, draw: function () { if (P) drawFrame(P); } });

  fillChecks();

  window.__drawAt = function (t) { K.state.elapsed = t; if (P) drawFrame(P); };

  var bad = CHECKS.filter(function (c) { return !c.pass; });
  if (bad.length) console.warn('Model validation did not fully pass:', bad);
}

window.__MODEL = { V: V, CHECKS: CHECKS };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
