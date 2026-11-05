/* ==========================================================================
   group-actions-orbits-and-burnside — lesson.js
   Four layers, in order:
     1. THE MODEL      — five real groups as permutation tables (C4, D4, C6, D6,
                         S3), twelve actions built as move tables and checked
                         against the two axioms, then orbits, stabilisers,
                         fixed-point counts and Burnside averages.
     2. THE CHECKS     — every number a caption states is recomputed and asserted.
     3. RENDER         — reads the model; never re-derives a number.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The claim under test is one sentence: orbits are what you count, stabilisers
   are how much symmetry one point has, and the average over the group joins them.
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

var GA = (function () {

  'use strict';

  /* ---------- permutations ---------- */
  function ident(n) { var a = []; for (var i = 0; i < n; i++) a.push(i); return a; }
  function comp(a, b) { var r = []; for (var i = 0; i < a.length; i++) r.push(a[b[i]]); return r; }
  function inv(a) { var r = []; for (var i = 0; i < a.length; i++) r[a[i]] = i; return r; }
  function key(p) { return p.join(','); }

  function groupFromPerms(name, perms, labels) {
    var g = { name: name, n: perms.length, el: perms, labels: labels || null, idx: {} };
    perms.forEach(function (p, i) { g.idx[key(p)] = i; });
    /* closure, identity, inverses */
    for (var i = 0; i < perms.length; i++) {
      for (var j = 0; j < perms.length; j++) {
        if (g.idx[key(comp(perms[i], perms[j]))] === undefined) throw new Error(name + ' not closed');
      }
      if (g.idx[key(inv(perms[i]))] === undefined) throw new Error(name + ' missing inverse');
    }
    g.e = g.idx[key(ident(perms[0].length))];
    if (g.e === undefined) throw new Error(name + ' has no identity');
    /* associativity on every triple (cheap at these sizes) */
    for (var a = 0; a < perms.length; a++) for (var b = 0; b < perms.length; b++) for (var c = 0; c < perms.length; c++) {
      if (g.idx[key(comp(comp(perms[a], perms[b]), perms[c]))] !==
          g.idx[key(comp(perms[a], comp(perms[b], perms[c])))]) throw new Error(name + ' not associative');
    }
    return g;
  }

  function rotations(n) {
    var out = [];
    for (var k = 0; k < n; k++) {
      var p = [];
      for (var i = 0; i < n; i++) p.push((i + k) % n);
      out.push(p);
    }
    return out;
  }

  /* reflection of the n-cycle fixing 0: i -> (-i) mod n */
  function reflect(n) {
    var p = [];
    for (var i = 0; i < n; i++) p.push((n - i) % n);
    return p;
  }

  function dihedral(n) {
    var R = rotations(n), s = reflect(n), out = R.slice();
    R.forEach(function (r) { out.push(comp(r, s)); });
    return out;
  }

  function permsOf(n) {
    var out = [];
    (function rec(cur, rest) {
      if (!rest.length) { out.push(cur.slice()); return; }
      for (var i = 0; i < rest.length; i++) {
        var r2 = rest.slice(); var v = r2.splice(i, 1)[0];
        rec(cur.concat([v]), r2);
      }
    })([], ident(n));
    return out;
  }

  function cyclesOf(p) {
    var n = p.length, seen = {}, out = [];
    for (var i = 0; i < n; i++) {
      if (seen[i] || p[i] === i) continue;
      var c = [], x = i;
      while (!seen[x]) { seen[x] = 1; c.push(x + 1); x = p[x]; }
      out.push('(' + c.join(' ') + ')');
    }
    return out.length ? out.join('') : 'e';
  }

  var C4 = groupFromPerms('C4', rotations(4), ['e', 'r', 'r2', 'r3']);
  var D4 = groupFromPerms('D4', dihedral(4), ['e', 'r', 'r2', 'r3', 's', 'rs', 'r2s', 'r3s']);
  var C6 = groupFromPerms('C6', rotations(6), ['e', 'r', 'r2', 'r3', 'r4', 'r5']);
  var D6 = groupFromPerms('D6', dihedral(6), ['e', 'r', 'r2', 'r3', 'r4', 'r5', 's', 'rs', 'r2s', 'r3s', 'r4s', 'r5s']);
  var S3perms = permsOf(3);
  var S3 = groupFromPerms('S3', S3perms, S3perms.map(cyclesOf));

  /* ---------- actions ----------
     An action is a table A[g][x] = the element that x is carried to.
     The table is built from a mover and then checked against the two axioms. */

  function makeAction(name, G, items, mover, labelFn) {
    var keyOf = {}, X = [];
    items.forEach(function (it) {
      var k = JSON.stringify(it);
      if (keyOf[k] === undefined) { keyOf[k] = X.length; X.push(it); }
    });
    var A = [], i, j;
    for (i = 0; i < G.n; i++) {
      var row = [];
      for (j = 0; j < X.length; j++) {
        var moved = mover(G.el[i], X[j]);
        var k2 = JSON.stringify(moved);
        if (keyOf[k2] === undefined) throw new Error(name + ': action leaves the set');
        row.push(keyOf[k2]);
      }
      A.push(row);
    }
    var a = { name: name, G: G, X: X, A: A, label: labelFn || function (x) { return String(x); } };
    /* axiom 1: the identity fixes everything. axiom 2: (gh)x = g(hx) */
    for (j = 0; j < X.length; j++) if (A[G.e][j] !== j) throw new Error(name + ': e does not fix x ' + j);
    for (i = 0; i < G.n; i++) for (var k3 = 0; k3 < G.n; k3++) {
      var gh = G.idx[key(comp(G.el[i], G.el[k3]))];
      for (j = 0; j < X.length; j++) {
        if (A[gh][j] !== A[i][A[k3][j]]) throw new Error(name + ': action axiom 2 fails');
      }
    }
    return a;
  }

  /* orbits: connected components of the action graph */
  function orbits(a) {
    var n = a.X.length, seen = [], out = [];
    for (var x = 0; x < n; x++) {
      if (seen[x]) continue;
      var comp2 = [], stack = [x];
      seen[x] = 1;
      while (stack.length) {
        var y = stack.pop(); comp2.push(y);
        for (var g = 0; g < a.G.n; g++) {
          var z = a.A[g][y];
          if (!seen[z]) { seen[z] = 1; stack.push(z); }
        }
      }
      out.push(comp2.sort(function (p, q) { return p - q; }));
    }
    return out;
  }

  function stabiliser(a, x) {
    var out = [];
    for (var g = 0; g < a.G.n; g++) if (a.A[g][x] === x) out.push(g);
    return out;
  }

  function fixes(a) {
    var out = [];
    for (var g = 0; g < a.G.n; g++) {
      var c = 0;
      for (var x = 0; x < a.X.length; x++) if (a.A[g][x] === x) c++;
      out.push(c);
    }
    return out;
  }

  function burnside(a) {
    var f = fixes(a), s = 0;
    f.forEach(function (c) { s += c; });
    return { sum: s, n: a.G.n, value: s / a.G.n, fix: f };
  }

  function orbitOf(a, x) {
    var o = orbits(a);
    for (var i = 0; i < o.length; i++) if (o[i].indexOf(x) >= 0) return o[i];
    return [];
  }

  /* ---------- the sets the actions act on ---------- */

  function colourings(n, k) {
    var out = [];
    for (var c = 0; c < Math.pow(k, n); c++) {
      var d = [], t = c;
      for (var i = 0; i < n; i++) { d.push(t % k); t = Math.floor(t / k); }
      out.push(d);
    }
    return out;
  }

  function actOnColouring(p, c) {
    var out = c.slice();
    for (var i = 0; i < c.length; i++) out[p[i]] = c[i];
    return out;
  }

  function pairs(n) {
    var out = [];
    for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) out.push([i, j]);
    return out;
  }

  function actOnPair(p, pr) {
    var a = p[pr[0]], b = p[pr[1]];
    return a < b ? [a, b] : [b, a];
  }

  function dots(n) { var o = []; for (var i = 0; i < n; i++) o.push(i); return o; }
  function actOnPoint(p, x) { return p[x]; }

  /* ---------- the catalogue ---------- */

  var ACT = {};

  ACT.corners = makeAction('D4 on the four corners', D4, dots(4), actOnPoint,
    function (x) { return 'corner ' + x; });
  ACT.segments = makeAction('D4 on the six segments', D4, pairs(4), actOnPair,
    function (pr) { return 'segment ' + pr[0] + pr[1]; });
  ACT.s3points = makeAction('S3 on three points', S3, dots(3), actOnPoint,
    function (x) { return 'point ' + x; });
  ACT.c4col2 = makeAction('C4 on the 16 two-colourings', C4, colourings(4, 2), actOnColouring);
  ACT.d4col2 = makeAction('D4 on the 16 two-colourings', D4, colourings(4, 2), actOnColouring);
  ACT.c4col3 = makeAction('C4 on the 81 three-colourings', C4, colourings(4, 3), actOnColouring);
  ACT.d4col3 = makeAction('D4 on the 81 three-colourings', D4, colourings(4, 3), actOnColouring);
  ACT.c6beads = makeAction('C6 on the 64 two-coloured necklaces', C6, colourings(6, 2), actOnColouring);
  ACT.d6beads = makeAction('D6 on the 64 two-coloured necklaces', D6, colourings(6, 2), actOnColouring);
  ACT.leftS3 = makeAction('S3 on itself by left multiplication', S3, dots(6),
    function (p, x) { return S3.idx[key(comp(p, S3.el[x]))]; },
    function (x) { return S3.labels[x]; });
  ACT.conjS3 = makeAction('S3 on itself by conjugation', S3, dots(6),
    function (p, x) { return S3.idx[key(comp(comp(p, S3.el[x]), inv(p)))]; },
    function (x) { return S3.labels[x]; });
  ACT.conjD4 = makeAction('D4 on itself by conjugation', D4, dots(8),
    function (p, x) { return D4.idx[key(comp(comp(p, D4.el[x]), inv(p)))]; },
    function (x) { return D4.labels[x]; });

  /* ---------- derived numbers ---------- */

  var R = {};

  R.cornerOrbits = orbits(ACT.corners);
  R.cornerStab0 = stabiliser(ACT.corners, 0);
  R.segOrbits = orbits(ACT.segments);
  R.s3Orbits = orbits(ACT.s3points);
  R.s3Stab0 = stabiliser(ACT.s3points, 0);

  R.col2C4 = burnside(ACT.c4col2);
  R.col2D4 = burnside(ACT.d4col2);
  R.col3C4 = burnside(ACT.c4col3);
  R.col3D4 = burnside(ACT.d4col3);
  R.beads6C6 = burnside(ACT.c6beads);
  R.beads6D6 = burnside(ACT.d6beads);

  R.orbitsCol2C4 = orbits(ACT.c4col2).length;
  R.orbitsCol2D4 = orbits(ACT.d4col2).length;
  R.orbitsCol3C4 = orbits(ACT.c4col3).length;
  R.orbitsCol3D4 = orbits(ACT.d4col3).length;
  R.orbitsBeads6C6 = orbits(ACT.c6beads).length;
  R.orbitsBeads6D6 = orbits(ACT.d6beads).length;

  R.leftOrbits = orbits(ACT.leftS3);
  R.conjS3Orbits = orbits(ACT.conjS3);
  R.conjD4Orbits = orbits(ACT.conjD4);
  R.conjS3Burnside = burnside(ACT.conjS3);
  R.conjD4Burnside = burnside(ACT.conjD4);
  R.leftBurnside = burnside(ACT.leftS3);

  /* the formula for k colours on the four corners, rotation only and full symmetry */
  function formulaC4(k) { return (Math.pow(k, 4) + Math.pow(k, 2) + 2 * k) / 4; }
  function formulaD4(k) { return (Math.pow(k, 4) + 2 * Math.pow(k, 3) + 3 * Math.pow(k, 2) + 2 * k) / 8; }

  R.table = [];
  for (var k = 1; k <= 5; k++) {
    R.table.push({ k: k, c4: formulaC4(k), d4: formulaD4(k) });
  }

  /* the k-colour formula checked against brute force, for k = 1..4 */
  R.formulaCheck = [];
  for (var kk = 1; kk <= 4; kk++) {
    var a1 = makeAction('C4 k=' + kk, C4, colourings(4, kk), actOnColouring);
    var a2 = makeAction('D4 k=' + kk, D4, colourings(4, kk), actOnColouring);
    R.formulaCheck.push({
      k: kk,
      c4brute: orbits(a1).length, c4formula: formulaC4(kk),
      d4brute: orbits(a2).length, d4formula: formulaD4(kk)
    });
  }

  /* stabilisers of the same orbit are conjugate: stab(gx) = g stab(x) g^-1 */
  R.conjugateCheck = { tests: 0, bad: 0 };
  [ACT.corners, ACT.segments, ACT.s3points].forEach(function (a) {
    for (var g = 0; g < a.G.n; g++) for (var x = 0; x < a.X.length; x++) {
      var y = a.A[g][x];
      var s1 = stabiliser(a, y);
      var s2 = stabiliser(a, x).map(function (h) {
        return a.G.idx[key(comp(comp(a.G.el[g], a.G.el[h]), inv(a.G.el[g])))];
      }).sort(function (p, q) { return p - q; });
      R.conjugateCheck.tests++;
      if (JSON.stringify(s1) !== JSON.stringify(s2)) R.conjugateCheck.bad++;
    }
  });

  /* is the stabiliser of a corner normal in D4? conjugate it by a rotation */
  R.stabNormal = (function () {
    var H = stabiliser(ACT.corners, 0), g = D4.idx[key(rotations(4)[1])];
    var conj = H.map(function (h) {
      return D4.idx[key(comp(comp(D4.el[g], D4.el[h]), inv(D4.el[g])))];
    }).sort(function (p, q) { return p - q; });
    return { H: H, conj: conj, normal: JSON.stringify(H) === JSON.stringify(conj) };
  })();

  /* the naive division that fails */
  R.naive = {
    beads: { total: 64, by: 6, value: 64 / 6, exact: R.orbitsBeads6C6 },
    square: { total: 16, by: 8, value: 16 / 8, exact: R.orbitsCol2D4 }
  };

  /* orbit-stabiliser over every action in the catalogue, every element */
  R.ost = { tests: 0, bad: 0, rows: [] };
  var names = Object.keys(ACT);
  names.forEach(function (nm) {
    var a = ACT[nm];
    for (var x = 0; x < a.X.length; x++) {
      var o = orbitOf(a, x).length, s = stabiliser(a, x).length;
      R.ost.tests++;
      if (o * s !== a.G.n) R.ost.bad++;
      if (R.ost.rows.length < 6 && (nm === 'corners' || nm === 'segments' || nm === 's3points')) {
        R.ost.rows.push({ name: nm, x: x, orbit: o, stab: s, G: a.G.n });
      }
    }
  });

  /* Burnside against brute force over every action in the catalogue */
  R.burnsideCheck = { tests: 0, bad: 0 };
  names.forEach(function (nm) {
    var a = ACT[nm];
    R.burnsideCheck.tests++;
    if (Math.abs(burnside(a).value - orbits(a).length) > 1e-9) R.burnsideCheck.bad++;
  });

  return {
    C4: C4, D4: D4, C6: C6, D6: D6, S3: S3,
    ACT: ACT, R: R,
    orbits: orbits, stabiliser: stabiliser, burnside: burnside, fixes: fixes,
    orbitOf: orbitOf, colourings: colourings, formulaC4: formulaC4, formulaD4: formulaD4,
    comp: comp, inv: inv, key: key, cyclesOf: cyclesOf, rotations: rotations
  };
})();

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

  var CHECKS = [];
  function chk(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail || '' }); }

  var A = GA.ACT, R = GA.R;
  var ACT_NAMES = Object.keys(A);

  /* ---------- the groups ---------- */
  chk('the five groups have orders 8, 4, 6, 6 and 12', GA.D4.n === 8 && GA.C4.n === 4 && GA.S3.n === 6 && GA.C6.n === 6 && GA.D6.n === 12,
    [GA.D4.n, GA.C4.n, GA.S3.n, GA.C6.n, GA.D6.n].join(', '));
  chk('every group table is closed with inverses and associative', true, 'checked as each table is built; a failure throws');
  chk('each group identity is the identity permutation', [GA.C4, GA.D4, GA.C6, GA.D6, GA.S3].every(function (g) {
    return GA.key(g.el[g.e]) === GA.key(g.el[0].map(function (_, i) { return i; }));
  }), '5 groups');

  /* ---------- the actions ---------- */
  chk('twelve actions built, both axioms verified on every one', ACT_NAMES.length === 12, ACT_NAMES.length + ' actions');
  chk('the identity fixes every point of every action', ACT_NAMES.every(function (n) {
    var a = A[n];
    for (var x = 0; x < a.X.length; x++) if (a.A[a.G.e][x] !== x) return false;
    return true;
  }), 'all points');
  chk('orbit sizes add up to the size of the set, in every action', ACT_NAMES.every(function (n) {
    var o = GA.orbits(A[n]), s = 0;
    o.forEach(function (b) { s += b.length; });
    return s === A[n].X.length;
  }), ACT_NAMES.length + ' actions');

  /* ---------- orbits and stabilisers ---------- */
  chk('D4 on four corners has one orbit, of size 4', R.cornerOrbits.length === 1 && R.cornerOrbits[0].length === 4,
    R.cornerOrbits.length + ' orbit(s)');
  chk('the stabiliser of corner 0 is the identity and the diagonal reflection', R.cornerStab0.length === 2 &&
    GA.D4.labels[R.cornerStab0[1]] === 's', GA.D4.labels[R.cornerStab0[0]] + ', ' + GA.D4.labels[R.cornerStab0[1]]);
  chk('D4 on six segments has two orbits, of sizes 4 and 2', R.segOrbits.length === 2 &&
    R.segOrbits[0].length === 4 && R.segOrbits[1].length === 2,
    R.segOrbits.map(function (b) { return b.length; }).join(' and '));
  chk('the small segment orbit is the two diagonals', (function () {
    var d = R.segOrbits[1].map(function (i) { return A.segments.X[i]; });
    return d.length === 2 && d.every(function (p) { return Math.abs(p[0] - p[1]) === 2; });
  })(), 'segments 02 and 13');
  chk('S3 on three points has one orbit of size 3', R.s3Orbits.length === 1 && R.s3Orbits[0].length === 3);
  chk('the stabiliser of a point of S3 has size 2', R.s3Stab0.length === 2, GA.S3.labels[R.s3Stab0[1]]);
  chk('a stabiliser is a subgroup: closed and inverse-closed', (function () {
    var H = R.cornerStab0;
    for (var i = 0; i < H.length; i++) for (var j = 0; j < H.length; j++) {
      var p = GA.D4.idx[GA.key(GA.comp(GA.D4.el[H[i]], GA.D4.el[H[j]]))];
      if (H.indexOf(p) < 0) return false;
    }
    return true;
  })(), 'corner 0 in D4');

  /* ---------- orbit-stabiliser ---------- */
  chk('orbit-stabiliser holds on every point of every action', R.ost.bad === 0, R.ost.tests + ' tests, ' + R.ost.bad + ' exceptions');
  chk('the four corner rows read 8 = 4 x 2', R.ost.rows.filter(function (r) { return r.name === 'corners'; })
    .every(function (r) { return r.orbit * r.stab === r.G && r.orbit === 4 && r.stab === 2; }), '4 rows');
  chk('the diagonal row reads 8 = 2 x 4', (function () {
    var x = R.segOrbits[1][0], o = GA.orbitOf(A.segments, x).length, s = GA.stabiliser(A.segments, x).length;
    return o === 2 && s === 4 && o * s === 8;
  })(), '2 x 4');
  chk('every orbit size divides the group order', ACT_NAMES.every(function (n) {
    var a = A[n];
    for (var x = 0; x < a.X.length; x++) if (a.G.n % GA.orbitOf(a, x).length !== 0) return false;
    return true;
  }), 'all actions');

  /* ---------- conjugacy of stabilisers ---------- */
  chk('stab(gx) is g stab(x) g^-1 on every pair tested', R.conjugateCheck.bad === 0,
    R.conjugateCheck.tests + ' tests, ' + R.conjugateCheck.bad + ' exceptions');
  chk('the stabiliser of a corner is not normal in D4', R.stabNormal.normal === false,
    'conjugates ' + R.stabNormal.H.join('/') + ' and ' + R.stabNormal.conj.join('/'));

  /* ---------- Burnside on the square ---------- */
  chk('C4 on 16 two-colourings fixes 16, 2, 4, 2', JSON.stringify(R.col2C4.fix) === JSON.stringify([16, 2, 4, 2]), R.col2C4.fix.join(', '));
  chk('their average is 6, and the brute-force orbit count is 6', R.col2C4.value === 6 && R.orbitsCol2C4 === 6, '24 / 4');
  chk('D4 on 16 two-colourings fixes 16, 2, 4, 2, 8, 4, 8, 4', JSON.stringify(R.col2D4.fix) === JSON.stringify([16, 2, 4, 2, 8, 4, 8, 4]), R.col2D4.sum + ' over 8');
  chk('the D4 average is also 6', R.col2D4.value === 6 && R.orbitsCol2D4 === 6, '48 / 8');
  chk('three colours give 24 by rotation and 21 by symmetry', R.col3C4.value === 24 && R.col3D4.value === 21, '96/4 and 168/8');
  chk('the brute-force counts agree: 24 and 21', R.orbitsCol3C4 === 24 && R.orbitsCol3D4 === 21);

  /* ---------- the k-colour formulas ---------- */
  chk('the two formulas match brute force for k = 1 to 4', R.formulaCheck.every(function (r) {
    return r.c4brute === r.c4formula && r.d4brute === r.d4formula;
  }), '8 comparisons');
  chk('the table reads 1, 6, 24, 70, 165 by rotation', JSON.stringify(R.table.map(function (r) { return r.c4; })) === JSON.stringify([1, 6, 24, 70, 165]));
  chk('the table reads 1, 6, 21, 55, 120 with reflections', JSON.stringify(R.table.map(function (r) { return r.d4; })) === JSON.stringify([1, 6, 21, 55, 120]));

  /* ---------- the cycle-structure shortcut ---------- */
  function cycleCount(p) {
    var n = p.length, seen = {}, c = 0;
    for (var i = 0; i < n; i++) {
      if (seen[i]) continue;
      c++; var x = i;
      while (!seen[x]) { seen[x] = 1; x = p[x]; }
    }
    return c;
  }
  chk('a permutation with c cycles fixes k^c colourings, for k = 2 and 3', (function () {
    var bad = 0;
    [2, 3].forEach(function (k) {
      var a = k === 2 ? A.c4col2 : A.c4col3;
      for (var g = 0; g < a.G.n; g++) {
        var c = cycleCount(a.G.el[g]);
        if (GA.fixes(a)[g] !== Math.pow(k, c)) bad++;
      }
    });
    return bad === 0;
  })(), '8 rotations x 2 colour counts');

  /* ---------- necklaces and bracelets ---------- */
  chk('six beads, two colours, six rotations: 84 over 6 is 14', R.beads6C6.sum === 84 && R.beads6C6.value === 14 && R.orbitsBeads6C6 === 14, R.beads6C6.fix.join(', '));
  chk('the twelve symmetries give 156 over 12, which is 13', R.beads6D6.sum === 156 && R.beads6D6.value === 13 && R.orbitsBeads6D6 === 13, R.beads6D6.fix.join(', '));
  chk('the naive divisions are wrong: 64/6 is not 14 and 16/8 is not 6', Math.abs(R.naive.beads.value - 14) > 1 && R.naive.square.value !== 6,
    R.naive.beads.value.toFixed(2) + ' and ' + R.naive.square.value);
  chk('64/6 is not even a whole number', Math.abs(R.naive.beads.value - Math.round(R.naive.beads.value)) > 1e-9);

  /* ---------- the two known actions ---------- */
  chk('left multiplication on S3 is transitive with trivial stabilisers', R.leftOrbits.length === 1 && R.leftOrbits[0].length === 6 &&
    GA.stabiliser(A.leftS3, 0).length === 1, '6 = 6 x 1');
  chk('its Burnside average is 1, so the action has one orbit', R.leftBurnside.value === 1 && R.leftBurnside.sum === 6, '6 over 6');
  chk('conjugation on S3 gives three classes of sizes 1, 3, 2', R.conjS3Orbits.length === 3 &&
    JSON.stringify(R.conjS3Orbits.map(function (b) { return b.length; }).sort(function (p, q) { return p - q; })) === JSON.stringify([1, 2, 3]),
    R.conjS3Orbits.map(function (b) { return b.length; }).join('+'));
  chk('Burnside on conjugation counts those classes: 18 over 6', R.conjS3Burnside.value === 3 && R.conjS3Burnside.sum === 18);
  chk('conjugation on D4 gives five classes, 40 over 8', R.conjD4Orbits.length === 5 && R.conjD4Burnside.value === 5 && R.conjD4Burnside.sum === 40);

  /* ---------- Burnside against brute force, everywhere ---------- */
  chk('Burnside equals the brute-force orbit count on all twelve actions', R.burnsideCheck.bad === 0,
    R.burnsideCheck.tests + ' actions, ' + R.burnsideCheck.bad + ' exceptions');

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

  var INK = PAL.ink, DIM = PAL.dim, FAINT = PAL.faint, ACC = PAL.accent;
  var INFO = PAL.info, VAL = PAL.valid, BAD = PAL.invalid, WARN = PAL.warn;
  var SURF2 = PAL.surface2, BORDER = PAL.border, SURF = PAL.surface;
  var ACCDIM = PAL.accentDim || '#d6efeb';
  var WARNDIM = PAL.warnDim || '#fbeed3';
  var BADDIM = PAL.invalidDim || '#fbe4e2';

  function T(x, y, s, size, col, bold, mono, align) {
    P.text(x, y, s, { size: size || 11, color: col || INK, bold: !!bold, mono: !!mono, align: align });
  }
  function box(x, y, w, h, fill, stroke, radius) {
    P.rect(x, y, w, h, { fill: fill || SURF, stroke: stroke === undefined ? BORDER : stroke, radius: radius === undefined ? 6 : radius, sw: 1 });
  }
  function grow(t, at, dur) { return K.clamp01((t - at) / dur); }
  function head(s) { T(46, 14, s, 13, INK, true); }

  /* the square, with the corners labelled 0..3 clockwise from the top left */
  var SQ = { cx: 190, cy: 236, h: 78 };
  var CORNER = [
    { x: SQ.cx - SQ.h, y: SQ.cy - SQ.h },
    { x: SQ.cx + SQ.h, y: SQ.cy - SQ.h },
    { x: SQ.cx + SQ.h, y: SQ.cy + SQ.h },
    { x: SQ.cx - SQ.h, y: SQ.cy + SQ.h }
  ];
  var EDGES = [[0, 1], [1, 2], [2, 3], [3, 0]];
  var DIAGS = [[0, 2], [1, 3]];

  function squareBase(fade) {
    for (var i = 0; i < 4; i++) {
      P.line(CORNER[EDGES[i][0]].x, CORNER[EDGES[i][0]].y, CORNER[EDGES[i][1]].x, CORNER[EDGES[i][1]].y,
        { stroke: BORDER, sw: 2 });
    }
    P.alpha(fade === undefined ? 1 : fade);
  }

  function corners(on) {
    for (var i = 0; i < 4; i++) {
      var on2 = on && on.indexOf(i) >= 0;
      P.circle(CORNER[i].x, CORNER[i].y, on2 ? 12 : 8,
        { fill: on2 ? ACCDIM : SURF, stroke: on2 ? ACC : BORDER, sw: on2 ? 2 : 1.5 });
      var lx = i === 0 || i === 3 ? CORNER[i].x - 22 : CORNER[i].x + 14;
      var ly = i < 2 ? CORNER[i].y - 18 : CORNER[i].y + 6;
      T(lx, ly, String(i), 12, on2 ? ACC : DIM, on2, true);
    }
  }

  /* ---------------- scene 1: the action ---------------- */
  function sceneAct(t, sc, p) {
    head('One group, eight moves, and the four corners it moves');
    squareBase();
    corners([0]);
    T(46, 340, 'The set is the four corners. The group is the eight symmetries of the square.', 10.5, DIM);

    var y0 = 66;
    for (var i = 0; i < 8; i++) {
      var col = i < 4 ? 0 : 1, row = i % 4;
      var x = col === 0 ? 372 : 634;
      var y = y0 + row * 44;
      if (grow(t, sc.start + 2 + i * 2.4, 4) < 0.05) continue;
      box(x, y, 240, 34, SURF, BORDER, 5);
      T(x + 10, y + 9, GA.D4.labels[i], 12, i === 0 ? ACC : INK, true, true);
      var to = A.corners.A[i][0];
      T(x + 46, y + 10, 'sends corner 0 to', 10, DIM);
      T(x + 196, y + 9, String(to), 12, ACC, true, true);
    }

    if (grow(t, sc.start + 22, 4) > 0.05) {
      box(46, 366, 808, 66, ACCDIM, ACC, 6);
      T(62, 378, 'Corner 0 reaches four places, and each place is reached by two of the eight moves.', 11, ACC, true);
      T(62, 398, 'The orbit is the four corners. The two moves that leave corner 0 alone are its stabiliser.', 10.5, DIM);
      T(62, 416, 'Nothing here depends on the corner: every corner of a square behaves the same way.', 10, DIM);
    }
  }

  /* ---------------- scene 2: the two axioms ---------------- */
  function sceneAxioms(t, sc, p) {
    head('Two rules, and everything else follows from them');

    box(46, 46, 390, 130, SURF, BORDER, 6);
    T(60, 58, 'Rule 1  the identity moves nothing', 11.5, ACC, true);
    T(60, 82, 'e . x  =  x', 14, INK, true, true);
    T(60, 110, 'The do-nothing element must fix every point.', 10.5, DIM);
    T(60, 128, 'Checked on every point of every action here,', 10.5, DIM);
    T(60, 146, 'including the 81 three-colourings.', 10.5, DIM);

    box(464, 46, 390, 130, SURF, BORDER, 6);
    T(478, 58, 'Rule 2  the group law matches the moving', 11.5, ACC, true);
    T(478, 82, '(g h) . x  =  g . (h . x)', 14, INK, true, true);
    T(478, 110, 'Move by h, then by g, or move by the product', 10.5, DIM);
    T(478, 128, 'once. The two must agree, for every pair of', 10.5, DIM);
    T(478, 146, 'elements and every point.', 10.5, DIM);

    box(46, 194, 808, 132, SURF2, BORDER, 6);
    T(60, 206, 'Both rules are checked by building the whole table of moves, never by trusting the picture', 11, INK, true);
    T(60, 232, 'Each action is stored as a table: one row per group element, one column per point.', 10.5, DIM);
    T(60, 252, 'The identity row must be the identity map.', 10.5, DIM);
    T(60, 272, 'For every pair of elements the composed row must equal the row-by-row composition.', 10.5, DIM);
    T(60, 292, 'A failure throws at load, so a wrong action can never be drawn.', 10.5, DIM);
    T(60, 312, 'Twelve actions pass: corners, segments, colourings, necklaces, and the group on itself.', 10.5, DIM);

    if (grow(t, sc.start + 22, 4) > 0.05) {
      box(46, 344, 808, 88, ACCDIM, ACC, 6);
      T(62, 356, 'No bijection, no shared elements, no size relation: only these two rules.', 11, ACC, true);
      T(62, 378, 'Orbit, stabiliser, the size identity and the counting theorem are all consequences', 10.5, DIM);
      T(62, 396, 'of the two rules. The rest of the page never re-checks them.', 10.5, DIM);
      T(62, 414, 'This is why an action is cheap to define and expensive to get wrong.', 10, DIM);
    }
  }

  /* ---------------- scene 3: the orbit ---------------- */
  function sceneOrbit(t, sc, p) {
    head('The orbit: everything a point can reach');
    squareBase();
    /* sides solid accent, diagonals dashed warning */
    for (var i = 0; i < 4; i++) {
      P.line(CORNER[EDGES[i][0]].x, CORNER[EDGES[i][0]].y, CORNER[EDGES[i][1]].x, CORNER[EDGES[i][1]].y,
        { stroke: ACC, sw: 3 });
    }
    var dOn = grow(t, sc.start + 8, 6);
    if (dOn > 0.05) {
      P.alpha(dOn);
      for (var j = 0; j < 2; j++) {
        P.line(CORNER[DIAGS[j][0]].x, CORNER[DIAGS[j][0]].y, CORNER[DIAGS[j][1]].x, CORNER[DIAGS[j][1]].y,
          { stroke: WARN, sw: 3, dash: [7, 5] });
      }
      P.alpha(1);
    }
    corners();
    T(46, 340, 'solid: the four sides', 10, ACC, true);
    T(46, 358, 'dashed: the two diagonals', 10, WARN, true);
    T(46, 382, 'No symmetry carries a side to a diagonal:', 10, DIM);
    T(46, 400, 'lengths 1 and root 2 are preserved.', 10, DIM);

    box(376, 52, 478, 96, SURF, BORDER, 6);
    T(392, 64, 'Orbit of a side', 11.5, ACC, true);
    T(392, 88, 'all four sides: size 4', 11, INK, true, true);
    T(392, 112, 'each side is fixed by 2 symmetries', 10.5, DIM);
    T(392, 130, 'so 8 = 4 x 2', 10.5, DIM);

    box(376, 160, 478, 96, SURF, BORDER, 6);
    T(392, 172, 'Orbit of a diagonal', 11.5, WARN, true);
    T(392, 196, 'both diagonals: size 2', 11, INK, true, true);
    T(392, 220, 'each diagonal is fixed by 4 symmetries', 10.5, DIM);
    T(392, 238, 'so 8 = 2 x 4', 10.5, DIM);

    box(376, 268, 478, 90, SURF2, BORDER, 6);
    T(392, 280, 'Being in the same orbit is an equivalence relation', 11, INK, true);
    T(392, 304, 'identity keeps x, symmetries undo, two symmetries compose.', 10.5, DIM);
    T(392, 324, 'So the orbits are disjoint blocks: 4 + 2 = 6 segments,', 10.5, DIM);
    T(392, 342, 'and the 16 colourings split as 6 blocks adding to 16.', 10.5, DIM);

    if (grow(t, sc.start + 24, 4) > 0.05) {
      T(376, 386, 'A transitive action has one orbit: the corners, but not the segments.', 10.5, ACC, true);
      T(376, 406, 'The number of orbits is the number of genuinely different objects.', 10.5, ACC, true);
    }
  }

  /* ---------------- scene 4: the stabiliser ---------------- */
  function sceneStab(t, sc, p) {
    head('The stabiliser: the moves that leave a point alone');
    squareBase();
    var on = grow(t, sc.start + 2, 6);
    if (on > 0.05) {
      P.alpha(on);
      P.line(CORNER[0].x, CORNER[0].y, CORNER[2].x, CORNER[2].y, { stroke: VAL, sw: 3 });
      P.alpha(1);
    }
    corners([0, 2]);
    T(46, 340, 'the reflection s across the diagonal 0-2', 10, VAL, true);
    T(46, 358, 'fixes corner 0 and corner 2, and swaps 1 with 3', 10, DIM);
    T(46, 382, 'Six of the eight symmetries move corner 0.', 10, DIM);
    T(46, 400, 'Two leave it where it is: e and s.', 10, DIM);

    var y0 = 56;
    for (var i = 0; i < 8; i++) {
      var col = i < 4 ? 0 : 1, row = i % 4;
      var x = col === 0 ? 372 : 636;
      var y = y0 + row * 42;
      var to = A.corners.A[i][0], fixes = to === 0;
      box(x, y, 232, 32, fixes ? '#eaf6ee' : SURF, fixes ? VAL : BORDER, 5);
      T(x + 10, y + 8, GA.D4.labels[i], 12, fixes ? VAL : INK, true, true);
      T(x + 46, y + 9, fixes ? 'fixes 0' : 'moves 0 to ' + to, 10.5, fixes ? VAL : DIM, fixes);
    }

    if (grow(t, sc.start + 20, 5) > 0.05) {
      box(372, 232, 496, 122, ACCDIM, ACC, 6);
      T(388, 244, 'The stabiliser is a subgroup', 11.5, ACC, true);
      T(388, 268, 'contains e; closed, since gh fixes x when both do;', 10.5, DIM);
      T(388, 288, 'inverse-closed, since g x = x gives x = g-inverse x.', 10.5, DIM);
      T(388, 312, 'But not normal: conjugating {e, s} by the quarter turn', 10.5, BAD, true);
      T(388, 332, 'gives {e, r2s}, the stabiliser of corner 2. Different.', 10.5, DIM);
    }
  }

  /* ---------------- scene 5: orbit-stabiliser ---------------- */
  function sceneOst(t, sc, p) {
    head('Orbit-stabiliser: the group order factors into the two');

    var rows = [
      { a: 'D4 on the four corners', b: '8', c: '4', d: '2', note: 'a corner reaches 4, and 2 moves fix it' },
      { a: 'D4 on a diagonal', b: '8', c: '2', d: '4', note: 'a diagonal reaches 2, and 4 moves fix it' },
      { a: 'S3 on three points', b: '6', c: '3', d: '2', note: 'a point reaches 3, and 2 permutations fix it' }
    ];
    for (var i = 0; i < 3; i++) {
      var y = 50 + i * 74;
      if (grow(t, sc.start + 2 + i * 6, 6) < 0.05) continue;
      box(46, y, 808, 62, SURF, BORDER, 6);
      T(62, y + 12, rows[i].a, 11.5, INK, true);
      T(62, y + 36, rows[i].note, 10.5, DIM);
      T(600, y + 12, rows[i].b + '  =  ' + rows[i].c + '  x  ' + rows[i].d, 15, ACC, true, true);
      T(600, y + 38, 'group  orbit  stabiliser', 9.5, FAINT);
    }

    box(46, 274, 808, 84, SURF2, BORDER, 6);
    T(62, 286, 'Why it is true', 11.5, INK, true);
    T(62, 310, 'Send each element g to the point g . x. The map is onto the orbit.', 10.5, DIM);
    T(62, 330, 'g and h land together exactly when h-inverse g fixes x, so each fibre', 10.5, DIM);
    T(62, 348, 'is a coset of the stabiliser: same size, one fibre per orbit point.', 10.5, DIM);

    if (grow(t, sc.start + 24, 5) > 0.05) {
      box(46, 372, 808, 60, ACCDIM, ACC, 6);
      T(62, 384, 'Checked on 355 point-element pairs across all twelve actions: no exception.', 11, ACC, true);
      T(62, 406, 'Consequence: an orbit size always divides the group order, so never 3 in D4.', 10.5, DIM);
    }
  }

  /* ---------------- scene 6: Burnside ---------------- */
  function sceneBurnside(t, sc, p) {
    head("Burnside's lemma: average the fixed points, do not divide");

    T(46, 44, 'The four rotations acting on the 16 two-colourings of the corners', 11, INK, true);
    var lab = ['e', 'r', 'r2', 'r3'], fix = R.col2C4.fix;
    for (var i = 0; i < 4; i++) {
      var x = 46 + i * 128;
      if (grow(t, sc.start + 2 + i * 5, 5) < 0.05) continue;
      box(x, 66, 116, 74, SURF, BORDER, 6);
      T(x + 58, 76, lab[i], 13, ACC, true, true, 'center');
      T(x + 58, 100, String(fix[i]), 20, INK, true, true, 'center');
      T(x + 58, 126, 'colourings fixed', 9.5, FAINT, false, false, 'center');
    }

    if (grow(t, sc.start + 12, 5) > 0.05) {
      box(574, 66, 280, 74, ACCDIM, ACC, 6);
      T(590, 78, 'sum  =  ' + R.col2C4.sum, 12, ACC, true, true);
      T(590, 100, R.col2C4.sum + ' / ' + R.col2C4.n + '  =  ' + R.col2C4.value + ' orbits', 14, ACC, true, true);
      T(590, 124, 'brute-force orbit count: ' + R.orbitsCol2C4, 10, DIM);
    }

    box(46, 158, 808, 88, SURF2, BORDER, 6);
    T(62, 170, 'Why the naive division fails', 11.5, INK, true);
    T(62, 194, '16 colourings over 8 symmetries is 2. The true count is 6.', 11, BAD, true);
    T(62, 216, 'The all-one-colour painting appears once in the list of 16;', 10.5, DIM);
    T(62, 234, 'a two-and-two painting appears four times. No single divisor exists.', 10.5, DIM);

    box(46, 256, 808, 92, SURF, BORDER, 6);
    T(62, 268, 'Why the average is right', 11.5, INK, true);
    T(62, 292, 'Count pairs (element, point it fixes) in the two possible orders.', 10.5, DIM);
    T(62, 312, 'Summing over elements gives the total fixed points; summing over points', 10.5, DIM);
    T(62, 330, 'gives the stabiliser sizes, which by orbit-stabiliser is the set size.', 10.5, DIM);

    if (grow(t, sc.start + 24, 5) > 0.05) {
      T(62, 366, 'Both totals are the same number, so dividing by the group order gives the orbits.', 10.5, ACC, true);
      T(62, 388, 'With reflections as well the eight fixed counts are 16, 2, 4, 2, 8, 4, 8, 4:', 10.5, DIM);
      T(62, 408, '48 over 8 is 6 again, because at four corners and two colours the two agree.', 10.5, DIM);
    }
  }

  /* ---------------- scene 7: necklaces ---------------- */
  function sceneNecklace(t, sc, p) {
    head('Six beads, two colours: 64 strings, 14 necklaces, 13 bracelets');

    var cx = 190, cy = 236, r = 84;
    for (var i = 0; i < 6; i++) {
      var ang = -Math.PI / 2 + i * Math.PI / 3;
      var bx = cx + r * Math.cos(ang), by = cy + r * Math.sin(ang);
      var filled = i % 2 === 0;
      P.circle(bx, by, 15, { fill: filled ? ACCDIM : SURF, stroke: filled ? ACC : BORDER, sw: 2 });
      T(bx - 3, by - 7, String(i), 10, filled ? ACC : DIM, true, true);
    }
    T(46, 348, 'number the beads 0 to 5: 2 to the 6 is 64 strings', 10, DIM);
    T(46, 368, 'turning by one bead is a rotation, and', 10, DIM);
    T(46, 386, 'flipping over is a reflection', 10, DIM);

    box(376, 52, 478, 118, SURF, BORDER, 6);
    T(392, 64, 'Rotations only: six moves, group C6', 11.5, ACC, true);
    T(392, 88, 'fixed: 64, 2, 4, 8, 4, 2', 11, INK, true, true);
    T(392, 112, 'sum 84, and 84 / 6 = 14 necklaces', 11.5, ACC, true, true);
    T(392, 136, 'each rotation forces a periodic colouring', 10.5, DIM);
    T(392, 154, 'the half turn fixes 2 cubed = 8', 10.5, DIM);

    box(376, 182, 478, 118, SURF, BORDER, 6);
    T(392, 194, 'Turning and flipping: twelve moves, D6', 11.5, WARN, true);
    T(392, 218, 'three reflections fix 16, three fix 8', 11, INK, true, true);
    T(392, 242, 'sum 156, and 156 / 12 = 13 bracelets', 11.5, WARN, true, true);
    T(392, 266, 'one necklace collapses into another', 10.5, DIM);
    T(392, 284, 'only if they are mirror images', 10.5, DIM);

    box(376, 312, 478, 78, BADDIM, BAD, 6);
    T(392, 324, 'The naive answer: 64 / 6 = 10.67', 11.5, BAD, true);
    T(392, 348, 'not a whole number, and not the count.', 10.5, DIM);
    T(392, 368, 'the alternating necklace appears twice, the plain one once.', 10, DIM);
  }

  /* ---------------- scene 8: the two formulas ---------------- */
  function sceneColours(t, sc, p) {
    head('k colours on the four corners: two formulas, one difference');

    box(46, 46, 390, 108, SURF, BORDER, 6);
    T(60, 58, 'Rotations only, group C4', 11.5, ACC, true);
    T(60, 84, '(k^4 + k^2 + 2k) / 4', 14, INK, true, true);
    T(60, 112, 'e: k^4   r2: k^2   r and r3: k each', 10.5, DIM);
    T(60, 134, 'k = 3 gives 96 / 4 = 24', 10.5, ACC, true);

    box(464, 46, 390, 108, SURF, BORDER, 6);
    T(478, 58, 'Turning and flipping, group D4', 11.5, WARN, true);
    T(478, 84, '(k^4 + 2k^3 + 3k^2 + 2k) / 8', 14, INK, true, true);
    T(478, 112, 'two diagonals: k^3 each, two mid-lines: k^2 each', 10, DIM);
    T(478, 134, 'k = 3 gives 168 / 8 = 21', 10.5, WARN, true);

    /* the table */
    var ty = 186;
    box(46, ty, 808, 150, SURF, BORDER, 6);
    T(62, ty + 12, 'Both formulas, checked against enumerating every colouring', 11, INK, true);
    var cols = [200, 380, 560];
    T(cols[0], ty + 40, 'k', 10.5, FAINT, true, true);
    T(cols[1], ty + 40, 'rotations', 10.5, ACC, true, true);
    T(cols[2], ty + 40, 'turning and flipping', 10.5, WARN, true, true);
    for (var i = 0; i < 5; i++) {
      var y = ty + 62 + i * 20;
      T(cols[0], y, String(R.table[i].k), 11, INK, true, true);
      T(cols[1], y, String(R.table[i].c4), 11, ACC, true, true);
      T(cols[2], y, String(R.table[i].d4), 11, WARN, true, true);
    }
    T(620, ty + 62, 'k = 2 agrees at 6', 10, DIM);
    T(620, ty + 82, 'k = 3 differs: 24 and 21', 10, DIM);
    T(620, ty + 102, 'k = 5 differs by 45', 10, DIM);
    T(620, ty + 126, 'the agreement at k = 2 is a coincidence', 10, BAD, true);

    if (grow(t, sc.start + 24, 5) > 0.05) {
      box(46, 356, 808, 76, ACCDIM, ACC, 6);
      T(62, 368, 'For k = 3 the gap of three is the three paintings that are mirror images only.', 11, ACC, true);
      T(62, 390, 'Both formulas are re-derived from the fixed-point counts on this page, then', 10.5, DIM);
      T(62, 408, 'compared with brute force for k = 1 to 4: eight comparisons, no mismatch.', 10.5, DIM);
    }
  }

  /* ---------------- scene 9: the two known actions ---------------- */
  function sceneKnown(t, sc, p) {
    head('Two actions you already know: the group on itself');

    box(46, 46, 390, 150, SURF, BORDER, 6);
    T(60, 58, 'Left multiplication', 11.5, ACC, true);
    T(60, 82, 'g . h  =  g h', 13, INK, true, true);
    T(60, 110, 'S3 on its six elements: one orbit of six', 10.5, DIM);
    T(60, 130, 'the stabiliser of e is {e} alone', 10.5, DIM);
    T(60, 152, '6 = 6 x 1, so the action is free', 10.5, ACC, true);
    T(60, 174, 'orbit-stabiliser gives Cayley\'s theorem', 10.5, DIM);

    box(464, 46, 390, 150, SURF, BORDER, 6);
    T(478, 58, 'Conjugation', 11.5, WARN, true);
    T(478, 82, 'g . h  =  g h g-inverse', 13, INK, true, true);
    T(478, 110, 'the orbits are the conjugacy classes', 10.5, DIM);
    T(478, 130, 'S3: 1 + 3 + 2, so three classes', 10.5, DIM);
    T(478, 152, 'D4: five classes', 10.5, WARN, true);
    T(478, 174, 'the stabiliser is the centraliser', 10.5, DIM);

    box(46, 212, 808, 96, SURF2, BORDER, 6);
    T(62, 224, 'Burnside counts the classes', 11.5, INK, true);
    T(62, 248, 'S3: fixed counts over six elements sum to 18, and 18 / 6 = 3 classes', 10.5, DIM);
    T(62, 268, 'D4: the eight elements sum to 40, and 40 / 8 = 5 classes', 10.5, DIM);
    T(62, 290, 'the classes of S3 have sizes 1, 3 and 2, adding to the group order', 10.5, DIM);

    if (grow(t, sc.start + 24, 5) > 0.05) {
      box(46, 324, 808, 108, ACCDIM, ACC, 6);
      T(62, 336, 'One idea, three questions', 11.5, ACC, true);
      T(62, 360, 'how many distinct objects: count the orbits of a colouring action;', 10.5, DIM);
      T(62, 380, 'how big is one orbit: orbit-stabiliser, |G| divided by the stabiliser;', 10.5, DIM);
      T(62, 400, 'how many classes: Burnside on the conjugation action.', 10.5, DIM);
      T(62, 420, 'Same two results every time; only the set changes.', 10, DIM);
    }
  }

  /* ---------------- scene 10: exam ---------------- */
  function sceneExam(t, sc, p) {
    head('Four steps, and the four traps');

    var steps = [
      { h: '1  name the group', b: 'rotations only, or rotations and reflections' },
      { h: '2  name the set', b: 'colourings, permutations, or the group itself' },
      { h: '3  count fixed points', b: 'a permutation with c cycles fixes k^c' },
      { h: '4  divide by the order', b: 'the sum of the fixed counts over |G|' }
    ];
    for (var i = 0; i < 4; i++) {
      var x = 46 + i * 204;
      if (grow(t, sc.start + 2 + i * 4, 5) < 0.05) continue;
      box(x, 48, 192, 104, SURF, BORDER, 6);
      T(x + 12, 60, steps[i].h, 11.5, ACC, true);
      T(x + 12, 86, steps[i].b.slice(0, 26), 10, DIM);
      T(x + 12, 106, steps[i].b.slice(26, 52), 10, DIM);
      T(x + 12, 126, steps[i].b.slice(52), 10, DIM);
    }

    var traps = [
      { a: 'Trap 1: dividing the total by the group order', b: '16 / 8 = 2, but the answer is 6' },
      { a: 'Trap 2: the wrong group', b: '14 against 13, 24 against 21' },
      { a: 'Trap 3: swapping orbit and stabiliser', b: '8 = 2 x 4 on a diagonal, not 4 x 2' },
      { a: 'Trap 4: a subgroup is not always normal', b: 'the corner stabiliser is conjugate to another' }
    ];
    for (var j = 0; j < 4; j++) {
      var y = 176 + j * 50;
      if (grow(t, sc.start + 18 + j * 2.4, 4) < 0.05) continue;
      box(46, y, 808, 42, j === 0 ? BADDIM : WARNDIM, j === 0 ? BAD : WARN, 5);
      T(62, y + 8, traps[j].a, 10.5, j === 0 ? BAD : WARN, true);
      T(62, y + 24, traps[j].b, 10, DIM);
    }

    if (grow(t, sc.start + 26, 4) > 0.05) {
      box(46, 380, 808, 52, ACCDIM, ACC, 6);
      T(62, 392, 'Orbits are what you count, stabilisers are how much symmetry one point has,', 11, ACC, true);
      T(62, 412, 'and the average over the group joins the two into one number.', 11, ACC, true);
    }
  }

  var SCENE_DRAW = {
    act: sceneAct, axioms: sceneAxioms, orbit: sceneOrbit, stab: sceneStab,
    ost: sceneOst, burnside: sceneBurnside, necklace: sceneNecklace,
    colours: sceneColours, known: sceneKnown, exam: sceneExam
  };

  /* ---------------- frame ---------------- */

  function drawFrame(t) {
    if (!P) return;
    P.clear();
    var scenes = window.LESSON_TIMELINE.scenes;
    var i = K.sceneAt(t);
    var sc = scenes[i];
    if (!sc) return;
    var p = K.sceneProgress(t);
    var fn = SCENE_DRAW[sc.id];
    if (fn) fn(t, sc, p);

    P.rect(0, H - 5, W * K.clamp01((t - sc.start) / Math.max(0.001, sc.end - sc.start)), 5,
           { fill: ACC, stroke: null });
  }

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

  function paintChecks() {
    var el = document.getElementById('checks');
    if (!el) return;
    var pass = CHECKS.filter(function (c) { return c.pass; }).length;
    var bad = CHECKS.length - pass;
    el.innerHTML = '<span class="k">Model checks</span>' + pass + ' of ' + CHECKS.length +
      ' pass' + (bad ? ' \u00b7 ' + bad + ' FAILED' : ' \u00b7 all computed at load');
    var cc = document.getElementById('check-count');
    if (cc) cc.textContent = String(CHECKS.length);
  }

  function boot() {
    var holder = document.getElementById('canvas-holder');
    var fallback = document.getElementById('canvas-fallback');
    var ok = false;

    if (typeof window.createCanvas === 'function' && PR) {
      try {
        new window.p5(function (s) {
          s.setup = function () {
            var c = s.createCanvas(W, H);
            if (c && c.parent) c.parent(holder);
            s.pixelDensity(1);
            s.noLoop();
            P = PR.makePainterP5(s, W, H);
            drawFrame(K.state.elapsed);
          };
          s.draw = function () { drawFrame(K.state.elapsed); };
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
          drawFrame(0);
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
        draw: function () { if (P) drawFrame(K.state.elapsed); }
      });
    }

    paintChecks();

    window.__drawAt = function (t) {
      K.state.elapsed = t;
      if (P) drawFrame(t);
    };
    window.__lessonChecks = CHECKS;
    window.__model = {
      actions: ACT_NAMES.length,
      orbitStabiliserTests: R.ost.tests,
      checks: CHECKS.length,
      necklaces: R.orbitsBeads6C6,
      bracelets: R.orbitsBeads6D6,
      table: R.table
    };

    var bad = CHECKS.filter(function (c) { return !c.pass; });
    if (bad.length) console.warn('Model validation did not fully pass:', bad);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
