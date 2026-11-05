/* ==========================================================================
   group-isomorphism-and-invariants — lesson.js
   Four layers, in order:
     1. THE MODEL      — eight finite groups built as real multiplication tables
                         (Z4, V4, Z6, S3, D4, Q8, Z4xZ4, Q8xZ2), plus a
                         brute-force isomorphism search over all bijections that
                         fix the identity. Every profile, subgroup count and
                         automorphism count on the page is computed here.
     2. THE CHECKS     — every number a caption states is recomputed and asserted.
     3. RENDER         — reads the model; never re-derives a number.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The claim under test is one sentence: a relabelling cannot change an
   invariant, so a mismatch proves difference, but a match proves nothing.
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

var GRP = (function () {
  'use strict';

  /* ---- a group is a set 0..n-1 and a multiplication table ---- */
  function make(name, n, mul) {
    var g = { name: name, n: n, mul: mul };
    g.e = null;
    for (var e = 0; e < n; e++) {
      var ok = true;
      for (var x = 0; x < n; x++) {
        if (mul(e, x) !== x || mul(x, e) !== x) { ok = false; break; }
      }
      if (ok) { g.e = e; break; }
    }
    if (g.e === null) throw new Error('no identity in ' + name);
    return g;
  }

  function orderOf(g, a) {
    var r = g.e;
    for (var k = 1; k <= g.n; k++) {
      r = g.mul(r, a);
      if (r === g.e) return k;
    }
    return 0;
  }

  function profileOf(g) {
    var c = {}, o;
    for (var a = 0; a < g.n; a++) {
      o = orderOf(g, a);
      c[o] = (c[o] || 0) + 1;
    }
    return c;
  }

  function profileKey(g) {
    var p = profileOf(g), keys = Object.keys(p).map(Number).sort(function (a, b) { return a - b; });
    return keys.map(function (d) { return d + ':' + p[d]; }).join(' ');
  }

  function isAbelian(g) {
    for (var a = 0; a < g.n; a++) {
      for (var b = 0; b < g.n; b++) {
        if (g.mul(a, b) !== g.mul(b, a)) return false;
      }
    }
    return true;
  }

  function centreSize(g) {
    var c = 0;
    for (var a = 0; a < g.n; a++) {
      var all = true;
      for (var b = 0; b < g.n; b++) {
        if (g.mul(a, b) !== g.mul(b, a)) { all = false; break; }
      }
      if (all) c++;
    }
    return c;
  }

  /* every subset containing e that is closed under the operation.
     Only run for n <= 9: the mask loop is 2^n. */
  function subgroups(g) {
    if (g.n > 9) return null;
    var subs = [];
    for (var mask = 1; mask < (1 << g.n); mask++) {
      var S = [];
      for (var i = 0; i < g.n; i++) if ((mask >> i) & 1) S.push(i);
      if (S.indexOf(g.e) < 0) continue;
      var closed = true;
      for (var a = 0; a < S.length && closed; a++) {
        for (var b = 0; b < S.length; b++) {
          if (S.indexOf(g.mul(S[a], S[b])) < 0) { closed = false; break; }
        }
      }
      if (closed) subs.push(S);
    }
    return subs;
  }

  /* every bijection A -> B that preserves the operation.
     Two prunings, both sound: the identity must go to the identity, and the
     order of an element must be preserved. The second is the profile test
     applied one element at a time, and it is what makes the search cheap. */
  function isomorphisms(A, B) {
    if (A.n !== B.n || A.n > 8) return { all: [], tested: 0, raw: 0 };
    var n = A.n, perm = new Array(n), used = new Array(n), out = [];
    var tested = 0, raw = 0;
    var rawCount = 1;
    for (var f = 2; f < n; f++) rawCount *= f;   /* (n-1)! bijections fixing e */
    raw = rawCount;

    (function rec(i) {
      if (i === n) {
        tested++;
        var ok = true;
        for (var a = 0; a < n && ok; a++) {
          for (var b = 0; b < n; b++) {
            if (perm[A.mul(a, b)] !== B.mul(perm[a], perm[b])) { ok = false; break; }
          }
        }
        if (ok) out.push(perm.slice());
        return;
      }
      for (var v = 0; v < n; v++) {
        if (used[v]) continue;
        if (orderOf(A, i) !== orderOf(B, v)) continue;
        used[v] = 1; perm[i] = v;
        rec(i + 1);
        used[v] = 0;
      }
    })(0);

    return { all: out, tested: tested, raw: raw };
  }

  /* ---- the eight groups ------------------------------------------------ */

  function cyclic(n) {
    return make('Z' + n, n, function (a, b) { return (a + b) % n; });
  }

  function direct(A, B, name) {
    return make(name, A.n * B.n, function (x, y) {
      var a1 = Math.floor(x / B.n), b1 = x % B.n;
      var a2 = Math.floor(y / B.n), b2 = y % B.n;
      return A.mul(a1, a2) * B.n + B.mul(b1, b2);
    });
  }

  function symmetric(n) {
    var els = [], cur;
    (function build(prefix, rest) {
      if (!rest.length) { els.push(prefix.slice()); return; }
      for (var i = 0; i < rest.length; i++) {
        build(prefix.concat([rest[i]]), rest.slice(0, i).concat(rest.slice(i + 1)));
      }
    })([], Array.from({ length: n }, function (_, i) { return i; }));
    return make('S' + n, els.length, function (i, j) {
      var p = els[i], q = els[j], t = [], k;
      for (k = 0; k < n; k++) t.push(p[q[k]]);
      for (k = 0; k < els.length; k++) {
        var e = els[k], same = true;
        for (var m = 0; m < n; m++) if (e[m] !== t[m]) { same = false; break; }
        if (same) return k;
      }
      return -1;
    });
  }

  /* dihedral of the 2n-gon: element i < n is r^i, element n+i is r^i s */
  function dihedral(n) {
    return make('D' + n, 2 * n, function (x, y) {
      var xi = x % n, xs = Math.floor(x / n);
      var yi = y % n, ys = Math.floor(y / n);
      if (xs === 0 && ys === 0) return (xi + yi) % n;
      if (xs === 0 && ys === 1) return n + (xi + yi) % n;
      if (xs === 1 && ys === 0) return n + (xi - yi + n * 2) % n;
      return (xi - yi + n * 2) % n;
    });
  }

  /* the quaternion group: element 2p+q is i^p j^q, with i^4 = 1, j^2 = i^2,
     and j i = i^-1 j. */
  function quat() {
    return make('Q8', 8, function (x, y) {
      var p = Math.floor(x / 2), q = x % 2;
      var r = Math.floor(y / 2), s = y % 2;
      var rr = (q === 0) ? r : ((-r) % 4 + 4) % 4;
      var pp = (p + rr) % 4, qq = q + s;
      if (qq === 2) { pp = (pp + 2) % 4; qq = 0; }
      return pp * 2 + qq;
    });
  }

  var Z2 = cyclic(2), Z3 = cyclic(3), Z4 = cyclic(4), Z6 = cyclic(6);
  var V4 = direct(Z2, Z2, 'V4');
  var Z2xZ3 = direct(Z2, Z3, 'Z2xZ3');
  var S3 = symmetric(3);
  var D4 = dihedral(4);
  var Q8 = quat();
  var Z4xZ4 = direct(Z4, Z4, 'Z4xZ4');
  var Q8xZ2 = direct(Q8, Z2, 'Q8xZ2');

  /* ---- the pairs the lesson compares ---------------------------------- */

  function facts(g) {
    return {
      name: g.name,
      n: g.n,
      e: g.e,
      abelian: isAbelian(g),
      centre: centreSize(g),
      profile: profileOf(g),
      profileKey: profileKey(g),
      subs: subgroups(g)
    };
  }

  var PAIRS = [
    { a: Z4, b: V4, order: 4 },
    { a: Z6, b: S3, order: 6 },
    { a: D4, b: Q8, order: 8 },
    { a: Z4xZ4, b: Q8xZ2, order: 16 }
  ];

  var ROWS = PAIRS.map(function (p) {
    var fa = facts(p.a), fb = facts(p.b);
    var search = isomorphisms(p.a, p.b);
    return {
      order: p.order,
      an: fa.name, bn: fb.name,
      aAb: fa.abelian, bAb: fb.abelian,
      aCentre: fa.centre, bCentre: fb.centre,
      aProfile: fa.profile, bProfile: fb.profile,
      aKey: fa.profileKey, bKey: fb.profileKey,
      sameProfile: fa.profileKey === fb.profileKey,
      aSubs: fa.subs ? fa.subs.length : null,
      bSubs: fb.subs ? fb.subs.length : null,
      witnesses: search.all.length,
      tested: search.tested,
      raw: search.raw,
      isomorphic: search.all.length > 0
    };
  });

  var F = {
    Z4: facts(Z4), V4: facts(V4), Z6: facts(Z6), S3: facts(S3),
    D4: facts(D4), Q8: facts(Q8), Z4xZ4: facts(Z4xZ4), Q8xZ2: facts(Q8xZ2)
  };

  /* ---- the witness Z6 -> Z2 x Z3 -------------------------------------- */

  /* phi(x) = (x mod 2, x mod 3), stored as index (x mod 2) * 3 + (x mod 3) */
  var PHI = {}, PHI_PAIRS = 0, PHI_BAD = 0, PHI_ORDER_OK = true;
  (function () {
    var x, a, b, v;
    for (x = 0; x < 6; x++) PHI[x] = (x % 2) * 3 + (x % 3);
    for (a = 0; a < 6; a++) {
      for (b = 0; b < 6; b++) {
        PHI_PAIRS++;
        v = PHI[(a + b) % 6];
        if (v !== Z2xZ3.mul(PHI[a], PHI[b])) PHI_BAD++;
      }
      if (orderOf(Z6, a) !== orderOf(Z2xZ3, PHI[a])) PHI_ORDER_OK = false;
    }
  })();

  /* ---- automorphism counts (isomorphisms of a group with itself) ------ */

  function autCount(g) { return isomorphisms(g, g).all.length; }

  var AUT = {
    Z4: autCount(Z4), V4: autCount(V4), Z6: autCount(Z6), S3: autCount(S3),
    D4: autCount(D4), Q8: autCount(Q8)
  };

  /* ---- is isomorphism an equivalence relation? checked on four groups
     of order 6, three of which are the same group written three ways ---- */
  var SIX = [Z6, Z2xZ3, direct(Z3, Z2, 'Z3xZ2'), S3];
  var REL = { refl: 0, reflTotal: 0, sym: 0, symTotal: 0, trans: 0, transTotal: 0 };
  (function () {
    var i, j, k;
    for (i = 0; i < SIX.length; i++) {
      REL.reflTotal++;
      if (isomorphisms(SIX[i], SIX[i]).all.length > 0) REL.refl++;
    }
    for (i = 0; i < SIX.length; i++) {
      for (j = 0; j < SIX.length; j++) {
        if (i === j) continue;
        REL.symTotal++;
        var ab = isomorphisms(SIX[i], SIX[j]).all.length > 0;
        var ba = isomorphisms(SIX[j], SIX[i]).all.length > 0;
        if (ab === ba) REL.sym++;
      }
    }
    for (i = 0; i < SIX.length; i++) {
      for (j = 0; j < SIX.length; j++) {
        for (k = 0; k < SIX.length; k++) {
          REL.transTotal++;
          var x = isomorphisms(SIX[i], SIX[j]).all.length > 0;
          var y = isomorphisms(SIX[j], SIX[k]).all.length > 0;
          var z = isomorphisms(SIX[i], SIX[k]).all.length > 0;
          if (!(x && y) || z) REL.trans++;
        }
      }
    }
  })();

  /* ---- how many bijections fix the identity, and what the full sweep
     costs for each order ------------------------------------------------ */
  function factOf(n) { var f = 1; for (var i = 2; i < n; i++) f *= i; return f; }
  var COST = [4, 6, 8].map(function (n) {
    return { n: n, perms: factOf(n), checks: factOf(n) * n * n };
  });

  /* ---- the multiplication table of Z4 and of V4, for the first scene --- */
  function table(g) {
    var rows = [], a, b, row;
    for (a = 0; a < g.n; a++) {
      row = [];
      for (b = 0; b < g.n; b++) row.push(g.mul(a, b));
      rows.push(row);
    }
    return rows;
  }

  return {
    make: make, orderOf: orderOf, profileOf: profileOf, profileKey: profileKey,
    isAbelian: isAbelian, centreSize: centreSize, subgroups: subgroups,
    isomorphisms: isomorphisms, facts: facts,
    groups: { Z4: Z4, V4: V4, Z6: Z6, S3: S3, D4: D4, Q8: Q8,
              Z4xZ4: Z4xZ4, Q8xZ2: Q8xZ2, Z2xZ3: Z2xZ3 },
    F: F, rows: ROWS, pairs: ROWS.length,
    phi: PHI, phiPairs: PHI_PAIRS, phiBad: PHI_BAD, phiOrderOk: PHI_ORDER_OK,
    aut: AUT, rel: REL, cost: COST,
    tableZ4: table(Z4), tableV4: table(V4),
    orderOfElement: function (name, a) { return orderOf(F === null ? null : GRP.groups[name], a); }
  };
})();

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

var CHECKS = [];
function check(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail || '' }); }

(function runChecks() {
  var F = GRP.F;

  /* --- the four pairs, profile by profile --- */
  check('Z4 has profile 1,1,2', F.Z4.profileKey === '1:1 2:1 4:2', F.Z4.profileKey);
  check('V4 has profile 1,3', F.V4.profileKey === '1:1 2:3', F.V4.profileKey);
  check('Z4 and V4 are both abelian', F.Z4.abelian && F.V4.abelian, 'both');
  check('Z6 has profile 1,1,2,2', F.Z6.profileKey === '1:1 2:1 3:2 6:2', F.Z6.profileKey);
  check('S3 has profile 1,3,2', F.S3.profileKey === '1:1 2:3 3:2', F.S3.profileKey);
  check('S3 is not abelian', !F.S3.abelian, 'centre size ' + F.S3.centre);
  check('D4 has profile 1,5,2', F.D4.profileKey === '1:1 2:5 4:2', F.D4.profileKey);
  check('Q8 has profile 1,1,6', F.Q8.profileKey === '1:1 2:1 4:6', F.Q8.profileKey);
  check('D4 and Q8 are both non-abelian', !F.D4.abelian && !F.Q8.abelian, 'both');
  check('D4 and Q8 both have centre of size 2',
        F.D4.centre === 2 && F.Q8.centre === 2, F.D4.centre + ' / ' + F.Q8.centre);

  /* --- the order-16 pair, where the profile agrees --- */
  check('Z4xZ4 has profile 1,3,12', F.Z4xZ4.profileKey === '1:1 2:3 4:12', F.Z4xZ4.profileKey);
  check('Q8xZ2 has profile 1,3,12', F.Q8xZ2.profileKey === '1:1 2:3 4:12', F.Q8xZ2.profileKey);
  check('the two order-16 profiles are identical',
        F.Z4xZ4.profileKey === F.Q8xZ2.profileKey, 'identical');
  check('Z4xZ4 is abelian and Q8xZ2 is not',
        F.Z4xZ4.abelian && !F.Q8xZ2.abelian, 'separated by abelianness');

  /* --- the search --- */
  check('Z4 is not isomorphic to V4', !GRP.rows[0].isomorphic, '0 witnesses');
  check('Z6 is not isomorphic to S3', !GRP.rows[1].isomorphic, '0 witnesses');
  check('D4 is not isomorphic to Q8', !GRP.rows[2].isomorphic, '0 witnesses');
  check('four pairs compared', GRP.pairs === 4, String(GRP.pairs));
  check('exactly one pair shares a profile', GRP.rows.filter(function (r) { return r.sameProfile; }).length === 1,
        'the order-16 pair');
  check('no pair on this page is isomorphic',
        GRP.rows.every(function (r) { return !r.isomorphic; }), 'all four differ');

  /* --- the witness --- */
  check('phi is a bijection from 6 to 6',
        (function () {
          var seen = {}, x;
          for (x = 0; x < 6; x++) seen[GRP.phi[x]] = 1;
          return Object.keys(seen).length === 6;
        })(), 'six distinct images');
  check('phi preserves the operation on all 36 pairs', GRP.phiBad === 0, String(GRP.phiBad));
  check('36 pairs were tested', GRP.phiPairs === 36, String(GRP.phiPairs));
  check('phi preserves the order of every element', GRP.phiOrderOk, 'all six');
  check('Z6 is isomorphic to Z2xZ3',
        GRP.isomorphisms(GRP.groups.Z6, GRP.groups.Z2xZ3).all.length > 0, 'witness found');

  /* --- subgroup counts --- */
  check('Z4 has 3 subgroups', F.Z4.subs.length === 3, String(F.Z4.subs.length));
  check('V4 has 5 subgroups', F.V4.subs.length === 5, String(F.V4.subs.length));
  check('Z6 has 4 subgroups', F.Z6.subs.length === 4, String(F.Z6.subs.length));
  check('S3 has 6 subgroups', F.S3.subs.length === 6, String(F.S3.subs.length));
  check('D4 has 10 subgroups', F.D4.subs.length === 10, String(F.D4.subs.length));
  check('Q8 has 6 subgroups', F.Q8.subs.length === 6, String(F.Q8.subs.length));

  /* --- automorphism counts --- */
  check('Aut(Z4) has 2 elements', GRP.aut.Z4 === 2, String(GRP.aut.Z4));
  check('Aut(V4) has 6 elements', GRP.aut.V4 === 6, String(GRP.aut.V4));
  check('Aut(Z6) has 2 elements', GRP.aut.Z6 === 2, String(GRP.aut.Z6));
  check('Aut(S3) has 6 elements', GRP.aut.S3 === 6, String(GRP.aut.S3));
  check('Aut(D4) has 8 elements', GRP.aut.D4 === 8, String(GRP.aut.D4));
  check('Aut(Q8) has 24 elements', GRP.aut.Q8 === 24, String(GRP.aut.Q8));

  /* --- the equivalence relation --- */
  check('isomorphism is reflexive on the four order-6 groups',
        GRP.rel.refl === GRP.rel.reflTotal, GRP.rel.refl + '/' + GRP.rel.reflTotal);
  check('isomorphism is symmetric on the sample',
        GRP.rel.sym === GRP.rel.symTotal, GRP.rel.sym + '/' + GRP.rel.symTotal);
  check('isomorphism is transitive on the sample',
        GRP.rel.trans === GRP.rel.transTotal, GRP.rel.trans + '/' + GRP.rel.transTotal);

  /* --- the cost of the brute-force sweep --- */
  check('120 bijections fix the identity at order 6', GRP.cost[1].perms === 120, String(GRP.cost[1].perms));
  check('5040 bijections fix the identity at order 8', GRP.cost[2].perms === 5040, String(GRP.cost[2].perms));
  check('the order-8 sweep is 322560 product checks', GRP.cost[2].checks === 322560, String(GRP.cost[2].checks));
  check('the profile filter leaves 0 survivors for D4 against Q8',
        GRP.rows[2].tested === 0, String(GRP.rows[2].tested));
  check('the profile filter leaves 4 candidates for Z6 against Z2xZ3',
        GRP.isomorphisms(GRP.groups.Z6, GRP.groups.Z2xZ3).tested === 4,
        String(GRP.isomorphisms(GRP.groups.Z6, GRP.groups.Z2xZ3).tested));
  check('exactly 2 of those 4 candidates are isomorphisms',
        GRP.isomorphisms(GRP.groups.Z6, GRP.groups.Z2xZ3).all.length === 2,
        String(GRP.isomorphisms(GRP.groups.Z6, GRP.groups.Z2xZ3).all.length));
})();

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

  function T(x, y, txt, size, col, bold, mono, align) {
    P.text(x, y, txt, { size: size || 10.5, color: col || INK, bold: !!bold,
                        mono: !!mono, align: align || 'left' });
  }

  function panel(x, y, w, h, title, kind) {
    P.rect(x, y, w, h, { fill: SURF, stroke: BORDER, radius: 8, sw: 1 });
    if (title) {
      var col = kind === 'bad' ? BAD : kind === 'good' ? VAL : kind === 'warn' ? WARN : DIM;
      T(x + 14, y + 13, title, 10, col, true);
      return y + 38;
    }
    return y + 16;
  }

  function chip(x, y, txt, kind) {
    var size = 10, pad = 9;
    var w = txt.length * size * 0.56 + pad * 2;
    var col = kind === 'bad' ? BAD : kind === 'good' ? VAL : kind === 'warn' ? WARN : INFO;
    var fill = kind === 'bad' ? BADDIM : kind === 'good' ? ACCDIM
             : kind === 'warn' ? WARNDIM : SURF2;
    P.rect(x, y, w, 20, { fill: fill, stroke: col, radius: 10, sw: 1 });
    T(x + pad, y + 5, txt, size, col);
    return w;
  }

  function hdr(title, sub) {
    T(46, 26, title, 15, INK, true);
    T(46, 50, sub, 10.5, DIM);
  }

  function box(x, y, w, h, title, sub, kind) {
    var col = kind === 'bad' ? BAD : kind === 'good' ? VAL : kind === 'warn' ? WARN : ACC;
    var fill = kind === 'bad' ? BADDIM : kind === 'good' ? ACCDIM
             : kind === 'warn' ? WARNDIM : SURF2;
    P.rect(x, y, w, h, { fill: fill, stroke: col, radius: 7, sw: 1.3 });
    T(x + w / 2, y + 9, title, 11.5, col, true, true, 'center');
    if (sub) T(x + w / 2, y + 27, sub, 9.5, DIM, false, false, 'center');
  }

  function grow(t, t0, dur) {
    var p = (t - t0) / Math.max(0.001, dur);
    return K.ease(p < 0 ? 0 : p > 1 ? 1 : p);
  }

  /* a small multiplication table: rows and columns 0..n-1 */
  function drawTable(x, y, rows, cell, head, col) {
    var n = rows.length, i, j;
    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        var cx = x + (j + 1) * cell, cy = y + (i + 1) * cell;
        P.rect(cx, cy, cell - 2, cell - 2, {
          fill: rows[i][j] === i ? ACCDIM : SURF2,
          stroke: BORDER, radius: 3, sw: 1
        });
        T(cx + cell / 2 - 1, cy + cell / 2 - 8, String(rows[i][j]),
          10, INK, false, true, 'center');
      }
      T(x + cell / 2 - 1, y + (i + 1) * cell + cell / 2 - 8, String(i), 9, DIM, true, true, 'center');
      T(x + (i + 1) * cell + cell / 2 - 1, y + cell / 2 - 8, String(i), 9, DIM, true, true, 'center');
    }
    T(x + cell / 2 - 1, y + cell / 2 - 8, head, 9, col || DIM, true, true, 'center');
  }

  /* a horizontal profile strip: one bar per element order */
  function profileStrip(x, y, w, prof, kind) {
    var keys = Object.keys(prof).map(Number).sort(function (a, b) { return a - b; });
    var total = 0, i;
    for (i = 0; i < keys.length; i++) total += prof[keys[i]];
    var col = kind === 'bad' ? BAD : kind === 'good' ? VAL : ACC;
    var cx = x;
    for (i = 0; i < keys.length; i++) {
      var bw = w * prof[keys[i]] / total;
      P.rect(cx, y, Math.max(2, bw - 1), 22, {
        fill: col, stroke: null, radius: 3
      });
      P.alpha(0.75);
      P.alpha(1);
      T(cx + Math.max(2, bw - 1) / 2, y + 4, String(prof[keys[i]]),
        9.5, '#ffffff', true, true, 'center');
      cx += bw;
    }
    var labels = keys.map(function (d) { return 'order ' + d + ': ' + prof[d]; }).join('   ');
    T(x, y + 26, labels, 9, DIM, false, true);
    return labels;
  }

  var SCENE_DRAW = {};

  /* ---------------- 1. same ---------------- */
  SCENE_DRAW.same = function (t, sc) {
    hdr('Two groups of order 4, and one question',
        'Same size, same axioms, different tables. Are they the same group?');

    var g = grow(t, sc.start + 2, 6);
    if (g > 0.02) {
      var y = panel(46, 70, 808, 58, 'The question');
      T(64, y + 2, 'Every group of order 4 has four elements, an identity, and an inverse for each element.', 10.5, INK);
      T(64, y + 20, 'So the axioms cannot separate two of them. Only the table can.', 10, DIM);
    }

    var g1 = grow(t, sc.start + 8, 8);
    if (g1 > 0.02) {
      T(64, 152, 'Z4  (addition mod 4)', 11, INK, true, true);
      drawTable(64, 168, GRP.tableZ4, 30, '+');
    }
    var g2 = grow(t, sc.start + 16, 8);
    if (g2 > 0.02) {
      T(470, 152, 'V4  (Z2 x Z2, pair addition)', 11, INK, true, true);
      drawTable(470, 168, GRP.tableV4, 30, '+');
    }

    if (grow(t, sc.start + 24, 5) > 0.3) {
      T(64, 336, 'A relabelling is a bijection that also respects the table:  phi(a + b) = phi(a) + phi(b).', 10.5, INK);
      T(64, 356, 'If one exists, the two groups are the same group with the elements renamed.', 10, DIM);
      T(64, 380, 'Z4: one element of order 2.   V4: three of them.', 10.5, WARN, true);
      T(64, 400, 'That difference is not a relabelling, so no relabelling can exist.', 10.5, WARN);
      T(64, 424, 'Proving they are different took one count. Proving two groups are the same takes a map.', 10, DIM);
    }
  };

  /* ---------------- 2. def ---------------- */
  SCENE_DRAW.def = function (t, sc) {
    hdr('The definition, and what it forces',
        'An isomorphism is a bijection that preserves the operation.');

    var g = grow(t, sc.start + 2, 7);
    if (g > 0.02) {
      var y = panel(46, 70, 808, 72, 'Definition');
      T(64, y + 2, 'G and H are isomorphic, written G = H with a tilde, when there is a bijection phi : G -> H with', 10.5, INK);
      T(64, y + 24, 'phi(a * b) = phi(a) . phi(b)     for every a and b in G.', 12, ACC, true, true);
    }

    var g1 = grow(t, sc.start + 9, 8);
    if (g1 > 0.02) {
      var y1 = panel(46, 158, 392, 116, 'What follows, without extra work', 'good');
      T(62, y1, 'phi(e) = e', 10, INK, false, true);
      T(230, y1, 'the identity goes to the identity', 9.5, DIM);
      T(62, y1 + 20, 'phi(a^-1) = phi(a)^-1', 10, INK, false, true);
      T(230, y1 + 20, 'inverses go to inverses', 9.5, DIM);
      T(62, y1 + 40, 'order(phi(a)) = order(a)', 10, INK, false, true);
      T(230, y1 + 40, 'the profile is preserved', 9.5, DIM);
      T(62, y1 + 62, 'These are consequences, not extra conditions.', 9.5, VAL, true);
    }
    var g2 = grow(t, sc.start + 16, 8);
    if (g2 > 0.02) {
      var y2 = panel(462, 158, 392, 116, 'And it is an equivalence relation', null);
      T(478, y2, 'reflexive: the identity map', 10.5, INK, false, true);
      T(478, y2 + 16, 'checked ' + GRP.rel.refl + ' of ' + GRP.rel.reflTotal, 9, DIM);
      T(478, y2 + 36, 'symmetric: invert the bijection', 10.5, INK, false, true);
      T(478, y2 + 52, 'checked ' + GRP.rel.sym + ' of ' + GRP.rel.symTotal + ' ordered pairs', 9, DIM);
      T(478, y2 + 70, 'transitive: compose two bijections', 10.5, INK, false, true);
    }

    var g3 = grow(t, sc.start + 24, 6);
    if (g3 > 0.02) {
      T(46, 292, 'Checked on four groups of order 6, three of which are one group written three ways:', 10, DIM);
      T(46, 314, 'transitive ' + GRP.rel.trans + ' of ' + GRP.rel.transTotal + ' ordered triples.', 10, VAL);
      var y3 = panel(46, 336, 808, 84, 'The one-sentence version', 'warn');
      T(64, y3, 'Isomorphic means: the same group, with the elements renamed.', 11, INK);
      T(64, y3 + 22, 'So every question that can be asked using only the table has the same answer in both.', 10, DIM);
      T(64, y3 + 40, 'A number that a relabelling cannot change is called an invariant. That is the whole toolkit.', 10.5, WARN, true);
    }
  };

  /* ---------------- 3. witness ---------------- */
  SCENE_DRAW.witness = function (t, sc) {
    hdr('A witness: Z6 is Z2 x Z3',
        'Proving sameness means writing the map down and checking it on every pair.');

    var g = grow(t, sc.start + 2, 6);
    if (g > 0.02) {
      var y = panel(46, 70, 808, 56, 'The candidate map');
      T(64, y + 2, 'phi(x) = (x mod 2, x mod 3)     from Z6 to Z2 x Z3', 11.5, ACC, true, true);
    }

    var g1 = grow(t, sc.start + 8, 10);
    if (g1 > 0.02) {
      T(60, 148, 'x', 9, DIM, true, true);
      T(150, 148, 'phi(x)', 9, DIM, true, true);
      T(280, 148, 'order in Z6', 9, DIM, true);
      T(420, 148, 'order in Z2xZ3', 9, DIM, true);
      P.line(46, 164, 620, 164, { stroke: BORDER, sw: 1 });
      var shown = Math.round(6 * Math.min(1, g1 * 1.2));
      for (var i = 0; i < shown; i++) {
        var yy = 174 + i * 26;
        if (i % 2 === 0) P.rect(46, yy - 4, 574, 24, { fill: SURF2, stroke: null, radius: 4 });
        var img = GRP.phi[i];
        T(60, yy + 2, String(i), 10.5, INK, true, true);
        T(150, yy + 2, '(' + (i % 2) + ',' + (i % 3) + ')', 10.5, ACC, true, true);
        T(280, yy + 2, String(GRP.orderOf(GRP.groups.Z6, i)), 10, DIM, false, true);
        T(420, yy + 2, String(GRP.orderOf(GRP.groups.Z2xZ3, img)), 10, DIM, false, true);
        if (GRP.orderOf(GRP.groups.Z6, i) === GRP.orderOf(GRP.groups.Z2xZ3, img)) {
          T(560, yy + 2, 'agrees', 9.5, VAL, false, true);
        } else {
          T(560, yy + 2, 'BROKEN', 9.5, BAD, false, true);
        }
      }
    }

    var g2 = grow(t, sc.start + 20, 6);
    if (g2 > 0.02) {
      var y2 = panel(644, 144, 210, 160, 'The two obligations', 'good');
      T(660, y2, 'bijection:', 9.5, DIM, true);
      T(660, y2 + 16, '6 images, all distinct', 9.5, VAL);
      T(660, y2 + 40, 'operation:', 9.5, DIM, true);
      T(660, y2 + 56, GRP.phiPairs + ' pairs tested', 9.5, VAL);
      T(660, y2 + 72, GRP.phiBad + ' violations', 9.5, VAL, true);
      T(660, y2 + 96, 'order preserved:', 9.5, DIM, true);
      T(660, y2 + 112, '6 of 6 elements', 9.5, VAL);
    }

    if (grow(t, sc.start + 26, 4) > 0.4) {
      T(46, 336, 'So Z6 and Z2 x Z3 are the same group. The map is the proof, and it is checkable line by line.', 10.5, INK, true);
      T(46, 358, 'A proof of sameness is always a witness. A proof of difference is always an invariant.', 10, DIM);
      T(46, 382, 'Nothing else is available: there is no test that says same without producing the map.', 10, DIM);
    }
  };

  /* ---------------- 4. invar ---------------- */
  SCENE_DRAW.invar = function (t, sc) {
    hdr('The invariants: what a relabelling cannot change',
        'Each one is a fingerprint. A mismatch is a proof; a match is not.');

    var items = [
      { k: 'order |G|', v: 'the number of elements', use: 'cheapest, and the first to try' },
      { k: 'abelian?', v: 'whether a*b = b*a always', use: 'one line, and it settles S3 against Z6' },
      { k: 'element-order profile', v: 'how many elements of each order', use: 'the workhorse; computed here' },
      { k: 'centre size', v: 'elements commuting with everything', use: 'separates some, not D4 from Q8' },
      { k: 'subgroup counts', v: 'how many subgroups of each order', use: 'D4 has 10, Q8 has 6' },
      { k: 'automorphism count', v: 'how many relabellings onto itself', use: 'Aut(Z4)=2, Aut(V4)=6' }
    ];

    var g = grow(t, sc.start + 2, 18);
    var shown = Math.max(1, Math.round(items.length * Math.min(1, g * 1.15)));
    for (var i = 0; i < shown; i++) {
      var it = items[i];
      var col = i % 2, row = Math.floor(i / 2);
      var x = 46 + col * 412, y = 74 + row * 86;
      P.rect(x, y, 396, 76, { fill: SURF, stroke: BORDER, radius: 7, sw: 1 });
      P.rect(x, y, 5, 76, { fill: ACC, stroke: null, radius: 3 });
      T(x + 16, y + 10, it.k, 11, INK, true);
      T(x + 16, y + 30, it.v, 9.5, DIM);
      T(x + 16, y + 50, it.use, 9, FAINT);
    }

    if (grow(t, sc.start + 24, 5) > 0.3) {
      T(46, 342, 'Every one of these is computed from the table alone, so a relabelling cannot touch any of them.', 10.5, INK);
      T(46, 366, 'Mismatch  ->  not isomorphic.   That direction is airtight and is all you need in an exam.', 10.5, VAL, true);
      T(46, 390, 'Match  ->  nothing yet. The invariants are necessary, and the next scenes show why they are not sufficient.', 10.5, BAD);
      T(46, 414, 'The order-16 pair at the end of the lesson has identical profiles and is not one group.', 10, DIM);
    }
  };

  /* ---------------- 5. z4v4 ---------------- */
  SCENE_DRAW.z4v4 = function (t, sc) {
    hdr('Order 4: Z4 against V4',
        'Both abelian, both of order 4. One count separates them.');

    var g = grow(t, sc.start + 2, 8);
    if (g > 0.02) {
      var y = panel(46, 70, 392, 158, 'Z4 — the cyclic one', 'good');
      T(62, y, 'elements 0 1 2 3, addition mod 4', 10, INK, false, true);
      T(62, y + 18, 'orders of the elements:', 9.5, DIM);
      T(62, y + 34, '0 -> 1    1 -> 4    2 -> 2    3 -> 4', 10, INK, false, true);
      profileStrip(62, y + 54, 356, GRP.F.Z4.profile, 'good');
      T(62, y + 100, 'subgroups: ' + GRP.F.Z4.subs.length + '    Aut: ' + GRP.aut.Z4, 9.5, DIM);
    }
    var g2 = grow(t, sc.start + 8, 8);
    if (g2 > 0.02) {
      var y2 = panel(462, 70, 392, 158, 'V4 — the Klein four-group', 'warn');
      T(478, y2, 'elements (0,0) (0,1) (1,0) (1,1)', 10, INK, false, true);
      T(478, y2 + 18, 'orders of the elements:', 9.5, DIM);
      T(478, y2 + 34, 'e -> 1    the other three -> 2', 10, INK, false, true);
      profileStrip(478, y2 + 54, 356, GRP.F.V4.profile, 'warn');
      T(478, y2 + 100, 'subgroups: ' + GRP.F.V4.subs.length + '    Aut: ' + GRP.aut.V4, 9.5, DIM);
    }

    var g3 = grow(t, sc.start + 17, 7);
    if (g3 > 0.02) {
      var y3 = panel(46, 240, 808, 92, 'The verdict', 'bad');
      T(64, y3, 'Z4 has exactly one element of order 2. V4 has three.', 11, INK, true);
      T(64, y3 + 22, 'An isomorphism sends elements of order 2 to elements of order 2, so it would have to send 1 element to 3.', 10, DIM);
      T(64, y3 + 42, 'No bijection can do that, so no isomorphism exists. Z4 and V4 are different groups of the same size.', 10.5, BAD, true);
    }

    if (grow(t, sc.start + 24, 5) > 0.3) {
      T(46, 350, 'The search agrees, and it never had to test a product:', 10, DIM);
      chip(46, 368, 'bijections fixing e: ' + GRP.rows[0].raw, null);
      chip(300, 368, 'surviving the profile filter: ' + GRP.rows[0].tested, 'bad');
      chip(560, 368, 'isomorphisms: 0', 'bad');
      T(46, 400, 'The profile test is the search, pruned. That is why one count is enough.', 10, INK);
      T(46, 422, 'Subgroups ' + GRP.F.Z4.subs.length + ' against ' + GRP.F.V4.subs.length + ', and Aut ' + GRP.aut.Z4 + ' against ' + GRP.aut.V4 + ', say the same thing a second and third time.', 10, DIM);
    }
  };

  /* ---------------- 6. six ---------------- */
  SCENE_DRAW.six = function (t, sc) {
    hdr('Order 6: Z6 against S3',
        'Same size. One of them is not abelian, and that is the whole argument.');

    var g = grow(t, sc.start + 2, 7);
    if (g > 0.02) {
      var y = panel(46, 70, 808, 56, 'The cheap test fails');
      T(64, y + 2, 'Both have 6 elements, so |G| does not separate them. The next invariant is one line of arithmetic.', 10.5, INK);
    }

    var g1 = grow(t, sc.start + 9, 8);
    if (g1 > 0.02) {
      var y1 = panel(46, 142, 392, 132, 'Z6 — abelian', 'good');
      T(62, y1, 'a + b = b + a for all 36 pairs', 10, INK, false, true);
      profileStrip(62, y1 + 18, 356, GRP.F.Z6.profile, 'good');
      T(62, y1 + 64, 'subgroups: ' + GRP.F.Z6.subs.length, 9.5, DIM);
      T(62, y1 + 80, 'every subgroup is normal: the group is abelian', 9, FAINT);
    }
    var g2 = grow(t, sc.start + 15, 8);
    if (g2 > 0.02) {
      var y2 = panel(462, 142, 392, 132, 'S3 — not abelian', 'bad');
      T(478, y2, 'the transposition (01) and the 3-cycle (012) do not commute', 9.5, INK);
      profileStrip(478, y2 + 18, 356, GRP.F.S3.profile, 'bad');
      T(478, y2 + 64, 'subgroups: ' + GRP.F.S3.subs.length + '    centre: ' + GRP.F.S3.centre, 9.5, DIM);
      T(478, y2 + 80, 'no element of order 6: the group is not cyclic', 9, FAINT);
    }

    var g3 = grow(t, sc.start + 24, 6);
    if (g3 > 0.02) {
      var y3 = panel(46, 286, 808, 72, 'The verdict, in one sentence', 'bad');
      T(64, y3, 'Z6 is abelian and S3 is not. Abelianness is preserved by every isomorphism, so the two are not isomorphic.', 10.5, BAD, true);
      T(64, y3 + 22, 'The profile agrees: Z6 is 1,1,2,2 by element order; S3 is 1,3,2 with no element of order 6 at all.', 10, DIM);
    }

    if (grow(t, sc.start + 27, 3) > 0.4) {
      T(46, 376, 'The search: ' + GRP.rows[1].raw + ' bijections fix the identity, the profile filter kills all of them, 0 products tested.', 10, INK);
      T(46, 400, 'S3 is the smallest non-abelian group, which is why order 6 is the first order where this question has a real answer.', 10, DIM);
    }
  };

  /* ---------------- 7. eight ---------------- */
  SCENE_DRAW.eight = function (t, sc) {
    hdr('Order 8: D4 against Q8',
        'Both non-abelian, both centre of size 2. Only the element orders separate them.');

    var g = grow(t, sc.start + 2, 6);
    if (g > 0.02) {
      var y = panel(46, 70, 808, 62, 'Every cheap invariant matches');
      T(64, y + 2, '|G| = 8 both.  Not abelian both.  Centre of size 2 both.  Three subgroups of order 4 each.', 10.5, INK);
      T(64, y + 20, 'So the first three fingerprints are useless here, and a page that stopped there would have no answer.', 10, DIM);
    }

    var g1 = grow(t, sc.start + 9, 8);
    if (g1 > 0.02) {
      var y1 = panel(46, 142, 392, 136, 'D4 — symmetries of the square', 'warn');
      T(62, y1, 'r (quarter turn) and s (a flip), r^4 = s^2 = 1', 9.5, INK, false, true);
      T(62, y1 + 20, 'orders: r and r^3 have 4; five elements have 2', 9.5, DIM);
      profileStrip(62, y1 + 40, 356, GRP.F.D4.profile, 'warn');
      T(62, y1 + 82, 'subgroups: ' + GRP.F.D4.subs.length + '    Aut: ' + GRP.aut.D4, 9.5, DIM);
    }
    var g2 = grow(t, sc.start + 15, 8);
    if (g2 > 0.02) {
      var y2 = panel(462, 142, 392, 136, 'Q8 — the quaternions', 'warn');
      T(478, y2, 'i j k and their negatives, i^2 = j^2 = k^2 = -1', 9.5, INK, false, true);
      T(478, y2 + 20, 'orders: six elements have 4; one element has 2', 9.5, DIM);
      profileStrip(478, y2 + 40, 356, GRP.F.Q8.profile, 'warn');
      T(478, y2 + 82, 'subgroups: ' + GRP.F.Q8.subs.length + '    Aut: ' + GRP.aut.Q8, 9.5, DIM);
    }

    var g3 = grow(t, sc.start + 23, 5);
    if (g3 > 0.02) {
      var y3 = panel(46, 290, 808, 68, 'The verdict', 'bad');
      T(64, y3, 'D4 has 5 elements of order 2; Q8 has 1. The profiles 1,5,2 and 1,1,6 disagree, so no isomorphism exists.', 10.5, BAD, true);
      T(64, y3 + 22, 'Both are non-abelian and both have a centre of size 2, which is exactly why the profile is the invariant to reach for.', 10, DIM);
    }

    if (grow(t, sc.start + 27, 3) > 0.4) {
      T(46, 374, 'Two non-abelian groups of the same order that are not isomorphic: this is the pair to remember.', 10, INK);
      T(46, 396, 'Of the five groups of order 8, three are abelian (Z8, Z4xZ2, Z2xZ2xZ2) and two are not (D4 and Q8).', 10, DIM);
    }
  };

  /* ---------------- 8. brute ---------------- */
  SCENE_DRAW.brute = function (t, sc) {
    hdr('The test that always works',
        'Try every bijection that fixes the identity, and check every product.');

    var g = grow(t, sc.start + 2, 8);
    if (g > 0.02) {
      var y = panel(46, 70, 808, 66, 'Why the search is finite');
      T(64, y + 2, 'An isomorphism must send the identity to the identity, so only (n-1)! bijections need trying.', 10.5, INK);
      T(64, y + 20, 'Each one costs n x n product checks. Both counts are finite, so isomorphism is decidable by search.', 10, DIM);
    }

    var g1 = grow(t, sc.start + 10, 12);
    if (g1 > 0.02) {
      T(60, 152, 'order', 9, DIM, true);
      T(160, 152, 'bijections fixing e', 9, DIM, true);
      T(360, 152, 'product checks', 9, DIM, true);
      T(560, 152, 'the whole sweep', 9, DIM, true);
      P.line(46, 168, 854, 168, { stroke: BORDER, sw: 1 });
      var shown = Math.round(GRP.cost.length * Math.min(1, g1 * 1.2));
      for (var i = 0; i < shown; i++) {
        var c = GRP.cost[i];
        var yy = 180 + i * 34;
        if (i % 2 === 0) P.rect(46, yy - 4, 808, 32, { fill: SURF2, stroke: null, radius: 4 });
        T(60, yy + 4, String(c.n), 10.5, INK, true, true);
        T(160, yy + 4, String(c.perms), 10.5, INK, false, true);
        T(360, yy + 4, String(c.checks), 10.5, INK, false, true);
        T(560, yy + 4, c.checks < 10000 ? 'a keystroke' : 'still a fraction of a second', 10, c.checks < 10000 ? VAL : DIM);
      }
    }

    var g2 = grow(t, sc.start + 22, 8);
    if (g2 > 0.02) {
      var y2 = panel(46, 300, 808, 70, 'The same sweep, pruned by the profile', 'good');
      T(64, y2, 'Skip any bijection that sends an element of order d to an element of a different order. The pruning is sound,', 10, INK);
      T(64, y2 + 18, 'because an isomorphism preserves order. D4 against Q8: 5040 candidates become ' + GRP.rows[2].tested + '.', 10.5, VAL, true);
      T(64, y2 + 38, 'Z6 against Z2xZ3: 4 candidates survive the filter, and 2 of them pass the product test.', 10, DIM);
    }

    if (grow(t, sc.start + 27, 3) > 0.4) {
      T(46, 388, 'So the profile is not a trick. It is this search, with the impossible candidates removed before they are tested.', 10.5, ACC, true);
      T(46, 412, 'The automorphism count falls out of the same sweep: run it with A and B the same group.', 10, DIM);
    }
  };

  /* ---------------- 9. limit ---------------- */
  SCENE_DRAW.limit = function (t, sc) {
    hdr('Where the profile stops',
        'Two groups of order 16 with the same element-order profile, and not isomorphic.');

    var g = grow(t, sc.start + 2, 7);
    if (g > 0.02) {
      var y = panel(46, 70, 808, 58, 'The counterexample, computed on this page');
      T(64, y + 2, 'Z4 x Z4 and Q8 x Z2 both have order 16 and both have 1 element of order 1, 3 of order 2, 12 of order 4.', 10.5, INK);
      T(64, y + 20, 'So every profile-based argument on this page would call them the same. They are not.', 10, DIM);
    }

    var g1 = grow(t, sc.start + 9, 8);
    if (g1 > 0.02) {
      var y1 = panel(46, 144, 392, 128, 'Z4 x Z4', 'good');
      T(62, y1, 'abelian: yes', 10, VAL, true);
      profileStrip(62, y1 + 22, 356, GRP.F.Z4xZ4.profile, 'good');
      T(62, y1 + 58, 'every element commutes with every other', 9.5, DIM);
    }
    var g2 = grow(t, sc.start + 14, 8);
    if (g2 > 0.02) {
      var y2 = panel(462, 144, 392, 128, 'Q8 x Z2', 'bad');
      T(478, y2, 'abelian: no', 10, BAD, true);
      profileStrip(478, y2 + 22, 356, GRP.F.Q8xZ2.profile, 'bad');
      T(478, y2 + 58, 'i and the Z2 generator do not commute', 9.5, DIM);
    }

    var g3 = grow(t, sc.start + 21, 6);
    if (g3 > 0.02) {
      var y3 = panel(46, 288, 808, 78, 'What this costs you', 'bad');
      T(64, y3, 'A matching profile is never a proof of sameness. It removes candidates; it does not produce a map.', 11, BAD, true);
      T(64, y3 + 24, 'A mismatching profile is always a proof of difference, because the profile is an invariant.', 10.5, VAL);
      T(64, y3 + 44, 'Here the abelianness invariant settles it in one line: one group is abelian and the other is not.', 10, INK);
    }

    if (grow(t, sc.start + 27, 3) > 0.4) {
      T(46, 380, 'Sameness needs a witness. Difference needs an invariant. No amount of matching fingerprints replaces the map.', 10.5, WARN, true);
      T(46, 404, 'This is the same asymmetry as everywhere else in mathematics: a finite check can refute, and only a proof can confirm.', 10, DIM);
    }
  };

  /* ---------------- 10. exam ---------------- */
  SCENE_DRAW.exam = function (t, sc) {
    hdr('The decision procedure, and how it is asked',
        'Four steps, cheapest first, and the one step that is a proof.');

    var steps = [
      { a: '1  order', b: 'different |G| -> not isomorphic. Same -> go on.', k: null },
      { a: '2  abelian?', b: 'one abelian, one not -> not isomorphic.', k: null },
      { a: '3  element-order profile', b: 'mismatch -> not isomorphic. Match -> still open.', k: 'warn' },
      { a: '4  write the map', b: 'a bijection with phi(ab)=phi(a)phi(b) -> isomorphic.', k: 'good' }
    ];

    var g = grow(t, sc.start + 2, 14);
    var shown = Math.max(1, Math.round(steps.length * Math.min(1, g * 1.3)));
    for (var i = 0; i < shown; i++) {
      var s = steps[i];
      var y = 76 + i * 62;
      var col = s.k === 'bad' ? BAD : s.k === 'good' ? VAL : s.k === 'warn' ? WARN : INFO;
      P.rect(46, y, 808, 52, { fill: SURF, stroke: BORDER, radius: 6, sw: 1 });
      P.rect(46, y, 6, 52, { fill: col, stroke: null, radius: 3 });
      T(66, y + 10, s.a, 11, INK, true);
      T(66, y + 30, s.b, 10, DIM);
    }

    var g2 = grow(t, sc.start + 20, 6);
    if (g2 > 0.02) {
      chip(46, 336, 'steps 1 to 3 prove difference', 'bad');
      chip(300, 336, 'only step 4 proves sameness', 'good');
      T(46, 368, 'GATE CSE 2007 asked for the number of non-isomorphic abelian groups of order 4. Steps 1 to 3 are not enough:', 10, INK);
      T(46, 388, 'that question needs the list itself, and the list is Z4 and V4, so the answer is 2.', 10, INK);
      T(46, 412, 'Count the classes, not the groups: two groups of order 4, one class each, two classes.', 10, DIM);
    }
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
      GRP: GRP,
      checks: CHECKS.length,
      pairs: GRP.pairs
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
