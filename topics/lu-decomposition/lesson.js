/* ==========================================================================
   lu-decomposition — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no linear algebra of its own: every
   figure on the canvas was computed once here, in exact rational arithmetic,
   and checked against the rule it is supposed to satisfy — the factors against
   their product, the multipliers against the entries they cleared, the solution
   against its residual, the determinant against a cofactor expansion and against
   the leading minors, the failure case against the minor theorem, the operation
   counts against their closed form, and each of the four 2025 statements against
   a computed example or counterexample.
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
  var SURF2 = PAL.surface2, BORDER = PAL.border;
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

/* ---------- exact rational arithmetic ---------- */
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
function R(n, d) {
  if (d === undefined) d = 1;
  if (d === 0) return null;
  if (d < 0) { n = -n; d = -d; }
  var g = gcd(n, d);
  return { n: n / g, d: d / g };
}
var ZERO = R(0), ONE = R(1);
function radd(a, b) { return R(a.n * b.d + b.n * a.d, a.d * b.d); }
function rsub(a, b) { return R(a.n * b.d - b.n * a.d, a.d * b.d); }
function rmul(a, b) { return R(a.n * b.n, a.d * b.d); }
function rdiv(a, b) { return b.n === 0 ? null : R(a.n * b.d, a.d * b.n); }
function req(a, b) { return a.n === b.n && a.d === b.d; }
function rzero(a) { return a.n === 0; }
function rstr(a) {
  if (a.d === 1) return String(a.n);
  return a.n + '/' + a.d;
}
function rval(a) { return a.n / a.d; }
function rm(A) { return A.map(function (r) { return r.map(function (x) { return R(x); }); }); }
/* copy a matrix that is already rational, without re-interpreting its entries */
function rcopy(A) { return A.map(function (r) { return r.map(function (x) { return { n: x.n, d: x.d }; }); }); }

function matmul(A, B) {
  var n = A.length, m = B[0].length, k = B.length, C = [], i, j, t, s;
  for (i = 0; i < n; i++) {
    C.push([]);
    for (j = 0; j < m; j++) {
      s = ZERO;
      for (t = 0; t < k; t++) s = radd(s, rmul(A[i][t], B[t][j]));
      C[i].push(s);
    }
  }
  return C;
}
function matEq(A, B) {
  if (A.length !== B.length) return false;
  for (var i = 0; i < A.length; i++) {
    if (A[i].length !== B[i].length) return false;
    for (var j = 0; j < A[i].length; j++) if (!req(A[i][j], B[i][j])) return false;
  }
  return true;
}
function matT(A) {
  var r = A.length, c = A[0].length, B = [], i, j;
  for (j = 0; j < c; j++) { B.push([]); for (i = 0; i < r; i++) B[j].push(A[i][j]); }
  return B;
}
function matvec(A, x) {
  var n = A.length, y = [], i, j, s;
  for (i = 0; i < n; i++) { s = ZERO; for (j = 0; j < x.length; j++) s = radd(s, rmul(A[i][j], x[j])); y.push(s); }
  return y;
}
function detCof(A) {
  var n = A.length, j, k, s = ZERO, sub, sign = ONE, term;
  if (n === 1) return A[0][0];
  for (j = 0; j < n; j++) {
    sub = [];
    for (k = 1; k < n; k++) {
      sub.push(A[k].filter(function (_, c) { return c !== j; }));
    }
    term = rmul(A[0][j], detCof(sub));
    s = (j % 2 === 0) ? radd(s, term) : rsub(s, term);
  }
  return s;
}
function leadingMinor(A, k) {
  return detCof(A.slice(0, k).map(function (row) { return row.slice(0, k); }));
}

/* ---------- the factorisation, instrumented ---------- */
/* Returns L, U, the operation count, and the column where a zero pivot stopped it. */
function factorLU(A) {
  var n = A.length, U = rcopy(A), L = [], i, j, k, m, ops = 0;
  for (i = 0; i < n; i++) { L.push([]); for (j = 0; j < n; j++) L[i].push(i === j ? ONE : ZERO); }
  for (k = 0; k < n - 1; k++) {
    if (rzero(U[k][k])) return { L: L, U: U, ops: ops, failedAt: k };
    for (i = k + 1; i < n; i++) {
      m = rdiv(U[i][k], U[k][k]); ops += 1;          /* one division */
      L[i][k] = m;
      for (j = k; j < n; j++) { U[i][j] = rsub(U[i][j], rmul(m, U[k][j])); ops += 2; }  /* mul + sub */
      U[i][k] = ZERO;
    }
  }
  return { L: L, U: U, ops: ops, failedAt: null };
}

/* Crout: the ones go on U, so L carries the pivots on its diagonal. */
function factorCrout(A) {
  var n = A.length, L = [], U = [], i, j, k, s;
  for (i = 0; i < n; i++) { L.push([]); U.push([]); for (j = 0; j < n; j++) { L[i].push(ZERO); U[i].push(ZERO); } }
  for (i = 0; i < n; i++) U[i][i] = ONE;
  for (i = 0; i < n; i++) {
    for (j = i; j < n; j++) {
      s = A[j][i];
      for (k = 0; k < i; k++) s = rsub(s, rmul(L[j][k], U[k][i]));
      L[j][i] = s;
    }
    for (j = i + 1; j < n; j++) {
      s = A[i][j];
      for (k = 0; k < i; k++) s = rsub(s, rmul(L[i][k], U[k][j]));
      U[i][j] = rdiv(s, L[i][i]);
    }
  }
  return { L: L, U: U };
}

/* Partial pivoting: returns P, L, U with P*A = L*U, and the number of row swaps. */
function factorPivot(A) {
  var n = A.length, M = rcopy(A), L = [], Pv = [], i, j, k, p, tmp, m, swaps = 0, best, bestAbs;
  for (i = 0; i < n; i++) {
    L.push([]); Pv.push([]);
    for (j = 0; j < n; j++) { L[i].push(i === j ? ONE : ZERO); Pv[i].push(i === j ? ONE : ZERO); }
  }
  for (k = 0; k < n - 1; k++) {
    best = k; bestAbs = Math.abs(rval(M[k][k]));
    for (i = k + 1; i < n; i++) if (Math.abs(rval(M[i][k])) > bestAbs) { bestAbs = Math.abs(rval(M[i][k])); best = i; }
    if (best !== k) {
      tmp = M[k]; M[k] = M[best]; M[best] = tmp;
      tmp = Pv[k]; Pv[k] = Pv[best]; Pv[best] = tmp;
      for (j = 0; j < k; j++) { tmp = L[k][j]; L[k][j] = L[best][j]; L[best][j] = tmp; }
      swaps += 1;
    }
    if (rzero(M[k][k])) continue;
    for (i = k + 1; i < n; i++) {
      m = rdiv(M[i][k], M[k][k]); L[i][k] = m;
      for (j = k; j < n; j++) M[i][j] = rsub(M[i][j], rmul(m, M[k][j]));
      M[i][k] = ZERO;
    }
  }
  return { P: Pv, L: L, U: M, swaps: swaps };
}

function fwd(L, b) {
  var n = b.length, y = [], i, j, s;
  for (i = 0; i < n; i++) { s = b[i]; for (j = 0; j < i; j++) s = rsub(s, rmul(L[i][j], y[j])); y.push(s); }
  return y;
}
function back(U, y) {
  var n = y.length, x = new Array(n), i, j, s;
  for (i = n - 1; i >= 0; i--) {
    s = y[i];
    for (j = i + 1; j < n; j++) s = rsub(s, rmul(U[i][j], x[j]));
    x[i] = rdiv(s, U[i][i]);
  }
  return x;
}
function prodDiag(M) {
  var p = ONE;
  for (var i = 0; i < M.length; i++) p = rmul(p, M[i][i]);
  return p;
}

var V = {};

/* ---------- the worked 3x3 (all integers) ---------- */
V.A3 = rm([[2, 1, -1], [-4, -1, 3], [2, 2, 2]]);
V.f3 = factorLU(V.A3);
V.L3 = V.f3.L; V.U3 = V.f3.U;
V.A3b = rm([[-4, -1, 3], [-2, -1, 1], [2, 2, 2]]);   /* row two after step one, unnormalised */

/* the trailing block after step one: the state step two actually sees */
V.afterA3 = rcopy(V.A3);
(function () {
  for (var i = 1; i < 3; i++) {
    var m1 = rdiv(V.afterA3[i][0], V.afterA3[0][0]);
    for (var j = 0; j < 3; j++) V.afterA3[i][j] = rsub(V.afterA3[i][j], rmul(m1, V.afterA3[0][j]));
  }
})();
V.trail = [[V.afterA3[1][1], V.afterA3[1][2]], [V.afterA3[2][1], V.afterA3[2][2]]];
V.m21 = V.L3[1][0]; V.m31 = V.L3[2][0]; V.m32 = V.L3[2][1];
V.u11 = V.U3[0][0]; V.u33 = V.U3[2][2];
V.a32 = V.A3[2][1];
V.a32terms = [rmul(V.L3[2][0], V.U3[0][1]), rmul(V.L3[2][1], V.U3[1][1])];

/* ---------- GATE CSE 2022 system ---------- */
V.A22 = rm([[1, 1, -2], [1, 3, -1], [2, 1, -5]]);
V.b22 = [R(4), R(7), R(7)];
V.f22 = factorLU(V.A22);
V.L22 = V.f22.L; V.U22 = V.f22.U;
V.y22 = fwd(V.L22, V.b22);
V.x22 = back(V.U22, V.y22);
V.res22 = matvec(V.A22, V.x22).map(function (v, i) { return rsub(v, V.b22[i]); });
V.det22LU = prodDiag(V.U22);
V.det22cof = detCof(V.A22);

/* ---------- the invertible matrix with no LU without pivoting ---------- */
V.AF = rm([[1, 1, 1], [1, 1, 2], [1, 2, 2]]);
V.fF = factorLU(V.AF);
V.minF = [leadingMinor(V.AF, 1), leadingMinor(V.AF, 2), leadingMinor(V.AF, 3)];
V.afterStep1 = [V.fF.U[0].slice(), V.fF.U[1].slice(), V.fF.U[2].slice()];
V.fFP = factorPivot(V.AF);
V.detFcof = detCof(V.AF);
V.detFpivot = rmul(prodDiag(V.fFP.U), V.fFP.swaps % 2 === 1 ? R(-1) : ONE);

/* ---------- the 4x4 with clean fractions ---------- */
V.A4 = rm([[4, 3, 2, 1], [3, 4, 3, 2], [2, 3, 4, 3], [1, 2, 3, 4]]);
V.f4 = factorLU(V.A4);
V.L4 = V.f4.L; V.U4 = V.f4.U;
V.det4LU = prodDiag(V.U4);
V.det4cof = detCof(V.A4);
V.min4 = [leadingMinor(V.A4, 1), leadingMinor(V.A4, 2), leadingMinor(V.A4, 3), leadingMinor(V.A4, 4)];
/* A = L D L^T with D the diagonal of U: exact, and true for every symmetric A */
V.D4 = [];
(function () {
  for (var i = 0; i < 4; i++) { var row = []; for (var j = 0; j < 4; j++) row.push(i === j ? V.U4[i][i] : ZERO); V.D4.push(row); }
})();
V.ldlt = matmul(matmul(V.L4, V.D4), matT(V.L4));
/* the square-root form, on a 2x2 whose Cholesky factor happens to be rational */
V.Ach = rm([[4, 2], [2, 5]]);
V.Lch = rm([[2, 0], [1, 2]]);
V.chol2 = matmul(V.Lch, matT(V.Lch));

/* ---------- GATE CSE 2015 Set 1 ---------- */
V.A15 = rm([[2, 2], [4, 9]]);
V.cr15 = factorCrout(V.A15);
V.doo15 = factorLU(V.A15);
V.l22crout = V.cr15.L[1][1];
V.l22doo = V.doo15.L[1][1];

/* ---------- operation counts ---------- */
V.counts = [];
(function () {
  for (var n = 2; n <= 12; n++) {
    var A = [], i, j;
    for (i = 0; i < n; i++) { A.push([]); for (j = 0; j < n; j++) A[i].push(R(i === j ? n + 1 : 1)); }
    var f = factorLU(A);
    V.counts.push({ n: n, ops: f.ops, formula: 2 / 3 * n * n * n + 1 / 2 * n * n - 7 / 6 * n });
  }
})();
V.countsMatch = V.counts.every(function (c) { return Math.abs(c.ops - c.formula) < 1e-9; });

/* ---------- the many-right-hand-side trade at n = 10 ---------- */
V.nTrade = 10;
V.opsFactor = V.counts.filter(function (c) { return c.n === 10; })[0].ops;
V.opsSolve = V.nTrade * (V.nTrade - 1) + V.nTrade * V.nTrade;
V.trade = [1, 2, 5].map(function (s) {
  return { s: s, lu: V.opsFactor + s * V.opsSolve, gauss: s * V.opsFactor };
});

/* ---------- unknown counts ---------- */
V.unknownL = function (n) { return n * (n - 1) / 2; };
V.unknownU = function (n) { return n * (n + 1) / 2; };
V.unknownTotal = function (n) { return V.unknownL(n) + V.unknownU(n); };

/* ---------- GATE CSE 2025 Set 2, statement D ---------- */
V.Asym = rm([[4, 2], [2, 3]]);
V.fSym = factorLU(V.Asym);
V.Lsym = V.fSym.L; V.Usym = V.fSym.U;
V.LsymSym = req(V.Lsym[0][1], V.Lsym[1][0]);
V.UsymSym = req(V.Usym[0][1], V.Usym[1][0]);
/* statement C: a singular matrix must show a zero on the diagonal of U */
V.Asing = rm([[1, 2], [2, 4]]);
V.fSing = factorLU(V.Asing);
V.zeroOnDiag = false;
for (var _i = 0; _i < V.fSing.U.length; _i++) if (rzero(V.fSing.U[_i][_i])) V.zeroOnDiag = true;

/* ---------- statement A demonstrated on a right-hand side ---------- */
V.qSym = [R(6), R(7)];
V.ySym = fwd(V.Lsym, V.qSym);
V.xSym = back(V.Usym, V.ySym);
V.resSym = matvec(V.Asym, V.xSym).map(function (v, i) { return rsub(v, V.qSym[i]); });

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* the factorisation is what it claims to be */
chk('3x3: L times U returns A exactly', matEq(matmul(V.L3, V.U3), V.A3));
chk('3x3: the diagonal of L is all ones', req(V.L3[0][0], ONE) && req(V.L3[1][1], ONE) && req(V.L3[2][2], ONE));
chk('3x3: L is zero above its diagonal', rzero(V.L3[0][1]) && rzero(V.L3[0][2]) && rzero(V.L3[1][2]));
chk('3x3: U is zero below its diagonal', rzero(V.U3[1][0]) && rzero(V.U3[2][0]) && rzero(V.U3[2][1]));
chk('3x3: multipliers equal entry over pivot', req(V.m21, rdiv(V.A3[1][0], V.u11)) && req(V.m31, rdiv(V.A3[2][0], V.u11)) && req(V.m32, rdiv(V.trail[1][0], V.trail[0][0])), 'm21=' + rstr(V.m21) + ' m31=' + rstr(V.m31) + ' m32=' + rstr(V.m32));
chk('3x3: the eliminated entries are exactly zero', rzero(V.U3[1][0]) && rzero(V.U3[2][0]) && rzero(V.U3[2][1]));
chk('3x3: a32 = l31*u12 + l32*u22', req(radd(V.a32terms[0], V.a32terms[1]), V.a32), rstr(V.a32));
chk('3x3: last pivot is the surviving corner', req(V.u33, rsub(V.trail[1][1], rmul(V.m32, V.trail[0][1]))), rstr(V.u33));

/* the unknown count */
chk('unknowns: n(n-1)/2 + n(n+1)/2 = n^2 at n = 3', V.unknownTotal(3) === 9);
chk('unknowns: the identity holds at n = 2..12', [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].every(function (n) { return V.unknownTotal(n) === n * n; }));

/* GATE CSE 2022 */
chk('2022: L32 = -1/2', req(V.L22[2][1], R(-1, 2)), rstr(V.L22[2][1]));
chk('2022: U33 = -1/2', req(V.U22[2][2], R(-1, 2)), rstr(V.U22[2][2]));
chk('2022: x1 = 0', req(V.x22[0], ZERO), rstr(V.x22[0]));
chk('2022: x = (0, 2, -1)', req(V.x22[1], R(2)) && req(V.x22[2], R(-1)));
chk('2022: L times U returns A', matEq(matmul(V.L22, V.U22), V.A22));
chk('2022: forward substitution gives y = (4, 3, 1/2)', req(V.y22[0], R(4)) && req(V.y22[1], R(3)) && req(V.y22[2], R(1, 2)));
chk('2022: the residual A x - b is exactly zero', V.res22.every(rzero));

/* determinants */
chk('2022: det from the pivots equals the cofactor value', req(V.det22LU, V.det22cof), rstr(V.det22LU));
chk('4x4: det from the pivots is 20', req(V.det4LU, R(20)), rstr(V.det4LU));
chk('4x4: det from the pivots equals the cofactor value', req(V.det4LU, V.det4cof));
chk('4x4: det equals the fourth leading minor', req(V.det4LU, V.min4[3]));
chk('4x4: the leading minors are 4, 7, 12, 20', req(V.min4[0], R(4)) && req(V.min4[1], R(7)) && req(V.min4[2], R(12)) && req(V.min4[3], R(20)));
chk('4x4: L times U returns A', matEq(matmul(V.L4, V.U4), V.A4));

/* the failure case */
chk('failure: the leading minors are 1, 0, -1', req(V.minF[0], R(1)) && req(V.minF[1], ZERO) && req(V.minF[2], R(-1)));
chk('failure: the matrix is invertible, det = -1', req(V.detFcof, R(-1)), rstr(V.detFcof));
chk('failure: elimination stops at a zero pivot in column 1', V.fF.failedAt === 1);
chk('failure: with pivoting, P A = L U', matEq(matmul(V.fFP.P, V.AF), matmul(V.fFP.L, V.fFP.U)));
chk('failure: det from the pivots and one swap is -1', req(V.detFpivot, V.detFcof), rstr(V.detFpivot));

/* Doolittle against Crout */
chk('2015: the Crout lower diagonal entry l22 is 5', req(V.l22crout, R(5)), rstr(V.l22crout));
chk('2015: the Doolittle lower diagonal entry l22 is 1', req(V.l22doo, ONE), rstr(V.l22doo));
chk('2015: the Crout pair multiplies back to A', matEq(matmul(V.cr15.L, V.cr15.U), V.A15));
chk('2015: the Doolittle pair multiplies back to A', matEq(matmul(V.doo15.L, V.doo15.U), V.A15));
chk('2015: the two pairs share the same U diagonal product', req(prodDiag(V.cr15.L), prodDiag(V.doo15.U)));

/* Cholesky */
chk('4x4: L times diag(U) times L transpose returns A', matEq(V.ldlt, V.A4));
chk('Cholesky: L times L transpose returns A on the 2x2 [[4,2],[2,5]]', matEq(V.chol2, V.Ach));
chk('Cholesky: the factor is lower triangular with a positive diagonal', rzero(V.Lch[0][1]) && V.Lch[0][0].n > 0 && V.Lch[1][1].n > 0);

/* operation counts */
chk('counts: measured equals (2/3)n^3 + (1/2)n^2 - (7/6)n for n = 2..12', V.countsMatch);
chk('counts: n = 10 gives 705', V.opsFactor === 705, String(V.opsFactor));
chk('counts: each extra solve at n = 10 costs 190', V.opsSolve === 190, String(V.opsSolve));
chk('counts: at s = 1 elimination wins, at s = 2 LU wins', V.trade[0].lu > V.trade[0].gauss && V.trade[1].lu < V.trade[1].gauss, V.trade[0].lu + '/' + V.trade[0].gauss + ' then ' + V.trade[1].lu + '/' + V.trade[1].gauss);

/* the 2025 statements */
chk('2025 A: two triangular solves reproduce the solution', V.resSym.every(rzero), 'x = (' + V.xSym.map(rstr).join(', ') + ')');
chk('2025 B: with P invertible the product of the pivots is nonzero', !rzero(prodDiag(V.fSym.U)));
chk('2025 C: a singular matrix shows a zero on the diagonal of U', V.zeroOnDiag);
chk('2025 D: the symmetric P gives a non-symmetric L', !V.LsymSym);
chk('2025 D: the symmetric P gives a non-symmetric U', !V.UsymSym);

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

/* the shared painter takes (x, y, text); every call here reads (text, x, y) */
function T(s, x, y, o) { P.text(x, y, s, o); }

function label(s, x, y, size, col) {
  T(s, x, y, { size: size || 12, mono: true, color: col || DIM });
}
function body(s, x, y, size, col) {
  T(s, x, y, { size: size || 13, color: col || INK });
}
function mono(s, x, y, size, col, bold) {
  T(s, x, y, { size: size || 13, mono: true, color: col || INK, bold: !!bold });
}

/* a bracketed matrix; returns its geometry so callers can align to it */
function matrix(M, x, y, o) {
  o = o || {};
  var cw = o.cw || 42, ch = o.ch || 30, size = o.size || 15;
  var rows = M.length, cols = M[0].length;
  var w = cols * cw, h = rows * ch;
  var col = o.color || INK, br = 7, tick = 6;
  P.line(x - br, y, x - br, y + h, { stroke: col, sw: 1.6 });
  P.line(x - br, y, x - br + tick, y, { stroke: col, sw: 1.6 });
  P.line(x - br, y + h, x - br + tick, y + h, { stroke: col, sw: 1.6 });
  P.line(x + w + br, y, x + w + br, y + h, { stroke: col, sw: 1.6 });
  P.line(x + w + br, y, x + w + br - tick, y, { stroke: col, sw: 1.6 });
  P.line(x + w + br, y + h, x + w + br - tick, y + h, { stroke: col, sw: 1.6 });
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var hit = false;
      if (o.hl) for (var q = 0; q < o.hl.length; q++) { var p = o.hl[q]; if (p[0] === r && p[1] === c) hit = true; }
      if (hit) P.rect(x + c * cw + 1, y + r * ch + 1, cw - 2, ch - 2, { fill: o.hlFill || ACCDIM, radius: 3 });
      var val = M[r][c];
      var s = (typeof val === 'string') ? val : rstr(val);
      var tcol = col;
      if (o.cellColor) { var cc = o.cellColor(r, c); if (cc) tcol = cc; }
      T(s, x + c * cw + cw / 2, y + r * ch + ch / 2,
        { size: size, mono: true, color: tcol, align: 'center', base: 'middle' });
    }
  }
  return { x: x, y: y, w: w, h: h, cw: cw, ch: ch };
}

/* ---------------- scene 1: what the factorisation buys ---------------- */
function sceneCost(t, sc) {
  var u = (t - sc.start) / (sc.end - sc.start);

  label('A = L U', 34, 20, 12, DIM);
  P.rect(40, 190, 80, 80, { fill: SURF2, stroke: BORDER, radius: 8 });
  T('A', 80, 230, { size: 20, mono: true, color: INK, align: 'center', base: 'middle' });

  var a = Math.min(1, u * 3);
  P.alpha(a);
  P.arrow(124, 210, 168, 148, { stroke: ACC, sw: 1.8, head: 8 });
  P.arrow(124, 250, 168, 312, { stroke: ACC, sw: 1.8, head: 8 });
  P.alpha(1);

  P.rect(172, 118, 76, 58, { fill: ACCDIM, stroke: ACC, radius: 8 });
  T('L', 210, 147, { size: 20, mono: true, color: ACC, align: 'center', base: 'middle' });
  P.rect(172, 284, 76, 58, { fill: ACCDIM, stroke: ACC, radius: 8 });
  T('U', 210, 313, { size: 20, mono: true, color: ACC, align: 'center', base: 'middle' });

  T('lower triangular', 262, 140, { size: 12, color: DIM });
  T('upper triangular', 262, 322, { size: 12, color: DIM });

  P.line(370, 60, 370, 400, { stroke: BORDER, sw: 1, dash: [4, 4] });

  label('right-hand sides, n = 10', 396, 60, 12, DIM);
  body('systems s', 396, 92, 12, DIM);
  body('factor once, then s solves', 500, 92, 12, DIM);
  body('eliminate s times', 726, 92, 12, DIM);
  P.line(396, 102, 866, 102, { stroke: BORDER, sw: 1 });

  for (var i = 0; i < V.trade.length; i++) {
    var row = V.trade[i], yy = 128 + i * 34;
    var win = row.lu < row.gauss;
    mono(String(row.s), 396, yy, 14, INK);
    mono(String(row.lu), 500, yy, 14, win ? VAL : DIM, win);
    mono(String(row.gauss), 726, yy, 14, win ? DIM : VAL, !win);
  }
  P.line(396, 236, 866, 236, { stroke: BORDER, sw: 1 });
  body('the smaller number is green', 396, 258, 12, DIM);

  P.alpha(Math.min(1, Math.max(0, (u - 0.55) * 4)));
  P.rect(396, 292, 470, 74, { fill: SURF2, stroke: BORDER, radius: 8 });
  mono('factorisation once: 705 operations', 412, 310, 13, INK);
  mono('each extra solve: n(n-1) + n^2 = 190', 412, 332, 13, INK);
  mono('so the crossover is s = 2, not s = 1', 412, 354, 13, ACC, true);
  P.alpha(1);
}

/* ---------------- scene 2: reading the product ---------------- */
function sceneProduct(t, sc) {
  var u = (t - sc.start) / (sc.end - sc.start);
  label('entry (i,j) of L U = row i of L against column j of U', 34, 20, 12, DIM);

  var gA = matrix(V.A3, 55, 96, { cw: 46, ch: 32, size: 15, hl: [[2, 1]] });
  T('=', 218, 158, { size: 20, mono: true, color: DIM, align: 'center', base: 'middle' });
  matrix(V.L3, 246, 96, { cw: 46, ch: 32, size: 15, hl: [[2, 0], [2, 1]] });
  T('=', 410, 158, { size: 20, mono: true, color: DIM, align: 'center', base: 'middle' });
  matrix(V.U3, 438, 96, { cw: 46, ch: 32, size: 15, hl: [[0, 1], [1, 1]] });

  T('A', 116, 74, { size: 12, mono: true, color: DIM, align: 'center' });
  T('L', 315, 74, { size: 12, mono: true, color: DIM, align: 'center' });
  T('U', 507, 74, { size: 12, mono: true, color: DIM, align: 'center' });

  P.alpha(Math.min(1, u * 3));
  mono('a32 = l31 u12 + l32 u22', 640, 118, 13, ACC, true);
  mono('= ' + rstr(V.a32terms[0]) + ' + ' + rstr(V.a32terms[1]), 640, 142, 13, ACC);
  mono('= ' + rstr(V.a32), 640, 166, 13, ACC);
  P.alpha(1);

  body('The highlighted entry of A is row three of L against column two of U: two products, not nine.', 40, 244, 13);
  body('L has n(n-1)/2 unknown off-diagonal entries and U has n(n+1)/2, and the two together are exactly n squared.', 40, 272, 13);
  mono('n = 3:  L has 3,  U has 6,  total 9 = the 9 entries of A', 40, 300, 13, INFO);
  body('So one further condition decides the pair, and the convention is the diagonal of L equals one.', 40, 330, 13);
  body('Fix the diagonal of U instead and you have Crout; the same A, a different pair.', 40, 358, 13, DIM);
}

/* ---------------- scene 3: Doolittle step one ---------------- */
function sceneStep1(t, sc) {
  var u = (t - sc.start) / (sc.end - sc.start);
  label('step 1: pivot a11, clear the two entries below it', 34, 20, 12, DIM);

  matrix(V.A3, 48, 76, { cw: 46, ch: 32, size: 15, hl: [[1, 0], [2, 0]] });
  T('A', 102, 54, { size: 12, mono: true, color: DIM, align: 'center' });
  P.arrow(200, 140, 240, 140, { stroke: ACC, sw: 1.8, head: 8 });

  var a = Math.min(1, u * 2.5);
  P.alpha(a);
  matrix(V.L3, 258, 76, { cw: 46, ch: 32, size: 15, hl: [[1, 0], [2, 0]] });
  T('L', 312, 54, { size: 12, mono: true, color: DIM, align: 'center' });
  matrix(V.U3, 438, 76, { cw: 46, ch: 32, size: 15, hl: [[0, 0], [0, 1], [0, 2], [1, 1], [1, 2], [2, 1], [2, 2]] });
  T('U', 492, 54, { size: 12, mono: true, color: DIM, align: 'center' });
  P.alpha(1);

  P.alpha(Math.min(1, Math.max(0, (u - 0.25) * 3)));
  mono('m21 = a21 / a11 = -4 / 2 = -2', 40, 236, 13, ACC);
  mono('m31 = a31 / a11 = 2 / 2 = 1', 40, 262, 13, ACC);
  P.alpha(1);

  P.alpha(Math.min(1, Math.max(0, (u - 0.5) * 3)));
  body('Row one of A is untouched, so row one of U is row one of A.', 40, 306, 13);
  body('The multipliers go into column one of L. They are kept, not discarded.', 40, 332, 13);
  body('Only the bottom-right block changes: that is the trailing block of scene 4.', 40, 358, 13, DIM);
  P.alpha(1);

  mono('trailing block', 620, 236, 12, DIM);
  matrix(V.trail, 622, 252, { cw: 44, ch: 30, size: 14, hlFill: WARNDIM });
}

/* ---------------- scene 4: step two and the multiply-back ---------------- */
function sceneStep2(t, sc) {
  var u = (t - sc.start) / (sc.end - sc.start);
  label('step 2: the pivot is now the corner of the trailing block', 34, 20, 12, DIM);

  matrix(V.L3, 48, 70, { cw: 46, ch: 32, size: 15, hl: [[2, 1]] });
  T('L', 102, 48, { size: 12, mono: true, color: DIM, align: 'center' });
  T('=', 222, 132, { size: 20, mono: true, color: DIM, align: 'center', base: 'middle' });
  matrix(V.U3, 250, 70, { cw: 46, ch: 32, size: 15, hl: [[2, 2]] });
  T('U', 304, 48, { size: 12, mono: true, color: DIM, align: 'center' });

  var a = Math.min(1, u * 2.5);
  P.alpha(a);
  mono('m32 = 1 / 1 = 1', 400, 86, 13, ACC);
  mono('u33 = 3 - 1 x 1 = 2', 400, 110, 13, ACC);
  P.alpha(1);

  P.alpha(Math.min(1, Math.max(0, (u - 0.4) * 3)));
  body('Multiply the pair back and all nine entries of A return:', 40, 194, 13);
  P.alpha(1);

  var b = Math.min(1, Math.max(0, (u - 0.6) * 3));
  P.alpha(b);
  matrix(matmul(V.L3, V.U3), 48, 246, { cw: 46, ch: 32, size: 15 });
  T('=', 222, 294, { size: 20, mono: true, color: DIM, align: 'center', base: 'middle' });
  matrix(V.A3, 250, 246, { cw: 46, ch: 32, size: 15 });
  T('A', 304, 224, { size: 12, mono: true, color: DIM, align: 'center' });
  mono('exact, entry by entry', 430, 290, 13, VAL, true);
  P.alpha(1);
}

/* ---------------- scene 5: the two triangular solves ---------------- */
function sceneSolve(t, sc) {
  var u = (t - sc.start) / (sc.end - sc.start);
  label('GATE CSE 2022: A x = b with A = L U', 34, 20, 12, DIM);

  body('1. Forward substitution, L y = b', 40, 48, 13, ACC);
  mono('y1 = b1 = 4', 56, 74, 13);
  mono('y2 = b2 - l21 y1 = 7 - 1(4) = 3', 56, 98, 13);
  mono('y3 = b3 - l31 y1 - l32 y2 = 7 - 2(4) + 0.5(3) = 0.5', 56, 122, 13);

  P.alpha(Math.min(1, Math.max(0, (u - 0.3) * 3)));
  body('2. Back substitution, U x = y', 40, 164, 13, ACC);
  mono('x3 = y3 / u33 = 0.5 / (-0.5) = -1', 56, 190, 13);
  mono('x2 = (y2 - u23 x3) / u22 = (3 + 1) / 2 = 2', 56, 214, 13);
  mono('x1 = (y1 - u12 x2 - u13 x3) / u11 = (4 - 2 + 2) = 0', 56, 238, 13);
  P.alpha(1);

  var a = Math.min(1, Math.max(0, (u - 0.6) * 3));
  P.alpha(a);
  P.rect(40, 274, 470, 62, { fill: ACCDIM, stroke: ACC, radius: 8 });
  mono('x = (0, 2, -1)', 60, 296, 15, ACC, true);
  mono('residual A x - b = (0, 0, 0)', 60, 318, 12, DIM);
  P.alpha(1);

  P.rect(546, 48, 320, 176, { fill: SURF2, stroke: BORDER, radius: 8 });
  label('what the paper asked for', 562, 66, 12, DIM);
  mono('L32 = -1/2', 562, 94, 14, INK);
  mono('U33 = -1/2', 562, 120, 14, INK);
  mono('x1  = 0', 562, 146, 14, INK);
  body('three different objects: an entry of L,', 562, 176, 12, DIM);
  body('an entry of U, and a component of x.', 562, 194, 12, DIM);

  body('Forward walks down and never divides; back walks up and divides by each pivot.', 40, 366, 13, DIM);
}

/* ---------------- scene 6: determinant and inverse ---------------- */
function sceneDet(t, sc) {
  var u = (t - sc.start) / (sc.end - sc.start);
  label('det(A) = det(L) det(U) = 1 x (product of the pivots)', 34, 20, 12, DIM);

  matrix(V.U4, 46, 96, { cw: 54, ch: 34, size: 14, hl: [[0, 0], [1, 1], [2, 2], [3, 3]] });
  T('U', 118, 74, { size: 12, mono: true, color: DIM, align: 'center' });

  mono('u11 u22 u33 u44', 46, 256, 13, DIM);
  mono('= ' + rstr(V.U4[0][0]) + ' x ' + rstr(V.U4[1][1]) + ' x ' + rstr(V.U4[2][2]) + ' x ' + rstr(V.U4[3][3]), 46, 280, 13, INK);
  mono('= ' + rstr(V.det4LU), 46, 304, 15, ACC, true);

  var a = Math.min(1, u * 2.5);
  P.alpha(a);
  body('Three independent routes to the same number:', 400, 96, 13);
  mono('product of the pivots      ' + rstr(V.det4LU), 400, 124, 13, INK);
  mono('cofactor expansion         ' + rstr(V.det4cof), 400, 150, 13, INK);
  mono('fourth leading minor       ' + rstr(V.min4[3]), 400, 176, 13, INK);
  body('They agree, which is what makes the number trustworthy.', 400, 204, 12, DIM);
  P.alpha(1);

  var b = Math.min(1, Math.max(0, (u - 0.55) * 3));
  P.alpha(b);
  P.rect(400, 234, 466, 96, { fill: SURF2, stroke: BORDER, radius: 8 });
  body('Each column of the inverse is one more pair of solves:', 416, 254, 13);
  mono('A x = e_j  ->  L y = e_j, then U x = y', 416, 278, 13, ACC);
  mono('so n^2 per column and n^3 for the whole inverse', 416, 302, 12, DIM);
  P.alpha(1);

  body('If rows were swapped, multiply by -1 once per swap, or the sign is wrong.', 46, 358, 13, WARN);
}

/* ---------------- scene 7: when it fails ---------------- */
function sceneFail(t, sc) {
  var u = (t - sc.start) / (sc.end - sc.start);
  label('invertible, and still no LU without row swaps', 34, 20, 12, DIM);

  matrix(V.AF, 46, 76, { cw: 46, ch: 32, size: 15 });
  T('A', 100, 54, { size: 12, mono: true, color: DIM, align: 'center' });

  var a = Math.min(1, u * 2.5);
  P.alpha(a);
  mono('leading principal minors', 46, 202, 12, DIM);
  mono('D1 = 1    D2 = 0    D3 = -1', 46, 226, 13, INK);
  mono('det(A) = -1, so A is invertible', 46, 250, 13, VAL);
  mono('but the pivot at (2,2) is 0', 46, 274, 13, BAD);
  P.alpha(1);

  P.alpha(Math.min(1, Math.max(0, (u - 0.3) * 3)));
  body('After step one the middle row is all but cleared:', 340, 76, 13);
  matrix(V.afterStep1, 340, 96, { cw: 46, ch: 32, size: 15, hl: [[1, 1]] });
  mono('the multiplier would divide by zero', 480, 140, 12, BAD);
  P.alpha(1);

  var b = Math.min(1, Math.max(0, (u - 0.55) * 3));
  P.alpha(b);
  P.rect(340, 216, 526, 118, { fill: SURF2, stroke: BORDER, radius: 8 });
  body('Repair: swap rows 2 and 3, then P A = L U', 356, 238, 13, ACC);
  mono('U diagonal: ' + V.fFP.U.map(function (r, i) { return rstr(r[i]); }).join(', '), 356, 264, 13);
  mono('det = product of pivots x (-1)^swaps = 1 x (-1) = ' + rstr(V.detFpivot), 356, 290, 13);
  body('which is the cofactor value, so the repair is right', 356, 314, 12, DIM);
  P.alpha(1);

  body('The theorem: LU exists and is unique exactly when D1 .. D(n-1) are all nonzero.', 46, 366, 13, WARN);
}

/* ---------------- scene 8: which diagonal ---------------- */
function sceneCrout(t, sc) {
  var u = (t - sc.start) / (sc.end - sc.start);
  label('GATE CSE 2015 Set 1: the diagonal of U is fixed to ones', 34, 20, 12, DIM);

  matrix(V.A15, 46, 88, { cw: 56, ch: 36, size: 16 });
  T('A', 100, 66, { size: 12, mono: true, color: DIM, align: 'center' });

  label('Doolittle, ones on L', 220, 62, 12, DIM);
  matrix(V.doo15.L, 220, 78, { cw: 50, ch: 32, size: 14, hl: [[1, 1]] });
  T('x', 336, 94, { size: 14, mono: true, color: DIM, align: 'center', base: 'middle' });
  matrix(V.doo15.U, 356, 78, { cw: 50, ch: 32, size: 14 });
  mono('l22 = ' + rstr(V.l22doo), 470, 94, 14, DIM);

  var a = Math.min(1, u * 2.5);
  P.alpha(a);
  label('Crout, ones on U', 220, 200, 12, ACC);
  matrix(V.cr15.L, 220, 216, { cw: 50, ch: 32, size: 14, hl: [[1, 1]] });
  T('x', 336, 232, { size: 14, mono: true, color: DIM, align: 'center', base: 'middle' });
  matrix(V.cr15.U, 356, 216, { cw: 50, ch: 32, size: 14 });
  mono('l22 = ' + rstr(V.l22crout), 470, 232, 14, ACC, true);
  P.alpha(1);

  P.alpha(Math.min(1, Math.max(0, (u - 0.4) * 3)));
  body('Same A, a different pair of matrices, the same product.', 46, 306, 13);
  body('The answer is 5, not 1, because the question moved the ones onto U.', 46, 332, 13, ACC);
  P.alpha(1);

  body('Always A = L D L-transpose, with D the diagonal of U. Cholesky is the square-root form, and needs positive definiteness.', 46, 366, 12, DIM);
}

/* ---------------- scene 9: the cost, counted ---------------- */
function sceneCount(t, sc) {
  var u = (t - sc.start) / (sc.end - sc.start);
  label('measured operations against (2/3)n^3 + (1/2)n^2 - (7/6)n', 34, 20, 12, DIM);

  var x0 = 78, base = 372, top = 92, maxV = 1260;
  var bw = 34, gap = 36, scale = (base - top) / maxV;

  P.line(x0 - 14, base, 872, base, { stroke: BORDER, sw: 1.2 });
  P.line(x0 - 14, top, x0 - 14, base, { stroke: BORDER, sw: 1.2 });

  var shown = Math.max(1, Math.min(V.counts.length, Math.floor(u * 13) + 1));
  for (var i = 0; i < shown; i++) {
    var c = V.counts[i], x = x0 + i * (bw + gap), hh = c.ops * scale;
    P.rect(x, base - hh, bw, hh, { fill: ACCDIM, stroke: ACC, radius: 3, sw: 1 });
    T(String(c.n), x + bw / 2, base + 6, { size: 11, mono: true, color: DIM, align: 'center' });
    T(String(c.ops), x + bw / 2, base - hh - 6, { size: 10, mono: true, color: INK, align: 'center', base: 'bottom' });
  }

  /* the closed form, drawn as a curve over the same axis */
  var prev = null;
  for (var k = 0; k < 11 * 6; k++) {
    var nv = 2 + k / 6, fv = 2 / 3 * nv * nv * nv + 1 / 2 * nv * nv - 7 / 6 * nv;
    var px = x0 + (nv - 2) * (bw + gap) + bw / 2, py = base - fv * scale;
    if (prev) P.line(prev[0], prev[1], px, py, { stroke: INFO, sw: 1.6, dash: [5, 4] });
    prev = [px, py];
  }

  P.alpha(Math.min(1, Math.max(0, (u - 0.6) * 3)));
  mono('bars: counted   dashed: the formula', 620, 40, 12, DIM);
  mono('all 11 sizes agree exactly', 620, 58, 12, VAL);
  P.alpha(1);

  body('Leading term (2/3)n cubed: the same as elimination, so LU is not cheaper per solve.', 46, 404, 13);
  body('It is cheaper per additional right-hand side, and at n = 10 the crossover is s = 2.', 46, 430, 13, DIM);
}

/* ---------------- scene 10: the four statements ---------------- */
function sceneMSQ(t, sc) {
  var u = (t - sc.start) / (sc.end - sc.start);
  label('GATE CSE 2025 Set 2: which statements about P = L U are true?', 34, 20, 12, DIM);

  var cards = [
    { k: 'A', y: 56, x: 40, lines: ['solve L y = Q, then U x = y'], ok: true,
      why: 'the method itself; residual checked' },
    { k: 'B', y: 56, x: 462, lines: ['P invertible => L, U invertible'], ok: true,
      why: 'det = 1 x product of pivots' },
    { k: 'C', y: 202, x: 40, lines: ['P singular => some U(ii) = 0'], ok: true,
      why: 'the same product, contrapositive' },
    { k: 'D', y: 202, x: 462, lines: ['P symmetric => L, U symmetric'], ok: false,
      why: 'refuted below by a computed case' }
  ];

  for (var i = 0; i < cards.length; i++) {
    var c = cards[i];
    var on = u * 4 > i - 0.2;
    P.alpha(on ? 1 : 0.28);
    P.rect(c.x, c.y, 400, 128, { fill: SURF2, stroke: c.ok ? VAL : BAD, radius: 8, sw: 1.4 });
    T(c.k, c.x + 22, c.y + 26, { size: 17, mono: true, color: INK, align: 'center', base: 'middle' });
    T(c.lines[0], c.x + 44, c.y + 30, { size: 13, color: INK });
    T(c.ok ? 'TRUE' : 'FALSE', c.x + 44, c.y + 58, { size: 13, mono: true, color: c.ok ? VAL : BAD, bold: true });
    T(c.why, c.x + 44, c.y + 84, { size: 12, color: DIM });
    P.alpha(1);
  }

  P.alpha(Math.min(1, Math.max(0, (u - 0.72) * 4)));
  mono('the counterexample for D:  P = [[4,2],[2,3]]  symmetric', 40, 360, 13, INK);
  mono('L = [[1,0],[1/2,1]]   U = [[4,2],[0,2]]   neither is symmetric', 40, 386, 13, BAD);
  P.alpha(1);
}

var SCENE_DRAW = {
  cost: sceneCost,
  product: sceneProduct,
  step1: sceneStep1,
  step2: sceneStep2,
  solve: sceneSolve,
  det: sceneDet,
  fail: sceneFail,
  crout: sceneCrout,
  count: sceneCount,
  msq: sceneMSQ
};

function drawFrame(painter) {
  P = painter;
  P.clear();
  var t = K.state.elapsed;
  var sc = null, scs = K.state.scenes || [];
  for (var i = scs.length - 1; i >= 0; i--) if (t >= scs[i].start - 1e-6) { sc = scs[i]; break; }
  if (!sc) return;
  var fn = SCENE_DRAW[sc.id];
  if (!fn) return;
  try { fn(t, sc); } catch (err) { console.error('scene draw failed', sc.id, err); }
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

window.__MODEL = { V: V, CHECKS: CHECKS };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
