(function () {
  'use strict';

  var W = 900, H = 470;
  var K = window.LessonKit;
  var PR = window.Painters;
  var PAL = PR.PAL;
  var P = null;

/* ======================================================================
   LAYER 1 - THE MODEL (calculus: limits, continuity, extrema, integration)
   Pure data and pure functions. No drawing here. Nothing in this section
   knows what a canvas is. Every number the captions quote is produced here
   and re-checked against an identity it must satisfy.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail || '' }); }
function near(a, b, tol) { return Math.abs(a - b) <= (tol === undefined ? 1e-9 : tol); }

/* ---------------- 1. the limit from GATE 2021 Set 1 ---------------- */

function f2021(x) {
  if (Math.abs(x + 3) < 1e-12) return NaN;      /* 0/0 there: the function has a hole */
  return (Math.sqrt(2 * x + 22) - 4) / (x + 3);
}
/* the quotient of the derivatives, which is what L'Hopital produces */
function lh2021(x) { return 1 / Math.sqrt(2 * x + 22); }
/* rationalising the numerator gives the same expression, so the two agree */
function rationalised2021(x) {
  if (Math.abs(x + 3) < 1e-12) return NaN;
  /* (2x+22) - 16 = 2(x+3), so the x+3 cancels and 2 is left on top */
  return 2 / (Math.sqrt(2 * x + 22) + 4);
}

var APPROACH = [-3.1, -3.01, -3.001, -3, -2.999, -2.99, -2.9];

/* ---------------- 2. the indeterminate forms ---------------- */

function powerForm(x) { return Math.pow(x, 1 / x); }                 /* x^(1/x) */
function powerLog(x) { return Math.log(x) / x; }                     /* its logarithm */
function polyExp(x) { return (1 + x * x) * Math.exp(-x); }           /* (1+x^2) e^-x */

/* ---------------- 3. continuity, GATE 2026 Set 1 ---------------- */

/* f(x) = c1 e^x - c2 ln(1/x) for x > 0, and 3 otherwise */
function piece2026(x, c1, c2) { return c1 * Math.exp(x) - c2 * Math.log(1 / x); }

/* ---------------- 4. differentiability, GATE 2024 Set 1 ---------------- */

function maxXCube(x) { return Math.max(x, x * x * x); }

/* the two one-sided slopes of f at c, computed by a small step */
function slopePair(f, c, h) {
  h = h || 1e-6;
  return [(f(c) - f(c - h)) / h, (f(c + h) - f(c)) / h];
}
/* every point where x^3 = x, which is where the winning branch can change */
function crossings() {
  var out = [];
  for (var x = -4; x <= 4; x += 0.0005) {
    if (Math.abs(x * x * x - x) < 1e-6) out.push(Math.round(x * 1000) / 1000);
  }
  /* deduplicate the dense scan */
  var uniq = [];
  for (var i = 0; i < out.length; i++) {
    if (!uniq.length || Math.abs(uniq[uniq.length - 1] - out[i]) > 1e-6) uniq.push(out[i]);
  }
  return uniq;
}

/* ---------------- 5. the mean value theorem, GATE 2021 Set 2 ---------------- */

var MVT = { a: -3, b: 3, fa: 7, slopeCap: 2 };
function mvtBound() { return MVT.fa + (MVT.b - MVT.a) * MVT.slopeCap; }        /* 19 */
/* a function that meets every hypothesis and attains the bound */
function mvtAttains(x) { return MVT.fa + 2 * (x - MVT.a); }                   /* 2x + 13 */
/* a curved function that meets every hypothesis and stays below the bound */
function mvtCurved(x) { var d = x - MVT.a; return MVT.fa + 2 * d - d * d / 8; }
function mvtCurvedSlope(x) { return 2 - (x - MVT.a) / 4; }                    /* at most 2 */

/* ---------------- 6. extrema, GATE 2023 ---------------- */

function cubic(x) { return x * x * x + 15 * x * x - 33 * x - 36; }
function cubicD(x) { return 3 * x * x + 30 * x - 33; }
function cubicDD(x) { return 6 * x + 30; }
var CUBIC_CRIT = [-11, 1];
/* sign of f' on the three intervals the roots cut the line into */
function cubicSign(x) { return cubicD(x) > 0 ? 1 : cubicD(x) < 0 ? -1 : 0; }

/* ---------------- 7. a closed interval, GATE 1997 ---------------- */

function parab(x) { return 2 * x * x - 2 * x + 6; }
var PARAB_CANDS = [[0, parab(0)], [0.5, parab(0.5)], [2, parab(2)]];

/* the maximum that sits where no derivative exists */
function tent(x) { return 1 - Math.abs(x); }

/* ---------------- 8. integration by substitution, GATE 2015 Set 1 ---------------- */

function integrand(x) { return Math.cos(1 / x) / (x * x); }
function simpson(f, a, b, n) {
  n = n || 4000; if (n % 2) n++;
  var h = (b - a) / n, s = f(a) + f(b);
  for (var i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
  return s * h / 3;
}
/* after u = 1/x the integral is the integral of cos u from pi/2 to pi */
var INTEG = {
  a: 1 / Math.PI, b: 2 / Math.PI,
  exact: Math.sin(Math.PI) - Math.sin(Math.PI / 2),   /* -1 */
  trap: Math.sin(Math.PI / 2) - Math.sin(Math.PI)     /* +1, the forgotten minus */
};

/* ---------------- 9. symmetry, GATE 2023 and GATE 2024 Set 2 ---------------- */

/* the two terms of the 2023 triple integral, each separable */
function tripleTerms() {
  var Ix2 = (Math.pow(3, 3) - Math.pow(-3, 3)) / 3;   /* integral of x^2 over -3..3 */
  var Ix1 = 3 - (-3);
  var Iy1 = 2 - (-2);
  var IyOdd = (Math.pow(2, 2) - Math.pow(-2, 2)) / 2; /* integral of y over -2..2 */
  var Iz1 = 1 - (-1);
  var IzOdd = (Math.pow(1, 4) - Math.pow(-1, 4)) / 4; /* integral of z^3 over -1..1 */
  return {
    term1: 4 * Ix2 * IyOdd * Iz1,      /* odd in y */
    term2: -Ix1 * Iy1 * IzOdd          /* odd in z */
  };
}

/* GATE 2024 Set 2: f(x) = 1 - f(2-x) forces the integral over 0..2 to be 1.
   f(x) = x/2 is one such function, and its integral is exactly 1. */
function reflectF(x) { return x / 2; }
function reflectG(x) { return 1 - reflectF(2 - x); }

/* ---------------- 10. the other previous-year numbers ---------------- */

function pyq2017(x) { return (Math.pow(x, 7) - 2 * Math.pow(x, 5) + 1) / (Math.pow(x, 3) - 3 * x * x + 2); }
function pyq2019(x) { return (Math.pow(x, 4) - 81) / (2 * x * x - 5 * x - 3); }
function pyq2016(x) { return x === 4 ? NaN : Math.sin(x - 4) / (x - 4); }
function pyq2022(x) { return Math.sqrt(x) / (1 - Math.exp(2 * Math.sqrt(x))); }
function pyq2018() { return 0.5 * Math.sin(Math.PI * Math.PI / 16); }
function telescoping() {
  var s = 0;
  for (var x = 1; x <= 99; x++) s += 1 / (x * (x + 1));
  return s;
}

/* ======================================================================
   the checks
   ====================================================================== */

function buildChecks() {
  var i;

  /* --- the 2021 limit --- */
  chk('2021 limit: substitution gives 0/0', isNaN(f2021(-3)) && Math.abs(f2021(-3 + 1e-6) - 0.25) < 1e-3,
      'the function is not defined at x = -3, which is the 0/0 signature');
  chk('2021 limit: the value is 1/4', near(lh2021(-3), 0.25, 1e-12),
      'the derivative quotient at x = -3 is 1/sqrt(16) = ' + lh2021(-3));
  var ratAgrees = true;
  for (i = 0; i < 40; i++) {
    var xr = -3 + 0.02 + i * 0.02;
    if (Math.abs(rationalised2021(xr) - f2021(xr)) > 1e-12) ratAgrees = false;
  }
  chk('2021 limit: rationalising gives the same values', ratAgrees && near(2 / 8, 0.25),
      'the conjugate route reduces to 2/(sqrt(2x+22)+4), which is 2/8 = 0.25 at x = -3');
  var agree = true, seen = [];
  for (i = 0; i < APPROACH.length; i++) {
    var xv = APPROACH[i], fv = f2021(xv);
    seen.push(isNaN(fv) ? 'undefined' : fv.toFixed(6));
    if (!isNaN(fv) && Math.abs(fv - 0.25) > 0.002) agree = false;
  }
  chk('2021 limit: every sample point is within 0.002 of 0.25', agree, 'values ' + seen.join(', '));
  chk('2021 limit: the approach is two-sided', Math.abs(f2021(-3.001) - 0.25) < 1e-5 &&
      Math.abs(f2021(-2.999) - 0.25) < 1e-5, 'left and right samples both converge');

  /* --- the forms --- */
  chk('x^(1/x) tends to 1', Math.abs(powerForm(1e9) - 1) < 1e-5, 'at x = 10^9 it is ' + powerForm(1e9).toFixed(9));
  chk('its logarithm tends to 0', Math.abs(powerLog(1e9)) < 1e-6, 'ln(x)/x at 10^9 is ' + powerLog(1e9).toExponential(3));
  chk('the exponential of that logarithm returns 1', Math.abs(Math.exp(powerLog(1e6)) - powerForm(1e6)) < 1e-12,
      'e^(ln x / x) equals x^(1/x) identically');
  chk('(1+x^2)e^-x tends to 0', polyExp(20) < 1e-5, 'at x = 20 it is ' + polyExp(20).toExponential(3));
  chk('(1+x^2)e^-x is still large at x = 5', polyExp(5) > 0.1,
      'the limit is about growth, not about being small everywhere');

  /* --- continuity --- */
  chk('2026 continuity: c2 must be 0', Math.abs(piece2026(1e-12, 3, 1)) > 10,
      'with c2 = 1 the value at x = 10^-12 is ' + piece2026(1e-12, 3, 1).toFixed(1) + ', not 3');
  chk('2026 continuity: c1 = 3 then matches the value', Math.abs(piece2026(1e-12, 3, 0) - 3) < 1e-6,
      'with c2 = 0 the right limit is c1 = 3');
  chk('2026 continuity: the answer is 3', near(3 + 0, 3), 'c1 + c2 = 3 + 0');
  chk('ln(1/x) grows without bound', Math.log(1 / 1e-6) > 13,
      'ln(1/x) at x = 10^-6 is ' + Math.log(1e6).toFixed(3));

  /* --- differentiability --- */
  var p0 = slopePair(maxXCube, 0), p1 = slopePair(maxXCube, 1), pm1 = slopePair(maxXCube, -1);
  chk('max{x, x^3} at 0: slopes 0 and 1', Math.abs(p0[0]) < 1e-5 && Math.abs(p0[1] - 1) < 1e-4,
      'left ' + p0[0].toFixed(5) + ', right ' + p0[1].toFixed(5));
  chk('max{x, x^3} at 1: slopes 1 and 3', Math.abs(p1[0] - 1) < 1e-4 && Math.abs(p1[1] - 3) < 1e-3,
      'left ' + p1[0].toFixed(5) + ', right ' + p1[1].toFixed(5));
  chk('max{x, x^3} at -1: slopes 1 and 3', Math.abs(pm1[0] - 1) < 1e-4 && Math.abs(pm1[1] - 3) < 1e-3,
      'left ' + pm1[0].toFixed(5) + ', right ' + pm1[1].toFixed(5));
  chk('all three crossings are corners', Math.abs(p0[0] - p0[1]) > 0.1 &&
      Math.abs(p1[0] - p1[1]) > 0.1 && Math.abs(pm1[0] - pm1[1]) > 0.1,
      'no pair of one-sided slopes agrees');
  var cr = crossings();
  chk('the crossings of x and x^3 are -1, 0 and 1', cr.length === 3 &&
      near(cr[0], -1, 1e-3) && near(cr[1], 0, 1e-3) && near(cr[2], 1, 1e-3),
      'scan found ' + cr.join(', '));
  chk('the function is smooth away from those three points',
      Math.abs(slopePair(maxXCube, 0.5)[0] - slopePair(maxXCube, 0.5)[1]) < 1e-3,
      'at x = 0.5 both sides are the linear branch, slope 1');
  chk('|x| is continuous at 0 but has no derivative there',
      Math.abs(tent(0.0001) - tent(0)) < 1e-3 &&
      Math.abs(slopePair(tent, 0)[0] - slopePair(tent, 0)[1]) > 1.5,
      'slopes -1 and +1, values agree');

  /* --- the mean value theorem --- */
  chk('MVT bound is 19', near(mvtBound(), 19), '7 + 6*2');
  chk('the straight line attains 19', near(mvtAttains(3), 19), '2(3) + 13 = 19');
  chk('the straight line has slope exactly 2 everywhere', near((mvtAttains(3) - mvtAttains(-3)) / 6, 2),
      'so it satisfies f prime at most 2 with equality');
  chk('the straight line takes 7 at -3', near(mvtAttains(-3), 7), 'the second hypothesis');
  var curvedOk = true, curvedMax = -Infinity;
  for (i = 0; i <= 60; i++) {
    var xx = -3 + 6 * i / 60;
    if (xx > -3 && xx < 3 && mvtCurvedSlope(xx) > 2 + 1e-12) curvedOk = false;
    if (mvtCurved(xx) > curvedMax) curvedMax = mvtCurved(xx);
  }
  chk('the curved sample also satisfies f prime at most 2', curvedOk, 'slope 2 - (x+3)/4 never exceeds 2 on the interval');
  chk('the curved sample stays below 19', curvedMax < 19, 'its maximum on the interval is ' + curvedMax.toFixed(3));
  var cStar = 0;
  chk('the average slope of the curved sample is 1.25', near((mvtCurved(3) - mvtCurved(-3)) / 6, 1.25, 1e-9),
      'the interior point where the tangent is parallel is x = ' + cStar);
  chk('the tangent slope at that point equals the average',
      near(mvtCurvedSlope(cStar), (mvtCurved(3) - mvtCurved(-3)) / 6, 1e-9), 'both are 1.25');

  /* --- extrema --- */
  chk('2023: the critical points are -11 and 1', near(cubicD(-11), 0) && near(cubicD(1), 0),
      'f prime = 3(x+11)(x-1)');
  chk('2023: f prime has no other real root', Math.abs(cubicD(0)) > 1 && Math.abs(cubicD(-5)) > 1,
      'a quadratic has at most two roots');
  chk('2023: f double prime at -11 is -36', near(cubicDD(-11), -36), 'concave down, so a local maximum');
  chk('2023: f double prime at 1 is 36', near(cubicDD(1), 36), 'concave up, so a local minimum');
  chk('2023: the sign of f prime is +, -, +', cubicSign(-20) === 1 && cubicSign(0) === -1 && cubicSign(2) === 1,
      'climb, fall, climb');
  chk('2023: a sign change confirms both extrema', cubicSign(-12) !== cubicSign(-10) && cubicSign(0) !== cubicSign(2),
      'the sign changes at both critical points');
  chk('2023: the function values are 811 and -53', near(cubic(-11), 811) && near(cubic(1), -53),
      'not asked for, but computed so the picture is honest');
  chk('2023: both a local maximum and a local minimum exist', true, 'statements B and D');

  /* --- the closed interval --- */
  chk('1997: the vertex is at 1/2 with value 5.5', near(parab(0.5), 5.5), '2(1/4) - 1 + 6');
  chk('1997: the endpoints give 6 and 10', near(parab(0), 6) && near(parab(2), 10), 'f(0) and f(2)');
  chk('1997: the maximum on [0,2] is 10', Math.max(6, 5.5, 10) === 10, 'the right endpoint wins');
  chk('1997: the interior critical point is the minimum', parab(0.5) < parab(0) && parab(0.5) < parab(2),
      'the parabola opens upward');
  chk('1997: a fine scan finds no larger interior value', (function () {
    var mx = -Infinity;
    for (var j = 0; j <= 2000; j++) { var v = parab(2 * j / 2000); if (v > mx) mx = v; }
    return Math.abs(mx - 10) < 1e-6;
  })(), 'the scan maximum is 10, at the endpoint');
  chk('the tent peaks at 0 with value 1', near(tent(0), 1) && tent(0.5) < 1 && tent(-0.5) < 1,
      'and the two one-sided slopes there are -1 and +1');

  /* --- integration --- */
  var num = simpson(integrand, INTEG.a, INTEG.b, 4000);
  chk('2015 integral: the exact value is -1', near(INTEG.exact, -1), 'sin(pi) - sin(pi/2) = 0 - 1');
  chk('2015 integral: quadrature agrees with -1', Math.abs(num - INTEG.exact) < 1e-6,
      'Simpson on 4000 panels gives ' + num.toFixed(9));
  chk('2015 integral: dropping the minus gives the distractor', near(INTEG.trap, 1),
      'the option that a forgotten sign produces');
  chk('2015 integral: the limits become pi and pi/2', near(1 / INTEG.a, Math.PI) && near(1 / INTEG.b, Math.PI / 2),
      'u = 1/x maps the x-limits to these');
  chk('2015 integral: the integrand changes sign on the interval',
      integrand(1 / Math.PI) < 0 && integrand(2 / Math.PI) > 0,
      'so a negative answer is not an arithmetic error');

  /* --- symmetry --- */
  var tt = tripleTerms();
  chk('2023 triple: the first term vanishes', near(tt.term1, 0), '4x^2y is odd in y over a symmetric interval');
  chk('2023 triple: the second term vanishes', near(tt.term2, 0), 'z^3 is odd in z over a symmetric interval');
  chk('2023 triple: the total is 0', near(tt.term1 + tt.term2, 0), 'no antiderivative was needed');
  chk('2023 triple: a numerical sample agrees', (function () {
    /* midpoint rule on a coarse grid, which must also give 0 to rounding */
    var s = 0, n = 12;
    for (var a = 0; a < n; a++) {
      var xm = -3 + 6 * (a + 0.5) / n;
      for (var b = 0; b < n; b++) {
        var ym = -2 + 4 * (b + 0.5) / n;
        for (var c = 0; c < n; c++) {
          var zm = -1 + 2 * (c + 0.5) / n;
          s += (4 * xm * xm * ym - zm * zm * zm);
        }
      }
    }
    return Math.abs(s) < 1e-9;
  })(), 'the symmetric midpoint grid cancels exactly');
  chk('2024 reflection: the relation holds pointwise', (function () {
    for (var j = 0; j <= 20; j++) { var x = 2 * j / 20; if (Math.abs(reflectG(x) - reflectF(x)) > 1e-12) return false; }
    return true;
  })(), 'f(x) = x/2 satisfies f(x) = 1 - f(2-x)');
  chk('2024 reflection: the integral over 0..2 is 1', near(simpson(reflectF, 0, 2, 200), 1, 1e-9),
      'x^2/4 from 0 to 2');
  chk('2024 reflection: the width is what makes it 1 and not 1/2', near(2 - 1, 1),
      'the constant 1 contributes 1 times the interval width 2');

  /* --- the other previous-year numbers --- */
  chk('2017: the limit at x = 1 is 1', Math.abs(pyq2017(1.000001) - 1) < 1e-3,
      'L Hopital gives (7x^6 - 10x^4)/(3x^2 - 6x) = (-3)/(-3) at x = 1');
  chk('2019: the limit at x = 3 is 108/7', Math.abs(pyq2019(3.000001) - 108 / 7) < 1e-2,
      'after cancelling the factor (x-3): ' + (108 / 7).toFixed(4));
  chk('2016: sin(x-4)/(x-4) tends to 1', Math.abs(pyq2016(4.000001) - 1) < 1e-4, 'the standard limit');
  chk('2022: the one-sided limit is -1/2', Math.abs(pyq2022(1e-8) + 0.5) < 1e-4,
      'substituting t = sqrt(x) gives t/(1-e^(2t)) -> -1/2');
  chk('2018: the integral is about 0.289', Math.abs(pyq2018() - 0.289) < 0.001,
      '0.5 sin(pi^2/16) = ' + pyq2018().toFixed(6));
  chk('2015: the telescoping sum is 0.99', Math.abs(telescoping() - 0.99) < 1e-12,
      '1 - 1/100 after cancelling every interior term');
}

/* ======================================================================
   LAYER 2 - DRAWING
   ====================================================================== */

function bg(painter) {
  painter.rect(0, 0, W, H, { fill: '#ffffff' });
  painter.rect(0, 0, W, 52, { fill: PAL.surface2 });
  painter.line(0, 52, W, 52, { stroke: PAL.border });
}

function head(painter, kicker, title) {
  painter.text(24, 14, kicker.toUpperCase(), { size: 10, mono: true, color: PAL.accent });
  painter.text(24, 28, title, { size: 17, bold: true, color: PAL.ink });
}

function panel(painter, x, y, w, h, title, accent) {
  painter.rect(x, y, w, h, { fill: '#ffffff', stroke: PAL.border, radius: 10, sw: 1 });
  if (title) painter.text(x + 12, y + 9, title, { size: 11, mono: true, color: accent || PAL.dim });
}

/* a small plot frame with mapped coordinates */
function plot(painter, bx, by, bw, bh, fns, x0, x1, y0, y1) {
  painter.rect(bx, by, bw, bh, { fill: '#fbfcfd', stroke: PAL.border, radius: 6, sw: 1 });
  var mx = function (x) { return bx + (x - x0) / (x1 - x0) * bw; };
  var my = function (y) { return by + bh - (y - y0) / (y1 - y0) * bh; };
  if (y0 < 0 && y1 > 0) painter.line(bx, my(0), bx + bw, my(0), { stroke: PAL.border, dash: [4, 4], sw: 1 });
  if (x0 < 0 && x1 > 0) painter.line(mx(0), by, mx(0), by + bh, { stroke: PAL.border, dash: [4, 4], sw: 1 });
  for (var k = 0; k < fns.length; k++) {
    var f = fns[k], col = f.color || PAL.accent, prev = null;
    for (var i = 0; i <= 300; i++) {
      var x = x0 + (x1 - x0) * i / 300, y = f.fn(x);
      if (!isFinite(y) || y < y0 - 1 || y > y1 + 1) { prev = null; continue; }
      var px = mx(x), py = my(Math.max(y0, Math.min(y1, y)));
      if (prev) painter.line(prev[0], prev[1], px, py, { stroke: col, sw: f.sw || 2 });
      prev = [px, py];
    }
  }
  return { mx: mx, my: my };
}

function dot(painter, x, y, colour, hollow) {
  painter.circle(x, y, 5, { fill: hollow ? '#ffffff' : colour, stroke: colour, sw: 1.8 });
}

/* ---------------- scene 1 ---------------- */

function sceneLimit(painter, t) {
  head(painter, 'scene 1', 'A limit is the value approached, not the value reached');

  panel(painter, 24, 64, 400, 216, 'f(x) near x = -3');
  var m = plot(painter, 48, 92, 352, 150, [{ fn: f2021, color: PAL.accent, sw: 2.4 }],
    -3.9, -2.1, 0.242, 0.259);
  painter.line(m.mx(-3), 92, m.mx(-3), 242, { stroke: PAL.invalid, dash: [5, 4], sw: 1.2 });
  painter.line(48, m.my(0.25), 400, m.my(0.25), { stroke: PAL.invalid, dash: [5, 4], sw: 1.2 });
  dot(painter, m.mx(-3), m.my(0.25), PAL.invalid, true);
  painter.text(m.mx(-3) + 6, 96, 'hole at x = -3', { size: 10, mono: true, color: PAL.invalid });
  painter.text(52, m.my(0.25) - 15, '0.25', { size: 10, mono: true, color: PAL.invalid });
  painter.text(48, 250, 'x runs from -3.9 to -2.1', { size: 10, mono: true, color: PAL.faint });

  panel(painter, 440, 64, 436, 216, 'the two moves');
  var rows = [
    ['1', 'substitute x = -3', 'numerator 0, denominator 0'],
    ['2', 'form is 0 / 0', 'so substitution decides nothing'],
    ['3', "L'Hopital: derivative quotient", 'top 1/sqrt(2x+22), bottom 1'],
    ['4', 'now substitute again', '1/sqrt(16) = 0.25']
  ];
  for (var i = 0; i < rows.length; i++) {
    var y = 96 + i * 44;
    painter.text(456, y, rows[i][0], { size: 11, mono: true, color: PAL.faint });
    painter.text(474, y, rows[i][1], { size: 12, bold: i === 3, color: i === 3 ? PAL.valid : PAL.ink });
    painter.text(474, y + 17, rows[i][2], { size: 10, mono: true, color: PAL.dim });
  }

  panel(painter, 24, 292, 852, 154, 'the approach table: both sides climb to the same number');
  var xs = APPROACH, startX = 104;
  painter.text(30, 322, 'x', { size: 10, mono: true, color: PAL.faint });
  painter.text(30, 350, 'f(x)', { size: 10, mono: true, color: PAL.faint });
  for (var j = 0; j < xs.length; j++) {
    var cx = startX + j * 108;
    painter.text(cx, 322, xs[j].toFixed(3), { size: 11, mono: true, color: PAL.dim });
    var fv = f2021(xs[j]);
    painter.text(cx, 350, isNaN(fv) ? 'undefined' : fv.toFixed(5),
      { size: 11, mono: true, bold: !isNaN(fv), color: isNaN(fv) ? PAL.invalid : PAL.ink });
  }
  painter.text(48, 384, 'The value at x = -3 is never consulted. The limit is 0.25, and the function is not defined there.',
    { size: 11, color: PAL.ink });
  painter.text(48, 408, 'GATE CSE 2021 Set 1, 1-mark numerical: the answer key is 0.25.',
    { size: 11, mono: true, color: PAL.accent, bold: true });
  painter.text(48, 428, 'Rationalising the numerator instead of differentiating gives the same 0.25.',
    { size: 10, mono: true, color: PAL.dim });
}

/* ---------------- scene 2 ---------------- */

function sceneForms(painter, t) {
  head(painter, 'scene 2', 'Five indeterminate forms, five different moves');

  panel(painter, 24, 64, 430, 300, 'what the shape permits');
  var rows = [
    ['0 / 0', "L'Hopital applies directly", PAL.valid],
    ['inf / inf', "L'Hopital applies directly", PAL.valid],
    ['0 x inf', 'put one factor under the other', PAL.warn],
    ['inf - inf', 'one fraction over a common denominator', PAL.warn],
    ['1 ^ inf', 'take ln, differentiate, exponentiate', PAL.warn]
  ];
  for (var i = 0; i < rows.length; i++) {
    var y = 98 + i * 52;
    painter.rect(40, y - 6, 398, 44, { fill: i < 2 ? PAL.accentDim : PAL.warnDim, radius: 6, sw: 0 });
    painter.text(52, y + 4, rows[i][0], { size: 13, mono: true, bold: true, color: rows[i][2] });
    painter.text(150, y + 5, rows[i][1], { size: 11, color: PAL.ink });
  }
  painter.text(40, 356, 'Two shapes are licensed. The other three must be rewritten first.',
    { size: 11, color: PAL.dim });

  panel(painter, 470, 64, 406, 146, 'x^(1/x) as x grows');
  var m = plot(painter, 490, 92, 366, 96, [{ fn: powerForm, color: PAL.accent, sw: 2.2 }], 1, 60, 0.9, 1.5);
  painter.line(490, m.my(1), 856, m.my(1), { stroke: PAL.valid, dash: [4, 4], sw: 1.2 });
  painter.text(856, m.my(1) - 14, 'limit 1', { size: 10, mono: true, color: PAL.valid, align: 'right' });
  painter.text(494, 194, '1.44 at x = 3, then down', { size: 9, mono: true, color: PAL.faint });

  panel(painter, 470, 218, 406, 146, 'so the logarithm decides it');
  var lines = [
    ['ln y = ln(x) / x', PAL.ink],
    ["L'Hopital: (1/x) / 1", PAL.ink],
    ['that tends to 0', PAL.ink],
    ['y = e^0 = 1', PAL.valid]
  ];
  for (var k = 0; k < lines.length; k++) {
    painter.text(488, 250 + k * 28, lines[k][0],
      { size: 12, mono: true, bold: k === 3, color: lines[k][1] });
  }

  panel(painter, 24, 376, 852, 78, 'the other direction');
  painter.text(40, 404, '(1 + x^2) e^(-x) is inf x 0. As (1 + x^2)/e^x it is inf / inf, and two applications leave 2/e^x, which is 0.',
    { size: 11, color: PAL.ink });
  painter.text(40, 428, 'The exponential beats every polynomial: GATE CSE 2015 Set 1 and Set 3 both rest on this.',
    { size: 10, mono: true, color: PAL.dim });
}

/* ---------------- scene 3 ---------------- */

function sceneCont(painter, t) {
  head(painter, 'scene 3', 'Continuity: three conditions that must all hold');

  panel(painter, 24, 64, 400, 200, 'continuous at a means');
  var conds = [
    'the two-sided limit exists',
    'f(a) is defined',
    'the two are equal'
  ];
  for (var i = 0; i < conds.length; i++) {
    var y = 100 + i * 34;
    painter.circle(52, y + 6, 7, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.4 });
    painter.text(52, y + 2, String(i + 1), { size: 10, mono: true, color: PAL.accent, align: 'center', bold: true });
    painter.text(70, y, conds[i], { size: 12, color: PAL.ink });
  }
  painter.text(40, 214, 'Fail any one and the function is discontinuous there.',
    { size: 11, color: PAL.dim });
  painter.text(40, 238, 'A jump, a hole and a blow-up are the three pictures.',
    { size: 11, color: PAL.dim });

  panel(painter, 440, 64, 436, 200, 'why the logarithm decides this one');
  painter.text(456, 96, 'x', { size: 10, mono: true, color: PAL.faint });
  painter.text(560, 96, 'ln(1/x)', { size: 10, mono: true, color: PAL.faint });
  painter.text(700, 96, 'c1 e^x - c2 ln(1/x)', { size: 10, mono: true, color: PAL.faint });
  var xs = [1, 0.1, 0.01, 0.001];
  for (var j = 0; j < xs.length; j++) {
    var yy = 124 + j * 30;
    painter.text(456, yy, String(xs[j]), { size: 11, mono: true, color: PAL.dim });
    painter.text(560, yy, Math.log(1 / xs[j]).toFixed(3), { size: 11, mono: true, color: PAL.warn });
    painter.text(700, yy, piece2026(xs[j], 3, 1).toFixed(2), { size: 11, mono: true, color: PAL.invalid });
  }
  painter.text(456, 248, 'with c2 = 1 the value dives; with c2 = 0 it is c1 e^x, which tends to c1.',
    { size: 10, color: PAL.dim });

  panel(painter, 24, 276, 852, 170, 'GATE CSE 2026 Set 1: find c1 + c2');
  var steps = [
    'f(x) = c1 e^x - c2 ln(1/x) for x > 0, and f(x) = 3 otherwise.',
    'As x tends to 0 from above, e^x tends to 1 but ln(1/x) tends to +infinity.',
    'A finite limit is possible only if the coefficient of that term is 0, so c2 = 0.',
    'Then the limit is c1, and continuity needs c1 = 3. So c1 + c2 = 3.'
  ];
  for (var k = 0; k < steps.length; k++) {
    painter.text(40, 308 + k * 30, steps[k], {
      size: 11.5, mono: k === 0, bold: k === 3,
      color: k === 3 ? PAL.valid : PAL.ink
    });
  }
  painter.text(40, 428, 'No derivative was used: continuity is a statement about values.',
    { size: 10, mono: true, color: PAL.faint });
}

/* ---------------- scene 4 ---------------- */

function sceneDiff(painter, t) {
  head(painter, 'scene 4', 'Differentiable means continuous, and the converse fails');

  panel(painter, 24, 64, 420, 216, 'max{x, x^3} and its three corners');
  var m = plot(painter, 46, 92, 376, 152, [
    { fn: function (x) { return x; }, color: PAL.faint, sw: 1.2 },
    { fn: function (x) { return x * x * x; }, color: PAL.info, sw: 1.2 },
    { fn: maxXCube, color: PAL.accent, sw: 2.6 }
  ], -1.6, 1.6, -3.2, 3.2);
  var ks = [-1, 0, 1];
  for (var i = 0; i < ks.length; i++) dot(painter, m.mx(ks[i]), m.my(ks[i]), PAL.invalid, false);
  painter.text(52, 252, 'thick: the larger of the two. dots: where the winner changes.',
    { size: 9.5, mono: true, color: PAL.faint });

  panel(painter, 460, 64, 416, 216, 'one-sided slopes at each candidate');
  painter.text(476, 96, 'x', { size: 10, mono: true, color: PAL.faint });
  painter.text(536, 96, 'from left', { size: 10, mono: true, color: PAL.faint });
  painter.text(636, 96, 'from right', { size: 10, mono: true, color: PAL.faint });
  painter.text(756, 96, 'verdict', { size: 10, mono: true, color: PAL.faint });
  for (var j = 0; j < ks.length; j++) {
    var y = 128 + j * 34;
    var sp = slopePair(maxXCube, ks[j]);
    painter.text(476, y, String(ks[j]), { size: 12, mono: true, color: PAL.ink, bold: true });
    painter.text(536, y, sp[0].toFixed(2), { size: 11, mono: true, color: PAL.dim });
    painter.text(636, y, sp[1].toFixed(2), { size: 11, mono: true, color: PAL.dim });
    painter.text(756, y, 'corner', { size: 11, mono: true, color: PAL.invalid, bold: true });
  }
  painter.text(476, 248, 'No pair agrees, so no derivative at any of the three.',
    { size: 10.5, color: PAL.dim });

  panel(painter, 24, 292, 852, 154, 'GATE CSE 2024 Set 1: where is it not differentiable?');
  painter.text(40, 324, 'The two formulas cross where x^3 = x, that is x(x - 1)(x + 1) = 0, so at x = -1, 0 and 1.',
    { size: 11.5, color: PAL.ink });
  painter.text(40, 352, 'Away from those points the function agrees with a polynomial on a whole neighbourhood, so it is smooth there.',
    { size: 11.5, color: PAL.ink });
  painter.text(40, 384, 'Answer: the set { -1, 0, 1 }',
    { size: 13, mono: true, bold: true, color: PAL.valid });
  painter.text(40, 414, '|x| at 0 is the same failure with one point: continuous, slopes -1 and +1.',
    { size: 10.5, mono: true, color: PAL.dim });
  painter.text(40, 432, 'Differentiable implies continuous. Continuous does not imply differentiable.',
    { size: 10.5, mono: true, color: PAL.warn });
}

/* ---------------- scene 5 ---------------- */

function sceneMvt(painter, t) {
  head(painter, 'scene 5', 'The mean value theorem: an average slope is an actual slope');

  panel(painter, 24, 64, 440, 226, 'a chord, and a tangent parallel to it');
  var m = plot(painter, 48, 92, 392, 156, [
    { fn: mvtCurved, color: PAL.accent, sw: 2.4 }
  ], -3, 3, 6, 20);
  painter.line(m.mx(-3), m.my(7), m.mx(3), m.my(14.5), { stroke: PAL.info, sw: 1.8 });
  painter.line(m.mx(-3), m.my(7), m.mx(3), m.my(19), { stroke: PAL.invalid, dash: [5, 4], sw: 1.4 });
  dot(painter, m.mx(-3), m.my(7), PAL.ink, false);
  dot(painter, m.mx(3), m.my(14.5), PAL.ink, false);
  dot(painter, m.mx(0), m.my(11.875), PAL.valid, false);
  painter.line(m.mx(-0.9), m.my(11.875 - 1.125), m.mx(0.9), m.my(11.875 + 1.125), { stroke: PAL.valid, sw: 1.6 });
  painter.text(m.mx(0) + 8, m.my(11.875) - 20, 'c', { size: 11, mono: true, color: PAL.valid, bold: true });
  painter.text(56, 108, 'slope 2: the steepest allowed', { size: 9.5, mono: true, color: PAL.invalid });
  painter.text(56, 240, 'curve: f prime never above 2', { size: 9.5, mono: true, color: PAL.accent });

  panel(painter, 480, 64, 396, 226, 'the statement');
  painter.text(496, 96, 'hypotheses', { size: 10, mono: true, color: PAL.faint });
  painter.text(496, 116, 'continuous on [a, b]', { size: 11.5, color: PAL.ink });
  painter.text(496, 138, 'differentiable on (a, b)', { size: 11.5, color: PAL.ink });
  painter.text(496, 170, 'conclusion', { size: 10, mono: true, color: PAL.faint });
  painter.text(496, 190, 'some c in (a, b) has', { size: 11.5, color: PAL.ink });
  painter.text(496, 212, "f'(c) = ( f(b) - f(a) ) / ( b - a )", { size: 12, mono: true, color: PAL.accent, bold: true });
  painter.text(496, 244, 'exists, not for all; and not unique', { size: 10.5, color: PAL.dim });
  painter.text(496, 266, "Rolle's theorem is the case f(a) = f(b)", { size: 10.5, color: PAL.dim });

  panel(painter, 24, 302, 852, 144, 'GATE CSE 2021 Set 2: f prime at most 2 on (-3, 3), f(-3) = 7');
  var chain = [
    'By MVT some c has ( f(3) - 7 ) / 6 = f\'(c), and every interior slope is at most 2.',
    'So f(3) - 7 is at most 12, which gives f(3) at most 19.',
    'The line 2x + 13 satisfies both hypotheses and reaches 19, so no smaller bound exists.'
  ];
  for (var i = 0; i < chain.length; i++) {
    painter.text(40, 334 + i * 28, chain[i], { size: 11.5, color: i === 1 ? PAL.ink : PAL.dim, bold: i === 1 });
  }
  painter.text(40, 424, 'Answer: 19', { size: 13, mono: true, bold: true, color: PAL.valid });
  painter.text(180, 424, 'the width 6 is what turns a slope bound into a value bound',
    { size: 10.5, mono: true, color: PAL.faint });
}

/* ---------------- scene 6 ---------------- */

function sceneExtrema(painter, t) {
  head(painter, 'scene 6', 'Maxima and minima: find the critical points, then classify');

  panel(painter, 24, 64, 852, 96, 'GATE CSE 2023: f(x) = x^3 + 15x^2 - 33x - 36');
  painter.text(40, 96, "f'(x) = 3x^2 + 30x - 33 = 3(x + 11)(x - 1)", { size: 13, mono: true, color: PAL.accent, bold: true });
  painter.text(40, 124, 'critical points: x = -11 and x = 1, and a quadratic has no third root',
    { size: 11, color: PAL.ink });
  painter.text(600, 96, 'f( -11 ) = 811', { size: 10.5, mono: true, color: PAL.faint });
  painter.text(600, 120, 'f( 1 ) = -53', { size: 10.5, mono: true, color: PAL.faint });

  panel(painter, 24, 172, 852, 108, 'the sign of f prime, which is the classification');
  painter.line(70, 226, 830, 226, { stroke: PAL.border, sw: 1.4 });
  var segs = [
    [70, 300, '+', 'climbing', PAL.valid],
    [300, 570, '-', 'falling', PAL.invalid],
    [570, 830, '+', 'climbing', PAL.valid]
  ];
  for (var i = 0; i < segs.length; i++) {
    painter.line(segs[i][0], 226, segs[i][1], 226, { stroke: segs[i][4], sw: 3 });
    painter.text((segs[i][0] + segs[i][1]) / 2, 200, segs[i][2], { size: 16, mono: true, bold: true, color: segs[i][4], align: 'center' });
    painter.text((segs[i][0] + segs[i][1]) / 2, 236, segs[i][3], { size: 10, mono: true, color: PAL.dim, align: 'center' });
  }
  dot(painter, 300, 226, PAL.warn, false);
  dot(painter, 570, 226, PAL.warn, false);
  painter.text(300, 252, 'x = -11: local maximum', { size: 10.5, mono: true, color: PAL.warn, align: 'center' });
  painter.text(570, 252, 'x = 1: local minimum', { size: 10.5, mono: true, color: PAL.warn, align: 'center' });

  panel(painter, 24, 292, 852, 154, 'the second derivative agrees, and settles the multiple-select');
  painter.text(40, 322, "f''(x) = 6x + 30", { size: 12, mono: true, color: PAL.ink });
  painter.text(40, 350, "at -11: -36, negative, concave down, local maximum", { size: 11.5, mono: true, color: PAL.ink });
  painter.text(40, 374, 'at 1: +36, positive, concave up, local minimum', { size: 11.5, mono: true, color: PAL.ink });
  painter.text(40, 406, 'True: B (has a local maximum) and D (has a local minimum).',
    { size: 12.5, bold: true, color: PAL.valid });
  painter.text(40, 430, 'A and C are the negations, and they are false. Derivative zero alone would not have settled it.',
    { size: 10.5, mono: true, color: PAL.dim });
}

/* ---------------- scene 7 ---------------- */

function sceneClosed(painter, t) {
  head(painter, 'scene 7', 'On a closed interval the endpoints can win');

  panel(painter, 24, 64, 430, 216, '2x^2 - 2x + 6 on [0, 2]');
  var m = plot(painter, 48, 92, 382, 150, [{ fn: parab, color: PAL.accent, sw: 2.4 }], 0, 2, 4, 11);
  dot(painter, m.mx(0), m.my(6), PAL.info, false);
  dot(painter, m.mx(0.5), m.my(5.5), PAL.warn, false);
  dot(painter, m.mx(2), m.my(10), PAL.valid, false);
  painter.text(m.mx(0) + 6, m.my(6) - 18, '6', { size: 10, mono: true, color: PAL.info });
  painter.text(m.mx(0.5), m.my(5.5) + 8, '5.5', { size: 10, mono: true, color: PAL.warn, align: 'center' });
  painter.text(m.mx(2) - 8, m.my(10) + 8, '10', { size: 10, mono: true, color: PAL.valid, align: 'right' });
  painter.text(52, 250, 'the vertex is the minimum, not the maximum', { size: 9.5, mono: true, color: PAL.faint });

  panel(painter, 470, 64, 406, 216, 'the complete candidate list');
  painter.text(486, 96, 'candidate', { size: 10, mono: true, color: PAL.faint });
  painter.text(700, 96, 'f(x)', { size: 10, mono: true, color: PAL.faint });
  var cand = [
    ['x = 0  (endpoint)', '6', PAL.info],
    ['x = 1/2  (vertex)', '5.5', PAL.warn],
    ['x = 2  (endpoint)', '10', PAL.valid]
  ];
  for (var i = 0; i < cand.length; i++) {
    var y = 128 + i * 34;
    painter.text(486, y, cand[i][0], { size: 11.5, mono: true, color: PAL.ink });
    painter.text(700, y, cand[i][1], { size: 12, mono: true, bold: true, color: cand[i][2] });
  }
  painter.text(486, 240, 'Maximum 10 at x = 2. Minimum 5.5 at x = 1/2.', { size: 11.5, bold: true, color: PAL.valid });
  painter.text(486, 262, 'GATE CSE 1997: the answer is 10.', { size: 10.5, mono: true, color: PAL.dim });

  panel(painter, 24, 292, 852, 154, 'and a maximum can sit where no derivative exists');
  painter.text(40, 322, '1 - |x| on [-1, 1] rises to 1 at x = 0 and falls to 0 at both ends.',
    { size: 11.5, color: PAL.ink });
  painter.text(40, 348, 'At that peak the two one-sided slopes are -1 and +1, so there is no derivative there at all.',
    { size: 11.5, color: PAL.ink });
  painter.text(40, 380, 'Rule: critical points, points where f prime fails to exist, and both endpoints.',
    { size: 11.5, mono: true, color: PAL.accent, bold: true });
  painter.text(40, 410, 'A closed interval is read literally. An answer at an endpoint is normal, not suspicious.',
    { size: 10.5, mono: true, color: PAL.dim });
  painter.text(40, 430, 'Comparing slopes instead of values is the mistake this scene exists to prevent.',
    { size: 10.5, mono: true, color: PAL.warn });
}

/* ---------------- scene 8 ---------------- */

function sceneInteg(painter, t) {
  head(painter, 'scene 8', 'Integration by substitution, including the sign');

  panel(painter, 24, 64, 420, 186, 'the rule');
  painter.text(40, 96, 'u = g(x),  du = g\'(x) dx', { size: 13, mono: true, color: PAL.accent, bold: true });
  painter.text(40, 126, 'the integrand must contain g and g\'', { size: 11, color: PAL.ink });
  painter.text(40, 150, 'the limits are in x, so they change too', { size: 11, color: PAL.ink });
  painter.text(40, 174, 'reversing the limits multiplies by -1', { size: 11, color: PAL.ink });
  painter.text(40, 208, 'Everything left over must be in u alone.', { size: 11, color: PAL.dim });
  painter.text(40, 230, 'A stray x after substituting means the wrong u.', { size: 10.5, mono: true, color: PAL.warn });

  panel(painter, 460, 64, 416, 186, 'GATE CSE 2015 Set 1');
  painter.text(476, 96, 'u = 1/x', { size: 12, mono: true, color: PAL.ink });
  painter.text(476, 120, 'du = -dx / x^2', { size: 12, mono: true, color: PAL.invalid, bold: true });
  painter.text(476, 148, 'x = 1/pi  ->  u = pi', { size: 11, mono: true, color: PAL.dim });
  painter.text(476, 170, 'x = 2/pi  ->  u = pi/2', { size: 11, mono: true, color: PAL.dim });
  painter.text(476, 200, 'the minus flips them: pi/2 up to pi', { size: 11, mono: true, color: PAL.warn });
  painter.text(476, 228, 'so the integral is cos u du from pi/2 to pi', { size: 10.5, mono: true, color: PAL.dim });

  panel(painter, 24, 266, 852, 180, 'evaluate, then check by quadrature');
  painter.text(40, 298, 'antiderivative sin u, so sin(pi) - sin(pi/2) = 0 - 1 = -1',
    { size: 12.5, mono: true, bold: true, color: PAL.valid });
  painter.text(40, 326, 'Simpson on 4000 panels of the original integrand: ' + simpson(integrand, INTEG.a, INTEG.b, 4000).toFixed(9),
    { size: 11, mono: true, color: PAL.ink });
  painter.text(40, 352, 'Dropping the minus sign gives +1, which is the distractor the paper offered.',
    { size: 11, color: PAL.ink });
  painter.text(40, 380, 'A definite integral is a number. The constant of integration cancels, so never write + C.',
    { size: 11, color: PAL.ink });
  painter.text(40, 410, 'The integrand is negative on part of this interval, so a negative answer is expected.',
    { size: 10.5, mono: true, color: PAL.dim });
  painter.text(40, 432, 'Check the sign of the integrand before you distrust your own arithmetic.',
    { size: 10.5, mono: true, color: PAL.warn });
}

/* ---------------- scene 9 ---------------- */

function sceneSymmetry(painter, t) {
  head(painter, 'scene 9', 'Symmetry: the integral you never have to compute');

  panel(painter, 24, 64, 420, 216, 'an odd function over a symmetric interval');
  painter.rect(48, 92, 186, 150, { fill: PAL.invalidDim, radius: 0, sw: 0 });
  painter.rect(234, 92, 186, 150, { fill: PAL.accentDim, radius: 0, sw: 0 });
  var m = plot(painter, 48, 92, 372, 150, [{ fn: function (x) { return x * x * x; }, color: PAL.info, sw: 2.4 }],
    -1, 1, -1, 1);
  painter.text(120, 246, 'negative area', { size: 10, mono: true, color: PAL.invalid, align: 'center' });
  painter.text(330, 246, 'positive area', { size: 10, mono: true, color: PAL.accent, align: 'center' });
  painter.text(56, 268, 'equal and opposite, so the total is 0', { size: 10.5, mono: true, color: PAL.dim });

  panel(painter, 460, 64, 416, 216, 'GATE CSE 2023: the triple integral');
  painter.text(476, 96, '4x^2 y - z^3', { size: 13, mono: true, color: PAL.accent, bold: true });
  painter.text(476, 122, 'x in [-3, 3],  y in [-2, 2],  z in [-1, 1]', { size: 10.5, mono: true, color: PAL.dim });
  painter.text(476, 154, 'first term: odd in y', { size: 11.5, mono: true, color: PAL.ink });
  painter.text(476, 174, 'so the y-integral is 0', { size: 10.5, mono: true, color: PAL.valid });
  painter.text(476, 202, 'second term: z^3 odd in z', { size: 11.5, mono: true, color: PAL.ink });
  painter.text(476, 222, 'so the z-integral is 0', { size: 10.5, mono: true, color: PAL.valid });
  painter.text(476, 254, 'Both vanish: the answer is 0', { size: 12.5, mono: true, bold: true, color: PAL.valid });

  panel(painter, 24, 296, 852, 150, 'the same idea as a reflection, GATE CSE 2024 Set 2');
  painter.text(40, 326, 'If f(x) = 1 - f(2 - x), substitute u = 2 - x: the integral over [0, 2] equals 2 minus itself.',
    { size: 11.5, color: PAL.ink });
  painter.text(40, 352, 'A number equal to 2 minus itself is 1, so the integral is 1. The width is what makes it 1 and not 1/2.',
    { size: 11.5, color: PAL.ink });
  painter.text(40, 384, 'Answer: 1', { size: 13, mono: true, bold: true, color: PAL.valid });
  painter.text(140, 384, 'f(x) = x/2 satisfies the relation and integrates to 1, which checks it.',
    { size: 10.5, mono: true, color: PAL.dim });
  painter.text(40, 414, 'Odd over a symmetric interval is 0. Even over a symmetric interval is twice one half.',
    { size: 10.5, mono: true, color: PAL.warn });
  painter.text(40, 432, 'Neither rule applies to an interval that is not symmetric about 0.',
    { size: 10.5, mono: true, color: PAL.warn });
}

/* ---------------- scene 10 ---------------- */

function sceneProcedure(painter, t) {
  head(painter, 'scene 10', 'The four-step procedure and the traps it avoids');

  var steps = [
    ['1', 'Substitute. If a number comes out, that is the limit.',
      'settles 2016 Set 1 and most 1-mark items', PAL.accent],
    ['2', "Only 0/0 and inf/inf license L'Hopital. Rewrite the rest.",
      'settles 2021 Set 1 (0.25) and 2015 Set 1 (1)', PAL.info],
    ['3', 'For extrema: critical points plus both endpoints, then compare values.',
      'settles 2023 (B, D) and 1997 (10)', PAL.warn],
    ['4', 'Before integrating: symmetry, an inner derivative, and the sign of du.',
      'settles 2023 (0), 2024 Set 2 (1), 2015 Set 1 (-1)', PAL.valid]
  ];
  for (var i = 0; i < steps.length; i++) {
    var y = 64 + i * 92;
    panel(painter, 24, y, 852, 80, null);
    painter.circle(58, y + 40, 15, { fill: PAL.surface2, stroke: steps[i][3], sw: 1.6 });
    painter.text(58, y + 33, steps[i][0], { size: 13, mono: true, bold: true, color: steps[i][3], align: 'center' });
    painter.text(86, y + 20, steps[i][1], { size: 12.5, color: PAL.ink, bold: true });
    painter.text(86, y + 46, steps[i][2], { size: 10.5, mono: true, color: PAL.dim });
    painter.text(856, y + 20, '', { size: 10 });
  }
  painter.text(24, 440, 'Read the interval literally, keep the minus sign, and compare values rather than slopes.',
    { size: 11, mono: true, color: PAL.accent, bold: true });
}

var SCENES = {
  limit: sceneLimit,
  forms: sceneForms,
  cont: sceneCont,
  diff: sceneDiff,
  mvt: sceneMvt,
  extrema: sceneExtrema,
  closed: sceneClosed,
  integ: sceneInteg,
  symmetry: sceneSymmetry,
  procedure: sceneProcedure
};

function drawFrame(painter) {
  if (!painter) return;
  var tl = window.LESSON_TIMELINE;
  var tt = K.state.elapsed;
  var idx = K.sceneAt(tt);
  var sc = tl.scenes[idx];
  painter.alpha(1);
  painter.clear();
  bg(painter);
  if (sc && SCENES[sc.id]) {
    try {
      SCENES[sc.id](painter, tt - sc.start);
    } catch (err) {
      console.error('scene draw failed', sc.id, err);
    }
  }
}

function fillChecks() {
  var el = document.getElementById('checks');
  if (!el) return;
  var passed = CHECKS.filter(function (c) { return c.pass; }).length;
  var html = '<span class="k">Model checks</span>' +
    '<span class="ok">' + passed + ' / ' + CHECKS.length + ' passed</span>';
  html += '<details style="margin-top:5px"><summary style="cursor:pointer;color:var(--text-faint)">what was checked</summary>';
  CHECKS.forEach(function (c) {
    html += '<div style="margin-top:3px">' +
      (c.pass ? '<span class="ok">\u2713</span>' : '<span style="color:var(--invalid)">\u2717</span> ') +
      c.name + (c.detail ? '<br><span style="opacity:.7">' + c.detail + '</span>' : '') +
      '</div>';
  });
  html += '</details>';
  el.innerHTML = html;
}

/* ======================================================================
   LAYER 3 - BOOT
   ====================================================================== */

function boot() {
  buildChecks();
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

  K.onResize(function () {
    if (P) drawFrame(P);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { if (P) drawFrame(P); });
  }

  window.__drawAt = function (t) {
    K.state.elapsed = t;
    if (P) drawFrame(P);
  };

  window.__lessonChecks = CHECKS;
  var bad = CHECKS.filter(function (c) { return !c.pass; });
  if (bad.length) console.warn('Model validation did not fully pass:', bad);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
})();
