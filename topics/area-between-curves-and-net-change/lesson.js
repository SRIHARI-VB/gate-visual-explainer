/* ==========================================================================
   area-between-curves-and-net-change — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a closed form,
                         a definition, or a second route.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   Every integral on the page is evaluated twice: once by composite Simpson
   quadrature over the interval the question names, and once from the closed
   form that the antiderivative predicts. Crossings are found by bisection and
   then verified against the equation they came from. The drawing code reads the
   results and performs no arithmetic of its own.
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
function simpson(f, a, b, n) {
  n = n || 20000;
  if (n % 2) n += 1;
  var h = (b - a) / n, s = f(a) + f(b), i;
  for (i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
  return s * h / 3;
}

/* bisection on a bracket whose endpoints straddle a root */
function bisect(f, a, b) {
  var fa = f(a), i, m, fm;
  for (i = 0; i < 200; i++) {
    m = (a + b) / 2;
    fm = f(m);
    if (Math.abs(fm) < 1e-13 || (b - a) < 1e-15) return m;
    if ((fa < 0) !== (fm < 0)) { b = m; } else { a = m; fa = fm; }
  }
  return (a + b) / 2;
}

/* the error function, by its Maclaurin series, for the argument used here */
function erfSeries(x) {
  var term = x, sum = x, n;
  for (n = 1; n < 60; n++) {
    term *= -x * x / n;
    sum += term / (2 * n + 1);
  }
  return 2 / Math.sqrt(Math.PI) * sum;
}

/* ---------- the curves ---------- */
function f1(x) { return x * x - 2 * x; }        /* below the axis between 0 and 2 */
function line(x) { return x; }                   /* upper curve on [0,1] */
function par(x) { return x * x; }                /* lower curve on [0,1] */
function l2(x) { return 2 * x + 3; }             /* the line that beats the parabola */
function cub(x) { return x * x * x; }            /* odd, crosses the line at -1,0,1 */
function sqr(x) { return Math.sqrt(x); }         /* the branch that is an inverse */
function vel(t) { return t * t - 4 * t + 3; }    /* changes sign at 1 and 3 */
function sine(x) { return Math.sin(x); }
function rate(t) { return 2 + Math.sin(t); }

var LAM = 0.5;
function expD(x) { return LAM * Math.exp(-LAM * x); }
var Z = 1 / Math.sqrt(2 * Math.PI);
function bell(x) { return Z * Math.exp(-x * x / 2); }
function uniD(x) { return (x >= 0 && x <= 4) ? 0.25 : 0; }
function busy(t) { return (t >= 1 && t <= 2) ? 1 : 0; }

var V = {};

/* ---------- 1. signed against geometric ---------- */
V.f1roots = [0, bisect(f1, 1.2, 2.8)];
V.f1neg = simpson(f1, 0, 2);
V.f1pos = simpson(f1, 2, 3);
V.f1signed = simpson(f1, 0, 3);
V.f1geo = Math.abs(V.f1neg) + Math.abs(V.f1pos);
V.f1atOne = f1(1);

chk('f1 crosses the axis at 2', Math.abs(V.f1roots[1] - 2) < 1e-9, num(V.f1roots[1], 12));
chk('f1(0) = 0 at the other crossing', Math.abs(f1(0)) < 1e-15);
chk('f1 is negative at x = 1', V.f1atOne < 0, num(V.f1atOne, 6));
chk('f1 is positive at x = 2.5', f1(2.5) > 0);
chk('integral of f1 over [0,2] = -4/3', Math.abs(V.f1neg + 4 / 3) < 1e-6, num(V.f1neg, 9));
chk('integral of f1 over [2,3] = +4/3', Math.abs(V.f1pos - 4 / 3) < 1e-6, num(V.f1pos, 9));
chk('the two pieces add to the signed total', Math.abs(V.f1neg + V.f1pos - V.f1signed) < 1e-9, num(V.f1signed, 12));
chk('the signed integral over [0,3] is zero', Math.abs(V.f1signed) < 1e-9, num(V.f1signed, 12));
chk('the geometric area is 8/3', Math.abs(V.f1geo - 8 / 3) < 1e-6, num(V.f1geo, 9));
chk('geometric area exceeds the magnitude of the signed total', V.f1geo > Math.abs(V.f1signed) + 2, num(V.f1geo, 6));

/* ---------- 2. area between two curves ---------- */
V.between1 = simpson(function (x) { return line(x) - par(x); }, 0, 1);
V.between1closed = 1 / 6;
V.between2cross = [
  bisect(function (x) { return par(x) - l2(x); }, -2.5, 0),
  bisect(function (x) { return par(x) - l2(x); }, 1, 4)
];
V.between2 = simpson(function (x) { return l2(x) - par(x); }, -1, 3);
V.between2closed = 32 / 3;
V.between2route = simpson(l2, -1, 3) - simpson(par, -1, 3);

chk('line is above parabola at x = 0.5', line(0.5) > par(0.5));
chk('area between y = x and y = x squared is 1/6', Math.abs(V.between1 - V.between1closed) < 1e-9, num(V.between1, 9));
chk('the crossings of x squared and 2x+3 are -1 and 3',
  Math.abs(V.between2cross[0] + 1) < 1e-9 && Math.abs(V.between2cross[1] - 3) < 1e-9,
  num(V.between2cross[0], 9) + ' and ' + num(V.between2cross[1], 9));
chk('the line is above the parabola on the whole open interval',
  l2(-0.5) > par(-0.5) && l2(0) > par(0) && l2(2) > par(2));
chk('area between x squared and 2x+3 is 32/3', Math.abs(V.between2 - V.between2closed) < 1e-6, num(V.between2, 9));
chk('upper minus lower agrees with the difference of the two integrals',
  Math.abs(V.between2 - V.between2route) < 1e-9, num(V.between2route, 9));

/* ---------- 3. the two slicings ---------- */
V.cubeSigned = simpson(function (x) { return cub(x) - line(x); }, -1, 1);
V.cubeGeo = simpson(function (x) { return Math.abs(cub(x) - line(x)); }, -1, 1);
V.cubeHalf = simpson(function (x) { return line(x) - cub(x); }, 0, 1);
V.sliceVert = simpson(function (x) { return sqr(x) - par(x); }, 0, 1, 40000);
V.sliceHoriz = simpson(function (y) { return sqr(y) - par(y); }, 0, 1, 40000);

chk('y = x cubed and y = x cancel over [-1,1]', Math.abs(V.cubeSigned) < 1e-9, num(V.cubeSigned, 12));
chk('the enclosed area between them is 1/2', Math.abs(V.cubeGeo - 0.5) < 1e-6, num(V.cubeGeo, 9));
chk('the area is twice the piece above the axis', Math.abs(2 * V.cubeHalf - V.cubeGeo) < 1e-6, num(2 * V.cubeHalf, 9));
chk('vertical slicing of the sqrt region gives 1/3', Math.abs(V.sliceVert - 1 / 3) < 1e-6, num(V.sliceVert, 9));
chk('horizontal slicing of the same region gives 1/3', Math.abs(V.sliceHoriz - 1 / 3) < 1e-6, num(V.sliceHoriz, 9));
chk('the two slicings agree', Math.abs(V.sliceVert - V.sliceHoriz) < 1e-9, num(Math.abs(V.sliceVert - V.sliceHoriz), 12));
chk('the square root really is the inverse of squaring on this region',
  Math.abs(sqr(par(0.2)) - 0.2) < 1e-12 && Math.abs(sqr(par(0.75)) - 0.75) < 1e-12);
chk('the square root curve is above the parabola on (0,1)', sqr(0.25) > par(0.25));

/* ---------- 4. the accumulation function ---------- */
function accClosed(x) { return x * x * x / 3; }
V.accHs = [0.5, 0.1, 0.01, 0.001];
V.accQ = V.accHs.map(function (h) { return (accClosed(1 + h) - accClosed(1)) / h; });
V.accFquad = simpson(par, 0, 1);
V.accFclosed = accClosed(1);
V.accShift = (function () {
  var c = 7;
  return ((accClosed(1.1) + c) - (accClosed(1) + c)) / 0.1;
})();

chk('accumulated area to 1 equals 1/3 by quadrature', Math.abs(V.accFquad - V.accFclosed) < 1e-9, num(V.accFquad, 9));
chk('the quotient at h = 0.5 is 1.583333', Math.abs(V.accQ[0] - 1.583333333333333) < 1e-9, num(V.accQ[0], 9));
chk('the quotient at h = 0.1 is 1.103333', Math.abs(V.accQ[1] - 1.103333333333333) < 1e-9, num(V.accQ[1], 9));
chk('the quotient at h = 0.01 is 1.010033', Math.abs(V.accQ[2] - 1.010033333333333) < 1e-9, num(V.accQ[2], 9));
chk('the quotient at h = 0.001 is 1.001000', Math.abs(V.accQ[3] - 1.001000333333333) < 1e-9, num(V.accQ[3], 9));
chk('every quotient exceeds the integrand value 1', V.accQ.every(function (q) { return q > 1; }));
chk('a tenfold shrink of h shrinks the excess about tenfold once h is small',
  (V.accQ[1] - 1) / (V.accQ[2] - 1) > 10.0 && (V.accQ[1] - 1) / (V.accQ[2] - 1) < 10.6 &&
  (V.accQ[2] - 1) / (V.accQ[3] - 1) > 9.9 && (V.accQ[2] - 1) / (V.accQ[3] - 1) < 10.1,
  num((V.accQ[1] - 1) / (V.accQ[2] - 1), 3) + ' then ' + num((V.accQ[2] - 1) / (V.accQ[3] - 1), 3));
chk('at the largest step the h squared term is still significant',
  (V.accQ[0] - 1) / (V.accQ[1] - 1) < 6, num((V.accQ[0] - 1) / (V.accQ[1] - 1), 3));
chk('the excess is h + h squared over 3, exactly',
  V.accHs.every(function (h, i) { return Math.abs((V.accQ[i] - 1) - (h + h * h / 3)) < 1e-12; }));
chk('adding a constant leaves the quotient unchanged', Math.abs(V.accShift - V.accQ[1]) < 1e-12, num(V.accShift, 9));

/* ---------- 5. net change ---------- */
V.netP1 = simpson(vel, 0, 1);
V.netP2 = simpson(vel, 1, 3);
V.netP3 = simpson(vel, 3, 4);
V.netDisp = simpson(vel, 0, 4);
V.netDist = simpson(function (t) { return Math.abs(vel(t)); }, 0, 4);
V.netRoots = [bisect(vel, 0.2, 1.6), bisect(vel, 2.4, 3.8)];

chk('the velocity is zero at 1 and 3',
  Math.abs(V.netRoots[0] - 1) < 1e-9 && Math.abs(V.netRoots[1] - 3) < 1e-9,
  num(V.netRoots[0], 9) + ' and ' + num(V.netRoots[1], 9));
chk('the velocity is negative at t = 2', vel(2) < 0);
chk('the first piece is +4/3', Math.abs(V.netP1 - 4 / 3) < 1e-6, num(V.netP1, 9));
chk('the middle piece is -4/3', Math.abs(V.netP2 + 4 / 3) < 1e-6, num(V.netP2, 9));
chk('the last piece is +4/3', Math.abs(V.netP3 - 4 / 3) < 1e-6, num(V.netP3, 9));
chk('the displacement is 4/3', Math.abs(V.netDisp - 4 / 3) < 1e-6, num(V.netDisp, 9));
chk('the pieces add to the displacement', Math.abs(V.netP1 + V.netP2 + V.netP3 - V.netDisp) < 1e-9);
chk('the distance travelled is 4', Math.abs(V.netDist - 4) < 1e-6, num(V.netDist, 9));
chk('distance exceeds the magnitude of displacement',
  V.netDist > Math.abs(V.netDisp) + 2, num(V.netDist, 6));

/* ---------- 6. average value ---------- */
V.avgSin = simpson(sine, 0, Math.PI) / Math.PI;
V.avgClosed = 2 / Math.PI;
V.avgInt = simpson(sine, 0, Math.PI);
V.avgC1 = Math.asin(V.avgClosed);
V.avgC2 = Math.PI - V.avgC1;
V.avgRect = V.avgClosed * Math.PI;

chk('the integral of sine over 0 to pi is 2', Math.abs(V.avgInt - 2) < 1e-6, num(V.avgInt, 9));
chk('the average value is 2/pi', Math.abs(V.avgSin - V.avgClosed) < 1e-9, num(V.avgSin, 9));
chk('the average is not the midpoint height 1', Math.abs(V.avgSin - 1) > 0.3);
chk('the average is not the mean of the endpoint values', Math.abs(V.avgSin - 0) > 0.6);
chk('the average lies between the minimum and the maximum',
  V.avgSin > 0 && V.avgSin < 1);
chk('sine at the first point equals the average', Math.abs(sine(V.avgC1) - V.avgSin) < 1e-9, num(sine(V.avgC1), 9));
chk('sine at the second point equals the average', Math.abs(sine(V.avgC2) - V.avgSin) < 1e-9, num(sine(V.avgC2), 9));
chk('the two points are distinct', Math.abs(V.avgC2 - V.avgC1) > 1.5, num(V.avgC2 - V.avgC1, 6));
chk('the rectangle of that height has the area of the integral', Math.abs(V.avgRect - V.avgInt) < 1e-9, num(V.avgRect, 9));

/* ---------- 7. probability as area ---------- */
V.expP = simpson(expD, 1, 3);
V.expClosed = Math.exp(-LAM) - Math.exp(-3 * LAM);
V.expTotal = simpson(expD, 0, 200);
V.expP35 = simpson(expD, 3, 5);
V.expP15 = simpson(expD, 1, 5);
V.expMean = simpson(function (x) { return x * expD(x); }, 0, 200);
V.normP = simpson(bell, -1, 1);
V.normErf = erfSeries(1 / Math.SQRT2);
V.normTotal = simpson(bell, -9, 9);
V.normHalf = simpson(bell, 0, 1);
V.uniP = simpson(uniD, 1, 3);
V.uniTotal = simpson(uniD, 0, 4);
V.uniOutside = simpson(uniD, -3, -0.5) + simpson(uniD, 4.5, 9);
V.uniMean = simpson(function (x) { return x * uniD(x); }, 0, 4);

chk('the exponential density integrates to 1', Math.abs(V.expTotal - 1) < 1e-9, num(V.expTotal, 9));
chk('exponential probability between 1 and 3 is 0.383400', Math.abs(V.expP - V.expClosed) < 1e-9, num(V.expP, 9));
chk('that probability equals e^-0.5 minus e^-1.5', Math.abs(V.expClosed - 0.383400499564) < 1e-9, num(V.expClosed, 9));
chk('probabilities are additive over adjacent intervals',
  Math.abs(V.expP + V.expP35 - V.expP15) < 1e-9);
chk('the exponential mean is 1 over lambda', Math.abs(V.expMean - 2) < 1e-6, num(V.expMean, 9));
chk('the normal density integrates to 1', Math.abs(V.normTotal - 1) < 1e-9, num(V.normTotal, 9));
chk('normal probability between -1 and 1 is 0.682689', Math.abs(V.normP - V.normErf) < 1e-6, num(V.normP, 9));
chk('the normal area is symmetric about zero', Math.abs(V.normP - 2 * V.normHalf) < 1e-9);
chk('every probability lies between 0 and 1',
  V.expP > 0 && V.expP < 1 && V.normP > 0 && V.normP < 1 && V.uniP > 0 && V.uniP < 1);
chk('the uniform density integrates to 1 on its support', Math.abs(V.uniTotal - 1) < 1e-12, num(V.uniTotal, 9));
chk('the uniform density is zero outside its support',
  Math.abs(V.uniOutside) < 1e-15 && uniD(-1) === 0 && uniD(5) === 0, num(V.uniOutside, 12));
chk('uniform probability between 1 and 3 is one half', Math.abs(V.uniP - 0.5) < 1e-12, num(V.uniP, 9));
chk('the uniform mean is 2', Math.abs(V.uniMean - 2) < 1e-9, num(V.uniMean, 9));

/* ---------- 8. rate graphs ---------- */
V.rateTotal = simpson(rate, 0, 2 * Math.PI);
V.rateAvg = V.rateTotal / (2 * Math.PI);
V.rateHalf = simpson(rate, 0, Math.PI) / Math.PI;
/* the busy set is exactly the interval 1 to 2, so the fraction is 1 over 4;
   a coarse midpoint quadrature is checked against it rather than replacing it */
V.utilBusy = (2 - 1) / (4 - 0);
V.utilQuad = (function () {
  var n = 40000, h = 4 / n, s = 0, i;
  for (i = 0; i < n; i++) s += busy((i + 0.5) * h);
  return s * h / 4;
})();

chk('the total over one period is 4 pi', Math.abs(V.rateTotal - 4 * Math.PI) < 1e-6, num(V.rateTotal, 9));
chk('the average rate is exactly 2', Math.abs(V.rateAvg - 2) < 1e-9, num(V.rateAvg, 9));
chk('average times width reproduces the total', Math.abs(V.rateAvg * 2 * Math.PI - V.rateTotal) < 1e-9);
chk('a half period does not average the sine away', Math.abs(V.rateHalf - 2) > 0.6, num(V.rateHalf, 6));
chk('the busy fraction is one quarter', Math.abs(V.utilBusy - 0.25) < 1e-12, num(V.utilBusy, 9));
chk('midpoint quadrature of the indicator agrees with the exact fraction',
  Math.abs(V.utilQuad - V.utilBusy) < 1e-3, num(V.utilQuad, 6));

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
function num(v, d) { return Number(v).toFixed(d === undefined ? 6 : d); }
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
  if (pl.ymin < 0 && pl.ymax > 0) {
    P.line(pl.X(0), pl.y0, pl.X(0), pl.y0 + pl.h, { stroke: BORDER, sw: 1 });
  }
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
    if (i > 0) P.line(lx, ly, px, py, { stroke: o.stroke || ACC, sw: o.sw || 2.2 });
    lx = px; ly = py;
  }
}
/* fill between a curve and the axis, from a to b, as vertical strips */
function shade(pl, f, a, b, o) {
  o = o || {};
  var n = o.n || 80, i;
  P.alpha(o.alpha === undefined ? 0.18 : o.alpha);
  for (i = 0; i < n; i++) {
    var x1 = a + (b - a) * i / n, x2 = a + (b - a) * (i + 1) / n;
    var top = pl.Y(f((x1 + x2) / 2)), base = pl.Y(0);
    P.rect(pl.X(x1), Math.min(top, base), Math.max(1, pl.X(x2) - pl.X(x1)),
      Math.abs(base - top), { fill: o.fill || ACC, stroke: o.fill || ACC, radius: 0, sw: 0.5 });
  }
  P.alpha(1);
}
/* fill between an upper and a lower curve */
function shadeBetween(pl, fTop, fBot, a, b, o) {
  o = o || {};
  var n = o.n || 90, i;
  P.alpha(o.alpha === undefined ? 0.18 : o.alpha);
  for (i = 0; i < n; i++) {
    var x1 = a + (b - a) * i / n, x2 = a + (b - a) * (i + 1) / n, xm = (x1 + x2) / 2;
    var top = pl.Y(fTop(xm)), bot = pl.Y(fBot(xm));
    P.rect(pl.X(x1), Math.min(top, bot), Math.max(1, pl.X(x2) - pl.X(x1)),
      Math.abs(bot - top), { fill: o.fill || ACC, stroke: o.fill || ACC, radius: 0, sw: 0.5 });
  }
  P.alpha(1);
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

/* ---------- scene 1: signed against geometric ---------- */
function drawSignedScene(t) {
  var p = t;
  hdr('1 · Signed area is not geometric area',
    'x squared minus 2x on the interval from 0 to 3: two questions, two answers.');
  var pl = plot(58, 72, 396, 240, 0, 3, -1.5, 3.2);
  axes(pl, 'x', 'y');
  shade(pl, f1, 0, 2, { fill: BAD, alpha: 0.16 });
  if (vis(p, 7.5)) shade(pl, f1, 2, 3, { fill: ACC, alpha: 0.2 });
  curve(pl, f1, 0, 3, { steps: 220 });

  T(pl.X(0.9), pl.Y(-1.35), 'below the axis: 0 to 2', { size: 10.5, color: BAD, align: 'center', bold: true });
  if (vis(p, 7.5)) T(pl.X(2.62), pl.Y(2.0), 'above: 2 to 3', { size: 10.5, color: ACC, align: 'center', bold: true });
  T(pl.X(2.0), pl.Y(0) + 6, '2', { size: 10, color: FAINT, align: 'center' });
  T(pl.X(3.0) - 4, pl.Y(0) + 6, '3', { size: 10, color: FAINT, align: 'right' });
  T(pl.X(0.06), pl.Y(0) + 6, '0', { size: 10, color: FAINT });
  T(pl.X(2.9), pl.Y(2.55), 'y = x squared - 2x', { size: 10.5, color: ACC, align: 'right', bold: true });

  panel(486, 72, 382, 152, { fill: SURF, stroke: BORDER });
  T(500, 88, 'the same region, two questions', { size: 11, bold: true, color: ACC });
  rowTable(500, 112, [
    ['integral, 0 to 2 (below)', num(V.f1neg, 6), BAD],
    ['integral, 2 to 3 (above)', num(V.f1pos, 6), ACC],
    ['signed integral, 0 to 3', num(V.f1signed, 6), INK, true],
    ['geometric area, 0 to 3', num(V.f1geo, 6), INK, true]
  ], 300, { step: 26, size: 11.5 });

  panel(486, 236, 382, 96, { fill: INVALIDDIM, stroke: BAD });
  T(500, 252, 'a zero integral is not an empty region', { size: 11, bold: true, color: BAD });
  T(500, 276, 'minus 4/3 and plus 4/3 cancel exactly.', { size: 11, color: INK });
  T(500, 300, 'The area is 8/3 = ' + num(8 / 3, 6) + '.', { size: 11, color: INK });

  caption(30, 344, 840, 'The integrand is x times (x - 2), so it is zero at 0 and at 2 and negative between them.', { bold: true, color: INK });
  caption(30, 368, 840, 'Integrate each piece separately, then decide: add them with signs for the integral, add their magnitudes for the area.');
  caption(30, 392, 840, 'The words that decide which question is asked are "the integral of" against "the area enclosed by".');
  if (vis(p, 22.5)) caption(30, 416, 840, 'A strip above the axis contributes positively; a strip below contributes negatively. That is the definition, not a convention.', { color: FAINT });
}

/* ---------- scene 2: area between two curves ---------- */
function drawBetweenScene(t) {
  var p = t - 30;
  hdr('2 · Area between two curves is one difference',
    'the strip height is upper minus lower; the crossings supply the limits.');

  var plA = plot(56, 78, 356, 208, 0, 1, 0, 1.1);
  axes(plA, 'x', 'y');
  shadeBetween(plA, line, par, 0, 1, { fill: ACC, alpha: 0.2 });
  curve(plA, line, 0, 1, { stroke: ACC });
  curve(plA, par, 0, 1, { stroke: INFO });
  T(plA.X(0.56), plA.Y(0.72), 'y = x', { size: 10.5, color: ACC, bold: true });
  T(plA.X(0.80), plA.Y(0.48), 'y = x squared', { size: 10.5, color: INFO, bold: true });
  T(plA.x0, plA.y0 + plA.h + 34, 'crossings at 0 and 1, so the limits are 0 and 1', { size: 10.5, color: DIM });
  T(plA.x0, plA.y0 + plA.h + 54, 'area = 1/6 = ' + num(V.between1, 6), { size: 12, color: INK, bold: true });

  var plB = plot(504, 78, 356, 208, -1.6, 3.6, -1, 10);
  axes(plB, 'x', 'y');
  shadeBetween(plB, l2, par, -1, 3, { fill: ACC, alpha: 0.16 });
  curve(plB, par, -1.6, 3.6, { stroke: INFO });
  curve(plB, l2, -1.6, 3.6, { stroke: ACC });
  T(plB.X(2.35), plB.Y(8.2), 'y = 2x + 3', { size: 10.5, color: ACC, bold: true });
  T(plB.X(-1.35), plB.Y(4.2), 'y = x squared', { size: 10.5, color: INFO, bold: true });
  P.circle(plB.X(-1), plB.Y(1), 3.4, { fill: BAD });
  P.circle(plB.X(3), plB.Y(9), 3.4, { fill: BAD });
  T(plB.X(-1) - 8, plB.Y(1) - 16, '-1', { size: 10, color: BAD, align: 'right' });
  T(plB.X(3), plB.Y(9) - 16, '3', { size: 10, color: BAD, align: 'center' });
  T(plB.x0, plB.y0 + plB.h + 34, 'crossings found by solving x squared = 2x + 3', { size: 10.5, color: DIM });
  T(plB.x0, plB.y0 + plB.h + 54, 'area = 32/3 = ' + num(V.between2, 6), { size: 12, color: INK, bold: true });

  if (vis(p, 7.5)) {
    caption(30, 396, 840, 'Each strip runs from the lower curve to the upper one, so its height is the difference of the two functions and its width is dx.', { color: INK });
  }
  if (vis(p, 15)) {
    caption(30, 418, 840, 'The crossings are the limits. They are computed from the curves, not read off the question.');
  }
}

/* ---------- scene 3: the two slicings ---------- */
function drawSlicingScene(t) {
  var p = t - 60;
  hdr('3 · Choose the variable, then check the answer did not change',
    'the region between y = x squared and y = the square root of x on 0 to 1.');

  var plA = plot(56, 78, 350, 206, 0, 1, 0, 1.1);
  axes(plA, 'x', 'y');
  shadeBetween(plA, sqr, par, 0, 1, { fill: ACC, alpha: 0.2 });
  curve(plA, sqr, 0, 1, { stroke: ACC });
  curve(plA, par, 0, 1, { stroke: INFO });
  var i;
  for (i = 1; i <= 5; i++) {
    var xv = i / 6;
    P.line(plA.X(xv), plA.Y(sqr(xv)), plA.X(xv), plA.Y(par(xv)), { stroke: ACC, sw: 1 });
  }
  T(plA.X(0.16), plA.Y(0.90), 'y = root x', { size: 10.5, color: ACC, bold: true });
  T(plA.X(0.62), plA.Y(0.30), 'y = x squared', { size: 10.5, color: INFO, bold: true });
  T(plA.x0, plA.y0 + plA.h + 32, 'vertical strips: integrate dx, upper minus lower', { size: 10.5, color: DIM });
  T(plA.x0, plA.y0 + plA.h + 52, 'value = ' + num(V.sliceVert, 6), { size: 12, color: INK, bold: true });

  var plB = plot(504, 78, 350, 206, 0, 1, 0, 1.1);
  axes(plB, 'x', 'y');
  shadeBetween(plB, sqr, par, 0, 1, { fill: ACC, alpha: 0.2 });
  curve(plB, sqr, 0, 1, { stroke: ACC });
  curve(plB, par, 0, 1, { stroke: INFO });
  for (i = 1; i <= 5; i++) {
    var yv = i / 6;
    P.line(plB.X(par(yv)), plB.Y(yv), plB.X(sqr(yv)), plB.Y(yv), { stroke: BAD, sw: 1 });
  }
  T(plB.X(0.30), plB.Y(0.92), 'x = y squared (left)', { size: 10.5, color: BAD, bold: true });
  T(plB.X(0.62), plB.Y(0.10), 'x = root y (right)', { size: 10.5, color: BAD, bold: true });
  T(plB.x0, plB.y0 + plB.h + 32, 'horizontal strips: integrate dy, right minus left', { size: 10.5, color: DIM });
  T(plB.x0, plB.y0 + plB.h + 52, 'value = ' + num(V.sliceHoriz, 6), { size: 12, color: INK, bold: true });

  if (vis(p, 7.5)) caption(30, 396, 840, 'Both slicings describe the same region, so both must give the same number. That agreement is the check on the setup.', { color: INK });
  if (vis(p, 15)) caption(30, 418, 840, 'The horizontal slicing needs each curve read backwards as x of y; only the right branch of the parabola is in this region.');
}

/* ---------- scene 4: the accumulation function ---------- */
function drawAccScene(t) {
  var p = t - 90;
  hdr('4 · The accumulation function and its derivative',
    'let the upper limit move and the integral becomes a function of where you stopped.');
  var pl = plot(58, 76, 396, 226, 0, 1.9, 0, 3.6);
  axes(pl, 'x', 'y');
  var frac = Math.min(1, p / 15);
  var top = 0.5 + 1.25 * frac;
  shade(pl, par, 0, top, { fill: ACC, alpha: 0.16 });
  curve(pl, par, 0, 1.9, { stroke: ACC });
  P.line(pl.X(top), pl.Y(0), pl.X(top), pl.Y(top), { stroke: BAD, sw: 1.4, dash: [4, 3] });
  T(pl.X(top) + 6, pl.Y(top) - 12, 'x = ' + num(top, 2), { size: 10.5, color: BAD, bold: true });
  T(pl.X(0.72), pl.Y(2.6), 'y = x squared', { size: 10.5, color: ACC, bold: true });
  T(pl.X(top / 2), pl.Y(0.06), 'accumulated area', { size: 10.5, color: INK, align: 'center' });
  T(pl.x0, pl.y0 + pl.h + 34, 'F of x = the integral from 0 to x, so F(1) = 1/3 = ' + num(V.accFclosed, 6), { size: 10.5, color: DIM });

  panel(486, 76, 382, 196, { fill: SURF, stroke: BORDER });
  T(500, 92, 'difference quotient at x = 1, step h', { size: 11, bold: true, color: ACC });
  rowTable(500, 118, [
    ['h = 0.5', num(V.accQ[0], 6)],
    ['h = 0.1', num(V.accQ[1], 6)],
    ['h = 0.01', num(V.accQ[2], 6)],
    ['h = 0.001', num(V.accQ[3], 6)],
    ['integrand at x = 1', '1.000000', VAL, true]
  ], 250, { step: 27, size: 11.5 });

  panel(486, 284, 382, 92, { fill: WARNDIM, stroke: WARN });
  T(500, 300, 'the rate of accumulation is the height of the curve', { size: 11, bold: true, color: WARN });
  T(500, 322, 'Each tenfold shrink of h shrinks the excess tenfold, so the', { size: 10.5, color: INK });
  T(500, 342, 'excess is h plus h squared over 3: first order, not exact.', { size: 10.5, color: INK });

  if (vis(p, 15)) caption(30, 396, 840, 'The quotient tends to the integrand. That is the first half of the fundamental theorem: accumulated area grows at the current height.', { color: INK });
  if (vis(p, 22.5)) caption(30, 418, 840, 'A constant added to F shifts the level and contributes nothing to a difference, which is why it cancels in F(b) minus F(a).');
}

/* ---------- scene 5: net change ---------- */
function drawNetScene(t) {
  var p = t - 120;
  hdr('5 · Net change: integrating a rate',
    'velocity t squared minus 4t plus 3 on 0 to 4: displacement against distance.');
  var pl = plot(58, 76, 396, 226, 0, 4, -1.6, 3.4);
  axes(pl, 'x', 'y');
  shade(pl, vel, 0, 1, { fill: ACC, alpha: 0.18 });
  shade(pl, vel, 1, 3, { fill: BAD, alpha: 0.16 });
  if (vis(p, 7.5)) shade(pl, vel, 3, 4, { fill: ACC, alpha: 0.18 });
  curve(pl, vel, 0, 4, { stroke: ACC });
  T(pl.X(0.42), pl.Y(1.1), 'forward', { size: 10, color: ACC, align: 'center', bold: true });
  T(pl.X(2.0), pl.Y(-1.45), 'backward', { size: 10, color: BAD, align: 'center', bold: true });
  if (vis(p, 7.5)) T(pl.X(3.5), pl.Y(1.1), 'forward', { size: 10, color: ACC, align: 'center', bold: true });
  T(pl.X(0.06), pl.Y(0) + 6, '0', { size: 10, color: FAINT });
  T(pl.X(1), pl.Y(0) + 6, '1', { size: 10, color: FAINT, align: 'center' });
  T(pl.X(3), pl.Y(0) + 6, '3', { size: 10, color: FAINT, align: 'center' });
  T(pl.X(4) - 4, pl.Y(0) + 6, '4', { size: 10, color: FAINT, align: 'right' });
  T(pl.X(3.85), pl.Y(3.15), 'v(t)', { size: 10.5, color: ACC, align: 'right', bold: true });

  panel(486, 76, 382, 168, { fill: SURF, stroke: BORDER });
  T(500, 92, 'the three pieces, in order', { size: 11, bold: true, color: ACC });
  rowTable(500, 118, [
    ['0 to 1, forward', num(V.netP1, 6), ACC],
    ['1 to 3, backward', num(V.netP2, 6), BAD],
    ['3 to 4, forward', num(V.netP3, 6), ACC]
  ], 300, { step: 26, size: 11.5 });

  panel(486, 256, 382, 120, { fill: INVALIDDIM, stroke: BAD });
  T(500, 272, 'two different questions, both answerable', { size: 11, bold: true, color: BAD });
  T(500, 296, 'displacement, signed total = ' + num(V.netDisp, 6), { size: 11.5, color: INK, bold: true });
  T(500, 320, 'distance, absolute values = ' + num(V.netDist, 6), { size: 11.5, color: INK, bold: true });
  T(500, 346, 'the middle piece is undone motion', { size: 10.5, color: DIM });

  if (vis(p, 15)) caption(30, 396, 840, 'The signed total is the net change in position: four thirds, about 1.333333. The object ends slightly right of where it started.', { color: INK });
  if (vis(p, 22.5)) caption(30, 418, 840, 'Counting every piece positively gives four. The word displacement asks for the first; distance or total asks for the second.');
}

/* ---------- scene 6: average value ---------- */
function drawAvgScene(t) {
  var p = t - 150;
  hdr('6 · Average value and where it is attained',
    'sine over 0 to pi: the average is the height of the rectangle with the same area.');
  var pl = plot(58, 76, 396, 226, 0, 3.3, -0.2, 1.15);
  axes(pl, 'x', 'y');
  shade(pl, sine, 0, Math.PI, { fill: ACC, alpha: 0.16 });
  P.rect(pl.X(0), pl.Y(V.avgClosed), pl.X(Math.PI) - pl.X(0), pl.Y(0) - pl.Y(V.avgClosed),
    { stroke: BAD, sw: 1.4, dash: [5, 4] });
  curve(pl, sine, 0, Math.PI, { stroke: ACC });
  P.line(pl.X(0), pl.Y(V.avgClosed), pl.X(3.25), pl.Y(V.avgClosed), { stroke: BAD, sw: 1.4 });
  T(pl.X(2.62), pl.Y(V.avgClosed) - 16, 'average 2/pi', { size: 10.5, color: BAD, bold: true });
  if (vis(p, 15)) {
    P.circle(pl.X(V.avgC1), pl.Y(V.avgClosed), 3.6, { fill: INK });
    P.circle(pl.X(V.avgC2), pl.Y(V.avgClosed), 3.6, { fill: INK });
    T(pl.X(V.avgC1), pl.Y(V.avgClosed) - 18, 'c1', { size: 10, color: INK, align: 'center' });
    T(pl.X(V.avgC2), pl.Y(V.avgClosed) - 18, 'c2', { size: 10, color: INK, align: 'center' });
  }
  T(pl.X(Math.PI / 2), pl.Y(1.05), 'peak height 1', { size: 10, color: FAINT, align: 'center' });
  T(pl.X(Math.PI) + 4, pl.Y(0) + 6, 'pi', { size: 10, color: FAINT });
  T(pl.X(0.02), pl.Y(0) + 6, '0', { size: 10, color: FAINT });

  panel(486, 76, 382, 200, { fill: SURF, stroke: BORDER });
  T(500, 92, 'the four numbers that get confused', { size: 11, bold: true, color: ACC });
  rowTable(500, 118, [
    ['integral over the interval', num(V.avgInt, 6), DIM],
    ['average value = integral / width', num(V.avgSin, 6), INK, true],
    ['height at the midpoint', '1.000000', DIM],
    ['mean of the endpoint values', '0.000000', DIM]
  ], 300, { step: 27, size: 11.5 });
  T(500, 250, 'c1 = ' + num(V.avgC1, 6) + ',  c2 = ' + num(V.avgC2, 6), { size: 11, color: INK, mono: true });

  panel(486, 288, 382, 88, { fill: WARNDIM, stroke: WARN });
  T(500, 304, 'the theorem promises one point, not exactly one', { size: 11, bold: true, color: WARN });
  T(500, 328, 'sine reaches 2/pi on the way up and again on the way down.', { size: 10.5, color: INK });
  T(500, 350, 'Averaging the endpoints gives 0, which is the trapezoid idea.', { size: 10.5, color: INK });

  if (vis(p, 7.5)) caption(30, 396, 840, 'For a list of numbers the average is the sum over the count. For a function the sum becomes an integral and the count becomes the width.', { color: INK });
  if (vis(p, 22.5)) caption(30, 418, 840, 'The mean value theorem for integrals needs continuity and gives existence only; here two distinct points attain the average.');
}

/* ---------- scene 7: probability as area ---------- */
function drawProbScene(t) {
  var p = t - 180;
  hdr('7 · Probability is an area',
    'the exponential density with rate 0.5, and the probability between 1 and 3.');
  var pl = plot(58, 76, 396, 226, 0, 6, 0, 0.56);
  axes(pl, 'x', 'density');
  shade(pl, expD, 1, 3, { fill: ACC, alpha: 0.24 });
  curve(pl, expD, 0, 6, { stroke: ACC });
  T(pl.X(2.0), pl.Y(0.30), 'area = 0.383400', { size: 11, color: INK, align: 'center', bold: true });
  T(pl.X(4.6), pl.Y(0.15), 'f(x) = 0.5 e to the -x/2', { size: 10.5, color: ACC, bold: true });
  T(pl.X(1) , pl.Y(0) + 6, '1', { size: 10, color: FAINT, align: 'center' });
  T(pl.X(3), pl.Y(0) + 6, '3', { size: 10, color: FAINT, align: 'center' });
  T(pl.X(0.05), pl.Y(0) + 6, '0', { size: 10, color: FAINT });
  T(pl.x0, pl.y0 + pl.h + 34, 'the density integrates to 1 over the whole line: ' + num(V.expTotal, 6), { size: 10.5, color: DIM });

  panel(486, 76, 382, 196, { fill: SURF, stroke: BORDER });
  T(500, 92, 'three densities, one reading', { size: 11, bold: true, color: ACC });
  rowTable(500, 118, [
    ['exponential, P(1 < X < 3)', num(V.expP, 6)],
    ['uniform on 0 to 4, P(1 < X < 3)', num(V.uniP, 6)],
    ['normal, P(-1 < X < 1)', num(V.normP, 6)],
    ['exponential mean', num(V.expMean, 6)],
    ['uniform mean', num(V.uniMean, 6)]
  ], 260, { step: 27, size: 11.5 });

  panel(486, 284, 382, 92, { fill: WARNDIM, stroke: WARN });
  T(500, 300, 'F(b) minus F(a), the accumulation function read twice', { size: 11, bold: true, color: WARN });
  T(500, 322, 'e to the -0.5 minus e to the -1.5 = ' + num(V.expClosed, 6), { size: 10.5, color: INK, mono: true });
  T(500, 342, 'the normal value is erf(1/root 2) = ' + num(V.normErf, 6), { size: 10.5, color: INK, mono: true });

  if (vis(p, 7.5)) caption(30, 396, 840, 'A density is not a probability. Only its integral over an interval is, which is why subtracting densities gives a wrong number.', { color: INK });
  if (vis(p, 15)) caption(30, 418, 840, 'Every probability here lies between 0 and 1, and the total area under each density is 1. Those are the two checks.');
}

/* ---------- scene 8: rate graphs ---------- */
function drawRateScene(t) {
  var p = t - 210;
  hdr('8 · Areas under rate graphs elsewhere in the syllabus',
    'a rate of 2 plus sine of t, in megabytes per second, over one full period.');
  var pl = plot(58, 76, 396, 226, 0, 2 * Math.PI, 0, 3.5);
  axes(pl, 't', 'rate');
  shade(pl, rate, 0, 2 * Math.PI, { fill: ACC, alpha: 0.16 });
  P.line(pl.X(0), pl.Y(2), pl.X(2 * Math.PI), pl.Y(2), { stroke: BAD, sw: 1.4, dash: [5, 4] });
  curve(pl, rate, 0, 2 * Math.PI, { stroke: ACC, steps: 240 });
  T(pl.X(2.0), pl.Y(2.0) - 16, 'average rate = 2', { size: 10.5, color: BAD, bold: true });
  T(pl.X(3.1), pl.Y(3.3), 'rate(t) = 2 + sin t', { size: 10.5, color: ACC, bold: true });
  T(pl.X(2 * Math.PI), pl.Y(0) + 6, '2 pi', { size: 10, color: FAINT, align: 'right' });
  T(pl.X(0.04), pl.Y(0) + 6, '0', { size: 10, color: FAINT });
  T(pl.x0, pl.y0 + pl.h + 34, 'the sine part contributes nothing over a whole period, so it cancels out of the total', { size: 10.5, color: DIM });

  panel(486, 76, 382, 150, { fill: SURF, stroke: BORDER });
  T(500, 92, 'three readings of one rate graph', { size: 11, bold: true, color: ACC });
  rowTable(500, 118, [
    ['total = area under the rate', num(V.rateTotal, 6)],
    ['average = area / width', num(V.rateAvg, 6)],
    ['busy fraction on 0 to 4', num(V.utilBusy, 6)]
  ], 300, { step: 26, size: 11.5 });

  panel(486, 238, 382, 138, { fill: WARNDIM, stroke: WARN });
  T(500, 254, 'an average of ones and zeros is a fraction of time', { size: 11, bold: true, color: WARN });
  T(500, 278, 'Write 1 while busy and 0 while idle. Its average value', { size: 10.5, color: INK });
  T(500, 298, 'over an interval is the busy time over the total time,', { size: 10.5, color: INK });
  T(500, 318, 'which is exactly the utilisation. One quarter here.', { size: 10.5, color: INK });
  T(500, 348, 'An educational reading of the arithmetic, not a syllabus formula.', { size: 10, color: FAINT });

  if (vis(p, 7.5)) caption(30, 396, 840, 'Total is the area, average is the area divided by the width, and a fraction of time is the average of an indicator function.', { color: INK });
  if (vis(p, 22.5)) caption(30, 418, 840, 'Averaging over half a period does not remove the sine: that average is ' + num(V.rateHalf, 6) + ', not 2. The cancellation needs whole periods.');
}

/* ---------- scene 9: the four traps ---------- */
function trapBox(x, y, w, h, title, line1, line2, accent) {
  panel(x, y, w, h, { fill: SURF, stroke: accent });
  T(x + 14, y + 12, title, { size: 11, bold: true, color: accent });
  T(x + 14, y + 34, line1, { size: 10.5, color: INK });
  T(x + 14, y + 54, line2, { size: 10.5, color: INK });
}
function drawTrapsScene(t) {
  var p = t - 240;
  hdr('9 · The four errors that produce the wrong option',
    'each of these generates a number that is in the option list, which is why it is worth naming.');

  trapBox(40, 66, 402, 78, '1. signed integral offered for an area',
    'x squared - 2x over 0 to 3: integral ' + num(V.f1signed, 6) + ', area ' + num(V.f1geo, 6) + '.',
    'The question says "the integral of" or "the area enclosed by".', BAD);
  trapBox(462, 66, 402, 78, '2. a crossing that was not used to split',
    'x cubed against x over -1 to 1: integral ' + num(V.cubeSigned, 6) + ', area ' + num(V.cubeGeo, 6) + '.',
    'Geometric area must be split at every crossing.', BAD);
  trapBox(40, 156, 402, 78, '3. the width divisor left out',
    'sine over 0 to pi: integral ' + num(V.avgInt, 6) + ', average ' + num(V.avgSin, 6) + '.',
    'An average value divides by b minus a. The integral does not.', WARN);
  trapBox(462, 156, 402, 78, '4. the wrong variable, or stale limits',
    'A dy integral needs y limits and each curve written as x of y.',
    'Mixing an x limit with dy gives a plausible wrong number.', WARN);

  panel(40, 246, 824, 130, { fill: INVALIDDIM, stroke: BAD });
  T(56, 262, 'the two checks that catch all four', { size: 11, bold: true, color: BAD });
  T(56, 286, 'An area is never negative, because geometric area is defined with absolute values. A negative answer is an error, never a sign convention.', { size: 10.5, color: INK });
  T(56, 308, 'A probability never exceeds 1, and the whole density integrates to 1, so an answer above 1 or a total other than 1 is an error.', { size: 10.5, color: INK });
  T(56, 330, 'An average value lies between the minimum and the maximum of the function on the interval. Anything outside that range is wrong.', { size: 10.5, color: INK });
  if (vis(p, 15)) T(56, 356, 'A signed integral can be negative, can be zero, and can be smaller than the area. Only the area question forbids that.', { size: 10.5, color: DIM, bold: true });

  if (vis(p, 7.5)) caption(30, 396, 840, 'Two numbers from one function, and the option list contains both. The reading of the question decides which one is being asked for.', { color: INK });
  if (vis(p, 22.5)) caption(30, 418, 840, 'Bounding the answer rules out impossible options in seconds, and says nothing about whether a plausible option is right.');
}

/* ---------- scene 10: reading the question ---------- */
function drawExamScene(t) {
  var p = t - 270;
  hdr('10 · Reading the question',
    'classify first, then apply the matching first move, then bound the answer.');

  panel(40, 64, 500, 232, { fill: SURF, stroke: BORDER });
  T(56, 80, 'the five types and their first move', { size: 11, bold: true, color: ACC });
  rowTable(56, 108, [
    ['signed integral', 'integrate, keep the signs'],
    ['geometric area', 'split at every crossing'],
    ['area between curves', 'solve for the crossings first'],
    ['net change from a rate', 'signed integral of the rate'],
    ['total from a rate', 'absolute value, split at zeros'],
    ['average value', 'divide by b minus a'],
    ['probability', 'F of b minus F of a']
  ], 330, { step: 26, size: 11 });

  panel(556, 64, 308, 232, { fill: WARNDIM, stroke: WARN });
  T(572, 80, 'bound the answer first', { size: 11, bold: true, color: WARN });
  T(572, 106, 'an area is at most the widest gap', { size: 10.5, color: INK });
  T(572, 126, 'times the width of the interval', { size: 10.5, color: INK });
  T(572, 152, 'a probability lies in 0 to 1', { size: 10.5, color: INK });
  T(572, 178, 'an average lies between the', { size: 10.5, color: INK });
  T(572, 198, 'minimum and the maximum', { size: 10.5, color: INK });
  T(572, 224, 'a distance is at least the', { size: 10.5, color: INK });
  T(572, 244, 'magnitude of the displacement', { size: 10.5, color: INK });
  T(572, 272, 'these rule out, they do not confirm', { size: 10, color: FAINT });

  if (vis(p, 7.5)) caption(30, 316, 840, 'Signed, geometric, between curves, net change, total, average, probability. Naming the type prevents most wasted work.', { bold: true, color: INK });
  if (vis(p, 15)) caption(30, 344, 840, 'For an area, the crossings are both the limits and the split points. For a rate, net against total decides whether absolute values are needed.');
  if (vis(p, 22.5)) caption(30, 372, 840, 'Then bound the answer: an area is never negative, a probability never exceeds 1, an average stays in range.');
  if (vis(p, 22.5)) caption(30, 400, 840, 'Finally check the variable: a dy integral takes y limits, and each curve written as x of y.', { color: FAINT });
}

function drawFrame(painter) {
  P = painter;
  if (!P) return;
  var t = (K && K.state) ? K.state.elapsed : 0;
  var sc = (K && K.state && K.state.scenes.length) ? K.state.scenes[K.sceneAt(t)] : null;
  var id = sc ? sc.id : 'signed';
  P.alpha(1);
  P.clear();
  if (id === 'signed') drawSignedScene(t);
  else if (id === 'between') drawBetweenScene(t);
  else if (id === 'slicing') drawSlicingScene(t);
  else if (id === 'accumulation') drawAccScene(t);
  else if (id === 'netchange') drawNetScene(t);
  else if (id === 'average') drawAvgScene(t);
  else if (id === 'probability') drawProbScene(t);
  else if (id === 'rates') drawRateScene(t);
  else if (id === 'traps') drawTrapsScene(t);
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
