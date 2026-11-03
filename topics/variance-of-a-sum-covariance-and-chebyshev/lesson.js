/* ==========================================================================
   variance-of-a-sum-covariance-and-chebyshev — lesson.js
   Four layers, in order:
     1. THE MODEL      — four joint distributions built as lists of equally
                         likely atoms, the distributions of their sums, the
                         covariance identity, the two tight families for the
                         inequalities, and the sample-size formula.
     2. THE CHECKS     — every identity re-derived by an independent route.
     3. RENDER         — reads the model; builds nothing.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   Nothing on the canvas is a remembered value. The means, variances,
   covariances, the distribution of each sum and both bounds are produced here
   and re-checked against a second computation that does not share their code.
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
  var VAL = PAL.valid, BAD = PAL.invalid, WARN = PAL.warn;
  var SURF2 = PAL.surface2, BORDER = PAL.border, SURF = PAL.surface;
  var ACCDIM = PAL.accentDim || '#d6efeb';
  var BADDIM = PAL.invalidDim || '#fbe4e2';
  var WARNDIM = PAL.warnDim || '#fbeed3';

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

function near(a, b, tol) { return Math.abs(a - b) <= (tol === undefined ? 1e-9 : tol); }

/* ---------- an atom list: outcomes (x, y) with a probability each ---------- */
function atomsOf(list) {
  var t = 0;
  list.forEach(function (a) { t += a.p; });
  return { list: list, total: t };
}
function meanX(J) { var s = 0; J.list.forEach(function (a) { s += a.p * a.x; }); return s; }
function meanY(J) { var s = 0; J.list.forEach(function (a) { s += a.p * a.y; }); return s; }
function meanSqX(J) { var s = 0; J.list.forEach(function (a) { s += a.p * a.x * a.x; }); return s; }
function meanSqY(J) { var s = 0; J.list.forEach(function (a) { s += a.p * a.y * a.y; }); return s; }
function meanXY(J) { var s = 0; J.list.forEach(function (a) { s += a.p * a.x * a.y; }); return s; }
function varX(J) { var m = meanX(J); var s = 0; J.list.forEach(function (a) { s += a.p * (a.x - m) * (a.x - m); }); return s; }
function varY(J) { var m = meanY(J); var s = 0; J.list.forEach(function (a) { s += a.p * (a.y - m) * (a.y - m); }); return s; }
function covDef(J) {
  var mx = meanX(J), my = meanY(J), s = 0;
  J.list.forEach(function (a) { s += a.p * (a.x - mx) * (a.y - my); });
  return s;
}
/* the distribution of any function of the pair, by grouping the atoms */
function distribution(J, f) {
  var map = {}, order = [];
  J.list.forEach(function (a) {
    var v = f(a.x, a.y), k = String(v);
    if (!map[k]) { map[k] = { v: v, p: 0 }; order.push(k); }
    map[k].p += a.p;
  });
  return order.map(function (k) { return map[k]; }).sort(function (a, b) { return a.v - b.v; });
}
function meanOf(dist) { var s = 0; dist.forEach(function (d) { s += d.p * d.v; }); return s; }
function varOf(dist) {
  var m = meanOf(dist), s = 0;
  dist.forEach(function (d) { s += d.p * (d.v - m) * (d.v - m); });
  return s;
}

/* ---------- A. draw two of four balls, without replacement ---------- */
var BALLS = [1, 2, 3, 4], N_BALLS = 4, N_DRAW = 2;
var DRAW = (function () {
  var list = [];
  for (var i = 0; i < BALLS.length; i++) {
    for (var j = 0; j < BALLS.length; j++) {
      if (i === j) continue;
      list.push({ x: BALLS[i], y: BALLS[j], p: 1 / 12 });
    }
  }
  return atomsOf(list);
})();

var drawMean = meanX(DRAW);                       // 2.5
var drawVar = varX(DRAW);                         // 1.25
var drawEXY = meanXY(DRAW);                       // 70/12
var drawCovDef = covDef(DRAW);                    // -5/12
var drawCovShort = drawEXY - meanX(DRAW) * meanY(DRAW);
var drawRho = drawCovDef / (Math.sqrt(varX(DRAW)) * Math.sqrt(varY(DRAW)));
var drawSumDist = distribution(DRAW, function (x, y) { return x + y; });
var drawSumVar = varOf(drawSumDist);              // 5/3
var drawSumMean = meanOf(drawSumDist);            // 5
var drawSumSq = (function () {
  var s = 0; drawSumDist.forEach(function (d) { s += d.p * d.v * d.v; }); return s;
})();
var drawNaive = varX(DRAW) + varY(DRAW);          // 2.5
var drawThreeTerm = varX(DRAW) + varY(DRAW) + 2 * drawCovDef;
var fpc = N_DRAW * drawVar * (N_BALLS - N_DRAW) / (N_BALLS - 1);   // 5/3
/* the count of pairs whose product of deviations is negative */
var signCount = (function () {
  var mx = meanX(DRAW), my = meanY(DRAW), neg = 0, pos = 0, negSum = 0, posSum = 0;
  DRAW.list.forEach(function (a) {
    var pr = (a.x - mx) * (a.y - my);
    if (pr < 0) { neg++; negSum += a.p * pr; } else if (pr > 0) { pos++; posSum += a.p * pr; }
  });
  return { neg: neg, pos: pos, negSum: negSum, posSum: posSum };
})();
/* a linear combination of the same pair, enumerated directly */
var combVar = (function () {
  var d = distribution(DRAW, function (x, y) { return 2 * x - 3 * y; });
  return varOf(d);
})();
var combFormula = 4 * varX(DRAW) + 9 * varY(DRAW) + 2 * 2 * (-3) * drawCovDef;

/* ---------- B. one fair coin, three partners ---------- */
function coinPair(kind) {
  return atomsOf([
    { x: 0, y: kind === 'same' ? 0 : 1, p: 0.5 },
    { x: 1, y: kind === 'same' ? 1 : 0, p: 0.5 }
  ]);
}
var SAME = coinPair('same');
var COMP = coinPair('comp');
var sameVarSum = varOf(distribution(SAME, function (x, y) { return x + y; }));   // 1
var compVarSum = varOf(distribution(COMP, function (x, y) { return x + y; }));   // 0
var sameDiffVar = varOf(distribution(SAME, function (x, y) { return x - y; }));  // 0
var sameCov = covDef(SAME);                                                      // 0.25
var compCov = covDef(COMP);                                                      // -0.25
var coinVar = varX(SAME);                                                        // 0.25

/* ---------- C. X uniform on -1, 0, 1 and Y = X squared ---------- */
var QUAD = atomsOf([
  { x: -1, y: 1, p: 1 / 3 },
  { x: 0, y: 0, p: 1 / 3 },
  { x: 1, y: 1, p: 1 / 3 }
]);
var quadVarX = varX(QUAD), quadVarY = varY(QUAD);
var quadCov = covDef(QUAD);
var quadVarSum = varOf(distribution(QUAD, function (x, y) { return x + y; }));
var pBothOne = 1 / 3;
var pProd = (1 / 3) * (2 / 3);
var quadRho = quadCov / (Math.sqrt(quadVarX) * Math.sqrt(quadVarY));

/* ---------- D. three bits, the third the exclusive or of the first two ---------- */
var XOR3 = (function () {
  var list = [];
  for (var a = 0; a <= 1; a++) for (var b = 0; b <= 1; b++) {
    list.push({ a: a, b: b, c: (a + b) % 2, p: 0.25 });
  }
  return list;
})();
var xorCovs = (function () {
  function cv(f, g) {
    var mf = 0, mg = 0;
    XOR3.forEach(function (t) { mf += t.p * f(t); mg += t.p * g(t); });
    var s = 0;
    XOR3.forEach(function (t) { s += t.p * (f(t) - mf) * (g(t) - mg); });
    return s;
  }
  return [cv(function (t) { return t.a; }, function (t) { return t.b; }),
          cv(function (t) { return t.a; }, function (t) { return t.c; }),
          cv(function (t) { return t.b; }, function (t) { return t.c; })];
})();
var xorVarSum = (function () {
  var map = {}, order = [];
  XOR3.forEach(function (t) {
    var v = t.a + t.b + t.c, k = String(v);
    if (!map[k]) { map[k] = { v: v, p: 0 }; order.push(k); }
    map[k].p += t.p;
  });
  var d = order.map(function (k) { return map[k]; });
  return varOf(d);
})();
var xorAllZero = 0.25;                       // P(a=0,b=0,c=0)
var xorProdZero = 0.125;                     // product of the three marginals

/* ---------- E. the two-point variable for Markov ---------- */
var MARK = atomsOf([{ x: 0, y: 0, p: 0.9 }, { x: 10, y: 0, p: 0.1 }]);
var markMean = 0.9 * 0 + 0.1 * 10;                                  // 1
function markTail(a) { var s = 0; MARK.list.forEach(function (o) { if (o.x >= a) s += o.p; }); return s; }
function markBound(a) { return markMean / a; }

/* ---------- F. the family that attains Chebyshev, and two real shapes ---------- */
function tightFamily(k) {
  return [{ v: -k, p: 1 / (2 * k * k) }, { v: 0, p: 1 - 1 / (k * k) }, { v: k, p: 1 / (2 * k * k) }];
}
function tightVar(k) { return varOf(tightFamily(k)); }
function tightTail(k) {
  var s = 0; tightFamily(k).forEach(function (d) { if (Math.abs(d.v) >= k) s += d.p; }); return s;
}
var DIE = [1, 2, 3, 4, 5, 6].map(function (v) { return { v: v, p: 1 / 6 }; });
var dieMean = meanOf(DIE), dieVar = varOf(DIE);
function dieTail(k) {
  var s = 0, sd = Math.sqrt(dieVar);
  DIE.forEach(function (d) { if (Math.abs(d.v - dieMean) >= k * sd) s += d.p; });
  return s;
}
/* binomial(10, 1/2), built by convolution of ten fair bits */
var BIN10 = (function () {
  var d = [{ v: 0, p: 1 }];
  for (var i = 0; i < 10; i++) {
    var next = {};
    d.forEach(function (a) {
      [a.v, a.v + 1].forEach(function (v) {
        next[v] = (next[v] || 0) + a.p * 0.5;
      });
    });
    d = Object.keys(next).map(function (k) { return { v: Number(k), p: next[k] }; });
  }
  return d.sort(function (a, b) { return a.v - b.v; });
})();
var binMean = meanOf(BIN10), binVar = varOf(BIN10);
function binTail(k) {
  var s = 0, sd = Math.sqrt(binVar);
  BIN10.forEach(function (d) { if (Math.abs(d.v - binMean) >= k * sd - 1e-12) s += d.p; });
  return s;
}

/* ---------- G. sample size from a Chebyshev bound ---------- */
var SIGMA = 2, EPS = 0.5, DELTA = 0.05;
var needN = Math.ceil(SIGMA * SIGMA / (EPS * EPS * DELTA));      // 320
var normalN = Math.ceil(Math.pow(1.959963985 / EPS, 2) * SIGMA * SIGMA);  // 62

/* ---------- H. scaling and correlation of a linear map ---------- */
var scaleVar = 4 * drawVar;                                      // 5
var scaleSd = 2 * Math.sqrt(drawVar);

/* ======================================================================
   LAYER 2 - THE CHECKS
   Each one re-derives a number by a route that does not reuse the first.
   ====================================================================== */

chk('the twelve atoms of the draw carry total probability 1', near(DRAW.total, 1));
chk('the diagonal of the joint table is empty: no ball is drawn twice',
    DRAW.list.filter(function (a) { return a.x === a.y; }).length === 0,
    DRAW.list.length + ' ordered pairs');
chk('both margins are uniform on 1..4, so both means are 2.5',
    near(drawMean, 2.5) && near(meanY(DRAW), 2.5));
chk('the variance of one draw is 1.25 by definition and by E[X^2] - mean^2',
    near(drawVar, 1.25) && near(meanSqX(DRAW) - drawMean * drawMean, 1.25));
chk('covariance by the definition equals E[XY] - E[X]E[Y]',
    near(drawCovDef, drawCovShort),
    drawCovDef.toFixed(12) + ' against ' + drawCovShort.toFixed(12));
chk('that covariance is exactly minus 5/12', near(drawCovDef, -5 / 12));
chk('8 pairs give a negative product of deviations and 4 give a positive one',
    signCount.neg === 8 && signCount.pos === 4,
    'negative mass ' + signCount.negSum.toFixed(4) + ', positive ' + signCount.posSum.toFixed(4));
chk('the correlation of the two draws is minus one third', near(drawRho, -1 / 3));
chk('the sum takes only the values 3 to 7, with counts 2,2,4,2,2',
    drawSumDist.length === 5 &&
    drawSumDist.map(function (d) { return Math.round(d.p * 12); }).join(',') === '2,2,4,2,2');
chk('the variance of the sum read off its own distribution is 5/3',
    near(drawSumVar, 5 / 3), drawSumVar.toFixed(12));
chk('the three-term identity reproduces that number',
    near(drawThreeTerm, drawSumVar), drawThreeTerm.toFixed(12));
chk('the naive sum of variances, 2.5, is not that number',
    near(drawNaive, 2.5) && !near(drawNaive, drawSumVar));
chk('the finite-population formula n s^2 (N-n)/(N-1) gives the same 5/3',
    near(fpc, drawSumVar), fpc.toFixed(12));
chk('drawing all four balls gives variance 0 by that formula',
    near(N_BALLS * drawVar * (N_BALLS - N_BALLS) / (N_BALLS - 1), 0));
chk('Var(2X - 3Y) enumerated directly equals 4VarX + 9VarY - 12Cov',
    near(combVar, combFormula), combVar.toFixed(10) + ' against ' + combFormula.toFixed(10));
chk('with Y = X the sum has variance 1, twice the naive 0.5',
    near(sameVarSum, 1) && near(coinVar + coinVar, 0.5) && near(sameCov, 0.25));
chk('with Y = 1 - X the sum is constant, so its variance is 0',
    near(compVarSum, 0) && near(compCov, -0.25));
chk('with Y = X the difference is constant, so its variance is 0', near(sameDiffVar, 0));
chk('Y = X squared is uncorrelated with X: covariance 0 and rho 0',
    near(quadCov, 0) && near(quadRho, 0));
chk('yet the pair is dependent: 1/3 against the product 2/9',
    near(pBothOne, 1 / 3) && near(pProd, 2 / 9) && !near(pBothOne, pProd));
chk('uncorrelated is enough for the identity: 2/3 + 2/9 = 8/9 on both routes',
    near(quadVarSum, quadVarX + quadVarY) && near(quadVarSum, 8 / 9));
chk('the exclusive-or triple is pairwise uncorrelated, all three covariances 0',
    xorCovs.every(function (c) { return near(c, 0); }), xorCovs.map(function (c) { return c.toFixed(12); }).join(' '));
chk('its sum has variance 3/4, the sum of the three variances',
    near(xorVarSum, 0.75), xorVarSum.toFixed(12));
chk('but the three are not mutually independent: 1/4 against 1/8',
    near(xorAllZero, 0.25) && near(xorProdZero, 0.125));
chk('four independent copies of variance 1.25 give 5; four perfectly correlated give 20',
    near(4 * drawVar, 5) && near(16 * drawVar, 20));
chk('Markov at a = 10 is attained: bound 0.1 and tail 0.1',
    near(markBound(10), 0.1) && near(markTail(10), 0.1));
chk('Markov at a = 5 is loose: bound 0.2 against a tail of 0.1',
    near(markBound(5), 0.2) && near(markTail(5), 0.1));
chk('Markov at a = 0.5 exceeds 1, so it is vacuous', markBound(0.5) > 1);
chk('the tight family has variance exactly 1 for k = 2, 3, 4',
    [2, 3, 4].every(function (k) { return near(tightVar(k), 1); }));
chk('and its tail is exactly 1/k^2, so the bound cannot be improved',
    [2, 3, 4].every(function (k) { return near(tightTail(k), 1 / (k * k)); }));
chk('on a fair die the k = 2 tail is 0 while the bound says 0.25',
    near(dieTail(2), 0) && near(1 / 4, 0.25), 'die variance ' + dieVar.toFixed(6));
chk('on ten coin flips the k = 2 tail is 22/1024 against the bound 0.25',
    near(binTail(2), 22 / 1024), binTail(2).toFixed(6));
chk('the sample size from the Chebyshev bound is 320 draws',
    needN === 320, String(needN));
chk('a normal quantile would ask for 62, so the bound costs about five times as much',
    normalN === 62 && needN / normalN > 4, String(normalN));
chk('Var(2X) is 4 Var(X) while the standard deviation only doubles',
    near(scaleVar, 4 * drawVar) && near(scaleSd, 2 * Math.sqrt(drawVar)));

/* ---------- the numbers the canvas prints ---------- */
var V = {
  draw: DRAW,
  drawMean: drawMean, drawVar: drawVar, drawEXY: drawEXY,
  drawCov: drawCovDef, drawRho: drawRho,
  drawSumDist: drawSumDist, drawSumVar: drawSumVar,
  drawSumMean: drawSumMean, drawSumSq: drawSumSq,
  drawNaive: drawNaive, drawThree: drawThreeTerm, fpc: fpc,
  signCount: signCount,
  sameVarSum: sameVarSum, compVarSum: compVarSum, sameDiffVar: sameDiffVar,
  sameCov: sameCov, compCov: compCov, coinVar: coinVar,
  quadVarX: quadVarX, quadVarY: quadVarY, quadCov: quadCov,
  quadVarSum: quadVarSum, pBothOne: pBothOne, pProd: pProd,
  xorCovs: xorCovs, xorVarSum: xorVarSum, xorAllZero: xorAllZero, xorProdZero: xorProdZero,
  markMean: markMean, markTail: markTail, markBound: markBound,
  tight: tightFamily, tightVar: tightVar, tightTail: tightTail,
  dieMean: dieMean, dieVar: dieVar, dieTail: dieTail,
  binMean: binMean, binVar: binVar, binTail: binTail,
  needN: needN, normalN: normalN, SIGMA: SIGMA, EPS: EPS, DELTA: DELTA,
  scaleVar: scaleVar, scaleSd: scaleSd,
  combVar: combVar, combFormula: combFormula
};

/* ======================================================================
   LAYER 3 - RENDER
   Reads V. Nothing here computes a mean, a variance or a bound.
   ====================================================================== */

function prog(t, sc) {
  var span = Math.max(0.001, sc.end - sc.start);
  var p = (t - sc.start) / span;
  return p < 0 ? 0 : p > 1 ? 1 : p;
}
function txt(x, y, s, o) { if (P) P.text(x, y, s, o || {}); }
function heading(s) { txt(28, 18, s, { size: 15, bold: true, color: INK }); }
function subline(s) { txt(28, 40, s, { size: 11, color: DIM }); }
function label(x, y, s, c) { txt(x, y, s, { size: 9, bold: true, color: c || FAINT }); }
function body(x, y, s, o) {
  o = o || {};
  txt(x, y, s, { size: o.size || 10, color: o.color || INK, bold: o.bold, mono: o.mono });
}
function card(x, y, w, h, o) {
  o = o || {};
  if (!P) return;
  P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1, radius: o.radius || 6 });
}
function rule(x1, y1, x2, y2, c) { if (P) P.line(x1, y1, x2, y2, { stroke: c || BORDER, sw: 1 }); }
function dash(x1, y1, x2, y2, c) {
  if (P) P.line(x1, y1, x2, y2, { stroke: c || ACC, sw: 1, dash: [4, 4] });
}
function bullets(x, y, lines, p, start, step, o) {
  o = o || {};
  var lead = o.lead === undefined ? 19 : o.lead;
  for (var i = 0; i < lines.length; i++) {
    if (p < start + i * step) break;
    body(x, y + i * lead, lines[i], { size: o.size || 10, color: o.color || INK, mono: o.mono });
  }
}
/* a bar with a caption above and a tick below */
function bar(x, base, w, h, o) {
  o = o || {};
  if (P) P.rect(x, base - h, w, h, { fill: o.fill || ACCDIM, stroke: o.stroke || ACC, sw: 1, radius: 3 });
}
function fmt(x, d) { return Number(x).toFixed(d === undefined ? 3 : d); }

/* ---------- scene 1: two distributions, one mean ---------- */
function sceneSpread(t, sc) {
  var p = prog(t, sc);
  heading('Two distributions, one mean');
  subline('The mean fixes the centre. It says nothing about how far the mass sits from it.');

  card(24, 62, 436, 372);
  label(40, 78, 'BOTH ROWS HAVE MEAN 3');
  var xs = [76, 167, 258, 349, 440];
  rule(60, 150, 448, 150);
  rule(60, 222, 448, 222);
  dash(258, 112, 258, 250, ACC);
  label(40, 144, 'A');
  label(40, 216, 'B');
  for (var i = 0; i < 5; i++) {
    txt(xs[i], 158, String(i + 1), { size: 9, align: 'center', color: FAINT });
    txt(xs[i], 230, String(i + 1), { size: 9, align: 'center', color: FAINT });
  }
  if (P) {
    P.circle(258, 150, 9, { fill: ACC, stroke: ACC });
    P.circle(76, 222, 9, { fill: WARN, stroke: WARN });
    P.circle(440, 222, 9, { fill: WARN, stroke: WARN });
  }
  if (p > 0.15) {
    body(276, 132, 'all the mass at 3', { size: 10, color: ACC });
    body(96, 204, 'half at 1', { size: 10, color: WARN });
    body(390, 204, 'half at 5', { size: 10, color: WARN });
  }
  if (p > 0.4) {
    rule(40, 262, 444, 262);
    body(40, 276, 'A: every outcome is 3, so every deviation is 0.', { size: 10 });
    body(40, 294, '    The average squared deviation is 0.', { size: 10, color: DIM });
    body(40, 316, 'B: each deviation is 2, and 2 squared is 4, so', { size: 10 });
    body(40, 334, '    the average squared deviation is 4.', { size: 10, color: DIM });
  }
  if (p > 0.72) {
    card(40, 356, 404, 62, { fill: ACCDIM, stroke: ACC });
    body(56, 370, 'Variance is an average of squared distances.', { size: 10 });
    body(56, 390, 'Its square root is back in the data units.', { size: 10, bold: true, color: ACC });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'THE TWO NUMBERS, WRITTEN ONCE');
  body(488, 100, 'mean  mu = E[X]', { size: 10, mono: true });
  body(488, 120, 'var   = E[(X - mu)^2]', { size: 10, mono: true });
  body(488, 140, '      = E[X^2] - mu^2', { size: 10, mono: true });
  body(488, 160, 'sd    = sqrt(var)', { size: 10, mono: true });
  rule(488, 182, 860, 182);
  label(488, 196, 'COMPUTED FROM THE TWO ROWS');
  body(488, 216, 'A:  var 0.000   sd 0.000', { size: 10, mono: true });
  body(488, 236, 'B:  var 4.000   sd 2.000', { size: 10, mono: true });
  body(488, 264, 'A zero variance is not a small spread:', { size: 10 });
  body(488, 282, 'it forces P(X = 3) = 1.', { size: 10, bold: true });
  if (p > 0.5) {
    card(488, 312, 372, 76, { fill: BADDIM, stroke: BAD });
    body(504, 326, 'The mean is a balance point and', { size: 10 });
    body(504, 344, 'cannot see the distance from it.', { size: 10 });
    body(504, 366, 'The variance is that distance.', { size: 10, bold: true, color: BAD });
  }
}

/* ---------- scene 2: the joint table ---------- */
function sceneJoint(t, sc) {
  var p = prog(t, sc);
  heading('Two variables on one table');
  subline('Four balls numbered 1 to 4. Draw two without replacement: X first, then Y.');

  card(24, 62, 436, 372);
  label(40, 78, 'THE JOINT TABLE  p(x, y)  OF ONE ORDERED PAIR');
  var tx = 56, ty = 112, cw = 58, ch = 30;
  var rows = 6, cols = 6;
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var x = tx + c * cw, y = ty + r * ch;
      if (P) P.rect(x, y, cw, ch, { fill: (r === 0 || c === 0) ? SURF2 : SURF, stroke: BORDER, sw: 1 });
    }
  }
  /* headers */
  txt(tx + cw / 2, ty + 10, 'X \\ Y', { size: 8.5, align: 'center', color: FAINT });
  for (var c2 = 1; c2 <= 4; c2++) {
    txt(tx + c2 * cw + cw / 2, ty + 10, 'Y=' + c2, { size: 8.5, align: 'center', color: FAINT });
  }
  txt(tx + 5 * cw + cw / 2, ty + 10, 'P(X=x)', { size: 8.5, align: 'center', color: FAINT });
  for (var r2 = 1; r2 <= 4; r2++) {
    txt(tx + cw / 2, ty + r2 * ch + 10, 'X=' + r2, { size: 8.5, align: 'center', color: FAINT });
    txt(tx + 5 * cw + cw / 2, ty + r2 * ch + 10, '1/4', { size: 9, mono: true, align: 'center', color: ACC });
    for (var c3 = 1; c3 <= 4; c3++) {
      var same = (r2 === c3);
      txt(tx + c3 * cw + cw / 2, ty + r2 * ch + 10, same ? '0' : '1/12',
          { size: 9, mono: true, align: 'center', color: same ? FAINT : INK });
    }
  }
  txt(tx + cw / 2, ty + 5 * ch + 10, 'P(Y=y)', { size: 8.5, align: 'center', color: FAINT });
  for (var c4 = 1; c4 <= 4; c4++) {
    txt(tx + c4 * cw + cw / 2, ty + 5 * ch + 10, '1/4', { size: 9, mono: true, align: 'center', color: ACC });
  }
  txt(tx + 5 * cw + cw / 2, ty + 5 * ch + 10, '1', { size: 9, mono: true, align: 'center', color: ACC });

  if (p > 0.3) {
    body(40, 316, 'The diagonal is 0: the same ball cannot be drawn twice.', { size: 10 });
    body(40, 336, 'Twelve cells of 1/12 each, and twelve twelfths is 1.', { size: 10, color: DIM });
  }
  if (p > 0.6) {
    card(40, 356, 404, 62, { fill: ACCDIM, stroke: ACC });
    body(56, 370, 'Margins come from the table; the table does not', { size: 10 });
    body(56, 390, 'come from the margins. Two tables can share both.', { size: 10, bold: true, color: ACC });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'WHAT THE TABLE ALREADY GIVES');
  body(488, 102, 'E[X] = 2.500    E[Y] = 2.500', { size: 10, mono: true });
  body(488, 124, 'E[X^2] = 7.500  E[Y^2] = 7.500', { size: 10, mono: true });
  body(488, 146, 'Var(X) = 7.5 - 6.25 = 1.250', { size: 10, mono: true });
  body(488, 168, 'Var(Y) = 7.5 - 6.25 = 1.250', { size: 10, mono: true });
  rule(488, 190, 860, 190);
  label(488, 204, 'WHAT IT HAS NOT GIVEN YET');
  bullets(488, 224, [
    'whether the two variables drift together',
    'how much a sum of them varies',
    'any bound on how far a value can sit'
  ], p, 0.35, 0.1, { lead: 20 });
  if (p > 0.75) {
    card(488, 316, 372, 72, { fill: WARNDIM, stroke: WARN });
    body(504, 330, 'Both margins are uniform here, so the', { size: 10 });
    body(504, 348, 'margins look independent. They are not:', { size: 10 });
    body(504, 368, 'the second draw cannot repeat the first.', { size: 10, bold: true, color: WARN });
  }
}

/* ---------- scene 3: covariance ---------- */
function sceneCov(t, sc) {
  var p = prog(t, sc);
  heading('Covariance: the product of the two deviations');
  subline('Each dot is one of the twelve ordered pairs, placed at (x, y). Colour is the sign of the product.');

  card(24, 62, 436, 372);
  label(40, 78, 'THE TWELVE PAIRS, WITH THE MEANS AS AXES');
  var px = function (v) { return 60 + (v - 0.5) / 4 * 380; };
  var py = function (v) { return 300 - (v - 0.5) / 4 * 204; };
  rule(60, 300, 440, 300);
  rule(60, 96, 60, 300);
  dash(px(2.5), 96, px(2.5), 300, FAINT);
  dash(60, py(2.5), 440, py(2.5), FAINT);
  body(px(2.5) + 4, 86, 'mean X = 2.5', { size: 9, color: FAINT });
  body(64, 286, 'mean Y = 2.5', { size: 9, color: FAINT });
  if (P) {
    for (var i = 0; i < V.draw.list.length; i++) {
      var a = V.draw.list[i];
      var pr = (a.x - 2.5) * (a.y - 2.5);
      P.circle(px(a.x), py(a.y), 6, { fill: pr > 0 ? VAL : BAD, stroke: pr > 0 ? VAL : BAD });
    }
  }
  body(60, 308, 'red: opposite signs (8 pairs)   green: same sign (4 pairs)', { size: 9, color: DIM });
  if (p > 0.55) {
    body(40, 332, 'The eight red products total ' + fmt(V.signCount.negSum, 3) + ',', { size: 10 });
    body(40, 350, 'the four green ones total ' + fmt(V.signCount.posSum, 3) + '.', { size: 10 });
    body(40, 372, 'Dividing the sum by 12 gives ' + fmt(V.drawCov, 4) + '.', { size: 10, bold: true });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'TWO ROUTES TO THE SAME NUMBER');
  body(488, 100, 'E[XY]     = 70/12 = 5.8333', { size: 10, mono: true });
  body(488, 120, 'E[X]E[Y]  = 2.5 x 2.5 = 6.25', { size: 10, mono: true });
  body(488, 140, 'Cov       = 5.8333 - 6.25', { size: 10, mono: true });
  body(488, 160, '          = -0.4167', { size: 10, mono: true, bold: true });
  rule(488, 182, 860, 182);
  body(488, 196, 'By the definition, averaging', { size: 10 });
  body(488, 214, '(x - 2.5)(y - 2.5) over the 12 pairs:', { size: 10, mono: true });
  body(488, 232, 'the same -0.4167.', { size: 10, bold: true });
  rule(488, 254, 860, 254);
  body(488, 268, 'rho = Cov / (sd_x sd_y) = -1/3', { size: 10, mono: true });
  body(488, 292, 'The sign is the direction of drift.', { size: 10, bold: true });
  if (p > 0.6) {
    card(488, 314, 372, 76, { fill: ACCDIM, stroke: ACC });
    body(504, 328, 'Negative: a large first draw removes', { size: 10 });
    body(504, 346, 'a large ball, so the second draw', { size: 10 });
    body(504, 366, 'tends to be smaller.', { size: 10, bold: true, color: ACC });
  }
}

/* ---------- scene 4: variance of a sum ---------- */
function sceneSum(t, sc) {
  var p = prog(t, sc);
  heading('Variance of a sum: three terms, not two');
  subline('The same twelve pairs, read through the map (x, y) gives x + y.');

  card(24, 62, 436, 372);
  label(40, 78, 'THE DISTRIBUTION OF S = X + Y');
  var bx = [76, 150, 224, 298, 372], bw = 44, base = 274;
  for (var i = 0; i < V.drawSumDist.length; i++) {
    var d = V.drawSumDist[i];
    var h = Math.round(d.p * 12 * 16);
    bar(bx[i], base, bw, h, { fill: d.v === 5 ? ACCDIM : SURF2, stroke: d.v === 5 ? ACC : BORDER });
    txt(bx[i] + bw / 2, base - h - 16, Math.round(d.p * 12) + '/12', { size: 9, align: 'center', color: DIM });
    txt(bx[i] + bw / 2, base + 8, String(d.v), { size: 10, align: 'center', bold: true });
  }
  rule(60, base, 440, base);
  if (p > 0.35) {
    body(40, 306, 'E[S] = ' + fmt(V.drawSumMean, 2) + '    E[S^2] = ' + fmt(V.drawSumSq, 3), { size: 10, mono: true });
    body(40, 326, 'Var(S) = ' + fmt(V.drawSumSq, 3) + ' - ' + fmt(V.drawSumMean * V.drawSumMean, 2) +
                  ' = ' + fmt(V.drawSumVar, 3), { size: 10, mono: true });
    body(40, 350, 'That number used no formula at all: only', { size: 10 });
    body(40, 368, 'the bar heights above.', { size: 10, color: DIM });
  }
  if (p > 0.8) {
    card(40, 388, 404, 30, { fill: ACCDIM, stroke: ACC });
    body(56, 396, 'A convolution, computed by grouping atoms.', { size: 10, color: ACC });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'THE THREE TERMS');
  body(488, 102, 'Var(X)      =  1.250', { size: 10, mono: true });
  body(488, 124, 'Var(Y)      =  1.250', { size: 10, mono: true });
  body(488, 146, '2 Cov(X,Y)  = -0.833', { size: 10, mono: true });
  rule(488, 168, 860, 168);
  body(488, 182, 'total       =  1.667', { size: 10, mono: true, bold: true });
  body(488, 206, 'The same 1.667 the bars produced.', { size: 10, color: DIM });
  if (p > 0.4) {
    card(488, 228, 372, 62, { fill: BADDIM, stroke: BAD });
    body(504, 242, 'The naive sum is ' + fmt(V.drawNaive, 3) + '.', { size: 10 });
    body(504, 262, 'Wrong here: the covariance is not zero.', { size: 10, bold: true, color: BAD });
  }
  if (p > 0.68) {
    label(488, 310, 'THE EXACT COUNT FOR DRAWING WITHOUT REPLACEMENT');
    body(488, 330, 'Var(S) = n s^2 (N-n)/(N-1)', { size: 10, mono: true });
    body(488, 350, '       = 2 x 1.25 x 2/3 = ' + fmt(V.fpc, 3), { size: 10, mono: true });
    body(488, 372, 'Draw all four balls and the factor is 0,', { size: 10 });
    body(488, 390, 'because the sum is then always 10.', { size: 10, color: DIM });
  }
}

/* ---------- scene 5: dependent pairs ---------- */
function sceneDependent(t, sc) {
  var p = prog(t, sc);
  heading('When the third term refuses to vanish');
  subline('Let X be a fair coin. Give Y three different partners and compare the three sums.');

  card(24, 62, 436, 372);
  label(40, 78, 'THE PAIR AS A TABLE');
  /* case A table */
  var tx = 56, ty = 104, cw = 54, ch = 26;
  body(40, 90, 'A:  Y = X', { size: 10, bold: true });
  for (var r = 0; r < 3; r++) {
    for (var c = 0; c < 3; c++) {
      if (P) P.rect(tx + c * cw, ty + r * ch, cw, ch, { fill: (r === 0 || c === 0) ? SURF2 : SURF, stroke: BORDER, sw: 1 });
    }
  }
  txt(tx + cw / 2, ty + 8, 'X \\ Y', { size: 8.5, align: 'center', color: FAINT });
  txt(tx + 1 * cw + cw / 2, ty + 8, 'Y=0', { size: 8.5, align: 'center', color: FAINT });
  txt(tx + 2 * cw + cw / 2, ty + 8, 'Y=1', { size: 8.5, align: 'center', color: FAINT });
  txt(tx + cw / 2, ty + ch + 8, 'X=0', { size: 8.5, align: 'center', color: FAINT });
  txt(tx + cw / 2, ty + 2 * ch + 8, 'X=1', { size: 8.5, align: 'center', color: FAINT });
  txt(tx + 1 * cw + cw / 2, ty + ch + 8, '1/2', { size: 9, mono: true, align: 'center' });
  txt(tx + 2 * cw + cw / 2, ty + ch + 8, '0', { size: 9, mono: true, align: 'center', color: FAINT });
  txt(tx + 1 * cw + cw / 2, ty + 2 * ch + 8, '0', { size: 9, mono: true, align: 'center', color: FAINT });
  txt(tx + 2 * cw + cw / 2, ty + 2 * ch + 8, '1/2', { size: 9, mono: true, align: 'center' });
  body(250, 112, 'S = 0 or 2, each 1/2', { size: 10 });
  body(250, 130, 'Var(S) = 1', { size: 10, bold: true });
  body(250, 148, 'Cov = +0.25', { size: 10, mono: true });

  /* case B table */
  var ty2 = 186;
  body(40, 176, 'B:  Y = 1 - X', { size: 10, bold: true });
  for (var r2 = 0; r2 < 3; r2++) {
    for (var c2 = 0; c2 < 3; c2++) {
      if (P) P.rect(tx + c2 * cw, ty2 + r2 * ch, cw, ch, { fill: (r2 === 0 || c2 === 0) ? SURF2 : SURF, stroke: BORDER, sw: 1 });
    }
  }
  txt(tx + cw / 2, ty2 + 8, 'X \\ Y', { size: 8.5, align: 'center', color: FAINT });
  txt(tx + 1 * cw + cw / 2, ty2 + 8, 'Y=0', { size: 8.5, align: 'center', color: FAINT });
  txt(tx + 2 * cw + cw / 2, ty2 + 8, 'Y=1', { size: 8.5, align: 'center', color: FAINT });
  txt(tx + cw / 2, ty2 + ch + 8, 'X=0', { size: 8.5, align: 'center', color: FAINT });
  txt(tx + cw / 2, ty2 + 2 * ch + 8, 'X=1', { size: 8.5, align: 'center', color: FAINT });
  txt(tx + 1 * cw + cw / 2, ty2 + ch + 8, '0', { size: 9, mono: true, align: 'center', color: FAINT });
  txt(tx + 2 * cw + cw / 2, ty2 + ch + 8, '1/2', { size: 9, mono: true, align: 'center' });
  txt(tx + 1 * cw + cw / 2, ty2 + 2 * ch + 8, '1/2', { size: 9, mono: true, align: 'center' });
  txt(tx + 2 * cw + cw / 2, ty2 + 2 * ch + 8, '0', { size: 9, mono: true, align: 'center', color: FAINT });
  body(250, 194, 'S is always 1', { size: 10 });
  body(250, 212, 'Var(S) = 0', { size: 10, bold: true });
  body(250, 230, 'Cov = -0.25', { size: 10, mono: true });

  if (p > 0.5) {
    rule(40, 268, 444, 268);
    body(40, 282, 'Each part still has variance 0.25, so the naive', { size: 10 });
    body(40, 300, 'answer is 0.5 in both cases — and it is wrong', { size: 10 });
    body(40, 318, 'in both: the truth is 1 and 0.', { size: 10, bold: true });
  }
  if (p > 0.75) {
    card(40, 340, 404, 78, { fill: BADDIM, stroke: BAD });
    body(56, 354, 'Two terms that are both X are one piece', { size: 10 });
    body(56, 372, 'of randomness, not two. A sum of two', { size: 10 });
    body(56, 390, 'random parts can even be a constant.', { size: 10, bold: true, color: BAD });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'THE IDENTITY, APPLIED THREE TIMES');
  body(488, 100, 'A: 0.25 + 0.25 + 2(0.25) = 1.00', { size: 10, mono: true });
  body(488, 120, '   naive 0.50, off by 0.50', { size: 10, color: BAD });
  body(488, 144, 'B: 0.25 + 0.25 - 2(0.25) = 0.00', { size: 10, mono: true });
  body(488, 164, '   naive 0.50, off by 0.50', { size: 10, color: BAD });
  body(488, 188, 'C: 0.25 + 0.25 + 2(0.25) = 1.00', { size: 10, mono: true });
  body(488, 208, '   Y = X + 2 shifts, never spreads', { size: 10, color: DIM });
  rule(488, 230, 860, 230);
  body(488, 244, 'For a difference the sign flips:', { size: 10 });
  body(488, 264, 'Var(X - Y) = VarX + VarY - 2Cov', { size: 10, mono: true });
  body(488, 284, 'A: 0.25 + 0.25 - 0.50 = 0.00', { size: 10, mono: true });
  if (p > 0.62) {
    card(488, 308, 372, 80, { fill: ACCDIM, stroke: ACC });
    body(504, 322, 'Var(X + Y) = Var X + Var Y', { size: 10, bold: true, color: ACC });
    body(504, 342, 'holds when Cov is zero — independent,', { size: 10 });
    body(504, 360, 'or merely uncorrelated. Never by default.', { size: 10 });
  }
}

/* ---------- scene 6: uncorrelated but dependent ---------- */
function sceneUncorr(t, sc) {
  var p = prog(t, sc);
  heading('Uncorrelated is not independent');
  subline('X uniform on minus one, zero and one; Y is X squared. Y is a function of X.');

  card(24, 62, 436, 372);
  label(40, 78, 'THE THREE OUTCOMES');
  var tx = 56, ty = 104, cw = 84, ch = 28;
  var heads = ['x', 'y = x^2', 'x y', 'p'];
  for (var c = 0; c < 4; c++) {
    if (P) P.rect(tx + c * cw, ty, cw, ch, { fill: SURF2, stroke: BORDER, sw: 1 });
    txt(tx + c * cw + cw / 2, ty + 9, heads[c], { size: 9, align: 'center', color: FAINT });
  }
  var vals = [[-1, 1, -1], [0, 0, 0], [1, 1, 1]];
  for (var r = 0; r < 3; r++) {
    for (var c2 = 0; c2 < 4; c2++) {
      if (P) P.rect(tx + c2 * cw, ty + (r + 1) * ch, cw, ch, { fill: SURF, stroke: BORDER, sw: 1 });
    }
    txt(tx + cw / 2, ty + (r + 1) * ch + 9, String(vals[r][0]), { size: 10, mono: true, align: 'center' });
    txt(tx + 1.5 * cw, ty + (r + 1) * ch + 9, String(vals[r][1]), { size: 10, mono: true, align: 'center' });
    txt(tx + 2.5 * cw, ty + (r + 1) * ch + 9, String(vals[r][2]), { size: 10, mono: true, align: 'center' });
    txt(tx + 3.5 * cw, ty + (r + 1) * ch + 9, '1/3', { size: 10, mono: true, align: 'center' });
  }
  if (p > 0.3) {
    body(40, 236, 'E[X] = 0      E[Y] = 2/3', { size: 10, mono: true });
    body(40, 256, 'E[XY] = E[X^3] = 0', { size: 10, mono: true });
    body(40, 276, 'Cov = 0 - 0 = 0', { size: 10, mono: true, bold: true });
    body(40, 298, 'The products +1, 0, -1 cancel exactly.', { size: 10, color: DIM });
  }
  if (p > 0.65) {
    card(40, 322, 404, 94, { fill: ACCDIM, stroke: ACC });
    body(56, 336, 'Var(X) = 2/3      Var(Y) = 2/9', { size: 10, mono: true });
    body(56, 356, 'Var(X + Y) = 8/9, exactly the sum,', { size: 10 });
    body(56, 374, 'because the covariance is zero.', { size: 10, bold: true, color: ACC });
    body(56, 394, 'Uncorrelated is enough for the identity.', { size: 9, color: DIM });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'THE TEST FOR INDEPENDENCE');
  body(488, 100, 'P(X=1, Y=1) = 1/3', { size: 10, mono: true });
  body(488, 120, 'P(X=1)P(Y=1) = (1/3)(2/3) = 2/9', { size: 10, mono: true });
  body(488, 144, '1/3 is not 2/9, so they are dependent.', { size: 10, bold: true, color: BAD });
  rule(488, 166, 860, 166);
  body(488, 180, 'Knowing X fixes Y completely:', { size: 10 });
  body(488, 198, 'X = 1 forces Y = 1.', { size: 10, color: DIM });
  body(488, 222, 'Covariance measures only the linear', { size: 10 });
  body(488, 240, 'part of a relationship. Here there is', { size: 10 });
  body(488, 258, 'none, and the dependence is total.', { size: 10 });
  rule(488, 280, 860, 280);
  body(488, 294, 'rho = 0, and the square is a perfect', { size: 10 });
  body(488, 312, 'curve, not a line.', { size: 10 });
  if (p > 0.72) {
    card(488, 334, 372, 56, { fill: BADDIM, stroke: BAD });
    body(504, 348, 'Zero covariance forbids a line,', { size: 10 });
    body(504, 368, 'not a relationship.', { size: 10, bold: true, color: BAD });
  }
}

/* ---------- scene 7: many variables ---------- */
function sceneMany(t, sc) {
  var p = prog(t, sc);
  heading('Many variables: the diagonal and the pairs');
  subline('Square the sum and every ordered pair of variables contributes one covariance.');

  card(24, 62, 436, 372);
  label(40, 78, 'THE IDENTITY FOR n VARIABLES');
  body(40, 100, 'Var(sum Xi) = sum Var(Xi)', { size: 10, mono: true });
  body(40, 120, '            + 2 sum Cov(Xi, Xj)', { size: 10, mono: true });
  body(40, 140, '              over the pairs i < j', { size: 9, mono: true, color: DIM });
  rule(40, 162, 444, 162);
  label(40, 176, 'HOW MANY TERMS');
  var rows = [[2, 1, 4], [3, 3, 9], [4, 6, 16], [5, 10, 25]];
  body(40, 196, 'n      pairs n(n-1)/2      all ordered terms', { size: 9, mono: true, color: FAINT });
  for (var i = 0; i < rows.length; i++) {
    if (p < 0.2 + i * 0.08) break;
    body(40, 216 + i * 20, rows[i][0] + '            ' + rows[i][1] + '                ' + rows[i][2], { size: 10, mono: true });
  }
  if (p > 0.55) {
    body(40, 312, 'The diagonal is the n variances; the', { size: 10 });
    body(40, 330, 'off-diagonal entries are counted twice,', { size: 10 });
    body(40, 348, 'once as Cov(Xi, Xj) and once as Cov(Xj, Xi).', { size: 10 });
  }
  if (p > 0.78) {
    card(40, 368, 404, 48, { fill: ACCDIM, stroke: ACC });
    body(56, 380, 'Three variables: 3 variances, 3 pairs, 6 terms', { size: 10, color: ACC });
    body(56, 398, 'in total when every pair is written out.', { size: 9, color: DIM });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'FOUR COPIES, VARIANCE 1.25 EACH');
  body(488, 100, 'independent:  4 x 1.25 = 5.00', { size: 10, mono: true });
  body(488, 120, 'perfectly correlated: 16 x 1.25 = 20.00', { size: 10, mono: true });
  rule(488, 142, 860, 142);
  body(488, 156, 'Independent copies: Var(sum) = n s^2,', { size: 10 });
  body(488, 174, 'so the mean of n has s^2/n, and the', { size: 10 });
  body(488, 192, 'standard error falls like root n.', { size: 10 });
  if (p > 0.42) {
    body(488, 220, 'Correlated copies: Var(sum) = n^2 s^2,', { size: 10 });
    body(488, 238, 'so averaging removes nothing at all.', { size: 10, bold: true, color: BAD });
    body(488, 258, 'sd(sum) grows like n, not like root n.', { size: 10, color: DIM });
  }
  if (p > 0.66) {
    rule(488, 280, 860, 280);
    label(488, 294, 'PAIRWISE ZERO COVARIANCE IS ENOUGH');
    body(488, 314, 'Two fair bits and their exclusive or:', { size: 10 });
    body(488, 332, 'all three covariances are 0, and', { size: 10 });
    body(488, 350, 'Var(sum) = 3/4 by direct enumeration.', { size: 10, mono: true });
    body(488, 372, 'Yet P(all zero) = 1/4, not 1/8.', { size: 10, color: BAD });
    body(488, 392, 'Pairwise independent, not mutually so.', { size: 9, color: DIM });
  }
}

/* ---------- scene 8: Markov ---------- */
function sceneMarkov(t, sc) {
  var p = prog(t, sc);
  heading('Markov: one mean, one bound');
  subline('For a non-negative X with finite mean, P(X at least a) is at most E[X] divided by a.');

  card(24, 62, 436, 372);
  label(40, 78, 'THE VARIABLE: 0 NINE TIMES IN TEN, 10 THE OTHER TIME');
  var base = 250;
  bar(96, base, 64, 90, { fill: SURF2, stroke: BORDER });
  bar(300, base, 64, 10, { fill: BADDIM, stroke: BAD });
  txt(128, base - 90 - 16, 'p = 0.9', { size: 9, align: 'center', color: DIM });
  txt(332, base - 10 - 16, 'p = 0.1', { size: 9, align: 'center', color: BAD });
  txt(128, base + 8, '0', { size: 10, align: 'center', bold: true });
  txt(332, base + 8, '10', { size: 10, align: 'center', bold: true });
  rule(72, base, 440, base);
  dash(296, 130, 296, 250, BAD);
  if (p > 0.25) {
    body(40, 276, 'E[X] = 0(0.9) + 10(0.1) = 1.00', { size: 10, mono: true });
    body(40, 298, 'The tail to the right of the dashed line', { size: 10 });
    body(40, 316, 'is the region the inequality bounds.', { size: 10, color: DIM });
  }
  if (p > 0.55) {
    rule(40, 340, 444, 340);
    body(40, 354, 'Proof in one line: the part of the mean', { size: 10 });
    body(40, 372, 'above a is already at least a times the', { size: 10 });
    body(40, 390, 'probability of that part.', { size: 10, bold: true });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'THE SAME VARIABLE AT THREE THRESHOLDS');
  body(488, 100, 'a = 10   bound 0.100   true 0.100', { size: 10, mono: true });
  body(488, 120, 'a =  5   bound 0.200   true 0.100', { size: 10, mono: true });
  body(488, 140, 'a = 0.5  bound 2.000   true 0.100', { size: 10, mono: true });
  body(488, 162, 'The first is attained, the second loose,', { size: 10 });
  body(488, 180, 'the third says nothing at all.', { size: 10 });
  rule(488, 202, 860, 202);
  label(488, 216, 'WHY THE FIRST IS EXACT');
  body(488, 236, 'Mass p at a and 1-p at 0 has mean pa,', { size: 10 });
  body(488, 254, 'so the bound is p exactly. No smaller', { size: 10 });
  body(488, 272, 'bound can hold for every such variable.', { size: 10 });
  if (p > 0.68) {
    card(488, 300, 372, 88, { fill: BADDIM, stroke: BAD });
    body(504, 314, 'A bound above 1 is vacuous: every', { size: 10 });
    body(504, 332, 'probability satisfies it.', { size: 10 });
    body(504, 356, 'Markov needs X at least 0.', { size: 10, bold: true, color: BAD });
    body(504, 374, 'A negative variable has no such bound.', { size: 9, color: DIM });
  }
}

/* ---------- scene 9: Chebyshev ---------- */
function sceneCheb(t, sc) {
  var p = prog(t, sc);
  heading('Chebyshev: one variance, every distribution');
  subline('Apply Markov to the squared deviation and the tail becomes 1 over k squared.');

  card(24, 62, 436, 372);
  label(40, 78, 'A DISTRIBUTION THAT ATTAINS THE BOUND, k = 2');
  var base = 240;
  var bars = [[96, 1 / 8, BADDIM, BAD], [200, 3 / 4, SURF2, BORDER], [304, 1 / 8, BADDIM, BAD]];
  for (var i = 0; i < bars.length; i++) {
    var h = Math.round(bars[i][1] * 160);
    bar(bars[i][0], base, 64, h, { fill: bars[i][2], stroke: bars[i][3] });
  }
  txt(128, base - 20 - 16, '1/8', { size: 9, align: 'center', color: BAD });
  txt(232, base - 120 - 16, '3/4', { size: 9, align: 'center', color: DIM });
  txt(336, base - 20 - 16, '1/8', { size: 9, align: 'center', color: BAD });
  txt(128, base + 8, '-2', { size: 10, align: 'center', bold: true });
  txt(232, base + 8, '0', { size: 10, align: 'center', bold: true });
  txt(336, base + 8, '+2', { size: 10, align: 'center', bold: true });
  rule(72, base, 440, base);
  if (p > 0.3) {
    body(40, 268, 'mean 0, variance 1: mass 1/(2k^2) at each end.', { size: 10 });
    body(40, 288, 'P(|X| at least 2) = 1/8 + 1/8 = 0.250', { size: 10, mono: true });
    body(40, 308, 'and 1/k^2 = 0.250. The bound is met.', { size: 10, bold: true });
  }
  if (p > 0.6) {
    rule(40, 330, 444, 330);
    body(40, 344, 'So no better bound exists that uses only', { size: 10 });
    body(40, 362, 'the mean and the variance. That is what', { size: 10 });
    body(40, 380, '"cannot be improved" means here.', { size: 10, bold: true });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'BOUND AGAINST TRUTH, k = 2');
  body(488, 100, 'tight family   0.250   0.250', { size: 10, mono: true });
  body(488, 120, 'fair die       0.250   0.000', { size: 10, mono: true });
  body(488, 140, '10 coin flips  0.250   0.021', { size: 10, mono: true });
  body(488, 162, 'column 2: the bound. column 3: the truth.', { size: 9, color: DIM });
  rule(488, 184, 860, 184);
  label(488, 198, 'WHY THE DIE IS ZERO');
  body(488, 218, 'sd = sqrt(35/12) = 1.708, so two sd is', { size: 10 });
  body(488, 236, '3.416, and no face is that far from 3.5.', { size: 10 });
  body(488, 258, 'A bounded variable can never reach it.', { size: 10, color: DIM });
  rule(488, 280, 860, 280);
  body(488, 294, 'The three numbers worth keeping:', { size: 10 });
  body(488, 314, 'k = 2 gives 1/4, k = 3 gives 1/9,', { size: 10, mono: true });
  body(488, 332, 'k = 4 gives 1/16.', { size: 10, mono: true });
  if (p > 0.7) {
    card(488, 350, 372, 52, { fill: BADDIM, stroke: BAD });
    body(504, 364, 'Below k = 1 the bound exceeds 1, and', { size: 10 });
    body(504, 382, 'a heavy tail may have no variance at all.', { size: 10, bold: true, color: BAD });
  }
}

/* ---------- scene 10: what the bounds buy ---------- */
function sceneUse(t, sc) {
  var p = prog(t, sc);
  heading('What the bounds buy, and the four-step procedure');
  subline('Averaging divides the variance by n, and that turns a bound into a sample size.');

  card(24, 62, 436, 372);
  label(40, 78, 'FROM A BOUND TO A SAMPLE SIZE');
  body(40, 100, 'Var(mean) = s^2 / n', { size: 10, mono: true });
  body(40, 122, 'P(|mean - mu| at least eps) at most s^2/(n eps^2)', { size: 10, mono: true });
  body(40, 144, 'Set that at most delta and solve for n:', { size: 10 });
  body(40, 166, 'n at least s^2 / (eps^2 delta)', { size: 10, mono: true, bold: true });
  rule(40, 188, 444, 188);
  if (p > 0.2) {
    body(40, 202, 's = 2,  eps = 0.5,  delta = 0.05', { size: 10, mono: true });
    body(40, 224, 'n at least 4 / (0.25 x 0.05) = ' + V.needN, { size: 10, mono: true, bold: true });
  }
  if (p > 0.45) {
    body(40, 250, 'A normal quantile would ask for ' + V.normalN + '.', { size: 10 });
    body(40, 268, 'Chebyshev costs about five times as many', { size: 10 });
    body(40, 286, 'draws, and assumes nothing about the shape.', { size: 10 });
    body(40, 308, 'That is the trade: a weaker guarantee,', { size: 10 });
    body(40, 326, 'bought with a stronger assumption only', { size: 10 });
    body(40, 344, 'about the variance.', { size: 10 });
  }
  if (p > 0.78) {
    card(40, 366, 404, 50, { fill: ACCDIM, stroke: ACC });
    body(56, 378, 'Var(2X) = 4 Var(X), and sd(2X) = 2 sd(X).', { size: 10, color: ACC });
    body(56, 396, 'Var(X + c) = Var(X): a shift changes nothing.', { size: 9, color: DIM });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'THE FOUR STEPS');
  body(488, 100, '1  what varies: a variable or a sum?', { size: 10 });
  body(488, 122, '2  is the cross term zero, or not?', { size: 10 });
  body(488, 144, '3  write all the terms before adding', { size: 10 });
  body(488, 166, '4  square the scale, not the shift', { size: 10 });
  rule(488, 188, 860, 188);
  label(488, 202, 'THE THREE TRAPS, IN ORDER OF COST');
  body(488, 222, 'adding variances of dependent parts', { size: 10 });
  body(488, 242, 'reading Cov = 0 as independence', { size: 10 });
  body(488, 262, 'quoting a bound above 1 as a result', { size: 10 });
  rule(488, 284, 860, 284);
  body(488, 298, 'The identity is one line:', { size: 10 });
  body(488, 318, 'Var(X + Y) = VarX + VarY + 2Cov', { size: 10, mono: true });
  body(488, 340, 'Every other formula on this page is a', { size: 10 });
  body(488, 358, 'special case of it.', { size: 10 });
  if (p > 0.8) {
    card(488, 376, 372, 28, { fill: ACCDIM, stroke: ACC });
    body(504, 383, 'Computed, then checked, then drawn.', { size: 9, color: ACC });
  }
}

/* ---------- dispatch ---------- */
var SCENES = {
  spread: sceneSpread,
  joint: sceneJoint,
  cov: sceneCov,
  sumvar: sceneSum,
  dependent: sceneDependent,
  uncorr: sceneUncorr,
  many: sceneMany,
  markov: sceneMarkov,
  cheb: sceneCheb,
  use: sceneUse
};

function drawFrame(P_) {
  if (!P_) return;
  P = P_;
  P.clear();
  var t = K.state.elapsed;
  var i = K.sceneAt(t);
  var sc = K.state.scenes[i];
  if (!sc) return;
  var fn = SCENES[sc.id] || SCENES.spread;
  fn(t, sc);
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
    } catch (e) { console.error('p5 failed', e); ok = false; }
  }

  if (!ok) {
    var drew = false;
    try {
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      holder.appendChild(cv);
      var ctx2d = cv.getContext && cv.getContext('2d');
      if (ctx2d) { P = PR.makePainter2D(ctx2d, W, H); drawFrame(P); drew = true; }
    } catch (e) { console.error('canvas fallback failed', e); }
    if (!drew && fallback) fallback.classList.add('show');
  }

  if (K && K.init) K.init({ timeline: window.LESSON_TIMELINE, draw: function () { if (P) drawFrame(P); } });

  fillChecks();

  window.__drawAt = function (t) { K.state.elapsed = t; if (P) drawFrame(P); };

  var badc = CHECKS.filter(function (c) { return !c.pass; });
  if (badc.length) console.warn('Model validation did not fully pass:', badc);
}

window.__MODEL = { V: V, CHECKS: CHECKS };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
