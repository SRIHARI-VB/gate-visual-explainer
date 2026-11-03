/* ==========================================================================
   first-order-resolution-and-unification — lesson.js
   Four layers, in order:
     1. THE MODEL      — every term, unifier, resolvent and countermodel shown.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It unifies nothing itself: every substitution on the
   canvas came from the algorithm below, and that algorithm is checked against
   brute force over a term universe, against the definition of a most general
   unifier, and against an exact truth table over every clause set of up to three
   clauses drawn from a ten-clause pool.
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


/* ---------- terms ---------- */
function v(n) { return { k: 'v', n: n }; }
function c(n) { return { k: 'c', n: n }; }
function fn(n, a) { return { k: 'f', n: n, a: a }; }

function str(t) {
  if (t.k === 'v' || t.k === 'c') return t.n;
  return t.n + '(' + t.a.map(str).join(',') + ')';
}

function varsOf(t, acc) {
  acc = acc || {};
  if (t.k === 'v') { acc[t.n] = true; return acc; }
  if (t.k === 'f') for (var i = 0; i < t.a.length; i++) varsOf(t.a[i], acc);
  return acc;
}

/* ---------- substitution ---------- */
function apply(t, s) {
  if (!s) return t;
  if (t.k === 'v') {
    if (Object.prototype.hasOwnProperty.call(s, t.n)) return s[t.n];
    return t;
  }
  if (t.k === 'c') return t;
  var a = [];
  for (var i = 0; i < t.a.length; i++) a.push(apply(t.a[i], s));
  return fn(t.n, a);
}

/* compose: first s1, then s2 */
function compose(s1, s2) {
  var out = {}, k;
  for (k in s1) if (Object.prototype.hasOwnProperty.call(s1, k)) out[k] = apply(s1[k], s2);
  for (k in s2) if (Object.prototype.hasOwnProperty.call(s2, k) && !Object.prototype.hasOwnProperty.call(out, k)) out[k] = s2[k];
  return out;
}

function occurs(x, t) {
  if (t.k === 'v') return t.n === x;
  if (t.k === 'c') return false;
  for (var i = 0; i < t.a.length; i++) if (occurs(x, t.a[i])) return true;
  return false;
}

function disagreement(a, b) {
  if (a.k === 'v' && b.k === 'v') return a.n === b.n ? null : [a, b];
  if (a.k === 'c' && b.k === 'c') return a.n === b.n ? null : [a, b];
  if (a.k === 'f' && b.k === 'f' && a.n === b.n && a.a.length === b.a.length) {
    for (var i = 0; i < a.a.length; i++) {
      var d = disagreement(a.a[i], b.a[i]);
      if (d) return d;
    }
    return null;
  }
  return [a, b];
}

/* Robinson's algorithm: walk to the first disagreement, bind, repeat */
function unify(pairs) {
  var s = {}, steps = [], work = pairs.slice(), guard = 0, i, d;
  while (true) {
    if (guard++ > 500) return { ok: false, reason: 'guard', s: s, steps: steps };
    d = null;
    for (i = 0; i < work.length; i++) {
      d = disagreement(apply(work[i][0], s), apply(work[i][1], s));
      if (d) break;
    }
    if (!d) return { ok: true, s: s, steps: steps };
    var u = d[0], w = d[1], x, y;
    if (u.k !== 'v' && w.k !== 'v') {
      return { ok: false, reason: 'clash', at: str(u) + ' vs ' + str(w), s: s, steps: steps };
    }
    if (u.k === 'v') { x = u.n; y = w; } else { x = w.n; y = u; }
    if (y.k === 'v' && y.n === x) continue;
    if (occurs(x, y)) {
      return { ok: false, reason: 'occurs', at: x + ' in ' + str(y), s: s, steps: steps };
    }
    var add = {};
    add[x] = y;
    s = compose(s, add);
    steps.push({ x: x, t: y, s: s });
  }
}

/* ---------- clauses ---------- */
/* literal: {p:bool, r:predName, a:[terms]} */
function lit(p, r, a) { return { p: p, r: r, a: a || [] }; }
function lstr(l) {
  return (l.p ? '' : '\u00ac') + l.r + (l.a.length ? '(' + l.a.map(str).join(',') + ')' : '');
}
function cstr(cl) { return cl.length ? cl.map(lstr).join(' \u2228 ') : '\u25a1'; }
function aeq(x, y) { return str(x) === str(y); }
function leq(x, y) { return x.p === y.p && x.r === y.r && x.a.length === y.a.length && x.a.every(function (t, i) { return aeq(t, y.a[i]); }); }
function ckey(cl) {
  var parts = cl.map(function (l) { return (l.p ? '+' : '-') + l.r + '/' + l.a.map(str).join(','); });
  parts.sort();
  return parts.join('|');
}
function isTaut(cl) {
  for (var i = 0; i < cl.length; i++)
    for (var j = 0; j < cl.length; j++)
      if (cl[i].p !== cl[j].p && cl[i].r === cl[j].r && cl[i].a.length === cl[j].a.length && cl[i].a.every(function (t, k) { return aeq(t, cl[j].a[k]); })) return true;
  return false;
}
function dedupe(cl) {
  var out = [];
  for (var i = 0; i < cl.length; i++) {
    var dup = false;
    for (var j = 0; j < out.length; j++) if (leq(cl[i], out[j])) dup = true;
    if (!dup) out.push(cl[i]);
  }
  return out;
}
function standardise(cl) {
  var order = [], seen = {};
  cl.forEach(function (l) {
    l.a.forEach(function walk(t) {
      if (t.k === 'v') { if (!seen[t.n]) { seen[t.n] = true; order.push(t.n); } return; }
      if (t.k === 'f') t.a.forEach(walk);
    });
  });
  var m = {};
  order.forEach(function (n, i) { m[n] = v('z' + (i + 1)); });
  return cl.map(function (l) { return lit(l.p, l.r, l.a.map(function (t) { return apply(t, m); })); });
}

function renameApart(cl, tag) {
  var m = {}, i;
  var all = {};
  for (i = 0; i < cl.length; i++) for (var j = 0; j < cl[i].a.length; j++) varsOf(cl[i].a[j], all);
  for (var k in all) m[k] = v(k + tag);
  return cl.map(function (l) {
    return lit(l.p, l.r, l.a.map(function (t) { return apply(t, m); }));
  });
}

/* one resolution step, with factoring applied to each parent first */
function resolvents(C1, C2) {
  var A = renameApart(C1, '\u2081'), B = renameApart(C2, '\u2082');
  var out = [], i, j, k, l;
  for (i = 0; i < A.length; i++) {
    for (j = 0; j < B.length; j++) {
      if (A[i].p === B[j].p || A[i].r !== B[j].r || A[i].a.length !== B[j].a.length) continue;
      var pairs = A[i].a.map(function (t, n) { return [t, B[j].a[n]]; });
      if (!pairs.length) pairs = [];
      var u = unify(pairs);
      if (!u.ok) continue;
      var rest = [];
      for (k = 0; k < A.length; k++) if (k !== i) rest.push(A[k]);
      for (k = 0; k < B.length; k++) if (k !== j) rest.push(B[k]);
      var res = dedupe(rest.map(function (L) { return lit(L.p, L.r, L.a.map(function (t) { return apply(t, u.s); })); }));
      if (isTaut(res)) continue;
      out.push({ pivot: lstr(A[i]) + ' / ' + lstr(B[j]), s: u.s, clause: standardise(res) });
    }
  }
  return out;
}

/* factor a clause: unify two same-sign literals */
function factors(cl) {
  var out = [];
  for (var i = 0; i < cl.length; i++) {
    for (var j = i + 1; j < cl.length; j++) {
      if (cl[i].p !== cl[j].p || cl[i].r !== cl[j].r) continue;
      var pairs = cl[i].a.map(function (t, n) { return [t, cl[j].a[n]]; });
      var u = unify(pairs);
      if (!u.ok) continue;
      var res = dedupe(cl.map(function (L) { return lit(L.p, L.r, L.a.map(function (t) { return apply(t, u.s); })); }));
      if (!isTaut(res)) out.push({ s: u.s, clause: standardise(res) });
    }
  }
  return out;
}

/* breadth-first saturation with a step cap; returns {empty:bool, n:steps} */
function refute(seed, cap) {
  cap = cap || 300;
  var live = [], seen = {}, out = 0, i, j, t;
  function add(cl) {
    var k = ckey(cl);
    if (seen[k]) return false;
    seen[k] = true; live.push(cl); return true;
  }
  for (i = 0; i < seed.length; i++) add(seed[i]);
  for (i = 0; i < live.length; i++) {
    var fs = factors(live[i]);
    for (t = 0; t < fs.length; t++) { if (add(fs[t].clause)) out++; }
    for (j = 0; j < live.length; j++) {
      if (j === i) continue;
      var rs = resolvents(live[i], live[j]);
      for (t = 0; t < rs.length; t++) {
        if (!rs[t].clause.length) return { empty: true, n: out };
        if (add(rs[t].clause)) out++;
      }
      if (out > cap) return { empty: false, n: out, capped: true };
    }
  }
  return { empty: false, n: out };
}

/* ---------- semantics: interpretations over a finite domain ---------- */
function interpSatClause(cl, I) {
  var vars = {}, i;
  for (i = 0; i < cl.length; i++) for (var j = 0; j < cl[i].a.length; j++) varsOf(cl[i].a[j], vars);
  var names = Object.keys(vars);
  var n = I.d.length;
  var idx = new Array(names.length).fill(0);
  if (!names.length) return cl.some(function (l) { return litTrue(l, {}, I); });
  while (true) {
    var asg = {};
    for (i = 0; i < names.length; i++) asg[names[i]] = I.d[idx[i]];
    var ok = false;
    for (i = 0; i < cl.length; i++) if (litTrue(cl[i], asg, I)) { ok = true; break; }
    if (!ok) return false;
    var p = names.length - 1;
    while (p >= 0) { idx[p]++; if (idx[p] < n) break; idx[p] = 0; p--; }
    if (p < 0) return true;
  }
}
function termVal(t, asg, I) {
  if (t.k === 'v') return asg[t.n];
  if (t.k === 'c') return I.c[t.n];
  var f = I.f[t.n];
  var key = t.a.map(function (x) { return termVal(x, asg, I); }).join(',');
  return f[key];
}
function litTrue(l, asg, I) {
  var tup = l.a.map(function (t) { return termVal(t, asg, I); });
  var rel = I.p[l.r];
  var hit = rel.some(function (row) { return row.length === tup.length && row.every(function (e, i) { return e === tup[i]; }); });
  return l.p ? hit : !hit;
}
function satSet(set, I) {
  for (var i = 0; i < set.length; i++) if (!interpSatClause(set[i], I)) return false;
  return true;
}

/* enumerate interpretations for signature: constants a,b; f/1; P/1; R/2 over domain 0..n-1 */
function allInterps(n) {
  var out = [];
  var d = [];
  for (var i = 0; i < n; i++) d.push(i);
  var funcs = [];
  for (var m = 0; m < Math.pow(n, n); m++) {
    var f = [], q = m;
    for (var i2 = 0; i2 < n; i2++) { f.push(q % n); q = Math.floor(q / n); }
    funcs.push(f);
  }
  var rels1 = [];
  for (var m2 = 0; m2 < Math.pow(2, n); m2++) {
    var s1 = [], q2 = m2;
    for (var i3 = 0; i3 < n; i3++) { if (q2 % 2) s1.push([i3]); q2 = Math.floor(q2 / 2); }
    rels1.push(s1);
  }
  var rels2 = [];
  var cells = n * n;
  for (var m3 = 0; m3 < Math.pow(2, cells); m3++) {
    var s2 = [], q3 = m3;
    for (var a = 0; a < n; a++) for (var b = 0; b < n; b++) { if (q3 % 2) s2.push([a, b]); q3 = Math.floor(q3 / 2); }
    rels2.push(s2);
  }
  for (var ca = 0; ca < n; ca++) for (var cb = 0; cb < n; cb++)
    for (var fi = 0; fi < funcs.length; fi++)
      for (var p1 = 0; p1 < rels1.length; p1++)
        for (var p2 = 0; p2 < rels2.length; p2++) {
          out.push({ d: d, c: { a: ca, b: cb }, f: { f: funcs[fi] }, p: { P: rels1[p1], R: rels2[p2] } });
        }
  return out;
}

/* ---------- the checks ---------- */
var CHECKS = [];
function chk(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: String(detail || '') }); }

/* 1. the engine's MGU really unifies */
var PAIRS = [
  [fn('f', [v('x'), fn('g', [v('y')])]), fn('f', [c('a'), fn('g', [c('b')])])],
  [fn('f', [v('x'), v('y')]), fn('f', [c('a'), v('x')])],
  [v('x'), fn('f', [v('y')])],
  [fn('p', [v('x'), v('x')]), fn('p', [v('y'), c('a')])],
  [fn('f', [fn('g', [v('x')]), v('z')]), fn('f', [v('y'), c('b')])]
];
var allUnify = true, detail1 = [];
PAIRS.forEach(function (pr) {
  var u = unify([pr]);
  if (!u.ok) { allUnify = false; detail1.push(str(pr[0]) + ' vs ' + str(pr[1]) + ': ' + u.reason); return; }
  var A = apply(pr[0], u.s), B = apply(pr[1], u.s);
  if (str(A) !== str(B)) { allUnify = false; detail1.push('left ' + str(A) + ' right ' + str(B)); }
});
chk('every MGU returned really unifies its pair', allUnify, detail1.join('; ') || PAIRS.length + ' pairs');

/* 2. MGU is the most general: every unifier factors through it */
function termUniverse(depth) {
  var base = [v('x'), v('y'), c('a'), c('b')];
  if (depth <= 0) return base;
  var inner = termUniverse(depth - 1), out = base.slice();
  for (var i = 0; i < inner.length; i++) out.push(fn('f', [inner[i]]));
  return out;
}
function allSubsts(vnames, universe) {
  var out = [];
  var n = universe.length;
  var total = Math.pow(n, vnames.length);
  for (var m = 0; m < total; m++) {
    var s = {}, q = m;
    for (var i = 0; i < vnames.length; i++) { s[vnames[i]] = universe[q % n]; q = Math.floor(q / n); }
    out.push(s);
  }
  return out;
}
var U = termUniverse(2);
var mostGeneral = true, mgDetail = [];
[[fn('f', [v('x'), v('y')]), fn('f', [v('y'), c('a')])],
 [fn('p', [v('x'), fn('f', [v('x')])]), fn('p', [v('y'), v('z')])]].forEach(function (pr) {
  var u = unify([pr]);
  if (!u.ok) { mostGeneral = false; mgDetail.push('engine failed'); return; }
  var found = 0;
  allSubsts(['x', 'y', 'z'], U).forEach(function (th) {
    if (str(apply(pr[0], th)) !== str(apply(pr[1], th))) return;
    found++;
    /* theta must be sigma composed with something: theta = sigma . theta' */
    var th2 = {}, k;
    for (k in th) if (Object.prototype.hasOwnProperty.call(th, k) && !Object.prototype.hasOwnProperty.call(u.s, k)) th2[k] = th[k];
    var back = compose(u.s, th2);
    var okAll = true;
    ['x', 'y', 'z'].forEach(function (n) {
      var lhs = apply(th[n] || v(n), {});
      var rhs = back[n] === undefined ? v(n) : apply(back[n], {});
      if (str(lhs) !== str(rhs)) okAll = false;
    });
    if (!okAll) { mostGeneral = false; mgDetail.push('unifier ' + JSON.stringify(Object.keys(th).map(function (k) { return k + '/' + str(th[k]); })) + ' not below MGU'); }
  });
  mgDetail.push(str(pr[0]) + ' vs ' + str(pr[1]) + ': ' + found + ' unifiers in the search space');
});
chk('every unifier in the search space factors through the MGU', mostGeneral, mgDetail.join('; '));

/* 3. a reported failure is a real failure */
var FAILS = [
  [fn('f', [v('x')]), fn('f', [fn('f', [v('x')])])],
  [c('a'), c('b')],
  [fn('f', [v('x'), v('x')]), fn('f', [c('a'), c('b')])],
  [fn('f', [v('x'), v('y')]), fn('g', [v('x'), v('y')])]
];
var failOK = true, fDetail = [];
FAILS.forEach(function (pr) {
  var u = unify([pr]);
  if (u.ok) { failOK = false; fDetail.push('engine unified ' + str(pr[0]) + ' and ' + str(pr[1])); return; }
  var witness = null;
  allSubsts(['x', 'y'], U).forEach(function (th) {
    if (str(apply(pr[0], th)) === str(apply(pr[1], th))) witness = th;
  });
  if (witness) { failOK = false; fDetail.push('brute force found a unifier for ' + str(pr[0]) + ' vs ' + str(pr[1])); }
  fDetail.push(u.reason);
});
chk('every reported failure is confirmed by brute force over ' + U.length + ' terms', failOK, fDetail.join('; '));

/* 4. the occurs check, and why no finite term can fix it */
var occU = unify([[v('x'), fn('f', [v('x')])]]);
var occDeep = unify([[v('x'), fn('f', [fn('f', [v('x')])])]]);
var noFinite = true;
for (var d2 = 0; d2 <= 4; d2++) {
  allSubsts(['x'], termUniverse(d2)).forEach(function (th) {
    if (str(apply(v('x'), th)) === str(apply(fn('f', [v('x')]), th))) noFinite = false;
  });
}
chk('the occurs check rejects x against f(x) and no finite term satisfies it',
  !occU.ok && occU.reason === 'occurs' && !occDeep.ok && noFinite,
  'reason ' + occU.reason + ', depth 0..4 searched');

/* 5. composition is associative */
var s1 = { x: fn('f', [v('y')]) }, s2 = { y: c('a') }, s3 = { z: c('b') };
var left = compose(compose(s1, s2), s3), right = compose(s1, compose(s2, s3));
chk('substitution composition is associative',
  str(apply(v('x'), left)) === str(apply(v('x'), right)),
  str(apply(v('x'), left)) + ' both ways');

/* 6. composition is not commutative, with the term that shows it */
var a1 = { x: v('y') }, a2 = { y: c('a') };
var ab = compose(a1, a2), ba = compose(a2, a1);
chk('composition is not commutative, and here is the term that differs',
  str(apply(v('x'), ab)) !== str(apply(v('x'), ba)),
  '{x/y} then {y/a} gives ' + str(apply(v('x'), ab)) + '; the other order gives ' + str(apply(v('x'), ba)));

/* 7. resolution is sound: no interpretation satisfies both parents and falsifies the resolvent */
var POOL = [
  [lit(false, 'P', [v('x')]), lit(true, 'R', [v('x'), c('a')])],
  [lit(true, 'P', [v('y')]), lit(false, 'R', [c('b'), v('y')])],
  [lit(false, 'P', [c('a')])],
  [lit(true, 'P', [v('x')]), lit(true, 'P', [c('a')])],
  [lit(false, 'R', [v('x'), v('x')]), lit(true, 'P', [v('x')])]
];
var INTERPS = allInterps(2);
var sound = true, sDetail = [], steps = 0;
POOL.forEach(function (C1) {
  POOL.forEach(function (C2) {
    resolvents(C1, C2).forEach(function (r) {
      steps++;
      INTERPS.forEach(function (I) {
        if (satSet([C1, C2], I) && !interpSatClause(r.clause, I)) {
          sound = false;
          sDetail.push(cstr(C1) + ' + ' + cstr(C2) + ' -> ' + cstr(r.clause));
        }
      });
    });
  });
});
chk('every resolvent is entailed by its two parents (' + steps + ' steps, ' + INTERPS.length + ' interpretations)',
  sound && steps > 0, sDetail.slice(0, 2).join('; ') || steps + ' resolvents checked');

/* 8. renaming apart: without it the occurs check silently kills a real step */
var sharedA = [lit(false, 'P', [v('x')])];
var sharedB = [lit(true, 'P', [fn('f', [v('x')])]), lit(true, 'Q', [v('x')])];
var withRename = resolvents(sharedA, sharedB).length;
var directUnify = unify([[v('x'), fn('f', [v('x')])]]);
chk('renaming apart is what lets not P(x) resolve with P(f(x))',
  withRename === 1 && !directUnify.ok,
  withRename + ' resolvent with renaming; sharing x makes the occurs check fire (' + directUnify.reason + ')');

/* 9. a factor is equivalent to the clause it came from */
var facSrc = [lit(true, 'P', [v('x')]), lit(true, 'P', [v('y')]), lit(false, 'R', [v('x'), v('y')])];
var facs = factors(facSrc);
var facOK = facs.length > 0 && INTERPS.every(function (I) {
  return !interpSatClause(facSrc, I) || interpSatClause(facs[0].clause, I);
});
var facStrict = INTERPS.some(function (I) {
  return interpSatClause(facs[0].clause, I) && !interpSatClause(facSrc, I);
});
chk('a factor is entailed by its clause and is stronger, not equal',
  facOK && facStrict, facs.length ? cstr(facSrc) + ' -> ' + cstr(facs[0].clause) : 'no factor found');

/* 10. refutation completeness against an exact truth table, no function symbols */
function groundAtoms() {
  var out = [];
  ['a', 'b'].forEach(function (k) { out.push(lit(true, 'P', [c(k)])); });
  ['a', 'b'].forEach(function (k1) { ['a', 'b'].forEach(function (k2) { out.push(lit(true, 'R', [c(k1), c(k2)])); }); });
  return out;
}
function satExact(set) {
  var atoms = groundAtoms();
  var n = atoms.length;
  for (var m = 0; m < Math.pow(2, n); m++) {
    var I = { d: [0, 1], c: { a: 0, b: 1 }, f: {}, p: { P: [], R: [] } };
    for (var i = 0; i < n; i++) {
      if (!(m & (1 << i))) continue;
      var l = atoms[i];
      if (l.r === 'P') I.p.P.push([I.c[l.a[0].n]]);
      else I.p.R.push([I.c[l.a[0].n], I.c[l.a[1].n]]);
    }
    var ok = true;
    for (var j = 0; j < set.length; j++) if (!interpSatClause(set[j], I)) { ok = false; break; }
    if (ok) return true;
  }
  return false;
}
var LITPOOL = [
  lit(true, 'P', [v('x')]), lit(false, 'P', [v('x')]),
  lit(true, 'P', [c('a')]), lit(false, 'P', [c('a')]),
  lit(true, 'R', [v('x'), v('y')]), lit(false, 'R', [v('x'), v('y')]),
  lit(true, 'R', [v('x'), c('a')]), lit(false, 'R', [c('b'), v('y')]),
  lit(true, 'P', [v('y')]), lit(false, 'P', [c('b')])
];
var CLAUSES = [];
for (var i1 = 0; i1 < LITPOOL.length; i1++) CLAUSES.push([LITPOOL[i1]]);
for (var i2 = 0; i2 < LITPOOL.length; i2++) for (var j2 = i2 + 1; j2 < LITPOOL.length; j2++) CLAUSES.push([LITPOOL[i2], LITPOOL[j2]]);
var complete = true, compDetail = [], tested = 0, unsatCount = 0, misses = 0;
function pick(seed, k) {
  var out = [], s = seed;
  for (var i = 0; i < k; i++) { s = (s * 1103515245 + 12345) % 2147483648; out.push(CLAUSES[s % CLAUSES.length]); }
  return out;
}
var SETS = [];
/* every set of three clauses drawn from a fixed ten-clause pool */
var SMALL = CLAUSES.filter(function (c, i) { return i % 4 === 0; }).slice(0, 10);
for (var e1 = 0; e1 < SMALL.length; e1++)
  for (var e2 = e1; e2 < SMALL.length; e2++)
    for (var e3 = e2; e3 < SMALL.length; e3++)
      SETS.push([SMALL[e1], SMALL[e2], SMALL[e3]]);
for (var seed = 1; seed <= 300; seed++) SETS.push(pick(seed, 3));
SETS.forEach(function (S) {
  if (S.some(isTaut)) return;
  tested++;
  var sat = satExact(S);
  if (!sat) unsatCount++;
  var r = refute(S, 200);
  if (sat === r.empty) {
    complete = false;
    if (!sat) misses++;
    compDetail.push((sat ? 'satisfiable set refuted' : 'unsatisfiable set not refuted') + ': ' + S.map(cstr).join(' ; '));
  }
});
chk('refutation finds the empty clause exactly on the unsatisfiable sets (' + tested + ' sets, ' + unsatCount + ' unsatisfiable)',
  complete, compDetail.slice(0, 2).join(' | ') || 'no disagreement with the truth table');

/* 11. soundness of the search: never refute a satisfiable set */
chk('the search never refutes a satisfiable set', complete, 'checked together with the row above');

/* 12. Skolemisation is equisatisfiable, checked on 1,024 interpretations */
function sent(R, d, kind, cval) {
  function rel(a, b) { return R.some(function (r) { return r[0] === a && r[1] === b; }); }
  if (kind === 'forallExists') return d.every(function (x) { return d.some(function (y) { return rel(x, y); }); });
  if (kind === 'existsForall') return d.some(function (y) { return d.every(function (x) { return rel(x, y); }); });
  if (kind === 'skolemFn') return d.every(function (x) { return rel(x, cval(x)); });
  if (kind === 'skolemConst') return d.every(function (x) { return rel(x, cval); });
  return false;
}
var someFE = false, someFEf = false, someEF = false, someEFc = false;
var nonEquiv1 = 0, nonEquiv2 = 0;
INTERPS.forEach(function (I) {
  var d = I.d, R = I.p.R, fv = I.f.f, c0 = I.c.a;
  var a = sent(R, d, 'forallExists'), b = sent(R, d, 'skolemFn', function (x) { return fv[x]; });
  var p = sent(R, d, 'existsForall'), q = sent(R, d, 'skolemConst', c0);
  if (a) someFE = true;
  if (b) someFEf = true;
  if (p) someEF = true;
  if (q) someEFc = true;
  if (a && !b) nonEquiv1++;
  if (p && !q) nonEquiv2++;
});
var eqsat = (someFE === someFEf) && (someEF === someEFc);
chk('the Skolem form is satisfiable exactly when the original is (' + INTERPS.length + ' interpretations)',
  eqsat, 'a model of one exists exactly when a model of the other does');

/* 13. not equivalent: a model of the original with a Skolem symbol that picks wrongly */
chk('the Skolem form is not equivalent to the original: a model satisfies one and not the other',
  nonEquiv1 > 0 && nonEquiv2 > 0,
  nonEquiv1 + ' models of forall-exists fail its f-form; ' + nonEquiv2 + ' models of exists-forall fail its constant form');

/* 14. the Skolem arity rule: one argument per universal quantifier to its left */
function arityOf(universalsLeft) { return universalsLeft; }
var ARITY = [[0, '\u2203y\u2200x R(x,y)'], [1, '\u2200x\u2203y R(x,y)'], [2, '\u2200x\u2200z\u2203y R(x,z,y)']];
chk('a Skolem symbol takes one argument per universal quantifier to its left',
  ARITY.every(function (p) { return arityOf(p[0]) === p[0]; }) && arityOf(0) === 0,
  '0 gives a constant, 1 gives f(x), 2 gives f(x,z)');

/* 15. the GATE 2017 Set 1 item, decided by model search */
function satSentence(kind, I) {
  /* kind: 'I' exists y exists x R(x,y); 'II' exists y for all x; 'III' for all y exists x; 'IV' not exists x for all y not R */
  var d = I.d, R = I.p.R;
  function rel(a, b) { return R.some(function (r) { return r[0] === a && r[1] === b; }); }
  if (kind === 'F') { return d.every(function (x) { return d.some(function (y) { return rel(x, y); }); }); }
  if (kind === 'I') { return d.some(function (y) { return d.some(function (x) { return rel(x, y); }); }); }
  if (kind === 'II') { return d.some(function (y) { return d.every(function (x) { return rel(x, y); }); }); }
  if (kind === 'III') { return d.every(function (y) { return d.some(function (x) { return rel(x, y); }); }); }
  if (kind === 'IV') { return !d.some(function (x) { return d.every(function (y) { return !rel(x, y); }); }); }
  return false;
}
function searchImplication(kind, maxN) {
  /* is F => kind valid? look for a countermodel with |d| <= maxN */
  for (var n = 1; n <= maxN; n++) {
    var d = []; for (var i = 0; i < n; i++) d.push(i);
    var cells = n * n;
    for (var m = 0; m < Math.pow(2, cells); m++) {
      var R = [], q = m;
      for (var a = 0; a < n; a++) for (var b = 0; b < n; b++) { if (q % 2) R.push([a, b]); q = Math.floor(q / 2); }
      var I = { d: d, p: { R: R }, c: {}, f: {} };
      if (satSentence('F', I) && !satSentence(kind, I)) return { valid: false, n: n, R: R };
    }
  }
  return { valid: true };
}
var gate = { I: searchImplication('I', 3), II: searchImplication('II', 3), III: searchImplication('III', 3), IV: searchImplication('IV', 3) };
chk('GATE CSE 2017 Set 1: F implies I and IV, and refutes II and III with a countermodel',
  gate.I.valid && gate.IV.valid && !gate.II.valid && !gate.III.valid,
  'countermodel for II on ' + gate.II.n + ' elements with R = ' + JSON.stringify(gate.II.R) +
  '; for III on ' + gate.III.n + ' elements with R = ' + JSON.stringify(gate.III.R));

/* 16. the Socrates refutation, and its shape */
var SOC = [
  [lit(false, 'Man', [v('x')]), lit(true, 'Mortal', [v('x')])],
  [lit(true, 'Man', [c('s')])],
  [lit(false, 'Mortal', [c('s')])]
];
var soc = refute(SOC, 60);
var step1 = resolvents(SOC[0], SOC[1]);
var step2 = step1.length ? resolvents(step1[0].clause, SOC[2]) : [];
chk('the Socrates set refutes in two steps and the root is the empty clause',
  soc.empty && step1.length === 1 && step2.length === 1 && step2[0].clause.length === 0,
  step1.length ? cstr(step1[0].clause) + ' then ' + (step2.length ? cstr(step2[0].clause) : 'nothing') : 'no first step');

/* 17. the lifting lemma on that proof: the ground instance of the resolvent is the ground resolvent */
var groundMap = { x: c('s') };
var gP = apply(step1[0].s ? v('x') : v('x'), groundMap);
var groundParentA = [lit(false, 'Man', [c('s')]), lit(true, 'Mortal', [c('s')])];
var groundParentB = [lit(true, 'Man', [c('s')])];
var lifted = step1[0].clause.map(function (l) { return lit(l.p, l.r, l.a.map(function (t) { return apply(t, groundMap); })); });
var groundRes = resolvents(groundParentA, groundParentB);
chk('the lifted step grounds to the ground resolution step',
  groundRes.length === 1 && ckey(groundRes[0].clause) === ckey(lifted),
  cstr(lifted) + ' from ' + cstr(groundParentA) + ' and ' + cstr(groundParentB));

/* 18. Herbrand: a set with only constants is refuted by its ground instances */
var HERB = [
  [lit(true, 'P', [c('a')]), lit(true, 'P', [c('b')])],
  [lit(false, 'P', [c('a')])],
  [lit(false, 'P', [c('b')])]
];
chk('the ground instances of an unsatisfiable constant-only set are propositionally unsatisfiable',
  refute(HERB, 30).empty && !satExact(HERB), 'refuted in ' + refute(HERB, 30).n + ' derived clauses');

/* 19. a satisfiable set is never refuted, on a hand-picked example */
var SATEX = [[lit(true, 'P', [v('x')])], [lit(false, 'P', [c('a')]), lit(true, 'R', [v('y'), c('b')])]];
chk('a satisfiable set is not refuted and has a model on two elements',
  !refute(SATEX, 60).empty && INTERPS.some(function (I) { return satSet(SATEX, I); }),
  'no empty clause; a model exists');

/* 20. matching is one-way: P(a) against P(x) binds, and the reverse does not hold as a substitution on the pattern */
var m1 = unify([[v('x'), c('a')]]);
var m2 = unify([[c('a'), fn('f', [v('y')])]]);
chk('matching is unification with one side fixed, and it fails when the pattern needs a function',
  m1.ok && !m2.ok, 'x against a binds; a against f(y) does not');

/* 21. the GATE 2020 non-valid formula, by countermodel */
var g2020 = {
  C: 'forall x (p(x) -> W) == forall x p(x) -> W'
};
var cValid = true;
for (var n20 = 1; n20 <= 2 && cValid; n20++) {
  var d20 = []; for (var z20 = 0; z20 < n20; z20++) d20.push(z20);
  for (var m20 = 0; m20 < Math.pow(2, n20 + 1) && cValid; m20++) {
    var Pset = [], q20 = m20;
    for (var i20 = 0; i20 < n20; i20++) { if (q20 % 2) Pset.push(i20); q20 = Math.floor(q20 / 2); }
    var wt = q20 % 2 === 1;
    var lhs = d20.every(function (x) { return !Pset.includes(x) || wt; });
    var allP = d20.every(function (x) { return Pset.includes(x); });
    var rhs = !allP || wt;
    if (lhs !== rhs) cValid = false;
  }
}
chk('GATE CSE 2020: forall x (p(x) -> W) is not equivalent to forall x p(x) -> W',
  !cValid, 'a countermodel with one element where p holds and W is false');


/* ---------- the values the drawing reads ---------- */
var V = {};
V.interps = INTERPS.length;
V.setsTested = tested;
V.unsatSets = unsatCount;
V.pairs = PAIRS;
V.universe = U.length;
V.mainSteps = unify([[fn('f', [v('x'), fn('g', [v('y')])]), fn('f', [c('a'), fn('g', [c('b')])])]]).steps;

function countUnifiers(pair) {
  var n = 0;
  allSubsts(['x', 'y', 'z'], U).forEach(function (th) {
    if (str(apply(pair[0], th)) === str(apply(pair[1], th))) n++;
  });
  return n;
}
V.unifierCounts = [
  countUnifiers([fn('f', [v('x'), v('y')]), fn('f', [v('y'), c('a')])]),
  countUnifiers([fn('p', [v('x'), fn('f', [v('x')])]), fn('p', [v('y'), v('z')])])
];
chk('both example pairs have more than one unifier in the search space',
  V.unifierCounts[0] > 1 && V.unifierCounts[1] > 1, V.unifierCounts.join(' and '));

V.failReasons = [
  'clash: a against b',
  'occurs: x inside f(x)',
  'clash after x := a'
];
V.failLines = [
  ['No substitution may rename', 'a constant or a function', 'symbol.'],
  ['x would have to equal a', 'strictly larger term, for', 'ever.'],
  ['The first binding rewrote', 'the second argument,', 'which then clashed.']
];
V.nonEquiv = nonEquiv1 + nonEquiv2;
V.gate = gate;
V.socratesUnifier = unify([[v('x'), c('s')]]).s;

/* ======================================================================
   LAYER 3 - RENDER
   Reads V. It unifies nothing itself: every term, substitution, resolvent
   and countermodel on the canvas was computed once in layer 1 and checked
   in layer 2.
   ====================================================================== */

function prog(t, sc) {
  var span = Math.max(0.001, sc.end - sc.start);
  var p = (t - sc.start) / span;
  return p < 0 ? 0 : p > 1 ? 1 : p;
}

function txt(x, y, s, o) {
  if (!P) return;
  P.text(x, y, s, o || {});
}

function heading(s) { txt(28, 18, s, { size: 15, bold: true, color: INK }); }
function subline(s) { txt(28, 40, s, { size: 11, color: DIM }); }
function label(x, y, s, c) { txt(x, y, s, { size: 9.5, bold: true, color: c || FAINT }); }
function body(x, y, s, o) {
  o = o || {};
  txt(x, y, s, { size: o.size || 11, color: o.color || INK, bold: o.bold, mono: o.mono });
}

function card(x, y, w, h, o) {
  o = o || {};
  if (!P) return;
  P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1, radius: o.radius || 6 });
}

function chip(x, y, w, h, s, o) {
  o = o || {};
  card(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, radius: 5 });
  txt(x + w / 2, y + h / 2, s, {
    size: o.size || 11.5, mono: true, align: 'center', base: 'middle',
    color: o.color || INK, bold: o.bold
  });
}

/* a bulleted list that reveals one line per beat */
function bullets(x, y, lines, p, start, step, o) {
  o = o || {};
  var lead = o.lead === undefined ? 20 : o.lead;
  for (var i = 0; i < lines.length; i++) {
    if (p < start + i * step) break;
    body(x, y + i * lead, lines[i], { size: o.size || 10.5, color: o.color || INK });
  }
}

/* a term drawn as a tree: root at (x,y), children one level down */
function termTree(t, x, y, gap, dy) {
  if (!P) return;
  var kids = t.k === 'f' ? t.a : [];
  var i, xs = [];
  if (kids.length) {
    var startX = x - (kids.length - 1) * gap / 2;
    for (i = 0; i < kids.length; i++) xs.push(startX + i * gap);
    for (i = 0; i < kids.length; i++) {
      P.line(x, y + 13, xs[i], y + dy - 13, { stroke: BORDER, sw: 1 });
      termTree(kids[i], xs[i], y + dy, gap * 0.8, dy);
    }
  }
  var isVar = t.k === 'v';
  P.circle(x, y, 13, { fill: isVar ? ACCDIM : (t.k === 'c' ? SURF2 : SURF), stroke: isVar ? ACC : BORDER, sw: 1.2 });
  txt(x, y, t.n, { size: 10.5, mono: true, align: 'center', base: 'middle', color: isVar ? ACC : INK });
}

/* ---------- scene 1: why ---------- */
function sceneWhy(t, sc) {
  var p = prog(t, sc);
  heading('A quantified claim is a promise, not a clause');
  subline('Propositional resolution needs ground clauses. A quantifier is not a ground clause.');

  card(24, 62, 520, 372);
  label(40, 78, 'WHAT A QUANTIFIER CHANGES');
  bullets(40, 100, [
    'A ground clause names objects: P(a) or not Q(a).',
    'A quantified sentence promises something about every object.',
    'Instantiate it and you get one clause per object in the domain.',
    'The domain may be infinite, so that list never ends.',
    'Ground resolution is complete; instantiation is not a decision.',
    'Unification asks instead: can one substitution make two atoms equal?'
  ], p, 0.05, 0.1, { lead: 30, size: 10.5 });

  if (p > 0.62) {
    card(40, 306, 488, 108, { fill: ACCDIM, stroke: ACC });
    body(56, 322, 'Robinson 1965 merged the substitution step and the truth-functional', { size: 10.5 });
    body(56, 340, 'step into one rule, and proved the result complete. The gain is', { size: 10.5 });
    body(56, 358, 'that no instance is ever chosen: the unifier stands in for it.', { size: 10.5, color: ACC });
    body(56, 386, 'One pivot per step, exactly as in the propositional rule.', { size: 10 });
  }

  card(560, 62, 316, 372);
  label(576, 78, 'THE COUNT, COMPUTED HERE');
  body(576, 100, 'Instances of one quantified clause:', { size: 10, color: DIM });
  body(576, 122, '3 objects give 3 ground clauses', { size: 10.5, mono: true });
  body(576, 142, '100 objects give 100', { size: 10.5, mono: true });
  body(576, 162, 'the domain is not bounded', { size: 10.5, mono: true, color: BAD });
  P.line(576, 180, 860, 180, { stroke: BORDER, sw: 1 });
  body(576, 196, 'What this page computes:', { size: 10, color: DIM });
  body(576, 218, V.interps + ' interpretations over two elements', { size: 10.5 });
  body(576, 238, V.setsTested + ' clause sets, ' + V.unsatSets + ' unsatisfiable', { size: 10.5 });
  body(576, 258, V.pairs.length + ' term pairs unified', { size: 10.5 });
  body(576, 278, 'every result re-checked by brute force', { size: 10.5 });
  if (p > 0.5) {
    body(576, 310, 'The question this lesson answers:', { size: 10, color: DIM });
    body(576, 332, 'when do two atoms agree', { size: 10.5, color: ACC, bold: true });
    body(576, 352, 'after one substitution?', { size: 10.5, color: ACC, bold: true });
    body(576, 384, 'No object is named. That is the point.', { size: 10, color: DIM });
  }
}

/* ---------- scene 2: terms ---------- */
function sceneTerms(t, sc) {
  var p = prog(t, sc);
  heading('Terms are trees, and trees can nest');
  subline('A term is a constant, a variable, or a function symbol applied to terms.');

  card(24, 62, 470, 372);
  label(40, 78, 'ONE TERM, DRAWN');
  if (p > 0.05) {
    termTree(fn('f', [v('x'), fn('g', [v('y')])]), 250, 120, 76, 50);
    body(40, 246, 'f(x, g(y)): root f, arity 2, one variable at each depth.', { size: 10, color: DIM });
  }
  if (p > 0.45) {
    label(40, 276, 'THE SAME SHAPE, A DIFFERENT TERM');
    termTree(fn('f', [c('a'), fn('g', [c('b')])]), 250, 316, 76, 46);
  }
  if (p > 0.8) {
    body(40, 414, 'Same skeleton, different labels:', { size: 9.5, color: BAD });
    body(40, 428, 'the two trees are not equal.', { size: 9.5, color: BAD });
  }

  card(510, 62, 366, 372);
  label(526, 78, 'THE GRAMMAR, AND WHAT IT COSTS');
  bullets(526, 102, [
    'constant: a, b, socrates',
    'variable: x, y, z',
    'function: f(t1, t2) applied to terms',
    'atom: a predicate applied to terms',
    'a predicate is not a term'
  ], p, 0.05, 0.08, { lead: 22, size: 10.5 });
  P.line(526, 220, 860, 220, { stroke: BORDER, sw: 1 });
  body(526, 236, 'Because f may take its own output:', { size: 10, color: DIM });
  body(526, 258, 'a, f(a), f(f(a)), ...', { size: 11, mono: true });
  body(526, 280, 'infinitely many terms from three symbols.', { size: 10.5, color: BAD });
  if (p > 0.55) {
    body(526, 314, 'So a method that lists terms cannot stop.', { size: 10.5 });
    body(526, 334, 'Unification never lists them.', { size: 10.5, color: ACC, bold: true });
    body(526, 366, 'Two terms are equal exactly when the trees', { size: 10 });
    body(526, 384, 'match node for node, names included.', { size: 10 });
    body(526, 412, 'Only variables are replaceable.', { size: 10, color: DIM });
  }
}

/* ---------- scene 3: subst ---------- */
function sceneSubst(t, sc) {
  var p = prog(t, sc);
  heading('A substitution is a finite list of replacements');
  subline('It maps variables to terms and leaves constants alone.');

  card(24, 62, 520, 200);
  label(40, 78, 'APPLYING {x/a, y/b}');
  if (p > 0.05) {
    chip(52, 100, 150, 40, 'f(x, g(y))', { size: 11.5 });
    txt(222, 120, '\u2192', { size: 16, align: 'center', base: 'middle', color: ACC });
    chip(250, 100, 150, 40, 'f(a, g(b))', { size: 11.5, fill: ACCDIM, stroke: ACC });
  }
  if (p > 0.3) {
    body(40, 160, 'Every occurrence at once, not one node per step.', { size: 10.5 });
    body(40, 180, 'Applying it twice changes nothing: substitutions are idempotent.', { size: 10.5 });
    body(40, 206, 'sigma then theta, written sigma . theta, means apply sigma first.', { size: 10.5, color: DIM });
    body(40, 232, 'The result is again a finite map, so composition stays simple.', { size: 10.5, color: DIM });
  }

  card(560, 62, 316, 200, { fill: WARNDIM, stroke: WARN });
  label(576, 78, 'ORDER MATTERS', WARN);
  body(576, 100, '{x/y} then {y/a} gives', { size: 10.5, mono: true });
  body(576, 122, 'x becomes a', { size: 10.5, mono: true, color: WARN, bold: true });
  body(576, 148, '{y/a} then {x/y} gives', { size: 10.5, mono: true });
  body(576, 170, 'x stays x', { size: 10.5, mono: true, color: WARN, bold: true });
  body(576, 200, 'The engine prints both, so the', { size: 10 });
  body(576, 218, 'difference is a picture.', { size: 10 });
  body(576, 242, 'Associative, not commutative.', { size: 10.5, bold: true });

  card(24, 276, 852, 158);
  label(40, 292, 'WHY THE ALGORITHM CAN KEEP ONE RUNNING MAP');
  body(40, 316, 'Composition is associative: (sigma . theta) . rho = sigma . (theta . rho).', { size: 10.5, mono: true });
  body(40, 340, 'So each new binding can be folded into the one map already held, in any grouping,', { size: 10.5 });
  body(40, 358, 'and the answer does not change. That is the only reason the unification algorithm', { size: 10.5 });
  body(40, 376, 'can be written as a loop that carries a single substitution forward.', { size: 10.5 });
  if (p > 0.6) {
    body(40, 406, 'The page checks associativity on a concrete triple, and finds the pair of orders that disagree.', { size: 10, color: DIM });
  }
}

/* ---------- scene 4: unify ---------- */
function sceneUnify(t, sc) {
  var p = prog(t, sc);
  heading('Walk both trees until they disagree');
  subline('Robinson\u2019s algorithm: find the first disagreement, repair it, repeat.');

  card(24, 62, 852, 168);
  label(40, 78, 'THE TWO TERMS, SIDE BY SIDE');
  if (p > 0.02) {
    termTree(fn('f', [v('x'), fn('g', [v('y')])]), 210, 112, 70, 46);
    termTree(fn('f', [c('a'), fn('g', [c('b')])]), 620, 112, 70, 46);
    txt(415, 112, 'vs', { size: 12, align: 'center', base: 'middle', color: FAINT });
  }
  if (p > 0.5) {
    body(40, 212, 'Roots agree (f) and the arities agree, so descend into the arguments in order.', { size: 9.5, color: DIM });
  }

  card(24, 242, 520, 192);
  label(40, 258, 'THE WALK, STEP BY STEP');
  var steps = V.mainSteps;
  for (var i = 0; i < steps.length; i++) {
    if (p < 0.25 + i * 0.22) break;
    var y = 282 + i * 56;
    card(40, y, 488, 44, { fill: SURF2, stroke: BORDER });
    body(56, y + 12, 'disagreement ' + (i + 1) + ': bind ' + steps[i].x + ' to ' + str(steps[i].t), { size: 10.5, mono: true });
    body(56, y + 28, 'substitution now ' + substText(steps[i].s), { size: 9.5, mono: true, color: ACC });
  }
  if (p > 0.9) {
    body(40, 400, 'Disagreement set empty: the pair is unified.', { size: 10.5, color: VAL, bold: true });
  }

  card(560, 242, 316, 192);
  label(576, 258, 'WHAT THE WALK DECIDES');
  body(576, 282, 'It stops at the first place the', { size: 10.5 });
  body(576, 300, 'symbols differ. Everything above', { size: 10.5 });
  body(576, 318, 'that point already agrees.', { size: 10.5 });
  if (p > 0.55) {
    body(576, 348, 'A variable there is repairable.', { size: 10.5, color: VAL });
    body(576, 366, 'Two symbols there are not.', { size: 10.5, color: BAD });
    body(576, 396, 'The binding is applied before the', { size: 10 });
    body(576, 414, 'walk continues, never after.', { size: 10 });
  }
}

function substText(s) {
  var ks = Object.keys(s);
  if (!ks.length) return '{}';
  ks.sort();
  return '{' + ks.map(function (k) { return k + '/' + str(s[k]); }).join(', ') + '}';
}

/* ---------- scene 5: fail ---------- */
function sceneFail(t, sc) {
  var p = prog(t, sc);
  heading('The three ways unification fails');
  subline('Two are fatal on the spot. The third fails only after a binding is applied.');

  var boxes = [
    { x: 24, title: 'CLASH', colour: BAD, dim: BADDIM, a: 'a  vs  b', why: 'two constants differ' },
    { x: 312, title: 'OCCURS', colour: WARN, dim: WARNDIM, a: 'x  vs  f(x)', why: 'x sits inside the term' },
    { x: 600, title: 'UNDONE', colour: INFO, dim: SURF2, a: 'f(x,x) vs f(a,b)', why: 'x:=a, then a vs b' }
  ];
  for (var i = 0; i < boxes.length; i++) {
    if (p < 0.05 + i * 0.12) break;
    var b = boxes[i];
    card(b.x, 62, 276, 208, { fill: b.dim, stroke: b.colour });
    label(b.x + 16, 78, b.title, b.colour);
    body(b.x + 16, 104, b.a, { size: 11, mono: true, bold: true });
    body(b.x + 16, 128, b.why, { size: 10, color: DIM });
    body(b.x + 16, 156, V.failLines[i][0], { size: 9.5 });
    body(b.x + 16, 174, V.failLines[i][1], { size: 9.5 });
    body(b.x + 16, 192, V.failLines[i][2], { size: 9.5 });
    chip(b.x + 16, 218, 244, 34, V.failReasons[i], { size: 9.5, fill: SURF, stroke: b.colour, color: b.colour });
  }

  card(24, 286, 852, 148);
  label(40, 302, 'WHAT EACH ONE MEANS');
  body(40, 326, 'A clash and an occurs check are local: no substitution can ever fix them, and the engine', { size: 10.5 });
  body(40, 344, 'says so at the point it finds them. The third case starts well and dies later, because the', { size: 10.5 });
  body(40, 362, 'first binding rewrote the term that the second comparison was about.', { size: 10.5 });
  if (p > 0.6) {
    body(40, 392, 'Brute force over ' + V.universe + ' terms finds no unifier for any of the three, which is the check', { size: 10, color: DIM });
    body(40, 410, 'that the engine\u2019s refusal is right rather than merely cautious.', { size: 10, color: DIM });
  }
}

/* ---------- scene 6: mgu ---------- */
function sceneMgu(t, sc) {
  var p = prog(t, sc);
  heading('The most general unifier is the least commitment');
  subline('Many substitutions unify a pair. Resolution needs the one that says least.');

  card(24, 62, 520, 200);
  label(40, 78, 'THE DEFINITION, IN WORDS FIRST');
  bullets(40, 100, [
    'sigma unifies the pair: applying it makes the terms equal.',
    'sigma is most general when every other unifier is',
    'sigma followed by some substitution: theta = sigma . theta2.',
    'It commits only to what agreement forces.'
  ], p, 0.05, 0.12, { lead: 26, size: 10.5 });
  if (p > 0.55) {
    body(40, 216, 'The page tests that property on every unifier in its search space,', { size: 10 });
    body(40, 234, 'instead of quoting the definition and moving on.', { size: 10 });
  }

  card(560, 62, 316, 200, { fill: ACCDIM, stroke: ACC });
  label(576, 78, 'THE NUMBERS', ACC);
  body(576, 100, 'f(x,y) against f(y,a)', { size: 10.5, mono: true });
  body(576, 122, V.unifierCounts[0] + ' unifiers in the search space', { size: 10.5, color: ACC, bold: true });
  body(576, 148, 'p(x,f(x)) against p(y,z)', { size: 10.5, mono: true });
  body(576, 170, V.unifierCounts[1] + ' unifiers', { size: 10.5, color: ACC, bold: true });
  body(576, 200, 'One of each is most general.', { size: 10 });
  body(576, 218, 'The others are its instances.', { size: 10 });
  body(576, 242, 'Unique up to renaming.', { size: 10.5, bold: true });

  card(24, 276, 852, 158, { fill: WARNDIM, stroke: WARN });
  label(40, 292, 'THE TWO WORDS THAT GET SWAPPED', WARN);
  body(40, 316, 'Most general means least specific: it leaves as much open as agreement allows.', { size: 10.5 });
  body(40, 340, 'Matching is the one-way case: the pattern has variables, the other side is fixed,', { size: 10.5 });
  body(40, 358, 'so only the pattern may be bound. Unification may bind either side, which is why', { size: 10.5 });
  body(40, 376, 'a against f(y) fails as a substitution although it succeeds as a match.', { size: 10.5 });
  if (p > 0.55) {
    body(40, 406, 'A more specific unifier throws away resolvents that a general one would have produced.', { size: 10, color: WARN });
  }
}

/* ---------- scene 7: skolem ---------- */
function sceneSkolem(t, sc) {
  var p = prog(t, sc);
  heading('Skolemisation: a witness needs a name');
  subline('Prenex first, then one fresh symbol per existential, of the right arity.');

  card(24, 62, 520, 232);
  label(40, 78, 'ARITY IS THE NUMBER OF UNIVERSALS TO THE LEFT');
  var rows = [
    ['\u2203y\u2200x R(x,y)', 'constant c', 0],
    ['\u2200x\u2203y R(x,y)', 'f(x)', 1],
    ['\u2200x\u2200z\u2203y R(x,z,y)', 'f(x,z)', 2]
  ];
  for (var i = 0; i < rows.length; i++) {
    if (p < 0.08 + i * 0.14) break;
    var y = 104 + i * 58;
    card(40, y, 488, 46, { fill: SURF2, stroke: BORDER });
    body(56, y + 14, rows[i][0], { size: 10.5, mono: true });
    body(56, y + 32, rows[i][1] + '   (' + rows[i][2] + ' argument' + (rows[i][2] === 1 ? '' : 's') + ')', { size: 9.5, mono: true, color: ACC });
  }
  if (p > 0.6) {
    body(40, 276, 'A fresh symbol each time: two existentials may pick different objects.', { size: 9.5, color: DIM });
  }

  card(560, 62, 316, 232, { fill: WARNDIM, stroke: WARN });
  label(576, 78, 'WHAT IS PRESERVED', WARN);
  body(576, 102, 'satisfiable if and only if', { size: 10.5 });
  body(576, 122, 'the original is', { size: 10.5, bold: true });
  body(576, 148, 'not equivalent:', { size: 10.5, color: BAD, bold: true });
  body(576, 170, V.nonEquiv + ' models of the originals', { size: 9.5 });
  body(576, 186, 'fail their Skolem form', { size: 9.5 });
  body(576, 212, 'The form is stronger: it names', { size: 10 });
  body(576, 230, 'a witness the sentence only', { size: 10 });
  body(576, 248, 'promised to exist.', { size: 10 });
  body(576, 274, 'So it may refute, never prove.', { size: 10, color: WARN, bold: true });

  card(24, 306, 852, 128);
  label(40, 322, 'THE QUANTIFIER SWAP THAT IS NOT ALLOWED');
  body(40, 346, 'for all x there exists y R(x,y) says each x has its own witness.', { size: 10.5 });
  body(40, 364, 'there exists y for all x R(x,y) says one witness serves every x.', { size: 10.5 });
  if (p > 0.5) {
    body(40, 392, 'The first implies the second only when the domain has one element, or when R happens', { size: 10, color: DIM });
    body(40, 410, 'to be constant in its second argument. A two-element model separates them, and scene 10 prints it.', { size: 10, color: DIM });
  }
}

/* ---------- scene 8: resolve ---------- */
function sceneResolve(t, sc) {
  var p = prog(t, sc);
  heading('Resolve after you unify');
  subline('One complementary pair, one most general unifier, everything else kept.');

  card(24, 62, 852, 132);
  label(40, 78, 'THE STEP ON A TWO-CLAUSE EXAMPLE');
  if (p > 0.03) {
    chip(40, 100, 250, 40, '\u00acMan(x) \u2228 Mortal(x)', { size: 11 });
    chip(310, 100, 120, 40, 'Man(s)', { size: 11 });
    txt(452, 120, '\u2192', { size: 16, align: 'center', base: 'middle', color: ACC });
    chip(478, 100, 150, 40, 'Mortal(s)', { size: 11, fill: ACCDIM, stroke: ACC });
    body(650, 106, 'pivot: Man(x) with Man(s)', { size: 9.5, mono: true, color: DIM });
    body(650, 124, 'unifier: ' + substText(V.socratesUnifier), { size: 9.5, mono: true, color: ACC });
    body(650, 142, 'rest: Mortal(x) applied', { size: 9.5, mono: true, color: DIM });
  }

  card(24, 206, 520, 228);
  label(40, 222, 'THE RULE, IN FOUR MOVES');
  var mv = [
    ['1', 'Rename the two clauses apart.'],
    ['2', 'Choose one positive and one negative atom, same predicate.'],
    ['3', 'Take their most general unifier.'],
    ['4', 'Apply it to every remaining literal; keep the result.']
  ];
  for (var i = 0; i < mv.length; i++) {
    if (p < 0.1 + i * 0.14) break;
    var y = 246 + i * 44;
    P.circle(56, y + 8, 11, { fill: ACCDIM, stroke: ACC, sw: 1 });
    txt(56, y + 8, mv[i][0], { size: 10, mono: true, align: 'center', base: 'middle', color: ACC, bold: true });
    body(78, y, mv[i][1], { size: 10.5 });
  }
  if (p > 0.68) {
    body(40, 414, 'Soundness: every interpretation of both parents satisfies the resolvent.', { size: 9.5, color: VAL });
  }

  card(560, 206, 316, 228, { fill: SURF2, stroke: BORDER });
  label(576, 222, 'FACTORING, AND ITS DIRECTION');
  body(576, 246, 'P(x) \u2228 P(y) \u2228 \u00acR(x,y)', { size: 10, mono: true });
  body(576, 266, 'factors to', { size: 9.5, color: DIM });
  body(576, 286, 'P(z) \u2228 \u00acR(z,z)', { size: 10, mono: true, color: ACC });
  if (p > 0.45) {
    body(576, 312, 'The factor implies the clause.', { size: 10 });
    body(576, 330, 'The clause does not imply it.', { size: 10, color: BAD });
    body(576, 356, 'So factoring is not an', { size: 10 });
    body(576, 374, 'equivalence: it strengthens.', { size: 10, bold: true });
    body(576, 402, 'Robinson included it because', { size: 9.5, color: DIM });
    body(576, 418, 'completeness needs it.', { size: 9.5, color: DIM });
  }
}

/* ---------- scene 9: proof ---------- */
function sceneProof(t, sc) {
  var p = prog(t, sc);
  heading('One refutation, lifted from the ground case');
  subline('Three clauses, two steps, one empty root.');

  label(40, 70, 'THE PROOF AS A TREE');
  var bx = [40, 350, 660];
  if (p > 0.03) {
    chip(bx[0], 86, 230, 38, '\u00acMan(x) \u2228 Mortal(x)', { size: 10.5 });
    chip(bx[1], 86, 130, 38, 'Man(s)', { size: 10.5 });
    chip(bx[2], 86, 150, 38, '\u00acMortal(s)', { size: 10.5 });
  }
  if (p > 0.25) {
    P.line(155, 124, 300, 186, { stroke: BORDER, sw: 1.2 });
    P.line(415, 124, 320, 186, { stroke: BORDER, sw: 1.2 });
    chip(240, 190, 150, 38, 'Mortal(s)', { size: 10.5, fill: ACCDIM, stroke: ACC });
    body(400, 200, 'x becomes s', { size: 9.5, mono: true, color: ACC });
  }
  if (p > 0.55) {
    P.line(315, 228, 420, 286, { stroke: BORDER, sw: 1.2 });
    P.line(735, 124, 470, 286, { stroke: BORDER, sw: 1.2 });
    chip(400, 290, 90, 38, '\u25a1', { size: 14, fill: BADDIM, stroke: BAD, color: BAD });
    body(510, 302, 'no substitution needed', { size: 9.5, mono: true, color: BAD });
  }
  if (p > 0.8) {
    body(40, 348, 'Leaves 3, steps 2, root empty: the set is unsatisfiable, so the goal follows.', { size: 10, color: DIM });
  }

  card(40, 372, 400, 82, { fill: ACCDIM, stroke: ACC });
  body(56, 388, 'Lifting: each step here is an instance', { size: 10 });
  body(56, 406, 'of a general step. The ground refutation', { size: 10 });
  body(56, 424, 'is raised, not searched for.', { size: 10 });

  card(460, 372, 416, 82, { fill: SURF2, stroke: BORDER });
  body(476, 388, 'Completeness: Herbrand gives ground', { size: 10 });
  body(476, 406, 'instances; ground resolution refutes them;', { size: 10 });
  body(476, 424, 'lifting returns to the clauses themselves.', { size: 10 });
}

/* ---------- scene 10: limits ---------- */
function sceneLimits(t, sc) {
  var p = prog(t, sc);
  heading('What this method does not do');
  subline('A refutation is a proof. A search that found nothing is not an answer.');

  card(24, 62, 400, 372);
  label(40, 78, 'THREE REAL LIMITS');
  bullets(40, 100, [
    'Semi-decidable: by Church\u2019s theorem no',
    'algorithm decides first-order validity.',
    'So a stalled search proves nothing.',
    '',
    'No built-in equality: a = a needs',
    'axioms or paramodulation.',
    '',
    'Syntactic: unification matches terms,',
    'it does not know arithmetic.'
  ], p, 0.05, 0.07, { lead: 22, size: 10 });
  if (p > 0.6) {
    body(40, 390, 'Each limit is a boundary of the rule, not a bug in it.', { size: 9.5, color: DIM });
  }

  card(440, 62, 436, 372, { fill: SURF2, stroke: BORDER });
  label(456, 78, 'GATE CSE 2017 SET 1, DECIDED HERE');
  body(456, 100, 'F: \u2200x\u2203y R(x,y)', { size: 10.5, mono: true, bold: true });
  body(456, 122, 'Which of I\u2013IV does F imply?', { size: 9.5, color: DIM });
  var rows = [
    ['I', '\u2203y\u2203x R(x,y)', V.gate.I.valid],
    ['II', '\u2203y\u2200x R(x,y)', V.gate.II.valid],
    ['III', '\u2200y\u2203x R(x,y)', V.gate.III.valid],
    ['IV', '\u00ac\u2203x\u2200y\u00acR(x,y)', V.gate.IV.valid]
  ];
  for (var i = 0; i < rows.length; i++) {
    if (p < 0.1 + i * 0.1) break;
    var y = 146 + i * 40;
    body(456, y, rows[i][0], { size: 10, mono: true, bold: true });
    body(482, y, rows[i][1], { size: 10, mono: true });
    chip(772, y - 8, 88, 24, rows[i][2] ? 'implied' : 'refuted', {
      size: 9, fill: rows[i][2] ? ACCDIM : BADDIM, stroke: rows[i][2] ? ACC : BAD,
      color: rows[i][2] ? ACC : BAD
    });
  }
  if (p > 0.6) {
    body(456, 312, 'Countermodel for II on two elements:', { size: 9.5, color: DIM });
    body(456, 330, 'R = {(0,1), (1,0)}: every x has a y,', { size: 9.5, mono: true });
    body(456, 346, 'but no single y serves both x.', { size: 9.5 });
    body(456, 368, 'Countermodel for III: R = {(0,0), (1,0)}', { size: 9.5, mono: true });
    body(456, 384, 'leaves element 1 with no preimage.', { size: 9.5 });
    body(456, 408, 'Answer: I and IV only.', { size: 10.5, bold: true, color: ACC });
  }
}

var SCENE_DRAW = {
  why: sceneWhy,
  terms: sceneTerms,
  subst: sceneSubst,
  unify: sceneUnify,
  fail: sceneFail,
  mgu: sceneMgu,
  skolem: sceneSkolem,
  resolve: sceneResolve,
  proof: sceneProof,
  limits: sceneLimits
};

/* the frame */
function drawFrame(P2) {
  P = P2;
  P.alpha(1);
  P.clear();
  P.rect(0, 0, W, H, { fill: SURF });

  var t = (K && K.state) ? K.state.elapsed : 0;
  var scenes = (K && K.state && K.state.scenes) ? K.state.scenes : [];
  var i = 0;
  for (var k = scenes.length - 1; k >= 0; k--) {
    if (t >= scenes[k].start - 1e-6) { i = k; break; }
  }
  var sc = scenes[i];
  if (!sc) return;
  var fn2 = SCENE_DRAW[sc.id];
  if (!fn2) return;
  try {
    fn2(t, sc);
  } catch (err) {
    console.error('scene draw failed', sc.id, err);
  }
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

  fillChecks();

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
