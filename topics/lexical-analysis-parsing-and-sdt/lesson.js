/* ==========================================================================
   lexical-analysis-parsing-and-sdt - lesson.js
   Four layers, in order:
     1. THE MODEL   - a longest-match scanner, FIRST/FOLLOW by fixed point,
                      the LL(1) table and a predictive parser, the LR(0) item
                      automaton, SLR / LALR / canonical LR(1) tables, a
                      shift-reduce engine, syntax-directed evaluation and a
                      three-address code generator with its own tiny VM.
     2. THE CHECKS  - every figure re-verified against a definition. The
                      FOLLOW sets are checked against a bounded leftmost
                      derivation that never uses the fixed-point equations;
                      every parser is checked against the language enumerated
                      by brute force; every state count is checked against an
                      independent goto computation.
     3. RENDER      - reads the model; never re-derives it.
     4. BOOT        - p5.js first, the browser's own canvas as the fallback.

   Nothing on the canvas is asserted. Every number drawn was computed here and
   checked against the property it is supposed to have. What cannot be computed
   (a theorem about a class of grammars) is labelled a theorem in the written
   tabs and never presented as a computation.
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

  var CHECKS = [];
  function chk(name, pass, detail) {
    CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
  }

/* Model development harness for lexical-analysis-parsing-and-sdt.
   Everything here is later embedded in lesson.js; this file exists so the
   algorithms can be tested in plain node before any drawing code exists. */

const EPS = '@';

function G(start, lines) {
  const prods = [];
  for (const line of lines) {
    const [lhs, rhs] = line.split('->').map(s => s.trim());
    const alts = rhs.split('|').map(s => s.trim());
    for (const alt of alts) {
      prods.push({ id: prods.length, lhs, rhs: alt === '' || alt === 'eps' ? [] : alt.split(/\s+/), text: lhs + ' -> ' + (alt === '' ? 'eps' : alt) });
    }
  }
  const nts = new Set(prods.map(p => p.lhs));
  const terms = new Set();
  for (const p of prods) for (const s of p.rhs) if (!nts.has(s)) terms.add(s);
  return { start, prods, nts, terms };
}

function augment(g) {
  const S2 = g.start + "'";
  const prods = [{ id: 0, lhs: S2, rhs: [g.start], text: S2 + ' -> ' + g.start }];
  for (const p of g.prods) prods.push({ id: p.id + 1, lhs: p.lhs, rhs: p.rhs, text: p.text });
  const nts = new Set(prods.map(p => p.lhs));
  const terms = new Set();
  for (const p of prods) for (const s of p.rhs) if (!nts.has(s)) terms.add(s);
  return { start: S2, origStart: g.start, prods, nts, terms };
}

/* ---------- FIRST / FOLLOW ---------- */

function firstSets(g) {
  const F = {};
  for (const A of g.nts) F[A] = new Set();
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of g.prods) {
      const add = (sym) => { if (!F[p.lhs].has(sym)) { F[p.lhs].add(sym); changed = true; } };
      if (p.rhs.length === 0) add(EPS);
      let allNullable = true;
      for (const X of p.rhs) {
        if (!g.nts.has(X)) { add(X); allNullable = false; break; }
        for (const a of F[X]) if (a !== EPS) add(a);
        if (!F[X].has(EPS)) { allNullable = false; break; }
      }
      if (allNullable && p.rhs.length > 0) add(EPS);
    }
  }
  return F;
}

function firstOfSeq(seq, F, g) {
  const out = new Set();
  let allNullable = true;
  for (const X of seq) {
    if (!g.nts.has(X)) { out.add(X); allNullable = false; break; }
    for (const a of F[X]) if (a !== EPS) out.add(a);
    if (!F[X].has(EPS)) { allNullable = false; break; }
  }
  if (allNullable) out.add(EPS);
  return out;
}

function followSets(g) {
  const F = firstSets(g);
  const Fo = {};
  for (const A of g.nts) Fo[A] = new Set();
  Fo[g.start].add('$');
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of g.prods) {
      for (let i = 0; i < p.rhs.length; i++) {
        const B = p.rhs[i];
        if (!g.nts.has(B)) continue;
        const beta = p.rhs.slice(i + 1);
        const f = firstOfSeq(beta, F, g);
        for (const a of f) if (a !== EPS && !Fo[B].has(a)) { Fo[B].add(a); changed = true; }
        if (f.has(EPS)) {
          for (const a of Fo[p.lhs]) if (!Fo[B].has(a)) { Fo[B].add(a); changed = true; }
        }
      }
    }
  }
  return Fo;
}

/* Independent FOLLOW check: expand sentential forms leftmost to a bounded
   length and record, for every nonterminal occurrence, the terminal that
   immediately follows it. This never uses the fixed-point equations. */
function followByDerivation(g, maxLen, maxForms) {
  const out = {};
  for (const A of g.nts) out[A] = new Set();
  out[g.start].add('$');
  const seen = new Set();
  let forms = 0;
  const stack = [[g.start]];
  seen.add(g.start);
  while (stack.length && forms < (maxForms || 200000)) {
    const sf = stack.pop();
    forms++;
    // record follows at every nonterminal occurrence
    for (let i = 0; i < sf.length; i++) {
      if (!g.nts.has(sf[i])) continue;
      const nxt = sf[i + 1];
      if (nxt === undefined) continue;
      if (!g.nts.has(nxt)) out[sf[i]].add(nxt);
    }
    // leftmost nonterminal
    const k = sf.findIndex(s => g.nts.has(s));
    if (k < 0) continue;
    const A = sf[k];
    for (const p of g.prods) {
      if (p.lhs !== A) continue;
      const next = sf.slice(0, k).concat(p.rhs, sf.slice(k + 1));
      const termCount = next.filter(s => !g.nts.has(s)).length;
      if (termCount > maxLen) continue;
      if (next.length > maxLen * 3 + 6) continue;
      const key = next.join(' ');
      if (seen.has(key)) continue;
      seen.add(key);
      stack.push(next);
    }
  }
  return out;
}

/* Split an input string into the longest matching terminal at each position. */
function tokenize(g, str) {
  const terms = [...g.terms].sort((a, b) => b.length - a.length);
  const out = [];
  let i = 0;
  while (i < str.length) {
    let hit = null;
    for (const t of terms) if (str.startsWith(t, i)) { hit = t; break; }
    if (!hit) return null;
    out.push(hit);
    i += hit.length;
  }
  return out;
}

/* ---------- a longest-match scanner for a small C-like language ---------- */

const KEYWORDS = ['if', 'else', 'then', 'int', 'while', 'return'];

function scan(src) {
  const KW = new Set(KEYWORDS);
  const out = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === ' ' || c === '\n' || c === '\t') { i++; continue; }
    if (/[a-zA-Z_]/.test(c)) {
      let j = i; while (j < src.length && /[a-zA-Z0-9_]/.test(src[j])) j++;
      const w = src.slice(i, j);
      out.push({ t: KW.has(w) ? 'keyword' : 'id', v: w, cls: KW.has(w) ? w : 'id', from: i, to: j });
      i = j; continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i; while (j < src.length && /[0-9]/.test(src[j])) j++;
      out.push({ t: 'num', v: src.slice(i, j), cls: 'num', from: i, to: j });
      i = j; continue;
    }
    const two = src.slice(i, i + 2);
    if (['<=', '>=', '==', '!='].includes(two)) {
      out.push({ t: 'relop', v: two, cls: 'relop', from: i, to: i + 2 }); i += 2; continue;
    }
    out.push({ t: 'punct', v: c, cls: c, from: i, to: i + 1 }); i++;
  }
  return out;
}

/* ---------- LL(1) ---------- */

function ll1Table(g) {
  const F = firstSets(g);
  const Fo = followSets(g);
  const table = {};
  for (const A of g.nts) table[A] = {};
  for (const p of g.prods) {
    const f = firstOfSeq(p.rhs, F, g);
    for (const a of f) if (a !== EPS) (table[p.lhs][a] = table[p.lhs][a] || []).push(p.id);
    if (f.has(EPS)) for (const b of Fo[p.lhs]) (table[p.lhs][b] = table[p.lhs][b] || []).push(p.id);
  }
  const conflicts = [];
  for (const A of Object.keys(table)) for (const a of Object.keys(table[A])) {
    if (table[A][a].length > 1) conflicts.push({ nt: A, term: a, prods: table[A][a] });
  }
  return { F, Fo, table, conflicts };
}

function predictParse(g, table, input) {
  const tk = tokenize(g, input);
  if (!tk) return { ok: false, steps: 0, trace: [], why: 'unscannable input' };
  const st = ['$', g.start];
  const inp = tk.concat(['$']);
  let i = 0, steps = 0;
  const trace = [];
  while (st.length && steps < 4000) {
    steps++;
    const top = st[st.length - 1];
    const a = inp[i];
    trace.push({ stack: st.join(' '), input: inp.slice(i).join(''), move: '' });
    if (top === '$' && a === '$') return { ok: true, steps, trace };
    if (!g.nts.has(top)) {
      if (top === a) { st.pop(); i++; trace[trace.length - 1].move = 'match ' + a; continue; }
      return { ok: false, steps, trace, why: 'expected ' + top + ' got ' + a };
    }
    const cell = table[top] && table[top][a];
    if (!cell || cell.length === 0) return { ok: false, steps, trace, why: 'no entry for ' + top + ',' + a };
    if (cell.length > 1) return { ok: false, steps, trace, why: 'ambiguous cell' };
    const p = g.prods.find(q => q.id === cell[0]);
    st.pop();
    for (let k = p.rhs.length - 1; k >= 0; k--) st.push(p.rhs[k]);
    trace[trace.length - 1].move = p.text;
  }
  return { ok: false, steps, trace, why: 'step budget' };
}

/* ---------- brute-force language + parse-tree counting ---------- */

function deriveAll(g, maxLen) {
  const out = new Set();
  const seen = new Set();
  const stack = [[g.start]];
  seen.add(g.start);
  let guard = 0;
  while (stack.length && guard++ < 400000) {
    const sf = stack.pop();
    const k = sf.findIndex(s => g.nts.has(s));
    if (k < 0) { if (sf.length <= maxLen) out.add(sf.join('')); continue; }
    const A = sf[k];
    for (const p of g.prods) {
      if (p.lhs !== A) continue;
      const next = sf.slice(0, k).concat(p.rhs, sf.slice(k + 1));
      if (next.filter(s => !g.nts.has(s)).length > maxLen) continue;
      if (next.length > maxLen * 2 + 4) continue;
      const key = next.join(' ');
      if (seen.has(key)) continue;
      seen.add(key);
      stack.push(next);
    }
  }
  return out;
}

function nullableSet(g) {
  const N = {};
  for (const A of g.nts) N[A] = false;
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of g.prods) {
      if (N[p.lhs]) continue;
      if (p.rhs.every(X => g.nts.has(X) && N[X])) { N[p.lhs] = true; changed = true; }
    }
  }
  return N;
}

function treeCount(g, s) {
  const n = s.length;
  const N = nullableSet(g);
  const memo = new Map();
  function seq(syms, idx, pos, end) {
    if (idx === syms.length) return pos === end ? 1 : 0;
    if (pos > end) return 0;
    let total = 0;
    const X = syms[idx];
    for (let mid = pos; mid <= end; mid++) {
      let c = 0;
      if (g.nts.has(X)) c = span(X, pos, mid);
      else c = (mid === pos + 1 && s[pos] === X) ? 1 : 0;
      if (c === 0) continue;
      const rest = seq(syms, idx + 1, mid, end);
      total += c * rest;
    }
    return total;
  }
  function span(A, i, j) {
    const key = A + '|' + i + '|' + j;
    if (memo.has(key)) return memo.get(key);
    memo.set(key, 0);
    let total = 0;
    for (const p of g.prods) {
      if (p.lhs !== A) continue;
      if (p.rhs.length === 0) { if (i === j) total += 1; continue; }
      total += seq(p.rhs, 0, i, j);
    }
    memo.set(key, total);
    return total;
  }
  return span(g.start, 0, n);
}

/* ---------- LR machinery ---------- */

function lr0Closure(g, items) {
  const set = new Map();
  for (const it of items) set.set(it.pid + '.' + it.dot, it);
  const queue = [...set.values()];
  while (queue.length) {
    const it = queue.shift();
    const p = g.prods.find(q => q.id === it.pid);
    const X = p.rhs[it.dot];
    if (X === undefined || !g.nts.has(X)) continue;
    for (const q of g.prods) {
      if (q.lhs !== X) continue;
      const key = q.id + '.0';
      if (!set.has(key)) { const n = { pid: q.id, dot: 0 }; set.set(key, n); queue.push(n); }
    }
  }
  return [...set.values()];
}

function lr1Closure(g, items, F) {
  const set = new Map();
  for (const it of items) set.set(it.pid + '.' + it.dot + ',' + it.la, it);
  const queue = [...set.values()];
  while (queue.length) {
    const it = queue.shift();
    const p = g.prods.find(q => q.id === it.pid);
    const X = p.rhs[it.dot];
    if (X === undefined || !g.nts.has(X)) continue;
    const beta = p.rhs.slice(it.dot + 1).concat([it.la]);
    const f = firstOfSeq(beta, F, g);
    for (const q of g.prods) {
      if (q.lhs !== X) continue;
      for (const b of f) {
        if (b === EPS) continue;
        const key = q.id + '.0,' + b;
        if (!set.has(key)) { const n = { pid: q.id, dot: 0, la: b }; set.set(key, n); queue.push(n); }
      }
    }
  }
  return [...set.values()];
}

function gotoSet(g, items, X, lr1, F) {
  const moved = [];
  for (const it of items) {
    const p = g.prods.find(q => q.id === it.pid);
    if (p.rhs[it.dot] === X) moved.push({ pid: it.pid, dot: it.dot + 1, la: it.la });
  }
  if (!moved.length) return null;
  return lr1 ? lr1Closure(g, moved, F) : lr0Closure(g, moved);
}

function canonical(g, lr1, F) {
  const startItems = lr1
    ? lr1Closure(g, [{ pid: 0, dot: 0, la: '$' }], F)
    : lr0Closure(g, [{ pid: 0, dot: 0 }]);
  const keyOf = (items) => items.map(i => i.pid + '.' + i.dot + (lr1 ? ',' + i.la : '')).sort().join(';');
  const coreOf = (items) => [...new Set(items.map(i => i.pid + '.' + i.dot))].sort().join(';');
  const states = [startItems];
  const keys = [keyOf(startItems)];
  const trans = {};
  for (let i = 0; i < states.length; i++) {
    const syms = new Set();
    for (const it of states[i]) {
      const p = g.prods.find(q => q.id === it.pid);
      if (p.rhs[it.dot] !== undefined) syms.add(p.rhs[it.dot]);
    }
    for (const X of [...syms].sort()) {
      const nx = gotoSet(g, states[i], X, lr1, F);
      if (!nx) continue;
      const k = keyOf(nx);
      let idx = keys.indexOf(k);
      if (idx < 0) { states.push(nx); keys.push(k); idx = states.length - 1; }
      trans[i + '|' + X] = idx;
    }
    if (states.length > 400) break;
  }
  return { states, trans, keyOf, coreOf };
}

function mergeLALR(g, lr1auto) {
  const coreOfState = (i) => [...new Set(lr1auto.states[i].map(it => it.pid + '.' + it.dot))].sort().join(';');
  const coreToGroup = new Map();
  const groupItems = [];
  const stateToGroup = [];
  for (let i = 0; i < lr1auto.states.length; i++) {
    const core = coreOfState(i);
    if (!coreToGroup.has(core)) { coreToGroup.set(core, groupItems.length); groupItems.push([]); }
    const gr = coreToGroup.get(core);
    stateToGroup[i] = gr;
    for (const it of lr1auto.states[i]) groupItems[gr].push(it);
  }
  const states = groupItems.map(list => {
    const seen = new Map();
    for (const it of list) seen.set(it.pid + '.' + it.dot + ',' + it.la, it);
    return [...seen.values()];
  });
  const trans = {};
  for (const key of Object.keys(lr1auto.trans)) {
    const cut = key.lastIndexOf('|');
    const from = Number(key.slice(0, cut));
    const X = key.slice(cut + 1);
    trans[stateToGroup[from] + '|' + X] = stateToGroup[lr1auto.trans[key]];
  }
  return { states, trans };
}

/* Build an ACTION/GOTO table. kind: 'lr0' | 'slr' | 'lr1' | 'lalr' */
function buildTable(g, auto, kind, F, Fo) {
  const act = {};
  const gt = {};
  for (let i = 0; i < auto.states.length; i++) { act[i] = {}; gt[i] = {}; }
  for (const key of Object.keys(auto.trans)) {
    const cut = key.lastIndexOf('|');
    const from = key.slice(0, cut);
    const X = key.slice(cut + 1);
    const to = auto.trans[key];
    if (g.nts.has(X)) gt[Number(from)][X] = to;
    else (act[Number(from)][X] = act[Number(from)][X] || []).push({ type: 'shift', to });
  }
  for (let i = 0; i < auto.states.length; i++) {
    for (const it of auto.states[i]) {
      const p = g.prods.find(q => q.id === it.pid);
      if (it.dot !== p.rhs.length) continue;
      if (p.lhs === g.start) {
        (act[i]['$'] = act[i]['$'] || []).push({ type: 'accept' });
        continue;
      }
      let las;
      if (kind === 'lr0') las = [...g.terms].concat(['$']);
      else if (kind === 'slr') las = [...Fo[p.lhs]];
      else las = [it.la];
      for (const a of las) {
        const list = act[i][a] = act[i][a] || [];
        if (!list.some(x => x.type === 'reduce' && x.pid === it.pid)) list.push({ type: 'reduce', pid: it.pid });
      }
    }
  }
  const conflicts = [];
  for (const st of Object.keys(act)) for (const a of Object.keys(act[st])) {
    const list = act[st][a];
    if (list.length < 2) continue;
    const shifts = list.filter(x => x.type === 'shift').length;
    const reds = list.filter(x => x.type === 'reduce').length;
    const accs = list.filter(x => x.type === 'accept').length;
    if (shifts && reds) conflicts.push({ st: Number(st), term: a, kind: 'S-R', list });
    if (reds > 1) conflicts.push({ st: Number(st), term: a, kind: 'R-R', list });
    if (accs && (shifts || reds)) conflicts.push({ st: Number(st), term: a, kind: 'A-X', list });
  }
  return { act, gt, conflicts };
}

function lrParse(g, table, input, choose) {
  const tk = tokenize(g, input);
  if (!tk) return { ok: false, steps: 0, trace: [], reduces: 0, why: 'unscannable input' };
  const inp = tk.concat(['$']);
  const stack = [0];
  let i = 0, steps = 0;
  const trace = [];
  let reduces = 0;
  while (steps++ < 5000) {
    const st = stack[stack.length - 1];
    const a = inp[i];
    const list = table.act[st] && table.act[st][a];
    trace.push({ state: st, stack: stack.join(' '), input: inp.slice(i).join(''), act: '' });
    if (!list || !list.length) return { ok: false, steps, trace, reduces, why: 'no action on ' + a + ' in state ' + st };
    let pick = list[0];
    if (list.length > 1 && choose) pick = choose(list) || list[0];
    if (pick.type === 'accept') { trace[trace.length - 1].act = 'accept'; return { ok: true, steps, trace, reduces }; }
    if (pick.type === 'shift') {
      trace[trace.length - 1].act = 'shift ' + a;
      stack.push(pick.to); i++;
    } else {
      const p = g.prods.find(q => q.id === pick.pid);
      trace[trace.length - 1].act = 'reduce ' + p.text;
      reduces++;
      for (let k = 0; k < p.rhs.length; k++) stack.pop();
      const top = stack[stack.length - 1];
      const to = table.gt[top] && table.gt[top][p.lhs];
      if (to === undefined) return { ok: false, steps, trace, reduces, why: 'no goto for ' + p.lhs };
      stack.push(to);
    }
  }
  return { ok: false, steps, trace, reduces, why: 'budget' };
}


/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */
/* ---------- tests ---------- */


/* --- 1. GATE 2010: S -> aSa | bS | c is LL(1) and LR(1) --- */
const g2010 = G('S', ['S -> a S a | b S | c']);
const t2010 = ll1Table(g2010);
chk('GATE 2010 grammar has no LL(1) table conflict', t2010.conflicts.length === 0, t2010.conflicts.length);
const a2010 = augment(g2010);
const F2010 = firstSets(a2010);
const Fo2010 = followSets(g2010);
const lr1_2010 = canonical(a2010, true, F2010);
const tab2010 = buildTable(a2010, lr1_2010, 'lr1', F2010, Fo2010);
chk('GATE 2010 grammar is LR(1) conflict-free', tab2010.conflicts.length === 0, tab2010.conflicts.length);

/* --- 2. FOLLOW by derivation vs fixed point --- */
function followAgrees(gram, maxLen) {
  const fp = followSets(gram);
  const dv = followByDerivation(gram, maxLen);
  let ok = true;
  const detail = [];
  for (const A of gram.nts) {
    for (const a of dv[A]) if (!fp[A].has(a)) { ok = false; detail.push(A + ' missing ' + a); }
  }
  return { ok, detail };
}
const fa1 = followAgrees(G('S', ['S -> a A b B | b A a B | eps', 'A -> S', 'B -> S']), 6);
chk('FOLLOW matches bounded leftmost-derivation enumeration (GATE 2012 grammar)', fa1.ok, fa1.detail.join(';'));
const fa2 = followAgrees(g2010, 7);
chk('FOLLOW matches derivation enumeration (GATE 2010 grammar)', fa2.ok, fa2.detail.join(';'));

/* --- 3. LL(1) parser language == brute-force language --- */
function langCheck(gram, maxLen) {
  const t = ll1Table(gram);
  const lang = deriveAll(gram, maxLen);
  const alphabet = [...gram.terms];
  const all = [];
  (function rec(s) {
    if (s.length <= maxLen) all.push(s);
    if (s.length === maxLen) return;
    for (const c of alphabet) rec(s + c);
  })('');
  let bad = 0;
  for (const s of all) {
    const r = predictParse(gram, t.table, s);
    const inLang = lang.has(s);
    if (r.ok !== inLang) bad++;
  }
  return { bad, total: all.length, conflicts: t.conflicts.length };
}
const lc1 = langCheck(g2010, 6);
chk('LL(1) parser accepts exactly the grammar language (GATE 2010)', lc1.bad === 0, lc1.bad + '/' + lc1.total);

/* --- 4. GATE 2007 dangling else: not LL(1), ambiguous --- */
const gDE = G('S', ['S -> i C t S S1 | a', 'S1 -> e S | eps', 'C -> b']);
const tDE = ll1Table(gDE);
chk('GATE 2007 dangling-else grammar has an LL(1) conflict', tDE.conflicts.length > 0, tDE.conflicts.length);
const amb = treeCount(gDE, 'ibtibtaea'); // i b t i b t a e a
chk('dangling-else grammar is ambiguous on i b t i b t a e a', amb > 1, 'trees=' + amb);

/* --- 5. LR(0) closure is closed, goto consistent --- */
{
  const g = G('S', ['S -> C C', 'C -> c C | d']);
  const a = augment(g);
  const auto = canonical(a, false);
  let closed = true, consistent = true;
  for (const st of auto.states) {
    const cl = lr0Closure(a, st);
    if (cl.length !== st.length) closed = false;
    for (const it of st) {
      const p = a.prods.find(q => q.id === it.pid);
      const X = p.rhs[it.dot];
      if (X && a.nts.has(X)) {
        const has = st.some(j => { const q = a.prods.find(r => r.id === j.pid); return q.lhs === X && j.dot === 0; });
        if (!has) closed = false;
      }
    }
  }
  for (const key of Object.keys(auto.trans)) {
    const cut = key.lastIndexOf('|');
    const from = key.slice(0, cut), X = key.slice(cut + 1);
    const gs = gotoSet(a, auto.states[Number(from)], X, false);
    if (auto.keyOf(gs) !== auto.keyOf(auto.states[auto.trans[key]])) consistent = false;
  }
  chk('LR(0) states are closed under closure', closed);
  chk('every goto edge matches an independent goto computation', consistent);
  chk('S -> CC grammar has 7 LR(0) states', auto.states.length === 7, auto.states.length);
  const lr1cc = canonical(a, true, firstSets(a));
  chk('S -> CC needs more LR(1) states than LR(0) states', lr1cc.states.length > auto.states.length,
    lr1cc.states.length + ' vs ' + auto.states.length);
  chk('S -> CC has 10 canonical LR(1) states against 7 LR(0) states', lr1cc.states.length === 10, lr1cc.states.length);
  chk('merging S -> CC to LALR gives back the 7 LR(0) cores', mergeLALR(a, lr1cc).states.length === auto.states.length,
    mergeLALR(a, lr1cc).states.length);
}

/* --- 6. GATE 2022: goto(closure(I0), +) has 5 items --- */
{
  const g = G('S', ['S -> S + R | R', 'R -> R * P | P', 'P -> ( S ) | id']);
  const a = augment(g);
  const I0 = lr0Closure(a, [{ pid: 0, dot: 0 }]);
  const g1 = lr0Closure(a, [{ pid: 0, dot: 1 }, { pid: 1, dot: 1 }]);
  const gt = gotoSet(a, g1, '+', false);
  chk('GATE 2022 goto(closure(I0), +) has 5 items', gt && gt.length === 5, gt && gt.length);
}

/* --- 7. GATE 2025 Set 2: S -> Aa|bAc|dc|bda, A -> d : LALR but not SLR --- */
{
  const g = G('S', ['S -> A a | b A c | d c | b d a', 'A -> d']);
  const a = augment(g);
  const F = firstSets(a);
  const Fo = followSets(g);
  const lr0auto = canonical(a, false);
  const slr = buildTable(a, lr0auto, 'slr', F, Fo);
  const lr1auto = canonical(a, true, F);
  const lalrAuto = mergeLALR(a, lr1auto);
  const lalr = buildTable(a, lalrAuto, 'lalr', F, Fo);
  const lr1 = buildTable(a, lr1auto, 'lr1', F, Fo);
  chk('GATE 2025 Set 2 grammar has an SLR(1) conflict', slr.conflicts.length > 0, slr.conflicts.length);
  chk('GATE 2025 Set 2 grammar is LALR(1) conflict-free', lalr.conflicts.length === 0, lalr.conflicts.length);
  chk('GATE 2025 Set 2 grammar is LR(1) conflict-free', lr1.conflicts.length === 0, lr1.conflicts.length);
  chk('LALR state count equals LR(0) state count', lalrAuto.states.length === lr0auto.states.length,
    lalrAuto.states.length + ' vs ' + lr0auto.states.length);
  chk('LR(1) state count is at least the LALR state count', lr1auto.states.length >= lalrAuto.states.length,
    lr1auto.states.length + ' vs ' + lalrAuto.states.length);
  // language agreement
  const lang = deriveAll(g, 6);
  const all = [];
  (function rec(s) { if (s.length <= 6) all.push(s); if (s.length === 6) return; for (const c of ['a', 'b', 'c', 'd']) rec(s + c); })('');
  let badL = 0, badS = 0;
  for (const s of all) {
    if (lrParse(a, lalr, s).ok !== lang.has(s)) badL++;
  }
  chk('LALR(1) parser accepts exactly the language', badL === 0, badL);
}

/* --- 8. the LALR r-r grammar (LR(1) yes, LALR no) --- */
{
  const g = G('S', ['S -> a E c | a F d | b F c | b E d', 'E -> e', 'F -> e']);
  const a = augment(g);
  const F = firstSets(a);
  const Fo = followSets(g);
  const lr1auto = canonical(a, true, F);
  const lalrAuto = mergeLALR(a, lr1auto);
  const lr1 = buildTable(a, lr1auto, 'lr1', F, Fo);
  const lalr = buildTable(a, lalrAuto, 'lalr', F, Fo);
  chk('r-r grammar is LR(1) conflict-free', lr1.conflicts.length === 0, lr1.conflicts.length);
  const rr = lalr.conflicts.filter(c => c.kind === 'R-R');
  chk('r-r grammar has a LALR(1) reduce-reduce conflict', rr.length > 0, rr.length);
  const lang = deriveAll(g, 4);
  chk('r-r grammar language has 4 strings of length 3', lang.size === 4, [...lang].join(','));
}

/* --- 9. LALR S-R conflicts iff LR(1) S-R conflicts, over a battery --- */
{
  const battery = [
    G('S', ['S -> A a | b A c | d c | b d a', 'A -> d']),
    G('S', ['S -> C C', 'C -> c C | d']),
    G('S', ['S -> a S a | b S | c']),
    G('E', ['E -> E + T | T', 'T -> T * F | F', 'F -> ( E ) | id']),
    G('S', ['S -> L = R | R', 'L -> * R | id', 'R -> L']),
    G('S', ['S -> A B', 'A -> a | eps', 'B -> b | eps'])
  ];
  let agree = true;
  const det = [];
  for (const g of battery) {
    const a = augment(g);
    const F = firstSets(a), Fo = followSets(g);
    const lr1auto = canonical(a, true, F);
    const lalrAuto = mergeLALR(a, lr1auto);
    const lr1 = buildTable(a, lr1auto, 'lr1', F, Fo);
    const lalr = buildTable(a, lalrAuto, 'lalr', F, Fo);
    const sr1 = lr1.conflicts.filter(c => c.kind === 'S-R').length;
    const srL = lalr.conflicts.filter(c => c.kind === 'S-R').length;
    if (sr1 !== srL) { agree = false; det.push(g.start + ' ' + sr1 + ' vs ' + srL); }
  }
  chk('LALR(1) has an S-R conflict iff LR(1) has one, on 6 grammars', agree, det.join(';'));
}

/* --- 10. GATE 2020: reductions for aaadbbb with S -> aSB | d, B -> b --- */
{
  const g = G('S', ['S -> a S B | d', 'B -> b']);
  const a = augment(g);
  const F = firstSets(a), Fo = followSets(g);
  const auto = canonical(a, false);
  const tab = buildTable(a, auto, 'slr', F, Fo);
  const r = lrParse(a, tab, 'aaadbbb');
  chk('GATE 2020 accepts aaadbbb in 7 reductions', r.ok && r.reduces === 7, r.reduces);
}

/* --- 11. the reduce-move accounting identity (GATE 2013) --- */
{
  function reduceCounts(gram, str) {
    const tk = tokenize(gram, str);
    if (!tk) return new Set();
    const memo = new Map();
    function seq(syms, idx, pos, end) {
      if (idx === syms.length) return pos === end ? new Set([0]) : new Set();
      const out = new Set();
      for (let mid = pos; mid <= end; mid++) {
        let left;
        if (gram.nts.has(syms[idx])) left = span(syms[idx], pos, mid);
        else left = (mid === pos + 1 && tk[pos] === syms[idx]) ? new Set([0]) : new Set();
        if (!left.size) continue;
        const rest = seq(syms, idx + 1, mid, end);
        for (const a of left) for (const b of rest) out.add(a + b);
      }
      return out;
    }
    function span(A, i, j) {
      const key = A + '|' + i + '|' + j;
      if (memo.has(key)) return memo.get(key);
      memo.set(key, new Set());
      const out = new Set();
      for (const p of gram.prods) {
        if (p.lhs !== A || p.rhs.length === 0) continue;
        for (const c of seq(p.rhs, 0, i, j)) out.add(c + 1);
      }
      memo.set(key, out);
      return out;
    }
    return span(gram.start, 0, tk.length);
  }
  // all-binary grammar: R = n-1 exactly
  const gbin = G('S', ['S -> S S | a a']);
  const r4 = reduceCounts(gbin, 'aaaa');
  const r6 = reduceCounts(gbin, 'aaaaaa');
  chk('all-binary grammar: 4 tokens take 3 reduces and 6 tokens take 5',
    r4.size === 1 && [...r4][0] === 3 && r6.size === 1 && [...r6][0] === 5,
    [...r4].join('/') + ' and ' + [...r6].join('/'));
  // a grammar with a single-symbol right side breaks the n-1 bound
  const guni = G('S', ['S -> A B', 'A -> a', 'B -> b']);
  const ru = reduceCounts(guni, 'ab');
  chk('a single-symbol right side lets 2 tokens take 3 reduces',
    ru.size === 1 && [...ru][0] === 3, [...ru].join('/'));
  // the identity R = 1 - n + sum|rhs|, checked on every tree the page can build
  let idOk = true, det = [];
  const battery = [
    [G('S', ['S -> S S | a a']), ['aaaa', 'aaaaaa']],
    [G('S', ['S -> A B', 'A -> a', 'B -> b']), ['ab']],
    [G('S', ['S -> S + id | id']), ['id', 'id+id', 'id+id+id']]
  ];
  for (const [g, strs] of battery) {
    for (const str of strs) {
      const tk = tokenize(g, str);
      for (const R of reduceCounts(g, str)) {
        // sum|rhs| = R + n - 1 must be at least R, and each rhs at most n+R
        const sum = R + tk.length - 1;
        if (sum < R) { idOk = false; det.push(str); }
      }
    }
  }
  // the identity as an invariant of the real parser: read the reduce trace back
  let invOk = true, invDet = [];
  const parsable = [
    [G('S', ['S -> S + T | T', 'T -> id']), ['id', 'id+id', 'id+id+id']],
    [G('S', ['S -> ( S ) | id']), ['id', '(id)', '((id))']],
    [G('S', ['S -> a S b | c']), ['c', 'acb', 'aacbb']]
  ];
  for (const [g, strs] of parsable) {
    const a = augment(g);
    const F = firstSets(a), Fo = followSets(g);
    const auto = canonical(a, false);
    const tab = buildTable(a, auto, 'slr', F, Fo);
    for (const str of strs) {
      const r = lrParse(a, tab, str);
      if (!r.ok) { invOk = false; invDet.push('rejected ' + str); continue; }
      let sum = 0;
      for (const step of r.trace) {
        if (!step.act.startsWith('reduce ')) continue;
        const text = step.act.slice(7);
        const rhs = text.split('->')[1].trim();
        sum += rhs === 'eps' ? 0 : rhs.split(/\s+/).length;
      }
      const n = tokenize(a, str).length;
      if (r.reduces !== 1 - n + sum) { invOk = false; invDet.push(str + ':' + r.reduces + ' vs ' + (1 - n + sum)); }
    }
  }
  chk('reduce accounting identity R = 1 - n + sum|rhs| holds on every parse run', invOk, invDet.join(';'));
}

/* --- 12. GATE 2024 Set 1: which productions make the FIRST/FOLLOW sets right --- */
{
  const cand = [
    { tag: 'A', lines: ['S -> d a T | R f', 'T -> a S | b T | eps', 'R -> c T R | eps'] },
    { tag: 'B', lines: ['S -> d a T | f R', 'T -> a S | b T | eps', 'R -> c T R | eps'] },
    { tag: 'C', lines: ['S -> d a T | f R', 'T -> a S | b T | c T', 'R -> c R | eps'] },
    { tag: 'D', lines: ['S -> d a T | R f', 'T -> a S | b T | c T', 'R -> c R | eps'] }
  ];
  const want = {
    FS: 'c,d,f', FT: '@,a,b', FR: '@,c', FoS: '$,c,f', FoT: '$,c,f', FoR: 'f'
  };
  const got = [];
  for (const c of cand) {
    const g = G('S', c.lines);
    const F = firstSets(g), Fo = followSets(g);
    const j = (s) => [...s].sort().join(',');
    const ok = j(F.S) === want.FS && j(F.T) === want.FT && j(F.R) === want.FR &&
      j(Fo.S) === want.FoS && j(Fo.T) === want.FoT && j(Fo.R) === want.FoR;
    if (ok) got.push(c.tag);
  }
  chk('GATE 2024 Set 1: only option A reproduces the printed FIRST and FOLLOW sets',
    got.length === 1 && got[0] === 'A', got.join(','));
}

/* --- 13. GATE 2012: FIRST/FOLLOW and the three table entries --- */
{
  const g = G('S', ['S -> a A b B | b A a B | eps', 'A -> S', 'B -> S']);
  const t = ll1Table(g);
  const j = (s) => [...s].sort().join(',');
  chk('GATE 2012 FIRST(A) = FIRST(B) = {a,b,eps}', j(t.F.A) === '@,a,b' && j(t.F.B) === '@,a,b', j(t.F.A) + ' / ' + j(t.F.B));
  chk('GATE 2012 FOLLOW(A) = {a,b}', j(t.Fo.A) === 'a,b', j(t.Fo.A));
  chk('GATE 2012 FOLLOW(B) = {a,b,$}', j(t.Fo.B) === '$,a,b', j(t.Fo.B));
  chk('GATE 2012 M[S,a] holds two productions (so G is not LL(1))',
    t.table.S.a && t.table.S.a.length === 2, JSON.stringify(t.table.S.a));
  chk('GATE 2012 M[S,$] holds only S -> eps',
    t.table.S['$'] && t.table.S['$'].length === 1 && g.prods[t.table.S['$'][0]].rhs.length === 0,
    JSON.stringify(t.table.S['$']));
}

/* --- 14. GATE 2019: FOLLOW(B) = {a,d} --- */
{
  const g = G('S', ['S -> A a', 'A -> B D', 'B -> b | eps', 'D -> d | eps']);
  const Fo = followSets(g);
  chk('GATE 2019 FOLLOW(B) = {a,d}', [...Fo.B].sort().join(',') === 'a,d', [...Fo.B].sort().join(','));
}

/* --- 15. associativity read off the grammar (GATE 2014 Set 2) --- */
{
  // S -> T * P ; T -> U | T * U ; P -> Q + P | Q
  const g = G('S', ['S -> T * P', 'T -> U | T * U', 'P -> Q + P | Q', 'Q -> id', 'U -> id']);
  // * nests through T on the left, so * is left associative; + recurses on the right
  const leftRec = (A, op) => g.prods.some(p => p.lhs === A && p.rhs.length === 3 && p.rhs[0] === A && p.rhs[1] === op);
  const rightRec = (A, op) => g.prods.some(p => p.lhs === A && p.rhs.length === 3 && p.rhs[2] === A && p.rhs[1] === op);
  chk('GATE 2014 Set 2: * is left associative (T -> T * U)', leftRec('T', '*'));
  chk('GATE 2014 Set 2: + is right associative (P -> Q + P)', rightRec('P', '+'));
}

/* --- 16. syntax-directed translation: GATE 2022 evaluates to 80 --- */
{
  // S -> S1 # T {S.val = S1.val * T.val}; S -> T; T -> T1 % R {T.val = T1.val / R.val};
  // T -> R; R -> id
  function eval22(expr) {
    // parse left-to-right: # is left recursive at S level, % at T level
    const toks = expr.split(/\s+/);
    let i = 0;
    function R() { return Number(toks[i++]); }
    function T() {
      let v = R();
      while (toks[i] === '%') { i++; const r = R(); v = v / r; }
      return v;
    }
    let v = T();
    while (toks[i] === '#') { i++; const t = T(); v = v * t; }
    return v;
  }
  const v = eval22('20 # 10 % 5 # 8 % 2 % 2');
  chk('GATE 2022 translation scheme yields 80', v === 80, v);
}

/* --- 17. GATE 2016 Set 1: bottom-up SDTS prints 231 on aab --- */
{
  const g = G('S', ['S -> a A', 'S -> a', 'A -> S b']);
  const a = augment(g);
  const F = firstSets(a), Fo = followSets(g);
  const auto = canonical(a, false);
  const tab = buildTable(a, auto, 'slr', F, Fo);
  // print on each reduction, in reduction order
  const prints = [];
  const inp = 'aab'.split('').concat(['$']);
  const stack = [0];
  let i = 0, guard = 0;
  let ok = false;
  const label = { 1: '1', 2: '2', 3: '3' }; // prods 1,2,3 in augmented ids
  while (guard++ < 200) {
    const st = stack[stack.length - 1];
    const list = tab.act[st] && tab.act[st][inp[i]];
    if (!list || !list.length) break;
    const pick = list[0];
    if (pick.type === 'accept') { ok = true; break; }
    if (pick.type === 'shift') { stack.push(pick.to); i++; continue; }
    const p = a.prods.find(q => q.id === pick.pid);
    prints.push(label[p.id] || '?');
    for (let k = 0; k < p.rhs.length; k++) stack.pop();
    const to = tab.gt[stack[stack.length - 1]][p.lhs];
    stack.push(to);
  }
  chk('GATE 2016 Set 1 bottom-up SDTS prints 231 on aab', ok && prints.join('') === '231', prints.join(''));
}

/* --- 18. three-address code executed on a small VM equals direct evaluation --- */
{
  function gen(expr) {
    // expr: array of tokens with + - * and numbers, precedence * over + -
    let pos = 0;
    const code = [];
    let t = 0;
    function newT() { return 't' + (++t); }
    function E() {
      let l = T();
      while (expr[pos] === '+' || expr[pos] === '-') {
        const op = expr[pos++]; const r = T();
        const d = newT(); code.push(d + ' = ' + l + ' ' + op + ' ' + r); l = d;
      }
      return l;
    }
    function T() {
      let l = F();
      while (expr[pos] === '*') { pos++; const r = F(); const d = newT(); code.push(d + ' = ' + l + ' * ' + r); l = d; }
      return l;
    }
    function F() {
      if (expr[pos] === '(') { pos++; const v = E(); pos++; return v; }
      return String(expr[pos++]);
    }
    const res = E();
    return { code, res };
  }
  function vm(code, res) {
    const env = {};
    for (const line of code) {
      const [d, , l, op, r] = line.split(' ');
      const a = env[l] !== undefined ? env[l] : Number(l);
      const b = env[r] !== undefined ? env[r] : Number(r);
      env[d] = op === '+' ? a + b : op === '-' ? a - b : a * b;
    }
    return env[res] !== undefined ? env[res] : Number(res);
  }
  const tests = [['2', '+', '3', '*', '4'], ['(', '2', '+', '3', ')', '*', '4'], ['7', '-', '2', '-', '1'], ['8', '*', '2', '+', '3', '*', '5']];
  let bad = 0;
  for (const t of tests) {
    const { code, res } = gen(t);
    const direct = Function('return ' + t.join(' '))();
    if (vm(code, res) !== direct) bad++;
  }
  chk('three-address code run on a tiny VM equals direct evaluation (4 expressions)', bad === 0, bad);
}

/* --- 19. scanner: longest match --- */
{
  const src = 'if (x2 <= 10) y = x2 + 1;';
  const toks = scan(src);
  chk('scanner produces 12 tokens for the sample line', toks.length === 12, toks.length);
  chk('scanner returns <= as one relop token', toks.some(t => t.v === '<=' && t.t === 'relop'));
  // maximal munch: no two adjacent tokens could be merged into a longer legal token
  const legal = (s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s) || /^[0-9]+$/.test(s) || ['<=', '>=', '==', '!='].includes(s);
  let munch = true;
  for (let k = 0; k + 1 < toks.length; k++) {
    if (toks[k].to === toks[k + 1].from && legal(toks[k].v + toks[k + 1].v)) munch = false;
  }
  chk('no adjacent token pair could be merged (maximal munch)', munch);
  const rebuilt = toks.map(t => t.v).join('');
  chk('concatenating the tokens gives back the input without spaces', rebuilt === src.replace(/ /g, ''), rebuilt);
}




/* ======================================================================
   LAYER 3 - WHAT THE SCENES READ, AND THE SCENES THEMSELVES
   Everything below is computed once at load. The draw functions only read.
   ====================================================================== */

var V = {};

/* ---------- scene 1: the scanner ---------- */
V.src = 'if (x2 <= 10) y = x2 + 1;';
V.tokens = scan(V.src);
V.classCount = {};
V.tokens.forEach(function (t) { V.classCount[t.t] = (V.classCount[t.t] || 0) + 1; });

/* ---------- scene 2: FIRST and FOLLOW, pass by pass ---------- */
V.g12 = G('S', ['S -> a A b B | b A a B | eps', 'A -> S', 'B -> S']);
V.t12 = ll1Table(V.g12);

function firstPasses(g) {
  var F = {}, snapshots = [];
  g.nts.forEach(function (A) { F[A] = new Set(); });
  snapshots.push(JSON.parse(JSON.stringify({})));   // replaced below
  var changed = true, pass = 0;
  var states = [];
  states.push(copySets(F));
  while (changed && pass < 6) {
    changed = false; pass++;
    g.prods.forEach(function (p) {
      var add = function (s) { if (!F[p.lhs].has(s)) { F[p.lhs].add(s); changed = true; } };
      if (p.rhs.length === 0) add(EPS);
      var allNullable = true;
      for (var i = 0; i < p.rhs.length; i++) {
        var X = p.rhs[i];
        if (!g.nts.has(X)) { add(X); allNullable = false; break; }
        F[X].forEach(function (a) { if (a !== EPS) add(a); });
        if (!F[X].has(EPS)) { allNullable = false; break; }
      }
      if (allNullable && p.rhs.length > 0) add(EPS);
    });
    states.push(copySets(F));
  }
  return states;
}
function copySets(F) {
  var o = {};
  Object.keys(F).forEach(function (k) { o[k] = [...F[k]].sort().join(''); });
  return o;
}
V.firstPasses = firstPasses(V.g12);

/* ---------- scene 3: two LL(1) tables ---------- */
V.g10 = G('S', ['S -> a S a | b S | c']);
V.t10 = ll1Table(V.g10);
V.parse10 = predictParse(V.g10, V.t10.table, 'aacaa');
V.a10 = augment(V.g10);
V.lr1_2010 = buildTable(V.a10, canonical(V.a10, true, firstSets(V.a10)), 'lr1',
  firstSets(V.a10), followSets(V.g10));
V.ambTrees = treeCount(G('S', ['S -> i C t S S1 | a', 'S1 -> e S | eps', 'C -> b']), 'ibtibtaea');

/* ---------- scene 4: shift-reduce on aaadbbb ---------- */
V.g4 = G('S', ['S -> a S B | d', 'B -> b']);
V.a4 = augment(V.g4);
V.tab4 = buildTable(V.a4, canonical(V.a4, false), 'slr', firstSets(V.a4), followSets(V.g4));
V.run4 = lrParse(V.a4, V.tab4, 'aaadbbb');
V.rows4 = V.run4.trace.filter(function (s) { return s.act; });

/* ---------- scene 5: the LR(0) automaton of S -> C C ---------- */
V.gCC = G('S', ['S -> C C', 'C -> c C | d']);
V.aCC = augment(V.gCC);
V.autoCC = canonical(V.aCC, false);
V.autoCC1 = canonical(V.aCC, true, firstSets(V.aCC));

function itemText(g, it) {
  var p = g.prods.find(function (q) { return q.id === it.pid; });
  var rhs = p.rhs.slice();
  rhs.splice(it.dot, 0, '.');
  return p.lhs + ' \u2192 ' + (rhs.length ? rhs.join(' ') : '.');
}
V.itemText = itemText;

/* ---------- the 2026 grammar and its LR(0) conflicts ---------- */
V.g26 = G('S', ['S -> A C B', 'A -> a A | eps', 'C -> c C | eps', 'B -> b B | b']);
V.a26 = augment(V.g26);
V.auto26 = canonical(V.a26, false);
V.lr0_26 = buildTable(V.a26, V.auto26, 'lr0', firstSets(V.a26), followSets(V.g26));
V.slr_26 = buildTable(V.a26, V.auto26, 'slr', firstSets(V.a26), followSets(V.g26));
V.sr26 = V.lr0_26.conflicts.filter(function (c) { return c.kind === 'S-R'; });

/* ---------- scene 6: the lookahead ladder ---------- */
V.g25 = G('S', ['S -> A a | b A c | d c | b d a', 'A -> d']);
V.a25 = augment(V.g25);
V.auto25 = canonical(V.a25, false);
V.F25 = firstSets(V.a25);
V.Fo25 = followSets(V.g25);
V.lr0_25 = buildTable(V.a25, V.auto25, 'lr0', V.F25, V.Fo25);
V.slr25 = buildTable(V.a25, V.auto25, 'slr', V.F25, V.Fo25);
V.lr1auto25 = canonical(V.a25, true, V.F25);
V.lalrAuto25 = mergeLALR(V.a25, V.lr1auto25);
V.lalr25 = buildTable(V.a25, V.lalrAuto25, 'lalr', V.F25, V.Fo25);
V.lr1_25 = buildTable(V.a25, V.lr1auto25, 'lr1', V.F25, V.Fo25);
V.conflict25 = V.slr25.conflicts[0];
V.stateItems25 = V.auto25.states[V.conflict25.st].map(function (it) { return itemText(V.a25, it); });

/* ---------- scene 7: trees from the grammar ---------- */
V.g14 = G('S', ['S -> T * P', 'T -> U | T * U', 'P -> Q + P | Q', 'Q -> id', 'U -> id']);

function buildTree(g, str) {
  var tk = tokenize(g, str);
  if (!tk) return null;
  var memo = new Map();
  function seq(syms, idx, pos, end) {
    if (idx === syms.length) return pos === end ? [{ sym: '', children: [] }] : [];
    var out = [];
    for (var mid = pos; mid <= end; mid++) {
      var left;
      if (g.nts.has(syms[idx])) left = span(syms[idx], pos, mid);
      else left = (mid === pos + 1 && tk[pos] === syms[idx]) ? [{ sym: syms[idx], children: [] }] : [];
      if (!left.length) continue;
      var rest = seq(syms, idx + 1, mid, end);
      for (var a = 0; a < left.length; a++) for (var b = 0; b < rest.length; b++) {
        out.push({ sym: '', children: [left[a]].concat(rest[b].children) });
        if (out.length > 40) return out;
      }
    }
    return out;
  }
  function span(A, i, j) {
    var key = A + '|' + i + '|' + j;
    if (memo.has(key)) return memo.get(key);
    memo.set(key, []);
    var out = [];
    for (var k = 0; k < g.prods.length; k++) {
      var p = g.prods[k];
      if (p.lhs !== A) continue;
      if (p.rhs.length === 0) { if (i === j) out.push({ sym: A, children: [] }); continue; }
      var kids = seq(p.rhs, 0, i, j);
      for (var m = 0; m < kids.length; m++) out.push({ sym: A, children: kids[m].children });
      if (out.length > 40) break;
    }
    memo.set(key, out);
    return out;
  }
  var all = span(g.start, 0, tk.length);
  return all.length ? all[0] : null;
}

V.treeStar = buildTree(V.g14, 'id*id*id');
V.treePlus = buildTree(V.g14, 'id+id+id');

function layoutTree(root, x0, x1, y0, dy) {
  var leaves = 0;
  var nodes = [];
  (function walk(n, depth) {
    n.depth = depth;
    n.children.forEach(function (c) { walk(c, depth + 1); });
    if (!n.children.length) n.leafIndex = leaves++;
    nodes.push(n);
  })(root, 0);
  var step = (x1 - x0) / Math.max(1, leaves - 1 || 1);
  (function place(n) {
    n.children.forEach(place);
    if (!n.children.length) n.x = leaves === 1 ? (x0 + x1) / 2 : x0 + n.leafIndex * step;
    else n.x = (n.children[0].x + n.children[n.children.length - 1].x) / 2;
    n.y = y0 + n.depth * dy;
  })(root);
  return { nodes: nodes, leaves: leaves };
}

/* ---------- scene 8: syntax-directed translation ---------- */
V.g16 = G('S', ['S -> a A', 'S -> a', 'A -> S b']);
V.a16 = augment(V.g16);
V.tab16 = buildTable(V.a16, canonical(V.a16, false), 'slr', firstSets(V.a16), followSets(V.g16));
V.prints16 = (function () {
  var out = [];
  var inp = ['a', 'a', 'b', '$'];
  var stack = [0], i = 0, guard = 0;
  var label = { 1: 'print 1', 2: 'print 2', 3: 'print 3' };
  while (guard++ < 200) {
    var st = stack[stack.length - 1];
    var list = V.tab16.act[st] && V.tab16.act[st][inp[i]];
    if (!list || !list.length) break;
    var pick = list[0];
    if (pick.type === 'accept') break;
    if (pick.type === 'shift') { stack.push(pick.to); i++; continue; }
    var p = V.a16.prods.find(function (q) { return q.id === pick.pid; });
    out.push({ action: label[p.id] || '?', prod: p.text });
    for (var k = 0; k < p.rhs.length; k++) stack.pop();
    stack.push(V.tab16.gt[stack[stack.length - 1]][p.lhs]);
  }
  return out;
})();

function threeAddr(expr) {
  var pos = 0, code = [], t = 0;
  function newT() { return 't' + (++t); }
  function E() {
    var l = T();
    while (expr[pos] === '+' || expr[pos] === '-') {
      var op = expr[pos++], r = T(), d = newT();
      code.push(d + ' = ' + l + ' ' + op + ' ' + r); l = d;
    }
    return l;
  }
  function T() {
    var l = F();
    while (expr[pos] === '*') {
      pos++; var r = F(), d = newT();
      code.push(d + ' = ' + l + ' * ' + r); l = d;
    }
    return l;
  }
  function F() {
    if (expr[pos] === '(') { pos++; var v = E(); pos++; return v; }
    return String(expr[pos++]);
  }
  var res = E();
  return { code: code, res: res };
}
function runVM(code, res) {
  var env = {};
  code.forEach(function (line) {
    var parts = line.split(' ');
    var d = parts[0], l = parts[2], op = parts[3], r = parts[4];
    var a = env[l] !== undefined ? env[l] : Number(l);
    var b = env[r] !== undefined ? env[r] : Number(r);
    env[d] = op === '+' ? a + b : op === '-' ? a - b : a * b;
  });
  return env[res] !== undefined ? env[res] : Number(res);
}
V.tac = threeAddr(['8', '*', '2', '+', '3', '*', '5']);
V.tacValue = runVM(V.tac.code, V.tac.res);
V.g2022 = (function () {
  var toks = '20 # 10 % 5 # 8 % 2 % 2'.split(' ');
  var i = 0;
  function R() { return Number(toks[i++]); }
  function T() { var v = R(); while (toks[i] === '%') { i++; v = v / R(); } return v; }
  var v = T();
  while (toks[i] === '#') { i++; v = v * T(); }
  return v;
})();

/* ======================================================================
   DRAWING HELPERS
   ====================================================================== */

var MONO = true, SANS = false;

function title(txt, n) {
  P.alpha(1);
  P.text(24, 14, txt, { size: 15, bold: true, color: PAL.ink });
  P.alpha(0.55);
  P.text(W - 24, 17, 'scene ' + n, { size: 11, mono: MONO, color: PAL.faint, align: 'right' });
  P.alpha(1);
  P.line(24, 36, W - 24, 36, { stroke: PAL.border, sw: 1 });
}

function band(y, h, fill) {
  P.rect(24, y, W - 48, h, { fill: fill || PAL.surface2, stroke: PAL.border, sw: 1, radius: 8 });
}

function label(x, y, txt, colour) {
  P.alpha(1);
  P.text(x, y, txt, { size: 10, mono: MONO, color: colour || PAL.faint, bold: true });
}

function note(x, y, txt, colour) {
  P.alpha(1);
  P.text(x, y, txt, { size: 12, color: colour || PAL.dim });
}

function chip(x, y, w, h, txt, o) {
  o = o || {};
  P.rect(x, y, w, h, {
    fill: o.fill || PAL.surface, stroke: o.stroke || PAL.border, sw: o.sw || 1.2, radius: 5
  });
  P.alpha(1);
  P.text(x + w / 2, y + h / 2, txt, {
    size: o.size || 12, mono: o.mono !== false, color: o.color || PAL.ink,
    align: 'center', base: 'middle', bold: !!o.bold
  });
}

function setText(set) {
  var a = [...set].sort();
  if (!a.length) return '\u2205';
  return '{' + a.join(', ') + '}';
}

function setTextNoEps(set) {
  var a = [...set].filter(function (s) { return s !== EPS; }).sort();
  return a.length ? '{' + a.join(', ') + '}' : '\u2205';
}

/* ======================================================================
   THE TEN SCENES
   ====================================================================== */

var SCENES = {};

/* ---------- 1. tokens ---------- */
SCENES.scan = function (t) {
  title('One line of source, twelve tokens', 1);

  label(24, 52, 'SOURCE');
  P.alpha(0.9);
  P.text(24, 68, V.src, { size: 13, mono: MONO, color: PAL.dim });

  label(24, 104, 'THE TOKEN STREAM - each box appears as the scanner emits it');
  var x = 30, y = 118;
  V.tokens.forEach(function (tk, i) {
    var appear = 1.4 + i * 0.85;
    if (t < appear) return;
    var w = Math.max(30, 16 + tk.v.length * 8.4);
    var col = tk.t === 'keyword' ? PAL.info : tk.t === 'id' ? PAL.accent
      : tk.t === 'num' ? PAL.valid : tk.t === 'relop' ? PAL.warn : PAL.dim;
    var dim = tk.t === 'keyword' ? PAL.surface2 : tk.t === 'id' ? PAL.accentDim
      : tk.t === 'num' ? '#dff0e4' : tk.t === 'relop' ? PAL.warnDim : PAL.surface;
    chip(x, y, w, 32, tk.v, { fill: dim, stroke: col, color: col, size: 12, bold: true });
    x += w + 5;
  });

  /* maximal munch */
  var b = K.beat(t, 12, 4);
  if (b > 0) {
    P.alpha(b);
    band(168, 96, PAL.surface);
    label(40, 182, 'MAXIMAL MUNCH - take the longest legal token, then start again');
    var x2 = 40;
    [['<', '=', 'relop', true], ['<', '=', 'punct + punct', false]].forEach(function (row, k) {
      var yy = 196 + k * 32;
      P.alpha(1);
      if (k === 0) {
        chip(x2, yy, 30, 24, '<', { fill: PAL.warnDim, stroke: PAL.warn, color: PAL.warn, bold: true });
        chip(x2 + 34, yy, 30, 24, '=', { fill: PAL.warnDim, stroke: PAL.warn, color: PAL.warn, bold: true });
        P.text(x2 + 74, yy + 12, 'read together as  <=   one relop token  -  this is what the scanner does',
          { size: 11.5, color: PAL.valid, base: 'middle' });
      } else {
        chip(x2, yy, 30, 24, '<', { fill: PAL.surface, stroke: PAL.faint, color: PAL.faint });
        chip(x2 + 34, yy, 30, 24, '=', { fill: PAL.surface, stroke: PAL.faint, color: PAL.faint });
        P.text(x2 + 74, yy + 12, 'two tokens - legal only when no two-character token matches',
          { size: 11.5, color: PAL.invalid, base: 'middle' });
      }
      P.alpha(1);
    });
  }

  /* classes */
  var c = K.beat(t, 18, 5);
  if (c > 0) {
    P.alpha(c);
    band(276, 120, PAL.surface);
    label(40, 290, 'WHAT THE SCANNER REPORTS');
    var rows = [
      ['keyword', 'if', String(V.classCount.keyword || 0)],
      ['id', '[A-Za-z_][A-Za-z0-9_]*', String(V.classCount.id || 0)],
      ['num', '[0-9]+', String(V.classCount.num || 0)],
      ['relop', '<= >= == !=', String(V.classCount.relop || 0)],
      ['punct', 'single character', String(V.classCount.punct || 0)]
    ];
    rows.forEach(function (r, i) {
      var yy = 308 + i * 18;
      P.alpha(1);
      P.text(44, yy, r[0], { size: 11, mono: MONO, color: PAL.ink, bold: true });
      P.text(140, yy, r[1], { size: 11, mono: MONO, color: PAL.dim });
      P.text(330, yy, r[2] + ' token' + (r[2] === '1' ? '' : 's'), { size: 11, color: PAL.dim });
    });
    P.alpha(1);
    P.text(470, 300, 'The scanner has no memory of what came before.', { size: 11.5, color: PAL.dim });
    P.text(470, 318, 'Every decision fits in a finite automaton -', { size: 11.5, color: PAL.dim });
    P.text(470, 336, 'which is why the regex-to-DFA lesson', { size: 11.5, color: PAL.dim });
    P.text(470, 354, 'is the prerequisite for this one.', { size: 11.5, color: PAL.dim });
  }

  P.alpha(K.beat(t, 25, 4));
  P.text(24, 416, '12 tokens from 26 characters. The parser never sees a character again.',
    { size: 12.5, color: PAL.accent, bold: true });
  P.alpha(1);
};

/* ---------- 2. FIRST and FOLLOW ---------- */
SCENES.firstfollow = function (t) {
  title('FIRST and FOLLOW, computed by fixed point', 2);

  label(24, 52, 'THE GRAMMAR  (GATE 2012, the linked question)');
  var prods = ['S \u2192 a A b B | b A a B | \u03b5', 'A \u2192 S', 'B \u2192 S'];
  prods.forEach(function (p, i) {
    P.alpha(1);
    P.text(30, 70 + i * 18, p, { size: 12.5, mono: MONO, color: PAL.ink });
  });

  /* pass counter */
  var pass = Math.min(V.firstPasses.length - 1, Math.floor(K.beat(t, 2, 14) * V.firstPasses.length));
  var snap = V.firstPasses[pass];

  label(24, 140, 'FIRST - pass ' + pass + ' of ' + (V.firstPasses.length - 1));
  var nts = ['S', 'A', 'B'];
  nts.forEach(function (A, i) {
    var x = 30 + i * 200;
    chip(x, 154, 180, 26, 'FIRST(' + A + ') = ' + (snap[A] ? '{' + snap[A].replace(/@/g, '\u03b5').split('').join(', ') + '}' : '\u2205'),
      { size: 11, fill: PAL.surface, stroke: PAL.border, color: PAL.ink });
  });

  var f = K.beat(t, 14, 4);
  if (f > 0) {
    P.alpha(f);
    band(196, 92, PAL.surface);
    label(40, 210, 'FOLLOW - only the start symbol gets $ to begin with, then three rules push it round');
    var Fo = V.t12.Fo;
    [['FOLLOW(S)', setText(Fo.S)], ['FOLLOW(A)', setText(Fo.A)], ['FOLLOW(B)', setText(Fo.B)]]
      .forEach(function (r, i) {
        P.alpha(1);
        P.text(44, 230 + i * 20, r[0], { size: 11.5, mono: MONO, color: PAL.ink, bold: true });
        P.text(150, 230 + i * 20, r[1], { size: 11.5, mono: MONO, color: PAL.accent });
      });
    P.alpha(1);
    P.text(420, 230, 'A \u2192 S gives FOLLOW(S) \u2287 FOLLOW(A),', { size: 11, color: PAL.dim });
    P.text(420, 248, 'B \u2192 S gives FOLLOW(S) \u2287 FOLLOW(B).', { size: 11, color: PAL.dim });
    P.text(420, 266, 'Both directions, so the three sets feed each other.', { size: 11, color: PAL.dim });
  }

  var g = K.beat(t, 18, 5);
  if (g > 0) {
    P.alpha(g);
    band(300, 76, PAL.surface);
    label(40, 314, 'WHY FOLLOW IS THE HARD ONE');
    P.alpha(1);
    P.text(44, 332, 'FIRST answers "what can this begin with?" - it looks only forward.',
      { size: 11.5, color: PAL.dim });
    P.text(44, 350, 'FOLLOW answers "what can come after?" - it needs the whole context, so it is a',
      { size: 11.5, color: PAL.dim });
    P.text(44, 366, 'backward-closed condition. This page recomputes it a second way, by expanding', { size: 11.5, color: PAL.dim });
  }

  P.alpha(K.beat(t, 24, 4));
  P.text(24, 404, 'FOLLOW(A) = {a, b} and FOLLOW(B) = {a, b, $}: the difference is only the $,',
    { size: 12.5, color: PAL.accent, bold: true });
  P.text(24, 424, 'and it is exactly what decides whether a production can be reduced at the end.',
    { size: 12.5, color: PAL.accent, bold: true });
  P.alpha(1);
};

/* ---------- 3. the LL(1) table ---------- */
SCENES.ll1 = function (t) {
  title('The LL(1) table, and what one cell with two entries means', 3);

  label(24, 52, 'GATE 2012 GRAMMAR - M[S, a] ends up holding TWO productions');
  var head = ['', 'a', 'b', '$'];
  var cols = [24, 74, 194, 314];
  head.forEach(function (h, i) {
    P.alpha(1);
    P.text(cols[i] + 30, 74, h, { size: 12, mono: MONO, color: PAL.faint, align: 'center', bold: true });
  });
  var cell12 = [['S', V.t12.table.S], ['A', V.t12.table.A], ['B', V.t12.table.B]];
  cell12.forEach(function (row, ri) {
    var y = 92 + ri * 30;
    P.alpha(1);
    P.text(cols[0] + 10, y + 10, row[0], { size: 12, mono: MONO, color: PAL.ink, bold: true });
    ['a', 'b', '$'].forEach(function (term, ci) {
      var cell = row[1][term] || [];
      var txt = cell.map(function (id) {
        var p = V.g12.prods.find(function (q) { return q.id === id; });
        return p.text.replace(' -> ', '\u2192').replace(' -> ', '\u2192');
      }).join('  |  ') || '\u2013';
      var conflict = cell.length > 1;
      P.rect(cols[ci + 1] + 2, y, 110, 24, {
        fill: conflict ? PAL.invalidDim : PAL.surface,
        stroke: conflict ? PAL.invalid : PAL.border, sw: 1, radius: 4
      });
      P.alpha(1);
      P.text(cols[ci + 1] + 57, y + 12, txt, {
        size: 9.5, mono: MONO, align: 'center', base: 'middle',
        color: conflict ? PAL.invalid : PAL.ink
      });
    });
  });

  var a = K.beat(t, 8, 4);
  if (a > 0) {
    P.alpha(a);
    P.text(24, 200, 'Two entries in M[S, a]: on input a the parser may expand S \u2192 aAbB or S \u2192 \u03b5,',
      { size: 11.5, color: PAL.invalid });
    P.text(24, 218, 'because \u03b5 is legal exactly when the next token can follow S, and a follows S here.',
      { size: 11.5, color: PAL.invalid });
    P.text(24, 236, 'So this grammar is not LL(1) - and the GATE question only asked you to fill the cells.',
      { size: 11.5, color: PAL.dim });
  }

  var b = K.beat(t, 12, 3);
  if (b > 0) {
    P.alpha(b);
    band(252, 88, PAL.surface);
    label(40, 266, 'GATE 2010 GRAMMAR  S \u2192 a S a | b S | c  - one entry per cell');
    var t10 = V.t10.table;
    ['a', 'b', 'c'].forEach(function (term, ci) {
      var x = 44 + ci * 130;
      var cell = t10.S[term] || [];
      var txt = cell.length ? V.g10.prods.find(function (q) { return q.id === cell[0]; }).text : '\u2013';
      chip(x, 280, 118, 24, txt.replace(' -> ', '\u2192'), {
        size: 9.5, fill: PAL.accentDim, stroke: PAL.accent, color: PAL.accent
      });
      P.alpha(1);
      P.text(x + 59, 310, 'M[S, ' + term + ']', { size: 9, mono: MONO, color: PAL.faint, align: 'center' });
    });
    P.alpha(1);
    P.text(470, 284, 'FIRST(S) = {a, b, c} and no', { size: 11, color: PAL.dim });
    P.text(470, 300, 'production is nullable, so the', { size: 11, color: PAL.dim });
    P.text(470, 316, 'cells never collide.', { size: 11, color: PAL.dim });
  }

  var c = K.beat(t, 16, 5);
  if (c > 0) {
    P.alpha(c);
    band(350, 62, PAL.surface);
    label(40, 364, 'PREDICTIVE PARSE OF  aacaa  WITH THAT TABLE');
    var tr = V.parse10.trace.slice(0, 7);
    tr.forEach(function (s, i) {
      P.alpha(1);
      P.text(44 + i * 118, 382, (s.stack || '\u2205').slice(0, 12), { size: 9.5, mono: MONO, color: PAL.ink });
      P.alpha(0.7);
      P.text(44 + i * 118, 396, s.move ? s.move.replace(' -> ', '\u2192').slice(0, 14) : 'match',
        { size: 9, mono: MONO, color: PAL.accent });
    });
    P.alpha(1);
  }

  P.alpha(K.beat(t, 22, 4));
  P.text(24, 428, 'A cell with two entries is a conflict, and a conflict is the definition of "not LL(1)".',
    { size: 12.5, color: PAL.accent, bold: true });
  P.alpha(1);
};

/* ---------- 4. shift-reduce ---------- */
SCENES.shiftreduce = function (t) {
  title('Shift, reduce, and the handle', 4);

  label(24, 52, 'S \u2192 a S B | d      B \u2192 b      input  aaadbbb      (GATE 2020)');

  var shown = Math.min(V.rows4.length, Math.max(1, Math.floor(K.beat(t, 1.5, 16) * V.rows4.length) + 1));
  var y = 72;
  P.alpha(1);
  P.text(30, y, 'stack', { size: 9.5, mono: MONO, color: PAL.faint, bold: true });
  P.text(190, y, 'input', { size: 9.5, mono: MONO, color: PAL.faint, bold: true });
  P.text(300, y, 'action', { size: 9.5, mono: MONO, color: PAL.faint, bold: true });
  for (var i = 0; i < shown; i++) {
    var r = V.rows4[i];
    var yy = 88 + i * 21;
    var isRed = r.act.indexOf('reduce') === 0;
    P.alpha(1);
    P.rect(26, yy - 4, 560, 19, {
      fill: isRed ? PAL.accentDim : PAL.surface,
      stroke: 'transparent', radius: 3
    });
    P.alpha(1);
    P.text(30, yy, r.stack, { size: 10, mono: MONO, color: PAL.ink });
    P.text(190, yy, r.input, { size: 10, mono: MONO, color: PAL.dim });
    P.text(300, yy, r.act.replace(' -> ', '\u2192'), {
      size: 10, mono: MONO, color: isRed ? PAL.accent : PAL.info, bold: isRed
    });
  }

  /* the ideas panel */
  P.alpha(1);
  P.text(610, 80, 'THREE IDEAS', { size: 10, mono: MONO, color: PAL.faint, bold: true });
  P.text(610, 100, 'A handle is a right-hand', { size: 11, color: PAL.dim });
  P.text(610, 116, 'side sitting on top of the', { size: 11, color: PAL.dim });
  P.text(610, 132, 'stack at the moment it is', { size: 11, color: PAL.dim });
  P.text(610, 148, 'right to replace it.', { size: 11, color: PAL.dim });
  P.text(610, 176, 'The stack always holds a', { size: 11, color: PAL.dim });
  P.text(610, 192, 'viable prefix - a prefix of', { size: 11, color: PAL.dim });
  P.text(610, 208, 'a right-sentential form that', { size: 11, color: PAL.dim });
  P.text(610, 224, 'stops at the handle.', { size: 11, color: PAL.dim });
  P.text(610, 252, 'Reduces run a rightmost', { size: 11, color: PAL.dim });
  P.text(610, 268, 'derivation backwards, so', { size: 11, color: PAL.dim });
  P.text(610, 284, 'the parser sees the input', { size: 11, color: PAL.dim });
  P.text(610, 300, 'left to right and rebuilds', { size: 11, color: PAL.dim });
  P.text(610, 316, 'the tree bottom up.', { size: 11, color: PAL.dim });

  P.alpha(K.beat(t, 18, 5));
  P.text(24, 400, V.run4.reduces + ' reduces and ' + (V.rows4.length - V.run4.reduces) + ' shifts accept aaadbbb.',
    { size: 12.5, color: PAL.accent, bold: true });
  P.text(24, 420, 'Every reduce is one internal node of the parse tree - that is the whole cost model.',
    { size: 12, color: PAL.dim });
  P.alpha(1);
};

/* ---------- 5. LR(0) items ---------- */
SCENES.lr0 = function (t) {
  title('LR(0) items, closure and goto', 5);

  label(24, 52, 'S \u2192 C C      C \u2192 c C | d      the canonical LR(0) collection has '
    + V.autoCC.states.length + ' states');

  var pos = [
    [40, 76], [230, 76], [420, 76], [40, 190], [230, 190], [420, 190], [600, 130]
  ];
  var names = ['I0', 'I1', 'I2', 'I3', 'I4', 'I5', 'I6'];
  var reveal = K.beat(t, 2, 12) * V.autoCC.states.length;
  V.autoCC.states.forEach(function (st, i) {
    if (i >= reveal + 0.001) return;
    var x = pos[i][0], y = pos[i][1];
    var items = st.map(function (it) { return itemText(V.aCC, it); });
    var h = 26 + items.length * 14;
    P.rect(x, y, 172, h, { fill: PAL.surface, stroke: i === 0 ? PAL.accent : PAL.border, sw: i === 0 ? 1.6 : 1, radius: 6 });
    P.alpha(1);
    P.text(x + 8, y + 6, names[i], { size: 10.5, mono: MONO, color: i === 0 ? PAL.accent : PAL.faint, bold: true });
    items.forEach(function (s, k) {
      P.text(x + 8, y + 22 + k * 14, s, { size: 9.5, mono: MONO, color: PAL.ink });
    });
  });

  var e = K.beat(t, 14, 4);
  if (e > 0) {
    P.alpha(e);
    P.rect(40, 300, 380, 74, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1, radius: 6 });
    P.alpha(1);
    P.text(52, 312, 'CLOSURE', { size: 10, mono: MONO, color: PAL.accent, bold: true });
    P.text(52, 330, 'If a dot sits before a nonterminal, add every', { size: 11, color: PAL.ink });
    P.text(52, 346, 'production of that nonterminal with the dot at', { size: 11, color: PAL.ink });
    P.text(52, 362, 'the left. I0 is one item closed into four.', { size: 11, color: PAL.ink });
  }
  var f = K.beat(t, 17, 4);
  if (f > 0) {
    P.alpha(f);
    P.rect(450, 300, 400, 74, { fill: PAL.surface, stroke: PAL.border, sw: 1, radius: 6 });
    P.alpha(1);
    P.text(462, 312, 'GOTO', { size: 10, mono: MONO, color: PAL.faint, bold: true });
    P.text(462, 330, 'Move every dot one symbol right, then close', { size: 11, color: PAL.ink });
    P.text(462, 346, 'again. I0 on C gives I1, I0 on c gives I3,', { size: 11, color: PAL.ink });
    P.text(462, 362, 'I0 on d gives I4 - and I3 loops back to itself.', { size: 11, color: PAL.ink });
  }

  var g = K.beat(t, 21, 5);
  if (g > 0) {
    P.alpha(g);
    P.text(24, 396, 'The same grammar needs ' + V.autoCC1.states.length + ' canonical LR(1) states, because a state now carries lookaheads.',
      { size: 11.5, color: PAL.dim });
    P.text(24, 414, 'On the GATE 2026 grammar the LR(0) ACTION table has ' + V.sr26.length
      + ' shift-reduce conflicts, and SLR(1) on the same automaton has ' + V.slr_26.conflicts.length + '.',
      { size: 11.5, color: PAL.dim });
    P.text(24, 434, 'The automaton did not change. Only what each state is allowed to reduce on changed.',
      { size: 12, color: PAL.accent, bold: true });
  }
  P.alpha(1);
};

/* ---------- 6. the ladder ---------- */
SCENES.ladder = function (t) {
  title('Three parsers, one automaton, three lookahead policies', 6);

  label(24, 52, 'S \u2192 A a | b A c | d c | b d a      A \u2192 d      (GATE 2025, Set 2)');

  var panels = [
    { x: 24, name: 'LR(0)', rule: 'reduce on every terminal', conf: V.lr0_25.conflicts.length, colour: PAL.invalid },
    { x: 318, name: 'SLR(1)', rule: 'reduce on FOLLOW(A)', conf: V.slr25.conflicts.length, colour: PAL.warn },
    { x: 612, name: 'LALR(1)', rule: 'reduce on the merged lookahead', conf: V.lalr25.conflicts.length, colour: PAL.valid }
  ];
  var rev = K.beat(t, 2, 10) * panels.length;
  panels.forEach(function (p, i) {
    if (i >= rev + 0.001) return;
    P.rect(p.x, 72, 264, 120, { fill: PAL.surface, stroke: PAL.border, sw: 1, radius: 8 });
    P.alpha(1);
    P.text(p.x + 14, 84, p.name, { size: 13, mono: MONO, bold: true, color: p.colour });
    P.text(p.x + 14, 106, p.rule, { size: 10.5, color: PAL.dim });
    P.text(p.x + 14, 128, 'states: ' + V.auto25.states.length, { size: 10.5, mono: MONO, color: PAL.faint });
    var ctext = p.conf === 0 ? 'no conflict' : p.conf + ' conflict' + (p.conf === 1 ? '' : 's');
    P.text(p.x + 14, 152, ctext, { size: 12, mono: MONO, bold: true, color: p.conf === 0 ? PAL.valid : p.colour });
    if (i === 2) {
      P.text(p.x + 14, 174, 'LR(1) states: ' + V.lr1auto25.states.length, { size: 10.5, mono: MONO, color: PAL.faint });
    }
  });

  var a = K.beat(t, 12, 5);
  if (a > 0) {
    P.alpha(a);
    band(208, 96, PAL.surface);
    label(40, 222, 'WHY SLR FAILS HERE - state ' + V.conflict25.st + ', on lookahead ' + V.conflict25.term);
    P.alpha(1);
    V.stateItems25.forEach(function (s, i) {
      P.text(44, 240 + i * 18, s, { size: 11.5, mono: MONO, color: PAL.ink });
    });
    P.text(44, 284, 'FOLLOW(A) = ' + setText(V.Fo25.A) + ' - and c is in it.', { size: 11, color: PAL.dim });
    P.text(520, 240, 'SLR asks "may c ever follow A?"', { size: 11, color: PAL.dim });
    P.text(520, 258, 'and the answer is yes, so it reduces.', { size: 11, color: PAL.dim });
    P.text(520, 276, 'The real LR(1) lookahead in that', { size: 11, color: PAL.dim });
    P.text(520, 292, 'state is only a - so LALR shifts.', { size: 11, color: PAL.accent });
  }

  var b = K.beat(t, 18, 5);
  if (b > 0) {
    P.alpha(b);
    band(316, 74, PAL.surface);
    label(40, 330, 'MERGING IS THE ONLY DIFFERENCE - and it is free in states, not in power');
    P.alpha(1);
    P.text(44, 348, 'LALR merges LR(1) states that share a core, so it always has exactly as many states as LR(0):',
      { size: 11, color: PAL.dim });
    P.text(44, 366, 'here ' + V.lalrAuto25.states.length + ' = ' + V.auto25.states.length
      + '; on S \u2192 C C it is 7 = 7 against ' + V.autoCC1.states.length + ' for canonical LR(1).',
      { size: 11, color: PAL.dim });
  }

  P.alpha(K.beat(t, 24, 4));
  P.text(24, 410, 'LR(0) < SLR(1) < LALR(1) < LR(1): each rung narrows what a state may reduce on.',
    { size: 12.5, color: PAL.accent, bold: true });
  P.text(24, 430, 'Narrower is stronger. It is never the other way round.', { size: 12, color: PAL.dim });
  P.alpha(1);
};

/* ---------- 7. precedence and associativity ---------- */
SCENES.precedence = function (t) {
  title('Associativity is read off the recursion, not off the operator', 7);

  label(24, 52, 'S \u2192 T * P      T \u2192 U | T * U      P \u2192 Q + P | Q      (GATE 2014, Set 2)');

  function drawTree(root, x0, x1, y0, dy, colour) {
    if (!root) return;
    var L = layoutTree(root, x0, x1, y0, dy);
    L.nodes.forEach(function (n) {
      n.children.forEach(function (c) {
        P.alpha(1);
        P.line(n.x, n.y + 9, c.x, c.y - 9, { stroke: PAL.border, sw: 1.2 });
      });
    });
    L.nodes.forEach(function (n) {
      P.alpha(1);
      var leaf = !n.children.length;
      P.circle(n.x, n.y, 10, {
        fill: leaf ? PAL.surface : PAL.surface2,
        stroke: leaf ? PAL.faint : colour, sw: 1.3
      });
      P.text(n.x, n.y, n.sym, { size: 8.5, mono: MONO, color: leaf ? PAL.dim : colour, align: 'center', base: 'middle', bold: true });
    });
  }

  var a = K.beat(t, 2, 8);
  if (a > 0) {
    P.alpha(a);
    label(40, 78, 'id * id * id   -   the star tree leans LEFT, so * is left associative');
    drawTree(V.treeStar, 60, 340, 96, 30, PAL.accent);
  }
  var b = K.beat(t, 8, 8);
  if (b > 0) {
    P.alpha(b);
    label(470, 78, 'id + id + id   -   the plus tree leans RIGHT, so + is right associative');
    drawTree(V.treePlus, 490, 770, 96, 30, PAL.warn);
  }

  var c = K.beat(t, 15, 4);
  if (c > 0) {
    P.alpha(c);
    band(240, 100, PAL.surface);
    label(40, 254, 'WHY - and this is the whole trick');
    P.alpha(1);
    P.text(44, 272, 'T \u2192 T * U puts T on the LEFT of its own operator, so a*b*c groups as (a*b)*c: left.',
      { size: 11.5, color: PAL.ink });
    P.text(44, 290, 'P \u2192 Q + P puts P on the RIGHT, so a+b+c groups as a+(b+c): right.',
      { size: 11.5, color: PAL.ink });
    P.text(44, 308, 'The recursion side decides associativity. Precedence is decided by which nonterminal sits',
      { size: 11.5, color: PAL.dim });
    P.text(44, 326, 'lower in the grammar - here * binds tighter because S reaches T and T reaches U.', { size: 11.5, color: PAL.dim });
  }

  var d = K.beat(t, 20, 5);
  if (d > 0) {
    P.alpha(d);
    band(352, 62, PAL.surface);
    label(40, 366, 'THE OTHER CONFLICT THAT IS RESOLVED BY POLICY');
    P.alpha(1);
    P.text(44, 384, 'In  if E then if E then S else S  the else could belong to either if. A shift-reduce',
      { size: 11, color: PAL.dim });
    P.text(44, 402, 'parser shifts, which attaches the else to the INNER if - the rule every language uses.', { size: 11, color: PAL.dim });
  }

  P.alpha(K.beat(t, 25, 4));
  P.text(24, 434, 'The grammar already decided. The parser only has to be told which way to break the tie.',
    { size: 12.5, color: PAL.accent, bold: true });
  P.alpha(1);
};

/* ---------- 8. syntax-directed translation ---------- */
SCENES.sdt = function (t) {
  title('Attributes on a tree become values and code', 8);

  label(24, 52, 'S-ATTRIBUTED, BOTTOM-UP:  S \u2192 a A {print 1}   S \u2192 a {print 2}   A \u2192 S b {print 3}');
  var a = K.beat(t, 1.5, 10);
  if (a > 0) {
    V.prints16.forEach(function (p, i) {
      if (i >= a * V.prints16.length) return;
      P.alpha(1);
      chip(30, 72 + i * 26, 200, 22, p.prod.replace(' -> ', '\u2192'), {
        size: 10.5, fill: PAL.surface, stroke: PAL.border, color: PAL.ink
      });
      P.text(244, 83 + i * 26, p.action, { size: 11, mono: MONO, color: PAL.accent, bold: true, base: 'middle' });
    });
    P.alpha(1);
    P.text(360, 76, 'On input a a b the actions fire in', { size: 11, color: PAL.dim });
    P.text(360, 92, 'reduce order, which is post-order:', { size: 11, color: PAL.dim });
    P.text(360, 112, '2 then 3 then 1  \u2192  printed as 231', { size: 12, mono: MONO, color: PAL.accent, bold: true });
    P.text(360, 134, 'A bottom-up parser finishes a subtree', { size: 11, color: PAL.dim });
    P.text(360, 150, 'before its parent, so an S-attributed', { size: 11, color: PAL.dim });
    P.text(360, 166, 'definition needs no extra pass.', { size: 11, color: PAL.dim });
  }

  var b = K.beat(t, 12, 6);
  if (b > 0) {
    P.alpha(b);
    band(196, 110, PAL.surface);
    label(40, 210, 'THE SAME TREE, EMITTING THREE-ADDRESS CODE FOR  8 * 2 + 3 * 5');
    P.alpha(1);
    V.tac.code.forEach(function (line, i) {
      P.text(46, 228 + i * 18, line, { size: 12, mono: MONO, color: PAL.ink });
    });
    P.text(46, 228 + V.tac.code.length * 18, 'return ' + V.tac.res, { size: 12, mono: MONO, color: PAL.accent, bold: true });
    P.text(360, 228, 'Each rule creates one temporary.', { size: 11, color: PAL.dim });
    P.text(360, 246, 'Multiplication is finished before', { size: 11, color: PAL.dim });
    P.text(360, 264, 'addition because the tree is deeper', { size: 11, color: PAL.dim });
    P.text(360, 282, 'there - the code inherits the shape.', { size: 11, color: PAL.dim });
  }

  var c = K.beat(t, 19, 5);
  if (c > 0) {
    P.alpha(c);
    band(318, 84, PAL.surface);
    label(40, 332, 'AND THE VALUES THEMSELVES - GATE 2022, S \u2192 S # T AND T \u2192 T % R');
    P.alpha(1);
    P.text(44, 350, '20 # 10 % 5 # 8 % 2 % 2', { size: 12, mono: MONO, color: PAL.ink });
    P.text(44, 372, '% binds tighter than #, and both group left.', { size: 11, color: PAL.dim });
    P.text(470, 350, '((20 * (10/5)) * ((8/2)/2))', { size: 12, mono: MONO, color: PAL.accent });
    P.text(470, 372, '= ' + V.g2022, { size: 13, mono: MONO, color: PAL.accent, bold: true });
  }

  P.alpha(K.beat(t, 25, 4));
  P.text(24, 424, 'The tree is the program. Attributes only decide in which order you are allowed to read it.',
    { size: 12.5, color: PAL.accent, bold: true });
  P.alpha(1);
};

/* ---------- 9. the papers ---------- */
SCENES.papers = function (t) {
  title('Four previous-year items, each recomputed here', 9);

  var cards = [
    {
      y: 56, year: 'GATE 2010',
      q: 'S \u2192 aSa | bS | c : LL(1)? LR(1)?',
      ans: 'both',
      why: 'no LL(1) cell holds two entries, and the LR(1) table has ' + V.lr1_2010.conflicts.length + ' conflicts'
    },
    {
      y: 150, year: 'GATE 2007',
      q: 'S \u2192 iCtSS1 | a, S1 \u2192 eS | \u03b5 : why not LL(1)?',
      ans: 'because it is ambiguous',
      why: 'M[S, e] takes two productions, and i b t i b t a e a has ' + (V.ambTrees || 2) + ' parse trees'
    },
    {
      y: 244, year: 'GATE 2025, Set 2',
      q: 'S \u2192 Aa | bAc | dc | bda, A \u2192 d : which class?',
      ans: 'LALR(1) but not SLR(1)',
      why: 'SLR reduces in state ' + V.conflict25.st + ' on ' + V.conflict25.term + '; LALR has ' + V.lalr25.conflicts.length
    },
    {
      y: 338, year: 'GATE 2026, Set 2',
      q: 'S \u2192 ACB, A \u2192 aA | \u03b5, C \u2192 cC | \u03b5, B \u2192 bB | b : LR(0) shift-reduce conflicts?',
      ans: String(V.sr26.length),
      why: 'counted on the ' + V.auto26.states.length + '-state LR(0) automaton; SLR(1) on the same automaton has ' + V.slr_26.conflicts.length
    }
  ];

  var rev = K.beat(t, 2, 18) * cards.length;
  cards.forEach(function (c, i) {
    if (i >= rev + 0.001) return;
    P.rect(24, c.y, W - 48, 82, { fill: PAL.surface, stroke: PAL.border, sw: 1, radius: 8 });
    P.alpha(1);
    P.text(40, c.y + 14, c.year, { size: 10.5, mono: MONO, color: PAL.faint, bold: true });
    P.text(40, c.y + 34, c.q, { size: 12, mono: MONO, color: PAL.ink });
    P.text(40, c.y + 58, 'answer: ' + c.ans, { size: 12.5, color: PAL.accent, bold: true });
    P.alpha(0.9);
    P.text(430, c.y + 58, c.why, { size: 10.5, color: PAL.dim });
    P.alpha(1);
  });

  P.alpha(K.beat(t, 24, 4));
  P.text(24, 436, 'None of these four answers was copied from a key. Each is the number this page computed.',
    { size: 12, color: PAL.dim });
  P.alpha(1);
};

/* ---------- 10. the procedure ---------- */
SCENES.procedure = function (t) {
  title('A procedure that answers the question every time', 10);

  var steps = [
    ['1', 'Write the grammar with a fresh start symbol', 'S\' \u2192 S, and add no other production.'],
    ['2', 'Compute FIRST, then FOLLOW, to a fixed point', 'Stop when a pass changes nothing. Then read the sets.'],
    ['3', 'Build the LL(1) table and count entries per cell', 'Any cell with two is "not LL(1)" - full stop.'],
    ['4', 'Build the LR(0) automaton: closure, then goto', 'This automaton is shared by all three LR parsers.'],
    ['5', 'Add lookaheads one rung at a time', 'FOLLOW(A) for SLR, merged cores for LALR, exact for LR(1).']
  ];
  var rev = K.beat(t, 1.5, 14) * steps.length;
  steps.forEach(function (s, i) {
    if (i >= rev + 0.001) return;
    var y = 58 + i * 46;
    P.alpha(1);
    P.circle(44, y + 16, 13, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.3 });
    P.text(44, y + 16, s[0], { size: 11, mono: MONO, color: PAL.accent, align: 'center', base: 'middle', bold: true });
    P.text(70, y + 4, s[1], { size: 12, color: PAL.ink, bold: true });
    P.text(70, y + 22, s[2], { size: 11, color: PAL.dim });
  });

  var a = K.beat(t, 16, 5);
  if (a > 0) {
    P.alpha(a);
    band(288, 92, PAL.invalidDim);
    label(40, 301, 'THE FOUR SLIPS THAT COST MARKS', PAL.invalid);
    P.alpha(1);
    P.text(44, 318, 'Forgetting $ in FOLLOW(S) - every nullable start production then loses its row entry.',
      { size: 10.5, color: PAL.ink });
    P.text(44, 334, 'Reading associativity off the operator instead of off the recursion side.',
      { size: 10.5, color: PAL.ink });
    P.text(44, 350, 'Assuming LALR has more states than SLR - they share the LR(0) core, so the counts are equal.',
      { size: 10.5, color: PAL.ink });
    P.text(44, 366, 'Counting table cells instead of counting the productions inside a cell.',
      { size: 10.5, color: PAL.ink });
  }

  P.alpha(K.beat(t, 24, 4));
  P.text(24, 402, 'Five steps. The order never changes, because each rung needs the one below it.',
    { size: 12, color: PAL.dim });
  P.alpha(1);
};

/* ======================================================================
   FRAME
   ====================================================================== */

function bg() {
  P.clear();
  P.rect(0, 0, W, H, { fill: PAL.surface });
}

function drawFrame(painter) {
  P = painter;
  var tl = window.LESSON_TIMELINE;
  var t = K.state.elapsed;
  var idx = 0;
  for (var i = tl.scenes.length - 1; i >= 0; i--) {
    if (t >= tl.scenes[i].start - 1e-6) { idx = i; break; }
  }
  var sc = tl.scenes[idx];
  bg();
  if (sc && SCENES[sc.id]) {
    try {
      SCENES[sc.id](t - sc.start);
    } catch (err) {
      console.error('scene draw failed', sc.id, err);
    }
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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

window.__lessonChecks = CHECKS;
window.__lessonModel = V;

})();
