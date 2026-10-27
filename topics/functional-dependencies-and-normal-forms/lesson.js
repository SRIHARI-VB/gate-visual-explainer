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
   LAYER 1 - THE MODEL (functional dependencies, closure, keys, normal
   forms, decomposition). Pure data and pure functions. No drawing here.
   Every number the lesson quotes is computed here, and the checks at the
   end of this layer re-verify the computed values against the definitions.

   Attributes are single characters. An FD is {lhs:"AB", rhs:"C"}.
   A schema is {name, attrs:"ABCDE", fds:[...], nonAtomic:[...]}.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- attribute-set helpers ---------- */
function S(str) {
  /* an array is joined first: String(['A','B']) would give "A,B" and a stray comma */
  var s = (str && str.join) ? str.join('') : String(str);
  return s.split('').filter(function (c, i, a) { return a.indexOf(c) === i; }).sort();
}
function join(a) { return a.slice().sort().join(''); }
function sub(a, b) { return a.every(function (x) { return b.indexOf(x) >= 0; }); }
function union(a, b) { return S(join(a) + join(b)); }
function minus(a, b) { return a.filter(function (x) { return b.indexOf(x) < 0; }); }
function powerset(arr) {
  var out = [[]];
  for (var i = 0; i < arr.length; i++) {
    var n = out.length;
    for (var j = 0; j < n; j++) out.push(out[j].concat([arr[i]]));
  }
  return out;
}

/* the closure of an attribute set under F: start with X, and keep adding the
   right side of any FD whose left side is already inside, until a whole pass
   adds nothing */
function closure(X, F) {
  var have = S(join(X));
  var changed = true, passes = 0;
  while (changed && passes < 100) {
    changed = false;
    passes++;
    for (var i = 0; i < F.length; i++) {
      if (sub(S(F[i].lhs), have)) {
        var add = minus(S(F[i].rhs), have);
        if (add.length) { have = union(have, add); changed = true; }
      }
    }
  }
  return have;
}

function implies(F, X, Y) { return sub(S(Y), closure(S(X), F)); }
function isSuperkey(X, R, F) { return closure(X, F).length === S(R).length; }

/* every candidate key, by brute force: a subset whose closure is the whole
   schema, with no proper subset of it also closing to the whole schema */
function candidateKeys(R, F) {
  var all = S(R), subs = powerset(all), keys = [];
  subs.forEach(function (X) {
    if (X.length && isSuperkey(X, R, F)) {
      var minimal = !subs.some(function (Y) {
        return Y.length < X.length && sub(Y, X) && isSuperkey(Y, R, F);
      });
      if (minimal) keys.push(X);
    }
  });
  keys.sort(function (a, b) { return a.length - b.length || join(a).localeCompare(join(b)); });
  return keys;
}

function allSuperkeys(R, F) {
  return powerset(S(R)).filter(function (X) { return X.length && isSuperkey(X, R, F); });
}

function primeAttributes(R, F) {
  var out = [];
  candidateKeys(R, F).forEach(function (k) { out = union(out, k); });
  return out;
}

/* ---------- minimal cover ---------- */
function splitRHS(F) {
  var out = [];
  F.forEach(function (f) {
    S(f.rhs).forEach(function (a) { out.push({ lhs: join(S(f.lhs)), rhs: a }); });
  });
  return out;
}

function minimalCover(F) {
  var G = splitRHS(F);
  var changed = true;
  while (changed) {                        /* drop extraneous left-side attributes */
    changed = false;
    for (var i = 0; i < G.length && !changed; i++) {
      var L = S(G[i].lhs);
      for (var j = 0; j < L.length; j++) {
        var smaller = minus(L, [L[j]]);
        if (!smaller.length) continue;
        if (sub([G[i].rhs], closure(smaller, G))) {
          G[i] = { lhs: join(smaller), rhs: G[i].rhs };
          changed = true;
          break;
        }
      }
    }
  }
  changed = true;
  while (changed) {                        /* drop redundant dependencies */
    changed = false;
    for (var k = 0; k < G.length; k++) {
      var rest = G.slice(0, k).concat(G.slice(k + 1));
      if (sub([G[k].rhs], closure(S(G[k].lhs), rest))) { G = rest; changed = true; break; }
    }
  }
  G.sort(function (a, b) { return a.lhs.localeCompare(b.lhs) || a.rhs.localeCompare(b.rhs); });
  return G;
}

/* ---------- normal forms ---------- */
/* level: 0 not 1NF, 1 = 1NF, 2 = 2NF, 3 = 3NF, 4 = BCNF */
function normalForm(sch) {
  var R = sch.attrs, F = sch.fds;
  if (sch.nonAtomic && sch.nonAtomic.length) {
    return { level: 0, name: 'not 1NF', witness: 'attribute ' + sch.nonAtomic[0] + ' is set-valued' };
  }
  var mc = minimalCover(F), keys = candidateKeys(R, F), prime = primeAttributes(R, F), i;

  for (i = 0; i < mc.length; i++) {                     /* 2NF */
    var X = S(mc[i].lhs), A = mc[i].rhs;
    if (prime.indexOf(A) >= 0) continue;
    for (var k = 0; k < keys.length; k++) {
      var K = keys[k];
      if (sub(X, K) && X.length < K.length) {
        return { level: 1, name: '1NF',
          witness: mc[i].lhs + ' -> ' + A + ': ' + mc[i].lhs + ' is a proper subset of the key ' + join(K) };
      }
    }
  }
  for (i = 0; i < mc.length; i++) {                     /* 3NF */
    var X3 = S(mc[i].lhs), A3 = mc[i].rhs;
    if (!isSuperkey(X3, R, F) && prime.indexOf(A3) < 0) {
      return { level: 2, name: '2NF',
        witness: mc[i].lhs + ' -> ' + A3 + ': ' + mc[i].lhs + ' is not a superkey and ' + A3 + ' is not prime' };
    }
  }
  for (i = 0; i < mc.length; i++) {                     /* BCNF */
    var X4 = S(mc[i].lhs), A4 = mc[i].rhs;
    if (!isSuperkey(X4, R, F)) {
      return { level: 3, name: '3NF',
        witness: mc[i].lhs + ' -> ' + A4 + ': ' + mc[i].lhs + ' is not a superkey, but ' + A4 + ' is prime' };
    }
  }
  return { level: 4, name: 'BCNF', witness: 'every non-trivial FD has a superkey on the left' };
}

/* ---------- lossless join, by the chase ---------- */
function chase(fragments, R, F) {
  var cols = S(R);
  var t = fragments.map(function (frag, i) {
    return cols.map(function (c) { return frag.indexOf(c) >= 0 ? c : c + '_' + i; });
  });
  var changed = true, guard = 0;
  while (changed && guard++ < 200) {
    changed = false;
    for (var i = 0; i < F.length; i++) {
      var L = S(F[i].lhs), Y = S(F[i].rhs);
      var li = L.map(function (c) { return cols.indexOf(c); });
      for (var a = 0; a < t.length; a++) {
        for (var b = 0; b < t.length; b++) {
          if (a === b) continue;
          if (!li.every(function (ix) { return t[a][ix] === t[b][ix]; })) continue;
          for (var q = 0; q < Y.length; q++) {
            var ix = cols.indexOf(Y[q]);
            if (t[a][ix] !== t[b][ix]) {
              var keep = t[a][ix].length === 1 ? t[a][ix] : t[b][ix];
              if (t[a][ix] !== keep) { t[a][ix] = keep; changed = true; }
              if (t[b][ix] !== keep) { t[b][ix] = keep; changed = true; }
            }
          }
        }
      }
    }
  }
  return {
    lossless: t.some(function (row) { return row.every(function (v) { return v.length === 1; }); }),
    tableau: t
  };
}

function losslessTwo(f1, f2, R, F) {
  var shared = f1.filter(function (c) { return f2.indexOf(c) >= 0; });
  if (!shared.length) return false;
  var cl = closure(shared, F);
  return sub(S(f1), cl) || sub(S(f2), cl);
}

/* ---------- dependency preservation ---------- */
function projectFDs(frag, F) {
  var out = [];
  powerset(S(frag)).forEach(function (X) {
    if (!X.length) return;
    var Y = minus(closure(X, F).filter(function (c) { return frag.indexOf(c) >= 0; }), X);
    if (Y.length) out.push({ lhs: join(X), rhs: join(Y) });
  });
  return out;
}

function isDP(fragments, F) {
  var G = [];
  fragments.forEach(function (frag) { G = G.concat(projectFDs(frag, F)); });
  return F.every(function (f) { return sub(S(f.rhs), closure(S(f.lhs), G)); });
}

function fdHome(fd, fragments) {
  var need = union(S(fd.lhs), S(fd.rhs));
  for (var i = 0; i < fragments.length; i++) if (sub(need, S(fragments[i]))) return i;
  return -1;
}

/* ---------- every set partition into two or more blocks ---------- */
function setPartitions(arr) {
  if (!arr.length) return [[]];
  var first = arr[0], rest = arr.slice(1), out = [];
  setPartitions(rest).forEach(function (p) {
    for (var i = 0; i < p.length; i++) {
      var q = p.map(function (b) { return b.slice(); });
      q[i] = [first].concat(q[i]);
      out.push(q);
    }
    out.push([[first]].concat(p.map(function (b) { return b.slice(); })));
  });
  return out;
}

function analyseDecomposition(R, F, fragments) {
  var parts = fragments.map(function (f) { return S(f); });
  var allBCNF = parts.every(function (p) {
    return normalForm({ attrs: join(p), fds: projectFDs(p, F) }).level === 4;
  });
  var ch = chase(parts, R, F);
  return {
    fragments: parts.map(join),
    allBCNF: allBCNF,
    lossless: ch.lossless,
    dp: isDP(parts, F),
    good: allBCNF && ch.lossless && isDP(parts, F)
  };
}

/* ======================================================================
   LAYER 2 - THE INSTANCES AND THE VALIDATION
   ====================================================================== */

/* the running schema: GATE CSE 2022, the superkey count */
var R22 = { attrs: 'ABCDE', fds: [
  { lhs: 'AB', rhs: 'C' }, { lhs: 'BC', rhs: 'D' }, { lhs: 'C', rhs: 'E' }
] };

/* GATE CSE 2018 Q42, the four schemas. R = rollno, C = courseid,
   E = email, M = marks, G = grade, r = credit. */
var S18_I   = { name: 'Schema I',   attrs: 'RC',   nonAtomic: ['C'], fds: [{ lhs: 'R', rhs: 'C' }] };
var S18_II  = { name: 'Schema II',  attrs: 'RCE',  fds: [{ lhs: 'RC', rhs: 'E' }, { lhs: 'E', rhs: 'R' }] };
var S18_III = { name: 'Schema III', attrs: 'RCMG', fds: [{ lhs: 'RC', rhs: 'MG' }, { lhs: 'M', rhs: 'G' }] };
var S18_IV  = { name: 'Schema IV',  attrs: 'RCCr', fds: [{ lhs: 'RC', rhs: 'r' }, { lhs: 'C', rhs: 'r' }] };

/* GATE CSE 2004 Q37: N = Name, C = CourseNo, R = RollNo, G = Grade */
var S04 = { name: 'studentPerformance', attrs: 'NCRG', fds: [
  { lhs: 'NC', rhs: 'G' }, { lhs: 'RC', rhs: 'G' }, { lhs: 'N', rhs: 'R' }, { lhs: 'R', rhs: 'N' }
] };

/* GATE CSE 2008 Q69: T = Title, A = Author, C = Catalog_no,
   P = Publisher, Y = Year, r = Price */
var S08_Book = { name: 'Book', attrs: 'TACPYPr', fds: [
  { lhs: 'TA', rhs: 'C' }, { lhs: 'C', rhs: 'TAPY' }, { lhs: 'PTY', rhs: 'r' }
] };
var S08_Coll = { name: 'Collection', attrs: 'TAC', fds: [
  { lhs: 'TA', rhs: 'C' }, { lhs: 'C', rhs: 'TA' }
] };

/* GATE CSE 2001, the two decomposition questions */
var R01a = { attrs: 'ABCD', fds: [{ lhs: 'A', rhs: 'B' }, { lhs: 'C', rhs: 'D' }] };
var R01b = { attrs: 'ABCD', fds: [{ lhs: 'AB', rhs: 'C' }, { lhs: 'C', rhs: 'AD' }] };

/* ---------- the checks ---------- */
chk('closure of AB on R(A..E) with AB->C, BC->D, C->E is ABCDE',
  join(closure(S('AB'), R22.fds)) === 'ABCDE', join(closure(S('AB'), R22.fds)));
chk('AB is the only candidate key of R22',
  candidateKeys('ABCDE', R22.fds).length === 1 && join(candidateKeys('ABCDE', R22.fds)[0]) === 'AB');
chk('R22 has 8 superkeys, which is 2 to the power of 5 minus 2',
  allSuperkeys('ABCDE', R22.fds).length === 8, allSuperkeys('ABCDE', R22.fds).length);
chk('closure of E is E, and of C is CE, so neither is a key',
  join(closure(S('E'), R22.fds)) === 'E' && join(closure(S('C'), R22.fds)) === 'CE',
  join(closure(S('E'), R22.fds)) + ' / ' + join(closure(S('C'), R22.fds)));
chk('R22 is only in 2NF: BC -> D has a non-superkey on the left and D is not prime',
  normalForm(R22).level === 2, normalForm(R22).name);

chk('GATE 2018 Schema I is not even in 1NF', normalForm(S18_I).level === 0);
chk('GATE 2018 Schema II is in 3NF but not BCNF', normalForm(S18_II).level === 3, normalForm(S18_II).name);
chk('GATE 2018 Schema II has candidate keys RC and CE',
  candidateKeys('RCE', S18_II.fds).map(join).sort().join('|') === 'CE|CR',
  candidateKeys('RCE', S18_II.fds).map(join).join('|'));
chk('GATE 2018 Schema III is only in 2NF', normalForm(S18_III).level === 2, normalForm(S18_III).name);
chk('GATE 2018 Schema IV is only in 1NF', normalForm(S18_IV).level === 1, normalForm(S18_IV).name);

chk('GATE 2004 studentPerformance is in 3NF, not BCNF',
  normalForm(S04).level === 3, normalForm(S04).name);
chk('GATE 2004 studentPerformance has candidate keys NC and RC',
  candidateKeys('NCRG', S04.fds).map(join).sort().join('|') === 'CN|CR',
  candidateKeys('NCRG', S04.fds).map(join).join('|'));
chk('GATE 2004 prime attributes are N, C, R, and G is non-prime',
  join(primeAttributes('NCRG', S04.fds)) === 'CNR', join(primeAttributes('NCRG', S04.fds)));

chk('GATE 2008 Book is in 2NF only', normalForm(S08_Book).level === 2, normalForm(S08_Book).name);
chk('GATE 2008 Collection is in BCNF', normalForm(S08_Coll).level === 4, normalForm(S08_Coll).name);
chk('GATE 2008 Book has candidate keys TA and C',
  candidateKeys('TACPYPr', S08_Book.fds).map(join).sort().join('|') === 'AT|C',
  candidateKeys('TACPYPr', S08_Book.fds).map(join).join('|'));

chk('GATE 2001 A->B, C->D split into AB and CD preserves both dependencies',
  isDP([S('AB'), S('CD')], R01a.fds) === true);
chk('... and is not lossless: the fragments share no attribute',
  chase([S('AB'), S('CD')], 'ABCD', R01a.fds).lossless === false);
chk('... and the two-fragment rule agrees', losslessTwo(S('AB'), S('CD'), 'ABCD', R01a.fds) === false);

var dec01b = analyseDecomposition('ABCD', R01b.fds, ['ABC', 'CD']);
chk('GATE 2001 AB->C, C->AD: R1(ABC), R2(CD) is lossless', dec01b.lossless === true);
chk('... and dependency preserving, because C -> A survives inside R1(ABC)', dec01b.dp === true);
chk('... but R1(ABC) is not in BCNF, so the decomposition is not all-BCNF', dec01b.allBCNF === false);

var parts4 = setPartitions(S('ABCD'));
var parts01 = parts4.filter(function (p) { return p.length >= 2; });
var search01b = parts01.map(function (p) {
  return analyseDecomposition('ABCD', R01b.fds, p.map(join));
});
chk('there are 15 set partitions of 4 attributes, 14 of them into 2 or more blocks',
  parts4.length === 15 && parts01.length === 14, parts4.length + '/' + parts01.length);
chk('no partition of ABCD is BCNF, lossless and dependency preserving for {AB->C, C->AD}',
  search01b.filter(function (r) { return r.good; }).length === 0,
  'found ' + search01b.filter(function (r) { return r.good; }).length);

var search01a = parts01.map(function (p) {
  return analyseDecomposition('ABCD', R01a.fds, p.map(join));
}).filter(function (r) { return r.allBCNF; });
chk('for {A->B, C->D}: 10 partitions are all-BCNF, only AB|CD preserves both FDs, none is lossless',
  search01a.length === 10 &&
  search01a.filter(function (r) { return r.dp; }).length === 1 &&
  search01a.filter(function (r) { return r.dp; })[0].fragments.join('|') === 'AB|CD' &&
  search01a.every(function (r) { return !r.lossless; }),
  search01a.map(function (r) { return r.fragments.join('|'); }).join(' ; '));

chk('minimal cover of {AB->C, C->AD} is AB->C, C->A, C->D',
  minimalCover(R01b.fds).map(function (f) { return f.lhs + '->' + f.rhs; }).join(',') === 'AB->C,C->A,C->D',
  minimalCover(R01b.fds).map(function (f) { return f.lhs + '->' + f.rhs; }).join(','));
chk('minimal cover of {A->B, C->D} is itself',
  minimalCover(R01a.fds).map(function (f) { return f.lhs + '->' + f.rhs; }).join(',') === 'A->B,C->D');

/* GATE 2005 Q30: r, its two projections, and the join */
var R05 = [['1', '2', '3', '3'], ['1', '5', '3', '4']];
function pi(rows, cols, keep) {
  var ix = keep.map(function (c) { return cols.indexOf(c); });
  var seen = {}, out = [];
  rows.forEach(function (r) {
    var t = ix.map(function (i) { return r[i]; }), k = t.join('|');
    if (!seen[k]) { seen[k] = 1; out.push(t); }
  });
  return out;
}
function natJoin(a, ac, b, bc) {
  var shared = ac.filter(function (c) { return bc.indexOf(c) >= 0; });
  var out = [];
  a.forEach(function (ra) {
    b.forEach(function (rb) {
      if (!shared.every(function (c) { return ra[ac.indexOf(c)] === rb[bc.indexOf(c)]; })) return;
      var row = [];
      ac.forEach(function (c) { row.push(ra[ac.indexOf(c)]); });
      bc.forEach(function (c) { if (shared.indexOf(c) < 0) row.push(rb[bc.indexOf(c)]); });
      out.push(row);
    });
  });
  return out;
}
var r1_05 = pi(R05, 'ABCD', S('ABC'));
var r2_05 = pi(R05, 'ABCD', S('AD'));
var s_05 = natJoin(r1_05, S('ABC'), r2_05, S('AD'));
chk('GATE 2005: r has 2 rows, each projection has 2, and the join has 4',
  R05.length === 2 && r1_05.length === 2 && r2_05.length === 2 && s_05.length === 4, s_05.length);
chk('GATE 2005: r is a subset of the join, which is therefore strictly larger',
  R05.every(function (r) {
    return s_05.some(function (x) { return x.join('|') === r.join('|'); });
  }) && s_05.length > R05.length);

chk('reflexivity: X -> X holds for every subset of the schema',
  powerset(S('ABC')).every(function (X) { return implies(R22.fds, X, X); }));
chk('augmentation: AB -> C implies ABD -> CD', implies(R22.fds, 'ABD', 'CD') === true);
chk('transitivity: AB -> C and C -> E give AB -> E', implies(R22.fds, 'AB', 'E') === true);
chk('a schema with only trivial FDs is in BCNF',
  normalForm({ attrs: 'AB', fds: [{ lhs: 'AB', rhs: 'A' }] }).level === 4);
chk('every binary schema is in BCNF',
  normalForm({ attrs: 'AB', fds: [{ lhs: 'A', rhs: 'B' }] }).level === 4 &&
  normalForm({ attrs: 'AB', fds: [{ lhs: 'A', rhs: 'B' }, { lhs: 'B', rhs: 'A' }] }).level === 4);

/* the values the scenes print, computed once so the picture cannot drift */
var V = {
  keys22: candidateKeys('ABCDE', R22.fds).map(join),
  supers22: allSuperkeys('ABCDE', R22.fds).map(join),
  primes04: join(primeAttributes('NCRG', S04.fds)),
  keys04: candidateKeys('NCRG', S04.fds).map(join),
  good01b: search01b.filter(function (r) { return r.good; }).length,
  parts01: parts01.length,
  joinRows05: s_05.length
};

/* ======================================================================
   LAYER 3 - RENDER. Reads the model; never re-derives it.
   ====================================================================== */

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function rv(t, a, d) { return clamp01((t - a) / (d || 1)); }
function ease(v) { return v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2; }

function txt(x, y, s, o) { P.text(x, y, s, o || {}); }

function wrap(s, max) {
  var words = String(s).split(' '), lines = [], cur = '';
  words.forEach(function (w) {
    if ((cur + ' ' + w).trim().length > max) { if (cur) lines.push(cur); cur = w; }
    else cur = (cur ? cur + ' ' : '') + w;
  });
  if (cur) lines.push(cur);
  return lines;
}

function para(x, y, s, max, o) {
  o = o || {};
  var lines = wrap(s, max), lh = o.lh || 17;
  lines.forEach(function (l, i) {
    txt(x, y + i * lh, l, { size: o.size || 13, color: o.color || PAL.dim, mono: !!o.mono });
  });
  return y + lines.length * lh;
}

function box(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill, stroke: o.stroke, sw: o.sw || 1.4, radius: o.radius === undefined ? 8 : o.radius, dash: o.dash });
}

function chip(x, y, w, h, label, o) {
  o = o || {};
  box(x, y, w, h, { fill: o.fill || PAL.surface2, stroke: o.stroke || PAL.border, radius: 6, sw: o.sw || 1.2 });
  txt(x + w / 2, y + h / 2, label, {
    mono: o.mono !== false, size: o.size || 13, bold: !!o.bold,
    align: 'center', base: 'middle', color: o.color || PAL.ink
  });
}

function attrPill(x, y, letter, o) {
  o = o || {};
  var r = o.r || 15;
  P.circle(x, y, r, { fill: o.fill || PAL.surface2, stroke: o.stroke || PAL.border, sw: o.sw || 1.4 });
  txt(x, y, letter, { mono: true, size: o.size || 14, bold: true, align: 'center', base: 'middle', color: o.color || PAL.ink });
}

function label(x, y, s, o) {
  o = o || {};
  txt(x, y, s, { size: o.size || 11, mono: true, color: o.color || PAL.faint, bold: !!o.bold });
}

function head(s, sub) {
  txt(40, 22, s, { size: 17, bold: true, color: PAL.ink });
  if (sub) txt(40, 44, sub, { size: 12, mono: true, color: PAL.faint });
  P.line(40, 58, W - 40, 58, { stroke: PAL.border, sw: 1 });
}

function bg() {
  P.rect(0, 0, W, H, { fill: PAL.surface });
  P.rect(0, 0, W, 4, { fill: PAL.accent });
}

function table(x, y, cols, rows, o) {
  o = o || {};
  var cw = o.cw || 54, rh = o.rh || 26, w = cols.length * cw;
  box(x, y, w, rh, { fill: PAL.surface2, stroke: PAL.border, radius: 4 });
  cols.forEach(function (c, i) {
    txt(x + i * cw + cw / 2, y + rh / 2, c, { mono: true, size: 13, bold: true, align: 'center', base: 'middle', color: PAL.ink });
  });
  rows.forEach(function (r, ri) {
    var ry = y + rh * (ri + 1);
    var rf = (o.rowFill && o.rowFill[ri]) || PAL.surface;
    box(x, ry, w, rh, { fill: rf, stroke: PAL.border, radius: 4, sw: 1 });
    r.forEach(function (v, ci) {
      var cc = (o.cellColor && o.cellColor[ri] && o.cellColor[ri][ci]) || PAL.ink;
      txt(x + ci * cw + cw / 2, ry + rh / 2, v, { mono: true, size: 13, align: 'center', base: 'middle', color: cc });
    });
  });
  return { w: w, h: rh * (rows.length + 1) };
}

function stamp(x, y, text, colour, o) {
  o = o || {};
  var w = o.w || 96, h = o.h || 24;
  box(x, y, w, h, { fill: o.fill || PAL.surface, stroke: colour, sw: 1.6, radius: 4, dash: o.dash });
  txt(x + w / 2, y + h / 2, text, { size: o.size || 11, mono: true, bold: true, align: 'center', base: 'middle', color: colour });
}

/* ---------------- scene 1: what an FD asserts ---------------- */
function scFd(t) {
  head('A functional dependency is a promise about every legal instance',
    'X -> Y  :  two rows that agree on X must agree on Y');

  var rows = [['1', '7', 'a'], ['1', '7', 'b'], ['2', '9', 'a']];
  var a = rv(t, 0, 1.2);
  P.alpha(a);
  table(70, 96, ['A', 'B', 'C'], rows, { cw: 60, rh: 28 });
  label(70, 84, 'one printed instance  R(A,B,C)');
  P.alpha(1);

  /* the A column, then the arrow A -> B */
  var ca = rv(t, 1.4, 1.0);
  if (ca > 0) {
    P.alpha(ca * 0.22);
    P.rect(70, 124, 60, 84, { fill: PAL.accent });
    P.alpha(1);
    P.arrow(104, 218, 156, 218, { stroke: PAL.accent, sw: 2, head: 9 });
    txt(130, 230, 'A -> B', { mono: true, size: 13, bold: true, align: 'center', color: PAL.accent });
  }

  /* the pair that agrees on A therefore agrees on B */
  var pa = rv(t, 7.5, 1.0);
  if (pa > 0) {
    P.alpha(pa);
    box(330, 96, 250, 62, { fill: PAL.accentDim, stroke: PAL.accent, radius: 8 });
    txt(344, 110, 'rows 1 and 2', { size: 12, mono: true, color: PAL.accent });
    txt(344, 130, 'A = 1 and A = 1  ->  B = 7 and B = 7', { mono: true, size: 12, color: PAL.ink });
    txt(330, 172, 'agreeing on A forces agreement on B', { size: 12, color: PAL.dim });
    P.alpha(1);
  }

  /* the accident: another instance where C happens to be constant */
  var ac = rv(t, 15, 1.0);
  if (ac > 0) {
    P.alpha(ac);
    table(330, 206, ['A', 'B', 'C'], [['1', '7', 'a'], ['2', '9', 'a'], ['3', '4', 'a']], { cw: 58, rh: 26 });
    label(330, 194, 'a different instance, same schema');
    P.line(404, 330, 404, 356, { stroke: PAL.warn, sw: 1.6, dash: [4, 4] });
    txt(414, 340, 'C is constant here - but C -> B is not implied', { size: 12, color: PAL.warn });
    P.alpha(1);
  }

  var cc = rv(t, 22, 1.0);
  if (cc > 0) {
    P.alpha(cc);
    box(614, 96, 246, 150, { fill: PAL.warnDim, stroke: PAL.warn, radius: 8 });
    txt(628, 112, 'given, not discovered', { size: 12, mono: true, bold: true, color: PAL.warn });
    para(628, 134, 'A dependency set is part of the schema. A table can refute a candidate dependency; it can never establish one.', 32, { size: 12 });
    P.alpha(1);
  }

  if (t > 22) {
    P.alpha(rv(t, 24, 1));
    txt(40, 396, 'Direction matters:  A -> B  says nothing about  B -> A.', { size: 13, bold: true, color: PAL.ink });
    txt(40, 418, 'The right side is what gets forced. Equal values on the right are not evidence for anything.', { size: 12, color: PAL.dim });
    P.alpha(1);
  }
}

/* ---------------- scene 2: Armstrong's axioms ---------------- */
function scArm(t) {
  head('Three rules generate every consequence of a set of FDs',
    'sound and complete: nothing else is needed');

  var cards = [
    { a: 0, title: 'Reflexivity', body: 'if Y is inside X, then X -> Y', ex: 'AB -> A' },
    { a: 8, title: 'Augmentation', body: 'X -> Y gives XZ -> YZ', ex: 'A -> B gives AC -> BC' },
    { a: 15, title: 'Transitivity', body: 'X -> Y and Y -> Z give X -> Z', ex: 'A -> B, B -> C give A -> C' }
  ];
  cards.forEach(function (c, i) {
    var p = rv(t, c.a, 1.0);
    if (p <= 0) return;
    var x = 40 + i * 276;
    P.alpha(p);
    box(x, 84, 258, 118, { fill: PAL.surface, stroke: PAL.border, radius: 8 });
    txt(x + 14, 100, (i + 1) + '. ' + c.title, { size: 14, bold: true, color: PAL.accent });
    para(x + 14, 124, c.body, 30, { size: 12 });
    txt(x + 14, 168, c.ex, { mono: true, size: 12, color: PAL.ink });
    P.alpha(1);
  });

  /* the chain */
  var ch = rv(t, 22, 1.0);
  if (ch > 0) {
    P.alpha(ch);
    label(40, 226, 'chaining on the dependency set  { A -> B,  B -> C,  C -> D }');
    var xs = [90, 250, 410, 570];
    var ls = ['A', 'B', 'C', 'D'];
    ls.forEach(function (l, i) {
      attrPill(xs[i], 268, l, { r: 20, fill: PAL.accentDim, stroke: PAL.accent, size: 16 });
      if (i < 3) {
        P.arrow(xs[i] + 24, 268, xs[i + 1] - 24, 268, { stroke: PAL.accent, sw: 2 });
        txt((xs[i] + xs[i + 1]) / 2, 250, ls[i] + ' -> ' + ls[i + 1], { mono: true, size: 11, align: 'center', color: PAL.accent });
      }
    });
    var d = rv(t, 26, 1.0);
    if (d > 0) {
      P.alpha(d);
      P.arrow(xs[0], 296, xs[3], 296, { stroke: PAL.valid, sw: 2, head: 11 });
      txt((xs[0] + xs[3]) / 2, 306, 'so A -> D, which was never written down', { size: 12, mono: true, align: 'center', color: PAL.valid });
      P.alpha(1);
    }
    P.alpha(1);
  }

  var sh = rv(t, 26, 1.0);
  if (sh > 0) {
    P.alpha(sh);
    box(640, 216, 220, 112, { fill: PAL.surface2, stroke: PAL.border, radius: 8 });
    txt(654, 230, 'the three shortcuts', { size: 12, mono: true, bold: true, color: PAL.ink });
    txt(654, 252, 'union', { size: 11, mono: true, color: PAL.dim });
    txt(654, 270, 'decomposition', { size: 11, mono: true, color: PAL.dim });
    txt(654, 288, 'pseudotransitivity', { size: 11, mono: true, color: PAL.dim });
    txt(654, 310, 'each is a theorem', { size: 11, color: PAL.faint });
    P.alpha(1);
  }

  if (t > 22) {
    P.alpha(rv(t, 26, 1));
    box(40, 340, 820, 62, { fill: PAL.warnDim, stroke: PAL.warn, radius: 8 });
    txt(54, 356, 'the one invalid move', { size: 12, mono: true, bold: true, color: PAL.warn });
    txt(54, 378, 'Decomposition splits the RIGHT side.  AB -> C does not give A -> C: splitting the left side is not one of the axioms.',
      { size: 12, color: PAL.ink });
    P.alpha(1);
  }
}

/* ---------------- scene 3: closure ---------------- */
function scClo(t) {
  head('Closure: what one attribute set forces',
    'R(A,B,C,D,E)   AB -> C,   BC -> D,   C -> E');

  var attrs = ['A', 'B', 'C', 'D', 'E'];
  var fds = ['AB -> C', 'BC -> D', 'C -> E'];
  label(40, 84, 'the dependency set');
  fds.forEach(function (f, i) {
    var p = rv(t, i * 0.4, 0.8);
    P.alpha(p);
    chip(40, 94 + i * 36, 108, 28, f, { fill: PAL.surface2, mono: true, size: 12 });
    P.alpha(1);
  });

  /* which passes have happened */
  var pass = t < 8 ? 0 : t < 15 ? 1 : t < 22 ? 2 : 3;
  var closed = ['A', 'B'];
  var fired = [];
  if (pass >= 1) { closed.push('C'); fired.push('AB -> C'); }
  if (pass >= 2) { closed.push('D'); fired.push('BC -> D'); }
  if (pass >= 3) { closed.push('E'); fired.push('C -> E'); }

  label(40, 216, 'the closure of  AB');
  attrs.forEach(function (a, i) {
    var x = 190 + i * 74, y = 244;
    var inSet = closed.indexOf(a) >= 0;
    var fresh = inSet && ((a === 'C' && t >= 8) || (a === 'D' && t >= 15) || (a === 'E' && t >= 22));
    var pop = fresh ? rv(t, a === 'C' ? 8 : a === 'D' ? 15 : 22, 0.6) : 1;
    attrPill(x, y, a, {
      r: 22 + (fresh ? 3 * (1 - pop) : 0),
      fill: inSet ? PAL.accentDim : PAL.surface,
      stroke: inSet ? PAL.accent : PAL.border,
      color: inSet ? PAL.accent : PAL.faint,
      size: 17, sw: inSet ? 2 : 1.2
    });
  });

  txt(40, 292, 'held:  ' + closed.join(''), { mono: true, size: 15, bold: true, color: PAL.accent });
  txt(40, 316, 'pass ' + pass + ' of 3', { mono: true, size: 12, color: PAL.faint });

  if (fired.length) {
    label(40, 348, 'dependencies that have fired');
    fired.forEach(function (f, i) {
      txt(40, 366 + i * 20, '- ' + f, { mono: true, size: 12, color: PAL.valid });
    });
  }

  if (t >= 22) {
    P.alpha(rv(t, 22, 1));
    box(470, 84, 390, 108, { fill: PAL.accentDim, stroke: PAL.accent, radius: 8 });
    txt(486, 100, 'closure(AB) = ABCDE', { mono: true, size: 16, bold: true, color: PAL.accent });
    para(486, 126, 'The closure is the whole schema, which is exactly the definition of a superkey. A fourth pass adds nothing, so the computation stops here.',
      46, { size: 12 });
    P.alpha(1);
  }

  if (t >= 15 && t < 22) {
    box(470, 84, 390, 78, { fill: PAL.surface, stroke: PAL.border, radius: 8 });
    txt(486, 100, 'why BC -> D could not fire earlier', { size: 12, bold: true, color: PAL.ink });
    para(486, 122, 'It needs both B and C. Holding C alone, as the closure of C, gives only CE.', 44, { size: 12 });
  }

  if (t < 8) {
    box(470, 84, 390, 78, { fill: PAL.surface, stroke: PAL.border, radius: 8 });
    txt(486, 100, 'start with the set itself', { size: 12, bold: true, color: PAL.ink });
    para(486, 122, 'The closure of AB begins as A and B. Forgetting that makes every closure one attribute short.', 44, { size: 12 });
  }
}

/* ---------------- scene 4: keys ---------------- */
function scKeys(t) {
  head('Candidate key, superkey, and the count',
    'GATE CSE 2022:  R(A,B,C,D,E)   AB -> C,  BC -> D,  C -> E');

  var all = powerset(S('ABCDE')).filter(function (x) { return x.length; });
  all.sort(function (a, b) { return a.length - b.length || join(a).localeCompare(join(b)); });

  var show = rv(t, 0, 0.8);
  P.alpha(show);
  label(40, 84, 'all 32 non-empty subsets, tested by closure');
  all.forEach(function (x, i) {
    var col = i % 8, row = Math.floor(i / 8);
    var x0 = 40 + col * 80, y0 = 96 + row * 34;
    var sup = sub(S('AB'), x);
    var isKey = join(x) === 'AB';
    var fill = isKey ? PAL.accentDim : sup ? PAL.surface2 : PAL.surface;
    var stroke = isKey ? PAL.valid : sup ? PAL.accent : PAL.border;
    var colour = isKey ? PAL.valid : sup ? PAL.ink : PAL.faint;
    chip(x0, y0, 72, 26, join(x), { fill: fill, stroke: stroke, color: colour, size: 12, bold: sup, sw: isKey ? 2 : 1.2 });
  });
  P.alpha(1);

  /* the count */
  var c = rv(t, 7, 1.0);
  if (c > 0) {
    P.alpha(c);
    box(700, 96, 160, 120, { fill: PAL.surface2, stroke: PAL.border, radius: 8 });
    txt(714, 112, 'superkeys', { size: 11, mono: true, color: PAL.faint });
    txt(714, 130, String(V.supers22.length), { size: 30, bold: true, color: PAL.accent });
    txt(714, 168, '2^3 = 8', { mono: true, size: 12, color: PAL.dim });
    txt(714, 188, 'AB plus any of C D E', { size: 11, color: PAL.faint });
    P.alpha(1);
  }

  var k = rv(t, 14, 1.0);
  if (k > 0) {
    P.alpha(k);
    box(700, 232, 160, 90, { fill: PAL.accentDim, stroke: PAL.valid, radius: 8, sw: 2 });
    txt(714, 248, 'candidate keys', { size: 11, mono: true, color: PAL.faint });
    txt(714, 266, 'AB', { size: 26, bold: true, color: PAL.valid, mono: true });
    txt(714, 300, 'the only minimal one', { size: 11, color: PAL.dim });
    P.alpha(1);
  }

  /* the tempting single attributes */
  var e = rv(t, 22, 1.0);
  if (e > 0) {
    P.alpha(e);
    label(40, 258, 'the tempting single attributes');
    [['E', 'E', 'not a key'], ['C', 'CE', 'not a key']].forEach(function (row, i) {
      var y = 272 + i * 40;
      chip(40, y, 34, 28, row[0], { mono: true, size: 13, bold: true });
      txt(84, y + 8, '+', { size: 13, color: PAL.faint });
      chip(104, y, 70, 28, row[1], { mono: true, size: 13 });
      txt(186, y + 8, row[2], { size: 12, color: PAL.invalid });
    });
    P.alpha(1);
  }

  var m = rv(t, 14, 1.0);
  if (m > 0) {
    P.alpha(m);
    box(40, 344, 820, 66, { fill: PAL.warnDim, stroke: PAL.warn, radius: 8 });
    txt(54, 358, 'The exponent is the number of attributes OUTSIDE the key:  5 - 2 = 3, so 2^3 = 8.', { size: 12, color: PAL.ink });
    txt(54, 380, 'A superkey need not be minimal; a candidate key is a superkey with nothing removable.', { size: 12, color: PAL.ink });
    P.alpha(1);
  }
}

/* ---------------- scene 5: 1NF and 2NF ---------------- */
function scNf2(t) {
  head('1NF and 2NF: atomic values, and no partial dependency',
    'GATE CSE 2018 Q42, Schemas I, III and IV');

  /* Schema I */
  var p1 = rv(t, 0, 1.0);
  if (p1 > 0) {
    P.alpha(p1);
    box(40, 84, 400, 118, { fill: PAL.surface, stroke: PAL.border, radius: 8 });
    txt(54, 100, 'Schema I', { size: 13, bold: true, color: PAL.ink });
    txt(54, 122, 'Registration(rollno, courses)', { mono: true, size: 12, color: PAL.dim });
    txt(54, 146, 'courses holds a SET of courses', { size: 12, color: PAL.ink });
    txt(54, 168, 'rollno -> courses', { mono: true, size: 12, color: PAL.accent });
    P.alpha(1);
  }
  var s1 = rv(t, 6, 1.0);
  if (s1 > 0) {
    P.alpha(s1);
    stamp(346, 96, 'not 1NF', PAL.invalid, { w: 82 });
    P.alpha(1);
  }

  /* Schema IV */
  var p4 = rv(t, 7, 1.0);
  if (p4 > 0) {
    P.alpha(p4);
    box(470, 84, 390, 118, { fill: PAL.surface, stroke: PAL.border, radius: 8 });
    txt(484, 100, 'Schema IV', { size: 13, bold: true, color: PAL.ink });
    txt(484, 122, 'Registration(rollno, courseid, credit)', { mono: true, size: 12, color: PAL.dim });
    txt(484, 146, 'key = {rollno, courseid}', { mono: true, size: 12, color: PAL.ink });
    txt(484, 168, 'courseid -> credit', { mono: true, size: 12, color: PAL.invalid });
    P.alpha(1);
  }

  /* the partial dependency */
  var pd = rv(t, 14, 1.0);
  if (pd > 0) {
    P.alpha(pd);
    label(40, 226, 'the partial dependency in Schema IV');
    var y = 250;
    chip(40, y, 96, 30, 'rollno', { mono: true, size: 12 });
    txt(144, y + 9, '+', { size: 13, color: PAL.faint });
    chip(160, y, 96, 30, 'courseid', { mono: true, size: 12, fill: PAL.accentDim, stroke: PAL.accent, bold: true });
    txt(266, y + 9, '= the key', { size: 12, color: PAL.dim });
    P.arrow(208, y + 34, 208, y + 62, { stroke: PAL.invalid, sw: 2 });
    txt(218, y + 42, 'courseid alone', { mono: true, size: 11, color: PAL.invalid });
    chip(160, y + 68, 96, 30, 'credit', { mono: true, size: 12, fill: PAL.invalidDim, stroke: PAL.invalid });
    txt(270, y + 76, 'credit is not prime', { size: 12, color: PAL.invalid });
    P.alpha(1);
  }

  var v4 = rv(t, 20, 1.0);
  if (v4 > 0) {
    P.alpha(v4);
    stamp(40, 372, 'Schema IV: 1NF only', PAL.invalid, { w: 190, h: 26, size: 12 });
    P.alpha(1);
  }

  /* Schema III: transitive, not partial */
  var p3 = rv(t, 22, 1.0);
  if (p3 > 0) {
    P.alpha(p3);
    box(470, 226, 390, 100, { fill: PAL.surface, stroke: PAL.border, radius: 8 });
    txt(484, 242, 'Schema III', { size: 13, bold: true, color: PAL.ink });
    txt(484, 264, 'Registration(rollno, courseid, marks, grade)', { mono: true, size: 11, color: PAL.dim });
    txt(484, 286, 'marks -> grade', { mono: true, size: 12, color: PAL.warn });
    txt(484, 308, 'marks is in no key at all, so this is transitive', { size: 11, color: PAL.dim });
    P.alpha(1);
  }
  var v3 = rv(t, 26, 1.0);
  if (v3 > 0) {
    P.alpha(v3);
    stamp(640, 372, 'Schema III: 2NF', PAL.warn, { w: 160, h: 26, size: 12 });
    P.alpha(1);
  }

  if (t > 20) {
    P.alpha(rv(t, 24, 1));
    txt(40, 410, 'Partial fails 2NF. Transitive fails 3NF. Both cost a rung, but they fail different rungs.',
      { size: 12, color: PAL.ink });
    P.alpha(1);
  }
}

/* ---------------- scene 6: 3NF ---------------- */
function scNf3(t) {
  head('3NF: the prime-attribute exemption',
    'the single clause that separates 3NF from BCNF');

  var a = rv(t, 0, 1.0);
  if (a > 0) {
    P.alpha(a);
    box(40, 84, 400, 108, { fill: PAL.surface, stroke: PAL.border, radius: 8 });
    txt(54, 100, 'BCNF', { size: 13, bold: true, color: PAL.ink });
    txt(54, 124, 'for every non-trivial  X -> A :', { mono: true, size: 12, color: PAL.dim });
    txt(54, 148, 'X is a superkey', { mono: true, size: 13, color: PAL.ink });
    txt(54, 172, 'no exception', { size: 11, color: PAL.faint });
    P.alpha(1);
  }

  var b = rv(t, 7, 1.0);
  if (b > 0) {
    P.alpha(b);
    box(470, 84, 390, 108, { fill: PAL.accentDim, stroke: PAL.accent, radius: 8 });
    txt(484, 100, '3NF', { size: 13, bold: true, color: PAL.accent });
    txt(484, 124, 'for every non-trivial  X -> A :', { mono: true, size: 12, color: PAL.dim });
    txt(484, 148, 'X is a superkey,   OR   A is prime', { mono: true, size: 13, color: PAL.ink });
    txt(484, 172, 'the exemption', { size: 11, color: PAL.accent });
    P.alpha(1);
  }

  /* Schema II */
  var c = rv(t, 8, 1.0);
  if (c > 0) {
    P.alpha(c);
    box(40, 212, 400, 148, { fill: PAL.surface, stroke: PAL.border, radius: 8 });
    txt(54, 228, 'Schema II:  Registration(rollno, courseid, email)', { size: 12, bold: true, color: PAL.ink });
    txt(54, 252, 'rollno, courseid -> email', { mono: true, size: 12, color: PAL.dim });
    txt(54, 272, 'email -> rollno', { mono: true, size: 12, color: PAL.invalid });
    txt(54, 300, 'candidate keys:  {rollno, courseid}  and  {email, courseid}', { mono: true, size: 11, color: PAL.ink });
    txt(54, 324, 'so rollno is PRIME (it belongs to a key)', { size: 12, color: PAL.valid });
    txt(54, 344, 'courseid, email are prime too; nothing is non-prime', { size: 11, color: PAL.dim });
    P.alpha(1);
  }

  /* the verdict pair */
  var d = rv(t, 16, 1.0);
  if (d > 0) {
    P.alpha(d);
    box(470, 212, 390, 148, { fill: PAL.surface, stroke: PAL.border, radius: 8 });
    txt(484, 228, 'the same dependency, two verdicts', { size: 12, bold: true, color: PAL.ink });
    chip(484, 248, 168, 34, 'email not a superkey', { mono: true, size: 11, fill: PAL.surface2, stroke: PAL.border });
    P.arrow(500, 288, 500, 310, { stroke: PAL.valid, sw: 2 });
    txt(512, 292, 'rollno is prime  ->  3NF holds', { size: 12, color: PAL.valid });
    P.arrow(690, 288, 690, 310, { stroke: PAL.invalid, sw: 2 });
    txt(586, 326, 'BCNF has no exemption  ->  fails', { size: 12, color: PAL.invalid });
    P.alpha(1);
  }

  var e = rv(t, 23, 1.0);
  if (e > 0) {
    P.alpha(e);
    box(40, 378, 820, 44, { fill: PAL.accentDim, stroke: PAL.valid, radius: 8, sw: 2 });
    txt(54, 392, 'GATE 2018 Q42 answer: Schema II.   I: never enters the ladder.  III: stops at 2NF.  IV: stops at 1NF.  II: 3NF, not BCNF.',
      { size: 12, color: PAL.ink });
    P.alpha(1);
  }
}

/* ---------------- scene 7: BCNF ---------------- */
function scBcnf(t) {
  head('BCNF: no exemption, and how to decompose to reach it',
    'GATE CSE 2004 Q37:  studentPerformance(Name, CourseNo, RollNo, Grade)');

  var a = rv(t, 0, 1.0);
  if (a > 0) {
    P.alpha(a);
    box(40, 84, 400, 74, { fill: PAL.surface, stroke: PAL.border, radius: 8 });
    txt(54, 100, 'BCNF test', { size: 12, bold: true, color: PAL.ink });
    txt(54, 124, 'every non-trivial  X -> A  has X a superkey', { mono: true, size: 12, color: PAL.accent });
    txt(54, 144, 'trivial dependencies (A inside X) never violate anything', { size: 11, color: PAL.faint });
    P.alpha(1);
  }

  /* the schema, with primes marked */
  var b = rv(t, 8, 1.0);
  if (b > 0) {
    P.alpha(b);
    label(40, 186, 'the four attributes, and which are prime');
    var names = [['N', 'Name', true], ['C', 'CourseNo', true], ['R', 'RollNo', true], ['G', 'Grade', false]];
    names.forEach(function (n, i) {
      var x = 40 + i * 150;
      box(x, 198, 132, 56, { fill: n[2] ? PAL.accentDim : PAL.surface2, stroke: n[2] ? PAL.accent : PAL.border, radius: 8 });
      txt(x + 66, 214, n[0] + ' = ' + n[1], { mono: true, size: 11, align: 'center', color: PAL.ink });
      txt(x + 66, 236, n[2] ? 'prime' : 'non-prime', { size: 11, align: 'center', color: n[2] ? PAL.accent : PAL.faint });
    });
    txt(40, 274, 'keys: ' + V.keys04.join('   ') + '     prime attributes: ' + V.primes04, { mono: true, size: 12, color: PAL.dim });
    P.alpha(1);
  }

  /* the violating FD and the verdict */
  var c = rv(t, 16, 1.0);
  if (c > 0) {
    P.alpha(c);
    box(40, 292, 400, 100, { fill: PAL.warnDim, stroke: PAL.warn, radius: 8 });
    txt(54, 308, 'the violating dependency', { size: 12, bold: true, color: PAL.warn });
    txt(54, 332, 'Name -> RollNo', { mono: true, size: 15, color: PAL.ink });
    txt(54, 356, 'Name is not a superkey, but RollNo is prime', { size: 12, color: PAL.ink });
    txt(54, 376, 'so 3NF forgives it and BCNF does not', { size: 12, color: PAL.dim });
    P.alpha(1);
  }

  var d = rv(t, 22, 1.0);
  if (d > 0) {
    P.alpha(d);
    box(470, 292, 390, 100, { fill: PAL.surface, stroke: PAL.border, radius: 8 });
    txt(484, 308, 'highest normal form: 3NF', { size: 13, bold: true, color: PAL.accent });
    txt(484, 332, 'split on the violating FD:', { size: 12, color: PAL.dim });
    chip(484, 344, 130, 28, 'R1(N, R)', { mono: true, size: 12, fill: PAL.surface2 });
    chip(624, 344, 180, 28, 'R2(N, C, G)', { mono: true, size: 12, fill: PAL.surface2 });
    txt(484, 380, 'both fragments are then re-tested', { size: 11, color: PAL.faint });
    P.alpha(1);
  }

  var e = rv(t, 27, 1.0);
  if (e > 0) {
    P.alpha(e);
    txt(40, 414, 'The split always removes the violation. It does not always preserve the dependencies - scene 9 is the case where it cannot.',
      { size: 12, color: PAL.ink });
    P.alpha(1);
  }
}

/* ---------------- scene 8: lossless join ---------------- */
function scLossless(t) {
  head('Lossless join: the join must give back exactly r',
    'GATE CSE 2001 and 2005:  R(A,B,C,D),  A -> B,  C -> D');

  var a = rv(t, 0, 1.0);
  if (a > 0) {
    P.alpha(a);
    label(40, 84, 'r');
    table(40, 94, ['A', 'B', 'C', 'D'], R05, { cw: 46, rh: 26 });
    label(40, 186, 'two rows');
    P.alpha(1);
  }

  var b = rv(t, 8, 1.0);
  if (b > 0) {
    P.alpha(b);
    label(280, 84, 'r1 = projection onto ABC');
    table(280, 94, ['A', 'B', 'C'], r1_05, { cw: 46, rh: 26 });
    label(280, 178, 'still two rows');
    label(470, 84, 'r2 = projection onto AD');
    table(470, 94, ['A', 'D'], r2_05, { cw: 46, rh: 26 });
    txt(470, 186, 'still two rows', { size: 11, mono: true, color: PAL.faint });
    P.alpha(1);
  }

  /* the join, row by row */
  var j = rv(t, 16, 1.0);
  if (j > 0) {
    P.alpha(j);
    label(660, 84, 'r1  *  r2');
    P.alpha(1);
  }
  var shown = t < 17 ? 0 : t < 18.5 ? 1 : t < 20 ? 2 : t < 21.5 ? 3 : 4;
  var jrows = s_05;
  jrows.forEach(function (r, i) {
    if (i >= shown) return;
    var y = 94 + i * 26;
    var spurious = !R05.some(function (x) { return x.join('|') === r.join('|'); });
    var pop = rv(t, 17 + i * 1.5, 0.5);
    P.alpha(pop);
    box(660, y, 184, 26, { fill: spurious ? PAL.invalidDim : PAL.accentDim, stroke: spurious ? PAL.invalid : PAL.accent, radius: 4, sw: spurious ? 1.8 : 1 });
    r.forEach(function (v, ci) {
      txt(660 + ci * 46 + 23, y + 13, v, { mono: true, size: 13, align: 'center', base: 'middle', color: spurious ? PAL.invalid : PAL.ink });
    });
    P.alpha(1);
  });

  var c = rv(t, 24, 1.0);
  if (c > 0) {
    P.alpha(c);
    box(40, 220, 420, 96, { fill: PAL.invalidDim, stroke: PAL.invalid, radius: 8 });
    txt(54, 236, 'lossy: 4 rows from 2', { size: 13, bold: true, color: PAL.invalid });
    para(54, 258, 'Both original rows survive, so nothing disappeared. Two rows that never existed appeared. Lossy means rows were invented, not lost.',
      48, { size: 12 });
    P.alpha(1);
  }

  var d = rv(t, 27, 1.0);
  if (d > 0) {
    P.alpha(d);
    box(480, 220, 380, 96, { fill: PAL.accentDim, stroke: PAL.accent, radius: 8 });
    txt(494, 236, 'the two-fragment test', { size: 12, bold: true, color: PAL.accent });
    txt(494, 258, 'shared = ABC intersect AD = A', { mono: true, size: 11, color: PAL.ink });
    txt(494, 278, 'A is not a key of ABC and not a key of AD', { size: 11, color: PAL.ink });
    txt(494, 298, 'so the join is lossy', { size: 12, color: PAL.invalid });
    P.alpha(1);
  }

  if (t > 24) {
    P.alpha(rv(t, 26, 1));
    txt(40, 344, 'GATE 2005 Q30: given the decomposition is lossy, r is a subset of the join. The join is never smaller than r.',
      { size: 12, color: PAL.ink });
    txt(40, 368, 'With three or more fragments there is no such shortcut: run the chase, which is the same test generalised.',
      { size: 12, color: PAL.dim });
    P.alpha(1);
  }
}

/* ---------------- scene 9: dependency preservation ---------------- */
function scPreserve(t) {
  head('Dependency preservation, and the trade-off with BCNF',
    'GATE CSE 2001:  R(A,B,C,D),  AB -> C,  C -> AD,  split into ABC and CD');

  var a = rv(t, 0, 1.0);
  if (a > 0) {
    P.alpha(a);
    box(40, 84, 820, 62, { fill: PAL.surface2, stroke: PAL.border, radius: 8 });
    txt(54, 98, 'project F onto each fragment: keep a dependency only when all of its attributes fit inside that fragment',
      { size: 12, color: PAL.ink });
    txt(54, 122, 'the decomposition preserves F when the union of the projections still implies every original dependency',
      { size: 12, color: PAL.dim });
    P.alpha(1);
  }

  /* the two fragments with their dependencies */
  var b = rv(t, 8, 1.0);
  if (b > 0) {
    P.alpha(b);
    box(40, 166, 400, 150, { fill: PAL.surface, stroke: PAL.accent, radius: 8, sw: 2 });
    txt(54, 182, 'R1(ABC)', { mono: true, size: 14, bold: true, color: PAL.accent });
    txt(54, 208, 'AB -> C   preserved', { mono: true, size: 12, color: PAL.valid });
    txt(54, 230, 'C -> A    also lands here', { mono: true, size: 12, color: PAL.valid });
    txt(54, 258, 'C -> A has a non-superkey on the left', { size: 12, color: PAL.invalid });
    txt(54, 280, 'so R1(ABC) is NOT in BCNF', { size: 12, bold: true, color: PAL.invalid });

    box(470, 166, 390, 150, { fill: PAL.surface, stroke: PAL.accent, radius: 8, sw: 2 });
    txt(484, 182, 'R2(CD)', { mono: true, size: 14, bold: true, color: PAL.accent });
    txt(484, 208, 'C -> D   preserved', { mono: true, size: 12, color: PAL.valid });
    txt(484, 234, 'C is a key of CD, so R2 is in BCNF', { size: 12, color: PAL.dim });
    txt(484, 262, 'every original dependency has a home,', { size: 12, color: PAL.dim });
    txt(484, 282, 'so the split IS dependency preserving', { size: 12, color: PAL.valid });
    P.alpha(1);
  }

  var c = rv(t, 16, 1.0);
  if (c > 0) {
    P.alpha(c);
    box(40, 332, 400, 106, { fill: PAL.invalidDim, stroke: PAL.invalid, radius: 8 });
    txt(54, 348, 'but ABC is not in BCNF', { size: 13, bold: true, color: PAL.invalid });
    para(54, 370, 'To remove C -> A you must separate A from C. Once you do, AB -> C has no fragment containing A, B and C together.',
      48, { size: 12 });
    P.alpha(1);
  }

  var d = rv(t, 22, 1.0);
  if (d > 0) {
    P.alpha(d);
    box(470, 332, 390, 106, { fill: PAL.warnDim, stroke: PAL.warn, radius: 8 });
    txt(484, 348, 'the model searched every partition', { size: 12, bold: true, color: PAL.warn });
    txt(484, 372, V.parts01 + ' partitions into 2 or more blocks', { mono: true, size: 12, color: PAL.ink });
    txt(484, 394, V.good01b + ' are BCNF, lossless and dependency preserving', { mono: true, size: 12, color: PAL.invalid });
    txt(484, 416, 'so the answer to GATE 2001 Q2.23 is that none exists', { size: 11, color: PAL.dim });
    P.alpha(1);
  }

  var e = rv(t, 26, 1.0);
  if (e > 0) {
    P.alpha(e);
    txt(40, 456, '3NF synthesis always gives a lossless, dependency preserving decomposition. BCNF cannot always be reached without giving one of them up.',
      { size: 11, color: PAL.ink });
    P.alpha(1);
  }
}

/* ---------------- scene 10: the decision procedure ---------------- */
function scDecision(t) {
  head('The decision procedure, end to end',
    'four steps answer every question of this kind');

  var steps = [
    { a: 0, n: '1', title: 'closures and keys', body: 'closure of each candidate left side -> all candidate keys -> mark the prime attributes' },
    { a: 8, n: '2', title: 'minimal cover, then two questions', body: 'is the left side a superkey?  is the right side prime?  those two answers place the schema on the ladder' },
    { a: 16, n: '3', title: 'test the decomposition', body: 'the chase for losslessness, the projection test for dependency preservation' }
  ];
  steps.forEach(function (s, i) {
    var p = rv(t, s.a, 1.0);
    if (p <= 0) return;
    var y = 84 + i * 86;
    P.alpha(p);
    box(40, y, 560, 74, { fill: PAL.surface, stroke: PAL.border, radius: 8 });
    P.circle(68, y + 37, 16, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.6 });
    txt(68, y + 37, s.n, { mono: true, size: 14, bold: true, align: 'center', base: 'middle', color: PAL.accent });
    txt(96, y + 14, s.title, { size: 13, bold: true, color: PAL.ink });
    para(96, y + 36, s.body, 62, { size: 11 });
    P.alpha(1);
  });

  /* the ladder */
  var l = rv(t, 8, 1.0);
  if (l > 0) {
    P.alpha(l);
    var rungs = [['BCNF', 4], ['3NF', 3], ['2NF', 2], ['1NF', 1]];
    label(636, 84, 'the ladder');
    rungs.forEach(function (r, i) {
      var y = 96 + i * 40;
      box(636, y, 224, 32, {
        fill: i === 0 ? PAL.accentDim : PAL.surface2,
        stroke: i === 0 ? PAL.accent : PAL.border, radius: 6
      });
      txt(650, y + 16, r[0], { mono: true, size: 13, bold: true, base: 'middle', color: i === 0 ? PAL.accent : PAL.ink });
      txt(846, y + 16, r[1] === 4 ? 'X superkey' : r[1] === 3 ? 'or A prime' : r[1] === 2 ? 'no partial dep' : 'atomic cells',
        { size: 11, align: 'right', base: 'middle', color: PAL.faint });
    });
    P.alpha(1);
  }

  var inv = rv(t, 24, 1.0);
  if (inv > 0) {
    P.alpha(inv);
    box(40, 352, 820, 86, { fill: PAL.accentDim, stroke: PAL.valid, radius: 8, sw: 2 });
    txt(54, 368, 'two facts that survive every variation', { size: 12, bold: true, color: PAL.valid });
    txt(54, 392, '1.  a 3NF decomposition always exists that is lossless and dependency preserving', { size: 12, color: PAL.ink });
    txt(54, 414, '2.  a BCNF decomposition need not be reachable without giving up one of those two', { size: 12, color: PAL.ink });
    P.alpha(1);
  }

  if (t < 24) {
    box(40, 352, 820, 86, { fill: PAL.warnDim, stroke: PAL.warn, radius: 8 });
    txt(54, 368, 'the two ways these questions are lost', { size: 12, bold: true, color: PAL.warn });
    txt(54, 392, '1.  one candidate key is missed, so an attribute looks non-prime and the schema moves one rung down', { size: 12, color: PAL.ink });
    txt(54, 414, '2.  preservation is checked and losslessness is assumed, when they are independent tests', { size: 12, color: PAL.ink });
  }
}

var SCENES = {
  fd: scFd, armstrong: scArm, closure: scClo, keys: scKeys, nf2: scNf2,
  nf3: scNf3, bcnf: scBcnf, lossless: scLossless, preserve: scPreserve, decision: scDecision
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
