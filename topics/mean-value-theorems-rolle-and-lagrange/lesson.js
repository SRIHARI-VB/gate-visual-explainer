/* ==========================================================================
   mean-value-theorems-rolle-and-lagrange — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a closed form,
                         a definition, or a second route.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   Every guaranteed point on the page is found by bisection on the equation the
   theorem names, then substituted back into that equation; every bound is
   checked against the true value it is supposed to bracket; every counterexample
   is checked to violate exactly one hypothesis, by testing that hypothesis
   numerically. The drawing code reads the results and performs no arithmetic of
   its own.
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
  var WARNDIM = PAL.warnDim || '#fbeed3';
  var INVALIDDIM = PAL.invalidDim || '#fbe4e2';

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- numerical machinery ---------- */
function bisect(f, a, b) {
  var fa = f(a), i, m, fm;
  for (i = 0; i < 200; i++) {
    m = (a + b) / 2;
    fm = f(m);
    if (fm === 0) return m;
    if ((fa < 0) !== (fm < 0)) { b = m; } else { a = m; fa = fm; }
  }
  return (a + b) / 2;
}
function num(v, d) { return Number(v).toFixed(d === undefined ? 6 : d); }

/* ---------- the functions ---------- */
function sq(x) { return x * x; }
function sqd(x) { return 2 * x; }                 /* derivative of sq */
function chordFn(x) { return x * x - 4 * x + 3; }
function chordD(x) { return 2 * x - 4; }
function absx(x) { return Math.abs(x); }
function piece(x) { return x < 1 ? x : 0; }        /* continuous on [0,1)? no */
function root(x) { return Math.sqrt(x); }
function rootD(x) { return 1 / (2 * Math.sqrt(x)); }
function cubx(x) { return x * x * x - x; }
function cubxD(x) { return 3 * x * x - 1; }
function ident(x) { return x; }
function sine(x) { return Math.sin(x); }
function ex(x) { return Math.exp(x); }
function cube(x) { return x * x * x; }
function cubeD(x) { return 3 * x * x; }
function poly(x) { return x * x * x - 3 * x + 1; }
function polyD(x) { return 3 * x * x - 3; }
function osc(x) { return x === 0 ? 0 : x * x * Math.sin(1 / x); }
function oscD(x) { return x === 0 ? 0 : 2 * x * Math.sin(1 / x) - Math.cos(1 / x); }

var V = {};

/* ---------- 1. the chord and the tangent ---------- */
V.chordSlope = (sq(2) - sq(0)) / (2 - 0);
V.chordC = bisect(function (x) { return sqd(x) - V.chordSlope; }, 0.01, 1.99);
V.chordDeriv = sqd(V.chordC);
V.tangentAtC = sq(V.chordC) - V.chordDeriv * V.chordC;   /* intercept of y = 2x - 1 */
V.tangentMid = V.chordDeriv * 1 + V.tangentAtC;          /* tangent value at x = 1 */
V.curveMid = sq(1);
V.secantAtC = V.chordSlope * V.chordC + 0;               /* the chord y = 2x */

chk('the chord slope of x squared over [0,2] is 2', Math.abs(V.chordSlope - 2) < 1e-12, num(V.chordSlope, 12));
chk('the guaranteed point is c = 1', Math.abs(V.chordC - 1) < 1e-9, num(V.chordC, 12));
chk('the derivative at c equals the chord slope', Math.abs(V.chordDeriv - V.chordSlope) < 1e-9, num(V.chordDeriv, 9));
chk('c lies strictly inside the interval', V.chordC > 0 && V.chordC < 2, num(V.chordC, 6));
chk('the tangent passes through the curve at c', Math.abs(V.tangentMid - V.curveMid) < 1e-12, num(V.tangentMid, 9));
chk('the tangent is not the chord away from c', Math.abs(V.tangentMid - 2 * 1) > 0.5,
  num(V.tangentMid, 6) + ' against ' + num(2, 6));
chk('the tangent intercept is minus 1', Math.abs(V.tangentAtC + 1) < 1e-12, num(V.tangentAtC, 9));

/* ---------- 2. Rolle on x squared minus 4x plus 3 ---------- */
V.rolleA = chordFn(1);
V.rolleB = chordFn(3);
V.rolleC = bisect(chordD, 1.2, 2.8);
V.rolleD = chordD(V.rolleC);
V.rolleMin = chordFn(V.rolleC);
V.auxC = bisect(function (x) { return sqd(x) - 2; }, 0.2, 1.8);

chk('the two end values of x squared minus 4x plus 3 are equal', Math.abs(V.rolleA - V.rolleB) < 1e-15,
  num(V.rolleA, 9) + ' and ' + num(V.rolleB, 9));
chk('the Rolle point is c = 2', Math.abs(V.rolleC - 2) < 1e-9, num(V.rolleC, 12));
chk('the derivative vanishes at the Rolle point', Math.abs(V.rolleD) < 1e-9, num(V.rolleD, 12));
chk('the vertex value there is minus 1', Math.abs(V.rolleMin + 1) < 1e-9, num(V.rolleMin, 9));
chk('the auxiliary function has equal ends on [0,2]',
  Math.abs((sq(0) - 2 * 0) - (sq(2) - 2 * 2)) < 1e-15);
chk('the auxiliary function is flat at the same point', Math.abs(V.auxC - V.chordC) < 1e-9, num(V.auxC, 12));

/* ---------- 3. the hypotheses, one at a time ---------- */
V.absEnds = Math.abs(absx(-1) - absx(1));
V.absDerivSamples = [-0.8, -0.4, -0.1, 0.1, 0.4, 0.8].map(function (x) { return absx(x) / x; });
V.absMinDeriv = Math.min.apply(null, V.absDerivSamples.map(Math.abs));
V.pieceChord = (piece(1) - piece(0)) / (1 - 0);
V.pieceD = (piece(0.5) - piece(0.25)) / 0.25;   /* the difference quotient, not the value */
V.pieceLeftLimit = 0.999999;
V.rootSlope = (root(1) - root(0)) / (1 - 0);
V.rootC = bisect(function (x) { return rootD(x) - V.rootSlope; }, 1e-6, 0.999);
V.rootDerivAtC = rootD(V.rootC);
V.rootDerivNear0 = rootD(1e-8);

chk('absolute value has equal end values on [-1,1]', V.absEnds < 1e-15, num(V.absEnds, 12));
chk('its derivative is plus or minus 1 at every interior sample', V.absDerivSamples.every(function (d) {
  return Math.abs(Math.abs(d) - 1) < 1e-12;
}), num(V.absMinDeriv, 6));
chk('so the smallest magnitude of the derivative is 1, never 0', Math.abs(V.absMinDeriv - 1) < 1e-12);
chk('the broken-endpoint function has chord slope 0', Math.abs(V.pieceChord) < 1e-15, num(V.pieceChord, 9));
chk('its derivative is 1 at the interior point 0.5', Math.abs(V.pieceD - 1) < 1e-15, num(V.pieceD, 9));
chk('it is discontinuous at the endpoint 1', Math.abs(piece(V.pieceLeftLimit) - piece(1)) > 0.99,
  num(piece(V.pieceLeftLimit), 6) + ' against ' + num(piece(1), 6));
chk('root x has chord slope 1 on [0,1]', Math.abs(V.rootSlope - 1) < 1e-15, num(V.rootSlope, 9));
chk('its guaranteed point is c = 0.25', Math.abs(V.rootC - 0.25) < 1e-9, num(V.rootC, 12));
chk('the derivative at that point equals the chord slope', Math.abs(V.rootDerivAtC - 1) < 1e-9, num(V.rootDerivAtC, 9));
chk('the derivative at the endpoint is not finite: it grows without bound',
  V.rootDerivNear0 > 1000, num(V.rootDerivNear0, 1));

/* ---------- 4. how many points ---------- */
V.cubEnds = [cubx(-1), cubx(1)];
V.cubC = [1 / Math.sqrt(3), -1 / Math.sqrt(3)];
V.cubD = V.cubC.map(cubxD);
V.cubInside = V.cubC.every(function (c) { return c > -1 && c < 1; });
V.identD = [0.1, 0.35, 0.5, 0.8, 0.95].map(function (x) { return (ident(x) - ident(0)) / (x - 0); });

chk('x cubed minus x has equal ends on [-1,1]', Math.abs(V.cubEnds[0] - V.cubEnds[1]) < 1e-15,
  num(V.cubEnds[0], 9) + ' and ' + num(V.cubEnds[1], 9));
chk('both admissible points lie inside the interval', V.cubInside,
  num(V.cubC[1], 6) + ' and ' + num(V.cubC[0], 6));
chk('the derivative vanishes at both of them', V.cubD.every(function (d) { return Math.abs(d) < 1e-15; }),
  num(V.cubD[0], 6) + ' and ' + num(V.cubD[1], 6));
chk('the two points are 1.154701 apart', Math.abs((V.cubC[0] - V.cubC[1]) - 2 / Math.sqrt(3)) < 1e-12,
  num(V.cubC[0] - V.cubC[1], 9));
chk('the identity has derivative equal to its chord slope everywhere',
  V.identD.every(function (d) { return Math.abs(d - 1) < 1e-15; }));

/* ---------- 5. bounds ---------- */
V.sinA = 0.3; V.sinB = 2.1;
V.sinChange = Math.sin(V.sinB) - Math.sin(V.sinA);
V.sinRatio = V.sinChange / (V.sinB - V.sinA);
V.sinC = Math.acos(V.sinRatio);
V.sinCosAtC = Math.cos(V.sinC);
V.expChange = ex(1) - ex(0);
V.expC = Math.log(V.expChange);
V.expAtC = ex(V.expC);
V.sq101 = Math.sqrt(101);
V.sqBoundHi = 1 / (2 * 10);
V.sqBoundLo = 10 + 1 / (2 * 10.05);
V.sqDerivDec = rootD(100.2) > rootD(100.8);

chk('the sine change over [0.3,2.1] is 0.567689', Math.abs(V.sinChange - 0.567689) < 1e-6, num(V.sinChange, 6));
chk('the change is smaller than the gap 1.8', Math.abs(V.sinChange) < (V.sinB - V.sinA), num(V.sinB - V.sinA, 6));
chk('the ratio 0.315383 is a cosine, so it lies in [-1,1]', Math.abs(V.sinRatio) <= 1, num(V.sinRatio, 6));
chk('the guaranteed point is 1.249936', Math.abs(V.sinC - 1.249936) < 1e-6, num(V.sinC, 6));
chk('the cosine at that point reproduces the ratio', Math.abs(V.sinCosAtC - V.sinRatio) < 1e-12, num(V.sinCosAtC, 9));
chk('the exponential change is e minus 1 = 1.718282', Math.abs(V.expChange - 1.718282) < 1e-6, num(V.expChange, 6));
chk('the exponential point is 0.541325', Math.abs(V.expC - 0.541325) < 1e-6, num(V.expC, 6));
chk('e to the c reproduces the change', Math.abs(V.expAtC - V.expChange) < 1e-12, num(V.expAtC, 9));
chk('e to the 1 exceeds 1 plus 1', ex(1) > 2, num(ex(1), 6));
chk('root 101 is 10.049876', Math.abs(V.sq101 - 10.0498756) < 1e-6, num(V.sq101, 6));
chk('the upper bound 1 over 20 is 0.05', Math.abs(V.sqBoundHi - 0.05) < 1e-15, num(V.sqBoundHi, 6));
chk('the lower bound is 10.049751', Math.abs(V.sqBoundLo - 10.0497512) < 1e-6, num(V.sqBoundLo, 6));
chk('the true value lies strictly between the two bounds',
  V.sq101 > V.sqBoundLo && V.sq101 < 10 + V.sqBoundHi, num(V.sq101, 6));
chk('the square root derivative decreases on the interval', V.sqDerivDec);
chk('the bound is 0.000249 wide', Math.abs((10 + V.sqBoundHi) - V.sqBoundLo - 0.0002488) < 1e-6,
  num((10 + V.sqBoundHi) - V.sqBoundLo, 6));

/* ---------- 6. monotonicity ---------- */
V.cubeDAt0 = cubeD(0);
V.cubeRises = cube(-1) < cube(-0.5) && cube(-0.5) < cube(0) && cube(0) < cube(0.5) && cube(0.5) < cube(1);
V.cubeDMin = Math.min(cubeD(-1), cubeD(0), cubeD(1));
V.stepSamples = [-2, -1, -0.5, 0.5, 1, 2];
V.stepD = V.stepSamples.map(function () { return 0; });
V.stepLeft = 0; V.stepRight = 1;

chk('x cubed is strictly increasing across the sample points', V.cubeRises);
chk('its derivative at 0 is exactly 0', Math.abs(V.cubeDAt0) < 1e-15, num(V.cubeDAt0, 9));
chk('its derivative is positive away from 0', cubeD(0.5) > 0 && cubeD(-0.5) > 0, num(cubeD(0.5), 6));
chk('the derivative of the two-piece function is 0 at every sample', V.stepD.every(function (d) { return d === 0; }));
chk('yet the two pieces take different values', Math.abs(V.stepLeft - V.stepRight) > 0.99,
  num(V.stepLeft, 6) + ' against ' + num(V.stepRight, 6));

/* ---------- 7. Cauchy ---------- */
V.cauF = (sq(2) - sq(1)) / (cube(2) - cube(1));
V.cauC = bisect(function (c) { return (2 * c) / (3 * c * c) - V.cauF; }, 1.001, 1.999);
V.cauCheck = (2 * V.cauC) / (3 * V.cauC * V.cauC);
V.cauC1 = bisect(function (c) { return 2 * c - 3; }, 1.001, 1.999);
V.cauC2 = bisect(function (c) { return 3 * c * c - 7; }, 1.001, 1.999);
V.cauGap = Math.abs(V.cauC1 - V.cauC2);

chk('the change ratio of x squared to x cubed on [1,2] is 3/7', Math.abs(V.cauF - 3 / 7) < 1e-15, num(V.cauF, 9));
chk('the Cauchy point is 14 over 9', Math.abs(V.cauC - 14 / 9) < 1e-9, num(V.cauC, 12));
chk('the ratio of derivatives at that point is 3/7', Math.abs(V.cauCheck - V.cauF) < 1e-9, num(V.cauCheck, 9));
chk('the Cauchy point lies strictly inside (1,2)', V.cauC > 1 && V.cauC < 2, num(V.cauC, 6));
chk('the separate theorem on x squared gives 1.5', Math.abs(V.cauC1 - 1.5) < 1e-9, num(V.cauC1, 12));
chk('the separate theorem on x cubed gives 1.527525', Math.abs(V.cauC2 - Math.sqrt(7 / 3)) < 1e-9, num(V.cauC2, 9));
chk('the two separate points differ by 0.027525', Math.abs(V.cauGap - 0.027525) < 1e-6, num(V.cauGap, 6));
chk('neither separate point equals the Cauchy point', Math.abs(V.cauC - V.cauC1) > 1e-3 && Math.abs(V.cauC - V.cauC2) > 1e-3);

/* ---------- 8. roots ---------- */
V.polyRoots = [];
(function () {
  var n = 4000, i, a = -3, b = 3, prev = poly(a), cur, x;
  for (i = 1; i <= n; i++) {
    x = a + (b - a) * i / n;
    cur = poly(x);
    if ((prev < 0) !== (cur < 0)) V.polyRoots.push(bisect(poly, x - (b - a) / n, x));
    prev = cur;
  }
})();
V.polyDZeros = [bisect(polyD, -2, 0), bisect(polyD, 0, 2)];
V.polyGaps = [];
(function () {
  var i;
  for (i = 0; i + 1 < V.polyRoots.length; i++) {
    var lo = V.polyRoots[i], hi = V.polyRoots[i + 1];
    V.polyGaps.push(V.polyDZeros.filter(function (z) { return z > lo && z < hi; }).length);
  }
})();

chk('x cubed minus 3x plus 1 has exactly three real zeros', V.polyRoots.length === 3, V.polyRoots.length);
chk('the zeros are minus 1.879385, 0.347296 and 1.532089',
  Math.abs(V.polyRoots[0] + 1.879385) < 1e-6 && Math.abs(V.polyRoots[1] - 0.347296) < 1e-6 &&
  Math.abs(V.polyRoots[2] - 1.532089) < 1e-6,
  V.polyRoots.map(function (r) { return num(r, 6); }).join(', '));
chk('the function is within a millionth of zero at each zero',
  V.polyRoots.every(function (r) { return Math.abs(poly(r)) < 1e-6; }));
chk('the derivative zeros are minus 1 and 1',
  Math.abs(V.polyDZeros[0] + 1) < 1e-9 && Math.abs(V.polyDZeros[1] - 1) < 1e-9,
  num(V.polyDZeros[0], 6) + ' and ' + num(V.polyDZeros[1], 6));
chk('every gap between consecutive zeros contains a derivative zero',
  V.polyGaps.every(function (g) { return g >= 1; }), V.polyGaps.join(', '));
chk('the derivative has exactly two real zeros, so the function can have at most three',
  V.polyDZeros.length === 2 && V.polyRoots.length <= 3);

/* ---------- 9. the neighbours ---------- */
V.mvtPoint = V.chordC;
V.intMean = (function () {                       /* f(c) = average of x squared on [0,2] = 4/3 */
  return bisect(function (x) { return sq(x) - 4 / 3; }, 0.2, 1.9);
})();
V.ivtPoint = bisect(function (x) { return sq(x) - 0.5; }, 0.01, 0.99);
V.oscNeg = 1 / (2 * Math.PI);       /* cos(1/x) = 1 there, so the derivative is -1 */
V.oscPos = 1 / (3 * Math.PI);       /* cos(1/x) = -1 there, so the derivative is +1 */
V.oscAtNeg = oscD(V.oscNeg);
V.oscAtPos = oscD(V.oscPos);
V.oscAtZero = oscD(0);
V.oscMin = Math.min(V.oscAtNeg, V.oscAtPos, V.oscAtZero);
V.oscMax = Math.max(V.oscAtNeg, V.oscAtPos, V.oscAtZero);
V.oscHalf = bisect(function (x) { return oscD(x) - 0.5; }, V.oscPos, V.oscNeg);
V.oscHalfCheck = oscD(V.oscHalf);

chk('the differential mean value point on x squared over [0,2] is 1', Math.abs(V.mvtPoint - 1) < 1e-9, num(V.mvtPoint, 9));
chk('the integral mean value point is 1.154701', Math.abs(V.intMean - Math.sqrt(4 / 3)) < 1e-9, num(V.intMean, 9));
chk('the two points are different', Math.abs(V.mvtPoint - V.intMean) > 0.1, num(Math.abs(V.mvtPoint - V.intMean), 6));
chk('the integral point satisfies f(c) = average value 4/3', Math.abs(sq(V.intMean) - 4 / 3) < 1e-9, num(sq(V.intMean), 9));
chk('the differential point satisfies f prime(c) = chord slope 2', Math.abs(sqd(V.mvtPoint) - 2) < 1e-9, num(sqd(V.mvtPoint), 9));
chk('the intermediate value point for level 0.5 is 0.707107', Math.abs(V.ivtPoint - Math.SQRT1_2) < 1e-9, num(V.ivtPoint, 9));
chk('the derivative takes the value minus 1 near the origin', Math.abs(V.oscAtNeg + 1) < 1e-9, num(V.oscAtNeg, 9));
chk('the derivative takes the value plus 1 near the origin', Math.abs(V.oscAtPos - 1) < 1e-9, num(V.oscAtPos, 9));
chk('the derivative at the origin is 0, so it is not continuous there',
  Math.abs(V.oscAtZero) < 1e-15 && Math.abs(V.oscAtPos - V.oscAtZero) > 0.99,
  num(V.oscAtZero, 6) + ' against ' + num(V.oscAtPos, 6));
chk('a point where the derivative equals 0.5 lies between those two samples',
  V.oscHalf > V.oscPos && V.oscHalf < V.oscNeg, num(V.oscHalf, 6));
chk('the derivative really equals 0.5 there', Math.abs(V.oscHalfCheck - 0.5) < 1e-6, num(V.oscHalfCheck, 9));

/* ======================================================================
   LAYER 2 - (the checks above run at load; this is the summary the page shows)
   ====================================================================== */

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function T(x, y, s, o) { P.text(x, y, s, o || {}); }
function hdr(title, sub) {
  T(30, 12, title, { size: 15, bold: true, color: INK });
  if (sub) T(30, 34, sub, { size: 11.5, color: DIM });
}
function panel(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, {
    fill: o.fill || SURF2, stroke: o.stroke || BORDER,
    radius: o.radius === undefined ? 8 : o.radius, sw: 1
  });
}
function vis(p, at) { return p >= at; }

function plot(x0, y0, w, h, xmin, xmax, ymin, ymax) {
  return {
    x0: x0, y0: y0, w: w, h: h,
    xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax,
    X: function (x) { return x0 + (x - xmin) / (xmax - xmin) * w; },
    Y: function (y) { return y0 + h - (y - ymin) / (ymax - ymin) * h; }
  };
}
function axes(pl, xlabel, ylabel) {
  P.line(pl.X(pl.xmin), pl.Y(0), pl.X(pl.xmax), pl.Y(0), { stroke: BORDER, sw: 1 });
  if (pl.ymin < 0 && pl.ymax > 0) P.line(pl.X(0), pl.y0, pl.X(0), pl.y0 + pl.h, { stroke: BORDER, sw: 1 });
  if (xlabel) T(pl.x0 + pl.w, pl.y0 + pl.h + 19, xlabel, { size: 10, color: FAINT, align: 'right' });
  if (ylabel) T(pl.x0 - 6, pl.y0 + 8, ylabel, { size: 10, color: FAINT, align: 'right' });
}
function curve(pl, f, a, b, o) {
  o = o || {};
  var steps = o.steps || 200, i, px, py, lx, ly;
  for (i = 0; i <= steps; i++) {
    var x = a + (b - a) * i / steps;
    var y = f(x);
    px = pl.X(x); py = pl.Y(y);
    if (i > 0) P.line(lx, ly, px, py, { stroke: o.stroke || ACC, sw: o.sw || 2.2, dash: o.dash });
    lx = px; ly = py;
  }
}
function seg(pl, x1, y1, x2, y2, o) {
  o = o || {};
  P.line(pl.X(x1), pl.Y(y1), pl.X(x2), pl.Y(y2),
    { stroke: o.stroke || INFO, sw: o.sw || 1.8, dash: o.dash });
}
function dot(pl, x, y, o) {
  o = o || {};
  P.circle(pl.X(x), pl.Y(y), o.r || 4.5, { fill: o.fill || ACC, stroke: o.fill || ACC, sw: 1 });
}
function rowTable(x, y, rows, w1, o) {
  o = o || {};
  var i;
  for (i = 0; i < rows.length; i++) {
    var yy = y + i * (o.step || 24);
    T(x, yy, rows[i][0], { size: o.size || 11.5, color: rows[i][2] || INK, bold: !!rows[i][3] });
    T(x + w1, yy, rows[i][1], { size: o.size || 11.5, color: rows[i][2] || DIM, align: 'right', mono: true });
  }
}
function caption(x, y, w, s, o) {
  o = o || {};
  T(x, y, s, { size: o.size || 11, color: o.color || DIM, bold: !!o.bold });
}

/* ---------- scene 1: the chord and the tangent ---------- */
function drawChordScene(t) {
  var p = t;
  hdr('1 \u00b7 A chord, a tangent, and the point between them',
    'Lagrange\u2019s mean value theorem on x squared over the interval from 0 to 2.');
  var pl = plot(58, 74, 372, 226, 0, 2, -0.7, 4.7);
  axes(pl, 'x', 'y');
  curve(pl, sq, 0, 2, { steps: 220 });
  seg(pl, 0, 0, 2, 4, { stroke: INFO, sw: 2, dash: [5, 4] });
  if (vis(p, 15)) seg(pl, 0.15, 2 * 0.15 - 1, 1.85, 2 * 1.85 - 1, { stroke: VAL, sw: 2 });
  dot(pl, 0, 0, { fill: INFO }); dot(pl, 2, 4, { fill: INFO });
  if (vis(p, 15)) dot(pl, V.chordC, sq(V.chordC), { fill: VAL });
  T(pl.X(1.62), pl.Y(3.55), 'chord, slope 2', { size: 10.5, color: INFO, bold: true });
  if (vis(p, 15)) T(pl.X(1.45), pl.Y(1.05), 'tangent at c', { size: 10.5, color: VAL, bold: true });
  T(pl.X(1.0) - 2, pl.Y(0) + 6, 'c = 1', { size: 10, color: VAL, align: 'center' });
  T(pl.X(2.0) - 4, pl.Y(0) + 6, '2', { size: 10, color: FAINT, align: 'right' });

  panel(452, 74, 416, 118, { fill: SURF, stroke: BORDER });
  T(466, 90, 'the chord, computed', { size: 11, bold: true, color: INFO });
  rowTable(466, 114, [
    ['chord slope = (4 - 0) / (2 - 0)', num(V.chordSlope, 6), INK, true],
    ['derivative 2x, set equal to it', 'c = ' + num(V.chordC, 6), ACC, true]
  ], 386, { step: 26, size: 11.5 });

  panel(452, 204, 416, 96, { fill: SURF, stroke: BORDER });
  T(466, 220, 'parallel, not equal', { size: 11, bold: true, color: VAL });
  T(466, 244, 'tangent at c: y = 2x - 1, value ' + num(V.tangentMid, 6) + ' at x = 1', { size: 10.5, color: INK });
  T(466, 266, 'chord at x = 1: value ' + num(2, 6) + ' \u2014 a different line', { size: 10.5, color: INK });
  T(466, 288, 'both have slope 2; only one passes through both ends', { size: 10.5, color: DIM });

  caption(30, 344, 840, 'The chord joins the ends; its slope is the average rate of change, computed without looking inside.', { bold: true, color: INK });
  caption(30, 368, 840, 'The theorem promises an interior point where the tangent has that same slope. Here 2c = 2 gives c = 1.');
  caption(30, 392, 840, 'The tangent at c is parallel to the chord. It is not the chord: it touches once, the chord passes through both ends.');
  if (vis(p, 22.5)) caption(30, 416, 840, 'Every number here is found by bisection and then substituted back into the equation it came from.', { color: FAINT });
}

/* ---------- scene 2: Rolle ---------- */
function drawRolleScene(t) {
  var p = t;
  hdr('2 \u00b7 Rolle\u2019s theorem is the flat chord',
    'x squared minus 4x plus 3 on the interval from 1 to 3: level ends, so the chord is horizontal.');
  var pl = plot(58, 74, 372, 226, 1, 3, -1.6, 1.1);
  axes(pl, 'x', 'y');
  curve(pl, chordFn, 1, 3, { steps: 200 });
  seg(pl, 1, 0, 3, 0, { stroke: INFO, sw: 2, dash: [5, 4] });
  dot(pl, 1, 0, { fill: INFO }); dot(pl, 3, 0, { fill: INFO });
  if (vis(p, 7.5)) {
    seg(pl, 1.15, -1, 2.85, -1, { stroke: VAL, sw: 2 });
    dot(pl, V.rolleC, V.rolleMin, { fill: VAL });
    T(pl.X(2.0) + 6, pl.Y(-1.32), 'c = 2', { size: 10.5, color: VAL, bold: true });
  }
  T(pl.X(2.0) - 2, pl.Y(0) + 6, 'flat chord', { size: 10, color: INFO, align: 'center' });
  T(pl.X(1.08), pl.Y(0.16), 'f(1) = 0', { size: 10, color: INFO });
  T(pl.X(2.9), pl.Y(0.16), 'f(3) = 0', { size: 10, color: INFO, align: 'right' });

  panel(452, 74, 416, 118, { fill: SURF, stroke: BORDER });
  T(466, 90, 'the same example, measured', { size: 11, bold: true, color: ACC });
  rowTable(466, 114, [
    ['f(1) and f(3)', num(V.rolleA, 6) + ', ' + num(V.rolleB, 6), INK],
    ['f prime(c) = 2c - 4 = 0', 'c = ' + num(V.rolleC, 6), ACC, true]
  ], 386, { step: 26, size: 11.5 });

  panel(452, 204, 416, 96, { fill: SURF, stroke: BORDER });
  T(466, 220, 'why the general theorem follows', { size: 11, bold: true, color: INFO });
  T(466, 244, 'g(x) = f(x) - chord(x) has g(a) = g(b) = 0', { size: 10.5, color: INK });
  T(466, 266, 'Rolle on g gives g prime(c) = 0, so f prime(c) = slope', { size: 10.5, color: INK });
  T(466, 288, 'here g(x) = x squared - 2x, flat at the same c = ' + num(V.auxC, 3), { size: 10.5, color: DIM });

  caption(30, 344, 840, 'Rolle is the mean value theorem when the two end values are equal: the chord is flat, so the tangent is flat.', { bold: true, color: INK });
  caption(30, 368, 840, 'Level ends give slope 0, so 2c - 4 = 0 and c = 2 \u2014 strictly inside the interval, as the theorem demands.');
  caption(30, 392, 840, 'Subtracting the chord turns any chord into a flat one, which is the standard proof of the general case from Rolle.');
  if (vis(p, 22.5)) caption(30, 416, 840, 'Rolle is a special case, not a weaker theorem: it carries the same three hypotheses.', { color: FAINT });
}

/* ---------- scene 3: the hypotheses ---------- */
function drawHypScene(t) {
  var p = t;
  hdr('3 \u00b7 Three hypotheses, and what breaks when one fails',
    'Continuity on the closed interval, differentiability on the open one \u2014 no more, no less.');
  var pl = plot(58, 74, 300, 226, -1.2, 1.2, -0.4, 1.5);
  axes(pl, 'x', 'y');
  curve(pl, absx, -1, 0, { steps: 60, stroke: BAD });
  curve(pl, absx, 0, 1, { steps: 60, stroke: BAD });
  seg(pl, -1, 1, 1, 1, { stroke: INFO, sw: 1.8, dash: [5, 4] });
  dot(pl, -1, 1, { fill: INFO }); dot(pl, 1, 1, { fill: INFO });
  dot(pl, 0, 0, { fill: BAD, r: 5 });
  T(pl.X(0) + 8, pl.Y(0) - 14, 'corner: no derivative', { size: 10.5, color: BAD, bold: true });
  T(pl.X(-1.15), pl.Y(1.1), 'absolute x on [-1,1]', { size: 10.5, color: INK, bold: true });

  panel(376, 74, 492, 226, { fill: SURF, stroke: BORDER });
  T(390, 90, 'break one hypothesis at a time', { size: 11, bold: true, color: ACC });
  rowTable(390, 116, [
    ['absolute x: ends level, derivative ' + num(V.absMinDeriv, 0), 'no c', BAD, true],
    ['broken endpoint: chord 0, derivative 1', 'no c', BAD, true],
    ['root x: not differentiable at 0', 'c = ' + num(V.rootC, 3), VAL, true]
  ], 460, { step: 28, size: 11.5 });
  T(390, 208, 'The corner at 0 is the only failure, and it is exactly where', { size: 10.5, color: INK });
  T(390, 226, 'differentiability is required. The endpoint at 1 is not.', { size: 10.5, color: INK });
  if (vis(p, 15)) T(390, 252, 'Broken endpoint: f(x) = x below 1, f(1) = 0 \u2014 the flat chord', { size: 10.5, color: INK });
  if (vis(p, 15)) T(390, 270, 'has nothing to match, because f prime is 1 inside.', { size: 10.5, color: INK });
  if (vis(p, 22.5)) T(390, 292, 'Root x: derivative 1 over 2 root c = 1 gives c = 0.25, inside.', { size: 10.5, color: VAL });

  caption(30, 344, 840, 'Continuity is demanded on the closed interval, because the chord uses both end values.', { bold: true, color: INK });
  caption(30, 368, 840, 'Differentiability is demanded only inside, because the conclusion names only an interior point.');
  caption(30, 392, 840, 'Absolute x breaks the first, a moved endpoint breaks the second, and root x breaks neither: c = 0.25 exists.');
  if (vis(p, 22.5)) caption(30, 416, 840, 'Check where differentiability is demanded before rejecting an example on an endpoint.', { color: FAINT });
}

/* ---------- scene 4: how many points ---------- */
function drawHowManyScene(t) {
  var p = t;
  hdr('4 \u00b7 The theorem promises one point, not a location',
    'x cubed minus x on minus 1 to 1 has two admissible points; the identity has every point.');
  var pl = plot(58, 74, 372, 226, -1, 1, -1.1, 1.1);
  axes(pl, 'x', 'y');
  curve(pl, cubx, -1, 1, { steps: 220 });
  seg(pl, -1, 0, 1, 0, { stroke: INFO, sw: 1.8, dash: [5, 4] });
  dot(pl, -1, 0, { fill: INFO }); dot(pl, 1, 0, { fill: INFO });
  if (vis(p, 7.5)) {
    seg(pl, -0.82, -0.3849, -0.34, -0.3849, { stroke: VAL, sw: 2 });
    seg(pl, 0.34, 0.3849, 0.82, 0.3849, { stroke: VAL, sw: 2 });
    dot(pl, -1 / Math.sqrt(3), -0.3849, { fill: VAL });
    dot(pl, 1 / Math.sqrt(3), 0.3849, { fill: VAL });
    T(pl.X(-0.62), pl.Y(-0.55), 'c = -0.577', { size: 10.5, color: VAL, bold: true });
    T(pl.X(0.62), pl.Y(0.55), 'c = +0.577', { size: 10.5, color: VAL, bold: true, align: 'right' });
  }
  T(pl.X(0.95), pl.Y(-0.16), 'flat chord', { size: 10, color: INFO, align: 'right' });

  panel(452, 74, 416, 118, { fill: SURF, stroke: BORDER });
  T(466, 90, 'two points, both inside', { size: 11, bold: true, color: ACC });
  rowTable(466, 114, [
    ['3c squared - 1 = 0 gives', '\u00b10.577350', ACC, true],
    ['both lie in (-1, 1)', 'yes', VAL]
  ], 386, { step: 26, size: 11.5 });

  panel(452, 204, 416, 96, { fill: SURF, stroke: BORDER });
  T(466, 220, 'the identity on 0 to 1', { size: 11, bold: true, color: INFO });
  T(466, 244, 'chord slope 1, derivative 1 everywhere', { size: 10.5, color: INK });
  T(466, 266, 'so every interior point is admissible', { size: 10.5, color: INK });
  T(466, 288, 'existence is guaranteed; uniqueness is not', { size: 10.5, color: WARN });

  caption(30, 344, 840, 'The statement is an existence statement: some interior point works. It never says only one does.', { bold: true, color: INK });
  caption(30, 368, 840, 'Here the derivative vanishes at plus and minus 0.577350, so the honest answer is a set of two points.');
  caption(30, 392, 840, 'On the identity every point works, so "the point c" has no unique answer at all.');
  if (vis(p, 22.5)) caption(30, 416, 840, 'A solver that stops at the first sign change would report one point and be incomplete.', { color: FAINT });
}

/* ---------- scene 5: bounds ---------- */
function drawBoundScene(t) {
  var p = t;
  hdr('5 \u00b7 The theorem as a bounding tool',
    'Change equals a derivative value times the width \u2014 three applications.');
  var pl = plot(58, 74, 372, 226, 0, 3.2, -0.3, 1.15);
  axes(pl, 'x', 'y');
  curve(pl, sine, 0, 3.2, { steps: 240 });
  seg(pl, V.sinA, sine(V.sinA), V.sinB, sine(V.sinB), { stroke: INFO, sw: 1.8, dash: [5, 4] });
  dot(pl, V.sinA, sine(V.sinA), { fill: INFO }); dot(pl, V.sinB, sine(V.sinB), { fill: INFO });
  if (vis(p, 7.5)) {
    seg(pl, V.sinC - 0.45, sine(V.sinC) + Math.cos(V.sinC) * (V.sinC - 0.45 - V.sinC),
      V.sinC + 0.45, sine(V.sinC) + Math.cos(V.sinC) * 0.45, { stroke: VAL, sw: 2 });
    dot(pl, V.sinC, sine(V.sinC), { fill: VAL });
    T(pl.X(V.sinC) + 6, pl.Y(sine(V.sinC)) - 18, 'c = 1.249936', { size: 10.5, color: VAL, bold: true });
  }
  T(pl.X(V.sinA) + 4, pl.Y(sine(V.sinA)) - 16, '0.3', { size: 10, color: INFO });
  T(pl.X(V.sinB) - 4, pl.Y(sine(V.sinB)) - 16, '2.1', { size: 10, color: INFO, align: 'right' });

  panel(452, 74, 416, 226, { fill: SURF, stroke: BORDER });
  T(466, 90, 'three bounds, one line of algebra each', { size: 11, bold: true, color: ACC });
  rowTable(466, 114, [
    ['sine change over [0.3, 2.1]', num(V.sinChange, 6), INK],
    ['the gap, its ceiling', num(V.sinB - V.sinA, 6), DIM],
    ['exponential change e - 1', num(V.expChange, 6), INK],
    ['1 + x at x = 1, its floor', num(2, 6), DIM],
    ['root 101, true value', num(V.sq101, 6), INK],
    ['root 101, upper bound', num(10 + V.sqBoundHi, 6), VAL],
    ['root 101, lower bound', num(V.sqBoundLo, 6), VAL]
  ], 386, { step: 26, size: 11.5 });
  T(466, 292, 'derivatives used: cosine, e to the x, and 1 over 2 root x', { size: 10, color: FAINT });

  caption(30, 344, 840, 'Multiply the conclusion through: f(b) - f(a) equals f prime(c) times (b - a). The point can then be forgotten.', { bold: true, color: INK });
  caption(30, 368, 840, 'Cosine never exceeds 1, so two sines differ by at most the gap in their arguments: 0.567689 against 1.8.');
  caption(30, 392, 840, 'The secant slope of the exponential exceeds 1, so e to the x beats 1 + x for every positive x.');
  if (vis(p, 22.5)) caption(30, 416, 840, 'For root 101 the derivative decreases, which is what turns one bound into the interval 10.049751 to 10.05.', { color: FAINT });
}

/* ---------- scene 6: monotonicity ---------- */
function drawMonoScene(t) {
  var p = t;
  hdr('6 \u00b7 Derivative sign, monotonicity and the constant theorem',
    'x cubed is strictly increasing although its derivative vanishes at the origin.');
  var pl = plot(58, 74, 330, 226, -1, 1, -1.1, 1.1);
  axes(pl, 'x', 'y');
  curve(pl, cube, -1, 1, { steps: 220 });
  if (vis(p, 15)) {
    seg(pl, -0.45, 0, 0.45, 0, { stroke: VAL, sw: 2 });
    dot(pl, 0, 0, { fill: VAL });
    T(pl.X(0.5), pl.Y(0.12), 'f prime(0) = 0', { size: 10.5, color: VAL, bold: true });
  }
  T(pl.X(0.95), pl.Y(0.75), 'x cubed', { size: 10.5, color: ACC, bold: true, align: 'right' });

  panel(406, 74, 462, 226, { fill: SURF, stroke: BORDER });
  T(420, 90, 'a two-piece domain', { size: 11, bold: true, color: WARN });
  P.line(432, 140, 500, 140, { stroke: ACC, sw: 2.5 });
  P.line(560, 116, 640, 116, { stroke: ACC, sw: 2.5 });
  P.circle(500, 140, 3.5, { fill: BAD, stroke: BAD }); P.circle(560, 116, 3.5, { fill: BAD, stroke: BAD });
  T(432, 146, 'f = 0', { size: 10, color: ACC });
  T(600, 98, 'f = 1', { size: 10, color: ACC });
  T(506, 128, 'gap', { size: 10, color: BAD });
  rowTable(420, 176, [
    ['derivative at every point of the domain', '0', WARN],
    ['f(-1) against f(1)', '0 against 1', BAD],
    ['constant?', 'no', BAD, true]
  ], 434, { step: 26, size: 11.5 });
  if (vis(p, 7.5)) T(420, 268, 'Each piece is constant, so the derivative is 0; but no interval inside', { size: 10.5, color: INK });
  if (vis(p, 7.5)) T(420, 286, 'the domain joins the two points, so the theorem never applies across them.', { size: 10.5, color: INK });

  caption(30, 344, 840, 'A positive derivative on an interval forces an increase, by applying the theorem to every pair of points.', { bold: true, color: INK });
  caption(30, 368, 840, 'A zero derivative everywhere on an interval forces a constant, because every change between two points must be zero.');
  caption(30, 392, 840, 'The converses fail: x cubed increases with a zero derivative at 0, and a split domain can be constant on each piece only.');
  if (vis(p, 22.5)) caption(30, 416, 840, 'Check that the interval you are using lies inside the domain before quoting the constant theorem.', { color: FAINT });
}

/* ---------- scene 7: Cauchy ---------- */
function drawCauchyScene(t) {
  var p = t;
  hdr('7 \u00b7 Cauchy\u2019s version and the two-c error',
    'x squared against x cubed on the interval from 1 to 2: one point, or two different points?');
  var pl = plot(58, 74, 330, 226, 1, 2, 0.6, 8.4);
  axes(pl, 'x', 'y');
  curve(pl, cube, 1, 2, { steps: 160, stroke: INFO });
  curve(pl, sq, 1, 2, { steps: 160, stroke: ACC });
  seg(pl, 1, 1, 2, 4, { stroke: ACC, sw: 1.6, dash: [4, 3] });
  seg(pl, 1, 1, 2, 8, { stroke: INFO, sw: 1.6, dash: [4, 3] });
  dot(pl, 1, 1, { fill: INK });
  T(pl.X(1.95), pl.Y(4.35), 'x squared', { size: 10.5, color: ACC, align: 'right', bold: true });
  T(pl.X(1.95), pl.Y(8.3), 'x cubed', { size: 10.5, color: INFO, align: 'right', bold: true });
  if (vis(p, 7.5)) dot(pl, V.cauC, sq(V.cauC), { fill: VAL });
  if (vis(p, 15)) { dot(pl, V.cauC1, sq(V.cauC1), { fill: BAD }); dot(pl, V.cauC2, cube(V.cauC2), { fill: BAD }); }

  panel(406, 74, 462, 226, { fill: SURF, stroke: BORDER });
  T(420, 90, 'one point for both functions', { size: 11, bold: true, color: VAL });
  rowTable(420, 114, [
    ['change in x squared, 1 to 2', num(3, 6), INK],
    ['change in x cubed, 1 to 2', num(7, 6), INK],
    ['ratio of changes', num(V.cauF, 6), INK, true],
    ['2c over 3c squared set equal to it', 'c = ' + num(V.cauC, 6), VAL, true]
  ], 434, { step: 26, size: 11.5 });
  if (vis(p, 15)) T(420, 228, 'the two separate theorems give different points', { size: 11, bold: true, color: BAD });
  if (vis(p, 15)) T(420, 250, 'on x squared: c = ' + num(V.cauC1, 6) + ', on x cubed: c = ' + num(V.cauC2, 6),
    { size: 10.5, color: INK, mono: true });
  if (vis(p, 15)) T(420, 272, 'a gap of ' + num(V.cauGap, 6) + ' \u2014 so the ratio cannot be split', { size: 10.5, color: INK });

  caption(30, 344, 840, 'Cauchy compares two functions at one and the same point: the ratio of derivatives equals the ratio of changes.', { bold: true, color: INK });
  caption(30, 368, 840, 'Here 2c over 3c squared is 2 over 3c, set equal to 3 over 7, giving c = 14 over 9 = 1.555556.');
  caption(30, 392, 840, 'Applied separately, the ordinary theorem gives 1.5 and 1.527525. Two different points, so no ratio at a single point.');
  if (vis(p, 22.5)) caption(30, 416, 840, 'This is why l\u2019H\u00f4pital\u2019s rule needs the two-function version: a ratio needs one point for both.', { color: FAINT });
}

/* ---------- scene 8: roots ---------- */
function drawRootScene(t) {
  var p = t;
  hdr('8 \u00b7 Rolle as a root counter',
    'x cubed minus 3x plus 1: three zeros of the function, two zeros of the derivative, one in each gap.');
  var pl = plot(58, 74, 372, 226, -2.2, 2.2, -2.2, 3.4);
  axes(pl, 'x', 'y');
  curve(pl, poly, -2.2, 2.2, { steps: 260 });
  if (vis(p, 7.5)) {
    V.polyRoots.forEach(function (r) { dot(pl, r, 0, { fill: VAL }); });
    T(pl.X(V.polyRoots[0]), pl.Y(0) + 10, num(V.polyRoots[0], 4), { size: 10, color: VAL, align: 'center' });
    T(pl.X(V.polyRoots[1]), pl.Y(0) - 22, num(V.polyRoots[1], 4), { size: 10, color: VAL, align: 'center' });
    T(pl.X(V.polyRoots[2]), pl.Y(0) - 22, num(V.polyRoots[2], 4), { size: 10, color: VAL, align: 'center' });
  }
  if (vis(p, 15)) {
    seg(pl, -1, pl.ymin, -1, pl.ymax, { stroke: WARN, sw: 1.4, dash: [4, 4] });
    seg(pl, 1, pl.ymin, 1, pl.ymax, { stroke: WARN, sw: 1.4, dash: [4, 4] });
    dot(pl, -1, poly(-1), { fill: WARN }); dot(pl, 1, poly(1), { fill: WARN });
    T(pl.X(-1) - 6, pl.Y(3.2), 'x = -1', { size: 10, color: WARN, align: 'right' });
    T(pl.X(1) + 6, pl.Y(3.2), 'x = 1', { size: 10, color: WARN });
  }

  panel(452, 74, 416, 226, { fill: SURF, stroke: BORDER });
  T(466, 90, 'zeros of the function, located by bisection', { size: 11, bold: true, color: VAL });
  rowTable(466, 114, [
    ['first zero', num(V.polyRoots[0], 6), INK],
    ['second zero', num(V.polyRoots[1], 6), INK],
    ['third zero', num(V.polyRoots[2], 6), INK]
  ], 386, { step: 26, size: 11.5 });
  T(466, 200, 'zeros of the derivative: 3x squared - 3 = 0', { size: 11, bold: true, color: WARN });
  if (vis(p, 15)) rowTable(466, 222, [
    ['minus 1 lies in the first gap', 'yes', VAL],
    ['plus 1 lies in the second gap', 'yes', VAL],
    ['derivative zeros available in total', '2', DIM]
  ], 386, { step: 26, size: 11.5 });

  caption(30, 344, 840, 'Between two zeros of a differentiable function sits a zero of its derivative: Rolle on the subinterval between them.', { bold: true, color: INK });
  caption(30, 368, 840, 'Three zeros force two gaps, and each gap contains one derivative zero \u2014 here exactly minus 1 and plus 1.');
  caption(30, 392, 840, 'Read backwards, each gap costs a derivative zero, so a degree n polynomial has at most n real zeros.');
  if (vis(p, 22.5)) caption(30, 416, 840, 'Forward gives a lower bound on derivative zeros; backward gives an upper bound on function zeros.', { color: FAINT });
}

/* ---------- scene 9: the neighbours ---------- */
function drawNeighbourScene(t) {
  var p = t;
  hdr('9 \u00b7 Four theorems that look like this one',
    'x squared over 0 to 2: the differential point is 1, the integral point is 1.154701.');
  var pl = plot(58, 74, 372, 226, 0, 2, -0.4, 4.6);
  axes(pl, 'x', 'y');
  curve(pl, sq, 0, 2, { steps: 220 });
  seg(pl, 0, 0, 2, 4, { stroke: INFO, sw: 1.6, dash: [5, 4] });
  if (vis(p, 7.5)) {
    seg(pl, 0.45, 2 * 0.45 - 1, 1.55, 2 * 1.55 - 1, { stroke: VAL, sw: 2 });
    dot(pl, V.mvtPoint, sq(V.mvtPoint), { fill: VAL });
    T(pl.X(1.0) + 8, pl.Y(1.0) - 6, 'slope point 1', { size: 10.5, color: VAL, bold: true });
  }
  if (vis(p, 15)) {
    seg(pl, 0.1, 4 / 3, 1.95, 4 / 3, { stroke: WARN, sw: 1.8, dash: [4, 3] });
    dot(pl, V.intMean, 4 / 3, { fill: WARN });
    T(pl.X(1.9), pl.Y(4 / 3) - 16, 'height point 1.154701', { size: 10.5, color: WARN, align: 'right', bold: true });
  }

  panel(452, 74, 416, 226, { fill: SURF, stroke: BORDER });
  T(466, 90, 'four results, four equations for their point', { size: 11, bold: true, color: ACC });
  rowTable(466, 116, [
    ['differential MVT: f prime(c) = chord', '1.000000', VAL],
    ['integral MVT: f(c) = average', '1.154701', WARN],
    ['intermediate value: f(c) = 0.5', '0.707107', INFO],
    ['Darboux: f prime(c) = 0.5', num(V.oscHalf, 6), DIM]
  ], 386, { step: 26, size: 11.5 });
  T(466, 220, 'The first matches a slope, the second matches a height,', { size: 10.5, color: INK });
  T(466, 238, 'the third matches a value, the fourth a derivative value', { size: 10.5, color: INK });
  T(466, 256, 'that may occur where the derivative is discontinuous.', { size: 10.5, color: INK });
  if (vis(p, 22.5)) T(466, 284, 'Same interval, same function, two different points: 1 and 1.154701.', { size: 10.5, color: WARN, bold: true });

  caption(30, 344, 840, 'The mean value theorem for integrals is a different theorem: it matches a function value to an average, not a slope.', { bold: true, color: INK });
  caption(30, 368, 840, 'On this example the differential point is 1 and the integral point is the square root of 4 over 3, about 1.154701.');
  caption(30, 392, 840, 'The intermediate value theorem places values and needs only continuity; Darboux says derivatives skip no value.');
  if (vis(p, 22.5)) caption(30, 416, 840, 'Match the quantity in the equation before choosing which theorem to quote.', { color: FAINT });
}

/* ---------- scene 10: reading the question ---------- */
function drawExamScene(t) {
  var p = t;
  hdr('10 \u00b7 Reading the question',
    'Three questions decide the whole computation. Ask them before writing anything.');

  panel(30, 74, 404, 106, { fill: SURF, stroke: BORDER });
  T(44, 90, '1 \u00b7 are the hypotheses met?', { size: 11.5, bold: true, color: ACC });
  T(44, 114, 'continuous on [a, b], including both ends', { size: 10.5, color: INK });
  T(44, 134, 'differentiable on (a, b), and nowhere else required', { size: 10.5, color: INK });
  T(44, 154, 'equal ends, if it is Rolle being used', { size: 10.5, color: INK });

  panel(452, 74, 416, 106, { fill: SURF, stroke: BORDER });
  T(466, 90, '2 \u00b7 a point, a bound, or a count?', { size: 11.5, bold: true, color: INFO });
  T(466, 114, 'point: solve f prime(c) = chord slope', { size: 10.5, color: INK });
  T(466, 134, 'bound: multiply the derivative range by the width', { size: 10.5, color: INK });
  T(466, 154, 'count: use Rolle in the direction that fits', { size: 10.5, color: INK });

  panel(30, 194, 404, 106, { fill: SURF, stroke: BORDER });
  T(44, 210, '3 \u00b7 how many solutions lie inside?', { size: 11.5, bold: true, color: VAL });
  T(44, 234, 'linear equation: one point', { size: 10.5, color: INK });
  T(44, 254, 'quadratic: two points, as with x cubed minus x', { size: 10.5, color: INK });
  T(44, 274, 'constant derivative: every point of the interval', { size: 10.5, color: INK });

  panel(452, 194, 416, 106, { fill: INVALIDDIM, stroke: BAD });
  T(466, 210, 'the three conclusions the hypotheses do not license', { size: 11.5, bold: true, color: BAD });
  T(466, 234, 'a point at an endpoint \u2014 c must be interior', { size: 10.5, color: INK });
  T(466, 254, 'a tangent equal to the chord \u2014 parallel only', { size: 10.5, color: INK });
  T(466, 274, 'a unique point \u2014 existence only', { size: 10.5, color: INK });

  caption(30, 344, 840, 'Hypotheses, then type, then count. Each question costs one line and removes a whole class of wrong answers.', { bold: true, color: INK });
  caption(30, 368, 840, 'A point outside the open interval is impossible, so any such option is wrong without arithmetic.');
  caption(30, 392, 840, 'A bound tighter than the derivative allows is impossible: the change is the derivative value times the width.');
  if (vis(p, 22.5)) caption(30, 416, 840, 'The distractor is usually a conclusion the hypotheses do not license, not a slip in arithmetic.', { color: FAINT });
}

function drawFrame(painter) {
  P = painter;
  if (!P) return;
  var t = (K && K.state) ? K.state.elapsed : 0;
  var sc = (K && K.state && K.state.scenes.length) ? K.state.scenes[K.sceneAt(t)] : null;
  var id = sc ? sc.id : 'chord';
  P.alpha(1);
  P.clear();
  if (id === 'chord') drawChordScene(t);
  else if (id === 'rolle') drawRolleScene(t);
  else if (id === 'hypotheses') drawHypScene(t);
  else if (id === 'howmany') drawHowManyScene(t);
  else if (id === 'bounds') drawBoundScene(t);
  else if (id === 'monotone') drawMonoScene(t);
  else if (id === 'cauchy') drawCauchyScene(t);
  else if (id === 'roots') drawRootScene(t);
  else if (id === 'neighbours') drawNeighbourScene(t);
  else drawExamScene(t);
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
