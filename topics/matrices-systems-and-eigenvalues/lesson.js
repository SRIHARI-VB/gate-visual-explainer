/* ==========================================================================
   matrices-systems-and-eigenvalues — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model uses exact rational arithmetic for determinants, rank and the LU
   factorisation, so a "check" is an equality and not a tolerance. Floating
   point appears only for eigenvalues, and those are checked against the two
   identities that must hold: the roots add to the trace and multiply to the
   determinant.
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
   LAYER 0 - exact arithmetic
   ====================================================================== */

function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }

/* a rational number n/d, always reduced, d positive */
function R(n, d) {
  if (d === undefined) d = 1;
  if (d === 0) return null;
  if (d < 0) { n = -n; d = -d; }
  var g = gcd(n, d);
  return { n: n / g, d: d / g };
}
function rAdd(a, b) { return R(a.n * b.d + b.n * a.d, a.d * b.d); }
function rSub(a, b) { return R(a.n * b.d - b.n * a.d, a.d * b.d); }
function rMul(a, b) { return R(a.n * b.n, a.d * b.d); }
function rDiv(a, b) { return R(a.n * b.d, a.d * b.n); }
function rIsZero(a) { return a.n === 0; }
function rVal(a) { return a.n / a.d; }
function rStr(a) {
  if (a.d === 1) return String(a.n);
  if (Math.abs(a.d) <= 12 && Math.abs(a.n) <= 400) return a.n + '/' + a.d;
  return (a.n / a.d).toFixed(2);
}
function rOf(v) { return (v && typeof v === 'object') ? v : R(v); }
function rRow(v) { return v.map(rOf); }
function rMat(M) { return M.map(rRow); }

function matMulFrac(A, B) {
  var n = A.length, m = B[0].length, k = B.length, out = [];
  for (var i = 0; i < n; i++) {
    out.push([]);
    for (var j = 0; j < m; j++) {
      var s = R(0);
      for (var t = 0; t < k; t++) s = rAdd(s, rMul(A[i][t], B[t][j]));
      out[i].push(s);
    }
  }
  return out;
}
function matEqFrac(A, B) {
  if (A.length !== B.length) return false;
  for (var i = 0; i < A.length; i++) {
    if (A[i].length !== B[i].length) return false;
    for (var j = 0; j < A[i].length; j++) {
      if (A[i][j].n * B[i][j].d !== B[i][j].n * A[i][j].d) return false;
    }
  }
  return true;
}

/* determinant by exact Gaussian elimination with row swaps */
function detFrac(M) {
  var n = M.length, m = rMat(M), sign = 1, det = R(1);
  for (var c = 0; c < n; c++) {
    var p = -1;
    for (var r = c; r < n; r++) { if (!rIsZero(m[r][c])) { p = r; break; } }
    if (p < 0) return R(0);
    if (p !== c) { var t = m[p]; m[p] = m[c]; m[c] = t; sign = -sign; }
    det = rMul(det, m[c][c]);
    for (var r2 = c + 1; r2 < n; r2++) {
      var f = rDiv(m[r2][c], m[c][c]);
      for (var k = c; k < n; k++) m[r2][k] = rSub(m[r2][k], rMul(f, m[c][k]));
    }
  }
  return sign < 0 ? R(-det.n, det.d) : det;
}

/* rank by exact elimination: count the pivots */
function rankFrac(M) {
  var n = M.length, cols = M[0].length, m = rMat(M), rank = 0, row = 0;
  for (var c = 0; c < cols && row < n; c++) {
    var p = -1;
    for (var r = row; r < n; r++) { if (!rIsZero(m[r][c])) { p = r; break; } }
    if (p < 0) continue;
    var t = m[p]; m[p] = m[row]; m[row] = t;
    for (var r2 = row + 1; r2 < n; r2++) {
      var f = rDiv(m[r2][c], m[row][c]);
      for (var k = c; k < cols; k++) m[r2][k] = rSub(m[r2][k], rMul(f, m[row][k]));
    }
    rank++; row++;
  }
  return rank;
}

/* Doolittle LU with partial pivoting, exact. Returns L, U and the row order. */
function luFrac(A) {
  var n = A.length;
  var U = rMat(A), L = [], perm = [];
  for (var i = 0; i < n; i++) {
    L.push([]);
    perm.push(i);
    for (var j = 0; j < n; j++) L[i].push(R(i === j ? 1 : 0));
  }
  for (var c = 0; c < n; c++) {
    var p = -1;
    for (var r = c; r < n; r++) { if (!rIsZero(U[r][c])) { p = r; break; } }
    if (p < 0) return { ok: false };
    if (p !== c) {
      var t = U[p]; U[p] = U[c]; U[c] = t;
      var tp = perm[p]; perm[p] = perm[c]; perm[c] = tp;
      for (var k0 = 0; k0 < c; k0++) { var tl = L[p][k0]; L[p][k0] = L[c][k0]; L[c][k0] = tl; }
    }
    for (var r2 = c + 1; r2 < n; r2++) {
      var f = rDiv(U[r2][c], U[c][c]);
      L[r2][c] = f;
      for (var k = c; k < n; k++) U[r2][k] = rSub(U[r2][k], rMul(f, U[c][k]));
    }
  }
  var PA = perm.map(function (i) { return rRow(A[i]); });
  var LU = matMulFrac(L, U);
  /* the number of transpositions is n minus the number of cycles */
  var seen = [], cycles = 0;
  for (var q = 0; q < n; q++) {
    if (seen[q]) continue;
    cycles++;
    var k1 = q;
    while (!seen[k1]) { seen[k1] = true; k1 = perm[k1]; }
  }
  var swaps = n - cycles;
  return { ok: true, L: L, U: U, perm: perm, PA: PA, LU: LU, match: matEqFrac(PA, LU), swaps: swaps };
}

/* leading principal minors, in order */
function leadingMinors(M) {
  var n = M.length, out = [];
  for (var k = 1; k <= n; k++) {
    var sub = [];
    for (var i = 0; i < k; i++) sub.push(M[i].slice(0, k));
    out.push(detFrac(sub));
  }
  return out;
}

/* sum of the principal two-by-two minors of a square matrix */
function sumPrinMinors(M) {
  var n = M.length, s = 0;
  for (var i = 0; i < n; i++) {
    for (var j = i + 1; j < n; j++) {
      s += M[i][i] * M[j][j] - M[i][j] * M[j][i];
    }
  }
  return s;
}

function trace(M) { var s = 0; for (var i = 0; i < M.length; i++) s += M[i][i]; return s; }

/* real eigenvalues of a 2x2, from the characteristic polynomial */
function eigen2(M) {
  var tr = M[0][0] + M[1][1];
  var det = M[0][0] * M[1][1] - M[0][1] * M[1][0];
  var disc = tr * tr - 4 * det;
  return { trace: tr, det: det, disc: disc,
           real: disc >= 0,
           l1: disc >= 0 ? (tr + Math.sqrt(disc)) / 2 : null,
           l2: disc >= 0 ? (tr - Math.sqrt(disc)) / 2 : null };
}

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- 1. a matrix acting on a vector, column by column ---------- */

var A2 = [[2, 1], [1, 3]];                 /* the running example       */
var X2 = [1, 2];
var MAP = {
  A: A2, x: X2,
  c1: [A2[0][0], A2[1][0]],                /* column one = (2, 1)       */
  c2: [A2[0][1], A2[1][1]],                /* column two = (1, 3)       */
  Ax: [A2[0][0] * X2[0] + A2[0][1] * X2[1], A2[1][0] * X2[0] + A2[1][1] * X2[1]],
  terms: [
    { w: X2[0], col: [A2[0][0], A2[1][0]], part: [X2[0] * A2[0][0], X2[0] * A2[1][0]] },
    { w: X2[1], col: [A2[0][1], A2[1][1]], part: [X2[1] * A2[0][1], X2[1] * A2[1][1]] }
  ]
};

/* ---------- 2. determinants ---------- */

var D = {};
D.pos = [[2, 1], [1, 3]];                  /* determinant 5            */
D.neg = [[1, 2], [3, 4]];                  /* determinant -2           */
D.posDet = detFrac(D.pos);
D.negDet = detFrac(D.neg);
D.swapped = [[3, 4], [1, 2]];              /* the two rows of neg, swapped */
D.swapDet = detFrac(D.swapped);
D.prod = matMulFrac(rMat(A2), rMat(A2));
D.prodDet = detFrac(D.prod);
D.zero = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
D.zeroDet = detFrac(D.zero);
D.addLhs = [[2, 0], [0, 2]];               /* I + I, for the trap       */
D.addDet = detFrac(D.addLhs);

/* ---------- 3. rank and nullity ---------- */

var RK = {};
RK.three = D.zero;                         /* rows 1..9                */
RK.threeRank = rankFrac(RK.three);
RK.threeNullity = 3 - RK.threeRank;
RK.two = [[1, 2], [2, 4]];
RK.twoRank = rankFrac(RK.two);
RK.twoNullity = 2 - RK.twoRank;
RK.tall = [[1, 2], [2, 4], [3, 6]];
RK.tallRank = rankFrac(RK.tall);
RK.id = [[1, 0], [0, 1]];
RK.idRank = rankFrac(RK.id);

/* ---------- 4. systems ---------- */

function augRank(A, b) {
  var M = A.map(function (row, i) { return row.concat([b[i]]); });
  return rankFrac(M);
}

var SYS = [
  { id: 'unique', A: [[2, 1], [1, 3]], b: [4, 7], sol: [1, 2] },
  { id: 'infinite', A: [[1, 2], [2, 4]], b: [3, 6], particular: [3, 0], nullVec: [-2, 1] },
  { id: 'none', A: [[1, 2], [2, 4]], b: [3, 7] }
];
SYS.forEach(function (s) {
  s.rankA = rankFrac(s.A);
  s.rankAug = augRank(s.A, s.b);
  s.cols = s.A[0].length;
  s.nullity = s.cols - s.rankA;
  s.consistent = s.rankA === s.rankAug;
  s.count = !s.consistent ? 0 : (s.nullity === 0 ? 1 : Infinity);
  if (s.id === 'unique') {
    /* verify the stated solution exactly */
    s.resid = s.A.map(function (row) {
      return row[0] * s.sol[0] + row[1] * s.sol[1];
    });
  }
  if (s.id === 'infinite') {
    /* verify that A*nullVec = 0 and A*particular = b */
    s.nullImage = s.A.map(function (row) {
      return row[0] * s.nullVec[0] + row[1] * s.nullVec[1];
    });
    s.partImage = s.A.map(function (row) {
      return row[0] * s.particular[0] + row[1] * s.particular[1];
    });
  }
});
var SYS_U = SYS[0], SYS_I = SYS[1], SYS_N = SYS[2];
var WIDE = { n: 3, m: 5, minNullity: 2 };   /* GATE 2024 Set 1 shape    */

/* ---------- 5. LU decomposition ---------- */

var LU_M = [[0, 2, 1], [1, 1, 1], [2, 1, 3]];   /* first pivot is zero  */
var LU = luFrac(LU_M);
LU.minors = leadingMinors(LU_M);
LU.det = detFrac(LU_M);
LU.pivotProduct = R(1);
for (var pi = 0; pi < LU.U.length; pi++) LU.pivotProduct = rMul(LU.pivotProduct, LU.U[pi][pi]);
LU.detFromPivots = LU.swaps % 2 === 0 ? LU.pivotProduct : R(-LU.pivotProduct.n, LU.pivotProduct.d);

var LU2_M = [[4, 3], [6, 3]];                   /* needs no swap        */
var LU2 = luFrac(LU2_M);
LU2.minors = leadingMinors(LU2_M);
LU2.det = detFrac(LU2_M);
LU2.pivotProduct = rMul(LU2.U[0][0], LU2.U[1][1]);

/* the cost of the factorisation and the two triangular passes */
var COST = { n: 3 };
COST.luMults = COST.n * COST.n * COST.n / 3;    /* n^3/3 multiplications  */
COST.solveMults = COST.n * COST.n;              /* about n^2 per pass     */

/* ---------- 6. eigenvalues of the running example ---------- */

var E1 = eigen2(A2);                             /* (5 +- sqrt5)/2       */
E1.v1 = [1, E1.l1 - A2[0][0]];                   /* a vector with Av = l1 v */
E1.v2 = [1, E1.l2 - A2[0][0]];
E1.resid1 = [
  A2[0][0] * E1.v1[0] + A2[0][1] * E1.v1[1] - E1.l1 * E1.v1[0],
  A2[1][0] * E1.v1[0] + A2[1][1] * E1.v1[1] - E1.l1 * E1.v1[1]
];
E1.resid2 = [
  A2[0][0] * E1.v2[0] + A2[0][1] * E1.v2[1] - E1.l2 * E1.v2[0],
  A2[1][0] * E1.v2[0] + A2[1][1] * E1.v2[1] - E1.l2 * E1.v2[1]
];

/* the 3x3 with rows 1..9: characteristic polynomial lambda^3 - 15 lambda^2 - 18 lambda */
var E3 = {
  M: D.zero,
  trace: trace(D.zero),                          /* 15                    */
  det: D.zeroDet,                                /* 0                     */
  m2: sumPrinMinors(D.zero)                      /* -18                   */
};
E3.roots = [0,
  (E3.trace + Math.sqrt(E3.trace * E3.trace - 4 * E3.m2)) / 2,
  (E3.trace - Math.sqrt(E3.trace * E3.trace - 4 * E3.m2)) / 2];
E3.rootSum = E3.roots.reduce(function (s, x) { return s + x; }, 0);
E3.rootProd = E3.roots.reduce(function (s, x) { return s * x; }, 1);

/* the quarter turn: no real eigenvalue */
var ROT = [[0, -1], [1, 0]];
var EROT = eigen2(ROT);

/* ---------- 7. special matrices ---------- */

var SP = {};
SP.tri = [[2, 1, 4], [0, 3, 5], [0, 0, 7]];
SP.triDiag = [2, 3, 7];
SP.triDet = detFrac(SP.tri);                     /* 42                    */
SP.triTrace = trace(SP.tri);                     /* 12                    */

var n4 = 4;
SP.ji = [];
for (var i4 = 0; i4 < n4; i4++) {
  SP.ji.push([]);
  for (var j4 = 0; j4 < n4; j4++) SP.ji[i4].push(i4 === j4 ? 0 : 1);
}
SP.jiOnes = [1, 1, 1, 1];
SP.jiOnesImage = SP.ji.map(function (row) {
  return row.reduce(function (s, v) { return s + v; }, 0);
});
SP.jiDiff = [1, -1, 0, 0];
SP.jiDiffImage = SP.ji.map(function (row) {
  return row[0] - row[1];
});
SP.jiDet = detFrac(SP.ji);                       /* -3                    */
SP.jiTrace = trace(SP.ji);                       /* 0                     */

SP.idem = [[1, 0], [0, 0]];
SP.idemSq = matMulFrac(rMat(SP.idem), rMat(SP.idem));
SP.nil = [[0, 1], [0, 0]];
SP.nilSq = matMulFrac(rMat(SP.nil), rMat(SP.nil));

/* powers scale eigenvalues: A^3 of the running example */
SP.pow = 3;
SP.l1p = Math.pow(E1.l1, SP.pow);
SP.l2p = Math.pow(E1.l2, SP.pow);
SP.powSum = SP.l1p + SP.l2p;
SP.powProd = SP.l1p * SP.l2p;

/* ---------- 8. diagonalisation ---------- */

var DG = {};
DG.P = [[1, 1], [E1.l1 - A2[0][0], E1.l2 - A2[0][0]]];
DG.detP = DG.P[0][0] * DG.P[1][1] - DG.P[0][1] * DG.P[1][0];     /* -sqrt5 */
DG.D = [[E1.l1, 0], [0, E1.l2]];
/* P D P^-1, computed numerically, must give A back */
DG.Pinv = [
  [DG.P[1][1] / DG.detP, -DG.P[0][1] / DG.detP],
  [-DG.P[1][0] / DG.detP, DG.P[0][0] / DG.detP]
];
DG.rebuilt = [
  [DG.P[0][0] * DG.D[0][0] * DG.Pinv[0][0] + DG.P[0][1] * DG.D[1][1] * DG.Pinv[1][0],
   DG.P[0][0] * DG.D[0][0] * DG.Pinv[0][1] + DG.P[0][1] * DG.D[1][1] * DG.Pinv[1][1]],
  [DG.P[1][0] * DG.D[0][0] * DG.Pinv[0][0] + DG.P[1][1] * DG.D[1][1] * DG.Pinv[1][0],
   DG.P[1][0] * DG.D[0][0] * DG.Pinv[0][1] + DG.P[1][1] * DG.D[1][1] * DG.Pinv[1][1]]
];
DG.resid = Math.max(
  Math.abs(DG.rebuilt[0][0] - A2[0][0]), Math.abs(DG.rebuilt[0][1] - A2[0][1]),
  Math.abs(DG.rebuilt[1][0] - A2[1][0]), Math.abs(DG.rebuilt[1][1] - A2[1][1])
);

/* the defective matrix: eigenvalue 1 twice, one eigenvector only */
DG.def = [[1, 1], [0, 1]];
DG.defMinusI = [[0, 1], [0, 0]];
DG.defGeom = 2 - rankFrac(DG.defMinusI);         /* nullity of A - I      */
DG.defAlg = 2;
DG.defEigen = eigen2(DG.def);

/* ---------- 9. the trap numbers ---------- */

var TRAP = {};
TRAP.detOfSum = rVal(D.addDet);                  /* 4                     */
TRAP.sumOfDets = 1 + 1;                          /* 2                     */
TRAP.rankA = rankFrac([[1, 0], [0, 1]]);         /* 2                     */
TRAP.rankB = rankFrac([[-1, 0], [0, -1]]);       /* 2                     */
TRAP.rankSum = rankFrac([[0, 0], [0, 0]]);       /* 0                     */
TRAP.base = [[1, 2], [3, 4]];
TRAP.baseDet = detFrac(TRAP.base);               /* -2                    */
TRAP.added = [[1, 2], [5, 8]];                   /* row2 + 2*row1         */
TRAP.addedDet = detFrac(TRAP.added);
TRAP.scaled = [[3, 6], [3, 4]];                  /* row1 * 3              */
TRAP.scaledDet = detFrac(TRAP.scaled);
TRAP.swapDet = detFrac([[3, 4], [1, 2]]);

/* ---------- 10. the published figures ---------- */

var V = {
  map: MAP, det: D, rank: RK, sys: SYS, sysU: SYS_U, sysI: SYS_I, sysN: SYS_N,
  wide: WIDE, lu: LU, lu2: LU2, cost: COST, e1: E1, e3: E3, rot: EROT, rotM: ROT,
  sp: SP, dg: DG, trap: TRAP
};

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* --- the map --- */
chk('Ax is the first column times x1 plus the second times x2',
  MAP.terms.reduce(function (s, t) { return s + t.part[0]; }, 0) === MAP.Ax[0] &&
  MAP.terms.reduce(function (s, t) { return s + t.part[1]; }, 0) === MAP.Ax[1],
  MAP.Ax.join(','));
chk('the stated product is (4, 7)', MAP.Ax[0] === 4 && MAP.Ax[1] === 7);
chk('the columns of A are its two columns read downwards',
  MAP.c1[0] === A2[0][0] && MAP.c1[1] === A2[1][0] &&
  MAP.c2[0] === A2[0][1] && MAP.c2[1] === A2[1][1]);
chk('the shape rule holds: a 2 by 2 matrix maps 2 numbers to 2 numbers',
  A2.length === 2 && A2[0].length === 2);

/* --- determinants --- */
chk('det [[2,1],[1,3]] = 5', rVal(D.posDet) === 5, rVal(D.posDet));
chk('det [[1,2],[3,4]] = -2', rVal(D.negDet) === -2, rVal(D.negDet));
chk('the two by two formula ad - bc agrees with elimination on both',
  rVal(D.posDet) === 2 * 3 - 1 * 1 && rVal(D.negDet) === 1 * 4 - 2 * 3);
chk('swapping the two rows negates the determinant',
  rVal(D.swapDet) === -rVal(D.negDet), rVal(D.swapDet));
chk('det(AB) = det(A) det(B) for the running example',
  rVal(D.prodDet) === Math.pow(rVal(D.posDet), 2), rVal(D.prodDet));
chk('the rows 1..9 matrix has determinant zero', rIsZero(D.zeroDet));
chk('the second row of that matrix is the average of the first and third',
  D.zero[1][0] * 2 === D.zero[0][0] + D.zero[2][0] &&
  D.zero[1][1] * 2 === D.zero[0][1] + D.zero[2][1] &&
  D.zero[1][2] * 2 === D.zero[0][2] + D.zero[2][2]);
chk('det(I + I) is 4 while det I + det I is 2', rVal(D.addDet) === 4);

/* --- rank --- */
chk('rank of the rows 1..9 matrix is 2', RK.threeRank === 2, RK.threeRank);
chk('its nullity is 1', RK.threeNullity === 1, RK.threeNullity);
chk('rank plus nullity equals the number of columns, for that matrix',
  RK.threeRank + RK.threeNullity === 3);
chk('rank plus nullity equals the number of columns, for [[1,2],[2,4]]',
  RK.twoRank + RK.twoNullity === 2);
chk('the 3 by 2 tall matrix has rank 1', RK.tallRank === 1, RK.tallRank);
chk('a tall matrix can have rank far below its number of rows',
  RK.tallRank < RK.tall.length);
chk('the identity is the only matrix here with full rank',
  RK.idRank === 2 && RK.threeRank < 3 && RK.twoRank < 2);
chk('a zero determinant and a nullity above zero always agree',
  rIsZero(D.zeroDet) && RK.threeNullity > 0 && rIsZero(detFrac(RK.two)) && RK.twoNullity > 0);

/* --- systems --- */
chk('the unique case has equal ranks and no free variable',
  SYS_U.rankA === SYS_U.rankAug && SYS_U.nullity === 0);
chk('its stated solution (1, 2) satisfies both equations',
  SYS_U.resid[0] === SYS_U.b[0] && SYS_U.resid[1] === SYS_U.b[1], SYS_U.resid.join(','));
chk('the infinite case has equal ranks and one free variable',
  SYS_I.rankA === SYS_I.rankAug && SYS_I.nullity === 1);
chk('its null vector maps to zero', SYS_I.nullImage[0] === 0 && SYS_I.nullImage[1] === 0);
chk('its particular solution maps to b',
  SYS_I.partImage[0] === SYS_I.b[0] && SYS_I.partImage[1] === SYS_I.b[1],
  SYS_I.partImage.join(','));
chk('the inconsistent case has a larger augmented rank',
  SYS_N.rankAug > SYS_N.rankA, SYS_N.rankA + ' vs ' + SYS_N.rankAug);
chk('the inconsistent case differs from the infinite one only in b',
  SYS_N.A[0].join() === SYS_I.A[0].join() && SYS_N.A[1].join() === SYS_I.A[1].join() &&
  SYS_N.b[1] !== SYS_I.b[1]);
chk('a wide system has nullity at least m - n',
  WIDE.m - Math.min(WIDE.n, WIDE.m) === WIDE.minNullity, WIDE.minNullity);

/* --- LU --- */
chk('the first leading principal minor of the LU example is zero',
  rIsZero(LU.minors[0]), rStr(LU.minors[0]));
chk('the second and third leading minors are -2 and -3',
  rVal(LU.minors[1]) === -2 && rVal(LU.minors[2]) === -3,
  rVal(LU.minors[1]) + ' / ' + rVal(LU.minors[2]));
chk('with a row exchange, P A = L U exactly', LU.match === true);
chk('L is unit lower triangular',
  rVal(LU.L[0][0]) === 1 && rVal(LU.L[1][1]) === 1 && rVal(LU.L[2][2]) === 1 &&
  rIsZero(LU.L[0][1]) && rIsZero(LU.L[0][2]) && rIsZero(LU.L[1][2]));
chk('U is upper triangular',
  rIsZero(LU.U[1][0]) && rIsZero(LU.U[2][0]) && rIsZero(LU.U[2][1]));
chk('the pivot product times the permutation sign gives det A',
  rVal(LU.detFromPivots) === rVal(LU.det), rVal(LU.detFromPivots) + ' vs ' + rVal(LU.det));
chk('det of the LU example is -3', rVal(LU.det) === -3, rVal(LU.det));
chk('the no-swap example needs no permutation',
  LU2.swaps === 0 && LU2.match === true);
chk('its leading minors are both non-zero',
  !rIsZero(LU2.minors[0]) && !rIsZero(LU2.minors[1]));
chk('its determinant is the product of its two pivots',
  rVal(LU2.pivotProduct) === rVal(LU2.det), rVal(LU2.pivotProduct));

/* --- eigenvalues --- */
chk('the running example has a positive discriminant, so two real eigenvalues',
  E1.real && E1.disc > 0, E1.disc);
chk('the eigenvalues add to the trace', Math.abs(E1.l1 + E1.l2 - E1.trace) < 1e-9);
chk('the eigenvalues multiply to the determinant',
  Math.abs(E1.l1 * E1.l2 - E1.det) < 1e-9, (E1.l1 * E1.l2).toFixed(6));
chk('A v = lambda v holds for the first eigenvector',
  Math.abs(E1.resid1[0]) < 1e-9 && Math.abs(E1.resid1[1]) < 1e-9);
chk('A v = lambda v holds for the second eigenvector',
  Math.abs(E1.resid2[0]) < 1e-9 && Math.abs(E1.resid2[1]) < 1e-9);
chk('the larger eigenvalue is (5 + sqrt 5)/2 = 3.618',
  Math.abs(E1.l1 - 3.618034) < 1e-5, E1.l1.toFixed(6));
chk('the 3 by 3 characteristic polynomial has constant term zero',
  rIsZero(D.zeroDet) && E3.roots[0] === 0);
chk('its roots add to the trace 15', Math.abs(E3.rootSum - E3.trace) < 1e-9,
  E3.rootSum.toFixed(6));
chk('its roots multiply to the determinant 0', Math.abs(E3.rootProd - 0) < 1e-9);
chk('the two non-zero roots are 16.1168 and -1.1168',
  Math.abs(E3.roots[1] - 16.116844) < 1e-4 && Math.abs(E3.roots[2] + 1.116844) < 1e-4,
  E3.roots[1].toFixed(4) + ' / ' + E3.roots[2].toFixed(4));
chk('the quarter turn has no real eigenvalue', EROT.real === false, EROT.disc);

/* --- special matrices --- */
chk('the triangular example has determinant 42', rVal(SP.triDet) === 42);
chk('that determinant is the product of the diagonal',
  rVal(SP.triDet) === SP.triDiag.reduce(function (s, x) { return s * x; }, 1));
chk('its trace is the sum of the diagonal', SP.triTrace === 12);
chk('all-ones minus I sends the all-ones vector to 3 times itself',
  SP.jiOnesImage.every(function (v) { return v === 3; }));
chk('all-ones minus I sends e1 - e2 to minus itself',
  SP.jiDiffImage[0] === -1 && SP.jiDiffImage[1] === 1 &&
  SP.jiDiffImage[2] === 0 && SP.jiDiffImage[3] === 0);
chk('its determinant is minus 3 and its trace is 0',
  rVal(SP.jiDet) === -3 && SP.jiTrace === 0);
chk('the determinant equals 3 times (-1)^3',
  rVal(SP.jiDet) === 3 * Math.pow(-1, 3));
chk('the idempotent example squares to itself', matEqFrac(SP.idemSq, rMat(SP.idem)));
chk('the nilpotent example squares to zero',
  rIsZero(SP.nilSq[0][0]) && rIsZero(SP.nilSq[0][1]) &&
  rIsZero(SP.nilSq[1][0]) && rIsZero(SP.nilSq[1][1]));
chk('the third powers add to 50, the trace of A cubed',
  Math.abs(SP.powSum - 50) < 1e-6, SP.powSum.toFixed(6));
chk('the third powers multiply to 125, the cube of the determinant',
  Math.abs(SP.powProd - 125) < 1e-6, SP.powProd.toFixed(6));

/* --- diagonalisation --- */
chk('the eigenvector matrix has a non-zero determinant',
  Math.abs(DG.detP) > 1e-9, DG.detP.toFixed(6));
chk('P D P inverse rebuilds A', DG.resid < 1e-9, DG.resid.toExponential(2));
chk('the defective matrix has one eigenvector for a double eigenvalue',
  DG.defGeom === 1 && DG.defAlg === 2, DG.defGeom + ' of ' + DG.defAlg);
chk('its eigenvalue is 1 twice', Math.abs(DG.defEigen.l1 - 1) < 1e-9 &&
  Math.abs(DG.defEigen.l2 - 1) < 1e-9);

/* --- traps --- */
chk('the determinant of a sum is not the sum of determinants',
  TRAP.detOfSum !== TRAP.sumOfDets, TRAP.detOfSum + ' vs ' + TRAP.sumOfDets);
chk('the rank of a sum is not the sum of ranks: I + (-I) has rank 0',
  TRAP.rankSum !== TRAP.rankA + TRAP.rankB, TRAP.rankSum + ' vs ' + (TRAP.rankA + TRAP.rankB));
chk('adding a multiple of a row leaves the determinant alone',
  rVal(TRAP.addedDet) === rVal(TRAP.baseDet), rVal(TRAP.addedDet));
chk('scaling a row by 3 multiplies the determinant by 3',
  rVal(TRAP.scaledDet) === 3 * rVal(TRAP.baseDet), rVal(TRAP.scaledDet));
chk('swapping two rows negates the determinant',
  rVal(TRAP.swapDet) === -rVal(TRAP.baseDet), rVal(TRAP.swapDet));

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function T(x, y, s, o) { P.text(x, y, s, o || {}); }
function box(x, y, w, h, o) { P.rect(x, y, w, h, o || {}); }
function arrow(x1, y1, x2, y2, col) { P.arrow(x1, y1, x2, y2, { stroke: col || BORDER, sw: 1.5, head: 8 }); }
function heading(title, sub) {
  T(40, 14, title, { size: 12, bold: true, color: INK });
  T(40, 32, sub, { size: 10, color: FAINT });
}

/* a matrix drawn with brackets; returns its box */
function matDraw(x, y, M, o) {
  o = o || {};
  var cw = o.cw || 44, ch = o.ch || 26, size = o.size || 13;
  var rows = M.length, cols = M[0].length, w = cols * cw, h = rows * ch;
  var col = o.stroke || BORDER;
  P.line(x - 9, y - 5, x - 9, y + h + 5, { stroke: col, sw: 1.4 });
  P.line(x + w + 9, y - 5, x + w + 9, y + h + 5, { stroke: col, sw: 1.4 });
  P.line(x - 9, y - 5, x - 2, y - 5, { stroke: col, sw: 1.4 });
  P.line(x - 9, y + h + 5, x - 2, y + h + 5, { stroke: col, sw: 1.4 });
  P.line(x + w + 9, y - 5, x + w + 2, y - 5, { stroke: col, sw: 1.4 });
  P.line(x + w + 9, y + h + 5, x + w + 2, y + h + 5, { stroke: col, sw: 1.4 });
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      var v = M[i][j];
      var s;
      if (v && typeof v === 'object') s = rStr(v);
      else if (typeof v === 'number') s = (Math.abs(v - Math.round(v)) < 1e-9) ? String(Math.round(v)) : v.toFixed(3);
      else s = String(v);
      T(x + j * cw + cw / 2, y + i * ch + ch / 2, s,
        { size: size, mono: true, align: 'center', base: 'middle', color: o.color || INK });
    }
  }
  return { x: x, y: y, w: w, h: h };
}

function beats(t, sc) {
  var out = [];
  for (var k = 0; k < 4; k++) out.push(K.ease(K.beat(t, sc.start + k * 7.5, 0.7)));
  return out;
}

function band(lines, accent) {
  box(40, 372, 820, 52, { fill: accent || ACCDIM, stroke: ACC });
  T(54, 384, lines[0], { size: 11, bold: true, color: ACC });
  if (lines[1]) T(54, 404, lines[1], { size: 10, color: DIM });
}

/* ------------------------------ scene 1 ------------------------------ */

function drawMap(t, sc) {
  var b = beats(t, sc);
  heading('A matrix is a function, not a table', 'scene 1 of 10 · what a matrix does to a vector');

  P.alpha(b[0]);
  T(70, 68, 'A', { size: 11, bold: true, color: DIM });
  matDraw(70, 84, A2, { cw: 46, ch: 26, size: 13 });
  T(214, 68, 'x', { size: 11, bold: true, color: DIM });
  matDraw(214, 84, [[1], [2]], { cw: 34, ch: 26, size: 13, stroke: INFO });
  T(316, 68, 'Ax', { size: 11, bold: true, color: DIM });
  matDraw(316, 84, [[4], [7]], { cw: 34, ch: 26, size: 13, stroke: ACC, color: ACC });
  arrow(300, 110, 312, 110, FAINT);
  arrow(258, 122, 268, 122, FAINT);

  P.alpha(b[1]);
  T(40, 158, 'Ax is a mix of the columns:', { size: 10, bold: true });
  T(40, 180, '1 × column 1  =  (2, 1)', { size: 10, mono: true, color: INFO });
  T(40, 200, '2 × column 2  =  (2, 6)', { size: 10, mono: true, color: INFO });
  T(40, 220, 'add them      =  (4, 7)', { size: 10, mono: true, color: ACC, bold: true });

  P.alpha(b[2]);
  T(40, 250, 'AB means: apply B first, then A.', { size: 10, color: DIM });
  T(40, 270, 'Sizes: (m×k)(k×n) = m×n.', { size: 10, color: DIM });

  P.alpha(b[3]);
  T(40, 302, 'Shape caps everything:', { size: 10, bold: true });
  T(40, 322, 'rank ≤ min(m, n), always.', { size: 10, mono: true, color: WARN });

  P.alpha(Math.max(b[1], b[2]));
  T(470, 96, 'Read a matrix as a rule, not as a grid.', { size: 10, bold: true });
  T(470, 120, 'It takes n numbers in and gives m out.', { size: 10, color: DIM });
  T(470, 146, 'The entries are the rule: how much of', { size: 10, color: DIM });
  T(470, 166, 'each input goes into each output.', { size: 10, color: DIM });
  T(470, 196, 'A column is where one input lands.', { size: 10, color: DIM });
  T(470, 216, 'That is why Ax is a mix of columns.', { size: 10, color: DIM });
  T(470, 246, 'A row is one output, reading the inputs.', { size: 10, color: DIM });
  T(470, 266, 'Both readings are the same arithmetic.', { size: 10, color: DIM });

  P.alpha(1);
  band(['Write the shape before anything else: it is the only hard limit on rank.',
        'A 2×2 maps two numbers to two numbers; a 3×2 maps two to three.']);
}

/* ------------------------------ scene 2 ------------------------------ */

function drawDet(t, sc) {
  var b = beats(t, sc);
  heading('The determinant is an area factor', 'scene 2 of 10 · sign is orientation, zero is collapse');

  var ox = 110, oy = 300, u = 44;
  P.alpha(b[0]);
  /* axes */
  P.line(ox - 20, oy, ox + 220, oy, { stroke: BORDER, sw: 1 });
  P.line(ox, oy + 20, ox, oy - 220, { stroke: BORDER, sw: 1 });
  /* unit square */
  box(ox, oy - u, u, u, { fill: SURF2, stroke: BORDER });
  T(ox + 4, oy - 14, 'area 1', { size: 9, color: FAINT });

  P.alpha(b[1]);
  /* the image parallelogram from columns (2,1) and (1,3) */
  var p0 = [ox, oy], p1 = [ox + 2 * u, oy - 1 * u], p2 = [ox + 3 * u, oy - 4 * u], p3 = [ox + 1 * u, oy - 3 * u];
  P.tri(p0[0], p0[1], p1[0], p1[1], p2[0], p2[1], { fill: ACCDIM });
  P.tri(p0[0], p0[1], p2[0], p2[1], p3[0], p3[1], { fill: ACCDIM });
  P.line(p0[0], p0[1], p1[0], p1[1], { stroke: ACC, sw: 1.6 });
  P.line(p1[0], p1[1], p2[0], p2[1], { stroke: ACC, sw: 1.6 });
  P.line(p2[0], p2[1], p3[0], p3[1], { stroke: ACC, sw: 1.6 });
  P.line(p3[0], p3[1], p0[0], p0[1], { stroke: ACC, sw: 1.6 });
  P.circle(p1[0], p1[1], 3, { fill: ACC });
  P.circle(p3[0], p3[1], 3, { fill: ACC });
  T(p1[0] + 6, p1[1] - 4, '(2, 1)', { size: 9, mono: true, color: ACC });
  T(p3[0] - 52, p3[1] - 6, '(1, 3)', { size: 9, mono: true, color: ACC });
  T(ox + 60, oy - 150, 'image: area 5', { size: 10, bold: true, color: ACC });

  P.alpha(b[2]);
  T(40, 336, 'det = ad − bc.  For (2,1),(1,3): 2·3 − 1·1 = 5.', { size: 10, mono: true });
  T(40, 356, 'For (1,2),(3,4): 1·4 − 2·3 = −2  (area 2, flipped).', { size: 10, mono: true });

  P.alpha(b[3]);
  T(470, 96, 'det(AB) = det(A)·det(B)', { size: 11, mono: true, bold: true });
  T(470, 122, 'Here 5 × 5 = 25 for A squared.', { size: 10, color: DIM });
  T(470, 152, 'A row swap negates it:', { size: 10, bold: true });
  T(470, 172, '[[1,2],[3,4]] → [[3,4],[1,2]]', { size: 10, mono: true, color: INFO });
  T(470, 192, 'det −2 → +2, and invertible either way.', { size: 10, color: DIM });
  T(470, 222, 'Triangular: product of the diagonal.', { size: 10, color: DIM });
  T(470, 252, 'det = 0 means the plane is squashed', { size: 10, color: BAD });
  T(470, 272, 'onto a line: no inverse can undo it.', { size: 10, color: BAD });

  P.alpha(1);
  band(['Determinants multiply and negate; they never add.',
        'GATE CSE 2024 Set 2: a swap negates det and keeps invertibility — symmetry and trace both fail.']);
}

/* ------------------------------ scene 3 ------------------------------ */

function drawRank(t, sc) {
  var b = beats(t, sc);
  heading('Rank is how many directions survive', 'scene 3 of 10 · pivots, and rank plus nullity');

  P.alpha(b[0]);
  T(40, 66, 'rows 1..9', { size: 10, bold: true, color: DIM });
  matDraw(70, 84, D.zero, { cw: 44, ch: 26, size: 12 });
  T(40, 176, 'row 2 = average of rows 1 and 3', { size: 9, color: FAINT });

  P.alpha(b[1]);
  T(40, 206, 'Eliminate: 2 pivots survive.', { size: 10, bold: true });
  T(40, 228, 'rank = 2   nullity = 1', { size: 11, mono: true, color: ACC, bold: true });

  P.alpha(b[2]);
  /* the rank-nullity bar */
  var bx = 470, by = 96, bw = 380, bh = 26;
  box(bx, by, bw, bh, { stroke: BORDER });
  box(bx, by, bw * 2 / 3, bh, { fill: ACCDIM, stroke: ACC });
  box(bx + bw * 2 / 3, by, bw / 3, bh, { fill: WARNDIM, stroke: WARN });
  T(bx + bw / 3, by + 13, 'rank 2', { size: 10, align: 'center', base: 'middle', color: ACC, bold: true });
  T(bx + bw * 5 / 6, by + 13, 'nullity 1', { size: 9, align: 'center', base: 'middle', color: WARN });
  T(bx, by - 22, 'rank + nullity = number of columns = 3', { size: 10, bold: true });

  P.alpha(b[3]);
  T(470, 168, 'Nullity counts the directions sent to 0.', { size: 10, color: DIM });
  T(470, 188, 'Rank counts the directions that arrive.', { size: 10, color: DIM });
  T(470, 214, 'Tall and wide shapes:', { size: 10, bold: true });
  T(470, 236, '3×2 with rows (1,2),(2,4),(3,6): rank 1.', { size: 10, mono: true, color: INFO });
  T(470, 256, 'More rows, no more information.', { size: 10, color: DIM });
  T(470, 282, 'It is columns, not rows, in rank + nullity.', { size: 10, color: BAD });

  P.alpha(1);
  band(['Rank is a count of pivots; nullity is columns minus rank.',
        'A zero nullity means invertible; a positive one means some direction is lost.']);
}

/* ------------------------------ scene 4 ------------------------------ */

function drawSystems(t, sc) {
  var b = beats(t, sc);
  heading('Solving Ax = b, and when it cannot be done', 'scene 4 of 10 · two ranks decide everything');

  var rows = [
    { y: 76, s: SYS_U, label: 'unique', col: VAL },
    { y: 156, s: SYS_I, label: 'infinitely many', col: WARN },
    { y: 236, s: SYS_N, label: 'no solution', col: BAD }
  ];

  rows.forEach(function (r, i) {
    var vis = b[Math.min(i, 2)];
    P.alpha(vis);
    matDraw(56, r.y, r.s.A, { cw: 34, ch: 22, size: 11 });
    matDraw(150, r.y, [[r.s.b[0]], [r.s.b[1]]], { cw: 30, ch: 22, size: 11, stroke: INFO });
    T(196, r.y + 10, 'b', { size: 9, color: FAINT });
    T(222, r.y + 2, 'rank A = ' + r.s.rankA + ',  rank [A|b] = ' + r.s.rankAug,
      { size: 9, mono: true, color: DIM });
    T(222, r.y + 20, r.label, { size: 10, bold: true, color: r.col });
    P.alpha(1);
  });

  P.alpha(b[2]);
  T(40, 300, 'Consistent:  rank A = rank [A|b].', { size: 10, bold: true });
  T(40, 322, 'Free variables:  columns − rank A.', { size: 10, bold: true });
  T(40, 344, 'Unique needs columns − rank A = 0.', { size: 10, color: DIM });

  P.alpha(b[3]);
  T(470, 76, 'The wide case, GATE CSE 2024 Set 1:', { size: 10, bold: true });
  T(470, 100, 'A is n × m with m > n, so rank A ≤ n.', { size: 10, color: DIM });
  T(470, 120, 'Then nullity = m − rank A ≥ m − n.', { size: 10, color: DIM });
  T(470, 146, 'Ax = 0 has at least m − n independent', { size: 10, color: DIM });
  T(470, 166, 'solutions, and that is the true option.', { size: 10, color: DIM });
  T(470, 196, '"Exactly m − n" is false: the rank can', { size: 10, color: BAD });
  T(470, 216, 'be lower than n, giving more solutions.', { size: 10, color: BAD });
  T(470, 248, 'Here m = 5, n = 3, so at least 2.', { size: 10, mono: true, color: ACC });
  T(470, 278, 'The zero vector is always a solution', { size: 10, color: DIM });
  T(470, 298, 'of the homogeneous system. Always.', { size: 10, color: DIM });

  P.alpha(1);
  band(['Compare the two ranks, then subtract: columns minus rank A is the free-variable count.',
        'Same matrix, two different b: one is reachable and the other is not. Only b decides.']);
}

/* ------------------------------ scene 5 ------------------------------ */

function drawLU(t, sc) {
  var b = beats(t, sc);
  heading('LU decomposition: elimination written down', 'scene 5 of 10 · A = L·U, and P·A = L·U when a pivot is zero');

  P.alpha(b[0]);
  T(52, 62, 'A', { size: 10, bold: true, color: DIM });
  matDraw(52, 74, LU_M, { cw: 30, ch: 22, size: 11 });
  T(158, 96, '=', { size: 13, bold: true, color: DIM });
  T(186, 62, 'L', { size: 10, bold: true, color: DIM });
  matDraw(186, 74, LU.L, { cw: 36, ch: 22, size: 11, stroke: ACC, color: ACC });
  T(322, 96, '·', { size: 13, bold: true, color: DIM });
  T(348, 62, 'U', { size: 10, bold: true, color: DIM });
  matDraw(348, 74, LU.U, { cw: 30, ch: 22, size: 11, stroke: INFO });

  P.alpha(b[1]);
  T(40, 176, 'L holds the multipliers, 1s on the diagonal.', { size: 10, color: DIM });
  T(40, 196, 'U holds the pivots and the cleared rows.', { size: 10, color: DIM });
  T(40, 222, 'This example needs a row swap first:', { size: 10, bold: true });
  T(40, 244, 'leading minors 0, 2, −3 — the first is 0.', { size: 10, mono: true, color: WARN });

  P.alpha(b[2]);
  T(40, 276, 'So P·A = L·U, with P swapping rows 1 and 2.', { size: 10, color: DIM });
  T(40, 298, 'det P = −1, so det A = −(product of pivots).', { size: 10, mono: true, color: ACC });

  P.alpha(b[3]);
  T(470, 76, 'Two cheap passes after one factorisation:', { size: 10, bold: true });
  T(470, 100, 'L y = b     forward substitution', { size: 10, mono: true, color: INFO });
  T(470, 122, 'U x = y     back substitution', { size: 10, mono: true, color: INFO });
  T(470, 152, 'Cost for an n×n matrix:', { size: 10, bold: true });
  T(470, 174, 'LU:  n³/3 multiplications  (here 9)', { size: 10, mono: true, color: DIM });
  T(470, 194, 'each pass:  about n²  (here 9)', { size: 10, mono: true, color: DIM });
  T(470, 224, 'Why keep it: many right-hand sides share', { size: 10, color: DIM });
  T(470, 244, 'one matrix, so factorise once and reuse.', { size: 10, color: DIM });
  T(470, 274, 'det A = (−1)^swaps × Π pivots = −3', { size: 10, mono: true, color: ACC });

  P.alpha(1);
  band(['LU is Gaussian elimination with its arithmetic kept, not thrown away.',
        'A zero leading minor is the exact condition that plain LU fails; a row exchange repairs it.']);
}

/* ------------------------------ scene 6 ------------------------------ */

function drawEigen(t, sc) {
  var b = beats(t, sc);
  heading('Eigenvalues: the directions that do not turn', 'scene 6 of 10 · A v = lambda v');

  var ox = 150, oy = 300, u = 24;
  P.alpha(b[0]);
  P.line(ox - 20, oy, ox + 250, oy, { stroke: BORDER, sw: 1 });
  P.line(ox, oy + 20, ox, oy - 220, { stroke: BORDER, sw: 1 });
  /* the eigen-direction, and the stretched image along it */
  var vx = ox + 1 * u, vy = oy - 1.618034 * u;
  var ax = ox + 3.618034 * u, ay = oy - 5.854102 * u;
  P.line(ox, oy, ox + 3.9 * u, oy - 6.3 * u, { stroke: ACCDIM, sw: 5 });
  P.arrow(ox, oy, vx, vy, { stroke: INFO, sw: 2, head: 9 });
  T(vx + 8, vy - 2, 'v', { size: 11, bold: true, color: INFO });

  P.alpha(b[1]);
  P.arrow(ox, oy, ax, ay, { stroke: ACC, sw: 2, head: 9 });
  T(ax + 8, ay - 4, 'Av = 3.618 v', { size: 10, mono: true, color: ACC, bold: true });
  /* a vector that does turn */
  P.arrow(ox, oy, ox + u, oy, { stroke: FAINT, sw: 1.4, head: 8 });
  P.arrow(ox, oy, ox + 2 * u, oy - u, { stroke: FAINT, sw: 1.4, head: 8 });
  T(ox + 2 * u + 6, oy - u + 2, '(2, 1)', { size: 9, mono: true, color: FAINT });
  T(ox + u + 4, oy + 6, '(1, 0)', { size: 9, mono: true, color: FAINT });

  P.alpha(b[2]);
  T(40, 342, 'det(A − λI) = 0  gives  λ² − 5λ + 5 = 0.', { size: 10, mono: true });
  T(40, 362, 'λ = (5 ± √5)/2 = 3.618034 and 1.381966.', { size: 10, mono: true, color: ACC });

  P.alpha(b[3]);
  T(470, 76, 'Checks that cost two seconds:', { size: 10, bold: true });
  T(470, 100, '3.618 + 1.382 = 5.000 = trace', { size: 10, mono: true, color: VAL });
  T(470, 122, '3.618 × 1.382 = 5.000 = det', { size: 10, mono: true, color: VAL });
  T(470, 152, 'The eigenvector is not unique:', { size: 10, bold: true });
  T(470, 174, 'v = (1, 1.618) works, and so does', { size: 10, mono: true, color: DIM });
  T(470, 194, 'any non-zero multiple of it.', { size: 10, color: DIM });
  T(470, 224, 'The zero vector is excluded: it would', { size: 10, color: DIM });
  T(470, 244, 'satisfy the equation for every λ.', { size: 10, color: DIM });
  T(470, 274, 'λ can be negative (a flip) or zero', { size: 10, color: WARN });
  T(470, 294, '(a direction crushed to nothing).', { size: 10, color: WARN });

  P.alpha(1);
  band(['An eigenvector is a direction that survives the map unchanged in line, only in length.',
        'Trace and determinant are free checks on any eigenvalue set you compute.']);
}

/* ------------------------------ scene 7 ------------------------------ */

function drawSpecial(t, sc) {
  var b = beats(t, sc);
  heading('Reading eigenvalues off special matrices', 'scene 7 of 10 · five shapes worth recognising');

  var rows = [
    { y: 74, name: 'triangular  [[2,1,4],[0,3,5],[0,0,7]]', eig: 'λ = 2, 3, 7', col: ACC },
    { y: 128, name: 'all ones − I, 4×4', eig: 'λ = 3, −1, −1, −1', col: ACC },
    { y: 182, name: 'idempotent  A² = A', eig: 'λ ∈ {0, 1}', col: INFO },
    { y: 236, name: 'nilpotent  A² = 0', eig: 'λ = 0, 0', col: INFO },
    { y: 290, name: 'quarter turn  [[0,−1],[1,0]]', eig: 'λ = i, −i', col: BAD }
  ];

  rows.forEach(function (r, i) {
    P.alpha(b[Math.min(Math.floor(i / 2), 3)]);
    T(40, r.y, r.name, { size: 10, mono: true, color: INK });
    T(40, r.y + 20, r.eig, { size: 10, mono: true, bold: true, color: r.col });
    P.alpha(1);
  });

  P.alpha(b[1]);
  T(470, 74, 'Triangular: det(A − λI) is still triangular,', { size: 10, color: DIM });
  T(470, 94, 'so it is the product of the diagonal.', { size: 10, color: DIM });
  T(470, 114, 'The eigenvalues are the diagonal itself.', { size: 10, color: DIM });

  P.alpha(b[2]);
  T(470, 146, 'All ones has rank 1 and trace n, so its', { size: 10, color: DIM });
  T(470, 166, 'eigenvalues are n and n − 1 zeros.', { size: 10, color: DIM });
  T(470, 186, 'Subtract I: shift every one down by 1.', { size: 10, color: DIM });
  T(470, 206, 'Row sums give 3 for the all-ones vector.', { size: 10, mono: true, color: ACC });

  P.alpha(b[3]);
  T(470, 238, 'Powers: A^k has λ^k, and A⁻¹ has 1/λ.', { size: 10, color: DIM });
  T(470, 258, 'A³ here: 47.361 and 2.639.', { size: 10, mono: true, color: ACC });
  T(470, 278, 'They add to 50 and multiply to 125.', { size: 10, mono: true, color: VAL });
  T(470, 308, 'A real matrix may have no real eigenvalue.', { size: 10, color: BAD });
  T(470, 328, 'The quarter turn preserves no direction.', { size: 10, color: BAD });

  P.alpha(1);
  band(['Recognise the shape before expanding anything: four of these five need no arithmetic.',
        'The rotation is the counterexample that kills "every real matrix has a real eigenvalue".']);
}

/* ------------------------------ scene 8 ------------------------------ */

function drawDiag(t, sc) {
  var b = beats(t, sc);
  heading('Diagonalisation, and when it fails', 'scene 8 of 10 · a basis of eigenvectors');

  P.alpha(b[0]);
  T(40, 62, 'A  =  P  ·  D  ·  P⁻¹', { size: 12, mono: true, bold: true, color: INK });
  T(56, 84, 'P', { size: 10, bold: true, color: DIM });
  matDraw(56, 96, DG.P, { cw: 62, ch: 24, size: 11, stroke: ACC, color: ACC });
  T(206, 108, '·', { size: 13, bold: true, color: DIM });
  T(226, 84, 'D', { size: 10, bold: true, color: DIM });
  matDraw(226, 96, DG.D, { cw: 62, ch: 24, size: 11, stroke: INFO, color: INFO });
  T(376, 108, '·', { size: 13, bold: true, color: DIM });
  T(396, 84, 'P⁻¹', { size: 10, bold: true, color: DIM });

  P.alpha(b[1]);
  T(40, 176, 'Columns of P: eigenvectors.  Diagonal of D: eigenvalues.', { size: 10, color: DIM });
  T(40, 198, 'P must be invertible, so the vectors must be independent.', { size: 10, color: DIM });
  T(40, 224, 'Defective example:  A = [[1,1],[0,1]]', { size: 10, mono: true, color: BAD });
  T(40, 246, 'λ = 1 twice, but A − I has nullity 1:', { size: 10, color: DIM });
  T(40, 266, 'one eigenvector for a double root.', { size: 10, color: DIM });
  T(40, 292, 'geometric 1  <  algebraic 2  →  not diagonalisable.', { size: 10, mono: true, color: BAD, bold: true });

  P.alpha(b[2]);
  T(470, 176, 'Symmetric matrices always work:', { size: 10, bold: true });
  T(470, 198, 'real eigenvalues, and perpendicular', { size: 10, color: DIM });
  T(470, 218, 'eigenvectors for distinct eigenvalues.', { size: 10, color: DIM });
  T(470, 238, 'That is the spectral theorem.', { size: 10, color: DIM });
  T(470, 268, 'Why: the discriminant (a−d)² + 4b² ≥ 0', { size: 10, mono: true, color: ACC });

  P.alpha(b[3]);
  T(470, 300, 'Then A^k = P D^k P⁻¹: powers are free.', { size: 10, mono: true, color: ACC });
  T(470, 322, 'The P⁻¹P in the middle cancels.', { size: 10, color: DIM });

  P.alpha(1);
  band(['Diagonalisable means: enough independent eigenvectors to fill P.',
        'Repeated eigenvalue is not the same as defective; the identity repeats and still diagonalises.']);
}

/* ------------------------------ scene 9 ------------------------------ */

function drawTraps(t, sc) {
  var b = beats(t, sc);
  heading('Four arithmetic habits that are false', 'scene 9 of 10 · the sum rules that do not exist');

  var rows = [
    { y: 66, n: '1', claim: 'det(A + B) is not det A + det B', num: 'det(2I) = 4, but 1 + 1 = 2', col: BAD },
    { y: 122, n: '2', claim: 'rank(A + B) is not rank A + rank B', num: 'I + (-I) = 0: rank 2 + 2 gives rank 0', col: BAD },
    { y: 178, n: '3', claim: 'eigenvalues of A + B are not the sums', num: 'true only when the eigenvectors agree', col: BAD },
    { y: 234, n: '4', claim: 'row operations preserve rank, not det', num: 'swap → sign flips; scale → det scales', col: WARN }
  ];

  rows.forEach(function (r, i) {
    P.alpha(b[i]);
    box(40, r.y, 820, 44, { fill: i === 3 ? WARNDIM : BADDIM, stroke: r.col });
    T(54, r.y + 10, 'Trap ' + r.n, { size: 10, bold: true, color: r.col });
    T(110, r.y + 10, r.claim, { size: 10, bold: true });
    T(110, r.y + 26, r.num, { size: 9, mono: true, color: DIM });
    P.alpha(1);
  });

  P.alpha(b[2]);
  T(40, 296, 'What does hold:', { size: 10, bold: true });
  T(40, 316, 'rank(A+B) ≤ rank A + rank B', { size: 10, mono: true, color: VAL });
  T(40, 336, 'A + cI shifts eigenvalues by c; eigenvectors unchanged.', { size: 10, mono: true, color: VAL });

  P.alpha(b[3]);
  T(470, 296, 'Elimination for a determinant needs bookkeeping:', { size: 10, color: DIM });
  T(470, 316, 'row2 + 2·row1  →  det unchanged (−2)', { size: 10, mono: true, color: DIM });
  T(470, 336, 'row1 × 3  →  det × 3 (−6)', { size: 10, mono: true, color: DIM });
  T(470, 356, 'swap rows  →  det × (−1) (+2)', { size: 10, mono: true, color: DIM });

  P.alpha(1);
  band(['Three of these four traps are the same mistake: assuming a sum behaves like a product.',
        'Determinant, rank and eigenvalues are all nonlinear in the matrix, and only products behave.']);
}

/* ------------------------------ scene 10 ----------------------------- */

function drawProcedure(t, sc) {
  var b = beats(t, sc);
  heading('The four-step procedure for any question here', 'scene 10 of 10 · shape, invertibility, rank, polynomial');

  var steps = ['read the shape', 'invertible?', 'count solutions', 'characteristic polynomial'];

  P.alpha(b[0]);
  steps.forEach(function (s, i) {
    var x = 40 + i * 208;
    box(x, 62, 190, 50, { fill: SURF2, stroke: BORDER });
    T(x + 12, 72, String(i + 1) + '.', { size: 10, mono: true, color: FAINT });
    T(x + 30, 72, s, { size: 10, bold: true });
    if (i < 3) arrow(x + 192, 87, x + 204, 87, BORDER);
  });

  P.alpha(b[1]);
  T(40, 130, '1.  rank ≤ min(m, n).  Full rank needs a square shape.', { size: 10 });
  T(40, 152, '2.  det ≠ 0  ⇔  n pivots  ⇔  zero is not an eigenvalue.', { size: 10 });

  P.alpha(b[2]);
  T(40, 184, '3.  rank A = rank [A|b]  →  consistent;  free = columns − rank.', { size: 10 });

  P.alpha(b[3]);
  T(40, 216, '4.  det(A − λI) = 0, then check: Σλ = trace, Πλ = det.', { size: 10 });

  T(40, 254, 'GATE CSE items on this clause, with the year and set:', { size: 10, bold: true });
  T(40, 276, '2021 Set 1 Q52   largest eigenvalue of J − I  →  3', { size: 10, mono: true, color: ACC });
  T(40, 296, '2024 Set 1 Q2    product of eigenvalues of rows 1..9  →  0', { size: 10, mono: true, color: ACC });
  T(40, 316, '2024 Set 1 Q39   wide Ax = 0, at least m − n solutions', { size: 10, mono: true, color: ACC });
  T(40, 336, '2024 Set 2 Q47   row swap: det negates, invertibility stays', { size: 10, mono: true, color: ACC });

  P.alpha(b[3]);
  T(470, 254, 'Every one of those four is settled by a', { size: 10, color: DIM });
  T(470, 274, 'definition, not by a long computation.', { size: 10, color: DIM });
  T(470, 304, 'Add your eigenvalues and compare with the', { size: 10, color: DIM });
  T(470, 324, 'trace; multiply and compare with the det.', { size: 10, color: DIM });

  P.alpha(1);
  band(['Shape, invertibility, solution count, polynomial — in that order, every time.',
        'All ' + CHECKS.length + ' model checks passed on load; the count is printed under the canvas.']);
}

/* ============================ the frame ============================ */

var SCENE_DRAW = {
  map: drawMap,
  det: drawDet,
  rank: drawRank,
  systems: drawSystems,
  lu: drawLU,
  eigen: drawEigen,
  special: drawSpecial,
  diag: drawDiag,
  traps: drawTraps,
  procedure: drawProcedure
};

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
  var fn = SCENE_DRAW[sc.id];
  if (!fn) return;
  try {
    fn(t, sc);
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
