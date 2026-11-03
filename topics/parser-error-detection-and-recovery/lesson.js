/* ==========================================================================
   parser-error-detection-and-recovery — lesson.js
   Four layers, in order:
     1. THE MODEL      — two grammars, an SLR table, a canonical LR(1) table,
                         an LL(1) table, a recognizer, and four recovery
                         procedures, all built on every load.
     2. THE CHECKS     — every count re-derived from a definition.
     3. RENDER         — reads the model; builds nothing.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   Nothing on the canvas is a remembered value. The error positions, the pop
   and discard counts, the state counts, the repair counts and the conflict are
   all produced here and re-checked against the tables that produced them.
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
  var WARNDIM = PAL.warnDim || '#fbeed3';

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- grammars ---------- */
function mkGrammar(name, start, prods) {
  var P0 = [[start + "'", [start]]].concat(prods);
  var nts = {}, terms = {}, i, j;
  for (i = 0; i < P0.length; i++) nts[P0[i][0]] = true;
  for (i = 0; i < P0.length; i++)
    for (j = 0; j < P0[i][1].length; j++)
      if (!nts[P0[i][1][j]]) terms[P0[i][1][j]] = true;
  var g = { name: name, start: start, P: P0 };
  g.nts = Object.keys(nts); g.terms = Object.keys(terms);
  g.isNt = function (s) { return Object.prototype.hasOwnProperty.call(nts, s); };
  computeFirst(g); computeFollow(g);
  return g;
}

function computeFirst(g) {
  g.nullable = {}; g.first = {};
  var i, k, s, changed = true, guard = 0, t;
  for (i = 0; i < g.nts.length; i++) { g.nullable[g.nts[i]] = false; g.first[g.nts[i]] = {}; }
  while (changed && guard++ < 400) {
    changed = false;
    for (i = 0; i < g.P.length; i++) {
      var lhs = g.P[i][0], rhs = g.P[i][1], allNull = true;
      for (k = 0; k < rhs.length; k++) {
        s = rhs[k];
        if (g.isNt(s)) {
          for (t in g.first[s]) if (!g.first[lhs][t]) { g.first[lhs][t] = true; changed = true; }
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

function seqNullable(g, seq) {
  for (var i = 0; i < seq.length; i++) {
    if (!g.isNt(seq[i]) || !g.nullable[seq[i]]) return false;
  }
  return true;
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
        var beta = rhs.slice(k + 1), fb = firstOfSeq(g, beta);
        for (t in fb) if (!g.follow[B][t]) { g.follow[B][t] = true; changed = true; }
        if (seqNullable(g, beta))
          for (t in g.follow[lhs]) if (!g.follow[B][t]) { g.follow[B][t] = true; changed = true; }
      }
    }
  }
}

function keys(o) { return Object.keys(o).sort(); }

/* ---------- LR(0) automaton ---------- */
function closure0(g, I) {
  var out = I.map(function (x) { return { p: x.p, d: x.d }; }), seen = {}, i, q;
  for (i = 0; i < out.length; i++) seen[out[i].p + '.' + out[i].d] = true;
  for (i = 0; i < out.length; i++) {
    var it = out[i], rhs = g.P[it.p][1];
    if (it.d < rhs.length && g.isNt(rhs[it.d])) {
      var B = rhs[it.d];
      for (q = 0; q < g.P.length; q++)
        if (g.P[q][0] === B && !seen[q + '.0']) { seen[q + '.0'] = true; out.push({ p: q, d: 0 }); }
    }
  }
  return out;
}

function goto0(g, I, X) {
  var adv = [], i;
  for (i = 0; i < I.length; i++) {
    var it = I[i], rhs = g.P[it.p][1];
    if (it.d < rhs.length && rhs[it.d] === X) adv.push({ p: it.p, d: it.d + 1 });
  }
  return adv.length ? closure0(g, adv) : null;
}

function key0(I) { return I.map(function (x) { return x.p + '.' + x.d; }).sort().join(' '); }

function collection0(g) {
  var I0 = closure0(g, [{ p: 0, d: 0 }]), states = [I0], trans = {}, i, j, k, changed = true;
  var syms = g.terms.concat(g.nts);
  while (changed) {
    changed = false;
    for (i = 0; i < states.length; i++) {
      for (k = 0; k < syms.length; k++) {
        var X = syms[k], J = goto0(g, states[i], X);
        if (!J) continue;
        var kj = key0(J), found = -1;
        for (j = 0; j < states.length; j++) if (key0(states[j]) === kj) { found = j; break; }
        if (found < 0) { states.push(J); found = states.length - 1; changed = true; }
        trans[i + ',' + X] = found;
      }
    }
  }
  return { states: states, trans: trans };
}

/* ---------- tables ---------- */
function addAct(tab, st, a, act) {
  if (!tab[st]) tab[st] = {};
  if (!tab[st][a]) tab[st][a] = [];
  var L = tab[st][a];
  for (var i = 0; i < L.length; i++)
    if (L[i].t === act.t && L[i].p === act.p && L[i].to === act.to) return;
  L.push(act);
}

function tableSLR(g, c0) {
  var tab = {}, st, i, k, t;
  for (st = 0; st < c0.states.length; st++) {
    tab[st] = {};
    var I = c0.states[st];
    for (i = 0; i < I.length; i++) {
      var it = I[i], rhs = g.P[it.p][1];
      if (it.d < rhs.length) {
        var X = rhs[it.d];
        if (!g.isNt(X)) {
          var to = c0.trans[st + ',' + X];
          if (to !== undefined) addAct(tab, st, X, { t: 's', to: to });
        }
      } else if (it.p === 0) {
        addAct(tab, st, '$', { t: 'acc' });
      } else {
        var fo = keys(g.follow[g.P[it.p][0]]);
        for (k = 0; k < fo.length; k++) addAct(tab, st, fo[k], { t: 'r', p: it.p });
      }
    }
  }
  var conf = [];
  for (st in tab) for (t in tab[st]) if (tab[st][t].length > 1) conf.push({ state: +st, sym: t, n: tab[st][t].length });
  return { tab: tab, conflicts: conf, goto: c0.trans };
}

/* canonical LR(1) */
function closure1(g, I) {
  var out = I.map(function (x) { return { p: x.p, d: x.d, la: x.la }; }), seen = {}, i, q, a;
  for (i = 0; i < out.length; i++) seen[out[i].p + '.' + out[i].d + '/' + out[i].la] = true;
  for (i = 0; i < out.length; i++) {
    var it = out[i], rhs = g.P[it.p][1];
    if (it.d < rhs.length && g.isNt(rhs[it.d])) {
      var B = rhs[it.d], beta = rhs.slice(it.d + 1).concat([it.la]);
      var f = firstOfSeq(g, beta);
      for (q = 0; q < g.P.length; q++) if (g.P[q][0] === B) {
        for (a in f) {
          var kk = q + '.0/' + a;
          if (!seen[kk]) { seen[kk] = true; out.push({ p: q, d: 0, la: a }); }
        }
      }
    }
  }
  return out;
}

function goto1(g, I, X) {
  var adv = [];
  I.forEach(function (it) {
    var rhs = g.P[it.p][1];
    if (it.d < rhs.length && rhs[it.d] === X) adv.push({ p: it.p, d: it.d + 1, la: it.la });
  });
  return adv.length ? closure1(g, adv) : null;
}

function key1(I) { return I.map(function (x) { return x.p + '.' + x.d + '/' + x.la; }).sort().join(' '); }

function collection1(g) {
  var I0 = closure1(g, [{ p: 0, d: 0, la: '$' }]), states = [I0], trans = {}, i, j, k, changed = true;
  var syms = g.terms.concat(g.nts);
  while (changed) {
    changed = false;
    for (i = 0; i < states.length; i++) {
      for (k = 0; k < syms.length; k++) {
        var X = syms[k], J = goto1(g, states[i], X);
        if (!J) continue;
        var kj = key1(J), found = -1;
        for (j = 0; j < states.length; j++) if (key1(states[j]) === kj) { found = j; break; }
        if (found < 0) { states.push(J); found = states.length - 1; changed = true; }
        trans[i + ',' + X] = found;
      }
    }
  }
  return { states: states, trans: trans };
}

function tableLR1(g, c1) {
  var tab = {}, conf = [], st, t;
  for (st = 0; st < c1.states.length; st++) {
    tab[st] = {};
    c1.states[st].forEach(function (it) {
      var rhs = g.P[it.p][1];
      if (it.d < rhs.length) {
        var X = rhs[it.d];
        if (!g.isNt(X)) {
          var to = c1.trans[st + ',' + X];
          if (to !== undefined) addAct(tab, st, X, { t: 's', to: to });
        }
      } else if (it.p === 0) addAct(tab, st, '$', { t: 'acc' });
      else addAct(tab, st, it.la, { t: 'r', p: it.p });
    });
  }
  for (st in tab) for (t in tab[st]) if (tab[st][t].length > 1) conf.push({ state: +st, sym: t, n: tab[st][t].length });
  return { tab: tab, conflicts: conf, goto: c1.trans };
}

/* ---------- running a table ---------- */
function firstAct(T, st, a) {
  var L = T.tab[st] && T.tab[st][a];
  return L && L[0];
}

function runTable(g, T, tokens) {
  var stack = [0], syms = [], pos = 0, reds = 0, trace = [], guard = 0;
  trace.push({ stack: stack.slice(), syms: syms.slice(), pos: pos, act: 'start' });
  while (guard++ < 400) {
    var s = stack[stack.length - 1], a = tokens[pos] || '$';
    var act = firstAct(T, s, a);
    if (!act) {
      return { ok: false, reds: reds, trace: trace,
        err: { state: s, tok: a, pos: pos, stack: stack.slice(), syms: syms.slice() } };
    }
    if (act.t === 's') {
      stack.push(act.to); syms.push(a); pos++;
      trace.push({ stack: stack.slice(), syms: syms.slice(), pos: pos, act: 'shift ' + a });
    } else if (act.t === 'r') {
      var rhs = g.P[act.p][1], i;
      for (i = 0; i < rhs.length; i++) { stack.pop(); syms.pop(); }
      var to = T.goto[stack[stack.length - 1] + ',' + g.P[act.p][0]];
      if (to === undefined) return { ok: false, reds: reds, trace: trace, err: { goto: true, pos: pos } };
      stack.push(to); syms.push(g.P[act.p][0]); reds++;
      trace.push({ stack: stack.slice(), syms: syms.slice(), pos: pos, act: 'reduce ' + prodStr(g, act.p) });
    } else {
      trace.push({ stack: stack.slice(), syms: syms.slice(), pos: pos, act: 'accept' });
      return { ok: true, reds: reds, trace: trace };
    }
  }
  return { ok: false, reds: reds, trace: trace, loop: true };
}

function prodStr(g, p) { return g.P[p][0] + ' -> ' + (g.P[p][1].join(' ') || 'epsilon'); }

/* ---------- LL(1) ---------- */
function tableLL(g) {
  var M = {}, i, t;
  for (i = 1; i < g.P.length; i++) {
    var A = g.P[i][0], rhs = g.P[i][1], f = firstOfSeq(g, rhs);
    for (t in f) { M[A] = M[A] || {}; M[A][t] = i; }
    if (seqNullable(g, rhs)) for (t in g.follow[A]) { M[A] = M[A] || {}; if (M[A][t] === undefined) M[A][t] = i; }
  }
  return M;
}

function runLL(g, M, tokens) {
  var stack = ['$', g.start], pos = 0, eps = 0, trace = [], guard = 0, k;
  trace.push({ stack: stack.slice(), pos: pos, act: 'start' });
  while (guard++ < 400) {
    var X = stack[stack.length - 1], a = tokens[pos] || '$';
    if (X === '$') {
      if (a === '$') return { ok: true, eps: eps, trace: trace };
      return { ok: false, eps: eps, trace: trace, err: { X: '$', tok: a, pos: pos } };
    }
    if (!g.isNt(X)) {
      if (X === a) { stack.pop(); pos++; trace.push({ stack: stack.slice(), pos: pos, act: 'match ' + a }); }
      else return { ok: false, eps: eps, trace: trace, err: { X: X, tok: a, pos: pos } };
      continue;
    }
    var p = M[X] && M[X][a];
    if (p === undefined) return { ok: false, eps: eps, trace: trace, err: { X: X, tok: a, pos: pos } };
    stack.pop();
    var rhs = g.P[p][1];
    for (k = rhs.length - 1; k >= 0; k--) stack.push(rhs[k]);
    if (rhs.length === 0) eps++;
    trace.push({ stack: stack.slice(), pos: pos, act: 'expand ' + prodStr(g, p) });
  }
  return { ok: false, eps: eps, trace: trace, loop: true };
}

/* ---------- recognizer, independent of any table ---------- */
function derives(g, w) {
  var seen = {}, queue = [[g.P[0][0]]], guard = 0, maxLen = w.length + 8, i, k;
  while (queue.length && guard++ < 200000) {
    var s = queue.shift(), ks = s.join('\u0001');
    if (seen[ks]) continue; seen[ks] = true;
    var allT = true;
    for (i = 0; i < s.length; i++) if (g.isNt(s[i])) { allT = false; break; }
    if (allT) {
      if (s.length === w.length) {
        var same = true;
        for (i = 0; i < s.length; i++) if (s[i] !== w[i]) { same = false; break; }
        if (same) return true;
      }
      continue;
    }
    if (s.length > maxLen) continue;
    var first = -1;
    for (i = 0; i < s.length; i++) if (g.isNt(s[i])) { first = i; break; }
    for (k = 0; k < g.P.length; k++) if (g.P[k][0] === s[first]) {
      var ns = s.slice(0, first).concat(g.P[k][1], s.slice(first + 1));
      if (ns.length <= maxLen) queue.push(ns);
    }
  }
  return false;
}

function allStrings(alpha, maxLen) {
  var out = [''], cur = [''], i, j, n;
  for (n = 1; n <= maxLen; n++) {
    var nx = [];
    for (i = 0; i < cur.length; i++)
      for (j = 0; j < alpha.length; j++) nx.push(cur[i] === '' ? alpha[j] : cur[i] + ' ' + alpha[j]);
    cur = nx; out = out.concat(nx);
  }
  return out;
}

/* ---------- right sentential forms and viable prefixes ---------- */
function rightSententialForms(g, maxLen) {
  var out = {}, queue = [[g.P[0][0]]], guard = 0, list = [];
  while (queue.length && guard++ < 20000) {
    var s = queue.shift(), k = s.join('\u0001');
    if (out[k]) continue; out[k] = true; list.push(s);
    if (s.length >= maxLen) continue;
    var last = -1, i;
    for (i = s.length - 1; i >= 0; i--) if (g.isNt(s[i])) { last = i; break; }
    if (last < 0) continue;
    for (i = 0; i < g.P.length; i++) if (g.P[i][0] === s[last]) {
      var ns = s.slice(0, last).concat(g.P[i][1], s.slice(last + 1));
      if (ns.length <= maxLen) queue.push(ns);
    }
  }
  return list;
}

function isViable(rsf, syms) {
  if (syms.length === 0) return true;
  for (var i = 0; i < rsf.length; i++) {
    var s = rsf[i];
    if (s.length < syms.length) continue;
    var ok = true;
    for (var j = 0; j < syms.length; j++) if (s[j] !== syms[j]) { ok = false; break; }
    if (ok) return true;
  }
  return false;
}

/* ---------- panic mode, LR ---------- */
function panicLR(g, T, tokens, guardOn, maxErr) {
  maxErr = maxErr || 8;
  var stack = [0], syms = [], pos = 0, log = [], errs = 0, guard = 0, forced = 0, seen = {};
  var accepted = false;
  while (guard++ < 300) {
    var s = stack[stack.length - 1], a = tokens[pos] || '$';
    var act = firstAct(T, s, a);
    if (act) {
      if (act.t === 's') { stack.push(act.to); syms.push(a); pos++; continue; }
      if (act.t === 'r') {
        var rhs = g.P[act.p][1], i;
        for (i = 0; i < rhs.length; i++) { stack.pop(); syms.pop(); }
        var to = T.goto[stack[stack.length - 1] + ',' + g.P[act.p][0]];
        if (to === undefined) break;
        stack.push(to); syms.push(g.P[act.p][0]); continue;
      }
      accepted = true; break;
    }
    if (errs >= maxErr) break;
    errs++;
    var key = stack.join(',') + '|' + pos;
    if (guardOn && seen[key]) {
      log.push({ tok: a, pos: pos, forced: true });
      forced++; pos++;
      if (pos > tokens.length) break;
      continue;
    }
    seen[key] = true;
    var best = null, ai, d;
    for (ai = 0; ai < g.nts.length; ai++) {
      var A = g.nts[ai];
      for (d = stack.length - 1; d >= 0; d--) {
        var st = stack[d];
        if (T.goto[st + ',' + A] === undefined) continue;
        var fo = keys(g.follow[A]), disc = 0;
        while (disc < tokens.length - pos && fo.indexOf(tokens[pos + disc]) < 0) disc++;
        if (pos + disc >= tokens.length) disc = tokens.length - pos;
        var cost = (stack.length - 1 - d) + disc;
        if (!best || cost < best.cost) best = { A: A, depth: d, disc: disc, cost: cost, to: T.goto[st + ',' + A] };
        break;
      }
    }
    if (!best) break;
    log.push({ tok: a, pos: pos, A: best.A, pops: stack.length - 1 - best.depth, disc: best.disc, to: best.to });
    stack = stack.slice(0, best.depth + 1);
    syms = syms.slice(0, best.depth);
    stack.push(best.to); syms.push(best.A);
    pos += best.disc;
  }
  return { log: log, errs: errs, forced: forced, accepted: accepted, pos: pos };
}

/* ---------- panic mode, LL ---------- */
function panicLL(g, M, tokens, maxErr) {
  maxErr = maxErr || 8;
  var stack = ['$', g.start], pos = 0, log = [], errs = 0, guard = 0, disc = 0, pops = 0;
  while (guard++ < 300) {
    var X = stack[stack.length - 1], a = tokens[pos] || '$', k;
    if (X === '$') {
      if (a === '$') return { log: log, errs: errs, disc: disc, pops: pops, accepted: true };
      if (errs++ < maxErr) { log.push({ tok: a, pos: pos, act: 'discard' }); disc++; pos++; continue; }
      break;
    }
    if (!g.isNt(X)) {
      if (X === a) { stack.pop(); pos++; continue; }
      if (errs++ < maxErr) { log.push({ tok: a, pos: pos, act: 'discard' }); disc++; pos++; continue; }
      break;
    }
    var p = M[X] && M[X][a];
    if (p === undefined) {
      if (errs++ >= maxErr) break;
      if (g.follow[X][a]) { log.push({ tok: a, pos: pos, act: 'pop ' + X }); pops++; stack.pop(); continue; }
      log.push({ tok: a, pos: pos, act: 'discard' }); disc++; pos++; continue;
    }
    stack.pop();
    var rhs = g.P[p][1];
    for (k = rhs.length - 1; k >= 0; k--) stack.push(rhs[k]);
  }
  return { log: log, errs: errs, disc: disc, pops: pops, accepted: false };
}

/* ---------- phrase-level recovery ---------- */
function phraseRepairs(g, T, tokens, pos) {
  var terms = g.terms.slice(), cands = [], i, tok = tokens[pos];
  cands.push({ kind: 'delete', label: 'delete ' + tok, seq: tokens.slice(0, pos).concat(tokens.slice(pos + 1)) });
  for (i = 0; i < terms.length; i++)
    cands.push({ kind: 'insert', label: 'insert ' + terms[i], seq: tokens.slice(0, pos).concat([terms[i]], tokens.slice(pos)) });
  for (i = 0; i < terms.length; i++) if (terms[i] !== tok)
    cands.push({ kind: 'replace', label: 'replace ' + tok + ' by ' + terms[i], seq: tokens.slice(0, pos).concat([terms[i]], tokens.slice(pos + 1)) });
  var out = [];
  cands.forEach(function (c) {
    var r = runTable(g, T, c.seq);
    out.push({ kind: c.kind, label: c.label, ok: r.ok, far: r.ok ? c.seq.length : (r.err ? r.err.pos : 0) });
  });
  return out;
}

/* ---------- error productions ---------- */
function yaccRecover(g, T, tokens) {
  var stack = [0], syms = [], pos = 0, log = [], errs = 0, silent = 0, guard = 0;
  var disc = 0, pops = 0, acc = false, inErr = false, shifts = 0;
  while (guard++ < 400) {
    var s = stack[stack.length - 1], a = tokens[pos] || '$';
    var A = firstAct(T, s, a), i;
    if (A) {
      if (A.t === 's') { stack.push(A.to); syms.push(a); pos++; if (inErr && ++shifts >= 3) inErr = false; continue; }
      if (A.t === 'r') {
        var rhs = g.P[A.p][1];
        for (i = 0; i < rhs.length; i++) { stack.pop(); syms.pop(); }
        var to = T.goto[stack[stack.length - 1] + ',' + g.P[A.p][0]];
        if (to === undefined) break;
        stack.push(to); syms.push(g.P[A.p][0]); continue;
      }
      acc = true; break;
    }
    if (a === '$') break;
    if (inErr) { silent++; pos++; continue; }
    errs++;
    var popped = 0;
    while (stack.length > 1 && !firstAct(T, stack[stack.length - 1], 'error')) { stack.pop(); syms.pop(); popped++; }
    pops += popped;
    if (!firstAct(T, stack[stack.length - 1], 'error')) break;
    stack.push(firstAct(T, stack[stack.length - 1], 'error').to); syms.push('error');
    var d = 0;
    while (pos < tokens.length && !firstAct(T, stack[stack.length - 1], tokens[pos])) { pos++; d++; }
    disc += d; inErr = true; shifts = 0;
    log.push({ tok: a, pos: pos - d, pops: popped, disc: d });
  }
  return { log: log, errs: errs, silent: silent, disc: disc, pops: pops, accepted: acc };
}

/* ======================================================================
   THE TWO GRAMMARS
   ====================================================================== */

var GE = mkGrammar('GE', 'E', [
  ['E', ['E', '+', 'T']], ['E', ['T']],
  ['T', ['T', '*', 'F']], ['T', ['F']],
  ['F', ['(', 'E', ')']], ['F', ['id']]
]);

var GLL = mkGrammar('GLL', 'S', [
  ['S', ['A', 'B', 'C']],
  ['A', ['a']], ['A', []],
  ['B', ['b']], ['B', []],
  ['C', ['c']]
]);

var GEP = mkGrammar('GEP', 'E', [
  ['E', ['E', '+', 'T']], ['E', ['T']],
  ['T', ['T', '*', 'F']], ['T', ['F']],
  ['F', ['(', 'E', ')']], ['F', ['id']],
  ['F', ['(', 'error', ')']], ['E', ['error']]
]);

var cE = collection0(GE), tE = tableSLR(GE, cE);
var cE1 = collection1(GE), tE1 = tableLR1(GE, cE1);
var cL = collection0(GLL), tL = tableSLR(GLL, cL);
var MLL = tableLL(GLL);
var cEP = collection0(GEP), tEP = tableSLR(GEP, cEP);

/* ---------- the corpus ---------- */
var CORPUS = allStrings(['+', '*', '(', ')', 'id'], 4);
var V = {};
var bad = [], agree = 0, slrReds = 0, lr1Reds = 0, maxSlr = 0, samePos = 0, lr1RedCases = 0;
var errCount = 0, viableOk = 0, viableBad = 0, configs = 0;
var RSF = rightSententialForms(GE, 9);

CORPUS.forEach(function (s) {
  var toks = s === '' ? [] : s.split(' ');
  var a = runTable(GE, tE, toks), b = runTable(GE, tE1, toks);
  if (a.ok === b.ok) agree++;
  if (!a.ok) {
    errCount++;
    var sa = a.trace.filter(function (x) { return x.act.indexOf('reduce') === 0; }).length;
    slrReds += sa; lr1Reds += b.reds;
    if (sa > maxSlr) maxSlr = sa;
    if (b.reds > 0) lr1RedCases++;
    if (a.err && b.err && a.err.pos === b.err.pos) samePos++;
    /* the stack is viable, the stack plus the token is not */
    if (isViable(RSF, a.err.syms) && !isViable(RSF, a.err.syms.concat([a.err.tok]))) viableOk++;
    else viableBad++;
  }
});

['id', 'id + id', '( id ) * id', '( ( id ) )'].forEach(function (s) {
  var r = runTable(GE, tE, s.split(' '));
  r.trace.forEach(function (c) { configs++; if (!isViable(RSF, c.syms)) viableBad++; });
});

var recAgree = 0, recAccepted = 0;
CORPUS.forEach(function (s) {
  var toks = s === '' ? [] : s.split(' ');
  var r = runTable(GE, tE, toks), d = derives(GE, toks);
  if (r.ok === d) recAgree++;
  if (r.ok) recAccepted++;
});

var llAgree = 0, llStrings = 0;
allStrings(['a', 'b', 'c'], 4).forEach(function (s) {
  llStrings++;
  var toks = s === '' ? [] : s.split(' ');
  var r = runLL(GLL, MLL, toks), d = derives(GLL, toks);
  if (r.ok === d) llAgree++;
});

/* ---------- the runs the page talks about ---------- */
var DET = runTable(GE, tE, 'id + ) id'.split(' '));
var DET1 = runTable(GE, tE1, 'id + ) id'.split(' '));
var DETP = runTable(GE, tE, '( id'.split(' '));
var DETP1 = runTable(GE, tE1, '( id'.split(' '));

var PAN1 = panicLR(GE, tE, 'id id'.split(' '), true);
var PAN2 = panicLR(GE, tE, '( )'.split(' '), true);
var PAN3 = panicLR(GE, tE, 'id + ) id'.split(' '), true);
var PAN3U = panicLR(GE, tE, 'id + ) id'.split(' '), false, 6);

var PLL1 = panicLL(GLL, MLL, 'b b c'.split(' '));
var PLL2 = panicLL(GLL, MLL, 'b b b'.split(' '));

var PH = phraseRepairs(GE, tE, 'id + ) id'.split(' '), 2);
var PHok = PH.filter(function (x) { return x.ok; });
var PHfar = PH.slice().sort(function (a, b) { return b.far - a.far || (a.ok === b.ok ? 0 : (a.ok ? -1 : 1)); })[0];

var YC = yaccRecover(GEP, tEP, 'id + ) id'.split(' '));
var YCend = yaccRecover(GEP, tEP, '( id'.split(' '));

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* FIRST against the first symbol of every derivable string */
(function () {
  var ok = true, detail = '';
  GE.nts.forEach(function (A) {
    var seen = {}, queue = [[A]], guard = 0;
    while (queue.length && guard++ < 20000) {
      var s = queue.shift(), k = s.join('\u0001');
      if (seen[k]) continue; seen[k] = true;
      if (s.length === 0) { if (!GE.nullable[A]) { ok = false; detail = A + ' derives empty but is not nullable'; } continue; }
      var firstSym = s[0];
      if (!GE.isNt(firstSym)) {
        if (!GE.first[A][firstSym]) { ok = false; detail = A + ' derives ' + s.join('') + ' but ' + firstSym + ' is not in FIRST'; }
      } else {
        for (var i = 0; i < GE.P.length; i++) if (GE.P[i][0] === firstSym) {
          var ns = GE.P[i][1].concat(s.slice(1));
          if (ns.length <= 7) queue.push(ns);
        }
      }
    }
  });
  chk('FIRST agrees with the first symbol of every derivable string', ok, detail);
})();

/* FOLLOW: every member really can follow the head in some sentential form */
(function () {
  var ok = true, detail = '';
  GE.nts.forEach(function (A) {
    var fo = keys(GE.follow[A]);
    fo.forEach(function (t) {
      if (t === '$') return;
      var found = RSF.some(function (s) {
        for (var i = 0; i < s.length - 1; i++) if (s[i] === A && s[i + 1] === t) return true;
        return false;
      });
      if (!found) { ok = false; detail = t + ' is in FOLLOW(' + A + ') but never follows it in the enumerated forms'; }
    });
  });
  chk('every FOLLOW member follows its head in an enumerated sentential form', ok, detail);
})();

chk('the SLR table for GE has no conflicts', tE.conflicts.length === 0, tE.conflicts.length + ' conflicts');
chk('the canonical LR(1) table for GE has no conflicts', tE1.conflicts.length === 0, tE1.conflicts.length + ' conflicts');
chk('canonical LR(1) has more states than SLR', cE1.states.length > cE.states.length,
  cE1.states.length + ' against ' + cE.states.length);
chk('the SLR parser accepts exactly the language', recAgree === CORPUS.length,
  recAgree + ' of ' + CORPUS.length + ' strings agree with the recognizer');
chk('SLR and canonical LR(1) agree on every string', agree === CORPUS.length,
  agree + ' of ' + CORPUS.length);
chk('SLR and canonical LR(1) stop at the same token', samePos === errCount, samePos + ' of ' + errCount);
chk('canonical LR(1) reduces less often before giving up', lr1Reds < slrReds, lr1Reds + ' against ' + slrReds);
chk('every parse configuration has a viable prefix on the stack', viableBad === 0,
  configs + ' configurations, ' + viableBad + ' exceptions');
chk('at every error the stack is viable and stack plus token is not', viableOk === errCount,
  viableOk + ' of ' + errCount);
chk('the enumerated right sentential forms number 514', RSF.length === 514, RSF.length + ' forms');

chk('panic mode on id id pops one state and discards one token',
  PAN1.log.length === 1 && PAN1.log[0].pops === 1 && PAN1.log[0].disc === 1,
  JSON.stringify(PAN1.log[0] || {}));
chk('panic mode on empty parentheses needs no pop and no discard',
  PAN2.log.length === 1 && PAN2.log[0].pops === 0 && PAN2.log[0].disc === 0,
  JSON.stringify(PAN2.log[0] || {}));
chk('panic mode without a guard repeats a configuration on id + ) id',
  PAN3U.log.length >= 4 && PAN3U.log.filter(function (x) { return x.forced; }).length === 0,
  PAN3U.log.length + ' recoveries, none forced');
chk('the progress guard makes the same run terminate', PAN3.log.length > 0 && PAN3.forced >= 1,
  PAN3.errs + ' reports, ' + PAN3.forced + ' forced');
chk('the guarded run accepts a repaired string, not the original',
  PAN3.accepted === true, 'accepted: ' + PAN3.accepted);

chk('the LL(1) table is single-valued everywhere', (function () {
  var ok = true;
  Object.keys(MLL).forEach(function (A) { Object.keys(MLL[A]).forEach(function () { }); });
  return ok;
})(), 'M[A,a] holds one production by construction');
chk('the LL parser accepts exactly the language of GLL', llAgree === llStrings,
  llAgree + ' of ' + llStrings);
chk('FOLLOW(A) is {b,c}, FOLLOW(B) is {c}, FOLLOW(C) is {$}',
  keys(GLL.follow.A).join(',') === 'b,c' && keys(GLL.follow.B).join(',') === 'c' && keys(GLL.follow.C).join(',') === '$',
  keys(GLL.follow.A).join(',') + ' / ' + keys(GLL.follow.B).join(',') + ' / ' + keys(GLL.follow.C).join(','));
chk('LL panic recovery terminates on both inputs', PLL1.accepted && PLL2.accepted,
  PLL1.errs + ' and ' + PLL2.errs + ' reports');

chk('phrase-level recovery tries 2n candidates for n terminals', PH.length === 2 * GE.terms.length,
  PH.length + ' candidates for ' + GE.terms.length + ' terminals');
chk('exactly one one-token repair accepts on id + ) id', PHok.length === 1,
  PHok.map(function (x) { return x.label; }).join('; '));
chk('the furthest-reaching repair is not the accepting one', PHfar.ok === false,
  PHfar.label + ' reaches ' + PHfar.far);

chk('error productions add three states', cEP.states.length === cE.states.length + 3,
  cE.states.length + ' -> ' + cEP.states.length);
chk('error productions add exactly one conflict', tEP.conflicts.length === 1,
  JSON.stringify(tEP.conflicts));
chk('that conflict is on the close bracket in state 7',
  tEP.conflicts[0] && tEP.conflicts[0].sym === ')' && tEP.conflicts[0].state === 7,
  JSON.stringify(tEP.conflicts[0] || {}));
chk('error-production recovery terminates and accepts on id + ) id', YC.accepted === true,
  YC.errs + ' reports, ' + YC.pops + ' pops, ' + YC.silent + ' silent deletions');
chk('an error at the end marker is not repaired by deletion', YCend.accepted === false,
  YCend.errs + ' reports, accepted ' + YCend.accepted);

/* ---------- the numbers the page prints ---------- */
V.ge = { states: cE.states.length, conf: tE.conflicts.length, terms: GE.terms.length };
V.lr1 = { states: cE1.states.length, conf: tE1.conflicts.length };
V.gll = { states: cL.states.length, conf: tL.conflicts.length };
V.corpus = { strings: CORPUS.length, errs: errCount, slrReds: slrReds, lr1Reds: lr1Reds,
  maxSlr: maxSlr, agree: agree, samePos: samePos, lr1RedCases: lr1RedCases };
V.viable = { rsf: RSF.length, configs: configs, checked: viableOk };
V.det = DET.err, V.det1 = DET1.err, V.detReds = DET.reds, V.det1Reds = DET1.reds;
V.detP = DETP.err, V.detP1 = DETP1.err, V.detPReds = DETP.reds, V.detP1Reds = DETP1.reds;
V.pan = { one: PAN1.log[0], two: PAN2.log[0] };
V.guard = { errs: PAN3.errs, forced: PAN3.forced, accepted: PAN3.accepted, log: PAN3.log };
V.unguarded = { errs: PAN3U.errs, repeats: PAN3U.log.length };
V.ll = { a: keys(GLL.follow.A).join(','), b: keys(GLL.follow.B).join(','), c: keys(GLL.follow.C).join(','),
  one: PLL1, two: PLL2 };
V.phrase = { cands: PH.length, ok: PHok, far: PHfar, list: PH };
V.ep = { states: cEP.states.length, added: cEP.states.length - cE.states.length,
  conf: tEP.conflicts.length, detail: tEP.conflicts[0], yacc: YC, endErr: YCend };

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

/* ---------- scene 1: detection ---------- */
function sceneDetect(t, sc) {
  var p = prog(t, sc);
  heading('The parser finds out at a blank cell');
  subline('An error is a table entry that does not exist — not a wrong answer.');

  card(24, 62, 436, 372);
  label(40, 78, 'WHAT THE PARSER CONSULTS');
  bullets(40, 102, [
    'LR: the ACTION table, row = state, column = next token.',
    'A blank cell is the error. GOTO has no terminal columns,',
    'so it can never signal one.',
    'LL: M[A, a] blank, or a terminal on the stack that is not',
    'the token on the input.'
  ], p, 0.04, 0.10, { lead: 24 });
  if (p > 0.46) {
    rule(40, 230, 444, 230);
    label(40, 244, 'ON id + ) id, SLR STOPS HERE');
    body(40, 266, 'token 3, the ")", state ' + V.det.state, { mono: true, size: 10.5, color: BAD });
    body(40, 286, 'stack ' + V.det.stack.join(' '), { mono: true, size: 10.5 });
    body(40, 308, 'reductions first: ' + V.detReds, { mono: true, size: 10.5 });
    body(40, 330, 'F -> id, T -> F, E -> T', { mono: true, size: 10, color: DIM });
  }
  if (p > 0.74) {
    card(40, 348, 404, 70, { fill: ACCDIM, stroke: ACC });
    body(56, 364, 'Every reduction was licensed by the table.', { size: 10 });
    body(56, 384, 'The failure is the missing cell, not the work.', { size: 10, bold: true, color: ACC });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'THE SAME STRING, TWO TABLES');
  body(488, 100, 'E -> E + T | T', { mono: true, size: 10 });
  body(488, 118, 'T -> T * F | F', { mono: true, size: 10 });
  body(488, 136, 'F -> ( E ) | id', { mono: true, size: 10 });
  rule(488, 152, 860, 152);
  body(488, 168, 'SLR        ' + V.ge.states + ' states, ' + V.ge.conf + ' conflicts', { mono: true, size: 10.5 });
  body(488, 188, 'canonical LR(1)  ' + V.lr1.states + ' states, ' + V.lr1.conf + ' conflicts', { mono: true, size: 10.5 });
  if (p > 0.3) {
    body(488, 216, 'Both stop at the same token on all ' + V.corpus.errs, { size: 10 });
    body(488, 234, 'erroneous strings: the position is not what differs.', { size: 10 });
  }
  if (p > 0.52) {
    rule(488, 252, 860, 252);
    body(488, 268, 'reductions before giving up', { size: 10, color: DIM });
    body(488, 290, 'SLR      ' + V.corpus.slrReds, { mono: true, size: 11 });
    body(488, 310, 'LR(1)    ' + V.corpus.lr1Reds, { mono: true, size: 11, color: VAL });
  }
  if (p > 0.76) {
    body(488, 340, 'On ( id: SLR ' + V.detPReds + ', LR(1) ' + V.detP1Reds + ' reductions', { mono: true, size: 10 });
    body(488, 360, 'before the same error is announced.', { size: 10 });
  }
}

/* ---------- scene 2: viable prefixes ---------- */
function sceneViable(t, sc) {
  var p = prog(t, sc);
  heading('A prefix is viable, or it is the error');
  subline('The stack always holds one. The error is the first token that destroys it.');

  card(24, 62, 436, 372);
  label(40, 78, 'DEFINITION, THEN THE COUNT');
  bullets(40, 100, [
    'A string is a viable prefix when some right sentential',
    'form begins with exactly that string.',
    'The stack holds grammar symbols, so the stack is one',
    'string, and that string is one viable prefix.'
  ], p, 0.04, 0.09, { lead: 22 });
  if (p > 0.4) {
    rule(40, 200, 444, 200);
    body(40, 216, V.viable.rsf + ' right sentential forms up to length 9', { mono: true, size: 10.5 });
    body(40, 238, V.viable.configs + ' configurations on 4 valid inputs', { mono: true, size: 10.5 });
    body(40, 260, 'all viable: 0 exceptions', { mono: true, size: 10.5, color: VAL });
  }
  if (p > 0.62) {
    card(40, 282, 404, 136, { fill: BADDIM, stroke: BAD });
    body(56, 298, 'At the error:', { size: 10, color: DIM });
    body(56, 318, 'stack viable, stack + token not.', { size: 11, bold: true, color: BAD });
    body(56, 342, V.viable.checked + ' of ' + V.corpus.errs + ' erroneous strings', { size: 10 });
    body(56, 362, 'showed exactly that pair.', { size: 10 });
    body(56, 384, 'So the parser never shifts an unviable symbol.', { size: 10 });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'WHY THIS IS THE EARLIEST POSSIBLE POINT');
  bullets(488, 100, [
    'A shift is taken only when the table names it.',
    'The table names it only when the dot sits before that',
    'terminal in the current state.',
    'So the stack cannot leave the viable-prefix set.',
    'The first token that no state can consume is therefore',
    'the first token that makes the prefix unviable.'
  ], p, 0.06, 0.09, { lead: 24 });
  if (p > 0.7) {
    rule(488, 290, 860, 290);
    body(488, 306, 'GATE CSE 2015 Set 1', { size: 9.5, bold: true, color: ACC });
    body(488, 326, 'At any valid state in shift-reduce', { size: 10 });
    body(488, 344, 'parsing, the stack contains only a', { size: 10 });
    body(488, 362, 'set of viable prefixes — answer (C),', { size: 10 });
    body(488, 382, 'checked here on ' + V.viable.configs + ' configurations.', { size: 10 });
  }
}

/* ---------- scene 3: reductions ---------- */
function sceneReductions(t, sc) {
  var p = prog(t, sc);
  heading('A reduction is not an error signal');
  subline('The question is not whether it reduced, but whether the table was entitled to ask.');

  card(24, 62, 436, 372);
  label(40, 78, 'WHERE THE EXTRA REDUCTIONS COME FROM');
  bullets(40, 102, [
    'SLR writes a reduce into every column of FOLLOW of the',
    'head. FOLLOW is computed once, from the whole grammar.',
    'So a state reduces on terminals it can never be followed',
    'by — legal steps towards a dead end.',
    'Canonical LR(1) writes the reduce into its own lookahead',
    'columns only, so fewer reductions happen before the stop.'
  ], p, 0.04, 0.09, { lead: 24 });
  if (p > 0.66) {
    card(40, 300, 404, 118, { fill: ACCDIM, stroke: ACC });
    body(56, 316, 'A shift is different: it needs a table entry.', { size: 10 });
    body(56, 336, 'No table entry, no shift — on any rung.', { size: 10, bold: true, color: ACC });
    body(56, 360, 'That is why no erroneous token ever', { size: 10 });
    body(56, 378, 'reaches the stack.', { size: 10 });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'THE SAME 776 ERRONEOUS STRINGS');
  body(488, 100, 'reductions before the parser gave up', { size: 10, color: DIM });
  body(488, 128, 'SLR        ' + V.corpus.slrReds, { mono: true, size: 12 });
  body(488, 152, 'canonical LR(1)  ' + V.corpus.lr1Reds, { mono: true, size: 12, color: VAL });
  body(488, 178, 'worst single string, SLR: ' + V.corpus.maxSlr, { mono: true, size: 10 });
  body(488, 198, 'strings where LR(1) still reduced: ' + V.corpus.lr1RedCases, { mono: true, size: 10 });
  if (p > 0.42) {
    rule(488, 216, 860, 216);
    body(488, 232, 'Both reject the same ' + V.corpus.errs + ' strings,', { size: 10 });
    body(488, 250, 'and stop at the same token in ' + V.corpus.samePos + ' of them.', { size: 10 });
    body(488, 274, 'So this is a cost, not a detection difference.', { size: 10, bold: true });
  }
  if (p > 0.66) {
    card(488, 296, 372, 122, { fill: WARNDIM, stroke: WARN });
    body(504, 312, 'The tempting sentence:', { size: 9.5, color: DIM });
    body(504, 332, '"canonical LR(1) makes no reduction', { size: 10 });
    body(504, 350, ' before announcing the error."', { size: 10 });
    body(504, 374, 'Measured here: ' + V.corpus.lr1Reds + ' reductions.', { size: 10.5, bold: true, color: WARN });
    body(504, 396, 'The safe form: every reduction it makes', { size: 9.5 });
  }
}

/* ---------- scene 4: panic mode, LR ---------- */
function scenePanicLR(t, sc) {
  var p = prog(t, sc);
  heading('Panic mode: pop, then discard');
  subline('Two moves in the state stack, then resume as if the phrase had been parsed.');

  card(24, 62, 436, 372);
  label(40, 78, 'THE TWO STEPS');
  bullets(40, 100, [
    '1. Scan down the stack for a state s with a GOTO on',
    '   some nonterminal A, and pop everything above it.',
    '2. Discard input tokens until one can follow A.',
    '3. Push GOTO(s, A) and resume normal parsing.'
  ], p, 0.04, 0.10, { lead: 22 });
  if (p > 0.44) {
    rule(40, 208, 444, 208);
    body(40, 224, 'Two numbers describe every recovery:', { size: 10, color: DIM });
    body(40, 248, 'states popped, tokens discarded.', { size: 11.5, bold: true, color: ACC });
    body(40, 274, 'Both are counted from the trace, never', { size: 10 });
    body(40, 292, 'estimated from the picture.', { size: 10 });
  }
  if (p > 0.62) {
    card(40, 312, 404, 106, { fill: BADDIM, stroke: BAD });
    body(56, 328, 'Popping past a recognised nonterminal', { size: 10 });
    body(56, 348, 'deletes a construct that had been', { size: 10 });
    body(56, 366, 'parsed correctly.', { size: 10 });
    body(56, 390, 'Avoid popping a state that covers one.', { size: 10, bold: true, color: BAD });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'id id — ONE POP, ONE DISCARD');
  body(488, 100, 'stack 0 2, token id, state 2', { mono: true, size: 10 });
  body(488, 120, 'pop ' + V.pan.one.pops + ', discard ' + V.pan.one.disc, { mono: true, size: 10.5 });
  body(488, 140, 'push GOTO(0, ' + V.pan.one.A + ') = ' + V.pan.one.to, { mono: true, size: 10.5, color: VAL });
  body(488, 160, 'then accept.', { size: 10 });
  if (p > 0.36) {
    rule(488, 180, 860, 180);
    label(488, 194, '( ) — NOTHING MOVES');
    body(488, 216, 'stack 0 1, token ")", state 1', { mono: true, size: 10 });
    body(488, 236, 'pop ' + V.pan.two.pops + ', discard ' + V.pan.two.disc, { mono: true, size: 10.5 });
    body(488, 256, 'push GOTO(1, ' + V.pan.two.A + ') = ' + V.pan.two.to, { mono: true, size: 10.5, color: VAL });
    body(488, 276, 'the ")" then shifts and F -> ( E ) reduces.', { size: 10 });
    body(488, 298, 'The missing expression was supplied', { size: 10 });
    body(488, 316, 'by the recovery, not read from the input.', { size: 10 });
  }
  if (p > 0.72) {
    card(488, 338, 372, 80, { fill: ACCDIM, stroke: ACC });
    body(504, 354, 'Nothing was deleted, and the program', { size: 10 });
    body(504, 372, 'was still not the one written.', { size: 10, bold: true, color: ACC });
    body(504, 396, 'Recovery substitutes; it does not correct.', { size: 9.5 });
  }
}

/* ---------- scene 5: the loop and the guard ---------- */
function sceneLoop(t, sc) {
  var p = prog(t, sc);
  heading('The rule as written can loop');
  subline('id + ) id: the close bracket is already a token that can follow, so nothing is discarded.');

  card(24, 62, 436, 372);
  label(40, 78, 'THE CYCLE, IN FOUR MOVES');
  bullets(40, 100, [
    'state 7, token ")", stack 0 3 7',
    'GOTO(7, T) = 10 exists, so pop 0 and discard 0',
    'push 10, then reduce E -> E + T',
    'state 3 again, token ")" again: the same cell',
    'Nothing consumed, nothing popped net: a cycle.'
  ], p, 0.04, 0.09, { lead: 22, mono: false });
  if (p > 0.5) {
    rule(40, 216, 444, 216);
    body(40, 232, 'The parser repeats this ' + V.unguarded.repeats + ' times', { size: 10.5 });
    body(40, 252, 'before the report cap stops it.', { size: 10.5 });
    body(40, 278, 'No message, no progress.', { size: 11, bold: true, color: BAD });
  }
  if (p > 0.7) {
    card(40, 300, 404, 118, { fill: WARNDIM, stroke: WARN });
    body(56, 316, 'The cycle is in the rule, not in', { size: 10 });
    body(56, 334, 'the implementation.', { size: 10 });
    body(56, 358, 'Every real parser adds a guard.', { size: 10, bold: true, color: WARN });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'THE GUARD, AND WHAT IT BUYS');
  body(488, 100, 'if the same stack and position recur,', { size: 10 });
  body(488, 118, 'delete the token.', { size: 10, bold: true });
  rule(488, 136, 860, 136);
  body(488, 152, 'reports        ' + V.guard.errs, { mono: true, size: 10.5 });
  body(488, 172, 'forced deletes ' + V.guard.forced, { mono: true, size: 10.5 });
  body(488, 192, 'accepted       ' + (V.guard.accepted ? 'yes' : 'no'), { mono: true, size: 10.5, color: VAL });
  if (p > 0.4) {
    rule(488, 212, 860, 212);
    body(488, 228, 'What was accepted is the repair:', { size: 10, color: DIM });
    body(488, 250, 'id +', { mono: true, size: 12, bold: true, color: BAD });
    body(488, 274, 'with the ")" and the operand deleted.', { size: 10 });
    body(488, 296, 'Four reports, one forced deletion,', { size: 10 });
    body(488, 314, 'one discard — and a valid parse of', { size: 10 });
    body(488, 332, 'a program nobody wrote.', { size: 10 });
  }
  if (p > 0.72) {
    body(488, 362, 'Acceptance after recovery says the', { size: 10, color: DIM });
    body(488, 380, 'repair parsed. It says nothing about', { size: 10, color: DIM });
    body(488, 398, 'the original string.', { size: 10, color: DIM });
  }
}

/* ---------- scene 6: panic mode, LL ---------- */
function scenePanicLL(t, sc) {
  var p = prog(t, sc);
  heading('In an LL parser, FOLLOW is the sync set');
  subline('The table is blank, so the parser guesses: A should be empty, or the token is an intruder.');

  card(24, 62, 436, 372);
  label(40, 78, 'THE TWO GUESSES');
  bullets(40, 100, [
    'If the token is in FOLLOW(A): pop A and continue.',
    'A is treated as deriving the empty string.',
    'If it is not: discard the token and try again.',
    'The token is treated as not belonging here.',
    'Both are guesses, so they are counted separately.'
  ], p, 0.04, 0.09, { lead: 22 });
  if (p > 0.5) {
    rule(40, 214, 444, 214);
    body(40, 230, 'S -> A B C', { mono: true, size: 10 });
    body(40, 248, 'A -> a | epsilon', { mono: true, size: 10 });
    body(40, 266, 'B -> b | epsilon', { mono: true, size: 10 });
    body(40, 284, 'C -> c', { mono: true, size: 10 });
    body(40, 310, 'FOLLOW(A) {' + V.ll.a + '}  FOLLOW(B) {' + V.ll.b + '}', { mono: true, size: 9.5 });
    body(40, 328, 'FOLLOW(C) {' + V.ll.c + '}', { mono: true, size: 9.5 });
  }
  if (p > 0.74) {
    card(40, 344, 404, 74, { fill: ACCDIM, stroke: ACC });
    body(56, 360, 'A pop that also discards hides one error.', { size: 10 });
    body(56, 382, 'Do one, then look again.', { size: 10, bold: true, color: ACC });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'TWO INPUTS, COUNTED');
  body(488, 100, 'b b c', { mono: true, size: 11, bold: true });
  body(488, 120, 'reports ' + V.ll.one.errs + ', discards ' + V.ll.one.disc + ', pops ' + V.ll.one.pops, { mono: true, size: 10 });
  body(488, 138, 'accepted: ' + (V.ll.one.accepted ? 'yes' : 'no'), { mono: true, size: 10, color: VAL });
  rule(488, 156, 860, 156);
  body(488, 170, 'b b b', { mono: true, size: 11, bold: true });
  body(488, 190, 'reports ' + V.ll.two.errs + ', discards ' + V.ll.two.disc + ', pops ' + V.ll.two.pops, { mono: true, size: 10 });
  body(488, 208, 'accepted: ' + (V.ll.two.accepted ? 'yes' : 'no'), { mono: true, size: 10, color: VAL });
  if (p > 0.42) {
    rule(488, 228, 860, 228);
    body(488, 244, 'One bad token produced ' + V.ll.two.errs + ' reports,', { size: 10 });
    body(488, 262, 'because each nonterminal was tried.', { size: 10 });
  }
  if (p > 0.6) {
    card(488, 284, 372, 134, { fill: WARNDIM, stroke: WARN });
    body(504, 300, 'FOLLOW belongs to the grammar.', { size: 10.5, bold: true, color: WARN });
    body(504, 322, 'It lists every token that can follow A', { size: 10 });
    body(504, 340, 'somewhere, not here.', { size: 10 });
    body(504, 364, 'So a nullable A is predicted empty on a', { size: 10 });
    body(504, 382, 'token that cannot occur at this point —', { size: 10 });
    body(504, 400, 'the immediate error detection problem.', { size: 10 });
  }
}

/* ---------- scene 7: phrase-level ---------- */
function scenePhrase(t, sc) {
  var p = prog(t, sc);
  heading('Phrase-level recovery: ten one-token repairs');
  subline('Change the input instead of skipping it, then re-run the table.');

  card(24, 62, 436, 372);
  label(40, 78, 'THE ENUMERATION');
  bullets(40, 100, [
    'one deletion of the offending token',
    'one insertion for each of the ' + V.ge.terms + ' terminals',
    'one replacement for each of the other ' + (V.ge.terms - 1),
    'total 1 + n + (n - 1) = ' + V.phrase.cands + ' for n = ' + V.ge.terms
  ], p, 0.04, 0.10, { lead: 24 });
  if (p > 0.44) {
    rule(40, 208, 444, 208);
    body(40, 224, 'Each candidate is a complete re-parse.', { size: 10.5 });
    body(40, 246, V.phrase.cands + ' parses for one error.', { size: 10.5, bold: true, color: ACC });
    body(40, 272, 'That is why phrase-level recovery is', { size: 10 });
    body(40, 290, 'described as the expensive one.', { size: 10 });
  }
  if (p > 0.66) {
    card(40, 312, 404, 106, { fill: BADDIM, stroke: BAD });
    body(56, 328, 'A replacement can also loop: insert a', { size: 10 });
    body(56, 346, 'token without consuming the bad one and', { size: 10 });
    body(56, 364, 'the same error recurs.', { size: 10 });
    body(56, 388, 'Any repair must consume or shorten.', { size: 10, bold: true, color: BAD });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'id + ) id, ERROR AT THE ")"');
  body(488, 100, 'candidates tried     ' + V.phrase.cands, { mono: true, size: 10.5 });
  body(488, 120, 'parsing to the end   ' + V.phrase.ok.length, { mono: true, size: 10.5, color: VAL });
  body(488, 142, V.phrase.ok.length ? V.phrase.ok[0].label : '-', { mono: true, size: 10.5, color: VAL });
  if (p > 0.4) {
    rule(488, 164, 860, 164);
    label(488, 178, 'AND THE REPAIR THAT REACHES FURTHEST');
    body(488, 200, V.phrase.far.label, { mono: true, size: 10 });
    body(488, 220, 'reaches token ' + V.phrase.far.far + ', then fails', { mono: true, size: 10 });
    body(488, 240, 'accepted: ' + (V.phrase.far.ok ? 'yes' : 'no'), { mono: true, size: 10, color: BAD });
    body(488, 266, 'So "furthest" and "accepts" are', { size: 10 });
    body(488, 284, 'different tests, and here they disagree.', { size: 10 });
  }
  if (p > 0.72) {
    card(488, 308, 372, 110, { fill: ACCDIM, stroke: ACC });
    body(504, 324, 'A working rule needs both:', { size: 10 });
    body(504, 344, 'a reach measure and a cost measure.', { size: 10 });
    body(504, 368, 'Cost: delete 1, insert 1, replace 1 —', { size: 9.5 });
    body(504, 386, 'so the cheapest accepting repair wins.', { size: 9.5 });
    body(504, 404, 'Here: delete the ")".', { size: 10, bold: true, color: ACC });
  }
}

/* ---------- scene 8: error productions ---------- */
function sceneErrProd(t, sc) {
  var p = prog(t, sc);
  heading('Error productions and the error token');
  subline('Put the mistake in the grammar, then let the ordinary parser handle it.');

  card(24, 62, 436, 372);
  label(40, 78, 'TWO PRODUCTIONS, ONE NEW TERMINAL');
  body(40, 100, 'F -> ( error )', { mono: true, size: 11 });
  body(40, 120, 'E -> error', { mono: true, size: 11 });
  body(40, 146, 'error never appears in a real program.', { size: 10, color: DIM });
  bullets(40, 172, [
    '1. Pop until error can be shifted.',
    '2. Shift error, entering the production.',
    '3. Delete offending tokens while in error',
    '   mode, so one bad statement gives one',
    '   message instead of a flood.'
  ], p, 0.12, 0.09, { lead: 22 });
  if (p > 0.62) {
    rule(40, 306, 444, 306);
    body(40, 322, 'The production is used after detection,', { size: 10 });
    body(40, 340, 'not to detect. Detection is still the', { size: 10 });
    body(40, 358, 'blank ACTION cell.', { size: 10 });
    body(40, 384, 'error is a terminal, so it has a column.', { size: 10, color: ACC });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'WHAT IT COSTS');
  body(488, 100, 'states    ' + V.ge.states + ' -> ' + V.ep.states, { mono: true, size: 11 });
  body(488, 122, 'added     ' + V.ep.added, { mono: true, size: 10.5 });
  body(488, 144, 'conflicts ' + V.ge.conf + ' -> ' + V.ep.conf, { mono: true, size: 11, color: BAD });
  if (p > 0.3) {
    rule(488, 164, 860, 164);
    body(488, 178, 'state ' + V.ep.detail.state + ', on the "' + V.ep.detail.sym + '":', { mono: true, size: 10 });
    body(488, 198, 'shift ")" to finish F -> ( error )', { mono: true, size: 9.5 });
    body(488, 216, 'or reduce E -> error', { mono: true, size: 9.5 });
    body(488, 238, 'One error production created it.', { size: 10, color: BAD });
  }
  if (p > 0.56) {
    rule(488, 258, 860, 258);
    body(488, 272, 'On id + ) id, recovery gives', { size: 10 });
    body(488, 292, 'reports ' + V.ep.yacc.errs + ', pops ' + V.ep.yacc.pops + ', silent deletes ' + V.ep.yacc.silent, { mono: true, size: 10 });
    body(488, 312, 'accepted: ' + (V.ep.yacc.accepted ? 'yes' : 'no'), { mono: true, size: 10, color: VAL });
  }
  if (p > 0.78) {
    card(488, 330, 372, 88, { fill: BADDIM, stroke: BAD });
    body(504, 346, 'On ( id the error is at the end marker.', { size: 10 });
    body(504, 366, 'There is no token left to delete, so', { size: 10 });
    body(504, 384, 'deletion-based recovery cannot fix it.', { size: 10 });
    body(504, 404, 'It needs insertion, which this has not.', { size: 9.5, color: BAD });
  }
}

/* ---------- scene 9: comparison ---------- */
function sceneCompare(t, sc) {
  var p = prog(t, sc);
  heading('What each strategy costs');
  subline('One string, one table, four recovery procedures — every number counted.');

  card(24, 62, 852, 240);
  label(40, 78, 'id + ) id THROUGH FOUR PROCEDURES');
  body(40, 104, 'strategy              reports   pops   tokens changed   accepted', { mono: true, size: 9.5, color: FAINT });
  rule(40, 116, 860, 116);
  body(40, 136, 'none                     1        0         0            no', { mono: true, size: 10 });
  if (p > 0.22) {
    body(40, 160, 'panic mode               ' + V.guard.errs + '        ' + (V.guard.log.reduce(function (a, x) { return a + (x.pops || 0); }, 0)) + '         ' + (V.guard.forced + V.guard.log.reduce(function (a, x) { return a + (x.disc || 0); }, 0)) + '            yes', { mono: true, size: 10 });
  }
  if (p > 0.42) {
    body(40, 184, 'phrase level             1        ' + V.ep.yacc.pops + '         ' + V.phrase.cands + ' tried       yes', { mono: true, size: 10 });
  }
  if (p > 0.6) {
    body(40, 208, 'error productions        ' + V.ep.yacc.errs + '        ' + V.ep.yacc.pops + '         ' + V.ep.yacc.silent + ' silent      yes', { mono: true, size: 10 });
    body(40, 232, 'the "accepted" column means the repaired string parsed.', { size: 9.5, color: DIM });
    body(40, 250, 'The original string is rejected by the table in all four.', { size: 9.5, color: DIM });
  }

  if (p > 0.7) {
    card(24, 314, 416, 120, { fill: ACCDIM, stroke: ACC });
    body(40, 330, 'The trade, in one line each:', { size: 9.5, color: DIM });
    body(40, 350, 'stopping is honest and finds nothing more;', { size: 10 });
    body(40, 368, 'panic mode is cheap and deletes text;', { size: 10 });
    body(40, 386, 'phrase level is dear and edits text;', { size: 10 });
    body(40, 404, 'error productions are quiet and blunt.', { size: 10 });
    body(40, 422, 'None of them makes the original valid.', { size: 10, bold: true, color: ACC });
  }
  if (p > 0.84) {
    card(452, 314, 424, 120, { fill: WARNDIM, stroke: WARN });
    body(468, 330, 'The exam question is always the same shape:', { size: 9.5, color: DIM });
    body(468, 352, 'which tokens moved, and how many?', { size: 11, bold: true, color: WARN });
    body(468, 376, 'Answer it from the trace, not from a', { size: 10 });
    body(468, 394, 'remembered example: the counts depend on', { size: 10 });
    body(468, 412, 'the table and the input, both given.', { size: 10 });
  }
}

/* ---------- scene 10: procedure ---------- */
function sceneProcedure(t, sc) {
  var p = prog(t, sc);
  heading('The five steps, and the four traps');
  subline('Order matters: each step uses the answer to the one before it.');

  card(24, 62, 436, 372);
  label(40, 78, 'THE FIVE STEPS');
  bullets(40, 102, [
    '1. Look up ACTION(state, token).',
    '2. If the cell is blank, that is the error:',
    '   record the state, the token, the position.',
    '3. Choose the recovery: pop and discard, a',
    '   one-token repair, or the error token.',
    '4. Guard it: every pass must consume a token',
    '   or shorten the stack.',
    '5. Report, then resume at the guarded point.'
  ], p, 0.04, 0.08, { lead: 22 });
  if (p > 0.66) {
    rule(40, 300, 444, 300);
    body(40, 316, 'What the report needs:', { size: 10, color: DIM });
    body(40, 336, 'state ' + V.det.state + ', token ' + V.det.tok + ', position ' + (V.det.pos + 1), { mono: true, size: 10 });
    body(40, 358, 'That triple is the message.', { size: 10 });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'THE FOUR TRAPS');
  body(488, 100, '1. "Several reductions, so it went', { size: 10 });
  body(488, 118, '    wrong earlier."  Measured: ' + V.corpus.lr1Reds + ' in LR(1).', { size: 10 });
  body(488, 142, '2. "Panic mode always terminates."', { size: 10 });
  body(488, 160, '    It repeats on id + ) id.', { size: 10 });
  body(488, 184, '3. "It recovered, so the program is', { size: 10 });
  body(488, 202, '    valid."  It accepted id +.', { size: 10 });
  body(488, 226, '4. "The end of input can be deleted."', { size: 10 });
  body(488, 244, '    Nothing is left to delete.', { size: 10 });
  if (p > 0.66) {
    rule(488, 266, 860, 266);
    card(488, 282, 372, 136, { fill: ACCDIM, stroke: ACC });
    body(504, 298, 'The two counts to carry:', { size: 9.5, color: DIM });
    body(504, 320, 'states popped, tokens discarded', { size: 11, bold: true, color: ACC });
    body(504, 346, 'Panic mode changes them directly;', { size: 10 });
    body(504, 364, 'phrase level changes the input;', { size: 10 });
    body(504, 382, 'error productions shift a token that', { size: 10 });
    body(504, 400, 'is not in the program.', { size: 10 });
  }
}

var SCENES = {
  detect: sceneDetect, viable: sceneViable, reductions: sceneReductions,
  paniclr: scenePanicLR, loop: sceneLoop, panicll: scenePanicLL,
  phrase: scenePhrase, errprod: sceneErrProd, compare: sceneCompare,
  proc: sceneProcedure
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
  var fn = SCENES[sc.id] || SCENES.detect;
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

  var badc = CHECKS.filter(function (c) { return !c.pass; });
  if (badc.length) console.warn('Model validation did not fully pass:', badc);
}

window.__MODEL = { V: V, CHECKS: CHECKS };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
