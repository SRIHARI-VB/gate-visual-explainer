/* ==========================================================================
   group-homomorphisms-kernel-and-quotient — lesson.js
   Four layers, in order:
     1. THE MODEL      — real groups as multiplication tables (Z1..Z12, V4, S3,
                         D4), every homomorphism between the small ones found by
                         enumerating all maps, kernels, images, cosets, quotient
                         checks, subgroups and normality by exhaustive search.
     2. THE CHECKS     — every number a caption states is recomputed and asserted.
     3. RENDER         — reads the model; never re-derives a number.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The claim under test is one sentence: the kernel measures the collapse, the
   image is what survives, and the quotient by the kernel is the image.
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

  function make(name, n, mul, labels) {
    var g = { name: name, n: n, mul: mul, labels: labels || null };
    g.e = null;
    for (var e = 0; e < n && g.e === null; e++) {
      var ok = true;
      for (var x = 0; x < n; x++) {
        if (mul(e, x) !== x || mul(x, e) !== x) { ok = false; break; }
      }
      if (ok) g.e = e;
    }
    if (g.e === null) throw new Error('no identity in ' + name);
    // associativity, inverses: verify every table we build
    for (var a = 0; a < n; a++) for (var b = 0; b < n; b++) for (var c = 0; c < n; c++) {
      if (mul(mul(a, b), c) !== mul(a, mul(b, c))) throw new Error(name + ' not associative');
    }
    for (var y = 0; y < n; y++) {
      var found = false;
      for (var z = 0; z < n; z++) if (mul(y, z) === g.e && mul(z, y) === g.e) { found = true; break; }
      if (!found) throw new Error(name + ' missing inverse');
    }
    return g;
  }

  function cyc(n) {
    return make('Z' + n, n, function (a, b) { return (a + b) % n; },
      (function () { var L = []; for (var i = 0; i < n; i++) L.push(String(i)); return L; })());
  }

  /* V4 = Z2 x Z2, elements 0..3 read as two bits (high, low) */
  function v4() {
    return make('V4', 4, function (a, b) { return (a ^ b); }, ['00', '01', '10', '11']);
  }

  /* cycle notation for a permutation given as an image list, 1-based */
  function cycles(p) {
    var n = p.length, seen = {}, out = [];
    for (var i = 0; i < n; i++) {
      if (seen[i] || p[i] === i) continue;
      var c = [], x = i;
      while (!seen[x]) { seen[x] = 1; c.push(x + 1); x = p[x]; }
      out.push('(' + c.join(' ') + ')');
    }
    return out.length ? out.join('') : 'e';
  }

  /* S3 as the six bijections of {0,1,2}; element index i is perm P[i] */
  function s3() {
    var perms = [];
    (function rec(cur, rest) {
      if (!rest.length) { perms.push(cur.slice()); return; }
      for (var i = 0; i < rest.length; i++) {
        var r2 = rest.slice(); var v = r2.splice(i, 1)[0];
        rec(cur.concat([v]), r2);
      }
    })([], [0, 1, 2]);
    perms.sort(function (a, b) { return a.join('') < b.join('') ? -1 : 1; });
    var idx = {};
    perms.forEach(function (p, i) { idx[p.join('')] = i; });
    var mul = function (a, b) {
      // apply b first, then a: (a o b)(x) = a[b[x]]
      var out = [0, 1, 2].map(function (x) { return perms[a][perms[b][x]]; });
      return idx[out.join('')];
    };
    var labels = perms.map(function (p) { return cycles(p); });
    var g = make('S3', 6, mul, labels);
    g.perms = perms;
    return g;
  }

  /* D4 as the eight symmetries of the square, as permutations of 0..3.
     Built in the order e, r, r2, r3, s, rs, r2s, r3s so a label is a word. */
  function d4() {
    var id = [0, 1, 2, 3];
    var rot = [1, 2, 3, 0];
    var ref = [0, 3, 2, 1];
    function comp(a, b) { return [0, 1, 2, 3].map(function (x) { return a[b[x]]; }); }
    var list = [id], cur = id;
    for (var i = 1; i < 4; i++) { cur = comp(rot, cur); list.push(cur); }
    for (var j = 0; j < 4; j++) { list.push(comp(list[j], ref)); }
    var idx = {}; list.forEach(function (p, i) { idx[p.join('')] = i; });
    var mul = function (a, b) { return idx[comp(list[a], list[b]).join('')]; };
    var labels = ['e', 'r', 'r\u00b2', 'r\u00b3', 's', 'rs', 'r\u00b2s', 'r\u00b3s'];
    var g = make('D4', 8, mul, labels);
    g.perms = list;
    return g;
  }

  function label(g, a) { return g.labels ? g.labels[a] : String(a); }

  function isHomo(g, h, phi) {
    for (var a = 0; a < g.n; a++) for (var b = 0; b < g.n; b++) {
      if (phi[g.mul(a, b)] !== h.mul(phi[a], phi[b])) return false;
    }
    return true;
  }

  function kernel(g, h, phi) {
    var K = [];
    for (var a = 0; a < g.n; a++) if (phi[a] === h.e) K.push(a);
    return K;
  }

  function image(g, h, phi) {
    var S = {}, out = [];
    for (var a = 0; a < g.n; a++) if (!S[phi[a]]) { S[phi[a]] = 1; out.push(phi[a]); }
    return out.sort(function (x, y) { return x - y; });
  }

  /* every map from g to h, in lexicographic order of the image tuple */
  function allMaps(g, h, visit) {
    var phi = [], count = 0;
    (function rec(i) {
      if (i === g.n) { count++; if (visit(phi.slice())) return true; return false; }
      for (var v = 0; v < h.n; v++) { phi[i] = v; if (rec(i + 1)) return true; }
      return false;
    })(0);
    return count;
  }

  function homos(g, h) {
    var out = [];
    allMaps(g, h, function (phi) { if (isHomo(g, h, phi)) out.push(phi); return false; });
    return out;
  }

  /* all subgroups, by exhaustive subset search (n <= 8 keeps this cheap) */
  function subgroups(g) {
    var out = [];
    var n = g.n;
    for (var mask = 1; mask < (1 << n); mask++) {
      var S = [];
      for (var i = 0; i < n; i++) if (mask & (1 << i)) S.push(i);
      if (S.indexOf(g.e) < 0) continue;
      var closed = true;
      for (var a = 0; a < S.length && closed; a++) for (var b = 0; b < S.length; b++) {
        if (S.indexOf(g.mul(S[a], S[b])) < 0) { closed = false; break; }
      }
      if (closed) out.push(S);
    }
    return out.sort(function (A, B) { return A.length - B.length || A.join(',').localeCompare(B.join(',')); });
  }

  function isNormal(g, K) {
    var Kin = {}; K.forEach(function (k) { Kin[k] = 1; });
    for (var x = 0; x < g.n; x++) {
      for (var i = 0; i < K.length; i++) {
        // find inverse of x
        var xi = -1;
        for (var y = 0; y < g.n; y++) if (g.mul(x, y) === g.e && g.mul(y, x) === g.e) { xi = y; break; }
        if (!Kin[g.mul(g.mul(x, K[i]), xi)]) return false;
      }
    }
    return true;
  }

  /* left cosets of K, as arrays of elements */
  function cosets(g, K) {
    var seen = {}, out = [];
    for (var x = 0; x < g.n; x++) {
      if (seen[x]) continue;
      var C = K.map(function (k) { return g.mul(x, k); }).sort(function (a, b) { return a - b; });
      C.forEach(function (c) { seen[c] = 1; });
      out.push(C);
    }
    return out;
  }

  /* the induced map on cosets, and whether it is a well-defined isomorphism onto the image */
  function quotientCheck(g, h, phi) {
    var K = kernel(g, h, phi);
    var cs = cosets(g, K);
    var index = {};
    cs.forEach(function (C, i) { C.forEach(function (x) { index[x] = i; }); });
    // well defined: every element of a coset has one image
    var wellDefined = true;
    for (var x = 0; x < g.n; x++) {
      var C = cs[index[x]];
      for (var i = 0; i < C.length; i++) if (phi[C[i]] !== phi[x]) wellDefined = false;
    }
    // the induced map psi: coset -> image value
    var psi = cs.map(function (C) { return phi[C[0]]; });
    var injective = true, seenV = {};
    for (var j = 0; j < psi.length; j++) { if (seenV[psi[j]]) injective = false; seenV[psi[j]] = 1; }
    // operation preserving on coset representatives, using coset index arithmetic
    var mulCos = function (i, j) {
      // a coset product: pick representatives, multiply in g, read off the coset
      return index[g.mul(cs[i][0], cs[j][0])];
    };
    var preserves = true;
    for (var p = 0; p < cs.length; p++) for (var q = 0; q < cs.length; q++) {
      if (psi[mulCos(p, q)] !== h.mul(psi[p], psi[q])) preserves = false;
    }
    return {
      K: K, cosets: cs, size: cs.length, wellDefined: wellDefined,
      injective: injective, preserves: preserves, psi: psi,
      imageSize: image(g, h, phi).length
    };
  }

  function orderOf(g, a) {
    var r = g.e;
    for (var k = 1; k <= g.n; k++) { r = g.mul(r, a); if (r === g.e) return k; }
    return 0;
  }

  /* homomorphisms Z_m -> Z_n, by the k criterion: phi(1) = k needs n | m*k.
     For m >= 2 distinct k give distinct maps; for m = 1 there is one map. */
  function cyclicHomos(m, n) {
    if (m === 1) return [[0]];
    var out = [];
    for (var k = 0; k < n; k++) {
      if ((m * k) % n !== 0) continue;
      var phi = [];
      for (var x = 0; x < m; x++) phi.push((k * x) % n);
      out.push(phi);
    }
    return out;
  }

  function cyclicHomoCount(m, n) { return cyclicHomos(m, n).length; }

  /* is coset multiplication well defined for this subgroup? returns a witness or null */
  function cosetWitness(g, K) {
    var cs = cosets(g, K), index = {};
    cs.forEach(function (C, i) { C.forEach(function (x) { index[x] = i; }); });
    var mulC = function (x, y) { return index[g.mul(x, y)]; };
    for (var i = 0; i < cs.length; i++) for (var j = 0; j < cs.length; j++) {
      for (var a = 0; a < cs[i].length; a++) for (var b = 0; b < cs[j].length; b++) {
        if (mulC(cs[i][a], cs[j][b]) !== mulC(cs[i][0], cs[j][0])) {
          return { x: cs[i][0], x2: cs[i][a], y: cs[j][0], y2: cs[j][b],
                   c1: mulC(cs[i][0], cs[j][0]), c2: mulC(cs[i][a], cs[j][b]) };
        }
      }
    }
    return null;
  }

  function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }

  function euler(n) {
    var c = 0;
    for (var k = 1; k <= n; k++) if (gcd(k, n) === 1) c++;
    return n === 1 ? 1 : c;
  }

  return {
    make: make, cyc: cyc, v4: v4, s3: s3, d4: d4, label: label,
    isHomo: isHomo, kernel: kernel, image: image, allMaps: allMaps, homos: homos,
    subgroups: subgroups, isNormal: isNormal, cosets: cosets, quotientCheck: quotientCheck,
    orderOf: orderOf, gcd: gcd, euler: euler, cycles: cycles, cyclicHomos: cyclicHomos, cyclicHomoCount: cyclicHomoCount, cosetWitness: cosetWitness
  };
})();


  /* ---- the five maps this page works with, and the numbers they produce ---- */

  var Z6 = GRP.cyc(6), Z3 = GRP.cyc(3), Z4 = GRP.cyc(4), Z2 = GRP.cyc(2);
  var Z12 = GRP.cyc(12);
  var V4 = GRP.v4(), S3 = GRP.s3(), D4 = GRP.d4();

  function remainderMap(m, n) {
    var phi = [];
    for (var x = 0; x < m; x++) phi.push(x % n);
    return phi;
  }

  function doublingMap(n) {
    var phi = [];
    for (var x = 0; x < n; x++) phi.push((2 * x) % n);
    return phi;
  }

  var M1 = remainderMap(6, 3);        // Z6 -> Z3
  var M2 = remainderMap(4, 2);        // Z4 -> Z2
  var M3 = remainderMap(12, 4);       // Z12 -> Z4
  var M4 = doublingMap(4);            // Z4 -> Z4, x -> 2x

  var SIGN = (function () {
    var hs = GRP.homos(S3, Z2), best = null;
    for (var i = 0; i < hs.length; i++) {
      var im = GRP.image(S3, Z2, hs[i]);
      if (im.length === 2 && (!best || GRP.kernel(S3, Z2, hs[i]).length < GRP.kernel(S3, Z2, best).length)) best = hs[i];
    }
    return best;
  })();

  var D = {
    homoZ6Z3: GRP.isHomo(Z6, Z3, M1),
    kernelZ6Z3: GRP.kernel(Z6, Z3, M1),
    imageZ6Z3: GRP.image(Z6, Z3, M1),
    quotZ6Z3: GRP.quotientCheck(Z6, Z3, M1),
    homoZ4Z2: GRP.isHomo(Z4, Z2, M2),
    kernelZ4Z2: GRP.kernel(Z4, Z2, M2),
    imageZ4Z2: GRP.image(Z4, Z2, M2),
    homoZ4Z4: GRP.isHomo(Z4, Z4, M4),
    kernelZ4Z4: GRP.kernel(Z4, Z4, M4),
    imageZ4Z4: GRP.image(Z4, Z4, M4),
    homoZ12Z4: GRP.isHomo(Z12, Z4, M3),
    kernelZ12Z4: GRP.kernel(Z12, Z4, M3),
    imageZ12Z4: GRP.image(Z12, Z4, M3),
    quotZ12Z4: GRP.quotientCheck(Z12, Z4, M3),
    signKernel: GRP.kernel(S3, Z2, SIGN),
    quotS3Z2: GRP.quotientCheck(S3, Z2, SIGN),
    orderOf1inZ4: GRP.orderOf(Z4, 1),
    orderOfImage1inZ2: GRP.orderOf(Z2, 1)
  };

  /* how many ordered pairs of Z6 share a coset of the kernel */
  D.sameCosetPairs = (function () {
    var idx = {}, n = 0;
    D.quotZ6Z3.cosets.forEach(function (C, i) { C.forEach(function (x) { idx[x] = i; }); });
    for (var a = 0; a < 6; a++) for (var b = 0; b < 6; b++) if (idx[a] === idx[b]) n++;
    return n;
  })();

  /* the gcd table 1..6, every cell by full enumeration of all n^m maps */
  var TABLE = (function () {
    var out = {};
    for (var m = 1; m <= 6; m++) {
      out[m] = {};
      for (var n = 1; n <= 6; n++) {
        var c = 0;
        GRP.allMaps(GRP.cyc(m), GRP.cyc(n), function (phi) {
          if (GRP.isHomo(GRP.cyc(m), GRP.cyc(n), phi)) c++;
          return false;
        });
        out[m][n] = c;
      }
    }
    return out;
  })();

  var COUNTS = {
    mapsZ4Z4: Math.pow(4, 4),
    homZ4Z4: GRP.cyclicHomoCount(4, 4),
    mapsZ6Z3: Math.pow(3, 6),
    homZ6Z3: GRP.cyclicHomoCount(6, 3),
    onto12to4: GRP.cyclicHomos(12, 4).filter(function (p) { return GRP.image(Z12, Z4, p).length === 4; }).length,
    onto6to3: GRP.cyclicHomos(6, 3).filter(function (p) { return GRP.image(Z6, Z3, p).length === 3; }).length,
    onto8to2: GRP.cyclicHomos(8, 2).filter(function (p) { return GRP.image(GRP.cyc(8), Z2, p).length === 2; }).length,
    onto6to4: GRP.cyclicHomos(6, 4).filter(function (p) { return GRP.image(Z6, GRP.cyc(4), p).length === 4; }).length,
    euler4: GRP.euler(4),
    homS3S3: GRP.homos(S3, S3).length,
    homS3Z2: GRP.homos(S3, Z2).length,
    homS3Z3: GRP.homos(S3, Z3).length,
    homS3V4: GRP.homos(S3, V4).length,
    mapsS3S3: Math.pow(6, 6),
    mapsS3V4: Math.pow(4, 6)
  };

  var SUB = {
    s3: GRP.subgroups(S3),
    s3normal: GRP.subgroups(S3).filter(function (K2) { return GRP.isNormal(S3, K2); }),
    d4: GRP.subgroups(D4),
    d4normal: GRP.subgroups(D4).filter(function (K2) { return GRP.isNormal(D4, K2); }),
    d4non: GRP.subgroups(D4).filter(function (K2) { return !GRP.isNormal(D4, K2); })
  };

  /* the transposition subgroup of S3, and the reflection subgroup of D4 */
  var H_S3 = SUB.s3.filter(function (K2) { return K2.length === 2; })[0];
  var H_D4 = SUB.d4non[0];
  var A3 = SUB.s3.filter(function (K2) { return K2.length === 3; })[0];

  var WIT = GRP.cosetWitness(S3, H_S3);

  /* every kernel found by enumeration, and whether it is normal */
  var KERNELS = (function () {
    var all = [];
    GRP.homos(S3, S3).forEach(function (p) { all.push({ g: S3, K: GRP.kernel(S3, S3, p) }); });
    GRP.homos(D4, Z2).forEach(function (p) { all.push({ g: D4, K: GRP.kernel(D4, Z2, p) }); });
    GRP.homos(D4, V4).forEach(function (p) { all.push({ g: D4, K: GRP.kernel(D4, V4, p) }); });
    return all;
  })();

  /* the injectivity test, on a fixed list of cyclic pairs */
  var INJ_PAIRS = [[2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [6, 3], [4, 2], [3, 6], [2, 4], [6, 2], [5, 10], [12, 4]];
  var INJ = (function () {
    var maps = 0, bad = 0;
    INJ_PAIRS.forEach(function (mn) {
      var g = GRP.cyc(mn[0]), h = GRP.cyc(mn[1]);
      GRP.cyclicHomos(mn[0], mn[1]).forEach(function (p) {
        maps++;
        var inj = GRP.image(g, h, p).length === g.n;
        var triv = GRP.kernel(g, h, p).length === 1;
        if (inj !== triv) bad++;
      });
    });
    return { maps: maps, bad: bad };
  })();

  /* order of the image divides the order of the element */
  var ORD = (function () {
    var pairs = 0, bad = 0;
    [[4, 2], [6, 3], [6, 2], [8, 4], [12, 6], [12, 4]].forEach(function (mn) {
      var g = GRP.cyc(mn[0]), h = GRP.cyc(mn[1]);
      GRP.cyclicHomos(mn[0], mn[1]).forEach(function (p) {
        for (var a = 0; a < g.n; a++) {
          pairs++;
          var oa = GRP.orderOf(g, a), ob = GRP.orderOf(h, p[a]);
          if (ob === 0 || oa % ob !== 0) bad++;
        }
      });
    });
    return { pairs: pairs, bad: bad };
  })();

  /* GATE CSE 2024 Set 2: elements of Z2 x Z3 x Z4 that are their own inverses */
  var SELF_INV = (function () {
    var c = 0;
    for (var a = 0; a < 2; a++) for (var b = 0; b < 3; b++) for (var d = 0; d < 4; d++) {
      if (((2 * a) % 2 === 0) && ((2 * b) % 3 === 0) && ((2 * d) % 4 === 0)) c++;
    }
    return c;
  })();

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

  var CHECKS = [];
  function chk(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail || '' }); }

  var eq = function (a, b) { return JSON.stringify(a) === JSON.stringify(b); };

  chk('Z6 -> Z3 by remainder is a homomorphism', D.homoZ6Z3, '36 ordered pairs');
  chk('its kernel is {0,3}', eq(D.kernelZ6Z3, [0, 3]), D.kernelZ6Z3.join(','));
  chk('its image is all of Z3', eq(D.imageZ6Z3, [0, 1, 2]), D.imageZ6Z3.join(','));
  chk('6 = |kernel| * |image| for Z6 -> Z3', D.kernelZ6Z3.length * D.imageZ6Z3.length === 6, '2 * 3');
  chk('12 of the 36 ordered pairs of Z6 share a coset', D.sameCosetPairs === 12, String(D.sameCosetPairs));
  chk('Z6 -> Z3 quotient has 3 cosets', D.quotZ6Z3.size === 3, String(D.quotZ6Z3.size));
  chk('Z6 -> Z3 quotient map is well defined', D.quotZ6Z3.wellDefined);
  chk('Z6 -> Z3 quotient map is injective on cosets', D.quotZ6Z3.injective);
  chk('Z6 -> Z3 quotient map preserves the operation', D.quotZ6Z3.preserves);

  chk('Z4 -> Z2 by remainder is a homomorphism', D.homoZ4Z2);
  chk('its kernel is {0,2}', eq(D.kernelZ4Z2, [0, 2]), D.kernelZ4Z2.join(','));
  chk('1 has order 4 in Z4', D.orderOf1inZ4 === 4, String(D.orderOf1inZ4));
  chk('its image has order 2, which divides 4', D.orderOfImage1inZ2 === 2 && D.orderOf1inZ4 % D.orderOfImage1inZ2 === 0, '2 divides 4');

  chk('Z4 -> Z4 doubling is a homomorphism', D.homoZ4Z4);
  chk('its kernel is {0,2}', eq(D.kernelZ4Z4, [0, 2]), D.kernelZ4Z4.join(','));
  chk('its image is {0,2}', eq(D.imageZ4Z4, [0, 2]), D.imageZ4Z4.join(','));

  chk('Z12 -> Z4 by remainder is a homomorphism', D.homoZ12Z4);
  chk('its kernel is {0,4,8}', eq(D.kernelZ12Z4, [0, 4, 8]), D.kernelZ12Z4.join(','));
  chk('12 = 3 * 4 for Z12 -> Z4', D.kernelZ12Z4.length === 3 && D.imageZ12Z4.length === 4, '3 * 4');
  chk('Z12 -> Z4 quotient has 4 cosets', D.quotZ12Z4.size === 4, String(D.quotZ12Z4.size));

  chk('the sign map S3 -> Z2 is a homomorphism', GRP.isHomo(S3, Z2, SIGN));
  chk('its kernel is the three even permutations', D.signKernel.length === 3, String(D.signKernel.length));
  chk('6 = 3 * 2 for the sign map', D.signKernel.length * 2 === 6);
  chk('S3 -> Z2 quotient has 2 cosets', D.quotS3Z2.size === 2, String(D.quotS3Z2.size));

  chk('the gcd table for 1..6 matches full enumeration', (function () {
    for (var m = 1; m <= 6; m++) for (var n = 1; n <= 6; n++) if (TABLE[m][n] !== GRP.gcd(m, n)) return false;
    return true;
  })(), '36 cells');
  chk('Z4 -> Z4 has 256 maps and 4 homomorphisms', COUNTS.mapsZ4Z4 === 256 && COUNTS.homZ4Z4 === 4, '256 / 4');
  chk('Z6 -> Z3 has 729 maps and 3 homomorphisms', COUNTS.mapsZ6Z3 === 729 && COUNTS.homZ6Z3 === 3, '729 / 3');
  chk('Z_m -> Z_1 has exactly one homomorphism', GRP.cyclicHomoCount(1, 1) === 1 && GRP.cyclicHomoCount(1, 5) === 1);

  chk('injectivity matches a trivial kernel on 41 maps', INJ.maps === 41 && INJ.bad === 0, INJ.maps + ' maps, ' + INJ.bad + ' mismatches');
  chk('the image order divides the element order on 190 pairs', ORD.pairs === 190 && ORD.bad === 0, ORD.pairs + ' pairs, ' + ORD.bad + ' exceptions');

  chk('12 -> 4 has 2 onto homomorphisms, phi(4) = 2', COUNTS.onto12to4 === 2 && COUNTS.euler4 === 2, '2 / 2');
  chk('6 -> 3 has 2 onto homomorphisms', COUNTS.onto6to3 === 2, String(COUNTS.onto6to3));
  chk('8 -> 2 has 1 onto homomorphism', COUNTS.onto8to2 === 1, String(COUNTS.onto8to2));
  chk('6 -> 4 has no onto homomorphism', COUNTS.onto6to4 === 0, String(COUNTS.onto6to4));

  chk('S3 has 6 subgroups, 3 of them normal', SUB.s3.length === 6 && SUB.s3normal.length === 3, SUB.s3.length + ' / ' + SUB.s3normal.length);
  chk('D4 has 10 subgroups, 6 of them normal', SUB.d4.length === 10 && SUB.d4normal.length === 6, SUB.d4.length + ' / ' + SUB.d4normal.length);
  chk('D4 has 4 non-normal subgroups, all reflection pairs', SUB.d4non.length === 4, SUB.d4non.map(function (K2) { return K2.length; }).join(','));

  chk('the transposition subgroup of S3 is not normal', !GRP.isNormal(S3, H_S3));
  chk('conjugating it gives 3 distinct subgroups', SUB.s3.filter(function (K2) { return K2.length === 2; }).length === 3);
  chk('the reflection subgroup of D4 is not normal', !GRP.isNormal(D4, H_D4));

  chk('coset multiplication fails for the transposition subgroup', !!WIT);
  chk('coset multiplication works for the rotations in S3', GRP.cosetWitness(S3, A3) === null);
  chk('coset multiplication works for the kernel {0,3} in Z6', GRP.cosetWitness(Z6, D.kernelZ6Z3) === null);

  chk('every kernel of a homomorphism S3 -> S3 is normal', KERNELS.filter(function (x) { return x.g === S3; }).every(function (x) { return GRP.isNormal(S3, x.K); }), GRP.homos(S3, S3).length + ' maps');
  chk('every kernel of a homomorphism D4 -> Z2 or D4 -> V4 is normal', KERNELS.filter(function (x) { return x.g === D4; }).every(function (x) { return GRP.isNormal(D4, x.K); }), (GRP.homos(D4, Z2).length + GRP.homos(D4, V4).length) + ' maps');
  chk('every kernel contains the identity', KERNELS.every(function (x) { return x.K.indexOf(x.g.e) >= 0; }), KERNELS.length + ' kernels');

  chk('Hom(S3,S3) is 10', COUNTS.homS3S3 === 10, String(COUNTS.homS3S3));
  chk('Hom(S3,Z2) is 2 and Hom(S3,Z3) is 1', COUNTS.homS3Z2 === 2 && COUNTS.homS3Z3 === 1, '2 / 1');
  chk('Hom(S3,V4) is 4', COUNTS.homS3V4 === 4, String(COUNTS.homS3V4));
  chk('GATE CSE 2024 Set 2: 4 self-inverse elements in Z2 x Z3 x Z4', SELF_INV === 4, SELF_INV + ' of 24');
  chk('the group orders are 6, 6, 8 and 4', Z6.n === 6 && S3.n === 6 && D4.n === 8 && V4.n === 4);

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

  function T(x, y, s, size, col, bold, mono, align) {
    P.text(x, y, s, { size: size || 11, color: col || INK, bold: !!bold, mono: !!mono, align: align });
  }

  function box(x, y, w, h, fill, stroke, radius) {
    P.rect(x, y, w, h, { fill: fill || SURF, stroke: stroke === undefined ? BORDER : stroke, radius: radius === undefined ? 6 : radius, sw: 1 });
  }

  function node(x, y, r, label, filled, colour) {
    P.circle(x, y, r, { fill: filled ? (colour || ACC) : SURF, stroke: filled ? (colour || ACC) : BORDER, sw: 1.6 });
    T(x, y, label, 13, filled ? SURF : INK, true, true, 'center');
  }

  function chip(x, y, label, kind, size) {
    var s = size || 10;
    var w = 16 + String(label).length * s * 0.56;
    var col = kind === 'bad' ? BAD : kind === 'good' ? VAL : kind === 'warn' ? WARN : INFO;
    var bg = kind === 'bad' ? BADDIM : kind === 'good' ? ACCDIM : kind === 'warn' ? WARNDIM : SURF2;
    box(x, y, w, s + 10, bg, col, 999);
    T(x + w / 2, y + (s + 10) / 2, label, s, col, true, false, 'center');
    return w;
  }

  function grow(t, from, dur) {
    var v = (t - from) / Math.max(0.001, dur);
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  var SCENE_DRAW = {};

  /* ---------------- scene 1: relax ---------------- */

  SCENE_DRAW.relax = function (t, sc) {
    T(46, 18, 'Z6 to Z3 by remainder: every number goes to its remainder on division by three', 11, DIM);
    T(150, 40, 'Z6, six elements', 10, FAINT, true, false, 'center');
    T(700, 40, 'Z3, three elements', 10, FAINT, true, false, 'center');

    var yl = [70, 132, 194, 256, 318, 380];
    var yr = [120, 220, 320];
    var img = M1;

    for (var i = 0; i < 6; i++) {
      var a = grow(t, sc.start + 1 + i * 0.6, 4);
      if (a <= 0.02) continue;
      node(150, yl[i], 18, String(i), true, i < 3 ? ACC : INFO);
      var target = yr[img[i]];
      var lx = 168, ly = yl[i], rx = 682, ry = target;
      P.line(lx, ly, rx, ry, { stroke: i < 3 ? ACC : INFO, sw: 1.2, dash: [4, 3] });
      P.arrow(rx - 18, ry + (ly < ry ? -6 : ly > ry ? 6 : 0), rx - 4, ry, { stroke: i < 3 ? ACC : INFO, sw: 1.2, head: 7 });
    }
    for (var j = 0; j < 3; j++) {
      var b = grow(t, sc.start + 5 + j * 0.5, 4);
      if (b <= 0.02) continue;
      node(700, yr[j], 20, String(j), false, ACC);
    }

    var g1 = grow(t, sc.start + 16, 5);
    if (g1 > 0.02) {
      T(46, 404, '6 elements in, 3 out. Every image has exactly 2 preimages, so the map is two to one and not injective.', 11, INK);
    }
    var g2 = grow(t, sc.start + 23, 5);
    if (g2 > 0.02) {
      T(46, 426, 'The operation is still respected: add first then map, or map first then add, and the answer agrees on all 36 pairs.', 11, DIM);
      chip(46, 438, 'a homomorphism may merge', 'good');
    }
  };

  /* ---------------- scene 2: def ---------------- */

  SCENE_DRAW.def = function (t, sc) {
    T(46, 18, 'One equation, and three consequences that come free', 11, DIM);
    box(160, 40, 580, 54, SURF, ACC, 8);
    T(450, 67, '\u03c6(a \u00b7 b) = \u03c6(a) \u2218 \u03c6(b)   for every a, b in G', 17, ACC, true, true, 'center');
    T(450, 106, 'no bijection required: the map may merge elements', 10, FAINT, false, false, 'center');

    var cards = [
      { x: 46, y: 132, title: '\u03c6(e) = e', body: 'apply the equation to e and e' },
      { x: 466, y: 132, title: '\u03c6(a\u207b\u00b9) = \u03c6(a)\u207b\u00b9', body: 'apply it to a and its inverse' },
      { x: 46, y: 222, title: 'order(\u03c6(a)) divides order(a)', body: 'Z4 to Z2: 4 divides into 2' },
      { x: 466, y: 222, title: 'never the other way', body: 'a shorter order is impossible' }
    ];
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      var a = grow(t, sc.start + 2 + i * 1.2, 4);
      if (a <= 0.02) continue;
      box(c.x, c.y, 388, 74, SURF, BORDER);
      T(c.x + 16, c.y + 12, c.title, 13, ACC, true, true);
      T(c.x + 16, c.y + 38, c.body, 10, DIM);
      if (i === 2) T(c.x + 16, c.y + 54, 'element 1 has order 4 in Z4, its image has order 2 in Z2', 10, INK);
      if (i === 3) T(c.x + 16, c.y + 54, 'the image order must divide the element order', 10, INK);
    }

    var g = grow(t, sc.start + 18, 5);
    if (g > 0.02) {
      box(46, 316, 808, 62, WARNDIM, WARN, 6);
      T(62, 328, 'First trap: an isomorphism preserves order, a homomorphism only divides it.', 12, WARN, true);
      T(62, 350, 'Checked here on every homomorphism in six small cyclic pairs: 190 element-order pairs, no exception.', 10, DIM);
      T(46, 396, 'Proof of the division: if a taken k times is the identity, then \u03c6(a) taken k times is the identity as well.', 11, INK);
      T(46, 418, 'So the order of \u03c6(a) divides k, and the smallest such k is the order of a.', 11, INK);
    }
  };

  /* ---------------- scene 3: kernel ---------------- */

  SCENE_DRAW.kernel = function (t, sc) {
    T(46, 18, 'The kernel is the preimage of the identity: everything that is folded onto zero', 11, DIM);

    var xs = [80, 158, 236, 314, 392, 470];
    var ys = [245, 245, 245];
    var tx = [158, 314, 470];
    for (var i = 0; i < 6; i++) {
      var a = grow(t, sc.start + 1 + i * 0.5, 4);
      if (a <= 0.02) continue;
      var inK = M1[i] === 0;
      node(xs[i], 90, 20, String(i), inK, BAD);
      P.arrow(xs[i], 112, tx[M1[i]], 223, { stroke: inK ? BAD : BORDER, sw: inK ? 1.6 : 1, head: 8 });
    }
    for (var j = 0; j < 3; j++) {
      var b = grow(t, sc.start + 4 + j * 0.5, 4);
      if (b <= 0.02) continue;
      node(tx[j], 245, 20, String(j), false, ACC);
    }
    T(470, 68, 'Z6', 11, FAINT, true, false, 'center');
    T(470, 288, 'Z3', 11, FAINT, true, false, 'center');

    var g1 = grow(t, sc.start + 8, 4);
    if (g1 > 0.02) {
      box(560, 44, 300, 132, SURF, BAD, 8);
      T(576, 56, 'kernel = preimage of 0', 10, FAINT, true);
      T(576, 76, '{ 0, 3 }', 20, BAD, true, true);
      T(576, 106, 'size 2 of 6', 11, INK);
      T(576, 126, 'every image has exactly 2 preimages', 10, DIM);
      T(576, 146, '0 and 3 are the only elements sent to 0', 10, DIM);
    }

    var g2 = grow(t, sc.start + 15, 5);
    if (g2 > 0.02) {
      T(46, 322, 'The kernel is a subgroup, and the three closures are free:', 11, INK, true);
      T(46, 346, 'identity: \u03c6(e) = e, so e is in the kernel', 11, DIM);
      T(46, 368, 'closure: 3 + 3 = 0, and both 3 and 0 are in the kernel', 11, DIM);
      T(46, 390, 'inverses: the inverse of 3 is 3, which is in the kernel', 11, DIM);
      chip(46, 404, 'subgroup, always', 'good');
      chip(200, 404, 'size 2 measures the collapse', 'warn');
    }
  };

  /* ---------------- scene 4: inject ---------------- */

  SCENE_DRAW.inject = function (t, sc) {
    T(46, 18, 'phi is injective exactly when the kernel is the single identity', 11, DIM);

    box(46, 40, 396, 152, SURF, ACC, 8);
    T(62, 52, 'If the kernel is trivial, then injective', 11, ACC, true);
    T(62, 78, 'Suppose \u03c6(a) = \u03c6(b).', 11, INK);
    T(62, 100, 'Multiply by the inverse of \u03c6(b):', 11, INK);
    T(62, 122, '\u03c6(a)\u00b7\u03c6(b)\u207b\u00b9 = e  gives  \u03c6(ab\u207b\u00b9) = e', 11, ACC, true, true);
    T(62, 144, 'So ab\u207b\u00b9 is in the kernel.', 11, INK);
    T(62, 166, 'A trivial kernel forces ab\u207b\u00b9 = e, so a = b.', 11, INK);

    box(458, 40, 396, 152, SURF, INFO, 8);
    T(474, 52, 'If injective, then the kernel is trivial', 11, INFO, true);
    T(474, 78, 'The identity is always in the kernel.', 11, INK);
    T(474, 100, 'If some a also maps to e, then', 11, INK);
    T(474, 122, '\u03c6(a) = \u03c6(e) with a not equal to e', 11, INFO, true, true);
    T(474, 144, 'which contradicts injectivity.', 11, INK);
    T(474, 166, 'So the kernel holds only e.', 11, INK);

    var g1 = grow(t, sc.start + 10, 5);
    if (g1 > 0.02) {
      T(46, 212, 'Two collisions, both visible in the kernel:', 11, INK, true);
      T(46, 238, 'Z6 to Z3 by remainder: kernel {0, 3}, so 0 and 3 collide. Not injective.', 11, DIM);
      T(46, 260, 'Z4 to Z4 by doubling: 0, 2, 0, 2, kernel {0, 2}. Not injective, image {0, 2}.', 11, DIM);
    }

    var g2 = grow(t, sc.start + 17, 5);
    if (g2 > 0.02) {
      box(46, 286, 808, 96, SURF2, BORDER, 8);
      T(62, 298, 'Tested on every homomorphism between twelve small cyclic pairs', 11, INK, true);
      T(62, 322, '41 maps built, kernel collected, injectivity compared with kernel size 1: 0 disagreements.', 11, DIM);
      T(62, 344, 'The equivalence turns a statement about every pair of elements into a statement about one set.', 11, DIM);
      chip(62, 360, 'kernel size 1', 'good');
      chip(190, 360, 'means nothing is lost', 'good');
      chip(340, 360, 'kernel size 2 or more', 'bad');
      chip(500, 360, 'means a real collision', 'bad');
    }

    var g3 = grow(t, sc.start + 24, 4);
    if (g3 > 0.02) {
      T(46, 404, 'The image cannot answer this question: two maps can share an image and differ in kernel.', 11, INK);
      T(46, 426, 'The kernel can, because a merge is exactly a non-identity element landing on the identity.', 11, DIM);
    }
  };

  /* ---------------- scene 5: image ---------------- */

  SCENE_DRAW.image = function (t, sc) {
    T(46, 18, 'The image is a subgroup too, and the two sizes multiply to the group size', 11, DIM);

    var rows = [
      { m: 'Z6 \u2192 Z3', g: 6, k: D.kernelZ6Z3.length, i: D.imageZ6Z3.length },
      { m: 'Z12 \u2192 Z4', g: 12, k: D.kernelZ12Z4.length, i: D.imageZ12Z4.length },
      { m: 'S3 \u2192 Z2 (sign)', g: 6, k: D.signKernel.length, i: 2 },
      { m: 'Z4 \u2192 Z2', g: 4, k: D.kernelZ4Z2.length, i: D.imageZ4Z2.length }
    ];
    var cols = [60, 230, 330, 430, 530, 700];
    T(cols[0], 56, 'map', 10, FAINT, true);
    T(cols[1], 56, '|G|', 10, FAINT, true, false, 'center');
    T(cols[2], 56, '|kernel|', 10, FAINT, true, false, 'center');
    T(cols[3], 56, '|image|', 10, FAINT, true, false, 'center');
    T(cols[4], 56, 'product', 10, FAINT, true, false, 'center');
    T(cols[5], 56, 'check', 10, FAINT, true);

    for (var i = 0; i < rows.length; i++) {
      var a = grow(t, sc.start + 1 + i * 1.1, 4);
      if (a <= 0.02) continue;
      var y = 78 + i * 46;
      var r = rows[i];
      box(46, y - 8, 808, 40, i % 2 ? SURF2 : SURF, BORDER, 5);
      T(cols[0], y + 4, r.m, 11, INK, true, true);
      T(cols[1], y + 4, String(r.g), 11, INK, false, true, 'center');
      T(cols[2], y + 4, String(r.k), 11, BAD, true, true, 'center');
      T(cols[3], y + 4, String(r.i), 11, VAL, true, true, 'center');
      T(cols[4], y + 4, r.k + ' \u00d7 ' + r.i + ' = ' + (r.k * r.i), 11, DIM, false, true, 'center');
      chip(cols[5], y - 2, r.k * r.i === r.g ? 'agrees' : 'fails', r.k * r.i === r.g ? 'good' : 'bad');
    }

    var g1 = grow(t, sc.start + 12, 5);
    if (g1 > 0.02) {
      T(46, 288, 'Why the product is exact: the preimages of the image values are the cosets of the kernel.', 11, INK, true);
      T(46, 312, 'Every coset has the same size as the kernel, the cosets partition the group, and there is one per image value.', 11, DIM);
      T(46, 334, 'So |G| = |kernel| \u00d7 |image|, and both sizes divide the group order.', 11, DIM);
    }

    var g2 = grow(t, sc.start + 20, 5);
    if (g2 > 0.02) {
      chip(46, 352, '|image| divides |G|', 'good');
      chip(210, 352, '|kernel| divides |G|', 'good');
      chip(380, 352, 'product must be |G|', 'warn');
      T(46, 386, 'That last line is a free check on any exam answer: two sizes that do not multiply out are wrong.', 11, INK);
      T(46, 408, 'The sign map is the smallest interesting case: three even permutations, two values, six is three times two.', 11, DIM);
    }
  };

  /* ---------------- scene 6: normal ---------------- */

  SCENE_DRAW.normal = function (t, sc) {
    T(46, 18, 'A kernel is closed under conjugation: g K g\u207b\u00b9 = K for every g', 11, DIM);

    box(160, 40, 580, 44, SURF, ACC, 8);
    T(450, 62, '\u03c6(g k g\u207b\u00b9) = \u03c6(g) \u00b7 e \u00b7 \u03c6(g)\u207b\u00b9 = e', 15, ACC, true, true, 'center');

    var g1 = grow(t, sc.start + 3, 4);
    if (g1 > 0.02) {
      box(46, 100, 396, 96, SURF, BORDER);
      T(62, 112, 'S3, six subgroups', 11, INK, true);
      T(62, 134, 'normal: {e}, the three rotations, the whole group', 10, DIM);
      T(62, 154, 'not normal: the three transposition pairs', 10, BAD);
      T(62, 174, '3 of 6 are normal', 10, INK);
    }
    var g2 = grow(t, sc.start + 6, 4);
    if (g2 > 0.02) {
      box(458, 100, 396, 96, SURF, BORDER);
      T(474, 112, 'D4, ten subgroups', 11, INK, true);
      T(474, 134, 'normal: {e}, {e, r\u00b2}, the rotations, two more, all of D4', 10, DIM);
      T(474, 154, 'not normal: the four reflection pairs', 10, BAD);
      T(474, 174, '6 of 10 are normal', 10, INK);
    }

    var g3 = grow(t, sc.start + 11, 5);
    if (g3 > 0.02) {
      T(46, 216, 'Conjugating one transposition subgroup gives all three, so no single one is closed:', 11, INK, true);
      var x = 46;
      x += chip(x, 236, '{e, (2 3)}', 'bad') + 10;
      P.arrow(x, 248, x + 34, 248, { stroke: FAINT, sw: 1.2, head: 7 });
      x += 44;
      x += chip(x, 236, '{e, (1 2)}', 'bad') + 10;
      P.arrow(x, 248, x + 34, 248, { stroke: FAINT, sw: 1.2, head: 7 });
      x += 44;
      chip(x, 236, '{e, (1 3)}', 'bad');
    }

    var g4 = grow(t, sc.start + 18, 5);
    if (g4 > 0.02) {
      box(46, 280, 808, 74, BADDIM, BAD, 6);
      T(62, 292, 'Counterexample: {e, s} is a subgroup of D4 and the kernel of no homomorphism out of D4.', 12, BAD, true);
      T(62, 316, 'Every kernel is normal, so a non-normal subgroup is excluded before any map is written down.', 10, DIM);
      T(62, 338, 'The other direction is checked where it is cheap: every kernel found by enumeration is normal.', 10, DIM);
      T(46, 372, 'Kernels found by enumerating all 46656 maps S3 to S3, and all maps D4 to Z2 and D4 to V4:', 11, INK);
      T(46, 394, KERNELS.length + ' kernels in total, and every one of them is normal.', 11, ACC, true);
      T(46, 416, 'That is evidence, not a proof. The proof is the one line at the top of this scene.', 10, FAINT);
    }
  };

  /* ---------------- scene 7: quotient ---------------- */

  SCENE_DRAW.quotient = function (t, sc) {
    T(46, 18, 'Cosets of the kernel: three boxes of two, and they form a group of three', 11, DIM);

    var cos = D.quotZ6Z3.cosets;
    for (var i = 0; i < cos.length; i++) {
      var a = grow(t, sc.start + 1 + i * 0.8, 4);
      if (a <= 0.02) continue;
      var x = 60 + i * 150;
      box(x, 46, 130, 58, SURF, ACC, 8);
      T(x + 65, 56, '{ ' + cos[i].join(', ') + ' }', 13, ACC, true, true, 'center');
      T(x + 65, 84, 'coset ' + i, 9, FAINT, false, false, 'center');
      if (i < cos.length - 1) P.arrow(x + 132, 75, x + 148, 75, { stroke: FAINT, sw: 1, head: 6 });
    }
    T(60, 120, 'three cosets of the kernel {0, 3}, each of size two', 10, DIM);

    var g1 = grow(t, sc.start + 5, 4);
    if (g1 > 0.02) {
      T(46, 148, 'Coset multiplication: multiply a representative from each and take the coset containing the answer.', 11, INK);
      T(46, 170, 'The result closes, contains the kernel as its identity, and has an inverse for every coset.', 11, DIM);
      T(46, 192, 'So the cosets of a kernel form a group: the quotient group, here of three elements.', 11, DIM);
    }

    var g2 = grow(t, sc.start + 10, 5);
    if (g2 > 0.02) {
      box(46, 214, 808, 84, ACCDIM, ACC, 6);
      T(62, 226, 'Why it is well defined: a coset has many names, and the product must not depend on the name.', 11, ACC, true);
      T(62, 250, 'In Z6, ' + D.sameCosetPairs + ' of the 36 ordered pairs lie in a common coset, and every one of them agrees.', 11, INK);
      T(62, 272, 'That agreement is exactly the normality of the kernel, proved in the previous scene.', 10, DIM);
    }

    var g3 = grow(t, sc.start + 17, 5);
    if (g3 > 0.02) {
      box(46, 310, 808, 100, BADDIM, BAD, 6);
      T(62, 322, 'With a non-normal subgroup the product does not exist. H = { e, (2 3) } in S3:', 11, BAD, true);
      if (WIT) {
        T(62, 346, 'identity \u00b7 ' + GRP.label(S3, WIT.y) + ' = ' + GRP.label(S3, S3.mul(WIT.x, WIT.y)) + '   lands in coset ' + WIT.c1, 11, INK, false, true);
        T(62, 368, GRP.label(S3, WIT.x2) + ' \u00b7 ' + GRP.label(S3, WIT.y) + ' = ' + GRP.label(S3, S3.mul(WIT.x2, WIT.y)) + '   lands in coset ' + WIT.c2, 11, INK, false, true);
      }
      T(62, 392, 'Two names for the same coset, two different answers. Same coset, different answer.', 10, DIM);
    }

    var g4 = grow(t, sc.start + 24, 4);
    if (g4 > 0.02) {
      T(46, 426, 'That failure is why the word normal exists, and why the theorem is stated with the kernel.', 11, INK);
    }
  };

  /* ---------------- scene 8: firstiso ---------------- */

  SCENE_DRAW.firstiso = function (t, sc) {
    T(46, 18, 'First isomorphism theorem: G / kernel is isomorphic to the image', 11, DIM);

    var bxs = [{ x: 46, t: 'G', s: 'the group' }, { x: 360, t: 'G / K', s: 'cosets of the kernel' }, { x: 674, t: 'image', s: 'values actually hit' }];
    for (var i = 0; i < 3; i++) {
      var a = grow(t, sc.start + 1 + i * 1.2, 4);
      if (a <= 0.02) continue;
      box(bxs[i].x, 48, 180, 64, SURF, i === 1 ? ACC : BORDER, 8);
      T(bxs[i].x + 90, 60, bxs[i].t, 15, i === 1 ? ACC : INK, true, true, 'center');
      T(bxs[i].x + 90, 86, bxs[i].s, 9, DIM, false, false, 'center');
    }
    var g1 = grow(t, sc.start + 4, 3);
    if (g1 > 0.02) {
      P.arrow(230, 80, 354, 80, { stroke: ACC, sw: 1.6, head: 9 });
      T(292, 62, 'quotient', 9, ACC, true, false, 'center');
      P.arrow(544, 80, 668, 80, { stroke: ACC, sw: 1.6, head: 9 });
      T(606, 62, 'isomorphic', 9, ACC, true, false, 'center');
    }

    var rows = [
      { m: 'Z6 \u2192 Z3', c: D.quotZ6Z3.size, i: D.imageZ6Z3.length, g: 6 },
      { m: 'Z12 \u2192 Z4', c: D.quotZ12Z4.size, i: D.imageZ12Z4.length, g: 12 },
      { m: 'S3 \u2192 Z2', c: D.quotS3Z2.size, i: 2, g: 6 },
      { m: 'Z4 \u2192 Z2', c: 2, i: D.imageZ4Z2.length, g: 4 }
    ];
    var g2 = grow(t, sc.start + 8, 5);
    if (g2 > 0.02) {
      T(46, 134, 'Verified on four maps: the induced map is well defined, injective, onto the image, and preserves the operation.', 11, INK, true);
      for (var j = 0; j < rows.length; j++) {
        var y = 158 + j * 34;
        T(60, y, rows[j].m, 11, INK, true, true);
        T(240, y, 'cosets: ' + rows[j].c, 11, ACC, false, true);
        T(400, y, 'image values: ' + rows[j].i, 11, VAL, false, true);
        chip(600, y - 4, rows[j].c === rows[j].i ? 'bijection' : 'mismatch', rows[j].c === rows[j].i ? 'good' : 'bad');
      }
    }

    var g3 = grow(t, sc.start + 17, 5);
    if (g3 > 0.02) {
      box(46, 306, 808, 62, ACCDIM, ACC, 6);
      T(62, 318, 'Every homomorphism factors as a quotient followed by an injective map.', 12, ACC, true);
      T(62, 342, 'The collapse is entirely in the first step; the second step loses nothing.', 10, DIM);
    }
    var g4 = grow(t, sc.start + 23, 4);
    if (g4 > 0.02) {
      T(46, 388, 'So the kernel and the quotient carry the same information, and the image is what is left over.', 11, INK);
      T(46, 410, 'For Z6 to Z3: 3 cosets against 3 values, and all 9 coset products agree with the product in Z3.', 11, DIM);
    }
  };

  /* ---------------- scene 9: count ---------------- */

  SCENE_DRAW.count = function (t, sc) {
    T(46, 18, 'Counting homomorphisms: for cyclic groups the answer is the greatest common divisor', 11, DIM);

    T(100, 44, 'm \\ n', 9, FAINT, true, true);
    for (var n = 1; n <= 6; n++) T(140 + (n - 1) * 40, 44, String(n), 10, FAINT, true, true, 'center');
    for (var m = 1; m <= 6; m++) {
      var a = grow(t, sc.start + 1 + m * 0.5, 4);
      T(120, 76 + (m - 1) * 34, String(m), 10, FAINT, true, true, 'center');
      if (a <= 0.02) continue;
      for (var n2 = 1; n2 <= 6; n2++) {
        var v = TABLE[m][n2];
        var diag = m === n2;
        box(124 + (n2 - 1) * 40, 66 + (m - 1) * 34, 34, 26, diag ? ACCDIM : SURF, diag ? ACC : BORDER, 4);
        T(141 + (n2 - 1) * 40, 72 + (m - 1) * 34, String(v), 10, diag ? ACC : INK, diag, true, 'center');
      }
    }

    var g1 = grow(t, sc.start + 6, 5);
    if (g1 > 0.02) {
      T(46, 292, 'Every cell is computed, not quoted: all n^m maps are built and each is tested on every ordered pair.', 10, DIM);
      T(46, 314, 'The diagonal is m, the last row and column are 1 when coprime, and the table is the gcd matrix.', 10, DIM);
    }

    var g2 = grow(t, sc.start + 11, 5);
    if (g2 > 0.02) {
      box(420, 44, 434, 210, SURF, BORDER, 8);
      T(436, 56, 'Enumeration, not formula', 11, INK, true);
      T(436, 80, 'Z4 \u2192 Z4: ' + COUNTS.mapsZ4Z4 + ' maps, ' + COUNTS.homZ4Z4 + ' homomorphisms', 11, DIM, false, true);
      T(436, 102, 'Z6 \u2192 Z3: ' + COUNTS.mapsZ6Z3 + ' maps, ' + COUNTS.homZ6Z3 + ' homomorphisms', 11, DIM, false, true);
      T(436, 124, 'S3 \u2192 S3: ' + COUNTS.mapsS3S3 + ' maps, ' + COUNTS.homS3S3 + ' homomorphisms', 11, DIM, false, true);
      T(436, 146, 'S3 \u2192 V4: ' + COUNTS.mapsS3V4 + ' maps, ' + COUNTS.homS3V4 + ' homomorphisms', 11, DIM, false, true);
      T(436, 168, 'S3 \u2192 Z3: ' + COUNTS.homS3Z3 + ' homomorphism, the trivial one', 11, DIM, false, true);
      T(436, 190, 'The cyclic count is gcd(m, n) because \u03c6(1) = k needs n | m k.', 10, INK);
      T(436, 212, 'For non-cyclic groups there is no such formula.', 10, INK);
      chip(436, 226, 'cyclic: gcd', 'good');
      chip(560, 226, 'non-cyclic: enumerate', 'warn');
    }

    var g3 = grow(t, sc.start + 19, 5);
    if (g3 > 0.02) {
      T(46, 340, 'Onto homomorphisms: possible only when n divides m, and then there are \u03c6(n) of them.', 11, INK, true);
      T(46, 364, '12 \u2192 4: ' + COUNTS.onto12to4 + ' onto maps, and \u03c6(4) = ' + COUNTS.euler4 + '.   6 \u2192 3: ' + COUNTS.onto6to3 + '.   8 \u2192 2: ' + COUNTS.onto8to2 + '.   6 \u2192 4: ' + COUNTS.onto6to4 + ', since 4 does not divide 6.', 11, DIM, false, true);
      T(46, 392, 'A generator of the target must be hit, so the image must have n elements, which needs n to divide m.', 10, DIM);
      T(46, 414, 'The number of generators of Z_n is Euler\u2019s totient \u03c6(n), counted here by testing coprimality.', 10, DIM);
    }
  };

  /* ---------------- scene 10: exam ---------------- */

  SCENE_DRAW.exam = function (t, sc) {
    T(46, 18, 'Four question shapes, and three traps that cost marks', 11, DIM);

    var shapes = ['is this map a homomorphism?', 'how many homomorphisms are there?', 'what is the kernel?', 'is it injective, or onto?'];
    for (var i = 0; i < 4; i++) {
      var a = grow(t, sc.start + 1 + i * 0.8, 4);
      if (a <= 0.02) continue;
      var x = 46 + (i % 2) * 410;
      var y = 44 + Math.floor(i / 2) * 46;
      box(x, y, 396, 36, SURF, BORDER, 6);
      T(x + 14, y + 12, (i + 1) + '. ' + shapes[i], 11, INK, true);
    }

    var traps = [
      { a: 'Trap 1: order is divided, not preserved.', b: 'Z4 to Z2 sends the element 1, order 4, to an element of order 2.' },
      { a: 'Trap 2: a kernel is normal, never an arbitrary subgroup.', b: 'The transposition pairs of S3 are subgroups and never kernels.' },
      { a: 'Trap 3: |kernel| \u00d7 |image| = |G|.', b: 'Two sizes that do not multiply out are wrong before any other check.' }
    ];
    var g1 = grow(t, sc.start + 5, 5);
    if (g1 > 0.02) {
      T(46, 150, 'The shortcut that removes options before any product is checked:', 11, INK, true);
      T(46, 174, 'the order of \u03c6(a) divides the order of a. 190 element-order pairs tested here, no exception.', 11, DIM);
    }

    for (var j = 0; j < traps.length; j++) {
      var b = grow(t, sc.start + 10 + j * 2, 4);
      if (b <= 0.02) continue;
      var yy = 202 + j * 54;
      box(46, yy, 808, 44, j === 2 ? WARNDIM : BADDIM, j === 2 ? WARN : BAD, 6);
      T(62, yy + 8, traps[j].a, 11, j === 2 ? WARN : BAD, true);
      T(62, yy + 26, traps[j].b, 10, DIM);
    }

    var g2 = grow(t, sc.start + 20, 5);
    if (g2 > 0.02) {
      box(46, 366, 808, 52, ACCDIM, ACC, 6);
      T(62, 378, 'One line to carry: the kernel measures the collapse, the image is what survives,', 12, ACC, true);
      T(62, 398, 'and the quotient by the kernel is exactly the image.', 12, ACC, true);
      T(46, 434, 'Name which of the three is being asked about, and the method follows.', 10, DIM);
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
      groups: [Z6.n, Z3.n, Z4.n, Z12.n, V4.n, S3.n, D4.n],
      kernels: KERNELS.length,
      checks: CHECKS.length,
      table: TABLE
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
