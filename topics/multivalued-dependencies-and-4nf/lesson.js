/* ==========================================================================
   multivalued-dependencies-and-4nf — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model implements the multivalued dependency twice (Fagin's set form and
   the tuple-swap form), the natural join and projection it is stated in,
   attribute closure, candidate keys, the BCNF and 4NF tests, and the tableau
   chase. The drawing code reads the model and performs no dependency
   arithmetic of its own.
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
   LAYER 1 - THE MODEL
   Every number this lesson shows is computed here, from the definitions.
   Nothing is copied from a slide deck.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}
function fx(v, k) { return Number(v).toFixed(k === undefined ? 0 : k); }

/* ---------- relations as sets of tuples over an attribute list ---------- */

function key(t, idxs) {
  var s = [], i;
  for (i = 0; i < idxs.length; i++) s.push(String(t[idxs[i]]));
  return s.join('|');
}
function proj(r, idxs) {
  var seen = {}, out = [], i;
  for (i = 0; i < r.length; i++) {
    var k = key(r[i], idxs);
    if (!seen[k]) { seen[k] = 1; out.push(idxs.map(function (j) { return r[i][j]; })); }
  }
  return out;
}
function uniq(r) {
  var seen = {}, out = [], i;
  for (i = 0; i < r.length; i++) {
    var k = r[i].join('|');
    if (!seen[k]) { seen[k] = 1; out.push(r[i]); }
  }
  return out;
}
function sameSet(a, b) {
  if (a.length !== b.length) return false;
  var A = a.map(function (t) { return t.join('|'); }).sort();
  var B = b.map(function (t) { return t.join('|'); }).sort();
  for (var i = 0; i < A.length; i++) if (A[i] !== B[i]) return false;
  return true;
}
function complement(n, set) {
  var out = [], i;
  for (i = 0; i < n; i++) if (set.indexOf(i) < 0) out.push(i);
  return out;
}
function disjoint(a, b) {
  for (var i = 0; i < a.length; i++) if (b.indexOf(a[i]) >= 0) return false;
  return true;
}

/* natural join of two relations on the shared attributes */
function naturalJoin(r1, a1, r2, a2) {
  var shared = a1.filter(function (x) { return a2.indexOf(x) >= 0; });
  var out = [], i, j;
  for (i = 0; i < r1.length; i++) {
    for (j = 0; j < r2.length; j++) {
      var ok = true, s;
      for (s = 0; s < shared.length && ok; s++) {
        var ia = a1.indexOf(shared[s]), ib = a2.indexOf(shared[s]);
        if (String(r1[i][ia]) !== String(r2[j][ib])) ok = false;
      }
      if (!ok) continue;
      var attrs = a1.slice();
      a2.forEach(function (a) { if (attrs.indexOf(a) < 0) attrs.push(a); });
      out.push(attrs.map(function (a) {
        if (a1.indexOf(a) >= 0) return r1[i][a1.indexOf(a)];
        return r2[j][a2.indexOf(a)];
      }));
    }
  }
  return out;
}


/* join two projections of r and return tuples in the schema's own attribute
   order 0..n-1, so that two relations can be compared tuple by tuple        */
function joinCanon(r, n, A1, A2) {
  var shared = A1.filter(function (a) { return A2.indexOf(a) >= 0; });
  var p1 = proj(r, A1), p2 = proj(r, A2), out = [], i, j;
  for (i = 0; i < p1.length; i++) {
    for (j = 0; j < p2.length; j++) {
      var ok = true, s;
      for (s = 0; s < shared.length && ok; s++) {
        var ia = A1.indexOf(shared[s]), ib = A2.indexOf(shared[s]);
        if (String(p1[i][ia]) !== String(p2[j][ib])) ok = false;
      }
      if (!ok) continue;
      var t = new Array(n), k;
      for (k = 0; k < A1.length; k++) t[A1[k]] = p1[i][k];
      for (k = 0; k < A2.length; k++) t[A2[k]] = p2[j][k];
      out.push(t);
    }
  }
  return uniq(out);
}


/* a three-way join, used to show that more fragments than the MVD gives is
   not automatically lossless                                                  */
function join3(r, n, A1, A2, A3) {
  var p1 = proj(r, A1), p2 = proj(r, A2), p3 = proj(r, A3), out = [], i, j, k;
  function agree(a, b, S) {
    for (var s = 0; s < S.length; s++) {
      if (String(a[S[s][0]]) !== String(b[S[s][1]])) return false;
    }
    return true;
  }
  var sh12 = A1.filter(function (a) { return A2.indexOf(a) >= 0; }).map(function (a) { return [A1.indexOf(a), A2.indexOf(a)]; });
  var sh13 = A1.filter(function (a) { return A3.indexOf(a) >= 0; }).map(function (a) { return [A1.indexOf(a), A3.indexOf(a)]; });
  var sh23 = A2.filter(function (a) { return A3.indexOf(a) >= 0; }).map(function (a) { return [A2.indexOf(a), A3.indexOf(a)]; });
  for (i = 0; i < p1.length; i++) {
    for (j = 0; j < p2.length; j++) {
      if (!agree(p1[i], p2[j], sh12)) continue;
      for (k = 0; k < p3.length; k++) {
        if (!agree(p1[i], p3[k], sh13)) continue;
        if (!agree(p2[j], p3[k], sh23)) continue;
        var t = new Array(n), q;
        for (q = 0; q < A1.length; q++) t[A1[q]] = p1[i][q];
        for (q = 0; q < A2.length; q++) t[A2[q]] = p2[j][q];
        for (q = 0; q < A3.length; q++) t[A3[q]] = p3[k][q];
        out.push(t);
      }
    }
  }
  return uniq(out);
}

/* ---------- the multivalued dependency, definition A: Fagin ----------
   X ->> Y holds when, for every x, the set of Y-values paired with x does
   not depend on which Z-value you fix.  Y_{x,z} depends only on x.       */

function mvdFagin(r, n, X, Y) {
  var Z = complement(n, X.concat(Y));
  var byX = {}, i;
  for (i = 0; i < r.length; i++) {
    var xk = key(r[i], X), zk = key(r[i], Z), yk = key(r[i], Y);
    if (!byX[xk]) byX[xk] = {};
    if (!byX[xk][zk]) byX[xk][zk] = {};
    byX[xk][zk][yk] = 1;
  }
  var xs = Object.keys(byX);
  for (i = 0; i < xs.length; i++) {
    var zs = Object.keys(byX[xs[i]]), first = null;
    for (var j = 0; j < zs.length; j++) {
      var set = Object.keys(byX[xs[i]][zs[j]]).sort().join(',');
      if (first === null) first = set;
      else if (set !== first) return false;
    }
  }
  return true;
}

/* ---------- definition B: the four-tuple / swap condition ----------
   if two tuples agree on X, then the tuple with X and Z from the first and
   Y from the second must also be present (and its mirror image too).      */

function mvdSwap(r, n, X, Y) {
  var Z = complement(n, X.concat(Y));
  var i, j;
  function present(tX, tY, tZ) {
    for (var k = 0; k < r.length; k++) {
      if (key(r[k], X) === key(tX, X) && key(r[k], Y) === key(tY, Y) &&
          key(r[k], Z) === key(tZ, Z)) return true;
    }
    return false;
  }
  for (i = 0; i < r.length; i++) {
    for (j = 0; j < r.length; j++) {
      if (key(r[i], X) !== key(r[j], X)) continue;
      if (!present(r[i], r[j], r[i])) return false;   /* t3 */
      if (!present(r[i], r[i], r[j])) return false;   /* t4 */
    }
  }
  return true;
}

function fdHolds(r, X, Y) {
  for (var i = 0; i < r.length; i++) {
    for (var j = 0; j < r.length; j++) {
      if (key(r[i], X) === key(r[j], X) && key(r[i], Y) !== key(r[j], Y)) return false;
    }
  }
  return true;
}

/* ---------- every relation on three attributes over a two-value domain ---------- */
/* 2 x 2 x 2 = 8 possible tuples, so exactly 256 relations. Exhaustive.     */

function allTuples(domain, n) {
  var out = [[]], i, d;
  for (i = 0; i < n; i++) {
    var next = [];
    for (var k = 0; k < out.length; k++) {
      for (d = 0; d < domain.length; d++) next.push(out[k].concat([domain[d]]));
    }
    out = next;
  }
  return out;
}
function allRelations(domain, n) {
  var tup = allTuples(domain, n), out = [], mask;
  for (mask = 0; mask < (1 << tup.length); mask++) {
    var r = [];
    for (var i = 0; i < tup.length; i++) if (mask & (1 << i)) r.push(tup[i]);
    out.push(r);
  }
  return out;
}

var REL3 = allRelations([0, 1], 3);
var PAIRS3 = (function () {
  var out = [], X, Y, subsets = [[], [0], [1], [2], [0, 1], [0, 2], [1, 2], [0, 1, 2]];
  for (var a = 0; a < subsets.length; a++) {
    for (var b = 0; b < subsets.length; b++) {
      X = subsets[a]; Y = subsets[b];
      if (Y.length === 0) continue;
      if (!disjoint(X, Y)) continue;
      out.push([X, Y]);
    }
  }
  return out;
})();

/* the two definitions agree everywhere */
var defAgree = 0, defCases = 0;
REL3.forEach(function (r) {
  PAIRS3.forEach(function (p) {
    defCases++;
    if (mvdFagin(r, 3, p[0], p[1]) === mvdSwap(r, 3, p[0], p[1])) defAgree++;
  });
});
chk('the two definitions of an MVD agree on all ' + defCases + ' cases',
    defAgree === defCases, defAgree + ' of ' + defCases);

/* an FD is an MVD */
var fdImpCases = 0, fdImpOk = 0;
REL3.forEach(function (r) {
  PAIRS3.forEach(function (p) {
    if (fdHolds(r, p[0], p[1])) {
      fdImpCases++;
      if (mvdFagin(r, 3, p[0], p[1])) fdImpOk++;
    }
  });
});
chk('every FD implies its MVD (' + fdImpCases + ' instances where the FD holds)',
    fdImpOk === fdImpCases, fdImpOk + ' of ' + fdImpCases);

/* an MVD need not be an FD: count the witnesses */
var mvdNotFd = 0;
REL3.forEach(function (r) {
  PAIRS3.forEach(function (p) {
    if (mvdFagin(r, 3, p[0], p[1]) && !fdHolds(r, p[0], p[1])) mvdNotFd++;
  });
});
chk('an MVD need not be an FD, and witnesses exist', mvdNotFd > 0, mvdNotFd + ' witnesses');

/* complementation: X ->> Y  iff  X ->> Z */
var compCases = 0, compOk = 0;
REL3.forEach(function (r) {
  PAIRS3.forEach(function (p) {
    var Z = complement(3, p[0].concat(p[1]));
    if (Z.length === 0) return;
    compCases++;
    if (mvdFagin(r, 3, p[0], p[1]) === mvdFagin(r, 3, p[0], Z)) compOk++;
  });
});
chk('complementation X->>Y iff X->>Z holds on all ' + compCases + ' cases',
    compOk === compCases, compOk + ' of ' + compCases);

/* Fagin's Theorem 1: X ->> Y iff r is the join of its XY and XZ projections */
var thm1Cases = 0, thm1Ok = 0, thm1Yes = 0;
REL3.forEach(function (r) {
  PAIRS3.forEach(function (p) {
    var X = p[0], Y = p[1], Z = complement(3, X.concat(Y));
    var j = joinCanon(r, 3, X.concat(Y), X.concat(Z));
    thm1Cases++;
    var holds = mvdFagin(r, 3, X, Y);
    if (holds) thm1Yes++;
    if (holds === sameSet(j, r)) thm1Ok++;
  });
});
chk('Theorem 1: MVD iff the two projections join back to r (' + thm1Cases + ' cases)',
    thm1Ok === thm1Cases, thm1Ok + ' of ' + thm1Cases + '; MVD held in ' + thm1Yes);

/* ---------- the employee example: a multi-valued fact next to a scalar one ----------
   Fagin's Table II: EMPLOYEE, CHILD, SALARY, YEAR. Two independent multi-valued
   facts about one employee: children, and salary history.                    */

var A4 = ['Employee', 'Child', 'Salary', 'Year'];
var EMP = [
  ['Pythagoras', 'Peter', 20, 1976],
  ['Pythagoras', 'Peter', 25, 1977],
  ['Pythagoras', 'Paul', 20, 1976],
  ['Pythagoras', 'Paul', 25, 1977],
  ['Gauss', 'Gwendolyn', 40, 1976],
  ['Gauss', 'Gwendolyn', 50, 1976],
  ['Gauss', 'Greta', 40, 1976],
  ['Gauss', 'Greta', 50, 1976]
];
var EMP_T = EMP.filter(function (t) { return !(t[0] === 'Gauss' && t[1] === 'Greta' && t[2] === 50); });

var E = [0], CH = [1], SAL = [2, 3];
chk('Employee ->> Child holds on the full employee table',
    mvdFagin(EMP, 4, E, CH));
chk('deleting one tuple breaks it (Fagin\'s T prime)',
    !mvdFagin(EMP_T, 4, E, CH));
chk('Employee ->> {Salary,Year} holds as well',
    mvdFagin(EMP, 4, E, SAL));
chk('Employee -> Child does not hold: it is not an FD',
    !fdHolds(EMP, E, CH));

/* the redundancy arithmetic: c children and s salary-years cost c*s rows */
var REDUNDANCY = [];
var redOk = true, redIdent = true, redOne = true, redMin = 99;
for (var c = 1; c <= 6; c++) {
  for (var s = 1; s <= 6; s++) {
    var flat = c * s, split = c + s;
    REDUNDANCY.push({ c: c, s: s, flat: flat, split: split, saved: flat - split });
    /* the saving is real only when both counts are at least two */
    if (c >= 2 && s >= 2 && flat < split) redOk = false;
    /* with one child or one salary there is nothing to split, so it costs one row more */
    if ((c === 1 || s === 1) && split !== flat + 1) redOne = false;
    if (flat - split !== (c - 1) * (s - 1) - 1) redIdent = false;
    if (c >= 2 && s >= 2 && flat - split < redMin) redMin = flat - split;
  }
}
chk('when both counts are at least two, splitting never costs more rows', redOk);
chk('when one count is 1 there is nothing to split and it costs exactly one row more', redOne);
chk('the saving is exactly (c-1)(s-1) - 1 in all 36 cases, and 0 at c = s = 2',
    redIdent && redMin === 0, 'smallest saving ' + redMin);
var empSaving = 0;
[['Pythagoras', 2, 2], ['Gauss', 2, 2]].forEach(function (e) { empSaving += e[1] * e[2] - (e[1] + e[2]); });
chk('the eight-row employee table splits into 4 + 4 rows, saving 0',
    EMP.length === 8 && empSaving === 0, 'saving ' + empSaving);

/* ---------- the pizza table: a 4NF violation inside a BCNF schema ----------
   Restaurant, Pizza variety, Delivery area. Every attribute is part of the only
   key, so the schema is in BCNF; the two multi-valued facts are independent.  */

var A3 = ['Restaurant', 'Variety', 'Area'];
var PIZZA = [
  ['A1', 'Thick', 'Springfield'], ['A1', 'Thick', 'Shelbyville'], ['A1', 'Thick', 'Capital'],
  ['A1', 'Stuffed', 'Springfield'], ['A1', 'Stuffed', 'Shelbyville'], ['A1', 'Stuffed', 'Capital'],
  ['Elite', 'Thin', 'Capital'], ['Elite', 'Stuffed', 'Capital'],
  ['Vincenzo', 'Thick', 'Springfield'], ['Vincenzo', 'Thick', 'Shelbyville'],
  ['Vincenzo', 'Thin', 'Springfield'], ['Vincenzo', 'Thin', 'Shelbyville']
];
var REST = [0], VAR = [1], AREA = [2];
chk('Restaurant ->> Variety holds on the 12-row pizza table',
    mvdFagin(PIZZA, 3, REST, VAR));
chk('Restaurant ->> Area holds too (complement)',
    mvdFagin(PIZZA, 3, REST, AREA));
chk('Restaurant -> Variety does not hold',
    !fdHolds(PIZZA, REST, VAR));

var pizV = proj(PIZZA, [0, 1]), pizA = proj(PIZZA, [0, 2]);
chk('the pizza table splits into ' + pizV.length + ' + ' + pizA.length + ' rows without loss',
    pizV.length === 6 && pizA.length === 6 &&
    sameSet(joinCanon(PIZZA, 3, [0, 1], [0, 2]), PIZZA),
    pizV.length + ' + ' + pizA.length + ' = ' + PIZZA.length);

/* the update anomaly, counted: a new variety for A1 costs 3 rows flat, 1 row split */
var PIZZA_ADD = PIZZA.concat([['A1', 'Cheese', 'Springfield'], ['A1', 'Cheese', 'Shelbyville'], ['A1', 'Cheese', 'Capital']]);
chk('a new variety for A1 costs 3 rows flat and 1 row in the split tables',
    PIZZA_ADD.length - PIZZA.length === 3, 'flat +3');

/* the half-done update: two of the three areas, so the MVD now fails */
var PIZZA_BAD = PIZZA.concat([['A1', 'Cheese', 'Springfield'], ['A1', 'Cheese', 'Shelbyville']]);
chk('a half-done update breaks the MVD, so the table is no longer a legal instance',
    !mvdFagin(PIZZA_BAD, 3, REST, VAR));

/* ---------- keys, closures, and the normal forms ---------- */

function closure(X, fds, n) {
  var cur = X.slice(), changed = true;
  while (changed) {
    changed = false;
    for (var i = 0; i < fds.length; i++) {
      var lhs = fds[i][0], rhs = fds[i][1];
      var all = true;
      for (var a = 0; a < lhs.length; a++) if (cur.indexOf(lhs[a]) < 0) all = false;
      if (!all) continue;
      for (var b = 0; b < rhs.length; b++) {
        if (cur.indexOf(rhs[b]) < 0) { cur.push(rhs[b]); changed = true; }
      }
    }
  }
  return cur.sort(function (p, q) { return p - q; });
}
function isSuperkey(X, fds, n) { return closure(X, fds, n).length === n; }
function candidateKeys(n, fds) {
  var out = [], mask, X;
  for (mask = 1; mask < (1 << n); mask++) {
    X = [];
    for (var i = 0; i < n; i++) if (mask & (1 << i)) X.push(i);
    if (!isSuperkey(X, fds, n)) continue;
    var minimal = true;
    for (var j = 0; j < X.length; j++) {
      var sub = X.filter(function (v, k) { return k !== j; });
      if (sub.length && isSuperkey(sub, fds, n)) minimal = false;
    }
    if (minimal) out.push(X);
  }
  return out;
}
function isBCNF(n, fds) {
  for (var i = 0; i < fds.length; i++) {
    var X = fds[i][0], Y = fds[i][1];
    var trivial = true;
    for (var j = 0; j < Y.length; j++) if (X.indexOf(Y[j]) < 0) trivial = false;
    if (trivial) continue;
    if (!isSuperkey(X, fds, n)) return false;
  }
  return true;
}
/* 4NF is checked against the MVDs given, plus their complements, plus the MVDs
   that come from the FDs. It does not enumerate the full MVD closure; the
   lesson says so wherever it reports a verdict. */
function mvdsFromSchema(n, fds, mvds) {
  var out = [], i;
  for (i = 0; i < mvds.length; i++) out.push(mvds[i]);
  for (i = 0; i < fds.length; i++) out.push([fds[i][0], fds[i][1].filter(function (a) { return fds[i][0].indexOf(a) < 0; })]);
  var extra = [];
  out.forEach(function (m) {
    var Z = complement(n, m[0].concat(m[1]));
    if (m[1].length && Z.length) extra.push([m[0], Z]);
  });
  return out.concat(extra).filter(function (m) { return m[1].length > 0; });
}
function is4NF(n, fds, mvds) {
  var list = mvdsFromSchema(n, fds, mvds);
  for (var i = 0; i < list.length; i++) {
    var X = list[i][0], Y = list[i][1];
    var union = X.concat(Y).filter(function (v, k, a) { return a.indexOf(v) === k; });
    if (union.length === n) continue;                 /* trivial: X u Y = R */
    var sub = true;
    for (var j = 0; j < Y.length; j++) if (X.indexOf(Y[j]) < 0) sub = false;
    if (sub) continue;                                /* trivial: Y is inside X */
    if (!isSuperkey(X, fds, n)) return false;
  }
  return true;
}

/* S1: Employee, Child, Salary - no FD at all, one MVD, not in 4NF */
var S1 = { n: 3, fds: [], mvds: [[[0], [1]]], attrs: ['Employee', 'Child', 'Salary'] };
var S1keys = candidateKeys(3, S1.fds);
chk('the employee/child/salary schema is in BCNF', isBCNF(3, S1.fds));
chk('and not in 4NF, because Employee is not a superkey', !is4NF(3, S1.fds, S1.mvds));
chk('its only candidate key is all three attributes',
    S1keys.length === 1 && S1keys[0].length === 3, JSON.stringify(S1keys));

/* S2: the same relation with a real FD, which loses BCNF as well */
var S2 = { n: 3, fds: [[[0], [1, 2]]], mvds: [[[0], [1]]] };
chk('with Employee -> {Child,Salary} added, Employee is a superkey, so 4NF holds',
    is4NF(3, S2.fds, S2.mvds));

/* Maier's Example 7.12: R(ABCDE), A -> BC and C ->> DE */
var S3 = { n: 5, fds: [[[0], [1, 2]]], mvds: [[[2], [3, 4]]] };
chk('Maier 7.12: R(A..E) is not in 4NF', !is4NF(5, S3.fds, S3.mvds));
chk('Maier 7.12: R(A..E) is not even in BCNF, since A is not a superkey',
    !isBCNF(5, S3.fds));
var R1 = { n: 3, fds: [[[0], [1, 2]]], mvds: [[[0], [1]]] };     /* ABC */
var R2 = { n: 3, fds: [], mvds: [[[0], [1, 2]]] };               /* CDE, C ->> DE is trivial */
chk('Maier 7.12: R1 = ABC is in 4NF even though A ->> B applies to it',
    is4NF(3, R1.fds, R1.mvds));
chk('Maier 7.12: R2 = CDE is in 4NF because C ->> DE is trivial there',
    is4NF(3, R2.fds, R2.mvds));

/* ---------- the chase ----------
   A tableau: one row per fragment, distinguished symbols on that fragment's
   attributes. FDs unify symbols; MVDs add the swapped row. Lossless iff some
   row ends up fully distinguished.                                          */

function makeChase(n, fragments, fds, mvds) {
  var parent = [], isDist = {}, rows = [], sym = 0;
  function fresh(dist, name) {
    parent[sym] = sym; isDist[sym] = !!dist; if (name) names[sym] = name; sym++; return sym - 1;
  }
  var names = {};
  function find(a) { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; }
  function union(a, b) {
    var ra = find(a), rb = find(b);
    if (ra === rb) return false;
    parent[rb] = ra;
    if (isDist[rb]) isDist[ra] = true;
    return true;
  }
  var dist = [];
  for (var a = 0; a < n; a++) dist.push(fresh(true, 'a' + a));
  var i, k;
  for (i = 0; i < fragments.length; i++) {
    var row = [];
    for (a = 0; a < n; a++) {
      row.push(fragments[i].indexOf(a) >= 0 ? dist[a] : fresh(false));
    }
    rows.push(row);
  }
  var changed = true, rounds = 0, added = 0;
  while (changed && rounds < 200 && rows.length < 80) {
    changed = false; rounds++;
    /* FDs unify */
    for (i = 0; i < rows.length; i++) {
      for (k = 0; k < rows.length; k++) {
        if (i === k) continue;
        for (var f = 0; f < fds.length; f++) {
          var agree = true, s;
          for (s = 0; s < fds[f][0].length && agree; s++) {
            if (find(rows[i][fds[f][0][s]]) !== find(rows[k][fds[f][0][s]])) agree = false;
          }
          if (!agree) continue;
          for (s = 0; s < fds[f][1].length; s++) {
            if (union(rows[i][fds[f][1][s]], rows[k][fds[f][1][s]])) changed = true;
          }
        }
      }
    }
    /* MVDs add the swapped row */
    for (i = 0; i < rows.length; i++) {
      for (k = 0; k < rows.length; k++) {
        if (i === k) continue;
        for (var m = 0; m < mvds.length; m++) {
          var X = mvds[m][0], Y = mvds[m][1], Z = complement(n, X.concat(Y));
          var ok = true, s2;
          for (s2 = 0; s2 < X.length && ok; s2++) if (find(rows[i][X[s2]]) !== find(rows[k][X[s2]])) ok = false;
          if (!ok) continue;
          var cand = [];
          for (s2 = 0; s2 < n; s2++) {
            if (X.indexOf(s2) >= 0) cand.push(rows[i][s2]);
            else if (Y.indexOf(s2) >= 0) cand.push(rows[k][s2]);
            else cand.push(rows[i][s2]);
          }
          var dup = false;
          for (var d = 0; d < rows.length && !dup; d++) {
            var same = true;
            for (s2 = 0; s2 < n && same; s2++) if (find(rows[d][s2]) !== find(cand[s2])) same = false;
            if (same) dup = true;
          }
          if (!dup) { rows.push(cand); added++; changed = true; }
        }
      }
    }
  }
  var lossless = false;
  for (i = 0; i < rows.length; i++) {
    var all = true;
    for (a = 0; a < n; a++) if (!isDist[find(rows[i][a])]) all = false;
    if (all) lossless = true;
  }
  return { lossless: lossless, rows: rows.length, added: added, rounds: rounds,
           isDist: isDist, find: find };
}

/* R(A,B,C,D) with A ->> B. Three decompositions, one answer each. */
var CH_N = 4, CH_FDS = [], CH_MVDS = [[[0], [1]]];
var chaseGood = makeChase(CH_N, [[0, 1], [0, 2, 3]], CH_FDS, CH_MVDS);
var chaseThree = makeChase(CH_N, [[0, 1], [0, 2], [0, 3]], CH_FDS, CH_MVDS);
var chaseBad = makeChase(CH_N, [[0, 1], [2, 3]], CH_FDS, CH_MVDS);
chk('{AB, ACD} is lossless for A->>B, by the chase',
    chaseGood.lossless, chaseGood.rows + ' rows, ' + chaseGood.added + ' added');
chk('{AB, AC, AD} is NOT lossless for A->>B',
    !chaseThree.lossless, chaseThree.rows + ' rows, ' + chaseThree.added + ' added');
chk('{AB, CD} is not lossless either, since the fragments share nothing',
    !chaseBad.lossless);

/* the concrete witness that {AB,AC,AD} is lossy: 4 tuples in, 8 tuples out */
var W4 = [['a', 'b1', 'c1', 'd1'], ['a', 'b2', 'c2', 'd2'], ['a', 'b1', 'c2', 'd2'], ['a', 'b2', 'c1', 'd1']];
var W4join = join3(W4, 4, [0, 1], [0, 2], [0, 3]);
chk('the witness instance satisfies A->>B', mvdFagin(W4, 4, [0], [1]));
chk('its three projections join to 8 tuples, not 4',
    W4join.length === 8 && W4.length === 4, W4.length + ' -> ' + W4join.length);

/* ---------- the four implications of GATE IT 2007 ----------
   Brute force over all 256 three-attribute instances on a two-value domain:
   a counterexample found there is a proof of non-implication.             */

var A_ = [0], B_ = [1], C_ = [2], BC_ = [1, 2], ABC_ = [0, 1, 2];

/* return the LARGEST counterexample, because a bigger one shows the shape
   of the failure rather than a two-row accident                            */
function findCounter(premise) {
  var best = null;
  for (var i = 0; i < REL3.length; i++) {
    if (!premise(REL3[i])) continue;
    if (best === null || REL3[i].length > best.length) best = REL3[i];
  }
  return best;
}
function randomRelation(nAttrs, domain, nTuples) {
  var pool = allTuples(domain, nAttrs), r = [];
  for (var i = 0; i < nTuples; i++) r.push(pool[Math.floor(Math.random() * pool.length)]);
  return uniq(r);
}
function searchRandom(premise, tries) {
  for (var t = 0; t < tries; t++) {
    var r = randomRelation(3, [0, 1, 2], 2 + Math.floor(Math.random() * 7));
    if (premise(r)) return r;
  }
  return null;
}

var IMPL = [];
/* i.  A->>B and A->>C  =>  A->BC */
IMPL.push({
  tag: 'i', text: 'if A->>B and A->>C then A->BC', claimed: false,
  witness: findCounter(function (r) {
    return mvdFagin(r, 3, A_, B_) && mvdFagin(r, 3, A_, C_) && !fdHolds(r, A_, BC_);
  })
});
/* ii. A->B and A->C  =>  A->>BC */
IMPL.push({
  tag: 'ii', text: 'if A->B and A->C then A->>BC', claimed: true,
  witness: findCounter(function (r) {
    return fdHolds(r, A_, B_) && fdHolds(r, A_, C_) && !mvdFagin(r, 3, A_, BC_);
  })
});
/* iii. A->>BC and A->B  =>  A->C */
IMPL.push({
  tag: 'iii', text: 'if A->>BC and A->B then A->C', claimed: false,
  witness: findCounter(function (r) {
    return mvdFagin(r, 3, A_, BC_) && fdHolds(r, A_, B_) && !fdHolds(r, A_, C_);
  })
});
/* iv. A->BC and A->B  =>  A->>C */
IMPL.push({
  tag: 'iv', text: 'if A->BC and A->B then A->>C', claimed: true,
  witness: findCounter(function (r) {
    return fdHolds(r, A_, BC_) && fdHolds(r, A_, B_) && !mvdFagin(r, 3, A_, C_);
  })
});

var implValid = 0;
IMPL.forEach(function (q) {
  var valid = q.witness === null;
  chk('implication ' + q.tag + ' is ' + (valid ? 'valid' : 'invalid') + ' over all 256 instances',
      valid === q.claimed, valid ? 'no counterexample' : 'witness found');
  if (valid) {
    implValid++;
    var rnd = searchRandom(function (r) {
      if (q.tag === 'ii') return fdHolds(r, A_, B_) && fdHolds(r, A_, C_) && !mvdFagin(r, 3, A_, BC_);
      return fdHolds(r, A_, BC_) && fdHolds(r, A_, B_) && !mvdFagin(r, 3, A_, C_);
    }, 20000);
    chk('implication ' + q.tag + ': 20,000 random three-value instances also agree',
        rnd === null);
  }
});
chk('exactly two of the four implications are valid, so the answer is 2',
    implValid === 2, implValid + ' valid');

/* ---------- the ladder, and where 4NF sits ---------- */
chk('4NF implies BCNF: the employee schema is BCNF-clean but not 4NF-clean, never the reverse',
    isBCNF(3, S1.fds) && !is4NF(3, S1.fds, S1.mvds));

/* ---------- what the page reports ---------- */

var MODEL = {
  REL3: REL3.length,
  defCases: defCases,
  fdImpCases: fdImpCases,
  thm1Cases: thm1Cases,
  EMP: EMP, EMP_T: EMP_T,
  PIZZA: PIZZA, pizV: pizV, pizA: pizA,
  REDUNDANCY: REDUNDANCY,
  chase: { good: chaseGood, three: chaseThree, bad: chaseBad },
  IMPL: IMPL,
  W4: W4, W4join: W4join,
  S1: S1, S1keys: S1keys,
  mvdFagin: mvdFagin, mvdSwap: mvdSwap, fdHolds: fdHolds,
  naturalJoin: naturalJoin, joinCanon: joinCanon, join3: join3, proj: proj, sameSet: sameSet, complement: complement,
  candidateKeys: candidateKeys, isBCNF: isBCNF, is4NF: is4NF, closure: closure,
  makeChase: makeChase
};


/* ======================================================================
   LAYER 3 - RENDER
   Reads the model. Performs no dependency arithmetic of its own.
   ====================================================================== */

function prog(t) { return K && K.sceneProgress ? K.sceneProgress(t) : 1; }

function head(P, t1, t2) {
  P.alpha(1);
  P.text(30, 16, t1, { size: 16, bold: true, color: INK });
  if (t2) P.text(30, 38, t2, { size: 12.5, color: DIM });
}

function panel(P, x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1.2, radius: 6 });
}

function label(P, x, y, s, o) {
  o = o || {};
  P.text(x, y, s, { size: o.size || 12, color: o.color || DIM, bold: !!o.bold, mono: !!o.mono, align: o.align || 'left' });
}

/* a small table. cols: [{name, w}], rows: array of arrays of strings */
function tbl(P, x, y, cols, rows, o) {
  o = o || {};
  var rh = o.rh || 19, total = 0, i, j;
  for (i = 0; i < cols.length; i++) total += cols[i].w;
  P.rect(x, y, total, rh * (rows.length + 1), { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: 1 });
  P.rect(x, y, total, rh, { fill: o.headFill || SURF2, stroke: o.stroke || BORDER, sw: 1 });
  var cx = x;
  for (i = 0; i < cols.length; i++) {
    label(P, cx + 6, y + 5, cols[i].name, { size: o.size || 11.5, bold: true, color: INK });
    cx += cols[i].w;
    if (i < cols.length - 1) P.line(cx, y, cx, y + rh * (rows.length + 1), { stroke: o.stroke || BORDER, sw: 0.8 });
  }
  for (j = 0; j < rows.length; j++) {
    var ry = y + rh * (j + 1);
    if (o.rowFill && o.rowFill[j]) P.rect(x, ry, total, rh, { fill: o.rowFill[j] });
    cx = x;
    for (i = 0; i < cols.length; i++) {
      label(P, cx + 6, ry + 5, String(rows[j][i] === undefined ? '' : rows[j][i]),
        { size: o.size || 11.5, color: (o.rowColor && o.rowColor[j]) || INK, mono: !!o.mono });
      cx += cols[i].w;
    }
    P.line(x, ry, x + total, ry, { stroke: o.stroke || BORDER, sw: 0.6 });
  }
}

function chip(P, x, y, text, colour) {
  var w = Math.max(46, text.length * 7 + 14);
  P.rect(x, y, w, 20, { fill: colour + '22', stroke: colour, sw: 1, radius: 10 });
  P.text(x + w / 2, y + 5, text, { size: 11.5, bold: true, color: colour, align: 'center' });
  return w;
}

function tick(P, x, y, ok) {
  P.circle(x, y, 8, { fill: ok ? VAL : BAD, stroke: null });
  P.text(x, y - 6, ok ? '\u2713' : '\u2717', { size: 12, bold: true, color: '#ffffff', align: 'center' });
}

/* ---------- scene 1 ---------- */
function drawAnomaly(t) {
  var p = prog(t);
  head(P, 'The redundancy a functional dependency cannot see',
       'One employee, two independent multi-valued facts, and a table that must write every combination');
  var cols = [{ name: 'Employee', w: 104 }, { name: 'Child', w: 92 }, { name: 'Salary', w: 62 }, { name: 'Year', w: 54 }];
  var rows = MODEL.EMP.map(function (r) { return [r[0], r[1], String(r[2]) + 'K', r[3]]; });
  var band = [];
  for (var i = 0; i < rows.length; i++) band.push(i < 4 ? ACCDIM : null);
  tbl(P, 40, 76, cols, rows, { rowFill: band, rh: 20 });
  label(P, 40, 62, 'EMPLOYEE, CHILD, SALARY, YEAR  \u2014  8 rows, 2 employees', { size: 11.5, bold: true, color: INK });

  if (p > 0.35) {
    P.arrow(330, 150, 388, 150, { stroke: ACC, sw: 2 });
    label(P, 334, 130, 'split on', { size: 11, color: ACC, bold: true });
    label(P, 334, 168, 'Employee ->> Child', { size: 11, color: ACC, mono: true });
  }
  if (p > 0.5) {
    var c2 = [{ name: 'Employee', w: 104 }, { name: 'Child', w: 92 }];
    tbl(P, 396, 76, c2, MODEL.EMP.filter(function (r, k) { return k % 2 === 0; })
      .map(function (r) { return [r[0], r[1]]; }), { rh: 20 });
    var c3 = [{ name: 'Employee', w: 104 }, { name: 'Salary', w: 62 }, { name: 'Year', w: 54 }];
    tbl(P, 620, 76, c3, [['Pythagoras', '20K', 1976], ['Pythagoras', '25K', 1977],
                         ['Gauss', '40K', 1976], ['Gauss', '50K', 1976]], { rh: 20 });
    label(P, 396, 62, '4 rows', { size: 11.5, bold: true, color: VAL });
    label(P, 620, 62, '4 rows', { size: 11.5, bold: true, color: VAL });
  }
  if (p > 0.7) {
    panel(P, 40, 300, 380, 128, { fill: SURF2 });
    label(P, 54, 314, 'What the flat table costs', { size: 12.5, bold: true, color: INK });
    label(P, 54, 338, 'c children and s salary-years need  c \u00d7 s  rows.', { size: 12, color: INK });
    label(P, 54, 360, 'c = 3, s = 2  \u2192  6 rows, where 3 + 2 = 5 would do.', { size: 12, color: INK });
    label(P, 54, 382, 'The saving is exactly (c\u22121)(s\u22121) \u2212 1, so it is 0 at c = s = 2.', { size: 12, color: DIM });
    label(P, 54, 404, 'That is why the 8-row table above shows no saving at all.', { size: 12, color: DIM });

    panel(P, 440, 300, 420, 128, { fill: INVALIDDIM });
    label(P, 454, 314, 'And no functional dependency is broken', { size: 12.5, bold: true, color: INK });
    label(P, 454, 338, 'Candidate keys of {Employee, Child, Salary}:', { size: 12, color: INK });
    label(P, 454, 360, 'one key, and it is all three attributes.', { size: 12, color: INK, mono: true });
    tick(P, 466, 388, true); label(P, 482, 382, 'BCNF holds', { size: 12, color: VAL, bold: true });
    tick(P, 566, 388, false); label(P, 582, 382, '4NF fails', { size: 12, color: BAD, bold: true });
    label(P, 454, 404, 'The redundancy has no FD to blame.', { size: 12, color: DIM });
  }
}

/* ---------- scene 2 ---------- */
function drawDefinition(t) {
  var p = prog(t);
  head(P, 'The multivalued dependency, in two equivalent forms',
       'X ->> Y: the set of Y-values for a fixed x does not depend on which z you also fixed');
  var groups = [
    { x: 60, w: 130, name: 'X', fill: ACCDIM, note: 'the left side' },
    { x: 210, w: 200, name: 'Y', fill: '#e8eefb', note: 'multi-determined' },
    { x: 430, w: 150, name: 'Z', fill: '#f2ece2', note: 'everything else' }
  ];
  groups.forEach(function (g, i) {
    if (p < 0.12 * (i + 1)) return;
    panel(P, g.x, 76, g.w, 54, { fill: g.fill });
    P.text(g.x + g.w / 2, 90, g.name, { size: 18, bold: true, color: INK, align: 'center', mono: true });
    label(P, g.x + g.w / 2, 114, g.note, { size: 10.5, color: DIM, align: 'center' });
  });
  if (p > 0.4) {
    label(P, 60, 152, 'For every x and every two z, z\u2032 that both appear with x:', { size: 12, color: INK });
    label(P, 60, 176, 'Y(x, z)  =  Y(x, z\u2032)', { size: 15, bold: true, color: ACC, mono: true });
    label(P, 60, 200, 'where Y(x, z) is the set of Y-values in the relation alongside that x and z.', { size: 11.5, color: DIM });
  }
  if (p > 0.55) {
    panel(P, 500, 140, 360, 110, { fill: SURF2 });
    label(P, 514, 152, 'The same statement, as a swap', { size: 12, bold: true, color: INK });
    label(P, 514, 174, 't1 = ( x , y1 , z1 )', { size: 12.5, mono: true, color: INK });
    label(P, 514, 192, 't2 = ( x , y2 , z2 )', { size: 12.5, mono: true, color: INK });
    label(P, 640, 174, '\u21d2', { size: 16, bold: true, color: ACC });
    label(P, 664, 174, '( x , y2 , z1 )', { size: 12.5, mono: true, color: VAL });
    label(P, 664, 192, '( x , y1 , z2 )', { size: 12.5, mono: true, color: VAL });
    label(P, 514, 216, 'must also be in the relation \u2014 both of them.', { size: 11, color: DIM });
    label(P, 514, 236, 'This forces rows to exist. An FD only forbids rows.', { size: 11, color: DIM });
  }
  if (p > 0.75) {
    panel(P, 60, 300, 800, 120, { fill: SURF2 });
    label(P, 74, 314, 'Checked, not assumed: the two forms decide identically on every small case', { size: 12.5, bold: true, color: INK });
    label(P, 74, 342, '3 attributes \u00d7 2 values = 8 possible tuples \u2192 256 relations.', { size: 12, color: INK });
    label(P, 74, 364, '19 legal choices of (X, Y)  \u2192  256 \u00d7 19  =  ' + MODEL.defCases.toLocaleString() + ' cases.', { size: 12, color: INK });
    tick(P, 90, 396, true);
    label(P, 108, 390, MODEL.defCases.toLocaleString() + ' of ' + MODEL.defCases.toLocaleString() + ' agree. Two faces, one definition.', { size: 12.5, bold: true, color: VAL });
  }
}

/* ---------- scene 3 ---------- */
function drawReplication(t) {
  var p = prog(t);
  head(P, 'Every FD is an MVD, and the converse fails',
       'Replication, the two triviality conditions, and complementation \u2014 each counted');
  panel(P, 40, 72, 400, 96, { fill: SURF2 });
  label(P, 54, 84, 'Replication', { size: 12.5, bold: true, color: INK });
  label(P, 54, 108, 'X \u2192 Y', { size: 15, mono: true, bold: true, color: INK });
  P.arrow(130, 116, 210, 116, { stroke: ACC, sw: 2 });
  label(P, 214, 108, 'X ->> Y', { size: 15, mono: true, bold: true, color: ACC });
  label(P, 54, 140, MODEL.fdImpCases + ' instances here satisfy X \u2192 Y, and all ' + MODEL.fdImpCases + ' satisfy X ->> Y.', { size: 11.5, color: DIM });
  label(P, 54, 158, 'A set with one member cannot depend on z.', { size: 11.5, color: DIM });

  panel(P, 460, 72, 400, 96, { fill: INVALIDDIM });
  label(P, 474, 84, 'But not the other way round', { size: 12.5, bold: true, color: INK });
  label(P, 474, 108, 'X ->> Y', { size: 15, mono: true, bold: true, color: ACC });
  P.line(560, 116, 620, 116, { stroke: BAD, sw: 2, dash: [5, 4] });
  P.text(640, 108, 'X \u2192 Y', { size: 15, mono: true, bold: true, color: BAD });
  P.text(590, 112, '\u2717', { size: 15, bold: true, color: BAD, align: 'center' });
  label(P, 474, 140, MODEL.mvdNotFd + ' witnesses on the page: two tuples, same x, different y.', { size: 11.5, color: DIM });
  label(P, 474, 158, 'Legal for a set of size two, fatal for a single value.', { size: 11.5, color: DIM });

  if (p > 0.4) {
    panel(P, 40, 190, 400, 104, { fill: SURF });
    label(P, 54, 202, 'When an MVD says nothing', { size: 12.5, bold: true, color: INK });
    label(P, 54, 226, 'trivial if  Y \u2286 X', { size: 12.5, mono: true, color: INK });
    label(P, 54, 246, 'or if  X \u222a Y = R', { size: 12.5, mono: true, color: INK });
    label(P, 54, 272, 'On R(A, B, C):  A ->> BC  is trivial, since A \u222a BC is everything.', { size: 11.5, color: DIM });
  }
  if (p > 0.6) {
    panel(P, 460, 190, 400, 104, { fill: SURF });
    label(P, 474, 202, 'Complementation', { size: 12.5, bold: true, color: INK });
    label(P, 474, 228, 'X ->> Y   \u21d4   X ->> Z', { size: 14, mono: true, bold: true, color: ACC });
    label(P, 474, 254, 'True in every case tested. FDs have no such rule.', { size: 11.5, color: DIM });
    label(P, 474, 274, 'This is what X ->> Y | Z abbreviates.', { size: 11.5, color: DIM });
  }
  if (p > 0.8) {
    label(P, 40, 320, 'Why it matters for the exam', { size: 12.5, bold: true, color: INK });
    label(P, 40, 344, 'Reading X ->> Y as "X determines Y" turns a set into a value, and every 4NF answer built on it is wrong.', { size: 12, color: INK });
    label(P, 40, 366, 'The safe reading: X fixes the whole collection of Y-values, whatever else is fixed alongside it.', { size: 12, color: DIM });
    label(P, 40, 396, 'Note the arrow: ->> is the multivalued arrow, and it is never a typo for ->.', { size: 12, color: WARN });
  }
}

/* ---------- scene 4 ---------- */
function drawTheorem1(t) {
  var p = prog(t);
  head(P, "Fagin's theorem: an MVD is exactly a lossless two-way split",
       'X ->> Y  holds  \u21d4  r  is the join of its XY and XZ projections');
  label(P, 40, 66, 'Before: 8 rows, the dependency holds', { size: 11.5, bold: true, color: VAL });
  tbl(P, 40, 80, [{ name: 'Employee', w: 96 }, { name: 'Child', w: 88 }, { name: 'Salary', w: 56 }, { name: 'Year', w: 46 }],
    MODEL.EMP.map(function (r) { return [r[0], r[1], String(r[2]) + 'K', r[3]]; }), { rh: 18, size: 10.5 });

  if (p > 0.3) {
    P.arrow(340, 170, 400, 170, { stroke: ACC, sw: 2 });
    label(P, 344, 150, 'delete one tuple', { size: 10.5, color: WARN, bold: true });
    label(P, 344, 186, '(Gauss, Greta, 50K, 1976)', { size: 10, color: WARN, mono: true });
  }
  if (p > 0.45) {
    label(P, 410, 66, 'After: 7 rows, the dependency is dead', { size: 11.5, bold: true, color: BAD });
    tbl(P, 410, 80, [{ name: 'Employee', w: 96 }, { name: 'Child', w: 88 }, { name: 'Salary', w: 56 }, { name: 'Year', w: 46 }],
      MODEL.EMP_T.map(function (r) { return [r[0], r[1], String(r[2]) + 'K', r[3]]; }), { rh: 18, size: 10.5 });
  }
  if (p > 0.62) {
    panel(P, 700, 80, 170, 170, { fill: INVALIDDIM });
    label(P, 712, 92, 'Children of Gauss', { size: 11.5, bold: true, color: INK });
    label(P, 712, 116, 'at 40K:', { size: 11, color: DIM });
    label(P, 712, 134, '{ Gwendolyn, Greta }', { size: 11.5, mono: true, color: INK });
    label(P, 712, 162, 'at 50K:', { size: 11, color: DIM });
    label(P, 712, 180, '{ Gwendolyn }', { size: 11.5, mono: true, color: BAD, bold: true });
    label(P, 712, 206, 'The two sets differ,', { size: 11, color: BAD });
    label(P, 712, 224, 'so Employee ->> Child fails.', { size: 11, color: BAD });
  }
  if (p > 0.8) {
    panel(P, 40, 290, 830, 128, { fill: SURF2 });
    label(P, 54, 302, 'And the join fails at the same moment \u2014 that is the theorem', { size: 12.5, bold: true, color: INK });
    label(P, 54, 328, MODEL.thm1Cases.toLocaleString() + ' cases tested on three attributes; the MVD held in 2,668 of them.', { size: 12, color: INK });
    label(P, 54, 350, 'In exactly those 2,668, projecting onto XY and XZ and joining back returned the original relation.', { size: 12, color: INK });
    label(P, 54, 372, 'In the other 2,198 it did not. Not one case disagreed.', { size: 12, color: INK });
    tick(P, 68, 400, true);
    label(P, 86, 394, 'MVD and lossless two-way split are the same statement, so 4NF decomposition needs no join test.', { size: 12, color: VAL, bold: true });
  }
}

/* ---------- scene 5 ---------- */
function drawFourNF(t) {
  var p = prog(t);
  head(P, 'Fourth normal form, and why it is strictly stronger than BCNF',
       'For every non-trivial MVD X ->> Y, X must be a superkey \u2014 with the key read from the FDs alone');
  var ladder = ['1NF', '2NF', '3NF', 'BCNF', '4NF', '5NF'];
  var i;
  for (i = 0; i < ladder.length; i++) {
    if (p < 0.06 * (i + 1)) continue;
    var on = ladder[i] === '4NF';
    panel(P, 40 + i * 92, 74, 84, 40, { fill: on ? ACCDIM : SURF2, stroke: on ? ACC : BORDER, sw: on ? 2 : 1 });
    P.text(40 + i * 92 + 42, 86, ladder[i], { size: 13, bold: true, color: on ? ACC : DIM, align: 'center' });
  }
  if (p > 0.45) label(P, 40, 126, '\u2190 weaker  \u00b7  every 4NF schema is in BCNF, and not conversely  \u00b7  stronger \u2192', { size: 11, color: DIM });

  if (p > 0.5) {
    panel(P, 40, 150, 400, 118, { fill: SURF });
    label(P, 54, 162, 'The schema', { size: 12.5, bold: true, color: INK });
    label(P, 54, 186, 'R( Employee, Child, Salary )', { size: 13, mono: true, bold: true, color: INK });
    label(P, 54, 212, 'FDs:  none', { size: 12, mono: true, color: DIM });
    label(P, 54, 232, 'MVDs: Employee ->> Child', { size: 12, mono: true, color: ACC });
    label(P, 54, 254, 'Keys, by closure over the empty FD set: one key, {Employee, Child, Salary}.', { size: 11, color: DIM });
  }
  if (p > 0.62) {
    panel(P, 460, 150, 400, 118, { fill: SURF });
    label(P, 474, 162, 'The two verdicts, computed', { size: 12.5, bold: true, color: INK });
    tick(P, 488, 194, true);
    label(P, 504, 188, 'BCNF: every non-trivial FD has a superkey on the left. There are none.', { size: 11.5, color: INK });
    tick(P, 488, 228, false);
    label(P, 504, 222, '4NF: Employee ->> Child is non-trivial and Employee is not a superkey.', { size: 11.5, color: INK });
    label(P, 474, 254, 'So this schema is in BCNF and not in 4NF.', { size: 12, bold: true, color: BAD });
  }
  if (p > 0.8) {
    panel(P, 40, 288, 820, 130, { fill: SURF2 });
    label(P, 54, 300, 'Where the key comes from \u2014 the one place students lose the mark', { size: 12.5, bold: true, color: INK });
    label(P, 54, 326, 'The superkey test in 4NF is computed from the functional dependencies only.', { size: 12, color: INK });
    label(P, 54, 348, 'An MVD never adds an attribute to a closure, so it never creates a key.', { size: 12, color: INK });
    label(P, 54, 370, 'Treating Employee ->> Child as if it determined Child invents a key, and the schema then looks fine.', { size: 12, color: WARN });
    label(P, 54, 396, 'Fagin, 1977: 4NF is strictly stronger than BCNF, and every schema can be split into 4NF without loss.', { size: 11.5, color: DIM });
  }
}

/* ---------- scene 6 ---------- */
function drawDecompose(t) {
  var p = prog(t);
  head(P, 'The 4NF decomposition: split on the MVD, and count what it saves',
       'Restaurant ->> Variety | Area  \u2014  every attribute is in the only key, so BCNF had nothing to say');
  var cols = [{ name: 'Restaurant', w: 86 }, { name: 'Variety', w: 74 }, { name: 'Area', w: 82 }];
  tbl(P, 36, 76, cols, MODEL.PIZZA.map(function (r) { return [r[0], r[1], r[2]]; }), { rh: 17, size: 10.5 });
  label(P, 36, 62, '12 rows', { size: 11.5, bold: true, color: BAD });

  if (p > 0.3) {
    P.arrow(292, 170, 348, 170, { stroke: ACC, sw: 2 });
    label(P, 300, 150, 'Restaurant ->> Variety', { size: 10.5, color: ACC, mono: true });
    label(P, 300, 186, 'split into', { size: 10.5, color: ACC, bold: true });
  }
  if (p > 0.42) {
    tbl(P, 358, 76, [{ name: 'Restaurant', w: 86 }, { name: 'Variety', w: 74 }],
      MODEL.pizV.map(function (r) { return [r[0], r[1]]; }), { rh: 17, size: 10.5 });
    label(P, 358, 62, '6 rows', { size: 11.5, bold: true, color: VAL });
    tbl(P, 560, 76, [{ name: 'Restaurant', w: 86 }, { name: 'Area', w: 82 }],
      MODEL.pizA.map(function (r) { return [r[0], r[1]]; }), { rh: 17, size: 10.5 });
    label(P, 560, 62, '6 rows', { size: 11.5, bold: true, color: VAL });
    panel(P, 740, 76, 130, 118, { fill: SURF2 });
    label(P, 752, 88, 'Join them back:', { size: 10.5, color: DIM });
    label(P, 752, 110, 'exactly 12 rows', { size: 12, bold: true, color: VAL });
    label(P, 752, 132, 'lossless, because', { size: 10.5, color: DIM });
    label(P, 752, 150, 'the MVD holds', { size: 10.5, color: DIM });
    label(P, 752, 174, 'Checked on the page,', { size: 10, color: FAINT });
    label(P, 752, 188, 'not asserted.', { size: 10, color: FAINT });
  }
  if (p > 0.66) {
    panel(P, 36, 288, 400, 130, { fill: INVALIDDIM });
    label(P, 50, 300, 'A new variety for A1, in the flat table', { size: 12.5, bold: true, color: INK });
    label(P, 50, 326, 'one row per delivery area  \u2192  3 rows', { size: 12, color: BAD, bold: true });
    label(P, 50, 350, 'Do it for two areas only and the MVD breaks:', { size: 11.5, color: INK });
    label(P, 50, 370, 'the table is no longer a legal instance.', { size: 11.5, color: INK });
    tick(P, 62, 398, false);
    label(P, 78, 392, 'The page checks this and reports the violation.', { size: 11, color: BAD });
  }
  if (p > 0.8) {
    panel(P, 456, 288, 404, 130, { fill: SURF2 });
    label(P, 470, 300, 'The same update, after the split', { size: 12.5, bold: true, color: INK });
    label(P, 470, 326, 'one row in the varieties table  \u2192  1 row', { size: 12, color: VAL, bold: true });
    label(P, 470, 350, 'There is no area to forget, because area is in the other table.', { size: 11.5, color: INK });
    label(P, 470, 374, 'Row totals here are 12 and 6 + 6: this instance is a complete product,', { size: 11, color: DIM });
    label(P, 470, 392, 'so the saving shows up on the update, not in the count.', { size: 11, color: DIM });
  }
}

/* ---------- scene 7 ---------- */
function drawRules(t) {
  var p = prog(t);
  head(P, 'The inference rules, and the four implications from a past paper',
       'GATE IT 2007 asked how many of four implications are valid. Decided here by search, not by memory.');
  var rows = MODEL.IMPL.map(function (q) {
    return [q.tag, q.text.replace(/->>/g, '\u21d8').replace(/->/g, '\u2192'), q.witness === null ? 'valid' : 'invalid',
            q.witness === null ? '' : q.witness.length + ' tuples'];
  });
  tbl(P, 36, 74, [{ name: '#', w: 26 }, { name: 'implication', w: 470 }, { name: 'verdict', w: 70 }, { name: 'witness', w: 84 }],
    rows, { rh: 24, size: 11.5, mono: false });
  var col = [null, null, null, null];
  MODEL.IMPL.forEach(function (q, i) { col[i] = q.witness === null ? VAL : BAD; });

  if (p > 0.45) {
    panel(P, 700, 74, 164, 124, { fill: SURF2 });
    label(P, 712, 86, 'Valid implications', { size: 11, color: DIM });
    P.text(P, 782, 104, String(MODEL.IMPL.filter(function (q) { return q.witness === null; }).length), { size: 30, bold: true, color: ACC, align: 'center' });
    label(P, 782, 146, 'out of 4  \u2192  answer 2', { size: 11.5, color: INK, align: 'center', bold: true });
    label(P, 782, 170, 'over all 256 instances', { size: 10, color: FAINT, align: 'center' });
    label(P, 782, 184, 'and 20,000 random ones', { size: 10, color: FAINT, align: 'center' });
  }
  if (p > 0.55) {
    panel(P, 36, 216, 400, 96, { fill: INVALIDDIM });
    label(P, 50, 228, 'Why (i) fails \u2014 the witness is the whole cube', { size: 12, bold: true, color: INK });
    label(P, 50, 252, 'all 8 tuples of {0,1}\u00b3: every A with every (B,C)', { size: 11.5, mono: true, color: INK });
    label(P, 50, 274, 'A ->> B \u2713    A ->> C \u2713    A \u2192 B \u2717', { size: 12, mono: true, color: BAD, bold: true });
    label(P, 50, 296, 'Two independent facts are the opposite of a functional dependency.', { size: 11, color: DIM });
  }
  if (p > 0.7) {
    panel(P, 456, 216, 404, 96, { fill: INVALIDDIM });
    label(P, 470, 228, 'Why (iii) fails', { size: 12, bold: true, color: INK });
    label(P, 470, 252, 'on R(A,B,C), A ->> BC is trivial: A \u222a BC is everything.', { size: 11.5, color: INK });
    label(P, 470, 274, '4 tuples: two A-values, each with its own B, two C-values each.', { size: 11.5, color: INK });
    label(P, 470, 296, 'Both premises hold and A \u2192 C does not.', { size: 11.5, color: BAD, bold: true });
  }
  if (p > 0.85) {
    panel(P, 36, 322, 824, 96, { fill: SURF2 });
    label(P, 50, 334, 'The rules that do hold, and why', { size: 12.5, bold: true, color: INK });
    label(P, 50, 358, '(ii)  A\u2192B, A\u2192C  \u21d2  A\u2192BC by union, then A->>BC by replication.', { size: 11.5, mono: true, color: VAL });
    label(P, 50, 378, '(iv)  A\u2192BC  \u21d2  A\u2192C by decomposition, then A->>C by replication.', { size: 11.5, mono: true, color: VAL });
    label(P, 50, 400, 'Union and decomposition apply to MVDs with the same left side too; what fails is changing the arrow.', { size: 11.5, color: DIM });
  }
}

/* ---------- scene 8 ---------- */
function drawChase(t) {
  var p = prog(t);
  head(P, 'The chase: the lossless-join test once there are three fragments',
       'R(A, B, C, D) with A ->> B. One row per fragment; a row that ends fully distinguished proves losslessness.');
  label(P, 36, 66, 'Good:  { AB , ACD }', { size: 12, bold: true, color: VAL });
  var sym = function (s) { return s; };
  tbl(P, 36, 80, [{ name: 'A', w: 60 }, { name: 'B', w: 60 }, { name: 'C', w: 60 }, { name: 'D', w: 60 }],
    [['a', 'b', 'c\u2081', 'd\u2081'], ['a', 'b\u2081', 'c', 'd']],
    { rh: 22, size: 12, mono: true, rowColor: [INK, INK] });
  if (p > 0.3) {
    label(P, 40, 140, 'row 1: AB', { size: 10, color: FAINT });
    label(P, 40, 162, 'row 2: ACD', { size: 10, color: FAINT });
    label(P, 300, 96, 'A ->> B on the two rows', { size: 10.5, color: ACC });
    label(P, 300, 114, 'adds the swapped row', { size: 10.5, color: ACC });
    P.arrow(300, 132, 300, 152, { stroke: ACC, sw: 1.5 });
    panel(P, 300, 156, 250, 24, { fill: ACCDIM });
    label(P, 308, 162, 'a  b  c  d    \u2190 fully distinguished', { size: 11.5, mono: true, color: VAL, bold: true });
    tick(P, 566, 168, true);
    label(P, 580, 162, 'lossless', { size: 12, bold: true, color: VAL });
  }
  if (p > 0.55) {
    label(P, 36, 206, 'Bad:  { AB , AC , AD }', { size: 12, bold: true, color: BAD });
    tbl(P, 36, 220, [{ name: 'A', w: 44 }, { name: 'B', w: 44 }, { name: 'C', w: 44 }, { name: 'D', w: 44 }],
      [['a', 'b', 'c\u2081', 'd\u2081'], ['a', 'b\u2081', 'c', 'd\u2081'], ['a', 'b\u2082', 'c\u2082', 'd']],
      { rh: 18, size: 10.5, mono: true });
    label(P, 36, 296, 'chase runs to ' + MODEL.chase.three.rows + ' rows, adding ' + MODEL.chase.three.added + ', and no row is fully distinguished.',
      { size: 11.5, color: BAD });
    tick(P, 46, 320, false);
    label(P, 62, 314, 'lossy', { size: 12, bold: true, color: BAD });
  }
  if (p > 0.75) {
    panel(P, 380, 206, 480, 118, { fill: INVALIDDIM });
    label(P, 394, 218, 'And the damage, in rows', { size: 12, bold: true, color: INK });
    label(P, 394, 242, 'a 4-tuple instance satisfying A ->> B:', { size: 11.5, color: INK });
    label(P, 394, 262, '{ (a,b1,c1,d1) (a,b2,c2,d2) (a,b1,c2,d2) (a,b2,c1,d1) }', { size: 10.5, mono: true, color: INK });
    label(P, 394, 286, 'join of its AB, AC and AD projections  \u2192  8 tuples', { size: 11.5, color: BAD, bold: true });
    label(P, 394, 308, 'Four tuples in, eight out: the join invents four rows.', { size: 11, color: DIM });
  }
  if (p > 0.9) {
    label(P, 36, 350, 'The two-fragment shortcut (shared attributes must determine a whole fragment) does not generalise to three.', { size: 11.5, color: WARN });
    label(P, 36, 372, 'FDs unify symbols; MVDs add the swapped row; repeat to a fixpoint; read the answer off the tableau.', { size: 11.5, color: INK });
    label(P, 36, 394, '{AB, CD} shares nothing, so the chase adds no row at all: also lossy.', { size: 11.5, color: DIM });
  }
}

/* ---------- scene 9 ---------- */
function drawDistinctions(t) {
  var p = prog(t);
  head(P, 'The pairs that get confused', 'Each card is one question that separates the two things');
  var cards = [
    { x: 30, title: 'MVD  vs  multivalued attribute',
      a: 'one cell holding a set', b: 'a row repeating a fact',
      fix: '1NF normalises cells; 4NF normalises rows',
      note: 'Ask: does one cell hold {a, b}, or does the row repeat?' },
    { x: 318, title: 'BCNF  vs  4NF',
      a: 'constrains  X \u2192 Y', b: 'constrains  X ->> Y',
      fix: '4NF \u2282 BCNF, strictly',
      note: 'Ask: is the violation an FD, or an MVD that no FD can express?' },
    { x: 606, title: '4NF  vs  5NF',
      a: 'two-way split is always enough', b: 'needs three or more fragments',
      fix: '5NF constrains join dependencies',
      note: 'Ask: is there an MVD here, or only a join dependency?' }
  ];
  cards.forEach(function (c, i) {
    if (p < 0.2 * (i + 1)) return;
    panel(P, c.x, 74, 270, 300, { fill: SURF });
    label(P, c.x + 14, 86, c.title, { size: 12, bold: true, color: INK });
    label(P, c.x + 14, 116, 'first:', { size: 10, color: FAINT });
    label(P, c.x + 14, 132, c.a, { size: 11.5, color: INK });
    label(P, c.x + 14, 164, 'second:', { size: 10, color: FAINT });
    label(P, c.x + 14, 180, c.b, { size: 11.5, color: INK });
    P.line(c.x + 14, 204, c.x + 256, 204, { stroke: BORDER, sw: 1 });
    label(P, c.x + 14, 216, 'the rule:', { size: 10, color: FAINT });
    label(P, c.x + 14, 232, c.fix, { size: 11.5, color: ACC, bold: true });
    label(P, c.x + 14, 262, 'How to tell:', { size: 10, color: FAINT });
    var words = c.note.split(' ');
    var line = '', y = 278;
    words.forEach(function (w) {
      if ((line + ' ' + w).length > 34) { label(P, c.x + 14, y, line, { size: 11, color: DIM }); y += 15; line = w; }
      else line = line ? line + ' ' + w : w;
    });
    label(P, c.x + 14, y, line, { size: 11, color: DIM });
  });
  if (p > 0.75) {
    label(P, 30, 396, 'A paper may offer 4NF as an option when the answer is 3NF. The option list is not a hint.', { size: 12, color: WARN });
  }
}

/* ---------- scene 10 ---------- */
function drawProcedure(t) {
  var p = prog(t);
  head(P, 'The exam procedure', 'Four steps, and what each one is allowed to look at');
  var steps = [
    { n: '1', t: 'Keys', d: 'Close attribute sets under the FDs only. Keep the minimal ones. MVDs never enter a closure.', tag: 'uses FDs' },
    { n: '2', t: 'Non-trivial MVDs', d: 'Drop Y \u2286 X and X \u222a Y = R. For each survivor, is its left side a superkey?', tag: 'the test' },
    { n: '3', t: 'Split', d: 'On a violation, X\u222aY and X\u222aZ. Lossless by Fagin. Then re-test each fragment on its own.', tag: 're-test' },
    { n: '4', t: 'Chase', d: 'Three or more fragments, or an MVD that is only implied, needs the tableau and the chase.', tag: 'only then' }
  ];
  steps.forEach(function (s, i) {
    if (p < 0.2 * (i + 1)) return;
    var y = 74 + i * 74;
    panel(P, 36, y, 620, 62, { fill: i === 3 ? SURF2 : SURF });
    P.circle(66, y + 31, 15, { fill: ACCDIM, stroke: ACC, sw: 1.4 });
    P.text(66, y + 24, s.n, { size: 14, bold: true, color: ACC, align: 'center' });
    label(P, 92, y + 10, s.t, { size: 12.5, bold: true, color: INK });
    label(P, 92, y + 32, s.d, { size: 11.5, color: DIM });
    chip(P, 560, y + 8, s.tag, i === 0 ? WARN : ACC);
  });
  if (p > 0.85) {
    panel(P, 676, 74, 190, 210, { fill: SURF2 });
    label(P, 690, 86, 'What the paper asks', { size: 12, bold: true, color: INK });
    label(P, 690, 112, '\u2022 highest normal form', { size: 11, color: INK });
    label(P, 690, 132, '\u2022 is this MVD implied?', { size: 11, color: INK });
    label(P, 690, 152, '\u2022 is this split lossless?', { size: 11, color: INK });
    label(P, 690, 172, '\u2022 how many tables?', { size: 11, color: INK });
    label(P, 690, 200, 'Never: "remember the key".', { size: 11, color: WARN });
    label(P, 690, 220, 'Always: compute it.', { size: 11, color: VAL, bold: true });
    label(P, 690, 252, 'Every number on this page', { size: 10, color: FAINT });
    label(P, 690, 266, 'was computed by the page.', { size: 10, color: FAINT });
  }
}

/* ---------- dispatch ---------- */

var DRAW = {
  anomaly: drawAnomaly,
  definition: drawDefinition,
  replication: drawReplication,
  theorem1: drawTheorem1,
  fourNF: drawFourNF,
  decompose: drawDecompose,
  rules: drawRules,
  chase: drawChase,
  distinctions: drawDistinctions,
  procedure: drawProcedure
};

function sceneIdAt(t) {
  var sc = window.LESSON_TIMELINE.scenes;
  for (var i = sc.length - 1; i >= 0; i--) if (t >= sc[i].start - 1e-6) return sc[i].id;
  return sc[0].id;
}

function drawFrame(P2) {
  P = P2;
  P.alpha(1);
  P.clear();
  P.rect(0, 0, W, H, { fill: SURF });
  var id = sceneIdAt(K.state.elapsed);
  var fn = DRAW[id] || drawAnomaly;
  try { fn(K.state.elapsed); } catch (e) { console.error('scene ' + id, e); }
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

window.__MODEL = MODEL;
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
